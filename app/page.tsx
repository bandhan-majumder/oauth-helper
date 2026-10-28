import DocsWorkspace from "@/components/docs-workspace";
import { listGeneratedGuides } from "@/lib/guides";
import { seedGuides } from "@/lib/seed-guides";

export const instant = false;

export default async function Home() {
  const savedGeneratedGuides = await listGeneratedGuides();
  return <DocsWorkspace featuredGuides={seedGuides} savedGeneratedGuides={savedGeneratedGuides} />;
}
