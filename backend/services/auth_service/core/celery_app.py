from celery import Celery

celery = Celery(
    "auth_service", broker="amqp://guest:guest@rabbitmq//", backend="rpc://"
)
