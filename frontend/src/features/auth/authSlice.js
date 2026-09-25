import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  initializing: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setInitializing: (state, action) => {
      state.initializing = action.payload;
    },

    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.initializing = false;
      state.error = null;
    },

    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initializing = false;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.initializing = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.initializing = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setInitializing,
  setCredentials,
  setToken,
  setUser,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;