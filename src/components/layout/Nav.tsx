"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    try {
      const stored = localStorage.getItem("receipt_profile");
      if (stored) {
        const p = JSON.parse(stored);
        setRole(p.role || null);
      }
    } catch {}

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const workerLinks = [
    { href: "/setup", label: "Create Service" },
    { href: "/marketplace", label: "Find Jobs" },
    { href: "/worker-dashboard", label: "My Work" },
  ];

  const clientLinks = [
    { href: "/marketplace", label: "Browse Workers" },
    { href: "/client-dashboard", label: "My Contracts" },
  ];

  const defaultLinks = [
    { href: "/#how", label: "How it works" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  const links = role === "worker" ? workerLinks : role === "client" ? clientLinks : defaultLinks;

  const spring = { type: "spring" as const, stiffness: 260, damping: 20 };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 16,
          left: 0,
          right: 0,
          margin: "0 auto",
          zIndex: 100,
          width: "calc(100% - 32px)",
          maxWidth: 720,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 6px 0 16px",
            height: 52,
            background: scrolled
              ? "rgba(10,15,30,0.92)"
              : "rgba(10,15,30,0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 2px 12px rgba(0,0,0,0.15)",
            transition: "background 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
            <div style={{ position: "relative", width: 26, height: 26, flexShrink: 0 }}>
              <Image src="/receipt-logo.png" alt="Receipt" fill style={{ objectFit: "contain" }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Receipt
            </span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: 100,
                  transition: "color 0.3s cubic-bezier(0.16,1,0.3,1)",
                  whiteSpace: "nowrap" as const,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <Link
            href="/profile"
            className="nav-desktop-cta"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0a0f1e",
              background: "#ffffff",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 100,
              marginLeft: 6,
              transition: "opacity 0.3s cubic-bezier(0.16,1,0.3,1)",
              whiteSpace: "nowrap" as const,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {role ? "My Profile" : "Get started"}
          </Link>

          {/* Mobile: menu trigger only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-mobile-trigger"
            style={{
              display: "none",
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {/* Top line → morphs to X */}
              <motion.line
                x1="4" x2="16"
                animate={menuOpen ? { y1: 10, y2: 10, rotate: 45 } : { y1: 6, y2: 6, rotate: 0 }}
                transition={spring}
                stroke="white" strokeWidth="1.5" strokeLinecap="round"
                style={{ transformOrigin: "center" }}
              />
              {/* Middle line → fades */}
              <motion.line
                x1="4" y1="10" x2="16" y2="10"
                animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
                transition={spring}
                stroke="white" strokeWidth="1.5" strokeLinecap="round"
                style={{ transformOrigin: "center" }}
              />
              {/* Bottom line → morphs to X */}
              <motion.line
                x1="4" x2="16"
                animate={menuOpen ? { y1: 10, y2: 10, rotate: -45 } : { y1: 14, y2: 14, rotate: 0 }}
                transition={spring}
                stroke="white" strokeWidth="1.5" strokeLinecap="round"
                style={{ transformOrigin: "center" }}
              />
            </svg>
          </button>
        </div>

        {/* Mobile overlay menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: 8,
                padding: "12px",
                background: "rgba(10,15,30,0.96)",
                backdropFilter: "blur(24px)",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, ...spring }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "block",
                      fontSize: 16,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      padding: "14px 16px",
                      borderRadius: 12,
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "4px 12px" }} />
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05, ...spring }}
              >
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--green)",
                    textDecoration: "none",
                    padding: "14px 16px",
                    borderRadius: 12,
                  }}
                >
                  {role ? "My Profile" : "Get started"}
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-desktop-cta { display: none !important; }
          .nav-mobile-trigger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
