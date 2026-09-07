const MOCK_PICKUPS = [
  {
    id: 4127,
    waste_type: "Plastic",
    quantity: 4,
    quantity_unit: "kg",
    pickup_address: "24 Road 7, Dhanmondi, Dhaka",
    pickup_date: "2026-09-08",
    pickup_time: "10:00",
    contact_phone: "+880 1700-000000",
    instructions: "Please call when you arrive.",
    assigned_volunteer: { first_name: "Nadia", last_name: "Rahman" },
    status: "Pending",
    created_at: "2026-09-03T09:30:00Z",
  },
  {
    id: 4122,
    waste_type: "Paper and Cardboard",
    quantity: 2,
    quantity_unit: "bags",
    pickup_address: "18 Lake Drive, Gulshan, Dhaka",
    pickup_date: "2026-09-05",
    pickup_time: "14:30",
    contact_phone: "+880 1800-000000",
    assigned_volunteer: { first_name: "Arif", last_name: "Hasan" },
    status: "Accepted",
    created_at: "2026-09-01T12:00:00Z",
  },
  {
    id: 4104,
    waste_type: "E-Waste",
    quantity: 3,
    quantity_unit: "items",
    pickup_address: "7/A Central Road, Mirpur, Dhaka",
    pickup_date: "2026-08-28",
    pickup_time: "09:00",
    contact_phone: "+880 1900-000000",
    assigned_volunteer: { first_name: "Mina", last_name: "Akter" },
    status: "Completed",
    created_at: "2026-08-25T08:00:00Z",
  },
];

let pickups = [...MOCK_PICKUPS];
let nextId = 4128;

const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 450));

export const createPickup = async (details) => {
  const pickup = {
    ...details,
    id: nextId++,
    status: "Pending",
    created_at: new Date().toISOString(),
    assigned_volunteer: null,
  };
  pickups = [pickup, ...pickups];
  return wait(pickup);
};

export const getMyPickups = async () => wait([...pickups]);

export const getPickupDetails = async (id) => wait(pickups.find((pickup) => pickup.id === id));

export const cancelPickup = async (id) => {
  pickups = pickups.map((pickup) =>
    pickup.id === id ? { ...pickup, status: "Cancelled" } : pickup
  );
  return wait(pickups.find((pickup) => pickup.id === id));
};