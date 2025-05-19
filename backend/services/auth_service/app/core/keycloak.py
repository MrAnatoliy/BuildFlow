import httpx
from fastapi import HTTPException
from core.config import settings
import logging

logger = logging.getLogger(settings.service_name)


async def get_admin_token():
    """
    Retrieves an admin token using the client credentials grant.
    Ensure the admin-cli (or equivalent) client is properly configured in Keycloak.
    """
    token_url = f"{settings.keycloak_base_url}/realms/{settings.realm}/protocol/openid-connect/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": settings.admin_client_id,
        "client_secret": settings.admin_client_secret,
    }

    logger.debug("Requesting admin token from: %s", token_url)
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        logger.debug(
            "Admin token response status: %s, body: %s",
            response.status_code,
            response.text,
        )

    if response.status_code != 200:
        logger.error("Failed to retrieve admin token: %s", response.text)
        raise HTTPException(
            status_code=response.status_code, detail="Failed to retrieve admin token"
        )

    token = response.json().get("access_token")
    if not token:
        logger.error("Admin token not found in response: %s", response.text)
        raise HTTPException(status_code=500, detail="Admin token not found in response")

    logger.info("Admin token retrieved successfully")
    return token
