from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.logger import setup_logger
from api.routes import project, stage, task, requirement, task_volume, executor

app = FastAPI()

setup_logger(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project.router)
app.include_router(stage.router)
app.include_router(task.router)
app.include_router(requirement.router)
app.include_router(task_volume.router)
app.include_router(executor.router)
