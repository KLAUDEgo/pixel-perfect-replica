// Contenu de la page d'accueil : chiffres, options, FAQ, contact, informations légales.

/**
 * IDENTITÉ DE L'ENTREPRISE — utilisée dans les mentions légales, les CGV,
 * la politique de confidentialité, le devis PDF et la FAQ.
 */
export const COMPANY = {
  brand: "mégalopole",
  /** Nom et prénom de l'entrepreneur (affiché avec la mention « EI »). */
  ownerName: "Martin GNAPELET-YESSANLET",
  /** Nom et prénoms légaux (Kbis), pour les mentions légales, CGV et devis. */
  legalName: "Gratien Martin Franck GNAPELET-YESSANLET",
  tradeName: "Megalopole",
  /** Prénom affiché dans la FAQ. */
  firstName: "Martin",
  legalForm: "Entrepreneur individuel (micro-entreprise)",
  address: "2 rue La Tour-Maubourg, 77350 Boissise-la-Bertrand",
  siret: "107 581 092 00015",
  rcs: "RCS Melun 107 581 092",
  /** Numéro WhatsApp affiché (contact uniquement par WhatsApp). */
  phone: "07 56 96 07 58",
  /** Même numéro au format international sans + ni espaces, ex. "33612345678". */
  whatsapp: "33756960758",
  email: "gnapeletmartin@gmail.com",
};

/** Adresse qui reçoit les demandes de rendez-vous et les devis. */
export const CONTACT_EMAIL = COMPANY.email;

/** Règles commerciales (modifiables ici). */
export const POLICY = {
  installDelay: "sous 7 jours après la signature",
  optionDelay: "sous 7 jours après la commande",
  supportHours: "du lundi au vendredi, de 12 h à 21 h",
  supportStandard: "par WhatsApp, réponse sous 48 h ouvrées",
  supportPriority: "par WhatsApp, réponse dans la journée",
  noticeMonths: 1,
};

/** Réglages commerciaux réutilisés dans tout le site (modifiez-les ici). */
const EXTRA_SITE_DISCOUNT = 20; // % de remise sur l'abonnement d'un établissement en plus
const ANNUAL_MONTHS_PAID = 10; // paiement annuel : 10 mois payés = 2 mois offerts
const QUOTE_VALIDITY_DAYS = 30;

/** Le numéro n'est affiché qu'une fois renseigné (pas de « [TÉLÉPHONE] » visible). */
export const HAS_PHONE = COMPANY.phone.trim() !== "" && !COMPANY.phone.trim().startsWith("[");

export const stats = [
  {
    value: "≈ 220",
    unit: "millions",
    text: "de clients actifs dans le programme de fidélité de McDonald's",
    source: "Source : McDonald's, résultats du 2e trimestre 2026",
  },
  {
    value: "40",
    unit: "milliards $",
    text: "de ventes réalisées auprès de ces membres, sur 12 mois",
    source: "Source : McDonald's, résultats du 2e trimestre 2026",
  },
  {
    value: "≈ 60",
    unit: "%",
    text: "des paiements dans ses cafés américains passent par son programme de fidélité",
    source: "Source : Starbucks, exercice 2025",
  },
  {
    value: "+25 à +95",
    unit: "%",
    text: "de bénéfices en plus quand la fidélité des clients progresse de 5 points",
    source: "Source : F. Reichheld, Bain & Company",
  },
];

/**
 * OFFRE DE LANCEMENT — pour la retirer, passez simplement `enabled` à false.
 * Elle disparaît alors de tout le site (bandeau, prix d'installation, page options).
 */
export const LAUNCH_OFFER = {
  enabled: true,
  discountPercent: 50,
  spots: 5,
  counterpart: "une photo de votre commerce pour nos réseaux",
};

/** "149 €" -> 149 */
export const euros = (price: string) => Number(price.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
/** 74.5 -> "74,50 €" ; 149 -> "149 €" */
export const fmtEuros = (n: number) =>
  (Number.isInteger(n)
    ? n.toLocaleString("fr-FR")
    : n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })) + " €";
