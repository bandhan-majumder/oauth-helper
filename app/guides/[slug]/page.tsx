import { notFound } from "next/navigation";
import DocsWorkspace from "@/components/docs-workspace";
import { findGuide, listGeneratedGuides } from "@/lib/guides";
import { seedGuides } from "@/lib/seed-guides";

export const instant = false;

export default async function OAuthGuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const [guide, savedGeneratedGuides] = await Promise.all([findGuide(slug), listGeneratedGuides()]);
  if (!guide) notFound();
  return <DocsWorkspace featuredGuides={seedGuides} savedGeneratedGuides={savedGeneratedGuides} activeGuide={guide} />;
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = await findGuide(slug);
  return guide
    ? { title: `${guide.appName} OAuth setup guide | OAuth Buddy`, description: guide.summary }
    : { title: "OAuth guide not found | OAuth Buddy" };
}
