from pydantic import BaseModel, Field

from datetime import datetime
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


# -----------------------------
# AI Risk Analysis
# -----------------------------

class ProjectRiskRequest(BaseModel):
    project_id: int = Field(
        ...,
        gt=0,
        description="ID of the project to analyze for risks",
    )


class ProjectRisk(BaseModel):
    risk: str = Field(
        ...,
        min_length=3,
        description="Short description of the identified project risk",
    )
    severity: str = Field(
        ...,
        description="Risk severity",
    )
    explanation: str = Field(
        ...,
        min_length=5,
        description="Explanation of why the risk matters",
    )
    mitigation: str = Field(
        ...,
        min_length=5,
        description="Suggested action to reduce the risk",
    )


class ProjectRiskResponse(BaseModel):
    project_id: int
    project_name: str
    risks: list[ProjectRisk]

# -----------------------------
# AI Project Assistant
# -----------------------------

class ProjectAssistantRequest(BaseModel):
    project_id: int = Field(
        ...,
        gt=0,
        description="ID of the project to ask about",
    )

    question: str = Field(
        ...,
        min_length=3,
        description="Question about the project",
    )

    conversation_id: int | None = Field(
        default=None,
        gt=0,
        description="Existing conversation ID, if continuing a conversation",
    )


class ProjectAssistantResponse(BaseModel):
    project_id: int
    conversation_id: int
    question: str
    answer: str

class ConversationCreateRequest(BaseModel):
    project_id: int = Field(..., gt=0)


class ConversationResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime


class ConversationMessagesResponse(BaseModel):
    conversation_id: int
    messages: list[MessageResponse]