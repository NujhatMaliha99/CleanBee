import React from "react";
import "./AdminLogin.css";

export default function AdminAuthLoader({ message = "Authenticating administrator..." }) {
  return (
    <div className="admin-auth-loader-container">
      <div className="admin-auth-loader-card">
        <div className="admin-auth-spinner" />
        <div className="admin-auth-brand">
          <span className="brand-icon">🐝</span>
          <span className="brand-text">
            Clean<strong className="accent">Bee</strong> Admin
          </span>
        </div>
        <p className="admin-auth-message">{message}</p>
      </div>
    </div>
  );
}
