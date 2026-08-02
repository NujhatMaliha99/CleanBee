import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import LandingScreen from "./components/LandingScreen";
import Dashboard from "./components/Dashboard";
import { authApi } from "./services/api";

function App() {

  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("authToken")));
  const [needsInitialLogin, setNeedsInitialLogin] = useState(() => !localStorage.getItem("authToken"));

  const saveSession = useCallback(({ token, user }) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("firstName", user.first_name || "");
    localStorage.setItem("lastName", user.last_name || "");
    localStorage.setItem("email", user.email || "");
    setIsLoggedIn(true);
    setNeedsInitialLogin(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    authApi.currentUser()
      .then(({ user }) => saveSession({ token, user }))
      .catch(() => {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setNeedsInitialLogin(true);
      });
  }, [saveSession]);

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
      setIsLoggedIn(false);
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
            <Navigate to="/" replace />
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
            <Navigate to="/" replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterScreen onRegister={handleRegister} />
          )
        }
      />

      {/* Home Route  */}
      <Route
        path="/"
        element={
          !isLoggedIn && needsInitialLogin ? (
            <Navigate to="/login" replace />
          ) : (
            <LandingScreen isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          )
        }
      />

      {/* Dashboard Route — reached from the "Go to dashboard" button on the landing page */}
      <Route
        path="/dashboard"
        element={
          isLoggedIn ? (
            <Dashboard onLogout={handleLogout} />
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
