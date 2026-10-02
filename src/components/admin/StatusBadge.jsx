import React from "react";

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "status-badge-pending" },
  approved: { label: "Approved", className: "status-badge-approved" },
  rejected: { label: "Rejected", className: "status-badge-rejected" },
  clearer_photo_requested: { label: "Clearer Photo Requested", className: "status-badge-warning" },
  corrections_requested: { label: "Corrections Requested", className: "status-badge-warning" },
  in_progress: { label: "In Progress", className: "status-badge-info" },
  completed: { label: "Completed", className: "status-badge-success" },
  active: { label: "Active", className: "status-badge-approved" },
  suspended: { label: "Suspended", className: "status-badge-rejected" },
};

export default function StatusBadge({ status, customLabel }) {
  const normalizedStatus = (status || "pending").toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus] || {
    label: customLabel || status || "Pending",
    className: "status-badge-default",
  };

  return (
    <span className={`admin-status-badge ${config.className}`}>
      <span className="badge-dot" />
      {customLabel || config.label}
    </span>
  );
}
