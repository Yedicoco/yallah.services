# CRM Yallah Services — installation de la fondation

## État de cette livraison

Cette branche ajoute une première interface de connexion et de gestion des prospects :
- interface privée : `/crm/`
- configuration publique Supabase : `GET /api/crm/config`
- API protégée : `GET/POST/PATCH /api/crm/prospects`
- migration SQL : `supabase/migrations/0001_crm_init.sql`

Cette version ne déclenche aucun message LinkedIn, WhatsApp ou e-mail. Elle ne collecte pas automatiquement de prospects.

## 1. Créer le projet Supabase

1. Créer un projet Supabase dédié au CRM Yallah Services.
2. Conserver l'accès au tableau de bord et les informations de projet dans un gestionnaire sécurisé.
3. Ouvrir SQL Editor et exécuter le fichier `supabase/migrations/0001_crm_init.sql`.
4. Dans Authentication > Users, créer un utilisateur administrateur avec une adresse e-mail contrôlée par la direction.
5. Copier son UUID, puis l'ajouter dans SQL Editor :

```sql
insert into public.crm_admins (user_id, role, active)
values ('UUID-DU-COMPTE', 'admin', true);
```

Ne pas ouvrir l'inscription publique. Les comptes CRM sont provisionnés manuellement.

## 2. Configurer Vercel

Dans le projet Vercel qui héberge le site Yallah Services, ajouter ces variables dans Settings > Environment Variables :

- `SUPABASE_URL` : URL du projet Supabase.
- `SUPABASE_ANON_KEY` : clé publique anon/publishable du projet.
- `SUPABASE_SERVICE_ROLE_KEY` : clé secrète serveur service_role/secret.

Ajouter les variables aux environnements Preview et Development pour tester la branche. Ne pas activer la clé secrète dans un navigateur, un dépôt Git, une capture d'écran ou un message.

## 3. Déployer en prévisualisation

1. Vérifier que la branche GitHub `feat/yallah-crm-foundation` est connectée au projet Vercel.
2. Vérifier les paramètres de déploiement avant de lancer une Preview.
3. Ne pas fusionner cette branche dans `main` avant les tests.
4. Ouvrir l'URL Preview puis `/crm/`.
5. Se connecter avec l'utilisateur créé dans Supabase.

Le chemin `/crm/` est une interface privée par authentification, mais son URL n'est pas un secret. La sécurité repose sur l'authentification et la vérification de l'appartenance à `crm_admins`.

## 4. Données et conformité

- Commencer exclusivement avec des données fictives.
- Définir les finalités, la base juridique, l'information des personnes, les durées de conservation, les droits d'accès et de suppression avant l'import de données réelles.
- Vérifier auprès de la CNDP les formalités applicables au traitement et au transfert éventuel de données hors du Maroc, en fonction de l'hébergement et des sous-traitants retenus.
- Ne pas collecter de données sensibles ou de détails personnels non nécessaires.
- Les messages LinkedIn doivent rester préparés et validés par une personne. Cette version n'automatise ni la recherche de profils ni l'envoi de messages.

## 5. Limites connues de la première livraison

- Pas encore de gestion des interactions, tâches, rappels ou modèles de messages dans l'interface.
- Pas encore de journal d'audit alimenté par l'API.
- Pas de suppression de prospect dans l'interface.
- La clé service_role permet un accès serveur privilégié : garder les routes API strictement contrôlées et les secrets uniquement dans Vercel.
- Prévoir ensuite tests automatisés, limitation de débit et journalisation avant un usage opérationnel élargi.
