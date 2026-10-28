import type { Prisma } from "@/generated/prisma/client";
import { oauthGuideSchema, type OAuthGuide } from "@/lib/guide-schema";
import { getPrisma } from "@/lib/db";
import { seedGuides } from "@/lib/seed-guides";

export function findSeedGuide(slug: string) {
  return seedGuides.find((guide) => guide.slug === slug) ?? null;
}

function parseStoredGuide(content: unknown): OAuthGuide {
  const previousVersionDefaults = {
    registrationAvailability: "not_assessed" as const,
    registrationEvidence: "This saved guide predates OAuth registration-path assessment.",
  };
  return oauthGuideSchema.parse({
    ...previousVersionDefaults,
    ...(content && typeof content === "object" ? content : {}),
  });
}

export async function findGuide(slug: string): Promise<OAuthGuide | null> {
  const seed = findSeedGuide(slug);
  if (!process.env.DATABASE_URL) return seed;
  try {
    const record = await getPrisma().oAuthGuide.findUnique({ where: { slug }, select: { content: true } });
    return record ? parseStoredGuide(record.content) : seed;
  } catch (error) {
    if (seed) return seed;
    throw error;
  }
}

export async function searchGuides(query: string) {
  const normalized = query.trim();
  const localMatches = seedGuides.filter((guide) =>
    `${guide.appName} ${guide.appDomain}`.toLowerCase().includes(normalized.toLowerCase()),
  );
  if (!process.env.DATABASE_URL || !normalized) return localMatches;

  const matches = await getPrisma().oAuthGuide.findMany({
    where: {
      OR: [
        { appName: { contains: normalized, mode: "insensitive" } },
        { appDomain: { contains: normalized, mode: "insensitive" } },
      ],
    },
    select: { content: true },
    take: 12,
  });
  const guidesBySlug = new Map(localMatches.map((guide) => [guide.slug, guide]));
  for (const record of matches) {
    const guide = parseStoredGuide(record.content);
    guidesBySlug.set(guide.slug, guide);
  }
  return [...guidesBySlug.values()];
}

export async function saveGuide(guide: OAuthGuide) {
  await getPrisma().oAuthGuide.create({
    data: {
      slug: guide.slug,
      appName: guide.appName,
      appDomain: guide.appDomain,
      origin: guide.origin,
      content: guide as unknown as Prisma.InputJsonValue,
      checkedAt: new Date(guide.checkedAt),
    },
  });
}

export async function getGuideContext(slug: string) {
  return findGuide(slug);
}
