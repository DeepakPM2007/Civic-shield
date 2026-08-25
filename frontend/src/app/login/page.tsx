"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("gov_auth", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid government credentials.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F3F6FB" }}>
      {/* Top utility bar */}
      <div style={{ background: "#0F2447", color: "#93c5fd", fontSize: 11, padding: "4px 24px", display: "flex", justifyContent: "space-between" }}>
        <span>Government of Tamil Nadu — Official Civic Portal</span>
        <span>Helpline: 1800-XXX-XXXX</span>
      </div>

      {/* Header */}
      <header style={{ background: "#1B3A6B", color: "white", padding: "16px 32px", display: "flex", alignItems: "center", gap: 20, borderBottom: "4px solid #0D9488" }}>
        <div style={{ width: 60, height: 60, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#5EEAD4" }}>shield</span>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>CivicShield AI</div>
          <div style={{ fontSize: 12, color: "#93c5fd", marginTop: 2 }}>
            Integrated Civic Complaint Management System
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Link href="/" style={{ color: "#bfdbfe", fontSize: 13, textDecoration: "none" }}>← Back to Home</Link>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <form onSubmit={handleLogin} className="gov-card" style={{ padding: 40, width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#1B3A6B" }}>admin_panel_settings</span>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1B3A6B", marginTop: 8 }}>Officer Login</h1>
            <p style={{ color: "#64748B", fontSize: 14 }}>Authorized government personnel only.</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 8 }}>Secure Passkey</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your passkey"
              className="gov-input"
              style={{ width: "100%", padding: 12 }}
            />
          </div>

          {error && <div style={{ color: "#B91C1C", fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <button type="submit" style={{ width: "100%", padding: "14px 0", background: "#0D9488", color: "white", border: "none", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "background 0.2s" }}>
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}
