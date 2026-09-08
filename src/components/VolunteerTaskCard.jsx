import TaskStatusBadge from "./TaskStatusBadge";
import "./VolunteerTaskCard.css";

export default function VolunteerTaskCard({
  task,
  onViewDetails,
  onClaim,
  onStart,
  onComplete,
}) {
  const status = (task.status || "pending").toLowerCase().replace(/[ -]/g, "_");

  const formatDate = (d) => {
    if (!d) return "";
    const dateObj = new Date(d);
    if (Number.isNaN(dateObj.getTime())) return d;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (d) => (d ? new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }) : "Not available");
  const ecoPoints = Math.max(20, Math.round(Number(task.quantity || 1) * 5));

  return (
    <div className={`volunteer-card volunteer-card--${status}`}>
      {/* Header */}
      <div className="volunteer-card__header">
        <div className="volunteer-card__id-tag">
          <span className="vol-id">Task #{task.id}</span>
          <span className="vol-waste">{task.waste_type}</span>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>

      {/* Body Details */}
      <div className="volunteer-card__body">
        <div className="volunteer-card__meta-row">
          <div className="vol-meta-item">
            <span className="meta-ico">⚖️</span>
            <span className="meta-txt">
              <strong>{task.quantity}</strong> {task.quantity_unit || "kg"}
            </span>
          </div>

          <div className="vol-meta-item">
            <span className="meta-ico">🌿</span>
            <span className="meta-txt eco-points-text">+{ecoPoints} Eco Pts</span>
          </div>
        </div>

        <div className="vol-meta-item">
          <span className="meta-ico">📅</span>
          <span className="meta-txt">
            {formatDate(task.pickup_date)} at {task.pickup_time || "10:00 AM"}
          </span>
        </div>

        <div className="vol-meta-item">
          <span className="meta-ico">📏</span>
          <span className="meta-txt">Approx. {task.distance || "Distance unavailable"}</span>
        </div>

        <div className="vol-meta-item vol-meta-item--address">
          <span className="meta-ico">📍</span>
          <span className="meta-txt truncate" title={task.pickup_address}>
            {task.pickup_address || "Address available after claim"}
          </span>
        </div>

        <p className="volunteer-card__instructions">{task.instructions || "No special instructions."}</p>
        <p className="volunteer-card__created">Requested {formatDateTime(task.created_at)}</p>
        {status === "completed" && (
          <p className="volunteer-card__created">Completed {formatDateTime(task.completed_at)}</p>
        )}

        {task.user?.first_name && (
          <div className="vol-meta-item vol-meta-item--user">
            <span className="meta-ico">👤</span>
            <span className="meta-txt">
              Requester: {task.user.first_name} {task.user.last_name || ""}
            </span>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="volunteer-card__actions">
        <button
          type="button"
          className="vol-btn vol-btn--details"
          onClick={() => onViewDetails(task)}
        >
          View Details
        </button>

        {(status === "pending" || status === "available") && onClaim && (
          <button
            type="button"
            className="vol-btn vol-btn--claim"
            onClick={() => onClaim(task)}
          >
            Claim Task
          </button>
        )}

        {status === "accepted" && onStart && (
          <button
            type="button"
            className="vol-btn vol-btn--start"
            onClick={() => onStart(task)}
          >
            Start Pickup
          </button>
        )}

        {status === "in_progress" && onComplete && (
          <button
            type="button"
            className="vol-btn vol-btn--complete"
            onClick={() => onComplete(task)}
          >
            Complete Pickup
          </button>
        )}

        {status === "completed" && (
          <span className="vol-completed-tag">✓ Done · +{task.earned_points || ecoPoints} pts</span>
        )}
      </div>
    </div>
  );
}
