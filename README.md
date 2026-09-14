# B4F Hub — Take-Home Starter Project

This is your starting point for the B4F Hub take-home assessment. It contains:

- a bare React + TypeScript + Vite project (`src/App.tsx` is intentionally minimal — you build
  everything from here)
- a ready-to-run local API (`server/`) with seed data already loaded — **you are not asked to
  build or modify the API**

## Install and run

```bash
npm install
npm run dev
```

This starts BOTH the frontend and the local API together:

- Frontend: `http://localhost:5173`
- Local API: `http://localhost:3001` (already proxied — call it from your code as `/api/...`,
  e.g. `fetch("/api/posts")`, no CORS setup needed)

## What's provided vs. what you build

**Provided (do not need to build):** the local API and its five endpoints, seed data, this
starter's build tooling.

**You build:** all React components, all TypeScript types, all API integration code, all styling,
all state, all filtering/search logic, and the required data-structure behaviors.

See `B4F_HUB_TAKE_HOME_REQUIREMENTS.pdf` for the full assignment and `B4F_HUB_UI_REFERENCE.pdf`
for the interface you should reasonably match.

## Resetting your data

The local API keeps all posts/opportunities in memory. If you want a completely fresh seed data
set at any point, just stop the dev server (Ctrl+C) and run `npm run dev` again.
