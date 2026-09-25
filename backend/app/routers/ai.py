from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.ai import (
    ProjectSummaryRequest,
    ProjectSummaryResponse,
    TaskBreakdownRequest,
    TaskBreakdownResponse,
)
from app.services.ai.summarization import generate_project_summary
from app.services.ai.task_breakdown import generate_task_breakdown
from app.services.project_service import get_user_project
from app.services.task_service import get_project_tasks


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
)


@router.post(
    "/task-breakdown",
    response_model=TaskBreakdownResponse,
)
def task_breakdown(request: TaskBreakdownRequest):
    tasks = generate_task_breakdown(request.requirement)

    return {
        "requirement": request.requirement,
        "tasks": tasks,
    }


@router.post(
    "/project-summary",
    response_model=ProjectSummaryResponse,
)
def project_summary(
    request: ProjectSummaryRequest,
    current_user_id: int = Depends(get_current_user),
):
    project = get_user_project(
        project_id=request.project_id,
        owner_id=current_user_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    tasks = get_project_tasks(
        project_id=request.project_id,
        user_id=current_user_id,
    )

    if tasks is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    total_tasks = len(tasks)

    completed_tasks = sum(
    1 for task in tasks
    if task[6] == "DONE"
)

    in_progress_tasks = sum(
        1 for task in tasks
        if task[6] == "IN_PROGRESS"
    )

    todo_tasks = sum(
        1 for task in tasks
        if task[6] == "TODO"
    )

    summary = generate_project_summary(
        project_name=project[1],
        project_description=project[2] or "",
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        in_progress_tasks=in_progress_tasks,
        todo_tasks=todo_tasks,
    )

    return {
        "project_id": request.project_id,
        "project_name": project[1],
        "summary": summary,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "todo_tasks": todo_tasks,
    }