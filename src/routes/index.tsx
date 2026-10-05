import { createFileRoute, Link } from "@tanstack/react-router";
import { offers, services } from "@/data/services";
import { CtaButton, Footer, Reveal, ServiceLink, SiteHeader } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "mégalopole — Cartes fidélité pour fast-foods" },
      { name: "description", content: "Une carte fidélité dans le téléphone de vos clients. Trois offres : Essentiel, Pro, Premium." },
      { property: "og:title", content: "mégalopole — Cartes fidélité pour fast-foods" },
      { property: "og:description", content: "Faites revenir vos clients avec une carte fidélité dans leur téléphone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-24">
        <p className="label mb-6 text-primary">Fidélité pour fast-foods</p>
        <h1 className="title text-6xl md:text-8xl">
          vos clients <span className="mark">reviennent</span>, <br />on s'occupe du reste.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Une carte fidélité dans le téléphone de vos clients, des rappels automatiques et un suivi clair.
        </p>
      </section>

      <section id="offres" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <h2 className="title mb-12 text-5xl">nos <span className="mark">offres</span></h2>
        <div className="grid gap-6 md:grid-cols-3">
          {offers.map((o, i) => (
            <Reveal key={o.slug} delay={i * 100}>
              <article className={`${i % 2 ? "fold-r" : "fold"} flex h-full flex-col p-8 ${o.featured ? "panel-paper" : "border bg-card"}`}>
                <p className="label mb-2 opacity-70">{o.tagline}</p>
                <h3 className="title text-5xl">{o.name}</h3>
                <p className="mt-4"><span className="title text-4xl">{o.price}</span> <span className="label">HT / mois</span></p>
                <p className="label mt-1 opacity-70">+ {o.setup} HT d'installation</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {o.services.map((s) => <li key={s}><ServiceLink slug={s} /></li>)}
                </ul>
                <Link to="/offres/$slug" params={{ slug: o.slug }} className={`mt-8 border-2 px-5 py-3 text-center font-bold transition-colors ${o.featured ? "border-ink hover:bg-ink hover:text-paper" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}>
                  Voir le détail →
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="label mt-6 text-muted-foreground">Tarifs indicatifs</p>
      </section>

      <section id="comparatif" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-24">
        <h2 className="title mb-10 text-5xl">le <span className="mark">comparatif</span></h2>
        <div className="overflow-x-auto border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="label p-4 text-left">Service</th>
                {offers.map((o) => (
                  <th key={o.slug} className="p-4"><Link to="/offres/$slug" params={{ slug: o.slug }} className="title link-y text-2xl">{o.name}</Link></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.slug} className="border-b last:border-0 hover:bg-muted">
                  <td className="p-4"><ServiceLink slug={s.slug} /></td>
                  {offers.map((o) => (
                    <td key={o.slug} className="p-4 text-center">
                      {o.services.includes(s.slug) ? <span className="text-primary">●</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-12 flex justify-center"><CtaButton /></div>
      </section>
      <Footer />
    </div>
  );
}
