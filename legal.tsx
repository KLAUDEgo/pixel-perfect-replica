import type { ReactNode } from "react";
import { Crumbs, Footer, SiteHeader } from "@/components/site";
import { CGV_VERSION } from "@/lib/quote";

/** Même date que la version des CGV citée sur le devis PDF. */
export const LEGAL_UPDATED = CGV_VERSION;

export function LegalPage({
  title,
  crumb,
  intro,
  children,
}: {
  title: string;
  crumb: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <SiteHeader />
      <Crumbs items={[{ label: crumb }]} />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="label mb-4 text-primary">Dernière mise à jour : {LEGAL_UPDATED}</p>
        <h1 className="title text-5xl md:text-7xl">{title}</h1>
        {intro && <p className="mt-6 text-lg text-muted-foreground">{intro}</p>}
        <div className="mt-12 space-y-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="title mb-4 text-2xl md:text-3xl">{title}</h2>
      <div className="space-y-3 text-muted-foreground [&_b]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </section>
  );
}
