function Home() {
  return (
    <main className="home">

      <section className="hero-section">
        <div className="hero-content">

          <p className="hero-label">
            AI-POWERED CAREER PLATFORM
          </p>

          <h1>
            Your Resume Deserves a
            <span> Better Future.</span>
          </h1>

          <p className="hero-description">
            Analyze your resume, discover the right job opportunities,
            identify skill gaps, and build a personalized career roadmap
            with AI.
          </p>

          <div className="hero-buttons">
            <button>
              Analyze My Resume
            </button>

            <button className="secondary-btn">
              Explore Jobs
            </button>
          </div>

        </div>

        <div className="hero-card">
          <div className="resume-icon">📄</div>

          <h3>AI Resume Analysis</h3>

          <p>Resume Score</p>

          <div className="score">
            85%
          </div>

          <div className="mini-tags">
            <span>✓ Skills</span>
            <span>✓ Projects</span>
            <span>✓ Experience</span>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;