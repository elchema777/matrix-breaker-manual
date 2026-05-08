import { useState } from "react";

const IMPACT_COLORS = { high: "#FF3B3B", medium: "#FF8C00", low: "#FFD700" };
const IMPACT_LABELS = { high: "🔴 HIGH IMPACT", medium: "🟠 MEDIUM", low: "🟡 LOW" };

const SAMPLE_EVENTS = [
  { time: "08:30", name: "Non-Farm Payrolls", impact: "high", currency: "USD", actual: "", forecast: "180K" },
  { time: "08:30", name: "CPI Month-over-Month", impact: "high", currency: "USD", actual: "", forecast: "0.3%" },
  { time: "10:00", name: "ISM Manufacturing PMI", impact: "medium", currency: "USD", actual: "", forecast: "49.8" },
  { time: "14:00", name: "FOMC Meeting Minutes", impact: "high", currency: "USD", actual: "", forecast: "" },
  { time: "15:30", name: "Crude Oil Inventories", impact: "medium", currency: "USD", actual: "", forecast: "-2.1M" },
];

function getPRTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }));
}

function toMin(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function BlackoutCalc() {
  const [eventTime, setEventTime] = useState("");
  const [result, setResult] = useState(null);

  const calc = () => {
    if (!eventTime) return;
    const [h, m] = eventTime.split(":").map(Number);
    const before = new Date();
    before.setHours(h, m - 30, 0);
    const after = new Date();
    after.setHours(h, m + 30, 0);
    const fmt = d => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    setResult({ before: fmt(before), after: fmt(after) });
  };

  return (
    <div style={{
      background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)",
      borderRadius: 10, padding: 16, marginTop: 20
    }}>
      <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
        BLACKOUT CALCULATOR
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)}
          style={{
            flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,59,59,0.3)",
            borderRadius: 6, color: "#F0F0F0", padding: "8px 12px", fontSize: 14
          }} />
        <button onClick={calc} className="btn-secondary" style={{ padding: "8px 14px" }}>CALC</button>
      </div>
      {result && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <div style={{ color: "#FF3B3B", fontFamily: "'Orbitron', monospace", fontSize: 11 }}>NO-TRADE WINDOW</div>
          <div style={{ color: "#F0F0F0", fontSize: 18, fontWeight: 700, marginTop: 4 }}>
            {result.before} → {result.after}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewsFeed() {
  const [filter, setFilter] = useState("all");
  const now = getPRTime();
  const curMin = now.getHours() * 60 + now.getMinutes();

  const filtered = SAMPLE_EVENTS.filter(e => filter === "all" || e.impact === filter);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 4, textAlign: "center"
      }}>ECONOMIC EVENTS</div>
      <div style={{ color: "#6B6B80", fontSize: 11, textAlign: "center", marginBottom: 20 }}>Puerto Rico Time (UTC-4)</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
        {["all", "high", "medium", "low"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 12px", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 1,
            background: filter === f ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${filter === f ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: filter === f ? "#FFD700" : "#6B6B80"
          }}>{f.toUpperCase()}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {filtered.map((ev, i) => {
          const evMin = toMin(ev.time);
          const past = evMin + 30 < curMin;
          const blackout = Math.abs(evMin - curMin) <= 30;
          return (
            <div key={i} style={{
              background: blackout ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${blackout ? "rgba(255,59,59,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, padding: 14, opacity: past ? 0.5 : 1
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#F0F0F0", fontSize: 14, fontWeight: 600 }}>{ev.name}</div>
                  <div style={{ color: IMPACT_COLORS[ev.impact], fontSize: 11, marginTop: 2 }}>
                    {IMPACT_LABELS[ev.impact]}
                  </div>
                  {ev.forecast && (
                    <div style={{ color: "#6B6B80", fontSize: 11, marginTop: 2 }}>Forecast: {ev.forecast}</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 16, color: "#FFD700" }}>{ev.time}</div>
                  <div style={{ color: "#6B6B80", fontSize: 10 }}>PR TIME</div>
                </div>
              </div>
              {blackout && (
                <div style={{
                  marginTop: 8, background: "rgba(255,59,59,0.15)", borderRadius: 6,
                  padding: "6px 10px", color: "#FF3B3B", fontSize: 11,
                  fontFamily: "'Orbitron', monospace", letterSpacing: 1
                }}>⚠️ BLACKOUT WINDOW ACTIVE — NO TRADES</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)",
        borderRadius: 8, padding: 12
      }}>
        <div style={{ color: "#FF3B3B", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🔴 HIGH IMPACT RULE</div>
        <div style={{ color: "#6B6B80", fontSize: 12 }}>No trades 30 minutes before and 30 minutes after any red event</div>
        <div style={{ color: "#6B6B80", fontSize: 11, marginTop: 4 }}>
          For live calendar: ForexFactory.com → filter by impact + currency
        </div>
      </div>

      <BlackoutCalc />
    </div>
  );
}
