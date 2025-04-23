import logging
import aio_pika

from core.config import settings
from messages.handlers import handler_map

logger = logging.getLogger(settings.service_name)

async def start_consumer():
    connection = await aio_pika.connect_robust(settings.message_broker_url)
    channel = await connection.channel()

    # Message broker queue and exchange setup
    exchange = await channel.declare_exchange(settings.exchange_name, aio_pika.ExchangeType.TOPIC)
    queue = await channel.declare_queue(name=settings.service_name, durable=True)
    await queue.bind(exchange, routing_key="user.*")

    logger.info(f'Successfully established connection. Queue "{settings.service_name}" binded to "{settings.exchange_name}" exchange')

    async def on_message(message: aio_pika.IncomingMessage):
        logger.info(f'Message has been reicived')
        async with message.process():
            routing_key = message.routing_key
            payload = message.body.decode()
            handler = handler_map.get(routing_key)

            logger.info(f'Routing key : {routing_key}\npayload : {payload}\nhandler : {handler.__name__ if handler is not None else "HANDLER_NOT_FOUND"}')

            if handler:
                await handler(payload)

    await queue.consume(on_message)