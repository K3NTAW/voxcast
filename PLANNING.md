# Live Stream Translation — PLANNING.md

> Implementation-ready plan for a Next.js + Prisma (Postgres on Prisma Data Platform) live stream translation web app with BYOK (Deepgram + DeepL), OAuth (Twitch / Google / Discord), and OBS / Meld Studio browser-source subtitle output.

---

## 1. Product summary

A web app where streamers sign in, paste their own Deepgram and DeepL API keys, pick a source and a target language, and get a `https://app/overlay/<token>` URL they drop into OBS or Meld Studio as a Browser Source. The streamer's browser captures microphone audio, sends it to a server-side WebSocket route that proxies to Deepgram (real-time STT) and DeepL (translation), and pushes the translated captions to all subscribed overlay clients with sub-second end-to-end latency.

**v1 scope (single-broadcaster, single target language per overlay token):**
- Account CRUD with Twitch / Google / Discord OAuth
- BYOK encrypted key storage (Deepgram + DeepL)
- Live capture → STT → translation → overlay pipeline
- Customizable subtitle font / style / background
- OBS-friendly `chroma-key safe` overlay route
- Multi-language UI (English, Spanish, German, French, Japanese, Portuguese, Korean to start)
- OWASP ASVS L2-aligned controls

**Out of scope for v1:** per-viewer language selection, recording / VOD subtitle export, team accounts, Stripe billing.

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router, RSC, Route Handlers) | Edge runtime where possible |
| Hosting | Vercel | Pro plan for WebSocket-compatible Edge functions and longer durations |
| Realtime transport | Native `WebSocket` via Vercel Edge Functions + `ws` fallback on a separate worker (Fly.io / Render) for the audio-streaming socket, because Vercel Edge has a 5-min hard cap | See §6 |
| Database | Prisma Postgres (Prisma Data Platform) | Pooled connection via Prisma Accelerate |
| ORM | Prisma 5.x | Migrations checked into `/prisma/migrations` |
| Auth | Auth.js v5 (NextAuth successor) with `@auth/prisma-adapter` | Twitch, Google, Discord providers |
| STT | Deepgram (`nova-2` model, streaming WebSocket) | BYOK |
| Translation | DeepL (`v2/translate`, glossary support optional) | BYOK |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix primitives | See DESIGN.md |
| State | React Server Components + Zustand for client overlay state | |
| Validation | Zod everywhere at trust boundaries | |
| Encryption | `@noble/ciphers` AES-256-GCM with KMS-derived key | See §8 |
| i18n | `next-intl` (App Router compatible) | Server + client translation |
| Observability | Vercel Logs (structured JSON via console) | |
| Tests | Vitest (unit), Playwright (e2e), `@axe-core/playwright` (a11y) | |
| CI/CD | GitHub Actions → Vercel preview deploys, Prisma migrate on `main` | |

---

## 3. High-level architecture

```
                                            ┌─────────────────────────────┐
                                            │   Vercel (Next.js App)      │
                                            │  - Marketing + Dashboard    │
                                            │  - Auth.js routes           │
                                            │  - REST/RPC routes (Edge)   │
                                            │  - Server actions           │
 Streamer Browser                            └──────────────┬──────────────┘
 ┌──────────────────────┐  HTTPS (Auth, settings)           │ Prisma Accelerate
 │ Capture mic + WebRTC │◀──────────────────────────────────┘        │
 │ Audio chunks (Opus)  │                                            ▼
 │ → WebSocket          │                                  ┌───────────────────┐
 └──────────┬───────────┘                                  │ Prisma Postgres   │
            │ wss://ingest.<app>/v1/session                │ (Prisma Data      │
            ▼                                              │  Platform)        │
 ┌──────────────────────┐    Deepgram WS (BYOK)            └───────────────────┘
 │ Audio Ingest Worker  │───────────────────────────────▶ Deepgram nova-2
 │ (Fly.io / Render)    │◀───────────────────────────────  transcript JSON
 │  - Decodes Opus      │
 │  - Buffers / VAD     │    DeepL HTTPS (BYOK)
 │  - Calls Deepgram    │───────────────────────────────▶ DeepL /v2/translate
 │  - Calls DeepL       │◀───────────────────────────────  translated text
 │  - Broadcasts caption│
 └──────────┬───────────┘
            │ wss://overlay.<app>/v1/overlay/<token>
            ▼
 ┌──────────────────────┐
 │ OBS / Meld Browser   │
 │ Source (overlay HTML)│
 └──────────────────────┘
```

