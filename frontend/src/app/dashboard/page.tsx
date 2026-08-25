"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// ── Relative time helper ──────────────────────────────────────────────────────
function getRelativeTime(isoString: string | undefined): string {
  if (!isoString) return "just now";
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

const CivicMap = dynamic(() => import('../components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F5F9" }}>
      <div style={{ textAlign: "center", color: "#64748B" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #CBD5E1", borderTopColor: "#1B3A6B", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }}></div>
        <span style={{ fontSize: 13 }}>Loading map...</span>
      </div>
    </div>
  ),
});

function SkeletonBlock() {
  return <div style={{ height: 28, width: 80, background: "#E2E8F0", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }}></div>;
}

type Section = "dashboard" | "map" | "reports" | "insights" | "settings";
type District = "All" | "Chennai" | "Madurai" | "Karur";

const DISTRICTS: District[] = ["All", "Chennai", "Madurai", "Karur"];

const DEPT_BY_DISTRICT: Record<District, string[]> = {
  All:     ["All Departments", "Public Works", "Sanitation", "Transportation", "Parks & Recreation", "Electricity Dept."],
  Chennai: ["All Departments", "Public Works", "Transportation", "Parks & Recreation", "Sanitation"],
  Madurai: ["All Departments", "Public Works", "Sanitation", "Parks & Recreation"],
  Karur:   ["All Departments", "Public Works", "Sanitation", "Electricity Dept."],
};

const SAMPLE_FEED = [
  { score: 98, isoTime: new Date(Date.now() - 2*60*1000).toISOString(),   title: "Major Water Main Break",    dept: "Public Works",       icon: "plumbing",     district: "Chennai", priority: "critical" },
  { score: 74, isoTime: new Date(Date.now() - 12*60*1000).toISOString(),  title: "Traffic Signal Failure",    dept: "Transportation",     icon: "traffic",      district: "Madurai", priority: "high"     },
  { score: 45, isoTime: new Date(Date.now() - 18*60*1000).toISOString(),  title: "Garbage Overflow",          dept: "Sanitation",         icon: "delete",       district: "Karur",   priority: "medium"   },
  { score: 68, isoTime: new Date(Date.now() - 25*60*1000).toISOString(),  title: "Fallen Tree Blocking Road", dept: "Parks & Recreation", icon: "park",         district: "Chennai", priority: "high"     },
  { score: 55, isoTime: new Date(Date.now() - 40*60*1000).toISOString(),  title: "Open Manhole Cover",        dept: "Public Works",       icon: "construction", district: "Madurai", priority: "high"     },
  { score: 30, isoTime: new Date(Date.now() - 60*60*1000).toISOString(),  title: "Streetlight Malfunction",   dept: "Electricity Dept.",  icon: "lightbulb",    district: "Karur",   priority: "low"      },
];

// Priority colour maps for the table
const BADGE: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "#FEE2E2", color: "#B91C1C", border: "#FECACA" },
  high:     { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  medium:   { bg: "#E0F2FE", color: "#075985", border: "#BAE6FD" },
  low:      { bg: "#DCFCE7", color: "#166534", border: "#BBF7D0" },
};
const DISTRICT_TAG: Record<string, { bg: string; color: string }> = {
  Chennai: { bg: "#DBEAFE", color: "#1D4ED8" },
  Madurai: { bg: "#EDE9FE", color: "#6D28D9" },
  Karur:   { bg: "#FEF3C7", color: "#92400E" },
};

export default function GovernmentDashboard() {
  const [loading, setLoading]               = useState(true);
  const [liveReport, setLiveReport]         = useState<any>(null);
  const [activeSection, setActiveSection]   = useState<Section>("dashboard");
  const [activeDistrict, setActiveDistrict] = useState<District>("All");
  const [activeDept, setActiveDept]         = useState("All Departments");
  const [, setTick]                         = useState(0);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<HTMLDivElement>(null);
  const reportsRef   = useRef<HTMLDivElement>(null);
  const insightsRef  = useRef<HTMLDivElement>(null);
  const settingsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer  = setTimeout(() => setLoading(false), 1500);
    const stored = localStorage.getItem("lastReport");
    if (stored) setLiveReport(JSON.parse(stored));
    const ticker = setInterval(() => setTick(t => t + 1), 30_000);
    return () => { clearTimeout(timer); clearInterval(ticker); };
  }, []);

  useEffect(() => { setActiveDept("All Departments"); }, [activeDistrict]);

  const scrollTo = (section: Section) => {
    setActiveSection(section);
    const map: Record<Section, React.RefObject<HTMLDivElement | null>> = {
      dashboard: dashboardRef, map: mapRef, reports: reportsRef,
      insights: insightsRef, settings: settingsRef,
    };
    map[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navItems = [
    { id: "dashboard" as Section, label: "Dashboard",   icon: "dashboard"   },
    { id: "map"       as Section, label: "Map View",    icon: "map"         },
    { id: "reports"   as Section, label: "Reports",     icon: "description" },
    { id: "insights"  as Section, label: "AI Insights", icon: "psychology"  },
    { id: "settings"  as Section, label: "Settings",    icon: "settings"    },
  ];

  const filteredFeed = SAMPLE_FEED
    .filter(i => activeDistrict === "All" || i.district === activeDistrict)
    .filter(i => activeDept === "All Departments" || i.dept === activeDept);

  // Detect district from nearest_station string
  function districtOf(station: string = "") {
    if (station.toLowerCase().includes("chennai")) return "Chennai";
    if (station.toLowerCase().includes("madurai")) return "Madurai";
    return "Karur";
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F6FB" }}>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside style={{ width: 240, background: "#0F2447", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 40 }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#0D9488", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "white" }}>shield</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>CivicShield AI</div>
              <div style={{ fontSize: 10, color: "#93c5fd" }}>Govt. of Tamil Nadu</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "8px 0" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => scrollTo(item.id)} className="nav-link"
              style={activeSection === item.id ? { background: "rgba(255,255,255,0.12)", color: "white", borderLeftColor: "#0D9488" } : {}}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/report" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#0D9488", color: "white", padding: "10px 0", borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            File New Complaint
          </Link>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{ background: "#1B3A6B", padding: "13px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "3px solid #0D9488", position: "sticky", top: 0, zIndex: 30 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>Live Operations Dashboard</div>
            <div style={{ fontSize: 11, color: "#93c5fd" }}>Tamil Nadu Urban Local Bodies — Incident Management</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "#86efac", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block" }}></span>
              System Online
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#93c5fd", cursor: "pointer" }}>notifications</span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#93c5fd", cursor: "pointer" }}>account_circle</span>
          </div>
        </div>

        <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 36 }}>

          {/* ── Dashboard ── */}
          <section ref={dashboardRef} id="dashboard">
            <div className="gov-section-title">Real-time Incident Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { label: "Total Incidents (24h)", value: "1,248", sub: "↓ 12% vs yesterday",      subC: "#166534", icon: "data_usage",    border: "#2563EB" },
                { label: "Pending Triage",        value: "342",   sub: "45 approaching SLA",      subC: "#92400E", icon: "hourglass_empty",border: "#D97706" },
                { label: "Critical Breaches",     value: "18",    sub: "Immediate action required",subC: "#B91C1C", icon: "warning",        border: "#DC2626" },
                { label: "AI-Verified Reports",   value: "89%",   sub: "↑ Confidence score high", subC: "#6D28D9", icon: "verified",       border: "#7C3AED" },
              ].map((c, i) => (
                <div key={i} className="gov-card" style={{ padding: 20, borderLeft: `4px solid ${c.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{c.label}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: c.border }}>{c.icon}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>
                    {loading ? <SkeletonBlock /> : c.value}
                  </div>
                  <div style={{ fontSize: 12, color: c.subC, fontWeight: 500 }}>
                    {loading ? <SkeletonBlock /> : c.sub}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Map ── */}
          <section ref={mapRef} id="map">
            <div className="gov-section-title" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              Station Map — Tamil Nadu
              <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 400, color: "#64748B" }}>
                {[["#3B82F6","Chennai"],["#8B5CF6","Madurai"],["#0D9488","Karur"],["#EF4444","Report"]].map(([c,l]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, background: c, borderRadius: "50%", display: "inline-block" }}></span>{l}
                  </span>
                ))}
              </div>
            </div>
            <div className="gov-card" style={{ overflow: "hidden", height: 460 }}>
              <CivicMap
                reportLat={liveReport?.lat ?? null}
                reportLng={liveReport?.lng ?? null}
                nearestStation={liveReport?.nearest_station ?? null}
              />
            </div>
          </section>

          {/* ── Reports ── */}
          <section ref={reportsRef} id="reports">
            <div className="gov-section-title">Incoming Complaints Feed</div>

            {/* District tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {DISTRICTS.map(d => (
                <button key={d} onClick={() => setActiveDistrict(d)} style={{
                  padding: "6px 18px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: "1px solid", transition: "all 0.15s",
                  background: activeDistrict === d ? "#1B3A6B" : "white",
                  color: activeDistrict === d ? "white" : "#64748B",
                  borderColor: activeDistrict === d ? "#1B3A6B" : "#CBD5E1",
                }}>{d}</button>
              ))}
            </div>

            {/* Department sub-filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {DEPT_BY_DISTRICT[activeDistrict].map(dept => (
                <button key={dept} onClick={() => setActiveDept(dept)} style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: "1px solid", transition: "all 0.15s",
                  background: activeDept === dept ? "#0D9488" : "#F8FAFC",
                  color: activeDept === dept ? "white" : "#64748B",
                  borderColor: activeDept === dept ? "#0D9488" : "#E2E8F0",
                }}>{dept}</button>
              ))}
            </div>

            {/* Table */}
            <div className="gov-card" style={{ overflow: "auto" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th><th>Issue</th><th>Department</th>
                    <th>District</th><th>AI Score</th><th>Priority</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Live report row */}
                  {liveReport &&
                    (activeDistrict === "All" || liveReport.nearest_station?.includes(activeDistrict)) &&
                    (activeDept === "All Departments" || liveReport.department === activeDept) && (() => {
                    const dist = districtOf(liveReport.nearest_station);
                    const dtag = DISTRICT_TAG[dist] || DISTRICT_TAG.Karur;
                    const pri  = (liveReport.priority || "medium").toLowerCase();
                    const b    = BADGE[pri] || BADGE.medium;
                    return (
                      <tr style={{ background: "#EFF6FF" }}>
                        <td style={{ fontFamily: "monospace", fontSize: 11, color: "#1D4ED8", fontWeight: 700 }}>{liveReport.ticket_id}</td>
                        <td style={{ fontWeight: 600, color: "#1E293B" }}>
                          {liveReport.issue_type}
                          {liveReport.yolo_confidence > 0 && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: "#7C3AED", background: "#EDE9FE", padding: "1px 6px", borderRadius: 10 }}>
                              {liveReport.yolo_confidence}% AI
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: "#475569" }}>{liveReport.department}</td>
                        <td><span style={{ background: dtag.bg, color: dtag.color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{dist}</span></td>
                        <td style={{ fontWeight: 700 }}>{liveReport.severity_score}/100</td>
                        <td><span style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{pri}</span></td>
                        <td style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>● {getRelativeTime(liveReport.submitted_timestamp)}</td>
                      </tr>
                    );
                  })()}

                  {/* Sample rows */}
                  {filteredFeed.map((item, i) => {
                    const dtag = DISTRICT_TAG[item.district] || DISTRICT_TAG.Karur;
                    const b = BADGE[item.priority] || BADGE.medium;
                    return (
                      <tr key={i}>
                        <td style={{ fontFamily: "monospace", fontSize: 11, color: "#94A3B8" }}>TN-{String(1000+i).padStart(4,"0")}</td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#1E293B" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#94A3B8" }}>{item.icon}</span>
                            {item.title}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "#475569" }}>{item.dept}</td>
                        <td><span style={{ background: dtag.bg, color: dtag.color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{item.district}</span></td>
                        <td style={{ fontWeight: 700 }}>{item.score}/100</td>
                        <td><span style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{item.priority}</span></td>
                        <td style={{ fontSize: 11, color: "#94A3B8" }}>{getRelativeTime(item.isoTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredFeed.length === 0 && !liveReport && (
                <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  No reports match the selected filters.
                </div>
              )}
            </div>
          </section>

          {/* ── AI Insights ── */}
          <section ref={insightsRef} id="insights">
            <div className="gov-section-title">AI Analytics &amp; Insights</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Most Reported Issue",  value: "Garbage Overflow", sub: "38% of all reports today",     icon: "delete",    color: "#92400E", bg: "#FEF3C7" },
                { label: "Highest Risk District", value: "Chennai",          sub: "67 critical incidents",         icon: "warning",   color: "#B91C1C", bg: "#FEE2E2" },
                { label: "Avg. AI Confidence",   value: "84.2%",            sub: "Across 1,248 detections",       icon: "psychology",color: "#6D28D9", bg: "#EDE9FE" },
              ].map((c, i) => (
                <div key={i} className="gov-card" style={{ padding: 20 }}>
                  <div style={{ width: 40, height: 40, background: c.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: c.color }}>{c.icon}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 12, color: c.color, fontWeight: 500 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            <div className="gov-card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, color: "#1B3A6B", marginBottom: 16, fontSize: 14 }}>District-wise Issue Breakdown (Today)</div>
              {[
                { district: "Chennai", issues: 67, pct: 54, color: "#2563EB" },
                { district: "Madurai", issues: 38, pct: 31, color: "#7C3AED" },
                { district: "Karur",   issues: 18, pct: 15, color: "#D97706" },
              ].map(row => (
                <div key={row.district} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "#334155" }}>{row.district}</span>
                    <span style={{ color: "#64748B" }}>{row.issues} complaints</span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 4, height: 10, overflow: "hidden" }}>
                    <div style={{ background: row.color, height: "100%", width: `${row.pct}%`, borderRadius: 4 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Settings ── */}
          <section ref={settingsRef} id="settings">
            <div className="gov-section-title">System Configuration</div>
            <div className="gov-card" style={{ overflow: "hidden" }}>
              {[
                { label: "Alert Notifications",  sub: "Email & WhatsApp alerts dispatched for every new report",  icon: "notifications", toggle: true  },
                { label: "Active Districts",      sub: "Chennai, Madurai, Karur",                                  icon: "location_city", toggle: false },
                { label: "AI Model Pipeline",     sub: "YOLOv8 Nano (Local) + Gemini 2.5 Flash (Cloud)",           icon: "psychology",    toggle: false },
                { label: "Station Alert Email",   sub: "pichaimuthumalleshwar@gmail.com",                          icon: "mail",          toggle: false },
                { label: "WhatsApp Officer",      sub: "+91 63826 60679",                                          icon: "chat",          toggle: false },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#1B3A6B" }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{item.sub}</div>
                    </div>
                  </div>
                  {item.toggle && (
                    <div style={{ width: 44, height: 24, background: "#1B3A6B", borderRadius: 12, position: "relative", cursor: "pointer" }}>
                      <div style={{ width: 18, height: 18, background: "white", borderRadius: "50%", position: "absolute", top: 3, right: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
