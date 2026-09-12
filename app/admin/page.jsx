"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BlockEditor, { resolveBlocks } from "@/components/admin/BlockEditor";
import { ensureAdminDevice, isAdminDevice, setAdminDevice } from "@/lib/tracking";

const palette = {
  bg: "#2E3440",
  panel: "#333947",
  border: "#434C5E",
  text: "#E5E9F0",
  muted: "#9AA5B1",
  green: "#A3BE8C",
  red: "#BF616A",
  cyan: "#88C0D0",
};

const inputStyle = {
  backgroundColor: palette.bg,
  border: `1px solid ${palette.border}`,
  color: palette.text,
};

const adminStyleSheet = `
  .admin-theme input:not([type=file]), .admin-theme textarea {
    transition: border-color .15s ease, box-shadow .15s ease;
  }
  .admin-theme input:not([type=file]):focus, .admin-theme textarea:focus {
    outline: none;
    border-color: ${palette.green} !important;
    box-shadow: 0 0 0 3px rgba(163,190,140,0.15);
  }
  .admin-theme input[type=file] {
    font-size: 12px;
    color: ${palette.muted};
  }
  .admin-theme input[type=file]::file-selector-button {
    background: ${palette.bg};
    color: ${palette.text};
    border: 1px solid ${palette.border};
    border-radius: 8px;
    padding: 7px 12px;
    font-size: 12px;
    font-family: inherit;
    margin-right: 10px;
    cursor: pointer;
    transition: background-color .15s ease, border-color .15s ease;
  }
  .admin-theme input[type=file]::file-selector-button:hover {
    background: ${palette.panel};
    border-color: ${palette.green};
  }
  .admin-btn-primary {
    transition: filter .15s ease, transform .15s ease, box-shadow .15s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .admin-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .admin-btn-primary:disabled { opacity: 0.6; cursor: default; }
  .admin-btn-ghost {
    transition: background-color .15s ease, border-color .15s ease, color .15s ease;
  }
  .admin-btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: ${palette.green}; color: ${palette.text} !important; }
  .admin-icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 7px;
    transition: background-color .15s ease, color .15s ease;
  }
  .admin-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: ${palette.text} !important; }
  .admin-icon-btn:disabled { cursor: default; }
  .admin-card {
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
    transition: border-color .15s ease;
  }
  .admin-row {
    transition: border-color .15s ease, background-color .15s ease;
  }
  .admin-row:hover { border-color: ${palette.border} !important; background: rgba(255,255,255,0.02); }
  .admin-pill {
    transition: background-color .15s ease, border-color .15s ease, color .15s ease;
  }
  .admin-pill:hover { background: rgba(163,190,140,0.12); border-color: ${palette.green} !important; color: ${palette.green} !important; }
  .admin-tab {
    transition: background-color .15s ease, color .15s ease;
  }
`;

