import { notFound } from "next/navigation";
import DocsWorkspace from "@/components/docs-workspace";
import { findGuide } from "@/lib/guides";
import { seedGuides } from "@/lib/seed-guides";

export const instant = false;

export default async function OAuthGuidePage({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = await findGuide(slug);
  if (!guide) notFound();
  return <DocsWorkspace featuredGuides={seedGuides} activeGuide={guide} />;
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  const guide = await findGuide(slug);
  return guide
    ? { title: `${guide.appName} OAuth setup guide | OAuthPath`, description: guide.summary }
    : { title: "OAuth guide not found | OAuthPath" };
}
