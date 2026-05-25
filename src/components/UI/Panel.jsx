import { C } from "../../constants/colors";

export function Panel({ children, style = {} }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, ...style }}>
      {children}
    </div>
  );
}

export function PanelHeader({ children, accent }) {
  return (
    <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
      {accent && <div style={{ width: 3, height: 14, background: accent, borderRadius: 1, flexShrink: 0 }} />}
      <span style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</span>
    </div>
  );
}