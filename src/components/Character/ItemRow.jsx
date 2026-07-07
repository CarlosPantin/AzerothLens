import { C, QUALITY } from "../../constants/colors";

export function ItemRow({ slot, item }) {
  const color = item ? (QUALITY[item.quality?.type] || QUALITY.COMMON) : C.textDim;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: `1px solid rgba(255,255,255,0.05)`, minHeight: 42 }}>
      <span style={{ fontSize: 10, color: C.textDim, minWidth: 92, textTransform: "uppercase", letterSpacing: "0.08em" }}>{slot.replace(/_/g, " ")}</span>
      {item ? (
        <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a 
            href={`https://www.wowhead.com/item=${item.item?.id}`}
            data-wowhead={`item=${item.item?.id}&domain=eu`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color, textDecoration: "none", fontWeight: 600 }}
          >
            {item.name || "Unknown"}
          </a>
          <span style={{ fontSize: 11, color: C.textMuted, marginLeft: 8, flexShrink: 0 }}>
            {item.level?.value && `ilvl ${item.level.value}`}
          </span>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>— empty —</span>
      )}
    </div>
  );
}