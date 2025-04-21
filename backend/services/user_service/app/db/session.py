from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.config import settings

database_engine = create_engine(settings.database_url, echo=True)
SessionLocal = sessionmaker(bind=database_engine)