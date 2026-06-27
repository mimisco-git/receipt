import type { Metadata } from "next";
import "@/styles/globals.css";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Receipt: Get paid the moment your work is approved",
  description: "AI-mediated freelance escrow on Arc. Client deposits USDC or EURC. You deliver. Agent verifies. Payment clears in under 500ms.",
  icons: { icon: "/receipt-favicon.png", shortcut: "/receipt-favicon.png" },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/png" href="/receipt-favicon.png" />
        <link rel="apple-touch-icon" href="/receipt-logo.png" />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ flex: 1 }}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
