import { useState, useEffect } from "react";

const CARD = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 14 };
const L = { color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 };

function gradeColor(g) {
  return { A: "#00FF88", B: "#FFD700", C: "#FF8C00", D: "#FF3B3B" }[g] || "#6B6B80";
}

async function analyzeTrades(trades, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are an elite trading performance analyst specializing in ICT methodology and trading psychology. Analyze this trader's journal.
Trades JSON: ${JSON.stringify(trades.slice(-50))}
Respond with valid JSON only — no markdown, no text outside JSON:
{"overall_grade":"B","win_rate":55,"profit_factor":1.4,"best_session":"London","worst_session":"NY","best_instrument":"XAUUSD","worst_instrument":"NAS100","emotion_impact":"High emotion scores correlate with losses","biggest_mistake":"Entering before killzone confirmation","loss_pattern":"Losses cluster on news days and low confluence setups","strength":"Excellent entries during London killzone","top_3_insights":["Your A-grade setups win 78% — stick to the plan","Emotion below 5 predicts loss 80% of the time","NY session has half the win rate of London"],"recommendations":["Only trade London killzone for 2 weeks","Journal emotion BEFORE entry not after","Review A-grade checklist before every trade"],"rule_to_add":"No trading when emotion < 6/10","rule_to_remove":"NY close session — not your edge","weekly_target":"2 A-grade London setups only, max 2 trades/day"}`
      }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  const text = data.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model returned non-JSON response");
  return JSON.parse(match[0]);
}

export default function JournalAnalyzer({ onNavigate }) {
  const [apiKey] = useState(() => localStorage.getItem("mb_api_key") || "");
  const [trades, setTrades] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    try {
      const t = JSON.parse(localStorage.getItem("mb_trades") || "[]");
      setTrades(t);
    } catch { setTrades([]); }
    try {
      const saved = JSON.parse(localStorage.getItem("mb_journal_analysis") || "null");
      if (saved) setLastSaved(saved);
    } catch {}
  }, []);

  const analyze = async () => {
    if (!apiKey) { setError("API key not set — go to AI Analyzer first"); return; }
    if (trades.length === 0) { setError("No trades logged yet"); return; }
    setAnalyzing(true); setError("");
    try {
      const r = await analyzeTrades(trades, apiKey);
      setResult(r);
      localStorage.setItem("mb_journal_analysis", JSON.stringify({ ...r, analyzedAt: new Date().toISOString() }));
      setLastSaved({ ...r, analyzedAt: new Date().toISOString() });
    } catch (e) {
      setError(e.message || "Analysis failed");
    }
    setAnalyzing(false);
  };

  const display = result || lastSaved;
  const gc = gradeColor(display?.overall_grade);

  const StatRow = ({ label, value, color = "#F0F0F0" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ color: "#6B6B80", fontSize: 12 }}>{label}</span>
      <span style={{ color, fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding: "24px 20px 120px" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 4, textAlign: "center" }}>AI JOURNAL</div>
      <div style={{ color: "#3a3a4a", fontSize: 10, textAlign: "center", marginBottom: 20 }}>
        {trades.length} trades analyzed
        {lastSaved?.analyzedAt && ` · Last: ${new Date(lastSaved.analyzedAt).toLocaleDateString()}`}
      </div>

      {!apiKey && (
        <div style={{ ...CARD, border: "1px solid rgba(255,140,0,0.3)", background: "rgba(255,140,0,0.06)" }}>
          <div style={{ color: "#FF8C00", fontSize: 12 }}>API key not set — go to AI Analyzer screen first to configure.</div>
          <button className="btn-secondary" style={{ marginTop: 10, fontSize: 10 }} onClick={() => onNavigate("ai")}>GO TO AI ANALYZER</button>
        </div>
      )}

      {trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 40 }}>📓</div>
          <div style={{ color: "#6B6B80", marginTop: 12 }}>No trades logged yet.</div>
          <div style={{ color: "#3a3a4a", fontSize: 12, marginTop: 4 }}>Log trades first, then come back for AI analysis.</div>
        </div>
      ) : (
        <button className="btn-primary" onClick={analyze} disabled={analyzing || !apiKey}
          style={{ width: "100%", marginBottom: 20, opacity: apiKey ? 1 : 0.4 }}>
          {analyzing ? "🧠 ANALYZING JOURNAL..." : `ANALYZE ${trades.length} TRADES`}
        </button>
      )}

      {error && (
        <div style={{ ...CARD, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.05)", color: "#FF6B6B", fontSize: 12 }}>
          {error}
        </div>
      )}

      {display && (
        <>
          {/* 1. Performance Overview */}
          <div style={{ ...CARD, border: `1px solid ${gc}30`, background: `${gc}06` }}>
            <div style={{ ...L, color: gc }}>1 · PERFORMANCE OVERVIEW</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 52, fontWeight: 900, color: gc, lineHeight: 1 }}>{display.overall_grade}</div>
              <div style={{ flex: 1 }}>
                <StatRow label="Win Rate" value={`${display.win_rate}%`} color={display.win_rate >= 55 ? "#00FF88" : display.win_rate >= 45 ? "#FF8C00" : "#FF3B3B"} />
                <StatRow label="Profit Factor" value={display.profit_factor?.toFixed(2)} color={display.profit_factor >= 1.5 ? "#00FF88" : "#FF8C00"} />
              </div>
            </div>
            <StatRow label="Best Session" value={display.best_session} color="#00FF88" />
            <StatRow label="Worst Session" value={display.worst_session} color="#FF3B3B" />
            <StatRow label="Best Instrument" value={display.best_instrument} color="#00FF88" />
            <StatRow label="Worst Instrument" value={display.worst_instrument} color="#FF3B3B" />
          </div>

          {/* 2. Patterns Found */}
          <div style={{ CARD, ...CARD, border: "1px solid rgba(255,59,59,0.2)", background: "rgba(255,59,59,0.04)" }}>
            <div style={{ ...L, color: "#FF8C00" }}>2 · PATTERNS FOUND</div>
            <div style={{ color: "#B0B0C0", fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>
              <strong style={{ color: "#FF8C00" }}>Loss Pattern:</strong> {display.loss_pattern}
            </div>
            <div style={{ color: "#B0B0C0", fontSize: 13, lineHeight: 1.8, marginBottom: 8 }}>
              <strong style={{ color: "#FFD700" }}>Emotion Impact:</strong> {display.emotion_impact}
            </div>
            <div style={{ color: "#B0B0C0", fontSize: 13, lineHeight: 1.8 }}>
              <strong style={{ color: "#FF3B3B" }}>Biggest Mistake:</strong> {display.biggest_mistake}
            </div>
          </div>

          {/* 3. Top 3 Insights */}
          <div style={{ ...CARD, border: "1px solid rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.04)" }}>
            <div style={{ ...L, color: "#00D4FF" }}>3 · TOP 3 INSIGHTS</div>
            {(display.top_3_insights || []).map((ins, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ color: "#00D4FF", fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, minWidth: 18 }}>{i + 1}</span>
                <span style={{ color: "#E0E0F0", fontSize: 13, lineHeight: 1.6 }}>{ins}</span>
              </div>
            ))}
          </div>

          {/* 4. Your Edge */}
          <div style={{ ...CARD, border: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)" }}>
            <div style={{ ...L, color: "#00FF88" }}>4 · YOUR EDGE</div>
            <div style={{ color: "#E0E0F0", fontSize: 14, lineHeight: 1.8 }}>{display.strength}</div>
          </div>

          {/* 5. Recommendations */}
          <div style={{ ...CARD, border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.04)" }}>
            <div style={{ ...L, color: "#FFD700" }}>5 · RECOMMENDATIONS</div>
            {(display.recommendations || []).map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0" }}>
                <span style={{ color: "#FFD700", fontSize: 11 }}>→</span>
                <span style={{ color: "#B0B0C0", fontSize: 13 }}>{r}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#00FF88", fontSize: 11 }}>+ ADD:</span>
                <span style={{ color: "#B0B0C0", fontSize: 12 }}>{display.rule_to_add}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#FF3B3B", fontSize: 11 }}>- REMOVE:</span>
                <span style={{ color: "#B0B0C0", fontSize: 12 }}>{display.rule_to_remove}</span>
              </div>
            </div>
          </div>

          {/* 6. This Week Focus */}
          <div style={{ background: "rgba(255,215,0,0.08)", border: "2px solid rgba(255,215,0,0.3)", borderRadius: 12, padding: 20, textAlign: "center", boxShadow: "0 0 30px rgba(255,215,0,0.1)" }}>
            <div style={{ color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>6 · THIS WEEK FOCUS</div>
            <div style={{ color: "#FFD700", fontSize: 14, fontWeight: 600, lineHeight: 1.8 }}>{display.weekly_target}</div>
          </div>
        </>
      )}
    </div>
  );
}
