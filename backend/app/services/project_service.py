from app.db.project_repository import create_project

from app.db.project_repository import (
    create_project,
    get_projects_by_owner,
)

def create_new_project(
    name: str,
    description: str,
    status: str,
    owner_id: int,
):
    return create_project(
        name=name,
        description=description,
        status=status,
        owner_id=owner_id,
    )

def get_user_projects(owner_id: int):
    return get_projects_by_owner(owner_id)