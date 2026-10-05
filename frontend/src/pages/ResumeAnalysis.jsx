import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function ResumeAnalysis() {
  const { resumeId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await api.get(
          `resumes/${resumeId}/analysis/`
        );

        setAnalysis(response.data);
      } catch (error) {
        console.error("ANALYSIS ERROR:", error);
        setError("Failed to load resume analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="analysis-state">
        <div className="analysis-spinner"></div>
        <p>Analyzing your resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-state analysis-error-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  const score = Number(analysis.resume_score || 0);

  const skillCount = analysis.skills?.length || 0;
  const projectCount = analysis.projects?.length || 0;
  const certificationCount =
    analysis.certifications?.length || 0;

  const scoreDegree = score * 3.6;

  return (
    <div className="analysis-page">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="analysis-hero">

        <div className="hero-content">

          <div className="analysis-badge">
            <span className="badge-dot"></span>
            AI Resume Analysis
          </div>

          <h1>
            Resume Analysis
          </h1>

          <p className="hero-description">
            Get an AI-powered overview of your resume,
            skills, projects and career readiness.
          </p>

          <div className="candidate-info">
            <div className="candidate-avatar">
              {analysis.name?.charAt(0) || "U"}
            </div>

            <div>
              <h3>{analysis.name || "Unknown Candidate"}</h3>
              <p>{analysis.email || "No email found"}</p>
            </div>
          </div>

        </div>

        {/* Score */}

        <div className="score-ring-wrapper">

          <div
            className="score-ring"
            style={{
              background: `conic-gradient(
                #06b6d4 ${scoreDegree}deg,
                rgba(255,255,255,0.12) ${scoreDegree}deg
              )`,
            }}
          >
            <div className="score-ring-inner">
              <strong>{score}</strong>
              <span>/ 100</span>
            </div>
          </div>

          <p className="score-label">Resume Score</p>

          <span className="score-status">
            {score >= 80
              ? "Excellent"
              : score >= 60
              ? "Good foundation"
              : "Needs improvement"}
          </span>

        </div>

      </section>


      {/* =========================================
          QUICK METRICS
      ========================================= */}

      <section className="metric-grid">

        <div className="metric-card">
          <div className="metric-icon">✦</div>
          <div>
            <span>Skills Found</span>
            <strong>{skillCount}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">◈</div>
          <div>
            <span>Projects</span>
            <strong>{projectCount}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">◇</div>
          <div>
            <span>Certifications</span>
            <strong>{certificationCount}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✓</div>
          <div>
            <span>AI Analysis</span>
            <strong>Ready</strong>
          </div>
        </div>

      </section>


      {/* =========================================
          SKILLS
      ========================================= */}

      <section className="analysis-card">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              TECHNICAL PROFILE
            </span>

            <h2>Skills & Expertise</h2>
          </div>

          <span className="section-count">
            {skillCount} skills
          </span>
        </div>

        <div className="skills-container">

          {analysis.skills?.map((skill, index) => (
            <span
              className="premium-skill"
              key={index}
            >
              {skill}
            </span>
          ))}

        </div>

      </section>


      {/* =========================================
          EDUCATION
      ========================================= */}

      <section className="analysis-card">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              ACADEMIC BACKGROUND
            </span>

            <h2>Education</h2>
          </div>
        </div>

        <div className="education-list">

          {analysis.education?.map(
            (education, index) => (
              <div
                className="education-item"
                key={index}
              >

                <div className="education-icon">
                  🎓
                </div>

                <div className="education-content">

                  <h3>
                    {education.degree}
                  </h3>

                  <p className="education-institution">
                    {education.institution}
                  </p>

                  <div className="education-meta">

                    {education.cgpa && (
                      <span>
                        CGPA {education.cgpa}
                      </span>
                    )}

                    {education.duration && (
                      <span>
                        {education.duration}
                      </span>
                    )}

                    {education.location && (
                      <span>
                        {education.location}
                      </span>
                    )}

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </section>


      {/* =========================================
          PROJECTS
      ========================================= */}

      <section className="analysis-card">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              PRACTICAL EXPERIENCE
            </span>

            <h2>Projects</h2>
          </div>

          <span className="section-count">
            {projectCount} projects
          </span>
        </div>

        <div className="projects-grid">

          {analysis.projects?.map(
            (project, index) => (
              <article
                className="project-card"
                key={index}
              >

                <div className="project-top">

                  <div className="project-number">
                    0{index + 1}
                  </div>

                  <span className="project-status">
                    {project.status || "Project"}
                  </span>

                </div>

                <h3>
                  {project.name}
                </h3>

                <p>
                  {project.description}
                </p>

                {project.tech_stack && (
                  <div className="project-tech">
                    {project.tech_stack
                      .split(",")
                      .map((tech, techIndex) => (
                        <span key={techIndex}>
                          {tech.trim()}
                        </span>
                      ))}
                  </div>
                )}

              </article>
            )
          )}

        </div>

      </section>


      {/* =========================================
          CERTIFICATIONS
      ========================================= */}

      <section className="analysis-card">

        <div className="section-heading">

          <div>
            <span className="section-eyebrow">
              ACHIEVEMENTS
            </span>

            <h2>Certifications</h2>
          </div>

          <span className="section-count">
            {certificationCount}
          </span>

        </div>

        <div className="certification-grid">

          {analysis.certifications?.map(
            (certificate, index) => (
              <div
                className="certification-item"
                key={index}
              >
                <div className="certificate-icon">
                  ✓
                </div>

                <span>{certificate}</span>
              </div>
            )
          )}

        </div>

      </section>
{/* =========================================
          AI INSIGHTS
      ========================================= */}

      <section className="analysis-card ai-insights-section">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              AI CAREER INSIGHTS
            </span>

            <h2>Strengths & Improvements</h2>
          </div>

          <span className="section-count">
            AI Powered
          </span>
        </div>

        <div className="ai-insights-grid">

          {/* Strengths */}

          <div className="ai-insight-card strength-card">

            <div className="ai-insight-header">
              <div className="ai-insight-icon strength-icon">
                ✓
              </div>

              <div>
                <h3>Your Strengths</h3>
                <p>What stands out in your resume</p>
              </div>
            </div>

            <div className="ai-insight-list">

              {analysis.strengths?.length > 0 ? (
                analysis.strengths.map(
                  (strength, index) => (
                    <div
                      className="ai-insight-item"
                      key={index}
                    >
                      <span>✓</span>
                      <p>{strength}</p>
                    </div>
                  )
                )
              ) : (
                <p className="empty-insight">
                  No strengths available yet.
                </p>
              )}

            </div>

          </div>


          {/* Improvements */}

          <div className="ai-insight-card improvement-card">

            <div className="ai-insight-header">
              <div className="ai-insight-icon improvement-icon">
                ↑
              </div>

              <div>
                <h3>Areas to Improve</h3>
                <p>AI recommendations for your resume</p>
              </div>
            </div>

            <div className="ai-insight-list">

              {analysis.suggestions?.length > 0 ? (
                analysis.suggestions.map(
                  (suggestion, index) => (
                    <div
                      className="ai-insight-item"
                      key={index}
                    >
                      <span>→</span>
                      <p>{suggestion}</p>
                    </div>
                  )
                )
              ) : (
                <p className="empty-insight">
                  No suggestions available yet.
                </p>
              )}

            </div>

          </div>

        </div>

      </section>
      
      <div className="analysis-note">
        <span>✦</span>
        <p>
          Your HireX score is an AI-generated assessment
          based on the information available in your resume.
        </p>
      </div>

    </div>
  );
}

export default ResumeAnalysis;