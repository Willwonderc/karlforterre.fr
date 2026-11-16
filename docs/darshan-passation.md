# Darshan jouable : passation à ALFRED

Écrit le 14 novembre 2026, tenu à jour depuis (voir « Progressions », en bas), par la session qui a fabriqué le livre jouable (du 28 septembre au
3 octobre), pour la session **ALFRED en poste**, qui mène le projet à partir d'aujourd'hui.

Karl a demandé trois choses : mesurer ce qui est fait ; un plan qui découpe le travail en lots,
un par semaine, « sans réduire les ambitions qui sont engagées, au contraire » ; et la passation
à ALFRED. La mesure et le plan sont dans [plan-darshan-lots.md](plan-darshan-lots.md). Cette
page dit comment reprendre.

## Le projet en dix lignes

*Darshan* est une nouvelle de Karl Forterre (8 404 mots, parue en 2023). Le projet en fait un
livre qui se joue : un EPUB en pages fixes pour Apple Books, et une édition web, où le lecteur
fait avancer le texte par des gestes (tracer une moustache de mousse, tourner une clé, souffler
sur des braises), avec des décors tirés des photos de Karl, des effets, du son, un sac d'objets
et un carnet des portes. Le texte n'est jamais modifié. À côté, une édition classique, qui se
lit partout. Tout est fabriqué par des programmes Python et JavaScript sans dépendance
(`outils/darshan/`), contrôlé par une tâche GitHub, et relié pour l'instant à aucune page du
site. Karl ne développe pas : il décide, essaie sur son iPhone, fournit images et voix.

## Où tout se trouve

| Quoi | Où |
|---|---|
| Le plan par lots, la consigne d'un lot, le cadre commun des séances | `docs/plan-darshan-lots.md` |
| La mesure chiffrée, relancée à chaque lot | `docs/darshan-mesure.md`, écrite par `outils/darshan/mesure.py` ; journal `outils/darshan/mesure-journal.csv` |
| L'état détaillé de la fabrication, fichier par fichier, et les notes de reprise des six effets qui manquent | `outils/darshan/README.md` |
| Les plans d'origine (chantiers D1 à D10, I1 à I6, mesures de réussite) | `docs/plan-darshan.md`, `docs/plan-darshan-interface.md` |
| La mise en scène : direction de création, synthèse (qui fait foi), traitement de chaque page, décisions de Karl (partie 13 du README) | `docs/darshan-mise-en-scene/` |
| Le découpage en 85 tableaux (écrit par `decoupage.py`) | `docs/darshan-decoupage.md` |
| Le livre d'origine, jamais modifié | `livres/darshan.epub` |
| La fabrication : texte, découpage, réglages des pages, décors, moteur, essais | `outils/darshan/` (`texte.py`, `decoupage.py`, `livre.py`, `decors.py`, `art.py`, `build.py`, `classique.py`, `src/js/*.js`, `src/moteur.css`, `essai-*.js`) |
| Les textes que Karl peut corriger sans programme | `outils/darshan/interface.ini`, `objets.ini`, `portes.ini` |
| La tâche GitHub qui refait tout à chaque envoi, et joint les deux EPUB | `.github/workflows/darshan.yml` (Actions → « Darshan » → la dernière exécution → Artifacts) |
| Les 51 questions et les réponses de Karl ; les planches du Kerala ; les sons à écouter | page « Décisions pour Darshan », https://claude.ai/artifact/R6w5GfzURGNoAageW1gGkK (privée, au compte de Karl) |
| La page de présentation du projet (28 septembre) | https://claude.ai/artifact/DKPkWFeiMwAQnv2zEAb9eF |

Les réponses de Karl se lisent dans la base de la page des décisions : collection `reponses`,
documents `q01` à `q51` (champs `n`, `choix` : `accord`, `autre` ou `plus-tard`, `note`,
`maj`). Les planches et les sons sont des fichiers de la même page (`kerala/…`, `ecoute/…`).

## L'état, vérifié le 14 novembre

Rien n'a bougé dans le projet depuis la fusion du 4 octobre (pull request 12). Rejoué ce jour
sur `main` :

- la fabrication des deux éditions : réussie ;
- EPUBCheck 5.4.0, avertissements compris : rien à signaler, ni pour l'édition jouable ni pour
  l'édition classique ;
- le livre joué en entier dans Chromium, en mouvement réduit : jusqu'à « Fin », sans panne ; onze
  messages « effet inconnu », tous dus aux six effets qui manquent ;
- les 11 essais de touchers façon iPhone : réussis ;
- le banc des transitions : sans erreur.

