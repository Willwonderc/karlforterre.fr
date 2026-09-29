"""Darshan, édition classique : l'EPUB refusionnable pour les liseuses, Kindle et Google.

    python3 outils/darshan/classique.py

écrit outils/darshan/dist/darshan.epub (dossier non suivi par Git). Python seul, sans
module à installer.

Le livre tel qu'il est. Le texte est lu dans livres/darshan.epub par texte.py, jamais
recopié ni modifié : les coquilles de l'annexe A de docs/plan-darshan.md attendent l'accord
de Karl. Seules changent la présentation (italiques du livre imprimé rétablies, poèmes,
dédicace, lettre de Darshan) et les mentions, celles de Karl, sans rien de la SEP.

Ordre du livre imprimé : couverture, page de titre, sommaire, dédicace, poème d'ouverture,
sept chapitres (un fichier chacun), poème de clôture, colophon.

Vérification intégrée : l'EPUB est d'abord écrit à côté, relu, et son texte (sans balises,
paragraphe par paragraphe, dans l'ordre de lecture) doit être identique, caractère pour
caractère, à texte.texte_du_livre(). Sinon le programme échoue et n'écrit pas le livre.

ÉTAT AU 29 SEPTEMBRE 2026 (session interrompue, à reprendre) :
- FAIT : tout le livre, métadonnées d'accessibilité, sommaire et repères, vérification du
  texte à chaque fabrication (essai réussi avec une couverture provisoire, hors du dépôt).
- MANQUE la couverture src/img/couverture.jpg (en fabrication par ailleurs) : sans elle, le
  programme s'arrête avec un message clair, sans écrire de livre.
- PAS ENCORE FAIT : EPUBCheck 5.4.0, Ace by DAISY et les captures dans Chromium. Tant
  qu'EPUBCheck et Ace n'ont pas passé, CONFORMITE_A11Y reste False : le livre ne déclare
  pas dcterms:conformsTo.
- POLICES : les versions allégées de src/fonts n'ont pas le « ā » de « mudrā » (4 fois dans
  le texte) ; la liseuse le prend dans sa propre police tant qu'elles ne sont pas refaites.

Essai sans la vraie couverture (jamais dans dist/) :
    python3 outils/darshan/classique.py --couverture essai.jpg --sortie /tmp/essai.epub
"""
import argparse
import datetime
import html
import pathlib
import posixpath
import re
import sys
import uuid
import xml.etree.ElementTree as ET
import zipfile

import texte

ICI = pathlib.Path(__file__).resolve().parent
SRC = ICI / "src"
COUVERTURE = SRC / "img" / "couverture.jpg"
SORTIE = ICI / "dist" / "darshan.epub"

# ------------------------------------------------------------ réglages que Karl peut changer
ISBN = ""                        # ex. "978-2-…" : devient l'identifiant et figure au colophon
PREMIERE_PUBLICATION = "2023"    # première publication du texte
EDITION = "2026"                 # parution de cette édition (AAAA, ou AAAA-MM-JJ une fois connue)
ADRESSE_IDENTIFIANT = "https://karlforterre.fr/darshan/classique"   # identifiant urn:uuid stable
CONFORMITE_A11Y = False          # True seulement quand EPUBCheck et Ace passent sans erreur

# Texte alternatif de la couverture : à revoir quand la couverture définitive existe (tout
# texte écrit sur l'image doit y figurer).
ALT_COUVERTURE = ("Couverture de Darshan : le titre sur un ciel étoilé photographié par "
                  "Karl Forterre.")

# Présentation du livre, texte de Karl repris de sa fiche sur karlforterre.fr (index.html).
DESCRIPTION = ("Darshan tente de renouer avec un monde avec lequel il peine à s'accorder. Il "
               "cherche à surmonter ce qui le rend unique pour conquérir le cœur de sa dulcinée "
               "et retrouver son père.")

