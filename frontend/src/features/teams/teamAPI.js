import apiClient from "../../api/client";

const teamAPI = {
  createTeam: async (teamData) => {
    const response = await apiClient.post("/teams", teamData);
    return response.data;
  },

  getProjectTeams: async (projectId) => {
    const response = await apiClient.get(
      `/teams/project/${projectId}`
    );
    return response.data;
  },

  getTeam: async (teamId) => {
    const response = await apiClient.get(
      `/teams/${teamId}`
    );
    return response.data;
  },

  getUsers: async (search = "") => {
  const response = await apiClient.get("/users", {
    params: {
      search,
    },
  });

  return response.data;
},

  updateTeam: async (teamId, teamData) => {
    const response = await apiClient.put(
      `/teams/${teamId}`,
      teamData
    );
    return response.data;
  },

  deleteTeam: async (teamId) => {
    const response = await apiClient.delete(
      `/teams/${teamId}`
    );
    return response.data;
  },

  addMember: async (teamId, userId) => {
    const response = await apiClient.post(
      `/teams/${teamId}/members`,
      {
        user_id: userId,
      }
    );
    return response.data;
  },

  getMembers: async (teamId) => {
    const response = await apiClient.get(
      `/teams/${teamId}/members`
    );
    return response.data;
  },

  removeMember: async (teamId, userId) => {
    const response = await apiClient.delete(
      `/teams/${teamId}/members/${userId}`
    );
    return response.data;
  },
};

export default teamAPI;