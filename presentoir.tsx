import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import {
  BRANDS,
  BrandSwatch,
  CharField,
  PreviewShell,
  QR_PATH,
  QR_N,
  SwatchGroup,
  brandById,
  fitSvgText,
  wrapText,
  type Brand,
} from "./shared";

/*
 * Aperçu du présentoir QR : petit chevalet de table en L, autoporté, en acrylique bicouche
 * de 1,6 mm gravé au laser (la gravure révèle la couche du dessous), face de 7 × 6 cm.
 * Logo + nom du commerce, QR et texte facultatif gravés. Rendu 100 % CSS/SVG,
 * projection orthogonale (sans perspective) : la gravure reste nette.
 */

export const PRESENTOIR_MAX_CHARS = 40;
const DEFAULT_TEXT = "Votre carte de fidélité";

type Finish = {
  id: "argent" | "or" | "noir" | "vert" | "bleu" | "bronze";
  label: string;
  /** Surface (couche du dessus). */
  surface: string;
  /** Teinte unie proche de la surface (découpes des pictos, liserés). */
  flat: string;
  /** Couleur de la couche du dessous = couleur de la gravure et du cœur de la tranche. */
  engrave: string;
  /** Pastille du sélecteur. */
  swatch: string;
  metal: boolean;
};

const brushed = (stops: string) =>
  [
    "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.28) 46%, rgba(255,255,255,0) 60%)",
    "repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.05) 1px 2px, rgba(255,255,255,0) 2px 3px)",
    `linear-gradient(160deg, ${stops})`,
  ].join(",");

const glossy = (stops: string, sheen = 0.12) =>
  [
    `linear-gradient(118deg, rgba(255,255,255,0) 32%, rgba(255,255,255,${sheen}) 46%, rgba(255,255,255,0) 60%)`,
    `linear-gradient(160deg, ${stops})`,
  ].join(",");

const FINISHES: Finish[] = [
  {
    id: "argent",
    label: "Argent",
    surface: brushed("#9da2a8, #d9dce0 32%, #f3f4f6 48%, #b8bdc3 70%, #a3a8ae"),
    flat: "#cfd3d8",
    engrave: "#141518",
    swatch: "linear-gradient(140deg, #f3f4f6, #b8bdc3 55%, #8e949b)",
    metal: true,
  },
  {
    id: "or",
    label: "Or",
    surface: brushed("#a87a26, #e9c873 32%, #f6e3a1 48%, #c99a3f 70%, #a9802e"),
    flat: "#dcb662",
    engrave: "#16130e",
    swatch: "linear-gradient(140deg, #f6e3a1, #c99a3f 55%, #9c7426)",
    metal: true,
  },
  {
    id: "noir",
    label: "Noir",
    surface: glossy("#2a2b2e, #111214 55%, #1c1d20", 0.1),
    flat: "#18191b",
    engrave: "#f1f1ee",
    swatch: "linear-gradient(140deg, #34353a, #0e0f11)",
    metal: false,
  },
  {
    id: "vert",
    label: "Vert",
    surface: glossy("#1f6a47, #134a31 55%, #1a5a3c", 0.14),
    flat: "#175338",
    engrave: "#f3f5f2",
    swatch: "linear-gradient(140deg, #2a8a5d, #134a31 60%, #0d3824)",
    metal: false,
  },
  {
    id: "bleu",
    label: "Bleu",
    surface: glossy("#2552a6, #173a7c 55%, #1e4690", 0.14),
    flat: "#1b4287",
    engrave: "#e6eaef",
    swatch: "linear-gradient(140deg, #3466c4, #173a7c 60%, #0f2858)",
    metal: false,
  },
  {
    id: "bronze",
    label: "Bronze",
    surface: brushed("#9b6337, #d39a69 32%, #e8b88c 48%, #b57a4a 70%, #9a6438"),
    flat: "#c88f5f",
    engrave: "#170f0a",
    swatch: "linear-gradient(140deg, #e8b88c, #b57a4a 55%, #85532c)",
    metal: true,
  },
];

