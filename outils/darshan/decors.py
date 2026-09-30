"""Fabrique les décors du livre jouable Darshan : une image par décor, 1600 x 2400, en WebP.

Usage, depuis la racine du dépôt, dans une session Claude :
    python3 outils/darshan/decors.py                  tous les décors, la couverture et la planche
    python3 outils/darshan/decors.py periyar toiles   seulement ces décors, puis la planche
    python3 outils/darshan/decors.py couverture       seulement la couverture
    python3 outils/darshan/decors.py planche          seulement la planche contact

Demande Pillow, et Playwright avec Chromium (le programme règle lui-même NODE_PATH), présents
dans les sessions Claude ; ne jamais lancer « playwright install ». Les images produites sont
versées au dépôt : build.py n'a besoin de rien de tout ça.

Les décors sont décrits dans livre.py (dictionnaire DECORS), qu'on ne modifie pas ici :
- « photo », le monde de Julie : la photo de Karl telle qu'il l'a faite, recadrée en 2:3, sans
  aucune autre retouche (agrandie proprement si elle est trop petite) ;
- « encre », le monde de Darshan : la même photo recadrée, passée à l'encre et à l'aquarelle sur
  papier par le filtre d'images.py, repris ici pour 1600 x 2400 : mêmes réglages, mais rayons de
  flou et tailles de bruit multipliés par 4/3, pour que le rendu soit celui de 1200 x 1800, ni
  plus fin ni plus grossier ; « soir » : palette du crépuscule, plus chaude et plus sombre ;
- « dessin » : la fonction du même nom d'art.py dessine le décor (SVG de 1200 x 1800), Chromium
  le photographie à l'échelle 4/3 (rendu.js), puis le papier des encres s'y ajoute ;
- « prototype » et « uni » : rien à faire (images déjà faites, fonds unis).

Recadrage : x et y (de 0 à 1) placent le cadre 2:3 dans la photo agrandie, comme le recadrage
d'images.py : 0 le colle au bord gauche (ou haut), 0,5 le centre, 1 le colle au bord droit (ou
bas) ; zoom agrandit la photo avant de recadrer. CORRECTIONS, plus bas, remplace les recadrages
de livre.py qui coupaient mal leur sujet ; RETOUCHES_ENCRE ajuste le filtre décor par décor.

Photos : chaque photo est téléchargée une seule fois, à l'adresse publique de son fichier sur
images.pexels.com (celle qu'affichent les sites), jamais par une page de pexels.com ni par l'API,
et gardée dans src/img/pexels-<numéro>.jpg (non suivi par Git). Si ce fichier existe déjà mais
trop petit (images.py en a pris quelques-uns en 2 000 pixels de haut), le programme le laisse tel
quel et garde la grande version à côté, dans src/img/pexels-<numéro>-h3600.jpg.

Sorties :
- src/img/decors/<nom>.webp : 1600 x 2400 (les coordonnées de la scène, en 1200 x 1800, y sont
  à l'échelle 4/3), sRGB, qualité 86, ramenée à 84 puis 82 au-delà de 450 Ko ;
- src/img/couverture.jpg : 1600 x 2400, JPEG qualité 90, pour les deux EPUB (jouable et
  classique) : le ciel étoilé de Karl (27116682), assombri, et le titre dans les polices du livre ;
- planche-decors.jpg (non suivie par Git) : toutes les images en vignettes, avec leur nom, pour
  relire d'un coup d'œil.
"""
import io
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
FONTS = ICI / "src" / "fonts"
PLANCHE = ICI / "planche-decors.jpg"
W, H = 1600, 2400                       # taille des décors
K = W / 1200                            # une unité de la scène (1200 x 1800) = 4/3 de pixel
POIDS_MAX = 450 * 1024
QUALITES = (86, 84, 82)
AGENT = "Mozilla/5.0 (darshan, images de Karl Forterre)"
ADRESSE = "https://images.pexels.com/photos/{n}/pexels-photo-{n}.jpeg?auto=compress&cs=tinysrgb&h=3600"
PAUSE = 1.5                             # secondes entre deux téléchargements
NODE_MODULES = "/opt/node22/lib/node_modules"

# ---------------------------------------------------------------- corrections des recadrages
# Recadrages de livre.py qui coupaient mal leur sujet, vérifiés sur la planche : ce dictionnaire
# les remplace ici, sans toucher à livre.py (à y reporter quand on voudra). Mêmes clés que livre.py.
CORRECTIONS = {
}

