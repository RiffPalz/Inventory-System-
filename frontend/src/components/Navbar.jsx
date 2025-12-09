// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';

// --- Profile Dropdown Menu Items ---
const ProfileMenuItem = ({ icon, text, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-sm"
    >
        {icon}
        <span>{text}</span>
    </button>
);

export default function Navbar() {
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Dropdown Management ---
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('#profile-button')) {
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


    const handleProfilePage = () => {
        console.log("Navigating to Profile Page...");
        setProfileOpen(false);
        
    };

    const handleSignout = () => {
        console.log("Signing out...");
        setProfileOpen(false);
        
    };

    const handleNotificationClick = () => {
        console.log("Notification icon clicked!");
    };

    return (
        // The Navbar container. This should replace the 'TOP BAR' div in Dashboard.jsx
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
            
            {/* --- Search Bar (Replaces "Welcome, Admin!") --- */}
            <div className="relative w-full max-w-md sm:max-w-lg mr-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
            </div>
            
            {/* --- Icons and Profile Section --- */}
            <div className="flex items-center gap-4">
                
                {/* Notification Icon */}
                <button
                    onClick={handleNotificationClick}
                    className="p-2 rounded-full hover:bg-gray-200 text-slate-600 transition duration-150"
                    aria-label="Notifications"
                >
                    <Bell className="w-6 h-6" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        id="profile-button"
                        onClick={() => setProfileOpen((s) => !s)}
                        className="flex items-center gap-3 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition duration-150"
                    >
                        {/* Profile Picture Placeholder */}
                        <div className="w-10 h-10 rounded-full ring-2 ring-gray-300 flex items-center justify-center bg-white overflow-hidden">
                            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-md font-semibold text-slate-700">
                                JQ
                            </div>
                        </div>

                        {/* Name and Role */}
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-sm font-semibold text-slate-800">John Quinn</span>
                            <span className="text-xs text-slate-500">Admin Profile</span>
                        </div>
                    </button>

                    {/* DROPDOWN MENU */}
                    {profileOpen && (
                        <div 
                            className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50"
                        >
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-slate-700">
                                        JQ
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">John Quinn</div>
                                        <div className="text-xs text-slate-500">Admin Profile</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2">
                                {/* Profile Page Link */}
                                <ProfileMenuItem
                                    icon={<User className="w-5 h-5 text-slate-600" />}
                                    text="Profile Page"
                                    onClick={handleProfilePage}
                                />
                                
                                {/* Signout Button */}
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
    );
}