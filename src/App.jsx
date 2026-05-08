import { useState } from "react";
import BottomNav from "./components/BottomNav";
import Home from "./screens/Home";
import Checklist from "./screens/Checklist";
import TradeLogger from "./screens/TradeLogger";
import Stats from "./screens/Stats";
import Psychology from "./screens/Psychology";
import KillzoneTimer from "./screens/KillzoneTimer";
import NewsFeed from "./screens/NewsFeed";
import Journal from "./screens/Journal";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [preTradeData, setPreTradeData] = useState(null);

  const handleTradeApproved = data => {
    setPreTradeData(data);
    setScreen("logger");
  };

  const screenMap = {
    home: <Home onNavigate={setScreen} weekStats={{ wr: 0, pnl: 0, streak: 0 }} />,
    checklist: <Checklist onNavigate={setScreen} onTradeApproved={handleTradeApproved} />,
    logger: <TradeLogger preData={preTradeData} onNavigate={setScreen} />,
    stats: <Stats />,
    psychology: <Psychology />,
    killzone: <KillzoneTimer />,
    news: <NewsFeed />,
    journal: <Journal />,
  };

  const bottomNavScreens = ["home", "checklist", "logger", "stats", "journal"];

  return (
    <div style={{ minHeight: "100vh", background: "#050508" }}>
      {screenMap[screen] || screenMap["home"]}
      {bottomNavScreens.includes(screen) && (
        <BottomNav active={screen} onNavigate={setScreen} />
      )}
    </div>
  );
}
