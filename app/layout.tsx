import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OAuthPath — OAuth setup guides",
  description: "Evidence-backed OAuth app setup guides, approval paths, and next steps.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