/* Style gravé du nom de chaque commerce (une seule couleur : celle de la gravure). */
const NAME_STYLE: Record<Brand["id"], CSSProperties & { size: number; upper: boolean }> = {
  smash: { size: 9.4, upper: true, fontWeight: 900, letterSpacing: 0.4, fontFamily: "var(--font-sans)" },
  cafe: { size: 11.5, upper: false, fontStyle: "italic", fontFamily: "var(--font-serif)" },
  fournil: { size: 8.6, upper: true, fontWeight: 600, letterSpacing: 1, fontFamily: "var(--font-serif)" },
  barbier: { size: 7.6, upper: true, fontWeight: 600, letterSpacing: 1.6, fontFamily: "var(--font-sans)" },
}; // prettier-ignore

/* Face gravée (viewBox 0 0 140 120 = 7 × 6 cm). */
const VB_W = 140;
const VB_H = 120;
const ICON = 13;
const GAP = 4;

/** Une ligne jusqu'à 24 caractères, sinon deux lignes équilibrées (coupe à l'espace le plus central). */
function splitLines(text: string): string[] {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return [];
  if (t.length <= 24) return [t];
  let best = -1;
  for (let i = 0; i < t.length; i++)
    if (t[i] === " " && (best < 0 || Math.abs(i - t.length / 2) < Math.abs(best - t.length / 2)))
      best = i;
  return best < 0 ? wrapText(t, 24, 2) : [t.slice(0, best), t.slice(best + 1)];
}

