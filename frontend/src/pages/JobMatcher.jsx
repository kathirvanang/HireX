import { useEffect, useState } from "react";
import api from "../services/api";

function JobMatcher() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchingJobId, setMatchingJobId] = useState(null);
  const [matchResults, setMatchResults] = useState({});

  // Fetch available jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data);
      } catch (err) {
        console.error("JOB FETCH ERROR:", err);
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Match resume with selected job
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
      console.error("MATCH ERROR:", err.response?.data || err);

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

  // Loading state
  if (loading) {
    return (
      <div className="job-state">
        <p>Loading jobs...</p>
      </div>
    );
  }

  // Error state when jobs cannot load
  if (error && jobs.length === 0) {
    return (
      <div className="job-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="job-matcher-page">
      {/* Page Header */}
      <div className="job-matcher-header">
        <span>CAREER OPPORTUNITIES</span>
        <h1>Find Your Perfect Job</h1>
        <p>
          Explore jobs and discover how well your skills match
          each opportunity.
        </p>
      </div>

      {/* Error Message */}
      {error && <p className="upload-error">{error}</p>}

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <div className="job-state">
          <h2>No Jobs Available</h2>
          <p>Please check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => {
            const result = matchResults[job.id];

            const score = Math.max(
              0,
              Math.min(100, Number(result?.match_score) || 0)
            );

            return (
              <article className="job-card" key={job.id}>
                {/* Job Header */}
                <div className="job-card-top">
                  <div className="company-icon">
                    {job.company?.charAt(0)?.toUpperCase() || "J"}
                  </div>

                  <span className="job-type">
                    {job.job_type}
                  </span>
                </div>

                {/* Job Details */}
                <h2>{job.title}</h2>
                <h4>{job.company}</h4>

                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>👤 {job.experience}</span>
                </div>

                <p className="job-description">
                  {job.description}
                </p>

                {/* Required Skills */}
                <div className="job-skills">
                  {job.required_skills?.map((skill, index) => (
                    <span key={`${skill}-${index}`}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Match Button */}
                <button
                  type="button"
                  className="match-job-button"
                  onClick={() => handleMatch(job.id)}
                  disabled={matchingJobId !== null}
                >
                  {matchingJobId === job.id
                    ? "Matching..."
                    : result
                      ? "Refresh Match"
                      : "Match My Resume"}
                </button>

                {/* Match Results */}
                {result && (
                  <div className="match-result">
                    <div className="match-result-header">
                      <div>
                        <span className="match-result-label">
                          CAREER INSIGHT
                        </span>
                        <h3>Resume Match</h3>
                      </div>

                      <div
                        className="match-score-badge"
                        aria-label={`Skill match score ${score}%`}
                      >
                        {score}%
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="match-progress-track"
                      role="progressbar"
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Resume skill match percentage"
                    >
                      <div
                        className="match-progress-fill"
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <p className="match-summary">
                      {result.matched_skills?.length || 0} of{" "}
                      {result.total_required_skills ?? 0} required skills
                      matched
                    </p>

                    {/* Matched Skills */}
                    <div className="match-skill-group">
                      <h4>
                        <span className="match-status-icon matched-icon">
                          ✓
                        </span>

                        Matched Skills

                        <span className="match-count">
                          {result.matched_skills?.length || 0}
                        </span>
                      </h4>

                      <div className="match-skill-list">
                        {result.matched_skills?.length > 0 ? (
                          result.matched_skills.map((skill) => (
                            <span
                              className="matched-skill"
                              key={skill}
                            >
                              ✓ {skill}
                            </span>
                          ))
                        ) : (
                          <p className="match-empty">
                            No matching skills found yet.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="match-skill-group missing-group">
                      <h4>
                        <span className="match-status-icon missing-icon">
                          !
                        </span>

                        Missing Skills

                        <span className="match-count">
                          {result.missing_skills?.length || 0}
                        </span>
                      </h4>

                      <div className="match-skill-list">
                        {result.missing_skills?.length > 0 ? (
                          result.missing_skills.map((skill) => (
                            <span
                              className="missing-skill"
                              key={skill}
                            >
                              + {skill}
                            </span>
                          ))
                        ) : (
                          <p className="match-empty">
                            All listed required skills matched!
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="match-disclaimer">
                      This score measures skill overlap with the job
                      requirements. It is not a prediction of hiring
                      success.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobMatcher;