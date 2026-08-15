const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
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