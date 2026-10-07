import { useState, type CSSProperties, type ReactNode } from "react";
import {
  BRANDS,
  BrandIcon,
  BrandSwatch,
  PreviewShell,
  SwatchGroup,
  brandById,
  type Brand,
} from "./shared";

/*
 * Aperçu d'un nouveau design de carte : la carte de fidélité dans un téléphone, déclinée
 * en thème saisonnier (couleurs sobres + petit motif SVG), appliqué à l'enseigne choisie.
 */

type ThemeId = "classique" | "ete" | "fetes" | "ramadan" | "anniversaire";

type Palette = Pick<Brand, "bg" | "fg" | "acc" | "ink" | "border" | "panel" | "ring">;

type Theme = {
  id: ThemeId;
  label: string;
  full: string;
  /** Palette du thème ; « classique » reprend celle de l'enseigne. */
  palette?: Palette;
  /** Motif décoratif posé dans le coin de la carte (viewBox 0 0 120 70). */
  deco?: (p: Palette) => ReactNode;
  /** Petit pictogramme de la pastille (viewBox 0 0 24 24). */
  mark?: (color: string) => ReactNode;
};

const light = (a: number) => `rgba(255,255,255,${a})`;

const sun = (c: string) => (
  <g fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" fill={c} stroke="none" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <line key={a} x1="12" y1="3" x2="12" y2="5.4" transform={`rotate(${a} 12 12)`} />
    ))}
  </g>
);
const star = (c: string) => (
  <path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z" fill={c} />
);
const crescent = (c: string) => (
  <path d="M15.5 3.5a8.5 8.5 0 1 0 5 15.4A7 7 0 0 1 15.5 3.5z" fill={c} />
);
const confetti = (c: string) => (
  <g fill={c}>
    <rect x="4" y="5" width="3" height="6" rx="1" transform="rotate(-25 5.5 8)" />
    <rect x="15" y="3" width="3" height="6" rx="1" transform="rotate(30 16.5 6)" />
    <circle cx="11" cy="13" r="2" />
    <rect x="6" y="16" width="3" height="5" rx="1" transform="rotate(40 7.5 18.5)" />
    <circle cx="18" cy="16" r="1.6" />
  </g>
);

/* Motifs des bandeaux décoratifs (viewBox 0 0 200 26, recadrés au besoin). */
const waves = (p: Palette) => (
  <g fill="none" strokeLinecap="round">
    <path
      d="M-10 11c8-5 14-5 22 0s14 5 22 0 14-5 22 0 14 5 22 0 14-5 22 0 14 5 22 0 14-5 22 0 14 5 22 0 14-5 22 0 14 5 22 0"
      stroke={p.acc}
      strokeWidth="1.6"
    />
    <path
      d="M1 19c8-5 14-5 22 0s14 5 22 0 14-5 22 0 14 5 22 0 14-5 22 0 14 5 22 0 14-5 22 0 14 5 22 0 14-5 22 0"
      stroke={p.fg}
      strokeOpacity=".35"
      strokeWidth="1.4"
    />
  </g>
);
const garland = (p: Palette) => (
  <g>
    <path
      d="M-5 4q25 14 50 0t50 0 50 0 50 0 50 0"
      fill="none"
      stroke={p.fg}
      strokeOpacity=".35"
      strokeWidth="1"
    />
    {[20, 70, 120, 170].map((x) => (
      <g key={x} transform={`translate(${x - 6} 5) scale(.5)`}>
        {star(p.acc)}
      </g>
    ))}
    {[45, 95, 145, 195].map((x) => (
      <circle key={x} cx={x} cy={7} r={2.6} fill={p.acc} fillOpacity=".75" />
    ))}
  </g>
);
const lanterns = (p: Palette) => (
  <g>
    <line x1="0" y1="1" x2="200" y2="1" stroke={p.acc} strokeOpacity=".5" strokeWidth=".8" />
    {[24, 76, 128, 180].map((x, i) => {
      const y = i % 2 ? 9 : 5;
      return (
        <g key={x} stroke={p.acc} strokeWidth=".9" fill="none">
          <line x1={x} y1="1" x2={x} y2={y} />
          <path d={`M${x - 3.5} ${y}h7l1.6 4-1.6 8h-7l-1.6-8z`} fill={p.acc} fillOpacity=".22" />
          <path d={`M${x - 5} ${y + 4}h10`} />
        </g>
      );
    })}
    <g transform="translate(44 6) scale(.62)">{crescent(p.acc)}</g>
    {[100, 154].map((x) => (
      <g key={x} transform={`translate(${x - 4} 9) scale(.34)`} opacity=".85">
        {star(p.acc)}
      </g>
    ))}
  </g>
);
const party = (p: Palette) => (
  <g>
    {[
      [8, 6, -25],
      [30, 15, 30],
      [52, 5, 60],
      [76, 14, -40],
      [98, 7, 15],
      [122, 16, -60],
      [146, 6, 35],
      [170, 14, -15],
      [192, 7, 50],
    ].map(([x, y, r], i) => (
      <rect
        key={i}
        x={x}
        y={y}
        width="3"
        height="7"
        rx="1"
        transform={`rotate(${r} ${x! + 1.5} ${y! + 3.5})`}
        fill={i % 3 === 1 ? p.fg : p.acc}
        fillOpacity={i % 3 === 1 ? 0.5 : 0.9}
      />
    ))}
    {[18, 64, 110, 134, 182].map((x, i) => (
      <circle key={x} cx={x} cy={i % 2 ? 7 : 19} r="1.8" fill={p.acc} />
    ))}
  </g>
);

