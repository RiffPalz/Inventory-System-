import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import adminApi from "../api/adminApi.js";

export default function MyProfile() {
  const fileInputRef = useRef(null);

  // FORM STATES
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // ORIGINAL SNAPSHOT (FOR CANCEL)
  const [originalProfile, setOriginalProfile] = useState(null);

  // UI STATES
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // FETCH PROFILE
  useEffect(() => {
    const hydrateFromStorage = () => {
      const stored = JSON.parse(localStorage.getItem("adminProfile") || "{}");

      if (stored.username || stored.phone || stored.avatar) {
        setUserName(stored.username || "");
        setPhone(stored.phone || "");
        setEmail(stored.email || "");
        setImagePreview(stored.avatar || "");

        setOriginalProfile({
          userName: stored.username || "",
          phone: stored.phone || "",
          email: stored.email || "",
          image: stored.avatar || "",
        });
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await adminApi.fetchAdminProfile();
        if (!res || !res.admin) return;

        const admin = res.admin;
        const username = admin.userName ?? admin.username ?? admin.admin ?? "";
        const phoneNumber = admin.phoneNumber ?? admin.phone ?? "";
        const emailAddr = admin.emailAddress ?? admin.email ?? "";

        let avatar = "";
        if (admin.images) {
          try {
            const imgs =
              typeof admin.images === "string"
                ? JSON.parse(admin.images)
                : admin.images;
            if (Array.isArray(imgs) && imgs.length) avatar = imgs[0];
          } catch (e) {}
        }

        if (username) setUserName(username);
        if (phoneNumber) setPhone(phoneNumber);
        if (emailAddr) setEmail(emailAddr);
        if (avatar) setImagePreview(avatar);

        setOriginalProfile({
          userName: username || userName,
          phone: phoneNumber || phone,
          email: emailAddr || email,
          image: avatar || imagePreview,
        });
      } catch (err) {
        console.warn("API failed, using localStorage only");
      }
    };

    hydrateFromStorage();
    fetchProfile();
  }, []);

  // SAVE PROFILE
  const handleSave = async () => {
    setShowConfirm(false);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("userName", userName.trim());
      formData.append("phoneNumber", phone.trim());
      if (password) formData.append("password", password);
      if (selectedFile) formData.append("image", selectedFile);

      // 1. Send Update to Server
      const res = await adminApi.updateAdminProfile(formData);

      // 2. Extract the relative path (/uploads/...) from the backend response
      let finalPath = imagePreview;
      if (res?.admin?.images) {
        const imgs =
          typeof res.admin.images === "string"
            ? JSON.parse(res.admin.images)
            : res.admin.images;
        if (Array.isArray(imgs) && imgs.length) finalPath = imgs[0];
      }

      // 3. Update localStorage with the server path, NOT the blob URL
      const existing = JSON.parse(localStorage.getItem("adminProfile") || "{}");
      localStorage.setItem(
        "adminProfile",
        JSON.stringify({
          ...existing,
          username: userName,
          phone: phone,
          avatar: finalPath,
        })
      );

      // 4. Force state sync across Navbar
      window.dispatchEvent(new Event("storage"));

      setMessage({ type: "success", text: "Profile updated!" });
      setIsEditing(false);
      setSelectedFile(null);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-black uppercase text-slate-800">
              Save Changes?
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              This will update your account details.
            </p>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-slate-500 font-bold uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 transition text-white rounded-xl font-black uppercase text-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
            Account Settings
          </h1>
          <nav className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            <Link to="/dashboard" className="text-indigo-600">
              Dashboard
            </Link>{" "}
            / My Profile
          </nav>
        </div>

        {message && (
          <div
            className={`px-5 py-3 rounded-xl text-xs font-bold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* PROFILE IMAGE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <div
            className={`relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center bg-slate-50 ${
              isEditing ? "ring-2 ring-indigo-500 cursor-pointer" : ""
            }`}
            onClick={() => isEditing && fileInputRef.current.click()}
          >
            {imagePreview ? (
              <img
                src={
                  imagePreview.startsWith("blob:")
                    ? imagePreview
                    : `${(import.meta.env.VITE_BACKEND_URL || "").replace(
                        /\/$/,
                        ""
                      )}${
                        imagePreview.startsWith("/") ? "" : "/"
                      }${imagePreview}`
                }
                onError={(e) => {
                  e.target.src = "/src/assets/logo.png";
                }}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-300 font-black text-sm uppercase">
                No Image
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-[10px] uppercase">
                Change Photo
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs font-bold text-slate-600 uppercase">
              Profile Photo
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
              JPG or PNG • Max 5MB
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-3xl shadow-sm space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Username
                </label>
                <input
                  disabled={!isEditing}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full mt-2 px-5 py-3 rounded-xl font-semibold transition ${
                    isEditing
                      ? "bg-white ring-2 ring-indigo-500/30 focus:ring-indigo-500 outline-none"
                      : "bg-slate-100 text-slate-600"
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  disabled={!isEditing}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 11) setPhone(val);
                  }}
                  className={`w-full mt-2 px-5 py-3 rounded-xl font-semibold transition ${
                    isEditing
                      ? "bg-white ring-2 ring-indigo-500/30 focus:ring-indigo-500 outline-none"
                      : "bg-slate-100 text-slate-600"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Active Email
              </label>
              <div className="mt-2 px-5 py-3 bg-slate-100 rounded-xl font-semibold text-slate-600">
                {email}
              </div>
            </div>
            {isEditing && (
              <div className="animate-in slide-in-from-top-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full mt-2 px-5 py-3 rounded-xl font-semibold bg-white ring-2 ring-indigo-500/30 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-12 py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-indigo-200"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (originalProfile) {
                      setUserName(originalProfile.userName);
                      setPhone(originalProfile.phone);
                      setImagePreview(originalProfile.image);
                      setSelectedFile(null);
                      setPassword("");
                    }
                    setIsEditing(false);
                  }}
                  className="px-8 py-3 text-slate-500 hover:text-slate-700 font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={saving}
                  className="px-12 py-3 bg-amber-500 hover:bg-amber-600 transition text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-amber-200"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
