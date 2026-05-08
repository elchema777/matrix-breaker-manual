export default function GradeIndicator({ checked }) {
  let grade, label, color, glow;
  if (checked <= 3) {
    grade = "C"; label = "DO NOT TRADE"; color = "#FF3B3B"; glow = "0 0 20px rgba(255,59,59,0.4)";
  } else if (checked <= 5) {
    grade = "B"; label = "CAUTION"; color = "#FF8C00"; glow = "0 0 20px rgba(255,140,0,0.4)";
  } else {
    grade = "A"; label = "HIGH PROBABILITY"; color = "#00FF88"; glow = "0 0 20px rgba(0,255,136,0.4)";
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: 10, padding: "12px 16px"
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: `2px solid ${color}`, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Orbitron', monospace", fontSize: 22,
        fontWeight: 700, color, boxShadow: glow,
        animation: checked <= 3 ? "pulse 1.5s infinite" : "none"
      }}>{grade}</div>
      <div>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color, letterSpacing: 2 }}>{label}</div>
        <div style={{ color: "#6B6B80", fontSize: 12, marginTop: 2 }}>{checked}/8 confluences</div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
