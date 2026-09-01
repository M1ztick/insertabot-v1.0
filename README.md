# Insertabot v1.0

> Embed a customizable, secure, AI-powered chat widget on any website — in minutes.

Insertabot is a multi-tenant SaaS chatbot platform built on **Cloudflare Workers**. It provides an embeddable chat widget, a managed backend with authentication, AI-powered responses through **Workers AI (Llama 3.3 70B)**, optional **Tavily web search**, and **RAG** support via **Vectorize** + **D1**.

- 🌐 **Homepage:** [https://insertabot.io](https://insertabot.io)
- 📚 **Full documentation:** [`docs/README.md`](docs/README.md)
- 🚀 **Live SaaS architecture:** multi-tenant, authenticated, rate-limited, and analytics-ready

---

## ✨ Features

- 🤖 **AI chat** powered by Cloudflare Workers AI (Llama 3.3 70B)
- 🔍 **Web search** integration via Tavily
- 📚 **RAG** (Retrieval-Augmented Generation) with Vectorize embeddings + D1
- 🔐 **Secure authentication** with optional 2FA
- 🎨 **Customizable embeddable widget**
- 📊 **Usage analytics** for tenants
- 🌐 **Multi-tenant SaaS** architecture
- 🛡️ **Rate limiting** via Cloudflare KV
- 🔒 **Secret scanning** with Secretlint + Husky

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Cloudflare Workers |
| Backend | TypeScript |
| Database | Cloudflare D1 (SQLite) |
| Cache / Rate limiting | Cloudflare KV |
| Vector search | Cloudflare Vectorize |
| AI model | Workers AI — Llama 3.3 70B |
| Web search | Tavily |
| Deployment | Wrangler |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone https://github.com/M1ztick/insertabot-v1.0.git
cd insertabot-v1.0
npm install
cd worker && npm install
```

### 2. Configure environment

Copy the root `.env.example` to `.env` and fill in your Cloudflare, Stripe, and Tavily credentials:

```bash
cp .env.example .env
```

Key variables:

| Variable | Purpose |
|----------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `D1_DATABASE_ID` | D1 database ID for tenant/chat data |
| `KV_NAMESPACE_ID` | KV namespace for rate limiting |
| `VECTORIZE_INDEX_NAME` | Vectorize index name for RAG |
| `TAVILY_API_KEY` | Tavily API key for web search |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRO_PRICE_ID` | Stripe billing integration |

### 3. Create Cloudflare services

```bash
cd worker

# Create D1 database
npm run db:create

# Create KV namespace
npm run kv:create

# Create Vectorize index (768-dim cosine)
npm run vectorize:create
```

Apply the initial schema:

```bash
npm run db:migrate
```

### 4. Run locally

```bash
# From the project root
npm run dev
```

Or run only the Worker:

```bash
cd worker
npm run dev
```

### 5. Deploy to production

```bash
npm run deploy
```

> ⚠️ Development deployments are archived; production deployments are managed through Wrangler.

---

## 📁 Project Structure

```
insertabot-v1.0/
├── worker/                       # Cloudflare Worker backend (TypeScript)
│   ├── src/                      # API routes, auth, AI handlers
│   └── wrangler.jsonc            # Wrangler configuration
├── src/widget/                   # Embeddable frontend widget
├── scripts/                      # Local dev server & utility scripts
├── migrations/                   # D1 database migrations
├── schema.sql                     # Initial D1 schema
├── docs/                          # Full documentation
├── examples/                      # Usage examples
└── PROJECT_STRUCTURE.md           # Detailed architecture notes
```

---

## 📖 Documentation

| Doc | What it covers |
|-----|----------------|
| [`docs/README.md`](docs/README.md) | Project overview and docs index |
| [`docs/QUICKSTART.md`](docs/QUICKSTART.md) | Step-by-step getting started guide |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and data flow |
| [`docs/API.md`](docs/API.md) | API reference |
| [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) | Production deployment instructions |
| [`docs/AUTHENTICATION-SECURITY.md`](docs/AUTHENTICATION-SECURITY.md) | Auth, 2FA, and security model |
| [`docs/CORS-WHITELABELING.md`](docs/CORS-WHITELABELING.md) | CORS and white-label widget setup |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common issues and fixes |
| [`docs/STRIPE-SETUP.md`](docs/STRIPE-SETUP.md) | Billing and Stripe configuration |

---

## 🔐 Security

- Secrets are managed through Wrangler and `.env` (never commit secrets).
- Pre-commit hooks run `secretlint` to detect accidental credential leaks.
- Run a manual scan:

```bash
npm run scan:secrets
```

For a full security checklist, see [`docs/SECURITY-DEPLOYMENT-CHECKLIST.md`](docs/SECURITY-DEPLOYMENT-CHECKLIST.md).

---

## 🤝 Contributing

Contributions are welcome. Please keep the existing code style, run secret scans before committing, and open an issue for large changes.

---

## 📝 License

- Root project: **GNU-v2**
- `worker/` package: **MIT**

See individual `LICENSE` files where present.

---

## 👤 Author

**Mistyk Media** — [https://mistykmedia.com](https://mistykmedia.com)

Built with ❤️ for developers who want powerful AI chat on any site.
