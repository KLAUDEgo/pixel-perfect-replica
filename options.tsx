import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LAUNCH_OFFER, POLICY, QUOTE_CONFIG, SOCIAL_PACK_MONTHLY, options } from "@/data/content";
import { offers } from "@/data/services";
import { CtaButton, Crumbs, Footer, Reveal, SetupPrice, SiteHeader } from "@/components/site";
import { ServiceIllustration } from "@/components/illustrations";
import { AddOptionButton } from "@/components/quote";
import { PlaquePreview } from "@/components/plaque";
import { PresentoirPreview } from "@/components/previews/presentoir";
import { VitrophaniePreview } from "@/components/previews/vitrophanie";
import { FlyersPreview } from "@/components/previews/flyers";
import { DesignPreview } from "@/components/previews/design";
import { ReseauxPreview } from "@/components/previews/reseaux";

/** Aperçu interactif par option (à la place de l'illustration générique). */
const PREVIEWS: Record<string, () => ReactNode> = {
  "plaques-qr-table": () => <PlaquePreview />,
  "presentoirs-qr": () => <PresentoirPreview />,
  vitrophanie: () => <VitrophaniePreview />,
  flyers: () => <FlyersPreview />,
  "nouveau-design": () => <DesignPreview />,
  "pack-reseaux-sociaux": () => <ReseauxPreview />,
};

/** "sous 7 jours après la commande" -> "sous 7 jours". */
const OPTION_DELAY_SHORT =
  /sous\s+\d+\s*jours?/.exec(POLICY.optionDelay)?.[0] ?? POLICY.optionDelay;

