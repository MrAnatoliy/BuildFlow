from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class RegistrationRequest(BaseModel):
    username: str
    email: str
    firstName: str
    lastName: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str
