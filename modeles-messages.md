# Yallah Services — Modèles de messages (FR / AR)

Tous les textes prêts à copier pour le site, les réponses WhatsApp Business et
les e-mails. Les coordonnées utilisées partout :

| Canal | Coordonnées |
|---|---|
| 💬 WhatsApp **foyers** (clients) | **+212 691 733 585** |
| 💬 WhatsApp **candidats** (personnel) | **+212 710 359 446** |
| ✉️ E-mail (références, dossiers) | **servicesyallah@gmail.com** |

> Modifiables dans `assets/js/config.js` (site statique), par variables
> d'environnement `WHATSAPP_FOYERS`, `WHATSAPP_CANDIDATS`, `CONTACT_EMAIL`
> (serveur), ou à la régénération : `node build-site.js`.

---

## 1. La mention d'avertissement — 4 variantes

Le site garde son message d'origine tout en **orientant** les personnes qui
cherchent un emploi (une pierre, deux coups : aucun candidat perdu, aucun
mélange des deux parcours).

### Variante A — site foyers, bandeau permanent (version en ligne)

```
🚫 Demandes d'emploi non acceptées — Ce site est réservé aux foyers souhaitant recruter.
Vous cherchez un emploi ? Envoyez vos références à servicesyallah@gmail.com
ou écrivez-nous sur WhatsApp +212 710 359 446 · Espace candidats →
```

### Variante B — version stricte (conservée au cas où)

