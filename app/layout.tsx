import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Docs workspace",
  description: "A clean documentation workspace with an AI assistant.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
