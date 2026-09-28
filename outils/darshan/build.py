"""Construit la tranche verticale de Darshan : édition web et EPUB 3 en mise en page fixe.

Usage : python3 outils/darshan/build.py  (Python seul, sans module à installer).
Sorties dans outils/darshan/dist/ : web/index.html et darshan-extrait-jouable.epub.

Le texte est lu dans l'EPUB publié (livres/darshan.epub), jamais recopié à la main :
chaque paragraphe est découpé en « temps », et le programme vérifie que les temps
recollés redonnent exactement le paragraphe d'origine.
"""
import html
import json
import pathlib
import random
import re
import shutil
import uuid
import zipfile
from datetime import datetime, timezone

ICI = pathlib.Path(__file__).resolve().parent
SRC = ICI / "src"
DIST = ICI / "dist"
LIVRE = ICI.parent.parent / "livres" / "darshan.epub"


# ---------------------------------------------------------------- le texte, tel quel
def paragraphes(epub):
    """Paragraphes et titres du livre, dans l'ordre, numérotés à partir de 1."""
    with zipfile.ZipFile(epub) as z:
        nom = next(n for n in z.namelist() if n.endswith("Darshan_Epub.xhtml"))
        source = z.read(nom).decode("utf-8")
    corps = source[source.find("<body"):]
    sortie = []
    for m in re.finditer(r'<(p|h\d)[^>]*class="([^"]*)"[^>]*>(.*?)</\1>', corps, re.S):
        texte = html.unescape(re.sub(r"<[^>]+>", "", re.sub(r"<br\s*/?>", " / ", m.group(3)))).strip()
        if texte:
            sortie.append(texte)
    return {i: t for i, t in enumerate(sortie, start=1)}


lignes = paragraphes(LIVRE)


def position(numero, rang):
    """Position de lecture : paragraphe et caractère, en un seul nombre croissant."""
    return numero * 100000 + rang


def temps(numero, *debuts):
    """Découpe le paragraphe `numero` aux phrases qui commencent par `debuts`.

    Chaque temps garde sa position de fin dans le livre (data-lu) : le moteur sait
    ainsi, à tout moment, jusqu'où le lecteur a lu, et n'affiche dans les fiches
    d'objet que des phrases déjà lues."""
    p = lignes[numero]
    coupes = [0]
    for d in debuts:
        k = p.find(d)
        assert k > 0, (numero, d)
        coupes.append(k)
    coupes.append(len(p))
    morceaux = [(p[a:b], numero, a, b) for a, b in zip(coupes, coupes[1:])]
    assert "".join(m[0] for m in morceaux) == p
    return morceaux


def para(morceaux, classe=None):
    c = f' class="{classe}"' if classe else ""
    corps = "".join(f'<span class="temps" data-lu="{position(n, fin)}">{html.escape(m, quote=False)}</span>'
                    for m, n, debut, fin in morceaux)
    return f"<p{c}>{corps}</p>"


def debut(morceaux):
    """Position de lecture juste avant le premier temps d'une page."""
    m, n, d, f = morceaux[0]
    return position(n, d)


POEME = [temps(i) for i in range(11, 17)]
assert POEME[0][0][0].startswith("Les murs séparent") and POEME[-1][0][0].startswith("La noirceur figée")
assert lignes[17] == "Un ciel mouvant"
p18 = temps(18)
p19 = temps(19, "Il est d’un régal")
p20 = temps(20, "Comme toi je vis", "Encore une fois")
p21 = temps(21, "Il enjambe", "Ses lunettes fumées")
p22 = temps(22, "Face à l’assemblage", "Les tenant par la branche", "D’un geste vif",
            "Elle est adaptée", "Elle est affrétée", "À peine insérée")
p23 = temps(23, "Il ne reste qu’à la pousser", "Notre héros affleure", "Face à lui s’écoule")


