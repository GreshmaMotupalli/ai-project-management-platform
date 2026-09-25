from app.db.database import get_database_connection


def create_activity(
    project_id,
    user_id,
    action,
    entity_type,
    entity_id,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO activities (
                    project_id,
                    user_id,
                    action,
                    entity_type,
                    entity_id
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING
                    id,
                    project_id,
                    user_id,
                    action,
                    entity_type,
                    entity_id,
                    created_at
                """,
                (
                    project_id,
                    user_id,
                    action,
                    entity_type,
                    entity_id,
                ),
            )

            activity = cursor.fetchone()

        connection.commit()

        return activity

    finally:
        connection.close()


def get_activities_by_project(project_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    user_id,
                    action,
                    entity_type,
                    entity_id,
                    created_at
                FROM activities
                WHERE project_id = %s
                ORDER BY created_at DESC
                """,
                (project_id,),
            )

            return cursor.fetchall()

    finally:
        connection.close()