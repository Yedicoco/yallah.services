# Prospection LinkedIn B2C — préparation locale

La recherche peut découvrir automatiquement des profils publics indexés via l’API de recherche Brave, sans connexion au compte LinkedIn ni exploration automatisée de LinkedIn. Le suivi de campagne reste local : aucun clic ni envoi automatique. La simulation est à faire avant toute recherche réelle, toute campagne et chaque série d’actions. L'opérateur vérifie ensuite chaque profil et chaque conversation, envoie manuellement sur LinkedIn si c'est approprié, puis enregistre immédiatement l'action. Une intégration d'envoi effectif nécessiterait un moyen autorisé par LinkedIn, ses permissions et une validation séparée. Ne pas utiliser de scripts de navigation imitant l'humain pour contourner les contrôles de la plateforme.

**Promesses à valider :** le brief évoque conciergerie, démarches, maintenance et gestion immobilière ; la [fiche entreprise](../../contenu/fiche-entreprise.md) décrit la recherche et la mise en relation de personnel. Les textes opérationnels restent dans ce périmètre. Ne réintroduire les autres prestations qu'après validation de l'offre réelle et des zones. Les termes « de confiance », « en toute sécurité », « prise en charge complète » et les garanties de réactivité doivent aussi être vérifiés, pas présumés. L'URL fournie est un profil `/in/`, pas nécessairement une page entreprise.

## 0. Recherche autonome de profils publics

`recherche.py` interroge l’index de recherche Brave, **pas l’API LinkedIn**. Il soumet huit requêtes prédéfinies (quatre villes marocaines et quatre zones MRE), collecte les URL publiques `/in/` en supprimant les doublons déjà connus et les place dans une file privée. Aucune invitation n’est envoyée. Les résultats dépendent de l’indexation et de la syntaxe du moteur : certains profils seront absents, hors cible, en double sous un autre slug ou obsolètes ; seule la première page de résultats est utilisée. Le segment associé est celui de la recherche, **pas une caractéristique vérifiée** du profil. Ne pas déduire l’origine d’une personne de son nom, de son apparence ou d’un résultat de recherche.

### Installation et premier lancement

