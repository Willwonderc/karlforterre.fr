"""Darshan jouable : les réglages de production de chaque tableau.

Le découpage (decoupage.py) dit ce que contient chaque tableau : son texte, ses gestes et ses
moments, chacun rattaché à une phrase du livre. Ce fichier dit comment le jouer : le décor,
la place du texte, la mécanique de chaque geste (dans l'ordre des gestes du découpage), l'effet
de chaque moment (dans l'ordre des moments du découpage), les objets gagnés ou perdus et les
portes franchies. build.py réunit les deux et fabrique le livre.

Vocabulaire : G(mécanique, …) pour un geste ; E(effet, …) pour un effet. Les mécaniques et
les effets sont ceux du moteur (src/js/mecaniques.js et src/js/effets.js). Les consignes des
gestes, les noms des lieux et des portes sont des textes d'interface : ils sont dans
interface.ini, que Karl valide et corrige (docs/plan-darshan-interface.md, section 9).
"""


def G(meca, **reglages):
    """Un geste : sa mécanique et ses réglages ; `effets` : ce qui suit le geste. Sa consigne est
    dans interface.ini, rubrique [consignes], sous la clé « tableau.numéro du geste ».
    Le geste se fait avant la phrase qui le raconte (le lecteur agit, le texte confirme) ;
    apres=True le place juste après (le texte annonce, le lecteur agit)."""
    return dict(meca=meca, **reglages)


def E(nom, **reglages):
    """Un effet du moteur, avec ses réglages."""
    return dict(nom=nom, **reglages)


# ---------------------------------------------------------------- les décors
# Chaque décor devient src/img/decors/<nom>.webp (1600 x 2400) par images.py, sauf les décors
# du prototype, déjà faits, et les fonds unis. « photo » : photo de Karl telle quelle (monde de
# Julie) ; « encre » : photo de Karl passée à l'encre et à l'aquarelle (monde de Darshan) ;
# « dessin » : dessin procédural d'art.py ; x, y : position du cadre dans la photo (0 à 1) ;
# zoom : agrandissement avant recadrage.
def photo(numero, x=0.5, y=0.5, zoom=1.0, **reglages):
    return dict(type="photo", photo=numero, x=x, y=y, zoom=zoom, **reglages)


def encre(numero, x=0.5, y=0.5, zoom=1.0, **reglages):
    return dict(type="encre", photo=numero, x=x, y=y, zoom=zoom, **reglages)


def dessin(fonction, **reglages):
    return dict(type="dessin", fonction=fonction, **reglages)


def prototype(*fichiers):
    return dict(type="prototype", fichiers=list(fichiers))


def uni(couleur):
    return dict(type="uni", couleur=couleur)


