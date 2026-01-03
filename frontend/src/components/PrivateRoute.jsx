import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute({ allowedRole = "admin" }) {
  const location = useLocation();

  // Try preferred keys first (adminProfile / adminAccessToken).
  // Keep fallbacks for backward compatibility (user / token).
  let profile = null;
  try {
    const raw = localStorage.getItem("adminProfile") ?? localStorage.getItem("user");
    profile = raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("PrivateRoute: failed to parse stored profile:", err);
    profile = null;
  }

  const token = localStorage.getItem("adminAccessToken") || localStorage.getItem("token") || null;

  const isAuthenticated = !!token && !!profile?.role;
  const isAllowed = !allowedRole ? true : profile?.role === allowedRole;

  if (!isAuthenticated) {
    // Not logged in → redirect to login. Keep the location so login can redirect back.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowed) {
    // Authenticated but role not allowed → redirect to login or show 403 later.
    return <Navigate to="/login" replace />;
  }

  // Authenticated and allowed → render nested routes
  return <Outlet />;
}