# Textes de l'interface (sommaire, repères, titres des fichiers) : à valider par Karl.
LIBELLES = {
    "couverture": "Couverture",
    "titre": "Page de titre",
    "sommaire": "Sommaire",
    "reperes": "Repères",
    "debut": "Début du texte",
    "dedicace": "Dédicace",
    "poeme-ouverture": "Poème d’ouverture",
    "poeme-cloture": "Poème de clôture",
    "colophon": "Colophon",
}
GENRE = "nouvelle"
DEVANAGARI = "दर्शन"
LANGUE_DEVANAGARI = "sa"   # la police (Tiro Devanagari Sanskrit) dessine le mot de même en « hi »

# Italiques du livre imprimé (texte.italiques) : les paragraphes entiers, voix intérieures et
# pensées, sont de l'emphase narrative (<em>) ; les mots étrangers ont leur langue (<i lang>).
MOTS_ETRANGERS = {"mudrā": "sa", "Dhyana mudrā": "sa", "Angelo mio": "it"}

# Polices du livre imprimé, allégées (licence SIL OFL, jointe au livre) : Amiri pour le texte,
# Unna pour les titres de chapitre, Tiro Devanagari Sanskrit pour दर्शन.
POLICES = [("Amiri", "normal", "Amiri-Regular.woff2"),
           ("Amiri", "italic", "Amiri-Italic.woff2"),
           ("Unna", "normal", "Unna-Regular.woff2"),
           ("Tiro Darshan", "normal", "Tiro-Darshan.woff2")]
LICENCES = ["OFL-Amiri.txt", "OFL-Unna.txt", "OFL-Tiro.txt"]
TYPES_POLICES = {".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf"}

# ------------------------------------------------------------ découpage du livre (paragraphes)
DEDICACE = range(8, 11)            # « À Maëlle… », « Dans cette novella… », « Bonne lecture. »
POEME_OUVERTURE = range(11, 17)
POEME_CLOTURE = range(216, 222)
LETTRE = range(189, 194)           # la lettre de Darshan, après « Darshan écrit : »
REMERCIEMENTS_2023 = 223           # colophon de 2023 : remerciements pour les polices
IMPRIME = "Ce livre a été imprimé en France. "   # phrase de 2023 qui n'est plus vraie


def arreter(message):
    sys.exit(f"classique.py : {message}")


def controler_decoupage():
    """Le découpage ci-dessus couvre tout le livre, dans l'ordre, sans trou ni recouvrement."""
    debuts = sorted(texte.CHAPITRES)
    if DEDICACE.start != texte.PREMIER or POEME_CLOTURE.stop - 1 != texte.DERNIER:
        arreter("le livre ne commence plus par la dédicace ou ne finit plus par le poème")
    if POEME_OUVERTURE.start != DEDICACE.stop or debuts[0] != POEME_OUVERTURE.stop:
        arreter("la dédicace, le poème d'ouverture et le premier chapitre ne se suivent plus")
    if any(not texte.est_vers(n) for n in [*POEME_OUVERTURE, *POEME_CLOTURE]):
        arreter("un vers des poèmes n'a plus le style « Po-me »")
    if any(texte.est_vers(n) for n in range(debuts[0], POEME_CLOTURE.start)):
        arreter("un vers se trouve dans un chapitre")
    if not texte.lignes[LETTRE.start - 1].startswith("Darshan écrit"):
        arreter("la lettre de Darshan ne suit plus « Darshan écrit : »")


def chapitres():
    """(numéro, premier paragraphe, dernier paragraphe) de chaque chapitre."""
    debuts = sorted(texte.CHAPITRES)
    fins = [d - 1 for d in debuts[1:]] + [POEME_CLOTURE.start - 1]
    return [(texte.CHAPITRES[d], d, f) for d, f in zip(debuts, fins)]


