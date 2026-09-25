from app.db.database import get_database_connection


def create_task(
    project_id: int,
    sprint_id: int | None,
    assigned_to: int | None,
    title: str,
    description: str | None,
    status: str,
    priority: str,
    story_points: int | None,
    due_date,
    created_by: int,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO tasks (
                    project_id,
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    created_by
                )
                VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
                RETURNING
                    id,
                    project_id,
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    created_by,
                    created_at,
                    updated_at;
                """,
                (
                    project_id,
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    created_by,
                ),
            )

            task = cursor.fetchone()
            connection.commit()

            return task

    finally:
        connection.close()


def get_task_by_id(task_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    created_by,
                    created_at,
                    updated_at
                FROM tasks
                WHERE id = %s;
                """,
                (task_id,),
            )

            return cursor.fetchone()

    finally:
        connection.close()


def get_tasks_by_project(project_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id,
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    created_by,
                    created_at,
                    updated_at
                FROM tasks
                WHERE project_id = %s
                ORDER BY created_at DESC;
                """,
                (project_id,),
            )

            return cursor.fetchall()

    finally:
        connection.close()


def update_task(
    task_id: int,
    sprint_id: int | None,
    assigned_to: int | None,
    title: str,
    description: str | None,
    status: str,
    priority: str,
    story_points: int | None,
    due_date,
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE tasks
                SET
                    sprint_id = %s,
                    assigned_to = %s,
                    title = %s,
                    description = %s,
                    status = %s,
                    priority = %s,
                    story_points = %s,
                    due_date = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING
                    id,
                    project_id,
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    created_by,
                    created_at,
                    updated_at;
                """,
                (
                    sprint_id,
                    assigned_to,
                    title,
                    description,
                    status,
                    priority,
                    story_points,
                    due_date,
                    task_id,
                ),
            )

            task = cursor.fetchone()
            connection.commit()

            return task

    finally:
        connection.close()


def delete_task(task_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM tasks
                WHERE id = %s
                RETURNING id;
                """,
                (task_id,),
            )

            deleted_task = cursor.fetchone()
            connection.commit()

            return deleted_task

    finally:
        connection.close()