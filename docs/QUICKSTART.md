# 🚀 Insertabot SaaS - Quick Setup Guide

Complete your multi-tenant AI chatbot platform setup in minutes!

## ⚡ Quick Start

### 1. Prerequisites Check

```bash
# Check if you have the required tools
node --version    # Should be 18+
npm --version
wrangler --version
```

If missing, install:

```bash
# Install Node.js 18+ from https://nodejs.org
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 2. One-Command Setup

```bash
# Clone and set up everything
git clone <your-repo-url> insertabot-saas
cd insertabot-saas

# Run the complete setup
npm run setup
```

This will:

- ✅ Install all dependencies
- ✅ Create Cloudflare resources (D1, KV, Vectorize)
- ✅ Update configuration files
- ✅ Run database migrations
- ✅ Generate demo customer

### 3. Configure AI Gateway

```bash
# Set your Cloudflare AI Gateway credentials
wrangler secret put AI_GATEWAY_ACCOUNT_ID
wrangler secret put AI_GATEWAY_ID  
wrangler secret put AI_GATEWAY_TOKEN
```

Get these from: <https://dash.cloudflare.com> → AI → AI Gateway

### 4. Deploy & Test

```bash
# Deploy to development
npm run deploy:dev

# Test everything works
npm run test

# Start widget demo
npm run test:widget
# Open: http://localhost:8000/demo.html
```

### 5. Deploy to Production

```bash
# Deploy to production
npm run deploy:prod

# Add your first customer
npm run customer:add
```

## 🛠️ Available Commands

### Development

- `npm run dev` - Start local development server
- `npm run test` - Run API test suite
- `npm run test:widget` - Start widget demo server

### Database

- `npm run db:setup` - Create and migrate databases
- `npm run db:migrate` - Run migrations only
- `npm run db:seed` - Add sample data

### Customer Management

- `npm run customer:add` - Add new customer (interactive)
- `npm run customer:list` - List all customers
- `npm run apikey:generate` - Generate API keys

### Deployment

- `npm run deploy` - Deploy to production
- `npm run deploy:dev` - Deploy to development
- `./scripts/deploy.sh production` - Full deployment with tests

### Monitoring

- `npm run logs` - View live logs
- `npm run metrics` - View usage metrics

## 📁 Project Structure

insertabot-saas/
├── 📋 README.md              # This file
├── 📋 DEPLOYMENT.md          # Detailed deployment guide
├── 🗄️  schema.sql             # Database schema
├── ⚙️  package.json           # Project scripts
├── 🔧 .env.example           # Environment variables template
│
├── 🔧 worker/                # Cloudflare Worker (API)
│   ├── src/
│   │   ├── 🚀 index.ts       # Main API handler
│   │   ├── 🔍 rag.ts         # RAG/Vector search
│   │   └── 📊 monitoring.ts  # Monitoring & alerts
│   ├── ⚙️  wrangler.toml     # Worker configuration
│   └── 📦 package.json
│
├── 🎨 widget/               # Embeddable widget
│   ├── 📱 insertabot.js     # Widget script
│   └── 🎯 demo.html         # Demo page
│
└── 🛠️ scripts/              # Management tools
    ├── 🔧 setup-cloudflare-resources.js
    ├── 👥 add-customer.js
    ├── 📋 list-customers.js
    ├── 🔑 generate-api-key.js
    ├── 🧪 test-api.js
    └── 🚀 deploy.sh

```
insertabot-saas/
├── 📋 README.md              # This file
├── 📋 DEPLOYMENT.md          # Detailed deployment guide
├── 🗄️  schema.sql             # Database schema
├── ⚙️  package.json           # Project scripts
├── 🔧 .env.example           # Environment variables template
│
├── 🔧 worker/                # Cloudflare Worker (API)
│   ├── src/
│   │   ├── 🚀 index.ts       # Main API handler
│   │   ├── 🔍 rag.ts         # RAG/Vector search
│   │   └── 📊 monitoring.ts  # Monitoring & alerts
│   ├── ⚙️  wrangler.toml     # Worker configuration
│   └── 📦 package.json
│
├── 🎨 widget/               # Embeddable widget
│   ├── 📱 insertabot.js     # Widget script
│   └── 🎯 demo.html         # Demo page
│
└── 🛠️ scripts/              # Management tools
    ├── 🔧 setup-cloudflare-resources.js
    ├── 👥 add-customer.js
    ├── 📋 list-customers.js
    ├── 🔑 generate-api-key.js
    ├── 🧪 test-api.js
    └── 🚀 deploy.sh