const THEMES: Theme[] = [
  { id: "classique", label: "Classique", full: "Classique" },
  {
    id: "ete",
    label: "Été",
    full: "Été",
    palette: {
      bg: "#0B6672",
      fg: "#FFFFFF",
      acc: "#FFD166",
      ink: "#0B3F46",
      border: light(0.18),
      panel: light(0.12),
      ring: light(0.42),
    },
    mark: sun,
    deco: waves,
  },
  {
    id: "fetes",
    label: "Fêtes",
    full: "Fêtes de fin d'année",
    palette: {
      bg: "#143D2E",
      fg: "#FFF8EC",
      acc: "#E3BE62",
      ink: "#143D2E",
      border: "rgba(227,190,98,.3)",
      panel: "rgba(255,248,236,.09)",
      ring: "rgba(255,248,236,.4)",
    },
    mark: star,
    deco: garland,
  },
  {
    id: "ramadan",
    label: "Ramadan",
    full: "Ramadan",
    palette: {
      bg: "#16213F",
      fg: "#FFF8EC",
      acc: "#E9C46A",
      ink: "#16213F",
      border: "rgba(233,196,106,.28)",
      panel: "rgba(255,248,236,.09)",
      ring: "rgba(255,248,236,.4)",
    },
    mark: crescent,
    deco: lanterns,
  },
  {
    id: "anniversaire",
    label: "Anniv.",
    full: "Anniversaire",
    palette: {
      bg: "#5A1B3B",
      fg: "#FFF4F7",
      acc: "#F5B8C8",
      ink: "#5A1B3B",
      border: "rgba(245,184,200,.28)",
      panel: "rgba(255,244,247,.10)",
      ring: "rgba(255,244,247,.42)",
    },
    mark: confetti,
    deco: party,
  },
];

const FILLED = 6;

