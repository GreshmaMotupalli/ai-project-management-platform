from pydantic import BaseModel, Field


# -----------------------------
# AI Task Breakdown
# -----------------------------

class TaskBreakdownRequest(BaseModel):
    requirement: str = Field(
        ...,
        min_length=10,
        description="Software requirement to break into development tasks",
    )


class GeneratedTask(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        description="Short development task title",
    )
    description: str = Field(
        ...,
        min_length=5,
        description="Concise description of the development task",
    )


class TaskBreakdownResponse(BaseModel):
    requirement: str
    tasks: list[GeneratedTask]


# -----------------------------
# AI Progress Summary
# -----------------------------

class ProjectSummaryRequest(BaseModel):
    project_id: int = Field(
        ...,
        gt=0,
        description="ID of the project to summarize",
    )


class ProjectSummaryResponse(BaseModel):
    project_id: int
    project_name: str
    summary: str
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    todo_tasks: int