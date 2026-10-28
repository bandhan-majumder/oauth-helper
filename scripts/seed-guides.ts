import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { seedGuides } from "@/lib/seed-guides";

const prisma = getPrisma();

try {
  for (const guide of seedGuides) {
    await prisma.oAuthGuide.upsert({
      where: { slug: guide.slug },
      create: {
        slug: guide.slug,
        appName: guide.appName,
        appDomain: guide.appDomain,
        origin: "curated",
        content: guide as unknown as Prisma.InputJsonValue,
        checkedAt: new Date(guide.checkedAt),
      },
      update: {
        appName: guide.appName,
        appDomain: guide.appDomain,
        origin: "curated",
        content: guide as unknown as Prisma.InputJsonValue,
        checkedAt: new Date(guide.checkedAt),
      },
    });
  }

  console.log(`Seeded ${seedGuides.length} curated OAuth guides.`);
} finally {
  await prisma.$disconnect();
}
