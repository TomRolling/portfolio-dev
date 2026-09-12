import { ImageResponse } from "next/og";

export const alt = "Tom Rolling — Développeur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const palette = {
  bg: "#2E3440",
  panel: "#333947",
  border: "#434C5E",
  text: "#E5E9F0",
  muted: "#9AA5B1",
  green: "#A3BE8C",
  cyan: "#88C0D0",
};

// Satori (le moteur derrière ImageResponse) ne sait pas utiliser les polices du
// système : il faut lui fournir le fichier. On récupère JetBrains Mono chez
// Google Fonts, et si ça échoue on retombe sur la police par défaut.
async function loadJetBrainsMono(text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl).then((r) => r.text());
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error("police introuvable");
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function OpenGraphImage() {
  const title = "Tom Rolling";
  const subtitle = "Développeur autodidacte — BTS SIO";
  const url = "tomrolling.vercel.app";
  const prompt = "whoami";

  let fonts;
  try {
    const data = await loadJetBrainsMono(`$ ${title}${subtitle}${url}${prompt}`);
    fonts = [{ name: "JetBrains Mono", data, style: "normal", weight: 400 }];
  } catch {
    fonts = undefined;
  }

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
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#BF616A" }} />
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#EBCB8B" }} />
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: palette.green }} />
            <span style={{ marginLeft: 16, fontSize: 22, color: palette.muted }}>{url}</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
            <span style={{ fontSize: 28, color: palette.muted, marginBottom: 24 }}>
              {/* marge explicite : Satori supprime les espaces en fin de noeud */}
              <span style={{ color: palette.green, marginRight: 12 }}>$</span>
              {prompt}
            </span>
            <span style={{ fontSize: 88, color: palette.text, letterSpacing: -2 }}>{title}</span>
            <span style={{ fontSize: 34, color: palette.cyan, marginTop: 20 }}>{subtitle}</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
