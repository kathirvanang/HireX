import { useState } from "react";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];


  if (!selectedFile) {
    return;
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (selectedFile.size > maxSize) {
    setError("File size must be less than 5 MB.");
    setFile(null);
    return;
  }

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(selectedFile.type)) {
    setError("Please select a PDF or DOCX file.");
    setFile(null);
    return;
  }

  setFile(selectedFile);
  setError("");
};


  const handleAnalyze = () => {
    if (!file) {
      setError("Please choose your resume first.");
      return;
    }
    setError("");
    setLoading(true);

    setTimeout(() => {
        setLoading(false);
        alert(`Resume selected: ${file.name}`);
    },1500);
    };

  return (
    <div className="resume-page">
      <div className="resume-card">
        <h1>Upload Your Resume</h1>

        <p>
          Upload your resume and let HireX analyze your
          skills, projects and experience.
        </p>

        <div className="upload-box">
          <h3>Choose your resume</h3>

          <p>PDF or DOCX files only</p>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />

          {file && (
            <p>
              Selected file: <strong>{file.name}</strong>
            </p>
          )}

          {error && (
            <p className="upload-error">
              {error}
            </p>
          )}

          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;