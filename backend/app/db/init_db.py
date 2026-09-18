from pathlib import Path

import psycopg

from app.core.config import (
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASSWORD,
)


def initialize_database():
    schema_path = Path(__file__).with_name("schema.sql")
    schema = schema_path.read_text(encoding="utf-8")

    connection = psycopg.connect(
        host=DATABASE_HOST,
        port=DATABASE_PORT,
        dbname=DATABASE_NAME,
        user=DATABASE_USER,
        password=DATABASE_PASSWORD,
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute(schema)

        connection.commit()
        print("Database schema created successfully.")

    finally:
        connection.close()


if __name__ == "__main__":
    initialize_database()