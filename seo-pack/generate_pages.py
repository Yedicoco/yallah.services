#!/usr/bin/env python3
"""Génère les pages locales (service × ville) + sitemap.xml.
Usage : python3 generate_pages.py   -> écrit les .html et sitemap.xml dans ./out/
Copier le contenu de ./out/ à la racine du site. Changer BASE si domaine custom."""
import json, html, os, pathlib

BASE = os.environ.get("BASE_URL", "https://yallahservices-one.vercel.app").rstrip("/")
WA = "212691733585"
TODAY = "2026-10-02"
OUT = pathlib.Path(__file__).resolve().parent / "out"; OUT.mkdir(exist_ok=True)

EXISTING = [  # pages déjà en ligne
    ("femme-menage-casablanca.html", "Femme de ménage à Casablanca"),
    ("nounou-casablanca.html", "Nounou à Casablanca"),
]

GRIDS = {
  "menage": ("Femme de ménage", "femme de ménage", [
      ("Ménage simple dans villa", "4 500 DH/mois"), ("Ménage simple dans mini villa", "4 000 DH/mois"),
      ("Ménage dans appartement", "3 500 DH/mois")]),
  "nounou": ("Nounou", "nounou", [
      ("Nounou d'un enfant", "3 500 DH/mois"), ("Nounou d'un enfant + ménage", "4 000 DH/mois"),
      ("Nounou de 2 enfants avec ménage", "4 500 / 5 000 DH/mois"), ("Nounou de 3 enfants", "4 500 DH/mois"),
      ("Nounou de 3 enfants + ménage", "5 000 DH/mois")]),
  "cuisiniere": ("Cuisinière", "cuisinière", [
      ("Cuisine simple", "4 000 DH/mois"), ("Cuisine / ménage", "5 000 DH/mois"),
      ("Aide cuisine", "3 500 DH/mois"), ("Aide cuisine / ménage", "4 000 DH/mois")]),
  "garde-malade": ("Garde-malade", "garde-malade", [
      ("Garde malade simple", "3 500 DH/mois"), ("Garde malade et ménage", "4 000 DH/mois")]),
}
NONLOGEE = [("Ménage non logée (lun–ven, 9h–17h)", "600 DH/semaine"),
            ("Ménage + cuisine non logée", "800 DH/semaine"),
            ("Ménage + nounou non logée", "800 DH/semaine")]

# Chaque page DOIT garder une intro et une question locale uniques (anti contenu dupliqué).
PAGES = [
 dict(slug="femme-menage-rabat.html", svc="menage", city="Rabat", nonlogee=True,
      quartiers=["Agdal", "Hay Riad", "Souissi", "Océan", "Hassan", "Aviation"],
      intro="À Rabat, la demande vient surtout des appartements d'Agdal et de Hay Riad et des villas de Souissi. Nous vous présentons une femme de ménage adaptée à la taille de votre logement, en formule logée ou non logée.",
      lq="Intervenez-vous à Salé et Témara ?",
      la="Oui, nous intervenons à Rabat et dans les villes voisines (Salé, Témara) selon les profils disponibles. Précisez votre quartier dans votre message WhatsApp."),
 dict(slug="nounou-rabat.html", svc="nounou", city="Rabat", nonlogee=True,
      quartiers=["Agdal", "Hay Riad", "Souissi", "Océan", "Hassan"],
      intro="Pour les familles de Rabat, nous sélectionnons des nounous habituées aux horaires scolaires, aux sorties d'école et à la garde de plusieurs enfants, avec ou sans ménage.",
      lq="La nounou peut-elle accompagner les enfants à l'école ?",
      la="Oui. Les trajets école et les activités font partie du poste si vous le précisez au départ ; nous l'indiquons dans le profil proposé."),
 dict(slug="cuisiniere-casablanca.html", svc="cuisiniere", city="Casablanca", nonlogee=False,
      quartiers=["Anfa", "Maârif", "Gauthier", "Californie", "Ain Diab", "Bouskoura"],
      intro="À Casablanca, nous proposons des cuisinières maîtrisant la cuisine marocaine familiale et les plats européens, pour villas, appartements et maisons avec réceptions régulières.",
      lq="La cuisinière peut-elle gérer les repas de réception ?",
      la="Dites-nous le nombre de couverts habituel et la fréquence des invitations : nous orientons vers un profil à l'aise avec ce volume."),
 dict(slug="garde-malade-casablanca.html", svc="garde-malade", city="Casablanca", nonlogee=False,
      quartiers=["Anfa", "Maârif", "Racine", "Oasis", "Bouskoura", "CIL"],
      intro="Pour accompagner un parent âgé ou une personne malade à domicile à Casablanca, nous proposons des profils patients et attentifs, pour une présence, une aide aux gestes du quotidien et le rappel des médicaments.",
      lq="La garde-malade fait-elle des soins infirmiers ?",
      la="Non : il s'agit d'une aide à domicile (présence, gestes du quotidien, rappel de prise de médicaments). Les actes médicaux restent à la charge d'un professionnel de santé."),
 dict(slug="femme-menage-tanger.html", svc="menage", city="Tanger", nonlogee=False,
      quartiers=["Malabata", "Marshan", "Iberia", "Centre-ville", "Achakar"],
      intro="À Tanger, nous plaçons des femmes de ménage logées pour villas, mini-villas et appartements, avec remplacement garanti pendant la période choisie.",
      lq="Combien de temps pour recevoir un profil à Tanger ?",
      la="Dans un délai de 24 à 72h sur WhatsApp ; l'urgence est traitée en priorité."),
 dict(slug="femme-menage-marrakech.html", svc="menage", city="Marrakech", nonlogee=False,
      quartiers=["Guéliz", "Hivernage", "Palmeraie", "Targa", "Semlalia"],
      intro="À Marrakech, villas de la Palmeraie, riads et appartements de Guéliz : nous adaptons le profil à la surface et au rythme de la maison.",
      lq="Placez-vous du personnel pour un riad ?",
      la="Oui. Indiquez la surface, le nombre d'étages et les tâches attendues ; nous choisissons le profil en conséquence."),
]

