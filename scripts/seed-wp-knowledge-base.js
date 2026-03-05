#!/usr/bin/env node

/**
 * Seed WordPress plugin knowledge base for cust_insertabot_001
 *
 * What this does:
 *   1. Inserts document chunks into D1 (knowledge_base table)
 *   2. Generates embeddings for each chunk via Cloudflare Workers AI REST API
 *   3. Upserts embeddings into Vectorize via the Cloudflare REST API
 *
 * Prerequisites:
 *   - CLOUDFLARE_API_TOKEN env var (needs Workers AI + D1 + Vectorize write permissions)
 *   - CLOUDFLARE_ACCOUNT_ID env var
 *   - D1_DATABASE_ID env var (the UUID from `wrangler d1 list`)
 *   - VECTORIZE_INDEX_NAME env var (default: insertabot-vectors)
 *
 * Usage:
 *   CLOUDFLARE_API_TOKEN=xxx \
 *   CLOUDFLARE_ACCOUNT_ID=xxx \
 *   D1_DATABASE_ID=xxx \
 *   node scripts/seed-wp-knowledge-base.js
 */

const CUSTOMER_ID = 'cust_insertabot_001';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const D1_DB_ID = process.env.D1_DATABASE_ID;
const VECTORIZE_INDEX = process.env.VECTORIZE_INDEX_NAME || 'insertabot-vectors';

