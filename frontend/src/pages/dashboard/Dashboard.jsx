import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../features/auth/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    dispatch(logout());

    navigate("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome to the project management platform.</p>

      {user && (
        <p>
          Logged in as: {user.name} ({user.email})
        </p>
      )}

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;