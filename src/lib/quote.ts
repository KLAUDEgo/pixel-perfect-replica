import {
  COMPANY,
  LAUNCH_OFFER,
  POLICY,
  QUOTE_CONFIG,
  CONTACT_EMAIL,
  HAS_PHONE,
  euros,
  optionMaxQty,
  options,
} from "@/data/content";
import { offers, type OfferSlug } from "@/data/services";

/** Version des CGV citée dans l'encadré de signature du devis (et date des pages légales). */
export const CGV_VERSION = "7 octobre 2026";

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

export type Line = {
  label: string;
  qty: number;
  unit: number;
  total: number;
  note?: string;
  /** Ligne d'option (ponctuelle ou mensuelle). */
  option?: boolean;
  /** Option mensuelle : facturée 12 mois sur 12 en paiement annuel (pas de mois offerts). */
  recurring?: boolean;
};

/** Montant en euros, format français avec espaces insécables U+00A0 (compatibles PDF, contrairement à U+202F). */
export const money = (n: number, alwaysCents = false) => {
  const fixed = Math.round(n * 100) / 100;
  const [int = "0", dec = "00"] = fixed.toFixed(2).split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  const sign = fixed < 0 ? "−" : "";
  return (
    sign + (dec === "00" && !alwaysCents ? intFmt : `${intFmt},${dec}`).replace("-", "") + "\u00a0€"
  );
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
      note: `Comprend : ${offer.installation.join(" ; ")}`,
    });
    if (LAUNCH_OFFER.enabled) {
      const d = -setup * (LAUNCH_OFFER.discountPercent / 100);
      setupLines.push({
        label: `Offre de lancement −${LAUNCH_OFFER.discountPercent} % (en échange d'${LAUNCH_OFFER.counterpart} ; remise garantie pour ce devis s'il est signé pendant sa durée de validité)`,
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
        label: `Établissement supplémentaire (−${QUOTE_CONFIG.extraSiteDiscountPercent} %)`,
        qty: q.extraSites,
        unit: u,
        total: u * q.extraSites,
        note: "Installation : fera l'objet d'un devis séparé",
      });
    }
  }
  const recurringOptions: string[] = [];
  for (const o of options) {
    const n = Math.min(q.qty[o.slug] ?? 0, optionMaxQty(o));
    if (n <= 0 || o.amount === null) continue;
    if (o.recurring) {
      // Option mensuelle : ajoutée à l'abonnement (donc aussi au paiement annuel), pas aux frais de signature.
      recurringOptions.push(o.name);
      monthlyLines.push({
        label: `${o.name} (option mensuelle, ${o.unitLabel})`,
        qty: n,
        unit: o.amount,
        total: n * o.amount,
        option: true,
        recurring: true,
      });
    } else
      setupLines.push({
        label: o.name.startsWith("Lot") ? o.name : `${o.name} (${o.unitLabel})`,
        qty: n,
        unit: o.amount,
        total: n * o.amount,
        option: true,
      });
  }
  const setupTotal = setupLines.reduce((s, l) => s + l.total, 0);
  const monthlyTotal = monthlyLines.reduce((s, l) => s + l.total, 0);
  // Paiement annuel : mois offerts sur la formule (et les établissements en plus),
  // mais pas sur les options mensuelles (Pack réseaux sociaux), facturées 12 mois sur 12.
  const recurringMonthly = monthlyLines.filter((l) => l.recurring).reduce((s, l) => s + l.total, 0);
  const annualTotal =
    (monthlyTotal - recurringMonthly) * QUOTE_CONFIG.annualMonthsPaid + recurringMonthly * 12;
  /** Prix annuel sans aucun mois offert (pour « au lieu de »). */
  const annualFullPrice = monthlyTotal * 12;
  /** Paiement annuel : installation + options + 1re année, dus à la signature. */
  const annualDueAtSigning = setupTotal + annualTotal;
  const optionCount = [...setupLines, ...monthlyLines]
    .filter((l) => l.option)
    .reduce((s, l) => s + l.qty, 0);
  return {
    offer,
    setupLines,
    monthlyLines,
    setupTotal,
    monthlyTotal,
    annualTotal,
    annualFullPrice,
    annualDueAtSigning,
    optionCount,
    /** Noms des options mensuelles retenues (ex. « Pack réseaux sociaux »). */
    recurringOptions,
  };
}

