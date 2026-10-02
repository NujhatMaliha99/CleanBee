import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { adminApi } from "../../services/api";
import "./AdminDashboard.css";

const fullName = (user) => {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  return name || "Unknown user";
};

/* -------------------------------------------------------------------------- */
/* 1. STATUS BADGE COMPONENT                                                  */
/* -------------------------------------------------------------------------- */
export function StatusBadge({ status, customLabel }) {
  const norm = (status || "pending").toLowerCase();
  const config = {
    pending: { label: "Pending", cls: "status-badge-pending" },
    approved: { label: "Approved", cls: "status-badge-approved" },
    rejected: { label: "Rejected", cls: "status-badge-rejected" },
    clearer_photo_requested: { label: "Clearer Photo Requested", cls: "status-badge-warning" },
    corrections_requested: { label: "Corrections Requested", cls: "status-badge-warning" },
    in_progress: { label: "In Progress", cls: "status-badge-info" },
    completed: { label: "Completed", cls: "status-badge-success" },
    active: { label: "Active", cls: "status-badge-approved" },
    suspended: { label: "Suspended", cls: "status-badge-rejected" },
  }[norm] || { label: customLabel || status || "Pending", cls: "status-badge-default" };

  return (
    <span className={`admin-status-badge ${config.cls}`}>
      <span className="badge-dot" />
      {customLabel || config.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. CONFIRM ACTION MODAL COMPONENT                                         */
/* -------------------------------------------------------------------------- */
export function ConfirmActionModal({
  isOpen,
  title,
  message,
  actionType = "approve",
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireReason = false,
  reasonPlaceholder = "Provide a reason or note...",
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError("Please provide a reason before proceeding.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
    setReason("");
  };

  const btnCls = actionType === "reject" ? "admin-btn-danger" : actionType === "warning" ? "admin-btn-warning" : "admin-btn-success";

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="admin-modal-header">
          <div className={`admin-modal-icon icon-${actionType}`}>
            {actionType === "reject" ? "✕" : actionType === "warning" ? "⚠️" : "✓"}
          </div>
          <h3 className="admin-modal-title">{title}</h3>
        </div>
        <div className="admin-modal-body">
          <p className="admin-modal-message">{message}</p>
          <div className="admin-modal-reason-group">
            <label className="admin-input-label">Reason / Admin Note {requireReason && "*"}</label>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              disabled={isProcessing}
            />
            {error && <p style={{ color: "#d32f2f", fontSize: "12px", marginTop: "4px" }}>{error}</p>}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel} disabled={isProcessing}>
            {cancelText}
          </button>
          <button type="button" className={`admin-btn ${btnCls}`} onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. FILTERS COMPONENT                                                       */
/* -------------------------------------------------------------------------- */
export function ApprovalFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  areaFilter,
  onAreaChange,
  sortBy,
  onSortChange,
  onResetFilters,
  statusOptions = ["all", "pending", "approved", "rejected", "action_needed"],
  areaOptions = ["all", "Banani", "Dhanmondi", "Gulshan", "Uttara", "Mirpur", "Mohammadpur", "Downtown"],
}) {
  const isFiltered = searchTerm !== "" || statusFilter !== "all" || dateFilter !== "all" || areaFilter !== "all" || sortBy !== "newest";

  return (
    <div className="admin-filters-container">
      <div className="admin-filters-grid">
        <div className="admin-filter-item search-item">
          <label className="filter-label">Search</label>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="admin-input search-input"
              placeholder="Search by name, ID, location, waste..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && <button type="button" className="clear-search-btn" onClick={() => onSearchChange("")}>×</button>}
          </div>
        </div>
        <div className="admin-filter-item">
          <label className="filter-label">Status</label>
          <select className="admin-select" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? "All Statuses" : opt === "action_needed" ? "Action Needed" : opt.charAt(0).toUpperCase() + opt.slice(1).replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-filter-item">
          <label className="filter-label">Area / Zone</label>
          <select className="admin-select" value={areaFilter} onChange={(e) => onAreaChange(e.target.value)}>
            {areaOptions.map((area) => (
              <option key={area} value={area}>{area === "all" ? "All Areas" : area}</option>
            ))}
          </select>
        </div>
        <div className="admin-filter-item">
          <label className="filter-label">Date Filter</label>
          <select className="admin-select" value={dateFilter} onChange={(e) => onDateChange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div className="admin-filter-item">
          <label className="filter-label">Sort Order</label>
          <select className="admin-select" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      {isFiltered && (
        <div className="admin-filters-actions">
          <button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={onResetFilters}>
            ↺ Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. DETAILS DRAWER COMPONENT                                                */
/* -------------------------------------------------------------------------- */
export function ApprovalDetailsDrawer({
  isOpen,
  onClose,
  item,
  type,
  onApprove,
  onReject,
  onRequestClearerPhoto,
  onRequestCorrections,
  onAssignVolunteer,
  onUpdateSchedule,
  volunteersList = [],
}) {
  const [reason, setReason] = useState("");
  const [selectedVol, setSelectedVol] = useState("");
  const [newTime, setNewTime] = useState("");
  const [fullPhoto, setFullPhoto] = useState(null);

  if (!isOpen || !item) return null;

  const handleAct = (fn, reqReason = false, defMsg = "") => {
    const finalR = reason.trim() || defMsg;
    if (reqReason && !finalR) return alert("Please enter a reason.");
    fn(item, finalR);
    setReason("");
  };

  return (
    <>
      <div className="admin-drawer-overlay" onClick={onClose} />
      <aside className="admin-drawer-container">
        <div className="admin-drawer-header">
          <div>
            <span className="drawer-type-tag">{type?.toUpperCase()} DETAILS</span>
            <h2 className="drawer-title">Request #{item.id}</h2>
            <StatusBadge status={item.status || item.admin_review_status} />
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-drawer-content">
          {(item.photoUrl || item.photo) && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Submitted Photo</h4>
              <div className="drawer-photo-preview-wrap">
                <img src={item.photoUrl || item.photo} alt="Proof" className="drawer-photo-img" onClick={() => setFullPhoto(item.photoUrl || item.photo)} />
                <button type="button" className="drawer-zoom-btn" onClick={() => setFullPhoto(item.photoUrl || item.photo)}>🔍 Zoom Image</button>
              </div>
            </div>
          )}

          <div className="drawer-section">
            <h4 className="drawer-section-title">User & Location</h4>
            <div className="drawer-info-grid">
              <div className="drawer-info-item"><span className="info-label">Name</span><span className="info-value">{item.userName || item.requesterName || item.volunteerName || item.name || "N/A"}</span></div>
              <div className="drawer-info-item"><span className="info-label">Email</span><span className="info-value">{item.userEmail || item.email || "N/A"}</span></div>
              <div className="drawer-info-item"><span className="info-label">Phone</span><span className="info-value">{item.phone || "N/A"}</span></div>
              <div className="drawer-info-item"><span className="info-label">Area</span><span className="info-value">{item.area || "Zone 1"}</span></div>
              {item.address && <div className="drawer-info-item full-width"><span className="info-label">Address</span><span className="info-value">{item.address}</span></div>}
              {item.wasteType && <div className="drawer-info-item"><span className="info-label">Waste</span><span className="info-value">{item.wasteType}</span></div>}
              {item.quantity && <div className="drawer-info-item"><span className="info-label">Quantity</span><span className="info-value">{item.quantity}</span></div>}
            </div>
          </div>

          {type === "pickup" && (
            <div className="drawer-section">
              <h4 className="drawer-section-title">Volunteer & Schedule</h4>
              <div className="drawer-inline-group">
                <select className="admin-select" value={selectedVol} onChange={(e) => setSelectedVol(e.target.value)}>
                  <option value="">-- Select Volunteer --</option>
                  {volunteersList.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.area})</option>)}
                </select>
                <button type="button" className="admin-btn admin-btn-secondary btn-sm" disabled={!selectedVol} onClick={() => onAssignVolunteer(item, selectedVol)}>Assign</button>
              </div>
              <div className="drawer-inline-group" style={{ marginTop: "10px" }}>
                <input type="datetime-local" className="admin-input" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                <button type="button" className="admin-btn admin-btn-secondary btn-sm" disabled={!newTime} onClick={() => onUpdateSchedule(item, newTime)}>Reschedule</button>
              </div>
            </div>
          )}

          <div className="drawer-section">
            <h4 className="drawer-section-title">Admin Note</h4>
            <textarea className="admin-textarea" rows={3} placeholder="Reason or note..." value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>

        <div className="admin-drawer-footer">
          {type === "photo" && (
            <>
              <button type="button" className="admin-btn admin-btn-warning" onClick={() => handleAct(onRequestClearerPhoto, true, "Please re-upload clearer photo.")}>📷 Re-photo</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleAct(onReject, true, "Rejected photo.")}>✕ Reject</button>
              <button type="button" className="admin-btn admin-btn-success" onClick={() => handleAct(onApprove, false, "Approved photo.")}>✓ Approve</button>
            </>
          )}
          {type === "pickup" && (
            <>
              <button type="button" className="admin-btn admin-btn-warning" onClick={() => handleAct(onRequestCorrections, true, "Please correct pickup details.")}>✏️ Corrections</button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleAct(onReject, true, "Rejected pickup.")}>✕ Reject</button>
              <button type="button" className="admin-btn admin-btn-success" onClick={() => handleAct(onApprove, false, "Approved pickup.")}>✓ Approve</button>
            </>
          )}
          {type === "volunteer" && (
            <>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleAct(onReject, true, "Volunteer request rejected.")}>✕ Reject</button>
              <button type="button" className="admin-btn admin-btn-success" onClick={() => handleAct(onApprove, false, "Volunteer approved.")}>✓ Approve</button>
            </>
          )}
          {type === "area-report" && (
            <>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleAct(onReject, true, "Area report rejected.")}>✕ Reject</button>
              <button type="button" className="admin-btn admin-btn-success" onClick={() => handleAct(onApprove, false, "Area report approved.")}>✓ Approve</button>
            </>
          )}
        </div>
      </aside>

      {fullPhoto && (
        <div className="admin-modal-overlay photo-lightbox" onClick={() => setFullPhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={fullPhoto} alt="Full view" />
            <button type="button" className="lightbox-close" onClick={() => setFullPhoto(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. HEADER COMPONENT                                                        */
/* -------------------------------------------------------------------------- */
export function AdminHeader({ adminName = "Admin", pendingCount = 0, onLogout, onToggleSidebar }) {
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button type="button" className="sidebar-toggle-btn" onClick={onToggleSidebar}>☰</button>
        <div className="admin-brand">
          <span className="brand-icon">🐝</span>
          <h1 className="brand-title">Clean<span className="accent">Bee</span> Admin</h1>
        </div>
      </div>
      <div className="admin-header-right">
        {pendingCount > 0 && (
          <div className="pending-indicator-pill">
            <span className="pill-dot glow" />
            <span>{pendingCount} Pending Approvals</span>
          </div>
        )}
        <div className="admin-notification-wrap">
          <button type="button" className="admin-icon-btn" onClick={() => setShowNotif(!showNotif)}>🔔</button>
          {showNotif && (
            <div className="admin-notification-dropdown">
              <div className="dropdown-header">
                <h5>Admin Alerts</h5>
                <button type="button" className="close-dropdown-btn" onClick={() => setShowNotif(false)}>×</button>
              </div>
              <div className="dropdown-body">
                {pendingCount > 0 ? <p className="notif-item">{pendingCount} requests awaiting review.</p> : <p className="empty-notif">No new alerts.</p>}
              </div>
            </div>
          )}
        </div>
        <div className="admin-profile-chip">
          <div className="admin-avatar">{adminName.charAt(0).toUpperCase()}</div>
          <div className="admin-user-info"><span className="admin-user-name">{adminName}</span><span className="admin-user-role">Super Admin</span></div>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. SIDEBAR COMPONENT                                                       */
/* -------------------------------------------------------------------------- */
export function AdminSidebar({ activeTab, onTabChange, isCollapsed, counts = {} }) {
  const NAV_ITEMS = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "photo", label: "Photo Verification", countKey: "photoPending", icon: "📸" },
    { id: "pickup", label: "Pickup Requests", countKey: "pickupPending", icon: "🚛" },
    { id: "volunteer", label: "Volunteer Approvals", countKey: "volunteerPending", icon: "🙋" },
    { id: "area-report", label: "Area Reports", countKey: "areaReportPending", icon: "📍" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "history", label: "Approval History", icon: "📜" },
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-nav-group">
        {!isCollapsed && <div className="sidebar-section-header"><span className="section-title">ADMIN MANAGEMENT</span></div>}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const badge = item.countKey ? counts[item.countKey] || 0 : 0;
            return (
              <button key={item.id} type="button" className={`sidebar-nav-item ${isActive ? "active" : ""}`} onClick={() => onTabChange(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {badge > 0 && <span className={`nav-badge ${isCollapsed ? "dot-badge" : ""}`}>{isCollapsed ? "" : badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. CONTENT PANELS                                                          */
/* -------------------------------------------------------------------------- */
export function AdminOverview({ stats, recentRequests, onSelectItem, onNavigateTab }) {
  const cards = [
    { title: "Pending Photos", value: stats.pendingPhotos, icon: "📸", cls: "card-amber", tab: "photo" },
    { title: "Pending Pickups", value: stats.pendingPickups, icon: "🚛", cls: "card-orange", tab: "pickup" },
    { title: "Pending Volunteers", value: stats.pendingVolunteers, icon: "🙋", cls: "card-purple", tab: "volunteer" },
    { title: "Pending Area Reports", value: stats.pendingAreaReports, icon: "📍", cls: "card-amber", tab: "area-report" },
    { title: "Approved Total", value: stats.approvedTotal, icon: "✅", cls: "card-green", tab: "history" },
    { title: "Rejected Total", value: stats.rejectedTotal, icon: "❌", cls: "card-red", tab: "history" },
    { title: "Total Users", value: stats.totalUsers, icon: "👥", cls: "card-blue", tab: "users" },
  ];

  return (
    <div className="admin-overview-container">
      <div className="overview-stats-grid">
        {cards.map((c, i) => (
          <div key={i} className={`admin-stat-card ${c.cls}`} onClick={() => onNavigateTab(c.tab)}>
            <div className="stat-icon-wrapper">{c.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{c.value}</span>
              <span className="stat-title">{c.title}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="overview-recent-section">
        <div className="section-header-row">
          <h3 className="section-title">Recently Submitted Requests</h3>
          <button type="button" className="admin-btn admin-btn-secondary btn-sm" onClick={() => onNavigateTab("pickup")}>View All →</button>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr><th>Type</th><th>Requester</th><th>Location</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {recentRequests.slice(0, 6).map((r) => (
                <tr key={`${r.type}-${r.id}`} className="admin-table-row">
                  <td><span className="type-tag">{r.type.toUpperCase()}</span></td>
                  <td>{r.userName || r.requesterName || r.name}</td>
                  <td>{r.area || r.location || "N/A"}</td>
                  <td><StatusBadge status={r.status || r.admin_review_status} /></td>
                  <td><button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={() => onSelectItem(r, r.type)}>Inspect</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PhotoVerificationPanel({ photos = [], onSelectItem, onApprove, onReject, onRequestClearerPhoto }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = photos.filter((p) => {
    const sMatch = !search || (p.userName || "").toLowerCase().includes(search.toLowerCase());
    const stMatch = status === "all" ? true : p.status === status;
    return sMatch && stMatch;
  });

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">Photo Verification Submissions</h2>
        <span className="panel-count-badge">{filtered.length} Items</span>
      </div>
      <ApprovalFilters searchTerm={search} onSearchChange={setSearch} statusFilter={status} onStatusChange={setStatus} onResetFilters={() => { setSearch(""); setStatus("all"); }} />
      <div className="photo-cards-grid">
        {filtered.map((item) => (
          <div key={item.id} className="photo-card">
            <div className="photo-thumbnail-wrap">
              <img src={item.photoUrl || item.photo} alt="Proof" className="photo-thumbnail" />
              <div className="card-status-position"><StatusBadge status={item.status} /></div>
            </div>
            <div className="photo-card-body">
              <h4 className="user-name">{item.userName || "User #" + item.id}</h4>
              <p style={{ fontSize: "12px", color: "#666" }}>Area: {item.area || "Zone 1"}</p>
            </div>
            <div className="photo-card-footer">
              <button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={() => onSelectItem(item, "photo")}>Details</button>
              {item.status === "pending" && (
                <div className="quick-actions">
                  <button type="button" className="admin-btn admin-btn-warning btn-xs" onClick={() => onRequestClearerPhoto(item)}>📷</button>
                  <button type="button" className="admin-btn admin-btn-danger btn-xs" onClick={() => onReject(item)}>✕</button>
                  <button type="button" className="admin-btn admin-btn-success btn-xs" onClick={() => onApprove(item)}>✓</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PickupApprovalPanel({ pickups = [], onSelectItem, onApprove, onReject }) {
  const [search, setSearch] = useState("");
  const filtered = pickups.filter((p) => !search || (p.requesterName || "").toLowerCase().includes(search.toLowerCase()) || (p.address || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">Pickup Request Approvals</h2>
        <span className="panel-count-badge">{filtered.length} Pickups</span>
      </div>
      <ApprovalFilters searchTerm={search} onSearchChange={setSearch} statusFilter="all" onStatusChange={() => {}} onResetFilters={() => setSearch("")} />
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr><th>#ID</th><th>Requester & Phone</th><th>Pickup Address</th><th>Waste & Qty</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="admin-table-row">
                <td>#{item.id}</td>
                <td>{item.requesterName}<br /><small style={{ color: "#666" }}>{item.phone}</small></td>
                <td>📍 {item.address || item.area}</td>
                <td>{item.wasteType} ({item.quantity})</td>
                <td><StatusBadge status={item.status} /></td>
                <td>
                  <div className="action-buttons-group">
                    <button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={() => onSelectItem(item, "pickup")}>Details</button>
                    {item.status === "pending" && (
                      <>
                        <button type="button" className="admin-btn admin-btn-danger btn-xs" onClick={() => onReject(item)}>✕</button>
                        <button type="button" className="admin-btn admin-btn-success btn-xs" onClick={() => onApprove(item)}>✓</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AreaReportApprovalPanel({ reports = [], onSelectItem, onApprove, onReject }) {
  const [search, setSearch] = useState("");
  const filtered = reports.filter((report) => {
    const searchable = `${report.reporterName} ${report.address} ${report.wasteType}`.toLowerCase();
    return !search || searchable.includes(search.toLowerCase());
  });

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">Area Report Approvals</h2>
        <span className="panel-count-badge">{filtered.length} Reports</span>
      </div>
      <ApprovalFilters searchTerm={search} onSearchChange={setSearch} statusFilter="all" onStatusChange={() => {}} onResetFilters={() => setSearch("")} />
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr><th>#ID</th><th>Reporter</th><th>Location</th><th>Waste Type</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.id} className="admin-table-row">
                <td>#{report.id}</td>
                <td>{report.reporterName}<br /><small style={{ color: "#666" }}>{report.userEmail}</small></td>
                <td>📍 {report.address}</td>
                <td>{report.wasteType}</td>
                <td><StatusBadge status={report.status} /></td>
                <td>
                  <div className="action-buttons-group">
                    <button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={() => onSelectItem(report, "area-report")}>Details</button>
                    {report.status === "pending" && (
                      <>
                        <button type="button" className="admin-btn admin-btn-danger btn-xs" onClick={() => onReject(report)}>✕</button>
                        <button type="button" className="admin-btn admin-btn-success btn-xs" onClick={() => onApprove(report)}>✓</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VolunteerApprovalPanel({ applications = [], taskClaims = [], onSelectItem, onApprove, onReject }) {
  const [subtab, setSubtab] = useState("claims");
  const dataset = subtab === "apps" ? applications : taskClaims;

  return (
    <div className="admin-panel-container">
      <div className="panel-header">
        <h2 className="panel-title">Volunteer Approvals</h2>
      </div>
      <div className="admin-subtabs">
        <button type="button" className={`subtab-btn ${subtab === "apps" ? "active" : ""}`} onClick={() => setSubtab("apps")}>Applications ({applications.length})</button>
        <button type="button" className={`subtab-btn ${subtab === "claims" ? "active" : ""}`} onClick={() => setSubtab("claims")}>Task Claims ({taskClaims.length})</button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr><th>Volunteer Name</th><th>Area</th><th>Availability</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {dataset.map((v) => (
              <tr key={v.id} className="admin-table-row">
                <td>{v.volunteerName || v.name}</td>
                <td>📍 {v.area}</td>
                <td>{v.availability || "Flexible"}</td>
                <td><StatusBadge status={v.status} /></td>
                <td>
                  <button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={() => onSelectItem(v, "volunteer")}>Profile</button>
                  {v.status === "pending" && (
                    <>
                      <button type="button" className="admin-btn admin-btn-danger btn-xs" onClick={() => onReject(v)}>✕</button>
                      <button type="button" className="admin-btn admin-btn-success btn-xs" onClick={() => onApprove(v)}>✓</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminUsersPanel({ users = [], onUpdateUserStatus }) {
  return (
    <div className="admin-panel-container">
      <div className="panel-header"><h2 className="panel-title">Registered Users</h2></div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>User</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="admin-table-row">
                <td>#{u.id}</td>
                <td>{u.name}<br /><small style={{ color: "#666" }}>{u.email}</small></td>
                <td><span className="type-tag">{u.role?.toUpperCase() || "USER"}</span></td>
                <td><StatusBadge status={u.status || "active"} /></td>
                <td>
                  {onUpdateUserStatus ? (
                    <button type="button" className={`admin-btn ${u.status === "suspended" ? "admin-btn-success" : "admin-btn-danger"} btn-xs`} onClick={() => onUpdateUserStatus(u, u.status === "suspended" ? "active" : "suspended")}>
                      {u.status === "suspended" ? "Reactivate" : "Suspend"}
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApprovalHistory({ historyLogs = [] }) {
  return (
    <div className="admin-panel-container">
      <div className="panel-header"><h2 className="panel-title">Approval History Log</h2></div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr><th>Date</th><th>Type</th><th>Subject</th><th>Action</th><th>Performed By</th><th>Note</th></tr>
          </thead>
          <tbody>
            {historyLogs.map((h) => (
              <tr key={h.id} className="admin-table-row">
                <td>{h.timestamp || "Today"}</td>
                <td><span className="type-tag">{h.requestType?.toUpperCase()}</span></td>
                <td>{h.targetName}</td>
                <td><strong>{h.action}</strong></td>
                <td>👑 {h.adminName}</td>
                <td>{h.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. MAIN ADMIN DASHBOARD PARENT COMPONENT                                   */
/* -------------------------------------------------------------------------- */
export default function AdminDashboard({ isLoggedIn, userRole, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [volApps] = useState([]);
  const [volClaims, setVolClaims] = useState([]);
  const [areaReports, setAreaReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    pendingPhotos: 0,
    pendingPickups: 0,
    pendingVolunteers: 0,
    pendingAreaReports: 0,
    approvedTotal: 0,
    rejectedTotal: 0,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Drawer & Modal State
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);
  const [drawerType, setDrawerType] = useState("photo");
  const [modalConfig, setModalConfig] = useState({ isOpen: false });

  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole") || userRole;

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await adminApi.getDashboard();
      const data = response.data || {};

      setPhotos((data.photos || []).map((photo) => ({
        id: photo.id,
        type: "photo",
        reviewType: "photo",
        userName: fullName(photo.uploader),
        userEmail: photo.uploader?.email,
        area: photo.pickup_request?.pickup_address || "Not provided",
        wasteType: photo.pickup_request?.waste_type,
        status: photo.status,
        photoUrl: photo.image_url,
      })));

      setPickups((data.pickups || []).map((pickup) => ({
        id: pickup.id,
        type: "pickup",
        reviewType: "pickup",
        requesterName: fullName(pickup.user),
        userEmail: pickup.user?.email,
        phone: pickup.contact_phone,
        address: pickup.pickup_address,
        area: pickup.pickup_address,
        wasteType: pickup.waste_type,
        quantity: `${pickup.quantity} ${pickup.quantity_unit}`,
        status: pickup.admin_review_status,
      })));

      setVolClaims((data.claims || []).map((claim) => ({
        id: claim.id,
        type: "volunteer",
        reviewType: "claim",
        volunteerName: fullName(claim.assigned_volunteer),
        userEmail: claim.assigned_volunteer?.email,
        area: claim.pickup_address,
        availability: claim.assigned_volunteer?.volunteer_availability || "Not provided",
        status: claim.claim_review_status,
      })));

      setAreaReports((data.area_reports || []).map((report) => ({
        id: report.id,
        type: "area-report",
        reviewType: "area-report",
        reporterName: fullName(report.user),
        userName: fullName(report.user),
        userEmail: report.user?.email,
        address: report.address,
        area: report.address,
        wasteType: report.waste_type,
        status: report.admin_review_status,
        name: report.title,
        description: report.description,
      })));

      setUsers((data.users || []).map((user) => ({
        id: user.id,
        name: fullName(user),
        email: user.email,
        role: user.role,
        status: "active",
      })));

      const adminName = localStorage.getItem("firstName") || "Admin";
      setHistory((data.history || []).map((entry) => ({
        id: entry.id,
        timestamp: entry.reviewed_at ? new Date(entry.reviewed_at).toLocaleString() : "",
        requestType: entry.request_type,
        targetName: entry.target_name,
        action: entry.action ? entry.action.charAt(0).toUpperCase() + entry.action.slice(1) : "Reviewed",
        adminName,
        reason: entry.reason || "—",
      })));

      setStats({
        pendingPhotos: data.stats?.pending_photos || 0,
        pendingPickups: data.stats?.pending_pickups || 0,
        pendingVolunteers: data.stats?.pending_volunteers || 0,
        pendingAreaReports: data.stats?.pending_area_reports || 0,
        approvedTotal: data.stats?.approved_total || 0,
        rejectedTotal: data.stats?.rejected_total || 0,
        totalUsers: data.stats?.total_users || 0,
      });
    } catch (error) {
      setLoadError(error.message || "Unable to load admin dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((isLoggedIn || token) && role === "admin") {
      const timeoutId = window.setTimeout(loadDashboard, 0);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [isLoggedIn, token, role, loadDashboard]);

  if ((!isLoggedIn && !token) || role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  const pendingPhotos = stats.pendingPhotos;
  const pendingPickups = stats.pendingPickups;
  const pendingVols = stats.pendingVolunteers;
  const pendingAreaReports = stats.pendingAreaReports;
  const totalPending = pendingPhotos + pendingPickups + pendingVols + pendingAreaReports;

  const handleSelectItem = (item, type) => {
    setSelectedDrawerItem(item);
    setDrawerType(type);
  };

  const handleApprove = (item) => {
    setModalConfig({
      isOpen: true,
      title: "Confirm Approval",
      message: `Approve request #${item.id}?`,
      actionType: "approve",
      onConfirm: async () => {
        setIsProcessing(true);
        try {
          await adminApi.approveReview(item.reviewType || drawerType, item.id);
          await loadDashboard();
          setModalConfig({ isOpen: false });
          setSelectedDrawerItem(null);
        } catch (error) {
          setLoadError(error.message || "Approval failed.");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handleReject = (item) => {
    setModalConfig({
      isOpen: true,
      title: "Confirm Rejection",
      message: `Reject request #${item.id}?`,
      actionType: "reject",
      requireReason: true,
      onConfirm: async (reason) => {
        setIsProcessing(true);
        try {
          await adminApi.rejectReview(item.reviewType || drawerType, item.id, reason);
          await loadDashboard();
          setModalConfig({ isOpen: false });
          setSelectedDrawerItem(null);
        } catch (error) {
          setLoadError(error.message || "Rejection failed.");
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  return (
    <div className="admin-dashboard-layout">
      <AdminHeader adminName={localStorage.getItem("firstName") || "Admin"} pendingCount={totalPending} onLogout={onLogout} onToggleSidebar={() => setIsCollapsed(!isCollapsed)} isSidebarCollapsed={isCollapsed} />
      <div className="admin-body-wrap">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} isCollapsed={isCollapsed} counts={{ photoPending: pendingPhotos, pickupPending: pendingPickups, volunteerPending: pendingVols, areaReportPending: pendingAreaReports }} />
        <main className="admin-main-content">
          {loadError && <div className="admin-alert-error" role="alert">{loadError} <button type="button" className="admin-btn admin-btn-ghost btn-sm" onClick={loadDashboard}>Retry</button></div>}
          {isLoading && <div className="admin-panel-container"><p>Loading dashboard data...</p></div>}
          {!isLoading && activeTab === "overview" && <AdminOverview stats={stats} recentRequests={[...photos, ...pickups, ...volClaims, ...areaReports]} onSelectItem={handleSelectItem} onNavigateTab={setActiveTab} />}
          {!isLoading && activeTab === "photo" && <PhotoVerificationPanel photos={photos} onSelectItem={handleSelectItem} onApprove={handleApprove} onReject={handleReject} onRequestClearerPhoto={handleReject} />}
          {!isLoading && activeTab === "pickup" && <PickupApprovalPanel pickups={pickups} onSelectItem={handleSelectItem} onApprove={handleApprove} onReject={handleReject} />}
          {!isLoading && activeTab === "volunteer" && <VolunteerApprovalPanel applications={volApps} taskClaims={volClaims} onSelectItem={handleSelectItem} onApprove={handleApprove} onReject={handleReject} />}
          {!isLoading && activeTab === "area-report" && <AreaReportApprovalPanel reports={areaReports} onSelectItem={handleSelectItem} onApprove={handleApprove} onReject={handleReject} />}
          {!isLoading && activeTab === "users" && <AdminUsersPanel users={users} />}
          {!isLoading && activeTab === "history" && <ApprovalHistory historyLogs={history} />}
        </main>
      </div>
      <ApprovalDetailsDrawer isOpen={Boolean(selectedDrawerItem)} onClose={() => setSelectedDrawerItem(null)} item={selectedDrawerItem} type={drawerType} onApprove={handleApprove} onReject={handleReject} />
      <ConfirmActionModal isOpen={modalConfig.isOpen} title={modalConfig.title} message={modalConfig.message} actionType={modalConfig.actionType} requireReason={modalConfig.requireReason} onConfirm={modalConfig.onConfirm} onCancel={() => setModalConfig({ isOpen: false })} isProcessing={isProcessing} />
    </div>
  );
}
