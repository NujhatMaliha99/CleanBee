import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css";

// SVG Icons for clean rendering without external icon font dependencies
const MailIcon = () => (
  <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 6h16v12H4V6Zm0 0 8 7 8-7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M9.9 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a13.6 13.6 0 0 1-3.1 4M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.4 0 2.6-.3 3.7-.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M9.5 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [authError, setAuthError] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Field Level Validation
  const getEmailError = () => {
    if (!email.trim()) return "Admin email address is required";
    if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address";
    return "";
  };

  const getPasswordError = () => {
    if (!password) return "Password is required";
    return "";
  };

  const emailError = touched.email ? getEmailError() : "";
  const passwordError = touched.password ? getPasswordError() : "";
  const isFormValid = !getEmailError() && !getPasswordError();

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (authError) setAuthError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (authError) setAuthError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setAuthError("");
    setForgotMsg("");

    const currentEmailError = getEmailError();
    const currentPasswordError = getPasswordError();

    if (currentEmailError || currentPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onLogin) {
        await onLogin({ email: email.trim(), password, remember });
      }
      // Confirm role after onLogin finishes
      const role = localStorage.getItem("userRole");
      if (role !== "admin") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        setAuthError("Access denied. This account does not have administrator privileges.");
      } else {
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || "Invalid administrator credentials. Please check your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotMsg("To reset your admin password, please contact the CleanBee system owner or superadmin.");
  };

  return (
    <div className="admin-login-wrapper">
      {/* Background ambient blobs */}
      <div className="admin-blob b1" />
      <div className="admin-blob b2" />
      <div className="admin-blob b3" />

      <form className="admin-login-card" onSubmit={handleSubmit} noValidate>
        {/* Header Branding */}
        <header className="admin-login-header">
          <div className="admin-badge-tag">
            <span className="admin-badge-icon">🔒</span>
            CleanBee Admin Portal
          </div>
          <h1 className="admin-login-title">
            Admin <span className="accent">Console</span>
          </h1>
          <p className="admin-login-subtitle">
            Login with your administrator credentials to access management tools
          </p>
        </header>

        {/* Global Error Banner */}
        {authError && (
          <div className="admin-alert-error" role="alert">
            <span className="admin-alert-icon">⚠️</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Forgot Password Info Banner */}
        {forgotMsg && (
          <div className="admin-alert-error" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(52, 211, 153, 0.4)", color: "#a7f3d0" }}>
            <span className="admin-alert-icon">ℹ️</span>
            <span>{forgotMsg}</span>
          </div>
        )}

        {/* Admin Email Input Field */}
        <div className="admin-form-group">
          <label htmlFor="admin-email">Admin Email Address</label>
          <div className={`admin-input-container ${emailError ? "has-error" : ""}`}>
            <MailIcon />
            <input
              id="admin-email"
              className="admin-input-field"
              type="email"
              placeholder="admin@cleanbee.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur("email")}
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
          </div>
          {emailError && <div className="admin-field-error">⚠️ {emailError}</div>}
        </div>

        {/* Password Input Field */}
        <div className="admin-form-group">
          <label htmlFor="admin-password">Password</label>
          <div className={`admin-input-container ${passwordError ? "has-error" : ""}`}>
            <LockIcon />
            <input
              id="admin-password"
              className="admin-input-field"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          {passwordError && <div className="admin-field-error">⚠️ {passwordError}</div>}
        </div>

        {/* Options Row: Remember Me & Forgot Password */}
        <div className="admin-form-options">
          <label className="admin-remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isSubmitting}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="admin-forgot-link"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="admin-submit-button"
          disabled={isSubmitting || (touched.email && !isFormValid)}
        >
          {isSubmitting ? (
            <>
              <div className="btn-spinner" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login to Admin Dashboard</span>
          )}
        </button>

        {/* Divider & Link to Regular User Login */}
        <div className="admin-divider">
          <span>or</span>
        </div>

        <Link to="/login" className="admin-return-user-btn">
          ← Return to User Login
        </Link>
      </form>
    </div>
  );
}
