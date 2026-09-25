from datetime import date, datetime

from pydantic import BaseModel


class TaskCreateRequest(BaseModel):
    project_id: int
    sprint_id: int | None = None
    assigned_to: int | None = None
    title: str
    description: str | None = None
    status: str = "TODO"
    priority: str = "MEDIUM"
    story_points: int | None = None
    due_date: date | None = None


class TaskUpdateRequest(BaseModel):
    sprint_id: int | None = None
    assigned_to: int | None = None
    title: str
    description: str | None = None
    status: str
    priority: str
    story_points: int | None = None
    due_date: date | None = None


class TaskResponse(BaseModel):
    id: int
    project_id: int
    sprint_id: int | None
    assigned_to: int | None
    title: str
    description: str | None
    status: str
    priority: str
    story_points: int | None
    due_date: date | None
    created_by: int
    created_at: datetime
    updated_at: datetime