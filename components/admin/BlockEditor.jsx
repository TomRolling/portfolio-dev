"use client";

import { useRef } from "react";
import { ArrowUp, ArrowDown, Trash2, Heading, Type, Image as ImageIcon, Film, FileText, Bold, Underline, Link2 } from "lucide-react";

const palette = {
  bg: "#2E3440",
  border: "#434C5E",
  text: "#E5E9F0",
  muted: "#9AA5B1",
  green: "#A3BE8C",
  red: "#BF616A",
};

const inputStyle = {
  backgroundColor: palette.bg,
  border: `1px solid ${palette.border}`,
  color: palette.text,
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs" style={{ color: palette.muted }}>{label}</span>
      {children}
    </label>
  );
}

const blockMetaByType = {
  heading: { label: "Titre", Icon: Heading },
  paragraph: { label: "Texte", Icon: Type },
  image: { label: "Image", Icon: ImageIcon },
  video: { label: "Vidéo", Icon: Film },
  pdf: { label: "PDF", Icon: FileText },
};

const FILE_BLOCK_TYPES = ["image", "video", "pdf"];

const COLOR_OPTIONS = [
  { hex: "#A3BE8C", label: "Vert" },
  { hex: "#88C0D0", label: "Cyan" },
  { hex: "#E5E9F0", label: "Blanc" },
  { hex: "#9AA5B1", label: "Gris" },
  { hex: "#EBCB8B", label: "Jaune" },
  { hex: "#BF616A", label: "Rouge" },
];

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px]" style={{ color: palette.muted }}>Couleur :</span>
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c.hex}
          type="button"
          title={c.label}
          onClick={() => onChange(c.hex)}
          className="w-5 h-5 rounded-full"
          style={{
            backgroundColor: c.hex,
            border: value === c.hex ? `2px solid ${palette.text}` : `1px solid ${palette.border}`,
          }}
        />
      ))}
      <input
        type="color"
        value={value || "#A3BE8C"}
        onChange={(e) => onChange(e.target.value)}
        title="Couleur personnalisée"
        className="w-5 h-5 rounded-lg overflow-hidden cursor-pointer"
        style={{ border: `1px solid ${palette.border}`, padding: 0, backgroundColor: "transparent" }}
      />
    </div>
  );
}

