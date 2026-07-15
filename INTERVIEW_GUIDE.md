# FixIt — Project Guide & Interview Prep

FixIt is an AI-powered coding practice tool: you describe a bug or topic you want to learn, an LLM generates a broken-code "sandbox" exercise, you fix it in an in-browser editor, then take a quiz to confirm understanding. Progress, sessions, and stats are persisted per user.

---

## 1. Tech Stack

**Frontend** (`frontend/`)
- React 19 + TypeScript, bundled with **Vite**
- Routing: **react-router-dom v7**
- Global state: **Zustand** (several stores use the `persist` middleware to save to `localStorage`)
- Styling: **Tailwind CSS** (`darkMode: 'class'`)
- Data fetching: **axios** instance with a request interceptor (no React Query/SWR — plain `useEffect` + service functions)
- Code editor: **Monaco** (`@monaco-editor/react`, same engine as VS Code)
- Icons: `lucide-react`
- Auth + DB access from the browser: `@supabase/supabase-js` (anon key)

**Backend** (`backend/`)
- **Express 5** + TypeScript (`ts-node`/`nodemon` in dev, `tsc` → `dist/` for prod)
- DB access: `@supabase/supabase-js` using the **service-role key** (bypasses Row Level Security, full admin access)
- AI: `openai` SDK pointed at **Groq's** OpenAI-compatible endpoint, model `llama-3.3-70b-versatile` — not actually OpenAI, just uses their SDK shape against Groq's inference API (cheaper/faster)
- `zod` to validate the LLM's JSON output before trusting it
- `cors`, `dotenv`

**Why this combo is worth explaining in an interview:** Supabase gives you Postgres + Auth + row-level security out of the box, so the Express backend isn't a full REST-CRUD layer — it exists specifically for things the browser shouldn't do directly: calling the LLM with a server-side API key, and using the service-role key to do cross-user aggregation (stats) that anon-key RLS wouldn't allow.

---

## 2. Repo Layout

```
FixIt/
├── backend/
│   ├── prisma/schema.prisma        # NOT wired up — dead/parallel design, see §9
│   ├── supabase/schema.sql         # additive migration only, not full schema
│   └── src/
│       ├── index.ts                # Express entry, mounts routers, /api/health
│       ├── config/{db.ts,env.ts}   # supabase client (service role) + env loading
│       ├── middleware/auth.middleware.ts
│       ├── modules/
│       │   ├── ai/                 # ai.service.ts (Groq calls), ai.prompts.ts
│       │   ├── sandbox/            # sandbox.controller.ts, sandbox.routes.ts
│       │   ├── sessions/           # sessions.controller/service/routes.ts
│       │   └── auth/               # EMPTY STUBS — auth never went through Express
│       └── types/index.ts
└── frontend/
    └── src/
        ├── App.tsx, main.tsx        # router setup, theme bootstrap
        ├── lib/supabase.ts          # browser Supabase client (anon key)
        ├── pages/                   # SignInPage, SignUpPage, HomePage,
        │                            # PlaygroundPage, ProfilePage, SettingsPage,
        │                            # + sandbox sub-views (CodeEditor, ConceptCard, HintsPanel, ConceptDrawer)
        ├── components/
        │   ├── layout/              # AppLayout, Sidebar, MiniSidebar, SettingsModal
        │   ├── sandbox/, session/   # older/unused duplicate components (see §9)
        │   └── ProtectedRoute.tsx
        ├── store/                   # zustand stores, see §6
        ├── services/                # api.ts (axios), sandbox.service.ts, session.service.ts
        └── hooks/useAuth.ts
```

---

## 3. Database (Supabase / Postgres)

Four tables, inferred from the Prisma schema + service code (no full CREATE TABLE script is checked in — `backend/supabase/schema.sql` is just an ALTER migration):

| Table | Key columns | Purpose |
|---|---|---|
| `users` | `id`, `auth_id` (FK → Supabase Auth user), `username`, `email`, `avatar_url` | App-level profile row, separate from Supabase's own `auth.users` |
| `learning_sessions` | `id`, `user_id`, `title`, `user_input`, `status`, `bookmarked` | One row per "attempt at a topic" |
| `sandboxes` | `session_id` (1:1), `broken_code`, `current_code`, `solution_code`, `task`, `hints[]`, `quiz_*`, `is_solved`, `progress` | The generated exercise + live editor state |
| `attempts` | `sandbox_id`, `submitted_code`, `feedback`, `score` | History of each submit |

