export default function BottomNav({ active, onNavigate }) {
  const tabs = [
    { id: "home",      icon: "⬡", label: "Home" },
    { id: "checklist", icon: "✅", label: "Check" },
    { id: "logger",    icon: "+",  label: "Log" },
    { id: "stats",     icon: "📊", label: "Stats" },
    { id: "journal",   icon: "📓", label: "Journal" },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(5,5,8,0.95)",
      borderTop: "1px solid rgba(255,215,0,0.15)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      zIndex: 100,
      backdropFilter: "blur(20px)"
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onNavigate(t.id)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, padding: "4px 16px",
            color: active === t.id ? "#FFD700" : "#3a3a4a",
            transition: "color 0.2s"
          }}
        >
          <span style={{ fontSize: t.id === "logger" ? 22 : 18 }}>{t.icon}</span>
          <span style={{
            fontSize: 9, letterSpacing: "1px",
            fontFamily: "'Orbitron', monospace",
            fontWeight: active === t.id ? 700 : 400
          }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
