import asyncio
import json
import logging
import aio_pika
import uuid
from core.config import settings


logger = logging.getLogger(settings.service_name)

async def rpc_get_users_info(user_ids: list[str | uuid.UUID]) -> list[dict]:
    connection = await aio_pika.connect_robust(settings.message_broker_url)
    channel = await connection.channel()
    exchange = await channel.declare_exchange(
        settings.rpc_exchange, aio_pika.ExchangeType.TOPIC
    )
    callback_queue = await channel.declare_queue(exclusive=True)

    correlation_id = str(uuid.uuid4())

    # Преобразуем UUID в str на всякий случай
    serialized_ids = [str(uid) for uid in user_ids]
    request = {
        "user_ids": serialized_ids
    }

    logger.info(f"[UserService] Sending RPC for user_ids: {serialized_ids}")

    await exchange.publish(
        aio_pika.Message(
            body=json.dumps(request).encode(),
            reply_to=callback_queue.name,
            correlation_id=correlation_id,
        ),
        routing_key="rpc.get_users_info",
    )

    future = asyncio.get_event_loop().create_future()

    async def on_response(message: aio_pika.IncomingMessage):
        if message.correlation_id == correlation_id:
            result = json.loads(message.body.decode())

            logger.info(f"[UserService] Received RPC response: {result}")

            future.set_result(result)

    await callback_queue.consume(on_response, no_ack=True)
    return await future
