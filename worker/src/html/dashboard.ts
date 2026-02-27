
/**
 * Customer Dashboard HTML
 * Improved for accessibility, maintainability, and UX
 */

// Inline escapeHtml function to avoid import issues
function escapeHtml(str: string | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getDashboardHTML(
  customer: any,
  widgetConfig: any,
  origin: string
): string {
  const embedCode = `<script src="${origin}/widget.js" data-api-key="${customer.api_key}"></script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard – Insertabot</title>

  <style>
    :root {
      --bg: #000;
      --panel: rgba(10,10,10,0.85);
      --border: rgba(0,245,255,0.25);
      --cyan: #00f5ff;
      --magenta: #ff00ff;
      --text: #e2e8f0;
      --muted: #94a3b8;
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
      min-height: 100vh;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    /* ---------- HEADER ---------- */

    header {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    header h1 {
      font-size: 1.8rem;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    header p {
      color: var(--muted);
      font-size: 0.9rem;
      margin-top: 4px;
    }

    .plan-badge {
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      white-space: nowrap;
    }

    /* ---------- GRID / CARDS ---------- */

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
    }

    .card h2 {
      font-size: 1.1rem;
      margin-bottom: 16px;
      color: var(--cyan);
    }

    /* ---------- CODE BOX ---------- */

    .code-box {
      position: relative;
      background: #000;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.8rem;
      word-break: break-all;
    }

    .copy-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
    }

    /* ---------- STATS ---------- */

    .stat {
      font-size: 2.4rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--muted);
    }

    /* ---------- FORM ---------- */

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.85rem;
      color: var(--muted);
    }

    input,
    textarea {
      width: 100%;
      padding: 10px;
      background: #000;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      font-size: 0.9rem;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--cyan);
    }

    .btn {
      margin-top: 10px;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      border: none;
      padding: 12px 26px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    /* ---------- TOAST ---------- */

    .toast {
      display: none;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #00f5ff, #00ff88);
      color: #fff;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    /* ---------- TABS ---------- */

    .tab-nav {
      display: flex;
      gap: 4px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      border-bottom: none;
      color: var(--muted);
      padding: 10px 20px;
      border-radius: 10px 10px 0 0;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: inherit;
      transition: color 0.2s, border-color 0.2s;
    }

    .tab-btn:hover { color: var(--cyan); }

    .tab-btn.active {
      color: var(--cyan);
      border-color: var(--border);
      background: var(--panel);
      border-bottom: 1px solid var(--bg);
      margin-bottom: -1px;
    }

    .tab-panel.hidden { display: none; }

    /* ---------- PLAYGROUND ---------- */

    .pg-layout {
      display: grid;
      grid-template-columns: 55% 45%;
      gap: 20px;
      height: calc(100vh - 200px);
      min-height: 500px;
    }

    @media (max-width: 900px) {
      .pg-layout {
        grid-template-columns: 1fr;
        height: auto;
      }
    }

    .pg-editor {
      overflow-y: auto;
    }

    .pg-editor textarea {
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .pg-chat {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--panel);
      overflow: hidden;
    }

    .pg-chat-header {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pg-chat-header h3 {
      font-size: 0.95rem;
      color: var(--cyan);
      margin: 0;
    }

    .pg-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pg-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.5;
      word-wrap: break-word;
      animation: pgSlideIn 0.2s ease-out;
    }

    @keyframes pgSlideIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .pg-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      border-radius: 12px 12px 4px 12px;
    }

    .pg-msg.assistant {
      align-self: flex-start;
      background: rgba(0, 245, 255, 0.08);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 12px 12px 12px 4px;
    }

    .pg-msg.assistant pre.ib-code-block {
      background: #0d1117;
      border: 1px solid rgba(0, 245, 255, 0.2);
      border-radius: 6px;
      padding: 12px 14px;
      margin: 8px 0;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre;
    }
    .pg-msg.assistant pre.ib-code-block code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      color: #e6edf3;
      background: none;
      padding: 0;
      border: none;
      font-size: inherit;
    }
    .pg-msg.assistant code.ib-inline-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      background: rgba(0, 245, 255, 0.08);
      color: var(--cyan);
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 12px;
      border: 1px solid rgba(0, 245, 255, 0.2);
    }
    .pg-msg.assistant ul.ib-list,
    .pg-msg.assistant ol.ib-list {
      margin: 6px 0 6px 18px;
      padding: 0;
    }
    .pg-msg.assistant ul.ib-list li,
    .pg-msg.assistant ol.ib-list li {
      margin-bottom: 3px;
      line-height: 1.5;
    }
    .pg-msg.assistant p {
      margin: 0 0 6px 0;
    }
    .pg-msg.assistant p:last-child {
      margin-bottom: 0;
    }
    .pg-msg.assistant strong { font-weight: 700; }
    .pg-msg.assistant em { font-style: italic; }
    .pg-msg.assistant .ib-code-wrap {
      position: relative;
      margin: 8px 0;
    }
    .pg-msg.assistant .ib-code-wrap .ib-code-block {
      margin: 0;
    }
    .pg-msg.assistant .ib-copy-btn {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0,245,255,0.1);
      color: var(--cyan);
      border: 1px solid rgba(0,245,255,0.3);
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 11px;
      cursor: pointer;
      font-family: 'SFMono-Regular', Consolas, monospace;
      line-height: 1.4;
      transition: background 0.15s;
    }
    .pg-msg.assistant .ib-copy-btn:hover {
      background: rgba(0,245,255,0.2);
    }
    .pg-msg.assistant .ib-msg-copy-btn {
      display: block;
      margin-top: 10px;
      background: none;
      border: none;
      color: rgba(0,245,255,0.35);
      font-size: 11px;
      cursor: pointer;
      padding: 0;
      font-family: inherit;
      transition: color 0.15s;
    }
    .pg-msg.assistant .ib-msg-copy-btn:hover {
      color: var(--cyan);
    }

    .pg-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      text-align: center;
      gap: 8px;
    }

    .pg-empty span { font-size: 2rem; }

    .pg-input-area {
      padding: 12px 16px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 10px;
    }

    .pg-input-area input {
      flex: 1;
    }

    .pg-input-area button {
      background: linear-gradient(135deg, var(--cyan), var(--magenta));
      color: #fff;
      border: none;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.85rem;
      white-space: nowrap;
    }

    .pg-input-area button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pg-btn-row {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .pg-btn-secondary {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      font-family: inherit;
    }

    .pg-btn-secondary:hover {
      border-color: var(--cyan);
      color: var(--cyan);
    }

    .pg-btn-test {
      background: linear-gradient(135deg, #ff00ff, #ff6600);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
      font-family: inherit;
    }
  </style>
</head>

<body>

<div class="container">

  <header>
    <div>
      <h1>Dashboard</h1>
      <p>${escapeHtml(customer.company_name)}</p>
    </div>
    <div class="plan-badge">${escapeHtml(customer.plan_type)} Plan</div>
  </header>

  <div id="toast" class="toast">✅ Settings saved successfully</div>

  ${customer.plan_type === 'owner' ? `
  <nav class="tab-nav">
    <button class="tab-btn active" data-tab="settings">Settings</button>
    <button class="tab-btn" data-tab="playground">Playground</button>
  </nav>
  ` : ''}

  <div id="tab-settings" class="tab-panel">

  ${escapeHtml(String(customer.email_verified)) === '0' ? `
  <div style="background: linear-gradient(135deg, #ffa500, #ff6b35); color: #fff; padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
    <div>
      <strong>⚠️ Email not verified</strong>
      <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Please check your inbox and verify your email address.</p>
    </div>
    <button onclick="resendVerificationEmail()" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 8px 16px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 600;">Resend Email</button>
  </div>
  ` : ''}

  <section class="grid">
    <article class="card">
      <h2>🔑 API Key</h2>
      <div class="code-box">
        ${escapeHtml(customer.api_key)}
        <button class="copy-btn" onclick="copyText('${escapeHtml(customer.api_key)}')">Copy</button>
      </div>
    </article>

    <article class="card">
      <h2>📊 Usage</h2>
      <div class="stat">${escapeHtml(String(customer.rate_limit_per_day))}</div>
      <div class="stat-label">Messages per day</div>
    </article>
  </section>

  <section class="card" style="margin-bottom:24px;">
    <h2>📝 Embed Code</h2>
    <p style="color:var(--muted);font-size:0.85rem;margin-bottom:12px;">
      Paste this before the closing &lt;/body&gt; tag:
    </p>
    <div class="code-box">
      ${embedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      <button class="copy-btn" onclick="copyText(\`${embedCode}\`)">Copy</button>
    </div>
  </section>

  <section class="card">
    <h2>🎨 Widget Customization</h2>

    <form id="config-form">
      <div class="form-group">
        <label>Bot Name</label>
        <input name="bot_name" value="${escapeHtml(widgetConfig.bot_name)}" />
      </div>

      <div class="form-group">
        <label>Bot Avatar URL</label>
        <input type="url" name="bot_avatar_url" value="${escapeHtml(widgetConfig.bot_avatar_url || '')}" />
      </div>

      <div class="form-group">
        <label>Primary Color</label>
        <input type="color" name="primary_color" value="${escapeHtml(widgetConfig.primary_color)}" />
      </div>

      <div class="form-group">
        <label>Greeting Message</label>
        <input name="greeting_message" value="${escapeHtml(widgetConfig.greeting_message)}" />
      </div>

      <div class="form-group">
        <label>System Prompt</label>
        <textarea rows="4" name="system_prompt">${escapeHtml(widgetConfig.system_prompt)}</textarea>
      </div>

      <div class="form-group">
        <label>Allowed Domains</label>
        <input name="allowed_domains" value="${escapeHtml(widgetConfig.allowed_domains || '')}" placeholder="e.g. https://yoursite.com, https://www.yoursite.com" />
        <p style="color:var(--muted);font-size:0.78rem;margin-top:6px;">Comma-separated list of origins allowed to load your widget. Leave blank to allow all origins.</p>
      </div>

      <button class="btn" type="submit">Save Changes</button>
    </form>
  </section>

  <section class="card">
    <h2>🔒 Security Settings</h2>

    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border);">
      <h3 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--text);">Two-Factor Authentication (2FA)</h3>
      <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 12px;">
        Add an extra layer of security to your account by requiring a time-based code in addition to your password.
      </p>

      <div id="2fa-status">
        ${escapeHtml(String(customer.totp_enabled)) === '1' ? `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="color: #00ff88; font-weight: 600;">✓ 2FA Enabled</span>
          </div>
          <button class="btn" onclick="disable2FA()" style="background: linear-gradient(135deg, #ff0055, #ff00ff); max-width: 200px;">Disable 2FA</button>
        ` : `
          <button class="btn" onclick="enable2FA()" style="max-width: 200px;">Enable 2FA</button>
        `}
      </div>

      <!-- 2FA Setup Modal -->
      <div id="2fa-setup-modal" style="display: none; margin-top: 20px; padding: 20px; background: #000; border: 1px solid var(--border); border-radius: 12px;">
        <h4 style="margin-bottom: 12px; color: var(--cyan);">Set Up 2FA</h4>
        <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 16px;">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
        </p>
        <div id="qr-code" style="text-align: center; margin: 20px 0; padding: 20px; background: #fff; border-radius: 8px;"></div>
        <p style="color: var(--muted); font-size: 0.75rem; margin-bottom: 16px; text-align: center;">
          Or enter this secret manually: <br>
          <code id="2fa-secret" style="background: var(--panel); padding: 4px 8px; border-radius: 4px; color: var(--cyan);"></code>
        </p>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--muted);">Enter the 6-digit code from your app to verify:</label>
          <input type="text" id="verify-2fa-code" maxlength="6" pattern="[0-9]{6}" placeholder="000000" style="width: 100%; padding: 10px; background: #000; border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 1.2rem; text-align: center; letter-spacing: 0.3em;" />
        </div>

        <div id="backup-codes-section" style="display: none; margin: 16px 0; padding: 16px; background: rgba(0, 245, 255, 0.05); border: 1px solid var(--border); border-radius: 8px;">
          <h4 style="margin-bottom: 8px; color: var(--cyan);">⚠️ Save Your Backup Codes</h4>
          <p style="color: var(--muted); font-size: 0.8rem; margin-bottom: 12px;">
            Store these codes in a safe place. Each can be used once if you lose access to your authenticator app.
          </p>
          <div id="backup-codes-list" style="font-family: monospace; font-size: 0.85rem; color: var(--text);"></div>
          <button onclick="downloadBackupCodes()" class="btn" style="margin-top: 12px; max-width: 200px;">Download Codes</button>
        </div>

        <div style="display: flex; gap: 12px;">
          <button class="btn" onclick="verify2FASetup()" id="verify-2fa-btn">Verify & Enable</button>
          <button onclick="cancel2FASetup()" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 12px 26px; border-radius: 10px; cursor: pointer; font-weight: 700;">Cancel</button>
        </div>
      </div>

      <!-- 2FA Disable Confirmation -->
      <div id="2fa-disable-modal" style="display: none; margin-top: 20px; padding: 20px; background: rgba(255, 0, 85, 0.05); border: 1px solid rgba(255, 0, 85, 0.3); border-radius: 12px;">
        <h4 style="margin-bottom: 12px; color: #ff0055;">Disable 2FA</h4>
        <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 16px;">
          Enter your password to confirm disabling two-factor authentication:
        </p>
        <input type="password" id="disable-2fa-password" placeholder="Your password" style="width: 100%; padding: 10px; background: #000; border: 1px solid var(--border); border-radius: 10px; color: var(--text); margin-bottom: 16px;" />
        <div style="display: flex; gap: 12px;">
          <button class="btn" onclick="confirmDisable2FA()" style="background: linear-gradient(135deg, #ff0055, #ff00ff);">Confirm Disable</button>
          <button onclick="cancelDisable2FA()" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 12px 26px; border-radius: 10px; cursor: pointer; font-weight: 700;">Cancel</button>
        </div>
      </div>
    </div>
  </section>

  <section class="card" style="margin-top:24px;">
    <h2>💬 Need Help?</h2>
    <p style="color:var(--muted);font-size:0.9rem;margin-bottom:16px;">
      The quickest way to get answers is to ask Insertabot directly — our AI assistant knows the platform inside and out.
    </p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="padding:12px 16px;background:rgba(0,245,255,0.05);border:1px solid rgba(0,245,255,0.2);border-radius:10px;">
        <strong style="color:var(--cyan);">Chat Widget</strong>
        <p style="color:var(--muted);font-size:0.85rem;margin:4px 0 0;">
          Visit <a href="https://insertabot.io" target="_blank" rel="noopener noreferrer" style="color:var(--cyan);">insertabot.io</a> and ask our assistant anything — installation help, troubleshooting, billing questions, and more.
        </p>
      </div>
      ${customer.plan_type === 'owner' ? `
      <div style="padding:12px 16px;background:rgba(255,0,255,0.05);border:1px solid rgba(255,0,255,0.2);border-radius:10px;">
        <strong style="color:var(--magenta);">Playground</strong>
        <p style="color:var(--muted);font-size:0.85rem;margin:4px 0 0;">
          Use the <button onclick="showTab('playground')" style="background:none;border:none;color:var(--magenta);cursor:pointer;padding:0;font-weight:700;font-size:0.85rem;">Playground tab</button> above to test and explore your bot configuration in real time.
        </p>
      </div>
      ` : ''}
      <div style="padding:12px 16px;background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
        <a href="https://insertabot.io/docs" target="_blank" rel="noopener noreferrer" style="color:var(--cyan);font-size:0.85rem;">📄 Documentation</a>
        <span style="color:var(--border);">|</span>
        <a href="mailto:support@insertabot.io" style="color:var(--cyan);font-size:0.85rem;">✉️ support@insertabot.io</a>
      </div>
    </div>
  </section>

  </div><!-- /tab-settings -->

  ${customer.plan_type === 'owner' ? `
  <div id="tab-playground" class="tab-panel hidden">
    <div class="pg-layout">

      <div class="pg-editor">
        <div class="card">
          <h2>🧪 System Prompt Editor</h2>

          <div class="form-group">
            <label for="pg-bot-name">Bot Name</label>
            <input id="pg-bot-name" value="${escapeHtml(widgetConfig.bot_name)}" />
          </div>

          <div class="form-group">
            <label for="pg-greeting">Greeting Message</label>
            <input id="pg-greeting" value="${escapeHtml(widgetConfig.greeting_message)}" />
          </div>

          <div class="form-group">
            <label for="pg-system-prompt">System Prompt</label>
            <textarea id="pg-system-prompt" rows="12">${escapeHtml(widgetConfig.system_prompt)}</textarea>
          </div>

          <div class="pg-btn-row">
            <button class="btn" onclick="pgSavePrompt()">Save Changes</button>
            <button class="pg-btn-test" onclick="pgTestPrompt()">Test (no save)</button>
            <button class="pg-btn-secondary" onclick="pgResetChat()">Reset Chat</button>
          </div>
        </div>
      </div>

      <div class="pg-chat">
        <div class="pg-chat-header">
          <h3 id="pg-chat-title">${escapeHtml(widgetConfig.bot_name)}</h3>
          <span style="font-size: 0.75rem; color: var(--muted);" id="pg-status">Ready</span>
        </div>

        <div class="pg-messages" id="pg-messages">
          <div class="pg-empty">
            <span>💬</span>
            <p>Start chatting to test your prompt</p>
          </div>
        </div>

        <div class="pg-input-area">
          <form id="pg-chat-form" style="display:flex;gap:10px;width:100%;">
            <input type="text" id="pg-input" placeholder="Type a message..." autocomplete="off" />
            <button type="submit" id="pg-send-btn">Send</button>
          </form>
        </div>
      </div>

    </div>
  </div><!-- /tab-playground -->
  ` : ''}

</div>

<script>
  // Store backup codes globally for download
  let backupCodesGlobal = [];

  async function resendVerificationEmail() {
    try {
      const response = await fetch('/api/auth/email/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '${escapeHtml(customer.email)}' })
      });

      const result = await response.json();
      const toast = document.getElementById('toast');
      toast.textContent = response.ok ? '✉️ Verification email sent!' : '❌ ' + result.message;
      toast.style.display = 'block';
      setTimeout(() => toast.style.display = 'none', 3000);
    } catch (err) {
      alert('Failed to send verification email');
    }
  }

  async function enable2FA() {
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '${escapeHtml(customer.api_key)}'
        }
      });

      const result = await response.json();

      if (response.ok) {
        // Store backup codes
        backupCodesGlobal = result.backup_codes || [];

        // Display QR code
        document.getElementById('2fa-setup-modal').style.display = 'block';
        document.getElementById('2fa-secret').textContent = result.secret;

        // Generate QR code using simple data URL approach
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = \`<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(result.qr_uri)}" alt="2FA QR Code" style="max-width: 200px;" />\`;
      } else {
        alert('Failed to enable 2FA: ' + result.message);
      }
    } catch (err) {
      alert('Error enabling 2FA');
    }
  }

  async function verify2FASetup() {
    const code = document.getElementById('verify-2fa-code').value;

    if (code.length !== 6) {
      alert('Please enter a 6-digit code');
      return;
    }

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '${escapeHtml(customer.api_key)}'
        },
        body: JSON.stringify({ totp_code: code })
      });

      const result = await response.json();

      if (response.ok) {
        // Show backup codes
        const backupSection = document.getElementById('backup-codes-section');
        const backupList = document.getElementById('backup-codes-list');
        backupList.innerHTML = backupCodesGlobal.map(code => \`<div style="margin: 4px 0;">\${code}</div>\`).join('');
        backupSection.style.display = 'block';

        // Disable verify button and show success
        document.getElementById('verify-2fa-btn').disabled = true;
        document.getElementById('verify-2fa-btn').textContent = '✓ 2FA Enabled!';

        const toast = document.getElementById('toast');
        toast.textContent = '✓ 2FA enabled successfully! Save your backup codes.';
        toast.style.display = 'block';

        // Reload page after 3 seconds
        setTimeout(() => location.reload(), 3000);
      } else {
        alert('Invalid code. Please try again.');
      }
    } catch (err) {
      alert('Error verifying 2FA code');
    }
  }

  function downloadBackupCodes() {
    const content = '2FA Backup Codes for Insertabot\\n\\n' + backupCodesGlobal.join('\\n') + '\\n\\nKeep these codes safe! Each can only be used once.';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insertabot-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function cancel2FASetup() {
    document.getElementById('2fa-setup-modal').style.display = 'none';
    document.getElementById('verify-2fa-code').value = '';
  }

  function disable2FA() {
    document.getElementById('2fa-disable-modal').style.display = 'block';
  }

  function cancelDisable2FA() {
    document.getElementById('2fa-disable-modal').style.display = 'none';
    document.getElementById('disable-2fa-password').value = '';
  }

  async function confirmDisable2FA() {
    const password = document.getElementById('disable-2fa-password').value;

    if (!password) {
      alert('Please enter your password');
      return;
    }

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '${escapeHtml(customer.api_key)}'
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (response.ok) {
        const toast = document.getElementById('toast');
        toast.textContent = '✓ 2FA disabled successfully';
        toast.style.display = 'block';
        setTimeout(() => location.reload(), 1500);
      } else {
        alert('Failed to disable 2FA: ' + result.message);
      }
    } catch (err) {
      alert('Error disabling 2FA');
    }
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById('toast');
      toast.textContent = '📋 Copied to clipboard';
      toast.style.display = 'block';
      setTimeout(() => toast.style.display = 'none', 2000);
    });
  }

  document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    const res = await fetch('/api/customer/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': '${escapeHtml(customer.api_key)}'
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const toast = document.getElementById('toast');
      toast.textContent = '✅ Settings saved successfully';
      toast.style.display = 'block';
      setTimeout(() => toast.style.display = 'none', 3000);
    } else {
      alert('Failed to save settings');
    }
  });

  // ---------- TAB NAVIGATION ----------

  function showTab(name) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById('tab-' + name);
    const btn = document.querySelector('[data-tab="' + name + '"]');
    if (panel) panel.classList.remove('hidden');
    if (btn) btn.classList.add('active');
    window.location.hash = '#' + name;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  window.addEventListener('hashchange', () => {
    const name = window.location.hash.slice(1) || 'settings';
    showTab(name);
  });

  // Init tabs from hash
  (function() {
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById('tab-' + hash)) {
      showTab(hash);
    }
  })();

  ${customer.plan_type === 'owner' ? `
  // ---------- PLAYGROUND ----------

  const PG_API_KEY = ${JSON.stringify(customer.api_key)};
  const PG_ENDPOINT = ${JSON.stringify(origin)} + '/v1/chat/completions';

  let pgConversationId = null;
  let pgHistory = [];
  let pgIsProcessing = false;

  function pgGetSystemPrompt() {
    return document.getElementById('pg-system-prompt').value;
  }

  function pgShowEmptyState() {
    document.getElementById('pg-messages').innerHTML =
      '<div class="pg-empty"><span>💬</span><p>Start chatting to test your prompt</p></div>';
  }

  function pgShowToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2500);
  }

  function pgResetChat() {
    pgConversationId = crypto.randomUUID();
    pgHistory = [];
    pgIsProcessing = false;
    document.getElementById('pg-input').disabled = false;
    document.getElementById('pg-send-btn').disabled = false;
    document.getElementById('pg-status').textContent = 'Ready';
    pgShowEmptyState();
  }

  function pgTestPrompt() {
    pgResetChat();
    pgShowToast('🧪 Testing with current prompt (not saved)');
  }

  async function pgSavePrompt() {
    const res = await fetch('/api/customer/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': PG_API_KEY
      },
      body: JSON.stringify({
        system_prompt: pgGetSystemPrompt(),
        bot_name: document.getElementById('pg-bot-name').value,
        greeting_message: document.getElementById('pg-greeting').value
      })
    });
    if (res.ok) {
      pgShowToast('✅ Prompt saved successfully');
      document.getElementById('pg-chat-title').textContent =
        document.getElementById('pg-bot-name').value;
      pgResetChat();
    } else {
      pgShowToast('❌ Failed to save');
    }
  }

  function renderMarkdown(text) {
    function esc(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }
    var codeBlocks = [], inlineCodes = [];
    // 1. Extract fenced code blocks (content escaped at extraction time)
    // Note: backslashes doubled because this runs inside a TS template literal
    var s = text.replace(/\`\`\`(\\w*)\\n([\\s\\S]*?)\`\`\`/g, function(_, lang, code) {
      var lc = lang ? ' class="language-' + esc(lang) + '"' : '';
      codeBlocks.push('<div class="ib-code-wrap"><button class="ib-copy-btn">Copy</button><pre class="ib-code-block"><code' + lc + '>' + esc(code.trimEnd()) + '</code></pre></div>');
      return 'IBCB' + (codeBlocks.length - 1) + 'IBCBEND';
    });
    // 2. Extract inline code spans
    s = s.replace(/\`([^\`\\n]+)\`/g, function(_, code) {
      inlineCodes.push('<code class="ib-inline-code">' + esc(code) + '</code>');
      return 'IBIC' + (inlineCodes.length - 1) + 'IBICEND';
    });
    // 3. Escape all remaining plain text
    s = esc(s);
    // 4. Bold and italic (markers survive esc() — not HTML-special)
    s = s.replace(/\\*\\*\\*(.+?)\\*\\*\\*/g, '<strong><em>$1</em></strong>');
    s = s.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/\\*([^*\\n]+)\\*/g, '<em>$1</em>');
    s = s.replace(/_([^_\\n]+)_/g, '<em>$1</em>');
    // 5. Unordered lists
    s = s.replace(/((?:^[ \\t]*[-*] .+(?:\\n|$))+)/gm, function(block) {
      return '<ul class="ib-list">' + block.trim().split('\\n').map(function(l) {
        return '<li>' + l.replace(/^[ \\t]*[-*] /, '').trim() + '</li>';
      }).join('') + '</ul>';
    });
    // 6. Ordered lists
    s = s.replace(/((?:^[ \\t]*\\d+\\. .+(?:\\n|$))+)/gm, function(block) {
      return '<ol class="ib-list">' + block.trim().split('\\n').map(function(l) {
        return '<li>' + l.replace(/^[ \\t]*\\d+\\. /, '').trim() + '</li>';
      }).join('') + '</ol>';
    });
    // 7. Paragraphs and line breaks (skip block-level elements and code placeholders)
    s = s.split(/\\n\\n+/).map(function(para) {
      var t = para.trim();
      if (/^<(ul|ol|pre)/.test(t) || /^IBCB\\d/.test(t)) return t;
      return '<p>' + t.replace(/\\n/g, '<br>') + '</p>';
    }).join('\\n');
    // 8. Restore placeholders
    s = s.replace(/IBIC(\\d+)IBICEND/g, function(_, i) { return inlineCodes[+i]; });
    s = s.replace(/IBCB(\\d+)IBCBEND/g, function(_, i) { return codeBlocks[+i]; });
    return s;
  }

  function pgAddMessage(role, content) {
    const msgs = document.getElementById('pg-messages');
    const empty = msgs.querySelector('.pg-empty');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = 'pg-msg ' + role;
    div.textContent = content;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  async function pgSendMessage(message) {
    if (pgIsProcessing || !message.trim()) return;
    pgIsProcessing = true;

    if (!pgConversationId) pgConversationId = crypto.randomUUID();

    const input = document.getElementById('pg-input');
    const sendBtn = document.getElementById('pg-send-btn');
    input.disabled = true;
    sendBtn.disabled = true;
    document.getElementById('pg-status').textContent = 'Thinking...';

    pgAddMessage('user', message);
    pgHistory.push({ role: 'user', content: message });

    try {
      const res = await fetch(PG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': PG_API_KEY
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: pgGetSystemPrompt() },
            ...pgHistory
          ],
          stream: true,
          conversation_id: pgConversationId
        })
      });

      if (!res.ok) throw new Error('API error: ' + res.status);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let msgDiv = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                accumulated += token;
                if (!msgDiv) {
                  msgDiv = pgAddMessage('assistant', accumulated);
                } else {
                  msgDiv.textContent = accumulated;
                }
                document.getElementById('pg-messages').scrollTop =
                  document.getElementById('pg-messages').scrollHeight;
              }
            } catch (e) {}
          }
        }
      }

      pgHistory.push({ role: 'assistant', content: accumulated });
      if (msgDiv) {
        msgDiv.innerHTML = renderMarkdown(accumulated);
        // Code block copy buttons
        msgDiv.querySelectorAll('.ib-copy-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var code = btn.parentElement.querySelector('code').textContent;
            navigator.clipboard.writeText(code).then(function() {
              btn.textContent = 'Copied!';
              setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
            }).catch(function() {
              var ta = document.createElement('textarea');
              ta.value = code; document.body.appendChild(ta); ta.select();
              try { document.execCommand('copy'); } catch(e) {}
              document.body.removeChild(ta);
              btn.textContent = 'Copied!';
              setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
            });
          });
        });
        // Message-level copy button
        var pgAccum = accumulated;
        var pgMsgCopy = document.createElement('button');
        pgMsgCopy.className = 'ib-msg-copy-btn';
        pgMsgCopy.textContent = 'Copy response';
        pgMsgCopy.addEventListener('click', function() {
          navigator.clipboard.writeText(pgAccum).then(function() {
            pgMsgCopy.textContent = 'Copied!';
            setTimeout(function() { pgMsgCopy.textContent = 'Copy response'; }, 2000);
          }).catch(function() {
            var ta = document.createElement('textarea');
            ta.value = pgAccum; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); } catch(e) {}
            document.body.removeChild(ta);
            pgMsgCopy.textContent = 'Copied!';
            setTimeout(function() { pgMsgCopy.textContent = 'Copy response'; }, 2000);
          });
        });
        msgDiv.appendChild(pgMsgCopy);
        document.getElementById('pg-messages').scrollTop = document.getElementById('pg-messages').scrollHeight;
      }
      document.getElementById('pg-status').textContent = 'Ready';
    } catch (err) {
      console.error('Playground error:', err);
      pgAddMessage('assistant', '⚠️ Error: ' + err.message);
      document.getElementById('pg-status').textContent = 'Error';
    } finally {
      pgIsProcessing = false;
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  document.getElementById('pg-chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('pg-input');
    const msg = input.value.trim();
    if (msg) {
      input.value = '';
      pgSendMessage(msg);
    }
  });
  ` : ''}
</script>

</body>
</html>`;
}