# ---------------------------------------------------------------- les objets et leurs phrases
# Une fiche d'objet ne contient que des phrases du livre, vérifiées ici mot pour mot, et
# le moteur n'affiche que celles que le lecteur a déjà lues (position « lu »).
CHAPITRE_1 = "Un ciel mouvant"
OBJETS = {
    "lunettes": {
        "nom": "Les lunettes fumées",
        "citations": [
            (21, "Ses lunettes fumées sur le nez, son gilet de toile sans manches en prise avec le vent, Darshan danse sur les tuiles jusqu’au pigeonnier.", CHAPITRE_1),
            (22, "Face à l’assemblage de grilles et de bois, il ôte ses lunettes.", CHAPITRE_1),
            (22, "Les tenant par la branche, elles vibrent entre ses doigts, leurs couleurs s’altèrent.", CHAPITRE_1),
        ],
    },
    "cle": {
        "nom": "La clé",
        "citations": [
            (22, "D’un geste vif, digne d’un prestidigitateur, elles se transforment, passant de lunettes à une clé au format pincé.", CHAPITRE_1),
            (22, "Elle est adaptée à la porte par sa finesse\u00a0; assortie aux grillages par ses rayures et sa rouille.", CHAPITRE_1),
            (22, "Elle est affrétée pour l’amener où son cœur l’emportera.", CHAPITRE_1),
        ],
    },
}


def donnees_objets():
    """Les fiches, prêtes pour le moteur ; chaque citation est cherchée dans son paragraphe."""
    sortie = {}
    for cle, o in OBJETS.items():
        cites = []
        for numero, texte, chapitre in o["citations"]:
            k = lignes[numero].find(texte)
            assert k >= 0, (cle, numero, texte)
            cites.append({"texte": texte, "chapitre": chapitre, "lu": position(numero, k + len(texte))})
        sortie[cle] = {"nom": o["nom"], "citations": cites}
    brut = json.dumps(sortie, ensure_ascii=False)
    # sûr en HTML comme en XHTML
    return brut.replace("&", "\\u0026").replace("<", "\\u003c").replace(">", "\\u003e")


# ---------------------------------------------------------------- la carte du carnet des portes
def carte_portes():
    def xy(lon, lat):
        return (lon + 180) / 360 * 1060, (90 - lat) / 180 * 600
    rng = random.Random(4)
    fond = "".join(f'<circle cx="{rng.uniform(0, 1060):.0f}" cy="{rng.uniform(0, 600):.0f}" r="{rng.uniform(0.6, 1.8):.1f}" fill="#d8d2c2" opacity="{rng.uniform(0.2, 0.6):.2f}"/>' for _ in range(160))
    grille = "".join(f'<line x1="0" y1="{y}" x2="1060" y2="{y}" stroke="#39406a" stroke-width="1" opacity="0.5"/>' for y in range(0, 601, 100))
    grille += "".join(f'<line x1="{x}" y1="0" x2="{x}" y2="600" stroke="#39406a" stroke-width="1" opacity="0.5"/>' for x in range(0, 1061, 106))
    px, py = xy(2.35, 48.86)
    ax, ay = xy(76.35, 10.11)
    mx, my = (px + ax) / 2, min(py, ay) - 120
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 600" role="img" '
            f'aria-label="Carte en forme de ciel étoilé : une ligne d’or relie Paris à Aluva.">'
            f'<rect width="1060" height="600" fill="#070a1c"/>{grille}{fond}'
            f'<path d="M{px:.0f},{py:.0f} Q{mx:.0f},{my:.0f} {ax:.0f},{ay:.0f}" fill="none" stroke="#f4c56a" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>'
            f'<circle cx="{px:.0f}" cy="{py:.0f}" r="9" fill="#fff3cf"/><circle cx="{ax:.0f}" cy="{ay:.0f}" r="9" fill="#fff3cf"/>'
            f'<text x="{px - 14:.0f}" y="{py - 18:.0f}" fill="#efe6d2" font-size="30" text-anchor="end" font-family="Unna, serif">Paris</text>'
            f'<text x="{ax + 16:.0f}" y="{ay + 40:.0f}" fill="#efe6d2" font-size="30" font-family="Unna, serif">Aluva</text></svg>')


