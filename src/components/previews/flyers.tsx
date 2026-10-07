import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BRANDS,
  BrandSwatch,
  CharField,
  PreviewShell,
  QrTile,
  SvgBrandRow,
  SwatchGroup,
  brandById,
  fitSvgText,
  svgFont,
  wrapText,
  type Brand,
} from "./shared";

/*
 * Aperçu d'un flyer recto-verso qu'on peut retourner, posé sur une pile (lot de 500).
 * Le retournement se fait sans perspective : à l'arrêt, les faces restent parfaitement nettes.
 */

export const FLYER_MAX_CHARS = 30;
const DEFAULT_TEXT = "Votre fidélité récompensée";
const W = 100;
const H = 141;

function Recto({ brand, text }: { brand: Brand; text: string }) {
  const refs = useRef<(SVGTextElement | null)[]>([]);
  const pillRef = useRef<SVGTextElement>(null);
  const [pillW, setPillW] = useState(60);
  const lines = wrapText(text || " ", 13, 3);
  useEffect(() => {
    fitSvgText(refs.current, 84);
  }, [text]);
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    fitSvgText([el], 75);
    let w = 60;
    try {
      w = Math.min(75, el.getComputedTextLength());
    } catch {
      w = 60;
    }
    setPillW(w + 9);
  }, [brand.reward]);
  const top = 36;
  const lh = 12;
  const pillY = top + (lines.length - 1) * lh + 7;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" aria-hidden="true">
      <rect width={W} height={H} fill={brand.bg} />
      <SvgBrandRow brand={brand} x={8} y={8} size={10} fontSize={5.2} />
      {lines.map((l, i) => (
        <text
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          x={8}
          y={top + i * lh}
          fontSize={11.6}
          fontWeight={900}
          letterSpacing={-0.3}
          fill={brand.fg}
          style={svgFont}
        >
          {l}
        </text>
      ))}
      <g transform={`translate(8 ${pillY})`}>
        <rect width={pillW} height={8.5} rx={4.25} fill={brand.acc} />
        <text
          ref={pillRef}
          x={4.5}
          y={5.9}
          fontSize={4.6}
          fontWeight={800}
          fill={brand.ink}
          style={svgFont}
        >
          {brand.reward} au 10e passage
        </text>
      </g>
      <QrTile x={28} y={84} size={44} />
      <text
        x={W / 2}
        y={136}
        textAnchor="middle"
        fontSize={5}
        fontWeight={800}
        letterSpacing={0.5}
        fill={brand.fg}
        style={svgFont}
      >
        SCANNEZ-MOI
      </text>
    </svg>
  );
}

const STEPS: [string, string, string][] = [
  ["Scannez", "le QR code avec", "l'appareil photo"],
  ["Ajoutez la carte", "à votre téléphone,", "sans appli ni compte"],
  ["Cumulez et profitez", "un tampon à chaque", "passage"],
];

function Verso({ brand }: { brand: Brand }) {
  const titleRef = useRef<SVGTextElement>(null);
  useEffect(() => {
    fitSvgText([titleRef.current], 84);
  }, []);
  const paper = "#FBF8F2";
  const ink = "#1b1712";
  // Fond du verso clair : pour le Fournil (déjà clair), les pastilles prennent l'accent.
  const dot = brand.id === "fournil" ? brand.acc : brand.bg;
  const dotInk = brand.id === "fournil" ? brand.ink : brand.fg;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" aria-hidden="true">
      <rect width={W} height={H} fill={paper} />
      <text
        x={8}
        y={14}
        fontSize={4.2}
        fontWeight={700}
        letterSpacing={0.8}
        fill={ink}
        opacity=".55"
        style={svgFont}
      >
        CARTE DE FIDÉLITÉ
      </text>
      <text
        ref={titleRef}
        x={8}
        y={27}
        fontSize={9.4}
        fontWeight={900}
        letterSpacing={-0.3}
        fill={ink}
        style={svgFont}
      >
        Comment ça marche
      </text>
      {STEPS.map(([t, a, b], i) => {
        const y = 42 + i * 24;
        return (
          <g key={t}>
            <circle cx={14} cy={y + 3} r={6} fill={dot} />
            <text
              x={14}
              y={y + 5.6}
              textAnchor="middle"
              fontSize={7}
              fontWeight={900}
              fill={dotInk}
              style={svgFont}
            >
              {i + 1}
            </text>
            <text x={25} y={y + 2} fontSize={6.6} fontWeight={800} fill={ink} style={svgFont}>
              {t}
            </text>
            <text x={25} y={y + 9.5} fontSize={4.6} fill={ink} opacity=".7" style={svgFont}>
              {a}
            </text>
            <text x={25} y={y + 15} fontSize={4.6} fill={ink} opacity=".7" style={svgFont}>
              {b}
            </text>
          </g>
        );
      })}
      <line x1={8} y1={113} x2={92} y2={113} stroke={ink} strokeOpacity=".12" strokeWidth=".4" />
      <text x={8} y={121.5} fontSize={4.6} fill={ink} opacity=".7" style={svgFont}>
        Votre récompense :{" "}
        <tspan fontWeight={800} fill={ink}>
          {brand.reward.toLowerCase()}
        </tspan>
      </text>
      <rect x={0} y={127} width={W} height={14} fill={brand.bg} />
      <SvgBrandRow
        brand={brand}
        x={0}
        y={129.5}
        size={9}
        fontSize={4.6}
        anchor="middle"
        width={W}
      />
    </svg>
  );
}