The **audio ingest worker** is deliberately split off Vercel because (a) Vercel Edge has runtime limits incompatible with long-lived sockets, and (b) we want a single regional pop close to Deepgram's endpoint to minimize round-trip latency. The Next.js app handles everything except the live audio pipe.

---

## 4. Repository layout

```
/                              # Next.js root
  app/
    (marketing)/               # Public landing, pricing-ish, docs
    (app)/dashboard/           # Authed area
      keys/                    # BYOK management
      sessions/                # Past sessions / metrics
      settings/                # Profile, language, subtitle defaults
      overlay-builder/         # Live preview + style editor
    overlay/[token]/           # PUBLIC overlay page (no auth)
    api/
      auth/[...nextauth]/      # Auth.js
      keys/                    # BYOK CRUD
      overlay/                 # Token mint, rotate, revoke
      session/                 # Session lifecycle
      health/                  # Liveness / readiness
    [locale]/                  # next-intl segment
  lib/
    auth.ts                    # Auth.js config
    db.ts                      # Prisma client (with Accelerate)
    crypto.ts                  # AES-GCM helpers
    rate-limit.ts              # Upstash sliding window
    csp.ts                     # CSP / security header builder
    i18n.ts                    # next-intl helpers
  components/                  # See DESIGN.md
  prisma/
    schema.prisma
    migrations/
  messages/                    # next-intl JSON (en, es, de, fr, ja, pt, ko)
  worker/                      # Audio ingest service (own Dockerfile, deploy target)
    src/
      ws-server.ts             # Inbound from streamer
      deepgram-client.ts
      deepl-client.ts
      broadcast.ts             # Outbound to overlays
      auth-jwt.ts              # Verifies short-lived session JWT from web app
  tests/
    e2e/
    unit/
  .github/workflows/
  docs/
    PLANNING.md                # this file
    DESIGN.md
```

---

## 5. Data model (Prisma schema)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")        // Prisma Accelerate URL
  directUrl = env("DIRECT_DATABASE_URL") // for migrations
}

// ---------- Auth.js core models ----------
model User {
  id                String          @id @default(cuid())
  email             String?         @unique
  emailVerifiedAt   DateTime?
  name              String?
  image             String?
  locale            String          @default("en")
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  deletedAt         DateTime?       // soft delete for GDPR DSAR

  accounts          Account[]
  sessions          Session[]
  apiKeys           ApiKey[]
  overlayTokens     OverlayToken[]
  subtitleProfiles  SubtitleProfile[]
  streamSessions    StreamSession[]
  auditLogs         AuditLog[]

  @@index([deletedAt])
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String   // "twitch" | "google" | "discord"
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ---------- BYOK ----------
enum ApiProvider {
  DEEPGRAM
  DEEPL
}

model ApiKey {
  id              String      @id @default(cuid())
  userId          String
  provider        ApiProvider
  label           String      @default("Default")
  ciphertext      Bytes       // AES-256-GCM(ciphertext || tag)
  iv              Bytes       // 12-byte nonce
  keyVersion      Int         @default(1) // key rotation marker
  last4           String      // for UI display only ("••••••AB12")
  lastUsedAt      DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  revokedAt       DateTime?

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider, label])
  @@index([userId, provider])
}

// ---------- Subtitle styling ----------
model SubtitleProfile {
  id              String   @id @default(cuid())
  userId          String
  name            String   // "Default", "Dark mode", "Twitch overlay"
  isDefault       Boolean  @default(false)
  // typography
  fontFamily      String   @default("Inter")        // whitelist enforced server-side
  fontWeight      Int      @default(700)
  fontSizePx      Int      @default(48)
  lineHeight      Float    @default(1.2)
  letterSpacingEm Float    @default(0)
  textColor       String   @default("#FFFFFF")
  textStrokeColor String   @default("#000000")
  textStrokePx    Int      @default(4)
  textShadow      String?  // CSS shadow string, sanitized
  textAlign       String   @default("center")       // left|center|right
  textCase        String   @default("none")         // none|upper|lower
  // background
  bgMode          String   @default("transparent")  // transparent|solid|gradient|blur
  bgColor         String   @default("#00000080")    // 8-digit hex (with alpha)
  bgPaddingX      Int      @default(24)
  bgPaddingY      Int      @default(12)
  bgRadiusPx      Int      @default(12)
  bgBlurPx        Int      @default(0)
  // layout
  position        String   @default("bottom")       // top|center|bottom
  maxWidthPct     Int      @default(80)
  marginPx        Int      @default(48)
  // behavior
  fadeMs          Int      @default(150)
  holdMs          Int      @default(1500)
  maxLines        Int      @default(2)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  overlayTokens   OverlayToken[]

  @@unique([userId, name])
  @@index([userId, isDefault])
}