**Two Supabase clients, two trust levels:**
- Frontend (`lib/supabase.ts`) uses the **anon key** → subject to Row Level Security, used for auth calls and a couple of direct table writes (e.g. inserting the `users` row on signup).
- Backend (`config/db.ts`) uses the **service-role key** → bypasses RLS entirely, used for everything behind `requireAuth` (session CRUD, stats aggregation, `supabase.auth.admin.getUserById`).

No RLS policies are present in the repo — worth knowing as a gap ("what would you add for production hardening?").

---

## 4. Auth Flow, End to End

1. **Supabase Auth is the source of truth, called directly from the frontend** — `SignInPage`/`SignUpPage` call `supabase.auth.signInWithPassword` / `signUp` / `signInWithOAuth` (GitHub, Google) directly against Supabase, using the anon-key client. The backend's `modules/auth/*` files are empty stubs — login/signup never touches Express at all.
2. `useAuth.ts` wraps `supabase.auth.getSession()` + `onAuthStateChange` into `{ session, isAuthenticated, isLoading }`.
3. `ProtectedRoute.tsx` provides two route guards built on `useAuth()`:
   - `RequireAuth` — redirect to `/signin` if no session
   - `RedirectIfAuthed` — redirect to `/home` if already signed in (used on the sign-in/up pages)
4. **Calling the backend**: `services/api.ts` (axios instance) has a request interceptor that pulls the current access token from `supabase.auth.getSession()` and attaches `Authorization: Bearer <token>` to every request.
5. **Backend verifies it**: `middleware/auth.middleware.ts`'s `requireAuth` calls `supabase.auth.getUser(token)` (service-role client can verify any user's token) to confirm it's valid, then resolves — or lazily creates — the matching `users` table row via `getOrCreateDbUserId()`, and attaches `{ authId, email, dbId }` to `req.user`.
6. **Why the lazy-create matters**: OAuth (GitHub/Google) logins skip the manual signup flow that inserts a `users` row, so the first authenticated API call from an OAuth user creates it on the fly. This is a good "bug I found and fixed" story.
7. **Known rough edge**: the OAuth `redirectTo` is hardcoded to `http://localhost:5173/home` — fine for dev, would break in a deployed environment.

---

## 5. Page-by-Page Walkthrough

### `/signin`, `/signup` — SignInPage, SignUpPage
Email/password + GitHub/Google OAuth via Supabase Auth directly. On signup, after `auth.signUp`, the app manually inserts a row into `users` (`auth_id`, `username`, `email`); if email confirmation is enabled, shows a "check your email" state instead of navigating.

### `/home` — HomePage
A prompt-entry screen: a textarea plus example bug/topic chips. `Cmd/Ctrl+Enter` submits. Navigates to `/playground`, passing `{ userInput }` through React Router's location state — nothing is persisted yet at this point.

### `/playground` — PlaygroundPage (the core feature)
On mount, either:
- **New session**: `POST /api/sandbox/generate` (LLM call) → `POST /api/sessions` (persist the generated sandbox), or
- **Resume**: `GET /api/sessions/:id` to reload an existing session.

Renders a Monaco editor split against a hints/explanation panel, a task description card, and — after "Submit Fix" — a quiz card. Progress is tracked numerically and pushed to the DB incrementally via `PATCH /api/sessions/:id/sandbox`:
- 25 → sandbox generated
- 50 → code submitted
- 75 → quiz answered wrong
- 100 → quiz answered correctly

Each submission is also logged to `attempts` via `POST /api/sessions/:id/attempts`. Wrong quiz answers can request a fresh question via `POST /api/sandbox/quiz-retry`.

A `loadedKeyRef` guards the mount effect so it doesn't double-fire under React StrictMode or re-run just because route state reference changed — a small but real React gotcha worth being able to explain.

### `/profile` — ProfilePage
Fetches `GET /api/sessions/stats` once and renders stat cards (total sessions, concepts learned, streak), a "Top Topics" list, and recent sessions.

