"use client";

import { useState } from "react";
import { Mail, FileDown, MapPin, ArrowLeft, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { palette, styleSheet } from "@/lib/theme";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { SiteTopBar, SiteFooter } from "@/components/SiteChrome";
import { supabase } from "@/lib/supabaseClient";
import PageViewTracker from "@/components/PageViewTracker";

const emptyForm = { name: "", email: "", message: "", website: "" };

export default function ContactPageClient() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(e) {
    e.preventDefault();

    // Anti-spam : le champ "website" est invisible pour un humain (un robot le remplira).
    // Un envoi en moins de 2 secondes est aussi un signe fort de robot.
    if (form.website || Date.now() - startedAt < 2000) {
      setForm(emptyForm);
      setStatus("sent");
      return;
    }

    setStatus("sending");
    const { error } = await supabase.from("messages").insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });
    if (error) {
      setStatus("error");
      return;
    }
    setForm(emptyForm);
    setStatus("sent");
  }

  const inputStyle = {
    backgroundColor: "transparent",
    border: `1px solid ${palette.border}`,
    color: palette.text,
  };

  return (
    <div className="font-mono min-h-screen" style={{ backgroundColor: palette.bg, color: palette.text }}>
      <style>{styleSheet}</style>
      <PageViewTracker path="/contact" />

      <SiteTopBar title="tomrolling.dev/contact" />

      <section className="px-6 md:px-12 pt-16 pb-20 max-w-2xl mx-auto">
        <a href="/" className="pill-btn text-xs mb-8" style={{ color: palette.muted }}>
          <ArrowLeft size={14} /> Retour à l'accueil
        </a>

        <Reveal>
          <SectionLabel>Contact</SectionLabel>
          <p className="text-sm leading-relaxed mb-2 max-w-lg" style={{ color: palette.muted }}>
            Je ne suis pas en recherche active, mais je reste ouvert à toute opportunité ou échange intéressant.
            N'hésite pas à me contacter, par email ou LinkedIn.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          {status === "sent" ? (
            <p className="text-sm p-4 rounded" style={{ border: `1px solid ${palette.green}`, color: palette.green }}>
              Message envoyé, merci ! Je te répondrai dès que possible.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Champ piège anti-spam : invisible et ignoré par les humains, souvent rempli par les robots */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                aria-hidden="true"
              />
              <input
                type="text"
                required
                placeholder="Ton nom"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 text-sm rounded outline-none"
                style={inputStyle}
              />
              <input
                type="email"
                required
                placeholder="Ton email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-2 text-sm rounded outline-none"
                style={inputStyle}
              />
              <textarea
                required
                rows={5}
                placeholder="Ton message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="px-3 py-2 text-sm rounded outline-none"
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded"
                style={{ backgroundColor: palette.green, color: palette.bg }}
              >
                <Send size={16} /> {status === "sending" ? "Envoi..." : "Envoyer"}
              </button>
              {status === "error" && (
                <p className="text-xs" style={{ color: "#BF616A" }}>
                  Une erreur est survenue, réessaie ou passe par email directement.
                </p>
              )}
            </form>
          )}
        </Reveal>

        <Reveal className="mt-14 flex flex-col gap-5">
          <h2 className="text-base font-semibold" style={{ color: palette.text }}>
            Ou directement par ici
          </h2>

          <a
            href="mailto:tom.rolling.pro@gmail.com"
            className="icon-link flex items-center gap-4 py-4 px-4 rounded"
            style={{ border: `1px solid ${palette.border}` }}
          >
            <Mail size={20} />
            <div>
              <p className="text-sm font-medium" style={{ color: palette.text }}>Email</p>
              <p className="text-xs" style={{ color: palette.muted }}>tom.rolling.pro@gmail.com</p>
            </div>
          </a>

          <a
            href="https://www.linkedin.com/in/tom-rolling-6b454229b/"
            target="_blank"
            rel="noreferrer"
            className="icon-link flex items-center gap-4 py-4 px-4 rounded"
            style={{ border: `1px solid ${palette.border}` }}
          >
            <LinkedinIcon size={20} />
            <div>
              <p className="text-sm font-medium" style={{ color: palette.text }}>LinkedIn</p>
              <p className="text-xs" style={{ color: palette.muted }}>linkedin.com/in/tom-rolling-6b454229b</p>
            </div>
          </a>

          <a
            href="https://github.com/TomRolling"
            target="_blank"
            rel="noreferrer"
            className="icon-link flex items-center gap-4 py-4 px-4 rounded"
            style={{ border: `1px solid ${palette.border}` }}
          >
            <GithubIcon size={20} />
            <div>
              <p className="text-sm font-medium" style={{ color: palette.text }}>GitHub</p>
              <p className="text-xs" style={{ color: palette.muted }}>github.com/TomRolling</p>
            </div>
          </a>

          <div className="flex items-center gap-4 py-4 px-4 rounded" style={{ border: `1px solid ${palette.border}` }}>
            <MapPin size={20} style={{ color: palette.text }} />
            <div>
              <p className="text-sm font-medium" style={{ color: palette.text }}>Localisation</p>
              <p className="text-xs" style={{ color: palette.muted }}>Brignoles (83)</p>
            </div>
          </div>

          <a
            href="/CV_Tom_Rolling.pdf"
            download
            className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded mt-2"
            style={{ backgroundColor: palette.green, color: palette.bg }}
          >
            <FileDown size={16} /> Télécharger mon CV
          </a>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
