"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, FileText, ExternalLink, Download } from "lucide-react";
import { palette, styleSheet } from "@/lib/theme";
import { Reveal } from "@/components/Reveal";
import { SiteTopBar, SiteFooter } from "@/components/SiteChrome";
import PageViewTracker from "@/components/PageViewTracker";

function getVideoEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

// Comprend **gras**, __souligné__ et [texte](lien) dans un texte simple
function formatText(text, cyan) {
  const regex = /\*\*(.+?)\*\*|__(.+?)__|\[(.+?)\]\((.+?)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<u key={key++}>{match[2]}</u>);
    } else if (match[3] !== undefined) {
      parts.push(
        <a key={key++} href={match[4]} target="_blank" rel="noreferrer" style={{ color: cyan, textDecoration: "underline" }}>
          {match[3]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// Une iframe masquee en CSS telecharge quand meme sa source : on ne la monte
// donc qu'au-dessus de 768px, largeur a partir de laquelle l'apercu est lisible
// (les navigateurs mobiles n'affichent pas les PDF en iframe de toute facon).
function useIsDesktop(minWidth = 768) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [minWidth]);
  return isDesktop;
}

function PdfBlock({ url, text }) {
  const label = text || "Document PDF";
  const isDesktop = useIsDesktop();

  return (
    <div className="rounded overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
      <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ backgroundColor: palette.panel }}>
        <span className="inline-flex items-center gap-2 text-sm min-w-0">
          <FileText size={15} style={{ color: palette.green, flexShrink: 0 }} />
          <span className="truncate">{label}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <a href={url} download className="pill-btn text-xs" style={{ color: palette.muted }}>
            <Download size={13} /> Télécharger
          </a>
          <a href={url} target="_blank" rel="noreferrer" className="pill-btn text-xs" style={{ color: palette.muted }}>
            Ouvrir <ExternalLink size={13} />
          </a>
        </div>
      </div>
      {isDesktop && (
        // toolbar=0&navpanes=0 masque la barre d'outils et le panneau de vignettes
        // de la visionneuse du navigateur, qui jurent avec le theme du site ;
        // view=FitH ajuste la page a la largeur du cadre. Le ratio A4 paysage
        // evite la grande zone vide d'une hauteur fixe.
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          title={label}
          loading="lazy"
          className="w-full block"
          style={{
            aspectRatio: "297 / 210",
            border: 0,
            borderTop: `1px solid ${palette.border}`,
            backgroundColor: palette.panel,
          }}
        />
      )}
    </div>
  );
}

export default function ProjectDetail({ project, basePath = "/projets", backHref = "/#projets", backLabel = "Retour aux projets" }) {
  const embedUrl = getVideoEmbedUrl(project.video_url);
  const isDirectVideo = project.video_url && !embedUrl;
  const isExternalLink = project.link && project.link.startsWith("http");
  const paragraphs = (project.content || "").split(/\n\s*\n/).filter(Boolean);
  const hasBlocks = Array.isArray(project.blocks) && project.blocks.length > 0;

  return (
    <div className="font-mono min-h-screen" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <style>{styleSheet}</style>
      <PageViewTracker path={`${basePath}/${project.slug}`} />

      <SiteTopBar title={`tomrolling.dev${basePath}/${project.slug}`} />

      <article className="px-6 md:px-12 pt-12 pb-20 max-w-2xl mx-auto">
        <a href={backHref} className="pill-btn text-xs mb-8" style={{ color: palette.muted }}>
          <ArrowLeft size={14} /> {backLabel}
        </a>

        <Reveal>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">{project.title}</h1>
          <p className="text-sm leading-relaxed mb-5" style={{ color: palette.muted }}>
            {project.description}
          </p>
          {(project.stack || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {project.stack.map((s) => (
                <span key={s} className="tech-tag text-xs" style={{ color: palette.cyan }}>{s}</span>
              ))}
            </div>
          )}
        </Reveal>

        {hasBlocks ? (
          <Reveal className="flex flex-col gap-6 mb-10">
            {project.blocks.map((block, i) => {
              if (block.type === "heading") {
                return <h2 key={i} className="text-xl font-semibold" style={{ color: block.color || palette.green }}>{block.text}</h2>;
              }
              if (block.type === "paragraph") {
                return <p key={i} className="text-sm leading-relaxed" style={{ color: block.color || palette.text }}>{formatText(block.text, palette.cyan)}</p>;
              }
              if (block.type === "image") {
                return (
                  <Image
                    key={i}
                    src={block.url}
                    alt={block.text || project.title}
                    width={1600}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="w-full h-auto rounded"
                    style={{ border: `1px solid ${palette.border}` }}
                  />
                );
              }
              if (block.type === "pdf") {
                return block.url ? <PdfBlock key={i} url={block.url} text={block.text} /> : null;
              }
              if (block.type === "video") {
                const embed = getVideoEmbedUrl(block.url);
                return (
                  <div key={i} className="relative w-full rounded overflow-hidden" style={{ paddingTop: "56.25%", border: `1px solid ${palette.border}` }}>
                    {embed ? (
                      <iframe
                        src={embed}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${project.title} — vidéo`}
                      />
                    ) : (
                      <video src={block.url} controls className="absolute top-0 left-0 w-full h-full" />
                    )}
                  </div>
                );
              }
              return null;
            })}
          </Reveal>
        ) : (
          <>
            {paragraphs.length > 0 && (
              <Reveal className="flex flex-col gap-4 mb-10">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: palette.text }}>{formatText(p, palette.cyan)}</p>
                ))}
              </Reveal>
            )}

            {(project.images || []).length > 0 && (
              <Reveal className="mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.images.map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt={`${project.title} — capture ${i + 1}`}
                      width={1200}
                      height={800}
                      sizes="(max-width: 640px) 100vw, 340px"
                      className="w-full h-auto rounded"
                      style={{ border: `1px solid ${palette.border}` }}
                    />
                  ))}
                </div>
              </Reveal>
            )}

            {project.video_url && (
              <Reveal className="mb-10">
                {embedUrl ? (
                  <div className="relative w-full rounded overflow-hidden" style={{ paddingTop: "56.25%", border: `1px solid ${palette.border}` }}>
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${project.title} — vidéo`}
                    />
                  </div>
                ) : isDirectVideo ? (
                  <video src={project.video_url} controls className="w-full rounded" style={{ border: `1px solid ${palette.border}` }} />
                ) : null}
              </Reveal>
            )}
          </>
        )}

        {project.link && (
          <Reveal>
            <a
              href={project.link}
              {...(isExternalLink ? { target: "_blank", rel: "noreferrer" } : {})}
              className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded"
              style={{ backgroundColor: palette.green, color: palette.bg }}
            >
              {project.link_label || "En savoir plus"} <ArrowRight size={16} />
            </a>
          </Reveal>
        )}
      </article>

      <SiteFooter />
    </div>
  );
}
