"""Fabrique Darshan jouable : tout le livre, en édition web et en EPUB 3 à pages fixes.

Usage : python3 outils/darshan/build.py [--strict]
Python seul, sans module à installer. Sorties dans outils/darshan/dist/ :
web/index.html (le livre), web/transitions.html (banc d'essai des transitions) et
darshan-jouable.epub. --strict (tâche GitHub) : un décor manquant est une erreur.

Le livre réunit cinq sources, sans rien recopier à la main :
- le texte, lu dans l'EPUB publié (texte.py), découpé en 85 tableaux (decoupage.py) ;
- les réglages de production de chaque tableau : décor, gestes, effets, qui parle (livre.py) ;
- les objets et les phrases du livre qui parlent d'eux (objets.ini) ;
- les phrases du livre qui remplissent les fiches des portes du carnet (portes.ini) ;
- les textes d'interface, seuls textes qui ne sont pas de Karl (interface.ini).

Chaque tableau devient une page : son texte est découpé en « temps » (une ou deux phrases,
que le lecteur révèle l'une après l'autre), un geste attend avant la phrase qui le raconte,
un effet se joue avec la phrase qui le fait naître. Le programme vérifie que les temps
recollés redonnent le livre au caractère près, que chaque phrase citée par une fiche d'objet
ou de porte est dans le livre, que chaque geste a sa consigne, et que chaque mécanique, chaque
effet et chaque texte d'interface appelés existent.

L'état des pages. Apple Books isole chaque page : tout ce qui dure d'une page à l'autre est
calculé ici, page après page (appliquer, puis etats), et écrit sur la section de la page, tel
qu'il est quand elle s'ouvre (synthèse de la pré-production, partie 3.3) :
- data-sac, data-sac-julie : les objets de Darshan, ceux de Julie ;
- data-portes : les portes du carnet ; la classe « sans-magie » : après le désenchantement (7.14) ;
- data-pere : l'étoile à part du père, « vue » (depuis 3.11), « allumee » (7.12), « eteinte »
  (après 7.14) ; absent avant 3.11 ;
- data-barre : « darshan », ou « julie » dans les pages où Julie dit « je » (de 4.1, après ses
  bandes, à 5.1) : les boutons de Darshan y sont absents ;
- data-voile="oui" : la barre voilée des temps forts (2.3 et 2.4, 3.10 et 3.11, 7.10 à 7.14) ;
  absent sinon ;
- data-regard="oui" : « Regarder à travers » est offert (les lunettes, et non la clé ni les
  binocles, dans le sac de Darshan, de 3.4 à 7.8) ; absent sinon ; ce qu'il montre dans la page
  est dans ses réglages (clé « regard » du JSON) ;
- data-compte : la valeur du compte à rebours affichée en haut de la page, de la page qui la
  change jusqu'à la fin de son chapitre (celle de 2.9 ne dure que sa page) ; absent sinon ;
- data-boussole : « nord », « perdue » ou « eteinte » (depuis 5.3) ; absent avant ;
- data-repliques : « or », puis « clair » après la virgule de 7.14 : la couleur des répliques de
  Darshan, dont les paragraphes portent la classe « de-darshan » (livre.REPLIQUES ; « pensee-darshan » : une
  pensée de Darshan sans tiret, classes « de-darshan » et « voix », 2.7).
Sur chaque plan du décor : data-genre (photo, encre, dessin ou uni), que les effets lisent pour ne
toucher que les photos (le froid, le gel, l'effacement : genre_du_decor).
Et, du découpage et de livre.py : data-son (l'ambiance de la page) et data-son-variantes (ses
variantes, séparées par des espaces : « soir », « vaste »…), data-entree (la transition
d'entrée, et d'où elle part ; « plan » pour le même plan, « — » au découpage) et
data-entree-<réglage> (ses réglages : 1.9, couleur ; 5.1, palette et grain).
Les images nommées par les réglages (reflets, clichés, calques…) sont copiées avec les décors,
et DARSHAN.images donne le fichier de chaque décor employé (chemin depuis img/). Sans script, une
page montre son premier plan (classe « vu »), ou les plans marqués « sans-script » (PLANS_SANS_SCRIPT).
"""
import configparser
import html
import json
import pathlib
import re
import shutil
import sys
import unicodedata
import uuid
import zipfile
from datetime import datetime, timezone

ICI = pathlib.Path(__file__).resolve().parent
SRC = ICI / "src"
DIST = ICI / "dist"
sys.path.insert(0, str(ICI))
import decoupage  # noqa: E402
import livre  # noqa: E402
import texte as livre_texte  # noqa: E402
from texte import lignes, position  # noqa: E402

STRICT = "--strict" in sys.argv
AVERTISSEMENTS = []


def avertir(message):
    if STRICT:
        raise SystemExit("erreur : " + message)
    AVERTISSEMENTS.append(message)


def ascii_(s):
    """« bibliothèque » → « bibliotheque » (noms internes du moteur)."""
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


# ---------------------------------------------------------------- textes d'interface et objets
def lire_ini(nom):
    c = configparser.ConfigParser(interpolation=None, comment_prefixes=("#",), inline_comment_prefixes=None)
    c.optionxform = str        # garder les clés telles quelles
    with open(ICI / nom, encoding="utf-8") as f:
        c.read_file(f)
    return c


INTERFACE = lire_ini("interface.ini")
UI = dict(INTERFACE["interface"])
CONSIGNES = dict(INTERFACE["consignes"])
ACTIONS = dict(INTERFACE["actions"])
LIBELLES_PORTES = dict(INTERFACE["portes"])
NOMS_LIEUX = dict(INTERFACE["lieux"])


def normal(s):
    """Pour chercher une phrase : espaces insécables et apostrophes ramenées à une forme."""
    return s.replace(" ", " ").replace(" ", " ").replace("'", "’")


def chercher(phrase, debut=livre_texte.PREMIER, fin=livre_texte.DERNIER):
    """(paragraphe, début, fin) de la seule occurrence de `phrase` dans le livre."""
    p = normal(phrase.strip())
    trouves = [(n, normal(lignes[n]).find(p)) for n in range(debut, fin + 1) if p in normal(lignes[n])]
    if len(trouves) != 1:
        raise SystemExit(f"« {phrase} » : {len(trouves)} occurrences dans le livre au lieu d'une")
    n, k = trouves[0]
    return n, k, k + len(p)


def chapitre_de(numero):
    """Titre du chapitre qui contient le paragraphe (tel qu'il est dans le livre)."""
    if numero < 17:
        return decoupage.CHAPITRES[0][0]
    if numero >= 216:
        return decoupage.CHAPITRES[8][0]
    return lignes[max(n for n in livre_texte.CHAPITRES if n <= numero)]


def lire_objets():
    c = lire_ini("objets.ini")
    objets = {}
    for id_ in c.sections():
        o = c[id_]
        cites = []
        for ligne in o["phrases"].splitlines():
            if not ligne.strip():
                continue
            n, a, b = chercher(ligne)
            cites.append({"texte": lignes[n][a:b], "chapitre": chapitre_de(n), "lu": position(n, b)})
        fiche = {"nom": o["nom"].strip(), "porteur": o["porteur"].strip(), "citations": cites}
        assert fiche["porteur"] in ("darshan", "julie"), id_
        if o.get("metamorphose"):
            n, a, b = chercher(o["metamorphose"])
            fiche["metamorphose"] = {"texte": lignes[n][a:b], "lu": position(n, b)}
        objets[id_] = fiche
    return objets


OBJETS = lire_objets()
# Les lunettes changent d'allure (binocles) sans cesser d'être les lunettes : un effet qui
# parle des lunettes trouve aussi les binocles.
FAMILLES = {"lunettes": ["lunettes", "binocles"]}


