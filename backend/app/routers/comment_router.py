from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user

from app.schemas.comments import (
    CommentCreateRequest,
    CommentResponse,
)

from app.services import comment_service


router = APIRouter(
    prefix="/api/comments",
    tags=["Comments"],
)


@router.post(
    "",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    request: CommentCreateRequest,
    current_user_id: int = Depends(get_current_user),
):
    comment = comment_service.create_comment(
        task_id=request.task_id,
        content=request.content,
        current_user_id=current_user_id,
    )

    return CommentResponse(
        id=comment[0],
        task_id=comment[1],
        user_id=comment[2],
        content=comment[3],
        created_at=comment[4],
    )


@router.get(
    "/task/{task_id}",
    response_model=list[CommentResponse],
)
def get_task_comments(
    task_id: int,
    current_user_id: int = Depends(get_current_user),
):
    comments = comment_service.get_comments_by_task(
        task_id=task_id,
        current_user_id=current_user_id,
    )

    return [
        CommentResponse(
            id=comment[0],
            task_id=comment[1],
            user_id=comment[2],
            content=comment[3],
            created_at=comment[4],
        )
        for comment in comments
    ]


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    comment_id: int,
    current_user_id: int = Depends(get_current_user),
):
    comment_service.delete_comment(
        comment_id=comment_id,
        current_user_id=current_user_id,
    )

    return None