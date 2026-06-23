"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

const links = [
  { label: "Marketplace",  href: "/marketplace" },
  { label: "Dashboard",    href: "/dashboard" },
  { label: "Faucet",       href: "/faucet" },
  { label: "Docs",         href: "/docs" },
];

export default function Nav() {
  const router   = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    try {
      const p = localStorage.getItem("receipt_profile");
      if (p) {
        const profile = JSON.parse(p);
        if (profile.name) setHasProfile(true);
      }
    } catch {}
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.1 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(16px, 4vw, 40px)",
        height: 56,
        background: scrolled
          ? "rgba(10,15,30,0.65)"
          : "rgba(10,15,30,0.25)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid transparent",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Left: Logo + Name */}
      <button
        onClick={() => router.push("/")}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none", cursor: "pointer",
          padding: 0, flexShrink: 0,
        }}
      >
        <img
          src="/receipt-logo.png"
          alt="Receipt"
          width={30}
          height={30}
          style={{ borderRadius: 8, display: "block", objectFit: "cover" }}
          onError={e => { e.currentTarget.style.display = "none"; }}
        />
        <span style={{
          fontSize: 16, fontWeight: 700, color: "var(--text-1)",
          letterSpacing: "-0.03em",
        }}>
          Receipt
        </span>
      </button>

      {/* Center: Links */}
      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <LayoutGroup>
          {links.map(l => {
            const active = pathname === l.href
              || (l.href === "/dashboard" && (pathname === "/worker-dashboard" || pathname === "/client-dashboard"));
            const hovering = hovered === l.label;
            return (
              <button
                key={l.label}
                onClick={() => router.push(l.href)}
                onMouseEnter={() => setHovered(l.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative", background: "none", border: "none",
                  cursor: "pointer", padding: "7px 14px", borderRadius: 999,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active || hovering ? "var(--text-1)" : "rgba(255,255,255,0.5)",
                  transition: "color 0.15s ease", zIndex: 0,
                }}
              >
                {(active || hovering) && (
                  <motion.div
                    layoutId="nav-pill"
                    style={{
                      position: "absolute", inset: 0, borderRadius: 999,
                      background: "rgba(255,255,255,0.07)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {l.label}
              </button>
            );
          })}
        </LayoutGroup>
      </div>

      {/* Right: CTA */}
      <button
        onClick={() => router.push(hasProfile ? "/setup" : "/profile")}
        style={{
          padding: "8px 18px", borderRadius: 999,
          fontSize: 13, fontWeight: 600,
          background: "var(--green)", color: "#060E0A",
          border: "none", cursor: "pointer",
          transition: "opacity 0.15s ease, transform 0.12s ease",
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.02)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
      >
        Get started
      </button>
    </motion.nav>
  );
}
