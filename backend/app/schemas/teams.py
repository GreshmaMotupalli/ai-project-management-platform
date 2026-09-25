from datetime import datetime

from pydantic import BaseModel


class TeamCreateRequest(BaseModel):
    name: str
    project_id: int


class TeamUpdateRequest(BaseModel):
    name: str


class TeamResponse(BaseModel):
    id: int
    name: str
    project_id: int
    created_at: datetime


class TeamMemberAddRequest(BaseModel):
    user_id: int


class TeamMemberResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    name: str
    email: str
    role: str