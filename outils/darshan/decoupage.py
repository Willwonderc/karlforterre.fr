"""Découpage de Darshan en tableaux : le plan de toute l'édition jouable.

Usage : python3 outils/darshan/decoupage.py
Python seul, sans module à installer. Le programme lit le texte dans livres/darshan.epub
(par build.py), vérifie le découpage et écrit docs/darshan-decoupage.md.

Un tableau, c'est une page fixe de l'EPUB (une scène de l'édition web) : un décor, un
morceau du texte, parfois un geste. Chaque tableau commence à un paragraphe du livre, ou
à une phrase de ce paragraphe, et s'arrête où commence le suivant : le programme vérifie
que les tableaux, mis bout à bout, redonnent tout le texte, de la dédicace au poème de
clôture, sans trou ni chevauchement, et que chacun compte entre 40 et 160 mots.

Les gestes et les moments forts citent la phrase du livre qui les fait naître ; le
programme vérifie que cette phrase figure, mot pour mot, dans le texte du tableau. Rien
n'est inventé : les textes d'interface (consignes, boutons) restent à écrire et à faire
valider par Karl (docs/plan-darshan-interface.md, section 9).

Plus tard, build.py pourra fabriquer le livre entier à partir de ces données (TABLEAUX).
"""
import pathlib
import re
import sys

ICI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
from texte import lignes  # noqa: E402  (le texte du livre, paragraphe par paragraphe)

RACINE = ICI.parent.parent
SORTIE = RACINE / "docs" / "darshan-decoupage.md"
MOTS_MIN, MOTS_MAX = 40, 160
PREMIER, DERNIER = 8, 221            # de la dédicace au dernier vers

# Titres des chapitres, tels qu'ils sont dans le livre (vérifiés plus bas).
CHAPITRES = {
    0: ("Ouverture", None),
    1: ("Un ciel mouvant", 17),
    2: ("Un pain perdu s’il vous plaît.", 40),
    3: ("Entre deux mondes", 63),
    4: ("Amélie et Julie", 99),
    5: ("Douceurs et confettis", 109),
    6: ("Des attentes de part et d’autre", 134),
    7: ("Au-delà de la porte", 170),
    8: ("Clôture", None),
}

# ---------------------------------------------------------------- la grammaire des transitions
# Une seule règle : la transition dit ce qui se passe entre deux tableaux. Le moteur les a
# toutes (src/moteur.js, module Transitions) ; banc d'essai : dist/web/transitions.html.
TRANSITIONS = [
    ("—", "Même plan", "Le décor reste, seul le texte change (dialogue, suite d'une même action).", "aucune"),
    ("fondu", "Fondu", "Même lieu, le temps passe (au noir, ou au blanc de la page pour la fin).", "600 + 650 ms"),
    ("encre", "Encre", "Darshan change de lieu : trois coups de pinceau couvrent la page puis s'en retirent.", "780 + 820 ms"),
    ("bandes", "Bandes", "Ouverture de chapitre, façon Persona : bandes obliques d'encre, de vermillon et d'or, "
     "trame de points ; le titre du chapitre claque sur la bande centrale.", "640 ms + titre 1,6 s + 680 ms"),
    ("iris", "Iris", "Vision, petite porte, regard qui se resserre : un cercle cerné d'or se referme sur un point "
     "et s'ouvre ailleurs.", "760 + 900 ms"),
    ("porte", "Porte", "On franchit une porte : sa lumière gagne l'écran, puis la scène suivante paraît dans une "
     "embrasure qui s'élargit jusqu'à nous.", "900 + 1 250 ms"),
    ("lumiere", "Lumière", "Éblouissement, foudre : une lumière qui s'étend puis se dissipe.", "900 + 2 000 ms"),
    ("obturateur", "Obturateur", "Le monde de Julie, fait des photographies de Karl : les lames d'un obturateur "
     "se ferment et s'ouvrent sur la photo suivante, avec un double déclic.", "420 + 520 ms"),
    ("glissement", "Glissement", "Le téléphone de Julie : on passe d'une photo à l'autre.", "360 + 420 ms"),
]
EFFETS_OBJETS = [
    ("frisson", "Un objet change d'état sans changer de nature (les lunettes ôtées, la clé dans la serrure) : "
     "étoile et rayons autour de l'objet, tintement de verre.", "560 ms", "fait"),
    ("envol", "Un objet entre dans le sac : bandeau oblique « Nouvel objet », puis l'objet vole jusqu'au bouton "
     "« Objets », qui apparaît à son arrivée.", "≈ 2 s", "fait"),
    ("éclat", "Un objet se métamorphose : bandes, trame, étoiles, l'objet arrive en tournoyant, son nom en grand, "
     "et le fragment du livre qui raconte la métamorphose ; puis sa fiche s'ouvre en diagonale.", "≈ 2,8 s", "fait"),
    ("éclat court", "La même métamorphose, déjà vue : un frisson, la fonte, et le nom seul, sans bandes.", "≈ 1 s", "à faire"),
    ("éclat brisé", "La métamorphose qui ne mène nulle part (chapitre 6) : les bandes se fendent et retombent.", "≈ 1,5 s", "à faire"),
    ("dépôt", "Un objet quitte le sac pour la scène (le thé servi, la veste accrochée) : l'envol à l'envers.", "≈ 1 s", "à faire"),
    ("transfert", "Un objet passe d'un personnage à l'autre (la lettre, le paquet au ruban rouge) : il quitte un sac "
     "et rejoint l'autre, d'un monde à l'autre.", "≈ 1,5 s", "à faire"),
    ("désenchantement", "La magie s'en va : l'objet se défait en poussière d'or et le bouton « Objets » disparaît "
     "avec lui.", "≈ 3 s", "à faire"),
]

# ---------------------------------------------------------------- les ambiances sonores
# Fabriquées en direct par le moteur (Web Audio), sans fichier ; une par lieu. Le champ `son`
# d'un tableau commence par son ambiance, puis, après « ; », ses effets. Aucune parole
# enregistrée : pas d'annonce ni de dialogue inventés.
AMBIANCES = {
    "cosmos": ("La voûte : sinus lents, souffle", "fait"),
    "nuit": ("Les toits la nuit : vent, air, rumeur de la ville", "fait"),
    "kerala": ("Aluva : le fleuve et ses remous, les oiseaux, un tanpura", "fait"),
    "silence": ("Plus rien : le son se tait (la fin du livre)", "fait"),
    "vent": ("Le ciel, le désert la nuit : le vent seul", "à faire"),
    "restaurant": ("Couverts, murmure de salle, pas du serveur", "à faire"),
    "rue": ("Paris : pas, voitures au loin, pigeons", "à faire"),
    "parc": ("Feuillage, gravier, oiseaux (le merle)", "à faire"),
    "bibliothèque": ("Silence habité, pages tournées, pas feutrés", "à faire"),
    "vision": ("Le mudrā : souffle, braises, un espace sans air", "à faire"),
    "métro": ("La tôle qui vibre, les freins", "à faire"),
    "hôpital": ("Couloir, bips lointains, chariots", "à faire"),
    "chambre": ("Pièce calme, rue étouffée", "à faire"),
    "marché": ("Aluva : foule, marchands, chaleur", "à faire"),
    "pâtisserie": ("Vitrine réfrigérée, clochette de la porte", "à faire"),
    "appartement": ("Tentures, horloge, encens qui crépite", "à faire"),
    "désert": ("Sable qui file, nuit immense", "à faire"),
    "pluie": ("Averse, puis gouttes", "à faire"),
}


def ambiance(t):
    return t["son"].split(";")[0].strip()


# ---------------------------------------------------------------- les mécaniques de geste
# Chaque geste du découpage relève d'une mécanique ; le programme la reconnaît aux mots de
# sa description (premier mot trouvé, dans l'ordre de la liste).
MECANIQUES = [
    ("deux pouces", "Deux doigts posés ensemble et maintenus (le mudrā)", ["deux pouces"], "à faire"),
    ("pincer", "Pincer à deux doigts", ["pincer"], "à faire"),
    ("rythme", "Toucher en rythme, ou au rythme d'un autre battement", ["rythme", "mesure"], "fait"),
    ("essuyer", "Frotter une surface (buée, encre qu'on tente d'effacer)", ["essuyer", "effacer"], "à faire"),
    ("curseur", "Régler un curseur", ["curseur"], "à faire"),
    ("défiler", "Faire défiler une galerie ou une vitrine", ["défiler"], "à faire"),
    ("attendre", "Attendre sans rien toucher", ["attendre"], "à faire"),
    ("tracer", "Tracer ou suivre un chemin du doigt (moustache, fumée, lettre)", ["tracer", "écrire du doigt", "suivre le fil"], "à faire"),
    ("porter", "Porter un objet jusqu'à sa place (glisser-déposer)", ["porter la clé", "accrocher", "glisser la lettre"], "fait"),
    ("maintenir", "Maintenir le doigt (ou une touche)", ["maintenir", "poser la paume"], "à faire"),
    ("glisser", "Glisser dans une direction", ["glisse", "remuer", "caresser", "semer", "écarter", "baisser les yeux",
                                               "lever les yeux", "lever la théière"], "en partie"),
    ("toucher", "Toucher (ou Entrée, Espace)", [], "fait"),
]


def mecanique(geste):
    for cle, _, mots_cles, _ in MECANIQUES:
        if any(m in geste for m in mots_cles):
            return cle
    return "toucher"