def lire_portes():
    """Les fiches des portes du carnet (portes.ini) : les phrases du livre, chacune avec, s'il y a
    lieu, la position de sa clé d'entrée (la phrase entre crochets qui la fait entrer dans la fiche)."""
    c = lire_ini("portes.ini")
    fiches = {}
    for id_ in c.sections():
        assert id_ in livre.PORTES, f"portes.ini : porte « {id_} » inconnue du carnet (livre.PORTES)"
        cites = []
        for ligne in c[id_]["phrases"].splitlines():
            if not ligne.strip():
                continue
            m = re.fullmatch(r"\s*(.+?)\s*\[(.+)\]\s*", ligne)
            phrase, cle = (m.group(1), m.group(2)) if m else (ligne, None)
            n, a, b = chercher(phrase)
            cite = {"texte": lignes[n][a:b], "chapitre": chapitre_de(n), "lu": position(n, b)}
            if cle:
                nc, ac, bc = chercher(cle)
                cite["cle"] = position(nc, bc)
            cites.append(cite)
        fiches[id_] = cites
    return fiches


PORTES_FICHES = lire_portes()


# ---------------------------------------------------------------- découper le texte en temps
# fin de phrase : ponctuation forte (et guillemet fermant) suivie d'une majuscule, d'un tiret ou
# d'un guillemet ouvrant ; ou fin d'une citation dans une liste de citations (« … », « … »)
FIN_DE_PHRASE = re.compile(r'[.!?…]+[\u00a0 ]*[»”"]?(?=\s+[«“"—A-ZÀ-ÖØ-ÞŒ])|[»”],(?=\s+«)')
SPECIAUX_ENTIERS = ("seuil", "poeme", "toit", "tuiles", "pigeonnier")   # scènes du prototype : un paragraphe, un temps
MOTS_MAX, MOTS_MIN = 40, 8


def debuts_de_phrase(p, a, b):
    """Débuts des phrases du paragraphe p entre a et b (a compris)."""
    s = lignes[p]
    debuts = [a]
    for m in FIN_DE_PHRASE.finditer(s, a, b):
        k = m.end()
        while k < b and s[k].isspace():
            k += 1
        if a < k < b:
            debuts.append(k)
    return sorted(set(debuts))


def phrase_qui_contient(p, k):
    """(début, fin) de la phrase du paragraphe p qui contient le caractère k."""
    d = debuts_de_phrase(p, 0, len(lignes[p])) + [len(lignes[p])]
    for x, y in zip(d, d[1:]):
        if x <= k < y:
            return x, y
    return d[-2], d[-1]


def mots(s):
    return len(s.split())


def temps_du_segment(p, a, b, forcees, manuelles, special):
    """Coupe le morceau [a, b) du paragraphe p en temps : [(début, fin)]."""
    s = lignes[p]
    if manuelles is not None:
        coupes = [a]
        for d in manuelles:
            k = s.find(d, a)
            assert a < k < b, (p, d)
            coupes.append(k)
        coupes.append(b)
        return list(zip(coupes, coupes[1:]))
    if special:
        return [(a, b)]
    phrases = debuts_de_phrase(p, a, b) + [b]
    morceaux, debut = [], a
    for x, y in zip(phrases, phrases[1:]):
        if x == debut:
            continue
        courant = mots(s[debut:x])
        if x in forcees or (courant >= MOTS_MIN and courant + mots(s[x:y]) > MOTS_MAX):
            morceaux.append((debut, x))
            debut = x
    morceaux.append((debut, b))
    return morceaux


# ---------------------------------------------------------------- les tableaux
TABLEAUX = decoupage.TABLEAUX
assert [t["n"] for t in TABLEAUX] == list(livre.SCENES), "livre.py et decoupage.py ne décrivent pas les mêmes tableaux"
DEBUT_CHAPITRE = {c: next(t["n"] for t in TABLEAUX if int(t["n"].split(".")[0]) == c) for c in range(0, 9)}
# D'où part ou s'ouvre un balayage d'entrée (x y en unités de scène), quand ce n'est pas le centre :
# en 3.4, l'iris s'ouvre sur les lunettes (synthèse 12, étape 4 ; 3.10 entre en même plan).
POINTS_D_ENTREE = {"1.3": "600 1000", "3.4": "600 700", "3.12": "600 900"}


def ordre_tableau(n):
    """« 1.10 » après « 1.9 » : pour trier les numéros de tableau."""
    return tuple(int(x) for x in n.split("."))


def plage_du_tableau(i):
    a = decoupage.position(TABLEAUX[i])
    b = decoupage.position(TABLEAUX[i + 1]) if i + 1 < len(TABLEAUX) else (livre_texte.DERNIER + 1, 0)
    segments = []
    for p in range(a[0], b[0] + 1):
        if p > livre_texte.DERNIER:
            continue
        debut = a[1] if p == a[0] else 0
        fin = b[1] if p == b[0] else len(lignes[p])
        if fin > debut:
            segments.append((p, debut, fin))
    return segments


def ancrer(phrase, segments):
    """(paragraphe, caractère) d'une phrase citée par un geste ou un moment, dans le tableau."""
    p_ = normal(phrase)
    for p, a, b in segments:
        k = normal(lignes[p]).find(p_, a)
        if k >= 0 and k < b:
            return p, k
    raise SystemExit(f"« {phrase} » n'est pas dans le tableau")


def construire(i):
    """Tout ce qu'il faut pour écrire la page du tableau i."""
    t, s = TABLEAUX[i], livre.SCENES[TABLEAUX[i]["n"]]
    n = t["n"]
    segments = plage_du_tableau(i)
    # les ancres : où tombent les gestes, les moments et les effets rattachés à une phrase
    gestes = []
    for k, ((phrase, _, _), g) in enumerate(zip(t["gestes"], s["gestes"]), start=1):
        cle = f"{n}.{k}"
        if cle not in CONSIGNES:
            raise SystemExit(f"interface.ini : pas de consigne pour le geste {cle}")
        g = dict(g)
        g.pop("consigne", None)
        g["consigne"] = CONSIGNES[cle]
        if cle in ACTIONS:
            g["action"] = ACTIONS[cle]
        g["cle"] = cle
        gestes.append((ancrer(phrase, segments), g))
    assert len(t["gestes"]) == len(s["gestes"]), f"{n} : {len(t['gestes'])} gestes au découpage, {len(s['gestes'])} dans livre.py"
    assert len(t["moments"]) == len(s["moments"]) or not s["moments"], f"{n} : moments"
    effets = []
    for (phrase, _), e in zip(t["moments"], s["moments"]):
        if e:
            effets.append((ancrer(phrase, segments), e if isinstance(e, list) else [e]))
    for phrase, e in s["extra"].items():
        effets.append((ancrer(phrase, segments), e if isinstance(e, list) else [e]))
    # coupes forcées : chaque phrase ancrée commence un temps ; après un geste « apres », la
    # phrase suivante aussi
    forcees = {}
    for (p, k), g in gestes:
        x, y = phrase_qui_contient(p, k)
        forcees.setdefault(p, set()).add(x)
        if g.get("apres"):
            forcees[p].add(y)
    for (p, k), _ in effets:
        forcees.setdefault(p, set()).add(phrase_qui_contient(p, k)[0])
    # les temps, et les titres de chapitre
    blocs = []                # (paragraphe, [(début, fin)], titre ?)
    for p, a, b in segments:
        if livre_texte.styles[p] == "Chapitres":
            blocs.append((p, [(a, b)], True))
            continue
        manuelles = s["coupes"].get(p)
        if manuelles is not None:
            manuelles = [d for d in manuelles if a < lignes[p].find(d, a) < b]
        entier = s["special"] in SPECIAUX_ENTIERS
        blocs.append((p, temps_du_segment(p, a, b, forcees.get(p, set()), manuelles, entier), False))
    temps = [(p, a, b) for p, morceaux, titre in blocs if not titre for a, b in morceaux]

    def indice(p, k):
        for j, (q, a, b) in enumerate(temps):
            if q == p and a <= k < b:
                return j
        raise SystemExit(f"{n} : ancre hors des temps ({p}, {k})")
    portes = {}
    for (p, k), g in gestes:
        j = indice(p, k) + (1 if g.get("apres") else 0)
        g["avant"] = j
        portes.setdefault(j, []).append(g)
    par_temps = {}
    for (p, k), liste in effets:
        par_temps.setdefault(indice(p, k), []).extend(liste)
    return dict(t=t, s=s, blocs=blocs, temps=temps, gestes=[g for _, g in gestes], portes=portes, effets=par_temps)


