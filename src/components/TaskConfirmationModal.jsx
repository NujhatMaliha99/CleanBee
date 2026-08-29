import { useState } from "react";
import "./TaskConfirmationModal.css";

const ACTION_CONFIG = {
  claim: {
    title: "Claim Volunteer Task",
    description:
      "By claiming this task, you commit to picking up the recyclable waste from the requester at the scheduled time.",
    confirmLabel: "Yes, Claim Task",
    badge: "Available → Accepted",
    icon: "🤝",
    buttonClass: "confirm-btn--primary",
  },
  start: {
    title: "Start Waste Pickup",
    description:
      "Confirm that you are en route or beginning the waste collection for this pickup request. The requester will be notified.",
    confirmLabel: "Start Pickup Now",
    badge: "Accepted → In Progress",
    icon: "🚚",
    buttonClass: "confirm-btn--primary",
  },
  complete: {
    title: "Complete Waste Pickup",
    description:
      "Confirm that the waste has been successfully collected, verified, and sent for recycling. This will award Eco Points to both you and the requester.",
    confirmLabel: "Complete Pickup",
    badge: "In Progress → Completed",
    icon: "🎉",
    buttonClass: "confirm-btn--success",
  },
};

export default function TaskConfirmationModal({
  task,
  actionType = "claim", // 'claim' | 'start' | 'complete'
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  const [completionNotes, setCompletionNotes] = useState("");

  if (!isOpen || !task) return null;

  const config = ACTION_CONFIG[actionType] || ACTION_CONFIG.claim;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm(task.id, { notes: completionNotes });
  };

  return (
    <div className="task-confirm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="task-confirm-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-confirm-header">
          <div className="task-confirm-icon-box">{config.icon}</div>
          <div>
            <h3>{config.title}</h3>
            <span className="task-confirm-step-badge">{config.badge}</span>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleConfirm}>
          <div className="task-confirm-body">
            <p className="task-confirm-desc">{config.description}</p>

            {/* Task summary snippet */}
            <div className="task-confirm-summary-box">
              <div className="summary-row">
                <span className="s-label">Task ID:</span>
                <span className="s-value font-bold">#{task.id}</span>
              </div>
              <div className="summary-row">
                <span className="s-label">Waste Type:</span>
                <span className="s-value">
                  {task.waste_type} ({task.quantity} {task.quantity_unit || "kg"})
                </span>
              </div>
              <div className="summary-row">
                <span className="s-label">Location:</span>
                <span className="s-value truncate">{task.pickup_address}</span>
              </div>
              <div className="summary-row">
                <span className="s-label">Schedule:</span>
                <span className="s-value">
                  {task.pickup_date} at {task.pickup_time || "10:00 AM"}
                </span>
              </div>
            </div>

            {/* Completion Note input for Complete action */}
            {actionType === "complete" && (
              <div className="task-confirm-note-group">
                <label htmlFor="completion-notes">
                  Collection Notes / Remarks <span className="opt">(optional)</span>
                </label>
                <textarea
                  id="completion-notes"
                  rows="2"
                  placeholder="e.g. 5 bags of sorted PET bottles collected safely."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="task-confirm-textarea"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="task-confirm-footer">
            <button
              type="button"
              className="confirm-btn confirm-btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              className={`confirm-btn ${config.buttonClass}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : config.confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
