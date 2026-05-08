const WORKER_URL = import.meta.env.VITE_NOTION_WORKER_URL || "";

export async function createTradeEntry(tradeData) {
  if (!WORKER_URL) {
    const saved = JSON.parse(localStorage.getItem("mb_trades") || "[]");
    saved.push(tradeData);
    localStorage.setItem("mb_trades", JSON.stringify(saved));
    return { ok: true, local: true };
  }
  const res = await fetch(`${WORKER_URL}/create-trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tradeData)
  });
  return res.json();
}

export async function updateTradeResult(tradeId, resultData) {
  if (!WORKER_URL) return { ok: false };
  const res = await fetch(`${WORKER_URL}/update-trade`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tradeId, ...resultData })
  });
  return res.json();
}

export async function getAllTrades(filters = {}) {
  if (!WORKER_URL) return [];
  try {
    const res = await fetch(`${WORKER_URL}/get-trades`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters)
    });
    return res.json();
  } catch {
    return [];
  }
}

export async function uploadTradeImage(file, tradeId, type) {
  if (!WORKER_URL) return { ok: false };
  const formData = new FormData();
  formData.append("image", file);
  formData.append("tradeId", tradeId);
  formData.append("type", type);
  const res = await fetch(`${WORKER_URL}/upload-image`, { method: "POST", body: formData });
  return res.json();
}
