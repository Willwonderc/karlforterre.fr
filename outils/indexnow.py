#!/usr/bin/env python3
"""Signale aux moteurs de recherche, par IndexNow, les pages du site qui viennent de changer.

IndexNow est un protocole ouvert, gratuit, suivi par Bing, Yandex, Naver, Seznam et Yep
(Google ne le suit pas : il lit le plan du site, sitemap.xml). La tâche GitHub « Pages en
anglais et en chinois » le lance après chaque publication, avec la liste écrite par
`outils/pages-langues.py --signaler`. Avant d'envoyer, il attend que GitHub Pages serve
la nouvelle version de chaque page (jusqu'à un quart d'heure), pour que le moteur qui
vient la lire trouve la bonne.

La clé (CLE) n'a rien de secret : elle est publiée à la racine du site, dans le fichier
<CLE>.txt, qui prouve aux moteurs que l'envoi vient bien du propriétaire du site. Pour en
changer, créer un nouveau fichier de clé et remplacer CLE ici.

    python3 outils/indexnow.py LISTE           signale les adresses de LISTE (une par ligne)
    python3 outils/indexnow.py --essai [LISTE] montre l'envoi sans rien envoyer

Sans LISTE, les 7 pages du plan du site. Ne pas lancer sans --essai en session : seule la
tâche GitHub signale les pages.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SITE = "https://karlforterre.fr"
CLE = "bd238327a8daa1482e97920b81e3813d"
INDEXNOW = "https://www.bing.com/indexnow"
ATTENTE_PUBLICATION = 15 * 60  # au plus, avant d'envoyer quand même
# Au premier envoi avec une clé, Bing lit d'abord le fichier de clé et refuse l'envoi en
# attendant (403, « SiteVerificationNotCompleted ») : nouvel essai après ces attentes.
ATTENTES_VERIFICATION = (60, 120, 300, 600)
REPONSES = {
    200: "adresses reçues",
    202: "adresses reçues, clé en cours de vérification",
    400: "requête mal formée",
    403: "clé refusée : le fichier de clé n'est pas en ligne ou ne correspond pas à la clé",
    422: "adresses refusées : elles n'appartiennent pas au site, ou la clé ne correspond pas",
    429: "trop de requêtes : à reprendre plus tard",
}


def fichier_de(adresse):
    chemin = adresse[len(SITE):].strip("/")
    return RACINE / (f"{chemin}/index.html" if chemin else "index.html")


def en_ligne(adresse):
    """Contenu servi à cette adresse, sans cache, ou None."""
    requete = urllib.request.Request(f"{adresse}?indexnow={int(time.time())}",
                                     headers={"User-Agent": "site-karl-forterre", "Cache-Control": "no-cache"})
    try:
        with urllib.request.urlopen(requete, timeout=30) as reponse:
            return reponse.read()
    except OSError:
        return None


def pas_encore_publiees(adresses):
    """Adresses (et fichier de clé) dont la version en ligne diffère encore du dépôt."""
    attendues = {f"{SITE}/{CLE}.txt": RACINE / f"{CLE}.txt"}
    attendues.update({a: fichier_de(a) for a in adresses})
    return [a for a, f in attendues.items() if f.exists() and en_ligne(a) != f.read_bytes()]


def envoyer(adresses):
    corps = json.dumps({"host": SITE.split("//")[1], "key": CLE, "keyLocation": f"{SITE}/{CLE}.txt",
                        "urlList": adresses}).encode("utf-8")
    pannes = verifications = 0
    while True:
        code, detail = None, ""
        requete = urllib.request.Request(INDEXNOW, data=corps, method="POST", headers={
            "Content-Type": "application/json; charset=utf-8", "User-Agent": "site-karl-forterre"})
        try:
            with urllib.request.urlopen(requete, timeout=60) as reponse:
                code = reponse.status
        except urllib.error.HTTPError as erreur:
            code, detail = erreur.code, erreur.read().decode("utf-8", "replace")[:300]
        except OSError as erreur:
            detail = str(erreur)
        if code == 403 and "SiteVerificationNotCompleted" in detail and verifications < len(ATTENTES_VERIFICATION):
            attente = ATTENTES_VERIFICATION[verifications]
            verifications += 1
            print(f"IndexNow : Bing vérifie encore la clé ; nouvel essai dans {attente // 60} min.")
            time.sleep(attente)
        elif (code is None or code >= 500) and pannes < 2:
            pannes += 1
            time.sleep(30 * pannes)
        else:
            break
    print(f"IndexNow : {len(adresses)} pages signalées, réponse {code or '—'} "
          f"({REPONSES.get(code, detail or 'pas de réponse')}).")
    if code in (400, 403, 422) and detail:
        print(f"  Détail : {detail}")
    # Une panne passagère n'est qu'un avertissement : le moteur lira de toute façon sitemap.xml.
    return 1 if code in (400, 403, 422) else 0


def main():
    arguments = [a for a in sys.argv[1:] if a != "--essai"]
    essai = "--essai" in sys.argv
    if arguments:
        adresses = [l.strip() for l in Path(arguments[0]).read_text(encoding="utf-8").splitlines() if l.strip()]
    else:
        plan = (RACINE / "sitemap.xml").read_text(encoding="utf-8")
        adresses = [a.strip() for a in re.findall(r"<loc>(.*?)</loc>", plan)]
    adresses = [a for a in adresses if a.startswith(f"{SITE}/")]
    if not adresses:
        print("IndexNow : aucune page à signaler.")
        return 0
    if essai:
        retard = pas_encore_publiees(adresses)
        print("En ligne et à jour :", "toutes" if not retard else f"toutes sauf {', '.join(retard)}")
        print("Envoi prévu (essai, rien n'est envoyé) :", INDEXNOW)
        print(json.dumps({"host": SITE.split("//")[1], "key": CLE, "keyLocation": f"{SITE}/{CLE}.txt",
                          "urlList": adresses}, indent=2, ensure_ascii=False))
        return 0
    debut = time.time()
    while (retard := pas_encore_publiees(adresses)) and time.time() - debut < ATTENTE_PUBLICATION:
        time.sleep(30)
    if retard:
        print(f"IndexNow : pas encore à jour en ligne après {ATTENTE_PUBLICATION // 60} min, "
              f"envoi quand même : {', '.join(retard)}")
    return envoyer(adresses)


if __name__ == "__main__":
    sys.exit(main())
