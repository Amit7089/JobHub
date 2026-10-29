
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      if (!result?.success || !result?.token || !result?.user) {
        throw new Error("Login response sahi nahi hai. Dobara try karein.");
      }

      const role = result.user.role;

      if (role === "admin") {
        sessionStorage.removeItem("jobhub_user_token");
        sessionStorage.removeItem("jobhub_user");

        sessionStorage.setItem("jobhub_admin_token", result.token);
        sessionStorage.setItem(
          "jobhub_admin",
          JSON.stringify(result.user)
        );

        navigate("/admin", { replace: true });
      } else if (role === "user") {
        sessionStorage.removeItem("jobhub_admin_token");
        sessionStorage.removeItem("jobhub_admin");

        sessionStorage.setItem("jobhub_user_token", result.token);
        sessionStorage.setItem("jobhub_user", JSON.stringify(result.user));

        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Account role verify nahi ho paaya.");
      }
    } catch (err) {
      setError(err.message || "Login nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LogIn size={27} />
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm font-semibold text-indigo-600">
            WELCOME BACK
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Login to JobHub
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Admin ya User, apne account se login karein.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <span className="relative mt-1 block">
              <Mail
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={fieldClass}
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <span className="relative mt-1 block">
              <Lock
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-400">
          Aapke account ke role ke hisaab se dashboard khulega.
        </p>
      </div>
    </main>
  );
}
