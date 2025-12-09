// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import OTP from "../components/OTP.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Products from "../pages/Products.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";


function LoginRedirect() {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (err) {
    user = {};
  }

  const finalJwt = localStorage.getItem("token");
  const tempLoginToken = localStorage.getItem("adminLoginToken");

  const isAuthenticated = !!finalJwt && user.role === "admin";
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  if (tempLoginToken) return <Navigate to="/authentication" replace />;

  return <Login />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<Navigate to="/login" replace />} />

       
        <Route path="/login" element={<LoginRedirect />} />

      
        <Route path="/authentication" element={<OTP />} />

    
        <Route element={<PrivateRoute allowedRole="admin" />}> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/myprofile" element={<MyProfile/>} />
        </Route>

        {/* Fallback -> always go to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
