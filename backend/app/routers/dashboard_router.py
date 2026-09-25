from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.dashboard import DashboardSummaryResponse
from app.services import dashboard_service


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_dashboard_summary(
    current_user_id: int = Depends(get_current_user),
):
    return dashboard_service.get_dashboard_summary(
        current_user_id=current_user_id
    )