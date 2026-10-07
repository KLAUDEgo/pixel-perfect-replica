// Tout le contenu éditable du site : services et formules.
// Modifiez les textes ici, les pages se mettent à jour automatiquement.

import { SOCIAL_PACK_MONTHLY } from "./content";

export type OfferSlug = "essentiel" | "pro" | "premium";

export type Service = {
  slug: string;
  name: string;
  enClair: string;
  steps: string[];
  example: string;
  benefits: string[];
  faq: { q: string; a: string }[];
  /** Sections supplémentaires (rubriques, exemples, programme…) */
  sections?: {
    title: string;
    intro?: string;
    items: { label?: string; title: string; text: string }[];
  }[];
};

export const services: Service[] = [
  {
    slug: "carte-personnalisee",
    name: "Carte de fidélité personnalisée",
    enClair:
      "Votre carte dans Apple Wallet et Google Wallet, avec votre logo, vos couleurs et votre récompense.",
    steps: [
      "On récupère votre logo et vos couleurs.",
      "On vous propose 2 designs de carte.",
      "Vous validez celui qui vous plaît (ou on ajuste).",
      "La carte est en ligne, vos clients peuvent s'inscrire.",
    ],
    example:
      "Smash Club choisit une carte noire avec son logo jaune et la récompense « 10e menu offert ». Dès qu'il valide le design, la carte est disponible dans le téléphone des clients.",
    benefits: [
      "Aucune appli à télécharger pour le client",
      "Une carte qui ne se perd jamais",
      "Votre marque visible chaque jour sur leur téléphone",
    ],
    faq: [
      {
        q: "Le client doit-il installer une application ?",
        a: "Non. La carte s'ajoute directement dans le portefeuille de son téléphone.",
      },
      { q: "Puis-je changer la récompense plus tard ?", a: "Oui, il suffit de nous le demander." },
    ],
  },
  {
    slug: "scans-illimites",
    name: "Clients et scans illimités",
    enClair: "Autant de clients et de scans que vous voulez, sans frais par client.",
    steps: [
      "Votre équipe installe l'appli de scan sur un téléphone ou une tablette.",
      "Le client présente sa carte à la caisse.",
      "Un scan = un tampon, sans limite.",
    ],
    example: "Un samedi soir, Smash Club scanne 220 cartes. Le prix de l'abonnement ne bouge pas.",
    benefits: [
      "Un prix fixe, peu importe votre succès",
      "Aucune mauvaise surprise sur la facture",
      "Pas besoin de matériel spécial",
    ],
    faq: [
      {
        q: "Y a-t-il un plafond caché ?",
        a: "Non, ni sur le nombre de clients, ni sur le nombre de scans.",
      },
      {
        q: "Combien de téléphones peuvent scanner ?",
        a: "Autant que nécessaire pour votre équipe.",
      },
    ],
  },
  {
    slug: "tableau-de-bord",
    name: "Tableau de bord",
    enClair: "Un espace simple pour voir qui sont vos clients, combien reviennent et qui relancer.",
    steps: [
      "On vous crée un accès personnel.",
      "On vous montre les rubriques en 10 minutes.",
      "Vous consultez vos chiffres quand vous voulez, sur téléphone ou ordinateur.",
    ],
    example:
      "Le gérant de Smash Club voit chaque lundi ses 10 meilleurs habitués et les clients absents depuis 30 jours.",
    benefits: [
      "Vous connaissez enfin vos habitués",
      "Vous voyez qui ne revient plus",
      "Des chiffres clairs, sans tableur",
    ],
    faq: [
      {
        q: "Faut-il être à l'aise avec l'informatique ?",
        a: "Non, tout est pensé pour être lu en un coup d'œil.",
      },
      {
        q: "Que deviennent les données de mes clients ?",
        a: "Elles servent uniquement à votre programme de fidélité : jamais revendues, ni partagées avec d'autres commerces.",
      },
    ],
    sections: [
      {
        title: "Les rubriques",
        intro: "Données d'exemple.",
        items: [
          {
            label: "01",
            title: "Accueil",
            text: "Clients inscrits, passages, récompenses données et évolution sur le mois.",
          },
          {
            label: "02",
            title: "Clients",
            text: "La liste de vos clients, leur nombre de passages et leur dernière visite.",
          },
          {
            label: "03",
            title: "Meilleurs habitués",
            text: "Votre top 10 des clients les plus fidèles.",
          },
          {
            label: "04",
            title: "Clients inactifs",
            text: "Ceux qui ne sont pas revenus depuis 30, 60 ou 90 jours.",
          },
          { label: "05", title: "Notifications", text: "Les messages envoyés et ceux programmés." },
          {
            label: "06",
            title: "Ma carte",
            text: "L'aperçu de votre carte et de votre récompense.",
          },
        ],
      },
    ],
  },
  {
    slug: "rappels-automatiques",
    name: "Rappel avant la récompense",
    enClair: "Le client reçoit automatiquement « Plus que 2 passages avant votre récompense ! ».",
    steps: [
      "On règle le moment du rappel avec vous.",
      "Le client approche de sa récompense.",
      "Il reçoit une notification sur son téléphone, sans action de votre part.",
    ],
    example:
      "Un client de Smash Club a 8 tampons sur 10. Le lendemain, il reçoit « Plus que 2 menus avant votre menu offert ! » et revient dans la semaine.",
    benefits: [
      "Des clients qui reviennent plus vite",
      "Zéro travail pour vous",
      "Un message utile, que le client peut désactiver",
    ],
    faq: [
      {
        q: "Le client peut-il désactiver les messages ?",
        a: "Oui, il garde toujours la main depuis son téléphone.",
      },
      { q: "Puis-je modifier le texte ?", a: "Oui, on l'adapte à votre ton." },
    ],
  },
  {
    slug: "relances-et-anniversaires",
    name: "Relance des absents et anniversaires",
    enClair:
      "Un message automatique aux clients absents depuis 30 jours et le jour de leur anniversaire.",
    steps: [
      "Le client fait sa dernière visite.",
      "30 jours passent sans passage.",
      "Il reçoit automatiquement un message avec une raison de revenir.",
      "Le jour de son anniversaire, il reçoit un petit cadeau.",
    ],
    example:
      "Un client de Smash Club n'est pas venu depuis un mois. Il reçoit « On ne vous voit plus ! Vos frites sont offertes cette semaine. » et repasse le jeudi.",
    benefits: [
      "Récupérer les clients qui s'éloignent",
      "Créer un lien personnel",
      "Tout tourne tout seul",
    ],
    faq: [
      {
        q: "Comment connaît-on l'anniversaire ?",
        a: "Le client peut l'indiquer en s'inscrivant, s'il le souhaite.",
      },
      {
        q: "Peut-on changer le délai de 30 jours ?",
        a: "Oui, on l'ajuste à votre rythme de visites.",
      },
    ],
  },
  {
    slug: "campagnes",
    name: "Campagnes",
    enClair: "Un message envoyé sur le téléphone de vos clients, avec une raison de venir.",
    steps: [
      "En début de mois, on vous propose une campagne.",
      "Vous la validez par WhatsApp.",
      "On l'envoie au bon moment.",
      "Le résultat apparaît dans votre bilan mensuel.",
    ],
    example:
      "Smash Club a peu de monde entre 15 h et 18 h. Campagne « tampon double l'après-midi » envoyée le mardi : plus de passages aux heures creuses.",
    benefits: [
      "Des clients en plus aux moments calmes",
      "Des messages rédigés pour vous",
      "Un résultat mesuré chaque mois",
    ],
    faq: [
      {
        q: "Combien de campagnes par mois ?",
        a: "Pro : 1 campagne par mois rédigée pour vous. Premium : 2 par mois, dont des offres événementielles (soir de match, Ramadan, rentrée…).",
      },
      { q: "Dois-je écrire les messages ?", a: "Non, on s'en occupe. Vous validez simplement." },
    ],
    sections: [
      {
        title: "Les 4 éléments d'une campagne",
        items: [
          { label: "01", title: "À qui ?", text: "Tous les clients, les inactifs, les étudiants…" },
          { label: "02", title: "Quel message ?", text: "Court, clair, avec une offre." },
          { label: "03", title: "Quand ?", text: "Le jour et l'heure qui comptent." },
          { label: "04", title: "Quel résultat ?", text: "Combien de clients sont revenus." },
        ],
      },
      {
        title: "Exemples de campagnes",
        items: [
          { title: "Relance inactifs", text: "Une offre pour ceux qui ne viennent plus." },
          { title: "Heure creuse", text: "Tampon double de 15 h à 18 h." },
          { title: "Soir de match", text: "Un menu partage pour regarder le match." },
          { title: "Anniversaire", text: "L'établissement fête ses 3 ans avec ses clients." },
          { title: "Ramadan", text: "Une offre spéciale pour la rupture du jeûne." },
          {
            title: "Rentrée étudiante",
            text: "Un tampon offert sur présentation de la carte étudiante.",
          },
          { title: "Nouveau produit", text: "Faire goûter la nouveauté aux habitués." },
        ],
      },
    ],
  },
  {
    slug: "bilan-mensuel",
    name: "Bilan mensuel",
    enClair: "Chaque mois, une page avec vos chiffres clés et un conseil concret.",
    steps: [
      "On rassemble les chiffres du mois.",
      "On rédige une page claire avec un conseil.",
      "Vous la recevez au début du mois suivant.",
    ],
    example:
      "Bilan de septembre de Smash Club : 84 nouveaux inscrits, 612 passages, 41 récompenses, 37 clients à relancer. Conseil : lancer une campagne « soir de match ».",
    benefits: [
      "Savoir si la fidélité fonctionne",
      "Un conseil à appliquer tout de suite",
      "Une page, pas un rapport de 20 pages",
    ],
    faq: [
      { q: "Sous quel format ?", a: "Une page envoyée par WhatsApp ou e-mail." },
      { q: "Peut-on en parler ensemble ?", a: "Oui, posez-nous vos questions par message." },
    ],
  },
  {
    slug: "video-reseaux",
    name: "Vidéo réseaux sociaux",
    enClair:
      "Chaque mois, une vidéo courte (Reels, TikTok) de votre commerce, tournée sur place et montée par nous, prête à publier.",
    steps: [
      "On choisit ensemble le sujet du mois : un produit, l'équipe, un moment fort.",
      "On vient tourner sur place, en 20 minutes, pendant une heure calme.",
      "On monte une vidéo verticale de 15 à 30 secondes, avec texte et musique.",
      "Vous la recevez par WhatsApp, prête à publier.",
    ],
    example:
      "Ce mois-ci, Smash Club reçoit une vidéo de 20 secondes du smash burger en préparation : la viande écrasée sur la plaque, le fromage qui fond, le burger servi. Le gérant la publie le vendredi soir.",
    benefits: [
      "Une présence régulière sur les réseaux",
      "Une vidéo pro sans y passer vos soirées",
      "Votre commerce montré sous son meilleur jour",
    ],
    faq: [
      {
        q: "Qui publie la vidéo ?",
        a: "Vous, ou nous si vous prenez le Pack réseaux sociaux.",
      },
      {
        q: "Je peux choisir le sujet ?",
        a: "Oui, on en parle ensemble avant le tournage.",
      },
      {
        q: "Et si je veux plus de vidéos ?",
        a: `Le Pack réseaux sociaux (option à ${SOCIAL_PACK_MONTHLY} € par mois, sans engagement) en comprend 4 par mois, avec la publication et les réponses aux messages.`,
      },
    ],
  },
  {
    slug: "design-saisonnier",
    name: "Design saisonnier",
    enClair: "Votre carte change de look 2 fois par an : été, fêtes, Ramadan…",
    steps: [
      "On choisit les 2 moments de l'année.",
      "On propose le nouveau design.",
      "Vous validez.",
      "La carte se met à jour sur tous les téléphones.",
    ],
    example:
      "En décembre, la carte Smash Club passe en version fêtes. En juin, elle passe en version été.",
    benefits: [
      "Une carte qui reste vivante",
      "Une occasion de reparler à vos clients",
      "Aucune action pour le client",
    ],
    faq: [
      { q: "Les tampons sont-ils conservés ?", a: "Oui, seul le design change." },
      { q: "Peut-on choisir les saisons ?", a: "Oui, selon vos temps forts." },
    ],
  },
  {
    slug: "visite-trimestrielle",
    name: "Visite trimestrielle",
    enClair: "Tous les 3 mois, on passe environ 45 minutes chez vous pour faire le point.",
    steps: [
      "Bilan des chiffres du trimestre.",
      "Vérification des QR codes et de la vitrine.",
      "Formation des nouveaux employés.",
      "Ajustement de la récompense si besoin.",
      "Planning des campagnes du trimestre suivant.",
    ],
    example:
      "Lors de la visite de Smash Club, on remplace un QR de table abîmé et on forme 2 nouveaux équipiers.",
    benefits: [
      "Un suivi humain, sur place",
      "Une équipe toujours formée",
      "Un compte rendu d'une page laissé après chaque visite",
    ],
    faq: [
      { q: "Faut-il fermer pendant la visite ?", a: "Non, on s'adapte à vos heures calmes." },
      {
        q: "Que contient le compte rendu ?",
        a: "Les chiffres, ce qui a été fait et le plan du trimestre suivant.",
      },
    ],
  },
  {
    slug: "support-prioritaire",
    name: "Support prioritaire",
    enClair: "Réponse dans la journée par WhatsApp, du lundi au vendredi de 12 h à 21 h.",
    steps: [
      "Vous nous écrivez sur WhatsApp.",
      "Votre demande passe en priorité.",
      "Réponse dans la journée.",
    ],
    example:
      "Le téléphone de scan de Smash Club est cassé un vendredi : on aide l'équipe à se connecter sur un autre appareil dans la journée.",
    benefits: [
      "Une réponse dans la journée",
      "Un interlocuteur qui vous connaît",
      "Directement sur WhatsApp",
    ],
    faq: [
      {
        q: "Et avec Essentiel ou Pro ?",
        a: "Support standard par WhatsApp, réponse sous 48 h ouvrées.",
      },
      {
        q: "Le week-end ?",
        a: "Le support est fermé le week-end : votre message est traité dès le lundi, à partir de 12 h.",
      },
    ],
  },
  {
    slug: "formation-equipe",
    name: "Formation de l'équipe",
    enClair:
      "Sur place : 30 minutes avec l'équipe pour savoir scanner et parler de la carte, puis 10 minutes avec le gérant.",
    steps: [
      "On fixe un créneau calme.",
      "On forme l'équipe en 30 minutes.",
      "On prend 10 minutes avec le gérant pour le tableau de bord.",
      "On laisse un mémo plastifié au comptoir.",
    ],
    example:
      "Chez Smash Club, la formation a lieu à 15 h. À 15 h 40, toute l'équipe sait scanner et dire la phrase clé.",
    benefits: [
      "Une équipe à l'aise dès le premier jour",
      "Plus d'inscriptions grâce à la bonne phrase",
      "Un mémo pour les nouveaux",
    ],
    faq: [
      { q: "Et si un employé arrive plus tard ?", a: "Le mémo au comptoir suffit pour démarrer." },
      { q: "Combien de personnes ?", a: "Toute l'équipe présente." },
    ],
    sections: [
      {
        title: "Le programme : 30 minutes avec l'équipe + 10 minutes avec le gérant",
        items: [
          {
            label: "5 min",
            title: "Pourquoi",
            text: "À quoi sert la carte et pourquoi elle fait revenir les clients.",
          },
          {
            label: "10 min",
            title: "Le scan",
            text: "Installation de l'appli, connexion, +1 tampon, entraînement sur carte test.",
          },
          {
            label: "5 min",
            title: "Valider une récompense",
            text: "Comment offrir la récompense au bon moment.",
          },
          {
            label: "5 min",
            title: "La phrase à dire",
            text: "« Vous avez notre carte de fidélité ? Scannez ici : votre 10e passage est récompensé. »",
          },
          {
            label: "5 min",
            title: "Les cas pièges",
            text: "Téléphone du client à plat → recherche par nom ou numéro. Erreur de tampon. Client sans smartphone.",
          },
          {
            label: "+10 min",
            title: "Gérant",
            text: "Prise en main du tableau de bord + mémo plastifié laissé au comptoir.",
          },
        ],
      },
    ],
  },
  {
    slug: "presentoir-comptoir",
    name: "Présentoir comptoir",
    enClair: "Un présentoir en plexi avec QR code, posé près de la caisse.",
    steps: [
      "On imprime le QR de votre carte.",
      "On installe le présentoir près de la caisse.",
      "Le client scanne en attendant sa commande.",
    ],
    example:
      "Chez Smash Club, le présentoir est posé à côté du terminal de paiement : chaque client le voit en payant.",
    benefits: ["Visible au meilleur moment", "Inscription en un scan", "Rien à expliquer"],
    faq: [
      { q: "Faut-il le brancher ?", a: "Non, c'est un simple support." },
      {
        q: "Et s'il est abîmé ?",
        a: "Prévenez-nous : en cas de défaut, on le remplace gratuitement. Sinon, un nouveau présentoir est facturé au tarif de l'option.",
      },
    ],
  },
  {
    slug: "chevalet-grave",
    name: "Chevalet gravé",
    enClair: "Un chevalet en plexi gravé à votre logo, finition haut de gamme.",
    steps: [
      "On récupère votre logo.",
      "On le grave sur le plexi avec le QR.",
      "On l'installe au comptoir.",
    ],
    example:
      "Smash Club remplace son présentoir par un chevalet gravé à son logo, assorti à la déco.",
    benefits: ["Un rendu premium", "Votre marque mise en avant", "Durable et facile à nettoyer"],
    faq: [
      { q: "Est-ce inclus dans toutes les formules ?", a: "Non, uniquement dans Premium." },
      { q: "Peut-on en avoir plusieurs ?", a: "Oui, sur demande." },
    ],
  },
  {
    slug: "qr-de-table",
    name: "QR de table",
    enClair:
      "Des plaques QR adhésives sur les tables, le comptoir ou les postes : le client s'inscrit pendant qu'il attend.",
    steps: [
      "On prépare les plaques selon vos tables ou vos postes.",
      "On les colle avec vous aux bons emplacements.",
      "Le client scanne pendant qu'il attend ou qu'il mange.",
    ],
    example:
      "Smash Club a 12 tables : 12 plaques collées en 15 minutes, et les inscriptions augmentent pendant le service.",
    benefits: [
      "Le client a le temps de s'inscrire",
      "Résiste à l'eau et aux UV",
      "Discret et efficace",
    ],
    faq: [
      {
        q: "Ça résiste aux produits ménagers ?",
        a: "Oui à l'eau et à un nettoyage normal ; évitez les produits abrasifs.",
      },
      {
        q: "Quelles couleurs ?",
        a: "5 finitions : noir, blanc, or, argent ou bronze, avec la phrase de votre choix gravée sous le QR (15 caractères max).",
      },
      {
        q: "Je n'ai pas de tables ?",
        a: "On les pose là où vos clients attendent : comptoir, caisse, miroir, salle d'attente.",
      },
      {
        q: "Ça abîme les tables ?",
        a: "On vous montre une plaque et on choisit l'emplacement avec vous avant la pose.",
      },
    ],
  },
  {
    slug: "vitrophanie",
    name: "Vitrophanie",
    enClair:
      "Un autocollant sur votre vitrine, lisible de la rue (20 × 20 cm ; 40 × 40 cm et plus en Premium).",
    steps: [
      "On crée le visuel à vos couleurs.",
      "On l'imprime au bon format.",
      "On le pose sur la vitrine.",
    ],
    example:
      "Sur la vitrine de Smash Club : « Votre 10e menu offert — scannez ici ». La file d'attente s'inscrit avant même d'entrer.",
    benefits: ["Attire les passants", "Occupe la file d'attente", "Visible 24 h sur 24"],
    faq: [
      { q: "Ça se retire facilement ?", a: "Oui, on utilise un adhésif enlevable." },
      { q: "Peut-on choisir l'emplacement ?", a: "Oui, on le décide ensemble." },
    ],
  },
  {
    slug: "flyers",
    name: "Flyers",
    enClair:
      "Glissés dans les sacs à emporter et les livraisons pour faire inscrire de nouveaux clients.",
    steps: [
      "On crée le flyer recto-verso.",
      "On vous livre le stock.",
      "Votre équipe en glisse un dans chaque sac.",
    ],
    example:
      "Chaque commande en livraison de Smash Club contient un flyer « Votre 10e menu offert ». Les clients livrés s'inscrivent depuis chez eux.",
    benefits: [
      "Toucher les clients livrés",
      "Recto : l'accroche et le QR",
      "Verso : 3 étapes simples",
    ],
    faq: [
      {
        q: "Combien de flyers ?",
        a: "200 inclus dans Pro, 500 dans Premium ; ensuite, nouveau lot de 500 (39 €) sur demande.",
      },
      {
        q: "Et quand le stock est vide ?",
        a: "Prévenez-nous pour un nouveau lot de 500 (39 €).",
      },
    ],
  },
];

