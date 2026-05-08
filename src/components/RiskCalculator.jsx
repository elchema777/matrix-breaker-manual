import { useState } from "react";

const XAUUSD_PIP = 0.01;
const XAUUSD_LOT_VALUE = 100;

export default function RiskCalculator({ instrument = "XAUUSD" }) {
  const [account, setAccount] = useState("");

  const acc = parseFloat(account) || 0;
  const risk1 = acc * 0.01;
  const risk05 = acc * 0.005;

  const lots1 = instrument === "XAUUSD" ? (risk1 / (20 * XAUUSD_LOT_VALUE)).toFixed(2) : "—";
  const lots05 = instrument === "XAUUSD" ? (risk05 / (20 * XAUUSD_LOT_VALUE)).toFixed(2) : "—";

  return (
    <div style={{
      background: "rgba(255,215,0,0.06)",
      border: "1px solid rgba(255,215,0,0.2)",
      borderRadius: 10, padding: 16
    }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 2, color: "#FFD700", marginBottom: 10 }}>
        RISK CALCULATOR
      </div>
      <input
        type="number"
        placeholder="Account size ($)"
        value={account}
        onChange={e => setAccount(e.target.value)}
        style={{
          width: "100%", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,215,0,0.2)", borderRadius: 6,
          color: "#F0F0F0", padding: "8px 12px", fontSize: 14,
          fontFamily: "'Syne', sans-serif", marginBottom: 10
        }}
      />
      {acc > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "rgba(0,255,136,0.08)", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6B6B80", fontSize: 10, marginBottom: 4 }}>1% RISK</div>
            <div style={{ color: "#00FF88", fontSize: 16, fontWeight: 700 }}>${risk1.toFixed(0)}</div>
            <div style={{ color: "#6B6B80", fontSize: 11 }}>{lots1} lots</div>
          </div>
          <div style={{ background: "rgba(255,140,0,0.08)", borderRadius: 8, padding: 10 }}>
            <div style={{ color: "#6B6B80", fontSize: 10, marginBottom: 4 }}>0.5% RISK</div>
            <div style={{ color: "#FF8C00", fontSize: 16, fontWeight: 700 }}>${risk05.toFixed(0)}</div>
            <div style={{ color: "#6B6B80", fontSize: 11 }}>{lots05} lots</div>
          </div>
        </div>
      )}
    </div>
  );
}
