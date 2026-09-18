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