### `/settings` route vs. Settings **modal**
The `/settings` route component is a literal "under construction" placeholder — dead code. The real, fully built settings UI is `SettingsModal.tsx`, opened as an overlay (not a route) from the sidebar's user menu, controlled by `settingsStore`'s `isOpen` flag. It has 6 tabs: Account, Appearance, Notifications, Editor, Privacy, Billing. Only Account, Appearance, and Editor actually persist anywhere — Notifications/Privacy/Billing are UI-only. Good example of "feature shipped differently than the commit message describes."

---

## 6. Backend API Surface

All routes below require `requireAuth` (Bearer token verified against Supabase).

**`/api/sandbox`**
- `POST /generate` — calls `ai.service.generateSandbox(userInput)`
- `POST /quiz-retry` — calls `ai.service.regenerateQuiz(concept, previousQuestion)`

**`/api/sessions`**
- `GET /stats` — aggregate profile stats (see below)
- `GET /` — list sessions (joined with `sandboxes(concept, language, is_solved)`)
- `POST /` — create a session + sandbox row (two inserts)
- `GET /:id` — full session + sandbox detail
- `PATCH /:id` — update title/status/bookmarked
- `DELETE /:id` — manually cascades: deletes attempts → sandbox → session (no DB-level `ON DELETE CASCADE`, so ordering matters in app code)
- `PATCH /:id/sandbox` — partial update (quiz state, `isSolved`, `currentCode`, `progress`)
- `POST /:id/attempts` — insert into `attempts`

**`GET /api/health`** — pings the `users` table as a liveness check.

### The AI call (`ai.service.ts`)
Creates an `openai`-SDK client pointed at Groq's base URL, calls `llama-3.3-70b-versatile` with `response_format: json_object` and a system prompt (`ai.prompts.ts`) instructing it to return a strict JSON object: title, language, concept, difficulty, conceptOverview, realWorldAnalogy, requestFlow, syntaxBreakdown, brokenCode, task, 3 hints, solutionCode, quiz question/options/correct index, skills. Response is `JSON.parse`'d then validated against a **Zod schema** — if the model returns malformed or non-conforming JSON, it throws rather than silently passing bad data downstream. This Zod-gate is the key "how do you handle unreliable LLM output" talking point.

### Stats aggregation (`getProfileStats` in `sessions.service.ts`)
The most complex piece of backend logic:
- Calls `supabase.auth.admin.getUserById` (only possible with the service-role key) for email/createdAt
- `conceptsLearned` = distinct concepts where `progress === 100`
- `topTopics` = top 5 concepts by session count, each with an average-progress percentage
- **Streak** = walks backwards day-by-day from today through a `Set` of session dates until it hits a gap

---

## 7. Frontend State Management

Everything global is **Zustand**; several stores persist to `localStorage`:

| Store | Persisted? | Purpose |
|---|---|---|
| `themeStore` | ✅ (`fixit-theme`) | `'light' \| 'dark' \| 'system'` + resolved `isDark` boolean |
| `appearanceStore` | ✅ (`fixit-appearance`) | Accent color choice |
| `editorSettingsStore` | ✅ (`fixit-editor-settings`) | Monaco prefs (font, tab size, minimap, etc.) |
| `settingsStore` | ❌ | Just `isOpen` for the Settings modal |
| `sideBarStore` | ❌ | Sidebar collapsed/expanded toggle |
| `sessionsStore` | ❌ | Caches the sidebar's session list with a `hasLoaded` guard so route changes don't flash empty state |

No React Query/SWR — data fetching is plain `useEffect` + service functions (`services/sandbox.service.ts`, `services/session.service.ts`) built on the shared `axios` instance. Only one custom data hook exists (`useAuth`); sandbox/session fetching logic lives inline in `PlaygroundPage`/`ProfilePage` rather than being extracted into hooks.

---

## 8. Theming (system-based dark mode)

`themeStore.ts`:
```ts
const getSystemIsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches
const resolveIsDark = (theme) => theme === 'system' ? getSystemIsDark() : theme === 'dark'
```

