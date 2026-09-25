from app.db.database import get_database_connection


def create_team(
    name: str,
    project_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO teams (
                    name,
                    project_id
                )
                VALUES (%s, %s)
                RETURNING
                    id,
                    name,
                    project_id,
                    created_at;
                """,
                (
                    name,
                    project_id,
                ),
            )

            team = cursor.fetchone()

            connection.commit()

            return team

    finally:
        connection.close()


def get_team_by_id(
    team_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    project_id,
                    created_at
                FROM teams
                WHERE id = %s;
                """,
                (team_id,),
            )

            team = cursor.fetchone()

            return team

    finally:
        connection.close()


def get_teams_by_project(
    project_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    project_id,
                    created_at
                FROM teams
                WHERE project_id = %s
                ORDER BY created_at DESC;
                """,
                (project_id,),
            )

            teams = cursor.fetchall()

            return teams

    finally:
        connection.close()


def update_team(
    team_id: int,
    name: str,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE teams
                SET name = %s
                WHERE id = %s
                RETURNING
                    id,
                    name,
                    project_id,
                    created_at;
                """,
                (
                    name,
                    team_id,
                ),
            )

            team = cursor.fetchone()

            connection.commit()

            return team

    finally:
        connection.close()


def delete_team(
    team_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM teams
                WHERE id = %s
                RETURNING id;
                """,
                (team_id,),
            )

            deleted_team = cursor.fetchone()

            connection.commit()

            return deleted_team

    finally:
        connection.close()


def add_team_member(
    team_id: int,
    user_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO team_members (
                    team_id,
                    user_id
                )
                VALUES (%s, %s)
                RETURNING
                    id,
                    team_id,
                    user_id;
                """,
                (
                    team_id,
                    user_id,
                ),
            )

            member = cursor.fetchone()

            connection.commit()

            return member

    finally:
        connection.close()


def get_team_members(
    team_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    tm.id,
                    tm.team_id,
                    tm.user_id,
                    u.name,
                    u.email,
                    u.role
                FROM team_members tm
                JOIN users u
                    ON u.id = tm.user_id
                WHERE tm.team_id = %s
                ORDER BY u.name;
                """,
                (team_id,),
            )

            members = cursor.fetchall()

            return members

    finally:
        connection.close()


def remove_team_member(
    team_id: int,
    user_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM team_members
                WHERE team_id = %s
                  AND user_id = %s
                RETURNING id;
                """,
                (
                    team_id,
                    user_id,
                ),
            )

            removed_member = cursor.fetchone()

            connection.commit()

            return removed_member

    finally:
        connection.close()