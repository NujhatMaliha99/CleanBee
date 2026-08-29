import TaskStatusBadge from "./TaskStatusBadge";
import TaskActivityTimeline from "./TaskActivityTimeline";
import "./TaskDetailsModal.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onClaimClick,
  onStartClick,
  onCompleteClick,
}) {
  if (!isOpen || !task) return null;

  const formatDate = (d) => {
    if (!d) return "Not scheduled";
    const dateObj = new Date(d);
    if (Number.isNaN(dateObj.getTime())) return d;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http") || path.startsWith("data:")) return path;
    const cleanPath = path.replace(/^public\//, "");
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  const imageUrl = getImageUrl(task.image_path || task.previewUrl || task.image);
  const status = (task.status || "pending").toLowerCase().replace("-", "_");

  return (
    <div className="task-details-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="task-details-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-details-header">
          <div className="task-details-title-area">
            <div className="task-details-id-row">
              <span className="task-details-id">Volunteer Task #{task.id}</span>
              <TaskStatusBadge status={task.status} size="large" />
            </div>
            <p className="task-details-sub">
              Requester: {task.user?.first_name ? `${task.user.first_name} ${task.user.last_name || ""}` : "Community Member"}
            </p>
          </div>
          <button className="task-details-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="task-details-body">
          <div className="task-details-grid">
            {/* Waste Info */}
            <div className="t-info-box">
              <span className="t-info-label">Waste Type & Volume</span>
              <div className="t-info-main">
                <span className="waste-type-tag">{task.waste_type}</span>
                <span className="waste-qty-highlight">
                  {task.quantity} {task.quantity_unit || "kg"}
                </span>
              </div>
            </div>

            {/* Schedule */}
            <div className="t-info-box">
              <span className="t-info-label">Target Pickup Time</span>
              <div className="t-info-schedule">
                <div>📅 {formatDate(task.pickup_date)}</div>
                <div>⏰ {task.pickup_time || "Morning (10:00 AM)"}</div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="t-info-box t-info-box--full">
              <span className="t-info-label">Pickup Location & Contact</span>
              <div className="loc-contact-details">
                <div className="loc-line">
                  <span className="loc-icon">📍</span>
                  <span className="loc-text">{task.pickup_address || "Address upon assignment"}</span>
                </div>
                <div className="contact-line">
                  <span className="contact-icon">📞</span>
                  <span>{task.contact_phone || task.user?.phone || "Contact hidden until claimed"}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            {task.instructions && (
              <div className="t-info-box t-info-box--full">
                <span className="t-info-label">Requester Instructions</span>
                <p className="t-instructions">{task.instructions}</p>
              </div>
            )}

            {/* Waste Photo */}
            {imageUrl && (
              <div className="t-info-box t-info-box--full">
                <span className="t-info-label">Waste Photo</span>
                <div className="task-photo-wrapper">
                  <img
                    src={imageUrl}
                    alt={`Waste for Task #${task.id}`}
                    className="task-modal-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Lifecycle Activity Timeline */}
            <div className="t-info-box t-info-box--full">
              <TaskActivityTimeline task={task} />
            </div>
          </div>
        </div>

        {/* Footer with contextual actions */}
        <div className="task-details-footer">
          {status === "pending" || status === "available" ? (
            <button
              className="task-modal-action-btn task-modal-action-btn--claim"
              onClick={() => {
                onClose();
                onClaimClick?.(task);
              }}
            >
              🤝 Claim This Task
            </button>
          ) : status === "accepted" ? (
            <button
              className="task-modal-action-btn task-modal-action-btn--start"
              onClick={() => {
                onClose();
                onStartClick?.(task);
              }}
            >
              🚚 Start Pickup
            </button>
          ) : status === "in_progress" ? (
            <button
              className="task-modal-action-btn task-modal-action-btn--complete"
              onClick={() => {
                onClose();
                onCompleteClick?.(task);
              }}
            >
              ✓ Complete Pickup
            </button>
          ) : null}

          <button className="task-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
