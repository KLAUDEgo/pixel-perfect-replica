import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  CharField,
  PreviewShell,
  QR_N,
  QR_PATH,
  SwatchGroup,
  fitSvgText,
} from "@/components/previews/shared";

/*
 * Aperçu d'une plaque QR de table : acrylique bicouche 8 × 8 cm,
 * QR + phrase gravés au laser (la gravure révèle la couche du dessous).
 * Rendu 100 % CSS/SVG, aucune image externe.
 */

export const PLAQUE_MAX_CHARS = 15;
const DEFAULT_PHRASE = "Carte fidélité";

type Finish = {
  id: "noir" | "blanc" | "or" | "argent" | "bronze";
  label: string;
  /** Surface de la plaque (couche du dessus). */
  surface: string;
  /** Couleur de la couche du dessous = couleur de la gravure et du cœur de la tranche. */
  engrave: string;
  /** Liseré de la couche du dessus visible sur la tranche. */
  cap: string;
  /** Pastille du sélecteur. */
  swatch: string;
  metal: boolean;
};

const brushed = (stops: string) =>
  [
    // reflet diagonal doux
    "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.28) 46%, rgba(255,255,255,0) 60%)",
    // stries de brossage horizontales
    "repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 1px, rgba(0,0,0,.05) 1px 2px, rgba(255,255,255,0) 2px 3px)",
    `linear-gradient(160deg, ${stops})`,
  ].join(",");

const FINISHES: Finish[] = [
  {
    id: "noir",
    label: "Noir",
    surface:
      "linear-gradient(125deg, rgba(255,255,255,0) 35%, rgba(255,255,255,.09) 48%, rgba(255,255,255,0) 62%), linear-gradient(160deg, #26272a, #111214 55%, #1b1c1f)",
    engrave: "#f1f1ee",
    cap: "#141416",
    swatch: "linear-gradient(140deg, #34353a, #0e0f11)",
    metal: false,
  },
  {
    id: "blanc",
    label: "Blanc",
    surface:
      "linear-gradient(125deg, rgba(255,255,255,0) 35%, rgba(255,255,255,.7) 48%, rgba(255,255,255,0) 62%), linear-gradient(160deg, #ffffff, #f2f1ed 60%, #e9e7e2)",
    engrave: "#17171a",
    cap: "#f4f3ef",
    swatch: "linear-gradient(140deg, #ffffff, #e4e2dc)",
    metal: false,
  },
  {
    id: "or",
    label: "Or",
    surface: brushed("#a87a26, #e9c873 32%, #f6e3a1 48%, #c99a3f 70%, #a9802e"),
    engrave: "#16130e",
    cap: "#d4ab52",
    swatch: "linear-gradient(140deg, #f6e3a1, #c99a3f 55%, #9c7426)",
    metal: true,
  },
  {
    id: "argent",
    label: "Argent",
    surface: brushed("#9da2a8, #d9dce0 32%, #f3f4f6 48%, #b8bdc3 70%, #a3a8ae"),
    engrave: "#141518",
    cap: "#c9cdd2",
    swatch: "linear-gradient(140deg, #f3f4f6, #b8bdc3 55%, #8e949b)",
    metal: true,
  },
  {
    id: "bronze",
    label: "Bronze",
    surface: brushed("#9b6337, #d39a69 32%, #e8b88c 48%, #b57a4a 70%, #9a6438"),
    engrave: "#170f0a",
    cap: "#c48a5a",
    swatch: "linear-gradient(140deg, #e8b88c, #b57a4a 55%, #85532c)",
    metal: true,
  },
];

/* Géométrie de la face (viewBox 0 0 100 100). */
const QR_SIZE = 62;
const QR_X = (100 - QR_SIZE) / 2;
const QR_Y = 11;
const TEXT_Y = 88;
const TEXT_MAX = 84;

function PlaqueFace({ finish, phrase }: { finish: Finish; phrase: string }) {
  const textRef = useRef<SVGTextElement>(null);
  const hiRef = useRef<SVGTextElement>(null);

  // Une phrase très large (ex. « WWWWWWWWWWWWWWW ») est resserrée pour rester dans la plaque.
  useEffect(() => {
    fitSvgText([textRef.current, hiRef.current], TEXT_MAX);
  }, [phrase]);

  const fill: CSSProperties = { transition: "fill .35s ease" };
  // Liseré lumineux sous la gravure (creux) sur les finitions métal.
  const hi = finish.metal ? "rgba(255,255,255,.55)" : "transparent";
  const qrTransform = (dy: number) => `translate(${QR_X} ${QR_Y + dy}) scale(${QR_SIZE / QR_N})`;
  const textProps = {
    x: 50,
    textAnchor: "middle" as const,
    fontSize: 9.2,
    fontWeight: 600,
    letterSpacing: 0.15,
    style: { ...fill, fontFamily: "var(--font-sans)" },
  };

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d={QR_PATH} transform={qrTransform(0.35)} fill={hi} />
      <path d={QR_PATH} transform={qrTransform(0)} fill={finish.engrave} style={fill} />
      <text ref={hiRef} y={TEXT_Y + 0.35} fill={hi} {...textProps}>
        {phrase}
      </text>
      <text ref={textRef} y={TEXT_Y} fill={finish.engrave} {...textProps}>
        {phrase}
      </text>
    </svg>
  );
}

