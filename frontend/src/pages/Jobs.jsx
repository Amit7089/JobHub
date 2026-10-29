
import { useEffect, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  RefreshCw,
  AlertCircle,
  MapPin,
  RotateCcw,
} from "lucide-react";

import JobCard from "../components/jobs/JobCard";
import { fetchJobs } from "../services/jobApi";

const categories = [
  "All",
  "IT & Software",
  "Sales & Retail",
  "Customer Support",
  "Engineering",
  "Finance",
  "Marketing",
  "Government",
  "Other",
];

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchJobs({
          search: search.trim(),
          category: category === "All" ? "" : category,
          page,
          limit: 9,
        });

        if (cancelled) return;

        // The backend /jobs endpoint should return only
        // published, non-expired public jobs.
        const fetchedJobs = Array.isArray(result.jobs)
          ? result.jobs.filter(
              (job) =>
                job.jobType === "public" &&
                job.status === "published" &&
                (!job.expiresAt ||
                  new Date(job.expiresAt) > new Date())
            )
          : [];

        setJobs(fetchedJobs);
        setPagination(result.pagination || null);
      } catch (err) {
        if (!cancelled) {
          setJobs([]);
          setPagination(null);
          setError(
            err.message ||
              "Jobs load nahi ho paayi. Backend server check karein."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [search, category, page, retry]);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleCategoryChange(event) {
    setCategory(event.target.value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setPage(1);
  }

  // Backend pagination property is "pages".
  const totalPages = pagination?.pages;

  const hasNextPage =
    typeof totalPages === "number"
      ? page < totalPages
      : jobs.length === 9;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div>
          <p className="text-sm font-semibold tracking-wide text-indigo-600">
            JOBHUB CAREERS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            All Jobs
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Sabhi users ke liye available public job openings dekhein.
            Job details check karein aur application ke liye official
            company career website par jaayein.
          </p>
        </div>

        {/* Search and category filters */}
        <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          <label className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
            <Search
              size={19}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Job title ya company search karein"
              className="w-full min-w-0 bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              aria-label="Search jobs"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="shrink-0 text-sm text-slate-500 hover:text-slate-900"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 focus-within:border-indigo-400">
            <BriefcaseBusiness
              size={18}
              className="shrink-0 text-slate-400"
            />

            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full min-w-0 bg-white py-3 text-sm text-slate-700 outline-none"
              aria-label="Filter jobs by category"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All categories" : item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Listings heading */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Available Public Jobs
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Bina membership ke available published job listings.
            </p>
          </div>

          {!loading && !error && (
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
              {pagination?.total ?? jobs.length}{" "}
              {(pagination?.total ?? jobs.length) === 1
                ? "job"
                : "jobs"}
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-indigo-600"
            />

            <p className="mt-4 font-semibold text-slate-800">
              Jobs load ho rahi hain...
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Latest published public listings check ki ja rahi hain.
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
            <AlertCircle
              size={34}
              className="text-red-500"
            />

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Jobs load nahi ho paayi
            </h3>

            <p className="mt-2 break-words text-sm text-slate-600">
              {error}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Backend server, API URL aur MongoDB connection check karein.
            </p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RotateCcw size={16} />
              Dobara try karein
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-indigo-50">
              <BriefcaseBusiness
                size={30}
                className="text-indigo-600"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              {search || category !== "All"
                ? "Koi matching public job nahi mili"
                : "Abhi koi public job available nahi hai"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search || category !== "All"
                ? "Search keyword ya category badal kar dobara try karein."
                : "Admin ke Public Jobs section mein job add aur publish hone ke baad listing yahan dikhni chahiye."}
            </p>

            {(search || category !== "All") && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Saare filters hataayein
              </button>
            )}
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard
                  key={job._id || job.id}
                  job={job}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-slate-600">
                Page {page}
                {typeof totalPages === "number"
                  ? ` of ${totalPages}`
                  : ""}
              </span>

              <button
                type="button"
                disabled={!hasNextPage || loading}
                onClick={() => {
                  setPage((current) => current + 1);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <MapPin
            size={19}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <p className="text-xs leading-5 text-amber-900">
            Apply karne se pehle company ki official career website par
            vacancy, eligibility aur last date verify karein. JobHub
            independent job information platform hai; hiring company nahi hai.
          </p>
        </div>
      </section>
    </main>
  );
}
