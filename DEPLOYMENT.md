# MedStore ERP - Free Deployment Guide

Deploy your Medical Store ERP software to the internet for **free** so end users can access it from any device.

---

## What You Will Use (All Free)

| Service     | Purpose                  | Free Tier                      | Website                    |
|-------------|--------------------------|--------------------------------|----------------------------|
| **GitHub**  | Store your code          | Unlimited repos                | https://github.com         |
| **Vercel**  | Host the application     | 100 GB bandwidth/month         | https://vercel.com         |
| **Turso**   | Cloud database (SQLite)  | 9 GB storage, 500M reads/month | https://turso.tech         |

> These three services are enough. No credit card required for sign-up.

---

## Prerequisites

Before starting, make sure you have:

- [x] **Git** installed → [Download Git](https://git-scm.com/downloads)
- [x] **Node.js 18+** installed → [Download Node.js](https://nodejs.org)
- [x] A **GitHub** account → [Sign up free](https://github.com/signup)
- [x] A **Vercel** account → [Sign up free](https://vercel.com/signup) (use GitHub to sign in)
- [x] A **Turso** account → [Sign up free](https://turso.tech) (use GitHub to sign in)

To check if Git and Node are installed, open terminal and run:
```
git --version
node --version
```

---

## STEP 1: Upload Project to GitHub

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `medstore-erp`
   - **Description:** `Medical Store ERP Software`
   - **Visibility:** Private (recommended) or Public
3. Do NOT check "Add a README file" (we already have code)
4. Click **"Create repository"**

### 1.2 Push Your Code to GitHub

Open terminal/PowerShell **inside the project folder** (`medical-store/`) and run these commands one by one:

```bash
# Step 1: Initialize git (only needed once)
git init

# Step 2: Add all files
git add .

# Step 3: Create first commit
git commit -m "Initial commit: MedStore ERP application"

# Step 4: Connect to your GitHub repository
# REPLACE the URL below with YOUR repository URL from GitHub
git remote add origin https://github.com/YOUR-USERNAME/medstore-erp.git

# Step 5: Push code to GitHub
git branch -M main
git push -u origin main
```

> After running these commands, refresh your GitHub page. You should see all your files there.

### Verify Folder Structure on GitHub

Your repository should look like this:

```
medstore-erp/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── generated/  (ignored by .gitignore)
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── DEPLOYMENT.md
```

> **Important:** `.env` file and `node_modules/` should NOT appear on GitHub.

---

## STEP 2: Create Cloud Database (Turso)

Turso gives you a free SQLite-compatible cloud database.

### 2.1 Install Turso CLI

Open terminal and run:

```bash
# Windows (PowerShell - Run as Administrator)
irm https://get.tur.so/install.ps1 | iex

# macOS / Linux
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2.2 Login to Turso

```bash
turso auth login
```
This opens your browser. Sign in with your GitHub account.

### 2.3 Create a Database

```bash
turso db create medstore-db
```

### 2.4 Get Your Database URL

```bash
turso db show medstore-db --url
```

This prints something like:
```
libsql://medstore-db-your-username.turso.io
```

**Copy this URL** — you'll need it in Step 3.

### 2.5 Create an Auth Token

```bash
turso db tokens create medstore-db
```

This prints a long token string like:
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**Copy this token** — you'll need it in Step 3.

### 2.6 Push Database Schema to Turso

Now create the tables in your cloud database. Run this from your project folder:

```bash
# Set environment variables temporarily
# On Windows PowerShell:
$env:TURSO_DATABASE_URL="libsql://medstore-db-your-username.turso.io"
$env:TURSO_AUTH_TOKEN="your-token-here"
npx prisma db push

# On macOS/Linux:
TURSO_DATABASE_URL="libsql://medstore-db-your-username.turso.io" TURSO_AUTH_TOKEN="your-token-here" npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

### 2.7 Seed the Database with Sample Data

```bash
# Windows PowerShell (same terminal where you set env vars above):
npx tsx prisma/seed.ts

# macOS/Linux:
TURSO_DATABASE_URL="libsql://medstore-db-your-username.turso.io" TURSO_AUTH_TOKEN="your-token-here" npx tsx prisma/seed.ts
```

You should see:
```
Seeding database...
Database seeded successfully!
Default Login Credentials:
  Admin: admin@medstore.com / admin123
  Staff: staff@medstore.com / staff123
```

---

## STEP 3: Deploy to Vercel (Free Hosting)

### 3.1 Connect GitHub to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `medstore-erp` repository
4. Vercel will detect it as a Next.js project automatically

### 3.2 Configure Environment Variables

**Before clicking "Deploy"**, you MUST add environment variables.

Click **"Environment Variables"** and add these three:

| Variable Name        | Value                                               |
|----------------------|-----------------------------------------------------|
| `TURSO_DATABASE_URL` | `libsql://medstore-db-your-username.turso.io`       |
| `TURSO_AUTH_TOKEN`   | `eyJhbGciOiJ...` (the long token from Step 2.5)    |
| `JWT_SECRET`         | A strong random string (see below)                  |

**To generate a strong JWT_SECRET**, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as the `JWT_SECRET` value.

### 3.3 Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting           | Value                              |
|-------------------|------------------------------------|
| Framework Preset  | Next.js                            |
| Root Directory    | `./` (leave default)               |
| Build Command     | `prisma generate && next build`    |
| Install Command   | `npm install` (leave default)      |

### 3.4 Deploy!

Click **"Deploy"** and wait 2-3 minutes.

Vercel will:
1. Install dependencies (`npm install`)
2. Generate Prisma client (`prisma generate`)
3. Build the Next.js app (`next build`)
4. Deploy it to a global CDN

### 3.5 Get Your Public URL

After deployment succeeds, Vercel gives you a URL like:

```
https://medstore-erp.vercel.app
```

**This is your live application URL!** Share it with end users.

---

## STEP 4: Test the Deployed Application

### 4.1 Open the URL

Go to `https://your-app-name.vercel.app` in your browser.

### 4.2 Login with Default Credentials

```
Email:    admin@medstore.com
Password: admin123
```

### 4.3 Test These Features

- [ ] Login page loads correctly
- [ ] Dashboard shows stats and charts
- [ ] Medicines page lists all medicines
- [ ] Billing page creates a new invoice
- [ ] Reports page generates sales report
- [ ] Customers/Suppliers pages show data
- [ ] Settings page loads store settings
- [ ] Logout works correctly

### 4.4 Test on Mobile

Open the same URL on your phone. The app is fully responsive and should work on any screen size.

---

## STEP 5: Common Deployment Errors & Fixes

### Error: "Build Failed - Module not found"

**Cause:** Prisma client not generated.

**Fix:** Make sure your build command is:
```
prisma generate && next build
```

### Error: "PrismaClientInitializationError"

**Cause:** Environment variables not set correctly.

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `JWT_SECRET` are set
3. Click **"Redeploy"** (from Deployments tab → three dots → Redeploy)

### Error: "URL_INVALID" or "Database connection failed"

**Cause:** Wrong database URL format.

**Fix:** Make sure `TURSO_DATABASE_URL` starts with `libsql://` (not `https://`).

### Error: "SQLITE_ERROR: no such table"

**Cause:** Database tables not created.

**Fix:** Run from your local terminal:
```bash
# Set the env vars, then:
npx prisma db push
```

### Error: "JWT_SECRET is not defined"

**Cause:** Missing `JWT_SECRET` in Vercel environment variables.

**Fix:** Add `JWT_SECRET` in Vercel Settings → Environment Variables.

### Error: "500 Internal Server Error" on pages

**Cause:** Usually a database connection issue.

**Fix:**
1. Check Vercel logs: Go to Vercel Dashboard → Deployments → Click latest → "Functions" tab → View logs
2. Verify your Turso database is active: `turso db show medstore-db`
3. Verify the auth token hasn't expired: `turso db tokens create medstore-db` (create new one if needed)

### Build takes too long / times out

**Fix:** Vercel free tier allows 45-second builds. This app builds in ~30 seconds normally. If it times out:
1. Check for circular imports
2. Clear cache: Vercel Dashboard → Settings → General → scroll down → "Build Cache" → Clear

---

## STEP 6: Free Hosting Limitations

### Vercel Free Tier (Hobby Plan)

| Feature             | Limit                |
|---------------------|----------------------|
| Bandwidth           | 100 GB/month         |
| Serverless Function | 10-second timeout    |
| Deployments         | Unlimited            |
| Custom Domains      | 50                   |
| Team Members        | 1 (personal use)     |
| Commercial Use      | Allowed              |

### Turso Free Tier (Starter Plan)

| Feature             | Limit                |
|---------------------|----------------------|
| Storage             | 9 GB                 |
| Row Reads           | 500 million/month    |
| Row Writes          | 25 million/month     |
| Databases           | 500                  |
| Locations           | 3                    |

> **For a single medical store, these free limits are MORE than enough.** You would need thousands of daily transactions to even come close.

### What Happens If You Hit Limits?

- **Vercel:** Your app stays live but may show "bandwidth exceeded" for new visitors until the next month.
- **Turso:** Database reads/writes may be throttled. Upgrade to paid plan ($29/month) if needed.

---

## STEP 7: Updating Your Application

When you make changes to the code:

### 7.1 Push Changes to GitHub

```bash
git add .
git commit -m "Description of what you changed"
git push
```

### 7.2 Automatic Deployment

Vercel automatically redeploys when you push to GitHub. No manual action needed! Within 2-3 minutes, your changes will be live.

### 7.3 View Deployment Status

Go to your Vercel Dashboard → Deployments to see build status and logs.

---

## STEP 8: Adding a Custom Domain (Optional)

Instead of `medstore-erp.vercel.app`, you can use your own domain like `erp.yourstorename.com`.

### 8.1 Buy a Domain

Affordable domain providers:
- [Namecheap](https://namecheap.com) — domains from ₹500/year
- [GoDaddy](https://godaddy.com) — domains from ₹200/year (first year)
- [Google Domains](https://domains.google) — domains from ₹700/year
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — at-cost pricing

### 8.2 Add Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → **Domains**
2. Type your domain name (e.g., `erp.medstore.com`)
3. Click **"Add"**

### 8.3 Configure DNS

Vercel will show you DNS records to add. Go to your domain provider's DNS settings and add:

**Option A — Using a subdomain (recommended):**
```
Type: CNAME
Name: erp         (or whatever subdomain you want)
Value: cname.vercel-dns.com
```

**Option B — Using root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 8.4 Wait for DNS Propagation

DNS changes take 5 minutes to 48 hours to propagate worldwide. Usually it's done within 1 hour.

### 8.5 SSL Certificate

Vercel automatically provides a **free SSL certificate** (HTTPS) for your custom domain. No configuration needed.

---

## Quick Reference: All Commands Summary

```bash
# ──────────────── ONE-TIME SETUP ────────────────

# Install Turso CLI
irm https://get.tur.so/install.ps1 | iex          # Windows
curl -sSfL https://get.tur.so/install.sh | bash    # macOS/Linux

# Login to Turso
turso auth login

# Create database
turso db create medstore-db

# Get database URL (copy this)
turso db show medstore-db --url

# Create auth token (copy this)
turso db tokens create medstore-db

# Push schema to cloud database
npx prisma db push

# Seed database with sample data
npx tsx prisma/seed.ts

# Push code to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/medstore-erp.git
git branch -M main
git push -u origin main

# ──────────────── DAILY USE ────────────────

# Make changes, then push to auto-deploy
git add .
git commit -m "Your change description"
git push

# ──────────────── LOCAL DEVELOPMENT ────────────────

# Install dependencies
npm install

# Run locally
npm run dev

# Open in browser
# http://localhost:3000
```

---

## Environment Variables Reference

### For Local Development (`.env` file)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="any-string-for-local-dev"
```

### For Vercel Production (set in Vercel Dashboard)

```env
TURSO_DATABASE_URL="libsql://medstore-db-your-username.turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJ..."
JWT_SECRET="a-very-long-random-string-generated-by-crypto"
```

---

## Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│   Browser    │────▶│   Vercel     │────▶│    Turso       │
│  (End User)  │◀────│  (Next.js)   │◀────│  (Cloud SQLite)│
│             │     │   Free Tier   │     │   Free Tier    │
└─────────────┘     └──────────────┘     └────────────────┘
       │                   │
       │              ┌────┴────┐
       │              │ GitHub  │
       │              │  (Code) │
       └──────────────┴─────────┘
```

**Flow:**
1. You push code to **GitHub**
2. **Vercel** auto-deploys from GitHub
3. End users visit the **Vercel URL**
4. The app reads/writes data to **Turso** cloud database

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Turso Docs:** https://docs.turso.tech
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Your Medical Store ERP is now live on the internet!**

Default Login: `admin@medstore.com` / `admin123`

> Remember to change the default password after your first login in production.
