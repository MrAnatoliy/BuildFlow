from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    service_name: str = "user_service"

    message_broker_url: str = "amqp://guest:guest@rabbitmq/"
    exchange_name: str = "events"
    database_url: str = "postgresql+psycopg2://postgres:postgres@user_service_db:5432/user_db"

settings = Settings()