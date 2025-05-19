import logging
from fastapi import APIRouter, HTTPException, Header, Query
from fastapi.responses import JSONResponse
from messages.producer import publish_event
from schemas.auth import LoginRequest, RegistrationRequest, RefreshTokenRequest
from core.config import settings
from core.keycloak import get_admin_token
from core.celery_app import celery
from services.auth_service import set_tokens_cookies
from services.keycloak_service import KeycloakService
from uuid import uuid4

router = APIRouter()
token_store = {}
logger = logging.getLogger(settings.service_name)

keycloak_service = KeycloakService()

@router.post("/login")
async def login(login_request: LoginRequest):
    logger.debug("Login attempt for user: %s", login_request.username)
    try:
        token_data = await keycloak_service.login(login_request.username, login_request.password)
    except Exception as e:
        logger.error("Login failed: %s", str(e))
        raise HTTPException(status_code=401, detail="Invalid credentials or error during login")

    tokens = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "id_token": token_data.get("id_token"),
    }

    resp = JSONResponse(content=token_data)
    set_tokens_cookies(resp, tokens)
    logger.info("Login successful for user: %s", login_request.username)
    return resp

@router.post("/register")
async def register(reg_req: RegistrationRequest):
    logger.debug("Registration attempt for user: %s", reg_req.username)

    admin_token = await get_admin_token()
    user_data = {
        "username": reg_req.username,
        "email": reg_req.email,
        "firstName": reg_req.firstName,
        "lastName": reg_req.lastName,
        "emailVerified": False,
        "enabled": True,
        "credentials": [{"type": "password", "value": reg_req.password, "temporary": False}],
    }

    try:
        keycloak_uuid = await keycloak_service.register_user(admin_token, user_data)
    except Exception as e:
        logger.error("Registration failed: %s", str(e))
        raise HTTPException(status_code=400, detail="User registration failed")

    logger.info("User registered successfully: %s", reg_req.username)

    await publish_event("user.created", {"keycloak_uuid": keycloak_uuid})

    verification_token = str(uuid4())
    token_store[verification_token] = reg_req.username
    logger.info(
        f"Sending task for sending verification email for user {reg_req.username} ({reg_req.email})\nToken: {verification_token}"
    )

    celery.send_task(
        "mail_service.tasks.send_verification_email",
        args=[reg_req.firstName, reg_req.lastName, reg_req.email, verification_token],
    )

    return {"detail": "User registered successfully"}

@router.get("/verify-email")
async def verify_email(token: str = Query(...)):
    logger.debug(f"Verifying email with token: {token}")

    if token not in token_store:
        logger.warning(f"Invalid or expired token: {token}")
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    username = token_store.pop(token)
    logger.info(f"Found user '{username}' for token: {token}")

    admin_token = await get_admin_token()
    try:
        await keycloak_service.verify_email(admin_token, username)
    except Exception as e:
        logger.error("Email verification failed: %s", str(e))
        raise HTTPException(status_code=500, detail="Email verification failed")

    logger.info(f"Email successfully verified for user: {username}")
    return {"detail": f"Email verified for user: {username}"}

@router.get("/userinfo")
async def userinfo(authorization: str = Header(...)):
    logger.debug("Userinfo request received")

    token = authorization[7:] if authorization.lower().startswith("bearer ") else authorization
    try:
        user_info = await keycloak_service.get_userinfo(token)
    except Exception as e:
        logger.error("Failed to retrieve userinfo: %s", str(e))
        raise HTTPException(status_code=401, detail="Failed to retrieve user info")

    return user_info

@router.post("/refresh")
async def refresh_token(refresh_req: RefreshTokenRequest):
    logger.debug("Refresh token request received")

    try:
        token_data = await keycloak_service.refresh_token(refresh_req.refresh_token)
    except Exception as e:
        logger.error("Refresh token failed: %s", str(e))
        raise HTTPException(status_code=401, detail="Failed to refresh token")

    tokens = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "id_token": token_data.get("id_token"),
    }

    resp = JSONResponse(content=token_data)
    set_tokens_cookies(resp, tokens)
    return resp
