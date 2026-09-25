from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    archived_projects: int

    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    completed_tasks: int

    total_sprints: int
    planned_sprints: int
    active_sprints: int
    completed_sprints: int