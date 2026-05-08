import { useState, useEffect } from "react";
import { getAllTrades } from "../services/notion";

function loadLocalTrades() {
  try { return JSON.parse(localStorage.getItem("mb_trades") || "[]"); }
  catch { return []; }
}

function CalendarView({ trades }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const dayMap = {};
  trades.forEach(t => {
    if (!t.timestamp) return;
    const d = new Date(t.timestamp).getDate();
    if (!dayMap[d]) dayMap[d] = { pnl: 0, count: 0 };
    dayMap[d].pnl += parseFloat(t.pnl) || 0;
    dayMap[d].count++;
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", color: "#6B6B80", fontSize: 10, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const data = dayMap[day];
          const isToday = day === now.getDate();
          return (
            <div key={day} style={{
              aspectRatio: "1", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
              background: data ? (data.pnl > 0 ? "rgba(0,255,136,0.15)" : "rgba(255,59,59,0.15)") : "rgba(255,255,255,0.03)",
              border: isToday ? "1px solid rgba(255,215,0,0.5)" : "1px solid rgba(255,255,255,0.05)",
              fontSize: 11, color: data ? (data.pnl > 0 ? "#00FF88" : "#FF3B3B") : "#3a3a4a",
              fontWeight: isToday ? 700 : 400
            }}>{day}</div>
          );
        })}
      </div>
    </div>
  );
}

function TradeModal({ trade, onClose }) {
  if (!trade) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(5,5,8,0.9)", zIndex: 300,
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }} onClick={onClose}>
      <div style={{
        background: "#0d0d14", border: "1px solid rgba(255,215,0,0.2)",
        borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 600,
        maxHeight: "80vh", overflowY: "auto"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, color: "#FFD700", marginBottom: 16 }}>
          {trade.instrument} — {trade.direction}
        </div>
        {[
          ["Date", trade.timestamp ? new Date(trade.timestamp).toLocaleString() : "—"],
          ["Entry", trade.entry],
          ["Stop Loss", trade.sl],
          ["Take Profit", trade.tp],
          ["R:R", `1:${trade.rr}`],
          ["Grade", trade.grade],
          ["Psych Score", trade.psych],
          ["P&L", trade.pnl ? `$${trade.pnl}` : "—"],
          ["Outcome", trade.outcome || "—"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "#6B6B80", fontSize: 12 }}>{k}</span>
            <span style={{ color: "#F0F0F0", fontSize: 12, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        {trade.beforeImg && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: "#6B6B80", fontSize: 10, marginBottom: 6 }}>BEFORE</div>
            <img src={trade.beforeImg} alt="before" style={{ width: "100%", borderRadius: 8 }} />
          </div>
        )}
        <button onClick={onClose} className="btn-secondary" style={{ width: "100%", marginTop: 16 }}>CLOSE</button>
      </div>
    </div>
  );
}

export default function Journal() {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState({ instrument: "all", result: "all" });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const notionTrades = await getAllTrades();
        if (notionTrades?.length) { setTrades(notionTrades); }
        else { setTrades(loadLocalTrades()); }
      } catch {
        setTrades(loadLocalTrades());
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = trades.filter(t => {
    if (filter.instrument !== "all" && t.instrument !== filter.instrument) return false;
    if (filter.result === "win" && !((parseFloat(t.pnl) || 0) > 0)) return false;
    if (filter.result === "loss" && !((parseFloat(t.pnl) || 0) < 0)) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 20, textAlign: "center"
      }}>TRADE JOURNAL</div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
        {["list", "calendar"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 16px", borderRadius: 6, cursor: "pointer",
            fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 2,
            background: view === v ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${view === v ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: view === v ? "#FFD700" : "#6B6B80"
          }}>{v.toUpperCase()}</button>
        ))}
      </div>

      {/* Filters */}
      {view === "list" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["all", "XAUUSD", "GER40", "NAS100"].map(f => (
            <button key={f} onClick={() => setFilter(p => ({ ...p, instrument: f }))} style={{
              padding: "5px 10px", borderRadius: 5, cursor: "pointer",
              fontFamily: "'Orbitron', monospace", fontSize: 9,
              background: filter.instrument === f ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${filter.instrument === f ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: filter.instrument === f ? "#00D4FF" : "#6B6B80"
            }}>{f}</button>
          ))}
          {["all", "win", "loss"].map(f => (
            <button key={f} onClick={() => setFilter(p => ({ ...p, result: f }))} style={{
              padding: "5px 10px", borderRadius: 5, cursor: "pointer",
              fontFamily: "'Orbitron', monospace", fontSize: 9,
              background: filter.result === f ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${filter.result === f ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: filter.result === f ? "#00FF88" : "#6B6B80"
            }}>{f.toUpperCase()}</button>
          ))}
        </div>
      )}

      {view === "calendar" ? (
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: 16
        }}>
          <CalendarView trades={trades} />
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", color: "#6B6B80", padding: 40 }}>Loading trades...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#6B6B80", padding: 40 }}>
          <div style={{ fontSize: 40 }}>📓</div>
          <div style={{ marginTop: 8 }}>No trades found — log your first trade</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((t, i) => {
            const pnl = parseFloat(t.pnl) || 0;
            const win = pnl > 0;
            return (
              <button key={i} onClick={() => setSelected(t)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "left"
              }}>
                <div>
                  <div style={{ color: "#F0F0F0", fontSize: 13, fontWeight: 600 }}>
                    {t.instrument} · {t.direction}
                  </div>
                  <div style={{ color: "#6B6B80", fontSize: 11, marginTop: 3 }}>
                    {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : "—"} · Grade {t.grade || "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    color: win ? "#00FF88" : pnl < 0 ? "#FF3B3B" : "#6B6B80",
                    fontSize: 16, fontWeight: 700
                  }}>{t.pnl ? `${win ? "+" : ""}$${pnl.toFixed(0)}` : "—"}</div>
                  <div style={{ color: "#6B6B80", fontSize: 10, marginTop: 2 }}>
                    1:{t.rr || "—"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <TradeModal trade={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
