import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import {
  Home,
  Box,
  Database,
  List,
  ChevronLeft,
  ChartNoAxesCombined,
} from "lucide-react";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { key: "products", label: "Products", icon: Box, path: "/products" },
  { key: "stocks", label: "Stocks", icon: Database, path: "/stocks" },
  { key: "sales", label: "Sales", icon: List, path: "/sales" },
  {
    key: "reports",
    label: "Reports",
    icon: ChartNoAxesCombined,
    path: "/reports",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");

  useEffect(() => {
    // This logic ensures that /reports/monthly-sales still highlights the "Reports" tab
    const found = menuItems.find(
      (m) =>
        location.pathname === m.path ||
        (m.path !== "/dashboard" && location.pathname.startsWith(m.path))
    );
    setActiveItem(found ? found.key : "dashboard");
  }, [location.pathname]);

  return (
    <aside
      className={`transition-all duration-500 ease-in-out rounded-2xl overflow-hidden m-4 shadow-2xl sticky top-4 self-start
      ${collapsed ? "w-20" : "w-64"}`}
      style={{
        backgroundColor: "#6b4bff",
        backgroundImage:
          "linear-gradient(180deg, #7c4dff 0%, #6b4bff 60%, #4a28c3 100%)",
        minHeight: "calc(100vh - 2rem)",
      }}
    >
      <div className="h-full flex flex-col text-white">
        {/* Logo Section */}
        <div
          className={`flex items-center justify-center flex-col px-4 transition-all duration-300 ${
            collapsed ? "py-6" : "py-8"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <img
              src={Logo}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "h-10 w-10" : "h-14 w-14"
              }`}
            />
            {!collapsed && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="text-lg font-bold tracking-widest leading-tight">
                  AXIS TECH
                </div>
                <div className="text-[10px] opacity-80 tracking-[0.3em] font-light">
                  SUPPLIES
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="px-3 flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeItem;

              return (
                <li key={item.key} className="relative">
                  <Link
                    to={item.path}
                    className={`flex items-center w-full px-3 py-3.5 rounded-xl transition-all duration-200 group
                      ${collapsed ? "justify-center" : "gap-4 pl-5"}
                      ${
                        isActive
                          ? "bg-white text-[#6b4bff] shadow-lg"
                          : "hover:bg-white/10 text-white/80 hover:text-white"
                      }
                    `}
                  >
                    <Icon
                      size={20}
                      className={`transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? "text-[#6b4bff]" : ""
                      }`}
                    />
                    {!collapsed && (
                      <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                    {collapsed && isActive && (
                      <div className="absolute right-2 w-1 h-1 bg-white rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="px-4 py-6 flex justify-center">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-500 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