def debuts_de_strophe():
    """Vers qui ouvrent une strophe : dans l'EPUB de 2023, un paragraphe « Po-me » vide sépare
    les strophes. Même lecture que texte.paragraphes(), en gardant les paragraphes vides."""
    with zipfile.ZipFile(texte.LIVRE) as z:
        nom = next(n for n in z.namelist() if n.endswith("Darshan_Epub.xhtml"))
        source = z.read(nom).decode("utf-8")
    corps = source[source.find("<body"):]
    n, vide, debuts = 0, False, set()
    for m in re.finditer(r'<(p|h\d)[^>]*class="([^"]*)"[^>]*>(.*?)</\1>', corps, re.S):
        t = html.unescape(re.sub(r"<[^>]+>", "", re.sub(r"<br\s*/?>", " / ", m.group(3)))).strip()
        if t:
            n += 1
            if texte.lignes.get(n) != t:
                arreter(f"relecture de l'EPUB de 2023 décalée au paragraphe {n}")
            if vide and texte.est_vers(n):
                debuts.add(n)
            vide = False
        elif m.group(2).split()[0] == "Po-me":
            vide = True
    return debuts


# ------------------------------------------------------------ XHTML
def e(s):
    return html.escape(s, quote=False)


def a(s):
    return html.escape(s, quote=True)


def en_ligne(n):
    """Le paragraphe n, échappé, avec les italiques du livre imprimé."""
    t = texte.lignes[n]
    morceaux, k = [], 0
    for debut, fin in sorted(texte.italiques(n)):
        morceaux.append(e(t[k:debut]))
        passage = t[debut:fin]
        if n in texte.ITALIQUES_PARAGRAPHES:
            morceaux.append(f"<em>{e(passage)}</em>")
        elif passage in MOTS_ETRANGERS:
            lg = MOTS_ETRANGERS[passage]
            morceaux.append(f'<i lang="{lg}" xml:lang="{lg}">{e(passage)}</i>')
        else:
            arreter(f"italique sans sens connu au paragraphe {n} : « {passage} » "
                    "(compléter MOTS_ETRANGERS)")
        k = fin
    morceaux.append(e(t[k:]))
    return "".join(morceaux)


def p(n, classe=""):
    c = f' class="{classe}"' if classe else ""
    return f"<p{c}>{en_ligne(n)}</p>"


def document(titre, corps, type_corps="", classe_corps=""):
    attributs = (f' epub:type="{type_corps}"' if type_corps else "") + \
                (f' class="{classe_corps}"' if classe_corps else "")
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="fr" lang="fr">
<head>
<meta charset="UTF-8"/>
<title>{e(titre)}</title>
<link rel="stylesheet" type="text/css" href="../styles/livre.css"/>
</head>
<body{attributs}>
{corps}
</body>
</html>
'''


def page_couverture(largeur, hauteur):
    corps = (f'<div class="couverture"><img src="../images/couverture.jpg" alt="{a(ALT_COUVERTURE)}" '
             f'epub:type="cover" role="doc-cover" width="{largeur}" height="{hauteur}"/></div>')
    return document(LIBELLES["couverture"], corps, "frontmatter", "page-couverture")


def page_titre():
    corps = f'''<section class="page-titre" epub:type="titlepage">
<p class="auteur">Karl Forterre</p>
<h1 class="titre">Darshan</h1>
<p class="devanagari" lang="{LANGUE_DEVANAGARI}" xml:lang="{LANGUE_DEVANAGARI}">{DEVANAGARI}</p>
<p class="genre">{e(GENRE)}</p>
</section>'''
    return document("Darshan", corps, "frontmatter")


def sommaire():
    entrees = [("dedicace.xhtml", LIBELLES["dedicace"]),
               ("poeme-ouverture.xhtml", LIBELLES["poeme-ouverture"])]
    entrees += [(f"chapitre-{c}.xhtml", texte.lignes[d]) for c, d, _ in chapitres()]
    entrees += [("poeme-cloture.xhtml", LIBELLES["poeme-cloture"]),
                ("colophon.xhtml", LIBELLES["colophon"])]
    liste = "\n".join(f'<li><a href="{h}">{e(t)}</a></li>' for h, t in entrees)
    reperes = "\n".join([
        f'<li><a epub:type="cover" href="couverture.xhtml">{e(LIBELLES["couverture"])}</a></li>',
        f'<li><a epub:type="titlepage" href="titre.xhtml">{e(LIBELLES["titre"])}</a></li>',
        f'<li><a epub:type="toc" href="sommaire.xhtml#sommaire">{e(LIBELLES["sommaire"])}</a></li>',
        f'<li><a epub:type="bodymatter" href="poeme-ouverture.xhtml">{e(LIBELLES["debut"])}</a></li>'])
    corps = f'''<nav epub:type="toc" id="sommaire" role="doc-toc">