# ---------------------------------------------------------------- l'état des personnages, page après page
def trouver(sac, id_):
    for x in FAMILLES.get(id_, [id_]):
        if x in sac:
            return x
    return None


def appliquer(etat, e):
    """Ce qu'un effet change aux sacs, aux portes, à la magie et aux autres états des pages
    (synthèse, partie 3.3) : le moteur fait de même en direct, les deux doivent rester d'accord."""
    nom = e["nom"]
    sacs = etat["sacs"]
    # les états nouveaux de la pré-production
    if nom == "porte" and e.get("id") == "pere" and e.get("anneau"):
        etat["pere"] = "vue"                            # 3.11 : l'étoile à part, un anneau
    elif nom == "carnet" and e.get("id") == "pere" and e.get("allumer"):
        etat["pere"] = "allumee"                        # 7.12 : l'anneau allume son point
    elif nom == "interface":
        if e.get("sans") == "darshan":
            etat["barre"] = "julie"                     # 4.1 : les pages où Julie dit « je »
        elif e.get("avec") == "darshan":
            etat["barre"] = "darshan"                   # 5.2 : les boutons de Darshan reviennent
        if e.get("voile"):
            etat["voile"] = True                        # 2.3, 3.10, 7.10
    elif nom == "net":
        etat["voile"] = False                           # 2.4, 3.12 (et chaque retour au net)
    elif nom == "regard":
        etat["regard"] = True                           # 3.4 : le regard naît
    elif nom == "compte":
        etat["compte"] = e.get("valeur") or None        # « » : le compte ne laisse rien
    elif nom == "boussole" and e.get("etat") in ("nord", "perdue", "eteinte"):
        etat["boussole"] = e["etat"]                    # nord (5.3, 7.10), perdue (6.15)
    elif nom == "desenchantement":
        etat["pere"] = "eteinte" if etat["pere"] else None
        etat["boussole"] = "eteinte" if etat["boussole"] else None
        etat["voile"] = False
        etat["repliques"] = "clair"
    if nom == "objet+":
        sac = sacs[e.get("sac") or OBJETS[e["id"]]["porteur"]]
        if e["id"] not in sac:
            sac.append(e["id"])
    elif nom == "objet-":
        for sac in sacs.values():
            x = trouver(sac, e["id"])
            if x:
                sac.remove(x)
    elif nom in ("remplacer", "eclat-court"):
        sac = sacs[e.get("sac", "darshan")]
        x = trouver(sac, e["de"])
        if x:
            sac[sac.index(x)] = e["vers"]
        elif e["vers"] not in sac:
            sac.append(e["vers"])
    elif nom == "transfert":
        x = trouver(sacs[e["de"]], e["id"])
        if x:
            sacs[e["de"]].remove(x)
        if e["id"] not in sacs[e["vers"]]:
            sacs[e["vers"]].append(e["id"])
    elif nom == "porte":
        if e["id"] not in etat["portes"]:
            etat["portes"].append(e["id"])
    elif nom == "desenchantement":
        for x in ("cle", "lunettes", "binocles"):
            if x in sacs["darshan"]:
                sacs["darshan"].remove(x)
        etat["magie"] = False


# Le compte à rebours reste affiché de la page qui le change jusqu'à la fin de son chapitre, sauf
# celui de 2.9, « dimanche prochain », une autre date, qui ne dure que sa page (synthèse 2.2, ligne 9).
COMPTE_D_UNE_PAGE = {"2.9"}


def etats(pages):
    """Pour chaque page : les sacs, les portes, la magie et les autres états au moment où elle
    s'ouvre (voir l'en-tête)."""
    etat = {"sacs": {"darshan": [], "julie": []}, "portes": [], "magie": True,
            "pere": None, "barre": "darshan", "voile": False, "regard": False, "compte": None,
            "boussole": None, "repliques": "or"}
    for pg in pages:
        if pg["t"]["n"] in DEBUT_CHAPITRE.values():
            etat["compte"] = None
        pg["etat"] = json.loads(json.dumps(etat))
        # le regard est offert quand les lunettes (ni la clé ni les binocles) sont dans le sac de Darshan
        pg["etat"]["regard"] = etat["regard"] and etat["magie"] and "lunettes" in etat["sacs"]["darshan"]
        s = pg["s"]
        for e in s["debut"]:
            appliquer(etat, e)
        for j in range(len(pg["temps"]) + 1):
            for g in pg["portes"].get(j, []):
                for e in g.get("effets", []):
                    appliquer(etat, e)
                if g["meca"] == "etals":           # chaque étal touché donne son objet
                    for id_ in g["objets"]:
                        appliquer(etat, {"nom": "objet+", "id": id_})
            for e in pg["effets"].get(j, []):
                appliquer(etat, e)
        for e in s["bilan"]:
            appliquer(etat, e)
        if pg["t"]["n"] in COMPTE_D_UNE_PAGE:
            etat["compte"] = None
        tous = s["debut"] + s["bilan"] + [x for l in pg["effets"].values() for x in l] + \
            [x for g in pg["gestes"] for x in g.get("effets", [])]
        for e in tous:
            verifier_references(pg["t"]["n"], e)


def verifier_references(n, e):
    """Chaque effet nomme un objet d'objets.ini, une porte du carnet ou un sac qui existent."""
    objets = set(OBJETS) | set(FAMILLES)
    nom = e["nom"]
    if nom in ("objet+", "objet-", "transfert"):
        assert e["id"] in objets, f"{n} : objet « {e['id']} » absent d'objets.ini"
    if nom in ("remplacer", "eclat-court"):
        assert e["de"] in objets and e["vers"] in objets, f"{n} : objets de « {nom} »"
    if nom in ("eclat", "eclat-brise", "fiche") and "objet" in e:
        assert e["objet"] in objets, f"{n} : objet « {e['objet']} » absent d'objets.ini"
    if nom == "porte":
        assert e["id"] in livre.PORTES, f"{n} : porte « {e['id']} » inconnue"
    if nom == "ambiance":
        connues = {ascii_(a) for a in decoupage.AMBIANCES}
        for a in [e["id"]] if "id" in e else list(e.get("partage", {}).values()):
            assert a in connues, f"{n} : ambiance « {a} » inconnue (decoupage.AMBIANCES)"
    if nom == "desenchantement":
        for cle in e.get("annonce", []):
            assert cle in UI, f"{n} : texte d'interface « {cle} » absent d'interface.ini"
    for cle in ("sac", "de", "vers"):
        if nom == "transfert" or cle == "sac":
            if cle in e:
                assert e[cle] in ("darshan", "julie"), f"{n} : sac « {e[cle]} »"


