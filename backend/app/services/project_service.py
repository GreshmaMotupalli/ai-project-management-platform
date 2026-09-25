from app.db.project_repository import (
    create_project,
    get_projects_by_owner,
    get_project_by_id,
    update_project,
    delete_project,
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


def get_user_project(project_id: int, owner_id: int):
    return get_project_by_id(
        project_id=project_id,
        owner_id=owner_id,
    )


def update_user_project(
    project_id: int,
    owner_id: int,
    name: str,
    description: str,
    status: str,
):
    return update_project(
        project_id=project_id,
        owner_id=owner_id,
        name=name,
        description=description,
        status=status,
    )


def delete_user_project(project_id: int, owner_id: int):
    return delete_project(
        project_id=project_id,
        owner_id=owner_id,
    )