import aio_pika

from core.config import settings
from messages.handlers import handler_map

async def start_consumer():
    connection = await aio_pika.connect_robust(settings.message_broker_url)
    channel = await connection.channel()

    # Message broker queue and exchange setup
    exchange = await channel.declare_exchange("events", aio_pika.ExchangeType.TOPIC)
    queue = await channel.declare_queue(name=settings.service_name, durable=True)
    await queue.bind(exchange, routing_key="user.*")
    

    async def on_message(message: aio_pika.IncomingMessage):
        async with message.process():
            routing_key = message.routing_key
            payload = message.body.decode()
            handler = handler_map.get(routing_key)

            if handler:
                await handler(payload)

    await queue.consume(on_message)