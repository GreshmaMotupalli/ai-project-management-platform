import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute() {
  const { initializing } = useSelector((state) => state.auth);

  const token = localStorage.getItem("access_token");

  // Wait while the application restores the current session.
  if (initializing) {
    return null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;