// ---------- Overlay tokens (the OBS/Meld URL) ----------
model OverlayToken {
  id                String   @id @default(cuid())
  userId            String
  // token is a 32-byte random URL-safe string; HASH stored, plaintext only shown once
  tokenHash         String   @unique
  sourceLanguage    String   // BCP-47, e.g. "en-US"; "auto" allowed for Deepgram
  targetLanguage    String   // BCP-47, e.g. "es"
  subtitleProfileId String?
  label             String   @default("OBS Overlay")
  createdAt         DateTime @default(now())
  lastUsedAt        DateTime?
  revokedAt         DateTime?

  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subtitleProfile   SubtitleProfile?  @relation(fields: [subtitleProfileId], references: [id], onDelete: SetNull)

  @@index([userId])
}

// ---------- Stream sessions (for analytics + audit) ----------
model StreamSession {
  id                String    @id @default(cuid())
  userId            String
  overlayTokenId    String?
  startedAt         DateTime  @default(now())
  endedAt           DateTime?
  sourceLanguage    String
  targetLanguage    String
  durationSec       Int?
  audioBytesIn      BigInt?
  charsTranslated   Int?
  deepgramReqCount  Int?
  deeplReqCount     Int?
  errorCount        Int?

  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])
}

// ---------- Audit log ----------
enum AuditAction {
  LOGIN
  LOGOUT
  KEY_CREATE
  KEY_REVOKE
  KEY_VIEW_LAST4
  OVERLAY_TOKEN_MINT
  OVERLAY_TOKEN_REVOKE
  PROFILE_UPDATE
  ACCOUNT_DELETE
  DATA_EXPORT
}

model AuditLog {
  id          String      @id @default(cuid())
  userId      String?
  action      AuditAction
  ipHash      String?     // SHA-256(IP + monthly salt) — not raw IP
  userAgent   String?
  metadata    Json?
  createdAt   DateTime    @default(now())

  user        User?       @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([action, createdAt])
}
```

---

## 6. Live pipeline — latency budget

Target: **≤ 1.2 s** from streamer's mouth to viewer's screen on a US-East / EU-West path.

| Hop | Budget | Notes |
|---|---|---|
| Mic capture → Opus encode | 20–40 ms | `MediaRecorder` with 100 ms timeslice; Opus @ 16 kHz mono |
| Browser → Ingest worker (WS) | 30–80 ms | Single TLS WebSocket, persistent |
| Worker → Deepgram WS | 20–60 ms | Worker pinned to `us-east` / `eu-west` region |
| Deepgram interim transcript | 150–300 ms | `interim_results=true`, `endpointing=300` |
| DeepL translation | 80–250 ms | `formality=default`, skip for interim if unchanged |
| Worker → Overlay WS broadcast | 20–80 ms | Fan-out via in-memory channel keyed by overlay token |
| Overlay render (RAF + fade) | 16–150 ms | configurable `fadeMs` |

**Optimizations:**
- Send Deepgram `interim_results` straight through, only call DeepL on punctuation/finalization or on debounced word-count thresholds (configurable, default: every 3 new words or 250 ms idle).
- DeepL response cache keyed by `sha256(sourceText + sourceLang + targetLang)` with 10-minute TTL — common filler phrases re-translate for free.
- Persistent HTTP/2 connection pool to `api.deepl.com`.
- Backpressure: if DeepL queue depth > 5, drop interim translations and only translate finals.

---

## 7. API surface

All routes return JSON; mutations require CSRF token (Auth.js double-submit) on browser flows, signed JWT on worker → web app calls.

### Public
| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/health` | liveness |
| `GET`  | `/overlay/[token]` | overlay HTML page (no auth, token-gated) |
| `GET`  | `/api/overlay/[token]/style` | returns the resolved `SubtitleProfile` JSON for the overlay |
| `WS`   | `wss://overlay.<app>/v1/overlay/[token]` | overlay subscribes to captions (worker domain) |

