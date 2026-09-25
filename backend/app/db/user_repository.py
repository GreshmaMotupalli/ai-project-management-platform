from app.db.database import get_database_connection


def get_user_by_email(email: str):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, email, password_hash, role
                FROM users
                WHERE email = %s
                """,
                (email,),
            )

            row = cursor.fetchone()

            if row is None:
                return None

            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "password_hash": row[3],
                "role": row[4],
            }

    finally:
        connection.close()


def create_user(
    name: str,
    email: str,
    password_hash: str,
    role: str = "DEVELOPER",
):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (name, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, email, password_hash, role
                """,
                (name, email, password_hash, role),
            )

            row = cursor.fetchone()

        connection.commit()

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "password_hash": row[3],
            "role": row[4],
        }

    finally:
        connection.close()

def get_user_by_id(user_id: int):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, name, email, password_hash, role
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )

            row = cursor.fetchone()

            if row is None:
                return None

            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "password_hash": row[3],
                "role": row[4],
            }

    finally:
        connection.close()

def get_users(search: str | None = None):
    connection = get_database_connection()

    try:
        with connection.cursor() as cursor:
            if search:
                cursor.execute(
                    """
                    SELECT id, name, email, role
                    FROM users
                    WHERE name ILIKE %s
                       OR email ILIKE %s
                    ORDER BY name
                    """,
                    (f"%{search}%", f"%{search}%"),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, name, email, role
                    FROM users
                    ORDER BY name
                    """
                )

            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "role": row[3],
                }
                for row in rows
            ]

    finally:
        connection.close()