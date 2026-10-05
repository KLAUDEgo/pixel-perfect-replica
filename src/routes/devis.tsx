import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { CONTACT_EMAIL, LAUNCH_OFFER, QUOTE_CONFIG, options } from "@/data/content";
import { offers } from "@/data/services";
import { Crumbs, Footer, SetupPrice, SiteHeader } from "@/components/site";
import { Stepper, useQuote } from "@/components/quote";
import {
  computeQuote,
  downloadQuotePdf,
  money,
  quoteNumber,
  quoteText,
  sendQuote,
  type Customer,
  type Line,
  type QuoteState,
} from "@/lib/quote";

export const Route = createFileRoute("/devis")({
  head: () => ({
    meta: [
      { title: "Mon devis — mégalopole" },
      {
        name: "description",
        content:
          "Composez votre devis en quelques minutes : formule, options, paiement. Gratuit et sans obligation.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DevisPage,
});

const emptyCustomer: Customer = {
  name: "",
  restaurant: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  message: "",
};

type Status = "idle" | "busy" | "done";
type Sent = "sent" | "mailto" | "failed" | null;

function StepTitle({ n, children }: { n: string; children: string }) {
  return (
    <h2 className="flex items-center gap-4">
      <span className="label bg-primary px-3 py-2 text-sm text-primary-foreground">{n}</span>
      <span className="title text-3xl md:text-4xl">{children}</span>
    </h2>
  );
}

function Lines({ lines }: { lines: Line[] }) {
  return (
    <div className="space-y-2">
      {lines.map((l) => (
        <div key={l.label} className="flex justify-between gap-4 text-sm">
          <span>
            {l.qty > 1 ? `${l.qty} × ` : ""}
            {l.label.split(" (")[0]}
          </span>
          <b className="whitespace-nowrap">{money(l.total)}</b>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  required,
  ...props
}: { label: string; required?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label mb-2 block text-muted-foreground">
        {label}
        {required && " *"}
      </span>
      <input
        required={required}
        {...props}
        className="w-full border-2 border-paper/20 bg-transparent px-4 py-3 focus:border-primary"
      />
    </label>
  );
}

/** Écran affiché une fois le devis préparé. */
function Done({
  num,
  sent,
  pdfOk,
  snapshot,
  customer,
  onRetrySend,
  sending,
}: {
  num: string;
  sent: Sent;
  pdfOk: boolean;
  snapshot: QuoteState;
  customer: Customer;
  onRetrySend: () => void;
  sending: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [dlError, setDlError] = useState(false);
  const text = quoteText(snapshot, customer, num);
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <p className="label mb-6 text-primary">Devis {num}</p>
      <h1 className="title text-5xl md:text-7xl">
        votre devis est <span className="mark">prêt.</span>
      </h1>
      <div className="mt-10 space-y-4 text-lg">
        {pdfOk ? (
          <p>
            <span aria-hidden>✓ </span>Le PDF de votre devis a été téléchargé sur votre appareil.
          </p>
        ) : (
          <p>
            Le PDF n'a pas pu être créé sur cet appareil. Vous pouvez réessayer avec le bouton
            ci-dessous.
          </p>
        )}
        {sent === "sent" && (
          <p>
            <span aria-hidden>✓ </span>Une copie nous a été envoyée : nous vous appelons très vite
            pour en parler.
          </p>
        )}
        {sent === "mailto" && (
          <p>
            Pour qu'on reçoive votre demande, envoyez le message qui vient de s'ouvrir dans votre
            messagerie. Si rien ne s'est ouvert, copiez le devis ci-dessous et envoyez-le à{" "}
            <b>{CONTACT_EMAIL}</b>.
          </p>
        )}
        {sent === "failed" && (
          <p className="border-2 border-red-600 p-4">
            L'envoi de la copie n'a pas fonctionné. Réessayez, ou copiez le devis ci-dessous et
            envoyez-le à <b>{CONTACT_EMAIL}</b>.
          </p>
        )}
        <p className="text-muted-foreground">
          Ce devis est gratuit et ne vous engage pas tant qu'il n'est pas signé.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => {
            setDlError(false);
            downloadQuotePdf(snapshot, customer, num).catch(() => setDlError(true));
          }}
          className="bg-primary px-7 py-4 text-lg font-bold text-primary-foreground"
        >
          {pdfOk ? "Télécharger à nouveau le PDF" : "Réessayer le PDF"}
        </button>
        {sent === "failed" && (
          <button
            type="button"
            onClick={onRetrySend}
            disabled={sending}
            className="border-2 border-primary px-7 py-4 text-lg font-bold text-primary disabled:opacity-40"
          >
            {sending ? "Envoi…" : "Réessayer l'envoi"}
          </button>
        )}
        <Link
          to="/"
          className="border-2 border-paper px-7 py-4 text-lg font-bold hover:bg-paper hover:text-ink"
        >
          Retour au site
        </Link>
      </div>
      {dlError && (
        <p className="mt-4 text-red-400">Le PDF n'a pas pu être créé. Réessayez dans un instant.</p>
      )}
      {(sent === "mailto" || sent === "failed") && (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <p className="label text-muted-foreground">Votre devis en texte</p>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true))}
              className="label border-2 border-paper/30 px-3 py-2 hover:border-paper"
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap border border-paper/20 p-4 text-sm">
            {text}
          </pre>
        </div>
      )}
    </section>
  );
}

function DevisPage() {
  const { quote, loaded, setOffer, setQty, setExtraSites, setBilling, reset } = useQuote();
  const [c, setC] = useState<Customer>(emptyCustomer);
  const [status, setStatus] = useState<Status>("idle");
  const [num, setNum] = useState("");
  const [pdfOk, setPdfOk] = useState(false);
  const [sent, setSent] = useState<Sent>(null);
  const [snapshot, setSnapshot] = useState<QuoteState | null>(null);
  const r = computeQuote(quote);
  const priced = options.filter((o) => o.amount !== null);
  const set = (k: keyof Customer) => (e: { target: { value: string } }) =>
    setC((x) => ({ ...x, [k]: e.target.value }));
  const hasContent =
    quote.offer || r.optionCount > 0 || quote.extraSites > 0 || quote.billing === "annual";

  const [sending, setSending] = useState(false);
  async function trySend(q: QuoteState, n: string, pdf = pdfOk) {
    if (sending) return;
    setSending(true);
    try {
      setSent(await sendQuote(q, c, n, pdf));
    } catch {
      setSent("failed");
    }
    setSending(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!quote.offer || status === "busy") return;
    const n = num || quoteNumber();
    const snap = quote;
    setNum(n);
    setSnapshot(snap);
    setStatus("busy");
    let ok = true;
    try {
      await downloadQuotePdf(snap, c, n);
    } catch {
      ok = false;
    }
    setPdfOk(ok);
    await trySend(snap, n, ok);
    setStatus("done");
    window.scrollTo({ top: 0 });
  }

  if (status === "done" && snapshot) {
    return (
      <div>
        <SiteHeader />
        <Done
          num={num}
          sent={sent}
          pdfOk={pdfOk}
          snapshot={snapshot}
          customer={c}
          onRetrySend={() => trySend(snapshot, num)}
          sending={sending}
        />
        <section className="mx-auto max-w-3xl px-5 pb-20">
          <button
            type="button"
            onClick={() => {
              reset();
              setStatus("idle");
              setSnapshot(null);
              setNum("");
              setSent(null);
              setPdfOk(false);
              window.scrollTo({ top: 0 });
            }}
            className="label underline opacity-60 hover:opacity-100"
          >
            Faire un nouveau devis
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <SiteHeader />
      <Crumbs items={[{ label: "Mon devis" }]} />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12">
        <p className="label mb-6 text-primary">Gratuit · sans obligation · 3 minutes</p>
        <h1 className="title text-5xl md:text-8xl">
          votre <span className="mark">devis.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Choisissez votre formule et vos options, à votre rythme. Vous recevez votre devis en PDF
          tout de suite, et nous en recevons une copie pour vous rappeler. Aucun paiement en ligne.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="min-w-0 space-y-16">
          {/* 1. Formule */}
          <div>
            <StepTitle n="01">votre formule</StepTitle>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {offers.map((o) => (
                <button
                  type="button"
                  key={o.slug}
                  onClick={() => setOffer(o.slug)}
                  aria-pressed={quote.offer === o.slug}
                  className={`relative border-2 p-5 text-left transition-colors ${quote.offer === o.slug ? "border-primary bg-primary text-primary-foreground" : "border-paper/25 hover:border-paper"}`}
                >
                  {o.featured && (
                    <span className="label absolute -top-3 right-3 bg-paper px-2 py-0.5 text-ink">
                      Recommandé
                    </span>
                  )}
                  <span className="title block text-3xl">{o.name}</span>
                  <span className="mt-2 block font-bold">{o.price} HT / mois</span>
                  <span className="mt-1 block text-sm opacity-80">
                    Installation : <SetupPrice setup={o.setup} />
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Vous hésitez ?{" "}
              <Link to="/" hash="offres" className="link-y text-foreground">
                Comparez les formules
              </Link>
              .
            </p>
          </div>

          {/* 2. Options */}
          <div>
            <StepTitle n="02">vos options</StepTitle>
            <p className="mt-3 text-muted-foreground">
              Facultatif. Payées une seule fois, à la signature.
            </p>
            <div className="mt-6 divide-y border">
              {priced.map((o) => (
                <div key={o.slug} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link to="/options" hash={o.slug} className="link-y font-semibold">
                      {o.name}
                    </Link>
                    <p className="label text-muted-foreground">
                      {o.price} HT · {o.unitLabel}
                    </p>
                  </div>
                  <Stepper
                    value={quote.qty[o.slug] ?? 0}
                    onChange={(n) => setQty(o.slug, n)}
                    label={o.name}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link
                    to="/options"
                    hash="etablissement-supplementaire"
                    className="link-y font-semibold"
                  >
                    Établissements supplémentaires
                  </Link>
                  <p className="label text-muted-foreground">
                    -{QUOTE_CONFIG.extraSiteDiscountPercent} % sur leur abonnement · installation à
                    définir ensemble
                  </p>
                </div>
                <Stepper
                  value={quote.extraSites}
                  onChange={setExtraSites}
                  label="Établissements supplémentaires"
                  max={10}
                />
              </div>
            </div>
          </div>

          {/* 3. Paiement */}
          <div>
            <StepTitle n="03">votre abonnement</StepTitle>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["monthly", "Paiement mensuel", "Prélevé chaque mois par prélèvement SEPA."],
                  [
                    "annual",
                    "Paiement annuel",
                    `${12 - QUOTE_CONFIG.annualMonthsPaid} mois offerts sur l'année.`,
                  ],
                ] as const
              ).map(([k, t, s]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setBilling(k)}
                  aria-pressed={quote.billing === k}
                  className={`border-2 p-5 text-left transition-colors ${quote.billing === k ? "border-primary bg-primary text-primary-foreground" : "border-paper/25 hover:border-paper"}`}
                >
                  <span className="block text-lg font-bold">{t}</span>
                  <span className="mt-1 block text-sm opacity-80">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Coordonnées */}
          <div>
            <StepTitle n="04">vos coordonnées</StepTitle>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Votre nom"
                required
                autoComplete="name"
                value={c.name}
                onChange={set("name")}
              />
              <Field
                label="Nom du restaurant"
                required
                autoComplete="organization"
                value={c.restaurant}
                onChange={set("restaurant")}
              />
              <Field
                label="Adresse du restaurant"
                required
                autoComplete="street-address"
                value={c.address}
                onChange={set("address")}
              />
              <Field
                label="Ville"
                required
                autoComplete="address-level2"
                value={c.city}
                onChange={set("city")}
              />
              <Field
                label="Téléphone"
                required
                type="tel"
                autoComplete="tel"
                value={c.phone}
                onChange={set("phone")}
              />
              <Field
                label="Email"
                required
                type="email"
                autoComplete="email"
                value={c.email}
                onChange={set("email")}
              />
            </div>
            <label className="mt-4 block">
              <span className="label mb-2 block text-muted-foreground">
                Une question, une précision ? (facultatif)
              </span>
              <textarea
                value={c.message}
                onChange={set("message")}
                rows={3}
                maxLength={500}
                className="w-full border-2 border-paper/20 bg-transparent px-4 py-3 focus:border-primary"
              />
            </label>
            <p className="mt-4 text-sm text-muted-foreground">
              Vos informations servent uniquement à établir votre devis et à vous recontacter.
            </p>
          </div>
        </div>

        {/* Récapitulatif */}
        <aside className="min-w-0">
          <div className="panel-paper p-7 lg:sticky lg:top-28">
            <div className="flex items-center justify-between">
              <p className="label">Récapitulatif</p>
              {loaded && hasContent && (
                <button
                  type="button"
                  onClick={reset}
                  className="label underline opacity-60 hover:opacity-100"
                >
                  Vider
                </button>
              )}
            </div>
            {!loaded ? (
              <p className="mt-6 opacity-60">Chargement…</p>
            ) : !quote.offer ? (
              <p className="mt-6 font-semibold">
                Choisissez une formule (étape 01) pour voir votre devis.
              </p>
            ) : (
              <>
                <p className="label mt-6 mb-2 opacity-60">À régler à la signature</p>
                <Lines lines={r.setupLines} />
                <div className="mt-3 flex justify-between border-t border-black/15 pt-3">
                  <span className="font-bold">Total</span>
                  <span className="title text-3xl">{money(r.setupTotal)}</span>
                </div>
                <p className="label mt-6 mb-2 opacity-60">Abonnement</p>
                <Lines lines={r.monthlyLines} />
                {quote.extraSites > 0 && (
                  <p className="mt-2 text-xs opacity-70">
                    Installation des établissements supplémentaires : à définir ensemble.
                  </p>
                )}
                <div className="mt-3 flex justify-between border-t border-black/15 pt-3">
                  <span className="font-bold">
                    {quote.billing === "annual" ? "Par an" : "Par mois"}
                  </span>
                  <span className="title text-3xl">
                    {money(quote.billing === "annual" ? r.annualTotal : r.monthlyTotal)}
                  </span>
                </div>
                {quote.billing === "annual" && (
                  <p className="mt-1 text-right text-sm opacity-70">
                    au lieu de {money(r.monthlyTotal * 12)}
                  </p>
                )}
                <p className="label mt-4 opacity-60">Montants HT</p>
                {LAUNCH_OFFER.enabled && (
                  <p className="mt-4 bg-primary p-3 text-sm font-semibold">
                    Offre de lancement : -{LAUNCH_OFFER.discountPercent} % sur l'installation de la
                    formule, réservée aux {LAUNCH_OFFER.spots} premiers restaurants (sous réserve de
                    places disponibles), en échange d'{LAUNCH_OFFER.counterpart}.
                  </p>
                )}
              </>
            )}
            <button
              type="submit"
              disabled={!quote.offer || status === "busy"}
              aria-describedby="devis-hint"
              className="mt-6 w-full bg-ink px-6 py-4 text-lg font-bold text-paper transition-opacity disabled:opacity-40"
            >
              {status === "busy" ? "Préparation…" : "Recevoir mon devis (PDF) →"}
            </button>
            <p id="devis-hint" className="mt-3 text-center text-xs opacity-60">
              {quote.offer
                ? "Gratuit et sans obligation · aucun paiement en ligne"
                : "Choisissez d'abord une formule (étape 01)."}
            </p>
          </div>
        </aside>
      </form>
      <Footer />
    </div>
  );
}
