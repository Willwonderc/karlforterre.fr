#!/usr/bin/env python3
"""Écrit les pages anglaises (en/…) et chinoises (zh/…) du site.

Les pages d'origine sont les pages françaises de PAGES : l'accueil (index.html) et la
page du mémoire (memoire/index.html). Ce programme les recopie dans chaque langue en
remplaçant chaque texte par sa traduction de js/traductions.js, avec les mêmes règles que
js/langues.js dans le navigateur, mais à l'avance : les moteurs de recherche lisent ainsi
directement le texte anglais ou chinois, à sa propre adresse. Il ajuste aussi la langue
de la page, son adresse, les liens vers le site photo et vers les autres pages traduites,
les chemins des images et le plan du site (sitemap.xml). Un texte sans traduction reste
en français. Les balises de Google Scholar (citation_…) ne restent que sur la page
française : une seule adresse par travail.

La tâche GitHub « Pages en anglais et en chinois » le relance après chaque modification
d'une de ces pages ou de js/traductions.js : il n'y a rien à faire à la main. Pour
l'essayer :
    python3 outils/pages-langues.py
Python seul suffit, sans bibliothèque à installer.
"""

import html
import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SITE = "https://karlforterre.fr"
SITE_PHOTO = "https://photos.karlforterre.fr/"
# Pages traduites : fichier français et adresse ; la version anglaise est sous /en/…
PAGES = {"index.html": "/", "memoire/index.html": "/memoire/"}
LANGUES = {
    "en": {"html": "en", "locale": "en_US", "code": "EN"},
    "zh": {"html": "zh-Hans", "locale": "zh_CN", "code": "中文"},
}
# Attributs traduits, comme dans js/langues.js
ATTRIBUTS_TEXTE = {"alt", "aria-label", "title", "data-titre", "data-text"}
# Attributs qui désignent un fichier du site : un chemin relatif (images/…) ne mènerait
# nulle part depuis /en/ ou /zh/, il devient absolu (/images/…)
ATTRIBUTS_CHEMIN = {"src", "href", "data-grand", "data-src", "poster"}
VIDES = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param",
         "source", "track", "wbr"}
# Rubriques du site photo dont l'adresse change avec la langue (comme dans js/langues.js)
RUBRIQUES_PHOTOS = {"galeries": "galleries", "a-propos": "about", "utiliser-mes-photos": "use-my-photos",
                    "mentions-legales": "legal-notice", "confidentialite": "privacy"}

CHAINE = r'"((?:[^"\\]|\\.)*)"'
# Espaces au sens de JavaScript (\s), pour retrouver les phrases comme js/langues.js
ESPACES = re.compile(r"[\t\n\v\f\r    -     　﻿]+")
JETON = re.compile(r"<!--.*?-->|<(script|style)\b[^>]*>.*?</\1\s*>|<[^>]+>", re.S | re.I)
ATTRIBUT = re.compile(r"""(\s)([^\s=/>]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'>]+))?""")
AVERTISSEMENT = ("<!-- Page écrite par outils/pages-langues.py à partir d'index.html et de "
                 "js/traductions.js : ne pas la modifier à la main. -->\n")


def lire_traductions():
    """Les traductions de js/traductions.js : {phrase française: {"en": …, "zh": …}}."""
    source = (RACINE / "js" / "traductions.js").read_text(encoding="utf-8")
    traductions = {}
    for cle, corps in re.findall(CHAINE + r"\s*:\s*\{([^{}]*)\}", source):
        valeurs = re.findall(r"\b(en|zh)\s*:\s*" + CHAINE, corps)
        traductions[json.loads(f'"{cle}"')] = {langue: json.loads(f'"{v}"') for langue, v in valeurs}
    return traductions


def normaliser(texte):
    return ESPACES.sub(" ", texte).strip(" ")


def chemin_absolu(adresse):
    """images/x.webp → /images/x.webp ; les adresses complètes, ancres et courriels restent."""
    if not adresse or re.match(r"([a-z][a-z0-9+.-]*:|/|#|\?)", adresse, re.I):
        return adresse
    return "/" + adresse


def srcset_absolu(valeur):
    candidats = [c.strip() for c in re.split(r",\s+", valeur.strip()) if c.strip()]
    return ", ".join(" ".join([chemin_absolu(c.split()[0])] + c.split()[1:]) for c in candidats)


def lien_interne(adresse, langue):
    """Lien vers une autre page traduite, dans la même langue : / → /en/, /memoire/ → /en/memoire/."""
    chemin, separateur, reste = re.match(r"([^#?]*)([#?]?)(.*)", adresse).groups()
    if chemin in PAGES.values():
        return f"/{langue}{chemin}{separateur}{reste}"
    return adresse