### Authed (Auth.js session cookie)
| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/api/me` | current user profile |
| `PATCH`  | `/api/me` | update name, locale, avatar |
| `DELETE` | `/api/me` | initiate account deletion (queued, 7-day grace) |
| `GET`    | `/api/me/export` | GDPR data export (JSON download) |
| `GET`    | `/api/keys` | list user's keys (id, provider, label, last4) — **never** plaintext |
| `POST`   | `/api/keys` | add a key `{ provider, label, secret }` |
| `DELETE` | `/api/keys/:id` | revoke |
| `GET`    | `/api/subtitle-profiles` | list |
| `POST`   | `/api/subtitle-profiles` | create |
| `PATCH`  | `/api/subtitle-profiles/:id` | update |
| `DELETE` | `/api/subtitle-profiles/:id` | delete |
| `GET`    | `/api/overlay-tokens` | list (returns hashes / last4 only) |
| `POST`   | `/api/overlay-tokens` | mint `{ sourceLang, targetLang, profileId, label }` → returns plaintext token **once** |
| `POST`   | `/api/overlay-tokens/:id/rotate` | rotate (invalidate old, return new) |
| `DELETE` | `/api/overlay-tokens/:id` | revoke |
| `POST`   | `/api/session/start` | returns a short-lived (5 min) JWT the browser uses to authenticate to the ingest worker. Payload: `{ userId, overlayTokenId, sourceLang, targetLang }` |

### Worker-internal (signed)
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/worker/session/heartbeat` | worker reports `StreamSession` metrics every 30 s |
| `POST` | `/api/worker/keys/fetch` | worker requests decrypted keys for a session JWT; web app re-validates JWT + emits `AuditLog` |

All worker endpoints require `Authorization: Bearer <HS256 JWT>` signed with `WORKER_SHARED_SECRET`, IP-allowlisted to worker egress IPs, and rate-limited.

---

## 8. Security (OWASP coverage)

We target **OWASP ASVS 4.0 Level 2** and address every category in the **OWASP Top 10 (2021)**.

### Authentication & Session (ASVS V2/V3, OWASP A07)
- Auth.js v5 with JWT session strategy disabled in favor of **database sessions** (revocable).
- OAuth only — no password storage. Twitch, Google, Discord providers with strict redirect URI allowlist.
- Account linking only by verified email match; otherwise creates a new account.
- Session cookie: `Secure`, `HttpOnly`, `SameSite=Lax`, `__Host-` prefix, 7-day rolling expiry, idle timeout 24 h.
- CSRF: Auth.js built-in double-submit token on all state-changing routes.
- Re-auth required (step-up) before key creation, key revocation, account deletion.

### Access Control (A01)
- Every Prisma query in authed routes is scoped via `where: { userId: session.user.id }` — enforced by a `lib/db-scope.ts` helper that wraps the Prisma client and **throws** on missing `userId` on user-owned tables.
- Object-level authorization is checked via row-level filters, never by client-supplied `userId`.
- Admin routes (future) gated by `User.role` + middleware.

### Cryptography & Secrets (A02)
- API keys (Deepgram, DeepL) encrypted at rest with **AES-256-GCM**. The data key is wrapped by an envelope key stored in **Vercel KMS** (or AWS KMS via Vercel Marketplace). `keyVersion` field tracks rotation.
- Encryption helpers in `lib/crypto.ts`; decryption only allowed on the server in worker-fetch path; never logged.
- TLS 1.2+ everywhere; HSTS `max-age=63072000; includeSubDomains; preload`.
- All secrets in Vercel Environment Variables (Encrypted); none in client bundle. CI validates via `dotenv-linter`.

### Injection (A03)
- Prisma parameterized queries — no raw SQL except a single audited `prisma.$queryRawTyped` for analytics.
- Zod validation on **every** request body, query, and param at the route boundary.
- React's default escaping covers XSS for rendered captions; we additionally sanitize subtitle CSS via an allow-list (font family, hex colors, numeric bounds — see §11).

### Insecure Design (A04)
- Threat model documented in `/docs/threat-model.md` (STRIDE per data flow).
- Rate limiting (Upstash Redis sliding window) on `/api/auth/*`, `/api/keys`, `/api/overlay-tokens`, overlay WS connect.
- Lockout after 10 failed step-up attempts in 15 min.

