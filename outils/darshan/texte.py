"""Le texte de Darshan, tel qu'il est dans l'EPUB publié (livres/darshan.epub).

Module commun à build.py (fabrication) et decoupage.py (découpage en tableaux). Le texte
n'est jamais recopié : il est lu dans l'EPUB à chaque fabrication, paragraphe par
paragraphe, avec le style de chaque paragraphe (titre de chapitre, vers, corps de texte).

L'export EPUB de 2023 a perdu les italiques du livre imprimé : le PDF (livres/darshan.pdf)
compose en Amiri penché la voix du père, les pensées de Darshan et de Julie, le mot
« mudrā » et « Angelo mio ». ITALIQUES les rétablit ; chaque passage est vérifié contre
le texte.
"""
import html
import pathlib
import re
import zipfile

ICI = pathlib.Path(__file__).resolve().parent
LIVRE = ICI.parent.parent / "livres" / "darshan.epub"


def paragraphes(epub):
    """Paragraphes et titres du livre, dans l'ordre, numérotés à partir de 1 : (texte, style)."""
    with zipfile.ZipFile(epub) as z:
        nom = next(n for n in z.namelist() if n.endswith("Darshan_Epub.xhtml"))
        source = z.read(nom).decode("utf-8")
    corps = source[source.find("<body"):]
    sortie = []
    for m in re.finditer(r'<(p|h\d)[^>]*class="([^"]*)"[^>]*>(.*?)</\1>', corps, re.S):
        texte = html.unescape(re.sub(r"<[^>]+>", "", re.sub(r"<br\s*/?>", " / ", m.group(3)))).strip()
        if texte:
            sortie.append((texte, m.group(2).split()[0]))
    return {i: t for i, t in enumerate(sortie, start=1)}


_tout = paragraphes(LIVRE)
lignes = {n: t for n, (t, _) in _tout.items()}
styles = {n: s for n, (_, s) in _tout.items()}

PREMIER, DERNIER = 8, 221        # de la dédicace au dernier vers ; après : l'achevé d'imprimer
CHAPITRES = {17: 1, 40: 2, 63: 3, 99: 4, 109: 5, 134: 6, 170: 7}
assert all(styles[n] == "Chapitres" for n in CHAPITRES)
assert [n for n in range(PREMIER, DERNIER + 1) if styles[n] == "Chapitres"] == sorted(CHAPITRES)


def position(numero, rang):
    """Position de lecture : paragraphe et caractère, en un seul nombre croissant."""
    return numero * 100000 + rang


def est_vers(numero):
    return styles.get(numero) == "Po-me"


# ---------------------------------------------------------------- italiques du livre imprimé
ITALIQUES_PARAGRAPHES = {20, 44, 83, 110, 111, 128, 137, 138}
ITALIQUES_MOTS = [(76, "mudrā"), (77, "Dhyana mudrā"), (78, "mudrā"), (155, "Angelo mio"), (205, "mudrā")]


def italiques(numero):
    """Plages (début, fin) en italique dans le paragraphe `numero`."""
    if numero in ITALIQUES_PARAGRAPHES:
        return [(0, len(lignes[numero]))]
    plages = []
    for n, mot in ITALIQUES_MOTS:
        if n == numero:
            k = lignes[n].find(mot)
            assert k >= 0, (n, mot)
            plages.append((k, k + len(mot)))
    return plages


for _n, _mot in ITALIQUES_MOTS:
    assert _mot in lignes[_n], (_n, _mot)


def texte_du_livre():
    """Tout le texte, de la dédicace au dernier vers, pour les vérifications."""
    return "\n".join(lignes[n] for n in range(PREMIER, DERNIER + 1))
