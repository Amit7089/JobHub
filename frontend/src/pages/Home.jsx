
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Code2,
  GraduationCap,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import JobCard from "../components/jobs/JobCard";
import { demoJobs } from "../data/demoJobs";

const categories = [
  { name: "IT & Software", icon: Code2 },
  { name: "Sales & Retail", icon: Building2 },
  { name: "Customer Support", icon: Headphones },
];

export default function Home() {
  const latestJobs = demoJobs.slice(0, 3);

  return (
    <main>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
              <Sparkles size={16} />
              Private jobs, ek hi jagah
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Apni next job
              <span className="block text-indigo-600">
                yahin se khojein.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Company, qualification aur location ke hisaab se
              private job opportunities discover karein.
              Complete details aur application ke liye seedha
              official career website par jayein.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white hover:bg-indigo-700"
              >
                Explore Jobs <ArrowRight size={18} />
              </Link>

              <Link
                to="/membership"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Membership Plans
              </Link>
            </div>

            <div className="mt-7 flex items-start gap-2 text-sm leading-6 text-slate-500">
              <ShieldCheck size={19} className="mt-0.5 shrink-0 text-emerald-600" />
              Apply karne se pehle employer ke official portal par
              eligibility aur vacancy status check karein.
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-full bg-indigo-100/70 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                  <BriefcaseBusiness size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Find your opportunity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Simple search. Official apply links.
                  </p>
                </div>
              </div>

              <Link
                to="/jobs"
                className="mt-7 flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <span className="flex items-center gap-3">
                  <Code2 className="text-indigo-600" />
                  <span>
                    <span className="block font-semibold">IT & Software</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Technology aur fresher roles
                    </span>
                  </span>
                </span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/jobs"
                className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="text-indigo-600" />
                  <span>
                    <span className="block font-semibold">Fresher Jobs</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Entry-level opportunities
                    </span>
                  </span>
                </span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/jobs"
                className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <span className="flex items-center gap-3">
                  <MapPin className="text-indigo-600" />
                  <span>
                    <span className="block font-semibold">Location-wise Jobs</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Apni pasand ki location search karein
                    </span>
                  </span>
                </span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-7 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ["Job Discovery", "Search by role", BriefcaseBusiness],
            ["Short Details", "Quick overview", GraduationCap],
            ["Official Apply", "Company career links", Building2],
            ["Premium Alerts", "Extra curated updates", Sparkles],
          ].map(([title, description, Icon]) => (
            <div key={title} className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm">
                <Icon size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Browse categories
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
              Jobs by category
            </h2>
            <p className="mt-2 text-slate-500">
              Apne interest ke hisaab se opportunities explore karein.
            </p>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-indigo-700">
            All jobs <ArrowRight size={16} className="ml-1 inline" />
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {categories.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to="/jobs"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
            >
              <Icon size={25} className="text-indigo-600" />
              <h3 className="mt-5 font-bold text-slate-900">{name}</h3>
              <p className="mt-2 text-sm text-slate-500">
                Browse opportunities
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                Explore <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                Recent listings
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">
                Latest jobs
              </h2>
              <p className="mt-2 text-slate-500">
                Sample listings — active vacancies abhi verify nahi hui hain.
              </p>
            </div>

            <Link
              to="/jobs"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              View all jobs <ArrowRight size={16} className="ml-1 inline" />
            </Link>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-indigo-600">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              More job updates chahiye?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
              JobHub Premium ke proposed plans dekhein aur additional
              curated alerts ke options explore karein.
            </p>
          </div>

          <Link
            to="/membership"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-indigo-700 hover:bg-indigo-50"
          >
            View Membership <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
