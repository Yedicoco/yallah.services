/* ══════════════════════════════════════════════════════
   YALLAH SERVICES — Coordonnées centralisées

   · whatsappFoyers    → numéro affiché aux familles (site foyers)
   · whatsappCandidats → numéro dédié au recrutement de personnel
   · email             → réception des références des candidats

   Version serveur / build : ces valeurs sont injectées depuis les
   variables d'environnement WHATSAPP_FOYERS, WHATSAPP_CANDIDATS
   (ou WHATSAPP_NUMBER) et CONTACT_EMAIL.
══════════════════════════════════════════════════════ */
window.YS_CONFIG = {
  /* Familles / foyers — format international sans « + » ni espaces */
  whatsappFoyers: '212691733585',
  whatsappFoyersAffiche: '+212 691 733 585',

  /* Candidats / personnel — numéro dédié au recrutement */
  whatsappCandidats: '212710359446',
  whatsappCandidatsAffiche: '+212 710 359 446',

  /* Adresse de réception des références */
  email: 'servicesyallah@gmail.com',

  /* Coordonnées de l'agence */
  agence: 'Yallah Services',
  ville: 'Casablanca',

  /* Mode du site : 'auto' (détection), 'serveur' ou 'statique'.
     build-site.js force 'statique' dans le site prêt à publier. */
  mode: 'auto'
};