// ---------------------------------------------------------------------------
// Knowledge base documents — chunked to stay within the 512-token embedding
// window of bge-base-en-v1.5 (aim for ~300–350 words per chunk)
// ---------------------------------------------------------------------------
const DOCUMENTS = [
  {
    title: 'Insertabot WordPress Plugin Overview',
    source_type: 'documentation',
    source_url: 'https://insertabot.io/docs',
    content: `Insertabot - AI Chatbot Solution is a WordPress plugin by Mistyk Media that adds an AI-powered chat widget to any WordPress site in minutes with no coding required. It is available on the WordPress.org plugin directory (version 1.0.0).

Key features: real-time web search powered by Tavily API (answers are always current, unlike ChatGPT), fully customizable colors and branding, mobile-optimized chat widget, async CDN-hosted script (does not slow down the site), GDPR compliant, works with all WordPress themes, compatible with Elementor, Divi, Beaver Builder, and other page builders.

System requirements: WordPress 5.9 or higher, PHP 7.4 or higher.

The plugin connects to the Insertabot API at insertabot.io. It requires an API key from insertabot.io to function. The free plan provides 20 messages per day. The Pro plan at $9.99/month provides 500 embedded widget messages per month and unlimited playground messages.`,
  },
  {
    title: 'Insertabot WordPress Plugin Installation Guide',
    source_type: 'documentation',
    source_url: 'https://insertabot.io/docs',
    content: `How to install the Insertabot WordPress plugin:

Automatic installation (recommended):
1. Log in to your WordPress admin panel.
2. Go to Plugins, then Add New.
3. In the search box type "Insertabot".
4. Click Install Now next to "Insertabot - AI Chatbot Solution", then click Activate.

Manual installation:
1. Download the plugin zip file from WordPress.org or insertabot.io.
2. Log in to your WordPress admin panel.
3. Go to Plugins, Add New, then Upload Plugin.
4. Click Choose File, select the zip, and click Install Now.
5. Click Activate Plugin.

After activation, the plugin adds an "Insertabot" menu item under Settings in the WordPress admin sidebar. No chatbot will appear on the site until you complete setup by adding an API key.`,
  },
  {
    title: 'Insertabot WordPress Plugin Setup Guide',
    source_type: 'documentation',
    source_url: 'https://insertabot.io/docs',
    content: `How to set up the Insertabot WordPress plugin after installation:

Step 1 — Get a free API key:
Sign up at insertabot.io/signup. No credit card required. Your API key is issued instantly. It starts with the prefix ib_sk_ followed by alphanumeric characters.

Step 2 — Enter the API key in WordPress:
In WordPress admin go to Settings, then click Insertabot. Paste your API key into the API Key field. Click Save Settings. The key is stored encrypted — the field will clear after saving, and a masked preview (e.g. "ib_sk_ab...1234 — API key connected") confirms the key was stored successfully.

Step 3 — Enable the chatbot:
After saving the API key, the Enable Chatbot toggle becomes active. Toggle it on and click Save Settings. The chat widget will now appear on all pages of your site.

Important: the Enable Chatbot toggle is grayed out and cannot be turned on until a valid API key has been saved. Always save the key first, then enable.`,
  },
  {
    title: 'Insertabot WordPress Plugin Settings Reference',
    source_type: 'documentation',
    source_url: 'https://insertabot.io/docs',
    content: `The Insertabot settings page is found at Settings > Insertabot in the WordPress admin. It contains three fields:

API Key: Paste your Insertabot API key here (format: ib_sk_...). The key is encrypted with AES-256-CBC before storage and never saved as plaintext in the WordPress database. For security the field always appears blank — a masked confirmation is shown below the field when a key is already stored. Paste a new key at any time to update it. Clearing the field and saving will remove the key and automatically disable the chatbot.

Enable Chatbot (toggle): Shows or hides the chat widget across the entire site. This toggle is disabled and cannot be turned on until a valid API key is stored. Toggle off at any time to temporarily hide the widget without removing the API key.

API Base URL: An advanced field pre-filled with https://insertabot.io. Leave this at the default value unless you are specifically instructed to use a custom API endpoint (e.g. for white-label or self-hosted deployments).

Bot appearance (name, greeting message, colors, avatar) is configured in the Insertabot dashboard at insertabot.io/dashboard, not from this settings page.`,
  },
  {
    title: 'Insertabot Pricing and Plans',
    source_type: 'documentation',
    source_url: 'https://insertabot.io',
    content: `Insertabot pricing:

Free plan (no credit card required):
- 20 AI chat messages per day (embedded widget conversations)
- Real-time web search on every response
- Basic customization (colors, bot name, greeting)
- Mobile-optimized widget
- The daily quota resets at midnight

Pro plan — $9.99 per month:
- Unlimited playground messages (for testing in the dashboard)
- 500 embedded widget messages per month (conversations on your website)
- Priority support
- Advanced analytics
- All Free features included

How to upgrade: visit insertabot.io/dashboard and click the Upgrade button, or use the "Upgrade to Pro" card on the plugin settings page in WordPress admin (visible once an API key is connected).

What happens when the free limit is reached: the chatbot stops responding to new messages for the rest of that day. It automatically resets at midnight. To avoid interruptions, upgrade to Pro for the 500 monthly embedded message allowance.`,
  },
  {
    title: 'Insertabot Security and Privacy',
    source_type: 'documentation',
    source_url: 'https://insertabot.io/docs',
    content: `Insertabot security and privacy details:

API key storage: the key is encrypted with AES-256-CBC using a secret derived from the WordPress installation. It is never stored in plaintext in the WordPress database and never exposed to the visitor's browser.

Token-based widget authentication: instead of sending the API key to the browser, the plugin generates short-lived tokens (valid for 60 seconds) using HMAC-SHA256 signed with the site's WordPress AUTH_KEY. The widget uses these tokens for chat requests. This means even if a browser request is intercepted, the token expires before it can be reused.

GDPR compliance: the plugin implements WordPress personal data exporters and erasers. Site administrators can export or delete a user's personal data via Tools > Export Personal Data or Tools > Erase Personal Data in the WordPress admin. IP addresses stored in security logs are anonymized (last octet zeroed out).

Data transmitted: when the chatbot is active, user chat messages and the site URL are sent to insertabot.io for AI processing. No personal data is shared with third parties beyond what is necessary for chatbot operation. Insertabot's privacy policy is at insertabot.io/privacy.

Local WordPress database storage: encrypted API key (option: insertabot_api_key_encrypted), enabled/disabled state, API base URL, and optional anonymized security logs.`,
  },
  {
    title: 'Insertabot WordPress Plugin Troubleshooting',
    source_type: 'documentation',
    source_url: 'https://insertabot.io/docs',
    content: `Common issues and solutions for the Insertabot WordPress plugin:

Problem: Enable Chatbot toggle is grayed out or disabled.
Solution: A valid API key must be saved first. Go to Settings > Insertabot, paste your API key (starting with ib_sk_), click Save Settings, then toggle on the chatbot.

Problem: "Invalid API key format" error when saving.
Solution: API keys start with ib_sk_ and contain only alphanumeric characters. If the key looks wrong, get a fresh one from insertabot.io/signup.

Problem: "API key required before enabling chatbot" error.
Solution: Same as above — paste the key and save before trying to enable.

Problem: "Security component missing. Cannot process API key." error.
Solution: The plugin files are incomplete or corrupted. Deactivate and delete the plugin, then reinstall it.

Problem: The chat widget is not appearing on the site.
Solution: Verify Enable Chatbot is toggled on in Settings > Insertabot. Also check that the site URL is allowed in the CORS / allowed domains settings in the Insertabot dashboard at insertabot.io/dashboard.

Problem: The chatbot stopped responding mid-day.
Solution: The free plan limit of 20 messages per day has been reached. It resets at midnight. Upgrade to Pro at $9.99/month for 500 monthly embedded messages.

Problem: "Failed to securely store API key" error.
Solution: This can happen if WordPress encryption functions are unavailable. Check that AUTH_KEY is defined in wp-config.php (it should be by default). If the issue persists, contact support@insertabot.io.`,
  },
];

