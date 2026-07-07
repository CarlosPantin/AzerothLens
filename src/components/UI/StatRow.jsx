import { C } from "../../constants/colors";

export function StatRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
      <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
      <span style={{ fontSize: 12, color: valueColor || C.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}