def lien_photos(adresse, langue):
    """Page du site photo dans la langue voulue : /galeries/x/ → /en/galleries/x/."""
    if not adresse.startswith(SITE_PHOTO):
        return adresse
    chemin = "/" + adresse[len(SITE_PHOTO):]
    if re.match(r"/(en|zh)/", chemin):
        return adresse
    chemin = re.sub(r"^/([^/?#]+)/", lambda m: f"/{RUBRIQUES_PHOTOS.get(m.group(1), m.group(1))}/", chemin, count=1)
    return f"{SITE_PHOTO}{langue}{chemin}"


class Page:
    """Traduction d'une page HTML dans une langue, balise par balise."""

    def __init__(self, langue, traductions, chemin="/"):
        self.langue = langue
        self.traductions = traductions
        self.chemin = chemin  # adresse de la page française : /, /memoire/
        self.pile = []  # (nom de la balise, texte exclu de la traduction)
        self.manquantes = set()

    def traduction(self, francais):
        entree = self.traductions.get(normaliser(francais))
        return entree.get(self.langue) if entree else None

    def exclu(self):
        return bool(self.pile) and self.pile[-1][1]

    def texte(self, brut):
        """Texte entre deux balises : traduit s'il est dans le corps ou le titre de la page."""
        if not brut.strip() or self.exclu() or not any(nom in ("body", "title") for nom, _ in self.pile):
            return brut
        clair = html.unescape(brut)
        traduit = self.traduction(clair)
        if traduit is None:
            if re.search(r"[A-Za-zÀ-ÿ]{3}", clair) and normaliser(clair) not in self.traductions:
                self.manquantes.add(normaliser(clair))
            return brut
        avant = re.match(r"\s*", brut).group(0)
        apres = re.search(r"\s*$", brut).group(0)
        return avant + html.escape(traduit, quote=False) + apres

    def balise(self, jeton):
        fermante = re.match(r"</\s*([a-zA-Z][\w:-]*)", jeton)
        if fermante:
            nom = fermante.group(1).lower()
            if any(n == nom for n, _ in self.pile):
                while self.pile and self.pile.pop()[0] != nom:
                    pass
            return jeton
        ouvrante = re.match(r"<\s*([a-zA-Z][\w:-]*)", jeton)
        if not ouvrante:
            return jeton  # <!DOCTYPE …>
        nom = ouvrante.group(1).lower()
        attributs = {m.group(2).lower(): html.unescape((m.group(4) or "").strip("\"'"))
                     for m in ATTRIBUT.finditer(jeton[ouvrante.end():])}
        exclu = self.exclu() or "data-sans-traduction" in attributs
        if nom == "meta" and attributs.get("name", "").startswith("citation_"):
            return ""  # Google Scholar : la page française seule
        jeton = jeton[:ouvrante.end()] + ATTRIBUT.sub(
            lambda m: self.attribut(m, nom, attributs, exclu), jeton[ouvrante.end():])
        if nom not in VIDES and not jeton.rstrip(">").rstrip().endswith("/"):
            self.pile.append((nom, exclu))
        return jeton

    def attribut(self, m, balise, attributs, exclu):
        espace, nom, egal, brut = m.group(1), m.group(2), m.group(3), m.group(4)
        if brut is None:
            return m.group(0)
        guillemet = brut[0] if brut[0] in "\"'" else '"'
        valeur = html.unescape(brut.strip("\"'"))
        nom_bas = nom.lower()
        t = LANGUES[self.langue]
        nouvelle = valeur
        if balise == "html" and nom_bas == "lang":
            nouvelle = t["html"]
        elif balise == "link" and attributs.get("rel") == "canonical" and nom_bas == "href":
            nouvelle = f"{SITE}/{self.langue}{self.chemin}"
        elif balise == "meta" and nom_bas == "content":
            propriete = attributs.get("property") or attributs.get("name")
            if propriete in ("description", "og:title", "og:description"):
                nouvelle = self.traduction(valeur) or valeur
            elif propriete == "og:locale":
                nouvelle = t["locale"]
            elif propriete == "og:url":
                nouvelle = f"{SITE}/{self.langue}{self.chemin}"
        elif nom_bas in ATTRIBUTS_TEXTE and not exclu:
            nouvelle = self.traduction(valeur) or valeur
        elif nom_bas == "srcset":
            nouvelle = srcset_absolu(valeur)
        elif nom_bas == "style":
            nouvelle = re.sub(r"url\((['\"]?)([^'\")]+)", lambda u: f"url({u.group(1)}{chemin_absolu(u.group(2))}", valeur)
        elif nom_bas in ATTRIBUTS_CHEMIN:
            nouvelle = chemin_absolu(lien_photos(valeur, self.langue) if nom_bas == "href" and not exclu else valeur)
            if nom_bas == "href" and not exclu and balise == "a":
                nouvelle = lien_interne(nouvelle, self.langue)
        if nouvelle == valeur:
            return m.group(0)
        echappee = html.escape(nouvelle, quote=True) if guillemet == '"' else html.escape(nouvelle, quote=False)
        return f"{espace}{nom}{egal}{guillemet}{echappee}{guillemet}"

    def script(self, jeton):
        """Scripts : chemin du fichier rendu absolu ; données structurées : langue de la
        page et métier de l'auteur."""
        fin = jeton.index(">")
        jeton = re.sub(r'(\ssrc=")([^"]*)"', lambda m: m.group(1) + chemin_absolu(m.group(2)) + '"', jeton[:fin]) + jeton[fin:]
        if "application/ld+json" not in jeton[:jeton.index(">")]:
            return jeton
        jeton = re.sub(r'("inLanguage"\s*:\s*)"fr"', rf'\1"{LANGUES[self.langue]["html"]}"', jeton)
        return re.sub(r'("jobTitle"\s*:\s*)"([^"]+)"',
                      lambda m: m.group(1) + json.dumps(self.traduction(m.group(2)) or m.group(2), ensure_ascii=False),
                      jeton)

    def traduire(self, source):
        morceaux, position = [], 0
        for m in JETON.finditer(source):
            morceaux.append(self.texte(source[position:m.start()]))
            jeton = m.group(0)
            if jeton.startswith("<!--"):
                morceaux.append(jeton)
            elif m.group(1):
                morceaux.append(self.script(jeton) if m.group(1).lower() == "script" else jeton)
            else:
                morceaux.append(self.balise(jeton))
            position = m.end()
        morceaux.append(self.texte(source[position:]))
        page = "".join(morceaux)
        # Pastille de la langue en cours, dans le menu des langues
        page = page.replace('<span class="nav-langue-code" data-sans-traduction>FR</span>',
                            f'<span class="nav-langue-code" data-sans-traduction>{LANGUES[self.langue]["code"]}</span>')
        return re.sub(r"(<!DOCTYPE html>\s*)", r"\1" + AVERTISSEMENT.replace("\\", "\\\\"), page, count=1, flags=re.I)


