"use client";
import { useEffect, useRef } from "react";

// Tamil Nadu station coordinates (must match geospatial.py exactly)
const STATIONS = [
  { name: "Chennai Central Control Room, Park Town", lat: 13.0827, lng: 80.2707 },
  { name: "Chennai North Zone Corporation, Tondiarpet", lat: 13.1270, lng: 80.2900 },
  { name: "Chennai South Zone Corporation, Adyar", lat: 13.0012, lng: 80.2565 },
  { name: "Chennai West Zone Public Works, Ashok Nagar", lat: 13.0350, lng: 80.2100 },
  { name: "Madurai Central Dispatch, Anna Nagar", lat: 9.9252, lng: 78.1198 },
  { name: "Madurai North Zone Corporation, Arappalayam", lat: 9.9600, lng: 78.1100 },
  { name: "Madurai South Zone Sanitation Hub, Kappalur", lat: 9.8700, lng: 78.0900 },
  { name: "Madurai Emergency Services, Goripalayam", lat: 9.9100, lng: 78.1300 },
];

interface MapProps {
  reportLat?: number | null;
  reportLng?: number | null;
  nearestStation?: string | null;
}

export default function CivicMap({ reportLat, reportLng, nearestStation }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Centre on Tamil Nadu — between Chennai and Madurai
      const map = L.map(mapRef.current!, {
        center: [11.5, 79.5],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Dark OpenStreetMap tile layer (CartoDB Dark Matter)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Station markers (blue)
      const stationIcon = L.divIcon({
        className: "",
        html: `<div style="
          background: rgba(59,130,246,0.9);
          border: 2px solid #93c5fd;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          box-shadow: 0 0 8px rgba(59,130,246,0.8);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      STATIONS.forEach((station) => {
        const isNearest = station.name === nearestStation;
        const icon = isNearest
          ? L.divIcon({
              className: "",
              html: `<div style="
                background: rgba(139,92,246,0.9);
                border: 2px solid #c4b5fd;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                box-shadow: 0 0 16px rgba(139,92,246,0.9);
                animation: pulse 1.5s infinite;
              "></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
          : stationIcon;

        L.marker([station.lat, station.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<b style="color:#93c5fd">${isNearest ? "🚨 Nearest Station" : "📍 Station"}</b><br>${station.name}`,
            { className: "civic-popup" }
          );
      });

      // Report location marker (red pulsing) if GPS coords available
      if (reportLat && reportLng) {
        const reportIcon = L.divIcon({
          className: "",
          html: `<div style="
            background: rgba(239,68,68,0.9);
            border: 2px solid #fca5a5;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            box-shadow: 0 0 16px rgba(239,68,68,0.9);
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        L.marker([reportLat, reportLng], { icon: reportIcon })
          .addTo(map)
          .bindPopup('<b style="color:#fca5a5">🔴 Submitted Report Location</b>')
          .openPopup();

        // Draw a line from the report to the nearest station
        if (nearestStation) {
          const station = STATIONS.find((s) => s.name === nearestStation);
          if (station) {
            L.polyline(
              [[reportLat, reportLng], [station.lat, station.lng]],
              { color: "#a78bfa", weight: 2, dashArray: "6 4", opacity: 0.7 }
            ).addTo(map);
            // Fit map to show both
            map.fitBounds([[reportLat, reportLng], [station.lat, station.lng]], { padding: [60, 60] });
          }
        } else {
          map.setView([reportLat, reportLng], 12);
        }
      }
    });

    // Inject leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [reportLat, reportLng, nearestStation]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
    />
  );
}
