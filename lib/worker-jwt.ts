// Short-lived JWTs the streamer's browser carries to the audio worker.
// Worker calls back to /api/worker/keys/fetch with this token to fetch decrypted keys.

import { SignJWT, jwtVerify } from "jose";

const enc = new TextEncoder();

function getSecret() {
  const s = process.env.WORKER_SHARED_SECRET;
  if (!s || s.startsWith("CHANGE_ME")) {
    throw new Error(
      "WORKER_SHARED_SECRET missing. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }
  return enc.encode(s);
}

export interface WorkerSessionClaims {
  uid: string;
  oid: string; // overlayTokenId (DB id)
  oh: string;  // overlay token hash (sha256 of plaintext) — channel key
  src: string;
  tgt: string;
}

export async function signSessionJwt(claims: WorkerSessionClaims) {
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .setIssuer("voxcast-web")
    .setAudience("voxcast-worker")
    .sign(getSecret());
}

export async function verifySessionJwt(token: string): Promise<WorkerSessionClaims> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "voxcast-web",
    audience: "voxcast-worker",
  });
  return {
    uid: String(payload.uid),
    oid: String(payload.oid),
    oh: String(payload.oh),
    src: String(payload.src),
    tgt: String(payload.tgt),
  };
}
