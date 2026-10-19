# RevealLink — Web Client

Anonymous messages with a consent-based identity reveal. This is the Next.js
front end for the **RevealLink** API.

Anyone holding your link can write to your inbox without a name. If you want to
know who wrote, you ask — the sender decides. An approved reveal opens a private
conversation.

---

## Features

- **Anonymous inbox** — share one link; senders don't need an account.
- **Reveal on request** — ask who wrote; one request per message, answered by the sender.
- **Private conversations** — opened only when a reveal is approved.
- **Image attachments** — up to three per message.
- **Optional two-step verification** — a six-digit code by email at sign-in.
- **Google sign-in** — enabled when configured.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Motion | Framer Motion |
| Auth | Auth.js v5 — JWT sessions, Credentials provider |
| Data | Redux Toolkit + RTK Query (reads), Server Actions (writes) |
| Forms | React Hook Form + Zod |

## Getting started

Requires **Node.js 20+** and a running RevealLink API.

```bash
npm install

# create a .env.local with the values listed below
openssl rand -base64 32        # generate a value for AUTH_SECRET

npm run dev                    # http://localhost:3000
```

Point `API_URL` at your backend. If it's tunnelled through ngrok, use the
`https://…ngrok-free.dev` origin — the proxy already sends the skip-warning header.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `API_URL` | yes | Base URL of the RevealLink API. Server-side only. |
| `NEXT_PUBLIC_APP_URL` | yes | Public origin of this app (Auth.js callbacks, share links). |
| `AUTH_SECRET` | yes | Signs and encrypts the Auth.js session JWT. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | no | Enables "Continue with Google". |
| `GOOGLE_CLIENT_ID` | no | Server-side counterpart for the Google flow. |

When the Google values are absent the Google button is hidden and everything
else works unchanged.

## How it works

- **All API traffic goes through a same-origin proxy** (`/api/backend/[...path]`).
  The bearer token is attached server-side and never reaches the browser, and a
  `401` triggers a transparent token rotation.
- **Reads use RTK Query; writes use Server Actions.** Every mutation is
  Zod-validated and returns one shape:
  `{ ok: true, data }` or `{ ok: false, message, fieldErrors }`.
- **Auth is a JWT session.** Backend tokens live inside the Auth.js session
  cookie, so no server-side session store is needed.
- **Attachments** are streamed through `/api/assets/[...path]` with an immutable
  cache header.

## Project structure

```
src/
├─ app/          # App Router: (auth), dashboard, send, api (BFF proxy, assets, Auth.js)
├─ actions/      # Zod-validated Server Actions — every write
├─ auth/         # Auth.js config + exports
├─ components/   # ui/, dashboard/, messages/, conversations/, settings/, landing/, shared/
├─ lib/          # API client, validation, helpers
└─ store/        # RTK Query endpoints + UI slice
```

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Notes

- **Dark theme only.** The design is deliberately flat: three colours
  (`#0C0508`, `#DC143C`, `#F6EDE8`) with opacity variants, and hard offset
  shadows instead of gradients or glows.
- **Recipients are chosen by pasted link only** — the API exposes no public
  user search, so the shareable artefact is `/send?to=<userId>`.
- The **backend** (Express + Mongoose + Redis) is a separate service; point
  `API_URL` at it.
