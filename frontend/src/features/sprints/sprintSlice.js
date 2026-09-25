import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sprints: [],
  loading: false,
  error: null,
};

const sprintSlice = createSlice({
  name: "sprints",
  initialState,

  reducers: {
    setSprints: (state, action) => {
      state.sprints = action.payload;
    },

    addSprint: (state, action) => {
      state.sprints.push(action.payload);
    },

    updateSprint: (state, action) => {
      const index = state.sprints.findIndex(
        (sprint) => sprint.id === action.payload.id
      );

      if (index !== -1) {
        state.sprints[index] = action.payload;
      }
    },

    removeSprint: (state, action) => {
      state.sprints = state.sprints.filter(
        (sprint) => sprint.id !== action.payload
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSprints,
  addSprint,
  updateSprint,
  removeSprint,
  setLoading,
  setError,
  clearError,
} = sprintSlice.actions;

export default sprintSlice.reducer;