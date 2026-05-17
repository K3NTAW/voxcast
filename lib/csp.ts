// Security headers (PLANNING.md §8). Overlay route relaxes frame-ancestors elsewhere.

export function buildSecurityHeaders() {
  const workerWs = process.env.NEXT_PUBLIC_WORKER_WS_URL ?? "ws://localhost:8787";
  const workerHttp = process.env.NEXT_PUBLIC_WORKER_HTTP_URL ?? "http://localhost:8787";
  const csp = [
    "default-src 'self'",
    // Next.js needs 'unsafe-inline' for inline scripts during dev; in prod, use nonces.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.discordapp.com https://static-cdn.jtvnw.net https://lh3.googleusercontent.com",
    "font-src 'self' data:",
    `connect-src 'self' https://api.deepl.com https://api-free.deepl.com ${workerHttp} ${workerWs} ws: wss:`,
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
  ];
}
