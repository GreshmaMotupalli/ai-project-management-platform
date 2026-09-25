from app.db.project_repository import get_project_by_id
from app.db.team_repository import (
    add_team_member,
    create_team,
    delete_team,
    get_team_by_id,
    get_team_members,
    get_teams_by_project,
    remove_team_member,
    update_team,
)


def verify_project_owner(
    project_id: int,
    user_id: int,
):
    project = get_project_by_id(
        project_id=project_id,
        owner_id=user_id,
    )

    return project is not None


def create_new_team(
    name: str,
    project_id: int,
    user_id: int,
):
    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return create_team(
        name=name,
        project_id=project_id,
    )


def get_project_teams(
    project_id: int,
    user_id: int,
):
    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return get_teams_by_project(
        project_id=project_id,
    )


def get_user_team(
    team_id: int,
    user_id: int,
):
    team = get_team_by_id(
        team_id=team_id,
    )

    if team is None:
        return None

    project_id = team[2]

    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return team


def update_user_team(
    team_id: int,
    name: str,
    user_id: int,
):
    team = get_team_by_id(
        team_id=team_id,
    )

    if team is None:
        return None

    project_id = team[2]

    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return update_team(
        team_id=team_id,
        name=name,
    )


def delete_user_team(
    team_id: int,
    user_id: int,
):
    team = get_team_by_id(
        team_id=team_id,
    )

    if team is None:
        return None

    project_id = team[2]

    if not verify_project_owner(
        project_id=project_id,
        user_id=user_id,
    ):
        return None

    return delete_team(
        team_id=team_id,
    )


def add_user_to_team(
    team_id: int,
    new_user_id: int,
    current_user_id: int,
):
    team = get_team_by_id(
        team_id=team_id,
    )

    if team is None:
        return None

    project_id = team[2]

    if not verify_project_owner(
        project_id=project_id,
        user_id=current_user_id,
    ):
        return None

    return add_team_member(
        team_id=team_id,
        user_id=new_user_id,
    )


def get_users_in_team(
    team_id: int,
    current_user_id: int,
):
    team = get_team_by_id(
        team_id=team_id,
    )

    if team is None:
        return None

    project_id = team[2]

    if not verify_project_owner(
        project_id=project_id,
        user_id=current_user_id,
    ):
        return None

    return get_team_members(
        team_id=team_id,
    )


def remove_user_from_team(
    team_id: int,
    user_id: int,
    current_user_id: int,
):
    team = get_team_by_id(
        team_id=team_id,
    )

    if team is None:
        return None

    project_id = team[2]

    if not verify_project_owner(
        project_id=project_id,
        user_id=current_user_id,
    ):
        return None

    return remove_team_member(
        team_id=team_id,
        user_id=user_id,
    )