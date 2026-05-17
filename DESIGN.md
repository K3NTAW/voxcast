# Live Stream Translation — DESIGN.md

> Implementation-ready design brief intended to be fed to **Claude design** (or any UI agent) to produce the marketing site, dashboard, overlay builder, and OBS overlay. Pairs with `PLANNING.md`.

---

## 1. Product personality

**One-line:** A confident, broadcast-ready tool. Streamers should feel like they grabbed a piece of pro gear, not a SaaS dashboard.

**Voice & tone**
- Direct. Imperative verbs. No marketing fluff.
- Confident, never hype-y. "Sub-second translation" not "blazing-fast AI translation."
- Friendly in errors. "We couldn't reach Deepgram with that key — double-check it and try again."

**Audiences**
1. **Solo streamers** on Twitch/YouTube who want EN→ES, EN→JA, etc. — primary.
2. **Multilingual creators** (e.g. a Japanese VTuber broadcasting to English-speaking fans).
3. **Esports / event ops** running OBS rigs for tournaments.

**Visual mood**
- Late-night production booth: deep neutrals, a single saturated accent, neon-adjacent highlights only on live indicators.
- Think Linear × Twitch dark theme × a touch of Vercel.

---

## 2. Brand & design tokens

### Color (semantic names; map to Tailwind v4 `@theme`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#FAFAFA` | `#0B0B0E` | App background |
| `--color-surface` | `#FFFFFF` | `#15151B` | Cards, panels |
| `--color-surface-elevated` | `#FFFFFF` | `#1C1C24` | Modals, popovers |
| `--color-border` | `#E5E7EB` | `#2A2A33` | Hairlines |
| `--color-border-strong` | `#D1D5DB` | `#3A3A45` | Inputs |
| `--color-text` | `#0B0B0E` | `#F5F5F7` | Body |
| `--color-text-muted` | `#52525B` | `#A1A1AA` | Captions, helper text |
| `--color-text-faint` | `#71717A` | `#71717A` | Disabled |
| `--color-accent` | `#7C5CFF` | `#9B85FF` | Primary brand (electric violet) |
| `--color-accent-contrast` | `#FFFFFF` | `#0B0B0E` | Text on accent |
| `--color-live` | `#FF3B6B` | `#FF4D78` | Live indicator dot, recording |
| `--color-success` | `#22C55E` | `#34D399` | Connected, validated |
| `--color-warning` | `#F59E0B` | `#FBBF24` | Rate-limit, partial |
| `--color-danger` | `#EF4444` | `#F87171` | Errors, destructive |
| `--color-overlay-scrim` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.6)` | Modal scrim |

Default theme = **dark**. Toggle persists per user (`User.locale` already exists; add `User.theme` if needed, or store client-side).

### Typography

- **UI:** `Inter` (variable) — weights 400 / 500 / 600 / 700.
- **Display (marketing hero only):** `Inter` 700 with `font-feature-settings: "ss01", "cv11"` for slightly more character.
- **Mono (keys, tokens):** `JetBrains Mono` 500.
- All fonts self-hosted via `next/font/local`. No Google Fonts CDN (CSP).

Type scale (8-pt grid friendly):

| Token | Size / line-height | Use |
|---|---|---|
| `text-display` | 56 / 60 | Marketing hero |
| `text-h1` | 36 / 40 | Page titles |
| `text-h2` | 28 / 32 | Section titles |
| `text-h3` | 20 / 28 | Card titles |
| `text-body` | 15 / 22 | Body |
| `text-sm` | 13 / 18 | Helper, table cells |
| `text-xs` | 12 / 16 | Tags, badges |

### Spacing & radius

- Base unit **4 px**. Tailwind defaults are fine; prefer 2, 3, 4, 6, 8, 12, 16, 24.
- Radii: `--radius-sm: 6px`, `--radius: 10px`, `--radius-lg: 14px`, `--radius-pill: 999px`.
- Shadows (dark theme): use single, soft shadow `0 1px 0 rgba(255,255,255,.04) inset, 0 8px 24px rgba(0,0,0,.4)` for elevated surfaces. Avoid stacking.

### Motion

- Default duration **120 ms**, easing `cubic-bezier(.2,.8,.2,1)`.
- Caption fade default 150 ms (configurable per `SubtitleProfile`).
- Live-dot pulse: 1.4 s ease-in-out infinite, opacity 0.6 ↔ 1.
- Respect `prefers-reduced-motion`: disable pulses, snap transitions to 0 ms.

---

## 3. Layout system

- **App shell:** left sidebar (240 px) + top bar (56 px) + content (max-w 1200, centered, 32 px gutters).
- **Sidebar collapses** to 64 px on `<lg` screens, slide-over on `<md`.
- **Marketing pages:** 1120 px max content width, centered.
- **Overlay builder & live preview** use a 2-column split (controls left 360 px, preview canvas fills rest, 16:9 aspect).

Breakpoints (Tailwind defaults): `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.