- le banc du son joué sur tout le livre (`essai-son.js --livre --rythme 4`) : un seul son
  demandé et inconnu, `nuage` (2.10, 5.4), et un seul défaut de niveau, en 2.9 (crête de 6 dB
  avant le plafond) ; les deux sont au lot 1.

En chiffres : 85 pages, 446 temps, 59 gestes ; 100 effets sur 106 ; 10 scènes sur 10 ; un son
muet (`nuage`) ; 48 textes d'interface à valider ; EPUB jouable de 31,8 Mo. Le détail est dans
le plan, point 1.

Trois choses ont été découvertes en mesurant :

- **Karl a répondu aux questions 45 à 51 le 3 octobre au soir**, juste après l'arrêt. Personne
  ne les avait lues. Elles sont reportées dans le plan (point 2) et dans les décisions (partie
  13 du README de la mise en scène). La plus lourde de conséquences est la 49 : il ne fera pas
  les repérages photo ; il veut une liste de prompts pour faire produire les images par
  ChatGPT, dans un style pastel accordé au livre (lot 2).
- **Les sons « encore muets » notés le 3 octobre ne le sont pas** : les équipes les avaient
  constatés sur des copies qui n'avaient pas encore le nouveau moteur du son. Sur `main`, un
  seul son manque. Leçon : ne croire que la mesure faite sur la version fusionnée.
- **Le dossier de brouillon de la session a été vidé** quand sa machine a été recyclée : le
  plan écrit des photos du Kerala et ses maquettes page par page sont perdus. Il en reste
  l'essentiel : la question 50 (ses sept points, approuvés) et les planches jointes à la page
  des décisions. Ce qui doit durer va dans le dépôt ou sur une page publiée, jamais ailleurs.

## Comment mener un lot

1. **Le samedi**, après la remise à zéro de la limite (3 h) : vérifier que le lot d'avant est
   fusionné et sa case cochée ; choisir le lot de la semaine (le suivant, ou celui d'après si
   le suivant attend Karl : règle du point 4 du plan).
2. **Ouvrir une séance neuve** sur le dépôt Willwonderc/karlforterre.fr (ajouter
   Willwonderc/PexelsWillwonder pour les lots 2, 3, 6 à 9 et 19, qui lisent l'inventaire des photos
   ou le studio vidéo) et y coller la consigne du point 6 du plan, avec le numéro du lot. Une
   séance neuve par lot : le contexte court coûte beaucoup moins qu'une longue session.
3. **Pendant la séance** : rien à faire, sauf répondre. Si la limite approche, lui demander un
   arrêt propre : tout ce qui est vérifié est alors poussé, et le reste est écrit dans le
   README.
