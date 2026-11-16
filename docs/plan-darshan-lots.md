# Darshan jouable : le plan par lots, un lot par semaine

Plan écrit le 14 novembre 2026 et relevé le 16 novembre, à la demande de Karl, par la session qui a fabriqué le livre
jouable du 28 septembre au 3 octobre. Il mesure ce qui est fait, puis découpe tout ce qui reste
en lots d'une semaine, sans rien retirer aux ambitions engagées (plans
[plan-darshan.md](plan-darshan.md) et [plan-darshan-interface.md](plan-darshan-interface.md),
synthèse de la mise en scène) et en y ajoutant de nouvelles. Le chantier est désormais mené par
la session **ALFRED** : la passation est dans [darshan-passation.md](darshan-passation.md).

## En bref

- **Où on en est** : le livre se fabrique, passe tous ses contrôles et se joue de la page de
  titre à « Fin ». Il lui manque six effets (fin du chapitre 7) et un son, l'application de
  trois réponses de Karl (le Kerala en photos, « Dieu », les images à faire produire), un
  essai complet sur iPhone, puis tout ce qui mène à la parution.
- **Le rythme** : un lot par semaine, du samedi au vendredi (la limite d'usage repart le samedi
  à 3 h), à partir du samedi 21 novembre 2026. Chaque lot tient en une séance neuve, finit par
  une pull request et par une mesure chiffrée.
- **Le chemin** : 25 lots en quatre saisons. Saison 1, finir et essayer (lots 1 à 5). Saison 2,
  élever : l'atelier des photos, la finition, la musique, la voix, l'accessibilité, jusqu'à la
  **version 1.0** (lot 16, début mars 2027). Saison 3, publier (lots 17 à 20). Saison 4, plus
  loin : l'anglais, le chinois, le carnet de création et le moteur pour un autre livre (lots 21
  à 25, début mai 2027).
- **Relevé le 16 novembre** : Karl demande plus d'ambition encore, et rappelle que **Codex peut
  retoucher ses photos**. Le plan gagne un atelier des photos (lot 2) et trois lots où chaque
  photo du livre est accordée à sa page (lots 6 à 8) ; il passe de 22 à 25 lots, et la version
  1.0 du lot 13 au lot 16. Rien n'est retiré.
- **Rien ne presse** : si Karl n'a pas eu le temps (un essai, des images, une voix), le lot qui
  l'attend échange sa place avec le suivant. On ne saute aucun lot et on n'en allège aucun.

## 1. La mesure au 14 novembre 2026

Chiffres relevés par `outils/darshan/mesure.py` (à relancer à chaque lot ; résultat dans
[darshan-mesure.md](darshan-mesure.md)) et par les essais rejoués ce jour.

| Ce qui existe | Mesure |
|---|---|
| Le livre jouable | 85 pages (85 tableaux du découpage), 446 temps de lecture, 59 gestes ; EPUB en pages fixes de 31,8 Mo et édition web |
| Le texte | 8 404 mots, tels que le livre de 2023, avec 34 coquilles corrigées à la fabrication (acceptées par Karl) ; comparaison automatique à chaque fabrication |
| La pré-production | direction de création, synthèse et traitement narratif des 85 scènes (`docs/darshan-mise-en-scene/`) ; découpage complet (`docs/darshan-decoupage.md`) |
| Les décors | 115 décors (133 fichiers, 29,7 Mo), à partir de 109 photos de Karl, d'encres et de dessins |
| Les gestes | 27 mécaniques (toucher, maintenir, glisser, tracer, respirer, verser, feuilleter…), toutes au toucher simple, au clavier et au bouton « Faire le geste » |
| Les effets | 100 écrits sur les 106 qu'emploient les pages (94 %) |
| Les scènes écrites à la main | 10 sur 10 : seuil, poème, toit, tuiles, pigeonnier, pliage, vision, listes, rue de Rungis, clôture |
| Les entrées de page | 13 sortes (porte, bandes, bandes de photos, bandes de Julie, encre, iris, obturateur, lumière, même plan…) |
| Le son | 17 ambiances, 10 couches, 88 sons ponctuels ; un seul son demandé par les pages n'existe pas encore (`nuage`), et un seul niveau est à reprendre (2.9), d'après le banc du son joué sur tout le livre |
| L'interface | 18 objets et leurs fiches, 7 portes au carnet, regard, compte à rebours, boussole, menu ; 126 textes d'interface, dont 48 marques « à valider par Karl » |
| L'édition classique | EPUB refusionnable de 0,5 Mo, couverture de 2023, sans erreur à EPUBCheck ni à Ace |
| Les contrôles | fabrication, EPUBCheck (deux éditions), Ace, livre joué en entier, 11 essais de touchers façon iPhone, 12 essais de transitions, banc du son ; tâche GitHub « Darshan » à chaque envoi |
| Le programme | moteur : 16 154 lignes ; fabrication : 8 336 lignes ; essais : 1 254 lignes ; aucune dépendance |
| Les décisions de Karl | 51 questions, 51 réponses (43 accords, 8 « autrement »), toutes sur la page « Décisions pour Darshan » |

