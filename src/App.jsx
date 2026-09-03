import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import LandingScreen from "./components/LandingScreen";
import Dashboard from "./components/Dashboard";
import VerifyEmailScreen from "./components/VerifyEmailScreen";
import PhotoVerification from "./components/PhotoVerification";
import AreaReports from "./components/AreaReports";
import Notifications from "./components/Notifications";
import PickupRequestsPage from "./components/PickupRequestsPage";
import VolunteerDashboard from "./components/VolunteerDashboard";
import { authApi } from "./services/api";

const EMAIL_VERIFICATION_REQUIRED = import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION !== "false";

function App() {

  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("authToken")));
  const [isEmailVerified, setIsEmailVerified] = useState(
    () => localStorage.getItem("emailVerified") === "true"
  );
  const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole") || "");
  const [needsInitialLogin, setNeedsInitialLogin] = useState(() => !localStorage.getItem("authToken"));
  const [hasRegistered, setHasRegistered] = useState(
    () => localStorage.getItem("hasRegistered") === "true" || Boolean(localStorage.getItem("email"))
  );

  const saveSession = useCallback(({ token, user }) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("firstName", user.first_name || "");
    localStorage.setItem("lastName", user.last_name || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("emailVerified", user.email_verified_at ? "true" : "false");
    localStorage.setItem("userRole", user.role || "user");
    localStorage.setItem("hasRegistered", "true");
    setIsLoggedIn(true);
    setIsEmailVerified(Boolean(user.email_verified_at));
    setUserRole(user.role || "user");
    setNeedsInitialLogin(false);
    setHasRegistered(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    authApi.currentUser()
      .then(({ user }) => saveSession({ token, user }))
      .catch(() => {
      localStorage.removeItem("authToken");
        localStorage.removeItem("emailVerified");
        localStorage.removeItem("userRole");
        setIsLoggedIn(false);
        setIsEmailVerified(false);
        setUserRole("");
        setNeedsInitialLogin(true);
      });
  }, [saveSession]);

  const handleVerified = useCallback((user) => {
    localStorage.setItem("firstName", user.first_name || "");
    localStorage.setItem("lastName", user.last_name || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("emailVerified", user.email_verified_at ? "true" : "false");
    localStorage.setItem("userRole", user.role || "user");
    setIsEmailVerified(Boolean(user.email_verified_at));
    setUserRole(user.role || "user");
  }, []);

  const handleLogin = async ({ email, password }) => {
    const session = await authApi.login({ email: email.trim().toLowerCase(), password });
    saveSession(session);
  };

  const handleRegister = async (data) => {
    const session = await authApi.register({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
    saveSession(session);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout locally when the server cannot revoke an expired token.
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("emailVerified");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      setIsEmailVerified(false);
      setUserRole("");
      setNeedsInitialLogin(true);
    }
  };

  const navigate = useNavigate();
  const hasVerifiedAccess = !EMAIL_VERIFICATION_REQUIRED || isEmailVerified;

  const handleGuestLogin = () => {
    // Guest mode — login ছাড়াই landing page-এ নিয়ে যাবে
    setNeedsInitialLogin(false);
    navigate("/", { replace: true });
  };

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to={hasVerifiedAccess ? "/" : "/verify-email"} replace />
          ) : (
            <LoginScreen
              onLogin={handleLogin}
              onGuestLogin={handleGuestLogin}
            />
          )
        }
      />

      {/* Register Routes */}
      <Route
        path="/register"
        element={
          isLoggedIn ? (
            <Navigate to={hasVerifiedAccess ? "/" : "/verify-email"} replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to={hasVerifiedAccess ? "/" : "/verify-email"} replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} />
          )
        }
      />

      <Route
        path="/verify-email"
        element={
          isLoggedIn && hasVerifiedAccess ? (
            <Navigate to="/" replace />
          ) : (
            <VerifyEmailScreen
              email={localStorage.getItem("email") || "your email address"}
              hasToken={isLoggedIn}
              onVerified={handleVerified}
              onLogout={handleLogout}
            />
          )
        }
      />

      {/* Home Route  */}
      <Route
        path="/"
        element={
          isLoggedIn && !hasVerifiedAccess ? (
            <Navigate to="/verify-email" replace />
          ) : !isLoggedIn && needsInitialLogin ? (
            <Navigate to="/login" replace />
          ) : (
            <LandingScreen
              hasRegistered={hasRegistered}
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
            />
          )
        }
      />

      {/* Dashboard Route — reached from the "Go to dashboard" button on the landing page */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn && hasVerifiedAccess ? (
            <Dashboard
              onLogout={handleLogout}
              onUserUpdated={handleVerified}
              userRole={userRole}
            />
          ) : isLoggedIn ? (
            <Navigate to="/verify-email" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/pickup-requests"
        element={
          isLoggedIn && hasVerifiedAccess ? (
            <PickupRequestsPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          ) : isLoggedIn ? (
            <Navigate to="/verify-email" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/volunteer/tasks"
        element={
          isLoggedIn && hasVerifiedAccess && ["volunteer", "admin"].includes(userRole) ? (
            <VolunteerDashboard isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          ) : isLoggedIn && !hasVerifiedAccess ? (
            <Navigate to="/verify-email" replace />
          ) : isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/volunteer" element={<Navigate to="/volunteer/tasks" replace />} />

      {/* Backward Compatibility for /parent */}
      <Route path="/parent" element={<Navigate to="/" replace />} />

      {/* Photo Verification — accessible to guests and logged-in users */}
      <Route
        path="/photo-verification"
        element={
          <PhotoVerification
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        }
      />

      {/* Area Reports — accessible to guests and logged-in users */}
      <Route
        path="/area-reports"
        element={
          <AreaReports
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        }
      />

      {/* Notifications / Instant Alerts — accessible to guests and logged-in users */}
      <Route
        path="/notifications"
        element={
          <Notifications
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
          />
        }
      />

      {/* Fallback Route - matched na hole landing-e pathabe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
