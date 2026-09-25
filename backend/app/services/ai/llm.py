from langchain_ollama import ChatOllama


llm = ChatOllama(
    model="qwen3:4b-instruct",
    temperature=0,
)