État des chantiers engagés (D1 à D10 du plan, I1 à I6 du plan de l'interface) :

| Chantier | État | Ce qui manque | Lots |
|---|---|---|---|
| D1 Fondations | fait | ISBN et colophon (Karl) | 17 |
| D2 Direction artistique | fait | le Kerala en photos (décidé), chaque photo accordée à sa page, les images qui manquent | 2, 3, 6 à 9 |
| D3 à D6 Chapitres 1 à 6 | faits | finition | 10, 11, 12 |
| D7 Chapitre 7 et fin | presque | six effets, trois compléments | 1 |
| D8 Son et voix | son fait ; voix non commencée | un son, la musique jouée, la voix de Karl, le fichier des licences | 1, 13, 14 |
| D9 Accessibilité, essais, parution | essais automatiques faits | essai sur appareils, édition web en ligne, librairies, bande-annonce | 4, 5, 15, 16, 18, 19, 20 |
| D10 Traductions (option) | à faire | anglais, chinois | 21 à 24 |
| I1 à I3 Objets, carnet, regard, monde de Julie | faits | validation des textes | 5 |
| I4 Confort | en partie | sous-titres des sons, historique, aide progressive à revoir | 15 |
| I5 Mise en scène | presque | pluie peinte, transfert, profondeur à trois plans, typographie des temps forts | 1, 6 à 8, 10 à 12 |
| I6 Accessibilité et essais | en partie | VoiceOver, Kobo, Thorium | 15, 16 |

Ce que la mesure ne dit pas, et qu'il faut savoir :

- **Un seul essai sur iPhone a eu lieu** (30 septembre). Ses défauts (le menu d'Apple Books
  au toucher, « Ouvrir », le son muet) ont été corrigés et vérifiés dans Chromium, jamais
  confirmés par Karl sur son téléphone. Tout ce qui a été fabriqué le 3 octobre n'a été vu que
  par les essais automatiques.
- **Personne n'a écouté le livre en entier.** Karl a écouté et approuvé trois sons (la rumeur
  du restaurant, la télévision, la ballade : réponse 51).
- La journée du 3 octobre a fait passer la fabrication d'environ 73 % à environ 93 % du
  périmètre « livre jouable complet », pour un quart de semaine d'usage environ (estimation de
  la session, sans relevé de Karl).

## 2. Les réponses de Karl à reporter (3 octobre au soir)

| Question | Réponse | Ce que ça change | Lot |
|---|---|---|---|
| 45. Qui dit « Il est incroyable. » (5.8) | d'accord | Julie se dispute avec elle-même : rien à changer, à vérifier | 1 |
| 46. La fenêtre de 6.13 | d'accord | celle de 6.7, une seconde à l'ouverture : déjà fait | — |
| 47. Le doigt de dieu (7.1) | « Dieu prend une majuscule et je valide la photo » | une 35e correction à la fabrication ; le rocher de sa photo reste | 1 |
| 48. Les confettis | d'accord | ils restent au sac : déjà fait | — |
| 49. Les repérages | « Il faut me faire une liste de prompt à faire produire par chatgpt dans un style pastel et cohérent avec des productions. » | les 43 images qui manquent ne seront pas photographiées : Karl les fait produire, dans un style pastel accordé aux décors du livre ; depuis le 16 novembre, Codex peut aussi les tirer de ses propres photos : les deux voies sont au lot 2, et Karl tranche | 2, 9 |
| 50. Les photos du Kerala | d'accord sur les sept points | photo pour ce qui est vécu à Aluva, encre pour ce qui est imaginé ; 12 pages changent de décor | 3 |
| 51. Les sons refaits | d'accord (« tes productions sont superbes ») | la rumeur, la télévision et la ballade restent telles quelles | — |

## 3. Les ambitions

**Engagées, et gardées en entier** : tous les mots du livre, à l'identique ; un livre qui se
joue en entier dans Apple Books (iPhone et Mac), Thorium et l'application Kobo, et qui se lit
partout ; chaque geste faisable au toucher simple, au clavier et au bouton ; aucun lecteur
bloqué plus de huit secondes ; EPUBCheck et Ace sans rien ; une passe sonore complète, que l'on
peut couper ; la voix de Karl, alignée sur le texte s'il le veut ; l'édition web ; les dossiers
Apple Books et Kobo ; une bande-annonce ; les traductions anglaise et chinoise ; moins de 60 Mo
avec la voix ; moins d'une heure de Karl par lot ; zéro euro, hors ISBN.

**Relevées, parce que Karl le demande** :

1. Le Kerala rendu à ses photos (réponse 50), et l'encre réservée à l'imaginaire.
2. **L'atelier des photos** (16 novembre) : chacune des photos de Karl que le livre montre (65
   photos, 83 emplois dans les décors) est accordée à sa page par une retouche confiée à Codex :
   une zone calme là où le texte se pose, l'heure et la lumière de la scène, le raccord avec la
   page d'avant et celle d'après. L'original n'est jamais touché ; chaque retouche est notée et
   se défait.
3. **Des états d'une même photo** : le matin, l'or, le crépuscule ; le sec et la pluie ; le
   chaud et le froid. Un effet passe alors d'une vraie image à une autre au lieu de poser un
   filtre : le froid qui s'installe de 6.10 à 6.15, le jour qui tourne à Aluva, la rue de Rungis
   qui se fige.
4. **La profondeur** : là où le traitement la demande, la photo découpée en trois plans (le
   proche, le sujet, le lointain) qui glissent l'un sur l'autre sous le geste.
5. Les 43 images qui manquent tirées d'abord de ses propres photos, retouchées, et produites au
   pastel par ChatGPT seulement là où aucune de ses photos ne peut servir (réponse 49 : Karl
   tranche, les deux voies sous les yeux).
6. Un **carnet d'essai** : une page où Karl note depuis son iPhone, page par page, ce qui
   marche et ce qui cloche, au lieu d'un compte rendu de mémoire.
