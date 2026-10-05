// Contenu de la page d'accueil : chiffres, options, FAQ, contact.
// Les éléments entre [crochets] sont à compléter avant publication.

/** Adresse qui reçoit les demandes de rendez-vous. À REMPLACER. */
export const CONTACT_EMAIL = "contact@example.com";

/** Réglages commerciaux réutilisés dans tout le site (modifiez-les ici). */
const EXTRA_SITE_DISCOUNT = 20; // % de remise sur l'abonnement d'un établissement en plus
const ANNUAL_MONTHS_PAID = 10; // paiement annuel : 10 mois payés = 2 mois offerts
const QUOTE_VALIDITY_DAYS = 30;

export const stats = [
  {
    value: "≈ 220",
    unit: "millions",
    text: "de clients actifs dans le programme de fidélité de McDonald's",
    source: "Source : McDonald's, résultats du 2e trimestre 2026",
  },
  {
    value: "40",
    unit: "milliards $",
    text: "de ventes réalisées auprès de ces membres, sur 12 mois",
    source: "Source : McDonald's, résultats du 2e trimestre 2026",
  },
  {
    value: "≈ 60",
    unit: "%",
    text: "du chiffre d'affaires des cafés Starbucks aux États-Unis vient des membres de son programme",
    source: "Source : Starbucks, exercice 2025",
  },
  {
    value: "+25 à +95",
    unit: "%",
    text: "de bénéfices quand le taux de clients qui reviennent augmente de seulement 5 %",
    source: "Source : Bain & Company",
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
  counterpart: "une photo de votre restaurant pour nos réseaux",
};

/** "149 €" -> 149 */
export const euros = (price: string) => Number(price.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
/** 74.5 -> "74,50 €" ; 149 -> "149 €" */
export const fmtEuros = (n: number) =>
  (Number.isInteger(n)
    ? n.toLocaleString("fr-FR")
    : n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })) + " €";
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
    price: "49 €",
    amount: 49,
    unitLabel: "le lot de 8",
    enClair: "Des plaques QR collées sur vos tables : le client s'inscrit pendant qu'il mange.",
    includes: [
      "8 plaques QR à vos couleurs",
      "Pose sur place",
      "Résistantes au nettoyage quotidien",
    ],
    idealFor: "Vous avez plus de tables que celles prévues dans votre offre, ou une terrasse.",
    service: "qr-de-table",
  },
  {
    slug: "presentoirs-qr",
    name: "Lot de 8 présentoirs QR en plexi",
    price: "99 €",
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
    price: "49 €",
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
    price: "39 €",
    amount: 39,
    unitLabel: "le lot de 500",
    enClair:
      "Des flyers à glisser dans les sacs à emporter et les livraisons pour inscrire de nouveaux clients.",
    includes: [
      "Flyer recto-verso à vos couleurs",
      "Recto : l'accroche + le QR",
      "Verso : les 3 étapes",
      "Livraison du stock",
    ],
    idealFor:
      "Vous faites beaucoup de vente à emporter ou de livraison, ou votre stock est épuisé.",
    service: "flyers",
  },
  {
    slug: "nouveau-design",
    name: "Nouveau design de carte",
    price: "49 €",
    amount: 49,
    unitLabel: "par design",
    enClair: "Votre carte change de look pour une saison, un événement ou une nouvelle identité.",
    includes: [
      "Proposition du nouveau design",
      "Ajustements avec vous",
      "Mise à jour sur tous les téléphones",
    ],
    idealFor: "Été, fêtes, Ramadan, anniversaire du restaurant, nouveau logo…",
    service: "design-saisonnier",
  },
  {
    slug: "formation-nouvelle-equipe",
    name: "Formation d'une nouvelle équipe",
    price: "39 €",
    amount: 39,
    unitLabel: "par session",
    enClair: "Une nouvelle session de 30 minutes sur place pour former vos nouveaux employés.",
    includes: [
      "30 minutes sur place",
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
    price: `-${EXTRA_SITE_DISCOUNT} % sur son abonnement`,
    amount: null,
    unitLabel: "par établissement",
    enClair: `Vous avez plusieurs restaurants ? Chaque établissement en plus bénéficie de -${EXTRA_SITE_DISCOUNT} % sur son abonnement.`,
    includes: [
      "Sa propre carte ou une carte commune",
      "Son tableau de bord",
      "Son installation sur place (tarif à définir ensemble)",
    ],
    idealFor: "Vous gérez 2 restaurants ou plus.",
  },
];

