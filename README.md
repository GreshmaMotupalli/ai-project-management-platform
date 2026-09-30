````markdown
# AI-Powered Project Management & Development Platform

An AI-powered full-stack project management and development platform designed to combine traditional project management features with Generative AI capabilities.

The platform supports project management, team management, task tracking, Kanban workflows, sprints, AI-powered task breakdown, project summaries, risk analysis, RAG-based project assistance, streaming responses, and persistent AI conversations.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [AI Features](#ai-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Application Architecture](#application-architecture)
- [Project Structure](#project-structure)
- [Database](#database)
- [Authentication](#authentication)
- [Project Management Flow](#project-management-flow)
- [AI Architecture](#ai-architecture)
- [RAG Architecture](#rag-architecture)
- [AI Project Assistant](#ai-project-assistant)
- [Streaming AI Responses](#streaming-ai-responses)
- [Conversation Persistence](#conversation-persistence)
- [Setup and Installation](#setup-and-installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [PostgreSQL Setup](#postgresql-setup)
- [Ollama Setup](#ollama-setup)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)
- [Learning Outcomes](#learning-outcomes)

---

# Project Overview

The **AI-Powered Project Management & Development Platform** is a full-stack web application that combines project management functionality with Generative AI.

The platform allows users to:

- Register and log in securely.
- Create and manage projects.
- Manage teams and team members.
- Create, update, assign, and track tasks.
- Organize work using Kanban-style workflows.
- Manage sprints.
- Generate tasks automatically from requirements using AI.
- Generate project summaries using AI.
- Analyze project risks using AI.
- Search project information using Retrieval-Augmented Generation (RAG).
- Ask questions about project data through an AI Project Assistant.
- Receive AI responses through real-time streaming.
- Maintain persistent AI conversation history.

The system is designed so that the React frontend communicates with the FastAPI backend, while the backend handles PostgreSQL operations and AI processing.

---

# Objectives

The main objectives of the project are:

1. Build a complete full-stack project management application.
2. Implement secure authentication using JWT.
3. Use PostgreSQL for persistent application data.
4. Build REST APIs using FastAPI.
5. Build a responsive React frontend.
6. Integrate Generative AI into a real-world software development workflow.
7. Implement Retrieval-Augmented Generation for project-specific answers.
8. Prevent the AI assistant from inventing project information.
9. Implement persistent AI conversations.
10. Implement streaming AI responses.
11. Provide a foundation for future agentic AI workflows.

---

# Key Features

## Authentication

- User registration
- User login
- JWT authentication
- Protected API endpoints
- Current-user retrieval
- Password hashing
- Authorization based on authenticated user

---

## Project Management

Users can:

- Create projects
- View projects
- Update projects
- Delete projects
- View project details
- Manage project ownership

Projects contain information such as:

- Project name
- Description
- Status
- Owner
- Created date
- Updated date

---

## Team Management

The platform supports:

- Team creation
- Team members
- User assignment
- Project/team relationships

The application distinguishes between:

- `users.id`
- `team_members.id`

This distinction is important when assigning tasks to users.

---

## Task Management

Users can:

- Create tasks
- Update tasks
- Delete tasks
- Assign tasks
- Set task priority
- Set task status
- Set story points
- Set due dates
- View project tasks

Task statuses include:

- TODO
- IN_PROGRESS
- COMPLETED

Tasks can also have priorities such as:

- LOW
- MEDIUM
- HIGH

---

## Kanban Workflow

Tasks can be organized according to their workflow state.

Example:

```text
TODO
  ↓
IN_PROGRESS
  ↓
COMPLETED
````

This provides a visual workflow for project development.

---

## Sprint Management

The platform supports sprint-based project planning.

Sprints can be used to organize tasks into development cycles and track progress over time.

---

# AI Features

The platform integrates Generative AI into project management.

Current AI functionality includes:

### 1. AI Task Breakdown

A user can provide a requirement such as:

```text
Build a user authentication system.
```

The AI can break the requirement into smaller development tasks.

Example:

```text
Requirement
     ↓
AI Task Breakdown
     ↓
Task 1
Task 2
Task 3
Task 4
```

The generated tasks can then be reviewed and selected before being added to the project.

---

### 2. AI Project Summary

The platform can generate a summary of the current project based on project information.

Example information can include:

* Project details
* Current tasks
* Task statuses
* Progress information

---

### 3. AI Risk Analysis

The AI can analyze available project information and identify visible risks or problems.

If sufficient information is not available, the assistant is instructed not to invent risks.

---

### 4. RAG-Based Project Assistant

The AI Project Assistant allows users to ask questions about their project.

Examples:

```text
What tasks are currently available?

What tasks are currently in progress?

Which tasks are completed?

What is this project about?

Which task has the highest priority?
```

The assistant retrieves relevant project information before generating the answer.

---

### 5. Streaming AI Responses

The Project Assistant supports real-time streaming.

Instead of waiting for the entire AI response:

```text
Request
   ↓
AI processing
   ↓
Complete response
```

the application streams the response:

```text
Request
   ↓
AI processing
   ↓
Chunk → Frontend
Chunk → Frontend
Chunk → Frontend
Chunk → Frontend
   ↓
Complete response
```

This provides a more interactive AI experience.

---

### 6. Persistent AI Conversations

AI conversations are stored in PostgreSQL.

The application supports:

* New Chat
* Conversation history
* Loading previous conversations
* Persistent messages
* Conversation titles
* User messages
* Assistant messages

Refreshing the page does not remove existing conversations.

---

# Technology Stack

## Frontend

* React
* Vite
* JavaScript
* Material UI
* React Router
* Redux Toolkit
* Axios

---

## Backend

* Python
* FastAPI
* Pydantic
* Uvicorn
* psycopg

The project intentionally uses `psycopg` for PostgreSQL access rather than SQLAlchemy.

---

## Database

* PostgreSQL
* pgAdmin

---

## Generative AI

* LangChain
* Ollama
* Qwen3
* ChromaDB
* HuggingFace Sentence Transformers

---

## AI / RAG Components

* LangChain
* RAG
* ChromaDB
* HuggingFace embeddings
* Ollama local LLM

---

# System Architecture

The high-level application architecture is:

```text
┌───────────────────────────────┐
│           React               │
│        Frontend               │
│                               │
│  Components                   │
│  Pages                        │
│  React Router                 │
│  Redux Toolkit                │
│  Axios                        │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                │
                ▼
┌───────────────────────────────┐
│           FastAPI             │
│          Backend              │
│                               │
│  Routers                      │
│  Services                     │
│  Repositories                 │
│  Authentication               │
│  AI Services                  │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌───────────────┐  ┌─────────────────┐
│  PostgreSQL   │  │   AI Services   │
│               │  │                 │
│ Users         │  │ LangChain       │
│ Projects      │  │ Ollama          │
│ Teams         │  │ ChromaDB        │
│ Tasks         │  │ RAG             │
│ Sprints       │  │ Embeddings      │
│ Conversations │  │                 │
│ Messages      │  │                 │
└───────────────┘  └─────────────────┘
```

---

# Application Architecture

The frontend communicates with FastAPI through HTTP requests.

```text
React
  │
  │ HTTP Request
  ▼
FastAPI
  │
  ├──────────────► PostgreSQL
  │
  └──────────────► AI Services
```

The React application does not directly communicate with PostgreSQL.

Instead:

```text
React
  ↓
FastAPI
  ↓
Repository Layer
  ↓
PostgreSQL
```

This keeps database operations inside the backend.

---

# AI Architecture

The AI architecture extends the normal backend architecture.

```text
React
  │
  │ HTTP
  ▼
FastAPI
  │
  ├──────────────► PostgreSQL
  │
  └──────────────► LangChain
                        │
                        ├── RAG
                        │
                        ├── ChromaDB
                        │
                        ├── Embeddings
                        │
                        └── Ollama / LLM
```

The current implementation uses LangChain, RAG, ChromaDB, embeddings, and Ollama.

LangGraph, MCP, and LangSmith are planned as future enhancements rather than required components of the current implementation.

---

# RAG Architecture

The Project Assistant uses Retrieval-Augmented Generation.

The general flow is:

```text
User Question
      │
      ▼
Question Embedding
      │
      ▼
ChromaDB Search
      │
      ▼
Relevant Project Documents
      │
      ▼
Project Context
      │
      ▼
Prompt + Context + Question
      │
      ▼
Ollama LLM
      │
      ▼
Answer
```

The assistant retrieves project-specific information before generating the answer.

---

# RAG Knowledge

The project information can be represented as documents for retrieval.

Examples include:

* Project information
* Tasks
* Task statuses
* Task priorities
* Other project-related information

The retrieved documents are combined into a project context.

The AI prompt then uses:

```text
Project Context
+
User Question
```

to generate the answer.

---

# AI Project Assistant

The AI Project Assistant is designed to answer project-specific questions.

Example:

```text
User:
What tasks are currently in progress?
```

The system performs:

```text
Question
   ↓
RAG Retrieval
   ↓
Relevant Tasks
   ↓
Prompt Construction
   ↓
LLM
   ↓
Answer
```

Example response:

```text
Task 6 is currently IN_PROGRESS.
```

The assistant is instructed to use only the retrieved project context.

---

# AI Grounding

The Project Assistant uses a grounding prompt to reduce hallucination.

The assistant follows rules such as:

* Answer using only the project context.
* Do not invent project details.
* Do not claim unsupported information.
* If sufficient information is unavailable, state that the available project information is insufficient.

For example:

```text
User:
Who is the CEO of this company?
```

If the project knowledge does not contain CEO information, the assistant should respond that the available project information is insufficient instead of inventing a person.

---

# Streaming AI Responses

The Project Assistant supports Server-Sent Events (SSE)-style streaming.

The backend returns:

```text
text/event-stream
```

The frontend reads the response using:

```text
ReadableStream
      ↓
Response Reader
      ↓
TextDecoder
      ↓
SSE Events
      ↓
React State
```

The backend sends:

```text
[CONVERSATION_ID:123]
```

followed by response chunks.

When the response is complete:

```text
[DONE]
```

If an error occurs:

```text
[ERROR]
```

---

# Conversation Persistence

AI conversations are persisted in PostgreSQL.

## `ai_conversations`

```sql
CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## `ai_messages`

```sql
CREATE TABLE IF NOT EXISTS ai_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    CHECK (role IN ('user', 'assistant'))
);
```

---

# Conversation Flow

When a user starts a new conversation:

```text
User Question
      ↓
Create Conversation
      ↓
Generate Conversation ID
      ↓
Save User Message
      ↓
Generate AI Response
      ↓
Save Assistant Message
      ↓
Update Conversation Timestamp
```

The first question is used as the conversation title.

Example:

```text
Question:
What tasks are currently available?
```

Conversation title:

```text
What tasks are currently available?
```

---

# Authentication

Authentication uses JWT tokens.

The general flow is:

```text
User
 ↓
Register
 ↓
Password Hash
 ↓
PostgreSQL
```

For login:

```text
User
 ↓
Login
 ↓
Verify Credentials
 ↓
Generate JWT
 ↓
Frontend
 ↓
localStorage
```

Authenticated API requests contain:

```text
Authorization: Bearer <token>
```

The backend validates the token before allowing access to protected resources.

---

# Frontend Authentication

The frontend stores the access token using:

```javascript
localStorage.getItem("access_token");
```

Axios automatically attaches the token to authenticated requests.

Example:

```text
React
 ↓
Axios
 ↓
Authorization: Bearer <token>
 ↓
FastAPI
 ↓
JWT Validation
 ↓
Protected Resource
```

---

# Project Structure

A simplified structure is:

```text
ai-project-management-platform/
│
├── backend/
│   │
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── projects.py
│   │   │   ├── tasks.py
│   │   │   ├── teams.py
│   │   │   └── ai.py
│   │   │
│   │   ├── services/
│   │   │   └── ai/
│   │   │       ├── llm.py
│   │   │       ├── prompts.py
│   │   │       ├── rag.py
│   │   │       └── project_assistant.py
│   │   │
│   │   ├── repositories/
│   │   │
│   │   ├── schemas/
│   │   │
│   │   ├── dependencies/
│   │   │
│   │   └── main.py
│   │
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   └── aiAPI.js
│   │   │
│   │   ├── components/
│   │   │
│   │   ├── pages/
│   │   │
│   │   ├── store/
│   │   │
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Database

PostgreSQL is used as the primary application database.

The database contains entities such as:

```text
users
projects
teams
team_members
tasks
sprints
ai_conversations
ai_messages
```

The database provides persistent storage for both project-management data and AI conversation history.

---

# Backend Architecture

The backend follows a layered structure.

```text
Router
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

For AI functionality:

```text
Router
  ↓
AI Service
  ↓
RAG / LangChain
  ↓
Ollama
```

This separation keeps API handling, business logic, database access, and AI logic organized.

---

# API Overview

The application provides REST API endpoints for major platform features.

Examples include:

```text
/api/auth/register
/api/auth/login
/api/auth/me
```

Project APIs:

```text
/api/projects
```

Task APIs:

```text
/api/tasks
```

AI APIs include:

```text
/api/ai/task-breakdown
/api/ai/project-summary
/api/ai/project-risks
/api/ai/assistant
/api/ai/assistant/stream
/api/ai/conversations
/api/ai/conversations/{conversation_id}/messages
```

The exact available endpoints can be viewed through FastAPI Swagger documentation.

---

# Local Development URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Setup and Installation

## Prerequisites

Install the following:

* Python
* Node.js
* npm
* PostgreSQL
* pgAdmin
* Ollama
* Git

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will run on:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

# PostgreSQL Setup

Create a PostgreSQL database.

Example:

```text
ai_project_manager
```

Configure the backend environment variables.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_project_manager
DB_USER=postgres
DB_PASSWORD=your_password
```

The exact environment variable names should match the backend configuration.

---

# Ollama Setup

Install Ollama and download the required model.

Example:

```bash
ollama pull qwen3:4b-instruct
```

Start Ollama if it is not already running.

The application uses Ollama to run the LLM locally.

---

# Embeddings

The RAG implementation uses:

```text
sentence-transformers/all-MiniLM-L6-v2
```

These embeddings are used to convert project information into vectors for semantic search.

---

# Running the Application

Start PostgreSQL.

Then start Ollama.

Start the backend:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Typical Application Flow

The overall application flow is:

```text
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Backend
 │
 ├──────────────► Authentication
 │
 ├──────────────► PostgreSQL
 │
 └──────────────► AI Services
                       │
                       ▼
                    LangChain
                       │
                       ├── RAG
                       │
                       ├── ChromaDB
                       │
                       └── Ollama
```

---

# AI Task Breakdown Flow

```text
User Requirement
      │
      ▼
React
      │
      ▼
FastAPI
      │
      ▼
LangChain
      │
      ▼
Ollama
      │
      ▼
Generated Tasks
      │
      ▼
User Reviews Tasks
      │
      ▼
Selected Tasks
      │
      ▼
PostgreSQL
```

---

# AI Project Summary Flow

```text
Project Data
     │
     ▼
FastAPI
     │
     ▼
AI Service
     │
     ▼
LLM
     │
     ▼
Project Summary
```

---

# AI Risk Analysis Flow

```text
Project Information
       │
       ▼
AI Service
       │
       ▼
LLM
       │
       ▼
Potential Risks
```

The assistant is instructed not to invent unsupported project risks.

---

# AI Assistant Flow

```text
User Question
      │
      ▼
FastAPI
      │
      ▼
Project Ownership Validation
      │
      ▼
RAG Retrieval
      │
      ▼
Relevant Project Context
      │
      ▼
LangChain Prompt
      │
      ▼
Ollama
      │
      ▼
AI Response
      │
      ▼
PostgreSQL
```

---

# Streaming Assistant Flow

```text
User Question
      │
      ▼
FastAPI
      │
      ▼
Create / Load Conversation
      │
      ▼
Save User Message
      │
      ▼
RAG
      │
      ▼
LLM Streaming
      │
      ├──────► Chunk 1
      ├──────► Chunk 2
      ├──────► Chunk 3
      ├──────► Chunk 4
      │
      ▼
Complete Response
      │
      ▼
Save Assistant Message
      │
      ▼
[DONE]
```

---

# Testing

The application was tested across the major functionality areas.

## Authentication Testing

Tested:

* User registration
* User login
* JWT authentication
* Current-user endpoint
* Protected routes

---

## Project Testing

Tested:

* Project creation
* Project retrieval
* Project update
* Project deletion
* Project ownership validation
* Non-existent project handling

---

## Task Testing

Tested:

* Task creation
* Task status
* Task priority
* Task assignment
* AI-generated task creation

---

## AI Testing

The AI Project Assistant was tested with questions such as:

```text
What tasks are currently available?
```

```text
What tasks are currently in progress?
```

```text
Which tasks are completed?
```

```text
What is this project about?
```

```text
Which task has the highest priority?
```

```text
Give me a summary of the current project tasks and their statuses.
```

---

## Grounding Testing

The assistant was also tested with questions outside the available project knowledge.

Example:

```text
Who is the CEO of this company?
```

The assistant returned an insufficient-information response instead of inventing information.

---

## Conversation Testing

Tested:

* New Chat
* Creating conversations
* Sending messages
* Saving messages
* Loading conversation history
* Switching conversations
* Refreshing the page
* Persistent conversation history

---

## Streaming Testing

Tested:

* Streaming AI chunks
* Conversation ID transmission
* `[DONE]` event
* `[ERROR]` event
* Frontend incremental rendering
* Complete assistant response persistence

---

# Current AI Architecture

The currently implemented AI pipeline is:

```text
                ┌───────────────┐
                │ User Question │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ FastAPI       │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ RAG Retrieval │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ ChromaDB      │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Context       │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ LangChain     │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Ollama        │
                │ Qwen3         │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ AI Response   │
                └───────────────┘
```

---

# Future Enhancements

The current project provides a foundation for additional AI capabilities.

Potential future enhancements include:

## LangGraph

LangGraph can be introduced for more complex, stateful AI workflows.

For example:

```text
User Question
      ↓
Analyze Question
      ↓
Route Question
      ↓
Retrieve Context
      ↓
Generate Answer
      ↓
Validate Answer
      ↓
Retry if Required
      ↓
Return Answer
```

LangGraph is not required for the current implementation.

---

## MCP

Model Context Protocol can be added to allow the AI system to interact with external tools and services in a standardized way.

Potential tools could include:

* Project management operations
* Task operations
* Database-related tools
* External development tools

---

## LangSmith

LangSmith can be added for:

* LLM tracing
* Prompt monitoring
* Debugging
* Evaluation
* Observability

---

## Advanced Agentic Workflows

Future versions could support workflows such as:

```text
User Request
     ↓
AI Planner
     ↓
Task Analysis
     ↓
Tool Selection
     ↓
Database Operation
     ↓
Validation
     ↓
Final Response
```

---

## AI Task Prioritization

Future AI functionality could analyze:

* Priority
* Due dates
* Dependencies
* Story points
* Current progress

and provide project-planning recommendations based on available project data.

---

## Advanced Risk Detection

Future versions could analyze:

* Overdue tasks
* Blocked tasks
* Sprint progress
* Task dependencies
* Workload
* Deadlines

to identify potential project risks.

---

# Learning Outcomes

This project provides practical experience with:

## Frontend Development

* React
* React Hooks
* React Router
* Redux Toolkit
* Material UI
* Axios
* API integration
* State management
* Streaming UI updates

---

## Backend Development

* Python
* FastAPI
* REST APIs
* Pydantic
* Authentication
* JWT
* Dependency injection
* Repository pattern
* Service layer architecture
* Error handling

---

## Database Development

* PostgreSQL
* SQL
* Relationships
* Foreign keys
* Constraints
* CRUD operations
* Persistent conversation storage

---

## Generative AI

* LangChain
* Prompt engineering
* Ollama
* Local LLMs
* RAG
* ChromaDB
* Embeddings
* AI task generation
* AI summarization
* AI risk analysis
* AI assistants
* Streaming LLM responses
* Conversation persistence
* Grounded AI responses

---

# Project Highlights

The project combines traditional full-stack development with Generative AI.

The major architecture is:

```text
Full Stack
    +
Authentication
    +
PostgreSQL
    +
REST APIs
    +
React
    +
Generative AI
    +
LangChain
    +
RAG
    +
ChromaDB
    +
Ollama
    +
Streaming
    +
Persistent Conversations
```

The current implementation demonstrates how an AI assistant can operate on project-specific information instead of relying only on general LLM knowledge.

---

# Conclusion

The AI-Powered Project Management & Development Platform demonstrates a complete full-stack application enhanced with Generative AI.

The current implementation includes:

* Full-stack React + FastAPI architecture
* PostgreSQL database
* JWT authentication
* Project management
* Team management
* Task management
* Kanban workflow
* Sprint management
* AI task breakdown
* AI project summaries
* AI risk analysis
* RAG-based project knowledge retrieval
* ChromaDB vector search
* Ollama local LLM
* AI Project Assistant
* Streaming AI responses
* Persistent AI conversations
* Grounded responses based on project context

The architecture also provides a foundation for future integration of LangGraph, MCP, LangSmith, and more advanced agentic AI workflows.

```
```
