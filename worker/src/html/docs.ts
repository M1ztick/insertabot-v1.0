/**
 * Documentation / Help Page HTML
 */

export function getDocsHTML(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Help & Documentation – Insertabot</title>
  <meta name="description" content="Installation guides, troubleshooting tips, and answers to common questions about Insertabot." />
  <style>
    :root {
      --bg: #000;
      --panel: rgba(10,10,10,0.8);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --cyan: #00f5ff;
      --magenta: #ff00ff;
      --border: rgba(255,255,255,0.08);
      --radius: 14px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    a { color: var(--cyan); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── NAV ── */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(10px);
      background: rgba(0,0,0,0.9);
      border-bottom: 1px solid rgba(0,245,255,0.2);
    }
    .nav {
      max-width: 960px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-decoration: none;
    }
    .nav-links { display: flex; gap: 20px; align-items: center; }
    .nav-links a { color: var(--muted); font-size: 0.9rem; transition: color 0.2s; }
    .nav-links a:hover { color: var(--cyan); text-decoration: none; }
    .nav-cta {
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff !important;
    }

    /* ── LAYOUT ── */
    .page {
      max-width: 960px;
      margin: 0 auto;
      padding: 56px 24px 80px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 56px;
    }
    .page-header h1 {
      font-size: clamp(1.8rem, 5vw, 2.8rem);
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    .page-header p {
      color: var(--muted);
      font-size: 1.05rem;
      max-width: 540px;
      margin: 0 auto;
    }

    /* ── SECTIONS ── */
    .section { margin-bottom: 48px; }
    .section h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--cyan);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0,245,255,0.2);
    }

    /* ── STEPS ── */
    .steps { display: flex; flex-direction: column; gap: 14px; }
    .step {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 20px;
    }
    .step-num {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #000;
      font-weight: 800;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-body strong { display: block; margin-bottom: 4px; }
    .step-body p { color: var(--muted); font-size: 0.92rem; }

    /* ── FAQ ACCORDIONS ── */
    .faq { display: flex; flex-direction: column; gap: 10px; }
    details {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    details[open] { border-color: rgba(0,245,255,0.25); }
    summary {
      padding: 16px 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }
    summary::-webkit-details-marker { display: none; }
    summary::after {
      content: '+';
      font-size: 1.2rem;
      color: var(--cyan);
      flex-shrink: 0;
      margin-left: 12px;
    }
    details[open] summary::after { content: '−'; }
    .faq-body {
      padding: 0 20px 16px;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.7;
    }
    .faq-body code {
      background: rgba(0,245,255,0.08);
      border: 1px solid rgba(0,245,255,0.2);
      border-radius: 5px;
      padding: 1px 6px;
      font-size: 0.88em;
      color: var(--cyan);
    }
    .faq-body ul { padding-left: 18px; margin-top: 8px; }
    .faq-body li { margin-bottom: 6px; }

    /* ── CHAT CTA ── */
    .chat-cta {
      margin-top: 56px;
      background: linear-gradient(135deg, rgba(0,245,255,0.07), rgba(255,0,255,0.07));
      border: 1px solid rgba(0,245,255,0.25);
      border-radius: 18px;
      padding: 40px 32px;
      text-align: center;
    }
    .chat-cta h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .chat-cta p { color: var(--muted); margin-bottom: 24px; }
    .btn {
      display: inline-block;
      padding: 13px 32px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      box-shadow: 0 0 20px rgba(0,245,255,0.3);
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(0,245,255,0.45); text-decoration: none; }

    /* ── FOOTER ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 28px 24px;
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
    }
    footer a { color: var(--muted); }
    footer a:hover { color: var(--cyan); }

    @media (max-width: 540px) {
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

<header>
  <nav class="nav">
    <a href="${origin}/" class="logo">Insertabot</a>
    <div class="nav-links">
      <a href="${origin}/">Home</a>
      <a href="${origin}/dashboard">Dashboard</a>
      <a href="${origin}/signup" class="nav-cta">Get Started Free</a>
    </div>
  </nav>
</header>

<main class="page">

  <div class="page-header">
    <h1>Help & Documentation</h1>
    <p>Everything you need to get Insertabot up and running on your WordPress site.</p>
  </div>

  <!-- ── INSTALLATION ── -->
  <section class="section">
    <h2>Quick Start — WordPress Installation</h2>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <strong>Install the plugin</strong>
          <p>In your WordPress admin go to <em>Plugins → Add New</em>, search for <strong>Insertabot</strong>, and click Install &amp; Activate. Or upload the zip file manually.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <strong>Create a free account</strong>
          <p>Sign up at <a href="${origin}/signup">insertabot.io/signup</a>. You'll get 5 messages per hour and 20 messages per day on the free plan — no credit card required.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <strong>Verify your email</strong>
          <p>Check your inbox for the verification email and click the link. You can still log in before verifying — a reminder banner will appear in your dashboard.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <strong>Copy your API key and embed code</strong>
          <p>Log in to your <a href="${origin}/dashboard">dashboard</a>. You'll find your <strong>API Key</strong> and an <strong>Embed Code</strong> section — keep this tab open, you'll need both in the next steps.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-body">
          <strong>Paste the API key &amp; enable the chatbot</strong>
          <p>In WordPress go to <em>Settings → Insertabot</em>, paste your API key, toggle <strong>Enable Chatbot</strong> on, and click Save.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">6</div>
        <div class="step-body">
          <strong>Add the embed code to your site footer</strong>
          <p>Back in your dashboard, copy the script tag from the <strong>Embed Code</strong> section. Paste it before the closing <code>&lt;/body&gt;</code> tag on your site. The easiest way on WordPress is with the free <strong>Insert Headers and Footers</strong> plugin — paste the script into the Footer section and save. The chat widget will appear once this step is complete.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ── TROUBLESHOOTING ── -->
  <section class="section">
    <h2>Common Issues</h2>
    <div class="faq">

      <details>
        <summary>The chat widget isn't showing on my site</summary>
        <div class="faq-body">
          <ul>
            <li>Make sure you completed <strong>Step 6</strong> — the embed code script tag must be added to your site's footer. Without it, the widget will not load even if the plugin is active and the API key is correct. Use the free <strong>Insert Headers and Footers</strong> plugin to add it.</li>
            <li>Confirm the plugin is active and the API key is saved correctly in <em>Settings → Insertabot</em>.</li>
            <li>Check the <strong>Allowed Domains</strong> field in your dashboard. If it's set, your site's domain must be listed exactly (e.g. <code>mysite.com</code> — no https:// or trailing slash). Leave it blank to allow all domains.</li>
            <li>Disable any caching plugins temporarily and hard-refresh (<code>Ctrl+Shift+R</code> / <code>Cmd+Shift+R</code>) to rule out a cached page.</li>
            <li>Check your browser console (F12) for any JavaScript errors.</li>
          </ul>
        </div>
      </details>

      <details>
        <summary>I didn't receive my verification email</summary>
        <div class="faq-body">
          <ul>
            <li>Check your spam or junk folder — the email comes from <code>noreply@support.insertabot.io</code>.</li>
            <li>You can log in without verifying and resend the email from the banner inside your dashboard.</li>
            <li>Verification emails are rate-limited to one every 5 minutes.</li>
            <li>If it still doesn't arrive, email us at <a href="mailto:support@insertabot.io">support@insertabot.io</a>.</li>
          </ul>
        </div>
      </details>

      <details>
        <summary>I've hit my message limit — what are my options?</summary>
        <div class="faq-body">
          <p>The free plan includes <strong>5 messages per hour</strong> and <strong>20 messages per day</strong>. Limits reset automatically each hour/day.</p>
          <p style="margin-top:8px;">For higher limits, <a href="${origin}/?pricing=true">upgrade to Pro</a> — which includes 500 embedded messages per month plus unlimited playground access.</p>
        </div>
      </details>

      <details>
        <summary>I forgot my password</summary>
        <div class="faq-body">
          <p>Go to the <a href="${origin}/login">login page</a> and click <strong>Forgot password?</strong>. You'll receive a reset link by email. The link expires after 1 hour.</p>
        </div>
      </details>

      <details>
        <summary>How do I set up two-factor authentication (2FA)?</summary>
        <div class="faq-body">
          <p>Log in to your <a href="${origin}/dashboard">dashboard</a>, open the <strong>Security</strong> tab, and click <strong>Enable 2FA</strong>. Scan the QR code with any authenticator app (Google Authenticator, Authy, etc.) and confirm with a 6-digit code. Save your backup codes somewhere safe — they can be used if you lose access to your authenticator.</p>
        </div>
      </details>

      <details>
        <summary>How do I customise the chatbot's appearance?</summary>
        <div class="faq-body">
          <p>In your <a href="${origin}/dashboard">dashboard</a> go to the <strong>Configuration</strong> tab. From there you can change the bot name, primary colour, greeting message, avatar, and the system prompt that controls the bot's personality and knowledge.</p>
        </div>
      </details>

      <details>
        <summary>What data does the plugin send to Insertabot?</summary>
        <div class="faq-body">
          <ul>
            <li>The visitor's chat message</li>
            <li>Your site's domain (for Allowed Domains verification)</li>
            <li>Your API key (for authentication)</li>
          </ul>
          <p style="margin-top:8px;">IP addresses are anonymised. No personal visitor data is stored. See our privacy policy for full details.</p>
        </div>
      </details>

      <details>
        <summary>The bot's responses seem outdated — how does web search work?</summary>
        <div class="faq-body">
          <p>Insertabot performs a real-time web search for every message to supplement its answers with current information. If a response feels stale, try rephrasing your question to be more specific — the search works best with clear, focused queries.</p>
        </div>
      </details>

    </div>
  </section>

  <!-- ── CHAT CTA ── -->
  <div class="chat-cta">
    <h2>Still stuck? Ask Insertabot directly.</h2>
    <p>Our AI assistant knows the platform inside and out — installation, billing, troubleshooting, and more. Available 24/7.</p>
    <a href="${origin}/" class="btn">Chat with Insertabot →</a>
  </div>

</main>

<footer>
  <p>© ${new Date().getFullYear()} Insertabot by Mistyk Media &nbsp;·&nbsp; <a href="mailto:support@insertabot.io">support@insertabot.io</a> &nbsp;·&nbsp; <a href="${origin}/dashboard">Dashboard</a></p>
</footer>

</body>
</html>`;
}
