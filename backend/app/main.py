from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import get_database_connection
from app.routers.auth_router import router as auth_router
from app.routers.project_router import router as project_router

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


@app.get("/api/health")
def health_check():
    connection = get_database_connection()
    connection.close()

    return {
        "status": "ok",
        "database": "connected",
    }