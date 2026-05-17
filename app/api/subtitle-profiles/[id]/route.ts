import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { subtitleProfileSchema } from "@/lib/zod";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const owned = await prisma.subtitleProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!owned) return Response.json({ error: "not_found" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const parsed = subtitleProfileSchema.partial().safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.errors[0]?.message ?? "invalid" }, { status: 400 });
  if (parsed.data.isDefault) {
    await prisma.subtitleProfile.updateMany({
      where: { userId: session.user.id, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }
  const profile = await prisma.subtitleProfile.update({
    where: { id },
    data: parsed.data,
  });
  await audit({ userId: session.user.id, action: "PROFILE_UPDATE", request: req, metadata: { id } });
  return Response.json({ profile });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;
  const owned = await prisma.subtitleProfile.findFirst({ where: { id, userId: session.user.id } });
  if (!owned) return Response.json({ error: "not_found" }, { status: 404 });
  await prisma.subtitleProfile.delete({ where: { id } });
  return Response.json({ ok: true });
}
