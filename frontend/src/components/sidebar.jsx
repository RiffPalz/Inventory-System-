// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import {
  Home,
  Box,
  List,
  ChevronLeft,
  ChartNoAxesCombined,
} from "lucide-react";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
  { key: "products", label: "Products", icon: Box, path: "/products" },
  { key: "sales", label: "Sales", icon: List, path: "/sales" },
  { key: "reports", label: "Reports", icon: ChartNoAxesCombined, path: "/reports" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");

  // derive active item from pathname so refresh/direct URLs work
  useEffect(() => {
    const path = location.pathname || "/";
    // choose key based on path start
    const found = menuItems.find((m) => path.startsWith(m.path));
    setActiveItem(found ? found.key : "dashboard");
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`transition-all duration-300 ease-in-out rounded-2xl overflow-hidden m-4 shadow-xl sticky top-4 self-start ${collapsed ? "w-20" : "w-64"}`}
        style={{
          backgroundColor: "#6b4bff",
          backgroundImage: "linear-gradient(180deg, #7c4dff 0%, #6b4bff 60%, #4a28c3 100%)",
          minHeight: "calc(100vh - 2rem)",
        }}
      >
        <div className="h-full flex flex-col text-white">
          <div className={`flex items-center justify-center flex-col px-4 ${collapsed ? "py-4" : "py-6"}`}>
            {collapsed ? (
              <div className="h-12 w-12 flex items-center justify-center overflow-hidden">
                <img src={Logo} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                  <img src={Logo} alt="Logo" className="h-12 w-12 object-contain" />
                </div>
                <div className="text-center px-2">
                  <div className="text-xl font-Lovelo leading-tight font-bold">AXIS TECH SUPPLIES</div>
                </div>
              </div>
            )}
          </div>

          <nav className="overflow-hidden mt-2">
            <ul className="py-2 flex flex-col items-start px-3">
              {menuItems.map((it) => {
                const Icon = it.icon;
                const isActive = it.key === activeItem;

                return (
                  <li key={it.key} className="w-full my-1 rounded-xl transition-all p-0">
                    <Link
                      to={it.path}
                      onClick={() => setActiveItem(it.key)}
                      className={`
                        flex w-full px-3 py-2 rounded-xl transition-colors
                        ${collapsed ? "justify-center" : "items-center gap-4 justify-start pl-6"}
                        ${isActive ? "bg-white/20 text-white shadow-lg" : "hover:bg-white/10 text-white"}
                      `}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all ${
                          collapsed ? "" : (isActive ? "bg-white/10" : "bg-white/8")
                        }`}
                      >
                        <Icon size={20} className="text-white" />
                      </div>

                      {!collapsed && (
                        <span className="text-sm font-medium text-white select-none whitespace-nowrap">
                          {it.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-4 py-10 flex justify-center border-t border-white/10 mt-auto">
            <button
              onClick={() => setCollapsed((s) => !s)}
              className="h-12 w-12 rounded-full bg-white/12 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <ChevronLeft className={`transition-transform text-white ${collapsed ? "rotate-180" : ""}`} size={20} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
