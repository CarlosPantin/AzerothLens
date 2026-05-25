export function Badge({ children, color }) {
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color, background: color + "22", border: `1px solid ${color}44`, borderRadius: 2, padding: "2px 7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}