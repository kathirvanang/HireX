function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join HireX and grow your career</p>

        <form>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
          />

          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>
  );
}

export default Register;