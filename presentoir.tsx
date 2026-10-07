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
 * Aperçu d'un présentoir QR en plexi transparent (forme en T) posé sur un comptoir,
 * avec l'affiche à vos couleurs glissée dedans. Projection oblique 2D : rendu net.
 */

export const PRESENTOIR_MAX_CHARS = 30;
const DEFAULT_TEXT = "Votre carte de fidélité";

/* Repères (viewBox 0 0 200 250). */
const SHEET = { x: 55, y: 18, w: 100, h: 174 }; // feuille de plexi
const POSTER = { x: 59, y: 22, w: 92, h: 166 }; // affiche glissée dedans
const TH = { dx: 2.6, dy: -2.1 }; // épaisseur de la feuille
const BASE = { x: 30, y: 196, w: 140, h: 18, dx: 11, dy: -9 }; // socle

function Poster({ brand, text }: { brand: Brand; text: string }) {
  const refs = useRef<(SVGTextElement | null)[]>([]);
  const lines = wrapText(text || " ", 15, 2);
  useEffect(() => {
    fitSvgText(refs.current, 76);
  }, [text]);
  const { w, h } = POSTER;
  const top = lines.length === 1 ? 46 : 41;
  return (
    <g transform={`translate(${POSTER.x} ${POSTER.y})`}>
      <rect width={w} height={h} fill={brand.bg} style={{ transition: "fill .35s ease" }} />
      <SvgBrandRow brand={brand} x={0} y={9} size={11} fontSize={5.6} anchor="middle" width={w} />
      {lines.map((l, i) => (
        <text
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          x={w / 2}
          y={top + i * 10.5}
          textAnchor="middle"
          fontSize={9.6}
          fontWeight={800}
          letterSpacing={-0.15}
          fill={brand.fg}
          style={svgFont}
        >
          {l}
        </text>
      ))}
      <QrTile x={18} y={62} size={56} />
      <rect x={19} y={127} width={54} height={12.5} rx={6.25} fill={brand.acc} />
      <text
        x={w / 2}
        y={135.4}
        textAnchor="middle"
        fontSize={6}
        fontWeight={800}
        letterSpacing={0.3}
        fill={brand.ink}
        style={svgFont}
      >
        SCANNEZ-MOI
      </text>
      <text
        x={w / 2}
        y={155}
        textAnchor="middle"
        fontSize={4.6}
        fill={brand.fg}
        opacity=".7"
        style={svgFont}
      >
        Sans appli · sans compte
      </text>
    </g>
  );
}

