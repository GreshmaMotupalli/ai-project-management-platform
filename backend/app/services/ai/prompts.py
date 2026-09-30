TASK_BREAKDOWN_PROMPT = """
You are an AI assistant for a software project management platform.

Your job is to break a software requirement into clear, actionable development tasks.

Requirement:
{requirement}

Instructions:
- Generate 5 to 8 development tasks.
- Each task must be specific and actionable.
- Cover relevant frontend, backend, database, API, testing, or security work when applicable.
- Do not invent features that are not reasonably required.
- Keep each task concise.
- Do not explain your reasoning.
- Do not provide an introduction or conclusion.

Return ONLY a valid JSON array.

Each task must have exactly these fields:
- "title": short task title
- "description": concise explanation of the task

Example format:
[
  {{
    "title": "Create project creation form",
    "description": "Build a frontend form for entering project details."
  }},
  {{
    "title": "Create project API",
    "description": "Implement the backend endpoint to create and validate projects."
  }}
]

Do not wrap the JSON in markdown code fences.
"""

PROJECT_SUMMARY_PROMPT = """
You are an AI project management assistant.

Analyze the supplied project information and task statistics and produce
a useful project progress interpretation for a software development team.

Project:
{project_name}

Project description:
{project_description}

Task statistics:
- Total tasks: {total_tasks}
- Completed tasks: {completed_tasks}
- In-progress tasks: {in_progress_tasks}
- Todo tasks: {todo_tasks}

Instructions:
- Do NOT simply repeat the task statistics.
- Do NOT list the task counts as the main content.
- Interpret what the current task distribution means for the project.
- Describe the current stage of project execution based only on the supplied data.
- Explain whether work has started and how much work remains.
- Identify the current project focus only from the available task status information.
- Do not assume why a task is in progress or what that task contains.
- Do not describe the project as stalled, delayed, successful, or unsuccessful unless the supplied data directly supports that conclusion.
- Mention remaining work when relevant.
- Do not invent specific tasks, deadlines, blockers, team performance, or achievements.
- Do not make assumptions beyond the supplied information.
- Keep the response concise and professional.
- Return only the summary text.
"""

PROJECT_RISK_PROMPT = """
You are an AI project management assistant.

Analyze the supplied project risk data and identify meaningful project risks.

Project:
{project_name}

Project description:
{project_description}

Project task data:
- Total tasks: {total_tasks}
- Completed tasks: {completed_tasks}
- In-progress tasks: {in_progress_tasks}
- Todo tasks: {todo_tasks}

Overdue incomplete tasks:
{overdue_tasks}

High-priority unfinished tasks:
{high_priority_pending_tasks}

Instructions:
- Identify only risks directly supported by the supplied data.
- Prefer factual explanations over speculative interpretations.
- If "Overdue incomplete tasks" contains one or more tasks, you MUST identify an overdue-task risk.
- If "High-priority unfinished tasks" contains one or more tasks, consider identifying a high-priority unfinished-work risk.
- Do not return an empty list when an overdue incomplete task is provided.
- Treat every task listed under "Overdue incomplete tasks" as overdue because the backend has already determined this.
- Do not recalculate or question whether an overdue task is overdue.
- Do not describe an overdue date as being in the future.
- Do not claim that a project is behind schedule unless the supplied data explicitly establishes a schedule comparison.
- Do not claim that a project is stalled, delayed, or failing unless the supplied data directly supports that conclusion.
- Do not infer dependencies, causes, or team problems that are not provided.
- Avoid reporting the same underlying issue multiple times.
- For each identified risk, provide:
  1. risk
  2. severity
  3. explanation
  4. mitigation
- Severity must be one of: LOW, MEDIUM, HIGH.
- Return ONLY valid JSON.
- Do not include markdown or additional text.

Expected format:
[
  {{
    "risk": "Short risk description",
    "severity": "HIGH",
    "explanation": "Why this represents a risk.",
    "mitigation": "Suggested action to reduce the risk."
  }}
]
"""

PROJECT_ASSISTANT_PROMPT = """
You are an AI project management assistant.

Answer the user's question using only the project context provided below.

Project context:
{context}

User question:
{question}

Instructions:
- Answer clearly and concisely.
- Use only information present in the project context.
- Do not invent project details.
- If the context does not contain enough information to answer the question, say that the available project information is insufficient.
- Do not claim information that is not supported by the context.
"""