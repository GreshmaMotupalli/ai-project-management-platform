from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.projects import ProjectCreateRequest, ProjectResponse
from app.services.project_service import (
    create_new_project,
    get_user_projects,
    get_user_project,
    update_user_project,
    delete_user_project,
)


router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"],
)


def project_to_response(project):
    return {
        "id": project[0],
        "name": project[1],
        "description": project[2],
        "status": project[3],
        "owner_id": project[4],
        "created_at": project[5],
        "updated_at": project[6],
    }


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

        return project_to_response(project)

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
        project_to_response(project)
        for project in projects
    ]


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    project = get_user_project(
        project_id=project_id,
        owner_id=current_user_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project_to_response(project)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: int,
    request: ProjectCreateRequest,
    current_user_id: int = Depends(get_current_user),
):
    project = update_user_project(
        project_id=project_id,
        owner_id=current_user_id,
        name=request.name,
        description=request.description,
        status=request.status,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return project_to_response(project)


@router.delete(
    "/{project_id}",
)
def delete_project(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    deleted_project = delete_user_project(
        project_id=project_id,
        owner_id=current_user_id,
    )

    if deleted_project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    return {
        "message": "Project deleted successfully",
        "project_id": project_id,
    }