COMMON_FAQ = [
 ("Quels sont les frais de mise en relation ?",
  "500 DH (formule Sérénité, remplacements gratuits 2 mois) ou 1 000 DH (formule Premium, 6 mois), payés uniquement après validation du profil. Le salaire est versé directement à l'employée."),
 ("Et si le profil ne convient pas ?",
  "Nous proposons un autre profil gratuitement pendant la période de garantie choisie."),
]

TPL = """<!doctype html>
<html lang="fr-MA"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{{TITLE}}</title>
<meta name="description" content="{{DESC}}">
<link rel="canonical" href="{{CANON}}">
<link rel="alternate" hreflang="fr-MA" href="{{CANON}}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:locale" content="fr_MA">
<meta property="og:title" content="{{TITLE}}"><meta property="og:description" content="{{DESC}}">
<meta property="og:url" content="{{CANON}}"><meta property="og:image" content="{{BASE}}/assets/img/logo-og-1200x630.jpg">
<meta name="theme-color" content="#0d2136">
<link rel="stylesheet" href="/assets/css/style.css">
<!-- Le style inline minimal ci-dessous reste le repli si la feuille globale est indisponible. -->
<style>
:root{--bg:#fff;--fg:#14202e;--navy:#0d2136;--accent:#1e9e5a;--muted:#5b6b7b;--line:#e3e8ee}
@media (prefers-color-scheme:dark){:root{--bg:#0b1622;--fg:#e8eef5;--muted:#9fb0c0;--line:#22344a}}
*{box-sizing:border-box}body{margin:0;padding-bottom:0;overflow-x:hidden;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--fg)}
p{margin:1em 0}ol{margin:1em 0;padding-left:1.5em}li{margin:.35em 0}
header{background:var(--navy);color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
header a{color:#fff;text-decoration:none;font-weight:600}
main{max-width:860px;margin:0 auto;padding:24px 20px 56px}
h1{font-size:1.9rem;line-height:1.2;margin:.2em 0 .4em}h2{font-size:1.3rem;margin:1.8em 0 .5em}
.btn{display:inline-block;background:var(--accent);color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700}
table{width:100%;border-collapse:collapse}td{padding:10px 8px;border-bottom:1px solid var(--line)}td:last-child{text-align:right;font-weight:700;white-space:nowrap}
.tags span{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:3px 12px;margin:3px 4px 3px 0;font-size:.9rem}
details{border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin:8px 0}summary{cursor:pointer;font-weight:600}
nav.rel,nav[aria-label="Fil d'Ariane"]{position:static!important;inset:auto;z-index:auto;padding:0;background:transparent;border:0;transition:none}
nav.rel a{display:block;margin:4px 0}.small{color:var(--muted);font-size:.9rem}
</style>
<script type="application/ld+json">{{JSONLD}}</script>
</head><body>
<header><a href="/">Yallah Services</a><a class="btn" href="https://wa.me/{{WA}}?text={{WATEXT}}">WhatsApp</a></header>
<main>
<nav class="small" aria-label="Fil d'Ariane"><a href="/">Accueil</a> › {{H1}}</nav>
<h1>{{H1}}</h1>
<p>{{INTRO}}</p>
<p><a class="btn" href="https://wa.me/{{WA}}?text={{WATEXT}}">💬 Recevoir un profil dans un délai de 24 à 72h sur WhatsApp</a></p>
<p class="small">Profils vérifiés · Remplacement garanti · Frais payés après validation</p>

<h2>Tarifs {{SVCLOW}} à {{CITY}} (salaire mensuel indicatif)</h2>
<table>{{PRICES}}</table>
<p class="small">Salaires indicatifs, versés directement à l'employée. Frais de mise en relation : 500 ou 1 000 DH, payés après validation du profil. Dernière mise à jour : {{TODAY}}.</p>

<h2>Quartiers desservis à {{CITY}}</h2>
<div class="tags">{{QUARTIERS}}</div>

<h2>Comment ça marche en 4 étapes</h2>
<ol><li>Vous nous écrivez votre besoin (service, quartier, logée ou non).</li>
<li>Vous recevez un profil sélectionné sur WhatsApp dans un délai de 24 à 72h.</li>
<li>Vous rencontrez la candidate et validez, puis les frais sont réglés.</li>
<li>Suivi après placement et remplacement gratuit selon la formule.</li></ol>

<h2>Questions fréquentes</h2>
{{FAQ}}

<h2>Nos autres services et villes</h2>
<nav class="rel">{{LINKS}}</nav>
</main></body></html>
"""

