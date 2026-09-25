from app.db.database import get_database_connection


def get_dashboard_summary(owner_id):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM projects
                        WHERE owner_id = %s
                    ) AS total_projects,

                    (
                        SELECT COUNT(*)
                        FROM projects
                        WHERE owner_id = %s
                        AND status = 'ACTIVE'
                    ) AS active_projects,

                    (
                        SELECT COUNT(*)
                        FROM projects
                        WHERE owner_id = %s
                        AND status = 'COMPLETED'
                    ) AS completed_projects,

                    (
                        SELECT COUNT(*)
                        FROM projects
                        WHERE owner_id = %s
                        AND status = 'ARCHIVED'
                    ) AS archived_projects,

                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        INNER JOIN projects p
                            ON t.project_id = p.id
                        WHERE p.owner_id = %s
                    ) AS total_tasks,

                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        INNER JOIN projects p
                            ON t.project_id = p.id
                        WHERE p.owner_id = %s
                        AND t.status = 'TODO'
                    ) AS todo_tasks,

                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        INNER JOIN projects p
                            ON t.project_id = p.id
                        WHERE p.owner_id = %s
                        AND t.status = 'IN_PROGRESS'
                    ) AS in_progress_tasks,

                    (
                        SELECT COUNT(*)
                        FROM tasks t
                        INNER JOIN projects p
                            ON t.project_id = p.id
                        WHERE p.owner_id = %s
                        AND t.status = 'DONE'
                    ) AS completed_tasks,

                    (
                        SELECT COUNT(*)
                        FROM sprints s
                        INNER JOIN projects p
                            ON s.project_id = p.id
                        WHERE p.owner_id = %s
                    ) AS total_sprints,

                    (
                        SELECT COUNT(*)
                        FROM sprints s
                        INNER JOIN projects p
                            ON s.project_id = p.id
                        WHERE p.owner_id = %s
                        AND s.status = 'PLANNED'
                    ) AS planned_sprints,

                    (
                        SELECT COUNT(*)
                        FROM sprints s
                        INNER JOIN projects p
                            ON s.project_id = p.id
                        WHERE p.owner_id = %s
                        AND s.status = 'ACTIVE'
                    ) AS active_sprints,

                    (
                        SELECT COUNT(*)
                        FROM sprints s
                        INNER JOIN projects p
                            ON s.project_id = p.id
                        WHERE p.owner_id = %s
                        AND s.status = 'COMPLETED'
                    ) AS completed_sprints
                """,
                (
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                    owner_id,
                ),
            )

            result = cursor.fetchone()

            return {
                "total_projects": result[0],
                "active_projects": result[1],
                "completed_projects": result[2],
                "archived_projects": result[3],
                "total_tasks": result[4],
                "todo_tasks": result[5],
                "in_progress_tasks": result[6],
                "completed_tasks": result[7],
                "total_sprints": result[8],
                "planned_sprints": result[9],
                "active_sprints": result[10],
                "completed_sprints": result[11],
            }

    finally:
        connection.close()