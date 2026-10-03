"""Darshan jouable : les réglages de production de chaque tableau.

Le découpage (decoupage.py) dit ce que contient chaque tableau : son texte, ses gestes et ses
moments, chacun rattaché à une phrase du livre. Ce fichier dit comment le jouer : le décor,
la place du texte, la mécanique de chaque geste (dans l'ordre des gestes du découpage), l'effet
de chaque moment (dans l'ordre des moments du découpage), les objets gagnés ou perdus et les
portes franchies. build.py réunit les deux et fabrique le livre.

Tout y est reporté de la pré-production (docs/darshan-mise-en-scene/) : les fiches de production
des sept chapitres, corrigées par la synthèse (synthese.md), qui fait foi (arbitrage 9 de la
direction). Les noms des mécaniques et des effets sont ceux du cahier des charges de la synthèse
(partie 3) ; les anciens noms ne sont plus employés.

Vocabulaire : G(mécanique, …) pour un geste ; E(effet, …) pour un effet. Les mécaniques et
les effets sont ceux du moteur (src/js/mecaniques.js et src/js/effets.js) ; ceux qu'il ne
connaît pas encore deviennent un simple toucher ou rien, et build.py les signale. Les consignes
des gestes, les noms des lieux et des portes sont des textes d'interface : ils sont dans
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
# Chaque décor devient src/img/decors/<nom>.webp (1600 x 2400) par decors.py, sauf les décors
# du prototype, déjà faits, et les fonds unis. « photo » : photo de Karl telle quelle (monde de
# Julie) ; « encre » : photo de Karl passée à l'encre et à l'aquarelle (monde de Darshan) ;
# « dessin » : dessin procédural d'art.py ; x, y : position du cadre dans la photo (0 à 1) ;
# zoom : agrandissement avant recadrage. La liste est celle de la synthèse (partie 4) : 115 décors,
# dont 63 à fabriquer et 20 à refaire ; les dessins sont décrits en 4.4, les réglages nouveaux de
# decors.py en 4.7. Les images d'attente (en attendant les repérages de Karl, partie 9) sont dites
# comme telles.
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
    # ============================================================ les fichiers du prototype
    "ciel-poeme": prototype("ciel-poeme.jpg"),                                  # 0.1
    # le ciel du poème sous un calque d'arbres fixe, comme le ciel du toit sous la ville (0.2)
    "voute": prototype("ciel-poeme.jpg", "arbres-poeme.webp"),
    "toits": prototype("ciel-nuit.jpg", "ville.webp"),                          # 1.1 ; dans un verre en 3.4
    "tuiles": prototype("ciel-nuit.jpg", "ville.webp"),                         # 1.2
    "porte-pigeonnier": prototype("porte.jpg"),                                 # 1.3
    # à refaire : la retouche du dessin d'art.py (scene_aluva) : deux kayaks jaunes rangés contre le
    # mur de gauche (d'après la photo 35086240), le coutelas sur le couvercle du tonneau, vers (938, 1470)
    "aluva": dessin("scene_aluva"),                                             # 1.4
    "ciel-appel": prototype("ciel-nuit.jpg"),                   # 6.11 : le ciel de 1.1 (27116682), sans la ville

    # ============================================================ chapitre 1 : Aluva, à l'encre
    "palmes": encre(34342144, x=0.62),                                          # 1.5 : le chemin sous les palmes
    "filet": encre(34956319, x=0.18),                                           # 1.5, 1.6
    "periyar": encre(10310851, x=0.35),                                         # 1.6, 1.7, 3.4, 7.4
    "ponton": encre(10310851, x=0.9),                                           # 1.8 : le ponton vide
    "ponton-or": encre(10310851, x=0.9, heure="or"),                            # 1.8 : palette de fin d'après-midi
    "montre": encre(20315376),                                                  # 1.9
    "local-or": dessin("local_kayaks", heure="or"),             # 1.9 : la cabane vue du dehors, porte x 470 à 730
    "filet-soir": encre(34956319, x=0.18, soir=True),                           # 1.9
    # --- monde de Julie, en reflet dans le fleuve (1.7) : jamais en décor plein
    "tour-eiffel": photo(33035632),
    "pave": photo(12073837, x=0.45),
    "reflet-paris": photo(38279684, x=0.5),                                     # aussi un cliché de la galerie (5.7)
    "rue-floue": photo(16592454, x=0.45),                                       # aussi la rue floue de 5.10

    # ============================================================ chapitre 2 : le restaurant, Montsouris
    # « Table heureuse » : image d'attente de la séance du déjeuner (repérage S1) ; le tartare y est de
    # bœuf : exception à l'arbitrage 7, posée à Karl
    "resto-table": photo(34532663, x=0.3),                                      # 2.1, 2.4 à 2.7
    "resto-tartare": photo(34532663, x=0.12, y=0.85, zoom=1.25),                # 2.6 : l'assiette
    "resto-telephone": photo(34532663, x=0.64, y=0.08, zoom=2.2),               # 2.5 : le téléphone de Julie
    "rencontre": photo(33035648, x=0.5, y=0.45),                # « Dos » : 2.2, 2.3, 4.6, 4.7, 6.1, 6.2
    # la même, peinte : seule Julie reste (masque de sa silhouette : cheveux, épaules, main ; points en
    # fractions du cadre) ; la rue retourne au papier, et le bas du dos s'y fond, sous le texte (2.3, 2.4)
    "rencontre-encre": encre(33035648, x=0.5, y=0.45, bas=(0.74, 0.97), masque=[
        (0.30, 0.125), (0.40, 0.095), (0.50, 0.105), (0.575, 0.145), (0.615, 0.22), (0.64, 0.30),
        (0.655, 0.40), (0.66, 0.475), (0.72, 0.515), (0.80, 0.525), (0.88, 0.53), (0.95, 0.56),
        (1.00, 0.62), (1.00, 1.00), (0.09, 1.00), (0.065, 0.86), (0.08, 0.73), (0.10, 0.655),
        (0.10, 0.625), (0.05, 0.62), (0.005, 0.60), (0.005, 0.555), (0.04, 0.535), (0.10, 0.54),
        (0.15, 0.515), (0.175, 0.45), (0.20, 0.36), (0.215, 0.29), (0.245, 0.21), (0.27, 0.16)]),
    # recadrage à x 0,45 à essayer, si l'arche y gagne sans perdre l'allée
    "rocaille": photo(10524140, x=0.45),                                        # 2.8
    "amoureux": photo(31514847, x=0.1),                         # 2.8 : les deux amoureux (à x 0,32, l'homme seul)
    "maison-lierre": photo(10199772, x=0.22),                                   # 2.8, 6.14, 6.15
    "seuil-lierre": photo(10199772, x=0.52, y=0.6, zoom=1.5),                   # 2.9, 6.15 : la porte de Julie
    "toits-soir": photo(38674517, x=0.64, y=0.0, zoom=1.35),                    # 2.9, 2.10, 5.1

    # ============================================================ chapitre 3 : la légende, Pékin, la vision
    # la Voie lactée de Galice, telle quelle, sans horizon ni papier ; les étoiles-portes d'or par-dessus
    "cosmos": dessin("cosmos_portes", photo=39595391, x=0.58, y=0.0, zoom=1.5),   # 3.1, 3.2, 3.4
    # le défilé des âges (3.2) ; « portes-3 » garde son cadre x 0,5 (le fleuron en fleur de lys de la
    # grille et le blason de la cour restent hors cadre) : decors.py l'éclaircit seulement ; « portes-1 »
    # et « portes-5 » : le rouge ramené vers la brique (decors.RETOUCHES_ENCRE)
    "portes-4": encre(32429264),                                                # aussi en 6.4
    "portes-5": encre(32429190, x=0.5),
    "portes-3": encre(27025911, x=0.5),
    "portes-1": encre(34762346),
    "porte-trefle": encre(27046110, x=0.45),
    "mur-terre": dessin("mur_terre"),                           # 3.2, en attendant la photo de Karl (repérage S4)
    "voies": encre(39208821),                                                   # 3.3 : un chemin de pierre
    "parvis": encre(18890798, x=0.43),                                          # 3.5 : la cathédrale au matin
    "livres-poussiere": encre(38712879, x=0.0, zoom=1.4),                       # 3.6
    "pekin": encre(39670619, x=0.4, y=0.3, zoom=1.15),                          # 3.6 à 3.8 : la bibliothèque de Gijón
    "recueil": dessin("recueil"),                                               # 3.7, ou la photo de Karl (S1)
    "porte-personnel": dessin("porte_battante"),                                # 3.8, ou la photo de Karl (S6)
    "periyar-soir": encre(10220497, x=0.45, soir=True),                         # 3.9, 3.10, 3.12
    "periyar-crepuscule": encre(10220497, x=0.45, soir=True, crepuscule=True),  # 3.12 à 3.14 : le soir tombe
    "noir-lueur": photo(39575545, x=0.243, y=0.912, zoom=2.0),                    # 3.10 : la lumière orange en (600, 300)
    # la porte du père : la porte d'Irun de Karl, haut de la photo seulement (ni cycliste, ni plaque « 2 »,
    # ni serrure : le bas se fond dès 0,50 de la hauteur et disparaît à 0,60) ; calques à fond transparent,
    # haut du linteau à y 420, la lanterne du moteur 120 unités au-dessus
    "porte-pere": dessin("porte_pere", photo=39434691, haut=0.64, fondu_bas=[0.50, 0.60], largeur=900, y0=420),
    "porte-pere-traits": dessin("porte_pere", photo=39434691, haut=0.64, fondu_bas=[0.50, 0.60], largeur=900,
                                y0=420, traits=True),

    # ============================================================ chapitre 4 : Julie dit « je »
    "metro": photo(33035627),                                                   # 4.1
    "quai": photo(11876963),                                                    # 4.1 : « Sur les quais du Covid »
    "couloir": photo(35375606, x=0.5),                                          # 4.2, 7.4, 7.5, 7.8
    "rer": photo(33035652, x=0.8),                              # 4.3 : la tôle grise, sans les portes de couleur
    "kawa": photo(12441049, x=0.8, y=1.0, zoom=2.0),                            # 4.3 : la tasse, le sachet hors champ
    "lit-telephone": photo(38256669, x=0.2),                    # 4.3, 5.6 : à x 0,5, le téléphone sortait du cadre
    "carrefour": photo(10355467, x=0.62),                                       # 4.4, 7.9
    "foule-telephone": photo(31641251, x=0.2),                                  # 4.5 : « Fantômes », la main et le téléphone
    "sortie": photo(13234891, x=0.47),                                          # 4.5 : la sortie du tunnel
    "village": photo(39228274),                                                 # 4.5 ; la première porte de 6.12
    "chambre": photo(10879428, x=0.45),                                         # 4.7, 5.1, 5.8, 5.9, 7.2

    # ============================================================ chapitre 5 : le marché, la galerie, la pâtisserie
    # le « Jardin tropical » à l'encre, retouché chaud et clair, et ses étals en calques (cinq marchandises)
    "marche-aluva": dessin("marche_aluva", photo=34342144, x=0.0),              # 5.2 à 5.5
    "facade": encre(33035628, x=0.2),                                           # 5.5 (en vignette) ; 6.2
    "bonbons": photo(29360492, x=0.5),                                          # 5.6 : image d'attente (S1), floue
    "patinoire": photo(29630257, x=0.5),                                        # 5.6 : image d'attente (S10), floue
    "croque-serre": photo(6858270, x=0.55, y=0.42, zoom=2.2),                   # 5.6 : image d'attente (S1), bougée
    "deux-flous": photo(34876053, x=0.5),                                       # 5.7 : le selfie
    "video-lune": photo(38570570, format="paysage"),                            # 5.7 : la vidéo, en largeur
    "souvenir-lune": photo(38570570, x=0.42, pleine=True),                      # 5.8 : à la définition de la photo
    "souvenir-lune-proche": photo(38570570, x=0.42, y=0.55, zoom=2.2),          # 5.8 : l'arrivée du travelling
    # une bande verticale de 38674516 contient les deux cadres du panoramique de 5.9 (même x, même zoom)
    "lune-horizon": photo(38674516, x=0.62, y=1.0, zoom=1.8),                   # 5.9 : le ciel du soir
    "lune-haute": photo(38674516, x=0.62, y=0.28, zoom=1.8),                    # 5.9 : le croissant
    "lune": photo(38674516),                                                    # 7.15 : la photo entière du croissant
    "canneles": photo(10369144, x=0.5),                                         # 5.10, 5.11 : image d'attente (S5), floue
    "dessert": photo(29188525, x=0.5),                                          # 5.11 : image d'attente (S5), floue

    # ============================================================ chapitre 6 : l'appartement
    "haussmann": photo(33035628, x=0.2),                                        # 6.2, 6.3
    "porte-bleue": photo(32429264),                                             # 6.3, 6.4
    "salon": dessin("fenetre", photo=12443176, voilage="ferme"),                # 6.5, 6.7 : la lumière tamisée
    "patere": photo(38570569, x=0.5),                                           # 6.5
    "velours": dessin("velours", matiere=True),                                 # 6.5 : une matière, pas un trait (S1)
    "toiles": dessin("toiles"),                                                 # 6.6
    "fenetre": dessin("fenetre", photo=12443176, voilage="ouvert", flou=14),    # 6.7, 6.13 : vue floue jusqu'au repérage S7
    "the": photo(37296469),                                                     # 6.8 : image d'attente (S1), floue
    "tableau-ladoga": dessin("tableau", photo=34342149),                        # 6.8, 6.9 : mur et cadre en aplats
    "tableau-barque": dessin("tableau", photo=34342149, zoom=1.08, centre=[780, 640]),   # 6.9 : l'arrivée de l'avancée
    # la cuisine de Villandry en plans serrés : images d'attente de la main de Julie (S1) et du dosa (S6)
    "dosa": photo(38694025, x=1.0, y=1.0, zoom=2.8),                            # 6.10
    "main-julie": photo(38694025, x=1.0, y=1.0, zoom=2.8),                      # 6.10, 6.11, 6.13
    "main-vide": photo(38694025, x=1.0, y=1.0, zoom=2.8),                       # 6.13
    "table": photo(38694025, x=0.95, y=1.0, zoom=2.2),                          # 6.11, 6.12
    # « je t'aime » ne tient pas en hauteur : le cadre garde « aime » (choix de Karl, 29 septembre) ;
    # le mot est un peu plus large qu'un cadre 2:3, d'où la marge (voir decors.etendre)
    "graffiti": photo(38570603, x=0.878, marge=0.08),                           # 6.11
    # les paysages derrière les portes de 6.12 (avec « village »)
    "gorge": photo(39564914),
    "ossau": photo(39212543),
    "banquise": photo(10644439, x=0.84),                                        # le voilier entier ; aussi en 7.3
    "rochers": photo(35024039, x=0.75),                                         # l'empilement entier, modèle de 7.1
    "champs": photo(13020351, x=0.5),                                           # « Clé des champs »
    "placard": dessin("placard"),                               # 6.13 à 6.15 : serrure (932, 680), ouverture y 320 à 1040
    "verdure": photo(32429189),                                                 # 6.13, 6.14

    # ============================================================ chapitre 7 : au-delà de la porte
    "desert-nuit": dessin("desert", nuit=True, photo=27116682, rochers=35024039),   # 7.1 : le ciel de 1.1, velours noir
    "desert-jour": dessin("desert", nuit=False, rochers=35024039),              # 7.3, 7.4
    "petales": photo(11968793, x=0.5),                                          # 7.2
    "glacon": photo(35760712, x=0.5, y=0.72, zoom=1.8),                         # 7.3 : le glaçon seul, la boisson floue
    "fleurs": encre(35086239, x=0.5),                                           # 7.4
    "feu": encre(22591346, x=0.55),                                             # 7.6
    "depart-proche": dessin("depart", plan="proche"),           # 7.6 : Darshan se lève, de dos, près du feu
    "depart-loin": dessin("depart", plan="loin", modele=36652487),   # 7.6 : la passerelle au soir, Darshan au loin
    "papier-lettre": dessin("papier_lettre"),                                   # 7.7, 7.8
    "local-nuit": dessin("local_kayaks", heure="nuit", proche=True),            # 7.8 : la cabane de 1.9, serrure (932, 1010)
    "banc-flou": photo(34500385, x=0.3),                                        # 7.9 : « Repos »
    # la rue au couchant : image d'attente de la rue de Rungis (repérage S2), sans voiture, plaque ni barrières
    "rue-soleil": photo(26775590, x=0.37, y=0.0, zoom=1.15),                    # 7.9 à 7.15
    "eclipse-1": photo(38993391),                                               # 7.11 : l'éclipse de Galice
    "eclipse-2": photo(38993497),
    "eclipse-3": photo(38993636),
    "eclipse-4": photo(38995522),
    # la porte du père posée sur la rue : les calques du chapitre 3, 200 unités plus bas (lanterne en 600, 500)
    "porte-pere-rue": dessin("porte_pere", photo=39434691, haut=0.64, fondu_bas=[0.50, 0.60], largeur=900, y0=620),
    "porte-pere-rue-traits": dessin("porte_pere", photo=39434691, haut=0.64, fondu_bas=[0.50, 0.60], largeur=900,
                                    y0=620, traits=True),
    "fantomes-rue": photo(31641251, x=0.75),                                    # 7.15 : les passants, sans la main
    # ============================================================ les fonds unis
    "noir": uni("#020206"),                                                     # 5.7 : l'écran du téléphone
    "papier": uni("#f4ecdc"),                                                   # 7.16, 8.1
}

# ---------------------------------------------------------------- les portes du carnet
# Chaque porte franchie s'allume sur une carte du ciel. Lieux : longitude et latitude ; la porte
# du père n'a pas de lieu (étoile à part, en haut de la carte). Noms des lieux et libellés des
# portes : interface.ini, rubriques [lieux] et [portes] ; les phrases du livre de chaque fiche de
# porte : portes.ini. Le désert libyque n'a pas d'étoile : aucune porte n'y mène (synthèse 6.5).
LIEUX = {
    "paris": (2.35, 48.86),
    "aluva": (76.35, 10.11),
    "pekin": (116.4, 39.9),
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

# ---------------------------------------------------------------- qui parle
# Les répliques du livre, paragraphe par paragraphe (chantier I3 ; synthèse 2.2, ligne 42) :
# darshan, julie ou jivan (le vieil homme, que le texte ne nomme qu'à la fin du chapitre 1 : aucun
# nom ne s'affiche). Les répliques de Darshan sont en or jusqu'à la virgule de 7.14 (« En faisant de
# moi un mortel, »), puis en clair, comme celles des mortels (état « repliques » des pages, calculé
# par build.py). None : sans couleur de personnage, le livre ne dit pas qui parle. Les voix
# intérieures, en italique dans le livre imprimé (texte.ITALIQUES_PARAGRAPHES), n'y sont pas.
REPLIQUES = {
    # 1. Un ciel mouvant : le vieil homme, puis Darshan
    27: "jivan", 28: "darshan", 29: "jivan", 30: "darshan", 31: "jivan", 32: "darshan",
    33: "jivan", 34: "darshan", 35: "jivan", 36: "darshan", 37: "jivan", 38: "darshan",
    # 2. Un pain perdu s'il vous plaît.
    45: "julie", 46: "darshan", 47: "julie", 48: "darshan", 49: "julie", 50: "darshan",
    51: "julie", 52: "darshan", 53: "julie", 55: "darshan", 57: "darshan", 58: "julie",
    59: None,          # « Si j’avais su… » : sans tiret, du récit ; Karl dira qui le pense (question 13)
    # 3. Entre deux mondes
    87: "darshan", 88: "jivan", 89: "darshan", 90: "jivan", 91: "darshan", 92: "jivan",
    93: "darshan", 94: "jivan", 95: "darshan", 96: "jivan", 97: "darshan",
    # 5. Douceurs et confettis
    113: "jivan", 114: "darshan", 115: "jivan", 116: "darshan", 117: "jivan", 118: "darshan",
    119: "jivan", 120: "darshan", 121: "jivan", 122: "darshan",
    126: None,         # « Il est incroyable. » : en romain, une voix qui tutoie Julie (question 12)
    # 6. Des attentes de part et d'autre
    142: "darshan", 143: "julie", 144: "darshan", 145: "julie", 146: "darshan",
    152: "julie", 153: "darshan", 154: "julie", 155: "darshan", 158: "darshan", 159: "julie",
    164: "darshan", 165: "julie", 166: "darshan", 167: "julie", 168: "darshan",
    # 7. Au-delà de la porte
    181: "julie", 185: "jivan", 186: "darshan",
    207: "darshan", 208: "julie", 209: "darshan", 210: "julie",
    212: "darshan",    # la prière : l'or la quitte à la virgule, pendant le désenchantement
}

# ---------------------------------------------------------------- les tableaux
def S(decor, texte="bas", special=None, gestes=(), moments=(), extra=None, debut=(), coupes=None, bilan=(),
      entree=None, regard=None):
    """Réglages d'un tableau.
    decor : un nom de DECORS, ou une liste (le premier d'abord ; l'effet « decor » passe aux suivants,
    et revient au précédent après `duree` millisecondes si elle est donnée).
    texte : place et ton du panneau de texte (« bas », « haut », « bas clair », « haut clair », « bas ciel »,
    « haut papier », « nu », « lettre »…) ; il suit l'image (arbitrage 4).
    special : scène écrite à la main dans le moteur (le prototype, les temps forts : synthèse 3.4).
    gestes : un G par geste du découpage, dans l'ordre. moments : un E (ou une liste, ou None)
    par moment du découpage, dans l'ordre. extra : {début de phrase : E ou liste} pour des effets
    rattachés à d'autres phrases. debut : effets joués à l'entrée du tableau. coupes : {paragraphe :
    [débuts de phrase]} pour découper le texte en temps à la main. bilan : changements d'objets
    et de portes que fait une scène spéciale (pour calculer l'état des pages suivantes).
    entree : réglages de la transition d'entrée du découpage (5.1 : les bandes de Julie en lilas).
    regard : ce que montre « Regarder à travers » dans cette page, quand les lunettes sont dans le
    sac de Darshan (synthèse 3.3) : le filet d'or au pied de la porte nommée ; ailleurs, rien."""
    return dict(decor=decor if isinstance(decor, list) else [decor], texte=texte, special=special,
                gestes=list(gestes), moments=list(moments), extra=extra or {}, debut=list(debut),
                coupes=coupes or {}, bilan=list(bilan), entree=entree or {}, regard=regard)


# Points des gestes et des effets, partagés par plusieurs réglages (unités de page, 1200 x 1800)
EAU_PERIYAR = [0, 800, 800, 1750]        # zone de l'eau dans le décor « periyar » (x0, y0, x1, y1)
PORTE_LOCAL = [470, 700, 730, 1350]      # la porte de la cabane dans le dessin « local-or » (x0, y0, x1, y1)
PORTE_BLEUE = [565, 865, 470, 530]       # la porte bleue de « portes-4 » (centre x, centre y, largeur, hauteur)

SCENES = {
    # ============================================================ ouverture
    "0.1": S("ciel-poeme", special="seuil"),
    "0.2": S("voute", texte="poeme", special="poeme",
             moments=[E("poussiere", sens="tombe", couleur="or"), E("poussiere", sens="monte", couleur="or"),
                      [E("aube"), E("frontiere", embrase=500), E("course")]]),

    # ============================================================ 1. Un ciel mouvant
    "1.1": S("toits", special="toit",
             coupes={19: ["Il est d’un régal"],
                     20: ["J’espère que tu me regardes", "Comme toi je vis", "Encore une fois", "Papa je serai bientôt là"]},
             moments=[E("filantes"), [E("voix", lettres=True), E("son", effet="appel")],
                      E("voix", fin=True)]),
    "1.2": S("tuiles", special="tuiles", coupes={21: ["Il enjambe", "Ses lunettes fumées"]},
             gestes=[G("rythme", n=5, notes="montantes")],
             moments=[E("poussiere", petite=True), E("objet+", id="lunettes")]),
    "1.3": S("porte-pigeonnier", texte="haut", special="pigeonnier",
             coupes={22: ["Face à l’assemblage", "Les tenant par la branche", "D’un geste vif", "Elle est adaptée",
                          "Elle est affrétée", "À peine insérée"], 23: ["Il ne reste qu’à la pousser"]},
             gestes=[G("toucher"), G("glisser", sens="haut", vif=True),
                     G("porter", depart=[900, 1500], cible=[932, 1010, 170]),
                     G("tourner", centre=[932, 1010], rayon=260, angle=-90),
                     G("toucher")],
             moments=[E("vibre", haptique=[40, 60, 40]), E("eclat", objet="cle"), E("jour", son="autre-cote", lieu="aluva")],
             bilan=[E("remplacer", de="lunettes", vers="cle")]),
    "1.4": S("aluva", texte="haut clair",
             coupes={23: ["Face à lui s’écoule"], 24: ["En son sein", "Darshan emprunte", "Il s’applique la mousse"]},
             debut=[E("eblouir"), E("remplacer", de="cle", vers="lunettes", discret=True),
                    E("porte", id="pigeonnier", depuis=[600, 900])],
             gestes=[G("tracer", chemin=[[490, 1590], [545, 1550], [600, 1565], [655, 1550], [710, 1590]],
                       trait="mousse", flou=True, effets=[E("son", effet="coutelas", n=3)])],
             moments=[E("poussiere"), E("chaleur", zone=[200, 880, 1000, 1500]),
                      E("eclabousse", x=938, y=1470), E("son", effet="bombe")]),
    "1.5": S(["palmes", "filet"], texte="haut clair",
             moments=[E("decor", i=1),
                      [E("son", effet="tabouret"), E("eclabousse", x=600, y=1720, delai=1600)],
                      None]),
    "1.6": S(["filet", "periyar"], texte="haut clair",
             moments=[E("clin", encre=True), E("decor", i=1, fondu=2500)]),
    "1.7": S("periyar", texte="haut clair",
             gestes=[G("remuer", zone=EAU_PERIYAR, images=["pave", "reflet-paris"])],
             moments=[E("reflet", image="tour-eiffel", zone=EAU_PERIYAR),
                      E("melodie", mode="fragment", notes=4, filtre="eau"),
                      E("reflet", image="rue-floue", zone=EAU_PERIYAR)]),
    "1.8": S(["ponton", "ponton-or"], texte="haut clair",
             coupes={35: ["Même s’il est certainement", "As-tu déjà pensé à vieillir"],
                     36: ["Avant que la sotte question", "Je ne souhaite que m’éprendre"]},
             extra={"Quelle idée, à quoi cela m’avancerait-il": E("silence", fin=True)},
             gestes=[G("glisser", sens="bas", apres=True, effets=[E("lin")])],
             moments=[[E("decor", i=1, fondu=8000), E("silence", garder="fleuve")]]),
    "1.9": S(["montre", "local-or", "filet-soir"], texte="haut clair",
             gestes=[G("toucher", cible=[600, 1560, 200],
                       effets=[E("eclat-court", de="lunettes", vers="cle"),
                               E("jour", fente=PORTE_LOCAL, son="autre-cote", lieu="paris-midi"),
                               E("eblouir", sens="monte", depuis=[600, 1050]), E("son", effet="tictac", arret=True),
                               E("porte", id="local-paris", depuis=[600, 1050])])],
             moments=[[E("objet+", id="montre", discret=True), E("son", effet="tictac", boucle=True)],
                      E("camera", incline=True, delai=1500),
                      E("decor", i=1, delai=3000),
                      E("decor", i=2)]),

    # ============================================================ 2. Un pain perdu s'il vous plaît.
    # Le réel est photographié, le regard est de Darshan : la mise au point suit son attention ;
    # l'encre ne vient que quand il quitte le réel. Aucun geste de magie dans tout le chapitre.
    # Panneau en bas sur toutes les pages ; à table (2.1, 2.4 à 2.7), il ne bouge pas.
    "2.1": S("resto-table", debut=[E("remplacer", de="cle", vers="lunettes", discret=True)],
             coupes={41: ["Il caresse la main", "Il cultive le désir"]},
             gestes=[G("caresser", cible=[640, 700, 120], duree=2400,
                       effets=[E("flou", garde=[600, 360, 520], force=12, suit_geste=True)])]),
    "2.2": S("rencontre", texte="bas clair",
             coupes={42: ["Au premier regard", "La chamade battait", "Partait-il"],
                     43: ["Elle appréciait", "Son cœur balançait"]},
             gestes=[G("maintenir", duree=2600, battement="chamade", halo=[200, 330])],
             moments=[E("balance", points=[[990, 480], [1110, 800]], fievre=True)]),
    "2.3": S(["rencontre", "rencontre-encre"], texte="bas clair",
             debut=[E("coeur", continu=True, tempo=96, force=0.5)],
             coupes={44: ["Toute la grâce", "Son nez fin", "Son nom suffit", "Je ne dors pas"]},
             moments=[[E("decor", i=1, fondu=2800), E("voix", lettres=True, couleur="encre", eclat=False),
                       E("interface", voile=True)]]),
    # le réveil n'est pas un geste : le toucher qui fait paraître « — Quoi ?! » le déclenche
    "2.4": S(["rencontre-encre", "resto-table"], texte="bas clair",
             debut=[E("interface", voile=True), E("coeur", continu=True, tempo=96, force=0.4)],
             moments=[E("assourdi", texte=True),
                      [E("decor", i=1, par="obturateur", fond="sombre"), E("net"), E("coeur", arret=True)]]),
    "2.5": S(["resto-table", "resto-telephone"],
             coupes={51: ["Tu n’as pas de téléphone"], 52: ["Qu’y a-t-il de plus romantique", "De toute façon"]},
             moments=[E("decor", i=1), E("decor", i=0)]),
    "2.6": S(["resto-table", "resto-tartare"],
             gestes=[G("glisser", sens="bas",
                       effets=[E("decor", i=1, camera="baisse"), E("son", effet="fourchette", delai=900)])]),
    # tant que le pain perdu n'est pas photographié ; ensuite : S(["resto-table", "pain-perdu"], …) et,
    # au second moment, [E("decor", i=1), E("net"), E("son", effet="porcelaine")].
    # « Si j’avais su… » est sans tiret : du récit, sans couleur de personnage tant que Karl n'a pas
    # dit qui le pense.
    "2.7": S("resto-table", debut=[E("flou", force=16)],
             coupes={56: ["Ce sera un pain perdu", "Il sera servi", "C’est beau"]},
             moments=[E("commande", ligne="Un pain perdu s’il vous plaît."),
                      [E("son", effet="porcelaine"), E("flou", garde=[600, 360, 520], force=12)]],
             extra={"Si j’avais su": E("silence", duree=500)}),
    "2.8": S(["rocaille", "amoureux", "maison-lierre"], texte="bas clair",
             gestes=[G("glisser", sens="haut", lent=True, effets=[E("camera", avance=True, lent=True, suit_geste=True)])],
             moments=[[E("decor", i=1), E("son", effet="merle")], E("passe"), E("decor", i=2)]),
    "2.9": S(["seuil-lierre", "toits-soir"],
             gestes=[G("maintenir", duree=2600, battement="deux",
                       effets=[E("flou", force=18, chaud=True, suit_geste=True)])],
             moments=[[E("valse", mesures=4),
                       E("melodie", mode="fragment", notes=6, filtre="assourdi", delai=1875)],
                      E("compte", valeur="dimanche prochain", son="tic"),
                      [E("net"), E("coeur", arret=True)],
                      E("son", effet="porte-epaisse"), E("decor", i=1, camera="leve", delai=1200)]),
    "2.10": S("toits-soir",
              coupes={62: ["Il flirte avec Julie", "Mais un nuage", "Ce théâtre n’est pas"]},
              moments=[E("esquisse", dessin="theatre", etape=1), E("esquisse", dessin="theatre", etape=2),
                       E("nuage", efface="esquisse", palit=True)]),

    # ============================================================ 3. Entre deux mondes
    "3.1": S("cosmos", texte="bas ciel",
             moments=[E("barque", depart=[140, 250], vers=[400, 1150], duree=60000),
                      E("alignement", n=7, porte=PORTE_BLEUE, linteau="droit")]),
    "3.2": S(["cosmos", "portes-4", "portes-5", "portes-3", "portes-1", "porte-trefle", "mur-terre"],
             debut=[E("alignement", n=7, porte=PORTE_BLEUE, linteau="droit", fixe=True)],
             gestes=[G("toucher", cible=[600, 800, 160],
                       effets=[E("frisson", x=600, y=800), E("entree", x=600, y=800)])],
             moments=[E("diaporama", jusqua=5, intervalles=[2000, 1600, 1300, 1000, 800], traverser=True),
                      E("decor", i=6)]),
    "3.3": S("voies", debut=[E("camera", avance=True, duree=30000, zoom=1.05)],
             moments=[E("poussiere", sens="retombe", couleur="gris")]),
    # scène « plier » : l'indice du geste sous l'étoile d'Aluva, la consigne entre lui et le texte
    "3.4": S("cosmos", texte="bas ciel", special="plier",
             gestes=[G("glisser", sens="haut", vif=True, suivre=True, y=1180, y_consigne=1290,
                       effets=[E("fonte", objet="lunettes", legende=True),
                               E("pli", axe=700, de=[600, 1000], vers=[600, 400])])],
             moments=[[E("lentilles", gauche="toits", droite="periyar"), E("regard")]]),
    "3.5": S("parvis", texte="haut clair",
             coupes={71: ["Quand je dors", "Mes frères les hommes", "C’est ici que j’écris ma vie"]},
             moments=[[E("aube"), E("couche", couche="aube", oui=True)],
                      [E("couche", couche="aube", oui=False), E("son", effet="appel")]]),
    "3.6": S(["livres-poussiere", "pekin"], texte="bas clair", regard="porte-personnel",
             gestes=[G("glisser", sens="haut", effets=[E("poussiere", sens="envol", couleur="gris")])],
             moments=[E("decor", i=1), E("camera", avance=True, duree=3000, zoom=1.06)]),
    "3.7": S(["pekin", "recueil"], texte="bas clair", regard="porte-personnel",
             moments=[E("decor", i=1, camera="baisse"),
                      E("calligraphie", duree=2500), E("calligraphie", duree=4000)]),
    "3.8": S(["pekin", "porte-personnel"], texte="bas clair", regard="porte-personnel",
             gestes=[G("toucher", cible=[600, 900, 260],
                       effets=[E("battant", n=2), E("jour", son="autre-cote", lieu="periyar"),
                               E("remplacer", de="lunettes", vers="cle", discret=True)])],
             moments=[E("decor", i=1)],
             extra={"Il quitte sa table avec son ouvrage sous le bras": E("objet+", id="recueil", discret=True)}),
    "3.9": S("periyar-soir", texte="haut clair",
             debut=[E("porte", id="pekin", depuis=[600, 900]),
                    E("remplacer", de="cle", vers="lunettes", discret=True)],
             gestes=[G("deux-pouces", zone=[0, 900, 1200, 1500], cibles=[[450, 1150, 130], [750, 1150, 130]],
                       suivre=True, duree=2600, effets=[E("sceau", x=600, y=1150)])],
             moments=[E("son", effet="herbe")]),
    "3.10": S(["periyar-soir", "noir-lueur", "porte-pere"], special="vision",
              debut=[E("sceau", x=600, y=1150, deja=True), E("interface", voile=True)],
              gestes=[G("respirer", n=3, mini=1200, effets=[E("braises")])],
              moments=[E("sceau", defaire=True),
                       E("absence"), E("palpite"), E("bascule"),
                       [E("decor", i=1), E("couleur")],
                       E("lanterne", tracer=True),
                       [E("lanterne", allumer=True), E("son", effet="pere")],
                       E("ornements", calque="porte-pere-traits"),
                       E("decor", i=2, fondu=2400)]),
    "3.11": S("porte-pere", special="vision",
              debut=[E("lanterne", allumee=True), E("ornements", calque="porte-pere-traits", deja=True),
                     E("son", effet="pere", tenu=True)],
              gestes=[G("tendre", depart=[600, 1300], cible=[600, 760], arret=1000, y_consigne=1290)],   # au-dessus du texte
              moments=[E("voix", lettres=True, eclat=False, halo=False, son=False),
                       [E("lanterne", eteindre=True), E("draper"), E("son", effet="pere", eteindre=3000)],
                       [E("happe"), E("porte", id="pere", anneau=True)]]),
    "3.12": S(["periyar-soir", "periyar-crepuscule"], texte="haut clair",
              debut=[E("net", depuis="flou", duree=1200), E("couche", couche="couteau", oui=True)],
              extra={"Le chemin vers ton père": E("couche", couche="couteau", oui=True)},
              moments=[[E("etincelles"), E("couche", couche="couteau", oui=False)],
                       E("decor", i=1, fondu=20000)]),
    "3.13": S("periyar-crepuscule", texte="haut clair",
              debut=[E("couche", couche="couteau", oui=True, lent=True)],
              moments=[E("carnet", id="pere")]),
    "3.14": S("periyar-crepuscule", texte="haut clair",
              debut=[E("couche", couche="couteau", oui=True)],
              gestes=[G("semer", rose=[600, 1100], sans_aiguille=True,
                        cibles=[[600, 760, 110], [940, 1100, 110], [600, 1440, 110], [260, 1100, 110]],
                        effets=[E("couche", couche="vent", oui=True)])],
              moments=[E("compte", valeur="quatre jours", son="tic")]),

    # ============================================================ 4. Amélie et Julie
    # Le seul chapitre à la première personne : la caméra est les yeux de Julie, son téléphone
    # est son interface. Aucune magie : ni or, ni étoile, ni éclat. Dans les pages à la première
    # personne de Julie (4.1 à 5.1), les boutons de Darshan sont absents : ils s'effacent en 4.1,
    # après les bandes (effet « interface »), et reviennent en 5.2. Le sac de Julie s'ouvre avec
    # son téléphone (4.3).
    "4.1": S(["metro", "quai"], texte="haut",
             debut=[E("interface", sans="darshan", delai=3000, duree=1200)],
             moments=[E("decor", i=1, camera="baisse")]),
    "4.2": S("couloir",
             coupes={100: ["«\u00a0Êtes-vous sûr", "«\u00a0Pouvez-vous évaluer", "Ces phrases sont longues",
                           "C’est en les répétant", "Généralement les gens"]},
             gestes=[G("curseur", mini=0, maxi=10, depart=0, sens="vertical", objet="reglette", apres=True)],
             moments=[E("vers", questions=3, boucles=3,
                        coupes=[["ainsi que", "qui vous"], ["de vos"], ["sur une échelle", "dix étant", "que vous ayez", "et zéro"]])]),
    "4.3": S(["rer", "kawa", "lit-telephone"], texte="haut",
             debut=[E("tremble", legere=True, jusqua=1)],
             extra={"On s’est vues trente minutes": [E("decor", i=1), E("son", effet="tasse")],
                    "Je fais mes courses à la supérette": [E("decor", i=2), E("ambiance", id="chambre")]},
             gestes=[G("messages", a="Amélie", bulles=2, touchers=5,
                       effets=[E("objet+", id="telephone", sac="julie", style="notification")])]),
    "4.4": S("carrefour", texte="haut clair",
             gestes=[G("rythme", n=4, effet="pas", sol="plateforme", avance=True)]),
    "4.5": S(["foule-telephone", "sortie", "village"], texte="haut",
             coupes={103: ["Je pourrais très bien partir", "Ces pensées me traversent", "Parfois ils sont pianistes"]},
             extra={"Je veux prendre l’air": [E("decor", i=1), E("assourdi")]},
             gestes=[G("respirer", n=1, avance=True, anneau="blanc", apres=True,
                       effets=[E("eblouir", teinte="vert"), E("decor", i=2), E("net"),
                               E("ambiance", id="parc")])],
             moments=[E("musicien", accord_final=False)]),
    "4.6": S("rencontre", debut=[E("flou", tout=True)],
             coupes={105: ["Il n’a pas fait semblant", "Il m’a abordée", "Son regard et ses mots",
                           "Je suis peut-être naïve"]},
             extra={"Son regard et ses mots m’étaient adressés": E("coeur", n=2, tempo=64, qui="julie")},
             moments=[E("net")]),
    "4.7": S(["rencontre", "chambre"], texte="haut clair", coupes={108: ["Je dois me préparer pour ce jour"]},
             extra={"Un numéro, je me suis surprise": E("flou", tout=True, delai=1200),
                    "Nos rencontres ont animé mon quotidien": [E("decor", i=1, fondu=1200), E("net"),
                                                               E("ambiance", id="chambre")]},
             gestes=[G("contact", nom="Darshan", nom_ecrit_au_retour=True, numero=None, tendre=True, apres=True)],
             moments=[E("vibre", cible="sac", n=3, haptique=[60, 90, 60, 90, 60]),
                      E("compte", valeur="quatre jours", son="tic", monde="julie")]),

    # ============================================================ 5. Douceurs et confettis
    # 5.1 est encore une page de Julie à la première personne : sans les boutons de Darshan (barre du
    # chapitre 4). Ils reviennent en 5.2. La ballade n'est entière qu'en 5.7 (arbitrage 2).
    "5.1": S(["chambre", "toits-soir"], texte="haut clair", entree=dict(palette="lilas", grain="confettis"),
             coupes={110: ["Me fais-je des idées"]},
             moments=[E("compte", de="quatre jours", valeur="soixante-douze heures", son="tic", monde="julie"),
                      E("decor", i=1, fondu=1200)]),
    "5.2": S("marche-aluva", texte="haut clair",
             debut=[E("interface", avec="darshan", duree=1200, reflet="or"),
                    E("ambiance", id="marche", tanpura=True)],
             coupes={112: ["Le guilleret soupirant", "Darshan fait l’acquisition", "Le soleil d’orient"]},
             gestes=[G("etals", objets=["thes", "curcuma", "encens", "jarres", "tapisseries"],
                       cibles=[[380, 860, 110], [830, 880, 110], [290, 1060, 120], [900, 1080, 130],
                               [210, 700, 140]],
                       envol="court", avance=True, ploie=True)],
             extra={"Le soleil d’orient": E("son", effet="pas", rythme="traine", n=4, intervalle=560),
                    "Lève le pied": E("roule", image="mangue", depuis="bas")}),
    "5.3": S("marche-aluva", texte="haut clair",
             coupes={115: [], 116: ["Celle qui emporte"]},
             extra={"Je ne puis calmer mes ardeurs": E("boussole", etat="affolee", rose="3.14", place=[600, 800]),
                    "s’essouffle Jivan": E("essouffle")},
             moments=[[E("boussole", etat="nord", aiguille="haut"), E("carnet")]]),
    "5.4": S("marche-aluva", texte="haut clair", moments=[E("nuage", reste=0)]),
    "5.5": S("marche-aluva", texte="haut clair",
             debut=[E("confettis", paquet=True)],
             gestes=[G("toucher", cible=[620, 960, 110],
                       effets=[E("confettis", n=3), E("objet+", id="confettis")])],
             moments=[E("vignette", image="facade", trace=True, place=[600, 760, 260], chaleur=True),
                      E("vignette", fin=True, vers="haut")]),
    "5.6": S("lit-telephone", texte="bas",
             gestes=[G("galerie", ouverture="haut", feuilleter=True,
                       images=["bonbons", "patinoire", "croque-serre"], apres=True)],
             moments=[E("cliche", image="bonbons", flou="mise-au-point"),
                      E("cliche", image="patinoire", voisin=True, flou="mise-au-point"),
                      E("cliche", image="croque-serre", flou="bouge")]),
    "5.7": S("noir", texte="bas",
             debut=[E("cliche", grille=True, feuilleter=True, images=["bonbons", "patinoire", "croque-serre", "deux-flous", "reflet-paris"])],
             gestes=[G("toucher", cible=[600, 640, 220], apres=True,
                       effets=[E("video-lune", image="video-lune"),
                               E("melodie", mode="entiere", filtre="telephone")])],
             moments=[E("cliche", image="deux-flous"),
                      [E("cliche", parcourir=True), E("frisson", objet="lunettes", bouton=True, delai=1200)],
                      E("cliche", image="reflet-paris"),
                      E("cliche", image="video-lune", video=True)]),
    "5.8": S(["souvenir-lune", "souvenir-lune-proche", "chambre"], texte="bas",
             # origine et échelle : la lune de la vidéo (548, 964) rejoint celle du souvenir (606, 1045) à l'échelle 2,6
             debut=[E("video-lune", agrandir=True, origine=[512, 913], echelle=2.6), E("ambiance", id="rue", nuit=True, foule=True)],
             # cadre : [x, y, zoom] de souvenir-lune-proche (DECORS) : la vue avance jusqu'à son cadrage
             moments=[E("camera", avance=True, vers=1, duree=7000, cadre=[0.42, 0.55, 2.2]),
                      [E("decor", i=2, fond="clair"), E("ambiance", id="chambre")],
                      E("son", effet="pied", mesure="6/8", boucle=True)],
             extra={"Difficile de distinguer": E("son", effet="pied", ralentir=True, arret=True)}),
    "5.9": S(["chambre", "lune-horizon", "lune-haute"], texte="bas clair",
             coupes={128: ["Le voir et me tenir", "Je l’aime et je vais lui dire"]},
             debut=[E("couche", couche="bourdon", oui=True)],
             gestes=[G("maintenir", duree=4200, battement="deux", accord=True, tempo_commun=80)],
             moments=[[E("eclair", doux=True), E("decor", i=1, fond="sombre")],
                      [E("couche", couche="bourdon", oui=False), E("son", effet="clairon", tenu=True)],
                      E("coeur", qui="julie", tempo=64, arythmie=True, continu=True),
                      E("camera", monte=True, vers=2, duree=9000, bande="lune-bande", haut=[1.0, 0.28])]),
    "5.10": S(["rue-floue", "canneles"], texte="bas",
              coupes={130: ["La rue se fait floue", "Quel serait son meilleur ambassadeur", "Le chocolat, le café",
                            "Il faut peut-être chercher"]},
              moments=[[E("flou"), E("assourdi"), E("decor", i=1, delai=1200), E("flou", tout=True, chaud=True, delai=1200),
                        E("ambiance", id="patisserie", delai=1200), E("son", effet="clochette", delai=1200)],
                       None,   # vitrine de Karl : E("flou", garde=[x, y, r], reflet=True) sur l'éclair
                       None,   # vitrine de Karl : E("flou", garde=[x, y, r]) sur le chocolat et le café
                       None]), # vitrine de Karl : E("flou", garde=[x, y, r]) sur le baba au rhum
    "5.11": S(["canneles", "dessert"], texte="haut clair",
              debut=[E("flou", tout=True, chaud=True)],
              gestes=[G("essuyer", dessous=1, hublot=[600, 900, 150], trace_max=240, seuil=0.75, voile=True)],
              moments=[E("buee"),
                       None,   # Charlotte de Karl : E("camera", avance=True, …) dans le hublot, vers les feuilles de sucre
                       E("objet+", id="ticket", sac="julie", style="notification", ploie=True),
                       E("compte", de="soixante-douze heures", valeur="onze heures, treize heures", son="tic", monde="julie")]),

    # ============================================================ 6. Des attentes de part et d'autre
    # Panneau en bas sur toutes les pages (arbitrage 4) ; dans l'appartement (6.5 à 6.15), il ne change
    # pas de place, seul son fond suit le plan. Pas de ballade dans le chapitre (arbitrage 2) : le cœur.
    "6.1": S("rencontre", texte="bas clair", coupes={135: ["Le ventre tendu", "Son nœud vacille", "Le ruban rouge"]},
             debut=[E("remplacer", de="ticket", vers="paquet", sac="julie", discret=True)],
             extra={"Le ventre tendu": E("ruban", vent=True, attache=[80, 1000])},   # à la main gauche de Julie
             moments=[E("compte", de="onze heures, treize heures", valeur="midi", son="tic"),
                      [E("ruban", battement=True), E("coeur", qui="julie", tempo=100, continu=True)]]),
    "6.2": S(["facade", "rencontre", "haussmann"], texte="bas clair", special="listes",
             gestes=[G("liste", cote="darshan", items=["Veste", "barbiche comme il faut", "bague", "chemise des grands jours"]),
                     G("liste", cote="julie", items=["Bague", "boucles d’oreilles", "gâteau", "sac à main",
                                                     "maquillage des grands jours", "frange qui décoiffe"],
                       echos={"Bague": "bague", "maquillage des grands jours": "chemise des grands jours"},
                       briller=["gâteau", "sac à main"])],          # scène « listes » : le bouton des objets luit
             moments=[E("coin-de-rue", i=2)]),
    "6.3": S(["haussmann", "porte-bleue"], texte="bas clair", regard="porte-bleue",
             moments=[[E("halo", couleur="ble", bande=[600, 1050]), E("compte", valeur=""),
                       E("son", effet="clairon", tenu=True)],
                      E("decor", i=1, fond="sombre")]),
    "6.4": S(["porte-bleue", "portes-4"], texte="bas", regard="porte-bleue",
             gestes=[G("toucher", cible=[690, 930, 180])],                            # l'étoile naît en 6.5
             moments=[[E("remplacer", de="lunettes", vers="cle", discret=True), E("frisson", objet="cle", bouton=True)],
                      E("saigne", i=1, x=693, y=925),
                      E("remplacer", de="cle", vers="binocles")]),
    "6.5": S(["salon", "patere", "velours"], texte="bas clair",
             debut=[E("porte", id="appartement", depuis=[600, 900])],                  # arbitrage 6
             gestes=[G("caresser", matiere="velours", cible=[600, 860, 120], sens="vertical", duree=2400)],
             moments=[E("decor", i=1), E("decor", i=2, fond="sombre")]),
    "6.6": S("toiles", texte="bas clair",
             coupes={148: ["Leur fumet", "À leur surface", "Les traits sont", "Les lunes", "Un seul couple", "La peinture"]},
             moments=[[E("objet-", id="encens", discret=True), E("objet-", id="thes", discret=True)],
                      E("fumee", chemin=[[600, 1000], [545, 900], [655, 790], [560, 680], [650, 570], [610, 480]],
                        duree=8000),
                      E("couleur", cible=[610, 330, 240])]),
    "6.7": S(["salon", "fenetre"], texte="bas clair",
             coupes={149: ["Elle a perdu le nord", "Sans avoir emprunté", "Au bord de sa fenêtre", "Elle s’en retourne"]},
             gestes=[G("toucher", cible=[600, 760, 320], effets=[E("rideau", i=1)])],
             moments=[E("vertige")]),
    "6.8": S(["the", "tableau-ladoga"], texte="bas",
             debut=[E("flou", force=14)],                                              # jusqu'au repérage S1 (le chai)
             gestes=[G("verser")],
             moments=[[E("decor", i=1, fond="clair"), E("net")]]),
    "6.9": S(["tableau-ladoga", "tableau-barque"], texte="bas clair",
             debut=[E("camera", avance=True, vers=1, duree=30000)],
             moments=[E("couche", couche="horloge", oui=True, proche=True)]),
    "6.10": S(["dosa", "main-julie"], texte="bas",
              debut=[E("flou", force=14),                                              # jusqu'au repérage S6 (le dosa)
                     E("couche", couche="horloge", oui=True, proche=False)],
              gestes=[G("maintenir", duree=1500, chaleur=True, battement="deux", accord=True, tempo_commun=80, deja=True)],
              moments=[E("objet-", id="curcuma", discret=True),
                       [E("decor", i=1), E("net"), E("refroidir")]]),
    # L'attente partage l'écran entre le ciel de l'appel et la main de Julie (synthèse 3.1, question 10) ;
    # tant que la main n'est pas photographiée (repérage S1), sa moitié montre sa place à table.
    "6.11": S(["main-julie", "graffiti", "table", "ciel-appel"], texte="bas",
              coupes={160: ["Dix longues secondes", "Il ferme les yeux", "Rien ne se passe", "Il se saisit de ses lunettes",
                            "Il ouvre les portes"]},
              debut=[E("refroidir", instant=True), E("coeur", qui="deux", tempo=80, continu=True),
                     E("couche", couche="horloge", oui=True, proche=False)],
              gestes=[G("attendre", duree=10000, apres=True, partage=["ciel-appel", "main-julie"], etoile="pere",
                        passer=3000, presser=True),
                      G("glisser", sens="haut", vif=True,
                        effets=[E("eclat-brise", objet="cle", fragment="les change en clés"),
                                E("remplacer", de="lunettes", vers="cle", discret=True)])],
              moments=[E("decor", i=1, duree=2400, camera="baisse", retour="fondu"),
                       [E("coeur", qui="julie", tempo=64, arythmie=True, continu=True),
                        E("couche", couche="horloge", oui=True, proche=True)],
                       [E("decor", i=2), E("compte", valeur="Dix longues secondes", son="tic")],
                       [E("son", effet="appel"), E("son", effet="appel", delai=3500, retenir=5000)],
                       [E("silence", duree=2500), E("compte", de="Dix longues secondes", valeur="")],
                       E("portes-vides", n=3)]),
    "6.12": S(["table", "village", "gorge", "ossau", "banquise", "rochers", "champs"], texte="bas",
              coupes={162: ["La routine postiche", "Elle est dure"]},
              debut=[E("refroidir", instant=True), E("portes-vides", n=3, instant=True)],   # les cicatrices de 6.11
              gestes=[G("portes", images=["village", "gorge", "ossau", "banquise", "rochers", "champs"], accelere=True,
                        taille=[360, 600], zone=[60, 60, 1140, 1040])],
              moments=[E("fonte", vue="dehors", objet="binocles"),
                       [E("effacement", fond="clair"), E("ambiance", id="silence")]]),
    "6.13": S(["fenetre", "main-julie", "main-vide", "placard", "verdure"], texte="bas clair",
              debut=[E("refroidir", instant=True), E("decor", i=1, delai=1200, fond="sombre")],   # la fenêtre, une seconde
              gestes=[G("main", apres=True, effets=[E("decor", i=2, delai=500)]),     # immobile, puis elle se retire
                      G("tourner", apres=True, centre=[932, 680], rayon=260, angle=-90)],
              moments=[E("decor", i=3),
                       [E("embrasure", cadre="placard", image="verdure"), E("ambiance", id="parc")]]),
    "6.14": S(["verdure", "placard", "maison-lierre"], texte="bas",
              debut=[E("refroidir", instant=True), E("embrasure", cadre="placard", image="verdure", instant=True)],
              moments=[E("embrasure", cadre="placard", image="maison-lierre")]),
    "6.15": S(["maison-lierre", "placard", "seuil-lierre"], texte="bas",
              debut=[E("refroidir", instant=True), E("embrasure", cadre="placard", image="maison-lierre", instant=True)],
              gestes=[G("glisser", sens="haut", lent=True,
                        effets=[E("embrasure", cadre="placard", image="maison-lierre", agrandir=True, suit_geste=True),
                                E("porte", id="placard", depuis=[600, 680])])],             # arbitrage 6
              moments=[[E("embrasure", fermer=True), E("remplacer", de="cle", vers="lunettes", discret=True),
                        E("son", effet="porte-epaisse"), E("ambiance", id="rue", soir=True)],
                       # quand la porte sera photographiée au crépuscule (repérage S2) : crepuscule allégé ou retiré
                       [E("decor", i=2, fondu=2500), E("refroidir", crepuscule=True),
                        E("ruban", immobile=True, attache=[420, 950]),
                        E("boussole", etat="perdue", bouton=True, anime=False)]]),

    # ============================================================ 7. Au-delà de la porte
    "7.1": S("desert-nuit", gestes=[G("maintenir", duree=1800, paupieres=True)],
             moments=[E("filantes", n=7, sens="bas", larmes=True), E("morsure", duree=3000)]),
    "7.2": S(["petales", "chambre"],
             moments=[None, [E("decor", i=1, fondu=1500, fond="clair"), E("tele"), E("ambiance", id="chambre")]]),
    "7.3": S(["glacon", "banquise", "desert-jour"], debut=[E("flou", garde=[600, 900, 330], force=10)],
             moments=[E("goutte", x=640, y=960),
                      E("decor", i=1, fondu=2400, delai=1400),
                      [E("decor", i=2, fondu=2400, fond="clair"), E("sable")]]),
    "7.4": S(["desert-jour", "fleurs", "couloir", "periyar"],
             moments=[E("pluie", peint=1, accalmie=True),
                      E("partage", actif="les deux", ecart=24, tension=True)],
             extra={"Julie renoue avec son quotidien": [E("partage", gauche="couloir", droite="fleurs", actif="gauche",
                                                          arete="nuit"),
                                                        E("ambiance", partage=dict(gauche="hopital", droite="pluie"))],
                    "Le temps passe": E("partage", actif="aucun"),
                    "Jivan prie": [E("partage", droite="periyar", actif="droite"),
                                   E("ambiance", partage=dict(gauche="hopital", droite="kerala"))]}),
    "7.5": S("couloir", gestes=[G("toucher", n=2, effet="toc", cible=[1020, 1150, 140])],
             moments=[[E("silence", duree=4000), E("pause", duree=3000)]],
             extra={"Julie récupère son appareil": E("objet+", id="ecg", sac="julie")}),
    "7.6": S(["feu", "depart-proche", "depart-loin"],
             gestes=[G("glisser", sens="haut", cible=[600, 1350, 260], effets=[E("etincelles", etoile=True)])],
             moments=[E("decor", i=1), E("decor", i=2), E("decor", i=0)],
             extra={"Je t’emprunte de quoi écrire": E("objet+", id="plume")}),
    "7.7": S("papier-lettre", texte="lettre",
             gestes=[G("ecrire", apres=True, lignes=5, appui=True),
                     G("effacer", resiste=True, sens="vertical")],
             moments=[E("vacille", cible="carnet")],
             extra={"Je suis prêt à bouleverser la réalité": E("objet+", id="lettre")}),
    "7.8": S(["papier-lettre", "local-nuit", "couloir"], texte="haut", regard="fente",
             gestes=[G("tourner", centre=[932, 1010], rayon=260, angle=-90,
                       effets=[E("jour", fente=True, entiere=False, son="autre-cote", lieu="hopital-nuit")]),
                     G("porter", objet="lettre", depart=[600, 1250], cible=[720, 1600, 200])],
             moments=[E("enjambees", n=3, i=1, notes="montantes"),
                      E("eclat-court", de="lunettes", vers="cle", serrure=[932, 1010]),
                      [E("decor", i=2), E("transfert", id="lettre", de="darshan", vers="julie", jaillir=[1020, 1150]),
                       E("porte", id="local-pharmacie", depuis=[1020, 1150], delai=1800),
                       E("ambiance", id="hopital", nuit=True)]]),
    "7.9": S(["carrefour", "banc-flou", "rue-soleil"], texte="haut clair",
             debut=[E("objet-", id="ecg", discret=True)],                             # Julie rentre chez elle
             gestes=[G("rythme", n=6, notes="melodie", effet="pas", avance=[3, 6], plan=2, ruban=[1150, 1480])],
             moments=[E("objet+", id="paquet-darshan", sac="darshan", discret=True)],
             extra={"Trottinant, elle accélère": E("decor", i=1),
                    "C’en est trop": E("coeur", qui="julie", vif=True)}),
    "7.10": S("rue-soleil", texte="haut clair", debut=[E("ruban", attache=[1150, 1480])],
              gestes=[G("maintenir", duree=3500, paupieres=True, battement="unisson", tempo=[80, 60],
                        effets=[E("melodie", mode="entiere"), E("interface", voile=True)])],
              moments=[E("ralenti"), E("ruban", affole=True)],
              extra={"Il porte à hauteur d’épaule un petit paquet": [E("ruban", attache=[1150, 1300]),
                                                                     E("boussole", etat="nord", bouton=True)]}),
    "7.11": S(["rue-soleil", "eclipse-1", "eclipse-2", "eclipse-3", "eclipse-4"], texte="haut clair",
              coupes={202: ["Le trottoir se vide", "Il est immense"]},
              gestes=[G("glisser", sens="haut", lever=True, zoom=1.35, effets=[E("eblouir", doux=True)])],
              moments=[E("decor", i=1, fondu=1200),
                       E("decor", i=2, fondu=900, fond="sombre"),
                       E("decor", i=3, fondu=900),
                       [E("decor", i=4, fondu=1500), E("frontiere", cercle=True, embrase=500), E("silence", fondu=2500)],
                       E("etoiles-jour", n=1, fondu=2000),
                       E("chiasme", couleur="vermillon", croisee="disque")],
              extra={"Julie prend le paquet": E("objet-", id="paquet-darshan", discret=True)}),
    "7.12": S(["rue-soleil", "porte-pere-rue", "porte-pere-rue-traits"], texte="haut clair", special="rue-de-rungis",
              moments=[E("vibre", haptique=[80, 40, 80]),
                       E("perce", fissure=19059625, depuis=[600, 1560]),
                       [E("lanterne", allumer=True), E("son", effet="pere")],
                       E("ornements", calque="porte-pere-rue-traits"),
                       E("carnet", id="pere", allumer=True),
                       E("gel", fenetres=True)]),
    "7.13": S(["rue-soleil", "porte-pere-rue", "porte-pere-rue-traits"], texte="haut clair", special="rue-de-rungis",
              debut=[E("lanterne", allumee=True), E("ornements", calque="porte-pere-rue-traits", deja=True),
                     E("gel", deja=True), E("son", effet="pere", tenu=True),
                     E("camera", avance=True, zoom=1.08, duree=12000)],
              gestes=[G("paume", duree=2200, cible=[600, 1000, 170], cle_absente=True,
                        effets=[E("camera", avance=True, zoom=1.12, duree=2000)])],
              moments=[[E("camera", recule=True, zoom=1.03, duree=1500), E("son", effet="pere", eteindre=3000)]]),
    "7.14": S(["rue-soleil", "porte-pere-rue", "porte-pere-rue-traits"], texte="haut clair", special="rue-de-rungis",
              debut=[E("lanterne", allumee=True), E("ornements", calque="porte-pere-rue-traits", deja=True),
                     E("gel", deja=True), E("camera", zoom=1.12, deja=True)],
              coupes={212: ["Je vous remercie", "En faisant de moi un mortel", "je vous prie de m’accorder"]},
              moments=[E("desenchantement", duree=9000, annonce=["cle_poussiere", "carnet_eteint"])]),
    "7.15": S(["rue-soleil", "porte-pere-rue", "porte-pere-rue-traits", "fantomes-rue", "lune"], texte="haut papier",
              special="rue-de-rungis", coupes={214: ["Unie à lui", "Ensemble ils convolent"]},
              debut=[E("lanterne", allumee=True), E("ornements", calque="porte-pere-rue-traits", deja=True),
                     E("gel", deja=True), E("camera", zoom=1.12, deja=True)],
              moments=[[E("son", effet="choc"), E("vibre", haptique=[240]), E("lanterne", eteindre=True, brusque=True)],
                       [E("chute", muette=True), E("degel", delai=900), E("camera", zoom=1.0, duree=1500, delai=900)],
                       E("decor", i=3),
                       E("decor", i=4)]),
    "7.16": S("papier", texte="nu", coupes={215: ["Ne sentez-vous pas", "Y aurait-il un successeur"]},
             moments=[E("pause", duree=3000)]),

    # ============================================================ clôture
    "8.1": S("papier", texte="nu poeme", special="cloture", moments=[E("frontiere", encre=True, y=1650, trace=1500)]),
}
