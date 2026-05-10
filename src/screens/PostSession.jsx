import { useState, useEffect } from "react";

function todayKey() { return new Date().toISOString().slice(0, 10); }
function loadTrades() {
  try { return JSON.parse(localStorage.getItem("mb_trades") || "[]"); } catch { return []; }
}

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    color: ["#FFD700", "#00FF88", "#00D4FF", "#FF8C00", "#FFFFFF"][i % 5],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 2.2 + Math.random() * 1.5,
    size: 6 + Math.random() * 6,
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "100vh", pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position: "absolute", top: -12, left: `${p.left}%`, width: p.size, height: p.size, borderRadius: 2, background: p.color, animation: `cfFall ${p.dur}s ${p.delay}s linear forwards`, opacity: 0.9 }} />
      ))}
      <style>{`@keyframes cfFall { to { transform: translateY(105vh) rotate(540deg); opacity: 0; } }`}</style>
    </div>
  );
}

function autoClose(rules, pnl) {
  const won = pnl > 0;
  const followed = rules === "Fully";
  const broke = rules === "Broke rules";
  if (followed && won)  return { msg: "Well executed. Respect the edge. Rest well.", col: "#00FF88" };
  if (followed && !won) return { msg: "Loss following rules = good trading. The edge works long term. Rest.", col: "#FFD700" };
  if (broke && won)     return { msg: "Win but broke rules. Get lucky or get consistent — choose one. Review.", col: "#FF8C00" };
  if (broke && !won)    return { msg: "Note what broke. Write it down. Fix tomorrow. Rest — self-criticism helps nobody.", col: "#FF3B3B" };
  return { msg: "Session complete. Review tomorrow. Rest well.", col: "#6B6B80" };
}

