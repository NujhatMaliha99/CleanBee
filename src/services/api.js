const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = Object.values(data.errors || {}).flat()[0];

    throw new Error(
      validationMessage ||
      data.message ||
      "Something went wrong. Please try again."
    );
  }

  return data;
}

export const authApi = {
  login: (credentials) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (details) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  currentUser: () => request("/me"),

  resendVerification: () =>
    request("/email/verification-notification", {
      method: "POST",
    }),

  updateProfile: (details) =>
    request("/profile", {
      method: "PUT",
      body: JSON.stringify(details),
    }),

  logout: () =>
    request("/logout", {
      method: "POST",
    }),
};

export const pickupApi = {
  getAll: () => request("/pickups"),

  getById: (id) => request(`/pickups/${id}`),

  create: (details) => {
    if (details instanceof FormData) {
      return request("/pickups", {
        method: "POST",
        body: details,
      });
    }
    return request("/pickups", {
      method: "POST",
      body: JSON.stringify(details),
    });
  },

  update: (id, details) => {
    if (details instanceof FormData) {
      // Laravel method spoofing if needed for multipart
      details.append("_method", "PUT");
      return request(`/pickups/${id}`, {
        method: "POST",
        body: details,
      });
    }
    return request(`/pickups/${id}`, {
      method: "PUT",
      body: JSON.stringify(details),
    });
  },

  cancel: (id) =>
    request(`/pickups/${id}`, {
      method: "DELETE",
    }),

  getPhotos: (pickupId) => request(`/pickups/${pickupId}/photos`),

  uploadPhoto: (pickupId, photo, photoType = "before") => {
    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("photo_type", photoType);

    return request(`/pickups/${pickupId}/photos`, {
      method: "POST",
      body: formData,
    });
  },
};

export const volunteerApi = {
  getAvailableTasks: () => request("/volunteer/tasks"),

  getTaskById: (id) => request(`/volunteer/tasks/${id}`),

  getMyTasks: () => request("/volunteer/my-tasks"),

  claimTask: (pickupId) =>
    request(`/volunteer/tasks/${pickupId}/claim`, {
      method: "POST",
    }),

  startTask: (pickupId) =>
    request(`/volunteer/tasks/${pickupId}/start`, {
      method: "POST",
    }),

  completeTask: (pickupId) =>
    request(`/volunteer/tasks/${pickupId}/complete`, {
      method: "POST",
    }),
};
