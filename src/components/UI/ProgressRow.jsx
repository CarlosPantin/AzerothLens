import { C } from "../../constants/colors";

export function ProgressRow({ label, current, max, color = "#4a9eff" }) {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div style={{ padding: "8px 14px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: C.text }}>{label}</span>
        <span style={{ fontWeight: 600, color: current === max ? "#1eff00" : C.textMuted }}>{current}/{max}</span>
      </div>
      <div style={{ background: C.bg, height: 4, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ background: color, width: `${percentage}%`, height: "100%", borderRadius: 2 }} />
      </div>
    </div>
  );
}