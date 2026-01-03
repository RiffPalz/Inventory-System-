import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="print:hidden">
        <Sidebar />
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
