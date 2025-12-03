import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute({ allowedRole = "admin" }) {
  // Safe parse in case localStorage contains invalid JSON
  let user = {};
  try {
    if (typeof window !== "undefined") {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    }
  } catch (err) {
    console.error("Failed to parse stored user:", err);
    user = {};
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isAuthenticated = !!token && !!user?.role;
  const isAllowed = !allowedRole ? true : user?.role === allowedRole;

  // If not logged in → go to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Authenticated but not allowed role → redirect to login (or you can redirect to a "403" page)
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  // Authenticated and allowed → render nested routes
  return <Outlet />;
}
