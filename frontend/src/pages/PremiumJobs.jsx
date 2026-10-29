
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Search,
  X,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const CATEGORIES = [
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

export default function PremiumJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    const token = sessionStorage.getItem("jobhub_user_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/premium/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          navigate("/membership", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Premium jobs load nahi ho paayi."
          );
        }

        if (!cancelled) {
          setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Kuch galat ho gaya.");
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
  }, [navigate]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        [
          job.title,
          job.company,
          job.category,
          job.location,
          job.experience,
          job.qualification,
          job.summary,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesCategory =
        category === "All Categories" ||
        String(job.category || "").toLowerCase() ===
          category.toLowerCase();

      const isNotExpired =
        !job.expiresAt || new Date(job.expiresAt) > new Date();

      return matchesSearch && matchesCategory && isNotExpired;
    });
  }, [jobs, search, category]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center gap-3 bg-slate-50 px-4">
        <LoaderCircle
          className="animate-spin text-indigo-600"
          size={28}
        />
        <span className="font-medium text-slate-600">
          Premium jobs load ho rahi hain...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/premium-portal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
        >
          <ArrowLeft size={17} />
          Back to Premium Portal
        </Link>

        {/* Compact header */}
        <header className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-800 to-violet-700 p-5 text-white sm:p-7">
          <p className="text-xs font-bold tracking-[0.18em] text-indigo-200">
            JOBHUB PREMIUM
          </p>

          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Premium Jobs
          </h1>

          <p className="mt-2 text-sm text-indigo-100">
            Members ke liye exclusive job opportunities.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
            <BriefcaseBusiness size={16} />
            {filteredJobs.length} jobs found
          </div>
        </header>

        {/* Search and category filters */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job, company, location..."
                aria-label="Search premium jobs"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!search && category === "All Categories"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
              Clear
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-2 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && filteredJobs.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <BriefcaseBusiness
              size={38}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-3 text-lg font-bold text-slate-800">
              {jobs.length === 0
                ? "Abhi koi premium job available nahi hai"
                : "Koi matching job nahi mili"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {jobs.length === 0
                ? "Admin ke premium jobs publish karne par yahan dikhengi."
                : "Search keyword ya category change karke dobara try karein."}
            </p>

            {(search || category !== "All Categories") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Smaller job cards */}
        {!error && filteredJobs.length > 0 && (
          <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <article
                key={job._id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-indigo-700">
                      {job.company || "Company"}
                    </p>

                    <h2 className="mt-1 line-clamp-2 text-base font-bold leading-5 text-slate-900">
                      {job.title}
                    </h2>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                  {job.category && (
                    <span className="rounded-md bg-indigo-50 px-2 py-1 font-medium text-indigo-700">
                      {job.category}
                    </span>
                  )}

                  {job.experience && (
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                      {job.experience}
                    </span>
                  )}
                </div>

                {job.location && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={14} className="shrink-0" />
                    <span className="line-clamp-1">{job.location}</span>
                  </p>
                )}

                {job.qualification && (
                  <p className="mt-2 line-clamp-1 text-xs text-slate-600">
                    <span className="font-semibold">Qualification:</span>{" "}
                    {job.qualification}
                  </p>
                )}

                {job.summary && (
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-5 text-slate-600">
                    {job.summary}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  {job.officialUrl ? (
                    <a
                      href={job.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Apply Now
                      <ExternalLink size={15} />
                    </a>
                  ) : (
                    <div className="rounded-lg bg-slate-100 px-3 py-2.5 text-center text-xs font-medium text-slate-500">
                      Application link not available
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
