from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.dependencies import get_current_user

from app.schemas.ai import (
    ProjectRiskRequest,
    ProjectRiskResponse,
    ProjectSummaryRequest,
    ProjectSummaryResponse,
    TaskBreakdownRequest,
    TaskBreakdownResponse,
    ConversationCreateRequest,
    ConversationResponse,
    ConversationMessagesResponse,
    MessageResponse,
    ProjectAssistantRequest,
    ProjectAssistantResponse,
)

from app.db.ai_conversation_repository import (
    create_conversation,
    get_conversations_by_project,
    get_conversation_by_id,
    update_conversation_timestamp,
    update_conversation_title,
)

from app.db.ai_message_repository import (
    create_message,
    get_messages_by_conversation,
)

from app.services.ai.risk_analysis import (
    build_project_risk_data,
    generate_project_risks,
)

from app.services.ai.summarization import (
    generate_project_summary,
)

from app.services.ai.task_breakdown import (
    generate_task_breakdown,
)

from app.services.ai.project_assistant import (
    ask_project_assistant,
    stream_project_assistant,
)

from app.services.project_service import (
    get_user_project,
)

from app.services.task_service import (
    get_project_tasks,
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
)


# ============================================================
# AI TASK BREAKDOWN
# ============================================================

@router.post(
    "/task-breakdown",
    response_model=TaskBreakdownResponse,
)
def task_breakdown(
    request: TaskBreakdownRequest,
):
    tasks = generate_task_breakdown(
        request.requirement
    )

    return {
        "requirement": request.requirement,
        "tasks": tasks,
    }