# ---------------------------------------------------------------- balisage
def e_(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


LANGUES = {"mudrā": "sa", "Dhyana mudrā": "sa", "Angelo mio": "it"}


def classes_du_paragraphe(p, a):
    c = []
    if p in livre_texte.ITALIQUES_PARAGRAPHES:
        c.append("voix")
    if livre_texte.est_vers(p):
        c.append("vers")
    if 8 <= p <= 10:
        c.append("dedicace")
    if 189 <= p <= 193:
        c.append("lettre-ligne")
    if p in (74, 75):
        c.append("sanskrit")
    if lignes[p].startswith("—"):
        c.append("replique")
    if livre.REPLIQUES.get(p) in ("darshan", "pensee-darshan"):
        c.append("de-darshan")          # en or tant que data-repliques="or" (synthèse 2.2, ligne 42)
    if livre.REPLIQUES.get(p) == "pensee-darshan" and "voix" not in c:
        c.append("voix")                # une pensée de Darshan, en italique comme ses voix intérieures (2.7)
    if a > 0:
        c.append("suite-para")
    return c


def span_temps(p, a, b):
    """Un temps : son texte, avec les mots en italique du livre imprimé."""
    s = lignes[p]
    morceaux, k = [], a
    for x, y in livre_texte.italiques(p):
        if p in livre_texte.ITALIQUES_PARAGRAPHES or y <= a or x >= b:
            continue
        x, y = max(x, a), min(y, b)
        morceaux.append(e_(s[k:x]))
        lang = LANGUES.get(s[x:y])
        morceaux.append(f'<i lang="{lang}" xml:lang="{lang}">{e_(s[x:y])}</i>' if lang else f"<i>{e_(s[x:y])}</i>")
        k = y
    morceaux.append(e_(s[k:b]))
    return f'<span class="temps" data-lu="{position(p, b)}">{"".join(morceaux)}</span>'


# La place et le ton du panneau de texte (livre.S, réglage texte ; arbitrage 4 : il suit l'image) :
# « ciel » : le texte à même le ciel, sans bandeau, en or (3.1, 3.4) ; « papier » : le panneau crème de
# la fin (7.15).
CLASSES_TEXTE = {"bas": "", "haut": "en-haut", "bas clair": "clair", "haut clair": "en-haut clair",
                 "bas ciel": "ciel", "haut papier": "en-haut papier", "nu": "nu", "lettre": "lettre",
                 "poeme": "poeme", "nu poeme": "nu poeme"}


def balisage_texte(pg, classe_sup="", apres=""):
    s = pg["s"]
    classe = " ".join(x for x in ("texte", CLASSES_TEXTE[s["texte"]], classe_sup) if x)
    corps = []
    for p, morceaux, titre in pg["blocs"]:
        if titre:
            corps.append(f'<h1 class="chapitre">{e_(lignes[p])}</h1>')
            continue
        c = classes_du_paragraphe(p, morceaux[0][0])
        cl = f' class="{" ".join(c)}"' if c else ""
        corps.append(f"<p{cl}>{''.join(span_temps(p, a, b) for a, b in morceaux)}</p>")
    return f'<div class="{classe}">{"".join(corps)}{apres}</div>'


def balisage_generique():
    """Le générique de la page « Fin » (8.1), écrit en clair après le poème : lisible sans script ; en jeu, la scène
    « cloture » montre le sien (finDuLivre, scenes.js) et la feuille de style cache celui-ci."""
    return ('<div class="generique-clair">'
            f'<p class="fin-titre">{e_(UI["fin"])}</p>'
            f'<p class="fin-generique">{e_(UI["generique_auteur"])}</p>'
            f'<p class="fin-couverture">{e_(UI["generique_couverture"])}</p></div>')


def src_image(nom, img):
    return f"{img}decors/{nom}.webp"


def fichier_existe(f):
    """Un fichier du prototype (src/img/) est-il déjà là ? Sinon, le signaler (decors.py le fabrique)."""
    if (SRC / "img" / f).exists():
        return True
    avertir(f"image « {f} » pas encore fabriquée (src/img/{f})")
    return False


def decor_existe(nom):
    d = livre.DECORS[nom]
    if d["type"] == "uni":
        return True
    if d["type"] == "prototype":
        return (SRC / "img" / d["fichiers"][0]).exists()
    return (SRC / "img" / "decors" / f"{nom}.webp").exists()


# Sans script, chaque page montre une seule image (synthèse, partie 3, « Pour tous les effets ») : la
# première, qui porte la classe « vu » ; mais la dernière du tableau en 7.3, 7.11 et 7.15, et la rue avec
# la porte en 7.12 à 7.14 : ces plans portent en plus la classe « sans-script ».
PLANS_SANS_SCRIPT = {"7.3": [-1], "7.11": [-1], "7.15": [-1], "7.12": [0, 1], "7.13": [0, 1], "7.14": [0, 1]}


# Le genre de chaque plan, écrit dans data-genre pour que les effets sachent ce qu'ils peuvent toucher
# (synthèse, partie 3.2 : le froid, le gel et l'effacement ne touchent que les photos) :
# « photo » (une photo de Karl telle quelle), « encre » (une photo passée à l'encre et à l'aquarelle),
# « dessin » (un dessin du programme) et « uni » (un aplat). Les fichiers du prototype sont le ciel de
# Karl (une photo, sous la ville dessinée) et la porte du pigeonnier (un dessin).
PROTOTYPES_DESSINES = {"porte-pigeonnier"}


def genre_du_decor(nom):
    d = livre.DECORS[nom]
    if d["type"] == "prototype":
        return "dessin" if nom in PROTOTYPES_DESSINES else "photo"
    return d["type"]


def balisage_decor(pg, img, web):
    s, n = pg["s"], pg["t"]["n"]
    noms = s["decor"]
    sans_script = {k % len(noms) for k in PLANS_SANS_SCRIPT.get(n, [])}
    premier = livre.DECORS[noms[0]]
    if premier["type"] == "prototype":
        f = premier["fichiers"]
        if noms[0] in ("toits", "voute"):
            # un ciel qui tourne, et devant lui un calque fixe (la ville ; les arbres du poème, 0.2)
            devant = f'<img src="{img}{f[1]}" alt=""/>' if fichier_existe(f[1]) else ""
            return (f'<div class="decor" data-genre="{genre_du_decor(noms[0])}" aria-hidden="true"><div class="ciel-tournant calque-anime"><img src="{img}{f[0]}" alt=""/></div>'
                    f'{devant}</div>')
        if noms[0] == "tuiles":
            return (f'<div class="decor" data-genre="{genre_du_decor(noms[0])}" aria-hidden="true"><div class="monde calque-anime">'
                    f'<img src="{img}{f[0]}" alt=""/><img src="{img}{f[1]}" alt=""/></div></div>')
        if noms[0] == "porte-pigeonnier":
            return f'<div class="decor calque-anime" data-genre="{genre_du_decor(noms[0])}" aria-hidden="true"><img src="{img}{f[0]}" alt=""/></div>'
        return f'<div class="decor" data-genre="{genre_du_decor(noms[0])}" aria-hidden="true"><img src="{img}{f[0]}" alt=""/></div>'
    plans = []
    for k, nom in enumerate(noms):
        d = livre.DECORS[nom]
        classe = ("plan vu" if k == 0 else "plan") + (" sans-script" if k in sans_script else "")
        genre = genre_du_decor(nom)
        if d["type"] == "uni":
            plans.append(f'<div class="{classe} uni" data-plan="{k}" data-genre="{genre}" style="background:{d["couleur"]}"></div>')
            continue
        if d["type"] == "prototype":          # un fichier du prototype en plan (6.11 : le ciel de l'appel)
            plans.append(f'<img class="{classe}" data-plan="{k}" data-genre="{genre}" src="{img}{d["fichiers"][0]}" alt=""/>')
            continue
        if not decor_existe(nom):
            avertir(f"{n} : décor « {nom} » pas encore fabriqué (python3 outils/darshan/decors.py {nom})")
            plans.append(f'<div class="{classe} uni manquant" data-plan="{k}" data-genre="{genre}" style="background:#223"></div>')
            continue
        charge = ' loading="lazy" decoding="async"' if web and (k > 0 or pg["rang"] > 1) else ""
        plans.append(f'<img class="{classe}" data-plan="{k}" data-genre="{genre}" src="{src_image(nom, img)}" alt=""{charge}/>')
    monde = "julie" if livre.DECORS[noms[0]]["type"] == "photo" else "darshan"
    return f'<div class="decor decor-{monde}" aria-hidden="true">{"".join(plans)}</div>'


TITRE_DE_PAGE = {"0.1": "Darshan"}


def config_json(pg):
    """Les réglages que le moteur lit dans la page : gestes, effets, fin."""
    s = pg["s"]
    cfg = {
        "n": pg["t"]["n"],
        "gestes": pg["gestes"],
        "portes": {str(j): [g["cle"] for g in liste] for j, liste in pg["portes"].items()},
        "effets": {str(j): l for j, l in pg["effets"].items()},
        "debut": s["debut"],
        "bilan": s["bilan"],
        "decors": s["decor"],
    }
    if s["regard"]:
        cfg["regard"] = s["regard"]          # ce que montre « Regarder à travers » (synthèse 3.3)
    return json_sur(cfg)


def json_sur(v):
    brut = json.dumps(v, ensure_ascii=False, separators=(",", ":"))
    # sûr en HTML comme en XHTML
    return brut.replace("&", "\\u0026").replace("<", "\\u003c").replace(">", "\\u003e")


def balisage_seuil(pg, img):
    """La page de titre : le titre, la dédicace, et la porte « Ouvrir »."""
    return f'''
<div class="titre-livre">
  <p class="auteur">{e_(UI["auteur"])}</p>
  <h1 class="titre">Darshan</h1>
  <p class="devanagari" lang="hi" xml:lang="hi">दर्शन</p>
  <p class="genre">{e_(UI["genre"])}</p>
  <p class="edition">{e_(UI["edition"])}</p>
  {balisage_texte(pg, "dedicace")}
  <p class="ui boutons-seuil"><button type="button" class="bouton-porte">{e_(UI["ouvrir"])}</button> <button type="button" class="bouton-reprendre" hidden="hidden">{e_(UI["reprendre"])}</button></p>
</div>'''


def section(pg, img, web):
    t, s = pg["t"], pg["s"]
    n = t["n"]
    etat = pg["etat"]
    attrs = {
        "class": "scene" + (" monde-julie" if t["monde"] == "Julie" else "") + (" sans-magie" if not etat["magie"] else ""),
        "id": "s-" + n.replace(".", "-"),
        "data-scene": n,
        "data-special": s["special"] or "",
        "data-son": ascii_(decoupage.ambiance(t)),
        "data-son-variantes": " ".join(ascii_(v) for v in decoupage.variantes(t)),
        "data-monde": ascii_(t["monde"]).lower().replace(" ", "-"),
        "data-lu0": str(position(pg["temps"][0][0], pg["temps"][0][1]) if pg["temps"] else 0),
        "data-sac": " ".join(etat["sacs"]["darshan"]),
        "data-sac-julie": " ".join(etat["sacs"]["julie"]),
        "data-portes": " ".join(etat["portes"]),
        # les états de la pré-production (synthèse 3.3 ; voir l'en-tête) : absents quand ils n'ont pas de valeur
        "data-pere": etat["pere"] or "",
        "data-barre": etat["barre"],
        "data-voile": "oui" if etat["voile"] else "",
        "data-regard": "oui" if etat["regard"] else "",
        "data-compte": etat["compte"] or "",
        "data-boussole": etat["boussole"] or "",
        "data-repliques": etat["repliques"],
        "aria-label": TITRE_DE_PAGE.get(n, t["titre"]),
    }
    if t["entree"] != "—":
        attrs["data-entree"] = (t["entree"] + " " + POINTS_D_ENTREE.get(n, "")).strip()
        for cle, valeur in s["entree"].items():      # les réglages de la transition (1.9 : couleur ; 5.1 : palette, grain)
            attrs[f"data-entree-{cle}"] = str(valeur)
    elif n != "0.1":
        # « — » : le même plan (3.10, 3.11, 6.2…) ; sur le web, rien ne couvre la page (transitions.js, plan)
        attrs["data-entree"] = "plan"
    if not web:
        attrs["epub:type"] = "titlepage" if n == "0.1" else "bodymatter chapter" if n in DEBUT_CHAPITRE.values() else "bodymatter"
    a = " ".join(f'{k}="{attr(v)}"' for k, v in attrs.items() if v != "" or k in ("data-sac", "data-portes"))
    if s["special"] == "seuil":
        corps = balisage_decor(pg, img, web) + balisage_seuil(pg, img)
    else:
        corps = balisage_decor(pg, img, web) + balisage_texte(pg, apres=balisage_generique() if s["special"] == "cloture" else "")
    return f'<section {a}>{corps}<script type="application/json" class="config">{config_json(pg)}</script></section>'


# ---------------------------------------------------------------- les données communes
def carte_du_ciel():
    """Lieux (longitude, latitude) et portes (départ, arrivée) du carnet ; chaque porte a sa fiche :
    ses phrases du livre (portes.ini), au format des objets ({texte, chapitre, lu}, plus « cle » : la
    fin de la phrase qui la fait entrer dans la fiche) ; la porte du père, sans dessin de clé, « pere »."""
    portes = {}
    for k, v in livre.PORTES.items():
        porte = {"de": v[0], "vers": v[1], "libelle": LIBELLES_PORTES[k], "citations": PORTES_FICHES.get(k, [])}
        if k == "pere":
            porte["pere"] = True
        portes[k] = porte
    return {
        "lieux": {k: {"nom": NOMS_LIEUX[k], "lon": v[0], "lat": v[1]} for k, v in livre.LIEUX.items()},
        "portes": portes,
    }


def svgs_des_decors():
    """Les dessins SVG que decors.py range avec les décors et que le moteur trace trait par trait (l'esquisse de
    2.10) : leur texte même, pour que la page n'ait pas à les lire par le réseau (une liseuse, ou file://, peut refuser)."""
    dossier = SRC / "img" / "decors"
    return {f.stem: f.read_text(encoding="utf-8") for f in sorted(dossier.glob("*.svg"))} if dossier.exists() else {}


def donnees_communes(pages):
    chapitres = []
    for c, (titre, _) in decoupage.CHAPITRES.items():
        n = DEBUT_CHAPITRE[c]
        rang = next(pg["rang"] for pg in pages if pg["t"]["n"] == n)
        chapitres.append({"titre": titre, "tableau": n, "rang": rang})
    return {"ui": UI, "objets": OBJETS, "familles": FAMILLES, "carte": carte_du_ciel(), "chapitres": chapitres,
            "images": images_des_decors(), "svgs": svgs_des_decors(), "pages": len(pages), "derniere": pages[-1]["t"]["n"]}


def fichier_donnees(pages):
    return "/* Données du livre, écrites par build.py : ne pas modifier à la main. */\nwindow.DARSHAN = " + \
        json_sur(donnees_communes(pages)) + ";\n"


# ---------------------------------------------------------------- vérifications
def verifier(pages):
    # 1. le texte : les temps et les titres recollés redonnent le livre, au caractère près
    for pg in pages:
        attendu = "".join(lignes[p][a:b] for p, a, b in plage_du_tableau(pg["rang"] - 1))
        obtenu = "".join(lignes[p][a:b] for p, morceaux, _ in pg["blocs"] for a, b in morceaux)
        assert obtenu == attendu, f"{pg['t']['n']} : le texte de la page ne redonne pas le livre"
    tout = "".join(lignes[p][a:b] for pg in pages for p, morceaux, _ in pg["blocs"] for a, b in morceaux)
    assert tout == "".join(lignes[p] for p in range(livre_texte.PREMIER, livre_texte.DERNIER + 1)), "le livre n'est pas complet"
    # 2. les consignes et les actions : ni manquante, ni en trop ; huit mots au plus (synthèse, partie 6)
    cles = {g["cle"] for pg in pages for g in pg["gestes"]}
    for cle in CONSIGNES:
        assert cle in cles, f"interface.ini : consigne {cle} sans geste"
    for cle in ACTIONS:
        assert cle in cles, f"interface.ini : action {cle} sans geste"
    for rubrique in (CONSIGNES, ACTIONS):
        for cle, texte in rubrique.items():
            assert len(texte.split()) <= 8, f"interface.ini : « {texte} » ({cle}) a plus de huit mots"
    # qui parle : des paragraphes du livre, des personnages connus
    for p, qui in livre.REPLIQUES.items():
        assert livre_texte.PREMIER <= p <= livre_texte.DERNIER, f"livre.REPLIQUES : paragraphe {p} hors du livre"
        assert qui in ("darshan", "pensee-darshan", "julie", "jivan", None), f"livre.REPLIQUES : {p} : « {qui} » inconnu"
    # les décors nommés par les réglages (reflets, clichés, calques…) : fabriqués ou signalés
    for n, nom in decors_employes():
        d = livre.DECORS[nom]
        if d["type"] in ("photo", "encre", "dessin") and not decor_existe(nom) and nom not in \
                livre.SCENES[n]["decor"]:
            avertir(f"{n} : décor « {nom} » pas encore fabriqué (python3 outils/darshan/decors.py {nom})")
        if d["type"] == "prototype":
            for f in d["fichiers"]:
                fichier_existe(f)
    # 3. le moteur connaît chaque mécanique et chaque effet ; chaque texte d'interface appelé existe
    moteur = moteur_source()
    # (une mécanique ou un effet pas encore écrits : un toucher simple ou rien, signalés ; erreur
    # en --strict)
    mecaniques = set(re.findall(r"Mecaniques\[?\.?'?([a-z-]+)'?\]?\s*=\s*function", moteur))
    effets = set(re.findall(r"Effets\[?\.?'?([a-z+-]+)'?\]?\s*=\s*function", moteur))
    speciales = set(re.findall(r"speciales\[?\.?'?([a-z-]+)'?\]?\s*=\s*function", moteur))
    locaux = effets_locaux(moteur)
    manquent = {}
    for pg in pages:
        n = pg["t"]["n"]
        speciaux = pg["s"]["special"] in speciales
        if pg["s"]["special"] and not speciaux:
            manquent.setdefault(("scène", pg["s"]["special"]), []).append(n)
        for g in pg["gestes"]:
            if not speciaux and g["meca"] not in mecaniques:
                manquent.setdefault(("mécanique", g["meca"]), []).append(n)
            for e in g.get("effets", []):
                # (les effets d'un geste aussi : une scène écrite à la main peut les jouer à sa façon)
                if e["nom"] not in effets and not (speciaux and e["nom"] in locaux):
                    manquent.setdefault(("effet", e["nom"]), []).append(n)
        # (une scène écrite à la main peut jouer un effet à sa façon : scene.effetsLocaux)
        for e in [x for l in pg["effets"].values() for x in l] + pg["s"]["debut"]:
            if e["nom"] not in effets and not (speciaux and e["nom"] in locaux):
                manquent.setdefault(("effet", e["nom"]), []).append(n)
    for (genre, nom), ou in sorted(manquent.items()):
        avertir(f"moteur : {genre} « {nom} » pas encore écrite ({', '.join(sorted(set(ou), key=ordre_tableau))})")
    sans_commentaires = re.sub(r"//[^\n]*|/\*.*?\*/", "", moteur, flags=re.S)
    for cle in set(re.findall(r"\bui\('([a-z_]+)'\)", sans_commentaires)):
        assert cle in UI, f"le moteur demande le texte d'interface « {cle} », absent d'interface.ini"
    # 4. aucune phrase française écrite en dur dans le moteur (hors commentaires) : tout passe par ui()
    for m in re.finditer(r"textContent\s*=\s*'([^']*[a-zà-ÿ]{3}[^']*)'", sans_commentaires):
        raise SystemExit(f"texte d'interface écrit en dur dans le moteur : « {m.group(1)} »")


# ---------------------------------------------------------------- le moteur : fragments assemblés
ORDRE_MOTEUR = ["base.js", "son.js", "dessins.js", "visuels.js", "transitions.js", "interface.js", "recit.js",
                "mecaniques.js", "effets.js", "scenes.js", "depart.js"]


def effets_locaux(moteur):
    """Les effets qu'une scène écrite à la main joue à sa façon : clés de scene.effetsLocaux."""
    noms = set(re.findall(r"effetsLocaux(?:\.|\[')([a-z+-]+)'?\]?\s*=", moteur))
    for m in re.finditer(r"effetsLocaux\s*=\s*\{", moteur):
        profondeur = 1
        for ligne in moteur[m.end():].split("\n"):
            if profondeur == 1:
                cle = re.match(r"\s*'?([a-z+-]+)'?\s*:", ligne)
                if cle:
                    noms.add(cle.group(1))
            profondeur += ligne.count("{") - ligne.count("}")
            if profondeur <= 0:
                break
    return noms


def moteur_source():
    corps = []
    for f in ORDRE_MOTEUR:
        chemin = SRC / "js" / f
        if not chemin.exists():
            raise SystemExit(f"Le moteur du livre entier est en chantier : src/js/{f} n'est pas encore écrit.\n"
                             "Voir « Chantier en cours » dans outils/darshan/README.md.")
        corps.append(f"// ---- {f}\n" + chemin.read_text(encoding="utf-8"))
    return ("/* Darshan, le livre des portes : moteur du livre jouable, assemblé par build.py à partir de\n"
            "   src/js/ (ne pas modifier ce fichier : modifier les fragments). */\n"
            "(function () {\n  'use strict';\n" + "\n".join(corps) + "\n})();\n")


# ---------------------------------------------------------------- ressources
POLICES = ["Amiri-Regular.woff2", "Amiri-Italic.woff2", "Amiri-Bold.woff2", "Unna-Regular.woff2",
           "Unna-Italic.woff2", "Tiro-Darshan.woff2"]
LICENCES = ["OFL-Amiri.txt", "OFL-Unna.txt", "OFL-Tiro.txt"]
TYPES = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2",
         ".txt": "text/plain", ".js": "application/javascript", ".css": "text/css"}


