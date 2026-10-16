import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { offers, services, type OfferSlug } from "@/data/services";
import { CtaButton, DevisCta, Footer, ServiceLink, SiteHeader } from "@/components/site";
import {
  ContactSection,
  DashboardPreview,
  FaqSection,
  Hero,
  HowItWorks,
  OffersSection,
  OptionsSection,
  Problem,
  RoiSimulator,
  Stats,
  WeHandleIt,
} from "@/components/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "mégalopole — Carte de fidélité digitale pour restaurants et commerces" },
      {
        name: "description",
        content:
          "La carte de fidélité digitale qui fait revenir vos clients\u00a0: dans leur téléphone, sans appli, sans compte. Restaurants, cafés, boulangeries, salons et commerces de Grasse à Nice, installée sur place.",
      },
      {
        property: "og:title",
        content: "mégalopole — Carte de fidélité digitale pour restaurants et commerces",
      },
      {
        property: "og:description",
        content:
          "Faites revenir vos clients avec une carte de fidélité dans leur téléphone, sans appli ni compte. Restaurants, cafés et commerces de Grasse à Nice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const included = (slug: string, service: string) =>
  offers.find((o) => o.slug === slug)?.services.includes(service) ?? false;

function Mark({ on }: { on: boolean }) {
  return on ? (
    <span role="img" aria-label="inclus" className="text-lg font-bold text-primary">
      ✓
    </span>
  ) : (
    <span role="img" aria-label="non inclus" className="text-muted-foreground">
      —
    </span>
  );
}

/** Mobile : deux formules côte à côte (sélecteurs), lisible à 360 px sans défilement latéral. */
function MobileCompare() {
  const [pick, setPick] = useState<[OfferSlug, OfferSlug]>(["pro", "premium"]);
  const select = (i: 0 | 1) => (
    <div className="min-w-0">
      <label htmlFor={`compare-${i}`} className="sr-only">
        {i === 0 ? "Première formule" : "Deuxième formule"}
      </label>
      <div className="relative">
        <select
          id={`compare-${i}`}
          value={pick[i]}
          onChange={(e) => {
            const v = e.target.value as OfferSlug;
            setPick((p) => (i === 0 ? [v, p[1]] : [p[0], v]));
          }}
          className="min-h-11 w-full appearance-none border-2 border-paper/40 bg-ink py-2 pl-1 pr-3 text-xs font-bold focus:border-primary"
        >
          {offers.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px]"
        >
          ▾
        </span>
      </div>
      <p className="mt-1 text-center text-xs font-semibold text-muted-foreground">
        {offers.find((o) => o.slug === pick[i])?.price.replace(" €", "\u00a0€")}/mois
      </p>
    </div>
  );
  const cols = "grid grid-cols-[minmax(0,1fr)_4.75rem_4.75rem] items-center gap-x-1.5";
  return (
    <div className="md:hidden" data-testid="compare-mobile">
      <div className={`${cols} border-b p-3`}>
        <span className="label">Service</span>
        {select(0)}
        {select(1)}
      </div>
      <ul>
        {services.map((s) => (
          <li key={s.slug} className={`${cols} border-b px-3 py-1 text-sm last:border-0`}>
            <ServiceLink
              slug={s.slug}
              className="min-h-11 text-[13px] leading-tight [&>span:last-child]:hidden"
            />
            <span className="text-center">
              <Mark on={included(pick[0], s.slug)} />
            </span>
            <span className="text-center">
              <Mark on={included(pick[1], s.slug)} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Comparatif détaillé, placé juste sous les cartes de formules. */
function Comparatif() {
  const hash = useRouterState({ select: (st) => st.location.hash });
  const ref = useRef<HTMLDetailsElement>(null);
  // Ouvert par défaut sur mobile/tablette (< lg), et via le lien /#comparatif.
  useEffect(() => {
    if (!ref.current) return;
    if (hash === "comparatif" || window.matchMedia("(max-width: 1023.98px)").matches)
      ref.current.open = true;
  }, [hash]);
  return (
    <div id="comparatif" className="mt-10 scroll-mt-[72px] lg:scroll-mt-24">
      <details ref={ref} className="group border-2 border-paper/20">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 p-5 md:p-6">
          <span className="title text-3xl md:text-4xl">
            comparer les formules <span className="mark">en détail</span>
          </span>
          <span className="text-3xl text-primary transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="border-t">
          <MobileCompare />
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="label p-4 text-left">Service</th>
                  {offers.map((o) => (
                    <th key={o.slug} className="p-4">
                      <Link
                        to="/offres/$slug"
                        params={{ slug: o.slug }}
                        className="title link-y text-2xl"
                      >
                        {o.name}
                      </Link>
                      <div className="label mt-1 text-muted-foreground">
                        {o.price.replace(" €", "\u00a0€")} / mois
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.slug} className="border-b last:border-0 hover:bg-muted">
                    <td className="p-4">
                      <ServiceLink slug={s.slug} />
                    </td>
                    {offers.map((o) => (
                      <td key={o.slug} className="p-4 text-center">
                        {o.services.includes(s.slug) ? (
                          <span className="text-primary" aria-label="inclus">
                            ●
                          </span>
                        ) : (
                          <span className="text-muted-foreground" aria-label="non inclus">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <DevisCta />
        <CtaButton />
      </div>
    </div>
  );
}

function Index() {
  return (
    <div>
      <SiteHeader />
      <Hero />
      <Problem />
      <Stats />
      <HowItWorks />
      <DashboardPreview />
      <WeHandleIt />
      <OffersSection>
        <Comparatif />
      </OffersSection>
      <OptionsSection />
      <RoiSimulator />
      <FaqSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
