import apiClient from "../../api/client";

const activityAPI = {
  getProjectActivities: async (projectId) => {
    const response = await apiClient.get(
      `/activities/project/${projectId}`
    );

    return response.data;
  },
};

export default activityAPI;