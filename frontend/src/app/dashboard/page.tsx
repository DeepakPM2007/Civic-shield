"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues (Leaflet needs window)
const CivicMap = dynamic(() => import('../components/CivicMap'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-black/40">
    <div className="flex flex-col items-center gap-3 text-gray-400">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm">Loading map...</span>
    </div>
  </div>
)});

function SkeletonBlock({ w = "w-full", h = "h-5" }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-white/10 rounded animate-pulse`}></div>;
}

export default function GovernmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [liveReport, setLiveReport] = useState<any>(null);

  useEffect(() => {
    // Simulate data fetch delay (like a real API call)
    const timer = setTimeout(() => setLoading(false), 1500);

    // Load the latest submitted report from localStorage
    const stored = localStorage.getItem("lastReport");
    if (stored) {
      setLiveReport(JSON.parse(stored));
    }

    return () => clearTimeout(timer);
  }, []);

  const priorityBorderColor: Record<string, string> = {
    Critical: "border-red-500/40",
    High: "border-orange-500/40",
    Medium: "border-yellow-500/40",
    Low: "border-green-500/40",
  };
  const priorityBadgeColor: Record<string, string> = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/30",
    High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <>
      

<header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-surface-glass backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.2)] bg-white/5">
<div className="font-headline-md text-headline-md font-bold text-primary tracking-tighter">
            CivicShield AI
        </div>
<div className="flex gap-4">
<span className="material-symbols-outlined text-primary hover:text-primary transition-colors duration-200 scale-105 transition-transform cursor-pointer" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined text-primary hover:text-primary transition-colors duration-200 scale-105 transition-transform cursor-pointer" data-icon="account_circle">account_circle</span>
</div>
</header>

<nav className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 p-4 bg-surface-glass backdrop-blur-xl border-r border-white/10 shadow-xl w-64 bg-white/5">
<div className="flex flex-col items-center mb-8 pt-4">
<img className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-primary/50 shadow-[0_0_15px_rgba(77,142,255,0.3)]" data-alt="A stylized, glowing AI avatar representing a user profile in a high-tech civic dashboard, featuring neon blue and electric purple hues against a dark charcoal background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGkleWUGOb7ArYlUUHDDtx96_60J_mMe8g1DClxC8t8l2vhYAKZuGgtATqub9BbVAVa2SUFQcQpsrgH6-zRw1DCociLiIbD-iqbSpDTH4sgEgbPrlzQnph65RzqnKSCIZJRlSzcLFk1ePFomHjo7ftrdYRXyrhXldcB8ahAS2SCU0n6TbM1Q4ar1O58bmV-pMdr88CdvfKQxveCjQgniOcz0v8TE0Ke0PRwZblEwCmtN83KRJ848OIDg" />
<h1 className="font-headline-md text-headline-md font-bold text-primary text-center">CivicShield AI</h1>
<p className="font-label-caps text-label-caps text-on-surface-variant mt-1 text-center">AI-Verified Protection</p>
</div>
<div className="flex flex-col gap-2 flex-grow">

<a className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl shadow-[0_0_10px_rgba(139,92,246,0.4)] transition-all duration-300 hover:translate-x-1" href="#">
<span className="material-symbols-outlined" data-icon="dashboard" data-weight="fill" >dashboard</span>
<span className="font-body-lg text-body-lg">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/10 transition-all duration-300 hover:translate-x-1 rounded-xl" href="#">
<span className="material-symbols-outlined" data-icon="map">map</span>
<span className="font-body-lg text-body-lg">Map View</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/10 transition-all duration-300 hover:translate-x-1 rounded-xl" href="#">
<span className="material-symbols-outlined" data-icon="description">description</span>
<span className="font-body-lg text-body-lg">Reports</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/10 transition-all duration-300 hover:translate-x-1 rounded-xl" href="#">
<span className="material-symbols-outlined" data-icon="psychology">psychology</span>
<span className="font-body-lg text-body-lg">AI Insights</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-white/10 transition-all duration-300 hover:translate-x-1 rounded-xl" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-body-lg text-body-lg">Settings</span>
</a>
</div>
<button className="mt-auto w-full py-3 rounded-xl font-label-caps text-label-caps font-bold text-white btn-glow-primary flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-sm">add</span> New Report
        </button>
</nav>

<main className="flex-grow pt-20 md:pt-4 md:ml-64 px-4 md:px-8 pb-24 md:pb-8 w-full max-w-container-max mx-auto flex flex-col gap-stack-lg">

<div className="flex justify-between items-end">
<div>
<h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background">Live Operations</h2>
<p className="font-body-md text-body-md text-on-surface-variant">Real-time civic incident tracking &amp; AI analysis</p>
</div>
<div className="hidden md:flex gap-4">
<span className="material-symbols-outlined text-primary cursor-pointer hover:text-primary-container transition-colors p-2 rounded-full bg-white/5" data-icon="notifications">notifications</span>
<span className="material-symbols-outlined text-primary cursor-pointer hover:text-primary-container transition-colors p-2 rounded-full bg-white/5" data-icon="account_circle">account_circle</span>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">

<div className="glass-card rounded-xl p-4 flex flex-col gap-2 backdrop-blur-xl bg-white/5 border-white/5">
<div className="flex justify-between items-center text-on-surface-variant font-label-caps text-label-caps">
<span>Total Incidents (24h)</span>
<span className="material-symbols-outlined text-primary text-sm">data_usage</span>
</div>
<div className="font-headline-lg text-headline-lg text-on-background">
  {loading ? <SkeletonBlock w="w-20" h="h-8" /> : "1,248"}
</div>
<div className="text-xs text-success-emerald flex items-center gap-1">
  {loading ? <SkeletonBlock w="w-32" h="h-3" /> : <><span className="material-symbols-outlined text-[14px]">arrow_downward</span> 12% vs yesterday</>}
</div>
</div>

<div className="glass-card rounded-xl p-4 flex flex-col gap-2 backdrop-blur-xl bg-white/5 border-white/5">
<div className="flex justify-between items-center text-on-surface-variant font-label-caps text-label-caps">
<span>Pending Triage</span>
<span className="material-symbols-outlined text-warning-amber text-sm">hourglass_empty</span>
</div>
<div className="font-headline-lg text-headline-lg text-on-background">
  {loading ? <SkeletonBlock w="w-16" h="h-8" /> : "342"}
</div>
<div className="text-xs text-warning-amber flex items-center gap-1">
  {loading ? <SkeletonBlock w="w-36" h="h-3" /> : <><span className="material-symbols-outlined text-[14px]">priority_high</span> 45 approaching SLA</>}
</div>
</div>

<div className="glass-card rounded-xl p-4 flex flex-col gap-2 border-t-critical-red/30 bg-critical-red/5 backdrop-blur-xl bg-white/5 border-white/5">
<div className="flex justify-between items-center text-on-surface-variant font-label-caps text-label-caps">
<span>Critical SLA Breaches</span>
<span className="material-symbols-outlined text-critical-red text-sm">warning</span>
</div>
<div className="font-headline-lg text-headline-lg text-critical-red animate-pulse">
  {loading ? <SkeletonBlock w="w-12" h="h-8" /> : "18"}
</div>
<div className="text-xs text-critical-red flex items-center gap-1">
  {loading ? <SkeletonBlock w="w-28" h="h-3" /> : "Immediate action required"}
</div>
</div>

<div className="glass-card ai-verified rounded-xl p-4 flex flex-col gap-2 backdrop-blur-xl bg-white/5 border-white/5">
<div className="flex justify-between items-center text-secondary font-label-caps text-label-caps">
<span>AI-Verified Reports</span>
<span className="material-symbols-outlined text-secondary text-sm">verified</span>
</div>
<div className="font-headline-lg text-headline-lg text-secondary">
  {loading ? <SkeletonBlock w="w-16" h="h-8" /> : "89%"}
</div>
<div className="text-xs text-secondary-fixed flex items-center gap-1">
  {loading ? <SkeletonBlock w="w-32" h="h-3" /> : <><span className="material-symbols-outlined text-[14px]">trending_up</span> Confidence score high</>}
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg h-[600px]">

<div className="lg:col-span-2 glass-card rounded-xl overflow-hidden relative border border-white/10 flex flex-col backdrop-blur-xl bg-white/5 border-white/5">
<div className="absolute top-4 left-4 z-10 flex gap-2">
<span className="bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full font-label-caps text-label-caps text-primary border border-primary/30 shadow-lg">Live Map View</span>
<div className="bg-surface-glass backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 text-xs">
<div className="w-2 h-2 rounded-full bg-critical-red animate-pulse"></div> Critical
                        <div className="w-2 h-2 rounded-full bg-warning-amber ml-2"></div> Warning
                    </div>
</div>
<div className="flex-grow w-full relative overflow-hidden">
  <CivicMap
    reportLat={liveReport?.lat ?? null}
    reportLng={liveReport?.lng ?? null}
    nearestStation={liveReport?.nearest_station ?? null}
  />
</div>
</div>

<div className="glass-card rounded-xl p-4 flex flex-col h-full overflow-hidden backdrop-blur-xl bg-white/5 border-white/5">
<div className="flex justify-between items-center mb-4">
<h3 className="font-headline-md text-headline-md text-on-background">Incoming Feed</h3>
<span className="font-label-caps text-label-caps text-secondary flex items-center gap-1">
<div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div> Live
                    </span>
</div>
<div className="flex-grow overflow-y-auto glass-scrollbar pr-2 flex flex-col gap-3">

{/* Live Report from most recent submission */}
{liveReport && (
  <div className={`bg-surface-container-low border rounded-lg p-3 cursor-pointer group ring-1 ring-blue-500/40 ${priorityBorderColor[liveReport.priority] || 'border-white/10'}`}>
    <div className="flex justify-between items-start mb-2">
      <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded border ${priorityBadgeColor[liveReport.priority] || 'bg-white/10 text-white border-white/10'}`}>
        AI Score: {liveReport.severity_score}
      </span>
      <span className="text-xs text-blue-300 font-mono">{liveReport.ticket_id}</span>
    </div>
    <h4 className="font-body-md text-body-md text-on-background font-semibold mb-1 group-hover:text-primary transition-colors">{liveReport.issue_type}</h4>
    <div className="flex items-center justify-between text-sm text-on-surface-variant">
      <span className="flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">verified</span>
        {liveReport.department}
      </span>
      {liveReport.yolo_confidence > 0 && (
        <span className="text-purple-400 text-xs">{liveReport.yolo_confidence}% confident</span>
      )}
    </div>
    <div className="mt-1 text-[10px] text-green-400 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
      Just submitted — Alerts dispatched
    </div>
  </div>
)}