# ---------------------------------------------------------------- réglages du filtre, décor par décor
# Les réglages d'images.encre (part_traits, teinte, couleur, saturation, tons), plus « clair » :
# éclaircit la photo avant le filtre, pour les photos sombres qui deviendraient une encre boueuse.
RETOUCHES_ENCRE = {
}

# ---------------------------------------------------------------- réglages des dessins
# « papier » : force du papier des encres posé sur le dessin (0 : aucun, 1 : comme les encres).
PAPIER_DESSIN = {
    "fenetre": 0.0,          # monde de Julie : rendu photographique, sans papier
    "papier-lettre": 0.0,    # la feuille a déjà son propre papier
}


# ---------------------------------------------------------------- les photos
def source(numero):
    """Chemin de la photo en cache, téléchargée au besoin (une seule fois)."""
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
    demande = urllib.request.Request(ADRESSE.format(n=numero), headers={"User-Agent": AGENT})
    with urllib.request.urlopen(demande, timeout=60) as r:
        donnees = r.read()
    cible.write_bytes(donnees)
    print("téléchargée :", cible.name, len(donnees) // 1024, "Ko", flush=True)
    time.sleep(PAUSE)
    return cible


def ouvrir(numero):
    im = ImageOps.exif_transpose(Image.open(source(numero)))
    if im.info.get("icc_profile"):
        from PIL import ImageCms
        profil = ImageCms.ImageCmsProfile(io.BytesIO(im.info["icc_profile"]))
        im = ImageCms.profileToProfile(im, profil, ImageCms.createProfile("sRGB"), outputMode="RGB")
    return im.convert("RGB")


def recadrer(im, x=0.5, y=0.5, zoom=1.0, taille=(W, H)):
    """Cadre 2:3 de la photo agrandie de `zoom`, placé par x et y (de 0 à 1), en une seule
    passe LANCZOS (réduction, ou agrandissement si la photo est trop petite)."""
    tw, th = taille
    s = max(tw / im.width, th / im.height) * zoom
    x0, y0 = (im.width * s - tw) * x, (im.height * s - th) * y
    return im.resize((tw, th), Image.LANCZOS, box=(x0 / s, y0 / s, (x0 + tw) / s, (y0 + th) / s))


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


def degrade(haut, bas, milieu=None):
    """Dégradé vertical de la taille des décors (couleurs RVB), passant par `milieu` à mi-hauteur."""
    col = Image.new("RGB", (1, H))
    for y in range(H):
        t = y / (H - 1)
        if milieu:
            a, b, t = (haut, milieu, t * 2) if t < 0.5 else (milieu, bas, t * 2 - 1)
        else:
            a, b = haut, bas
        col.putpixel((0, y), tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)))
    return col.resize((W, H))


def crepuscule(photo):
    """Le soir sur le fleuve : la lumière de la photo devient celle du couchant (or et rose en
    haut, reflets roses dans l'eau), les ombres virent à l'indigo, le tout plus sombre."""
    g = ImageOps.autocontrast(photo.convert("L"), cutoff=1)
    ombres = ImageOps.colorize(g, black=(26, 22, 58), mid=(122, 76, 112), white=(255, 196, 132))
    ciel = degrade((255, 178, 96), (150, 96, 150), (255, 150, 128))
    teinte = ImageChops.multiply(ombres, ImageChops.screen(ciel, Image.new("RGB", (W, H), (110, 90, 110))))
    return Image.blend(photo, teinte, 0.72)


def faire_encre(nom):
    d = reglages(nom)
    photo = recadrer(ouvrir(d["photo"]), d["x"], d["y"], d["zoom"])
    r = dict(RETOUCHES_ENCRE.get(nom, {}))
    clair = r.pop("clair", None)
    if clair:
        photo = ImageEnhance.Brightness(photo).enhance(clair)
    if d.get("soir"):
        photo = crepuscule(photo)
        r.setdefault("teinte", (34, 18, 44))
        r.setdefault("tons", (112, 168, 214))
        r.setdefault("fond", ImageChops.multiply(papier(), degrade((236, 206, 178), (170, 150, 176), (226, 184, 170))))
    return encre(photo, **r)


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


def faire_photo(nom):
    d = reglages(nom)
    im = ouvrir(d["photo"])
    if d.get("marge"):
        im = etendre(im, d["marge"])
    return recadrer(im, d["x"], d["y"], d["zoom"])


