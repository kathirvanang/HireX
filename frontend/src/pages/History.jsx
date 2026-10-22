import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("resumes/history/");

        if (active) {
          setHistory(response.data.results || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to load history. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      active = false;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileName = (fileName) => {
    if (!fileName) return "Resume";

    return fileName.split("/").pop();
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <span className="history-eyebrow">YOUR ACTIVITY</span>
          <h1>Resume History</h1>
          <p>
            View your previous resume uploads and analysis results.
          </p>
        </div>

        <Link to="/resume" className="history-upload-btn">
          + Upload Resume
        </Link>
      </div>

      {!loading && !error && (
        <div className="history-summary">
          <div className="history-summary-icon">📄</div>
          <div>
            <span>Total Resume Analyses</span>
            <h2>{history.length}</h2>
          </div>
        </div>
      )}

      {loading && (
        <div className="history-message">
          <div className="history-spinner"></div>
          <p>Loading your resume history...</p>
        </div>
      )}

      {!loading && error && (
        <div className="history-error">
          <h3>Unable to load history</h3>
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
        <div className="history-empty">
          <div className="history-empty-icon">📂</div>
          <h2>No resume history yet</h2>
          <p>
            Upload your first resume to see your analysis history here.
          </p>
          <Link to="/resume" className="history-upload-btn">
            Upload Your Resume
          </Link>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <article
              className="history-card"
              key={item.resume_id}
            >
              <div className="history-card-top">
                <div className="history-file-icon">📄</div>

                <div className="history-file-info">
                  <h3>{getFileName(item.file_name)}</h3>
                  <p>
                    Resume ID: #{item.resume_id}
                  </p>
                  <p className="history-date">
                    <span>🕒</span>{" "}
                    {formatDate(item.uploaded_at)}
                  </p>
                </div>

                <div className="history-score">
                  <span>Resume Score</span>
                  <strong>
                    {item.resume_score != null
                      ? `${item.resume_score}%`
                      : "N/A"}
                  </strong>
                </div>
              </div>

              <div className="history-skills">
                <h4>Detected Skills</h4>

                {Array.isArray(item.skills) &&
                item.skills.length > 0 ? (
                  <div className="history-skill-tags">
                    {item.skills.slice(0, 8).map((skill, index) => (
                      <span key={`${item.resume_id}-${index}`}>
                        {typeof skill === "string"
                          ? skill
                          : skill.name || String(skill)}
                      </span>
                    ))}

                    {item.skills.length > 8 && (
                      <span>
                        +{item.skills.length - 8} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="history-no-skills">
                    No skills available.
                  </p>
                )}
              </div>

              <div className="history-card-footer">
                <span className="history-status">
                  ✓ Analysis record available
                </span>

                <Link
                  to={`/resume/${item.resume_id}/analysis`}
                  className="history-view-btn"
                >
                  View Analysis →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;