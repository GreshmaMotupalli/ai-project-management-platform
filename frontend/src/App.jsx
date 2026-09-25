import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Projects from "./pages/projects/Projects";
import Teams from "./pages/teams/Teams";
import Tasks from "./pages/tasks/Tasks";
import ProjectWorkspace from "./pages/project/ProjectWorkspace";
import Kanban from "./pages/kanban/Kanban";
import Sprints from "./pages/sprints/Sprints";
import Activity from "./pages/activity/Activity";
import TaskBreakdown from "./pages/AI/TaskBreakdown";
import ProjectSummary from "./pages/AI/ProjectSummary";

import authAPI from "./api/authAPI";
import {
  setToken,
  setUser,
  setInitializing,
} from "./features/auth/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        dispatch(setInitializing(false));
        return;
      }

      // Restore token into Redux after a browser refresh.
      dispatch(setToken(token));

      try {
        const user = await authAPI.getMe();

        dispatch(setUser(user));

        console.log("User restored:", user);
      } catch (error) {
        console.error("Failed to restore user:", error);

        /*
         * Do not remove the token for every error.
         *
         * A temporary backend/network error should not
         * automatically log the user out.
         */
        dispatch(setInitializing(false));
      }
    };

    loadCurrentUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route
            path="/projects/:projectId"
            element={<ProjectWorkspace />}
          />

          <Route
            path="/projects/:projectId/teams"
            element={<Teams />}
          />

          <Route
            path="/projects/:projectId/tasks"
            element={<Tasks />}
          />

          <Route
            path="/projects/:projectId/kanban"
            element={<Kanban />}
          />

          <Route
            path="/projects/:projectId/sprints"
            element={<Sprints />}
          />

          <Route
            path="/projects/:projectId/activity"
            element={<Activity />}
          />
        </Route>

        <Route
  path="/projects/:projectId/ai/task-breakdown"
  element={<TaskBreakdown />}
/>

        <Route
  path="/projects/:projectId/ai/summary"
  element={<ProjectSummary />}
/>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;