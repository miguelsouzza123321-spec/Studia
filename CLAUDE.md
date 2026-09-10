# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Studia is a Portuguese-language school scheduling system ("Sistema completo de gestão de horários, laboratórios e presença escolar, inspirado no Urânia" — see `metadata.json`): class schedules, lab bookings, teacher attendance and medical-certificate approval. It's a single-tenant admin/teacher web app, not a library.

## Commands

- `npm run dev` — start the app (`tsx server.ts`; Vite runs in Express middleware mode, single process, port from `.env`/`PORT`, default 3000).
- `npm run build` — build the client with Vite, then bundle `server.ts` to `dist/server.cjs` with esbuild (CJS, node platform, sourcemaps).
- `npm start` — run the production build (`node dist/server.cjs`).
- `npm run lint` — type-check only (`tsc --noEmit`); no linter is configured.
- `npm run clean` — remove `dist/`.

There is no test suite/framework in this repo.

Requires a `.env` at the repo root with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `PORT` — the server throws on startup if any are missing (`server.ts`).

## Architecture

**This is not a React app despite `react`/`@vitejs/plugin-react` in `package.json`.** The actual frontend is a single hand-rolled vanilla-JS file, `src/app.js` (~3200 lines), that does full-string re-renders into `#app` via `innerHTML` — there is no virtual DOM, no components, and no JSX in use. React/Recharts/motion in `package.json` are present but unused by the current UI; don't assume component-based patterns exist.

Frontend structure inside `src/app.js` (sections marked with `// ---` comments):
- **DOM helpers** — `$()` (querySelector) and `render(template)`, which overwrites `#app.innerHTML` and re-runs `lucide.createIcons()`.
- **State** — plain module-level `let` variables (`user`, `schedules`, `teachers`, `currentTab`, etc.), some persisted to `localStorage` (`user`, `api_base_url`, `reportCardSize`).
- **API base URL resolution** — `apiBaseUrl`/`getApiUrl()` auto-detect environment: localhost uses `http://localhost:3000` directly; other static hosts (e.g. GitHub Pages) are pointed at a deployed Railway backend. Be careful when touching this logic — it's how the static-hosted build finds its API.
- **Views** — large template-string-returning functions (`LandingView`, `AdminView`, `TeacherView`, `DeveloperView`, plus report/grid views) that build the full HTML for a screen.
- **Actions** (`const actions = {...}`, assigned to `window.actions`) — the only interaction layer. Templates wire up behavior via inline `onclick="actions.someMethod(...)"` attributes (no `addEventListener` delegation, no router). Every state-changing action ends by calling `this.init()`, which re-renders the whole app based on `user`/`currentTab`. `actions.init()` is also the bootstrap call at the bottom of the file.
- **PDF/print support** — a manual OKLCH→RGB color polyfill (`oklchToRgbFallback`, `resolveOklchToRgb`, `cleanOklchFromStylesheets`, `prepareOklchForPrint`, `enableOklchPolyfill`) works around `html2canvas`/`html2pdf.js` not understanding Tailwind 4's OKLCH-based colors when exporting printable report sheets.

To add or change UI behavior: find the relevant `*View()` function, edit its template string, and add/extend a method on the `actions` object — following the existing `onclick="actions.x()"` + `this.init()` re-render pattern rather than introducing a different state/rendering approach.

**Backend** (`server.ts`, Express): a thin REST proxy in front of Supabase. Two Supabase clients are created — one with the service role key (`supabase`, used for all privileged DB/auth-admin operations) and one with the anon key (`supabaseAuth`, used only for `auth.signInWithPassword` at login) — the service role key must never reach the browser, which is why this proxy exists. Routes cover auth (`/api/auth/register`, `/login`), schedules CRUD, lab bookings, certificates (including an approve endpoint that also flips the related schedule's status to `'vaga'`), stats, and user/teacher management. In dev, Vite runs as Express middleware (`middlewareMode: true`, `appType: 'spa'`); in production it serves `dist/` as static files with an SPA fallback (`NODE_ENV=production` gates this).

**Data layer**: Supabase/Postgres tables used directly by table name in `server.ts` — `users`, `schedules`, `lab_bookings`, `certificates`. No ORM/migration files live in this repo; schema changes happen in Supabase directly.
