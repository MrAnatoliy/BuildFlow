from fastapi import HTTPException, Response
from core.config import settings
import logging

logger = logging.getLogger(settings.service_name)


def set_tokens_cookies(response: Response, tokens: dict):
    logger.info(f"Setting token cookies: {tokens.keys()}")
    response.set_cookie(
        "access_token",
        tokens["access_token"],
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=tokens.get("expires_in", 180),
    )
    if "refresh_token" in tokens:
        response.set_cookie(
            "refresh_token",
            tokens["refresh_token"],
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=12 * 60 * 60,
        )
    if "id_token" in tokens:
        response.set_cookie(
            "id_token",
            tokens["id_token"],
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=12 * 60 * 60,
        )
