import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const icons = ["⚛️", "🔗", "🗄️", "🚀"];

function LearningRoadmap() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  // Completed topics are kept separately for each job in the UI.
  // The backend database is the permanent source of saved progress.
  const [completedByJob, setCompletedByJob] = useState({});

  const completed = completedByJob[selectedJob] || [];

  // Load available jobs.
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await api.get("jobs/");
        const data = response.data;

        const jobList = Array.isArray(data)
          ? data
          : data.results || [];

        setJobs(jobList);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Could not load jobs. Please check your login and backend server."
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, []);

  // Handle target job changes.
  const handleJobChange = (event) => {
    setSelectedJob(event.target.value);
    setRoadmap([]);
    setCurrentSkills([]);
    setMissingSkills([]);
    setTargetJob("");
    setError("");
  };

  // Load the selected job's saved checkbox progress from Django.
  const loadSavedProgress = async (jobId) => {
    const response = await api.get(
      `resumes/roadmap-progress/?job_id=${Number(jobId)}`
    );

    const savedTopics = Array.isArray(
      response.data.completed_topics
    )
      ? response.data.completed_topics
      : [];

    setCompletedByJob((previous) => ({
      ...previous,
      [String(jobId)]: savedTopics,
    }));
  };

  // Generate a personalized roadmap and load saved progress.
  const generateRoadmap = async () => {
    if (!selectedJob) {
      setError("Please select a target job first.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await api.post(
        "resumes/learning-roadmap/",
        {
          job_id: Number(selectedJob),
        }
      );

      const data = response.data;

      if (!Array.isArray(data.weeks) || data.weeks.length !== 4) {
        throw new Error(
          "The AI response did not contain exactly 4 weeks."
        );
      }

      setRoadmap(data.weeks);
      setCurrentSkills(
        Array.isArray(data.current_skills)
          ? data.current_skills
          : []
      );
      setMissingSkills(
        Array.isArray(data.missing_skills)
          ? data.missing_skills
          : []
      );
      setTargetJob(data.target_job || "");

      // Load progress saved in the backend database.
      try {
        await loadSavedProgress(selectedJob);
      } catch (progressError) {
        setError(
          progressError.response?.data?.error ||
            "Roadmap generated, but saved progress could not be loaded."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Could not generate your roadmap. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Create IDs for topics in the current roadmap.
  const topics = roadmap.flatMap((week, weekIndex) =>
    (week.topics || []).map((topic, topicIndex) => ({
      id: `${week.week}-${weekIndex}-${topicIndex}`,
      week: week.week,
      title: topic.title || "Learning topic",
    }))
  );

  const totalTopics = topics.length;

  const completedCount = topics.filter((topic) =>
    completed.includes(topic.id)
  ).length;

  const progress = totalTopics
    ? Math.min(
        100,
        Math.round((completedCount / totalTopics) * 100)
      )
    : 0;

  // Save checkbox changes to the backend database.
  const toggleTopic = async (id) => {
    if (!selectedJob || savingProgress) return;

    const jobKey = String(selectedJob);
    const previousCompleted = completedByJob[jobKey] || [];

    const updatedCompleted = previousCompleted.includes(id)
      ? previousCompleted.filter((item) => item !== id)
      : [...previousCompleted, id];

    // Update the UI immediately.
    setCompletedByJob((previous) => ({
      ...previous,
      [jobKey]: updatedCompleted,
    }));

    setError("");
    setSavingProgress(true);

    try {
      await api.post("resumes/roadmap-progress/", {
        job_id: Number(selectedJob),
        completed_topics: updatedCompleted,
      });
    } catch (err) {
      // Revert the checkbox if the database save fails.
      setCompletedByJob((previous) => ({
        ...previous,
        [jobKey]: previousCompleted,
      }));

      setError(
        err.response?.data?.error ||
          "Could not save your progress. Please check your connection and try again."
      );
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <main className="roadmap-page">
      <section className="roadmap-hero">
        <div className="roadmap-hero-content">
          <span className="roadmap-eyebrow">
            HIREX CAREER DEVELOPMENT
          </span>

          <h1>Your Learning Roadmap</h1>

          <p>
            Get a personalized 4-week learning plan based on your
            latest resume and the job you want.
          </p>

          <div className="roadmap-hero-tags">
            <span>🎯 Resume-based learning</span>
            <span>✨ Gemini AI</span>
          </div>
        </div>

        <div className="roadmap-hero-icon">🚀</div>
      </section>

      <section className="roadmap-progress-card">
        <div className="progress-top">
          <div>
            <span className="progress-eyebrow">
              YOUR PROGRESS
            </span>

            <h2>Keep moving forward!</h2>

            <p>
              {completedCount} of {totalTopics} topics completed
            </p>
          </div>

          <div className="progress-percentage">
            {progress}%
          </div>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-label="Learning progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="progress-footer">
          {progress === 100
            ? "Amazing! You completed this roadmap."
            : "Check off topics as you complete your learning."}
        </p>

        {savingProgress && (
          <p role="status">Saving your progress...</p>
        )}
      </section>

      <section className="roadmap-progress-card">
        <h2>Choose your target job</h2>

        <p>Select a job to personalize your learning plan.</p>

        <select
          value={selectedJob}
          onChange={handleJobChange}
          disabled={loadingJobs || generating}
          style={{
            width: "100%",
            padding: "12px",
            margin: "12px 0",
            borderRadius: "10px",
          }}
        >
          <option value="">
            {loadingJobs
              ? "Loading jobs..."
              : "Select a target job"}
          </option>

          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} — {job.company}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={generateRoadmap}
          disabled={generating || loadingJobs || !selectedJob}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            background: "#0f172a",
            color: "#ffffff",
            cursor: generating ? "wait" : "pointer",
          }}
        >
          {generating
            ? "Generating with Gemini AI..."
            : "✨ Generate Roadmap"}
        </button>

        {error && (
          <p
            role="alert"
            style={{ color: "#dc2626", marginTop: "12px" }}
          >
            {error}
          </p>
        )}
      </section>

      {roadmap.length > 0 && (
        <>
          <section className="roadmap-progress-card">
            <span className="roadmap-eyebrow">
              PERSONALIZED PLAN
            </span>

            <h2>{targetJob || "Your target job"}</h2>

            <h3>Skills in your resume</h3>

            <div className="roadmap-hero-tags">
              {currentSkills.length ? (
                currentSkills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>
                    {String(skill)}
                  </span>
                ))
              ) : (
                <span>No current skills returned</span>
              )}
            </div>

            <h3>Skills to focus on</h3>

            <div className="roadmap-hero-tags">
              {missingSkills.length ? (
                missingSkills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>
                    {String(skill)}
                  </span>
                ))
              ) : (
                <span>No missing skills returned</span>
              )}
            </div>
          </section>

          <div className="roadmap-section-heading">
            <div>
              <span className="roadmap-eyebrow">
                YOUR JOURNEY
              </span>

              <h2>AI-generated weekly plan</h2>
            </div>

            <span className="roadmap-total">
              4 learning modules
            </span>
          </div>

          <section className="roadmap-grid">
            {roadmap.map((week, index) => {
              const weekTopics = topics.filter(
                (topic) => topic.week === week.week
              );

              const weekCompleted = weekTopics.filter((topic) =>
                completed.includes(topic.id)
              ).length;

              const weekProgress = weekTopics.length
                ? Math.round(
                    (weekCompleted / weekTopics.length) * 100
                  )
                : 0;

              return (
                <article
                  className="roadmap-card"
                  key={`${selectedJob}-${week.week}-${index}`}
                >
                  <div className="roadmap-card-top">
                    <span className="roadmap-week">
                      WEEK {String(week.week).padStart(2, "0")}
                    </span>

                    <span className="roadmap-card-icon">
                      {icons[index] || "📘"}
                    </span>
                  </div>

                  <h3>{week.title}</h3>

                  <p className="roadmap-description">
                    {week.goal}
                  </p>

                  <div className="week-progress-row">
                    <span>Module progress</span>
                    <strong>{weekProgress}%</strong>
                  </div>

                  <div className="week-progress-track">
                    <div
                      className="week-progress-fill"
                      style={{ width: `${weekProgress}%` }}
                    />
                  </div>

                  <div className="roadmap-topics">
                    {(week.topics || []).map(
                      (topic, topicIndex) => {
                        const id = `${week.week}-${index}-${topicIndex}`;

                        return (
                          <label
                            className="roadmap-topic"
                            key={id}
                          >
                            <input
                              type="checkbox"
                              checked={completed.includes(id)}
                              disabled={savingProgress}
                              onChange={() => toggleTopic(id)}
                            />

                            <span className="topic-text">
                              <strong>{topic.title}</strong>

                              {topic.description && (
                                <span>{topic.description}</span>
                              )}

                              {topic.task && (
                                <span>
                                  Practical task: {topic.task}
                                </span>
                              )}
                            </span>
                          </label>
                        );
                      }
                    )}
                  </div>

                  <div className="roadmap-card-footer">
                    <span>
                      {weekCompleted}/{weekTopics.length} completed
                    </span>

                    {weekProgress === 100 && (
                      <span className="module-complete">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <section className="roadmap-tip">
            <span className="tip-icon">💡</span>

            <div>
              <h3>Build while you learn</h3>

              <p>
                Practise these topics in HireX or a small project.
                Completing practical tasks helps turn knowledge into skills.
              </p>
            </div>
          </section>
        </>
      )}

      <div className="roadmap-bottom">
        <Link to="/dashboard" className="roadmap-back-button">
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default LearningRoadmap;