7. Trois lots de **finition narrative**, chapitre par chapitre, par une vraie équipe créative
   (direction, rythme, lumière, son), avec l'avant et l'après côte à côte.
8. La **musique jouée** par des musiciens là où elle porte l'histoire (la ballade, l'accord du
   père), et des fichiers sonores de secours pour les liseuses.
9. Une accessibilité exemplaire : sous-titres des sons, description de chaque image.
10. La page du livre en trois langues sur karlforterre.fr, et un générique qui mène à ses
    photos sur photos.karlforterre.fr, donc à Pexels.
11. Une bande-annonce et un lancement sur ses réseaux, avec le studio vidéo du dépôt des photos.
12. Les deux traductions, confirmées comme une vraie saison et non plus comme une option.
13. Un carnet de création, et le moteur documenté pour le livre suivant (« Y aurait-il un
    successeur »).
14. Une **mesure chiffrée** à la fin de chaque lot, gardée dans un journal.

## 4. Les règles du plan

- **Un lot par semaine**, ni plus ni moins, de la remise à zéro du samedi au vendredi. Un lot
  qui ne tient pas dans son budget s'arrête proprement ; son reste devient le lot de la semaine
  suivante, et tout le calendrier glisse d'une semaine.
- **Une séance neuve par lot**, au contexte court, ouverte par ALFRED avec la consigne du
  point 6. Tout ce dont la séance a besoin est dans le dépôt.
- **Le budget d'un lot** : petit (5 % de la limite de la semaine), moyen (10 %), grand (15 %).
  Jamais plus de deux équipes à la fois : trois équipes ont épuisé la limite des cinq heures le
  3 octobre.
- **Fini veut dire** : les critères de la fiche du lot, les contrôles du cadre commun, la
  mesure relancée (`mesure.py --journal`), la case cochée ci-dessous, le README à jour, une
  pull request vers `main` et un compte rendu à ALFRED, qui le rapporte à Karl.
- **Karl** décide, essaie, fournit (images, voix, ISBN) et fusionne, ou laisse ALFRED fusionner
  avec son accord. Jamais plus d'une heure de son temps par lot.
