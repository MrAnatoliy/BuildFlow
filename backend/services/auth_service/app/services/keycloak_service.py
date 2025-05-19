import httpx
from core.config import settings


class KeycloakService:
    def __init__(self):
        self.base_url = settings.keycloak_base_url
        self.realm = settings.realm
        self.client_id = settings.client_id
        self.client_secret = settings.client_secret

    async def login(self, username: str, password: str) -> dict:
        token_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/token"
        data = {
            "grant_type": "password",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "username": username,
            "password": password,
            "scope": "openid email profile",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            response.raise_for_status()
            return response.json()

    async def register_user(self, admin_token: str, user_data: dict) -> str:
        url = f"{self.base_url}/admin/realms/{self.realm}/users"
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=user_data, headers=headers)
            response.raise_for_status()
            location = response.headers.get("Location")
            return location.rstrip("/").split("/")[-1] if location else None

    async def refresh_token(self, refresh_token: str) -> dict:
        token_url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/token"
        data = {
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "scope": "openid email profile",
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            response.raise_for_status()
            return response.json()

    async def get_userinfo(self, access_token: str) -> dict:
        url = f"{self.base_url}/realms/{self.realm}/protocol/openid-connect/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()

    async def get_user_by_id(self, admin_token: str, user_id: str) -> dict:
        url = f"{self.base_url}/admin/realms/{self.realm}/users/{user_id}"
        headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()

    async def verify_email(self, admin_token: str, username: str):
        url = f"{self.base_url}/admin/realms/{self.realm}/users"
        headers = {"Authorization": f"Bearer {admin_token}"}
        async with httpx.AsyncClient() as client:
            # Найти пользователя
            response = await client.get(
                url, headers=headers, params={"username": username}
            )
            response.raise_for_status()
            users = response.json()
            if not users:
                raise ValueError("User not found")
            user_id = users[0]["id"]

            # Обновить поле emailVerified
            user_url = f"{url}/{user_id}"
            update_headers = {
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json",
            }
            update_data = {"emailVerified": True}
            update_response = await client.put(
                user_url, headers=update_headers, json=update_data
            )
            update_response.raise_for_status()
