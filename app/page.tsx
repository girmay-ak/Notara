export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "10vh auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", color: "#1F4D3D" }}>Notara</h1>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.5 }}>
        Klaar met avonden typen? Notara verandert een voicememo van 60 seconden
        in een KNGF-conforme behandelnotitie.
      </p>
      <p style={{ color: "#666" }}>
        Pre-validatie. De AI-pijplijn (Whisper → Claude) draait in dit project —
        zie <code>docs/VALIDATION-PLAN.md</code> en <code>npm run eval</code>.
      </p>
    </main>
  );
}
