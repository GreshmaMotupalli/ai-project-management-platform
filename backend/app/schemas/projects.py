from datetime import datetime

from pydantic import BaseModel


class ProjectCreateRequest(BaseModel):
    name: str
    description: str
    status: str


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    status: str
    owner_id: int
    created_at: datetime
    updated_at: datetime