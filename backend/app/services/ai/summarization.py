from langchain_core.prompts import PromptTemplate

from app.services.ai.llm import llm
from app.services.ai.prompts import PROJECT_SUMMARY_PROMPT


def generate_project_summary(
    project_name: str,
    project_description: str,
    total_tasks: int,
    completed_tasks: int,
    in_progress_tasks: int,
    todo_tasks: int,
):
    prompt = PromptTemplate(
        template=PROJECT_SUMMARY_PROMPT,
        input_variables=[
            "project_name",
            "project_description",
            "total_tasks",
            "completed_tasks",
            "in_progress_tasks",
            "todo_tasks",
        ],
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "project_name": project_name,
            "project_description": project_description,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "todo_tasks": todo_tasks,
        }
    )

    return response.content.strip()