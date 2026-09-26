# Contexte pour les sessions Claude

Site d'auteur de Karl Forterre (https://karlforterre.fr), qui remplace l'ancien site
Adobe Portfolio. Site statique publié tel quel par GitHub Pages depuis `main`
(« Deploy from a branch », racine), sans étape de construction. Mode d'emploi et
bascule du domaine chez OVH : `README.md`. Le site photo (photos.karlforterre.fr) vit
dans le dépôt Willwonderc/PexelsWillwonder.

## Façon de travailler

- Échanger en français ; documentation en français.
- Tout doit rester simple à maintenir sans compétences de développement : aucune
  dépendance, aucun outil de construction, aucun service payant.
- Chaque session travaille sur sa branche et propose une pull request vers `main`.

## Règles

- Karl Forterre a fermé son entreprise : aucune offre de prestations, de devis ni de
  tarifs sur le site.
- Pas de formulaire : le contact passe par contact@karlforterre.fr et LinkedIn.
- Trois langues : français, anglais, chinois. `js/traductions.js` associe à chaque phrase
  française (clé exacte, espaces ramenés à un seul) son anglais et son chinois ;
  `js/langues.js` les applique, y compris aux contenus ajoutés par script. Toute phrase
  française ajoutée ou modifiée reçoit ses deux traductions. Pas de détection
  automatique de la langue : Google doit continuer de voir la page en français.
- Graphisme : un `<article class="graphisme-projet">` par projet, un
  `<button class="graphisme-carte">` par œuvre : vignette en `src` (avec sa largeur et sa
  hauteur dans `width` et `height`), version moyenne en `srcset` (`2x`), grande image dans
  `data-grand`. La visionneuse prend la moyenne ou la grande selon l'écran. Les projets
  d'une ou deux œuvres sont des fiches côte à côte dans `<div class="graphisme-grille">`.
- Ne jamais inventer de citation ni d'extrait : les extraits viennent des livres
  (`livres/*.pdf`), les textes des projets de l'auteur lui-même.
- Liens relatifs, pour que le site fonctionne aussi à l'adresse d'essai
  https://willwonderc.github.io/karlforterre.fr/. Seuls `canonical`, `og:*`,
  `sitemap.xml` et `robots.txt` donnent des adresses absolues en https://karlforterre.fr.
- Qualité d'image d'abord, à la demande de Karl Forterre : chaque œuvre en trois
  fichiers WebP tirés de l'original le plus grand, `nom-vignette.webp` (800 px sur le
  grand côté, 1000 pour le portfolio), `nom-moyenne.webp` (1600 px) et `nom.webp`
  (3200 px au plus), qualité 86 à 90, sans perte pour les aplats quand ce n'est guère plus
  lourd. Couleurs : CMJN converti en sRGB par son profil ICC ; un profil large (Display
  P3) reste joint au fichier. Noms en minuscules sans espaces ni accents. Jamais de TIFF,
  PSD ni PDF d'impression dans le dépôt : il est public.
- Polices hébergées dans `fonts/` : aucun appel à Google Fonts.
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
