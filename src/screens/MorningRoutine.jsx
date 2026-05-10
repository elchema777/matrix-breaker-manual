import { useState, useEffect, useRef } from "react";

const TIPS = [
  "Trade the PLAN, not the P&L. Your job ends when you click buy/sell correctly.",
  "A loss following your rules is a WIN. A win breaking rules is a LOSS.",
  "FOMO is just fear wearing a disguise. The market will always give another setup.",
  "Your edge only works over 100+ trades. One loss means nothing.",
  "Grade your DECISIONS not your RESULTS.",
  "Sleep, hydration, and mindset are part of your trading system.",
  "The London killzone is your edge. Never trade before it.",
];

function todayKey() { return new Date().toISOString().slice(0, 10); }
function loadMorning() {
  try { return JSON.parse(localStorage.getItem(`mb_morning:${todayKey()}`) || "{}"); }
  catch { return {}; }
}
function saveMorning(data) {
  const prev = loadMorning();
  localStorage.setItem(`mb_morning:${todayKey()}`, JSON.stringify({ ...prev, ...data }));
}

function SectionHeader({ num, title, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.05)", border: `2px solid ${done ? "#FFD700" : "#2a2a3a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {done ? <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 900 }}>✓</span>
               : <span style={{ color: "#3a3a4a", fontSize: 11, fontFamily: "'Orbitron', monospace" }}>{num}</span>}
      </div>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, color: done ? "#FFD700" : "#6B6B80", letterSpacing: 2 }}>{title}</div>
    </div>
  );
}

