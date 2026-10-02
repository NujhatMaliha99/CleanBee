import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { notificationsApi } from "../services/api";
import "./Notifications.css";

const FILTERS = [
  { key: "all", label: "All notifications" },
  { key: "pickup", label: "Pickup updates" },
  { key: "volunteer", label: "Volunteer tasks" },
  { key: "area_report", label: "Area reports" },
];

function NotifIcon({ type }) {
  const cfg = {
    pickup: { color: "#d97706", bg: "rgba(245, 158, 11, 0.18)", path: "M3 7h13v11H3zM16 11h3l2 3v4h-5M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm11 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" },
    volunteer: { color: "#0277bd", bg: "rgba(2, 136, 209, 0.15)", path: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
    area_report: { color: "#1f6b45", bg: "rgba(111, 207, 151, 0.18)", path: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11zM9 12l2 2 4-4" },
  }[type] ?? { color: "#4c6b5b", bg: "rgba(31, 107, 69, 0.1)", path: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9m-5 12a2 2 0 0 1-4 0" };

  return (
    <span className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={cfg.path} />
      </svg>
    </span>
  );
}

function relativeTime(value) {
  if (!value) return "Just now";
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  const [unit, length] = units.find(([, size]) => Math.abs(seconds) >= size) || ["second", 1];
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(Math.round(seconds / length), unit);
}

function NotifCard({ notif, busy, onMarkRead }) {
  return (
    <div className={`notif-card${notif.read ? " notif-card--read" : ""}`}>
      {!notif.read && <span className="notif-unread-dot" aria-label="Unread" />}
      <NotifIcon type={notif.type} />
      <div className="notif-body">
        <p className="notif-title">{notif.title}</p>
        <p className="notif-msg">{notif.message}</p>
        <div className="notif-footer">
          <span className="notif-time">{relativeTime(notif.created_at)}</span>
          {!notif.read && (
            <button type="button" className="notif-mark-btn" disabled={busy} onClick={() => onMarkRead(notif.id)}>
              {busy ? "Saving…" : "Mark as read"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

export default function Notifications({ isLoggedIn }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await notificationsApi.getAll();
      setNotifications(response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) Promise.resolve().then(loadNotifications);
  }, [isLoggedIn, loadNotifications]);

  async function handleMarkRead(id) {
    setSavingId(id);
    setError("");
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
    } catch (saveError) {
      setError(saveError.message || "Could not update this notification.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleMarkAllRead() {
    setSavingAll(true);
    setError("");
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
    } catch (saveError) {
      setError(saveError.message || "Could not update notifications.");
    } finally {
      setSavingAll(false);
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const filtered = useMemo(
    () => activeFilter === "all" ? notifications : notifications.filter((notification) => notification.type === activeFilter),
    [notifications, activeFilter],
  );

  return (
    <div className="notif-page">
      <header className="notif-topbar">
        <span className="notif-logo">Clean<span className="notif-accent">Bee</span></span>
        <div className="notif-topbar-right">
          <Link to="/dashboard" className="notif-btn notif-btn-ghost notif-btn-sm"><ArrowLeftIcon /> Back to dashboard</Link>
        </div>
      </header>
      <main className="notif-main">
        <div className="notif-page-head">
          <h1>Instant Alerts & Area Notices</h1>
          <p className="notif-subtitle">Updates about your pickups, volunteer tasks, and area reports.</p>
        </div>
        <div className="notif-summary-bar">
          <span className="notif-unread-label">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All notifications read"}</span>
          {unreadCount > 0 && <button type="button" className="notif-btn notif-btn-ghost notif-btn-sm" disabled={savingAll} onClick={handleMarkAllRead}>{savingAll ? "Saving…" : "Mark all as read"}</button>}
        </div>
        <div className="notif-filters" role="tablist" aria-label="Notification filters">
          {FILTERS.map((filter) => (
            <button key={filter.key} type="button" role="tab" aria-selected={activeFilter === filter.key} className={`notif-filter-tab${activeFilter === filter.key ? " notif-filter-tab--active" : ""}`} onClick={() => setActiveFilter(filter.key)}>{filter.label}</button>
          ))}
        </div>
        {error && <div className="notif-error" role="alert">{error} <button type="button" onClick={loadNotifications} disabled={loading}>Retry</button></div>}
        <div className="notif-list" aria-live="polite">
          {loading ? <p className="notif-state">Loading notifications…</p> : filtered.length === 0 ? (
            <div className="notif-empty"><span className="notif-empty-icon">🔔</span><p>{error ? "Notifications are unavailable." : "No notifications yet."}</p></div>
          ) : filtered.map((notification) => <NotifCard key={notification.id} notif={notification} busy={savingId === notification.id} onMarkRead={handleMarkRead} />)}
        </div>
      </main>
    </div>
  );
}
