export function getVsTidioHTML(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Insertabot vs Tidio (2026): Better Free Plan, Lower Price</title>
  <meta name="description" content="Tidio's free plan only covers 50 conversations/month. Insertabot gives you 600. See the full comparison and why small businesses are switching." />
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
      background: var(--bg); color: var(--text); line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    header {
      position: sticky; top: 0; z-index: 1000;
      backdrop-filter: blur(10px); background: rgba(0,0,0,0.9);
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
      max-width: 900px; margin: 0 auto; padding: 100px 20px 60px; text-align: center;
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
    .comparison-table .partial { color: #ffaa00; }
    .comparison-table .highlight { background: rgba(0,245,255,0.05); }
    .highlight-box {
      background: var(--panel); border-radius: var(--radius);
      border: 1px solid rgba(0,245,255,0.3); padding: 32px; margin: 32px 0;
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
      <a href="/vs-chatbase">vs Chatbase</a>
      <a href="/vs-hubspot">vs HubSpot</a>
      <a href="/signup" class="nav-cta">Start Free</a>
    </div>
  </nav>
</header>

<section class="hero">
  <h1>Insertabot vs Tidio</h1>
  <p>Tidio is a solid choice for e-commerce chat. But if you're a small business, solopreneur, or running a service site, you're paying for features you'll never use. Here's the breakdown.</p>
  <a href="/signup" class="btn btn-primary">Try Insertabot Free →</a>
</section>

<div class="container">
  <section class="section">
    <h2>Side-by-Side Comparison</h2>
    <table class="comparison-table">
      <thead>
        <tr><th>Feature</th><th>Insertabot</th><th>Tidio</th></tr>
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
          <td class="no">$24-49/mo</td>
        </tr>
        <tr>
          <td class="feature">Real-time web search</td>
          <td class="yes">✅ Included</td>
          <td class="no">❌ Static responses</td>
        </tr>
        <tr>
          <td class="feature">E-commerce focus</td>
          <td class="partial">⚡ General purpose</td>
          <td class="yes">✅ Shopify/WooCommerce</td>
        </tr>
        <tr>
          <td class="feature">Setup complexity</td>
          <td class="yes">60 seconds, no code</td>
          <td class="no">10-15 min, more config</td>
        </tr>
        <tr>
          <td class="feature">AI sophistication</td>
          <td class="yes">✅ GPT-4 powered</td>
          <td class="partial">⚡ Lyro AI (separate)</td>
        </tr>
        <tr>
          <td class="feature">Live chat handoff</td>
          <td class="no">❌ Not yet</td>
          <td class="yes">✅ Included</td>
        </tr>
        <tr>
          <td class="feature">CRM integration</td>
          <td class="no">❌ Standalone</td>
          <td class="yes">✅ Native to Tidio CRM</td>
        </tr>
        <tr>
          <td class="feature">Data privacy</td>
          <td class="yes">✅ No tracking</td>
          <td class="partial">⚡ Uses Tidio systems</td>
        </tr>
        <tr>
          <td class="feature">WordPress plugin</td>
          <td class="yes">✅ Native</td>
          <td class="yes">✅ Available</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>The E-Commerce Tax</h2>
    <p>Tidio is built for online stores. That means Shopify integrations, product recommendation flows, and abandoned cart recovery. Great if you sell products. Overkill (and overpriced) if you don't.</p>
    <p>Insertabot is built for <strong>ANY website</strong> — portfolios, blogs, service businesses, local shops. You get AI that answers questions, not a Swiss Army knife you're paying for but half the tools are irrelevant.</p>
  </section>

  <section class="section">
    <h2>AI That Actually Knows Current Info</h2>
    <p>Tidio's AI (Lyro) uses static responses. Ask about your current hours, today's weather, or a recent blog post — it won't know. <strong>Insertabot searches the web in real time.</strong> Always current. Always accurate.</p>
  </section>

  <section class="section">
    <h2>The Price Gap</h2>
    <div class="highlight-box">
      <p>Tidio Growth: <span class="price-tag price-competitor">$49/mo minimum</span></p>
      <p>Insertabot Pro: <span class="price-tag price-insertabot">$9.99/mo</span></p>
      <p style="margin-top:16px; font-size:1.1rem;"><strong>That's $470/year in savings.</strong> For a small business, that's real money.</p>
    </div>
  </section>

  <section class="section">
    <h3>Who Should Use Tidio?</h3>
    <p>E-commerce stores on Shopify or WooCommerce that need product recommendations, order tracking, and live chat handoff.</p>
    <h3>Who Should Use Insertabot?</h3>
    <p>Service businesses, consultants, creatives, local shops, bloggers — anyone who wants visitors to get instant, accurate answers without the e-commerce bloat.</p>
  </section>
</div>

<section class="cta-section">
  <h2>Stop overpaying for features you don't need.</h2>
  <p style="color:var(--muted); font-size:1.1rem; max-width:600px; margin:0 auto 28px;">Insertabot: AI chatbot for your actual business. $9.99/mo. Try free first.</p>
  <a href="/signup?utm_source=comparison&utm_medium=landing&utm_campaign=vs-tidio" class="btn btn-primary">Get Started Free</a>
</section>

<div class="container">
  <section class="section faq">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-item">
      <h4>Is Insertabot better than Tidio for small business?</h4>
      <p>For non-e-commerce small businesses, yes. You get 12x more free conversations, real-time search, and pay 80% less. Tidio makes sense if you run a Shopify store.</p>
    </div>
    <div class="faq-item">
      <h4>Does Insertabot work with Shopify?</h4>
      <p>Insertabot works on any website including Shopify via our one-line embed code. We don't have native Shopify-specific features like abandoned cart recovery, but our AI answers product questions with real-time search.</p>
    </div>
    <div class="faq-item">
      <h4>How does Insertabot pricing compare to Tidio?</h4>
      <p>Insertabot Pro: $9.99/mo flat. Tidio Growth: $49/mo minimum. Over a year, that's $470 saved with Insertabot.</p>
    </div>
    <div class="faq-item">
      <h4>Can Insertabot replace Tidio?</h4>
      <p>If you use Tidio for AI chatbot functionality and don't need live chat handoff or CRM, yes. If you need those features, stick with Tidio or use both.</p>
    </div>
  </section>

  <section class="section" style="text-align:center; margin-bottom:60px;">
    <p style="color:var(--muted);">Also compare:</p>
    <div class="also-compare">
      <a href="/vs-chatbase">Insertabot vs Chatbase →</a>
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
