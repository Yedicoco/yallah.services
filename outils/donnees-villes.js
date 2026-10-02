/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Données de la matrice service × ville

   SOURCE UNIQUE de vérité pour outils/generer-pages-villes.js.
   Règles impératives :
     · aucune donnée inventée : quartiers réels, distances routières
       approximatives depuis Casablanca, tarifs repris de la grille
       officielle du site, règles commerciales réelles (ménage à la
       journée limité à Casablanca et Rabat) ;
     · tout ajout ici se retrouve automatiquement dans les pages,
       le bloc « services par ville » de l'accueil et le sitemap.
══════════════════════════════════════════════════════════════════ */
'use strict';

const VILLES = [
  {
    nom: 'Casablanca', slug: 'casablanca', km: 0,
    quartiers: ['Maârif', 'Gauthier', 'Anfa', 'Aïn Diab', 'Californie', 'Hay Hassani'],
    note: 'Yallah Services est basé à Casablanca : les demandes y sont traitées en priorité et le ménage à la journée y est disponible.'
  },
  {
    nom: 'Rabat', slug: 'rabat', km: 87,
    quartiers: ['Agdal', 'Hay Riad', 'Souissi', 'Hassan', 'Yacoub El Mansour', 'Océan'],
    note: 'Avec Casablanca, Rabat est la seule ville où le ménage ponctuel à la journée est proposé, en plus des formules logée et non logée.'
  },
  {
    nom: 'Marrakech', slug: 'marrakech', km: 240,
    quartiers: ['Guéliz', 'Hivernage', 'Targa', 'Mhamid', 'Sidi Youssef Ben Ali'],
    note: ''
  },
  {
    nom: 'Fès', slug: 'fes', km: 340,
    quartiers: ['Ville Nouvelle', 'Saïss', 'Fès el-Bali', 'Zouaghla'],
    note: ''
  },
  {
    nom: 'Tanger', slug: 'tanger', km: 340,
    quartiers: ['Centre-ville', 'Malabata', 'Iberia', 'Boukhalef', 'Marchan'],
    note: ''
  },
  {
    nom: 'Agadir', slug: 'agadir', km: 470,
    quartiers: ['Talborjt', 'Founty', 'Hay Salam', 'Dakhla', 'Cité Suisse'],
    note: ''
  },
  {
    nom: 'Meknès', slug: 'meknes', km: 300,
    quartiers: ['Hamria', 'Al Ismaïlia', 'Belle Vue', 'Bassatine'],
    note: ''
  },
  {
    nom: 'Oujda', slug: 'oujda', km: 550,
    quartiers: ['Centre-ville', 'Hay Al Qods', 'Hay Mohammadi', 'Sidi Yahya'],
    note: ''
  },
  {
    nom: 'Kénitra', slug: 'kenitra', km: 120,
    quartiers: ['Centre-ville', 'Maâmoura', 'Saknia', 'Ismailia'],
    note: ''
  },
  {
    nom: 'Salé', slug: 'sale', km: 90,
    quartiers: ['Tabriquet', 'Sala Al Jadida', 'Bettana', 'Hay Rahma'],
    note: ''
  },
  {
    nom: 'Tétouan', slug: 'tetouan', km: 320,
    quartiers: ['Centre-ville', 'Ensanche', 'Mahanech', 'Azla'],
    note: ''
  }
];

