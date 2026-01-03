import React, { useEffect, useRef, useState } from "react";
import { Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../api/notificationApi.js";

dayjs.extend(relativeTime);

export default function Navbar() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const socketRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [admin, setAdmin] = useState({
    username: "Admin",
    avatar: "",
    initials: "AD",
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  // ===============================
  // FIX 1: IMAGE RESOLUTION HELPER
  // ===============================
  const resolveImageUrl = (src) => {
    if (!src || typeof src !== "string") return null;
    if (
      src.startsWith("blob:") ||
      src.startsWith("data:") ||
      /^https?:\/\//i.test(src)
    ) {
      return src;
    }
    const backendUrl = (
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
    ).replace(/\/$/, "");
    return `${backendUrl}${src.startsWith("/") ? src : "/" + src}`;
  };

  // ===============================
  // FIX 2: LOGOUT FUNCTION DECLARATION
  // ===============================
  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.clear();
    navigate("/");
  };

  /* PROFILE SYNC - LISTENS FOR STORAGE EVENT */
  useEffect(() => {
    const loadProfile = () => {
      const stored = JSON.parse(localStorage.getItem("adminProfile") || "{}");
      const username = stored.username || "Admin";
      const initials = username
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      setAdmin({
        username,
        avatar: stored.avatar || "",
        initials,
      });
    };

    loadProfile();
    window.addEventListener("storage", loadProfile);
    return () => window.removeEventListener("storage", loadProfile);
  }, []);

  /* LOAD NOTIFICATIONS */
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setNotifications(await fetchNotifications(token));
        setUnreadCount(await fetchUnreadCount(token));
      } catch (err) {
        console.error("Notif error:", err);
      }
    };
    load();
  }, [token]);

  /* SOCKET LOGIC */
  useEffect(() => {
    const adminProfile = JSON.parse(
      localStorage.getItem("adminProfile") || "{}"
    );
    if (!adminProfile?.id || !token) return;

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current.emit("join-admin", adminProfile.id);
    socketRef.current.on("new-notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return () => socketRef.current?.disconnect();
  }, [token]);

  /* OUTSIDE CLICK */
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleNotificationClick = async (n) => {
    await markAsRead(n.ID, token);
    setUnreadCount((c) => Math.max(c - 1, 0));
    setNotifications((prev) =>
      prev.map((x) => (x.ID === n.ID ? { ...x, isRead: true } : x))
    );
    if (n.type === "sale") navigate(`/sales/${n.referenceId}`);
    if (n.type === "stock") navigate(`/products/${n.referenceId}`);
    setNotifOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl px-8 py-4 flex items-center justify-between border-b border-slate-100/50">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          System Management
        </p>
        <h2 className="text-base font-black text-slate-800">
          Axis Tech Supplies
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* NOTIFICATIONS SECTION */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] px-1.5 rounded-full font-bold shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* THE DROPDOWN PANEL */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 flex justify-between border-b border-slate-50 items-center bg-slate-50/50">
                <span className="font-bold text-xs uppercase tracking-widest text-slate-500">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await markAllAsRead(token);
                      setUnreadCount(0);
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, isRead: true }))
                      );
                    }}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-tighter"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                      No new notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.ID}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-4 cursor-pointer border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors ${
                        !n.isRead ? styleByType(n.type) : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p
                          className={`text-xs font-bold ${
                            !n.isRead ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">
                          {dayjs(n.createdAt).fromNow()}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  navigate("/notifications");
                  setNotifOpen(false);
                }}
                className="w-full py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 hover:bg-indigo-50 transition-all border-t border-slate-100"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>

        {/* PROFILE SECTION */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/50 border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs overflow-hidden relative shadow-inner">
              {admin.initials}
              {admin.avatar && (
                <img
                  src={resolveImageUrl(admin.avatar)}
                  alt="Profile"
                  key={admin.avatar}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-black text-slate-700 leading-none mb-0.5">
                {admin.username}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                Administrator
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  navigate("/myprofile");
                  setProfileOpen(false);
                }}
                className="w-full px-4 py-2.5 text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 font-bold"
              >
                <User size={16} /> My Profile
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 font-bold"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
