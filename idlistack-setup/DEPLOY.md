# 🚀 Idlistack Portal — Deployment Guide

Two ways to get your portal live. Pick either or both.

---

## Option A — Local Setup (One Command)

```bash
# 1. Make the script executable
chmod +x setup.sh

# 2. Run it — does everything automatically
./setup.sh

# 3. Start the app
./start.sh
```

That's it. The script will:
- ✅ Detect your OS (Ubuntu, macOS, WSL)
- ✅ Install Node.js 20, PostgreSQL, Docker if missing
- ✅ Copy `.env.example` → `.env`
- ✅ Run `npm install` in frontend + backend
- ✅ Create `idlistack` database
- ✅ Run schema migrations + seed data
- ✅ Create Docker network
- ✅ Generate `start.sh` and `stop.sh` scripts

### URLs after `./start.sh`

| URL | What you see |
|-----|-------------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/onboarding | NGO signup wizard |
| http://localhost:3000/dashboard | Dashboard |
| http://localhost:3000/deploy | One-click deploy |
| http://localhost:4000/health | API health check |

---

## Option B — Deploy to Railway (Free, Live URL)

Railway gives you **$5 free credit/month** — enough for this project.

### Step-by-step

**1. Push your code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create idlistack-portal --public --push
# OR: create repo at github.com then:
git remote add origin https://github.com/YOUR_USERNAME/idlistack-portal.git
git push -u origin main
```

**2. Sign up at Railway**
- Go to [railway.app](https://railway.app)
- Sign in with GitHub (free)

**3. Create new project**
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Choose `idlistack-portal`

**4. Add PostgreSQL**
- Inside your project, click **"+ New"**
- Select **"Database" → "PostgreSQL"**
- Railway auto-connects it

**5. Deploy backend**
- Click **"+ New" → "GitHub Repo"**
- Set **Root Directory** to `backend`
- Add environment variables:
  ```
  NODE_ENV=production
  PORT=4000
  DATABASE_URL=<copy from PostgreSQL service>
  NEXTAUTH_SECRET=<any random string>
  ```

**6. Deploy frontend**
- Click **"+ New" → "GitHub Repo"** again
- Set **Root Directory** to `frontend`
- Add environment variables:
  ```
  NODE_ENV=production
  PORT=3000
  NEXT_PUBLIC_API_URL=https://your-backend.railway.app
  NEXTAUTH_URL=https://your-frontend.railway.app
  NEXTAUTH_SECRET=<same as above>
  ```

**7. Run schema migrations**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Run migrations on the deployed DB
railway run --service idlistack-backend \
  psql $DATABASE_URL -f src/db/schema.sql
```

**8. Done! 🎉**
Railway gives you URLs like:
- `https://idlistack-frontend-production.up.railway.app`
- `https://idlistack-backend-production.up.railway.app`

---

## Option C — Deploy to Render (Free, No Credit Card)

Render's free tier is completely free (services sleep after 15 min inactivity).

### Step-by-step

**1. Push to GitHub** (same as Railway Step 1 above)

**2. Sign up at Render**
- Go to [render.com](https://render.com)
- Sign in with GitHub (free, no credit card)

**3. Deploy using Blueprint (easiest)**
- In your GitHub repo, the `render.yaml` file is already configured
- Go to Render Dashboard → **"New" → "Blueprint"**
- Connect your `idlistack-portal` repo
- Render reads `render.yaml` and creates all 3 services automatically:
  - PostgreSQL database (free, 90 days)
  - Backend API
  - Frontend

**4. Set environment variables**
After services are created, go to each service → **Environment** tab:

Backend:
```
NEXTAUTH_SECRET = any_random_30_char_string
```

Frontend:
```
NEXT_PUBLIC_API_URL = https://idlistack-backend.onrender.com
NEXTAUTH_URL = https://idlistack-frontend.onrender.com
NEXTAUTH_SECRET = same_as_above
```

**5. Run DB schema**
- Go to your Render PostgreSQL → **Shell** tab
- Run: `psql $DATABASE_URL -f /path/to/schema.sql`

OR use the Render CLI:
```bash
npm install -g @render-software/render-cli
render shell --service idlistack-backend
# Inside shell:
psql $DATABASE_URL -f src/db/schema.sql
```

**6. Done! 🎉**
Render gives you URLs like:
- `https://idlistack-frontend.onrender.com`
- `https://idlistack-backend.onrender.com`

> ⚠️ **Note:** Free Render services spin down after 15 minutes of inactivity. First request after sleep takes ~30 seconds. Upgrade to Starter ($7/mo) to keep it always-on.

---

## Auto-Deploy on Git Push (CI/CD)

The `.github/workflows/deploy.yml` file sets up automatic deploys whenever you push to `main`.

### For Railway:
1. Go to Railway → Account → **Tokens** → Create token
2. In your GitHub repo → **Settings → Secrets → Actions**
3. Add secret: `RAILWAY_TOKEN` = your token

### For Render:
1. Go to each Render service → **Settings → Deploy Hook**
2. Copy the webhook URL
3. In GitHub → **Settings → Secrets → Actions**
4. Add: `RENDER_BACKEND_DEPLOY_HOOK` and `RENDER_FRONTEND_DEPLOY_HOOK`

Now every `git push` to `main` auto-deploys! ✨

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `psql: command not found` | `sudo apt install postgresql-client` |
| Port 3000 in use | `next dev -p 3001` |
| DB connection refused | Check `DATABASE_URL` in `.env` |
| Module not found | Run `npm install` inside `/frontend` and `/backend` |
| Railway deploy fails | Check logs in Railway dashboard → Deployments |
| Render service sleeping | Upgrade to Starter ($7/mo) for always-on |
| Docker permission denied | Run `sudo usermod -aG docker $USER` then log out/in |

---

## Share with Idlistack

When applying, share:
1. **GitHub repo URL** (make it public)
2. **Live demo URL** (from Railway or Render)
3. **README** explaining what you built

Good luck! 🫙
