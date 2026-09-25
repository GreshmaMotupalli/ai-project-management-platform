from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.activities import ActivityResponse
from app.services import activity_service


router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"],
)


@router.get(
    "/project/{project_id}",
    response_model=list[ActivityResponse],
)
def get_project_activities(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    activities = activity_service.get_project_activities(
        project_id=project_id,
        current_user_id=current_user_id,
    )

    return [
        ActivityResponse(
            id=activity[0],
            project_id=activity[1],
            user_id=activity[2],
            action=activity[3],
            entity_type=activity[4],
            entity_id=activity[5],
            created_at=activity[6],
        )
        for activity in activities
    ]