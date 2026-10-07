import { COMPANY } from "@/data/content";

/** Message prérempli du bouton WhatsApp flottant. */
export const WHATSAPP_DEFAULT_MESSAGE = `Bonjour ${COMPANY.firstName}, je viens du site ${COMPANY.brand} et j'aimerais en savoir plus sur la carte de fidélité.`;

/**
 * Lien « click to chat » WhatsApp vers le numéro de COMPANY.whatsapp.
 * Renvoie null tant que le numéro n'est pas renseigné.
 */
export function whatsappLink(message?: string): string | null {
  const number = COMPANY.whatsapp.replace(/\D/g, "");
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Message WhatsApp prérempli à partir du formulaire de contact (champs vides omis). */
export function contactWhatsAppMessage(d: FormData): string {
  const v = (k: string) => String(d.get(k) ?? "").trim();
  const infos = (["Nom", "Commerce", "Ville", "Téléphone"] as const)
    .filter((k) => v(k))
    .map((k) => `${k}\u00a0: ${v(k)}`);
  const lines = [
    `Bonjour ${COMPANY.firstName},`,
    "",
    `Je viens du site ${COMPANY.brand} et j'aimerais en savoir plus sur la carte de fidélité.`,
    "",
    ...infos,
  ];
  if (v("Message")) lines.push("", "Message\u00a0:", v("Message"));
  return lines.join("\n");
}
