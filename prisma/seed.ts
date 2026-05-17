import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Idempotent: seeds a single dev user with one subtitle profile so the UI
  // has something to show on first boot.
  const dev = await prisma.user.upsert({
    where: { email: "dev@voxcast.local" },
    create: {
      email: "dev@voxcast.local",
      name: "Dev User",
      locale: "en",
      theme: "dark",
    },
    update: {},
  });

  await prisma.subtitleProfile.upsert({
    where: { userId_name: { userId: dev.id, name: "Default" } },
    create: {
      userId: dev.id,
      name: "Default",
      isDefault: true,
      fontFamily: "Inter",
      fontWeight: 700,
      fontSizePx: 48,
      textColor: "#FFFFFF",
      bgMode: "solid",
      bgColor: "#000000A6",
      bgPaddingX: 24,
      bgPaddingY: 12,
      bgRadiusPx: 12,
      position: "bottom",
      maxWidthPct: 80,
      marginPx: 48,
      fadeMs: 150,
      holdMs: 1500,
      maxLines: 2,
    },
    update: {},
  });

  console.log("Seeded dev user + default profile.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
