# 🫙 Idlistack Self-Service Portal

> **A full-stack deployment portal built specifically for Idlistack** — enabling nonprofits to self-deploy WordPress, Ghost, Mattermost, and Listmonk in one click, with auto-subdomain assignment, resource monitoring, and email alerts.

Built to demonstrate the missing product layer at [idlistack.com](https://idlistack.com).

---

## 🎯 What This Solves

Idlistack's website describes a powerful vision — making open-source tools accessible to nonprofits — but has **no working self-service product yet**. This portal fills that gap:

| Gap | This Project |
|-----|-------------|
| NGOs can't deploy tools themselves | ✅ One-click deploy for all 4 tools |
| No onboarding flow | ✅ 3-step wizard (org info → tools → admin) |
| No subdomain assignment | ✅ Auto `orgname.idlistack.com` via Traefik |
| No monitoring | ✅ Live CPU/RAM stats via Docker API |
| No alerts | ✅ Email alerts via Listmonk (their own tool!) |
| No cost comparison | ✅ Savings calculator vs paid alternatives |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)              │
│  Landing → Onboarding → Dashboard → Deploy → Monitor │
└──────────────────┬──────────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────────┐
│               BACKEND (Fastify + Node.js)            │
│  /orgs  /deploy  /apps  /monitor                     │
└──────┬───────────────────┬───────────────────────────┘
       │                   │
┌──────▼──────┐   ┌────────▼────────────────────────┐
│ PostgreSQL  │   │  Docker API + Docker Compose     │
│  (state)    │   │  WordPress/Ghost/Mattermost/     │
└─────────────┘   │  Listmonk containers             │
                  └────────┬────────────────────────┘
                           │ HTTP
                  ┌────────▼────────────────────────┐
                  │  Traefik (reverse proxy)         │
                  │  Auto-SSL + subdomain routing    │
                  └─────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- PostgreSQL 15+

### 1. Clone & install
```bash
git clone https://github.com/yourusername/idlistack-portal.git
cd idlistack-portal
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up database
```bash
createdb idlistack
psql -U postgres -d idlistack -f backend/src/db/schema.sql
```

### 4. Create Docker network
```bash
docker network create idlistack-net
```

### 5. Start Traefik (production) or skip for local dev
```bash
cd infra/traefik
docker compose up -d
```

### 6. Run the app
```bash
npm run dev  # Starts frontend (3000) + backend (4000) concurrently
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
idlistack-portal/
├── frontend/                   # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── onboarding/         # 3-step onboarding wizard
│   │   ├── auth/signin/        # Auth page (Google + magic link)
│   │   ├── dashboard/          # Main dashboard + stats
│   │   ├── deploy/             # One-click deploy UI
│   │   └── api/auth/           # NextAuth handlers
│   └── components/
│       └── dashboard/          # Sidebar, TopBar, AppCard, StatsRow
│
├── backend/                    # Fastify API
│   └── src/
│       ├── index.ts            # Server entry point
│       ├── db/
│       │   ├── client.ts       # PostgreSQL connection pool
│       │   └── schema.sql      # Full DB schema with seed data
│       ├── routes/
│       │   ├── orgs.ts         # Org create/read
│       │   ├── deploy.ts       # Trigger deployments
│       │   ├── apps.ts         # Start/stop/restart/delete
│       │   └── monitor.ts      # Stats + alerts cron
│       └── services/
│           ├── docker.service.ts  # Dockerode integration
│           └── email.service.ts   # Listmonk + SMTP alerts
│
└── infra/
    ├── templates/              # Docker Compose per tool
    │   ├── wordpress.yml
    │   ├── ghost.yml
    │   ├── mattermost.yml
    │   └── listmonk.yml
    └── traefik/
        └── docker-compose.yml  # Traefik with auto-SSL
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orgs` | Create organisation (onboarding) |
| GET | `/orgs/:slug` | Get org details |
| GET | `/orgs/:slug/deployments` | List all org apps |
| POST | `/deploy` | Deploy a new app |
| GET | `/deploy/:id/status` | Poll deployment status |
| POST | `/apps/:id/start` | Start an app |
| POST | `/apps/:id/stop` | Stop an app |
| POST | `/apps/:id/restart` | Restart an app |
| DELETE | `/apps/:id` | Delete an app |
| GET | `/monitor/:orgSlug` | Get live stats for all apps |
| GET | `/monitor/alerts/:orgSlug` | Get alert history |
| GET | `/monitor/cron/run` | Run monitoring check (cron) |

---

## 🧠 Key Design Decisions

- **Listmonk for alerts** — Uses Idlistack's own email tool, not a third-party service. Shows genuine understanding of the product.
- **Template-based deploys** — Each tool has its own Docker Compose template with `{{ORG_SLUG}}` and `{{DOMAIN}}` placeholders. Easy to extend with new tools.
- **Traefik for routing** — Auto-provisions `orgname.idlistack.com` subdomains with Let's Encrypt SSL. Zero manual DNS work.
- **Async deployment** — Deployments are fired asynchronously; frontend polls `/deploy/:id/status` for real-time feedback.
- **Multi-tenant** — Each org is isolated: separate containers, volumes, and subdomains.

---

## 🛣️ Roadmap

- [ ] Backup & restore functionality
- [ ] Custom domain support (BYOD)
- [ ] FMS (Fundraising Management System) integration
- [ ] Mobile-responsive dashboard
- [ ] Role-based access (admin / member / viewer)
- [ ] Billing module for paid tier

---

## 👤 Author

Built by [Your Name] as a portfolio project for [Tech4Good Community / Idlistack](https://idlistack.com).

> *"I built this because I believe in what Idlistack is trying to do — and I wanted to show, not just tell."*

---

## 📄 License

MIT — free to use, fork, and build upon.
