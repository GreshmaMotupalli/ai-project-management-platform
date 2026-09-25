import psycopg

from app.db.database import get_database_connection


def create_comment(
    task_id,
    user_id,
    content,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO comments (
                    task_id,
                    user_id,
                    content
                )
                VALUES (%s, %s, %s)
                RETURNING
                    id,
                    task_id,
                    user_id,
                    content,
                    created_at
                """,
                (
                    task_id,
                    user_id,
                    content,
                ),
            )

            comment = cursor.fetchone()

        connection.commit()

        return comment

    finally:
        connection.close()


def get_comment_by_id(comment_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    task_id,
                    user_id,
                    content,
                    created_at
                FROM comments
                WHERE id = %s
                """,
                (comment_id,),
            )

            return cursor.fetchone()

    finally:
        connection.close()


def get_comments_by_task(task_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    task_id,
                    user_id,
                    content,
                    created_at
                FROM comments
                WHERE task_id = %s
                ORDER BY created_at ASC
                """,
                (task_id,),
            )

            return cursor.fetchall()

    finally:
        connection.close()


def delete_comment(comment_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM comments
                WHERE id = %s
                RETURNING
                    id,
                    task_id,
                    user_id,
                    content,
                    created_at
                """,
                (comment_id,),
            )

            comment = cursor.fetchone()

        connection.commit()

        return comment

    finally:
        connection.close()