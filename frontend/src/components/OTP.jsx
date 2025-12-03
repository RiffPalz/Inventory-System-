import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OtpImage from "../assets/images/verify-email-pic.png";
import { verifyLoginCode, fetchAdminProfile } from "../api/adminApi.js";

export default function OTP() {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWrongModal, setShowWrongModal] = useState(false);

  const loginToken = typeof window !== "undefined" ? localStorage.getItem("adminLoginToken") : null;

  // Helper: expiry key and duration
  const EXPIRY_KEY = "otpExpiry"; // stores timestamp (ms)
  const OTP_SECONDS = 60;

  // Initialize timer from stored expiry (so refresh doesn't reset)
  useEffect(() => {
    if (!loginToken) {
      navigate("/"); // no login session → back to login
      return;
    }

    // Focus first input
    inputRefs.current?.[0]?.focus();

    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (expiry) {
      const remaining = Math.ceil((Number(expiry) - Date.now()) / 1000);
      if (remaining > 0) {
        setTimer(remaining);
        setCanResend(false);
        return;
      } else {
        // expired
        setTimer(0);
        setCanResend(true);
        localStorage.removeItem(EXPIRY_KEY);
        return;
      }
    }

    // If no expiry stored, set a new one (this happens when OTP page first opened)
    const newExpiry = Date.now() + OTP_SECONDS * 1000;
    localStorage.setItem(EXPIRY_KEY, String(newExpiry));
    setTimer(OTP_SECONDS);
    setCanResend(false);
  }, [loginToken, navigate]);

  // Countdown effect (reads timer value and updates every second)
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => {
      const expiry = Number(localStorage.getItem(EXPIRY_KEY));
      const remaining = Math.ceil((expiry - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimer(0);
        setCanResend(true);
        localStorage.removeItem(EXPIRY_KEY);
        clearInterval(id);
      } else {
        setTimer(remaining);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const submitCode = async () => {
  setError("");
  const code = otp.join("").trim();
  if (code.length !== 6) {
    setError("Please enter the full 6-digit code.");
    return;
  }
  if (!loginToken) {
    setError("No login session found. Please login again.");
    return;
  }

  setIsLoading(true);
  try {
    const payload = { loginToken, code };
    const res = await verifyLoginCode(payload);
    const data = res?.data ? res.data : res;

    if (data?.success) {
      const finalJwt = data.token ?? data.data?.token;
      if (!finalJwt) {
        setError("Server did not return final token. Please try again.");
        setIsLoading(false);
        return;
      }

      // 1) store token
      localStorage.setItem("token", finalJwt);

      // 2) try to fetch full admin profile and store it
      try {
        const profileRes = await fetchAdminProfile(); // expects { success, data } or similar
        const profileData = profileRes?.data ? profileRes.data : profileRes;
        // If your fetchAdminProfile returns { success:true, data: {...} } handle accordingly:
        const userObj = profileData?.data ? profileData.data : profileData;
        if (userObj && (userObj.role || userObj.emailAddress || userObj.ID)) {
          // normalize: ensure role exists
          const normalizedUser = {
            id: userObj.id ?? userObj.ID ?? userObj._id ?? null,
            email: userObj.email ?? userObj.emailAddress ?? null,
            role: userObj.role ?? "admin",
            userName: userObj.userName ?? null,
          };
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        } else {
          // fallback minimal user if profile shape unexpected
          localStorage.setItem("user", JSON.stringify({ role: "admin" }));
        }
      } catch (profileErr) {
        console.error("Failed to fetch profile after OTP:", profileErr);
        // fallback to minimal user so PrivateRoute allows access
        localStorage.setItem("user", JSON.stringify({ role: "admin" }));
      }

      // 3) cleanup temporary items and navigate
      localStorage.removeItem("adminLoginToken");
      localStorage.removeItem(EXPIRY_KEY);
      navigate("/dashboard");
    } else {
      // Wrong OTP: show modal (not just alert)
      setShowWrongModal(true);
    }
  } catch (err) {
    console.error("OTP verify error:", err);
    const msg = err?.response?.data?.message || err?.message || "Server error. Try again.";
    setError(msg);
  } finally {
    setIsLoading(false);
  }
};


  const resendCode = async () => {
    if (!canResend) return;
    // If you have a backend endpoint to actually resend the code, call it here.
    // For now, we reset the expiry timer so resend becomes disabled again.
    const newExpiry = Date.now() + OTP_SECONDS * 1000;
    localStorage.setItem(EXPIRY_KEY, String(newExpiry));
    setTimer(OTP_SECONDS);
    setCanResend(false);
    setError("");
    // Optionally call backend resend endpoint here
    // await api.post('/admin/resend', { loginToken });
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] px-4 py-10">
        <div className="max-w-md w-full text-center">
          <img src={OtpImage} alt="Check Email" className="w-32 h-32 mx-auto mb-4" />

          <h1 className="text-3xl font-Roboto font-semibold text-[#1e293b]">Check your email!</h1>

          <p className="text-gray-600 mt-1 mb-6 mx-auto max-w-2xl text-center">
            We have sent your 6-digit verification code to your email address.
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-400 rounded-lg text-center text-2xl font-medium focus:border-[#4f46e5] focus:outline-none bg-white"
              />
            ))}
          </div>

          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

          <button
            onClick={submitCode}
            disabled={isLoading}
            className={`w-full bg-[#4f46e5] text-white text-lg py-3 rounded-lg font-medium hover:bg-[#3c3acb] transition ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Verifying..." : "Submit"}
          </button>

          <div className="mt-4 text-gray-700 text-sm">
            Didn’t receive the code?
            {canResend ? (
              <button onClick={resendCode} className="ml-2 text-[#4f46e5] font-semibold hover:underline">
                Resend Code
              </button>
            ) : (
              <span className="ml-2 text-gray-500">Resend in {timer}s</span>
            )}
          </div>
        </div>
      </div>

      {/* Wrong OTP Modal */}
      {showWrongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWrongModal(false)} />
          <div className="bg-white rounded-lg p-6 shadow-lg z-60 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Wrong OTP</h3>
            <p className="text-sm text-gray-700 mb-4">Wrong OTP, try again.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowWrongModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
