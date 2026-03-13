"use client";
import { supabase } from '../lib/supabase';
import { useState, useRef, useEffect } from "react";

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

function PinCard({ pin, onEnlarge, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        breakInside: "avoid", marginBottom: 10,
        position: "relative", overflow: "hidden",
        border: "1px solid #1e1e24", transition: "transform 0.15s ease",
        transform: hovered ? "scale(1.02)" : "scale(1)"
      }}>
      <img src={pin.image_url} alt="" onClick={onEnlarge}
        style={{ width: "100%", display: "block", cursor: "pointer" }}
        onError={e => { e.target.style.minHeight = "100px"; e.target.style.background = "#1a1a1e"; }} />
      {pin.note && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          padding: "16px 10px 8px", fontSize: 10, color: "#ccc", pointerEvents: "none"
        }}>{pin.note}</div>
      )}
      {hovered && (
        <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{
          position: "absolute", top: 6, right: 6,
          background: "rgba(0,0,0,0.75)", border: "1px solid #3a1a1e",
          color: "#e94560", width: 24, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(4px)"
        }}>
          <TrashIcon size={10} color="#e94560" />
        </button>
      )}
    </div>
  );
}

function GroupDetail({ group, onBack, onAddPin, onDeletePin }) {
  const accent = tagAccents[group.tag] || "#e94560";
  const [showAdd, setShowAdd] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [globalDrag, setGlobalDrag] = useState(false); // ← full page overlay
  const [enlarged, setEnlarged] = useState(null);
  const [pinSearch, setPinSearch] = useState("");
  const [confirmPin, setConfirmPin] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const fileRef = useRef();
  const dragCounter = useRef(0); // track enter/leave on nested elements

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map(f => ({ file: f, preview: URL.createObjectURL(f), note: "" }));
    setFiles(prev => [...prev, ...arr]);
  };

  // ── Global page drag listeners ──────────────────────────
  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault();
      // Only react to file drags, not element drags
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter.current += 1;
        if (dragCounter.current === 1) setGlobalDrag(true);
      }
    };
    const onDragLeave = (e) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) setGlobalDrag(false);
    };
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setGlobalDrag(false);
      const dropped = e.dataTransfer?.files;
      if (dropped?.length) {
        addFiles(dropped);
        setShowAdd(true);
      }
    };
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer?.files || e.target.files;
    if (dropped?.length) addFiles(dropped);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const updateNote = (i, note) => setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, note } : f));

  const visiblePins = pinSearch.trim()
    ? group.pins.filter(p => p.note?.toLowerCase().includes(pinSearch.toLowerCase()))
    : group.pins;

  const handleUploadAll = async () => {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const { file, note } = files[i];
      try {
        const filename = `${Date.now()}-${i}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('OBD Library')
          .upload(filename, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('OBD Library')
          .getPublicUrl(filename);
        const { data, error } = await supabase
          .from('pins')
          .insert([{ group_id: group.id, image_url: urlData.publicUrl, note }])
          .select().single();
        if (error) throw error;
        uploaded.push(data);
      } catch (err) {
        console.error(`Failed: ${file.name}`, err.message);
      }
      setUploadProgress({ done: i + 1, total: files.length });
    }
    uploaded.forEach(pin => onAddPin(group.id, pin));
    setFiles([]);
    setShowAdd(false);
    setUploading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0e" }}>

      {/* ── GLOBAL DRAG OVERLAY ── */}
      {globalDrag && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.85)",
          border: `3px dashed ${accent}`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 16, pointerEvents: "none",
          animation: "fadeIn 0.15s ease"
        }}>
          <div style={{ fontSize: 48 }}>↓</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Drop to add pins
          </div>
          <div style={{ fontSize: 12, color: accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {group.name}
          </div>
        </div>
      )}
      <div style={{ padding: "16px 32px", borderBottom: "1px solid #1a1a1e", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #222", color: "#666", padding: "6px 14px", fontSize: 10, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.1em" }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{group.name}</span>
            <span style={{ background: accent + "18", color: accent, fontSize: 9, padding: "3px 9px", letterSpacing: "0.15em", textTransform: "uppercase", border: `1px solid ${accent}44` }}>{group.tag}</span>
            <span style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{group.campaign}</span>
          </div>
          <div style={{ fontSize: 10, color: "#444", marginTop: 3 }}>
            {visiblePins.length}{pinSearch ? ` of ${group.pins.length}` : ""} pins · by {group.creator}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", background: "#111115", border: "1px solid #1e1e24", padding: "7px 12px", gap: 8, width: 200 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={pinSearch} onChange={e => setPinSearch(e.target.value)} placeholder="search pins..."
            style={{ background: "none", border: "none", outline: "none", color: "#e8e8e8", fontSize: 11, fontFamily: "inherit", flex: 1 }} />
          {pinSearch && <button onClick={() => setPinSearch("")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>}
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "transparent", border: `1px solid ${accent}`, color: accent, padding: "8px 18px", fontSize: 11, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>+ Add Pins</button>
      </div>

      {visiblePins.length > 0 ? (
        <div style={{ padding: "24px 32px", columns: "5 180px", columnGap: 10 }}>
          {visiblePins.map(pin => (
            <PinCard key={pin.id} pin={pin}
              onEnlarge={() => setEnlarged(pin)}
              onDelete={() => setConfirmPin(pin)} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "80px", color: "#2a2a2e" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>◻</div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>{pinSearch ? "No pins match your search" : "No pins yet — add one!"}</div>
        </div>
      )}

      {enlarged && (
        <div onClick={() => setEnlarged(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: "100%" }}>
            <img src={enlarged.image_url} alt="" style={{ width: "100%", display: "block", border: "1px solid #2a2a2e" }} />
            {enlarged.note && <div style={{ padding: "12px 0", fontSize: 12, color: "#888", fontFamily: "inherit" }}>{enlarged.note}</div>}
          </div>
        </div>
      )}

      {confirmPin && (
        <ConfirmDelete
          message="This pin will be permanently removed."
          onConfirm={() => { onDeletePin(group.id, confirmPin.id); setConfirmPin(null); }}
          onCancel={() => setConfirmPin(null)}
        />
      )}

      {showAdd && (
        <div onClick={() => { if (!uploading) { setShowAdd(false); setFiles([]); }}} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111115", border: "1px solid #2a2a2e", width: "100%", maxWidth: 620, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1a1a1e", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                Add Pins to <span style={{ color: accent }}>{group.name}</span>
              </div>
              {files.length > 0 && !uploading && (
                <span style={{ fontSize: 10, color: "#555" }}>{files.length} image{files.length > 1 ? "s" : ""} selected</span>
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current.click()}
              style={{ margin: "16px 24px 0", border: `2px dashed ${dragOver ? accent : "#2a2a2e"}`, padding: "20px", textAlign: "center", cursor: uploading ? "default" : "pointer", background: dragOver ? "#1a0e10" : "#0d0d10", transition: "all 0.2s" }}>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleDrop} />
              <div style={{ fontSize: 20, marginBottom: 6 }}>↑</div>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em" }}>DROP IMAGES OR CLICK TO SELECT</div>
              <div style={{ fontSize: 9, color: "#333", marginTop: 4 }}>You can select multiple images at once</div>
            </div>

            {/* Image previews list */}
            {files.length > 0 && (
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: "#0d0d10", border: "1px solid #1e1e24", padding: 10 }}>
                    <img src={f.preview} alt="" style={{ width: 60, height: 60, objectFit: "cover", flexShrink: 0, border: "1px solid #222" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "#666", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file.name}</div>
                      <input
                        value={f.note}
                        onChange={e => updateNote(i, e.target.value)}
                        placeholder="Note (optional)"
                        disabled={uploading}
                        style={{ width: "100%", background: "#151518", border: "1px solid #222", color: "#e8e8e8", padding: "6px 10px", fontSize: 10, fontFamily: "inherit", outline: "none" }}
                      />
                    </div>
                    {!uploading && (
                      <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, padding: "0 4px", flexShrink: 0 }}>×</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress bar */}
            {uploading && (
              <div style={{ padding: "12px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#666" }}>Uploading...</span>
                  <span style={{ fontSize: 10, color: accent }}>{uploadProgress.done} / {uploadProgress.total}</span>
                </div>
                <div style={{ background: "#1a1a1e", height: 3 }}>
                  <div style={{ background: accent, height: "100%", width: `${(uploadProgress.done / uploadProgress.total) * 100}%`, transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div style={{ padding: "12px 24px 20px", borderTop: "1px solid #1a1a1e", display: "flex", gap: 8 }}>
              <button onClick={() => { if (!uploading) { setShowAdd(false); setFiles([]); }}} disabled={uploading} style={{ flex: 1, background: "none", border: "1px solid #222", color: "#555", padding: "9px", fontSize: 10, fontFamily: "inherit", cursor: uploading ? "default" : "pointer" }}>Cancel</button>
              <button onClick={handleUploadAll} disabled={!files.length || uploading} style={{ flex: 2, background: files.length && !uploading ? accent : "#1e1a1a", border: "none", color: files.length && !uploading ? "#fff" : "#555", padding: "9px", fontSize: 10, fontFamily: "inherit", cursor: files.length && !uploading ? "pointer" : "default", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {uploading ? `Uploading ${uploadProgress.done}/${uploadProgress.total}...` : `Upload ${files.length > 0 ? files.length : ""} Pin${files.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RefBoard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [activeCampaign, setActiveCampaign] = useState("All");
  const [search, setSearch] = useState("");
  const [openGroup, setOpenGroup] = useState(null);
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

  const currentGroup = openGroup ? groups.find(g => g.id === openGroup) : null;

  const filtered = groups.filter(g => {
    const matchTag = activeTag === "All" || g.tag === activeTag;
    const matchCampaign = activeCampaign === "All" || g.campaign === activeCampaign;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.campaign || "").toLowerCase().includes(search.toLowerCase());
    return matchTag && matchCampaign && matchSearch;
  });

  // ── Add pin (already uploaded, just update state) ──
  const handleAddPin = (groupId, pin) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, pins: [...g.pins, pin] } : g));
  };

  // ── Delete pin from Supabase + state ──
  const handleDeletePin = async (groupId, pinId) => {
    await supabase.from('pins').delete().eq('id', pinId);
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, pins: g.pins.filter(p => p.id !== pinId) } : g
    ));
  };

  // ── Delete group from Supabase + state ──
  const handleDeleteGroup = async (group) => {
    await supabase.from('groups').delete().eq('id', group.id);
    setGroups(prev => prev.filter(g => g.id !== group.id));
    setConfirmGroup(null);
    if (openGroup === group.id) setOpenGroup(null);
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
    <div style={{ minHeight: "100vh", background: "#0c0c0e", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e8e8e8" }}>
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
        {!currentGroup && <>
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
        </>}
      </header>

      {currentGroup ? (
        <GroupDetail group={currentGroup} onBack={() => setOpenGroup(null)} onAddPin={handleAddPin} onDeletePin={handleDeletePin} />
      ) : (
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
                <GroupCard key={group.id} group={group} onClick={() => setOpenGroup(group.id)} onDelete={g => setConfirmGroup(g)} />
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
      )}

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