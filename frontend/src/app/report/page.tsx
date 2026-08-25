"use client";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type GpsStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export default function ReportIssue() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // GPS is requested on mount — user MUST grant it
  useEffect(() => {
    requestGps();
  }, []);

  const requestGps = () => {
    if (!("geolocation" in navigator)) {
      setGpsStatus("unavailable");
      return;
    }
    setGpsStatus("requesting");

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      setGpsStatus("granted");
    };

    const onError = (error: GeolocationPositionError) => {
      if (error.code === 1) {
        // PERMISSION_DENIED — user explicitly blocked it
        setGpsStatus("denied");
      } else {
        // POSITION_UNAVAILABLE (2) or TIMEOUT (3) — GPS hardware not available
        // Fall back to network-based location (WiFi/IP) which works on desktops
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => setGpsStatus("denied"),
          { enableHighAccuracy: false, timeout: 10000 }
        );
      }
    };

    // First try high-accuracy GPS (works on phones with GPS chip)
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert("Please upload a photo."); return; }
    if (!location || gpsStatus !== "granted") {
      alert("📍 GPS location is required to submit a report. Please enable location access and try again.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);
    formData.append("location_lat", location.lat.toString());
    formData.append("location_lng", location.lng.toString());

    try {
      const response = await axios.post("http://localhost:8000/api/complaints/report", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const data = response.data.data;
      setResult(data);
      const feedItem = {
        ticket_id: data.ticket_id,
        issue_type: data.issue_type,
        severity_score: data.severity_score,
        priority: data.priority,
        department: data.department,
        submitted_at: data.submitted_at,
        yolo_confidence: data.yolo_confidence,
        nearest_station: data.nearest_station,
        lat: location.lat,
        lng: location.lng,
      };
      localStorage.setItem("lastReport", JSON.stringify(feedItem));
    } catch (error) {
      console.error(error);
      alert("Error contacting the backend. Is FastAPI running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColor: Record<string, string> = {
    Critical: "text-red-400",
    High: "text-orange-400",
    Medium: "text-yellow-400",
    Low: "text-green-400",
  };

  // ─── GPS Gate: block the form until GPS is granted ───────────────
  if (gpsStatus === "denied" || gpsStatus === "unavailable") {
    return (
      <>
        <header className="fixed top-0 w-full z-50 flex items-center px-4 h-16 bg-surface-glass backdrop-blur-xl border-b border-white/10">
          <div className="text-xl font-bold text-blue-400 tracking-tighter">CivicShield AI</div>
        </header>
        <main className="pt-24 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div className="glass-panel p-8 rounded-2xl max-w-sm border border-red-500/40 bg-red-900/10">
            <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">location_off</span>
            <h2 className="text-2xl font-bold text-white mb-2">GPS Access Required</h2>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              CivicShield needs your location to route your complaint to the nearest municipal station.
              {gpsStatus === "denied"
                ? " You blocked location access. Please enable it in your browser settings."
                : " Your browser doesn't support GPS. Try Chrome or Firefox."}
            </p>
            <button
              onClick={requestGps}
              className="w-full py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              Try Again
            </button>
            <p className="text-gray-600 text-xs mt-4">
              On Chrome: Address bar → 🔒 Lock icon → Site settings → Location → Allow
            </p>
          </div>
        </main>
      </>
    );
  }

  // ─── GPS Requesting spinner ───────────────────────────────────────
  if (gpsStatus === "idle" || gpsStatus === "requesting") {
    return (
      <>
        <header className="fixed top-0 w-full z-50 flex items-center px-4 h-16 bg-surface-glass backdrop-blur-xl border-b border-white/10">
          <div className="text-xl font-bold text-blue-400 tracking-tighter">CivicShield AI</div>
        </header>
        <main className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          <h2 className="text-xl font-bold text-white">Getting your location...</h2>
          <p className="text-gray-400 text-sm">Please allow location access when your browser asks.</p>
        </main>
      </>
    );
  }

  // ─── Main Form (GPS granted) ──────────────────────────────────────
  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface-glass backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-xl font-bold text-blue-400 tracking-tighter">CivicShield AI</div>
        </div>
        {/* GPS status badge */}
        <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 border border-green-500/30 rounded-full px-3 py-1 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          GPS: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
        </div>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-3xl mx-auto flex flex-col gap-8 pb-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">Report an Issue</h1>
          <p className="text-gray-400">AI-assisted civic reporting for rapid resolution.</p>
        </div>

        {result ? (
          <div className="glass-panel p-8 rounded-xl border border-green-500/50 bg-green-900/10 text-center">
            <span className="material-symbols-outlined text-6xl text-green-400 mb-4 block">check_circle</span>
            <h2 className="text-2xl font-bold text-white mb-1">AI Analysis Complete</h2>
            <div className="inline-block bg-black/40 border border-white/10 rounded-full px-4 py-1 mb-4">
              <span className="text-gray-400 text-sm">Ticket ID: </span>
              <span className="text-yellow-300 font-mono font-bold text-sm">{result.ticket_id}</span>
            </div>
            <div className="flex flex-col gap-3 mt-4 text-left bg-black/30 p-5 rounded-lg">
              {result.yolo_confidence > 0 && (
                <div className="flex items-center justify-between bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-2">
                  <span className="text-gray-300 text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-purple-400">psychology</span>
                    AI Vision Confidence
                  </span>
                  <span className="text-purple-300 font-bold text-lg">{result.yolo_confidence}% confident</span>
                </div>
              )}
              <p><span className="text-gray-400">Detected Issue:</span> <strong className="text-white">{result.issue_type}</strong></p>
              <p><span className="text-gray-400">Severity Score:</span> <strong className="text-red-400">{result.severity_score}/100</strong></p>
              <p><span className="text-gray-400">Priority:</span> <strong className={priorityColor[result.priority] || "text-white"}>{result.priority}</strong></p>
              <p><span className="text-gray-400">Department:</span> <strong className="text-blue-400">{result.department}</strong></p>
              {result.nearest_station && (
                <p><span className="text-gray-400">Nearest Station Alerted:</span> <strong className="text-purple-400">{result.nearest_station}</strong></p>
              )}
              <p><span className="text-gray-400">Submitted At:</span> <strong className="text-gray-300">{result.submitted_at}</strong></p>
            </div>
            <div className="flex gap-3 mt-6">
              <Link
                href={`/track?id=${result.ticket_id}`}
                className="flex-1 py-3 bg-purple-700 rounded-xl text-white font-bold hover:bg-purple-600 text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Track My Report
              </Link>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                View Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 md:p-8 flex flex-col gap-8 shadow-xl backdrop-blur-xl">
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-blue-200 font-bold text-xs">1</span>
                <h2 className="text-xl font-semibold text-white">Visual Evidence</h2>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${previewUrl ? 'border-blue-500 p-2' : 'border-gray-600 hover:border-blue-400 hover:bg-white/5 bg-black/20'}`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-gray-400">add_a_photo</span>
                    <p className="text-gray-400 text-center px-4">Click to upload photo<br /><span className="text-sm opacity-70">JPEG or PNG</span></p>
                  </>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-blue-200 font-bold text-xs">2</span>
                <h2 className="text-xl font-semibold text-white">Details</h2>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-colors min-h-[120px] resize-none bg-black/20 border-gray-600"
                placeholder="Describe the issue... AI will automatically categorize and assess severity."
              />
            </section>

            <button
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-purple-600 text-white animate-pulse' : 'bg-blue-600 text-white hover:scale-[1.02] shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}
              type="submit"
            >
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin">sync</span> Analyzing with CivicShield AI...</>
              ) : (
                <><span className="material-symbols-outlined">send</span> Submit for AI Analysis</>
              )}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
