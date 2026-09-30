import client from "./client";

const aiAPI = {
  generateTaskBreakdown: async (requirement) => {
    const response = await client.post("/ai/task-breakdown", {
      requirement,
    });

    return response.data;
  },

  generateProjectSummary: async (projectId) => {
    const response = await client.post("/ai/project-summary", {
      project_id: projectId,
    });

    return response.data;
  },

  generateProjectRisks: async (projectId) => {
    const response = await client.post("/ai/project-risks", {
      project_id: projectId,
    });

    return response.data;
  },

  askProjectAssistant: async (
    projectId,
    question,
    conversationId = null
  ) => {
    const response = await client.post("/ai/assistant", {
      project_id: Number(projectId),
      question,
      conversation_id: conversationId,
    });

    return response.data;
  },

  streamProjectAssistant: async (
    projectId,
    question,
    conversationId = null,
    onChunk
  ) => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      "http://127.0.0.1:8000/api/ai/assistant/stream",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: Number(projectId),
          question,
          conversation_id: conversationId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to start AI streaming.");
    }

    if (!response.body) {
      throw new Error("Streaming is not supported by this response.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";
    let returnedConversationId = conversationId;

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.startsWith("data:")) {
          continue;
        }

        const data = event.startsWith("data: ")
          ? event.slice(6)
          : event.slice(5);

        // --------------------------------------------
        // Conversation ID
        // --------------------------------------------

        if (data.startsWith("[CONVERSATION_ID:")) {
          const match = data.match(
            /\[CONVERSATION_ID:(\d+)\]/
          );

          if (match) {
            returnedConversationId = Number(match[1]);
          }

          continue;
        }

        // --------------------------------------------
        // Stream completed
        // --------------------------------------------

        if (data.trim() === "[DONE]") {
          return returnedConversationId;
        }

        // --------------------------------------------
        // Stream error
        // --------------------------------------------

        if (data.trim() === "[ERROR]") {
          throw new Error("AI streaming failed.");
        }

        // --------------------------------------------
        // Normal AI chunk
        // --------------------------------------------

        onChunk(data);
      }
    }

    return returnedConversationId;
  },

  createConversation: async (projectId) => {
    const response = await client.post("/ai/conversations", {
      project_id: Number(projectId),
    });

    return response.data;
  },

  getConversations: async (projectId) => {
    const response = await client.get("/ai/conversations", {
      params: {
        project_id: Number(projectId),
      },
    });

    return response.data;
  },

  getConversationMessages: async (
    projectId,
    conversationId
  ) => {
    const response = await client.get(
      `/ai/conversations/${conversationId}/messages`,
      {
        params: {
          project_id: Number(projectId),
        },
      }
    );

    return response.data;
  },
};

export default aiAPI;