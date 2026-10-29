
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Building2,
  Clock3,
  IndianRupee,
  Search,
  Image as ImageIcon,
  X,
  ZoomIn,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const getUserToken = () => sessionStorage.getItem("jobhub_user_token");

function isWalkinJob(job) {
  return String(job?.jobType || "").toLowerCase() === "walkin";
}

function isPublishedJob(job) {
  if (job?.status && job.status !== "published") return false;

  if (job?.expiresAt) {
    const expiry = new Date(job.expiresAt);

    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return false;
    }
  }

  return true;
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPostedDate(job) {
  return (
    formatDate(job?.publishedAt) ||
    formatDate(job?.postedAt) ||
    formatDate(job?.createdAt)
  );
}

function getInterviewDate(job) {
  return (
    formatDate(job?.interviewDate) ||
    formatDate(job?.walkinDate) ||
    formatDate(job?.driveDate) ||
    ""
  );
}

function getPosterUrl(job) {
  return job?.posterUrl || job?.poster || "";
}

function getSummary(job) {
  return job?.summary || job?.description || "";
}

function getApplyUrl(job) {
  return job?.officialUrl || "";
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
    gray: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
        colors[color] || colors.blue
      }`}
    >
      {children}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <Icon size={13} className="mt-0.5 shrink-0 text-blue-600" />

      <div className="min-w-0">
        <p className="text-[9px] leading-3 text-slate-400">{label}</p>
        <p className="break-words text-[11px] font-medium leading-4 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function JobCard({ job, index, onPosterClick }) {
  const posterUrl = getPosterUrl(job);
  const interviewDate = getInterviewDate(job);
  const postedDate = getPostedDate(job);
  const summary = getSummary(job);
  const applyUrl = getApplyUrl(job);

  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    setPosterFailed(false);
  }, [posterUrl]);

  return (
    <article
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Small poster */}
      {posterUrl && !posterFailed ? (
        <button
          type="button"
          onClick={() => onPosterClick(posterUrl)}
          className="group/poster relative block w-full overflow-hidden bg-slate-50"
          aria-label="Poster full screen mein dekhein"
        >
          <img
            src={posterUrl}
            alt={`${job.company || "Company"} Walk-in Poster`}
            className="mx-auto h-24 w-full object-contain sm:h-28"
            loading="lazy"
            onError={() => setPosterFailed(true)}
          />

          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-2">
            <span className="rounded-md bg-black/60 px-2 py-1 text-[9px] font-bold text-white">
              WALK-IN
            </span>

            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[9px] font-semibold text-slate-800">
              <Maximize2 size={11} />
              View
            </span>
          </div>
        </button>
      ) : (
        <div className="flex h-20 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex items-center gap-2 text-blue-600">
            <ImageIcon size={22} />
            <span className="text-[10px] font-semibold">Walk-in Job</span>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-3">
        {/* Company and title */}
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Building2 size={16} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold text-blue-700">
              {job.company || "Company"}
            </p>

            <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900">
              {job.title || "Walk-in Job Opportunity"}
            </h2>
          </div>
        </div>

        {/* Compact badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge color="orange">Walk-in</Badge>

          {job.category && <Badge>{job.category}</Badge>}

          {job.experience && (
            <Badge color="gray">{job.experience}</Badge>
          )}
        </div>

        {/* Compact details */}
        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5">
          <InfoItem
            icon={MapPin}
            label="Location"
            value={job.location}
          />

          <InfoItem
            icon={GraduationCap}
            label="Qualification"
            value={job.qualification}
          />

          <InfoItem
            icon={IndianRupee}
            label="Salary / Package"
            value={job.salary || job.salaryRange || job.package}
          />

          <InfoItem
            icon={CalendarDays}
            label="Posted On"
            value={postedDate}
          />

          {interviewDate && (
            <InfoItem
              icon={Clock3}
              label="Interview Date"
              value={interviewDate}
            />
          )}

          {job.expiresAt && (
            <InfoItem
              icon={CalendarDays}
              label="Last Date"
              value={formatDate(job.expiresAt)}
            />
          )}
        </div>

        {/* Short description */}
        {summary && (
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <p className="mb-1 text-[10px] font-bold text-slate-800">
              Job Description
            </p>

            <p className="line-clamp-2 whitespace-pre-line break-words text-[11px] leading-4 text-slate-500">
              {summary}
            </p>
          </div>
        )}

        {/* Small apply button */}
        <div className="mt-auto pt-3">
          {isValidHttpUrl(applyUrl) ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Apply Now
              <ExternalLink size={13} />
            </a>
          ) : (
            <div className="rounded-lg bg-slate-50 px-2 py-2 text-center text-[10px] text-slate-500">
              Apply link unavailable
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function PosterViewer({ imageUrl, onClose }) {
  useEffect(() => {
    if (!imageUrl) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full screen walk-in poster"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
        aria-label="Close poster"
      >
        <X size={24} />
      </button>

      <div className="absolute left-4 top-5 hidden items-center gap-2 text-sm text-white/70 sm:flex">
        <ZoomIn size={17} />
        Full-size poster
      </div>

      <img
        src={imageUrl}
        alt="Walk-in Job Poster Full Screen"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[92vh] max-w-full select-none rounded-lg object-contain shadow-2xl"
        draggable="false"
      />

      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/60">
        Bahar click karein ya Esc dabayein
      </p>
    </div>
  );
}

export default function PremiumWalkinJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPoster, setSelectedPoster] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getUserToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/premium/walkin-jobs`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        sessionStorage.removeItem("jobhub_user_token");
        navigate("/login");
        return;
      }

      if (response.status === 403) {
        navigate("/premium-portal");
        return;
      }

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Walk-in jobs load nahi ho paayi."
        );
      }

      const responseJobs = Array.isArray(result.jobs)
        ? result.jobs
        : Array.isArray(result.data)
          ? result.data
          : [];

      const activeJobs = responseJobs
        .filter(isWalkinJob)
        .filter(isPublishedJob)
        .sort((a, b) => {
          const dateA = new Date(
            a.publishedAt || a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.publishedAt || b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

      setJobs(activeJobs);
    } catch (err) {
      setError(
        err.message || "Kuch problem aayi. Dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const categories = useMemo(() => {
    const values = jobs
      .map((job) => String(job.category || "").trim())
      .filter(Boolean);

    return [
      "All Categories",
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.qualification,
        job.category,
        job.experience,
        job.summary,
        job.salary,
        job.salaryRange,
        job.package,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesCategory =
        category === "All Categories" ||
        String(job.category || "").toLowerCase() ===
          category.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [jobs, search, category]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
  };

  const closePoster = useCallback(() => {
    setSelectedPoster("");
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-3 py-3 sm:px-5">
          <Link
            to="/premium-portal"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:text-sm"
          >
            <ArrowLeft size={17} />
            Back to Premium
          </Link>

          <div className="flex items-center gap-2 text-sm font-extrabold text-blue-700">
            <BriefcaseBusiness size={20} />
            JobHub
          </div>
        </div>
      </header>

      {/* Short hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-800 via-indigo-700 to-violet-800">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                <CalendarDays size={13} />
                JOBHUB PREMIUM
              </div>

              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Latest Walk-in Jobs
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                Walk-in interviews, company posters aur application
                details ek hi jagah par.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white sm:self-center">
              <BriefcaseBusiness size={20} />
              <div>
                <p className="text-lg font-extrabold leading-5">
                  {filteredJobs.length}
                </p>
                <p className="text-[10px] text-blue-100">
                  Matching jobs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and filters */}
      <section className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 sm:py-6">
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_230px_auto]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job, company, location..."
                aria-label="Search walk-in jobs"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-xs outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-50 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-50 sm:text-sm"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                disabled={
                  !search && category === "All Categories"
                }
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                <X size={14} />
                Clear
              </button>

              <button
                type="button"
                onClick={fetchJobs}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:flex-none"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results heading */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
              Available Opportunities
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>
          </div>

          {(search || category !== "All Categories") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-semibold text-blue-700 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-blue-600"
            />
            <p className="mt-3 text-xs font-semibold text-slate-700">
              Walk-in jobs load ho rahi hain...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-white p-5 text-center">
            <p className="text-sm font-bold text-slate-900">
              Jobs load nahi ho paayi
            </p>
            <p className="mt-2 text-xs text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchJobs}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
            <BriefcaseBusiness
              size={30}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-3 text-base font-bold text-slate-900">
              {jobs.length === 0
                ? "Abhi koi walk-in job available nahi hai"
                : "No matching jobs found"}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              {jobs.length === 0
                ? "Nayi published jobs yahan dikhengi."
                : "Search keyword ya category badal kar try karein."}
            </p>

            {(search || category !== "All Categories") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Four cards on wide desktop */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="grid grid-cols-2 items-stretch gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {filteredJobs.map((job, index) => (
              <JobCard
                key={job._id || job.id || index}
                job={job}
                index={index}
                onPosterClick={setSelectedPoster}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        {!loading && !error && jobs.length > 0 && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-blue-700"
            />
            <p className="text-[11px] leading-5 text-blue-900">
              Apply karne se pehle company ki official website par
              details verify karein. Interview date aur eligibility
              official notification se confirm karein.
            </p>
          </div>
        )}
      </section>

      <PosterViewer
        imageUrl={selectedPoster}
        onClose={closePoster}
      />
    </main>
  );
}
