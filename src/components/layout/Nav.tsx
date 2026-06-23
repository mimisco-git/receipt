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

    // Read role from saved profile
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
    { href: "/#how-it-works", label: "How it works" },
    { href: "/marketplace", label: "Marketplace" },
  ];

  const links = role === "worker" ? workerLinks : role === "client" ? clientLinks : defaultLinks;

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          width: "calc(100% - 32px)",
          maxWidth: 760,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            background: scrolled
              ? "rgba(8,12,20,0.92)"
              : "rgba(8,12,20,0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 4px 16px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 28, height: 28 }}>
              <Image
                src="/receipt-logo.png"
                alt="Receipt"
                fill
                style={{ objectFit: "contain" }}
                onError={(e) => {
                  // Fallback SVG logo if image not found
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              Receipt
            </span>
          </Link>

          {/* Desktop Links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
            className="nav-links-desktop"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 100,
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap" as const,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/profile"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "#0a0f1e",
                background: "rgba(255,255,255,0.92)",
                textDecoration: "none",
                padding: "7px 14px",
                borderRadius: 100,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap" as const,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.92)"; }}
            >
              {role ? "My Profile" : "Get started"}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="nav-menu-btn"
              style={{
                display: "none",
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.06)",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                {menuOpen ? (
                  <>
                    <line x1="3" y1="3" x2="13" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="13" y1="3" x2="3" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="5" x2="13" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="8" x2="13" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="11" x2="13" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{
                marginTop: 8,
                padding: "8px",
                background: "rgba(8,12,20,0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    padding: "10px 14px",
                    borderRadius: 10,
                    transition: "all 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#10d98a",
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: 10,
                }}
              >
                {role ? "My Profile" : "Get started"}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <style>{`
        @media (max-width: 600px) {
          .nav-links-desktop { display: none !important; }
          .nav-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
