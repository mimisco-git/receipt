"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/layout/Nav";
import { loadProfile, saveProfile, getInitials, type ProfileData } from "@/lib/profile";

const AVATAR_COLORS = [
  "#12E89A","#4A9EF8","#F5A623","#F05252",
  "#A855F7","#EC4899","#14B8A6","#F59E0B",
];

const SELECT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.25)",
  border: "1px solid var(--line)",
  color: "var(--text-1)",
  fontFamily: "inherit",
  fontSize: 14,
  borderRadius: "var(--r-sm)",
  padding: "12px 14px",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6A82' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
};

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileData>({
    role: "", name: "", bio: "", walletAddress: "",
    website: "", twitter: "", skills: "",
    avatarColor: "#12E89A", avatarUrl: null,
    hourlyRate: "", availability: "available",
  });

  // Load saved profile on mount
  useEffect(() => {
    const saved = loadProfile();
    setForm(saved);
    if (saved.avatarUrl) setAvatarUrl(saved.avatarUrl);
    setLoaded(true);
  }, []);

  const update = (k: keyof ProfileData, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setAvatarUrl(url);
      setForm(p => ({ ...p, avatarUrl: url }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const toSave: ProfileData = { ...form, avatarUrl };
      saveProfile(toSave);
      await new Promise(r => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Nav />
        <div style={{ display: "flex", gap: 5 }}>
          {[0,0.15,0.3].map(d => (
            <div key={d} style={{
              width: 6, height: 6, borderRadius: "50%", background: "var(--green)", opacity: 0.4,
              animation: `thinking 1.1s ${d}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  const initials = getInitials(form.name);
  const displayAvatar = avatarUrl || form.avatarUrl;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "clamp(80px,12vw,100px) 20px 60px" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, letterSpacing: "-0.025em" }}>
                Your profile
              </h1>
              {form.role && (
                <span className={form.role === "worker" ? "pill pill-green" : "pill pill-blue"}>
                  <span className="pill-dot" />
                  {form.role === "worker" ? "Worker" : "Client"}
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Saved automatically. Clients see this when they open your service link.
            </p>
          </div>

          {/* ROLE */}
          <Section title="I am a">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([
                { value: "worker" as const, label: "Worker / Freelancer", sub: "I deliver services and get paid" },
                { value: "client" as const, label: "Client / Buyer", sub: "I hire and pay for work" },
              ]).map(opt => {
                const active = form.role === opt.value;
                return (
                  <button key={opt.value} onClick={() => update("role", opt.value)}
                    style={{
                      padding: "16px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                      border: active ? "1.5px solid var(--green)" : "1.5px solid var(--line)",
                      background: active ? "var(--green-dim)" : "rgba(255,255,255,0.02)",
                      color: active ? "var(--green)" : "var(--text-2)",
                      transition: "all 0.2s ease",
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, color: active ? "var(--green)" : "var(--text-1)" }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{opt.sub}</div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* AVATAR */}
          <Section title="Photo">
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: displayAvatar ? "transparent" : form.avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700, color: "#060E0A",
                  border: "2px solid var(--line)", overflow: "hidden",
                }}>
                  {displayAvatar
                    ? <img src={displayAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : initials}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  title="Upload photo"
                  style={{
                    position: "absolute", bottom: -2, right: -2,
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--card-2)", border: "1px solid var(--line)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-2)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
              </div>

              <div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>Pick a color</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => { update("avatarColor", c); setAvatarUrl(null); setForm(p => ({ ...p, avatarUrl: null })); }}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                        outline: form.avatarColor === c && !displayAvatar ? "2px solid white" : "2px solid transparent",
                        outlineOffset: 2,
                        transform: form.avatarColor === c && !displayAvatar ? "scale(1.15)" : "scale(1)",
                        transition: "transform 0.15s, outline 0.15s",
                      }} />
                  ))}
                </div>
                {displayAvatar && (
                  <button onClick={() => { setAvatarUrl(null); setForm(p => ({ ...p, avatarUrl: null })); }}
                    style={{ marginTop: 10, fontSize: 12, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* BASIC INFO */}
          <Section title="Basic info">
            <Field label="Full name" placeholder="e.g. Amara Nwosu" value={form.name} onChange={v => update("name", v)} />
            <Field label="Bio" placeholder="What you do, your specialty, years of experience..." value={form.bio} onChange={v => update("bio", v)} as="textarea" rows={3} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
              <Field label="Website" placeholder="https://yoursite.com" value={form.website} onChange={v => update("website", v)} />
              <Field label="Twitter / X" placeholder="@yourhandle" value={form.twitter} onChange={v => update("twitter", v)} />
            </div>
            <Field label="Skills (comma separated)" placeholder="SEO writing, copywriting, technical docs" value={form.skills} onChange={v => update("skills", v)} />
          </Section>

          {/* PAYMENT */}
          <Section title="Payment details">
            <Field label="USDC wallet address on Arc" placeholder="0x..." value={form.walletAddress} onChange={v => update("walletAddress", v)} mono />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
              <Field label="Default hourly rate (USDC)" placeholder="e.g. 25.00" value={form.hourlyRate} onChange={v => update("hourlyRate", v)} />
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>Availability</label>
                <select value={form.availability} onChange={e => update("availability", e.target.value)} style={SELECT_STYLE}>
                  <option value="available">Available for work</option>
                  <option value="busy">Currently busy</option>
                  <option value="closed">Not taking projects</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ACTIONS */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.role} className="btn-primary"
              style={{ flex: 1, padding: "13px", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {saving ? (
                <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(6,14,10,0.3)", borderTopColor: "#060E0A", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Saving...</>
              ) : saved ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>Saved</>
              ) : "Save profile"}
            </button>
            <button onClick={() => router.push("/setup")} className="btn-ghost"
              style={{ padding: "13px 18px", borderRadius: "var(--r-sm)" }}>
              Create service
            </button>
          </div>

          {saved && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 12, padding: "11px 14px", background: "var(--green-dim)", border: "1px solid var(--green-border)", borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--green)", textAlign: "center" }}>
              Profile saved. Your details will appear in your service links automatically.
            </motion.div>
          )}

        </motion.div>
      </main>
      <style>{`
        select option { background: #1A2235; color: #fff; }
        select:focus { border-color: var(--green-border) !important; box-shadow: 0 0 0 3px var(--green-dim) !important; }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: 24, marginBottom: 12, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, placeholder, value, onChange, as = "input", rows = 3, mono = false }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  as?: "input" | "textarea"; rows?: number; mono?: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    fontFamily: mono ? '"DM Mono", monospace' : "inherit",
    fontSize: mono ? 13 : 14,
    background: "rgba(0,0,0,0.25)",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
    resize: as === "textarea" ? "none" : undefined,
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 7 }}>{label}</label>
      {as === "textarea"
        ? <textarea rows={rows} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="input" style={inputStyle} />
        : <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="input" style={inputStyle} />}
    </div>
  );
}