<div className="bg-surface-container-low border border-critical-red/20 rounded-lg p-3 hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<span className="font-label-caps text-label-caps bg-critical-red/20 text-error px-2 py-0.5 rounded border border-critical-red/30">AI Score: 98</span>
<span className="text-xs text-on-surface-variant">2m ago</span>
</div>
<h4 className="font-body-md text-body-md text-on-background font-semibold mb-1 group-hover:text-primary transition-colors">Major Water Main Break</h4>
<div className="flex items-center gap-2 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">plumbing</span>
<span className="">Dept. of Public Works</span>
</div>
</div>

<div className="bg-surface-container-low border border-white/5 rounded-lg p-3 hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<span className="font-label-caps text-label-caps bg-warning-amber/20 text-warning-amber px-2 py-0.5 rounded border border-warning-amber/30">AI Score: 74</span>
<span className="text-xs text-on-surface-variant">12m ago</span>
</div>
<h4 className="font-body-md text-body-md text-on-background font-semibold mb-1 group-hover:text-primary transition-colors">Traffic Signal Failure</h4>
<div className="flex items-center gap-2 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">traffic</span>
<span className="">Dept. of Transportation</span>
</div>
</div>

<div className="bg-surface-container-low border border-white/5 rounded-lg p-3 hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<span className="font-label-caps text-label-caps bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">AI Score: 45</span>
<span className="text-xs text-on-surface-variant">18m ago</span>
</div>
<h4 className="font-body-md text-body-md text-on-background font-semibold mb-1 group-hover:text-primary transition-colors">Pothole Report</h4>
<div className="flex items-center gap-2 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">add_road</span>
<span className="">Dept. of Public Works</span>
</div>
</div>

