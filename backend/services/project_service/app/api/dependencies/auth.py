from fastapi import Header, HTTPException, Depends
import uuid

def get_current_user_id(x_auth_request_user: str = Header(..., alias="X-Auth-Request-User")) -> uuid.UUID:
    try:
        return uuid.UUID(x_auth_request_user)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid X-Auth-Request-User header")