# ---------------------------------------------------------------- les dessins, photographiés par Chromium
def chromium(dossier, noms):
    """Photographie dossier/<nom>.svg (ou .html) en PNG de 1600 x 2400 avec rendu.js."""
    env = dict(os.environ)
    if os.path.isdir(NODE_MODULES):
        env["NODE_PATH"] = os.pathsep.join(p for p in (env.get("NODE_PATH"), NODE_MODULES) if p)
    subprocess.run(["node", str(ICI / "rendu.js"), f"--dossier={dossier}", "--echelle=4/3",
                    *[f"{n}:png" for n in noms]], cwd=ICI, env=env, check=True)


def faire_dessins(noms):
    images = {}
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        for nom in noms:
            d = dict(reglages(nom))
            d.pop("type")
            fonction = getattr(art, d.pop("fonction"))
            if "photo" in d:
                # la photo vue par la fenêtre : un fichier local que le SVG référence
                vue = tmp / f"vue-{d['photo']}.jpg"
                ouvrir(d["photo"]).save(vue, quality=95)
                d["image"] = vue.as_uri()
            (tmp / f"{nom}.svg").write_text(fonction(**d), encoding="utf-8")
        chromium(tmp, noms)
        for nom in noms:
            im = Image.open(tmp / f"{nom}.png").convert("RGB")
            force = PAPIER_DESSIN.get(nom, 1.0)
            if force:
                im = Image.blend(im, ImageChops.multiply(im, papier()), force)
            images[nom] = im
    return images


# ---------------------------------------------------------------- enregistrement
def enregistrer(im, chemin):
    """WebP sRGB, qualité 86, ramenée à 84 puis 82 si l'image dépasse 450 Ko."""
    for q in QUALITES:
        tampon = io.BytesIO()
        im.save(tampon, "WEBP", quality=q, method=6)
        if tampon.tell() <= POIDS_MAX:
            break
    chemin.write_bytes(tampon.getvalue())
    print(f"{chemin.name:28s} qualité {q}  {tampon.tell() // 1024:4d} Ko", flush=True)


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


