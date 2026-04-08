# MedStore ERP — Pharmacy Management Software

A full-featured, production-ready **Medical Store ERP** built with **Next.js 16**, **Prisma 7**, and **Tailwind CSS 4**. Manage inventory, billing, GST reports, prescriptions, expiry tracking, and more — all from one beautiful dashboard.

## Features

| Module              | Description                                              |
|---------------------|----------------------------------------------------------|
| **Dashboard**       | Real-time stats, charts, alerts for expiry & low stock   |
| **Billing / POS**   | Create invoices, manage payments, print GST invoices     |
| **Medicines**       | Full medicine catalog with batch & stock management      |
| **Purchases**       | Record purchase orders from suppliers with GST           |
| **Customers**       | Customer directory with credit limits, loyalty points    |
| **Suppliers**       | Supplier management with payment tracking                |
| **Expiry Tracker**  | Monitor batches expiring soon with CSV export            |
| **GST Reports**     | CGST/SGST breakdown, HSN summary, sales & purchase register |
| **Prescriptions**   | Upload and manage patient prescriptions                  |
| **Notifications**   | Centralized alerts for stock, expiry, and dues           |
| **User Management** | Role-based access (Admin, Pharmacist, Cashier, etc.)     |
| **Settings**        | Store info, tax config, invoice preferences              |
| **Reports**         | Sales, purchase, inventory, and profit reports           |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite (local) / Turso (cloud) via Prisma 7
- **Styling:** Tailwind CSS 4
- **Auth:** JWT (jose) + bcryptjs
- **Charts:** Recharts
- **Icons:** Lucide React

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up the database and seed sample data
npm run setup

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in:

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@medstore.com   | admin123  |
| Staff | staff@medstore.com   | staff123  |

### Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

| Variable             | Description                  | Required      |
|----------------------|------------------------------|---------------|
| `DATABASE_URL`       | SQLite file path (local)     | Local only    |
| `TURSO_DATABASE_URL` | Turso database URL           | Production    |
| `TURSO_AUTH_TOKEN`   | Turso auth token             | Production    |
| `JWT_SECRET`         | Secret for signing JWT tokens| All           |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a step-by-step guide to deploy on **Vercel** + **Turso** (both free tier).

**Quick summary:**

1. Push code to GitHub
2. Create a Turso database and get credentials
3. Import the repo on Vercel, set environment variables, deploy

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes (auth, CRUD, reports)
│   ├── dashboard/      # All dashboard pages
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   └── layout.tsx      # Root layout with meta tags
├── components/
│   ├── layout/         # Sidebar, Header
│   └── ui/             # Reusable components (Button, Card, Modal, etc.)
└── lib/
    ├── auth.ts         # JWT helpers
    ├── prisma.ts       # Prisma client (auto-detects SQLite or Turso)
    └── utils.ts        # Formatting utilities
```

## Scripts

| Command          | Description                           |
|------------------|---------------------------------------|
| `npm run dev`    | Start development server              |
| `npm run build`  | Build for production                  |
| `npm run start`  | Start production server               |
| `npm run setup`  | Push schema to DB + seed sample data  |
| `npm run lint`   | Run ESLint                            |
| `npm run db:push`| Push Prisma schema to database        |
| `npm run db:seed`| Seed database with sample data        |

## License

Private — All rights reserved.
