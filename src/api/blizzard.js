const CLIENT_ID = import.meta.env.VITE_BLIZZARD_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_BLIZZARD_CLIENT_SECRET;
const REGION = "eu";
const LOCALE = "en_GB";

export function slugify(str) {
  return str.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/'/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing .env credentials — check your VITE_BLIZZARD settings.");
  }
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  
  const res = await fetch(`https://${REGION}.battle.net/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(encodeURIComponent(CLIENT_ID) + ":" + encodeURIComponent(CLIENT_SECRET)),
    },
    body: params,
  });
  if (!res.ok) throw new Error(`Auth failed (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

async function wowFetch(path, token, namespace) {
  const url = `https://${REGION}.api.blizzard.com${path}?namespace=${namespace}&locale=${LOCALE}`;
  const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function fetchCharacterProfile(characterName, realmName) {
  const token = await getAccessToken();
  const slug = slugify(realmName);
  const name = characterName.trim().toLowerCase();
  const ns = `profile-${REGION}`;
  const base = `/profile/wow/character/${slug}/${name}`;

  const [char, med, equip, st, mplus, raid] = await Promise.allSettled([
    wowFetch(base, token, ns),
    wowFetch(`${base}/character-media`, token, ns),
    wowFetch(`${base}/equipment`, token, ns),
    wowFetch(`${base}/statistics`, token, ns),
    wowFetch(`${base}/mythic-keystone-profile`, token, ns),
    wowFetch(`${base}/raid-progression`, token, ns),
  ]);

  if (char.status === "rejected") {
    throw new Error(char.reason.message.includes("404") 
      ? `"${characterName}" not found on ${realmName}.` 
      : `Error: ${char.reason.message}`
    );
  }

  return {
    character: char.value,
    media: med.status === "fulfilled" ? med.value : null,
    equipment: equip.status === "fulfilled" ? equip.value : null,
    stats: st.status === "fulfilled" ? st.value : null,
    mythicPlus: mplus.status === "fulfilled" ? mplus.value : null,
    raidProg: raid.status === "fulfilled" ? raid.value : null,
  };
}