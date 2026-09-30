# Darshan, le livre qui se joue : tranche verticale

Prototype construit le 28 septembre 2026 pour évaluer une édition « presque jeu vidéo »
de *Darshan*. L'évaluation complète, la piste recommandée et le plan des sessions sont
dans [docs/plan-darshan.md](../../docs/plan-darshan.md).

L'extrait couvre le poème d'ouverture et le début du chapitre « Un ciel mouvant »,
jusqu'à l'arrivée à Aluva : six tableaux, environ 430 mots, le texte de l'édition 2023
sans un mot changé.

Le livre entier est découpé en 85 tableaux dans
[docs/darshan-decoupage.md](../../docs/darshan-decoupage.md), document écrit par
`decoupage.py` (voir plus bas).

Rien ici n'est encore relié au site : aucune page ne pointe vers ce dossier.

## Chantier en cours : le livre entier (pause du 29 septembre 2026)

La réalisation du livre entier a commencé le 29 septembre ; elle s'est arrêtée à mi-chemin
des fondations, à la demande de Karl. Ce qui est en place :

| Fichier | État |
|---|---|
| `texte.py` | Fait. Le texte du livre, commun à la fabrication et au découpage, avec les italiques du livre imprimé rétablies. |
| `livre.py` | Fait. Les réglages de production des 85 tableaux : décors, gestes, effets, objets gagnés ou perdus, portes franchies. |
| `objets.ini` | Fait, à relire par Karl. Les 17 objets, leur nom, et les phrases du livre qui en parlent (vérifiées mot pour mot). |
| `interface.ini` | Fait, à valider par Karl. Tous les textes d'interface : consignes des 67 gestes, boutons, menu, carnet des portes. |
| `build.py` | Réécrit pour les 85 pages : 377 temps, 67 gestes, effets, sacs et portes calculés page après page, vérifications. Il attend le nouveau moteur. |
| `src/js/` | Le nouveau moteur, en fragments : `base.js` et `son.js` sont écrits. |
| `src/js/son.js` | Interface complète (ambiance, effet, couche, filtre, volumes, deux bus) avec les sons du prototype, repris tels quels ; les sons pas encore faits sont des appels sans effet. Restent 14 ambiances (vent, restaurant, rue, parc, bibliotheque, vision, metro, hopital, chambre, marche, patisserie, appartement, desert, pluie), 6 couches (battements, pluie, feu, tele, melodie, vibration), 39 effets (pas, toc, page, battement, clochette, vibreur, message, bip, the, confettis, tonnerre, eclair, goutte, etincelles, plume, ruban, porte, brise, chute, desenchantement, lanterne, eteindre, eclabousse, mousse, inspire, expire, graine, cran, avance, nuage, aube, lueur, boussole, velours, paume, perce, pli, entree, fonte-courte), l'équilibrage (« tour » écrête à +2,6 dBFS depuis le prototype ; « nuit », « papier », « grince » trop bas) et l'arrêt commun des minuteries d'une ambiance. |
| `decors.py` | Fait. Fabrique les décors en 1600 × 2400 (WebP) : `python3 outils/darshan/decors.py [noms]`, ou `couverture`. 63 décors sur 72 sont dans `src/img/decors/` (20 Mo) : toutes les photos et toutes les encres. |
| `classique.py` | Fait, à vérifier. L'EPUB classique (refusionnable), aux mentions de Karl, texte vérifié au caractère près. Il attend la couverture `src/img/couverture.jpg` ; ensuite : EPUBCheck, Ace, captures. Son en-tête dit où il en est et ce que Karl doit trancher (colophon, libellés, langue de दर्शन, date d'édition). Décidé par Karl le 29 septembre : « nouvelle » sur la page de titre ; ISBN à demander à l'AFNIL (constante `ISBN`, vide en attendant). |

