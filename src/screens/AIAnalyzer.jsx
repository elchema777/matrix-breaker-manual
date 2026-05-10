import { useState } from "react";

const L = { display: "block", color: "#6B6B80", fontSize: 9, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 6 };
const CARD = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginBottom: 16 };

function pill(active, col = "#FFD700") {
  return {
    flex: 1, padding: "10px 6px", borderRadius: 8, cursor: "pointer",
    fontFamily: "'Orbitron', monospace", fontSize: 10, letterSpacing: 1, fontWeight: 700,
    background: active ? `${col}22` : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? `${col}55` : "rgba(255,255,255,0.08)"}`,
    color: active ? col : "#6B6B80", transition: "all 0.2s"
  };
}

function gradeColor(g) { return g === "A" ? "#00FF88" : g === "B" ? "#FF8C00" : "#FF3B3B"; }

async function analyzeChart(imageBase64, mediaType, instrument, timeframe, apiKey) {
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
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: `You are an elite ICT market structure analyst. Analyze this ${instrument} ${timeframe} chart.
Check for: Liquidity sweep, Displacement >1ATR, FVG (Fair Value Gap), Order Block, MSS (Market Structure Shift), Premium/Discount zones, Killzone timing alignment.
Respond with valid JSON only — no markdown, no explanation outside the JSON:
{"grade":"A","confluences":["Liquidity sweep detected","FVG present"],"missing":["No clear OB"],"bias":"LONG","entry":"2340.00","sl":"2330.00","tp":"2365.00","rr":"2.5","confidence":72,"analysis":"Price swept equal lows at 2335 and displaced aggressively through the FVG zone. MSS confirmed on M5 with strong bullish engulfing. Killzone timing aligns with London open.","recommendation":"TAKE"}` }
        ]
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

function saveAnalysis(analysis, instrument, timeframe) {
  try {
    const key = "mb_analyses";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    prev.unshift({ ...analysis, instrument, timeframe, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(prev.slice(0, 5)));
  } catch {}
}

export default function AIAnalyzer({ onNavigate }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("mb_api_key") || "");
  const [showKeyInput, setShowKeyInput] = useState(() => !localStorage.getItem("mb_api_key"));
  const [keyDraft, setKeyDraft] = useState("");

  const [image, setImage] = useState(null);       // { preview, base64, mediaType }
  const [instrument, setInstrument] = useState("XAU");
  const [timeframe, setTimeframe] = useState("M5");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    const mediaType = f.type || "image/jpeg";
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(",")[1];
      setImage({ preview: dataUrl, base64, mediaType });
      setResult(null); setError("");
    };
    reader.readAsDataURL(f);
  };

  const saveKey = () => {
    if (!keyDraft.startsWith("sk-ant-")) return;
    localStorage.setItem("mb_api_key", keyDraft);
    setApiKey(keyDraft);
    setShowKeyInput(false);
  };

  const analyze = async () => {
    if (!image || !apiKey) return;
    setAnalyzing(true); setError(""); setResult(null);
    try {
      const r = await analyzeChart(image.base64, image.mediaType, instrument, timeframe, apiKey);
      setResult(r);
      saveAnalysis(r, instrument, timeframe);
    } catch (e) {
      setError(e.message || "Analysis failed — check API key and try again");
    }
    setAnalyzing(false);
  };

  const logTrade = () => {
    if (!result) return;
    const pre = {
      instrument: instrument === "XAU" ? "XAUUSD" : instrument === "GER" ? "GER40" : "NAS100",
      direction: result.bias === "LONG" ? "LONG" : "SHORT",
      entry: result.entry, sl: result.sl, tp: result.tp,
      aiGrade: result.grade, aiConfidence: result.confidence,
    };
    localStorage.setItem("mb_ai_prefill", JSON.stringify(pre));
    onNavigate("logger");
  };

  const gc = gradeColor(result?.grade || "C");

  if (showKeyInput) return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 24, textAlign: "center" }}>AI ANALYZER</div>
      <div style={{ ...CARD, border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.04)" }}>
        <div style={{ color: "#FFD700", fontSize: 12, fontFamily: "'Orbitron', monospace", marginBottom: 12 }}>ANTHROPIC API KEY REQUIRED</div>
        <div style={{ color: "#6B6B80", fontSize: 12, lineHeight: 1.8, marginBottom: 16 }}>
          Get your key at console.anthropic.com → API Keys. Stored locally only, never sent anywhere except Anthropic.
        </div>
        <label style={L}>PASTE YOUR API KEY (sk-ant-...)</label>
        <input type="password" value={keyDraft} onChange={e => setKeyDraft(e.target.value)}
          placeholder="sk-ant-api03-..."
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 8, color: "#F0F0F0", padding: "12px 14px", fontSize: 13, fontFamily: "monospace", marginBottom: 12 }} />
        <button className="btn-primary" style={{ width: "100%", opacity: keyDraft.startsWith("sk-ant-") ? 1 : 0.4 }}
          disabled={!keyDraft.startsWith("sk-ant-")} onClick={saveKey}>
          SAVE & CONTINUE
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px 20px 120px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3 }}>AI ANALYZER</div>
        <button onClick={() => setShowKeyInput(true)} style={{ background: "none", border: "none", color: "#3a3a4a", fontSize: 10, cursor: "pointer", fontFamily: "'Orbitron', monospace", letterSpacing: 1 }}>API KEY</button>
      </div>

      {/* Upload */}
      <label style={{ display: "block", border: `2px dashed ${image ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: 20, textAlign: "center", cursor: "pointer", background: image ? "rgba(255,215,0,0.04)" : "rgba(255,255,255,0.02)", marginBottom: 16 }}>
        <input type="file" accept="image/*" capture="environment" onChange={handleImg} style={{ display: "none" }} />
        {image ? (
          <img src={image.preview} alt="chart" style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 8 }} />
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
            <div style={{ color: "#6B6B80", fontSize: 13 }}>Tap to upload chart screenshot</div>
            <div style={{ color: "#3a3a4a", fontSize: 11, marginTop: 4 }}>Camera or gallery — M5 to H4 recommended</div>
          </>
        )}
      </label>

      {/* Instrument */}
      <div style={{ marginBottom: 14 }}>
        <label style={L}>INSTRUMENT</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["XAU", "GER", "NAS"].map(i => <button key={i} onClick={() => setInstrument(i)} style={pill(instrument === i)}>{i}</button>)}
        </div>
      </div>

      {/* Timeframe */}
      <div style={{ marginBottom: 20 }}>
        <label style={L}>TIMEFRAME</label>
        <div style={{ display: "flex", gap: 8 }}>
          {["M5", "M15", "H1", "H4"].map(t => <button key={t} onClick={() => setTimeframe(t)} style={pill(timeframe === t)}>{t}</button>)}
        </div>
      </div>

      <button className="btn-primary" onClick={analyze}
        disabled={!image || analyzing}
        style={{ width: "100%", marginBottom: 20, opacity: image && !analyzing ? 1 : 0.4 }}>
        {analyzing ? "🧠 ANALYZING..." : "ANALYZE CHART"}
      </button>

      {error && (
        <div style={{ ...CARD, border: "1px solid rgba(255,59,59,0.3)", background: "rgba(255,59,59,0.05)", color: "#FF6B6B", fontSize: 12, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {result && (
        <>
          {/* Grade + Bias */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ ...CARD, flex: "0 0 auto", textAlign: "center", width: 80, padding: 12, border: `2px solid ${gc}30`, background: `${gc}08` }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 36, fontWeight: 900, color: gc }}>{result.grade}</div>
              <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2 }}>GRADE</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...CARD, padding: 12, marginBottom: 8 }}>
                <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>BIAS</div>
                <div style={{ color: result.bias === "LONG" ? "#00FF88" : "#FF3B3B", fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700 }}>{result.bias} {result.bias === "LONG" ? "▲" : "▼"}</div>
              </div>
              <div style={{ ...CARD, padding: 12, marginBottom: 0 }}>
                <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>CONFIDENCE</div>
                <div style={{ color: "#FFD700", fontFamily: "'Orbitron', monospace", fontSize: 18, fontWeight: 700 }}>{result.confidence}%</div>
              </div>
            </div>
          </div>

          {/* Levels */}
          <div style={{ ...CARD }}>
            <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>LEVELS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {[["ENTRY", result.entry, "#F0F0F0"], ["SL", result.sl, "#FF3B3B"], ["TP", result.tp, "#00FF88"], ["R:R", `1:${result.rr}`, "#FFD700"]].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ color: "#3a3a4a", fontSize: 8, letterSpacing: 1, fontFamily: "'Orbitron', monospace" }}>{l}</div>
                  <div style={{ color: c, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Confluences */}
          <div style={{ ...CARD }}>
            <div style={{ color: "#6B6B80", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 10 }}>ICT CONFLUENCES DETECTED</div>
            {(result.confluences || []).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span style={{ color: "#00FF88", fontSize: 12 }}>✓</span>
                <span style={{ color: "#B0B0C0", fontSize: 13 }}>{c}</span>
              </div>
            ))}
            {(result.missing || []).map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span style={{ color: "#FF3B3B", fontSize: 12 }}>✗</span>
                <span style={{ color: "#6B6B80", fontSize: 12 }}>{m}</span>
              </div>
            ))}
          </div>

          {/* Analysis */}
          <div style={{ ...CARD, border: "1px solid rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.04)" }}>
            <div style={{ color: "#00D4FF", fontSize: 8, letterSpacing: 2, fontFamily: "'Orbitron', monospace", marginBottom: 8 }}>ANALYSIS</div>
            <div style={{ color: "#E0E0F0", fontSize: 13, lineHeight: 1.8 }}>{result.analysis}</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700,
                color: result.recommendation === "TAKE" ? "#00FF88" : result.recommendation === "WAIT" ? "#FF8C00" : "#FF3B3B" }}>
                {result.recommendation === "TAKE" ? "✓ TAKE SETUP" : result.recommendation === "WAIT" ? "⏳ WAIT" : "✗ SKIP"}
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={logTrade} style={{ width: "100%" }}>
            LOG THIS TRADE →
          </button>
        </>
      )}
    </div>
  );
}
