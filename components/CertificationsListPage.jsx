"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { palette, styleSheet } from "@/lib/theme";
import { Reveal } from "@/components/Reveal";
import { SiteTopBar, SiteFooter } from "@/components/SiteChrome";
import PageViewTracker from "@/components/PageViewTracker";

export default function CertificationsListPage({ certifications = [] }) {
  return (
    <div className="font-mono min-h-screen" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <style>{styleSheet}</style>
      <PageViewTracker path="/certifications" />

      <SiteTopBar title="tomrolling.dev/certifications" />

      <section className="px-6 md:px-12 pt-12 pb-20 max-w-2xl mx-auto">
        <a href="/" className="pill-btn text-xs mb-8" style={{ color: palette.muted }}>
          <ArrowLeft size={14} /> Retour à l'accueil
        </a>

        <Reveal>
          <h1 className="text-2xl md:text-3xl font-semibold mb-8">
            <span style={{ color: palette.green }}>$ </span>Certifications
          </h1>
        </Reveal>

        {certifications.length === 0 ? (
          <p className="text-sm" style={{ color: palette.muted }}>
            Pas de certification pour le moment — cette section sera mise à jour au fil de mes apprentissages.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {certifications.map((c) => {
              const detailHref = c.slug ? `/certifications/${c.slug}` : c.credential_url;
              const isExternal = !c.slug && Boolean(c.credential_url);
              const content = (
                <>
                  <div>
                    <h3 className="list-card-title text-base font-medium mb-1">{c.name}</h3>
                    <p className="text-sm" style={{ color: palette.muted }}>
                      {c.organization}{c.cert_date ? ` — ${new Date(c.cert_date).getFullYear()}` : ""}
                    </p>
                  </div>
                  {detailHref && <ArrowRight size={18} className="project-arrow shrink-0" style={{ color: palette.muted }} />}
                </>
              );
              return (
                <Reveal key={c.id}>
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
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
