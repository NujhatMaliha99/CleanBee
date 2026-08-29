import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { volunteerApi } from "../services/api";
import VolunteerStats from "./VolunteerStats";
import TaskFilters from "./TaskFilters";
import VolunteerTaskList from "./VolunteerTaskList";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskConfirmationModal from "./TaskConfirmationModal";
import "./VolunteerDashboard.css";

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 6l-7 6 7 6" />
  </svg>
);

export default function VolunteerDashboard({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  // Top tabs: 'available' | 'my-tasks'
  const [mainTab, setMainTab] = useState("available");
  // Sub-tabs for My Tasks: 'accepted' | 'in_progress' | 'completed' | 'all'
  const [myTasksTab, setMyTasksTab] = useState("accepted");

  // Data states
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [sortBy, setSortBy] = useState("date_asc");

  // Modals state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmTask, setConfirmTask] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState("claim"); // 'claim' | 'start' | 'complete'
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Fetch Available & My Tasks from Backend
  const loadData = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.allSettled([
      volunteerApi.getAvailableTasks(),
      volunteerApi.getMyTasks(),
    ])
      .then(([availableRes, myTasksRes]) => {
        if (availableRes.status === "fulfilled") {
          const data = availableRes.value?.data || availableRes.value || [];
          setAvailableTasks(Array.isArray(data) ? data : []);
        } else {
          console.warn("Could not fetch available tasks:", availableRes.reason);
        }

        if (myTasksRes.status === "fulfilled") {
          const data = myTasksRes.value?.data || myTasksRes.value || [];
          setMyTasks(Array.isArray(data) ? data : []);
        } else {
          console.warn("Could not fetch my tasks:", myTasksRes.reason);
        }

        if (availableRes.status === "rejected" && myTasksRes.status === "rejected") {
          setError(
            availableRes.reason?.message ||
              "Unable to load volunteer tasks from the backend. Please check connection."
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load volunteer data:", err);
        setError(err.message || "Failed to load volunteer data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      volunteerApi.getAvailableTasks(),
      volunteerApi.getMyTasks(),
    ])
      .then(([availableRes, myTasksRes]) => {
        if (!active) return;
        if (availableRes.status === "fulfilled") {
          const data = availableRes.value?.data || availableRes.value || [];
          setAvailableTasks(Array.isArray(data) ? data : []);
        }

        if (myTasksRes.status === "fulfilled") {
          const data = myTasksRes.value?.data || myTasksRes.value || [];
          setMyTasks(Array.isArray(data) ? data : []);
        }

        if (availableRes.status === "rejected" && myTasksRes.status === "rejected") {
          setError(
            availableRes.reason?.message ||
              "Unable to load volunteer tasks from the backend. Please check connection."
          );
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load volunteer data:", err);
        setError(err.message || "Failed to load volunteer data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Compute Distinct Areas for filter dropdown
  const areas = useMemo(() => {
    const all = [...availableTasks, ...myTasks];
    const set = new Set();
    all.forEach((t) => {
      if (t.pickup_address) {
        const parts = t.pickup_address.split(",");
        const area = parts.length > 1 ? parts[parts.length - 2].trim() : parts[0].trim();
        if (area) set.add(area);
      }
    });
    return Array.from(set).slice(0, 10);
  }, [availableTasks, myTasks]);

  // Compute Stats
  const stats = useMemo(() => {
    const acceptedCount = myTasks.filter(
      (t) => (t.status || "").toLowerCase() === "accepted"
    ).length;
    const inProgressCount = myTasks.filter(
      (t) => (t.status || "").toLowerCase() === "in_progress"
    ).length;
    const completedCount = myTasks.filter(
      (t) => (t.status || "").toLowerCase() === "completed"
    ).length;

    // Eco points calculation
    const points = completedCount * 50 + 20 * (acceptedCount + inProgressCount);

    return {
      available: availableTasks.length,
      accepted: acceptedCount,
      inProgress: inProgressCount,
      completed: completedCount,
      points,
    };
  }, [availableTasks, myTasks]);

  // Filter & Sort Logic
  const filterAndSort = useCallback(
    (taskList) => {
      return taskList
        .filter((task) => {
          // Category
          if (categoryFilter !== "all") {
            const taskType = (task.waste_type || "").toLowerCase();
            if (taskType !== categoryFilter.toLowerCase()) return false;
          }
          // Area
          if (selectedArea !== "all") {
            if (!task.pickup_address?.toLowerCase().includes(selectedArea.toLowerCase())) {
              return false;
            }
          }
          // Search query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchId = String(task.id).includes(q);
            const matchWaste = (task.waste_type || "").toLowerCase().includes(q);
            const matchAddress = (task.pickup_address || "").toLowerCase().includes(q);
            const matchUser = task.user?.first_name?.toLowerCase().includes(q);
            return matchId || matchWaste || matchAddress || matchUser;
          }
          return true;
        })
        .sort((a, b) => {
          if (sortBy === "date_asc") {
            return new Date(a.pickup_date || a.created_at) - new Date(b.pickup_date || b.created_at);
          }
          if (sortBy === "date_desc") {
            return new Date(b.pickup_date || b.created_at) - new Date(a.pickup_date || a.created_at);
          }
          if (sortBy === "quantity_desc") {
            return Number(b.quantity || 0) - Number(a.quantity || 0);
          }
          if (sortBy === "quantity_asc") {
            return Number(a.quantity || 0) - Number(b.quantity || 0);
          }
          return 0;
        });
    },
    [categoryFilter, selectedArea, searchQuery, sortBy]
  );

  const displayedAvailableTasks = useMemo(() => {
    return filterAndSort(availableTasks);
  }, [availableTasks, filterAndSort]);

  const displayedMyTasks = useMemo(() => {
    let filtered = myTasks;
    if (myTasksTab !== "all") {
      filtered = myTasks.filter(
        (t) => (t.status || "").toLowerCase().replace("-", "_") === myTasksTab
      );
    }
    return filterAndSort(filtered);
  }, [myTasks, myTasksTab, filterAndSort]);

  // Modal Handlers
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleOpenClaimModal = (task) => {
    setConfirmTask(task);
    setConfirmActionType("claim");
  };

  const handleOpenStartModal = (task) => {
    setConfirmTask(task);
    setConfirmActionType("start");
  };

  const handleOpenCompleteModal = (task) => {
    setConfirmTask(task);
    setConfirmActionType("complete");
  };

  const handleConfirmAction = async (taskId) => {
    try {
      setIsSubmittingAction(true);

      if (confirmActionType === "claim") {
        await volunteerApi.claimTask(taskId);
        showToast(`Task #${taskId} claimed successfully! Moved to My Tasks.`);
      } else if (confirmActionType === "start") {
        await volunteerApi.startTask(taskId);
        showToast(`Pickup #${taskId} started! Status updated to In Progress.`);
      } else if (confirmActionType === "complete") {
        await volunteerApi.completeTask(taskId);
        showToast(`Pickup #${taskId} completed successfully! Eco Points awarded.`);
      }

      setConfirmTask(null);
      await loadData();
    } catch (err) {
      console.error("Action error:", err);
      alert(err.message || "Failed to update task status.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSelectedArea("all");
    setSortBy("date_asc");
  };

  return (
    <div className="volunteer-dashboard-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="vol-toast">
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="vol-header">
        <div className="vol-header-inner">
          <div className="vol-header-left">
            <button
              type="button"
              className="vol-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <Link to="/" className="vol-logo">
              Clean<span>Bee</span>
            </Link>
            <span className="vol-header-tag">Volunteer Hub</span>
          </div>

          <div className="vol-header-right">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="vol-header-link">
                  User Dashboard
                </Link>
                <Link to="/pickup-requests" className="vol-header-link">
                  Pickup Requests
                </Link>
                <button type="button" className="vol-logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="vol-header-link vol-header-link--login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="vol-hero">
        <div className="vol-hero-inner">
          <span className="vol-hero-badge">Community Action</span>
          <h1>Volunteer Task Management</h1>
          <p>
            Help your neighborhood eliminate waste! Claim open pickup requests, collect recyclables, and make
            a direct environmental impact while earning Eco Points.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="vol-main-content">
        <div className="vol-container">
          {/* Summary Statistics */}
          <VolunteerStats stats={stats} />

          {/* Top Level Navigation Tabs */}
          <div className="vol-main-tabs">
            <button
              type="button"
              className={`vol-main-tab-btn ${mainTab === "available" ? "active" : ""}`}
              onClick={() => setMainTab("available")}
            >
              <span className="tab-icon">📬</span>
              <span>Available Tasks</span>
              <span className="tab-pill">{availableTasks.length}</span>
            </button>

            <button
              type="button"
              className={`vol-main-tab-btn ${mainTab === "my-tasks" ? "active" : ""}`}
              onClick={() => setMainTab("my-tasks")}
            >
              <span className="tab-icon">🎒</span>
              <span>My Tasks</span>
              <span className="tab-pill">{myTasks.length}</span>
            </button>
          </div>

          {/* Sub-tabs for My Tasks */}
          {mainTab === "my-tasks" && (
            <div className="vol-sub-tabs">
              <button
                type="button"
                className={`vol-sub-tab-btn ${myTasksTab === "accepted" ? "active" : ""}`}
                onClick={() => setMyTasksTab("accepted")}
              >
                Accepted ({stats.accepted})
              </button>
              <button
                type="button"
                className={`vol-sub-tab-btn ${myTasksTab === "in_progress" ? "active" : ""}`}
                onClick={() => setMyTasksTab("in_progress")}
              >
                In Progress ({stats.inProgress})
              </button>
              <button
                type="button"
                className={`vol-sub-tab-btn ${myTasksTab === "completed" ? "active" : ""}`}
                onClick={() => setMyTasksTab("completed")}
              >
                Completed ({stats.completed})
              </button>
              <button
                type="button"
                className={`vol-sub-tab-btn ${myTasksTab === "all" ? "active" : ""}`}
                onClick={() => setMyTasksTab("all")}
              >
                All My Tasks ({myTasks.length})
              </button>
            </div>
          )}

          {/* Filters Bar */}
          <div className="vol-filters-section">
            <TaskFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              selectedArea={selectedArea}
              onAreaChange={setSelectedArea}
              sortBy={sortBy}
              onSortChange={setSortBy}
              areas={areas}
              onReset={handleResetFilters}
            />
          </div>

          {/* Task Grid View */}
          <div className="vol-tasks-section">
            {mainTab === "available" ? (
              <VolunteerTaskList
                tasks={displayedAvailableTasks}
                loading={loading}
                error={error}
                emptyTitle="No Available Tasks"
                emptyMessage="Great news! There are currently no unassigned pickup tasks waiting in this area."
                onViewDetails={handleOpenDetails}
                onClaim={handleOpenClaimModal}
                onRefresh={loadData}
              />
            ) : (
              <VolunteerTaskList
                tasks={displayedMyTasks}
                loading={loading}
                error={error}
                emptyTitle={`No ${myTasksTab.replace("_", " ")} tasks`}
                emptyMessage="You don't have any tasks in this stage right now. Browse available tasks to claim one!"
                onViewDetails={handleOpenDetails}
                onStart={handleOpenStartModal}
                onComplete={handleOpenCompleteModal}
                onRefresh={loadData}
              />
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedTask(null);
        }}
        onClaimClick={handleOpenClaimModal}
        onStartClick={handleOpenStartModal}
        onCompleteClick={handleOpenCompleteModal}
      />

      {/* Confirmation Modal */}
      <TaskConfirmationModal
        task={confirmTask}
        actionType={confirmActionType}
        isOpen={Boolean(confirmTask)}
        onClose={() => setConfirmTask(null)}
        onConfirm={handleConfirmAction}
        isSubmitting={isSubmittingAction}
      />

      <footer className="vol-footer">
        <p>&copy; 2026 CleanBee Volunteer Network. Powered by community changemakers.</p>
      </footer>
    </div>
  );
}
