
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import { registerUser } from "../services/authApi";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Dono passwords match nahi kar rahe.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      sessionStorage.setItem("jobhub_user_token", result.token);
      sessionStorage.setItem("jobhub_user", JSON.stringify(result.user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <UserPlus size={27} />
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm font-semibold text-indigo-600">JOIN JOBHUB</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Job updates aur apni saved jobs manage karne ke liye sign up karein.
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
            Full name
            <span className="relative mt-1 block">
              <UserRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                required
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={fieldClass}
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email address
            <span className="relative mt-1 block">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={fieldClass}
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <span className="relative mt-1 block">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={`${fieldClass} pr-12`}
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

          <label className="block text-sm font-medium text-slate-700">
            Confirm password
            <span className="relative mt-1 block">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Enter password again"
                className={fieldClass}
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={18} />
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
