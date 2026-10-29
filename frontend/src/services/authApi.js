
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

async function sendAuthRequest(endpoint, data) {
  const response = await fetch(`${API_URL}/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request complete nahi ho paayi");
  }

  return result;
}

export function registerUser(data) {
  return sendAuthRequest("register", data);
}

export function loginUser(data) {
  return sendAuthRequest("login", data);
}
