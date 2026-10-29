
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  ExternalLink,
  Send,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <BriefcaseBusiness size={25} />
            <span className="text-2xl font-extrabold">
              Job<span className="text-indigo-400">Hub</span>
            </span>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            Private job opportunities ki short information ek jagah.
            Candidates ko application ke liye company ke official
            career portal par bheja jata hai.
          </p>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            JobHub ek independent job information platform hai,
            kisi employer ki official recruitment website nahi.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Quick Links</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-white">All Jobs</Link>
            </li>
            <li>
              <Link to="/membership" className="hover:text-white">Membership Plans</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold">Stay Updated</h3>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Official job notifications aur naye updates ke liye
            hamare channels se jud sakte hain.
          </p>

          <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Send size={15} />
            Telegram channel link baad mein configure hoga.
          </p>

          <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <ExternalLink size={15} />
            WhatsApp channel link baad mein configure hoga.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} JobHub. All rights reserved.</p>
          <p>Job availability aur application details employer ki website par verify karein.</p>
        </div>
      </div>
    </footer>
  );
}
