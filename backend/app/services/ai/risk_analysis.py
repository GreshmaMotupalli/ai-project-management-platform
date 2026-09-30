from datetime import date


def build_project_risk_data(tasks):
    total_tasks = len(tasks)

    completed_tasks = sum(
        1 for task in tasks
        if task[6] == "DONE"
    )

    in_progress_tasks = sum(
        1 for task in tasks
        if task[6] == "IN_PROGRESS"
    )

    todo_tasks = sum(
        1 for task in tasks
        if task[6] == "TODO"
    )

    overdue_tasks = []

    for task in tasks:
        status = task[6]
        due_date = task[9]

        if (
            due_date is not None
            and due_date < date.today()
            and status != "DONE"
        ):
            overdue_tasks.append(
                {
                    "title": task[4],
                    "status": status,
                    "priority": task[7],
                    "due_date": due_date.isoformat(),
                }
            )

    high_priority_pending_tasks = []

    for task in tasks:
        status = task[6]
        priority = task[7]

        if priority == "HIGH" and status != "DONE":
            high_priority_pending_tasks.append(
                {
                    "title": task[4],
                    "status": status,
                    "due_date": (
                        task[9].isoformat()
                        if task[9] is not None
                        else None
                    ),
                }
            )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "todo_tasks": todo_tasks,
        "overdue_tasks": overdue_tasks,
        "high_priority_pending_tasks": high_priority_pending_tasks,
    }


import json

from langchain_core.prompts import PromptTemplate

from app.schemas.ai import ProjectRisk
from app.services.ai.llm import llm
from app.services.ai.prompts import PROJECT_RISK_PROMPT


def generate_project_risks(
    project_name: str,
    project_description: str,
    risk_data: dict,
):
    prompt = PromptTemplate(
        template=PROJECT_RISK_PROMPT,
        input_variables=[
            "project_name",
            "project_description",
            "total_tasks",
            "completed_tasks",
            "in_progress_tasks",
            "todo_tasks",
            "overdue_tasks",
            "high_priority_pending_tasks",
        ],
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "project_name": project_name,
            "project_description": project_description,
            "total_tasks": risk_data["total_tasks"],
            "completed_tasks": risk_data["completed_tasks"],
            "in_progress_tasks": risk_data["in_progress_tasks"],
            "todo_tasks": risk_data["todo_tasks"],
            "overdue_tasks": json.dumps(
                risk_data["overdue_tasks"],
                indent=2,
            ),
            "high_priority_pending_tasks": json.dumps(
                risk_data["high_priority_pending_tasks"],
                indent=2,
            ),
        }
    )

    try:
        raw_risks = json.loads(response.content)
    except json.JSONDecodeError:
        raise ValueError("AI returned an invalid JSON response.")

    if not isinstance(raw_risks, list):
        raise ValueError("AI response must be a list of risks.")

    risks = [
        ProjectRisk.model_validate(risk)
        for risk in raw_risks
    ]

    return risks