# Insertabot Project Structure

## Overview
Insertabot is a serverless AI chatbot SaaS platform built on Cloudflare Workers.

## Directory Structure

```
insertabot-v1.0/
├── .github/                    # GitHub workflows and configurations
│   └── workflows/              # CI/CD pipelines
├── docs/                       # Project documentation
├── examples/                   # Example implementations
├── insertabot-ai-chatbot-solution/  # WordPress plugin (legacy)
├── migrations/                 # Database schema migrations (production)
│   └── backups/               # Database backups (not in git)
├── scripts/                    # Utility scripts
├── src/
│   └── widget/                # Embeddable chat widget
│       ├── demo.html          # Widget demo page
│       └── insertabot.js      # Widget JavaScript
└── worker/                    # Cloudflare Worker (main application)
    ├── migrations/            # D1 database migrations
    ├── public/                # Static assets
    └── src/                   # TypeScript source code
        ├── html/              # HTML page generators
        ├── index.ts           # Main entry point
        ├── auth.ts            # Authentication logic
        ├── customer.ts        # Customer management
        ├── rag.ts             # RAG implementation
        ├── search.ts          # Web search integration
        └── ...                # Other modules
```

## Key Components

### Worker (`/worker/`)
The main application running on Cloudflare Workers:
- **Entry Point**: `src/index.ts` - Request routing and handling
- **Authentication**: `src/auth.ts`, `src/auth-endpoints.ts`, `src/session.ts`
- **Customer Management**: `src/customer.ts`
- **AI Features**: `src/rag.ts`, `src/search.ts`
- **Integrations**: `src/stripe.ts`, `src/email-service.ts`

### Widget (`/src/widget/`)
Embeddable JavaScript widget for customer websites:
- `insertabot.js` - Main widget code
- `demo.html` - Testing page

### Migrations
- `/migrations/` - Production database migrations (SQL)
- `/worker/migrations/` - D1-specific migrations

### Scripts (`/scripts/`)
Utility scripts for:
- Customer management
- Database operations
- Deployment verification
- Development server

## Development

### Setup
```bash
npm install
cd worker && npm install
```

### Run Locally
```bash
npm run dev              # Start dev server
npm run dev:worker       # Start Cloudflare Worker locally
```

### Deploy
```bash
npm run deploy           # Deploy to production
```

### Database
```bash
cd worker
npm run db:migrate       # Apply migrations
npm run db:query         # Query database
```

## Configuration

- **Environment**: `.env` (root), `.dev.vars` (worker)
- **Wrangler**: `worker/wrangler.toml`
- **TypeScript**: `worker/tsconfig.json`

## Documentation

See `/docs/` for detailed documentation:
- `ARCHITECTURE.md` - System architecture
- `QUICKSTART.md` - Getting started guide
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `SECURITY.md` - Security implementation
- `API.md` - API reference

## Notes

- The worker is the main application; root package.json is for tooling
- All production code is in TypeScript under `/worker/src/`
- Widget is vanilla JavaScript for maximum compatibility
- Database migrations are version-controlled
- Backup files and build artifacts are excluded from git
