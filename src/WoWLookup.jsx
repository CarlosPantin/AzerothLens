import { useState, useEffect } from "react";
import { C, CLASS_COLORS, FACTION_COLORS, SLOTS } from "./constants/colors";
import { EU_REALMS } from "./constants/realms";
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderLight}; }
        ::placeholder { color: ${C.textDim}; }
        .search-input {
          background: ${C.bgAlt}; border: 1px solid ${C.border}; border-radius: 3px;
          padding: 8px 12px; color: ${C.text}; font-family: inherit; font-size: 13px;
          outline: none; transition: border-color 0.15s;
        }
        .search-input:focus { border-color: ${C.accent}; }
        .search-btn {
          background: ${C.accent}; color: #fff; border: none; border-radius: 3px;
          padding: 8px 20px; font-family: inherit; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
        }
        .search-btn:hover { opacity: 0.85; }
        .search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tab { background: none; border: none; border-bottom: 2px solid transparent; color: ${C.textMuted}; font-family: inherit; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 16px; cursor: pointer; transition: color 0.15s, border-color 0.15s; }
        .tab:hover { color: ${C.text}; }
        .tab.active { color: ${C.accent}; border-bottom-color: ${C.accent}; }
        .suggestion { padding: 7px 12px; font-size: 12px; cursor: pointer; color: ${C.textMuted}; transition: background 0.1s, color 0.1s; }
        .suggestion:hover { background: ${C.panelHover}; color: ${C.text}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.7s linear infinite; }
      `}</style>

      {/* Top Navigation */}
      <div style={{ background: C.header, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", height: 44, gap: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.01em" }}>
          <span style={{ color: C.accent }}>⚔</span> AzerothLens
        </div>
        <div style={{ fontSize: 11, color: C.textDim, letterSpacing: "0.06em" }}>EU REGION · CHARACTER LOOKUP</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: C.textDim }}>Powered by Battle.net API</div>
      </div>

      {/* Search Layout Section */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: "10px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input className="search-input" placeholder="Character name" value={charName}
            onChange={e => setCharName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{ width: 200 }} />
          <div style={{ position: "relative" }}>
            <input className="search-input" placeholder="Realm" value={realmInput}
              style={{ width: 220 }}
              onChange={e => { setRealmInput(e.target.value); setRealm(""); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={e => e.key === "Enter" && realm && handleSearch()} />
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: 220, background: C.panel, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 3px 3px", zIndex: 100, maxHeight: 240, overflowY: "auto" }}>
                {suggestions.map(r => (
                  <div key={r} className="suggestion" onMouseDown={() => { setRealm(r); setRealmInput(r); setSuggestions([]); }}>{r}</div>
                ))}
              </div>
            )}
          </div>
          <button className="search-btn" onClick={handleSearch} disabled={!charName.trim() || !realm || loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          {realm && !loading && <span style={{ fontSize: 11, color: C.textDim }}>✓ {realm} · EU</span>}
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "20px 16px 60px" }}>
        {error && <div style={{ background: "#1a0808", border: "1px solid #4a1515", borderRadius: 4, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#e07070" }}>⚠ {error}</div>}

        {!character && !loading && !error && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚔</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>WoW Character Lookup</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 32 }}>Enter a character name and EU realm above to get started.</div>
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
            {/* Profile banner header block */}
            <div style={{ display: "grid", gridTemplateColumns: art ? "1fr 240px" : "1fr", background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: 16, borderLeft: `3px solid ${cc}` }}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: cc, letterSpacing: "-0.02em", lineHeight: 1 }}>{character.name}</h1>
                  <Badge color={fc}>{character.faction?.name}</Badge>
                  {character.guild && <span style={{ fontSize: 12, color: C.textMuted }}>&lt;{character.guild.name}&gt;</span>}
                </div>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
                  Level {character.level} {character.race?.name} {character.active_spec?.name} {character.character_class?.name} — {character.realm?.name} · EU
                </div>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[
                    { label: "Item Level", value: character.equipped_item_level || "—", sub: `avg ${character.average_item_level}` },
                    { label: "Achievement Pts", value: character.achievement_points?.toLocaleString() || "—" },
                    { label: "Last Seen", value: character.last_login_timestamp ? new Date(character.last_login_timestamp).toLocaleDateString("en-GB") : "—" },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1 }}>{s.value}</div>
                      {s.sub && <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{s.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
              {art && (
                <div style={{ position: "relative", overflow: "hidden", minHeight: 160 }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #181c24 0%, transparent 30%)", zIndex: 1 }} />
                  <img src={art.value} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
                </div>
              )}
            </div>

            {/* Profile Navigation Tabs */}
            <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 16, display: "flex" }}>
              {[["overview","Overview"],["gear","Equipment"],["stats","Statistics"]].map(([id, label]) => (
                <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            {/* Tab Panes */}
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