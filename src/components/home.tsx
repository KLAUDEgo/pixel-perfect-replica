import { Link } from "@tanstack/react-router";
import { CountrySelect } from "@/components/country-select";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  COMPANY,
  CONTACT_EMAIL,
  LAUNCH_OFFER,
  POLICY,
  QUOTE_CONFIG,
  SOCIAL_PACK_MONTHLY,
  euros,
  faq,
  fmtEuros,
  options,
  stats,
} from "@/data/content";
import { offers, type Offer } from "@/data/services";
import { Logo, Reveal, ServiceLink, SetupPrice } from "@/components/site";
import { ChooseOfferButton } from "@/components/quote";
import { WhatsAppIcon } from "@/components/whatsapp";
import { contactWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";
import { DEFAULT_COUNTRY, formatPhone, phoneError } from "@/lib/phone";

/* ---------- petits éléments réutilisables ---------- */

/** Typographie française : espace insécable avant : ; ? ! % € » et après «. */
const nb = (t: string) => t.replace(/[ \u202f]([:;?!%€»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");

/** Vrai si le numéro est renseigné (pas un gabarit du type « [TÉLÉPHONE] »). */
const HAS_PHONE = !!COMPANY.phone.trim() && !COMPANY.phone.trim().startsWith("[");

/** Retire d'un texte les gabarits non remplis (ex. « au [TÉLÉPHONE] »). */
const stripPlaceholders = (t: string) =>
  t.replace(/\s*(?:au|:)?\s*\[[^\]]*\]/g, "").replace(/\s+([,.])/g, "$1");

export function FoldTitle({
  left,
  right,
  className = "",
}: {
  left: string;
  right: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-start ${className}`}>
      <span
        className="title panel-paper inline-block px-5 pb-4 pt-3 text-4xl md:text-6xl"
        style={{ transform: "skewY(6deg)", transformOrigin: "100% 0" }}
      >
        {left}
      </span>
      <span
        className="title inline-block border-[6px] border-paper bg-ink px-5 pb-3 pt-2 text-4xl md:text-6xl"
        style={{ transform: "skewY(-6deg)", transformOrigin: "0 0" }}
      >
        {right}
      </span>
    </div>
  );
}

/* ---------- icônes des cartes d'exemple ---------- */

type IconProps = { className?: string; cut: string };

function BurgerIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 10.2C3 5.6 7 3 12 3s9 2.6 9 7.2z" fill="currentColor" />
      <rect x="2" y="12" width="20" height="3.2" rx="1.6" fill="currentColor" />
      <path d="M3 17.2h18v1.4c0 1.4-1.1 2.4-2.4 2.4H5.4C4 21 3 20 3 18.6z" fill="currentColor" />
    </svg>
  );
}

function CupIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
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
    </svg>
  );
}

function BreadIcon({ className = "", cut }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
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
    </svg>
  );
}

function ScissorsIcon({ className = "", cut }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
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
    </svg>
  );
}

function MiniQR({ size = 88 }: { size?: number }) {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1,
    0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1,
    0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1,
  ];
  return (
    <div
      className="grid grid-cols-9 rounded-md bg-white p-1.5 ring-1 ring-black/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {cells.map((c, i) => (
        <span key={i} className={c ? "bg-ink" : ""} />
      ))}
    </div>
  );
}

/**
 * Cartes d'exemple (enseignes fictives). `fg` = texte sur le fond, `ink` = icône sur l'accent,
 * `panel` / `ring` = zone des tampons et cercles vides.
 */
const BRANDS = {
  smash: {
    name: "SMASH CLUB",
    short: "smash",
    bg: "#151515",
    fg: "#FFFFFF",
    acc: "#FFD60A",
    ink: "#000000",
    border: "rgba(255,255,255,.18)",
    panel: "rgba(255,255,255,.10)",
    ring: "rgba(255,255,255,.40)",
    reward: "Menu offert",
    Icon: BurgerIcon,
  },
  cafe: {
    name: "CAFÉ LUMIÈRE",
    short: "café",
    bg: "#3B2416",
    fg: "#FFF6E8",
    acc: "#F2C14E",
    ink: "#3B2416",
    border: "rgba(255,246,232,.16)",
    panel: "rgba(255,246,232,.10)",
    ring: "rgba(255,246,232,.42)",
    reward: "Café offert",
    Icon: CupIcon,
  },
  fournil: {
    name: "FOURNIL DU PORT",
    short: "fournil",
    bg: "#F3E3C3",
    fg: "#2B1A0D",
    acc: "#8A4B1F",
    ink: "#FFF6E8",
    border: "rgba(43,26,13,.14)",
    panel: "rgba(43,26,13,.07)",
    ring: "rgba(43,26,13,.35)",
    reward: "Viennoiserie offerte",
    Icon: BreadIcon,
  },
  barbier: {
    name: "BARBIER RIVIERA",
    short: "barbier",
    bg: "#0F2A44",
    fg: "#FFFFFF",
    acc: "#E9E4D8",
    ink: "#0F2A44",
    border: "rgba(255,255,255,.16)",
    panel: "rgba(255,255,255,.10)",
    ring: "rgba(255,255,255,.40)",
    reward: "Coupe offerte",
    Icon: ScissorsIcon,
  },
} as const;

type BrandKey = keyof typeof BRANDS;
const BRAND_KEYS = Object.keys(BRANDS) as BrandKey[];

export function WalletPass({
  brand = "smash",
  filled = 8,
  member = "Yanis B.",
}: {
  brand?: BrandKey;
  filled?: number;
  member?: string;
}) {
  const b = BRANDS[brand];
  const Icon = b.Icon;
  return (
    <div
      className="w-full rounded-2xl p-4 shadow-2xl transition-colors duration-500 motion-reduce:transition-none"
      style={{ background: b.bg, color: b.fg, border: `1px solid ${b.border}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-500 motion-reduce:transition-none"
          style={{ background: b.acc, color: b.ink }}
        >
          <Icon className="h-6 w-6" cut={b.acc} />
        </span>
        <div className="min-w-0 flex-1 leading-none">
          <div className="truncate whitespace-nowrap text-[15px] font-black tracking-tight">
            {b.name}
          </div>
          <div className="label mt-1 text-[9px] opacity-75">carte de fidélité</div>
        </div>
      </div>
      <div className="mt-4 rounded-xl p-3" style={{ background: b.panel }}>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="label text-[9px] opacity-80">tampons</span>
          <span className="whitespace-nowrap text-base font-black leading-none">{filled} / 10</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="flex aspect-square items-center justify-center rounded-full border-2 transition-colors duration-500 motion-reduce:transition-none"
              style={
                i < filled
                  ? { background: b.acc, borderColor: b.acc, color: b.ink }
                  : { borderColor: b.ring }
              }
            >
              {i < filled && <Icon className="h-[62%] w-[62%]" cut={b.acc} />}
            </span>
          ))}
        </div>
      </div>
      <div className="label mt-3 flex justify-between gap-3 text-[9px]">
        <span className="min-w-0">
          récompense
          <b className="mt-0.5 block font-sans text-[13px] normal-case tracking-normal">
            {b.reward}
          </b>
        </span>
        <span className="shrink-0 text-right">
          membre
          <b className="mt-0.5 block whitespace-nowrap font-sans text-[13px] normal-case tracking-normal">
            {member}
          </b>
        </span>
      </div>
      <div className="mt-3 flex justify-center">
        <MiniQR size={84} />
      </div>
    </div>
  );
}

function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[290px] rounded-[2.6rem] bg-[#151515] p-3 shadow-[0_0_0_2px_#3a3a38,0_40px_100px_rgba(0,0,0,.7)] ${className}`}
    >
      <div className="relative min-h-[500px] overflow-hidden md:min-h-[560px] rounded-[2.1rem] bg-black px-3 pb-5 pt-12">
        <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-[#151515]" />
        {children}
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  children,
  id,
}: {
  eyebrow?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      {eyebrow && <p className="label mb-4 text-primary">{eyebrow}</p>}
      <h2 className="title text-4xl md:text-6xl">{children}</h2>
    </div>
  );
}

/* ---------- sections ---------- */

/** Prix d'abonnement le plus bas, ex. "39 €". */
const MIN_OFFER_PRICE = fmtEuros(Math.min(...offers.map((o) => euros(o.price))));
/** "sous 7 jours après la signature" -> "7 jours". */
const INSTALL_DAYS = /(\d+)\s*jours?/.exec(POLICY.installDelay)?.[0] ?? "7 jours";

const AUTO_ROTATE_MS = 3500;

/**
 * Fait défiler les cartes d'exemple tant que l'utilisateur n'a pas choisi lui-même.
 * Pas de défilement si « moins d'animations » est demandé ; pause si l'onglet est caché,
 * si le visuel est hors écran ou survolé / focalisé.
 */
