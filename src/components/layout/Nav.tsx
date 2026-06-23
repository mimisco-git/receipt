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
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 2px 12px rgba(0,0,0,0.2)",
            transition: "background 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Logo — left */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
            <div style={{ position: "relative", width: 26, height: 26, flexShrink: 0 }}>
              <Image
                src="/receipt-logo.png"
                alt="Receipt"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}
            >
              Receipt
            </span>
          </Link>

          {/* Links — right-aligned, next to CTA */}
          <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: 100,
                  transition: "color 0.3s cubic-bezier(0.16,1,0.3,1)",
                  whiteSpace: "nowrap" as const,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA button */}
          <Link
            href="/profile"
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-menu-btn"
            style={{
              display: "none",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginLeft: 6,
            }}
            aria-label="Menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="12" y1="4" x2="4" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: 8,
                padding: "8px",
                background: "rgba(10,15,30,0.95)",
                backdropFilter: "blur(24px)",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              }}
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "block",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    padding: "12px 16px",
                    borderRadius: 12,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "4px 8px" }} />
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--green)",
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: 12,
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
