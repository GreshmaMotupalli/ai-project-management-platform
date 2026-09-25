from app.db.project_repository import get_project_by_id
from app.db.task_repository import (
    create_task,
    delete_task,
    get_task_by_id,
    get_tasks_by_project,
    update_task,
)
from app.services import activity_service


def verify_project_owner(
    project_id: int,
    user_id: int,
):
    project = get_project_by_id(
        project_id=project_id,
        owner_id=user_id,
    )

    return project is not None


def create_new_task(
    project_id: int,
    sprint_id: int | None,
    assigned_to: int | None,
    title: str,
    description: str | None,
    status: str,
    priority: str,
    story_points: int | None,
    due_date,
    user_id: int,
):
    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    task = create_task(
        project_id=project_id,
        sprint_id=sprint_id,
        assigned_to=assigned_to,
        title=title,
        description=description,
        status=status,
        priority=priority,
        story_points=story_points,
        due_date=due_date,
        created_by=user_id,
    )

    activity_service.create_activity(
        project_id=project_id,
        user_id=user_id,
        action="Created task",
        entity_type="TASK",
        entity_id=task[0],
    )

    return task


def get_project_tasks(
    project_id: int,
    user_id: int,
):
    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return get_tasks_by_project(
        project_id=project_id,
    )


def get_user_task(
    task_id: int,
    user_id: int,
):
    task = get_task_by_id(
        task_id=task_id,
    )

    if task is None:
        return None

    project_id = task[1]

    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return task


def update_user_task(
    task_id: int,
    sprint_id: int | None,
    assigned_to: int | None,
    title: str,
    description: str | None,
    status: str,
    priority: str,
    story_points: int | None,
    due_date,
    user_id: int,
):
    task = get_task_by_id(
        task_id=task_id,
    )

    if task is None:
        return None

    project_id = task[1]

    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    updated_task = update_task(
        task_id=task_id,
        sprint_id=sprint_id,
        assigned_to=assigned_to,
        title=title,
        description=description,
        status=status,
        priority=priority,
        story_points=story_points,
        due_date=due_date,
    )

    if updated_task:
        activity_service.create_activity(
            project_id=project_id,
            user_id=user_id,
            action="Updated task",
            entity_type="TASK",
            entity_id=task_id,
        )

    return updated_task


def delete_user_task(
    task_id: int,
    user_id: int,
):
    task = get_task_by_id(
        task_id=task_id,
    )

    if task is None:
        return None

    project_id = task[1]

    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    deleted_task = delete_task(
        task_id=task_id,
    )

    if deleted_task:
        activity_service.create_activity(
            project_id=project_id,
            user_id=user_id,
            action="Deleted task",
            entity_type="TASK",
            entity_id=task_id,
        )

    return deleted_task