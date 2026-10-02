#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YALLAH SERVICES — Nettoyage du contenu non conforme
====================================================

Retire du site tout ce qui ne peut pas être justifié :

1. Les trois avis clients copiés mot pour mot chez un concurrent
   (Fatima B. / Karim M. / Nadia A.) — remplacés par un bloc honnête
   « références sur demande ».
2. Le filtre « Préférence nationalité : Subsahariennes uniquement »
   (critère de sélection discriminatoire, demandé en retrait).
3. Les compteurs fabriqués : notifications « X vient de réserver il y a
   N min », « N familles ce mois ont réservé », « 500+ familles »,
   compteur de visiteurs live, compte à rebours de places.
4. La ligne « Préférence » du récapitulatif de demande.

Aucun chiffre inventé n'est réintroduit : les badges sont remplacés par
des engagements factuels et vérifiables (remplacement garanti, profil
vérifié, paiement après service…).

Usage :  python3 outils/nettoyer-contenu.py
"""
import io
import re
import sys
import os

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(RACINE, 'index.html')
APPJS = os.path.join(RACINE, 'assets', 'js', 'app.js')


def lire(chemin):
    with io.open(chemin, encoding='utf-8') as f:
        return f.read()


def ecrire(chemin, contenu):
    with io.open(chemin, 'w', encoding='utf-8') as f:
        f.write(contenu)


def remplacer(html, ancien, nouveau, etiquette, compteur):
    if ancien not in html:
        print('  ⚠️  introuvable : ' + etiquette)
        return html
    nb = html.count(ancien)
    compteur[0] += nb
    print('  ✔ %s (%d)' % (etiquette, nb))
    return html.replace(ancien, nouveau)


# ─────────────────────────────────────────────────────────────
# 1. SECTION AVIS CLIENTS  →  RÉFÉRENCES & TRANSPARENCE
# ─────────────────────────────────────────────────────────────
ANCIEN_TEMO = """<!-- ═══════════ AVIS CLIENTS ═══════════ -->
<section id="temo" class="sec">
  <div class="ctr">
    <div class="sh c reveal">
      <span class="se">Ils nous font confiance</span>
      <h2 class="st">Avis de nos clients</h2>
    </div>
    <div class="temo-grid reveal">
      <div class="tc">
        <div class="temo-top">
          <img class="tav" src="assets/img/avis-fatima.jpg" alt="Fatima B.">
          <div>
            <div class="tname">Fatima B.</div>
            <div class="tcity">📍 Casablanca</div>
            <div class="tstars">★★★★★</div>
          </div>
        </div>
        <p class="ttxt">« Excellente agence ! Femme de ménage très sérieuse, ma maison est impeccable. Réponse rapide sur WhatsApp. Je recommande vivement ! »</p>
      </div>
      <div class="tc">
        <div class="temo-top">
          <img class="tav" src="assets/img/avis-karim.jpg" alt="Karim M.">
          <div>
            <div class="tname">Karim M.</div>
            <div class="tcity">📍 Rabat</div>
            <div class="tstars">★★★★★</div>
          </div>
        </div>
        <p class="ttxt">« Nounou extraordinaire, mes enfants l'adorent. Suivi après placement très rassurant. Je recommande à 100% ! »</p>
      </div>
      <div class="tc">
        <div class="temo-top">
          <img class="tav" src="assets/img/avis-nadia.jpg" alt="Nadia A.">
          <div>
            <div class="tname">Nadia A.</div>
            <div class="tcity">📍 Marrakech</div>
            <div class="tstars">★★★★★</div>
          </div>
        </div>
        <p class="ttxt">« Cuisinière parfaite ! Contacté le soir, profil reçu le lendemain. Repas savoureux, hygiène irréprochable. »</p>
      </div>
    </div>

    <div class="temo-wa-wrap reveal">
      <div class="temo-wa-title">💬 Notre grille tarifaire &amp; nos garanties <span>✅ Officiel</span></div>
      <img class="temo-flyer" src="assets/img/grille-tarifaire.jpg" alt="Grille tarifaire des services Yallah Services Maroc — +212 691 733 585">
      <p class="flyer-cap">📄 Grille tarifaire officielle Yallah Services — <strong>Simplifiez-vous la vie !</strong></p>
    </div>
  </div>
