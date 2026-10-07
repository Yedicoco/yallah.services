#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   YALLAH SERVICES — Variantes responsives des images (srcset / sizes)

   Produit, à côté de chaque image source, les largeurs intermédiaires
   en WebP et en JPEG que les pages déclarent dans leurs attributs
   srcset / sizes : le navigateur ne télécharge que la largeur utile à
   l'écran (un téléphone n'a pas besoin du hero de 1 678 px ; la
   vignette vidéo affichée à 180 px n'a pas besoin de 640 px).

       node outils/generer-images.js             (ne produit que ce qui manque)
       node outils/generer-images.js --force     (régénère toutes les variantes)
       node outils/generer-images.js --verifier  (n'écrit rien ; code 1 si une variante manque)

   Prérequis : ImageMagick (commande `magick` ou `convert`)
     Debian/Ubuntu : sudo apt install imagemagick
     macOS         : brew install imagemagick
     Windows       : https://imagemagick.org/script/download.php

   Convention de nommage : <nom>-<largeur>.<webp|jpg> ; la largeur
   native garde le nom d'origine (pack-menage.webp à côté de
   pack-menage.jpg). Les JPEG d'origine ne sont jamais réécrits : ce
   sont aussi les images de partage (og:image, sitemap vidéo).

   Les masters sans perte (PNG) vivent dans contenu/sources/ — dossier
   non copié par build-site.js — pour ne pas alourdir le site publié.

   Le fichier s'utilise aussi comme module (générateur de pages villes,
   vérificateur) : srcset(), candidats(), dimensions(), nomDepuisChemin().
══════════════════════════════════════════════════════════════════ */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RACINE = path.resolve(__dirname, '..');
const DOSSIER_IMAGES = 'assets/img';

/* ── Rôles : largeurs et formats à produire ─────────────────────────
   Les largeurs découlent des tailles réellement affichées (CSS) :
     hero     : pleine largeur jusqu'à 1 360 px (.hero-img-wrap), ×2 sur
                écrans Retina → 480 / 768 / 1080 / 1360 + native 1678
     carte    : cartes de packs ≈ 270 px (ordinateur) à 90 vw (mobile),
                visuel des pages villes ≈ 470 px → 480 + native 800
     vignette : aperçu vidéo B2B affiché à 180 px / 112 px → 240 / 360 + native 640
     logo     : affiché 54 à 82 px → WebP natif seulement (128 et 256 existent en PNG) */
const ROLES = {
  hero: { largeurs: [480, 768, 1080, 1360], formats: ['webp', 'jpg'], qualite: 80 },
  carte: { largeurs: [480], formats: ['webp', 'jpg'], qualite: 80 },
  vignette: { largeurs: [240, 360], formats: ['webp', 'jpg'], qualite: 80 },
  logo: { largeurs: [], formats: ['webp'], qualite: 90 }
};

/* ── Images gérées ────────────────────────────────────────────────── */
function listerCartes() {
  const dossier = path.join(RACINE, DOSSIER_IMAGES);
  if (!fs.existsSync(dossier)) return [];
  return fs.readdirSync(dossier)
    .filter((f) => /^(pack-|garde-malade).*\.jpe?g$/i.test(f))
    .sort()
    .map((f) => ({ role: 'carte', nom: f.replace(/\.jpe?g$/i, ''), source: DOSSIER_IMAGES + '/' + f }));
}

const IMAGES = [
  /* Master PNG sans perte ; repli sur le JPEG publié si le master manque. */
  { role: 'hero', nom: 'hero-services-branded', source: 'contenu/sources/hero-services-branded.png', repli: DOSSIER_IMAGES + '/hero-services-branded.jpg' },
  ...listerCartes(),
  { role: 'vignette', nom: 'videos/prospection-b2b', source: DOSSIER_IMAGES + '/videos/prospection-b2b.jpg' },
  { role: 'logo', nom: 'logo-256', source: DOSSIER_IMAGES + '/logo-256.png' },
  { role: 'logo', nom: 'logo-128', source: DOSSIER_IMAGES + '/logo-128.png' }
];

