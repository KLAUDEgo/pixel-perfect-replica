import { useEffect, useRef, useState } from "react";
import {
  BRANDS,
  BrandSwatch,
  CharField,
  PreviewShell,
  QrTile,
  SegmentGroup,
  SvgBrandRow,
  SwatchGroup,
  brandById,
  fitSvgText,
  svgFont,
  wrapText,
  type Brand,
} from "./shared";

/*
 * Aperçu d'une vitrophanie : une vitrine vue de la rue (vitre, montant, porte et sa poignée),
 * avec l'autocollant posé sur le verre. Le SVG est en centimètres (viewBox 100 × 75) :
 * la taille choisie (20 ou 40 cm) se lit à côté de la poignée de porte.
 */

export const VITRO_MAX_CHARS = 34;
const DEFAULT_TEXT = "Rejoignez notre carte de fidélité";

type Size = "20" | "40";
const SIZES: { id: Size; label: string }[] = [
  { id: "20", label: "20 × 20 cm" },
  { id: "40", label: "40 × 40 cm" },
];

/** Centre de l'autocollant sur la vitre (cm). */
const CX = 35;
const CY = 38;

function Sticker({ brand, text }: { brand: Brand; text: string }) {
  const refs = useRef<(SVGTextElement | null)[]>([]);
  const lines = wrapText(text || " ", 20, 2);
  useEffect(() => {
    fitSvgText(refs.current, 84);
  }, [text]);
  const top = lines.length === 1 ? 37 : 33;
  return (
    <g>
      <rect
        width={100}
        height={100}
        rx={5}
        fill={brand.bg}
        style={{ transition: "fill .35s ease" }}
      />
      <rect
        x={0.5}
        y={0.5}
        width={99}
        height={99}
        rx={4.6}
        fill="none"
        stroke="rgba(255,255,255,.18)"
      />
      <SvgBrandRow brand={brand} x={0} y={8} size={11} fontSize={6} anchor="middle" width={100} />
      {lines.map((l, i) => (
        <text
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          x={50}
          y={top + i * 9.6}
          textAnchor="middle"
          fontSize={8.6}
          fontWeight={800}
          letterSpacing={-0.12}
          fill={brand.fg}
          style={svgFont}
        >
          {l}
        </text>
      ))}
      <QrTile x={29} y={50} size={42} />
      <text
        x={50}
        y={97.2}
        textAnchor="middle"
        fontSize={4.2}
        fontWeight={800}
        letterSpacing={0.5}
        fill={brand.acc}
        style={svgFont}
      >
        SCANNEZ ICI
      </text>
    </g>
  );
}

