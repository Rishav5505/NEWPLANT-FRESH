// Small fetch wrapper: adds base URL, JSON headers and the auth token.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const getToken = () => {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
};

export async function api(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const h = { ...headers };
  if (body !== undefined) h["Content-Type"] = "application/json";
  const token = getToken();
  if (token) h.Authorization = `Bearer ${token}`;
  if (auth && !token) {
    const err = new Error("Please sign in to continue");
    err.status = 401;
    throw err;
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error — please check your connection");
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (res.status === 401 && token) {
    // Stored session is no longer valid — let AuthContext sign out and ask to log in again.
    window.dispatchEvent(new Event("auth-expired"));
  }
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
