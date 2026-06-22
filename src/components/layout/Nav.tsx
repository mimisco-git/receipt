"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "Dashboard",    href: "/dashboard" },
  { label: "Docs",         href: "https://github.com/mimisco-git/receipt" },
];

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
          background: scrolled ? "rgba(8,12,20,0.95)" : "rgba(8,12,20,0.75)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
          transition: "background 0.3s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            padding: "5px 10px 5px 6px",
            borderRadius: 999,
            fontSize: 14, fontWeight: 600, color: "var(--text-1)",
            letterSpacing: "-0.02em",
          }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg, #10D98A, #0BBFFF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#050A0E",
            boxShadow: "0 0 12px rgba(16,217,138,0.25)",
          }}>R</div>
          Receipt
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: "var(--line)", margin: "0 4px" }} />

        {/* Links with sliding pill */}
        <LayoutGroup>
          {links.map(l => {
            const active  = pathname === l.href;
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
        </LayoutGroup>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: "var(--line)", margin: "0 4px" }} />

        {/* CTA */}
        <button
          onClick={() => router.push("/setup")}
          style={{
            padding: "6px 16px", borderRadius: 999,
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
