"use client";

import { useState } from "react";
import { Mail, FileDown, Menu, X } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { palette } from "@/lib/theme";

export function SiteTopBar({ title = "tomrolling.dev" }) {
  return (
    <div className="sticky top-0 z-30" style={{ backgroundColor: palette.bg }}>
      <WindowBar title={title} />
      <SiteHeaderInner />
    </div>
  );
}

export function WindowBar({ title = "tomrolling.dev" }) {
  return (
    <div
      className="relative flex items-center gap-2 px-4 py-2.5"
      style={{ backgroundColor: palette.panel, borderBottom: `1px solid ${palette.border}` }}
    >
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EC6A5E" }} />
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#F5BD4F" }} />
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#61C454" }} />
      <span className="absolute left-1/2 -translate-x-1/2 text-xs" style={{ color: palette.muted }}>{title}</span>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/#about", label: "À propos" },
  { href: "/#projets", label: "Projets" },
  { href: "/#certifications", label: "Certifications" },
  { href: "/contact", label: "Contact" },
];

function SiteHeaderInner() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ backgroundColor: `${palette.bg}F2`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${palette.border}` }}>
      <header className="relative flex items-center justify-between px-6 py-4 md:px-12 max-w-2xl mx-auto">
        <a href="/" className="text-base font-semibold" style={{ color: palette.text, textDecoration: "none" }}>Tom Rolling</a>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden"
          style={{ color: palette.text }}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {menuOpen && (
          <nav
            className="md:hidden absolute top-full left-0 right-0 flex flex-col px-6 py-4 gap-4 text-sm"
            style={{ backgroundColor: palette.bg, borderBottom: `1px solid ${palette.border}` }}
          >
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="nav-link" onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>
    </div>
  );
}

// Conservé pour compatibilité si utilisé isolément ailleurs
export function SiteHeader() {
  return <SiteHeaderInner />;
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${palette.border}` }}>
      <div className="px-6 md:px-12 py-8 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs" style={{ color: palette.muted }}>
          © {new Date().getFullYear()} Tom Rolling
        </p>
        <nav className="flex flex-wrap items-center gap-6 text-xs">
          <a href="/#about" className="nav-link">À propos</a>
          <a href="/#projets" className="nav-link">Projets</a>
          <a href="/#certifications" className="nav-link">Certifications</a>
          <a href="/contact" className="nav-link">Contact</a>
        </nav>
        <div className="flex items-center gap-5">
          <a href="/contact" aria-label="Contact" className="icon-link"><Mail size={18} /></a>
          <a href="https://www.linkedin.com/in/tom-rolling-6b454229b/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="icon-link"><LinkedinIcon size={18} /></a>
          <a href="https://github.com/TomRolling" target="_blank" rel="noreferrer" aria-label="GitHub" className="icon-link"><GithubIcon size={18} /></a>
          <a
            href="/CV_Tom_Rolling.pdf"
            download
            className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded"
            style={{ border: `1px solid ${palette.border}`, color: palette.text }}
          >
            <FileDown size={14} /> CV
          </a>
        </div>
      </div>
    </footer>
  );
}
