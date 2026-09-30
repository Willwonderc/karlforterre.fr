"""Décors de la tranche verticale de Darshan, dessinés par programme (SVG).

Chaque fonction renvoie un document SVG de 1200 x 1800 (format 2:3 de la scène).
Les textures lourdes (filtres de turbulence) ne servent qu'au rendu figé : rendu.js
photographie ensuite chaque décor avec Chromium (JPEG, ou PNG transparent).
Deux mondes : la nuit de Paris part des photos de Karl (ciel, tuiles) recouvertes
d'encre ; les lieux que seul Darshan atteint (Aluva) sont à l'encre et à l'aquarelle.
"""
import math
import random

W, H = 1200, 1800


# ---------------------------------------------------------------- outils

def catmull_rom(pts, n=14):
    """Courbe lisse passant par tous les points."""
    if len(pts) < 3:
        (x0, y0), (x1, y1) = pts[0], pts[-1]
        return [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n + 1)]
    p = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(pts[-1])
    return out


def trait(pts, largeur, rng, attaque=0.18, fuite=0.35, tremble=0.10, n=14):
    """Trait de pinceau : un polygone dont la largeur enfle puis s'effile."""
    c = catmull_rom(pts, n)
    longueurs = [0.0]
    for i in range(1, len(c)):
        longueurs.append(longueurs[-1] + math.dist(c[i - 1], c[i]))
    total = longueurs[-1] or 1.0
    gauche, droite = [], []
    bruit = rng.uniform(0, 10)
    for i, (x, y) in enumerate(c):
        t = longueurs[i] / total
        if t < attaque:
            f = (t / attaque) ** 0.6
        elif t > 1 - fuite:
            f = ((1 - t) / fuite) ** 0.9
        else:
            f = 1.0
        f *= 1 + tremble * math.sin(bruit + t * 17.0) * math.sin(bruit * 0.7 + t * 5.0)
        w = max(0.25, largeur * f) / 2
        j = min(i + 1, len(c) - 1)
        k = max(i - 1, 0)
        dx, dy = c[j][0] - c[k][0], c[j][1] - c[k][1]
        d = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / d, dx / d
        gauche.append((x + nx * w, y + ny * w))
        droite.append((x - nx * w, y - ny * w))
    poly_ = gauche + droite[::-1]
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in poly_) + " Z"


def poly(pts):
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"


def droit(pts, pas=40):
    """Les points d'une ligne brisée, resserrés tous les « pas » : le trait de pinceau la suit
    droite, sans les boucles que la courbe lisse ferait entre des coins éloignés."""
    out = [pts[0]]
    for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
        n = max(1, round(math.dist((xa, ya), (xb, yb)) / pas))
        out += [(xa + (xb - xa) * k / n, ya + (yb - ya) * k / n) for k in range(1, n + 1)]
    return out


def svg(contenu, defs="", fond=None):
    f = f'<rect width="{W}" height="{H}" fill="{fond}"/>' if fond else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {W} {H}" width="{W}" height="{H}"><defs>{defs}</defs>{f}{contenu}</svg>')


FILTRE_ENCRE = """
<filter id="bord-encre" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="b"/>
  <feDisplacementMap in="SourceGraphic" in2="b" scale="5" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0.55 0"/>
  <feComposite in2="SourceGraphic" operator="in"/>
</filter>
<filter id="halo" x="-100%" y="-100%" width="300%" height="300%">
  <feGaussianBlur stdDeviation="6"/>
</filter>
"""


# ---------------------------------------------------------------- Paris, la nuit

def tour_eiffel(cx, base, h, couleur):
    """Silhouette simplifiée de la tour Eiffel (pieds, arche, trois étages)."""
    s = h / 1000.0

    def P(x, y):
        return (cx + x * s, base - y * s)
    contour = [P(-190, 0), P(-150, 0), P(-110, 110), P(-60, 150), P(-30, 170), P(0, 172),
               P(30, 170), P(60, 150), P(110, 110), P(150, 0), P(190, 0),
               P(120, 190), P(112, 205), P(80, 330), P(62, 360), P(50, 520), P(38, 545),
               P(20, 800), P(16, 820), P(9, 900), P(4, 960), P(3, 1000), P(-3, 1000),
               P(-4, 960), P(-9, 900), P(-16, 820), P(-20, 800), P(-38, 545), P(-50, 520),
               P(-62, 360), P(-80, 330), P(-112, 205), P(-120, 190)]
    plateformes = [poly([P(-130, 190), P(130, 190), P(130, 205), P(-130, 205)]),
                   poly([P(-68, 360), P(68, 360), P(68, 372), P(-68, 372)]),
                   poly([P(-24, 800), P(24, 800), P(24, 810), P(-24, 810)])]
    return (f'<path d="{poly(contour)}" fill="{couleur}"/>' +
            "".join(f'<path d="{p}" fill="{couleur}"/>' for p in plateformes))


