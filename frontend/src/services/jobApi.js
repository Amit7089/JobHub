
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export async function fetchJobs({
  search = "",
  category = "",
  experience = "",
  page = 1,
  limit = 9,
} = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (category) {
    params.set("category", category);
  }

  if (experience) {
    params.set("experience", experience);
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await fetch(
    `${API_URL}/jobs?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(result.message || "Jobs fetch failed");
  }

  const jobs = Array.isArray(result)
    ? result
    : result.jobs ?? result.data ?? [];

  return {
    // Backend is expected to return only published public jobs.
    jobs: Array.isArray(jobs) ? jobs : [],
    pagination: result.pagination ?? null,
  };
}
