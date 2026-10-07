import {
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type SVGProps,
} from "react";

/*
 * Briques communes des aperçus produits (plaque, présentoir, vitrophanie, flyers, design) :
 * QR d'exemple, cadre « Aperçu », sélecteur de pastilles, champ avec compteur, cartes fictives.
 * Tout est en CSS/SVG, sans image externe.
 */

/* ---------- QR d'exemple ---------- */

/* QR 29 × 29 (contenu : « Carte fidelite demo - megalopole »), une ligne hexadécimale par rangée. */
const QR_ROWS = [
  "1fda0c7f", "104a1341", "174abc5d", "175b745d", "175cd55d", "105ae241", "1fd5557f", "144d00",
  "1170f9f9", "1c9f05f7", "1059e441", "178bbcfa", "12cb8b88", "1436d577", "add1969", "1d1c4f51",
  "16c9e908", "1e2b0c7d", "7e1edc1", "720a9c8", "1a7d89f8", "12ff14", "1fdc3755", "10416f1b",
  "1756ebf8", "1742b189", "174f2a8b", "1043896b", "1fd9693a",
]; // prettier-ignore
export const QR_N = 29;

export const QR_PATH = (() => {
  let d = "";
  QR_ROWS.forEach((hex, y) => {
    const v = parseInt(hex, 16);
    let x = 0;
    while (x < QR_N) {
      if ((v >> (QR_N - 1 - x)) & 1) {
        let len = 1;
        while (x + len < QR_N && (v >> (QR_N - 1 - x - len)) & 1) len++;
        d += `M${x} ${y}h${len}v1h-${len}z`;
        x += len;
      } else x++;
    }
  });
  return d;
})();

/** Modules du QR seuls, placés dans un carré (x, y, size) d'un SVG parent. */
export function QrMarks({
  x,
  y,
  size,
  ...rest
}: { x: number; y: number; size: number } & SVGProps<SVGPathElement>) {
  return <path d={QR_PATH} transform={`translate(${x} ${y}) scale(${size / QR_N})`} {...rest} />;
}

/** QR sur fond blanc arrondi (zone de silence comprise). */
export function QrTile({
  x,
  y,
  size,
  fg = "#111111",
  bg = "#ffffff",
  r,
}: {
  x: number;
  y: number;
  size: number;
  fg?: string;
  bg?: string;
  r?: number;
}) {
  const pad = size * 0.08;
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={r ?? size * 0.07} fill={bg} />
      <QrMarks x={x + pad} y={y + pad} size={size - pad * 2} fill={fg} />
    </g>
  );
}

/* ---------- texte SVG ---------- */

/** Resserre les textes SVG plus larges que `max` (unités du viewBox). */
export function fitSvgText(els: (SVGTextElement | null)[], max: number) {
  const list = els.filter((e): e is SVGTextElement => !!e);
  list.forEach((e) => {
    e.removeAttribute("textLength");
    e.removeAttribute("lengthAdjust");
  });
  list.forEach((e) => {
    let w = 0;
    try {
      w = e.getComputedTextLength();
    } catch {
      w = 0;
    }
    if (w > max) {
      e.setAttribute("textLength", String(max));
      e.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
  });
}

/** Coupe un texte en lignes d'environ `perLine` caractères (au plus `maxLines`). */
export function wrapText(text: string, perLine: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + " " + w).length <= perLine)
      lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  if (lines.length > maxLines) {
    const head = lines.slice(0, maxLines - 1);
    head.push(lines.slice(maxLines - 1).join(" "));
    return head;
  }
  return lines;
}

export const svgFont: CSSProperties = { fontFamily: "var(--font-sans)" };

/* ---------- cartes d'exemple (enseignes fictives, mêmes couleurs que l'accueil) ---------- */

type IconFn = (cut: string) => ReactNode;

