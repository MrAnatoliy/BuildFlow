from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    service_name: str = "auth_service"

    keycloak_base_url: str = "http://keycloak:8080"
    exchange_name: str = "rpc"
    realm: str = "buildflow-realm"

    client_id: str = "backend_client"
    client_secret: str = "GlDkVI6WXTOKARMuf6t1l28ydj4QaQKd"

    admin_client_id: str = "admin_api_client"
    admin_client_secret: str = "y9uhXHRRsiJvcy4KWkYUX8M3tlNyqEK1"

    message_broker_url: str = "amqp://guest:guest@rabbitmq/"


settings = Settings()