<h2>{e(LIBELLES["sommaire"])}</h2>
<ol>
{liste}
</ol>
</nav>
<nav epub:type="landmarks" id="reperes" hidden="hidden">
<h2>{e(LIBELLES["reperes"])}</h2>
<ol>
{reperes}
</ol>
</nav>'''
    return document(LIBELLES["sommaire"], corps, "frontmatter")


def page_dedicace():
    corps = ('<section class="dedicace" epub:type="dedication" role="doc-dedication">\n'
             + "\n".join(p(n) for n in DEDICACE) + "\n</section>")
    return document(LIBELLES["dedicace"], corps, "frontmatter")


def page_poeme(vers, cle, strophes):
    groupes, courant = [], []
    for n in vers:
        if n in strophes and courant:
            groupes.append(courant)
            courant = []
        courant.append(n)
    groupes.append(courant)
    corps = '<section class="poeme">\n' + "\n".join(
        '<div class="strophe">\n' + "\n".join(p(n, "vers") for n in g) + "\n</div>" for g in groupes
    ) + "\n</section>"
    return document(LIBELLES[cle], corps, "bodymatter")


def page_chapitre(numero, debut, fin):
    lignes = [f'<section id="chapitre-{numero}" class="chapitre" epub:type="chapter" role="doc-chapter">',
              f"<h2>{en_ligne(debut)}</h2>"]
    for n in range(debut + 1, fin + 1):
        if n == LETTRE.start:
            lignes.append('<blockquote class="lettre">')
        if n == debut + 1:
            lignes.append(p(n, "premier"))
        elif texte.lignes[n].startswith("—") and n not in LETTRE:
            lignes.append(p(n, "replique"))
        else:
            lignes.append(p(n))
        if n == LETTRE.stop - 1:
            lignes.append("</blockquote>")
    lignes.append("</section>")
    return document(texte.lignes[debut], "\n".join(lignes), "bodymatter")


def page_colophon(isbn):
    mentions = texte.lignes[REMERCIEMENTS_2023]
    if texte.styles[REMERCIEMENTS_2023] != "Mentions-l-gales" or not mentions.startswith(IMPRIME):
        arreter("le colophon de 2023 (remerciements pour les polices) n'est plus où il était")
    remerciements = mentions[len(IMPRIME):]
    lignes = ["© Karl Forterre",
              f"Première publication : {PREMIERE_PUBLICATION}",
              f"Présente édition : {EDITION[:4]}"]
    if isbn:
        lignes.append(f"ISBN {ISBN.strip()}")
    lignes.append("Photographie de couverture : Karl Forterre")
    corps = ['<section class="colophon" epub:type="colophon" role="doc-colophon">']
    corps += [f"<p>{e(t)}</p>" for t in lignes]
    corps.append(f'<p class="polices">{e(remerciements)}</p>')
    corps.append('<p><a href="https://karlforterre.fr/">karlforterre.fr</a></p>')
    corps.append('<p><a href="mailto:contact@karlforterre.fr">contact@karlforterre.fr</a></p>')
    corps.append("</section>")
    return document(LIBELLES["colophon"], "\n".join(corps), "backmatter")


# ------------------------------------------------------------ feuille de style
def feuille_de_style():
    """Sobre et réglable : ni taille en px, ni couleur, ni fond, ni interligne imposés au texte."""
    faces = "\n".join(
        f'@font-face {{ font-family: "{famille}"; font-style: {style}; font-weight: normal; '
        f'src: url("../polices/{fichier}"); }}' for famille, style, fichier in POLICES)
    return faces + '''

