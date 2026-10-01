import React, { useState } from "react";

export default function AdminHeader({
  adminName = "Administrator",
  pendingCount = 0,
  notifications = [],
  onLogout,
  onToggleSidebar,
  isSidebarCollapsed,
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle navigation sidebar"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="admin-brand">
          <h1 className="brand-title">
            Clean<span className="accent">Bee</span> Admin
          </h1>
        </div>
      </div>

      <div className="admin-header-right">
        {/* Pending Approval Indicator Badge */}
        {pendingCount > 0 && (
          <div className="pending-indicator-pill" title={`${pendingCount} submissions awaiting admin approval`}>
            <span className="pill-dot glow" />
            <span className="pill-text">{pendingCount} Pending Approvals</span>
          </div>
        )}

        {/* Notifications Icon & Popover */}
        <div className="admin-notification-wrap">
          <button
            type="button"
            className="admin-icon-btn nav-bell"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Notifications"
            title="Notifications"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifications.length > 0 && (
              <span className="bell-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="dropdown-header">
                <h5>Admin Notifications</h5>
                <button
                  type="button"
                  className="close-dropdown-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  ×
                </button>
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p className="empty-notif">No new system notifications.</p>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="notif-item">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-desc">{notif.message}</div>
                      <span className="notif-time">{notif.time || "Just now"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar & Profile */}
        <div className="admin-profile-chip">
          <div className="admin-avatar" title={adminName}>
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">{adminName}</span>
            <span className="admin-user-role">Super Admin</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="admin-btn admin-btn-ghost logout-btn"
          onClick={onLogout}
          title="Log out of Admin Dashboard"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
}
