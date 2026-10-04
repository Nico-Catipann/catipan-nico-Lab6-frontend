import { useState } from "react";
import api from "../services/api";

import NotificationModal from "../components/NotificationModal";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post("/api/login", {
        username,
        password,
      });

      localStorage.setItem("access_token", response.data.access_token);

      localStorage.setItem("refresh_token", response.data.refresh_token);

      localStorage.setItem("username", response.data.user.username);

      localStorage.setItem("role", response.data.user.role);

      onLogin();
    } catch (error) {
      console.error(error);

      setNotification({
        type: "error",
        title: "Login Failed",
        message: error.response?.data?.error || "Invalid username or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">PM</div>

        <h1>Product Management</h1>

        <p className="subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>

      {notification && (
        <NotificationModal
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default Login;
