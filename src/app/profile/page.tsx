"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";

const SKILLS_OPTIONS = [
  "Writing", "SEO", "Design", "Development", "Video Editing",
  "Translation", "Data Analysis", "Marketing", "Legal", "Accounting",
  "Photography", "Social Media", "Audio Production", "3D Modeling",
];

const AVATAR_COLORS = [
  "#10d98a", "#5090ff", "#f0a500", "#e0407a", "#9b59b6",
  "#e67e22", "#1abc9c", "#3498db", "#e74c3c", "#2ecc71",
];

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    role: "" as "worker" | "client" | "",
    name: "",
    bio: "",
    walletAddress: "",
    website: "",
    twitter: "",
    skills: [] as string[],
    rate: "",
    availability: "available" as "available" | "busy" | "offline",
    avatarColor: "#10d98a",
    avatarImage: "",
  });

  // Load saved profile on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("receipt_profile");
      if (stored) {
        const p = JSON.parse(stored);
        setForm((prev) => ({ ...prev, ...p }));
        if (p.avatarImage) setAvatarPreview(p.avatarImage);
      }
    } catch {}
  }, []);

  const update = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      update("avatarImage", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.role) { alert("Please select your role first."); return; }
    if (!form.name.trim()) { alert("Please enter your name."); return; }
    localStorage.setItem("receipt_profile", JSON.stringify(form));
    setSaved(true);

    // Provision Circle wallet if not already provisioned
    if (!form.walletAddress) {
      try {
        const res = await fetch("/api/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: form.name.replace(/\s/g, "-").toLowerCase(), role: form.role }),
        });
        if (res.ok) {
          const wallet = await res.json();
          if (wallet.walletAddress) {
            const updated = { ...form, walletAddress: wallet.walletAddress, circleWalletId: wallet.walletId };
            localStorage.setItem("receipt_profile", JSON.stringify(updated));
            setForm(updated);
          }
        }
      } catch {}
    }

    setTimeout(() => setSaved(false), 2500);
    setTimeout(() => window.location.reload(), 300);
  };

  const avatarInitials = form.name
    ? form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
    transition: "border-color 0.15s ease",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#ffffff" }}>
      <Nav />
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "110px 20px 60px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              Your Profile
            </h1>
            {form.role && (
              <span
                className={form.role === "worker" ? "pill pill-green" : "pill pill-blue"}
                style={{ fontSize: 11 }}
              >
                <span className="pill-dot" />
                {form.role === "worker" ? "Worker" : "Client"}
              </span>
            )}
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
            Saved locally. Loads automatically across Receipt.
          </p>

          {/* ROLE SELECTION — top priority */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <p style={{ ...labelStyle, marginBottom: 14 }}>I am a</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                {
                  value: "worker",
                  label: "Worker / Freelancer",
                  sub: "I deliver services and get paid",
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                      <line x1="12" y1="12" x2="12" y2="16" />
                      <line x1="10" y1="14" x2="14" y2="14" />
                    </svg>
                  ),
                },
                {
                  value: "client",
                  label: "Client / Buyer",
                  sub: "I hire and pay for work",
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  ),
                },
              ].map((opt) => {
                const active = form.role === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => update("role", opt.value)}
                    style={{
                      padding: "16px 14px",
                      borderRadius: 12,
                      border: active
                        ? "1.5px solid #10d98a"
                        : "1.5px solid rgba(255,255,255,0.07)",
                      background: active
                        ? "rgba(16,217,138,0.08)"
                        : "rgba(255,255,255,0.02)",
                      color: active ? "#10d98a" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ marginBottom: 8, color: active ? "#10d98a" : "rgba(255,255,255,0.4)" }}>
                      {opt.icon}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: active ? "#10d98a" : "#ffffff" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {opt.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar + Name */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: avatarPreview ? "transparent" : form.avatarColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#ffffff",
                    overflow: "hidden",
                    border: "2px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#10d98a",
                    border: "2px solid #0a0f1e",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Upload photo"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                  Avatar color
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => { update("avatarColor", color); update("avatarImage", ""); setAvatarPreview(null); }}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: color,
                        border: form.avatarColor === color && !avatarPreview ? "2px solid #ffffff" : "2px solid transparent",
                        cursor: "pointer",
                        transition: "transform 0.12s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Name + Bio */}
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Full name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Emenike Johnson"
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  style={{ ...inputStyle, resize: "vertical" as const, minHeight: 80 }}
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="I write SEO articles and ghostwrite for tech founders..."
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
            </div>
          </div>

          {/* Payment + Links */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              display: "grid",
              gap: 14,
            }}
          >
            <div>
              <label style={labelStyle}>USDC Wallet Address</label>
              <input
                style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
                value={form.walletAddress}
                onChange={(e) => update("walletAddress", e.target.value)}
                placeholder="0x4565...F0"
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  style={inputStyle}
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://yoursite.com"
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>X / Twitter</label>
                <input
                  style={inputStyle}
                  value={form.twitter}
                  onChange={(e) => update("twitter", e.target.value)}
                  placeholder="@username"
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
            </div>
            {form.role === "worker" && (
              <div>
                <label style={labelStyle}>Hourly Rate (USDC)</label>
                <input
                  style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
                  type="number"
                  value={form.rate}
                  onChange={(e) => update("rate", e.target.value)}
                  placeholder="25"
                  min="1"
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(16,217,138,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                />
              </div>
            )}
          </div>

          {/* Skills (workers only) */}
          {form.role === "worker" && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                padding: 24,
                marginBottom: 20,
              }}
            >
              <p style={labelStyle}>Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SKILLS_OPTIONS.map((skill) => {
                  const active = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 100,
                        border: active ? "1px solid #10d98a" : "1px solid rgba(255,255,255,0.1)",
                        background: active ? "rgba(16,217,138,0.1)" : "rgba(255,255,255,0.03)",
                        color: active ? "#10d98a" : "rgba(255,255,255,0.55)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.12s ease",
                      }}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: 24,
              marginBottom: 28,
            }}
          >
            <p style={labelStyle}>Availability</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "available", label: "Available", color: "#10d98a" },
                { value: "busy", label: "Busy", color: "#f0a500" },
                { value: "offline", label: "Offline", color: "rgba(255,255,255,0.3)" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("availability", opt.value)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 100,
                    border: form.availability === opt.value
                      ? `1px solid ${opt.color}`
                      : "1px solid rgba(255,255,255,0.08)",
                    background: form.availability === opt.value
                      ? `${opt.color}18`
                      : "transparent",
                    color: form.availability === opt.value ? opt.color : "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: opt.color,
                    }}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.97, y: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: "100%",
              padding: "14px",
              background: saved ? "#10d98a" : "rgba(255,255,255,0.92)",
              color: saved ? "#ffffff" : "#0a0f1e",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saved ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="4,12 9,17 20,7" />
                </svg>
                Profile saved
              </>
            ) : (
              "Save profile"
            )}
          </motion.button>

          {form.role === "worker" && (
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 14 }}>
              After saving, go to{" "}
              <a href="/setup" style={{ color: "#10d98a" }}>Create Service</a>{" "}
              to generate your payment link.
            </p>
          )}
          {form.role === "client" && (
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 14 }}>
              After saving, go to{" "}
              <a href="/marketplace" style={{ color: "#10d98a" }}>Browse Workers</a>{" "}
              to find talent.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
