import DocsWorkspace from "@/components/docs-workspace";
import { seedGuides } from "@/lib/seed-guides";

export default function Home() {
  return <DocsWorkspace featuredGuides={seedGuides} />;
}
