# Darshan jouable : la mesure du chantier

*Écrit le 2026-11-15 par `outils/darshan/mesure.py` : modifier le programme, jamais ce document.
Le plan par lots, qui dit ce que ces chiffres doivent devenir : [plan-darshan-lots.md](plan-darshan-lots.md).*

| Ce qui se mesure | Aujourd'hui |
|---|---|
| Fabrication (`build.py`) | réussie : 85 pages, 446 temps de lecture, 59 gestes |
| Texte du livre | 232 lignes de texte (titres compris), 8404 mots, 34 coquilles corrigées à la fabrication |
| Découpage | 85 tableaux ; 109 photos de Karl au découpage ; 43 images à produire (repérages), en 10 sorties |
| Effets | 100 écrits sur 106 employés par les pages (94 %) |
| Effets qui manquent | `chiasme` (7.11) ; `enjambees` (7.8) ; `etoiles-jour` (7.11) ; `partage` (7.4) ; `ralenti` (7.10) ; `vacille` (7.7) |
| Scènes écrites à la main | 10 : cloture, listes, pigeonnier, plier, poeme, rue-de-rungis, seuil, toit, tuiles, vision ; manquantes : aucun |
| Mécaniques de geste | 27 |
| Entrées de page (transitions) | 13 : bandes, bandes-julie, bandes-photo, encre, fondu, glissement, iris 600 1000, iris 600 700, iris 600 900, lumiere, obturateur, plan, porte |
| Son | 17 ambiances, 10 couches, 88 sons ponctuels ; 78 sons demandés par les pages et le moteur |
| Sons demandés et encore muets | 1 : nuage |
| Décors | 115 décors, 133 fichiers, 29.7 Mo |
| Objets et portes | 18 objets, 7 portes au carnet |
| Textes d'interface | 126 textes, dont 48 marques « à valider par Karl » |
| Programme | moteur 16154 lignes, fabrication 8335 lignes, essais 1254 lignes |
| Éditions fabriquées | jouable : 31.8 Mo ; classique : 0.5 Mo |
| Lots du plan | 0 faits sur 22 |

Ce que le programme ne voit pas : la liste des sons muets est une lecture du code (le banc
`essai-son.js --livre` la confirme en jouant le livre) ; les essais sur appareil, les validations de
Karl et les décisions sont notés dans le plan et dans `outils/darshan/README.md`.