function SeasonPass({ brand, theme }: { brand: Brand; theme: Theme }) {
  const p: Palette = theme.palette ?? brand;
  const b = { ...brand, ...p };
  const sub =
    theme.id === "classique"
      ? "carte fidélité"
      : `carte ${theme.id === "fetes" ? "fêtes" : theme.id === "anniversaire" ? "anniv." : theme.full.toLowerCase()}`;
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl p-3.5 shadow-2xl transition-colors duration-300 motion-reduce:transition-none"
      style={{ background: p.bg, color: p.fg, border: `1px solid ${p.border}` }}
    >
      <div className="relative flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: p.acc, color: p.ink }}
        >
          <BrandIcon brand={b} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 leading-none">
          <div className="truncate whitespace-nowrap text-[14px] font-black uppercase tracking-tight">
            {brand.name}
          </div>
          <div className="label mt-1 truncate text-[8px] opacity-75">{sub}</div>
        </div>
        {theme.mark && (
          <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
            {theme.mark(p.acc)}
          </svg>
        )}
      </div>
      <div className="relative mt-3.5 rounded-xl p-2.5" style={{ background: p.panel }}>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="label text-[8px] opacity-80">tampons</span>
          <span className="whitespace-nowrap text-sm font-black leading-none">{FILLED} / 10</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="flex aspect-square items-center justify-center rounded-full border-2"
              style={
                i < FILLED
                  ? { background: p.acc, borderColor: p.acc, color: p.ink }
                  : { borderColor: p.ring }
              }
            >
              {i < FILLED && <BrandIcon brand={b} className="h-[60%] w-[60%]" />}
            </span>
          ))}
        </div>
      </div>
      <div className="label relative mt-3 flex justify-between gap-3 text-[8px]">
        <span className="min-w-0">
          récompense
          <b className="mt-0.5 block truncate font-sans text-[12px] normal-case tracking-normal">
            {brand.reward}
          </b>
        </span>
        <span className="shrink-0 text-right">
          membre
          <b className="mt-0.5 block whitespace-nowrap font-sans text-[12px] normal-case tracking-normal">
            Yanis B.
          </b>
        </span>
      </div>
      <svg
        viewBox="0 0 200 26"
        preserveAspectRatio="xMidYMid slice"
        className="-mx-3.5 -mb-3.5 mt-2.5 block h-[26px] w-[calc(100%+1.75rem)]"
        aria-hidden="true"
      >
        {theme.deco ? (
          theme.deco(p)
        ) : (
          <g style={{ color: p.fg }} opacity=".22">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <g key={k} transform={`translate(${k * 26 + 2} ${k % 2 ? 7 : 3}) scale(.55)`}>
                {brand.icon(p.bg)}
              </g>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-[236px] rounded-[2.3rem] bg-[#151515] p-2.5 shadow-[0_0_0_2px_#3a3a38,0_30px_70px_rgba(20,14,8,.45)]"
      aria-hidden="true"
    >
      <div className="relative h-[460px] overflow-hidden rounded-[1.9rem] bg-black px-2.5 pt-11">
        <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#151515]" />
        <div className="absolute left-5 top-3 text-[11px] font-bold text-white">9:41</div>
        {children}
      </div>
    </div>
  );
}

const stageStyle: CSSProperties = {
  background: "radial-gradient(120% 90% at 45% 30%, #f3efe8 0%, #e2dcd2 55%, #cfc7ba 100%)",
};

export function DesignPreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [themeId, setThemeId] = useState<ThemeId>("ete");
  const [brandId, setBrandId] = useState<Brand["id"]>("smash");
  const brand = brandById(brandId);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0]!;
  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={stageStyle}
      stageClass="h-[380px] sm:h-[400px]"
      sceneClass=""
      label={`Aperçu : carte de fidélité ${brand.name}, thème ${theme.full.toLowerCase()}, affichée dans un téléphone`}
      announce={`Thème ${theme.full.toLowerCase()}, carte ${brand.name}`}
      scene={
        <>
          {/* halo coloré derrière le téléphone, aux couleurs du thème */}
          {THEMES.map((t) => (
            <div
              key={t.id}
              className="absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none"
              style={{
                opacity: t.id === themeId ? 1 : 0,
                background: `radial-gradient(42% 60% at 50% 60%, ${(t.palette ?? brand).bg}55, transparent 75%)`,
              }}
            />
          ))}
          <div className="absolute left-1/2 top-7 -translate-x-1/2">
            <Phone>
              <p className="mb-2 text-lg font-black tracking-tight text-white">Cartes</p>
              <SeasonPass brand={brand} theme={theme} />
            </Phone>
          </div>
        </>
      }
      note="Mise à jour sur tous les téléphones de vos clients · les tampons sont conservés"
    >
      <SwatchGroup
        label="Thème"
        options={THEMES.map((t) => {
          const p = t.palette ?? brand;
          return {
            id: t.id,
            label: t.label,
            fullLabel: t.full,
            swatch: (
              <span
                className="flex h-full w-full items-center justify-center"
                style={{ background: p.bg }}
              >
                {t.mark ? (
                  <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden="true">
                    {t.mark(p.acc)}
                  </svg>
                ) : (
                  <BrandSwatch brand={brand} />
                )}
              </span>
            ),
          };
        })}
        value={themeId}
        onChange={setThemeId}
        gridClass="grid-cols-3 gap-1 min-[420px]:grid-cols-5 sm:gap-2"
      />
      <SwatchGroup
        label="Votre carte"
        options={BRANDS.map((b) => ({
          id: b.id,
          label: b.short,
          fullLabel: b.name,
          swatch: <BrandSwatch brand={b} />,
        }))}
        value={brandId}
        onChange={setBrandId}
        gridClass="grid-cols-4 gap-1 sm:gap-2"
      />
    </PreviewShell>
  );
}
