import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getService } from "@/data/services";
import { Crumbs, Footer, IncludedIn, Reveal, SiteHeader } from "@/components/site";
import { ServiceIllustration } from "@/components/illustrations";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Service introuvable" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.service;
    const t = `${s.name} — mégalopole`;
    return {
      meta: [
        { title: t },
        { name: "description", content: s.enClair },
        { property: "og:title", content: t },
        { property: "og:description", content: s.enClair },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="title text-5xl">service introuvable</h1>
      <Link to="/" className="label link-y">
        ← Retour aux offres
      </Link>
    </div>
  ),
  errorComponent: () => <div className="p-10">Cette page n'a pas pu se charger.</div>,
});

function ServicePage() {
  const { service: s } = Route.useLoaderData();
  return (
    <div>
      <SiteHeader />
      <Crumbs items={[{ label: "Offres", to: "/" }, { label: s.name }]} />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="label mb-6 text-primary">Service</p>
        <h1 className="title text-5xl md:text-7xl">{s.name}</h1>
        <p className="mt-8 max-w-2xl text-xl">
          <span className="mark mr-2">En clair</span> {s.enClair}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <Reveal>
          <ServiceIllustration slug={s.slug} />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="title mb-10 text-4xl">
          comment ça <span className="mark">se passe</span>
        </h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {s.steps.map((step, i) => (
            <Reveal key={i} delay={i * 80}>
              <li className="fold-r h-full border bg-card p-6">
                <span className="title text-5xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-lg">{step}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {s.sections?.map((sec) => (
        <section key={sec.title} className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="title mb-3 text-4xl">{sec.title}</h2>
          {sec.intro && <p className="label mb-8 text-primary">{sec.intro}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sec.items.map((it, i) => (
              <Reveal key={it.title} delay={i * 60}>
                <div className="h-full border p-6">
                  {it.label && <p className="label mb-2 text-primary">{it.label}</p>}
                  <h3 className="title text-2xl">{it.title}</h3>
                  <p className="mt-2 text-muted-foreground">{it.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <div className="panel-paper fold relative p-10">
            <span className="label absolute right-6 top-6 bg-primary px-2 py-1">Exemple</span>
            <p className="label mb-3">Exemple — restaurant fictif</p>
            <p className="max-w-3xl font-serif text-2xl italic leading-snug md:text-3xl">
              {s.example}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="title mb-10 text-4xl">
          ce que ça vous <span className="mark">apporte</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {s.benefits.map((b, i) => (
            <Reveal key={b} delay={i * 80}>
              <div className="h-full border-t-4 border-primary bg-card p-6 text-xl font-bold">
                {b}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-10">
        <h2 className="title mb-8 text-4xl">
          questions <span className="mark">fréquentes</span>
        </h2>
        {s.faq.map((f) => (
          <details key={f.q} className="group border-b py-5">
            <summary className="flex cursor-pointer list-none justify-between text-lg font-bold">
              {f.q}
              <span className="text-primary transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </section>

      <IncludedIn slug={s.slug} />
      <Footer />
    </div>
  );
}
