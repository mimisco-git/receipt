"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const AVATAR_COLORS = [
  "#12E89A", "#4A9EF8", "#F5A623", "#F05252",
  "#A855F7", "#EC4899", "#14B8A6", "#F59E0B",
];

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    name:          "",
    bio:           "",
    walletAddress: "",
    website:       "",
    twitter:       "",
    skills:        "",
    avatarColor:   "#12E89A",
    hourlyRate:    "",
    availability:  "available",
  });

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    // In production: call /api/freelancer with form data
    // For now: save to localStorage for persistence
    try {
      localStorage.setItem("receipt_profile", JSON.stringify({ ...form, avatarUrl }));
      await new Promise(r => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const initials = form.name
    ? form.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      <main style={{
        maxWidth: 640, margin: "0 auto",
        padding: "clamp(80px, 12vw, 100px) 20px 60px",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: "clamp(22px,4vw,28px)", fontWeight: 700,
              letterSpacing: "-0.025em", marginBottom: 6,
            }}>
              Your profile
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              This is what clients see when they open your service link.
            </p>
          </div>

          {/* Avatar section */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)", padding: "24px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              Photo
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {/* Avatar preview */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: avatarUrl ? "transparent" : form.avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700, color: "#060E0A",
                  border: "2px solid var(--line)",
                  overflow: "hidden",
                }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials
                  }
                </div>
                {/* Upload button */}
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--card-2)", border: "1px solid var(--line)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-2)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--card)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--card-2)"}
                >
                  <CameraIcon />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: "none" }}
                />
              </div>

              {/* Color picker */}
              <div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
                  Or pick a color
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => { update("avatarColor", c); setAvatarUrl(null); }}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: c, border: form.avatarColor === c && !avatarUrl
                          ? "2px solid white"
                          : "2px solid transparent",
                        cursor: "pointer",
                        transition: "transform 0.15s",
                        transform: form.avatarColor === c && !avatarUrl ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)", padding: "24px",
            marginBottom: 16, display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Basic info
            </div>
            <Field label="Full name" placeholder="e.g. Amara Nwosu"
              value={form.name} onChange={v => update("name", v)} />
            <Field label="Bio" placeholder="What do you do? What makes you the right choice?"
              value={form.bio} onChange={v => update("bio", v)} as="textarea" rows={3} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Website (optional)" placeholder="https://yoursite.com"
                value={form.website} onChange={v => update("website", v)} />
              <Field label="Twitter/X (optional)" placeholder="@yourhandle"
                value={form.twitter} onChange={v => update("twitter", v)} />
            </div>
            <Field label="Skills (comma separated)" placeholder="SEO writing, copywriting, technical docs"
              value={form.skills} onChange={v => update("skills", v)} />
          </div>

          {/* Payment info */}
          <div style={{
            background: "var(--card)", border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)", padding: "24px",
            marginBottom: 16, display: "flex", flexDirection: "column", gap: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Payment
            </div>
            <Field label="USDC wallet address" placeholder="0x..."
              value={form.walletAddress} onChange={v => update("walletAddress", v)} mono />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Hourly rate (USDC, optional)" placeholder="e.g. 25.00"
                value={form.hourlyRate} onChange={v => update("hourlyRate", v)} />
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
                  Availability
                </label>
                <select
                  value={form.availability}
                  onChange={e => update("availability", e.target.value)}
                  className="input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="available">Available for work</option>
                  <option value="busy">Currently busy</option>
                  <option value="closed">Not taking projects</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="btn-primary"
              style={{
                flex: 1, padding: "13px", borderRadius: "var(--r-sm)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {saving ? (
                <>
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(6,14,10,0.3)", borderTopColor: "#060E0A",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <SaveIcon />
                  Saved
                </>
              ) : (
                "Save profile"
              )}
            </button>
            <button
              onClick={() => router.push("/setup")}
              className="btn-ghost"
              style={{ padding: "13px 18px", borderRadius: "var(--r-sm)" }}
            >
              Create service
            </button>
          </div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 12, padding: "11px 14px",
                background: "var(--green-dim)", border: "1px solid var(--green-border)",
                borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--green)",
                textAlign: "center",
              }}
            >
              Profile saved. Share your service links with clients.
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, as = "input", rows = 3, mono = false,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; as?: "input" | "textarea"; rows?: number; mono?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          rows={rows} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="input"
          style={{ resize: "none", fontFamily: mono ? '"DM Mono", monospace' : "inherit" }}
        />
      ) : (
        <input
          type="text" placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="input"
          style={{ fontFamily: mono ? '"DM Mono", monospace' : "inherit", fontSize: mono ? 13 : 14 }}
        />
      )}
    </div>
  );
}
