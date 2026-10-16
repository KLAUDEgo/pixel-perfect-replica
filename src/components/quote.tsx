import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  isPackOption,
  optionMaxQty,
  options,
  packExplain,
  unitCount,
  type PackOption,
} from "@/data/content";
import { offers, type OfferSlug } from "@/data/services";
import { emptyQuote, type Billing, type QuoteState } from "@/lib/quote";

const KEY = "megalopole-devis";
/**
 * Version du devis enregistré. v2 : plaques et présentoirs comptés à l'unité
 * (avant : en lots de 8). Un devis sans version est migré (n lots → n × 8 unités).
 */
const STORE_VERSION = 2;
const MAX_QTY = 20;
/** Quantité maximale d'une option (1 pour une option mensuelle). */
const maxFor = (slug: string) => {
  const o = options.find((x) => x.slug === slug);
  return o ? optionMaxQty(o) : MAX_QTY;
};
const MAX_SITES = 10;

const clamp = (n: unknown, max: number) => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : 0;
};

/** Nettoie un devis relu depuis le navigateur (formules ou options supprimées, valeurs invalides). */
function sanitize(raw: unknown): QuoteState {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<QuoteState> & { v?: unknown };
  const offer = offers.some((o) => o.slug === r.offer) ? (r.offer as OfferSlug) : null;
  const oldFormat = r.v !== STORE_VERSION;
  const rawQty = r.qty && typeof r.qty === "object" ? r.qty : {};
  const qty: Record<string, number> = {};
  for (const o of options) {
    if (o.amount === null) continue;
    let n = clamp(rawQty[o.slug], 1e6);
    // Ancien devis : la quantité des plaques et présentoirs était un nombre de lots.
    if (oldFormat && isPackOption(o)) n *= o.pack.size;
    n = clamp(n, optionMaxQty(o));
    if (n > 0) qty[o.slug] = n;
  }
  return {
    offer,
    qty,
    extraSites: clamp(r.extraSites, MAX_SITES),
    billing: r.billing === "annual" ? "annual" : "monthly",
  };
}

type Ctx = {
  quote: QuoteState;
  loaded: boolean;
  setOffer: (o: OfferSlug) => void;
  setQty: (slug: string, n: number) => void;
  addOne: (slug: string) => void;
  setExtraSites: (n: number) => void;
  setBilling: (b: Billing) => void;
  reset: () => void;
  /** Dernière confirmation d'ajout d'option (affichée par <QuoteToast />). */
  toast: Toast | null;
  dismissToast: () => void;
};

type Toast = { id: number; text: string };

/** « 2 plaques ajoutées », « Au devis : Pack réseaux sociaux ». */
function addedText(slug: string, n: number) {
  const o = options.find((x) => x.slug === slug);
  if (!o) return "Ajouté à votre devis";
  if (isPackOption(o)) {
    // « plaque » → ajoutée(s), « présentoir » → ajouté(s).
    const fem = o.unit.one.endsWith("e");
    return `${unitCount(o, n)} ajouté${fem ? "e" : ""}${n > 1 ? "s" : ""}`;
  }
  return `Au devis\u00a0: ${n > 1 ? `${n}\u00a0× ` : ""}${o.name}`;
}

const QuoteContext = createContext<Ctx | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quote, setQuote] = useState<QuoteState>(emptyQuote);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setQuote(sanitize(JSON.parse(raw)));
    } catch {
      /* stockage indisponible : on garde le devis vide */
    }
    setLoaded(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      try {
        setQuote(e.newValue ? sanitize(JSON.parse(e.newValue)) : emptyQuote);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...quote, v: STORE_VERSION }));
    } catch {
      /* ignore */
    }
  }, [quote, loaded]);

  const [toast, setToast] = useState<Toast | null>(null);
  /** Confirme un ajout (quantité en hausse) d'une option. */
  const notify = (slug: string, next: number) => {
    if (next > (quote.qty[slug] ?? 0))
      setToast((t) => ({ id: (t?.id ?? 0) + 1, text: addedText(slug, next) }));
  };

  const value: Ctx = {
    quote,
    loaded,
    setOffer: (offer) => setQuote((q) => ({ ...q, offer })),
    setQty: (slug, n) => {
      notify(slug, clamp(n, maxFor(slug)));
      setQuote((q) => ({ ...q, qty: { ...q.qty, [slug]: clamp(n, maxFor(slug)) } }));
    },
    addOne: (slug) => {
      notify(slug, clamp((quote.qty[slug] ?? 0) + 1, maxFor(slug)));
      setQuote((q) => ({
        ...q,
        qty: { ...q.qty, [slug]: clamp((q.qty[slug] ?? 0) + 1, maxFor(slug)) },
      }));
    },
    setExtraSites: (n) => setQuote((q) => ({ ...q, extraSites: clamp(n, MAX_SITES) })),
    setBilling: (billing) => setQuote((q) => ({ ...q, billing })),
    reset: () => setQuote(emptyQuote),
    toast,
    dismissToast: () => setToast(null),
  };
  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const c = useContext(QuoteContext);
  if (!c) throw new Error("useQuote doit être utilisé dans <QuoteProvider>");
  return c;
}

