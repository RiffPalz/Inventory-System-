import { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import adminApi from "../api/adminApi.js";

import gradient from "../assets/images/gradient.png";
import Logo from "../assets/images/logo.png";

export default function Login() {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        emailAddress: (email || "").trim().toLowerCase(),
        password,
      };

      const result = await adminApi.loginAdmin(payload);

      if (result?.success) {
        // Handle different possible token key names from backend
        const accessToken =
          result.accessToken ??
          result.raw?.accessToken ??
          result.raw?.token ??
          null;
        const refreshToken =
          result.refreshToken ?? result.raw?.refreshToken ?? null;

        if (!accessToken) {
          setError("Login succeeded but no access token was returned.");
          return;
        }

        // 1. Persist tokens for AppRouter & PrivateRoute
        localStorage.setItem("token", accessToken);
        if (refreshToken)
          localStorage.setItem("adminRefreshToken", refreshToken);

        // 2. Persist Profile for Navbar/Sidebar Display
        if (result.admin) {
          const profileData = {
            // Mapping to ensure we catch 'admin' or 'userName' from your database
            username: result.admin.userName || result.admin.admin || "Admin",
            email: result.admin.emailAddress || email,
            avatar: result.admin.images?.[0] || null,
            role: result.admin.role || "admin",
          };
          localStorage.setItem("adminProfile", JSON.stringify(profileData));
        }

        // 3. Navigate to the protected dashboard
        navigate("/dashboard");
      } else {
        setError(result?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>
      )}

      <div className="min-h-screen flex flex-col md:flex-row relative bg-[#f1f5f9]">
        {/* Mobile Background */}
        <img
          src={gradient}
          alt="mobile-bg"
          className="absolute inset-0 w-full h-full object-cover md:hidden"
        />

        {/* Desktop Left Side */}
        <div className="hidden md:flex md:w-3/5 items-center justify-center relative">
          <img
            src={gradient}
            alt="left-bg"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-10 flex flex-col items-center px-8 py-16">
            <img src={Logo} alt="logo" className="w-auto h-44 mb-2" />
            <h1 className="text-6xl font-black tracking-tighter text-[#1e293b] text-center uppercase">
              AXIS TECH
              <br />
              <span className="text-4xl opacity-80 tracking-[0.3em]">
                SUPPLIES
              </span>
            </h1>
          </div>
        </div>

        {/* Right Side / Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 relative z-10">
          <div className="w-full max-w-md bg-white/40 md:bg-transparent p-8 md:p-0 rounded-3xl backdrop-blur-md md:backdrop-blur-none shadow-xl md:shadow-none">
            <div className="md:hidden flex flex-col items-center mb-5">
              <img
                src={Logo}
                alt="logo"
                className="w-auto h-24 mb-1 relative z-10"
              />
              <h1 className="text-3xl font-black text-center text-[#1e293b] leading-tight relative z-10 uppercase">
                AXIS TECH
              </h1>
            </div>

            <h2 className="hidden md:block text-4xl font-bold text-[#1e293b] text-center mb-8 uppercase tracking-tight">
              Welcome
            </h2>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-5 relative z-10"
              noValidate
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold uppercase animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@axistech.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3.5 font-semibold placeholder-gray-300 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-100 px-4 py-3.5 font-semibold placeholder-gray-300 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-4 bottom-6 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPass ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl bg-[#4f46e5] text-white py-4 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-4 uppercase text-sm tracking-widest ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#3c3acb] hover:shadow-indigo-200"
                }`}
              >
                {isLoading ? "Verifying..." : "Sign In to System"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-[#4f46e5] font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  Forgot Security Credentials?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 px-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center z-50 border border-gray-100 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-[#1e293b] uppercase tracking-tight">
              Reset Password
            </h3>
            <p className="mt-2 mb-6 text-sm text-slate-500 font-medium">
              Enter your registered email to receive a recovery link.
            </p>

            <input
              type="email"
              placeholder="Email address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-[#4f46e5] font-semibold"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Recovery link sent!");
                  setShowModal(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[#4f46e5] text-white font-bold text-xs uppercase tracking-widest shadow-md"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
