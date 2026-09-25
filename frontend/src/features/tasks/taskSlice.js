import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import taskAPI from "./taskAPI";


/* =========================
   FETCH PROJECT TASKS
========================= */

export const fetchProjectTasks = createAsyncThunk(
  "tasks/fetchProjectTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      return await taskAPI.getProjectTasks(projectId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Failed to fetch tasks"
      );
    }
  }
);


/* =========================
   CREATE TASK
========================= */

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData, { rejectWithValue }) => {
    try {
      return await taskAPI.createTask(taskData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Failed to create task"
      );
    }
  }
);


/* =========================
   GET SINGLE TASK
========================= */

export const fetchTask = createAsyncThunk(
  "tasks/fetchTask",
  async (taskId, { rejectWithValue }) => {
    try {
      return await taskAPI.getTask(taskId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Failed to fetch task"
      );
    }
  }
);


/* =========================
   UPDATE TASK
========================= */

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { taskId, taskData },
    { rejectWithValue }
  ) => {
    try {
      return await taskAPI.updateTask(
        taskId,
        taskData
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Failed to update task"
      );
    }
  }
);


/* =========================
   DELETE TASK
========================= */

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(taskId);

      return taskId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
          "Failed to delete task"
      );
    }
  }
);


/* =========================
   INITIAL STATE
========================= */

const initialState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
};


/* =========================
   SLICE
========================= */

const taskSlice = createSlice({
  name: "tasks",

  initialState,

  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },

    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------------------------
         FETCH PROJECT TASKS
      ------------------------- */

      .addCase(
        fetchProjectTasks.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchProjectTasks.fulfilled,
        (state, action) => {
          state.loading = false;
          state.tasks = action.payload;
        }
      )

      .addCase(
        fetchProjectTasks.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      /* -------------------------
         CREATE TASK
      ------------------------- */

      .addCase(
        createTask.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        createTask.fulfilled,
        (state, action) => {
          state.loading = false;

          state.tasks.unshift(
            action.payload
          );
        }
      )

      .addCase(
        createTask.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      /* -------------------------
         FETCH SINGLE TASK
      ------------------------- */

      .addCase(
        fetchTask.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTask.fulfilled,
        (state, action) => {
          state.loading = false;
          state.selectedTask =
            action.payload;
        }
      )

      .addCase(
        fetchTask.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      /* -------------------------
         UPDATE TASK
      ------------------------- */

      .addCase(
        updateTask.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        updateTask.fulfilled,
        (state, action) => {
          state.loading = false;

          const index =
            state.tasks.findIndex(
              (task) =>
                task.id ===
                action.payload.id
            );

          if (index !== -1) {
            state.tasks[index] =
              action.payload;
          }

          if (
            state.selectedTask?.id ===
            action.payload.id
          ) {
            state.selectedTask =
              action.payload;
          }
        }
      )

      .addCase(
        updateTask.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )


      /* -------------------------
         DELETE TASK
      ------------------------- */

      .addCase(
        deleteTask.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        deleteTask.fulfilled,
        (state, action) => {
          state.loading = false;

          state.tasks =
            state.tasks.filter(
              (task) =>
                task.id !== action.payload
            );

          if (
            state.selectedTask?.id ===
            action.payload
          ) {
            state.selectedTask = null;
          }
        }
      )

      .addCase(
        deleteTask.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});


export const {
  clearTaskError,
  clearSelectedTask,
} = taskSlice.actions;


export default taskSlice.reducer;