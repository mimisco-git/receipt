export default function Footer() {
  return (
    <footer style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 14,
      padding: "28px 32px",
      borderTop: "1px solid var(--line)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "linear-gradient(135deg, #10D98A, #0BBFFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#050A0E",
        }}>R</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Receipt</div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
            Circle · Arc · USDC · Lepton 2026
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {[
          { label: "GitHub", href: "https://github.com/mimisco-git/receipt" },
          { label: "Submit project", href: "https://forms.gle/SMqLaw2pMGDe58LFA" },
          { label: "Lepton", href: "https://lepton.thecanteenapp.com" },
        ].map(l => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{
            fontSize: 12.5, color: "var(--text-3)",
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
          >{l.label}</a>
        ))}
      </div>
    </footer>
  );
}
