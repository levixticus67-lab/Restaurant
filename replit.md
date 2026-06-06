# Saveur Restaurant App

A modern full-stack restaurant e-commerce web application with animated UI, admin portal, Firebase backend, and Cloudinary image uploads.

## Run & Operate

- `pnpm --filter @workspace/restaurant run dev` — run the frontend (auto-assigned port)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string (for API server)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion
- Auth/DB: Firebase (Firestore + Firebase Auth)
- Image Uploads: Cloudinary (unsigned preset)
- API: Express 5
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/restaurant/src/` — frontend React app
  - `pages/Home.tsx` — hero, animated dots, rotating product carousel
  - `pages/Menu.tsx` — full menu with category filters + search
  - `pages/Admin.tsx` — admin portal (add/edit/delete meals + Cloudinary uploads)
  - `pages/Login.tsx` — Firebase Auth login
  - `components/AnimatedDots.tsx` — canvas particle animation
  - `components/RotatingProducts.tsx` — auto-rotating 3D meal showcase
  - `components/MealModal.tsx` — meal detail popup card
  - `components/Cart.tsx` — slide-in cart sidebar
  - `lib/firebase.ts` — Firebase init (reads VITE_FIREBASE_* env vars)
  - `lib/cloudinary.ts` — Cloudinary upload helper
  - `hooks/useMenu.ts` — Firestore real-time meal data + demo fallback
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD (typecheck → build → deploy)
- `DEPLOYMENT_GUIDE.md` — step-by-step guide: Firebase, Cloudinary, Render, GitHub Actions

## Architecture decisions

- Firebase is used directly from the frontend (no server-side proxy needed for reads/writes)
- App works in "demo mode" with sample data when Firebase vars are absent
- Cloudinary unsigned upload preset — no backend needed for image hosting
- GitHub Actions deploys frontend to Firebase Hosting and triggers Render via deploy hook
- Framer Motion handles all animations (rotating carousel, meal modal, cart slide-in)

## Product

- Public: Hero with live animated floating dots, rotating featured meal showcase, full menu with category filtering and search, meal detail popup cards, cart sidebar with order flow
- Admin: Login via Firebase Auth, add/edit/delete meals with photos, toggle availability & featured status, Cloudinary image upload

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `VITE_*` env vars are baked into the frontend at build time — change them in GitHub Secrets for production
- Firebase test-mode rules expire after 30 days — update Firestore Security Rules before going live
- Cloudinary upload preset MUST be set to "Unsigned" for client-side uploads to work
- Render free tier spins down after inactivity — first request after ~15 min will be slow

## Pointers

- See `DEPLOYMENT_GUIDE.md` for the full step-by-step go-live instructions
- See `.env.example` for all required environment variables
- See `.github/workflows/deploy.yml` for the CI/CD pipeline
