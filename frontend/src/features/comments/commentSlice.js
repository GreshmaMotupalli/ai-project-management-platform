import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  comments: [],
  loading: false,
  error: null,
};

const commentSlice = createSlice({
  name: "comments",

  initialState,

  reducers: {
    setComments: (state, action) => {
      state.comments = action.payload;
    },

    addComment: (state, action) => {
      state.comments.push(action.payload);
    },

    removeComment: (state, action) => {
      state.comments = state.comments.filter(
        (comment) => comment.id !== action.payload
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearComments: (state) => {
      state.comments = [];
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setComments,
  addComment,
  removeComment,
  setLoading,
  setError,
  clearComments,
  clearError,
} = commentSlice.actions;

export default commentSlice.reducer;