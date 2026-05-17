import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { profileUpdateSchema } from "@/lib/zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, image: true, locale: true, theme: true, createdAt: true },
  });
  return Response.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, locale: true, theme: true },
  });
  await audit({ userId: session.user.id, action: "PROFILE_UPDATE", request: req, metadata: parsed.data });
  return Response.json({ user });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  await prisma.user.update({ where: { id: session.user.id }, data: { deletedAt: new Date() } });
  await audit({ userId: session.user.id, action: "ACCOUNT_DELETE", request: req });
  return Response.json({ ok: true });
}