function Engraving({ finish, brand, text }: { finish: Finish; brand: Brand; text: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gid = `pr-eng-${uid}`;
  const rowRef = useRef<SVGGElement>(null);
  const nameRef = useRef<SVGTextElement>(null);
  const lineRefs = useRef<(SVGTextElement | null)[]>([]);
  const lines = splitLines(text);
  const ns = NAME_STYLE[brand.id];
  const name = ns.upper ? brand.name.toUpperCase() : brand.name;

  // Centre le bloc logo + nom, et resserre les textes trop larges pour la face.
  useEffect(() => {
    fitSvgText([nameRef.current], VB_W - 24 - ICON - GAP);
    fitSvgText(lineRefs.current, VB_W - 22);
    let w = 0;
    try {
      w = nameRef.current?.getComputedTextLength() ?? 0;
    } catch {
      w = 0;
    }
    w = Math.min(w, VB_W - 24 - ICON - GAP);
    rowRef.current?.setAttribute("transform", `translate(${(VB_W - (ICON + GAP + w)) / 2} 0)`);
  }, [brand.id, text, name]);

  const qrSize = lines.length ? 62 : 70;
  const qrY = lines.length ? 27 : 31;
  const lineY = lines.length === 1 ? 104.5 : 100;
  // Liseré lumineux sous la gravure (creux) sur les finitions métal.
  const hi = finish.metal ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.35)";
  const fill: CSSProperties = { transition: "color .35s ease" };

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <use
        href={`#${gid}`}
        transform={`translate(0 ${finish.metal ? 0.4 : -0.3})`}
        style={{ color: hi }}
      />
      <g style={{ ...fill, color: finish.engrave }}>
        <g id={gid} fill="currentColor">
          <g ref={rowRef} transform={`translate(${(VB_W - 100) / 2} 0)`}>
            <g transform={`translate(0 8) scale(${ICON / 24})`}>{brand.icon(finish.flat)}</g>
            <text
              ref={nameRef}
              x={ICON + GAP}
              y={8 + ICON / 2 + ns.size * 0.35}
              fontSize={ns.size}
              style={{
                fontFamily: ns.fontFamily,
                fontWeight: ns.fontWeight,
                fontStyle: ns.fontStyle,
                letterSpacing: ns.letterSpacing,
              }}
            >
              {name}
            </text>
          </g>
          <path
            d={QR_PATH}
            transform={`translate(${(VB_W - qrSize) / 2} ${qrY}) scale(${qrSize / QR_N})`}
          />
          {lines.map((l, i) => (
            <text
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              x={VB_W / 2}
              y={lineY + i * 10}
              textAnchor="middle"
              fontSize={8.4}
              fontWeight={600}
              letterSpacing={0.1}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {l}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}

/* Géométrie : largeur de face W, hauteur 6/7 W, épaisseur (dessinée un peu plus épaisse
 * que 1,6 mm pour rester visible), profondeur du pied. */
const W = "var(--pr-w)";
const H = "var(--pr-h)";
const T = "var(--pr-t)";
const D = "var(--pr-d)";

const sceneStyle: CSSProperties = {
  ["--pr-w" as string]: "clamp(168px, 50vw, 236px)",
  ["--pr-h" as string]: "calc(var(--pr-w) * 6 / 7)",
  ["--pr-t" as string]: "calc(var(--pr-w) * 0.04)",
  ["--pr-d" as string]: "calc(var(--pr-w) * 0.5)",
  width: "calc(var(--pr-w) * 1.12)",
  height: "calc(var(--pr-w) * 1.02)",
};

const bodyStyle: CSSProperties = {
  position: "absolute",
  left: "calc(var(--pr-w) * 0.02)",
  top: "calc(var(--pr-w) * 0.1)",
  width: W,
  height: H,
  transformStyle: "preserve-3d",
  // Vue de trois-quarts, légèrement plongeante ; projection orthogonale = gravure nette.
  transform: "rotateX(-18deg) rotateY(-32deg)",
};

const plane = (s: CSSProperties): CSSProperties => ({ position: "absolute", ...s });

/** Tranche bicouche : couleur de surface sur les deux faces, cœur (gravure) au milieu. */
const edge = (f: Finish, dir: string, shade: number): string =>
  `linear-gradient(rgba(0,0,0,${shade}), rgba(0,0,0,${shade})), linear-gradient(${dir}, ${f.flat} 0 22%, ${f.engrave} 22% 78%, ${f.flat} 78% 100%)`;

function Stand({ finish, brand, text }: { finish: Finish; brand: Brand; text: string }) {
  return (
    <div className="relative shrink-0" style={sceneStyle} aria-hidden="true">
      <div style={bodyStyle}>
        {/* ombre portée sur le comptoir, sous le pied */}
        <div
          style={plane({
            left: "-4%",
            top: H,
            width: "112%",
            height: `calc(${D} + ${T} + 8%)`,
            transformOrigin: "50% 0",
            transform: "rotateX(-90deg) translate(3%, 4%)",
            background: "rgba(36,24,12,.5)",
            filter: "blur(calc(var(--pr-w) * 0.04))",
            borderRadius: "6px",
          })}
        />
        <div
          style={plane({
            left: 0,
            top: H,
            width: W,
            height: `calc(${D} + ${T})`,
            transformOrigin: "50% 0",
            transform: "rotateX(-90deg)",
            background: "rgba(30,20,10,.45)",
            filter: "blur(2px)",
          })}
        />
        {/* ombre de contact au pied de la face */}
        <div
          style={plane({
            left: "1%",
            top: H,
            width: "98%",
            height: "10%",
            transformOrigin: "50% 0",
            transform: "rotateX(-90deg) translateY(-30%)",
            background: "rgba(30,20,10,.4)",
            filter: "blur(3px)",
          })}
        />
        {/* pied : dessus */}
        <div
          style={plane({
            left: 0,
            top: `calc(${H} - ${T})`,
            width: W,
            height: D,
            transformOrigin: "50% 0",
            transform: `translateZ(calc(${T} * -1)) rotateX(-90deg)`,
            background: `linear-gradient(rgba(255,255,255,.1), rgba(255,255,255,.1)), ${finish.surface}`,
          })}
        />
        {/* pied : tranche droite */}
        <div
          style={plane({
            left: W,
            top: `calc(${H} - ${T})`,
            width: D,
            height: T,
            transformOrigin: "0 50%",
            transform: `translateZ(calc(${T} * -1)) rotateY(90deg)`,
            background: edge(finish, "180deg", 0.28),
          })}
        />
        {/* face : tranche du haut */}
        <div
          style={plane({
            left: 0,
            top: 0,
            width: W,
            height: T,
            transformOrigin: "50% 0",
            transform: "rotateX(-90deg)",
            background: edge(finish, "0deg", 0),
          })}
        />
        {/* face : tranche droite */}
        <div
          style={plane({
            left: W,
            top: 0,
            width: T,
            height: H,
            transformOrigin: "0 50%",
            transform: "rotateY(90deg)",
            background: edge(finish, "270deg", 0.3),
          })}
        />
        {/* face avant gravée */}
        <div
          className="overflow-hidden"
          style={plane({
            inset: 0,
            boxShadow: finish.metal
              ? "inset 0 0 0 1px rgba(255,255,255,.35)"
              : "inset 0 0 0 1px rgba(255,255,255,.12)",
          })}
        >
          {FINISHES.map((f) => (
            <div
              key={f.id}
              className="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
              style={{ background: f.surface, opacity: f.id === finish.id ? 1 : 0 }}
            />
          ))}
          <Engraving finish={finish} brand={brand} text={text} />
        </div>
      </div>
    </div>
  );
}

const stageStyle: CSSProperties = {
  background: [
    // lumière douce venant de la gauche
    "radial-gradient(90% 70% at 35% 25%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)",
    // jonction mur / comptoir
    "linear-gradient(180deg, rgba(0,0,0,0) 47%, rgba(60,40,20,.18) 48%, rgba(0,0,0,0) 51%)",
    "linear-gradient(180deg, #ebe5dc 0%, #e0d8cc 48%, #d6bf9c 48%, #caa77b 100%)",
  ].join(","),
};

export function PresentoirPreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [finishId, setFinishId] = useState<Finish["id"]>("noir");
  const [brandId, setBrandId] = useState<Brand["id"]>("smash");
  const [text, setText] = useState(DEFAULT_TEXT);
  const finish: Finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[2]!;
  const brand = brandById(brandId);
  const f = finish.label.toLowerCase();
  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={stageStyle}
      stageClass="h-[300px] sm:h-[360px]"
      sceneClass="px-4 pb-10 pt-12"
      label={`Aperçu : présentoir en L finition ${f} posé sur un comptoir, gravé au logo de ${brand.name}, avec QR code${text.trim() ? ` et « ${text.trim()} »` : ""}`}
      caption={`Finition ${f} · ${brand.name}`}
      captionClass="text-ink/60"
      announce={`Finition ${f}, ${brand.name}`}
      scene={
        <>
          {/* veinage du comptoir */}
          <div
            className="absolute inset-x-0 bottom-0 h-[52%]"
            style={{
              background:
                "repeating-linear-gradient(179deg, rgba(110,70,30,0) 0 6px, rgba(110,70,30,.06) 6px 7px, rgba(110,70,30,0) 7px 13px), linear-gradient(180deg, rgba(255,255,255,.18), rgba(0,0,0,.06))",
            }}
          />
          <Stand finish={finish} brand={brand} text={text} />
        </>
      }
      note="7 × 6 cm · acrylique gravé au laser · recto-verso · pose libre, sans perçage"
    >
      <SwatchGroup
        label="Finition"
        options={FINISHES.map((x) => ({ id: x.id, label: x.label, swatch: x.swatch }))}
        value={finishId}
        onChange={setFinishId}
        gridClass="grid-cols-6 gap-0.5 sm:gap-2"
      />
      <SwatchGroup
        label="Votre commerce"
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
        label="Votre texte"
        value={text}
        onChange={setText}
        max={PRESENTOIR_MAX_CHARS}
        placeholder={DEFAULT_TEXT}
      />
    </PreviewShell>
  );
}
