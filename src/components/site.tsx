import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { getService, offersIncluding, type Offer } from "@/data/services";

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-end" aria-label="mégalopole — accueil">
      <span className="fold-r panel-paper title px-2 py-1 text-xl">még</span>
      <span className="fold border-2 border-foreground title px-2 py-1 text-xl -ml-px">alopole</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link to="/" hash="offres" className="label link-y hidden sm:inline">Offres</Link>
          <Link to="/" hash="comparatif" className="label link-y hidden sm:inline">Comparatif</Link>
          <CtaButton small />
        </nav>
      </div>
    </header>
  );
}

export function CtaButton({ small }: { small?: boolean }) {
  return (
    <a
      href="mailto:contact@example.com?subject=Prendre%20rendez-vous"
      className={`inline-flex items-center gap-2 bg-primary font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${small ? "px-4 py-2 text-sm" : "px-7 py-4 text-lg"}`}
    >
      Prendre rendez-vous →
    </a>
  );
}

export function ServiceLink({ slug, className = "" }: { slug: string; className?: string }) {
  const s = getService(slug);
  if (!s) return null;
  return (
    <Link to="/services/$slug" params={{ slug }} className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="link-y">{s.name}</span>
      <span className="text-primary opacity-60 transition-all group-hover:translate-x-1 group-hover:opacity-100">→</span>
    </Link>
  );
}

export function OfferBadge({ offer }: { offer: Offer }) {
  return (
    <Link
      to="/offres/$slug"
      params={{ slug: offer.slug }}
      className="fold-r label border-2 border-primary px-3 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {offer.name}
    </Link>
  );
}

export function IncludedIn({ slug }: { slug: string }) {
  const list = offersIncluding(slug);
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="panel-paper fold flex flex-col gap-8 p-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label mb-4">Inclus dans</p>
          <div className="flex flex-wrap gap-3">
            {list.map((o) => (
              <Link key={o.slug} to="/offres/$slug" params={{ slug: o.slug }} className="title border-2 border-ink px-4 py-2 text-2xl hover:bg-ink hover:text-paper">
                {o.name}
              </Link>
            ))}
          </div>
        </div>
        <CtaButton />
      </div>
    </section>
  );
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pt-8">
      <nav className="label flex flex-wrap gap-2 text-muted-foreground" aria-label="Fil d'Ariane">
        <Link to="/" className="link-y hover:text-foreground">Accueil</Link>
        {items.map((it, i) => (
          <span key={i} className="flex gap-2">
            <span>/</span>
            {it.to ? <Link to="/" hash="offres" className="link-y hover:text-foreground">{it.label}</Link> : <span className="text-foreground">{it.label}</span>}
          </span>
        ))}
      </nav>
      <Link to="/" hash="offres" className="label link-y">← Retour aux offres</Link>
    </div>
  );
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <p className="label text-muted-foreground">Cartes fidélité pour fast-foods</p>
      </div>
    </footer>
  );
}