export type FaqGroup = { title: string; items: { q: string; a: string }[] };

export const faq: FaqGroup[] = [
  {
    title: "Côté client",
    items: [
      {
        q: "Mes clients doivent-ils télécharger une application ?",
        a: "Non. La carte s'ajoute à Apple Wallet ou Google Wallet, déjà présents sur leur téléphone.",
      },
      { q: "Doivent-ils créer un compte ?", a: "Non. Un scan et quelques secondes suffisent." },
      {
        q: "Ça marche sur iPhone et sur Android ?",
        a: "Oui : la carte s'ajoute à Apple Wallet sur iPhone et à Google Wallet sur Android.",
      },
      { q: "Quelles informations mon client doit-il donner pour s'inscrire ?", a: "[À COMPLÉTER]" },
      {
        q: "Mes clients vont-ils être dérangés par les notifications ?",
        a: "Les messages sont limités : rappels quand la récompense approche ; en Pro et Premium, une relance après 30 jours d'absence, un message d'anniversaire et 1 ou 2 campagnes par mois. Vos clients peuvent aussi désactiver les notifications à tout moment depuis leur téléphone.",
      },
      { q: "Et si un client change de téléphone ou le perd ?", a: "[À COMPLÉTER]" },
      { q: "Et s'ils n'ont pas de smartphone ?", a: "[À COMPLÉTER]" },
      {
        q: "Comment un client gagne-t-il des tampons s'il commande à emporter ?",
        a: "Il montre sa carte au comptoir au moment de payer ou de récupérer sa commande : on la scanne comme sur place.",
      },
      {
        q: "Et pour les commandes en livraison (Uber Eats, Deliveroo) ?",
        a: "[À COMPLÉTER selon la solution retenue]. Les flyers glissés dans les sacs permettent au moins de faire inscrire ces clients.",
      },
      {
        q: "Un client peut-il tricher et se créditer tout seul ?",
        a: "Non : seuls vous et votre équipe pouvez ajouter un tampon, en scannant sa carte.",
      },
    ],
  },
  {
    title: "Côté restaurateur",
    items: [
      {
        q: "Faut-il acheter du matériel ?",
        a: "Non, votre téléphone ou votre tablette suffit pour scanner.",
      },
      {
        q: "Est-ce compatible avec ma caisse ou mon TPE (SumUp…) ?",
        a: "La carte fonctionne de façon indépendante : pas besoin de toucher à votre caisse. [À COMPLÉTER si une intégration est disponible]",
      },
      {
        q: "Combien de temps pour être opérationnel ?",
        a: "[À COMPLÉTER : ex. 48 h après la signature]",
      },
      {
        q: "Puis-je modifier ma carte ou mes récompenses plus tard ?",
        a: "La récompense : oui, il suffit de nous le demander. Un nouveau design de carte : option à 49 € HT (2 nouveaux designs par an inclus en Premium).",
      },
      {
        q: "Combien me coûte la récompense ? Qui la choisit ?",
        a: "C'est vous qui choisissez la récompense et le nombre de tampons nécessaires (par exemple 10 menus achetés = 1 offert). La récompense est offerte par votre restaurant : vous décidez de ce que vous voulez donner.",
      },
      { q: "Puis-je essayer avant de m'engager ?", a: "[À COMPLÉTER]" },
      {
        q: "Qui êtes-vous ? Qui vais-je avoir au téléphone ?",
        a: "Une entreprise locale du secteur Grasse – Cannes – Antibes – Nice : on vient chez vous pour l'installation et la formation. [NOM ET TÉLÉPHONE À COMPLÉTER]",
      },
      {
        q: "Mon équipe va-t-elle s'en sortir ?",
        a: "Oui : la formation sur place est incluse, et un scan prend 2 secondes.",
      },
      {
        q: "Puis-je avoir plusieurs établissements ?",
        a: `Oui, avec -${EXTRA_SITE_DISCOUNT} % sur l'abonnement de chaque établissement supplémentaire.`,
      },
    ],
  },
  {
    title: "Prix et engagement",
    items: [
      {
        q: "Y a-t-il des frais cachés ?",
        a: "Non : un abonnement mensuel et des frais d'installation, tout est affiché. Les options sont facultatives.",
      },
      { q: "Y a-t-il un engagement ?", a: "[À COMPLÉTER : ex. 12 mois]" },
      {
        q: "Comment se fait le paiement ?",
        a: `L'installation est réglée à la signature, puis l'abonnement est prélevé chaque mois par prélèvement SEPA. Vous pouvez aussi choisir le paiement annuel, avec ${12 - ANNUAL_MONTHS_PAID} mois offerts [MODALITÉS À COMPLÉTER].`,
      },
      {
        q: "Le devis en ligne m'engage-t-il ?",
        a: `Non. Le devis est gratuit, sans obligation et valable ${QUOTE_VALIDITY_DAYS} jours. Après l'avoir reçu, nous vous appelons pour en parler. Rien n'est payé en ligne.`,
      },
      { q: "Que se passe-t-il si j'arrête ?", a: "[À COMPLÉTER]" },
      { q: "Les prix peuvent-ils augmenter ? Puis-je changer de formule ?", a: "[À COMPLÉTER]" },
      {
        q: "Les prix sont-ils HT ?",
        a: "Oui, tous nos prix sont indiqués hors taxes. [RÉGIME DE TVA À COMPLÉTER]",
      },
    ],
  },
  {
    title: "Données",
    items: [
      { q: "À qui appartiennent les données de mes clients ?", a: "[À COMPLÉTER]" },
      { q: "Est-ce conforme au RGPD ?", a: "[À COMPLÉTER]" },
    ],
  },
];

