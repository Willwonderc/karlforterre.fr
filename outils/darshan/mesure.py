#!/usr/bin/env python3
"""Mesure du chantier Darshan : ce qui est fait et ce qui reste, en chiffres tirés du dépôt.

    python3 outils/darshan/mesure.py                    affiche la mesure et écrit docs/darshan-mesure.md
    python3 outils/darshan/mesure.py --journal "Lot 1"  ajoute aussi une ligne à outils/darshan/mesure-journal.csv

À lancer à la fin de chaque lot du plan (docs/plan-darshan-lots.md), après `python3 build.py`.
Aucune dépendance. Le document docs/darshan-mesure.md est écrit par ce programme : modifier le
programme, jamais le document. Ce que le programme ne peut pas voir (ce que Karl a validé, ce
qui a été essayé sur un appareil) est noté dans le plan, lot par lot.
"""
import datetime
import pathlib
import re
import subprocess
import sys

ICI = pathlib.Path(__file__).resolve().parent
RACINE = ICI.parent.parent
SORTIE = RACINE / "docs" / "darshan-mesure.md"
PLAN = RACINE / "docs" / "plan-darshan-lots.md"
JOURNAL = ICI / "mesure-journal.csv"
sys.path.insert(0, str(ICI))


def lire(chemin):
    try:
        return (ICI / chemin).read_text(encoding="utf-8")
    except OSError:
        return ""


def bloc(source, debut):
    """Les lignes d'un objet JavaScript `var x = {` … `};` (même retrait), sans son en-tête."""
    lignes = source.split("\n")
    for i, ligne in enumerate(lignes):
        if ligne.strip().startswith(debut):
            retrait = len(ligne) - len(ligne.lstrip())
            for j in range(i + 1, len(lignes)):
                if lignes[j].startswith(" " * retrait + "}") and len(lignes[j]) - len(lignes[j].lstrip()) == retrait:
                    return lignes[i + 1:j], retrait
    return [], 0


def cles(source, debut):
    lignes, retrait = bloc(source, debut)
    motif = re.compile(r"^" + " " * (retrait + 2) + r"'?([A-Za-z0-9_-]+)'?\s*:")
    return {m.group(1) for m in (motif.match(l) for l in lignes) if m}


