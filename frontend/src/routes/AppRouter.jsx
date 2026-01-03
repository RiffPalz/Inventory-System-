import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Products from "../pages/Products.jsx";
import Stocks from "../pages/Stocks.jsx";
import Sales from "../pages/Sales.jsx";
import Reports from "../pages/Reports.jsx";
import MonthlySales from "../pages/MonthlySales.jsx";
import MonthlySold from "../pages/MonthlySold.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";
import MainLayout from "../components/MainLayout.jsx"; 

function LoginRedirect() {
  let profile = null;
  try {
    profile = JSON.parse(localStorage.getItem("adminProfile") || "null");
  } catch (err) {
    profile = null;
  }
  const accessToken = localStorage.getItem("adminAccessToken");
  const isAuthenticated = !!accessToken && (profile?.role === "admin" || profile?.role === "superadmin");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginRedirect />} />

        {/* 1. First, check if user is logged in */}
        <Route element={<PrivateRoute allowedRole="admin" />}>
          {/* 2. Then, wrap all these pages in the MainLayout (Sidebar + Header) */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/monthly-sales" element={<MonthlySales />} />
            <Route path="/reports/monthly-sold" element={<MonthlySold />} />
            <Route path="/myprofile" element={<MyProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}