# coco preeth

Exported WebForge Studio React Website.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or pnpm install / yarn
   ```

2. Run local dev server:
   ```bash
   npm run dev
   ```

3. Routes:
   - **Public Website**: `http://localhost:5173/`
   - **Studio Admin Suite**: `http://localhost:5173/admin`

## Dynamic Page Architecture

This project connects directly to **WebForge Firestore** at runtime:
- All pages, routes, and schemas are fetched dynamically for project `coco-preeth`.
- Any changes published in the WebForge Studio or the local `/admin` panel update the live site instantly without rebuilding.

## Firebase Setup

This project uses **two separate Firebase instances**:

### 1. WebForge Firebase (page schema source)
Connects to WebForge's Firestore to fetch your page layouts at runtime.
These credentials are pre-filled and managed by WebForge — **do not change them**.

Env vars: `VITE_WEBFORGE_FIREBASE_API_KEY`, `VITE_WEBFORGE_FIREBASE_AUTH_DOMAIN`, `VITE_WEBFORGE_FIREBASE_PROJECT_ID`

Import: `import { webforgeDb } from './lib/firebase'`

### 2. Your Project Firebase (website data)
Your own Firebase project for all website-specific data — products, orders, users, blog posts, etc.
These credentials come from the Firebase project you configured in WebForge Settings.

Env vars: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`

Import: `import { db } from './lib/firebase'`

> Both instances are already initialised in `src/lib/firebase.ts`. Use `webforgeDb` to
> read page schemas and `db` for everything else in your website.