# ---------------------------------------------------------------- la production, chantier par chantier
# Les chantiers D3 à D7 de docs/plan-darshan.md ; les nombres sont calculés à partir des tableaux.
PRODUCTION = [
    ("D3", "Chapitres 1 et 2", ["0.1", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7",
                               "2.8", "2.9", "2.10"],
     ["dédicace sur la page de titre", "interface de dialogue (chantier I3)",
      "reflets de Paris dans le fleuve (photos ondulées par un canevas)",
      "mise au point sur une seule zone de la photo (le reste flou)", "question « assourdie » jusqu'au réveil",
      "carte du restaurant à une seule ligne", "travelling dans le parc (plans superposés)",
      "ombre d'un nuage qui balaie la photo"]),
    ("D4", "Chapitre 3", ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13",
                         "3.14"],
     ["défilé des portes de Karl passées à l'encre", "trou qui devient entrée (frisson)", "espace qui se plie (carte du carnet)",
      "calligraphie des deux vers, trait par trait, versés au carnet", "mudrā à deux doigts, respiration maintenue",
      "vision : la couleur naît du noir, la lanterne s'allume", "porte qui recule sous la main",
      "compte à rebours des quatre jours"]),
    ("D5", "Chapitres 4 et 5", ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6",
                               "5.7", "5.8", "5.9", "5.10", "5.11"],
     ["interface de Julie : téléphone, bulles sans contenu, fiche de contact au numéro vide",
      "échelle de la douleur de zéro à dix", "questions de l'hôpital mises en vers", "sac de Julie (inventaire)",
      "marché d'Aluva : cinq objets", "confettis qui éclatent", "galerie du téléphone et lunettes à repérer",
      "battements à synchroniser", "éclair (transition lumière)", "buée à essuyer"]),
    ("D6", "Chapitre 6", ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12", "6.13",
                         "6.14", "6.15"],
     ["écran partagé et listes à cocher", "ruban qui flotte au vent", "dépôt d'objets (veste, encens, thé)",
      "fil de fumée à suivre", "rideau qui s'écarte sur une autre ville", "filet de thé versé de haut",
      "attente de dix secondes, éclat brisé", "portes qui s'ouvrent sur les paysages de Karl", "main qui se retire",
      "placard-portail"]),
    ("D7", "Chapitre 7 et clôture", ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11", "7.12",
                                    "7.13", "7.14", "7.15", "7.16", "8.1"],
     ["glaçon qui devient banquise (fondu enchaîné)", "pluie qui fait fleurir le désert", "lettre écrite du doigt, encre ineffaçable",
      "transfert d'un monde à l'autre (lettre, paquet)", "course rythmée", "Paris qui se vide, le son qui se tait",
      "porte peinte qui perce la photo", "paume sur le bois, clé non proposée", "désenchantement, interface qui s'éteint",
      "texte nu, fermer le livre ; « Nouvelle lecture »"]),
]


# ---------------------------------------------------------------- les photos de Karl
# Titres tirés des fiches du site photo (dépôt Willwonderc/PexelsWillwonder), vérifiés le
# 28 septembre 2026 ; chaque photo a sa page sur photos.karlforterre.fr. Usage :
# « photo » (telle quelle, monde de Julie), « encre » (passée à l'encre et à l'aquarelle
# pour le monde de Darshan, voir images.py), « modèle » (référence pour un dessin).
PHOTOS = {
    27116682: "Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée",
    13102289: "Aube",
    24200555: "Ciel étoilé",
    38570570: "Pleine lune se levant derrière des cheminées, ciel nocturne violet",
    34500347: "Fond de tuiles",
    27046156: "Porte forgée",
    39434688: "Gros plan sur une porte ancienne patinée, rivets et peinture écaillée",
    35086240: "Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés",
    10310851: "Ponton en bois et petite barque sur une rivière calme reflétant les nuages",
    34956319: "Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages",
    10652212: "Pêcheur à la ligne sur une berge verdoyante bordée de grands arbres",
    10473138: "Rue commerçante étroite et déserte la nuit avec pavés et lanternes",
    12073837: "Ciel et pavés",
    16592454: "Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit",
    38279684: "Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé",
    20315376: "L’heure d’hier",
    33035651: "La Rotonde",
    32429293: "Chaise de terrasse française",
    32429294: "Lecture paisible",
    10524140: "Arche de rocaille au-dessus d'une allée dans un jardin romantique",
    12073840: "Pont vers la nature",
    31514847: "Amour",
    10199772: "Vieille maison couverte de lierre aux volets de bois et femme assise devant",
    34978560: "Entrée de maison éclairée par une seule lampe par une nuit de brouillard",
    33035642: "Un gratte-ciel parisien s'élançant vers un ciel nuageux spectaculaire",
    33035632: "Tour Eiffel encadrée d'arbres verts à Paris",
    39595391: "Voie lactée et ciel étoilé à couper le souffle, en Galice",
    34762346: "Porte en bois rustique et sa lanterne, charme d'autrefois",
    27025911: "Le portail",
    32429264: "Porte bleue",
    32429190: "Une porte",
    39434691: "Un cycliste passe devant une porte verte patinée, à Irun",
    23414381: "Vue majestueuse des flèches néogothiques de l'église Saint-André au-dessus de Niort",
    27025915: "Bibliothèque de rue",
    31514837: "Marché de Niort",
    10220497: "Rivière claire et peu profonde avec une passerelle et le reflet des arbres",
    33035627: "Métro",
    35375606: "Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc",
    33035652: "RER",
    19059623: "Homme en costume sur un escalator extérieur en noir et blanc",
    36117556: "Cappuccino en tasse bleue, carafe de café filtre et part de gâteau aux amandes",
    33035648: "Dos",
    18458017: "Étudiant sur sa route",
    13087478: "Chemin de terre bordé d'arbres à Moyemont, un été idyllique",
    10355467: "Piéton traversant un carrefour devant un immeuble moderne arrondi",
    10879428: "Couette blanche sur un lit devant des rideaux gris",
    11968793: "Tapis de rêves",
    31514840: "Tapis vert",
    29136749: "Tapis",
    33035628: "Style haussmannien",
    38256669: "Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait",
    29360492: "Bonbon vosgien",
    13263103: "Lune et rateau",
    13102252: "Croissant de lune dans un ciel crépusculaire aux dégradés sereins",
    38536478: "Portrait détendu d'un homme à lunettes et chemise blanche, plein d'assurance",
    10369144: "Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise",
    10683520: "Décoration de Noël avec nœud vichy rouge, baies de houx et guirlande dorée",
    34500326: "Pont de pierre à arches avec réverbères et jardinières à Cognac",
    38570569: "Détail d'une patère en bois sur un portemanteau chromé, ciré jaune en arrière-plan flou",
    12443176: "Toits pictaves",
    37296469: "Thé versé d'un gaiwan céladon dans une tasse en porcelaine blanche",
    34342149: "Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc",
    38570603: "Graffiti « je t'aime » peint en violet sur une surface orangée et rouillée",
    34894953: "Le phare du Loup, solitaire dans la brume marine",
    34849705: "Architecture gothique de l'abbaye du Mont-Saint-Michel, arches élancées et vitraux",
    38694057: "Vue aérienne des parterres élaborés des jardins de Villandry",
    10644439: "Maquette de voilier prise dans la banquise sous une lumière bleue",
    35024039: "Rochers empilés formant un monument naturel sous un ciel bleu et nuageux",
    32429189: "Couloir vers l'impasse",
    39182180: "Gros plan sur du lichen et de la mousse couvrant des rochers, à Buzy",
    35760712: "Verre de café glacé avec un gros glaçon à côté d'une carafe en verre",
    34408656: "Pluie",
    35086239: "Champ de fleurs sauvages blanches et jaunes en pleine floraison",
    22591346: "Salamandre",
    23414383: "Un banc en bois serein entouré d'un feuillage d'automne éclatant dans un parc paisible",
    39423920: "Voiture argentée garée près d'un mur, panneau bleu de virage à droite, à Irun, au Pays basque",
    31641251: "Fantômes",
}


# ---------------------------------------------------------------- les tableaux
def T(n, titre, debut, lieu, monde, entree, decor, photos=(), gestes=(), moments=(), objets=(),
      son="", note="", reperages=(), etat="à faire"):
    """Un tableau. `debut` : (paragraphe, début de phrase) ou (paragraphe, None) pour le
    paragraphe entier. `photos` : [(numéro, usage)]. `gestes` : [(phrase du livre, geste,
    équivalent au toucher simple ou au clavier)]. `moments` : [(phrase du livre, effet)]."""
    return dict(n=n, titre=titre, debut=debut, lieu=lieu, monde=monde, entree=entree, decor=decor,
                photos=list(photos), gestes=list(gestes), moments=list(moments), objets=list(objets),
                son=son, note=note, reperages=list(reperages), etat=etat)