export const quoteNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `MGL-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

const frDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

/** « 2 mois offerts », précisé quand une option mensuelle (sans mois offerts) est présente. */
export const annualFreeText = (recurringOptions: string[]) =>
  `${12 - QUOTE_CONFIG.annualMonthsPaid} mois offerts` +
  (recurringOptions.length ? ` sur l'abonnement, hors ${recurringOptions.join(", ")}` : "");

/** Texte du devis (e-mail au gérant / repli messagerie). */
export function quoteText(q: QuoteState, c: Customer, num: string) {
  const r = computeQuote(q);
  const annual = q.billing === "annual";
  const L = (l: Line) => `- ${l.label} : ${l.qty} x ${money(l.unit)} = ${money(l.total)}`;
  return [
    `DEVIS ${num} — ${frDate(new Date())}`,
    "",
    `Client : ${c.name} — ${c.restaurant}`,
    c.address ? `Adresse : ${[c.address, c.city].filter(Boolean).join(", ")}` : `Ville : ${c.city}`,
    `Téléphone : ${c.phone}`,
    `E-mail : ${c.email}`,
    "",
    annual
      ? "INSTALLATION ET OPTIONS PONCTUELLES (une fois)"
      : "À RÉGLER À LA SIGNATURE (une fois : installation et options ponctuelles)",
    ...r.setupLines.map(L),
    `Total : ${money(r.setupTotal)}`,
    "",
    r.recurringOptions.length
      ? `ABONNEMENT (formule + ${r.recurringOptions.join(" + ")})`
      : "ABONNEMENT",
    ...r.monthlyLines.map(L),
    `Total mensuel : ${money(r.monthlyTotal)} / mois`,
    annual
      ? `Paiement annuel choisi : ${money(r.annualTotal)} / an (${annualFreeText(r.recurringOptions)})`
      : "Paiement mensuel par prélèvement SEPA",
    annual
      ? `TOTAL DÛ À LA SIGNATURE (installation + options ponctuelles + 1re année d'abonnement) : ${money(r.annualDueAtSigning)}`
      : "",
    "",
    "Prix nets — " + QUOTE_CONFIG.vatMention,
    "",
    c.message ? `Message : ${c.message}` : "",
  ].join("\n");
}

/** Charge le logo, le réduit (canvas) et l'aplatit sur fond blanc : PDF léger (~quelques Ko). */
async function loadLogo(
  src: string,
  targetWidth = 320,
): Promise<{ data: string; ratio: number } | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    const w = Math.min(targetWidth, img.naturalWidth);
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    return { data: canvas.toDataURL("image/png"), ratio: img.naturalHeight / img.naturalWidth };
  } catch {
    return null;
  }
}

/** Les polices standard du PDF (WinAnsi) n'ont pas le signe moins U+2212 : on le remplace. */
const pdfText = (t: string) => t.replace(/\u2212/g, "–");
/** Montant pour une cellule alignée à droite : autoTable mesure mal U+00A0, on dessine une espace simple. */
const pdfMoney = (n: number) => pdfText(money(n, true)).replace(/\u00a0/g, " ");

/** Génère le PDF du devis et le télécharge. */
export async function downloadQuotePdf(q: QuoteState, c: Customer, num: string) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const r = computeQuote(q);
  const annual = q.billing === "annual";
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = 210;
  const H = 297;
  const M = 16;
  const BOTTOM = H - 12;
  const logo = await loadLogo("/logo-megalopole-noir.png");
  if (logo) doc.addImage(logo.data, "PNG", M, 12, 40, 40 * logo.ratio, "logo", "FAST");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DEVIS", W - M, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const today = new Date();
  const until = new Date(today.getTime() + QUOTE_CONFIG.validityDays * 864e5);
  doc.text(
    [`N° ${num}`, `Date : ${frDate(today)}`, `Valable jusqu'au ${frDate(until)}`],
    W - M,
    27,
    { align: "right" },
  );

  let y = 46;
  doc.setFont("helvetica", "bold");
  doc.text("Émetteur", M, y);
  doc.text("Client", W / 2 + 4, y);
  doc.setFont("helvetica", "normal");
  // Deux colonnes : chaque ligne est coupée à la largeur de sa colonne (pas de chevauchement).
  const colW = W / 2 - M - 6;
  const wrap = (lines: string[]): string[] =>
    lines.filter(Boolean).flatMap((l) => doc.splitTextToSize(l, colW) as string[]);
  const issuer = wrap([
    `${COMPANY.brand} — ${COMPANY.legalName} EI`,
    COMPANY.address,
    `${COMPANY.rcs} — SIRET ${COMPANY.siret}`,
    HAS_PHONE ? `${COMPANY.phone} — ${CONTACT_EMAIL}` : CONTACT_EMAIL,
  ]);
  const client = wrap([
    c.restaurant,
    c.name,
    [c.address, c.city].filter(Boolean).join(", "),
    c.phone,
    c.email,
  ]);
  doc.text(issuer, M, y + 5);
  doc.text(client, W / 2 + 4, y + 5);
  y += 5 + Math.max(issuer.length, client.length) * 4.3 + 8;

  const head = [
    [
      "Désignation",
      { content: "Qté", styles: { halign: "center" as const } },
      { content: "Prix unit.", styles: { halign: "right" as const } },
      { content: "Montant", styles: { halign: "right" as const } },
    ],
  ];
  const rows = (lines: Line[]) =>
    lines.map((l) => [
      pdfText(l.label + (l.note ? `\n${l.note}` : "")),
      String(l.qty),
      pdfMoney(l.unit),
      pdfMoney(l.total),
    ]);
  const yellow = [255, 214, 10] as [number, number, number];
  const common = {
    margin: { left: M, right: M, bottom: H - BOTTOM },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.5, textColor: 20 },
    headStyles: { fillColor: [10, 10, 10] as [number, number, number], textColor: 255 },
    columnStyles: {
      1: { halign: "center" as const, cellWidth: 14 },
      2: { halign: "right" as const, cellWidth: 30 },
      3: { halign: "right" as const, cellWidth: 30 },
    },
    footStyles: { fillColor: yellow, textColor: 0, fontStyle: "bold" as const },
    showFoot: "lastPage" as const,
  };
  const footRow = (label: string, amount: number, light = false) => [
    { content: label, colSpan: 3, styles: light ? { fillColor: 245 as const } : {} },
    {
      content: pdfMoney(amount),
      styles: { halign: "right" as const, ...(light ? { fillColor: 245 as const } : {}) },
    },
  ];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    annual
      ? "1. Installation et options ponctuelles (paiement unique)"
      : "1. À régler à la signature (paiement unique)",
    M,
    y,
  );
  autoTable(doc, {
    ...common,
    startY: y + 3,
    head,
    body: rows(r.setupLines),
    foot: [
      footRow(
        annual ? "Total installation et options ponctuelles" : "Total à la signature",
        r.setupTotal,
      ),
    ],
  });
  // @ts-expect-error lastAutoTable est ajouté par le plugin
  y = doc.lastAutoTable.finalY + 10;
  if (y > BOTTOM - 30) y = newPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    r.recurringOptions.length
      ? `2. Abonnement (formule + ${r.recurringOptions.join(" + ")})`
      : "2. Abonnement",
    M,
    y,
  );
  const subFoot = annual
    ? [
        footRow("Total mensuel (pour information)", r.monthlyTotal, true),
        footRow(
          r.recurringOptions.length
            ? `Paiement annuel (formule : ${QUOTE_CONFIG.annualMonthsPaid} mois payés sur 12 ; ${r.recurringOptions.join(", ")} : 12 mois)`
            : `Paiement annuel (${QUOTE_CONFIG.annualMonthsPaid} mois payés sur 12)`,
          r.annualTotal,
        ),
      ]
    : [footRow("Total mensuel", r.monthlyTotal)];
  autoTable(doc, { ...common, startY: y + 3, head, body: rows(r.monthlyLines), foot: subFoot });
  // @ts-expect-error lastAutoTable est ajouté par le plugin
  y = doc.lastAutoTable.finalY + (annual ? 4 : 10);

  if (annual) {
    // Récapitulatif : ce qui est réellement dû le jour de la signature.
    autoTable(doc, {
      ...common,
      startY: y,
      body: [
        [
          {
            content: "Total dû à la signature (installation + options ponctuelles + 1re année)",
            styles: { fontStyle: "bold" as const, fillColor: yellow },
          },
          {
            content: pdfMoney(r.annualDueAtSigning),
            styles: { halign: "right" as const, fontStyle: "bold" as const, fillColor: yellow },
          },
        ],
      ],
      bodyStyles: { fillColor: yellow, textColor: 0, fontSize: 10 },
      columnStyles: { 1: { halign: "right" as const, cellWidth: 40 } },
    });
    // @ts-expect-error lastAutoTable est ajouté par le plugin
    y = doc.lastAutoTable.finalY + 10;
  }

  function newPage() {
    doc.addPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    doc.text(`Devis N° ${num} — ${c.restaurant} (suite)`, M, 12);
    doc.setTextColor(20);
    return 22;
  }
  const cond = [
    `Prix nets. ${QUOTE_CONFIG.vatMention}.`,
    "Installation et options ponctuelles réglées à la signature. Abonnement" +
      (r.recurringOptions.length ? ` (formule + ${r.recurringOptions.join(" + ")})` : "") +
      " par prélèvement SEPA" +
      (annual
        ? ", paiement annuel réglé en une fois à la signature puis à chaque date anniversaire."
        : ", chaque mois."),
    annual ? "En paiement annuel, l'année réglée n'est pas remboursée." : "",
    `Installation ${POLICY.installDelay}.`,
    QUOTE_CONFIG.commitment + ".",
    r.recurringOptions.length
      ? `${r.recurringOptions.join(", ")} : option mensuelle sans engagement, résiliable à tout moment avec un préavis d'un mois, indépendamment de la formule.`
      : "",
    "Pénalités de retard et indemnité forfaitaire de 40 € pour frais de recouvrement : voir CGV.",
    "Conditions générales de vente : " + QUOTE_CONFIG.cgv + ".",
    `Devis gratuit, valable ${QUOTE_CONFIG.validityDays} jours. Il ne vous engage pas tant qu'il n'est pas signé.`,
    "Et ensuite ? Nous vous recontactons sur WhatsApp pour en parler. Aucun paiement avant la signature.",
  ].filter(Boolean);
  doc.setFontSize(9);
  const wrapped: string[] = doc.splitTextToSize(cond.map((t) => "• " + t).join("\n"), W - 2 * M);
  const LH = 4;
  const condH = 5 + wrapped.length * LH;

  // Encadré de signature
  const boxW = 96;
  const boxPad = 3;
  doc.setFontSize(8);
  const accept: string[] = doc.splitTextToSize(
    `Je reconnais avoir pris connaissance des CGV (${COMPANY.brand}, version du ${CGV_VERSION}, consultables sur le site) et les accepter.`,
    boxW - 2 * boxPad,
  );
  const boxH = 8 + accept.length * 3.6 + 20;

  // Conditions et signature restent ensemble : si les deux ne tiennent pas, on passe page suivante.
  const blockH = condH + 6 + boxH;
  if (y + blockH > BOTTOM && 22 + blockH <= BOTTOM) y = newPage();
  else if (y + condH > BOTTOM) y = newPage();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Conditions", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(wrapped, M, y + 5);
  y += condH + 6;

  if (y + boxH > BOTTOM) y = newPage();
  const bx = W - M - boxW;
  doc.setDrawColor(150);
  doc.rect(bx, y, boxW, boxH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Bon pour accord — date, signature et cachet", bx + boxPad, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(accept, bx + boxPad, y + 10.5);
  y += boxH + 8;

  // Message du client : après la signature, il peut passer en page suivante sans gêner.
  if (c.message) {
    doc.setFontSize(9);
    const msg: string[] = doc.splitTextToSize(c.message, W - 2 * M);
    if (y + 10 > BOTTOM) y = newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Message du client", M, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y += 5;
    for (const line of msg) {
      if (y > BOTTOM) y = newPage();
      doc.text(line, M, y);
      y += LH;
    }
  }

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
    `Formule : ${r.offer?.name ?? "-"}`,
    `À la signature : ${money(q.billing === "annual" ? r.annualDueAtSigning : r.setupTotal)}${q.billing === "annual" ? " (installation + options ponctuelles + 1re année)" : ""}`,
    `Abonnement : ${money(r.monthlyTotal)} / mois${q.billing === "annual" ? ` (paiement annuel : ${money(r.annualTotal)} / an)` : ""}`,
    `Options : ${
      [...r.setupLines, ...r.monthlyLines]
        .filter((l) => l.option)
        .map((l) => `${l.qty} x ${l.label}`)
        .join(" ; ") || "aucune"
    }`,
    `Établissements en plus : ${q.extraSites}`,
    c.message ? `Message : ${c.message.slice(0, 300)}` : "",
    pdfOk ? "(Le PDF complet a été téléchargé par le client.)" : "",
  ]
    .filter(Boolean)
    .join("\n");
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(short)}`;
  return "mailto";
}
