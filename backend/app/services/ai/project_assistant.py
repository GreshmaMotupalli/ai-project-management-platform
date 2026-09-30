from langchain_core.prompts import PromptTemplate

from app.services.ai.llm import llm
from app.services.ai.prompts import PROJECT_ASSISTANT_PROMPT
from app.services.ai.rag import build_rag_context


def ask_project_assistant(project_id: int, question: str):
    context = build_rag_context(
        project_id=project_id,
        query=question,
        k=4,
    )

    if not context:
        return "I could not find relevant information in the project knowledge."

    prompt = PromptTemplate(
        template=PROJECT_ASSISTANT_PROMPT,
        input_variables=["context", "question"],
    )

    chain = prompt | llm

    response = chain.invoke(
        {
            "context": context,
            "question": question,
        }
    )

    return response.content.strip()


def stream_project_assistant(project_id: int, question: str):
    context = build_rag_context(
        project_id=project_id,
        query=question,
        k=4,
    )

    if not context:
        yield "I could not find relevant information in the project knowledge."
        return

    prompt = PromptTemplate(
        template=PROJECT_ASSISTANT_PROMPT,
        input_variables=["context", "question"],
    )

    chain = prompt | llm

    for chunk in chain.stream(
        {
            "context": context,
            "question": question,
        }
    ):
        content = chunk.content

        if content:
            yield content