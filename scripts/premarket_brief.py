"""
Matrix Breaker Pre-Market Brief
Mon-Fri 2:45 AM Puerto Rico via GitHub Actions
"""

import yfinance as yf
import requests
import smtplib
import os
import random
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone, timedelta

RECIPIENT = "Ronronoa@gmail.com"
GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_PASS = os.environ["GMAIL_APP_PASSWORD"]
NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "")
PR_TZ = timezone(timedelta(hours=-4))

TICKERS = {
    "XAUUSD": "GC=F",
    "GER40": "^GDAXI",
    "NAS100": "^NDX",
    "DXY": "DX-Y.NYB"
}

PSYCH_TIPS = [
    "Trade the PLAN, not the P&L. Your job ends when you click buy/sell correctly.",
    "A loss following your rules is a WIN. A win breaking rules is a LOSS.",
    "FOMO is just fear wearing a disguise. The market will always give another setup.",
    "Your edge only works over 100+ trades. One loss means nothing.",
    "Before entry: Would I take this if I was flat on the week? If no — don't.",
    "Revenge trading is a second mistake on top of the first. Walk away.",
    "The best traders are bored. Excitement = gambling. Precision = profession.",
    "Process over outcome. You control the entry. You don't control the exit.",
    "Journal every trade like your future self will read it. Because they will.",
    "Size down when in doubt. A small win beats a big loss every time.",
    "The market doesn't know your stop loss. It moves for liquidity, not to hunt you.",
    "Consistency beats brilliance. 60% WR x 1000 trades beats 90% WR x 10.",
    "Your psychology IS your edge. Sharpen it like a blade.",
    "Never move your stop wider. That's hope, not strategy.",
    "A session where you did NOT trade can be a 10/10 session.",
    "Sleep, hydration, and mindset are part of your trading system.",
    "Grade your DECISIONS not your RESULTS. A+ decision + bad result = still A+.",
    "The market rewards patience and punishes urgency. Be water.",
    "If you need this trade to make rent — the trade is already lost.",
    "Three losses in a row = mandatory break. No exceptions.",
    "Your job is not to predict. React to what the market shows you.",
    "Professionals manage risk first. Amateurs manage profits first.",
    "Every great trader has a journal. Every blown account has excuses.",
    "The London killzone is your edge. Never trade impulsively before it.",
    "DXY tells the story. Gold just translates it. Read the original.",
    "A B-grade setup skipped protects your A-grade capital.",
    "Drawdowns are tuition fees. Pay attention to the lesson.",
    "One week of losses cannot stop a year of discipline.",
    "Trust the system you built. Doubt in the moment = untested belief in chaos.",
    "Financial freedom is built one disciplined trade at a time. Stay the course.",
]

QUOTES = [
    "The matrix cannot tell you who you are — only your discipline can.",
    "Every trade is a vote for the trader you are becoming.",
    "Small edges. Massive consistency. Total freedom.",
    "You don't rise to the level of your goals. You fall to the level of your systems.",
    "The market is a transfer of wealth from the impatient to the patient.",
    "Discipline is doing what needs to be done even when you don't feel like it.",
    "Your account is the scoreboard. Your journal is the game film.",
    "One percent better every day. That is how empires are built.",
]


def get_market_data():
    data = {}
    for name, ticker in TICKERS.items():
        try:
            t = yf.Ticker(ticker)
            hist = t.history(period="25d", interval="1d")
            if len(hist) >= 2:
                curr = hist['Close'].iloc[-1]
                prev = hist['Close'].iloc[-2]
                ema20 = hist['Close'].ewm(span=20).mean().iloc[-1]
                change_pct = ((curr - prev) / prev) * 100
                bias = "BULL ↑" if curr > ema20 else "BEAR ↓"
                bias_color = "#00FF88" if "BULL" in bias else "#FF3B3B"
                data[name] = {
                    "price": round(curr, 2),
                    "change_pct": round(change_pct, 2),
                    "high": round(hist['High'].iloc[-1], 2),
                    "low": round(hist['Low'].iloc[-1], 2),
                    "bias": bias,
                    "bias_color": bias_color,
                    "ema20": round(ema20, 2)
                }
        except Exception as e:
            print(f"⚠️ Error fetching {name}: {e}")
            data[name] = {
                "price": "N/A", "bias": "NEUTRAL →",
                "bias_color": "#FFD700", "change_pct": 0,
                "high": "N/A", "low": "N/A", "ema20": "N/A"
            }
    return data


