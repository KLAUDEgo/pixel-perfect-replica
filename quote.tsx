import { Link, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isPackOption, optionMaxQty, options, packExplain, type PackOption } from "@/data/content";
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
};

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

  const value: Ctx = {
    quote,
    loaded,
    setOffer: (offer) => setQuote((q) => ({ ...q, offer })),
    setQty: (slug, n) =>
      setQuote((q) => ({ ...q, qty: { ...q.qty, [slug]: clamp(n, maxFor(slug)) } })),
    addOne: (slug) =>
      setQuote((q) => ({
        ...q,
        qty: { ...q.qty, [slug]: clamp((q.qty[slug] ?? 0) + 1, maxFor(slug)) },
      })),
    setExtraSites: (n) => setQuote((q) => ({ ...q, extraSites: clamp(n, MAX_SITES) })),
    setBilling: (billing) => setQuote((q) => ({ ...q, billing })),
    reset: () => setQuote(emptyQuote),
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
