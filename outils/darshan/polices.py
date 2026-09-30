"""Polices de Darshan, allégées pour les deux éditions.

    python3 outils/darshan/polices.py

Outil de préparation, comme decors.py : il demande fontTools et brotli (pip install fonttools
brotli). Les polices qu'il écrit sont dans le dépôt : ni Karl ni la fabrication n'ont à le
lancer ; on le relance seulement si le livre ou les textes d'interface prennent un caractère
nouveau (le programme le dit : voir « Vérification »).

Il télécharge une fois les polices d'origine (dépôt google/fonts, licence SIL OFL) dans
src/fonts/originaux/ (non suivi par Git), ne garde que les caractères dont le livre a
besoin, et écrit dans src/fonts/ :
  - les WOFF2, pour l'édition jouable et le web ;
  - les TTF, pour l'édition classique : Kindle, Google et bien des liseuses ignorent le WOFF2.

Caractères gardés : ceux du texte (texte.py), des textes d'interface (interface.ini) et des
objets (objets.ini), plus une réserve pour les textes à venir (latin de base, latin-1,
ponctuation française). Tiro Devanagari Sanskrit ne sert qu'au titre, « दर्शन ».

Vérification : chaque caractère du livre et des textes d'interface doit être dans les polices
du texte. Aucune police du livre n'a la flèche « → » des étiquettes du carnet des portes :
le moteur la dessine (voir PAS_DANS_LES_POLICES).
"""
import configparser
import pathlib
import sys
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont

ICI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
import texte  # noqa: E402

FONTS = ICI / "src" / "fonts"
ORIGINAUX = FONTS / "originaux"
DEPOT = "https://raw.githubusercontent.com/google/fonts/main/ofl/"

# nom allégé : fichier d'origine dans google/fonts
POLICES = {
    "Amiri-Regular": "amiri/Amiri-Regular.ttf",
    "Amiri-Italic": "amiri/Amiri-Italic.ttf",
    "Amiri-Bold": "amiri/Amiri-Bold.ttf",
    "Unna-Regular": "unna/Unna-Regular.ttf",
    "Unna-Italic": "unna/Unna-Italic.ttf",
}
TITRE = ("Tiro-Darshan", "tirodevanagarisanskrit/TiroDevanagariSanskrit-Regular.ttf", "दर्शन")

# la tranche « latin » de Google Fonts (celle des premières versions allégées), plus le « ā »
RESERVE = "".join(chr(c) for c in [
    *range(0x20, 0x7F), *range(0xA0, 0x100),            # latin de base, latin-1 (accents, « »)
    0x131, 0x152, 0x153, 0x178, 0x100, 0x101,           # ı, Œ, œ, Ÿ, Ā, ā (« mudrā »)
    0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC,                  # apostrophes et accents isolés
    *range(0x2000, 0x2070),                             # espaces fines, tirets, guillemets, …
    0x20AC, 0x2122, 0x2191, 0x2193, 0x2212, 0x2215,     # €, ™, flèches, moins, barre
])
PAS_DANS_LES_POLICES = {"→"}   # dessinée par le moteur (carnet des portes)


def textes_d_interface():
    sortie = ""
    for nom in ("interface.ini", "objets.ini"):
        c = configparser.ConfigParser(interpolation=None)
        c.optionxform = str
        c.read(ICI / nom, encoding="utf-8")
        sortie += "".join(k + v for s in c.sections() for k, v in c[s].items())
    return sortie


def original(chemin):
    cible = ORIGINAUX / pathlib.Path(chemin).name
    if not cible.exists():
        ORIGINAUX.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(DEPOT + chemin, timeout=60) as r:
            cible.write_bytes(r.read())
        print("téléchargée :", cible.name)
    return cible


def alleger(source, cible, unicodes=(), text="", features=("liga", "kern")):
    for saveur in ("woff2", None):
        options = subset.Options()
        options.layout_features = list(features)
        options.name_IDs = ["*"]              # copyright et licence restent dans la police
        options.name_languages = ["*"]
        options.notdef_outline = True
        options.hinting = False
        options.desubroutinize = True
        options.flavor = saveur
        police = TTFont(source)
        allegeur = subset.Subsetter(options)
        allegeur.populate(unicodes=unicodes, text=text)
        allegeur.subset(police)
        nom = cible.with_suffix(".woff2" if saveur else ".ttf")
        police.flavor = saveur
        police.save(nom)
        print(f"{nom.name:22} {nom.stat().st_size // 1024:3} Ko, {len(police.getBestCmap())} caractères")


def main():
    besoin = set(texte.texte_du_livre()) | set(textes_d_interface())
    besoin = {c for c in besoin if not c.isspace() or c in "   "}
    for nom, chemin in POLICES.items():
        source = original(chemin)
        present = TTFont(source).getBestCmap()
        garder = {ord(c) for c in (besoin | set(RESERVE))} & set(present)
        manque = sorted(c for c in besoin if ord(c) not in present and c not in PAS_DANS_LES_POLICES)
        if manque:
            sys.exit(f"{nom} n'a pas : {' '.join(manque)} ({', '.join(hex(ord(c)) for c in manque)})")
        alleger(source, FONTS / nom, unicodes=sorted(garder))
    nom, chemin, text = TITRE
    alleger(original(chemin), FONTS / nom, text=text, features=("*",))

    # vérification : chaque caractère nécessaire est dans chaque police du texte
    for nom in POLICES:
        for suffixe in (".woff2", ".ttf"):
            cmap = TTFont(FONTS / (nom + suffixe)).getBestCmap()
            manque = sorted(c for c in besoin if ord(c) not in cmap and c not in PAS_DANS_LES_POLICES)
            assert not manque, (nom + suffixe, manque)
    print("vérifié : les", len(besoin), "caractères du livre et de l'interface sont dans les polices du texte")


if __name__ == "__main__":
    main()
