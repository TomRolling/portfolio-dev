"use client";

import { ArrowLeft } from "lucide-react";
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
        <a href="/" className="nav-link inline-flex items-center gap-2 text-xs mb-8">
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
            {certifications.map((c) => (
              <Reveal key={c.id}>
                <div className="list-card flex items-center justify-between gap-6 p-4 rounded-lg" style={{ border: `1px solid ${palette.border}` }}>
                  <div>
                    {c.slug ? (
                      <a href={`/certifications/${c.slug}`} className="list-card-title text-sm font-medium" style={{ color: palette.text, textDecoration: "none" }}>
                        {c.name}
                      </a>
                    ) : (
                      <p className="list-card-title text-sm font-medium">{c.name}</p>
                    )}
                    <p className="text-xs" style={{ color: palette.muted }}>
                      {c.organization}{c.cert_date ? ` — ${new Date(c.cert_date).getFullYear()}` : ""}
                    </p>
                  </div>
                  {c.slug ? (
                    <a href={`/certifications/${c.slug}`} className="text-xs" style={{ color: palette.cyan }}>Voir →</a>
                  ) : c.credential_url ? (
                    <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: palette.cyan }}>Voir →</a>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
