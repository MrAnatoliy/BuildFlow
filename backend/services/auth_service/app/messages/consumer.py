import logging
import aio_pika

from core.config import settings
from messages.handlers import handler_map

logger = logging.getLogger(settings.service_name)


async def start_consumer():
    connection = await aio_pika.connect_robust(settings.message_broker_url)
    channel = await connection.channel()

    exchange = await channel.declare_exchange(
        settings.exchange_name, aio_pika.ExchangeType.TOPIC
    )
    queue = await channel.declare_queue(name=settings.service_name, durable=True)
    await queue.bind(exchange, routing_key="rpc.*")  # слушаем RPC-запросы

    logger.info(
        f'Successfully connected. Queue "{settings.service_name}" bound to exchange "{settings.exchange_name}"'
    )

    async def on_message(message: aio_pika.IncomingMessage):
        logger.info(f"[AMQP] Message received")
        async with message.process():
            routing_key = message.routing_key
            payload = message.body.decode()
            handler = handler_map.get(routing_key)

            logger.info(
                f"[AMQP] Routing key: {routing_key}\nPayload: {payload}\nHandler: {handler.__name__ if handler else 'NOT FOUND'}"
            )

            if handler:
                if routing_key.startswith("rpc."):
                    await handler(
                        payload,
                        message.reply_to,
                        message.correlation_id,
                        channel
                    )
                else:
                    await handler(payload)

    await queue.consume(on_message)
