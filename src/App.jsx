import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";

function App() {
  // sessionStorage চেক করে দেখবে এই সেশনে আগে স্প্ল্যাশ স্ক্রিন দেখানো হয়েছে কিনা
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splashShown");
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            <LoginScreen onLogin={() => setIsLoggedIn(true)} />
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
            <RegisterScreen onRegister={() => setIsLoggedIn(true)} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterScreen onRegister={() => setIsLoggedIn(true)} />
          )
        }
      />

      {/* Home Route */}
      <Route
        path="/parent"
        element={
          isLoggedIn ? (
            <div style={{ padding: 20 }}>
              <h1>CleanBee Home Page</h1>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback Route - কোনো পাথ না মিললে লগইনে পাঠাবে */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;