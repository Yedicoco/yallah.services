# Valider les 4 synthèses d'avis clients

**Situation :** les 4 clientes sont réelles (noms et villes confirmés par la direction).
Les textes ci-dessous sont des **synthèses rédigées par l'agence** — pas leurs mots.
Elles **ne peuvent pas être publiées** avant l'accord de chaque cliente.
`node outils/verifier-contenu.js` bloque la publication tant que les 4 accords ne sont pas enregistrés.

---

## 1. Ce qu'il faut envoyer à chaque cliente

> Bonjour [Prénom] 🙂
> Nous mettons en avant sur notre site les familles qui nous font confiance.
> Voici **ce que nous proposons d'afficher**, avec votre prénom et votre ville :
>
> _« [texte du tableau ci-dessous] »_
>
> **Est-ce que c'est exact ?** Si vous préférez ajouter, corriger ou retirer quelque chose
> (par exemple ce qui vous a le plus satisfaite), répondez-moi librement — je publierai
> votre version. Et vous pouvez me demander de la retirer à tout moment.
> Merci beaucoup 🙏

**Réponses possibles :** « c'est bon » (accord) · une correction (on publie sa version) ·
un refus (on n'affiche rien) · un silence (on n'affiche rien).

## 2. Les 4 synthèses à valider

| # | Cliente | Ville | Synthèse proposée | Accord |
|---|---|---|---|---|
| 1 | **Fatima Zahra** | Bouskoura | Famille accompagnée à Bouskoura. Recherche du profil correspondant au besoin exprimé, présentation de la sélection puis suivi après le placement. | ⬜ |
| 2 | **Mme Wafae** | Tamaris, Dar Bouazza | Cliente accompagnée à Tamaris, à Dar Bouazza. Le besoin a été clarifié avec elle avant toute présentation de profil, puis nous avons assuré le suivi après la mise en relation. | ⬜ |
| 3 | **Basma H.** | Rabat | Cliente accompagnée à Rabat, de l'écoute du besoin jusqu'au suivi après le placement. | ⬜ |
| 4 | **Mme Najiba** | Bouznika | Famille accompagnée à Bouznika par notre équipe, de la formulation du besoin jusqu'au suivi après la mise en relation. | ⬜ |

## 3. Comment obtenir une version plus forte (recommandé)

Une synthèse de processus (« nous avons clarifié le besoin, puis suivi ») reste tiède.
Trois questions à poser dans le même message suffisent à obtenir un vrai témoignage :

1. **Quel service** avons-nous mis en place chez vous ? (ménage, nounou, cuisine, garde-malade, chauffeur, gardien)
2. **Qu'est-ce qui vous a le plus aidée** dans notre accompagnement ?
3. **Sur 5, quelle note** donneriez-vous ?

Les réponses permettent de passer d'une synthèse à un **avis daté, précis et vérifiable** — et
éventuellement à une note en étoiles, **uniquement si la cliente la donne elle-même**.

## 4. Après validation : ce que je publie

| Élément | Règle |
|---|---|
| Texte | Version validée par la cliente, **entre guillemets** dès lors qu'elle est reprise telle quelle |
| Étoiles | Uniquement si la note est donnée par la cliente |
| Nom | Prénom + initiale (ou nom complet si elle l'autorise explicitement) |
| Ville | Ville ou quartier validé — sert de preuve locale sur les pages de cette ville |
| Label | « Avis recueilli par WhatsApp le [date] » — traçable et honnête |
| Accord | Capture de la conversation archivée dans `contenu/avis/` (**hors Git**) |
| Retrait | Sur simple demande, à tout moment |

## 5. Et sur Google

Le site ne suffit pas : demander à chaque cliente de **déposer l'avis sur la fiche Google**
(lien direct à préparer dès que le profil est créé). C'est ce qui pèse sur le pack local.
Un avis sur le site ne remplace pas un avis Google.

## 6. Quand les avis seront validés

- [ ] Accord de Fatima Zahra (Bouskoura) → débloque les pages Bouskoura
- [ ] Accord de Mme Wafae (Tamaris, Dar Bouazza) → débloque les pages Dar Bouazza
- [ ] Accord de Basma H. (Rabat) → débloque les pages Rabat
- [ ] Accord de Mme Najiba (Bouznika) → débloque la page Bouznika

**Puis :** retirer les commentaires `[[AVIS EN ATTENTE DE VALIDATION…]]` dans `index.html`,
supprimer la classe `resume` des cartes validées, relancer `verifier-contenu.js` (doit passer au vert),
et renseigner `contenu/sources-editoriales.md`.
