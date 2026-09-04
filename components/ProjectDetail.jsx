"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
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
        <a href={backHref} className="nav-link inline-flex items-center gap-2 text-xs mb-8">
          <ArrowLeft size={14} /> {backLabel}
        </a>

        <Reveal>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">{project.title}</h1>
          <p className="text-sm leading-relaxed mb-5" style={{ color: palette.muted }}>
            {project.description}
          </p>
          {(project.stack || []).length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10">
              {project.stack.map((s) => (
                <span key={s} className="text-xs" style={{ color: palette.cyan }}>{s}</span>
              ))}
            </div>
          )}
        </Reveal>

        {hasBlocks ? (
          <Reveal className="flex flex-col gap-6 mb-10">
            {project.blocks.map((block, i) => {
              if (block.type === "heading") {
                return <h2 key={i} className="text-xl font-semibold" style={{ color: palette.text }}>{block.text}</h2>;
              }
              if (block.type === "paragraph") {
                return <p key={i} className="text-sm leading-relaxed" style={{ color: palette.text }}>{formatText(block.text, palette.cyan)}</p>;
              }
              if (block.type === "image") {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={block.url} alt={block.alt || project.title} className="w-full rounded" style={{ border: `1px solid ${palette.border}` }} />
                );
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`${project.title} — capture ${i + 1}`}
                      className="w-full rounded"
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
