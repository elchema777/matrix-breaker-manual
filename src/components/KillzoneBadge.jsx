import { useState, useEffect } from "react";

function getPRTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }));
}

function getKillzoneStatus() {
  const now = getPRTime();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;

  if (totalMin >= 180 && totalMin < 360) return { zone: "LONDON", color: "#00D4FF", active: true };
  if (totalMin >= 510 && totalMin < 660) return { zone: "NY OPEN", color: "#00FF88", active: true };
  if (totalMin >= 510 && totalMin < 720) return { zone: "LN/NY OVERLAP", color: "#FFD700", active: true };
  if (totalMin >= 1020 && totalMin < 1080) return { zone: "NY CLOSE", color: "#FF8C00", active: true };
  return { zone: "OFF SESSION", color: "#3a3a4a", active: false };
}

export default function KillzoneBadge() {
  const [status, setStatus] = useState(getKillzoneStatus());

  useEffect(() => {
    const t = setInterval(() => setStatus(getKillzoneStatus()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `${status.color}18`,
      border: `1px solid ${status.color}40`,
      borderRadius: 6, padding: "4px 10px",
      fontSize: 10, letterSpacing: "2px",
      fontFamily: "'Orbitron', monospace",
      color: status.color,
      boxShadow: status.active ? `0 0 12px ${status.color}30` : "none"
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: status.color,
        animation: status.active ? "pulse 1.5s infinite" : "none"
      }} />
      {status.zone}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </span>
  );
}