def css_source():
    return (SRC / "moteur.css").read_text(encoding="utf-8")


def css_epub():
    """En mise en page fixe, la page mesure 1200 px : 1cqw = 12 px, écrit en dur."""
    return re.sub(r"(-?\d+(?:\.\d+)?)cqw", lambda m: f"{float(m.group(1)) * 12:g}px", css_source())


# Les réglages qui nomment un décor : les reflets de 1.7, les clichés de la galerie (5.6, 5.7), les verres
# des lunettes (3.4), les calques de la porte du père, les moitiés d'un écran partagé, l'embrasure du placard.
CLES_D_IMAGES = ("images", "image", "calque", "gauche", "droite", "partage", "cadre")


def decors_des_reglages(x, cle=None):
    """Les noms de décors cités par des réglages de gestes ou d'effets."""
    if isinstance(x, dict):
        for k, v in x.items():
            yield from decors_des_reglages(v, k)
    elif isinstance(x, (list, tuple)):
        for v in x:
            yield from decors_des_reglages(v, cle)
    elif isinstance(x, str) and cle in CLES_D_IMAGES and x in livre.DECORS:
        yield x


def decors_employes():
    """(tableau, décor) : chaque décor du livre, plan d'une page ou image de ses réglages, à sa première page."""
    vus = {}
    for n, s in livre.SCENES.items():
        reglages = s["debut"] + s["bilan"] + s["gestes"] + [m for m in s["moments"] if m] + list(s["extra"].values())
        for nom in s["decor"] + list(decors_des_reglages(reglages)):
            vus.setdefault(nom, n)
    return [(n, nom) for nom, n in vus.items()]


