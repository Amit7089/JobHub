import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import Membership from "./pages/Membership";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PremiumPortal from "./pages/PremiumPortal";
import PremiumJobs from "./pages/PremiumJobs";
import PremiumWalkinJobs from "./pages/PremiumWalkinJobs";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/premium-portal" element={<PremiumPortal />} />
            <Route path="/premium-jobs" element={<PremiumJobs />} />
            <Route
              path="/premium-walkin-jobs"
              element={<PremiumWalkinJobs />}
            />

            <Route path="/admin" element={<Admin />} />
            <Route
              path="*"
              element={
                <main className="mx-auto max-w-7xl px-4 py-20 text-center">
                  <h1 className="text-3xl font-bold">Page not found</h1>
                  <p className="mt-3 text-slate-500">
                    Jo page aap dhoondh rahe hain, woh available nahi hai.
                  </p>
                </main>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