def get_news():
    if not NEWS_API_KEY:
        return []
    try:
        url = (
            f"https://newsapi.org/v2/everything"
            f"?q=forex+gold+fed+economy&language=en"
            f"&sortBy=publishedAt&pageSize=5&apiKey={NEWS_API_KEY}"
        )
        r = requests.get(url, timeout=10)
        articles = r.json().get("articles", [])
        return [{"title": a["title"], "source": a["source"]["name"]} for a in articles[:5]]
    except Exception as e:
        print(f"⚠️ News fetch failed: {e}")
        return []


def build_html_email(market_data, news):
    now_pr = datetime.now(PR_TZ)
    date_str = now_pr.strftime("%A, %B %d %Y")
    time_str = now_pr.strftime("%I:%M %p")
    tip = random.choice(PSYCH_TIPS)
    quote = random.choice(QUOTES)

    xau = market_data.get("XAUUSD", {})
    ger = market_data.get("GER40", {})
    nas = market_data.get("NAS100", {})
    dxy = market_data.get("DXY", {})

    dxy_bullish = "BULL" in dxy.get("bias", "")
    dxy_impact = "BEARISH for Gold ⚠️" if dxy_bullish else "BULLISH for Gold ✅"
    dxy_color = "#FF3B3B" if dxy_bullish else "#00FF88"

    news_html = "".join([
        f'<li style="color:#B0B0C0;margin-bottom:8px;font-size:13px;">'
        f'📰 {n["title"]} '
        f'<span style="color:#6B6B80;">— {n["source"]}</span></li>'
        for n in news[:4]
    ]) or '<li style="color:#6B6B80;">Check ForexFactory.com for today\'s economic calendar</li>'

    def change_str(d):
        c = d.get('change_pct', 0)
        return f"{'+'if c>0 else ''}{c}%"

    return f"""<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Syne:wght@400;600&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#050508;font-family:'Syne',sans-serif;color:#F0F0F0}}
.wrap{{max-width:600px;margin:0 auto}}
.hdr{{background:linear-gradient(135deg,#0a0a14,#141428);border-bottom:2px solid #FFD700;padding:32px 24px;text-align:center}}
.logo{{font-family:'Orbitron',monospace;font-size:22px;font-weight:700;color:#FFD700;letter-spacing:3px}}
.sub{{color:#00D4FF;font-size:11px;letter-spacing:4px;margin-top:4px}}
.datebar{{background:#0d0d14;border-bottom:1px solid rgba(255,215,0,0.1);padding:12px 24px;text-align:center;color:#6B6B80;font-size:13px}}
.sec{{padding:24px;border-bottom:1px solid rgba(255,255,255,0.05)}}
.sec-title{{font-family:'Orbitron',monospace;font-size:11px;letter-spacing:3px;color:#FFD700;margin-bottom:16px}}
.icard{{background:rgba(255,255,255,0.03);border:1px solid rgba(255,215,0,0.1);border-radius:8px;padding:16px;margin-bottom:12px}}
.iname{{font-family:'Orbitron',monospace;font-size:13px;font-weight:700}}
.iprice{{font-size:22px;font-weight:600;margin:4px 0}}
.ibias{{font-size:12px;font-weight:600;letter-spacing:1px}}
.idetail{{color:#6B6B80;font-size:11px;margin-top:6px}}
.stepbox{{background:rgba(0,212,255,0.04);border-left:3px solid #00D4FF;padding:16px;border-radius:0 8px 8px 0;margin-bottom:12px}}
.step{{color:#B0B0C0;font-size:13px;line-height:2}}
.step strong{{color:#00D4FF}}
.riskbar{{background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);border-radius:8px;padding:16px;text-align:center}}
.riskamt{{font-family:'Orbitron',monospace;font-size:16px;color:#FFD700}}
.kzbadge{{display:inline-block;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:4px;padding:4px 10px;font-size:11px;color:#FFD700;margin:3px;font-family:'Orbitron',monospace}}
.psych{{background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.2);border-radius:8px;padding:20px}}
.ptip{{color:#E0E0F0;font-size:14px;line-height:1.8;font-style:italic}}
.ftr{{background:#0a0a14;border-top:1px solid rgba(255,215,0,0.1);padding:20px 24px;text-align:center}}
.rule{{color:#6B6B80;font-size:11px;margin:4px 0}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="logo">⬡ MATRIX BREAKER</div>
    <div class="sub">MANUAL TRADING DIVISION — PRE-MARKET BRIEF</div>
  </div>
  <div class="datebar">{date_str} &nbsp;|&nbsp; {time_str} Puerto Rico &nbsp;|&nbsp; London Killzone approaching</div>

  <div class="sec">
    <div class="sec-title">📊 MARKET BIAS</div>
    <div class="icard">
      <div class="iname">XAUUSD — Gold</div>
      <div class="iprice" style="color:{xau.get('bias_color','#FFD700')}">${xau.get('price','N/A')}</div>
      <div class="ibias" style="color:{xau.get('bias_color','#FFD700')}">{xau.get('bias','N/A')} &nbsp; {change_str(xau)}</div>
      <div class="idetail">H: {xau.get('high','N/A')} &nbsp;|&nbsp; L: {xau.get('low','N/A')} &nbsp;|&nbsp; EMA20: {xau.get('ema20','N/A')}</div>
    </div>
    <div class="icard">
      <div class="iname">GER40 — DAX</div>
      <div class="iprice" style="color:{ger.get('bias_color','#FFD700')}">{ger.get('price','N/A')}</div>
      <div class="ibias" style="color:{ger.get('bias_color','#FFD700')}">{ger.get('bias','N/A')} &nbsp; {change_str(ger)}</div>
      <div class="idetail">H: {ger.get('high','N/A')} &nbsp;|&nbsp; L: {ger.get('low','N/A')} &nbsp;|&nbsp; EMA20: {ger.get('ema20','N/A')}</div>
    </div>
    <div class="icard">
      <div class="iname">NAS100 — Nasdaq</div>
      <div class="iprice" style="color:{nas.get('bias_color','#FFD700')}">{nas.get('price','N/A')}</div>
      <div class="ibias" style="color:{nas.get('bias_color','#FFD700')}">{nas.get('bias','N/A')} &nbsp; {change_str(nas)}</div>
      <div class="idetail">H: {nas.get('high','N/A')} &nbsp;|&nbsp; L: {nas.get('low','N/A')} &nbsp;|&nbsp; EMA20: {nas.get('ema20','N/A')}</div>
    </div>
    <div class="icard">
      <div class="iname">DXY — Dollar Index</div>
      <div class="iprice" style="color:{dxy.get('bias_color','#FFD700')}">{dxy.get('price','N/A')}</div>
      <div class="ibias" style="color:{dxy_color}">{dxy_impact}</div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">⏰ KILLZONE SCHEDULE (Puerto Rico Time)</div>
    <span class="kzbadge">London 3:00 AM ← YOU ARE HERE</span>
    <span class="kzbadge">London Peak 4:00–5:00 AM</span>
    <span class="kzbadge">NY Open 8:30 AM</span>
    <span class="kzbadge" style="border-color:rgba(0,255,136,0.4);color:#00FF88;">🔥 LN/NY Overlap 8–11 AM ← BEST</span>
    <span class="kzbadge">NY Close 5:00 PM</span>
  </div>

  <div class="sec">
    <div class="sec-title">🎯 STEP-BY-STEP TRADE PLAN</div>
    <div class="stepbox">
      <div class="step">
        <strong>Step 1:</strong> DXY = {dxy.get('bias','N/A')} → {dxy_impact}<br>
        <strong>Step 2:</strong> Identify overnight HIGH and LOW on your instrument<br>
        <strong>Step 3:</strong> Wait for liquidity sweep above/below that range<br>
        <strong>Step 4:</strong> Confirm displacement candle &gt;1 ATR in opposite direction<br>
        <strong>Step 5:</strong> Find Fair Value Gap on 5M or 15M chart<br>
        <strong>Step 6:</strong> Enter on Order Block retest — SL below structure FIRST<br>
        <strong>Step 7:</strong> TP = 2.5R &nbsp;|&nbsp; BE at +1ATR &nbsp;|&nbsp; Trail with EMA21<br>
        <strong>Max 2 trades per session. Log every trade in the app.</strong>
      </div>
    </div>
    <div class="riskbar">
      <div style="color:#6B6B80;font-size:11px;margin-bottom:6px;">RISK PROTOCOL</div>
      <div class="riskamt">Trade 1: 1.0% &nbsp;&nbsp;|&nbsp;&nbsp; Trade 2 (if loss): 0.5%</div>
      <div style="color:#6B6B80;font-size:11px;margin-top:6px;">Set SL before entry. No exceptions. Ever.</div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">⚠️ MARKET NEWS</div>
    <ul style="list-style:none;padding:0">{news_html}</ul>
    <div style="background:rgba(255,59,59,0.08);border:1px solid rgba(255,59,59,0.2);border-radius:8px;padding:12px;margin-top:12px">
      <div style="color:#FF3B3B;font-size:12px;font-weight:600">🔴 RED EVENTS: No trades 30 minutes before and after</div>
      <div style="color:#6B6B80;font-size:11px;margin-top:4px">Check ForexFactory.com for full calendar with exact times</div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">🧠 PSYCHOLOGY TIP OF THE DAY</div>
    <div class="psych"><div class="ptip">"{tip}"</div></div>
  </div>

  <div style="text-align:center;padding:24px">
    <div style="color:#FFD700;font-size:14px;font-style:italic;line-height:1.8">"{quote}"</div>
  </div>

  <div class="ftr">
    <div class="rule">⚡ Risk 1% first trade &nbsp;|&nbsp; 0.5% if first loses</div>
    <div class="rule">⚡ Max 2 trades per session &nbsp;|&nbsp; Log every trade in the app</div>
    <div class="rule">⚡ Check journal after every trade &nbsp;|&nbsp; Trust the system</div>
    <div style="color:rgba(255,215,0,0.3);font-size:10px;margin-top:16px">Matrix Breaker Empire — Manual Trading Division</div>
  </div>
</div>
</body>
</html>"""


