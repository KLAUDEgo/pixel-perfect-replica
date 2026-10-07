import { DEFAULT_COUNTRY, formatPhone, getCountry, phoneError } from "@/lib/phone";
import { CountrySelect } from "@/components/country-select";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import {
  COMPANY,
  CONTACT_EMAIL,
  LAUNCH_OFFER,
  QUOTE_CONFIG,
  optionMaxQty,
  options,
} from "@/data/content";
import { WhatsAppIcon } from "@/components/whatsapp";
import { offers } from "@/data/services";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";
import { Crumbs, Footer, SetupPrice, SiteHeader } from "@/components/site";
import { Stepper, useQuote } from "@/components/quote";
import {
  annualFreeText,
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

type FieldKey = "name" | "restaurant" | "address" | "city" | "phone" | "email";
type Errors = Partial<Record<FieldKey, string>>;

/** Ordre d'affichage des champs (pour placer le focus sur le premier en erreur). */
const FIELD_ORDER: FieldKey[] = ["name", "restaurant", "address", "city", "phone", "email"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validation en français, qui remplace les bulles natives du navigateur. */
function validate(c: Customer, country: string): Errors {
  const e: Errors = {};
  if (!c.name.trim()) e.name = "Indiquez votre nom.";
  if (!c.restaurant.trim()) e.restaurant = "Indiquez le nom de votre commerce.";
  if (!c.city.trim()) e.city = "Indiquez votre ville.";
  const phoneErr = phoneError(country, c.phone, true);
  if (phoneErr) e.phone = phoneErr;
  if (!c.email.trim()) e.email = "Indiquez votre adresse e-mail.";
  else if (!EMAIL_RE.test(c.email.trim()))
    e.email = "Cette adresse e-mail semble incorrecte. Exemple\u00a0:\u00a0nom@exemple.fr.";
  return e;
}

function PhoneField({
  value,
  country,
  error,
  onChange,
  onCountryChange,
  onBlur,
}: {
  value: string;
  country: string;
  error?: string | undefined;
  onChange: (v: string) => void;
  onCountryChange: (code: string) => void;
  onBlur: () => void;
}) {
  const inputId = "devis-phone";
  const errId = `${inputId}-err`;
  const ctry = getCountry(country);
  return (
    <div>
      <label htmlFor={inputId} className="label mb-2 block text-muted-foreground">
        Téléphone *
      </label>
      <div className="flex gap-2">
        <CountrySelect value={country} invalid={!!error} onChange={onCountryChange} />
        <input
          id={inputId}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          placeholder={ctry.example}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`min-w-0 flex-1 scroll-mt-32 border-2 bg-transparent px-4 py-3 focus:border-primary ${error ? "border-red-500" : "border-paper/20"}`}
        />
      </div>
      {error && (
        <p id={errId} className="mt-2 text-sm font-semibold text-red-400">
          <span aria-hidden>! </span>
          {error}
        </p>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  required,
  error,
  ...props
}: {
  id: FieldKey;
  label: string;
  required?: boolean;
  error?: string | undefined;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">) {
  const inputId = `devis-${id}`;
  const errId = `${inputId}-err`;
  return (
    <div>
      <label htmlFor={inputId} className="label mb-2 block text-muted-foreground">
        {label}
        {required ? " *" : " (facultatif)"}
      </label>
      <input
        id={inputId}
        name={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        {...props}
        className={`w-full scroll-mt-32 border-2 bg-transparent px-4 py-3 focus:border-primary ${error ? "border-red-500" : "border-paper/20"}`}
      />
      {error && (
        <p id={errId} className="mt-2 text-sm font-semibold text-red-400">
          <span aria-hidden>! </span>
          {error}
        </p>
      )}
    </div>
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
  const offerName = computeQuote(snapshot).offer?.name;
  const waNotify = whatsappLink(
    [
      `Bonjour ${COMPANY.firstName},`,
      "",
      `Je viens de faire le devis ${num} sur votre site.`,
      `Commerce\u00a0: ${customer.restaurant} (${customer.city})`,
      offerName ? `Formule\u00a0: ${offerName}` : "",
      `Nom\u00a0: ${customer.name}`,
      "",
      "Pouvez-vous me recontacter\u00a0?",
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n"),
  );
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
            <span aria-hidden>✓ </span>Une copie nous a été envoyée : nous vous recontactons très
            vite sur WhatsApp pour en parler.
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
      {waNotify && (
        <a
          href={waNotify}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 flex items-center justify-center gap-3 bg-[#25D366] px-6 py-4 text-lg font-bold text-black sm:inline-flex"
        >
          <WhatsAppIcon className="size-6 shrink-0" />
          Prévenir {COMPANY.firstName} sur WhatsApp
        </a>
      )}
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
              className="label inline-flex min-h-11 items-center border-2 border-paper/30 px-3 py-2 hover:border-paper"
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
  const [form, setForm] = useState<Customer>(emptyCustomer);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  // Coordonnées envoyées (devis, PDF, e-mail) : téléphone au format international.
  const c: Customer = { ...form, phone: formatPhone(country, form.phone) };
  const [status, setStatus] = useState<Status>("idle");
  const [num, setNum] = useState("");
  const [pdfOk, setPdfOk] = useState(false);
  const [sent, setSent] = useState<Sent>(null);
  const [snapshot, setSnapshot] = useState<QuoteState | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const r = computeQuote(quote);
  const priced = options.filter((o) => o.amount !== null);
  const set = (k: keyof Customer) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setForm((x) => ({ ...x, [k]: value }));
    // Une erreur affichée disparaît dès que le champ devient valide.
    if (errors[k as FieldKey])
      setErrors((prev) => ({
        ...prev,
        [k]: validate({ ...form, [k]: value }, country)[k as FieldKey],
      }));
  };
  const setPhoneErr = (msg: string | null) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next.phone = msg;
      else delete next.phone;
      return next;
    });
  const fieldProps = (k: FieldKey) => ({
    id: k,
    value: form[k],
    onChange: set(k),
    error: errors[k],
  });
  const errorCount = Object.values(errors).filter(Boolean).length;
  const hasContent =
    quote.offer || r.optionCount > 0 || quote.extraSites > 0 || quote.billing === "annual";

  // Barre récap collante (mobile/tablette) : visible si une formule est choisie
  // et que le récapitulatif n'est pas déjà à l'écran.
  const recapRef = useRef<HTMLDivElement>(null);
  const [recapInView, setRecapInView] = useState(true);
  useEffect(() => {
    const el = recapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setRecapInView(!!e?.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [status, loaded]);
  const showBar = loaded && !!quote.offer && status !== "done";
  const barVisible = showBar && !recapInView;
  const hasFloat = !!whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  const goToRecap = () => {
    const el = recapRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  };

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
    const errs = validate(form, country);
    setErrors(errs);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) {
      const el = formRef.current?.querySelector<HTMLInputElement>(`#devis-${first}`);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return;
    }
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
            className="label inline-flex min-h-11 items-center underline opacity-60 hover:opacity-100"
          >
            Faire un nouveau devis
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className={showBar ? "pb-24 lg:pb-0" : undefined}>
      <SiteHeader />
      <Crumbs items={[{ label: "Mon devis" }]} />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12">
        <p className="label mb-6 text-primary">Gratuit · sans obligation · 3 minutes</p>
        <h1 className="title text-5xl md:text-8xl">
          votre <span className="mark">devis.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Choisissez votre formule et vos options, à votre rythme. Vous recevez votre devis en PDF
          tout de suite, et nous en recevons une copie pour vous recontacter. Aucun paiement en
          ligne.
        </p>
      </section>

      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
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
                  <span className="mt-2 block font-bold">{o.price} / mois</span>
                  <span className="mt-1 block text-sm opacity-80">
                    Installation : <SetupPrice setup={o.setup} />
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Vous hésitez ?{" "}
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
              Facultatif. Les options ponctuelles sont payées une seule fois, à la signature. Le
              Pack réseaux sociaux est mensuel : il s'ajoute à votre abonnement.
            </p>
            <div className="mt-6 divide-y border">
              {priced.map((o) => (
                <div key={o.slug} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link to="/options" hash={o.slug} className="link-y font-semibold">
                      {o.name}
                    </Link>
                    <p className="label text-muted-foreground">
                      {o.price} · {o.unitLabel}
                    </p>
                  </div>
                  <Stepper
                    value={quote.qty[o.slug] ?? 0}
                    onChange={(n) => setQty(o.slug, n)}
                    label={o.name}
                    max={optionMaxQty(o)}
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
                    −{QUOTE_CONFIG.extraSiteDiscountPercent} % sur leur abonnement · installation :
                    devis séparé
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
                    r.recurringOptions.length
                      ? `${annualFreeText(r.recurringOptions)}.`
                      : `${12 - QUOTE_CONFIG.annualMonthsPaid} mois offerts sur l'année.`,
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
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
              <Field label="Votre nom" required autoComplete="name" {...fieldProps("name")} />
              <Field
                label="Nom du commerce"
                required
                autoComplete="organization"
                {...fieldProps("restaurant")}
              />
              <Field
                label="Adresse du commerce"
                autoComplete="street-address"
                {...fieldProps("address")}
              />
              <Field label="Ville" required autoComplete="address-level2" {...fieldProps("city")} />
              <PhoneField
                value={form.phone}
                country={country}
                error={errors.phone}
                onChange={(v) => set("phone")({ target: { value: v } })}
                onCountryChange={(code) => {
                  setCountry(code);
                  if (errors.phone || form.phone.trim())
                    setPhoneErr(phoneError(code, form.phone, true));
                }}
                onBlur={() =>
                  form.phone.trim() && setPhoneErr(phoneError(country, form.phone, true))
                }
              />
              <Field
                label="E-mail"
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                {...fieldProps("email")}
              />
            </div>
            <label className="mt-4 block">
              <span className="label mb-2 block text-muted-foreground">
                Une question, une précision ? (facultatif)
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
          <div
            ref={recapRef}
            id="recap"
            tabIndex={-1}
            className="panel-paper scroll-mt-28 p-7 outline-none lg:sticky lg:top-28"
          >
            <div className="flex items-center justify-between">
              <p className="label">Récapitulatif</p>
              {loaded && hasContent && (
                <button
                  type="button"
                  onClick={reset}
                  className="label -my-3 inline-flex min-h-11 items-center px-1 underline opacity-60 hover:opacity-100"
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
                    Installation des établissements supplémentaires : devis séparé.
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
                    au lieu de {money(r.annualFullPrice)}
                    {r.recurringOptions.length > 0 && (
                      <span className="block">{annualFreeText(r.recurringOptions)}</span>
                    )}
                  </p>
                )}
                <p className="label mt-4 opacity-60">TVA non applicable : prix final</p>
                {LAUNCH_OFFER.enabled && (
                  <p className="mt-4 bg-primary p-3 text-sm font-semibold">
                    Offre de lancement : −{LAUNCH_OFFER.discountPercent} % sur l'installation de la
                    formule, réservée aux {LAUNCH_OFFER.spots} premiers commerces (remise garantie
                    pour ce devis s'il est signé pendant sa durée de validité), en échange d'
                    {LAUNCH_OFFER.counterpart}.
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
            {errorCount > 0 && (
              <p role="alert" className="mt-3 text-center text-sm font-bold text-red-700">
                {errorCount === 1
                  ? "Un champ est à compléter ou à corriger (étape 04)."
                  : `${errorCount} champs sont à compléter ou à corriger (étape 04).`}
              </p>
            )}
            <p id="devis-hint" className="mt-3 text-center text-xs opacity-60">
              {quote.offer
                ? "Gratuit et sans obligation · aucun paiement en ligne"
                : "Choisissez d'abord une formule (étape 01)."}
            </p>
            <p className="mt-2 text-center text-xs opacity-60">
              Voir nos{" "}
              <Link to="/cgv" className="underline">
                CGV
              </Link>{" "}
              et notre{" "}
              <Link to="/confidentialite" className="underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </aside>
      </form>
      <Footer />
      {barVisible && (
        <div
          role="region"
          aria-label="Résumé de votre devis"
          data-testid="devis-bar"
          className="panel-paper fixed inset-x-0 bottom-0 z-20 border-t-4 border-primary shadow-[0_-8px_24px_rgba(0,0,0,0.35)] lg:hidden"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            paddingRight: hasFloat ? "calc(72px + env(safe-area-inset-right, 0px))" : undefined,
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0 leading-tight">
              <p className="text-sm">
                <span className="opacity-70">À la signature</span>{" "}
                <b className="whitespace-nowrap">{money(r.setupTotal)}</b>
              </p>
              <p className="text-sm">
                <b className="whitespace-nowrap">
                  {money(quote.billing === "annual" ? r.annualTotal : r.monthlyTotal)}
                </b>{" "}
                <span className="opacity-70">
                  {quote.billing === "annual" ? "par an" : "par mois"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={goToRecap}
              aria-controls="recap"
              className="inline-flex min-h-11 shrink-0 items-center bg-ink px-4 text-sm font-bold text-paper"
            >
              Voir le récap ↓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
