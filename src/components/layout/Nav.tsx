"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "My jobs",      href: "/worker-dashboard" },
  { label: "Profile",      href: "/profile" },
];

function ReceiptLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: 10 }}>
      <defs>
        <radialGradient id="nb" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#1A3D32"/>
          <stop offset="100%" stopColor="#061A14"/>
        </radialGradient>
        <radialGradient id="nr" cx="55%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#12E89A"/>
          <stop offset="60%" stopColor="#0A9E6A"/>
          <stop offset="100%" stopColor="#065A3C"/>
        </radialGradient>
        <linearGradient id="nrp" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#nb)"/>
      <rect width="100" height="100" rx="22" fill="none" stroke="rgba(18,232,154,0.4)" strokeWidth="1.5"/>
      <path d="M24 22 L24 78 L35 78 L35 57 L52 78 L65 78 L47 55 C56 52 62 45 62 35 C62 27 56 22 46 22 Z M35 32 L44 32 C49 32 52 35 52 39 C52 43 49 46 44 46 L35 46 Z"
        fill="url(#nr)"/>
      <rect x="26" y="48" width="22" height="28" rx="3" fill="url(#nrp)" opacity="0.7"/>
      <rect x="30" y="55" width="14" height="1.5" rx="1" fill="rgba(18,232,154,0.5)"/>
      <rect x="30" y="60" width="11" height="1.5" rx="1" fill="rgba(18,232,154,0.4)"/>
      <rect x="30" y="65" width="13" height="1.5" rx="1" fill="rgba(18,232,154,0.3)"/>
      <path d="M26 76 L28 74 L30 76 L32 74 L34 76 L36 74 L38 76 L40 74 L42 76 L44 74 L46 76 L48 76 L48 78 L26 78 Z"
        fill="url(#nrp)" opacity="0.6"/>
    </svg>
  );
}

export default function Nav() {
  const router   = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 16, left: 0, right: 0, zIndex: 100,
      display: "flex", justifyContent: "center", pointerEvents: "none",
    }}>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.1 }}
        style={{
          pointerEvents: "auto",
          display: "flex", alignItems: "center", gap: 2,
          padding: "5px 6px",
          borderRadius: 999,
          background: scrolled ? "rgba(10,15,30,0.96)" : "rgba(10,15,30,0.78)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            padding: "4px 10px 4px 4px",
            borderRadius: 999,
            fontSize: 14, fontWeight: 600, color: "var(--text-1)",
            letterSpacing: "-0.02em",
          }}
        >
          <img
            src="/receipt-logo.png"
            alt="Receipt"
            width={28}
            height={28}
            style={{ borderRadius: 7, display: "block", objectFit: "cover" }}
            onError={e => {
              // Fallback to inline SVG if image not found
              e.currentTarget.style.display = "none";
            }}
          />
          Receipt
        </button>

        <div style={{ width: 1, height: 16, background: "var(--line)", margin: "0 4px" }} />

        {/* Links with sliding pill */}
        <div className="hide-mobile" style={{ display: "flex" }}><LayoutGroup>
          {links.map(l => {
            const active   = pathname === l.href;
            const hovering = hovered === l.label;
            return (
              <button
                key={l.label}
                onClick={() => l.href.startsWith("http") ? window.open(l.href, "_blank") : router.push(l.href)}
                onMouseEnter={() => setHovered(l.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative", background: "none", border: "none",
                  cursor: "pointer", padding: "6px 13px", borderRadius: 999,
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active || hovering ? "var(--text-1)" : "var(--text-2)",
                  transition: "color 0.15s ease", zIndex: 0,
                }}
              >
                {(active || hovering) && (
                  <motion.div
                    layoutId="nav-bg"
                    style={{
                      position: "absolute", inset: 0, borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {l.label}
              </button>
            );
          })}
        </LayoutGroup></div>

        <div className="hide-mobile" style={{ width: 1, height: 16, background: "var(--line)", margin: "0 4px" }} />

        <button
          onClick={() => router.push("/setup")}
          style={{
            padding: "7px 16px", borderRadius: 999,
            fontSize: 13, fontWeight: 600,
            background: "rgba(255,255,255,0.92)", color: "#080C14",
            border: "none", cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Get started
        </button>
      </motion.nav>
    </div>
  );
}
