import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function PrivateRoute({ allowedRole = "admin" }) {
  const location = useLocation();

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

  // If not logged in → must go to the public login page: /login
  if (!isAuthenticated) {
    // Pass the current location via 'state' so the user can be redirected 
    // back here after successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not allowed role → redirect to login (or you can redirect to a "403" page)
  if (!isAllowed) {
    // You could also redirect to a 403 Forbidden page here.
    return <Navigate to="/login" replace />;
  }

  // Authenticated and allowed → render nested routes
  return <Outlet />;
}