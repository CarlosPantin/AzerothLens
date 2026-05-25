import { C } from "../../constants/colors";

export function StatRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 14px", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
      <span style={{ fontSize: 12, color: valueColor || C.text, fontWeight: 500 }}>{value}</span>
    </div>
  );
}