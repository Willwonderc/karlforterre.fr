# Contexte pour les sessions Claude

Site d'auteur de Karl Forterre (https://karlforterre.fr), qui remplace l'ancien site
Adobe Portfolio. Site statique publié tel quel par GitHub Pages depuis `main`
(« Deploy from a branch », racine), sans étape de construction. Seules les pages `en/` et
`zh/` sont écrites par un programme, `outils/pages-langues.py`, que la tâche GitHub
« Pages en anglais et en chinois » relance toute seule. Mode d'emploi et
bascule du domaine chez OVH : `README.md`. Le site photo (photos.karlforterre.fr) vit
dans le dépôt Willwonderc/PexelsWillwonder.

## Façon de travailler

- Échanger en français, même quand les contenus sont en chinois ou en anglais ;
  documentation en français.
- Tout doit rester simple à maintenir sans compétences de développement : aucune
  dépendance, aucun outil de construction à lancer soi-même, aucun service payant.
- Chaque session travaille sur sa branche et propose une pull request vers `main`.

## Règles

- Karl Forterre a fermé son entreprise : aucune offre de prestations, de devis ni de
  tarifs sur le site.
- Pas de formulaire : le contact passe par contact@karlforterre.fr et LinkedIn.
- Trois langues, chacune à son adresse, pour que les moteurs de recherche les trouvent :
  français (`/`), anglais (`/en/`), chinois (`/zh/`), reliées par `hreflang` et
  `sitemap.xml`. Seule `index.html` se modifie : `en/index.html` et `zh/index.html` en
  sont tirées par `outils/pages-langues.py` (ne jamais les modifier à la main).
  `js/traductions.js` associe à chaque phrase française (clé exacte, espaces ramenés à
  un seul) son anglais et son chinois ; le programme les applique d'avance,
  `js/langues.js` aux contenus ajoutés par script. Toute phrase française ajoutée ou
  modifiée reçoit ses deux traductions. Pas de détection automatique de la langue :
  chaque version reste à son adresse, et Google voit le français à l'adresse principale.
- Graphisme : un `<article class="graphisme-projet">` par projet, un
  `<button class="graphisme-carte">` par œuvre : vignette en `src` (avec sa largeur et sa
  hauteur dans `width` et `height`), version moyenne en `srcset` (`2x`), grande image dans
  `data-grand`. La visionneuse prend la moyenne ou la grande selon l'écran. Les projets
  d'une ou deux œuvres sont des fiches côte à côte dans `<div class="graphisme-grille">`.
- Ne jamais inventer de citation ni d'extrait : les extraits viennent des livres
  (`livres/*.pdf`), les textes des projets de l'auteur lui-même.
- Chemins : dans `index.html`, liens relatifs (le programme les rend absolus pour
  `/en/` et `/zh/`) ; dans les scripts (`script.js`, `js/header-templates.js`) et dans
  `memoire/index.html`, chemins depuis la racine (`/images/…`), qui fonctionnent depuis
  toutes les pages. L'adresse d'essai https://willwonderc.github.io/karlforterre.fr/
  redirige désormais vers karlforterre.fr. Seuls `canonical`, `og:*`, `hreflang`, les
  données structurées, les balises `citation_*` (Google Scholar), `sitemap.xml`,
  `robots.txt` et `llms.txt` donnent des adresses complètes en https://karlforterre.fr.
- Mémoire : la page `memoire/index.html` le présente pour les moteurs, Google Scholar et
  les assistants IA ; ses citations viennent mot pour mot du PDF, avec leur page.
  `en/memoire/` et `zh/memoire/` en sont tirées par `outils/pages-langues.py`, comme
  l'accueil (ne pas les modifier à la main). L'auteur a pour identifiant
  `https://karlforterre.fr/#auteur` dans les données structurées des deux sites.
  `llms.txt` présente le site aux assistants IA ; guide complet dans
  `referencement/README.md` du dépôt PexelsWillwonder.
- Qualité d'image d'abord, à la demande de Karl Forterre : chaque œuvre en trois
  fichiers WebP tirés de l'original le plus grand, `nom-vignette.webp` (800 px sur le
  grand côté, 1000 pour le portfolio), `nom-moyenne.webp` (1600 px) et `nom.webp`
  (3200 px au plus), qualité 86 à 90, sans perte pour les aplats quand ce n'est guère plus
  lourd. Couleurs : CMJN converti en sRGB par son profil ICC ; un profil large (Display
  P3) reste joint au fichier. Noms en minuscules sans espaces ni accents. Jamais de TIFF,
  PSD ni PDF d'impression dans le dépôt : il est public.
- Polices hébergées dans `fonts/` : aucun appel à Google Fonts.
- Darshan jouable : évaluation, piste retenue et chantiers D1 à D10 dans
  `docs/plan-darshan.md` ; interface (fiches d'objet, carnet, regard, monde de Julie) et
  chantiers I1 à I6 dans `docs/plan-darshan-interface.md` ; découpage de tout le livre en
  85 tableaux (gestes, objets, transitions, photos de Karl, repérages) dans
  `docs/darshan-decoupage.md`, écrit par `outils/darshan/decoupage.py` (modifier le
  programme, jamais le document) ; mise en scène (direction de création, puis traitement
  narratif de chaque scène par une équipe créative) dans `docs/darshan-mise-en-scene/` ;
  prototype (extrait jouable, EPUB et web, banc d'essai des transitions) dans
  `outils/darshan/`, relié à aucune page. Le texte y est lu dans
  `livres/darshan.epub`, jamais recopié ni modifié ; les coquilles de l'annexe A, acceptées
  par Karl le 30 septembre 2026, sont corrigées à la fabrication, chacune listée dans
  `texte.CORRECTIONS` (`outils/darshan/texte.py`).
- Section Photographie : elle lit à chaque visite `https://photos.karlforterre.fr/apercu.json`,
  écrit chaque nuit par `vitrine/build.py` du dépôt PexelsWillwonder (sélection, séries,
  galeries, chiffres). La liste `photosIntegrees` de `script.js` ne sert qu'en secours.
  Images servies par images.pexels.com, jusqu'à 3200 px selon l'écran ; le carrousel ne
  charge que la diapositive affichée et ses voisines. Chaque photo ouvre sa page sur
  photos.karlforterre.fr, qui mène au téléchargement sur Pexels. Aucune collecte
  automatique sur les pages de pexels.com.
- Captures d'écran en session : Chromium ne charge pas les images de images.pexels.com
  à travers le proxy. Intercepter ces requêtes (Playwright, `page.route`) et y répondre
  avec les fichiers téléchargés par curl.
