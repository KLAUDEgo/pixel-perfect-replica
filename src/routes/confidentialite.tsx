import { createFileRoute } from "@tanstack/react-router";
import { COMPANY } from "@/data/content";
import { LegalPage, LegalSection } from "@/components/legal";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — mégalopole" },
      {
        name: "description",
        content: "Comment mégalopole collecte, utilise et protège vos données personnelles.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <LegalPage
      title="confidentialité"
      crumb="Confidentialité"
      intro="En bref : on collecte le minimum, uniquement pour vous répondre et travailler avec vous. On ne vend et ne partage jamais vos données à des fins commerciales."
    >
      <LegalSection title="1. Qui est responsable de vos données ?">
        <p>
          {COMPANY.legalName} EI ({COMPANY.brand}), nom commercial « {COMPANY.tradeName} »,{" "}
          {COMPANY.address} — {COMPANY.email}.
        </p>
      </LegalSection>
      <LegalSection title="2. Quelles données ?">
        <ul>
          <li>
            <b>Formulaire de contact (via WhatsApp ou e-mail)</b> : nom, commerce, ville, téléphone,
            message.
          </li>
          <li>
            <b>Devis en ligne</b> : nom, nom et adresse (facultative) du commerce, ville, téléphone,
            e-mail, formule et options choisies.
          </li>
          <li>
            <b>Pack réseaux sociaux</b> : pour gérer vos comptes, nous accédons aux messages et
            commentaires que vos clients y laissent. Nous les utilisons uniquement pour y répondre
            en votre nom, sans les copier ni les réutiliser ailleurs. Les accès que vous nous
            confiez restent confidentiels et ne servent qu'à cette mission ; ils prennent fin dès
            que vous les retirez ou que le Pack s'arrête.
          </li>
          <li>
            <b>Clients</b> : en plus, les informations nécessaires à la facturation et au
            prélèvement (coordonnées de l'établissement, SIRET, mandat SEPA).
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Pourquoi ?">
        <ul>
          <li>Vous recontacter et vous envoyer votre devis (mesures précontractuelles).</li>
          <li>Exécuter le contrat : installation, support, facturation (exécution du contrat).</li>
          <li>Tenir notre comptabilité (obligation légale).</li>
        </ul>
        <p>Aucune prospection automatisée, aucune revente, aucun profilage.</p>
      </LegalSection>
      <LegalSection title="4. Qui y a accès ?">
        <p>
          Uniquement nous, et les prestataires techniques strictement nécessaires, qui agissent pour
          notre compte :
        </p>
        <ul>
          <li>
            <b>WhatsApp</b> (WhatsApp Ireland Ltd, groupe Meta) : échanges avec vous par messagerie,
            si vous nous contactez par ce moyen.
          </li>
          <li>
            <b>Google</b> (Gmail, Google Ireland Ltd) : notre messagerie électronique.
          </li>
          <li>
            <b>Web3Forms</b> (Web3Creative, Inde) : acheminement des demandes envoyées depuis le
            site. Données chiffrées, hébergées chez Amazon Web Services, conservées au maximum 3
            ans. Le transfert hors de l'Union européenne est encadré par les garanties
            contractuelles proposées par ce prestataire.
          </li>
          <li>
            <b>Lovable</b> (Lovable Labs Sweden AB, Suède) : hébergement du site.
          </li>
          <li>
            <b>Plateforme de fidélité</b> (pour nos clients uniquement) : prestataire technique qui
            fait fonctionner les cartes de fidélité et le tableau de bord, dont l'identité est
            communiquée sur simple demande.
          </li>
        </ul>
        <p>
          Certains de ces prestataires, ou leurs propres sous-traitants, peuvent traiter des données
          hors de l'Union européenne, notamment aux États-Unis. Ces transferts sont alors encadrés
          par une décision d'adéquation de la Commission européenne (par exemple le Data Privacy
          Framework UE–États-Unis, pour les entreprises certifiées) ou par d'autres garanties
          appropriées au sens du RGPD. Vous pouvez nous demander plus d'informations à ce sujet.
        </p>
      </LegalSection>
      <LegalSection title="5. Combien de temps ?">
        <ul>
          <li>
            Prospects (demande de contact ou devis sans suite) : 3 ans après le dernier contact.
          </li>
          <li>Clients : pendant le contrat, puis 3 ans.</li>
          <li>Factures et pièces comptables : 10 ans (obligation légale).</li>
        </ul>
      </LegalSection>
      <LegalSection title="6. Vos droits">
        <p>
          Vous pouvez accéder à vos données, les rectifier, les effacer, vous opposer à leur
          traitement, en limiter l'usage ou les récupérer (portabilité). Écrivez-nous à{" "}
          <b>{COMPANY.email}</b> : on répond sous un mois maximum.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la CNIL
          (cnil.fr).
        </p>
      </LegalSection>
      <LegalSection title="7. Cookies">
        <p>
          Aucun cookie publicitaire ni de mesure d'audience. Votre panier de devis est seulement
          gardé dans votre navigateur (stockage local) : strictement nécessaire au service, il est
          exempté de consentement. Vous pouvez l'effacer à tout moment en vidant les données du
          site.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
