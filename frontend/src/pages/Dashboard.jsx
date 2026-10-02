function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>HireX</h2>

        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/resume">Resume</a>
          <a href="#">Job Matcher</a>
          <a href="#">Recommended Jobs</a>
          <a href="#">Skill Gap</a>
          <a href="#">Learning Roadmap</a>
          <a href="#">History</a>
          <a href="#">Settings</a>
        </nav>
      </aside>

      <main className="dashboard-content">
        <h1>Welcome back!</h1>
        <p>Track your resume and career progress.</p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Resume Score</h3>
            <h2>--</h2>
          </div>

          <div className="dashboard-card">
            <h3>Skills Found</h3>
            <h2>--</h2>
          </div>

          <div className="dashboard-card">
            <h3>Average Match</h3>
            <h2>--</h2>
          </div>

          <div className="dashboard-card">
            <h3>Recommended Jobs</h3>
            <h2>--</h2>
             </div>
        </div>

            <div className="dashboard-sections">
            <div className="dashboard-section">
                <h3>Recent Resume Analysis</h3>
                <p>No resume analysis yet.</p>
                <button>Upload Resume</button>
            </div>

            <div className="dashboard-section">
                <h3>Recommended Jobs</h3>
                <p>No job recommendations yet.</p>
                <button>Find Jobs</button>
            </div>
            </div>
      </main>
    </div>
  );
}

export default Dashboard;