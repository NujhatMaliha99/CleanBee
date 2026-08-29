import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Notifications.css";


const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "pickup",
    title: "Pickup request approved",
    message: "Your pickup request has been accepted by a volunteer.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "collector",
    title: "Collector assigned",
    message: "A collector has been assigned to your pickup request.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "progress",
    title: "Pickup in progress",
    message: "Your collector is on the way to pick up your waste.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "completed",
    title: "Pickup completed",
    message: "Your waste pickup has been successfully completed.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "eco",
    title: "Eco Points earned",
    message: "You earned 20 Eco Points from your completed pickup.",
    time: "Yesterday",
    read: true,
  },
];

/* ── Filter tabs definition ── */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "pickup", label: "Pickup" },
  { key: "collector", label: "Collector" },
  { key: "progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "eco", label: "Eco Points" },
];

/* ── Per-type icon & color config (inline SVG, no extra library) ── */
function NotifIcon({ type }) {
  const cfg = {
    pickup: { color: "#1f6b45", bg: "rgba(111,207,151,0.18)" },
    collector: { color: "#0277bd", bg: "rgba(2,136,209,0.1)" },
    progress: { color: "#7b1fa2", bg: "rgba(123,31,162,0.1)" },
    completed: { color: "#1f6b45", bg: "rgba(111,207,151,0.18)" },
    eco: { color: "#8a5a00", bg: "rgba(255,201,74,0.18)" },
  }[type] ?? { color: "#4c6b5b", bg: "rgba(31,107,69,0.1)" };

  const paths = {
    pickup: "M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    collector: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zm-9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    progress: "M1 3h15v13H1zM16 8l5 3-5 3V8ZM5 18.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Zm8 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z",
    completed: "m5 12 5 5L20 7",
    eco: "M12 3v18M7 7.5c0-1.4 2.2-2.5 5-2.5s5 1.1 5 2.5-2.2 2.5-5 2.5-5 1.1-5 2.5 2.2 2.5 5 2.5 5 1.1 5 2.5-2.2 2.5-5 2.5-5-1.1-5-2.5",
  };

  return (
    <span className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paths[type] ?? paths.completed} />
      </svg>
    </span>
  );
}

/* ── Single notification card ── */
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

/* ── Back arrow icon ── */
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

/* ── Page component ── */
export default function Notifications({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  /* Notification state */
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");

  /* Mark single notification as read */
  function handleMarkRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  /* Mark all as read */
  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  /* Unread count — computed from state, never hardcoded */
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  /* Filtered list — pure React state, no API */
  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? notifications
        : notifications.filter((n) => n.type === activeFilter),
    [notifications, activeFilter]
  );

  return (
    <div className="notif-page">

      {/* ── Top bar ── */}
      <header className="notif-topbar">
        <span className="notif-logo">
          Clean<span className="notif-accent">Bee</span>
        </span>
        <div className="notif-topbar-right">
          <Link to="/#features" className="notif-btn notif-btn-ghost notif-btn-sm">
              <ArrowLeftIcon /> Back
            </Link>
        </div>
      </header>

      <main className="notif-main">

        {/* ── Page heading ── */}
        <div className="notif-page-head"> 
          <h1>Instant Alerts</h1>
          <p className="notif-subtitle">
            Stay updated about your pickup requests and Eco Point activity.
          </p>
        </div>

        {/* ── Unread count bar ── */}
        <div className="notif-summary-bar">
          <span className="notif-unread-label">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
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

        {/* ── Filter tabs ── */}
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

        {/* ── Notification list ── */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p>No alerts found.</p>
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
