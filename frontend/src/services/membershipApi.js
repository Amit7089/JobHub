
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function membershipRequest(path, body) {
  const token = sessionStorage.getItem("jobhub_user_token");

  if (!token) {
    throw new Error("Please login before purchasing Premium.");
  }

  const response = await fetch(`${API_URL}/membership${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Membership request failed.");
  }

  return data;
}

export function createMembershipOrder(plan) {
  return membershipRequest("/create-order", { plan });
}

export function verifyMembershipPayment(payment) {
  return membershipRequest("/verify", payment);
}

export function fetchMyMembership() {
  return membershipRequest("/me");
}
