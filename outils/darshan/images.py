"""Refait les images de la tranche verticale de Darshan (à lancer seulement pour les changer).

Usage : python3 outils/darshan/images.py
Demande Pillow et Playwright avec Chromium, présents dans les sessions Claude. Les images
produites sont déjà dans src/img/ : la fabrication (build.py) n'a besoin de rien de tout ça.

1. Télécharge deux photos de Karl sur Pexels : le ciel étoilé (27116682) et les tuiles
   (34500347), à l'adresse publique de leurs fichiers, comme le site les affiche.
2. En tire le ciel du poème, le ciel des toits (teinté « bleu royal », comme dans le
   texte) et la texture des tuiles de nuit, mise en perspective.
3. Dessine les décors (art.py) et les photographie avec Chromium (rendu.js).
4. Finitions : porte éclaircie au clair de lune, calque de la ville en WebP transparent.
5. Le monde de Julie, pour le banc d'essai des transitions : trois photos de Karl
   (« Métro », « Style haussmannien », « Pluie »), recadrées en 2:3.
6. Le monde de Darshan peut aussi naître des photos de Karl, passées à l'encre et à
   l'aquarelle : python3 outils/darshan/images.py encre 34762346 (le numéro Pexels de la
   photo) écrit src/img/encre-34762346.jpg. Le banc d'essai montre la porte à la lanterne.
"""
import pathlib
import random
import subprocess
import sys
import urllib.request

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

ICI = pathlib.Path(__file__).resolve().parent
IMG = ICI / "src" / "img"
PHOTOS = {
    "pexels-27116682.jpg": "https://images.pexels.com/photos/27116682/pexels-photo-27116682.jpeg?auto=compress&cs=tinysrgb&h=2700",
    "pexels-34500347.jpg": "https://images.pexels.com/photos/34500347/pexels-photo-34500347.jpeg?auto=compress&cs=tinysrgb&w=2000",
}


# le monde photographié de Julie : (photo, position horizontale du recadrage, de 0 à 1)
JULIE = {
    "photo-metro.jpg": (33035627, 0.5),
    "photo-haussmann.jpg": (33035628, 0.18),
    "photo-pluie.jpg": (34408656, 0.5),
}
for nom, (numero, _) in JULIE.items():
    PHOTOS["pexels-%d.jpg" % numero] = ("https://images.pexels.com/photos/%d/pexels-photo-%d.jpeg"
                                         "?auto=compress&cs=tinysrgb&h=2000" % (numero, numero))


def telecharger():
    for nom, url in PHOTOS.items():
        cible = IMG / nom
        if not cible.exists():
            demande = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (darshan, images de Karl Forterre)"})
            with urllib.request.urlopen(demande) as r:
                cible.write_bytes(r.read())
        print("photo :", nom)


def preparer():
    src = Image.open(IMG / "pexels-27116682.jpg").convert("RGB")
    h = 1800
    w = round(src.width * h / src.height)
    ciel = src.resize((w, h), Image.LANCZOS)
    x0 = int(w * 0.36)
    ciel = ciel.crop((x0, 0, x0 + 1200, 1800))
    toits = ImageChops.screen(ciel, Image.new("RGB", ciel.size, (8, 22, 92)))
    toits = ImageEnhance.Brightness(ImageEnhance.Contrast(toits).enhance(1.12)).enhance(1.05)
    toits.save(IMG / "ciel-toits.jpg", quality=90)
    ImageChops.screen(ciel, Image.new("RGB", ciel.size, (4, 10, 40))).save(IMG / "ciel-poeme.jpg", quality=86)

    t = Image.open(IMG / "pexels-34500347.jpg").convert("RGB")
    rot = t.rotate(-33, resample=Image.BICUBIC, expand=True)
    cx, cy = rot.width // 2, rot.height // 2
    tex = rot.crop((cx - 700, cy - 380, cx + 700, cy + 380))
    nuit = ImageEnhance.Brightness(ImageOps.grayscale(tex).convert("RGB")).enhance(0.42)
    nuit = ImageEnhance.Contrast(ImageChops.multiply(nuit, Image.new("RGB", nuit.size, (120, 140, 230)))).enhance(1.35)
    nuit.transform((1200, 420), Image.QUAD, data=(260, 0, 0, 760, 1400, 760, 1140, 0),
                   resample=Image.BICUBIC).save(IMG / "tuiles-nuit.jpg", quality=90)
    print("ciels et tuiles préparés")


def dessiner():
    subprocess.run([sys.executable, str(ICI / "art.py")], check=True)
    subprocess.run(["node", "rendu.js", "ciel-nuit", "ville:png", "toits", "porte", "aluva"], cwd=ICI, check=True)


def julie():
    """Recadre chaque photo en 2:3 (1200 x 1800), sans autre retouche : c'est le monde réel."""
    for nom, (numero, x) in JULIE.items():
        src = Image.open(IMG / ("pexels-%d.jpg" % numero)).convert("RGB")
        h = 1800
        w = round(src.width * h / src.height)
        src = src.resize((w, h), Image.LANCZOS)
        x0 = round((w - 1200) * x)
        src.crop((x0, 0, x0 + 1200, 1800)).save(IMG / nom, quality=86, optimize=True, progressive=True)
        print("photo de Julie :", nom)


