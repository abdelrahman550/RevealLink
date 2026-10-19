# RevealLink — Web Client

A production-shaped Next.js front end for the **RevealLink** API — anonymous
messages with a consent-based identity reveal.

Anyone holding a person's link can write to their inbox without an account or a
name. If the recipient wants to know who wrote, they ask; the sender decides
whether to reveal themselves. An approved reveal opens a private conversation.

---

## Contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Backend coverage](#backend-coverage)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Decisions & trade-offs](#decisions--trade-offs)
- [Known limitations](#known-limitations)
- [Scripts](#scripts)

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first tokens) + `tw-animate-css` |
| Components | shadcn/ui primitives, hand-authored to match the design language |
| Motion | Framer Motion (entrance + layout only; honours reduced motion) |
| Auth | Auth.js v5 (`next-auth@5.0.0-beta`) — JWT sessions, Credentials provider |
| Forms | React Hook Form + Zod (one resolver, one error shape everywhere) |
| Data | Redux Toolkit + RTK Query for reads, Server Actions for writes |
| Icons | lucide-react |
| Toasts | sonner |

---

## Architecture

Two rules shape the whole codebase:

1. **The browser never talks to the backend directly.** Every request goes
   through a same-origin Backend-For-Frontend proxy.
2. **Reads and writes are separated.** Reads use RTK Query; every mutation is a
   Server Action.

```
Browser
  │
  ├─ ui (RSC + client components)
  │     ├─ reads  ──▶ RTK Query ──▶ /api/backend/*   (BFF proxy)
  │     └─ writes ──▶ Server Action ─┐
  │                                   ▼
  └─ attachments ──▶ /api/assets/* ──▶ (streams backend /assets)
                                      │
                       Next.js server │  attaches bearer token
                                      ▼
                                  RevealLink API
```

### The BFF proxy — `src/app/api/backend/[...path]/route.ts`

- Reads the Auth.js session cookie server-side and attaches the bearer token, so
  **access tokens never reach the client**.
- Sidesteps the API's strict CORS allow-list (all traffic is same-origin).
- Sends `ngrok-skip-browser-warning: true`, so a tunnelled backend isn't blocked
  by the ngrok interstitial.
- On a `401`, calls `POST /users/rotate-token` with the refresh token, retries the
  request once, and rewrites the session cookie via `decode`/`encode` from
  `next-auth/jwt`. Rotation is transparent to callers.

### Server Actions — `src/actions/*`

Every mutation is a Zod-validated Server Action. Each returns one discriminated
union via `runAction`:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors: Record<string, string>; code?: string };
```

That means no `try/catch` in components, no thrown errors crossing the boundary,
and field errors arrive in a shape the forms render directly.

### Auth flow — `src/auth/*`, `src/actions/auth.actions.ts`

The Credentials provider does **not** perform the login. It only exchanges an
already-proven `{ accessToken, refreshToken }` pair (validated against
`GET /users`) for a session cookie. The real login lives in a server action so it
can branch on the backend's two-step (2FA) behaviour:

- `POST /auth/login` returns credentials → session starts immediately.
- `POST /auth/login` returns `data: undefined` → 2FA is required; the action
  returns `{ requires2FA: true }` and the form collects a 6-digit code via
  `POST /auth/verify-2FA-code`.

Protected routes are guarded in `src/app/dashboard/layout.tsx` with
`requireSession()` (an `auth()` read + `redirect("/login")`) rather than
middleware — a single, explicit choke point that also gives every dashboard view
the session it needs.

### Attachments

The API serves uploaded images from `express.static("./assets")`. The client
streams them through `/api/assets/[...path]` with a long-lived immutable cache
header, so image tags point at a same-origin URL and nothing leaks the API host.

---

## Backend coverage

Every route in the API has a typed function in `src/lib/api/endpoints.ts`, and is
surfaced in the UI.

### Auth

| Method | Route | Where |
| --- | --- | --- |
| `POST` | `/auth/signup` | Register form → `signupAction` |
| `POST` | `/auth/login` | Login form → `loginAction` (2FA-aware) |
| `POST` | `/auth/verify-2FA-code` | Login 2FA step → `verify2FALoginAction` |
| `POST` | `/auth/signup-with-gmail` | Google button → `googleSignInAction` |
| `PATCH` | `/auth/confirm-email` | Verify page → `confirmEmailAction` |
| `PATCH` | `/auth/resend-confirmation-email` | Verify page → `resendConfirmationEmailAction` |
| `POST` | `/auth/forgot-password` | Forgot form → `forgotPasswordAction` |
| `POST` | `/auth/verify-forgot-password` | Reset step 1 → `verifyForgotPasswordCodeAction` |
| `PATCH` | `/auth/reset-forgot-password` | Reset step 2 → `resetPasswordAction` |
| `POST` | `/auth/enable-2-step-verification` | Settings → `start2FAAction` |
| `POST` | `/auth/verify-2FA-enable-code` | Settings → `enable2FAAction` |

### Users

| Method | Route | Where |
| --- | --- | --- |
| `GET` | `/users` | `useGetMeQuery` (sidebar, settings, conversation alignment) |
| `PATCH` | `/users` | Settings → `updateProfileAction` |
| `POST` | `/users/profile-image` | Settings → `uploadProfileImageAction` |
| `POST` | `/users/rotate-token` | BFF proxy (automatic refresh) |
| `POST` | `/users/logout` | Account menu → `logoutAction` |

### Messages

| Method | Route | Where |
| --- | --- | --- |
| `POST` | `/messages` | Dashboard compose + public `/send?to=` → `createMessageAction` |
| `GET` | `/messages` | Inbox / Sent / All → `useGetMessagesQuery` |
| `GET` | `/messages/:id` | Message detail → `useGetMessageQuery` |
| `DELETE` | `/messages/:id` | Message card / detail → `deleteMessageAction` |

### Reveal requests

| Method | Route | Where |
| --- | --- | --- |
| `POST` | `/reveal-requests/:messageId` | "Ask who sent this" → `createRevealRequestAction` |
| `GET` | `/reveal-requests/received` | Requests page → `useGetReceivedRevealRequestsQuery` |
| `GET` | `/reveal-requests/sent` | Requests page → `useGetSentRevealRequestsQuery` |
| `PATCH` | `/reveal-requests/:id/:decision` | Approve / decline → `decideRevealRequestAction` |

### Conversations

| Method | Route | Where |
| --- | --- | --- |
| `GET` | `/conversations` | Conversations page → `useGetConversationsQuery` |
| `GET` | `/conversations/:id/messages` | Thread → `useGetConversationMessagesQuery` |
| `POST` | `/conversations/:id/messages` | Thread composer → `sendConversationMessageAction` |

---

## Getting started

**Prerequisites:** Node.js 20+, and a running RevealLink API.

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local     # then fill in AUTH_SECRET and API_URL

# 3. Generate a session secret
openssl rand -base64 32        # paste into AUTH_SECRET

# 4. Run
npm run dev                    # http://localhost:3000
```

Point `API_URL` at your backend. If it's tunnelled through ngrok, use the
`https://…ngrok-free.dev` origin — the proxy already sends the skip-warning
header.

---

## Environment variables

| Variable | Required | Scope | Purpose |
| --- | --- | --- | --- |
| `API_URL` | yes | server | Base URL of the RevealLink API. Used by the BFF proxy and server actions. |
| `NEXT_PUBLIC_APP_URL` | yes | both | Public origin of this app. Used for Auth.js callbacks, `metadataBase`, sitemap, and share links. |
| `AUTH_SECRET` | yes | server | Signs/encrypts the Auth.js session JWT. |
| `AUTH_SECRET_KEY` | no | server | Alternative to `AUTH_SECRET` when migrating between Auth.js versions. |
| `AUTH_URL` | no | server | Auth.js issuer. Defaults to `NEXT_PUBLIC_APP_URL`. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | no | browser | Enables "Continue with Google" when present. |
| `GOOGLE_CLIENT_ID` | no | server | Server-side counterpart for the Google flow. |

When the Google variables are absent, the Google button is hidden and the rest of
the app works unchanged.

---

## Project structure

```
src/
├─ app/
│  ├─ (auth)/                  # login, register, verify, forgot/reset — no chrome
│  ├─ dashboard/               # protected shell + views
│  │  ├─ layout.tsx            # requireSession + rail, topbar, share link
│  │  ├─ page.tsx              # overview: stats, recent inbox, share link
│  │  ├─ messages/             # list + [messageId] detail
│  │  ├─ new/                  # compose
│  │  ├─ requests/             # received / sent reveal requests
│  │  ├─ conversations/        # list + [conversationId] thread
│  │  └─ settings/             # link, profile, security, appearance
│  ├─ send/                    # public anonymous composer (?to=<userId>)
│  └─ api/
│     ├─ auth/[...nextauth]/   # Auth.js handlers
│     ├─ backend/[...path]/    # BFF proxy (bearer + refresh)
│     └─ assets/[...path]/     # attachment streaming
├─ actions/                    # every mutation, Zod-validated
├─ auth/                       # Auth.js config + exports
├─ components/
│  ├─ ui/                      # shadcn primitives
│  ├─ dashboard/               # rail nav, account menu, page header
│  ├─ messages/ reveal/ conversations/ settings/ share/
│  ├─ shared/                  # spinner, empty state, pagination, lightbox…
│  ├─ landing/ layout/ auth/ brand/ motion/
├─ lib/
│  ├─ api/                     # types, client, endpoints, errors
│  ├─ validation.ts            # Zod mirrors of the backend's rules
│  ├─ actions.ts               # runAction / requireAccessToken
│  ├─ use-url-state.ts         # list state ⇄ query string
│  ├─ session.ts constants.ts utils.ts
├─ store/
│  ├─ api/                     # RTK Query endpoints (one file per resource)
│  └─ slices/ui.slice.ts       # drawer + lightbox state
└─ types/next-auth.d.ts        # session/JWT augmentation
```

---

## Design system

The brief was **"midnight confession booth meets neon afterglow"** — dark,
intimate, a little dangerous, but clean and trustworthy. The organising idea is
*concealment vs. reveal*: things are blurred, frosted and masked until someone
chooses to be known, at which point they sharpen and glow.

- **Tokens.** `--bg #0B0713`, `--surface #161022`, `--glass rgba(255,255,255,0.06)`,
  `--border rgba(255,255,255,0.10)`, `--pink #FF2D87`, `--violet #8B5CFF`,
  `--gold #FFB36B`, `--anon #A79BC9`, `--text #F5F0FF`, `--muted #8E84A8`.
- **Gradients.** Primary `135deg, #FF2D87 → #8B5CFF` for buttons, active states,
  the logo and sent bubbles. The **reveal** gradient `135deg, #FF2D87 → #FFB36B`
  is reserved *strictly* for reveal moments (approve buttons, revealed-sender
  strips) so it keeps its meaning.
- **Type.** *Sora* (bold, tight tracking) for headings; *Inter* for body and
  messages; *JetBrains Mono* for labels, timestamps and `ANONYMOUS` tags
  (`label-caps` = mono 11px / 0.16em uppercase).
- **Surfaces.** Glass cards — `backdrop-filter: blur(20px)`, 6% white fill, 1px
  10% white hairline, 20–28px radii. Emphasis is **glow, not shadow**
  (`0 0 30px rgba(255,45,135,0.35)` on focus/active). The page sits on two large
  drifting gradient orbs (magenta top-left, violet bottom-right) under a faint
  film grain.
- **Signature components.** The anonymous bubble (frosted violet avatar with a
  slow shimmer + mono `ANONYMOUS` tag); the "Ask who sent this" pill (gradient
  hairline, pulsing eye); the reveal-request card ("Reveal myself" carries the
  reveal gradient and a heartbeat); the private thread (sent bubbles use the
  primary gradient, received are plum glass, a "Revealed 🔓" chip sits on top);
  the tab rail's active icon glowing pink over a hairline that slides between
  items.
- **Motion with intent.** Send morphs the paper-plane into a checkmark with a
  spark; the typing indicator is three pulsing lavender dots; toasts slide in
  from the top as glass. Everything animates opacity/transform only and collapses
  to near-instant fades under `prefers-reduced-motion`.

All tokens live in `src/app/globals.css` as Tailwind v4 CSS variables plus a
small set of `@utility` helpers (`glass`, `bg-gradient-primary`,
`bg-gradient-reveal`, `gradient-ring`, `label-caps`, `tnum`, `film-grain`).

**Dark only, by design.** There is no light theme and no theme switcher: a bright
palette would wash out every glow and break the blur-is-hidden / sharp-is-revealed
language. The app forces `dark` and Settings → Appearance explains why rather
than offering a toggle.

---

## Decisions & trade-offs

- **BFF over direct calls.** Keeps tokens off the client and neutralises CORS at
  the cost of one extra hop. Worth it.
- **Server Actions for every write.** Free CSRF protection, no exposed mutation
  endpoints, and one error shape. RTK Query is used only where caching,
  invalidation, and optimistic updates earn their keep.
- **Session in a JWT, backend tokens inside it.** No server-side session store is
  required, and the proxy can refresh tokens without a round-trip to the client.
- **Public send link carries the raw user id.** The API exposes no user-search
  endpoint, so the shareable artefact *is* `/send?to=<userId>`. The recipient is
  therefore not editable on the public page.
- **URL is the source of truth for list state.** Tabs, filters, and pages for
  messages, requests, and conversations live in the query string, so views are
  shareable and the back button behaves.
- **Optimistic where it matters.** Reveal decisions patch the RTK Query cache and
  roll back on failure; conversation replies appear instantly with a temporary
  id and are swapped for the server's copy.

---

## Known limitations

- **No in-app i18n.** The client always sends `Accept-Language: 0` (English).
  A locale switcher is a natural next step.
- **2FA state isn't shown as on/off.** The `User` payload carries no flag, so
  Settings can enable 2FA but cannot report whether it's already enabled.
- **Conversation threads read the newest 100 messages.** The list endpoint is
  paginated; the thread normalises ordering client-side and caps at one page.
- **The sidebar name refreshes from `GET /users`,** not from the JWT — the token
  is only rewritten on login or token rotation.
- **Unauthenticated `/dashboard` redirects mid-stream.** The guard in
  `app/dashboard/layout.tsx` redirects to `/login`, but because Next.js may have
  already flushed the shell the address bar can briefly keep `/dashboard` while
  the login view renders. No dashboard data is ever sent. A `middleware.ts`
  matcher would make the redirect hard.

---

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
