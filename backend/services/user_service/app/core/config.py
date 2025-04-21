from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    service_name: str = "user_service"

    message_broker_url: str = "amqp://guest:guest@rabbitmq/"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5435/user_db"

settings = Settings()