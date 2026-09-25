import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import projectReducer from "../features/projects/projectSlice";
import teamReducer from "../features/teams/teamSlice";
import taskReducer from "../features/tasks/taskSlice";
import sprintReducer from "../features/sprints/sprintSlice";
import commentReducer from "../features/comments/commentSlice";
import activityReducer from "../features/activities/activitySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    teams: teamReducer,
    tasks: taskReducer,
    sprints: sprintReducer,
    comments: commentReducer,
    activities: activityReducer,
  },
});

export default store;