---

## 4. Components (`/components`)

Build on **shadcn/ui** primitives where possible. Listed below; each maps to a file.

### Primitives
- `Button` — variants: `primary`, `secondary`, `ghost`, `destructive`, `link`; sizes `sm | md | lg`; loading state with inline spinner.
- `Input`, `Textarea`, `Select`, `Combobox`, `Switch`, `Slider`, `ColorInput` (hex + alpha + eyedropper using `EyeDropper API` where supported), `NumberInput` (with step controls).
- `Tabs`, `Accordion`, `Tooltip`, `DropdownMenu`, `Dialog`, `Sheet` (mobile drawer), `Toast`.
- `Badge` — variants `neutral | accent | live | success | warning | danger`. Live variant includes the pulsing dot.
- `Card`, `Separator`, `EmptyState` (icon + title + body + CTA).
- `CodeBlock` — mono, copy-to-clipboard, used for overlay URLs.
- `Skeleton` — 6 px radius, shimmering placeholder.

### App-specific
- `LiveIndicator` — animated dot + "LIVE" / "OFFLINE" label, BCP-47 language pill next to it.
- `LatencyMeter` — small bar graph showing 50p / 95p latency over the last 60 s.
- `LanguagePicker` — combobox with flag-free design (flags are political); shows BCP-47 tag + native name + English name (e.g. `es · Español · Spanish`).
- `KeyCard` — provider icon + label + last4 + last-used timestamp + revoke button.
- `SubtitlePreview` — renders a caption with the current style applied; controllable via props.
- `OverlayBuilderCanvas` — 16:9 preview area with a fake "stream" background (user-uploadable PNG/JPG for realism), draggable safe-area guides.
- `StyleEditor` — sectioned form (Typography / Background / Layout / Behavior), bound to `SubtitleProfile`.
- `OauthProviderButton` — Twitch / Google / Discord buttons with provider icon, brand color edge, neutral fill (we don't dump brand color all over our UI).
- `RateLimitToast` — orange, sticky, with retry-after countdown.
- `SessionTimeline` — chronological list of past `StreamSession`s with duration, chars translated, error count.

### Iconography
- **Lucide React** only. Stroke width 1.75.
- Custom: Deepgram and DeepL wordmark SVGs (with permission as third-party identifiers, used only on the BYOK page).

---

## 5. Pages & routes

Every page below maps 1:1 to a route in PLANNING.md §4.

### Marketing
- `/` — Landing
- `/docs/obs-setup` — OBS setup guide
- `/docs/meld-setup` — Meld Studio setup
- `/privacy`, `/terms`, `/security`

### Auth
- `/login` — Three big OAuth buttons stacked, one paragraph of trust copy
- `/onboarding` — 3-step: pick locale → add Deepgram key → add DeepL key

### App (authed)
- `/dashboard` — Overview
- `/dashboard/overlay-builder` — primary workspace
- `/dashboard/profiles` — list of `SubtitleProfile`s
- `/dashboard/keys` — BYOK
- `/dashboard/tokens` — Overlay tokens
- `/dashboard/sessions` — past sessions / metrics
- `/dashboard/settings` — profile, locale, theme, danger zone (export, delete)

### Public
- `/overlay/[token]` — the OBS browser source

---

## 6. Wireframes (page-by-page)

> Frames described in words so an AI design tool can render them. Dimensions assume 1440 px viewport.

### 6.1 Landing (`/`)

```
┌────────────────────────────────────────────────────────────────────┐
│  ▣ Logo                    Docs   Pricing   Sign in   [Get started]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│        Real-time translation for live streams.                     │
│        Bring your own Deepgram + DeepL keys. Drop the              │
│        browser source into OBS. Done.                              │
│                                                                    │
│        [Start free]   [See it in OBS →]                            │
│                                                                    │
│   ────── animated mock OBS preview, 16:9, dark background ──────   │
│   [video tile placeholder]   ░░ caption fades in: "Hola, equipo." ░│
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  Three feature cards (3-col):                                      │
│   ◆ Sub-second latency      ◆ Your keys, your bills    ◆ OWASP-    │
│   Deepgram + DeepL pipeline   We never charge per minute  hardened │
├────────────────────────────────────────────────────────────────────┤
│  "How it works" — 4 numbered steps, horizontal scroll on mobile    │
│   1. Sign in   2. Add keys   3. Pick languages   4. Drop in OBS    │
├────────────────────────────────────────────────────────────────────┤
│  Logos row: "Works with" — OBS Studio, Meld Studio, Streamlabs     │
├────────────────────────────────────────────────────────────────────┤
│  Final CTA banner + footer (Privacy / Terms / Security / Status)   │
└────────────────────────────────────────────────────────────────────┘
```

Hero copy uses `text-display`. Background is a subtle radial gradient from `--color-accent` at 8% opacity in the top-right to transparent.

### 6.2 Login (`/login`)

Centered card, 400 px wide.
```
┌──────────────────────────────────┐
│  ▣ Logo                          │
│                                  │
│  Sign in to your stream booth    │
│                                  │
│  [ ⌬  Continue with Twitch  ]    │
│  [ G  Continue with Google  ]    │
│  [ ⊜  Continue with Discord ]    │
│                                  │
│  We use OAuth — we never see     │
│  your provider password.         │
│                                  │
│  Privacy · Terms                 │
└──────────────────────────────────┘
```

### 6.3 Onboarding (`/onboarding`)

Stepper with 3 steps. Step 2/3 show the API key input plus a one-paragraph "where do I get this?" with an external link icon.

### 6.4 Dashboard overview (`/dashboard`)

```
┌──── Sidebar ────┬──────────────── Top bar ────────────────────────┐
│ ▣ App           │  Dashboard                  ◯ Avatar ▾          │
│                 ├──────────────────────────────────────────────────┤
│ ◆ Overview      │                                                  │
│ ◇ Overlay       │   ┌─ Quick start ─────────────────────────────┐  │
│ ◇ Profiles      │   │  ◉ LIVE READY                              │  │
│ ◇ Keys          │   │  Source: English (en-US)  →  Target: es    │  │
│ ◇ Tokens        │   │  Profile: Default                          │  │
│ ◇ Sessions      │   │  [Open builder]   [Copy overlay URL]       │  │
│ ◇ Settings      │   └────────────────────────────────────────────┘  │
│                 │                                                  │
│                 │   ┌─ Recent sessions ────────────┐  ┌─ Keys ──┐  │
│                 │   │  16 May · 1h 23m · es        │  │ ●●●●AB12│  │
│                 │   │  15 May · 42m   · ja         │  │ Deepgram│  │
│                 │   │  14 May · 2h 10m · pt-BR     │  │         │  │
│                 │   └───────────────────────────────┘  │ ●●●●XK90│  │
│                 │                                      │ DeepL   │  │
│                 │                                      └─────────┘  │
└─────────────────┴──────────────────────────────────────────────────┘
```

### 6.5 Overlay builder (`/dashboard/overlay-builder`)

Two-column split. **Left 360 px** is `StyleEditor` (tabs: Typography / Background / Layout / Behavior). **Right** is the live preview canvas with a sample frame.

Top of canvas: language selector pair (`source ▾  →  target ▾`), `LiveIndicator`, `LatencyMeter`. Right side: `[Start session]` button → on click, browser asks for mic permission, opens WS, badge flips to LIVE.

Bottom of canvas: "Browser source URL" code block with copy button + a small "Rotate token" link.

The preview always shows two scrolling sample captions (cycling phrases like "Welcome back to the stream." / "Bienvenidos de nuevo al directo.") so styling changes are visible in real time even before going LIVE.

### 6.6 Profiles list (`/dashboard/profiles`)

A grid of `SubtitlePreview` cards. Each card shows the caption rendered with that profile's style on a mini 16:9 mock background. Hover reveals: `Edit` / `Duplicate` / `Set default` / `Delete`. Top-right `[New profile]`.

### 6.7 Keys (`/dashboard/keys`)

Two `KeyCard`s (Deepgram, DeepL) per provider — or empty-state CTAs if missing. Top-right `[Add key ▾]` menu.

Adding a key opens a `Dialog`. Step-up auth banner appears at top if the session is older than 5 min.

### 6.8 Tokens (`/dashboard/tokens`)

Table:
| Label | Source → Target | Profile | Created | Last used | Actions |
|---|---|---|---|---|---|

Actions: copy URL (only if just-minted token plaintext is still in memory), rotate, revoke.

### 6.9 Sessions (`/dashboard/sessions`)

`SessionTimeline` + filters (date range, target language). Click a row → drawer with per-session metrics (latency 50p/95p, error count, bytes).

### 6.10 Settings (`/dashboard/settings`)

Form sections:
1. Profile (name, avatar, locale)
2. Appearance (theme: system / light / dark)
3. Data (export JSON, delete account — opens 2-step confirm)

### 6.11 OBS overlay (`/overlay/[token]`)

```
(transparent background)
                                        
                                        
                                        
                                        
                                        
                                        
                                        
                                        
                                        
          ╔═════════════════════════╗   
          ║  Hola, ¿qué tal?         ║   ← caption box, position from profile
          ╚═════════════════════════╝   
                                        
```

- The entire `<body>` and `<html>` have `background: transparent`.
- No scrollbars, no chrome, no fonts loaded except the one in the profile.
- Captions enter with the configured `fadeMs`, stay for `holdMs` after the next caption replaces them, then exit.
- A connection status badge renders **only** when `?debug=1`.

---

## 7. Subtitle style controls (UX detail)

The `StyleEditor` panel is the highest-value piece of UX. Specifics:

**Typography tab**
- Font family: dropdown of the 11 self-hosted fonts (DESIGN.md §2, PLANNING.md §10), each rendered in its own face.
- Weight: segmented control 400 / 500 / 600 / 700 / 800.
- Size: slider 16 → 120 px + numeric input.
- Line height: slider 0.8 → 2.0.
- Letter spacing: slider −0.05 → 0.2 em.
- Text color: `ColorInput` (hex + alpha).
- Stroke color + width: same color input + slider 0 → 12 px.
- Shadow: toggle on/off; if on, X/Y/blur sliders + color.
- Align: segmented `⇤ ⇔ ⇥`.
- Case: segmented `Aa / AA / aa`.

**Background tab**
- Mode: segmented `Transparent / Solid / Gradient / Blur`. Switches reveal relevant controls.
- Color: alpha-aware color input.
- Padding X/Y: paired sliders, 0 → 80 px.
- Radius: slider 0 → 32 px.
- Blur (when Mode=Blur): 0 → 24 px. **Note:** `backdrop-filter` does not work in OBS's CEF in older versions; we warn the user with a small `⚠ OBS 30.0+ required for blur` helper.

**Layout tab**
- Position: segmented Top / Center / Bottom.
- Max width: slider 30 → 100 %.
- Outer margin: slider 0 → 200 px.
- Safe-area toggle: overlays 16:9 TV-safe and 9:16 mobile-safe guides on the preview.

**Behavior tab**
- Fade in/out: slider 0 → 500 ms.
- Hold: slider 0 → 4000 ms.
- Max lines: 1 / 2 / 3.
- Live-mode mock: 3 sample phrases the preview rotates through.

All edits are debounced 250 ms then PATCHed to `/api/subtitle-profiles/:id`. A small `Saved · just now` indicator confirms in the top bar.

---

## 8. Accessibility

Target **WCAG 2.2 AA** plus a few AAA items.

- Color contrast: every text/background pairing in the design tokens table verified at ≥ 4.5:1 (≥ 7:1 for body text in the default theme, AAA).
- Keyboard navigation: every interactive element reachable; visible focus ring (`outline: 2px solid var(--color-accent); outline-offset: 2px`).
- Focus management: dialogs trap focus, restore on close.
- Screen reader: every icon-only button has `aria-label`. Live indicator uses `aria-live="polite"` so a screen reader announces "Live" / "Offline" transitions but not every word of every caption (caption stream is too noisy).
- Forms: labels associated, errors announced via `aria-describedby`.
- Reduced motion: pulsing dot + caption fade reduced/disabled when `prefers-reduced-motion: reduce`.
- Atkinson Hyperlegible is in the font allow-list specifically as a dyslexia-friendly option for users who want it for their own subtitles.
- Run `@axe-core/playwright` in CI on every page.

---

## 9. Microcopy guide

| Situation | Copy |
|---|---|
| Empty keys state | "No keys yet. Add a Deepgram key to start transcribing, and a DeepL key to translate." |
| Key validation failed | "We couldn't reach Deepgram with that key. Double-check it and try again." |
| Session start, mic blocked | "Your browser is blocking microphone access. Open site settings and allow mic for this site." |
| Token rotated | "New token ready. Update the URL in OBS to keep your overlay working." |
| Account delete confirm | "Delete your account? We'll keep your data for 7 days in case you change your mind, then it's gone for good." |
| Live indicator | "LIVE · es" / "OFFLINE" |
| Connection lost (overlay debug) | "Reconnecting…" |

Tone rules: contractions yes; exclamation marks rarely; never "Oops!"; never "Awesome!".

---

## 10. OBS overlay HTML (reference)

```html
<!doctype html>
<html lang="en" data-theme="overlay">
  <head>
    <meta charset="utf-8" />
    <title>Overlay</title>
    <style>
      html, body {
        margin: 0; padding: 0; height: 100%;
        background: transparent !important;
        overflow: hidden;
        font-family: var(--font-family, "Inter"), system-ui, sans-serif;
      }
      .caption-stage {
        position: fixed; inset: 0;
        display: flex; align-items: var(--align-y, flex-end); justify-content: center;
        padding: var(--margin, 48px);
        pointer-events: none;
      }
      .caption {
        max-width: var(--max-width, 80%);
        padding: var(--pad-y, 12px) var(--pad-x, 24px);
        background: var(--bg, transparent);
        color: var(--text-color, #fff);
        border-radius: var(--radius, 12px);
        font-weight: var(--weight, 700);
        font-size: var(--size, 48px);
        line-height: var(--line-height, 1.2);
        letter-spacing: var(--letter-spacing, 0);
        text-align: var(--align, center);
        text-transform: var(--text-case, none);
        -webkit-text-stroke: var(--stroke-px, 4px) var(--stroke-color, #000);
        text-shadow: var(--text-shadow, none);
        backdrop-filter: blur(var(--bg-blur, 0px));
        transition: opacity var(--fade, 150ms) ease;
        opacity: 0;
      }
      .caption.in { opacity: 1; }
      @media (prefers-reduced-motion: reduce) {
        .caption { transition: none; }
      }
    </style>
  </head>
  <body>
    <div class="caption-stage">
      <div class="caption" id="caption" aria-live="off"></div>
    </div>
    <script type="module" src="/overlay/[token]/client.js"></script>
  </body>
</html>
```

The React/Next overlay page resolves all CSS variables server-side from the `SubtitleProfile` JSON, so the client script only swaps text content — never style.

---

## 11. Assets needed

For Claude design / a human designer to produce:

- Logo (mark + wordmark + monochrome variants)
- Favicon set (`favicon.svg`, 32, 192, 512, apple-touch)
- Open Graph image template `1200×630` (dark, with mark + tagline placeholder)
- 4–6 mock stream backgrounds for the overlay builder canvas (CC0 / our own)
- Provider icons for Twitch / Google / Discord (using their official brand assets per their guidelines)
- Empty-state illustrations: 4 scenes — `no-keys`, `no-profiles`, `no-tokens`, `no-sessions`. Style: flat, single-line, accent-color only.
- Marketing screenshots of the dashboard + an OBS scene with our overlay (composited).

---

## 12. Handoff checklist for Claude design

When prompting Claude design with this doc, also pass:
1. `PLANNING.md` (for routes, schema, security context — affects what each page must show).
2. Tailwind v4 token block (a `@theme { … }` snippet derived from §2 above — generate first, then design).
3. Target framework: **Next.js 15 App Router + Tailwind v4 + shadcn/ui**.
4. Output: one folder of `.tsx` page + component files matching the routes in §5, plus a `globals.css` containing the `@theme` block.

Recommended prompt skeleton:
> "Implement the following pages from DESIGN.md §6 using the design tokens in §2 and the components listed in §4. Use shadcn/ui where a primitive exists. Don't invent new colors or fonts. Match the wireframes; don't add extra sections. Use only Lucide icons."

---

## 13. Definition of done (UI)

A page is design-complete when:
- All states implemented: loading, empty, error, default, optimistic-mutation, and (where relevant) over-budget / rate-limited.
- Responsive at 360 / 768 / 1024 / 1440.
- Light + dark themes pass contrast checks.
- Axe clean, keyboard-traversable.
- Screenshots in the PR for both themes.
- Storybook (or `/dev/components`) entry exists for any new component.
