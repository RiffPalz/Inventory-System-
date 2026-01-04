import React, { useEffect, useRef, useState } from "react";
import { Bell, User, LogOut, ChevronDown, X } from "lucide-react";
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
  const [showAllModal, setShowAllModal] = useState(false);

  const [admin, setAdmin] = useState({
    username: "Admin",
    avatar: "",
    initials: "AD",
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  // Logic: Color-coding based on notification content and type
  const styleByType = (n) => {
    const title = n.title?.toLowerCase() || "";
    const message = n.message?.toLowerCase() || "";
    const type = n.type?.toLowerCase() || "";

    // Red: Out of Stock
    if (title.includes("out of stock") || message.includes("out of stock")) {
      return "bg-red-50/60 hover:bg-red-100/60 border-red-100";
    }
    // Amber/Yellow: Low Stock
    if (
      title.includes("low stock") ||
      message.includes("low stock") ||
      type === "stock"
    ) {
      return "bg-amber-50/60 hover:bg-amber-100/60 border-amber-100";
    }
    // Emerald/Green: Sales or In-Stock
    if (
      type === "sale" ||
      title.includes("sale") ||
      title.includes("recorded")
    ) {
      return "bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-100";
    }
    // Default: Indigo
    return "bg-indigo-50/30 hover:bg-indigo-100/30 border-indigo-50";
  };

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

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.clear();
    navigate("/");
  };

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
      setAdmin({ username, avatar: stored.avatar || "", initials });
    };
    loadProfile();
    window.addEventListener("storage", loadProfile);
    return () => window.removeEventListener("storage", loadProfile);
  }, []);

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
    try {
      if (!n) return;
      if (token && !n.isRead) {
        await markAsRead(n.ID, token);
        setUnreadCount((c) => Math.max(c - 1, 0));
        setNotifications((prev) =>
          prev.map((x) => (x.ID === n.ID ? { ...x, isRead: true } : x))
        );
      }
      if (n.referenceId) {
        if (n.type === "sale") navigate(`/sales/${n.referenceId}`);
        else if (n.type === "stock") navigate(`/products/${n.referenceId}`);
      }
      setNotifOpen(false);
      setShowAllModal(false);
    } catch (error) {
      console.error("Notification handling failed:", error);
      setNotifOpen(false);
    }
  };

  return (
    <>
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
                        try {
                          if (token) await markAllAsRead(token);
                          setUnreadCount(0);
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, isRead: true }))
                          );
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.ID || Math.random()}
                        onClick={() => handleNotificationClick(n)}
                        className={`px-4 py-4 cursor-pointer border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors ${
                          !n.isRead ? styleByType(n) : "bg-white"
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
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowAllModal(true);
                    setNotifOpen(false);
                  }}
                  className="w-full py-3 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 hover:bg-indigo-50 transition-all border-t border-slate-100"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>

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
                    className="absolute inset-0 w-full h-full object-cover"
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

      {showAllModal && (
       <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  All Notifications
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  History
                </p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
              {notifications.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">
                    Empty Inbox
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.ID || Math.random()}
                    onClick={() => handleNotificationClick(n)}
                    className={`mb-3 p-5 cursor-pointer transition-all border ${
                      !n.isRead
                        ? `${styleByType(n)} shadow-sm`
                        : "bg-white border-transparent hover:border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          !n.isRead
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {n.type || "System"}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {dayjs(n.createdAt).format("DD MMM YYYY, hh:mm A")}
                      </p>
                    </div>
                    <h4
                      className={`text-sm font-black mb-1 ${
                        !n.isRead ? "text-slate-900" : "text-slate-600"
                      }`}
                    >
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