Polices : refaites le 30 septembre par `polices.py`, avec le « ā » de « mudrā » (il
manquait déjà dans l'EPUB de 2023), en WOFF2 pour l'édition jouable et en TTF pour
l'édition classique. Aucune police du livre n'a la flèche « → » des étiquettes du carnet
des portes : le moteur la dessinera. L'édition classique passe EPUBCheck 5.4.0 sans erreur
ni avertissement, et Ace by DAISY 1.4.6 sans aucune violation (essai avec une couverture
provisoire, le 30 septembre).

Pour les décors, il reste :
- **les 9 dessins** de `art.py` (local-nuit, mur-terre, cosmos, pekin, desert-nuit,
  desert-jour, papier-lettre, toiles, fenetre) ; `decors.py` les attend sous les noms de
  fonctions de `livre.py`, et passe à `fenetre` l'adresse de la photo par `image=` ;
- **la couverture** (code écrit, jamais lancé) ;
- **des recadrages à corriger dans `livre.py`**, puis refaire ces décors. Rappel : x et y
  placent le cadre dans la photo (0 : bord gauche ou haut, 0,5 : centre, 1 : bord droit
  ou bas). Corrections proposées :

  | Décor | x actuel → proposé | Pourquoi |
  |---|---|---|
  | portes-3 | 0,5 → 0,2 | la porte de la cour est coupée |
  | phare | 0,5 → 0,17 | le phare est coupé en deux |
  | amoureux | 0,32 → 0,15 | l'homme au pull rouge est hors cadre |
  | lit-telephone | 0,5 → 0,2 | le téléphone est coupé |
  | banquise | 0,55 → 0,84 | le voilier est coupé |
  | rochers | 0,5 → 0,75 | l'empilement de rochers est coupé |
  | rocaille | 0,62 → 0,45 | pour centrer l'arche |
  | parvis | 0,55 → 0,4 | les flèches touchent le bord |
  | marche | 0,5 → 0,62 | pour centrer le pignon vitré |
  | rue-vide | 0,72 → 0,45 (facultatif) | pour centrer la rue |

  « graffiti » : fait. Karl a choisi « aime » (29 septembre) ; le mot, un peu plus large qu'un
  cadre 2:3, tient grâce à une marge prolongée en haut et en bas (`marge` de `livre.py`). Il
  paraît un instant au tableau 6.11, quand Julie dit « je t’aime ». « lune » : le croissant
  est minuscule ; zoom d'environ 1,8 à centrer sur lui.
- **les points chauds** des gestes à relever sur les images : seule la porte du père est
  relevée (lanterne vers (360, 850), porte de x 340 à 808 et de y 695 à 1680, poignée vers
  (760, 1200)) ; la cible de 6.4 sur « porte-bleue » semble trop à droite ;
- **des retouches** : « portes-3 » trop sombre (l'éclaircir avant l'encre, dictionnaire
  `RETOUCHES_ENCRE`) ; « periyar-soir » trop brun (plus de rose et de violet) ; neuf
  photos dépassent 450 Ko (campagne, banc, villandry, rocaille, pave, fantomes, graffiti,
  verdure, amoureux) : baisser leur qualité vers 75, ou les accepter.

Tant qu’un fragment du moteur manque, `build.py` s’arrête sur un message clair.
L'extrait jouable du 28 septembre se refabrique avec la version précédente du programme
(commit `e6921d2`).

Reste à faire, dans l'ordre : les fragments du moteur (son, visuels, transitions,
interface, récit, mécaniques, effets, scènes, départ) ; les décors qui manquent ; la partie
jouée de bout en bout, au clavier et en mouvement réduit ; l'EPUB classique ; la tâche
GitHub ; la mise à jour des plans et de la pull request.

## Jouer

- **Sur ordinateur ou téléphone** : fabriquer (ci-dessous), puis ouvrir
  `outils/darshan/dist/web/index.html` dans un navigateur. Toucher « Ouvrir », puis
  avancer en touchant le texte, l'étoile ✦, ou avec les touches Entrée, Espace et →.
- **Dans une liseuse** : ouvrir `outils/darshan/dist/darshan-extrait-jouable.epub`.
  Dans Apple Books (iPhone, iPad, Mac), dans l'application Kobo et dans Thorium, les
  scripts s'exécutent et l'extrait se joue page par page. Ailleurs, chaque page reste un
  livre illustré où tout le texte se lit.
- Le bouton **Lecture** affiche tout le texte sans animation ; **Son** coupe ou remet le
  son.
- Le bouton **Objets** apparaît avec le premier objet (les lunettes, sur les tuiles) : les
  lunettes volent de l'annonce « Nouvel objet » jusqu'à lui. Il ouvre la fiche de chaque
  objet : un gros plan qu'on fait tourner du doigt, les phrases du livre déjà lues qui en
  parlent, et le geste du moment en bouton. Quand les lunettes fondent, la clé éclate en
  grand, puis sa fiche s'ouvre d'elle-même. Plan de l'interface :
  [docs/plan-darshan-interface.md](../../docs/plan-darshan-interface.md).
- **Transitions** : chaque scène entre par la sienne (porte, bandes du chapitre, encre,
  iris). Le **banc d'essai**, `outils/darshan/dist/web/transitions.html`, les joue toutes à
  la demande, y compris l'obturateur et le glissement du monde de Julie, sur des photos de
  Karl. Si le système demande moins de mouvement, elles deviennent des fondus courts.

## Fabriquer

```
python3 outils/darshan/build.py
```

Python seul, sans module à installer. Le programme lit le texte dans
`livres/darshan.epub`, vérifie que chaque paragraphe découpé redonne exactement
l'original, et écrit dans `outils/darshan/dist/` (dossier non suivi par Git) :
- `web/` : l'édition web ;
- `darshan-extrait-jouable.epub` : l'EPUB 3 en pages fixes (1200 × 1800, format 2:3).

