from app.db import dashboard_repository


def get_dashboard_summary(current_user_id):
    return dashboard_repository.get_dashboard_summary(
        owner_id=current_user_id
    )