```

## 🎯 What You Get

### ✅ Complete Multi-Tenant SaaS Platform

- **Customer Management** - Add customers, API keys, rate limits
- **Embeddable Widget** - One-line integration for any website
- **AI Gateway Integration** - Powered by Cloudflare's edge AI
- **Vector Search (RAG)** - Knowledge base with semantic search
- **Usage Tracking** - Detailed analytics and billing data
- **Rate Limiting** - Per-customer request quotas
- **Global Edge Deployment** - Sub-50ms latency worldwide

### ✅ Production-Ready Features

- **Monitoring & Alerts** - Slack/Discord notifications
- **Error Tracking** - Structured logging with analytics
- **Health Checks** - Automated uptime monitoring
- **Database Migrations** - Version-controlled schema changes
- **Automated Testing** - API test suite with CI/CD
- **Performance Monitoring** - Response time tracking

### ✅ Management Tools

- **Interactive CLI** - Add customers, generate API keys
- **Database Tools** - Query customers, usage stats, exports
- **Deployment Automation** - One-command deploy with rollback
- **Testing Suite** - Comprehensive API and widget tests

## 🔧 Configuration

### Environment Variables (.env.local)

```bash
# Copy from .env.example and fill in your values
AI_GATEWAY_ACCOUNT_ID=your_account_id
AI_GATEWAY_ID=your_gateway_id  
AI_GATEWAY_TOKEN=your_api_token
```

### Custom Domain Setup

Update `worker/wrangler.toml`:

```toml
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]

[vars]
CORS_ORIGINS = "https://yourdomain.com,https://www.yourdomain.com"
```

### Widget CDN Setup

Deploy widget to Cloudflare Pages:

```bash
cd widget
wrangler pages deploy . --project-name=insertabot-cdn
```

## 📊 Usage Examples

### Add Your First Customer

```bash
npm run customer:add
# Follow the interactive prompts
```

### Test the API

```bash
# Test with demo customer
curl -H "X-API-Key: ib_sk_demo_12345678901234567890123456789012" \
     https://your-worker.workers.dev/v1/widget/config
```

### Embed Widget on Website

```html
<script src="https://insertabot.io/widget.js"
        data-api-key="ib_sk_customer_key_here"></script>
```

### Check Customer Usage

```bash
npm run customer:list
# View all customers and their usage stats
```

## 🐛 Troubleshooting

### Common Issues

**"wrangler: command not found"**

```bash
npm install -g wrangler
```

**"Database not found"**

```bash
npm run db:setup
```

**"Invalid AI Gateway credentials"**

- Check your secrets: `wrangler secret list`
- Verify credentials at: <https://dash.cloudflare.com>

**"CORS errors in browser"**

- Update `CORS_ORIGINS` in `wrangler.toml`
- Redeploy: `npm run deploy`

#### "Widget not loading"

- Check browser console for errors
- Verify API key is correct
- Test API endpoint directly

### Get Help

- 📖 Detailed docs: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Report issues: GitHub Issues
- 💬 Discord: [Your Discord Invite]
- 📧 Email: support@insertabot.io

## 🚀 Next Steps

1. **🎨 Customize the Widget**
   - Update colors, position, branding
   - Add custom CSS and themes
   - Implement multi-language support

2. **📊 Build Customer Dashboard**
   - React/Vue admin panel
   - Usage analytics and graphs
   - Widget customization UI

3. **💳 Add Billing Integration**
   - Stripe subscriptions
   - Usage-based pricing
   - Invoice generation

4. **📈 Scale Your Business**
   - Marketing website
   - SEO optimization
   - Customer onboarding flow

---

## 💰 Cost Estimate

Running 100 customers with moderate usage:

- **Cloudflare Workers**: $5/month
- **D1 Database**: $5/month  
- **KV Storage**: $1/month
- **Vectorize**: $2/month
- **AI Tokens**: $50/month (variable)
- **Total**: ~$65/month

Compare to self-hosted: $500-1000/month 🎉

---

## Made with ❤️ by Mistyk Media for the developer community

*Get your AI chatbot SaaS up and running in under 30 minutes!*
