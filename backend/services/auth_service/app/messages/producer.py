import json
import logging
import aio_pika

from core.config import settings

logger = logging.getLogger(settings.service_name)


async def publish_event(routing_key: str, payload: dict):

    event_service, event_name = routing_key.split(".", maxsplit=1)
    logger.info(
        f"Recieved message publish request : service - {event_service} | event - {event_name}"
    )
    logger.info(f"Message body : {payload}")
    connection = await aio_pika.connect_robust(settings.message_broker_url)
    logger.info(
        f"Connection with message broker at {settings.message_broker_url} has been established"
    )

    async with connection:
        channel = await connection.channel()
        exchange = await channel.declare_exchange("events", aio_pika.ExchangeType.TOPIC)

        logger.info(f"Exchage and channel is ready. Sending message...")

        await exchange.publish(
            aio_pika.Message(body=json.dumps(payload).encode()), routing_key=routing_key
        )
