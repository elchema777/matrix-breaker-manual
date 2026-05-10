export default function BottomNav({ active, onNavigate }) {
  const main = [
    { id: "home",      icon: "⬡", label: "Home"  },
    { id: "checklist", icon: "✅", label: "Check" },
    { id: "logger",    icon: "+",  label: "Log"   },
    { id: "stats",     icon: "📊", label: "Stats" },
    { id: "ai",        icon: "🧠", label: "AI"    },
  ];

  const secondary = [
    { id: "morning",         icon: "☀️", label: "Morning"  },
    { id: "psychology",      icon: "🧘", label: "Psych"    },
    { id: "killzone",        icon: "⏱",  label: "Killzone" },
    { id: "news",            icon: "📰", label: "News"     },
    { id: "journal",         icon: "📓", label: "Journal"  },
    { id: "journalanalyzer", icon: "✨", label: "AI Jrnl"  },
    { id: "postsession",     icon: "🌙", label: "Debrief"  },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(5,5,8,0.97)",
      borderTop: "1px solid rgba(255,215,0,0.12)",
      zIndex: 100,
      backdropFilter: "blur(20px)",
    }}>
      {/* Secondary row — horizontally scrollable */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        {secondary.map(t => (
          <button key={t.id} onClick={() => onNavigate(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, padding: "6px 12px", flexShrink: 0,
            color: active === t.id ? "#00D4FF" : "#2a2a3a",
            borderBottom: active === t.id ? "2px solid #00D4FF" : "2px solid transparent",
            transition: "color 0.2s",
          }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            <span style={{ fontSize: 7, letterSpacing: "0.5px", fontFamily: "'Orbitron', monospace", fontWeight: active === t.id ? 700 : 400, whiteSpace: "nowrap" }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {/* Primary row */}
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "6px 0 max(6px,env(safe-area-inset-bottom))" }}>
        {main.map(t => (
          <button key={t.id} onClick={() => onNavigate(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 2, padding: "4px 14px",
            color: active === t.id ? "#FFD700" : "#3a3a4a",
            transition: "color 0.2s",
          }}>
            <span style={{ fontSize: t.id === "logger" ? 22 : 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: "1px", fontFamily: "'Orbitron', monospace", fontWeight: active === t.id ? 700 : 400 }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