DECORS = {
    # --- monde de Darshan : les décors du prototype
    "ciel-poeme": prototype("ciel-poeme.jpg"),
    "toits": prototype("ciel-nuit.jpg", "ville.webp"),
    "tuiles": prototype("ciel-nuit.jpg", "ville.webp"),
    "porte-pigeonnier": prototype("porte.jpg"),
    "aluva": prototype("aluva.jpg"),
    # --- monde de Darshan : photos de Karl passées à l'encre
    "periyar": encre(10310851, x=0.35),
    "periyar-soir": encre(10220497, x=0.45, soir=True),
    "local-nuit": dessin("local_nuit"),
    "portes-1": encre(34762346),
    "portes-2": encre(27046156, x=0.5),
    "portes-3": encre(27025911, x=0.5),
    "portes-4": encre(32429264),
    "portes-5": encre(32429190, x=0.5),
    "portes-6": encre(39434691),
    "mur-terre": dessin("mur_terre"),
    "voies": encre(13087478, x=0.5),
    "cosmos": dessin("cosmos_portes"),
    "parvis": encre(23414381, x=0.55),
    "bibliotheque": encre(27025915, x=0.5),
    "pekin": dessin("bibliotheque_pekin"),
    "porte-pere": encre(34762346),
    "marche": encre(31514837, x=0.5),
    "facade": encre(33035628, x=0.2),
    "desert-nuit": dessin("desert", nuit=True),
    "desert-jour": dessin("desert", nuit=False),
    "fleurs": encre(35086239, x=0.5),
    "feu": encre(22591346, x=0.55),
    "papier-lettre": dessin("papier_lettre"),
    "lac": encre(34342149, x=0.5),
    "toiles": dessin("toiles"),
    "noir": uni("#020206"),
    "papier": uni("#f4ecdc"),
    # --- monde de Julie : photos de Karl telles quelles
    "restaurant-table": photo(29654800, x=0.55),
    "assiette": photo(29654800, x=0.28, y=0.85, zoom=1.7),
    "vitrine": photo(38279517, x=0.62),
    "deux-flous": photo(34876053, x=0.5),
    "dessert": photo(29188525, x=0.5),
    "rocaille": photo(10524140, x=0.62),
    "amoureux": photo(31514847, x=0.32),
    "maison-lierre": photo(10199772, x=0.22),
    "seuil-nuit": photo(34978560),
    "ciel-paris": photo(33035642, x=0.5),
    "metro": photo(33035627),
    "neon": photo(39632230, x=0.42),
    "rer": photo(33035652, x=0.5),
    "cafes": photo(36117556),
    "rue-dos": photo(33035648, x=0.47),
    "etudiants": photo(18458017, x=0.8),
    "carrefour": photo(10355467, x=0.62),
    "campagne": photo(13087478, x=0.5),
    "chambre": photo(10879428, x=0.45),
    "lit-telephone": photo(38256669, x=0.5),
    "bonbons": photo(29360492, x=0.5),
    "croque": photo(6858270, x=0.5),
    "lune": photo(13102252, x=0.62),
    "rue-floue": photo(16592454, x=0.45),
    "reflet-paris": photo(38279684, x=0.5),
    "canneles": photo(10369144, x=0.5),
    "haussmann": photo(33035628, x=0.2),
    "porte-bleue": photo(32429264),
    "patere": photo(38570569, x=0.5),
    "appartement": photo(35136159, x=0.55),
    "fenetre": dessin("fenetre", photo=12443176),
    "the": photo(37296469),
    "graffiti": photo(38570603, x=0.4),
    "phare": photo(34894953, x=0.5),
    "mont-saint-michel": photo(34849705),
    "villandry": photo(38694057, x=0.5),
    "banquise": photo(10644439, x=0.55),
    "rochers": photo(35024039, x=0.5),
    "verdure": photo(32429189),
    "petales": photo(11968793, x=0.5),
    "glacon": photo(35760712),
    "couloir": photo(35375606, x=0.5),
    "banc": photo(23414383, x=0.5),
    "voiture": photo(39423920),
    "fantomes": photo(31641251, x=0.5),
    "rue-vide": photo(10473138, x=0.72),
    "pave": photo(12073837, x=0.45),
}

# ---------------------------------------------------------------- les portes du carnet
# Chaque porte franchie s'allume sur une carte du ciel. Lieux : longitude et latitude ; la porte
# du père n'a pas de lieu (étoile à part, en haut de la carte). Noms des lieux et libellés des
# portes : interface.ini, rubriques [lieux] et [portes].
LIEUX = {
    "paris": (2.35, 48.86),
    "aluva": (76.35, 10.11),
    "pekin": (116.4, 39.9),
    "desert": (25.0, 25.0),
}
PORTES = {                     # porte : (lieu de départ, lieu d'arrivée)
    "pigeonnier": ("paris", "aluva"),
    "local-paris": ("aluva", "paris"),
    "pekin": ("pekin", "aluva"),
    "pere": (None, None),
    "appartement": ("paris", "paris"),
    "placard": ("paris", "paris"),
    "local-pharmacie": ("aluva", "paris"),
}


