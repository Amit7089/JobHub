
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Crown,
  Gem,
  LoaderCircle,
  ShieldCheck,
  BriefcaseBusiness,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import {
  createMembershipOrder,
  verifyMembershipPayment,
  fetchMyMembership,
} from "../services/membershipApi";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const plans = [
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 1,
    duration: "30 days",
    description: "Premium access for one month.",
    icon: Crown,
    features: [
      "Access to Premium job portal",
      "Telegram and WhatsApp community links",
      "Premium job listings and official apply links",
      "30 days membership validity",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: 99,
    duration: "365 days",
    description: "Premium access for one year.",
    icon: Gem,
    features: [
      "All Monthly Premium features",
      "Access to Premium job portal",
      "Telegram and WhatsApp community links",
      "365 days membership validity",
    ],
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const scriptUrl =
      "https://checkout.razorpay.com/v1/checkout.js";

    const existing = document.querySelector(
      `script[src="${scriptUrl}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existing.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function Membership() {
  const navigate = useNavigate();

  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPlan, setBuyingPlan] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loggedIn = Boolean(
    sessionStorage.getItem("jobhub_user_token")
  );

  const refreshMembership = useCallback(async () => {
    if (!sessionStorage.getItem("jobhub_user_token")) {
      setMembership(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await fetchMyMembership();
      setMembership(result.membership);
    } catch (err) {
      setError(
        err.message || "Unable to load membership details."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMembership();
  }, [refreshMembership]);

  async function handlePurchase(plan) {
    setError("");
    setMessage("");

    if (!sessionStorage.getItem("jobhub_user_token")) {
      navigate("/login");
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      setError(
        "Razorpay Key ID missing hai. Frontend .env check karein."
      );
      return;
    }

    setBuyingPlan(plan);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay Checkout load nahi ho paya. Internet connection check karein."
        );
      }

      // Backend plan ID ke basis par actual price decide karta hai.
      const orderResult = await createMembershipOrder(plan);

      if (!orderResult?.order?.id) {
        throw new Error("Payment order create nahi ho paya.");
      }

      const order = orderResult.order;

      await new Promise((resolve, reject) => {
        let paymentSubmitted = false;
        let completed = false;

        function rejectOnce(err) {
          if (completed) return;
          completed = true;
          reject(err);
        }

        const checkout = new window.Razorpay({
          key: orderResult.keyId || RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "JobHub",
          description:
            plan === "monthly"
              ? "Monthly Premium Membership"
              : "Yearly Premium Membership",
          order_id: order.id,

          handler: async function (response) {
            paymentSubmitted = true;

            try {
              const result = await verifyMembershipPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (!result.success || !result.membership) {
                throw new Error(
                  result.message ||
                    "Payment verification complete nahi hui."
                );
              }

              setMembership(result.membership);
              setMessage(
                "Payment verified! Aapki Premium membership activate ho gayi hai."
              );

              completed = true;
              resolve();
            } catch (err) {
              rejectOnce(
                new Error(
                  `${err.message} Agar payment deduct hui hai, dobara pay karne se pehle payment status check karein.`
                )
              );

              // Payment response fail hone par server se status refresh karein.
              refreshMembership();
            }
          },

          modal: {
            ondismiss: function () {
              if (!paymentSubmitted) {
                rejectOnce(
                  new Error(
                    "Checkout close ho gaya. Payment complete nahi hui ya confirm nahi ho saki."
                  )
                );
              }
            },
          },

          theme: {
            color: "#4f46e5",
          },
        });

        checkout.on("payment.failed", function (response) {
          rejectOnce(
            new Error(
              response.error?.description ||
                "Payment fail ho gayi. Please dobara try karein."
            )
          );
        });

        checkout.open();
      });
    } catch (err) {
      setError(err.message || "Payment process nahi ho paya.");
    } finally {
      setBuyingPlan("");
    }
  }

  const isPremium = Boolean(membership?.isPremium);

  const expiryDate = membership?.expiresAt
    ? new Date(membership.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 px-6 py-10 text-center text-white shadow-lg sm:px-10 sm:py-14">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
              <Crown size={17} />
              JobHub Premium
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Upgrade your job search
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Premium job listings, private community links aur
              official company apply links ek hi jagah.
            </p>
          </div>
        </header>

        {/* Loading */}
        {loading ? (
          <div className="mt-12 flex items-center justify-center gap-3 text-slate-600">
            <LoaderCircle className="animate-spin" size={25} />
            <span>Membership details load ho rahi hain...</span>
          </div>
        ) : isPremium ? (
          /* Active Premium membership */
          <section className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-indigo-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-2xl bg-green-100 p-4 text-green-700">
                  <ShieldCheck size={35} />
                </div>

                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                    <Check size={14} />
                    ACTIVE MEMBERSHIP
                  </span>

                  <h2 className="mt-2 text-2xl font-extrabold">
                    Your Premium is active!
                  </h2>

                  <p className="mt-1 text-slate-600">
                    Aap Premium Job Portal access kar sakte hain.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">
                    Current plan
                  </p>

                  <p className="mt-1 text-lg font-bold capitalize">
                    {membership.plan === "monthly"
                      ? "Monthly Premium"
                      : membership.plan === "yearly"
                        ? "Yearly Premium"
                        : membership.plan}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={16} />
                    Valid until
                  </div>

                  <p className="mt-1 text-lg font-bold">
                    {expiryDate || "Expiry date unavailable"}
                  </p>
                </div>
              </div>

              {/* Main feature button */}
              <div className="mt-6 rounded-2xl bg-indigo-50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                    <BriefcaseBusiness size={25} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      Premium Job Portal
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Saari published jobs dekhein aur Telegram aur
                      WhatsApp community links se judein.
                    </p>
                  </div>
                </div>

                <Link
                  to="/premium-portal"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Open Premium Job Portal
                  <ArrowRight size={19} />
                </Link>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Access sirf active Premium members ke liye hai.
                </p>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-500">
                Aapki current membership expire hone ke baad
                Premium-only features ka access band ho jayega.
              </p>
            </div>
          </section>
        ) : (
          /* Membership plans */
          <section className="mt-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Choose your Premium plan
              </h2>

              <p className="mt-3 text-slate-600">
                Payment verify hone ke baad Premium Portal unlock hoga.
              </p>
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isBusy = buyingPlan === plan.id;

                return (
                  <section
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8 ${
                      plan.id === "yearly"
                        ? "border-indigo-300"
                        : "border-slate-200"
                    }`}
                  >
                    {plan.id === "yearly" && (
                      <span className="absolute right-5 top-5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                        YEARLY PLAN
                      </span>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                        <Icon size={28} />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold">
                          {plan.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold tracking-tight">
                        ₹{plan.price}
                      </span>

                      <span className="text-sm text-slate-500">
                        / {plan.duration}
                      </span>
                    </div>

                    <div className="my-6 h-px bg-slate-100" />

                    <ul className="flex-1 space-y-4">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                        >
                          <Check
                            size={18}
                            className="mt-1 shrink-0 text-green-600"
                          />

                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={Boolean(buyingPlan)}
                      onClick={() => handlePurchase(plan.id)}
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? (
                        <>
                          <LoaderCircle
                            size={19}
                            className="animate-spin"
                          />
                          Processing payment...
                        </>
                      ) : (
                        <>Choose {plan.name}</>
                      )}
                    </button>
                  </section>
                );
              })}
            </div>
          </section>
        )}

        {/* Login / register prompt */}
        {!loggedIn && !loading && (
          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-slate-700">
              Premium membership kharidne ke liye login karein ya
              naya account banayein.
            </p>

            <div className="mt-4 flex justify-center gap-3">
              <Link
                className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white"
                to="/login"
              >
                Login
              </Link>

              <Link
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-800"
                to="/register"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Success / error messages */}
        {message && (
          <div
            role="status"
            className="mx-auto mt-6 max-w-2xl rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-green-800"
          >
            <p className="font-semibold">{message}</p>

            {isPremium && (
              <Link
                to="/premium-portal"
                className="mt-3 inline-flex items-center gap-2 font-bold text-green-800 underline"
              >
                Open Premium Portal <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-700"
          >
            <p className="font-semibold">{error}</p>

            {error.toLowerCase().includes("session") && (
              <Link
                to="/login"
                className="mt-2 inline-block font-semibold underline"
              >
                Login again
              </Link>
            )}
          </div>
        )}

        <footer className="mx-auto mt-12 max-w-2xl text-center text-xs leading-6 text-slate-500">
          Payments Razorpay ke through process hote hain. Premium
          access backend payment verification aur active membership
          ke basis par milta hai.
        </footer>
      </div>
    </main>
  );
}
