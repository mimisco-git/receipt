"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, LayoutGroup } from "framer-motion";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "Dashboard",    href: "/dashboard" },
  { label: "Docs",         href: "#" },
];

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Magnetic hover on CTA
  const btnRef = useRef<HTMLButtonElement>(null);
  function onBtnMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }
  function onBtnLeave() {
    if (btnRef.current) btnRef.current.style.transform = "";
  }

  return (
    /* Floating pill container — centered, not full-width */
    <div style={{
      position: "fixed", top: 16, left: 0, right: 0, zIndex: 100,
      display: "flex", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <motion.nav
        ref={navRef}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
        style={{
          pointerEvents: "auto",
          display: "flex", alignItems: "center",
          gap: 4,
          padding: "6px 8px",
          borderRadius: 999,
          // Floating glass surface
          background: scrolled
            ? "rgba(10,14,22,0.92)"
            : "rgba(10,14,22,0.70)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          boxShadow: scrolled
            ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.07)"
            : "inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 16px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.05)",
          transition: "background 0.35s ease, box-shadow 0.35s ease",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 600, color: "var(--ink)",
            letterSpacing: "-0.02em", borderRadius: 999,
            marginRight: 4,
          }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg, #00E5A0, #00C8FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11.5, fontWeight: 700, color: "#02040A",
            boxShadow: "0 0 12px rgba(0,229,160,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
            flexShrink: 0,
          }}>R</div>
          Receipt
        </button>

        {/* Separator */}
        <div style={{ width: 0.5, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />

        {/* Links with animated background pill */}
        <LayoutGroup>
          {links.map(l => {
            const isCurrent = pathname === l.href;
            const isHovered = active === l.label;
            return (
              <button
                key={l.label}
                onClick={() => router.push(l.href)}
                onMouseEnter={() => setActive(l.label)}
                onMouseLeave={() => setActive(null)}
                style={{
                  position: "relative",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "5px 12px", borderRadius: 999,
                  fontSize: 12.5, fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent || isHovered ? "var(--ink)" : "var(--ash)",
                  transition: "color 0.18s ease",
                  zIndex: 0,
                }}
              >
                {/* Sliding glass pill under active/hover */}
                {(isCurrent || isHovered) && (
                  <motion.div
                    layoutId="nav-pill"
                    style={{
                      position: "absolute", inset: 0, borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)",
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </button>
            );
          })}
        </LayoutGroup>

        {/* Separator */}
        <div style={{ width: 0.5, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />

        {/* CTA */}
        <button
          ref={btnRef}
          onMouseMove={onBtnMove}
          onClick={() => router.push("/setup")}
          style={{
            padding: "6px 16px",
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            letterSpacing: "-0.01em",
            background: "rgba(255,255,255,0.90)",
            color: "#02040A",
            boxShadow: "0 1px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
            transition: "opacity 0.15s ease, transform 0.12s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.82"; }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "";
          }}
        >
          Start as freelancer
        </button>
      </motion.nav>
    </div>
  );
}
