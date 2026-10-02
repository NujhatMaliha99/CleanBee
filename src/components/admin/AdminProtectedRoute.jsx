import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AdminAuthLoader from "./AdminAuthLoader";

/**
 * Route guard component for CleanBee Admin routes (/admin).
 * Redirects unauthenticated users to /admin/login.
 * Redirects authenticated non-admin users to /dashboard.
 */
export default function AdminProtectedRoute({
  isLoggedIn,
  userRole,
  isCheckingAuth = false,
  children,
}) {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const storedRole = localStorage.getItem("userRole") || userRole;

  if (isCheckingAuth) {
    return <AdminAuthLoader message="Verifying administrator session..." />;
  }

  // Unauthenticated visitors trying to access /admin -> redirect to /admin/login
  if (!isLoggedIn && !token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated non-admin users trying to access /admin -> redirect to regular dashboard
  if (storedRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
