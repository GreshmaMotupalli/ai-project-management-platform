from fastapi import HTTPException

from app.db import activity_repository
from app.db.project_repository import get_project_by_id


def create_activity(
    project_id,
    user_id,
    action,
    entity_type,
    entity_id,
):
    project = get_project_by_id(
        project_id,
        user_id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return activity_repository.create_activity(
        project_id=project_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
    )


def get_project_activities(
    project_id,
    current_user_id,
):
    project = get_project_by_id(
        project_id,
        current_user_id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return activity_repository.get_activities_by_project(
        project_id
    )