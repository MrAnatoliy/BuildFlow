import json
import logging

from schemas.user import UserCreatedEventSchema
from db.session import SessionLocal
from crud.user import create_user_from_event
from core.config import settings

logger = logging.getLogger(settings.service_name)


async def handler_created_user(raw: str):
    logger.info(f"{handler_created_user.__name__} : Recieved a raw data : {raw}")
    try:
        dict_data = json.loads(raw)
        user_created_event = UserCreatedEventSchema.model_validate(dict_data)

        logger.info(
            f"Recieved valid data in {handler_created_user.__name__} event : {user_created_event.model_dump_json(indent=4)}"
        )

        with SessionLocal() as session:
            new_user = create_user_from_event(session, user_created_event)
            logger.info(f"Successfully created new user : {new_user}")

    except Exception as e:
        logger.info(f"Recieved invalid data in event : {e}")
        return
