import { NextRequest } from "next/server";
import { searchGuides } from "@/lib/guides";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  if (query.length < 2 || query.length > 200) {
    return Response.json({ error: "Search query must be between 2 and 200 characters." }, { status: 400 });
  }

  try {
    const guides = await searchGuides(query);
    return Response.json({ guides: guides.map(({ slug, appName, appDomain, summary, origin, difficulty }) => ({ slug, appName, appDomain, summary, origin, difficulty })) });
  } catch {
    return Response.json({ error: "The guide library is temporarily unavailable. Try again shortly." }, { status: 503 });
  }
}
