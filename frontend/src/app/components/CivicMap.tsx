"use client";
import { useEffect, useRef } from "react";

const STATIONS = [
  // Chennai District
  { name: "Chennai Central Control Room, Park Town", lat: 13.0827, lng: 80.2707, district: "Chennai" },
  { name: "Chennai North Zone Corporation, Tondiarpet", lat: 13.1270, lng: 80.2900, district: "Chennai" },
  { name: "Chennai South Zone Corporation, Adyar", lat: 13.0012, lng: 80.2565, district: "Chennai" },
  { name: "Chennai West Zone Public Works, Ashok Nagar", lat: 13.0350, lng: 80.2100, district: "Chennai" },
  // Madurai District
  { name: "Madurai Central Dispatch, Anna Nagar", lat: 9.9252, lng: 78.1198, district: "Madurai" },
  { name: "Madurai North Zone Corporation, Arappalayam", lat: 9.9600, lng: 78.1100, district: "Madurai" },
  { name: "Madurai South Zone Sanitation Hub, Kappalur", lat: 9.8700, lng: 78.0900, district: "Madurai" },
  { name: "Madurai Emergency Services, Goripalayam", lat: 9.9100, lng: 78.1300, district: "Madurai" },
  // Karur District
  { name: "Karur Central Control Room, Karur Town", lat: 10.9601, lng: 78.0766, district: "Karur" },
  { name: "Karur North Zone Office, Kulithalai", lat: 10.9344, lng: 78.4173, district: "Karur" },
  { name: "Karur South Zone Public Works, Aravakurichi", lat: 10.7833, lng: 77.9833, district: "Karur" },
];

const DISTRICT_COLORS: Record<string, string> = {
  Chennai: "#3b82f6",   // blue
  Madurai: "#a855f7",   // purple
  Karur:   "#0D9488",   // teal
};

interface MapProps {
  reportLat?: number | null;
  reportLng?: number | null;
  nearestStation?: string | null;
}

export default function CivicMap({ reportLat, reportLng, nearestStation }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Always destroy any existing map first (fixes React StrictMode double-invoke)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Also clear any orphaned Leaflet state on the DOM node itself
    const container = mapRef.current as any;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    // Inject Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      // Guard: if another effect already initialized a map on this node, bail out
      if ((mapRef.current as any)._leaflet_id && mapInstanceRef.current) return;

      // Fix broken default icons from webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [11.0, 78.8],   // centre of Tamil Nadu
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      // Dark CartoDB tiles — no API key needed
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Draw station markers
      STATIONS.forEach((station) => {
        const isNearest = station.name === nearestStation;
        const color = DISTRICT_COLORS[station.district] ?? "#6b7280";
        const size = isNearest ? 20 : 13;

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:${color};
            border:2px solid white;
            border-radius:50%;
            width:${size}px;height:${size}px;
            box-shadow:0 0 ${isNearest ? 16 : 6}px ${color};
            ${isNearest ? "animation:pulse-ring 1.4s infinite;" : ""}
          "></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        L.marker([station.lat, station.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:13px;">
              <b style="color:${color}">${isNearest ? "🚨 Nearest Station" : `📍 ${station.district}`}</b><br>
              ${station.name}
            </div>`,
          );
      });

      // Report location pin (red)
      if (reportLat && reportLng) {
        const reportIcon = L.divIcon({
          className: "",
          html: `<div style="
            background:#ef4444;border:2px solid #fca5a5;
            border-radius:50%;width:18px;height:18px;
            box-shadow:0 0 16px #ef4444;
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        L.marker([reportLat, reportLng], { icon: reportIcon })
          .addTo(map)
          .bindPopup('<b style="color:#fca5a5">🔴 Your Report Location</b>')
          .openPopup();

        // Dashed line from report → nearest station
        if (nearestStation) {
          const station = STATIONS.find((s) => s.name === nearestStation);
          if (station) {
            L.polyline(
              [[reportLat, reportLng], [station.lat, station.lng]],
              { color: "#a78bfa", weight: 2, dashArray: "6 4", opacity: 0.8 }
            ).addTo(map);
            map.fitBounds([[reportLat, reportLng], [station.lat, station.lng]], { padding: [60, 60] });
          }
        } else {
          map.setView([reportLat, reportLng], 12);
        }
      }

      // Inject pulse keyframe once
      if (!document.getElementById("map-keyframes")) {
        const style = document.createElement("style");
        style.id = "map-keyframes";
        style.textContent = `
          @keyframes pulse-ring {
            0%   { box-shadow: 0 0 0 0 rgba(167,139,250,0.7); }
            70%  { box-shadow: 0 0 0 10px rgba(167,139,250,0); }
            100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); }
          }
        `;
        document.head.appendChild(style);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportLat, reportLng, nearestStation]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: "inherit" }} />
  );
}