/** Prix d'installation après l'offre de lancement (ou null si l'offre est désactivée). */
export const launchSetup = (setup: string) =>
  LAUNCH_OFFER.enabled ? fmtEuros(euros(setup) * (1 - LAUNCH_OFFER.discountPercent / 100)) : null;

export type Option = {
  slug: string;
  name: string;
  price: string;
  /** Prix numérique pour le calculateur (null = pas dans le calculateur). */
  amount: number | null;
  unitLabel: string;
  enClair: string;
  includes: string[];
  idealFor: string;
  /** Service dont on réutilise l'illustration et la page détail. */
  service?: string;
};

export const options: Option[] = [
  {
    slug: "plaques-qr-table",
    name: "Lot de 8 plaques QR adhésives de table",
    price: "49 €",
    amount: 49,
    unitLabel: "le lot de 8",
    enClair:
      "Des plaques QR collées sur vos tables ou votre comptoir : le client s'inscrit pendant qu'il attend.",
    includes: [
      "8 plaques gravées, 5 finitions au choix",
      "Pose sur place",
      "Résistantes à l'eau et aux UV",
    ],
    idealFor: "Vous avez plus de tables que celles prévues dans votre formule, ou une terrasse.",
    service: "qr-de-table",
  },
  {
    slug: "presentoirs-qr",
    name: "Lot de 8 présentoirs QR en plexi",
    price: "99 €",
    amount: 99,
    unitLabel: "le lot de 8",
    enClair: "Des présentoirs en plexi avec votre QR, à poser sur les tables ou au comptoir.",
    includes: [
      "8 présentoirs en plexi",
      "Affiches QR à vos couleurs glissées dedans",
      "Installation sur place",
    ],
    idealFor:
      "Vous préférez des supports posés plutôt que collés, ou vous voulez en mettre partout.",
    service: "presentoir-comptoir",
  },
  {
    slug: "vitrophanie",
    name: "Vitrophanie vitrine",
    price: "49 €",
    amount: 49,
    unitLabel: "l'unité",
    enClair:
      "Un autocollant imprimé sur votre vitrine pour inviter les passants et la file d'attente à rejoindre votre carte.",
    includes: [
      "Création du visuel à vos couleurs",
      "Impression sur adhésif enlevable",
      "Pose sur votre vitrine",
    ],
    idealFor: "Vous avez une deuxième vitrine, ou une file d'attente dehors aux heures de pointe.",
    service: "vitrophanie",
  },
  {
    slug: "flyers",
    name: "500 flyers",
    price: "39 €",
    amount: 39,
    unitLabel: "le lot de 500",
    enClair:
      "Des flyers à glisser dans les sacs et les commandes pour inscrire de nouveaux clients.",
    includes: [
      "Flyer recto-verso à vos couleurs",
      "Recto : l'accroche + le QR",
      "Verso : les 3 étapes",
      "Livraison du stock",
    ],
    idealFor:
      "Vous faites beaucoup de vente à emporter ou de livraison, ou votre stock est épuisé.",
    service: "flyers",
  },
  {
    slug: "nouveau-design",
    name: "Nouveau design de carte",
    price: "49 €",
    amount: 49,
    unitLabel: "par design",
    enClair: "Votre carte change de look pour une saison, un événement ou une nouvelle identité.",
    includes: [
      "Proposition du nouveau design",
      "Ajustements avec vous",
      "Mise à jour sur tous les téléphones",
    ],
    idealFor: "Été, fêtes, Ramadan, anniversaire de l'établissement, nouveau logo…",
    service: "design-saisonnier",
  },
  {
    slug: "formation-nouvelle-equipe",
    name: "Formation d'une nouvelle équipe",
    price: "39 €",
    amount: 39,
    unitLabel: "par session",
    enClair: "30 minutes sur place pour former vos nouveaux employés.",
    includes: [
      "30 minutes sur place",
      "Entraînement au scan",
      "La phrase à dire au client",
      "Mémo comptoir neuf",
    ],
    idealFor: "Vous avez recruté, ou l'équipe a changé depuis l'installation.",
    service: "formation-equipe",
  },
  {
    slug: "etablissement-supplementaire",
    name: "Établissement supplémentaire",
    price: `−${EXTRA_SITE_DISCOUNT} % sur son abonnement`,
    amount: null,
    unitLabel: "par établissement",
    enClair: `Vous avez plusieurs boutiques ou restaurants ? Chaque établissement en plus bénéficie de −${EXTRA_SITE_DISCOUNT} % sur son abonnement.`,
    includes: [
      "Sa propre carte ou une carte commune",
      "Son tableau de bord",
      "Son installation sur place (devis séparé)",
    ],
    idealFor: "Vous gérez 2 établissements ou plus.",
  },
];

