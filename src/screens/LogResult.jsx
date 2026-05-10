import { useState, useEffect } from "react";
import { updateTradeResult } from "../services/notion";

const L = { display: "block", color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 6 };
const INP = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F0F0F0", padding: "12px 14px", fontSize: 16, fontFamily: "'Syne', sans-serif" };
const CARD = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 16 };

function pill(active, col = "#FFD700") {
  return {
    flex: 1, padding: "12px 8px", borderRadius: 8, cursor: "pointer",
    fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 1, fontWeight: 700,
    background: active ? `${col}22` : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? `${col}55` : "rgba(255,255,255,0.08)"}`,
    color: active ? col : "#6B6B80", transition: "all 0.2s"
  };
}

export default function LogResult({ onNavigate }) {
  const [pending, setPending] = useState(null);
  const [outcome, setOutcome] = useState("");          // WIN LOSS BREAKEVEN
  const [pnl, setPnl] = useState("");
  const [afterImg, setAfterImg] = useState(null);
  const [emotion, setEmotion] = useState(7);
  const [rulesFollowed, setRulesFollowed] = useState("");  // YES PARTIAL NO
  const [lesson, setLesson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("mb_pending_trade") || "null");
      setPending(p);
    } catch { setPending(null); }
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setAfterImg({ preview: ev.target.result });
    r.readAsDataURL(f);
  };

  const canSubmit = outcome && rulesFollowed && pnl !== "";

  const submit = async () => {
    if (!canSubmit) return showToast("Pick outcome + rules answered");
    setSubmitting(true);
    const resultData = {
      tradeId: pending?.tradeId,
      outcome, pnl: parseFloat(pnl) || 0,
      afterImg: afterImg?.preview || null,
      emotion, rulesFollowed, lesson,
      closedAt: new Date().toISOString()
    };
    try {
      await updateTradeResult(pending?.tradeId, resultData);
      showToast("Result logged — Notion updated");
    } catch {
      showToast("Saved locally — Notion offline");
    }
    // Update local trade record
    try {
      const trades = JSON.parse(localStorage.getItem("mb_trades") || "[]");
      const idx = trades.findIndex(t => t.tradeId === pending?.tradeId);
      if (idx >= 0) { trades[idx] = { ...trades[idx], ...resultData }; }
      else { trades.push({ ...(pending || {}), ...resultData }); }
      localStorage.setItem("mb_trades", JSON.stringify(trades));
    } catch {}
    localStorage.removeItem("mb_pending_trade");
    setTimeout(() => onNavigate("home"), 1800);
    setSubmitting(false);
  };

  if (!pending) return (
    <div style={{ padding: "24px 20px 100px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 40 }}>LOG RESULT</div>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <div style={{ color: "#6B6B80", fontSize: 14 }}>No pending trade found.</div>
      <div style={{ color: "#3a3a4a", fontSize: 12, marginTop: 8 }}>Log a trade entry first, then return here to record the result.</div>
      <button className="btn-secondary" style={{ marginTop: 24 }} onClick={() => onNavigate("logger")}>GO TO TRADE LOGGER</button>
    </div>
  );

  const dirColor = pending.direction === "LONG" ? "#00FF88" : "#FF3B3B";

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 20, textAlign: "center" }}>LOG RESULT</div>

      {/* Pending trade summary */}
      <div style={{ ...CARD, border: `1px solid ${dirColor}30`, background: `${dirColor}08` }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>OPEN TRADE</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#F0F0F0", fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700 }}>{pending.instrument}</div>
            <div style={{ color: dirColor, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{pending.direction} @ {pending.entry}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#6B6B80", fontSize: 10 }}>SL {pending.sl}</div>
            <div style={{ color: "#6B6B80", fontSize: 10 }}>TP {pending.tp}</div>
            <div style={{ color: "#FFD700", fontSize: 11, marginTop: 2 }}>1:{pending.rr} R:R</div>
          </div>
        </div>
      </div>

      {/* Outcome */}
      <div style={{ marginBottom: 16 }}>
        <label style={L}>OUTCOME</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[["WIN", "#00FF88"], ["LOSS", "#FF3B3B"], ["BREAKEVEN", "#FFD700"]].map(([o, c]) => (
            <button key={o} onClick={() => setOutcome(o)} style={pill(outcome === o, c)}>{o}</button>
          ))}
        </div>
      </div>

      {/* PnL */}
      <div style={{ marginBottom: 16 }}>
        <label style={L}>PNL ($)</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6B6B80", fontSize: 16 }}>$</span>
          <input type="number" step="0.01" placeholder="0.00" value={pnl}
            onChange={e => setPnl(e.target.value)}
            style={{ ...INP, paddingLeft: 28 }} />
        </div>
      </div>

      {/* Screenshot after */}
      <div style={{ marginBottom: 16 }}>
        <label style={L}>RESULT SCREENSHOT (OPTIONAL)</label>
        <label style={{ display: "block", border: "1px dashed rgba(0,212,255,0.3)", borderRadius: 8, padding: 14, textAlign: "center", cursor: "pointer", background: "rgba(0,212,255,0.02)" }}>
          <input type="file" accept="image/*" capture="environment" onChange={handleImg} style={{ display: "none" }} />
          {afterImg ? (
            <img src={afterImg.preview} alt="result" style={{ maxWidth: "100%", borderRadius: 6, maxHeight: 160, objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#3a3a4a", fontSize: 13 }}>📷 Upload result chart</span>
          )}
        </label>
      </div>

      {/* Emotion */}
      <div style={{ marginBottom: 16 }}>
        <label style={L}>EMOTION AFTER — {emotion}/10</label>
        <input type="range" min={1} max={10} value={emotion} onChange={e => setEmotion(+e.target.value)}
          style={{ width: "100%", accentColor: "#FFD700" }} />
        <div style={{ display: "flex", justifyContent: "space-between", color: "#3a3a4a", fontSize: 10, marginTop: 4 }}>
          <span>1 Devastated</span><span>10 Euphoric</span>
        </div>
      </div>

      {/* Rules Followed */}
      <div style={{ marginBottom: 16 }}>
        <label style={L}>FOLLOWED RULES?</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[["YES", "#00FF88"], ["PARTIAL", "#FF8C00"], ["NO", "#FF3B3B"]].map(([r, c]) => (
            <button key={r} onClick={() => setRulesFollowed(r)} style={pill(rulesFollowed === r, c)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Lesson */}
      <div style={{ marginBottom: 20 }}>
        <label style={L}>ONE LESSON (OPTIONAL)</label>
        <textarea value={lesson} onChange={e => setLesson(e.target.value)}
          placeholder="What did this trade teach you?"
          style={{ ...INP, minHeight: 72, resize: "vertical", lineHeight: 1.6 }} />
      </div>

      <button onClick={submit} disabled={!canSubmit || submitting} className="btn-primary"
        style={{ width: "100%", opacity: canSubmit && !submitting ? 1 : 0.4 }}>
        {submitting ? "SAVING..." : "SUBMIT RESULT"}
      </button>

      {toast && (
        <div style={{ position: "fixed", bottom: 100, left: 20, right: 20, background: "#0d1a0d", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 8, padding: 14, textAlign: "center", color: "#00FF88", fontFamily: "'Orbitron', monospace", fontSize: 12, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
