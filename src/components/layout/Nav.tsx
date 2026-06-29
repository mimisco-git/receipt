"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

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
  const [menuOpen, setMenuOpen] = useState(false);

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

  function navigate(href: string) {
    setMenuOpen(false);
    router.push(href);
  }

  function signOut() {
    localStorage.removeItem("receipt_profile");
    window.location.href = "/";
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.1 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(16px, 4vw, 40px)",
          height: 70,
          background: scrolled ? "rgba(0,0,0,0.5)" : "transparent",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Left: Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "none", cursor: "pointer",
            padding: 0, flexShrink: 0,
          }}
        >
          <img
            src="/receipt-logo.png"
            alt="Receipt"
            width={36}
            height={36}
            style={{ borderRadius: 10, display: "block", objectFit: "cover" }}
            onError={e => { e.currentTarget.style.display = "none"; }}
          />
          <span style={{ fontSize: 21, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.04em" }}>
            Receipt
          </span>
        </button>

        {/* Center: Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LayoutGroup>
            {links.map(l => {
              const active = pathname === l.href
                || (l.href === "/dashboard" && (pathname === "/worker-dashboard" || pathname === "/client-dashboard"));
              const hovering = hovered === l.label;
              return (
                <button
                  key={l.label}
                  className="nav-link-btn"
                  onClick={() => navigate(l.href)}
                  onMouseEnter={() => setHovered(l.label)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer", padding: "9px 20px", borderRadius: 999,
                    fontSize: 18, fontWeight: active ? 600 : 500,
                    color: active || hovering ? "var(--text-1)" : "rgba(255,255,255,0.60)",
                    transition: "color 0.15s ease",
                    position: "relative", zIndex: 0,
                  }}
                >
                  {(active || hovering) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="nav-pill-glass"
                      style={{
                        position: "absolute", inset: 0, borderRadius: 999, zIndex: -1,
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

        {/* Right: Desktop auth + Mobile hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Desktop auth buttons */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasProfile ? (
              <>
                <button onClick={() => navigate("/profile")}
                  className="nav-auth-btn"
                  style={{
                    padding: "9px 18px", borderRadius: 999, fontSize: 18, fontWeight: 500,
                    color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
                >
                  Profile
                </button>
                <button onClick={signOut}
                  className="nav-auth-btn"
                  style={{
                    padding: "9px 18px", borderRadius: 999, fontSize: 18, fontWeight: 500,
                    color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#ff4444"; e.currentTarget.style.borderColor = "rgba(255,68,68,0.25)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
                >
                  Sign out
                </button>
                <button onClick={() => navigate("/setup")}
                  style={{
                    padding: "9px 22px", borderRadius: 999, fontSize: 18, fontWeight: 600,
                    background: "linear-gradient(180deg, #23FFE0, #00D7C2)", color: "#060E0A",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,229,195,.18)",
                    transition: "opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,229,195,.28)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,229,195,.18)"; }}
                >
                  Get started
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/signin")}
                  className="nav-auth-btn"
                  style={{
                    padding: "9px 18px", borderRadius: 999, fontSize: 18, fontWeight: 500,
                    color: "rgba(255,255,255,0.55)", cursor: "pointer", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                >
                  Sign in
                </button>
                <button onClick={() => navigate("/profile")}
                  style={{
                    padding: "9px 22px", borderRadius: 999, fontSize: 18, fontWeight: 600,
                    background: "linear-gradient(180deg, #23FFE0, #00D7C2)", color: "#060E0A",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,229,195,.18)",
                    transition: "opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,229,195,.28)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,229,195,.18)"; }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{
              display: "none", background: "none", border: "none",
              cursor: "pointer", padding: 6, color: "var(--text-1)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" stroke="currentColor">
              {menuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", top: 70, left: 0, right: 0, zIndex: 99,
              background: "rgba(0,0,0,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "12px 20px 20px",
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            {links.map(l => {
              const active = pathname === l.href
                || (l.href === "/dashboard" && (pathname === "/worker-dashboard" || pathname === "/client-dashboard"));
              return (
                <button
                  key={l.label}
                  onClick={() => navigate(l.href)}
                  style={{
                    background: active ? "rgba(255,255,255,0.07)" : "none",
                    border: "none", cursor: "pointer",
                    padding: "12px 16px", borderRadius: 12,
                    fontSize: 15, fontWeight: active ? 600 : 400,
                    color: active ? "var(--text-1)" : "rgba(255,255,255,0.6)",
                    textAlign: "left", transition: "all 0.15s ease",
                  }}
                >
                  {l.label}
                </button>
              );
            })}

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />

            {hasProfile ? (
              <>
                <button onClick={() => navigate("/profile")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,0.6)", textAlign: "left" }}>
                  Profile
                </button>
                <button onClick={() => navigate("/setup")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: 12, fontSize: 15, color: "var(--green)", fontWeight: 600, textAlign: "left" }}>
                  Get started
                </button>
                <button onClick={signOut}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: 12, fontSize: 15, color: "#ff4444", textAlign: "left" }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/signin")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,0.6)", textAlign: "left" }}>
                  Sign in
                </button>
                <button onClick={() => navigate("/profile")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "12px 16px", borderRadius: 12, fontSize: 15, color: "var(--green)", fontWeight: 600, textAlign: "left" }}>
                  Sign up
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
