import VolunteerTaskCard from "./VolunteerTaskCard";
import "./VolunteerTaskList.css";

export default function VolunteerTaskList({
  tasks = [],
  loading = false,
  error = "",
  emptyTitle = "No tasks available",
  emptyMessage = "There are currently no volunteer tasks matching your selection.",
  onViewDetails,
  onClaim,
  onStart,
  onComplete,
  onRefresh,
}) {
  if (loading) {
    return (
      <div className="vol-list-state vol-list-state--loading">
        <div className="vol-spinner" />
        <p>Loading volunteer tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vol-list-state vol-list-state--error">
        <span className="state-icon">⚠️</span>
        <h4>Could not load tasks</h4>
        <p>{error}</p>
        {onRefresh && (
          <button type="button" className="vol-retry-btn" onClick={onRefresh}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="vol-list-state vol-list-state--empty">
        <span className="state-icon">🌱</span>
        <h4>{emptyTitle}</h4>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="volunteer-task-grid">
      {tasks.map((task) => (
        <VolunteerTaskCard
          key={task.id}
          task={task}
          onViewDetails={onViewDetails}
          onClaim={onClaim}
          onStart={onStart}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
