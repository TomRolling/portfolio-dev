"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { palette, styleSheet } from "@/lib/theme";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { WindowBar, SiteTopBar, SiteFooter } from "@/components/SiteChrome";
import PageViewTracker from "@/components/PageViewTracker";

const skills = ["Python", "PHP", "MySQL", "JavaScript", "HTML / CSS"];

// Machine a ecrire, une seule fois, pour la ligne du hero
function useTypewriter(text, speed = 45, startDelay = 250) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setOut(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);
  return [out, done];
}

export default function Homepage({ projects = [], certifications = [] }) {
  const [typed, typingDone] = useTypewriter("tom --intro", 45, 250);

  return (
    <div className="font-mono min-h-screen" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <style>{styleSheet}</style>
      <PageViewTracker path="/" />

      <SiteTopBar />

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-2xl mx-auto">
        <p className="text-sm mb-6" style={{ color: palette.muted }}>
          <span style={{ color: palette.green }}>$ </span>
          {typed}
          <span className="caret">▍</span>
        </p>

        <div className={`transition-opacity duration-700 ${typingDone ? "opacity-100" : "opacity-0"}`}>
          <h1 className="text-2xl md:text-3xl font-medium leading-normal mb-4" style={{ color: palette.text }}>
            Développeur curieux, j'aime comprendre comment les choses fonctionnent pour mieux les optimiser.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: palette.muted }}>
            BTS SIO en alternance. Je présente ici mes projets de développement personnels.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#projets"
              className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded"
              style={{ backgroundColor: palette.green, color: palette.bg }}
            >
              Voir mes projets <ArrowRight size={16} />
            </a>
            <a
              href="/contact"
              className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded"
              style={{ border: `1px solid ${palette.border}` }}
            >
              Me contacter
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 md:px-12 py-14 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${palette.border}` }}>
        <Reveal>
          <SectionLabel>À propos</SectionLabel>
          <p className="text-sm leading-relaxed mb-6" style={{ color: palette.muted }}>
            BTS SIO en alternance. Je suis quelqu'un de carré, qui aime creuser un sujet à fond et trouver comment l'améliorer. À l'aise en Python, PHP et MySQL, je développe aussi mes projets personnels pour explorer le développement web.
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="skill-pill text-xs px-3 py-1.5 rounded"
                style={{ border: `1px solid ${palette.border}`, color: palette.muted }}
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Projects */}
      <section id="projets" className="px-6 md:px-12 py-14 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${palette.border}` }}>
        <Reveal>
          <SectionLabel>Projets</SectionLabel>
        </Reveal>
        <div className="flex flex-col">
          {projects.length === 0 && (
            <p className="text-sm py-6" style={{ color: palette.muted }}>
              Aucun projet pour le moment.
            </p>
          )}
          {projects.map((p) => {
            const detailHref = p.slug ? `/projets/${p.slug}` : p.link;
            const isInternalDetail = Boolean(p.slug);
            const isExternal = !isInternalDetail && p.link && p.link.startsWith("http");
            const content = (
              <>
                <div>
                  <h3 className="text-base font-medium mb-1">{p.title}</h3>
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
                    className="project-row flex items-center justify-between gap-6 py-6"
                    style={{ borderTop: `1px solid ${palette.border}` }}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-6 py-6" style={{ borderTop: `1px solid ${palette.border}` }}>
                    {content}
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="px-6 md:px-12 py-14 max-w-2xl mx-auto" style={{ borderTop: `1px solid ${palette.border}` }}>
        <Reveal>
          <SectionLabel>Certifications</SectionLabel>
          {certifications.length === 0 ? (
            <p className="text-sm" style={{ color: palette.muted }}>
              Pas de certification pour le moment — cette section sera mise à jour au fil de mes apprentissages.
            </p>
          ) : (
            <div className="flex flex-col">
              {certifications.map((c) => (
                <div key={c.id} className="py-4 flex items-center justify-between gap-6" style={{ borderTop: `1px solid ${palette.border}` }}>
                  <div>
                    {c.slug ? (
                      <a href={`/certifications/${c.slug}`} className="text-sm font-medium" style={{ color: palette.text, textDecoration: "none" }}>
                        {c.name}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{c.name}</p>
                    )}
                    <p className="text-xs" style={{ color: palette.muted }}>
                      {c.organization}{c.cert_date ? ` — ${new Date(c.cert_date).getFullYear()}` : ""}
                    </p>
                  </div>
                  {c.slug ? (
                    <a href={`/certifications/${c.slug}`} className="text-xs" style={{ color: palette.cyan }}>
                      Voir →
                    </a>
                  ) : c.credential_url ? (
                    <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-xs" style={{ color: palette.cyan }}>
                      Voir →
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
