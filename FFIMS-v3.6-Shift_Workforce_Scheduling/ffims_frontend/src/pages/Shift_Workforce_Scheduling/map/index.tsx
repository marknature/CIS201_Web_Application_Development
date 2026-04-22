
import { useEffect, useRef, useState } from "react";
import { useFFIMSStore } from "@/store/ffims-store";
import { PageHeading, Card, KPICard } from "@/components/ui/ffims-ui";
import { Navigation, Clock, AlertTriangle, Wifi } from "lucide-react";

// Africa University Mutare coords
const AU_LAT = -18.9707;
const AU_LNG = 32.6709;

function ETABadge({ eta, delay }: { eta?: string; delay?: number }) {
  if (!eta) return <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>;
  const time = new Date(eta).toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" });
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: delay ? "#991B1B" : "#166534" }}>
      {time}{delay ? ` (+${delay}min)` : ""}
    </span>
  );
}

function DriverStatusRow({ driver, journey }: { driver: any; journey: any }) {
  const statusColor: Record<string, string> = {
    duty: "#22C55E", standby: "#3B82F6", leave: "#FACC15", rest: "#9CA3AF", ot: "#EF4444",
  };
  return (
    <tr>
      <td style={{ fontWeight: 500, color: "#1A1A1A" }}>{driver.name}</td>
      <td>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor[driver.status] ?? "#9CA3AF", display: "inline-block" }} />
          {driver.status.toUpperCase()}
        </span>
      </td>
      <td style={{ color: "#6B7280" }}>{journey?.destination ?? "—"}</td>
      <td style={{ color: "#6B7280" }}>{journey ? `${journey.distanceKm}km` : "—"}</td>
      <td><ETABadge eta={journey?.etaTimestamp} delay={journey?.delayMinutes} /></td>
      <td>
        {driver.gpsLat
          ? <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 500 }}>● Live</span>
          : <span style={{ fontSize: 11, color: "#9CA3AF" }}>○ No signal</span>}
      </td>
    </tr>
  );
}

export default function MapPage() {
  const { drivers, journeys } = useFFIMSStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const activeDrivers = drivers.filter((d) => d.status === "duty" || d.status === "ot");
  const activeJourneys = journeys.filter((j) => j.status === "in-progress" || j.status === "delayed");
  const delayed = journeys.filter((j) => j.status === "delayed").length;

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || leafletMap.current) return;

    // Dynamically load Leaflet (no SSR issues)
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as any).L;
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      // AU campus marker
      const auIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#CC0000;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7], className: "",
      });
      L.marker([AU_LAT, AU_LNG], { icon: auIcon })
        .addTo(map)
        .bindPopup("<strong>Africa University FFU</strong><br>Mutare Campus");

      // Driver markers for those with GPS
      const driverPins = drivers
        .filter((d) => d.gpsLat && d.gpsLng)
        .map((d) => {
          const journey = journeys.find((j) => j.driverId === d.id && (j.status === "in-progress" || j.status === "delayed"));
          const color = d.status === "duty" ? "#22C55E" : d.status === "ot" ? "#EF4444" : "#3B82F6";
          const icon = L.divIcon({
            html: `<div style="background:${color};color:#fff;font-size:9px;font-weight:700;padding:3px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:1.5px solid #fff">${d.name.split(".")[0]}.</div>`,
            iconSize: [60, 22], iconAnchor: [30, 11], className: "",
          });
          const marker = L.marker([d.gpsLat!, d.gpsLng!], { icon }).addTo(map);
          marker.bindPopup(`
            <strong>${d.name}</strong><br>
            Status: ${d.status.toUpperCase()}<br>
            ${journey ? `Destination: ${journey.destination}<br>Distance: ${journey.distanceKm}km` : ""}
          `);
          return marker;
        });

      // Destination markers for active journeys
      activeJourneys.forEach((j) => {
        const destIcon = L.divIcon({
          html: `<div style="width:10px;height:10px;background:#1E40AF;border:2px solid #fff;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,0.3);transform:rotate(45deg)"></div>`,
          iconSize: [10, 10], iconAnchor: [5, 5], className: "",
        });
        L.marker([j.destinationLat, j.destinationLng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<strong>${j.destination}</strong><br>${j.distanceKm}km from AU`);
      });

      // Fit bounds to show all markers
      const allLats = [AU_LAT, ...drivers.filter((d) => d.gpsLat).map((d) => d.gpsLat!)];
      const allLngs = [AU_LNG, ...drivers.filter((d) => d.gpsLng).map((d) => d.gpsLng!)];
      const bounds = [[Math.min(...allLats) - 0.05, Math.min(...allLngs) - 0.05], [Math.max(...allLats) + 0.05, Math.max(...allLngs) + 0.05]];
      map.fitBounds(bounds as any);

      leafletMap.current = map;
      markersRef.current = driverPins;
      setMapReady(true);
    };
    document.head.appendChild(script);

    return () => {
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; }
    };
  }, []);

  return (
    <div>
      <PageHeading title="Real-Time Map & ETA" subtitle="Live driver positions · GPS tracking · Return time estimates" />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Active on map"    value={activeDrivers.length} variant="success" />
        <KPICard label="Active journeys"  value={activeJourneys.length} variant="info" />
        <KPICard label="Delayed"          value={delayed}              variant={delayed > 0 ? "danger" : "default"} />
        <KPICard label="GPS signal"       value={`${drivers.filter((d) => d.gpsLat).length}/10`} variant="default" />
      </div>

      {/* Delay alerts */}
      {journeys.filter((j) => j.status === "delayed").map((j) => (
        <div key={j.id} style={{ display: "flex", gap: 8, background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#991B1B", fontWeight: 500 }}>
          <AlertTriangle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>{j.driverName}</strong> is delayed by {j.delayMinutes}min on journey to {j.destination}.
            {" "}Consider activating a standby driver if gap detected.
          </span>
        </div>
      ))}

      {/* Map */}
      <Card style={{ padding: 0, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ background: "#1A1A1A", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Navigation style={{ width: 14, height: 14, color: "#CC0000" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Live Fleet Map — Africa University FFU</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#CC0000", display: "inline-block" }} /> AU Campus</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} /> On Duty</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} /> Overtime</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, background: "#1E40AF", display: "inline-block", transform: "rotate(45deg)" }} /> Destination</span>
          </div>
        </div>
        <div ref={mapRef} style={{ height: 420, width: "100%" }} />
        {!mapReady && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 6 }}>
            <Wifi style={{ width: 14, height: 14 }} /> Loading map…
          </div>
        )}
      </Card>

      {/* Driver availability board */}
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", marginBottom: 10 }}>Real-time availability board</h2>
      <Card style={{ padding: 0, overflowX: "auto" }}>
        <table className="ffims-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Status</th>
              <th>Destination</th>
              <th>Distance</th>
              <th>ETA return</th>
              <th>GPS</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const journey = journeys.find((j) => j.driverId === d.id && (j.status === "in-progress" || j.status === "delayed"));
              return <DriverStatusRow key={d.id} driver={d} journey={journey} />;
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
