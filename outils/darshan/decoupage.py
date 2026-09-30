"""Découpage de Darshan en tableaux : le plan de toute l'édition jouable.

Usage : python3 outils/darshan/decoupage.py
Python seul, sans module à installer. Le programme lit le texte dans livres/darshan.epub
(par texte.py), vérifie le découpage et écrit docs/darshan-decoupage.md.

Un tableau, c'est une page fixe de l'EPUB (une scène de l'édition web) : un décor, un
morceau du texte, parfois un geste. Chaque tableau commence à un paragraphe du livre, ou
à une phrase de ce paragraphe, et s'arrête où commence le suivant : le programme vérifie
que les tableaux, mis bout à bout, redonnent tout le texte, de la dédicace au poème de
clôture, sans trou ni chevauchement, et que chacun compte entre 40 et 160 mots.

Les gestes et les moments forts citent la phrase du livre qui les fait naître ; le
programme vérifie que cette phrase figure, mot pour mot, dans le texte du tableau, et que
chaque geste est reconnu sous la mécanique que lui donne sa fiche (livre.py). Rien n'est
inventé : les textes d'interface (consignes, boutons) sont dans interface.ini, que Karl
valide (docs/plan-darshan-interface.md, section 9).

Les tableaux sont ceux de la pré-production (docs/darshan-mise-en-scene/) : les fiches des sept
chapitres, corrigées par la synthèse (synthese.md, partie 8), qui fait foi. build.py fabrique le
livre entier à partir de ces données (TABLEAUX) et des réglages de livre.py.
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
# Une seule règle : la transition dit ce qui se passe entre deux tableaux. Le moteur les joue
# (src/js/transitions.js) ; banc d'essai : dist/web/transitions.html. Les deux variantes des bandes
# (synthèse 2.2, ligne 23) sont à écrire : en attendant, le moteur joue un fondu.
TRANSITIONS = [
    ("—", "Même plan", "Le décor reste, seul le texte change (dialogue, suite d'une même action).", "aucune"),
    ("fondu", "Fondu", "Même lieu, le temps passe (au noir, ou au blanc de la page pour la fin).", "600 + 650 ms"),
    ("encre", "Encre", "Darshan change de lieu : trois coups de pinceau couvrent la page puis s'en retirent.", "780 + 820 ms"),
    ("bandes", "Bandes", "Ouverture de chapitre, façon Persona : bandes obliques d'encre, de vermillon et d'or, "
     "trame de points ; le titre du chapitre claque sur la bande centrale (1.1, 3.1, 7.1).", "640 ms + titre 1,6 s + 680 ms"),
    ("bandes-photo", "Bandes sur photo", "Ouverture d'un chapitre photographié (2.1, 6.1) : les bandes du chapitre, "
     "dont la seconde moitié découvre la photo par les lames de l'obturateur, avec son double déclic.",
     "640 ms + titre 1,6 s + 420 + 520 ms"),
    ("bandes-julie", "Bandes de Julie", "Ouverture des chapitres où Julie dit « je » (4.1, 5.1) : les mêmes bandes en "
     "anthracite, gris et blanc de papier photo, grain argentique au lieu de la trame, sortie par l'obturateur, ni or "
     "ni vermillon ; en 5.1, en lilas, le grain devenu confettis (réglage `entree` de livre.py).",
     "640 ms + titre 1,6 s + 420 + 520 ms"),
    ("iris", "Iris", "Vision, petite porte, regard qui se resserre : un cercle cerné d'or se referme sur un point "
     "et s'ouvre ailleurs.", "760 + 900 ms"),
    ("porte", "Porte", "On franchit une porte : sa lumière gagne l'écran, puis la scène suivante paraît dans une "
     "embrasure qui s'élargit jusqu'à nous.", "900 + 1 250 ms"),
    ("lumiere", "Lumière", "Éblouissement, foudre : une lumière qui s'étend puis se dissipe.", "900 + 2 000 ms"),
    ("obturateur", "Obturateur", "Le monde de Julie, fait des photographies de Karl : les lames d'un obturateur "
     "se ferment et s'ouvrent sur la photo suivante, avec un double déclic.", "420 + 520 ms"),
    ("glissement", "Glissement", "Le téléphone de Julie : on passe d'une photo à l'autre (5.7).", "360 + 420 ms"),
]
EFFETS_OBJETS = [
    ("frisson", "Un objet change d'état sans changer de nature (les lunettes ôtées, la clé dans la serrure) : "
     "étoile et rayons autour de l'objet, tintement de verre.", "560 ms", "fait"),
    ("frisson hors champ", "Un objet change dans le sac sans que l'image le montre (les lunettes en 5.7, la clé en 6.4) : "
     "une étoile d'or sur le bouton « Objets », un tintement minuscule.", "0,5 s", "à faire"),
    ("envol", "Un objet entre dans le sac : bandeau oblique « Nouvel objet », puis l'objet vole jusqu'au bouton "
     "« Objets », qui apparaît à son arrivée ; chez Julie, un bandeau gris au-dessus du bouton de son sac, avec le "
     "vibreur.", "≈ 2 s", "fait"),
    ("éclat", "Un objet se métamorphose : bandes, trame, étoiles, l'objet arrive en tournoyant, son nom en grand, "
     "et le fragment du livre qui raconte la métamorphose ; puis sa fiche s'ouvre en diagonale.", "≈ 2,8 s", "fait"),
    ("éclat court", "La même métamorphose, déjà connue (1.9, 7.8) : le frisson, la fonte, le nom seul, sans bandes ; "
     "la clé peut naître déjà dans la serrure.", "≈ 1 s", "en partie"),
    ("éclat brisé", "La métamorphose qui ne mène nulle part (6.11) : des fêlures courent sur les bandes, qui se brisent "
     "en six éclats et tombent hors de la page ; la clé va au sac sans fiche.", "≈ 1,5 s", "à faire"),
    ("dépôt", "Un objet quitte le sac pour la scène, sans annonce (l'encens et les thés servis, le curcuma du dosa, "
     "le paquet de Darshan que Julie prend).", "instant", "fait"),
    ("transfert", "Un objet passe d'un personnage à l'autre, d'un monde à l'autre : la lettre jaillit de la fente de "
     "la pharmacie, virevolte sous la lampe, puis rejoint le sac de Julie.", "≈ 1,5 s", "en partie"),
    ("désenchantement", "La magie s'en va (7.14), neuf secondes sans un son : l'or quitte les mots, la clé tombe en "
     "poussière d'or, les étoiles du carnet s'éteignent, les boutons disparaissent.", "≈ 9 s", "en partie"),
]

# ---------------------------------------------------------------- les ambiances sonores
# Fabriquées en direct par le moteur (src/js/son.js, Web Audio), sans fichier ; une par lieu. Le
# champ `son` d'un tableau commence par son ambiance, avec entre parenthèses ses variantes pour
# cette page (« kerala (soir) ») ; puis, après « ; », ses événements. Aucune parole enregistrée :
# pas d'annonce ni de dialogue inventés. Les changements au milieu d'une page sont des effets
# (`ambiance`, dans livre.py).
AMBIANCES = {
    "cosmos": ("La voûte : sinus lents, souffle", "fait"),
    "nuit": ("Les toits la nuit : vent, air, rumeur de la ville", "fait"),
    "kerala": ("Aluva : le fleuve et ses remous, les oiseaux, un tanpura", "fait"),
    "silence": ("Plus rien : le son se tait, couches comprises", "fait"),
    "vent": ("Le ciel, le désert la nuit : le vent seul", "fait"),
    "restaurant": ("Couverts, murmure de salle, pas du serveur", "fait"),
    "rue": ("Paris : pas, voitures au loin, pigeons", "fait"),
    "parc": ("Feuillage, gravier, oiseaux (le merle)", "fait"),
    "bibliothèque": ("Silence habité, pages tournées, pas feutrés", "fait"),
    "vision": ("Le mudrā : le fleuve lointain, des grillons, un souffle à chaque inspiration, des braises ; puis plus "
               "d'air, seul l'accord du père", "fait"),
    "métro": ("La tôle qui vibre, les freins", "fait"),
    "hôpital": ("Couloir, bips lointains, chariots", "fait"),
    "chambre": ("Pièce calme, rue étouffée", "fait"),
    "marché": ("Aluva : foule, marchands, chaleur", "fait"),
    "pâtisserie": ("Vitrine réfrigérée, clochette de la porte", "fait"),
    "appartement": ("Tentures, horloge, encens qui crépite", "fait"),
    "désert": ("Sable qui file, nuit immense", "fait"),
    "pluie": ("Averse, puis gouttes", "fait"),
}
# Les variantes d'une ambiance pour une page isolée (synthèse, partie 8.3), que son.js sait faire
VARIANTES = {
    "kerala": {"soir": "le Periyar du soir : moins d'oiseaux, des grillons"},
    "bibliothèque": {"vaste": "la même sous une voûte plus vaste (Pékin, d'après Gijón)"},
    "métro": {"rame": "dans la rame : la tôle qui vibre"},
    "rue": {"dense": "les « vapeurs automobiles »", "nuit": "la nuit : peu de voitures, la foule",
            "été": "le soir d'été, les martinets"},
    "chambre": {"fenêtre": "la rue s'entrouvre à la fenêtre"},
    "appartement": {"horloge": "l'horloge au premier plan"},
    "désert": {"vent": "le vent qui tombe, les yeux fermés", "jour": "la chaleur du jour"},
    "vent": {"feuilles": "le vent dans des feuilles"},
}


def ambiance(t):
    """L'ambiance d'un tableau : le premier mot de son champ `son`, sans ses variantes."""
    return t["son"].split(";")[0].split("(")[0].strip()


def variantes(t):
    """Les variantes de l'ambiance pour cette page : ce qui est entre parenthèses après son nom."""
    m = re.search(r"\(([^)]*)\)", t["son"].split(";")[0])
    return [v.strip() for v in m.group(1).split(",")] if m else []


# ---------------------------------------------------------------- les mécaniques de geste
# Les 27 mécaniques du cahier des charges (synthèse, partie 3.1), avec leur état dans le moteur
# (src/js/mecaniques.js). Chaque geste du découpage relève d'une mécanique ; le programme la
# reconnaît aux mots de sa description (premier mot trouvé, dans l'ordre de la liste), et vérifie
# que c'est celle de sa fiche (livre.py).
MECANIQUES = [
    ("deux-pouces", "Deux doigts posés et maintenus : le sceau du mudrā", ["deux pouces"], "à écrire"),
    ("paume", "Poser la paume sur le bois et la garder : rien ne s'ouvre, aucune clé", ["poser la paume"], "à écrire"),
    ("respirer", "Maintenir pour inspirer, lâcher pour expirer", ["inspirer"], "à écrire"),
    ("curseur", "Une réglette verticale de zéro à dix, qui se retourne", ["curseur", "réglette"], "à écrire"),
    ("messages", "Pianoter sur le téléphone de Julie : des bulles, sans texte", ["pianoter"], "à écrire"),
    ("contact", "Tendre le téléphone : il revient avec un nom, sans numéro", ["numéro"], "à écrire"),
    ("galerie", "Ouvrir la galerie du téléphone de Julie, puis la feuilleter", ["la galerie"], "à écrire"),
    ("etals", "Toucher chaque étal : la marchandise s'envole vers le sac", ["étal"], "à écrire"),
    ("liste", "Cocher une liste, dans une moitié de l'écran partagé", ["cocher"], "à écrire"),
    ("verser", "Lever la théière : le filet s'allonge jusqu'à la tasse", ["théière"], "à écrire"),
    ("attendre", "Attendre sans rien toucher ; « Continuer » presse le temps sans le couper", ["attendre"], "écrite"),
    ("portes", "Chaque toucher ouvre une porte d'encre sur un paysage, qui claque de plus en plus vite",
     ["porte après porte"], "à écrire"),
    ("main", "Prendre la main de Julie : elle reste immobile, puis se retire", ["prendre sa main"], "à écrire"),
    ("ecrire", "Garder le doigt sur la feuille : la plume écrit, ligne après ligne", ["écrire du doigt"], "à écrire"),
    ("effacer", "Frotter de haut en bas : le papier s'use, l'encre résiste", ["effacer"], "à écrire"),
    ("essuyer", "Frotter la buée en petits cercles : un hublot s'ouvre", ["buée"], "à écrire"),
    ("caresser", "Un va-et-vient lent dans un petit cercle (la main de Julie, le velours)", ["caresser"], "à écrire"),
    ("remuer", "Remuer l'eau en petits cercles : les reflets se forment", ["remuer"], "à écrire"),
    ("semer", "Toucher les quatre points de la rose des vents", ["rose des vents"], "à écrire"),
    ("tendre", "La main d'or monte vers la porte et s'arrête à un doigt du bois", ["tendre la main"], "à écrire"),
    ("tourner", "Un quart de tour du doigt autour de la serrure, sur un cercle de 260 unités (les trois clés)",
     ["tourner la clé", "quart de tour"], "écrite"),
    ("tracer", "Suivre du doigt un guide compact (la moustache de mousse)", ["tracer"], "écrite"),
    ("porter", "Porter un objet jusqu'à sa place (la clé, la lettre)", ["porter la clé", "glisser la lettre"], "écrite"),
    ("rythme", "Toucher en rythme, au rythme du lecteur, jamais de pulsation (les tuiles, les pas, la course)",
     ["rythme"], "écrite"),
    ("maintenir", "Maintenir le doigt posé (le cœur : chamade, deux cœurs, unisson ; les paupières)", ["maintenir"],
     "écrite"),
    ("glisser", "Un glissement vertical (le geste vif, la marche lente, le regard qui se baisse)", ["glisser"], "écrite"),
    ("toucher", "Toucher la cible, ou n'importe où (Entrée, Espace)", [], "écrite"),
]


def mecanique(geste):
    for cle, _, mots_cles, _ in MECANIQUES:
        if any(m in geste for m in mots_cles):
            return cle
    return "toucher"


