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
};
export default aiAPI;