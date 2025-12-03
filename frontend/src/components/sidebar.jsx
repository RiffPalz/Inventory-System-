// components/Sidebar.jsx
import { useState } from "react";
import Logo from "../assets/images/logo.png";
import {
  Home,
  Box,
  List,
  ShoppingCart,
  Users,
  ChevronLeft,
  ChartNoAxesCombined,
  SquareChartGantt,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: Home },
  { label: "Products", icon: Box },
  { label: "Sales", icon: List },
  { label: "Reports", icon: ChartNoAxesCombined }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`transition-all duration-300 ease-in-out rounded-2xl overflow-hidden m-4 shadow-lg  ${
          collapsed ? "w-20" : "w-64"
        }`}
        style={{
          background: "linear-gradient(180deg,#7c4dff,#7a5cff,#6b4bff)",
        }}
      >
        <div className="h-full flex flex-col text-white">

          {/* TOP: Logo + Title */}
          <div className="flex items-center justify-center flex-col px-4 py-6">
            {collapsed ? (
              <div className="h-12 w-12 flex items-center justify-center overflow-hidden">
                <img src={Logo} alt="Axis Tech Supplies" className="h-8 w-8 object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                  <img src={Logo} alt="Axis Tech Supplies" className="h-12 w-12 object-contain" />
                </div>
                <div className="text-center px-2">
                  <div className="text-xl font-Lovelo leading-tight">AXIS TECH SUPPLIES</div>
                </div>
              </div>
            )}
          </div>

          {/* NAV */}
          <nav className="flex-1 overflow-hidden mt-2">
            <ul className="h-full overflow-auto py-2 flex flex-col items-start">
              {menuItems.map((it) => {
                const Icon = it.icon;
                return (
                  <li
                    key={it.label}
                    className={`w-full px-3 py-2 my-1 rounded-lg transition-colors ${
                      collapsed
                        ? "flex justify-center"
                        : "flex items-center gap-4 justify-start pl-6 hover:bg-white/10"
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-label={it.label}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
                    }}
                  >
                    {/* Icon container */}
                    <div
                      className={`flex items-center justify-center h-12 w-12 rounded-lg transition-all ${
                        collapsed ? "mx-auto" : "bg-white/8 group-hover:bg-white/14"
                      }`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>

                    {/* Label shown only when expanded */}
                    {!collapsed && (
                      <span className="text-sm font-medium text-white select-none">
                        {it.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* FOOTER: collapse button */}
          <div className="px-4 py-4 flex justify-center">
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