const burger: IconFn = () => (
  <>
    <path d="M3 10.2C3 5.6 7 3 12 3s9 2.6 9 7.2z" fill="currentColor" />
    <rect x="2" y="12" width="20" height="3.2" rx="1.6" fill="currentColor" />
    <path d="M3 17.2h18v1.4c0 1.4-1.1 2.4-2.4 2.4H5.4C4 21 3 20 3 18.6z" fill="currentColor" />
  </>
);
const cup: IconFn = () => (
  <>
    <path
      d="M8 2.5c-1 1.1 1 2 0 3.3M12 2.5c-1 1.1 1 2 0 3.3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M3 8h14v5.5A6.5 6.5 0 0 1 10.5 20h-1A6.5 6.5 0 0 1 3 13.5z" fill="currentColor" />
    <path
      d="M17 10h1.2a2.8 2.8 0 0 1 0 5.6h-1.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect x="2" y="20.6" width="17" height="1.8" rx=".9" fill="currentColor" />
  </>
);
const bread: IconFn = (cut) => (
  <>
    <path
      d="M2.5 15.2C2.5 9.6 6.8 6 12 6s9.5 3.6 9.5 9.2c0 2-1.4 3.3-3.2 3.3H5.7c-1.8 0-3.2-1.3-3.2-3.3z"
      fill="currentColor"
    />
    <path
      d="M7.2 14.2l2.2-4.4M11 14.6l2.2-4.6M14.8 14.2l2.2-4.4"
      fill="none"
      stroke={cut}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </>
);
const scissors: IconFn = (cut) => (
  <>
    <path
      d="M8.2 15.4L18.5 2.8M15.8 15.4L5.5 2.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="6.2" cy="18" r="3.1" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="17.8" cy="18" r="3.1" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="12" cy="10.7" r="1" fill={cut} />
  </>
);

export type Brand = {
  id: "smash" | "cafe" | "fournil" | "barbier";
  name: string;
  short: string;
  bg: string;
  fg: string;
  acc: string;
  ink: string;
  border: string;
  panel: string;
  ring: string;
  reward: string;
  icon: IconFn;
};

export const BRANDS: Brand[] = [
  {
    id: "smash",
    name: "Smash Club",
    short: "Smash",
    bg: "#151515",
    fg: "#FFFFFF",
    acc: "#FFD60A",
    ink: "#000000",
    border: "rgba(255,255,255,.18)",
    panel: "rgba(255,255,255,.10)",
    ring: "rgba(255,255,255,.40)",
    reward: "Menu offert",
    icon: burger,
  },
  {
    id: "cafe",
    name: "Café Lumière",
    short: "Café",
    bg: "#3B2416",
    fg: "#FFF6E8",
    acc: "#F2C14E",
    ink: "#3B2416",
    border: "rgba(255,246,232,.16)",
    panel: "rgba(255,246,232,.10)",
    ring: "rgba(255,246,232,.42)",
    reward: "Café offert",
    icon: cup,
  },
  {
    id: "fournil",
    name: "Fournil du Port",
    short: "Fournil",
    bg: "#F3E3C3",
    fg: "#2B1A0D",
    acc: "#8A4B1F",
    ink: "#FFF6E8",
    border: "rgba(43,26,13,.14)",
    panel: "rgba(43,26,13,.07)",
    ring: "rgba(43,26,13,.35)",
    reward: "Viennoiserie offerte",
    icon: bread,
  },
  {
    id: "barbier",
    name: "Barbier Riviera",
    short: "Barbier",
    bg: "#0F2A44",
    fg: "#FFFFFF",
    acc: "#E9E4D8",
    ink: "#0F2A44",
    border: "rgba(255,255,255,.16)",
    panel: "rgba(255,255,255,.10)",
    ring: "rgba(255,255,255,.40)",
    reward: "Coupe offerte",
    icon: scissors,
  },
];

export const brandById = (id: Brand["id"]): Brand => BRANDS.find((b) => b.id === id) ?? BRANDS[0]!;

