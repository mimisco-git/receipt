"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

const links = [
  { label: "Marketplace",  href: "/marketplace" },
  { label: "Dashboard",    href: "/dashboard" },
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
          background: scrolled
            ? "rgba(10,15,30,0.55)"
            : "rgba(10,15,30,0.35)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: scrolled
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
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
              e.currentTarget.style.display = "none";
            }}
          />
          Receipt
        </button>

        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.10)", margin: "0 4px" }} />

        {/* Links with sliding pill */}
        <div className="hide-mobile" style={{ display: "flex" }}><LayoutGroup>
          {links.map(l => {
            const active   = pathname === l.href || (l.href === "/dashboard" && (pathname === "/worker-dashboard" || pathname === "/client-dashboard"));
            const hovering = hovered === l.label;
            return (
              <button
                key={l.label}
                onClick={() => router.push(l.href)}
                onMouseEnter={() => setHovered(l.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative", background: "none", border: "none",
                  cursor: "pointer", padding: "6px 13px", borderRadius: 999,
                  fontSize: 13, fontWeight: active ? 500 : 400,
                  color: active || hovering ? "var(--text-1)" : "rgba(255,255,255,0.55)",
                  transition: "color 0.15s ease", zIndex: 0,
                }}
              >
                {(active || hovering) && (
                  <motion.div
                    layoutId="nav-bg"
                    style={{
                      position: "absolute", inset: 0, borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.06)",
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

        <div className="hide-mobile" style={{ width: 1, height: 16, background: "rgba(255,255,255,0.10)", margin: "0 4px" }} />

        <button
          onClick={() => router.push(hasProfile ? "/setup" : "/profile")}
          style={{
            padding: "7px 16px", borderRadius: 999,
            fontSize: 13, fontWeight: 600,
            background: "var(--green)", color: "#060E0A",
            border: "none", cursor: "pointer",
            transition: "opacity 0.15s ease, transform 0.12s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          Get started
        </button>
      </motion.nav>
    </div>
  );
}
