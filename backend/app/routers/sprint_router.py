from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user

from app.schemas.sprints import (
    SprintCreateRequest,
    SprintUpdateRequest,
    SprintResponse,
)

from app.services import sprint_service


router = APIRouter(
    prefix="/api/sprints",
    tags=["Sprints"],
)


@router.post(
    "",
    response_model=SprintResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sprint(
    request: SprintCreateRequest,
    current_user_id: int = Depends(get_current_user),
):
    sprint = sprint_service.create_sprint(
        project_id=request.project_id,
        name=request.name,
        goal=request.goal,
        start_date=request.start_date,
        end_date=request.end_date,
        status=request.status,
        current_user_id=current_user_id,
    )

    return SprintResponse(
        id=sprint[0],
        project_id=sprint[1],
        name=sprint[2],
        goal=sprint[3],
        start_date=sprint[4],
        end_date=sprint[5],
        status=sprint[6],
        created_at=sprint[7],
    )


@router.get(
    "/project/{project_id}",
    response_model=list[SprintResponse],
)
def get_project_sprints(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    sprints = sprint_service.get_sprints_by_project(
        project_id=project_id,
        current_user_id=current_user_id,
    )

    return [
        SprintResponse(
            id=sprint[0],
            project_id=sprint[1],
            name=sprint[2],
            goal=sprint[3],
            start_date=sprint[4],
            end_date=sprint[5],
            status=sprint[6],
            created_at=sprint[7],
        )
        for sprint in sprints
    ]


@router.get(
    "/{sprint_id}",
    response_model=SprintResponse,
)
def get_sprint(
    sprint_id: int,
    current_user_id: int = Depends(get_current_user),
):
    sprint = sprint_service.get_sprint(
        sprint_id=sprint_id,
        current_user_id=current_user_id,
    )

    return SprintResponse(
        id=sprint[0],
        project_id=sprint[1],
        name=sprint[2],
        goal=sprint[3],
        start_date=sprint[4],
        end_date=sprint[5],
        status=sprint[6],
        created_at=sprint[7],
    )


@router.put(
    "/{sprint_id}",
    response_model=SprintResponse,
)
def update_sprint(
    sprint_id: int,
    request: SprintUpdateRequest,
    current_user_id: int = Depends(get_current_user),
):
    sprint = sprint_service.update_sprint(
        sprint_id=sprint_id,
        name=request.name,
        goal=request.goal,
        start_date=request.start_date,
        end_date=request.end_date,
        status=request.status,
        current_user_id=current_user_id,
    )

    return SprintResponse(
        id=sprint[0],
        project_id=sprint[1],
        name=sprint[2],
        goal=sprint[3],
        start_date=sprint[4],
        end_date=sprint[5],
        status=sprint[6],
        created_at=sprint[7],
    )


@router.delete(
    "/{sprint_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_sprint(
    sprint_id: int,
    current_user_id: int = Depends(get_current_user),
):
    sprint_service.delete_sprint(
        sprint_id=sprint_id,
        current_user_id=current_user_id,
    )

    return None