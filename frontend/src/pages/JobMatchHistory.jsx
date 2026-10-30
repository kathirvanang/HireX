import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function JobMatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Search, filter and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        setError("");

        const response = await api.get("jobs/match-history/");

        if (isMounted) {
          setHistory(response.data.results || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.error ||
              "Unable to load job match history. Please try again."
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

  const handleDelete = async (historyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job match history?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(historyId);
      setError("");

      await api.delete(
        `jobs/match-history/${historyId}/delete/`
      );

      setHistory((prev) =>
        prev.filter((item) => item.id !== historyId)
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Unable to delete history. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHistory = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = history.filter((item) => {
      const jobTitle = (item.job_title || "").toLowerCase();
      const company = (item.company || "").toLowerCase();
      const score = Number(item.match_score) || 0;

      const matchesSearch =
        jobTitle.includes(search) || company.includes(search);

      let matchesScore = true;

      if (scoreFilter === "high") {
        matchesScore = score >= 70;
      } else if (scoreFilter === "medium") {
        matchesScore = score >= 40 && score < 70;
      } else if (scoreFilter === "low") {
        matchesScore = score < 40;
      }

      return matchesSearch && matchesScore;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sortBy === "highest") {
        return (
          Number(b.match_score || 0) -
          Number(a.match_score || 0)
        );
      }

      if (sortBy === "lowest") {
        return (
          Number(a.match_score || 0) -
          Number(b.match_score || 0)
        );
      }

      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    });
  }, [history, searchTerm, scoreFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setScoreFilter("all");
    setSortBy("latest");
  };

  return (
    <main className="job-history-page">
      <div className="job-history-container">
        <header className="job-history-header">
          <div>
            <p className="job-history-eyebrow">
              HIREX CAREER TRACKER
            </p>

            <h1>Job Match History</h1>

            <p className="job-history-subtitle">
              Review your previous job matches and skill gaps.
            </p>
          </div>

          <Link
            to="/recommended_jobs"
            className="job-history-back"
          >
            Explore Jobs
          </Link>
        </header>

        {!loading && !error && (
          <section className="job-history-summary">
            <span className="job-history-summary-icon">📊</span>

            <div>
              <p>Total match checks</p>
              <h2>{history.length}</h2>
            </div>
          </section>
        )}

        {!loading && !error && history.length > 0 && (
          <section className="job-history-filters">
            <div className="job-history-search">
              <label htmlFor="history-search">
                Search jobs
              </label>

              <input
                id="history-search"
                type="search"
                placeholder="Search job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="job-history-filter-field">
              <label htmlFor="score-filter">
                Match score
              </label>

              <select
                id="score-filter"
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
              >
                <option value="all">All scores</option>
                <option value="high">High (70% and above)</option>
                <option value="medium">Medium (40–69%)</option>
                <option value="low">Low (below 40%)</option>
              </select>
            </div>

            <div className="job-history-filter-field">
              <label htmlFor="history-sort">
                Sort by
              </label>

              <select
                id="history-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest match score</option>
                <option value="lowest">Lowest match score</option>
              </select>
            </div>

            <button
              type="button"
              className="job-history-clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>

            <p className="job-history-results-count">
              Showing {filteredHistory.length} of {history.length} records
            </p>
          </section>
        )}

        {loading && (
          <div className="job-history-state">
            <div className="job-history-spinner" />
            <p>Loading your match history...</p>
          </div>
        )}

        {error && (
          <div className="job-history-error">
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
          <div className="job-history-empty">
            <div className="job-history-empty-icon">🎯</div>

            <h2>No match history yet</h2>

            <p>
              Match your resume with a job to see your results here.
            </p>

            <Link
              to="/recommended_jobs"
              className="job-history-primary"
            >
              Find Matching Jobs
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          history.length > 0 &&
          filteredHistory.length === 0 && (
            <div className="job-history-empty">
              <div className="job-history-empty-icon">🔎</div>

              <h2>No matching records found</h2>

              <p>
                Try another job title, company name or match score filter.
              </p>

              <button
                type="button"
                className="job-history-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}

        {!loading && !error && filteredHistory.length > 0 && (
          <section className="job-history-list">
            {filteredHistory.map((item) => {
              const score = Number(item.match_score) || 0;

              return (
                <article
                  className="job-history-card"
                  key={item.id}
                >
                  <div className="job-history-card-top">
                    <div className="job-history-company-icon">
                      {item.company?.charAt(0)?.toUpperCase() || "J"}
                    </div>

                    <div className="job-history-job-info">
                      <h2>{item.job_title}</h2>
                      <p>{item.company}</p>
                    </div>

                    <div className="job-history-score">
                      <strong>{score}%</strong>
                      <span>Match score</span>
                    </div>
                  </div>

                  <div className="job-history-progress">
                    <div
                      className="job-history-progress-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, score)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="job-history-skills">
                    <div>
                      <h3>Matched skills</h3>

                      <div className="job-history-tags">
                        {item.matched_skills?.length ? (
                          item.matched_skills.map((skill) => (
                            <span
                              className="matched-tag"
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="job-history-muted">
                            No matched skills
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3>Skills to learn</h3>

                      <div className="job-history-tags">
                        {item.missing_skills?.length ? (
                          item.missing_skills.map((skill) => (
                            <span
                              className="missing-tag"
                              key={skill}
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="job-history-muted">
                            No missing skills
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <footer className="job-history-card-footer">
                    <span>
                      Checked{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "Recently"}
                    </span>

                    <div className="job-history-actions">
                      <Link
                        to={`/resume/${item.resume_id}/analysis`}
                      >
                        View Resume Analysis →
                      </Link>

                      <button
                        type="button"
                        className="job-history-delete"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId !== null}
                      >
                        {deletingId === item.id
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>
                    </div>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

export default JobMatchHistory;