# ---------------------------------------------------------------- les scènes
def scenes(img):
    """Balisage des scènes ; `img` est le préfixe des chemins d'images."""
    return [
        dict(id="seuil", titre="Darshan", son="cosmos", lu0=0, objets="", html=f'''
<div class="decor" aria-hidden="true"><img src="{img}ciel-poeme.jpg" alt=""/></div>
<div class="titre-livre">
  <p class="auteur">Karl Forterre</p>
  <h1 class="titre">Darshan</h1>
  <p class="devanagari" lang="sa">दर्शन</p>
  <p class="genre">nouvelle — extrait jouable</p>
  <p class="ui" style="margin-top: 9cqw;"><button type="button" class="bouton-porte">Ouvrir</button></p>
</div>'''),
        dict(id="poeme", titre="Poème d’ouverture", son="cosmos", lu0=debut(POEME[0]), objets="", html=f'''
<div class="decor" aria-hidden="true"><img src="{img}ciel-poeme.jpg" alt=""/></div>
<div class="texte poeme">{"".join(para(l) for l in POEME)}</div>'''),
        dict(id="toit", titre="Un ciel mouvant", son="nuit", lu0=debut(p18), objets="", html=f'''
<div class="decor" aria-hidden="true">
  <div class="ciel-tournant calque-anime"><img src="{img}ciel-nuit.jpg" alt=""/></div>
  <img src="{img}ville.webp" alt=""/>
</div>
<div class="texte">
  <h1 class="chapitre">Un ciel mouvant</h1>
  {para(p18)}{para(p19)}{para(p20, "voix")}
</div>'''),
        dict(id="tuiles", titre="Sur les tuiles du seizième", son="nuit", lu0=debut(p21), objets="", html=f'''
<div class="decor" aria-hidden="true">
  <div class="monde calque-anime">
    <img src="{img}ciel-nuit.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
    <img src="{img}ville.webp" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
  </div>
</div>
<div class="texte">{para(p21)}</div>'''),
        dict(id="pigeonnier", titre="Le pigeonnier", son="nuit", lu0=debut(p22), objets="lunettes", html=f'''
<div class="decor calque-anime" aria-hidden="true"><img src="{img}porte.jpg" alt=""/></div>
<div class="texte en-haut">{para(p22)}{para(p23[:2])}</div>'''),
        dict(id="aluva", titre="Aluva", son="kerala", lu0=debut(p23[2:]), objets="cle", html=f'''
<div class="decor" aria-hidden="true"><img src="{img}aluva.jpg" alt=""/></div>
<div class="texte clair">{para(p23[2:], "suite-para")}</div>
<div class="fin-extrait ui">
  <p class="fin-titre">Fin de l’extrait jouable</p>
  <p>Première porte franchie : du pigeonnier du seizième au local à kayaks d’Aluva.</p>
  <p><button type="button" class="ouvrir-carnet">Carnet des portes</button> <button type="button" class="recommencer">Recommencer</button></p>
</div>
<div class="carnet ui" role="dialog" aria-label="Carnet des portes">
  <h2>Carnet des portes</h2>
  {carte_portes()}
  <p>1. Le pigeonnier des toits du seizième, à Paris → le local à kayaks d’Aluva, au Kerala.</p>
  <p style="opacity:.7;font-style:italic;">Chaque porte franchie s’allume ici comme une étoile. (Toucher pour fermer.)</p>
</div>'''),
    ]


POLICES = ["Amiri-Regular.woff2", "Amiri-Italic.woff2", "Amiri-Bold.woff2", "Unna-Regular.woff2",
           "Unna-Italic.woff2", "Tiro-Darshan.woff2"]
IMAGES = ["ciel-poeme.jpg", "ciel-nuit.jpg", "ville.webp", "porte.jpg", "aluva.jpg"]
TYPES = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