// Editeur de blocs reordonnables : titre, texte (avec mise en forme), image, video.
// `blocks` et `onChange(newBlocks)` sont controles par le parent (formulaire projet ou certification).
export default function BlockEditor({ blocks, onChange }) {
  const textareaRefs = useRef({});

  function addBlock(type) {
    const base = { type, text: "", url: "" };
    if (type === "heading") base.color = "#A3BE8C";
    onChange([...blocks, base]);
  }

  function updateBlock(index, patch) {
    onChange(blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function removeBlock(index) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function wrapSelection(index, before, after, placeholder) {
    const el = textareaRefs.current[index];
    const value = blocks[index].text || "";
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || placeholder;
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    updateBlock(index, { text: newValue });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function applyLink(index) {
    const url = window.prompt("Lien vers quelle adresse ?");
    if (!url) return;
    wrapSelection(index, "[", `](${url})`, "texte du lien");
  }

  return (
    <div>
      <span className="text-xs block mb-2" style={{ color: palette.muted }}>
        Contenu de la fiche (dans l'ordre où tu les ajoutes)
      </span>

      <div className="flex flex-col gap-3 mb-3">
        {blocks.map((block, i) => {
          const meta = blockMetaByType[block.type];
          return (
            <div key={i} className="admin-card p-3.5 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.bg }}>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: palette.green }}>
                  <meta.Icon size={13} /> {meta.label}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" className="admin-icon-btn" onClick={() => moveBlock(i, -1)} disabled={i === 0} style={{ color: i === 0 ? palette.border : palette.muted }}>
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" className="admin-icon-btn" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} style={{ color: i === blocks.length - 1 ? palette.border : palette.muted }}>
                    <ArrowDown size={13} />
                  </button>
                  <button type="button" className="admin-icon-btn" onClick={() => removeBlock(i)} style={{ color: palette.red }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {block.type === "heading" && (
                <div>
                  <input
                    placeholder="Texte du titre"
                    value={block.text}
                    onChange={(e) => updateBlock(i, { text: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                    style={{ ...inputStyle, color: block.color || palette.green }}
                  />
                  <ColorPicker value={block.color} onChange={(color) => updateBlock(i, { color })} />
                </div>
              )}

              {block.type === "paragraph" && (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <button type="button" onClick={() => wrapSelection(i, "**", "**", "texte en gras")} className="admin-icon-btn" style={{ color: palette.text }} title="Gras">
                      <Bold size={13} />
                    </button>
                    <button type="button" onClick={() => wrapSelection(i, "__", "__", "texte souligné")} className="admin-icon-btn" style={{ color: palette.text }} title="Souligné">
                      <Underline size={13} />
                    </button>
                    <button type="button" onClick={() => applyLink(i)} className="admin-icon-btn" style={{ color: palette.text }} title="Lien">
                      <Link2 size={13} />
                    </button>
                    <span className="text-[10px] ml-1" style={{ color: palette.muted }}>sélectionne du texte puis clique</span>
                  </div>
                  <textarea
                    ref={(el) => (textareaRefs.current[i] = el)}
                    placeholder="Texte du paragraphe"
                    rows={3}
                    value={block.text}
                    onChange={(e) => updateBlock(i, { text: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                  <ColorPicker value={block.color} onChange={(color) => updateBlock(i, { color })} />
                </div>
              )}

              {block.type === "image" && (
                <div>
                  {(block.url || block.file) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={block.file ? URL.createObjectURL(block.file) : block.url}
                      alt=""
                      className="w-full max-h-40 object-cover rounded-lg mb-2"
                      style={{ border: `1px solid ${palette.border}` }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateBlock(i, { file: e.target.files?.[0] || null })}
                    className="text-xs"
                    style={{ color: palette.muted }}
                  />
                </div>
              )}

              {block.type === "pdf" && (
                <div className="flex flex-col gap-2">
                  {block.file ? (
                    <p className="text-xs" style={{ color: palette.green }}>Fichier sélectionné : {block.file.name}</p>
                  ) : block.url ? (
                    <a href={block.url} target="_blank" rel="noreferrer" className="text-xs truncate" style={{ color: palette.muted }}>{block.url}</a>
                  ) : null}
                  <Field label="Envoyer un fichier PDF">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        const guessedLabel = file ? file.name.replace(/\.pdf$/i, "") : "";
                        updateBlock(i, { file, text: block.text || guessedLabel });
                      }}
                      className="text-xs"
                      style={{ color: palette.muted }}
                    />
                  </Field>
                  <Field label="Nom affiché du document (optionnel)">
                    <input
                      placeholder="Attestation de suivi"
                      value={block.text || ""}
                      onChange={(e) => updateBlock(i, { text: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                  {block.file && (
                    <button type="button" onClick={() => updateBlock(i, { file: null })} className="text-xs self-start" style={{ color: palette.red }}>
                      Retirer le fichier
                    </button>
                  )}
                </div>
              )}

              {block.type === "video" && (
                <div className="flex flex-col gap-2">
                  {block.file ? (
                    <p className="text-xs" style={{ color: palette.green }}>Fichier sélectionné : {block.file.name}</p>
                  ) : block.url ? (
                    <p className="text-xs truncate" style={{ color: palette.muted }}>{block.url}</p>
                  ) : null}
                  <Field label="Lien YouTube ou Vimeo">
                    <input
                      placeholder="https://youtube.com/watch?v=..."
                      value={block.file ? "" : block.url}
                      disabled={Boolean(block.file)}
                      onChange={(e) => updateBlock(i, { url: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                  <span className="text-[10px] text-center" style={{ color: palette.muted }}>— ou —</span>
                  <Field label="Envoyer un fichier vidéo (.mp4)">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => updateBlock(i, { file: e.target.files?.[0] || null, url: "" })}
                      className="text-xs"
                      style={{ color: palette.muted }}
                    />
                  </Field>
                  {block.file && (
                    <button type="button" onClick={() => updateBlock(i, { file: null })} className="text-xs self-start" style={{ color: palette.red }}>
                      Retirer le fichier
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => addBlock("heading")} className="admin-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg" style={{ border: `1px solid ${palette.border}`, color: palette.text }}>
          <Heading size={13} /> Titre
        </button>
        <button type="button" onClick={() => addBlock("paragraph")} className="admin-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg" style={{ border: `1px solid ${palette.border}`, color: palette.text }}>
          <Type size={13} /> Texte
        </button>
        <button type="button" onClick={() => addBlock("image")} className="admin-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg" style={{ border: `1px solid ${palette.border}`, color: palette.text }}>
          <ImageIcon size={13} /> Image
        </button>
        <button type="button" onClick={() => addBlock("video")} className="admin-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg" style={{ border: `1px solid ${palette.border}`, color: palette.text }}>
          <Film size={13} /> Vidéo
        </button>
        <button type="button" onClick={() => addBlock("pdf")} className="admin-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg" style={{ border: `1px solid ${palette.border}`, color: palette.text }}>
          <FileText size={13} /> PDF
        </button>
      </div>
    </div>
  );
}

// Convertit les blocs "image"/"vidéo"/"PDF" ayant un fichier en attente en URL réelle
// (upload vers Supabase Storage), pour préparer l'enregistrement en base.
export async function resolveBlocks(blocks, supabase) {
  const resolved = [];
  for (const block of blocks) {
    if (FILE_BLOCK_TYPES.includes(block.type)) {
      let url = block.url || "";
      if (block.file) {
        const path = `${Date.now()}-${block.file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const { error } = await supabase.storage.from("project-images").upload(path, block.file);
        if (!error) url = supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl;
      }
      // le PDF garde en plus son libellé d'affichage
      resolved.push(block.type === "pdf" ? { type: "pdf", url, text: block.text || "" } : { type: block.type, url });
    } else {
      resolved.push({ type: block.type, text: block.text || "", color: block.color || null });
    }
  }
  return resolved;
}
