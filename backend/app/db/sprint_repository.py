from app.db.database import get_database_connection


def create_sprint(
    project_id,
    name,
    goal,
    start_date,
    end_date,
    status,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO sprints
                (
                    project_id,
                    name,
                    goal,
                    start_date,
                    end_date,
                    status
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING
                    id,
                    project_id,
                    name,
                    goal,
                    start_date,
                    end_date,
                    status,
                    created_at
                """,
                (
                    project_id,
                    name,
                    goal,
                    start_date,
                    end_date,
                    status,
                ),
            )

            sprint = cursor.fetchone()
            connection.commit()

            return sprint

    finally:
        connection.close()


def get_sprint_by_id(sprint_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    name,
                    goal,
                    start_date,
                    end_date,
                    status,
                    created_at
                FROM sprints
                WHERE id = %s
                """,
                (sprint_id,),
            )

            return cursor.fetchone()

    finally:
        connection.close()


def get_sprints_by_project(project_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    name,
                    goal,
                    start_date,
                    end_date,
                    status,
                    created_at
                FROM sprints
                WHERE project_id = %s
                ORDER BY start_date ASC, id ASC
                """,
                (project_id,),
            )

            return cursor.fetchall()

    finally:
        connection.close()


def update_sprint(
    sprint_id,
    name,
    goal,
    start_date,
    end_date,
    status,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE sprints
                SET
                    name = %s,
                    goal = %s,
                    start_date = %s,
                    end_date = %s,
                    status = %s
                WHERE id = %s
                RETURNING
                    id,
                    project_id,
                    name,
                    goal,
                    start_date,
                    end_date,
                    status,
                    created_at
                """,
                (
                    name,
                    goal,
                    start_date,
                    end_date,
                    status,
                    sprint_id,
                ),
            )

            sprint = cursor.fetchone()
            connection.commit()

            return sprint

    finally:
        connection.close()


def delete_sprint(sprint_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM sprints
                WHERE id = %s
                RETURNING id
                """,
                (sprint_id,),
            )

            deleted_sprint = cursor.fetchone()
            connection.commit()

            return deleted_sprint

    finally:
        connection.close()