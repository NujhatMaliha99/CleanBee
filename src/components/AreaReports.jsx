import { useState } from "react";
import { Link } from "react-router-dom";
import "./AreaReports.css";

const AREA_REPORTS = [
  { id: "dhanmondi", area: "Dhanmondi", pending: 12, completed: 38, wasteCollected: 145 },
  { id: "mirpur", area: "Mirpur", pending: 8, completed: 29, wasteCollected: 112 },
  { id: "gulshan", area: "Gulshan", pending: 5, completed: 42, wasteCollected: 180 },
  { id: "uttara", area: "Uttara", pending: 10, completed: 35, wasteCollected: 128 },
];

/* ── Helpers ── */
function getProgress(completed, pending) {
  const total = completed + pending;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function getActivityLabel(pending, completed) {
  const ratio = pending / ((completed + pending) || 1);
  if (ratio > 0.3) return { label: "High Activity", cls: "ar-badge--high" };
  if (ratio > 0.15) return { label: "Moderate Activity", cls: "ar-badge--moderate" };
  return { label: "Low Activity", cls: "ar-badge--low" };
}

/* ── Icons ── */
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

const PinIconSm = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.6 8 12 8 12s8-6.4 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
  </svg>
);

/* ── Individual Area Card ── */
function AreaCard({ data }) {
  const progress = getProgress(data.completed, data.pending);
  const activity = getActivityLabel(data.pending, data.completed);

  return (
    <article className="ar-area-card">
      {/* Header row */}
      <div className="ar-area-header">
        <div className="ar-area-title-row">
          <span className="ar-area-icon"><PinIconSm /></span>
          <h3>{data.area}</h3>
        </div>
        <span className={`ar-badge ${activity.cls}`}>{activity.label}</span>
      </div>

      {/* Progress bar — percentage calculated dynamically */}
      <div className="ar-progress-section">
        <div className="ar-progress-label">
          <span>Cleanup Progress</span>
          <span className="ar-progress-pct">{progress}%</span>
        </div>
        <div className="ar-progress-track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${data.area} cleanup progress`}>
          <div className="ar-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="ar-stats-row">
        <div className="ar-stat">
          <span className="ar-stat-val ar-stat-pending">{data.pending}</span>
          <span className="ar-stat-lbl">Pending Pickups</span>
        </div>
        <div className="ar-stat">
          <span className="ar-stat-val ar-stat-completed">{data.completed}</span>
          <span className="ar-stat-lbl">Completed</span>
        </div>
        <div className="ar-stat ar-stat-wide">
          <span className="ar-stat-val">{data.wasteCollected} <small>kg</small></span>
          <span className="ar-stat-lbl">Waste Collected</span>
        </div>
      </div>
    </article>
  );
}

/* ── Page Component ── */
export default function AreaReports({ isLoggedIn, onLogout }) {
  const [selectedArea, setSelectedArea] = useState("all");

  /* Filter logic — pure React state, no API */
  const filtered = selectedArea === "all"
    ? AREA_REPORTS
    : AREA_REPORTS.filter((r) => r.id === selectedArea);

  /* Summary totals computed from mock data — never hardcoded */
  const totalPending = AREA_REPORTS.reduce((s, r) => s + r.pending, 0);
  const totalCompleted = AREA_REPORTS.reduce((s, r) => s + r.completed, 0);
  const totalWaste = AREA_REPORTS.reduce((s, r) => s + r.wasteCollected, 0);

  return (
    <div className="ar-page">

      {/* ── Top bar ── */}
      <header className="ar-topbar">
        <span className="ar-logo">
          Clean<span className="ar-accent">Bee</span>
        </span>
        <div className="ar-topbar-right">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="ar-btn ar-btn-ghost ar-btn-sm">Dashboard</Link>
              <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/" className="ar-btn ar-btn-ghost ar-btn-sm">
              <ArrowLeftIcon /> Home
            </Link>
          )}
        </div>
      </header>

      <main className="ar-main">

        {/* ── Page heading ── */}
        <div className="ar-page-head">
          <h1>Area Reports</h1>
          <p className="ar-subtitle">
            Track cleanup activity and pending pickups across your neighborhood.
          </p>
        </div>

        {/* ── Overall summary stats (computed from mock data) ── */}
        <section className="ar-summary" aria-label="Overall statistics">
          <div className="ar-sum-card">
            <strong>{AREA_REPORTS.length}</strong>
            <span>Total Areas</span>
          </div>
          <div className="ar-sum-card ar-sum-card--pending">
            <strong>{totalPending}</strong>
            <span>Pending Pickups</span>
          </div>
          <div className="ar-sum-card ar-sum-card--completed">
            <strong>{totalCompleted}</strong>
            <span>Completed Pickups</span>
          </div>
          <div className="ar-sum-card ar-sum-card--waste">
            <strong>{totalWaste} <small>kg</small></strong>
            <span>Waste Collected</span>
          </div>
        </section>

        {/* ── Area filter ── */}
        <div className="ar-filter-row">
          <label htmlFor="ar-area-select" className="ar-filter-label">Select Area</label>
          <select
            id="ar-area-select"
            className="ar-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="all">All Areas</option>
            {AREA_REPORTS.map((r) => (
              <option key={r.id} value={r.id}>{r.area}</option>
            ))}
          </select>
        </div>

        {/* ── Area cards grid ── */}
        <div className="ar-grid">
          {filtered.map((r) => (
            <AreaCard key={r.id} data={r} />
          ))}
        </div>
      </main>
    </div>
  );
}
