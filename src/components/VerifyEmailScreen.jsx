import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../services/api";
import "./LoginScreen.css";

export default function VerifyEmailScreen({ email, hasToken, onVerified, onLogout }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const verificationSucceeded = new URLSearchParams(window.location.search).get("verified") === "1";

  useEffect(() => {
    if (!verificationSucceeded || !hasToken) return;

    authApi.currentUser()
      .then(({ user }) => onVerified(user))
      .catch((requestError) => setError(requestError.message));
  }, [hasToken, onVerified, verificationSucceeded]);

  const resend = async () => {
    setError("");
    setMessage("");
    setIsSending(true);

    try {
      const response = await authApi.resendVerification();
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  if (verificationSucceeded && !hasToken) {
    return (
      <div className="cb-login">
        <div className="cb-login-card">
          <h1 className="cb-login-title">Email verified</h1>
          <p className="cb-login-sub">Your email is verified. You can now log in.</p>
          <Link className="cb-submit" to="/login">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cb-login">
      <div className="cb-login-card">
        <h1 className="cb-login-title">Verify your email</h1>
        <p className="cb-login-sub">
          We sent a verification link to <strong>{email}</strong>. Open the link to activate your account.
        </p>
        {message && <p className="cb-form-success">{message}</p>}
        {error && <p className="cb-form-error" role="alert">{error}</p>}
        <button className="cb-submit" type="button" onClick={resend} disabled={isSending}>
          {isSending ? "Sending..." : "Resend verification email"}
        </button>
        <button className="cb-guest-btn" type="button" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
