// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import OTP from "../components/OTP.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";

function LoginRedirect() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthenticated = !!token && user.role === "admin";

  // If admin is logged in → go straight to dashboard
  if (isAuthenticated){
    switch (user.role) {
      case "admin":
        return <Navigate to="/dashboard" replace />;
      default:
       return <Login />;
    } 
  }

return <Login />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login OR redirect if admin already authenticated */}
        <Route path="/" element={<LoginRedirect />} />

        {/* Public OTP route (must stay public) */}
        <Route path="authentication" element={<OTP />} />

        {/* Protected admin routes */}
        <Route element={<PrivateRoute allowedRole="admin" />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
