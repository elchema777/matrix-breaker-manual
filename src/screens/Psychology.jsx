import { useState, useEffect, useRef } from "react";

const TIPS = [
  "Trade the PLAN, not the P&L. Your job ends when you click buy/sell correctly.",
  "A loss following your rules is a WIN. A win breaking rules is a LOSS.",
  "FOMO is just fear wearing a disguise. The market will always give another setup.",
  "Your edge only works over 100+ trades. One loss means nothing.",
  "Before entry: Would I take this if I was flat on the week? If no — don't.",
  "Revenge trading is a second mistake on top of the first. Walk away.",
  "The best traders are bored. Excitement = gambling. Precision = profession.",
  "Process over outcome. You control the entry. You don't control the exit.",
  "Journal every trade like your future self will read it. Because they will.",
  "Size down when in doubt. A small win beats a big loss every time.",
  "Grade your DECISIONS not your RESULTS. A+ decision + bad result = still A+.",
  "Sleep, hydration, and mindset are part of your trading system.",
  "Three losses in a row = mandatory break. No exceptions.",
  "If you need this trade to make rent — the trade is already lost.",
  "The London killzone is your edge. Never trade impulsively before it.",
];

const READINESS_QS = [
  "Slept more than 6 hours?",
  "Followed the plan yesterday?",
  "Emotion score ≥7/10?",
  "No revenge trades planned?",
  "Within daily loss limit?",
];

const RULES_CARDS = [
  { title: "ICT RULES", content: "Liquidity sweep + Displacement >1ATR + FVG + OB + MSS — need 4/5\nKillzone entry only\nNo news 30min window" },
  { title: "RISK RULES", content: "1% first trade\n0.5% if first loses\nMax 2 trades/session\nSL set before entry — always\nDD >7% → halve all risk" },
  { title: "SESSION RULES", content: "London 3AM PR only\nNY Overlap 8-11AM best\nAsian session = NO\nBe at screen 15min before killzone" },
  { title: "NEWS RULES", content: "🔴 HIGH: 30min no-trade window\n🟠 MEDIUM: reduce to 0.5%\nCheck ForexFactory every session\nCPI/NFP/FOMC = NO trades that day" },
  { title: "PSYCH RULES", content: "Score <5 = no trade, period\n3 losses = end session\nJournal every trade same day\nNo trading after loss of 3% day" },
];

