"""
Run once to create the Notion trading journal database.
Usage: python scripts/notion_setup.py
Set env vars first: NOTION_API_KEY and NOTION_PARENT_PAGE_ID
"""

import requests
import os

NOTION_API_KEY = os.environ.get("NOTION_API_KEY", "")
PARENT_PAGE_ID = os.environ.get("NOTION_PARENT_PAGE_ID", "")

if not NOTION_API_KEY or not PARENT_PAGE_ID:
    print("❌ Set NOTION_API_KEY and NOTION_PARENT_PAGE_ID env vars first")
    print("   export NOTION_API_KEY=secret_xxx")
    print("   export NOTION_PARENT_PAGE_ID=your-page-id")
    exit(1)

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

DATABASE = {
    "parent": {"type": "page_id", "page_id": PARENT_PAGE_ID},
    "title": [{"type": "text", "text": {"content": "📊 Matrix Breaker — Manual Trading Journal"}}],
    "properties": {
        "Trade Name": {"title": {}},
        "Date & Time": {"date": {}},
        "Session": {"select": {"options": [
            {"name": "London", "color": "blue"},
            {"name": "New York", "color": "green"},
            {"name": "LN-NY Overlap", "color": "yellow"},
            {"name": "Asian", "color": "purple"},
            {"name": "Off-Session", "color": "gray"}
        ]}},
        "Instrument": {"select": {"options": [
            {"name": "XAUUSD", "color": "yellow"},
            {"name": "GER40", "color": "blue"},
            {"name": "NAS100", "color": "green"}
        ]}},
        "Direction": {"select": {"options": [
            {"name": "Long", "color": "green"},
            {"name": "Short", "color": "red"}
        ]}},
        "Entry Price": {"number": {"format": "number"}},
        "Stop Loss": {"number": {"format": "number"}},
        "Take Profit": {"number": {"format": "number"}},
        "Position Size Lots": {"number": {"format": "number"}},
        "Risk % Used": {"select": {"options": [
            {"name": "1%", "color": "green"},
            {"name": "0.5%", "color": "yellow"},
            {"name": "Other", "color": "gray"}
        ]}},
        "Risk USD": {"number": {"format": "dollar"}},
        "RR Ratio": {"number": {"format": "number"}},
        "Duration Minutes": {"number": {"format": "number"}},
        "Outcome": {"select": {"options": [
            {"name": "Win", "color": "green"},
            {"name": "Loss", "color": "red"},
            {"name": "Breakeven", "color": "yellow"},
            {"name": "Still Open", "color": "blue"}
        ]}},
        "PnL USD": {"number": {"format": "dollar"}},
        "PnL in R": {"number": {"format": "number"}},
        "Screenshot Before": {"files": {}},
        "Screenshot After": {"files": {}},
        "Liquidity Sweep": {"checkbox": {}},
        "Displacement ATR": {"checkbox": {}},
        "Fair Value Gap": {"checkbox": {}},
        "Order Block": {"checkbox": {}},
        "Market Structure Shift": {"checkbox": {}},
        "DXY Confirmed": {"checkbox": {}},
        "Killzone Entry": {"checkbox": {}},
        "No Red News": {"checkbox": {}},
        "Sleep Quality": {"number": {"format": "number"}},
        "Emotion Before": {"select": {"options": [
            {"name": "Calm", "color": "green"},
            {"name": "Confident", "color": "blue"},
            {"name": "Anxious", "color": "orange"},
            {"name": "FOMO", "color": "red"},
            {"name": "Bored", "color": "gray"},
            {"name": "Tired", "color": "purple"},
            {"name": "Revenge", "color": "red"}
        ]}},
        "Emotion Score Before": {"number": {"format": "number"}},
        "Emotion During": {"number": {"format": "number"}},
        "Emotion After": {"number": {"format": "number"}},
        "Followed All Rules": {"select": {"options": [
            {"name": "Yes", "color": "green"},
            {"name": "Partial", "color": "yellow"},
            {"name": "No", "color": "red"}
        ]}},
        "Mistakes Made": {"multi_select": {"options": [
            {"name": "Early Entry", "color": "red"},
            {"name": "Wrong SL Size", "color": "orange"},
            {"name": "No Clear Plan", "color": "red"},
            {"name": "Oversized", "color": "red"},
            {"name": "Revenge Trade", "color": "red"},
            {"name": "FOMO Entry", "color": "orange"},
            {"name": "Moved SL", "color": "red"},
            {"name": "Skipped Checklist", "color": "orange"},
            {"name": "Traded News", "color": "red"}
        ]}},
        "Lesson Learned": {"rich_text": {}},
        "Would Take Again": {"checkbox": {}}
    }
}

print("🔄 Creating Notion database...")
res = requests.post("https://api.notion.com/v1/databases", headers=HEADERS, json=DATABASE)

if res.status_code == 200:
    db = res.json()
    db_id = db["id"]
    print(f"✅ Database created successfully!")
    print(f"   DB ID: {db_id}")
    print(f"\n   → Add to GitHub Secrets as: NOTION_DB_ID")
    print(f"   → Set in Cloudflare Worker as: NOTION_DB_ID")
else:
    print(f"❌ Error {res.status_code}: {res.text}")