export type Offer = {
  slug: OfferSlug;
  name: string;
  tagline: string;
  price: string;
  setup: string;
  idealFor: string;
  installation: string[];
  services: string[];
  featured?: boolean;
};

// Tarifs mégalopole (prix nets : TVA non applicable, art. 293 B du CGI). Modifiez-les ici : toutes les pages se mettent à jour.
export const offers: Offer[] = [
  {
    slug: "essentiel",
    name: "Essentiel",
    tagline: "Démarrer simplement",
    price: "39 €",
    setup: "149 €",
    idealFor: "Idéal pour un petit commerce qui veut démarrer simplement.",
    installation: [
      "Création du design de la carte et paramétrage",
      "1 présentoir QR en plexi pour le comptoir",
      "1 sticker vitrine 20 × 20 cm",
      "Formation sur place (30 min avec l'équipe + 10 min avec le gérant)",
    ],
    services: [
      "carte-personnalisee",
      "scans-illimites",
      "tableau-de-bord",
      "rappels-automatiques",
      "formation-equipe",
      "presentoir-comptoir",
      "vitrophanie",
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "On fait revenir vos clients",
    price: "59 €",
    setup: "199 €",
    idealFor: "Idéal si vous voulez que quelqu'un s'occupe de faire revenir vos clients.",
    installation: [
      "Toute l'installation Essentiel",
      "4 plaques QR adhésives (tables, comptoir, postes)",
      "200 flyers",
      "Réglage des relances automatiques",
    ],
    services: [
      "carte-personnalisee",
      "scans-illimites",
      "tableau-de-bord",
      "rappels-automatiques",
      "relances-et-anniversaires",
      "campagnes",
      "bilan-mensuel",
      "formation-equipe",
      "presentoir-comptoir",
      "qr-de-table",
      "vitrophanie",
      "flyers",
    ],
    featured: true,
  },
  {
    slug: "premium",
    name: "Premium",
    tagline: "Le suivi complet",
    price: "89 €",
    setup: "299 €",
    idealFor:
      "Idéal si vous avez un fort passage ou plusieurs espaces et que vous voulez un suivi complet et une présence sur les réseaux.",
    installation: [
      "Création de votre carte",
      "Chevalet plexi gravé à votre logo pour le comptoir",
      "Plaques QR adhésives sur vos tables ou postes (jusqu'à 12)",
      "Grande vitrophanie (40 × 40 cm et plus)",
      "500 flyers",
      "Réglage des relances automatiques",
      "Formation sur place (30 min avec l'équipe + 10 min avec le gérant)",
    ],
    services: [
      "carte-personnalisee",
      "scans-illimites",
      "tableau-de-bord",
      "rappels-automatiques",
      "relances-et-anniversaires",
      "campagnes",
      "bilan-mensuel",
      "video-reseaux",
      "design-saisonnier",
      "visite-trimestrielle",
      "support-prioritaire",
      "formation-equipe",
      "chevalet-grave",
      "qr-de-table",
      "vitrophanie",
      "flyers",
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const getOffer = (slug: string) => offers.find((o) => o.slug === slug);
export const offersIncluding = (slug: string) => offers.filter((o) => o.services.includes(slug));