body { font-family: "Amiri", serif; hyphens: auto; -webkit-hyphens: auto; -epub-hyphens: auto;
       adobe-hyphenate: auto; }
p { margin: 0; text-indent: 1.5em; text-align: justify; orphans: 2; widows: 2; }
p.premier, p.replique { text-indent: 0; }
em, i { font-style: italic; }

/* Titres de chapitre : Unna en petites capitales, comme le livre imprimé */
h2 { font-family: "Unna", serif; font-weight: normal; font-variant: small-caps; font-size: 1.5em;
     line-height: 1.2; text-align: center; hyphens: none; -webkit-hyphens: none; -epub-hyphens: none;
     margin: 2.5em 0 1.6em; page-break-after: avoid; break-after: avoid; }

/* Couverture */
body.page-couverture { margin: 0; padding: 0; }
.couverture { margin: 0; padding: 0; text-align: center; }
.couverture img { width: auto; height: auto; max-width: 100%; max-height: 100vh; }

/* Page de titre */
.page-titre { margin-top: 4em; text-align: center; }
.page-titre p { text-align: center; text-indent: 0; hyphens: none; -webkit-hyphens: none; }
.page-titre .auteur { font-size: 1.3em; margin-bottom: 2.5em; }
.page-titre h1 { font-family: "Amiri", serif; font-weight: normal; font-size: 2.6em; line-height: 1.2;
                 margin: 0 0 0.4em; }
.page-titre .devanagari { font-family: "Tiro Darshan", serif; font-size: 1.6em; margin-bottom: 2.5em; }
.page-titre .genre { font-style: italic; }

/* Sommaire */
nav ol { list-style: none; margin: 0; padding: 0; }
nav li { margin: 0 0 0.6em; text-align: center; }
nav a { text-decoration: none; }

/* Dédicace : en italique, à droite */
.dedicace { margin: 3em 0 0 20%; }
.dedicace p { font-style: italic; text-align: right; text-indent: 0; margin-bottom: 0.8em;
              hyphens: none; -webkit-hyphens: none; -epub-hyphens: none; }

/* Poèmes : centrés et aérés, un vers par paragraphe */
.poeme { margin: 3em 0; }
.strophe { margin: 0 0 2em; page-break-inside: avoid; break-inside: avoid; }
p.vers { text-align: center; text-indent: 0; margin: 0 0 0.9em; hyphens: none; -webkit-hyphens: none;
         -epub-hyphens: none; }

/* Lettre de Darshan : en italique, centrée */
.lettre { margin: 1.2em 0; font-style: italic; page-break-inside: avoid; break-inside: avoid; }
.lettre p { text-align: center; text-indent: 0; margin: 0 0 0.4em; hyphens: none; -webkit-hyphens: none;
            -epub-hyphens: none; }

/* Colophon */
.colophon { margin-top: 3em; }
.colophon p { text-align: center; text-indent: 0; margin: 0 0 0.5em; font-size: 0.9em;
              hyphens: none; -webkit-hyphens: none; -epub-hyphens: none; }
