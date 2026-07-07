import { useState, useEffect } from "react";
import { C, CLASS_COLORS, FACTION_COLORS, SLOTS } from "./constants/colors";
import { EU_REALMS } from "./constants/realms";
import { CLASS_GUIDES } from "./constants/guides"; 
import { fetchCharacterProfile } from "./api/blizzard";

import { Panel, PanelHeader } from "./components/UI/Panel";
import { StatRow } from "./components/UI/StatRow";
import { ProgressRow } from "./components/UI/ProgressRow";
import { Badge } from "./components/UI/Badge";
import { ItemRow } from "./components/Character/ItemRow";

export default function WoWLookup() {
  const [charName, setCharName] = useState("");
  const [realm, setRealm] = useState("");
  const [realmInput, setRealmInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [profile, setProfile] = useState({
    character: null, media: null, equipment: null, stats: null, mythicPlus: null, raidProg: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://wow.zamimg.com/js/tooltips.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (realmInput.length < 2) { setSuggestions([]); return; }
    setSuggestions(EU_REALMS.filter(r => r.toLowerCase().includes(realmInput.toLowerCase())).slice(0, 8));
  }, [realmInput]);

  const handleSearch = async () => {
    if (!charName.trim() || !realm) return;
    setLoading(true); 
    setError(""); 
    setTab("overview");
    
    try {
      const data = await fetchCharacterProfile(charName, realm);
      setProfile(data);

      setTimeout(() => {
        if (window.$WowheadPower) window.$WowheadPower.refreshLinks();
      }, 100);
    } catch (e) { 
      setError(e.message); 
      setProfile({ character: null, media: null, equipment: null, stats: null, mythicPlus: null, raidProg: null });
    } finally { 
      setLoading(false); 
    }
  };

  const { character, media, equipment, stats, mythicPlus, raidProg } = profile;

  const cc = character ? (CLASS_COLORS[character.character_class?.name] || CLASS_COLORS.default) : C.accent;
  const fc = character ? (FACTION_COLORS[character.faction?.name] || C.accent) : C.accent;
  const art = media?.assets?.find(a => a.key === "main-raw") || media?.assets?.find(a => a.key === "main") || media?.assets?.[0];
  
  const equipMap = {};
  equipment?.equipped_items?.forEach(i => { equipMap[i.slot?.type] = i; });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: C.bg, minHeight: "100vh", color: C.text, fontSize: 13 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }
        ::placeholder { color: ${C.textDim}; }
        .search-input-top {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 10px 12px; color: ${C.text}; font-family: inherit; font-size: 13px;
          outline: none; transition: border-color 0.15s, background 0.15s, transform 0.15s;
        }
        .search-input-top:focus { border-color: ${C.accent}; background: rgba(255,255,255,0.06); transform: translateY(-1px); }
        .search-btn-top {
          background: linear-gradient(135deg, ${C.accent} 0%, #00b4d8 100%); color: #fff; border: none; border-radius: 12px;
          padding: 10px 20px; font-family: inherit; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: transform 0.15s, opacity 0.15s, box-shadow 0.15s; white-space: nowrap; box-shadow: 0 10px 24px rgba(74, 158, 255, 0.22);
        }
        .search-btn-top:hover { transform: translateY(-1px); opacity: 0.95; }
        .search-btn-top:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .tab { background: rgba(255,255,255,0.02); border: 1px solid transparent; border-radius: 999px; color: ${C.textMuted}; font-family: inherit; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 14px; cursor: pointer; transition: all 0.15s ease; margin-right: 8px; }
        .tab:hover { color: ${C.text}; background: rgba(255,255,255,0.05); }
        .tab.active { color: #fff; background: linear-gradient(135deg, ${C.accent} 0%, #00b4d8 100%); border-color: transparent; box-shadow: 0 10px 24px rgba(74, 158, 255, 0.2); }
        .suggestion { padding: 8px 12px; font-size: 12px; cursor: pointer; color: ${C.textMuted}; transition: background 0.1s, color 0.1s; border-radius: 8px; }
        .suggestion:hover { background: rgba(255,255,255,0.06); color: ${C.text}; }
        .hero-card { background: linear-gradient(135deg, rgba(15, 20, 32, 0.96) 0%, rgba(10, 14, 24, 0.92) 100%); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: 0 24px 80px rgba(0,0,0,0.4); }
        .metric-chip { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 14px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
      `}</style>

      <div style={{ background: "linear-gradient(135deg, rgba(13, 17, 27, 0.98) 0%, rgba(8, 12, 20, 0.98) 100%)", borderBottom: `1px solid rgba(255,255,255,0.08)`, padding: "0 20px", display: "flex", alignItems: "center", height: 60, gap: 24, boxShadow: "0 14px 40px rgba(0,0,0,0.22)" }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>
          <span style={{ color: C.accent }}>⚔</span> AzerothLens
        </div>
        <div style={{ fontSize: 11, color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>EU Region · Character Lookup</div>
        <div style={{ flex: 1 }} />
      </div>

      {character && (
        <div style={{ background: "rgba(255,255,255,0.02)", borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "12px 20px" }} className="fade-in">
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input className="search-input-top" placeholder="Character name" value={charName}
              onChange={e => setCharName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ width: 200 }} />
            <div style={{ position: "relative" }}>
              <input className="search-input-top" placeholder="Realm" value={realmInput}
                style={{ width: 220 }}
                onChange={e => { setRealmInput(e.target.value); setRealm(""); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => e.key === "Enter" && realm && handleSearch()} />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, width: 220, background: "rgba(8, 12, 18, 0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0 0 12px 12px", zIndex: 100, maxHeight: 240, overflowY: "auto", padding: "6px", marginTop: 6, boxShadow: "0 12px 35px rgba(0,0,0,0.24)" }}>
                  {suggestions.map(r => (
                    <div key={r} className="suggestion" onMouseDown={() => { setRealm(r); setRealmInput(r); setSuggestions([]); }}>{r}</div>
                  ))}
                </div>
              )}
            </div>
            <button className="search-btn-top" onClick={handleSearch} disabled={!charName.trim() || !realm || loading}>
              {loading ? "Searching..." : "Search"}
            </button>
            {realm && !loading && <span style={{ fontSize: 11, color: C.textDim }}>✓ {realm} · EU</span>}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "20px 16px 60px" }}>
        {error && <div style={{ background: "#1a0808", border: "1px solid #4a1515", borderRadius: 4, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#e07070" }}>⚠ {error}</div>}

        {!character && !loading && !error && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "82px 20px 120px", position: "relative" }}>
            <div style={{ position: "absolute", width: "620px", height: "620px", background: "radial-gradient(circle, rgba(141, 62, 230, 0.16) 0%, transparent 68%)", top: "20%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, pointerEvents: "none" }} />

            <h1 style={{ position: "relative", zIndex: 1, fontSize: "36px", fontWeight: 900, color: "#ffffff", marginBottom: "12px", letterSpacing: "-0.03em", textAlign: "center" }}>
              LOOK INTO YOUR WORLD OF WARCRAFT CHARACTER
            </h1>

            <p style={{ position: "relative", zIndex: 1, fontSize: "14px", color: "#7e8ba3", marginBottom: "34px", textAlign: "center", maxWidth: "500px", lineHeight: "1.6" }}>
              Inspect item levels, attributes, and dynamic mythic or raid insights inside a sleek tactical command center.
            </p>

            <div className="hero-card" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", padding: "10px", borderRadius: "20px", width: "100%", maxWidth: "720px", marginBottom: "20px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "6px 12px" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#4d5870", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Character</label>
                <input placeholder="Enter name..." value={charName} onChange={e => setCharName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} style={{ background: "transparent", border: "none", color: "#ffffff", fontFamily: "inherit", fontSize: "15px", fontWeight: 500, outline: "none", width: "100%" }} />
              </div>

              <div style={{ width: "1px", height: "36px", background: "rgba(255,255,255,0.08)", margin: "0 8px" }} />

              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "6px 12px", position: "relative" }}>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#4d5870", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Realm</label>
                <input placeholder="Select EU Realm..." value={realmInput} onChange={e => { setRealmInput(e.target.value); setRealm(""); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} onKeyDown={e => e.key === "Enter" && realm && handleSearch()} style={{ background: "transparent", border: "none", color: "#ffffff", fontFamily: "inherit", fontSize: "15px", fontWeight: 500, outline: "none", width: "100%" }} />

                {showSuggestions && suggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 16px)", left: "-12px", right: "-12px", background: "rgba(8, 12, 18, 0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", zIndex: 100, maxHeight: "220px", overflowY: "auto", boxShadow: "0 18px 50px rgba(0,0,0,0.5)", padding: "6px" }}>
                    {suggestions.map(r => (
                      <div key={r} className="suggestion" onMouseDown={() => { setRealm(r); setRealmInput(r); setSuggestions([]); }} style={{ padding: "10px 14px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>{r}</div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSearch} disabled={!charName.trim() || !realm || loading} style={{ background: "linear-gradient(135deg, #8d3ee6 0%, #00b4d8 100%)", color: "#ffffff", border: "none", borderRadius: "14px", padding: "14px 24px", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s ease", boxShadow: "0 10px 28px rgba(141, 62, 230, 0.26)", opacity: (!charName.trim() || !realm || loading) ? 0.35 : 1, alignSelf: "stretch", display: "flex", alignItems: "center" }}>
                <span>{loading ? "Scanning..." : "Analyze"}</span>
              </button>
            </div>

            {realm && !loading && (
              <span className="fade-in" style={{ fontSize: "12px", color: "#00b4d8", marginBottom: "20px", fontWeight: 600, letterSpacing: "0.02em" }}>
                Target Confirmed: {realm} (EU Region)
              </span>
            )}

            <div style={{ marginTop: "56px", width: "100%", maxWidth: "860px", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08))" }} />
                <h2 style={{ fontSize: "11px", fontWeight: 700, color: "#4d5870", letterSpacing: "0.15em", textTransform: "uppercase" }}>Class & Specialization Build Indexes</h2>
                <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                {CLASS_GUIDES.map(c => (
                  <div key={c.class} style={{ background: "rgba(17, 22, 34, 0.45)", border: "1px solid rgba(255,255,255,0.04)", borderLeft: `3px solid ${c.color}`, borderRadius: "12px", padding: "16px", backdropFilter: "blur(10px)" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: c.color, marginBottom: "10px", letterSpacing: "-0.01em" }}>{c.class}</div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {c.specs.map(spec => {
                        const specSlug = spec.name.toLowerCase().replace(" ", "-");
                        const targetUrl = `https://www.wowhead.com/guide/classes/${c.slug}/${specSlug}/overview-pve-${spec.role}`;

                        return (
                          <a key={spec.name} href={targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", fontWeight: 600, color: "#7e8ba3", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "999px", padding: "6px 10px", textDecoration: "none", transition: "all 0.15s ease" }} onMouseEnter={e => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = c.color; }} onMouseLeave={e => { e.currentTarget.style.color = "#7e8ba3"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}>
                            {spec.name}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="spinner" style={{ width: 28, height: 28, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", margin: "0 auto 16px" }} />
            <div style={{ fontSize: 12, color: C.textMuted }}>Fetching character data...</div>
          </div>
        )}

        {character && !loading && (
          <div className="fade-in">
            <div style={{ display: "grid", gridTemplateColumns: art ? "1.2fr 240px" : "1fr", background: "linear-gradient(135deg, rgba(24, 28, 36, 0.96) 0%, rgba(9, 12, 18, 0.95) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ padding: "24px 24px 22px", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${cc}22 0%, transparent 40%)`, pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: cc, letterSpacing: "-0.02em", lineHeight: 1 }}>{character.name}</h1>
                    <Badge color={fc}>{character.faction?.name}</Badge>
                    {character.guild && <span style={{ fontSize: 12, color: C.textMuted }}>&lt;{character.guild.name}&gt;</span>}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
                    Level {character.level} {character.race?.name} {character.active_spec?.name} {character.character_class?.name} — {character.realm?.name} · EU
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                      { label: "Item Level", value: character.equipped_item_level || "—", sub: `avg ${character.average_item_level}` },
                      { label: "Achievement Pts", value: character.achievement_points?.toLocaleString() || "—" },
                      { label: "Last Seen", value: character.last_login_timestamp ? new Date(character.last_login_timestamp).toLocaleDateString("en-GB") : "—" },
                    ].map(s => (
                      <div key={s.label} className="metric-chip">
                        <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1 }}>{s.value}</div>
                        {s.sub && <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{s.sub}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {art && (
                <div style={{ position: "relative", overflow: "hidden", minHeight: 180 }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7, 9, 14, 0.3) 0%, transparent 30%)", zIndex: 1 }} />
                  <img src={art.value} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}>
              {[["overview","Overview"],["gear","Equipment"],["stats","Statistics"]].map(([id, label]) => (
                <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            {tab === "overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
                <Panel>
                  <PanelHeader accent={cc}>Character Info</PanelHeader>
                  {[
                    ["Name", character.name, cc],
                    ["Class", character.character_class?.name, cc],
                    ["Specialization", character.active_spec?.name],
                    ["Race", character.race?.name],
                    ["Faction", character.faction?.name, fc],
                    ["Realm", character.realm?.name],
                    ["Average ilvl", character.average_item_level],
                    ["Equipped ilvl", character.equipped_item_level],
                  ].filter(([, v]) => v).map(([l, v, c]) => <StatRow key={l} label={l} value={v} valueColor={c} />)}
                </Panel>

                <Panel>
                  <PanelHeader accent="#a335ee">Endgame Activity</PanelHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>Mythic+ Rating</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: mythicPlus?.current_mythic_rating?.rating > 0 ? "#a335ee" : C.textDim }}>
                      {mythicPlus?.current_mythic_rating?.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  {raidProg?.expansions?.length > 0 ? (
                    raidProg.expansions[raidProg.expansions.length - 1].instances.map(raid => {
                      const highestDiff = raid.modes?.reduce((prev, curr) => (curr.progress?.completed_count > 0 ? curr : prev), raid.modes[0]);
                      return (
                        <ProgressRow 
                          key={raid.instance?.name}
                          label={`${raid.instance?.name} (${highestDiff?.mode?.name || "Normal"})`}
                          current={highestDiff?.progress?.completed_count || 0}
                          max={highestDiff?.progress?.total_count || 0}
                          color={highestDiff?.mode?.name === "Mythic" ? "#ff8000" : "#a335ee"}
                        />
                      );
                    })
                  ) : (
                    <div style={{ padding: 14, fontSize: 12, color: C.textDim, fontStyle: "italic" }}>No recent raid progress found.</div>
                  )}
                </Panel>

                {stats && (
                  <Panel>
                    <PanelHeader accent={C.accent}>Primary Stats</PanelHeader>
                    {[
                      ["Strength", stats.strength?.effective],
                      ["Agility", stats.agility?.effective],
                      ["Intellect", stats.intellect?.effective],
                      ["Stamina", stats.stamina?.effective],
                      ["Max Health", stats.health?.toLocaleString()],
                    ].filter(([,v]) => v).map(([l,v]) => <StatRow key={l} label={l} value={v} />)}
                  </Panel>
                )}
              </div>
            )}

            {tab === "gear" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 12 }}>
                <Panel>
                  <PanelHeader accent={cc}>Equipped Gear</PanelHeader>
                  {SLOTS.slice(0,8).map(slot => <ItemRow key={slot} slot={slot} item={equipMap[slot]} />)}
                </Panel>
                <Panel>
                  <PanelHeader accent={cc}>Equipped Gear (cont.)</PanelHeader>
                  {SLOTS.slice(8).map(slot => <ItemRow key={slot} slot={slot} item={equipMap[slot]} />)}
                </Panel>
              </div>
            )}

            {tab === "stats" && stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {[
                  { title: "Attributes", color: C.accent, items: [["Strength", stats.strength?.effective], ["Agility", stats.agility?.effective], ["Intellect", stats.intellect?.effective], ["Stamina", stats.stamina?.effective]] },
                  { title: "Offense", color: "#e63c3c", items: [["Attack Power", stats.attack_power], ["Spell Power", stats.spell_power], ["Crit", stats.spell_crit_rating?.value?.toFixed(2)+"%"], ["Haste", stats.spell_haste_rating?.value?.toFixed(2)+"%"], ["Mastery", stats.mastery?.value?.toFixed(2)+"%"], ["Versatility", stats.versatility_damage_done_bonus?.toFixed(2)+"%"]] },
                  { title: "Defense", color: "#5fa8e0", items: [["Armor", stats.armor?.effective], ["Dodge", stats.dodge?.value?.toFixed(2)+"%"], ["Parry", stats.parry?.value?.toFixed(2)+"%"], ["Block", stats.block?.value?.toFixed(2)+"%"], ["Avoidance", stats.avoidance?.value?.toFixed(2)+"%"], ["Leech", stats.lifesteal?.value?.toFixed(2)+"%"]] },
                ].map(group => (
                  <Panel key={group.title}>
                    <PanelHeader accent={group.color}>{group.title}</PanelHeader>
                    {group.items.filter(([,v]) => v && v !== "undefined%").map(([l,v]) => <StatRow key={l} label={l} value={v} valueColor={group.color} />)}
                  </Panel>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}