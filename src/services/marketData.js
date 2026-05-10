// Twelve Data API — free tier: 800 calls/day
// Symbol mapping: XAU/USD | DAX | NDX | DXY
const TD_SYMBOLS = { XAUUSD: "XAU/USD", GER40: "DAX", NAS100: "NDX", DXY: "DXY" };
const CACHE_KEY = "mb_bias_cache";
const CACHE_TTL = 300_000; // 5 minutes

export async function getMarketBias() {
  // Return cached data if fresh
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }
  } catch {}

  const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY || "";
  const results = {};

  for (const [name, symbol] of Object.entries(TD_SYMBOLS)) {
    try {
      const res = await fetch(
        `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`
      );
      const q = await res.json();

      const price = parseFloat(q.close || 0);
      const prev  = parseFloat(q.previous_close || price);
      const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
      const ema20  = parseFloat(q.fifty_two_week?.low || 0); // fallback — EMA fetched separately if needed

      results[name] = {
        price:  price.toFixed(2),
        change: change.toFixed(2),
        high:   parseFloat(q.high  || 0).toFixed(2),
        low:    parseFloat(q.low   || 0).toFixed(2),
        bias:   change > 0 ? "BULL" : "BEAR",
      };
    } catch {
      results[name] = { price: "N/A", change: "0", high: "N/A", low: "N/A", bias: "NEUTRAL" };
    }
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: results, timestamp: Date.now() }));
  } catch {}

  return results;
}