- **Ce qui attend Karl ne bloque rien** : le lot échange sa place avec le suivant.
- **Codex et les photos** : Codex ne tourne pas dans les séances du dépôt ; c'est ALFRED, ou
  Karl, qui le lance sur le Mac, avec les consignes que le lot 2 prépare. Une photo retouchée
  n'entre dans le livre qu'avec sa fiche (la photo d'origine, la consigne, la date) ; l'original
  n'est jamais remplacé ; rien n'est ajouté qui change ce que la photo montre (ni personne, ni
  lieu, ni objet inventé) sans que Karl l'ait demandé pour cette image.
- **Le poids reste tenu** : chaque état de plus d'une photo pèse. Le livre jouable ne dépasse
  pas 45 Mo avant la voix, 60 Mo avec.
- **Les fiches des saisons 3 et 4** sont des cadres : ALFRED les précise deux semaines avant,
  d'après ce que les lots précédents auront appris.

## 5. Les lots

Calendrier (cocher la case à la fin du lot : `mesure.py` les compte) :

Saison 1, finir et essayer
- [ ] **Lot 1** (semaine du samedi 21 novembre 2026) : le chapitre 7 s'achève
- [ ] **Lot 2** (28 novembre) : l'atelier des photos, les consignes pour Codex, la liste de prompts
- [ ] **Lot 3** (5 décembre) : le Kerala en photos
- [ ] **Lot 4** (12 décembre) : l'essai d'ensemble et le carnet d'essai
- [ ] **Lot 5** (19 décembre) : les retours de Karl, la version candidate

Saison 2, élever, jusqu'à la version 1.0
- [ ] **Lot 6** (26 décembre) : chaque photo accordée à sa page, chapitres 0 à 2
- [ ] **Lot 7** (2 janvier 2027) : chaque photo accordée à sa page, chapitres 3 à 5
- [ ] **Lot 8** (9 janvier) : chaque photo accordée à sa page, chapitres 6 à 8
- [ ] **Lot 9** (16 janvier) : les 43 images qui manquent entrent dans le livre
- [ ] **Lot 10** (23 janvier) : finition narrative, chapitres 0 à 2
- [ ] **Lot 11** (30 janvier) : finition narrative, chapitres 3 à 5
- [ ] **Lot 12** (6 février) : finition narrative, chapitres 6 à 8
- [ ] **Lot 13** (13 février) : la musique jouée, le mixage, les licences
- [ ] **Lot 14** (20 février) : la voix de Karl
- [ ] **Lot 15** (27 février) : accessibilité et confort
- [ ] **Lot 16** (6 mars) : liseuses, poids, version 1.0

Saison 3, publier
- [ ] **Lot 17** (13 mars) : l'édition classique, l'ISBN, la couverture
- [ ] **Lot 18** (20 mars) : la page du livre sur karlforterre.fr
- [ ] **Lot 19** (27 mars) : la bande-annonce et le lancement
- [ ] **Lot 20** (3 avril) : les librairies numériques

Saison 4, plus loin
- [ ] **Lot 21** (10 avril) : Darshan en anglais, la traduction
- [ ] **Lot 22** (17 avril) : Darshan en anglais, l'édition
- [ ] **Lot 23** (24 avril) : Darshan en chinois, la traduction
- [ ] **Lot 24** (1er mai) : Darshan en chinois, l'édition
- [ ] **Lot 25** (8 mai) : le carnet de création, le moteur pour un autre livre

### Lot 1 : le chapitre 7 s'achève (moyen)

**But** : plus aucun effet ne manque ; le livre est complet de la première à la dernière page.

**À faire** :
1. Les six effets de 7.4 à 7.11 : `partage`, `vacille`, `enjambees`, `ralenti`, `chiasme`,
   `etoiles-jour`, et les trois compléments (la pluie peinte et son accalmie en 7.4, le
   transfert qui jaillit en 7.8, la boussole qui retrouve le nord en 7.10). Leurs mesures et
   leurs pièges sont notés dans `outils/darshan/README.md`, « État à l'arrêt du 3 octobre »,
   point 1 ; zone « chapitre 7 » d'`effets.js`, outil commun `FxD`.
2. Réponse 47 : « adossé au doigt de **Dieu** », 35e entrée de `texte.CORRECTIONS` ; les
   citations qui la reprennent (`decoupage.py`, `objets.ini`, `portes.ini`) ; le découpage
   régénéré.
3. Le son `nuage` (2.10, 5.4) ; le niveau de 2.9, où les battements et la mélodie ensemble
   dépassent de 6 dB avant le plafond (seul défaut relevé par le banc du son le 14 novembre) ;
   vérifier que « Continuer » presse l'horloge en 6.11.
4. Réponse 45 : vérifier en 5.8 les deux voix de Julie (la raison en romain, sans couleur ; le
   cœur en italique), à la même place.
5. `build.py --strict` passe, et entre dans la tâche GitHub ; les boutons nouveaux du banc
   ajoutés à `essai-transitions.js`.

**Fini quand** : 106 effets sur 106 ; aucune alerte à la fabrication ; le livre joué en entier
en mouvement réduit et le chapitre 7 en mouvement normal, sans panne ni « effet inconnu » ; les
pages 7.4, 7.7, 7.8, 7.10 et 7.11 justes quand on les ouvre seules dans l'EPUB.

**Karl** : rien avant. Après, s'il veut : le chapitre 7 sur son iPhone.

### Lot 2 : l'atelier des photos, les consignes pour Codex, la liste de prompts (grand)

**But** : tout est prêt pour que Codex retouche les photos de Karl et pour que les 43 images qui
manquent existent, par l'une ou l'autre voie ; le livre sait accueillir ce qui revient.

**À faire** :
1. **Le guide de l'image** : la palette, le grain et le trait tirés des décors du livre
   (`art.py`, `decors.py`), dits en mots simples et montrés sur une planche ; les règles de
   chaque image : en hauteur (2 sur 3, 1600 sur 2400), la zone du texte laissée calme (en bas ou
   en haut selon la page), aucun visage, aucun texte, aucune marque, une seule lumière.
2. **Le relevé des photos** : un tableau écrit par un programme (`outils/darshan/atelier.py`,
   dans `docs/darshan-atelier-photos.md`) : pour chacun des 83 emplois, la page, la phrase
   qu'elle porte, ce que le traitement lui demande, ce qui gêne aujourd'hui (texte sur une zone
   chargée, lumière qui contredit l'heure, raccord qui saute), et la retouche proposée.
3. **Les consignes pour Codex** : une par retouche, prêtes à lancer, avec le fichier de départ,
   ce qui doit changer, ce qui ne doit pas bouger, le nom du fichier attendu. Trois familles :
   accorder (lumière, heure, zone calme), décliner (les états d'une même photo), découper (les
   trois plans). Dix retouches d'essai d'abord, sur des pages très différentes, avant d'en
   lancer quatre-vingts.
4. **La liste de prompts au pastel** pour ChatGPT (réponse 49), image par image, pour celles des
   43 qu'aucune photo de Karl ne peut donner ; pour les autres, la photo de départ et la
   consigne pour Codex. Les dix qui comptent le plus d'abord (la main de Julie, la rue de
   Rungis, le pain perdu et le tartare de saumon, la lettre, le mur de torchis, le couloir
   d'hôpital, la maison de lierre, la Charlotte aux framboises, les lunettes, le paquet au ruban
   rouge).
5. **L'accueil** : dans `livre.py`, les genres `retouche` (une photo de Karl retouchée, avec le
   numéro de sa photo d'origine) et `image` (une image produite) ; un passage commun (grain,
   format, WebP) ; un contrôle à la fabrication : toute retouche a sa fiche, tout fichier a la
   bonne taille, le poids total reste sous le plafond ; la façon d'envoyer les fichiers (un lien
   SwissTransfer donné à ALFRED, comme pour ses photos).
6. La règle du projet mise à jour, et la question posée à Karl : comment le générique nomme une
   photo retouchée, et une image produite.

**Fini quand** : une retouche d'essai et une image d'essai traversent tout le circuit jusqu'à
leur page, avec leur fiche ; ALFRED peut lancer Codex sans rien demander à la séance.

**Karl** : regarder les dix retouches d'essai, avant et après, et dire jusqu'où Codex peut
aller ; trancher, image par image ou d'un mot, entre ses photos retouchées et le pastel de
ChatGPT ; dire comment le générique les nomme.

### Lot 3 : le Kerala en photos (moyen)

**But** : Aluva retrouve la lumière des photos de Karl (réponse 50, d'accord sur les sept
points), et ces photos sont les premières accordées à leur page par l'atelier du lot 2.

