import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <nav>
        <h2>HireX</h2>

        <div>
          <a href="/">Home</a>

          {token ? (
            <>
              <a href="/dashboard">Dashboard</a>

              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;