/* ── Lecture des dimensions sans dépendance (PNG, JPEG, WebP, GIF) ── */
function dimensions(cheminRelatif) {
  const chemin = path.isAbsolute(cheminRelatif) ? cheminRelatif : path.join(RACINE, cheminRelatif);
  if (!fs.existsSync(chemin)) return null;
  const b = fs.readFileSync(chemin);
  if (b.length < 26) return null;

  /* PNG : signature puis bloc IHDR */
  if (b.readUInt32BE(0) === 0x89504e47 && b.toString('ascii', 12, 16) === 'IHDR') {
    return { largeur: b.readUInt32BE(16), hauteur: b.readUInt32BE(20) };
  }
  /* GIF */
  if (b.toString('ascii', 0, 3) === 'GIF') {
    return { largeur: b.readUInt16LE(6), hauteur: b.readUInt16LE(8) };
  }
  /* WebP : RIFF….WEBP puis VP8 / VP8L / VP8X */
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const bloc = b.toString('ascii', 12, 16);
    if (bloc === 'VP8 ' && b.length >= 30) {
      return { largeur: b.readUInt16LE(26) & 0x3fff, hauteur: b.readUInt16LE(28) & 0x3fff };
    }
    if (bloc === 'VP8L' && b.length >= 25) {
      const bits = b.readUInt32LE(21);
      return { largeur: (bits & 0x3fff) + 1, hauteur: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (bloc === 'VP8X' && b.length >= 30) {
      return { largeur: 1 + b.readUIntLE(24, 3), hauteur: 1 + b.readUIntLE(27, 3) };
    }
    return null;
  }
  /* JPEG : parcourir les marqueurs jusqu'au SOFn */
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i += 1; continue; }
      const marqueur = b[i + 1];
      if (marqueur === 0xff) { i += 1; continue; }
      if (marqueur === 0xd8 || (marqueur >= 0xd0 && marqueur <= 0xd7) || marqueur === 0x01) { i += 2; continue; }
      const taille = b.readUInt16BE(i + 2);
      const estSOF = marqueur >= 0xc0 && marqueur <= 0xcf && marqueur !== 0xc4 && marqueur !== 0xc8 && marqueur !== 0xcc;
      if (estSOF) return { largeur: b.readUInt16BE(i + 7), hauteur: b.readUInt16BE(i + 5) };
      if (marqueur === 0xda) break; /* début des données : pas de SOF trouvé */
      i += 2 + taille;
    }
  }
  return null;
}

