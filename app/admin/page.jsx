"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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

const emptyProject = { id: null, title: "", description: "", stack: "", link: "", sort_order: 0 };
const emptyCert = { id: null, name: "", organization: "", cert_date: "", credential_url: "", sort_order: 0 };

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
  const [traffic, setTraffic] = useState({ total: 0, today: 0, last7: 0, last30: 0, byPath: {}, last14Days: [] });

  const [projectForm, setProjectForm] = useState(emptyProject);
  const [certForm, setCertForm] = useState(emptyCert);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/admin/login");
      } else {
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
    const start7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const start30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    const { count: total } = await supabase.from("page_views").select("*", { count: "exact", head: true });
    const { data: recentRows } = await supabase
      .from("page_views")
      .select("path, created_at")
      .gte("created_at", start30.toISOString());

    const rows = recentRows ?? [];
    const today = rows.filter((r) => new Date(r.created_at) >= startToday).length;
    const last7 = rows.filter((r) => new Date(r.created_at) >= start7).length;

    const byPath = {};
    rows.forEach((r) => { byPath[r.path] = (byPath[r.path] || 0) + 1; });

    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      last14Days.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }
    rows.forEach((r) => {
      const key = new Date(r.created_at).toISOString().slice(0, 10);
      const day = last14Days.find((d) => d.date === key);
      if (day) day.count += 1;
    });

    setTraffic({ total: total ?? 0, today, last7, last30: rows.length, byPath, last14Days });
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
    const payload = {
      title: projectForm.title,
      description: projectForm.description,
      stack: projectForm.stack.split(",").map((s) => s.trim()).filter(Boolean),
      link: projectForm.link || null,
      sort_order: Number(projectForm.sort_order) || 0,
    };
    if (projectForm.id) {
      await supabase.from("projects").update(payload).eq("id", projectForm.id);
    } else {
      await supabase.from("projects").insert(payload);
    }
    setProjectForm(emptyProject);
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
      sort_order: p.sort_order,
    });
    setShowProjectForm(true);
  }

  async function deleteProject(id) {
    if (!confirm("Supprimer ce projet ?")) return;
    await supabase.from("projects").delete().eq("id", id);
    loadAll();
  }

  // --- Certifications ---
  async function submitCert(e) {
    e.preventDefault();
    const payload = {
      name: certForm.name,
      organization: certForm.organization,
      cert_date: certForm.cert_date || null,
      credential_url: certForm.credential_url || null,
      sort_order: Number(certForm.sort_order) || 0,
    };
    if (certForm.id) {
      await supabase.from("certifications").update(payload).eq("id", certForm.id);
    } else {
      await supabase.from("certifications").insert(payload);
    }
    setCertForm(emptyCert);
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
      sort_order: c.sort_order,
    });
    setShowCertForm(true);
  }

  async function deleteCert(id) {
    if (!confirm("Supprimer cette certification ?")) return;
    await supabase.from("certifications").delete().eq("id", id);
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
    <div className="font-mono min-h-screen" style={{ backgroundColor: palette.bg, color: palette.text }}>
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
        <div className="max-w-2xl mx-auto flex gap-1 p-1 rounded" style={{ backgroundColor: palette.panel, border: `1px solid ${palette.border}` }}>
          {TABS.map((t) => {
            const count = t.key === "messages" ? messages.length : t.key === "projects" ? projects.length : certifications.length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 text-sm py-2 rounded transition-colors"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total", value: traffic.total },
                { label: "Aujourd'hui", value: traffic.today },
                { label: "7 derniers jours", value: traffic.last7 },
                { label: "30 derniers jours", value: traffic.last30 },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded" style={{ border: `1px solid ${palette.border}` }}>
                  <p className="text-2xl font-semibold" style={{ color: palette.green }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: palette.muted }}>{s.label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs mb-3" style={{ color: palette.muted }}>Visites — 14 derniers jours</p>
            <div className="flex items-end gap-1.5 h-32 mb-10">
              {traffic.last14Days.map((d) => {
                const max = Math.max(1, ...traffic.last14Days.map((x) => x.count));
                const height = Math.max(2, (d.count / max) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date} : ${d.count}`}>
                    <div
                      className="w-full rounded-sm"
                      style={{ height: `${height}%`, backgroundColor: d.count > 0 ? palette.green : palette.border, minHeight: 2 }}
                    />
                    <span className="text-[10px]" style={{ color: palette.muted }}>{d.date.slice(8, 10)}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs mb-3" style={{ color: palette.muted }}>Répartition par page (30 derniers jours)</p>
            <div className="flex flex-col gap-2">
              {Object.keys(traffic.byPath).length === 0 && (
                <p className="text-sm" style={{ color: palette.muted }}>Pas encore de données.</p>
              )}
              {Object.entries(traffic.byPath).sort((a, b) => b[1] - a[1]).map(([path, count]) => (
                <div key={path} className="flex items-center justify-between p-3 rounded" style={{ border: `1px solid ${palette.border}` }}>
                  <span className="text-sm" style={{ color: palette.cyan }}>{path}</span>
                  <span className="text-sm">{count}</span>
                </div>
              ))}
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
              <div key={m.id} className="p-4 rounded" style={{ border: `1px solid ${palette.border}` }}>
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
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded"
                style={{ backgroundColor: palette.green, color: palette.bg }}
              >
                <Plus size={16} /> Ajouter un projet
              </button>
            )}

            {showProjectForm && (
              <form onSubmit={submitProject} className="p-4 rounded mb-6 flex flex-col gap-4" style={{ border: `1px solid ${palette.border}` }}>
                <p className="text-sm font-medium">{projectForm.id ? "Modifier le projet" : "Nouveau projet"}</p>

                <Field label="Titre">
                  <input
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    required
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Stack (séparée par des virgules)">
                  <input
                    placeholder="React, Node.js, PostgreSQL"
                    value={projectForm.stack}
                    onChange={(e) => setProjectForm({ ...projectForm, stack: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Lien (GitHub, démo, ou chemin interne comme /jardin-idle)">
                  <input
                    value={projectForm.link}
                    onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Ordre d'affichage (0 = premier)">
                  <input
                    type="number"
                    value={projectForm.sort_order}
                    onChange={(e) => setProjectForm({ ...projectForm, sort_order: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none w-32"
                    style={inputStyle}
                  />
                </Field>

                <div className="flex gap-3 mt-2">
                  <button type="submit" className="px-4 py-2 text-sm font-medium rounded" style={{ backgroundColor: palette.green, color: palette.bg }}>
                    {projectForm.id ? "Enregistrer" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setProjectForm(emptyProject); setShowProjectForm(false); }}
                    className="text-xs"
                    style={{ color: palette.muted }}
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
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-3 rounded" style={{ border: `1px solid ${palette.border}` }}>
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs" style={{ color: palette.muted }}>{(p.stack || []).join(" · ")}</p>
                  </div>
                  <div className="flex gap-4 text-xs shrink-0">
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
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded"
                style={{ backgroundColor: palette.green, color: palette.bg }}
              >
                <Plus size={16} /> Ajouter une certification
              </button>
            )}

            {showCertForm && (
              <form onSubmit={submitCert} className="p-4 rounded mb-6 flex flex-col gap-4" style={{ border: `1px solid ${palette.border}` }}>
                <p className="text-sm font-medium">{certForm.id ? "Modifier la certification" : "Nouvelle certification"}</p>

                <Field label="Nom de la certification">
                  <input
                    required
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Organisme">
                  <input
                    value={certForm.organization}
                    onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Date d'obtention">
                  <input
                    type="date"
                    value={certForm.cert_date}
                    onChange={(e) => setCertForm({ ...certForm, cert_date: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Lien vers le badge/certificat">
                  <input
                    value={certForm.credential_url}
                    onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Ordre d'affichage (0 = premier)">
                  <input
                    type="number"
                    value={certForm.sort_order}
                    onChange={(e) => setCertForm({ ...certForm, sort_order: e.target.value })}
                    className="px-3 py-2 text-sm rounded outline-none w-32"
                    style={inputStyle}
                  />
                </Field>

                <div className="flex gap-3 mt-2">
                  <button type="submit" className="px-4 py-2 text-sm font-medium rounded" style={{ backgroundColor: palette.green, color: palette.bg }}>
                    {certForm.id ? "Enregistrer" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCertForm(emptyCert); setShowCertForm(false); }}
                    className="text-xs"
                    style={{ color: palette.muted }}
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
              {certifications.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 p-3 rounded" style={{ border: `1px solid ${palette.border}` }}>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs" style={{ color: palette.muted }}>{c.organization}</p>
                  </div>
                  <div className="flex gap-4 text-xs shrink-0">
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
