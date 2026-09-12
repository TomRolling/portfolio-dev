import { ImageResponse } from "next/og";
import { palette } from "@/lib/theme";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Memes couleurs que les pastilles de <WindowBar> (components/SiteChrome.jsx)
const windowDots = ["#EC6A5E", "#F5BD4F", "#61C454"];

// Satori (le moteur derrière ImageResponse) ne sait pas utiliser les polices du
// système : il faut lui fournir le fichier. On récupère JetBrains Mono chez
// Google Fonts ; si l'appel échoue, on renvoie undefined et Satori retombe sur
// sa police par défaut.
async function loadJetBrainsMono(text) {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl).then((r) => r.text());
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return undefined;
    const data = await fetch(match[1]).then((r) => r.arrayBuffer());
    return [{ name: "JetBrains Mono", data, style: "normal", weight: 400 }];
  } catch {
    return undefined;
  }
}

export default async function OpenGraphImage() {
  const displayUrl = site.url.replace(/^https?:\/\//, "");
  const prompt = "whoami";

  const fonts = await loadJetBrainsMono(`$ ${site.name}${site.tagline}${displayUrl}${prompt}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: palette.bg,
          fontFamily: fonts ? "JetBrains Mono" : "sans-serif",
          padding: 56,
        }}
      >
        {/* Fenêtre façon terminal */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: `2px solid ${palette.border}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 28px",
              backgroundColor: palette.panel,
              borderBottom: `2px solid ${palette.border}`,
            }}
          >
            {windowDots.map((color) => (
              <div key={color} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color }} />
            ))}
            <span style={{ marginLeft: 16, fontSize: 22, color: palette.muted }}>{displayUrl}</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
            <span style={{ fontSize: 28, color: palette.muted, marginBottom: 24 }}>
              {/* marge explicite : Satori supprime les espaces en fin de noeud */}
              <span style={{ color: palette.green, marginRight: 12 }}>$</span>
              {prompt}
            </span>
            <span style={{ fontSize: 88, color: palette.text, letterSpacing: -2 }}>{site.name}</span>
            <span style={{ fontSize: 34, color: palette.cyan, marginTop: 20 }}>{site.tagline}</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