export type FaqGroup = { title: string; items: { q: string; a: string }[] };

export const faq: FaqGroup[] = [
  {
    title: "Côté client",
    items: [
      {
        q: "Faut-il une appli ou un compte ?",
        a: "Non. Un scan, et la carte s'ajoute à Apple Wallet (iPhone) ou Google Wallet (Android).",
      },
      {
        q: "Mes clients vont-ils être dérangés par les notifications ?",
        a: "Peu de messages : un rappel avant la récompense et, en Pro/Premium, une relance, l'anniversaire et 1 à 2 campagnes par mois. Désactivables à tout moment.",
      },
      {
        q: "Et si un client n'a pas de smartphone, ou change de téléphone ?",
        a: "Pas de problème : votre équipe le retrouve par son nom et lui ajoute ses tampons. S'il change de téléphone ou le perd, ses tampons sont conservés.",
      },
      {
        q: "Et pour la vente à emporter ou la livraison ?",
        a: "À emporter ou livré par vous : on scanne la carte au paiement ou à la livraison. Uber Eats / Deliveroo : pas de tampon à distance, mais le flyer dans le sac les fait s'inscrire.",
      },
      {
        q: "Un client peut-il tricher et se créditer tout seul ?",
        a: "Non : seuls vous et votre équipe pouvez ajouter un tampon, en scannant sa carte.",
      },
    ],
  },
  {
    title: "Côté commerçant",
    items: [
      {
        q: "Faut-il acheter du matériel ?",
        a: "Non, votre téléphone ou votre tablette suffit pour scanner.",
      },
      {
        q: "Est-ce compatible avec ma caisse ou mon TPE (SumUp…) ?",
        a: "Pas besoin : la carte fonctionne à part, sur votre téléphone. Une connexion à la caisse est possible sur devis, surtout pour les enseignes à plusieurs établissements.",
      },
      {
        q: "Combien de temps pour être opérationnel ?",
        a: `Tout est installé ${POLICY.installDelay}.`,
      },
      {
        q: "Puis-je modifier ma carte ou mes récompenses plus tard ?",
        a: "La récompense : oui, il suffit de nous le demander. Un nouveau design de carte : option à 49 € (2 nouveaux designs par an inclus en Premium).",
      },
      {
        q: "Combien me coûte la récompense ? Qui la choisit ?",
        a: "C'est vous qui choisissez la récompense et le nombre de tampons nécessaires (par ex. 10 passages = 1 menu, 1 café ou 1 coupe offerts). La récompense est offerte par votre commerce : vous décidez de ce que vous voulez donner.",
      },
      {
        q: "Puis-je essayer avant de m'engager ?",
        a: "Il n'y a pas d'essai gratuit, mais l'abonnement est sans engagement : vous pouvez arrêter quand vous voulez. Et pour nos premiers clients, l'offre de lancement réduit l'installation de moitié.",
      },
      {
        q: "Qui sera mon contact ?",
        a: `${COMPANY.firstName}, qui intervient sur le secteur Grasse – Cannes – Antibes – Nice : il vient chez vous pour l'installation et la formation. Il vous répond sur WhatsApp${HAS_PHONE ? ` au ${COMPANY.phone}` : ""}, ${POLICY.supportHours}.`,
      },
      {
        q: "Mon équipe va-t-elle s'en sortir ?",
        a: "Oui : la formation sur place est incluse, et un scan suffit.",
      },
      {
        q: "Puis-je avoir plusieurs établissements ?",
        a: `Oui, avec −${EXTRA_SITE_DISCOUNT} % sur l'abonnement de chaque établissement supplémentaire.`,
      },
    ],
  },
  {
    title: "Prix et engagement",
    items: [
      {
        q: "Y a-t-il des frais cachés ?",
        a: "Non : un abonnement mensuel et des frais d'installation, tout est affiché. Les options sont facultatives.",
      },
      {
        q: "Y a-t-il un engagement ?",
        a: "Non. Vous arrêtez quand vous voulez, avec un préavis d'un mois, sans frais. En paiement annuel, l'année réglée n'est pas remboursée. Vos données clients sont alors supprimées.",
      },
      {
        q: "Comment se fait le paiement ?",
        a: `L'installation est réglée à la signature, puis l'abonnement est prélevé chaque mois (SEPA). Vous pouvez aussi choisir le paiement annuel, avec ${12 - ANNUAL_MONTHS_PAID} mois offerts : l'année est alors réglée en une fois, à la signature puis à chaque date anniversaire.`,
      },
      {
        q: "Le devis en ligne m'engage-t-il ?",
        a: `Non. Le devis est gratuit, sans obligation et valable ${QUOTE_VALIDITY_DAYS} jours. Après l'avoir reçu, nous vous appelons pour en parler. Rien n'est payé en ligne.`,
      },
      {
        q: "Les prix peuvent-ils augmenter ? Puis-je changer de formule ?",
        a: "Vous pouvez changer de formule quand vous voulez, à partir du mois suivant. Si nos tarifs évoluent, vous êtes prévenu au moins 1 mois à l'avance et vous restez libre d'arrêter sans frais.",
      },
      {
        q: "Y a-t-il de la TVA en plus ?",
        a: "Non. TVA non applicable (art. 293 B du CGI) : le prix affiché est le prix final.",
      },
    ],
  },
  {
    title: "Données",
    items: [
      {
        q: "Que deviennent les données de mes clients ?",
        a: "Elles servent uniquement à faire fonctionner votre programme de fidélité. Elles ne sont jamais revendues, ni partagées avec d'autres commerces, et ne sont pas conservées si vous arrêtez.",
      },
      {
        q: "Est-ce conforme au RGPD ?",
        a: "Vos clients s'inscrivent eux-mêmes, peuvent désactiver les notifications à tout moment et demander la suppression de leurs données. Le détail est dans notre politique de confidentialité.",
      },
    ],
  },
];