/** Icône de l'enseigne en HTML. */
export function BrandIcon({ brand, className = "" }: { brand: Brand; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {brand.icon(brand.acc)}
    </svg>
  );
}

/** Pastille ronde d'enseigne pour le sélecteur. */
export function BrandSwatch({ brand }: { brand: Brand }) {
  return (
    <span
      className="flex h-full w-full items-center justify-center"
      style={{ background: brand.bg, color: brand.acc }}
    >
      <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" aria-hidden="true">
        {brand.icon(brand.bg)}
      </svg>
    </span>
  );
}

/** Logo (carré d'accent + icône) et nom de l'enseigne dans un SVG parent. */
export function SvgBrandRow({
  brand,
  x,
  y,
  size,
  fontSize,
  color,
  anchor = "start",
  width,
}: {
  brand: Brand;
  x: number;
  y: number;
  size: number;
  fontSize: number;
  color?: string;
  anchor?: "start" | "middle";
  /** Largeur totale, requise pour centrer (anchor « middle »). */
  width?: number;
}) {
  const gap = size * 0.4;
  // Largeur approximative du nom pour centrer le bloc logo + nom.
  const textW = brand.name.length * fontSize * 0.62;
  const x0 = anchor === "middle" && width !== undefined ? x + (width - size - gap - textW) / 2 : x;
  return (
    <g>
      <rect x={x0} y={y} width={size} height={size} rx={size * 0.22} fill={brand.acc} />
      <g
        transform={`translate(${x0 + size * 0.14} ${y + size * 0.14}) scale(${(size * 0.72) / 24})`}
        style={{ color: brand.ink }}
      >
        {brand.icon(brand.acc)}
      </g>
      <text
        x={x0 + size + gap}
        y={y + size / 2 + fontSize * 0.36}
        fontSize={fontSize}
        fontWeight={800}
        letterSpacing={fontSize * 0.04}
        fill={color ?? brand.fg}
        style={svgFont}
      >
        {brand.name.toUpperCase()}
      </text>
    </g>
  );
}

/* ---------- sélecteurs ---------- */

/** Navigation clavier d'un radiogroup (flèches, Début, Fin), focus déplacé avec la sélection. */
export function useRoving<T extends string>(
  ids: readonly T[],
  value: T,
  onChange: (id: T) => void,
) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = ids.indexOf(value);
    const n = ids.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = ids[next];
    if (id !== undefined) onChange(id);
    refs.current[next]?.focus();
  };
  const setRef = (i: number) => (el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  };
  return { onKeyDown, setRef };
}

export type SwatchOption<T extends string> = {
  id: T;
  label: string;
  /** Nom complet lu par les lecteurs d'écran si le libellé visible est abrégé. */
  fullLabel?: string;
  /** Fond CSS de la pastille, ou contenu à afficher dedans. */
  swatch: string | ReactNode;
};