TABLEAUX = [
    # ============================================================ ouverture
    T("0.1", "Le seuil", (8, None), "Page de titre", "livre", "—",
      "Le ciel étoilé de Karl, assombri ; le titre, दर्शन, la dédicace à Maëlle.",
      photos=[(27116682, "photo")],
      note="Le bouton « Ouvrir » est la première porte : la lumière en jaillit (transition porte). "
           "Le prototype n'affiche pas encore la dédicace.",
      son="cosmos ; démarre au premier toucher", etat="fait en partie"),
    T("0.2", "Poème d'ouverture", (11, None), "La voûte", "livre", "porte",
      "Ciel étoilé ; au dernier vers, l'aube monte à l'horizon.",
      photos=[(27116682, "photo"), (13102289, "photo")],
      moments=[("La noirceur figée finit toujours par embrasser son éblouissante frontière", "l'aube monte")],
      note="Proposition : l'aube du dernier vers devient la photo « Aube » de Karl, en fondu.",
      son="cosmos", etat="fait"),

    # ============================================================ 1. Un ciel mouvant
    T("1.1", "Le toit", (17, None), "Paris, un toit du seizième, la nuit", "Darshan", "bandes",
      "La voûte tourne autour du pôle ; toits et tour Eiffel dessinés.",
      photos=[(27116682, "encre"), (24200555, "modèle"), (38570570, "modèle")],
      moments=[("Des étincelles passent et se chassent", "deux étoiles filantes se poursuivent"),
               ("Papa, où es-tu", "la voix du père s'écrit en lumière d'étoile")],
      son="nuit", etat="fait"),
    T("1.2", "La danse sur les tuiles", (21, None), "Les toits", "Darshan", "encre",
      "Les tuiles de nuit, en perspective ; la ville s'approche à chaque bond.",
      photos=[(34500347, "photo"), (27116682, "encre")],
      gestes=[("Il enjambe cinq par cinq les tuiles", "cinq touchers en rythme, une enjambée chacun", "toucher, Espace")],
      moments=[("Ses lunettes fumées sur le nez", "premier objet")],
      objets=["+ lunettes fumées (envol)"],
      son="nuit ; saut", etat="fait"),
    T("1.3", "Le pigeonnier", (22, None), "Le pigeonnier des toits", "Darshan", "iris",
      "La porte de grilles et de bois, au clair de lune.",
      photos=[(27046156, "modèle"), (39434688, "modèle")],
      gestes=[("il ôte ses lunettes", "toucher les lunettes", "bouton de la fiche"),
              ("D’un geste vif", "glisser vers le haut", "toucher"),
              ("À peine insérée", "porter la clé jusqu'à la serrure", "toucher la clé"),
              ("Après un tour de poignet", "toucher la clé : un quart de tour", "toucher"),
              ("Il ne reste qu’à la pousser", "pousser la porte", "toucher")],
      moments=[("elles vibrent entre ses doigts, leurs couleurs s’altèrent", "vibration, couleurs qui tournent"),
               ("elles se transforment", "éclat : « La clé »"),
               ("le jour de la porte laisse transparaître la présence de l’astre solaire", "le soleil passe par les jours de la porte")],
      objets=["lunettes : portées → en main (frisson)", "lunettes → clé (fonte, puis éclat)",
              "clé : en main → dans la serrure (frisson) → tournée (frisson)"],
      son="nuit ; vibre, fonte, éclat, clé, tour, grince, souffle",
      note="Sortie par la porte : sa lumière gagne l'écran.", etat="fait"),
    T("1.4", "Aluva", (23, "Notre héros affleure"), "Aluva (Kerala), le local à kayaks", "Darshan", "porte",
      "Éblouissement, poussière dans la lumière ; le Periyar ; le tonneau où l'eau bout de poissons.",
      photos=[(35086240, "modèle"), (10310851, "encre")],
      gestes=[("Darshan se saisit du coutelas", "toucher le coutelas", "toucher"),
              ("dessine sa moustache puis taille son bouc", "tracer la moustache du doigt, puis trois petits coups pour le bouc", "toucher trois fois")],
      moments=[("Notre héros affleure de la poussière", "la poussière danse dans la lumière"),
               ("En son sein l’eau boue, mue par une vie frétillante", "les poissons frétillent ; toucher l'eau les fait sauter")],
      objets=["clé → lunettes (frisson inverse : la porte passée, la clé redevient lunettes)"],
      son="kerala ; poissons, mousse", note="Caméra subjective : le visage de Darshan ne se voit pas, seulement le "
      "trait d'or que trace le doigt.", etat="fait en partie (sans le paragraphe 24)"),
    T("1.5", "Jivan", (25, None), "Aluva, au bord du fleuve", "Darshan", "fondu",
      "Le vieux pêcheur, son filet, ses maquereaux, le tabouret rafistolé.",
      photos=[(34956319, "modèle"), (10652212, "modèle")],
      moments=[("sortant de ses filets sa prise pour qu’elle rejoigne le tonneau", "les maquereaux sautent dans le tonneau"),
               ("l’homme entame la conversation", "première bulle de dialogue")],
      son="kerala", note="Interface de dialogue : le nom de celui qui parle n'apparaît qu'une fois que le texte l'a donné."),
    T("1.6", "L'esprit local", (30, None), "Aluva", "Darshan", "—",
      "Le même décor ; le soleil tourne.",
      son="kerala", note="Dialogue ; la « délicieuse enfant » : première mention de Julie."),
    T("1.7", "Paris dans le fleuve", (34, None), "Aluva, le Periyar", "les deux", "—",
      "Le fleuve peint ; dans ses remous, des reflets de Paris la nuit : les photographies de Karl, "
      "ondulées par l'eau.",
      photos=[(38279684, "photo"), (10473138, "photo"), (12073837, "photo"), (16592454, "photo")],
      gestes=[("le regard perdu dans les remous du Periyar", "remuer l'eau du doigt : chaque remous montre Paris", "toucher l'eau")],
      moments=[("Les éclairages de nuit t’ensorcellent", "Paris de nuit dans le reflet"),
               ("Le pavé y est gris, avec ses écailles de pierre", "les pavés dans le reflet")],
      son="kerala ; rumeur de Paris sous l'eau",
      note="Premier contact des deux mondes : les photos de Karl apparaissent dans l'encre.",
      reperages=["Bateaux-mouches sur la Seine, de nuit (« l’éclat des navires parcourant la Seine »)"]),
    T("1.8", "Vieillir", (35, None), "Aluva", "Darshan", "—", "Le même décor.",
      gestes=[("en enfilant sa chemise", "enfiler la chemise : glisser vers le bas", "toucher")],
      son="kerala"),
    T("1.9", "Le départ", (39, None), "Aluva, le local à kayaks", "Darshan", "fondu",
      "La cabane à kayaks ; Jivan range son filet.",
      photos=[(20315376, "modèle"), (35086240, "modèle")],
      gestes=[("regards attentifs sur sa montre", "ouvrir la montre", "toucher"),
              ("Il se défait de ses lunettes", "ôter les lunettes : elles deviennent clé", "toucher")],
      objets=["+ montre (envol)", "lunettes → clé (éclat court : la métamorphose est connue)"],
      son="kerala ; cle", note="La montre de poche de la photo « L’heure d’hier » sert de modèle au gros plan."),

    # ============================================================ 2. Un pain perdu s'il vous plaît.
    T("2.1", "Attablé", (40, None), "Paris, un restaurant", "Julie", "bandes",
      "Le restaurant photographié, flou ; seule la main de Julie est nette.",
      photos=[(33035651, "photo"), (32429293, "photo")],
      gestes=[("Il caresse la main de sa belle avec délicatesse", "caresser la main du doigt, lentement", "maintenir le doigt")],
      son="restaurant", note="Premier chapitre photographique ; on le voit par les yeux de Darshan.",
      reperages=["Une main posée sur une nappe de restaurant (modèle)"]),
    T("2.2", "La rencontre", (42, None), "Paris, une vitrine", "Julie", "obturateur",
      "Souvenir : la vitrine, le mannequin, guêtres et robe volantée.",
      gestes=[("La chamade battait en lui", "maintenir : le cœur bat", "maintenir Espace")],
      moments=[("Son cœur balançait", "la guêtre et la robe s'allument tour à tour")],
      son="rue ; battements", note="Même vitrine qu'en 4.6, vue cette fois par Darshan.",
      reperages=["Vitrine de boutique : mannequin, guêtres, robe volantée (la vitrine de la rue Rousseau)"]),
    T("2.3", "Au diable les autres", (44, None), "Le restaurant", "Julie", "obturateur",
      "La salle se brouille ; la lumière, la nappe, un reflet.",
      photos=[(32429294, "modèle")],
      gestes=[("Au diable les autres, il n’y a qu’elle", "toucher Julie : la salle se brouille, elle seule reste nette", "toucher")],
      son="restaurant ; étouffé", note="Julie n'a pas de visage fixé par l'image : ses traits sont ceux du texte."),
    T("2.4", "Quoi ?!", (45, None), "Le restaurant", "Julie", "—", "Le même plan, net d'un coup.",
      gestes=[("répond-il presque réveillé en sursaut", "se réveiller : un toucher fait entendre la question", "toucher")],
      son="restaurant",
      note="La question de Julie reste floue et sourde tant que le lecteur ne s'est pas « réveillé »."),
    T("2.5", "L'aurore de mes jours", (50, None), "Le restaurant", "Julie", "—", "Le même plan.",
      moments=[("Tu n’as pas de téléphone", "le bouton du téléphone de Julie, grisé, côté Darshan")],
      son="restaurant"),
    T("2.6", "Le tartare", (53, None), "Le restaurant", "Julie", "—", "L'assiette : le tartare à peine picoré.",
      gestes=[("Darshan se penche sur son assiette", "baisser les yeux : glisser vers le bas", "toucher")],
      son="restaurant", reperages=["Assiette de tartare de saumon aux herbes fraîches"]),
    T("2.7", "Le pain perdu", (56, None), "Le restaurant", "Julie", "fondu",
      "La brioche perdue sur sa porcelaine jaune tournesol.",
      gestes=[("prendre la commande du dessert", "commander : la carte n'offre que le pain perdu", "toucher")],
      moments=[("un motif fleuri sur un fond jaune tournesol", "la porcelaine jaune tournesol")],
      son="restaurant ; porcelaine",
      reperages=["Pain perdu (brioche) sur une assiette à motif fleuri, fond jaune tournesol"]),
    T("2.8", "Montsouris", (60, None), "Paris, le parc Montsouris", "Julie", "obturateur",
      "Le parc ; le pont de rocaille aux branches nouées ; les amoureux accoudés ; la maison de lierre.",
      photos=[(10524140, "photo"), (12073840, "photo"), (31514847, "photo"), (10199772, "photo")],
      gestes=[("Leurs pas sous l’ombrage des arbres les conduisent sur un pont", "marcher : glisser vers le haut, le parc défile", "toucher")],
      moments=[("ils regardent le Merle noir qui fait son nid", "un merle au nid, en passant"),
               ("une petite maison beige couverte de lierre", "la maison de lierre")],
      son="parc ; merle",
      note="Le pont « sorti de terre en l’état », aux branchages noués, est un pont de rocaille : "
           "l'arche de la photo de Karl en est un."),
    T("2.9", "Le seuil de Julie", (61, None), "Devant la maison de Julie", "Julie", "fondu",
      "Le seuil, la lampe de l'entrée ; la porte épaisse se ferme ; la vue s'élève.",
      photos=[(10199772, "photo"), (34978560, "photo")],
      gestes=[("leurs joues se frôlent", "maintenir le doigt : les joues se frôlent", "maintenir")],
      moments=[("L’épaisse porte de sa belle se ferme", "la porte se ferme"),
               ("Darshan, lui, vole", "la vue s'élève au-dessus des toits")],
      son="rue ; soir"),
    T("2.10", "Le nuage", (62, "Il flirte avec Julie"), "Le ciel de Paris", "Julie", "fondu",
      "Le ciel de Paris ; un nuage passe, au sens propre, sur l'image.",
      photos=[(33035642, "photo"), (33035632, "photo")],
      moments=[("Mais un nuage vient porter ombrage à cette vision idyllique", "l'ombre d'un nuage balaie la photo")],
      son="vent"),

    # ============================================================ 3. Entre deux mondes
    T("3.1", "Le maître des portes", (63, None), "Hors du monde", "légende", "bandes",
      "Constellation de portes, à l'encre, sur un fond de voie lactée.",
      photos=[(39595391, "encre")], son="cosmos"),
    T("3.2", "Le trou dans le mur", (65, None), "Les âges", "légende", "encre",
      "Une histoire des portes : celles de Karl, passées à l'encre, défilent de mur en mur.",
      photos=[(34762346, "encre"), (27046156, "encre"), (27025911, "encre"), (32429264, "encre"),
              (32429190, "encre"), (39434691, "encre")],
      gestes=[("un trou dans un mur de terre et de paille, mais une entrée", "toucher le trou : il devient entrée", "toucher")],
      objets=["trou → entrée (frisson)"], son="cosmos ; vent"),
    T("3.3", "L'immortel", (66, None), "Les âges", "légende", "encre",
      "Vignettes à l'encre : les voies, les mains tendues, le travail, la poussière.",
      son="cosmos", note="Tableau sans geste : la page respire."),
    T("3.4", "Des lunettes qui plient l'espace", (67, None), "Hors du monde", "légende", "iris",
      "Les lunettes en gros plan ; derrière elles, l'espace se plie.",
      gestes=[("Dans le même temps qu’elles se plient, elles en font autant de l’espace",
               "pincer à deux doigts : l'espace se plie, Paris rejoint Aluva sur la carte", "toucher")],
      moments=[("Elles portent sa vue plus loin", "la fiche des lunettes reçoit la phrase")],
      objets=["lunettes → clé (éclat court, vu comme une légende)"], son="cosmos"),
    T("3.5", "Croire", (68, None), "Les parvis", "légende", "encre",
      "Anciens à barbe, ermites ; les parvis où Darshan écrit sa vie.",
      photos=[(23414381, "encre")],
      moments=[("C’est ici que j’écris ma vie", "la phrase s'écrit à l'encre sur le parvis")],
      son="cosmos ; cloches lointaines"),
    T("3.6", "Les bibliothèques", (72, None), "Bibliothèques, musées, marchés ; puis Pékin", "Darshan", "encre",
      "Rayonnages ; puis la bibliothèque nationale de Chine, vertigineuse, toute en lignes droites.",
      photos=[(27025915, "encre"), (31514837, "encre")],
      gestes=[("en soufflant l’indifférence qui s’est déposée à la surface des ouvrages",
               "souffler la poussière : glisser sur la couverture", "toucher")],
      son="bibliothèque ; pages"),
    T("3.7", "Le recueil sanskrit", (73, "Depuis un coin de table"), "Pékin, la bibliothèque nationale", "Darshan", "—",
      "Le coin de table ; le recueil ; les deux vers s'écrivent au pinceau.",
      gestes=[("Darshan pour sa part parcourt un recueil de poèmes sanskrit", "tourner les pages : toucher le coin de la page", "flèches")],
      moments=[("L’amour est le lit de la famille", "calligraphie à l'encre"),
               ("La clé de sa chambre est la sincérité et sa porte la réciprocité", "calligraphie ; les deux vers entrent au carnet")],
      son="bibliothèque"),
    T("3.8", "La porte du personnel", (76, None), "Pékin", "Darshan", "—",
      "Le recueil sous le bras ; la porte des toilettes du personnel.",
      gestes=[("disparaît avec nonchalance entre deux battements de porte", "pousser la porte des toilettes du personnel", "toucher")],
      objets=["+ recueil de poèmes (envol)", "lunettes → clé (éclat court)"], son="bibliothèque ; porte"),
    T("3.9", "Le mudrā", (77, None), "Aluva, au bord du Periyar", "Darshan", "porte",
      "Le fleuve ; les mains de Darshan, vues de ses yeux ; Jivan, discret, dans l'herbe.",
      photos=[(10310851, "encre"), (10220497, "encre")],
      gestes=[("positionne sa main droite pour qu’elle soutienne sa main gauche et que ses pouces soient en contact",
               "poser deux pouces l'un contre l'autre sur l'écran", "maintenir une touche")],
      son="kerala ; clapotis", note="Temps fort. Sur ordinateur : deux touches maintenues."),
    T("3.10", "Du noir vient la couleur", (80, None), "La vision", "Darshan", "iris",
      "Le noir ; des couleurs qui approchent ; la lanterne de bois aux motifs circulaires s'allume.",
      photos=[(34762346, "modèle")],
      gestes=[("Son inspiration l’emplit de braises", "maintenir pour inspirer, lâcher pour expirer, trois fois", "maintenir Espace")],
      moments=[("Du noir vient la couleur", "la couleur naît du noir"), ("Elle s’allume", "la lanterne s'allume")],
      son="vision ; souffle, braises",
      note="La porte du père est peinte d'après la photo de Karl « Porte en bois rustique et sa lanterne »."),
    T("3.11", "La porte inconnue", (82, None), "La vision", "Darshan", "—",
      "La porte du père ; la main tendue n'arrive jamais.",
      gestes=[("Son bras porte sa main au plus près qu’il peut de cette ouverture",
               "tendre la main : glisser vers la porte, qui recule", "toucher")],
      moments=[("La lueur de la lanterne faiblit, s’éteint", "la porte s'efface")],
      objets=["carnet : la porte du père devient une étoile à part, sans lieu"], son="vision ; silence, puis souffle"),
    T("3.12", "J'ai trouvé le chemin", (86, None), "Aluva", "Darshan", "iris",
      "Retour au fleuve : Jivan découpe des légumes.", photos=[(10652212, "modèle")], son="kerala"),
    T("3.13", "Le véritable amour", (93, None), "Aluva", "Darshan", "—", "Le même décor.", son="kerala"),
    T("3.14", "Quatre jours", (96, None), "Aluva", "Darshan", "—", "Le même décor ; le vent se lève.",
      gestes=[("sema aux quatre vents les graines de sa libération", "semer : quatre touchers, aux quatre coins de la page", "toucher quatre fois")],
      moments=[("dans quatre jours je reçois l’élue de mon cœur", "compte à rebours : quatre jours")],
      son="kerala ; vent"),

    # ============================================================ 4. Amélie et Julie
    T("4.1", "Amélie", (99, None), "Paris, le métro", "Julie", "bandes",
      "Le métro photographié par Karl.", photos=[(33035627, "photo")], son="métro",
      note="Julie parle à la première personne : l'interface change de monde (bandes aux couleurs de Julie)."),
    T("4.2", "L'hôpital", (100, "Ensuite je travaille"), "L'hôpital", "Julie", "obturateur",
      "Couloir, blouses ; les questions deviennent des vers.",
      photos=[(35375606, "photo")],
      gestes=[("Pouvez-vous évaluer votre douleur sur une échelle allant de zéro à dix",
               "curseur de zéro à dix", "flèches")],
      moments=[("la poésie, la prosodie de ces vers incompris", "les questions se mettent en vers")],
      son="hôpital", reperages=["Hôpital : couloir, blouses, sans patient ni visage"]),
    T("4.3", "La tôle qui vibre", (101, None), "Le RER, puis la supérette", "Julie", "obturateur",
      "Le RER ; l'escalier mécanique ; trois cafés brûlants.",
      photos=[(33035652, "photo"), (19059623, "photo"), (36117556, "photo")],
      gestes=[("mes mains pianotent des messages pour Amélie",
               "taper : des bulles « … » s'écrivent, sans contenu (le livre ne le donne pas)", "toucher")],
      son="métro ; vibration"),
    T("4.4", "La friperie", (102, None), "Une rue, le campus", "Julie", "obturateur",
      "Julie de dos, dans la rue ; les étudiants.",
      photos=[(33035648, "photo"), (18458017, "photo")],
      gestes=[("je me décide à faire le chemin", "marcher : glisser vers le haut", "toucher")],
      son="rue", note="La photo « Dos » de Karl : Julie vue de dos, un chouchou rouge dans les cheveux."),
    T("4.5", "Partir", (103, "Ma famille"), "La rue, puis la campagne rêvée", "Julie", "—",
      "La rue grise ; puis la campagne, le temps d'une pensée.",
      photos=[(10355467, "photo"), (13087478, "photo")],
      gestes=[("Je veux prendre l’air", "glisser vers le haut : la ville s'efface, la campagne apparaît", "toucher")],
      son="rue ; puis oiseaux de la campagne", note="Le chemin de Moyemont, photo la plus vue de Karl après le ciel étoilé."),
    T("4.6", "Le prince", (105, None), "La vitrine de la rue Rousseau", "Julie", "obturateur",
      "La vitrine du chapitre 2, vue par Julie.",
      moments=[("Il m’a abordée devant cette vitrine de la rue Rousseau", "la vitrine")],
      son="rue", reperages=["La même vitrine qu'en 2.2"]),
    T("4.7", "Un numéro", (105, "Un numéro, je me suis surprise"), "Chez Julie", "Julie", "—",
      "Le téléphone de Julie : une fiche de contact.",
      gestes=[("je me suis surprise à lui demander le sien",
               "fiche de contact : on écrit « Darshan », le numéro reste vide", "toucher")],
      moments=[("dans quatre jours je serai chez lui", "compte à rebours : quatre jours, du côté de Julie")],
      objets=["+ téléphone (le sac de Julie s'ouvre)"], son="chambre"),

    # ============================================================ 5. Douceurs et confettis
    T("5.1", "Soixante-douze heures", (109, None), "La chambre de Julie", "Julie", "bandes",
      "L'oreiller, la fenêtre ; dehors, une lueur d'or passe.",
      photos=[(10879428, "photo")],
      gestes=[("dehors, à la fenêtre, je sens sa présence", "toucher la vitre : une lueur d'or passe dehors", "toucher")],
      moments=[("Il y a encore soixante-douze heures qui me séparent de son regard", "compte à rebours : 72 heures")],
      son="chambre"),
    T("5.2", "Le marché d'Aluva", (112, None), "Aluva, le marché", "Darshan", "encre",
      "Étals peints : thés, curcuma, encens, jarres, tapisseries ; Jivan essoufflé derrière.",
      photos=[(11968793, "modèle"), (31514840, "modèle"), (29136749, "modèle"), (31514837, "modèle")],
      gestes=[("Darshan fait l’acquisition des thés les plus délicats, de curcuma, d’encens, de jarres et de tapisseries",
               "toucher chaque étal : cinq objets rejoignent le sac", "toucher cinq fois")],
      objets=["+ thés, + curcuma, + encens, + jarres, + tapisseries (cinq envols)"],
      son="marché"),
    T("5.3", "Julie est mon nord", (114, None), "Le marché", "Darshan", "—", "Le même décor.",
      moments=[("Julie est mon nord, mon étoile du matin", "la boussole du carnet se tourne vers Julie")],
      son="marché"),
    T("5.4", "À la belle étoile", (117, None), "Le marché", "Darshan", "—", "Le même décor.", son="marché"),
    T("5.5", "Le quartier Foch", (120, None), "Le marché ; la façade rêvée", "Darshan", "—",
      "Dans les paroles de Darshan, une façade couleur du lait (photo de Karl, passée à l'encre).",
      photos=[(33035628, "encre")],
      gestes=[("un paquet de confettis qui rejoint promptement ses fournitures",
               "toucher les confettis : ils éclatent, puis rejoignent le sac", "toucher")],
      objets=["+ confettis (envol)"], son="marché"),
    T("5.6", "La galerie", (124, None), "La chambre de Julie", "Julie", "obturateur",
      "Julie sur son lit, le téléphone ; la galerie : les bonbons, la glace, le croque-monsieur.",
      photos=[(38256669, "photo"), (29360492, "photo")],
      gestes=[("elle se perd dans ses photos", "faire défiler la galerie", "flèches")],
      son="chambre",
      reperages=["Pour la galerie : bonbons piquants, patinoire, croque-monsieur partagé (avec un modèle)"],
      note="Seul endroit où l'on voit Darshan : dans les photos du téléphone de Julie."),
    T("5.7", "Le révolu don Juan", (124, "L’angle du téléphone"), "La galerie du téléphone", "Julie", "glissement",
      "Les photos où ses lunettes changent ; le chevalet au bord de la Seine ; la vidéo sous la lune.",
      photos=[(13263103, "photo"), (13102252, "photo"), (38536478, "modèle")],
      gestes=[("elles changent assez régulièrement, remarque Julie",
               "toucher les lunettes sur chaque photo : toutes différentes", "toucher")],
      moments=[("une vidéo montre Darshan chanter à contre-jour de la lune", "vidéo sous la lune, en silhouette")],
      son="chambre ; ballade fredonnée (musique libre de droits)",
      reperages=["Chevalet sur les quais de la Seine ; silhouette qui chante devant la lune"],
      note="Le portrait 38536478 (lunettes, moustache, bouc) ressemble à Darshan : à n'utiliser qu'avec "
           "l'accord écrit du modèle, que seul Karl peut obtenir."),
    T("5.8", "Des garçons normaux", (125, None), "La chambre de Julie", "Julie", "—", "Le souvenir de la foule ; la mélodie.",
      gestes=[("battues par un pied leste", "battre la mesure du doigt", "toucher en rythme")],
      son="chambre ; mélodie"),
    T("5.9", "Je l'aime", (128, None), "La chambre de Julie", "Julie", "—", "La fenêtre, la lune.",
      photos=[(13102252, "photo")],
      gestes=[("Il choisit la synchronie d’une dépendance à deux", "taper au rythme d'un second cœur jusqu'à l'unisson", "toucher en rythme")],
      moments=[("La foudre est une caresse", "éclair (transition lumière)"), ("le souhait porté à la lune", "la lune")],
      son="chambre ; battements de cœur"),
    T("5.10", "La pâtisserie", (130, None), "La rue, la pâtisserie", "Julie", "obturateur",
      "La rue se fait floue ; les gâteaux, comme des bouteilles à la mer.",
      photos=[(16592454, "photo"), (10369144, "photo"), (36117556, "photo")],
      gestes=[("Julie ne voit que les mets qu’elle pourrait choisir", "faire défiler les gâteaux : éclair, chocolat, café, baba au rhum", "flèches")],
      son="rue ; puis pâtisserie", reperages=["Éclair, baba au rhum en vitrine"]),
    T("5.11", "La charlotte", (131, None), "La pâtisserie", "Julie", "—", "La vitrine embuée ; la charlotte aux framboises.",
      gestes=[("au travers d’une vitrine embuée", "essuyer la buée du doigt : la charlotte apparaît", "toucher")],
      objets=["+ ticket de la pâtisserie (envol, sac de Julie)"],
      moments=[("Elle le récupérera à onze heures et son rendez-vous est à treize heures", "deux heures au compte à rebours")],
      son="pâtisserie", reperages=["Charlotte aux framboises derrière une vitrine embuée"]),

    # ============================================================ 6. Des attentes de part et d'autre
    T("6.1", "Il est midi", (134, None), "Paris, la rue Rousseau", "Julie", "bandes",
      "Julie de dos ; le paquet ; le ruban rouge dans le mistral.",
      photos=[(33035648, "photo"), (10683520, "modèle")],
      moments=[("Le ruban rouge s’agite à chaque mouvement de balancier", "le ruban flotte au vent")],
      objets=["ticket → gâteau → paquet au ruban rouge (frisson)"], son="rue ; vent"),
    T("6.2", "Les deux listes", (136, None), "Écran partagé", "les deux", "glissement",
      "Deux moitiés : Darshan à l'encre, Julie en photo ; deux listes se cochent.",
      gestes=[("Veste, barbiche comme il faut, bague, chemise des grands jours", "cocher la liste de Darshan", "toucher"),
              ("Bague, boucles d’oreilles, gâteau, sac à main", "cocher la liste de Julie", "toucher")],
      moments=[("contrôler furtivement dans le reflet d’une vitrine son allure", "Julie dans une vitrine")],
      son="rue ; les deux rues à la fois"),
    T("6.3", "Les retrouvailles", (140, None), "Au pied de la bâtisse", "Julie", "obturateur",
      "Le balcon, la jardinière ; un halo couleur de blé.",
      photos=[(33035628, "photo"), (34500326, "modèle")],
      moments=[("un halo de la couleur du blé", "halo de blé")],
      son="rue", reperages=["Balcon parisien fleuri, sa jardinière"]),
    T("6.4", "La clé dans la poche", (144, None), "La porte de la demeure", "Julie", "—",
      "La porte ; Darshan sans ses lunettes ; puis des binocles ronds.",
      gestes=[("puis pousse la porte", "pousser la porte, comme Julie", "toucher")],
      objets=["lunettes → clé (hors champ : Julie ne voit rien)", "+ binocles (envol)"],
      son="rue ; porte", reperages=["Porte d'immeuble de maître, marbrée"]),
    T("6.5", "Le repère de la grâce", (148, None), "L'appartement", "Julie", "porte",
      "Étoffes aux fenêtres, patères, pardessus, poufs de velours.",
      photos=[(38570569, "photo")],
      gestes=[("Il l’accroche sur l’une des patères disponibles", "accrocher la veste : glisser vers la patère", "toucher"),
              ("Julie est troublée par la qualité de l’étoffe entre ses doigts", "maintenir le doigt sur le velours", "maintenir")],
      objets=["− veste de Julie (dépôt)"], son="appartement"),
    T("6.6", "Les toiles", (148, "L’encens et le thé"), "L'appartement", "les deux", "—",
      "Les toiles de Darshan : ce sont les dessins du jeu lui-même, à l'encre, et la seule aquarelle.",
      gestes=[("Leur fumet agit comme un fil d’Ariane qui guide les pas de Julie entre les toiles",
               "suivre le fil de fumée du doigt, de toile en toile", "flèches")],
      objets=["− encens, − thés (dépôt : servis dans le salon)"],
      son="appartement ; encens",
      note="Mise en abyme : les toiles accrochées sont les décors du monde de Darshan."),
    T("6.7", "Le vertige", (149, None), "L'appartement, la fenêtre", "Julie", "—",
      "Les moulures ; par la fenêtre, une ville qui n'est pas la rue Rousseau.",
      photos=[(12443176, "photo")],
      gestes=[("Au bord de sa fenêtre", "toucher le rideau, qui s'écarte : la rue n'est pas la rue Rousseau", "toucher")],
      son="appartement"),
    T("6.8", "Le thé de haut", (150, None), "L'appartement", "Julie", "—",
      "La théière levée, le filet de thé, la tasse de cuivre ; « Le lac Ladoga ».",
      photos=[(37296469, "modèle"), (34342149, "encre")],
      gestes=[("Il la hisse à hauteur d’épaule", "lever la théière : glisser vers le haut, le thé coule de haut", "maintenir")],
      moments=[("Le lac Ladoga", "le tableau : une barque sur un lac, peinte d'après Karl")],
      son="appartement ; thé versé", reperages=["Chai versé de haut dans une tasse de cuivre"]),
    T("6.9", "Théo est un ami", (153, None), "L'appartement", "Julie", "—", "Le même plan.", son="appartement"),
    T("6.10", "Le dosa", (156, None), "L'appartement", "Julie", "fondu",
      "La galette fine et croustillante ; le jour décline.",
      gestes=[("Darshan pose sa main sur celle de Julie", "maintenir : la main sur la main", "maintenir")],
      son="appartement", reperages=["Dosa sur une assiette, deux fourchettes"]),
    T("6.11", "Je tiens à toi", (158, None), "L'appartement", "Julie", "—",
      "Darshan, les mains au ciel ; l'attente.",
      photos=[(38570603, "photo")],
      gestes=[("Darshan se lève, porte ses mains au ciel et attend", "attendre, comme lui : dix secondes, sans rien toucher", "attendre")],
      moments=[("Dix longues secondes s’écoulent", "dix secondes, vraiment"),
               ("d’un mouvement de poignet les change en clés", "éclat raté : des clés"),
               ("mais elles ne mènent nulle part", "les portes ne s'ouvrent sur rien")],
      objets=["lunettes → clés (éclat brisé)"],
      son="appartement ; puis silence",
      note="Le graffiti « je t'aime » de Karl, recadré sur « aime », un instant, quand Julie le dit "
           "(choix de Karl, 29 septembre)."),
    T("6.12", "Des paysages dépourvus de sens", (161, None), "L'appartement", "les deux", "—",
      "La fonte visqueuse vue par Julie ; derrière chaque porte, un paysage de Karl, sans rapport avec le suivant.",
      photos=[(34894953, "photo"), (13087478, "photo"), (34849705, "photo"), (38694057, "photo"),
              (10644439, "photo"), (35024039, "photo")],
      gestes=[("Il répète l’opération", "ouvrir porte après porte : chacune donne sur une photo de Karl", "toucher")],
      moments=[("s’est fondue le temps d’un instant en une matière visqueuse", "la fonte des lunettes, vue du dehors")],
      son="appartement ; portes", note="Les photos les plus vues de Karl, jetées l'une après l'autre."),
    T("6.13", "Le placard", (163, None), "L'appartement", "les deux", "—",
      "La main tendue ; le placard ; la verdure proche du parc Montsouris.",
      photos=[(32429189, "photo")],
      gestes=[("Darshan se saisit de la main de Julie et l’invite à le suivre",
               "la main tendue : au toucher, Julie la retire", "toucher")],
      moments=[("le placard donne sur un espace de verdure proche du parc Montsouris", "porte : le placard s'ouvre sur un parc")],
      objets=["clé de laiton : dans la serrure du placard (frisson)"], son="appartement ; puis parc"),
    T("6.14", "Ta colère est juste", (164, None), "Le placard ouvert", "les deux", "—",
      "Par le placard : le palier de Julie, son lierre.", photos=[(10199772, "photo")], son="parc"),
    T("6.15", "Un moyen", (167, None), "Le palier de Julie", "Julie", "porte",
      "Julie seule, ses lierres, le paquet au ruban rouge.",
      photos=[(10199772, "photo"), (34978560, "photo")],
      gestes=[("elle parcourt les quelques mètres la séparant de son palier", "traverser le placard : glisser vers le haut", "toucher")],
      moments=[("son paquet au ruban rouge à la main", "le paquet, jamais offert")],
      son="rue ; soir", reperages=["Paquet de pâtisserie noué d'un ruban rouge"]),

    # ============================================================ 7. Au-delà de la porte
    T("7.1", "Le désert", (170, None), "Le désert libyque, la nuit", "Darshan", "bandes",
      "Le désert peint ; des astres fuyants ; le doigt de dieu.",
      photos=[(39595391, "encre"), (35024039, "modèle")],
      gestes=[("Paupières fermées sur le ciel", "maintenir pour fermer les yeux", "maintenir")],
      moments=[("sur elle ruissellent des astres fuyants", "étoiles filantes, comme des larmes")],
      son="désert"),
    T("7.2", "La coccinelle", (172, None), "La mousse ; puis la chambre de Julie", "les deux", "fondu",
      "La coccinelle sous des pétales fanés, dans la mousse ; puis Julie devant sa série.",
      photos=[(11968793, "photo"), (39182180, "photo")],
      moments=[("La coccinelle contrainte de quitter son jardin prépare sa diapause", "intermède"),
               ("Julie fixe sa télé", "l'écran bleu de la télévision")],
      son="vent ; puis télévision lointaine", reperages=["Coccinelle dans la mousse (macro)"]),
    T("7.3", "Une larme", (174, None), "Entre les deux mondes", "les deux", "encre",
      "Un glaçon au fond d'un verre devient banquise ; puis les dunes.",
      photos=[(35760712, "photo"), (10644439, "photo")],
      moments=[("un glaçon au fond d’un mojito ne forme pas un iceberg", "le glaçon devient banquise, en fondu enchaîné")],
      son="désert"),
    T("7.4", "Le désert fleurit", (175, None), "Le désert ; l'hôpital ; le Periyar", "les deux", "encre",
      "L'averse ; les fleurs sauvages ; les brancards ; Jivan qui prie.",
      photos=[(34408656, "photo"), (35086239, "photo")],
      gestes=[("Darshan voit le désert fleurir sous l’averse",
               "faire pleuvoir : glisser vers le bas, les fleurs naissent où tombent les gouttes", "toucher")],
      son="pluie", reperages=["Brancards dans un couloir d'hôpital, sans patient"]),
    T("7.5", "Derrière les portes", (177, None), "L'hôpital, la salle de dépôt", "Julie", "obturateur",
      "Le couloir sombre, la lanterne ; la porte du local.",
      photos=[(35375606, "photo")],
      gestes=[("elle frappe gentiment la surface de la porte", "frapper deux fois", "toucher deux fois")],
      moments=[("Darshan, tu m’entends", "silence")],
      objets=["+ électrocardiogramme (envol, sac de Julie)"], son="hôpital"),
    T("7.6", "Le feu", (183, None), "Aluva, au bord du Periyar", "Darshan", "encre",
      "Le feu des sardines ; Jivan reprend le relais.",
      photos=[(22591346, "modèle")],
      gestes=[("Darshan attise la braise du feu", "attiser : glisser sur les braises, les étincelles montent", "toucher")],
      objets=["+ de quoi écrire (envol)"], son="kerala ; feu"),
    T("7.7", "Darshan écrit", (188, None), "Aluva", "Darshan", "—",
      "La lettre, qui s'écrit à l'encre, trait par trait.",
      gestes=[("Darshan écrit", "écrire du doigt : chaque trait fait paraître les mots", "toucher")],
      objets=["+ lettre (envol)"], son="kerala ; plume"),
    T("7.8", "Encrés", (194, None), "Le local à kayaks ; la pharmacie de l'hôpital", "les deux", "—",
      "La porte du local ; la fente lumineuse ; la pharmacie d'où jaillit le papier.",
      photos=[(35086240, "modèle")],
      gestes=[("plus rien ne peut les effacer", "tenter d'effacer : l'encre résiste", "toucher"),
              ("Darshan y glisse sa déclaration", "glisser la lettre sous la porte", "toucher")],
      moments=[("voit jaillir de la fente de la pharmacie à morphiniques, un papier", "la lettre passe d'un monde à l'autre")],
      objets=["lunettes → clé (éclat court)", "lettre : Darshan → Julie (transfert)"],
      son="kerala ; course, porte, puis hôpital", reperages=["Fente d'un meuble de pharmacie, sans médicament lisible"]),
    T("7.9", "Le chemin du retour", (196, None), "Paris, le chemin de Julie", "Julie", "obturateur",
      "Le trottoir ; un banc ; trente mètres plus loin, Darshan et un paquet au ruban rouge.",
      photos=[(10355467, "photo"), (23414383, "photo")],
      gestes=[("elle court à la vue de Darshan", "courir : toucher en rythme, comme la danse des tuiles", "toucher en rythme")],
      son="rue ; été", reperages=["Rue de Rungis (Paris 13e) ; banc en été"]),
    T("7.10", "Genou à terre", (197, None), "Rue de Rungis", "Julie", "—",
      "La voiture garée ; Darshan à genou ; les remparts haussmanniens.",
      photos=[(39423920, "photo"), (33035628, "photo")],
      gestes=[("Darshan reçoit la marque de dilection sur sa nuque", "maintenir : le baiser", "maintenir")],
      moments=[("Le ruban de satin s’affole", "le ruban s'affole au vent")],
      son="rue ; tout ralentit"),
    T("7.11", "Éclipse", (200, None), "Rue de Rungis", "Julie", "—",
      "Des souliers au regard ; puis passants et voitures s'effacent de la photo.",
      photos=[(31641251, "photo"), (10473138, "photo")],
      gestes=[("remontent une robe crépue de la couleur de l’orange", "lever les yeux : glisser vers le haut", "toucher")],
      moments=[("Le contact de leurs corps éclipse tout Paris", "passants et voitures s'effacent, le son se tait")],
      objets=["paquet au ruban rouge : Darshan → Julie (transfert)"], son="rue ; qui se tait",
      reperages=["Souliers et robe orange (modèle)"]),
    T("7.12", "La porte du père", (204, None), "Rue de Rungis", "les deux", "—",
      "Les dalles se fendent : la porte à la lanterne, peinte, perce le Paris photographié.",
      photos=[(34762346, "encre"), (12073837, "photo")],
      moments=[("vibrent sous leurs pieds", "le téléphone vibre, l'image tremble"),
               ("laissent apparaître le linteau", "la porte du père perce la photo")],
      son="rue ; grondement, puis la lanterne", note="Temps fort : seule image où l'encre de Darshan entre dans le Paris de Julie."),
    T("7.13", "Le choix", (207, None), "Rue de Rungis", "les deux", "—", "La porte ; les curieux aux fenêtres.",
      gestes=[("pose sa main sur l’éternel bois du pont menant vers son créateur",
               "poser la paume sur le bois : la clé, pour une fois, n'est pas proposée", "maintenir")],
      son="silence"),
    T("7.14", "La prière", (212, None), "Rue de Rungis", "les deux", "—", "La main sur le bois.",
      moments=[("En faisant de moi un mortel", "désenchantement : la clé quitte le sac, les étoiles du carnet s'éteignent")],
      objets=["clé : désenchantement (elle se défait en poussière d'or)", "le bouton « Objets » disparaît"],
      son="silence ; souffle"),
    T("7.15", "La chute", (213, None), "Rue de Rungis", "Julie", "—",
      "La porte tombe sans laisser de trace ; les passants reprennent leur chemin.",
      photos=[(31641251, "photo")],
      moments=[("un bruit sourd et puissant retentit", "le choc ; plus aucune trace d'encre")],
      son="rue ; choc, puis la ville revient"),
    T("7.16", "La fantasy s'achève", (214, None), "La page", "livre", "fondu",
      "Texte nu sur papier : plus d'interface.",
      moments=[("Ne sentez-vous pas toujours cette distance qui se crée en fermant votre porte",
                "la dernière question, sans bouton ni geste")],
      son="silence", note="Option personnelle, que seul Karl décide : une vraie photo pour dernière image."),

    # ============================================================ clôture
    T("8.1", "Poème de clôture", (216, None), "La page", "livre", "fondu",
      "Texte nu ; dernier geste : fermer le livre.", son="silence",
      note="Au retour, la page de titre montre un ciel sans constellation ; « Nouvelle lecture » rallume tout."),
]


