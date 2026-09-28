import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {setError("");
          const response = await api.post("auth/login/", { username, password, });

          localStorage.setItem("token", response.data.token);
          navigate("/dashboard");
        } catch (error) {
          setError("Invalid username or password");
        }
      }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to continue with HireX</p>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e)=> setPassword(e.target.value)
            }
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;