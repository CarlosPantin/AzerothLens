import { C } from "../../constants/colors";

export function Panel({ children, style = {} }) {
  return (
    <div style={{
      background: `linear-gradient(140deg, rgba(24, 28, 36, 0.96) 0%, rgba(10, 12, 18, 0.95) 100%)`,
      border: `1px solid rgba(255, 255, 255, 0.06)`,
      borderRadius: 16,
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
      overflow: "hidden",
      backdropFilter: "blur(16px)",
      ...style
    }}>
      {children}
    </div>
  );
}

export function PanelHeader({ children, accent }) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))" }}>
      {accent && <div style={{ width: 3, height: 14, background: accent, borderRadius: 999, flexShrink: 0 }} />}
      <span style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</span>
    </div>
  );
}