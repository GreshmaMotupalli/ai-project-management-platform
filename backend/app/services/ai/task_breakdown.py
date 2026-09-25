import json

from langchain_core.prompts import PromptTemplate

from app.schemas.ai import GeneratedTask
from app.services.ai.llm import llm
from app.services.ai.prompts import TASK_BREAKDOWN_PROMPT


def generate_task_breakdown(requirement: str):
    prompt = PromptTemplate(
        template=TASK_BREAKDOWN_PROMPT,
        input_variables=["requirement"],
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "requirement": requirement,
        }
    )

    try:
        raw_tasks = json.loads(response.content)
    except json.JSONDecodeError:
        raise ValueError("AI returned an invalid JSON response.")

    if not isinstance(raw_tasks, list):
        raise ValueError("AI response must be a list of tasks.")

    tasks = [
        GeneratedTask.model_validate(task)
        for task in raw_tasks
    ]

    return tasks