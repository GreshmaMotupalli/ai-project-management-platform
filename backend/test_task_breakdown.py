from app.services.ai.task_breakdown import generate_task_breakdown


requirement = """
Users should be able to create projects, add team members,
and assign development tasks to those members.
"""


result = generate_task_breakdown(requirement)

print("\nAI TASK BREAKDOWN:\n")
print(result)