"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

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

type Section = "dashboard" | "map" | "reports";
type District = "All" | "Chennai" | "Madurai" | "Karur";

const DISTRICTS: District[] = ["All", "Chennai", "Madurai", "Karur"];
const DEPT_BY_DISTRICT: Record<District, string[]> = {
  All:     ["All Departments", "Public Works", "Sanitation", "Transportation", "Parks & Recreation", "Electricity Dept."],
  Chennai: ["All Departments", "Public Works", "Transportation", "Parks & Recreation", "Sanitation"],
  Madurai: ["All Departments", "Public Works", "Sanitation", "Parks & Recreation"],
  Karur:   ["All Departments", "Public Works", "Sanitation", "Electricity Dept."],
};

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
  const router = useRouter();
  const [loading, setLoading]               = useState(true);
  const [reports, setReports]               = useState<any[]>([]);
  const [activeSection, setActiveSection]   = useState<Section>("dashboard");
  const [activeDistrict, setActiveDistrict] = useState<District>("All");
  const [activeDept, setActiveDept]         = useState("All Departments");

  const dashboardRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<HTMLDivElement>(null);
  const reportsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("gov_auth");
      if (!isAuth) {
        router.push("/login");
        return;
      }
    }
    fetchReports();
    const ticker = setInterval(fetchReports, 30_000);
    return () => clearInterval(ticker);
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/complaints/dashboard");
      const data = await res.json();
      if (data.status === "success") {
        setReports(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch reports", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ticket_id: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/complaints/${ticket_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchReports();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { setActiveDept("All Departments"); }, [activeDistrict]);

  const scrollTo = (section: Section) => {
    setActiveSection(section);
    const map: Record<Section, React.RefObject<HTMLDivElement | null>> = {
      dashboard: dashboardRef, map: mapRef, reports: reportsRef
    };
    map[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navItems = [
    { id: "dashboard" as Section, label: "Dashboard",   icon: "dashboard"   },
    { id: "map"       as Section, label: "Map View",    icon: "map"         },
    { id: "reports"   as Section, label: "Reports",     icon: "description" },
  ];

  function districtOf(station: string = "") {
    if (station.toLowerCase().includes("chennai")) return "Chennai";
    if (station.toLowerCase().includes("madurai")) return "Madurai";
    return "Karur";
  }

  const filteredFeed = reports.filter(r => {
    const dist = districtOf(r.nearest_station);
    if (activeDistrict !== "All" && dist !== activeDistrict) return false;
    if (activeDept !== "All Departments" && r.department !== activeDept) return false;
    return true;
  });

  const latestReport = reports[0];

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
          <button 
            onClick={() => { localStorage.removeItem("gov_auth"); router.push("/login"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: "#94A3B8", border: "1px solid #475569", padding: "8px 0", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Sign Out
          </button>
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
          </div>
        </div>

        <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 36 }}>
          {/* ── Dashboard ── */}
          <section ref={dashboardRef} id="dashboard">
            <div className="gov-section-title">Real-time Incident Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { label: "Total Incidents", value: reports.length, sub: "Total reported",      subC: "#166534", icon: "data_usage",    border: "#2563EB" },
                { label: "Pending Triage",        value: reports.filter(r => r.status === "Pending").length,   sub: "Action required",      subC: "#92400E", icon: "hourglass_empty",border: "#D97706" },
                { label: "Resolved",     value: reports.filter(r => r.status === "Resolved").length,    sub: "Closed issues",subC: "#166534", icon: "check_circle",        border: "#22c55e" },
                { label: "AI-Verified",   value: "100%",   sub: "Processed by YOLOv8", subC: "#6D28D9", icon: "verified",       border: "#7C3AED" },
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
                {[["#3B82F6","Chennai"],["#8B5CF6","Madurai"],["#0D9488","Karur"],["#EF4444","Latest Report"]].map(([c,l]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, background: c, borderRadius: "50%", display: "inline-block" }}></span>{l}
                  </span>
                ))}
              </div>
            </div>
            <div className="gov-card" style={{ overflow: "hidden", height: 460 }}>
              <CivicMap
                reportLat={latestReport?.lat ?? null}
                reportLng={latestReport?.lng ?? null}
                nearestStation={latestReport?.nearest_station ?? null}
              />
            </div>
          </section>

          {/* ── Reports ── */}
          <section ref={reportsRef} id="reports">
            <div className="gov-section-title">Incoming Complaints Feed</div>
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

            <div className="gov-card" style={{ overflow: "auto" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Ticket ID / Image</th>
                    <th>Issue</th>
                    <th>Department</th>
                    <th>District</th>
                    <th>Priority</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeed.map((item, i) => {
                    const dist = districtOf(item.nearest_station);
                    const dtag = DISTRICT_TAG[dist] || DISTRICT_TAG.Karur;
                    const b = BADGE[(item.priority || "medium").toLowerCase()] || BADGE.medium;
                    
                    return (
                      <tr key={item.id || i}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#1D4ED8", fontWeight: 700 }}>{item.ticket_id}</span>
                            {item.image_filename && (
                              <img 
                                src={`http://localhost:8000/uploads/${item.image_filename}`} 
                                alt="Reported issue" 
                                style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4, border: "1px solid #E2E8F0" }} 
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#1E293B", marginBottom: 4 }}>{item.issue_type}</div>
                          <span style={{ fontSize: 10, color: "#7C3AED", background: "#EDE9FE", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>
                            {item.yolo_confidence}% YOLO Confidence
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "#475569" }}>{item.department}</td>
                        <td><span style={{ background: dtag.bg, color: dtag.color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{dist}</span></td>
                        <td><span style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{item.priority}</span></td>
                        <td style={{ fontSize: 11, color: "#64748B" }}>{item.submitted_at}</td>
                        <td>
                          <select 
                            value={item.status} 
                            onChange={(e) => updateStatus(item.ticket_id, e.target.value)}
                            style={{ 
                              padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #CBD5E1",
                              background: item.status === "Pending" ? "#FEE2E2" : item.status === "In Progress" ? "#FEF3C7" : "#DCFCE7",
                              color: item.status === "Pending" ? "#B91C1C" : item.status === "In Progress" ? "#92400E" : "#166534"
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredFeed.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  No reports in the database matching selected filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
