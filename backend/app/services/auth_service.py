from app.db.user_repository import create_user, get_user_by_email
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)


def register_user(name: str, email: str, password: str):
    # Check whether the email already exists
    existing_user = get_user_by_email(email)

    if existing_user:
        raise ValueError("Email already registered")

    # Hash the password before storing it
    password_hash = hash_password(password)

    # Create the user in PostgreSQL
    user = create_user(
        name=name,
        email=email,
        password_hash=password_hash,
    )

    return user


def login_user(email: str, password: str):
    # Find the user
    user = get_user_by_email(email)

    if user is None:
        raise ValueError("Invalid email or password")

    # Check the entered password against the stored hash
    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid email or password")

    # Create JWT token
    access_token = create_access_token(user["id"])

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }