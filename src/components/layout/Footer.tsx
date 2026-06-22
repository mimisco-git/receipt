import LeptonLogo from "@/components/shared/LeptonLogo";

export default function Footer() {
  return (
    <footer style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 14,
      padding: "28px 24px",
      borderTop: "1px solid var(--line)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/receipt-logo.png"
          alt="Receipt"
          width={26} height={26}
          style={{ borderRadius: 7, objectFit: "cover" }}
          onError={e => (e.currentTarget.style.display = "none")}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Receipt</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
            Circle · Arc · USDC
            <LeptonLogo size={13} />
            Lepton 2026
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {[
          { label: "GitHub",          href: "https://github.com/mimisco-git/receipt" },
          { label: "Profile",         href: "/profile" },
          { label: "Dashboard",       href: "/dashboard" },
          { label: "Submit project",  href: "https://forms.gle/SMqLaw2pMGDe58LFA" },
          { label: "Lepton",          href: "https://lepton.thecanteenapp.com" },
        ].map(l => (
          <a key={l.label} href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noreferrer" : undefined}
            style={{
              fontSize: 12.5, color: "var(--text-3)",
              textDecoration: "none",
              transition: "color 0.15s ease",
              display: "flex", alignItems: "center", gap: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            {l.label === "Lepton" && <LeptonLogo size={13} />}
            {l.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
