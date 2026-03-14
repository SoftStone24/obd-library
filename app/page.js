"use client";
import { supabase } from '../lib/supabase';
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

const CAMPAIGNS = ["Brand Refresh", "App Launch", "Campaign AW24", "Social Kit", "Rebranding Q2"];
const TAGS = ["Typography", "UI/UX", "Mood", "Visual", "Color", "Motion"];
const avatarColors = { Minh: "#e94560", Lan: "#64b5f6", Tuan: "#ffd54f", You: "#81c784" };

const tagAccents = {
  Typography: "#f5c518", "UI/UX": "#64b5f6", Mood: "#e94560",
  Visual: "#a78bfa", Color: "#f97316", Motion: "#34d399"
};

function TrashIcon({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>
  );
}

function ConfirmDelete({ message, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 40
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111115", border: "1px solid #3a1a1e",
        width: "100%", maxWidth: 360, padding: 28, animation: "slideUp 0.18s ease"
      }}>
        <div style={{ fontSize: 18, marginBottom: 12 }}>⚠</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Delete this?</div>
        <div style={{ fontSize: 11, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{
            flex: 1, background: "none", border: "1px solid #222",
            color: "#666", padding: "9px", fontSize: 10, fontFamily: "inherit", cursor: "pointer"
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, background: "#e94560", border: "none",
            color: "#fff", padding: "9px", fontSize: 10, fontFamily: "inherit",
            cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase"
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function StackPreview({ pins }) {
  const preview = pins.slice(0, 4);
  if (preview.length === 0) return (
    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a2a2e", fontSize: 10, letterSpacing: "0.15em" }}>EMPTY</div>
  );
  return (
    <div style={{ position: "relative", width: "100%", height: 180 }}>
      {preview.map((pin, i) => {
        const offsets = [
          { rotate: -6, x: -10, y: 6, z: 0 },
          { rotate: -2, x: -4, y: 3, z: 1 },
          { rotate: 2,  x: 4,  y: 1, z: 2 },
          { rotate: 0,  x: 0,  y: 0, z: 3 },
        ];
        const o = offsets[i % 4];
        return (
          <div key={pin.id} style={{
            position: "absolute", inset: 0,
            transform: `rotate(${o.rotate}deg) translate(${o.x}px, ${o.y}px)`,
            zIndex: o.z, border: "2px solid #1e1e24", overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
          }}>
            <img src={pin.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => e.target.style.background = "#222"} />
          </div>
        );
      })}
    </div>
  );
}

function GroupCard({ group, onClick, onDelete }) {
  const accent = tagAccents[group.tag] || "#e94560";
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111115", border: `1px solid ${hovered ? accent + "55" : "#1e1e24"}`,
        cursor: "pointer", transition: "all 0.2s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${accent}22` : "none",
        display: "flex", flexDirection: "column", position: "relative"
      }}>
      {hovered && (
        <button onClick={e => { e.stopPropagation(); onDelete(group); }} style={{
          position: "absolute", top: 8, right: 8, zIndex: 10,
          background: "rgba(0,0,0,0.75)", border: "1px solid #3a1a1e",
          color: "#e94560", width: 26, height: 26, display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          backdropFilter: "blur(4px)"
        }}>
          <TrashIcon size={11} color="#e94560" />
        </button>
      )}
      <div onClick={onClick} style={{ padding: "14px 14px 10px", position: "relative" }}>
        <StackPreview pins={group.pins} />
        {group.pins.length > 4 && (
          <div style={{
            position: "absolute", bottom: 18, right: 18,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
            padding: "3px 8px", fontSize: 9, color: "#aaa", letterSpacing: "0.1em"
          }}>+{group.pins.length - 4} more</div>
        )}
      </div>
      <div onClick={onClick} style={{ padding: "12px 14px 14px", borderTop: "1px solid #1a1a1e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#e8e8e8", lineHeight: 1.3, flex: 1, marginRight: 8 }}>{group.name}</div>
          <span style={{ background: accent + "18", color: accent, fontSize: 8, padding: "3px 7px", letterSpacing: "0.15em", textTransform: "uppercase", whiteSpace: "nowrap", border: `1px solid ${accent}33` }}>{group.tag}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{group.campaign}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: avatarColors[group.creator] || "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#000" }}>{(group.creator || "?")[0]}</div>
            <span style={{ fontSize: 9, color: "#333" }}>{group.pins.length} pins</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function RefBoard() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [activeCampaign, setActiveCampaign] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", campaign: "", tag: "Mood" });
  const [confirmGroup, setConfirmGroup] = useState(null);

  // ── Load groups + pins from Supabase on mount ──
  useEffect(() => {
    async function loadGroups() {
      const { data: groupData, error: gErr } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: pinData, error: pErr } = await supabase
        .from('pins')
        .select('*')
        .order('created_at', { ascending: true });

      if (!gErr && !pErr) {
        const grouped = groupData.map(g => ({
          ...g,
          pins: pinData.filter(p => p.group_id === g.id)
        }));
        setGroups(grouped);
      }
      setLoading(false);
    }
    loadGroups();
  }, []);

  const filtered = groups.filter(g => {
    const matchTag = activeTag === "All" || g.tag === activeTag;
    const matchCampaign = activeCampaign === "All" || g.campaign === activeCampaign;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.campaign || "").toLowerCase().includes(search.toLowerCase());
    return matchTag && matchCampaign && matchSearch;
  });

  // ── Delete group from Supabase + state ──
  const handleDeleteGroup = async (group) => {
    await supabase.from('groups').delete().eq('id', group.id);
    setGroups(prev => prev.filter(g => g.id !== group.id));
    setConfirmGroup(null);
  };

  // ── Create group in Supabase + state ──
  const handleCreateGroup = async () => {
    if (!newGroup.name) return;
    const { data, error } = await supabase
      .from('groups')
      .insert([{ name: newGroup.name, campaign: newGroup.campaign, tag: newGroup.tag, creator: "You" }])
      .select()
      .single();
    if (!error) {
      setGroups(prev => [{ ...data, pins: [] }, ...prev]);
      setNewGroup({ name: "", campaign: "", tag: "Mood" });
      setShowCreate(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0e", fontFamily: "'BlenderPro', monospace", color: "#e8e8e8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; background: #0c0c0e; }
        ::-webkit-scrollbar-thumb { background: #2a2a2e; }
        .filter-select { background: #111115; color: #888; border: 1px solid #1e1e24; padding: 5px 10px; font-family: inherit; font-size: 10px; cursor: pointer; outline: none; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <header style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 32px", borderBottom: "1px solid #1a1a1e", position: "sticky", top: 0, zIndex: 100, background: "#0c0c0e" }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            OBD<span style={{ color: "#e94560" }}>.</span>LIBRARY
          </span>
        </div>
        <div style={{ flex: 1, maxWidth: 320, margin: "0 16px", display: "flex", alignItems: "center", background: "#111115", border: "1px solid #1e1e24", padding: "7px 12px", gap: 8 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search groups..."
            style={{ background: "none", border: "none", outline: "none", color: "#e8e8e8", fontSize: 11, fontFamily: "inherit", flex: 1 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <span style={{ fontSize: 9, color: "#333" }}>{filtered.length} groups</span>
          <button onClick={() => setShowCreate(true)} style={{ background: "transparent", border: "1px solid #e94560", color: "#e94560", padding: "6px 14px", fontSize: 10, fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>+ New Group</button>
        </div>
      </header>

      <>
        <div style={{ padding: "12px 32px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #111118", flexWrap: "wrap" }}>
          {["All", ...TAGS].map(t => {
            const accent = tagAccents[t];
            const active = activeTag === t;
            return (
              <button key={t} onClick={() => setActiveTag(t)} style={{ padding: "4px 10px", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer", background: active ? (accent || "#e94560") + "22" : "transparent", color: active ? (accent || "#e94560") : "#444", border: active ? `1px solid ${accent || "#e94560"}44` : "1px solid #1a1a1e", transition: "all 0.15s" }}>{t}</button>
            );
          })}
          <div style={{ width: 1, height: 14, background: "#1e1e24" }} />
          <select className="filter-select" value={activeCampaign} onChange={e => setActiveCampaign(e.target.value)}>
            <option value="All">All Campaigns</option>
            {CAMPAIGNS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#333" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading...</div>
          </div>
        ) : (
          <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {filtered.map(group => (
              <GroupCard key={group.id} group={group} onClick={() => router.push(`/groups/${group.id}`)} onDelete={g => setConfirmGroup(g)} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px", color: "#2a2a2e" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>◻</div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>No groups yet — create one!</div>
          </div>
        )}
      </>

      {confirmGroup && (
        <ConfirmDelete
          message={`"${confirmGroup.name}" and all its pins will be permanently deleted.`}
          onConfirm={() => handleDeleteGroup(confirmGroup)}
          onCancel={() => setConfirmGroup(null)}
        />
      )}

      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111115", border: "1px solid #2a2a2e", width: "100%", maxWidth: 420, padding: 28, animation: "slideUp 0.2s ease" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 22, color: "#fff" }}>
              New Group<span style={{ color: "#e94560" }}>.</span>
            </div>
            {[
              { label: "GROUP NAME", key: "name", placeholder: "e.g. Dark Editorial Refs" },
              { label: "CAMPAIGN", key: "campaign", placeholder: "e.g. Brand Refresh 2025" }
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.2em", marginBottom: 6 }}>{label}</div>
                <input value={newGroup[key]} onChange={e => setNewGroup(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  style={{ width: "100%", background: "#151518", border: "1px solid #1e1e24", color: "#e8e8e8", padding: "8px 12px", fontSize: 11, fontFamily: "inherit", outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.2em", marginBottom: 8 }}>MOOD / TAG</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TAGS.map(t => {
                  const acc = tagAccents[t];
                  const active = newGroup.tag === t;
                  return (
                    <button key={t} onClick={() => setNewGroup(p => ({ ...p, tag: t }))} style={{ padding: "4px 10px", fontSize: 9, fontFamily: "inherit", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", background: active ? acc + "22" : "transparent", color: active ? acc : "#444", border: active ? `1px solid ${acc}55` : "1px solid #1e1e24", transition: "all 0.15s" }}>{t}</button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, background: "none", border: "1px solid #1e1e24", color: "#555", padding: "9px", fontSize: 10, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCreateGroup} style={{ flex: 2, background: newGroup.name ? "#e94560" : "#1e1a1a", border: "none", color: newGroup.name ? "#fff" : "#444", padding: "9px", fontSize: 10, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>Create Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}