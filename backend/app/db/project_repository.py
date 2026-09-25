from app.db.database import get_database_connection


def create_project(
    name: str,
    description: str,
    status: str,
    owner_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO projects (
                    name,
                    description,
                    status,
                    owner_id
                )
                VALUES (%s, %s, %s, %s)
                RETURNING
                    id,
                    name,
                    description,
                    status,
                    owner_id,
                    created_at,
                    updated_at;
                """,
                (
                    name,
                    description,
                    status,
                    owner_id,
                ),
            )

            project = cursor.fetchone()
            connection.commit()

            return project

    finally:
        connection.close()


def get_projects_by_owner(owner_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    description,
                    status,
                    owner_id,
                    created_at,
                    updated_at
                FROM projects
                WHERE owner_id = %s
                ORDER BY created_at DESC;
                """,
                (owner_id,),
            )

            projects = cursor.fetchall()

            return projects

    finally:
        connection.close()


def get_project_by_id(project_id: int, owner_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    description,
                    status,
                    owner_id,
                    created_at,
                    updated_at
                FROM projects
                WHERE id = %s
                  AND owner_id = %s;
                """,
                (project_id, owner_id),
            )

            project = cursor.fetchone()

            return project

    finally:
        connection.close()


def update_project(
    project_id: int,
    owner_id: int,
    name: str,
    description: str,
    status: str,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE projects
                SET
                    name = %s,
                    description = %s,
                    status = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                  AND owner_id = %s
                RETURNING
                    id,
                    name,
                    description,
                    status,
                    owner_id,
                    created_at,
                    updated_at;
                """,
                (
                    name,
                    description,
                    status,
                    project_id,
                    owner_id,
                ),
            )

            project = cursor.fetchone()
            connection.commit()

            return project

    finally:
        connection.close()


def delete_project(project_id: int, owner_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM projects
                WHERE id = %s
                  AND owner_id = %s
                RETURNING id;
                """,
                (project_id, owner_id),
            )

            deleted_project = cursor.fetchone()
            connection.commit()

            return deleted_project

    finally:
        connection.close()