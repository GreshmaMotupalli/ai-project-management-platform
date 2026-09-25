from datetime import date, datetime

from pydantic import BaseModel


class SprintCreateRequest(BaseModel):
    project_id: int
    name: str
    goal: str | None = None
    start_date: date
    end_date: date
    status: str = "PLANNED"


class SprintUpdateRequest(BaseModel):
    name: str
    goal: str | None = None
    start_date: date
    end_date: date
    status: str


class SprintResponse(BaseModel):
    id: int
    project_id: int
    name: str
    goal: str | None
    start_date: date
    end_date: date
    status: str
    created_at: datetime