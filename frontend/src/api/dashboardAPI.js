import apiClient from "./client";


const dashboardAPI = {
  getSummary: async () => {
    const response = await apiClient.get("/dashboard/summary");

    return response.data;
  },
};


export default dashboardAPI;