/**
 * DEVIS EN LIGNE — à compléter avant de partager le site.
 * - web3formsKey : clé gratuite à créer sur https://web3forms.com avec votre adresse email.
 *   Tant qu'elle est vide, le devis s'ouvre dans la messagerie du client (envoi manuel).
 * - Les informations de l'entreprise apparaissent en haut de chaque devis PDF.
 */
export const QUOTE_CONFIG = {
  web3formsKey: "",
  validityDays: QUOTE_VALIDITY_DAYS,
  company: {
    name: "mégalopole",
    address: "[ADRESSE À COMPLÉTER]",
    siret: "[SIRET À COMPLÉTER]",
    phone: "[TÉLÉPHONE À COMPLÉTER]",
  },
  /** Mention TVA imprimée sur le devis, ex. "TVA non applicable, art. 293 B du CGI". */
  vatMention: "[MENTION TVA À COMPLÉTER]",
  /** Forme juridique imprimée sur le devis, ex. "Entrepreneur individuel". */
  legalForm: "[FORME JURIDIQUE À COMPLÉTER]",
  /** Mention des CGV imprimée sur le devis. */
  cgv: "[CGV À COMPLÉTER]",
  /** Engagement imprimé sur le devis, ex. "Engagement de 12 mois". */
  commitment: "[ENGAGEMENT À COMPLÉTER]",
  /** Remise sur l'abonnement de chaque établissement supplémentaire. */
  extraSiteDiscountPercent: EXTRA_SITE_DISCOUNT,
  /** Mois payés en cas de paiement annuel (10 = 2 mois offerts). */
  annualMonthsPaid: ANNUAL_MONTHS_PAID,
};
