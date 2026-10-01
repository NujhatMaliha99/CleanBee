const STORAGE_KEY = "cleanbee-volunteer-tasks";




const VOLUNTEER_ID = localStorage.getItem("email") || "demo-volunteer";

const createActivity = (title, timestamp, description) => ({ title, timestamp, description });

const initialTasks = [
  {
    id: 5201, waste_type: "Plastic", quantity: 6, quantity_unit: "kg",
    pickup_address: "24 Road 7, Dhanmondi, Dhaka", pickup_date: "2026-09-06", pickup_time: "10:00",
    distance: "1.8 km", instructions: "Please call at the gate.", contact_phone: "+880 1700-000000",
    created_at: "2026-09-04T07:40:00Z", status: "Available", assigned_volunteer_id: null,
    user: { first_name: "Samira", last_name: "Khan" },
  },
].map((task) => ({
  ...task,
  activity_timeline: [
    createActivity("Request Created", task.created_at, "Pickup request submitted"),
    ...(task.assigned_at ? [createActivity("Task Claimed", task.assigned_at, "Task accepted by volunteer")] : []),
    ...(task.started_at ? [createActivity("Pickup Started", task.started_at, "Volunteer pickup started")] : []),
    ...(task.completed_at ? [createActivity("Pickup Completed", task.completed_at, `${task.earned_points || 0} Eco Points earned`)] : []),
  ],
}));

const readTasks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : initialTasks;
  } catch {
    return initialTasks;
  }
};

let tasks = readTasks();
const normalize = (status) => (status || "").toLowerCase().replace(/[ -]/g, "_");
const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 350));
const saveTasks = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
const getOwnedTasks = () => tasks.filter((task) => task.assigned_volunteer_id === VOLUNTEER_ID);

export const getAvailableTasks = async () => delay(tasks.filter((task) => normalize(task.status) === "available"));
export const getMyTasks = async () => delay(getOwnedTasks());
export const getTaskDetails = async (id) => delay(tasks.find((task) => task.id === id));

const updateTask = async (id, expectedStatus, status, fields, title, description) => {
  const task = tasks.find((item) => item.id === id);
  if (!task || normalize(task.status) !== expectedStatus) {
    throw new Error("This task is no longer available for that action.");
  }
  const timestamp = new Date().toISOString();
  task.status = status;
  Object.assign(task, fields);
  task.activity_timeline = [
    ...(task.activity_timeline || []),
    createActivity(title, timestamp, description),
  ];
  saveTasks();
  return delay({ ...task });
};

export const claimTask = (id) => updateTask(
  id, "available", "Accepted",
  { assigned_volunteer_id: VOLUNTEER_ID, assigned_at: new Date().toISOString(), assigned_volunteer: { first_name: "You", last_name: "" } },
  "Task Claimed", "Task accepted by you"
);

export const startTask = (id) => updateTask(
  id, "accepted", "In Progress", { started_at: new Date().toISOString() },
  "Pickup Started", "Volunteer pickup started"
);

export const completeTask = (id) => {
  const task = tasks.find((item) => item.id === id);
  const points = Math.max(20, Math.round(Number(task?.quantity || 1) * 5));
  return updateTask(
    id, "in_progress", "Completed", { completed_at: new Date().toISOString(), earned_points: points },
    "Pickup Completed", `${points} Eco Points earned`
  );
};