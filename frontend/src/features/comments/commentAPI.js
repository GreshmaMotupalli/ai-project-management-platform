import apiClient from "../../api/client";

const commentAPI = {
  createComment: async (commentData) => {
    const response = await apiClient.post(
      "/comments",
      commentData
    );

    return response.data;
  },

  getTaskComments: async (taskId) => {
    const response = await apiClient.get(
      `/comments/task/${taskId}`
    );

    return response.data;
  },

  deleteComment: async (commentId) => {
    await apiClient.delete(
      `/comments/${commentId}`
    );
  },
};

export default commentAPI;