**À faire** : le principe « photo pour ce qui est vécu, encre pour ce qui est imaginé ou
raconté » inscrit dans la synthèse et le README ; onze décors passent d'`encre(…)` à
`photo(…)` dans `livre.DECORS` (pages 1.5 à 1.9, 3.9, 3.10, 3.12 à 3.14, 7.6 ; `periyar` sert
aussi en 7.4) ; 1.4 garde son local dessiné (kayaks, tonneau, coutelas) avec le canal du
Marais poitevin (photo 10303311) par l'ouverture ; le soir de 3.12 à 3.14 sur la rivière claire
(10220497), de l'orange au violet ; le marché de 5.2 à 5.5 avec le jardin de palmiers au
naturel (34342144) derrière les étals dessinés ; 3.11, 7.7 et 7.8 ne bougent pas. Les planches
montrées à Karl sont jointes à la page « Décisions pour Darshan » (fichiers `kerala/…`). Les
effets réglés sur les encres (l'eau de 3.9, le reflet de 1.7, les éclaboussures, le froid) sont
mesurés de nouveau sur les photos ; le texte doit rester lisible sur chaque page. Le jour d'Aluva
tourne par des états d'une même photo (le matin de 1.5, l'or de 1.8, le crépuscule de 1.9, le
soir de 3.12 à 3.14) plutôt que par un filtre, si les retouches d'essai du lot 2 ont convaincu
Karl.

**Fini quand** : les 19 pages du Kerala photographiées avant et après, en mouvement normal et
réduit ; aucune photo présentée comme l'Inde (les légendes et le générique disent une rivière,
un ponton, un filet, un feu).

**Karl** : regarder la planche avant et après, dire ce qui ne va pas.

### Lot 4 : l'essai d'ensemble et le carnet d'essai (grand)

**But** : le livre entier est éprouvé partout où une machine peut l'éprouver, et Karl a de
quoi l'essayer sur son iPhone en notant tout, sans effort.

**À faire** :
1. Les passes complètes : mouvement normal sur tout le livre ; clavier seul ; grand texte ;
   sans script ; chacune des 85 pages ouverte seule dans l'EPUB ; le son joué en entier au
   rythme d'un lecteur (`essai-son.js --livre --rythme 4`) ; la mémoire et le nombre de toiles
   page par page.
2. L'EPUB jouable ramené sous 30 Mio (il en fait 30,4), pour qu'une séance puisse l'envoyer à
   Karl directement.
3. **Le carnet d'essai** : une page pour Karl (comme « Décisions pour Darshan »), une ligne par
   page du livre, avec « ça marche », « ça cloche » et une note ; en tête, les cinq choses à
   regarder d'abord (le toucher ne montre plus le menu d'Apple Books, « Ouvrir », le son, les
   gestes, aucune page qui tourne par accident).
4. Tout ce que les passes révèlent est corrigé, ou inscrit au lot 5.

**Fini quand** : toutes les passes sont vertes ; le carnet est en ligne ; l'EPUB est envoyé.

**Karl** : une heure, dans la semaine ou la suivante : lire le livre sur son iPhone, carnet
ouvert.

### Lot 5 : les retours de Karl, la version candidate (moyen)

**But** : ce que Karl a vu sur son iPhone est corrigé ; les textes d'interface sont les siens.

**À faire** : chaque ligne « ça cloche » du carnet d'essai, reproduite, corrigée, rejouée ; les
48 textes d'interface marqués « à valider par Karl » présentés sur une page (le texte, où il
paraît, « d'accord » ou sa version) et reportés dans `interface.ini` ; ses avis sur le pli de
3.4, la lanterne, l'eau de 3.9 et le fondu des pages qui gardent leur plan ; l'étiquette
« 0.9 » posée sur cette version.

**Fini quand** : plus aucune ligne ouverte au carnet ; plus aucune marque « à valider ».

**Karl** : vingt minutes pour les textes ; un second passage sur les pages corrigées.

### Lots 6, 7 et 8 : chaque photo accordée à sa page (grands)

**But** : aucune photo du livre n'est plus posée telle quelle : chacune sert la phrase qu'elle
porte. Lot 6 : chapitres 0 à 2. Lot 7 : chapitres 3 à 5. Lot 8 : chapitres 6 à 8.

**À faire**, d'après le relevé du lot 2 : ALFRED lance Codex sur les consignes du lot ; la
séance reçoit les fichiers, vérifie chacun contre sa consigne (ce qui devait changer a changé,
rien d'autre n'a bougé, aucune personne ni aucun objet n'est apparu), les fait entrer dans le
livre avec leur fiche, puis règle de nouveau les effets de la page sur la nouvelle image. Les
états d'une même photo remplacent les filtres là où ils racontent mieux (le froid de 6.10 à
6.15, la rue de Rungis qui se fige et reprend ses couleurs). Les trois plans sont découpés là
où le traitement demande de la profondeur. Chaque page a son avant et son après sur une
planche ; une retouche que Karl refuse est défaite d'une ligne.

**Fini quand** : toutes les photos du lot sont passées en revue, avec une ligne chacune (gardée
telle quelle, ou retouchée et pourquoi) ; le texte se lit sur chaque page sans voile ajouté ; le
poids reste sous le plafond.

**Karl** : regarder la planche du lot ; dire les photos qu'il préférait avant.

### Lot 9 : les 43 images qui manquent entrent dans le livre (moyen)

**But** : plus aucune image d'attente floue.

**À faire** : chaque image reçue, tirée d'une photo de Karl par Codex ou produite au pastel,
passe le circuit du lot 2 ; le flou d'attente se retire de sa page ; les effets de la page sont
réglés sur la nouvelle image (la main de Julie qui se retire en 2.1 et de 6.10 à 6.13, la
lettre de 7.7, la vitrine embuée de 5.11) ; une planche avant et après ; la liste de ce qui
manque encore tenue à jour.