function Stand({ brand, text }: { brand: Brand; text: string }) {
  const s = SHEET;
  const b = BASE;
  const edge = "#cfe8e2"; // tranche du plexi, légèrement verte comme le vrai acrylique
  return (
    <svg
      viewBox="0 0 200 250"
      className="block h-full w-auto"
      aria-hidden="true"
      style={{ aspectRatio: "200 / 250" }}
    >
      <defs>
        <filter id="pr-blur" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="4.5" />
        </filter>
        <filter id="pr-blur-s" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <linearGradient id="pr-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".45" stopColor="#fff" stopOpacity=".03" />
          <stop offset="1" stopColor="#fff" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="pr-glare" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pr-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".25" stopColor="#e9f5f2" stopOpacity=".28" />
          <stop offset="1" stopColor="#bcd9d2" stopOpacity=".42" />
        </linearGradient>
        <clipPath id="pr-sheet">
          <rect x={s.x} y={s.y} width={s.w} height={s.h} />
        </clipPath>
      </defs>

      {/* ombre portée sur le comptoir */}
      <ellipse cx={104} cy={212} rx={82} ry={9} fill="rgba(40,28,14,.42)" filter="url(#pr-blur)" />
      <rect
        x={b.x + 2}
        y={b.y + b.h - 2}
        width={b.w}
        height={3}
        fill="rgba(30,20,10,.45)"
        filter="url(#pr-blur-s)"
      />

      {/* socle : dessus, flanc droit */}
      <polygon
        points={`${b.x},${b.y} ${b.x + b.w},${b.y} ${b.x + b.w + b.dx},${b.y + b.dy} ${b.x + b.dx},${b.y + b.dy}`}
        fill="rgba(255,255,255,.34)"
        stroke="rgba(255,255,255,.85)"
        strokeWidth=".6"
      />
      <polygon
        points={`${b.x + b.w},${b.y} ${b.x + b.w + b.dx},${b.y + b.dy} ${b.x + b.w + b.dx},${b.y + b.dy + b.h} ${b.x + b.w},${b.y + b.h}`}
        fill={edge}
        fillOpacity=".55"
        stroke="rgba(255,255,255,.7)"
        strokeWidth=".5"
      />
      {/* fente du socle */}
      <polygon
        points={`${s.x - 1},${s.y + s.h + 1} ${s.x + s.w + 1},${s.y + s.h + 1} ${s.x + s.w + 1 + TH.dx},${s.y + s.h + 1 + TH.dy} ${s.x - 1 + TH.dx},${s.y + s.h + 1 + TH.dy}`}
        fill="rgba(60,80,76,.28)"
      />

      {/* feuille : tranches (dessus et droite) */}
      <polygon
        points={`${s.x},${s.y} ${s.x + s.w},${s.y} ${s.x + s.w + TH.dx},${s.y + TH.dy} ${s.x + TH.dx},${s.y + TH.dy}`}
        fill={edge}
        stroke="rgba(255,255,255,.9)"
        strokeWidth=".35"
      />
      <polygon
        points={`${s.x + s.w},${s.y} ${s.x + s.w + TH.dx},${s.y + TH.dy} ${s.x + s.w + TH.dx},${s.y + s.h + TH.dy} ${s.x + s.w},${s.y + s.h}`}
        fill={edge}
        fillOpacity=".9"
      />

      {/* affiche glissée dans le plexi */}
      <Poster brand={brand} text={text} />

      {/* face avant du plexi : teinte, reflets, arêtes */}
      <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="url(#pr-glass)" />
      <g clipPath="url(#pr-sheet)">
        <polygon
          points={`${s.x + 8},${s.y + s.h} ${s.x + 40},${s.y + s.h} ${s.x + 98},${s.y} ${s.x + 66},${s.y}`}
          fill="url(#pr-glare)"
        />
        <polygon
          points={`${s.x + 50},${s.y + s.h} ${s.x + 58},${s.y + s.h} ${s.x + 116},${s.y} ${s.x + 108},${s.y}`}
          fill="url(#pr-glare)"
          opacity=".6"
        />
      </g>
      <rect
        x={s.x + 0.3}
        y={s.y + 0.3}
        width={s.w - 0.6}
        height={s.h - 0.6}
        fill="none"
        stroke="rgba(255,255,255,.75)"
        strokeWidth=".6"
      />
      <line
        x1={s.x + 1.2}
        y1={s.y + 2}
        x2={s.x + 1.2}
        y2={s.y + s.h - 2}
        stroke="#fff"
        strokeOpacity=".5"
        strokeWidth=".5"
      />

      {/* face avant du socle, devant la feuille */}
      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#pr-front)" />
      <rect
        x={b.x + 0.3}
        y={b.y + 0.3}
        width={b.w - 0.6}
        height={b.h - 0.6}
        fill="none"
        stroke="rgba(255,255,255,.9)"
        strokeWidth=".6"
      />
      <line
        x1={b.x + 2}
        y1={b.y + b.h - 1}
        x2={b.x + b.w - 2}
        y2={b.y + b.h - 1}
        stroke={edge}
        strokeWidth="1.2"
      />
    </svg>
  );
}

const stageStyle: CSSProperties = {
  background: [
    // lumière douce venant de la gauche
    "radial-gradient(90% 70% at 35% 25%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)",
    // jonction mur / comptoir
    "linear-gradient(180deg, rgba(0,0,0,0) 57%, rgba(60,40,20,.18) 58%, rgba(0,0,0,0) 61%)",
    "linear-gradient(180deg, #ebe5dc 0%, #e0d8cc 58%, #d6bf9c 58%, #caa77b 100%)",
  ].join(","),
};

export function PresentoirPreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [brandId, setBrandId] = useState<Brand["id"]>("smash");
  const [text, setText] = useState(DEFAULT_TEXT);
  const brand = brandById(brandId);
  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={stageStyle}
      stageClass="h-[320px] sm:h-[380px]"
      sceneClass=""
      label={`Aperçu : présentoir en plexi transparent posé sur un comptoir, affiche ${brand.name} avec QR code, « ${text || "sans accroche"} » et « Scannez-moi »`}
      caption={`Affiche ${brand.name.toLowerCase()}`}
      captionClass="text-ink/60"
      announce={`Affiche aux couleurs de ${brand.name}`}
      scene={
        <>
          {/* veinage du comptoir */}
          <div
            className="absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background:
                "repeating-linear-gradient(179deg, rgba(110,70,30,0) 0 6px, rgba(110,70,30,.06) 6px 7px, rgba(110,70,30,0) 7px 13px), linear-gradient(180deg, rgba(255,255,255,.18), rgba(0,0,0,.06))",
            }}
          />
          <div className="absolute bottom-[6%] left-1/2 h-[86%] -translate-x-1/2">
            <Stand brand={brand} text={text} />
          </div>
        </>
      }
      note="Plexi transparent · affiche à vos couleurs glissée dedans · posé, sans perçage"
    >
      <SwatchGroup
        label="Couleurs de l'affiche"
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
        onChange={setText}
        max={PRESENTOIR_MAX_CHARS}
        placeholder={DEFAULT_TEXT}
      />
    </PreviewShell>
  );
}