def immeuble(x, largeur, haut_facade, rng, couleur, fenetres, lueurs):
    """Immeuble haussmannien vu de loin : façade, toit mansardé, lucarnes, souches."""
    elems = []
    y_toit = haut_facade
    h_mansarde = rng.uniform(70, 110)
    retrait = rng.uniform(10, 18)
    corps = [(x, H), (x, y_toit), (x + retrait, y_toit - h_mansarde * 0.85),
             (x + retrait + 6, y_toit - h_mansarde), (x + largeur - retrait - 6, y_toit - h_mansarde),
             (x + largeur - retrait, y_toit - h_mansarde * 0.85), (x + largeur, y_toit), (x + largeur, H)]
    elems.append(f'<path d="{poly(corps)}" fill="{couleur}"/>')
    elems.append(f'<rect x="{x - 4:.1f}" y="{y_toit - 5:.1f}" width="{largeur + 8:.1f}" height="7" fill="{couleur}"/>')
    n = max(1, int((largeur - 2 * retrait) // 62))
    pas = (largeur - 2 * retrait) / n
    for i in range(n):
        lx = x + retrait + pas * (i + 0.5)
        ly = y_toit - h_mansarde * 0.55
        lw, lh = 22, 34
        lucarne = [(lx - lw / 2 - 4, ly + lh / 2), (lx - lw / 2 - 4, ly - lh / 2),
                   (lx, ly - lh / 2 - 14), (lx + lw / 2 + 4, ly - lh / 2), (lx + lw / 2 + 4, ly + lh / 2)]
        elems.append(f'<path d="{poly(lucarne)}" fill="{couleur}"/>')
        if rng.random() < lueurs:
            teinte = rng.choice(["#ffd08a", "#ffc46b", "#ffe2a8", "#f7b765"])
            fenetres.append((lx - lw / 2 + 4, ly - lh / 2 + 5, lw - 8, lh - 8, teinte))
    for _ in range(rng.randint(1, 3)):
        sx = rng.uniform(x + retrait + 10, x + largeur - retrait - 40)
        sw = rng.uniform(26, 58)
        sh = rng.uniform(40, 75)
        top = y_toit - h_mansarde - sh
        elems.append(f'<rect x="{sx:.1f}" y="{top:.1f}" width="{sw:.1f}" height="{sh + 4:.1f}" fill="{couleur}"/>')
        elems.append(f'<rect x="{sx - 3:.1f}" y="{top:.1f}" width="{sw + 6:.1f}" height="6" fill="{couleur}"/>')
        npots = max(1, int(sw // 11))
        for k in range(npots):
            px = sx + 4 + k * (sw - 8) / (npots - 1) if npots > 1 else sx + sw / 2 - 3
            ph = rng.uniform(10, 18)
            elems.append(f'<rect x="{px - 3:.1f}" y="{top - ph:.1f}" width="7" height="{ph:.1f}" rx="1.5" fill="{couleur}"/>')
    if rng.random() < 0.45:
        ax = rng.uniform(x + retrait + 8, x + largeur - retrait - 8)
        base = y_toit - h_mansarde
        mh = rng.uniform(55, 95)
        elems.append(f'<rect x="{ax:.1f}" y="{base - mh:.1f}" width="2.4" height="{mh:.1f}" fill="{couleur}"/>')
        for k in range(rng.randint(2, 4)):
            bw = rng.uniform(14, 30)
            elems.append(f'<rect x="{ax - bw / 2:.1f}" y="{base - mh + 6 + k * 9:.1f}" width="{bw:.1f}" height="2" fill="{couleur}"/>')
    return "".join(elems)


def rangee(y_base, x0, x1, rng, couleur, fenetres, lueurs, hmin=60, hmax=140):
    out = []
    x = x0
    while x < x1:
        larg = rng.uniform(120, 230)
        out.append(immeuble(x, larg, y_base + rng.uniform(-hmax, -hmin) + 100, rng, couleur, fenetres, lueurs))
        x += larg - rng.uniform(0, 10)
    return "".join(out)


def pigeonnier(x, y, echelle, couleur, clair):
    """Petite cabane de bois et de grillage posée sur un toit plat."""
    s = echelle

    def P(a, b):
        return (x + a * s, y + b * s)
    cab = poly([P(0, 0), P(0, -120), P(-8, -120), P(70, -170), P(148, -120), P(140, -120), P(140, 0)])
    porte = poly([P(40, -6), P(40, -96), P(100, -96), P(100, -6)])
    out = [f'<path d="{cab}" fill="{couleur}"/>',
           f'<path d="{porte}" fill="none" stroke="{clair}" stroke-width="{2.2 * s:.1f}" opacity="0.55"/>']
    for k in range(1, 6):
        xx = x + (40 + k * 10) * s
        out.append(f'<line x1="{xx:.1f}" y1="{y - 94 * s:.1f}" x2="{xx:.1f}" y2="{y - 8 * s:.1f}" stroke="{clair}" stroke-width="{1.1 * s:.1f}" opacity="0.4"/>')
    for k in range(1, 9):
        yy = y - (96 - k * 10) * s
        out.append(f'<line x1="{x + 40 * s:.1f}" y1="{yy:.1f}" x2="{x + 100 * s:.1f}" y2="{yy:.1f}" stroke="{clair}" stroke-width="{1.1 * s:.1f}" opacity="0.4"/>')
    return "".join(out)


def scene_toits(seed=11, calque="complet"):
    """calque : « complet », « ciel » (photo et brume) ou « ville » (toits seuls, fond transparent)."""
    rng = random.Random(seed)
    fenetres = []
    lointain = rangee(1235, -40, W + 40, rng, "#101830", fenetres, 0.10, 20, 70)
    tour = tour_eiffel(330, 1190, 470, "#131c35")
    milieu = rangee(1330, -60, W + 60, rng, "#070a14", fenetres, 0.28, 30, 150)
    proche = rangee(1420, -80, W + 80, rng, "#04060c", fenetres, 0.18, 40, 120)
    cabane = pigeonnier(880, 1386, 1.05, "#05070e", "#8fa6d8")
    toit = ('<image href="tuiles-nuit.jpg" x="0" y="1380" width="1200" height="420" preserveAspectRatio="none"/>'
            '<rect x="0" y="1380" width="1200" height="420" fill="url(#ombre-toit)"/>'
            '<path d="M0,1384 L1200,1384 L1200,1396 L0,1396 Z" fill="#02030a"/>'
            '<path d="M0,1381 L1200,1381" stroke="#8ea2d8" stroke-width="2" opacity="0.5"/>')
    lueurs = "".join(
        f'<rect class="fenetre" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{c}" opacity="0.92"/>'
        for x, y, w, h, c in fenetres)
    halos = "".join(
        f'<rect x="{x - 6:.1f}" y="{y - 6:.1f}" width="{w + 12:.1f}" height="{h + 12:.1f}" fill="{c}" opacity="0.35" filter="url(#halo)"/>'
        for x, y, w, h, c in fenetres)
    phare = '<circle cx="330" cy="720" r="4" fill="#fff3c8"/>'
    ciel = (f'<image href="ciel-toits.jpg" x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"/>'
            f'<rect width="{W}" height="{H}" fill="url(#brume)"/>')
    ville = (f'<g filter="url(#bord-encre)">{tour}{lointain}</g>'
             f'<rect y="1000" width="{W}" height="400" fill="url(#brume-basse)"/>'
             f'<g filter="url(#bord-encre)">{milieu}{cabane}{proche}</g>'
             f'{halos}{lueurs}{toit}{phare}')
    if calque == "ciel":
        contenu = ciel
    elif calque == "ville":
        contenu = ville
    else:
        contenu = ciel + ville + f'<rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.18"/>'
    defs = FILTRE_ENCRE + """
<linearGradient id="brume" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0a1a5c" stop-opacity="0.10"/>
  <stop offset="0.55" stop-color="#1b3a9a" stop-opacity="0.18"/>
  <stop offset="0.72" stop-color="#6b7fc4" stop-opacity="0.28"/>
  <stop offset="0.80" stop-color="#e8d9c0" stop-opacity="0.30"/>
  <stop offset="1" stop-color="#0a0f22" stop-opacity="0.9"/>
</linearGradient>
<linearGradient id="ombre-toit" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#03050c" stop-opacity="0.15"/>
  <stop offset="0.5" stop-color="#03050c" stop-opacity="0.35"/>
  <stop offset="1" stop-color="#010207" stop-opacity="0.92"/>
</linearGradient>
<linearGradient id="brume-basse" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#c9c3d8" stop-opacity="0"/>
  <stop offset="0.35" stop-color="#9aa6d6" stop-opacity="0.16"/>
  <stop offset="1" stop-color="#0a0f22" stop-opacity="0"/>
</linearGradient>"""
    return svg(contenu, defs, None if calque == "ville" else "#050816")


# ---------------------------------------------------------------- la porte du pigeonnier

def scene_porte(seed=5):
    rng = random.Random(seed)
    out = []
    x0, x1, y0, y1 = 250, 950, 260, 1560
    n = 7
    larg = (x1 - x0) / n
    for i in range(n):
        xa = x0 + i * larg
        teinte = rng.choice(["#3a2718", "#34231a", "#402b1a", "#2f2016"])
        out.append(f'<rect x="{xa + 3:.1f}" y="{y0}" width="{larg - 6:.1f}" height="{y1 - y0}" fill="{teinte}" filter="url(#bois)"/>')
        for _ in range(5):
            vx = xa + rng.uniform(12, larg - 12)
            pts = [(vx + rng.uniform(-4, 4), y0 + 20)]
            for k in range(1, 6):
                pts.append((vx + rng.uniform(-9, 9), y0 + 20 + k * (y1 - y0 - 40) / 5))
            out.append(f'<path d="{trait(pts, rng.uniform(1.5, 3.5), rng, 0.3, 0.3, 0.3)}" fill="#1a110a" opacity="0.6"/>')
    for y in (y0 + 150, y1 - 170):
        out.append(f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="70" fill="#4a3220" filter="url(#bois)"/>')
    out.append(f'<path d="{poly([(x0 + 10, y1 - 170), (x0 + 80, y1 - 170), (x1 - 10, y0 + 220), (x1 - 80, y0 + 220)])}" fill="#45301e" filter="url(#bois)"/>')
    gx0, gx1, gy0, gy1 = 330, 870, 300, 820
    out.append(f'<rect x="{gx0}" y="{gy0}" width="{gx1 - gx0}" height="{gy1 - gy0}" fill="#07080c"/>')
    maille = 34
    lignes = []
    for i in range(int((gx1 - gx0) / maille) + 1):
        x = gx0 + i * maille
        lignes.append(f'<line x1="{x}" y1="{gy0}" x2="{x}" y2="{gy1}"/>')
    for j in range(int((gy1 - gy0) / maille) + 1):
        y = gy0 + j * maille
        lignes.append(f'<line x1="{gx0}" y1="{y}" x2="{gx1}" y2="{y}"/>')
    out.append(f'<g stroke="#7d8aa8" stroke-width="2.4" opacity="0.75" filter="url(#rouille)">{"".join(lignes)}</g>')
    out.append(f'<rect x="{gx0}" y="{gy0}" width="{gx1 - gx0}" height="{gy1 - gy0}" fill="none" stroke="#2c241a" stroke-width="16"/>')
    out.append('<rect x="760" y="930" width="120" height="190" rx="10" fill="#2b2a2a" stroke="#4a4540" stroke-width="3" filter="url(#rouille)"/>')
    out.append('<path d="M820,985 a18,18 0 1 1 0.1,0 Z M812,1000 L828,1000 L834,1058 L806,1058 Z" fill="#050505"/>')
    for y in (y0 + 175, y1 - 145):
        out.append(f'<path d="M{x0 - 30},{y} L{x0 + 240},{y + 6} L{x0 + 240},{y + 22} L{x0 - 30},{y + 26} Z" fill="#2f2d2b" filter="url(#rouille)"/>')
    cadre = (f'<rect x="{x0 - 60}" y="{y0 - 70}" width="{x1 - x0 + 120}" height="{y1 - y0 + 140}" fill="#0b0a08"/>'
             f'<rect x="{x0 - 12}" y="{y0 - 12}" width="{x1 - x0 + 24}" height="{y1 - y0 + 24}" fill="#000"/>')
    mur = f'<rect width="{W}" height="{H}" fill="url(#nuit-mur)"/>'
    lune = f'<rect width="{W}" height="{H}" fill="url(#clair-de-lune)"/>'
    contenu = (mur + cadre + "".join(out) + lune +
               f'<rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.22"/>')
    defs = FILTRE_ENCRE + """
<filter id="bois" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.012 0.35" numOctaves="3" seed="4" result="t"/>
  <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 1.6 -0.55" result="v"/>
  <feComposite in="v" in2="SourceGraphic" operator="in" result="vv"/>
  <feBlend in="vv" in2="SourceGraphic" mode="multiply"/>
</filter>
<filter id="rouille" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.25" numOctaves="2" seed="9" result="r"/>
  <feColorMatrix in="r" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.22  0 0 0 0 0.08  0 0 0 1.2 -0.35" result="rr"/>
  <feComposite in="rr" in2="SourceGraphic" operator="in" result="rrr"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="rrr"/></feMerge>
</filter>
<radialGradient id="nuit-mur" cx="0.5" cy="0.35" r="0.9">
  <stop offset="0" stop-color="#1a2240"/><stop offset="1" stop-color="#03040a"/>
</radialGradient>
<linearGradient id="clair-de-lune" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#a9c0ff" stop-opacity="0.30"/>
  <stop offset="0.45" stop-color="#26346e" stop-opacity="0.30"/>
  <stop offset="1" stop-color="#000" stop-opacity="0.72"/>
</linearGradient>"""
    return svg(contenu, defs, "#03040a")


# ---------------------------------------------------------------- Aluva, à l'encre et à l'aquarelle

# Les filtres de l'aquarelle, communs aux dessins : lavis au bord irrégulier et plus foncé
# (« aquarelle »), lavis doux (« aquarelle-douce »), grain du papier (« papier »).
DEFS_AQUARELLE = """
<filter id="aquarelle" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="12" result="b"/>
  <feDisplacementMap in="SourceGraphic" in2="b" scale="14" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="0.8" result="doux"/>
  <feMorphology in="d" operator="erode" radius="2.5" result="e"/>
  <feComposite in="d" in2="e" operator="out" result="bord"/>
  <feGaussianBlur in="bord" stdDeviation="1.2" result="bordflou"/>
  <feColorMatrix in="bordflou" type="matrix" values="0.55 0 0 0 0  0 0.55 0 0 0  0 0 0.6 0 0  0 0 0 0.5 0" result="bordfonce"/>
  <feMerge><feMergeNode in="doux"/><feMergeNode in="bordfonce"/></feMerge>
</filter>
<filter id="aquarelle-douce" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" result="b"/>
  <feDisplacementMap in="SourceGraphic" in2="b" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="0.6"/>
</filter>
<filter id="papier" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="8" result="p"/>
  <feDiffuseLighting in="p" lighting-color="#fff8ea" surfaceScale="1.2" result="l">
    <feDistantLight azimuth="45" elevation="60"/>
  </feDiffuseLighting>
  <feComposite in="l" in2="SourceGraphic" operator="in"/>
</filter>
"""


def lavis(d, couleur, opacite=0.55, filtre="aquarelle"):
    return f'<path d="{d}" fill="{couleur}" opacity="{opacite}" filter="url(#{filtre})"/>'


def palmier(x, y, h, rng, encre, vert):
    """Cocotier : tronc sinueux et palmes en volutes, trait d'encre et lavis."""
    out = []
    courbe = rng.uniform(-0.35, 0.35)
    tronc = [(x, y)]
    for k in range(1, 6):
        t = k / 5
        tronc.append((x + courbe * h * t * t + rng.uniform(-4, 4), y - h * t))
    sommet = tronc[-1]
    out.append(f'<path d="{trait(tronc, h * 0.045, rng, 0.05, 0.25, 0.12)}" fill="{encre}" opacity="0.92"/>')
    for k in range(9):
        ang = -math.pi / 2 + (k - 4) * 0.38 + rng.uniform(-0.12, 0.12)
        longueur = h * rng.uniform(0.32, 0.48)
        pts = [sommet]
        for s in range(1, 5):
            t = s / 4
            a = ang + (0.9 if math.cos(ang) >= 0 else -0.9) * t * t
            pts.append((sommet[0] + math.cos(a) * longueur * t, sommet[1] + math.sin(a) * longueur * t + longueur * 0.55 * t * t))
        out.append(lavis(trait(pts, h * 0.07, rng, 0.1, 0.7, 0.25), vert, 0.55))
        out.append(f'<path d="{trait(pts, h * 0.012, rng, 0.05, 0.6, 0.2)}" fill="{encre}" opacity="0.85"/>')
    return "".join(out)


def kayak(poupe, proue, largeur, rng, encre="#1f150d", clair="droite", bande=True, jaune="#f0bf2c", ombre=None):
    """Un kayak jaune vu de profil, de la poupe à la proue : coque effilée aux deux bouts, un liseré
    rouge et une bande bleue (comme sur la photo de Karl 35086240), l'hiloire sombre ; la lumière
    vient du côté `clair` (« droite » ou « gauche », en regardant de la poupe vers la proue) ; `ombre` :
    un dégradé (son identifiant) posé sur la coque, pour la pénombre d'un local."""
    (x0, y0), (x1, y1) = poupe, proue
    lg = math.dist(poupe, proue)
    ux, uy = (x1 - x0) / lg, (y1 - y0) / lg
    nx, ny = -uy, ux
    if (nx < 0) == (clair == "droite"):
        nx, ny = -nx, -ny                                 # la normale pointe vers le côté éclairé

    def bord(cote, part=1.0, t0=0.0, t1=1.0, n=40):
        pts = []
        for k in range(n + 1):
            t = t0 + (t1 - t0) * k / n
            w = largeur / 2 * (math.sin(math.pi * t) ** 0.55) * part
            px, py = x0 + ux * lg * t, y0 + uy * lg * t
            pts.append((px + cote * nx * w, py + cote * ny * w))
        return pts
    def point(t, cote=0.0):
        """Un point de l'axe (t de 0 à 1), décalé de `cote` demi-largeurs vers le côté éclairé."""
        w = largeur / 2 * (math.sin(math.pi * t) ** 0.55) * cote
        return (x0 + ux * lg * t + nx * w, y0 + uy * lg * t + ny * w)
    lumiere, ombre_ = bord(1), bord(-1)
    angle = math.degrees(math.atan2(uy, ux))
    out = [f'<path d="{poly(lumiere + ombre_[::-1])}" fill="{jaune}"/>',
           # le pont bombé : l'ombre du côté du mur, un reflet de l'embrasure de l'autre
           f'<path d="{poly(bord(-1) + bord(-1, 0.1)[::-1])}" fill="#8a5a08" opacity="0.55"/>',
           f'<path d="{poly(bord(1, 0.92) + bord(1, 0.55)[::-1])}" fill="#fff2b0" opacity="0.5"/>',
           # la couture du pont et de la coque, de bout en bout
           f'<path d="{trait(bord(1, 0.9, 0.04, 0.96), 1.6, rng, 0.2, 0.2, 0.1)}" fill="#7a4c06" opacity="0.6"/>']
    # le liseré rouge ; la bande bleue près de la proue
    out.append(f'<path d="{trait(bord(-1, 0.72, 0.1, 0.9), largeur * 0.05, rng, 0.05, 0.05, 0.05)}" fill="#cf3f32" opacity="0.9"/>')
    if bande:
        pts = bord(1, 1.0, 0.74, 0.79, 6) + bord(-1, 1.0, 0.74, 0.79, 6)[::-1]
        out.append(f'<path d="{poly(pts)}" fill="#2f5f99" opacity="0.85"/>')
    # les sandows croisés sur le pont avant, les poignées aux deux bouts
    for t in (0.66, 0.70):
        a, b = point(t, -0.7), point(t + 0.035, 0.7)
        c, d = point(t, 0.7), point(t + 0.035, -0.7)
        out.append(f'<path d="M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f} M{c[0]:.1f},{c[1]:.1f} L{d[0]:.1f},{d[1]:.1f}" '
                   f'stroke="#2a1a0c" stroke-width="2.2" opacity="0.75"/>')
    for t in (0.03, 0.97):
        p = point(t)
        out.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{largeur * 0.08:.1f}" fill="none" stroke="#2a1a0c" stroke-width="2.4"/>')
    # l'hiloire : l'ouverture du trou d'homme, son rebord, le dossier du siège dedans
    cx, cy = point(0.46)
    rx, ry = lg * 0.095, largeur * 0.3
    tr = f'transform="rotate({angle:.1f} {cx:.1f} {cy:.1f})"'
    out.append(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" {tr} fill="#241509"/>')
    out.append(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" {tr} fill="none" stroke="#3a260e" stroke-width="{largeur * 0.07:.1f}"/>')
    sx, sy = point(0.435, 0.0)
    out.append(f'<ellipse cx="{sx:.1f}" cy="{sy:.1f}" rx="{rx * 0.3:.1f}" ry="{ry * 0.55:.1f}" transform="rotate({angle:.1f} {sx:.1f} {sy:.1f})" '
               f'fill="#5a3e1a" opacity="0.8"/>')
    # le trait d'encre sur les seuls contours marqués : le bord à l'ombre, un fil sur le bord éclairé
    out.append(f'<path d="{trait(ombre_[2:39], 4.5, rng, 0.1, 0.2, 0.15)}" fill="{encre}" opacity="0.9"/>')
    out.append(f'<path d="{trait(lumiere[4:37], 2.2, rng, 0.2, 0.3, 0.2)}" fill="{encre}" opacity="0.55"/>')
    if ombre:
        out.append(f'<path d="{poly(lumiere + ombre_[::-1])}" fill="url(#{ombre})"/>')
    return f'<g filter="url(#aquarelle-douce)">{"".join(out)}</g>'


def couvercle_et_coutelas(rng, encre="#1f150d"):
    """Le couvercle de planches posé sur la moitié gauche du tonneau d'Aluva, et le coutelas du
    pêcheur dessus : lame large, dos courbe, manche de bois à deux rivets ; son milieu vers (938, 1 470)."""
    out = []
    # le couvercle : une demi-ellipse de planches, vue en biais (l'eau reste visible à droite)
    couv = [(938 + 94 * math.cos(a), 1472 + 24 * math.sin(a)) for a in [math.pi * (0.5 + k / 30) for k in range(31)]]
    couv = couv + [(965, 1449), (968, 1496)]
    out.append(lavis(poly(couv), "#8a5a30", 1.0, "aquarelle-douce"))
    for x in (880, 912, 942):
        out.append(f'<path d="{trait([(x, 1451), (x + 3, 1494)], 2, rng, 0.1, 0.1, 0.1)}" fill="{encre}" opacity="0.5"/>')
    # la lame : pointe à gauche, dos courbe, tranchant presque droit
    dos = [(858, 1487), (886, 1466), (922, 1456), (960, 1453), (990, 1455)]
    tranchant = [(990, 1477), (958, 1481), (922, 1485), (886, 1489), (858, 1487)]
    out.append(f'<path d="{poly(catmull_rom(dos, 6) + catmull_rom(tranchant, 6))}" fill="#d3d8de"/>')
    out.append(f'<path d="{poly([(872, 1478), (922, 1464), (984, 1461), (984, 1467), (922, 1472), (874, 1483)])}" fill="#ffffff" opacity="0.75"/>')
    out.append(f'<path d="{trait(dos, 2.6, rng, 0.05, 0.1, 0.1)}" fill="{encre}" opacity="0.85"/>')
    out.append(f'<path d="{trait(tranchant, 1.8, rng, 0.05, 0.1, 0.1)}" fill="{encre}" opacity="0.7"/>')
    # la garde et le manche, qui dépasse du bord du tonneau
    out.append(f'<path d="{poly([(987, 1450), (996, 1449), (997, 1482), (988, 1482)])}" fill="#3a2a1a"/>')
    manche = [(996, 1457), (1060, 1449), (1064, 1464), (998, 1477)]
    out.append(f'<path d="{poly(manche)}" fill="#6b3f1f"/>')
    out.append(f'<path d="{poly([(998, 1458), (1059, 1450), (1060, 1455), (999, 1463)])}" fill="#b0743f" opacity="0.8"/>')
    for x in (1016, 1043):
        out.append(f'<circle cx="{x}" cy="{1464 - (x - 996) * 0.13:.1f}" r="3.2" fill="#ecdcb2"/>')
    out.append(f'<path d="{trait(manche + [manche[0]], 2, rng, 0.05, 0.05, 0.1)}" fill="{encre}" opacity="0.7"/>')
    return "<g>" + "".join(out) + "</g>"


def scene_aluva(seed=23):
    """Aluva : la cabane à kayaks ouverte sur le Periyar ; retouchée (synthèse, 1.4) : deux kayaks
    jaunes debout contre le mur de gauche, le coutelas sur le couvercle du tonneau."""
    rng = random.Random(seed)
    encre = "#1f150d"
    dehors = []
    dehors.append(f'<rect width="{W}" height="900" fill="url(#ciel-kerala)"/>')
    dehors.append('<circle cx="760" cy="470" r="150" fill="#fff7de" opacity="0.95" filter="url(#flou-soleil)"/>')
    for k in range(5):
        y = 250 + k * 90 + rng.uniform(-20, 20)
        pts = [(rng.uniform(-100, 300), y)]
        for s in range(1, 4):
            pts.append((pts[0][0] + s * rng.uniform(220, 320), y + rng.uniform(-18, 18)))
        dehors.append(lavis(trait(pts, rng.uniform(30, 60), rng, 0.4, 0.5, 0.3), "#f7d9b0", 0.35))
    rive = [(0, 850)] + [(x, 800 + 14 * math.sin(x / 110) + rng.uniform(-5, 5)) for x in range(0, W + 1, 50)] + [(W, 880), (0, 900)]
    dehors.append(lavis(poly(rive), "#7fa35a", 0.9))
    rive2 = [(0, 880)] + [(x, 845 + 10 * math.sin(x / 70 + 1) + rng.uniform(-4, 4)) for x in range(0, W + 1, 50)] + [(W, 900), (0, 910)]
    dehors.append(lavis(poly(rive2), "#4d7a3c", 0.85))
    for (nb, hmin, hmax, y0, verts, op) in ((9, 120, 170, 830, ("#8fae6a", "#9dbb78"), 0.55),
                                            (6, 200, 290, 860, ("#5d8a42", "#4e7a3a"), 0.85),
                                            (3, 380, 470, 900, ("#3f6b33", "#355e2c"), 0.95)):
        for _ in range(nb):
            px = rng.uniform(40, W - 40)
            dehors.append(f'<g opacity="{op}">' + palmier(px, y0 + rng.uniform(-10, 10), rng.uniform(hmin, hmax), rng, encre, rng.choice(verts)) + '</g>')
    dehors.append(lavis(poly([(0, 900), (W, 880), (W, 1520), (0, 1520)]), "#3f8f8a", 0.95))
    dehors.append(f'<rect y="880" width="{W}" height="640" fill="url(#profondeur)"/>')
    for k in range(16):
        y = 930 + k * 36 + rng.uniform(-6, 6)
        xa = rng.uniform(-80, 700)
        pts = [(xa, y)] + [(xa + s * rng.uniform(120, 200), y + rng.uniform(-4, 4)) for s in range(1, 4)]
        dehors.append(f'<path d="{trait(pts, rng.uniform(2, 5), rng, 0.3, 0.4, 0.3)}" fill="#0f3b3a" opacity="{rng.uniform(0.25, 0.5):.2f}"/>')
    for k in range(12):
        y = 905 + k * 44
        lg = 300 - k * 18
        dehors.append(f'<path d="{trait([(760 - lg / 2, y), (760, y + 3), (760 + lg / 2, y)], rng.uniform(5, 11), rng, 0.4, 0.4, 0.4)}" fill="#fff4d2" opacity="{0.75 - k * 0.04:.2f}"/>')
    dehors.append(f'<path d="{trait([(260, 1010), (330, 1022), (400, 1010)], 10, rng, 0.3, 0.3, 0.1)}" fill="{encre}" opacity="0.8"/>')
    dehors.append(f'<path d="{trait([(330, 1012), (334, 960)], 3, rng, 0.1, 0.3, 0.1)}" fill="{encre}" opacity="0.8"/>')

    dedans = []
    ouverture = "M190,310 H1010 V1520 H190 Z"
    dedans.append(f'<path d="M0,0 H{W} V{H} H0 Z {ouverture}" fill="#2a1a0e" fill-rule="evenodd"/>')
    planches = "".join(
        f'<path d="{trait([(k + 40, 0), (k + 42, 900), (k + 38, 1520)], 3, rng, 0.01, 0.01, 0.2)}" fill="#120b05" opacity="0.7"/>'
        for k in range(0, W, 86))
    dedans.append(f'<g clip-path="url(#mur)">{planches}</g>')
    dedans.append(f'<path d="M0,0 H{W} V{H} H0 Z {ouverture}" fill="url(#lumiere-entree)" fill-rule="evenodd"/>')
    for x in (168, 1012):
        dedans.append(f'<path d="{trait([(x + 10, 296), (x + 12, 900), (x + 8, 1530)], 46, rng, 0.02, 0.02, 0.04)}" fill="#140c06"/>')
    dedans.append(f'<path d="{trait([(140, 300), (600, 292), (1060, 302)], 50, rng, 0.02, 0.02, 0.04)}" fill="#140c06"/>')
    for (y, c) in ((150, "#c8532c"), (215, "#e0a63a")):
        coque = [(40, y + 24), (600, y - 12), (1160, y + 26)]
        dedans.append(lavis(trait(coque, 44, rng, 0.45, 0.45, 0.04), c, 0.95, "aquarelle-douce"))
        dedans.append(f'<path d="{trait(coque, 4, rng, 0.4, 0.4, 0.1)}" fill="{encre}" opacity="0.85"/>')
    dedans.append(f'<path d="{poly([(0, 1520), (W, 1520), (W, H), (0, H)])}" fill="#6a4526"/>')
    dedans.append(f'<path d="{poly([(190, 1520), (1010, 1520), (1180, H), (20, H)])}" fill="#f2c27a" opacity="0.45" filter="url(#aquarelle-douce)"/>')
    for k in range(9):
        y = 1535 + k * 30 + k * k * 1.6
        dedans.append(f'<path d="{trait([(0, y), (600, y + rng.uniform(-2, 2)), (W, y)], 2.5 + k * 0.45, rng, 0.02, 0.02, 0.2)}" fill="#2b1a0c" opacity="0.6"/>')
    dedans.append(lavis(poly([(830, 1690), (846, 1470), (1030, 1470), (1046, 1690)]), "#7a4f2a", 1.0, "aquarelle-douce"))
    dedans.append('<ellipse cx="938" cy="1472" rx="92" ry="22" fill="#2f6f6c"/>')
    for yy in (1515, 1640):
        dedans.append(f'<path d="{trait([(840, yy), (938, yy + 9), (1036, yy)], 6, rng, 0.03, 0.03, 0.1)}" fill="{encre}"/>')
    # retouche de la synthèse (1.4) : le couvercle du tonneau et le coutelas posé dessus, vers (938, 1 470) ;
    # deux kayaks jaunes rangés debout contre le mur de gauche, d'après la photo de Karl 35086240
    # (un second générateur : rien d'autre ne bouge dans le dessin du prototype)
    retouche = random.Random(seed + 1000)
    dedans.append(couvercle_et_coutelas(retouche, encre))
    # dans la pénombre du local : la lumière de l'embrasure ne les touche que de biais
    dedans.append(kayak((52, 1652), (116, -170), 122, retouche, encre, jaune="#e2ac24", ombre="ombre-kayaks"))
    dedans.append(kayak((160, 1628), (214, -150), 112, retouche, encre, bande=False, jaune="#ebb82a", ombre="ombre-kayaks"))
    contenu = ("".join(dehors) + "".join(dedans) +
               f'<rect width="{W}" height="{H}" filter="url(#papier)" opacity="0.12"/>')
    defs = DEFS_AQUARELLE + """
<filter id="flou-soleil" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="45"/></filter>
<linearGradient id="ciel-kerala" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f1a36e"/><stop offset="0.45" stop-color="#f6c98a"/><stop offset="1" stop-color="#fbe6b8"/>
</linearGradient>
<linearGradient id="profondeur" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#bfe6d8" stop-opacity="0.35"/><stop offset="1" stop-color="#0d3433" stop-opacity="0.45"/>
</linearGradient>
<clipPath id="mur"><path clip-rule="evenodd" d="M0,0 H1200 V1800 H0 Z M190,310 H1010 V1520 H190 Z"/></clipPath>
<linearGradient id="ombre-kayaks" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0">
  <stop offset="0" stop-color="#1a0f05" stop-opacity="0.42"/><stop offset="0.55" stop-color="#1a0f05" stop-opacity="0.2"/>
  <stop offset="1" stop-color="#1a0f05" stop-opacity="0.04"/>
</linearGradient>
<radialGradient id="lumiere-entree" cx="0.5" cy="0.62" r="0.6">
  <stop offset="0.3" stop-color="#ffcf87" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
</radialGradient>"""
    return svg(contenu, defs, "#efe4cc")



# ================================================================ le livre entier (synthèse, partie 4.4)
# Les dessins des sept chapitres. Même parti pris que les dessins du prototype et que les encres :
# du papier, des lavis au bord irrégulier, des traits d'encre sur les seuls contours marqués. Quand
# un dessin part d'une photo de Karl, decors.py la prépare (recadrée, floutée, passée à l'encre,
# détourée) et la donne ici par une adresse (réglages image, ciel, roche…). Coordonnées : la scène
# de 1200 x 1800 ; les points chauds de la synthèse y tombent (vérifiés sur les images).

ENCRE = "#15172a"          # l'encre de Darshan : bleu nuit presque noir
OR = "#f4c56a"             # l'or de la magie et du père
VERMILLON = "#c9302c"      # l'amour : le ruban, le chouchou


def photo_svg(href, x=0, y=0, w=W, h=H, extra=""):
    """Une image préparée par decors.py (adresse file://), posée telle quelle."""
    if not href:
        return ""
    return f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="none" {extra}/>'


def long_de(pts):
    """Longueurs cumulées d'une ligne brisée, pour y placer des points à une fraction donnée."""
    c = [0.0]
    for i in range(1, len(pts)):
        c.append(c[-1] + math.dist(pts[i - 1], pts[i]))
    return c


def point_sur(pts, cumul, t):
    """Le point à la fraction t (0 à 1) d'une ligne brisée, et la direction de la ligne."""
    d = t * cumul[-1]
    for i in range(1, len(pts)):
        if cumul[i] >= d:
            a = (d - cumul[i - 1]) / max(1e-9, cumul[i] - cumul[i - 1])
            (x0, y0), (x1, y1) = pts[i - 1], pts[i]
            lg = math.dist(pts[i - 1], pts[i]) or 1.0
            return (x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), ((x1 - x0) / lg, (y1 - y0) / lg)
    return pts[-1], (0.0, 1.0)


# ---------------------------------------------------------------- 3.1 à 3.4 : le cosmos de la légende

# La Voie lactée dans le cadre de « cosmos » (39595391, x 0,58, y 0, zoom 1,5), relevée sur l'image :
# elle descend du haut à gauche vers le bas, au milieu.
VOIE_LACTEE = [(40, 40), (110, 300), (165, 560), (265, 860), (385, 1150), (440, 1480), (455, 1800)]
PORTE_ETOILES = (330, 600, 800, 1130)     # l'embrasure que l'effet « alignement » dessine (x0, y0, x1, y1)


def etoile_porte(x, y, k, rng):
    """Une étoile-porte : une minuscule embrasure cintrée d'or (4 x 7 unités), son halo doux."""
    a, b = 2 * k, 3.5 * k
    porte = f"M{x - a:.1f},{y + b:.1f} L{x - a:.1f},{y - 1.5 * k:.1f} A{a:.1f},{a:.1f} 0 0 1 {x + a:.1f},{y - 1.5 * k:.1f} L{x + a:.1f},{y + b:.1f} Z"
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{11 * k:.1f}" fill="{OR}" opacity="{rng.uniform(0.25, 0.4):.2f}" filter="url(#halo-doux)"/>'
            f'<path d="{porte}" fill="{OR}"/>'
            f'<path d="{porte}" fill="#fff6d8" opacity="0.55" transform="translate({x:.1f} {y:.1f}) scale(0.45) translate({-x:.1f} {-y:.1f})"/>')


def cosmos_portes(photo=None, x=0.5, y=0.5, zoom=1.0, image=None, graine=31):
    """3.1, 3.2, 3.4 : la Voie lactée de Galice de Karl (39595391), cadrée par decors.py (image), un
    peu relevée pour qu'on la voie ; les bords bleuis ; une trentaine d'étoiles-portes d'or le long de
    la Voie lactée ; sans papier. La porte d'étoiles (PORTE_ETOILES) reste à l'effet « alignement »."""
    rng = random.Random(graine)
    ligne = catmull_rom(VOIE_LACTEE, 16)
    cumul = long_de(ligne)
    places, essais = [], 0
    x0, y0, x1, y1 = PORTE_ETOILES
    while len(places) < 30 and essais < 5000:
        essais += 1
        (px, py), (dx, dy) = point_sur(ligne, cumul, rng.uniform(0.02, 0.9))
        d = rng.gauss(0, 70)
        qx, qy = px - dy * d, py + dx * d
        if not (25 < qx < 1175 and 30 < qy < 1560):
            continue
        if x0 - 30 < qx < x1 + 30 and y0 - 30 < qy < y1 + 30:
            continue
        if any(math.dist((qx, qy), p) < 60 for p in places):
            continue
        places.append((qx, qy))
    etoiles = "".join(etoile_porte(qx, qy, rng.uniform(0.9, 1.5), rng) for qx, qy in places)
    contenu = (photo_svg(image, extra='filter="url(#voie)"') +
               f'<rect width="{W}" height="{H}" fill="url(#bords-bleus)" style="mix-blend-mode:screen"/>' +
               etoiles)
    defs = """
<filter id="voie" color-interpolation-filters="sRGB">
  <feComponentTransfer>
    <feFuncR type="gamma" amplitude="1.28" exponent="1.08" offset="-0.015"/>
    <feFuncG type="gamma" amplitude="1.28" exponent="1.08" offset="-0.015"/>
    <feFuncB type="gamma" amplitude="1.34" exponent="1.05" offset="-0.01"/>
  </feComponentTransfer>
</filter>
<filter id="halo-doux" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="5"/></filter>
<radialGradient id="bords-bleus" cx="0.5" cy="0.45" r="0.75">
  <stop offset="0.35" stop-color="#0b1f6e" stop-opacity="0"/>
  <stop offset="1" stop-color="#1a3aa8" stop-opacity="0.55"/>
</radialGradient>"""
    return svg(contenu, defs, "#03040c")


# ---------------------------------------------------------------- 3.10, 3.11, 7.12 à 7.15 : la porte du père

def porte_pere(photo=None, haut=0.64, fondu_bas=(0.5, 0.6), largeur=900, y0=420, traits=False, image=None):
    """Les calques de la porte du père : la porte d'Irun de Karl (39434691), préparée par decors.py
    (le haut de la photo, en lavis sombre ou en traits d'or, à `largeur` unités de large, le haut du
    linteau à y0, la pierre et le bas fondus) ; fond transparent : le noir de la vision (3.10) ou la
    rue au couchant (7.12) passent autour."""
    return svg(photo_svg(image))


# ---------------------------------------------------------------- 7.1, 7.3, 7.4 : le désert

def dune(yb, cretes, rng, n=60):
    """La ligne de crête d'un plan de dunes : pour chaque crête (x, hauteur, largeur, sens), une pente
    douce au vent et une face raide sous le vent ; renvoie les points de la crête, de x -60 à 1260."""
    pts = []
    for k in range(n + 1):
        x = -60 + 1320 * k / n
        h = 0.0
        for cx, hauteur, larg, sens in cretes:
            u = (x - cx) / larg * sens
            if -1 <= u <= 0:
                v = (1 + u) ** 1.6
            elif 0 < u <= 0.32:
                v = (1 - u / 0.32) ** 1.25
            else:
                v = 0.0
            h = max(h, hauteur * v)
        pts.append((x, yb - h + rng.uniform(-1.5, 1.5)))
    return pts


def faces_raides(yb, cretes):
    """Les faces à l'ombre, sous le vent : un triangle courbe sous chaque crête."""
    out = []
    for cx, hauteur, larg, sens in cretes:
        sommet = (cx, yb - hauteur)
        pied = (cx + sens * larg * 0.32, yb)
        creux = (cx + sens * larg * 0.10, yb + 40)
        out.append([sommet] + catmull_rom([sommet, (cx + sens * larg * 0.16, yb - hauteur * 0.42), pied], 8)[1:] + [creux])
    return out


def desert(nuit=True, photo=None, rochers=None, ciel=None, roche=None, rapport_roche=1.3, graine=17):
    """7.1 (nuit) : le ciel de 1.1 (27116682) viré au velours noir, préparé par decors.py (ciel) ;
    trois plans de dunes à l'encre, cretes tranchées ; à gauche, au premier plan, le doigt de dieu :
    l'empilement de rochers de Karl (35024039), détouré et passé à l'encre (roche), son bord droit
    éclairé par les étoiles. Le ciel tient les trois quarts du cadre. 7.3, 7.4 (jour) : les mêmes
    dunes au soleil, lavis ocre, ciel blanc de chaleur."""
    rng = random.Random(graine)
    if nuit:
        fond = photo_svg(ciel) or f'<rect width="{W}" height="{H}" fill="#05060c"/>'
        teintes = [("#262a44", "#141727", "#a9b6ea"), ("#1a1d31", "#0d0f1b", "#8a98cf"), ("#10121f", "#07080f", "#6f7cb0")]
        trait_crete = "#020308"
    else:
        fond = f'<rect width="{W}" height="{H}" fill="url(#ciel-chaleur)"/>'
        teintes = [("#ebcf9d", "#cfa066", "#fff6e0"), ("#dcae6c", "#b8813f", "#fbe7bf"), ("#cf9a55", "#a4692c", "#f6d9a2")]
        trait_crete = "#5a3714"
    plans = [
        (1330, [(170, 70, 420, 1), (640, 55, 380, -1), (1060, 80, 460, 1)]),
        (1470, [(420, 95, 520, -1), (930, 120, 560, 1)]),
        (1640, [(260, 110, 600, 1), (820, 150, 640, -1), (1260, 90, 420, 1)]),
    ]
    dunes = []
    for (yb, cretes), (clair, sombre, liseré) in zip(plans, teintes):
        ligne = dune(yb, cretes, rng)
        corps = ligne + [(1260, H + 20), (-60, H + 20)]
        dunes.append(lavis(poly(corps), clair, 1.0, "aquarelle-douce"))
        for face in faces_raides(yb, cretes):
            dunes.append(lavis(poly(face + [(face[0][0], H + 20)]), sombre, 0.85, "aquarelle"))
        # le liseré de lumière (étoiles ou soleil) au bord des cretes, puis le trait d'encre de la crête
        dunes.append(f'<path d="{trait(ligne[::2], 4.2, rng, 0.02, 0.02, 0.3)}" fill="{liseré}" opacity="{0.7 if nuit else 0.55}" transform="translate(0 3)"/>')
        dunes.append(f'<path d="{trait(ligne[::2], 2.2, rng, 0.02, 0.02, 0.4)}" fill="{trait_crete}" opacity="0.8"/>')
        # quelques rides de sable, au lavis
        for _ in range(5):
            xr = rng.uniform(0, W)
            yr = yb + rng.uniform(40, 150)
            dunes.append(f'<path d="{trait([(xr - 90, yr), (xr, yr - 6), (xr + 90, yr)], 2.2, rng, 0.3, 0.3, 0.2)}" '
                         f'fill="{trait_crete}" opacity="0.18"/>')
    # le doigt de dieu : la hauteur de la roche, son bord droit vers x 520 ; son pied sort du cadre
    rh = 1250
    rw = rh / rapport_roche
    roc = photo_svg(roche, x=round(520 - rw), y=640, w=round(rw), h=rh,
                    extra='filter="url(#bord-lune)"' if nuit else 'filter="url(#bord-soleil)"')
    contenu = fond + "".join(dunes) + roc
    defs = DEFS_AQUARELLE + """
<linearGradient id="ciel-chaleur" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fefcf6"/><stop offset="0.55" stop-color="#fbf3e2"/><stop offset="0.78" stop-color="#f3e2c0"/>
</linearGradient>
<filter id="bord-lune" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
  <feOffset in="SourceAlpha" dx="-12" dy="5" result="decale"/>
  <feComposite in="SourceAlpha" in2="decale" operator="out" result="lisere"/>
  <feGaussianBlur in="lisere" stdDeviation="3.5" result="doux"/>
  <feFlood flood-color="#bcc8ff" flood-opacity="0.8"/>
  <feComposite in2="doux" operator="in" result="lumiere"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="lumiere"/></feMerge>
</filter>
<filter id="bord-soleil" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
  <feOffset in="SourceAlpha" dx="-10" dy="8" result="decale"/>
  <feComposite in="SourceAlpha" in2="decale" operator="out" result="lisere"/>
  <feGaussianBlur in="lisere" stdDeviation="3" result="doux"/>
  <feFlood flood-color="#fff1c9" flood-opacity="0.7"/>
  <feComposite in2="doux" operator="in" result="lumiere"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="lumiere"/></feMerge>
</filter>"""
    return svg(contenu, defs, "#05060c" if nuit else "#fbf3e2")


# ---------------------------------------------------------------- 6.5, 6.7, 6.13 : la fenêtre du salon

BAIE = (330, 230, 870, 1330)       # l'ouverture vitrée de la porte-fenêtre (x0, y0, x1, y1)


def rideau(cote, rng):
    """Un lourd rideau de velours bleu nuit, noué à mi-hauteur par une embrasse ; `cote` : -1 à
    gauche, 1 à droite. Plis en lavis, du haut au nœud, puis du nœud au sol."""
    s = cote
    cx = 600 + s * 390                       # le bord extérieur du rideau, contre le mur
    def X(v):
        return 600 + s * v
    haut = [(X(435), 205), (X(250), 205)]    # du bord intérieur (vers le milieu) au bord extérieur
    noeud = [(X(335), 880), (X(430), 880)]
    bas = [(X(455), H + 10), (X(250), H + 10)]
    corps = [(X(250), 205), (X(265), 520), (X(300), 800), noeud[0], (X(292), 1050), (X(262), 1400), (X(250), H + 10),
             (X(455), H + 10), (X(470), 1420), (X(445), 1060), noeud[1], (X(455), 780), (X(448), 480), (X(435), 205)]
    out = [lavis(poly(catmull_rom(corps, 6)), "#16223d", 1.0, "aquarelle-douce")]
    # les plis : des lavis plus clairs et plus sombres, du haut vers le nœud, puis vers le sol
    for k in range(7):
        f = (k + 0.5) / 7
        xa = 250 + (435 - 250) * f
        xn = 335 + (430 - 335) * f
        xb = 250 + (455 - 250) * (f ** 0.9)
        couleur, op = ("#2f4474", 0.42) if k % 2 == 0 else ("#070b17", 0.55)
        out.append(lavis(trait([(X(xa), 210), (X(xa + (xn - xa) * 0.5), 560), (X(xn), 875)], rng.uniform(14, 26), rng, 0.05, 0.3, 0.25), couleur, op, "aquarelle-douce"))
        out.append(lavis(trait([(X(xn), 885), (X(xn + (xb - xn) * 0.5), 1300), (X(xb), H + 10)], rng.uniform(16, 30), rng, 0.3, 0.05, 0.25), couleur, op, "aquarelle-douce"))
    # l'embrasse : une cordelière et son gland
    out.append(f'<path d="{trait([(X(318), 872), (X(385), 895), (X(445), 872)], 11, rng, 0.1, 0.1, 0.1)}" fill="#b08a3a"/>')
    out.append(f'<path d="{trait([(X(318), 872), (X(385), 895), (X(445), 872)], 2.2, rng, 0.1, 0.1, 0.1)}" fill="{ENCRE}" opacity="0.6"/>')
    gx = X(300)
    out.append(f'<path d="{poly([(gx - 9, 895), (gx + 9, 895), (gx + 16, 980), (gx - 16, 980)])}" fill="#a07a2e"/>')
    out.append(f'<path d="{trait([(gx, 880), (gx, 900)], 5, rng, 0.1, 0.1, 0.1)}" fill="#6a4c18"/>')
    # le trait d'encre sur les bords marqués
    out.append(f'<path d="{trait([(X(250), 205), (X(270), 560), (X(300), 800), (X(335), 880)], 2.6, rng, 0.05, 0.1, 0.3)}" fill="{ENCRE}" opacity="0.7"/>')
    out.append(f'<path d="{trait([(X(435), 205), (X(450), 520), (X(455), 780), (X(430), 880)], 2.6, rng, 0.05, 0.1, 0.3)}" fill="{ENCRE}" opacity="0.7"/>')
    out.append(f'<path d="{trait([(X(430), 890), (X(450), 1100), (X(470), 1420), (X(455), H)], 2.8, rng, 0.05, 0.1, 0.3)}" fill="{ENCRE}" opacity="0.7"/>')
    return "".join(out)


def moulures(rng):
    """L'encadrement de la baie : trois baguettes, deux rosaces d'angle, des rinceaux au-dessus ; au
    trait fin et au lavis gris chaud."""
    out = []
    for i, (x0, y0, x1, y1) in enumerate(((240, 110, 960, 1420), (262, 132, 938, 1420), (292, 162, 908, 1420))):
        out.append(f'<path d="M{x0},{y1} L{x0},{y0} L{x1},{y0} L{x1},{y1}" fill="none" stroke="#6d6252" stroke-width="{3.2 - i * 0.7:.1f}" opacity="0.75"/>')
        out.append(f'<path d="M{x0 + 5},{y1} L{x0 + 5},{y0 + 5} L{x1 - 5},{y0 + 5} L{x1 - 5},{y1}" fill="none" stroke="#fff8ea" stroke-width="2" opacity="0.6"/>')
    out.append(lavis(f"M240,110 H960 V1420 H938 V132 H262 V1420 H240 Z", "#a89a80", 0.55, "aquarelle-douce"))
    out.append(lavis(f"M292,162 H908 V1420 H896 V174 H304 V1420 H292 Z", "#7d705a", 0.45, "aquarelle-douce"))
    for cx in (251, 949):
        out.append(f'<circle cx="{cx}" cy="121" r="17" fill="#d9ccb4" stroke="#6d6252" stroke-width="1.6"/>')
        for k in range(8):
            a = k * math.pi / 4
            out.append(f'<ellipse cx="{cx + 9 * math.cos(a):.1f}" cy="{121 + 9 * math.sin(a):.1f}" rx="5" ry="2.6" '
                       f'transform="rotate({math.degrees(a):.0f} {cx + 9 * math.cos(a):.1f} {121 + 9 * math.sin(a):.1f})" fill="none" stroke="#6d6252" stroke-width="1.1"/>')
        out.append(f'<circle cx="{cx}" cy="121" r="3.5" fill="#6d6252"/>')
    # les rinceaux : deux volutes affrontées, une coquille au milieu
    for s in (-1, 1):
        pts = [(600 + s * 30, 82), (600 + s * 90, 60), (600 + s * 170, 70), (600 + s * 240, 95), (600 + s * 300, 88),
               (600 + s * 318, 72), (600 + s * 305, 60), (600 + s * 288, 70)]
        out.append(f'<path d="{trait(pts, 3.4, rng, 0.1, 0.2, 0.1)}" fill="#6d6252" opacity="0.85"/>')
        for k in range(3):
            bx = 600 + s * (120 + k * 60)
            out.append(f'<path d="{trait([(bx, 78), (bx + s * 14, 58), (bx + s * 30, 66)], 2, rng, 0.1, 0.4, 0.1)}" fill="#6d6252" opacity="0.7"/>')
    out.append(f'<path d="M578,98 Q600,40 622,98 Z" fill="#d9ccb4" stroke="#6d6252" stroke-width="1.6"/>')
    for k in range(5):
        a = math.pi * (0.15 + 0.7 * k / 4)
        out.append(f'<path d="M600,96 L{600 - 20 * math.cos(a):.1f},{96 - 48 * math.sin(a):.1f}" stroke="#6d6252" stroke-width="1"/>')
    return "".join(out)


def croisees(rng):
    """Les deux battants vitrés de la porte-fenêtre : montants, traverses, petits bois."""
    x0, y0, x1, y1 = BAIE
    out = []
    bois = "#ece4d4"
    barres = [(x0, y0, x0 + 16, y1), (x1 - 16, y0, x1, y1), (592, y0, 608, y1), (x0, y0, x1, y0 + 16)]
    for y in (470, 710, 950):
        barres.append((x0, y - 5, x1, y + 5))
    for xb in (461, 739):
        barres.append((xb - 4, y0, xb + 4, 1040))
    for bx0, by0, bx1, by1 in barres:
        out.append(f'<rect x="{bx0}" y="{by0}" width="{bx1 - bx0}" height="{by1 - by0}" fill="{bois}"/>')
        out.append(f'<rect x="{bx0}" y="{by0}" width="{bx1 - bx0}" height="{by1 - by0}" fill="none" stroke="#7a6e5c" stroke-width="1.2" opacity="0.8"/>')
    # l'espagnolette, sur le battant de droite
    out.append(f'<rect x="604" y="640" width="7" height="170" rx="3" fill="#8a7040"/>')
    out.append(f'<path d="{trait([(611, 700), (628, 706), (640, 700)], 5, rng, 0.1, 0.3, 0.1)}" fill="#8a7040"/>')
    return "".join(out)


def garde_corps(rng):
    """Le garde-corps de fer forgé au bas de l'ouverture : deux lisses, des barreaux, des volutes."""
    x0, _, x1, _ = BAIE
    out = [f'<path d="{trait([(x0, 1062), (x1, 1062)], 9, rng, 0.02, 0.02, 0.05)}" fill="#141418"/>',
           f'<path d="{trait([(x0, 1300), (x1, 1300)], 7, rng, 0.02, 0.02, 0.05)}" fill="#141418"/>']
    for k in range(15):
        x = x0 + 18 + k * (x1 - x0 - 36) / 14
        out.append(f'<path d="{trait([(x, 1066), (x, 1298)], 4, rng, 0.02, 0.02, 0.1)}" fill="#141418"/>')
    for k in range(7):
        cx = x0 + 55 + k * (x1 - x0 - 110) / 6
        out.append(f'<path d="M{cx - 30:.1f},1180 C{cx - 30:.1f},1120 {cx + 30:.1f},1120 {cx + 30:.1f},1180 '
                   f'C{cx + 30:.1f},1225 {cx - 5:.1f},1225 {cx - 5:.1f},1195" fill="none" stroke="#141418" stroke-width="3.2"/>')
    return "".join(out)


def voile_de_fenetre(ouvert, rng):
    """Le voilage crème, translucide et lumineux : tiré sur toute la baie, ou écarté sur les côtés."""
    x0, y0, x1, y1 = BAIE
    out = []
    if ouvert:
        for s, xa, xb in ((-1, x0 - 30, x0 + 55), (1, x1 - 55, x1 + 30)):
            out.append(f'<path d="{poly([(xa, 200), (xb, 200), (xb - s * 12, 900), (xb + s * 6, y1 + 30), (xa, y1 + 30)])}" '
                       f'fill="#fbf4e4" opacity="0.8"/>')
            for k in range(4):
                xx = xa + (xb - xa) * (k + 0.5) / 4
                out.append(f'<path d="{trait([(xx, 205), (xx - s * 5, 900), (xx, y1 + 20)], 5, rng, 0.05, 0.05, 0.3)}" fill="#d8cbb0" opacity="0.5"/>')
        return "".join(out)
    out.append(f'<rect x="{x0 - 40}" y="200" width="{x1 - x0 + 80}" height="{y1 - 170}" fill="#fbf5e8" opacity="0.8"/>')
    for k in range(18):
        xx = x0 - 30 + k * (x1 - x0 + 60) / 17
        couleur, op = ("#ffffff", 0.45) if k % 2 == 0 else ("#d9ccb0", 0.35)
        out.append(f'<path d="{trait([(xx, 205), (xx + rng.uniform(-8, 8), 760), (xx + rng.uniform(-6, 6), y1 + 25)], rng.uniform(12, 22), rng, 0.02, 0.02, 0.3)}" '
                   f'fill="{couleur}" opacity="{op}"/>')
    # la lumière du jour qui passe au travers, plus vive au milieu
    out.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="url(#jour-voilage)"/>')
    return "".join(out)


def fenetre(photo=None, voilage="ferme", flou=0, image=None, calque=None, graine=19):
    """6.5, 6.7, 6.13 : une haute porte-fenêtre vue de l'intérieur, de face, sur les deux tiers de la
    page : encadrement de moulures, deux lourds rideaux de velours bleu nuit noués, garde-corps de fer
    forgé, mur de plâtre crème. voilage « ferme » : un voilage crème, la vue n'est qu'un flou clair ;
    « ouvert » : le voilage écarté, la photo paraît dans l'ouverture (image, floutée par decors.py
    tant que le repérage manque). calque « cadre » : tout sauf la vue, l'ouverture transparente ;
    « vue » : la vue seule (l'effet « vertige » la fait reculer derrière la fenêtre)."""
    rng = random.Random(graine)
    x0, y0, x1, y1 = BAIE
    vue = f'<g clip-path="url(#baie)">{photo_svg(image)}</g>' if image else ""
    if calque == "vue":
        return svg(photo_svg(image))
    trou = f"M0,0 H{W} V{H} H0 Z M{x0},{y0} H{x1} V{y1} H{x0} Z"
    taches = "".join(lavis(f"M{cx - r:.0f},{cy:.0f} a{r:.0f},{r * 0.7:.0f} 0 1 0 {2 * r:.0f},0 a{r:.0f},{r * 0.7:.0f} 0 1 0 {-2 * r:.0f},0 Z",
                           "#cdbd9c", 0.16, "aquarelle")
                     for cx, cy, r in ((120, 300, 160), (1090, 520, 180), (140, 1250, 200), (1080, 1500, 170), (600, 1650, 260)))
    mur = (f'<path d="{trou}" fill="url(#platre)" fill-rule="evenodd"/>'
           f'<g clip-path="url(#hors-baie)">{taches}</g>'
           f'<path d="{trou}" fill="#000" fill-rule="evenodd" filter="url(#grain-platre)" opacity="0.08"/>'
           f'<path d="{trou}" fill="#e9dfca" fill-rule="evenodd" filter="url(#papier)" opacity="0.35"/>')
    appui = (f'<rect x="{x0 - 50}" y="{y1}" width="{x1 - x0 + 100}" height="26" fill="#e3d8c2"/>'
             f'<path d="{trait([(x0 - 50, y1 + 26), (x1 + 50, y1 + 26)], 2.4, rng, 0.02, 0.02, 0.1)}" fill="#6d6252" opacity="0.7"/>')
    tringle = (f'<path d="{trait([(170, 198), (1030, 198)], 8, rng, 0.02, 0.02, 0.05)}" fill="#9a7a3c"/>'
               f'<circle cx="166" cy="198" r="14" fill="#9a7a3c"/><circle cx="1034" cy="198" r="14" fill="#9a7a3c"/>')
    ombre_baie = f'<path d="M{x0},{y0} H{x1} V{y0 + 30} H{x0 + 26} V{y1} H{x0} Z" fill="#3a3024" opacity="0.25"/>'
    contenu = ((vue if calque != "cadre" else "") + croisees(rng) + garde_corps(rng) + ombre_baie + mur + moulures(rng) +
               appui + voile_de_fenetre(voilage == "ouvert", rng) + tringle + rideau(-1, rng) + rideau(1, rng))
    defs = DEFS_AQUARELLE + f"""
<clipPath id="baie"><rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/></clipPath>
<clipPath id="hors-baie"><path clip-rule="evenodd" d="M0,0 H{W} V{H} H0 Z M{x0},{y0} H{x1} V{y1} H{x0} Z"/></clipPath>
<radialGradient id="platre" cx="0.3" cy="0.25" r="0.95">
  <stop offset="0" stop-color="#f6eedd"/><stop offset="0.6" stop-color="#e9dfca"/><stop offset="1" stop-color="#d3c6ad"/>
</radialGradient>
<radialGradient id="jour-voilage" cx="0.5" cy="0.45" r="0.6">
  <stop offset="0" stop-color="#fffdf4" stop-opacity="0.55"/><stop offset="1" stop-color="#fffdf4" stop-opacity="0"/>
</radialGradient>
<filter id="grain-platre" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="21" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -0.45"/>
  <feComposite in2="SourceGraphic" operator="in"/>
</filter>"""
    return svg(contenu, defs, None if calque == "cadre" else "#e9dfca")


# ---------------------------------------------------------------- 6.8, 6.9 : « Le lac Ladoga »

def tableau(photo=None, zoom=1.0, centre=None, image=None, rapport=2 / 3):
    """6.8, 6.9 : le tableau d'un autre peintre (Théodore Banzy) : un mur et un cadre peints en aplats,
    sans trait d'encre ni lavis ; au centre, un peu haut, la photo de Karl entière, en largeur, sur
    80 % de la page (34342149, telle quelle) ; en bas à gauche, l'ombre floue d'une épaule, jamais un
    visage. zoom et centre : le plan « tableau-barque », 8 % plus près de la barque vide."""
    pw = 960
    ph = pw * rapport
    px, py = (W - pw) / 2, 640 - ph / 2
    c = 22                                          # la largeur du cadre de bois sombre
    mur = (f'<rect width="{W}" height="{H}" fill="#cfc8b9"/>'
           f'<path d="M0,0 H{W} V{H} H0 Z" fill="url(#lumiere-mur)"/>'
           f'<rect x="0" y="1330" width="{W}" height="{H - 1330}" fill="#bfb6a4"/>'
           f'<rect x="0" y="1318" width="{W}" height="14" fill="#d9d2c3"/>')
    ombre = f'<rect x="{px - c + 16}" y="{py - c + 22}" width="{pw + 2 * c}" height="{ph + 2 * c}" fill="#5e574a" opacity="0.5" filter="url(#flou-ombre)"/>'
    cadre = (f'<rect x="{px - c}" y="{py - c}" width="{pw + 2 * c}" height="{ph + 2 * c}" fill="#2f2219"/>'
             f'<path d="M{px - c},{py - c} h{pw + 2 * c} l-{c - 6},{c - 6} h-{pw + 12} Z" fill="#4a3627"/>'
             f'<path d="M{px - c},{py - c} v{ph + 2 * c} l{c - 6},-{c - 6} v-{ph + 12} Z" fill="#3c2c20"/>'
             f'<rect x="{px - 5}" y="{py - 5}" width="{pw + 10}" height="{ph + 10}" fill="#1a130e"/>')
    toile = photo_svg(image, x=px, y=py, w=pw, h=ph)
    epaule = (f'<path d="M-260,1900 L-260,1560 C-60,1470 190,1430 360,1462 C470,1484 530,1560 560,1680 L585,1900 Z" '
              f'fill="#18140f" opacity="0.93" filter="url(#flou-epaule)"/>')
    scene = mur + ombre + cadre + toile
    if zoom and zoom != 1.0 and centre:
        cx, cy = centre
        scene = f'<g transform="translate({cx} {cy}) scale({zoom}) translate({-cx} {-cy})">{scene}</g>'
        epaule = f'<g transform="translate({-40 * (zoom - 1) * 10:.0f} {60 * (zoom - 1) * 10:.0f})">{epaule}</g>'
    defs = """
<radialGradient id="lumiere-mur" cx="0.25" cy="0.15" r="1.0">
  <stop offset="0" stop-color="#fffaf0" stop-opacity="0.35"/><stop offset="0.7" stop-color="#fffaf0" stop-opacity="0"/>
  <stop offset="1" stop-color="#3a342a" stop-opacity="0.18"/>
</radialGradient>
<filter id="flou-ombre" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="flou-epaule" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="34"/></filter>"""
    return svg(scene + epaule, defs, "#cfc8b9")


# ---------------------------------------------------------------- 6.5 : le velours

def velours(matiere=True, graine=7):
    """6.5 : pas un dessin, une matière : un gros plan de velours bleu nuit (#16233f), un rabat qui
    fait un pli, le poil rendu par un grain fin et des bandes plus claires là où la lumière rase ;
    sans trait ni lavis (en attendant la photo de Karl, repérage R5). La caresse, vers (600, 860)."""
    rng = random.Random(graine)
    # le relief : le rabat (le bas de l'image, retourné) et ses plis ; la hauteur est l'opacité du blanc
    relief = [f'<rect width="{W}" height="{H}" fill="#fff" opacity="0.25"/>']
    bord = [(-50, 1160), (200, 1130), (420, 1170), (640, 1215), (860, 1190), (1060, 1120), (1250, 1080)]
    rabat = catmull_rom(bord, 10) + [(1250, H + 50), (-50, H + 50)]
    relief.append(f'<path d="{poly(rabat)}" fill="#fff" opacity="0.55"/>')
    for k in range(6):
        x = rng.uniform(80, 1120)
        relief.append(f'<path d="{trait([(x, -40), (x + rng.uniform(-60, 60), 500), (x + rng.uniform(-90, 90), 1150)], rng.uniform(70, 150), rng, 0.2, 0.3, 0.2)}" '
                      f'fill="#fff" opacity="{rng.uniform(0.18, 0.35):.2f}"/>')
    for k in range(4):
        y = rng.uniform(1300, 1700)
        relief.append(f'<path d="{trait([(-40, y), (500, y + rng.uniform(-40, 40)), (1240, y + rng.uniform(-60, 60))], rng.uniform(60, 120), rng, 0.2, 0.2, 0.2)}" '
                      f'fill="#fff" opacity="{rng.uniform(0.15, 0.3):.2f}"/>')
    lumiere = f'<g filter="url(#rase)">{"".join(relief)}</g>'
    contenu = (f'<rect width="{W}" height="{H}" fill="#16233f"/>'
               f'<g style="mix-blend-mode:overlay">{lumiere}</g>'
               f'<rect width="{W}" height="{H}" fill="#000" filter="url(#poil)" style="mix-blend-mode:overlay" opacity="0.55"/>'
               f'<rect width="{W}" height="{H}" fill="url(#vignette-velours)"/>')
    defs = """
<filter id="rase" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="38" result="h"/>
  <feDiffuseLighting in="h" surfaceScale="26" diffuseConstant="1.15" lighting-color="#c9d6ff" result="l">
    <feDistantLight azimuth="200" elevation="24"/>
  </feDiffuseLighting>
  <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0" k4="0"/>
</filter>
<filter id="poil" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="1.1 0.35" numOctaves="3" seed="4" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.42  0 0 0 0 0.6  0 0 0 0 1"/>
</filter>
<radialGradient id="vignette-velours" cx="0.45" cy="0.42" r="0.8">
  <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
</radialGradient>"""
    return svg(contenu, defs, "#16233f")


# ---------------------------------------------------------------- 7.7, 7.8 : le papier de la lettre

def papier_lettre(graine=9):
    """7.7, 7.8 : une feuille crème, un peu de biais, presque pleine page, qui a son propre papier
    (fibres, bords un peu irréguliers) ; autour, la nuit ; en bas à gauche, la lueur du feu, qui
    réchauffe le coin de la feuille. La place des cinq lignes de la lettre, de y 380 à 1 150 ; au-dessus
    de la feuille, la place de « Darshan écrit : »."""
    rng = random.Random(graine)
    bord = []
    for k in range(41):
        bord.append((135 + 930 * k / 40, 210 + rng.uniform(-2.5, 2.5)))
    for k in range(1, 61):
        bord.append((1065 + rng.uniform(-2.5, 2.5), 210 + 1360 * k / 60))
    for k in range(1, 41):
        bord.append((1065 - 930 * k / 40, 1570 + rng.uniform(-2.5, 2.5)))
    for k in range(1, 60):
        bord.append((135 + rng.uniform(-2.5, 2.5), 1570 - 1360 * k / 60))
    feuille = poly(bord)
    rot = 'transform="rotate(-2.6 600 890)"'
    contenu = (f'<rect width="{W}" height="{H}" fill="url(#nuit-lettre)"/>'
               f'<rect width="{W}" height="{H}" fill="url(#feu-lettre)"/>'
               f'<g {rot}>'
               f'<path d="{feuille}" fill="#000" opacity="0.55" transform="translate(14 22)" filter="url(#flou-feuille)"/>'
               f'<path d="{feuille}" fill="#f1e5c9"/>'
               f'<path d="{feuille}" fill="#8a6a3a" filter="url(#fibres)" opacity="0.5"/>'
               f'<path d="{feuille}" fill="url(#bords-feuille)"/>'
               f'<path d="{feuille}" fill="url(#feu-feuille)" style="mix-blend-mode:multiply"/>'
               f'</g>')
    defs = """
<radialGradient id="nuit-lettre" cx="0.5" cy="0.4" r="0.85">
  <stop offset="0" stop-color="#1b1e30"/><stop offset="1" stop-color="#07080f"/>
</radialGradient>
<radialGradient id="feu-lettre" gradientUnits="userSpaceOnUse" cx="60" cy="1760" r="900">
  <stop offset="0" stop-color="#ff8a3c" stop-opacity="0.55"/><stop offset="0.45" stop-color="#c2461c" stop-opacity="0.18"/>
  <stop offset="1" stop-color="#c2461c" stop-opacity="0"/>
</radialGradient>
<radialGradient id="feu-feuille" gradientUnits="userSpaceOnUse" cx="80" cy="1720" r="1100">
  <stop offset="0" stop-color="#f7b777"/><stop offset="0.5" stop-color="#f6dcb6"/><stop offset="1" stop-color="#ffffff"/>
</radialGradient>
<radialGradient id="bords-feuille" cx="0.5" cy="0.5" r="0.72">
  <stop offset="0.7" stop-color="#6b4a20" stop-opacity="0"/><stop offset="1" stop-color="#6b4a20" stop-opacity="0.35"/>
</radialGradient>
<filter id="flou-feuille" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="fibres" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9 0.25" numOctaves="3" seed="13" result="t"/>
  <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -0.52" result="f"/>
  <feComposite in="SourceGraphic" in2="f" operator="in"/>
</filter>"""
    return svg(contenu, defs, "#07080f")



# ---------------------------------------------------------------- 1.9 et 7.8 : la cabane à kayaks

PORTE_LOCAL = (470, 700, 730, 1350)       # la porte de planches, vue à dix pas (x0, y0, x1, y1)
SERRURE_LOCAL = (690, 1015)               # sa serrure ; en plan rapproché, elle vient en (932, 1 010)


def planche_bois(x0, y0, x1, y1, teinte, rng, clair=None, veines=4, encre=ENCRE):
    """Une planche verticale : un aplat de lavis, ses veines, un liseré de lumière à gauche."""
    out = [lavis(poly([(x0, y0), (x1, y0 + rng.uniform(-2, 2)), (x1, y1), (x0, y1 + rng.uniform(-2, 2))]), teinte, 1.0, "aquarelle-douce")]
    if clair:
        out.append(f'<rect x="{x0 + 1:.1f}" y="{y0:.1f}" width="{(x1 - x0) * 0.18:.1f}" height="{y1 - y0:.1f}" fill="{clair}" opacity="0.45"/>')
    for _ in range(veines):
        vx = rng.uniform(x0 + 6, x1 - 6)
        pts = [(vx, y0 + 6)] + [(vx + rng.uniform(-3, 3), y0 + (y1 - y0) * k / 4) for k in range(1, 5)]
        out.append(f'<path d="{trait(pts, rng.uniform(1.0, 2.2), rng, 0.3, 0.3, 0.3)}" fill="{encre}" opacity="0.28"/>')
    out.append(f'<path d="{trait([(x1, y0), (x1, y1)], 2.4, rng, 0.02, 0.02, 0.2)}" fill="{encre}" opacity="0.7"/>')
    return "".join(out)


def local_kayaks(heure="or", proche=False, graine=41):
    """1.9 (or) et 7.8 (nuit, proche) : la cabane à kayaks d'Aluva vue du dehors, à dix pas : un
    mur de planches sous un toit de tôle, la porte de planches au milieu (PORTE_LOCAL), un jour à son
    pied, deux kayaks jaunes appuyés au mur, une palme au-dessus ; la lumière d'or rasante venue de
    gauche, ou la nuit. proche=True : un cadre rapproché sur la porte, qui met sa serrure en
    (932, 1 010), comme au pigeonnier, et son pied vers y 1 600 ; la fente du bas est noire."""
    rng = random.Random(graine)
    nuit = heure == "nuit"
    if nuit:
        ciel, bois, bois_clair, sol, tole, feuille = "url(#ciel-nuit-local)", "#2a2d42", "#6f7aa8", "#171a2a", "#34384e", "#1d3024"
        encre = "#05060c"
    else:
        ciel, bois, bois_clair, sol, tole, feuille = "url(#ciel-or)", "#b07a44", "#ffd98a", "#d9ae74", "#8a8478", "#6f8a3a"
        encre = "#2a1a0c"
    monde = []
    monde.append(f'<rect x="-400" y="-200" width="2000" height="1600" fill="{ciel}"/>')
    if nuit:
        for _ in range(90):
            monde.append(f'<circle cx="{rng.uniform(-200, 1400):.0f}" cy="{rng.uniform(-150, 520):.0f}" r="{rng.uniform(0.8, 2.2):.1f}" '
                         f'fill="#e8ecff" opacity="{rng.uniform(0.4, 0.95):.2f}"/>')
    else:
        monde.append('<circle cx="-60" cy="760" r="260" fill="#fff4cf" opacity="0.8" filter="url(#flou-large)"/>')
    # au loin, de chaque côté de la cabane : le fleuve, la rive, des palmiers en ombre
    monde.append(lavis(poly([(-400, 1290), (1600, 1270), (1600, 1400), (-400, 1400)]), "#2e4a60" if nuit else "#9cc3b6", 0.9, "aquarelle-douce"))
    for x in (-120, 60, 1080, 1240):
        monde.append(f'<g opacity="{0.35 if nuit else 0.5}">{palmier(x, 1290, rng.uniform(300, 420), rng, encre, feuille)}</g>')
    # le sol : terre battue, les ombres longues de la lumière rasante vers la droite
    monde.append(lavis(poly([(-400, 1385), (1600, 1380), (1600, 2400), (-400, 2400)]), sol, 1.0, "aquarelle-douce"))
    if not nuit:
        monde.append(lavis(poly([(730, 1388), (1500, 1400), (1600, 1520), (820, 1470)]), "#a0703e", 0.5, "aquarelle"))
    for k in range(10):
        y = 1420 + k * 36 + k * k * 2
        monde.append(f'<path d="{trait([(-300, y), (600, y + rng.uniform(-5, 5)), (1500, y)], 2 + k * 0.3, rng, 0.2, 0.2, 0.4)}" fill="{encre}" opacity="0.12"/>')
    # le mur de planches
    x = 200
    while x < 1000:
        lg = rng.uniform(52, 66)
        monde.append(planche_bois(x, 560, min(1000, x + lg), 1385, bois, rng, bois_clair, encre=encre))
        x += lg
    # le toit de tôle ondulée, son ombre sous l'avancée
    monde.append(lavis(poly([(160, 470), (1040, 470), (1060, 568), (140, 568)]), tole, 1.0, "aquarelle-douce"))
    for k in range(34):
        xx = 150 + k * 26.5
        monde.append(f'<path d="{trait([(xx + 6, 474), (xx - 2, 566)], 3, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.35"/>')
    monde.append(f'<path d="{trait([(140, 568), (1060, 568)], 5, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.9"/>')
    monde.append(f'<rect x="200" y="570" width="800" height="36" fill="{encre}" opacity="0.35" filter="url(#flou-petit)"/>')
    # la porte : cinq planches, deux traverses, une écharpe ; les pentures ; la serrure ; le jour du pied
    px0, py0, px1, py1 = PORTE_LOCAL
    monde.append(f'<rect x="{px0 - 16}" y="{py0 - 16}" width="{px1 - px0 + 32}" height="{py1 - py0 + 16}" fill="{encre}" opacity="0.8"/>')
    for k in range(5):
        a = px0 + k * (px1 - px0) / 5
        monde.append(planche_bois(a, py0, a + (px1 - px0) / 5, py1 - 10, bois, rng, bois_clair, veines=3, encre=encre))
    for y in (py0 + 70, py1 - 110):
        monde.append(lavis(poly([(px0 + 8, y), (px1 - 8, y), (px1 - 8, y + 44), (px0 + 8, y + 44)]), bois, 1.0, "aquarelle-douce"))
        monde.append(f'<path d="{trait([(px0 + 8, y + 44), (px1 - 8, y + 44)], 3, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.7"/>')
    monde.append(lavis(poly([(px0 + 14, py1 - 110), (px0 + 60, py1 - 110), (px1 - 14, py0 + 114), (px1 - 60, py0 + 114)]), bois, 1.0, "aquarelle-douce"))
    monde.append(f'<path d="{trait([(px0 + 60, py1 - 110), (px1 - 14, py0 + 114)], 2.6, rng, 0.05, 0.05, 0.1)}" fill="{encre}" opacity="0.6"/>')
    for y in (py0 + 92, py1 - 88):
        monde.append(f'<path d="{trait([(px0 - 6, y), (px0 + 120, y + 3), (px0 + 150, y)], 9, rng, 0.02, 0.4, 0.05)}" fill="#1c1c20"/>')
    sx, sy = SERRURE_LOCAL
    monde.append(f'<rect x="{sx - 13}" y="{sy - 34}" width="26" height="68" rx="4" fill="#3a3530" stroke="{encre}" stroke-width="2"/>')
    monde.append(f'<path d="M{sx},{sy - 12} a5,5 0 1 1 0.1,0 Z M{sx - 3},{sy - 6} L{sx + 3},{sy - 6} L{sx + 4},{sy + 12} L{sx - 4},{sy + 12} Z" fill="#050505"/>')
    monde.append(f'<rect x="{px0}" y="{py1 - 10}" width="{px1 - px0}" height="10" fill="#050304"/>')
    # deux kayaks jaunes appuyés au mur, à droite de la porte ; une pagaie
    monde.append(kayak((790, 1392), (842, 380), 104, rng, encre, clair="gauche", jaune="#f0bf2c" if not nuit else "#8f7d45",
                       ombre="ombre-local" if nuit else None))
    monde.append(kayak((905, 1392), (938, 408), 98, rng, encre, clair="gauche", bande=False, jaune="#f4c734" if not nuit else "#978449",
                       ombre="ombre-local" if nuit else None))
    monde.append(f'<path d="{trait([(1010, 1390), (1040, 700)], 7, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.8"/>')
    monde.append(lavis(poly([(1022, 700), (1058, 700), (1066, 560), (1030, 520), (1012, 560)]), "#c05a2a" if not nuit else "#4a3a4a", 0.95, "aquarelle-douce"))
    # la palme au-dessus du toit, venue de la gauche
    monde.append(palmier(-60, 1250, 1080, random.Random(graine + 7), encre, feuille))
    # la lumière : l'or rasant venu de gauche ; ou la lune, froide
    monde.append(f'<rect x="-400" y="-200" width="2000" height="2600" fill="url(#{"lune-local" if nuit else "or-local"})"/>')
    contenu = "".join(monde)
    if proche:
        k = (1600 - 1010) / (PORTE_LOCAL[3] - SERRURE_LOCAL[1])
        contenu = (f'<g transform="translate({932 - k * sx:.2f} {1010 - k * sy:.2f}) scale({k:.4f})">{contenu}</g>')
    defs = DEFS_AQUARELLE + """
<linearGradient id="ciel-or" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f3c77e"/><stop offset="0.5" stop-color="#f8dc9e"/><stop offset="1" stop-color="#fbebc4"/>
</linearGradient>
<linearGradient id="ciel-nuit-local" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#070a1c"/><stop offset="1" stop-color="#1c2446"/>
</linearGradient>
<linearGradient id="or-local" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#ffcf6a" stop-opacity="0.34"/><stop offset="0.6" stop-color="#ffcf6a" stop-opacity="0.08"/>
  <stop offset="1" stop-color="#7a3a10" stop-opacity="0.18"/>
</linearGradient>
<radialGradient id="lune-local" gradientUnits="userSpaceOnUse" cx="-100" cy="0" r="1900">
  <stop offset="0" stop-color="#9fb2ff" stop-opacity="0.12"/><stop offset="1" stop-color="#000010" stop-opacity="0.5"/>
</radialGradient>
<linearGradient id="ombre-local" gradientUnits="userSpaceOnUse" x1="760" y1="0" x2="1000" y2="0">
  <stop offset="0" stop-color="#05060c" stop-opacity="0.15"/><stop offset="1" stop-color="#05060c" stop-opacity="0.55"/>
</linearGradient>
<filter id="flou-large" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="80"/></filter>
<filter id="flou-petit" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>"""
    return svg(contenu, defs, "#0b0d18" if nuit else "#f6d9a0")


# ---------------------------------------------------------------- 5.2 à 5.5 : le marché d'Aluva

# Les points de la synthèse : chaque marchandise sur son étal (x, y, rayon), le paquet de confettis.
ETALS = {"thes": (380, 860), "curcuma": (830, 880), "encens": (290, 1060), "jarres": (900, 1080),
         "tapisseries": (210, 700), "confettis": (620, 960)}


def auvent(x0, x1, y, pente, couleur, rng, festons=7, encre="#2a1a0c"):
    """Un auvent de toile tendu entre deux perches : une bande de lavis, un bord festonné."""
    y1 = y + pente
    corps = [(x0, y), (x1, y1), (x1, y1 + 70), (x0, y + 70)]
    out = [lavis(poly(corps), couleur, 0.95, "aquarelle")]
    bord = []
    for k in range(festons * 8 + 1):
        t = k / (festons * 8)
        xx = x0 + (x1 - x0) * t
        yy = y + 70 + pente * t + 14 * abs(math.sin(math.pi * festons * t))
        bord.append((xx, yy))
    out.append(lavis(poly([(x0, y + 60), (x1, y1 + 60)] + bord[::-1]), couleur, 0.85, "aquarelle-douce"))
    out.append(f'<path d="{trait(bord, 2.2, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.6"/>')
    out.append(f'<path d="{trait([(x0, y), (x1, y1)], 2.6, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.7"/>')
    for k in range(5):
        xx = x0 + (x1 - x0) * (k + 0.5) / 5
        out.append(f'<path d="{trait([(xx, y + pente * (k + 0.5) / 5 + 4), (xx + 4, y + 66 + pente * (k + 0.5) / 5)], 6, rng, 0.2, 0.2, 0.3)}" fill="#fff" opacity="0.25"/>')
    return "".join(out)


def perche(x, y0, y1, rng, encre="#2a1a0c"):
    """Une perche de bambou, ses nœuds."""
    out = [f'<path d="{trait([(x, y0), (x + rng.uniform(-4, 4), (y0 + y1) / 2), (x, y1)], 10, rng, 0.02, 0.02, 0.1)}" fill="#a88a4a"/>']
    y = y0 + 60
    while y < y1 - 20:
        out.append(f'<path d="{trait([(x - 6, y), (x + 6, y)], 3, rng, 0.1, 0.1, 0.1)}" fill="{encre}" opacity="0.6"/>')
        y += rng.uniform(80, 120)
    out.append(f'<path d="{trait([(x - 5, y0), (x - 5, y1)], 2, rng, 0.02, 0.02, 0.2)}" fill="{encre}" opacity="0.6"/>')
    return "".join(out)


def table_etal(x0, x1, y, rng, encre="#2a1a0c"):
    """Une table d'étal : plateau de planches, pieds."""
    out = [lavis(poly([(x0, y), (x1, y), (x1 + 10, y + 28), (x0 - 10, y + 28)]), "#8a5a30", 1.0, "aquarelle-douce"),
           lavis(poly([(x0 - 10, y + 28), (x1 + 10, y + 28), (x1 + 10, y + 44), (x0 - 10, y + 44)]), "#5e3a1c", 1.0, "aquarelle-douce")]
    for xx in (x0 + 10, x1 - 10):
        out.append(f'<path d="{trait([(xx, y + 44), (xx, y + 190)], 9, rng, 0.02, 0.02, 0.1)}" fill="#4a2e16"/>')
    out.append(f'<path d="{trait([(x0 - 10, y + 28), (x1 + 10, y + 28)], 2.4, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.7"/>')
    return "".join(out)


def marchand(x, y, echelle, rng, pose="debout", habit="#efe4cc", pagne="#b88a4a", encre="#1d140e"):
    """Un marchand en silhouette de pinceau, sans visage, tourné vers ses affaires : la tête (ses
    cheveux, un turban de toile), la chemise claire, le pagne noué, les bras ; `pose` : « debout »,
    « assis » (sur un tabouret bas), « marche » (vu de dos, au fond de l'allée). (x, y) : le haut
    de la tête ; `echelle` : 1 pour un homme debout au premier plan (environ 330 unités)."""
    s = echelle
    out = []

    def P(dx, dy):
        return (x + dx * s, y + dy * s)

    def forme(pts, couleur, op=1.0, filtre="aquarelle-douce"):
        out.append(lavis(poly(catmull_rom([P(*q) for q in pts] + [P(*pts[0])], 5)), couleur, op, filtre))

    def coup(pts, largeur, op=0.85):
        out.append(f'<path d="{trait([P(*q) for q in pts], largeur * s, rng, 0.15, 0.35, 0.25)}" fill="{encre}" opacity="{op}"/>')
    if pose == "assis":
        forme([(-30, 150), (34, 148), (70, 190), (74, 222), (-62, 226), (-60, 186)], pagne)          # les genoux, le pagne
        forme([(-26, 34), (26, 32), (36, 90), (32, 152), (-30, 154), (-34, 92)], habit)               # la chemise
        coup([(-26, 36), (-34, 92), (-30, 152)], 3)
        coup([(26, 34), (36, 92), (32, 150)], 2.4, 0.6)
        coup([(24, 44), (54, 110), (86, 132)], 7)                                                    # un bras vers l'étal
        coup([(-24, 44), (-40, 110), (-18, 150)], 7)
        coup([(-62, 226), (-60, 250)], 5)
        coup([(70, 222), (78, 250)], 5)
        forme([(-44, 250), (84, 250), (78, 262), (-40, 262)], "#6a4a2a", 0.9)                          # le tabouret
    else:
        forme([(-24, 34), (24, 32), (34, 110), (30, 160), (-28, 162), (-34, 110)], habit)             # la chemise
        forme([(-30, 150), (30, 148), (36, 250), (30, 300), (-28, 302), (-36, 250)], pagne)           # le pagne
        coup([(-24, 36), (-34, 110), (-28, 160), (-36, 250), (-28, 300)], 3)
        coup([(24, 34), (34, 110), (30, 160), (36, 250), (30, 300)], 2.4, 0.6)
        if pose == "marche":
            coup([(-22, 42), (-40, 110), (-52, 150)], 6)
            coup([(22, 42), (38, 104), (46, 148)], 6)
            coup([(-14, 300), (-24, 330)], 6)
            coup([(14, 300), (26, 326)], 6)
        else:
            coup([(-22, 42), (-40, 110), (-44, 160)], 7)
            coup([(22, 42), (48, 96), (84, 118)], 7)                                                  # la main sur l'étal
            coup([(-14, 302), (-16, 330)], 6)
            coup([(14, 302), (18, 330)], 6)
    # la tête, de trois quarts dos : les cheveux, un turban de toile ; pas de visage
    forme([(-16, 6), (-14, -12), (0, -20), (15, -12), (17, 8), (10, 26), (-10, 26)], "#2a1d14", 0.95)
    forme([(-18, -2), (-10, -20), (8, -22), (19, -6), (6, -10), (-8, -6)], "#e6dcc4", 0.9)
    coup([(-4, 26), (-3, 34)], 8)                                                                  # la nuque
    return f'<g filter="url(#aquarelle-douce)">{"".join(out)}</g>'


def marchandise(nom, rng, encre="#2a1a0c"):
    """Une marchandise du marché, sur son calque (fond transparent), à sa place d'ETALS."""
    x, y = ETALS.get(nom, (150, 120))
    out = []
    if nom == "thes":
        # deux sacs de jute ouverts, bords roulés, pleins de feuilles de thé sombres
        for dx, dy, r in ((-40, 12, 52), (42, 18, 48)):
            cx, cy = x + dx, y + dy
            sac = [(cx - r, cy + 58), (cx - r * 1.05, cy - 8), (cx - r * 0.8, cy - 30), (cx + r * 0.8, cy - 30), (cx + r * 1.05, cy - 8), (cx + r, cy + 58)]
            out.append(lavis(poly(sac), "#b8925a", 1.0, "aquarelle-douce"))
            out.append(lavis(f"M{cx - r * 0.85:.1f},{cy - 24:.1f} Q{cx:.1f},{cy - 58:.1f} {cx + r * 0.85:.1f},{cy - 24:.1f} Q{cx:.1f},{cy - 6:.1f} {cx - r * 0.85:.1f},{cy - 24:.1f} Z", "#3a2a1a", 1.0, "aquarelle-douce"))
            for _ in range(22):
                fx, fy = cx + rng.uniform(-r * 0.7, r * 0.7), cy - 28 + rng.uniform(-12, 10)
                out.append(f'<path d="{trait([(fx - 5, fy), (fx + 5, fy + rng.uniform(-3, 3))], 2.2, rng, 0.2, 0.2, 0.2)}" fill="#6a5a2a" opacity="0.8"/>')
            out.append(f'<path d="{trait([(cx - r * 1.05, cy - 8), (cx, cy - 20), (cx + r * 1.05, cy - 8)], 5, rng, 0.1, 0.1, 0.2)}" fill="#8a6a3a"/>')
            out.append(f'<path d="{trait(sac, 2.2, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.7"/>')
            for k in range(6):
                yy = cy - 4 + k * 10
                out.append(f'<path d="{trait([(cx - r * 0.9, yy), (cx + r * 0.9, yy + 2)], 1.2, rng, 0.2, 0.2, 0.2)}" fill="#7a5a2a" opacity="0.35"/>')
    elif nom == "curcuma":
        # un plateau de laiton, un cône de poudre jaune safran
        out.append(f'<ellipse cx="{x}" cy="{y + 36}" rx="78" ry="16" fill="#b08a3a"/>')
        out.append(f'<ellipse cx="{x}" cy="{y + 33}" rx="70" ry="12" fill="#d8b25a"/>')
        out.append(lavis(poly([(x - 60, y + 34), (x - 6, y - 56), (x + 8, y - 56), (x + 62, y + 34)]), "#e8a818", 1.0, "aquarelle-douce"))
        out.append(lavis(poly([(x + 8, y - 56), (x + 62, y + 34), (x + 20, y + 36)]), "#c47e0e", 0.8, "aquarelle-douce"))
        out.append(f'<path d="{trait([(x - 60, y + 34), (x - 3, y - 56), (x + 62, y + 34)], 2.2, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.6"/>')
        out.append(f'<path d="{trait([(x - 78, y + 36), (x, y + 52), (x + 78, y + 36)], 2.2, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.6"/>')
    elif nom == "encens":
        # un pot de terre, des bâtonnets, un fil de fumée
        out.append(lavis(poly([(x - 36, y - 10), (x + 36, y - 10), (x + 30, y + 52), (x - 30, y + 52)]), "#9a5a34", 1.0, "aquarelle-douce"))
        out.append(f'<ellipse cx="{x}" cy="{y - 10}" rx="37" ry="9" fill="#5a3218"/>')
        for k, a in enumerate((-0.35, -0.18, 0.0, 0.16, 0.33)):
            hx, hy = x + 150 * math.sin(a), y - 10 - 150 * math.cos(a)
            out.append(f'<path d="{trait([(x + 4 * k - 8, y - 10), (hx, hy)], 3.2, rng, 0.02, 0.1, 0.05)}" fill="#6a3a1a"/>')
            out.append(f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="3.4" fill="#ff7a2a"/>')
        fumee = [(x + 2, y - 162), (x - 14, y - 200), (x + 12, y - 240), (x - 6, y - 280)]
        out.append(f'<path d="{trait(fumee, 5, rng, 0.2, 0.6, 0.4)}" fill="#d8d4cc" opacity="0.6" filter="url(#aquarelle-douce)"/>')
        out.append(f'<path d="{trait(droit([(x - 36, y - 10), (x - 30, y + 52), (x + 30, y + 52), (x + 36, y - 10)], 12), 2.2, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.6"/>')
    elif nom == "jarres":
        # trois jarres de terre cuite, de tailles différentes
        for dx, dy, h, w in ((-78, 30, 120, 62), (8, 0, 170, 82), (86, 42, 100, 54)):
            cx, base = x + dx, y + dy + h / 2
            haut = base - h
            corps = [(cx - w * 0.35, haut), (cx - w * 0.45, haut + h * 0.15), (cx - w, haut + h * 0.5), (cx - w * 0.7, base),
                     (cx + w * 0.7, base), (cx + w, haut + h * 0.5), (cx + w * 0.45, haut + h * 0.15), (cx + w * 0.35, haut)]
            out.append(lavis(poly(catmull_rom(corps, 6)), "#b8663a", 1.0, "aquarelle-douce"))
            out.append(lavis(poly(catmull_rom([(cx + w * 0.2, haut + h * 0.2), (cx + w * 0.8, haut + h * 0.5), (cx + w * 0.55, base - 6), (cx + w * 0.1, base - 4)], 5)), "#7a3a1c", 0.6, "aquarelle-douce"))
            out.append(f'<ellipse cx="{cx:.1f}" cy="{haut:.1f}" rx="{w * 0.38:.1f}" ry="{w * 0.1:.1f}" fill="#3a1a0c"/>')
            out.append(f'<path d="{trait(catmull_rom(corps, 6), 2.2, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.6"/>')
            out.append(f'<path d="{trait([(cx - w * 0.85, haut + h * 0.45), (cx, haut + h * 0.5), (cx + w * 0.85, haut + h * 0.45)], 2, rng, 0.2, 0.2, 0.2)}" fill="#f0d0a0" opacity="0.5"/>')
    elif nom == "tapisseries":
        # deux tentures suspendues à l'auvent de gauche : zigzags et paillettes qui chatoient
        for x0, x1, y0, y1, c1, c2 in ((85, 205, 575, 835, "#b8303a", "#e8b030"), (215, 335, 585, 800, "#2a5a8a", "#e05a8a")):
            out.append(lavis(poly([(x0, y0), (x1, y0), (x1 + 4, y1), (x0 - 4, y1)]), c1, 1.0, "aquarelle-douce"))
            for k in range(7):
                yy = y0 + 20 + k * (y1 - y0 - 40) / 6
                pts = [(x0 + (x1 - x0) * j / 8, yy + (10 if j % 2 else -10)) for j in range(9)]
                out.append(f'<path d="{trait(pts, 5, rng, 0.02, 0.02, 0.05)}" fill="{c2}" opacity="0.9"/>')
            for _ in range(26):
                out.append(f'<circle cx="{rng.uniform(x0 + 6, x1 - 6):.1f}" cy="{rng.uniform(y0 + 6, y1 - 6):.1f}" r="{rng.uniform(1.6, 3.2):.1f}" fill="#fff4c0" opacity="0.9"/>')
            for xx in range(int(x0) + 4, int(x1), 12):
                out.append(f'<path d="{trait([(xx, y1), (xx + 2, y1 + 22)], 2.2, rng, 0.1, 0.3, 0.1)}" fill="{c2}"/>')
            out.append(f'<path d="{trait(droit([(x0, y0), (x1, y0), (x1 + 4, y1), (x0 - 4, y1), (x0, y0)], 16), 2.2, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.6"/>')
    elif nom == "confettis":
        # le paquet de confettis : du papier blanc froissé en cornet, des points rose, menthe et citron
        out.append(lavis(poly([(x - 34, y - 34), (x + 30, y - 40), (x + 36, y + 32), (x - 38, y + 36)]), "#f6f0e2", 1.0, "aquarelle-douce"))
        out.append(lavis(poly([(x - 34, y - 34), (x + 30, y - 40), (x + 18, y - 58), (x - 20, y - 54)]), "#e8e0cc", 1.0, "aquarelle-douce"))
        for _ in range(26):
            out.append(f'<circle cx="{rng.uniform(x - 30, x + 30):.1f}" cy="{rng.uniform(y - 30, y + 30):.1f}" r="{rng.uniform(2.5, 4.5):.1f}" '
                       f'fill="{rng.choice(("#f6a1b8", "#9ddcc0", "#f2de7a"))}"/>')
        out.append(f'<path d="{trait(droit([(x - 34, y - 34), (x + 30, y - 40), (x + 36, y + 32), (x - 38, y + 36), (x - 34, y - 34)], 10), 2, rng, 0.02, 0.02, 0.2)}" fill="{encre}" opacity="0.6"/>')
    elif nom == "mangue":
        # la mangue qui roule (effet « roule ») : une figurine, dans le coin de la page (DECOUPES)
        cx, cy = 150, 120
        forme = [(cx - 95, cy + 8), (cx - 70, cy - 52), (cx, cy - 66), (cx + 80, cy - 40), (cx + 100, cy + 12),
                 (cx + 60, cy + 58), (cx - 20, cy + 64), (cx - 80, cy + 44)]
        out.append(lavis(poly(catmull_rom(forme + [forme[0]], 6)), "#e8b030", 1.0, "aquarelle-douce"))
        out.append(lavis(poly(catmull_rom([(cx - 90, cy + 4), (cx - 60, cy - 50), (cx, cy - 60), (cx - 20, cy - 10), (cx - 70, cy + 30)], 6)), "#d8452a", 0.75, "aquarelle-douce"))
        out.append(lavis(poly(catmull_rom([(cx + 30, cy + 50), (cx + 90, cy + 10), (cx + 70, cy + 50)], 6)), "#7a9a2a", 0.7, "aquarelle-douce"))
        out.append(f'<path d="{trait(catmull_rom(forme + [forme[0]], 6), 2.6, rng, 0.02, 0.02, 0.2)}" fill="{encre}" opacity="0.7"/>')
        out.append(f'<path d="{trait([(cx - 92, cy - 4), (cx - 112, cy - 16)], 4, rng, 0.1, 0.4, 0.1)}" fill="#4a3a1a"/>')
        out.append(f'<ellipse cx="{cx - 30}" cy="{cy - 34}" rx="22" ry="8" fill="#fff" opacity="0.35" transform="rotate(-20 {cx - 30} {cy - 34})"/>')
    return "".join(out)


def marche_aluva(photo=None, x=0.0, image=None, calque=None, graine=53):
    """5.2 à 5.5 : le marché d'Aluva : le « Jardin tropical » de Karl (34342144, x 0) à l'encre,
    retouché chaud et clair (image, préparée par decors.py) ; des auvents de toile safran, indigo
    délavé et rose passé sur des perches de bambou ; trois ou quatre marchands en silhouettes de
    pinceau, sans visage ; les étals vides. Chaque marchandise est un calque à part (calque : thes,
    curcuma, encens, jarres, tapisseries, confettis, mangue), à sa place d'ETALS, pour quitter l'étal
    une fois achetée. Le haut de la page (les palmes dorées) reste au texte."""
    rng = random.Random(graine)
    if calque:
        return svg(marchandise(calque, rng), DEFS_AQUARELLE)
    out = [photo_svg(image)]
    # au fond de l'allée, sous un auvent rose passé : un petit étal (le paquet de confettis y attend),
    # sa marchande derrière
    out.append(perche(528, 700, 1010, rng))
    out.append(perche(712, 700, 1010, rng))
    out.append(auvent(508, 732, 690, 6, "#e0a4a8", rng, festons=5))
    out.append(marchand(652, 806, 0.5, rng, "debout", habit="#d8e0e8", pagne="#8a5a8a"))
    out.append(table_etal(540, 700, 998, rng))
    # à gauche : l'étal des thés, les tentures sous l'auvent safran, l'encens devant, sur une caisse ;
    # le marchand assis sur un tabouret, au bord de l'allée
    out.append(perche(75, 500, 1220, rng))
    out.append(perche(468, 520, 1210, rng))
    out.append(auvent(52, 492, 478, 30, "#e2a232", rng, festons=8))
    out.append(marchand(505, 828, 0.72, rng, "assis", habit="#e8b44a", pagne="#8a5a3a"))
    out.append(table_etal(300, 462, 912, rng))
    out.append(lavis(poly([(222, 1098), (360, 1098), (366, 1176), (216, 1176)]), "#7a5230", 1.0, "aquarelle-douce"))
    out.append(f'<path d="{trait(droit([(216, 1176), (222, 1098), (360, 1098), (366, 1176)], 16), 2.4, rng, 0.05, 0.05, 0.2)}" fill="#2a1a0c" opacity="0.6"/>')
    # à droite : l'étal du curcuma sous l'auvent indigo, son marchand derrière ; les jarres devant, à terre
    out.append(perche(738, 520, 1220, rng))
    out.append(perche(1135, 500, 1230, rng))
    out.append(auvent(716, 1158, 506, -26, "#6f86b0", rng, festons=8))
    out.append(marchand(1040, 690, 0.8, rng, "debout", habit="#f2ead6", pagne="#5a78a8"))
    out.append(table_etal(752, 1102, 930, rng))
    out.append(lavis(poly([(760, 1160), (1060, 1160), (1100, 1200), (740, 1200)]), "#6a4a2a", 0.35, "aquarelle"))
    out.append(f'<rect width="{W}" height="{H}" fill="url(#soleil-marche)"/>')
    defs = DEFS_AQUARELLE + """
<linearGradient id="soleil-marche" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffd98a" stop-opacity="0.18"/><stop offset="0.5" stop-color="#ffd98a" stop-opacity="0.05"/>
  <stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
</linearGradient>"""
    return svg("".join(out), defs, "#f4e2bc")


# ---------------------------------------------------------------- 3.2 : le mur de terre

def mur_terre(graine=61):
    """3.2 : un mur de torchis plein cadre (en attendant la photo de Karl, repérage 1) : lavis ocre
    et brun, taches plus sombres, brins de paille en tous sens, deux ou trois fissures ; en (600, 800),
    un trou irrégulier d'environ 220 x 180 unités, aux bords effrités d'où dépassent des brins ; le
    trou est noir. La cible du geste : (600, 800), rayon 160."""
    rng = random.Random(graine)
    out = [f'<rect width="{W}" height="{H}" fill="#b98c56" filter="url(#relief-terre)"/>']
    # les taches de lavis : la terre plus sombre, plus claire, plus ou moins sèche
    for _ in range(22):
        cx, cy, r = rng.uniform(-100, 1300), rng.uniform(-100, 1900), rng.uniform(120, 300)
        couleur = rng.choice(("#7a5028", "#8a5e32", "#d8b07a", "#6a4424"))
        pts = [(cx + r * math.cos(a) * rng.uniform(0.7, 1.1), cy + r * 0.7 * math.sin(a) * rng.uniform(0.7, 1.1))
               for a in [2 * math.pi * k / 9 for k in range(9)]]
        out.append(lavis(poly(catmull_rom(pts + [pts[0]], 5)), couleur, rng.uniform(0.12, 0.24), "aquarelle-douce"))
    # les brins de paille pris dans la terre : une ombre dessous, un reflet dessus
    for _ in range(1300):
        x, y = rng.uniform(-20, 1220), rng.uniform(-20, 1820)
        if math.dist((x, y), (600, 800)) < 140:
            continue
        a = rng.uniform(0, math.pi)
        lg = rng.uniform(16, 64)
        x1, y1 = x + lg * math.cos(a), y + lg * math.sin(a)
        l_ = rng.uniform(1.4, 3.2)
        couleur = rng.choice(("#f0d892", "#e4c677", "#d2ae5c", "#b89048"))
        op = rng.uniform(0.35, 0.95)
        out.append(f'<path d="{trait([(x + 1.5, y + 2), (x1 + 1.5, y1 + 2)], l_, rng, 0.2, 0.3, 0.1)}" fill="#3a2410" opacity="{op * 0.45:.2f}"/>')
        out.append(f'<path d="{trait([(x, y), (x1, y1)], l_, rng, 0.2, 0.3, 0.1)}" fill="{couleur}" opacity="{op:.2f}"/>')
    # deux ou trois fissures, à l'encre brune
    for depart, arrivee in (((140, 250), (470, 700)), ((760, 880), (1180, 1420)), ((520, 930), (330, 1560))):
        pts = [depart]
        n = 8
        for k in range(1, n + 1):
            t = k / n
            pts.append((depart[0] + (arrivee[0] - depart[0]) * t + rng.uniform(-25, 25), depart[1] + (arrivee[1] - depart[1]) * t + rng.uniform(-25, 25)))
        out.append(f'<path d="{trait(pts, 4.5, rng, 0.1, 0.5, 0.5)}" fill="#3b2614" opacity="0.85"/>')
        branche = pts[n // 2]
        out.append(f'<path d="{trait([branche, (branche[0] + rng.uniform(-70, 70), branche[1] + rng.uniform(40, 90))], 2.6, rng, 0.1, 0.6, 0.5)}" fill="#3b2614" opacity="0.7"/>')
    # le trou : un contour irrégulier, un bord effrité plus clair, l'ombre dedans, les brins qui dépassent
    bord = []
    for k in range(36):
        a = 2 * math.pi * k / 36
        r = 1 + 0.12 * math.sin(3 * a + 1) + 0.07 * math.sin(5 * a) + rng.uniform(-0.05, 0.05)
        bord.append((600 + 112 * r * math.cos(a), 800 + 92 * r * math.sin(a)))
    effrite = [(600 + (x - 600) * 1.22 + rng.uniform(-6, 6), 800 + (y - 800) * 1.25 + rng.uniform(-6, 6)) for x, y in bord]
    out.append(lavis(poly(catmull_rom(effrite + [effrite[0]], 4)), "#dcb67c", 0.85, "aquarelle"))
    out.append(lavis(poly(catmull_rom([(600 + (x - 600) * 1.1, 800 + (y - 800) * 1.12) for x, y in bord] + [bord[0]], 4)), "#6a4424", 0.8, "aquarelle-douce"))
    out.append(f'<path d="{poly(catmull_rom(bord + [bord[0]], 4))}" fill="#070504"/>')
    out.append(f'<path d="{poly(catmull_rom(bord + [bord[0]], 4))}" fill="url(#fond-trou)"/>')
    for _ in range(26):
        a = rng.uniform(0, 2 * math.pi)
        x0, y0 = 600 + 118 * math.cos(a), 800 + 98 * math.sin(a)
        lg = rng.uniform(18, 44)
        b = a + math.pi + rng.uniform(-0.8, 0.8)
        out.append(f'<path d="{trait([(x0, y0), (x0 + lg * math.cos(b), y0 + lg * math.sin(b))], rng.uniform(1.6, 2.8), rng, 0.2, 0.3, 0.1)}" '
                   f'fill="{rng.choice(("#ecd48e", "#d8b868"))}" opacity="0.95"/>')
    out.append(f'<path d="{trait(catmull_rom(bord + [bord[0]], 4), 3.2, rng, 0.02, 0.02, 0.4)}" fill="#1a0f06" opacity="0.8"/>')
    out.append(f'<rect width="{W}" height="{H}" fill="url(#lumiere-mur-terre)"/>')
    defs = DEFS_AQUARELLE + """
<filter id="relief-terre" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="4" seed="31" result="t"/>
  <feDiffuseLighting in="t" surfaceScale="7" diffuseConstant="1.25" lighting-color="#fff0d0" result="l">
    <feDistantLight azimuth="225" elevation="42"/>
  </feDiffuseLighting>
  <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
</filter>
<radialGradient id="fond-trou" cx="0.62" cy="0.62" r="0.7">
  <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity="0.35"/>
</radialGradient>
<linearGradient id="lumiere-mur-terre" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff0cc" stop-opacity="0.18"/><stop offset="0.6" stop-color="#fff0cc" stop-opacity="0"/>
  <stop offset="1" stop-color="#1a0f06" stop-opacity="0.3"/>
</linearGradient>"""
    return svg("".join(out), defs, "#b98c56")


# ---------------------------------------------------------------- 3.7 : le recueil

def recueil(graine=71):
    """3.7 : un vieux livre ouvert vu d'au-dessus, au coin d'une table de bois : deux pages vierges
    et jaunies, bords sombres et rousseurs ; la lumière d'une lampe venue de la gauche ; aucune
    lettre. La page de droite (vers x 640 à 1 000, y 420 à 1 000) reçoit la calligraphie de 3.7."""
    rng = random.Random(graine)
    out = [f'<rect width="{W}" height="{H}" fill="#3a2414"/>']
    # la table : des planches de bois sombre, leurs veines ; son coin, en bas à droite, sur l'ombre du sol
    for k in range(9):
        y0 = -40 + k * 230
        out.append(lavis(poly([(-40, y0), (1300, y0 - 40), (1300, y0 + 190), (-40, y0 + 228)]), rng.choice(("#5a3820", "#4e301a", "#63402a")), 1.0, "aquarelle-douce"))
        for _ in range(7):
            yy = y0 + rng.uniform(15, 200)
            out.append(f'<path d="{trait([(-40, yy), (400, yy - 14 + rng.uniform(-6, 6)), (900, yy - 28 + rng.uniform(-8, 8)), (1300, yy - 40)], rng.uniform(1.2, 3), rng, 0.2, 0.2, 0.4)}" '
                       f'fill="#1e1008" opacity="{rng.uniform(0.2, 0.45):.2f}"/>')
        out.append(f'<path d="{trait([(-40, y0 + 228), (1300, y0 + 190)], 3.4, rng, 0.02, 0.02, 0.2)}" fill="#140a04" opacity="0.8"/>')
    out.append(f'<path d="M1300,1180 L1300,1900 L680,1900 Z" fill="#120a06"/>')
    out.append(f'<path d="{trait([(1300, 1180), (680, 1900)], 6, rng, 0.02, 0.02, 0.1)}" fill="#8a5a34" opacity="0.8"/>')
    # le livre : la couverture de cuir, la tranche des pages, les deux pages et le creux de la reliure
    livre = []
    livre.append(f'<path d="M168,398 L1032,372 L1050,1030 L150,1058 Z" fill="#000" opacity="0.5" transform="translate(26 30)" filter="url(#flou-livre)"/>')
    livre.append(lavis("M168,398 L1032,372 L1050,1030 L150,1058 Z", "#5a2618", 1.0, "aquarelle-douce"))
    for k in range(5):
        d = 6 + k * 3.2
        livre.append(f'<path d="M{190 + d},{414 + d * 0.2} L{600},{430} L{1010 - d},{390 + d * 0.2}" fill="none" stroke="#d8c290" stroke-width="1.6" opacity="0.8"/>')
    gauche = "M196,420 C330,396 480,404 598,446 L598,1016 C480,980 330,972 182,1030 Z"
    droite = "M602,446 C720,404 870,392 1004,396 L1022,1004 C870,966 720,976 602,1016 Z"
    for page in (gauche, droite):
        livre.append(f'<path d="{page}" fill="#ead9a8"/>')
        livre.append(f'<path d="{page}" fill="#8a6a3a" filter="url(#fibres-recueil)" opacity="0.28"/>')
        livre.append(f'<path d="{page}" fill="url(#bords-page)"/>')
    livre.append(f'<path d="M560,440 C585,450 598,456 600,470 L600,1010 C590,1000 575,995 560,990 Z" fill="#7a5a2a" opacity="0.35" filter="url(#flou-livre)"/>')
    livre.append(f'<path d="M640,440 C615,450 602,456 600,470 L600,1010 C610,1000 625,995 640,990 Z" fill="#7a5a2a" opacity="0.25" filter="url(#flou-livre)"/>')
    for _ in range(26):
        cx, cy = rng.choice(((rng.uniform(210, 580), rng.uniform(440, 1000)), (rng.uniform(620, 1000), rng.uniform(420, 990))))
        r = rng.uniform(2, 9)
        livre.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#a0703a" opacity="{rng.uniform(0.15, 0.4):.2f}" filter="url(#aquarelle-douce)"/>')
    livre.append(f'<path d="{trait([(196, 420), (330, 398), (480, 406), (598, 446)], 2.4, rng, 0.05, 0.05, 0.3)}" fill="#3a2410" opacity="0.6"/>')
    livre.append(f'<path d="{trait([(602, 446), (720, 404), (870, 392), (1004, 396)], 2.4, rng, 0.05, 0.05, 0.3)}" fill="#3a2410" opacity="0.6"/>')
    livre.append(f'<path d="{trait([(600, 450), (600, 1014)], 2.8, rng, 0.05, 0.05, 0.2)}" fill="#3a2410" opacity="0.7"/>')
    out.append(f'<g transform="rotate(-4 600 720)">{"".join(livre)}</g>')
    # la lampe, à gauche, hors du cadre : sa lumière chaude, l'ombre qui tombe à droite
    out.append(f'<rect width="{W}" height="{H}" fill="url(#lampe)"/>')
    defs = DEFS_AQUARELLE + """
<radialGradient id="lampe" gradientUnits="userSpaceOnUse" cx="-80" cy="560" r="1500">
  <stop offset="0" stop-color="#ffd48a" stop-opacity="0.5"/><stop offset="0.45" stop-color="#ffc870" stop-opacity="0.12"/>
  <stop offset="1" stop-color="#050201" stop-opacity="0.5"/>
</radialGradient>
<radialGradient id="bords-page" cx="0.5" cy="0.5" r="0.75">
  <stop offset="0.62" stop-color="#6a4a1c" stop-opacity="0"/><stop offset="1" stop-color="#6a4a1c" stop-opacity="0.45"/>
</radialGradient>
<filter id="flou-livre" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="fibres-recueil" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.8 0.3" numOctaves="3" seed="23" result="t"/>
  <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -0.5" result="f"/>
  <feComposite in="SourceGraphic" in2="f" operator="in"/>
</filter>"""
    return svg("".join(out), defs, "#3a2414")


# ---------------------------------------------------------------- 3.8 : la porte du personnel

def porte_battante(graine=83):
    """3.8 : une porte de service à un battant, peinte, au hublot rond, à la plaque de poussée et au
    ferme-porte, au bout d'une allée de rayonnages blancs (ceux de Gijón, à l'encre) ; sans écriteau.
    La porte est centrée en (600, 900) : la cible du geste (rayon 260), et le point d'où la
    transition « porte » fait jaillir sa lumière."""
    rng = random.Random(graine)
    fuite = (600, 860)
    out = [f'<rect width="{W}" height="{H}" fill="#f1ede4"/>']
    # le sol clair et luisant, le plafond, les rayonnages de part et d'autre, en perspective
    out.append(lavis(poly([(0, 1800), (1200, 1800), (730, 1165), (470, 1165)]), "#dcd6ca", 1.0, "aquarelle-douce"))
    out.append(lavis(poly([(0, 0), (1200, 0), (730, 600), (470, 600)]), "#e6e1d6", 1.0, "aquarelle-douce"))
    for s in (-1, 1):
        def X(v):
            return 600 + s * v
        face = [(X(600), -20), (X(130), 600), (X(130), 1165), (X(600), 1820)]
        out.append(lavis(poly(face), "#fbf9f4", 1.0, "aquarelle-douce"))
        for k in range(7):
            t = k / 6
            ya, yb = -20 + (1820 + 20) * t, 600 + (1165 - 600) * t
            out.append(f'<path d="{trait([(X(600), ya), (X(130), yb)], 3.2 - t * 1.2, rng, 0.02, 0.02, 0.1)}" fill="{ENCRE}" opacity="0.55"/>')
            if k < 6:
                # des livres sur l'étagère : des tranches sans titre, au lavis
                n = 14
                for j in range(n):
                    u0, u1 = j / n, (j + 0.8) / n
                    xa, xb = 600 + s * (600 - 470 * u0), 600 + s * (600 - 470 * u1)
                    y0a = ya + (yb - ya) * u0
                    y0b = ya + (yb - ya) * u1
                    haut = 150 * (1 - 0.72 * u0) * rng.uniform(0.6, 0.95)
                    out.append(lavis(poly([(xa, y0a + 4), (xb, y0b + 4), (xb, y0b + 4 + haut * (1 - 0.72 * u1) / (1 - 0.72 * u0)), (xa, y0a + 4 + haut)]),
                                     rng.choice(("#c9c2b4", "#b8b0a0", "#d8d0c0", "#a89e8c")), 0.55, "aquarelle-douce"))
        out.append(f'<path d="{trait([(X(130), 600), (X(130), 1165)], 3.4, rng, 0.02, 0.02, 0.1)}" fill="{ENCRE}" opacity="0.7"/>')
    # le mur du fond, la porte et son chambranle
    out.append(lavis(poly([(470, 600), (730, 600), (730, 1165), (470, 1165)]), "#e8e3d8", 1.0, "aquarelle-douce"))
    out.append(lavis(poly([(488, 636), (712, 636), (712, 1165), (488, 1165)]), "#8e9b92", 1.0, "aquarelle-douce"))
    out.append(lavis(poly([(504, 650), (696, 650), (696, 1165), (504, 1165)]), "#a9b5ac", 1.0, "aquarelle-douce"))
    out.append(lavis(poly([(504, 1100), (696, 1100), (696, 1165), (504, 1165)]), "#9aa0a0", 0.9, "aquarelle-douce"))
    out.append(f'<circle cx="600" cy="760" r="46" fill="#dfe7e4"/>')
    out.append(f'<circle cx="600" cy="760" r="46" fill="url(#hublot)"/>')
    out.append(f'<circle cx="600" cy="760" r="46" fill="none" stroke="#5a6660" stroke-width="7"/>')
    out.append(f'<circle cx="600" cy="760" r="46" fill="none" stroke="{ENCRE}" stroke-width="2" opacity="0.7"/>')
    out.append(f'<rect x="662" y="860" width="16" height="96" rx="3" fill="#c9ccc8" stroke="{ENCRE}" stroke-width="1.4" opacity="0.9"/>')
    out.append(f'<rect x="590" y="620" width="96" height="16" rx="3" fill="#6e756f"/>')
    out.append(f'<path d="{trait([(598, 632), (560, 648), (520, 640)], 4, rng, 0.05, 0.05, 0.1)}" fill="#5a615b"/>')
    for pts in (((488, 636), (712, 636), (712, 1165)), ((488, 1165), (488, 636))):
        out.append(f'<path d="{trait(droit(list(pts)), 2.6, rng, 0.02, 0.02, 0.2)}" fill="{ENCRE}" opacity="0.8"/>')
    out.append(f'<path d="{trait(droit([(504, 650), (696, 650), (696, 1165)]), 1.8, rng, 0.02, 0.02, 0.2)}" fill="{ENCRE}" opacity="0.6"/>')
    # un rai de lumière sous la porte, et le reflet du sol
    out.append(f'<rect x="504" y="1160" width="192" height="5" fill="#fff6d8" opacity="0.8"/>')
    out.append(lavis(poly([(504, 1166), (696, 1166), (760, 1330), (440, 1330)]), "#fffaf0", 0.35, "aquarelle-douce"))
    out.append(f'<rect width="{W}" height="{H}" fill="url(#bout-allee)"/>')
    defs = DEFS_AQUARELLE + """
<radialGradient id="hublot" cx="0.4" cy="0.35" r="0.7">
  <stop offset="0" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="1" stop-color="#9fb4b0" stop-opacity="0.2"/>
</radialGradient>
<radialGradient id="bout-allee" gradientUnits="userSpaceOnUse" cx="600" cy="880" r="1100">
  <stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#3a3a44" stop-opacity="0.28"/>
</radialGradient>"""
    return svg("".join(out), defs, "#f1ede4")



# ---------------------------------------------------------------- 6.6 : les toiles de Darshan

TOILE_COUPLE = (398, 104, 822, 562)       # la toile du couple (x0, y0, x1, y1) : son centre vers (610, 333)
TOILES = [("lune", (66, 168, 330, 440)), ("arbres", (78, 548, 330, 942)),
          ("croissant", (872, 146, 1134, 398)), ("racines", (884, 460, 1124, 770)), ("arche", (872, 812, 1122, 1012))]


def trait_toile(pts, largeur, rng, fin="volute", couleur=ENCRE):
    """Un trait des toiles de Darshan : il part d'un point d'encre sombre et sec (un « puits
    asséché ») et finit en volute, ou en racines qui se défont dans le lin."""
    out = [f'<circle cx="{pts[0][0]:.1f}" cy="{pts[0][1]:.1f}" r="{largeur * 0.95:.1f}" fill="{couleur}" filter="url(#bord-encre)"/>',
           f'<path d="{trait(pts, largeur, rng, 0.02, 0.6, 0.25)}" fill="{couleur}" opacity="0.92"/>']
    (xa, ya), (xb, yb) = pts[-2], pts[-1]
    a = math.atan2(yb - ya, xb - xa)
    if fin == "volute":
        spirale = []
        for k in range(14):
            t = k / 13
            r = largeur * 3.2 * (1 - t * 0.8)
            b = a + t * 4.4
            spirale.append((xb + r * math.cos(b + math.pi / 2) - largeur * 3.2 * math.cos(a + math.pi / 2),
                            yb + r * math.sin(b + math.pi / 2) - largeur * 3.2 * math.sin(a + math.pi / 2)))
        out.append(f'<path d="{trait(spirale, largeur * 0.45, rng, 0.05, 0.8, 0.2)}" fill="{couleur}" opacity="0.85"/>')
    else:
        for k in range(3):
            b = a + rng.uniform(-0.6, 0.6)
            lg = largeur * rng.uniform(5, 10)
            out.append(f'<path d="{trait([(xb, yb), (xb + lg * 0.5 * math.cos(b), yb + lg * 0.5 * math.sin(b)), (xb + lg * math.cos(b + 0.2), yb + lg * math.sin(b + 0.2))], largeur * 0.3, rng, 0.05, 0.9, 0.4)}" '
                       f'fill="{couleur}" opacity="0.6"/>')
    return "".join(out)


def toile_de_lin(x0, y0, x1, y1, rng):
    """Une toile de lin brut, sans cadre, tendue sur son châssis : le grain du lin, les bords, l'ombre."""
    return (f'<rect x="{x0 + 10}" y="{y0 + 14}" width="{x1 - x0}" height="{y1 - y0}" fill="#5a4a36" opacity="0.35" filter="url(#flou-toile)"/>'
            f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="#d8cab0"/>'
            f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="#6a5a40" filter="url(#lin)" opacity="0.6"/>'
            f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="none" stroke="#a8977a" stroke-width="3"/>')


def sujet(nom, boite, rng):
    """Ce que montre une petite toile, à l'encre de Chine."""
    x0, y0, x1, y1 = boite
    cx, cy, w, h = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
    out = []
    if nom == "lune":
        r = w * 0.3
        out.append(lavis(f"M{cx - r:.0f},{cy:.0f} a{r:.0f},{r:.0f} 0 1 0 {2 * r:.0f},0 a{r:.0f},{r:.0f} 0 1 0 {-2 * r:.0f},0 Z", "#5a5a6a", 0.55, "aquarelle"))
        out.append(trait_toile([(cx - r * 1.3, cy + r * 1.25), (cx - r * 0.4, cy + r * 1.05), (cx + r * 0.6, cy + r * 1.2), (cx + r * 1.2, cy + r * 1.0)], 4, rng))
    elif nom == "arbres":
        out.append(trait_toile([(x0 + w * 0.18, y1 - 20), (x0 + w * 0.26, cy + h * 0.1), (x0 + w * 0.42, y0 + h * 0.28), (cx + 4, y0 + h * 0.2)], 6, rng))
        out.append(trait_toile([(x1 - w * 0.18, y1 - 20), (x1 - w * 0.26, cy + h * 0.12), (x1 - w * 0.42, y0 + h * 0.3), (cx - 4, y0 + h * 0.22)], 6, rng))
        for s in (-1, 1):
            out.append(lavis(f"M{cx + s * w * 0.1:.0f},{y0 + h * 0.2:.0f} q{s * w * 0.25:.0f},{-h * 0.12:.0f} {s * w * 0.36:.0f},{h * 0.05:.0f} q{-s * w * 0.1:.0f},{h * 0.12:.0f} {-s * w * 0.36:.0f},{h * 0.02:.0f} Z", "#3a3a48", 0.35, "aquarelle"))
    elif nom == "croissant":
        out.append(trait_toile([(x0 + 18, y1 - h * 0.25), (cx, y1 - h * 0.28), (x1 - 18, y1 - h * 0.25)], 4, rng, fin="racine"))
        r = w * 0.16
        out.append(f'<path d="M{cx + r * 0.2:.0f},{cy - r * 1.6:.0f} a{r:.0f},{r:.0f} 0 1 0 0.1,{2 * r:.0f} a{r * 0.75:.0f},{r * 0.85:.0f} 0 1 1 -0.1,{-2 * r:.0f} Z" fill="{ENCRE}" opacity="0.85" filter="url(#bord-encre)"/>')
    elif nom == "racines":
        out.append(lavis(f"M{cx - w * 0.3:.0f},{y0 + h * 0.3:.0f} q{w * 0.3:.0f},{-h * 0.3:.0f} {w * 0.6:.0f},0 q{-w * 0.3:.0f},{h * 0.2:.0f} {-w * 0.6:.0f},0 Z", "#3a3a48", 0.45, "aquarelle"))
        out.append(trait_toile([(cx + 2, y0 + h * 0.3), (cx - 4, cy), (cx + 3, y0 + h * 0.68)], 7, rng, fin="racine"))
        for dx in (-50, -20, 25, 55):
            out.append(f'<path d="{trait([(cx, y0 + h * 0.66), (cx + dx * 0.6, y0 + h * 0.8), (cx + dx, y1 - 6)], 2.4, rng, 0.05, 0.9, 0.5)}" fill="{ENCRE}" opacity="0.55"/>')
    elif nom == "arche":
        out.append(trait_toile([(cx - w * 0.28, y1 - 12), (cx - w * 0.28, cy - h * 0.05), (cx - w * 0.2, y0 + h * 0.2), (cx, y0 + h * 0.12), (cx + w * 0.2, y0 + h * 0.2), (cx + w * 0.28, cy - h * 0.05), (cx + w * 0.28, y1 - 12)], 5, rng, fin="racine"))
        out.append(trait_toile([(cx - w * 0.16, y1 - 12), (cx - w * 0.14, cy), (cx, y0 + h * 0.3), (cx + w * 0.14, cy), (cx + w * 0.16, y1 - 12)], 3, rng, fin="racine"))
    return "".join(out)


def couple(rng, couleur=False):
    """La toile du couple : deux silhouettes sinueuses et étirées, qui ondulent comme deux flammes,
    penchées l'une vers l'autre, les mains jointes au centre (610, 333) ; chaque corps entre deux
    longs traits d'encre, elle à gauche, ses cheveux dénoués, lui à droite. couleur=True : leur
    aquarelle seule, l'orange pour elle, le jaune pour lui, arrêtée aux berges d'encre."""
    elle = ([(550, 196), (534, 252), (522, 318), (532, 396), (510, 468), (466, 544)],
            [(566, 204), (572, 262), (564, 330), (572, 412), (556, 494), (524, 552)])
    lui = ([(664, 194), (680, 252), (694, 326), (684, 406), (702, 480), (748, 546)],
           [(650, 200), (648, 264), (656, 340), (650, 420), (664, 500), (694, 554)])
    bras = ([(566, 238), (590, 292), (607, 331)], [(650, 234), (632, 290), (613, 333)])
    tetes = ((552, 172, 18, "#e8862a"), (664, 168, 19, "#e8c42a"))
    cheveux = [(540, 160), (514, 180), (500, 224), (510, 266), (498, 300)]

    def corps(av, ar):
        return poly(catmull_rom(av, 6) + catmull_rom(ar[::-1], 6))
    if couleur:
        rc = random.Random(5)
        out = []
        for (av, ar), br, (x, y, r, c) in zip((elle, lui), bras, tetes):
            out.append(lavis(corps(av, ar), c, 0.85, "aquarelle"))
            out.append(lavis(trait(br, 12, rc, 0.2, 0.3, 0.1), c, 0.8, "aquarelle"))
            out.append(f'<circle cx="{x}" cy="{y}" r="{r - 2}" fill="{c}" opacity="0.8" filter="url(#aquarelle)"/>')
        out.append(lavis(trait(cheveux, 16, rc, 0.2, 0.7, 0.3), "#d8641a", 0.6, "aquarelle"))
        out.append('<circle cx="610" cy="333" r="15" fill="#e8a62a" opacity="0.8" filter="url(#aquarelle)"/>')
        return "".join(out)
    out = []
    for (av, ar), br, (x, y, r, _) in zip((elle, lui), bras, tetes):
        out.append(lavis(corps(av, ar), "#2a2a38", 0.16, "aquarelle"))
        out.append(trait_toile(av, 5.2, rng, fin="volute"))
        out.append(trait_toile(ar, 3.4, rng, fin="racine"))
        out.append(trait_toile(br, 3.2, rng, fin="volute"))
        tour = [(x + r * math.cos(a), y + r * math.sin(a)) for a in [2.2 + k * 0.62 for k in range(10)]]
        out.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#2a2a38" opacity="0.14" filter="url(#aquarelle)"/>')
        out.append(f'<path d="{trait(tour, 4.4, rng, 0.1, 0.4, 0.2)}" fill="{ENCRE}" opacity="0.9"/>')
    out.append(trait_toile(cheveux, 3.0, rng, fin="volute"))
    out.append(f'<circle cx="610" cy="333" r="6" fill="{ENCRE}" opacity="0.85" filter="url(#bord-encre)"/>')
    return "".join(out)


def toiles(calque=None, graine=91):
    """6.6 : un mur de plâtre clair, éclairé de la gauche ; en bas au milieu, vers (600, 1 040), une
    table basse laquée, une pierre à encre, deux bâtons d'encre, un bâton d'encens (la fumée monte
    de (600, 1 000)) ; en haut au milieu, la plus grande toile, le couple (TOILE_COUPLE) ; de part et
    d'autre du chemin de la fumée (x 545 à 655), cinq toiles de lin brut, sans cadre : une pleine
    lune, deux arbres penchés l'un vers l'autre, un croissant sur un horizon, un arbre aux racines
    qui coulent, une arche. Tout tient au-dessus de y 1 040. calque « couleur » : l'aquarelle de la
    toile du couple seule (l'effet « couleur » l'y fait entrer)."""
    rng = random.Random(graine)
    if calque == "couleur":
        x0, y0, x1, y1 = TOILE_COUPLE
        return svg(f'<g clip-path="url(#toile-couple)">{couple(rng, couleur=True)}</g>',
                   DEFS_AQUARELLE + f'<clipPath id="toile-couple"><rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/></clipPath>')
    out = [f'<rect width="{W}" height="{H}" fill="url(#mur-toiles)"/>',
           f'<rect width="{W}" height="{H}" fill="#eee6d6" filter="url(#papier)" opacity="0.4"/>']
    for nom, boite in TOILES:
        out.append(toile_de_lin(*boite, rng))
        out.append(f'<g clip-path="url(#toile-{nom})">{sujet(nom, boite, rng)}</g>')
    x0, y0, x1, y1 = TOILE_COUPLE
    out.append(toile_de_lin(x0, y0, x1, y1, rng))
    out.append(f'<g clip-path="url(#toile-couple)">{couple(rng)}</g>')
    # la table basse laquée, et ce qui est posé dessus
    out.append(f'<rect x="330" y="1040" width="540" height="60" fill="#3a2a20" opacity="0.35" filter="url(#flou-toile)"/>')
    out.append(lavis(poly([(350, 994), (850, 994), (872, 1020), (328, 1020)]), "#4a1a14", 1.0, "aquarelle-douce"))
    out.append(lavis(poly([(328, 1020), (872, 1020), (872, 1052), (328, 1052)]), "#2a0e0a", 1.0, "aquarelle-douce"))
    out.append(f'<path d="{trait([(356, 998), (844, 998)], 2.4, rng, 0.1, 0.1, 0.1)}" fill="#e8b0a0" opacity="0.5"/>')
    out.append(lavis(poly([(418, 956), (556, 952), (562, 998), (412, 1000)]), "#2e2e34", 1.0, "aquarelle-douce"))
    out.append(f'<ellipse cx="452" cy="972" rx="22" ry="9" fill="#101014"/>')
    for dx in (0, 34):
        out.append(f'<path d="{trait([(662 + dx, 992), (742 + dx, 972)], 11, rng, 0.05, 0.05, 0.05)}" fill="#141418"/>')
        out.append(f'<path d="{trait([(664 + dx, 988), (740 + dx, 968)], 2, rng, 0.1, 0.1, 0.1)}" fill="#c8a040" opacity="0.7"/>')
    out.append(lavis(poly([(584, 998), (616, 998), (612, 982), (588, 982)]), "#8a6a4a", 1.0, "aquarelle-douce"))
    out.append(f'<path d="{trait([(600, 984), (599, 1000 - 72)], 2.6, rng, 0.02, 0.05, 0.05)}" fill="#6a3a1a"/>')
    out.append(f'<circle cx="599" cy="928" r="3.2" fill="#ff7a2a"/>')
    out.append(f'<rect width="{W}" height="{H}" fill="url(#lumiere-toiles)"/>')
    defs = DEFS_AQUARELLE + FILTRE_ENCRE + "".join(
        f'<clipPath id="toile-{nom}"><rect x="{bx0}" y="{by0}" width="{bx1 - bx0}" height="{by1 - by0}"/></clipPath>'
        for nom, (bx0, by0, bx1, by1) in TOILES + [("couple", TOILE_COUPLE)]) + """
<linearGradient id="mur-toiles" x1="0" y1="0" x2="1" y2="0.3">
  <stop offset="0" stop-color="#f7f1e4"/><stop offset="1" stop-color="#ddd3c0"/>
</linearGradient>
<linearGradient id="lumiere-toiles" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#fff8e8" stop-opacity="0.15"/><stop offset="1" stop-color="#3a3024" stop-opacity="0.12"/>
</linearGradient>
<filter id="flou-toile" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="lin" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="41" result="a"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.08 0.9" numOctaves="2" seed="42" result="b"/>
  <feComposite in="a" in2="b" operator="arithmetic" k1="0" k2="0.5" k3="0.5" k4="0" result="t"/>
  <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -0.72" result="f"/>
  <feComposite in="SourceGraphic" in2="f" operator="in"/>
</filter>"""
    return svg("".join(out), defs, "#eee6d6")


# ---------------------------------------------------------------- 6.13 à 6.15 : l'armoire

OUVERTURE_PLACARD = (330, 320, 870, 1040)     # l'ouverture de l'armoire, transparente (état « ouverte »)
SERRURE_PLACARD = (932, 680)


def panneau(x0, y0, x1, y1, rng, bois="#4a2e1c", encre="#140a04"):
    """Un panneau mouluré d'armoire : le cadre en biseau, la plate-bande, ses ombres et ses lumières."""
    b = 22
    out = [lavis(poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)]), bois, 1.0, "aquarelle-douce"),
           f'<path d="{poly([(x0, y0), (x1, y0), (x1 - b, y0 + b), (x0 + b, y0 + b)])}" fill="#6a4630" opacity="0.8"/>',
           f'<path d="{poly([(x0, y0), (x0 + b, y0 + b), (x0 + b, y1 - b), (x0, y1)])}" fill="#5a3a24" opacity="0.8"/>',
           f'<path d="{poly([(x1, y0), (x1, y1), (x1 - b, y1 - b), (x1 - b, y0 + b)])}" fill="#26160c" opacity="0.7"/>',
           f'<path d="{poly([(x0, y1), (x1, y1), (x1 - b, y1 - b), (x0 + b, y1 - b)])}" fill="#1e1008" opacity="0.7"/>',
           f'<path d="{trait(droit([(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)], 24), 2.2, rng, 0.02, 0.02, 0.2)}" fill="{encre}" opacity="0.7"/>',
           f'<path d="{trait(droit([(x0 + b, y0 + b), (x1 - b, y0 + b), (x1 - b, y1 - b), (x0 + b, y1 - b), (x0 + b, y0 + b)], 24), 1.8, rng, 0.02, 0.02, 0.2)}" fill="{encre}" opacity="0.6"/>']
    for _ in range(5):
        vx = rng.uniform(x0 + b + 8, x1 - b - 8)
        out.append(f'<path d="{trait([(vx, y0 + b + 4), (vx + rng.uniform(-6, 6), (y0 + y1) / 2), (vx + rng.uniform(-6, 6), y1 - b - 4)], rng.uniform(1, 2), rng, 0.3, 0.3, 0.3)}" fill="{encre}" opacity="0.3"/>')
    return "".join(out)


def serviettes(x0, x1, y, rng, couleurs=("#f4f1ea", "#c8dbe8", "#f4f1ea", "#dfe9f0")):
    """Une pile de serviettes pliées sur une étagère : des couches claires, leurs plis."""
    out = []
    h = 26
    for k, c in enumerate(couleurs):
        yy = y - (k + 1) * h
        out.append(f'<path d="M{x0 + k * 2},{yy + h} L{x0 + k * 2},{yy + 6} Q{x0 + k * 2},{yy} {x0 + 10 + k * 2},{yy} L{x1 - 4},{yy} L{x1 - 4},{yy + h} Z" fill="{c}"/>')
        out.append(f'<path d="{trait([(x0 + k * 2, yy + h - 2), (x1 - 4, yy + h - 2)], 2, rng, 0.05, 0.05, 0.2)}" fill="#7a8a96" opacity="0.5"/>')
    return "".join(out)


def cle_laiton(x, y, rng):
    """La clé de laiton un peu oxydée dans la serrure : son anneau (vert-de-gris), sa tige, dessinés
    comme la clé du pigeonnier."""
    return (f'<path d="{trait([(x, y + 4), (x, y + 40)], 7, rng, 0.05, 0.05, 0.05)}" fill="#a8843a"/>'
            f'<circle cx="{x}" cy="{y + 62}" r="23" fill="none" stroke="#b8923c" stroke-width="9"/>'
            f'<circle cx="{x}" cy="{y + 62}" r="23" fill="none" stroke="#5f9a86" stroke-width="4" stroke-dasharray="10 16" opacity="0.8"/>'
            f'<circle cx="{x - 8}" cy="{y + 50}" r="4" fill="#fff0c0" opacity="0.7"/>'
            f'<circle cx="{x}" cy="{y + 62}" r="23" fill="none" stroke="#2a1a08" stroke-width="1.6" opacity="0.7"/>')


def placard(etat="entrouverte", graine=97):
    """6.13 à 6.15 : une armoire de bois sombre à une porte, aux panneaux moulurés, l'entrée de
    serrure de laiton à droite de l'unique battant, à mi-hauteur (SERRURE_PLACARD). Trois états :
    « entrouverte » (le décor) sur des serviettes pliées, blanches et bleu pâle ; « fermee », la clé
    de laiton dans la serrure ; « ouverte », le battant rabattu à gauche et l'ouverture
    (OUVERTURE_PLACARD) transparente pour l'effet « embrasure »."""
    rng = random.Random(graine)
    ox0, oy0, ox1, oy1 = OUVERTURE_PLACARD
    fond = (f'<rect width="{W}" height="{H}" fill="url(#mur-placard)"/>'
            f'<rect width="{W}" height="{H}" fill="#d9d1c2" filter="url(#papier)" opacity="0.35"/>'
            f'<rect x="0" y="1230" width="{W}" height="{H - 1230}" fill="#6a5440"/>'
            f'<path d="{trait([(0, 1230), (W, 1230)], 3, rng, 0.02, 0.02, 0.1)}" fill="#2a1a0c" opacity="0.7"/>')
    if etat == "ouverte":
        # l'ouverture est percée dans le mur : l'embrasure y fait paraître un autre lieu
        fond = (f'<path d="M0,0 H{W} V{H} H0 Z M{ox0},{oy0} H{ox1} V{oy1} H{ox0} Z" fill="url(#mur-placard)" fill-rule="evenodd"/>'
                f'<path d="M0,1230 H{W} V{H} H0 Z" fill="#6a5440"/>')
    corps = [f'<rect x="248" y="1100" width="770" height="140" fill="#2a1a0e" opacity="0.4" filter="url(#flou-placard)"/>']
    trou = f"M250,150 H1010 V1190 H250 Z M{ox0},{oy0} V{oy1} H{ox1} V{oy0} Z"      # le trou tourne à l'envers : il reste vide
    corps.append(lavis(trou if etat == "ouverte" else "M250,150 H1010 V1190 H250 Z", "#3e2718", 1.0, "aquarelle-douce"))
    corps.append(lavis("M225,108 H1035 L1022,152 H238 Z", "#5a3a24", 1.0, "aquarelle-douce"))
    corps.append(lavis("M232,152 H1028 V166 H232 Z", "#2a180c", 1.0, "aquarelle-douce"))
    corps.append(lavis("M238,1178 H1022 V1212 H238 Z", "#2a180c", 1.0, "aquarelle-douce"))
    for fx in (262, 978):
        corps.append(lavis(f"M{fx},1212 h26 l-4,26 h-18 Z", "#1e1008", 1.0, "aquarelle-douce"))
    corps.append(f'<path d="{trait([(225, 108), (1035, 108)], 3, rng, 0.02, 0.02, 0.1)}" fill="#140a04" opacity="0.8"/>')
    porte = []
    if etat == "ouverte":
        # l'intérieur de l'armoire autour de l'ouverture, et le battant rabattu à gauche, vu de chant
        corps.append(f'<path d="M305,205 H965 V1125 H305 Z M{ox0},{oy0} H{ox1} V{oy1} H{ox0} Z" fill="#1a0e06" fill-rule="evenodd"/>')
        corps.append(f'<path d="M{ox0},{oy0} H{ox1} V{oy0 + 18} H{ox0 + 18} V{oy1} H{ox0} Z" fill="#000" opacity="0.4"/>')
        corps.append(f'<path d="{trait(droit([(ox0, oy0), (ox1, oy0), (ox1, oy1), (ox0, oy1), (ox0, oy0)]), 3.4, rng, 0.02, 0.02, 0.3)}" fill="#0a0502"/>')
        porte.append(lavis("M305,205 L150,160 L150,1178 L305,1125 Z", "#4a2e1c", 1.0, "aquarelle-douce"))
        porte.append(panneau(176, 250, 282, 612, rng))
        porte.append(panneau(176, 690, 282, 1060, rng))
        porte.append(f'<path d="{trait(droit([(305, 205), (150, 160), (150, 1178), (305, 1125)]), 2.6, rng, 0.02, 0.02, 0.2)}" fill="#140a04" opacity="0.8"/>')
    elif etat == "fermee":
        porte.append(lavis("M305,205 H965 V1125 H305 Z", "#4a2e1c", 1.0, "aquarelle-douce"))
        porte.append(panneau(360, 262, 910, 636, rng))
        porte.append(panneau(360, 712, 910, 1070, rng))
        porte.append(f'<path d="{trait(droit([(305, 205), (965, 205), (965, 1125), (305, 1125), (305, 205)]), 2.6, rng, 0.02, 0.02, 0.2)}" fill="#140a04" opacity="0.8"/>')
    else:
        # entrouverte : le battant tourné vers nous sur ses gonds de gauche ; dans l'entrebâillement,
        # l'intérieur et les serviettes pliées sur leurs étagères
        corps.append(f'<path d="M305,205 H965 V1125 H305 Z" fill="#1a0e06"/>')
        for y in (430, 700, 960):
            corps.append(f'<rect x="700" y="{y}" width="265" height="14" fill="#5a3a24"/>')
            corps.append(serviettes(730, 960, y, rng))
        corps.append(f'<rect x="700" y="205" width="265" height="920" fill="url(#ombre-dedans)"/>')
        porte.append(lavis("M305,205 L760,168 L760,1160 L305,1125 Z", "#4a2e1c", 1.0, "aquarelle-douce"))
        porte.append(f'<g transform="matrix(0.69 -0.056 0 1 305 222)">{panneau(55, 40, 605, 414, rng)}{panneau(55, 490, 605, 848, rng)}</g>')
        porte.append(lavis("M760,168 L780,172 L780,1158 L760,1160 Z", "#2a180c", 1.0, "aquarelle-douce"))
        porte.append(f'<path d="{trait(droit([(305, 205), (760, 168), (760, 1160), (305, 1125)]), 2.6, rng, 0.02, 0.02, 0.2)}" fill="#140a04" opacity="0.8"/>')
    for y in (300, 1030):
        gx = 150 if etat == "ouverte" else 305
        corps.append(f'<rect x="{gx - 6}" y="{y}" width="14" height="46" rx="3" fill="#8a7040"/>')
    sx, sy = SERRURE_PLACARD
    if etat == "fermee":
        porte.append(f'<path d="M{sx - 16},{sy - 44} h32 v88 h-32 Z" fill="#b8923c" stroke="#3a2a10" stroke-width="2"/>')
        porte.append(f'<path d="M{sx},{sy - 18} a6,6 0 1 1 0.1,0 Z M{sx - 4},{sy - 11} h8 l2,20 h-12 Z" fill="#0a0604"/>')
        porte.append(cle_laiton(sx, sy - 6, rng))
    elif etat == "entrouverte":
        porte.append(f'<path d="M{732},{sy - 40} h26 v80 h-26 Z" fill="#b8923c" stroke="#3a2a10" stroke-width="2"/>')
    contenu = fond + "".join(corps) + "".join(porte) + (f'<rect width="{W}" height="{H}" fill="url(#lumiere-placard)"/>' if etat != "ouverte" else
                                                         f'<path d="M0,0 H{W} V{H} H0 Z M{ox0},{oy0} H{ox1} V{oy1} H{ox0} Z" fill="url(#lumiere-placard)" fill-rule="evenodd"/>')
    defs = DEFS_AQUARELLE + """
<linearGradient id="mur-placard" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#e4ddd0"/><stop offset="1" stop-color="#c9c0ae"/>
</linearGradient>
<linearGradient id="ombre-dedans" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#000" stop-opacity="0.65"/><stop offset="1" stop-color="#000" stop-opacity="0.1"/>
</linearGradient>
<linearGradient id="lumiere-placard" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff6e0" stop-opacity="0.12"/><stop offset="1" stop-color="#0a0604" stop-opacity="0.22"/>
</linearGradient>
<filter id="flou-placard" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>"""
    return svg(contenu, defs, None if etat == "ouverte" else "#d9d1c2")


# ---------------------------------------------------------------- 7.6 : le départ de Darshan

def darshan_proche(rng, cx=800, y0=150, k=1.1):
    """Darshan debout, de dos, tout près : les boucles brunes, la nuque, le col de la chemise de lin
    blanc, le gilet de toile moutarde, les manches ; coupé par le cadre à droite et en bas. Une
    silhouette d'encre, sans visage : chaque forme a sa couleur, puis la lumière la multiplie, celle
    du feu, hors champ en bas à gauche, qui monte sur le gilet, et la nuit bleue ailleurs ; un
    liseré de feu sur les contours de gauche. (cx, y0) : le haut de la tête ; k : l'échelle."""
    def P(x, y):
        return (cx + x * k, y0 + (y - 190) * k)

    def forme(pts, n=6):
        return poly(catmull_rom([P(*q) for q in pts] + [P(*pts[0])], n))
    tete = [(-115, 330), (-108, 262), (-70, 212), (0, 192), (72, 210), (112, 258), (120, 330), (112, 398), (88, 446),
            (42, 468), (0, 472), (-44, 468), (-88, 446), (-110, 398)]
    cou = [(-80, 420), (72, 420), (82, 470), (92, 560), (-92, 560), (-82, 470)]
    col = [(-88, 505), (-30, 522), (30, 524), (86, 505), (96, 542), (30, 560), (-30, 560), (-96, 542)]
    chemise = [(-90, 520), (-170, 545), (-250, 570), (-300, 588), (-334, 618), (-352, 680), (-360, 780), (-358, 900),
               (-352, 1050), (-354, 1250), (-362, 1500), (-368, 1900), (368, 1900), (362, 1500), (354, 1250), (352, 1050),
               (358, 900), (360, 780), (352, 680), (334, 618), (300, 588), (250, 570), (170, 545), (90, 520)]
    gilet = [(-86, 550), (0, 560), (86, 550), (150, 558), (212, 576), (226, 650), (230, 760), (262, 812), (268, 1900),
             (-268, 1900), (-262, 812), (-230, 760), (-226, 650), (-212, 576), (-150, 558)]
    oreilles = [[(-108, 318), (-130, 334), (-134, 366), (-120, 392), (-104, 388)],
                [(114, 318), (136, 334), (140, 366), (126, 392), (110, 388)]]
    silhouette = "".join(f'<path d="{forme(f)}"/>' for f in (chemise, cou, tete))
    out = [f'<clipPath id="darshan-proche">{silhouette}</clipPath>', '<g style="isolation:isolate">',
           lavis(forme(chemise), "#e6ddc8", 1.0, "aquarelle-douce"),
           lavis(forme(gilet), "#c8962a", 1.0, "aquarelle"),
           lavis(forme(cou), "#7a4a30", 1.0, "aquarelle-douce")]
    out += [lavis(forme(o, 4), "#7a4a30", 1.0, "aquarelle-douce") for o in oreilles]
    out.append(lavis(forme(col), "#f2ecdc", 1.0, "aquarelle-douce"))
    # les plis de la chemise et du gilet : l'aisselle, la manche, la couture du dos, la martingale
    for pts, l, op in ((((-262, 812), (-268, 1100), (-270, 1400)), 4, 0.5), (((262, 812), (268, 1100), (270, 1400)), 4, 0.5),
                       (((-336, 640), (-318, 720), (-300, 800)), 3, 0.35), (((336, 640), (318, 720), (300, 800)), 3, 0.35),
                       (((-350, 900), (-330, 1000), (-322, 1150)), 2.4, 0.3), (((340, 920), (322, 1020), (318, 1160)), 2.4, 0.3),
                       (((0, 562), (2, 900), (0, 1300), (2, 1900)), 3, 0.45), (((-212, 576), (-226, 650), (-230, 760), (-262, 812)), 3.4, 0.55),
                       (((212, 576), (226, 650), (230, 760), (262, 812)), 3.4, 0.55)):
        out.append(f'<path d="{trait([P(*q) for q in pts], l * k, rng, 0.1, 0.3, 0.3)}" fill="#3a2410" opacity="{op}"/>')
    out.append(lavis(forme([(-226, 1296), (226, 1296), (226, 1346), (-226, 1346)], 2), "#a07420", 1.0, "aquarelle-douce"))
    out.append(f'<path d="{trait([P(-226, 1296), P(-80, 1296), P(80, 1296), P(226, 1296)], 2.4 * k, rng, 0.02, 0.02, 0.2)}" fill="#3a2410" opacity="0.6"/>')
    bx, by = P(-18, 1300)
    out.append(f'<rect x="{bx:.1f}" y="{by:.1f}" width="{36 * k:.1f}" height="{42 * k:.1f}" rx="4" fill="none" stroke="#6a5030" stroke-width="{4 * k:.1f}"/>')
    # la tête : une masse de boucles serrées, jamais de visage
    out.append(lavis(forme(tete), "#1c1412", 1.0, "aquarelle"))
    # la lumière : le feu, en bas à gauche, qui monte ; la nuit bleue en haut et à droite
    out.append('<rect width="1200" height="1800" fill="url(#feu-monte)" clip-path="url(#darshan-proche)" style="mix-blend-mode:multiply"/>')
    out.append('<rect width="1200" height="1800" fill="url(#feu-cote)" clip-path="url(#darshan-proche)" style="mix-blend-mode:multiply"/>')
    out.append('</g>')
    # les boucles, que la nuit éclaire à peine (bleutées), le feu un peu à gauche
    for _ in range(150):
        a = rng.uniform(0, 2 * math.pi)
        r = math.sqrt(rng.uniform(0.0, 1.0))
        x, y = 2 + 104 * r * math.cos(a), 330 + 128 * r * math.sin(a)
        rb = rng.uniform(7, 13)
        b0 = rng.uniform(0, 2 * math.pi)
        boucle = [P(x + rb * math.cos(b0 + i * 0.8), y + rb * math.sin(b0 + i * 0.8)) for i in range(rng.randint(4, 6))]
        feu = x < -50 and y > 330 and rng.random() < 0.6
        out.append(f'<path d="{trait(boucle, rng.uniform(1.8, 2.8) * k, rng, 0.2, 0.4, 0.3)}" '
                   f'fill="{"#5a321e" if feu else "#262434"}" opacity="{0.5 if feu else 0.45}"/>')
    # le liseré du feu sur les contours de gauche, et un peu d'encre sur les autres
    for pts, l, op in ((((-334, 618), (-352, 680), (-360, 780), (-358, 900), (-352, 1050), (-354, 1250), (-362, 1500)), 6, 0.8),
                       (((-250, 570), (-300, 588), (-334, 618)), 4, 0.45),
                       (((-110, 398), (-115, 330), (-108, 262)), 4, 0.35),
                       (((-82, 470), (-90, 524)), 3, 0.4)):
        out.append(f'<path d="{trait([P(*q) for q in pts], l * k, rng, 0.25, 0.35, 0.3)}" fill="#ffae5c" opacity="{op}" filter="url(#halo)"/>')
    for pts, l in ((tete[1:9], 3.5), ([(90, 520), (170, 545), (250, 570), (300, 588), (334, 618), (352, 680), (360, 780)], 3)):
        out.append(f'<path d="{trait([P(*q) for q in pts], l * k, rng, 0.05, 0.3, 0.35)}" fill="{ENCRE}" opacity="0.7"/>')
    return "".join(out)


def marcheur(x, y, h, rng, encre="#140c18"):
    """Darshan au loin, de dos, qui s'éloigne : une petite silhouette d'encre en pied, sans visage
    (x : son milieu, y : le sol sous ses pieds, h : sa hauteur), le pied droit qui se lève, le sac à
    l'épaule, le gilet sur la chemise."""
    s = h / 100.0

    def P(dx, dy):
        return (x + dx * s, y - dy * s)

    def forme(pts, couleur):
        return lavis(poly(catmull_rom([P(*q) for q in pts] + [P(*pts[0])], 4)), couleur, 1.0, "aquarelle-douce")
    out = [f'<ellipse cx="{x:.1f}" cy="{y + 1.5 * s:.1f}" rx="{15 * s:.1f}" ry="{2.6 * s:.1f}" fill="{encre}" opacity="0.35"/>',
           forme([(-7.5, 52), (-2, 52), (-3.2, 26), (-4, 1), (-9.5, 0.5), (-8.6, 26)], encre),
           forme([(1.5, 52), (7, 52), (7.5, 28), (8.2, 9), (3.4, 7), (2.4, 28)], encre),
           forme([(-10, 85), (-13.5, 70), (-12.5, 54), (-9.8, 54), (-10, 70), (-7.5, 82)], "#3a3448"),
           forme([(10, 85), (13.5, 71), (15.5, 56), (12.8, 55.5), (11, 70), (7.5, 82)], "#3a3448"),
           forme([(-10.5, 86), (-4, 90), (4, 90), (10.5, 86), (11, 70), (9, 50), (-9, 50), (-11, 70)], "#4a3818"),
           forme([(-2.8, 90), (2.8, 90), (2.4, 95), (-2.4, 95)], "#2a1a14"),
           f'<circle cx="{P(0, 99)[0]:.1f}" cy="{P(0, 99)[1]:.1f}" r="{6.4 * s:.1f}" fill="#0b0809"/>',
           f'<path d="{trait([P(-8, 88), P(1, 72), P(10, 57)], 1.6 * s, rng, 0.05, 0.05, 0.1)}" fill="#6a4a2a"/>',
           forme([(8.5, 63), (15.5, 62), (16, 51), (9, 51.5)], "#4a3620")]
    return "".join(out)


def saules(rng, encre="#2a1420"):
    """Les saules pleureurs de la passerelle, retracés à l'encre sur le lavis du modèle : quelques
    grosses branches, et les rameaux qui pendent, plus denses en haut et sur les côtés, jamais
    devant le chemin du fond."""
    out = []
    for pts, l in (([(-20, 95), (90, 122), (190, 190), (290, 226), (380, 250)], 15),
                   ([(-20, 330), (80, 346), (190, 380), (270, 410)], 12),
                   ([(-20, 505), (110, 520), (212, 548)], 10),
                   ([(-20, 880), (60, 858), (170, 790), (290, 716)], 11),
                   ([(-20, 700), (90, 642), (200, 600)], 7),
                   ([(700, -20), (736, 110), (790, 200), (900, 262), (1010, 282)], 7),
                   ([(1220, 186), (1100, 160), (980, 150), (900, 140)], 6)):
        out.append(f'<path d="{trait(pts, l, rng, 0.02, 0.5, 0.2)}" fill="{encre}" opacity="0.8"/>')
    # les rameaux, en rideaux pendus aux branches et au haut du cadre ; leurs feuilles étroites
    ancrages = [(40, 120), (150, 170), (260, 220), (360, 250), (60, 340), (180, 380), (100, 520), (200, 560),
                (460, 80), (560, 30), (650, 50), (740, 110), (800, 200), (900, 262), (1000, 282), (1100, 160),
                (980, 150), (1180, 300), (1160, 520), (60, 760), (170, 790), (1120, 700), (300, 40), (860, 20)]
    for ax, ay in ancrages:
        balance = rng.uniform(-36, 36)
        for _ in range(rng.randint(6, 10)):
            x = ax + rng.uniform(-70, 70)
            y0 = ay + rng.uniform(-10, 40)
            longueur = rng.uniform(240, 640)
            if 470 < x < 930:
                longueur = min(longueur, max(140, 1060 - y0))
            pts = [(x, y0), (x + balance * 0.2, y0 + longueur * 0.3), (x + balance * 0.6, y0 + longueur * 0.65),
                   (x + balance, y0 + longueur)]
            op = rng.uniform(0.25, 0.55)
            out.append(f'<path d="{trait(pts, rng.uniform(1.2, 2.6), rng, 0.05, 0.7, 0.3)}" fill="{encre}" opacity="{op:.2f}"/>')
            c = catmull_rom(pts, 8)
            for i in range(4, len(c) - 1, 3):
                (xa, ya), (xb, yb) = c[i], c[i + 1]
                ang = math.atan2(yb - ya, xb - xa) + (0.5 if i % 2 else -0.5)
                lg = rng.uniform(12, 22)
                out.append(f'<path d="{trait([(xa, ya), (xa + lg * math.cos(ang), ya + lg * math.sin(ang))], 3.6, rng, 0.3, 0.6, 0.1)}" '
                           f'fill="{encre}" opacity="{op * 0.8:.2f}"/>')
    return "".join(out)


def depart(plan="proche", modele=None, image=None, graine=103):
    """7.6 : « proche » : Darshan de dos, tout près, debout près du feu, coupé par le cadre, la
    lueur du feu sur son gilet ; une silhouette d'encre, sans modèle, jamais de visage ; derrière lui,
    le Periyar le soir, l'autre rive et ses cocotiers. « loin » : la passerelle et les saules de
    36652487, au soir, dessinés d'après le modèle (image : son lavis du soir, préparé par decors.py,
    l'homme de la photo effacé) ; la barrière et le chemin retracés à l'encre ; Darshan, petite
    silhouette d'encre qui s'éloigne sur le chemin, au-delà de la barrière. Tout ce qui compte tient
    au-dessus du panneau de texte (y 1 330)."""
    rng = random.Random(graine)
    if plan == "loin":
        encre = "#22101c"
        out = [photo_svg(image), saules(rng)]
        # les garde-corps de la passerelle : la main courante, les montants
        for x0, y0, x1, y1, pas in ((300, 1338, 580, 1316, 26), (846, 1312, 1240, 1300, 30)):
            out.append(f'<path d="{trait(droit([(x0, y0), (x1, y1)]), 7, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.8"/>')
            for xx in range(x0 + 14, x1, pas):
                yy = y0 + (y1 - y0) * (xx - x0) / (x1 - x0)
                out.append(f'<path d="{trait([(xx, yy + 8), (xx + rng.uniform(-3, 3), 1850)], rng.uniform(1.6, 2.8), rng, 0.02, 0.02, 0.2)}" '
                           f'fill="{encre}" opacity="0.35"/>')
        # le tablier : ses bords, son caillebotis
        out.append(f'<path d="{trait(droit([(582, 1578), (486, 1850)]), 4, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.7"/>')
        out.append(f'<path d="{trait(droit([(844, 1574), (1110, 1850)]), 4, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.7"/>')
        for k, y in enumerate((1600, 1628, 1662, 1704, 1754, 1812)):
            t = (y - 1576) / 274
            out.append(f'<path d="{trait(droit([(582 - 96 * t, y), (844 + 266 * t, y)]), 1.6 + k * 0.3, rng, 0.05, 0.05, 0.2)}" '
                       f'fill="{encre}" opacity="0.28"/>')
        # le chemin au-delà de la barrière, qui monte sous les saules : ses bords, sa terre
        for pts in (((598, 1470), (594, 1400), (588, 1330)), ((580, 1300), (566, 1240), (546, 1190)),
                    ((838, 1466), (820, 1400), (806, 1336)), ((812, 1296), (828, 1240), (856, 1196))):
            out.append(f'<path d="{trait(list(pts), 2.6, rng, 0.3, 0.5, 0.5)}" fill="{encre}" opacity="0.3"/>')
        for _ in range(46):
            y = rng.uniform(1170, 1468)
            t = (1470 - y) / 300
            xa = 600 - 60 * t * t + rng.uniform(0, 40)
            xb = 840 + 30 * t * t - rng.uniform(0, 40)
            x = rng.uniform(xa, xb - 30)
            out.append(f'<path d="{trait([(x, y), (x + rng.uniform(14, 40), y + rng.uniform(-2, 2))], rng.uniform(1.2, 2.6), rng, 0.3, 0.4, 0.3)}" '
                       f'fill="{encre}" opacity="{rng.uniform(0.15, 0.3):.2f}"/>')
        # le panneau rond sur son poteau, à gauche du chemin
        out.append(f'<circle cx="510" cy="1236" r="46" fill="{encre}" opacity="0.35" filter="url(#aquarelle-douce)"/>')
        out.append(f'<circle cx="510" cy="1236" r="46" fill="none" stroke="{encre}" stroke-width="4" opacity="0.8"/>')
        out.append(f'<path d="{trait([(512, 1282), (518, 1326)], 5, rng, 0.02, 0.02, 0.1)}" fill="{encre}" opacity="0.8"/>')
        # Darshan, au loin, sur le chemin
        out.append(marcheur(708, 1300, 104, rng))
        # la barrière du bout de la passerelle
        for pts, l_ in ((((586, 1478), (843, 1472)), 5), (((590, 1562), (840, 1558)), 4), (((716, 1470), (718, 1574)), 6),
                        (((594, 1484), (710, 1556)), 3), (((594, 1556), (710, 1484)), 3), (((724, 1480), (838, 1554)), 3),
                        (((724, 1554), (838, 1478)), 3)):
            out.append(f'<path d="{trait(list(pts), l_, rng, 0.05, 0.05, 0.2)}" fill="{encre}" opacity="0.8"/>')
        out.append(f'<rect width="{W}" height="{H}" fill="url(#soir-bords)"/>')
        defs = DEFS_AQUARELLE + """
<radialGradient id="soir-bords" cx="0.56" cy="0.66" r="0.78">
  <stop offset="0.45" stop-color="#1a0c1c" stop-opacity="0"/><stop offset="1" stop-color="#1a0c1c" stop-opacity="0.45"/>
</radialGradient>"""
        return svg("".join(out), defs, "#2a1a2a")
    # proche : le fleuve le soir, derrière lui
    out = [f'<rect width="{W}" height="{H}" fill="url(#soir-fleuve)"/>']
    for _ in range(40):
        x, y = rng.uniform(0, W), rng.uniform(0, 520)
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rng.uniform(0.8, 1.8):.1f}" fill="#f4e6c8" opacity="{rng.uniform(0.3, 0.8):.2f}"/>')
    out.append(lavis(poly([(-40, 842), (200, 830), (520, 838), (900, 826), (1240, 834), (1240, 900), (-40, 904)]), "#0b0c18", 1.0, "aquarelle-douce"))
    for x, h in ((-30, 330), (90, 420), (250, 300), (420, 380), (960, 360), (1150, 410)):
        out.append(palmier(x, 846, h, rng, "#07070f", "#0e1220"))
    out.append(lavis(poly([(-40, 896), (1240, 890), (1240, 1250), (-40, 1260)]), "#141628", 1.0, "aquarelle-douce"))
    for k in range(14):
        y = 910 + k * 24
        xa = rng.uniform(40, 200)
        out.append(f'<path d="{trait([(xa, y), (xa + rng.uniform(80, 260), y + rng.uniform(-3, 3))], rng.uniform(2, 5), rng, 0.3, 0.3, 0.4)}" '
                   f'fill="#ff9a50" opacity="{0.12 + k * 0.022:.3f}"/>')
    out.append(lavis(poly([(-40, 1240), (1240, 1230), (1240, 1860), (-40, 1860)]), "#1a120e", 1.0, "aquarelle-douce"))
    # des étincelles qui montent du feu, hors champ en bas à gauche
    for _ in range(26):
        x, y = rng.uniform(20, 380), rng.uniform(640, 1700)
        r = rng.uniform(1.6, 3.4)
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r * 2.6:.1f}" fill="#ff8a30" opacity="0.25" filter="url(#halo)"/>')
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#ffd08a" opacity="{rng.uniform(0.6, 0.95):.2f}"/>')
    out.append(f'<rect width="{W}" height="{H}" fill="url(#feu-sol)" style="mix-blend-mode:screen"/>')
    out.append(darshan_proche(rng))
    out.append(f'<rect width="{W}" height="{H}" fill="url(#nuit-bords)"/>')
    defs = DEFS_AQUARELLE + FILTRE_ENCRE + """
<linearGradient id="soir-fleuve" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0b0d22"/><stop offset="0.3" stop-color="#1c1a3a"/><stop offset="0.47" stop-color="#4a3048"/>
  <stop offset="0.5" stop-color="#2a1e30"/>
</linearGradient>
<radialGradient id="feu-sol" gradientUnits="userSpaceOnUse" cx="120" cy="1880" r="1100">
  <stop offset="0" stop-color="#ff8a3c" stop-opacity="0.8"/><stop offset="0.45" stop-color="#c24a1c" stop-opacity="0.3"/>
  <stop offset="1" stop-color="#c24a1c" stop-opacity="0"/>
</radialGradient>
<linearGradient id="feu-monte" gradientUnits="userSpaceOnUse" x1="0" y1="1800" x2="0" y2="150">
  <stop offset="0" stop-color="#ffb46a"/><stop offset="0.36" stop-color="#c8704a"/><stop offset="0.6" stop-color="#6a4a5c"/>
  <stop offset="0.8" stop-color="#2e2c44"/><stop offset="1" stop-color="#1e2034"/>
</linearGradient>
<linearGradient id="feu-cote" gradientUnits="userSpaceOnUse" x1="380" y1="0" x2="1200" y2="0">
  <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#7a82a0"/>
</linearGradient>
<radialGradient id="nuit-bords" cx="0.5" cy="0.42" r="0.85">
  <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
</radialGradient>"""
    return svg("".join(out), defs, "#0b0d22")


# ---------------------------------------------------------------- 2.10 : l'esquisse du théâtre

def vision_theatre(etape=None):
    """2.10 : l'esquisse que Darshan rêve sur le ciel du soir (effet « esquisse ») : un SVG vectoriel,
    fond transparent, que le moteur trace trait par trait. Chemins groupés par étape
    (<g data-etape="1">, puis "2") ; chaque trait a pathLength="1", pour le tracer avec
    stroke-dasharray et stroke-dashoffset ; les lavis (class « lavis ») paraissent en fondu. Étape 1 :
    son nuage (des volutes, un lavis crème). Étape 2 : la pièce qu'il rêve, posée dessus : une haute
    fenêtre ouverte sur la nuit, entre deux hauts rideaux noués (ceux de « fenetre ») et un voilage
    crème ; deux toiles sur un chevalet ; deux petites silhouettes sans visage, les mains jointes ; un
    seul point vermillon, le chouchou de la petite silhouette de Julie. Tout tient entre x 200 et
    1 000, y 150 et 800. etape : 1 ou 2 pour n'avoir que celle-là (sinon les deux)."""
    encre = "#07091a"

    def t(d, largeur=2.2):
        return (f'<path d="{d}" fill="none" stroke="{encre}" stroke-width="{largeur}" stroke-linecap="round" '
                f'stroke-linejoin="round" pathLength="1"/>')

    def l(d, couleur, op):
        return f'<path class="lavis" d="{d}" fill="{couleur}" opacity="{op}"/>'
    # étape 1 : le nuage
    bosses = [(236, 752, 36), (280, 700, 52), (350, 668, 58), (430, 650, 62), (512, 640, 60), (592, 640, 64),
              (672, 646, 60), (748, 654, 58), (822, 670, 54), (888, 694, 48), (944, 730, 38)]
    haut = f"M214,770 " + " ".join(f"A{r},{r} 0 0 1 {x + r * 0.9:.0f},{y - r * 0.1:.0f}" for x, y, r in bosses)
    nuage = f"{haut} L968,772 C860,792 360,794 214,770 Z"
    etape1 = [l(nuage, "#f3e6c8", 0.6), t(haut, 2.6), t("M214,770 C360,794 860,792 968,772", 2.0)]
    for cx, cy, r in ((330, 720, 20), (520, 690, 24), (720, 700, 22), (880, 736, 16)):
        etape1.append(t(f"M{cx + r},{cy} a{r},{r} 0 1 0 {-r * 0.4:.0f},{r * 0.9:.0f} a{r * 0.55:.0f},{r * 0.55:.0f} 0 1 0 {-r * 0.3:.0f},{-r * 0.8:.0f}", 1.6))
    # étape 2 : la pièce rêvée
    etape2 = []
    etape2.append(l("M476,196 H724 V602 H476 Z", "#1b2340", 0.5))
    for x, y in ((520, 250), (600, 232), (668, 286), (548, 332), (690, 380), (512, 420)):
        etape2.append(f'<circle class="lavis" cx="{x}" cy="{y}" r="2.4" fill="#f4e8c0" opacity="0.9"/>')
    etape2.append(t("M476,602 V196 H724 V602", 2.4))
    etape2.append(t("M600,196 V602", 1.6))
    etape2.append(t("M476,470 H724", 1.4))
    etape2.append(t("M420,176 H780", 2.6))
    for s in (-1, 1):
        def X(v):
            return 600 + s * v
        rideau_ = (f"M{X(176)},{176} C{X(170)},{280} {X(150)},{360} {X(128)},{420} C{X(150)},{500} {X(172)},{570} {X(186)},{640} "
                   f"L{X(236)},{640} C{X(222)},{560} {X(186)},{480} {X(150)},{420} C{X(200)},{350} {X(222)},{260} {X(226)},{176} Z")
        etape2.append(l(rideau_, "#1b2848", 0.3))
        etape2.append(t(f"M{X(176)},176 C{X(170)},280 {X(150)},360 {X(128)},420 C{X(150)},500 {X(172)},570 {X(186)},640", 2.2))
        etape2.append(t(f"M{X(226)},176 C{X(222)},260 {X(200)},350 {X(150)},420 C{X(186)},480 {X(222)},560 {X(236)},640", 2.2))
        etape2.append(t(f"M{X(118)},414 Q{X(140)},432 {X(162)},414", 2.0))
        etape2.append(l(f"M{X(124)},200 L{X(96)},200 L{X(100)},600 L{X(124)},600 Z", "#f6ecd6", 0.55))
    # le chevalet et ses deux toiles, à gauche
    etape2.append(t("M300,700 L330,420 L360,700", 2.0))
    etape2.append(t("M330,420 L338,700", 1.6))
    etape2.append(l("M286,452 H372 V548 H286 Z", "#f3e6c8", 0.55))
    etape2.append(t("M286,452 H372 V548 H286 Z", 1.8))
    etape2.append(t("M298,560 H384 V640 H298 Z", 1.8))
    etape2.append(t("M300,504 C320,480 340,520 362,492", 1.4))
    # les deux petites silhouettes, les mains jointes
    etape2.append(t("M584,520 m-12,0 a12,12 0 1 0 24,0 a12,12 0 1 0 -24,0", 2.0))
    etape2.append(t("M584,534 C580,580 574,620 566,690", 2.4))
    etape2.append(t("M584,548 C596,566 606,580 614,592", 1.8))
    etape2.append(t("M646,498 m-14,0 a14,14 0 1 0 28,0 a14,14 0 1 0 -28,0", 2.0))
    etape2.append(t("M646,514 C650,570 654,630 662,700", 2.6))
    etape2.append(t("M644,532 C634,556 624,576 616,592", 1.8))
    etape2.append(f'<circle class="vermillon" cx="590" cy="510" r="4.5" fill="{VERMILLON}"/>')
    groupes = []
    if etape in (None, 1):
        groupes.append(f'<g data-etape="1">{"".join(etape1)}</g>')
    if etape in (None, 2):
        groupes.append(f'<g data-etape="2">{"".join(etape2)}</g>')
    return svg("".join(groupes))


if __name__ == "__main__":
    import pathlib
    dossier = pathlib.Path(__file__).parent / "src" / "img"
    for nom, f in (("ciel-nuit", lambda: scene_toits(calque="ciel")), ("ville", lambda: scene_toits(calque="ville")),
                   ("toits", scene_toits), ("porte", scene_porte), ("aluva", scene_aluva)):
        (dossier / f"{nom}.svg").write_text(f(), encoding="utf-8")
        print(nom, "écrit")