def css_source():
    return (SRC / "moteur.css").read_text(encoding="utf-8")


def css_epub():
    """En mise en page fixe, la page mesure 1200 px : 1cqw = 12 px, écrit en dur."""
    return re.sub(r"(-?\d+(?:\.\d+)?)cqw", lambda m: f"{float(m.group(1)) * 12:g}px", css_source())


def copier_ressources(racine):
    for sous in ("css", "js", "fonts", "img"):
        (racine / sous).mkdir(parents=True, exist_ok=True)
    for f in POLICES:
        shutil.copy(SRC / "fonts" / f, racine / "fonts" / f)
    for f in IMAGES:
        shutil.copy(SRC / "img" / f, racine / "img" / f)
    shutil.copy(SRC / "moteur.js", racine / "js" / "moteur.js")


# ---------------------------------------------------------------- édition web
def web():
    racine = DIST / "web"
    if racine.exists():
        shutil.rmtree(racine)
    copier_ressources(racine)
    (racine / "css" / "moteur.css").write_text(css_source(), encoding="utf-8")
    corps = "\n".join(f'<section class="scene" id="s-{s["id"]}" data-scene="{s["id"]}" data-son="{s["son"]}" '
                      f'data-lu0="{s["lu0"]}" data-objets="{s["objets"]}" '
                      f'aria-label="{html.escape(s["titre"])}">{s["html"]}</section>' for s in scenes("img/"))
    page = f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Darshan — extrait jouable</title>
<meta name="description" content="Prototype : le début de Darshan, nouvelle de Karl Forterre, en livre qui se joue."/>
<link rel="stylesheet" href="css/moteur.css"/>
<style>html,body{{height:100%;}} body{{display:flex;align-items:center;justify-content:center;min-height:100%;}}</style>
</head>
<body>
<main class="plateau">
{corps}
</main>
<script type="application/json" id="donnees-objets">{donnees_objets()}</script>
<script src="js/moteur.js"></script>
</body>
</html>
'''
    (racine / "index.html").write_text(page, encoding="utf-8")
    return racine


# ---------------------------------------------------------------- EPUB 3, mise en page fixe
def xhtml(s):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="fr" lang="fr" class="epub">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1200, height=1800"/>
<title>{html.escape(s["titre"])}</title>
<link rel="stylesheet" type="text/css" href="../css/moteur.css"/>
</head>
<body>
<div class="plateau">
<section class="scene" id="s-{s["id"]}" data-scene="{s["id"]}" data-son="{s["son"]}" data-lu0="{s["lu0"]}" data-objets="{s["objets"]}" epub:type="{"titlepage" if s["id"] == "seuil" else "bodymatter"}" aria-label="{html.escape(s["titre"])}">{s["html"]}</section>
</div>
<script type="application/json" id="donnees-objets">{donnees_objets()}</script>
<script src="../js/moteur.js"></script>
</body>
</html>
'''


def epub():
    racine = DIST / "epub"
    if racine.exists():
        shutil.rmtree(racine)
    contenu = racine / "EPUB"
    copier_ressources(contenu)
    (contenu / "css" / "moteur.css").write_text(css_epub(), encoding="utf-8")
    (contenu / "xhtml").mkdir()
    pages = []
    for n, s in enumerate(scenes("../img/"), start=1):
        nom = f"{n:02d}-{s['id']}.xhtml"
        (contenu / "xhtml" / nom).write_text(xhtml(s), encoding="utf-8")
        pages.append((nom, s))
    toc = "".join(f'<li><a href="xhtml/{nom}">{html.escape(s["titre"])}</a></li>' for nom, s in pages)
    (contenu / "nav.xhtml").write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="fr" lang="fr">