def esc(s): return html.escape(s, quote=True)

def build(p):
    label, low, grid = GRIDS[p["svc"]]
    city = p["city"]
    h1 = f"{label} à {city}"
    title = f"{h1} | Yallah Services"
    desc = f"{label} à {city} : profils sélectionnés reçus sur WhatsApp en 24 à 72h. Remplacement garanti, frais après validation."
    canon = f"{BASE}/{p['slug']}"
    rows = list(grid) + (NONLOGEE if p["nonlogee"] and p["svc"] == "menage" else [])
    prices = "".join(f"<tr><td>{esc(a)}</td><td>{esc(b)}</td></tr>" for a, b in rows)
    quart = "".join(f"<span>{esc(q)}</span>" for q in p["quartiers"])
    faqs = [(p["lq"], p["la"])] + COMMON_FAQ
    faq_html = "".join(f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in faqs)
    links = "".join(f'<a href="/{s}">{esc(t)}</a>' for s, t in EXISTING + [(x["slug"], f'{GRIDS[x["svc"]][0]} à {x["city"]}') for x in PAGES if x is not p])
    jsonld = json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "@id": canon + "#service", "name": h1, "serviceType": label, "url": canon,
         "provider": {"@id": BASE + "/#business"},
         "areaServed": {"@type": "City", "name": city}, "inLanguage": "fr-MA"},
        {"@type": "BreadcrumbList", "@id": canon + "#breadcrumb", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": h1, "item": canon}]},
        {"@type": "FAQPage", "@id": canon + "#faq", "isPartOf": {"@id": BASE + "/#website"},
         "inLanguage": "fr-MA", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]},
    ]}, ensure_ascii=False)
    wa_text = f"Bonjour Yallah Services ! Je cherche une {low} à {city}.".replace(" ", "%20").replace("!", "%21")
    out = TPL
    for k, v in {"TITLE": esc(title), "DESC": esc(desc), "CANON": canon, "BASE": BASE, "H1": esc(h1), "INTRO": esc(p["intro"]),
                 "PRICES": prices, "QUARTIERS": quart, "FAQ": faq_html, "LINKS": links, "JSONLD": jsonld, "WA": WA,
                 "WATEXT": wa_text, "SVCLOW": low, "CITY": esc(city), "TODAY": TODAY}.items():
        out = out.replace("{{" + k + "}}", v)
    (OUT / p["slug"]).write_text(out, encoding="utf-8")

for p in PAGES: build(p)

urls = [("/", "1.0")] + [("/candidature.html", "0.5")] + [("/" + s, "0.8") for s, _ in EXISTING] + [("/" + p["slug"], "0.8") for p in PAGES]
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u, pr in urls:
    sm.append(f"  <url><loc>{BASE}{u}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
sm.append("</urlset>")
(OUT / "sitemap.xml").write_text("\n".join(sm), encoding="utf-8")
print(f"{len(PAGES)} pages + sitemap.xml -> {OUT}/")