def mesurer():
    m = {"date": datetime.date.today().isoformat()}

    # ---- le texte et le découpage
    import texte
    import decoupage
    import livre
    m["paragraphes"] = len(texte.lignes)
    m["mots"] = sum(decoupage.mots(decoupage.texte(i)) for i in range(len(decoupage.TABLEAUX)))
    m["corrections"] = len(texte.CORRECTIONS)
    m["tableaux"] = len(decoupage.TABLEAUX)
    m["photos"] = len(getattr(decoupage, "PHOTOS", {}))
    m["sorties"] = len(getattr(decoupage, "SORTIES", {}))
    m["reperages"] = sum(len(t.get("reperages", ())) for t in decoupage.TABLEAUX)

    # ---- la fabrication : pages, temps, gestes, ce que le moteur ne sait pas encore faire
    r = subprocess.run([sys.executable, str(ICI / "build.py")], capture_output=True, text=True)
    sortie = r.stdout + r.stderr
    m["fabrication"] = "réussie" if r.returncode == 0 else "EN ÉCHEC"
    t = re.search(r"(\d+) pages, (\d+) temps, (\d+) gestes", sortie)
    m["pages"], m["temps"], m["gestes"] = (int(x) for x in t.groups()) if t else (0, 0, 0)
    manques = re.findall(r"attention : moteur : (effet|scène) « ([^»]+) » pas encore écrite? \(([^)]*)\)", sortie)
    m["effets_manquants"] = sorted((n, p) for g, n, p in manques if g == "effet")
    m["scenes_manquantes"] = sorted((n, p) for g, n, p in manques if g != "effet")
    m["autres_alertes"] = [l for l in sortie.split("\n") if l.startswith("attention") and "pas encore écrit" not in l]

    # ---- le moteur
    src_livre = lire("livre.py")
    effets_js, scenes_js, meca_js, son_js = (lire("src/js/" + f) for f in ("effets.js", "scenes.js", "mecaniques.js", "son.js"))
    m["effets_employes"] = len(set(re.findall(r'\bE\("([^"]+)"', src_livre)))
    m["effets_ecrits"] = m["effets_employes"] - len(m["effets_manquants"])
    scenes = set(a or b for a, b in re.findall(r"speciales\.([A-Za-z_]\w*) = function|speciales\['([^']+)'\] = function", scenes_js)) - {"banc"}
    m["scenes"] = sorted(scenes)
    m["mecaniques"] = len(set(a or b for a, b in re.findall(r"Mecaniques\.([A-Za-z_]\w*) = |Mecaniques\['([^']+)'\] = ", meca_js)))
    web = lire("dist/web/index.html")
    m["transitions"] = sorted(set(re.findall(r'data-entree="([^"]+)"', web)))

    # ---- le son : ce que les pages et le moteur demandent, et que son.js ne sait pas (encore) faire
    connus = cles(son_js, "var effets = {")
    connus |= set(a or b for a, b in re.findall(r"\b(?:effets|BOUCLES)\.([A-Za-z_]\w*) = |\b(?:effets|BOUCLES)\['([^']+)'\] = ", son_js))
    m["sons_effets"] = len(connus)
    m["sons_ambiances"] = len(cles(son_js, "var ambiances = {"))
    m["sons_couches"] = len(cles(son_js, "var COUCHES = {"))
    demandes = set(re.findall(r'E\("son", effet="([^"]+)"', src_livre)) | set(re.findall(r'\beffet="([^"]+)"', src_livre))
    for js in ("effets.js", "scenes.js", "mecaniques.js", "interface.js", "transitions.js", "recit.js", "depart.js"):
        demandes |= set(re.findall(r"(?:Son\.effet|Fx\.sonner|\bsonner)\('([a-z0-9-]+)'", lire("src/js/" + js)))
    speciaux = {"pere", "jour"}
    m["sons_demandes"] = len(demandes)
    m["sons_muets"] = sorted(n for n in demandes - connus - speciaux
                             if not re.match(r"(achat|paysage)-", n) and not n.endswith("-"))

    # ---- les images, les objets, l'interface
    decors = sorted((ICI / "src" / "img" / "decors").glob("*"))
    m["decors_fichiers"] = len(decors)
    m["decors_mo"] = round(sum(f.stat().st_size for f in decors) / 1e6, 1)
    m["decors"] = len(livre.DECORS)
    m["objets"] = len(re.findall(r"(?m)^\[", lire("objets.ini")))
    m["portes"] = len(re.findall(r"(?m)^\[", lire("portes.ini")))
    ini = lire("interface.ini")
    m["textes"] = len(re.findall(r"(?m)^[A-Za-z0-9_.-]+\s*=", ini))
    m["textes_a_valider"] = ini.count("à valider par Karl")

    # ---- le programme et les éditions
    def lignes(*motifs):
        return sum(len(f.read_text(encoding="utf-8", errors="ignore").split("\n")) for mo in motifs for f in ICI.glob(mo))
    m["lignes_moteur"] = lignes("src/js/*.js", "src/moteur.css")
    m["lignes_fabrication"] = lignes("*.py")
    m["lignes_essais"] = lignes("essai*.js", "captures.js", "rendu.js", "planche-objets.js")
    for nom, f in (("epub_jouable_mo", "dist/darshan-jouable.epub"), ("epub_classique_mo", "dist/darshan.epub")):
        p = ICI / f
        m[nom] = round(p.stat().st_size / 1e6, 1) if p.exists() else None

    # ---- les lots du plan : « - [x] Lot 3 … » fait, « - [ ] Lot 4 … » à faire
    plan = PLAN.read_text(encoding="utf-8") if PLAN.exists() else ""
    m["lots_faits"] = len(re.findall(r"(?m)^- \[x\] \*\*Lot", plan))
    m["lots_total"] = m["lots_faits"] + len(re.findall(r"(?m)^- \[ \] \*\*Lot", plan))
    return m