4. **À la fin** : la tâche GitHub « Darshan » est verte sur la pull request ; la mesure a bougé
   comme la fiche du lot le dit ; le compte rendu tient en quelques lignes avec des photos.
   Le rapporter à Karl avec ses mots à lui (ce qui se voit, ce qu'il doit faire), puis
   fusionner avec son accord.
5. **Tenir le calendrier** du plan à jour quand un lot glisse ou change de place, et préciser
   les fiches des saisons 3 et 4 deux semaines avant leur tour.

## Ce qui attend Karl maintenant

Rien d'urgent. Fusionner la pull request de ce plan. Le premier vrai rendez-vous est après le
lot 2 (regarder dix retouches d'essai et trancher), puis au lot 4 (une heure de lecture sur l'iPhone,
carnet d'essai ouvert). Le tableau complet est au point 8 du plan.

## Pièges connus

- **Apple Books** prend chaque toucher pour son menu ou pour tourner la page, sauf si le livre
  l'annule dès que le doigt se pose : tout toucher utile passe par `installerTouchers`
  (`depart.js`), les bords de la page (8 %) restent à la liseuse, et aucun geste n'est un long
  glissement horizontal. Sur iPhone, le son ne s'autorise qu'au doigt levé ou au clic.
- **Chaque page de l'EPUB est un monde à part** : ce qui dure d'une page à l'autre (le sac, les
  portes, le froid, la magie morte) vient des attributs que `build.py` écrit, jamais d'une
  variable. Toute page doit être juste quand on l'ouvre seule.
- **L'édition web garde les 85 pages dans un seul document** : une page quittée doit tout
  rendre (images, toiles, minuteries, sons). Une fuite a déjà fait tomber Chromium.
- **Un filtre CSS, même nul, rogne la pente des italiques** : écrire `none`.
- **Les équipes parallèles** : une copie de travail par équipe (`git worktree`), des zones
  réservées dans les fichiers communs, Chromium sous un verrou. Trois équipes à la fois ont
  épuisé la limite des cinq heures (3 octobre) : deux au plus. Une équipe ne peut pas en lancer
  une autre ; elle renvoie parfois deux fois le même rapport ; elle peut laisser tourner un
  script en boucle (regarder les processus avant de partir).
- **Les fusions « squash »** laissent la branche de la séance en désaccord avec `main`, et
  l'envoi forcé est refusé : repartir de `main`, puis
  `git merge -s ours origin/<la branche>` pour que l'envoi redevienne possible sans rien
  réécrire.
- **L'EPUB jouable pèse 30,4 Mio** et la limite d'envoi dans l'application est de 30 Mio : d'ici
  le lot 4, il se récupère dans les Artifacts de la tâche GitHub.
- **Dans une séance, Chromium ne charge pas les images de images.pexels.com** à travers le
  proxy : les télécharger par curl et les servir par `page.route`. Aucune collecte sur les
  pages de pexels.com, jamais.
- **Deux documents sont écrits par des programmes** (`darshan-decoupage.md`,
  `darshan-mesure.md`) : on modifie le programme. Les pages `en/` et `zh/` du site aussi.
- **Dans le rapport d'`essai-livre.js`**, la ligne « ARRÊT » sur la page 8.1 est normale : c'est
  la fin du livre.
- **Pillow** : `decors.py` et `images.py` en ont besoin, et le `python3` courant d'une séance ne
  le trouve pas toujours (constaté le 16 novembre : Python 3.11 sans Pillow, Python 3.13 avec).
  Les lancer par `/usr/bin/python3`. Rien à installer.
- **Codex n'est pas dans les séances du dépôt** : aucune séance ne peut le lancer. Elle prépare
  les consignes et vérifie les fichiers reçus ; c'est ALFRED, ou Karl, qui lance Codex sur le Mac.
- **Ne jamais lancer** `--envoyer-indexnow` ni `--renouveler-jeton` (dépôt PexelsWillwonder).

## Ce que la session sortante n'a pas vérifié

- Rien n'a été essayé sur un appareil depuis le 30 septembre. Les corrections pour Apple Books
  (touchers, « Ouvrir », son) et tout le travail du 3 octobre attendent l'iPhone de Karl.
- Les sons n'ont été jugés que par leurs mesures (niveaux, spectre), sauf les trois que Karl a
  écoutés.
- Les budgets des lots sont des estimations : la journée du 3 octobre (cinq scènes, soixante-cinq
  effets, le son, les transitions) a coûté environ un quart de semaine selon le calcul de la
  session, sans relevé de Karl pour le confirmer.
- Les fiches des saisons 3 et 4 n'ont été confrontées à aucun essai : la page du site, les
  librairies et les traductions demanderont chacune leurs propres vérifications.

La session sortante (« EPUB narratif spectaculaire pour Darshan ») reste lisible au compte de
Karl, mais son contexte est très lourd : pour toute suite, préférer une séance neuve et ces
documents.

## Progressions, pour ALFRED

Karl a demandé à la session sortante de tenir ALFRED au courant. Elle ne peut pas lui écrire :
ALFRED tourne sur le Mac de Karl, et une session du dépôt n'atteint les autres sessions de Karl
qu'avec un accord qu'il n'a pas donné. Le message direct (14 novembre) n'est donc pas parti, et
la tâche planifiée qui devait le porter a été refusée. Ces lignes en tiennent lieu : ALFRED les
lit ici, sur la branche `claude/upbeat-turing-bwatsc` puis sur `main`.

- **14 novembre** : mesure du chantier, plan en 22 lots, passation, pull request 17. Les
  réponses de Karl aux questions 45 à 51, restées non lues depuis le 3 octobre, sont inscrites
  aux décisions.
- **16 novembre** : à la demande de Karl (« encore plus d'ambition », et Codex pour modifier ses
  photos), le plan passe à **25 lots**, et la **version 1.0 du lot 13 au lot 16** (semaine du
  6 mars 2027). Nouveaux : l'atelier des photos (lot 2, qui absorbe la liste de prompts), chaque
  photo accordée à sa page (lots 6 à 8), les 43 images qui manquent (lot 9, ancien lot 6). Les
  lots 1, 3, 4 et 5 gardent leur numéro et leur semaine. Tout ce qui suivait recule de trois
  semaines. Rien n'est retiré.
- **Ce que cela demande de neuf à ALFRED** : lancer Codex sur les consignes que le lot 2 aura
  préparées, d'abord dix retouches d'essai ; montrer l'avant et l'après à Karl ; lui faire
  trancher les trois questions du plan (jusqu'où va une retouche, photos retouchées ou pastel,
  les mots du générique).
- **Non fait, à savoir** : Codex n'a pas été essayé ; aucune photo n'a été retouchée ; les
  budgets des lots 6 à 8 sont estimés sans mesure. La pull request 17 n'est pas fusionnée.

