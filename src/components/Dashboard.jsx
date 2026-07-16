import { useState } from "react";
import "./Dashboard.css";

// SVG Icons
const BellIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9m-5 12a2 2 0 0 1-4 0" /></svg>;
const TrashIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const TruckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const ClockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const LeafIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 20 2c1 2 1.5 5.5.2 11.2A7 7 0 0 1 11 20zM9 21c0-5 2.5-7.5 5-9"/></svg>;
const UserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>;
const CalendarIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="db-icon"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;

export default function Dashboard({ onLogout }) {
  const [firstName, setFirstName] = useState(() => localStorage.getItem("firstName") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "user@cleanbee.com");
  const [showModal, setShowModal] = useState(null); // "pickup", "guide", "profile", "bell"
  const [stats, setStats] = useState({ total: 12, completed: 8, pending: 4, points: 150 });
  const [activities, setActivities] = useState([
    { id: 103, status: "In Progress", text: "Request #103 In Progress" },
    { id: 102, status: "Pending", text: "Request #102 Pending" },
    { id: 101, status: "Completed", text: "Request #101 Completed" },
  ]);

  const [inputName, setInputName] = useState(firstName);
  const [inputEmail, setInputEmail] = useState(email);
  const [wasteType, setWasteType] = useState("Plastic");

  const handleRequestPickup = (e) => {
    e.preventDefault();
    const nextId = Math.max(...activities.map((a) => a.id), 100) + 1;
    setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));
    setActivities(prev => [{ id: nextId, status: "Pending", text: `Request #${nextId} Pending (${wasteType})` }, ...prev]);
    setShowModal(null);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("firstName", inputName);
    localStorage.setItem("email", inputEmail);
    setFirstName(inputName);
    setEmail(inputEmail);
    setShowModal(null);
  };

  return (
    <div className="db-container">
      <header className="db-header">
        <h1 className="db-logo">Clean<span className="accent">Bee</span></h1>
        <nav className="db-nav">
          <button className="nav-btn active">Dashboard</button>
          <button className="nav-btn" onClick={() => setShowModal("profile")}>Profile</button>
          <button className="nav-btn" onClick={() => setShowModal("guide")}>Guide</button>
          <button className="nav-btn logout" onClick={onLogout}>Logout</button>
        </nav>
        <button className="db-bell" onClick={() => setShowModal(showModal === "bell" ? null : "bell")} aria-label="Notifications">
          <BellIcon />
          <span className="bell-badge">3</span>
        </button>
      </header>

      <main className="db-main">
        <section className="db-welcome">
          <h2>Welcome Back, {firstName || "User"}!</h2>
          <p>Your contribution today helps build a cleaner, greener tomorrow.</p>
        </section>

        <section className="db-stats">
          <div className="stat-card">
            <TrashIcon /><div className="stat-txt"><h3>{stats.total}</h3><p>Total Requests</p></div>
          </div>
          <div className="stat-card">
            <TruckIcon /><div className="stat-txt"><h3>{stats.completed}</h3><p>Completed Pickups</p></div>
          </div>
          <div className="stat-card">
            <ClockIcon /><div className="stat-txt"><h3>{stats.pending}</h3><p>Pending Requests</p></div>
          </div>
          <div className="stat-card eco">
            <LeafIcon /><div className="stat-txt"><h3>{stats.points}</h3><p>Eco Points</p></div>
          </div>
        </section>

        <div className="db-grid">
          <div className="db-left">
            <section className="db-card">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button onClick={() => setShowModal("pickup")}>Request Pickup</button>
                <button onClick={() => document.getElementById("activities")?.scrollIntoView({ behavior: "smooth" })}>View History</button>
                <button onClick={() => setShowModal("guide")}>Recycle Guide</button>
                <button onClick={() => setShowModal("profile")}>Edit Profile</button>
              </div>
            </section>

            <section id="activities" className="db-card">
              <h3>Recent Activities</h3>
              <div className="activity-list">
                {activities.map(act => (
                  <div key={act.id} className="activity-item">
                    <span className={`status-dot ${act.status.toLowerCase().replace(" ", "-")}`} />
                    <span className="act-text">{act.text}</span>
                    <span className={`status-badge ${act.status.toLowerCase().replace(" ", "-")}`}>{act.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="db-right">
            <section className="db-card profile-summary">
              <div className="avatar">{firstName ? firstName.charAt(0).toUpperCase() : "U"}</div>
              <h4>{firstName || "CleanBee User"}</h4>
              <div className="info-row"><UserIcon /><span>{firstName || "User"}</span></div>
              <div className="info-row"><MailIcon /><span>{email}</span></div>
              <div className="info-row"><CalendarIcon /><span>Member Since July 2026</span></div>
            </section>

            <section className="db-card alerts-panel">
              <h3>System Alerts</h3>
              <div className="alert-item"><span>✓</span><p>Pickup request approved</p></div>
              <div className="alert-item"><span>🚚</span><p>Collector assigned</p></div>
              <div className="alert-item"><span>★</span><p>Earned 20 Eco Points</p></div>
            </section>
          </div>
        </div>
      </main>

      <footer className="db-footer">
        <p>&copy; 2026 CleanBee. All rights reserved.</p>
        <p>Terms of Service &bull; Privacy Policy</p>
      </footer>

      {/* Modals Container */}
      {showModal === "pickup" && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={handleRequestPickup}>
            <h3>Request waste pickup</h3>
            <div className="form-item">
              <label htmlFor="waste-select">Waste Category</label>
              <select id="waste-select" value={wasteType} onChange={e => setWasteType(e.target.value)}>
                <option value="Plastic">Plastic & Bottles</option>
                <option value="Organic">Organic & Food Waste</option>
                <option value="Paper">Paper & Cardboard</option>
                <option value="E-Waste">Electronics</option>
              </select>
            </div>
            <div className="modal-btns">
              <button type="button" onClick={() => setShowModal(null)}>Cancel</button>
              <button type="submit" className="primary">Schedule</button>
            </div>
          </form>
        </div>
      )}

      {showModal === "profile" && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <form className="modal-card" onClick={e => e.stopPropagation()} onSubmit={handleSaveProfile}>
            <h3>Edit Profile</h3>
            <div className="form-item">
              <label htmlFor="first-name-input">First Name</label>
              <input id="first-name-input" type="text" value={inputName} onChange={e => setInputName(e.target.value)} required />
            </div>
            <div className="form-item">
              <label htmlFor="email-input">Email Address</label>
              <input id="email-input" type="email" value={inputEmail} onChange={e => setInputEmail(e.target.value)} required />
            </div>
            <div className="modal-btns">
              <button type="button" onClick={() => setShowModal(null)}>Cancel</button>
              <button type="submit" className="primary">Save</button>
            </div>
          </form>
        </div>
      )}

      {showModal === "guide" && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-card guide" onClick={e => e.stopPropagation()}>
            <h3>Smart Sorting Guide</h3>
            <div className="guide-grid">
              <div className="guide-card"><h5>Plastic</h5><p>Rinse before recycling. Labels can stay on.</p><span>+10 Eco Pts/kg</span></div>
              <div className="guide-card"><h5>Organic</h5><p>Compostable waste only. No plastics mixed.</p><span>+15 Eco Pts/kg</span></div>
              <div className="guide-card"><h5>Paper</h5><p>Flatten cardboard. Must be dry and clean.</p><span>+8 Eco Pts/kg</span></div>
              <div className="guide-card"><h5>E-Waste</h5><p>Certified electronics and batteries disposal.</p><span>+25 Eco Pts/kg</span></div>
            </div>
            <button className="primary" onClick={() => setShowModal(null)}>Got It</button>
          </div>
        </div>
      )}

      {showModal === "bell" && (
        <div className="bell-dropdown">
          <div className="bell-header"><h5>Notifications</h5><button onClick={() => setShowModal(null)}>&times;</button></div>
          <div className="bell-item">Pickup request approved</div>
          <div className="bell-item">Collector assigned</div>
          <div className="bell-item">Earned 20 Eco Points</div>
        </div>
      )}
    </div>
  );
}
