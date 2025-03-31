from celery import Celery

app = Celery(
    'mail_service', 
    broker='amqp://guest:guest@rabbitmq//',
    backend='rpc://'
)

import tasks