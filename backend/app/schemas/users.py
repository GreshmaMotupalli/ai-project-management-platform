from pydantic import BaseModel


class UserLookupResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str