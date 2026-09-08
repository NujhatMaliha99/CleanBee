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
  {
    id: 5198, waste_type: "Organic", quantity: 3, quantity_unit: "bags",
    pickup_address: "18 Lake Drive, Gulshan, Dhaka", pickup_date: "2026-09-05", pickup_time: "14:30",
    distance: "3.2 km", instructions: "Keep the bags beside the front entrance.", contact_phone: "+880 1800-000000",
    created_at: "2026-09-03T16:15:00Z", status: "Available", assigned_volunteer_id: null,
    user: { first_name: "Tareq", last_name: "Ahmed" },
  },
  {
    id: 5186, waste_type: "Paper", quantity: 4, quantity_unit: "bags",
    pickup_address: "7/A Central Road, Mirpur, Dhaka", pickup_date: "2026-09-07", pickup_time: "09:00",
    distance: "5.4 km", instructions: "Paper is sorted and tied in bundles.", contact_phone: "+880 1900-000000",
    created_at: "2026-09-02T11:20:00Z", status: "Available", assigned_volunteer_id: null,
    user: { first_name: "Nabila", last_name: "Sultana" },
  },
  {
    id: 5170, waste_type: "Glass", quantity: 8, quantity_unit: "items",
    pickup_address: "11 Green Road, Mohammadpur, Dhaka", pickup_date: "2026-09-04", pickup_time: "16:00",
    distance: "2.6 km", instructions: "Handle the glass bottles carefully.", contact_phone: "+880 1600-000000",
    created_at: "2026-08-31T09:00:00Z", status: "Accepted", assigned_volunteer_id: VOLUNTEER_ID,
    assigned_at: "2026-09-01T10:00:00Z", assigned_volunteer: { first_name: "You", last_name: "" },
    user: { first_name: "Rafi", last_name: "Hossain" },
  },
  {
    id: 5155, waste_type: "E-Waste", quantity: 4, quantity_unit: "items",
    pickup_address: "33 Banani Road, Banani, Dhaka", pickup_date: "2026-09-03", pickup_time: "11:30",
    distance: "4.1 km", instructions: "Old devices are packed in one box.", contact_phone: "+880 1500-000000",
    created_at: "2026-08-28T13:30:00Z", status: "In Progress", assigned_volunteer_id: VOLUNTEER_ID,
    assigned_at: "2026-08-29T08:30:00Z", started_at: "2026-09-03T11:00:00Z",
    assigned_volunteer: { first_name: "You", last_name: "" }, user: { first_name: "Maliha", last_name: "Jahan" },
  },
  {
    id: 5132, waste_type: "Metal", quantity: 12, quantity_unit: "kg",
    pickup_address: "5 Riverside Avenue, Uttara, Dhaka", pickup_date: "2026-08-30", pickup_time: "15:00",
    distance: "6.8 km", instructions: "The collection is at the security desk.", contact_phone: "+880 1400-000000",
    created_at: "2026-08-25T08:20:00Z", status: "Completed", assigned_volunteer_id: VOLUNTEER_ID,
    assigned_at: "2026-08-26T09:00:00Z", started_at: "2026-08-30T14:30:00Z", completed_at: "2026-08-30T15:40:00Z",
    earned_points: 60, assigned_volunteer: { first_name: "You", last_name: "" }, user: { first_name: "Fahim", last_name: "Rashid" },
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