.colophon p.polices { text-align: justify; margin: 1.5em 0; }
'''


# ------------------------------------------------------------ paquet
def isbn13(isbn):
    chiffres = re.sub(r"[\s-]", "", isbn)
    if not re.fullmatch(r"97[89]\d{10}", chiffres):
        arreter(f"ISBN illisible : {isbn!r} (13 chiffres, commençant par 978 ou 979)")
    cle = (10 - sum(int(c) * (3 if k % 2 else 1) for k, c in enumerate(chiffres[:12])) % 10) % 10
    if cle != int(chiffres[12]):
        arreter(f"ISBN faux : la clé de contrôle de {isbn} devrait être {cle}")
    return chiffres


def dimensions_jpeg(donnees):
    """Largeur et hauteur d'un JPEG, lues dans son en-tête."""
    if donnees[:3] != b"\xff\xd8\xff":
        return None
    i = 2
    while i + 9 < len(donnees):
        if donnees[i] != 0xFF:
            i += 1
            continue
        marqueur = donnees[i + 1]
        if marqueur == 0xFF:
            i += 1
            continue
        if marqueur in (0x01, 0xD8) or 0xD0 <= marqueur <= 0xD7:
            i += 2
            continue
        if 0xC0 <= marqueur <= 0xCF and marqueur not in (0xC4, 0xC8, 0xCC):
            return int.from_bytes(donnees[i + 7:i + 9], "big"), int.from_bytes(donnees[i + 5:i + 7], "big")
        i += 2 + int.from_bytes(donnees[i + 2:i + 4], "big")
    return None


def paquet(identifiant, isbn, maintenant, pages):
    manifeste = [f'<item id="{cle}" href="texte/{cle}.xhtml" media-type="application/xhtml+xml"'
                 + (' properties="nav"' if cle == "sommaire" else "") + "/>" for cle, _ in pages]
    manifeste.append('<item id="css" href="styles/livre.css" media-type="text/css"/>')
    for k, (_, _, fichier) in enumerate(POLICES, 1):
        type_ = TYPES_POLICES[pathlib.Path(fichier).suffix]
        manifeste.append(f'<item id="police-{k}" href="polices/{fichier}" media-type="{type_}"/>')
    for k, fichier in enumerate(LICENCES, 1):
        manifeste.append(f'<item id="licence-{k}" href="polices/{fichier}" media-type="text/plain"/>')
    manifeste.append('<item id="image-couverture" href="images/couverture.jpg" media-type="image/jpeg" '
                     'properties="cover-image"/>')
    spine = "\n".join(f'  <itemref idref="{cle}"/>' for cle, _ in pages)
    type_identifiant = ('\n  <meta refines="#uid" property="identifier-type" scheme="onix:codelist5">15</meta>'
                        if isbn else "")
    conformite = ('''
  <meta property="dcterms:conformsTo">EPUB Accessibility 1.1 - WCAG 2.1 Level AA</meta>
  <meta property="a11y:certifiedBy">Karl Forterre</meta>''' if CONFORMITE_A11Y else "")
    resume = ("Livre refusionnable et entièrement textuel : la taille du texte, la police, l’interligne, "
              "les marges et les couleurs, thème sombre compris, se règlent dans la liseuse, car le livre "
              "n’en impose aucune. Sommaire, repères, titres de chapitre et ordre de lecture sont balisés ; "
              "la langue des mots sanskrits et italiens est indiquée. Seule image, la couverture a un texte "
              "alternatif. Ni clignotement, ni son, ni mouvement.")
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="fr"
  prefix="ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="uid">{identifiant}</dc:identifier>{type_identifiant}
  <dc:title>Darshan</dc:title>
  <dc:creator id="auteur">Karl Forterre</dc:creator>
  <meta refines="#auteur" property="role" scheme="marc:relators">aut</meta>
  <meta refines="#auteur" property="file-as">Forterre, Karl</meta>
  <dc:publisher>Karl Forterre</dc:publisher>
  <dc:language>fr</dc:language>
  <dc:date>{EDITION}</dc:date>
  <dc:description>{e(DESCRIPTION)}</dc:description>
  <meta property="dcterms:modified">{maintenant}</meta>
  <meta name="cover" content="image-couverture"/>
  <meta property="ibooks:specified-fonts">true</meta>
  <meta property="schema:accessMode">textual</meta>
  <meta property="schema:accessMode">visual</meta>
  <meta property="schema:accessModeSufficient">textual</meta>
  <meta property="schema:accessibilityFeature">structuralNavigation</meta>
  <meta property="schema:accessibilityFeature">tableOfContents</meta>
  <meta property="schema:accessibilityFeature">readingOrder</meta>
  <meta property="schema:accessibilityFeature">alternativeText</meta>
  <meta property="schema:accessibilityFeature">displayTransformability</meta>
  <meta property="schema:accessibilityHazard">none</meta>
  <meta property="schema:accessibilitySummary">{e(resume)}</meta>{conformite}
</metadata>
<manifest>
{chr(10).join("  " + m for m in manifeste)}
</manifest>
<spine>
{spine}
</spine>
</package>
'''


