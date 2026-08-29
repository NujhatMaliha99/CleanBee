import "./TaskStatusBadge.css";

const TASK_STATUSES = {
  pending: { label: "Available", className: "task-badge--available" },
  available: { label: "Available", className: "task-badge--available" },
  accepted: { label: "Accepted", className: "task-badge--accepted" },
  in_progress: { label: "In Progress", className: "task-badge--progress" },
  completed: { label: "Completed", className: "task-badge--completed" },
  cancelled: { label: "Cancelled", className: "task-badge--cancelled" },
};

export default function TaskStatusBadge({ status = "available", size = "normal" }) {
  const normalized = (status || "").toLowerCase().replace("-", "_");
  const config = TASK_STATUSES[normalized] || {
    label: status || "Unknown",
    className: "task-badge--default",
  };

  return (
    <span className={`task-status-badge ${config.className} task-status-badge--${size}`}>
      <span className="task-status-badge__dot" />
      <span className="task-status-badge__text">{config.label}</span>
    </span>
  );
}
