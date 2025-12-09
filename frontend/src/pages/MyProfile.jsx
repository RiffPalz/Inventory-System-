import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/sidebar.jsx";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"; // adjust if using env

export default function MyProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // will be readOnly, populated from server
  const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch profile from backend
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        if (!res.ok) {
          console.error("Failed to load profile:", json);
          setMessage({ type: "error", text: json.message || "Failed to load profile" });
          return;
        }

        const admin = json.data.admin;
        // map backend fields to frontend
        setUsername(admin.userName ?? "");
        setPhone(admin.phoneNumber ?? "");
        setEmail(admin.emailAddress ?? "");
        // If admin has images saved as stringified array, you can set preview:
        if (admin.images) {
          try {
            const imgs = typeof admin.images === "string" ? JSON.parse(admin.images) : admin.images;
            if (Array.isArray(imgs) && imgs.length) setImagePreview(imgs[0]);
          } catch (e) {
            // ignore parse error
          }
        }
      } catch (err) {
        console.error("fetchProfile error:", err);
        setMessage({ type: "error", text: "Failed to fetch profile" });
      }
    };

    if (token) fetchProfile();
    else {
      // not authenticated — redirect to login
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const onSelectImage = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onSelectImage(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onSelectImage(f);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPhone(raw.slice(0, 11));
  };

  const handleCancel = () => navigate("/dashboard");

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Please fill required fields." });
      return;
    }
    if (phone.length !== 11) {
      setMessage({ type: "error", text: "Phone must be exactly 11 digits." });
      return;
    }

    setSaving(true);
    try {
      const body = {
        username: username.trim(),
        phoneNumber: phone.trim(),
      };
      // only send password if user typed one (optional change)
      if (password && password.length > 0) body.password = password;

      const res = await fetch(`${API_BASE}/api/admin/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: json.message || "Failed to update profile." });
        setSaving(false);
        return;
      }

      // Update localStorage user (so other parts of frontend reflect the change)
      const frontendUser = {
        username: json.data.admin.userName ?? username,
        phone: json.data.admin.phoneNumber ?? phone,
        email: json.data.admin.emailAddress ?? email,
        avatar: imagePreview || null,
        role: json.data.admin.role ?? "admin",
      };
      localStorage.setItem("user", JSON.stringify(frontendUser));

      setMessage({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      console.error("update profile error:", err);
      setMessage({ type: "error", text: "Server error updating profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">My Profile</h1>
            <nav className="text-sm text-slate-500 mt-1">
              <Link to="/dashboard" className="text-indigo-600 hover:underline">Dashboard</Link>
              <span className="mx-1">/</span>
              <span>My Profile</span>
            </nav>
          </div>

          {message && (
            <div className={`px-4 py-2 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Add Profile Image</label>

            <div onDrop={handleDrop} onDragOver={handleDragOver}
                 className="border-2 border-dashed border-slate-200 rounded-lg bg-white p-6 cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile Preview" className="w-56 h-56 object-cover rounded-md mx-auto" />
              ) : (
                <div className="flex flex-col items-center text-slate-500 py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
                  <p>Drag & Drop Image or</p>
                  <p className="text-indigo-600 font-medium cursor-pointer">Select</p>
                </div>
              )}

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="lg:col-span-2 mt-6 lg:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input value={phone} onChange={handlePhoneChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md" placeholder="09556978423" inputMode="numeric" maxLength={11} />
                <p className="text-xs text-slate-500 mt-1">Phone must be exactly 11 digits.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (not editable)</label>
                <input value={email} readOnly className="w-full px-4 py-3 bg-gray-100 border border-slate-300 rounded-md text-slate-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password (leave blank to keep current)</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button onClick={handleCancel} className="px-6 py-2 rounded-md text-white shadow-md" style={{ backgroundColor: "#052f44" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-md text-white shadow-md" style={{ backgroundColor: "#f59e0b" }}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
