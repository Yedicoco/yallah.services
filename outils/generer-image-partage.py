#!/usr/bin/env python3
"""Redimensionne le visuel fourni pour l'aperçu Open Graph, sans le recréer.

Prérequis : Pillow (python -m pip install Pillow).
Le fichier PNG original est conservé dans assets/img/ ; seule une version JPEG
1200 × 630 est produite. Si le visuel source change après publication, utilisez
un nouveau nom de sortie versionné afin de renouveler l'URL de partage.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/img/yallah-services-partage-original.png'
OUTPUT = ROOT / 'assets/img/yallah-services-partage-v2-1200x630.jpg'
SIZE = (1200, 630)

with Image.open(SOURCE) as source:
    # Le ratio de la source (1730 × 909) est quasiment celui d'Open Graph.
    # Redimensionner sans recadrage conserve l'intégralité du visuel fourni.
    image = source.convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
    image.save(OUTPUT, format='JPEG', quality=95, subsampling=0, optimize=True)

print(f'{OUTPUT}: {SIZE[0]} × {SIZE[1]} px')
