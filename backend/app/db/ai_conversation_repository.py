from app.db.database import get_database_connection


def create_conversation(
    project_id: int,
    user_id: int,
    title: str = "New Chat",
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_conversations (
                    project_id,
                    user_id,
                    title
                )
                VALUES (%s, %s, %s)
                RETURNING id, project_id, user_id, title,
                          created_at, updated_at
                """,
                (
                    project_id,
                    user_id,
                    title,
                ),
            )

            conversation = cursor.fetchone()

        connection.commit()

        return conversation

    finally:
        connection.close()


def get_conversations_by_project(
    project_id: int,
    user_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    user_id,
                    title,
                    created_at,
                    updated_at
                FROM ai_conversations
                WHERE project_id = %s
                  AND user_id = %s
                ORDER BY updated_at DESC
                """,
                (
                    project_id,
                    user_id,
                ),
            )

            return cursor.fetchall()

    finally:
        connection.close()


def get_conversation_by_id(
    conversation_id: int,
    project_id: int,
    user_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    user_id,
                    title,
                    created_at,
                    updated_at
                FROM ai_conversations
                WHERE id = %s
                  AND project_id = %s
                  AND user_id = %s
                """,
                (
                    conversation_id,
                    project_id,
                    user_id,
                ),
            )

            return cursor.fetchone()

    finally:
        connection.close()


def update_conversation_timestamp(
    conversation_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_conversations
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (conversation_id,),
            )

        connection.commit()

    finally:
        connection.close()

def update_conversation_title(
    conversation_id: int,
    title: str,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_conversations
                SET title = %s
                WHERE id = %s
                """,
                (
                    title,
                    conversation_id,
                ),
            )

        connection.commit()

    finally:
        connection.close()