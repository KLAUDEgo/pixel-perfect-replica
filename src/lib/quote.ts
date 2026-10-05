import { LAUNCH_OFFER, QUOTE_CONFIG, CONTACT_EMAIL, euros, options } from "@/data/content";
import { offers, type OfferSlug } from "@/data/services";

export type Billing = "monthly" | "annual";
export type QuoteState = {
  offer: OfferSlug | null;
  qty: Record<string, number>;
  extraSites: number;
  billing: Billing;
};
export const emptyQuote: QuoteState = { offer: null, qty: {}, extraSites: 0, billing: "monthly" };

export type Customer = {
  name: string;
  restaurant: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  message: string;
};

export type Line = { label: string; qty: number; unit: number; total: number; note?: string };

/** Montant en euros, format français, sans espace insécable fin (compatible PDF). */
export const money = (n: number, alwaysCents = false) => {
  const fixed = Math.round(n * 100) / 100;
  const [int = "0", dec = "00"] = fixed.toFixed(2).split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (dec === "00" && !alwaysCents ? intFmt : `${intFmt},${dec}`) + " €";
};

export function computeQuote(q: QuoteState) {
  const offer = q.offer ? (offers.find((o) => o.slug === q.offer) ?? null) : null;
  const setupLines: Line[] = [];
  const monthlyLines: Line[] = [];
  if (offer) {
    const setup = euros(offer.setup);
    setupLines.push({
      label: `Installation — formule ${offer.name}`,
      qty: 1,
      unit: setup,
      total: setup,
      note: `Comprend : ${offer.installation.join(" ; ")}`,
    });
    if (LAUNCH_OFFER.enabled) {
      const d = -setup * (LAUNCH_OFFER.discountPercent / 100);
      setupLines.push({
        label: `Offre de lancement -${LAUNCH_OFFER.discountPercent} % (en échange d'${LAUNCH_OFFER.counterpart} ; réservée aux ${LAUNCH_OFFER.spots} premiers restaurants, sous réserve de places disponibles)`,
        qty: 1,
        unit: d,
        total: d,
      });
    }
    const monthly = euros(offer.price);
    monthlyLines.push({
      label: `Abonnement — formule ${offer.name}`,
      qty: 1,
      unit: monthly,
      total: monthly,
    });
    if (q.extraSites > 0) {
      const u = monthly * (1 - QUOTE_CONFIG.extraSiteDiscountPercent / 100);
      monthlyLines.push({
        label: `Établissement supplémentaire (-${QUOTE_CONFIG.extraSiteDiscountPercent} %)`,
        qty: q.extraSites,
        unit: u,
        total: u * q.extraSites,
        note: "Installation des établissements supplémentaires : à définir ensemble",
      });
    }
  }
  for (const o of options) {
    const n = q.qty[o.slug] ?? 0;
    if (n > 0 && o.amount !== null)
      setupLines.push({
        label: o.name.startsWith("Lot") ? o.name : `${o.name} (${o.unitLabel})`,
        qty: n,
        unit: o.amount,
        total: n * o.amount,
      });
  }
  const setupTotal = setupLines.reduce((s, l) => s + l.total, 0);
  const monthlyTotal = monthlyLines.reduce((s, l) => s + l.total, 0);
  const annualTotal = monthlyTotal * QUOTE_CONFIG.annualMonthsPaid;
  const optionCount = Object.values(q.qty).reduce((s, n) => s + n, 0);
  return { offer, setupLines, monthlyLines, setupTotal, monthlyTotal, annualTotal, optionCount };
}

