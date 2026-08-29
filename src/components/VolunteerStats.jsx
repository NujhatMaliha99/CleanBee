import "./VolunteerStats.css";

export default function VolunteerStats({ stats = {} }) {
  const {
    available = 0,
    accepted = 0,
    inProgress = 0,
    completed = 0,
    points = 0,
  } = stats;

  return (
    <div className="volunteer-stats-grid">
      {/* Available Tasks */}
      <div className="vol-stat-card vol-stat-card--available">
        <div className="vol-stat-icon-wrap">
          <span>📬</span>
        </div>
        <div className="vol-stat-info">
          <span className="vol-stat-number">{available}</span>
          <span className="vol-stat-label">Available to Claim</span>
        </div>
      </div>

      {/* Accepted */}
      <div className="vol-stat-card vol-stat-card--accepted">
        <div className="vol-stat-icon-wrap">
          <span>🤝</span>
        </div>
        <div className="vol-stat-info">
          <span className="vol-stat-number">{accepted}</span>
          <span className="vol-stat-label">Claimed / Accepted</span>
        </div>
      </div>

      {/* In Progress */}
      <div className="vol-stat-card vol-stat-card--progress">
        <div className="vol-stat-icon-wrap">
          <span>🚚</span>
        </div>
        <div className="vol-stat-info">
          <span className="vol-stat-number">{inProgress}</span>
          <span className="vol-stat-label">Pickups In Progress</span>
        </div>
      </div>

      {/* Completed */}
      <div className="vol-stat-card vol-stat-card--completed">
        <div className="vol-stat-icon-wrap">
          <span>🎉</span>
        </div>
        <div className="vol-stat-info">
          <span className="vol-stat-number">{completed}</span>
          <span className="vol-stat-label">Completed Pickups</span>
        </div>
      </div>

      {/* Volunteer Eco Points */}
      <div className="vol-stat-card vol-stat-card--points">
        <div className="vol-stat-icon-wrap">
          <span>🌿</span>
        </div>
        <div className="vol-stat-info">
          <span className="vol-stat-number">{points}</span>
          <span className="vol-stat-label">Eco Points Earned</span>
        </div>
      </div>
    </div>
  );
}