const SERVICES = [
  {
    slug: 'femme-menage', nom: 'Femme de ménage', article: 'une femme de ménage',
    image: 'assets/img/pack-menage.jpg',
    lead: 'Vous recherchez une personne sérieuse pour entretenir votre maison, villa ou appartement ? Yallah Services vous accompagne dans la recherche d’un profil de ménage adapté à votre quotidien.',
    cartes: [
      ['Entretien quotidien', 'Sols, chambres, cuisine, salles de bains, rangement et entretien courant selon vos priorités.'],
      ['Repassage & linge', 'Une aide organisée pour le linge, le repassage et le rangement, selon le fonctionnement de votre foyer.'],
      ['Logée ou non logée', 'Nous vous aidons à préciser les horaires et les conditions de la formule qui correspond à votre maison.']
    ],
    tarifs: [
      ['Ménage simple dans villa', '4 500'],
      ['Ménage simple dans mini villa', '4 000'],
      ['Ménage dans appartement', '3 500'],
      ['Ménage non logée', '600 / semaine']
    ],
    faq: [
      ['Quel type de femme de ménage proposez-vous ?', 'Des profils adaptés à l’entretien de maison ou appartement, au repassage, au rangement et aux besoins complémentaires convenus avec le foyer.'],
      ['La formule peut-elle être logée ou non logée ?', 'Oui. Les deux options sont possibles selon le profil, les horaires et les conditions convenues avec la famille.']
    ]
  },
  {
    slug: 'nounou', nom: 'Nounou', article: 'une nounou',
    image: 'assets/img/pack-nounou.jpg',
    lead: 'Confier ses enfants demande une confiance totale. Nous cherchons pour vous une nounou douce, patiente et expérimentée, selon l’âge et le nombre d’enfants.',
    cartes: [
      ['Garde et sécurité', 'Surveillance attentive, repas et sieste surveillés, gestes du quotidien respectés.'],
      ['Jeux et apprentissage', 'Activités éducatives, sorties d’école et accompagnement selon vos consignes.'],
      ['Logée ou non logée', 'Formule adaptée à votre organisation : présence continue ou interventions en journée.']
    ],
    tarifs: [
      ['Nounou d’un enfant', '3 500'],
      ['Nounou d’un enfant + ménage', '4 000'],
      ['Nounou de 2 enfants avec ménage', '4 500 / 5 000'],
      ['Nounou de 3 enfants', '4 500'],
      ['Nounou de 3 enfants + ménage', '5 000']
    ],
    faq: [
      ['Comment choisissez-vous les nounous ?', 'Sur l’expérience de garde, des références vérifiables et un entretien approfondi avant toute présentation à un foyer.'],
      ['Peut-elle accompagner les sorties d’école ?', 'Oui, selon le planning convenu : sorties d’école, activités et retour à la maison font partie des missions possibles.']
    ]
  },
  {
    slug: 'cuisiniere', nom: 'Cuisinière', article: 'une cuisinière',
    image: 'assets/img/pack-cuisine.jpg',
    lead: 'Pour une cuisine familiale quotidienne ou des repas plus élaborés, nous vous présentons une cuisinière dont le niveau et les spécialités correspondent à vos habitudes.',
    cartes: [
      ['Cuisine marocaine et européenne', 'Plats familiaux quotidiens, tajines et recettes européennes selon le profil présenté.'],
      ['Hygiène et organisation', 'Propreté de la cuisine, gestion des cuissons et conservation des aliments.'],
      ['Courses sur demande', 'Préparation des listes et gestion des courses selon ce que vous convenez ensemble.']
    ],
    tarifs: [
      ['Cuisine simple', '4 000'],
      ['Cuisine / ménage', '5 000'],
      ['Aide cuisine', '3 500'],
      ['Aide cuisine / ménage', '4 000']
    ],
    faq: [
      ['La cuisinière peut-elle aussi faire le ménage ?', 'Oui : les formules cuisine / ménage et aide cuisine / ménage combinent les deux missions, avec un salaire ajusté.'],
      ['Comment connaître son niveau de cuisine ?', 'Nous précisons les spécialités et l’expérience du profil avant la mise en relation, et vous validez après la rencontre.']
    ]
  },
  {
    slug: 'garde-malade', nom: 'Garde-malade', article: 'une garde-malade',
    image: 'assets/img/garde-malade.jpg',
    lead: 'Accompagner une personne âgée ou malade exige de la patience et du sérieux. Nous présentons des profils expérimentés dans l’accompagnement, avec ou sans tâches ménagères.',
    cartes: [
      ['Présence et surveillance', 'Accompagnement dans les gestes du quotidien, présence bienveillante et surveillance régulière.'],
      ['Repas et médicaments', 'Préparation des repas légers et rappel des prises selon les consignes de la famille.'],
      ['Aide ménagère incluse', 'Selon la formule, entretien du logement et du linge de la personne accompagnée.']
    ],
    tarifs: [
      ['Garde malade simple', '3 500'],
      ['Garde malade et ménage', '4 000']
    ],
    faq: [
      ['Le profil est-il formé à l’accompagnement ?', 'Nous présentons des personnes dont l’expérience d’accompagnement est vérifiée par des références contrôlables.'],
      ['Peut-elle intervenir la nuit ?', 'Les horaires et l’éventuelle présence de nuit se conviennent foyer par foyer, avant la mise en relation.']
    ]
  }
];

/* Pages déjà rédigées à la main : le générateur ne les écrase jamais. */
const PAGES_MANUELLES = new Set(['femme-menage-casablanca.html', 'nounou-casablanca.html']);

module.exports = { VILLES, SERVICES, PAGES_MANUELLES };
