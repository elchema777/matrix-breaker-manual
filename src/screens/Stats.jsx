import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function loadLocalTrades() {
  try { return JSON.parse(localStorage.getItem("mb_trades") || "[]"); }
  catch { return []; }
}

function WinRateGauge({ value }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 60 ? "#00FF88" : value >= 45 ? "#FF8C00" : "#FF3B3B";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 65 65)" style={{ transition: "stroke-dasharray 1s ease" }} />
        <text x={65} y={60} textAnchor="middle" fill={color}
          style={{ fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 700 }}>{value}%</text>
        <text x={65} y={76} textAnchor="middle" fill="#6B6B80" style={{ fontSize: 11 }}>WIN RATE</text>
      </svg>
    </div>
  );
}

export default function Stats() {
  const [range, setRange] = useState("week");
  const [trades, setTrades] = useState([]);

  useEffect(() => { setTrades(loadLocalTrades()); }, []);

  const wins = trades.filter(t => t.outcome === "win" || (parseFloat(t.pnl) > 0)).length;
  const wr = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
  const totalPnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);

  const pnlData = trades.slice(-10).map((t, i) => ({
    n: i + 1,
    pnl: parseFloat(t.pnl) || 0,
    cum: trades.slice(0, i + 1).reduce((s, x) => s + (parseFloat(x.pnl) || 0), 0)
  }));

  const sessionData = [
    { name: "London", trades: trades.filter(t => t.session === "london").length },
    { name: "NY", trades: trades.filter(t => t.session === "ny").length },
    { name: "Overlap", trades: trades.filter(t => t.session === "overlap").length },
  ];

  const gradeData = [
    { name: "A", wr: 72, trades: trades.filter(t => t.grade === "A").length },
    { name: "B", wr: 55, trades: trades.filter(t => t.grade === "B").length },
    { name: "C", wr: 0, trades: trades.filter(t => t.grade === "C").length },
  ];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 20, textAlign: "center"
      }}>PERFORMANCE</div>

      {/* Range selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
        {["week", "month", "all"].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: "6px 16px", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 2,
            background: range === r ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${range === r ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: range === r ? "#FFD700" : "#6B6B80"
          }}>{r.toUpperCase()}</button>
        ))}
      </div>

      {/* Win Rate Gauge + PnL */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16,
          display: "flex", justifyContent: "center"
        }}>
          <WinRateGauge value={wr} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "TOTAL PNL", val: `$${totalPnl.toFixed(0)}`, color: totalPnl >= 0 ? "#00FF88" : "#FF3B3B" },
            { label: "TRADES", val: trades.length, color: "#FFD700" },
            { label: "WINS", val: wins, color: "#00FF88" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "10px 12px"
            }}>
              <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 20, fontWeight: 700 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PnL Chart */}
      {pnlData.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={sectionTitle}>CUMULATIVE P&L</div>
          <div style={chartCard}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={pnlData}>
                <XAxis dataKey="n" tick={{ fill: "#6B6B80", fontSize: 10 }} />
                <YAxis tick={{ fill: "#6B6B80", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,215,0,0.2)", color: "#F0F0F0" }} />
                <Line type="monotone" dataKey="cum" stroke="#FFD700" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Grade Analysis */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionTitle}>GRADE WIN RATES</div>
        <div style={{ display: "flex", gap: 8 }}>
          {gradeData.map(g => (
            <div key={g.name} style={{
              flex: 1, background: "rgba(255,255,255,0.03)",
              border: `1px solid ${g.name === "A" ? "rgba(0,255,136,0.2)" : g.name === "B" ? "rgba(255,140,0,0.2)" : "rgba(255,59,59,0.2)"}`,
              borderRadius: 8, padding: 12, textAlign: "center"
            }}>
              <div style={{
                fontFamily: "'Orbitron', monospace", fontSize: 22, fontWeight: 900,
                color: g.name === "A" ? "#00FF88" : g.name === "B" ? "#FF8C00" : "#FF3B3B"
              }}>{g.name}</div>
              <div style={{ color: "#F0F0F0", fontSize: 16, fontWeight: 700, marginTop: 4 }}>{g.wr}%</div>
              <div style={{ color: "#6B6B80", fontSize: 10 }}>{g.trades} trades</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session breakdown */}
      <div style={{ marginBottom: 20 }}>
        <div style={sectionTitle}>SESSION BREAKDOWN</div>
        <div style={chartCard}>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={sessionData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: "#6B6B80", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6B6B80", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,215,0,0.2)", color: "#F0F0F0" }} />
              <Bar dataKey="trades">
                {sessionData.map((_, i) => (
                  <Cell key={i} fill={["#00D4FF", "#00FF88", "#FFD700"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {trades.length === 0 && (
        <div style={{ textAlign: "center", color: "#6B6B80", marginTop: 40 }}>
          <div style={{ fontSize: 40 }}>📊</div>
          <div style={{ marginTop: 8 }}>No trades yet — log your first trade</div>
        </div>
      )}
    </div>
  );
}

const sectionTitle = {
  color: "#6B6B80", fontSize: 9, letterSpacing: 2,
  fontFamily: "'Orbitron', monospace", marginBottom: 10
};

const chartCard = {
  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10, padding: 12
};