function BreathingExercise() {
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef(null);

  const phases = [
    { name: "INHALE", duration: 4, color: "#00D4FF", size: 100 },
    { name: "HOLD", duration: 7, color: "#FFD700", size: 140 },
    { name: "EXHALE", duration: 8, color: "#00FF88", size: 60 },
  ];

  const start = () => {
    setCycle(0);
    setPhase(0);
    setCount(4);
  };

  useEffect(() => {
    if (phase === "idle") return;
    const phaseInfo = phases[phase];
    if (!phaseInfo) return;

    if (count > 0) {
      timerRef.current = setTimeout(() => setCount(c => c - 1), 1000);
    } else {
      const next = (phase + 1) % phases.length;
      if (next === 0) {
        if (cycle >= 2) { setPhase("idle"); setCycle(0); return; }
        setCycle(c => c + 1);
      }
      setPhase(next);
      setCount(phases[next].duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, count]);

  const phaseInfo = typeof phase === "number" ? phases[phase] : null;

  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 16 }}>
        4-7-8 BREATHING — {cycle}/3 CYCLES
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 160, position: "relative" }}>
        <div style={{
          width: phaseInfo?.size || 80, height: phaseInfo?.size || 80,
          borderRadius: "50%",
          background: phaseInfo ? `${phaseInfo.color}20` : "rgba(255,255,255,0.05)",
          border: `2px solid ${phaseInfo?.color || "#3a3a4a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
          boxShadow: phaseInfo ? `0 0 30px ${phaseInfo.color}40` : "none",
          transition: "all 1s ease"
        }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 700, color: phaseInfo?.color || "#6B6B80" }}>
            {phase === "idle" ? "•" : count}
          </div>
          {phaseInfo && <div style={{ color: phaseInfo.color, fontSize: 10, letterSpacing: 1 }}>{phaseInfo.name}</div>}
        </div>
      </div>
      <button onClick={phase === "idle" ? start : () => { clearTimeout(timerRef.current); setPhase("idle"); }}
        className={phase === "idle" ? "btn-primary" : "btn-secondary"}
        style={{ marginTop: 8 }}>
        {phase === "idle" ? "START BREATHING" : "STOP"}
      </button>
    </div>
  );
}

export default function Psychology() {
  const [tipIdx, setTipIdx] = useState(() => new Date().getDate() % TIPS.length);
  const [answers, setAnswers] = useState({});
  const [journal, setJournal] = useState(() => localStorage.getItem("mb_journal") || "");
  const [ruleCard, setRuleCard] = useState(0);

  const toggleAnswer = i => setAnswers(prev => ({ ...prev, [i]: !prev[i] }));
  const score = Object.values(answers).filter(Boolean).length;
  const readiness = score === 5 ? { label: "✅ READY TO TRADE", color: "#00FF88" }
    : score >= 3 ? { label: "⚠️ HALF SIZE ONLY", color: "#FF8C00" }
    : { label: "❌ DON'T TRADE TODAY", color: "#FF3B3B" };

  const saveJournal = v => {
    setJournal(v);
    localStorage.setItem("mb_journal", v);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{
        fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700,
        color: "#FFD700", letterSpacing: 3, marginBottom: 20, textAlign: "center"
      }}>PSYCHOLOGY</div>

      {/* Daily Tip */}
      <div style={{
        background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)",
        borderRadius: 10, padding: 20, marginBottom: 20
      }}>
        <div style={{ color: "#00D4FF", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>
          TODAY'S MINDSET TIP
        </div>
        <div style={{ color: "#E0E0F0", fontSize: 14, lineHeight: 1.8, fontStyle: "italic" }}>
          "{TIPS[tipIdx]}"
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 10, padding: "6px 12px" }}
            onClick={() => setTipIdx(i => (i - 1 + TIPS.length) % TIPS.length)}>← PREV</button>
          <button className="btn-secondary" style={{ fontSize: 10, padding: "6px 12px" }}
            onClick={() => setTipIdx(i => (i + 1) % TIPS.length)}>NEXT →</button>
        </div>
      </div>

      {/* Breathing */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, marginBottom: 20
      }}>
        <BreathingExercise />
      </div>

      {/* Readiness Check */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          AM I READY? ({score}/5)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {READINESS_QS.map((q, i) => (
            <button key={i} onClick={() => toggleAnswer(i)} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: answers[i] ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${answers[i] ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "10px 12px", cursor: "pointer", textAlign: "left"
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                background: answers[i] ? "#00FF88" : "transparent",
                border: `2px solid ${answers[i] ? "#00FF88" : "#3a3a4a"}`,
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#050508", fontWeight: 900
              }}>{answers[i] ? "✓" : ""}</span>
              <span style={{ color: answers[i] ? "#F0F0F0" : "#6B6B80", fontSize: 13 }}>{q}</span>
            </button>
          ))}
        </div>
        <div style={{
          background: `${readiness.color}10`, border: `1px solid ${readiness.color}30`,
          borderRadius: 8, padding: 12, textAlign: "center",
          fontFamily: "'Orbitron', monospace", fontSize: 12, color: readiness.color, letterSpacing: 2
        }}>{readiness.label}</div>
      </div>

      {/* Rules Cards */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          YOUR RULES
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
          {RULES_CARDS.map((r, i) => (
            <button key={i} onClick={() => setRuleCard(i)} style={{
              padding: "6px 10px", borderRadius: 6, cursor: "pointer",
              fontFamily: "'Orbitron', monospace", fontSize: 8, letterSpacing: 1, whiteSpace: "nowrap",
              background: ruleCard === i ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${ruleCard === i ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: ruleCard === i ? "#FFD700" : "#6B6B80"
            }}>{r.title}</button>
          ))}
        </div>
        <div style={{
          background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)",
          borderRadius: 10, padding: 16
        }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, color: "#FFD700", marginBottom: 8 }}>
            {RULES_CARDS[ruleCard].title}
          </div>
          {RULES_CARDS[ruleCard].content.split("\n").map((line, i) => (
            <div key={i} style={{ color: "#B0B0C0", fontSize: 13, lineHeight: 2 }}>• {line}</div>
          ))}
        </div>
      </div>

      {/* Mindset Journal */}
      <div>
        <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>
          MINDSET JOURNAL
        </div>
        <textarea
          value={journal}
          onChange={e => saveJournal(e.target.value)}
          placeholder="Write your thoughts, feelings, and trading mindset today..."
          style={{
            width: "100%", minHeight: 120,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, color: "#F0F0F0", padding: 12, fontSize: 13,
            fontFamily: "'Syne', sans-serif", resize: "vertical", lineHeight: 1.6
          }}
        />
      </div>
    </div>
  );
}
