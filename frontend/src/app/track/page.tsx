"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_STEPS = [
  { label: "Submitted", icon: "upload_file", done: true },
  { label: "AI Verified", icon: "psychology", done: true },
  { label: "Station Alerted", icon: "campaign", done: true },
  { label: "In Progress", icon: "construction", done: false },
  { label: "Resolved", icon: "check_circle", done: false },
];

const priorityColor: Record<string, string> = {
  Critical: "text-red-400 border-red-500/50 bg-red-900/10",
  High: "text-orange-400 border-orange-500/50 bg-orange-900/10",
  Medium: "text-yellow-400 border-yellow-500/50 bg-yellow-900/10",
  Low: "text-green-400 border-green-500/50 bg-green-900/10",
};

export default function TrackReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id") || "Unknown";
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // Load report from localStorage that was saved on submission
    const stored = localStorage.getItem("lastReport");
    if (stored) {
      setReport(JSON.parse(stored));
    }
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-glass backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-xl font-bold text-blue-400 tracking-tighter">CivicShield AI</div>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-2xl mx-auto flex flex-col gap-6 pb-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-1">Track My Report</h1>
          <div className="inline-block bg-black/40 border border-white/10 rounded-full px-4 py-1 mt-2">
            <span className="text-gray-400 text-sm">Ticket ID: </span>
            <span className="text-yellow-300 font-mono font-bold">{ticketId}</span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="glass-panel rounded-xl p-6">
          <h2 className="text-white font-semibold mb-6">Complaint Status</h2>
          <div className="flex items-start justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/10">
              <div className="h-full bg-blue-500 w-3/5 transition-all duration-1000"></div>
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step.done ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600'}`}>
                  <span className={`material-symbols-outlined text-[16px] ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.icon}</span>
                </div>
                <span className={`text-[10px] text-center max-w-[60px] ${step.done ? 'text-blue-300' : 'text-gray-500'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Details */}
        {report ? (
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-3">
            <h2 className="text-white font-semibold mb-2">Issue Details</h2>

            {report.yolo_confidence > 0 && (
              <div className="flex items-center justify-between bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-2 mb-2">
                <span className="text-gray-300 text-sm">AI Vision Confidence</span>
                <span className="text-purple-300 font-bold">{report.yolo_confidence}% confident</span>
              </div>
            )}

            <div className={`rounded-lg border px-4 py-2 text-sm font-bold ${priorityColor[report.priority] || 'text-white border-white/20 bg-white/5'}`}>
              Priority: {report.priority}
            </div>

            <p className="text-sm"><span className="text-gray-400">Issue:</span> <strong className="text-white">{report.issue_type}</strong></p>
            <p className="text-sm"><span className="text-gray-400">Severity:</span> <strong className="text-red-400">{report.severity_score}/100</strong></p>
            <p className="text-sm"><span className="text-gray-400">Department:</span> <strong className="text-blue-400">{report.department}</strong></p>
            <p className="text-sm"><span className="text-gray-400">Submitted:</span> <strong className="text-gray-300">{report.submitted_at}</strong></p>

            <div className="mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
              Station has been alerted via Email and WhatsApp. Expected response within 24–48 hours.
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-6 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
            <p>No report data found for this ticket.<br />Please submit a report first.</p>
            <Link href="/report" className="mt-4 inline-block px-6 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500">
              Submit a Report
            </Link>
          </div>
        )}

        <Link href="/dashboard" className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-center hover:bg-white/10 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          View Government Dashboard
        </Link>
      </main>
    </>
  );
}
