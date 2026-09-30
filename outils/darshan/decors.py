"""Fabrique les décors du livre jouable Darshan : une image par décor, 1600 x 2400, en WebP.

Usage, depuis la racine du dépôt, dans une session Claude :
    python3 outils/darshan/decors.py                  tous les décors, leurs calques, les extras et la planche
    python3 outils/darshan/decors.py periyar toiles   seulement ces décors (et leurs calques), puis la planche
    python3 outils/darshan/decors.py planche          seulement la planche contact
    python3 outils/darshan/decors.py fin              seulement la planche des photographies (page « Fin »)
    python3 outils/darshan/decors.py lune-bande       un extra (voir EXTRAS), puis la planche

Demande Pillow, et Playwright avec Chromium (le programme règle lui-même NODE_PATH), présents
dans les sessions Claude ; ne jamais lancer « playwright install ». Les images produites sont
versées au dépôt : build.py n'a besoin de rien de tout ça.

Les décors sont décrits dans livre.py (dictionnaire DECORS), qu'on ne modifie pas ici :
- « photo », le monde de Julie : la photo de Karl telle qu'il l'a faite, recadrée en 2:3, sans
  aucune autre retouche (agrandie proprement si elle est trop petite) ; format="paysage" : en
  16:9 (1600 x 900), pour la vidéo du téléphone de Julie ; pleine=True : le cadre 2:3 à la
  définition de la photo (l'original, sans réduction), pour un travelling dans l'image ;
- « encre », le monde de Darshan : la même photo recadrée, passée à l'encre et à l'aquarelle sur
  papier par le filtre d'images.py, repris ici pour 1600 x 2400 : mêmes réglages, mais rayons de
  flou et tailles de bruit multipliés par 4/3, pour que le rendu soit celui de 1200 x 1800, ni
  plus fin ni plus grossier ; « soir » : palette du crépuscule, plus chaude et plus sombre ;
  « crepuscule » (avec « soir ») : le soir un peu plus tard, plus sombre, le ciel mauve ;
  heure="or" : la lumière d'or de fin d'après-midi (miel, ambre, paille) ; « masque » et « bas » :
  seule la silhouette reste peinte, le reste retourne au papier (voir masque_silhouette) ;
- « dessin » : la fonction du même nom d'art.py dessine le décor (SVG de 1200 x 1800), Chromium
  le photographie à l'échelle 4/3 (rendu.js), puis le papier des encres s'y ajoute. Quand un
  dessin part d'une photo de Karl, PREPARATIONS la prépare d'abord (recadrée, floutée, passée à
  l'encre, détourée) et le SVG la reçoit par une adresse file:// ;
- « prototype » et « uni » : rien à faire (images déjà faites, fonds unis).

Recadrage : x et y (de 0 à 1) placent le cadre 2:3 dans la photo agrandie, comme le recadrage
d'images.py : 0 le colle au bord gauche (ou haut), 0,5 le centre, 1 le colle au bord droit (ou
bas) ; zoom agrandit la photo avant de recadrer. CORRECTIONS, plus bas, remplace les recadrages
de livre.py qui coupaient mal leur sujet ; RETOUCHES_ENCRE ajuste le filtre décor par décor.

Photos : chaque photo est téléchargée une seule fois, à l'adresse publique de son fichier sur
images.pexels.com (celle qu'affichent les sites), jamais par une page de pexels.com ni par l'API,
et gardée dans src/img/pexels-<numéro>.jpg (non suivi par Git). Si ce fichier existe déjà mais
trop petit (images.py en a pris quelques-uns en 2 000 pixels de haut), le programme le laisse tel
quel et garde la grande version à côté, dans src/img/pexels-<numéro>-h3600.jpg. Qualité d'abord :
quand un cadre serré (zoom) agrandirait la version de 3 600 pixels de haut, le programme prend le
fichier original, à sa pleine définition (src/img/pexels-<numéro>-orig.jpg, non suivi non plus).

Sorties :
- src/img/decors/<nom>.webp : 1600 x 2400 (les coordonnées de la scène, en 1200 x 1800, y sont
  à l'échelle 4/3), sRGB, qualité 86, ramenée à 84 puis 82 au-delà de 450 Ko ; les calques
  (ALPHA) gardent leur couche de transparence ;
- à côté, les calques et variantes que le moteur emploie avec un décor (CALQUES) et les extras
  (EXTRAS) : la bande de lune du panoramique de 5.9, l'esquisse de 2.10 (un SVG, tracé par le
  moteur), les vignettes et clichés de la galerie (5.6) ;
- src/img/arbres-poeme.webp : le calque d'arbres de la voûte (0.2), fichier du prototype que
  livre.py donne au décor « voute » (1200 x 1800, comme ciel-poeme.jpg) ;
- src/img/decors/fin-photos.webp : la planche des photographies du livre, sans encre ni
  recadrage, dans l'ordre où on les voit, pour la page « Fin » ;
- la couverture n'est pas fabriquée ici : src/img/couverture.jpg est celle du livre de 2023,
  fournie par Karl en grand le 30 septembre 2026 (1409 x 2000), gardée telle quelle ;
- planche-decors.jpg (non suivie par Git) : toutes les images en vignettes, avec leur nom, pour
  relire d'un coup d'œil (les calques sur un damier).
"""
import io
import math
import os
import pathlib
import random
import subprocess
import sys
import tempfile
import time
import urllib.request

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ICI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
import art  # noqa: E402  (les dessins)
import livre  # noqa: E402  (les décors : DECORS)

IMG = ICI / "src" / "img"
SORTIE = IMG / "decors"
PLANCHE = ICI / "planche-decors.jpg"
FIN = SORTIE / "fin-photos.webp"
W, H = 1600, 2400                       # taille des décors
K = W / 1200                            # une unité de la scène (1200 x 1800) = 4/3 de pixel
POIDS_MAX = 450 * 1024
QUALITES = (86, 84, 82)
AGENT = "Mozilla/5.0 (darshan, images de Karl Forterre)"
ADRESSE = "https://images.pexels.com/photos/{n}/pexels-photo-{n}.jpeg?auto=compress&cs=tinysrgb&h=3600"
ADRESSE_ORIGINALE = "https://images.pexels.com/photos/{n}/pexels-photo-{n}.jpeg?auto=compress&cs=tinysrgb"
PAUSE = 1.5                             # secondes entre deux téléchargements
NODE_MODULES = "/opt/node22/lib/node_modules"

# ---------------------------------------------------------------- corrections des recadrages
# Recadrages de livre.py qui coupaient mal leur sujet, vérifiés sur la planche : ce dictionnaire
# les remplace ici, sans toucher à livre.py (à y reporter quand on voudra). Mêmes clés que livre.py.
# Les recadrages que la synthèse des équipes a fixés (docs/darshan-mise-en-scene/synthese.md,
# partie 4) sont dans livre.py ; ne restent ici que ceux qu'elle laissait « à essayer ».
CORRECTIONS = {
    # 2.8 : l'arche de rocaille entière, centrée, et l'allée qui passe dessous (la synthèse : « à x 0,45
    # à essayer, si l'arche y gagne sans perdre l'allée ») ; à reporter dans livre.py
    "rocaille": {"x": 0.45},
    # 3.10 : la lumière orange au point où naît la lanterne, (600, 300) ; à x 0,24 et y 0,91 elle tombait
    # en (612, 303) ; à reporter dans livre.py
    "noir-lueur": {"x": 0.243, "y": 0.912},
}

