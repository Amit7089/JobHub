
import { useState } from "react";
import {
  MapPin,
  GraduationCap,
  ExternalLink,
  Bookmark,
} from "lucide-react";

export default function JobCard({ job }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            {job.company}
          </p>

          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {job.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setSaved(!saved)}
          aria-label={saved ? "Remove bookmark" : "Bookmark job"}
          className={`rounded-lg border p-2 ${
            saved
              ? "border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border-slate-200 text-slate-500"
          }`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-3 py-1.5">
          {job.category}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
          {job.experience}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <MapPin size={16} />
          {job.location}
        </p>

        <p className="flex items-center gap-2">
          <GraduationCap size={16} />
          {job.qualification}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {job.summary}
      </p>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <a
          href={job.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Official Website par Apply
          <ExternalLink size={16} />
        </a>

        <p className="mt-2 text-center text-xs text-slate-400">
          Complete details company ki official website par dekhein.
        </p>
      </div>
    </article>
  );
}
