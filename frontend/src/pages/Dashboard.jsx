import Sidebar from "../components/sidebar.jsx";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  Package,
  AlertTriangle,
  DollarSign,
  BarChart2,
} from "lucide-react";

// ======= CARD DATA =========
const topCards = [
  {
    label: "TOTAL STOCK ITEMS",
    value: "1",
    icon: <Package className="w-6 h-6 text-sky-500" />,
    bgColor: "bg-sky-50",
  },
  {
    label: "LOW STOCK ALERTS",
    value: "0",
    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
    bgColor: "bg-red-50",
  },
  {
    label: "TOTAL SALES (30 DAYS)",
    value: "$0.00",
    icon: <DollarSign className="w-6 h-6 text-green-500" />,
    bgColor: "bg-green-50",
  },
  {
    label: "UNITS SOLD (30 DAYS)",
    value: "0",
    icon: <BarChart2 className="w-6 h-6 text-purple-500" />,
    bgColor: "bg-purple-50",
  },
];

// Small reusable item component (no Navigate wrapper — it was wrong)
const ProfileMenuItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-sm"
    type="button"
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click or Esc
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest("#profile-button")
      ) {
        setProfileOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Navigate to the MyProfile page
  const handleProfilePage = () => {
    setProfileOpen(false);
    navigate("/myprofile");
  };

  // Clear auth and go to login
  const handleSignout = () => {
    // Clear tokens/user stored in localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminLoginToken");
    // You might also clear other app-specific keys

    setProfileOpen(false);
    navigate("/login");
  };

  const handleNotificationClick = () => {
    console.log("Notification icon clicked!");
    // TODO: implement notification panel
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b pb-6">
          <h1 className="text-3xl font-Roboto font-bold text-[#4f46e5]">
            Welcome, Admin!
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition duration-150"
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                id="profile-button"
                onClick={() => setProfileOpen((s) => !s)}
                className="flex items-center gap-3 focus:outline-none p-1 rounded-full hover:bg-slate-200 transition duration-150"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <div className="w-10 h-10 rounded-full ring-2 ring-gray-300 flex items-center justify-center bg-white overflow-hidden">
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-md font-semibold text-slate-700">
                    JQ
                  </div>
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800">
                    Axis Tech Supplies
                  </span>
                  <span className="text-xs text-slate-500">Admin Profile</span>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-slate-700">
                        JQ
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          Axis Tech Supplies
                        </div>
                        <div className="text-xs text-slate-500">
                          Admin Profile
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <ProfileMenuItem
                      icon={<User className="w-5 h-5 text-slate-600" />}
                      text="Profile Page"
                      onClick={handleProfilePage}
                    />

                    <ProfileMenuItem
                      icon={<LogOut className="w-5 h-5 text-red-500" />}
                      text="Signout"
                      onClick={handleSignout}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topCards.map((card) => (
            <div
              key={card.label}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {card.label}
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800">
                    {card.value}
                  </div>
                </div>

                <div className={`p-3 rounded-full ${card.bgColor}`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* MORE CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" /> Low Stock Items
            </h3>
            <p className="text-sm text-slate-600">
              No immediate low stock alerts. Inventory is healthy!
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>{" "}
              Recent Sales
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm text-slate-600">
                <span>Product A</span>
                <span className="font-medium text-slate-800">
                  1200 units ($14774400.00)
                </span>
              </li>
              <li className="flex justify-between items-center text-sm text-slate-600">
                <span>Product B</span>
                <span className="font-medium text-slate-800">
                  25 units ($3078000.00)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