def decors_utilises():
    """Les décors fabriqués (src/img/decors/) que le livre emploie."""
    return [nom for _, nom in decors_employes()
            if livre.DECORS[nom]["type"] in ("photo", "encre", "dessin") and decor_existe(nom)]


def extras_des_decors():
    """Les calques et extras que decors.py range avec les décors (src/img/decors/) sans en faire un
    décor de livre.py : clichés et vignettes de la galerie, calques du marché, de la fenêtre et du
    placard, bande de la lune, esquisse du théâtre, planche des photographies… Le moteur les
    appelle par leur nom (DONNEES.images)."""
    dossier = SRC / "img" / "decors"
    if not dossier.exists():
        return []
    return sorted(f.name for f in dossier.iterdir()
                  if f.suffix in (".webp", ".svg") and f.stem not in livre.DECORS)


def fichiers_prototype():
    """Les fichiers du prototype (src/img/) que le livre emploie et qui sont déjà là."""
    fichiers = []
    for _, nom in decors_employes():
        d = livre.DECORS[nom]
        if d["type"] == "prototype":
            fichiers += [f for f in d["fichiers"] if f not in fichiers and (SRC / "img" / f).exists()]
    return fichiers


def images_des_decors():
    """Pour le moteur : le fichier de chaque décor employé (chemins depuis img/ ; deux calques pour
    un décor du prototype qui en a deux) ; les décors pas encore fabriqués n'y sont pas."""
    images = {}
    for _, nom in decors_employes():
        d = livre.DECORS[nom]
        if d["type"] == "prototype":
            images[nom] = [f for f in d["fichiers"] if (SRC / "img" / f).exists()]
        elif d["type"] != "uni" and decor_existe(nom):
            images[nom] = [f"decors/{nom}.webp"]
    for f in extras_des_decors():
        images[pathlib.Path(f).stem] = [f"decors/{f}"]
    return images


