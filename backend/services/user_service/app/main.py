import asyncio
import contextlib
from fastapi import FastAPI
from contextlib import asynccontextmanager

from messages.consumer import start_consumer

@asynccontextmanager
async def lifespan(app: FastAPI):
    consumer_task = asyncio.create_task(start_consumer())
    yield
    consumer_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await consumer_task

app = FastAPI(lifespan=lifespan)