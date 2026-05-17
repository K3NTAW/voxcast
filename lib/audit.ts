import { prisma } from "./db";
import { hashIp } from "./crypto";

// String literal type rather than enum import — keeps lib/audit usable even
// before `prisma generate` has run.
export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "KEY_CREATE"
  | "KEY_REVOKE"
  | "KEY_VIEW_LAST4"
  | "OVERLAY_TOKEN_MINT"
  | "OVERLAY_TOKEN_REVOKE"
  | "PROFILE_UPDATE"
  | "ACCOUNT_DELETE"
  | "DATA_EXPORT"
  | "WORKER_KEY_FETCH";

export async function audit(opts: {
  userId?: string | null;
  action: AuditAction;
  request?: Request;
  metadata?: Record<string, unknown>;
}) {
  const ipHeader =
    opts.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    opts.request?.headers.get("x-real-ip") ??
    null;
  const ipHash = ipHeader ? hashIp(ipHeader) : null;
  const userAgent = opts.request?.headers.get("user-agent")?.slice(0, 512) ?? null;

  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        action: opts.action as any,
        ipHash,
        userAgent,
        metadata: opts.metadata ? (opts.metadata as object) : undefined,
      },
    });
  } catch (err) {
    console.error("audit failed", err);
  }
}
