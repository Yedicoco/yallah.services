# Prospection LinkedIn B2C — préparation locale

La recherche peut découvrir automatiquement des profils publics indexés via plusieurs API de recherche, sans connexion au compte LinkedIn ni exploration automatisée de LinkedIn. Le suivi de campagne reste local : aucun clic ni envoi automatique. La simulation est à faire avant toute recherche réelle, toute campagne et chaque série d’actions. L'opérateur vérifie ensuite chaque profil et chaque conversation, envoie manuellement sur LinkedIn si c'est approprié, puis enregistre immédiatement l'action. Une intégration d'envoi effectif nécessiterait un moyen autorisé par LinkedIn, ses permissions et une validation séparée. Ne pas utiliser de scripts de navigation imitant l'humain pour contourner les contrôles de la plateforme.

**Promesses à valider :** le brief évoque conciergerie, démarches, maintenance et gestion immobilière ; la [fiche entreprise](../../contenu/fiche-entreprise.md) décrit la recherche et la mise en relation de personnel. Les textes opérationnels restent dans ce périmètre. Ne réintroduire les autres prestations qu'après validation de l'offre réelle et des zones. Les termes « de confiance », « en toute sécurité », « prise en charge complète » et les garanties de réactivité doivent aussi être vérifiés, pas présumés. L'URL fournie est un profil `/in/`, pas nécessairement une page entreprise.

## 0. Recherche autonome de profils publics

`recherche.py` interroge des moteurs de recherche web, **pas l’API LinkedIn**. Il effectue jusqu'à huit requêtes prédéfinies (quatre villes marocaines et quatre zones MRE), puis place les URL `/in/` des résultats dans une file privée. Il ne visite pas les profils LinkedIn et n’envoie aucun message. Les moteurs ont leurs propres conditions, limites et prix ; aucune liste des outils gratuits ne peut être exhaustive ou garantie dans le temps.

