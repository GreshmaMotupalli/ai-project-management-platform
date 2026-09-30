from app.db.database import get_database_connection


def create_message(
    conversation_id: int,
    role: str,
    content: str,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO ai_messages (
                    conversation_id,
                    role,
                    content
                )
                VALUES (%s, %s, %s)
                RETURNING id, conversation_id, role,
                          content, created_at
                """,
                (
                    conversation_id,
                    role,
                    content,
                ),
            )

            message = cursor.fetchone()

        connection.commit()

        return message

    finally:
        connection.close()


def get_messages_by_conversation(
    conversation_id: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    conversation_id,
                    role,
                    content,
                    created_at
                FROM ai_messages
                WHERE conversation_id = %s
                ORDER BY created_at ASC
                """,
                (conversation_id,),
            )

            return cursor.fetchall()

    finally:
        connection.close()