</section>"""

NOUVEAU_TEMO = """<!-- ═══════════ RÉFÉRENCES & TRANSPARENCE ═══════════ -->
<!-- Les trois « avis clients » qui figuraient ici ont été retirés : ils ne
     correspondaient à aucun foyer réel accompagné par Yallah Services et
     reprenaient mot pour mot des témoignages publiés sur un autre site.
     N'ajoutez ici que des avis RÉELS, écrits par de vrais clients, avec leur
     accord écrit (photo et prénom complet compris). -->
<section id="temo" class="sec">
  <div class="ctr">
    <div class="sh c reveal">
      <span class="se">Transparence</span>
      <h2 class="st">Nos références, sur demande</h2>
      <p class="sd">Nous ne publions aucun avis que nous ne pouvons pas prouver. Les retours des foyers que nous accompagnons vous sont transmis directement, au moment où vous étudiez un profil.</p>
    </div>
    <div class="temo-grid reveal">
      <div class="tc">
        <div class="temo-top">
          <div class="tref-ico" aria-hidden="true">🔎</div>
          <div>
            <div class="tname">Références vérifiables</div>
            <div class="tcity">Avant toute mise en relation</div>
          </div>
        </div>
        <p class="ttxt">Chaque profil vous est présenté avec son parcours et ses références. Vous pouvez les vérifier vous-même avant de vous engager.</p>
      </div>
      <div class="tc">
        <div class="temo-top">
          <div class="tref-ico" aria-hidden="true">🔄</div>
          <div>
            <div class="tname">Remplacement garanti</div>
            <div class="tcity">Frais payés après validation</div>
          </div>
        </div>
        <p class="ttxt">Si le profil ne convient pas, nous en présentons un autre. Les frais de mise en relation ne sont dus qu'une fois le profil validé par vos soins.</p>
      </div>
      <div class="tc">
        <div class="temo-top">
          <div class="tref-ico" aria-hidden="true">🗣️</div>
          <div>
            <div class="tname">Un interlocuteur réel</div>
            <div class="tcity">Réponse sous 24h · 7j/7</div>
          </div>
        </div>
        <p class="ttxt">Vous échangez avec un conseiller sur WhatsApp, pas avec un formulaire automatique. Une personne vous répond, pas une file d'attente.</p>
      </div>
    </div>

    <div class="temo-wa-wrap reveal">
      <div class="temo-wa-title">💬 Demander nos références &amp; la grille tarifaire <span>✅ Gratuit</span></div>
      <p class="flyer-cap">Écrivez-nous sur WhatsApp : nous vous envoyons la grille tarifaire complète et les références disponibles pour le service et la ville qui vous intéressent.</p>
      <div class="ref-wa-wrap"><a class="ref-wa-btn" href="https://wa.me/212691733585?text=Bonjour%20Yallah%20Services%2C%20je%20souhaite%20recevoir%20vos%20r%C3%A9f%C3%A9rences%20et%20la%20grille%20tarifaire." target="_blank" rel="noopener">💬 Recevoir les références sur WhatsApp</a></div>
    </div>
  </div>
</section>"""

# ─────────────────────────────────────────────────────────────
# 2. FILTRE NATIONALITÉ (mini-formulaire + formulaire contact)
# ─────────────────────────────────────────────────────────────
ANCIEN_NAT_MINI = """        <select class="mf-select" id="mfNat">
          <option value="">Préférence nationalité...</option>
          <option>Subsahariennes uniquement</option>
          <option>Pas de préférence</option>
        </select>
"""
ANCIEN_NAT_CONTACT = """          <div class="fg">
            <label class="fl">Préférence</label>
            <select class="fs" id="ctNat">
              <option value="">Préférence...</option>
              <option>Subsahariennes uniquement</option>
              <option>Pas de préférence</option>
            </select>
          </div>
