#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
══════════════════════════════════════════════════════════════════
 YALLAH SERVICES — Génération des déclinaisons du logo
══════════════════════════════════════════════════════════════════

Produit les 12 images dérivées du logo officiel à partir de
`assets/logo-source.png` :

   1. logo.png                    512×512  fond marine (navigation, hero)
   2. logo-256.png                256×256  fond marine
   3. logo-128.png                128×128  fond marine
   4. logo-transparent-512.png    512×512  cercle détouré, fond transparent
   5. logo-blanc-512.png          512×512  monochrome blanc (fonds sombres)
   6. logo-marine-512.png         512×512  monochrome marine (fonds clairs)
   7. favicon-32.png               32×32
   8. favicon-16.png               16×16
   9. apple-touch-icon-180.png    180×180  iOS
  10. logo-og-1200x630.jpg       1200×630  image de partage (Open Graph)
  11. logo-bandeau-1600x400.png  1600×400  bannière réseaux sociaux
  12. logo-avatar-400.png         400×400  avatar rond (WhatsApp Business)

Le fond est retiré en douceur : les pixels proches du bleu marine du
fond deviennent transparents, le cercle doré et les motifs restent nets.

Utilisation :
    python3 generer-images-logo.py
    python3 generer-images-logo.py --source assets/logo-source.png --sortie assets/img

Dépendance : Pillow  →  pip install pillow
"""

import argparse
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("Pillow est requis : exécutez « pip install pillow » puis relancez ce script.")

# ── Charte ──
MARINE = (13, 33, 54)        # #0d2136
MARINE_CLAIR = (27, 61, 94)  # #1b3d5e
OR = (201, 162, 39)          # #c9a227
OR_CLAIR = (233, 212, 147)   # #e9d493
IVOIRE = (253, 245, 221)     # #fdf5dd

POLICES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]


def police(taille):
    for chemin in POLICES:
        if os.path.exists(chemin):
            return ImageFont.truetype(chemin, taille)
    return ImageFont.load_default()


def couleur_fond(image):
    """Estime la couleur du fond à partir des quatre coins."""
    largeur, hauteur = image.size
    coins = [
        image.getpixel((2, 2)),
        image.getpixel((largeur - 3, 2)),
        image.getpixel((2, hauteur - 3)),
        image.getpixel((largeur - 3, hauteur - 3)),
    ]
    if isinstance(coins[0], tuple):
        return tuple(sum(c[i] for c in coins) // 4 for i in range(3))
    return (coins[0], coins[0], coins[0])


def luminance(pixel):
    return 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]


def recadrer_sur_le_cercle(image, marge=0.03):
    """Recadre l'image sur le cercle doré (pixels plus clairs que le fond)."""
    largeur, hauteur = image.size
    fond = couleur_fond(image)
    seuil = luminance(fond) + 28

    gauche, haut, droite, bas = largeur, hauteur, 0, 0
    pixels = image.load()
    pas = max(1, largeur // 400)
    for y in range(0, hauteur, pas):
        for x in range(0, largeur, pas):
            if luminance(pixels[x, y]) > seuil:
                gauche = min(gauche, x)
                haut = min(haut, y)
                droite = max(droite, x)
                bas = max(bas, y)

    if droite - gauche < largeur * 0.3 or bas - haut < hauteur * 0.3:
        return image  # détection peu fiable : on garde l'image entière

    centre_x = (gauche + droite) / 2
    centre_y = (haut + bas) / 2
    cote = max(droite - gauche, bas - haut)
    cote = cote * (1 + 2 * marge)
    demi = cote / 2

    gauche = max(0, int(centre_x - demi))
    haut = max(0, int(centre_y - demi))
    droite = min(largeur, int(centre_x + demi))
    bas = min(hauteur, int(centre_y + demi))

    carre = image.crop((gauche, haut, droite, bas))
    taille = max(carre.size)
    toile = Image.new("RGB", (taille, taille), fond)
    toile.paste(carre, ((taille - carre.width) // 2, (taille - carre.height) // 2))
    return toile


def detourer(image, tolerance=46):
    """Rend transparent l'extérieur du cercle (remplissage depuis les bords).

    Le bleu marine *intérieur* au cercle reste opaque : le logo garde son
    aspect « pastille » sur fond clair comme sur fond sombre. Seuls les
    pixels de bord sont adoucis pour éviter l'effet escalier.
    """
    from collections import deque

    fond = couleur_fond(image)
    image = image.convert("RGBA")
    largeur, hauteur = image.size
    source = image.load()

    def distance(pixel):
        return ((pixel[0] - fond[0]) ** 2 + (pixel[1] - fond[1]) ** 2 + (pixel[2] - fond[2]) ** 2) ** 0.5

    exterieur = bytearray(largeur * hauteur)
    file = deque()

    def ajouter(x, y):
        index = y * largeur + x
        if not exterieur[index] and distance(source[x, y]) <= tolerance:
            exterieur[index] = 1
            file.append((x, y))

    for x in range(largeur):
        ajouter(x, 0)
        ajouter(x, hauteur - 1)
    for y in range(hauteur):
        ajouter(0, y)
        ajouter(largeur - 1, y)

    while file:
        x, y = file.popleft()
        if x > 0: ajouter(x - 1, y)
        if x < largeur - 1: ajouter(x + 1, y)
        if y > 0: ajouter(x, y - 1)
        if y < hauteur - 1: ajouter(x, y + 1)

    sortie = Image.new("RGBA", (largeur, hauteur), (0, 0, 0, 0))
    cible = sortie.load()
    limite_basse = tolerance
    limite_haute = tolerance * 2.1
    voisinage = 2

    for y in range(hauteur):
        for x in range(largeur):
            index = y * largeur + x
            if exterieur[index]:
                continue
            pixel = source[x, y]
            d = distance(pixel)
            # Bord du cercle : adoucir l'alpha si un pixel extérieur est proche
            proche_exterieur = False
            for dy in range(-voisinage, voisinage + 1):
                if proche_exterieur:
                    break
                for dx in range(-voisinage, voisinage + 1):
                    vx, vy = x + dx, y + dy
                    if 0 <= vx < largeur and 0 <= vy < hauteur and exterieur[vy * largeur + vx]:
                        proche_exterieur = True
                        break
            if proche_exterieur and d < limite_haute:
                alpha = int(255 * max(0.0, min(1.0, (d - limite_basse) / max(1.0, limite_haute - limite_basse))))
            else:
                alpha = 255
            cible[x, y] = (pixel[0], pixel[1], pixel[2], max(0, min(255, alpha)))
    return sortie


def monochrome(image, couleur, seuil_bas=92, seuil_haut=155):
    """Version une seule couleur, à partir du tracé doré du logo.

    L'alpha est calculé sur la luminance : le bleu marine (sombre) devient
    transparent, les traits et lettres dorés (clairs) deviennent opaques.
    Idéal pour poser le logo sur un fond clair (version marine) ou sombre
    (version blanche) sans pastille.
    """
    luminance = image.convert("L")
    alpha = luminance.point(
        lambda v: 0 if v <= seuil_bas else (255 if v >= seuil_haut else int(255 * (v - seuil_bas) / (seuil_haut - seuil_bas)))
    )
    sortie = Image.new("RGBA", image.size, couleur + (0,))
    sortie.putalpha(alpha)
    return sortie


def fond_degrade(taille, coin=MARINE_CLAIR, centre=MARINE):
    """Fond bleu nuit avec un léger dégradé diagonal."""
    largeur, hauteur = taille
    image = Image.new("RGB", (largeur, hauteur), centre)
    dessin = ImageDraw.Draw(image)
    for i in range(hauteur):
        melange = i / max(1, hauteur - 1)
        couleur = tuple(int(coin[k] + (centre[k] - coin[k]) * melange) for k in range(3))
        dessin.line([(0, i), (largeur, i)], fill=couleur)
    return image


def pastille(image_logo, taille, fond=MARINE, marge=0.06, cercle=False):
    """Logo centré sur un fond uni, éventuellement circulaire."""
    image = Image.new("RGBA", (taille, taille), fond + (255,))
    interne = int(taille * (1 - 2 * marge))
    logo = image_logo.resize((interne, interne), Image.LANCZOS)
    image.paste(logo, ((taille - interne) // 2, (taille - interne) // 2), logo)
    if cercle:
        masque = Image.new("L", (taille, taille), 0)
        ImageDraw.Draw(masque).ellipse((0, 0, taille - 1, taille - 1), fill=255)
        image.putalpha(masque)
    return image


def texte_ajuste(dessin, texte, police_max, largeur_max, chemin_police="Bold"):
    """Réduit la taille de police jusqu'à ce que le texte tienne dans la largeur."""
    taille = police_max
    while taille > 8:
        fonte = police(taille)
        if dessin.textlength(texte, font=fonte) <= largeur_max:
            return fonte
        taille -= 2
    return police(8)


def bandeau(taille, logo_detoure, titre="YALLAH SERVICES", sous_titre="SIMPLIFIEZ-VOUS LA VIE !"):
    largeur, hauteur = taille
    image = fond_degrade(taille).convert("RGBA")
    dessin = ImageDraw.Draw(image)
    dessin.rectangle([0, hauteur - max(4, hauteur // 100), largeur, hauteur], fill=OR)

    # Logo à gauche
    cote_logo = int(hauteur * 0.70)
    marge = int(largeur * 0.045)
    logo = logo_detoure.resize((cote_logo, cote_logo), Image.LANCZOS)
    image.paste(logo, (marge, (hauteur - cote_logo) // 2), logo)

    # Texte à droite du logo, ajusté à l'espace disponible
    x_texte = marge + cote_logo + int(largeur * 0.035)
    largeur_texte = largeur - x_texte - marge

    fonte_titre = texte_ajuste(dessin, titre, int(hauteur * 0.30), largeur_texte)
    fonte_sous = texte_ajuste(dessin, sous_titre, int(hauteur * 0.115), largeur_texte)

    hauteur_titre = dessin.textbbox((0, 0), titre, font=fonte_titre)[3]
    hauteur_sous = dessin.textbbox((0, 0), sous_titre, font=fonte_sous)[3]
    espace = int(hauteur * 0.06)
    bloc = hauteur_titre + espace + hauteur_sous
    y = (hauteur - bloc) // 2

    dessin.text((x_texte, y), titre, font=fonte_titre, fill=OR)
    dessin.text((x_texte, y + hauteur_titre + espace), sous_titre, font=fonte_sous, fill=IVOIRE)
    return image


def enregistrer(image, chemin, fond=None, qualite=95):
    """Aplatit l'image sur un fond si nécessaire, puis enregistre."""
    extension = os.path.splitext(chemin)[1].lower()
    if extension in (".jpg", ".jpeg"):
        if image.mode == "RGBA":
            aplat = Image.new("RGB", image.size, fond or MARINE)
            aplat.paste(image, mask=image.getchannel("A"))
            image = aplat
        else:
            image = image.convert("RGB")
        image.save(chemin, "JPEG", quality=qualite, optimize=True)
    else:
        image.save(chemin, "PNG", optimize=True)
    return os.path.getsize(chemin)


def main():
    racine = os.path.dirname(os.path.abspath(__file__))
    analyseur = argparse.ArgumentParser(description="Génère les déclinaisons du logo Yallah Services.")
    analyseur.add_argument("--source", default=os.path.join(racine, "assets", "logo-source.png"),
                           help="logo source (carré, fond bleu marine)")
    analyseur.add_argument("--sortie", default=os.path.join(racine, "assets", "img"),
                           help="dossier de sortie")
    options = analyseur.parse_args()

    if not os.path.exists(options.source):
        sys.exit("Logo source introuvable : " + options.source)
    os.makedirs(options.sortie, exist_ok=True)

    original = Image.open(options.source).convert("RGB")
    carre = recadrer_sur_le_cercle(original)
    detoure = detourer(carre)
    blanc = monochrome(detoure, (255, 255, 255))
    marine = monochrome(detoure, MARINE)

    fichiers = [
        ("logo.png", pastille(detoure, 512)),
        ("logo-256.png", pastille(detoure, 256)),
        ("logo-128.png", pastille(detoure, 128)),
        ("logo-transparent-512.png", detoure.resize((512, 512), Image.LANCZOS).copy()),
        ("logo-blanc-512.png", blanc.resize((512, 512), Image.LANCZOS)),
        ("logo-marine-512.png", marine.resize((512, 512), Image.LANCZOS)),
        ("favicon-32.png", pastille(detoure, 32, marge=0.02)),
        ("favicon-16.png", pastille(detoure, 16, marge=0.02)),
        ("apple-touch-icon-180.png", pastille(detoure, 180)),
        ("logo-og-1200x630.jpg", bandeau((1200, 630), detoure, "YALLAH SERVICES", "SIMPLIFIEZ-VOUS LA VIE !")),
        ("logo-bandeau-1600x400.png", bandeau((1600, 400), detoure, "YALLAH SERVICES", "AIDES À DOMICILE · MAROC")),
        ("logo-avatar-400.png", pastille(detoure, 400, cercle=True)),
    ]

    print("Déclinaisons du logo — source : " + os.path.relpath(options.source, racine))
    total = 0
    for nom, image in fichiers:
        chemin = os.path.join(options.sortie, nom)
        taille = enregistrer(image, chemin)
        total += taille
        dimensions = "×".join(str(valeur) for valeur in image.size)
        print("  %-28s %-9s %6.1f Ko" % (nom, dimensions, taille / 1024))
    print("  → %d fichiers, %.1f Ko au total dans %s" % (len(fichiers), total / 1024,
                                                         os.path.relpath(options.sortie, racine)))


if __name__ == "__main__":
    main()
