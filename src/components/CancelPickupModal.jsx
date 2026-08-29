import { useState } from "react";
import "./TaskConfirmationModal.css";

export default function CancelPickupModal({
  pickup,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) {
  const [reason, setReason] = useState("");

  if (!isOpen || !pickup) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(pickup.id, reason.trim());
  };

  return (
    <div className="task-confirm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="task-confirm-card" onClick={(event) => event.stopPropagation()}>
        <div className="task-confirm-header">
          <div>
            <h3>Cancel Pickup Request</h3>
            <span className="task-confirm-step-badge">Request #{pickup.id}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="task-confirm-body">
            <p className="task-confirm-desc">
              Are you sure you want to cancel this pickup request?
            </p>
            <div className="task-confirm-note-group">
              <label htmlFor="cancellation-reason">
                Cancellation reason <span className="opt">(optional)</span>
              </label>
              <textarea
                id="cancellation-reason"
                rows="2"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="task-confirm-textarea"
              />
            </div>
          </div>

          <div className="task-confirm-footer">
            <button
              type="button"
              className="confirm-btn confirm-btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Keep Request
            </button>
            <button type="submit" className="confirm-btn" disabled={isSubmitting}>
              {isSubmitting ? "Cancelling..." : "Cancel Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
