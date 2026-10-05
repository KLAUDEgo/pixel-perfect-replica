import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { getService, offersIncluding, type Offer } from "@/data/services";
import { LAUNCH_OFFER, launchSetup } from "@/data/content";
import { QuoteCartButton } from "@/components/quote";

export function Logo({ className = "h-12" }: { className?: string }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="mégalopole — accueil">
      <img src="/logo-megalopole.png" alt="mégalopole" className={`w-auto ${className}`} />
    </Link>
  );
}

export function LaunchBanner() {
  if (!LAUNCH_OFFER.enabled) return null;
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="mx-auto max-w-6xl px-5 py-2.5 text-center text-sm font-semibold">
        <span className="label mr-2">Offre de lancement</span>-{LAUNCH_OFFER.discountPercent} % sur
        les frais d'installation pour les {LAUNCH_OFFER.spots} premiers restaurants, en échange d'
        {LAUNCH_OFFER.counterpart}.{" "}
        <Link
          to="/options"
          hash="lancement"
          className="whitespace-nowrap underline underline-offset-2"
        >
          En savoir plus →
        </Link>
      </p>
    </div>
  );
}

/** Prix d'installation, barré + remisé si l'offre de lancement est active. */
export function SetupPrice({ setup, className = "" }: { setup: string; className?: string }) {
  const promo = launchSetup(setup);
  if (!promo) return <span className={className}>{setup} HT</span>;
  return (
    <span className={className}>
      <s className="opacity-60">{setup}</s> <b>{promo} HT</b>
    </span>
  );
}

export function SiteHeader() {
  return (
    <>
      <LaunchBanner />
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <nav className="flex items-center gap-4 md:gap-6">
            <Link to="/" hash="comment" className="label link-y hidden lg:inline">
              Comment ça marche
            </Link>
            <Link to="/" hash="offres" className="label link-y hidden sm:inline">
              Offres
            </Link>
            <Link to="/options" className="label link-y hidden md:inline">
              Options
            </Link>
            <Link to="/" hash="faq" className="label link-y hidden sm:inline">
              FAQ
            </Link>
            <QuoteCartButton />
            <span className="hidden sm:inline-flex">
              <CtaButton small />
            </span>
          </nav>
        </div>
      </header>
    </>
  );
}

export function CtaButton({
  small,
  label = "Prendre rendez-vous",
}: {
  small?: boolean;
  label?: string;
}) {
  return (
    <Link
      to="/"
      hash="contact"
      className={`inline-flex items-center gap-2 bg-primary font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${small ? "px-4 py-2 text-sm" : "px-7 py-4 text-lg"}`}
    >
      {label} →
    </Link>
  );
}

export function ServiceLink({ slug, className = "" }: { slug: string; className?: string }) {
  const s = getService(slug);
  if (!s) return null;
  return (
    <Link
      to="/services/$slug"
      params={{ slug }}
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <span className="link-y">{s.name}</span>
      <span className="text-primary opacity-60 transition-all group-hover:translate-x-1 group-hover:opacity-100">
        →
      </span>
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
              <Link
                key={o.slug}
                to="/offres/$slug"
                params={{ slug: o.slug }}
                className="title border-2 border-ink px-4 py-2 text-2xl hover:bg-ink hover:text-paper"
              >
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
        <Link to="/" className="link-y hover:text-foreground">
          Accueil
        </Link>
        {items.map((it, i) => (
          <span key={i} className="flex gap-2">
            <span>/</span>
            {it.to ? (
              <Link to="/" hash="offres" className="link-y hover:text-foreground">
                {it.label}
              </Link>
            ) : (
              <span className="text-foreground">{it.label}</span>
            )}
          </span>
        ))}
      </nav>
      <Link to="/" hash="offres" className="label link-y">
        ← Retour aux offres
      </Link>
    </div>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Logo className="h-14" />
          <p className="label mt-5 text-muted-foreground">
            La fidélité digitale pour les restaurants
          </p>
          <p className="label mt-1 text-muted-foreground">Grasse – Cannes – Antibes – Nice</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <nav className="label flex flex-wrap gap-4 text-muted-foreground">
            <a href="#" className="link-y">
              Mentions légales
            </a>
            <a href="#" className="link-y">
              CGV
            </a>
            <a href="#" className="link-y">
              Confidentialité
            </a>
          </nav>
          <p className="label text-muted-foreground">© 2026 mégalopole</p>
        </div>
      </div>
    </footer>
  );
}
