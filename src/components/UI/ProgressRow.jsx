import { C } from "../../constants/colors";

export function ProgressRow({ label, current, max, color = "#4a9eff" }) {
  const percentage = Math.min((current / max) * 100, 100);
  return (
    <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: C.text, fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 700, color: current === max ? "#1eff00" : C.textMuted }}>{current}/{max}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", height: 7, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ background: color, width: `${percentage}%`, height: "100%", borderRadius: 999, boxShadow: `0 0 14px ${color}44` }} />
      </div>
    </div>
  );
}