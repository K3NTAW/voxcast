// Verifies the short-lived JWT the streamer's browser carries.

import { jwtVerify } from "jose";

const enc = new TextEncoder();

function secret() {
  const s = process.env.WORKER_SHARED_SECRET;
  if (!s) throw new Error("WORKER_SHARED_SECRET missing");
  return enc.encode(s);
}

export interface SessionClaims {
  uid: string;
  oid: string;
  oh: string;
  src: string;
  tgt: string;
}

export async function verifyJwt(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, secret(), {
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
