import { useEffect, useState } from "react";
import api from "../services/api";

function SkillGap() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get("jobs/");
        setJobs(response.data);

        if (response.data.length > 0) {
          setSelectedJob(String(response.data[0].id));
        }
      } catch (err) {
        console.error("SKILL GAP JOB ERROR:", err);
        setError("Unable to load jobs.");
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedJob) {
      setError("Please select a job.");
      return;
    }

    setError("");
    setAnalysis(null);
    setLoadingAnalysis(true);

    try {
      const response = await api.get(
        `jobs/${selectedJob}/skill-gap/`
      );
      setAnalysis(response.data);
    } catch (err) {
      console.error("SKILL GAP ERROR:", err.response?.data || err);

      setError(
        err.response?.data?.error ||
          "Unable to analyze your skill gap. Please try again."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (loadingJobs) {
    return (
      <div className="job-state">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="skill-gap-page">
      <header className="skill-gap-header">
        <span>CAREER DEVELOPMENT</span>
        <h1>Skill Gap Analysis</h1>
        <p>
          Discover the skills you already have and identify
          what you need to learn for your target job.
        </p>
      </header>

      <section className="skill-gap-selector">
        <label htmlFor="skill-gap-job">Choose your target job</label>

        <select
          id="skill-gap-job"
          value={selectedJob}
          onChange={(event) => {
            setSelectedJob(event.target.value);
            setAnalysis(null);
            setError("");
          }}
        >
          <option value="">Select a job</option>

          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} — {job.company}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedJob || loadingAnalysis}
        >
          {loadingAnalysis ? "Analyzing..." : "Analyze Skill Gap"}
        </button>
      </section>

      {error && (
        <p className="skill-gap-error" role="alert">
          {error}
        </p>
      )}

      {analysis && (
        <>
          <section className="skill-gap-overview">
            <div>
              <span>Target Role</span>
              <h2>{analysis.job_title}</h2>
              <p>{analysis.company}</p>
            </div>

            <div className="skill-gap-stat">
              <strong>{analysis.total_matched_skills}</strong>
              <span>Skills Matched</span>
            </div>

            <div className="skill-gap-stat">
              <strong>{analysis.total_missing_skills}</strong>
              <span>Skills to Learn</span>
            </div>
          </section>

          <section className="skill-gap-panel">
            <div className="skill-gap-section-title">
              <h2>Skills You Have</h2>
              <span>{analysis.total_matched_skills}</span>
            </div>

            <div className="skill-gap-tags">
              {analysis.matched_skills.length > 0 ? (
                analysis.matched_skills.map((skill) => (
                  <span className="gap-tag gap-tag-matched" key={skill}>
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <p>No matching skills identified yet.</p>
              )}
            </div>
          </section>

          <section className="skill-gap-panel">
            <div className="skill-gap-section-title">
              <h2>Skills to Develop</h2>
              <span>{analysis.total_missing_skills}</span>
            </div>

            <p className="skill-gap-description">
              These job requirements were not found in your analyzed resume.
              Review them and build your knowledge where needed.
            </p>

            <div className="skill-gap-tags">
              {analysis.missing_skills.length > 0 ? (
                analysis.missing_skills.map((skill) => (
                  <span className="gap-tag gap-tag-missing" key={skill}>
                    + {skill}
                  </span>
                ))
              ) : (
                <p>All listed job skills were matched!</p>
              )}
            </div>
          </section>

          <p className="skill-gap-note">
            Missing from a resume does not necessarily mean you lack
            the skill. Keep your resume accurate and up to date.
          </p>
        </>
      )}
    </div>
  );
}

export default SkillGap;