/**
 * Nombre d'éléments dans le devis : la formule + chaque option + les établissements en plus
 * (plaques et présentoirs comptent pour un élément, quel que soit le nombre d'unités).
 */
export function quoteCount(q: QuoteState) {
  const opts = options.reduce((s, o) => {
    const n = q.qty[o.slug] ?? 0;
    return s + (n > 0 && isPackOption(o) ? 1 : n);
  }, 0);
  return (q.offer ? 1 : 0) + opts + q.extraSites;
}

/**
 * Confirmation d'ajout d'une option : « 2 plaques ajoutées · Voir → ».
 * Mobile : en haut, sous l'en-tête (ou en bas si le contrôle touché est en haut) ; desktop :
 * en bas. 4 s. Seuls le lien et la croix sont cliquables : le reste laisse passer les taps.
 * Inutile sur la page du devis, où le récapitulatif se met à jour sous les yeux.
 */
export function QuoteToast() {
  const { toast, dismissToast } = useQuote();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Zone du dernier contrôle touché (ex. le stepper) : le toast ne doit pas la recouvrir.
  const lastTap = useRef<{ top: number; bottom: number } | null>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("button, a, [role=group]");
      const r = (el ?? null)?.getBoundingClientRect();
      lastTap.current = r
        ? { top: r.top, bottom: r.bottom }
        : { top: e.clientY, bottom: e.clientY };
    };
    document.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => document.removeEventListener("pointerdown", onDown, { capture: true });
  }, []);

  // Mobile : en haut, juste sous l'en-tête (qui peut se masquer au défilement), sauf si le
  // contrôle touché s'y trouve : alors en bas, au-dessus de la barre d'onglets. Desktop : en bas.
  const [top, setTop] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!toast) return;
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const headerBottom = () => {
      const header = document.querySelector("header");
      if (!header || document.documentElement.hasAttribute("data-header-hidden")) return 0;
      // Position finale de l'en-tête collant (sans la translation en cours) : sous le bandeau
      // tant qu'il est visible, sinon en haut de l'écran.
      const banner = header.previousElementSibling?.getBoundingClientRect();
      return Math.max(0, banner?.bottom ?? 0) + header.offsetHeight;
    };
    const TOAST_H = 64;
    const t0 = headerBottom() + 8;
    const tap = lastTap.current;
    const atTop = mq.matches && !(tap && tap.bottom > t0 - 8 && tap.top < t0 + TOAST_H + 8);
    let raf = 0;
    const place = () => {
      raf = 0;
      setTop(atTop && mq.matches ? headerBottom() + 8 : null);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-header-hidden"],
    });
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);
  useEffect(() => {
    if (!toast) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(dismissToast, 4000);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);
  // Pas de confirmation qui traîne d'une page à l'autre.
  useEffect(() => {
    dismissToast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  const show = !!toast && pathname !== "/devis";
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 transition-[top] duration-200 motion-reduce:transition-none"
      style={
        top === null
          ? { bottom: "calc(var(--tabbar-h) + 24px)" }
          : { top: `calc(${top}px + env(safe-area-inset-top, 0px))` }
      }
    >
      {show && (
        <div
          key={toast.id}
          data-testid="quote-toast"
          className="anim-toast pointer-events-none flex w-full max-w-md items-center justify-between gap-2 border-2 border-ink bg-paper py-1.5 pl-3 pr-0.5 sm:gap-3 sm:pl-4 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          <p className="min-w-0 text-[13px] font-semibold sm:text-sm">
            <span aria-hidden>✓ </span>
            {toast.text}
          </p>
          <span className="flex shrink-0 items-center">
            <Link
              to="/devis"
              onClick={dismissToast}
              aria-label="Voir le devis"
              className="pointer-events-auto inline-flex min-h-11 items-center whitespace-nowrap bg-ink px-3 text-sm font-bold text-paper"
            >
              <span className="lg:hidden">Voir →</span>
              <span className="hidden lg:inline">Voir le devis →</span>
            </Link>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Fermer la confirmation"
              data-testid="toast-close"
              className="pointer-events-auto inline-flex size-11 items-center justify-center text-lg font-bold"
            >
              <span aria-hidden>×</span>
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

/** Bouton "Mon devis" dans l'en-tête. */
export function QuoteCartButton() {
  const { quote, loaded } = useQuote();
  const count = quoteCount(quote);
  return (
    <Link
      to="/devis"
      aria-label={`Mon devis${loaded && count ? `, ${count} élément${count > 1 ? "s" : ""}` : ""}`}
      className="label inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap border-2 border-paper/40 px-3 py-2 transition-colors hover:border-primary hover:text-primary"
    >
      Mon devis
      {loaded && count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center bg-primary px-1 text-[0.7rem] text-primary-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

/** "Choisir cette formule" : enregistre la formule puis ouvre le devis. */
export function ChooseOfferButton({
  slug,
  className = "",
}: {
  slug: OfferSlug;
  className?: string;
}) {
  const { setOffer } = useQuote();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        setOffer(slug);
        navigate({ to: "/devis" });
      }}
      className={`bg-primary px-5 py-3 text-center font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 ${className}`}
    >
      Choisir cette formule →
    </button>
  );
}

/** "Ajouter au devis" pour une option (« Ajouter / Retirer » pour une option mensuelle). */
export function AddOptionButton({ slug }: { slug: string }) {
  const { quote, addOne, setQty, loaded } = useQuote();
  const n = quote.qty[slug] ?? 0;
  const single = maxFor(slug) === 1;
  const added = loaded && single && n > 0;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => (added ? setQty(slug, 0) : addOne(slug))}
        className={`px-5 py-3 font-bold transition-transform hover:-translate-y-0.5 ${added ? "border-2 border-primary text-primary" : "bg-primary text-primary-foreground"}`}
      >
        {added ? "Retirer du devis" : "+ Ajouter au devis"}
      </button>
      <span aria-live="polite">
        {loaded && n > 0 && (
          <Link to="/devis" className="label link-y inline-flex min-h-11 items-center text-primary">
            {single ? "Dans votre devis" : `${n} dans votre devis`} → voir le devis
          </Link>
        )}
      </span>
    </div>
  );
}

/** Plaques / présentoirs : nombre d'unités + explication du prix appliqué (lot automatique). */
export function PackOptionPicker({ option }: { option: PackOption }) {
  const { quote, setQty, loaded } = useQuote();
  const n = loaded ? (quote.qty[option.slug] ?? 0) : 0;
  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Stepper
          value={n}
          onChange={(v) => setQty(option.slug, v)}
          label={`Nombre de ${option.unit.many}`}
          max={optionMaxQty(option)}
        />
        {n > 0 ? (
          <Link to="/devis" className="label link-y inline-flex min-h-11 items-center text-primary">
            Dans votre devis → voir le devis
          </Link>
        ) : (
          <span className="label text-muted-foreground">Nombre de {option.unit.many}</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {n > 0 ? (
          <b className="text-foreground">{packExplain(option, n)}</b>
        ) : (
          `Choisissez le nombre de ${option.unit.many} : le prix du lot s'applique dès qu'il est plus avantageux.`
        )}
      </p>
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  label,
  max = MAX_QTY,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  max?: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        className="h-11 w-11 shrink-0 border-2 border-paper/50 text-xl font-bold hover:border-paper disabled:cursor-not-allowed disabled:border-dashed disabled:border-paper/40 disabled:text-paper/60 disabled:hover:border-paper/40"
        aria-label={`Retirer : ${label}`}
      >
        −
      </button>
      <span className="title w-7 text-center text-2xl" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="h-11 w-11 shrink-0 bg-primary text-xl font-bold text-primary-foreground disabled:cursor-not-allowed disabled:bg-paper/20 disabled:text-paper/70"
        aria-label={`Ajouter : ${label}`}
      >
        +
      </button>
    </div>
  );
}
