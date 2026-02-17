# Insertabot

AI-powered chatbot widget for websites, built on Cloudflare Workers.

## Quick Start

```bash
# Install dependencies
npm install
cd worker && npm install

# Start development server
npm run dev

# Deploy to production
npm run deploy
```

## Documentation

See [docs/README.md](docs/README.md) for complete documentation.

- [Quick Start Guide](docs/QUICKSTART.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

## Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure.

```
insertabot-v1.0/
├── worker/          # Cloudflare Worker (main app)
├── src/widget/      # Embeddable widget
├── scripts/         # Utility scripts
├── migrations/      # Database migrations
└── docs/            # Documentation
```

## Features

- 🤖 AI-powered chat using Cloudflare Workers AI
- 🔍 Web search integration (Tavily)
- 📚 RAG (Retrieval-Augmented Generation)
- 🔐 Secure authentication with 2FA
- 🎨 Customizable widget
- 📊 Usage analytics
- 🌐 Multi-tenant SaaS architecture

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Database**: D1 (SQLite)
- **AI**: Workers AI (Llama 3.1)
- **Storage**: KV, Vectorize
- **Language**: TypeScript

## License

GNU-v2

## Author

Mistyk Media