def copier_ressources(racine, pages):
    for sous in ("css", "js", "fonts", "img/decors"):
        (racine / sous).mkdir(parents=True, exist_ok=True)
    for f in POLICES + LICENCES:
        shutil.copy(SRC / "fonts" / f, racine / "fonts" / f)
    for f in fichiers_prototype():
        shutil.copy(SRC / "img" / f, racine / "img" / f)
    for nom in decors_utilises():
        shutil.copy(SRC / "img" / "decors" / f"{nom}.webp", racine / "img" / "decors" / f"{nom}.webp")
    for f in extras_des_decors():
        shutil.copy(SRC / "img" / "decors" / f, racine / "img" / "decors" / f)
    (racine / "js" / "moteur.js").write_text(moteur_source(), encoding="utf-8")
    (racine / "js" / "donnees.js").write_text(fichier_donnees(pages), encoding="utf-8")


# ---------------------------------------------------------------- édition web
def page_web(titre, description, corps, robots=True):
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{e_(titre)}</title>
<meta name="description" content="{attr(description)}"/>
{'<meta name="robots" content="noindex"/>' if robots else ''}
<link rel="stylesheet" href="css/moteur.css"/>
<style>html,body{{height:100%;}} body{{display:flex;align-items:center;justify-content:center;min-height:100%;}}</style>
</head>
<body>
<main class="plateau">
{corps}
</main>
<script src="js/donnees.js"></script>
<script src="js/moteur.js"></script>
</body>
</html>
'''


# Banc d'essai des transitions : chaque bouton joue un balayage ou un effet d'objet.
BANC_DECORS = [
    ("darshan", "ciel-poeme.jpg", "Ciel étoilé : photographie de Karl Forterre, retouchée"),
    ("darshan", "porte.jpg", "Le pigeonnier : dessin"),
    ("darshan", "aluva.jpg", "Aluva : dessin"),
    ("darshan", "encre-34762346.jpg", "« Porte en bois rustique et sa lanterne » : photographie de Karl Forterre, passée à l’encre"),
    ("julie", "photo-metro.jpg", "« Métro » : photographie de Karl Forterre"),
    ("julie", "photo-haussmann.jpg", "« Style haussmannien » : photographie de Karl Forterre"),
    ("julie", "photo-pluie.jpg", "« Pluie » : photographie de Karl Forterre"),
]
BANC = [
    ("fondu", "Fondu", "darshan", "Même lieu, même moment : un fondu au noir.", {}),
    ("encre", "Encre", "darshan", "Darshan change de lieu : trois coups de pinceau traversent la page.", {}),
    ("bandes", "Bandes", "darshan", "Un chapitre commence : les bandes claquent et son titre s’y pose.", {"titre": "Un ciel mouvant"}),
    ("iris", "Iris", "darshan", "Une vision, une petite porte : le cercle se referme sur un point et s’ouvre ailleurs.", {"de": "600 760", "vers": "600 1000"}),
    ("porte", "Porte", "darshan", "Darshan franchit une porte : sa lumière gagne l’écran, la scène suivante apparaît dans l’embrasure.", {"de": "500 620 200 360"}),
    ("lumiere", "Lumière", "darshan", "Un éblouissement : la lumière s’étend, puis se dissipe.", {}),
    ("obturateur", "Obturateur", "julie", "Le monde de Julie, photographié : les lames d’un obturateur.", {}),
    ("glissement", "Glissement", "julie", "Le téléphone de Julie : on passe d’une photo à l’autre.", {}),
    ("bandes-photo", "Bandes photo", "julie", "On entre dans le monde de Julie : les bandes du chapitre, puis l’obturateur découvre la photo.", {"titre": "Un pain perdu s’il vous plaît."}),
    ("bandes-julie", "Bandes Julie", "julie", "Un chapitre de Julie : ses bandes de papier photo, au grain argentique ; l’obturateur les ouvre.", {"titre": "Amélie et Julie"}),
    ("bandes-julie", "Bandes lilas", "julie", "Chapitre 5 : les bandes de Julie en lilas, leur grain devenu confettis.", {"titre": "Douceurs et confettis", "palette": "lilas", "grain": "confettis"}),
    ("plan", "Même plan", "julie", "Même plan : rien ne couvre la page ; si l’image change, elle se fond dans la suivante.", {}),
    ("frisson", "Frisson", "", "Un objet change d’état : les lunettes ôtées, la clé dans la serrure.", {}),
    ("eclat", "Éclat", "", "Un objet se métamorphose : les lunettes deviennent une clé.", {}),
    ("envol", "Envol", "", "Un nouvel objet rejoint le sac.", {}),
    ("fiche", "Fiche", "", "La fiche d’un objet s’ouvre en diagonale.", {}),
]
IMAGES_BANC = ["photo-metro.jpg", "photo-haussmann.jpg", "photo-pluie.jpg", "encre-34762346.jpg", "aluva.jpg"]


def banc(img):
    boutons = []
    for t, libelle, monde, legende, attrs in BANC:
        classe = monde if monde == "julie" else ("objet" if not monde else "")
        extra = "".join(f' data-{k}="{attr(v)}"' for k, v in attrs.items())
        boutons.append(f'<button type="button" class="{classe}" data-type="{t}" data-monde="{monde or "darshan"}"'
                       f' title="{attr(legende)}"{extra}>{libelle}</button>')
    decors = "".join(f'<li data-monde="{m}" data-src="{img}{f}">{e_(c)}</li>' for m, f, c in BANC_DECORS)
    return f'''<section class="scene" id="s-banc" data-scene="banc" data-special="banc" data-son="cosmos" data-lu0="{position(24, 0)}" data-sac="" data-sac-julie="" data-portes="" aria-label="Les transitions">
<div class="decor" aria-hidden="true"><img src="{img}ciel-poeme.jpg" alt=""/></div>
<h1 class="banc-titre">Darshan : les transitions</h1>
<p class="banc-legende">Chaque bouton joue une transition ou un effet d’objet, tel qu’il sert dans le livre.</p>
<p class="banc-credit">{e_(BANC_DECORS[0][2])}</p>
<div class="banc-boutons ui">{"".join(boutons)}</div>
<ul class="banc-decors">{decors}</ul>
<script type="application/json" class="config">{{"n":"banc","gestes":[],"portes":{{}},"effets":{{}},"debut":[],"bilan":[],"decors":[]}}</script>
</section>'''


def web(pages):
    racine = DIST / "web"
    if racine.exists():
        shutil.rmtree(racine)
    copier_ressources(racine, pages)
    (racine / "css" / "moteur.css").write_text(css_source(), encoding="utf-8")
    for f in IMAGES_BANC:
        shutil.copy(SRC / "img" / f, racine / "img" / f)
    corps = "\n".join(section(pg, "img/", True) for pg in pages)
    (racine / "index.html").write_text(page_web(
        "Darshan — Karl Forterre, édition jouable",
        "Darshan, nouvelle de Karl Forterre, en livre qui se joue : le texte intégral, révélé geste après geste.",
        corps), encoding="utf-8")
    (racine / "transitions.html").write_text(page_web(
        "Darshan — les transitions", "Les transitions du livre jouable Darshan, de Karl Forterre.", banc("img/")),
        encoding="utf-8")
    return racine


# ---------------------------------------------------------------- EPUB 3, mise en page fixe
def xhtml(pg):
    t = pg["t"]
    titre = TITRE_DE_PAGE.get(t["n"], t["titre"])
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="fr" lang="fr" class="epub">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=1200, height=1800"/>
<title>{e_(titre)}</title>
<link rel="stylesheet" type="text/css" href="../css/moteur.css"/>
</head>
<body>
<div class="plateau">
{section(pg, "../img/", False)}
</div>
<script src="../js/donnees.js"></script>
<script src="../js/moteur.js"></script>
</body>
</html>
'''