def send_email(html, market_data):
    now_pr = datetime.now(PR_TZ)
    xau_b = market_data.get("XAUUSD", {}).get("bias", "N/A")[:4]
    ger_b = market_data.get("GER40", {}).get("bias", "N/A")[:4]
    nas_b = market_data.get("NAS100", {}).get("bias", "N/A")[:4]
    subject = f"⚡ Matrix Breaker Brief — {now_pr.strftime('%a %b %d')} | XAU:{xau_b} GER:{ger_b} NAS:{nas_b}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL_USER
    msg["To"] = RECIPIENT
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(GMAIL_USER, GMAIL_PASS)
        s.sendmail(GMAIL_USER, RECIPIENT, msg.as_string())

    print(f"✅ Brief sent to {RECIPIENT} at {datetime.now(PR_TZ).strftime('%I:%M %p PR time')}")


if __name__ == "__main__":
    print("🔄 Fetching market data...")
    market_data = get_market_data()
    print(f"   XAU: {market_data.get('XAUUSD',{}).get('price','?')} {market_data.get('XAUUSD',{}).get('bias','?')}")
    print(f"   DXY: {market_data.get('DXY',{}).get('price','?')} {market_data.get('DXY',{}).get('bias','?')}")
    print("🔄 Fetching news...")
    news = get_news()
    print(f"   {len(news)} articles fetched")
    print("🔄 Building + sending email...")
    html = build_html_email(market_data, news)
    send_email(html, market_data)
