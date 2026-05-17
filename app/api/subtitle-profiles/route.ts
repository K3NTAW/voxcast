import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { subtitleProfileSchema } from "@/lib/zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const profiles = await prisma.subtitleProfile.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return Response.json({ profiles });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = subtitleProfileSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.errors[0]?.message ?? "invalid" }, { status: 400 });
  }
  const data = parsed.data;
  if (data.isDefault) {
    // Ensure single default
    await prisma.subtitleProfile.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }
  try {
    const profile = await prisma.subtitleProfile.create({
      data: { userId: session.user.id, ...data },
    });
    await audit({ userId: session.user.id, action: "PROFILE_UPDATE", request: req, metadata: { id: profile.id } });
    return Response.json({ profile }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return Response.json({ error: "Name already taken." }, { status: 409 });
    throw e;
  }
}
