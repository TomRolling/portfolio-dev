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

  .nav-link { color: ${palette.muted}; text-decoration: none; transition: color 0.2s ease; }
  .nav-link:hover { color: ${palette.text}; }

  .btn-primary { transition: opacity 0.2s ease, transform 0.15s ease; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-secondary { transition: background-color 0.2s ease, transform 0.15s ease; }
  .btn-secondary:hover { background-color: rgba(255,255,255,0.06); transform: translateY(-1px); }

  .project-row { transition: background-color 0.2s ease; }
  .project-row:hover { background-color: rgba(255,255,255,0.03); }
  .project-row:hover .project-arrow { transform: translateX(4px); }
  .project-arrow { transition: transform 0.2s ease; }

  .skill-pill { transition: border-color 0.2s ease, color 0.2s ease; }
  .skill-pill:hover { border-color: ${palette.green}; color: ${palette.green}; }

  .icon-link { transition: color 0.2s ease, transform 0.2s ease; }
  .icon-link:hover { color: ${palette.green}; transform: translateY(-2px); }

  ::selection { background: ${palette.green}; color: ${palette.bg}; }
`;
