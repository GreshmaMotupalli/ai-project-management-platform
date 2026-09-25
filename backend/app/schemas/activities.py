from datetime import datetime

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    action: str
    entity_type: str
    entity_id: int
    created_at: datetime