def ecrire_plan():
    """sitemap.xml : les trois versions de chaque page traduite, reliées entre elles, puis
    les autres adresses déjà présentes dans le plan."""
    chemin = RACINE / "sitemap.xml"
    versions = [{"fr": f"{SITE}{page}", "en": f"{SITE}/en{page}", "zh-Hans": f"{SITE}/zh{page}"}
                for page in PAGES.values()]
    traduites = {adresse for v in versions for adresse in v.values()}
    autres = []
    if chemin.exists():
        for bloc in re.findall(r"<url>.*?</url>", chemin.read_text(encoding="utf-8"), re.S):
            adresse = re.search(r"<loc>(.*?)</loc>", bloc).group(1).strip()
            if adresse not in traduites:
                autres.append(f"    <url><loc>{adresse}</loc></url>")
    lignes = []
    for v in versions:
        liens = "".join(f'\n        <xhtml:link rel="alternate" hreflang="{code}" href="{adresse}"/>'
                        for code, adresse in list(v.items()) + [("x-default", v["fr"])])
        lignes += [f"    <url>\n        <loc>{adresse}</loc>{liens}\n    </url>" for adresse in v.values()]
    chemin.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(lignes + autres) + "\n</urlset>\n", encoding="utf-8")


def main():
    traductions = lire_traductions()
    for fichier, chemin in PAGES.items():
        source = (RACINE / fichier).read_text(encoding="utf-8")
        for langue in LANGUES:
            page = Page(langue, traductions, chemin)
            sortie = RACINE / langue / fichier
            sortie.parent.mkdir(parents=True, exist_ok=True)
            sortie.write_text(page.traduire(source), encoding="utf-8")
            print(f"{langue}/{fichier} écrite ; textes restés en français : {len(page.manquantes)}")
            for texte in sorted(page.manquantes):
                print(f"   - {texte[:100]}")
    ecrire_plan()
    print("sitemap.xml mis à jour.")


if __name__ == "__main__":
    main()
