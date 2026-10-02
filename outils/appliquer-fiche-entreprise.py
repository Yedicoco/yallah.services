#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Aligne le site sur contenu/fiche-entreprise.md (une seule passe, rapportée)."""
import io, re, sys, pathlib

RACINE = pathlib.Path(__file__).resolve().parent.parent
rapport = []
manques = []

def remplacer(fichier, avant, apres, attendu=1):
    chemin = RACINE / fichier
    texte = chemin.read_text(encoding='utf-8')
    n = texte.count(avant)
    if n < attendu:
        manques.append(f'{fichier} :: {avant[:70]!r} (trouvé {n}, attendu {attendu})')
        return
    chemin.write_text(texte.replace(avant, apres), encoding='utf-8')
    rapport.append(f'{fichier:34} ×{n:<3} {avant[:58]}')

# ─────────────── index.html ───────────────
F = 'index.html'

# 1. Balises SEO (origine ethnique + promesses non confirmées)
remplacer(F, '<title>Yallah Services – Personnel subsaharien qualifié au Maroc | +212 691 733 585</title>',
          '<title>Yallah Services | Personnel de maison et services au Maroc</title>')
remplacer(F, 'Yallah Services vous aide à trouver un personnel de maison fiable au Maroc : ménage, nounou, cuisine et garde-malade. Profils sélectionnés, accompagnement humain et réponse sur WhatsApp sous 24h.',
          'Recherche et mise en relation de personnel pour les particuliers et les entreprises au Maroc : ménage, nounou, cuisine, garde-malade, chauffeurs et gardiennage.')
remplacer(F, 'femme de ménage Maroc, nounou Casablanca, cuisinière Rabat, personnel subsaharien, agence placement Maroc, aide à domicile',
          'femme de ménage Maroc, nounou Casablanca, cuisinière Rabat, personnel de maison, aide à domicile, personnel pour entreprises')
remplacer(F, 'Yallah Services – Personnel subsaharien qualifié au Maroc',
          'Yallah Services | Personnel de maison et services au Maroc')
remplacer(F, 'Femme de ménage, nounou, cuisinière. Personnel vérifié &amp; formé. Profil reçu sur WhatsApp en moins de 24h.',
          'Ménage, nounou, cuisine, garde-malade : des profils sélectionnés selon vos critères, pour les particuliers et les entreprises au Maroc.')

# 2. Promesses (délais, vérification, chiffres)
remplacer(F, 'Réponse sous 24h · Profils vérifiés · Paiement des frais après validation',
          'Profils sélectionnés selon vos critères · Particuliers et entreprises · Paiement des frais après validation')
remplacer(F, '<span class="sn">500+</span><div class="sl">Familles accompagnées</div>',
          '<span class="sn">2 ans</span><div class="sl">d\'activité au Maroc</div>')
remplacer(F, '<span class="sn">24h</span><div class="sl">Pour recevoir un profil</div>',
          '<span class="sn">10 villes</span><div class="sl">desservies au Maroc</div>')
remplacer(F, '<strong>Profils vérifiés</strong><br><span style="font-size:11px;opacity:.65">et sélectionnés</span>',
          '<strong>Profils sélectionnés</strong><br><span style="font-size:11px;opacity:.65">selon vos critères</span>')
remplacer(F, '<div class="ti-txt">Profils vérifiés<span>et sélectionnés</span></div>',
          '<div class="ti-txt">Profils sélectionnés<span>selon vos critères</span></div>')
remplacer(F, '<div class="how-title">Recevez un profil en 24h</div>',
          '<div class="how-title">Recevez une sélection adaptée</div>')
remplacer(F, 'Recevez un profil en 24h sur WhatsApp', 'Recevez des profils adaptés sur WhatsApp')
remplacer(F, '🔒 Gratuit · Sans engagement · Réponse en moins de 24h',
          '🔒 Gratuit · Sans engagement · Réponse sur WhatsApp')
remplacer(F, '<p>Demande envoyée ! Profil reçu dans les 24h sur WhatsApp.</p>',
          '<p>Demande envoyée ! Nous revenons vers vous sur WhatsApp.</p>')
remplacer(F, 'Remplacement garanti', 'Remplacement selon la formule', attendu=10)

# 3. Préférence de nationalité dans les formulaires clients
remplacer(F, 'Préférence nationalité...', 'Expérience souhaitée...')
remplacer(F, 'Préférence...', 'Expérience souhaitée...')
remplacer(F, '<option>Subsahariennes uniquement</option>', '<option>Déjà expérimentée</option>', attendu=2)

# 4. Ouverture aux entreprises (le site ne visait que les foyers)
remplacer(F, '🚫 <strong>Réservé aux foyers qui recrutent.</strong>',
          '🚫 <strong>Réservé aux particuliers et aux entreprises qui recrutent.</strong>')
remplacer(F, 'Ce site est réservé aux foyers qui recrutent — mais nous recrutons aussi du personnel.',
          'Ce site est réservé aux particuliers et aux entreprises qui recrutent — mais nous recrutons aussi du personnel.')
remplacer(F, '🚫 Réservé aux foyers uniquement', '🚫 Réservé aux particuliers et entreprises', attendu=2)
remplacer(F, 'Ce site est réservé aux foyers souhaitant recruter.',
          'Ce site est réservé aux particuliers et aux entreprises qui recrutent.')