export const quoteNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `MGL-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

const frDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Texte du devis (email au gérant / repli messagerie). */
export function quoteText(q: QuoteState, c: Customer, num: string) {
  const r = computeQuote(q);
  const L = (l: Line) => `- ${l.label} : ${l.qty} x ${money(l.unit)} = ${money(l.total)} HT`;
  return [
    `DEVIS ${num} — ${frDate(new Date())}`,
    "",
    `Client : ${c.name} — ${c.restaurant}`,
    `Adresse : ${[c.address, c.city].filter(Boolean).join(", ")}`,
    `Téléphone : ${c.phone}`,
    `Email : ${c.email}`,
    "",
    "À RÉGLER À LA SIGNATURE (une fois)",
    ...r.setupLines.map(L),
    `Total : ${money(r.setupTotal)} HT`,
    "",
    "ABONNEMENT",
    ...r.monthlyLines.map(L),
    `Total mensuel : ${money(r.monthlyTotal)} HT / mois`,
    q.billing === "annual"
      ? `Paiement annuel choisi : ${money(r.annualTotal)} HT / an (${12 - QUOTE_CONFIG.annualMonthsPaid} mois offerts)`
      : "Paiement mensuel par prélèvement SEPA",
    "",
    c.message ? `Message : ${c.message}` : "",
  ].join("\n");
}

async function loadImage(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((ok) => {
      const fr = new FileReader();
      fr.onload = () => ok(String(fr.result));
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Génère le PDF du devis et le télécharge. */
export async function downloadQuotePdf(q: QuoteState, c: Customer, num: string) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const r = computeQuote(q);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  const logo = await loadImage("/logo-megalopole-noir.png");
  if (logo) doc.addImage(logo, "PNG", M, 12, 40, 25.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DEVIS", W - M, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const today = new Date();
  const until = new Date(today.getTime() + QUOTE_CONFIG.validityDays * 864e5);
  doc.text(
    [`N° ${num}`, `Date : ${frDate(today)}`, `Valable jusqu'au ${frDate(until)}`],
    W - M,
    27,
    { align: "right" },
  );

  const co = QUOTE_CONFIG.company;
  let y = 46;
  doc.setFont("helvetica", "bold");
  doc.text("Émetteur", M, y);
  doc.text("Client", W / 2 + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    [
      `${co.name} — ${QUOTE_CONFIG.legalForm}`,
      co.address,
      `SIRET : ${co.siret}`,
      `${co.phone} — ${CONTACT_EMAIL}`,
    ],
    M,
    y + 5,
  );
  doc.text(
    [
      `${c.restaurant}`,
      `${c.name}`,
      `${c.address}${c.address && c.city ? ", " : ""}${c.city}`,
      `${c.phone} — ${c.email}`,
    ],
    W / 2 + 4,
    y + 5,
  );
  y += 30;

  const head = [["Désignation", "Qté", "Prix unit. HT", "Total HT"]];
  const rows = (lines: Line[]) =>
    lines.map((l) => [
      l.label + (l.note ? `\n${l.note}` : ""),
      String(l.qty),
      money(l.unit, true),
      money(l.total, true),
    ]);
  const common = {
    margin: { left: M, right: M },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5, textColor: 20 },
    headStyles: { fillColor: [10, 10, 10] as [number, number, number], textColor: 255 },
    columnStyles: {
      1: { halign: "center" as const, cellWidth: 14 },
      2: { halign: "right" as const, cellWidth: 30 },
      3: { halign: "right" as const, cellWidth: 30 },
    },
    footStyles: {
      fillColor: [255, 214, 10] as [number, number, number],
      textColor: 0,
      fontStyle: "bold" as const,
    },
  };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. À régler à la signature (paiement unique)", M, y);
  autoTable(doc, {
    ...common,
    startY: y + 3,
    head,
    body: rows(r.setupLines),
    foot: [
      [
        "Total à la signature",
        "",
        "",
        { content: money(r.setupTotal, true), styles: { halign: "right" as const } },
      ],
    ],
  });
  // @ts-expect-error lastAutoTable est ajouté par le plugin
  y = doc.lastAutoTable.finalY + 10;
  doc.text("2. Abonnement", M, y);
  const subFoot =
    q.billing === "annual"
      ? [
          [
            "Total mensuel",
            "",
            "",
            { content: money(r.monthlyTotal, true), styles: { halign: "right" as const } },
          ],
          [
            `Paiement annuel (${QUOTE_CONFIG.annualMonthsPaid} mois payés sur 12)`,
            "",
            "",
            { content: money(r.annualTotal, true), styles: { halign: "right" as const } },
          ],
        ]
      : [
          [
            "Total mensuel",
            "",
            "",
            { content: money(r.monthlyTotal, true), styles: { halign: "right" as const } },
          ],
        ];
  autoTable(doc, { ...common, startY: y + 3, head, body: rows(r.monthlyLines), foot: subFoot });
  // @ts-expect-error lastAutoTable est ajouté par le plugin
  y = doc.lastAutoTable.finalY + 10;

  const newPage = () => {
    doc.addPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    doc.text(`Devis N° ${num} — ${c.restaurant} (suite)`, M, 12);
    doc.setTextColor(20);
    return 22;
  };
  const cond = [
    "Montants exprimés hors taxes. " + QUOTE_CONFIG.vatMention + ".",
    "Installation et options réglées à la signature. Abonnement par prélèvement SEPA" +
      (q.billing === "annual" ? ", paiement annuel [MODALITÉS À COMPLÉTER]." : ", chaque mois."),
    QUOTE_CONFIG.commitment + ".",
    "Conditions générales de vente : " + QUOTE_CONFIG.cgv + ".",
    `Devis gratuit, valable ${QUOTE_CONFIG.validityDays} jours. Il ne vous engage pas tant qu'il n'est pas signé.`,
    "Et ensuite ? Nous vous appelons pour en parler. Aucun paiement avant la signature.",
  ];
  if (c.message) cond.push(`Message du client : ${c.message}`);
  const wrapped: string[] = doc.splitTextToSize(cond.map((t) => "• " + t).join("\n"), W - 2 * M);
  if (y + 8 + wrapped.length * 4.2 > 285) y = newPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Conditions", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(wrapped, M, y + 5);
  y += 10 + wrapped.length * 4.2;

  if (y > 255) y = newPage();
  doc.setDrawColor(150);
  doc.rect(W - M - 80, y, 80, 28);
  doc.setFontSize(8.5);
  doc.text(["Bon pour accord", "Date, signature et cachet du client"], W - M - 77, y + 5);

  doc.save(`devis-${num}.pdf`);
}