# ---------------------------------------------------------------- les tableaux
def S(decor, texte="bas", special=None, gestes=(), moments=(), extra=None, debut=(), coupes=None, bilan=()):
    """Réglages d'un tableau.
    decor : un nom de DECORS, ou une liste (le premier d'abord ; l'effet « decor » passe aux suivants).
    texte : place et ton du panneau de texte (« bas », « haut », « bas clair », « nu », « lettre »…).
    special : scène écrite à la main dans le moteur (le prototype, quelques temps forts).
    gestes : un G par geste du découpage, dans l'ordre. moments : un E (ou une liste, ou None)
    par moment du découpage, dans l'ordre. extra : {début de phrase : E ou liste} pour des effets
    rattachés à d'autres phrases. debut : effets joués à l'entrée du tableau. coupes : {paragraphe :
    [débuts de phrase]} pour découper le texte en temps à la main. bilan : changements d'objets
    et de portes que fait une scène spéciale (pour calculer l'état des pages suivantes)."""
    return dict(decor=decor if isinstance(decor, list) else [decor], texte=texte, special=special,
                gestes=list(gestes), moments=list(moments), extra=extra or {}, debut=list(debut),
                coupes=coupes or {}, bilan=list(bilan))


SCENES = {
    # ============================================================ ouverture
    "0.1": S("ciel-poeme", special="seuil"),
    "0.2": S("ciel-poeme", texte="poeme", special="poeme", moments=[E("aube")]),

    # ============================================================ 1. Un ciel mouvant
    "1.1": S("toits", special="toit", moments=[E("filantes"), E("voix")],
             coupes={19: ["Il est d’un régal"], 20: ["Comme toi je vis", "Encore une fois"]}),
    "1.2": S("tuiles", special="tuiles", coupes={21: ["Il enjambe", "Ses lunettes fumées"]},
             gestes=[G("rythme", n=5)],
             moments=[E("objet+", id="lunettes")]),
    "1.3": S("porte-pigeonnier", texte="haut", special="pigeonnier",
             coupes={22: ["Face à l’assemblage", "Les tenant par la branche", "D’un geste vif", "Elle est adaptée",
                          "Elle est affrétée", "À peine insérée"], 23: ["Il ne reste qu’à la pousser"]},
             gestes=[G("toucher"), G("glisser"),
                     G("porter"), G("toucher"),
                     G("toucher")],
             moments=[E("vibre"), E("eclat", objet="cle"), E("jour")],
             bilan=[E("remplacer", de="lunettes", vers="cle"), E("porte", id="pigeonnier")]),
    "1.4": S("aluva", texte="bas clair", coupes={23: ["Face à lui s’écoule"]},
             debut=[E("eblouir"), E("remplacer", de="cle", vers="lunettes", discret=True)],
             gestes=[G("toucher", cible=[938, 1470, 150], effets=[E("frisson", x=938, y=1470)]),
                     G("tracer", chemin=[[430, 1030], [520, 985], [600, 1010], [680, 985], [770, 1030]])],
             moments=[E("poussiere"), E("eclabousse")]),
    "1.5": S("periyar", moments=[E("eclabousse"), None]),
    "1.6": S("periyar"),
    "1.7": S("periyar",
             gestes=[G("remuer", images=["rue-vide", "pave", "rue-floue", "reflet-paris"])],
             moments=[E("reflet", image="rue-vide"), E("reflet", image="pave")]),
    "1.8": S("periyar", gestes=[G("glisser", sens="bas")]),
    "1.9": S("periyar",
             gestes=[G("toucher", effets=[E("objet+", id="montre")]),
                     G("toucher", effets=[E("eclat-court", de="lunettes", vers="cle"), E("porte", id="local-paris")])]),

    # ============================================================ 2. Un pain perdu s'il vous plaît.
    "2.1": S("restaurant-table", debut=[E("remplacer", de="cle", vers="lunettes", discret=True)],
             gestes=[G("caresser")]),
    "2.2": S("vitrine", gestes=[G("maintenir", duree=2200, battement=True)],
             moments=[E("balance")]),
    "2.3": S("deux-flous", gestes=[G("toucher", effets=[E("flou")])]),
    "2.4": S("restaurant-table", extra={"Tes projets se passent bien Darshan": E("assourdi")},
             gestes=[G("toucher", effets=[E("net")])]),
    "2.5": S("restaurant-table", moments=[None]),
    "2.6": S(["restaurant-table", "assiette"],
             gestes=[G("glisser", sens="bas", effets=[E("decor", i=1)])]),
    "2.7": S("dessert", gestes=[G("carte", ligne="Un pain perdu s’il vous plaît.")],
             moments=[None]),
    "2.8": S(["rocaille", "amoureux", "maison-lierre"],
             gestes=[G("glisser", sens="haut", effets=[E("avance")])],
             moments=[E("decor", i=1), E("decor", i=2)]),
    "2.9": S(["maison-lierre", "seuil-nuit"], gestes=[G("maintenir", duree=1800)],
             moments=[E("decor", i=1), E("envol-vue")]),
    "2.10": S("ciel-paris", moments=[E("nuage")]),

    # ============================================================ 3. Entre deux mondes
    "3.1": S("cosmos"),
    "3.2": S(["portes-1", "portes-2", "portes-3", "portes-4", "portes-5", "portes-6", "mur-terre"],
             debut=[E("diaporama", jusqua=5, intervalle=2600)],
             extra={"Sa conscience prend racine": E("decor", i=6)},
             gestes=[G("toucher", cible=[600, 1010, 170],
                       effets=[E("frisson", x=600, y=1010), E("entree", x=600, y=1010)])]),
    "3.3": S("voies"),
    "3.4": S("cosmos", gestes=[G("pincer", effets=[E("pli")])],
             moments=[E("fiche", objet="lunettes")]),
    "3.5": S("parvis", moments=[E("voix")]),
    "3.6": S(["bibliotheque", "pekin"], extra={"Les avancées sont rares": E("decor", i=1)},
             gestes=[G("glisser", sens="haut", effets=[E("poussiere")])]),
    "3.7": S("pekin", gestes=[G("toucher", n=3, effet="page")],
             moments=[E("calligraphie"), E("calligraphie", carnet=True)]),
    "3.8": S("pekin", gestes=[G("toucher", cible=[600, 1180, 170],
                                effets=[E("objet+", id="recueil"), E("eclat-court", de="lunettes", vers="cle"),
                                        E("porte", id="pekin")])]),
    "3.9": S("periyar-soir", debut=[E("remplacer", de="cle", vers="lunettes", discret=True)],
             gestes=[G("deux-pouces", duree=2600)]),
    "3.10": S(["noir", "porte-pere"], gestes=[G("respirer", n=3)],
              moments=[E("couleur"), [E("decor", i=1), E("lanterne")]]),
    "3.11": S("porte-pere", gestes=[G("tendre")],
              moments=[[E("lanterne-eteinte"), E("porte", id="pere")]]),
    "3.12": S("periyar"),
    "3.13": S("periyar"),
    "3.14": S("periyar", gestes=[G("semer", n=4)],
              moments=[E("compte", valeur="quatre jours")]),

    # ============================================================ 4. Amélie et Julie
    "4.1": S("metro"),
    "4.2": S("neon", gestes=[G("curseur", mini=0, maxi=10, apres=True)],
             moments=[E("vers")]),
    "4.3": S(["rer", "cafes"], extra={"On s’est vues trente minutes": E("decor", i=1)},
             gestes=[G("messages")]),
    "4.4": S(["rue-dos", "etudiants"], extra={"Les étudiants vivent leur vie": E("decor", i=1)},
             gestes=[G("glisser", sens="haut")]),
    "4.5": S(["carrefour", "campagne"],
             gestes=[G("glisser", sens="haut", effets=[E("decor", i=1)])]),
    "4.6": S("vitrine", moments=[None]),
    "4.7": S("chambre", debut=[E("objet+", id="telephone", sac="julie", discret=True)],
             gestes=[G("contact", nom="Darshan")],
             moments=[E("compte", valeur="quatre jours")]),

    # ============================================================ 5. Douceurs et confettis
    "5.1": S("chambre", gestes=[G("toucher", effets=[E("lueur")])],
             moments=[E("compte", valeur="soixante-douze heures")]),
    "5.2": S("marche", gestes=[G("etals", objets=["thes", "curcuma", "encens", "jarres", "tapisseries"])]),
    "5.3": S("marche", moments=[E("boussole")]),
    "5.4": S("marche"),
    "5.5": S("marche", extra={"Elle va passer la porte marbrée": E("vignette", image="facade")},
             gestes=[G("toucher", effets=[E("confettis"), E("objet+", id="confettis")])]),
    "5.6": S("lit-telephone", gestes=[G("galerie", images=["bonbons", "croque"], apres=True)]),
    "5.7": S("lit-telephone", gestes=[G("lunettes-photos",
                                        images=["rue-floue", "reflet-paris", "lune"])],
             moments=[E("video-lune")]),
    "5.8": S("chambre", gestes=[G("rythme", n=8, effet="pas")]),
    "5.9": S(["chambre", "lune"], gestes=[G("synchro", n=6)],
             moments=[E("eclair"), E("decor", i=1)]),
    "5.10": S(["rue-floue", "canneles"], extra={"Quel serait son meilleur ambassadeur": E("decor", i=1)},
              gestes=[G("galerie", images=["canneles", "dessert", "cafes"], apres=True)]),
    "5.11": S("dessert", gestes=[G("essuyer")],
              moments=[[E("objet+", id="ticket", sac="julie"), E("compte", valeur="onze heures, treize heures")]]),

    # ============================================================ 6. Des attentes de part et d'autre
    "6.1": S("rue-dos", debut=[E("remplacer", de="ticket", vers="paquet", sac="julie", discret=True)],
             moments=[E("ruban")]),
    "6.2": S(["facade", "rue-dos"], special="listes",
             gestes=[G("liste", cote="darshan",
                       items=["Veste", "barbiche comme il faut", "bague", "chemise des grands jours"]),
                     G("liste", cote="julie",
                       items=["Bague", "boucles d’oreilles", "gâteau", "sac à main", "maquillage des grands jours", "frange qui décoiffe"])],
             moments=[None]),
    "6.3": S("haussmann", moments=[E("halo")]),
    "6.4": S("porte-bleue", extra={"Darshan pose sur son nez une paire de binocles": E("remplacer", de="lunettes", vers="binocles")},
             gestes=[G("toucher", cible=[600, 1000, 220], effets=[E("porte", id="appartement")])]),
    "6.5": S(["appartement", "patere"], extra={"Il l’accroche": E("decor", i=1)},
             gestes=[G("porter", objet="veste", depart=[330, 1300], cible=[640, 760, 170]),
                     G("maintenir", duree=1500)]),
    "6.6": S(["appartement", "toiles"], extra={"L’encens et le thé sont servis": [E("objet-", id="encens"), E("objet-", id="thes"), E("decor", i=1)]},
             gestes=[G("tracer", chemin=[[240, 1250], [380, 1080], [560, 1150], [760, 960], [960, 1020]])]),
    "6.7": S(["appartement", "fenetre"], gestes=[G("toucher", effets=[E("decor", i=1)])]),
    "6.8": S(["the", "lac"], gestes=[G("verser")],
             moments=[E("decor", i=1)]),
    "6.9": S("appartement"),
    "6.10": S("appartement", gestes=[G("maintenir", duree=1500)]),
    "6.11": S("appartement", gestes=[G("attendre", duree=10000, apres=True)],
              moments=[None, E("eclat-brise", objet="cle"), E("portes-vides")]),
    "6.12": S("appartement", gestes=[G("portes", images=["phare", "campagne", "mont-saint-michel", "villandry", "banquise", "rochers"])],
              moments=[E("fonte")]),
    "6.13": S(["appartement", "verdure"], extra={"il insère une clé de laiton": E("frisson")},
              gestes=[G("main")],
              moments=[[E("decor", i=1), E("porte", id="placard")]]),
    "6.14": S("maison-lierre"),
    "6.15": S(["maison-lierre", "seuil-nuit"],
              gestes=[G("glisser", sens="haut", effets=[E("decor", i=1)])],
              moments=[None]),

    # ============================================================ 7. Au-delà de la porte
    "7.1": S("desert-nuit", gestes=[G("maintenir", duree=1800, paupieres=True)],
             moments=[E("filantes", n=5)]),
    "7.2": S(["petales", "chambre"], moments=[None, [E("decor", i=1), E("tele")]]),
    "7.3": S(["glacon", "banquise", "desert-jour"], extra={"Aux côtés de dunes": E("decor", i=2)},
             moments=[E("decor", i=1)]),
    "7.4": S(["desert-jour", "fleurs", "couloir", "periyar"],
             extra={"Elle accueille les brancards": E("decor", i=2), "Jivan prie": E("decor", i=3)},
             gestes=[G("pleuvoir", effets=[E("pluie"), E("decor", i=1)])]),
    "7.5": S("couloir", gestes=[G("toucher", n=2, effet="toc")],
             moments=[E("silence")], extra={"Julie récupère son appareil": E("objet+", id="ecg", sac="julie")}),
    "7.6": S("feu", extra={"Je t’emprunte de quoi écrire": E("objet+", id="plume")},
             gestes=[G("glisser", sens="haut", effets=[E("etincelles")])]),
    "7.7": S("papier-lettre", texte="lettre", gestes=[G("ecrire")],
             extra={"Je suis prêt à bouleverser la réalité": E("objet+", id="lettre")}),
    "7.8": S(["local-nuit", "neon"], extra={"Julie dans la salle de préparation": E("decor", i=1)},
             gestes=[G("effacer"),
                     G("porter", objet="lettre", depart=[600, 1250], cible=[600, 1560, 200],
                       effets=[E("eclat-court", de="lunettes", vers="cle"), E("porte", id="local-pharmacie")])],
             moments=[E("transfert", id="lettre", de="darshan", vers="julie")]),
    "7.9": S(["carrefour", "banc"], extra={"il porte à la main un paquet au ruban rouge": E("objet+", id="paquet", sac="darshan", discret=True)},
             gestes=[G("rythme", n=6, effet="pas", effets=[E("decor", i=1)])]),
    "7.10": S(["voiture", "haussmann"], extra={"Les possibilités défilent": E("decor", i=1)},
              gestes=[G("maintenir", duree=1800)],
              moments=[E("ruban")]),
    "7.11": S(["fantomes", "rue-vide"], extra={"Julie prend le paquet": E("transfert", id="paquet", de="darshan", vers="julie")},
              gestes=[G("glisser", sens="haut")],
              moments=[[E("decor", i=1), E("silence")]]),
    "7.12": S(["pave", "porte-pere"], special="porte-pere", moments=[E("vibration"), E("perce")]),
    "7.13": S(["pave", "porte-pere"], special="porte-pere",
              gestes=[G("paume", duree=2200)]),
    "7.14": S(["pave", "porte-pere"], special="porte-pere", moments=[E("desenchantement")]),
    "7.15": S(["pave", "porte-pere", "fantomes"], special="porte-pere", moments=[E("chute")]),
    "7.16": S("papier", texte="nu", moments=[E("fin")]),

    # ============================================================ clôture
    "8.1": S("papier", texte="nu poeme", special="cloture"),
}
