import json
import logging
import aio_pika

from services.keycloak_service import KeycloakService
from core.keycloak import get_admin_token
from core.config import settings

logger = logging.getLogger(settings.service_name)

keycloak_service = KeycloakService()


async def handler_get_users_info(raw: str, reply_to: str, correlation_id: str, channel):
    logger.info(f"[RPC] Received user info request: {raw}")
    try:
        data = json.loads(raw)
        user_ids = data.get("user_ids", [])

        admin_token = await get_admin_token()

        result = []

        for user_id in user_ids:
            try:
                user_info = await keycloak_service.get_user_by_id(admin_token, user_id)
                if user_info.get("error") is not None:
                    continue

                result.append({
                    "id": user_id,
                    "username": user_info.get("username"),
                    "firstName": user_info.get("firstName"),
                    "lastName": user_info.get("lastName"),
                    "email": user_info.get("email"),
                })
            except Exception as e:
                logger.warning(f"[RPC] Failed to fetch info for {user_id}: {e}")
                result.append({
                    "id": user_id,
                    "error": str(e),
                })

        await channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(result).encode(),
                correlation_id=correlation_id
            ),
            routing_key=reply_to
        )
        logger.info(f"[RPC] Responded with user info to '{reply_to}'")

    except Exception as e:
        logger.error(f"[RPC] Error handling user info request: {e}")