- Persisted via Zustand's `persist`, with an `onRehydrateStorage` hook that **re-resolves** `isDark` after loading from `localStorage` — otherwise a stale cached boolean from a previous session could override the current OS setting.
- `App.tsx` toggles the `dark` class on `<html>` (Tailwind's `darkMode: 'class'` reads this), and separately listens for OS theme changes via `matchMedia(...).addEventListener('change', ...)`, re-triggering resolution only if the stored preference is still `'system'`.
- Accent color is applied as CSS custom properties on `:root` (`--fixit-accent`) rather than Tailwind classes, so switching accent doesn't require a rebuild.
- Individual components branch styling manually on `isDark` (e.g. `isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'`) rather than relying purely on Tailwind's `dark:` variant — consistent throughout the app, but verbose; a reasonable "what would you refactor" answer.

---

## 9. Known Gaps / Things Worth Being Able to Explain

These are honest weak spots — naming them proactively in an interview reads as self-awareness, not sloppiness:

- **Prisma schema is unused.** `backend/prisma/schema.prisma` exists but nothing in `src/` imports a Prisma client — all DB access goes through the raw Supabase JS client. Likely an abandoned early design before settling on Supabase-as-ORM.
- **Duplicate component trees.** `components/sandbox/*` and `components/session/*` are earlier versions superseded by `pages/{ConceptCard,CodeEditor,HintsPanel,ConceptDrawer}.tsx` and inline logic in `Sidebar`, but were never deleted.
- **`authStore.ts` and `sessionStore.ts` (frontend) are dead** — `authStore` is never written to (real auth state comes from `useAuth`), `sessionStore.ts` is a literal empty file.
- **`backend/src/modules/auth/*` is entirely empty** — auth is 100% Supabase-direct from the frontend, Express never mediates it.
- **No RLS policies checked into the repo**, and no `.env.example` in either package.
- **`JWT_SECRET` env var is declared but unused** — leftover from before settling on Supabase-token verification.
- **Hardcoded `localhost:5173` OAuth redirect** — would need to become environment-aware before any real deployment.
- **No CI/CD, no Vercel/Docker config** — this is a local two-server dev setup only (separate Vite + Express processes).

---

## 10. Feature Timeline (from git history)

1. Initial scaffolding — Signup/Signin pages with GitHub/Google OAuth, HomePage, sidebar.
2. Wired Groq (Llama 3.3 70B via the `openai` SDK shape) into the backend and connected it to the frontend sandbox flow.
3. Built the core sandbox-generation loop: prompt → LLM JSON → Zod validation → persisted `learning_sessions`/`sandboxes` rows → interactive Monaco debugging exercise → quiz.
4. Added the Profile page and the streak/top-topics stats aggregation.
5. Added the Settings modal (6 tabs) and reworked theming to support `'system'` mode.
6. Improved mobile UI: hamburger-driven full-screen sidebar drawer, mobile tab switcher (Code/Hints) in the Playground, full-screen Settings modal on small screens, logo placement.

---

## 11. Likely Interview Questions & Ready Answers

**"Walk me through what happens when a user submits a bug description."**
`HomePage` → router state → `PlaygroundPage` mount → `POST /api/sandbox/generate` (Express validates the Bearer token, calls Groq/Llama with a strict JSON-schema prompt, validates the response with Zod) → `POST /api/sessions` persists `learning_sessions` + `sandboxes` rows → Monaco editor renders `broken_code` → user edits → submit updates `progress`/`current_code` → quiz → `progress = 100` on correct answer.

**"Why Supabase instead of your own auth/DB?"**
Gets Postgres + Auth (including OAuth providers) + row-level security for free, so the custom backend only needs to own the things Supabase can't: calling a paid LLM API with a secret key server-side, and doing service-role-privileged aggregation across a user's data for stats.

**"Why Groq instead of OpenAI directly?"**
Groq exposes an OpenAI-compatible API surface so the same `openai` SDK works unmodified — just pointed at a different `baseURL` and using Llama 3.3 70B, generally cheaper/faster inference than a comparable OpenAI model for this kind of structured-JSON generation task.

**"How do you trust the LLM's output?"**
`response_format: json_object` constrains it to valid JSON; a Zod schema then validates types/shape/enum values before anything touches the database — a malformed generation throws rather than getting silently persisted as a broken sandbox.

**"How does dark mode actually work?"**
Zustand store resolves `system|light|dark` → boolean `isDark`, toggles a `dark` class on `<html>` for Tailwind, persists to localStorage, and re-resolves both on rehydrate (avoid stale cached value) and on live OS theme-change events.
