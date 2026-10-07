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
 * Aperçu du Pack réseaux sociaux : un profil générique (aucun logo de réseau réel)
 * du commerce choisi, avec la grille des vidéos du mois, un commentaire et sa réponse,
 * et la fiche d'établissement tenue à jour.
 */

/* ---------- icônes génériques ---------- */

type IconProps = { className?: string; style?: CSSProperties };

export function PlayIcon({ className = "", style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  );
}
export function HeartIcon({ className = "", style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.6-7.5 10-7.5 10z"
        fill="currentColor"
      />
    </svg>
  );
}
export function BubbleIcon({ className = "", style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function ShareIcon({ className = "", style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M4 12.5 20 4.5l-5 15.5-3.2-6.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function PinIcon({ className = "", style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 21.5s-6.5-6.2-6.5-11.3a6.5 6.5 0 0 1 13 0c0 5.1-6.5 11.3-6.5 11.3z"
        fill="currentColor"
      />
      <circle cx="12" cy="10.2" r="2.4" fill="#fff" />
    </svg>
  );
}

/* ---------- contenus d'exemple par enseigne (fictifs) ---------- */

type Social = {
  handle: string;
  bio: string;
  posts: string;
  followers: string;
  views: string[];
  comment: { who: string; text: string };
  reply: string;
  hours: string;
  rating: string;
  reviews: string;
};

const SOCIAL: Record<Brand["id"], Social> = {
  smash: {
    handle: "smashclub",
    bio: "Smash burgers · Cannes",
    posts: "48",
    followers: "2 140",
    views: ["3,4 k", "1,2 k", "980", "2,1 k", "760", "1,5 k"],
    comment: { who: "Inès K.", text: "Le meilleur burger de la ville !" },
    reply: "Merci Inès ! Le menu du vendredi vous attend.",
    hours: "Ouvert · ferme à 23 h",
    rating: "4,8",
    reviews: "212 avis",
  },
  cafe: {
    handle: "cafelumiere",
    bio: "Café de spécialité · Antibes",
    posts: "63",
    followers: "1 870",
    views: ["2,2 k", "1,1 k", "640", "1,8 k", "890", "1,3 k"],
    comment: { who: "Léa M.", text: "Ce flat white, une merveille." },
    reply: "Merci Léa, à demain pour le prochain !",
    hours: "Ouvert · ferme à 18 h",
    rating: "4,9",
    reviews: "168 avis",
  },
  fournil: {
    handle: "fournilduport",
    bio: "Boulangerie · Nice",
    posts: "39",
    followers: "1 320",
    views: ["1,9 k", "870", "1,4 k", "620", "2,6 k", "730"],
    comment: { who: "Karim D.", text: "Vous faites encore la fougasse le dimanche ?" },
    reply: "Oui Karim, tous les dimanches dès 7 h !",
    hours: "Ouvert · ferme à 19 h 30",
    rating: "4,7",
    reviews: "254 avis",
  },
  barbier: {
    handle: "barbierriviera",
    bio: "Barbier · Grasse",
    posts: "57",
    followers: "2 460",
    views: ["4,1 k", "1,6 k", "1,1 k", "2,8 k", "940", "1,9 k"],
    comment: { who: "Yanis B.", text: "Dégradé parfait, comme toujours." },
    reply: "Merci Yanis, à dans trois semaines !",
    hours: "Ouvert · ferme à 20 h",
    rating: "4,9",
    reviews: "187 avis",
  },
};

/* ---------- briques ---------- */

function Avatar({ brand, size }: { brand: Brand; size: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: brand.bg,
        color: brand.acc,
        boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${brand.acc}`,
      }}
    >
      <BrandIcon brand={brand} className="h-[58%] w-[58%]" />
    </span>
  );
}

function Tile({ brand, i, views }: { brand: Brand; i: number; views: string }) {
  // Variation de fond d'une vignette à l'autre, toujours aux couleurs de l'enseigne.
  const angle = [160, 200, 135, 220, 180, 120][i % 6];
  const light = i % 3 === 1;
  return (
    <div
      className="relative overflow-hidden rounded-[3px]"
      style={{
        aspectRatio: "3 / 4",
        background: light
          ? `linear-gradient(${angle}deg, ${brand.acc}, ${brand.bg})`
          : `linear-gradient(${angle}deg, ${brand.bg}, ${brand.acc}55)`,
        color: light ? brand.ink : brand.acc,
      }}
    >
      <BrandIcon
        brand={brand}
        className="absolute left-1/2 top-[42%] h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 opacity-90"
      />
      <span className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[8px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">
        <PlayIcon className="h-2.5 w-2.5" />
        {views}
      </span>
    </div>
  );
}

function Phone({ brand, s }: { brand: Brand; s: Social }) {
  return (
    <div className="relative h-[344px] w-[170px] shrink-0 rounded-[1.6rem] border-[5px] border-[#111] bg-white p-2.5 text-[#111] shadow-[0_18px_40px_rgba(0,0,0,.28)] sm:h-[392px] sm:w-[204px]">
      <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-black/15" />
      {/* en-tête du profil */}
      <div className="flex items-center justify-between">
        <span className="truncate text-[11px] font-bold">@{s.handle}</span>
        <span className="flex gap-[3px]" aria-hidden="true">
          <span className="h-1 w-1 rounded-full bg-black/60" />
          <span className="h-1 w-1 rounded-full bg-black/60" />
          <span className="h-1 w-1 rounded-full bg-black/60" />
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <Avatar brand={brand} size={40} />
        <div className="grid flex-1 grid-cols-2 text-center leading-tight">
          {[
            [s.posts, "publications"],
            [s.followers, "abonnés"],
          ].map(([n, l]) => (
            <div key={l} className="min-w-0">
              <div className="text-[11px] font-bold">{n}</div>
              <div className="truncate text-[7.5px] text-black/55">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[10px] font-bold leading-tight">{brand.name}</p>
      <p className="text-[9px] leading-tight text-black/60">{s.bio}</p>
      <div className="mt-2 grid grid-cols-2 gap-1">
        <span
          className="rounded-[4px] py-1 text-center text-[8.5px] font-bold text-white"
          style={{ background: brand.id === "fournil" ? brand.acc : brand.bg }}
        >
          S'abonner
        </span>
        <span className="rounded-[4px] bg-black/[.07] py-1 text-center text-[8.5px] font-bold">
          Message
        </span>
      </div>
      {/* onglets : vidéos sélectionnées */}
      <div className="mt-2 grid grid-cols-2 border-b border-black/10 text-center text-[8px] font-bold uppercase tracking-wide">
        <span className="border-b-2 border-black pb-1">Vidéos</span>
        <span className="pb-1 text-black/40">Photos</span>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-[3px]">
        {s.views.map((v, i) => (
          <Tile key={i} brand={brand} i={i} views={v} />
        ))}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg bg-white p-2.5 text-[#111] shadow-[0_10px_28px_rgba(0,0,0,.22)] ${className}`}
    >
      {children}
    </div>
  );
}

function CommentCard({ brand, s }: { brand: Brand; s: Social }) {
  return (
    <Card className="w-[158px] sm:w-[178px]">
      <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-black/50">
        <BubbleIcon className="h-3 w-3" />
        Commentaire
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[9px] font-bold">
          {s.comment.who.charAt(0)}
        </span>
        <p className="min-w-0 text-[9.5px] leading-snug">
          <b>{s.comment.who}</b> {s.comment.text}
        </p>
      </div>
      <div
        className="mt-1.5 ml-4 flex gap-1.5 border-l-2 pl-1.5"
        style={{ borderColor: brand.acc }}
      >
        <Avatar brand={brand} size={18} />
        <p className="min-w-0 text-[9.5px] leading-snug">
          <b>{brand.name}</b> {s.reply}
        </p>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[8px] text-black/50">
        <HeartIcon className="h-2.5 w-2.5" style={{ color: "#e0245e" }} />
        Réponse du lundi au vendredi
      </div>
    </Card>
  );
}

function ListingCard({ brand, s }: { brand: Brand; s: Social }) {
  return (
    <Card className="w-[128px] sm:w-[156px]">
      <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-black/50">
        <PinIcon className="h-3 w-3" style={{ color: "#d93025" }} />
        Fiche Google
      </div>
      <p className="mt-1 truncate text-[10.5px] font-bold">{brand.name}</p>
      <p className="flex items-center gap-1 text-[9px]">
        <b>{s.rating}</b>
        <span className="tracking-[-1px] text-[#f5a623]" aria-hidden="true">
          ★★★★★
        </span>
        <span className="text-black/50">({s.reviews})</span>
      </p>
      <p className="text-[9px] font-semibold text-[#188038]">{s.hours}</p>
      <div className="mt-1.5 grid grid-cols-3 gap-[3px]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="rounded-[2px]"
            style={{
              aspectRatio: "1",
              background:
                i === 1
                  ? brand.acc
                  : `linear-gradient(${140 + i * 40}deg, ${brand.bg}, ${brand.acc}66)`,
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-[8px] text-black/50">Photos et horaires à jour</p>
    </Card>
  );
}

const stageStyle: CSSProperties = {
  background: [
    "radial-gradient(80% 70% at 30% 20%, rgba(255,255,255,.6), rgba(255,255,255,0) 70%)",
    "linear-gradient(160deg, #ece6dc 0%, #ddd4c6 100%)",
  ].join(","),
};

export function ReseauxPreview({
  layout = "stack",
  className = "",
}: {
  layout?: "stack" | "split";
  className?: string;
}) {
  const [brandId, setBrandId] = useState<Brand["id"]>("smash");
  const brand = brandById(brandId);
  const s = SOCIAL[brandId];
  return (
    <PreviewShell
      layout={layout}
      className={className}
      stageStyle={stageStyle}
      stageClass="h-[420px] sm:h-[460px]"
      sceneClass="px-2 pb-10 pt-10"
      label={`Aperçu : profil de ${brand.name} sur les réseaux sociaux, avec une grille de 6 vidéos courtes, un commentaire client et sa réponse, et la fiche Google à jour (${s.rating} étoiles, ${s.hours})`}
      caption={`Profil @${s.handle}`}
      captionClass="text-ink/60"
      announce={`Profil aux couleurs de ${brand.name}`}
      scene={
        <div className="relative h-[344px] w-[300px] sm:h-[392px] sm:w-[372px]">
          <div className="absolute left-0 top-0">
            <Phone brand={brand} s={s} />
          </div>
          <div className="anim-float absolute right-0 top-3">
            <ListingCard brand={brand} s={s} />
          </div>
          <div className="absolute bottom-2 right-0">
            <CommentCard brand={brand} s={s} />
          </div>
        </div>
      }
      note="4 vidéos par mois · publication · réponses aux messages · fiche Google"
    >
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
    </PreviewShell>
  );
}
