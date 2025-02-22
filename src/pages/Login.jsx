import './Login.css';
import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Only navigate if token exists and user is not already on the profile page
    if (token && window.location.pathname !== "/profile") {
      navigate("/profile", { replace: true }); // Use 'replace' to prevent stacking navigation history
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); 

    try {
      const response = await axios.post("/api/login", { email, password });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/profile", { replace: true }); 
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error", err);
      if (err.response) {
        setError(err.response.data.error || "Invalid credentials. Please try again.");
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" disabled={loading}>Login</button>
        {loading && <p>Loading...</p>}
      </form>
      <div className="register-link">
        <p>Don't have an account? <a href="/register">Sign Up</a></p>
      </div>
    </div>
  );
};

export default Login;
