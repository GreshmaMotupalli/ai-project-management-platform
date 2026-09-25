from fastapi import HTTPException

from app.db import comment_repository
from app.db.project_repository import get_project_by_id
from app.db.task_repository import get_task_by_id
from app.services import activity_service


def verify_task_owner(
    task_id,
    current_user_id,
):
    task = get_task_by_id(task_id)

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    project_id = task[1]

    project = get_project_by_id(
        project_id,
        current_user_id,
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


def create_comment(
    task_id,
    content,
    current_user_id,
):
    task = verify_task_owner(
        task_id,
        current_user_id,
    )

    if not content.strip():
        raise HTTPException(
            status_code=400,
            detail="Comment content cannot be empty",
        )

    comment = comment_repository.create_comment(
        task_id=task_id,
        user_id=current_user_id,
        content=content.strip(),
    )

    project_id = task[1]

    activity_service.create_activity(
        project_id=project_id,
        user_id=current_user_id,
        action="Created comment",
        entity_type="COMMENT",
        entity_id=comment[0],
    )

    return comment


def get_comments_by_task(
    task_id,
    current_user_id,
):
    verify_task_owner(
        task_id,
        current_user_id,
    )

    return comment_repository.get_comments_by_task(
        task_id
    )


def delete_comment(
    comment_id,
    current_user_id,
):
    comment = comment_repository.get_comment_by_id(
        comment_id
    )

    if not comment:
        raise HTTPException(
            status_code=404,
            detail="Comment not found",
        )

    task_id = comment[1]

    task = verify_task_owner(
        task_id,
        current_user_id,
    )

    deleted_comment = comment_repository.delete_comment(
        comment_id
    )

    if deleted_comment:
        project_id = task[1]

        activity_service.create_activity(
            project_id=project_id,
            user_id=current_user_id,
            action="Deleted comment",
            entity_type="COMMENT",
            entity_id=comment_id,
        )

    return deleted_comment