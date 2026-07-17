import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import LandingScreen from "./components/LandingScreen";
import Dashboard from "./components/Dashboard";

function App() {

  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [needsInitialLogin, setNeedsInitialLogin] = useState(true);

  const handleLogin = (data) => {
    if (data && data.email) {
      localStorage.setItem("email", data.email);
      if (!localStorage.getItem("firstName")) {
        const namePart = data.email.split("@")[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        localStorage.setItem("firstName", formattedName);
      }
    }
    setIsLoggedIn(true);
    setNeedsInitialLogin(false);
  };

  const handleRegister = (data) => {
    if (data) {
      if (data.firstName) localStorage.setItem("firstName", data.firstName);
      if (data.lastName) localStorage.setItem("lastName", data.lastName);
      if (data.email) localStorage.setItem("email", data.email);
    }
    setIsLoggedIn(true);
    setNeedsInitialLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
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
            <LoginScreen onLogin={handleLogin} onGuestLogin={handleGuestLogin} />
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
