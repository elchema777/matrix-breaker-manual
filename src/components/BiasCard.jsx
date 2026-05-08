export default function BiasCard({ instrument, bias, color }) {
  return (
    <div style={{
      flex: 1, background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: 8, padding: "10px 8px",
      textAlign: "center"
    }}>
      <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>{instrument}</div>
      <div style={{
        color, fontSize: 12, fontWeight: 700, marginTop: 4,
        fontFamily: "'Orbitron', monospace", letterSpacing: 1
      }}>{bias}</div>
    </div>
  );
}