function Breathing() {
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const PHASES = [
    { name: "INHALE", dur: 4, color: "#00D4FF", size: 100 },
    { name: "HOLD",   dur: 7, color: "#FFD700", size: 140 },
    { name: "EXHALE", dur: 8, color: "#00FF88", size: 60  },
  ];
  useEffect(() => {
    if (phase === "idle") return;
    const p = PHASES[phase];
    if (!p) return;
    if (count > 0) { ref.current = setTimeout(() => setCount(c => c - 1), 1000); }
    else {
      const next = (phase + 1) % PHASES.length;
      if (next === 0) {
        if (cycle >= 2) { setPhase("idle"); setDone(true); return; }
        setCycle(c => c + 1);
      }
      setPhase(next); setCount(PHASES[next].dur);
    }
    return () => clearTimeout(ref.current);
  }, [phase, count]);
  const p = typeof phase === "number" ? PHASES[phase] : null;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 12 }}>4-7-8 BREATHING · {cycle}/3 CYCLES {done ? "✓" : ""}</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 140 }}>
        <div style={{ width: p?.size || 80, height: p?.size || 80, borderRadius: "50%", background: p ? `${p.color}20` : "rgba(255,255,255,0.05)", border: `2px solid ${p?.color || "#3a3a4a"}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: p ? `0 0 30px ${p.color}40` : "none", transition: "all 1s ease" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 28, fontWeight: 700, color: p?.color || "#6B6B80" }}>{phase === "idle" ? (done ? "✓" : "•") : count}</div>
          {p && <div style={{ color: p.color, fontSize: 9, letterSpacing: 1 }}>{p.name}</div>}
        </div>
      </div>
      <button onClick={phase === "idle" ? () => { setCycle(0); setPhase(0); setCount(4); } : () => { clearTimeout(ref.current); setPhase("idle"); }}
        className={phase === "idle" ? "btn-primary" : "btn-secondary"} style={{ marginTop: 8, fontSize: 11 }}>
        {phase === "idle" ? (done ? "REPEAT" : "START 4-7-8") : "STOP"}
      </button>
    </div>
  );
}

export default function MorningRoutine({ onNavigate }) {
  const [saved, setSaved]   = useState(loadMorning);
  const [section, setSection] = useState(0);

  // Section 1 state
  const [awake, setAwake]   = useState(!!saved.wakeTime);

  // Section 2 state
  const [shower, setShower] = useState(saved.shower || false);
  const [water,  setWater]  = useState(saved.water  || false);
  const [sleep,  setSleep]  = useState(saved.sleepHours || 7);

  // Section 3 state
  const [lesson, setLesson] = useState(saved.lesson || "");
  const tipIdx = new Date().getDate() % TIPS.length;

  // Section 5 state
  const [focus, setFocus]   = useState(saved.focus || "");
  const [accountSize] = useState(() => {
    try { return parseFloat(localStorage.getItem("mb_account_size") || "10000"); }
    catch { return 10000; }
  });

  // Section 6 readiness
  const [readiness, setReadiness] = useState(saved.readiness || {});
  const READY_QS = [
    "Slept 6+ hours?", "Emotion 7+?", "No revenge trades?",
    "Followed plan yesterday?", "Within daily loss limit?"
  ];
  const readyScore = Object.values(readiness).filter(Boolean).length;
  const readyCount = readyScore >= 4;
  const sleepOK    = sleep >= 6;
  const canReady   = readyCount && sleepOK;

  const sleepStatus = sleep >= 6 ? { label: "WELL RESTED", color: "#00FF88" }
    : sleep >= 4 ? { label: "LOW ENERGY — HALF SIZE", color: "#FF8C00" }
    : { label: "DO NOT TRADE TODAY", color: "#FF3B3B" };

  const S1done = awake;
  const S2done = shower && water && sleep > 0;
  const S3done = !!saved.s3done;
  const S4done = true; // always available
  const S5done = !!focus;
  const S6done = readyScore === 5;

  const save = patch => { const m = { ...loadMorning(), ...patch }; localStorage.setItem(`mb_morning:${todayKey()}`, JSON.stringify(m)); setSaved(m); };

  const wakeUp = () => {
    const ts = Date.now();
    localStorage.setItem("mb_wake_time", ts.toString());
    localStorage.setItem("mb_sleep_hours", sleep.toString());
    save({ wakeTime: ts });
    setAwake(true);
  };

  const finish = () => {
    save({ completed: true, completedAt: new Date().toISOString() });
    onNavigate("home");
  };

  // Previous session trades
  const prevTrades = (() => {
    try {
      const t = JSON.parse(localStorage.getItem("mb_trades") || "[]");
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      return t.filter(x => (x.timestamp || x.closedAt || "").startsWith(yesterday));
    } catch { return []; }
  })();

  const sections = [
    { num: 1, title: "WAKE UP CHECK",    done: S1done },
    { num: 2, title: "BODY ACTIVATION",  done: S2done },
    { num: 3, title: "MINDSET PREP",     done: S3done },
    { num: 4, title: "MARKET BRIEF",     done: S4done },
    { num: 5, title: "SESSION GOALS",    done: S5done },
    { num: 6, title: "READINESS CHECK",  done: S6done },
  ];

  return (
    <div style={{ padding: "24px 20px 120px" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 4, textAlign: "center" }}>MORNING ROUTINE</div>
      <div style={{ color: "#3a3a4a", fontSize: 10, textAlign: "center", marginBottom: 20, letterSpacing: 2 }}>NIGHT SHIFT PROTOCOL — NO CLOCK LOGIC</div>

      {/* Section nav dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        {sections.map((s, i) => (
          <button key={i} onClick={() => setSection(i)} style={{ width: 10, height: 10, borderRadius: "50%", border: "none", cursor: "pointer", background: s.done ? "#FFD700" : section === i ? "#6B6B80" : "#2a2a3a", padding: 0 }} />
        ))}
      </div>

      {/* ─── SECTION 1: WAKE UP ─── */}
      {section === 0 && (
        <div>
          <SectionHeader num={1} title="WAKE UP CHECK" done={S1done} />
          {!awake ? (
            <button className="btn-primary" style={{ width: "100%", fontSize: 18, padding: 20 }} onClick={wakeUp}>
              ☀️ I AM AWAKE
            </button>
          ) : (
            <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: 14, textAlign: "center", marginBottom: 16 }}>
              <div style={{ color: "#FFD700", fontFamily: "'Orbitron', monospace", fontSize: 12 }}>✓ AWAKE — Let's get ready</div>
              <div style={{ color: "#6B6B80", fontSize: 11, marginTop: 4 }}>{new Date().toLocaleTimeString()}</div>
            </div>
          )}
          <div style={{ marginTop: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>TODAY'S BIAS (CACHED)</div>
            {[{i:"XAU",b:"Loading...",c:"#FFD700"},{i:"GER",b:"...",c:"#00D4FF"},{i:"NAS",b:"...",c:"#00FF88"}].map(x => (
              <div key={x.i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ color: "#6B6B80", fontSize: 12 }}>{x.i}</span>
                <span style={{ color: x.c, fontSize: 12, fontWeight: 700 }}>—</span>
              </div>
            ))}
          </div>
          {awake && <button className="btn-secondary" style={{ width: "100%", marginTop: 16 }} onClick={() => setSection(1)}>NEXT: BODY ACTIVATION →</button>}
        </div>
      )}

      {/* ─── SECTION 2: BODY ACTIVATION ─── */}
      {section === 1 && (
        <div>
          <SectionHeader num={2} title="BODY ACTIVATION" done={S2done} />
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <Breathing />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[{ label: "🚿 COLD SHOWER", val: shower, set: v => { setShower(v); save({ shower: v }); } },
              { label: "💧 HYDRATED",    val: water,  set: v => { setWater(v);  save({ water: v });  } }].map(b => (
              <button key={b.label} onClick={() => b.set(!b.val)} style={{ flex: 1, padding: 14, borderRadius: 10, cursor: "pointer", fontFamily: "'Orbitron', monospace", fontSize: 9, letterSpacing: 1, background: b.val ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${b.val ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.08)"}`, color: b.val ? "#00FF88" : "#6B6B80" }}>
                {b.label} {b.val ? "✓" : ""}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>
              SLEEP QUALITY — {sleep}h
            </div>
            <input type="range" min={1} max={12} value={sleep} onChange={e => { const v = +e.target.value; setSleep(v); save({ sleepHours: v }); localStorage.setItem("mb_sleep_hours", v); }}
              style={{ width: "100%", accentColor: sleepStatus.color }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#3a3a4a", fontSize: 10, marginTop: 4 }}>
              <span>1h</span><span>12h</span>
            </div>
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, textAlign: "center", fontFamily: "'Orbitron', monospace", fontSize: 11, letterSpacing: 1, background: `${sleepStatus.color}12`, border: `1px solid ${sleepStatus.color}30`, color: sleepStatus.color }}>
              {sleepStatus.label}
            </div>
          </div>

          <button className="btn-secondary" style={{ width: "100%" }} onClick={() => setSection(2)}>NEXT: MINDSET PREP →</button>
        </div>
      )}

      {/* ─── SECTION 3: MINDSET ─── */}
      {section === 2 && (
        <div>
          <SectionHeader num={3} title="MINDSET PREP" done={S3done} />
          <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ color: "#00D4FF", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>TODAY'S TIP</div>
            <div style={{ color: "#E0E0F0", fontSize: 13, lineHeight: 1.8, fontStyle: "italic" }}>"{TIPS[tipIdx]}"</div>
          </div>

          {prevTrades.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>YESTERDAY ({prevTrades.length} TRADES)</div>
              {prevTrades.slice(0, 3).map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: "#B0B0C0", fontSize: 12 }}>{t.instrument} {t.direction}</span>
                  <span style={{ color: parseFloat(t.pnl) > 0 ? "#00FF88" : "#FF3B3B", fontSize: 12, fontWeight: 700 }}>${parseFloat(t.pnl || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>LESSON I CARRY FORWARD</div>
            <textarea value={lesson} onChange={e => setLesson(e.target.value)} onBlur={() => save({ lesson, s3done: true })}
              placeholder="What did yesterday teach you?"
              style={{ width: "100%", minHeight: 80, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F0F0F0", padding: 12, fontSize: 13, fontFamily: "'Syne', sans-serif", resize: "vertical" }} />
          </div>
          <button className="btn-primary" style={{ width: "100%" }} onClick={() => { save({ lesson, s3done: true }); setSection(3); }}>NEXT: MARKET BRIEF →</button>
        </div>
      )}

      {/* ─── SECTION 4: MARKET BRIEF ─── */}
      {section === 3 && (
        <div>
          <SectionHeader num={4} title="MARKET BRIEF" done={S4done} />
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>INSTRUMENT BIAS</div>
            {[{ sym: "XAUUSD", col: "#FFD700" }, { sym: "GER40", col: "#00D4FF" }, { sym: "NAS100", col: "#00FF88" }].map(x => {
              let bias = "—";
              try { bias = JSON.parse(localStorage.getItem("mb_bias") || "{}")[x.sym] || "—"; } catch {}
              return (
                <div key={x.sym} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: "#B0B0C0", fontSize: 13 }}>{x.sym}</span>
                  <span style={{ color: x.col, fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700 }}>{bias}</span>
                </div>
              );
            })}
          </div>
          <div style={{ background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ color: "#FF8C00", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>NEWS WARNINGS TODAY</div>
            <div style={{ color: "#6B6B80", fontSize: 12 }}>Check ForexFactory for red/orange events. CPI/NFP/FOMC = NO trades.</div>
          </div>
          <button className="btn-secondary" style={{ width: "100%" }} onClick={() => setSection(4)}>NEXT: SESSION GOALS →</button>
        </div>
      )}

      {/* ─── SECTION 5: SESSION GOALS ─── */}
      {section === 4 && (
        <div>
          <SectionHeader num={5} title="SESSION GOALS" done={S5done} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "MAX TRADES", val: "2", color: "#FFD700" },
              { label: "RISK 1%", val: `$${(accountSize * 0.01).toFixed(0)}`, color: "#00FF88" },
              { label: "RISK 0.5%", val: `$${(accountSize * 0.005).toFixed(0)}`, color: "#FF8C00" },
              { label: "DAILY STOP", val: `$${(accountSize * 0.03).toFixed(0)}`, color: "#FF3B3B" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>{s.label}</div>
                <div style={{ color: s.color, fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700, marginTop: 4 }}>{s.val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>MY FOCUS TODAY</div>
            <textarea value={focus} onChange={e => setFocus(e.target.value)} onBlur={() => save({ focus })}
              placeholder="e.g. Only London killzone, A-grade setups, perfect patience"
              style={{ width: "100%", minHeight: 72, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#F0F0F0", padding: 12, fontSize: 13, fontFamily: "'Syne', sans-serif", resize: "vertical" }} />
          </div>
          <button className="btn-primary" style={{ width: "100%" }} onClick={() => { save({ focus }); setSection(5); }}>NEXT: READINESS CHECK →</button>
        </div>
      )}

      {/* ─── SECTION 6: READINESS ─── */}
      {section === 5 && (
        <div>
          <SectionHeader num={6} title="READINESS CHECK" done={S6done} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {READY_QS.map((q, i) => {
              const on = !!readiness[i];
              return (
                <button key={i} onClick={() => { const r = { ...readiness, [i]: !on }; setReadiness(r); save({ readiness: r }); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, background: on ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${on ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: on ? "#00FF88" : "transparent", border: `2px solid ${on ? "#00FF88" : "#3a3a4a"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#050508", fontWeight: 900 }}>{on ? "✓" : ""}</div>
                  <span style={{ color: on ? "#F0F0F0" : "#6B6B80", fontSize: 13 }}>{q}</span>
                </button>
              );
            })}
          </div>

          <div style={{ background: readyCount ? (sleepOK ? "rgba(0,255,136,0.06)" : "rgba(255,140,0,0.06)") : "rgba(255,59,59,0.06)", border: `1px solid ${readyCount ? (sleepOK ? "rgba(0,255,136,0.3)" : "rgba(255,140,0,0.3)") : "rgba(255,59,59,0.3)"}`, borderRadius: 8, padding: 12, textAlign: "center", fontFamily: "'Orbitron', monospace", fontSize: 11, color: readyCount ? (sleepOK ? "#00FF88" : "#FF8C00") : "#FF3B3B", letterSpacing: 2, marginBottom: 16 }}>
            {readyCount && sleepOK ? `✓ READY (${readyScore}/5)` : readyCount && !sleepOK ? `CAUTION — LOW SLEEP (${readyScore}/5)` : `NOT READY YET (${readyScore}/5 — need 4+)`}
          </div>

          {/* I AM READY */}
          <button className="btn-primary" onClick={finish} disabled={!canReady}
            style={{ width: "100%", fontSize: 16, padding: 18, opacity: canReady ? 1 : 0.3, background: canReady ? "linear-gradient(135deg, #FFD700, #FF8C00)" : undefined, boxShadow: canReady ? "0 0 40px rgba(255,215,0,0.3)" : "none" }}>
            {canReady ? "⚡ I AM READY — GO TRADE" : `NEED ${4 - readyScore} MORE ANSWERS`}
          </button>
          {!sleepOK && canReady && (
            <div style={{ color: "#FF8C00", fontSize: 11, textAlign: "center", marginTop: 8 }}>Trade at half size — {sleep}h sleep logged</div>
          )}
        </div>
      )}
    </div>
  );
}
