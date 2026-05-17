-- Voxcast — initial migration (matches prisma/schema.prisma).
-- Generated manually because the sandbox can't reach binaries.prisma.sh.
-- On your machine, you can regenerate with: pnpm db:migrate

-- CreateEnum
CREATE TYPE "ApiProvider" AS ENUM ('DEEPGRAM', 'DEEPL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
  'LOGIN', 'LOGOUT', 'KEY_CREATE', 'KEY_REVOKE', 'KEY_VIEW_LAST4',
  'OVERLAY_TOKEN_MINT', 'OVERLAY_TOKEN_REVOKE', 'PROFILE_UPDATE',
  'ACCOUNT_DELETE', 'DATA_EXPORT', 'WORKER_KEY_FETCH'
);

-- CreateTable: User
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "name" TEXT,
  "image" TEXT,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "theme" TEXT NOT NULL DEFAULT 'dark',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "lastAuthAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateTable: Account
CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Session
CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: VerificationToken
CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateTable: ApiKey
CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "ApiProvider" NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Default',
  "ciphertext" BYTEA NOT NULL,
  "iv" BYTEA NOT NULL,
  "keyVersion" INTEGER NOT NULL DEFAULT 1,
  "last4" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApiKey_userId_provider_label_key" ON "ApiKey"("userId", "provider", "label");
CREATE INDEX "ApiKey_userId_provider_idx" ON "ApiKey"("userId", "provider");
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SubtitleProfile
CREATE TABLE "SubtitleProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
  "fontWeight" INTEGER NOT NULL DEFAULT 700,
  "fontSizePx" INTEGER NOT NULL DEFAULT 48,
  "lineHeight" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
  "letterSpacingEm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "textColor" TEXT NOT NULL DEFAULT '#FFFFFF',
  "textStrokeColor" TEXT NOT NULL DEFAULT '#000000',
  "textStrokePx" INTEGER NOT NULL DEFAULT 4,
  "textShadow" TEXT,
  "textAlign" TEXT NOT NULL DEFAULT 'center',
  "textCase" TEXT NOT NULL DEFAULT 'none',
  "bgMode" TEXT NOT NULL DEFAULT 'solid',
  "bgColor" TEXT NOT NULL DEFAULT '#000000A6',
  "bgPaddingX" INTEGER NOT NULL DEFAULT 24,
  "bgPaddingY" INTEGER NOT NULL DEFAULT 12,
  "bgRadiusPx" INTEGER NOT NULL DEFAULT 12,
  "bgBlurPx" INTEGER NOT NULL DEFAULT 0,
  "position" TEXT NOT NULL DEFAULT 'bottom',
  "maxWidthPct" INTEGER NOT NULL DEFAULT 80,
  "marginPx" INTEGER NOT NULL DEFAULT 48,
  "fadeMs" INTEGER NOT NULL DEFAULT 150,
  "holdMs" INTEGER NOT NULL DEFAULT 1500,
  "maxLines" INTEGER NOT NULL DEFAULT 2,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubtitleProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SubtitleProfile_userId_name_key" ON "SubtitleProfile"("userId", "name");
CREATE INDEX "SubtitleProfile_userId_isDefault_idx" ON "SubtitleProfile"("userId", "isDefault");
ALTER TABLE "SubtitleProfile" ADD CONSTRAINT "SubtitleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: OverlayToken
CREATE TABLE "OverlayToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "sourceLanguage" TEXT NOT NULL,
  "targetLanguage" TEXT NOT NULL,
  "subtitleProfileId" TEXT,
  "label" TEXT NOT NULL DEFAULT 'OBS Overlay',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "OverlayToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OverlayToken_tokenHash_key" ON "OverlayToken"("tokenHash");
CREATE INDEX "OverlayToken_userId_idx" ON "OverlayToken"("userId");
ALTER TABLE "OverlayToken" ADD CONSTRAINT "OverlayToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OverlayToken" ADD CONSTRAINT "OverlayToken_subtitleProfileId_fkey" FOREIGN KEY ("subtitleProfileId") REFERENCES "SubtitleProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: StreamSession
CREATE TABLE "StreamSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "overlayTokenId" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "sourceLanguage" TEXT NOT NULL,
  "targetLanguage" TEXT NOT NULL,
  "durationSec" INTEGER,
  "audioBytesIn" BIGINT,
  "charsTranslated" INTEGER,
  "deepgramReqCount" INTEGER,
  "deeplReqCount" INTEGER,
  "errorCount" INTEGER,
  CONSTRAINT "StreamSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StreamSession_userId_startedAt_idx" ON "StreamSession"("userId", "startedAt");
ALTER TABLE "StreamSession" ADD CONSTRAINT "StreamSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: AuditLog
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" "AuditAction" NOT NULL,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