### Security Misconfiguration (A05)
- Strict CSP:
  - `default-src 'self'`
  - `script-src 'self' 'nonce-<random>'`
  - `style-src 'self' 'nonce-<random>'`
  - `img-src 'self' data: https://cdn.discordapp.com https://static-cdn.jtvnw.net https://lh3.googleusercontent.com`
  - `connect-src 'self' https://api.deepl.com wss://*.<worker-domain>`
  - `frame-ancestors 'self'` (overlay route relaxed to allow OBS / Meld; in practice OBS/Meld ignore CSP since they're not browsers in the embedding sense, but the header is set defensively)
  - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`
- `Permissions-Policy: microphone=(self), camera=()`
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-site`.
- `next.config.ts` `headers()` returns the matrix; reviewed in `lib/csp.ts`.

### Vulnerable Components (A06)
- `pnpm audit --prod` and Dependabot weekly. Renovate for minor bumps.
- Lockfile committed; `pnpm install --frozen-lockfile` in CI.
- SBOM generated on release via `cyclonedx-npm`.

### Identification & Auth Failures (A07) — covered above.

### Software & Data Integrity (A08)
- All deploys come from a GitHub Actions workflow with `id-token: write` for Vercel OIDC.
- Signed commits required on `main` (branch protection).
- Subresource Integrity hashes for any CDN-loaded asset (we self-host fonts).

### Logging & Monitoring (A09)
- Structured JSON logs via `console.log/error` → captured automatically by Vercel Logs (web) and the worker host's stdout (Fly.io / Render).
- `AuditLog` table for security-relevant events — queryable via Prisma Studio.
- Alerting: deferred. Add Vercel log drains to an external aggregator (Logflare, Better Stack, Axiom) when traffic warrants it. Until then, the audit table + Vercel's built-in log search are sufficient.
- Never log: API keys, JWTs, raw IPs (we store SHA-256(IP || monthly-salt) only), full transcript content.

### SSRF (A10)
- The worker calls only allow-listed hosts: `api.deepgram.com`, `api.deepl.com`, `api-free.deepl.com`. Outbound HTTP client wrapped to reject anything else.
- No user-supplied URLs are fetched server-side.

### Privacy / GDPR
- Data export endpoint (`/api/me/export`) → JSON zip of user record + keys metadata (no plaintext) + profiles + sessions + audit log.
- Account deletion: soft-delete (`deletedAt`) immediate, hard-delete after 7-day grace via cron job, cascades by Prisma `onDelete: Cascade` plus an explicit `worker.purgeUser(userId)` for cached items.
- Privacy policy linked in footer; cookie banner only for non-essential cookies (we use none in v1, so no banner required under GDPR — only the strictly necessary session cookie is set).

---

## 9. BYOK flow in detail

1. User navigates to `/dashboard/keys`.
2. Clicks **Add Deepgram key** → step-up re-auth (re-prompt OAuth or password-less email magic link if last auth > 5 min ago).
3. Pastes key into a one-time form; the form `POST`s to `/api/keys` over HTTPS.
4. Server validates the key by calling Deepgram's `/v1/projects` with the key (5 s timeout). If 401 → reject.
5. Server encrypts: `iv = randomBytes(12); ciphertext = aesGcm(envKey, iv, secret)`; stores `{ciphertext, iv, last4: secret.slice(-4), keyVersion}`.
6. Emits `AuditLog{action:KEY_CREATE}`.
7. Plaintext key is never returned to the client and never logged.
8. At session start, the Next.js app emits a short-lived JWT to the streamer's browser. The browser opens a WS to the worker including the JWT.
9. Worker calls `/api/worker/keys/fetch` with the JWT; web app validates, decrypts, returns the two secrets in the response body over TLS to the worker only. The worker holds them in memory for the duration of the session and zeroes the buffer on close.

---

## 10. Subtitle customization — what's safe to expose

Allowed font families (self-hosted via `next/font/local`; CSP disallows external font CDNs):
`Inter, Roboto, Roboto Mono, Noto Sans, Noto Sans JP, Noto Sans KR, Open Sans, Montserrat, Source Sans 3, Atkinson Hyperlegible, JetBrains Mono`.

Per-field server-side validation (Zod):
- `fontFamily ∈ allowlist`
- `fontWeight ∈ [100, 900]`
- `fontSizePx ∈ [12, 160]`
- `lineHeight ∈ [0.8, 3.0]`
- Colors match `/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/`
- `textShadow` matches `/^(\-?\d+px ){2}\d+px #[0-9a-fA-F]{6,8}( , .{0,80})?$/` (max 2 layers)
- All px values are integers ≤ 200
- `position ∈ {top, center, bottom}`

The overlay page renders styles via React inline `style={{}}` — **never** `dangerouslySetInnerHTML`, **never** a free-form `style` string from the DB. We pick fields and rebuild the style object on the server.

---

## 11. Internationalization

- `next-intl` with App Router `[locale]` segment.
- Initial UI locales: **en, es, de, fr, ja, pt-BR, ko**.
- Locale resolution order: explicit URL `[locale]` → `User.locale` (if logged in) → `Accept-Language` → `en`.
- Translation source files in `/messages/<locale>.json`; English is the source of truth; CI fails on missing keys.
- Right-to-left ready (`dir="rtl"`) — we don't ship Arabic/Hebrew in v1 but layout doesn't hard-code LTR margins.
- Translation **targets** (the language pairs you can broadcast in) come from DeepL's supported list (about 30 languages) and is fetched at build time into `/lib/deepl-languages.ts` — no runtime dependency on DeepL just to render the picker.

---

## 12. OBS / Meld Studio integration

**Browser Source URL format:** `https://app.<domain>/overlay/<token>?lang=es`

Properties OBS users set:
- Width: 1920, Height: 1080 (or stream resolution)
- Custom CSS: empty (we ship the right styles)
- "Shutdown source when not visible": **off** (keeps WS alive)
- "Refresh browser when scene becomes active": **off**

The overlay page:
- Reads `token` from the URL, fetches `/api/overlay/[token]/style`.
- Opens WS to `wss://overlay.<worker>/v1/overlay/<token>` — server validates token hash before accepting.
- Renders captions in a transparent body (`background: transparent !important`).
- Provides `?debug=1` query param to show a connection status badge (only renders when the URL has that flag).
- Handles backoff reconnects with exponential jitter (max 30 s).

**Meld Studio** uses the same Browser Source mechanism — no Meld-specific code needed, but we test with it in our QA checklist.

---

## 13. Milestones

| # | Milestone | Duration | Exit criteria |
|---|---|---|---|
| M0 | Project scaffold | 2 d | Next.js 15, Prisma, Auth.js, Tailwind, CI green, Vercel preview deploy |
| M1 | Auth + account CRUD | 4 d | Twitch/Google/Discord login, profile edit, soft delete, audit logging |
| M2 | BYOK | 3 d | Encrypted key storage, list/add/revoke UI, server-side key validation |
| M3 | Subtitle profiles + overlay builder UI | 4 d | Create/edit profile, live preview, persisted to DB |
| M4 | Audio ingest worker (Deepgram only) | 5 d | Browser → worker → Deepgram → overlay; English-to-English path works end-to-end |
| M5 | Translation (DeepL) | 3 d | Source-to-target translation in pipeline; latency budget met on staging |
| M6 | OBS / Meld testing + polish | 3 d | Verified in both, transparency works, reconnects work |
| M7 | i18n + a11y pass | 3 d | 7 locales shipped, Lighthouse a11y ≥ 95, Axe clean |
| M8 | Security hardening + pen test | 4 d | OWASP ASVS L2 checklist green, headers verified via `securityheaders.com` A+ |
| M9 | Launch | 1 d | Production env, status page, runbook |

Total: ~32 working days for a small team.

---

## 14. Operational notes

- **Cost guardrails:** Deepgram and DeepL bills are on the **streamer**, not us — but we still rate-limit our own infra to prevent a runaway loop racking up their bill. Per-user cap: 200 sessions/day, 8 h longest single session.
- **Status page:** `status.<domain>` powered by BetterStack or self-hosted Uptime Kuma.
- **Backups:** Prisma Data Platform daily snapshots, retained 14 days.
- **Disaster recovery RTO 4 h / RPO 24 h** for v1; can tighten later.

---

## 15. Open questions / future work

- Per-viewer language selection (different product surface — a public landing for each stream).
- Stripe billing for a hosted-key tier (we hold keys, users pay us).
- Glossary / brand-term editor (DeepL glossaries).
- Twitch chat command integration (`!translate spanish`).
- VOD subtitle export (SRT/VTT) from past `StreamSession` transcripts (would need transcript storage, which we deliberately avoid in v1 for privacy).
