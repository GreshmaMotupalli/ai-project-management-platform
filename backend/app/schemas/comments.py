from datetime import datetime

from pydantic import BaseModel


class CommentCreateRequest(BaseModel):
    task_id: int
    content: str


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime