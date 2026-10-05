import { Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { CONTACT_EMAIL, LAUNCH_OFFER, QUOTE_CONFIG, faq, options, stats } from "@/data/content";
import { offers } from "@/data/services";
import { Logo, Reveal, ServiceLink, SetupPrice } from "@/components/site";
import { ChooseOfferButton } from "@/components/quote";

/* ---------- petits éléments réutilisables ---------- */

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

function Burger({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 10.2C3 5.6 7 3 12 3s9 2.6 9 7.2z" fill="currentColor" />
      <rect x="2" y="12" width="20" height="3.2" rx="1.6" fill="currentColor" />
      <path d="M3 17.2h18v1.4c0 1.4-1.1 2.4-2.4 2.4H5.4C4 21 3 20 3 18.6z" fill="currentColor" />
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
      className="grid grid-cols-9 rounded-md bg-paper p-1.5"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {cells.map((c, i) => (
        <span key={i} className={c ? "bg-ink" : ""} />
      ))}
    </div>
  );
}

const BRANDS = {
  smash: {
    name: "SMASH CLUB",
    bg: "#151515",
    acc: "#FFD60A",
    ink: "#000",
    border: "rgba(255,255,255,.18)",
    reward: "Menu offert",
  },
  tacos: {
    name: "TACOS RIVIERA",
    bg: "#FF5A1F",
    acc: "#1A1A1A",
    ink: "#fff",
    border: "transparent",
    reward: "Tacos offert",
  },
  nonna: {
    name: "PIZZA NONNA",
    bg: "#0E4D35",
    acc: "#E63B2E",
    ink: "#fff",
    border: "transparent",
    reward: "Pizza offerte",
  },
} as const;

export function WalletPass({
  brand = "smash",
  filled = 8,
  member = "Yanis B.",
}: {
  brand?: keyof typeof BRANDS;
  filled?: number;
  member?: string;
}) {
  const b = BRANDS[brand];
  return (
    <div
      className="w-full rounded-2xl p-4 text-white shadow-2xl"
      style={{ background: b.bg, border: `1px solid ${b.border}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: b.acc, color: b.ink }}
        >
          <Burger className="h-6 w-6" />
        </span>
        <div className="flex-1 leading-none">
          <div className="text-[15px] font-black tracking-tight">{b.name}</div>
          <div className="label mt-1 text-[9px] opacity-70">carte fidélité</div>
        </div>
        <div className="text-right">
          <div className="label text-[9px] opacity-80">tampons</div>
          <div className="text-lg font-black">{filled} / 10</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 rounded-xl bg-white/10 p-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="flex aspect-square items-center justify-center rounded-full border-2 border-white/40"
            style={i < filled ? { background: b.acc, borderColor: b.acc, color: b.ink } : undefined}
          >
            {i < filled && <Burger className="h-[60%] w-[60%]" />}
          </span>
        ))}
      </div>
      <div className="label mt-3 flex justify-between text-[9px]">
        <span>
          récompense<b className="block text-[13px] normal-case tracking-normal">{b.reward}</b>
        </span>
        <span className="text-right">
          membre<b className="block text-[13px] normal-case tracking-normal">{member}</b>
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
      <div className="relative min-h-[560px] overflow-hidden rounded-[2.1rem] bg-black px-3 pb-5 pt-12">
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

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 md:grid-cols-[1.25fr_1fr] md:pt-24">
      <div>
        <p className="label mb-6 text-primary">La fidélité digitale pour les restaurants</p>
        <h1 className="title text-5xl md:text-7xl">
          ce client vient de payer son menu. va-t-il <span className="mark">revenir ?</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          La carte de fidélité digitale qui fait revenir vos clients. Dans leur téléphone, sans
          appli, sans compte.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/"
            hash="offres"
            className="bg-primary px-7 py-4 text-lg font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Voir les offres
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
      <div className="flex justify-center">
        <PhoneFrame className="anim-float">
          <p className="mb-3 text-2xl font-black tracking-tight">Cartes</p>
          <WalletPass />
          <p className="label mt-3 text-center text-[9px] text-muted-foreground">
            Exemple — restaurant fictif
          </p>
        </PhoneFrame>
      </div>
    </section>
  );
}

export function Problem() {
  const words = ["perdue.", "oubliée.", "jetée."];
  return (
    <section
      id="probleme"
      className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-12 px-5 py-20 md:grid-cols-2"
    >
      <Reveal>
        <FoldTitle left="la carte" right="papier ?" />
        <p className="mt-12 max-w-md text-lg text-muted-foreground">
          Avec une carte papier, vous ne savez pas qui revient, ni quand. Impossible de relancer un
          client qui ne revient plus.
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

export function Stats() {
  return (
    <section id="chiffres" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <FoldTitle left="les géants" right="l'ont compris." />
      <div className="mt-16 grid gap-10 md:grid-cols-2">
        {stats.map((s, i) => (
          <Reveal key={s.text} delay={i * 100}>
            <div>
              <div
                className={`inline-flex items-baseline gap-3 px-5 py-2 ${i === 3 ? "bg-primary text-primary-foreground" : "panel-paper"}`}
              >
                <span className="title text-6xl md:text-7xl">{s.value}</span>
                <span className="title text-2xl md:text-3xl">{s.unit}</span>
              </div>
              <p className="mt-4 max-w-md text-lg font-semibold">{s.text}</p>
              <p className="label mt-3 normal-case tracking-normal text-muted-foreground">
                {s.source}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const [brand, setBrand] = useState<keyof typeof BRANDS>("smash");
  const steps = [
    { n: "01", t: "il scanne le QR code", s: "Au comptoir, sur sa table ou en vitrine." },
    {
      n: "02",
      t: "sa carte arrive dans son téléphone",
      s: "Dans Apple Wallet ou Google Wallet — à vos couleurs, avec votre logo.",
    },
    { n: "03", t: "c'est fait.", s: "Pas d'application, pas de compte. 10 secondes." },
  ];
  return (
    <section
      id="comment"
      className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-14 px-5 py-20 md:grid-cols-[1.2fr_1fr]"
    >
      <div>
        <SectionTitle eyebrow="Côté client">
          simple comme <span className="mark">un scan.</span>
        </SectionTitle>
        <ol className="mt-12 space-y-8">
          {steps.map((st, i) => (
            <Reveal key={st.n} delay={i * 120}>
              <li className="flex gap-5">
                <span className="label h-fit bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {st.n}
                </span>
                <div>
                  <p className="title text-3xl md:text-4xl">{st.t}</p>
                  <p className="mt-2 text-muted-foreground">{st.s}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          {["✕ pas d'appli", "✕ pas de compte"].map((c) => (
            <span key={c} className="panel-paper px-4 py-2 font-bold">
              {c}
            </span>
          ))}
          <span className="bg-primary px-4 py-2 font-bold text-primary-foreground">
            10 secondes
          </span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-6">
        <PhoneFrame>
          <p className="mb-3 text-2xl font-black tracking-tight">Cartes</p>
          <WalletPass brand={brand} filled={1} member="Nouveau membre" />
        </PhoneFrame>
        <div
          className="flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Exemples de cartes"
        >
          {(Object.keys(BRANDS) as (keyof typeof BRANDS)[]).map((k) => (
            <button
              type="button"
              key={k}
              aria-pressed={brand === k}
              onClick={() => setBrand(k)}
              className={`label border-2 px-3 py-2 transition-colors ${brand === k ? "border-primary bg-primary text-primary-foreground" : "border-paper/30 hover:border-paper"}`}
            >
              {BRANDS[k].name.toLowerCase()}
            </button>
          ))}
        </div>
        <p className="label text-muted-foreground">
          Exemples — restaurants fictifs. Cliquez pour changer de style.
        </p>
      </div>
    </section>
  );
}

export function MerchantSide() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 md:grid-cols-[1fr_1.2fr]">
      <div className="order-2 flex flex-wrap items-start justify-center gap-6 md:order-1">
        <PhoneFrame className="scale-90">
          <img src="/logo-megalopole.png" alt="" className="mb-5 h-8 w-auto" />
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-black text-primary-foreground">
              YB
            </span>
            <div>
              <p className="text-lg font-black">Yanis B.</p>
              <p className="text-xs text-muted-foreground">membre depuis mars</p>
            </div>
          </div>
          <p className="label mt-6 text-muted-foreground">tampons</p>
          <p className="title text-6xl">
            8 <span className="text-2xl text-muted-foreground">/ 10</span>
          </p>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className={`h-3 flex-1 rounded-full ${i < 8 ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-primary py-5 text-center text-xl font-black text-primary-foreground anim-ping">
            +1 tampon
          </div>
          <div className="mt-3 rounded-2xl bg-muted py-4 text-center font-bold">
            Utiliser une récompense
          </div>
        </PhoneFrame>
        <div className="w-[280px] rounded-2xl bg-paper p-4 text-ink shadow-2xl anim-float">
          <div className="flex justify-between text-xs font-semibold text-black/50">
            <span>SMASH CLUB</span>
            <span>maintenant</span>
          </div>
          <p className="mt-1 font-black leading-tight">Plus qu'1 menu avant votre menu offert !</p>
        </div>
      </div>
      <div className="order-1 md:order-2">
        <SectionTitle eyebrow="Côté restaurateur">
          un scan. <span className="mark">deux secondes.</span>
        </SectionTitle>
        <p className="mt-8 max-w-lg text-lg text-muted-foreground">
          À la caisse, votre équipe scanne la carte du client et ajoute un tampon. Sa carte se met à
          jour, et il est prévenu quand il approche de sa récompense.
        </p>
        <ul className="mt-8 space-y-3 text-lg">
          <li className="flex gap-3">
            <span className="text-primary">●</span>Sur le téléphone ou la tablette du restaurant
          </li>
          <li className="flex gap-3">
            <span className="text-primary">●</span>Aucun matériel à acheter
          </li>
          <li className="flex gap-3">
            <span className="text-primary">●</span>Sur place ou à emporter : le même geste à la
            caisse
          </li>
        </ul>
      </div>
    </section>
  );
}

export function DashboardPreview() {
  const kpis = [
    ["Clients inscrits", "412", "+38 ce mois"],
    ["Passages", "1 286", "+24 %"],
    ["Menus offerts", "87", "+12"],
  ];
  const top = [
    ["YB", "Yanis B.", 31],
    ["IK", "Inès K.", 27],
    ["MR", "Mehdi R.", 24],
    ["CM", "Clara M.", 22],
  ];
  return (
    <section id="tableau" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle eyebrow="Votre tableau de bord">
          vos clients, <span className="mark">enfin visibles.</span>
        </SectionTitle>
        <ServiceLink slug="tableau-de-bord" className="label" />
      </div>
      <Reveal>
        <div className="relative mt-12 overflow-hidden rounded-xl bg-[#F4F3EF] text-ink shadow-2xl md:grid md:grid-cols-[200px_1fr]">
          <span className="label absolute right-4 top-4 z-10 bg-primary px-2 py-1 text-primary-foreground">
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
            <p className="text-sm font-semibold text-black/50">Smash Club · Cannes</p>
            <p className="title text-3xl normal-case">Bonjour !</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {kpis.map(([l, v, d]) => (
                <div key={l} className="rounded-xl bg-white p-4">
                  <p className="label text-black/50">{l}</p>
                  <p className="title mt-1 text-4xl">{v}</p>
                  <span className="mt-2 inline-block rounded bg-green-100 px-2 text-xs font-bold text-green-800">
                    ▲ {d}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl bg-white p-4">
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
                <span className="text-primary">38 clients</span> ne sont pas revenus depuis 30 jours
              </p>
              <span className="rounded-lg bg-primary px-4 py-3 font-black text-primary-foreground">
                Relances automatiques · Pro et Premium
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
      s: "QR au comptoir, sur les tables, en vitrine.",
      slug: "presentoir-comptoir",
    },
    {
      t: "on forme l'équipe",
      s: "30 minutes sur place, prête à scanner.",
      slug: "formation-equipe",
    },
    {
      t: "on vous suit",
      s: "Bilans, campagnes et support selon votre offre.",
      slug: "bilan-mensuel",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <FoldTitle left="vous n'avez" right="rien à faire." />
      <p className="mt-10 max-w-2xl text-lg text-muted-foreground">
        Carte, installation, formation : on s'occupe de tout. Votre équipe n'a plus qu'à scanner.
      </p>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 100}>
            <Link
              to="/services/$slug"
              params={{ slug: it.slug }}
              className="group block h-full panel-paper p-6 transition-transform hover:-translate-y-1"
            >
              <p className="title text-3xl">{it.t}</p>
              <p className="mt-3 text-black/60">{it.s}</p>
              <p className="label mt-6 group-hover:underline">En savoir plus →</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function OffersSection() {
  return (
    <section id="offres" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <SectionTitle eyebrow="Prix HT">
        3 formules, <span className="mark">sans surprise.</span>
      </SectionTitle>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {offers.map((o, i) => (
          <Reveal key={o.slug} delay={i * 100}>
            <article
              className={`relative flex h-full flex-col p-8 ${o.featured ? "panel-paper" : "border-2 border-paper/80 bg-card"} ${o.slug === "premium" ? "!border-primary" : ""}`}
            >
              {o.featured && (
                <span className="label absolute -top-3 right-6 bg-primary px-3 py-1 text-primary-foreground">
                  Recommandé
                </span>
              )}
              <p className="label mb-2 opacity-70">{o.tagline}</p>
              <h3 className="title text-5xl">{o.name}</h3>
              <p className="mt-4">
                <span className="title text-6xl">{o.price}</span>{" "}
                <span className="label">HT / mois</span>
              </p>
              <p className="mt-3 text-sm">
                <span className="label mr-2 opacity-70">+ installation</span>
                <SetupPrice setup={o.setup} />
                {LAUNCH_OFFER.enabled && (
                  <span className="label ml-2 bg-primary px-1.5 py-0.5 text-primary-foreground">
                    -{LAUNCH_OFFER.discountPercent} %
                  </span>
                )}
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {o.services.map((s) => (
                  <li key={s}>
                    <ServiceLink slug={s} />
                  </li>
                ))}
              </ul>
              <div
                className={`mt-6 flex-1 border-t pt-4 ${o.featured ? "border-black/15" : "border-paper/15"}`}
              >
                <p className="label mb-2 opacity-70">Inclus dans l'installation</p>
                <ul className="space-y-1 text-sm opacity-80">
                  {o.installation.map((it) => (
                    <li key={it}>— {it}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 grid gap-3">
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
        ))}
      </div>
      <p className="mt-8 text-muted-foreground">
        Abonnement par prélèvement SEPA, chaque mois ou une fois par an{" "}
        <b className="text-foreground">({12 - QUOTE_CONFIG.annualMonthsPaid} mois offerts)</b>.
        Installation réglée à la signature.
      </p>
    </section>
  );
}

export function OptionsSection() {
  return (
    <section id="options" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <SectionTitle eyebrow="À ajouter quand vous voulez">
        les <span className="mark">options.</span>
      </SectionTitle>
      <div className="mt-12 overflow-x-auto border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="label p-4">Option</th>
              <th className="label p-4 text-right">Prix HT</th>
            </tr>
          </thead>
          <tbody>
            {options.map((o) => (
              <tr key={o.slug} className="border-b last:border-0 hover:bg-muted">
                <td className="p-4 text-lg font-semibold">
                  <Link to="/options" hash={o.slug} className="link-y">
                    {o.name}
                  </Link>
                  <span className="label ml-2 text-muted-foreground">{o.unitLabel}</span>
                </td>
                <td className="title p-4 text-right text-2xl">{o.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <p className="border-l-4 border-primary pl-4 text-muted-foreground">
          <b className="text-foreground">Vitrophanie</b> : autocollant imprimé collé sur votre
          vitrine pour inviter les passants à rejoindre votre carte.
        </p>
        <p className="border-l-4 border-primary pl-4 text-muted-foreground">
          <b className="text-foreground">Flyers</b> : glissés dans les sacs à emporter et les
          commandes en livraison pour inscrire de nouveaux clients.
        </p>
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          to="/options"
          className="border-2 border-primary px-7 py-4 text-lg font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Voir toutes les options en détail →
        </Link>
      </div>
    </section>
  );
}

function Slider({
  label,
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
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-4 font-semibold">
        <span>{label}</span>
        <span className="title text-2xl text-primary">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--color-primary)]"
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
    <section id="simulateur" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
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
            fmt={(v) => `${v} %`}
          />
          <Slider
            label="Visites en plus par client inscrit et par mois"
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
            fmt={(v) => `${v} €`}
          />
        </div>
        <div className="bg-primary p-8 text-primary-foreground">
          <p className="label">Chiffre d'affaires en plus, par mois</p>
          <p className="title mt-3 text-7xl">{fr(monthly)} €</p>
          <p className="mt-4 font-semibold">soit {fr(monthly * 12)} € sur un an.</p>
          <p className="mt-2 text-sm">
            Pour comparaison : la formule {offers.find((o) => o.featured)?.name} coûte{" "}
            {offers.find((o) => o.featured)?.price} HT par mois.
          </p>
          <p className="label mt-6 opacity-70">Estimation indicative, non contractuelle</p>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-5 py-20">
      <SectionTitle eyebrow="Vos questions">
        questions <span className="mark">fréquentes.</span>
      </SectionTitle>
      <div className="mt-12 space-y-12">
        {faq.map((g) => (
          <div key={g.title}>
            <p className="label mb-2 text-primary">{g.title}</p>
            {g.items.map((f) => (
              <details key={f.q} className="group border-b py-5">
                <summary className="flex cursor-pointer list-none justify-between gap-6 text-lg font-bold">
                  {f.q}
                  <span className="text-2xl text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContactSection() {
  const [sent, setSent] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const body = ["Nom", "Restaurant", "Ville", "Téléphone", "Message"]
      .map((k) => `${k} : ${d.get(k) ?? ""}`)
      .join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Demande de rendez-vous — " + (d.get("Restaurant") ?? ""))}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }
  const field =
    "w-full border-2 border-paper/20 bg-transparent px-4 py-3 outline-none focus:border-primary";
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="grid gap-14 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="title text-5xl md:text-7xl">
            vos clients reviennent. votre chiffre <span className="mark">aussi.</span>
          </h2>
          <div className="mt-12">
            <Logo className="h-24" />
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
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
              name="Restaurant"
              aria-label="Restaurant"
              autoComplete="organization"
              required
              placeholder="Nom du restaurant"
              className={field}
            />
            <input
              name="Ville"
              aria-label="Ville"
              autoComplete="address-level2"
              placeholder="Ville"
              className={field}
            />
            <input
              name="Téléphone"
              aria-label="Téléphone"
              autoComplete="tel"
              required
              type="tel"
              placeholder="Téléphone"
              className={field}
            />
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
            Être rappelé →
          </button>
          {sent && (
            <p className="text-sm text-muted-foreground">
              Votre messagerie s'est ouverte avec votre demande : il ne reste plus qu'à l'envoyer.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
