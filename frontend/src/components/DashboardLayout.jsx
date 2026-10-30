import { NavLink, Outlet } from "react-router-dom";
import "./DashboardLayout.css";

const menuItems = [
  { path: "/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/resume", icon: "📄", label: "Resume" },
  { path: "/job_matcher", icon: "🎯", label: "Job Matcher" },
  { path: "/recommended_jobs", icon: "💼", label: "Recommended Jobs" },
  { path: "/skill_gap", icon: "📊", label: "Skill Gap" },
  { path: "/learning_roadmap", icon: "📚", label: "Learning Roadmap" },
  { path: "/history", icon: "🕘", label: "History" },
  { path: "/job_match_history", icon: "📋", label: "Match History" },
  { path: "/job_match_analytics", icon: "📈", label: "Match Analytics" },
];

function DashboardLayout() {
  return (
    <div className="dashboard-layout">

      <aside className="dashboard-sidebar">
        <NavLink to="/dashboard" className="dashboard-brand">
          Hire<span>X</span>
        </NavLink>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="dashboard-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `dashboard-menu-link ${isActive ? "active" : ""}`
              }
            >
              <span className="dashboard-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">✨</div>
          <div>
            <strong>HireX Career</strong>
            <p>Your next step starts here</p>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-page-content">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

export default DashboardLayout;