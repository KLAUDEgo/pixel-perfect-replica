import { COUNTRIES, getCountry } from "@/lib/phone";

/**
 * Sélecteur d'indicatif compact : affiche « 🇫🇷 +33 » mais la liste
 * déroulante (native, donc accessible) montre le nom complet des pays.
 */
export function CountrySelect({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (code: string) => void;
  invalid?: boolean;
}) {
  const c = getCountry(value);
  return (
    <div
      className={`relative flex w-[6.5rem] shrink-0 items-center justify-between gap-1 border-2 px-3 py-3 focus-within:border-primary ${invalid ? "border-red-500" : "border-paper/20"}`}
    >
      <span aria-hidden className="whitespace-nowrap">
        {c.flag} {c.dial}
      </span>
      <span aria-hidden className="text-xs opacity-60">
        ▾
      </span>
      <select
        aria-label={`Indicatif du pays : ${c.name} ${c.dial}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer bg-ink opacity-0"
      >
        {COUNTRIES.map((k) => (
          <option key={k.code} value={k.code}>
            {k.flag} {k.name} ({k.dial})
          </option>
        ))}
      </select>
    </div>
  );
}
