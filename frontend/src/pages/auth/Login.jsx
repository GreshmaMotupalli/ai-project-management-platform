import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useDispatch } from "react-redux";

import authAPI from "../../api/authAPI";
import {
  setToken,
  setUser,
} from "../../features/auth/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("error");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!email.trim() || !password.trim()) {
      setMessageSeverity("error");
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({
        email,
        password,
      });

      const token = response.access_token;

      if (!token) {
        throw new Error("No access token received.");
      }

      // Store token first so the /auth/me request
      // can automatically receive the Authorization header.
      localStorage.setItem("access_token", token);

      dispatch(setToken(token));

      // Get the currently authenticated user.
      const user = await authAPI.getMe();

      dispatch(setUser(user));

      console.log("Current user:", user);

      setMessageSeverity("success");
      setMessage("Login successful! Redirecting...");

      // Give the user a moment to see the success message.
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      console.error("Login failed:", error);

      // Remove the token if authentication did not complete.
      localStorage.removeItem("access_token");

      setMessageSeverity("error");

      if (error.response?.status === 401) {
        setMessage("Invalid email or password.");
      } else if (error.response?.data?.detail) {
        setMessage(error.response.data.detail);
      } else if (error.message === "No access token received.") {
        setMessage("Login failed. No access token was received.");
      } else {
        setMessage(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Login to continue to your projects.
          </Typography>

          {message && (
            <Alert
              severity={messageSeverity}
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;