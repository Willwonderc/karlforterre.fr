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
"""
import pathlib
import subprocess
import sys
import urllib.request

from PIL import Image, ImageChops, ImageEnhance, ImageOps

ICI = pathlib.Path(__file__).resolve().parent
IMG = ICI / "src" / "img"
PHOTOS = {
    "pexels-27116682.jpg": "https://images.pexels.com/photos/27116682/pexels-photo-27116682.jpeg?auto=compress&cs=tinysrgb&h=2700",
    "pexels-34500347.jpg": "https://images.pexels.com/photos/34500347/pexels-photo-34500347.jpeg?auto=compress&cs=tinysrgb&w=2000",
}


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


def finir():
    porte = Image.open(IMG / "porte.jpg")
    porte = ImageEnhance.Contrast(ImageEnhance.Brightness(porte).enhance(1.45)).enhance(1.08)
    porte.save(IMG / "porte.jpg", quality=88)
    Image.open(IMG / "ville.png").save(IMG / "ville.webp", "WEBP", quality=88, method=6)
    print("finitions faites")


if __name__ == "__main__":
    telecharger()
    preparer()
    dessiner()
    finir()