export function SwatchGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  gridClass,
}: {
  label: string;
  options: SwatchOption<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Classes de grille littérales (ex. « grid-cols-5 gap-1 sm:gap-2 »). */
  gridClass: string;
}) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const { onKeyDown, setRef } = useRoving(
    options.map((o) => o.id),
    value,
    onChange,
  );
  return (
    <div>
      <p id={labelId} className="label mb-3 text-muted-foreground">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className={`grid ${gridClass}`}
      >
        {options.map((o, i) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              ref={setRef(i)}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={o.fullLabel}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(o.id)}
              className={`group flex min-w-0 flex-col items-center gap-2 rounded-sm px-1 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${on ? "bg-muted" : "hover:bg-muted/60"}`}
            >
              <span
                className={`block h-9 w-9 overflow-hidden rounded-full ring-offset-2 ring-offset-card transition-shadow ${on ? "ring-2 ring-primary" : "ring-1 ring-paper/25 group-hover:ring-paper/50"}`}
                style={typeof o.swatch === "string" ? { background: o.swatch } : undefined}
              >
                {typeof o.swatch === "string" ? null : o.swatch}
              </span>
              <span
                className={`max-w-full break-words text-center text-[11px] leading-tight sm:text-xs lg:text-sm ${on ? "font-bold text-foreground" : "text-muted-foreground"}`}
              >
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Choix textuel (ex. tailles) sous forme de boutons segmentés. */
export function SegmentGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  hint?: ReactNode;
}) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const { onKeyDown, setRef } = useRoving(
    options.map((o) => o.id),
    value,
    onChange,
  );
  return (
    <div>
      <p id={labelId} className="label mb-3 text-muted-foreground">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o, i) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              ref={setRef(i)}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(o.id)}
              className={`min-w-0 rounded-sm border-2 px-2 py-2.5 text-sm font-bold tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${on ? "border-primary bg-primary text-primary-foreground" : "border-paper/20 text-muted-foreground hover:border-paper/50 hover:text-foreground"}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Champ texte court avec compteur de caractères. */
export function CharField({
  label,
  value,
  onChange,
  max,
  placeholder,
  optional = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder?: string;
  optional?: boolean;
}) {
  const uid = useId();
  const inputId = `${uid}-champ`;
  const counterId = `${uid}-compteur`;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="label text-muted-foreground">
          {label} {optional && <span className="normal-case tracking-normal">(facultatif)</span>}
        </label>
        <span
          id={counterId}
          className={`font-mono text-xs tabular-nums ${value.length >= max ? "text-primary" : "text-muted-foreground"}`}
          aria-live="polite"
        >
          {value.length}/{max}
        </span>
      </div>
      <input
        id={inputId}
        type="text"
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        aria-describedby={counterId}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        className="w-full rounded-sm border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
      />
    </div>
  );
}

/* ---------- cadre commun ---------- */

export function PreviewShell({
  layout = "stack",
  className = "",
  stageStyle,
  stageClass = "min-h-[300px] sm:min-h-[380px]",
  sceneClass = "px-4 pb-12 pt-14",
  label,
  caption,
  captionClass = "text-ink/55",
  overlay,
  announce,
  scene,
  children,
  note,
}: {
  layout?: "stack" | "split";
  className?: string;
  stageStyle?: CSSProperties;
  /** Hauteur de la scène (fixe de préférence, pour éviter les sauts). */
  stageClass?: string;
  sceneClass?: string;
  /** Description de la scène pour les lecteurs d'écran. */
  label: string;
  caption?: ReactNode;
  captionClass?: string;
  /** Éléments interactifs posés sur la scène (hors de l'image). */
  overlay?: ReactNode;
  /** Phrase annoncée discrètement quand un réglage change. */
  announce?: string;
  scene: ReactNode;
  children: ReactNode;
  note: ReactNode;
}) {
  const split = layout === "split";
  return (
    <div
      className={`grid min-w-0 border bg-card ${split ? "md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]" : ""} ${className}`}
    >
      <div
        style={stageStyle}
        className={`relative flex overflow-hidden ${stageClass} ${split ? "md:h-auto md:min-h-[380px]" : ""}`}
      >
        <div
          role="img"
          aria-label={label}
          className={`relative flex min-w-0 flex-1 items-center justify-center ${sceneClass}`}
        >
          {scene}
        </div>
        <span
          className="label absolute right-3 top-3 z-10 bg-primary px-2 py-1 text-primary-foreground"
          aria-hidden="true"
        >
          Aperçu
        </span>
        {caption && (
          <span
            className={`label absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] truncate ${captionClass}`}
            aria-hidden="true"
          >
            {caption}
          </span>
        )}
        {overlay}
      </div>
      <div
        className={`flex min-w-0 flex-col gap-6 p-5 sm:p-6 ${split ? "md:justify-center md:p-8" : ""}`}
      >
        {children}
        <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
      </div>
      {announce !== undefined && (
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
      )}
    </div>
  );
}

/** Mode « mouvement réduit » demandé par le système. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
