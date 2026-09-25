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
- Ne jamais inventer de citation ni d'extrait : les extraits viennent des livres
  (`livres/*.pdf`), les textes des projets de l'auteur lui-même.
- Liens relatifs, pour que le site fonctionne aussi à l'adresse d'essai
  https://willwonderc.github.io/karlforterre.fr/. Seuls `canonical`, `og:*`,
  `sitemap.xml` et `robots.txt` donnent des adresses absolues en https://karlforterre.fr.
- Images au format web avant tout dépôt : WebP, 2000 pixels au plus pour les grandes
  images, 600 à 900 pixels pour les vignettes, noms en minuscules sans espaces ni
  accents. Jamais de TIFF ni d'original lourd : le dépôt est public.
- Polices hébergées dans `fonts/` : aucun appel à Google Fonts.
- Section Photographie : elle lit à chaque visite `https://photos.karlforterre.fr/apercu.json`,
  écrit chaque nuit par `vitrine/build.py` du dépôt PexelsWillwonder (sélection, séries,
  galeries, chiffres). La liste `photosIntegrees` de `script.js` ne sert qu'en secours.
  Images servies par images.pexels.com ; chaque photo ouvre sa page sur
  photos.karlforterre.fr, qui mène au téléchargement sur Pexels. Aucune collecte
  automatique sur les pages de pexels.com.
- Captures d'écran en session : Chromium ne charge pas les images de images.pexels.com
  à travers le proxy. Intercepter ces requêtes (Playwright, `page.route`) et y répondre
  avec les fichiers téléchargés par curl.