# ---------------------------------------------------------------- la production, chantier par chantier
# Les chantiers D3 à D7 de docs/plan-darshan.md ; les nombres sont calculés à partir des tableaux. Ce qu'il
# faut construire, avec les noms du cahier des charges (synthèse, partie 3), est repris des chapitres.
PRODUCTION = [
    ("D3", "Ouverture, chapitres 1 et 2", ["0.1", "0.2", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9",
                                          "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"],
     ["seuil : la dédicace qui paraît d'elle-même, « Ouvrir » actif dès l'arrivée",
      "poème : calque d'arbres fixe, poussière d'or, fil d'or (frontiere) et course des astres (course)",
      "toit : la voix lettre à lettre (voix) ; l'appel, la quinte à vide (son appel)",
      "pigeonnier : tourner (260 unités), la clé portée vers le haut, le jour et l'autre côté (jour, autre-cote)",
      "chaleur d'Aluva ; moustache de mousse (tracer) ; naissance du carnet", "clin d'œil d'encre (clin)",
      "reflets de Paris dans le fleuve (remuer, reflet) et fragment de la ballade sous l'eau (melodie)",
      "lumière qui vieillit, silence du tanpura, lin de la chemise (lin)",
      "cabane à kayaks dessinée, en or, et son jour ; salut de la vue (camera)",
      "bandes qui s'ouvrent par l'obturateur (bandes-photo)", "caresse lente, flou qui suit le geste (caresser, flou)",
      "le cœur sous le doigt : chamade, puis deux cœurs à trois contre deux (maintenir, balance, valse)",
      "photo qui devient peinture, sous un masque ; la voix lettre à lettre, à l'encre",
      "réveil au toucher de lecture : question assourdie, obturateur (assourdi, net)",
      "gros plan inséré, regard qui se baisse (decor avec camera)", "carnet du serveur, à une seule ligne (commande)",
      "marche lente, on passe à côté (camera avec avance, passe)",
      "première mesure de la ballade, compte, porte épaisse, envol (melodie, compte, decor)",
      "rêve à l'encre sur le ciel, que l'ombre d'un nuage fait pâlir (esquisse, nuage)"]),
    ("D4", "Chapitre 3", ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13",
                         "3.14"],
     ["ciel de la légende : étoiles-portes, barque qui dérive, étoiles qui s'alignent en porte (barque, alignement)",
      "remontée des âges : les portes de Karl de plus en plus vite ; trou qui devient entrée (diaporama, entree)",
      "scène « plier » : le geste vif de 1.3 fond les lunettes en clé et plie le ciel ; Paris et le Periyar dans les "
      "verres (fonte, pli, lentilles) ; le regard naît (regard)",
      "aube et son chœur ; l'appel, la quinte à vide, sous « où es-tu ? » (aube, couche, son appel)",
      "poussière qui retombe (3.3), poussière qu'on souffle (3.6) (poussiere)", "calligraphie des deux vers au pinceau",
      "porte battante qui bat deux fois (battant) ; l'autre côté (jour)", "mudrā à deux pouces : le sceau (deux-pouces, sceau)",
      "scène « vision » : respiration, halo d'absence, bascule, lanterne tracée par les couleurs, ornements dessinés par "
      "la lumière, pierre qui se fond, accord du père ; la barre voilée",
      "main tendue qui s'arrête à un doigt du bois (tendre) ; étoile à part au carnet, en anneau",
      "le soir qui tombe sur le Periyar ; rose des vents à semer (semer) ; compte à rebours des quatre jours"]),
    ("D5", "Chapitres 4 et 5", ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6",
                               "5.7", "5.8", "5.9", "5.10", "5.11"],
     ["barre de Julie (interface) : les boutons de Darshan s'effacent après les bandes de 4.1 et reviennent en 5.2 ; "
      "le sac de Julie naît avec le téléphone (notification)", "bandes aux couleurs de Julie (bandes-julie)",
      "téléphone de Julie : bulles sans texte, contact tendu qui revient avec son nom, sans numéro (messages, contact)",
      "réglette de la douleur, verticale, qui se retourne (curseur)", "questions de l'hôpital mises en vers (vers)",
      "pas à plateforme ; souffle guidé et sortie du tunnel (rythme, respirer)",
      "souvenir flou qui se met au point, et l'inverse", "compte à rebours dans la matière de Julie",
      "retour des boutons de Darshan en 5.2, avec un reflet d'or",
      "marché d'Aluva dessiné sous les palmes : cinq étals, un envol annoncé puis quatre courts, le bouton qui ploie (etals)",
      "rose des vents de 3.14 qui trouve son nord ; aiguille au carnet ; boussole et compte dans l'état des pages",
      "façade en mirage qui se dessine puis s'évapore ; trois confettis (vignette, confettis)",
      "galerie du téléphone qu'on feuillette ; clichés flous en attendant les repérages ; vidéo en largeur (galerie, cliche)",
      "la ballade entière, une fois, par le haut-parleur (melodie) ; un pied à 6/8 sans note",
      "deux cœurs de 2.9 qui s'accordent (maintenir) ; éclair doux ; un bourdon, puis une seule note",
      "vue qui avance ou qui monte dans une même photo (camera), sans flou",
      "fond du panneau de texte qui change avec le plan", "buée qui monte ; hublot qu'on frotte en petits cercles (essuyer)",
      "compte à rebours en mots du livre, avec son tic"]),
    ("D6", "Chapitre 6", ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11", "6.12", "6.13",
                         "6.14", "6.15"],
     ["écran partagé (partage) : les deux listes (scène « listes »), puis l'attente",
      "ruban de satin au vent, au rythme du cœur, puis immobile (ruban)",
      "encre qui saigne d'un point (saigne) : la porte de la demeure",
      "velours qui s'éclaire et fonce sous une caresse verticale (caresser)",
      "fumée qui monte seule ; aquarelle qui irrigue une toile (fumee, couleur)", "rideau et vertige à la fenêtre",
      "filet de thé versé de haut (verser)", "lumière qui refroidit, puis crépuscule (refroidir)",
      "deux cœurs sous la main, puis un seul, irrégulier (maintenir, coeur)",
      "attente de dix secondes que l'on peut presser, éclat brisé, portes ouvertes sur le papier (attendre, eclat-brise, "
      "portes-vides)",
      "portes nées sous le doigt, assez grandes pour leurs paysages, cicatrices d'encre (portes)",
      "fonte vue du dehors ; effacement de la photo (fonte, effacement)",
      "main qui se retire ; clé tournée comme au pigeonnier (main, tourner)",
      "embrasure du placard : cadre d'encre, photo, marche, fermeture (embrasure)"]),
    ("D7", "Chapitre 7 et clôture", ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9", "7.10", "7.11",
                                    "7.12", "7.13", "7.14", "7.15", "7.16", "8.1"],
     ["paupières qui se ferment ; étoiles en larmes ; morsure du soleil (maintenir, filantes, morsure)",
      "télévision sur la couette ; glaçon qui devient banquise, puis dunes (tele, goutte, sable)",
      "pluie qui peint les fleurs à l'aquarelle ; écran partagé à deux ambiances (pluie, partage, ambiance)",
      "deux coups à la porte, puis la pause (toucher, pause)",
      "étincelles jusqu'aux étoiles ; le départ, tout près puis au loin (etincelles)",
      "lettre écrite en appuyant, encre ineffaçable ; le carnet qui vacille (ecrire, effacer, vacille)",
      "trois bonds, éclat court dans la serrure, le jour de la fente, la lettre qui jaillit (enjambees, tourner, porter, "
      "transfert)",
      "course au rythme du lecteur, première mesure de la ballade ; ruban (rythme, ruban)",
      "baiser, un seul cœur ; la ballade entière ; tout ralentit ; la barre voilée (maintenir, melodie, ralenti)",
      "éclipse de Galice, une étoile du jour, chiasme en vermillon (eblouir, frontiere, etoiles-jour, chiasme)",
      "scène « rue-de-rungis » : porte qui perce la rue, lanterne et ornements, gel, paume sans clé, désenchantement, "
      "chute muette, dégel (perce, gel, paume, desenchantement, chute, degel)",
      "texte nu et pause ; fil d'encre de la clôture ; page « Fin » et « Nouvelle lecture » (scène « cloture »)"]),
]

# ---------------------------------------------------------------- les repérages : les sorties de Karl
# Les photos que Karl pourrait prendre, regroupées par sortie (synthèse, partie 9) ; chaque repérage des
# tableaux porte le code de sa sortie.
SORTIES = {
    "S1": "À la maison, en fin de jour",
    "S2": "Paris 13e et 14e, un soir d'été",
    "S3": "À l'hôpital",
    "S4": "La campagne, en Poitou et en Vendée",
    "S5": "À la pâtisserie, un soir",
    "S6": "Un restaurant du sud de l'Inde",
    "S7": "Paris, l'après-midi",
    "S8": "La Seine, la nuit",
    "S9": "La côte atlantique",
    "S10": "L'hiver",
}


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
    # ajoutées par la pré-production (synthèse, partie 8.3 ; titres vérifiés le 30 septembre 2026)
    6858270: "Sandwich baguette jambon-fromage sur une assiette en céramique grise",
    11876963: "Sur les quais du Covid",
    12441049: "Kawa",
    13020351: "Clé des champs",
    13234891: "Sortie",
    18890798: "Cathédrale au matin",
    19059625: "Fracture",
    26775590: "Coucher de soleil orange flamboyant au bout d'une rue",
    27046110: "Trèfle",
    29188525: "Tarte aux pommes",
    29630257: "Nuit de décembre",
    34342144: "Jardin tropical",
    34500385: "Repos",
    34532663: "Table heureuse",
    34849711: "Vitrail en flou doux aux arcs de cercle encadrés de bandes rouges",
    34876053: "Silhouettes floues et abstraites de deux personnages dans une lumière chaude tamisée",
    35104311: "Gros plan d'une tête de chameau au licol de cuir près d'une couverture tissée colorée",
    36652487: "Homme traversant une passerelle verte sous des saules pleureurs ensoleillés",
    38674516: "Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical",
    38674517: "Silhouettes de toits et d'antennes télé sur un ciel pastel au crépuscule",
    38694025: "Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry",
    38712879: "Pile de livres et tasse en inox sur une étagère en bois",
    38993391: "Début d'une éclipse solaire partielle dans le ciel de Galice, en Espagne",
    38993497: "Le croissant s'affine pendant l'éclipse solaire en Galice",
    38993636: "Fin croissant de l'éclipse solaire sur un ciel qui s'assombrit",
    38995522: "L'éclipse solaire totale révèle la couronne solaire au-dessus de la Galice",
    39208821: "Chemin forestier en pierre sur le chemin de Saint-Jacques-de-Compostelle, près de Pau",
    39212543: "Le pic du Midi d'Ossau domine des contreforts brumeux",
    39228274: "Village paisible niché dans les collines verdoyantes de Bourgogne-Franche-Comté",
    39564914: "Gorge marine encadrée de falaises érodées à l'horizon, près de Ribadeo",
    39575545: "Photo de nuit abstraite et minimaliste, une seule lumière orange",
    39670619: "Intérieur moderne d'une bibliothèque aux étagères en verre, à Gijón",
}

# ---------------------------------------------------------------- les tableaux
def T(n, titre, debut, lieu, monde, entree, decor, photos=(), gestes=(), moments=(), objets=(),
      son="", note="", reperages=(), etat="à faire"):
    """Un tableau. `debut` : (paragraphe, début de phrase) ou (paragraphe, None) pour le
    paragraphe entier. `photos` : [(numéro, usage)]. `gestes` : [(phrase du livre, geste,
    équivalent au toucher simple ou au clavier)]. `moments` : [(phrase du livre, effet)].
    `son` : l'ambiance, ses variantes entre parenthèses, puis ses événements. `reperages` :
    [(sortie, photo à prendre)], la sortie étant une clé de SORTIES."""
    return dict(n=n, titre=titre, debut=debut, lieu=lieu, monde=monde, entree=entree, decor=decor,
                photos=list(photos), gestes=list(gestes), moments=list(moments), objets=list(objets),
                son=son, note=note, reperages=list(reperages), etat=etat)


