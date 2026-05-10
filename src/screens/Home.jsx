import { useState, useEffect } from "react";
import MatrixRain from "../components/MatrixRain";
import KillzoneBadge from "../components/KillzoneBadge";
import BiasCard from "../components/BiasCard";

function getPRTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }));
}

function getNextKillzone() {
  const now = getPRTime();
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMin = h * 60 + m;

  const zones = [
    { name: "LONDON", startMin: 180 },
    { name: "NY OPEN", startMin: 510 },
    { name: "NY CLOSE", startMin: 1020 },
  ];

  for (const z of zones) {
    if (totalMin < z.startMin) {
      const diff = z.startMin - totalMin;
      return { name: z.name, hours: Math.floor(diff / 60), mins: diff % 60 };
    }
  }
  const diff = 180 + (1440 - totalMin);
  return { name: "LONDON", hours: Math.floor(diff / 60), mins: diff % 60 };
}

function isActiveKillzone() {
  const now = getPRTime();
  const t = now.getHours() * 60 + now.getMinutes();
  return (t >= 180 && t < 360) || (t >= 510 && t < 720) || (t >= 1020 && t < 1080);
}

const BIASES = [
  { instrument: "XAU", bias: "▲ BULL", color: "#00FF88" },
  { instrument: "GER", bias: "▼ BEAR", color: "#FF3B3B" },
  { instrument: "NAS", bias: "→ NEUT", color: "#FFD700" },
];

function todayKey() { return new Date().toISOString().slice(0, 10); }

export default function Home({ onNavigate, weekStats }) {
  const [time, setTime] = useState(getPRTime());
  const [next, setNext] = useState(getNextKillzone());
  const [active, setActive] = useState(isActiveKillzone());
  const [pendingTrade, setPendingTrade] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mb_pending_trade") || "null"); } catch { return null; }
  });
  const [needsDebrief, setNeedsDebrief] = useState(() => {
    try {
      const trades = JSON.parse(localStorage.getItem("mb_trades") || "[]");
      const todayTrades = trades.filter(t => (t.timestamp || t.closedAt || "").startsWith(todayKey()));
      const session = JSON.parse(localStorage.getItem(`mb_sessions:${todayKey()}`) || "null");
      return todayTrades.length > 0 && !session?.submitted;
    } catch { return false; }
  });

  useEffect(() => {
    const t = setInterval(() => {
      setTime(getPRTime());
      setNext(getNextKillzone());
      setActive(isActiveKillzone());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
  });
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  const { wr = 0, pnl = 0, streak = 0 } = weekStats || {};

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 80 }}>
      <MatrixRain opacity={0.04} />

      <div style={{ position: "relative", zIndex: 1, padding: "32px 20px 0" }}>

        {/* BANNER: pending trade result */}
        {pendingTrade && (
          <div style={{ background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#FF8C00", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>TRADE RESULT PENDING</div>
              <div style={{ color: "#B0B0C0", fontSize: 12, marginTop: 2 }}>{pendingTrade.instrument} {pendingTrade.direction} @ {pendingTrade.entry}</div>
            </div>
            <button onClick={() => onNavigate("logresult")} style={{ background: "rgba(255,140,0,0.2)", border: "1px solid rgba(255,140,0,0.5)", borderRadius: 7, padding: "7px 12px", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 9, color: "#FF8C00", letterSpacing: 1 }}>LOG RESULT</button>
          </div>
        )}

        {/* BANNER: session debrief needed */}
        {needsDebrief && !pendingTrade && (
          <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: "#00D4FF", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>LOG SESSION DEBRIEF</div>
            <button onClick={() => onNavigate("postsession")} style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.4)", borderRadius: 7, padding: "7px 12px", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 9, color: "#00D4FF", letterSpacing: 1 }}>LOG NOW</button>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900,
            color: "#FFD700", letterSpacing: 4,
            textShadow: "0 0 30px rgba(255,215,0,0.5)"
          }}>⬡ MATRIX BREAKER</div>
          <div style={{ color: "#00D4FF", fontSize: 10, letterSpacing: 4, marginTop: 4 }}>
            MANUAL TRADING DIVISION
          </div>
          <div style={{ color: "#6B6B80", fontSize: 12, marginTop: 8 }}>{dateStr}</div>
        </div>

        {/* Live Clock */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 700,
            color: "#F0F0F0", letterSpacing: 2
          }}>{timeStr}</div>
          <div style={{ color: "#6B6B80", fontSize: 10, marginTop: 4 }}>PUERTO RICO UTC-4</div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
            <KillzoneBadge />
          </div>
        </div>

        {/* Killzone Countdown — biggest element */}
        <div style={{
          textAlign: "center", marginBottom: 24,
          padding: "24px 20px",
          background: active ? "rgba(255,215,0,0.06)" : "rgba(0,212,255,0.04)",
          border: `1px solid ${active ? "rgba(255,215,0,0.3)" : "rgba(0,212,255,0.15)"}`,
          borderRadius: 16,
          boxShadow: active ? "0 0 40px rgba(255,215,0,0.15), inset 0 0 40px rgba(255,215,0,0.03)" : "none",
          animation: active ? "goldPulse 2s infinite" : "none"
        }}>
          {active ? (
            <>
              <div style={{ color: "#FFD700", fontSize: 11, letterSpacing: 3, fontFamily: "'Orbitron', monospace" }}>
                🔥 KILLZONE ACTIVE
              </div>
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: 48, fontWeight: 900,
                color: "#FFD700", textShadow: "0 0 40px rgba(255,215,0,0.6)", marginTop: 8
              }}>TRADE</div>
            </>
          ) : (
            <>
              <div style={{ color: "#00D4FF", fontSize: 10, letterSpacing: 3, fontFamily: "'Orbitron', monospace" }}>
                NEXT: {next.name}
              </div>
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: 52, fontWeight: 900,
                color: "#00D4FF", textShadow: "0 0 30px rgba(0,212,255,0.4)", marginTop: 4
              }}>
                {String(next.hours).padStart(2, "0")}:{String(next.mins).padStart(2, "0")}
              </div>
              <div style={{ color: "#6B6B80", fontSize: 11 }}>hours : minutes</div>
            </>
          )}
        </div>

        {/* Bias Pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {BIASES.map(b => <BiasCard key={b.instrument} {...b} />)}
        </div>

        {/* Week Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, marginBottom: 20
        }}>
          {[
            { label: "WIN RATE", value: `${wr}%`, color: "#00FF88" },
            { label: "WEEK PNL", value: `$${pnl}`, color: pnl >= 0 ? "#00FF88" : "#FF3B3B" },
            { label: "STREAK", value: streak > 0 ? `🔥${streak}` : streak < 0 ? `💀${Math.abs(streak)}` : "—", color: "#FFD700" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: 12, textAlign: "center"
            }}>
              <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 18, fontWeight: 700, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <button className="btn-primary" style={{ width: "100%", marginBottom: 12 }}
          onClick={() => onNavigate("checklist")}>
          ▶ START CHECKLIST
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button className="btn-secondary" onClick={() => onNavigate("logger")}>+ LOG TRADE</button>
          <button className="btn-secondary" onClick={() => onNavigate("stats")}>📊 STATS</button>
        </div>
      </div>

      <style>{`
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(255,215,0,0.15), inset 0 0 40px rgba(255,215,0,0.03); }
          50% { box-shadow: 0 0 60px rgba(255,215,0,0.25), inset 0 0 60px rgba(255,215,0,0.06); }
        }
      `}</style>
    </div>
  );
}
