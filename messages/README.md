# Messages

next-intl translations. `en.json` is the source of truth.

The remaining locale files (`es.json`, `ja.json`, …) currently mirror a subset of `en.json`. CI should compare keys and fail on missing keys in non-English files. Wire this in M7 of the PLANNING.md milestone plan.

To wire the full `[locale]` URL segment, add `next-intl` middleware (`middleware.ts`) and move pages under `app/[locale]/...`. The current implementation reads `User.locale` from the DB and exposes it via the Auth.js session callback (`lib/auth.ts`); when you add the URL segment, you'll resolve the locale in this order:

1. Explicit URL `[locale]`
2. `User.locale` if signed in
3. `Accept-Language` header
4. Fallback to `en`
