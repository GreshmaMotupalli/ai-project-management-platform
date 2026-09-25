import apiClient from "../../api/client";

const sprintAPI = {
  createSprint: async (sprintData) => {
    const response = await apiClient.post("/sprints", sprintData);
    return response.data;
  },

  getProjectSprints: async (projectId) => {
    const response = await apiClient.get(
      `/sprints/project/${projectId}`
    );

    return response.data;
  },

  getSprint: async (sprintId) => {
    const response = await apiClient.get(
      `/sprints/${sprintId}`
    );

    return response.data;
  },

  updateSprint: async (sprintId, sprintData) => {
    const response = await apiClient.put(
      `/sprints/${sprintId}`,
      sprintData
    );

    return response.data;
  },

  deleteSprint: async (sprintId) => {
    await apiClient.delete(`/sprints/${sprintId}`);
  },
};

export default sprintAPI;