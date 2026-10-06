import { useEffect, useState } from "react";
import api from "../services/api";

function JobMatcher() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data);
      } catch (error) {
        console.error("JOB FETCH ERROR:", error);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="job-state">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="job-matcher-page">
      <div className="job-matcher-header">
        <span>CAREER OPPORTUNITIES</span>
        <h1>Find Your Perfect Job</h1>
        <p>
          Explore jobs and discover how well your skills match
          each opportunity.
        </p>
      </div>

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div className="job-card" key={job.id}>

            <div className="job-card-top">
              <div className="company-icon">
                {job.company?.charAt(0)}
              </div>

              <span className="job-type">
                {job.job_type}
              </span>
            </div>

            <h2>{job.title}</h2>

            <h4>{job.company}</h4>

            <div className="job-meta">
              <span>📍 {job.location}</span>
              <span>👤 {job.experience}</span>
            </div>

            <p className="job-description">
              {job.description}
            </p>

            <div className="job-skills">
              {job.required_skills?.map((skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              ))}
            </div>

            <button className="match-job-button">
              Match My Resume
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default JobMatcher;