
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Send,
  RefreshCw,
  X,
  BriefcaseBusiness,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Crown,
  Globe,
  CalendarDays,
  MapPin,
  Search,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const EMPTY_FORM = {
  company: "",
  title: "",
  category: "IT & Software",
  jobType: "premium",
  experience: "Fresher",
  location: "India",
  qualification: "",
  summary: "",
  officialUrl: "",
  expiresAt: "",
};

async function apiRequest(path, { token, ...options } = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(!isFormData && options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed (${response.status})`
    );
  }

  return result;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function getJobTypeLabel(jobType) {
  if (jobType === "public") return "Public Job";
  if (jobType === "walkin") return "Walk-in Job";
  return "Premium Job";
}

function getJobTypeClass(jobType) {
  if (jobType === "public") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (jobType === "walkin") {
    return "bg-orange-100 text-orange-800";
  }

  return "bg-violet-100 text-violet-800";
}

function StatusBadge({ job }) {
  const expired =
    job.status === "expired" ||
    (job.expiresAt && new Date(job.expiresAt) <= new Date());

  const status = expired ? "expired" : job.status || "draft";

  const styles = {
    published: "bg-emerald-50 text-emerald-700",
    draft: "bg-amber-50 text-amber-700",
    expired: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function JobForm({
  initialJob,
  defaultJobType,
  token,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => {
    if (!initialJob) {
      return {
        ...EMPTY_FORM,
        jobType: defaultJobType || "premium",
      };
    }

    return {
      company: initialJob.company || "",
      title: initialJob.title || "",
      category: initialJob.category || "IT & Software",
      jobType: initialJob.jobType || "premium",
      experience: initialJob.experience || "Fresher",
      location: initialJob.location || "India",
      qualification: initialJob.qualification || "",
      summary: initialJob.summary || "",
      officialUrl: initialJob.officialUrl || "",
      expiresAt: toDateInput(initialJob.expiresAt),
    };
  });

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(
    initialJob?.posterUrl || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!posterFile) return undefined;

    const objectUrl = URL.createObjectURL(posterFile);
    setPosterPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [posterFile]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "jobType" && value !== "walkin") {
      setPosterFile(null);
      setPosterPreview("");
    }

    if (name === "jobType" && value === "walkin") {
      setPosterPreview(initialJob?.posterUrl || "");
    }
  }

  function handlePosterChange(event) {
    const file = event.target.files?.[0] || null;

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        setError("Sirf JPG, PNG ya WEBP image upload karein.");
        event.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Poster image maximum 5 MB ki honi chahiye.");
        event.target.value = "";
        return;
      }
    }

    setError("");
    setPosterFile(file);

    if (!file) {
      setPosterPreview(initialJob?.posterUrl || "");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const isEditing = Boolean(initialJob?._id);
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "expiresAt") {
          payload.append(
            key,
            value
              ? new Date(`${value}T23:59:59`).toISOString()
              : ""
          );
        } else {
          payload.append(key, value ?? "");
        }
      });

      if (form.jobType === "walkin" && posterFile) {
        payload.append("poster", posterFile);
      }

      const result = await apiRequest(
        isEditing
          ? `/admin/jobs/${initialJob._id}`
          : "/admin/jobs",
        {
          token,
          method: isEditing ? "PATCH" : "POST",
          body: payload,
        }
      );

      onSaved(result.message || "Job save ho gayi.");
    } catch (err) {
      setError(err.message || "Job save nahi ho paayi.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 sm:p-6">
      <div className="mx-auto my-4 max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialJob ? "Edit job" : "Add new job"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Job ki details aur visibility select karein.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <label className="block text-sm font-semibold text-slate-800">
              Job visibility / section *
              <select
                required
                name="jobType"
                value={form.jobType}
                onChange={updateField}
                className={fieldClass}
              >
                <option value="premium">
                  Premium Job — Membership required
                </option>
                <option value="public">
                  Public Job — All users can view
                </option>
                <option value="walkin">
                  Walk-in Job — Existing Walk-in section
                </option>
              </select>
            </label>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Premium jobs membership section ke liye hain. Public
              jobs sabhi users ke All Jobs page par dikhane ke liye hain.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Company name *
              <input
                required
                name="company"
                value={form.company}
                onChange={updateField}
                className={fieldClass}
                placeholder="Example: TCS"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Job title *
              <input
                required
                name="title"
                value={form.title}
                onChange={updateField}
                className={fieldClass}
                placeholder="Example: Graduate Trainee"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Category *
              <select
                required
                name="category"
                value={form.category}
                onChange={updateField}
                className={fieldClass}
              >
                <option>IT &amp; Software</option>
                <option>Sales &amp; Retail</option>
                <option>Customer Support</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>Government</option>
                <option>Other</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Experience
              <select
                name="experience"
                value={form.experience}
                onChange={updateField}
                className={fieldClass}
              >
                <option>Fresher</option>
                <option>0-1 years</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5+ years</option>
                <option>Not specified</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Location
              <input
                name="location"
                value={form.location}
                onChange={updateField}
                className={fieldClass}
                placeholder="Bhopal / Remote"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Qualification
              <input
                name="qualification"
                value={form.qualification}
                onChange={updateField}
                className={fieldClass}
                placeholder="B.Tech / Any graduate"
              />
            </label>
          </div>

          {form.jobType === "walkin" && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
              <label className="block text-sm font-semibold text-slate-800">
                Walk-in poster image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePosterChange}
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG ya WEBP; maximum 5 MB.
              </p>

              {posterPreview && (
                <img
                  src={posterPreview}
                  alt="Walk-in poster preview"
                  className="mt-3 max-h-64 w-auto max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                />
              )}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Short job details
            <textarea
              name="summary"
              value={form.summary}
              onChange={updateField}
              maxLength={500}
              rows={4}
              className={fieldClass}
              placeholder="Responsibilities, eligibility, interview details..."
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              {form.summary.length}/500
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Official company URL *
            <input
              required
              type="url"
              name="officialUrl"
              value={form.officialUrl}
              onChange={updateField}
              className={fieldClass}
              placeholder="https://careers.company.com/job"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Expiry date (optional)
            <input
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={updateField}
              className={fieldClass}
            />
          </label>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            Save karne par job draft rahegi. Publish karne ke baad
            selected section mein dikhane ke liye backend access rules
            bhi sahi hone chahiye.
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving && (
                <RefreshCw size={16} className="animate-spin" />
              )}
              {saving
                ? "Saving..."
                : initialJob
                  ? "Save changes"
                  : "Save draft"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    () => sessionStorage.getItem("jobhub_admin_token") || ""
  );
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingJob, setEditingJob] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("premium");
  const [search, setSearch] = useState("");

  const logout = useCallback(() => {
    sessionStorage.removeItem("jobhub_admin_token");
    sessionStorage.removeItem("jobhub_admin");
    setToken("");
    setJobs([]);
    setEditingJob(null);
    setFormOpen(false);
    setNotice("");
    setError("");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadJobs = useCallback(async (activeToken = token) => {
    if (!activeToken) return;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/admin/jobs", {
        token: activeToken,
      });

      setJobs(Array.isArray(result.jobs) ? result.jobs : []);
    } catch (err) {
      const message = (err.message || "").toLowerCase();

      if (
        message.includes("session") ||
        message.includes("login") ||
        message.includes("token") ||
        message.includes("unauthorized")
      ) {
        logout();
      }

      setError(err.message || "Jobs load nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loadJobs(token);
  }, [token, navigate, loadJobs]);

  function openNewJobForm() {
    setEditingJob(null);
    setFormOpen(true);
    setError("");
  }

  function openEditForm(job) {
    setEditingJob(job);
    setFormOpen(true);
    setError("");
  }

  async function publishJob(job) {
    const confirmed = window.confirm(
      `Kya aap "${job.title}" at ${job.company} ko publish karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const result = await apiRequest(
        `/admin/jobs/${job._id}/publish`,
        {
          token,
          method: "PATCH",
        }
      );

      setNotice(result.message || "Job publish ho gayi.");
      await loadJobs(token);
    } catch (err) {
      setError(err.message || "Job publish nahi ho paayi.");
    }
  }

  async function deleteJob(job) {
    const confirmed = window.confirm(
      `Kya aap "${job.title}" ko permanently delete karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const result = await apiRequest(`/admin/jobs/${job._id}`, {
        token,
        method: "DELETE",
      });

      setNotice(result.message || "Job delete ho gayi.");
      await loadJobs(token);
    } catch (err) {
      setError(err.message || "Job delete nahi ho paayi.");
    }
  }

  async function handleSaved(message) {
    setFormOpen(false);
    setEditingJob(null);
    setNotice(message);
    setError("");
    await loadJobs(token);
  }

  const premiumJobs = useMemo(
    () => jobs.filter((job) => (job.jobType || "premium") === "premium"),
    [jobs]
  );

  const publicJobs = useMemo(
    () => jobs.filter((job) => job.jobType === "public"),
    [jobs]
  );

  const walkinJobs = useMemo(
    () => jobs.filter((job) => job.jobType === "walkin"),
    [jobs]
  );

  const activeJobs =
    activeSection === "premium"
      ? premiumJobs
      : activeSection === "public"
        ? publicJobs
        : walkinJobs;

  const filteredJobs = activeJobs.filter((job) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [
      job.title,
      job.company,
      job.location,
      job.category,
      job.qualification,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const publishedCount = jobs.filter(
    (job) =>
      job.status === "published" &&
      (!job.expiresAt || new Date(job.expiresAt) > new Date())
  ).length;

  if (!token) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-indigo-600" size={28} />
          <p className="mt-3 text-sm text-slate-500">
            Common login page khol rahe hain...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <ShieldCheck size={25} />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                JOBHUB CONTROL PANEL
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadJobs(token)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {notice && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-auto"
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BriefcaseBusiness size={22} />}
            label="Total jobs"
            value={jobs.length}
          />
          <StatCard
            icon={<CheckCircle2 size={22} />}
            label="Published jobs"
            value={publishedCount}
          />
          <StatCard
            icon={<Crown size={22} />}
            label="Premium jobs"
            value={premiumJobs.length}
          />
          <StatCard
            icon={<Globe size={22} />}
            label="Public jobs"
            value={publicJobs.length}
          />
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setActiveSection("premium");
              setSearch("");
            }}
            className={`rounded-2xl border p-5 text-left transition sm:p-6 ${
              activeSection === "premium"
                ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100"
                : "border-slate-200 bg-white hover:border-violet-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Crown size={25} />
              </div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                MEMBERSHIP
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Premium Jobs
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Membership wale users ke liye jobs manage karein.
            </p>
            <p className="mt-4 text-2xl font-extrabold text-violet-700">
              {premiumJobs.length}
              <span className="ml-2 text-sm font-medium text-slate-500">
                jobs
              </span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("public");
              setSearch("");
            }}
            className={`rounded-2xl border p-5 text-left transition sm:p-6 ${
              activeSection === "public"
                ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                : "border-slate-200 bg-white hover:border-emerald-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Globe size={25} />
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                ALL USERS
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Public Jobs
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Bina membership ke All Jobs page par dikhne wali jobs.
            </p>
            <p className="mt-4 text-2xl font-extrabold text-emerald-700">
              {publicJobs.length}
              <span className="ml-2 text-sm font-medium text-slate-500">
                jobs
              </span>
            </p>
          </button>
        </section>

        <button
          type="button"
          onClick={() => {
            setActiveSection("walkin");
            setSearch("");
          }}
          className={`mt-5 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
            activeSection === "walkin"
              ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
              : "border-slate-200 bg-white hover:border-orange-200"
          }`}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900">Walk-in Jobs</h2>
            <p className="mt-1 text-sm text-slate-500">
              Walk-in job listings aur posters manage karein.
            </p>
          </div>
          <span className="text-lg font-bold text-orange-700">
            {walkinJobs.length}
          </span>
        </button>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {activeSection === "premium"
                  ? "Membership access"
                  : activeSection === "public"
                    ? "Public access"
                    : "Walk-in listings"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {activeSection === "premium"
                  ? "Manage Premium Jobs"
                  : activeSection === "public"
                    ? "Manage Public Jobs"
                    : "Manage Walk-in Jobs"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add, edit, publish aur delete jobs.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewJobForm}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add{" "}
              {activeSection === "public"
                ? "Public"
                : activeSection === "walkin"
                  ? "Walk-in"
                  : "Premium"}{" "}
              Job
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 sm:px-5">
            {[
              { id: "premium", label: "Premium Jobs", icon: Crown },
              { id: "public", label: "Public Jobs", icon: Globe },
              { id: "walkin", label: "Walk-in Jobs", icon: CalendarDays },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveSection(id);
                  setSearch("");
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  activeSection === id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="relative max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job, company, location..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {loading && jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw size={26} className="mx-auto animate-spin" />
              <p className="mt-3 text-sm">Jobs load ho rahi hain...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-10 text-center sm:p-12">
              <BriefcaseBusiness
                size={34}
                className="mx-auto text-slate-400"
              />
              <h3 className="mt-3 font-semibold text-slate-900">
                Is section mein abhi koi job nahi hai
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Job add karne ke liye Add Job button par click karein.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Job</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Expiry</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((job) => (
                    <tr
                      key={job._id}
                      className="align-top hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {job.title}
                        </p>
                        <p className="mt-1 text-slate-600">
                          {job.company}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} />
                          {job.location || "Location not specified"}
                        </p>

                        {job.jobType === "walkin" && job.posterUrl && (
                          <img
                            src={job.posterUrl}
                            alt={`${job.title} poster`}
                            className="mt-3 max-h-24 w-auto rounded-lg border border-slate-200 object-contain"
                          />
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getJobTypeClass(
                            job.jobType
                          )}`}
                        >
                          {getJobTypeLabel(job.jobType)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {job.category || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge job={job} />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(job.expiresAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(job)}
                            title="Edit job"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          {job.status !== "published" && (
                            <button
                              type="button"
                              onClick={() => publishJob(job)}
                              title="Publish job"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <Send size={14} />
                              Publish
                            </button>
                          )}

                          {job.officialUrl && (
                            <a
                              href={job.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open official source"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <ExternalLink size={14} />
                              Source
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteJob(job)}
                            title="Delete job"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Public aur Premium jobs ka user access backend API se enforce
          hona chahiye. Sirf frontend tabs membership security nahi hain.
        </p>
      </div>

      {formOpen && (
        <JobForm
          key={editingJob?._id || `new-${activeSection}`}
          initialJob={editingJob}
          defaultJobType={activeSection}
          token={token}
          onClose={() => {
            setFormOpen(false);
            setEditingJob(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}
