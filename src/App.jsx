import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import LandingScreen from "./components/LandingScreen";
import Dashboard from "./components/Dashboard";
import VerifyEmailScreen from "./components/VerifyEmailScreen";
import { authApi } from "./services/api";

function App() {

  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("authToken")));
  const [isEmailVerified, setIsEmailVerified] = useState(
    () => localStorage.getItem("emailVerified") === "true"
  );
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
    localStorage.setItem("hasRegistered", "true");
    setIsLoggedIn(true);
    setIsEmailVerified(Boolean(user.email_verified_at));
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
        setIsLoggedIn(false);
        setIsEmailVerified(false);
        setNeedsInitialLogin(true);
      });
  }, [saveSession]);

  const handleVerified = useCallback((user) => {
    localStorage.setItem("firstName", user.first_name || "");
    localStorage.setItem("lastName", user.last_name || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("emailVerified", user.email_verified_at ? "true" : "false");
    setIsEmailVerified(Boolean(user.email_verified_at));
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
      setIsLoggedIn(false);
      setIsEmailVerified(false);
      setNeedsInitialLogin(true);
    }
  };

  const navigate = useNavigate();

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
            <Navigate to={isEmailVerified ? "/" : "/verify-email"} replace />
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
            <Navigate to={isEmailVerified ? "/" : "/verify-email"} replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to={isEmailVerified ? "/" : "/verify-email"} replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} />
          )
        }
      />

      <Route
        path="/verify-email"
        element={
          isLoggedIn && isEmailVerified ? (
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
          isLoggedIn && !isEmailVerified ? (
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
          isLoggedIn && isEmailVerified ? (
            <Dashboard onLogout={handleLogout} onUserUpdated={handleVerified} />
          ) : isLoggedIn ? (
            <Navigate to="/verify-email" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Backward Compatibility for /parent */}
      <Route path="/parent" element={<Navigate to="/" replace />} />

      {/* Fallback Route - matched na hole landing-e pathabe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
