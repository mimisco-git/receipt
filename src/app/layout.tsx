import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Receipt: Get paid the moment your work is approved",
  description: "AI-mediated freelance escrow on Arc. Client deposits USDC. You deliver. Agent verifies. Payment clears in under 500ms.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Receipt",
    description: "Get paid the moment your work is approved.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
