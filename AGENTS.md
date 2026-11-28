# AGENTS.md

## Stack

- Node.js server with Express 4.17.1 and body-parser 1.19.0.
- Plain browser JavaScript, HTML, and CSS in `public/`.
- JSON file persistence in `data/db.json`; no database package is configured.

## Module map

- `routes/products.js` — lists products and active coupon codes.
- `routes/orders.js` — creates, lists, retrieves, and cancels orders.
- `routes/customers.js` — lists customers and records Khata settlements.
- `routes/reports.js` — serves dashboard, GST reconciliation, pricing preview, and admin export.
- `lib/coupons.js` — normalizes, validates, calculates, and lists coupons.
- `lib/invoice.js` — recomputes printable invoice figures and renders the HTML invoice.
- `lib/inventory.js` — finds products and checks, reserves, releases, and summarizes stock.
- `lib/dates.js` — formats and normalizes application dates.
- `lib/orders.js` — adds, retrieves, cancels, and lists order records.
- `lib/ledger.js` — manages customer balances, Khata charges, reversals, and settlements.
- `lib/pricing.js` — computes subtotals, coupon discounts, line GST, and totals.
- `lib/reports.js` — builds dashboard summaries and GST reconciliation comparisons.
- `lib/tax.js` — resolves item GST rates and splits tax into CGST and SGST.
- `lib/store.js` — reads and writes `data/db.json` and appends audit entries.

## Commands

- Start the app: `node server.js`
- Run tests: `node --test`

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; they use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed.

Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