/** Envoie le devis au gérant. Retourne "sent" (envoyé) ou "mailto" (messagerie ouverte). */
export async function sendQuote(
  q: QuoteState,
  c: Customer,
  num: string,
  pdfOk = true,
): Promise<"sent" | "mailto"> {
  const subject = `Nouveau devis ${num} — ${c.restaurant}`;
  if (QUOTE_CONFIG.web3formsKey) {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: QUOTE_CONFIG.web3formsKey,
        subject,
        from_name: "Site mégalopole — devis",
        email: c.email,
        replyto: c.email,
        message: quoteText(q, c, num),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success) return "sent";
    throw new Error("send_failed");
  }
  const r = computeQuote(q);
  const short = [
    `Devis ${num} — ${c.restaurant} (${c.city})`,
    `${c.name} — ${c.phone} — ${c.email}`,
    `Formule : ${r.offer?.name ?? "-"}`,
    `À la signature : ${money(r.setupTotal)} HT`,
    `Abonnement : ${money(r.monthlyTotal)} HT / mois${q.billing === "annual" ? " (paiement annuel)" : ""}`,
    `Options : ${
      r.setupLines
        .filter((l) => !l.label.startsWith("Installation") && !l.label.startsWith("Offre"))
        .map((l) => `${l.qty} x ${l.label}`)
        .join(" ; ") || "aucune"
    }`,
    `Établissements en plus : ${q.extraSites}`,
    c.message ? `Message : ${c.message.slice(0, 300)}` : "",
    pdfOk ? "(Le PDF complet a été téléchargé par le client.)" : "",
  ]
    .filter(Boolean)
    .join("\n");
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(short)}`;
  return "mailto";
}
