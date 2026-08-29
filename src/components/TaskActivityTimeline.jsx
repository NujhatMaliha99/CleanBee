import "./TaskActivityTimeline.css";

function formatDateTime(dt) {
  if (!dt) return null;
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TaskActivityTimeline({ task }) {
  if (!task) return null;

  const currentStatus = (task.status || "pending").toLowerCase().replace("-", "_");

  // Determine which step is currently reached
  const steps = [
    {
      id: "created",
      title: "Pickup Request Created",
      description: `Requested by ${task.user?.first_name || "User"} (${task.waste_type}, ${task.quantity} ${task.quantity_unit || "kg"})`,
      time: formatDateTime(task.created_at || task.pickup_date),
      icon: "📝",
      isDone: true,
      isActive: currentStatus === "pending" || currentStatus === "available",
    },
    {
      id: "accepted",
      title: "Task Claimed by Volunteer",
      description: task.assigned_volunteer
        ? `Claimed by ${task.assigned_volunteer.first_name || "Volunteer"}`
        : task.assigned_at
        ? "Volunteer assigned to task"
        : "Awaiting volunteer acceptance",
      time: formatDateTime(task.assigned_at),
      icon: "🤝",
      isDone: ["accepted", "in_progress", "completed"].includes(currentStatus),
      isActive: currentStatus === "accepted",
    },
    {
      id: "in_progress",
      title: "Pickup In Progress",
      description: task.started_at
        ? "Volunteer is en route / collecting waste"
        : "Pickup underway",
      time: formatDateTime(task.started_at),
      icon: "🚚",
      isDone: ["in_progress", "completed"].includes(currentStatus),
      isActive: currentStatus === "in_progress",
    },
    {
      id: "completed",
      title: "Pickup Completed & Verified",
      description: task.completed_at
        ? "Waste successfully collected and points awarded"
        : "Final completion pending",
      time: formatDateTime(task.completed_at),
      icon: "🎉",
      isDone: currentStatus === "completed",
      isActive: currentStatus === "completed",
    },
  ];

  return (
    <div className="task-timeline">
      <h4 className="task-timeline__heading">Task Activity Timeline</h4>
      <div className="task-timeline__list">
        {steps.map((step, idx) => {
          const isPassed = step.isDone;
          const isCurrent = step.isActive;
          const isPending = !step.isDone;

          return (
            <div
              key={step.id}
              className={`timeline-item ${isPassed ? "is-done" : ""} ${
                isCurrent ? "is-current" : ""
              } ${isPending ? "is-pending" : ""}`}
            >
              <div className="timeline-connector">
                <div className="timeline-dot">
                  <span>{step.icon}</span>
                </div>
                {idx < steps.length - 1 && <div className="timeline-line" />}
              </div>

              <div className="timeline-content">
                <div className="timeline-header-row">
                  <span className="timeline-title">{step.title}</span>
                  {step.time && <span className="timeline-time">{step.time}</span>}
                </div>
                <p className="timeline-desc">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
