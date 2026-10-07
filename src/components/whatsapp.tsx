import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappLink } from "@/lib/whatsapp";

/** Logo WhatsApp (SVG inline, couleur héritée). */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/** Bouton WhatsApp flottant, présent sur toutes les pages (masqué si aucun numéro). */
export function WhatsAppFloat() {
  const href = whatsappLink(WHATSAPP_DEFAULT_MESSAGE);
  if (!href) return null;
  return <FloatingLink href={href} />;
}

/** Vrai si deux rectangles se chevauchent. */
function overlaps(a: DOMRect, b: DOMRect) {
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

function FloatingLink({ href }: { href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // S'efface quand il passerait par-dessus un bouton d'envoi de formulaire (ex. « Recevoir mon devis »).
  const [covering, setCovering] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const hit = Array.from(document.querySelectorAll("form button[type=submit]")).some((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && overlaps(box, r);
      });
      setCovering(hit);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);
  return (
    <a
      ref={ref}
      href={href}
      tabIndex={covering ? -1 : undefined}
      aria-hidden={covering || undefined}
      data-covering={covering || undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrivez-nous sur WhatsApp (nouvelle fenêtre)"
      data-testid="whatsapp-float"
      className={`group fixed z-30 flex items-center gap-3 rounded-full outline-none transition-opacity duration-200 motion-reduce:transition-none ${covering ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{
        right: "calc(1rem + env(safe-area-inset-right, 0px))",
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none hidden rounded-full bg-paper px-3 py-1.5 text-sm font-semibold text-ink shadow-md lg:block"
      >
        Écrivez-nous
      </span>
      <span className="flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-offset-2 ring-offset-background transition-transform group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-paper motion-reduce:transition-none">
        <WhatsAppIcon className="size-8" />
      </span>
    </a>
  );
}
