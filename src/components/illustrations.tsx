import type { ReactNode } from "react";

/* Maquettes CSS dans la DA — aucune photo, aucun cartoon. */

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="label absolute right-3 top-3 bg-primary px-2 py-1 text-primary-foreground">
    {children}
  </span>
);

function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative h-[420px] w-[210px] rounded-[2rem] border-[6px] border-paper bg-ink p-3 ${className}`}
    >
      <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-paper/40" />
      {children}
    </div>
  );
}

function WalletCard({
  variant = "dark",
  title = "smash club",
  reward = "10e menu offert",
  stamps = 7,
}: {
  variant?: "dark" | "paper" | "yellow";
  title?: string;
  reward?: string;
  stamps?: number;
}) {
  const v =
    variant === "paper"
      ? "bg-paper text-ink"
      : variant === "yellow"
        ? "bg-primary text-primary-foreground"
        : "bg-ink text-paper border border-paper/30";
  const dot = variant === "dark" ? "bg-primary" : "bg-ink";
  return (
    <div className={`fold-r w-[190px] p-4 ${v}`}>
      <div className="label mb-3 opacity-70">Carte fidélité</div>
      <div className="title text-2xl">{title}</div>
      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`aspect-square rounded-full border border-current ${i < stamps ? dot : ""}`}
          />
        ))}
      </div>
      <div className="mt-3 font-serif italic">{reward}</div>
    </div>
  );
}

function Frame({ children, tag = "Exemple" }: { children: ReactNode; tag?: string }) {
  return (
    <div className="relative flex min-h-[460px] flex-wrap items-center justify-center gap-8 overflow-hidden border bg-card p-10">
      <Tag>{tag}</Tag>
      {children}
    </div>
  );
}

function QR({ size = 64 }: { size?: number }) {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1,
    0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1,
    0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1,
  ];
  return (
    <div className="grid grid-cols-9 bg-paper p-1" style={{ width: size, height: size }}>
      {cells.map((c, i) => (
        <span key={i} className={c ? "bg-ink" : ""} />
      ))}
    </div>
  );
}

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-[260px] border border-paper/20 bg-ink">
      <div className="label flex items-center justify-between border-b border-paper/20 px-3 py-2">
        <span>{title}</span>
        <span className="h-2 w-2 rounded-full bg-primary" />
      </div>
      <div className="p-3 text-sm">{children}</div>
    </div>
  );
}

function Bars() {
  return (
    <div className="flex h-16 items-end gap-1.5">
      {[30, 45, 38, 60, 52, 75, 90].map((h, i) => (
        <span key={i} className="flex-1 bg-primary" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function Notif({ text }: { text: string }) {
  return (
    <div className="anim-float rounded-xl bg-paper/95 p-3 text-ink">
      <div className="label mb-1 flex justify-between opacity-60">
        <span>Smash Club</span>
        <span>maint.</span>
      </div>
      <div className="text-sm font-semibold leading-snug">{text}</div>
    </div>
  );
}

export function ServiceIllustration({ slug }: { slug: string }) {
  switch (slug) {
    case "carte-personnalisee":
      return (
        <Frame>
          <WalletCard variant="dark" />
          <div className="md:-translate-y-6">
            <WalletCard variant="yellow" />
          </div>
          <WalletCard variant="paper" />
        </Frame>
      );
    case "scans-illimites":
      return (
        <Frame>
          <div className="text-center">
            <p className="label mb-3 text-muted-foreground">Scans ce mois</p>
            <div className="title flex h-24 overflow-hidden text-8xl text-primary">
              <span>1 2</span>
              <span className="flex flex-col anim-count">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span key={n} className="h-24">
                    {n}
                  </span>
                ))}
              </span>
              <span className="flex flex-col anim-count" style={{ animationDuration: "1.2s" }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span key={n} className="h-24">
                    {n}
                  </span>
                ))}
              </span>
            </div>
            <p className="label mt-3">0 € par client</p>
          </div>
          <Phone>
            <div className="label mb-3 text-center">Scanner</div>
            <div className="relative mx-auto h-40 w-40 border-2 border-primary">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary anim-ping" />
            </div>
            <div className="mt-6 bg-primary py-3 text-center font-bold text-primary-foreground">
              +1 tampon
            </div>
          </Phone>
        </Frame>
      );
    case "tableau-de-bord":
      return (
        <Frame tag="Données d'exemple">
          <Screen title="Accueil">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["412", "inscrits"],
                ["1 280", "passages"],
                ["96", "récomp."],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="title text-xl text-primary">{n}</div>
                  <div className="label text-[0.55rem] opacity-60">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Bars />
            </div>
          </Screen>
          <Screen title="Meilleurs habitués">
            {["Yanis B.", "Inès K.", "Karim D.", "Sarah L."].map((n, i) => (
              <div key={n} className="flex justify-between border-b border-paper/10 py-1.5">
                <span>
                  {i + 1}. {n}
                </span>
                <span className="text-primary">{38 - i * 5} passages</span>
              </div>
            ))}
          </Screen>
          <Screen title="Clients inactifs">
            {[
              ["30 j", "27"],
              ["60 j", "14"],
              ["90 j", "9"],
            ].map(([d, n]) => (
              <div key={d} className="flex items-center gap-2 py-1">
                <span className="label w-10">{d}</span>
                <span className="h-2 bg-primary" style={{ width: `${Number(n) * 5}px` }} />
                <span>{n}</span>
              </div>
            ))}
          </Screen>
        </Frame>
      );
    case "rappels-automatiques":
      return (
        <Frame>
          <Phone>
            <div className="title mt-6 text-center text-5xl">18:42</div>
            <div className="label mb-8 text-center opacity-60">mardi 6 octobre</div>
            <Notif text="Plus que 2 menus avant votre menu offert !" />
          </Phone>
        </Frame>
      );
    case "relances-et-anniversaires":
      return (
        <Frame>
          <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row md:items-center">
            {[
              ["J0", "Dernière visite"],
              ["J+30", "Toujours absent"],
              ["Notification", "« Vos frites sont offertes »"],
              ["Retour", "+1 tampon"],
            ].map(([k, t], i) => (
              <div key={k} className="flex flex-1 items-center gap-3 md:flex-col md:text-center">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${i === 3 ? "bg-primary text-primary-foreground border-primary" : "border-primary"} ${i === 2 ? "anim-ping" : ""}`}
                >
                  {i + 1}
                </span>
                <div>
                  <div className="label text-primary">{k}</div>
                  <div className="text-sm">{t}</div>
                </div>
              </div>
            ))}
          </div>
        </Frame>
      );
    case "campagnes":
      return (
        <Frame>
          <Phone>
            <div className="mt-10 space-y-3">
              <Notif text="Tampon double aujourd'hui de 15 h à 18 h !" />
              <div className="opacity-60">
                <Notif text="Soir de match : menu partage à 19 €" />
              </div>
            </div>
          </Phone>
          <div className="grid gap-2">
            {[
              "À qui ? Tous les clients",
              "Quel message ? Tampon double",
              "Quand ? Mardi 14 h 30",
              "Quel résultat ? +38 passages",
            ].map((t) => (
              <div key={t} className="fold-r panel-paper px-4 py-2 text-sm font-semibold">
                {t}
              </div>
            ))}
          </div>
        </Frame>
      );
    case "bilan-mensuel":
      return (
        <Frame>
          <div className="anim-float w-[300px] panel-paper p-6 shadow-2xl">
            <div className="label mb-1">Bilan — septembre</div>
            <div className="title mb-4 text-3xl">smash club</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["84", "nouveaux inscrits"],
                ["612", "passages"],
                ["41", "récompenses"],
                ["37", "à relancer"],
              ].map(([n, l]) => (
                <div key={l} className="border-t-2 border-ink pt-2">
                  <div className="title text-3xl">{n}</div>
                  <div className="label text-[0.6rem]">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-primary p-3 text-sm">
              <b>Conseil :</b> lancer une campagne « soir de match ».
            </div>
          </div>
        </Frame>
      );
    case "deuxieme-carte":
      return (
        <Frame>
          <WalletCard variant="dark" />
          <WalletCard variant="yellow" title="étudiant" reward="6e menu offert" stamps={3} />
        </Frame>
      );
    case "design-saisonnier":
      return (
        <Frame>
          <div className="text-center">
            <p className="label mb-3">Été</p>
            <WalletCard variant="yellow" title="smash summer" />
          </div>
          <div className="text-center">
            <p className="label mb-3">Fêtes</p>
            <WalletCard variant="paper" title="smash noël" />
          </div>
        </Frame>
      );
    case "visite-trimestrielle":
      return (
        <Frame>
          <div className="grid w-[260px] grid-cols-3 gap-2">
            {[
              "jan",
              "fév",
              "mar",
              "avr",
              "mai",
              "juin",
              "juil",
              "août",
              "sept",
              "oct",
              "nov",
              "déc",
            ].map((m, i) => (
              <div
                key={m}
                className={`label flex h-14 items-center justify-center border ${i % 3 === 2 ? "bg-primary text-primary-foreground" : ""}`}
              >
                {m}
              </div>
            ))}
          </div>
          <div className="panel-paper w-[260px] p-5">
            <div className="label mb-3">Checklist — 45 min</div>
            {[
              "Bilan des chiffres",
              "QR et vitrine",
              "Nouveaux employés",
              "Récompense",
              "Campagnes du trimestre",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 py-1 text-sm">
                <span className="bg-ink px-1 text-xs text-paper">✓</span>
                {t}
              </div>
            ))}
          </div>
        </Frame>
      );
    case "support-prioritaire":
      return (
        <Frame>
          <Phone>
            <div className="label mb-4 border-b border-paper/20 pb-2">WhatsApp — Support</div>
            <div className="space-y-3 text-sm">
              <div className="ml-auto w-4/5 bg-primary p-2 text-primary-foreground">
                Le téléphone de scan ne marche plus 😬
              </div>
              <div className="w-4/5 bg-paper p-2 text-ink">
                On s'en occupe, connectez-vous sur ce lien depuis un autre appareil.
              </div>
              <div className="label opacity-60">Réponse dans la journée</div>
            </div>
          </Phone>
        </Frame>
      );
    case "formation-equipe":
      return (
        <Frame>
          <div className="w-full max-w-md">
            <div className="flex h-10 w-full">
              {[
                ["5", ""],
                ["10", "bg-primary"],
                ["5", ""],
                ["5", "bg-primary"],
                ["5", ""],
              ].map(([w, c], i) => (
                <div
                  key={i}
                  className={`label flex items-center justify-center border border-paper/30 ${c} ${c ? "text-primary-foreground" : ""}`}
                  style={{ flex: Number(w) }}
                >
                  {w}′
                </div>
              ))}
            </div>
            <div className="label mt-2 flex justify-between text-muted-foreground">
              <span>0</span>
              <span>30 min</span>
            </div>
          </div>
          <div className="panel-paper fold-r w-[240px] rotate-2 p-5">
            <div className="label mb-2">Mémo comptoir</div>
            <p className="font-serif text-lg italic leading-snug">
              « Vous avez notre carte fidélité ? Scannez ici, votre 10e menu est offert. »
            </p>
          </div>
        </Frame>
      );
    case "presentoir-comptoir":
    case "chevalet-grave": {
      const grave = slug === "chevalet-grave";
      return (
        <Frame>
          <div className="relative w-full max-w-lg">
            <div className="flex items-end justify-center gap-10">
              <div className="h-16 w-20 bg-muted" title="caisse" />
              <div
                className={`flex flex-col items-center gap-2 border-2 ${grave ? "border-primary" : "border-paper/50"} bg-paper/10 p-4 backdrop-blur`}
              >
                {grave && <span className="title text-sm text-primary">smash club</span>}
                <QR size={72} />
                <span className="label text-[0.6rem]">Scannez ici</span>
              </div>
            </div>
            <div className="mt-0 h-6 bg-paper" />
            <div className="h-24 bg-muted" />
          </div>
        </Frame>
      );
    }
    case "qr-de-table":
      return (
        <Frame>
          <div className="relative h-64 w-64 rounded-full border-8 border-muted bg-card">
            {[0, 90, 180, 270].map((r) => (
              <div
                key={r}
                className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper/30"
                style={{
                  transform: `rotate(${r}deg) translateY(-80px) translate(-50%, -50%)`,
                  transformOrigin: "0 0",
                }}
              />
            ))}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 anim-ping">
              <QR size={56} />
            </div>
          </div>
        </Frame>
      );
    case "vitrophanie":
      return (
        <Frame>
          <div className="w-full max-w-lg">
            <div className="panel-paper title px-4 py-2 text-2xl">smash club</div>
            <div className="grid grid-cols-[2fr_1fr] gap-2 bg-paper p-2">
              <div className="relative flex h-56 items-center justify-center bg-ink/90">
                <div className="fold-r bg-primary p-4 text-center text-primary-foreground">
                  <div className="title text-3xl">ton 10e menu offert</div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <QR size={44} />
                    <span className="label">Scanne ici</span>
                  </div>
                </div>
              </div>
              <div className="h-56 bg-ink/90" />
            </div>
          </div>
        </Frame>
      );
    case "flyers":
      return (
        <Frame>
          <div className="relative h-72 w-56 bg-kraft">
            <div className="absolute -top-10 left-1/2 w-40 -translate-x-1/2 rotate-[-6deg] bg-primary p-4 text-primary-foreground anim-float">
              <div className="title text-2xl">ton 10e menu offert</div>
              <div className="mt-3">
                <QR size={48} />
              </div>
              <div className="label mt-2 text-[0.55rem]">Recto</div>
            </div>
          </div>
          <div className="panel-paper w-48 p-4">
            <div className="label mb-3">Verso</div>
            {["Scannez le QR", "Ajoutez la carte", "Cumulez vos menus"].map((t, i) => (
              <div key={t} className="flex gap-2 py-1 text-sm">
                <b>{i + 1}.</b>
                {t}
              </div>
            ))}
          </div>
        </Frame>
      );
    default:
      return (
        <Frame>
          <WalletCard />
        </Frame>
      );
  }
}
