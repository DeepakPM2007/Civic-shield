"use client";
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type GpsStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

// ── Government portal header shared across all screens ───────────────────────
function GovHeader({ back }: { back?: boolean }) {
  const router = useRouter();
  return (
    <>
      <div style={{ background: "#0F2447", color: "#93c5fd", fontSize: 11, padding: "4px 24px", display: "flex", justifyContent: "space-between" }}>
        <span>Government of Tamil Nadu — CivicShield AI</span>
        <span>Helpline: 1800-XXX-XXXX</span>
      </div>
      <header style={{ background: "#1B3A6B", color: "white", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "3px solid #0D9488" }}>
        {back && (
          <button onClick={() => router.push('/')} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: 4, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#0D9488", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "white" }}>shield</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>CivicShield AI</div>
            <div style={{ fontSize: 10, color: "#93c5fd" }}>Complaint Registration Portal — Tamil Nadu</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Link href="/dashboard" style={{ color: "#bfdbfe", fontSize: 12, textDecoration: "none" }}>Officer Dashboard →</Link>
        </div>
      </header>
    </>
  );
}

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

  useEffect(() => { requestGps(); }, []);

  const requestGps = () => {
    if (!("geolocation" in navigator)) { setGpsStatus("unavailable"); return; }
    setGpsStatus("requesting");
    const onSuccess = (pos: GeolocationPosition) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setGpsStatus("granted");
    };
    const onError = (err: GeolocationPositionError) => {
      if (err.code === 1) {
        setGpsStatus("denied");
      } else {
        navigator.geolocation.getCurrentPosition(onSuccess, () => setGpsStatus("denied"), { enableHighAccuracy: false, timeout: 10000 });
      }
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 8000 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { alert("Please upload a photo."); return; }
    if (!location || gpsStatus !== "granted") {
      alert("GPS location is required to submit a report. Please enable location access and try again.");
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
        submitted_timestamp: new Date().toISOString(),
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

  const PRIORITY_COLOR: Record<string, string> = {
    Critical: "#B91C1C", High: "#92400E", Medium: "#075985", Low: "#166534",
  };
  const PRIORITY_BG: Record<string, string> = {
    Critical: "#FEE2E2", High: "#FEF3C7", Medium: "#E0F2FE", Low: "#DCFCE7",
  };

  // ── GPS: Denied ─────────────────────────────────────────────────────────────
  if (gpsStatus === "denied" || gpsStatus === "unavailable") {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F6FB" }}>
        <GovHeader back />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 100px)", padding: 24 }}>
          <div style={{ background: "white", border: "1px solid #FECACA", borderLeft: "4px solid #DC2626", borderRadius: 8, padding: 40, maxWidth: 420, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: "#DC2626", display: "block", marginBottom: 16 }}>location_off</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>Location Access Required</h2>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
              CivicShield needs your GPS coordinates to route your complaint to the nearest municipal station.
              {gpsStatus === "denied"
                ? " You blocked location access. Please enable it in your browser address bar."
                : " Your device doesn't support GPS. Please try Chrome on a mobile device."}
            </p>
            <button onClick={requestGps} style={{ width: "100%", padding: "12px 0", background: "#1B3A6B", color: "white", border: "none", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>my_location</span>
              Try Again
            </button>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 12 }}>
              Chrome: Click the 🔒 lock icon in the address bar → Site settings → Location → Allow
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── GPS: Requesting ──────────────────────────────────────────────────────────
  if (gpsStatus === "idle" || gpsStatus === "requesting") {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F6FB" }}>
        <GovHeader />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 100px)", gap: 20, textAlign: "center", padding: 24 }}>
          <div className="spinner"></div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1B3A6B" }}>Acquiring GPS Location...</h2>
          <p style={{ fontSize: 13, color: "#64748B" }}>Please click <strong>Allow</strong> when your browser asks for location access.</p>
        </div>
      </div>
    );
  }

  // ── Main Form (GPS granted) ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F3F6FB" }}>
      <GovHeader back />

      {/* Page title bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E2E8F0", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1B3A6B" }}>Civic Complaint Registration</div>
          <div style={{ fontSize: 11, color: "#64748B" }}>File No. — AI-Assisted / Geospatially Routed</div>
        </div>
        {/* GPS status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "#166534", fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block" }}></span>
          GPS: {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px" }}>

        {result ? (
          /* ── Success card ── */
          <div style={{ background: "white", border: "1px solid #BBF7D0", borderLeft: "5px solid #16A34A", borderRadius: 8, padding: 36, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#16A34A" }}>check_circle</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1E293B" }}>Complaint Registered Successfully</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>AI analysis complete — department and station alerted</div>
              </div>
            </div>

            {/* Ticket ID */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "12px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ticket ID</span>
              <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: "#1B3A6B" }}>{result.ticket_id}</span>
            </div>

            {/* AI Confidence badge */}
            {result.yolo_confidence > 0 && (
              <div style={{ background: "#EDE9FE", border: "1px solid #DDD6FE", borderRadius: 6, padding: "10px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#6D28D9", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>psychology</span>
                  AI Vision Confidence
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#6D28D9" }}>{result.yolo_confidence}%</span>
              </div>
            )}

            {/* Details table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 24 }}>
              <tbody>
                {[
                  ["Detected Issue",          result.issue_type,       "#1E293B"],
                  ["AI Severity Score",       `${result.severity_score}/100`,  "#B91C1C"],
                  ["Assigned Department",     result.department,       "#1B3A6B"],
                  ["Nearest Station Alerted", result.nearest_station,  "#166534"],
                  ["Submitted At",            result.submitted_at,     "#475569"],
                ].map(([label, value, color]) => (
                  <tr key={label} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px", color: "#64748B", fontWeight: 600, width: "40%" }}>{label}</td>
                    <td style={{ padding: "10px 14px", color: color, fontWeight: 700 }}>{value}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: "10px 14px", color: "#64748B", fontWeight: 600 }}>Priority</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      background: PRIORITY_BG[result.priority] || "#F1F5F9",
                      color: PRIORITY_COLOR[result.priority] || "#1E293B",
                      padding: "3px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700
                    }}>{result.priority}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "flex", gap: 12 }}>
              <Link href={`/track?id=${result.ticket_id}`} style={{ flex: 1, background: "#1B3A6B", color: "white", padding: "12px 0", borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                Track My Complaint
              </Link>
              <button onClick={() => router.push('/dashboard')} style={{ flex: 1, background: "#0D9488", color: "white", border: "none", padding: "12px 0", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>dashboard</span>
                View Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* ── Complaint Form ── */
          <form onSubmit={handleSubmit}>

            {/* Section 1: Photo */}
            <div className="gov-card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ borderLeft: "4px solid #0D9488", paddingLeft: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>1. Visual Evidence (Photo)</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Upload a clear photo of the civic issue</div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%", height: 200, border: `2px dashed ${previewUrl ? "#1B3A6B" : "#CBD5E1"}`,
                  borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, cursor: "pointer", background: previewUrl ? "#F8FAFC" : "#F8FAFC",
                  overflow: "hidden", transition: "border-color 0.2s",
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#94A3B8" }}>add_a_photo</span>
                    <p style={{ fontSize: 13, color: "#64748B", textAlign: "center" }}>
                      Click to upload photo<br />
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>JPEG or PNG — max 10MB</span>
                    </p>
                  </>
                )}
              </div>
              {previewUrl && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#166534" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                  Photo attached — {file?.name}
                </div>
              )}
            </div>

            {/* Section 2: Description */}
            <div className="gov-card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ borderLeft: "4px solid #0D9488", paddingLeft: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1B3A6B" }}>2. Issue Description</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>AI will auto-classify the issue type and severity</div>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="gov-input"
                placeholder="Describe the civic issue clearly. e.g. 'Large garbage pile near the bus stop at Anna Salai, overflowing since 3 days...'"
                style={{ minHeight: 120, resize: "vertical" }}
              />
            </div>

            {/* Info row */}
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#1D4ED8" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
              Your GPS coordinates ({location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}) will be attached to this report for geospatial routing.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "14px 0", background: isSubmitting ? "#64748B" : "#1B3A6B",
                color: "white", border: "none", borderRadius: 4, fontWeight: 700, fontSize: 15,
                cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10, transition: "background 0.2s",
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                  Analyzing with AI — Please wait...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                  Submit Complaint for AI Analysis
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