**Fini quand** : toutes les images reçues sont dans le livre et vues par Karl.

**Karl** : avoir produit ou approuvé les images. Sinon ce lot échange sa place avec le suivant ;
les images tardives entrent à n'importe quel lot.

### Lots 10, 11 et 12 : la finition narrative (grands)

**But** : chaque page dit ce que dit la phrase, au bon moment, avec la justesse d'un film
monté. Lot 10 : chapitres 0 à 2 (Karl aimait 0.1 à 1.4 : ne rien dénaturer). Lot 11 : chapitres
3 à 5. Lot 12 : chapitres 6 à 8 (les sommets : l'attente de 6.11, le baiser, la rue de Rungis,
la clôture).

**À faire**, page par page, comme une vraie équipe créative (direction, rythme, lumière, son,
accessibilité) : relire le traitement de la page et la jouer en mouvement normal ; noter ce
qui traîne, ce qui va trop vite, ce qui couvre le texte, ce qui ne raconte rien ; corriger la
durée et la courbe des mouvements, les raccords d'une page à l'autre, la place du texte, la
typographie des temps forts, le niveau des sons ; demander une retouche de plus à l'atelier
des photos quand c'est l'image qui gêne ; ne rien ajouter qui ne serve pas la phrase.
Chaque page retouchée a son avant et son après, côte à côte, sur une planche pour Karl.

**Fini quand** : toutes les pages du lot sont passées en revue, avec une ligne de compte rendu
chacune (rien à changer, ou ce qui a changé et pourquoi) ; Karl préfère la nouvelle version.

**Karl** : regarder les planches ; dire les pages qu'il préférait avant.

### Lot 13 : la musique jouée, le mixage, les licences (moyen)

**But** : là où la musique porte l'histoire, on entend des musiciens ; le son du livre est
équilibré d'un bout à l'autre et marche dans toutes les liseuses.

**À faire** : pour la ballade (5.7, 7.10) et l'accord du père, chercher des enregistrements de
musiciens du domaine public ou sous CC0, source et licence notées, ou accueillir un
enregistrement fait par un proche de Karl ; les faire écouter à Karl à côté de la version
d'aujourd'hui, qu'il a approuvée : il choisit ; des fichiers sonores de secours (AAC et MP3)
pour les liseuses où le son fabriqué se tait ; le mixage du livre entier, page par page ; le
fichier des licences (`outils/darshan/LICENCES.md`).

**Fini quand** : chaque page a son son, que l'on peut couper ; aucune crête au-dessus de −1 dB ;
chaque son venu d'ailleurs a sa source et sa licence.

**Karl** : écouter et choisir. Avant le lot : dire si un musicien de son entourage veut jouer.
C'est aussi le moment de **demander l'ISBN** à l'AFNIL s'il en veut un (trois semaines).

### Lot 14 : la voix de Karl (moyen)

**But** : la dédicace dite par Karl ; et, s'il le décide, le livre lu par son auteur, aligné
sur le texte.

**À faire** : la dédicace, enregistrée par Karl au Dictaphone de l'iPhone, posée sur la page de
titre (on peut ne pas l'écouter) ; s'il choisit de lire le livre (une heure environ) : la
lecture alignée phrase à phrase dans l'EPUB (la lecture synchronisée d'Apple Books) et dans
l'édition web, les sons baissés sous la voix. Aucune voix de synthèse, jamais.

**Fini quand** : la dédicace s'entend dans Apple Books ; le livre pèse moins de 60 Mo.

**Karl** : décider (la dédicace seule, les deux poèmes aussi, ou tout le livre) et enregistrer.

### Lot 15 : accessibilité et confort (moyen)

**But** : un lecteur aveugle, sourd, ou simplement pressé, lit tout le livre.

**À faire** : le livre entier à VoiceOver et au clavier ; les sous-titres des sons (« la porte
grince »), textes à valider par Karl ; la description de chacun des 115 décors ; le grand
texte sur un petit iPhone ; l'historique de ce qu'on a lu ; l'aide qui débloque en huit
secondes ; Ace et un contrôle d'accessibilité sur l'édition web.

**Fini quand** : aucune page ne bloque VoiceOver ; Ace sans erreur grave ; chaque son a son
sous-titre.

**Karl** : valider les sous-titres ; un essai à VoiceOver, s'il le veut.

### Lot 16 : liseuses, poids, version 1.0 (moyen)

**But** : la version que Karl approuve.

**À faire** : le livre joué dans Apple Books (iPhone, Mac), Thorium et l'application Kobo, avec
le tableau de ce qui marche où ; ce qui ne marche pas quelque part se replie proprement (le
texte se lit partout) ; le poids et la fluidité sur un téléphone ancien ; les dernières
retouches ; l'étiquette « 1.0 ».

**Fini quand** : Karl approuve la version finale.

**Karl** : une dernière lecture.

### Lot 17 : l'édition classique, l'ISBN, la couverture (petit)

Le colophon, les libellés, la date d'édition, la langue de दर्शन ; l'ISBN de Karl dans les deux
éditions ; la couverture (celle de 2023 sans les logos de la SEP et de Cheminement, ou une
nouvelle) ; les métadonnées d'accessibilité. **Karl** : avoir reçu son ISBN ; choisir la
couverture.

### Lot 18 : la page du livre sur karlforterre.fr (moyen)