CONTENEUR = '''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
'''


# ------------------------------------------------------------ vérification du texte
X = "{http://www.w3.org/1999/xhtml}"
BLOCS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li"}
DOCUMENTS_DU_TEXTE = {"dedicace.xhtml", "poeme-ouverture.xhtml", "poeme-cloture.xhtml",
                      *(f"chapitre-{c}.xhtml" for c in texte.CHAPITRES.values())}


def blocs(element, nom_document):
    """Textes des blocs (paragraphes, titres) d'un document, dans l'ordre ; du texte hors d'un
    bloc serait du texte ajouté au livre : erreur."""
    sortie = []

    def parcourir(el):
        if el.tag.replace(X, "") in BLOCS:
            sortie.append("".join(el.itertext()))
            return
        if (el.text or "").strip():
            arreter(f"texte hors paragraphe dans {nom_document} : {el.text.strip()[:60]!r}")
        for enfant in el:
            parcourir(enfant)
            if (enfant.tail or "").strip():
                arreter(f"texte hors paragraphe dans {nom_document} : {enfant.tail.strip()[:60]!r}")

    parcourir(element)
    return sortie


def verifier(epub):
    """Relit l'EPUB produit : chaque document bien formé, et le texte du livre identique."""
    O = "{http://www.idpf.org/2007/opf}"
    with zipfile.ZipFile(epub) as z:
        noms = z.namelist()
        if noms[0] != "mimetype" or z.getinfo("mimetype").compress_type != zipfile.ZIP_STORED:
            arreter("le fichier mimetype doit venir en premier, sans compression")
        conteneur = ET.fromstring(z.read("META-INF/container.xml"))
        chemin_opf = conteneur.find(".//{urn:oasis:names:tc:opendocument:xmlns:container}rootfile").get("full-path")
        opf = ET.fromstring(z.read(chemin_opf))
        base = posixpath.dirname(chemin_opf)
        items = {i.get("id"): i.get("href") for i in opf.iter(O + "item")}
        paragraphes = []
        for ref in opf.iter(O + "itemref"):
            href = items[ref.get("idref")]
            try:
                doc = ET.fromstring(z.read(posixpath.join(base, href)))
            except ET.ParseError as erreur:
                arreter(f"{href} n'est pas du XHTML bien formé : {erreur}")
            if posixpath.basename(href) in DOCUMENTS_DU_TEXTE:
                paragraphes += blocs(doc.find(X + "body"), href)
    attendu = texte.texte_du_livre().split("\n")
    for k, (lu, juste) in enumerate(zip(paragraphes, attendu)):
        if lu != juste:
            i = next((j for j, (x, y) in enumerate(zip(lu, juste)) if x != y), min(len(lu), len(juste)))
            arreter(f"texte différent au paragraphe {texte.PREMIER + k}, caractère {i} :\n"
                    f"  livre : {juste[max(0, i - 30):i + 30]!r}\n  EPUB  : {lu[max(0, i - 30):i + 30]!r}")
    if len(paragraphes) != len(attendu):
        arreter(f"{len(paragraphes)} paragraphes dans l'EPUB, {len(attendu)} dans le livre")
    if "\n".join(paragraphes) != texte.texte_du_livre():
        arreter("le texte de l'EPUB diffère de celui du livre")
    return len(paragraphes)


