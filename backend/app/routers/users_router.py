from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.db.user_repository import get_users
from app.schemas.users import UserLookupResponse


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


@router.get(
    "",
    response_model=list[UserLookupResponse],
)
def list_users(
    search: str | None = None,
    current_user_id: int = Depends(get_current_user),
):
    return get_users(search=search)