# ---------------------------------------------------------------- vérifications
def position(t):
    numero, phrase = t["debut"]
    if phrase is None:
        return (numero, 0)
    k = lignes[numero].find(phrase)
    assert k > 0, f"{t['n']} : « {phrase} » introuvable au paragraphe {numero}"
    return (numero, k)


def texte(i):
    """Texte du tableau i, paragraphes séparés par une ligne vide."""
    a = position(TABLEAUX[i])
    b = position(TABLEAUX[i + 1]) if i + 1 < len(TABLEAUX) else (DERNIER + 1, 0)
    morceaux = []
    for p in range(a[0], b[0] + 1):
        if p not in lignes or p > DERNIER:
            continue
        debut = a[1] if p == a[0] else 0
        fin = b[1] if p == b[0] else len(lignes[p])
        if fin > debut:
            morceaux.append(lignes[p][debut:fin].strip())
    return "\n\n".join(morceaux)


def mots(s):
    return len(s.split())


def verifier():
    for c, (titre, p) in CHAPITRES.items():
        if p is not None:
            assert lignes[p] == titre, f"chapitre {c} : « {lignes[p]} » au lieu de « {titre} »"
    assert TABLEAUX[0]["debut"] == (PREMIER, None)
    positions = [position(t) for t in TABLEAUX]
    assert positions == sorted(positions) and len(set(positions)) == len(positions), "ordre des tableaux"
    vus = set()
    for i, t in enumerate(TABLEAUX):
        assert t["n"] not in vus, t["n"]
        vus.add(t["n"])
        s = texte(i)
        m = mots(s)
        assert MOTS_MIN <= m <= MOTS_MAX, f"{t['n']} : {m} mots"
        for phrase, *_ in t["gestes"] + t["moments"]:
            assert phrase in s, f"{t['n']} : « {phrase} » absent du tableau"
        for pid, usage in t["photos"]:
            assert pid in PHOTOS, f"{t['n']} : photo {pid} sans titre"
            assert usage in ("photo", "encre", "modèle"), usage
        assert t["entree"] in [x[0] for x in TRANSITIONS], f"{t['n']} : transition {t['entree']}"
    for t in TABLEAUX:
        assert ambiance(t) in AMBIANCES, f"{t['n']} : ambiance « {ambiance(t)} » inconnue"
    # chaque tableau à faire appartient à un seul chantier de production
    prevus = [n for _, _, ns, _ in PRODUCTION for n in ns]
    assert len(prevus) == len(set(prevus)), "tableau prévu deux fois"
    for t in TABLEAUX:
        if t["n"] not in prevus:
            assert t["etat"] == "fait", f"{t['n']} n'est dans aucun chantier"
    # tout le texte, une seule fois, dans l'ordre
    tout = "".join(texte(i).replace("\n\n", "") for i in range(len(TABLEAUX)))
    livre = "".join(lignes[p].strip() for p in range(PREMIER, DERNIER + 1))
    assert re.sub(r"\s+", "", tout) == re.sub(r"\s+", "", livre), "le découpage ne redonne pas le livre"