Une page `/darshan/` en français, anglais et chinois (comme `/memoire/`, par
`outils/pages-langues.py`) ; l'édition web en ligne, écrite par une tâche GitHub, sans rien à
lancer soi-même ; les deux EPUB à télécharger ; les données structurées du livre, le plan du
site, `llms.txt` ; le générique dont chaque photo mène à sa page sur photos.karlforterre.fr.
**Karl** : donner son accord pour la mise en ligne : c'est le jour où le livre devient public.

### Lot 19 : la bande-annonce et le lancement (moyen)

Des extraits filmés du livre joué, montés en 9:16 et 3:4 par le studio vidéo du dépôt
PexelsWillwonder (`reseaux/videos/studio.py`), sur une musique jouée ; les publications pour
RedNote, Facebook et Instagram dans le style de Karl ; une page pour la presse. **Karl** :
publier ce qui se publie à la main.

### Lot 20 : les librairies numériques (petit)

Les dossiers Apple Books et Kobo, leurs contrôles, un mode d'emploi pas à pas. **Karl** : créer
ou ouvrir ses comptes, déposer.

### Lots 21 à 24 : l'anglais, puis le chinois (grands)

Pour chaque langue, deux lots : la traduction (le texte entier, les fiches d'objets et de
portes, les textes d'interface), relue par Karl et par un lecteur de la langue, puis l'édition
(fabrication par langue, polices du chinois allégées et hébergées, essais, page du site). Le
texte français reste la référence : une traduction ne s'écrit jamais sans relecture humaine.
**Karl** : trouver un relecteur par langue ; relire.

### Lot 25 : le carnet de création, le moteur pour un autre livre (moyen)

Une page qui raconte comment le livre a été fait (la mise en scène, les décisions de Karl, les
images), et un mode d'emploi du moteur pour commencer un autre texte : découpage, réglages,
fabrication. **Karl** : dire quel texte viendrait après.

## 6. La consigne d'un lot, à coller dans une séance neuve

```
Darshan jouable, lot N du plan par lots. Travaille et échange en français.

Lis d'abord docs/plan-darshan-lots.md : les règles (point 4), le cadre commun (point 7) et la
fiche du lot N ; puis outils/darshan/README.md (« Chantier en cours ») et
docs/darshan-passation.md (« Pièges connus »). Fais le lot N en entier, dans l'ordre de sa
fiche : enregistre et pousse après chaque étape vérifiée, pour qu'un arrêt soit toujours
propre. Arrête-toi proprement si le budget du lot est atteint, et dis ce qui reste.

À la fin : les contrôles du cadre commun ; python3 outils/darshan/mesure.py --journal "Lot N" ;
la case du lot cochée dans le plan ; le README à jour (fait, reste) ; une pull request vers
main ; un compte rendu court pour ALFRED et Karl (ce qui est fait, ce qui se voit, ce que Karl
doit faire, avec les photos des pages clés).
```

## 7. Le cadre commun des séances

**Règles du livre**, qui ne se discutent pas : le texte du livre n'est jamais modifié ni
inventé (seules les coquilles acceptées par Karl sont corrigées, à la fabrication, dans
`texte.CORRECTIONS`) ; le père ne parle jamais ; aucune voix de synthèse ni voix métallique ;
la musique humaine d'abord ; les images sont les photos de Karl (fichiers de images.pexels.com
seulement : jamais une page de pexels.com ni l'API) ou des images qu'il a fait produire ;
aucun texte d'interface en dur (`interface.ini`, huit mots au plus, précédé de « # à valider
par Karl ») ; rien de monarchiste ni de conservateur ; le dépôt est public : ni TIFF, ni PSD,
ni PDF d'impression, ni clé.

**Règles du moteur** : JavaScript de 2017, sans dépendance ; mouvement réduit (classe `calme`) :
des fondus, rien qui bouge ; trois toiles animées au plus par page, à la définition la plus
basse qui suffit ; tout s'arrête avec la page (l'édition web garde les 85 pages dans un seul
document) ; toute erreur rattrapée (`signaler`) ; Apple Books isole chaque page : un état qui
dure vient de `build.py` (attributs `data-*`), jamais d'une variable ; un toucher qui sert au
livre passe par `installerTouchers` (`depart.js`) ; aucun long glissement horizontal ; sur
iPhone le son ne s'autorise qu'au doigt levé ; un filtre CSS, même nul, rogne les italiques :
écrire `none`.

**Lire avec économie** : `synthese.md` fait 190 Ko, les traitements 70 à 170 Ko chacun,
`effets.js` plus de 4 000 lignes. Chercher la partie utile (`grep -n`), ne lire qu'elle. Lire
l'en-tête de chaque fragment du moteur avant d'écrire : ne jamais refaire un outil qui existe
(`Fx`, `FxA`, `FxB`, `Fx6`, `FxD`, `Gestes`, `Recit`, `Transitions`, `Visuels`, `Son`,
`Objets`, `Carnet`, `Compte`, `ui`).

**Contrôles**, depuis `outils/darshan/` :

