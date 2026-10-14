import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchingJobId, setMatchingJobId] = useState(null);
  const [matchResults, setMatchResults] = useState({});

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data);
      } catch (err) {
        console.error("RECOMMENDED JOBS ERROR:", err);
        setError("Unable to load recommended jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, []);

  const handleMatch = async (jobId) => {
    setMatchingJobId(jobId);
    setError("");

    try {
      const response = await api.post(`jobs/${jobId}/match/`);

      setMatchResults((previous) => ({
        ...previous,
        [jobId]: response.data,
      }));
    } catch (err) {
      console.error("RECOMMENDED MATCH ERROR:", err.response?.data || err);

      if (err.response?.status === 401) {
        setError("Please log in again before matching your resume.");
      } else {
        setError(
          err.response?.data?.error ||
            "Unable to match your resume. Please try again."
        );
      }
    } finally {
      setMatchingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="recommended-state">
        <p>Finding opportunities...</p>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="recommended-state">
        <h2>Unable to load jobs</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="recommended-page">
      <header className="recommended-header">
        <span>YOUR NEXT OPPORTUNITY</span>
        <h1>Recommended Jobs</h1>
        <p>
          Explore available opportunities and discover which
          roles may align with your skills.
        </p>
      </header>

      <div className="recommended-summary">
        <div>
          <span>Available Opportunities</span>
          <strong>{jobs.length}</strong>
        </div>
        <div>
          <span>Career Focus</span>
          <strong>Skill-Based</strong>
        </div>
      </div>

      {error && <p className="upload-error">{error}</p>}

      {jobs.length === 0 ? (
        <div className="recommended-empty">
          <h2>No jobs available yet</h2>
          <p>Check back when new opportunities are added.</p>
        </div>
      ) : (
        <div className="recommended-grid">
          {jobs.map((job) => {
            const result = matchResults[job.id];

            return (
              <article className="recommended-card" key={job.id}>
                <div className="recommended-card-top">
                  <div className="recommended-company-icon">
                    {job.company?.charAt(0)?.toUpperCase() || "J"}
                  </div>

                  <span className="recommended-job-type">
                    {job.job_type}
                  </span>
                </div>

                <h2>{job.title}</h2>
                <h3>{job.company}</h3>

                <div className="recommended-meta">
                  <span>📍 {job.location}</span>
                  <span>👤 {job.experience}</span>
                </div>

                <p className="recommended-description">
                  {job.description}
                </p>

                <div className="recommended-skills">
                  {(job.required_skills || []).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>

                <button
                  type="button"
                  className="recommended-button"
                  onClick={() => handleMatch(job.id)}
                  disabled={matchingJobId !== null}
                >
                  {matchingJobId === job.id
                    ? "Matching..."
                    : "Check Resume Match →"}
                </button>

                {result && (
                  <div className="recommended-match-result">
                    <p className="recommended-match-label">
                      RESUME MATCH
                    </p>

                    <h2>
                      {result.match_score ?? result.match_percentage ?? 0}%
                    </h2>

                    <p>
                      <strong>Matched Skills</strong>
                    </p>

                    <div className="recommended-skills">
                      {(result.matched_skills || []).map((skill) => (
                        <span key={skill}>✓ {skill}</span>
                      ))}
                    </div>

                    <p>
                      <strong>Missing Skills</strong>
                    </p>

                    <div className="recommended-skills">
                      {(result.missing_skills || []).map((skill) => (
                        <span key={skill}>＋ {skill}</span>
                      ))}
                    </div>

                    <Link
                      to="/job-matcher"
                      className="recommended-detail-link"
                    >
                      View all jobs →
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="recommended-note">
        These are available jobs from the HireX database.
        Recommendations are not a guarantee of hiring or selection.
      </p>
    </div>
  );
}

export default RecommendedJobs;