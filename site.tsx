import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getService, offersIncluding, type Offer } from "@/data/services";
import { COMPANY, LAUNCH_OFFER, POLICY, launchSetup } from "@/data/content";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";
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
  const pct = `\u2212${LAUNCH_OFFER.discountPercent}\u00a0%`;
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="mx-auto max-w-6xl px-5 py-2.5 text-center text-sm font-semibold">
        <span className="md:hidden">
          {pct} sur l'installation pour les {LAUNCH_OFFER.spots} premiers commerces.{" "}
        </span>
        <span className="hidden md:inline">
          <span className="label mr-2">Offre de lancement</span>
          {pct} sur les frais d'installation pour les {LAUNCH_OFFER.spots} premiers commerces, en
          échange d'{LAUNCH_OFFER.counterpart}.{" "}
        </span>
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
  if (!promo) return <span className={`whitespace-nowrap ${className}`}>{setup}</span>;
  return (
    <span className={className}>
      <s className="whitespace-nowrap opacity-60">{setup}</s>{" "}
      <b className="whitespace-nowrap">{promo}</b>
    </span>
  );
}

/** Liens de navigation principaux (en-tête mobile et pied de page). */
const NAV_LINKS: { label: string; to: "/" | "/options" | "/devis"; hash?: string }[] = [
  { label: "Comment ça marche", to: "/", hash: "comment" },
  { label: "Formules", to: "/", hash: "offres" },
  { label: "Options", to: "/options" },
  { label: "FAQ", to: "/", hash: "faq" },
  { label: "Contact", to: "/", hash: "contact" },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function unlockScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

/** Menu burger (écrans < lg) : plein écran, Échap pour fermer, focus piégé. */
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  // Le panneau est rendu dans <body> (le flou de l'en-tête casserait le position: fixed).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const close = (restoreFocus = true) => {
    unlockScroll();
    setOpen(false);
    if (restoreFocus) btnRef.current?.focus();
  };

  // Fermeture à chaque changement de page.
  useEffect(() => {
    setOpen(false);
    unlockScroll();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("nav a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) close(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      unlockScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const linkClick = () => close(false);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label="Ouvrir le menu"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-2 border-paper/40 transition-colors hover:border-primary lg:hidden"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      </button>
      {mounted &&
        createPortal(
          <div
            ref={panelRef}
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            hidden={!open}
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-background lg:hidden"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between border-b px-5 py-4">
              <span onClick={linkClick}>
                <Logo />
              </span>
              <button
                type="button"
                onClick={() => close()}
                aria-label="Fermer le menu"
                className="inline-flex h-11 w-11 items-center justify-center border-2 border-paper/40 transition-colors hover:border-primary"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>
            </div>
            <nav aria-label="Menu principal" className="mx-auto max-w-6xl px-5 pt-6 pb-10">
              <ul className="border-t">
                {NAV_LINKS.map((l) => (
                  <li key={l.label} className="border-b">
                    <Link
                      to={l.to}
                      {...(l.hash ? { hash: l.hash } : {})}
                      onClick={linkClick}
                      className="title flex min-h-16 items-center justify-between py-3 text-4xl hover:text-primary"
                    >
                      {l.label}
                      <span aria-hidden className="text-2xl text-primary">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/devis"
                onClick={linkClick}
                className="mt-8 flex min-h-14 items-center justify-center bg-primary px-6 py-4 text-lg font-bold text-primary-foreground"
              >
                Composer mon devis →
              </Link>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}

export function SiteHeader() {
  return (
    <>
      <LaunchBanner />
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <Logo />
          <nav aria-label="Navigation principale" className="flex items-center gap-3 md:gap-6">
            <Link to="/" hash="comment" className="label link-y hidden lg:inline">
              Comment ça marche
            </Link>
            <Link to="/" hash="offres" className="label link-y hidden md:inline">
              Formules
            </Link>
            <Link to="/options" className="label link-y hidden md:inline">
              Options
            </Link>
            <Link to="/" hash="faq" className="label link-y hidden md:inline">
              FAQ
            </Link>
            <QuoteCartButton />
            <span className="hidden md:inline-flex">
              <CtaButton small />
            </span>
            <MobileMenu />
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
      className={`inline-flex items-center gap-2 bg-primary font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${small ? "min-h-11 px-4 py-2 text-sm" : "px-7 py-4 text-lg"}`}
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
      className="fold-r label inline-flex min-h-11 items-center border-2 border-primary px-3 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
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
      <Link to="/" hash="offres" className="label link-y inline-flex min-h-11 items-center">
        ← Retour aux formules
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

const FOOTER_LINKS: { label: string; to: "/" | "/options" | "/devis"; hash?: string }[] = [
  { label: "Formules", to: "/", hash: "offres" },
  { label: "Options", to: "/options" },
  { label: "FAQ", to: "/", hash: "faq" },
  { label: "Contact", to: "/", hash: "contact" },
  { label: "Devis", to: "/devis" },
];

export function Footer() {
  const wa = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  return (
    <footer className="border-t">
      <div
        className={`mx-auto grid max-w-6xl gap-8 px-5 pt-12 sm:grid-cols-[1fr_auto] sm:items-end ${wa ? "pb-28" : "pb-12"}`}
      >
        <div>
          <Logo className="h-14" />
          <p className="label mt-5 text-muted-foreground">
            La fidélité digitale des commerces de proximité
          </p>
          <p className="label mt-1 text-muted-foreground">Sur place, de Grasse à Nice</p>
          {wa && (
            <p className="label mt-4 text-muted-foreground">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="link-y text-foreground"
              >
                WhatsApp · {COMPANY.phone}
              </a>{" "}
              · {POLICY.supportHours}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <nav
            aria-label="Plan du site"
            className="label flex flex-wrap gap-x-5 text-foreground sm:justify-end sm:gap-y-2"
          >
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                className="link-y inline-flex min-h-11 items-center sm:min-h-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <nav
            aria-label="Informations légales"
            className="label flex flex-wrap gap-x-5 text-muted-foreground sm:justify-end sm:gap-y-2"
          >
            <Link
              to="/mentions-legales"
              className="link-y inline-flex min-h-11 items-center sm:min-h-0"
            >
              Mentions légales
            </Link>
            <Link to="/cgv" className="link-y inline-flex min-h-11 items-center sm:min-h-0">
              CGV
            </Link>
            <Link
              to="/confidentialite"
              className="link-y inline-flex min-h-11 items-center sm:min-h-0"
            >
              Confidentialité
            </Link>
          </nav>
          <p className="label text-muted-foreground">© 2026 mégalopole</p>
        </div>
      </div>
    </footer>
  );
}

/** Page 404 à la charte (utilisée par la racine et les routes à paramètre). */
export function NotFoundPage({
  title = "page",
  text = "Cette page n'existe pas ou a été déplacée.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <title>Page introuvable — mégalopole</title>
      <meta name="robots" content="noindex" />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-20 md:py-32">
        <p className="label mb-6 text-primary">Erreur 404</p>
        <h1 className="title text-6xl sm:text-7xl md:text-9xl">
          {title} <span className="mark">introuvable.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">{text}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center bg-primary px-7 py-4 text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            ← Retour à l'accueil
          </Link>
          <Link
            to="/devis"
            className="inline-flex min-h-11 items-center border-2 border-paper px-7 py-4 text-lg font-bold hover:bg-paper hover:text-ink"
          >
            Composer mon devis
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