def nom_de_page(pg):
    return f"p{pg['rang']:03d}.xhtml"


def epub(pages):
    racine = DIST / "epub"
    if racine.exists():
        shutil.rmtree(racine)
    contenu = racine / "EPUB"
    copier_ressources(contenu, pages)
    (contenu / "css" / "moteur.css").write_text(css_epub(), encoding="utf-8")
    (contenu / "xhtml").mkdir()
    for pg in pages:
        (contenu / "xhtml" / nom_de_page(pg)).write_text(xhtml(pg), encoding="utf-8")
    couverture = SRC / "img" / "couverture.jpg"
    if couverture.exists():
        shutil.copy(couverture, contenu / "img" / "couverture.jpg")
    else:
        avertir("couverture manquante : src/img/couverture.jpg (decors.py la fabrique)")
    # sommaire : les chapitres, puis chaque tableau du chapitre
    toc = []
    for c, (titre, _) in decoupage.CHAPITRES.items():
        du_chapitre = [pg for pg in pages if int(pg["t"]["n"].split(".")[0]) == c]
        sous = "".join(f'<li><a href="xhtml/{nom_de_page(pg)}">{e_(TITRE_DE_PAGE.get(pg["t"]["n"], pg["t"]["titre"]))}</a></li>'
                       for pg in du_chapitre)
        toc.append(f'<li><a href="xhtml/{nom_de_page(du_chapitre[0])}">{e_(titre)}</a><ol>{sous}</ol></li>')
    (contenu / "nav.xhtml").write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="fr" lang="fr">
<head><meta charset="UTF-8"/><title>Sommaire</title></head>
<body>
<nav epub:type="toc" id="toc"><h1>Sommaire</h1><ol>{"".join(toc)}</ol></nav>
<nav epub:type="landmarks" hidden="hidden"><h1>Repères</h1><ol>
<li><a epub:type="titlepage" href="xhtml/{nom_de_page(pages[0])}">Titre</a></li>
<li><a epub:type="bodymatter" href="xhtml/{nom_de_page(pages[1])}">Début du texte</a></li>
</ol></nav>
</body>
</html>
''', encoding="utf-8")
    maintenant = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifeste = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
                 '<item id="css" href="css/moteur.css" media-type="text/css"/>',
                 '<item id="js" href="js/moteur.js" media-type="application/javascript"/>',
                 '<item id="donnees" href="js/donnees.js" media-type="application/javascript"/>']
    for f in POLICES:
        manifeste.append(f'<item id="f-{f.split(".")[0]}" href="fonts/{f}" media-type="font/woff2"/>')
    for f in LICENCES:
        manifeste.append(f'<item id="l-{f.split(".")[0]}" href="fonts/{f}" media-type="text/plain"/>')
    for f in fichiers_prototype():
        manifeste.append(f'<item id="i-{f.split(".")[0]}" href="img/{f}" media-type="{TYPES[pathlib.Path(f).suffix]}"/>')
    for nom in decors_utilises():
        manifeste.append(f'<item id="d-{nom}" href="img/decors/{nom}.webp" media-type="image/webp"/>')
    for f in extras_des_decors():
        manifeste.append(f'<item id="x-{pathlib.Path(f).stem}" href="img/decors/{f}" media-type="{TYPES[pathlib.Path(f).suffix]}"/>')
    if couverture.exists():
        manifeste.append('<item id="couverture" href="img/couverture.jpg" media-type="image/jpeg" properties="cover-image"/>')
    for pg in pages:
        props = "scripted svg" if "<svg" in xhtml(pg) else "scripted"
        manifeste.append(f'<item id="p{pg["rang"]:03d}" href="xhtml/{nom_de_page(pg)}" media-type="application/xhtml+xml" properties="{props}"/>')
    spine = "".join(f'<itemref idref="p{pg["rang"]:03d}"/>' for pg in pages)
    opf = f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="fr"
  prefix="rendition: http://www.idpf.org/vocab/rendition/# ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:identifier id="uid">urn:uuid:{uuid.uuid5(uuid.NAMESPACE_URL, "https://karlforterre.fr/darshan/jouable")}</dc:identifier>
  <dc:title>Darshan</dc:title>
  <dc:creator>Karl Forterre</dc:creator>
  <dc:publisher>Karl Forterre</dc:publisher>
  <dc:language>fr</dc:language>
  <dc:description>Darshan, nouvelle de Karl Forterre, en édition jouable : le texte intégral du livre, révélé geste après geste, dans les décors de ses photographies.</dc:description>
  <meta property="dcterms:modified">{maintenant}</meta>
  <meta property="rendition:layout">pre-paginated</meta>
  <meta property="rendition:spread">none</meta>
  <meta property="rendition:orientation">portrait</meta>
  <meta property="ibooks:specified-fonts">true</meta>
  <meta property="schema:accessMode">textual</meta>
  <meta property="schema:accessMode">visual</meta>
  <meta property="schema:accessMode">auditory</meta>
  <meta property="schema:accessModeSufficient">textual</meta>
  <meta property="schema:accessibilityFeature">readingOrder</meta>
  <meta property="schema:accessibilityFeature">structuralNavigation</meta>
  <meta property="schema:accessibilityFeature">tableOfContents</meta>
  <meta property="schema:accessibilityHazard">noFlashingHazard</meta>
  <meta property="schema:accessibilityHazard">motionSimulation</meta>
  <meta property="schema:accessibilityHazard">noSoundHazard</meta>
  <meta property="schema:accessibilitySummary">Tout le texte du livre est présent dans chaque page et lisible sans animation (réglage « Lecture ») ; les images sont décoratives ; chaque geste a un équivalent par simple toucher et au clavier, et un bouton pour avancer sans le faire ; les mouvements sont réduits si le système le demande.</meta>
</metadata>
<manifest>
{chr(10).join("  " + m for m in manifeste)}
</manifest>
<spine>{spine}</spine>
</package>
'''
    (contenu / "package.opf").write_text(opf, encoding="utf-8")
    (racine / "META-INF").mkdir()
    (racine / "META-INF" / "container.xml").write_text('''<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
''', encoding="utf-8")
    sortie = DIST / "darshan-jouable.epub"
    with zipfile.ZipFile(sortie, "w") as z:
        z.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        for f in sorted(racine.rglob("*")):
            if f.is_file():
                z.write(f, f.relative_to(racine).as_posix(), compress_type=zipfile.ZIP_DEFLATED)
    return sortie


# ---------------------------------------------------------------- tout
def pages_du_livre():
    pages = []
    for i in range(len(TABLEAUX)):
        pg = construire(i)
        pg["rang"] = i + 1
        pages.append(pg)
    etats(pages)
    return pages


if __name__ == "__main__":
    PAGES = pages_du_livre()
    verifier(PAGES)
    DIST.mkdir(exist_ok=True)
    print("web :", web(PAGES))
    print("epub :", epub(PAGES))
    n_temps = sum(len(pg["temps"]) for pg in PAGES)
    n_gestes = sum(len(pg["gestes"]) for pg in PAGES)
    print(f"{len(PAGES)} pages, {n_temps} temps, {n_gestes} gestes")
    for a in dict.fromkeys(AVERTISSEMENTS):
        print("attention :", a)
