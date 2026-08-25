"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_STEPS = [
  { label: "Submitted",       icon: "upload_file",  done: true  },
  { label: "AI Verified",     icon: "psychology",    done: true  },
  { label: "Station Alerted", icon: "campaign",      done: true  },
  { label: "In Progress",     icon: "construction",  done: false },
  { label: "Resolved",        icon: "check_circle",  done: false },
];

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "#FEE2E2", color: "#B91C1C" },
  High:     { bg: "#FEF3C7", color: "#92400E" },
  Medium:   { bg: "#E0F2FE", color: "#075985" },
  Low:      { bg: "#DCFCE7", color: "#166534" },
};

export default function TrackReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id") || "Unknown";
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lastReport");
    if (stored) setReport(JSON.parse(stored));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F3F6FB" }}>

      {/* Top utility bar */}
      <div style={{ background: "#0F2447", color: "#93c5fd", fontSize: 11, padding: "4px 24px", display: "flex", justifyContent: "space-between" }}>
        <span>Government of Tamil Nadu — CivicShield AI</span>
        <span>Helpline: 1800-XXX-XXXX</span>
      </div>

      {/* Header */}
      <header style={{ background: "#1B3A6B", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "3px solid #0D9488" }}>
        <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 4, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#0D9488", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "white" }}>shield</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>CivicShield AI</div>
            <div style={{ fontSize: 10, color: "#93c5fd" }}>Complaint Tracking — Tamil Nadu</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Link href="/dashboard" style={{ color: "#bfdbfe", fontSize: 12, textDecoration: "none" }}>Officer Dashboard →</Link>
        </div>
      </header>

      {/* Page title bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E2E8F0", padding: "16px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1B3A6B" }}>Complaint Status Tracker</div>
        <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 20, padding: "5px 18px" }}>
          <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Ticket ID:</span>
          <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: "#1B3A6B" }}>{ticketId}</span>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Progress Tracker ── */}
        <div className="gov-card" style={{ padding: "28px 24px", marginBottom: 24 }}>
          <div style={{ borderLeft: "4px solid #1B3A6B", paddingLeft: 12, marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>Complaint Progress</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Current stage of your civic complaint</div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            {/* Progress line background */}
            <div style={{ position: "absolute", top: 16, left: 24, right: 24, height: 3, background: "#E2E8F0", borderRadius: 2 }}>
              <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, #1B3A6B, #3B82F6)", borderRadius: 2, transition: "width 1s ease" }}></div>
            </div>

            {STATUS_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 10, flex: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${step.done ? "#1B3A6B" : "#CBD5E1"}`,
                  background: step.done ? "#1B3A6B" : "white",
                  transition: "all 0.3s",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: step.done ? "white" : "#94A3B8" }}>{step.icon}</span>
                </div>
                <span style={{ fontSize: 10, textAlign: "center", maxWidth: 68, color: step.done ? "#1B3A6B" : "#94A3B8", fontWeight: step.done ? 700 : 500 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Report Details ── */}
        {report ? (
          <div className="gov-card" style={{ padding: "28px 24px", marginBottom: 24 }}>
            <div style={{ borderLeft: "4px solid #1B3A6B", paddingLeft: 12, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>Complaint Details</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>AI-verified complaint information</div>
            </div>

            {/* AI Confidence */}
            {report.yolo_confidence > 0 && (
              <div style={{ background: "#EDE9FE", border: "1px solid #DDD6FE", borderRadius: 6, padding: "10px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#6D28D9", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>psychology</span>
                  AI Vision Confidence
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#6D28D9" }}>{report.yolo_confidence}%</span>
              </div>
            )}

            {/* Priority badge */}
            <div style={{
              background: PRIORITY_STYLE[report.priority]?.bg || "#F1F5F9",
              color: PRIORITY_STYLE[report.priority]?.color || "#1E293B",
              border: `1px solid ${PRIORITY_STYLE[report.priority]?.bg || "#E2E8F0"}`,
              borderRadius: 6, padding: "8px 16px", marginBottom: 16, fontSize: 13, fontWeight: 700,
            }}>
              Priority: {report.priority}
            </div>

            {/* Details table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {[
                  ["Issue Type",              report.issue_type,       "#1E293B"],
                  ["AI Severity Score",       `${report.severity_score}/100`, "#B91C1C"],
                  ["Assigned Department",     report.department,       "#1B3A6B"],
                  ["Nearest Station Alerted", report.nearest_station,  "#166534"],
                  ["Submitted At",            report.submitted_at,     "#475569"],
                ].map(([label, value, color]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px", color: "#64748B", fontWeight: 600, width: "45%" }}>{label}</td>
                    <td style={{ padding: "10px 14px", color: color, fontWeight: 700 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Info banner */}
            <div style={{ marginTop: 16, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#1D4ED8" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
              The nearest municipal station has been alerted via Email and WhatsApp. Expected response within 24–48 hours.
            </div>
          </div>
        ) : (
          <div className="gov-card" style={{ padding: "40px 24px", textAlign: "center", marginBottom: 24 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#94A3B8", display: "block", marginBottom: 12 }}>search_off</span>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 16 }}>No report data found for this ticket.<br />Please submit a report first.</p>
            <Link href="/report" style={{ display: "inline-block", padding: "10px 24px", background: "#1B3A6B", color: "white", borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Submit a Report
            </Link>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/report" style={{ flex: 1, background: "#1B3A6B", color: "white", padding: "12px 0", borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
            File New Complaint
          </Link>
          <Link href="/dashboard" style={{ flex: 1, background: "white", color: "#1B3A6B", border: "1px solid #CBD5E1", padding: "12px 0", borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>dashboard</span>
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
