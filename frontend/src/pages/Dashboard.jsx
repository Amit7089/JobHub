
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserRound, BriefcaseBusiness, Crown, LogOut } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jobhub_user_token");
    const savedUser = sessionStorage.getItem("jobhub_user");

    if (!token || !savedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser.role !== "user") {
        sessionStorage.removeItem("jobhub_user_token");
        sessionStorage.removeItem("jobhub_user");
        navigate("/login", { replace: true });
        return;
      }

      setUser(parsedUser);
    } catch {
      sessionStorage.removeItem("jobhub_user_token");
      sessionStorage.removeItem("jobhub_user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  function logout() {
    sessionStorage.removeItem("jobhub_user_token");
    sessionStorage.removeItem("jobhub_user");
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 to-blue-600 p-7 text-white sm:p-10">
          <p className="text-sm font-medium text-indigo-100">JOBHUB MEMBER AREA</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome, {user.name}!
          </h1>
          <p className="mt-3 text-sm text-indigo-100 sm:text-base">
            Aapka JobHub account successfully create ho gaya hai.
          </p>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <DashboardCard
            icon={<UserRound size={23} />}
            title="My Profile"
            description={`Name: ${user.name}\nEmail: ${user.email}`}
          />

          <DashboardCard
            icon={<BriefcaseBusiness size={23} />}
            title="Explore Jobs"
            description="Latest private job listings aur official application links dekhein."
            action={() => navigate("/jobs")}
            actionLabel="Browse jobs"
          />

          <DashboardCard
            icon={<Crown size={23} />}
            title="Membership"
            description="JobHub ke available free aur premium plans dekhein."
            action={() => navigate("/membership")}
            actionLabel="View plans"
          />
        </section>

        <button
          type="button"
          onClick={logout}
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </main>
  );
}

function DashboardCard({ icon, title, description, action, actionLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action && (
        <button
          type="button"
          onClick={action}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </article>
  );
}