const S = "var(--plaque-s)";
const T = "var(--plaque-t)";

const sceneStyle: CSSProperties = {
  // Tranche dessinée à 1/10 de la face.
  ["--plaque-s" as string]: "clamp(160px, 48vw, 236px)",
  ["--plaque-t" as string]: "calc(var(--plaque-s) * 0.1)",
  width: S,
  height: S,
  // Projection orthogonale : sans perspective, Chrome garde le QR et le texte nets.
};

const bodyStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  transformStyle: "preserve-3d",
  transform: "translateY(2%) rotateX(30deg) rotateY(-16deg) rotateZ(-2deg)",
};

const edgeShade = (top: number, bottom: number, dir = "180deg") =>
  `linear-gradient(${dir}, rgba(0,0,0,${top}), rgba(0,0,0,${bottom}))`;

function Plaque({ finish, phrase }: { finish: Finish; phrase: string }) {
  const dark = finish.id !== "noir"; // cœur sombre (gravure noire) sauf la plaque noire
  return (
    <div className="relative shrink-0" style={sceneStyle} aria-hidden="true">
      <div style={bodyStyle}>
        {/* ombre portée sur la table */}
        <div
          style={{
            position: "absolute",
            inset: "2%",
            background: "rgba(30,24,16,.55)",
            filter: "blur(calc(var(--plaque-s) * 0.055))",
            transform: "translate(5%, 6%)",
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20,16,10,.5)",
            filter: "blur(3px)",
            transform: "translate(1.5%, 2%)",
          }}
        />
        {/* tranche avant */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            width: S,
            height: T,
            transformOrigin: "50% 0",
            transform: `translateZ(${T}) rotateX(-90deg)`,
            background: `${edgeShade(dark ? 0 : 0.04, dark ? 0.25 : 0.2)}, ${finish.engrave}`,
            transition: "background-color .35s ease",
          }}
        >
          <span
            className="absolute inset-x-0 top-0 block"
            style={{ height: "16%", background: finish.cap, boxShadow: "0 1px 0 rgba(0,0,0,.18)" }}
          />
          {!dark && (
            <span
              className="absolute inset-x-0 bottom-0 block"
              style={{
                height: "40%",
                background: "linear-gradient(rgba(255,255,255,0), rgba(0,0,0,.08))",
              }}
            />
          )}
        </div>
        {/* tranche droite */}
        <div
          style={{
            position: "absolute",
            left: "100%",
            top: 0,
            width: T,
            height: S,
            transformOrigin: "0 50%",
            transform: `translateZ(${T}) rotateY(90deg)`,
            background: `${edgeShade(dark ? 0.25 : 0.22, dark ? 0.4 : 0.32, "90deg")}, ${finish.engrave}`,
          }}
        >
          <span
            className="absolute inset-y-0 left-0 block"
            style={{ width: "16%", background: finish.cap, filter: "brightness(.85)" }}
          />
        </div>
        {/* face gravée */}
        <div
          className="overflow-hidden"
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${T})`,
            boxShadow: finish.metal
              ? "inset 0 0 0 1px rgba(255,255,255,.35)"
              : "inset 0 0 0 1px rgba(127,127,127,.18)",
          }}
        >
          {FINISHES.map((f) => (
            <div
              key={f.id}
              className="absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none"
              style={{ background: f.surface, opacity: f.id === finish.id ? 1 : 0 }}
            />
          ))}
          <PlaqueFace finish={finish} phrase={phrase} />
        </div>
      </div>
    </div>
  );
}

const stageStyle: CSSProperties = {
  background: "radial-gradient(120% 90% at 45% 30%, #f3efe8 0%, #e2dcd2 55%, #cfc7ba 100%)",
};

export function PlaquePreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [finishId, setFinishId] = useState<Finish["id"]>("or");
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE);
  const finish: Finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[2]!;

  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={stageStyle}
      label={`Aperçu : plaque finition ${finish.label.toLowerCase()}, QR code et phrase « ${phrase || "aucune phrase"} » gravés`}
      caption={`Finition ${finish.label.toLowerCase()} · 8 × 8 cm`}
      announce={`Finition ${finish.label.toLowerCase()}`}
      scene={<Plaque finish={finish} phrase={phrase} />}
      note="8 × 8 cm · acrylique gravé au laser · adhésif, résiste à l'eau et aux UV · autres tailles sur demande"
    >
      <SwatchGroup
        label="Finition"
        options={FINISHES.map((f) => ({ id: f.id, label: f.label, swatch: f.swatch }))}
        value={finishId}
        onChange={setFinishId}
        gridClass="grid-cols-5 gap-1 sm:gap-2"
      />
      <CharField
        label="Votre phrase"
        value={phrase}
        onChange={setPhrase}
        max={PLAQUE_MAX_CHARS}
        placeholder={DEFAULT_PHRASE}
      />
    </PreviewShell>
  );
}
