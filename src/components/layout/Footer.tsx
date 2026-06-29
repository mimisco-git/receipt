"use client";

import LeptonLogo from "@/components/shared/LeptonLogo";

function XIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}
function DiscordIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.044.028.055a19.905 19.905 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  );
}
function TelegramIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: <XIcon />,       label: "X",        href: "https://x.com/sir_mimisco" },
  { icon: <GithubIcon />,  label: "GitHub",   href: "https://github.com/mimisco-git/receipt" },
  { icon: <DiscordIcon />, label: "Discord",  href: "https://discord.com/users/sir_mimisco" },
  { icon: <TelegramIcon />,label: "Telegram", href: "https://t.me/sir_mimisco" },
];

export default function Footer() {
  return (
    <footer style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 16,
      padding: "36px 24px 28px",
      borderTop: "1px solid rgba(255,255,255,0.05)",
    }}>
      {/* Left: Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/receipt-logo.png"
          alt="Receipt"
          width={36} height={36}
          style={{ borderRadius: 9, objectFit: "cover" }}
          onError={e => (e.currentTarget.style.display = "none")}
        />
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Receipt</div>
          <div style={{ fontSize: 18, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            Circle · Arc · USDC · EURC
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <LeptonLogo size={12} />
              Lepton 2026
            </span>
          </div>
        </div>
      </div>

      {/* Right: Social icons */}
      <div style={{ display: "flex", gap: 8 }}>
        {SOCIAL_LINKS.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            title={s.label}
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: "transparent",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.35)", textDecoration: "none",
              transition: "color 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.82)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)";
            }}
          >
            {s.icon}
          </a>
        ))}
      </div>
    </footer>
  );
}