À remettre telle quelle si vous préférez renvoyer les candidats vers nous
sans les accompagner (elle figure déjà dans l'historique du site) :

```
🚫 Demandes d'emploi non acceptées — Ce site est réservé aux foyers souhaitant recruter.
Quittez si vous cherchez un emploi.
```

### Variante C — formulaire de réservation des foyers (encadré)

```
🚫 Réservé aux foyers uniquement — Demandes d'emploi non acceptées.
🧑‍🍳 Vous cherchez un emploi ? Remplissez la fiche candidat · références à
servicesyallah@gmail.com
```

### Variante D — réponse WhatsApp aux candidats qui écrivent sur le numéro foyers

```
Bonjour 👋 Merci de votre message.
Yallah Services recrute du personnel de maison (ménage, nounou, cuisine,
garde malade) : votre demande est bien la bienvenue.
📝 Remplissez la fiche de candidature (français ou arabe) : [lien du site]/candidature.html
Vous recevrez un numéro de dossier (ex. YS-2026-0001) puis :
1) envoyez la fiche sur WhatsApp +212 710 359 446
2) envoyez vos deux références à servicesyallah@gmail.com
⚠️ Sans deux références, la candidature n'est pas validée.
🔒 Service gratuit : nous ne demandons jamais d'argent.
```

**Version arabe** — الدارجة/العربية:

```
🚫 لا نقبل طلبات التوظيف — هذا الموقع مخصّص للأسر التي تبحث عن عاملات وعاملين.
هل تبحثين عن عمل؟ أرسلي مراجعك إلى servicesyallah@gmail.com
أو راسلينا على واتساب ‎+212 710 359 446 · فضاء الترشّح ←
```

---

## 2. Réponses WhatsApp Business (candidats)

### 2.1 Réception d'une fiche complète (avec références)

```
Bonjour [Prénom] 👋
Merci, votre dossier [YS-2026-XXXX] est bien complet ✅
Nos équipes vérifient vos deux références, puis vous serez contactée pour un
entretien. Réponse sous 48h ouvrées.
💡 Rappel : ce service est gratuit pour les candidats, aucun frais ne vous
sera demandé, ni maintenant ni après le placement.
Yallah Services — Casablanca
```

### 2.2 Fiche reçue mais références manquantes

```
Bonjour [Prénom] 👋
Votre fiche est bien enregistrée sous le dossier [YS-2026-XXXX].
Il manque encore vos deux références :
1) nom + téléphone d'un ancien employeur (ou d'une dame chez qui vous avez travaillé)
2) une seconde personne qui vous connaît professionnellement
📧 À envoyer à servicesyallah@gmail.com avec votre numéro de dossier en objet.
⚠️ Sans ces références, la candidature n'est ni validée ni présentée à un foyer.
```

### 2.3 Après vérification des références

```
Bonjour [Prénom] 👋
Bonne nouvelle : vos références sont validées ✅
Votre profil sera présenté aux familles qui recherchent [métier].
Nous vous contactons dès qu'un foyer correspond à vos disponibilités
([type de travail], à partir du [date]).
```

### 2.4 Après un placement

```
Bonjour [Prénom] 👋
Félicitations, votre placement est confirmé chez [foyer, ville] 🎉
Votre interlocuteur Yallah Services reste disponible en cas de difficulté.
Prenez soin de vous, et merci de votre confiance.
```

### 2.5 Demande de suppression des données (loi 09-08)

```
Bonjour [Prénom] 👋
C'est noté : votre dossier [YS-2026-XXXX] et vos données personnelles seront
supprimés de nos fichiers. Vous recevrez une confirmation dès que c'est fait.
```

---

## 3. E-mails types

### 3.1 Le candidat envoie ses références (message pré-rempli par le site)

Le bouton « Envoyer mes références par e-mail » de la page de confirmation
ouvre déjà ce message, avec le numéro de dossier **en objet** :

**Objet :** `Références dossier YS-2026-0001 — Aminata Diallo — Yallah Services`

```
Bonjour Yallah Services,

Je vous transmets les références de mon dossier YS-2026-0001.

CANDIDAT(E)
Nom : Aminata Diallo
Téléphone / WhatsApp : 0612345678
Ville : Casablanca (Sidi Bernoussi)
Métier souhaité : Nounou

RÉFÉRENCE 1
Nom : Mme Bennani
Lien : Ancien employeur
Téléphone : 0661223344

RÉFÉRENCE 2
Nom : M. Alaoui
Lien : Responsable d'entreprise
Téléphone : +212 6 55 44 33 22

J'ai bien compris que sans ces références, ma candidature n'est ni validée
ni présentée à un foyer.

Merci de votre confiance,
Aminata Diallo
```

### 3.2 Réponse automatique type (accusé de réception)

**Objet :** `Dossier YS-2026-0001 bien reçu — Yallah Services`

```
Bonjour Aminata,

Merci pour votre candidature. Votre dossier YS-2026-0001 est bien enregistré.
Notre équipe vérifie vos références et vous contactera sur WhatsApp au
0612345678 sous 48h ouvrées.

Rappel important : Yallah Services est gratuit pour les candidats.
Nous ne demandons jamais d'argent, ni pour un dossier, ni pour un placement.

Bien à vous,
Yallah Services — Casablanca
servicesyallah@gmail.com · WhatsApp +212 710 359 446
```

### 3.3 Réponse négative courtoise + conservation 12 mois

**Objet :** `Votre dossier YS-2026-0001 — Yallah Services`

```
Bonjour Aminata,

Nous n'avons pas, pour le moment, de foyer correspondant à votre profil.
Votre dossier reste enregistré 12 mois maximum ; nous vous contacterons dès
qu'une opportunité se présente.

Vous pouvez demander la suppression de vos données à tout moment en répondant
à ce message (loi marocaine 09-08).

Bien à vous,
Yallah Services
```

### 3.4 Foyers : après réception d'une demande de recrutement

**Objet :** `Votre demande de personnel — Yallah Services`

```
Bonjour,

Merci pour votre demande. Nous préparons une sélection de profils vérifiés
correspondant à votre besoin ([service], [ville]) et vous envoyons les
candidatures sur WhatsApp dans les 24h ouvrées.

Rappel : les frais de Mise en relation sont réglés après validation du profil,
jamais avant.

Yallah Services — WhatsApp +212 691 733 585
```

---

## 4. Mentions à afficher selon le support

| Support | Mention à utiliser |
|---|---|
| Bandeau bas de page (accueil) | Variante A |
| Encadré du formulaire de réservation (foyers) | Variante C |
| Fenêtre « Réserver ce pack » | Variante C (version courte) |
| Réponse aux candidats sur le numéro foyers | Variante D |
| Fiche de candidature (`/candidature`) | Rappel « sans références, la candidature n'est ni validée ni présentée à un foyer » (déjà affiché) |
| Page de confirmation | « Il vous reste deux actions obligatoires » + e-mail des références (déjà affiché) |
| Espace recruteur | Rappel loi 09-08 + conservation 12 mois (déjà affiché) |

---

## 5. Rappels de conformité (loi 09-08)

- Les données des candidats (fiche + références) servent **uniquement** à
  l'étude de la candidature et à sa présentation aux foyers.
- **Conservation : 12 mois maximum** pour les candidats non retenus, puis
  suppression. Le bouton **Supprimer le dossier** de l'espace recruteur
  permet de répondre immédiatement à une demande d'effacement.
- Aucun frais n'est demandé aux candidats, à aucun moment.
- Les références ne sont jamais publiées ; elles ne servent qu'à la
  vérification par l'agence.
- Version serveur : activer **HTTPS** et **sauvegarder `data/`** régulièrement.
