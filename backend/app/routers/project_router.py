from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.projects import ProjectCreateRequest, ProjectResponse
from app.services.project_service import (
    create_new_project,
    get_user_projects,
)


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    request: ProjectCreateRequest,
    current_user_id: int = Depends(get_current_user),
):
    try:
        project = create_new_project(
            name=request.name,
            description=request.description,
            status=request.status,
            owner_id=current_user_id,
        )

        return {
            "id": project[0],
            "name": project[1],
            "description": project[2],
            "status": project[3],
            "owner_id": project[4],
            "created_at": project[5],
            "updated_at": project[6],
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create project",
        )

@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    current_user_id: int = Depends(get_current_user),
):
    projects = get_user_projects(current_user_id)

    return [
        {
            "id": project[0],
            "name": project[1],
            "description": project[2],
            "status": project[3],
            "owner_id": project[4],
            "created_at": project[5],
            "updated_at": project[6],
        }
        for project in projects
    ]