# ---------------------------------------------------------------- passage à l'encre
# Pour le monde de Darshan : une photo de Karl devient un lavis à l'encre de Chine, rehaussé
# d'aquarelle, sur papier. Trois couches multipliées sur le papier : la couleur (légère, avec
# des auréoles), l'encre diluée (trois tons pour les ombres) et les traits (seuls les contours
# les plus marqués, qui s'évanouissent par endroits). Réglages à reprendre décor par décor.
W, H = 1200, 1800


def recadrer(im, x=0.5):
    """Recadre en 2:3 (1200 x 1800) ; x : position horizontale du cadre, de 0 à 1."""
    h = H
    w = round(im.width * h / im.height)
    if w < W:
        w, h = W, round(im.height * W / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    x0, y0 = round((w - W) * x), (h - H) // 2
    return im.crop((x0, y0, x0 + W, y0 + H))


def ondes(echelle, graine, flou):
    """Bruit doux et reproductible, de la taille de la scène."""
    random.seed(graine)
    n = Image.effect_noise((max(2, W // echelle), max(2, H // echelle)), 90)
    return n.resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(flou))


def papier():
    random.seed(3)
    grain = Image.effect_noise((W, H), 38).filter(ImageFilter.GaussianBlur(1.1))
    p = ImageOps.colorize(grain, black=(226, 214, 192), white=(252, 246, 232))
    return ImageChops.multiply(p, ImageOps.colorize(ondes(10, 4, 9), black=(232, 224, 208), white=(255, 255, 255)))


def centile(im, part):
    h, total, cumul = im.histogram(), im.width * im.height, 0
    for v, n in enumerate(h):
        cumul += n
        if cumul >= total * part:
            return v
    return 255


def encre(photo, part_traits=0.10, teinte=(20, 22, 44), couleur=0.85, saturation=1.55, tons=(125, 180, 225)):
    im = photo.convert("RGB")
    blanc = Image.new("RGB", (W, H), (255, 255, 255))
    g = ImageOps.autocontrast(im.convert("L"), cutoff=1)
    # les traits : une part fixe de l'image, là où le contraste est le plus fort
    dog = ImageChops.subtract(g.filter(ImageFilter.GaussianBlur(7)), g.filter(ImageFilter.GaussianBlur(1.8)))
    s = max(6, centile(dog, 1 - part_traits))
    traits = dog.point(lambda v: 0 if v < s else min(255, (v - s) * 16 + 110))
    traits = traits.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    traits = ImageChops.multiply(traits, ondes(26, 5, 16).point(lambda v: min(255, max(70, int((v - 50) * 2.4)))))
    # l'encre diluée : trois tons gris-bleu pour les ombres, grain du papier
    a, b, c = tons
    niveaux = g.filter(ImageFilter.GaussianBlur(3.5)).point(lambda v: a if v < 55 else b if v < 105 else c if v < 165 else 255)
    niveaux = ImageChops.multiply(niveaux.filter(ImageFilter.GaussianBlur(2.5)), ondes(3, 11, 1.2).point(lambda v: 228 + v // 10))
    lavis = ImageOps.colorize(niveaux, black=teinte, white=(255, 255, 255))
    # la couleur : franche mais transparente, pâlie par endroits (auréoles)
    coul = ImageEnhance.Brightness(ImageEnhance.Color(im.filter(ImageFilter.GaussianBlur(5))).enhance(saturation)).enhance(1.12)
    coul = Image.blend(coul, blanc, 1 - couleur)
    aureoles = ondes(12, 9, 14).point(lambda v: min(255, max(0, int((v - 50) * 1.7))))
    coul = Image.composite(coul, Image.blend(coul, blanc, 0.45), aureoles)
    ink = Image.composite(Image.new("RGB", (W, H), teinte), blanc, traits)
    return ImageChops.multiply(ImageChops.multiply(ImageChops.multiply(papier(), coul), lavis), ink)


def passer_a_l_encre(numero, x=0.5):
    source = IMG / ("pexels-%d.jpg" % numero)
    if not source.exists():
        url = "https://images.pexels.com/photos/%d/pexels-photo-%d.jpeg?auto=compress&cs=tinysrgb&h=2000" % (numero, numero)
        demande = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (darshan, images de Karl Forterre)"})
        with urllib.request.urlopen(demande) as r:
            source.write_bytes(r.read())
    cible = IMG / ("encre-%d.jpg" % numero)
    encre(recadrer(Image.open(source), x)).save(cible, quality=86, optimize=True, progressive=True)
    print("passée à l'encre :", cible.name)


def finir():
    porte = Image.open(IMG / "porte.jpg")
    porte = ImageEnhance.Contrast(ImageEnhance.Brightness(porte).enhance(1.45)).enhance(1.08)
    porte.save(IMG / "porte.jpg", quality=88)
    Image.open(IMG / "ville.png").save(IMG / "ville.webp", "WEBP", quality=88, method=6)
    print("finitions faites")


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "encre":
        for n in sys.argv[2:]:
            passer_a_l_encre(int(n))
        sys.exit(0)
    telecharger()
    preparer()
    dessiner()
    finir()
    julie()
    passer_a_l_encre(34762346)