Contrôle : EPUBCheck 5.4.0 ne relève ni erreur ni avertissement.

```
java -jar epubcheck.jar outils/darshan/dist/darshan-extrait-jouable.epub
```

## Découper le livre

```
python3 outils/darshan/decoupage.py
```

Python seul. Le programme contient le découpage de tout le livre en tableaux (texte, lieu,
décor, photos de Karl, gestes, objets et leurs états, transition, son, repérages), le
vérifie contre `livres/darshan.epub` (tout le texte, dans l'ordre ; chaque geste cité mot
pour mot ; de 40 à 160 mots par tableau) et écrit
[docs/darshan-decoupage.md](../../docs/darshan-decoupage.md). Pour changer le découpage, on
modifie les données du programme, jamais le document.

## Essayer automatiquement

Dans une session Claude (Playwright et Chromium y sont installés), depuis `outils/darshan/` :

```
NODE_PATH=/opt/node22/lib/node_modules node essai.js telephone
NODE_PATH=/opt/node22/lib/node_modules node essai.js calme
NODE_PATH=/opt/node22/lib/node_modules node essai-transitions.js telephone
NODE_PATH=/opt/node22/lib/node_modules node captures.js
```

`essai.js` joue l'extrait de bout en bout (`telephone`, `ordinateur`, ou `calme` pour le
mouvement réduit) et photographie chaque étape, balayages compris, dans `captures/` (non
suivi par Git) ; `essai-transitions.js` photographie chaque transition du banc d'essai à
plusieurs instants et vérifie qu'aucun calque ne reste derrière elle ; `captures.js`
photographie la version ordinateur, les pages de l'EPUB et ces mêmes pages sans script.

## Refaire les images

Les images sont déjà dans `src/img/`. Pour les refaire (Pillow et Playwright nécessaires) :

```
python3 outils/darshan/images.py
```

Le ciel et les tuiles viennent de deux photos de Karl sur Pexels (27116682 et 34500347) ;
les toits, la tour Eiffel, le pigeonnier, la porte et Aluva sont dessinés par `art.py`,
puis photographiés par Chromium (`rendu.js`). Le banc d'essai ajoute le monde de Julie :
trois photos de Karl recadrées en 2:3 (« Métro », « Style haussmannien », « Pluie »).

Pour passer une photo de Karl à l'encre et à l'aquarelle (monde de Darshan), avec son
numéro Pexels :

```
python3 outils/darshan/images.py encre 34762346
```

Le programme télécharge le fichier public de la photo (s'il ne l'a pas déjà), le recadre
en 1200 × 1800 et écrit `src/img/encre-34762346.jpg` : papier, couleur légère avec
auréoles, encre diluée pour les ombres, traits sur les seuls contours marqués. Les
réglages (part de traits, couleur, tons) se reprennent décor par décor.

## Contenu

| Fichier | Rôle |
|---|---|
| `build.py` | Fabrique l'édition web (avec le banc d'essai `transitions.html`) et l'EPUB, texte vérifié contre `livres/darshan.epub`. Contient aussi les objets et leurs phrases (`OBJETS`), vérifiées mot pour mot, dont le fragment affiché pendant la métamorphose de la clé. |
| `decoupage.py` | Le découpage de tout le livre en 85 tableaux, vérifié contre l'EPUB ; écrit `docs/darshan-decoupage.md`. |
| `src/moteur.js` | Le moteur : texte révélé temps par temps, gestes, sons fabriqués en direct (Web Audio), étoiles, poussière, fonte des lunettes en clé, transitions (balayages entre scènes, frisson, envol et éclat des objets), interface d'objet (fiche, bouton Objets, annonce), carnet des portes. Sans dépendance, sans appel réseau. |
| `src/moteur.css` | La mise en page, commune aux deux éditions (en unités `cqw` ; l'EPUB les convertit en pixels). |
| `src/fonts/` | Amiri et Unna (les polices du livre), Tiro Devanagari Sanskrit (pour दर्शन), allégées par `polices.py` (WOFF2 et TTF), licence SIL OFL. |
| `src/img/` | Décors prêts à l'emploi, les images tirées des photos de Karl, dont une porte passée à l'encre (`encre-34762346.jpg`). |
| `art.py`, `rendu.js`, `images.py` | Dessin et préparation des images ; `images.py encre` passe une photo à l'encre. |
| `polices.py` | Allège les polices du livre (fontTools et brotli nécessaires) ; à relancer seulement si le texte ou l'interface prennent un caractère nouveau. |
| `essai.js`, `essai-transitions.js`, `captures.js` | Essais automatiques dans Chromium. |
