import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPANY } from "@/data/content";
import { LegalPage, LegalSection } from "@/components/legal";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — mégalopole" },
      { name: "description", content: "Mentions légales du site mégalopole." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <LegalPage title="mentions légales" crumb="Mentions légales">
      <LegalSection title="Éditeur du site">
        <p>
          <b>{COMPANY.legalName} — EI</b>
          <br />
          Entrepreneur individuel (micro-entreprise), nom commercial « {COMPANY.tradeName} » (marque{" "}
          {COMPANY.brand})
          <br />
          Adresse : {COMPANY.address}
          <br />
          Immatriculation : {COMPANY.rcs}
          <br />
          SIRET : {COMPANY.siret}
          <br />
          TVA non applicable, art. 293 B du CGI
          <br />
          Téléphone : {COMPANY.phone}
          <br />
          E-mail : {COMPANY.email}
        </p>
      </LegalSection>
      <LegalSection title="Directeur de la publication">
        <p>{COMPANY.ownerName}, en qualité d'entrepreneur individuel.</p>
      </LegalSection>
      <LegalSection title="Hébergement">
        <p>
          <b>Lovable Labs Sweden AB</b>
          <br />
          Regeringsgatan 25, 111 53 Stockholm, Suède
          <br />
          Site : lovable.dev — contact : support@lovable.dev
        </p>
      </LegalSection>
      <LegalSection title="Propriété intellectuelle">
        <p>
          Les textes, visuels, logos et la marque « {COMPANY.brand} » présents sur ce site sont
          protégés. Toute reproduction, totale ou partielle, sans autorisation écrite préalable est
          interdite.
        </p>
      </LegalSection>
      <LegalSection title="Données personnelles">
        <p>
          Le traitement de vos données est décrit dans notre{" "}
          <Link to="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
      <LegalSection title="Cookies">
        <p>
          Ce site n'utilise ni cookie publicitaire ni outil de mesure d'audience. Le seul élément
          enregistré sur votre appareil est votre panier de devis, gardé dans le stockage local de
          votre navigateur pour que vous le retrouviez si vous revenez. Ce stockage est strictement
          nécessaire au service que vous demandez : il est donc exempté de consentement (art. 82 de
          la loi Informatique et Libertés). Il n'est jamais transmis tant que vous ne cliquez pas
          sur « Recevoir mon devis », et vous pouvez l'effacer à tout moment en vidant les données
          du site dans votre navigateur.
        </p>
      </LegalSection>
      <LegalSection title="Conditions de vente">
        <p>
          Nos{" "}
          <Link to="/cgv" className="underline">
            conditions générales de vente
          </Link>{" "}
          s'appliquent à toute commande.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
