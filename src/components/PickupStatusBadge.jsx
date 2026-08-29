import "./PickupStatusBadge.css";

const STATUS_CONFIG = {
  pending: { label: "Pending", className: "pickup-status--pending", dot: true },
  accepted: { label: "Accepted", className: "pickup-status--accepted", dot: true },
  in_progress: { label: "In Progress", className: "pickup-status--progress", dot: true },
  completed: { label: "Completed", className: "pickup-status--completed", dot: true },
  cancelled: { label: "Cancelled", className: "pickup-status--cancelled", dot: true },
};

export default function PickupStatusBadge({ status = "pending", size = "normal" }) {
  const normalized = (status || "").toLowerCase().replace("-", "_");
  const config = STATUS_CONFIG[normalized] || {
    label: status || "Unknown",
    className: "pickup-status--default",
    dot: false,
  };

  return (
    <span className={`pickup-status-badge ${config.className} pickup-status-badge--${size}`}>
      {config.dot && <span className="pickup-status-badge__dot" />}
      <span className="pickup-status-badge__text">{config.label}</span>
    </span>
  );
}
