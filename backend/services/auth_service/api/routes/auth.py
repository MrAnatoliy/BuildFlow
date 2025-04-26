import logging
from fastapi import APIRouter, HTTPException, Header, Query
from fastapi.responses import JSONResponse
from messages.producer import publish_event
from schemas.auth import LoginRequest, RegistrationRequest, RefreshTokenRequest
from core.config import settings
from core.keycloak import get_admin_token
from core.celery_app import celery
from services.auth_service import set_tokens_cookies
import httpx
from uuid import uuid4

router = APIRouter()

token_store = {}

logger = logging.getLogger(settings.service_name)

# testing black lint step


@router.post("/login")
async def login(login_request: LoginRequest):
    """
    Logs in a user by directly exchanging their credentials for tokens.
    Uses the password grant type of the OIDC API.
    """
    logger.debug("Login attempt for user: %s", login_request.username)

    token_url = f"{settings.keycloak_base_url}/realms/{settings.realm}/protocol/openid-connect/token"
    data = {
        "grant_type": "password",
        "client_id": settings.client_id,
        "client_secret": settings.client_secret,
        "username": login_request.username,
        "password": login_request.password,
        "scope": "openid email profile",
    }

    async with httpx.AsyncClient() as client:
        logger.debug("Sending POST request to Keycloak token endpoint: %s", token_url)
        response = await client.post(token_url, data=data)
        logger.debug(
            "Keycloak token response status: %s, body: %s",
            response.status_code,
            response.text,
        )

    if response.status_code != 200:
        logger.error(
            "Login failed for user %s: %s", login_request.username, response.text
        )
        raise HTTPException(
            status_code=response.status_code,
            detail="Invalid credentials or error during token retrieval",
        )

    logger.info("Login successful for user: %s", login_request.username)
    token_data = response.json()
    tokens = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "id_token": token_data.get("id_token"),
    }

    # Create a FastAPI JSONResponse so we can modify cookies
    resp = JSONResponse(content=token_data)
    set_tokens_cookies(resp, tokens)
    logger.info("Login successful for user: %s", login_request.username)
    return resp


@router.post("/register")
async def register(reg_req: RegistrationRequest):
    """
    Registers a new user in Keycloak by calling the admin API.
    Requires an admin token.
    """
    logger.debug("Registration attempt for user: %s", reg_req.username)
    admin_token = await get_admin_token()

    create_user_url = (
        f"{settings.keycloak_base_url}/admin/realms/{settings.realm}/users"
    )
    # Prepare user data payload according to Keycloak's API schema.
    user_data = {
        "username": reg_req.username,
        "email": reg_req.email,
        "firstName": reg_req.firstName,
        "lastName": reg_req.lastName,
        "emailVerified": False,
        "enabled": True,
        "credentials": [
            {"type": "password", "value": reg_req.password, "temporary": False}
        ],
    }
    logger.debug("User registration payload: %s", user_data)

    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json",
        }
        logger.debug(
            "Sending POST request to Keycloak admin endpoint: %s", create_user_url
        )
        response = await client.post(create_user_url, json=user_data, headers=headers)
        logger.debug(
            "Keycloak registration response status: %s, body: %s",
            response.status_code,
            response.text,
        )

    if response.status_code == 201:
        # Extract user ID from the Location header
        location_header = response.headers.get("Location")
        keycloak_uuid = (
            location_header.rstrip("/").split("/")[-1] if location_header else None
        )
    elif response.status_code == 409:
        # User already exists; you may want to fetch the UUID by username here if needed
        raise HTTPException(status_code=409, detail="User already exist")
    else:
        logger.error(
            "User registration failed for user %s: %s", reg_req.username, response.text
        )
        raise HTTPException(
            status_code=response.status_code, detail="User registration failed"
        )

    logger.info("User registered successfully: %s", reg_req.username)

    logger.info(f"Creating new user with user_service")
    await publish_event("user.created", {"keycloak_uuid": keycloak_uuid})

    verification_token = str(uuid4())
    token_store[verification_token] = reg_req.username
    logger.info(
        f"Sending task for send verification eamil for user {reg_req.username} {reg_req.firstName} {reg_req.lastName}\ntoken : {verification_token}"
    )

    celery.send_task(
        "mail_service.tasks.send_verification_email",
        args=[reg_req.firstName, reg_req.lastName, reg_req.email, verification_token],
    )

    return {"detail": "User registered successfully"}


