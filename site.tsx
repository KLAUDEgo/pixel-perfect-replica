import { Link, useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { getService, offersIncluding, type Offer } from "@/data/services";
import { COMPANY, LAUNCH_OFFER, POLICY, launchSetup } from "@/data/content";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { QuoteCartButton, quoteCount, useQuote } from "@/components/quote";
import { WhatsAppIcon } from "@/components/whatsapp";

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
      <p className="mx-auto max-w-6xl px-5 py-1.5 text-center text-xs font-semibold md:hidden">
        <Link to="/options" hash="lancement" className="block truncate">
          {pct} sur l'installation · {LAUNCH_OFFER.spots} premières places →
        </Link>
      </p>
      <p className="mx-auto hidden max-w-6xl px-5 py-2.5 text-center text-sm font-semibold md:block">
        <span>
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

/** Entrées du menu (onglet « Menu » de la barre mobile). */
const MENU_LINKS: { label: string; to: "/"; hash: string }[] = [
  { label: "Comment ça marche", to: "/", hash: "comment" },
  { label: "FAQ", to: "/", hash: "faq" },
  { label: "Contact", to: "/", hash: "contact" },
];

const LEGAL_LINKS = [
  { label: "Mentions légales", to: "/mentions-legales" },
  { label: "CGV", to: "/cgv" },
  { label: "Confidentialité", to: "/confidentialite" },
] as const;

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function unlockScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

/** Champs qui ouvrent le clavier virtuel. */
const TYPING_RE = /^(INPUT|TEXTAREA|SELECT)$/;
const NO_KEYBOARD = new Set([
  "checkbox",
  "radio",
  "range",
  "button",
  "submit",
  "reset",
  "color",
  "file",
  "image",
]);
function isTypingTarget(el: Element | null) {
  if (!el || !TYPING_RE.test(el.tagName)) return false;
  return !(el instanceof HTMLInputElement && NO_KEYBOARD.has(el.type));
}

/** Icônes 24 px, trait 2 px. */
function TabIcon({
  name,
  small,
}: {
  name: "offers" | "options" | "quote" | "menu" | "contact";
  small?: boolean;
}) {
  const paths = {
    offers: <path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z" />,
    options: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="1" />
        <path d="M12 8.5v7M8.5 12h7" />
      </>
    ),
    quote: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    contact: <path d="M4 5h16v11H9l-5 4zM8 9h8M8 12h5" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={small ? "size-5" : "size-6"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {paths[name]}
    </svg>
  );
}

const TAB =
  "relative flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold leading-none outline-offset-[-3px]";
/** Trait de 2 px en haut de l'onglet actif. */
function ActiveMark({ className = "bg-primary" }: { className?: string }) {
  return <span aria-hidden className={`absolute inset-x-3 top-0 h-0.5 ${className}`} />;
}

/**
 * Barre d'onglets en bas (écrans < lg) : Formules · Options · Devis · WhatsApp · Menu.
 * Masquée pendant la saisie (clavier ouvert). L'onglet Menu ouvre un panneau qui monte du
 * bas (Échap, tap sur le fond ou glisser vers le bas pour fermer ; focus piégé).
 */
export function MobileTabBar() {
  const { quote, loaded } = useQuote();
  const count = quoteCount(quote);
  const {
    pathname,
    hash: rawHash,
    href,
  } = useRouterState({
    select: (st) => ({
      pathname: st.location.pathname,
      hash: st.location.hash,
      href: st.location.href,
    }),
  });
  const wa = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  // L'ancre (#offres…) n'existe que côté navigateur : on l'ignore jusqu'à l'hydratation.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const hash = mounted ? rawHash : "";
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = (restoreFocus = true) => {
    unlockScroll();
    setOpen(false);
    if (restoreFocus) btnRef.current?.focus();
  };

  // Fermeture à chaque changement de page ou d'ancre.
  useEffect(() => {
    setOpen(false);
    unlockScroll();
  }, [href]);

  // Saisie en cours : on libère le bas de l'écran pour le clavier.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const typing = isTypingTarget(document.activeElement);
      if (typing) document.documentElement.setAttribute("data-typing", "");
      else document.documentElement.removeAttribute("data-typing");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      document.documentElement.removeAttribute("data-typing");
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("[data-menu-link]")?.focus();
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

  // Fermeture du panneau en le glissant vers le bas (poignée et en-tête du panneau).
  const [dragY, setDragY] = useState(0);
  const drag = useRef<{ id: number; y0: number } | null>(null);
  const onDragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, y0: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    setDragY(Math.max(0, e.clientY - drag.current.y0));
  };
  const onDragEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    const dy = e.clientY - drag.current.y0;
    drag.current = null;
    setDragY(0);
    if (dy > 80) close();
  };
  useEffect(() => {
    if (!open) setDragY(0);
  }, [open]);

  const offersActive =
    !open && ((pathname === "/" && hash === "offres") || pathname.startsWith("/offres/"));
  const optionsActive = !open && pathname === "/options";
  const devisActive = !open && pathname === "/devis";
  const tone = (active: boolean) => (active ? "text-primary" : "text-paper/70 hover:text-paper");
  const closeIfOpen = () => open && close(false);
  const aboveTabBar = "calc(64px + env(safe-area-inset-bottom, 0px))";

  return (
    <>
      <nav
        aria-label="Navigation principale"
        data-testid="tabbar"
        className="hide-when-typing fixed inset-x-0 bottom-0 z-40 border-t border-paper/15 bg-ink lg:hidden"
        style={{
          height: aboveTabBar,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* 64 px bordure comprise : rien ne la chevauche (récap du devis, menu). */}
        <ul className="mx-auto grid h-full max-w-xl grid-cols-5">
          <li className="contents">
            <Link
              to="/"
              hash="offres"
              onClick={closeIfOpen}
              aria-current={offersActive ? "page" : undefined}
              className={`${TAB} ${tone(offersActive)}`}
            >
              {offersActive && <ActiveMark />}
              <TabIcon name="offers" />
              Formules
            </Link>
          </li>
          <li className="contents">
            <Link
              to="/options"
              onClick={closeIfOpen}
              aria-current={optionsActive ? "page" : undefined}
              className={`${TAB} ${tone(optionsActive)}`}
            >
              {optionsActive && <ActiveMark />}
              <TabIcon name="options" />
              Options
            </Link>
          </li>
          <li className="contents">
            <Link
              to="/devis"
              onClick={closeIfOpen}
              aria-current={devisActive ? "page" : undefined}
              aria-label={`Devis${loaded && count ? `, ${count} élément${count > 1 ? "s" : ""}` : ""}`}
              data-testid="tab-devis"
              className={`${TAB} ${devisActive ? "text-primary" : "text-paper"}`}
            >
              {devisActive && <ActiveMark />}
              <span className="relative flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <TabIcon name="quote" />
                {loaded && count > 0 && (
                  <span
                    aria-hidden
                    data-testid="tabbar-count"
                    className="absolute -right-2 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-paper/40 bg-ink px-1 text-[10px] font-bold text-paper"
                  >
                    {count}
                  </span>
                )}
              </span>
              Devis
            </Link>
          </li>
          <li className="contents">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp (nouvelle fenêtre)"
                className={`${TAB} text-paper/70 hover:text-paper`}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#25D366] text-ink">
                  <WhatsAppIcon className="size-5" />
                </span>
                WhatsApp
              </a>
            ) : (
              <Link
                to="/"
                hash="contact"
                onClick={closeIfOpen}
                className={`${TAB} text-paper/70 hover:text-paper`}
              >
                <TabIcon name="contact" />
                Contact
              </Link>
            )}
          </li>
          <li className="contents">
            <button
              ref={btnRef}
              type="button"
              onClick={() => (open ? close() : setOpen(true))}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className={`${TAB} ${tone(open)}`}
            >
              {open && <ActiveMark />}
              <TabIcon name="menu" />
              Menu
            </button>
          </li>
        </ul>
      </nav>
      {/* Fond assombri : un tap ferme le menu. */}
      {open && (
        <div
          aria-hidden
          data-testid="menu-backdrop"
          onClick={() => close()}
          className="fixed inset-x-0 top-0 z-50 bg-black/60 lg:hidden"
          style={{ bottom: aboveTabBar }}
        />
      )}
      {/* Menu en panneau qui monte du bas (« bottom sheet »), au-dessus de la barre d'onglets. */}
      <div
        ref={panelRef}
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className={`anim-sheet fixed inset-x-0 z-50 overflow-y-auto overscroll-contain rounded-t-2xl border-t border-paper/20 bg-card shadow-[0_-12px_32px_rgba(0,0,0,0.5)] lg:hidden ${dragY ? "" : "transition-transform duration-200 motion-reduce:transition-none"}`}
        style={{
          bottom: aboveTabBar,
          maxHeight: "calc(100dvh - 64px - env(safe-area-inset-bottom, 0px) - 24px)",
          transform: dragY ? `translateY(${dragY}px)` : undefined,
        }}
      >
        <div
          data-testid="menu-handle"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
          className="relative flex cursor-grab touch-none items-center justify-between px-5 pb-1 pt-4"
        >
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-paper/40"
          />
          <span className="label text-muted-foreground">Menu</span>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => close()}
            aria-label="Fermer le menu"
            className="-mr-2 inline-flex h-12 w-12 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
        <nav aria-label="Menu" className="px-5 pb-5">
          <ul className="border-t">
            {MENU_LINKS.map((l) => {
              const active = pathname === l.to && hash === l.hash;
              return (
                <li key={l.label} className="border-b">
                  <Link
                    to={l.to}
                    hash={l.hash}
                    onClick={() => close(false)}
                    aria-current={active ? "page" : undefined}
                    data-menu-link
                    className={`title flex min-h-14 items-center justify-between gap-4 py-2 text-3xl hover:text-primary ${active ? "text-primary" : ""}`}
                  >
                    {l.label}
                    <span aria-hidden className="text-2xl text-primary">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/devis"
            onClick={() => close(false)}
            className="mt-5 flex min-h-14 items-center justify-center bg-primary px-6 py-4 text-lg font-bold text-primary-foreground"
          >
            Composer mon devis →
          </Link>
          <ul
            aria-label="Informations légales"
            className="label mt-3 flex flex-wrap gap-x-5 text-muted-foreground"
          >
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => close(false)}
                  aria-current={pathname === l.to ? "page" : undefined}
                  className={`link-y inline-flex min-h-12 items-center ${pathname === l.to ? "text-foreground" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

/** Demande à l'en-tête mobile de rester visible un instant (défilement programmé). */
export function pinHeader() {
  window.dispatchEvent(new Event("megalopole:pin-header"));
}

/**
 * En-tête mobile (< lg) qui se masque quand on fait défiler vers le bas et revient dès
 * qu'on remonte (sans animation si mouvements réduits). Desktop : toujours visible.
 */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const href = useRouterState({ select: (st) => st.location.href });
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023.98px)");
    let last = window.scrollY;
    let anchor = last;
    let dir = 0;
    let raf = 0;
    let pinUntil = 0;
    const apply = (h: boolean) => {
      setHidden(h);
      document.documentElement.toggleAttribute("data-header-hidden", h);
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const d = Math.sign(y - last);
      if (d && d !== dir) {
        dir = d;
        anchor = last;
      }
      last = y;
      if (!mq.matches || y < 120 || performance.now() < pinUntil) return apply(false);
      if (dir > 0 && y - anchor > 12) apply(true);
      else if (dir < 0 && anchor - y > 12) apply(false);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onPin = () => {
      pinUntil = performance.now() + 1200;
      apply(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("megalopole:pin-header", onPin);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("megalopole:pin-header", onPin);
      document.documentElement.removeAttribute("data-header-hidden");
    };
  }, []);
  // Navigation (page ou ancre) : l'en-tête reste visible pendant le défilement qui suit.
  useEffect(() => {
    pinHeader();
  }, [href]);
  return [hidden, () => setHidden(false)] as const;
}

export function SiteHeader() {
  const [hidden, show] = useHideOnScroll();
  return (
    <>
      <LaunchBanner />
      <header
        data-hidden={hidden || undefined}
        onFocus={show}
        className={`sticky top-0 z-40 border-b bg-background transition-transform duration-200 motion-reduce:transition-none lg:translate-y-0 lg:bg-background/90 lg:backdrop-blur ${hidden ? "-translate-y-full" : ""}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5 lg:py-4">
          <Logo className="h-9 lg:h-12" />
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-3 md:gap-6 lg:flex"
          >
            <Link to="/" hash="comment" className="label link-y">
              Comment ça marche
            </Link>
            <Link to="/" hash="offres" className="label link-y">
              Formules
            </Link>
            <Link to="/options" className="label link-y">
              Options
            </Link>
            <Link to="/" hash="faq" className="label link-y">
              FAQ
            </Link>
            <QuoteCartButton />
            <CtaButton small />
          </nav>
        </div>
      </header>
    </>
  );
}

/** Action principale vers le devis (libellé unique sur tout le site). */
export function DevisCta({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/devis"
      className={`inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-7 py-4 text-center text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${className}`}
    >
      Composer mon devis →
    </Link>
  );
}

/**
 * Action secondaire : « Écrire sur WhatsApp » (bordure). Sans numéro WhatsApp :
 * « Prendre rendez-vous » vers le formulaire de contact.
 */
export function CtaButton({ small }: { small?: boolean }) {
  const wa = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  const cls = `inline-flex items-center justify-center gap-2 border-2 border-primary font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground ${small ? "min-h-11 px-4 py-2 text-sm" : "min-h-12 px-7 py-4 text-lg"}`;
  if (wa)
    return (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Écrire sur WhatsApp (nouvelle fenêtre)"
        className={cls}
      >
        <WhatsAppIcon className={small ? "size-4" : "size-5"} />
        Écrire sur WhatsApp
      </a>
    );
  return (
    <Link to="/" hash="contact" className={cls}>
      Prendre rendez-vous →
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
        <div className="flex flex-wrap gap-3">
          <DevisCta />
        </div>
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
  { label: "Composer mon devis", to: "/devis" },
];

export function Footer() {
  const wa = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  return (
    <footer className="border-t">
      <div
        className={`mx-auto grid max-w-6xl gap-8 px-5 pt-12 sm:grid-cols-[1fr_auto] sm:items-end ${wa ? "pb-12 lg:pb-28" : "pb-12"}`}
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
