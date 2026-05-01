export function getVsHubspotHTML(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Insertabot vs HubSpot Chatbot (2026): Standalone vs CRM-Locked</title>
  <meta name="description" content="HubSpot's chatbot is free but locks you into their CRM. Insertabot works standalone on any site, with real-time search, for $9.99/mo. Compare here." />
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
      <a href="/vs-tidio">vs Tidio</a>
      <a href="/signup" class="nav-cta">Start Free</a>
    </div>
  </nav>
</header>

<section class="hero">
  <h1>Insertabot vs HubSpot Chatbot</h1>
  <p>HubSpot's chatbot is "free." But free comes with strings — specifically, you're now in the HubSpot ecosystem. If you ever want to leave, good luck. Here's why Insertabot is the simpler, smarter choice.</p>
  <a href="/signup" class="btn btn-primary">Try Insertabot Free →</a>
</section>

<div class="container">
  <section class="section">
    <h2>Side-by-Side Comparison</h2>
    <table class="comparison-table">
      <thead>
        <tr><th>Feature</th><th>Insertabot</th><th>HubSpot</th></tr>
      </thead>
      <tbody>
        <tr class="highlight">
          <td class="feature">Free tier</td>
          <td class="yes">✅ 20/day, no CC</td>
          <td class="partial">⚡ Basic bot, requires CRM</td>
        </tr>
        <tr>
          <td class="feature">Paid plan</td>
          <td class="yes">$9.99/mo</td>
          <td class="no">$90/seat/mo (Pro)</td>
        </tr>
        <tr>
          <td class="feature">Works standalone</td>
          <td class="yes">✅ Any website</td>
          <td class="no">❌ HubSpot CRM required</td>
        </tr>
        <tr>
          <td class="feature">Real-time web search</td>
          <td class="yes">✅ Included</td>
          <td class="no">❌ Static only</td>
        </tr>
        <tr>
          <td class="feature">Setup time</td>
          <td class="yes">60 seconds</td>
          <td class="no">30+ min (CRM setup)</td>
        </tr>
        <tr>
          <td class="feature">Data ownership</td>
          <td class="yes">✅ You own everything</td>
          <td class="no">❌ HubSpot controls data</td>
        </tr>
        <tr>
          <td class="feature">Privacy</td>
          <td class="yes">✅ No tracking, no ads</td>
          <td class="no">❌ Marketing tracking built-in</td>
        </tr>
        <tr>
          <td class="feature">WordPress plugin</td>
          <td class="yes">✅ Native</td>
          <td class="partial">⚡ Via HubSpot plugin</td>
        </tr>
        <tr>
          <td class="feature">Custom branding</td>
          <td class="yes">✅ All plans</td>
          <td class="no">❌ Extra cost</td>
        </tr>
        <tr>
          <td class="feature">AI quality</td>
          <td class="yes">✅ GPT-4</td>
          <td class="partial">⚡ Basic bot builder</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>The CRM Trap</h2>
    <p>HubSpot's "free" chatbot requires a HubSpot CRM account. That means:</p>
    <ul style="color:var(--muted); margin:16px 0 16px 24px; font-size:1.05rem; line-height:1.8;">
      <li>Your contacts are now in their system</li>
      <li>Your data feeds their marketing machine</li>
      <li>Moving away? Export is painful</li>
      <li>Scaling up? <strong>$90/seat/month</strong> minimum</li>
    </ul>
    <p>Insertabot doesn't care what CRM you use (or don't use). <strong>Your data is yours. Period.</strong></p>
  </section>

  <section class="section">
    <h2>The Privacy Difference</h2>
    <p>HubSpot's business model is marketing automation. They track visitors, score leads, and retarget. That's great for enterprise sales teams. Not so great if you respect your visitors' privacy.</p>
    <p>Insertabot doesn't track, doesn't retarget, doesn't sell data. <strong>We charge a fair price instead of monetizing your visitors.</strong></p>
  </section>

  <section class="section">
    <h2>Setup: Minutes vs Hours</h2>
    <div class="highlight-box">
      <p><strong>HubSpot:</strong> Create account → Configure CRM → Set up chatbot → Integrate with site → Train bot → Test flows. <span class="price-tag price-competitor">2+ hours</span></p>
      <p style="margin-top:12px;"><strong>Insertabot:</strong> Install plugin → Paste key → Done. <span class="price-tag price-insertabot">60 seconds</span></p>
    </div>
  </section>

  <section class="section">
    <h3>Who Should Use HubSpot?</h3>
    <p>Enterprise teams with dedicated sales ops, existing HubSpot CRM investment, and complex lead scoring needs.</p>
    <h3>Who Should Use Insertabot?</h3>
    <p>Anyone who wants a chatbot that works today, without signing their data away to a CRM giant.</p>
  </section>
</div>

<section class="cta-section">
  <h2>Your website. Your data. Your chatbot.</h2>
  <p style="color:var(--muted); font-size:1.1rem; max-width:600px; margin:0 auto 28px;">No CRM required. No lock-in. No tracking. Just AI that answers questions.</p>
  <a href="/signup?utm_source=comparison&utm_medium=landing&utm_campaign=vs-hubspot" class="btn btn-primary">Try Insertabot Free</a>
</section>

<div class="container">
  <section class="section faq">
    <h2>Frequently Asked Questions</h2>
    <div class="faq-item">
      <h4>Is Insertabot cheaper than HubSpot?</h4>
      <p>Dramatically. Insertabot Pro is $9.99/mo flat. HubSpot Service Hub Pro starts at $90/seat/mo. For a 3-person team, that's $270/mo vs $9.99.</p>
    </div>
    <div class="faq-item">
      <h4>Does Insertabot require a CRM?</h4>
      <p>No. Insertabot is completely standalone. Works on any website with zero CRM dependency.</p>
    </div>
    <div class="faq-item">
      <h4>Can Insertabot replace HubSpot chatbot?</h4>
      <p>For AI chatbot functionality, yes. If you need HubSpot's CRM, email marketing, and sales pipeline, keep HubSpot and add Insertabot for the chatbot.</p>
    </div>
    <div class="faq-item">
      <h4>Is Insertabot more private than HubSpot?</h4>
      <p>Yes. We don't track visitors, don't use cookies for ads, and don't sell data. We charge a subscription instead of monetizing your users.</p>
    </div>
  </section>

  <section class="section" style="text-align:center; margin-bottom:60px;">
    <p style="color:var(--muted);">Also compare:</p>
    <div class="also-compare">
      <a href="/vs-chatbase">Insertabot vs Chatbase →</a>
      <a href="/vs-tidio">Insertabot vs Tidio →</a>
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