# ---------------------------------------------------------------- réglages du filtre, décor par décor
# Les réglages d'images.encre (part_traits, teinte, couleur, saturation, tons), plus :
# « clair » : éclaircit la photo avant le filtre, pour les photos sombres qui deviendraient une encre
# boueuse ; « brique » : ramène les rouges et les roses vers la brique (de 0 à 1), pour que le
# vermillon reste à l'amour ; « chaud » : réchauffe la lumière de la photo (de 0 à 1).
RETOUCHES_ENCRE = {
    "portes-1": {"brique": 0.8},                   # le toit rose cuivré ramené vers la brique (chapitre 3)
    "portes-3": {"clair": 1.45},                   # trop sombre : on voit la cour par la volute de la grille
    "portes-5": {"brique": 0.9},                   # le rouge vif de la porte ramené vers la brique (chapitre 3)
    "marche-aluva": {"chaud": 0.45, "clair": 1.18},  # le « Jardin tropical » chaud et clair : le soleil d'orient
}

# ---------------------------------------------------------------- réglages des dessins
# « papier » : force du papier des encres posé sur le dessin (0 : aucun, 1 : comme les encres).
PAPIER_DESSIN = {
    "fenetre": 0.0,          # la fenêtre et sa vue : le décor de Julie reste net, le mur a son grain
    "salon": 0.0,
    "fenetre-cadre": 0.0,
    "fenetre-vue": 0.0,
    "papier-lettre": 0.0,    # la feuille a déjà son propre papier
    "cosmos": 0.0,           # la nuit de la légende n'a pas de papier (chapitre 3)
    "porte-pere": 0.0,       # la vision : ni encre sur papier, ni photo reconnaissable
    "porte-pere-traits": 0.0,
    "porte-pere-rue": 0.0,
    "porte-pere-rue-traits": 0.0,
    "velours": 0.0,          # une matière, pas un dessin
    "tableau-ladoga": 0.0,   # le tableau d'un autre peintre : des aplats, sans papier
    "tableau-barque": 0.0,
    "desert-nuit": 0.35,     # le velours noir de la nuit, à peine grené
    "desert-jour": 0.55,     # le ciel blanc de chaleur : le papier, sans ses auréoles
    "aluva": 0.45,           # le dessin du prototype, que Karl a vu : un papier plus discret
    "depart-proche": 0.35,   # la nuit au bord du fleuve : à peine grenée
}

# Décors et calques enregistrés avec leur couche de transparence (WebP avec alpha).
ALPHA = {
    "porte-pere", "porte-pere-traits", "porte-pere-rue", "porte-pere-rue-traits",
    "placard-ouverte", "fenetre-cadre", "toiles-couleur", "mangue",
    "marche-aluva-thes", "marche-aluva-curcuma", "marche-aluva-encens", "marche-aluva-jarres",
    "marche-aluva-tapisseries", "marche-aluva-confettis",
}

# ---------------------------------------------------------------- calques et variantes
# Images tirées d'un décor dessiné, pour les effets du moteur : la même fonction d'art.py, avec
# ces réglages en plus. Elles sont fabriquées avec leur décor, rangées à côté de lui sous leur nom ;
# elles ne sont pas dans livre.DECORS : le moteur les trouve par leur nom.
CALQUES = {
    # 5.2 à 5.5 : une marchandise par calque, qui quitte l'étal une fois achetée (effet « etals ») ;
    # le paquet de confettis de 5.5 ; la mangue qui roule de derrière (effet « roule »)
    "marche-aluva": {
        "marche-aluva-thes": {"calque": "thes"},
        "marche-aluva-curcuma": {"calque": "curcuma"},
        "marche-aluva-encens": {"calque": "encens"},
        "marche-aluva-jarres": {"calque": "jarres"},
        "marche-aluva-tapisseries": {"calque": "tapisseries"},
        "marche-aluva-confettis": {"calque": "confettis"},
        "mangue": {"calque": "mangue"},
    },
    # 6.7 : l'effet « vertige » garde la fenêtre fixe et fait reculer la vue derrière elle
    "fenetre": {
        "fenetre-cadre": {"calque": "cadre"},
        "fenetre-vue": {"calque": "vue"},
    },
    # 6.6 : l'aquarelle qui irrigue la toile du couple (effet « couleur »)
    "toiles": {"toiles-couleur": {"calque": "couleur"}},
    # 6.13 à 6.15 : les trois états de l'armoire (le décor : la porte entrouverte sur les serviettes)
    "placard": {
        "placard-fermee": {"etat": "fermee"},
        "placard-ouverte": {"etat": "ouverte"},
    },
}

# Les calques qu'on découpe dans la page rendue (en unités de la scène : x0, y0, x1, y1) : des
# figurines que le moteur déplace lui-même.
DECOUPES = {
    "mangue": (0, 0, 300, 240),
}

# Photos des décors du prototype (pour la planche de la page « Fin »).
PHOTOS_PROTOTYPE = {
    "ciel-poeme": [27116682],
    "voute": [27116682],
    "toits": [27116682],
    "tuiles": [34500347, 27116682],
    "ciel-appel": [27116682],
}

# 5.6 et 5.7 : la galerie du téléphone de Julie ; vignettes carrées de 480 px et clichés en taille
# moyenne (2:3, 1066 x 1600 : les deux tiers hauts de la page), tirés des mêmes cadres que les décors.
GALERIE = ["bonbons", "patinoire", "croque-serre", "deux-flous", "reflet-paris", "video-lune"]
VIGNETTE = 480
CLICHE = (1066, 1600)

# 5.9 : la bande verticale d'où le panoramique tire « lune-horizon » et « lune-haute » (même x, même
# zoom) : 1600 de large, toute la hauteur de la photo réduite (rien n'est agrandi).
BANDES = {
    "lune-bande": {"photo": 38674516, "x": 0.62, "zoom": 1.8},
}


