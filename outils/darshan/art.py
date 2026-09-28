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


def scene_aluva(seed=23):
    """Aluva : la cabane à kayaks ouverte sur le Periyar."""
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
    dedans.append(f'<path d="{trait([(870, 1462), (935, 1448), (1004, 1455)], 8, rng, 0.04, 0.7, 0.1)}" fill="#d9dde2"/>')
    dedans.append(f'<path d="{trait([(1004, 1455), (1034, 1460)], 10, rng, 0.1, 0.1, 0.1)}" fill="#3b2412"/>')
    contenu = ("".join(dehors) + "".join(dedans) +
               f'<rect width="{W}" height="{H}" filter="url(#papier)" opacity="0.12"/>')
    defs = """
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
<filter id="flou-soleil" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="45"/></filter>
<linearGradient id="ciel-kerala" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f1a36e"/><stop offset="0.45" stop-color="#f6c98a"/><stop offset="1" stop-color="#fbe6b8"/>
</linearGradient>
<linearGradient id="profondeur" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#bfe6d8" stop-opacity="0.35"/><stop offset="1" stop-color="#0d3433" stop-opacity="0.45"/>
</linearGradient>
<clipPath id="mur"><path clip-rule="evenodd" d="M0,0 H1200 V1800 H0 Z M190,310 H1010 V1520 H190 Z"/></clipPath>
<radialGradient id="lumiere-entree" cx="0.5" cy="0.62" r="0.6">
  <stop offset="0.3" stop-color="#ffcf87" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
</radialGradient>"""
    return svg(contenu, defs, "#efe4cc")


if __name__ == "__main__":
    import pathlib
    dossier = pathlib.Path(__file__).parent / "src" / "img"
    for nom, f in (("ciel-nuit", lambda: scene_toits(calque="ciel")), ("ville", lambda: scene_toits(calque="ville")),
                   ("toits", scene_toits), ("porte", scene_porte), ("aluva", scene_aluva)):
        (dossier / f"{nom}.svg").write_text(f(), encoding="utf-8")
        print(nom, "écrit")
