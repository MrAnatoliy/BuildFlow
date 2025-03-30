import logging
from fastapi import FastAPI, HTTPException, Header, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("auth_service")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://26.190.118.118",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://buildflow.api",
        # other origins
    ],
    allow_credentials=True,
    allow_methods=["*"],  # разрешить все методы
    allow_headers=["*"],  # разрешить все заголовки
)

# Configuration for Keycloak
KEYCLOAK_BASE_URL = "http://keycloak:8080"
REALM = "buildflow-realm"
CLIENT_ID = "backend_client"
CLIENT_SECRET = "GlDkVI6WXTOKARMuf6t1l28ydj4QaQKd"

# Admin client configuration for user registration
ADMIN_CLIENT_ID = "admin_api_client"
ADMIN_CLIENT_SECRET = "y9uhXHRRsiJvcy4KWkYUX8M3tlNyqEK1"

# --- Models ---

class LoginRequest(BaseModel):
    username: str
    password: str

class RegistrationRequest(BaseModel):
    username: str
    email: str
    firstName: str
    lastName: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# --- Endpoints ---

@app.post("/auth/login")
async def login(login_request: LoginRequest):
    """
    Logs in a user by directly exchanging their credentials for tokens.
    Uses the password grant type of the OIDC API.
    """
    logger.debug("Login attempt for user: %s", login_request.username)
    
    token_url = f"{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/token"
    data = {
        "grant_type": "password",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "username": login_request.username,
        "password": login_request.password,
        "scope": "openid email profile",
    }
    
    async with httpx.AsyncClient() as client:
        logger.debug("Sending POST request to Keycloak token endpoint: %s", token_url)
        response = await client.post(token_url, data=data)
        logger.debug("Keycloak token response status: %s, body: %s", response.status_code, response.text)
    
    if response.status_code != 200:
        logger.error("Login failed for user %s: %s", login_request.username, response.text)
        raise HTTPException(status_code=response.status_code, detail="Invalid credentials or error during token retrieval")
    
    logger.info("Login successful for user: %s", login_request.username)
    token_data = response.json()
    tokens = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "id_token": token_data.get("id_token")
    }
    
    # Create a FastAPI JSONResponse so we can modify cookies
    resp = JSONResponse(content=token_data)
    set_tokens_cookies(resp, tokens)
    logger.info("Login successful for user: %s", login_request.username)
    return resp

@app.post("/auth/register")
async def register(reg_req: RegistrationRequest):
    """
    Registers a new user in Keycloak by calling the admin API.
    Requires an admin token.
    """
    logger.debug("Registration attempt for user: %s", reg_req.username)
    admin_token = await get_admin_token()

    create_user_url = f"{KEYCLOAK_BASE_URL}/admin/realms/{REALM}/users"
    # Prepare user data payload according to Keycloak's API schema.
    user_data = {
        "username": reg_req.username,
        "email": reg_req.email,
        "firstName": reg_req.firstName,
        "lastName": reg_req.lastName,
        "emailVerified": False,
        "enabled": True,
        "credentials": [{
            "type": "password",
            "value": reg_req.password,
            "temporary": False
        }]
    }
    logger.debug("User registration payload: %s", user_data)
    
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        logger.debug("Sending POST request to Keycloak admin endpoint: %s", create_user_url)
        response = await client.post(create_user_url, json=user_data, headers=headers)
        logger.debug("Keycloak registration response status: %s, body: %s", response.status_code, response.text)
    
    if response.status_code not in [201, 409]:
        logger.error("User registration failed for user %s: %s", reg_req.username, response.text)
        raise HTTPException(status_code=response.status_code, detail="User registration failed")
    
    logger.info("User registered successfully: %s", reg_req.username)
    return {"detail": "User registered successfully"}

@app.get("/auth/userinfo")
async def userinfo(authorization: str = Header(...)):
    """
    Retrieves user information from Keycloak using the OIDC userinfo endpoint.
    The access token must be passed in the Authorization header as 'Bearer <token>'.
    """
    logger.debug("Userinfo request received with Authorization header: %s", authorization)
    # Remove "Bearer " prefix if present
    if authorization.lower().startswith("bearer "):
        token = authorization[7:]
    else:
        token = authorization

    userinfo_url = f"{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/userinfo"
    async with httpx.AsyncClient() as client:
        logger.debug("Sending GET request to Keycloak userinfo endpoint: %s", userinfo_url)
        response = await client.get(userinfo_url, headers={"Authorization": f"Bearer {token}"})
        logger.debug("Keycloak userinfo response status: %s, body: %s", response.status_code, response.text)

    if response.status_code != 200:
        logger.error("Failed to retrieve userinfo: %s", response.text)
        raise HTTPException(status_code=response.status_code, detail="Failed to retrieve userinfo")
    
    return response.json()

@app.post("/auth/refresh")
async def refresh_token(refresh_req: RefreshTokenRequest):
    """
    Refreshes an access token using the provided refresh token.
    """
    logger.debug("Refresh token request received with token: %s", refresh_req.refresh_token)
    token_url = f"{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/token"
    data = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_req.refresh_token,
        "scope": "openid email profile",
    }
    
    async with httpx.AsyncClient() as client:
        logger.debug("Sending POST request to Keycloak token endpoint for refresh: %s", token_url)
        response = await client.post(token_url, data=data)
        logger.debug("Keycloak refresh token response status: %s, body: %s", response.status_code, response.text)
    
    if response.status_code != 200:
        logger.error("Refresh token request failed: %s", response.text)
        raise HTTPException(status_code=response.status_code, detail="Failed to refresh token")
    
    token_data = response.json()
    tokens = {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "id_token": token_data.get("id_token")
    }

    # Create a FastAPI JSONResponse so we can set cookies
    resp = JSONResponse(content=token_data)
    set_tokens_cookies(resp, tokens)
    return resp

# --- Helper function ---

async def get_admin_token():
    """
    Retrieves an admin token using the client credentials grant.
    Ensure the admin-cli (or equivalent) client is properly configured in Keycloak.
    """
    token_url = f"{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": ADMIN_CLIENT_ID,
        "client_secret": ADMIN_CLIENT_SECRET,
    }
    
    logger.debug("Requesting admin token from: %s", token_url)
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        logger.debug("Admin token response status: %s, body: %s", response.status_code, response.text)
    
    if response.status_code != 200:
        logger.error("Failed to retrieve admin token: %s", response.text)
        raise HTTPException(status_code=response.status_code, detail="Failed to retrieve admin token")
    
    token = response.json().get("access_token")
    if not token:
        logger.error("Admin token not found in response: %s", response.text)
        raise HTTPException(status_code=500, detail="Admin token not found in response")
    
    logger.info("Admin token retrieved successfully")
    return token

def set_tokens_cookies(response: Response, tokens: dict):
    """Sets access and refresh tokens as HTTP-only cookies"""
    logger.info(f'Recived tokens for the cookie : {tokens.keys()}')
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=True,  # В production должно быть True
        samesite="none",
        max_age=tokens.get("expires_in", 180)  # 3 минуты по умолчанию
    )
    
    if "refresh_token" in tokens:
        response.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=True,
            secure=True,
            samesite="none",
            max_age=12 * 60 * 60  # 12 часов
        )

    if "id_token" in tokens:
        response.set_cookie(
            key="id_token",
            value=tokens["id_token"],
            httponly=True,
            secure=True,
            samesite="none",
            max_age=12 * 60 * 60
        )