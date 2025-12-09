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

  // Retrieve the temporary token used for the OTP session
  const loginToken = typeof window !== "undefined" ? localStorage.getItem("adminLoginToken") : null;

  // Helper: expiry key and duration
  const EXPIRY_KEY = "otpExpiry"; // stores timestamp (ms)
  const OTP_SECONDS = 60;

  // --- Timer Initialization ---
  useEffect(() => {
    // If no temporary login session token exists, redirect back to login
    if (!loginToken) {
      // Use the correct public path /login
      navigate("/login"); 
      return;
    }

    // Focus first input on mount
    inputRefs.current?.[0]?.focus();

    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (expiry) {
      // Calculate remaining time from stored timestamp
      const remaining = Math.ceil((Number(expiry) - Date.now()) / 1000);
      if (remaining > 0) {
        setTimer(remaining);
        setCanResend(false);
        return;
      } else {
        // Expired on load
        setTimer(0);
        setCanResend(true);
        localStorage.removeItem(EXPIRY_KEY);
      }
    } else {
      // If no expiry stored, set a new one (first time opening OTP page)
      const newExpiry = Date.now() + OTP_SECONDS * 1000;
      localStorage.setItem(EXPIRY_KEY, String(newExpiry));
      setTimer(OTP_SECONDS);
      setCanResend(false);
    }
  }, [loginToken, navigate]);

  // --- Countdown Effect ---
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setInterval(() => {
      // Re-read expiry time every second for accuracy
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

  // --- Input Handlers ---
  const handleChange = (value, index) => {
    // Allow only single digit numbers
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    // Backspace handling
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Arrow key navigation
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // --- Submission Logic ---
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

        // 1) Store the final JWT token
        localStorage.setItem("token", finalJwt);
        let userObjectToStore = { role: "admin" }; // Start with minimal required data

        // 2) Try to fetch full admin profile and enhance the user object
        try {
          const profileRes = await fetchAdminProfile(); 
          const profileData = profileRes?.data ? profileRes.data : profileRes;

          const userObj = profileData?.data || profileData;
          
          if (userObj && (userObj.role || userObj.email || userObj.ID)) {
            userObjectToStore = {
              id: userObj.id ?? userObj.ID ?? userObj._id ?? null,
              email: userObj.email ?? userObj.emailAddress ?? null,
              role: userObj.role ?? "admin", // Ensure role is always present
              userName: userObj.userName ?? null,
            };
          }
        } catch (profileErr) {
          console.error("Failed to fetch profile after OTP:", profileErr);
          // If profile fetch fails, we proceed with the minimal user object { role: "admin" }
        }

        // 3) Save the final user object (minimal or full) and clean up
        localStorage.setItem("user", JSON.stringify(userObjectToStore));
        localStorage.removeItem("adminLoginToken");
        localStorage.removeItem(EXPIRY_KEY);
        navigate("/"); // Navigate to the root protected path
      } else {
        // Wrong OTP or Code Expired
        // If the server explicitly returns a message about expiration, use it.
        const isExpired = data?.codeExpired; 
          
        if (isExpired) {
           setError(data.message || "Verification code expired. Please log in again.");
        } else {
           // General failure (e.g., wrong code)
           setShowWrongModal(true); 
        }
        
        // Clear OTP input
        setOtp(["", "", "", "", "", ""]); 
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      // Use the normalized error message from adminApi.js
      const msg = err.message || "Server error. Try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };


  const resendCode = async () => {
    if (!canResend) return;
    
    // NOTE: You must implement a backend endpoint to re-send the OTP email!
    // For now, we only reset the client-side timer.
    
    // Reset the expiry timer
    const newExpiry = Date.now() + OTP_SECONDS * 1000;
    localStorage.setItem(EXPIRY_KEY, String(newExpiry));
    setTimer(OTP_SECONDS);
    setCanResend(false);
    setError("");
    
    // TODO: Call your backend resend endpoint here, e.g.:
    // await api.post('/admin/login/resend', { loginToken });
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
            disabled={isLoading || otp.join("").length !== 6}
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