const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export async function getMarketBias() {
  try {
    const tickers = ["GC=F", "^GDAXI", "^NDX", "DX-Y.NYB"];
    const results = {};
    for (const ticker of tickers) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=30d`;
      const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
      const data = await res.json();
      const closes = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      if (closes.length >= 2) {
        const last = closes[closes.length - 1];
        const prev = closes[closes.length - 2];
        const ema20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(closes.length, 20);
        const bias = last > ema20 ? "BULL" : "BEAR";
        const change = ((last - prev) / prev * 100).toFixed(2);
        const nameMap = { "GC=F": "XAU", "^GDAXI": "GER", "^NDX": "NAS", "DX-Y.NYB": "DXY" };
        results[nameMap[ticker]] = { price: last?.toFixed(2), bias, change, ema20: ema20?.toFixed(2) };
      }
    }
    return results;
  } catch {
    return {};
  }
}
