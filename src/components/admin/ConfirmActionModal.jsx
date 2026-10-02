import React, { useState } from "react";

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  actionType = "approve", // "approve" | "reject" | "warning" | "info"
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireReason = false,
  reasonPlaceholder = "Provide a reason or note...",
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError("Please provide a reason before proceeding.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  const getActionBtnClass = () => {
    if (actionType === "reject") return "admin-btn-danger";
    if (actionType === "warning") return "admin-btn-warning";
    if (actionType === "info") return "admin-btn-info";
    return "admin-btn-success";
  };

  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div
        className="admin-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="admin-modal-header">
          <div className={`admin-modal-icon icon-${actionType}`}>
            {actionType === "reject" ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : actionType === "warning" ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 11 12 14 22 4" />
              </svg>
            )}
          </div>
          <h3 className="admin-modal-title">{title}</h3>
        </div>

        <div className="admin-modal-body">
          <p className="admin-modal-message">{message}</p>

          <div className="admin-modal-reason-group">
            <label htmlFor="modal-reason-input" className="admin-input-label">
              Reason / Admin Note {requireReason && <span className="required-star">*</span>}
            </label>
            <textarea
              id="modal-reason-input"
              className="admin-textarea"
              rows={3}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              disabled={isProcessing}
            />
            {error && <p className="admin-input-error">{error}</p>}
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`admin-btn ${getActionBtnClass()}`}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
