import React from "react";

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "photo",
    label: "Photo Verification",
    countKey: "photoPending",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    id: "pickup",
    label: "Pickup Requests",
    countKey: "pickupPending",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "volunteer",
    label: "Volunteer Approvals",
    countKey: "volunteerPending",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "users",
    label: "Users",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Approval History",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  counts = {},
}) {
  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-nav-group">
        <div className="sidebar-section-header">
          {!isCollapsed && <span className="section-title">ADMIN MANAGEMENT</span>}
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const badgeCount = item.countKey ? counts[item.countKey] || 0 : 0;

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {badgeCount > 0 && (
                  <span className={`nav-badge ${isCollapsed ? "dot-badge" : ""}`}>
                    {isCollapsed ? "" : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="system-status-box">
            <span className="status-dot online" />
            <span className="status-text">System Live • API v1.2</span>
          </div>
        </div>
      )}
    </aside>
  );
}
