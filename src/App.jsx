import { useState } from "react";
import BottomNav from "./components/BottomNav";

// Existing screens
import Home          from "./screens/Home";
import Checklist     from "./screens/Checklist";
import TradeLogger   from "./screens/TradeLogger";
import Stats         from "./screens/Stats";
import Psychology    from "./screens/Psychology";
import KillzoneTimer from "./screens/KillzoneTimer";
import NewsFeed      from "./screens/NewsFeed";
import Journal       from "./screens/Journal";

// New screens
import LogResult       from "./screens/LogResult";
import AIAnalyzer      from "./screens/AIAnalyzer";
import JournalAnalyzer from "./screens/JournalAnalyzer";
import MorningRoutine  from "./screens/MorningRoutine";
import PostSession     from "./screens/PostSession";

const BOTTOM_NAV_SCREENS = new Set([
  "home", "checklist", "logger", "stats", "journal",
  "ai", "morning", "psychology", "killzone", "news",
  "journalanalyzer", "postsession", "logresult",
]);

export default function App() {
  const [screen, setScreen] = useState("home");
  const [preTradeData, setPreTradeData] = useState(null);

  const nav = s => { setScreen(s); window.scrollTo(0, 0); };

  const handleTradeApproved = data => { setPreTradeData(data); nav("logger"); };

  const screenMap = {
    home:            <Home onNavigate={nav} weekStats={getWeekStats()} />,
    checklist:       <Checklist onNavigate={nav} onTradeApproved={handleTradeApproved} />,
    logger:          <TradeLogger preData={preTradeData} onNavigate={nav} />,
    stats:           <Stats onNavigate={nav} />,
    psychology:      <Psychology />,
    killzone:        <KillzoneTimer />,
    news:            <NewsFeed />,
    journal:         <Journal />,

    // New screens
    logresult:       <LogResult      onNavigate={nav} />,
    ai:              <AIAnalyzer     onNavigate={nav} />,
    journalanalyzer: <JournalAnalyzer onNavigate={nav} />,
    morning:         <MorningRoutine  onNavigate={nav} />,
    postsession:     <PostSession     onNavigate={nav} />,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050508" }}>
      {screenMap[screen] ?? screenMap["home"]}
      {BOTTOM_NAV_SCREENS.has(screen) && (
        <BottomNav active={screen} onNavigate={nav} />
      )}
    </div>
  );
}

function getWeekStats() {
  try {
    const trades = JSON.parse(localStorage.getItem("mb_trades") || "[]");
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const week = trades.filter(t => (t.timestamp || t.closedAt || "") >= weekAgo);
    const wins = week.filter(t => (parseFloat(t.pnl) || 0) > 0).length;
    const wr   = week.length > 0 ? Math.round(wins / week.length * 100) : 0;
    const pnl  = week.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
    let streak = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      const p = parseFloat(trades[i].pnl) || 0;
      if (p > 0 && streak >= 0) streak++;
      else if (p < 0 && streak <= 0) streak--;
      else break;
    }
    return { wr, pnl: Math.round(pnl), streak };
  } catch { return { wr: 0, pnl: 0, streak: 0 }; }
}