<div className="bg-surface-container-low border border-white/5 rounded-lg p-3 hover:bg-surface-container transition-colors cursor-pointer group">
<div className="flex justify-between items-start mb-2">
<span className="font-label-caps text-label-caps bg-warning-amber/20 text-warning-amber px-2 py-0.5 rounded border border-warning-amber/30">AI Score: 68</span>
<span className="text-xs text-on-surface-variant">25m ago</span>
</div>
<h4 className="font-body-md text-body-md text-on-background font-semibold mb-1 group-hover:text-primary transition-colors">Fallen Tree Blocking Road</h4>
<div className="flex items-center gap-2 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[16px]">park</span>
<span className="">Parks &amp; Recreation</span>
</div>
</div>

<div className="bg-surface-container-lowest border border-white/5 rounded-lg p-3 flex flex-col gap-2 opacity-50 animate-pulse">
<div className="h-4 bg-white/10 rounded w-1/3"></div>
<div className="h-5 bg-white/10 rounded w-3/4"></div>
<div className="h-3 bg-white/10 rounded w-1/2 mt-1"></div>
</div>
</div>
</div>
</div>
</main>

<nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface-glass backdrop-blur-lg border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] rounded-t-xl font-label-caps text-label-caps text-primary font-bold backdrop-blur-xl bg-white/5">

<div className="flex flex-col items-center justify-center bg-primary-container/30 text-primary rounded-xl p-2 shadow-[0_0_10px_rgba(173,198,255,0.4)] active:scale-95 transition-transform" >
<span className="material-symbols-outlined mb-1" data-icon="home" data-weight="fill" >home</span>
<span className="">Home</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-95 transition-transform" >
<span className="material-symbols-outlined mb-1" data-icon="explore">explore</span>
<span className="">Map</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-95 transition-transform" >
<span className="material-symbols-outlined mb-1" data-icon="analytics">analytics</span>
<span className="">Reports</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant p-2 active:scale-95 transition-transform" >
<span className="material-symbols-outlined mb-1" data-icon="person">person</span>
<span className="">Profile</span>
</div>
</nav>



    </>
  );
}
