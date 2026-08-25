"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F3F6FB" }}>

      {/* Top utility bar */}
      <div style={{ background: "#0F2447", color: "#93c5fd", fontSize: 11, padding: "4px 24px", display: "flex", justifyContent: "space-between" }}>
        <span>Government of Tamil Nadu — Official Civic Portal</span>
        <span>Helpline: 1800-XXX-XXXX &nbsp;|&nbsp; தமிழ் &nbsp;|&nbsp; English</span>
      </div>

      {/* Header */}
      <header style={{ background: "#1B3A6B", color: "white", padding: "16px 32px", display: "flex", alignItems: "center", gap: 20, borderBottom: "4px solid #F97316" }}>
        {/* Emblem placeholder */}
        <div style={{ width: 60, height: 60, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#fbbf24" }}>shield</span>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>CivicShield AI</div>
          <div style={{ fontSize: 12, color: "#93c5fd", marginTop: 2 }}>
            Integrated Civic Complaint Management System — Tamil Nadu Urban Local Bodies
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/dashboard" style={{ color: "#bfdbfe", fontSize: 13, textDecoration: "none" }}>Government Login</Link>
          <span style={{ color: "#475569" }}>|</span>
          <Link href="/track" style={{ color: "#bfdbfe", fontSize: 13, textDecoration: "none" }}>Track Complaint</Link>
        </div>
      </header>

      {/* Hero section */}
      <div style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #0F2447 60%, #1e3a5f 100%)", padding: "60px 32px", textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,152,0,0.15)", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 20, padding: "4px 16px", fontSize: 12, color: "#ff9a00", marginBottom: 24 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
            AI-Verified · Real-time · Geospatial Routing
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
            Report Civic Issues.<br />
            <span style={{ color: "#fb923c" }}>AI Routes Them Instantly.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#93c5fd", marginBottom: 36, lineHeight: 1.7 }}>
            Snap a photo of a pothole, garbage overflow, water leak, or fallen tree.
            Our AI identifies the issue, scores the severity, and alerts the nearest
            municipal station in <strong style={{ color: "white" }}>Chennai, Madurai, or Karur</strong>.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/report">
              <button style={{ background: "#F97316", color: "white", border: "none", padding: "14px 36px", borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_a_photo</span>
                File a Complaint
              </button>
            </Link>
            <Link href="/track">
              <button style={{ background: "transparent", color: "white", border: "2px solid rgba(255,255,255,0.4)", padding: "14px 36px", borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
                Track Complaint
              </button>
            </Link>
            <Link href="/dashboard">
              <button style={{ background: "transparent", color: "#93c5fd", border: "2px solid rgba(147,197,253,0.3)", padding: "14px 36px", borderRadius: 4, fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>dashboard</span>
                Officer Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", padding: "40px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { icon: "psychology", title: "YOLOv8 + Gemini AI", desc: "Hybrid vision + NLP pipeline detects and categorises issues from photos.", color: "#1B3A6B" },
            { icon: "location_on", title: "Geospatial Routing", desc: "Haversine algorithm routes complaints to the nearest of 11 TN stations.", color: "#166534" },
            { icon: "notifications_active", title: "Instant Alerts", desc: "Automated WhatsApp and Email dispatched to duty officer within seconds.", color: "#F97316" },
            { icon: "bar_chart", title: "Live Dashboard", desc: "Real-time incident feed with district & department filters for officers.", color: "#7C3AED" },
          ].map((f) => (
            <div key={f.title} className="gov-card" style={{ padding: 24 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: f.color, display: "block", marginBottom: 12 }}>{f.icon}</span>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Districts supported */}
      <div style={{ padding: "32px", background: "white", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Supported Districts</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { name: "Chennai", stations: 4, color: "#1D4ED8", bg: "#DBEAFE" },
              { name: "Madurai", stations: 4, color: "#6D28D9", bg: "#EDE9FE" },
              { name: "Karur",   stations: 3, color: "#92400E", bg: "#FEF3C7" },
            ].map((d) => (
              <div key={d.name} style={{ background: d.bg, border: `1px solid`, borderColor: d.bg, borderRadius: 6, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: d.color, fontSize: 20 }}>location_city</span>
                <div>
                  <div style={{ fontWeight: 700, color: d.color, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{d.stations} municipal stations</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#0F2447", color: "#64748B", padding: "20px 32px", fontSize: 12, marginTop: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>© 2026 Government of Tamil Nadu — CivicShield AI · Built for DeepSprint Hackathon</span>
          <span style={{ color: "#334155" }}>NIC-TN · Data protected under IT Act 2000</span>
        </div>
      </footer>
    </div>
  );
}