```
python3 build.py --strict        # 85 pages, aucune alerte (sans --strict avant la fin du lot 1)
python3 classique.py
curl -sSfL -o /tmp/e.zip https://github.com/w3c/epubcheck/releases/download/v5.4.0/epubcheck-5.4.0.zip && unzip -q -o /tmp/e.zip -d /tmp
java -jar /tmp/epubcheck-5.4.0/epubcheck.jar --failonwarnings dist/darshan-jouable.epub
java -jar /tmp/epubcheck-5.4.0/epubcheck.jar --failonwarnings dist/darshan.epub
export NODE_PATH=/opt/node22/lib/node_modules
node essai-livre.js calme            # tout le livre ; « calme 3.9 3.11 » : de 3.9 à 3.11
node essai-livre.js normal 7.1 7.11  # les pages du lot, en mouvement normal
node essai-touchers.js
node essai-transitions.js
node essai-son.js --livre --rythme 4 # si le lot touche au son
python3 mesure.py --journal "Lot N"
```

Les photos de fin de page sont dans `captures/livre/` : les regarder. Une page se juge aussi
ouverte seule dans l'EPUB (`dist/epub/EPUB/xhtml/pNNN.xhtml`). Chromium ne charge pas les
images de images.pexels.com à travers le proxy : les télécharger par curl et les servir par
`page.route`.

**Images** : `decors.py` et `images.py` ont besoin de Pillow, que le `python3` courant d'une
séance ne trouve pas toujours (constaté le 16 novembre) : les lancer par `/usr/bin/python3`.
`build.py`, `classique.py` et `mesure.py` n'en ont pas besoin. Codex n'est pas dans les séances :
une séance prépare les consignes et vérifie les fichiers reçus, ALFRED ou Karl lance Codex.

**Équipes** : deux au plus à la fois, chacune dans sa copie (`git worktree`), sur ses fichiers ;
Chromium sous un verrou commun (`flock`) ; le modèle le plus fin pour les sommets narratifs, un
modèle plus économe pour les séries, relu par le premier ; chaque équipe enregistre après
chaque étape vérifiée et rend un rapport court.

**Git** : la branche de la séance, une pull request vers `main` par lot ; jamais d'envoi forcé
ni d'historique réécrit ; après une fusion « squash », repartir de `main`.

## 8. Ce que Karl a à faire, et quand

| Quand | Quoi | Temps |
|---|---|---|
| Maintenant | fusionner la pull request de ce plan | 1 min |
| Après le lot 2 (début décembre) | regarder les dix retouches d'essai de Codex, avant et après ; dire jusqu'où il peut aller ; choisir entre ses photos retouchées et le pastel de ChatGPT pour les images qui manquent ; dire comment le générique les nomme | 30 min |
| Lot 3 | regarder le Kerala avant et après | 15 min |
| Lot 4 (mi-décembre) | lire le livre sur son iPhone, carnet d'essai ouvert | 1 h |
| Lot 5 | valider les textes d'interface ; revoir les pages corrigées | 30 min |
| Lots 6 à 8 (fin décembre, janvier) | regarder la planche des photos de chaque lot ; dire celles qu'il préférait avant | 15 min par lot |
| Avant le lot 9 (mi-janvier) | avoir produit ou approuvé les images qui manquent, à son rythme | par petites séances |
| Lots 10 à 12 (fin janvier, février) | regarder les planches de la finition | 15 min par lot |
| Avant le lot 13 (mi-février) | dire si un musicien de son entourage veut jouer ; demander l'ISBN à l'AFNIL s'il en veut un | 20 min |
| Avant le lot 14 (fin février) | décider de la voix, enregistrer | 10 min, ou 1 h pour tout le livre |
| Lot 16 (début mars) | approuver la version 1.0 | 1 h |
| Lot 18 (fin mars) | donner son accord pour la mise en ligne | — |
| Lots 19 et 20 (fin mars, avril) | publier, déposer en librairie | 1 h |
| Avant le lot 21 | trouver un relecteur pour l'anglais, puis pour le chinois | — |

## 9. Les risques

| Risque | Garde-fou |
|---|---|
| Ce qui a été corrigé pour l'iPhone ne marche pas sur l'iPhone | le lot 4 arrive tôt ; le carnet d'essai dit quoi, où ; l'édition web et l'édition classique restent |
| Les images produites, ou retouchées, jurent avec les photos et les encres | le guide du pastel, un passage commun sur chaque image, une planche d'ensemble avant d'en produire quarante |
| Une photo retouchée ne montre plus ce que Karl a photographié | l'original n'est jamais remplacé ; chaque retouche a sa fiche et se défait d'une ligne ; rien n'est ajouté qui change le sujet ; dix essais vus par Karl avant d'en lancer quatre-vingts |
| Codex retouche sans que personne ne regarde | une séance vérifie chaque fichier contre sa consigne ; une planche avant et après par lot ; Karl dit les photos qu'il préférait avant |
| Les états d'une même photo font grossir le livre | plafond de 45 Mo avant la voix, contrôlé à la fabrication ; un état n'entre que s'il raconte mieux qu'un filtre |
| Le générique dit « photographies » pour des images produites | texte du générique à valider par Karl au lot 2 ; conditions d'usage de ChatGPT et de Codex relues avant la parution (lot 17) |
| Le Kerala en photos déplace le sens de l'encre | le principe est écrit (vécu, imaginé) ; 1.7, 2.3, 6.4, 7.8, 7.15 et 8.1 relus au lot 3 |
| La limite d'usage coupe une séance | deux équipes au plus ; tout est poussé à chaque étape ; le lot glisse d'une semaine |
| Une séance neuve refait ce qui existe | cadre commun, README, mesure ; la consigne impose de lire avant d'écrire |
| La finition devient de l'ornement | la règle de Karl : la dimension narrative et expressive d'abord ; rien qui ne serve la phrase |
| Les traductions trahissent le texte | relecture humaine obligatoire ; le français reste la référence |
