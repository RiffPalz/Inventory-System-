// src/pages/Login.jsx
import { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginAdmin as loginAdminApi } from "../api/adminApi.js";

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

      // Use adminApi login helper (axios). It should return { success, loginToken, message, ... }
      const result = await loginAdminApi(payload);

      if (result?.success) {
        const loginToken = result.loginToken ?? result.data?.loginToken;
        if (!loginToken) {
          setError("Login succeeded but no login token was returned by the server.");
          return;
        }
        localStorage.setItem("adminLoginToken", loginToken);
        navigate("/authentication");
      } else {
        setError(result?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Cannot connect to server. Check your connection.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showModal && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"></div>}

      <div className="min-h-screen flex flex-col md:flex-row relative bg-[#f1f5f9]">
        <img src={gradient} alt="mobile-bg" className="absolute inset-0 w-full h-full object-cover md:hidden" />

        <div className="hidden md:flex md:w-3/5 items-center justify-center relative">
          <img src={gradient} alt="left-bg" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-10 flex flex-col items-center px-8 py-16">
            <img src={Logo} alt="logo" className="w-auto h-44 mb-2" />
            <h1 className="text-6xl font-Lovelo text-[#1e293b] text-center">
              AXIS TECH
              <br />
              SUPPLIES
            </h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 relative z-10">
          <div className="w-full max-w-md">
            <div className="md:hidden flex flex-col items-center mb-5">
              <img src={Logo} alt="logo" className="w-auto h-24 mb-1 relative z-10" />
              <h1 className="text-4xl font-Lovelo text-center text-[#1e293b] leading-tight relative z-10">
                Welcome to
                <br />
                AXIS TECH SUPPLIES
              </h1>
            </div>

            <h2 className="hidden md:block text-4xl font-Roboto text-[#1e293b] text-center mb-6 mt-20">WELCOME!</h2>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-400 px-4 py-3 font-NunitoSans placeholder-gray-400 focus:outline-none focus:border-[#4f46e5]"
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-400 px-4 py-3 font-NunitoSans placeholder-gray-400 focus:outline-none focus:border-[#4f46e5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-lg text-[16px] sm:text-xl bg-[#4f46e5] text-white py-3 font-Roboto font-semibold transition ${
                  isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#3c3acb]"
                }`}
              >
                {isLoading ? "LOGGING IN..." : "LOG IN"}
              </button>

              <div className="text-center mt-1">
                <button type="button" onClick={() => setShowModal(true)} className="text-[#2563eb] font-NunitoSans text-md hover:underline">
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-40 px-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md font-NunitoSans text-center z-50">
            <h3 className="text-xl font-semibold font-Roboto text-[#1e293b]">Reset Password</h3>

            <p className="mb-3 text-md text-gray-600">Enter your email to reset your password:</p>

            <input type="email" placeholder="Email address" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-[#4f46e5]" />

            <div className="flex justify-end space-x-3 mt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100">Cancel</button>

              <button onClick={() => { alert("Password reset link sent!"); setShowModal(false); }} className="px-4 py-2 rounded-md bg-[#4f46e5] text-white hover:bg-[#3c3acb]">Send Reset Link</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
