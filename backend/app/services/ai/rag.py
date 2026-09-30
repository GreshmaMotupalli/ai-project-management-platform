from pathlib import Path

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from app.db.activity_repository import get_activities_by_project
from app.db.comment_repository import get_comments_by_task
from app.db.project_repository import get_project_by_id
from app.db.sprint_repository import get_sprints_by_project
from app.db.task_repository import get_tasks_by_project


# Directory where ChromaDB will persist its data
CHROMA_DIR = Path("data/chroma")


# Local embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
)


# Project knowledge collection
vector_store = Chroma(
    collection_name="project_knowledge",
    embedding_function=embeddings,
    persist_directory=str(CHROMA_DIR),
)


def build_project_document(
    project_id: int,
    project_name: str,
    project_description: str,
    project_status: str,
):
    return (
        f"Project ID: {project_id}\n"
        f"Project Name: {project_name}\n"
        f"Project Description: {project_description}\n"
        f"Project Status: {project_status}"
    )


def build_task_document(task):
    return (
        f"Task ID: {task[0]}\n"
        f"Project ID: {task[1]}\n"
        f"Task Title: {task[4]}\n"
        f"Task Description: {task[5] or ''}\n"
        f"Status: {task[6]}\n"
        f"Priority: {task[7]}\n"
        f"Story Points: {task[8] if task[8] is not None else 'Not specified'}\n"
        f"Due Date: {task[9] if task[9] is not None else 'Not specified'}"
    )


def build_sprint_document(sprint):
    return (
        f"Sprint ID: {sprint[0]}\n"
        f"Project ID: {sprint[1]}\n"
        f"Sprint Name: {sprint[2]}\n"
        f"Sprint Goal: {sprint[3] or ''}\n"
        f"Start Date: {sprint[4]}\n"
        f"End Date: {sprint[5]}\n"
        f"Status: {sprint[6]}"
    )


def build_comment_document(comment, task_id: int):
    return (
        f"Comment ID: {comment[0]}\n"
        f"Task ID: {task_id}\n"
        f"Comment: {comment[3]}\n"
        f"Created At: {comment[4]}"
    )


def build_activity_document(activity):
    return (
        f"Activity ID: {activity[0]}\n"
        f"Project ID: {activity[1]}\n"
        f"Action: {activity[3]}\n"
        f"Entity Type: {activity[4]}\n"
        f"Entity ID: {activity[5]}\n"
        f"Created At: {activity[6]}"
    )


def index_project_knowledge(
    project_id: int,
    owner_id: int,
):
    project = get_project_by_id(
        project_id=project_id,
        owner_id=owner_id,
    )

    if project is None:
        return None

    # Remove existing knowledge for this project
    vector_store.delete(
    where={"project_id": project_id}
    )

    tasks = get_tasks_by_project(project_id)
    sprints = get_sprints_by_project(project_id)
    activities = get_activities_by_project(project_id)

    documents = []
    metadatas = []
    ids = []

    # -----------------------------
    # Project
    # -----------------------------

    documents.append(
        build_project_document(
            project_id=project[0],
            project_name=project[1],
            project_description=project[2] or "",
            project_status=project[3],
        )
    )

    metadatas.append(
        {
            "project_id": project_id,
            "source": "project",
        }
    )

    ids.append(
        f"project-{project_id}"
    )

    # -----------------------------
    # Tasks + Comments
    # -----------------------------

    for task in tasks:
        task_id = task[0]

        documents.append(
            build_task_document(task)
        )

        metadatas.append(
            {
                "project_id": project_id,
                "source": "task",
                "task_id": task_id,
            }
        )

        ids.append(
            f"project-{project_id}-task-{task_id}"
        )

        comments = get_comments_by_task(task_id)

        for comment in comments:
            comment_id = comment[0]

            documents.append(
                build_comment_document(
                    comment,
                    task_id,
                )
            )

            metadatas.append(
                {
                    "project_id": project_id,
                    "source": "comment",
                    "task_id": task_id,
                    "comment_id": comment_id,
                }
            )

            ids.append(
                f"project-{project_id}-comment-{comment_id}"
            )

    # -----------------------------
    # Sprints
    # -----------------------------

    for sprint in sprints:
        sprint_id = sprint[0]

        documents.append(
            build_sprint_document(sprint)
        )

        metadatas.append(
            {
                "project_id": project_id,
                "source": "sprint",
                "sprint_id": sprint_id,
            }
        )

        ids.append(
            f"project-{project_id}-sprint-{sprint_id}"
        )

    # -----------------------------
    # Activity
    # -----------------------------

    for activity in activities:
        activity_id = activity[0]

        documents.append(
            build_activity_document(activity)
        )

        metadatas.append(
            {
                "project_id": project_id,
                "source": "activity",
                "activity_id": activity_id,
            }
        )

        ids.append(
            f"project-{project_id}-activity-{activity_id}"
        )

    # -----------------------------
    # Store in ChromaDB
    # -----------------------------

    if documents:
        vector_store.add_texts(
            texts=documents,
            metadatas=metadatas,
            ids=ids,
        )

    return {
        "project_id": project_id,
        "documents_indexed": len(documents),
    }


def search_project_knowledge(
    project_id: int,
    query: str,
    k: int = 4,
):
    return vector_store.similarity_search(
        query,
        k=k,
        filter={
            "project_id": project_id,
        },
    )


def get_project_knowledge(
    project_id: int,
    owner_id: int,
):
    project = get_project_by_id(
        project_id=project_id,
        owner_id=owner_id,
    )

    if project is None:
        return None

    return build_project_document(
        project_id=project[0],
        project_name=project[1],
        project_description=project[2] or "",
        project_status=project[3],
    )

def build_rag_context(
    project_id: int,
    query: str,
    k: int = 4,
):
    documents = search_project_knowledge(
        project_id=project_id,
        query=query,
        k=k,
    )

    if not documents:
        return ""

    context_parts = []

    for document in documents:
        context_parts.append(
            document.page_content
        )

    return "\n\n---\n\n".join(context_parts)