import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Receipt: Get paid the moment your work is approved",
  description:
    "AI-mediated freelance escrow. Your client deposits USDC. You deliver. The agent validates. Payment settles on Arc in under 500ms.",
  openGraph: {
    title: "Receipt",
    description: "Get paid the moment your work is approved.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
