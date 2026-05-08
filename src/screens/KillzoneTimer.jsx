import { useState, useEffect } from "react";

function getPRTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }));
}

function toMinutes(h, m) { return h * 60 + m; }

function countdown(targetMin) {
  const now = getPRTime();
  const cur = toMinutes(now.getHours(), now.getMinutes()) * 60 + now.getSeconds();
  const tgt = targetMin * 60;
  let diff = tgt - cur;
  if (diff < 0) diff += 86400;
  return { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 };
}

function isActive(startMin, endMin) {
  const now = getPRTime();
  const cur = toMinutes(now.getHours(), now.getMinutes());
  return cur >= startMin && cur < endMin;
}

function nextRedNews(events) {
  const now = getPRTime();
  const cur = toMinutes(now.getHours(), now.getMinutes());
  return events.filter(e => e.min > cur && e.impact === "high")[0] || null;
}

const EVENTS = [
  { name: "NFP", min: 510, impact: "high" },
  { name: "CPI", min: 510, impact: "high" },
  { name: "FOMC", min: 900, impact: "high" },
];

const KILLZONES = [
  { name: "LONDON OPEN", startMin: 180, endMin: 360, color: "#00D4FF" },
  { name: "NY OPEN", startMin: 510, endMin: 600, color: "#00FF88" },
  { name: "LN/NY OVERLAP", startMin: 510, endMin: 720, color: "#FFD700" },
  { name: "NY CLOSE", startMin: 1020, endMin: 1080, color: "#FF8C00" },
];

function Clock({ label, targetMin, color }) {
  const [cd, setCd] = useState(countdown(targetMin));
  const active = isActive(targetMin, targetMin + 120);

  useEffect(() => {
    const t = setInterval(() => setCd(countdown(targetMin)), 1000);
    return () => clearInterval(t);
  }, [targetMin]);

  const pad = n => String(n).padStart(2, "0");

  return (
    <div style={{
      flex: 1, background: active ? `${color}10` : "rgba(255,255,255,0.03)",
      border: `2px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
      borderRadius: 12, padding: "20px 12px", textAlign: "center",
      boxShadow: active ? `0 0 30px ${color}30, inset 0 0 30px ${color}08` : "none",
      animation: active ? "kzPulse 2s infinite" : "none"
    }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 2,
        color: active ? color : "#6B6B80", marginBottom: 8
      }}>{active ? "🔥 ACTIVE" : "NEXT"}</div>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 9, color: "#6B6B80", marginBottom: 6 }}>
        {label}
      </div>
      {active ? (
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, color, fontWeight: 900, letterSpacing: 2 }}>
          TRADE NOW
        </div>
      ) : (
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, color, fontWeight: 900 }}>
          {pad(cd.h)}:{pad(cd.m)}:{pad(cd.s)}
        </div>
      )}
    </div>
  );
}

export default function KillzoneTimer() {
  const [now, setNow] = useState(getPRTime());
  const overlap = isActive(510, 720);
  const redNews = nextRedNews(EVENTS);

  useEffect(() => {
    const t = setInterval(() => setNow(getPRTime()), 1000);
    return () => clearInterval(t);
  }, []);

  const [newsCountdown, setNewsCd] = useState(redNews ? countdown(redNews.min) : null);
  useEffect(() => {
    if (!redNews) return;
    const t = setInterval(() => setNewsCd(countdown(redNews.min)), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 4, textAlign: "center"
      }}>KILLZONE TIMER</div>
      <div style={{ color: "#6B6B80", fontSize: 11, textAlign: "center", marginBottom: 20 }}>{dateStr}</div>

      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 32, fontWeight: 700,
        color: "#F0F0F0", textAlign: "center", marginBottom: 20, letterSpacing: 2
      }}>{timeStr}</div>

      {/* Overlap Banner */}
      {overlap && (
        <div style={{
          background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.4)",
          borderRadius: 10, padding: 14, textAlign: "center", marginBottom: 20,
          boxShadow: "0 0 30px rgba(255,215,0,0.2)"
        }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, color: "#FFD700", fontWeight: 700 }}>
            🔥 LN/NY OVERLAP — PRIME SESSION ACTIVE
          </div>
          <div style={{ color: "#B0B0C0", fontSize: 12, marginTop: 4 }}>8:00 AM – 11:00 AM Puerto Rico</div>
        </div>
      )}

      {/* Main Clocks */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Clock label="LONDON 3:00 AM" targetMin={180} color="#00D4FF" />
        <Clock label="NY OPEN 8:30 AM" targetMin={510} color="#00FF88" />
      </div>

      {/* All Killzones Schedule */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          SESSION SCHEDULE (PUERTO RICO TIME)
        </div>
        {KILLZONES.map(kz => {
          const active = isActive(kz.startMin, kz.endMin);
          const sh = Math.floor(kz.startMin / 60), sm = kz.startMin % 60;
          const eh = Math.floor(kz.endMin / 60), em = kz.endMin % 60;
          const fmt = (h, m) => `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
          return (
            <div key={kz.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: active ? `${kz.color}08` : "rgba(255,255,255,0.02)",
              border: `1px solid ${active ? `${kz.color}40` : "rgba(255,255,255,0.06)"}`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 6
            }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: kz.color }}>
                {active && "🔥 "}{kz.name}
              </div>
              <div style={{ color: "#6B6B80", fontSize: 11 }}>
                {fmt(sh, sm)} — {fmt(eh, em)}
              </div>
            </div>
          );
        })}
      </div>

      {/* News Warning */}
      {redNews && newsCountdown && (
        <div style={{
          background: newsCountdown.h === 0 && newsCountdown.m < 30
            ? "rgba(255,59,59,0.12)" : "rgba(255,140,0,0.08)",
          border: `1px solid ${newsCountdown.h === 0 && newsCountdown.m < 30
            ? "rgba(255,59,59,0.4)" : "rgba(255,140,0,0.3)"}`,
          borderRadius: 10, padding: 14
        }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FF3B3B" }}>
            ⚠️ NEXT RED EVENT: {redNews.name}
          </div>
          <div style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 700, marginTop: 6, fontFamily: "'Orbitron', monospace" }}>
            IN {String(newsCountdown.h).padStart(2, "0")}:{String(newsCountdown.m).padStart(2, "0")}:{String(newsCountdown.s).padStart(2, "0")}
          </div>
          <div style={{ color: "#6B6B80", fontSize: 11, marginTop: 4 }}>
            No trades 30 min before — no trades 30 min after
          </div>
        </div>
      )}

      <style>{`
        @keyframes kzPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(255,215,0,0.3); }
          50% { box-shadow: 0 0 50px rgba(255,215,0,0.5); }
        }
      `}</style>
    </div>
  );
}
