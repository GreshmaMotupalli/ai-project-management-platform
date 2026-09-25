from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user

from app.schemas.tasks import (
    TaskCreateRequest,
    TaskResponse,
    TaskUpdateRequest,
)

from app.services.task_service import (
    create_new_task,
    delete_user_task,
    get_project_tasks,
    get_user_task,
    update_user_task,
)


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"],
)


def task_to_response(task):
    return {
        "id": task[0],
        "project_id": task[1],
        "sprint_id": task[2],
        "assigned_to": task[3],
        "title": task[4],
        "description": task[5],
        "status": task[6],
        "priority": task[7],
        "story_points": task[8],
        "due_date": task[9],
        "created_by": task[10],
        "created_at": task[11],
        "updated_at": task[12],
    }


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    request: TaskCreateRequest,
    current_user_id: int = Depends(get_current_user),
):
    task = create_new_task(
        project_id=request.project_id,
        sprint_id=request.sprint_id,
        assigned_to=request.assigned_to,
        title=request.title,
        description=request.description,
        status=request.status,
        priority=request.priority,
        story_points=request.story_points,
        due_date=request.due_date,
        user_id=current_user_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    return task_to_response(task)


@router.get(
    "/project/{project_id}",
    response_model=list[TaskResponse],
)
def get_project_tasks_route(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    tasks = get_project_tasks(
        project_id=project_id,
        user_id=current_user_id,
    )

    if tasks is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    return [
        task_to_response(task)
        for task in tasks
    ]


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: int,
    current_user_id: int = Depends(get_current_user),
):
    task = get_user_task(
        task_id=task_id,
        user_id=current_user_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task_to_response(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: int,
    request: TaskUpdateRequest,
    current_user_id: int = Depends(get_current_user),
):
    task = update_user_task(
        task_id=task_id,
        sprint_id=request.sprint_id,
        assigned_to=request.assigned_to,
        title=request.title,
        description=request.description,
        status=request.status,
        priority=request.priority,
        story_points=request.story_points,
        due_date=request.due_date,
        user_id=current_user_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task_to_response(task)


@router.delete(
    "/{task_id}",
)
def delete_task(
    task_id: int,
    current_user_id: int = Depends(get_current_user),
):
    deleted_task = delete_user_task(
        task_id=task_id,
        user_id=current_user_id,
    )

    if deleted_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return {
        "message": "Task deleted successfully",
        "task_id": task_id,
    }