<head><meta charset="UTF-8"/><title>Sommaire</title></head>
<body>
<nav epub:type="toc" id="toc"><h1>Sommaire</h1><ol>{toc}</ol></nav>
<nav epub:type="landmarks" hidden="hidden"><h1>Repères</h1><ol>
<li><a epub:type="titlepage" href="xhtml/{pages[0][0]}">Titre</a></li>
<li><a epub:type="bodymatter" href="xhtml/{pages[1][0]}">Début du texte</a></li>
</ol></nav>
</body>
</html>
''', encoding="utf-8")
    maintenant = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifeste = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
                 '<item id="css" href="css/moteur.css" media-type="text/css"/>',
                 '<item id="js" href="js/moteur.js" media-type="application/javascript"/>']
    for f in POLICES:
        manifeste.append(f'<item id="f-{f.split(".")[0]}" href="fonts/{f}" media-type="font/woff2"/>')
    for f in IMAGES:
        prop = ' properties="cover-image"' if f == "ciel-poeme.jpg" else ""
        manifeste.append(f'<item id="i-{f.split(".")[0]}" href="img/{f}" media-type="{TYPES[pathlib.Path(f).suffix]}"{prop}/>')
    for nom, s in pages:
        props = "scripted svg" if "<svg" in s["html"] else "scripted"
        manifeste.append(f'<item id="p-{s["id"]}" href="xhtml/{nom}" media-type="application/xhtml+xml" properties="{props}"/>')
    spine = "".join(f'<itemref idref="p-{s["id"]}"/>' for _, s in pages)
    opf = f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="fr"
  prefix="rendition: http://www.idpf.org/vocab/rendition/# ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="uid">urn:uuid:{uuid.uuid5(uuid.NAMESPACE_URL, "https://karlforterre.fr/darshan/extrait-jouable")}</dc:identifier>
  <dc:title>Darshan — extrait jouable (prototype)</dc:title>
  <dc:creator>Karl Forterre</dc:creator>
  <dc:language>fr</dc:language>
  <dc:description>Prototype d’édition jouable du début de Darshan (poème d’ouverture et début du chapitre « Un ciel mouvant »). Le texte est celui de l’édition publiée.</dc:description>
  <meta property="dcterms:modified">{maintenant}</meta>
  <meta property="rendition:layout">pre-paginated</meta>
  <meta property="rendition:spread">none</meta>
  <meta property="ibooks:specified-fonts">true</meta>
  <meta property="schema:accessMode">textual</meta>
  <meta property="schema:accessMode">visual</meta>
  <meta property="schema:accessMode">auditory</meta>
  <meta property="schema:accessModeSufficient">textual</meta>
  <meta property="schema:accessibilityFeature">readingOrder</meta>
  <meta property="schema:accessibilityFeature">structuralNavigation</meta>
  <meta property="schema:accessibilityFeature">tableOfContents</meta>
  <meta property="schema:accessibilityHazard">noFlashingHazard</meta>
  <meta property="schema:accessibilityHazard">motionSimulation</meta>
  <meta property="schema:accessibilityHazard">noSoundHazard</meta>
  <meta property="schema:accessibilitySummary">Tout le texte de l’extrait est présent dans chaque page et lisible sans animation (bouton « Lecture ») ; les images sont décoratives, le texte les décrit ; chaque geste a un équivalent par simple toucher et au clavier ; les mouvements sont réduits si le système le demande.</meta>
</metadata>
<manifest>
{chr(10).join("  " + m for m in manifeste)}
</manifest>
<spine>{spine}</spine>
</package>
'''
    (contenu / "package.opf").write_text(opf, encoding="utf-8")
    (racine / "META-INF").mkdir()
    (racine / "META-INF" / "container.xml").write_text('''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
''', encoding="utf-8")
    sortie = DIST / "darshan-extrait-jouable.epub"
    with zipfile.ZipFile(sortie, "w") as z:
        z.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        for f in sorted(racine.rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(racine).as_posix(), compress_type=zipfile.ZIP_DEFLATED)
    return sortie


if __name__ == "__main__":
    DIST.mkdir(exist_ok=True)
    print("web :", web())
    print("epub :", epub())
