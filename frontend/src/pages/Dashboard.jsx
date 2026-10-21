import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";


function Dashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeMessage, setResumeMessage] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumeResult, jobsResult] = await Promise.allSettled([
          api.get("resumes/latest-analysis/"),
          api.get("jobs/"),
        ]);

        if (resumeResult.status === "fulfilled") {
          setAnalysis(resumeResult.value.data);
        } else if (resumeResult.reason?.response?.status === 404) {
          setResumeMessage("No resume analysis found. Upload your resume to get started.");
        } else if (resumeResult.reason?.response?.status === 401) {
          setResumeMessage("Please log in again to view your resume analysis.");
        } else {
          setResumeMessage("Unable to load resume analysis.");
          console.error("RESUME ANALYSIS ERROR:", resumeResult.reason);
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
        setResumeMessage("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const skills = Array.isArray(analysis?.skills)
    ? analysis.skills
    : [];

  const averageMatch =
    jobs.length > 0
      ? (
          jobs.reduce(
            (total, job) => total + (Number(job.match_score) || 0),
            0
          ) / jobs.length
        ).toFixed(2)
      : null;

  if (loading) {
    return (
      <div className="dashboard">
        <main className="dashboard-content">
          <h1>Welcome back!</h1>
          <p>Loading your dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>HireX</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/resume">Resume</Link>
          <Link to="/job_matcher">Job Matcher</Link>
          <Link to="/recommended_jobs">Recommended Jobs</Link>
          <Link to="/skill_gap">Skill Gap</Link>
          <Link to="/learning_roadmap">Learning Roadmap</Link>
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
            <h2>
              {analysis?.resume_score != null
                ? `${analysis.resume_score}%`
                : "--"}
            </h2>
          </div>

          <div className="dashboard-card">
            <h3>Skills Found</h3>
            <h2>{analysis ? skills.length : "--"}</h2>
          </div>

          <div className="dashboard-card">
            <h3>Average Match</h3>
            <h2>
              {averageMatch !== null ? `${averageMatch}%` : "--"}
            </h2>
          </div>

          <div className="dashboard-card">
            <h3>Recommended Jobs</h3>
            <h2>{jobs.length}</h2>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h3>Recent Resume Analysis</h3>

            {analysis ? (
              <>
                <p>Resume: {analysis.file_name}</p>
                <p>Skills detected: {skills.length}</p>

                {skills.length > 0 && (
                  <p>{skills.slice(0, 5).join(", ")}</p>
                )}

                <Link to={`/resume/${analysis.resume_id}/analysis/`} className="dashboard-button">
                  View Resume
                </Link>
              </>
            ) : (
              <>
                <p>{resumeMessage || "No resume analysis found."}</p>
                <Link to="/resume" className="dashboard-button">
                  Upload Resume
                </Link>
              </>
            )}
          </div>

          <div className="dashboard-section">
            <h3>Recommended Jobs</h3>

            {jobs.length > 0 ? (
              <>
                <p>{jobs.length} job opportunities available.</p>

                {jobs.slice(0, 3).map((job) => (
                  <p key={job.id}>
                    <strong>{job.title}</strong>
                    {" — "}
                    {job.match_score != null
                      ? `${Number(job.match_score).toFixed(2)}% match`
                      : "Match score unavailable"}
                  </p>
                ))}

                <Link
                  to="/recommended_jobs"
                  className="dashboard-button"
                >
                  Find Jobs
                </Link>
              </>
            ) : (
              <>
                <p>No job recommendations available yet.</p>
                <Link
                  to="/recommended_jobs"
                  className="dashboard-button"
                >
                  Find Jobs
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;