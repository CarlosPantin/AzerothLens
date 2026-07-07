export function Badge({ children, color }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 999, padding: "4px 9px", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: `0 0 0 1px ${color}12` }}>
      {children}
    </span>
  );
}