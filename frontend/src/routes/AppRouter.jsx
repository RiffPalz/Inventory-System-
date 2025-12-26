// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Products from "../pages/Products.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import Sales from "../pages/Sales.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";

function LoginRedirect() {
  // read profile saved by Login.jsx
  let profile = null;
  try {
    profile = JSON.parse(localStorage.getItem("adminProfile") || "null");
  } catch (err) {
    profile = null;
  }

  // token stored by Login.jsx
  const accessToken = localStorage.getItem("adminAccessToken");

  const isAuthenticated = !!accessToken && (profile?.role === "admin" || profile?.role === "superadmin");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // not authenticated -> show login
  return <Login />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginRedirect />} />

        <Route element={<PrivateRoute allowedRole="admin" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/myprofile" element={<MyProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
