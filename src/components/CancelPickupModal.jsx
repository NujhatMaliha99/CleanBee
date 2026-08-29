import { useState } from "react";
import "./CancelPickupModal.css";

export default function CancelPickupModal({ pickup, isOpen, onClose, onConfirm, isSubmitting }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !pickup) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for cancelling this request.");
      return;
    }
    setError("");
    onConfirm(pickup.id, reason);
  };

  return (
    <div className="cancel-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-modal-header">
          <div className="cancel-modal-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3>Cancel Pickup Request</h3>
            <p className="cancel-modal-subtitle">
              Request #{pickup.id} &bull; {pickup.waste_type} ({pickup.quantity} {pickup.quantity_unit})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cancel-modal-body">
            <p className="cancel-warning-text">
              Are you sure you want to cancel this pickup request? This action cannot be undone.
            </p>

            <div className="cancel-form-group">
              <label htmlFor="cancel-reason">Reason for cancellation <span className="req">*</span></label>
              <select
                id="cancel-reason-select"
                value={reason.startsWith("Other:") ? "Other" : reason}
                onChange={(e) => {
                  const val = e.target.value;
                  setReason(val === "Other" ? "Other: " : val);
                  setError("");
                }}
                className="cancel-select"
              >
                <option value="">-- Select a reason --</option>
                <option value="No longer needed / Recycled elsewhere">No longer needed / Recycled elsewhere</option>
                <option value="Wrong address or details entered">Wrong address or details entered</option>
                <option value="Schedule conflict / Not available at chosen time">Schedule conflict / Not available at chosen time</option>
                <option value="Item already collected">Item already collected</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            {(reason === "Other" || reason.startsWith("Other:")) && (
              <div className="cancel-form-group">
                <label htmlFor="cancel-custom-reason">Please specify details</label>
                <textarea
                  id="cancel-custom-reason"
                  rows="3"
                  className="cancel-textarea"
                  placeholder="Explain why you are cancelling..."
                  value={reason.replace(/^Other:\s*/, "")}
                  onChange={(e) => setReason(`Other: ${e.target.value}`)}
                />
              </div>
            )}

            {error && <p className="cancel-error-msg">{error}</p>}
          </div>

          <div className="cancel-modal-footer">
            <button
              type="button"
              className="cancel-btn cancel-btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Keep Request
            </button>
            <button
              type="submit"
              className="cancel-btn cancel-btn--danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
