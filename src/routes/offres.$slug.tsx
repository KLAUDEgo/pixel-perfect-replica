import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getOffer } from "@/data/services";
import { POLICY } from "@/data/content";
import { ChooseOfferButton } from "@/components/quote";
import {
  CtaButton,
  NotFoundPage,
  Crumbs,
  Footer,
  Reveal,
  ServiceLink,
  SetupPrice,
  SiteHeader,
} from "@/components/site";

export const Route = createFileRoute("/offres/$slug")({
  loader: ({ params }) => {
    const offer = getOffer(params.slug);
    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Page introuvable — mégalopole" }, { name: "robots", content: "noindex" }],
      };
    const o = loaderData.offer;
    const t = `Formule ${o.name} — mégalopole`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `${o.idealFor} ${o.price} par mois.` },
        { property: "og:title", content: t },
        { property: "og:description", content: o.idealFor },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: OfferPage,
  notFoundComponent: () => (
    <NotFoundPage
      title="formule"
      text="Cette formule n'existe pas. Retrouvez toutes nos formules sur la page d'accueil."
    />
  ),
  errorComponent: () => <div className="p-10">Cette page n'a pas pu se charger.</div>,
});

function OfferPage() {
  const { offer: o } = Route.useLoaderData();
  return (
    <div>
      <SiteHeader />
      <Crumbs items={[{ label: "Formules", to: "/" }, { label: o.name }]} />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div className="min-w-0">
          <p className="label mb-6 text-primary">Formule — {o.tagline}</p>
          <h1 className="title break-words text-6xl sm:text-7xl md:text-8xl xl:text-9xl">
            {o.name.toLowerCase()}
          </h1>
          <p className="mt-8 max-w-xl text-xl">
            <span className="mark mr-2">Idéal si</span>
            {o.idealFor.replace(/^Idéal si /, "")}
          </p>
        </div>
        <div className="panel-paper fold-r min-w-0 p-8 md:max-w-md lg:max-w-none">
          <p className="label">Abonnement</p>
          <p className="title text-6xl">{o.price}</p>
          <p className="label">par mois</p>
          <p className="mt-2 text-sm font-semibold">
            Sans engagement · préavis {POLICY.noticeMonths} mois
          </p>
          <div className="my-5 h-px bg-ink/20" />
          <p className="label">Installation</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <SetupPrice setup={o.setup} className="title whitespace-nowrap text-2xl sm:text-3xl" />
            <span className="label whitespace-nowrap">une fois</span>
          </p>
          <p className="label mt-4 opacity-60">TVA non applicable : prix final</p>
          <ChooseOfferButton slug={o.slug} className="mt-6 w-full" />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 md:grid-cols-2 [&>*]:min-w-0">
        <Reveal>
          <h2 className="title mb-6 text-4xl">
            tous les <span className="mark">services</span>
          </h2>
          <ul className="border-t">
            {o.services.map((s) => (
              <li key={s} className="border-b py-3 text-lg">
                <ServiceLink slug={s} className="w-full justify-between" />
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="title mb-6 text-4xl">
            l'<span className="mark">installation</span>
          </h2>
          <ol className="space-y-3">
            {o.installation.map((it, i) => (
              <li key={it} className="fold-r flex items-center gap-4 border bg-card p-4">
                <span className="title text-3xl text-primary">{i + 1}</span>
                <span className="text-lg">{it}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-5 pb-24">
        <Link
          to="/"
          hash="comparatif"
          className="border-2 border-primary px-7 py-4 text-center text-lg font-bold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Comparer avec les autres formules
        </Link>
        <CtaButton />
      </section>
      <Footer />
    </div>
  );
}
