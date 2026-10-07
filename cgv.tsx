import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPANY, HAS_PHONE, LAUNCH_OFFER, POLICY, QUOTE_CONFIG } from "@/data/content";
import { LegalPage, LegalSection } from "@/components/legal";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title: "Conditions générales de vente — mégalopole" },
      { name: "description", content: "Conditions générales de vente de mégalopole." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cgv,
});

function Cgv() {
  return (
    <LegalPage
      title="conditions générales de vente"
      crumb="CGV"
      intro="Ces conditions s'appliquent aux professionnels (restaurants, commerces) qui souscrivent à nos services. Elles sont simples : pas d'engagement, pas de frais cachés."
    >
      <LegalSection title="1. Qui sommes-nous ?">
        <p>
          {COMPANY.legalName} EI, nom commercial « {COMPANY.tradeName} » (marque {COMPANY.brand}) —{" "}
          {COMPANY.address} — {COMPANY.rcs} — SIRET {COMPANY.siret} — {COMPANY.email}
          {HAS_PHONE && <> — {COMPANY.phone}</>}. Ci-après « nous ».
        </p>
      </LegalSection>
      <LegalSection title="2. Ce que nous vendons">
        <p>
          La mise en place et le fonctionnement d'un programme de fidélité digital (carte de
          fidélité dans le téléphone de vos clients, tableau de bord, supports en magasin), sous
          forme d'un abonnement (formules Essentiel, Pro ou Premium) et d'options ponctuelles,
          telles que décrites sur le site et dans le devis.
        </p>
      </LegalSection>
      <LegalSection title="3. Devis et commande">
        <p>
          Le devis est gratuit et valable {QUOTE_CONFIG.validityDays} jours. La commande est ferme
          lorsque le devis est signé (avec la mention « bon pour accord ») et le mandat de
          prélèvement SEPA remis. La signature du devis vaut acceptation des présentes conditions.
          Un devis non signé ne vous engage à rien.
        </p>
      </LegalSection>
      <LegalSection title="4. Prix">
        <p>
          Les prix sont ceux du devis signé, exprimés en euros et nets. TVA non applicable, art. 293
          B du CGI : le prix indiqué est le prix que vous payez.
        </p>
        <p>
          Chaque établissement supplémentaire bénéficie de −{QUOTE_CONFIG.extraSiteDiscountPercent}
          {"\u00a0"}% sur son abonnement ; son installation fait l'objet d'un devis séparé. Toute
          évolution de nos tarifs vous est annoncée au moins un mois à l'avance ; vous restez libre
          de résilier.
        </p>
        {LAUNCH_OFFER.enabled && (
          <>
            <p>
              <b>Offre de lancement</b> : −{LAUNCH_OFFER.discountPercent} % sur les frais
              d'installation, réservée aux {LAUNCH_OFFER.spots} premiers commerces signés. Elle ne
              s'applique pas aux options. Elle peut prendre fin à tout moment, sans effet sur les
              devis déjà émis : la remise figurant sur un devis reste garantie s'il est signé
              pendant sa durée de validité.
            </p>
            <p>
              En contrepartie, le client autorise {COMPANY.brand} à prendre et publier une photo de
              sa devanture ou de son comptoir, sans personne identifiable, sur son site et ses
              réseaux sociaux, pendant 3 ans, à titre gratuit et non exclusif. Le client peut en
              demander le retrait à tout moment ; la remise reste acquise.
            </p>
          </>
        )}
      </LegalSection>
      <LegalSection title="5. Paiement">
        <ul>
          <li>Frais d'installation et options : payables à la signature.</li>
          <li>Abonnement mensuel : prélevé chaque mois, d'avance, par prélèvement SEPA.</li>
          <li>
            Abonnement annuel : {QUOTE_CONFIG.annualMonthsPaid} mois payés au lieu de 12, réglés en
            une fois à la signature puis à chaque date anniversaire. L'année réglée n'est pas
            remboursée en cas de résiliation en cours d'année ; la carte de fidélité reste active
            jusqu'au terme de l'année payée.
          </li>
        </ul>
        <p>Aucun escompte n'est accordé en cas de paiement anticipé.</p>
        <p>
          En cas de retard de paiement, des pénalités sont dues de plein droit au taux de
          refinancement de la BCE majoré de 10 points, ainsi qu'une indemnité forfaitaire pour frais
          de recouvrement de 40 € (art. L441-10 du Code de commerce). Après une relance restée sans
          réponse pendant 15 jours, le service peut être suspendu.
        </p>
      </LegalSection>
      <LegalSection title="6. Installation">
        <p>
          Tout est installé {POLICY.installDelay}, sous réserve que vous nous ayez transmis les
          éléments nécessaires (logo, récompenses souhaitées, accès à l'établissement). Les options
          sont installées {POLICY.optionDelay}.
        </p>
      </LegalSection>
      <LegalSection title="7. Durée et résiliation">
        <p>
          L'abonnement est <b>sans engagement</b>. Vous pouvez y mettre fin à tout moment, par
          e-mail ou par WhatsApp, avec un préavis de {POLICY.noticeMonths} mois. Pour l'abonnement
          annuel, voir l'article 5 : l'année réglée n'est pas remboursée et la carte de fidélité
          reste active jusqu'à son terme.
        </p>
        <p>
          Vous pouvez changer de formule à tout moment : le changement s'applique à partir du mois
          suivant.
        </p>
      </LegalSection>
      <LegalSection title="8. Matériel">
        <p>
          Les supports fournis (plaques, présentoirs, vitrophanie, flyers) deviennent la propriété
          du client dès leur paiement.
        </p>
        <p>
          Le matériel défectueux à la livraison est remplacé gratuitement ; en cas de casse ou de
          perte, il est remplacé au tarif de l'option correspondante.
        </p>
      </LegalSection>
      <LegalSection title="9. Support">
        <p>
          Support {POLICY.supportHours} : {POLICY.supportStandard} (Essentiel et Pro),{" "}
          {POLICY.supportPriority} (Premium).
        </p>
      </LegalSection>
      <LegalSection title="10. Vos engagements">
        <p>
          Vous nous fournissez des informations exactes et des visuels dont vous avez les droits.
          Vous restez seul responsable des récompenses que vous promettez à vos clients et de leur
          respect, ainsi que du bon usage du tableau de bord par votre équipe.
        </p>
      </LegalSection>
      <LegalSection title="11. Responsabilité">
        <p>
          Nous mettons tout en œuvre pour que le service fonctionne en continu, mais une
          interruption ponctuelle (maintenance, panne d'un prestataire technique, réseau) reste
          possible. Notre responsabilité est limitée aux dommages directs et au montant payé au
          cours des 12 derniers mois.
        </p>
      </LegalSection>
      <LegalSection title="12. Données des clients finaux">
        <p>
          Pour les données des porteurs de carte, le client est responsable du traitement et nous
          agissons comme sous-traitant (art. 28 RGPD) : traitement sur instruction uniquement,
          confidentialité, recours à un sous-traitant ultérieur (plateforme technique) soumis aux
          mêmes obligations, assistance pour les demandes d'exercice des droits, notification des
          violations dans les meilleurs délais, suppression des données en fin de contrat. Ces
          données ne sont ni vendues ni partagées avec d'autres commerces.
        </p>
        <p>
          Pour les données vous concernant en tant que client, voir notre{" "}
          <Link to="/confidentialite" className="underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </LegalSection>
      <LegalSection title="13. Force majeure">
        <p>
          Aucune des parties n'est responsable d'un retard ou d'une inexécution causé par un
          événement de force majeure au sens de l'article 1218 du Code civil. Les obligations
          concernées sont suspendues pendant la durée de l'événement ; s'il dure plus d'un mois,
          chaque partie peut résilier le contrat par écrit, sans indemnité.
        </p>
      </LegalSection>
      <LegalSection title="14. Litiges">
        <p>
          Ces conditions sont soumises au droit français. En cas de désaccord, nous cherchons
          d'abord une solution à l'amiable.{" "}
          <b>
            À défaut, lorsque le client a la qualité de commerçant, tout litige relatif au contrat
            relève de la compétence exclusive du tribunal de commerce de Melun.
          </b>{" "}
          Dans les autres cas, les règles de compétence de droit commun s'appliquent.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
