import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeMessage, setResumeMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [resumeResult, jobsResult] = await Promise.allSettled([
          api.get("resumes/latest-analysis/"),
          api.get("jobs/"),
        ]);

        if (!isMounted) return;

        if (resumeResult.status === "fulfilled") {
          setAnalysis(resumeResult.value.data);
          setResumeMessage("");
        } else if (resumeResult.reason?.response?.status === 404) {
          setResumeMessage(
            "No resume analysis found. Upload your resume to get started."
          );
        } else if (resumeResult.reason?.response?.status === 401) {
          setResumeMessage(
            "Please log in again to view your resume analysis."
          );
        } else {
          setResumeMessage("Unable to load resume analysis.");
          console.error(
            "RESUME ANALYSIS ERROR:",
            resumeResult.reason
          );
        }

        if (jobsResult.status === "fulfilled") {
          const jobData = Array.isArray(jobsResult.value.data)
            ? jobsResult.value.data
            : [];

          setJobs(jobData);
        } else {
          console.error("JOBS ERROR:", jobsResult.reason);
        }
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);

        if (isMounted) {
          setResumeMessage("Unable to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const skills = Array.isArray(analysis?.skills)
    ? analysis.skills
    : [];

  const averageMatch =
    jobs.length > 0
      ? (
          jobs.reduce(
            (total, job) =>
              total + (Number(job.match_score) || 0),
            0
          ) / jobs.length
        ).toFixed(2)
      : null;

  if (loading) {
    return (
      <div className="dashboard dashboard-home">
        <main className="dashboard-content">
          <div className="dashboard-loading">
            <div className="dashboard-spinner" />
            <h1>Welcome back!</h1>
            <p>Loading your career dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard dashboard-home">
      <main className="dashboard-content">
        <header className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">
              HIREX CAREER TRACKER
            </p>
            <h1>Welcome back! 👋</h1>
            <p>
              Track your resume, explore opportunities, and grow
              your career.
            </p>
          </div>

          <Link to="/resume" className="dashboard-button">
            + Upload Resume
          </Link>
        </header>

        <section className="dashboard-cards">
          <article className="dashboard-card">
            <div className="dashboard-card-icon">📄</div>
            <p>Resume Score</p>
            <h2>
              {analysis?.resume_score != null
                ? `${analysis.resume_score}%`
                : "--"}
            </h2>
            <span>Your latest resume score</span>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">⚡</div>
            <p>Skills Found</p>
            <h2>{analysis ? skills.length : "--"}</h2>
            <span>Skills detected in your resume</span>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">🎯</div>
            <p>Average Match</p>
            <h2>
              {averageMatch !== null ? `${averageMatch}%` : "--"}
            </h2>
            <span>Across recommended jobs</span>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">💼</div>
            <p>Recommended Jobs</p>
            <h2>{jobs.length}</h2>
            <span>Available opportunities</span>
          </article>
        </section>

        <section className="dashboard-sections">
          <article className="dashboard-section">
            <div className="dashboard-section-heading">
              <div className="dashboard-section-icon">📑</div>
              <div>
                <h3>Recent Resume Analysis</h3>
                <p>Your latest resume insights</p>
              </div>
            </div>

            {analysis ? (
              <>
                <div className="dashboard-info-row">
                  <span>Resume</span>
                  <strong>
                    {analysis.file_name || "Uploaded resume"}
                  </strong>
                </div>

                <div className="dashboard-info-row">
                  <span>Skills detected</span>
                  <strong>{skills.length}</strong>
                </div>

                {skills.length > 0 && (
                  <div className="dashboard-skill-list">
                    {skills.slice(0, 5).map((skill, index) => (
                      <span key={`${skill}-${index}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/resume/${analysis.resume_id}/analysis`}
                  className="dashboard-button"
                >
                  View Resume Analysis →
                </Link>
              </>
            ) : (
              <>
                <p className="dashboard-empty-message">
                  {resumeMessage || "No resume analysis found."}
                </p>

                <Link to="/resume" className="dashboard-button">
                  Upload Resume →
                </Link>
              </>
            )}
          </article>

          <article className="dashboard-section">
            <div className="dashboard-section-heading">
              <div className="dashboard-section-icon">🚀</div>
              <div>
                <h3>Recommended Jobs</h3>
                <p>Explore your next opportunity</p>
              </div>
            </div>

            {jobs.length > 0 ? (
              <div className="dashboard-job-list">
                {jobs.slice(0, 3).map((job) => (
                  <div className="dashboard-job-item" key={job.id}>
                    <div className="dashboard-job-avatar">
                      {(job.title || "J").charAt(0).toUpperCase()}
                    </div>

                    <div className="dashboard-job-details">
                      <strong>{job.title}</strong>
                      <span>
                        {job.company || "Company not specified"}
                      </span>
                    </div>

                    <span className="dashboard-job-score">
                      {job.match_score != null
                        ? `${Number(job.match_score).toFixed(1)}%`
                        : "--"}
                    </span>
                  </div>
                ))}

                <Link
                  to="/recommended_jobs"
                  className="dashboard-button"
                >
                  Explore All Jobs →
                </Link>
              </div>
            ) : (
              <>
                <p className="dashboard-empty-message">
                  No job recommendations available yet.
                </p>

                <Link
                  to="/recommended_jobs"
                  className="dashboard-button"
                >
                  Find Jobs →
                </Link>
              </>
            )}
          </article>
        </section>

        <section className="dashboard-quick-links">
          <h3>Continue your career journey</h3>

          <div className="dashboard-quick-link-grid">
            <Link to="/job_matcher">
              <span>🎯</span>
              <strong>Job Matcher</strong>
              <small>Check your job compatibility</small>
            </Link>

            <Link to="/skill_gap">
              <span>📊</span>
              <strong>Skill Gap</strong>
              <small>Discover skills to improve</small>
            </Link>

            <Link to="/learning_roadmap">
              <span>🗺️</span>
              <strong>Learning Roadmap</strong>
              <small>Plan your learning journey</small>
            </Link>

            <Link to="/job_match_analytics">
              <span>📈</span>
              <strong>Match Analytics</strong>
              <small>Review your match insights</small>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;