Il faut un compte [Brave Search API](https://brave.com/search/api/) et une clé avec accès à Web Search. Les requêtes peuvent être facturées : consultez les tarifs et les conditions du fournisseur avant activation. La clé reste dans votre environnement privé, jamais dans le dépôt ou la conversation. Depuis la racine du projet :

```sh
# Simulation : affiche les 8 requêtes, sans connexion ni écriture.
python3 outils/linkedin/recherche.py chercher

# Définir la clé sans l'afficher : elle est demandée dans le terminal local.
read -rs BRAVE_SEARCH_API_KEY; export BRAVE_SEARCH_API_KEY; echo

# Recherche réelle : jusqu'à 8 appels API, sans invitation ni message.
python3 outils/linkedin/recherche.py chercher --executer
python3 outils/linkedin/recherche.py lister
```

La ligne `read` attend votre saisie puis Entrée, sans afficher la clé (Bash). Elle ne la conserve que dans le terminal courant. Sur une nouvelle session, il faudra la redéfinir. En cas d'erreur API, le programme s'arrête sans enregistrer de résultats partiels ; les appels déjà effectués peuvent néanmoins être facturés.

Vérifiez manuellement chaque profil sur LinkedIn, son adéquation B2C, son prénom, son segment, le contexte et les contacts antérieurs. Ajouter un profil pertinent à la campagne :

```sh
python3 outils/linkedin/recherche.py valider 'https://www.linkedin.com/in/profil-reel/' --prenom Amal --segment actif
# Ou, pour exclure un résultat inapproprié de la file :
python3 outils/linkedin/recherche.py ecarter 'https://www.linkedin.com/in/profil-reel/'
# Ensuite, prévisualiser la campagne :
python3 outils/linkedin/campagne.py simuler
```

Un profil découvert ne devient jamais automatiquement une invitation : il faut le valider. Les URL déjà présentes, validées ou écartées ne sont pas reproposées, sous réserve des changements de slug. Le fichier des découvertes est `~/yallah-linkedin-data/decouvertes.json` ; il contient l’URL, le titre indexé, la catégorie de recherche, la date et le statut. Gardez-le privé et appliquez les mêmes règles de conservation que pour la base. La validation enregistre le prénom et le segment vérifiés dans la base de campagne. Un seul opérateur/processus à la fois : aucune synchronisation entre machines, copies ou campagnes extérieures.

### Recherche quotidienne sans intervention (facultatif)

Après avoir testé la simulation et un lancement réel, configurez sur une machine ou un serveur **toujours allumé** une tâche planifiée. Sous Linux, créer `~/yallah-linkedin-data/brave.env` avec une ligne `BRAVE_SEARCH_API_KEY=...` dans un éditeur privé, puis `chmod 600 ~/yallah-linkedin-data/brave.env`. Ne partagez pas ce fichier. Dans `crontab -e`, ajoutez par exemple :

```cron
0 9 * * * /bin/sh -c 'set -a; . "$HOME/yallah-linkedin-data/brave.env"; set +a; cd /home/user/yallah.services && python3 outils/linkedin/recherche.py chercher --executer >> "$HOME/yallah-linkedin-data/recherche.log" 2>&1'
```

Adapter le chemin du projet à la machine. L'heure suit le fuseau du serveur ; huit appels au maximum sont prévus par exécution, avec facturation possible. La tâche ne démarre pas toute seule sans cette configuration, ne tourne pas lorsque la machine est éteinte et ne valide ni ne contacte les personnes. Surveiller le journal, les coûts et les quotas fournisseur ; retirer la ligne du crontab pour arrêter. Ne pas lancer plusieurs tâches simultanées. L’environnement Arena peut ne pas avoir accès à l’API externe ou ne pas rester actif : utiliser une machine ayant accès à Brave pour l’exécution planifiée.

## 1. Sélection manuelle des particuliers

En complément ou à la place de la découverte automatique, utiliser les recherches de LinkedIn et ses filtres personnes et localisation ; adapter la syntaxe selon les possibilités du compte. Les mots-clés ne prouvent ni un besoin familial ni l'origine d'une personne. Exclure les entreprises, candidats à un emploi et profils non pertinents. Ne pas supposer qu'une personne est MRE sur la base d'un nom ou d'une apparence ; ne classer `mre` que sur une indication volontaire pertinente et publique. Ne collecter aucune information sensible sur les proches.

- **Actifs au Maroc** : `("Directeur" OR "Manager" OR "Ingénieur" OR "Consultant" OR "Médecin" OR "Architecte") AND ("Casablanca" OR "Rabat" OR "Marrakech" OR "Tanger")`. Filtrer les personnes et, au besoin, les villes séparément ; ajouter « avocat » comme terme de recherche pertinent.
- **MRE** : `("Originaire du Maroc" OR "Marocain" OR "Marocaine" OR "Franco-Marocain") AND ("Paris" OR "Île-de-France" OR "Bruxelles" OR "Montréal" OR "Dubai")`. Tester aussi « Dubaï » et appliquer les filtres de localisation ; ne pas présumer que les personnes ont des parents ou des biens au Maroc.

Constituer manuellement un CSV **privé, hors du dépôt et de tout dossier publié** (UTF-8, séparateur virgule). Exemple fictif :

```csv
profile_url,first_name,segment
https://www.linkedin.com/in/exemple-fictif-1/,Amal,actif
https://www.linkedin.com/in/exemple-fictif-2/,Samir,mre
```

Utiliser les URL de profils individuels `/in/`, pas les URL de recherche ou d'entreprise. Les paramètres et variantes de casse sont normalisés. Un changement de slug ou plusieurs URL pour la même personne peuvent échapper au dédoublonnage : vérification manuelle indispensable, notamment avec d'autres fichiers ou campagnes.

## 2. Simuler, puis suivre manuellement

Prérequis : Python 3.9+ et la base de fuseaux horaires système (ou le paquet `tzdata` si nécessaire). Depuis la racine du dépôt :

```sh
python3 outils/linkedin/campagne.py importer ~/prospects.csv
python3 outils/linkedin/campagne.py simuler
```

La simulation affiche les textes et les actions possibles sans toucher à la base ni contacter LinkedIn. Le prénom doit être vérifié et la note d'invitation reste strictement sous 300 caractères. Le message de bienvenue est adapté au segment ; il ne présume pas l'existence d'un besoin. Après **chaque** action réellement effectuée ou observée, l'enregistrer (URL entre guillemets) :

```sh
python3 outils/linkedin/campagne.py enregistrer invitation 'https://www.linkedin.com/in/exemple-fictif-1/'
# Lorsque l'acceptation est observée :
python3 outils/linkedin/campagne.py enregistrer acceptation 'https://www.linkedin.com/in/exemple-fictif-1/'
# Après au moins 24 h, simuler puis envoyer manuellement si pertinent :
python3 outils/linkedin/campagne.py simuler
python3 outils/linkedin/campagne.py enregistrer bienvenue 'https://www.linkedin.com/in/exemple-fictif-1/'
# Après au moins 4 jours supplémentaires, si aucune réponse : simuler, puis éventuellement envoyer et enregistrer :
python3 outils/linkedin/campagne.py enregistrer relance 'https://www.linkedin.com/in/exemple-fictif-1/'
# Dès qu'une réponse est observée, ou en cas de refus / opposition / profil non pertinent :
python3 outils/linkedin/campagne.py enregistrer reponse 'https://www.linkedin.com/in/exemple-fictif-1/'
python3 outils/linkedin/campagne.py enregistrer stop 'https://www.linkedin.com/in/exemple-fictif-2/'
```

Une seule invitation, un seul message de bienvenue et une seule relance par URL ; aucune suite après `reponse` ou `stop`. Une réponse doit être saisie dès sa découverte : l'outil ne lit pas la messagerie. Les 24 h sont comptées à partir de l'acceptation **enregistrée** ; les 4 jours à partir de l'enregistrement du message de bienvenue (interprétation choisie pour J+4). Les horodatages sont en UTC ; le changement de journée des quotas suit `Africa/Casablanca`.

La simulation réserve au maximum 20 invitations et 25 messages par jour, bienvenue et relance confondues ; l'enregistrement les vérifie aussi. Ces plafonds ne sont **pas** une garantie contre une restriction LinkedIn et ne reflètent pas nécessairement les limites effectives du compte. Ils ne comptent que les actions enregistrées dans cette base : déduire manuellement toute activité réalisée ailleurs, ne pas utiliser plusieurs copies/opérateurs simultanément, et ne jamais envoyer si la limite globale serait dépassée. L'outil n'impose pas les délais de clics de 4–8 secondes ni d'intervalle de 2–5 minutes entre profils : il n'effectue pas de clics ; ces délais ne garantissent pas l'absence de bannissement. Respecter les règles et limites courantes de LinkedIn.

Attention : l'enregistrement n'effectue ni ne vérifie l'envoi. Si le suivi est oublié, ou si une réponse est reçue mais non enregistrée, la simulation peut proposer une action indue. Avant chaque envoi, reconsulter LinkedIn, les réponses, les quotas globaux, l'identité et la pertinence du texte. Ne pas utiliser l'outil pour recontacter un prospect déjà traité hors de cette base ; importer et suivre séparément l'historique existant avant de démarrer, ou l'exclure. Les événements saisis sont datés du moment de leur enregistrement ; l'import d'historique n'est pas automatisé.

## 3. Données et mesure

La base JSON est par défaut `~/yallah-linkedin-data/prospects.json` (répertoire créé privé ; fichier remplacé atomiquement avec permissions privées). Ne la placer ni dans le dépôt, ni dans un dossier web, ni dans un stockage partagé non autorisé, y compris avec l'option `--base`. Ne pas publier les CSV, impressions ou sorties de simulation. Limiter l'accès et la durée de conservation, supprimer les données devenues inutiles ou sur demande, et vérifier les obligations applicables (notamment loi 09-08/CNDP et, selon les personnes concernées, RGPD) avant prospection. Les informations personnelles ne sont pas chiffrées par l'outil.

Mesurer sur des agrégats : invitations envoyées, acceptations / invitations, réponses / messages, besoins qualifiés / réponses et demandes converties, en précisant la période et le décalage entre envoi et réponse. Surveiller refus, demandes d'arrêt et restrictions ; suspendre et revoir la campagne en cas de signaux négatifs. Ne pas collecter d'informations familiales détaillées pour le suivi.

Tests : `python3 -m unittest discover -s outils/linkedin -v`.