def document(m):
    def liste(couples):
        return " ; ".join(f"`{n}` ({p})" for n, p in couples) or "aucun"
    part = (100 * m["effets_ecrits"] // m["effets_employes"]) if m["effets_employes"] else 0
    l = [
        "# Darshan jouable : la mesure du chantier",
        "",
        f"*Écrit le {m['date']} par `outils/darshan/mesure.py` : modifier le programme, jamais ce document.",
        "Le plan par lots, qui dit ce que ces chiffres doivent devenir : [plan-darshan-lots.md](plan-darshan-lots.md).*",
        "",
        "| Ce qui se mesure | Aujourd'hui |",
        "|---|---|",
        f"| Fabrication (`build.py`) | {m['fabrication']} : {m['pages']} pages, {m['temps']} temps de lecture, {m['gestes']} gestes |",
        f"| Texte du livre | {m['paragraphes']} lignes de texte (titres compris), {m['mots']} mots, {m['corrections']} coquilles corrigées à la fabrication |",
        f"| Découpage | {m['tableaux']} tableaux ; {m['photos']} photos de Karl au découpage ; {m['reperages']} images à produire (repérages), en {m['sorties']} sorties |",
        f"| Effets | {m['effets_ecrits']} écrits sur {m['effets_employes']} employés par les pages ({part} %) |",
        f"| Effets qui manquent | {liste(m['effets_manquants'])} |",
        f"| Scènes écrites à la main | {len(m['scenes'])} : {', '.join(m['scenes'])} ; manquantes : {liste(m['scenes_manquantes'])} |",
        f"| Mécaniques de geste | {m['mecaniques']} |",
        f"| Entrées de page (transitions) | {len(m['transitions'])} : {', '.join(m['transitions'])} |",
        f"| Son | {m['sons_ambiances']} ambiances, {m['sons_couches']} couches, {m['sons_effets']} sons ponctuels ; {m['sons_demandes']} sons demandés par les pages et le moteur |",
        f"| Sons demandés et encore muets | {len(m['sons_muets'])} : {', '.join(m['sons_muets']) or 'aucun'} |",
        f"| Décors | {m['decors']} décors, {m['decors_fichiers']} fichiers, {m['decors_mo']} Mo |",
        f"| Objets et portes | {m['objets']} objets, {m['portes']} portes au carnet |",
        f"| Textes d'interface | {m['textes']} textes, dont {m['textes_a_valider']} marques « à valider par Karl » |",
        f"| Programme | moteur {m['lignes_moteur']} lignes, fabrication {m['lignes_fabrication']} lignes, essais {m['lignes_essais']} lignes |",
        f"| Éditions fabriquées | jouable : {m['epub_jouable_mo'] or '—'} Mo ; classique : {m['epub_classique_mo'] or '— (lancer classique.py)'} Mo |",
        f"| Lots du plan | {m['lots_faits']} faits sur {m['lots_total']} |",
    ]
    if m["autres_alertes"]:
        l += ["", "Autres alertes de la fabrication :", ""] + [f"- {a}" for a in m["autres_alertes"]]
    l += ["",
          "Ce que le programme ne voit pas : la liste des sons muets est une lecture du code (le banc",
          "`essai-son.js --livre` la confirme en jouant le livre) ; les essais sur appareil, les validations de",
          "Karl et les décisions sont notés dans le plan et dans `outils/darshan/README.md`.", ""]
    return "\n".join(l)


if __name__ == "__main__":
    mesure = mesurer()
    texte_doc = document(mesure)
    SORTIE.write_text(texte_doc, encoding="utf-8")
    print(texte_doc)
    if "--journal" in sys.argv:
        nom = sys.argv[sys.argv.index("--journal") + 1] if len(sys.argv) > sys.argv.index("--journal") + 1 else ""
        colonnes = ["date", "pages", "temps", "gestes", "effets_ecrits", "effets_employes", "sons_effets",
                    "textes", "textes_a_valider", "decors_fichiers", "decors_mo", "lignes_moteur",
                    "epub_jouable_mo", "lots_faits", "lots_total"]
        if not JOURNAL.exists():
            JOURNAL.write_text("etape;" + ";".join(colonnes) + ";sons_muets\n", encoding="utf-8")
        with JOURNAL.open("a", encoding="utf-8") as f:
            f.write(nom + ";" + ";".join(str(mesure[c]) for c in colonnes) + ";" + str(len(mesure["sons_muets"])) + "\n")
        print(f"journal : une ligne ajoutée à {JOURNAL.relative_to(RACINE)}")
