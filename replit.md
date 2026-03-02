# WhatsApp Sync - Group Member Migration Tool

## Overview
A web app that connects to WhatsApp via QR code and allows users to transfer members from one WhatsApp group to another.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, Tailwind CSS, shadcn/ui components, TanStack Query
- **Backend**: Express (Node.js), TypeScript via tsx
- **Database**: PostgreSQL (Replit built-in) with Drizzle ORM
- **WhatsApp Integration**: whatsapp-web.js (Puppeteer/Chromium)
- **Routing**: Wouter (client-side), shared API route definitions in `/shared/routes.ts`

## Project Structure
```
client/          - React frontend (Vite)
  src/
    pages/       - Page components
    components/  - UI components
    hooks/       - Custom React hooks
    lib/         - Utilities
server/          - Express backend
  index.ts       - Entry point
  routes.ts      - API route handlers
  storage.ts     - Database abstraction layer
  db.ts          - Drizzle/PostgreSQL connection
  vite.ts        - Vite dev server integration
  static.ts      - Static file serving (production)
shared/          - Shared types and API definitions
  schema.ts      - Drizzle schema (sessions table)
  routes.ts      - Typed API route definitions (Zod)
```

## Key Details
- Server runs on port 5000 (mapped to port 80 externally)
- WhatsApp session uses `LocalAuth` stored in `.wwebjs_auth/`
- Chromium binary: `/nix/store/.../bin/chromium-browser` (configured in `.replit` nix packages)
- Lock file cleanup runs on each server start to prevent stale Chromium profile locks
- Database session tracks WhatsApp connection state (`disconnected`, `starting`, `qr_ready`, `connected`)

## Running
- Development: `npm run dev` (tsx server/index.ts)
- Production: `npm run build && npm start`
- DB migration: `npm run db:push`
