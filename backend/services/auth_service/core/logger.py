import logging
from core.config import settings

def setup_logger(app=None):
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(settings.service_name)
    if app:
        app.logger = logger
