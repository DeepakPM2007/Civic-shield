"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// ── Relative time helper (refreshes every 30 s via tick) ──────────────────────
function getRelativeTime(isoString: string | undefined): string {
  if (!isoString) return "just now";
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 10)  return "just now";
  if (diffSec < 60)  return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60)  return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr  < 24)  return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

const CivicMap = dynamic(() => import('../components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  ),
});

function SkeletonBlock({ w = "w-full", h = "h-5" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-white/10 rounded animate-pulse`}></div>;
}

type Section = "dashboard" | "map" | "reports" | "insights" | "settings";
type District = "All" | "Chennai" | "Madurai" | "Karur";

const DISTRICTS: District[] = ["All", "Chennai", "Madurai", "Karur"];

// Departments per district (for sub-filter)
const DEPT_BY_DISTRICT: Record<District, string[]> = {
  All:     ["All Departments", "Public Works", "Sanitation", "Transportation", "Parks & Recreation", "Electricity Dept."],
  Chennai: ["All Departments", "Public Works", "Transportation", "Parks & Recreation", "Sanitation"],
  Madurai: ["All Departments", "Public Works", "Sanitation", "Parks & Recreation"],
  Karur:   ["All Departments", "Public Works", "Sanitation", "Electricity Dept."],
};

// Sample feed data per district
const SAMPLE_FEED = [
  { score: 98, time: "2m ago", isoTime: new Date(Date.now() - 2*60*1000).toISOString(),  title: "Major Water Main Break",    dept: "Public Works",       icon: "plumbing",     district: "Chennai", priority: "critical" },
  { score: 74, time: "12m ago",isoTime: new Date(Date.now() - 12*60*1000).toISOString(), title: "Traffic Signal Failure",    dept: "Transportation",     icon: "traffic",      district: "Madurai", priority: "high"     },
  { score: 45, time: "18m ago",isoTime: new Date(Date.now() - 18*60*1000).toISOString(), title: "Garbage Overflow",          dept: "Sanitation",         icon: "delete",       district: "Karur",   priority: "medium"   },
  { score: 68, time: "25m ago",isoTime: new Date(Date.now() - 25*60*1000).toISOString(), title: "Fallen Tree Blocking Road", dept: "Parks & Recreation", icon: "park",         district: "Chennai", priority: "high"     },
  { score: 55, time: "40m ago",isoTime: new Date(Date.now() - 40*60*1000).toISOString(), title: "Open Manhole Cover",        dept: "Public Works",       icon: "construction", district: "Madurai", priority: "high"     },
  { score: 30, time: "1h ago", isoTime: new Date(Date.now() - 60*60*1000).toISOString(), title: "Streetlight Malfunction",   dept: "Electricity Dept.",  icon: "lightbulb",    district: "Karur",   priority: "low"      },
];

export default function GovernmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [liveReport, setLiveReport] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [activeDistrict, setActiveDistrict] = useState<District>("All");
  const [activeDept, setActiveDept] = useState("All Departments");
  const [tick, setTick] = useState(0);   // increments every 30s to re-render relative times
  const router = useRouter();

  // Section refs for scroll
  const dashboardRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    const stored = localStorage.getItem("lastReport");
    if (stored) setLiveReport(JSON.parse(stored));
    // Tick every 30 s so relative timestamps re-render
    const ticker = setInterval(() => setTick(t => t + 1), 30_000);
    return () => { clearTimeout(timer); clearInterval(ticker); };
  }, []);

  // Reset dept filter when district changes
  useEffect(() => {
    setActiveDept("All Departments");
  }, [activeDistrict]);

  const scrollTo = (section: Section) => {
    setActiveSection(section);
    const refs: Record<Section, React.RefObject<HTMLDivElement | null>> = {
      dashboard: dashboardRef,
      map: mapRef,
      reports: reportsRef,
      insights: insightsRef,
      settings: settingsRef,
    };
    refs[section].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const priorityBorderColor: Record<string, string> = {
    Critical: "border-red-500/40", critical: "border-red-500/40",
    High: "border-orange-500/40", high: "border-orange-500/40",
    Medium: "border-yellow-500/40", medium: "border-yellow-500/40",
    Low: "border-green-500/40", low: "border-green-500/40",
  };
  const priorityBadgeColor: Record<string, string> = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/30", critical: "bg-red-500/20 text-red-400 border-red-500/30",
    High: "bg-orange-500/20 text-orange-400 border-orange-500/30", high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border-green-500/30", low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "map", label: "Map View", icon: "map" },
    { id: "reports", label: "Reports", icon: "description" },
    { id: "insights", label: "AI Insights", icon: "psychology" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const filteredFeed = SAMPLE_FEED
    .filter(item => activeDistrict === "All" || item.district === activeDistrict)
    .filter(item => activeDept === "All Departments" || item.dept === activeDept);

  return (
    <>
      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 backdrop-blur-xl border-b border-white/10 bg-black/60">
        <div className="font-bold text-blue-400 text-lg tracking-tighter">CivicShield AI</div>
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-blue-400 cursor-pointer">notifications</span>
          <span className="material-symbols-outlined text-blue-400 cursor-pointer">account_circle</span>
        </div>
      </header>

      {/* Desktop sidebar nav */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 p-4 backdrop-blur-xl border-r border-white/10 w-64 bg-black/50">
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <span className="material-symbols-outlined text-white text-2xl">shield</span>
          </div>
          <h1 className="font-bold text-blue-400 text-center text-lg">CivicShield AI</h1>
          <p className="text-gray-500 text-xs mt-1 text-center">Tamil Nadu Operations</p>
        </div>

        <div className="flex flex-col gap-1 flex-grow">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left w-full ${
                activeSection === item.id
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <Link href="/report" className="mt-auto w-full py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-2 text-sm transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span> New Report
        </Link>
      </nav>

      {/* Main content */}
      <main className="pt-20 md:pt-6 md:ml-64 px-4 md:px-8 pb-24 md:pb-8 flex flex-col gap-10">

        {/* ── SECTION: Dashboard ── */}
        <section ref={dashboardRef} id="dashboard">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Live Operations</h2>
              <p className="text-gray-400 text-sm">Real-time civic incident tracking & AI analysis</p>
            </div>
            <div className="hidden md:flex gap-3">
              <span className="material-symbols-outlined text-blue-400 cursor-pointer p-2 rounded-full bg-white/5 hover:bg-white/10">notifications</span>
              <span className="material-symbols-outlined text-blue-400 cursor-pointer p-2 rounded-full bg-white/5 hover:bg-white/10">account_circle</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Incidents (24h)", value: "1,248", sub: "↓ 12% vs yesterday", subColor: "text-green-400", icon: "data_usage", iconColor: "text-blue-400" },
              { label: "Pending Triage", value: "342", sub: "45 approaching SLA", subColor: "text-yellow-400", icon: "hourglass_empty", iconColor: "text-yellow-400" },
              { label: "Critical SLA Breaches", value: "18", sub: "Immediate action required", subColor: "text-red-400", icon: "warning", iconColor: "text-red-400" },
              { label: "AI-Verified Reports", value: "89%", sub: "↑ Confidence score high", subColor: "text-purple-400", icon: "verified", iconColor: "text-purple-400" },
            ].map((card, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-gray-400 text-xs uppercase tracking-wider">
                  <span>{card.label}</span>
                  <span className={`material-symbols-outlined text-sm ${card.iconColor}`}>{card.icon}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? <SkeletonBlock w="w-16" h="h-8" /> : card.value}
                </div>
                <div className={`text-xs ${card.subColor}`}>
                  {loading ? <SkeletonBlock w="w-28" h="h-3" /> : card.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: Map View ── */}
        <section ref={mapRef} id="map">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">map</span>
            Live Map View
            <div className="flex gap-3 ml-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>Chennai</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>Madurai</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>Karur</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Report</span>
            </div>
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden h-[520px]">
            <CivicMap
              reportLat={liveReport?.lat ?? null}
              reportLng={liveReport?.lng ?? null}
              nearestStation={liveReport?.nearest_station ?? null}
            />
          </div>
        </section>

        {/* ── SECTION: Reports (District-wise) ── */}
        <section ref={reportsRef} id="reports">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">description</span>
            Incoming Reports
          </h2>

          {/* District filter tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDistrict(d)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeDistrict === d
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Department sub-filter — shown under the active district */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {DEPT_BY_DISTRICT[activeDistrict].map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  activeDept === dept
                    ? "bg-purple-700 border-purple-500 text-white"
                    : "border-white/5 text-gray-500 hover:border-white/15 hover:text-gray-300"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Live submitted report */}
            {liveReport &&
              (activeDistrict === "All" || liveReport.nearest_station?.includes(activeDistrict)) &&
              (activeDept === "All Departments" || liveReport.department === activeDept) && (
              <div className={`bg-white/5 border rounded-xl p-4 ring-1 ring-blue-500/50 ${priorityBorderColor[liveReport.priority] || "border-white/10"}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border font-mono ${priorityBadgeColor[liveReport.priority] || "bg-white/10 text-white border-white/10"}`}>
                    AI Score: {liveReport.severity_score}
                  </span>
                  <span className="text-xs text-blue-300 font-mono">{liveReport.ticket_id}</span>
                </div>
                <h4 className="font-semibold text-white mb-1">{liveReport.issue_type}</h4>
                <p className="text-gray-400 text-xs mb-1">{liveReport.department}</p>
                {liveReport.yolo_confidence > 0 && (
                  <p className="text-purple-400 text-xs">{liveReport.yolo_confidence}% AI confidence</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Alerts dispatched
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {getRelativeTime(liveReport.submitted_timestamp)}
                  </span>
                </div>
              </div>
            )}

            {/* Sample reports */}
            {filteredFeed.map((item, i) => (
              <div key={i} className={`bg-white/5 border rounded-xl p-4 hover:bg-white/8 transition-all cursor-pointer ${priorityBorderColor[item.priority] || "border-white/10"}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${priorityBadgeColor[item.priority] || "bg-white/10 text-white border-white/10"}`}>
                    AI Score: {item.score}
                  </span>
                  <span className="text-xs text-gray-500">{getRelativeTime(item.isoTime)}</span>
                </div>
                <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                    {item.dept}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${
                    item.district === "Chennai" ? "text-blue-400 border-blue-500/30 bg-blue-900/20" :
                    item.district === "Madurai" ? "text-purple-400 border-purple-500/30 bg-purple-900/20" :
                    "text-orange-400 border-orange-500/30 bg-orange-900/20"
                  }`}>{item.district}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: AI Insights ── */}
        <section ref={insightsRef} id="insights">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">psychology</span>
            AI Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Most Reported Issue", value: "Garbage Overflow", sub: "38% of all reports today", icon: "delete", color: "text-yellow-400" },
              { label: "Highest Risk District", value: "Chennai", sub: "67 critical incidents", icon: "warning", color: "text-red-400" },
              { label: "Avg. AI Confidence", value: "84.2%", sub: "Across 1,248 detections", icon: "psychology", color: "text-purple-400" },
            ].map((card, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <span className={`material-symbols-outlined text-3xl mb-3 block ${card.color}`}>{card.icon}</span>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">District-wise Issue Breakdown</h3>
            {[
              { district: "Chennai", issues: 67, color: "bg-blue-500", pct: 54 },
              { district: "Madurai", issues: 38, color: "bg-purple-500", pct: 31 },
              { district: "Karur", issues: 18, color: "bg-orange-500", pct: 15 },
            ].map((row) => (
              <div key={row.district} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{row.district}</span>
                  <span className="text-gray-400">{row.issues} issues</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className={`${row.color} h-2 rounded-full transition-all`} style={{ width: `${row.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION: Settings ── */}
        <section ref={settingsRef} id="settings">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">settings</span>
            Settings
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
            {[
              { label: "Alert Notifications", sub: "Email & WhatsApp alerts for new reports", icon: "notifications", action: "toggle", on: true },
              { label: "Active Districts", sub: "Chennai, Madurai, Karur", icon: "location_city", action: "text" },
              { label: "AI Model", sub: "YOLOv8 + Gemini 2.5 Flash (Hybrid)", icon: "psychology", action: "text" },
              { label: "Station Email", sub: "pichaimuthumalleshwar@gmail.com", icon: "mail", action: "text" },
              { label: "WhatsApp Officer", sub: "+91 63826 60679", icon: "chat", action: "text" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">{item.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-gray-500 text-xs">{item.sub}</p>
                  </div>
                </div>
                {item.action === "toggle" && (
                  <div className={`w-10 h-5 rounded-full transition-all ${item.on ? "bg-blue-500" : "bg-gray-600"} relative cursor-pointer`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${item.on ? "right-0.5" : "left-0.5"}`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-2 md:hidden backdrop-blur-lg border-t border-white/10 bg-black/60 rounded-t-xl">
        {[
          { id: "dashboard" as Section, label: "Home", icon: "home" },
          { id: "map" as Section, label: "Map", icon: "map" },
          { id: "reports" as Section, label: "Reports", icon: "analytics" },
          { id: "insights" as Section, label: "AI", icon: "psychology" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeSection === item.id ? "text-blue-400" : "text-gray-500"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
