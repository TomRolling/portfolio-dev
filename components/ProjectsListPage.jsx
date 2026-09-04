"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { palette, styleSheet } from "@/lib/theme";
import { Reveal } from "@/components/Reveal";
import { SiteTopBar, SiteFooter } from "@/components/SiteChrome";
import PageViewTracker from "@/components/PageViewTracker";

export default function ProjectsListPage({ projects = [] }) {
  return (
    <div className="font-mono min-h-screen" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <style>{styleSheet}</style>
      <PageViewTracker path="/projets" />

      <SiteTopBar title="tomrolling.dev/projets" />

      <section className="px-6 md:px-12 pt-12 pb-20 max-w-2xl mx-auto">
        <a href="/" className="nav-link inline-flex items-center gap-2 text-xs mb-8">
          <ArrowLeft size={14} /> Retour à l'accueil
        </a>

        <Reveal>
          <h1 className="text-2xl md:text-3xl font-semibold mb-8">
            <span style={{ color: palette.green }}>$ </span>Projets
          </h1>
        </Reveal>

        <div className="flex flex-col gap-3">
          {projects.length === 0 && (
            <p className="text-sm py-6" style={{ color: palette.muted }}>Aucun projet pour le moment.</p>
          )}
          {projects.map((p) => {
            const detailHref = p.slug ? `/projets/${p.slug}` : p.link;
            const isInternalDetail = Boolean(p.slug);
            const isExternal = !isInternalDetail && p.link && p.link.startsWith("http");
            const content = (
              <>
                <div>
                  <h3 className="list-card-title text-base font-medium mb-1">{p.title}</h3>
                  <p className="text-sm mb-3" style={{ color: palette.muted }}>{p.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {(p.stack || []).map((s) => (
                      <span key={s} className="text-xs" style={{ color: palette.cyan }}>{s}</span>
                    ))}
                  </div>
                </div>
                {detailHref && <ArrowRight size={18} className="project-arrow shrink-0" style={{ color: palette.muted }} />}
              </>
            );
            return (
              <Reveal key={p.id || p.title}>
                {detailHref ? (
                  <a
                    href={detailHref}
                    {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="list-card flex items-center justify-between gap-6 p-4 rounded-lg"
                    style={{ border: `1px solid ${palette.border}` }}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-6 p-4 rounded-lg" style={{ border: `1px solid ${palette.border}` }}>
                    {content}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
