# Darshan jouable : les trois sessions qui restent

Consignes à coller, chacune dans une session Claude Code distincte, sur le dépôt
Willwonderc/karlforterre.fr (état au 30 septembre 2026). Les sessions 1 et 2 peuvent tourner en
même temps : leurs fichiers ne se recouvrent pas. La session 3 commence en même temps pour sa
première partie ; sa seconde partie (les essais d'ensemble) attend que les pull requests des
sessions 1 et 2 soient fusionnées. Estimation : 20 à 30 % d'une semaine d'usage en tout (session
1 : 8 à 11 %, session 2 : 6 à 9 %, session 3 : 7 à 10 %).

---

## Session 1 : les effets

```
Darshan jouable, session 1 sur 3 : les effets. Travaille et échange en français.

Contexte : lis d'abord outils/darshan/README.md (« Chantier en cours », puis « Reprendre
après la pause », points 1, 2 et 4 bis), docs/darshan-mise-en-scene/synthese.md (partie 3,
« Cahier des charges du moteur », qui fait foi), la partie 13 de
docs/darshan-mise-en-scene/README.md (décisions de Karl, dont l'orientation du 30 septembre),
et, pour chaque page, le traitement de son chapitre (docs/darshan-mise-en-scene/chapitre-N.md).
Orientation de Karl : la dimension narrative et expressive d'abord. Chaque effet sert le
texte à ce moment précis, comme le traitement le décrit ; pas d'effet gratuit.

Tes fichiers, et seulement eux : outils/darshan/src/js/effets.js, ta section de
outils/darshan/src/moteur.css (à la fin du fichier), et dans outils/darshan/build.py
l'attribut data-genre (photo, encre, dessin, uni) sur chaque plan. Dans livre.py, seulement
les réglages d'effets E(...) des pages existantes, s'il le faut. Ne touche pas à scenes.js,
transitions.js, mecaniques.js ni son.js : une autre session écrit les scènes et les
transitions en même temps, une autre le son.

À faire, dans l'ordre des chapitres (1 puis 2… puis 7), en enregistrant et en poussant
chapitre par chapitre :
1. data-genre dans build.py.
2. Les 71 effets qui manquent (build.py les liste : « effet … pas encore écrit »).
3. Les compléments des effets déjà là (liste au point 2 du README).
4. Les branchements que mecaniques.js attend (partage, ruban, reflet, decor, couche
   horloge), et ce que les mécaniques posent pour les effets (scene.coeur, scene.paupieres,
   scene.galerie, scene.cle, Gestes.rose, .cicatrice-porte, e.geste).
Mesures déjà relevées : au point 2 du README (éclipse de 7.11, esquisse de 2.10, saigne de 6.4).

Règles : le texte du livre n'est jamais modifié ; le père ne parle jamais ; aucun texte
d'interface en dur (ui('cle') et interface.ini, 8 mots au plus, marqués « à valider par
Karl ») ; mouvement réduit (classe calme) ; trois toiles animées au plus par page ; tout
s'arrête avec la page (l'édition web garde les 85 pages dans un seul document) ; toute erreur
rattrapée (signaler) ; JavaScript de 2017, sans dépendance ; Apple Books isole chaque page,
et les touchers passent par installerTouchers (depart.js).

Vérifications à chaque étape : python3 outils/darshan/build.py (plus aucun « effet … pas
encore écrit » à la fin) ; EPUBCheck avec --failonwarnings ; depuis outils/darshan/,
NODE_PATH=… node essai-livre.js (calme) puis essai-livre.js normal, jusqu'à la dernière page
sans panne ni « effet inconnu » ; essai-touchers.js ; regarde les photos de tes pages
(captures/livre/) et corrige ce qui se lit mal. Tu peux confier des chapitres à des
sous-agents, trois au plus à la fois, chacun sur ses fonctions.

Usage : au début, demande à Karl le pourcentage de sa limite hebdomadaire et convenez d'un
seuil d'arrêt ; chaque étape vérifiée est enregistrée et poussée, pour qu'un arrêt soit
toujours propre (README mis à jour : ce qui est fait, ce qui reste). À la fin : une pull
request vers main, avec les photos des pages clés.
```

---

## Session 2 : les scènes, les transitions et les réponses de Karl

```
Darshan jouable, session 2 sur 3 : les scènes écrites à la main, les transitions et les
réponses de Karl. Travaille et échange en français.

Contexte : lis d'abord outils/darshan/README.md (« Chantier en cours », puis « Reprendre
après la pause », points 3, 5 et 7), docs/darshan-mise-en-scene/synthese.md (parties 3.4
et 12, qui font foi), la partie 13 de docs/darshan-mise-en-scene/README.md (décisions de
Karl, dont ses réponses aux 44 questions et l'orientation du 30 septembre), et le traitement
des chapitres concernés (docs/darshan-mise-en-scene/chapitre-N.md). Orientation de Karl : la
dimension narrative et expressive d'abord.

Tes fichiers : outils/darshan/src/js/scenes.js, outils/darshan/src/js/transitions.js, ta
section de outils/darshan/src/moteur.css (juste avant la section « mécaniques ») ; pour les
réponses de Karl, mecaniques.js et les réglages des pages dans livre.py ; les textes nouveaux
dans interface.ini (8 mots au plus, marqués « à valider par Karl »). Ne touche pas à
effets.js (une autre session écrit les effets en même temps : appelle-les par jouerEffet,
un effet encore absent est ignoré) ni à son.js.

À faire, en enregistrant et en poussant scène par scène :
1. Les cinq scènes nouvelles : plier (3.4) ; vision (3.10, 3.11) ; listes (6.2, qui fournit
   scene.listes = {darshan, julie}) ; rue-de-rungis (7.12 à 7.15 : chaque page s'ouvre sur
   l'état où la précédente s'arrête ; lueurs sur les façades de rue-soleil, x 0 à 330 et
   950 à 1200, y 1300 à 1700) ; cloture (8.1 et « Fin » : générique, planche
   fin-photos.webp, « Nouvelle lecture »).
2. Les retouches des scènes du prototype : l'appel lettre à lettre en 1.1, les tuiles sans do
   dièse, tourner et autre-cote au pigeonnier (qui peut passer g.tourne).
3. Les transitions bandes-photo (2.1, 6.1) et bandes-julie (4.1 ; 5.1 avec palette lilas et
   grain confettis), jouables dans le banc transitions.html.
4. Les réponses de Karl : Darshan commande le dessert (2.7, une carte, un geste de plus) ; la
   chemise boutonnée (1.8, au lieu d'enfilée par la tête) ; Jivan (1.5 : son nom veut dire
   « la vie », un effet élégant en lien, sans jamais le nommer avant le texte) ; et les petits
   réglages du point 5 du README (1.9, 7.10, 1.2, 6.13, 3.10), à trancher d'après les traitements.

Règles : le texte du livre n'est jamais modifié ; le père ne parle jamais ; chaque page
ouverte seule dans l'EPUB doit être juste (Apple Books isole les pages : un état qui dure
vient de build.py) ; aucun long glissement horizontal ; clavier et mouvement réduit pour
chaque geste ; tout s'arrête avec la page ; les touchers passent par installerTouchers
(depart.js) ; JavaScript de 2017. Karl aimait les pages 0.1 à 1.4 : ne les dénature pas.

Vérifications : build.py (plus aucune « scène … pas encore écrite ») ; EPUBCheck avec
--failonwarnings ; essai-livre.js calme puis normal, jusqu'à « Fin » sans panne (la page 8.1
doit se terminer) ; essai-touchers.js ; les pages 3.11, 7.13, 7.14 et 7.15 ouvertes seules dans
Chromium s'ouvrent comme la précédente s'arrête ; regarde les photos de tes pages.

Usage : au début, demande à Karl le pourcentage de sa limite hebdomadaire et convenez d'un
seuil d'arrêt ; chaque étape vérifiée est enregistrée et poussée (README à jour). À la fin :
une pull request vers main, et l'EPUB jouable envoyé à Karl pour qu'il l'essaie sur l'iPhone.
```

---

## Session 3 : le son, les photos, les questions à Karl, puis les essais d'ensemble

```
Darshan jouable, session 3 sur 3 : le son, les photos, le second tour de questions à Karl,
puis les essais d'ensemble. Travaille et échange en français.

Contexte : lis d'abord outils/darshan/README.md (« Chantier en cours », puis « Reprendre
après la pause », points 4, 4 bis, 6, 7 et 8), docs/darshan-mise-en-scene/synthese.md
(parties 5, 9 et 10), et la partie 13 de docs/darshan-mise-en-scene/README.md. Orientation de
Karl (30 septembre) : aucune voix de synthèse ni aucune voix qui sonne métallique ; le son
fabriqué par programme peut rester s'il est probant ; la musique humaine est à privilégier
(enregistrements de musiciens, du domaine public ou sous CC0, source et licence notées) ;
ses photos d'abord ; la dimension narrative et expressive avant tout.

Tes fichiers : outils/darshan/src/js/son.js et essai-son.js ; decors.py, art.py et les
entrées DECORS de livre.py ; la page « Décisions pour Darshan »
(https://claude.ai/artifact/R6w5GfzURGNoAageW1gGkK, réponses dans sa base, collection
« reponses »). Ne touche pas à effets.js, scenes.js, transitions.js ni mecaniques.js : deux
autres sessions y travaillent en même temps.

Première partie (tout de suite) :
1. Le son. Écoute d'abord ce qui imite une conversation, la rumeur du restaurant (2.1 à 2.7)
   et la télévision de 7.2 : si c'est métallique, adoucis, ou remplace par de vraies prises de
   son sous CC0 (en fichiers, ce qui règle aussi le risque d'Apple Books pour Web Audio).
   Fais écouter à Karl ces deux ambiances et la ballade de 5.7 (des fichiers rendus par le
   banc) : la ballade reste si elle le convainc, sinon une vraie chanson italienne jouée par
   des musiciens, à choisir avec lui. Puis la liste du point 4 du README (sons ponctuels,
   couches, Son.niveau, Son.note('montantes'), horloge qui presse, ralenti de 7.10, deux
   ambiances à la fois, couches arrêtées au changement de page).
2. Les photos d'abord : pour le Kerala (19 pages) et ailleurs, montre à Karl ce qui est fait
   (une planche des pages) et propose-lui un plan qui privilégie ses photos, même prises
   ailleurs, là où elles portent honnêtement la scène, et des dessins seulement où rien ne
   convient. N'applique qu'avec son accord.
3. Le second tour de questions, sur la même page « Décisions pour Darshan », numéros 45 à 50
   (les réponses 1 à 44 restent intactes) : les questions 12, 19, 23, 25 et 43 mieux
   expliquées, avec les passages du livre cités exactement (le README les résume), et le plan
   du Kerala. Lis ses réponses et reporte-les.

Seconde partie (quand les pull requests des sessions 1 et 2 sont fusionnées) : les essais
d'ensemble. essai-livre.js calme et normal, essai-touchers.js, les pages de l'EPUB au
clavier, grand texte, sans script ; une fiche d'essai pour Karl (iPhone, Apple Books :
touchers, son, gestes, aucun geste qui tourne la page) avec l'EPUB à jour ; corrige ce
qu'il rapporte.

Règles : le texte du livre n'est jamais modifié ; le père ne parle jamais ; les photos sont
celles de Karl, prises sur images.pexels.com seulement (jamais de page de pexels.com ni
d'API) ; aucun fichier TIFF, PSD ni PDF d'impression dans le dépôt, qui est public.

Vérifications : essai-son.js (chaque ambiance, couche et effet ; niveaux sous la lecture) ;
build.py ; EPUBCheck avec --failonwarnings ; essai-livre.js jusqu'à la dernière page sans panne.

Usage : au début, demande à Karl le pourcentage de sa limite hebdomadaire et convenez d'un
seuil d'arrêt ; chaque étape vérifiée est enregistrée et poussée (README à jour). À la fin :
une pull request vers main.
```
