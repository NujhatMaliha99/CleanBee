import { useState } from "react";
import "./Dashboard.css";

// SVG Icons
const BellIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon bell" fill="none">
    <path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon card-icon" fill="none">
    <path
      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon card-icon" fill="none">
    <rect x="1" y="3" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" stroke="currentColor" strokeWidth="2" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon card-icon" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon card-icon" fill="none">
    <path
      d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 20 2c1 2 1.5 5.5.2 11.2A7 7 0 0 1 11 20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M9 21c0-5 2.5-7.5 5-9" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon" fill="none">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon" fill="none">
    <path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="db-icon" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default function Dashboard({ onLogout }) {
  // Read name & email from localStorage
  const [firstName, setFirstName] = useState(() => localStorage.getItem("firstName") || "");
  const [lastName, setLastName] = useState(() => localStorage.getItem("lastName") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "user@cleanbee.com");

  // Stats State
  const [stats, setStats] = useState({
    totalRequests: 12,
    completedPickups: 8,
    pendingRequests: 4,
    ecoPoints: 150,
  });

  // Recent Activities State
  const [activities, setActivities] = useState([
    { id: 103, status: "In Progress", text: "Request #103 In Progress", time: "2 hours ago" },
    { id: 102, status: "Pending", text: "Request #102 Pending", time: "5 hours ago" },
    { id: 101, status: "Completed", text: "Request #101 Completed", time: "1 day ago" },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Pickup request approved", read: false },
    { id: 2, text: "Collector assigned", read: false },
    { id: 3, text: "Earned 20 Eco Points", read: false },
  ]);

  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // New Request Form State
  const [wasteType, setWasteType] = useState("Plastic");
  const [wasteWeight, setWasteWeight] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  // Edit Profile Form State
  const [profileFirstName, setProfileFirstName] = useState(() => localStorage.getItem("firstName") || "User");
  const [profileLastName, setProfileLastName] = useState(() => localStorage.getItem("lastName") || "");
  const [profileEmail, setProfileEmail] = useState(() => localStorage.getItem("email") || "user@cleanbee.com");

  // Quick Action: Request Pickup submission handler
  const handleRequestPickup = (e) => {
    e.preventDefault();
    const nextId = Math.max(...activities.map((a) => a.id), 100) + 1;
    const newActivity = {
      id: nextId,
      status: "Pending",
      text: `Request #${nextId} Pending (${wasteType}, ~${wasteWeight || 1}kg)`,
      time: "Just now",
    };

    // Update Stats and Activities
    setStats((prev) => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      pendingRequests: prev.pendingRequests + 1,
    }));

    setActivities((prev) => [newActivity, ...prev]);

    // Push dynamic notification
    setNotifications((prev) => [
      { id: Date.now(), text: `New Request #${nextId} submitted successfully`, read: false },
      ...prev,
    ]);

    // Reset and Close Modal
    setWasteType("Plastic");
    setWasteWeight("");
    setPickupDate("");
    setShowRequestModal(false);
  };

  // Quick Action: Save Profile updates
  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("firstName", profileFirstName);
    localStorage.setItem("lastName", profileLastName);
    localStorage.setItem("email", profileEmail);

    setFirstName(profileFirstName);
    setLastName(profileLastName);
    setEmail(profileEmail);

    setShowEditProfile(false);

    // Push notification
    setNotifications((prev) => [
      { id: Date.now(), text: "Profile settings updated", read: false },
      ...prev,
    ]);
  };

  // Mark notifications as read / dismiss
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleDismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogoutClick = () => {
    onLogout && onLogout();
  };

  return (
    <div className="db-container">
      {/* Background Blobs for Visual Interest */}
      <div className="db-blob db-blob-1" />
      <div className="db-blob db-blob-2" />
      <div className="db-blob db-blob-3" />

      {/* Top Navigation Bar */}
      <header className="db-header-bar">
        <div className="db-nav-left">
          <h1 className="db-logo">
            <span className="clean">Clean</span>
            <span className="bee">Bee</span>
          </h1>
        </div>
        <nav className="db-nav-middle">
          <button className="db-nav-link active">Dashboard</button>
          <button className="db-nav-link" onClick={() => setShowEditProfile(true)}>
            Profile
          </button>
          <button className="db-nav-link" onClick={() => setShowGuideModal(true)}>
            Guide
          </button>
          <button className="db-nav-link logout-btn" onClick={handleLogoutClick}>
            Logout
          </button>
        </nav>
        <div className="db-nav-right">
          <button
            className="db-bell-wrapper"
            onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
            aria-label="Toggle notifications"
          >
            <BellIcon />
            {notifications.length > 0 && (
              <span className="db-bell-badge">{notifications.length}</span>
            )}
          </button>

          {/* Nav Notifications Dropdown */}
          {showNotificationsDropdown && (
            <div className="db-notifications-dropdown">
              <div className="db-dropdown-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && (
                  <button onClick={handleClearNotifications} className="db-clear-btn">
                    Clear all
                  </button>
                )}
              </div>
              <ul className="db-dropdown-list">
                {notifications.length === 0 ? (
                  <li className="db-dropdown-empty">No new notifications</li>
                ) : (
                  notifications.map((notif) => (
                    <li key={notif.id} className="db-dropdown-item">
                      <span className="db-dot" />
                      <p>{notif.text}</p>
                      <button
                        onClick={() => handleDismissNotification(notif.id)}
                        className="db-dismiss-btn"
                        title="Dismiss"
                      >
                        &times;
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="db-main-content">
        {/* Welcome Section */}
        <section className="db-welcome-banner">
          <div className="db-welcome-text">
            <h2>Welcome Back, {firstName || "User"}!</h2>
            <p>Let&apos;s build a cleaner, greener tomorrow together.</p>
          </div>
          <div className="db-welcome-accent">
            <span className="db-accent-leaf">&#127811;</span>
          </div>
        </section>

        {/* Dashboard Panels Layout */}
        <div className="db-grid-layout">
          {/* Main Dashboard Section */}
          <div className="db-primary-column">
            {/* Statistics Cards */}
            <section className="db-stats-section">
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper trash-glow">
                  <TrashIcon />
                </div>
                <div className="db-stat-info">
                  <h3>{stats.totalRequests}</h3>
                  <p>Total Requests</p>
                </div>
              </div>

              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper truck-glow">
                  <TruckIcon />
                </div>
                <div className="db-stat-info">
                  <h3>{stats.completedPickups}</h3>
                  <p>Completed Pickups</p>
                </div>
              </div>

              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper clock-glow">
                  <ClockIcon />
                </div>
                <div className="db-stat-info">
                  <h3>{stats.pendingRequests}</h3>
                  <p>Pending Requests</p>
                </div>
              </div>

              <div className="db-stat-card eco-card">
                <div className="db-stat-icon-wrapper eco-glow">
                  <LeafIcon />
                </div>
                <div className="db-stat-info">
                  <h3 className="eco-text">{stats.ecoPoints}</h3>
                  <p>Eco Points</p>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="db-panel db-quick-actions">
              <h3 className="panel-title">Quick Actions</h3>
              <div className="db-action-grid">
                <button
                  className="db-action-card"
                  onClick={() => setShowRequestModal(true)}
                >
                  <span className="action-icon">&#128651;</span>
                  <h4>Request Pickup</h4>
                  <p>Schedule garbage pickup</p>
                </button>

                <button
                  className="db-action-card"
                  onClick={() => {
                    const el = document.getElementById("activities-panel");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="action-icon">&#128196;</span>
                  <h4>View History</h4>
                  <p>Check past pickups</p>
                </button>

                <button
                  className="db-action-card"
                  onClick={() => setShowGuideModal(true)}
                >
                  <span className="action-icon">&#128214;</span>
                  <h4>Recycle Guide</h4>
                  <p>Learn how to sort waste</p>
                </button>

                <button
                  className="db-action-card"
                  onClick={() => setShowEditProfile(true)}
                >
                  <span className="action-icon">&#9881;</span>
                  <h4>Edit Profile</h4>
                  <p>Manage account settings</p>
                </button>
              </div>
            </section>

            {/* Recent Activities */}
            <section id="activities-panel" className="db-panel db-recent-activities">
              <h3 className="panel-title">Recent Activities</h3>
              <div className="db-activities-list">
                {activities.map((act) => (
                  <div key={act.id} className="db-activity-item">
                    <div className="db-activity-indicator-wrapper">
                      <span className={`db-indicator-dot ${act.status.toLowerCase().replace(" ", "-")}`} />
                    </div>
                    <div className="db-activity-details">
                      <p className="db-activity-text">{act.text}</p>
                      <span className="db-activity-time">{act.time}</span>
                    </div>
                    <div className="db-activity-status">
                      <span className={`db-status-badge ${act.status.toLowerCase().replace(" ", "-")}`}>
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Section */}
          <div className="db-sidebar-column">
            {/* Profile Summary Card */}
            <section className="db-panel db-profile-card">
              <div className="db-profile-header">
                <div className="db-avatar">
                  {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                </div>
                <h3 className="db-profile-name">
                  {firstName ? `${firstName} ${lastName}`.trim() : "CleanBee User"}
                </h3>
                <span className="db-profile-role">Eco Ambassador</span>
              </div>
              <div className="db-profile-info-list">
                <div className="db-profile-info-item">
                  <UserIcon />
                  <div>
                    <span className="label">Name</span>
                    <span className="value">{firstName ? `${firstName} ${lastName}`.trim() : "User"}</span>
                  </div>
                </div>

                <div className="db-profile-info-item">
                  <MailIcon />
                  <div>
                    <span className="label">Email</span>
                    <span className="value">{email || "user@cleanbee.com"}</span>
                  </div>
                </div>

                <div className="db-profile-info-item">
                  <CalendarIcon />
                  <div>
                    <span className="label">Member Since</span>
                    <span className="value">July 2026</span>
                  </div>
                </div>
              </div>
              <button className="db-edit-profile-btn" onClick={() => setShowEditProfile(true)}>
                Edit Profile Settings
              </button>
            </section>

            {/* Notifications Panel */}
            <section className="db-panel db-notifications-panel">
              <h3 className="panel-title">System Alerts</h3>
              <div className="db-alerts-list">
                <div className="db-alert-item flex-alert">
                  <span className="alert-badge green-badge">&#10003;</span>
                  <div className="alert-content">
                    <p className="alert-title">Pickup request approved</p>
                    <span className="alert-time">Just now</span>
                  </div>
                </div>

                <div className="db-alert-item flex-alert">
                  <span className="alert-badge blue-badge">&#128651;</span>
                  <div className="alert-content">
                    <p className="alert-title">Collector assigned</p>
                    <span className="alert-time">10 mins ago</span>
                  </div>
                </div>

                <div className="db-alert-item flex-alert">
                  <span className="alert-badge yellow-badge">&#9733;</span>
                  <div className="alert-content">
                    <p className="alert-title">Earned 20 Eco Points</p>
                    <span className="alert-time">1 hour ago</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="db-main-footer">
        <p>&copy; 2026 CleanBee. All rights reserved.</p>
        <div className="footer-links">
          <span>Terms of Service</span>
          <span className="separator">&bull;</span>
          <span>Privacy Policy</span>
        </div>
      </footer>

      {/* MODAL: Request Pickup */}
      {showRequestModal && (
        <div className="db-modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="db-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>Request Waste Pickup</h3>
              <button className="close-modal-btn" onClick={() => setShowRequestModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleRequestPickup} className="db-modal-form">
              <div className="form-group">
                <label htmlFor="waste-type">Waste Category</label>
                <select
                  id="waste-type"
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  required
                >
                  <option value="Plastic">Plastic & Bottles</option>
                  <option value="Organic">Organic & Food Waste</option>
                  <option value="Paper">Paper & Cardboard</option>
                  <option value="E-Waste">Electronics & Batteries</option>
                  <option value="Glass">Glass & Metals</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="waste-weight">Estimated Weight (kg)</label>
                <input
                  id="waste-weight"
                  type="number"
                  placeholder="e.g. 5"
                  min="1"
                  max="150"
                  value={wasteWeight}
                  onChange={(e) => setWasteWeight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="pickup-date">Preferred Date</label>
                <input
                  id="pickup-date"
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="db-btn-secondary"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="db-btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Recycle Guide */}
      {showGuideModal && (
        <div className="db-modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="db-modal-content wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>CleanBee Smart Sorting Guide</h3>
              <button className="close-modal-btn" onClick={() => setShowGuideModal(false)}>
                &times;
              </button>
            </div>
            <div className="db-guide-body">
              <p className="guide-intro">
                Earn maximum Eco Points by correctly sorting your waste before collection!
              </p>
              <div className="guide-categories-grid">
                <div className="guide-cat-card plastic-border">
                  <div className="guide-cat-header">
                    <span className="cat-badge plastic-badge">Plastic</span>
                    <h5>Bottles, Jugs & Tubs</h5>
                  </div>
                  <p>Rinse before recycling. Labels can stay on. Avoid plastic bags or wraps.</p>
                  <span className="point-gain">+10 Eco Points/kg</span>
                </div>

                <div className="guide-cat-card organic-border">
                  <div className="guide-cat-header">
                    <span className="cat-badge organic-badge">Organic</span>
                    <h5>Food scraps & Peels</h5>
                  </div>
                  <p>Compostable waste only. Never mix with plastics, foil, or wrappers.</p>
                  <span className="point-gain">+15 Eco Points/kg</span>
                </div>

                <div className="guide-cat-card paper-border">
                  <div className="guide-cat-header">
                    <span className="cat-badge paper-badge">Paper</span>
                    <h5>Cardboard & Mail</h5>
                  </div>
                  <p>Flatten cardboard boxes. Must be dry and free of food residue (e.g. clean pizza boxes).</p>
                  <span className="point-gain">+8 Eco Points/kg</span>
                </div>

                <div className="guide-cat-card ewaste-border">
                  <div className="guide-cat-header">
                    <span className="cat-badge ewaste-badge">E-Waste</span>
                    <h5>Gadgets & Batteries</h5>
                  </div>
                  <p>Special handling required. Never throw in regular bins. Safe disposal certified.</p>
                  <span className="point-gain">+25 Eco Points/kg</span>
                </div>
              </div>
              <div className="guide-footer-info">
                <strong>Tip:</strong> Clean, dry, and correctly separated waste earns 2x multipliers!
              </div>
            </div>
            <div className="modal-actions">
              <button className="db-btn-primary" onClick={() => setShowGuideModal(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Profile */}
      {showEditProfile && (
        <div className="db-modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="db-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>Edit Profile Settings</h3>
              <button className="close-modal-btn" onClick={() => setShowEditProfile(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="db-modal-form">
              <div className="form-group">
                <label htmlFor="edit-first-name">First Name</label>
                <input
                  id="edit-first-name"
                  type="text"
                  value={profileFirstName}
                  onChange={(e) => setProfileFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-last-name">Last Name</label>
                <input
                  id="edit-last-name"
                  type="text"
                  value={profileLastName}
                  onChange={(e) => setProfileLastName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email">Email Address</label>
                <input
                  id="edit-email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="db-btn-secondary"
                  onClick={() => setShowEditProfile(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="db-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
