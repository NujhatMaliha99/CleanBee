import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createAreaReport, getMyAreaReports } from "../services/areaReportService";
import "./AreaReports.css";

const AREA_OPTIONS = ["All Areas", "Dhanmondi", "Mirpur", "Gulshan", "Uttara", "Banani"];

const WASTE_TYPES = [
  { value: "plastic", label: "Plastic" },
  { value: "organic", label: "Organic Waste" },
  { value: "paper", label: "Paper and Cardboard" },
  { value: "e-waste", label: "E-Waste" },
  { value: "glass", label: "Glass" },
  { value: "metal", label: "Metal" },
  { value: "mixed", label: "Mixed Waste" },
];

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

const formatStatus = (status) =>
  (status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date) => {
  if (!date) return "Unknown date";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function AreaReports() {
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [wasteType, setWasteType] = useState("plastic");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyAreaReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load area reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getMyAreaReports()
      .then((data) => {
        if (active) setReports(Array.isArray(data) ? data : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Failed to load area reports.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    if (selectedArea === "All Areas") return reports;
    return reports.filter((report) =>
      (report.address || "").toLowerCase().includes(selectedArea.toLowerCase())
    );
  }, [reports, selectedArea]);

  const summary = useMemo(() => ({
    total: filteredReports.length,
    pending: filteredReports.filter((report) => report.status === "pending").length,
    assigned: filteredReports.filter((report) => ["assigned", "in_progress"].includes(report.status)).length,
    resolved: filteredReports.filter((report) => report.status === "resolved").length,
  }), [filteredReports]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setWasteType("plastic");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setImage(null);
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      const createdReport = await createAreaReport({
        title: title.trim(),
        description: description.trim(),
        waste_type: wasteType,
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        image,
      });

      setReports((current) => [createdReport, ...current]);
      setToast("Area report submitted successfully.");
      setShowModal(false);
      resetForm();
      setTimeout(() => setToast(""), 4000);
    } catch (requestError) {
      setError(requestError.message || "Failed to submit area report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ar-page">
      <header className="ar-topbar">
        <span className="ar-logo">Clean<span className="ar-accent">Bee</span></span>
        <div className="ar-topbar-right">
          <Link to="/dashboard" className="ar-btn ar-btn-ghost ar-btn-sm">
            <ArrowLeftIcon /> Back to Dashboard
          </Link>
        </div>
      </header>

      {toast && <div className="ar-toast">✓ {toast}</div>}

      <main className="ar-main">
        <div className="ar-page-head ar-page-head--actions">
          <div>
            <span className="ar-kicker">Community Cleanliness</span>
            <h1>My Area Reports</h1>
            <p className="ar-subtitle">View reports saved in the CleanBee database and report a new dirty spot.</p>
          </div>
          <button type="button" className="ar-btn ar-btn-primary" onClick={() => setShowModal(true)}>
            + Report a Dirty Spot
          </button>
        </div>

        <div className="ar-filter-row">
          <label htmlFor="user-area-select" className="ar-filter-label">Filter by area</label>
          <select id="user-area-select" className="ar-select" value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
            {AREA_OPTIONS.map((area) => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>

        <section className="ar-summary" aria-label="Area report summary">
          <div className="ar-sum-card"><strong>{summary.total}</strong><span>Total Reports</span></div>
          <div className="ar-sum-card ar-sum-card--pending"><strong>{summary.pending}</strong><span>Pending</span></div>
          <div className="ar-sum-card"><strong>{summary.assigned}</strong><span>Assigned</span></div>
          <div className="ar-sum-card ar-sum-card--completed"><strong>{summary.resolved}</strong><span>Resolved</span></div>
        </section>

        {error && <div className="ar-error">{error}</div>}

        <section>
          <div className="ar-section-title">
            <h3>{selectedArea === "All Areas" ? "All My Reports" : `My Reports in ${selectedArea}`} ({filteredReports.length})</h3>
            <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={loadReports}>Refresh</button>
          </div>

          {loading ? (
            <div className="ar-state">Loading reports from database...</div>
          ) : filteredReports.length === 0 ? (
            <div className="ar-state">
              <p>No area reports found.</p>
              <button type="button" className="ar-btn ar-btn-primary ar-btn-sm" onClick={() => setShowModal(true)}>+ Create Report</button>
            </div>
          ) : (
            <div className="ar-report-list">
              {filteredReports.map((report) => (
                <article key={report.id} className="ar-report-card">
                  <div className="ar-report-heading">
                    <div>
                      <strong>{report.title}</strong>
                      <span className="ar-report-type">{formatStatus(report.waste_type)}</span>
                    </div>
                    <span className={`ar-report-status ar-report-status--${report.status}`}>{formatStatus(report.status)}</span>
                  </div>
                  <p>{report.description}</p>
                  <span className="ar-report-address">📍 {report.address}</span>
                  <span className="ar-report-time">Reported {formatDate(report.created_at)}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <div className="ar-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ar-modal-card" onClick={(event) => event.stopPropagation()}>
            <h2 className="ar-modal-title">Report a Dirty Spot</h2>
            <p className="ar-modal-copy">Provide the location details required by the CleanBee report API.</p>
            {error && <div className="ar-error">{error}</div>}
            <form onSubmit={handleReportSubmit} className="ar-report-form">
              <div className="ar-field">
                <label htmlFor="report-title">Report Title</label>
                <input id="report-title" className="ar-input" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required />
              </div>

              <div className="ar-field">
                <label htmlFor="report-waste-type">Waste Type</label>
                <select id="report-waste-type" className="ar-input" value={wasteType} onChange={(event) => setWasteType(event.target.value)}>
                  {WASTE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>

              <div className="ar-field">
                <label htmlFor="report-address">Full Address</label>
                <input id="report-address" className="ar-input" value={address} onChange={(event) => setAddress(event.target.value)} maxLength={1000} required />
              </div>

              <div className="ar-coordinate-row">
                <div className="ar-field">
                  <label htmlFor="report-latitude">Latitude</label>
                  <input id="report-latitude" className="ar-input" type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} required />
                </div>
                <div className="ar-field">
                  <label htmlFor="report-longitude">Longitude</label>
                  <input id="report-longitude" className="ar-input" type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} required />
                </div>
              </div>

              <div className="ar-field">
                <label htmlFor="report-description">Description</label>
                <textarea id="report-description" className="ar-textarea" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} required />
              </div>

              <div className="ar-field">
                <label htmlFor="report-image">Photo (optional)</label>
                <input id="report-image" className="ar-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} />
              </div>

              <div className="ar-modal-actions">
                <button type="button" className="ar-btn ar-btn-ghost ar-btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="ar-btn ar-btn-primary ar-btn-sm" disabled={submitting}>{submitting ? "Submitting..." : "Submit Report"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
