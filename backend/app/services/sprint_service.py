from fastapi import HTTPException

from app.db import sprint_repository
from app.db.project_repository import get_project_by_id
from app.services import activity_service


def verify_project_owner(project_id, current_user_id):
    project = get_project_by_id(
        project_id,
        current_user_id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


def create_sprint(
    project_id,
    name,
    goal,
    start_date,
    end_date,
    status,
    current_user_id,
):
    verify_project_owner(
        project_id,
        current_user_id,
    )

    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date",
        )

    sprint = sprint_repository.create_sprint(
        project_id=project_id,
        name=name,
        goal=goal,
        start_date=start_date,
        end_date=end_date,
        status=status,
    )

    activity_service.create_activity(
        project_id=project_id,
        user_id=current_user_id,
        action="Created sprint",
        entity_type="SPRINT",
        entity_id=sprint[0],
    )

    return sprint


def get_sprints_by_project(
    project_id,
    current_user_id,
):
    verify_project_owner(
        project_id,
        current_user_id,
    )

    return sprint_repository.get_sprints_by_project(
        project_id
    )


def get_sprint(
    sprint_id,
    current_user_id,
):
    sprint = sprint_repository.get_sprint_by_id(
        sprint_id
    )

    if not sprint:
        raise HTTPException(
            status_code=404,
            detail="Sprint not found",
        )

    project_id = sprint[1]

    verify_project_owner(
        project_id,
        current_user_id,
    )

    return sprint


def update_sprint(
    sprint_id,
    name,
    goal,
    start_date,
    end_date,
    status,
    current_user_id,
):
    sprint = sprint_repository.get_sprint_by_id(
        sprint_id
    )

    if not sprint:
        raise HTTPException(
            status_code=404,
            detail="Sprint not found",
        )

    project_id = sprint[1]

    verify_project_owner(
        project_id,
        current_user_id,
    )

    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date",
        )

    updated_sprint = sprint_repository.update_sprint(
        sprint_id=sprint_id,
        name=name,
        goal=goal,
        start_date=start_date,
        end_date=end_date,
        status=status,
    )

    if updated_sprint:
        activity_service.create_activity(
            project_id=project_id,
            user_id=current_user_id,
            action="Updated sprint",
            entity_type="SPRINT",
            entity_id=sprint_id,
        )

    return updated_sprint


def delete_sprint(
    sprint_id,
    current_user_id,
):
    sprint = sprint_repository.get_sprint_by_id(
        sprint_id
    )

    if not sprint:
        raise HTTPException(
            status_code=404,
            detail="Sprint not found",
        )

    project_id = sprint[1]

    verify_project_owner(
        project_id,
        current_user_id,
    )

    deleted_sprint = sprint_repository.delete_sprint(
        sprint_id
    )

    if deleted_sprint:
        activity_service.create_activity(
            project_id=project_id,
            user_id=current_user_id,
            action="Deleted sprint",
            entity_type="SPRINT",
            entity_id=sprint_id,
        )

    return deleted_sprint