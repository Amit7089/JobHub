
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Crown,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export default function PremiumPortal() {
  const navigate = useNavigate();

  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("jobhub_user_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadResources() {
      try {
        const response = await fetch(`${API_URL}/premium/resources`, {
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
            data.message || "Premium portal load nahi ho paya."
          );
        }

        if (!cancelled) {
          setResources(data.resources || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center gap-3 px-4">
        <LoaderCircle className="animate-spin text-indigo-600" size={28} />
        <span className="text-sm font-medium text-slate-600">
          Premium Portal load ho raha hai...
        </span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <h2 className="font-bold">Portal load nahi ho paya</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:py-9">
      <div className="mx-auto max-w-5xl">
        {/* Compact Premium Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-800 to-violet-700 px-5 py-7 text-white shadow-lg sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide">
              <Crown size={16} className="text-amber-300" />
              JOBHUB PREMIUM
            </div>

            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">
              Your Premium Community
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
              Exclusive job opportunities, walk-in drives aur career updates
              ek hi jagah explore karein.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white">
              <ShieldCheck size={16} className="text-emerald-300" />
              Active Premium Members Only
            </div>
          </div>
        </header>

        {/* Community Section */}
        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">
              Join Our Community
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Important job alerts aur updates paane ke liye judein.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Telegram */}
            <article className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                <Send size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900">
                  Telegram Community
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Job alerts aur recruitment updates.
                </p>

                {resources?.telegram ? (
                  <a
                    href={resources.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-900"
                  >
                    Join Telegram <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-amber-700">
                    Link configure nahi hai.
                  </p>
                )}
              </div>
            </article>

            {/* WhatsApp */}
            <article className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <MessageCircle size={25} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900">
                  WhatsApp Community
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Career updates aur job notifications.
                </p>

                {resources?.whatsapp ? (
                  <a
                    href={resources.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    Join WhatsApp <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-amber-700">
                    Link configure nahi hai.
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>

        {/* Job Cards Heading */}
        <section className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Sparkles size={21} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Explore Job Opportunities
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Apne liye sahi opportunity choose karein.
              </p>
            </div>
          </div>

          {/* Smaller Cards */}
          <div className="grid items-stretch gap-5 md:grid-cols-2">
            {/* Premium Jobs Card */}
            <article className="flex flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative overflow-hidden bg-indigo-50">
                <img
                  src="/images/premium-jobs-poster.png"
                  alt="JobHub Premium Jobs"
                  className="block aspect-[3/2] w-full object-contain"
                  loading="lazy"
                />

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-950/90 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                  <Crown size={14} className="text-amber-300" />
                  PREMIUM JOBS
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center gap-2 text-indigo-700">
                  <BriefcaseBusiness size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    All Job Categories
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                  View All Premium Jobs
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  Government jobs, private jobs, fresher openings,
                  internships aur work-from-home opportunities dekhein.
                </p>

                <Link
                  to="/premium-jobs"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  View All Jobs <ArrowRight size={17} />
                </Link>
              </div>
            </article>

            {/* Walk-in Drive Card */}
            <article className="flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative overflow-hidden bg-emerald-50">
                <img
                  src="/images/walkin-drive-poster.png"
                  alt="JobHub Walk-in Drive Jobs"
                  className="block aspect-[3/2] w-full object-contain"
                  loading="lazy"
                />

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/90 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                  <CalendarDays size={14} />
                  WALK-IN DRIVES
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CalendarDays size={18} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Direct Interviews
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                  Walk-in Drive Jobs
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                  Walk-in interviews, hiring drives, interview venues aur
                  fresher recruitment opportunities dekhein.
                </p>

                <Link
                  to="/premium-walkin-jobs"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Explore Walk-in Drives <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Compact Benefits Strip */}
        <section className="mt-7 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 p-2">
            <ShieldCheck
              size={23}
              className="shrink-0 text-emerald-600"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Premium Access
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Members-only opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <BriefcaseBusiness
              size={23}
              className="shrink-0 text-indigo-600"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Career Opportunities
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Jobs and recruitment drives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <MessageCircle
              size={23}
              className="shrink-0 text-violet-600"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Community Support
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Telegram and WhatsApp updates
              </p>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Apply karne se pehle employer ki official website par job details,
          eligibility aur interview information verify karein.
        </p>
      </div>
    </main>
  );
}
