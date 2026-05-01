export function getVsChatbaseHTML(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Insertabot vs Chatbase (2026): Which AI Chatbot Is Better?</title>
  <meta name="description" content="Compare Insertabot and Chatbase side by side. See why Insertabot offers more free conversations, real-time web search, and costs 75% less. Try free." />
  <meta name="theme-color" content="#000000" />
  <style>
    :root {
      --bg: #000;
      --panel: rgba(10,10,10,0.7);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --cyan: #00f5ff;
      --magenta: #ff00ff;
      --green: #00ff88;
      --red: #ff4444;
      --radius: 16px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    header {
      position: sticky; top: 0; z-index: 1000;
      backdrop-filter: blur(10px);
      background: rgba(0,0,0,0.9);
      border-bottom: 1px solid rgba(0,245,255,0.2);
    }
    .nav {
      max-width: 1200px; margin: 0 auto; padding: 18px 20px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 16px;
    }
    .logo {
      font-size: 1.5rem; font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .nav-links { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
    .nav-links a { font-size: 0.95rem; color: var(--muted); transition: color 0.2s ease; }
    .nav-links a:hover { color: var(--cyan); }
    .nav-cta {
      padding: 10px 22px; border-radius: 10px; font-weight: 600;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff; box-shadow: 0 0 15px rgba(0,245,255,0.3);
    }
    .hero {
      max-width: 900px; margin: 0 auto; padding: 100px 20px 60px;
      text-align: center;
      background: radial-gradient(circle at center, rgba(0,245,255,0.06), transparent 65%);
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; margin-bottom: 20px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero p { font-size: 1.2rem; color: var(--muted); max-width: 700px; margin: 0 auto 30px; }
    .btn {
      padding: 15px 42px; border-radius: 12px; font-weight: 700; font-size: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease; display: inline-block;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff; box-shadow: 0 0 20px rgba(0,245,255,0.35);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(0,245,255,0.6); }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    .section { margin: 80px 0; }
    .section h2 {
      font-size: 2rem; font-weight: 700; margin-bottom: 24px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .section h3 { font-size: 1.4rem; color: var(--cyan); margin: 32px 0 16px; }
    .section p { color: var(--muted); font-size: 1.05rem; line-height: 1.8; margin-bottom: 16px; }
    .comparison-table {
      width: 100%; border-collapse: collapse; margin: 32px 0;
      background: var(--panel); border-radius: var(--radius); overflow: hidden;
      border: 1px solid rgba(0,245,255,0.2);
    }
    .comparison-table th {
      padding: 16px 20px; text-align: left; font-weight: 700;
      background: rgba(0,245,255,0.1); color: var(--cyan); font-size: 0.95rem;
    }
    .comparison-table td {
      padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 0.95rem;
    }
    .comparison-table .feature { color: var(--text); font-weight: 500; }
    .comparison-table .yes { color: var(--green); font-weight: 600; }
    .comparison-table .no { color: var(--red); }
    .comparison-table .highlight { background: rgba(0,245,255,0.05); }
    .highlight-box {
      background: var(--panel); border-radius: var(--radius);
      border: 1px solid rgba(0,245,255,0.3); padding: 32px;
      margin: 32px 0;
    }
    .highlight-box h3 { margin-top: 0; }
    .price-tag {
      display: inline-block; padding: 8px 20px; border-radius: 8px;
      font-weight: 700; font-size: 1.2rem; margin: 8px 0;
    }
    .price-insertabot { background: rgba(0,255,136,0.15); color: var(--green); border: 1px solid var(--green); }
    .price-competitor { background: rgba(255,68,68,0.15); color: var(--red); border: 1px solid var(--red); }
    .cta-section {
      text-align: center; padding: 80px 20px;
      background: radial-gradient(circle at center, rgba(255,0,255,0.05), transparent 70%);
      border-top: 2px solid transparent; border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, var(--magenta), var(--cyan)) 1;
      margin: 60px 0;
    }
    .cta-section h2 { font-size: 2.4rem; margin-bottom: 16px; }
    .faq { margin: 40px 0; }
    .faq-item { margin-bottom: 24px; }
    .faq-item h4 { color: var(--cyan); font-size: 1.1rem; margin-bottom: 8px; }
    .faq-item p { color: var(--muted); }
    footer {
      padding: 50px 20px; text-align: center;
      border-top: 1px solid rgba(0,245,255,0.2);
      color: #64748b; font-size: 0.9rem;
    }
    .also-compare {
      display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-top: 16px;
    }
    .also-compare a {
      padding: 8px 16px; border-radius: 8px;
      border: 1px solid rgba(0,245,255,0.3); color: var(--cyan);
      font-size: 0.9rem; transition: all 0.2s ease;
    }
    .also-compare a:hover { background: rgba(0,245,255,0.1); }
    @media (max-width: 640px) {
      .comparison-table th, .comparison-table td { padding: 10px 12px; font-size: 0.85rem; }
      .hero h1 { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
<header>
  <nav class="nav">
    <a href="/" class="logo">Insertabot</a>
    <div class="nav-links">
      <a href="/vs-tidio">vs Tidio</a>
      <a href="/vs-hubspot">vs HubSpot</a>
      <a href="/signup" class="nav-cta">Start Free</a>
    </div>
  </nav>
</header>

<section class="hero">
  <h1>Insertabot vs Chatbase</h1>
  <p>Looking for a Chatbase alternative? You're not alone. Chatbase is popular, but its free plan is severely limited — and the paid plans add up fast. Here's how Insertabot compares on features, pricing, and what actually matters.</p>
  <a href="/signup" class="btn btn-primary">Try Insertabot Free →</a>
</section>

<div class="container">
  <section class="section">
    <h2>Side-by-Side Comparison</h2>
    <table class="comparison-table">
      <thead>
        <tr><th>Feature</th><th>Insertabot</th><th>Chatbase</th></tr>
      </thead>
      <tbody>
        <tr class="highlight">
          <td class="feature">Free conversations</td>
          <td class="yes">20/day (600/mo)</td>
          <td class="no">50/mo</td>
        </tr>
        <tr>
          <td class="feature">Paid plan price</td>
          <td class="yes">$9.99/mo</td>
          <td class="no">$19-40/mo</td>
        </tr>
        <tr>
          <td class="feature">Real-time web search</td>
          <td class="yes">✅ Included</td>
          <td class="no">❌ Static only</td>
        </tr>
        <tr>
          <td class="feature">WordPress plugin</td>
          <td class="yes">✅ Native</td>
          <td class="no">❌ Embed only</td>
        </tr>
        <tr>
          <td class="feature">One-line embed</td>
          <td class="yes">✅ Any site</td>
          <td class="yes">✅ Any site</td>
        </tr>
        <tr>
          <td class="feature">Custom training</td>
          <td class="yes">✅ Upload FAQs/docs</td>
          <td class="yes">✅ Upload docs</td>
        </tr>
        <tr>
          <td class="feature">White label</td>
          <td class="yes">✅ All plans</td>
          <td class="no">❌ Extra $39/mo</td>
        </tr>
        <tr>
          <td class="feature">Analytics</td>
          <td class="yes">✅ Included</td>
          <td class="no">❌ Extra $39/mo</td>
        </tr>
        <tr>
          <td class="feature">Custom domain</td>
          <td class="yes">✅ Included</td>
          <td class="no">❌ Extra $59/mo</td>
        </tr>
        <tr>
          <td class="feature">Data privacy</td>
          <td class="yes">✅ No tracking</td>
          <td class="no">❌ Uses your data</td>
        </tr>
        <tr>
          <td class="feature">Setup time</td>
          <td class="yes">60 seconds</td>
          <td class="no">5-10 minutes</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>The Free Plan Reality</h2>
    <p>Chatbase gives you 50 messages per month on their free plan. That's less than 2 per day. Insertabot gives you 20 per day — <strong>600 per month</strong>. For a small business getting started, that's the difference between "barely functional" and "actually useful."</p>
  </section>

  <section class="section">
    <h2>Why Real-Time Search Matters</h2>
    <p>Chatbase trains on documents you upload. That's great — until your prices change, your hours update, or you launch a new product. <strong>Insertabot searches the web in real time</strong>, so your visitors always get current answers. No stale knowledge base to maintain.</p>
  </section>

  <section class="section">
    <h2>The Hidden Cost Problem</h2>
    <p>Chatbase pricing starts at $19/mo, but the real cost hits when you need:</p>
    <div class="highlight-box">
      <p>Custom domain: <span class="price-tag price-competitor">+$59/mo</span></p>
      <p>White label: <span class="price-tag price-competitor">+$39/mo</span></p>
      <p>Analytics: <span class="price-tag price-competitor">+$39/mo</span></p>
      <p style="margin-top:16px; font-size:1.1rem;"><strong>Real total: $236+/mo</strong></p>
      <p style="margin-top:12px;">Insertabot: <span class="price-tag price-insertabot">$9.99/mo</span> — everything included. No surprises.</p>
    </div>
  </section>

  <section class="section">
    <h3>Who Should Use Chatbase?</h3>
    <p>If you need complex AI actions, API integrations, and have a large team, Chatbase might be worth the investment. It's built for scale.</p>
    <h3>Who Should Use Insertabot?</h3>
    <p>If you want a chatbot that answers visitor questions with current info, costs less than a Netflix subscription, works on any website in 60 seconds, and respects your visitors' privacy — Insertabot is built for you.</p>
  </section>
</div>

<section class="cta-section">
  <h2>Ready to switch?</h2>
  <p style="color:var(--muted); font-size:1.1rem; max-width:600px; margin:0 auto 28px;">Migrate from Chatbase to Insertabot in under 2 minutes. Same chatbot power, fraction of the cost.</p>
  <a href="/signup?utm_source=comparison&utm_medium=landing&utm_campaign=vs-chatbase" class="btn btn-primary">Start Free — No Credit Card</a>
</section>

<div class="container">
  <section class="section faq">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-item">
      <h4>Is Insertabot cheaper than Chatbase?</h4>
      <p>Yes. Insertabot Pro is $9.99/mo with all features included. Chatbase starts at $19/mo but real costs exceed $236/mo with essential add-ons.</p>
    </div>
    <div class="faq-item">
      <h4>Does Insertabot have real-time search like Chatbase?</h4>
      <p>Better — Insertabot includes real-time web search on ALL plans (even free). Chatbase only uses static knowledge bases.</p>
    </div>
    <div class="faq-item">
      <h4>Can I use Insertabot on WordPress?</h4>
      <p>Yes — we have a native WordPress plugin. Install, activate, paste your key. Done in 60 seconds.</p>
    </div>
    <div class="faq-item">
      <h4>How many free conversations does Insertabot offer?</h4>
      <p>20 per day (600/month) on the free plan. No credit card required.</p>
    </div>
  </section>

  <section class="section" style="text-align:center; margin-bottom:60px;">
    <p style="color:var(--muted);">Also compare:</p>
    <div class="also-compare">
      <a href="/vs-tidio">Insertabot vs Tidio →</a>
      <a href="/vs-hubspot">Insertabot vs HubSpot →</a>
    </div>
  </section>
</div>

<footer>
  <p>© 2026 Insertabot. All rights reserved.</p>
</footer>

<script src="${origin}/widget.js" data-api-key="ib_sk_demo_62132eda22a524d715034a7013a7b20e2a36f93b71b588d3354d74e4024e9ed7"></script>
</body>
</html>`;
}