@router.get("/verify-email")
async def verify_email(token: str = Query(...)):
    """
    Verifies a user's email using a verification token.
    """
    logger.debug(f"Verifying email with token: {token}")

    if token not in token_store:
        logger.warning(f"Invalid or expired token: {token}")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    username = token_store.pop(token)
    logger.info(f"Found user '{username}' for token: {token}")

    admin_token = await get_admin_token()

    # First, find the user ID in Keycloak
    user_search_url = (
        f"{settings.keycloak_base_url}/admin/realms/{settings.realm}/users"
    )
    async with httpx.AsyncClient() as client:
        response = await client.get(
            user_search_url,
            headers={"Authorization": f"Bearer {admin_token}"},
            params={"username": username},
        )

        if response.status_code != 200 or not response.json():
            logger.error(f"User not found or error searching for user: {username}")
            raise HTTPException(status_code=404, detail="User not found")

        user_id = response.json()[0]["id"]

        # Now update the user's emailVerified field
        user_url = f"{settings.keycloak_base_url}/admin/realms/{settings.realm}/users/{user_id}"
        response = await client.put(
            user_url,
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json",
            },
            json={"emailVerified": True},
        )

        if response.status_code != 204:
            logger.error(f"Failed to verify email for user {username}: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to verify email")

    logger.info(f"Email successfully verified for user: {username}")
    return {"detail": f"Email verified for user: {username}"}


@router.get("/userinfo")
async def userinfo(authorization: str = Header(...)):
    """
    Retrieves user information from Keycloak using the OIDC userinfo endpoint.
    The access token must be passed in the Authorization header as 'Bearer <token>'.
    """
    logger.debug(
        "Userinfo request received with Authorization header: %s", authorization
    )
    # Remove "Bearer " prefix if present
    if authorization.lower().startswith("bearer "):
        token = authorization[7:]
    else:
        token = authorization

    userinfo_url = f"{settings.keycloak_base_url}/realms/{settings.realm}/protocol/openid-connect/userinfo"
    async with httpx.AsyncClient() as client:
        logger.debug(
            "Sending GET request to Keycloak userinfo endpoint: %s", userinfo_url
        )
        response = await client.get(
            userinfo_url, headers={"Authorization": f"Bearer {token}"}
        )
        logger.debug(
            "Keycloak userinfo response status: %s, body: %s",
            response.status_code,
            response.text,
        )

    if response.status_code != 200:
        logger.error("Failed to retrieve userinfo: %s", response.text)
        raise HTTPException(
            status_code=response.status_code, detail="Failed to retrieve userinfo"
        )

    return response.json()


@router.post("/refresh")
async def refresh_token(refresh_req: RefreshTokenRequest):
    """
    Refreshes an access token using the provided refresh token.
    """
    logger.debug(
        "Refresh token request received with token: %s", refresh_req.refresh_token
    )
    token_url = f"{settings.keycloak_base_url}/realms/{settings.realm}/protocol/openid-connect/token"
    data = {
        "grant_type": "refresh_token",
        "client_id": settings.client_id,
        "client_secret": settings.client_secret,
        "refresh_token": refresh_req.refresh_token,
        "scope": "openid email profile",
    }

    async with httpx.AsyncClient() as client:
        logger.debug(
            "Sending POST request to Keycloak token endpoint for refresh: %s", token_url
        )
        response = await client.post(token_url, data=data)
        logger.debug(
            "Keycloak refresh token response status: %s, body: %s",
            response.status_code,
            response.text,
        )

    if response.status_code != 200:
        logger.error("Refresh token request failed: %s", response.text)
        raise HTTPException(
            status_code=response.status_code, detail="Failed to refresh token"
        )

    token_data = response.json()
    tokens = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "id_token": token_data.get("id_token"),
    }

    # Create a FastAPI JSONResponse so we can set cookies
    resp = JSONResponse(content=token_data)
    set_tokens_cookies(resp, tokens)
    return resp
