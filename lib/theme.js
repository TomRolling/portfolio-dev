export const palette = {
  bg: "#2E3440",
  panel: "#333947",
  border: "#434C5E",
  text: "#E5E9F0",
  muted: "#9AA5B1",
  green: "#A3BE8C",
  cyan: "#88C0D0",
};

export const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  .font-mono { font-family: 'JetBrains Mono', monospace; }

  .caret { animation: blink 1s step-end infinite; }
  @keyframes blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } }

  .nav-link { color: ${palette.muted}; text-decoration: none; transition: color 0.2s ease, transform 0.15s ease; display: inline-block; }
  .nav-link:hover { color: ${palette.green}; transform: translateY(-1px); }

  .btn-primary { transition: opacity 0.2s ease, transform 0.15s ease; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-secondary { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease; }
  .btn-secondary:hover { background-color: rgba(163,190,140,0.08); border-color: ${palette.green} !important; color: ${palette.green} !important; transform: translateY(-1px); }

  .list-card { transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease; }
  .list-card:hover { background-color: ${palette.panel}; border-color: ${palette.green} !important; transform: translateY(-1px); }
  .list-card:hover .project-arrow { transform: translateX(4px); }
  .list-card:hover .list-card-title { color: ${palette.green}; }
  .project-arrow { transition: transform 0.2s ease; }

  .skill-pill { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease; }
  .skill-pill:hover { background-color: rgba(163,190,140,0.08); border-color: ${palette.green} !important; color: ${palette.green} !important; transform: translateY(-1px); }

  .icon-link { transition: color 0.2s ease, transform 0.2s ease; }
  .icon-link:hover { color: ${palette.green}; transform: translateY(-2px); }

  ::selection { background: ${palette.green}; color: ${palette.bg}; }

  .tech-tag {
    display: inline-flex;
    padding: 3px 10px;
    border-radius: 999px;
    background-color: rgba(136,192,208,0.08);
    border: 1px solid rgba(136,192,208,0.25);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  .tech-tag:hover { border-color: ${palette.cyan}; background-color: rgba(136,192,208,0.14); }

  strong { color: ${palette.green}; font-weight: 600; }

  .pill-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid ${palette.border};
    transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease, transform 0.15s ease;
  }
  .pill-btn:hover {
    border-color: ${palette.green} !important;
    color: ${palette.green} !important;
    background-color: rgba(163,190,140,0.08);
    transform: translateY(-1px);
  }
`;
