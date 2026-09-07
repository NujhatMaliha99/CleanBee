import { useState } from "react";
import { Link } from "react-router-dom";
import "./AreaReports.css";

const AREA_DATA = {
  dhanmondi: { name: "Dhanmondi", pending: 12, completed: 38, waste: 145, cleanliness: 76 },
  mirpur: { name: "Mirpur", pending: 8, completed: 29, waste: 112, cleanliness: 78 },
  gulshan: { name: "Gulshan", pending: 5, completed: 42, waste: 180, cleanliness: 89 },
  uttara: { name: "Uttara", pending: 10, completed: 35, waste: 128, cleanliness: 77 },
  banani: { name: "Banani", pending: 4, completed: 30, waste: 110, cleanliness: 88 },
};

const INITIAL_USER_REPORTS = [
  { id: 1, area: "Dhanmondi", spot: "Road 27 Park Footpath", status: "Pending", time: "2 hours ago", desc: "Overflowing bin with plastic bags on footpath." },
  { id: 2, area: "Dhanmondi", spot: "Lake Road Corner", status: "Resolved", time: "Yesterday", desc: "Uncollected cardboard waste near shop alley." },
];

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

const PinIconSm = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 5.6 8 12 8 12s8-6.4 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
  </svg>
);

export default function AreaReports({ isLoggedIn, onLogout }) {
  const [selectedAreaKey, setSelectedAreaKey] = useState("dhanmondi");
  const [showModal, setShowModal] = useState(false);
  const [spotName, setSpotName] = useState("");
  const [description, setDescription] = useState("");
  const [myReports, setMyReports] = useState(INITIAL_USER_REPORTS);
  const [toast, setToast] = useState("");

  const currentArea = AREA_DATA[selectedAreaKey] || AREA_DATA.dhanmondi;

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!spotName.trim() || !description.trim()) return;

    const newReport = {
      id: Date.now(),
      area: currentArea.name,
      spot: spotName.trim(),
      status: "Pending",
      time: "Just now",
      desc: description.trim(),
    };

    setMyReports([newReport, ...myReports]);
    setToast(`Report submitted for ${currentArea.name}! CleanBee team notified.`);
    setShowModal(false);
    setSpotName("");
    setDescription("");
    setTimeout(() => setToast(""), 4000);
  };

  const filteredUserReports = myReports.filter(
    (r) => r.area.toLowerCase() === currentArea.name.toLowerCase()
  );

  return (
    <div className="ar-page">
      {/* Top bar */}
      <header className="ar-topbar">
        <span className="ar-logo">
          Clean<span className="ar-accent">Bee</span>
        </span>
        <div className="ar-topbar-right">
          <Link to="/" className="ar-btn ar-btn-ghost ar-btn-sm">
            <ArrowLeftIcon /> Back to Home
          </Link>
        </div>
      </header>

      {toast && (
        <div style={{
          background: "#1f6b45",
          color: "#fff",
          padding: "12px min(5%, 40px)",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(31, 107, 69, 0.2)"
        }}>
          ✓ {toast}
        </div>
      )}

      <main className="ar-main">
        {/* Header & Area Selector */}
        <div className="ar-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="ar-kicker">Neighborhood Area Status</span>
            <h1 style={{ marginTop: "4px", marginBottom: "8px" }}>My Area Reports</h1>
            <p className="ar-subtitle">
              Monitor cleanliness levels and report uncleaned waste spots in your area.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label htmlFor="user-area-select" style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink-soft)" }}>
                Select Your Area:
              </label>
              <select
                id="user-area-select"
                className="ar-select"
                value={selectedAreaKey}
                onChange={(e) => setSelectedAreaKey(e.target.value)}
                style={{ fontWeight: 600, color: "var(--forest-soft)" }}
              >
                <option value="dhanmondi">📍 Dhanmondi</option>
                <option value="mirpur">📍 Mirpur</option>
                <option value="gulshan">📍 Gulshan</option>
                <option value="uttara">📍 Uttara</option>
                <option value="banani">📍 Banani</option>
              </select>
            </div>

            <button
              type="button"
              className="ar-btn ar-btn-primary"
              style={{ marginTop: "18px" }}
              onClick={() => setShowModal(true)}
            >
              + Report a Dirty Spot
            </button>
          </div>
        </div>

        {/* Selected Area Card Overview */}
        <div className="ar-area-card" style={{ background: "#ffffff", marginBottom: "28px" }}>
          <div className="ar-area-header">
            <div className="ar-area-title-row">
              <span className="ar-area-icon"><PinIconSm /></span>
              <h2 style={{ fontSize: "22px", margin: 0 }}>{currentArea.name} Area Overview</h2>
            </div>
            <span className="ar-kicker" style={{ background: "rgba(31, 107, 69, 0.1)", margin: 0 }}>
              {currentArea.cleanliness}% Clean & Maintained
            </span>
          </div>

          <div className="ar-progress-section" style={{ margin: "20px 0" }}>
            <div className="ar-progress-label">
              <span>Cleanliness Level</span>
              <span className="ar-progress-pct">{currentArea.cleanliness}%</span>
            </div>
            <div className="ar-progress-track">
              <div className="ar-progress-fill" style={{ width: `${currentArea.cleanliness}%` }} />
            </div>
          </div>

          <div className="ar-stats-row">
            <div className="ar-stat">
              <span className="ar-stat-val ar-stat-pending">{currentArea.pending}</span>
              <span className="ar-stat-lbl">Active Pickups in {currentArea.name}</span>
            </div>
            <div className="ar-stat">
              <span className="ar-stat-val ar-stat-completed">{currentArea.completed}</span>
              <span className="ar-stat-lbl">Cleanups Completed</span>
            </div>
            <div className="ar-stat ar-stat-wide">
              <span className="ar-stat-val">{currentArea.waste} <small>kg</small></span>
              <span className="ar-stat-lbl">Total Waste Removed</span>
            </div>
          </div>
        </div>

        {/* My Area Reported Spots List */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
              My Reported Spots in {currentArea.name} ({filteredUserReports.length})
            </h3>
            <button
              type="button"
              className="ar-btn ar-btn-primary ar-btn-sm"
              onClick={() => setShowModal(true)}
            >
              + Report New Spot
            </button>
          </div>

          {filteredUserReports.length === 0 ? (
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
              border: "1px dashed rgba(31, 107, 69, 0.2)",
              color: "var(--ink-soft)"
            }}>
              <p style={{ margin: 0, fontWeight: 500 }}>No spots reported yet in {currentArea.name}.</p>
              <button
                type="button"
                className="ar-btn ar-btn-ghost ar-btn-sm"
                style={{ marginTop: "12px" }}
                onClick={() => setShowModal(true)}
              >
                + Report a Dirty Spot in {currentArea.name}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredUserReports.map((item) => (
                <div key={item.id} style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "18px 22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  border: "1px solid rgba(31, 107, 69, 0.1)"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "16px" }}>{item.spot}</strong>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background: item.status === "Resolved" ? "rgba(46, 139, 87, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: item.status === "Resolved" ? "#1f6b45" : "#d97706"
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink-soft)" }}>{item.desc}</p>
                    <span style={{ fontSize: "12px", color: "#888", display: "block", marginTop: "4px" }}>Reported {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal for reporting a dirty spot in selected area */}
      {showModal && (
        <div className="ar-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ar-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="ar-modal-title">Report Dirty Spot in {currentArea.name}</h2>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--ink-soft)" }}>
              Report an uncleaned street, overflowing bin, or waste spot in {currentArea.name} for volunteer cleanup.
            </p>
            <form onSubmit={handleReportSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="ar-field">
                <label htmlFor="modal-spot-name">Spot Name / Location Landmark</label>
                <input
                  id="modal-spot-name"
                  className="ar-input"
                  type="text"
                  placeholder="e.g. Road 27 park gate, Alley near Green Hospital..."
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                  required
                />
              </div>

              <div className="ar-field">
                <label htmlFor="modal-desc">Details / Description of Waste</label>
                <textarea
                  id="modal-desc"
                  className="ar-textarea"
                  rows={3}
                  placeholder="e.g. Overflowing plastic waste bin creating blockage on footpath..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="ar-modal-actions">
                <button
                  type="button"
                  className="ar-btn ar-btn-ghost ar-btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ar-btn ar-btn-primary ar-btn-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
