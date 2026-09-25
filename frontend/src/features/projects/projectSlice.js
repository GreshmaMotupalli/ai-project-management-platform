import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",

  initialState,

  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setProjects: (state, action) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },

    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },

    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    updateProject: (state, action) => {
      const updatedProject = action.payload;

      const index = state.projects.findIndex(
        (project) => project.id === updatedProject.id
      );

      if (index !== -1) {
        state.projects[index] = updatedProject;
      }

      if (state.currentProject?.id === updatedProject.id) {
        state.currentProject = updatedProject;
      }
    },

    removeProject: (state, action) => {
      const projectId = action.payload;

      state.projects = state.projects.filter(
        (project) => project.id !== projectId
      );

      if (state.currentProject?.id === projectId) {
        state.currentProject = null;
      }
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  removeProject,
  setError,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer;