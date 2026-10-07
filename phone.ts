/**
 * Indicatifs proposés dans les formulaires, avec le nombre de chiffres attendu
 * pour le numéro national (sans le 0 initial).
 */
export type Country = {
  code: string;
  name: string;
  flag: string;
  dial: string;
  /** Nombre de chiffres du numéro sans l'indicatif ni le 0 initial. */
  min: number;
  max: number;
  /** Le 0 initial s'écrit en national mais disparaît après l'indicatif. */
  trunk0: boolean;
  example: string;
};

export const COUNTRIES: Country[] = [
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    dial: "+33",
    min: 9,
    max: 9,
    trunk0: true,
    example: "06 12 34 56 78",
  },
  {
    code: "MC",
    name: "Monaco",
    flag: "🇲🇨",
    dial: "+377",
    min: 8,
    max: 9,
    trunk0: false,
    example: "6 12 34 56 78",
  },
  {
    code: "BE",
    name: "Belgique",
    flag: "🇧🇪",
    dial: "+32",
    min: 8,
    max: 9,
    trunk0: true,
    example: "0470 12 34 56",
  },
  {
    code: "CH",
    name: "Suisse",
    flag: "🇨🇭",
    dial: "+41",
    min: 9,
    max: 9,
    trunk0: true,
    example: "079 123 45 67",
  },
  {
    code: "LU",
    name: "Luxembourg",
    flag: "🇱🇺",
    dial: "+352",
    min: 6,
    max: 11,
    trunk0: false,
    example: "621 123 456",
  },
  {
    code: "IT",
    name: "Italie",
    flag: "🇮🇹",
    dial: "+39",
    min: 6,
    max: 11,
    trunk0: false,
    example: "312 345 6789",
  },
  {
    code: "ES",
    name: "Espagne",
    flag: "🇪🇸",
    dial: "+34",
    min: 9,
    max: 9,
    trunk0: false,
    example: "612 34 56 78",
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "🇵🇹",
    dial: "+351",
    min: 9,
    max: 9,
    trunk0: false,
    example: "912 345 678",
  },
  {
    code: "DE",
    name: "Allemagne",
    flag: "🇩🇪",
    dial: "+49",
    min: 7,
    max: 12,
    trunk0: true,
    example: "01512 3456789",
  },
  {
    code: "GB",
    name: "Royaume-Uni",
    flag: "🇬🇧",
    dial: "+44",
    min: 9,
    max: 10,
    trunk0: true,
    example: "07400 123456",
  },
  {
    code: "MA",
    name: "Maroc",
    flag: "🇲🇦",
    dial: "+212",
    min: 9,
    max: 9,
    trunk0: true,
    example: "06 12 34 56 78",
  },
  {
    code: "DZ",
    name: "Algérie",
    flag: "🇩🇿",
    dial: "+213",
    min: 8,
    max: 9,
    trunk0: true,
    example: "0551 23 45 67",
  },
  {
    code: "TN",
    name: "Tunisie",
    flag: "🇹🇳",
    dial: "+216",
    min: 8,
    max: 8,
    trunk0: false,
    example: "20 123 456",
  },
];

export const DEFAULT_COUNTRY = "FR";

export function getCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0]!;
}

/** Chiffres du numéro national, sans le 0 initial quand le pays en a un. */
export function nationalDigits(country: Country, raw: string): string {
  let d = raw.replace(/\D/g, "");
  // Si la personne a tapé l'indicatif elle-même (33…, 0033…), on le retire.
  const dialDigits = country.dial.slice(1);
  if (raw.trim().startsWith("+") && d.startsWith(dialDigits)) d = d.slice(dialDigits.length);
  else if (d.startsWith("00" + dialDigits)) d = d.slice(2 + dialDigits.length);
  if (country.trunk0 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/**
 * Message d'erreur en français, ou null si le numéro est valide.
 * `required` : un champ vide est une erreur.
 */
export function phoneError(code: string, raw: string, required: boolean): string | null {
  const country = getCountry(code);
  if (!raw.trim()) return required ? "Indiquez votre numéro de téléphone." : null;
  if (/[^\d\s.+()-]/.test(raw)) return "Le numéro ne doit contenir que des chiffres.";
  const d = nationalDigits(country, raw);
  const ex = `Exemple : ${country.example.replace(/ /g, " ")}.`;
  if (d.length < country.min) return `Il manque des chiffres à ce numéro. ${ex}`;
  if (d.length > country.max) return `Ce numéro a trop de chiffres. ${ex}`;
  return null;
}

/** Numéro au format international lisible, ex. « +33 6 12 34 56 78 ». */
export function formatPhone(code: string, raw: string): string {
  if (!raw.trim()) return "";
  const country = getCountry(code);
  const d = nationalDigits(country, raw);
  const groups =
    country.code === "FR" || country.code === "MA"
      ? d.replace(/^(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5")
      : d.replace(/(\d{3})(?=\d)/g, "$1 ");
  return `${country.dial} ${groups}`;
}
