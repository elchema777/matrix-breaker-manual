import { useState } from "react";
import { createTradeEntry } from "../services/notion";

export default function TradeLogger({ preData, onNavigate }) {
  // Merge preData with any AI analyzer prefill
  const aiPrefill = (() => { try { return JSON.parse(localStorage.getItem("mb_ai_prefill") || "null"); } catch { return null; } })();
  const merged = aiPrefill ? { ...aiPrefill, ...preData } : preData;
  if (aiPrefill) localStorage.removeItem("mb_ai_prefill");

  const [instrument, setInstrument] = useState(merged?.instrument || "XAUUSD");
  const [direction, setDirection] = useState(merged?.direction || "LONG");
  const [entry, setEntry] = useState(merged?.entry ? String(merged.entry) : "");
  const [sl,    setSl]    = useState(merged?.sl    ? String(merged.sl)    : "");
  const [tp,    setTp]    = useState(merged?.tp    ? String(merged.tp)    : "");
  const [beforeImg, setBeforeImg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const entryN = parseFloat(entry);
  const slN = parseFloat(sl);
  const tpN = parseFloat(tp);

  const slPips = Math.abs(entryN - slN);
  const tpPips = Math.abs(tpN - entryN);
  const rr = slPips > 0 ? (tpPips / slPips).toFixed(2) : "—";

  const handleImgChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setBeforeImg({ file, preview: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const submit = async () => {
    if (!entry || !sl || !tp) return showToast("⚠️ Fill entry, SL, and TP");
    setSubmitting(true);
    try {
      const tradeId = `MB-${Date.now()}`;
      const data = {
        tradeId, instrument, direction, entry: entryN, sl: slN, tp: tpN, rr,
        beforeImg: beforeImg?.preview || null,
        grade: preData?.checkedCount >= 6 ? "A" : preData?.checkedCount >= 4 ? "B" : "C",
        psych: preData?.psych || 7, emotion: preData?.emotion || "",
        timestamp: new Date().toISOString()
      };
      await createTradeEntry(data);
      // Save pending trade so Home shows "awaiting result" banner
      localStorage.setItem("mb_pending_trade", JSON.stringify({ tradeId, instrument, direction, entry: entryN, sl: slN, tp: tpN, rr }));
      showToast(`Trade logged — ${tradeId}`);
      setTimeout(() => onNavigate("home"), 2000);
    } catch (e) {
      showToast("Notion offline — saved locally");
      const saved = JSON.parse(localStorage.getItem("mb_trades") || "[]");
      const tradeId = `MB-${Date.now()}`;
      const newTrade = { tradeId, instrument, direction, entry: entryN, sl: slN, tp: tpN, rr, beforeImg: beforeImg?.preview, timestamp: new Date().toISOString() };
      saved.push(newTrade);
      localStorage.setItem("mb_trades", JSON.stringify(saved));
      localStorage.setItem("mb_pending_trade", JSON.stringify({ tradeId, instrument, direction, entry: entryN, sl: slN, tp: tpN, rr }));
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 20, textAlign: "center"
      }}>LOG TRADE</div>

      {/* Instrument */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>INSTRUMENT</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["XAUUSD", "GER40", "NAS100"].map(inst => (
            <button key={inst} onClick={() => setInstrument(inst)}
              style={pillBtn(instrument === inst)}>{inst}</button>
          ))}
        </div>
      </div>

      {/* Direction */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>DIRECTION</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setDirection("LONG")} style={{
            ...pillBtn(direction === "LONG"),
            color: direction === "LONG" ? "#050508" : "#00FF88",
            background: direction === "LONG" ? "#00FF88" : "rgba(0,255,136,0.06)",
            border: "1px solid rgba(0,255,136,0.3)"
          }}>LONG ▲</button>
          <button onClick={() => setDirection("SHORT")} style={{
            ...pillBtn(direction === "SHORT"),
            color: direction === "SHORT" ? "#050508" : "#FF3B3B",
            background: direction === "SHORT" ? "#FF3B3B" : "rgba(255,59,59,0.06)",
            border: "1px solid rgba(255,59,59,0.3)"
          }}>SHORT ▼</button>
        </div>
      </div>

      {/* Price Inputs */}
      {[
        { label: "ENTRY PRICE", val: entry, set: setEntry },
        { label: "STOP LOSS", val: sl, set: setSl },
        { label: "TAKE PROFIT", val: tp, set: setTp },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 12 }}>
          <label style={labelStyle}>{f.label}</label>
          <input type="number" step="0.01" placeholder="0.00" value={f.val}
            onChange={e => f.set(e.target.value)} style={inputStyle} />
        </div>
      ))}

      {/* RR Display */}
      {rr !== "—" && (
        <div style={{
          background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ color: "#6B6B80", fontSize: 12 }}>Risk:Reward</span>
          <span style={{
            fontFamily: "'Orbitron', monospace", fontSize: 18,
            color: parseFloat(rr) >= 2 ? "#00FF88" : "#FF8C00", fontWeight: 700
          }}>1:{rr}</span>
        </div>
      )}

      {/* Screenshot Before */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>CHART SCREENSHOT (BEFORE)</label>
        <label style={{
          display: "block", border: "1px dashed rgba(255,215,0,0.3)",
          borderRadius: 8, padding: 16, textAlign: "center", cursor: "pointer",
          background: "rgba(255,255,255,0.02)"
        }}>
          <input type="file" accept="image/*" capture="environment"
            onChange={handleImgChange} style={{ display: "none" }} />
          {beforeImg ? (
            <img src={beforeImg.preview} alt="before"
              style={{ maxWidth: "100%", borderRadius: 6, maxHeight: 200, objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#6B6B80", fontSize: 13 }}>📷 Tap to upload chart screenshot</span>
          )}
        </label>
      </div>

      <button onClick={submit} disabled={submitting} className="btn-primary"
        style={{ width: "100%", opacity: submitting ? 0.6 : 1 }}>
        {submitting ? "LOGGING..." : "LOG TRADE"}
      </button>

      {toast && (
        <div style={{
          position: "fixed", bottom: 100, left: 20, right: 20,
          background: "#0d1a0d", border: "1px solid rgba(0,255,136,0.4)",
          borderRadius: 8, padding: 14, textAlign: "center",
          color: "#00FF88", fontFamily: "'Orbitron', monospace", fontSize: 13, zIndex: 200
        }}>{toast}</div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block", color: "#6B6B80", fontSize: 9,
  letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 6
};

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
  color: "#F0F0F0", padding: "12px 14px", fontSize: 16,
  fontFamily: "'Syne', sans-serif"
};

const pillBtn = active => ({
  flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer",
  fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1, fontWeight: 700,
  background: active ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
  border: `1px solid ${active ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.08)"}`,
  color: active ? "#FFD700" : "#6B6B80",
  boxShadow: active ? "0 0 12px rgba(255,215,0,0.2)" : "none",
  transition: "all 0.2s"
});
