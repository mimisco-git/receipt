export default function Footer() {
  return (
    <footer style={{
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between", gap: 16,
      padding: "32px 28px",
      borderTop: "1px solid var(--wire)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: "linear-gradient(135deg, #00E896, #00BFFF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#07080F",
        }}>R</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Receipt</div>
          <div style={{ fontSize: 11, color: "var(--mist)" }}>
            Circle · Arc · USDC · Lepton Hackathon 2026
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {["GitHub", "Docs", "Discord", "Lepton"].map(l => (
          <a key={l} href="#" style={{
            fontSize: 12.5, color: "var(--mist)", textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--ink-2)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--mist)"}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}