export const Route = createFileRoute("/options")({
  head: () => ({
    meta: [
      { title: "Options et installation — mégalopole" },
      {
        name: "description",
        content:
          "QR de table, présentoirs, vitrophanie, flyers, nouveau design, formation, Pack réseaux sociaux : toutes les options pour aller plus loin, avec leur prix.",
      },
      { property: "og:title", content: "Options et installation — mégalopole" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: OptionsPage,
});

function LaunchOffer() {
  if (!LAUNCH_OFFER.enabled) return null;
  return (
    <section id="lancement" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-20">
      <div className="bg-primary p-8 text-primary-foreground md:p-12">
        <p className="label">Offre de lancement</p>
        <h2 className="title mt-3 text-4xl md:text-6xl">
          −{LAUNCH_OFFER.discountPercent} % sur l'installation pour les {LAUNCH_OFFER.spots}{" "}
          premiers commerces.
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-3 text-lg">
            <p>
              <b>Ce que vous gagnez :</b> {LAUNCH_OFFER.discountPercent} % de remise sur les frais
              d'installation de votre formule.
            </p>
            <p>
              <b>En échange :</b> {LAUNCH_OFFER.counterpart} (votre devanture ou votre comptoir avec
              la carte).
            </p>
            <p className="text-base opacity-80">
              Offre réservée aux {LAUNCH_OFFER.spots} premiers commerces signés. La remise
              s'applique aux frais d'installation de la formule ; les options restent au tarif
              normal.
            </p>
          </div>
          <div className="grid gap-3">
            {offers.map((o) => (
              <div
                key={o.slug}
                className="flex items-center justify-between bg-ink px-5 py-4 text-paper"
              >
                <span className="title text-2xl">{o.name}</span>
                <SetupPrice setup={o.setup} className="text-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionCards() {
  return (
    <section className="mx-auto max-w-6xl space-y-24 px-5 pb-24">
      {options.map((o, i) => (
        <Reveal key={o.slug}>
          <article
            id={o.slug}
            className="grid scroll-mt-28 grid-cols-[minmax(0,1fr)] items-center gap-10 md:grid-cols-2"
          >
            <div className={i % 2 ? "md:order-2" : ""}>
              <p className="label mb-3 text-primary">
                {o.recurring
                  ? "Option mensuelle"
                  : o.amount === null
                    ? "Option"
                    : "Option ponctuelle"}
              </p>
              <h2 className="title text-4xl md:text-5xl">{o.name}</h2>
              <p className="mt-5 flex flex-wrap items-baseline gap-3">
                <span className="title text-5xl text-primary">{o.price}</span>
                <span className="label text-muted-foreground">{o.unitLabel}</span>
              </p>
              <p className="mt-6 text-lg">
                <span className="mark mr-2">En clair</span>
                {o.enClair}
              </p>
              <p className="label mt-8 mb-3 text-muted-foreground">Ce qui est inclus</p>
              <ul className="space-y-2">
                {o.includes.map((it) => (
                  <li key={it} className="flex gap-3 text-lg">
                    <span className="text-primary">✓</span>
                    {it}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-l-4 border-primary pl-4 text-muted-foreground">
                <b className="text-foreground">Idéal si :</b> {o.idealFor}
              </p>
              {o.service && (
                <Link
                  to="/services/$slug"
                  params={{ slug: o.service }}
                  className="label link-y mt-6 inline-block"
                >
                  Voir comment ça se passe →
                </Link>
              )}
              {o.amount !== null ? (
                <AddOptionButton slug={o.slug} />
              ) : (
                <Link
                  to="/devis"
                  className="mt-6 inline-block bg-primary px-5 py-3 font-bold text-primary-foreground"
                >
                  Ajouter des établissements dans mon devis →
                </Link>
              )}
            </div>
            <div className={`min-w-0 overflow-hidden ${i % 2 ? "md:order-1" : ""}`}>
              {PREVIEWS[o.slug] ? (
                PREVIEWS[o.slug]!()
              ) : o.service ? (
                <ServiceIllustration slug={o.service} />
              ) : (
                <div className="grid min-h-[260px] grid-cols-3 content-center gap-2 border bg-card p-4 sm:min-h-[320px] sm:gap-4 sm:p-10">
                  {["Cannes", "Antibes", "Nice"].map((v, k) => (
                    <div
                      key={v}
                      className={`flex min-w-0 flex-col justify-center px-1 py-4 text-center sm:p-5 ${k === 0 ? "panel-paper" : "border-2 border-primary"}`}
                    >
                      <p className="title text-lg leading-tight sm:text-2xl">{v}</p>
                      <p className="label mt-2 text-[0.65rem] sm:text-xs">
                        {k === 0 ? "plein tarif" : `−${QUOTE_CONFIG.extraSiteDiscountPercent} %`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </section>
  );
}

function QuoteCta() {
  return (
    <section id="calculateur" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
      <div className="panel-paper flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <p className="label">Devis en ligne</p>
          <h2 className="title mt-3 text-4xl md:text-5xl">composez votre devis, à votre rythme.</h2>
          <p className="mt-3 max-w-xl text-black/60">
            Formule, options, paiement : vous recevez votre devis en PDF tout de suite. Gratuit et
            sans obligation.
          </p>
        </div>
        <Link
          to="/devis"
          className="whitespace-nowrap bg-ink px-7 py-4 text-lg font-bold text-paper"
        >
          Composer mon devis →
        </Link>
      </div>
    </section>
  );
}

function OptionsFaq() {
  const items = [
    {
      q: "Puis-je ajouter une option plus tard ?",
      a: `Oui, à tout moment : prévenez-nous. On l'installe ${OPTION_DELAY_SHORT}.`,
    },
    {
      q: "Les options sont-elles payées une seule fois ?",
      a: `Oui, sauf le Pack réseaux sociaux. Les autres options sont des achats ponctuels, réglés une fois. Le Pack réseaux sociaux est mensuel (${SOCIAL_PACK_MONTHLY} € par mois), sans engagement : vous l'arrêtez quand vous voulez, avec un préavis d'un mois.`,
    },
    {
      q: "Qui installe le matériel ?",
      a: "Nous : plaques, présentoirs et vitrophanie sont posés sur place.",
    },
    { q: "Quel délai pour recevoir une option ?", a: `Elle est installée ${POLICY.optionDelay}.` },
  ];
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20">
      <h2 className="title mb-8 text-4xl">
        questions <span className="mark">fréquentes</span>
      </h2>
      {items.map((f) => (
        <details key={f.q} className="group border-b py-5">
          <summary className="flex cursor-pointer list-none justify-between gap-6 text-lg font-bold">
            {f.q}
            <span className="text-primary transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </section>
  );
}

function OptionsPage() {
  return (
    <div>
      <SiteHeader />
      <Crumbs items={[{ label: "Options" }]} />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="label mb-6 text-primary">
          Options ponctuelles · sauf le Pack réseaux sociaux (mensuel)
        </p>
        <h1 className="title text-5xl md:text-8xl">
          allez plus <span className="mark">loin.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-muted-foreground">
          Plus votre carte est visible, plus vos clients s'inscrivent. Ajoutez des supports, des
          flyers ou un nouveau design quand vous voulez, ou confiez-nous vos réseaux sociaux.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">TVA non applicable : prix final.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          {options.map((o) => (
            <Link
              key={o.slug}
              to="/options"
              hash={o.slug}
              className="label border-2 border-paper/25 px-3 py-2 transition-colors hover:border-primary hover:text-primary"
            >
              {o.name}
            </Link>
          ))}
          <Link
            to="/options"
            hash="calculateur"
            className="label bg-primary px-3 py-2 text-primary-foreground"
          >
            Composer mon devis →
          </Link>
        </div>
      </section>
      <LaunchOffer />
      <OptionCards />
      <QuoteCta />
      <OptionsFaq />
      <section className="mx-auto flex max-w-6xl justify-center px-5 pb-24">
        <CtaButton />
      </section>
      <Footer />
    </div>
  );
}
