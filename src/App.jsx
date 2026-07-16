import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import Dashboard from "./components/Dashboard";

function App() {
  // sessionStorage চেক করে দেখবে এই সেশনে আগে স্প্ল্যাশ স্ক্রিন দেখানো হয়েছে কিনা
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splashShown");
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  };

  const handleRegister = (data) => {
    if (data) {
      if (data.firstName) localStorage.setItem("firstName", data.firstName);
      if (data.lastName) localStorage.setItem("lastName", data.lastName);
      if (data.email) localStorage.setItem("email", data.email);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          sessionStorage.setItem("splashShown", "true"); // একবার দেখানো হলে মার্ক করে রাখবে
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
            <LoginScreen onLogin={handleLogin} />
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

      {/* Home Route */}
      <Route
        path="/"
        element={
          isLoggedIn ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Backward Compatibility for /parent */}
      <Route
        path="/parent"
        element={<Navigate to="/" replace />}
      />

      {/* Fallback Route - কোনো পাথ না মিললে লগইনে পাঠাবে */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;