const emptyProject = {
  id: null,
  title: "",
  description: "",
  stack: "",
  link: "",
  linkLabel: "",
  slug: "",
  blocks: [],
  sort_order: 0,
  legacyImages: [],
  legacyContent: "",
  legacyVideoUrl: "",
};
const emptyCert = {
  id: null,
  name: "",
  organization: "",
  cert_date: "",
  credential_url: "",
  linkLabel: "",
  slug: "",
  blocks: [],
  sort_order: 0,
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TABS = [
  { key: "traffic", label: "Trafic" },
  { key: "messages", label: "Messages" },
  { key: "projects", label: "Projets" },
  { key: "certifications", label: "Certifications" },
];

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs" style={{ color: palette.muted }}>{label}</span>
      {children}
    </label>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("traffic");

  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [traffic, setTraffic] = useState({ total: 0, today: 0, yesterday: 0, last7: 0, prev7: 0, weekOverWeek: null, avgPerDay: 0, last30: 0, byPath: {}, byCountry: {}, last30Days: [] });

  const [projectForm, setProjectForm] = useState(emptyProject);
  const [certForm, setCertForm] = useState(emptyCert);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selfExcluded, setSelfExcluded] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
      } else {
        // Détenir une session admin marque l'appareil comme étant le tien, sauf si
        // tu as explicitement choisi l'inverse dans l'onglet Trafic.
        ensureAdminDevice();
        setSelfExcluded(isAdminDevice());
        setChecking(false);
        loadAll();
      }
    });
  }, []);

  async function loadAll() {
    const { data: p } = await supabase.from("projects").select("*").order("sort_order");
    const { data: c } = await supabase.from("certifications").select("*").order("sort_order");
    const { data: m } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setProjects(p ?? []);
    setCertifications(c ?? []);
    setMessages(m ?? []);
    loadTraffic();
  }

  async function loadTraffic() {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startYesterday = new Date(startToday.getTime() - 24 * 3600 * 1000);
    const start7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const start14 = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
    const start30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    const { count: total } = await supabase.from("page_views").select("*", { count: "exact", head: true });
    const { data: recentRows } = await supabase
      .from("page_views")
      .select("path, country, city, created_at")
      .gte("created_at", start30.toISOString());

    const rows = recentRows ?? [];
    const today = rows.filter((r) => new Date(r.created_at) >= startToday).length;
    const yesterday = rows.filter((r) => new Date(r.created_at) >= startYesterday && new Date(r.created_at) < startToday).length;
    const last7 = rows.filter((r) => new Date(r.created_at) >= start7).length;
    const prev7 = rows.filter((r) => new Date(r.created_at) >= start14 && new Date(r.created_at) < start7).length;
    const weekOverWeek = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;
    const avgPerDay = Math.round((rows.length / 30) * 10) / 10;

    const byPath = {};
    rows.forEach((r) => { byPath[r.path] = (byPath[r.path] || 0) + 1; });

    const byCountry = {};
    rows.forEach((r) => {
      const key = r.country || "Inconnu";
      byCountry[key] = (byCountry[key] || 0) + 1;
    });

    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      last30Days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    rows.forEach((r) => {
      const key = new Date(r.created_at).toISOString().slice(0, 10);
      const day = last30Days.find((d) => d.date === key);
      if (day) day.count += 1;
    });

    setTraffic({ total: total ?? 0, today, yesterday, last7, prev7, weekOverWeek, avgPerDay, last30: rows.length, byPath, byCountry, last30Days });
  }

  function toggleSelfExclusion() {
    const next = !selfExcluded;
    setAdminDevice(next);
    // on relit le stockage : s'il est indisponible, la bascule n'a pas pris effet
    setSelfExcluded(isAdminDevice());
  }

  async function deleteMessage(id) {
    if (!confirm("Supprimer ce message ?")) return;
    await supabase.from("messages").delete().eq("id", id);
    loadAll();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  // --- Projets ---
  async function submitProject(e) {
    e.preventDefault();
    setUploading(true);

    const resolvedBlocks = await resolveBlocks(projectForm.blocks, supabase);

    const payload = {
      title: projectForm.title,
      description: projectForm.description,
      stack: projectForm.stack.split(",").map((s) => s.trim()).filter(Boolean),
      link: projectForm.link || null,
      link_label: projectForm.linkLabel || "En savoir plus",
      slug: projectForm.slug ? slugify(projectForm.slug) : slugify(projectForm.title),
      blocks: resolvedBlocks,
      sort_order: projectForm.id ? projectForm.sort_order : projects.length,
    };
    if (projectForm.id) {
      await supabase.from("projects").update(payload).eq("id", projectForm.id);
    } else {
      await supabase.from("projects").insert(payload);
    }
    setProjectForm(emptyProject);
    setUploading(false);
    setShowProjectForm(false);
    loadAll();
  }

  function editProject(p) {
    setProjectForm({
      id: p.id,
      title: p.title,
      description: p.description,
      stack: (p.stack || []).join(", "),
      link: p.link || "",
      linkLabel: p.link_label || "",
      slug: p.slug || "",
      blocks: Array.isArray(p.blocks) ? p.blocks : [],
      sort_order: p.sort_order,
      legacyImages: p.images || [],
      legacyContent: p.content || "",
      legacyVideoUrl: p.video_url || "",
    });
    setShowProjectForm(true);
  }

  async function clearLegacyContent(id) {
    if (!confirm("Supprimer ces anciennes données (image, texte, vidéo pré-éditeur de blocs) ?")) return;
    await supabase.from("projects").update({ images: [], content: "", video_url: null }).eq("id", id);
    setProjectForm({ ...projectForm, legacyImages: [], legacyContent: "", legacyVideoUrl: "" });
    loadAll();
  }

  async function deleteProject(id) {
    if (!confirm("Supprimer ce projet ?")) return;
    await supabase.from("projects").delete().eq("id", id);
    loadAll();
  }

  async function moveProject(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= projects.length) return;
    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await Promise.all(reordered.map((p, i) => supabase.from("projects").update({ sort_order: i }).eq("id", p.id)));
    loadAll();
  }

  // --- Certifications ---
  async function submitCert(e) {
    e.preventDefault();
    setUploading(true);

    const resolvedBlocks = await resolveBlocks(certForm.blocks, supabase);

    const payload = {
      name: certForm.name,
      organization: certForm.organization,
      cert_date: certForm.cert_date || null,
      credential_url: certForm.credential_url || null,
      link_label: certForm.linkLabel || "Voir le badge",
      slug: certForm.slug ? slugify(certForm.slug) : slugify(certForm.name),
      blocks: resolvedBlocks,
      sort_order: certForm.id ? certForm.sort_order : certifications.length,
    };
    if (certForm.id) {
      await supabase.from("certifications").update(payload).eq("id", certForm.id);
    } else {
      await supabase.from("certifications").insert(payload);
    }
    setCertForm(emptyCert);
    setUploading(false);
    setShowCertForm(false);
    loadAll();
  }

  function editCert(c) {
    setCertForm({
      id: c.id,
      name: c.name,
      organization: c.organization,
      cert_date: c.cert_date || "",
      credential_url: c.credential_url || "",
      linkLabel: c.link_label || "",
      slug: c.slug || "",
      blocks: Array.isArray(c.blocks) ? c.blocks : [],
      sort_order: c.sort_order,
    });
    setShowCertForm(true);
  }

  async function deleteCert(id) {
    if (!confirm("Supprimer cette certification ?")) return;
    await supabase.from("certifications").delete().eq("id", id);
    loadAll();
  }

  async function moveCert(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= certifications.length) return;
    const reordered = [...certifications];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await Promise.all(reordered.map((c, i) => supabase.from("certifications").update({ sort_order: i }).eq("id", c.id)));
    loadAll();
  }

  if (checking) {
    return (
      <div className="font-mono min-h-screen flex items-center justify-center" style={{ backgroundColor: palette.bg, color: palette.muted }}>
        Vérification de la session...
      </div>
    );
  }

  return (
    <div className="font-mono min-h-screen admin-theme" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <style>{adminStyleSheet}</style>
      {/* Barre du haut */}
      <div className="sticky top-0 z-10 px-6 py-4 md:px-12" style={{ backgroundColor: palette.panel, borderBottom: `1px solid ${palette.border}` }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-base font-semibold">
            <span style={{ color: palette.green }}>$ </span>admin
          </h1>
          <button onClick={handleLogout} className="text-xs" style={{ color: palette.muted }}>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="px-6 md:px-12 pt-6">
        <div className="admin-card max-w-2xl mx-auto flex gap-1 p-1 rounded-lg" style={{ backgroundColor: palette.panel, border: `1px solid ${palette.border}` }}>
          {TABS.map((t) => {
            const count = t.key === "messages" ? messages.length : t.key === "projects" ? projects.length : certifications.length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="admin-tab flex-1 text-sm py-2 rounded-lg"
                style={{
                  backgroundColor: active ? palette.bg : "transparent",
                  color: active ? palette.text : palette.muted,
                }}
              >
                {t.label} {count > 0 && <span style={{ color: active ? palette.green : palette.muted }}>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-12 py-8">
        {/* Trafic */}
        {tab === "traffic" && (
          <div>
            {/* Tes propres visites sont exclues du comptage depuis cet appareil */}
            <div className="admin-card flex items-center justify-between gap-3 p-3 mb-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
              <span className="text-xs" style={{ color: palette.muted }}>
                {selfExcluded
                  ? "Tes visites depuis cet appareil ne sont pas comptées."
                  : "Tes visites depuis cet appareil sont comptées comme celles des autres."}
              </span>
              <button
                type="button"
                onClick={toggleSelfExclusion}
                className="admin-pill shrink-0 px-3 py-1.5 text-xs rounded-lg"
                style={{ border: `1px solid ${palette.border}`, color: palette.text }}
              >
                {selfExcluded ? "Les compter" : "Les exclure"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Total", value: traffic.total },
                { label: "Aujourd'hui", value: traffic.today },
                { label: "Hier", value: traffic.yesterday },
                { label: "Moyenne / jour (30j)", value: traffic.avgPerDay },
              ].map((s) => (
                <div key={s.label} className="admin-card p-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                  <p className="text-2xl font-semibold" style={{ color: palette.green }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: palette.muted }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="admin-card p-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <p className="text-2xl font-semibold" style={{ color: palette.green }}>{traffic.last7}</p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>7 derniers jours</p>
              </div>
              <div className="admin-card p-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <p className="text-2xl font-semibold" style={{ color: palette.green }}>{traffic.last30}</p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>30 derniers jours</p>
              </div>
              <div className="admin-card p-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <p className="text-2xl font-semibold" style={{ color: traffic.weekOverWeek === null ? palette.muted : traffic.weekOverWeek >= 0 ? palette.green : palette.red }}>
                  {traffic.weekOverWeek === null ? "—" : `${traffic.weekOverWeek > 0 ? "+" : ""}${traffic.weekOverWeek}%`}
                </p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>vs semaine précédente ({traffic.prev7})</p>
              </div>
              <div className="admin-card p-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <p className="text-2xl font-semibold" style={{ color: palette.green }}>{Object.keys(traffic.byPath).length}</p>
                <p className="text-xs mt-1" style={{ color: palette.muted }}>pages visitées (30j)</p>
              </div>
            </div>

            <p className="text-xs mb-3" style={{ color: palette.muted }}>Visites — 30 derniers jours</p>
            <div className="flex items-end gap-1 h-40 mb-10 overflow-x-auto">
              {traffic.last30Days.map((d) => {
                const max = Math.max(1, ...traffic.last30Days.map((x) => x.count));
                const height = d.count > 0 ? Math.max(6, (d.count / max) * 100) : 3;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 h-full" style={{ minWidth: 10 }} title={`${d.date} : ${d.count} visite${d.count > 1 ? "s" : ""}`}>
                    {d.count > 0 && d.count === max && (
                      <span className="text-[9px] font-medium" style={{ color: palette.green }}>{d.count}</span>
                    )}
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${height}%`,
                        backgroundColor: d.count > 0 ? palette.green : palette.border,
                        opacity: d.count > 0 ? 1 : 0.4,
                        minHeight: 2,
                      }}
                    />
                    <span className="text-[9px]" style={{ color: palette.muted }}>{d.date.slice(8, 10)}</span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs mb-3" style={{ color: palette.muted }}>Répartition par page (30 derniers jours)</p>
                <div className="flex flex-col gap-2">
                  {Object.keys(traffic.byPath).length === 0 && (
                    <p className="text-sm" style={{ color: palette.muted }}>Pas encore de données.</p>
                  )}
                  {Object.entries(traffic.byPath).sort((a, b) => b[1] - a[1]).map(([path, count]) => {
                    const maxCount = Math.max(...Object.values(traffic.byPath));
                    const pct = Math.round((count / maxCount) * 100);
                    return (
                      <div key={path} className="admin-row relative overflow-hidden flex items-center justify-between p-3 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                        <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, backgroundColor: "rgba(163,190,140,0.10)" }} />
                        <span className="relative text-sm" style={{ color: palette.cyan }}>{path}</span>
                        <span className="relative text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs mb-3" style={{ color: palette.muted }}>Répartition par pays (30 derniers jours)</p>
                <div className="flex flex-col gap-2">
                  {Object.keys(traffic.byCountry).length === 0 && (
                    <p className="text-sm" style={{ color: palette.muted }}>Pas encore de données.</p>
                  )}
                  {Object.entries(traffic.byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => {
                    const maxCount = Math.max(...Object.values(traffic.byCountry));
                    const pct = Math.round((count / maxCount) * 100);
                    return (
                      <div key={country} className="admin-row relative overflow-hidden flex items-center justify-between p-3 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                        <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, backgroundColor: "rgba(136,192,208,0.10)" }} />
                        <span className="relative text-sm" style={{ color: palette.cyan }}>{country}</span>
                        <span className="relative text-sm">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {tab === "messages" && (
          <div className="flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-sm" style={{ color: palette.muted }}>Aucun message pour le moment.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="admin-row p-4 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <div className="flex items-start justify-between mb-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs" style={{ color: palette.cyan }}>{m.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <span className="text-xs" style={{ color: palette.muted }}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={() => deleteMessage(m.id)} className="text-xs" style={{ color: palette.red }}>
                      Supprimer
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: palette.text }}>{m.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projets */}
        {tab === "projects" && (
          <div>
            {!showProjectForm && (
              <button
                onClick={() => { setProjectForm(emptyProject); setShowProjectForm(true); }}
                className="admin-btn-primary mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                style={{ backgroundColor: palette.green, color: palette.bg }}
              >
                <Plus size={16} /> Ajouter un projet
              </button>
            )}

            {showProjectForm && (
              <form onSubmit={submitProject} className="admin-card p-5 rounded-lg mb-6 flex flex-col gap-4" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <p className="text-sm font-medium">{projectForm.id ? "Modifier le projet" : "Nouveau projet"}</p>

                <Field label="Titre">
                  <input
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Description courte (affichée sur l'accueil)">
                  <textarea
                    required
                    rows={2}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Stack (séparée par des virgules)">
                  <input
                    placeholder="React, Node.js, PostgreSQL"
                    value={projectForm.stack}
                    onChange={(e) => setProjectForm({ ...projectForm, stack: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                {(projectForm.legacyImages.length > 0 || projectForm.legacyContent || projectForm.legacyVideoUrl) && (
                  <div className="admin-card p-3.5 rounded-lg" style={{ border: `1px solid ${palette.red}`, backgroundColor: palette.bg }}>
                    <p className="text-xs font-medium mb-2" style={{ color: palette.red }}>
                      Anciennes données détectées (d'avant l'éditeur de blocs, invisibles sur la fiche tant que tu as des blocs)
                    </p>
                    {projectForm.legacyImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {projectForm.legacyImages.map((url) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={url} src={url} alt="" className="w-16 h-16 object-cover rounded-lg" style={{ border: `1px solid ${palette.border}` }} />
                        ))}
                      </div>
                    )}
                    {projectForm.legacyContent && (
                      <p className="text-xs mb-2" style={{ color: palette.muted }}>{projectForm.legacyContent}</p>
                    )}
                    {projectForm.legacyVideoUrl && (
                      <p className="text-xs mb-2 truncate" style={{ color: palette.muted }}>{projectForm.legacyVideoUrl}</p>
                    )}
                    <button type="button" onClick={() => clearLegacyContent(projectForm.id)} className="text-xs" style={{ color: palette.red }}>
                      Supprimer ces anciennes données
                    </button>
                  </div>
                )}

                <BlockEditor
                  blocks={projectForm.blocks}
                  onChange={(blocks) => setProjectForm({ ...projectForm, blocks })}
                />


                <div className="admin-card p-3.5 rounded-lg flex flex-col gap-3" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.bg }}>
                  <span className="text-xs font-medium" style={{ color: palette.green }}>Bouton en bas de la fiche</span>
                  <Field label="Texte du bouton (ex: 'Voir sur GitHub', 'Jouer au jeu')">
                    <input
                      placeholder="En savoir plus"
                      value={projectForm.linkLabel}
                      onChange={(e) => setProjectForm({ ...projectForm, linkLabel: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Lien vers lequel il pointe (GitHub, démo, ou chemin interne comme /jardin-idle)">
                    <input
                      placeholder="https://github.com/..."
                      value={projectForm.link}
                      onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="Adresse de la fiche (laisser vide pour la générer depuis le titre)">
                  <input
                    placeholder={projectForm.title ? slugify(projectForm.title) : "mon-projet"}
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <div className="flex gap-3 mt-2 items-center">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                    style={{ backgroundColor: palette.green, color: palette.bg }}
                  >
                    {uploading && <Loader2 size={14} className="animate-spin" />}
                    {uploading ? "Envoi..." : projectForm.id ? "Enregistrer" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProjectForm(emptyProject); setShowProjectForm(false); }}
                    className="admin-btn-ghost text-xs px-3 py-2 rounded-lg"
                    style={{ color: palette.muted, border: `1px solid transparent` }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {projects.length === 0 && (
                <p className="text-sm" style={{ color: palette.muted }}>Aucun projet pour le moment.</p>
              )}
              {projects.map((p, i) => (
                <div key={p.id} className="admin-row flex items-center justify-between gap-4 p-3 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <button onClick={() => moveProject(i, -1)} disabled={i === 0} style={{ color: i === 0 ? palette.border : palette.muted }}>
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => moveProject(i, 1)} disabled={i === projects.length - 1} style={{ color: i === projects.length - 1 ? palette.border : palette.muted }}>
                        <ArrowDown size={13} />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs" style={{ color: palette.muted }}>{(p.stack || []).join(" · ")}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs shrink-0">
                    {p.slug && (
                      <a href={`/projets/${p.slug}`} target="_blank" rel="noreferrer" style={{ color: palette.green }}>Voir</a>
                    )}
                    <button onClick={() => editProject(p)} style={{ color: palette.cyan }}>Modifier</button>
                    <button onClick={() => deleteProject(p.id)} style={{ color: palette.red }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {tab === "certifications" && (
          <div>
            {!showCertForm && (
              <button
                onClick={() => { setCertForm(emptyCert); setShowCertForm(true); }}
                className="admin-btn-primary mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                style={{ backgroundColor: palette.green, color: palette.bg }}
              >
                <Plus size={16} /> Ajouter une certification
              </button>
            )}

            {showCertForm && (
              <form onSubmit={submitCert} className="admin-card p-5 rounded-lg mb-6 flex flex-col gap-4" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                <p className="text-sm font-medium">{certForm.id ? "Modifier la certification" : "Nouvelle certification"}</p>

                <Field label="Nom de la certification">
                  <input
                    required
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Organisme">
                  <input
                    value={certForm.organization}
                    onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Date d'obtention">
                  <input
                    type="date"
                    value={certForm.cert_date}
                    onChange={(e) => setCertForm({ ...certForm, cert_date: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <BlockEditor
                  blocks={certForm.blocks}
                  onChange={(blocks) => setCertForm({ ...certForm, blocks })}
                />

                <div className="admin-card p-3.5 rounded-lg flex flex-col gap-3" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.bg }}>
                  <span className="text-xs font-medium" style={{ color: palette.green }}>Bouton en bas de la fiche</span>
                  <Field label="Texte du bouton (ex: 'Voir le badge', 'Voir le certificat')">
                    <input
                      placeholder="Voir le badge"
                      value={certForm.linkLabel}
                      onChange={(e) => setCertForm({ ...certForm, linkLabel: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Lien vers lequel il pointe (badge, certificat)">
                    <input
                      placeholder="https://..."
                      value={certForm.credential_url}
                      onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                      className="px-3 py-2 text-sm rounded-lg outline-none"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <Field label="Adresse de la fiche (laisser vide pour la générer depuis le nom)">
                  <input
                    placeholder={certForm.name ? slugify(certForm.name) : "ma-certification"}
                    value={certForm.slug}
                    onChange={(e) => setCertForm({ ...certForm, slug: e.target.value })}
                    className="px-3 py-2 text-sm rounded-lg outline-none"
                    style={inputStyle}
                  />
                </Field>

                <div className="flex gap-3 mt-2 items-center">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
                    style={{ backgroundColor: palette.green, color: palette.bg }}
                  >
                    {uploading && <Loader2 size={14} className="animate-spin" />}
                    {uploading ? "Envoi..." : certForm.id ? "Enregistrer" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCertForm(emptyCert); setShowCertForm(false); }}
                    className="admin-btn-ghost text-xs px-3 py-2 rounded-lg"
                    style={{ color: palette.muted, border: `1px solid transparent` }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-2">
              {certifications.length === 0 && (
                <p className="text-sm" style={{ color: palette.muted }}>Aucune certification pour le moment.</p>
              )}
              {certifications.map((c, i) => (
                <div key={c.id} className="admin-row flex items-center justify-between gap-4 p-3 rounded-lg" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panel }}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <button onClick={() => moveCert(i, -1)} disabled={i === 0} style={{ color: i === 0 ? palette.border : palette.muted }}>
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => moveCert(i, 1)} disabled={i === certifications.length - 1} style={{ color: i === certifications.length - 1 ? palette.border : palette.muted }}>
                        <ArrowDown size={13} />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs" style={{ color: palette.muted }}>{c.organization}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs shrink-0">
                    {c.slug && (
                      <a href={`/certifications/${c.slug}`} target="_blank" rel="noreferrer" style={{ color: palette.green }}>Voir</a>
                    )}
                    <button onClick={() => editCert(c)} style={{ color: palette.cyan }}>Modifier</button>
                    <button onClick={() => deleteCert(c.id)} style={{ color: palette.red }}>Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