# ------------------------------------------------------------ fabrication
def main():
    parser = argparse.ArgumentParser(description="Fabrique l'EPUB classique de Darshan.")
    parser.add_argument("--couverture", type=pathlib.Path, default=COUVERTURE,
                        help="autre couverture JPEG, pour un essai (par défaut src/img/couverture.jpg)")
    parser.add_argument("--sortie", type=pathlib.Path, default=SORTIE,
                        help="fichier écrit (par défaut dist/darshan.epub)")
    args = parser.parse_args()

    if not args.couverture.is_file():
        arreter(f"couverture introuvable : {args.couverture}\n"
                "La couverture (1600 × 2400, JPEG) doit être déposée à cet endroit avant de fabriquer le livre.")
    image = args.couverture.read_bytes()
    dimensions = dimensions_jpeg(image)
    if not dimensions:
        arreter(f"la couverture n'est pas un JPEG lisible : {args.couverture}")
    manquantes = [f for _, _, f in POLICES if not (SRC / "fonts" / f).is_file()]
    manquantes += [f for f in LICENCES if not (SRC / "fonts" / f).is_file()]
    if manquantes:
        arreter("fichiers manquants dans src/fonts : " + ", ".join(manquantes))

    controler_decoupage()
    strophes = debuts_de_strophe()
    isbn = isbn13(ISBN) if ISBN.strip() else ""
    identifiant = f"urn:isbn:{isbn}" if isbn else f"urn:uuid:{uuid.uuid5(uuid.NAMESPACE_URL, ADRESSE_IDENTIFIANT)}"
    maintenant = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    pages = [("couverture", page_couverture(*dimensions)),
             ("titre", page_titre()),
             ("sommaire", sommaire()),
             ("dedicace", page_dedicace()),
             ("poeme-ouverture", page_poeme(POEME_OUVERTURE, "poeme-ouverture", strophes))]
    pages += [(f"chapitre-{c}", page_chapitre(c, d, f)) for c, d, f in chapitres()]
    pages += [("poeme-cloture", page_poeme(POEME_CLOTURE, "poeme-cloture", strophes)),
              ("colophon", page_colophon(isbn))]

    fichiers = [("META-INF/container.xml", CONTENEUR),
                ("EPUB/package.opf", paquet(identifiant, isbn, maintenant, pages))]
    fichiers += [(f"EPUB/texte/{cle}.xhtml", contenu) for cle, contenu in pages]
    fichiers.append(("EPUB/styles/livre.css", feuille_de_style()))
    fichiers += [(f"EPUB/polices/{f}", (SRC / "fonts" / f).read_bytes()) for _, _, f in POLICES]
    fichiers += [(f"EPUB/polices/{f}", (SRC / "fonts" / f).read_bytes()) for f in LICENCES]
    fichiers.append(("EPUB/images/couverture.jpg", image))

    sortie = args.sortie.resolve()
    sortie.parent.mkdir(parents=True, exist_ok=True)
    provisoire = sortie.with_name(sortie.name + ".partiel")
    horodatage = datetime.datetime.now().timetuple()[:6]
    with zipfile.ZipFile(provisoire, "w") as z:
        z.writestr(zipfile.ZipInfo("mimetype", horodatage), "application/epub+zip",
                   compress_type=zipfile.ZIP_STORED)
        for nom, contenu in fichiers:
            info = zipfile.ZipInfo(nom, horodatage)
            info.external_attr = 0o644 << 16
            z.writestr(info, contenu, compress_type=zipfile.ZIP_DEFLATED)
    try:
        nombre = verifier(provisoire)
    except SystemExit:
        provisoire.unlink(missing_ok=True)
        raise
    provisoire.replace(sortie)
    print(f"{sortie} : {sortie.stat().st_size / 1024:.0f} Ko, {len(pages)} documents ; "
          f"texte vérifié ({nombre} paragraphes identiques au livre).")


if __name__ == "__main__":
    main()
