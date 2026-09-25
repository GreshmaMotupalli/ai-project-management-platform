import apiClient from "../../api/client";

const taskAPI = {
  createTask: async (taskData) => {
    const response = await apiClient.post(
      "/tasks",
      taskData
    );

    return response.data;
  },

  getProjectTasks: async (projectId) => {
    const response = await apiClient.get(
      `/tasks/project/${projectId}`
    );

    return response.data;
  },

  getTask: async (taskId) => {
    const response = await apiClient.get(
      `/tasks/${taskId}`
    );

    return response.data;
  },

  updateTask: async (taskId, taskData) => {
    const response = await apiClient.put(
      `/tasks/${taskId}`,
      taskData
    );

    return response.data;
  },

  deleteTask: async (taskId) => {
    const response = await apiClient.delete(
      `/tasks/${taskId}`
    );

    return response.data;
  },
};

export default taskAPI;