# ---------------------------------------------------------------- les photos
def telecharger(adresse, cible):
    demande = urllib.request.Request(adresse, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(demande, timeout=90) as r:
        donnees = r.read()
    cible.write_bytes(donnees)
    print("téléchargée :", cible.name, len(donnees) // 1024, "Ko", flush=True)
    time.sleep(PAUSE)
    return cible


def source(numero, originale=False):
    """Chemin de la photo en cache, téléchargée au besoin (une seule fois) ; originale=True : le
    fichier à sa pleine définition."""
    if originale:
        cible = IMG / f"pexels-{numero}-orig.jpg"
        return cible if cible.exists() else telecharger(ADRESSE_ORIGINALE.format(n=numero), cible)
    cible = IMG / f"pexels-{numero}.jpg"
    if cible.exists():
        with Image.open(cible) as im:
            # trop petit seulement s'il vient d'images.py (2 000 pixels de haut ou de large) ;
            # une photo petite à l'origine reste telle quelle
            if min(im.size) >= 2400 or 2000 not in im.size:
                return cible
        cible = IMG / f"pexels-{numero}-h3600.jpg"
        if cible.exists():
            return cible
    return telecharger(ADRESSE.format(n=numero), cible)


def ouvrir(numero, originale=False):
    im = ImageOps.exif_transpose(Image.open(source(numero, originale)))
    if im.info.get("icc_profile"):
        from PIL import ImageCms
        profil = ImageCms.ImageCmsProfile(io.BytesIO(im.info["icc_profile"]))
        im = ImageCms.profileToProfile(im, profil, ImageCms.createProfile("sRGB"), outputMode="RGB")
    return im.convert("RGB")


def photo_pour(numero, zoom=1.0, taille=(W, H)):
    """La photo à recadrer : la version de 3 600 pixels de haut, ou l'original quand le cadre
    demanderait de l'agrandir (un cadre serré, un grand zoom)."""
    im = ouvrir(numero)
    if max(taille[0] / im.width, taille[1] / im.height) * zoom > 1.0 and im.height == 3600:
        im = ouvrir(numero, originale=True)
    return im


def recadrer(im, x=0.5, y=0.5, zoom=1.0, taille=(W, H)):
    """Cadre 2:3 de la photo agrandie de `zoom`, placé par x et y (de 0 à 1), en une seule
    passe LANCZOS (réduction, ou agrandissement si la photo est trop petite)."""
    tw, th = taille
    s = max(tw / im.width, th / im.height) * zoom
    x0, y0 = (im.width * s - tw) * x, (im.height * s - th) * y
    return im.resize((tw, th), Image.LANCZOS, box=(x0 / s, y0 / s, (x0 + tw) / s, (y0 + th) / s))


def cadre_natif(im, zoom=1.0, rapport=2 / 3):
    """Le plus grand cadre de ce rapport (largeur / hauteur) dans la photo, à sa définition."""
    if im.width / im.height > rapport:
        th = im.height / zoom
        return round(th * rapport), round(th)
    tw = im.width / zoom
    return round(tw), round(tw / rapport)


def reglages(nom):
    d = dict(livre.DECORS[nom])
    d.update(CORRECTIONS.get(nom, {}))
    return d


# ---------------------------------------------------------------- l'encre, à 1600 x 2400
# Le filtre d'images.encre, à l'identique, mais à l'échelle K : rayons de flou multipliés par K,
# bruits tirés sur la grille de 1200 x 1800 puis étirés. Les bruits viennent d'un générateur
# à graine (random.Random) : chaque décor sort pareil, qu'on le fasse seul ou avec les autres.
def bruit(taille, graine, sigma=None):
    """Bruit blanc reproductible ; sigma : écart type voulu autour de 128 (sinon uniforme 0-255)."""
    n = Image.frombytes("L", taille, random.Random(graine).randbytes(taille[0] * taille[1]))
    if sigma:
        f = sigma / 73.9
        n = n.point(lambda v: max(0, min(255, round(128 + (v - 127.5) * f))))
    return n


def ondes(echelle, graine, flou):
    """Bruit doux : même grain qu'images.ondes en 1200 x 1800, étiré à 1600 x 2400."""
    n = bruit((max(2, 1200 // echelle), max(2, 1800 // echelle)), graine)
    return n.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(flou * K))


def papier():
    grain = bruit((1200, 1800), 3, 38).filter(ImageFilter.GaussianBlur(1.1)).resize((W, H), Image.BICUBIC)
    p = ImageOps.colorize(grain, black=(226, 214, 192), white=(252, 246, 232))
    return ImageChops.multiply(p, ImageOps.colorize(ondes(10, 4, 9), black=(232, 224, 208), white=(255, 255, 255)))


def centile(im, part):
    h, total, cumul = im.histogram(), im.width * im.height, 0
    for v, n in enumerate(h):
        cumul += n
        if cumul >= total * part:
            return v
    return 255


def encre(photo, part_traits=0.10, teinte=(20, 22, 44), couleur=0.85, saturation=1.55, tons=(125, 180, 225),
          fond=None):
    """images.encre à l'échelle K ; fond : papier déjà teinté (sinon le papier des encres)."""
    im = photo.convert("RGB")
    blanc = Image.new("RGB", (W, H), (255, 255, 255))
    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    # les traits : une part fixe de l'image, là où le contraste est le plus fort
    dog = ImageChops.subtract(g.filter(ImageFilter.GaussianBlur(7 * K)), g.filter(ImageFilter.GaussianBlur(1.8 * K)))
    s = max(6, centile(dog, 1 - part_traits))
    traits = dog.point(lambda v: 0 if v < s else min(255, (v - s) * 16 + 110))
    traits = traits.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.9 * K))
    traits = ImageChops.multiply(traits, ondes(26, 5, 16).point(lambda v: min(255, max(70, int((v - 50) * 2.4)))))
    # l'encre diluée : trois tons pour les ombres, grain du papier
    a, b, c = tons
    niveaux = g.filter(ImageFilter.GaussianBlur(3.5 * K)).point(lambda v: a if v < 55 else b if v < 105 else c if v < 165 else 255)
    niveaux = ImageChops.multiply(niveaux.filter(ImageFilter.GaussianBlur(2.5 * K)), ondes(3, 11, 1.2).point(lambda v: 228 + v // 10))
    lavis = ImageOps.colorize(niveaux, black=teinte, white=(255, 255, 255))
    # la couleur : franche mais transparente, pâlie par endroits (auréoles)
    coul = ImageEnhance.Brightness(ImageEnhance.Color(im.filter(ImageFilter.GaussianBlur(5 * K))).enhance(saturation)).enhance(1.12)
    coul = Image.blend(coul, blanc, 1 - couleur)
    aureoles = ondes(12, 9, 14).point(lambda v: min(255, max(0, int((v - 50) * 1.7))))
    coul = Image.composite(coul, Image.blend(coul, blanc, 0.45), aureoles)
    ink = Image.composite(Image.new("RGB", (W, H), teinte), blanc, traits)
    return ImageChops.multiply(ImageChops.multiply(ImageChops.multiply(fond or papier(), coul), lavis), ink)


def degrade(haut, bas, milieu=None, taille=(W, H)):
    """Dégradé vertical (couleurs RVB), passant par `milieu` à mi-hauteur."""
    col = Image.new("RGB", (1, taille[1]))
    for y in range(taille[1]):
        t = y / (taille[1] - 1)
        if milieu:
            a, b, t = (haut, milieu, t * 2) if t < 0.5 else (milieu, bas, t * 2 - 1)
        else:
            a, b = haut, bas
        col.putpixel((0, y), tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)))
    return col.resize(taille)


def rampe(taille, debut, fin, horizontale=False):
    """Masque de 255 à 0 entre deux fractions de la hauteur (ou de la largeur) : 255 avant `debut`,
    0 après `fin`, un fondu doux entre les deux."""
    n = taille[0] if horizontale else taille[1]
    ligne = Image.new("L", (n, 1) if horizontale else (1, n))
    for i in range(n):
        t = i / max(1, n - 1)
        v = 1.0 if t <= debut else 0.0 if t >= fin else (fin - t) / (fin - debut)
        v = v * v * (3 - 2 * v)                     # fondu doux (smoothstep)
        ligne.putpixel((i, 0) if horizontale else (0, i), round(255 * v))
    return ligne.resize(taille)


def crepuscule(photo):
    """Le soir sur le fleuve : la lumière de la photo devient celle du couchant (or et rose en
    haut, reflets roses dans l'eau), les ombres virent à l'indigo, le tout plus sombre."""
    g = ImageOps.autocontrast(photo.convert("L"), cutoff=1)
    ombres = ImageOps.colorize(g, black=(26, 22, 58), mid=(122, 76, 112), white=(255, 196, 132))
    ciel = degrade((255, 178, 96), (150, 96, 150), (255, 150, 128))
    teinte = ImageChops.multiply(ombres, ImageChops.screen(ciel, Image.new("RGB", (W, H), (110, 90, 110))))
    return Image.blend(photo, teinte, 0.72)


def plus_tard(photo):
    """Le crépuscule, un peu plus tard (après crepuscule) : la lumière baisse d'un tiers, le ciel
    passe de l'orange au mauve ; l'eau garde un dernier reflet (ses clartés baissent moins)."""
    g = ImageOps.autocontrast(photo.convert("L"), cutoff=1)
    mauve = ImageOps.colorize(g, black=(20, 18, 52), mid=(100, 82, 136), white=(226, 196, 230))
    ciel = degrade((150, 136, 214), (112, 104, 168), (206, 158, 196))
    teinte = ImageChops.multiply(mauve, ImageChops.screen(ciel, Image.new("RGB", (W, H), (92, 86, 124))))
    soir = Image.blend(photo, teinte, 0.7)
    sombre = ImageEnhance.Brightness(soir).enhance(0.67)
    # le dernier reflet : les clartés de la moitié basse (l'eau) gardent un peu de leur lumière
    clartes = g.point(lambda v: 0 if v < 150 else min(255, (v - 150) * 3)).filter(ImageFilter.GaussianBlur(6 * K))
    clartes = ImageChops.multiply(clartes, ImageOps.invert(rampe((W, H), 0.45, 0.62)))
    return Image.composite(ImageEnhance.Brightness(soir).enhance(0.9), sombre, clartes.point(lambda v: v * 7 // 10))


def heure_or(photo):
    """La lumière d'or de fin d'après-midi (1.8, 1.9) : hautes lumières miel, ombres ambre, ciel
    paille ; ni le rose ni l'indigo du soir."""
    g = ImageOps.autocontrast(photo.convert("L"), cutoff=1)
    ombres = ImageOps.colorize(g, black=(62, 38, 14), mid=(176, 122, 50), white=(255, 232, 160))
    ciel = degrade((255, 236, 180), (236, 190, 116), (250, 214, 146))
    teinte = ImageChops.multiply(ombres, ImageChops.screen(ciel, Image.new("RGB", (W, H), (120, 96, 60))))
    return Image.blend(photo, teinte, 0.6)


def vers_brique(photo, force=0.8):
    """Ramène les rouges et les roses de la photo vers la brique : teinte tirée vers l'orangé,
    saturation et clarté baissées, là seulement où la photo est rouge."""
    hsv = photo.convert("HSV")
    h, s, v = hsv.split()
    # part de rouge de chaque pixel (teintes autour de 0 : rose, rouge, rouge orangé), pondérée par sa saturation
    rouge = h.point(lambda t: max(0, 255 - min(abs(t - 0), abs(t - 255), abs(t - 8) + 6) * 9))
    part = ImageChops.multiply(rouge, s.point(lambda t: min(255, t * 2))).point(lambda t: round(t * force))
    brique = Image.merge("HSV", (h.point(lambda t: 10 if t > 200 or t < 20 else t),
                                 s.point(lambda t: round(t * 0.62)),
                                 v.point(lambda t: round(t * 0.84)))).convert("RGB")
    return Image.composite(brique, photo, part.filter(ImageFilter.GaussianBlur(2 * K)))


def rechauffer(photo, force=0.4):
    """Une lumière plus chaude (le soleil d'Aluva) : les blancs dorés, les ombres ambrées."""
    chaud = ImageChops.multiply(photo, Image.new("RGB", photo.size, (255, 226, 176)))
    chaud = ImageChops.screen(chaud, Image.new("RGB", photo.size, (40, 22, 0)))
    return Image.blend(photo, chaud, force)


def masque_silhouette(points, bas=None, retrait=10, bord=34, taille=(W, H)):
    """Masque d'une silhouette (points en fractions du cadre), rentré de `retrait` pixels et adouci
    sur son bord ; bas=(début, fin) : fondu vers le papier entre ces deux hauteurs (2.3)."""
    tw, th = taille
    m = Image.new("L", taille, 0)
    ImageDraw.Draw(m).polygon([(x * tw, y * th) for x, y in points], fill=255)
    if retrait:
        m = m.filter(ImageFilter.MinFilter(2 * retrait + 1))
    m = m.filter(ImageFilter.GaussianBlur(bord))
    if bas:
        m = ImageChops.multiply(m, rampe(taille, bas[0], bas[1]))
    return m


def preparer_encre(photo, r):
    """Les retouches avant le filtre : brique, chaud, clair (sorties de r)."""
    brique, chaud, clair = r.pop("brique", None), r.pop("chaud", None), r.pop("clair", None)
    if brique:
        photo = vers_brique(photo, brique)
    if chaud:
        photo = rechauffer(photo, chaud)
    if clair:
        photo = ImageEnhance.Brightness(photo).enhance(clair)
    return photo


def faire_encre(nom):
    d = reglages(nom)
    photo = recadrer(photo_pour(d["photo"], d["zoom"]), d["x"], d["y"], d["zoom"])
    r = dict(RETOUCHES_ENCRE.get(nom, {}))
    photo = preparer_encre(photo, r)
    if d.get("soir"):
        photo = crepuscule(photo)
        if d.get("crepuscule"):
            photo = plus_tard(photo)
            r.setdefault("teinte", (24, 18, 46))
            r.setdefault("tons", (104, 160, 208))
            r.setdefault("fond", ImageChops.multiply(papier(), degrade((206, 190, 222), (126, 120, 164), (200, 168, 196))))
        r.setdefault("teinte", (34, 18, 44))
        r.setdefault("tons", (112, 168, 214))
        r.setdefault("fond", ImageChops.multiply(papier(), degrade((236, 206, 178), (170, 150, 176), (226, 184, 170))))
    elif d.get("heure") == "or":
        photo = heure_or(photo)
        r.setdefault("teinte", (46, 28, 12))
        r.setdefault("tons", (118, 174, 222))
        r.setdefault("fond", ImageChops.multiply(papier(), degrade((252, 236, 196), (236, 204, 150), (246, 222, 174))))
    im = encre(photo, **r)
    if d.get("masque"):
        # seule la silhouette reste peinte ; hors d'elle, et sous `bas`, le papier
        im = Image.composite(im, papier(), masque_silhouette(d["masque"], d.get("bas")))
    return im


def etendre(im, part):
    """Prolonge la photo en haut et en bas de `part` de sa hauteur, par le reflet de ses bords, de
    plus en plus flou en s'éloignant de la couture : un cadre 2:3 peut alors être un peu plus large
    que la photo n'est haute. Retouche minime, réservée aux sujets plus larges qu'un cadre en hauteur
    (le graffiti « aime ») et aux bords sans sujet (un fond uni)."""
    h = round(im.height * part)
    toile = Image.new("RGB", (im.width, im.height + 2 * h))
    toile.paste(im, (0, h))
    for bande, y in ((im.crop((0, 0, im.width, h)), 0), (im.crop((0, im.height - h, im.width, im.height)), h + im.height)):
        reflet = ImageOps.flip(bande)
        flou = reflet.filter(ImageFilter.GaussianBlur(max(4, h // 12)))
        masque = Image.linear_gradient("L").resize((im.width, h))      # 0 en haut, 255 en bas
        if y > 0:
            masque = ImageOps.flip(masque)                              # net contre la photo, flou au loin
        toile.paste(Image.composite(reflet, flou, ImageOps.invert(masque) if y == 0 else masque), (0, y))
    return toile


def taille_photo(d):
    return (W, round(W * 9 / 16)) if d.get("format") == "paysage" else (W, H)


def faire_photo(nom, taille=None):
    """Le cadre de la photo, tel quel ; taille : une autre taille de sortie (vignettes, clichés)."""
    d = reglages(nom)
    if d.get("pleine") and not taille:
        # à la définition de la photo : ni réduction ni agrandissement du cadre 2:3
        im = ouvrir(d["photo"], originale=True)
        return recadrer(im, d["x"], d["y"], d["zoom"], cadre_natif(im, d["zoom"]))
    taille = taille or taille_photo(d)
    im = photo_pour(d["photo"], d["zoom"], taille)
    if d.get("marge"):
        im = etendre(im, d["marge"])
    return recadrer(im, d["x"], d["y"], d["zoom"], taille)


# ---------------------------------------------------------------- les dessins : préparation des photos
# Quand un dessin part d'une photo de Karl, la photo est préparée ici (recadrée, floutée, passée à
# l'encre, détourée) et enregistrée dans le dossier de travail ; le SVG la reçoit par son adresse.
def fichier(im, dossier, nom):
    """Enregistre une image de travail (PNG si elle a une couche de transparence) ; son adresse."""
    chemin = dossier / (nom + (".png" if im.mode in ("RGBA", "LA") else ".jpg"))
    if im.mode in ("RGBA", "LA"):
        im.save(chemin)
    else:
        im.convert("RGB").save(chemin, quality=95)
    return chemin.as_uri()


def page(im, boite):
    """Pose une image dans une page vide de 1600 x 2400 (RGBA), à la boîte donnée en unités de la
    scène (x0, y0, x1, y1) : pour passer à l'encre un morceau de photo à sa place dans la page."""
    x0, y0, x1, y1 = (round(v * K) for v in boite)
    toile = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    toile.paste(im.resize((x1 - x0, y1 - y0), Image.LANCZOS).convert("RGBA"), (x0, y0))
    return toile


def preparer_cadre(d, dossier, nom):
    """cosmos_portes : la photo recadrée comme un décor (x, y, zoom), sans rien d'autre."""
    im = recadrer(photo_pour(d["photo"], d.get("zoom", 1.0)), d.get("x", 0.5), d.get("y", 0.5), d.get("zoom", 1.0))
    return {"image": fichier(im, dossier, f"{nom}-photo")}


def preparer_fenetre(d, dossier, nom):
    """fenetre : la vue, recadrée en 2:3 et floutée tant que le repérage manque ; derrière le voilage
    fermé, un flou clair seulement."""
    im = recadrer(photo_pour(d["photo"]), d.get("x", 0.5), d.get("y", 0.5), 1.0)
    flou = d.get("flou", 0) or 0
    if d.get("voilage", "ferme") == "ferme" and d.get("calque") != "vue":
        im = ImageEnhance.Brightness(im.filter(ImageFilter.GaussianBlur(40 * K))).enhance(1.25)
    elif flou:
        im = im.filter(ImageFilter.GaussianBlur(flou * K))
    return {"image": fichier(im, dossier, f"{nom}-vue")}


def preparer_tableau(d, dossier, nom):
    """tableau : la photo entière, telle quelle (le tableau d'un autre peintre), assez grande pour
    le plan rapproché."""
    im = ouvrir(d["photo"])
    im = im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS)
    return {"image": fichier(im, dossier, f"{nom}-toile"), "rapport": im.height / im.width}


def preparer_porte_pere(d, dossier, nom):
    """porte_pere : le haut de la photo (haut), à `largeur` unités de large, le haut à y0 ; passé à
    l'encre sans papier, en lavis sombre, la pierre fondue sur ses bords et le bas fondu (fondu_bas,
    en fractions de la hauteur de la photo : la serrure n'y est jamais) ; traits=True : les arêtes de
    la sculpture seules, en or."""
    src = sans_plaque(ouvrir(d["photo"]))
    haut, largeur, y0 = d.get("haut", 0.64), d.get("largeur", 900), d.get("y0", 420)
    morceau = src.crop((0, 0, src.width, round(src.height * haut)))
    hauteur = largeur * morceau.height / morceau.width
    x0 = (1200 - largeur) / 2
    boite = (x0, y0, x0 + largeur, y0 + hauteur)
    posee = page(morceau, boite)
    # le fond de la page autour du morceau : son gris moyen, pour que le filtre n'y voie pas de bord
    fond = Image.new("RGB", (W, H), tuple(int(c) for c in ImageOps.fit(morceau, (1, 1)).getpixel((0, 0))))
    fond.paste(posee, (0, 0), posee)
    bx0, by0, bx1, by1 = (round(v * K) for v in boite)
    # le masque : la pierre fondue sur ses 12 % extérieurs (côtés), à peine en haut (le linteau reste
    # à y0, sous la lanterne du moteur), le bas fondu avant la serrure
    a, b = d.get("fondu_bas", [0.50, 0.60])
    bw, bh = bx1 - bx0, by1 - by0
    gauche = ImageOps.invert(rampe((bw, bh), 0.0, 0.12, horizontale=True))      # 0 au bord, 255 à 12 %
    haut_ = ImageOps.invert(rampe((bw, bh), 0.0, 0.045))
    masque = ImageChops.multiply(ImageChops.multiply(gauche, ImageOps.mirror(gauche)),
                                 ImageChops.multiply(haut_, rampe((bw, bh), a / haut, b / haut)))
    alpha = Image.new("L", (W, H), 0)
    alpha.paste(masque, (bx0, by0))
    if d.get("traits"):
        g = ImageOps.autocontrast(fond.convert("L"), cutoff=1)
        dog = ImageChops.subtract(g.filter(ImageFilter.GaussianBlur(5 * K)), g.filter(ImageFilter.GaussianBlur(1.2 * K)))
        zone = Image.new("L", (W, H), 0)
        # les battants seuls (x 0,12 à 0,87 de la photo, sous le linteau) : la pierre n'a pas de traits d'or
        ImageDraw.Draw(zone).rectangle((bx0 + bw * 0.125, by0 + bh * 0.16, bx1 - bw * 0.13, by1), fill=255)
        zone = zone.filter(ImageFilter.GaussianBlur(6 * K))
        s = max(4, centile(ImageChops.multiply(dog, zone), 0.93))
        traits = dog.point(lambda v: 0 if v < s else min(255, (v - s) * 14 + 120))
        traits = traits.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.7 * K))
        traits = ImageChops.multiply(ImageChops.multiply(traits, zone), alpha)
        im = Image.new("RGBA", (W, H), (244, 197, 106, 0))
        im.putalpha(traits)
        return {"image": fichier(im, dossier, f"{nom}-traits")}
    blanc = Image.new("RGB", (W, H), (255, 255, 255))
    lavis = encre(fond, part_traits=0.07, teinte=(16, 24, 30), couleur=0.9, saturation=1.35, tons=(110, 160, 210), fond=blanc)
    # sombre : le bois vert-bleu et la pierre ocre gardent leur couleur, mais dans la nuit
    lavis = ImageChops.multiply(lavis, Image.new("RGB", (W, H), (150, 158, 150)))
    lavis = ImageEnhance.Contrast(lavis).enhance(1.12)
    im = lavis.convert("RGBA")
    im.putalpha(alpha)
    return {"image": fichier(im, dossier, f"{nom}-lavis")}


def sans_plaque(photo):
    """La porte d'Irun sans sa plaque « 2 » (en haut à droite, x 0,895 à 0,96, y 0,015 à 0,075) :
    la pierre du jambage, prise juste dessous, la recouvre."""
    w, h = photo.size
    x0, x1, y0, y1 = round(0.885 * w), round(0.97 * w), round(0.010 * h), round(0.080 * h)
    pierre = photo.crop((x0, y1 + round(0.01 * h), x1, 2 * y1 - y0 + round(0.01 * h)))
    m = Image.new("L", pierre.size, 0)
    ImageDraw.Draw(m).rectangle((pierre.width * 0.06, pierre.height * 0.06, pierre.width * 0.94, pierre.height * 0.94), fill=255)
    photo = photo.copy()
    photo.paste(pierre, (x0, y0), m.filter(ImageFilter.GaussianBlur(pierre.width * 0.04)))
    return photo


def preparer_marche(d, dossier, nom):
    """marche_aluva : le « Jardin tropical » à l'encre, retouché chaud et clair, sans papier (le
    papier se pose sur le dessin entier)."""
    photo = recadrer(photo_pour(d["photo"]), d.get("x", 0.0), d.get("y", 0.5), 1.0)
    photo = preparer_encre(photo, dict(RETOUCHES_ENCRE.get("marche-aluva", {})))
    im = encre(photo, part_traits=0.08, couleur=0.9, saturation=1.35, tons=(140, 196, 236),
               fond=Image.new("RGB", (W, H), (255, 255, 255)))
    return {"image": fichier(im, dossier, f"{nom}-jardin")}


# Le doigt de dieu : l'empilement de rochers de 35024039 tel que le montre le décor « rochers »
# (x 0,75), détouré à la main (points en fractions de la photo entière).
ROCHERS = [
    (0.625, 0.95), (0.620, 0.86), (0.612, 0.76), (0.608, 0.70), (0.612, 0.64), (0.618, 0.59), (0.630, 0.555),
    (0.643, 0.530), (0.644, 0.47), (0.648, 0.425), (0.660, 0.39), (0.680, 0.37), (0.705, 0.365), (0.730, 0.37),
    (0.748, 0.388), (0.765, 0.398), (0.800, 0.408), (0.815, 0.43), (0.818, 0.47), (0.810, 0.495), (0.835, 0.505),
    (0.855, 0.535), (0.863, 0.58), (0.862, 0.625), (0.852, 0.66), (0.872, 0.68), (0.883, 0.72), (0.890, 0.78),
    (0.897, 0.85), (0.905, 0.95),
]


def preparer_desert(d, dossier, nom):
    """desert : le ciel de 1.1 (27116682, cadré comme le ciel des toits) viré au velours noir, sans
    changer une étoile ; le doigt de dieu, l'empilement de rochers détouré et passé à l'encre."""
    extra = {}
    nuit = d.get("nuit", True)
    if nuit and d.get("photo"):
        src = ouvrir(d["photo"])
        w = round(src.width * H / src.height)
        ciel = src.resize((w, H), Image.LANCZOS)
        x0 = int(w * 0.36)                                  # le cadre du ciel des toits (images.py)
        ciel = ciel.crop((x0, 0, x0 + W, H))
        g = ciel.convert("L")
        # le fond du ciel descend au noir, les étoiles gardent leur éclat
        fond = ImageEnhance.Color(ciel).enhance(0.35)
        fond = fond.point(lambda v: max(0, round((v - 14) * 1.25)))
        velours = ImageChops.multiply(fond, Image.new("RGB", (W, H), (200, 196, 255)))
        etoiles = g.point(lambda v: 0 if v < 70 else min(255, (v - 70) * 3))
        ciel = Image.composite(ImageEnhance.Brightness(ciel).enhance(1.15), velours, etoiles)
        extra["ciel"] = fichier(ciel, dossier, f"{nom}-ciel")
    if d.get("rochers"):
        src = ouvrir(d["rochers"])
        pts = [(x * src.width, y * src.height) for x, y in ROCHERS]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        boite = (round(min(xs)), round(min(ys)), round(max(xs)), round(max(ys)))
        roc = src.crop(boite)
        m = Image.new("L", roc.size, 0)
        ImageDraw.Draw(m).polygon([(x - boite[0], y - boite[1]) for x, y in pts], fill=255)
        m = m.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(3))
        # à l'encre, dans une page (le filtre veut 1600 x 2400) : la roche posée au milieu
        rw, rh = roc.size
        s = min(1500 / rw, 2300 / rh)
        roc = roc.resize((round(rw * s), round(rh * s)), Image.LANCZOS)
        m = m.resize(roc.size, Image.LANCZOS)
        toile = Image.new("RGB", (W, H), (200, 190, 175))
        ox, oy = (W - roc.width) // 2, (H - roc.height) // 2
        toile.paste(roc, (ox, oy))
        if nuit:
            # la nuit : une roche d'encre, à peine grise, que seules les étoiles dessinent
            toile = ImageEnhance.Color(toile).enhance(0.3)
            lavis = encre(toile, part_traits=0.09, teinte=(8, 9, 22), couleur=0.5, saturation=0.8,
                          tons=(70, 118, 170), fond=Image.new("RGB", (W, H), (255, 255, 255)))
            lavis = ImageChops.multiply(lavis, Image.new("RGB", (W, H), (70, 74, 104)))
        else:
            # le jour : la roche chauffée par le soleil, ocre et brune
            toile = rechauffer(toile, 0.8)
            lavis = encre(toile, part_traits=0.09, teinte=(56, 32, 14), couleur=0.9, saturation=1.3,
                          tons=(130, 186, 230), fond=Image.new("RGB", (W, H), (255, 255, 255)))
            lavis = ImageChops.multiply(lavis, Image.new("RGB", (W, H), (255, 214, 160)))
        roche = lavis.crop((ox, oy, ox + roc.width, oy + roc.height)).convert("RGBA")
        roche.putalpha(m)
        extra["roche"] = fichier(roche, dossier, f"{nom}-roche")
        extra["rapport_roche"] = roche.height / roche.width
    return extra


def preparer_depart(d, dossier, nom):
    """depart, plan « loin » : la passerelle et les saules du modèle en lavis du soir, sans traits
    (le dessin retrace à l'encre les saules, la barrière et le chemin) ; l'homme du modèle est effacé."""
    if d.get("plan") != "loin" or not d.get("modele"):
        return {}
    photo = recadrer(photo_pour(d["modele"]), 0.5, 0.5, 1.0)
    photo = effacer_passant(photo).filter(ImageFilter.GaussianBlur(4))
    photo = crepuscule(photo)
    im = encre(photo, part_traits=0.0001, teinte=(34, 18, 44), tons=(112, 168, 214),
               fond=degrade((236, 206, 178), (170, 150, 176), (226, 184, 170)))
    return {"image": fichier(im, dossier, f"{nom}-passerelle")}


# L'homme debout au bout de la passerelle de 36652487, en fractions du cadre 2:3 centré (x0, y0, x1,
# y1) : effacer_passant le recouvre de ce qui l'entoure (le dessin y retrace la barrière, et pose
# Darshan plus loin, sur le chemin).
PASSANT = (0.505, 0.738, 0.680, 0.880)


def effacer_passant(photo):
    """Recouvre la zone PASSANT de ce qui l'entoure : colonne par colonne, le chemin juste au-dessus
    et la passerelle juste au-dessous, fondus de l'un à l'autre, un peu de grain ; bords adoucis.
    La passerelle est vide."""
    x0, y0, x1, y1 = (round(v * s) for v, s in zip(PASSANT, (W, H, W, H)))
    largeur, hauteur = x1 - x0, y1 - y0
    haut = photo.crop((x0, y0 - 16, x1, y0)).resize((largeur, 1), Image.BOX).resize((largeur, hauteur), Image.NEAREST)
    bas = photo.crop((x0, y1, x1, y1 + 10)).resize((largeur, 1), Image.BOX).resize((largeur, hauteur), Image.NEAREST)
    fond = Image.composite(haut, bas, rampe((largeur, hauteur), 0.25, 0.95))
    grain = photo.crop((x0, y0 - hauteur // 3, x1, y0)).resize((largeur, hauteur), Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
    # lissé en travers (les colonnes ne font plus de stries), puis un peu du grain du chemin
    fond = fond.resize((max(2, largeur // 14), hauteur), Image.BOX).resize((largeur, hauteur), Image.BICUBIC)
    fond = Image.blend(fond, ImageOps.autocontrast(grain, cutoff=2), 0.22).filter(ImageFilter.GaussianBlur(2))
    m = Image.new("L", (largeur, hauteur), 0)
    ImageDraw.Draw(m).rounded_rectangle((largeur * 0.03, hauteur * 0.0, largeur * 0.97, hauteur * 0.98), radius=largeur * 0.15, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(largeur * 0.035))
    photo = photo.copy()
    photo.paste(fond, (x0, y0), m)
    return photo


PREPARATIONS = {
    "cosmos_portes": preparer_cadre,
    "fenetre": preparer_fenetre,
    "tableau": preparer_tableau,
    "porte_pere": preparer_porte_pere,
    "marche_aluva": preparer_marche,
    "desert": preparer_desert,
    "depart": preparer_depart,
}


# ---------------------------------------------------------------- les dessins, photographiés par Chromium
def chromium(dossier, noms):
    """Photographie dossier/<nom>.svg (ou .html) en PNG de 1600 x 2400 avec rendu.js."""
    env = dict(os.environ)
    if os.path.isdir(NODE_MODULES):
        env["NODE_PATH"] = os.pathsep.join(p for p in (env.get("NODE_PATH"), NODE_MODULES) if p)
    subprocess.run(["node", str(ICI / "rendu.js"), f"--dossier={dossier}", "--echelle=4/3",
                    *[f"{n}:png" for n in noms]], cwd=ICI, env=env, check=True)


def taches_dessin(nom):
    """Les images à tirer du dessin `nom` : le décor, puis ses calques ; (sortie, réglages)."""
    d = dict(reglages(nom))
    d.pop("type")
    taches = [(nom, d)]
    for calque, r in CALQUES.get(nom, {}).items():
        taches.append((calque, {**d, **r}))
    return taches


def avec_papier(im, force):
    """Le papier des encres posé sur l'image (la couche de transparence reste telle quelle)."""
    if not force:
        return im
    alpha = im.getchannel("A") if im.mode == "RGBA" else None
    rgb = im.convert("RGB")
    rgb = Image.blend(rgb, ImageChops.multiply(rgb, papier()), force)
    if alpha is not None:
        rgb = rgb.convert("RGBA")
        rgb.putalpha(alpha)
    return rgb


def faire_dessins(noms):
    """Les dessins de `noms` et leurs calques : {sortie: image}."""
    images = {}
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        taches = [t for nom in noms for t in taches_dessin(nom)]
        for sortie, d in taches:
            d = dict(d)
            fonction = d.pop("fonction")
            preparer = PREPARATIONS.get(fonction)
            if preparer:
                d.update(preparer(d, tmp, sortie))
            elif "photo" in d:
                # la photo entière, que le SVG cadre lui-même
                d["image"] = fichier(ouvrir(d["photo"]), tmp, f"vue-{d['photo']}")
            (tmp / f"{sortie}.svg").write_text(getattr(art, fonction)(**d), encoding="utf-8")
        chromium(tmp, [s for s, _ in taches])
        for sortie, _ in taches:
            im = Image.open(tmp / f"{sortie}.png")
            im = im.convert("RGBA") if sortie in ALPHA else im.convert("RGB")
            im = avec_papier(im, PAPIER_DESSIN.get(sortie, 1.0))
            if sortie in DECOUPES:
                im = im.crop(tuple(round(v * K) for v in DECOUPES[sortie]))
            images[sortie] = im
    return images


# ---------------------------------------------------------------- les extras
def faire_bande(nom):
    """Une bande verticale de 1600 de large, toute la hauteur de la photo, au même x et au même
    zoom que les décors qu'elle contient (5.9 : de « lune-horizon » à « lune-haute »)."""
    b = BANDES[nom]
    im = photo_pour(b["photo"], b["zoom"])
    s = max(W / im.width, H / im.height) * b["zoom"]
    if s > 1.0:
        im = ouvrir(b["photo"], originale=True)
        s = max(W / im.width, H / im.height) * b["zoom"]
    hauteur = round(im.height * s)
    x0 = (im.width * s - W) * b["x"]
    return im.resize((W, hauteur), Image.LANCZOS, box=(x0 / s, 0, (x0 + W) / s, im.height))


def faire_arbres_poeme():
    """0.2 : la ligne d'arbres du bas de ciel-poeme.jpg, sur fond transparent, pour que le ciel
    tourne derrière elle sans faire tourner l'horizon (1200 x 1800, comme ciel-poeme.jpg)."""
    ciel = Image.open(IMG / "ciel-poeme.jpg").convert("RGB")
    g = ciel.convert("L").filter(ImageFilter.GaussianBlur(5))
    # les arbres : plus sombres que le ciel qui les entoure, et sans étoiles ; seulement en bas
    ciel_proche = g.filter(ImageFilter.GaussianBlur(60))
    arbres = ImageChops.subtract(ciel_proche, g, scale=1, offset=0).point(lambda v: min(255, max(0, (v - 1) * 60)))
    sombre = g.point(lambda v: 255 if v < 30 else max(0, 255 - (v - 30) * 40))
    m = ImageChops.lighter(ImageChops.multiply(arbres, sombre), sombre.point(lambda v: v if v > 200 else 0))
    m = ImageChops.multiply(m, ImageOps.invert(rampe(ciel.size, 0.74, 0.80)))
    m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    # sous la ligne d'arbres, tout est arbre
    plein = Image.new("L", ciel.size, 0)
    ImageDraw.Draw(plein).rectangle((0, round(ciel.height * 0.93), ciel.width, ciel.height), fill=255)
    m = ImageChops.lighter(m, plein.filter(ImageFilter.GaussianBlur(20)))
    # seul ce qui tient au sol est arbre : les taches sombres du ciel, isolées, restent du ciel
    tient = m.point(lambda v: 255 if v > 90 else 0)
    for x in range(0, tient.width, 3):
        if tient.getpixel((x, tient.height - 1)) == 255:
            ImageDraw.floodfill(tient, (x, tient.height - 1), 128)
    tient = tient.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2))
    im = ciel.convert("RGBA")
    im.putalpha(ImageChops.multiply(m, tient))
    return im


def faire_esquisse():
    """2.10 : l'esquisse du théâtre, en SVG (le moteur la trace trait par trait, par étapes)."""
    return art.vision_theatre()


def faire_galerie():
    """5.6 et 5.7 : vignettes carrées (480 px) et clichés (1066 x 1600) des photos de la galerie,
    tirés des cadres des décors : {sortie: image}."""
    images = {}
    for nom in GALERIE:
        d = reglages(nom)
        if d.get("format") == "paysage":
            im = faire_photo(nom)
            images[f"{nom}-vignette"] = ImageOps.fit(im, (VIGNETTE, VIGNETTE), Image.LANCZOS)
            continue
        cliche = faire_photo(nom, taille=CLICHE)
        images[f"{nom}-cliche"] = cliche
        images[f"{nom}-vignette"] = ImageOps.fit(cliche, (VIGNETTE, VIGNETTE), Image.LANCZOS)
    return images


EXTRAS = ("lune-bande", "arbres-poeme", "esquisse-theatre", "galerie")


def fabriquer_extras(noms):
    for nom in noms:
        if nom in BANDES:
            enregistrer(faire_bande(nom), SORTIE / f"{nom}.webp")
        elif nom == "arbres-poeme":
            # le calque de la voûte est un fichier du prototype (livre.py : « voute »), dans src/img/
            enregistrer(faire_arbres_poeme(), IMG / "arbres-poeme.webp")
        elif nom == "esquisse-theatre":
            (SORTIE / "esquisse-theatre.svg").write_text(faire_esquisse(), encoding="utf-8")
            print("esquisse-theatre.svg écrit", flush=True)
        elif nom == "galerie":
            for sortie, im in faire_galerie().items():
                enregistrer(im, SORTIE / f"{sortie}.webp")


# ---------------------------------------------------------------- enregistrement
def enregistrer(im, chemin):
    """WebP sRGB, qualité 86, ramenée à 84 puis 82 si l'image dépasse 450 Ko ; les images avec une
    couche de transparence la gardent."""
    for q in QUALITES:
        tampon = io.BytesIO()
        im.save(tampon, "WEBP", quality=q, method=6)
        if tampon.tell() <= POIDS_MAX:
            break
    chemin.write_bytes(tampon.getvalue())
    print(f"{chemin.name:30s} qualité {q}  {tampon.tell() // 1024:4d} Ko  {im.size[0]} x {im.size[1]}", flush=True)


def fabriquer(noms):
    SORTIE.mkdir(parents=True, exist_ok=True)
    dessins = [n for n in noms if livre.DECORS[n]["type"] == "dessin"]
    manquants = [n for n in dessins if not hasattr(art, livre.DECORS[n]["fonction"])]
    if manquants:
        # dessins dont la fonction n'est pas encore écrite dans art.py : laissés pour plus tard
        print("à dessiner dans art.py :", ", ".join(f"{n} ({livre.DECORS[n]['fonction']})" for n in manquants))
        dessins = [n for n in dessins if n not in manquants]
    for nom in noms:
        t = livre.DECORS[nom]["type"]
        if t == "photo":
            enregistrer(faire_photo(nom), SORTIE / f"{nom}.webp")
        elif t == "encre":
            enregistrer(faire_encre(nom), SORTIE / f"{nom}.webp")
    if dessins:
        for nom, im in faire_dessins(dessins).items():
            enregistrer(im, SORTIE / f"{nom}.webp")


# ---------------------------------------------------------------- la planche contact
def police(taille):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, taille)
    return ImageFont.load_default()


def damier(taille, pas=12):
    d = Image.new("RGB", taille, (92, 92, 96))
    dr = ImageDraw.Draw(d)
    for y in range(0, taille[1], pas):
        for x in range((y // pas) % 2 * pas, taille[0], 2 * pas):
            dr.rectangle((x, y, x + pas - 1, y + pas - 1), fill=(70, 70, 74))
    return d


def vignette(chemin, taille):
    with Image.open(chemin) as im:
        if im.mode in ("RGBA", "LA") or "transparency" in im.info:
            im = im.convert("RGBA")
            im.thumbnail(taille, Image.LANCZOS)
            fond = damier(taille)
            fond.paste(im, ((taille[0] - im.width) // 2, (taille[1] - im.height) // 2), im)
            return fond
        im = im.convert("RGB")
        if abs(im.width / im.height - taille[0] / taille[1]) > 0.02:
            im.thumbnail(taille, Image.LANCZOS)
            fond = Image.new("RGB", taille, (18, 18, 20))
            fond.paste(im, ((taille[0] - im.width) // 2, (taille[1] - im.height) // 2))
            return fond
        return ImageOps.fit(im, taille, Image.LANCZOS)


def planche():
    """Toutes les images en vignettes avec leur nom (et leur poids), dans l'ordre de livre.py ;
    chaque décor suivi de ses calques ; les décors du prototype aussi, pour juger l'unité du monde
    de Darshan ; puis les extras."""
    vignettes = []
    for nom, d in livre.DECORS.items():
        if d["type"] == "uni":
            continue
        if d["type"] == "prototype":
            for f in d["fichiers"]:
                chemin = IMG / f
                if chemin.exists():
                    vignettes.append((chemin, f"{nom} (prototype)" if f == d["fichiers"][0] else f"{nom} : {f}"))
            # un dessin du prototype déjà refait en décor (aluva : la retouche de scene_aluva)
            chemin = SORTIE / f"{nom}.webp"
            if chemin.exists():
                vignettes.append((chemin, f"{nom} (dessin)  {chemin.stat().st_size // 1024} Ko"))
            continue
        for sortie in [nom, *CALQUES.get(nom, {})]:
            chemin = SORTIE / f"{sortie}.webp"
            if chemin.exists():
                vignettes.append((chemin, f"{sortie}  {chemin.stat().st_size // 1024} Ko"))
    extras = [SORTIE / "lune-bande.webp"]
    extras += [SORTIE / f"{n}-{s}.webp" for n in GALERIE for s in ("vignette", "cliche")]
    extras += [IMG / "esquisse-theatre.png", FIN]
    for chemin in extras:
        if chemin.exists():
            poids = f"  {chemin.stat().st_size // 1024} Ko" if chemin.parent == SORTIE else ""
            vignettes.append((chemin, chemin.stem + poids))
    if (IMG / "couverture.jpg").exists():
        vignettes.insert(0, (IMG / "couverture.jpg", "couverture"))
    tw, th, marge, colonnes = 240, 360, 34, 8
    lignes = (len(vignettes) + colonnes - 1) // colonnes
    p = Image.new("RGB", (colonnes * (tw + 8) + 8, lignes * (th + marge + 8) + 8), (28, 28, 30))
    ecrit, f = ImageDraw.Draw(p), police(15)
    for i, (chemin, legende) in enumerate(vignettes):
        x, y = 8 + (i % colonnes) * (tw + 8), 8 + (i // colonnes) * (th + marge + 8)
        p.paste(vignette(chemin, (tw, th)), (x, y))
        ecrit.text((x + 2, y + th + 7), legende, fill=(235, 225, 200), font=f)
    total = sum(c.stat().st_size for c in SORTIE.iterdir() if c.is_file())
    p.save(PLANCHE, quality=85)
    print("planche :", PLANCHE.name, p.size, f"; dossier des décors : {total / 1024 / 1024:.1f} Mo")


# ---------------------------------------------------------------- la page « Fin »
def photos_vues():
    """Les photos de Karl vues dans le livre (en photo ou à l'encre, et le fond photographique des
    dessins ; pas leurs modèles), dans l'ordre où on les voit : les décors de chaque tableau, puis
    les images de ses effets et de ses gestes."""
    vues = []

    def voir(nom):
        d = livre.DECORS.get(nom)
        if not d:
            return
        if d["type"] in ("photo", "encre") or (d["type"] == "dessin" and d.get("photo")):
            numeros = [d["photo"]]
        else:
            numeros = PHOTOS_PROTOTYPE.get(nom, [])
        for n in numeros:
            if n not in vues:
                vues.append(n)

    def parcourir(x):
        if isinstance(x, str):
            voir(x)
        elif isinstance(x, dict):
            for v in x.values():
                parcourir(v)
        elif isinstance(x, (list, tuple)):
            for v in x:
                parcourir(v)

    for s in livre.SCENES.values():
        for cle in ("decor", "debut", "gestes", "moments", "extra"):
            parcourir(s.get(cle))
    return vues


def planche_fin(largeur=1500, hauteur_ligne=150, ecart=10, fond=(244, 236, 220)):
    """La planche des photographies du livre pour la page « Fin » : chaque photo entière, sans encre
    ni recadrage, en rangées justifiées, sur le papier du livre."""
    photos = []
    for n in photos_vues():
        im = ouvrir(n)
        im.thumbnail((hauteur_ligne * 4, hauteur_ligne * 2), Image.LANCZOS)
        photos.append(im)
    lignes, ligne, somme = [], [], 0.0
    for im in photos:
        r = im.width / im.height
        ligne.append(im)
        somme += r
        if somme * hauteur_ligne + ecart * (len(ligne) - 1) >= largeur:
            lignes.append((ligne, somme))
            ligne, somme = [], 0.0
    if ligne:
        lignes.append((ligne, None))
    hauteurs = []
    for ligne, somme in lignes:
        hauteurs.append(round((largeur - ecart * (len(ligne) - 1)) / somme) if somme else hauteur_ligne)
    p = Image.new("RGB", (largeur, sum(hauteurs) + ecart * (len(hauteurs) - 1)), fond)
    y = 0
    for (ligne, somme), h in zip(lignes, hauteurs):
        x = 0 if somme else (largeur - sum(round(im.width * h / im.height) for im in ligne) - ecart * (len(ligne) - 1)) // 2
        for im in ligne:
            w = round(im.width * h / im.height)
            p.paste(im.resize((w, h), Image.LANCZOS), (x, y))
            x += w + ecart
        y += h + ecart
    return p, len(photos)


# ---------------------------------------------------------------- en avant
A_FAIRE = ("photo", "encre", "dessin")

if __name__ == "__main__":
    demandes = sys.argv[1:]
    decors = [n for n, d in livre.DECORS.items() if d["type"] in A_FAIRE]
    extras = [n for n in demandes if n in EXTRAS or n in BANDES]
    inconnus = [n for n in demandes if n not in decors and n not in extras and n not in ("planche", "fin")]
    if inconnus:
        sys.exit("décors inconnus (ou sans image à fabriquer) : " + ", ".join(inconnus))
    noms = [n for n in decors if not demandes or n in demandes]
    if noms:
        fabriquer(noms)
    if not demandes:
        extras = list(EXTRAS)
    fabriquer_extras(extras)
    if not demandes or "fin" in demandes:
        im, n = planche_fin()
        enregistrer(im, FIN)
        print(f"page « Fin » : {n} photographies")
    if not demandes or noms or extras or "planche" in demandes:
        planche()