const stageStyle: CSSProperties = {
  background: "radial-gradient(120% 90% at 45% 30%, #f3efe8 0%, #e2dcd2 55%, #cfc7ba 100%)",
};

const sceneVars: CSSProperties = {
  ["--fw" as string]: "clamp(140px, 40vw, 188px)",
  width: "var(--fw)",
  height: `calc(var(--fw) * ${H / W})`,
};

const sheet: CSSProperties = { position: "absolute", inset: 0, borderRadius: 2 };

function FlyerStack({ brand, text, verso }: { brand: Brand; text: string; verso: boolean }) {
  const under = [
    { t: "translate(-9%, 3%) rotate(-7deg)", o: 1 },
    { t: "translate(8%, 2.5%) rotate(5deg)", o: 1 },
    { t: "translate(-2%, 1.2%) rotate(-2deg)", o: 1 },
  ];
  return (
    <div className="relative" style={sceneVars} aria-hidden="true">
      {/* ombre de la pile */}
      <div
        style={{
          ...sheet,
          background: "rgba(40,30,18,.4)",
          filter: "blur(14px)",
          transform: "translate(4%, 5%) scale(1.04)",
        }}
      />
      {under.map((u, i) => (
        <div
          key={i}
          style={{
            ...sheet,
            transform: u.t,
            background: brand.bg,
            boxShadow: "0 1px 0 rgba(255,255,255,.35) inset, 0 2px 6px rgba(30,20,10,.28)",
            transition: "background-color .35s ease",
          }}
        />
      ))}
      {/* flyer du dessus, retournable */}
      <div
        className="transition-transform duration-700 ease-in-out motion-reduce:transition-none"
        style={{
          ...sheet,
          transformStyle: "preserve-3d",
          transform: verso ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          style={{
            ...sheet,
            backfaceVisibility: "hidden",
            overflow: "hidden",
            boxShadow: "0 10px 24px rgba(30,20,10,.3), 0 2px 4px rgba(30,20,10,.25)",
          }}
        >
          <Recto brand={brand} text={text} />
        </div>
        <div
          style={{
            ...sheet,
            backfaceVisibility: "hidden",
            overflow: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 10px 24px rgba(30,20,10,.3), 0 2px 4px rgba(30,20,10,.25)",
          }}
        >
          <Verso brand={brand} />
        </div>
      </div>
    </div>
  );
}

export function FlyersPreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [brandId, setBrandId] = useState<Brand["id"]>("smash");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [verso, setVerso] = useState(false);
  const brand = brandById(brandId);
  const face = verso ? "Verso" : "Recto";
  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={stageStyle}
      stageClass="h-[320px] sm:h-[380px]"
      sceneClass="px-4 pb-12 pt-10"
      label={
        verso
          ? `Aperçu : verso du flyer ${brand.name}, les 3 étapes : scannez, ajoutez la carte, cumulez et profitez`
          : `Aperçu : recto du flyer ${brand.name}, accroche « ${text || "sans accroche"} », QR code et « Scannez-moi », posé sur une pile de flyers`
      }
      caption={face}
      captionClass="text-ink/60"
      announce={`${face} du flyer, couleurs de ${brand.name}`}
      scene={<FlyerStack brand={brand} text={text} verso={verso} />}
      overlay={
        <button
          type="button"
          onClick={() => setVerso((v) => !v)}
          className="label absolute bottom-2 right-2 z-10 inline-flex min-h-10 items-center gap-2 bg-ink px-3 py-2 text-paper outline-none transition-colors hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M13 6.5A5.2 5.2 0 0 0 3.3 5M3 9.5a5.2 5.2 0 0 0 9.7 1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M3 2v3.3h3.3M13 14v-3.3H9.7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
          {verso ? "Voir le recto" : "Voir le verso"}
        </button>
      }
      note="Recto-verso, à vos couleurs · livrés en lot de 500"
    >
      <SwatchGroup
        label="Couleurs"
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
      <CharField
        label="Votre accroche"
        value={text}
        onChange={(v) => {
          setText(v);
          setVerso(false);
        }}
        max={FLYER_MAX_CHARS}
        placeholder={DEFAULT_TEXT}
      />
    </PreviewShell>
  );
}