export default function PostSession({ onNavigate }) {
  const [trades] = useState(() => {
    const all = loadTrades();
    const today = todayKey();
    return all.filter(t => (t.timestamp || t.closedAt || "").startsWith(today));
  });
  const [allTrades] = useState(loadTrades);

  const totalPnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
  const wins  = trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;
  const losses = trades.filter(t => (parseFloat(t.pnl) || 0) < 0).length;
  const bes   = trades.length - wins - losses;

  const [feel,   setFeel]   = useState("");
  const [rules,  setRules]  = useState("");
  const [notes,  setNotes]  = useState("");
  const [tmrw,   setTmrw]   = useState("");
  const [submitting, setSub] = useState(false);
  const [done,   setDone]   = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [toast,  setToast]  = useState("");

  // Check already submitted today
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(`mb_sessions:${todayKey()}`) || "null");
      if (s?.submitted) setDone(true);
    } catch {}
  }, []);

  const canSubmit = feel && rules;
  const close = rules && feel ? autoClose(rules, totalPnl) : null;

  const submit = () => {
    if (!canSubmit) return;
    setSub(true);
    const payload = { feel, rules, notes, tmrw, totalPnl, trades: trades.length, wins, losses, bes, submitted: true, submittedAt: new Date().toISOString() };
    localStorage.setItem(`mb_sessions:${todayKey()}`, JSON.stringify(payload));
    setToast("Session logged. Rest well.");
    setDone(true);
    if (totalPnl > 0) { setConfetti(true); setTimeout(() => setConfetti(false), 4000); }
    setTimeout(() => onNavigate("home"), 2200);
    setSub(false);
  };

  const FEEL_OPTS = ["Sharp", "Solid", "Ok", "Struggled", "Bad day"];
  const RULES_OPTS = ["Fully", "Mostly", "Broke rules"];
  const feelColor = f => ({ Sharp: "#00FF88", Solid: "#00D4FF", Ok: "#FFD700", Struggled: "#FF8C00", "Bad day": "#FF3B3B" }[f] || "#6B6B80");

  if (done && !confetti) return (
    <div style={{ padding: "24px 20px 100px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 40 }}>POST-SESSION</div>
      <div style={{ fontSize: 48 }}>✓</div>
      <div style={{ color: "#00FF88", fontFamily: "'Orbitron', monospace", fontSize: 13, marginTop: 12 }}>SESSION LOGGED</div>
      <div style={{ color: "#6B6B80", fontSize: 12, marginTop: 8 }}>Mental loop closed. Rest well.</div>
      <button className="btn-secondary" style={{ marginTop: 24 }} onClick={() => onNavigate("home")}>HOME</button>
    </div>
  );

  return (
    <div style={{ padding: "24px 20px 120px" }}>
      {confetti && <Confetti />}
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 4, textAlign: "center" }}>POST-SESSION</div>
      <div style={{ color: "#3a3a4a", fontSize: 10, textAlign: "center", marginBottom: 20, letterSpacing: 2 }}>3 MINUTE DEBRIEF · CLOSE THE LOOP</div>

      {/* Session Summary */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 12 }}>SESSION SUMMARY (AUTO)</div>
        {trades.length === 0 ? (
          <div style={{ color: "#3a3a4a", fontSize: 12, textAlign: "center" }}>No trades logged today</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {[
                { l: "TRADES", v: trades.length, c: "#F0F0F0" },
                { l: "SESSION PNL", v: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`, c: totalPnl >= 0 ? "#00FF88" : "#FF3B3B" },
              ].map(s => (
                <div key={s.l} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>{s.l}</div>
                  <div style={{ color: s.c, fontFamily: "'Orbitron', monospace", fontSize: 20, fontWeight: 700, marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["WIN", wins, "#00FF88"], ["LOSS", losses, "#FF3B3B"], ["BE", bes, "#FFD700"]].map(([l, v, c]) => (
                <div key={l} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ color: "#3a3a4a", fontSize: 8, letterSpacing: 1, fontFamily: "'Orbitron', monospace" }}>{l}</div>
                  <div style={{ color: c, fontSize: 18, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Session Feel */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>SESSION FEEL</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FEEL_OPTS.map(f => {
            const c = feelColor(f);
            const active = feel === f;
            return (
              <button key={f} onClick={() => setFeel(f)} style={{ padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1, background: active ? `${c}20` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `${c}55` : "rgba(255,255,255,0.08)"}`, color: active ? c : "#6B6B80", transition: "all 0.2s" }}>
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Followed */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>FOLLOWED RULES?</div>
        <div style={{ display: "flex", gap: 8 }}>
          {RULES_OPTS.map((r, i) => {
            const cols = ["#00FF88", "#FFD700", "#FF3B3B"];
            const active = rules === r;
            return (
              <button key={r} onClick={() => setRules(r)} style={{ flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 1, fontWeight: 700, background: active ? `${cols[i]}20` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `${cols[i]}55` : "rgba(255,255,255,0.08)"}`, color: active ? cols[i] : "#6B6B80" }}>
                {r.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* What happened */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>WHAT HAPPENED? (OPTIONAL)</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="1-2 sentences about today's session..."
          style={{ width: "100%", minHeight: 64, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F0F0F0", padding: 12, fontSize: 13, fontFamily: "'Syne', sans-serif", resize: "vertical" }} />
      </div>

      {/* Do differently */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>ONE THING DIFFERENTLY TOMORROW</div>
        <input type="text" value={tmrw} onChange={e => setTmrw(e.target.value)} placeholder="Keep it short — one specific thing"
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F0F0F0", padding: "12px 14px", fontSize: 14, fontFamily: "'Syne', sans-serif" }} />
      </div>

      {/* Psychological Close */}
      {close && (
        <div style={{ background: `${close.col}10`, border: `1px solid ${close.col}30`, borderRadius: 10, padding: 16, marginBottom: 20, textAlign: "center" }}>
          <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>PSYCHOLOGICAL CLOSE</div>
          <div style={{ color: close.col, fontSize: 14, lineHeight: 1.8 }}>{close.msg}</div>
        </div>
      )}

      <button className="btn-primary" onClick={submit} disabled={!canSubmit || submitting}
        style={{ width: "100%", opacity: canSubmit ? 1 : 0.4 }}>
        {submitting ? "SAVING..." : "CLOSE THIS SESSION"}
      </button>

      {toast && (
        <div style={{ position: "fixed", bottom: 100, left: 20, right: 20, background: "#0d1a0d", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 8, padding: 14, textAlign: "center", color: "#00FF88", fontFamily: "'Orbitron', monospace", fontSize: 12, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
