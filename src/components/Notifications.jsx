import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Notifications.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "alert",
    title: "🚨 High Waste Accumulation Alert",
    message: "Dhanmondi Road 27 park area has an overflowing bin with plastic waste. Nearby volunteers requested.",
    time: "15 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "weather",
    title: "⚠️ Heavy Rainfall & Schedule Notice",
    message: "Heavy rain in Mirpur zone; evening waste pickups are rescheduled by 2 hours for safety.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "drive",
    title: "📢 Special Neighborhood Cleanliness Drive",
    message: "Join the CleanBee community drive starting tomorrow at 9:00 AM in Gulshan Lake Park.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "alert",
    title: "🚨 Illegal Dumping Spot Flagged",
    message: "Community report submitted for illegal dumping near Uttara Sector 4 Lake Gate.",
    time: "Yesterday",
    read: true,
  },
];

const FILTERS = [
  { key: "all", label: "All Alerts" },
  { key: "alert", label: "🚨 Waste Alerts" },
  { key: "weather", label: "⚠️ Weather Notices" },
  { key: "drive", label: "📢 Community Drives" },
];

function NotifIcon({ type }) {
  const cfg = {
    alert: { color: "#d97706", bg: "rgba(245, 158, 11, 0.18)" },
    weather: { color: "#0277bd", bg: "rgba(2, 136, 209, 0.15)" },
    drive: { color: "#1f6b45", bg: "rgba(111, 207, 151, 0.18)" },
  }[type] ?? { color: "#4c6b5b", bg: "rgba(31, 107, 69, 0.1)" };

  const paths = {
    alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    weather: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707",
    drive: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  };

  return (
    <span className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paths[type] ?? paths.alert} />
      </svg>
    </span>
  );
}

function NotifCard({ notif, onMarkRead }) {
  return (
    <div className={`notif-card${notif.read ? " notif-card--read" : ""}`}>
      {!notif.read && <span className="notif-unread-dot" aria-label="Unread" />}
      <NotifIcon type={notif.type} />
      <div className="notif-body">
        <p className="notif-title">{notif.title}</p>
        <p className="notif-msg">{notif.message}</p>
        <div className="notif-footer">
          <span className="notif-time">{notif.time}</span>
          {!notif.read && (
            <button
              type="button"
              className="notif-mark-btn"
              onClick={() => onMarkRead(notif.id)}
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");

  function handleMarkRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? notifications
        : notifications.filter((n) => n.type === activeFilter),
    [notifications, activeFilter]
  );

  return (
    <div className="notif-page">

      {/* Top bar */}
      <header className="notif-topbar">
        <span className="notif-logo">
          Clean<span className="notif-accent">Bee</span>
        </span>
        <div className="notif-topbar-right">
          <Link to="/" className="notif-btn notif-btn-ghost notif-btn-sm">
            <ArrowLeftIcon /> Back
          </Link>
        </div>
      </header>

      <main className="notif-main">

        {/* Page heading */}
        <div className="notif-page-head">
          <h1>Instant Alerts & Area Notices</h1>
          <p className="notif-subtitle">
            Real-time community alerts, emergency waste reports, and neighborhood notices.
          </p>
        </div>

        {/* Unread count bar */}
        <div className="notif-summary-bar">
          <span className="notif-unread-label">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`
              : "All alerts read"}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-btn notif-btn-ghost notif-btn-sm"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="notif-filters" role="tablist" aria-label="Notification filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={activeFilter === f.key}
              className={`notif-filter-tab${activeFilter === f.key ? " notif-filter-tab--active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p>No area alerts found.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotifCard key={n.id} notif={n} onMarkRead={handleMarkRead} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
