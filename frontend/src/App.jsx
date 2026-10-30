import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ProtectedRoute from "./ProtectedRoute";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import JobMatcher from "./pages/JobMatcher";
import SkillGap from "./pages/SkillGap";
import RecommendedJobs from "./pages/Recommended";
import LearningRoadmap from "./pages/LearningRoadmap";
import History from "./pages/History";
import JobMatchHistory from "./pages/JobMatchHistory";
import JobMatchAnalytics from "./pages/JobMatchAnalytics";

import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Pages with Shared Sidebar */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/resume" element={<ResumeUpload />} />

          <Route
            path="/resume/:resumeId/analysis"
            element={<ResumeAnalysis />}
          />

          <Route path="/job_matcher" element={<JobMatcher />} />

          <Route path="/skill_gap" element={<SkillGap />} />

          <Route
            path="/learning_roadmap"
            element={<LearningRoadmap />}
          />

          <Route
            path="/recommended_jobs"
            element={<RecommendedJobs />}
          />

          <Route path="/history" element={<History />} />

          <Route
            path="/job_match_history"
            element={<JobMatchHistory />}
          />

          <Route
            path="/job_match_analytics"
            element={<JobMatchAnalytics />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;