/**
 * DEVIS EN LIGNE — à compléter avant de partager le site.
 * - web3formsKey : clé gratuite à créer sur https://web3forms.com avec votre adresse e-mail.
 *   Tant qu'elle est vide, le devis s'ouvre dans la messagerie du client (envoi manuel).
 * - Les informations de l'entreprise apparaissent en haut de chaque devis PDF.
 */
export const QUOTE_CONFIG = {
  web3formsKey: "40fb7467-e501-44e2-b751-6a0ab4c64ebe",
  validityDays: QUOTE_VALIDITY_DAYS,
  company: {
    name: `${COMPANY.brand} — ${COMPANY.ownerName} EI`,
    address: COMPANY.address,
    siret: COMPANY.siret,
    phone: COMPANY.phone,
  },
  /** Mention TVA imprimée sur le devis, ex. "TVA non applicable, art. 293 B du CGI". */
  vatMention: "TVA non applicable, art. 293 B du CGI",
  /** Forme juridique imprimée sur le devis, ex. "Entrepreneur individuel". */
  legalForm: COMPANY.legalForm,
  /** Mention des CGV imprimée sur le devis. */
  cgv: "consultables sur notre site, page CGV",
  /** Engagement imprimé sur le devis, ex. "Engagement de 12 mois". */
  commitment: "Abonnement sans engagement, résiliable à tout moment avec un préavis d'un mois",
  /** Remise sur l'abonnement de chaque établissement supplémentaire. */
  extraSiteDiscountPercent: EXTRA_SITE_DISCOUNT,
  /** Mois payés en cas de paiement annuel (10 = 2 mois offerts). */
  annualMonthsPaid: ANNUAL_MONTHS_PAID,
};