| Moteur | Accès intégré | Conditions à vérifier |
|---|---|---|
| [Tavily](https://docs.tavily.com/documentation/keyless) | **Sans clé par défaut** ; clé facultative | Mode sans clé limité ; offre gratuite avec clé selon le fournisseur. |
| [Firecrawl](https://docs.firecrawl.dev/features/search) | **Sans clé par défaut** ; clé facultative | Accès sans clé limité ; vérifier les conditions et le quota. |
| [Serper](https://serper.dev/) | Clé `SERPER_API_KEY` | Essai/crédits gratuits possibles, selon l’offre ; non nécessairement renouvelables. |
| [SerpApi](https://serpapi.com/) | Clé `SERPAPI_API_KEY` | Formule gratuite limitée, vérifier l’éligibilité et les quotas. |
| [Exa](https://exa.ai/pricing) | Clé `EXA_API_KEY` | Crédits gratuits possibles, vérifier conditions et facturation. |
| [Brave Search](https://brave.com/search/api/) | Clé `BRAVE_SEARCH_API_KEY` | Accès soumis aux conditions du compte ; peut être payant. |

**Attention :** l'application ne sait pas consulter le solde des fournisseurs, ni garantir un coût nul. Désactivez les dépassements facturables sur vos comptes quand c'est possible. Une simulation ne fait aucun appel ; `--executer` déclenche de vrais appels, même si aucun profil n'est trouvé. Aucune bascule automatique vers un autre moteur ou compte payant. Pour Tavily et Firecrawl, les éventuelles clés présentes dans l’environnement sont **ignorées**, sauf avec `--avec-cle`. Les autres moteurs exigent leur clé. Un appel externe envoie la requête de recherche au fournisseur, pas vos cookies LinkedIn.

Les résultats dépendent de l’index et de la compréhension des requêtes du moteur : certains profils seront absents, hors cible, associés à d’autres URL ou obsolètes ; seule la première page est utilisée. Le segment associé est celui de la recherche, **pas une caractéristique vérifiée**. Ne pas déduire l’origine d’une personne de son nom ou apparence.

### Lancer sous Windows sans clé

Depuis le dossier extrait du projet, dans PowerShell :

```powershell
# Windows : installer une fois les données de fuseau horaire requises par Python.
py -m pip install tzdata

# Simulation : un seul moteur (Tavily), une requête, aucun accès réseau.
py outils/linkedin/recherche.py chercher --moteur tavily --limite 1

# Recherche réelle gratuite sans clé, dans les limites du service.
py outils/linkedin/recherche.py chercher --moteur tavily --limite 1 --executer
py outils/linkedin/recherche.py lister
```

Vous pouvez remplacer `tavily` par `firecrawl`. Pour utiliser **les deux** après simulation :

```powershell
py outils/linkedin/recherche.py chercher --moteur tavily --moteur firecrawl --limite 2
py outils/linkedin/recherche.py chercher --moteur tavily --moteur firecrawl --limite 2 --executer
```

Cela lance au maximum 2 requêtes **par moteur** (4 au total). Par défaut, 8 requêtes par moteur. `--segment mre` recherche uniquement la diaspora ; `--segment actif` uniquement les actifs. `--limite 1` ne couvre qu’une seule requête/ville du segment sélectionné. Les appels peuvent être limités, bloqués ou modifiés par les fournisseurs ; une erreur arrête la recherche sans sauvegarder les résultats partiels, mais les appels déjà effectués peuvent être comptabilisés ou facturés. Aucun mécanisme de nouvelle tentative ou de contournement des restrictions n’est installé.

Pour un moteur à clé, créez votre compte directement chez le fournisseur et configurez la variable d'environnement correspondante sur votre PC. Ne collez jamais la clé dans le dépôt ou une conversation. Exemples d'exécution :

```powershell
py outils/linkedin/recherche.py chercher --moteur serper --limite 1
py outils/linkedin/recherche.py chercher --moteur serper --limite 1 --executer
# Pour Tavily/Firecrawl avec un compte configuré explicitement :
py outils/linkedin/recherche.py chercher --moteur tavily --avec-cle --limite 1 --executer
```

SerpApi impose sa clé dans l’URL de requête HTTPS ; les journaux de votre réseau ou proxy peuvent donc l’exposer. Aucun fournisseur ne demande ni ne doit recevoir votre cookie LinkedIn. **Modification par rapport à l’ancienne version :** le moteur par défaut est désormais Tavily sans clé, pas Brave. Pour conserver Brave, spécifier `--moteur brave`.

### Validation avant contact

Vérifiez chaque profil, son adéquation B2C, son prénom, son segment et les contacts antérieurs. Ajouter un profil pertinent à la campagne :

```powershell
py outils/linkedin/recherche.py valider 'https://www.linkedin.com/in/profil-reel/' --prenom Amal --segment actif
# Ou écarter un résultat inapproprié :
py outils/linkedin/recherche.py ecarter 'https://www.linkedin.com/in/profil-reel/'
# Ensuite prévisualiser les messages, sans envoi :
py outils/linkedin/campagne.py simuler
```

Un profil découvert ne devient jamais automatiquement une invitation : il faut le valider. Les URL déjà présentes, validées ou écartées ne sont pas reproposées, sous réserve des changements de slug. Le fichier `~/yallah-linkedin-data/decouvertes.json` contient l’URL, le titre indexé, la catégorie de recherche, la date, le statut et le moteur. Gardez-le privé et appliquez les mêmes règles de conservation que pour la base. La validation enregistre le prénom et le segment vérifiés dans la base de campagne. Un seul opérateur/processus à la fois : aucune synchronisation entre machines, copies ou campagnes extérieures.

### Recherche quotidienne (facultatif)

Après test, configurez le Planificateur de tâches Windows ou cron sur une machine toujours allumée. Le programme à planifier est l’interpréteur Python ; ses arguments incluent le chemin complet vers `outils/linkedin/recherche.py`, puis `chercher --moteur tavily --executer`. Choisissez une heure, contrôlez le fuseau et les quotas du fournisseur, et commencez par `--limite 1`. Ne configurez pas plusieurs exécutions simultanées. La tâche ne fonctionne pas si la machine est éteinte et ne valide ni ne contacte les personnes. Les modifications de conditions ou restrictions réseau peuvent interrompre la recherche. L’environnement Arena ne permet pas nécessairement l’accès aux API ou l’exécution continue.

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

Prérequis : Python 3.9+ et la base de fuseaux horaires système (sous Windows : `py -m pip install tzdata`). Depuis la racine du dépôt :

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
