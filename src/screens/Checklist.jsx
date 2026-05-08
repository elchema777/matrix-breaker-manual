import { useState } from "react";
import GradeIndicator from "../components/GradeIndicator";
import RiskCalculator from "../components/RiskCalculator";

const INSTRUMENTS = ["XAUUSD", "GER40", "NAS100"];

const CONFLUENCES = [
  "Liquidity Sweep",
  "Displacement >1 ATR",
  "Fair Value Gap (FVG)",
  "Order Block (OB)",
  "Market Structure Shift (MSS)",
  "DXY Direction Confirmed",
  "Killzone Active",
  "No Red News Event",
];

const EMOTIONS = [
  { label: "😌 Calm", key: "calm" },
  { label: "💪 Confident", key: "confident" },
  { label: "😰 Anxious", key: "anxious" },
  { label: "🔥 FOMO", key: "fomo" },
  { label: "😴 Tired", key: "tired" },
  { label: "😤 Revenge", key: "revenge" },
];

export default function Checklist({ onNavigate, onTradeApproved }) {
  const [instrument, setInstrument] = useState("XAUUSD");
  const [checked, setChecked] = useState({});
  const [psych, setPsych] = useState(7);
  const [emotion, setEmotion] = useState("");

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const gradeOK = checkedCount >= 4;
  const psychOK = psych >= 5;
  const canTrade = gradeOK && psychOK;

  const toggle = key => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const psychEmoji = psych <= 3 ? "😰 Not ready" : psych <= 6 ? "😐 Caution" : "💪 Ready";

  return (
    <div style={{ padding: "24px 20px 100px", minHeight: "100vh" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 20, textAlign: "center"
      }}>PRE-TRADE CHECKLIST</div>

      {/* Step 1 — Instrument */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#6B6B80", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          STEP 1 — INSTRUMENT
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {INSTRUMENTS.map(inst => (
            <button key={inst} onClick={() => setInstrument(inst)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1, fontWeight: 700,
              background: instrument === inst ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${instrument === inst ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: instrument === inst ? "#FFD700" : "#6B6B80",
              boxShadow: instrument === inst ? "0 0 12px rgba(255,215,0,0.2)" : "none",
              transition: "all 0.2s"
            }}>{inst}</button>
          ))}
        </div>
      </div>

      {/* Step 2 — ICT Confluences */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#6B6B80", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          STEP 2 — ICT CONFLUENCES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CONFLUENCES.map((c, i) => (
            <button key={i} onClick={() => toggle(c)} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: checked[c] ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${checked[c] ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "12px 14px", cursor: "pointer",
              transition: "all 0.15s"
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 4,
                border: `2px solid ${checked[c] ? "#00FF88" : "#3a3a4a"}`,
                background: checked[c] ? "#00FF88" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.15s"
              }}>
                {checked[c] && <span style={{ fontSize: 13, color: "#050508", fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ color: checked[c] ? "#F0F0F0" : "#6B6B80", fontSize: 13, textAlign: "left" }}>{c}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <GradeIndicator checked={checkedCount} />
        </div>
      </div>

      {/* Step 3 — Psychology */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#6B6B80", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          STEP 3 — PSYCHOLOGY
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: 16
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ color: "#F0F0F0", fontSize: 14 }}>{psychEmoji}</span>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: 18, color: psych >= 7 ? "#00FF88" : psych >= 5 ? "#FF8C00" : "#FF3B3B", fontWeight: 700 }}>
              {psych}/10
            </span>
          </div>
          <input type="range" min={1} max={10} value={psych} onChange={e => setPsych(+e.target.value)}
            style={{ width: "100%", accentColor: psych >= 7 ? "#00FF88" : psych >= 5 ? "#FF8C00" : "#FF3B3B", marginBottom: 12 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EMOTIONS.map(e => (
              <button key={e.key} onClick={() => setEmotion(e.key)} style={{
                padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12,
                background: emotion === e.key ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${emotion === e.key ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: emotion === e.key ? "#FFD700" : "#6B6B80", transition: "all 0.15s"
              }}>{e.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4 — Risk */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "#6B6B80", fontSize: 10, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          STEP 4 — RISK SIZE
        </div>
        <RiskCalculator instrument={instrument} />
      </div>

      {/* Approve Button */}
      <button
        disabled={!canTrade}
        onClick={() => onTradeApproved && onTradeApproved({ instrument, checkedCount, psych, emotion })}
        style={{
          width: "100%", padding: "16px",
          borderRadius: 10, border: "none", cursor: canTrade ? "pointer" : "not-allowed",
          fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: 2,
          background: canTrade ? "linear-gradient(135deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.05)",
          color: canTrade ? "#050508" : "#3a3a4a",
          boxShadow: canTrade ? "0 0 30px rgba(255,215,0,0.4)" : "none",
          transition: "all 0.3s"
        }}>
        {canTrade ? "✅ APPROVE — LOG TRADE" : "⛔ CONDITIONS NOT MET"}
      </button>
    </div>
  );
}
