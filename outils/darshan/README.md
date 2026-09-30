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

## Chantier en cours : le livre entier (pause du 30 septembre 2026)

La pré-production est terminée (`docs/darshan-mise-en-scene/`, avec sa synthèse, qui fait foi)
et reportée dans la fabrication. Le 30 septembre vers 11 h (UTC), le chantier est mis en pause à
un point stable : le livre se fabrique, passe EPUBCheck sans erreur ni avertissement et se joue
de la page de titre à « Fin », au toucher et au clavier (tâche GitHub « Darshan » verte). Les
décors et les gestes sont faits ; restent une partie des effets, cinq scènes écrites à la main,
deux transitions, la seconde partie des sons, les essais et ce qui attend Karl.

| Fichier | État |
|---|---|
| `texte.py` | Fait. Le texte du livre, commun à la fabrication et au découpage, avec les italiques du livre imprimé rétablies. |
| `decoupage.py` | Fait. Les 85 tableaux, avec les trois frontières déplacées (2.9/2.10, 7.7/7.8, 7.15/7.16), 58 gestes, les sons et leurs variantes, 43 repérages (S1 à S10), le catalogue des 27 mécaniques. |
| `livre.py` | Fait. Les réglages des 85 tableaux aux noms uniques de la synthèse : 115 décors, gestes, effets, objets gagnés ou perdus, portes franchies, répliques de Darshan (`REPLIQUES`). Réglages de l'équipe des décors reportés le 30 septembre : Aluva redessinée (`scene_aluva`), rocaille et noir-lueur recadrées, trajet de la barque en 3.1. |
| `objets.ini`, `portes.ini` | Faits, à relire par Karl. Les 18 objets (68 phrases) et les fiches des 7 portes du carnet (19 phrases), chaque phrase vérifiée mot pour mot. |
| `interface.ini` | Fait, à valider par Karl. Tous les textes d'interface : consignes des 58 gestes, 13 actions, boutons, menu, carnet des portes, générique ; les textes nouveaux sont marqués « à valider par Karl ». |
| `build.py` | Fait pour les 85 pages : 446 temps, 58 gestes, sacs, portes et les sept états de page (père, barre de Julie, voile, regard, compte à rebours, boussole, répliques) calculés page après page, vérifications. Il signale les effets et les scènes que le moteur ne connaît pas encore (erreur avec `--strict`). Deux ajouts demandés par les équipes (plus bas, point 1). |
| `src/js/mecaniques.js` | Fait. Les 27 mécaniques : les 8 du prototype revues (toucher, maintenir, glisser, rythme, tourner, porter, tracer, attendre) et les 19 nouvelles (caresser, contact, curseur, deux-pouces, écrire, effacer, essuyer, étals, galerie, liste, main, messages, paume, portes, remuer, respirer, semer, tendre, verser). Chacune a son toucher simple, son clavier et le bouton « Faire le geste » ; les aides changent de couleur chez Julie ; outils communs `Gestes` (halo, onde, cœur calé sur le rythme du son, paupières, main d'or, rose des vents, téléphone, galerie). |
| `src/js/effets.js` | En partie. Le noyau (un effet ne retient jamais la lecture plus de 15 s ; toute erreur est rattrapée ; animations et minuteries arrêtées avec la page), les effets d'état (objets, portes et carnet, désenchantement sans son animation, interface, regard, compte, pause), le son (effets ponctuels, silence, ambiances, couches, mélodie) et les effets du prototype. **71 effets restent à écrire** (`build.py` les liste) ; d'ici là, un effet inconnu est ignoré sans rien bloquer. |
| `src/js/scenes.js`, `transitions.js` | En partie. Les scènes du prototype (seuil, poème, toit, tuiles, pigeonnier) et ses transitions. Restent les scènes plier, vision, listes, rue-de-rungis et clôture, et les transitions `bandes-photo` et `bandes-julie`. |
| autres fragments de `src/js/` | Faits : `base`, `dessins` (les 17 objets), `visuels`, `interface` (sacs, carnet, regard, compte, barre, menu), `recit`, `depart` (navigation, reprise, édition web qui rend la mémoire des pages quittées). |
| `src/js/son.js` | Fait pour les lieux : les 18 ambiances, les couches (cœurs, pluie, feu, télévision sans parole, vibreur, la ballade composée pour le livre), l'appel et l'accord du père ; équilibrage (ambiances autour de -30 dB, crêtes sous -1,4 dBFS) ; son coupé, rien n'est fabriqué ; chaque ambiance arrête toutes ses sources. Seconde partie à faire (point 4). Banc d'essai : `essai-son.js`. |
| `decors.py`, `art.py` | Faits. Les 115 décors de la synthèse, leurs calques et les extras (clichés et vignettes de la galerie, bande de la lune, esquisse du théâtre, planche des photographies pour la page « Fin ») : 133 fichiers, 28,3 Mo, en 1600 × 2400 (WebP). Les 24 décors du prototype devenus inutiles sont retirés. Dix décors dépassent 450 Ko même en qualité 82 (patinoire, rocaille, pavé, village, graffiti, fantômes-rue, foule-téléphone, gorge, verdure, mur-terre). Les décors qui attendent un repérage de Karl sont des images d'attente floues. |
| `classique.py` | Fait, à relire par Karl. L'EPUB classique (refusionnable), aux mentions de Karl, texte vérifié au caractère près. Couverture : celle de 2023 (photographie d'Arianna Jadé), fournie en grand par Karl le 30 septembre ; EPUBCheck et Ace passent sans rien relever. Son en-tête dit où il en est et ce que Karl doit trancher (colophon, libellés, langue de दर्शन, date d'édition). Décidé par Karl le 29 septembre : « nouvelle » sur la page de titre ; ISBN à demander à l'AFNIL (constante `ISBN`, vide en attendant). |

Polices : refaites le 30 septembre par `polices.py`, avec le « ā » de « mudrā » (il
manquait déjà dans l'EPUB de 2023), en WOFF2 pour l'édition jouable et en TTF pour
l'édition classique. Aucune police du livre n'a la flèche « → » des étiquettes du carnet
des portes : le moteur la dessine. L'édition classique passe EPUBCheck 5.4.0 sans erreur
ni avertissement, et Ace by DAISY 1.4.6 sans aucune violation (30 septembre).

L'extrait jouable du 28 septembre se refabrique avec la version précédente du programme
(commit `e6921d2`).

### Reprendre après la pause

Méthode suivie jusqu'ici : une équipe par fichier (un seul propriétaire par fichier, chacun sa
section de `src/moteur.css`) ; avant chaque enregistrement, `build.py`, EPUBCheck avec
`--failonwarnings` et `essai-livre.js` en mouvement réduit puis normal ; la tâche GitHub
« Darshan » refait tout à chaque envoi. Dans l'ordre :

1. **`build.py`** (demandé par les équipes des gestes et des effets) :
   - copier dans l'édition web et dans l'EPUB, et inscrire dans `DONNEES.images` et au
     manifeste, les calques et extras de `decors.py` : `fenetre-cadre`, `fenetre-vue`,
     `toiles-couleur`, `placard-fermee`, `placard-ouverte`, `mangue`, les calques
     `marche-aluva-<objet>` (5.2), `lune-bande`, les `<nom>-cliche` et `<nom>-vignette` de la
     galerie (5.6, 5.7), `video-lune-vignette` et `esquisse-theatre.svg` (en `image/svg+xml`).
     Sans eux, la galerie montre des vignettes floues et les étals se dessinent en figurines ;
   - un attribut `data-genre` (photo, encre, dessin, uni) sur chaque plan : le froid, le gel et
     l'effacement ne touchent que les photos.
2. **Les effets** (`effets.js`) : les 71 qui manquent, par familles (images et plans ;
   particules, une toile par page ; texte ; cœur et temps ; son et alias), puis les réglages qui
   manquent aux effets déjà là : `objet+` (`style="notification"`, `ploie`), `transfert`
   (`jaillir`), `eclat-court` entier (la fonte, le nom seul, la clé posée dans la serrure et
   déclarée dans `scene.cle`), `frisson` avec `bouton`, l'étoile de `porte` qui file vers
   « Carnet », la `boussole` dans l'image (rose de `Gestes`, états affolée et nord), les quatre
   mouvements du `desenchantement`, les fondus d'`interface`, les mots éclairés du `compte`, le
   lettre à lettre de `voix` (1.1), et les options de `decor`, `camera`, `flou`, `eblouir`,
   `poussiere`, `filantes` et `son` (`boucle`, `ralentir`). Branchements attendus par
   `mecaniques.js` : `partage` (`gauche`, `droite`, `actif`, `arete`, `attente`, puis `fin`,
   `duree`), `ruban` (`attache`, `rythme`), `reflet` (`image`, `zone`), `decor` (`i`, `fondu`),
   la couche `horloge` (`proche`, `presser`). Les effets prennent chez les mécaniques
   `scene.coeur` (cœur, valse, balance, arrêt), `scene.paupieres.teinte` (morsure),
   `scene.galerie` (cliché, vidéo de la lune), `scene.cle`, `Gestes.rose` (boussole),
   `.cicatrice-porte` (effacement) et `e.geste` (flou en 2.1 et 2.9, caméra en 2.8, embrasure
   en 6.15). Mesures relevées : l'éclipse de 7.11 est centrée en (680, 875), disque de rayon
   172 environ, anneau à 180 ; l'esquisse de 2.10 (`esquisse-theatre.svg`) a des groupes
   `data-etape` et des traits en `pathLength="1"`, à tracer trait par trait ; `saigne` (6.4)
   pourrait se limiter à la porte, `zone=[330, 600, 800, 1130]`, valeur à vérifier sur l'image.
3. **Les scènes écrites à la main et les transitions** (`scenes.js`, `transitions.js` ;
   synthèse, partie 3.4, et les traitements des chapitres) : `plier` (3.4), `vision` (3.10,
   3.11), `listes` (6.2, qui fournit `scene.listes = {darshan, julie}` à la mécanique),
   `rue-de-rungis` (7.12 à 7.15 : chaque page s'ouvre sur l'état où la précédente s'arrête ;
   sur `rue-soleil`, poser les lueurs sur les façades, x 0 à 330 à gauche et 950 à 1200 à
   droite, y 1300 à 1700), `cloture` (8.1 et « Fin » : générique, planche `fin-photos.webp`,
   « Nouvelle lecture ») ; les retouches des scènes du prototype (l'appel lettre à lettre en
   1.1, les notes des tuiles sans do dièse, `tourner` et `autre-cote` au pigeonnier, qui peut
   passer `g.tourne`) ; les transitions `bandes-photo` (2.1, 6.1 : la seconde moitié des bandes
   découvre la photo par l'obturateur) et `bandes-julie` (4.1 ; 5.1 avec `palette="lilas"`,
   `grain="confettis"`).
4. **Le son, seconde partie** (`son.js` ; synthèse, parties 5.4 et 5.5) : les sons ponctuels
   (tictac, pied, clairon, tic, vibreur, choc, porte-epaisse, merle, porcelaine, fourchette,
   herbe, tasse, pas, clochette, bombe, coutelas, tabouret…) et ceux des gestes (cran, toc,
   mousse, remous, velours, graine, reglette, clavier, envoi, buee, the, claque, tissu, plume,
   frottement, coche-pinceau, coche-stylo, `achat-<objet>` en 5.2, `paysage-<image>` en 6.12),
   qui se taisent pour l'instant sans erreur ; les couches `aube`, `couteau`, `vent`,
   `bourdon` ; `autre-cote` avec son lieu ; `Son.niveau(v, ms)` ; `Son.note('montantes', i)`
   (1.2 : la, si, ré, mi, fa dièse) ; une horloge d'appartement qui sait presser ; le `ralenti`
   de 7.10 ; deux ambiances à la fois (6.2, 7.4) ; les réglages de la foule et du tanpura.
   Dans l'édition web, la couche des battements survit au passage de 5.9 à 5.10 : arrêter les
   couches au changement de page (`depart.js` ou `Son`).
5. **Petites retouches** : en 5.6, le compte « soixante-douze heures » chevauche les boutons de
   la barre ; en 7.7, la première lettre des lignes en italique est rognée au bord gauche du
   papier (peut-être le `filter` de `.temps`) ; dans `livre.py`, à décider : `objet="lunettes"`
   en 1.9, `teinte="couchant"` en 7.10, `consigne_immediate` en 1.2, `dessin="cle-placard"` en
   6.13, `suit_geste` pour les braises de 3.10.
6. **Les essais** (synthèse, partie 12, étape 9) : `essai-livre.js` à chaque étape (le 30
   septembre, en mouvement réduit comme en mouvement normal, toutes les pages sont jouées
   jusqu'à 8.1 sans panne ; les seules erreurs sont les effets pas encore écrits) et depuis 3.10 ; les pages de l'EPUB jouées au clavier dans Chromium, en
   commençant par celles des gestes (1.3, 1.4, 2.2, 3.9, 3.10, 4.2, 4.3, 5.2, 5.6, 5.11, 6.2,
   6.8, 6.11, 6.12, 7.7, 7.9, 7.11, 7.13) ; VoiceOver et TalkBack ; grand texte ; sans script ;
   Apple Books sur iPhone et iPad (essai de Karl : aucun geste ne doit tourner la page).
7. **Les réponses de Karl** (30 septembre, `docs/darshan-mise-en-scene/README.md`, partie 13) :
   les reporter dans la fabrication, dont la correction des coquilles, la commande du dessert
   en 2.7, la chemise boutonnée en 1.8 et l'effet de Jivan en 1.5 ; lui présenter ce qui est
   fait pour le Kerala et un plan pour l'illustrer sans photos d'Inde ; lui reposer, mieux
   expliquées, les questions 12, 19, 23, 25 et 43.
8. **Ce qui attend encore Karl** : les textes nouveaux d'`interface.ini`, d'`objets.ini` et
   de `portes.ini` ; les repérages (synthèse, partie 9 : la main de Julie, la rue de Rungis,
   le tartare et le pain perdu, la lettre de sa main, le mur de torchis, la porte de
   planches la nuit, la clé de laiton, le velours, le recueil, la porte battante, la
   Charlotte, les lunettes et les clichés de la galerie, le carrelet et le tabouret, la
   patinoire) ; l'ISBN ; la relecture de l'édition classique ; l'essai dans Apple Books.

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
NODE_PATH=/opt/node22/lib/node_modules node essai-livre.js
NODE_PATH=/opt/node22/lib/node_modules node essai.js telephone
NODE_PATH=/opt/node22/lib/node_modules node essai.js calme
NODE_PATH=/opt/node22/lib/node_modules node essai-transitions.js telephone
NODE_PATH=/opt/node22/lib/node_modules node captures.js
```

`essai-livre.js` joue le livre entier dans l'édition web, au clavier (`calme` par défaut,
`normal` pour les animations complètes, et un numéro de tableau pour partir d'une page), et
photographie chaque page dans `captures/livre/` avec un rapport (temps passé, erreurs du
moteur). `essai.js` joue l'extrait de bout en bout (`telephone`, `ordinateur`, ou `calme` pour le
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