"""

# ─────────────────────────────────────────────────────────────
# 3. STATISTIQUE « 500+ familles accompagnées » (non prouvée)
# ─────────────────────────────────────────────────────────────
ANCIEN_STAT = """      <div class="stat"><span class="sn">500+</span><div class="sl">Familles accompagnées</div></div>"""
NOUVEAU_STAT = """      <div class="stat"><span class="sn">11</span><div class="sl">Villes desservies au Maroc</div></div>"""

# ─────────────────────────────────────────────────────────────
# 4. LIGNE « Préférence » DU RÉCAPITULATIF
# ─────────────────────────────────────────────────────────────
ANCIEN_FACTNAT = """          <div class="frow"><span class="fk">Préférence</span><span class="fv" id="factNat">—</span></div>
"""

BADGES = {
    'menage': '<div class="clients-badge">🔄 Remplacement garanti</div>',
    'nounou': '<div class="clients-badge">🛡️ Profil vérifié avant présentation</div>',
    'cuisine': '<div class="clients-badge">🛡️ Profil vérifié avant présentation</div>',
    'malade': '<div class="clients-badge">🛡️ Personnel formé et suivi</div>',
    'jour': '<div class="clients-badge">💰 Paiement après service</div>',
}


def nettoyer_index():
    print('index.html')
    html = lire(INDEX)
    c = [0]

    html = remplacer(html, ANCIEN_TEMO, NOUVEAU_TEMO, 'avis copiés → bloc références', c)
    html = remplacer(html, ANCIEN_NAT_MINI, '', 'filtre nationalité (mini-formulaire)', c)
    html = remplacer(html, ANCIEN_NAT_CONTACT, '', 'filtre nationalité (formulaire contact)', c)
    html = remplacer(html, ANCIEN_STAT, NOUVEAU_STAT, 'stat « 500+ familles » → 11 villes', c)
    html = remplacer(html, ANCIEN_FACTNAT, '', 'ligne « Préférence » du récapitulatif', c)

    # Libellés de navigation
    html = html.replace('<li><a href="#temo">Avis</a></li>', '<li><a href="#temo">Références</a></li>')
    html = html.replace('<a href="#temo">Avis clients</a>', '<a href="#temo">Références</a>')

    # Badges « N familles ont réservé » → engagements factuels, selon l'onglet
    lignes = html.split('\n')
    onglet = None
    nb = 0
    for i, ligne in enumerate(lignes):
        m = re.search(r'id="tab-([a-z]+)"', ligne)
        if m:
            onglet = m.group(1)
        if 'clients-badge' in ligne and 'clients-dot' in ligne:
            lignes[i] = BADGES.get(onglet, '<div class="clients-badge">🛡️ Profil vérifié avant présentation</div>')
            nb += 1
    html = '\n'.join(lignes)
    print('  ✔ badges « N familles ont réservé » → factuels (%d)' % nb)
    c[0] += nb

    ecrire(INDEX, html)
    return c[0]


# ─────────────────────────────────────────────────────────────
# app.js : suppression des compteurs fabriqués
# ─────────────────────────────────────────────────────────────
def nettoyer_appjs():
    print('assets/js/app.js')
    js = lire(APPJS)
    avant = len(js)

    # 1. Compteur de visiteurs « live »
    js = re.sub(
        r"  /\* ─+ COMPTEUR LIVE ─+ \*/\n(?:.*\n)*?  \}\n\n",
        '', js, count=1)

    # 2. Compte à rebours « places limitées »
    js = re.sub(
        r"  /\* ─+ COMPTEUR D'URGENCE ─+ \*/\n(?:.*\n)*?  \}\n\n",
        '', js, count=1)

    # 3. Notifications « preuve sociale » (PROOFS + showProof + intervalles)
    js = re.sub(
        r"  /\* ─+ NOTIFICATIONS \"PREUVE SOCIALE\" ─+ \*/\n(?:.*\n)*?  \}, 9000\);\n\n",
        '', js, count=1)

    # 4. Champ nationalité dans les messages WhatsApp / récapitulatif
    js = js.replace("city: val('#mfCity'), nat: val('#mfNat'), type: val('#mfType'), delay: val('#mfDelay')",
                    "city: val('#mfCity'), type: val('#mfType'), delay: val('#mfDelay')")
    js = js.replace("city: val('#ctCity'), nat: val('#ctNat'), type: val('#ctType'), delay: val('#ctDelay'),",
                    "city: val('#ctCity'), type: val('#ctType'), delay: val('#ctDelay'),")
    js = js.replace("    $('#factNat').textContent = or(data.nat, '—');\n", '')

    ecrire(APPJS, js)
    print('  ✔ %d octets retirés' % (avant - len(js)))


if __name__ == '__main__':
    n = nettoyer_index()
    nettoyer_appjs()
    print('Terminé — %d remplacements.' % n)