// ---------------------------------------------------------------------------
// Cloudflare REST API helpers
// ---------------------------------------------------------------------------

function cfHeaders() {
  return {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

async function generateEmbedding(text) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${EMBEDDING_MODEL}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: cfHeaders(),
    body: JSON.stringify({ text: [text] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Workers AI embedding failed (${res.status}): ${err}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(`Embedding error: ${JSON.stringify(json.errors)}`);
  return json.result.data[0]; // float[] of length 768
}

async function d1Insert(sql, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${D1_DB_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: cfHeaders(),
    body: JSON.stringify({ sql, params }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`D1 query failed (${res.status}): ${err}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(`D1 error: ${JSON.stringify(json.errors)}`);
  return json.result;
}

async function vectorizeUpsert(vectors) {
  // Vectorize REST API expects NDJSON
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v2/indexes/${VECTORIZE_INDEX}/upsert`;
  const ndjson = vectors.map((v) => JSON.stringify(v)).join('\n');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/x-ndjson',
    },
    body: ndjson,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vectorize upsert failed (${res.status}): ${err}`);
  }
  const json = await res.json();
  if (!json.success) throw new Error(`Vectorize error: ${JSON.stringify(json.errors)}`);
  return json.result;
}

// ---------------------------------------------------------------------------
// Main seeding logic
// ---------------------------------------------------------------------------

async function seed() {
  // Validate env
  const missing = ['CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'D1_DATABASE_ID'].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Usage: CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ACCOUNT_ID=xxx D1_DATABASE_ID=xxx node scripts/seed-wp-knowledge-base.js');
    process.exit(1);
  }

  console.log(`Seeding ${DOCUMENTS.length} documents for customer ${CUSTOMER_ID}...`);
  console.log(`Vectorize index: ${VECTORIZE_INDEX}\n`);

  let successCount = 0;

  for (const [i, doc] of DOCUMENTS.entries()) {
    const label = `[${i + 1}/${DOCUMENTS.length}] "${doc.title}"`;
    try {
      process.stdout.write(`${label} — inserting into D1...`);

      const now = Math.floor(Date.now() / 1000);
      const d1Result = await d1Insert(
        `INSERT INTO knowledge_base (customer_id, content, source_type, source_url, title, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`,
        [
          CUSTOMER_ID,
          doc.content,
          doc.source_type,
          doc.source_url || null,
          doc.title,
          JSON.stringify({ seeded_by: 'seed-wp-knowledge-base.js' }),
          now,
          now,
        ]
      );

      const docId = d1Result[0]?.results?.[0]?.id;
      if (!docId) throw new Error('D1 insert did not return an ID');

      process.stdout.write(` OK (id=${docId}). Generating embedding...`);
      const embedding = await generateEmbedding(doc.content);

      process.stdout.write(` OK. Upserting to Vectorize...`);
      const vectorId = `${CUSTOMER_ID}:${docId}`;
      await vectorizeUpsert([
        {
          id: vectorId,
          values: embedding,
          metadata: {
            customer_id: CUSTOMER_ID,
            document_id: String(docId),
            content: doc.content.substring(0, 500),
            title: doc.title,
            source_type: doc.source_type,
            source_url: doc.source_url || '',
          },
        },
      ]);

      // Write embedding_id back to D1
      await d1Insert(
        `UPDATE knowledge_base SET embedding_id = ? WHERE id = ?`,
        [vectorId, docId]
      );

      process.stdout.write(` OK\n`);
      successCount++;
    } catch (err) {
      process.stdout.write(`\n  ERROR: ${err.message}\n`);
    }
  }

  console.log(`\nDone. ${successCount}/${DOCUMENTS.length} documents seeded successfully.`);
  if (successCount < DOCUMENTS.length) {
    console.log('Some documents failed — check errors above and re-run (existing rows will remain).');
  }
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
