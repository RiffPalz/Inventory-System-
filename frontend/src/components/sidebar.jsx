import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import { Home, Box, List, ChevronLeft, ChartNoAxesCombined } from "lucide-react";

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

  // Update active item when URL changes
  useEffect(() => {
    const found = menuItems.find((m) => location.pathname.startsWith(m.path));
    setActiveItem(found ? found.key : "dashboard");
  }, [location.pathname]);

  return (
    <aside
      className={`transition-all duration-300 ease-in-out rounded-2xl overflow-hidden m-4 shadow-xl sticky top-4 self-start
      ${collapsed ? "w-20" : "w-64"}`}
      style={{
        backgroundColor: "#6b4bff",
        backgroundImage:
          "linear-gradient(180deg, #7c4dff 0%, #6b4bff 60%, #4a28c3 100%)",
        minHeight: "calc(100vh - 2rem)",
      }}
    >
      <div className="h-full flex flex-col text-white">

        {/* Logo */}
        <div className={`flex items-center justify-center flex-col px-4 ${collapsed ? "py-4" : "py-6"}`}>
          {!collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <img src={Logo} alt="Logo" className="h-12 w-12 object-contain" />
              <div className="text-center px-2">
                <div className="text-xl font-Lovelo font-bold tracking-wide">
                  AXIS TECH SUPPLIES
                </div>
              </div>
            </div>
          ) : (
            <img src={Logo} alt="Logo" className="h-10 w-10 object-contain" />
          )}
        </div>

        {/* MENU */}
        <nav>
          <ul className="px-3 flex flex-col">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === activeItem;

              return (
                <li key={item.key} className="w-full my-1">
                  <Link
                    to={item.path}
                    onClick={() => setActiveItem(item.key)}
                    className={`flex items-center w-full px-3 py-3 rounded-xl transition-all
                      ${collapsed ? "justify-center" : "gap-4 pl-5"}
                      ${isActive ? "bg-white/20 shadow-lg" : "hover:bg-white/10"}
                    `}
                  >
                    <Icon size={22} />

                    {!collapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* COLLAPSE BUTTON */}
        <div className="mt-auto px-4 py-6 flex justify-center border-t border-white/10">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
