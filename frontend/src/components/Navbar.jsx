// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';

const ProfileMenuItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-sm transition-colors"
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown click-away logic
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('#profile-button')) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleProfilePage = () => { console.log("Profile..."); setProfileOpen(false); };
  const handleSignout = () => { console.log("Signout..."); setProfileOpen(false); };

  return (
    <nav className="flex items-center justify-between py-4 px-2 border-b border-gray-200">
      
      {/* --- Left Side: Search Bar (Replacing the h1 "Welcome") --- */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
        />
      </div>

      {/* --- Right Side: Notification and Profile --- */}
      <div className="flex items-center gap-2">
        
        {/* Notification Icon */}
        <button
          onClick={() => console.log("Notifications")}
          className="p-2 mr-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Bell className="w-6 h-6" />
        </button>

        {/* Profile Section */}
        <div className="relative border-l pl-4 border-gray-200" ref={dropdownRef}>
          <button
            id="profile-button"
            onClick={() => setProfileOpen((s) => !s)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
          >
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100">
              <span className="text-sm font-bold text-slate-700">JQ</span>
            </div>

            {/* Labels */}
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-sm font-bold text-slate-800">John Quinn</span>
              <span className="text-xs text-slate-500">Admin Profile</span>
            </div>
          </button>

          {/* DROPDOWN MENU */}
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
              <div className="p-4 border-b bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-slate-700">
                    JQ
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">John Quinn</div>
                    <div className="text-xs text-slate-500">Admin Profile</div>
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
    </nav>
  );
}