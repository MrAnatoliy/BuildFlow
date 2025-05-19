from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from db.session import SessionLocal

# Зависимость FastAPI для получения сессии
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
