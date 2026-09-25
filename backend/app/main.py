from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import get_database_connection
from app.routers.auth_router import router as auth_router
from app.routers.project_router import router as project_router
from app.routers.team_router import router as team_router
from app.routers.task_router import router as task_router
from app.routers.sprint_router import router as sprint_router
from app.routers.comment_router import router as comment_router
from app.routers.activity_router import router as activity_router
from app.routers.dashboard_router import router as dashboard_router
from app.routers.users_router import router as users_router
from app.routers.ai import router as ai_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(project_router)
app.include_router(team_router)
app.include_router(task_router)
app.include_router(sprint_router)
app.include_router(comment_router)
app.include_router(activity_router)
app.include_router(dashboard_router)
app.include_router(users_router)
app.include_router(ai_router)

@app.get("/api/health")
def health_check():
    connection = get_database_connection()
    connection.close()

    return {
        "status": "ok",
        "database": "connected",
    }