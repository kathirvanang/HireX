import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function JobMatchAnalytics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const response = await api.get("jobs/match-history/");

        if (isMounted) {
          setHistory(response.data.results || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.error ||
              "Unable to load analytics. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const total = history.length;

    const scores = history.map((item) =>
      Math.max(0, Math.min(100, Number(item.match_score) || 0))
    );

    const average = total
      ? scores.reduce((sum, score) => sum + score, 0) / total
      : 0;

    const highMatches = scores.filter((score) => score >= 70).length;
    const mediumMatches = scores.filter(
      (score) => score >= 40 && score < 70
    ).length;
    const lowMatches = scores.filter((score) => score < 40).length;

    const skillCounts = {};

    history.forEach((item) => {
      (item.missing_skills || []).forEach((skill) => {
        if (typeof skill === "string" && skill.trim()) {
          const normalized = skill.trim();
          skillCounts[normalized] =
            (skillCounts[normalized] || 0) + 1;
        }
      });
    });

    const commonMissingSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5);

    return {
      total,
      average,
      highMatches,
      mediumMatches,
      lowMatches,
      commonMissingSkills,
    };
  }, [history]);

  const chartBars = [
    {
      label: "High",
      description: "70–100%",
      count: analytics.highMatches,
      className: "analytics-bar-high",
    },
    {
      label: "Medium",
      description: "40–69%",
      count: analytics.mediumMatches,
      className: "analytics-bar-medium",
    },
    {
      label: "Low",
      description: "Below 40%",
      count: analytics.lowMatches,
      className: "analytics-bar-low",
    },
  ];

  return (
    <main className="analytics-page">
      <div className="analytics-container">
        <header className="analytics-header">
          <div>
            <p className="analytics-eyebrow">
              HIREX CAREER TRACKER
            </p>

            <h1>Job Match Analytics</h1>

            <p>
              Understand your job matches and identify skills to improve.
            </p>
          </div>

          <Link
            to="/job_match_history"
            className="analytics-history-link"
          >
            View Match History
          </Link>
        </header>

        {loading && (
          <div className="analytics-state">
            Loading your analytics...
          </div>
        )}

        {error && (
          <div className="analytics-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <section className="analytics-empty">
            <div>📊</div>
            <h2>No analytics available yet</h2>
            <p>
              Match your resume with some jobs to see your analytics here.
            </p>
            <Link to="/recommended_jobs">
              Explore Jobs
            </Link>
          </section>
        )}

        {!loading && !error && history.length > 0 && (
          <>
            <section className="analytics-stat-grid">
              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">📋</span>
                <p>Total match checks</p>
                <h2>{analytics.total}</h2>
                <span>Recorded job matches</span>
              </article>

              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">📈</span>
                <p>Average match score</p>
                <h2>{analytics.average.toFixed(1)}%</h2>
                <span>Across recorded matches</span>
              </article>

              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">🏆</span>
                <p>High-match jobs</p>
                <h2>{analytics.highMatches}</h2>
                <span>Match score of 70% or more</span>
              </article>

              <article className="analytics-stat-card">
                <span className="analytics-stat-icon">💡</span>
                <p>Skills to improve</p>
                <h2>{analytics.commonMissingSkills.length}</h2>
                <span>Top missing skill types</span>
              </article>
            </section>

            <section className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <h2>Match Score Distribution</h2>
                  <p>How your recorded matches are distributed</p>
                </div>
              </div>

              <div className="analytics-chart">
                {chartBars.map((bar) => {
                  const percentage =
                    analytics.total > 0
                      ? (bar.count / analytics.total) * 100
                      : 0;

                  return (
                    <div className="analytics-chart-row" key={bar.label}>
                      <div className="analytics-chart-label">
                        <strong>{bar.label}</strong>
                        <span>{bar.description}</span>
                      </div>

                      <div className="analytics-chart-track">
                        <div
                          className={`analytics-chart-fill ${bar.className}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <strong className="analytics-chart-count">
                        {bar.count}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <h2>Most Common Missing Skills</h2>
                  <p>
                    Skills that appeared most often in your match results
                  </p>
                </div>
              </div>

              {analytics.commonMissingSkills.length > 0 ? (
                <div className="analytics-skill-list">
                  {analytics.commonMissingSkills.map(
                    ([skill, count], index) => (
                      <div className="analytics-skill-row" key={skill}>
                        <div className="analytics-skill-name">
                          <span>{index + 1}</span>
                          <strong>{skill}</strong>
                        </div>

                        <div className="analytics-skill-count">
                          {count}{" "}
                          {count === 1 ? "match" : "matches"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="analytics-no-skills">
                  Great! No missing skills were recorded in your history.
                </p>
              )}
            </section>

            <div className="analytics-footer">
              <p>
                Analytics are based on your saved job match history.
              </p>

              <Link to="/recommended_jobs">
                Find More Jobs →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default JobMatchAnalytics;