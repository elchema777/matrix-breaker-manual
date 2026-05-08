/**
 * Cloudflare Worker — Notion API Proxy
 * Deploy at: workers.cloudflare.com (free tier)
 * Hides NOTION_API_KEY from the PWA frontend
 *
 * Env vars to set in Worker settings:
 *   NOTION_API_KEY  — from notion.so/my-integrations
 *   NOTION_DB_ID    — from notion_setup.py output
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ORIGIN = "https://elchema777.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const notionHeaders = {
      "Authorization": `Bearer ${env.NOTION_API_KEY}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    };

    const respond = (data, status = 200) => new Response(
      JSON.stringify(data),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    try {
      if (url.pathname === "/create-trade" && request.method === "POST") {
        const body = await request.json();
        const page = buildNotionPage(body, env.NOTION_DB_ID);
        const res = await fetch("https://api.notion.com/v1/pages", {
          method: "POST", headers: notionHeaders, body: JSON.stringify(page)
        });
        const data = await res.json();
        return respond({ ok: res.ok, id: data.id, tradeId: body.tradeId });
      }

      if (url.pathname === "/update-trade" && request.method === "PATCH") {
        const body = await request.json();
        const { tradeId, ...updates } = body;
        const pageId = await findPageByTradeId(tradeId, notionHeaders, env.NOTION_DB_ID);
        if (!pageId) return respond({ ok: false, error: "Trade not found" }, 404);
        const props = buildUpdateProps(updates);
        const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
          method: "PATCH", headers: notionHeaders,
          body: JSON.stringify({ properties: props })
        });
        return respond({ ok: res.ok });
      }

      if (url.pathname === "/get-trades" && request.method === "POST") {
        const filters = await request.json().catch(() => ({}));
        const query = { database_id: env.NOTION_DB_ID, sorts: [{ property: "Date & Time", direction: "descending" }], page_size: 50 };
        if (filters.instrument && filters.instrument !== "all") {
          query.filter = { property: "Instrument", select: { equals: filters.instrument } };
        }
        const res = await fetch("https://api.notion.com/v1/databases/" + env.NOTION_DB_ID + "/query", {
          method: "POST", headers: notionHeaders, body: JSON.stringify(query)
        });
        const data = await res.json();
        const trades = (data.results || []).map(parseNotionPage);
        return respond(trades);
      }

      return respond({ error: "Not found" }, 404);
    } catch (e) {
      return respond({ error: e.message }, 500);
    }
  }
};

function buildNotionPage(trade, dbId) {
  return {
    parent: { database_id: dbId },
    properties: {
      "Trade Name": { title: [{ text: { content: trade.tradeId || `MB-${Date.now()}` } }] },
      "Date & Time": { date: { start: trade.timestamp || new Date().toISOString() } },
      "Instrument": { select: { name: trade.instrument || "XAUUSD" } },
      "Direction": { select: { name: trade.direction === "LONG" ? "Long" : "Short" } },
      "Entry Price": { number: parseFloat(trade.entry) || 0 },
      "Stop Loss": { number: parseFloat(trade.sl) || 0 },
      "Take Profit": { number: parseFloat(trade.tp) || 0 },
      "RR Ratio": { number: parseFloat(trade.rr) || 0 },
      "Emotion Score Before": { number: trade.psych || 7 },
      "Outcome": { select: { name: "Still Open" } },
    }
  };
}

function buildUpdateProps(updates) {
  const props = {};
  if (updates.pnl !== undefined) props["PnL USD"] = { number: parseFloat(updates.pnl) };
  if (updates.outcome) props["Outcome"] = { select: { name: updates.outcome } };
  if (updates.pnlR !== undefined) props["PnL in R"] = { number: parseFloat(updates.pnlR) };
  return props;
}

async function findPageByTradeId(tradeId, headers, dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: "POST", headers,
    body: JSON.stringify({ filter: { property: "Trade Name", title: { equals: tradeId } } })
  });
  const data = await res.json();
  return data.results?.[0]?.id || null;
}

function parseNotionPage(page) {
  const p = page.properties;
  const getProp = (key, type) => {
    const prop = p[key];
    if (!prop) return null;
    if (type === "title") return prop.title?.[0]?.plain_text;
    if (type === "number") return prop.number;
    if (type === "select") return prop.select?.name;
    if (type === "date") return prop.date?.start;
    return null;
  };
  return {
    id: page.id,
    tradeId: getProp("Trade Name", "title"),
    timestamp: getProp("Date & Time", "date"),
    instrument: getProp("Instrument", "select"),
    direction: getProp("Direction", "select"),
    entry: getProp("Entry Price", "number"),
    sl: getProp("Stop Loss", "number"),
    tp: getProp("Take Profit", "number"),
    rr: getProp("RR Ratio", "number"),
    pnl: getProp("PnL USD", "number"),
    outcome: getProp("Outcome", "select"),
    psych: getProp("Emotion Score Before", "number"),
    grade: getProp("Risk % Used", "select"),
  };
}
