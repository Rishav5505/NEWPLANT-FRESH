# JeevaLeaf — botanical plant store

React 19 + Vite + Tailwind v4 frontend, Express + MongoDB backend (`server/`).

## Run locally

```bash
# frontend (http://localhost:5173)
npm install
npm run dev            # needs VITE_API_BASE_URL in .env

# backend (http://localhost:4000)
cd server
npm install
npm start              # needs MONGO_URI, JWT_SECRET, ADMIN_SECRET (see server/.env.example)
```

## Frontend structure

| Path | What |
|---|---|
| `src/index.css` | Design tokens (light + "Night garden" dark mode), fonts, utilities |
| `src/context/` | Auth, cart (persisted), wishlist (synced), catalogue cache, toasts, theme |
| `src/components/layout/` | Header, footer, cart drawer, auth modal, search overlay |
| `src/components/ui/` | Buttons, modal, reveal-on-scroll, stars, skeletons |
| `src/pages/` | Home, Shop, Product, Plant Finder, Care Library, My Garden, Checkout, account, admin |
| `public/images/hd/` | HD photography (Unsplash licence) |

Every page has its own URL (`/shop/indoor`, `/product/:id`, `/account/orders`…). `vercel.json` rewrites deep links to `index.html`.

## Features

- **Plant Finder** — 4-question quiz that matches plants to light, routine and pets
- **Care Library** — plant profiles, Plant Doctor symptom checker, Indian seasonal care guide
- **My Garden** — personal watering schedule, reminders, streaks; delivered plants are added automatically
- **Wishlist sync** — guest wishlist merges into the account on sign-in
- **Product reviews** — "Verified buyer" when the reviewer received that product
- **Coupons** — `WELCOME10` (first order) and `GREEN150` are seeded; admins manage codes in Marketing
- **Wallet** — 5% cashback credited on delivery, usable at checkout, refunded on cancellation
- **Gift orders**, customer order cancellation, order tracking timeline, newsletter
- **Referral program** — every customer gets a code; friends get ₹100 off their first order (₹499+), referrer gets ₹100 wallet credit on delivery
- **Morning watering emails** — daily ~8 am IST for thirsty garden plants (needs SMTP; users can switch off on My Garden)
- **Back-in-stock alerts** — "Notify me" on sold-out products; emails go out when an admin restocks
- **Track order** (`/track`) — guests track with order number + email
- **Quick view**, recently viewed, "Pair it with" basket suggestions, delivery-date estimate by pincode, sticky mobile buy bar, Buy again, Move wishlist to basket
- **Installable app** — web manifest + icons (Add to Home Screen)
- **Admin console** (`/admin`) — revenue chart, order pipeline, order management, stock editing, coupons, messages, customers, newsletter CSV export

- **3D Pot Studio** (`/studio`) — procedural three.js plants (Monstera, Snake Plant, Money Plant, Cactus) in 3 pot shapes × 6 finishes × 3 sizes; drag to rotate, save image, share link. Home has an auto-cycling 3D preview that loads only when scrolled into view.
- **3D UI** — tilt-with-glare on product and category cards (desktop), pointer parallax on the hero
- **Deal of the Day** (server-priced, live countdown), bestseller badges and ratings from real orders/reviews, "Shop by need" collections, best-selling/top-rated sorts
- **Product Q&A**, **Leaf Club** loyalty tiers (5/7/10% cashback), gift wrap, delivery date & time slot, save for later, compare up to 3 products, frequently bought together, shareable wishlists, welcome offer popup, WhatsApp chat, mobile bottom tab bar

Set `SITE_URL` on the server (e.g. `https://jeevaleaf.vercel.app`) so links in emails point to the live site.

## Pricing rules (server-side)

Prices are in ₹ and always computed on the server from the catalogue: 5% GST, ₹79 delivery under ₹999, free above.
Stock is only enforced for products where an admin has set stock.

## Notes

- `EXPOSE_DEBUG_OTP=true` returns OTPs in API responses when email fails — **local testing only**.
- CSV sync upserts by product name, so product IDs stay stable across restarts.
