export function getLandingHTML(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Insertabot by Mistyk Media – AI Chatbots for Every Website</title>

  <meta name="description" content="Launch a white-label AI chatbot on your website in minutes. No code. Powered by Cloudflare Workers AI." />
  <meta name="theme-color" content="#000000" />

  <style>
    :root {
      --bg: #000;
      --panel: rgba(10,10,10,0.7);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --cyan: #00f5ff;
      --magenta: #ff00ff;
      --radius: 16px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* ---------- NAV ---------- */

    header {
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
      background: rgba(0,0,0,0.9);
      border-bottom: 1px solid rgba(0,245,255,0.2);
    }

    .nav {
      max-width: 1200px;
      margin: 0 auto;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }

    .nav-links a {
      font-size: 0.95rem;
      color: var(--muted);
      transition: color 0.2s ease;
    }

    .nav-links a:hover {
      color: var(--cyan);
    }

    .nav-cta {
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 600;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      box-shadow: 0 0 15px rgba(0,245,255,0.3);
    }

    /* ---------- HERO ---------- */

    .hero {
      padding: 110px 20px 90px;
      text-align: center;
      position: relative;
      background: radial-gradient(circle at center, rgba(0,245,255,0.06), transparent 65%);
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, var(--cyan), var(--magenta)) 1;
    }

    .hero img {
      max-width: 180px;
      margin-bottom: 24px;
    }

    .hero h1 {
      font-size: clamp(2.5rem, 6vw, 3.6rem);
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }

    .hero h2 {
      font-size: 1.8rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .hero h3 {
      font-size: 1.2rem;
      font-weight: 400;
      margin-bottom: 36px;
      background: linear-gradient(135deg, var(--cyan), #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 15px 42px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      box-shadow: 0 0 20px rgba(0,245,255,0.35);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(0,245,255,0.6);
    }

    .btn-outline {
      border: 2px solid var(--cyan);
      color: var(--cyan);
    }

    /* ---------- MISSION ---------- */

    .mission {
      max-width: 900px;
      margin: 80px auto;
      padding: 0 20px;
      text-align: center;
    }

    .mission h2 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 28px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .mission p {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--text);
      margin-bottom: 20px;
      text-align: left;
    }

    .mission p:last-of-type {
      margin-bottom: 0;
    }

    .mission-quote {
      position: relative;
      padding: 0 30px;
    }

    .mission-quote::before {
      content: '\u201c';
      position: absolute;
      left: 0;
      top: -10px;
      font-size: 4rem;
      color: var(--cyan);
      opacity: 0.5;
      line-height: 1;
    }

    .mission-quote::after {
      content: '\u201d';
      position: absolute;
      right: 0;
      bottom: -30px;
      font-size: 4rem;
      color: var(--magenta);
      opacity: 0.5;
      line-height: 1;
    }

    .mission-attribution {
      margin-top: 24px;
      font-style: italic;
      font-size: 1rem;
      color: var(--cyan);
      text-align: right;
    }

    /* ---------- FEATURES ---------- */

    main {
      max-width: 1200px;
      margin: 80px auto;
      padding: 0 20px;
    }

    .features-heading {
      font-size: 2.4rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 50px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 28px;
    }

    @media (min-width: 768px) {
      .features {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .feature {
      background: var(--panel);
      border-radius: var(--radius);
      padding: 36px 30px;
      border: 1px solid rgba(0,245,255,0.2);
      text-align: center;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .feature:hover {
      transform: translateY(-6px);
      box-shadow: 0 0 28px rgba(0,245,255,0.15);
    }

    .feature h3 {
      font-size: 1.4rem;
      color: var(--cyan);
      margin-bottom: 12px;
    }

    .feature p {
      color: var(--muted);
      font-size: 0.95rem;
    }

    /* ---------- PRICING ---------- */

    .pricing {
      max-width: 1200px;
      margin: 90px auto;
      padding: 0 20px;
      text-align: center;
    }

    .pricing h2 {
      font-size: 2.4rem;
      font-weight: 700;
      margin-bottom: 16px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .pricing-subtitle {
      color: var(--muted);
      font-size: 1.1rem;
      margin-bottom: 56px;
    }

    .pricing-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 28px;
      max-width: 800px;
      margin: 0 auto;
    }

    @media (min-width: 640px) {
      .pricing-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .pricing-card {
      background: var(--panel);
      border-radius: var(--radius);
      padding: 44px 36px;
      border: 1px solid rgba(0,245,255,0.2);
      text-align: left;
      position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .pricing-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 0 28px rgba(0,245,255,0.15);
    }

    .pricing-card.featured {
      border-color: var(--cyan);
      box-shadow: 0 0 30px rgba(0,245,255,0.15);
    }

    .pricing-badge {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #000;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 16px;
      border-radius: 20px;
      white-space: nowrap;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .plan-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--cyan);
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .plan-price {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
      margin-bottom: 6px;
    }

    .plan-price span {
      font-size: 1rem;
      font-weight: 400;
      color: var(--muted);
    }

    .plan-desc {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .plan-features {
      list-style: none;
      margin-bottom: 36px;
    }

    .plan-features li {
      font-size: 0.95rem;
      color: var(--text);
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .plan-features li::before {
      content: '✓';
      color: var(--cyan);
      font-weight: 700;
      flex-shrink: 0;
    }

    .plan-features li.muted {
      color: var(--muted);
    }

    .plan-features li.muted::before {
      color: var(--muted);
    }

    .plan-cta {
      display: block;
      width: 100%;
      padding: 14px 0;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .plan-cta.primary {
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      box-shadow: 0 0 20px rgba(0,245,255,0.3);
    }

    .plan-cta.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(0,245,255,0.55);
    }

    .plan-cta.outline {
      border: 2px solid rgba(0,245,255,0.4);
      color: var(--cyan);
    }

    .plan-cta.outline:hover {
      border-color: var(--cyan);
      box-shadow: 0 0 16px rgba(0,245,255,0.15);
    }

    .pricing-climate {
      margin-top: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .pricing-climate p {
      font-size: 0.85rem;
      color: var(--muted);
    }

    /* ---------- DEMO ---------- */

    .demo {
      margin: 90px 0;
      padding: 90px 20px;
      text-align: center;
      border-top: 2px solid transparent;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(90deg, var(--magenta), var(--cyan)) 1;
      background: radial-gradient(circle at center, rgba(255,0,255,0.05), transparent 70%);
    }

    .demo h2 {
      font-size: 2.6rem;
      margin-bottom: 16px;
      background: linear-gradient(135deg, var(--magenta), var(--cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .demo p {
      font-size: 1.1rem;
      color: var(--muted);
    }

    /* ---------- WORDPRESS BANNER ---------- */

    .wp-banner {
      max-width: 1160px;
      margin: 48px auto 80px;
      border-radius: 24px;
      padding: 60px 56px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(0,245,255,0.07) 0%, rgba(255,0,255,0.07) 100%);
      border: 1px solid rgba(0,245,255,0.25);
      display: flex;
      align-items: center;
      gap: 48px;
      flex-wrap: wrap;
    }

    .wp-banner::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at top left, rgba(0,245,255,0.1), transparent 60%),
                  radial-gradient(ellipse at bottom right, rgba(255,0,255,0.08), transparent 60%);
      pointer-events: none;
    }

    .wp-banner-icon {
      font-size: 5.5rem;
      line-height: 1;
      flex-shrink: 0;
      filter: drop-shadow(0 0 24px rgba(0,245,255,0.4));
      animation: wp-float 4s ease-in-out infinite;
    }

    @keyframes wp-float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    .wp-banner-body {
      flex: 1;
      min-width: 260px;
    }

    .wp-banner-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,245,255,0.1);
      border: 1px solid rgba(0,245,255,0.3);
      border-radius: 99px;
      padding: 5px 14px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cyan);
      margin-bottom: 18px;
    }

    .wp-banner-eyebrow span {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--cyan);
      animation: wp-pulse 1.8s ease-in-out infinite;
    }

    @keyframes wp-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(0.7); }
    }

    .wp-banner h2 {
      font-size: clamp(1.7rem, 3.5vw, 2.4rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 14px;
      color: var(--text);
    }

    .wp-banner h2 em {
      font-style: normal;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .wp-banner p {
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 32px;
      max-width: 560px;
    }

    .wp-banner-actions {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .wp-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      box-shadow: 0 0 24px rgba(0,245,255,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }

    .wp-btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 40px rgba(0,245,255,0.55);
    }

    .wp-btn-primary svg {
      width: 18px;
      height: 18px;
      fill: #fff;
      flex-shrink: 0;
    }

    .wp-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: var(--muted);
    }

    .wp-badge::before {
      content: '✓';
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(0,245,255,0.12);
      color: var(--cyan);
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .wp-banner {
        padding: 40px 28px;
        flex-direction: column;
        gap: 24px;
        text-align: center;
      }
      .wp-banner p { max-width: 100%; }
      .wp-banner-actions { justify-content: center; }
    }

    /* ---------- FOOTER ---------- */

    footer {
      padding: 50px 20px;
      text-align: center;
      border-top: 1px solid rgba(0,245,255,0.2);
      color: #64748b;
      font-size: 0.9rem;
    }

    footer p + p {
      margin-top: 10px;
      opacity: 0.7;
    }
  </style>
</head>

<body>

<header>
  <nav class="nav" aria-label="Main navigation">
    <div class="logo">Insertabot</div>
    <div class="nav-links">
      <a href="/playground">Playground</a>
      <a href="/login">Login</a>
      <a href="/signup" class="nav-cta">Get Started Free</a>
    </div>
  </nav>
</header>

<section class="hero">
  <img src="/logo.png" alt="Insertabot logo" />
  <h1>Insertabot</h1>
  <h2>Add an AI chatbot to your site — it's free to start</h2>
  <h3>Up to 20 free AI conversations every day. No credit card. No coding required.</h3>

  <div class="hero-actions">
    <a href="/signup" class="btn btn-primary">Get Started Free</a>
    <a href="/playground" class="btn btn-outline">Try Live Demo →</a>
  </div>
</section>

<!-- WordPress Plugin Banner -->
<section class="wp-banner" id="wordpress">
  <div class="wp-banner-icon" aria-hidden="true">🔌</div>
  <div class="wp-banner-body">
    <div class="wp-banner-eyebrow">
      <span></span>
      WordPress Plugin Available
    </div>
    <h2>Running WordPress?<br><em>You're one click away.</em></h2>
    <p>Install the free Insertabot plugin directly from the WordPress plugin directory — no code, no fuss. Activate it, drop in your API key, and your AI chatbot is live on every page. It really is that simple.</p>
    <div class="wp-banner-actions">
      <a
        href="https://wordpress.org/plugins/insertabot-ai-chatbot-solution"
        target="_blank"
        rel="noopener noreferrer"
        class="wp-btn-primary"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM3.6 12c0-1.128.24-2.203.666-3.178L7.8 19.63A8.412 8.412 0 0 1 3.6 12zm8.4 8.4a8.46 8.46 0 0 1-2.406-.348l2.556-7.422 2.616 7.17a.75.75 0 0 0 .057.111A8.43 8.43 0 0 1 12 20.4zm1.158-12.558c.504-.027.957-.081.957-.081.45-.054.396-.714-.054-.687 0 0-1.353.108-2.226.108-.819 0-2.2-.108-2.2-.108-.45-.027-.504.66-.054.687 0 0 .426.054.876.081l1.302 3.564-1.83 5.484-3.042-9.048c.504-.027.957-.081.957-.081.45-.054.396-.714-.054-.687 0 0-1.353.108-2.226.108a12.51 12.51 0 0 1-.3-.006A8.4 8.4 0 0 1 12 3.6c2.196 0 4.2.84 5.706 2.214a.75.75 0 0 0-.054.018c-.45.135-.768.558-.768 1.044 0 .486.279.9.576 1.386.225.387.486.882.486 1.602 0 .495-.189 1.071-.45 1.872l-.588 1.968-2.13-6.342zm2.16 11.952-.012-.021 2.61-7.545c.486-1.215.648-2.187.648-3.051 0-.312-.021-.603-.057-.876A8.4 8.4 0 0 1 20.4 12a8.412 8.412 0 0 1-5.082 7.794z"/></svg>
        Install Free Plugin
      </a>
      <span class="wp-badge">100% free — no account needed to install</span>
    </div>
  </div>
</section>

<section class="mission">
  <h2>Who We Are</h2>
  <div class="mission-quote">
    <p>We are pioneers standing elbow-to-elbow with you on the front lines of the digital market. At Insertabot, we know the grit it takes to build something real—to deliver quality without sacrificing our values for a paycheck.</p>
    <p>We built Insertabot as a small but ongoing effort to close the resource gap between corporate giants and 'us little guys.' We refuse to compromise on privacy or ethics just to make a buck. That's why we created a tool that actually works, protects your users, and doesn't cost a fortune. Affordable, ethical, and built for the independent.</p>
  </div>
  <p class="mission-attribution">— Mistyk Media</p>
</section>

<main>
  <h2 class="features-heading">Everything You Get — Free to Start</h2>
  <section class="features">
    <article class="feature">
      <h3>⚡ Up and Running in Minutes</h3>
      <p>WordPress? Install the plugin, paste your API key, flip a switch. Any other site? One script tag and you're live.</p>
    </article>

    <article class="feature">
      <h3>🎨 Make It Yours</h3>
      <p>Change the colors, name your bot, set a greeting — no designer needed. It'll look like it was built just for your site.</p>
    </article>

    <article class="feature">
      <h3>🧠 Always Up-to-Date Answers</h3>
      <p>Unlike other AI tools, Insertabot searches the web in real time so your visitors get current answers — not outdated guesses.</p>
    </article>

    <article class="feature">
      <h3>🔒 Safe &amp; Secure</h3>
      <p>Your chatbot is protected out of the box. Rate limiting, origin protection, and encrypted keys — all handled for you.</p>
    </article>

    <article class="feature">
      <h3>🛡️ Your Data Stays Yours</h3>
      <p>We don't track your visitors, sell data, or run third-party ads. Privacy is built in, not bolted on.</p>
    </article>

    <article class="feature">
      <h3>📚 Teach Your Bot</h3>
      <p>Upload your FAQs, product info, or any text and your chatbot will use it to answer questions about your specific business.</p>
    </article>
  </section>
</main>

<section class="pricing" id="pricing">
  <h2>Simple, Honest Pricing</h2>
  <p class="pricing-subtitle">No surprises. No hidden fees. Cancel anytime.</p>

  <div class="pricing-cards">

    <div class="pricing-card featured">
      <div class="pricing-badge">Start Here — It's Free</div>
      <p class="plan-name">Free</p>
      <p class="plan-price">$0 <span>/ month</span></p>
      <p class="plan-desc">Start today — no credit card, no tech skills needed. Real AI on your real site.</p>
      <ul class="plan-features">
        <li>20 AI conversations per day</li>
        <li>Fully customizable widget</li>
        <li>Real-time web search included</li>
        <li>WordPress plugin included</li>
        <li>No credit card required</li>
      </ul>
      <a href="/signup" class="plan-cta primary">Get Started Free →</a>
    </div>

    <div class="pricing-card">
      <p class="plan-name">Pro</p>
      <p class="plan-price">$9.99 <span>/ month</span></p>
      <p class="plan-desc">For growing sites that need more conversations and priority help.</p>
      <ul class="plan-features">
        <li>500 AI conversations per day</li>
        <li>Fully customizable widget</li>
        <li>Real-time web search included</li>
        <li>WordPress plugin included</li>
        <li>Priority support</li>
        <li>Cancel anytime</li>
      </ul>
      <a href="/login" class="plan-cta outline">Upgrade to Pro →</a>
    </div>

  </div>

  <div class="pricing-climate">
    <p>We contribute a portion of revenue to carbon removal.</p>
    <iframe
      width="380"
      height="38"
      style="border:0;"
      src="https://climate.stripe.com/badge/CpXMYL?theme=dark&size=small&locale=en-US"
      title="Stripe Climate contribution badge"
      loading="lazy">
    </iframe>
  </div>
</section>

<section class="demo">
  <h2>Try It Right Now — It's Live Below</h2>
  <p>See that chat bubble in the corner? That's Insertabot. Click it, say hi, and ask it anything. It searches the web in real time.</p>
</section>

<footer>
  <p>© 2026 Insertabot. All rights reserved.</p>
  <p>Powered by Cloudflare Workers AI • D1 • KV • Vectorize</p>
</footer>

<script src="${origin}/widget.js"
        data-api-key="ib_sk_demo_62132eda22a524d715034a7013a7b20e2a36f93b71b588d3354d74e4024e9ed7">
</script>

</body>
</html>`;
}
