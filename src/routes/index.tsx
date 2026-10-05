import { createFileRoute, Link } from "@tanstack/react-router";
import { offers, services } from "@/data/services";
import { CtaButton, Footer, ServiceLink, SiteHeader } from "@/components/site";
import {
  ContactSection,
  DashboardPreview,
  FaqSection,
  Hero,
  HowItWorks,
  MerchantSide,
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
      { title: "mégalopole — La carte de fidélité digitale pour les restaurants" },
      {
        name: "description",
        content:
          "La carte de fidélité digitale qui fait revenir vos clients : dans leur téléphone, sans appli, sans compte. Fast-foods et restaurants de Grasse à Nice.",
      },
      {
        property: "og:title",
        content: "mégalopole — La carte de fidélité digitale pour les restaurants",
      },
      {
        property: "og:description",
        content: "Faites revenir vos clients avec une carte de fidélité dans leur téléphone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Comparatif() {
  return (
    <section id="comparatif" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <details className="group border-2 border-paper/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6">
          <span className="title text-3xl md:text-4xl">
            comparer les offres <span className="mark">en détail</span>
          </span>
          <span className="text-3xl text-primary transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="overflow-x-auto border-t">
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
                    <div className="label mt-1 text-muted-foreground">{o.price} / mois</div>
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
      </details>
      <div className="mt-12 flex justify-center">
        <CtaButton />
      </div>
    </section>
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
      <MerchantSide />
      <DashboardPreview />
      <WeHandleIt />
      <OffersSection />
      <Comparatif />
      <OptionsSection />
      <RoiSimulator />
      <FaqSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