function Shopfront({ brand, text, size }: { brand: Brand; text: string; size: Size }) {
  const s = Number(size);
  return (
    <svg
      viewBox="0 0 100 75"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vt-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9b79c" />
          <stop offset=".5" stopColor="#a48c6c" />
          <stop offset="1" stopColor="#6f5a43" />
        </linearGradient>
        <linearGradient id="vt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8f0f6" stopOpacity=".35" />
          <stop offset=".45" stopColor="#e8f0f6" stopOpacity=".1" />
          <stop offset="1" stopColor="#dfe8f0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="vt-glare" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".13" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="vt-alu" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f2124" />
          <stop offset=".35" stopColor="#3a3d42" />
          <stop offset=".6" stopColor="#2a2c30" />
          <stop offset="1" stopColor="#17181a" />
        </linearGradient>
        <linearGradient id="vt-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6d7278" />
          <stop offset=".3" stopColor="#f1f3f5" />
          <stop offset=".55" stopColor="#a9aeb4" />
          <stop offset="1" stopColor="#53575c" />
        </linearGradient>
        <filter id="vt-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id="vt-blur-s" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation=".5" />
        </filter>
      </defs>

      {/* intérieur de la boutique, flou derrière le verre */}
      <rect width={100} height={75} fill="url(#vt-in)" />
      <g filter="url(#vt-blur)">
        {/* suspensions allumées */}
        <circle cx={16} cy={5} r={5} fill="#fff2d6" opacity=".9" />
        <circle cx={46} cy={4} r={4.2} fill="#fff2d6" opacity=".85" />
        <circle cx={86} cy={6} r={5} fill="#fff2d6" opacity=".8" />
        {/* étagères et comptoir */}
        <rect x={4} y={20} width={48} height={1.8} fill="#5c4632" opacity=".45" />
        <rect x={4} y={34} width={48} height={1.8} fill="#5c4632" opacity=".4" />
        <rect x={8} y={15} width={6} height={5} fill="#7f2f22" opacity=".35" />
        <rect x={18} y={16} width={4} height={4} fill="#2f5d4f" opacity=".35" />
        <rect x={34} y={29} width={7} height={5} fill="#d8a64a" opacity=".35" />
        <rect x={0} y={52} width={58} height={23} fill="#4a3727" opacity=".7" />
        <rect x={0} y={52} width={58} height={2} fill="#e8d6b8" opacity=".5" />
        <rect x={76} y={26} width={20} height={49} fill="#5b4733" opacity=".5" />
      </g>

      {/* teinte du verre, puis reflets : ciel, façades d'en face, traînées de lumière */}
      <rect width={100} height={75} fill="#1d2a30" opacity=".22" />
      <rect width={100} height={75} fill="url(#vt-sky)" />
      <g fill="#fff" opacity=".04">
        <rect x={-2} y={0} width={20} height={16} />
        <rect x={20} y={0} width={14} height={11} />
        <rect x={36} y={0} width={24} height={14} />
        <rect x={68} y={0} width={18} height={18} />
        <rect x={88} y={0} width={14} height={9} />
      </g>
      <g fill="#fff" opacity=".05">
        {[2, 7, 12].map((x) => (
          <rect key={x} x={x} y={3} width={2.6} height={3.4} />
        ))}
        {[39, 45, 51].map((x) => (
          <rect key={x} x={x} y={3} width={3} height={3.6} />
        ))}
        {[71, 77].map((x) => (
          <rect key={x} x={x} y={4} width={2.6} height={3.4} />
        ))}
      </g>
      {/* autocollant collé sur la vitre */}
      <g
        className="transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{
          transform: `translate(${CX}px, ${CY}px) scale(${s / 100}) translate(-50px, -50px)`,
        }}
      >
        <Sticker brand={brand} text={text} />
      </g>

      <polygon points="6,75 20,75 48,0 34,0" fill="url(#vt-glare)" />
      <polygon points="24,75 28,75 56,0 52,0" fill="url(#vt-glare)" opacity=".7" />
      <polygon points="80,75 92,75 112,0 100,0" fill="url(#vt-glare)" opacity=".8" />

      {/* montant entre la vitrine et la porte */}
      <rect x={60} y={0} width={5.5} height={75} fill="url(#vt-alu)" />
      <rect x={60} y={0} width={0.35} height={75} fill="#5a5e63" />
      {/* porte : battant et joint */}
      <rect x={65.5} y={0} width={3.2} height={75} fill="url(#vt-alu)" />
      <rect x={68.7} y={0} width={0.25} height={75} fill="#0d0e0f" opacity=".7" />
      {/* bas de vitrine */}
      <rect x={0} y={66} width={100} height={9} fill="url(#vt-alu)" />
      <rect x={0} y={66} width={100} height={0.35} fill="#5a5e63" />

      {/* poignée de porte, pour l'échelle */}
      <rect
        x={75.6}
        y={23}
        width={2.2}
        height={34}
        rx={1.1}
        fill="#000"
        opacity=".35"
        filter="url(#vt-blur-s)"
      />
      <rect x={73.4} y={21} width={2.2} height={34} rx={1.1} fill="url(#vt-steel)" />
      <rect
        x={73.4}
        y={21}
        width={2.2}
        height={34}
        rx={1.1}
        fill="none"
        stroke="#2c2f33"
        strokeWidth=".15"
      />
    </svg>
  );
}

export function VitrophaniePreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [brandId, setBrandId] = useState<Brand["id"]>("smash");
  const [size, setSize] = useState<Size>("40");
  const [text, setText] = useState(DEFAULT_TEXT);
  const brand = brandById(brandId);
  const sizeLabel = SIZES.find((x) => x.id === size)?.label ?? "";
  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={{ background: "#16120f" }}
      stageClass="h-[320px] sm:h-[380px]"
      sceneClass=""
      label={`Aperçu : vitrine de boutique avec un autocollant ${sizeLabel} aux couleurs de ${brand.name}, QR code et « ${text || "sans phrase"} », à côté de la poignée de porte`}
      caption={`${sizeLabel} · ${brand.name.toLowerCase()}`}
      captionClass="text-paper/75"
      announce={`${sizeLabel}, couleurs de ${brand.name}`}
      scene={<Shopfront brand={brand} text={text} size={size} />}
      note="Adhésif enlevable, posé côté intérieur ou extérieur · visuel créé à vos couleurs"
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
      <SegmentGroup
        label="Taille"
        options={SIZES}
        value={size}
        onChange={setSize}
        hint="20 × 20 cm en Essentiel et Pro · 40 × 40 cm et plus en Premium"
      />
      <CharField
        label="Votre phrase"
        value={text}
        onChange={setText}
        max={VITRO_MAX_CHARS}
        placeholder={DEFAULT_TEXT}
      />
    </PreviewShell>
  );
}
