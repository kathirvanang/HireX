function Login() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Login to continue with HireX</p>

        <form>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;