# ---------------------------------------------------------------- la couverture
COUVERTURE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><style>
@font-face {{ font-family: "Amiri"; font-style: normal; src: url("{fonts}/Amiri-Regular.woff2") format("woff2"); }}
@font-face {{ font-family: "Amiri"; font-style: italic; src: url("{fonts}/Amiri-Italic.woff2") format("woff2"); }}
@font-face {{ font-family: "Unna"; src: url("{fonts}/Unna-Regular.woff2") format("woff2"); }}
@font-face {{ font-family: "Tiro Darshan"; src: url("{fonts}/Tiro-Darshan.woff2") format("woff2"); }}
html, body {{ margin: 0; width: 1200px; height: 1800px; overflow: hidden; background: #03040c; }}
body {{ background: url("{ciel}") center / cover no-repeat; position: relative; text-align: center; }}
p {{ margin: 0; position: absolute; left: 0; right: 0; }}
.auteur {{ top: 262px; font-family: "Amiri", serif; font-variant: small-caps; font-size: 64px;
  letter-spacing: 0.26em; padding-left: 0.26em; color: #e3dccd; text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8); }}
.titre {{ top: 600px; font-family: "Unna", serif; font-size: 300px; line-height: 1; letter-spacing: 0.01em;
  color: #ffe7b0; text-shadow: 0 0 60px rgba(255, 200, 110, 0.38), 0 0 16px rgba(255, 214, 140, 0.25), 0 4px 18px rgba(0, 0, 0, 0.85); }}
.devanagari {{ top: 952px; font-family: "Tiro Darshan", serif; font-size: 100px; letter-spacing: 0;
  color: #d8c9ab; text-shadow: 0 0 24px rgba(255, 200, 120, 0.25), 0 3px 12px rgba(0, 0, 0, 0.85); }}
.genre {{ top: 1540px; font-family: "Amiri", serif; font-style: italic; font-size: 60px; letter-spacing: 0.04em;
  color: #d6ccb8; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9); }}
</style></head><body>
<p class="auteur">Karl Forterre</p>
<p class="titre">Darshan</p>
<p class="devanagari" lang="hi">दर्शन</p>
<p class="genre">nouvelle</p>
</body></html>
"""


def ciel_couverture():
    """Le ciel étoilé de Karl, cadré comme ciel-poeme.jpg, assombri : voile bleu nuit, plus sombre
    derrière le titre et sur les bords, pour que la typographie se lise même en vignette."""
    src = ouvrir(27116682)
    w = round(src.width * H / src.height)
    ciel = src.resize((w, H), Image.LANCZOS)
    x0 = int(w * 0.36)
    ciel = ciel.crop((x0, 0, x0 + W, H))
    ciel = ImageChops.screen(ciel, Image.new("RGB", (W, H), (4, 10, 40)))
    voile = Image.new("L", (W, H), 0)
    dessin = ImageDraw.Draw(voile)
    dessin.ellipse((-300, 520 * K, W + 300, 1420 * K), fill=150)
    dessin.rectangle((0, 0, W, 460 * K), fill=70)
    voile = voile.filter(ImageFilter.GaussianBlur(160))
    bords = Image.radial_gradient("L").resize((W, H)).point(lambda v: min(255, int(max(0, v - 120) * 1.6)))
    voile = ImageChops.lighter(voile, bords)
    sombre = ImageEnhance.Brightness(ciel).enhance(0.45)
    return Image.composite(sombre, ImageEnhance.Brightness(ciel).enhance(0.85), voile)


def couverture():
    with tempfile.TemporaryDirectory() as tmp:
        tmp = pathlib.Path(tmp)
        fond = tmp / "ciel.png"
        ciel_couverture().save(fond)
        (tmp / "couverture.html").write_text(COUVERTURE.format(fonts=FONTS.as_uri(), ciel=fond.as_uri()), encoding="utf-8")
        chromium(tmp, ["couverture"])
        im = Image.open(tmp / "couverture.png").convert("RGB")
    im.save(IMG / "couverture.jpg", quality=90, subsampling=0, optimize=True, progressive=True)
    print("couverture.jpg", (IMG / "couverture.jpg").stat().st_size // 1024, "Ko")


# ---------------------------------------------------------------- la planche contact
def police(taille):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, taille)
    return ImageFont.load_default()


def planche():
    """Toutes les images en vignettes avec leur nom (et leur poids), dans l'ordre de livre.py ;
    les décors du prototype aussi, pour juger l'unité du monde de Darshan."""
    vignettes = []
    for nom, d in livre.DECORS.items():
        if d["type"] == "uni":
            continue
        if d["type"] == "prototype":
            chemin = IMG / d["fichiers"][0]
            legende = f"{nom} (prototype)"
        else:
            chemin = SORTIE / f"{nom}.webp"
            if not chemin.exists():
                continue
            legende = f"{nom}  {chemin.stat().st_size // 1024} Ko"
        vignettes.append((chemin, legende))
    if (IMG / "couverture.jpg").exists():
        vignettes.insert(0, (IMG / "couverture.jpg", "couverture"))
    tw, th, marge, colonnes = 240, 360, 34, 8
    lignes = (len(vignettes) + colonnes - 1) // colonnes
    p = Image.new("RGB", (colonnes * (tw + 8) + 8, lignes * (th + marge + 8) + 8), (28, 28, 30))
    ecrit, f = ImageDraw.Draw(p), police(15)
    for i, (chemin, legende) in enumerate(vignettes):
        x, y = 8 + (i % colonnes) * (tw + 8), 8 + (i // colonnes) * (th + marge + 8)
        with Image.open(chemin) as im:
            p.paste(ImageOps.fit(im.convert("RGB"), (tw, th), Image.LANCZOS), (x, y))
        ecrit.text((x + 2, y + th + 7), legende, fill=(235, 225, 200), font=f)
    p.save(PLANCHE, quality=85)
    print("planche :", PLANCHE.name, p.size)


# ---------------------------------------------------------------- en avant
A_FAIRE = ("photo", "encre", "dessin")

if __name__ == "__main__":
    demandes = sys.argv[1:]
    decors = [n for n, d in livre.DECORS.items() if d["type"] in A_FAIRE]
    inconnus = [n for n in demandes if n not in decors and n not in ("couverture", "planche")]
    if inconnus:
        sys.exit("décors inconnus (ou sans image à fabriquer) : " + ", ".join(inconnus))
    noms = [n for n in decors if not demandes or n in demandes]
    if noms:
        fabriquer(noms)
    if not demandes or "couverture" in demandes:
        couverture()
    if not demandes or noms or "planche" in demandes:
        planche()
