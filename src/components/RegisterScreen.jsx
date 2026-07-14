import { useState } from "react";
import "./LoginScreen.css";
import "./RegisterScreen.css";

const UserIcon = () => (
  <svg className="cb-input-icon" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg className="cb-input-icon" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 10h16M8 4v4M16 4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg className="cb-input-icon" viewBox="0 0 24 24" fill="none">
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
  <svg className="cb-input-icon" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none">
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

export default function RegisterScreen({ onRegister }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister &&
      onRegister({ firstName, lastName, dob, email, password, confirmPassword, acceptTerms });
  };

  return (
    <div className="cb-login">
      <div className="cb-login-blob b1" />
      <div className="cb-login-blob b2" />
      <div className="cb-login-blob b3" />

      <form className="cb-login-card cb-register-card" onSubmit={handleSubmit}>
        <header className="cb-login-header">
          <p className="cb-login-eyebrow">Create Account</p>
          <h1 className="cb-login-title">
            Clean<span className="accent">Bee</span>
          </h1>
          <p className="cb-login-sub">Let&apos;s build a cleaner, greener tomorrow together.</p>
        </header>

        <div className="cb-field-row">
          <div className="cb-field">
            <label htmlFor="cb-first-name">First Name</label>
            <div className="cb-input-wrap">
              <UserIcon />
              <input
                id="cb-first-name"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
          </div>

          <div className="cb-field">
            <label htmlFor="cb-last-name">Last Name</label>
            <div className="cb-input-wrap">
              <UserIcon />
              <input
                id="cb-last-name"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>
        </div>

        <div className="cb-field">
          <label htmlFor="cb-dob">Date of Birth</label>
          <div className="cb-input-wrap">
            <CalendarIcon />
            <input
              id="cb-dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              autoComplete="bday"
              required
            />
          </div>
        </div>

        <div className="cb-field">
          <label htmlFor="cb-reg-email">Email</label>
          <div className="cb-input-wrap">
            <MailIcon />
            <input
              id="cb-reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="cb-field">
          <label htmlFor="cb-reg-password">Password</label>
          <div className="cb-input-wrap">
            <LockIcon />
            <input
              id="cb-reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="cb-toggle-visibility"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <div className="cb-field">
          <label htmlFor="cb-confirm-password">Confirm Password</label>
          <div className="cb-input-wrap">
            <LockIcon />
            <input
              id="cb-confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="cb-toggle-visibility"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </div>

        <div className="cb-row">
          <label className="cb-terms">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span>
              I accept all <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button type="submit" className="cb-submit" disabled={!acceptTerms}>
          Register
        </button>

        <p className="cb-login-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
