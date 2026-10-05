import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getOffer } from "@/data/services";
import { CtaButton, Crumbs, Footer, Reveal, ServiceLink, SiteHeader } from "@/components/site";

export const Route = createFileRoute("/offres/$slug")({
  loader: ({ params }) => {
    const offer = getOffer(params.slug);
    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Offre introuvable" }, { name: "robots", content: "noindex" }] };
    const o = loaderData.offer;
    const t = `Offre ${o.name} — mégalopole`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `${o.idealFor} ${o.price} HT/mois.` },
        { property: "og:title", content: t },
        { property: "og:description", content: o.idealFor },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: OfferPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="title text-5xl">offre introuvable</h1>
      <Link to="/" className="label link-y">← Retour aux offres</Link>
    </div>
  ),
  errorComponent: () => <div className="p-10">Cette page n'a pas pu se charger.</div>,
});

function OfferPage() {
  const { offer: o } = Route.useLoaderData();
  return (
    <div>
      <SiteHeader />
      <Crumbs items={[{ label: "Offres", to: "/" }, { label: o.name }]} />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="label mb-6 text-primary">Offre — {o.tagline}</p>
          <h1 className="title text-7xl md:text-9xl">{o.name.toLowerCase()}</h1>
          <p className="mt-8 max-w-xl text-xl"><span className="mark mr-2">Idéal si</span>{o.idealFor.replace(/^Idéal si /, "")}</p>
        </div>
        <div className="panel-paper fold-r p-8">
          <p className="label">Abonnement</p>
          <p className="title text-6xl">{o.price}</p>
          <p className="label">HT / mois</p>
          <div className="my-5 h-px bg-ink/20" />
          <p className="label">Installation</p>
          <p className="title text-3xl">{o.setup} <span className="label">HT, une fois</span></p>
          <p className="label mt-4 opacity-60">Tarifs indicatifs</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 md:grid-cols-2">
        <Reveal>
          <h2 className="title mb-6 text-4xl">tous les <span className="mark">services</span></h2>
          <ul className="border-t">
            {o.services.map((s) => (
              <li key={s} className="border-b py-3 text-lg"><ServiceLink slug={s} className="w-full justify-between" /></li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="title mb-6 text-4xl">l'<span className="mark">installation</span></h2>
          <ol className="space-y-3">
            {o.installation.map((it, i) => (
              <li key={it} className="fold-r flex items-center gap-4 border bg-card p-4">
                <span className="title text-3xl text-primary">{i + 1}</span><span className="text-lg">{it}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-5 pb-24">
        <Link to="/" hash="comparatif" className="border-2 border-primary px-7 py-4 text-lg font-bold text-primary hover:bg-primary hover:text-primary-foreground">
          Comparer avec les autres offres
        </Link>
        <CtaButton />
      </section>
      <Footer />
    </div>
  );
}
