from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user

from app.schemas.teams import (
    TeamCreateRequest,
    TeamUpdateRequest,
    TeamResponse,
    TeamMemberAddRequest,
    TeamMemberResponse,
)

from app.services.team_service import (
    create_new_team,
    get_project_teams,
    get_user_team,
    update_user_team,
    delete_user_team,
    add_user_to_team,
    get_users_in_team,
    remove_user_from_team,
)


router = APIRouter(
    prefix="/api/teams",
    tags=["Teams"],
)


def team_to_response(team):
    return {
        "id": team[0],
        "name": team[1],
        "project_id": team[2],
        "created_at": team[3],
    }


def member_to_response(member):
    return {
        "id": member[0],
        "team_id": member[1],
        "user_id": member[2],
        "name": member[3],
        "email": member[4],
        "role": member[5],
    }


@router.post(
    "",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_team(
    request: TeamCreateRequest,
    current_user_id: int = Depends(get_current_user),
):
    team = create_new_team(
        name=request.name,
        project_id=request.project_id,
        user_id=current_user_id,
    )

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    return team_to_response(team)


@router.get(
    "/project/{project_id}",
    response_model=list[TeamResponse],
)
def get_project_teams_route(
    project_id: int,
    current_user_id: int = Depends(get_current_user),
):
    teams = get_project_teams(
        project_id=project_id,
        user_id=current_user_id,
    )

    if teams is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied",
        )

    return [
        team_to_response(team)
        for team in teams
    ]


@router.get(
    "/{team_id}",
    response_model=TeamResponse,
)
def get_team(
    team_id: int,
    current_user_id: int = Depends(get_current_user),
):
    team = get_user_team(
        team_id=team_id,
        user_id=current_user_id,
    )

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    return team_to_response(team)


@router.put(
    "/{team_id}",
    response_model=TeamResponse,
)
def update_team(
    team_id: int,
    request: TeamUpdateRequest,
    current_user_id: int = Depends(get_current_user),
):
    team = update_user_team(
        team_id=team_id,
        name=request.name,
        user_id=current_user_id,
    )

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    return team_to_response(team)


@router.delete(
    "/{team_id}",
)
def delete_team(
    team_id: int,
    current_user_id: int = Depends(get_current_user),
):
    deleted_team = delete_user_team(
        team_id=team_id,
        user_id=current_user_id,
    )

    if deleted_team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    return {
        "message": "Team deleted successfully",
        "team_id": team_id,
    }


@router.post(
    "/{team_id}/members",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    team_id: int,
    request: TeamMemberAddRequest,
    current_user_id: int = Depends(get_current_user),
):
    member = add_user_to_team(
        team_id=team_id,
        new_user_id=request.user_id,
        current_user_id=current_user_id,
    )

    if member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or access denied",
        )

    # Fetch the member again so the response contains
    # name, email, and role.
    members = get_users_in_team(
        team_id=team_id,
        current_user_id=current_user_id,
    )

    for existing_member in members:
        if existing_member[0] == member[0]:
            return member_to_response(existing_member)

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to retrieve added member",
    )


@router.get(
    "/{team_id}/members",
    response_model=list[TeamMemberResponse],
)
def get_members(
    team_id: int,
    current_user_id: int = Depends(get_current_user),
):
    members = get_users_in_team(
        team_id=team_id,
        current_user_id=current_user_id,
    )

    if members is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or access denied",
        )

    return [
        member_to_response(member)
        for member in members
    ]


@router.delete(
    "/{team_id}/members/{user_id}",
)
def remove_member(
    team_id: int,
    user_id: int,
    current_user_id: int = Depends(get_current_user),
):
    removed_member = remove_user_from_team(
        team_id=team_id,
        user_id=user_id,
        current_user_id=current_user_id,
    )

    if removed_member is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found or access denied",
        )

    return {
        "message": "Team member removed successfully",
        "team_id": team_id,
        "user_id": user_id,
    }