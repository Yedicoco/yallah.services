#!/usr/bin/env python3
"""Génère l'image OG de l'accueil (Pillow requis : pip install Pillow).

Le dossier assets/img est le dossier d'images public de ce site statique :
les fichiers y sont servis à /assets/img/ par Vercel et par server.js.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets/img/yallah-services-partage-1200x630.jpg'
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
SCALE = 3
W, H = 1200, 630

FOREST = '#10382f'
DEEP = '#092c25'
IVORY = '#fffaf0'
GOLD = '#d9b86b'


def font(size, bold=False):
    filename = 'DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'
    return ImageFont.truetype(str(FONT_DIR / filename), size * SCALE)


def box(xy):
    return tuple(int(n * SCALE) for n in xy)


def text(xy, value, size, fill, bold=False):
    draw.text(box(xy), value, font=font(size, bold), fill=fill, anchor='lt', stroke_width=0)


image = Image.new('RGB', (W * SCALE, H * SCALE), FOREST)
draw = ImageDraw.Draw(image)

# Large bandeau contrasté et filet de finition.
draw.rounded_rectangle(box((26, 24, 1174, 606)), radius=22 * SCALE,
                       outline=GOLD, width=2 * SCALE)
draw.line(box((78, 223, 1122, 223)), fill=GOLD, width=2 * SCALE)

# Motif discret en haut à droite : arche et soleil, inspirés des lignes marocaines.
draw.arc(box((960, 63, 1100, 203)), start=185, end=355, fill=GOLD, width=4 * SCALE)
draw.arc(box((982, 85, 1078, 181)), start=185, end=355, fill=GOLD, width=2 * SCALE)
draw.ellipse(box((1020, 107, 1040, 127)), fill=GOLD)
draw.line(box((1030, 136, 1030, 182)), fill=GOLD, width=2 * SCALE)

text((77, 65), 'YALLAH SERVICES', 70, IVORY, bold=True)
text((81, 166), "Votre partenaire pour l'aide à domicile au Maroc", 31, IVORY)
text((80, 250), 'Nos services :', 29, GOLD, bold=True)

# 2 colonnes de 3 services, lisibles même une fois l'image réduite.
left = ['• Femme de ménage', '• Cuisinière', "• Nounou et garde d'enfants"]
right = ['• Garde-malade et auxiliaire de vie', '• Grand ménage', '• Services aux entreprises']
for i, service in enumerate(left):
    text((80, 310 + i * 58), service, 30, IVORY)
for i, service in enumerate(right):
    text((599, 310 + i * 58), service, 30, IVORY)

# Contact commercial invariable, mis en avant sur un cartouche ivoire.
draw.rounded_rectangle(box((48, 505, 1152, 587)), radius=12 * SCALE, fill=IVORY)
draw.rectangle(box((48, 505, 56, 587)), fill=GOLD)
text((76, 533), 'Contactez-nous sur WhatsApp :', 25, DEEP, bold=True)
text((643, 524), '+212 691 733 585', 45, DEEP, bold=True)

image.resize((W, H), Image.Resampling.LANCZOS).save(
    OUTPUT, format='JPEG', quality=93, subsampling=0, optimize=True
)
print(f'{OUTPUT}: {W} × {H} px')