/* ── Chemins et candidats srcset ──────────────────────────────────── */
function nomDepuisChemin(chemin) {
  const relatif = String(chemin).replace(/^\.?\//, '');
  if (relatif.indexOf(DOSSIER_IMAGES + '/') !== 0) return null;
  return relatif.slice(DOSSIER_IMAGES.length + 1).replace(/\.(?:jpe?g|png|webp)$/i, '');
}

function trouverImage(nom) {
  return IMAGES.find((img) => img.nom === nom) || null;
}

function sourceEffective(image) {
  if (fs.existsSync(path.join(RACINE, image.source))) return image.source;
  if (image.repli && fs.existsSync(path.join(RACINE, image.repli))) return image.repli;
  return null;
}

function cheminVariante(nom, largeur, format, largeurNative) {
  const suffixe = largeur === largeurNative ? '' : '-' + largeur;
  return DOSSIER_IMAGES + '/' + nom + suffixe + '.' + format;
}

/* Liste [{ chemin, largeur }] du plus petit au natif, pour un format donné.
   Retourne null si l'image n'est pas gérée ou si sa source est introuvable. */
function candidats(nom, format) {
  const image = trouverImage(nom);
  if (!image) return null;
  const role = ROLES[image.role];
  if (role.formats.indexOf(format) === -1) return null;
  const source = sourceEffective(image);
  const dims = source ? dimensions(source) : null;
  if (!dims) return null;
  const largeurs = role.largeurs.filter((l) => l < dims.largeur).concat([dims.largeur]);
  return largeurs.map((l) => ({ chemin: cheminVariante(nom, l, format, dims.largeur), largeur: l }));
}

function srcset(nom, format) {
  const liste = candidats(nom, format);
  return liste ? liste.map((c) => c.chemin + ' ' + c.largeur + 'w').join(', ') : '';
}

/* ── Production via ImageMagick ───────────────────────────────────── */
function trouverImageMagick() {
  for (const commande of ['magick', 'convert']) {
    const essai = spawnSync(commande, ['-version'], { encoding: 'utf8' });
    if (!essai.error && essai.status === 0 && /ImageMagick/.test(essai.stdout)) return commande;
  }
  return null;
}

function argumentsFormat(format, qualite) {
  if (format === 'webp') {
    return ['-quality', String(qualite), '-define', 'webp:method=6', '-define', 'webp:use-sharp-yuv=1'];
  }
  /* JPEG : progressif, sans métadonnées, fond blanc si la source avait de la transparence */
  return ['-background', 'white', '-alpha', 'remove', '-alpha', 'off',
    '-interlace', 'JPEG', '-sampling-factor', '4:2:0', '-quality', String(qualite)];
}

function produire(commande, source, sortie, largeur, format, qualite) {
  const args = [path.join(RACINE, source) + '[0]', '-auto-orient', '-colorspace', 'sRGB'];
  if (largeur) args.push('-filter', 'Lanczos', '-resize', largeur + 'x>');
  args.push('-strip');
  args.push(...argumentsFormat(format, qualite));
  args.push(path.join(RACINE, sortie));
  const resultat = spawnSync(commande, args, { encoding: 'utf8' });
  if (resultat.status !== 0) {
    throw new Error('ImageMagick a échoué pour ' + sortie + '\n' + (resultat.stderr || resultat.error));
  }
}

function taches() {
  const liste = [];
  IMAGES.forEach((image) => {
    const role = ROLES[image.role];
    const source = sourceEffective(image);
    if (!source) { liste.push({ image, erreur: 'source introuvable : ' + image.source }); return; }
    const dims = dimensions(source);
    if (!dims) { liste.push({ image, erreur: 'dimensions illisibles : ' + source }); return; }
    const largeurs = role.largeurs.filter((l) => l < dims.largeur).concat([dims.largeur]);
    role.formats.forEach((format) => {
      largeurs.forEach((largeur) => {
        const sortie = cheminVariante(image.nom, largeur, format, dims.largeur);
        if (sortie === source) return; /* le JPEG natif est la source elle-même */
        liste.push({
          image, source, sortie, format,
          largeur: largeur === dims.largeur ? 0 : largeur,
          qualite: role.qualite,
          replis: source !== image.source
        });
      });
    });
  });
  return liste;
}

function principal() {
  const force = process.argv.includes('--force');
  const verifierSeulement = process.argv.includes('--verifier');
  const liste = taches();
  let erreurs = 0;
  let produites = 0;
  let presentes = 0;
  let manquantes = 0;

  const commande = verifierSeulement ? null : trouverImageMagick();
  if (!verifierSeulement && !commande) {
    console.error('❌ ImageMagick introuvable (commande `magick` ou `convert`).');
    console.error('   Debian/Ubuntu : sudo apt install imagemagick · macOS : brew install imagemagick');
    process.exit(1);
  }

  const replisSignales = new Set();
  liste.forEach((tache) => {
    if (tache.erreur) { erreurs += 1; console.log('  ❌ ' + tache.image.nom + ' → ' + tache.erreur); return; }
    if (tache.replis && !replisSignales.has(tache.image.nom)) {
      replisSignales.add(tache.image.nom);
      console.log('  ⚠️  ' + tache.image.nom + ' : master ' + tache.image.source + ' absent, variantes produites depuis ' + tache.source);
    }
    const existe = fs.existsSync(path.join(RACINE, tache.sortie));
    if (verifierSeulement) {
      if (existe) presentes += 1; else { manquantes += 1; console.log('  ❌ variante manquante : ' + tache.sortie); }
      return;
    }
    if (existe && !force) { presentes += 1; return; }
    try {
      produire(commande, tache.source, tache.sortie, tache.largeur, tache.format, tache.qualite);
      produites += 1;
      const octets = fs.statSync(path.join(RACINE, tache.sortie)).size;
      console.log('  ✅ ' + tache.sortie + '  (' + Math.round(octets / 1024) + ' Ko)');
    } catch (e) {
      erreurs += 1;
      console.log('  ❌ ' + e.message);
    }
  });

  console.log('');
  if (verifierSeulement) {
    console.log((manquantes || erreurs ? '❌ ' : '✅ ') + presentes + ' variante(s) présente(s), ' + manquantes + ' manquante(s), ' + erreurs + ' erreur(s).');
    if (manquantes) console.log('   → node outils/generer-images.js');
    process.exit(manquantes || erreurs ? 1 : 0);
  }
  console.log((erreurs ? '❌ ' : '✅ ') + produites + ' variante(s) produite(s), ' + presentes + ' déjà présente(s), ' + erreurs + ' erreur(s).');
  if (produites) console.log('   Pensez à relancer : node build-site.js');
  process.exit(erreurs ? 1 : 0);
}

module.exports = { IMAGES, ROLES, DOSSIER_IMAGES, candidats, srcset, dimensions, nomDepuisChemin, trouverImage };

if (require.main === module) principal();