# ---------------------------------------------------------------- le document
def chapitre_de(t):
    return int(t["n"].split(".")[0])


def plage(i):
    a = position(TABLEAUX[i])
    b = position(TABLEAUX[i + 1]) if i + 1 < len(TABLEAUX) else (DERNIER + 1, 0)
    fin = b[0] if b[1] > 0 else b[0] - 1
    return f"¶{a[0]}" if a[0] == fin else f"¶{a[0]}–{fin}"


def extrait(s, n=9):
    s = s.replace("\n\n", " / ")
    debut = " ".join(s.split()[:n])
    fin = " ".join(s.split()[-6:])
    return f"« {debut} … {fin} »"


def lien_photo(pid):
    # chaque photo a sa page sur le site photo de Karl, qui mène au téléchargement sur Pexels
    return f"[{pid}](https://photos.karlforterre.fr/photo/{pid}/) « {PHOTOS[pid]} »"


def document():
    lignes_md = []
    w = lignes_md.append
    total = sum(mots(texte(i)) for i in range(len(TABLEAUX)))
    w("# Darshan : le découpage de toute l'histoire")
    w("")
    w("Document écrit par `outils/darshan/decoupage.py` ; ne pas le modifier à la main, mais corriger")
    w("les données du programme et le relancer (`python3 outils/darshan/decoupage.py`). Le programme")
    w("vérifie que les tableaux, mis bout à bout, redonnent tout le texte de l'édition 2023, de la")
    w("dédicace au poème de clôture, et que chaque geste naît d'une phrase qui figure mot pour mot dans")
    w("son tableau.")
    w("")
    w("Plan d'ensemble et chantiers : [plan-darshan.md](plan-darshan.md) ; interface (fiches d'objet,")
    w("carnet, dialogues, téléphone de Julie) : [plan-darshan-interface.md](plan-darshan-interface.md).")
    w("")
    w("## En bref")
    w("")
    photos_utilisees = sorted({p for t in TABLEAUX for p, _ in t["photos"]})
    reperages = [(t["n"], r) for t in TABLEAUX for r in t["reperages"]]
    gestes = sum(len(t["gestes"]) for t in TABLEAUX)
    w(f"- **{len(TABLEAUX)} tableaux**, {total} mots, de 40 à 160 mots chacun (moyenne "
      f"{round(total / len(TABLEAUX))}).")
    w(f"- **{gestes} gestes**, tous nés d'une phrase du livre ; chacun a son équivalent au toucher simple "
      "et au clavier.")
    w(f"- **{len(photos_utilisees)} photographies de Karl** mises en scène : telles quelles dans le monde "
      "de Julie, passées à l'encre dans celui de Darshan, ou comme modèles des dessins.")
    w(f"- **{len(reperages)} repérages** : les photos qui manquent encore, à prendre par Karl "
      "(liste à la fin).")
    faits = [t["n"] for t in TABLEAUX if t["etat"].startswith("fait")]
    w(f"- Déjà jouables dans le prototype : {', '.join(faits)}.")
    w("")
    w("| Chapitre | Paragraphes | Tableaux | Mots | Monde | Gestes |")
    w("|---|---|---|---|---|---|")
    for c, (titre, _) in CHAPITRES.items():
        idx = [i for i, t in enumerate(TABLEAUX) if chapitre_de(t) == c]
        if not idx:
            continue
        a = position(TABLEAUX[idx[0]])[0]
        z = position(TABLEAUX[idx[-1] + 1])[0] - 1 if idx[-1] + 1 < len(TABLEAUX) else DERNIER
        mondes = sorted({TABLEAUX[i]["monde"] for i in idx})
        nom = titre if c in (0, 8) else f"{c}. {titre}"
        w(f"| {nom} | {a}–{z} | {len(idx)} | {sum(mots(texte(i)) for i in idx)} | {', '.join(mondes)} | "
          f"{sum(len(TABLEAUX[i]['gestes']) for i in idx)} |")
    w("")
    w("## La grammaire des transitions")
    w("")
    w("Toutes existent dans le moteur (`outils/darshan/src/moteur.js`, module `Transitions`) et se voient")
    w("sur le banc d'essai, `dist/web/transitions.html`, après fabrication. Chaque balayage a deux")
    w("moitiés : couvrir la scène qui part, découvrir celle qui arrive. L'édition web joue les deux ;")
    w("dans l'EPUB, où chaque page est un document à part, la page joue la seconde à son ouverture")
    w("(attribut `data-entree`). Si le système demande moins de mouvement, tout devient fondu court,")
    w("et l'éclat d'un objet une image fixe qui reste le temps d'être lue.")
    w("")
    w("| Transition | Quand | Durée |")
    w("|---|---|---|")
    for cle, nom, quand, duree in TRANSITIONS:
        w(f"| **{nom}** (`{cle}`) | {quand} | {duree} |")
    w("")
    w("Changements d'état des objets :")
    w("")
    w("| Effet | Quand | Durée | Moteur |")
    w("|---|---|---|---|")
    for cle, quand, duree, etat in EFFETS_OBJETS:
        w(f"| **{cle}** | {quand} | {duree} | {etat} |")
    w("")
    w("Palette des transitions de Darshan : encre `#07091a`, vermillon (sindoor) `#c9302c`, or `#f4c56a`,")
    w("crème `#fff4de`. Celles de Julie : lames d'obturateur gris anthracite, blanc de papier photo.")
    w("")
    w("## Les ambiances sonores")
    w("")
    w("Une par lieu, fabriquée en direct (Web Audio) ; « fait » : déjà dans le prototype.")
    w("")
    w("| Ambiance | Ce qu'on entend | Tableaux | Moteur |")
    w("|---|---|---|---|")
    for cle, (desc, etat) in AMBIANCES.items():
        ou = [t["n"] for t in TABLEAUX if ambiance(t) == cle]
        w(f"| **{cle}** | {desc} | {len(ou)} | {etat} |")
    w("")
    w("## Les mécaniques de geste")
    w("")
    w("Tous les gestes du livre se ramènent à douze mécaniques. « Fait » : déjà dans le prototype.")
    w("Aucun glissement horizontal : dans Apple Books, il tourne la page. Les glissements vont vers")
    w("le haut ou le bas, ou restent dans une zone, et un toucher simple les remplace toujours.")
    w("")
    w("| Mécanique | Description | Gestes | Tableaux | Moteur |")
    w("|---|---|---|---|---|")
    for cle, desc, _, etat in MECANIQUES:
        ou = [t["n"] for t in TABLEAUX for g in t["gestes"] if mecanique(g[1]) == cle]
        uniques = sorted(set(ou), key=lambda n: [int(x) for x in n.split(".")])
        w(f"| **{cle}** | {desc} | {len(ou)} | {', '.join(uniques)} | {etat} |")
    w("")
    w("## Les objets et leurs états")
    w("")
    w("| Tableau | Changement |")
    w("|---|---|")
    for t in TABLEAUX:
        for o in t["objets"]:
            w(f"| {t['n']} {t['titre']} | {o} |")
    w("")
    for c, (titre, _) in CHAPITRES.items():
        idx = [i for i, t in enumerate(TABLEAUX) if chapitre_de(t) == c]
        if not idx:
            continue
        w(f"## {titre if c in (0, 8) else f'Chapitre {c} : {titre}'}")
        w("")
        for i in idx:
            t = TABLEAUX[i]
            s = texte(i)
            etat = f" · **{t['etat']}**" if t["etat"] != "à faire" else ""
            w(f"### {t['n']} {t['titre']}")
            w("")
            w(f"{plage(i)}, {mots(s)} mots{etat} : {extrait(s)}")
            w("")
            entree = "même plan" if t["entree"] == "—" else t["entree"]
            w(f"- **Lieu** : {t['lieu']} · **monde** : {t['monde']} · **entrée** : {entree}")
            w(f"- **Décor** : {t['decor']}")
            if t["photos"]:
                w("- **Photos de Karl** : " + " ; ".join(f"{lien_photo(p)} ({u})" for p, u in t["photos"]))
            for phrase, geste, equivalent in t["gestes"]:
                w(f"- **Geste** : « {phrase} » → {geste} (sinon : {equivalent})")
            for phrase, effet in t["moments"]:
                w(f"- **Moment** : « {phrase} » → {effet}")
            for o in t["objets"]:
                w(f"- **Objet** : {o}")
            if t["son"]:
                w(f"- **Son** : {t['son']}")
            if t["note"]:
                w(f"- **Note** : {t['note']}")
            for r in t["reperages"]:
                w(f"- **Repérage** : {r}")
            w("")
    w("## Production, chantier par chantier")
    w("")
    w("Les chantiers D3 à D7 de [plan-darshan.md](plan-darshan.md), une session chacun, dans l'ordre.")
    w("Avant eux, D1 (fondations) et D2 (direction artistique, dont le passage à l'encre des photos),")
    w("et les chantiers I1 et I2 de l'interface. Les nombres viennent du découpage ci-dessus.")
    w("")
    deja, deja_sons = set(), set()
    for code, nom, ns, effets in PRODUCTION:
        ts = [t for t in TABLEAUX if t["n"] in ns]
        idx = [i for i, t in enumerate(TABLEAUX) if t["n"] in ns]
        plans = [t for t in ts if t["entree"] != "—"]
        dessins = [t for t in plans if t["monde"] in ("Darshan", "légende")]
        photos = sorted({p for t in ts for p, u in t["photos"] if u == "photo"})
        encres = sorted({p for t in ts for p, u in t["photos"] if u == "encre"})
        meca = sorted({mecanique(g[1]) for t in ts for g in t["gestes"]})
        nouvelles = [m for m in meca if m not in deja and dict((c, e) for c, _, _, e in MECANIQUES)[m] != "fait"]
        deja |= set(meca)
        sons = sorted({ambiance(t) for t in ts})
        sons_neufs = [x for x in sons if AMBIANCES[x][1] != "fait" and x not in deja_sons]
        deja_sons |= set(sons)
        rep = [r for t in ts for r in t["reperages"]]
        w(f"### {code}. {nom}")
        w("")
        w(f"- **Tableaux** : {len(ts)} ({ts[0]['n']} à {ts[-1]['n']}), {sum(mots(texte(i)) for i in idx)} mots, "
          f"{sum(len(t['gestes']) for t in ts)} gestes")
        w(f"- **Plans nouveaux** : {len(plans)}, dont {len(dessins)} décors dessinés (monde de Darshan)")
        w(f"- **Photos de Karl** : {len(photos)} telles quelles, {len(encres)} passées à l'encre ; "
          f"**repérages** : {len(rep)}")
        w(f"- **Mécaniques** : {', '.join(meca)}" + (f" ; nouvelles : **{', '.join(nouvelles)}**" if nouvelles else ""))
        w(f"- **Ambiances sonores** : {', '.join(sons)}" + (f" ; nouvelles : **{', '.join(sons_neufs)}**" if sons_neufs else ""))
        w(f"- **À construire** : {' ; '.join(effets)}.")
        w("")
    w("## Repérages : les photos à prendre")
    w("")
    w("Karl les prend à sa manière ; sans visage reconnaissable, ou avec l'accord écrit du modèle.")
    w("")
    for n, r in reperages:
        w(f"- {n} : {r}")
    w("")
    w("## Index des photographies de Karl")
    w("")
    w("| Photo | Tableaux | Usages |")
    w("|---|---|---|")
    for pid in photos_utilisees:
        ou = [t["n"] for t in TABLEAUX if any(p == pid for p, _ in t["photos"])]
        usages = sorted({u for t in TABLEAUX for p, u in t["photos"] if p == pid})
        w(f"| {lien_photo(pid)} | {', '.join(ou)} | {', '.join(usages)} |")
    w("")
    w("Chaque photo est de Karl Forterre, publiée sur Pexels sous une licence qui en permet l'usage")
    w("commercial ; les originaux ne sont pas copiés dans ce dépôt : `images.py` télécharge au besoin")
    w("le fichier public et en tire le décor (voir `outils/darshan/README.md`).")
    w("")
    return "\n".join(lignes_md)


if __name__ == "__main__":
    verifier()
    SORTIE.write_text(document(), encoding="utf-8")
    total = sum(mots(texte(i)) for i in range(len(TABLEAUX)))
    print(f"{len(TABLEAUX)} tableaux, {total} mots, découpage vérifié : {SORTIE.relative_to(RACINE)}")