remplacer(F, 'Réservé aux foyers souhaitant recruter.', 'Réservé aux particuliers et entreprises qui recrutent.')

# 5. Signatures de pied de page
remplacer(F, 'Personnel subsaharien qualifié, vérifié et accompagné au Maroc',
          'Personnel de maison et services, pour les particuliers et les entreprises au Maroc')
remplacer(F, 'Personnel subsaharien qualifié, vérifié et accompagné par Yallah Services',
          'Personnel sélectionné selon vos besoins et accompagné par Yallah Services')

# 6. Villes : liste de pied de page + listes déroulantes
ANCIENNES = 'Casablanca · Rabat · Marrakech · Fès · Tanger · Agadir · Meknès · Oujda · Kénitra · Salé · Tétouan'
NOUVELLES = 'Casablanca · Bouskoura · Rabat · Marrakech · Tanger · Agadir · Fès · Kénitra · Mohammedia · Témara · Salé'
remplacer(F, ANCIENNES, NOUVELLES)

def bloc_villes(indent, placeholder):
    villes = ['Casablanca', 'Bouskoura', 'Rabat', 'Marrakech', 'Tanger', 'Agadir',
              'Fès', 'Kénitra', 'Mohammedia', 'Témara', 'Salé']
    lignes = [f'{indent}<option value="">{placeholder}</option>']
    lignes += [f'{indent}<option>{v}</option>' for v in villes]
    lignes.append(f'{indent}<option>Autre ville</option>')
    return '\n'.join(lignes)

for sid, indent, placeholder in [('mfCity', '          ', '📍 Votre ville...'),
                                 ('ctCity', '              ', 'Votre ville...'),
                                 ('popCity', '          ', 'Votre ville')]:
    chemin = RACINE / F
    texte = chemin.read_text(encoding='utf-8')
    motif = re.compile(r'(<select[^>]*id="' + sid + r'"[^>]*>\s*).*?(\s*</select>)', re.S)
    if not motif.search(texte):
        manques.append(f'{F} :: select #{sid} introuvable')
        continue
    texte = motif.sub(lambda m: m.group(1) + bloc_villes(indent, placeholder) + m.group(2), texte, count=1)
    chemin.write_text(texte, encoding='utf-8')
    rapport.append(f'{F:34} ×1   select #{sid} → villes confirmées')

# 7. Données structurées : description, adresse complète, villes desservies
remplacer(F, '"description": "Yallah Services met en relation les foyers avec du personnel de maison sélectionné et accompagné au Maroc."',
          '"description": "Yallah Services recherche et met en relation du personnel pour les particuliers et les entreprises au Maroc : ménage, garde d\'enfants, cuisine, garde-malade, chauffeurs et gardiennage."')
remplacer(F, '"address": {"@type": "PostalAddress", "addressCountry": "MA", "addressLocality": "Casablanca"}',
          '"address": {"@type": "PostalAddress", "addressCountry": "MA", "addressLocality": "Casablanca", "addressRegion": "Casablanca-Settat", "postalCode": "20220"}')
remplacer(F, '"areaServed": ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Salé", "Tétouan"]',
          '"areaServed": ["Casablanca", "Bouskoura", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès", "Kénitra", "Mohammedia", "Témara", "Salé"]')

# ─────────────── Pages villes ───────────────
for page in ['femme-menage-casablanca.html', 'nounou-casablanca.html']:
    remplacer(page, ANCIENNES, NOUVELLES)

# ─────────────── candidature.html ───────────────
C = 'candidature.html'
remplacer(C, '              <option value="Meknès" data-fr="Meknès" data-ar="مكناس"></option>\n'
             '              <option value="Oujda" data-fr="Oujda" data-ar="وجدة"></option>\n',
          '              <option value="Mohammedia" data-fr="Mohammedia" data-ar="المحمدية"></option>\n'
          '              <option value="Témara" data-fr="Témara" data-ar="تمارة"></option>\n'
          '              <option value="Bouskoura" data-fr="Bouskoura" data-ar="بوسكورة"></option>\n')
remplacer(C, '              <option value="Tétouan" data-fr="Tétouan" data-ar="تطوان"></option>\n', '')

# ─────────────── README ───────────────
R = 'README.md'
remplacer(R, '| Villes | Casablanca · Rabat · Marrakech · Fès · Tanger · Agadir · Meknès · Oujda · Kénitra · Salé · Tétouan |',
          '| Villes | Casablanca · Bouskoura · Rabat · Marrakech · Tanger · Agadir · Fès · Kénitra · Mohammedia · Témara · Salé |')
remplacer(R, 'badge « Agence N°1 », *Votre maison, entre de bonnes mains*,',
          '*Votre maison, entre de bonnes mains*,')

# ─────────────── Rapport ───────────────
print(f'{len(rapport)} remplacements appliqués\n')
for ligne in rapport:
    print('  ' + ligne)
if manques:
    print('\n❌ CIBLES INTROUVABLES :')
    for m in manques:
        print('  ' + m)
    sys.exit(1)
print('\n✅ Toutes les cibles ont été trouvées et remplacées.')
