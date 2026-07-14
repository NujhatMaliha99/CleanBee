import { useState } from "react";
import "./LoginScreen.css";

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

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin && onLogin({ email, password, remember });
  };

  return (
    <div className="cb-login">
      <div className="cb-login-blob b1" />
      <div className="cb-login-blob b2" />
      <div className="cb-login-blob b3" />

      <form className="cb-login-card" onSubmit={handleSubmit}>
        <header className="cb-login-header">
          <p className="cb-login-eyebrow">Welcome to</p>
          <h1 className="cb-login-title">
            Clean<span className="accent">Bee</span>
          </h1>
          <p className="cb-login-sub">Let&apos;s build a cleaner, greener tomorrow together.</p>
        </header>

        <div className="cb-field">
          <label htmlFor="cb-email">Email</label>
          <div className="cb-input-wrap">
            <MailIcon />
            <input
              id="cb-email"
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
          <label htmlFor="cb-password">Password</label>
          <div className="cb-input-wrap">
            <LockIcon />
            <input
              id="cb-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <div className="cb-row">
          <label className="cb-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <a className="cb-forgot" href="/forgot-password">
            Forgot Password?
          </a>
        </div>

        <button type="submit" className="cb-submit">
          Sign In
        </button>

        <p className="cb-login-footer">
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
}