TABLEAUX = [
    # ============================================================ ouverture
    T("0.1", "Le seuil", (8, None), "Page de titre", "livre", "—",
      "Le ciel étoilé de Karl, assombri ; le titre, दर्शन ; la dédicace à Maëlle paraît d'elle-même "
      "sous le titre, en silence ; la porte « Ouvrir », active dès l'arrivée, s'éclaire après « Bonne lecture. ».",
      photos=[(27116682, "photo")],
      note="La dédicace se lit en silence, sans geste ni signe de la fiction. Le premier toucher, sur "
           "« Ouvrir », est la première porte : la lumière en jaillit (transition porte) et le cosmos "
           "commence à sonner avec elle.",
      son="cosmos ; démarre au premier toucher", etat="fait en partie"),
    T("0.2", "Poème d'ouverture", (11, None), "La voûte", "livre", "porte",
      "Ciel étoilé, immobile, derrière la ligne d'arbres ; une poussière d'or tombe, puis s'élève ; au "
      "dernier vers, la lueur du prototype monte, son bord, un fil d'or, s'embrase un instant, et la voûte "
      "se met à tourner derrière les arbres.",
      photos=[(27116682, "photo")],
      moments=[("La poussière est à la fois la trace du passé", "une poussière d'or descend lentement dans la nuit"),
               ("Elle s’élance", "la poussière remonte et se mêle aux étoiles"),
               ("La noirceur figée finit toujours par embrasser son éblouissante frontière",
                "la lueur monte ; son fil d'or s'embrase, puis reste ; les astres se mettent en marche")],
      note="Le soleil est gardé pour la porte du pigeonnier (1.3) : ici, la lueur du prototype et son "
           "bord, un fil d'or, celui qu'on retrouvera au pied des portes. La poussière d'or annonce celle où "
           "finira la clé (7.14). Décor nouveau : les arbres sur un calque fixe, pour que seul le ciel tourne.",
      son="cosmos ; souffle", etat="fait en partie"),

    # ============================================================ 1. Un ciel mouvant
    T("1.1", "Le toit", (17, None), "Paris, un toit du seizième, la nuit", "Darshan", "bandes",
      "La voûte tourne autour du pôle au-dessus des toits et de la tour Eiffel dessinés (prototype).",
      photos=[(27116682, "encre"), (24200555, "modèle"), (38570570, "modèle")],
      moments=[("Des étincelles passent et se chassent",
                "trois étoiles filantes : deux qui se poursuivent, puis une troisième (prototype)"),
               ("Papa, où es-tu", "l'appel de Darshan à son père s'écrit en lumière d'étoile, lettre à lettre ; "
                                  "le vent tombe ; la quinte à vide de l'appel, sans réponse"),
               ("Papa je serai bientôt là, j’arrive à grands pas", "le vent revient")],
      son="nuit ; appel (la quinte à vide)",
      note="« Papa, où es-tu ? » reste seul à l'écran : la question du livre. Le père ne répond pas.",
      etat="fait en partie"),
    T("1.2", "La danse sur les tuiles", (21, None), "Les toits", "Darshan", "encre",
      "Les tuiles de nuit, en perspective ; la ville s'approche à chaque bond, jusqu'au pigeonnier.",
      photos=[(34500347, "photo"), (27116682, "encre")],
      gestes=[("Il enjambe cinq par cinq les tuiles",
               "cinq touchers, une enjambée chacun, au rythme du lecteur ; cinq notes qui montent",
               "toucher, Espace")],
      moments=[("Darshan se lève, s’époussette", "un peu de poussière tombe dans le clair de lune"),
               ("Ses lunettes fumées sur le nez", "premier objet : le bouton « Objets » naît")],
      objets=["+ lunettes fumées (envol)"],
      son="nuit ; saut, notes montantes",
      note="Les « grands pas » promis au père (1.1) : la danse est une course vers lui. Même mécanique "
           "que la course de Julie (7.9).",
      etat="fait en partie"),
    T("1.3", "Le pigeonnier", (22, None), "Le pigeonnier des toits", "Darshan", "iris",
      "La porte de grilles et de bois, au clair de lune ; les lunettes, puis la clé, en grand.",
      photos=[(27046156, "modèle"), (39434688, "modèle")],
      gestes=[("il ôte ses lunettes", "toucher les lunettes", "bouton de la fiche"),
              ("D’un geste vif", "glisser vers le haut, vivement, comme un prestidigitateur", "toucher"),
              ("À peine insérée", "porter la clé jusqu'à la serrure, vers le haut : elle attend sous la serrure",
               "toucher la clé"),
              ("Après un tour de poignet", "tourner la clé d'un quart de tour, du doigt, sur un cercle de "
                                           "260 unités autour de la serrure", "toucher la clé"),
              ("Il ne reste qu’à la pousser", "pousser la porte", "toucher")],
      moments=[("elles vibrent entre ses doigts, leurs couleurs s’altèrent",
                "vibration, couleurs qui tournent ; le téléphone vibre, là où il le peut"),
               ("elles se transforment", "éclat : « La clé », puis sa fiche (prototype)"),
               ("le jour de la porte laisse transparaître la présence de l’astre solaire",
                "le soleil passe par les jours de la porte ; on entend l'autre côté, Aluva")],
      objets=["lunettes : portées → en main (frisson)", "lunettes → clé (fonte, puis éclat, puis fiche)",
              "clé : en main → dans la serrure (frisson) → tournée (cran, frisson)"],
      son="nuit ; vibre, fonte, éclat, clé, jour (l'autre côté), tour, cran, grince, souffle",
      note="Sortie par la porte : sa lumière gagne l'écran. L'étoile de cette porte naît à l'arrivée (1.4). "
           "Les jours ne sonnent plus l'accord du père : il n'appartient qu'à sa porte (3.10, 7.12).",
      etat="fait en partie"),
    T("1.4", "Aluva", (23, "Notre héros affleure"), "Aluva (Kerala), le local à kayaks", "Darshan", "porte",
      "Depuis le seuil du local à kayaks : l'éblouissement, la poussière dans la lumière, le Periyar "
      "sous la chaleur ; le tonneau où l'eau bout de poissons, le coutelas sur son couvercle.",
      photos=[(35086240, "modèle")],
      gestes=[("dessine sa moustache puis taille son bouc",
               "tracer du doigt une moustache de mousse, compacte, au bas de la vue ; les trois coups de "
               "coutelas du bouc suivent d'eux-mêmes", "toucher")],
      moments=[("Notre héros affleure de la poussière", "éblouissement ; la poussière danse dans la lumière"),
               ("un fleuve charmant l’atmosphère au climat si chaud et humide", "l'air tremble de chaleur au-dessus du fleuve"),
               ("mue par une vie frétillante", "les poissons frétillent et éclaboussent"),
               ("d’une bombe de piètre qualité", "la bombe crachote")],
      objets=["clé → lunettes (discret : la porte passée, la clé redevient lunettes)",
              "carnet : première étoile, le pigeonnier ; le bouton « Carnet » naît"],
      son="kerala ; souffle, poissons, bombe, mousse, coutelas",
      note="Caméra subjective : le visage de Darshan ne se voit pas, seulement la moustache de mousse, "
           "floue, au bas de la vue. Au dessin d'Aluva, ajouter les kayaks jaunes rangés au mur et le coutelas "
           "sur le couvercle du tonneau. Texte en haut, panneau clair, jusqu'à 1.9.",
      etat="fait en partie (sans le paragraphe 24)"),
    T("1.5", "Le vieil homme", (25, None), "Aluva, au bord du fleuve", "Darshan", "fondu",
      "Le chemin sous les palmes, d'où vient le vieil homme ; puis son filet, en gros plan.",
      photos=[(34342144, "encre"), (34956319, "encre")],
      moments=[("L’individu dépose à côté de lui un filet", "on passe au filet, en gros plan"),
               ("Il tire jusqu'à lui un tabouret rafistolé",
                "le raclement du tabouret sur les planches ; puis les maquereaux plongent dans le tonneau"),
               ("l’homme entame la conversation",
                "premier dialogue du livre : les répliques paraissent une à une, le vieil homme en clair, Darshan en or")],
      son="kerala ; tabouret, poissons",
      note="Le vieil homme n'a pas encore de nom : le livre ne le donne qu'à la dernière phrase du chapitre. "
           "Le titre de cette page, « Jivan », devient « Le vieil homme ».",
      reperages=[("S9", "Un tabouret de bois rafistolé sur un ponton, un filet où brillent trois maquereaux ; "
                        "lumière du matin, cadre en hauteur")]),
    T("1.6", "L'esprit local", (30, None), "Aluva", "Darshan", "—",
      "Le filet du vieil homme ; au dernier mot, le regard glisse vers le fleuve.",
      photos=[(34956319, "encre"), (10310851, "encre")],
      moments=[("précise-t-il en agrémentant sa réplique d’un clin d’œil",
                "un clin d'œil à l'encre : une paupière de pinceau, avec ses cils, passe sur la vue"),
               ("Parle-moi encore de Paris plutôt", "le regard quitte le filet pour le fleuve")],
      son="kerala",
      note="Dialogue ; la « délicieuse enfant » : première mention de Julie, sans nom ni image."),
    T("1.7", "Paris dans le fleuve", (34, None), "Aluva, le Periyar", "les deux", "—",
      "Le fleuve à l'encre ; dans ses reflets paraissent les premières photographies du livre : Paris, "
      "renversé, ondulé par l'eau.",
      photos=[(10310851, "encre"), (33035632, "photo"), (16592454, "photo"), (12073837, "photo"),
              (38279684, "photo")],
      gestes=[("le regard perdu dans les remous du Periyar",
               "remuer l'eau du doigt, en petits cercles ou de haut en bas : le pavé, puis un réverbère, se "
               "forment dans les remous", "toucher l'eau")],
      moments=[("Paris est à l’amour ce que le bleu est au ciel", "la tour Eiffel paraît, renversée, dans le reflet du ciel"),
               ("qu’un air que tous chantonnent", "sous l'eau, quatre notes de la ballade, inachevées"),
               ("Les éclairages de nuit t’ensorcellent", "les lumières de la nuit dans le reflet")],
      son="kerala ; fragment de la ballade sous l'eau, rumeur de Paris sous l'eau, remous",
      note="Premier contact des deux mondes : les photos de Karl paraissent dans l'encre, un chapitre avant "
           "le monde de Julie. Le pavé des remous est celui d'où naîtra la porte du père ; le dernier "
           "reflet, un réverbère de Niort, sera la Seine du chevalet (5.7).",
      reperages=[("S8", "Bateaux-mouches sur la Seine, de nuit (« l’éclat des navires parcourant la Seine »)")]),
    T("1.8", "Vieillir", (35, None), "Aluva, le ponton", "Darshan", "—",
      "Le ponton du vieil homme, vide : sa place sans lui ; à « As-tu déjà pensé à vieillir ? », la lumière "
      "vire lentement à l'or ; après la pirouette, le lin blanc de la chemise passe devant la vue.",
      photos=[(10310851, "encre")],
      gestes=[("en enfilant sa chemise", "après la phrase, enfiler la chemise : glisser vers le bas, le lin "
                                         "blanc passe devant la vue", "toucher")],
      moments=[("As-tu déjà pensé à vieillir", "la lumière vire lentement à l'or ; le tanpura se tait, seul le "
                                               "fleuve continue, jusqu'à la réponse de Darshan")],
      son="kerala ; silence du tanpura, lin",
      note="Le ponton reste vide (aucune silhouette) : on voit la place du vieil homme sans lui, avant « je te "
           "quitterai avant lui ». Le jour vieillit pendant la question ; Darshan l'esquive en s'habillant.",
      reperages=[("S9", "Le même tabouret rafistolé, vide, sur le ponton, dans la lumière d'or de fin "
                        "d'après-midi")]),
    T("1.9", "Le départ", (39, None), "Aluva, devant la cabane à kayaks", "Darshan", "fondu",
      "La montre en gros plan ; la cabane à kayaks, vue du dehors, dans la lumière d'or ; sa porte "
      "s'illumine ; puis la lumière retombe sur le filet, au crépuscule.",
      photos=[(20315376, "encre"), (35086240, "modèle"), (34956319, "encre")],
      gestes=[("Il se défait de ses lunettes",
               "ôter les lunettes, comme au pigeonnier : elles deviennent clé, la porte de la cabane s'allume et "
               "sa lumière gagne la vue", "toucher")],
      moments=[("regards attentifs sur sa montre", "la montre en gros plan ; son tic-tac"),
               ("Darshan s’incline auprès de son ami", "la vue s'incline, comme un salut"),
               ("avant de tourner ses talons vers la cabane à kayaks",
                "la vue se tourne vers la cabane à kayaks, vue du dehors, dans la lumière d'or"),
               ("qui range patiemment son filet", "la lumière retombe sur le filet, au crépuscule ; la caméra "
                                                   "reste avec celui qui reste")],
      objets=["+ montre (discret)", "lunettes → clé (éclat court : la métamorphose est connue)",
              "carnet : deuxième porte, la cabane à kayaks → Paris, quand sa lumière a gagné la vue"],
      son="kerala ; tic-tac, jour (l'autre côté : Paris à midi, la rumeur d'une rue et, très loin, la salle du "
          "restaurant), souffle",
      note="Jivan ne voit pas partir Darshan : il « disparaît loin de la vue de Jivan ». La caméra ne le "
           "regarde donc pas partir ; elle reste, après, avec le filet. Seule entorse à la caméra subjective "
           "du chapitre : ce dernier plan, sans Darshan.",
      reperages=[("S9", "Un carrelet de Charente-Maritime (cabane de pêche sur pilotis et son grand filet carré) "
                        "au soleil couchant ; cadre en hauteur")]),

    # ============================================================ 2. Un pain perdu s'il vous plaît.
    T("2.1", "Attablé", (40, None), "Paris, un restaurant", "Julie", "bandes-photo",
      "La table de Karl, photographiée : le tartare de Darshan au premier plan, le verre et le téléphone de Julie ; "
      "sous la caresse, l'assiette s'efface dans le flou.",
      photos=[(34532663, "photo")],
      gestes=[("Il caresse la main de sa belle avec délicatesse",
               "caresser sa main, lentement : l'assiette se brouille", "maintenir le doigt, Espace")],
      son="restaurant ; déclic",
      note="Premier chapitre photographique : les bandes du titre s'ouvrent sur la photo par l'obturateur. "
           "Julie se découvre par les sens : sa main (2.1), son dos (2.2), ses traits en mots (2.3), sa voix et son nom (2.4). "
           "Le tartare de la photo est de bœuf : exception à l'arbitrage 7, à valider par Karl.",
      reperages=[("S1", "La main de Julie posée sur une table pour deux, lumière chaude, l'assiette de Darshan "
                        "floue au premier plan, son verre et son téléphone derrière")]),
    T("2.2", "La rencontre", (42, None), "Paris, devant les vitrines", "Julie", "obturateur",
      "Souvenir net comme le présent : Julie de dos, chevelure châtaine et chouchou rouge, devant les vitrines.",
      photos=[(33035648, "photo")],
      gestes=[("La chamade battait en lui", "maintenir : le cœur bat tout seul et s'emballe", "maintenir Espace")],
      moments=[("Son cœur balançait", "le cœur de Julie balance entre deux lueurs de la vitrine ; celui de Darshan s'emballe")],
      son="rue ; déclic, battements, balancier",
      note="Signature du cœur, reprise en 2.9, 5.9 et 7.10. La vitrine revient en 4.6, vue par Julie.",
      reperages=[("S7", "Vitrine de friperie, mannequin en robe volantée et guêtres (la même qu'en 4.6 et 4.7)")]),
    T("2.3", "Au diable les autres", (44, None), "Le restaurant, sa rêverie", "les deux", "—",
      "Sa rêverie, à table : la photo de la rencontre devient la peinture de Darshan ; il ne reste qu'elle, "
      "la rue retourne au papier.",
      photos=[(33035648, "encre")],
      moments=[("Au diable les autres, il n’y a qu’elle", "la photo se fait encre ; la rue s'efface ; la rumeur se tait")],
      son="silence ; battements",
      note="Texte en italique, en bas, sans éclat : la voix s'écrit lettre à lettre, à l'encre (rime avec 1.1 et 7.7). "
           "Le visage de Julie n'existe qu'en mots : l'image la garde de dos."),
    T("2.4", "Quoi ?!", (45, None), "Le restaurant", "Julie", "—",
      "La peinture, puis, d'un déclic, la table photographiée, nette d'un coup.",
      photos=[(34532663, "photo")],
      moments=[("Tes projets se passent bien Darshan", "la question arrive étouffée, comme à travers l'eau"),
               ("répond-il presque réveillé en sursaut",
                "le toucher qui fait avancer le texte réveille : l'obturateur claque, la table revient, nette")],
      son="restaurant ; étouffé, déclic",
      note="Premier « Julie » du livre : le lecteur se réveille sur son nom, sans geste ni consigne."),
    T("2.5", "L'aurore de mes jours", (50, None), "Le restaurant", "Julie", "—",
      "La table ; au mot « téléphone », gros plan sur celui de Julie, posé près de son verre.",
      photos=[(34532663, "photo")],
      moments=[("Tu n’as pas de téléphone", "gros plan : le téléphone de Julie ; rien de tel côté Darshan"),
               ("Il n’y a pas de meilleure façon", "retour à la table")],
      son="restaurant",
      note="« Par moments » : le lecteur sait lesquels, il vient de voir Darshan partir à l'encre."),
    T("2.6", "Le tartare", (53, None), "Le restaurant", "Julie", "—",
      "La table, puis l'assiette : le tartare à peine picoré.",
      photos=[(34532663, "photo")],
      gestes=[("Darshan se penche sur son assiette",
               "baisser les yeux : glisser vers le bas ; l'image monte, l'assiette entre par le bas",
               "toucher, flèche bas")],
      son="restaurant ; fourchette",
      note="Le gros plan montre un tartare de bœuf : exception à l'arbitrage 7, à valider par Karl ; sinon, la séance S1 d'abord.",
      reperages=[("S1", "Un tartare de saumon aux herbes fraîches, à peine entamé")]),
    T("2.7", "Le pain perdu", (56, None), "Le restaurant", "Julie", "fondu",
      "La table, floue : le temps a passé ; le carnet du serveur ; son côté à elle, net ; "
      "puis le pain perdu sur sa porcelaine jaune tournesol.",
      photos=[(34532663, "photo")],
      moments=[("Ce sera un pain perdu", "le carnet du serveur monte : une seule ligne, le titre du chapitre"),
               ("Il sera servi dans une porcelaine",
                "son côté à elle, net ; puis le pain perdu, net (quand Karl l'aura photographié)")],
      son="restaurant ; assiettes, crayon, porcelaine",
      note="Le livre ne dit pas qui commande : la commande paraît sans qu'on sache qui l'a passée. "
           "« Si j’avais su… » reste du récit, sans couleur de personnage.",
      reperages=[("S1", "Pain perdu de brioche, portion menue, sur porcelaine à motif fleuri, fond jaune "
                        "tournesol")]),
    T("2.8", "Montsouris", (60, None), "Paris, le parc Montsouris", "Julie", "obturateur",
      "L'arche de rocaille ; les deux amoureux sur leur banc, sous la grosse branche ; on passe à côté ; la maison de lierre.",
      photos=[(10524140, "photo"), (31514847, "photo"), (10199772, "photo")],
      gestes=[("Leurs pas sous l’ombrage des arbres",
               "marcher avec elle : glisser vers le haut, lentement ; l'allée avance", "toucher, flèche haut")],
      moments=[("ils regardent le Merle noir qui fait son nid", "les amoureux ; le chant du merle, tout proche"),
               ("Darshan et Julie eux passent à côté", "on passe à côté : le plan glisse, le merle s'éloigne"),
               ("une petite maison beige couverte de lierre", "la maison de lierre")],
      son="parc ; pas sur le gravier, merle",
      note="Un vieux couple qui a son nid : Darshan et Julie passent à côté de leur avenir possible. "
           "Julie refera cette marche seule (6.15).",
      reperages=[("S2", "La maison de Julie, petite, beige, couverte de lierre, près du parc Montsouris"),
                 ("S2", "Le pont de rocaille de Montsouris et sa barrière de branches nouées, si l'arche n'y a "
                        "pas été prise")]),
    T("2.9", "Le seuil de Julie", (61, None), "Devant la maison de Julie", "Julie", "fondu",
      "La porte dans le lierre ; joue contre joue, tout se brouille ; la porte redevient nette ; la vue monte aux toits.",
      photos=[(10199772, "photo"), (38674517, "photo")],
      gestes=[("leurs joues se frôlent", "maintenir : joue contre joue, deux cœurs, pas encore à l'unisson", "maintenir Espace")],
      moments=[("Les mots et les regards valsent",
                "les deux cœurs valsent, trois contre deux : la première mesure de la ballade, étouffée"),
               ("dimanche prochain répondait aux convenances de Julie", "compte : « dimanche prochain », avec un tic"),
               ("Darshan et Julie s’éloignent l’un de l’autre", "la porte redevient nette, les cœurs se taisent"),
               ("L’épaisse porte de sa belle se ferme", "la porte épaisse se ferme (on l'entend)"),
               ("Darshan, lui, vole", "la vue monte le long du lierre jusqu'aux toits, au crépuscule")],
      son="rue ; battements, première mesure de la ballade, tic, porte, envol",
      note="Rime avec 6.15 : la même porte, où Julie rentrera seule. La ballade entière attend 5.7 (arbitrage 2).",
      reperages=[("S2", "La porte de la maison de Julie, cadrée en hauteur, fin d'après-midi")]),
    T("2.10", "Le nuage", (62, "Sur son nuage"), "Au-dessus des toits, au crépuscule", "les deux", "—",
      "Les toits au crépuscule ; sur le ciel, à l'encre, son nuage puis la pièce qu'il rêve ; "
      "l'ombre d'un vrai nuage la fait pâlir.",
      photos=[(38674517, "photo")],
      moments=[("Sur son nuage il saute de rêves en projets", "à l'encre, sur le vrai ciel : son nuage"),
               ("Il flirte avec Julie qu’il visualise", "la pièce rêvée se trace sur le nuage d'encre"),
               ("Mais un nuage vient porter ombrage à cette vision idyllique",
                "l'ombre d'un vrai nuage balaie la photo ; l'encre pâlit et s'efface")],
      son="vent ; souffle frais sous l'ombre",
      note="Seule encre posée sur une photo dans le chapitre, et la photo la fait pâlir. "
           "Les mêmes toits ferment 5.1, vus de la fenêtre de Julie."),

    # ============================================================ 3. Entre deux mondes
    T("3.1", "Le maître des portes", (63, None), "Hors du monde", "légende", "bandes",
      "La Voie lactée de Karl, sans horizon ; des étoiles-portes d'or ; une barque minuscule dérive ; "
      "sept étoiles s'alignent et dessinent une porte, à la place et à la forme de la porte bleue de 3.2.",
      photos=[(39595391, "photo")],
      moments=[("mène sa barque au gré des courants de la providence", "une barque minuscule dérive le long de la Voie lactée"),
               ("Ce Bohème est né de l’alignement de forces anciennes", "sept étoiles s'alignent, puis dessinent une porte")],
      son="cosmos ; bandes, tinte"),
    T("3.2", "Le trou dans le mur", (65, None), "Les âges", "légende", "—",
      "Le ciel et sa porte d'étoiles ; puis les portes de Karl, à l'encre, en remontant le temps, de plus en "
      "plus vite ; puis un mur de terre et de paille percé d'un trou noir, que le toucher du lecteur change en entrée.",
      photos=[(32429264, "encre"), (32429190, "encre"), (27025911, "encre"), (34762346, "encre"), (27046110, "encre")],
      gestes=[("un trou dans un mur de terre et de paille, mais une entrée",
               "toucher le trou : la lumière passe, il devient entrée", "toucher, Entrée")],
      moments=[("La peur des prédateurs", "la porte d'étoiles devient la porte bleue, et les portes défilent en remontant le temps"),
               ("Sans même le savoir, ces pensées ont créé un embryon métaphorique", "le mur de terre et de paille ; le trou est noir")],
      son="cosmos ; souffle",
      note="Le toucher du lecteur est l'instant où « l'on a cessé de voir simplement un trou » : son regard fait "
           "naître Darshan. Ni la porte verte d'Irun (39434691), devenue la porte du père, ni « Porte forgée » "
           "(27046156, une fleur de lys) ne sont du défilé.",
      reperages=[("S4", "Mur de torchis (terre et paille) percé d'un trou, en hauteur ; deux vues au même cadre : "
                        "le trou noir, puis la lumière qui passe")]),
    T("3.3", "L'immortel", (66, None), "Les âges", "légende", "fondu",
      "Le chemin des pèlerins, à l'encre, qui monte sous les arbres, où l'on avance très lentement ; personne ; "
      "la poussière se soulève et retombe.",
      photos=[(39208821, "encre")],
      moments=[("brasser inutilement de la poussière", "une poussière grise se soulève du chemin, puis retombe")],
      son="cosmos ; souffle",
      note="Tableau sans geste : la légende se raconte, elle ne se joue pas ; personne ne tend la main à Darshan."),
    T("3.4", "Des lunettes qui plient l'espace", (67, None), "Hors du monde", "légende", "iris",
      "Le ciel de la légende ; les lunettes en traits d'or, au milieu ; Paris en haut, Aluva plus bas, reliés "
      "par un fil d'or.",
      photos=[(39595391, "photo")],
      gestes=[("ses lunettes aux visages déformés adoptent l’allure de la précédente clé",
               "le geste vif de 1.3 : glisser vers le haut ; les lunettes fondent en clé et le ciel se plie, "
               "Aluva sur Paris", "toucher, Entrée")],
      moments=[("Elles portent sa vue plus loin", "dans les deux verres, Paris et le Periyar ; le regard naît")],
      objets=["lunettes : la fiche propose « Regarder à travers » (le regard naît)"],
      son="cosmos ; fonte, papier, tinte",
      note="Scène spéciale « plier ». Le lecteur refait le geste vif du pigeonnier et découvre ce qu'il faisait : "
           "plier l'espace. Pas de pincement : Apple Books le prend pour le zoom de la page."),
    T("3.5", "Croire", (68, None), "Les parvis", "légende", "fondu",
      "Le parvis de la cathédrale de Poitiers, vu d'en bas, au matin ; l'aube monte avec son chœur d'oiseaux.",
      photos=[(18890798, "encre")],
      moments=[("Croire aux lendemains qui chantent", "l'aube monte sur la façade ; le chœur de l'aube, au loin"),
               ("où es-tu", "le chœur se tait ; la quinte à vide de l'appel, très bas, sans réponse")],
      son="cosmos ; chœur de l'aube, appel (la quinte à vide)",
      note="À « où es-tu ? », rien ne répond : le père ne parle jamais. La quinte est la question, pas une réponse."),
    T("3.6", "Les bibliothèques", (72, None), "Bibliothèques, musées, marchés ; puis Pékin", "Darshan", "encre",
      "La tranche poussiéreuse d'une pile de vieux livres ; puis l'allée d'une bibliothèque toute en lignes droites.",
      photos=[(38712879, "encre"), (39670619, "encre")],
      gestes=[("en soufflant l’indifférence qui s’est déposée à la surface des ouvrages",
               "souffler la poussière : glisser vers le haut sur les livres", "toucher")],
      moments=[("Les avancées sont rares", "l'allée de la bibliothèque nationale de Chine"),
               ("Leur nombre suscite vertige", "le regard file lentement dans l'allée")],
      son="bibliothèque (vaste) ; souffle"),
    T("3.7", "Le recueil sanskrit", (73, "Depuis un coin de table"), "Pékin, la bibliothèque nationale", "Darshan", "—",
      "L'allée ; puis le recueil ouvert au coin de la table, pages vierges ; les deux vers s'écrivent au pinceau.",
      photos=[(39670619, "encre")],
      moments=[("Darshan pour sa part parcourt un recueil de poèmes sanskrit", "le regard descend sur le recueil ouvert"),
               ("L’amour est le lit de la famille", "calligraphie au pinceau"),
               ("La clé de sa chambre est la sincérité et sa porte la réciprocité", "calligraphie au pinceau")],
      son="bibliothèque (vaste) ; pinceau",
      note="Le moment typographique du chapitre, sans geste : le lecteur regarde écrire ; au chapitre 7, il "
           "écrira lui-même la lettre.",
      reperages=[("S1", "Vieux livre ouvert sur des pages vierges et jaunies, vu d'au-dessus, lumière de lampe")]),
    T("3.8", "La porte du personnel", (76, None), "Pékin", "Darshan", "fondu",
      "L'allée, le regard relevé ; puis la porte battante du personnel, au bout des rayonnages.",
      photos=[(39670619, "encre")],
      gestes=[("disparaît avec nonchalance entre deux battements de porte",
               "pousser la porte des toilettes du personnel : elle bat deux fois", "toucher")],
      moments=[("Si, il y en a suffisamment", "la porte battante, au bout des rayonnages")],
      objets=["+ recueil de poèmes (sans annonce : « sous le bras »)", "lunettes → clé (discret : nonchalance)"],
      son="bibliothèque (vaste) ; porte, l'autre côté (le clapotis du Periyar)",
      reperages=[("S6", "Porte battante de service à hublot, sans écriteau lisible ; fermée, puis en plein "
                        "battement")]),
    T("3.9", "Le mudrā", (77, None), "Aluva, au bord du Periyar", "Darshan", "porte",
      "Le Periyar au soir, en subjectif ; deux cercles d'or naissent sous les pouces.",
      photos=[(10220497, "encre")],
      gestes=[("positionne sa main droite pour qu’elle soutienne sa main gauche et que ses pouces soient en contact",
               "poser les deux pouces l'un contre l'autre et les garder : le sceau se ferme", "maintenir un doigt, ou Espace")],
      moments=[("il veille à sa discrétion jusque dans le froissement de l’herbe", "un froissement d'herbe, à peine : Jivan")],
      objets=["carnet : + Pékin → le Periyar (à l'arrivée)", "clé → lunettes (discret)"],
      son="kerala (soir) ; clapotis, herbe",
      note="Temps fort. Le geste précède la phrase : le lecteur apprend qu'il vient de faire le Dhyana mudrā."),
    T("3.10", "Du noir vient la couleur", (80, None), "La vision", "Darshan", "—",
      "Le fleuve du soir ; un halo d'ombre ; le noir de Karl et sa seule lumière orange ; la lanterne ; la "
      "porte d'Irun rendue en lumière.",
      photos=[(10220497, "encre"), (39575545, "photo"), (39434691, "encre"), (34849711, "modèle")],
      gestes=[("Son inspiration l’emplit de braises", "maintenir pour inspirer, lâcher pour expirer, trois fois",
               "toucher : trois respirations guidées ; Espace")],
      moments=[("Les poignets de Darshan se relâchent", "le sceau du mudrā se défait"),
               ("La force de son âme l’entoure d’un halo d’absence", "un halo d'ombre se referme ; le son s'éteint"),
               ("La vie palpite en Darshan", "un battement"),
               ("Il bascule en arrière", "le regard bascule vers le haut et flotte, puis le noir"),
               ("Du noir vient la couleur", "le noir, et sa seule lumière orange"),
               ("Des couleurs, ils en approchent", "des points de couleur approchent et tracent la lanterne"),
               ("Elle s’allume", "la lanterne s'allume ; l'accord du père, pour la première fois du livre"),
               ("Son rayonnement dessine les ornements", "les cercles de lumière dessinent en or les ornements de la porte"),
               ("Ils s’inscrivent dans un bois hors du temps", "le bois et la pierre paraissent ; la pierre se fond dans le noir")],
      son="vision ; souffle, battement, accord du père",
      note="Scène spéciale « vision », un temps par phrase. La porte du père est la porte verte d'Irun de Karl "
           "(39434691), haut de la photo seulement : ni le cycliste, ni la plaque « 2 », ni la serrure.",
      reperages=[("S1", "Lanterne de bois ajourée de cercles, allumée dans le noir, et ses cercles de lumière sur "
                        "un mur")]),
    T("3.11", "La porte inconnue", (82, None), "La vision", "Darshan", "—",
      "La porte du père, sa lanterne allumée ; la main de Darshan, en trait d'or, s'arrête à un doigt du bois ; "
      "puis le noir.",
      photos=[(39434691, "encre")],
      gestes=[("Son bras porte sa main au plus près qu’il peut de cette ouverture",
               "tendre la main : glisser vers la porte ; la main s'arrête à un doigt du bois, la lumière ondule", "toucher")],
      moments=[("Tu es là", "la voix intérieure s'écrit lettre à lettre, en or pâle, sans éclat ni son"),
               ("La lueur de la lanterne faiblit", "la lanterne s'éteint, la porte se drape de noir, l'accord s'éteint"),
               ("Darshan se voit happé", "la dernière lueur file au carnet : l'étoile à part, un anneau ; l'air revient")],
      objets=["carnet : la porte du père, étoile à part, hors de la carte (vue, non franchie)"],
      son="vision ; accord du père, souffle",
      note="Premier geste impossible du livre : la porte ne recule pas, c'est la main qui ne peut aller plus loin. "
           "Page isolée : la lanterne, les ornements et l'accord sont là dès l'ouverture."),
    T("3.12", "J'ai trouvé le chemin", (86, None), "Aluva", "Darshan", "iris",
      "Le Periyar au soir, flou puis net : les yeux s'ouvrent ; Jivan hors champ, qu'on entend couper ses légumes ; "
      "le soir tombe pendant le dialogue.",
      photos=[(10220497, "encre")],
      moments=[("Je sais", "une gerbe d'étincelles d'or ; le couteau de Jivan s'arrête"),
               ("Qu’est-ce qui te fait dire que ce n’est pas encore une fausse piste", "la lumière baisse lentement : le soir tombe")],
      son="kerala (soir) ; couteau, étincelles",
      reperages=[("S4", "Mains âgées qui coupent des légumes sur une planche, au bord de l'eau, lumière du soir, "
                        "sans visage")]),
    T("3.13", "Le véritable amour", (93, None), "Aluva", "Darshan", "—", "Le crépuscule sur le Periyar.",
      photos=[(10220497, "encre")],
      moments=[("Cette porte s’ouvrira à moi quand j’aurai trouvé le véritable amour",
                "la règle entre au carnet, dans la fiche de la porte du père : le bouton Carnet luit une fois")],
      objets=["carnet : la fiche de la porte du père reçoit la règle"],
      son="kerala (soir) ; couteau"),
    T("3.14", "Quatre jours", (96, None), "Aluva", "Darshan", "—",
      "Le crépuscule sur le Periyar ; une rose des vents d'or, sans aiguille ; le vent se lève.",
      photos=[(10220497, "encre")],
      gestes=[("sema aux quatre vents les graines de sa libération",
               "toucher les quatre points de la rose des vents : une graine part avec chaque vent", "toucher quatre fois")],
      moments=[("dans quatre jours je reçois l’élue de mon cœur", "compte à rebours : « quatre jours », avec un tic")],
      son="kerala (soir) ; couteau, tic, brise, vent"),

    # ============================================================ 4. Amélie et Julie
    T("4.1", "Amélie", (99, None), "Paris, le métro", "Julie", "bandes-julie",
      "Le panneau du métro, vu d'en bas ; puis le quai, vu d'en haut : des cercles tous pareils.",
      photos=[(33035627, "photo"), (11876963, "photo")],
      moments=[("Nos journées se ressemblent pas mal également", "le regard se baisse : le quai et ses cercles")],
      son="métro ; portes qui se ferment",
      note="Seul chapitre à la première personne : la caméra est les yeux de Julie, son téléphone son "
           "interface. Bandes aux couleurs de Julie ; après elles, les boutons de Darshan s'effacent, "
           "jusqu'à 5.1 ; aucun point d'intérêt, aucune magie."),
    T("4.2", "L'hôpital", (100, "Ensuite je travaille"), "L'hôpital", "Julie", "obturateur",
      "Le couloir sombre et sa lampe ; les trois questions, puis leur litanie en vers sur le mur.",
      photos=[(35375606, "photo")],
      gestes=[("Pouvez-vous évaluer votre douleur sur une échelle allant de zéro à dix",
               "curseur de la douleur : une réglette, de zéro (en bas) à dix (en haut), qui se retourne",
               "flèches haut et bas, ou toucher l'échelle")],
      moments=[("la poésie, la prosodie de ces vers incompris",
                "les trois questions reviennent en vers, en boucle, sur le mur du couloir")],
      son="hôpital ; les bips deviennent une mesure",
      note="Seul moment typographique du chapitre ; il répond aux vers du recueil sanskrit (3.7). "
           "Le même couloir, et sa lampe près d'une porte, reviennent en 7.4, 7.5 et 7.8.",
      reperages=[("S3", "Couloir d'hôpital ancien, une lampe suspendue près d'une porte, une blouse à une patère, "
                        "sans patient ni visage (servirait aussi en 7.4, 7.5 et 7.8)")]),
    T("4.3", "La tôle qui vibre", (101, None), "Le RER ; la pause ; le lit", "Julie", "obturateur",
      "La tôle grise du RER qui passe ; la tasse de café, la nuit ; le lit défait, le téléphone dessus.",
      photos=[(33035652, "photo"), (12441049, "photo"), (38256669, "photo")],
      gestes=[("mes mains pianotent des messages pour Amélie",
               "pianoter sur le téléphone : deux bulles partent vers Amélie, sans texte (le livre n'en donne pas)",
               "toucher")],
      objets=["+ téléphone (le sac de Julie s'ouvre, annoncé comme une notification)"],
      son="métro (rame) ; tôle, clavier ; puis tasses ; puis chambre",
      note="Le téléphone est le premier objet de Julie : ni fonte, ni éclat."),
    T("4.4", "La friperie", (102, None), "Une rue, le carrefour", "Julie", "obturateur",
      "Le carrefour, à pied : quatre pas, et la question au coin de la rue.",
      photos=[(10355467, "photo")],
      gestes=[("c’est donc en chemisier avec mes chaussures à plateforme que je sors",
               "marcher : quatre pas en rythme, sur des semelles à plateforme", "toucher en rythme")],
      son="rue ; pas sur des plateformes",
      note="Aucune image de Julie ici : la caméra est ses yeux. Même carrefour et même geste que la "
           "course de 7.9 : la question ici, la réponse là.",
      reperages=[("S7", "Chaussures à plateforme sur le trottoir, vues d'en haut, en marchant (le regard de "
                        "Julie)")]),
    T("4.5", "Partir", (103, "Ma famille"), "La foule, puis la campagne rêvée", "Julie", "obturateur",
      "La foule en fantômes, un téléphone à la main ; la sortie verte d'un tunnel ; le village rêvé.",
      photos=[(31641251, "photo"), (13234891, "photo"), (39228274, "photo")],
      gestes=[("Je veux prendre l’air",
               "prendre l'air : maintenir pour inspirer, lâcher pour souffler, une fois ; on passe la sortie du tunnel",
               "toucher : une respiration guidée ; maintenir Espace")],
      moments=[("Parfois ils sont pianistes, guitaristes ou jongleurs",
                "une guitare de rue s'éloigne ; l'accord final ne vient pas")],
      son="rue (dense) ; guitare de rue ; puis tunnel, souffle ; puis parc, le merle",
      note="Le souffle répond à celui du mudrā (3.10) : du rose faux de l'infrarouge, par le noir du "
           "tunnel, au vrai vert."),
    T("4.6", "Le prince", (105, None), "La vitrine de la rue Rousseau", "Julie", "obturateur",
      "La photo de la rencontre (2.2), floue comme un souvenir, qui se met au point.",
      photos=[(33035648, "photo")],
      moments=[("Il m’a abordée devant cette vitrine de la rue Rousseau",
                "le souvenir se met au point : l'image de 2.2")],
      son="rue ; deux battements du cœur de Julie",
      note="Même décor qu'en 2.2 : la même rencontre, racontée par elle. Seule image de Julie du "
           "chapitre, parce que c'est un souvenir : le regard qu'elle a senti."),
    T("4.7", "Un numéro", (105, "Un numéro, je me suis surprise"), "La vitrine ; chez Julie", "Julie", "—",
      "La rencontre, qui se brouille quand le téléphone monte ; un contact sans numéro ; puis la chambre de Julie.",
      photos=[(33035648, "photo"), (10879428, "photo")],
      gestes=[("je me suis surprise à lui demander le sien",
               "glisser le téléphone vers le haut, vers lui : il revient avec son nom, le numéro toujours vide",
               "toucher le téléphone")],
      moments=[("Elle s’emporta avec moi en enthousiasme et théories", "le téléphone vibre trois fois dans le sac"),
               ("dans quatre jours je serai chez lui", "compte à rebours : quatre jours, du côté de Julie (comme en 3.14)")],
      objets=["téléphone : un contact, « Darshan », sans numéro"],
      son="rue ; puis chambre ; vibreur ; un tic",
      reperages=[("S7", "La vitrine de face, et dans la glace le reflet flou d'un homme qui s'approche (la "
                        "vitrine de 2.2, vue b) : on y tendra le téléphone")]),

    # ============================================================ 5. Douceurs et confettis
    T("5.1", "Soixante-douze heures", (109, None), "La chambre de Julie", "Julie", "bandes-julie",
      "Le lit, l'oreiller ; puis, par la fenêtre, les toits de 2.9 et 2.10 au crépuscule.",
      photos=[(10879428, "photo"), (38674517, "photo")],
      moments=[("Il y a encore soixante-douze heures qui me séparent de son regard",
                "compte à rebours : « quatre jours » devient « soixante-douze heures », avec un tic"),
               ("dehors, à la fenêtre, je sens sa présence",
                "la fenêtre : les toits de 2.9 et 2.10, où le vagabond rêvait de la recevoir")],
      son="chambre (fenêtre) ; la rue s'entrouvre à la fenêtre",
      note="Pas de geste : la page de l'attente. Encore une page de Julie à la première personne : sans les boutons "
           "de Darshan. Les bandes du titre sont celles de Julie, en lilas, et leur grain devient une pluie de "
           "confettis rose, menthe et citron ; ni or ni vermillon."),
    T("5.2", "Le marché d'Aluva", (112, None), "Aluva, le marché", "Darshan", "encre",
      "Une allée de marché sous les palmes dorées, dans la lumière d'orient ; cinq étals dessinés à l'encre.",
      photos=[(34342144, "encre"), (35104311, "modèle"), (29136749, "modèle")],
      gestes=[("Darshan fait l’acquisition des thés les plus délicats, de curcuma, d’encens, de jarres et de tapisseries",
               "toucher chaque étal : les cinq marchandises rejoignent le sac ; au cinquième, le bouton Objets ploie",
               "toucher cinq fois")],
      objets=["+ thés, + curcuma, + encens, + jarres, + tapisseries (un envol annoncé, puis quatre envols courts)"],
      son="marché ; tanpura ; les pas de Jivan traînent derrière ; une mangue roule",
      note="Les boutons de Darshan reviennent à l'entrée, avec un reflet d'or : le lecteur retrouve ses pouvoirs "
           "et s'en sert d'abord pour tout acheter. La caméra est Darshan ; Jivan reste derrière, hors champ."),
    T("5.3", "Julie est mon nord", (114, None), "Le marché", "Darshan", "—",
      "Le même décor ; la rose des vents d'or de 3.14, qui trouve son nord.",
      moments=[("Julie est mon nord, mon étoile du matin",
                "la rose des vents de 3.14 trouve son nord : l'aiguille se fixe en haut, l'étoile du matin brille à sa "
                "pointe ; le bouton Carnet luit une fois, et le carnet garde l'aiguille, pointe vermillon, d'Aluva "
                "vers Paris")],
      son="marché ; aiguille",
      note="« Oui… Oui… Tu… Elle… » paraît mot après mot, au rythme du souffle court de Jivan."),
    T("5.4", "À la belle étoile", (117, None), "Le marché", "Darshan", "—", "Le même décor ; l'ombre d'un nuage passe.",
      moments=[("mais je doute que tu souhaites la recevoir à la belle étoile",
                "l'ombre du nuage de 2.10 passe sur le marché (de droite à gauche, 4 s), puis la lumière revient")],
      son="marché"),
    T("5.5", "Le quartier Foch", (120, None), "Le marché ; la façade rêvée", "Darshan", "—",
      "Au bout de l'allée, dans la chaleur, une façade couleur du lait se dessine comme un mirage, puis s'évapore.",
      photos=[(33035628, "encre")],
      gestes=[("un paquet de confettis qui rejoint promptement ses fournitures",
               "toucher le paquet de confettis : il saute dans le sac, fermé ; trois confettis s'en échappent",
               "toucher")],
      moments=[("Elle va passer la porte marbrée",
                "au bout de l'allée, la façade se dessine trait après trait, puis se lave de couleur de lait, et "
                "tremble dans la chaleur comme un mirage : le mensonge prend forme"),
               ("Jivan lève les yeux au ciel", "là où Jivan regarde, la façade s'évapore vers le haut")],
      objets=["+ confettis (envol)"], son="marché ; pinceau ; paquet secoué",
      note="Ni l'Élysée ni drapeaux : la façade seule, rêve de beau parleur que le regard de Jivan dissipe. "
           "Les confettis ne serviront jamais : la fête promise n'aura pas lieu."),
    T("5.6", "La galerie", (124, None), "La chambre de Julie", "Julie", "obturateur",
      "Le lit en noir et blanc, le téléphone ; puis l'écran : la galerie, en couleurs.",
      photos=[(38256669, "photo"), (29360492, "photo"), (29630257, "photo"), (6858270, "photo")],
      gestes=[("elle se perd dans ses photos",
               "glisser vers le haut sur le téléphone : la galerie s'ouvre ; ensuite, chaque glissement amène le "
               "cliché et le temps suivants", "toucher")],
      moments=[("Darshan grimaçant, surpris par des bonbons piquants",
                "le cliché des bonbons s'ouvre, flou de mise au point"),
               ("il côtoie sur le cliché voisin", "retour à la grille : la vignette voisine, la patinoire, s'éclaire"),
               ("Darshan et Julie qui partagent un croque-monsieur", "le cliché du croque-monsieur s'ouvre, bougé")],
      son="chambre ; petits déclics du téléphone",
      reperages=[("S1", "Croque-monsieur coupé en deux, deux mains, une manche d'hiver et une manche de toile "
                        "moutarde ; sans visage"),
                 ("S1", "Billes acidulées de toutes les couleurs, sucrées, dans une paume ouverte"),
                 ("S10", "Patinoire : une lame qui fend la glace en virage, au ras de la glace, copeaux, lumières "
                         "d'hiver floues au fond ; sans visage")],
      note="La galerie ne montre que les clichés que le livre décrit, par des objets et des lieux, jamais un visage. "
           "Tant que Karl ne les a pas photographiés, les bonbons, la patinoire et le croque-monsieur restent flous "
           "(arbitrage 7)."),
    T("5.7", "Le révolu don Juan", (124, "L’angle du téléphone"), "La galerie du téléphone", "Julie", "glissement",
      "Le selfie flou ; les lunettes qui changent ; la Seine ; la vidéo sous la pleine lune.",
      photos=[(34876053, "photo"), (38279684, "photo"), (38570570, "photo")],
      gestes=[("une vidéo montre Darshan chanter à contre-jour de la lune",
               "toucher la vidéo : la ballade, entière pour la première fois, la seule fois où quelqu'un la chante ; "
               "huit mesures, jusqu'au bout", "toucher")],
      moments=[("L’angle du téléphone les rapetisse",
                "le selfie s'ouvre : deux silhouettes floues dans une lumière couleur terre"),
               ("elles changent assez régulièrement",
                "la galerie défile vite ; 1,2 s après, les lunettes frémissent dans le sac de Darshan (comme en 6.4)"),
               ("Darshan est représenté face à un chevalet le long de la Seine", "le cliché de la Seine s'ouvre"),
               ("Plus loin dans la galerie du téléphone",
                "la vignette de la vidéo paraît : la pleine lune derrière une cheminée")],
      son="chambre ; la ballade, entière, par le haut-parleur du téléphone (melodie)",
      reperages=[("S7", "Lunettes : les lunettes fumées de 1.2, les binocles ronds de 6.4 et une paire en "
                        "écaille, chacune posée à un lieu de leurs sorties (table de café, banc, parapet) ; sans "
                        "personne"),
                 ("S7", "Chevalet sur un quai de Seine : toile commencée, boîte de petits tubes ouverte sur le "
                        "parapet ; sans visage")],
      note="La ballade n'est entière qu'ici avant le baiser (arbitrage 2). Le portrait 38536478 reste exclu tant que "
           "Karl n'en a pas décidé."),
    T("5.8", "Des garçons normaux", (125, None), "Le souvenir ; la chambre de Julie", "Julie", "—",
      "La vidéo s'agrandit et devient le souvenir : la cheminée devant la pleine lune ; puis la chambre, pâle.",
      photos=[(38570570, "photo"), (10879428, "photo")],
      moments=[("il s’avance vers elle en déclamant ses vers",
                "la vue avance lentement vers la lune, comme il avance vers elle"),
               ("Il est incroyable", "retour à la chambre pâle ; la rue se tait"),
               ("L’air électrique d’une mélodie trotte dans la tête de Julie",
                "un pied bat la mesure, à 6/8, sans une note : la mélodie reste dans sa tête")],
      son="rue (nuit) ; puis chambre ; un pied à 6/8",
      note="Aucune ballade ici : le lecteur, qui vient de l'entendre, la retrouve de mémoire. « Il est incroyable. » "
           "et la suite sont en romain dans le livre imprimé, une voix dite qui tutoie Julie ; « La fille que tu "
           "étais […] » (5.9), en italique, lui répond : même place, sans couleur de personnage."),
    T("5.9", "Je l'aime", (128, None), "La chambre de Julie", "Julie", "—",
      "La chambre pâle ; sous la lumière chaude de l'éclair, le ciel du soir ; puis la vue monte jusqu'au croissant.",
      photos=[(10879428, "photo"), (38674516, "photo")],
      gestes=[("Il choisit la synchronie d’une dépendance à deux",
               "maintenir : les deux cœurs de 2.9 (Darshan 96, Julie 64) se rejoignent vers 80 et battent ensemble",
               "maintenir")],
      moments=[("La foudre est une caresse",
                "éclair doux : une lumière chaude, et la fenêtre s'ouvre sur le ciel du soir"),
               ("s’est mué en clairon clair et limpide",
                "le bourdonnement grave se tait ; une seule note claire, tenue"),
               ("Une flopée de caresses flattent son palpitant", "le cœur de Julie bat seul, irrégulier"),
               ("le souhait porté à la lune", "la vue monte du ciel du soir jusqu'au croissant")],
      son="chambre ; bourdon ; une note claire ; battements",
      note="« Je l’aime et je vais lui dire. » seul à l'écran, sans effet : le texte suffit. Après, un événement par "
           "temps, et rien de plus."),
    T("5.10", "La pâtisserie", (130, None), "La rue, la pâtisserie", "Julie", "obturateur",
      "La rue le soir, qui se brouille ; la vitrine, floue et chaude tant que Karl ne l'a pas photographiée.",
      photos=[(16592454, "photo"), (10369144, "photo")],
      moments=[("La rue se fait floue",
                "la rue se brouille, le bruit s'assourdit ; la vitrine paraît, floue et chaude"),
               ("L’éclair a-t-il la carrure de porter ses sentiments",
                "avec la vitrine de Karl : mise au point sur l'éclair, un reflet glisse sur son glaçage"),
               ("Le chocolat, le café sont-ils des arômes dignes de l’amour",
                "avec la vitrine de Karl : la mise au point glisse vers le chocolat et le café"),
               ("Un baba au rhum doté d’un parfum d’Antilles",
                "avec la vitrine de Karl : la mise au point cherche le baba au rhum")],
      son="rue ; puis pâtisserie (clochette)",
      reperages=[("S5", "Vitrine de pâtisserie, le soir, en hauteur : éclairs au chocolat et au café, baba au "
                        "rhum ; sur pied")],
      note="Pas de geste : la mise au point hésite à la place du lecteur, qui garde son geste pour la buée (5.11). "
           "Tant que Karl n'a pas photographié la vitrine, elle reste floue, sans zone nette ni reflet."),
    T("5.11", "La charlotte", (131, None), "La pâtisserie", "Julie", "—",
      "La vitrine s'embue ; par un hublot essuyé, un cercle rouge.",
      photos=[(10369144, "photo"), (29188525, "photo")],
      gestes=[("au travers d’une vitrine embuée",
               "frotter la buée en petits cercles : un hublot s'ouvre au milieu, le reste de la vitre reste embué",
               "toucher trois fois")],
      moments=[("Julie s’égare dans ses songes", "la buée monte sur la vitrine"),
               ("sur elles perle une fine condensation",
                "avec la Charlotte de Karl : rapprochement, dans le hublot, vers les feuilles de sucre"),
               ("Julie repart avec son ticket",
                "le ticket entre au sac de Julie (notification) ; son bouton ploie, comme celui de Darshan en 5.2"),
               ("Elle le récupérera à onze heures et son rendez-vous est à treize heures",
                "compte à rebours : « onze heures », « treize heures », avec un tic")],
      objets=["+ ticket de la pâtisserie (notification, sac de Julie)"],
      son="pâtisserie ; buée frottée ; tic",
      reperages=[("S5", "Charlotte aux framboises (cercle de framboises, boudoirs, trois feuilles de sucre "
                        "perlées), derrière une vitre embuée : même cadre, sur pied, en hauteur, vitre embuée, "
                        "puis un rond essuyé au milieu, puis vitre nette")],
      note="Pas de ruban autour de la Charlotte : le rouge passe du cercle de framboises au nœud du paquet (6.1). "
           "En attendant la photo de Karl, le hublot ne montre qu'un cercle rouge, doux, derrière la buée restante."),

    # ============================================================ 6. Des attentes de part et d'autre
    T("6.1", "Il est midi", (134, None), "Paris, la rue Rousseau", "Julie", "bandes-photo",
      "Julie de dos, son chouchou rouge ; à sa main gauche, le paquet, dont le ruban flotte au vent puis bat au rythme "
      "de son cœur.",
      photos=[(33035648, "photo")],
      moments=[("Il est midi", "« midi » naît de « onze heures » et de « treize heures », en haut de la page, avec le tic"),
               ("Son nœud vacille au vent comme son cœur", "le cœur de Julie, vif ; le ruban bat à son rythme")],
      objets=["ticket → paquet au ruban rouge (discret : la charlotte est dans sa boîte)"],
      son="rue ; mistral en rafales, satin du ruban ; le cœur de Julie, vif",
      reperages=[("S5", "Paquet de pâtisserie noué d'un ruban de satin rouge, tenu à la main dans le vent, sans "
                        "visage")]),
    T("6.2", "Les deux listes", (136, None), "Écran partagé", "les deux", "—",
      "Deux moitiés séparées par l'arête d'un coin de rue : la façade à l'encre (Darshan), la rue en photo (Julie) ; "
      "deux listes à cocher ; quand Julie tourne le coin, la façade devient photo.",
      photos=[(33035628, "encre"), (33035648, "photo"), (33035628, "photo")],
      gestes=[("Veste, barbiche comme il faut, bague, chemise des grands jours", "cocher la liste de Darshan", "toucher"),
              ("Bague, boucles d’oreilles, gâteau, sac à main",
               "cocher la liste de Julie : « Bague » et « des grands jours » s'allument des deux côtés", "toucher")],
      moments=[("passe le coin de rue qui la sépare de Darshan",
                "la ligne de partage glisse et s'efface ; la façade à l'encre devient photo")],
      son="rue ; une rue par oreille ; coche au pinceau, coche au stylo",
      note="Les deux listes riment (« bague », « des grands jours ») : des attentes de part et d'autre. L'écran partagé "
           "revient pendant l'attente de 6.11, puis en 7.4. En grand texte, les listes s'empilent."),
    T("6.3", "Les retrouvailles", (140, None), "Au pied de la bâtisse", "Julie", "—",
      "La façade haussmannienne, ses balcons et leurs jardinières, sous un halo couleur de blé ; puis la porte bleue.",
      photos=[(33035628, "photo"), (32429264, "photo")],
      moments=[("un halo de la couleur du blé",
                "halo de blé, venu du zénith, sur la bande des balcons ; « midi » s'y fond ; la note claire de 5.9"),
               ("C’est très gentil, mais tu pourrais en garder pour quand on sera à l’intérieur", "la porte bleue")],
      son="rue ; plus calme, c'est midi ; une seule note claire, tenue, au halo"),
    T("6.4", "La clé dans la poche", (144, None), "La porte de la demeure", "Julie", "—",
      "La porte bleue sous le balcon ; à « La porte est ouverte », l'encre saigne depuis le bouton du portillon : la porte "
      "devient celle de la légende (3.1, 3.2).",
      photos=[(32429264, "photo"), (32429264, "encre")],
      gestes=[("puis pousse la porte", "pousser la porte, comme Julie (même consigne qu'au pigeonnier)", "toucher")],
      moments=[("la clé est dans ma poche", "hors champ : seul le bouton Objets frissonne, les lunettes sont devenues clé"),
               ("La porte est ouverte", "l'encre saigne depuis le bouton du portillon"),
               ("Darshan pose sur son nez une paire de binocles", "nouvel objet : les binocles")],
      objets=["lunettes → clé (discret : Julie ne voit rien, le bouton Objets frissonne)", "clé → binocles (Nouvel objet)"],
      son="rue ; tintement du frisson, déclic, encre qui s'épanouit, porte",
      note="La coquetterie cache la magie : Julie ne voit que des binocles, le lecteur voit la clé dans le sac. L'étoile "
           "de la demeure naît en 6.5, quand la lumière de la porte a gagné l'écran."),
    T("6.5", "Le repère de la grâce", (148, None), "L'appartement", "Julie", "porte",
      "La fenêtre voilée, dessinée, d'où vient une lumière tamisée ; la patère ; un rabat de velours bleu nuit.",
      photos=[(12443176, "photo"), (38570569, "photo")],
      gestes=[("Julie est troublée par la qualité de l’étoffe entre ses doigts",
               "caresser le velours de haut en bas, lentement : le poil s'éclaire dans son sens, fonce à rebours",
               "toucher")],
      moments=[("Il l’accroche sur l’une des patères disponibles", "la patère"),
               ("Leurs rabats de velours", "le velours, en gros plan")],
      son="appartement ; tentures, horloge lointaine, velours sous le doigt",
      reperages=[("S1", "Rabat de velours bleu nuit en lumière rasante, cadre en hauteur")]),
    T("6.6", "Les toiles", (148, "L’encens et le thé"), "L'appartement, le salon", "les deux", "fondu",
      "Un mur de toiles de lin à l'encre de Chine : lunes, arbres, arche ; en bas au milieu, l'encens, la pierre et les "
      "bâtons d'encre ; en haut au milieu, le couple qui danse main dans la main, seule toile que l'aquarelle colore.",
      moments=[("L’encens et le thé sont servis dans le salon", "l'encens et les thés quittent le sac, sans bandeau"),
               ("Leur fumet agit comme un fil d’Ariane",
                "la fumée monte seule de l'encens à la toile du couple ; les toiles s'éclairent à son passage"),
               ("La peinture fait partie des rares œuvres que l’aquarelle irrigue de couleurs",
                "l'aquarelle irrigue la toile du couple : l'orange et le jaune suivent les berges d'encre")],
      objets=["− encens, − thés (dépôt discret : servis dans le salon)"],
      son="appartement ; encens qui crépite, souffle de la fumée, pinceau",
      note="Une page à regarder, sans geste. Mise en abyme : les toiles sont dessinées de la même main que le monde de "
           "Darshan. Le couple a les couleurs de la robe orange (7.11) et du gilet jaune (5.6), à valider par Karl."),
    T("6.7", "Le vertige", (149, None), "L'appartement, la fenêtre", "Julie", "fondu",
      "La fenêtre ciselée de moulures ; le voilage s'écarte : une rue vue d'un étage, qui n'est pas la rue Rousseau.",
      photos=[(12443176, "photo")],
      gestes=[("Sans avoir emprunté ni marches ni ascenseurs", "écarter le rideau : la ville paraît, vue d'un étage", "toucher")],
      moments=[("elle jurerait depuis sa fenêtre avoir quitté terre et être à un étage",
                "vertige : la fenêtre reste, la ville recule")],
      son="appartement ; rideau, la ville monte d'en bas puis s'éloigne",
      note="Tant que le repérage S7 manque, la vue reste floue derrière la vitre : les toits pictaves ne sont pas Paris.",
      reperages=[("S7", "Une rue haussmannienne vue d'une fenêtre de premier ou de deuxième étage, garde-corps de "
                        "fer forgé au premier plan, façades d'en face, lumière d'après-midi, cadre en hauteur")]),
    T("6.8", "Le thé de haut", (150, None), "L'appartement", "Julie", "fondu",
      "Le filet de thé versé de haut dans la tasse de cuivre ; puis, derrière l'épaule, le tableau : une barque vide sur "
      "un lac, en noir et blanc, dans un cadre de bois sombre.",
      photos=[(37296469, "photo"), (34342149, "photo")],
      gestes=[("Il la hisse à hauteur d’épaule",
               "lever la théière : glisser vers le haut, le filet s'allonge jusqu'à la tasse", "maintenir")],
      moments=[("reconnaît derrière son épaule un tableau", "le tableau paraît derrière l'épaule")],
      son="appartement ; thé versé, de plus en plus aigu",
      note="Tant que le repérage S1 manque, la photo du thé reste floue : elle montre un gaiwan et de la porcelaine.",
      reperages=[("S1", "Chai versé de haut dans une tasse de cuivre tenue par sa soucoupe, la main seule ; la "
                        "tasse au milieu de la hauteur, la théière en haut")]),
    T("6.9", "Théo est un ami", (153, None), "L'appartement", "Julie", "—",
      "Le même tableau ; l'image avance lentement vers la barque vide.",
      photos=[(34342149, "photo")],
      moments=[("le vivant qui ne peut se permettre d’attendre", "l'horloge passe au premier plan")],
      son="appartement (horloge) ; l'horloge, au premier plan à la dernière phrase"),
    T("6.10", "Le dosa", (156, None), "L'appartement, la table", "Julie", "fondu",
      "L'assiette à motifs, en gros plan ; la main de Julie près de l'assiette, dans une lumière qui refroidit.",
      photos=[(38694025, "photo")],
      gestes=[("Darshan pose sa main sur celle de Julie",
               "maintenir : la main sur la main ; sous le doigt, deux cœurs déjà accordés", "maintenir")],
      moments=[("Ensemble ils savourent ce doux goût de curry", "le curcuma d'Aluva quitte le sac, sans bandeau"),
               ("qui commence à rafraîchir la pièce", "la lumière refroidit ; la main de Julie")],
      objets=["− curcuma (dépôt discret : le curry du dosa)"],
      son="appartement ; l'horloge au loin ; deux cœurs ensemble, à 80 ; la rue du soir",
      note="La cuisine photographiée à Villandry, en plans serrés seulement. L'assiette reste floue tant que le "
           "repérage S6 manque.",
      reperages=[("S1", "La main de Julie posée sur une table de bois, près d'une assiette ; puis la main qui se "
                        "retire ; puis la table sans elle (la même séance que la main de 2.1)"),
                 ("S6", "Dosa sur une assiette à motifs, deux fourchettes, fin de jour")]),
    T("6.11", "Je tiens à toi", (158, None), "L'appartement, la table", "les deux", "—",
      "La main de Julie ; « aime », un instant ; pendant l'attente, l'écran partagé : le ciel de 1.1 et l'étoile à part, "
      "la main seule de Julie ; puis la table, l'éclat brisé, trois portes d'encre ouvertes sur le papier nu.",
      photos=[(38694025, "photo"), (38570603, "photo"), (27116682, "encre")],
      gestes=[("Darshan se lève, porte ses mains au ciel et attend",
               "attendre, comme lui : dix secondes, sans rien toucher ; l'écran se partage entre son ciel et la main de Julie",
               "attendre"),
              ("Il se saisit de ses lunettes et d’un mouvement de poignet les change en clés",
               "le geste vif de la première porte : glisser vers le haut, vivement ; l'éclat se brise", "toucher")],
      moments=[("Je dirais même pour ma part que je t’aime", "« aime », le graffiti de Karl, un instant, le regard baissé"),
               ("Darshan se lève, porte ses mains au ciel",
                "son cœur se tait ; celui de Julie reste seul, irrégulier ; l'horloge passe au premier plan"),
               ("Dix longues secondes s’écoulent", "la table ; le compte à rebours : « Dix longues secondes »"),
               ("Il ferme les yeux, inspire et appelle son père",
                "la quinte à vide de 1.1, deux fois, que rien ne résout"),
               ("Rien ne se passe", "seul à l'écran ; silence complet ; le compte se défait sur rien"),
               ("mais elles ne mènent nulle part",
                "trois portes d'encre s'ouvrent sur le papier nu ; les étincelles du carnet meurent")],
      objets=["binocles → clé (éclat brisé ; la fiche ne s'ouvre pas)"],
      son="appartement ; deux cœurs, puis celui de Julie seul ; dix coups d'horloge ; la quinte sans réponse ; silence ; "
          "éclat qui se brise",
      note="Le graffiti « je t'aime » de Karl, recadré sur « aime », un instant, quand Julie le dit (choix de Karl, "
           "29 septembre). L'attente reprend l'écran partagé de 6.2 : des attentes de part et d'autre ; tant que la main "
           "de Julie n'est pas photographiée (S1), sa moitié montre sa place à table. Le père ne répond jamais : son "
           "accord n'appartient qu'à sa porte. Aucune fiche ne s'ouvre pendant ce temps fort."),
    T("6.12", "Des paysages dépourvus de sens", (161, None), "L'appartement", "les deux", "—",
      "La fonte vue du dehors, encre visqueuse qui goutte sur la photo ; derrière chaque porte d'encre, un paysage de "
      "Karl ; puis la photo s'efface : ne restent sur le papier que les portes d'encre.",
      photos=[(38694025, "photo"), (39228274, "photo"), (39564914, "photo"), (39212543, "photo"), (10644439, "photo"),
              (35024039, "photo"), (13020351, "photo")],
      gestes=[("Il répète l’opération",
               "ouvrir porte après porte, de plus en plus vite : chacune donne un instant sur un paysage de Karl, puis claque",
               "toucher")],
      moments=[("s’est fondue le temps d’un instant en une matière visqueuse",
                "la fonte vue par Julie : une encre visqueuse qui goutte sur la photo"),
               ("La routine postiche de Darshan", "la photo s'efface ; ne restent que les portes d'encre sur le papier")],
      son="appartement ; fonte visqueuse ; un son par paysage, portes qui claquent ; puis presque rien",
      note="Six photos de Karl, jetées l'une après l'autre : la première, le village rêvé de 4.5 ; la dernière, le champ "
           "de blé, a la couleur du halo de 6.3. Aucune église, aucune inscription lisible."),
    T("6.13", "Le placard", (163, None), "L'appartement, le placard", "les deux", "fondu",
      "Une seconde, la fenêtre de 6.7 ; la main de Julie, qui se retire ; l'armoire à l'encre, la clé de laiton ; dans le "
      "cadre du placard, la verdure photographiée.",
      photos=[(38694025, "photo"), (32429189, "photo")],
      gestes=[("Darshan se saisit de la main de Julie et l’invite à le suivre",
               "prendre sa main : elle reste immobile, puis se retire", "toucher"),
              ("il insère une clé de laiton un peu oxydé", "tourner la clé d'un quart de tour, comme au pigeonnier",
               "toucher la clé")],
      moments=[("Darshan souffle, il se dirige vers la porte du placard", "l'armoire à l'encre"),
               ("le placard donne sur un espace de verdure proche du parc Montsouris",
                "le placard s'ouvre : dans son cadre d'encre, la verdure photographiée ; le merle chante")],
      objets=["clé de laiton : dans la serrure du placard (quart de tour)"],
      son="silence ; tissu, tour de clé comme au pigeonnier ; puis le parc et son merle",
      note="La clé se tourne comme au pigeonnier (1.3), avec la même consigne et le même rayon. Ce que la main n'obtient "
           "pas, la clé l'obtient. L'étoile du placard naît en 6.15, quand Julie le franchit.",
      reperages=[("S1", "Clé de laiton un peu oxydée dans la serrure d'une armoire entrouverte sur des serviettes "
                        "(facultatif)")]),
    T("6.14", "Ta colère est juste", (164, None), "Le placard ouvert", "les deux", "—",
      "Dans le cadre d'encre du placard : la verdure, puis la maison au lierre de Julie.",
      photos=[(32429189, "photo"), (10199772, "photo")],
      moments=[("Et là, c’est le palier de ma porte", "dans le cadre du placard, sa maison au lierre")],
      son="parc ; le merle, par le placard"),
    T("6.15", "Un moyen", (167, None), "Le palier de Julie", "Julie", "—",
      "Le cadre s'élargit, Julie traverse ; l'encre se retire ; sa maison, puis sa porte dans le lierre, la même qu'en 2.9, "
      "sous le crépuscule ; le ruban rouge, immobile.",
      photos=[(10199772, "photo")],
      gestes=[("elle parcourt les quelques mètres la séparant de son palier",
               "marcher : glisser lentement vers le haut, le cadre du placard s'élargit jusqu'à disparaître", "toucher")],
      moments=[("Derrière elle, Darshan ferme la porte",
                "l'encre se retire des bords de l'image ; le bruit de la porte épaisse de 2.9"),
               ("Julie seule et déboussolée n’a que ses lierres",
                "sa porte dans le lierre, au crépuscule ; le ruban pend, seul rouge de l'image ; la boussole du carnet "
                "s'arrête, perdue")],
      objets=["clé → lunettes (discret, derrière la porte)", "le paquet au ruban rouge reste dans le sac de Julie"],
      son="parc ; pas sur les pavés, la porte épaisse ; puis la rue du soir, le merle au loin ; silence",
      note="Rime avec 2.9 : la même porte (décor seuil-lierre du chapitre 2), le même bruit de porte épaisse, sans lui ; "
           "et avec 2.8 : la même marche, seule. Le paquet reste dans le sac de Julie.",
      reperages=[("S2", "La même porte qu'en 2.9, au crépuscule"),
                 ("S2", "Le paquet au ruban rouge tenu à la main devant cette porte, au crépuscule")]),

    # ============================================================ 7. Au-delà de la porte
    T("7.1", "Le désert", (170, None), "Le désert libyque, la nuit", "Darshan", "bandes",
      "Dessin : le ciel de 1.1 viré du bleu royal au velours noir, des dunes à l'encre, le doigt de dieu "
      "dressé au premier plan (l'empilement de rochers que 6.12 montrait derrière une porte) ; les paupières "
      "se ferment, les astres ruissellent, puis le soleil rougit les paupières.",
      photos=[(27116682, "encre"), (35024039, "modèle")],
      gestes=[("Paupières fermées sur le ciel", "maintenir pour fermer les yeux : les paupières descendent sur le ciel",
               "maintenir, ou toucher")],
      moments=[("sur elle ruissellent des astres fuyants", "à travers les paupières, les étoiles coulent vers le bas comme des larmes"),
               ("il accepte la morsure du soleil", "le temps passe : le noir des paupières vire au rouge du soleil")],
      son="désert (vent) ; les yeux fermés, le vent s'assourdit ; puis la chaleur"),
    T("7.2", "La coccinelle", (172, None), "La mousse ; puis la chambre de Julie", "les deux", "fondu",
      "Le lit de la coccinelle, pétales fanés ; puis la chambre de Julie, la lumière bleue de la télévision sur la couette.",
      photos=[(11968793, "photo"), (10879428, "photo")],
      moments=[("La coccinelle contrainte de quitter son jardin prépare sa diapause",
                "intermède : la coccinelle est déjà cachée sous les pétales"),
               ("Julie fixe sa télé", "la lumière bleue de la télévision bat sur la couette")],
      son="vent (feuilles) ; puis chambre, télévision lointaine, sans paroles",
      reperages=[("S4", "Coccinelle dans la mousse, sous des pétales fanés (macro, en hauteur ; facultatif)")]),
    T("7.3", "Une larme", (174, None), "Entre les deux mondes", "les deux", "fondu",
      "Un glaçon, cadré serré, la boisson hors de la mise au point, une goutte qui coule ; la banquise de la "
      "maquette ; puis les dunes.",
      photos=[(35760712, "photo"), (10644439, "photo")],
      moments=[("Une larme ne fait pas une oasis", "une goutte coule le long du verre"),
               ("un glaçon au fond d’un mojito ne forme pas un iceberg", "le glaçon devient banquise, en fondu enchaîné"),
               ("Aux côtés de dunes", "la banquise fond en dunes ; un souffle de sable")],
      son="désert (jour) ; glaçon, craquement de la glace, sable"),
    T("7.4", "Le désert fleurit", (175, None), "Le désert ; l'hôpital ; le Periyar", "les deux", "—",
      "Le désert de jour ; l'averse tombe d'elle-même et fait naître les fleurs à l'aquarelle ; puis l'écran "
      "partagé : le couloir de l'hôpital à gauche, le désert en fleurs puis le Periyar à droite, séparés par un "
      "fil de nuit.",
      photos=[(35086239, "encre"), (35375606, "photo"), (10310851, "encre")],
      moments=[("Darshan voit le désert fleurir sous l’averse", "l'averse tombe d'elle-même et peint les fleurs à l'aquarelle"),
               ("Ensemble et pourtant si loin de l’autre", "les deux moitiés s'éclairent ensemble sans se toucher")],
      son="pluie ; puis hôpital et kerala, chacun de son côté",
      note="Pas de geste : Darshan regarde le désert fleurir. L'écran partagé est celui de 6.2 et 6.11.",
      reperages=[("S3", "Brancards dans un couloir d'hôpital, sans patient (facultatif)")]),
    T("7.5", "Derrière les portes", (177, None), "L'hôpital, la salle de dépôt", "Julie", "obturateur",
      "Le couloir en noir et blanc et sa lampe ; la porte du local, à droite.",
      photos=[(35375606, "photo")],
      gestes=[("elle frappe gentiment la surface de la porte", "frapper deux fois, doucement", "toucher deux fois")],
      moments=[("Darshan, tu m’entends", "silence ; rien à toucher pendant trois secondes : Julie patiente")],
      objets=["+ électrocardiogramme (envol, sac de Julie)"], son="hôpital ; pas rythmés, deux coups, silence"),
    T("7.6", "Le feu", (183, None), "Aluva, au bord du Periyar", "Darshan", "encre",
      "Le feu des sardines en gros plan, à l'encre ; les étincelles montent rejoindre les étoiles ; "
      "le regard de Jivan : Darshan qui se lève, de dos, tout près ; puis au loin, sur une passerelle, au soir ; "
      "puis le feu, que Jivan garde.",
      photos=[(22591346, "encre"), (36652487, "modèle")],
      gestes=[("Darshan attise la braise du feu",
               "attiser : glisser vers le haut sur les braises, les étincelles montent", "toucher")],
      moments=[("Jivan assiste au départ, le ventre vide, de Darshan",
                "contrechamp : Darshan se lève, de dos, tout près, vu par Jivan"),
               ("Jivan ne lui répond pas", "Darshan au loin sur la passerelle, au soir : pour la première fois, Jivan le regarde partir"),
               ("Il se contente de prendre le relais au feu", "retour au feu : c'est Jivan qui le garde")],
      objets=["+ de quoi écrire (envol)"], son="kerala (soir) ; feu, braises"),
    T("7.7", "Darshan écrit", (188, None), "Aluva", "Darshan", "—",
      "La feuille, éclairée par le feu ; la déclaration s'écrit à l'encre, ligne après ligne ; on ne peut pas l'effacer.",
      gestes=[("Darshan écrit", "écrire du doigt : l'encre coule tant que le doigt appuie sur la feuille", "toucher"),
              ("plus rien ne peut les effacer", "tenter d'effacer : frotter de haut en bas, l'encre résiste", "toucher")],
      moments=[("Les astres peuvent s’éteindre tant que je peux t’étreindre", "le bouton du carnet vacille une fois")],
      objets=["+ lettre (envol)"], son="kerala (soir) ; feu, plume, puis frottement du papier",
      reperages=[("S1", "La lettre, de la main de Karl : les cinq lignes de la déclaration, à la plume, encre "
                        "noire ou bleu nuit, sur un papier crème ; numérisée à plat ou photographiée en lumière "
                        "égale")],
      note="Moment typographique : la déclaration, écriture tracée à l'encre (la sincérité du vers de 3.7)."),
    T("7.8", "La fente", (194, "Darshan s’élance"), "Le local à kayaks ; la pharmacie de l'hôpital", "les deux", "—",
      "La lettre ; trois bonds jusqu'au local à kayaks, la nuit (le dessin du chapitre 1, cadré sur la porte) ; "
      "la clé née des lunettes dans la serrure ; le jour au pied de la porte ; le couloir de l'hôpital, où jaillit la lettre.",
      photos=[(35086240, "modèle"), (35375606, "photo")],
      gestes=[("L’entrebâillement au pied de la porte s’allume",
               "un tour de poignet : tourner la clé d'un quart de tour, comme en 1.3", "toucher"),
              ("Darshan y glisse sa déclaration", "glisser la lettre sous la porte", "toucher")],
      moments=[("Darshan s’élance en enjambées vertigineuses", "trois bonds, comme sur les tuiles"),
               ("Ses lunettes rejoignent sa main puis la serrure du local",
                "éclat court : les lunettes deviennent la clé, déjà dans la serrure"),
               ("voit jaillir de la fente de la pharmacie à morphiniques, un papier",
                "la lettre d'encre jaillit dans la photo ; l'étoile de la porte naît de l'embrasure")],
      objets=["lunettes → clé (éclat court)", "lettre : Darshan → Julie (transfert)"],
      son="kerala (soir) ; trois sauts, l'éclat, le cran, l'hôpital de nuit par le jour de la porte, le papier ; puis hôpital",
      reperages=[("S1", "Porte de planches la nuit, lumière allumée derrière : la fente du bas éclairée (modèle "
                        "du local)")]),
    T("7.9", "Le chemin du retour", (196, None), "Paris, le chemin de Julie", "Julie", "obturateur",
      "Le carrefour de 4.4 ; le banc filé, une silhouette floue ; la rue au soleil couchant (image d'attente, "
      "recadrée sans voiture) et, au bord droit, le ruban rouge tenu hors champ.",
      photos=[(10355467, "photo"), (34500385, "photo"), (26775590, "photo")],
      gestes=[("elle court à la vue de Darshan",
               "courir : toucher en rythme, six foulées, tempo libre, comme la danse des tuiles ; chaque foulée, "
               "une croche de la première mesure de la ballade (celle du seuil, 2.9)",
               "toucher en rythme")],
      moments=[("il porte à la main un paquet au ruban rouge", "le ruban, seul vermillon de l'image")],
      objets=["− électrocardiogramme (discret, au début : Julie rentre chez elle)",
              "+ paquet au ruban rouge (paquet-darshan, même nom que celui de Julie ; discret, sac de Darshan)"],
      son="rue (été) ; martinets ; pas, la première mesure de la ballade, une croche par foulée ; le cœur de Julie "
          "qui s'emballe",
      reperages=[("S2", "La rue de Rungis (Paris 13e) dans l'axe du couchant, fin juin : façades de pierre de "
                        "taille et balcons filants, trottoir de dalles au premier plan, une voiture de couleur "
                        "neutre garée à droite, plaque hors champ (sert de 7.9 à 7.15)")]),
    T("7.10", "Genou à terre", (197, None), "Rue de Rungis", "Julie", "—",
      "La rue au soleil couchant ; le ruban rouge qui monte à hauteur d'épaule ; les paupières se ferment pour le baiser.",
      photos=[(26775590, "photo")],
      gestes=[("Darshan reçoit la marque de dilection sur sa nuque",
               "maintenir : le baiser ; les paupières se ferment, un seul cœur pour deux, de 80 à 60", "maintenir, ou toucher")],
      moments=[("Les années forment des secondes", "la rue ralentit : ses bruits se creusent"),
               ("Le ruban de satin s’affole", "le ruban s'affole au vent")],
      son="rue (été) ; tout ralentit ; un cœur à l'unisson, puis la ballade entière, qui finit avec la page",
      reperages=[("S2", "La main d'un homme, un genou au sol, qui tend le paquet au ruban rouge contre le soleil "
                        "couchant")]),
    T("7.11", "Éclipse", (200, None), "Rue de Rungis", "Julie", "—",
      "Le regard remonte la rue jusqu'au soleil ; l'éclipse photographiée par Karl (Galice, 12 août 2026), du premier "
      "contact à la totalité ; le chiasme s'écrit sur le disque noir.",
      photos=[(26775590, "photo"), (38993391, "photo"), (38993497, "photo"), (38993636, "photo"), (38995522, "photo")],
      gestes=[("remontent une robe crépue de la couleur de l’orange",
               "lever les yeux : glisser vers le haut, du bas de la rue jusqu'au soleil", "toucher")],
      moments=[("larmoient au contact de son regard perlé d’amour", "premier contact : le soleil s'entame"),
               ("Ils font un pas vers l’autre", "le croissant s'affine"),
               ("Darshan se penche vers elle", "le ciel s'assombrit"),
               ("Le contact de leurs corps éclipse tout Paris",
                "la totalité : l'anneau s'embrase une demi-seconde, puis la ville se tait"),
               ("réarrangeant le monde avec plus de beauté", "une seule étoile paraît près de la couronne"),
               ("Julie aime Darshan et Darshan aime Julie", "le chiasme, en vermillon, croisé sur le disque noir")],
      objets=["paquet au ruban rouge : il quitte le sac de Darshan, sans signe ; Julie n'en porte qu'un"],
      son="rue (été) ; ralentie, elle se tait à la totalité ; puis le silence",
      reperages=[("S2", "En plongée depuis un genou à terre : les dalles et, en haut du cadre, deux souliers de "
                        "femme et l'ourlet d'une robe orange ; rien au-dessus du genou (avec un modèle)")],
      note="Moment typographique : « Julie aime Darshan et Darshan aime Julie » (la réciprocité du vers de 3.7)."),
    T("7.12", "La porte du père", (204, None), "Rue de Rungis", "les deux", "lumiere",
      "Le soleil revient ; la rue tremble, le trottoir se fend en étoile ; la porte du père de 3.10 (la porte "
      "d'Irun, à l'encre, et sa lanterne) monte de la fente devant le soleil ; puis le monde se fige en noir et blanc, "
      "seules la porte et la lanterne gardent leurs couleurs.",
      photos=[(26775590, "photo"), (39434691, "encre"), (19059625, "modèle")],
      moments=[("vibrent sous leurs pieds", "la photo tremble"),
               ("laissent apparaître le linteau", "la porte du père perce la photo, le linteau d'abord"),
               ("Le linteau s’accompagne d’une lanterne aux rayons pénétrants",
                "la lanterne s'allume : l'accord du père, tenu jusqu'à ce que Darshan s'en détourne (7.13)"),
               ("Le bois est couvert de motifs", "les motifs d'or paraissent sur le bois"),
               ("Darshan reconnaît l’accès vers son père", "le bouton du carnet luit : l'anneau du père s'allume"),
               ("Les passants s’arrêtent et observent",
                "le monde se fige : la photo perd ses couleurs, des fenêtres s'éclairent, la ville se tait")],
      son="rue (été) ; grondement, puis l'accord du père ; la ville se tait, l'accord reste seul",
      note="Temps fort : l'encre de Darshan entre dans le Paris de Julie. Scène écrite à la main (rue-de-rungis), de "
           "7.12 à 7.15 ; chaque page s'ouvre sur l'état où la précédente s'arrête."),
    T("7.13", "Le choix", (207, None), "Rue de Rungis", "les deux", "—",
      "La porte, sa lanterne, la rue figée ; la vue s'approche, recule d'un demi-pas, repart ; la paume sur le bois, "
      "qui ne bouge pas.",
      photos=[(26775590, "photo"), (39434691, "encre")],
      gestes=[("pose sa main sur l’éternel bois du pont menant vers son créateur",
               "poser la paume sur le bois et la garder : la clé n'est pas proposée, la porte ne réagit pas",
               "maintenir, ou toucher")],
      moments=[("Je ne sais pas si je pourrai revenir",
                "la vue recule d'un demi-pas ; l'accord du père s'éteint, la note haute la dernière ; la lanterne ne change pas")],
      son="silence ; l'accord s'éteint sur la réplique ; la paume, sans un bruit"),
    T("7.14", "La prière", (212, None), "Rue de Rungis", "les deux", "—",
      "La porte et sa lanterne ; la réplique de Darshan, en or comme toutes les siennes ; puis l'or s'en va, la clé "
      "tombe en poussière, la constellation du carnet s'éteint dans la page.",
      photos=[(26775590, "photo"), (39434691, "encre")],
      moments=[("En faisant de moi un mortel",
                "le désenchantement, à l'échelle de la page : l'or quitte les mots, la clé tombe en poussière, les étoiles "
                "du carnet s'éteignent une à une, l'anneau du père le dernier, les boutons disparaissent")],
      objets=["clé : désenchantement (elle se défait en poussière d'or)",
              "les boutons « Objets » et « Carnet » disparaissent ; l'étoile ✦ devient un coin de page"],
      son="silence ; tout s'éteint sans un bruit",
      note="Seule coupe du livre au milieu d'une phrase : « En faisant de moi un mortel, » reste seul à l'écran "
           "pendant le désenchantement, puis « je vous prie… ». Une seule annonce, invisible, pour les lecteurs d'écran."),
    T("7.15", "La chute", (213, None), "Rue de Rungis ; puis le ciel du soir", "Julie", "—",
      "Le bruit sourd : la lanterne s'éteint net ; puis la porte tombe dans la fente, sans un son ; les couleurs "
      "reviennent, sans trace d'encre ; les passants reprennent leur course ; le ciel du soir et la lune de 5.9.",
      photos=[(26775590, "photo"), (39434691, "encre"), (31641251, "photo"), (38674516, "photo")],
      moments=[("un bruit sourd et puissant retentit", "le choc : la lanterne s'éteint net ; la porte reste debout, sans lumière"),
               ("Il s’ensuit la chute de l’édifice",
                "la porte tombe dans la fente, sans un son ; la fente se referme sans trace, les couleurs reviennent"),
               ("Un désintérêt fulgurant renvoie à leurs activités les passants", "les passants reprennent leur course"),
               ("Unie à lui, Julie gardera en tête", "la lune de 5.9, dernière image du livre")],
      son="silence ; le choc, puis plus rien : le livre ne fait plus de son",
      reperages=[("S2", "Les passants filés, sur le même trottoir, en pose lente (un quart de seconde)")]),
    T("7.16", "La fantasy s'achève", (215, None), "La page", "livre", "fondu",
      "Le papier seul, l'encre des mots : plus d'image ni de bouton, un coin de page pour tourner.",
      moments=[("Ne sentez-vous pas toujours cette distance qui se crée en fermant votre porte",
                "la question reste seule, trois secondes, sans coin de page")],
      son="silence",
      note="Seul sur sa page, comme dans le livre imprimé (page 61). « Nouvelle lecture », à la page « Fin », "
           "répond à « Y aurait-il un successeur »."),
    T("8.1", "Poème de clôture", (216, None), "La page", "livre", "fondu",
      "Le papier ; les vers se déposent comme au poème d'ouverture ; au dernier, un fil d'encre naît au bas de la page "
      "blanche.",
      moments=[("Les sentiments noircissent", "le fil d'or du poème d'ouverture, devenu fil d'encre")],
      son="silence",
      note="Le blanc du livre imprimé entre le quatrième et le cinquième vers. Puis la page « Fin » : la planche "
           "des photographies de Karl, sans encre, et « Nouvelle lecture »."),
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
        for code, _ in t["reperages"]:
            assert code in SORTIES, f"{t['n']} : sortie « {code} » inconnue"
    for t in TABLEAUX:
        assert ambiance(t) in AMBIANCES, f"{t['n']} : ambiance « {ambiance(t)} » inconnue"
        for v in variantes(t):
            assert v in VARIANTES.get(ambiance(t), {}), f"{t['n']} : variante « {v} » inconnue pour {ambiance(t)}"
    # chaque tableau à faire appartient à un seul chantier de production
    prevus = [n for _, _, ns, _ in PRODUCTION for n in ns]
    assert len(prevus) == len(set(prevus)), "tableau prévu deux fois"
    for t in TABLEAUX:
        if t["n"] not in prevus:
            assert t["etat"] == "fait", f"{t['n']} n'est dans aucun chantier"
    # chaque geste est reconnu sous la mécanique de sa fiche (livre.py, synthèse 8.3)
    import livre  # noqa: E402  (ici seulement : livre.py n'a pas besoin du découpage)
    assert [t["n"] for t in TABLEAUX] == list(livre.SCENES), "livre.py et decoupage.py ne décrivent pas les mêmes tableaux"
    for t in TABLEAUX:
        fiche = livre.SCENES[t["n"]]["gestes"]
        assert len(fiche) == len(t["gestes"]), f"{t['n']} : {len(t['gestes'])} gestes au découpage, {len(fiche)} dans livre.py"
        for (_, geste, _), g in zip(t["gestes"], fiche):
            assert mecanique(geste) == g["meca"], \
                f"{t['n']} : « {geste} » reconnu comme {mecanique(geste)}, {g['meca']} dans livre.py"
    connues = {cle for cle, *_ in MECANIQUES}
    for n, s in livre.SCENES.items():
        for g in s["gestes"]:
            assert g["meca"] in connues, f"{n} : mécanique « {g['meca']} » absente du cahier des charges"
    # tout le texte, une seule fois, dans l'ordre
    tout = "".join(texte(i).replace("\n\n", "") for i in range(len(TABLEAUX)))
    livre_ = "".join(lignes[p].strip() for p in range(PREMIER, DERNIER + 1))
    assert re.sub(r"\s+", "", tout) == re.sub(r"\s+", "", livre_), "le découpage ne redonne pas le livre"


# ---------------------------------------------------------------- le document
def chapitre_de(t):
    return int(t["n"].split(".")[0])


def ordre(n):
    return [int(x) for x in n.split(".")]


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
    w("dédicace au poème de clôture, que chaque geste naît d'une phrase qui figure mot pour mot dans")
    w("son tableau, et qu'il est reconnu sous la mécanique de sa fiche (`outils/darshan/livre.py`).")
    w("")
    w("Les tableaux reprennent la pré-production : les traitements des sept chapitres et leur synthèse")
    w("([darshan-mise-en-scene/](darshan-mise-en-scene/)), qui fait foi. Plan d'ensemble et chantiers :")
    w("[plan-darshan.md](plan-darshan.md) ; interface (fiches d'objet, carnet, dialogues, téléphone de")
    w("Julie) : [plan-darshan-interface.md](plan-darshan-interface.md).")
    w("")
    w("## En bref")
    w("")
    photos_utilisees = sorted({p for t in TABLEAUX for p, _ in t["photos"]})
    reperages = [(t["n"], code, r) for t in TABLEAUX for code, r in t["reperages"]]
    gestes = sum(len(t["gestes"]) for t in TABLEAUX)
    w(f"- **{len(TABLEAUX)} tableaux**, {total} mots, de 40 à 160 mots chacun (moyenne "
      f"{round(total / len(TABLEAUX))}).")
    w(f"- **{gestes} gestes**, tous nés d'une phrase du livre ; chacun a son équivalent au toucher simple "
      "et au clavier.")
    w(f"- **{len(photos_utilisees)} photographies de Karl** mises en scène : telles quelles dans le monde "
      "de Julie, passées à l'encre dans celui de Darshan, ou comme modèles des dessins.")
    w(f"- **{len(reperages)} repérages** : les photos qui manquent encore, à prendre par Karl, "
      f"regroupées en {len({c for _, c, _ in reperages})} sorties (liste à la fin).")
    faits = [t["n"] for t in TABLEAUX if t["etat"].startswith("fait")]
    w(f"- Déjà jouables dans le prototype, au moins en partie : {', '.join(faits)}.")
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
    w("Le moteur les joue (`outils/darshan/src/js/transitions.js`) et elles se voient sur le banc d'essai,")
    w("`dist/web/transitions.html`, après fabrication ; les deux variantes des bandes (`bandes-photo`,")
    w("`bandes-julie`) restent à écrire, et le moteur les remplace pour l'instant par un fondu. Chaque")
    w("balayage a deux moitiés : couvrir la scène qui part, découvrir celle qui arrive. L'édition web joue")
    w("les deux ; dans l'EPUB, où chaque page est un document à part, la page joue la seconde à son")
    w("ouverture (attribut `data-entree`). Si le système demande moins de mouvement, tout devient fondu")
    w("court, et l'éclat d'un objet une image fixe qui reste le temps d'être lue.")
    w("")
    w("| Transition | Quand | Durée | Tableaux |")
    w("|---|---|---|---|")
    for cle, nom, quand, duree in TRANSITIONS:
        ou = [t["n"] for t in TABLEAUX if t["entree"] == cle]
        w(f"| **{nom}** (`{cle}`) | {quand} | {duree} | {len(ou)} |")
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
    w("Une par lieu, fabriquée en direct (Web Audio) par `outils/darshan/src/js/son.js` ; « fait » : l'ambiance")
    w("y est écrite. Une page peut demander une variante de son ambiance (entre parenthèses dans son champ")
    w("« Son ») ; les changements au milieu d'une page sont des effets (`ambiance`, dans `livre.py`).")
    w("")
    w("| Ambiance | Ce qu'on entend | Variantes | Tableaux | Moteur |")
    w("|---|---|---|---|---|")
    for cle, (desc, etat) in AMBIANCES.items():
        ou = [t["n"] for t in TABLEAUX if ambiance(t) == cle]
        vs = []
        for v, d in VARIANTES.get(cle, {}).items():
            pages = [t["n"] for t in TABLEAUX if ambiance(t) == cle and v in variantes(t)]
            vs.append(f"*{v}* : {d} ({', '.join(pages)})")
        w(f"| **{cle}** | {desc} | {' ; '.join(vs) or '—'} | {len(ou)} | {etat} |")
    w("")
    w("## Les mécaniques de geste")
    w("")
    w(f"Tous les gestes du livre se ramènent à {len(MECANIQUES)} mécaniques (le cahier des charges de la")
    w("synthèse, partie 3.1). « Écrite » : déjà dans le moteur (`outils/darshan/src/js/mecaniques.js`), le")
    w("plus souvent sans tous ses réglages ; une mécanique à écrire se joue pour l'instant comme un simple")
    w("toucher. Aucun glissement horizontal : dans Apple Books, il tourne la page. Les glissements vont vers")
    w("le haut ou le bas, ou restent dans une zone, et un toucher simple les remplace toujours.")
    w("")
    w("| Mécanique | Description | Gestes | Tableaux | Moteur |")
    w("|---|---|---|---|---|")
    for cle, desc, _, etat in MECANIQUES:
        ou = [t["n"] for t in TABLEAUX for g in t["gestes"] if mecanique(g[1]) == cle]
        uniques = sorted(set(ou), key=ordre)
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
            for code, r in t["reperages"]:
                w(f"- **Repérage** ({code}) : {r}")
            w("")
    w("## Production, chantier par chantier")
    w("")
    w("Les chantiers D3 à D7 de [plan-darshan.md](plan-darshan.md), une session chacun, dans l'ordre.")
    w("Avant eux, D1 (fondations) et D2 (direction artistique, dont le passage à l'encre des photos),")
    w("et les chantiers I1 et I2 de l'interface. Les nombres viennent du découpage ci-dessus ; les noms")
    w("entre parenthèses sont ceux des mécaniques et des effets de `livre.py`.")
    w("")
    deja = set()
    for code, nom, ns, effets in PRODUCTION:
        ts = [t for t in TABLEAUX if t["n"] in ns]
        idx = [i for i, t in enumerate(TABLEAUX) if t["n"] in ns]
        plans = [t for t in ts if t["entree"] != "—"]
        dessins = [t for t in plans if t["monde"] in ("Darshan", "légende")]
        photos = sorted({p for t in ts for p, u in t["photos"] if u == "photo"})
        encres = sorted({p for t in ts for p, u in t["photos"] if u == "encre"})
        meca = sorted({mecanique(g[1]) for t in ts for g in t["gestes"]})
        etats = {c: e for c, _, _, e in MECANIQUES}
        nouvelles = [m for m in meca if m not in deja and etats[m] != "écrite"]
        deja |= set(meca)
        sons = sorted({ambiance(t) for t in ts})
        rep = [r for t in ts for r in t["reperages"]]
        w(f"### {code}. {nom}")
        w("")
        w(f"- **Tableaux** : {len(ts)} ({ts[0]['n']} à {ts[-1]['n']}), {sum(mots(texte(i)) for i in idx)} mots, "
          f"{sum(len(t['gestes']) for t in ts)} gestes")
        w(f"- **Plans nouveaux** : {len(plans)}, dont {len(dessins)} décors dessinés (monde de Darshan)")
        w(f"- **Photos de Karl** : {len(photos)} telles quelles, {len(encres)} passées à l'encre ; "
          f"**repérages** : {len(rep)}")
        w(f"- **Mécaniques** : {', '.join(meca)}" + (f" ; à écrire : **{', '.join(nouvelles)}**" if nouvelles else ""))
        w(f"- **Ambiances sonores** : {', '.join(sons)}")
        w(f"- **À construire** : {' ; '.join(effets)}.")
        w("")
    w("## Repérages : les photos à prendre")
    w("")
    w("Karl les prend à sa manière, regroupés par sortie (détail et images d'attente : partie 9 de la")
    w("[synthèse](darshan-mise-en-scene/synthese.md)) : en hauteur, sans visage reconnaissable, ou avec")
    w("l'accord écrit du modèle, sans nom d'établissement lisible, le bas du cadre laissé libre pour le texte.")
    w("")
    for code, titre in SORTIES.items():
        de_la_sortie = [(n, r) for n, c, r in reperages if c == code]
        if not de_la_sortie:
            continue
        w(f"### {code}. {titre}")
        w("")
        for n, r in de_la_sortie:
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
