
import { useEffect, useState, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Menu,
  X,
  Crown,
  ChevronDown,
  UserRound,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "All Jobs", to: "/jobs" },
  { label: "Membership", to: "/membership" },
];

function readSavedUser() {
  try {
    const token = sessionStorage.getItem("jobhub_user_token");
    const savedUser = sessionStorage.getItem("jobhub_user");

    if (!token || !savedUser) return null;

    const parsedUser = JSON.parse(savedUser);

    if (!parsedUser || parsedUser.role !== "user") {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState(() => readSavedUser());

  const navigate = useNavigate();
  const location = useLocation();

  // Login/logout aur route change par account state refresh karo.
  const syncUser = useCallback(() => {
    setUser(readSavedUser());
  }, []);

  useEffect(() => {
    syncUser();

    // Same tab mein login/logout hone par.
    window.addEventListener("jobhub-auth-changed", syncUser);

    // Dusre tab mein storage change hone par, agar event available ho.
    window.addEventListener("storage", syncUser);

    // Tab par wapas aane par latest session read karo.
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("jobhub-auth-changed", syncUser);
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, [syncUser, location.pathname]);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-700"
    }`;

  function closeMenus() {
    setOpen(false);
    setAccountOpen(false);
  }

  function handleLogout() {
    sessionStorage.removeItem("jobhub_user_token");
    sessionStorage.removeItem("jobhub_user");

    setUser(null);
    closeMenus();

    window.dispatchEvent(new Event("jobhub-auth-changed"));
    navigate("/login", { replace: true });
  }

  function handleNavigation() {
    closeMenus();
    syncUser();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={handleNavigation}
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Job<span className="text-indigo-600">Hub</span>
            </span>
            <p className="text-[10px] font-medium tracking-wider text-slate-500">
              PRIVATE JOB UPDATES
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={handleNavigation}
              className={linkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop account actions */}
        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Link
                to="/membership"
                onClick={handleNavigation}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:px-4"
              >
                <Crown size={17} />
                <span>Go Premium</span>
              </Link>

              <Link
                to="/login"
                onClick={handleNavigation}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LogIn size={17} />
                Login
              </Link>

              <Link
                to="/register"
                onClick={handleNavigation}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                <UserPlus size={17} />
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/membership"
                onClick={handleNavigation}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Crown size={17} />
                Go Premium
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-label="Open account menu"
                  className="inline-flex max-w-56 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <UserRound size={17} />
                  </span>

                  <span className="max-w-28 truncate text-sm font-semibold text-slate-800">
                    {user.name || "My Account"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name || "My Account"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email || ""}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={handleNavigation}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard size={17} />
                      My Dashboard
                    </Link>

                    <Link
                      to="/membership"
                      onClick={handleNavigation}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Crown size={17} />
                      Membership
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => {
            setOpen((value) => !value);
            setAccountOpen(false);
            syncUser();
          }}
          className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {open && (
        <nav className="border-t border-slate-100 bg-white p-3 shadow-lg md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/membership"
              onClick={handleNavigation}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              <Crown size={17} />
              Go Premium
            </Link>

            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={handleNavigation}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <LogIn size={17} />
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={handleNavigation}
                  className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  <UserPlus size={17} />
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-slate-200 p-3">
                <div className="flex items-center gap-3 px-1 py-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <UserRound size={20} />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.name || "My Account"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email || ""}
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={handleNavigation}
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard size={17} />
                  My Dashboard
                </Link>

                <Link
                  to="/membership"
                  onClick={handleNavigation}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Crown size={17} />
                  Membership
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