# ============================================================
# AI PROJECT SUMMARY
# ============================================================

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
        1
        for task in tasks
        if task[6] == "DONE"
    )

    in_progress_tasks = sum(
        1
        for task in tasks
        if task[6] == "IN_PROGRESS"
    )

    todo_tasks = sum(
        1
        for task in tasks
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


# ============================================================
# AI PROJECT RISKS
# ============================================================

@router.post(
    "/project-risks",
    response_model=ProjectRiskResponse,
)
def project_risks(
    request: ProjectRiskRequest,
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

    risk_data = build_project_risk_data(tasks)

    try:
        risks = generate_project_risks(
            project_name=project[1],
            project_description=project[2] or "",
            risk_data=risk_data,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    return {
        "project_id": request.project_id,
        "project_name": project[1],
        "risks": risks,
    }


# ============================================================
# AI PROJECT ASSISTANT
# ============================================================

@router.post(
    "/assistant",
    response_model=ProjectAssistantResponse,
)
def project_assistant(
    request: ProjectAssistantRequest,
    current_user_id: int = Depends(get_current_user),
):
    # --------------------------------------------------------
    # Validate project ownership
    # --------------------------------------------------------

    project = get_user_project(
        project_id=request.project_id,
        owner_id=current_user_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Create a new conversation if none was provided
    # --------------------------------------------------------

    if request.conversation_id is None:

        conversation = create_conversation(
            project_id=request.project_id,
            user_id=current_user_id,
        )

        conversation_id = conversation[0]

        # Use the first question as the conversation title.
        update_conversation_title(
            conversation_id=conversation_id,
            title=request.question[:255],
        )

    # --------------------------------------------------------
    # Continue an existing conversation
    # --------------------------------------------------------

    else:

        conversation = get_conversation_by_id(
            conversation_id=request.conversation_id,
            project_id=request.project_id,
            user_id=current_user_id,
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        conversation_id = request.conversation_id

    # --------------------------------------------------------
    # Save user message
    # --------------------------------------------------------

    create_message(
        conversation_id=conversation_id,
        role="user",
        content=request.question,
    )

    # --------------------------------------------------------
    # Generate AI answer using RAG
    # --------------------------------------------------------

    answer = ask_project_assistant(
        project_id=request.project_id,
        question=request.question,
    )

    # --------------------------------------------------------
    # Save assistant message
    # --------------------------------------------------------

    create_message(
        conversation_id=conversation_id,
        role="assistant",
        content=answer,
    )

    # --------------------------------------------------------
    # Update conversation timestamp
    # This moves the conversation to the top of history.
    # --------------------------------------------------------

    update_conversation_timestamp(
        conversation_id=conversation_id,
    )

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return ProjectAssistantResponse(
        project_id=request.project_id,
        conversation_id=conversation_id,
        question=request.question,
        answer=answer,
    )


# ============================================================
# CREATE AI CONVERSATION
# ============================================================

@router.post(
    "/conversations",
    response_model=ConversationResponse,
)
def create_ai_conversation(
    request: ConversationCreateRequest,
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

    conversation = create_conversation(
        project_id=request.project_id,
        user_id=current_user_id,
    )

    return ConversationResponse(
        id=conversation[0],
        project_id=conversation[1],
        user_id=conversation[2],
        title=conversation[3],
        created_at=conversation[4],
        updated_at=conversation[5],
    )


# ============================================================
# GET AI CONVERSATIONS
# ============================================================

@router.get(
    "/conversations",
    response_model=list[ConversationResponse],
)
def list_ai_conversations(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    project = get_user_project(
        project_id=project_id,
        owner_id=current_user_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    conversations = get_conversations_by_project(
        project_id=project_id,
        user_id=current_user_id,
    )

    return [
        ConversationResponse(
            id=conversation[0],
            project_id=conversation[1],
            user_id=conversation[2],
            title=conversation[3],
            created_at=conversation[4],
            updated_at=conversation[5],
        )
        for conversation in conversations
    ]


# ============================================================
# GET CONVERSATION MESSAGES
# ============================================================

@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=ConversationMessagesResponse,
)
def get_ai_conversation_messages(
    conversation_id: int,
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    conversation = get_conversation_by_id(
        conversation_id=conversation_id,
        project_id=project_id,
        user_id=current_user_id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    messages = get_messages_by_conversation(
        conversation_id=conversation_id,
    )

    return ConversationMessagesResponse(
        conversation_id=conversation_id,
        messages=[
            MessageResponse(
                id=message[0],
                conversation_id=message[1],
                role=message[2],
                content=message[3],
                created_at=message[4],
            )
            for message in messages
        ],
    )

@router.post(
    "/assistant/stream",
)
def project_assistant_stream(
    request: ProjectAssistantRequest,
    current_user_id: int = Depends(get_current_user),
):
    # --------------------------------------------------------
    # Validate project ownership
    # --------------------------------------------------------

    project = get_user_project(
        project_id=request.project_id,
        owner_id=current_user_id,
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    # --------------------------------------------------------
    # Create or validate conversation
    # --------------------------------------------------------

    if request.conversation_id is None:
        conversation = create_conversation(
            project_id=request.project_id,
            user_id=current_user_id,
        )

        conversation_id = conversation[0]

        # Use the first question as the conversation title.
        update_conversation_title(
            conversation_id=conversation_id,
            title=request.question[:255],
        )

    else:
        conversation = get_conversation_by_id(
            conversation_id=request.conversation_id,
            project_id=request.project_id,
            user_id=current_user_id,
        )

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        conversation_id = request.conversation_id

    # --------------------------------------------------------
    # Save user message
    # --------------------------------------------------------

    create_message(
        conversation_id=conversation_id,
        role="user",
        content=request.question,
    )

    # --------------------------------------------------------
    # Stream AI response
    # --------------------------------------------------------

    def generate():
        full_answer = ""

        # Send conversation ID to frontend first.
        yield f"data: [CONVERSATION_ID:{conversation_id}]\n\n"

        try:
            for chunk in stream_project_assistant(
                project_id=request.project_id,
                question=request.question,
            ):
                full_answer += chunk
                yield f"data: {chunk}\n\n"

            # ------------------------------------------------
            # Save complete assistant response
            # ------------------------------------------------

            create_message(
                conversation_id=conversation_id,
                role="assistant",
                content=full_answer,
            )

            # ------------------------------------------------
            # Update conversation timestamp
            # ------------------------------------------------

            update_conversation_timestamp(
                conversation_id=conversation_id,
            )

            yield "data: [DONE]\n\n"

        except Exception:
            # Do not save an incomplete assistant response.
            yield "data: [ERROR]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )