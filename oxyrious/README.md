# Oxyrious — Medical Oxygen. Elevated.

Enterprise webapp for Oxyrious medical gas supply.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Modules
- Dashboard — Revenue, wallet float, supply streaks, recent orders
- Orders — Create, dispatch, confirm POD across all payment modes
- Hospitals — Client management, credit scoring, wallet config, referral codes
- Inventory — Gas stock levels, low-stock alerts, island vs mainland sourcing
- Logistics — Transporter performance, active delivery tracking
- Receivables — Invoice management, automated reminder timeline, reminder log
- Growth Hub — Wallet conversion nudges, PLG action list, growth funnel
- Referrals — Referral pipeline, codes by hospital, reward tracking
- Supply Reports — Monthly COO reports with supply continuity score

## Payment modes supported
Wallet (pre-funded) · Credit NET 30 · Bank transfer · Cash on order

## Tech stack
React 18 · Vite · Recharts · Lucide icons