function useAutoRotate(
  area: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null>,
  enabled: boolean,
  next: () => void,
) {
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    const el = target.current;
    const zone = area.current;
    if (!enabled || !el || !zone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    let hovered = false;
    let timer: number | undefined;
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };
    const sync = () => {
      const run = visible && !hovered && document.visibilityState === "visible";
      if (run && timer === undefined)
        timer = window.setInterval(() => nextRef.current(), AUTO_ROTATE_MS);
      else if (!run) stop();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = !!e?.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(zone);
    const enter = () => {
      hovered = true;
      sync();
    };
    const leave = () => {
      hovered = false;
      sync();
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    document.addEventListener("visibilitychange", sync);
    return () => {
      stop();
      io.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [enabled, area, target]);
}

export function Hero() {
  const [brand, setBrand] = useState<BrandKey>("smash");
  const [auto, setAuto] = useState(true);
  const hero = useRef<HTMLElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  useAutoRotate(hero, visual, auto, () =>
    setBrand((b) => BRAND_KEYS[(BRAND_KEYS.indexOf(b) + 1) % BRAND_KEYS.length]!),
  );
  const reassurance = [
    `Dès ${nb(MIN_OFFER_PRICE)}/mois`,
    "Sans engagement",
    "Pas de TVA en plus",
    `Prête en ${INSTALL_DAYS}`,
  ];
  return (
    <section
      ref={hero}
      className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 md:grid-cols-[1.25fr_1fr] md:gap-14 md:pb-24 md:pt-24"
    >
      <div>
        <p className="label mb-6 text-primary">
          Fidélité digitale · restaurants, cafés, boutiques, salons
        </p>
        <h1 className="title text-5xl md:text-7xl">
          {/* `relative` : le jambage du « y » passe devant le fond du surlignage. */}
          <span className="relative">ce client vient de payer. va-t-il</span>{" "}
          <span className="mark">revenir&nbsp;?</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          La carte de fidélité digitale qui fait revenir vos clients. Dans leur téléphone, sans
          appli, sans compte.
        </p>
        <ul
          className="mt-5 flex max-w-xl flex-wrap gap-x-2 gap-y-1 text-sm font-semibold md:text-base"
          aria-label="En bref"
        >
          {reassurance.map((r, i) => (
            <li key={r} className="whitespace-nowrap">
              {r}
              {i < reassurance.length - 1 && (
                <span className="ml-2 text-primary" aria-hidden>
                  ·
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/"
            hash="offres"
            className="bg-primary px-7 py-4 text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Voir les formules
          </Link>
          <Link
            to="/"
            hash="comment"
            className="border-2 border-paper px-7 py-4 text-lg font-bold transition-colors hover:bg-paper hover:text-ink"
          >
            Comment ça marche
          </Link>
        </div>
      </div>
      <div ref={visual} className="flex flex-col items-center gap-5">
        <PhoneFrame className="anim-float">
          <p className="mb-3 text-2xl font-black tracking-tight">Cartes</p>
          <WalletPass brand={brand} />
        </PhoneFrame>
        <div className="relative w-[290px]">
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Exemples de cartes">
            {BRAND_KEYS.map((k) => (
              <button
                type="button"
                key={k}
                aria-pressed={brand === k}
                aria-label={`Carte d'exemple ${BRANDS[k].name.toLowerCase()}`}
                onClick={() => {
                  setAuto(false);
                  setBrand(k);
                }}
                className={`label flex min-h-11 items-center justify-center gap-2 border-2 px-2 transition-colors duration-500 motion-reduce:transition-none ${brand === k ? "border-primary bg-primary text-primary-foreground" : "border-paper/30 hover:border-paper"}`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full ring-1 ring-paper/40"
                  style={{ background: BRANDS[k].bg }}
                  aria-hidden
                />
                {BRANDS[k].short}
              </button>
            ))}
          </div>
        </div>
        <p className="-mt-2 text-center text-xs text-muted-foreground">
          Exemples fictifs&nbsp;: touchez pour voir votre métier
        </p>
      </div>
    </section>
  );
}

export function Problem() {
  const words = ["perdue.", "oubliée.", "jetée."];
  return (
    <section
      id="probleme"
      className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-5 py-16 md:grid-cols-2 md:gap-12 md:py-20"
    >
      <Reveal>
        <FoldTitle left="la carte" right={"papier\u00a0?"} />
        <p className="mt-12 max-w-md text-lg text-muted-foreground">
          Avec une carte papier, vous ne savez pas qui revient ni quand, et vous ne pouvez relancer
          personne.
        </p>
      </Reveal>
      <div className="space-y-3">
        {words.map((w, i) => (
          <Reveal key={w} delay={i * 150}>
            <p className="title relative inline-block text-6xl md:text-8xl">
              {w}
              <span className="absolute inset-x-[-6px] top-[52%] h-2 bg-primary md:h-3" />
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Coupe une valeur pour qu'elle ne se casse qu'aux endroits voulus : « ≈ 220 » reste
 * soudé, « +25 à +95 » peut passer à la ligne après « à », et l'unité reste collée au nombre.
 */
function statValue(value: string) {
  return value.replace(/\s+/g, "\u00a0").replace(/\u00a0(à|-|–)\u00a0/g, "\u00a0$1 ");
}

export function Stats() {
  // On écarte le doublon « milliards $ » (même source que le premier), 3 chiffres max.
  // En mobile, 2 seulement : l'échelle (McDonald's) et la rentabilité (Bain) ; Starbucks,
  // redondant avec McDonald's, n'apparaît qu'à partir de la tablette.
  const shown = stats.filter((s) => !/milliard/i.test(s.unit)).slice(0, 3);
  const mobileHidden = shown.length === 3 ? 1 : -1;
  return (
    <section id="chiffres" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-20">
      <FoldTitle left="les géants" right="l'ont compris." />
      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {shown.map((s, i) => (
          <Reveal
            key={s.text}
            delay={i * 100}
            className={i === mobileHidden ? "hidden md:block" : ""}
          >
            <div>
              <p
                className={`inline-block max-w-full px-4 py-2 leading-[1.05] ${i === shown.length - 1 ? "bg-primary text-primary-foreground" : "panel-paper"}`}
              >
                <span className="title text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                  {statValue(s.value)}
                </span>
                {"\u00a0"}
                <span className="title text-2xl md:text-xl lg:text-2xl">{s.unit}</span>
              </p>
              <p className="mt-4 max-w-sm font-semibold">{nb(s.text)}</p>
              <p className="mt-2 text-xs text-muted-foreground">{nb(s.source)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Vidéo courte en boucle, muette. Lecture uniquement quand elle est visible
 * (IntersectionObserver) ; pas de lecture auto si l'utilisateur préfère moins d'animations.
 * Pas d'attribut autoplay : il forcerait le téléchargement (et ignorerait preload="none")
 * et démarrerait la vidéo avant que l'on sache si l'animation est souhaitée.
 */
function VideoLoop({
  name,
  label,
  caption,
  eager = false,
}: {
  name: string;
  label: string;
  caption: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          if (!userPaused.current) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  }

  return (
    <figure>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#0b0b0b] ring-1 ring-paper/15">
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload={eager ? "metadata" : "none"}
          poster={`/videos/${name}.jpg`}
          aria-label={label}
          width={1080}
          height={1080}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={`/videos/${name}.webm`} type="video/webm" />
          <source src={`/videos/${name}.mp4`} type="video/mp4" />
        </video>
        {reduced && !playing && (
          // Grande zone cliquable sur l'affiche ; le vrai bouton (clavier, lecteur d'écran) est sous la vidéo.
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={toggle}
            className="absolute inset-0 flex items-center justify-center bg-black/25"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" aria-hidden>
                <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 flex items-start justify-between gap-3">
        <span className="pt-2.5 font-bold md:text-lg">{nb(caption)}</span>
        <button
          type="button"
          onClick={toggle}
          data-video-toggle
          aria-label={playing ? `Mettre en pause\u00a0: ${label}` : `Lire la vidéo\u00a0: ${label}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-paper/60 hover:text-paper focus-visible:text-paper"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            {playing ? (
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />
            ) : (
              <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
            )}
          </svg>
        </button>
      </figcaption>
    </figure>
  );
}

const VIDEO_STEPS = [
  {
    name: "inscription",
    caption: "L'inscription\u00a0: il scanne, sa carte arrive.",
    label:
      "Vidéo\u00a0: le client scanne le QR code et sa carte de fidélité arrive dans son téléphone, sans appli ni compte.",
  },
  {
    name: "tampon",
    caption: "Le passage\u00a0: vous scannez, le tampon s'ajoute.",
    label:
      "Vidéo\u00a0: à la caisse, l'équipe scanne la carte du client et un tampon s'ajoute\u00a0; le client reçoit une notification.",
  },
  {
    name: "recompense",
    caption: "La récompense\u00a0: validée en un geste.",
    label:
      "Vidéo\u00a0: la carte est complète, l'équipe valide la récompense en un geste depuis son téléphone.",
  },
];

export function HowItWorks() {
  const track = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [swiped, setSwiped] = useState(false);
  function onScroll() {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    if (el.scrollLeft > 8) setSwiped(true);
    const step = first.offsetWidth + 16;
    setActive(Math.min(VIDEO_STEPS.length - 1, Math.round(el.scrollLeft / step)));
  }
  function goTo(i: number) {
    const item = track.current?.children[i] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }
  return (
    <section id="comment" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-20">
      <SectionTitle eyebrow="Comment ça marche">
        simple comme <span className="mark">un scan.</span>
      </SectionTitle>
      <ol
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 md:mx-0 md:mt-12 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
        aria-label="Les 3 étapes en vidéo"
      >
        {VIDEO_STEPS.map((v, i) => (
          <li key={v.name} className="w-[84%] shrink-0 snap-start md:w-auto">
            <VideoLoop name={v.name} label={v.label} caption={v.caption} eager={i === 0} />
          </li>
        ))}
      </ol>
      <div className="mt-1 flex flex-col items-center md:hidden" aria-hidden>
        <div className="flex items-center justify-center">
          {VIDEO_STEPS.map((v, i) => (
            <button
              type="button"
              tabIndex={-1}
              key={v.name}
              onClick={() => goTo(i)}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${i === active ? "w-7 bg-primary" : "w-3 bg-paper/30"}`}
              />
            </button>
          ))}
        </div>
        <p
          data-swipe-hint
          className={`-mt-1 text-xs text-muted-foreground transition-opacity duration-300 ${swiped ? "invisible opacity-0" : "opacity-100"}`}
        >
          Glissez pour voir la suite →
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 md:mt-10">
        {["✕ pas d'appli", "✕ pas de compte", "✕ pas de matériel à acheter"].map((c) => (
          <span key={c} className="panel-paper px-4 py-2 font-bold">
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}

export function DashboardPreview() {
  const kpis = [
    ["Clients inscrits", "412", "+38 ce mois"],
    ["Passages", "1 286", "+24\u00a0%"],
    ["Récompenses", "87", "+12"],
  ];
  const top = [
    ["YB", "Yanis B.", 38],
    ["IK", "Inès K.", 33],
    ["KD", "Karim D.", 28],
    ["SL", "Sarah L.", 23],
  ];
  return (
    <section id="tableau" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle eyebrow="Votre tableau de bord">
          vos clients, <span className="mark">enfin visibles.</span>
        </SectionTitle>
        <ServiceLink slug="tableau-de-bord" className="label min-h-11" />
      </div>
      <Reveal>
        <div className="relative mt-12 overflow-hidden rounded-xl bg-[#F4F3EF] text-ink shadow-2xl md:grid md:grid-cols-[200px_1fr]">
          <span className="label absolute right-3 top-3 z-10 bg-primary px-2 py-1 text-[10px] text-primary-foreground sm:right-4 sm:top-4 sm:text-xs">
            Données d'exemple
          </span>
          <aside className="hidden bg-ink p-6 text-paper md:block">
            <img src="/logo-megalopole.png" alt="" className="mb-8 h-9 w-auto" />
            {["Tableau de bord", "Clients", "Campagnes", "Ma carte"].map((it, i) => (
              <p
                key={it}
                className={`mb-1 rounded-md px-3 py-2 text-sm font-semibold ${i === 0 ? "bg-paper text-ink" : "text-paper/60"}`}
              >
                {it}
              </p>
            ))}
          </aside>
          <div className="p-6 md:p-8">
            <p className="pr-28 text-sm font-semibold text-black/50 sm:pr-0">Smash Club · Cannes</p>
            <p className="title text-3xl normal-case">Bonjour&nbsp;!</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3 sm:gap-4">
              {kpis.map(([l, v, d]) => (
                <div
                  key={l}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 sm:flex-col sm:items-start sm:justify-start sm:gap-0 sm:p-4"
                >
                  <div className="sm:contents">
                    <p className="label text-black/50">{l}</p>
                    <span className="mt-1 inline-block whitespace-nowrap rounded bg-green-100 px-2 text-xs font-bold text-green-800 sm:order-last sm:mt-2">
                      ▲ {d}
                    </span>
                  </div>
                  <p className="title whitespace-nowrap text-3xl sm:mt-1 sm:text-4xl">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="hidden rounded-xl bg-white p-4 sm:block">
                <p className="font-bold">Passages par semaine</p>
                <svg viewBox="0 0 700 220" className="mt-2 h-44 w-full" aria-hidden>
                  <path
                    d="M0 190 L64 180 L127 186 L191 166 L255 160 L318 146 L382 150 L445 122 L509 108 L573 90 L636 74 L700 50 L700 220 L0 220Z"
                    fill="rgba(11,11,11,.08)"
                  />
                  <path
                    d="M0 190 L64 180 L127 186 L191 166 L255 160 L318 146 L382 150 L445 122 L509 108 L573 90 L636 74 L700 50"
                    fill="none"
                    stroke="#0b0b0b"
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />
                  <circle cx="694" cy="52" r="10" fill="#FFD60A" stroke="#0b0b0b" strokeWidth="4" />
                </svg>
              </div>
              <div className="rounded-xl bg-white p-4">
                <p className="font-bold">Meilleurs habitués</p>
                {top.map(([a, n, v]) => (
                  <div
                    key={n}
                    className="flex items-center justify-between border-b border-black/5 py-2 text-sm font-semibold last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] text-paper">
                        {a}
                      </span>
                      {n}
                    </span>
                    <span className="font-mono text-xs">{v} passages</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl bg-ink p-5 text-paper sm:flex-row sm:items-center">
              <p className="text-lg font-black">
                <span className="text-primary">27 clients</span> ne sont pas revenus depuis 30 jours
              </p>
              <span className="rounded-lg bg-primary px-4 py-3 font-black text-primary-foreground">
                Relance des clients absents · Pro et Premium
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function WeHandleIt() {
  const items = [
    {
      t: "on crée votre carte",
      s: "Votre logo, vos couleurs, vos récompenses.",
      slug: "carte-personnalisee",
    },
    {
      t: "on installe tout",
      s: "QR au comptoir et en vitrine.",
      slug: "presentoir-comptoir",
    },
    {
      t: "on forme l'équipe",
      s: "30 minutes sur place, prête à scanner.",
      slug: "formation-equipe",
    },
    {
      t: "on vous suit",
      s: "Bilans, campagnes et support selon votre formule.",
      slug: "bilan-mensuel",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <FoldTitle left="vous n'avez" right="rien à faire." />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 100}>
            <Link
              to="/services/$slug"
              params={{ slug: it.slug }}
              className="group flex h-full flex-col panel-paper p-4 transition-transform hover:-translate-y-1 sm:p-6"
            >
              <p className="title text-2xl sm:text-3xl">{it.t}</p>
              <p className="mt-2 flex-1 text-sm text-black/60 sm:mt-3 sm:text-base">{it.s}</p>
              <p className="label mt-2 flex min-h-11 items-center group-hover:underline sm:mt-4">
                En savoir plus →
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Services clés d'une formule : ceux qu'elle ajoute à la formule précédente (6 max). */
function keyServices(o: Offer, i: number) {
  const prev = i > 0 ? offers[i - 1] : undefined;
  const list = prev ? o.services.filter((s) => !prev.services.includes(s)) : o.services;
  return { prev, list: list.slice(0, 6) };
}

export function OffersSection() {
  return (
    <section id="offres" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-20">
      <SectionTitle eyebrow="Prix nets">
        3 formules, <span className="mark">sans surprise.</span>
      </SectionTitle>
      <div className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3">
        {offers.map((o, i) => {
          const { prev, list } = keyServices(o, i);
          return (
            <Reveal key={o.slug} delay={i * 100}>
              <article
                className={`relative flex h-full flex-col p-6 md:p-8 ${o.featured ? "panel-paper" : "border-2 border-paper/80 bg-card"} ${o.slug === "premium" ? "!border-primary" : ""}`}
              >
                {o.featured && (
                  <span className="label absolute -top-3 right-6 whitespace-nowrap bg-primary px-3 py-1 text-primary-foreground">
                    Recommandé
                  </span>
                )}
                <p className="label mb-2 opacity-70">{o.tagline}</p>
                <h3 className="title text-5xl">{o.name}</h3>
                <p className="mt-4">
                  <span className="title whitespace-nowrap text-6xl">{nb(o.price)}</span>{" "}
                  <span className="label whitespace-nowrap">/ mois</span>
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Sans engagement · préavis {POLICY.noticeMonths} mois
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="label opacity-70">+ installation</span>
                  <SetupPrice setup={o.setup} />
                  {LAUNCH_OFFER.enabled && (
                    <span className="label whitespace-nowrap bg-primary px-1.5 py-0.5 text-primary-foreground">
                      −{LAUNCH_OFFER.discountPercent}&nbsp;%
                    </span>
                  )}
                </p>
                <div
                  className={`mt-6 flex-1 border-t pt-4 ${o.featured ? "border-black/15" : "border-paper/15"}`}
                >
                  <p className="label mb-1 opacity-70">
                    {prev ? `Tout ${prev.name}, plus :` : "L'essentiel :"}
                  </p>
                  <ul className="text-sm">
                    {list.map((s) => (
                      <li key={s}>
                        <ServiceLink
                          slug={s}
                          className={`min-h-11 xl:min-h-9 ${o.featured ? "[&>span:last-child]:text-ink" : ""}`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 grid gap-3">
                  <ChooseOfferButton slug={o.slug} />
                  <Link
                    to="/offres/$slug"
                    params={{ slug: o.slug }}
                    className={`border-2 px-5 py-3 text-center font-bold transition-colors ${o.featured ? "border-ink hover:bg-ink hover:text-paper" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
                  >
                    Voir le détail →
                  </Link>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-8 font-semibold">TVA non applicable&nbsp;: prix final.</p>
      <p className="mt-2 text-muted-foreground">
        Abonnement par prélèvement SEPA, chaque mois ou une fois par an{" "}
        <b className="text-foreground">({12 - QUOTE_CONFIG.annualMonthsPaid} mois offerts)</b>.
        Installation réglée à la signature.
      </p>
    </section>
  );
}

/** Option ponctuelle la moins chère, ex. "39 €". */
const MIN_OPTION_PRICE = fmtEuros(
  Math.min(
    ...options
      .filter((o) => !o.recurring)
      .map((o) => o.amount ?? Infinity)
      .filter((n) => n > 0 && n < Infinity),
  ),
);

export function OptionsSection() {
  return (
    <section id="options" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-4">
      <div className="flex flex-col gap-4 border-y border-paper/15 py-8 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="text-lg">
          <b>Options à la carte</b>&nbsp;: plaques et présentoirs QR, vitrophanie, flyers, nouveau
          design… <span className="whitespace-nowrap">dès {nb(MIN_OPTION_PRICE)}</span>, payées une
          fois. Et le <b>Pack réseaux sociaux</b>,{" "}
          <span className="whitespace-nowrap">{nb(fmtEuros(SOCIAL_PACK_MONTHLY))} / mois</span> sans
          engagement.
        </p>
        <Link
          to="/options"
          className="inline-flex min-h-11 shrink-0 items-center self-start whitespace-nowrap font-bold text-primary link-y md:self-auto"
        >
          Voir toutes les options →
        </Link>
      </div>
    </section>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-4 font-semibold">
        <span>
          {label}
          {hint && (
            <span className="mt-0.5 block text-sm font-normal text-muted-foreground">{hint}</span>
          )}
        </span>
        <span className="title text-2xl text-primary">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 block h-11 w-full cursor-pointer accent-[var(--color-primary)]"
      />
    </label>
  );
}

export function RoiSimulator() {
  const [clients, setClients] = useState(600);
  const [share, setShare] = useState(20);
  const [extra, setExtra] = useState(0.25);
  const [basket, setBasket] = useState(12);
  const monthly = Math.round(clients * (share / 100) * extra * basket);
  const fr = (n: number) => n.toLocaleString("fr-FR");
  return (
    <section id="simulateur" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-20">
      <SectionTitle eyebrow="Simulateur">
        combien ça peut vous <span className="mark">rapporter ?</span>
      </SectionTitle>
      <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-8">
          <Slider
            label="Clients différents par mois"
            value={clients}
            min={100}
            max={3000}
            step={50}
            onChange={setClients}
            fmt={fr}
          />
          <Slider
            label="Part qui s'inscrit à la carte"
            value={share}
            min={5}
            max={50}
            step={5}
            onChange={setShare}
            fmt={(v) => `${v}\u00a0%`}
          />
          <Slider
            label="Visites en plus par client et par mois"
            hint="0,25 = 1 visite de plus tous les 4 mois"
            value={extra}
            min={0.25}
            max={3}
            step={0.25}
            onChange={setExtra}
            fmt={(v) => v.toLocaleString("fr-FR")}
          />
          <Slider
            label="Panier moyen"
            value={basket}
            min={5}
            max={40}
            step={1}
            onChange={setBasket}
            fmt={(v) => `${v}\u00a0€`}
          />
        </div>
        <div className="bg-primary p-8 text-primary-foreground">
          <p className="label">Chiffre d'affaires en plus, par mois</p>
          <p className="title mt-3 text-7xl">{fr(monthly)}&nbsp;€</p>
          <p className="mt-4 font-semibold">soit {fr(monthly * 12)}&nbsp;€ sur un an.</p>
          <p className="mt-2 text-sm">
            Pour comparaison&nbsp;: la formule {offers.find((o) => o.featured)?.name} coûte{" "}
            {nb(offers.find((o) => o.featured)?.price ?? "")} par mois.
          </p>
          <p className="label mt-6 opacity-70">Estimation indicative, non contractuelle</p>
        </div>
      </div>
    </section>
  );
}

const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Questions affichées d'abord, repérées par mots-clés dans le libellé (pas par groupe) :
 * si une question est renommée, fusionnée ou supprimée, on complète simplement avec les suivantes.
 */
const FAQ_ESSENTIALS: RegExp[][] = [
  [/\bengagement\b/],
  [/frais cach/, /prix .*\bht\b|tva/, /tarif|combien .*coute/],
  [/\bappli|application/],
  [/smartphone/],
  [/operationnel|combien de temps/, /install/],
  [/materiel/],
  [/caisse|\btpe\b/],
  [/donnees/, /rgpd/],
];
const FAQ_FIRST_COUNT = 8;

type FaqItem = { q: string; a: string };

function FaqItemView({ f, open }: { f: FaqItem; open?: boolean }) {
  return (
    <details className="group border-b py-5" open={open}>
      <summary className="flex cursor-pointer list-none justify-between gap-6 text-lg font-bold">
        {nb(stripPlaceholders(f.q))}
        <span className="shrink-0 self-start text-2xl leading-none text-primary transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 max-w-2xl text-muted-foreground">{nb(stripPlaceholders(f.a))}</p>
    </details>
  );
}

export function FaqSection() {
  const [all, setAll] = useState(false);
  const suite = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);
  // Le bouton disparaît : on place aussitôt le focus sur la première question ajoutée.
  useLayoutEffect(() => {
    if (!all || !focusFirst.current) return;
    focusFirst.current = false;
    suite.current?.querySelector<HTMLElement>("summary")?.focus();
  }, [all]);
  const items = faq.flatMap((g) => g.items);
  const first: FaqItem[] = [];
  for (const patterns of FAQ_ESSENTIALS) {
    for (const re of patterns) {
      const hit = items.find((f) => re.test(norm(f.q)) && !first.includes(f));
      if (hit) {
        first.push(hit);
        break;
      }
    }
  }
  for (const f of items) if (first.length < FAQ_FIRST_COUNT && !first.includes(f)) first.push(f);
  const engagement = first.find((f) => /\bengagement\b/.test(norm(f.q)));
  const rest = faq
    .map((g) => ({ title: g.title, items: g.items.filter((f) => !first.includes(f)) }))
    .filter((g) => g.items.length > 0);
  return (
    <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16 md:py-20">
      <SectionTitle eyebrow="Vos questions">
        questions <span className="mark">fréquentes.</span>
      </SectionTitle>
      <div className="mt-10 md:mt-12">
        {first.map((f) => (
          <FaqItemView key={f.q} f={f} open={f === engagement} />
        ))}
      </div>
      {rest.length > 0 && (
        <>
          {!all && (
            <button
              type="button"
              onClick={() => {
                focusFirst.current = true;
                setAll(true);
              }}
              aria-expanded={all}
              aria-controls="faq-suite"
              className="mt-8 min-h-11 border-2 border-primary px-6 py-3 font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Voir toutes les questions ({items.length})
            </button>
          )}
          <div ref={suite} id="faq-suite" hidden={!all} className="mt-12 space-y-12">
            {rest.map((g) => (
              <div key={g.title}>
                <p className="label mb-2 text-primary">{g.title}</p>
                {g.items.map((f) => (
                  <FaqItemView key={f.q} f={f} />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const viaWhatsApp = whatsappLink() !== null;
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = phoneError(country, phone, !viaWhatsApp);
    setPhoneErr(err);
    if (err) {
      phoneRef.current?.focus();
      return;
    }
    const d = new FormData(e.currentTarget);
    d.set("Téléphone", formatPhone(country, phone));
    const url = whatsappLink(contactWhatsAppMessage(d));
    if (url) {
      const w = window.open(url, "_blank");
      if (w) w.opener = null;
      else window.location.href = url;
      setWaUrl(url);
      setSent(true);
      return;
    }
    const body = ["Nom", "Commerce", "Ville", "Téléphone", "Message"]
      .map((k) => `${k}\u00a0: ${d.get(k) ?? ""}`)
      .join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Demande de rendez-vous — " + (d.get("Commerce") ?? ""))}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  const field =
    "w-full border-2 border-paper/20 bg-transparent px-4 py-3 outline-none focus:border-primary";
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 md:py-24">
      <div className="grid gap-14 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="title text-5xl md:text-7xl">
            vos clients reviennent. votre chiffre <span className="mark">aussi.</span>
          </h2>
          <div className="mt-12 hidden md:block">
            <Logo className="h-24" />
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {!viaWhatsApp && (
            <p className="mb-2 text-lg font-semibold">
              {COMPANY.firstName} vous répond {POLICY.supportHours}
              {HAS_PHONE && (
                <>
                  {" "}
                  au{" "}
                  <a href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`} className="underline">
                    {COMPANY.phone}
                  </a>
                </>
              )}
              .
            </p>
          )}
          {viaWhatsApp && (
            <div className="mb-2">
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                <WhatsAppIcon className="size-7 shrink-0 text-[#25D366]" />
                Écrivez-nous sur WhatsApp
              </h3>
              <p className="mt-2 text-muted-foreground">
                Remplissez ces quelques champs&nbsp;: WhatsApp s'ouvre avec votre message déjà
                rédigé, il n'y a plus qu'à l'envoyer. {COMPANY.firstName} vous répond{" "}
                {POLICY.supportHours}.
              </p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="Nom"
              aria-label="Nom"
              autoComplete="name"
              required
              placeholder="Votre nom"
              className={field}
            />
            <input
              name="Commerce"
              aria-label="Nom du commerce"
              autoComplete="organization"
              required
              placeholder="Nom du commerce"
              className={field}
            />
            <input
              name="Ville"
              aria-label="Ville"
              autoComplete="address-level2"
              placeholder="Ville"
              className={`${field} sm:col-span-2`}
            />
            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <CountrySelect
                  value={country}
                  invalid={!!phoneErr}
                  onChange={(code) => {
                    setCountry(code);
                    if (phoneErr) setPhoneErr(phoneError(code, phone, !viaWhatsApp));
                  }}
                />
                <input
                  ref={phoneRef}
                  name="Téléphone"
                  aria-label={viaWhatsApp ? "Téléphone (facultatif)" : "Téléphone"}
                  aria-invalid={phoneErr ? true : undefined}
                  aria-describedby={phoneErr ? "contact-phone-err" : undefined}
                  autoComplete="tel-national"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneErr) setPhoneErr(phoneError(country, e.target.value, !viaWhatsApp));
                  }}
                  onBlur={() =>
                    phone.trim() && setPhoneErr(phoneError(country, phone, !viaWhatsApp))
                  }
                  placeholder={viaWhatsApp ? "Téléphone (facultatif)" : "Téléphone"}
                  className={`${field} min-w-0 flex-1 ${phoneErr ? "!border-red-500" : ""}`}
                />
              </div>
              {phoneErr && (
                <p id="contact-phone-err" className="mt-2 text-sm font-semibold text-red-400">
                  <span aria-hidden>! </span>
                  {phoneErr}
                </p>
              )}
            </div>
          </div>
          <textarea
            name="Message"
            aria-label="Message"
            rows={4}
            placeholder="Votre message (facultatif)"
            className={field}
          />
          <button
            type="submit"
            className="w-full bg-primary px-7 py-4 text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {viaWhatsApp ? "Envoyer sur WhatsApp →" : "Être rappelé →"}
          </button>
          <p className="text-xs text-muted-foreground">
            Vos coordonnées servent uniquement à vous recontacter.{" "}
            <Link to="/confidentialite" className="underline">
              Politique de confidentialité
            </Link>
          </p>
          <div aria-live="polite">
            {sent &&
              (waUrl ? (
                <p className="text-sm text-muted-foreground">
                  WhatsApp s'ouvre avec votre message prêt&nbsp;: il n'y a plus qu'à envoyer. Rien
                  ne s'est ouvert&nbsp;?{" "}
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    Ouvrir WhatsApp
                  </a>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Votre messagerie s'ouvre avec votre demande prête&nbsp;: il n'y a plus qu'à
                  l'envoyer. Rien ne s'est ouvert&nbsp;? Écrivez-nous à{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
              ))}
          </div>
        </form>
      </div>
    </section>
  );
}
