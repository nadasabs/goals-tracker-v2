// Dev: same origin so Vite proxies to http://localhost:3000. Production: set VITE_API_URL or defaults to localhost.
const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "" : "http://localhost:3000");

function getToken() {
  return localStorage.getItem("token");
}

function normalizeMessage(data, status) {
  const raw = data?.message;
  if (Array.isArray(raw)) return raw.join(" ");
  if (raw && typeof raw === "string") return raw;
  if (status >= 502 && status <= 504) return "Server unavailable. Is the backend running on port 3000?";
  if (status >= 500) return "Server error. Try again.";
  if (status) return `Request failed (${status}).`;
  return "Could not reach server. Is the backend running?";
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (e) {
    const err = new Error("Could not reach server. Is the backend running on port 3000?");
    err.status = 0;
    err.data = {};
    throw err;
  }

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};

  if (!res.ok) {
    const err = new Error(normalizeMessage(data, res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const auth = {
  login: (email, password) => api("/users/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email, password) => api("/users/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => api("/users/me"),
  requestPasswordReset: (email) => api("/users/request-password-reset", { method: "POST", body: JSON.stringify({ email }) }),
  updatePassword: (newPassword) => api("/users/update-password", { method: "PUT", body: JSON.stringify({ newPassword }) }),
  googleUrl: () => `${API_URL}/auth/google`,
};

export const goals = {
  list: () => api("/goals"),
  get: (id) => api(`/goals/${id}`),
  create: (body) => api("/goals", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => api(`/goals/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id) => api(`/goals/${id}`, { method: "DELETE" }),
};

export { API_URL, getToken };
