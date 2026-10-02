import StatusBadge from "./StatusBadge";

export default function AdminOverview({
  stats = {
    pendingPhotos: 0,
    pendingPickups: 0,
    pendingVolunteers: 0,
    approvedTotal: 0,
    rejectedTotal: 0,
    totalUsers: 0,
  },
  recentRequests = [],
  onSelectItem,
  onNavigateTab,
}) {
  const STAT_CARDS = [
    {
      title: "Pending Photo Submissions",
      value: stats.pendingPhotos,
      icon: "📸",
      colorClass: "card-amber",
      tab: "photo",
    },
    {
      title: "Pending Pickup Requests",
      value: stats.pendingPickups,
      icon: "🚛",
      colorClass: "card-orange",
      tab: "pickup",
    },
    {
      title: "Pending Volunteer Apps",
      value: stats.pendingVolunteers,
      icon: "🙋‍♂️",
      colorClass: "card-purple",
      tab: "volunteer",
    },
    {
      title: "Approved Requests",
      value: stats.approvedTotal,
      icon: "✅",
      colorClass: "card-green",
      tab: "history",
    },
    {
      title: "Rejected Requests",
      value: stats.rejectedTotal,
      icon: "❌",
      colorClass: "card-red",
      tab: "history",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      colorClass: "card-blue",
      tab: "users",
    },
  ];

  return (
    <div className="admin-overview-container">
      {/* Overview Stats Cards Grid */}
      <div className="overview-stats-grid">
        {STAT_CARDS.map((card, i) => (
          <div
            key={i}
            className={`admin-stat-card ${card.colorClass}`}
            onClick={() => onNavigateTab(card.tab)}
            role="button"
            tabIndex={0}
          >
            <div className="stat-icon-wrapper">{card.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{card.value}</span>
              <span className="stat-title">{card.title}</span>
            </div>
            <span className="stat-arrow">→</span>
          </div>
        ))}
      </div>

      {/* Quick Action / Recent Submissions Section */}
      <div className="overview-recent-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">Recently Submitted Requests</h3>
            <p className="section-subtitle">Review recent submissions across all categories</p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary btn-sm"
            onClick={() => onNavigateTab("pickup")}
          >
            View All Pending →
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="admin-empty-state">
            <span className="empty-icon">📂</span>
            <h4>No Recent Submissions</h4>
            <p>All photo verification, pickup, and volunteer requests are processed.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Requester / User</th>
                  <th>Area / Location</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.slice(0, 7).map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="admin-table-row">
                    <td>
                      <span className={`type-tag type-${item.type}`}>
                        {item.type === "photo"
                          ? "📸 Photo"
                          : item.type === "pickup"
                          ? "🚛 Pickup"
                          : "🙋 Volunteer"}
                      </span>
                    </td>
                    <td>
                      <div className="table-user-cell">
                        <span className="user-name">
                          {item.userName || item.name || item.user?.name || "User #" + item.id}
                        </span>
                        <span className="user-email">{item.email || item.user?.email || item.contact}</span>
                      </div>
                    </td>
                    <td>{item.area || item.location || item.address || "N/A"}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "Today"}
                    </td>
                    <td>
                      <StatusBadge status={item.status || item.admin_review_status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost btn-sm"
                        onClick={() => onSelectItem(item, item.type)}
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
