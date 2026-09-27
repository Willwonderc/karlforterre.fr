# Site d'auteur de Karl Forterre

Le site qui remplace l'ancien site Adobe Portfolio à l'adresse https://karlforterre.fr :
livres, mémoire de recherche, portfolio, réalisations graphiques et photographies.

C'est un site statique : GitHub Pages publie les fichiers de ce dépôt tels quels, sans
étape de construction. Une modification enregistrée sur la branche `main` est en ligne
une à deux minutes plus tard. Le site photo, photos.karlforterre.fr, vit dans un autre
dépôt : Willwonderc/PexelsWillwonder.

## 1. Mise en ligne à l'adresse d'essai (une seule fois)

1. Dans ce dépôt : **Settings** → **Pages** → **Build and deployment**.
2. **Source** : « Deploy from a branch ». **Branch** : `main`, dossier `/ (root)`, puis **Save**.
3. Une à deux minutes plus tard, le site est visible à l'adresse d'essai
   https://willwonderc.github.io/karlforterre.fr/. Le site Adobe reste en ligne pendant
   ce temps : prenez le temps de tout relire.

## 2. Bascule de karlforterre.fr, quand le site vous convient

Une dizaine de minutes, puis quelques heures d'attente au plus. Choisissez un moment
calme : le site peut afficher un avertissement de sécurité le temps que GitHub délivre
son certificat.

1. **GitHub** : **Settings** → **Pages** → **Custom domain** : `karlforterre.fr`, puis
   **Save**. GitHub ajoute un fichier `CNAME` au dépôt et signale que le domaine n'est
   pas encore configuré : c'est normal à ce stade.
2. **OVH** : espace client → **Web Cloud** → **Noms de domaine** → `karlforterre.fr` →
   onglet **Zone DNS**.
   - Ligne de type **A** du domaine `karlforterre.fr` (cible `151.101.192.119`, le
     serveur d'Adobe) : **Modifier** → cible `185.199.108.153`.
   - **Ajouter une entrée** de type **A**, sous-domaine laissé vide, trois fois : cibles
     `185.199.109.153`, `185.199.110.153` et `185.199.111.153`.
   - Ligne de type **A** du sous-domaine `www` (`151.101.192.119`) : **Supprimer**. Puis
     **Ajouter une entrée** de type **CNAME** : sous-domaine `www`, cible
     `willwonderc.github.io.` (avec le point final).
   - Ne touchez à aucune autre ligne : **MX** et **SPF** (vos courriels), **TXT**
     `pinterest-site-verification`, **CNAME** `photos` (le site photo). La ligne TXT
     `1|www.karlforterre.fr`, reste d'une ancienne redirection OVH, est sans effet.
3. **Attendre** : de quelques minutes à quelques heures. Quand **Settings** → **Pages**
   indique que le DNS est correct, cochez **Enforce HTTPS** (la case devient active une
   fois le certificat délivré, au plus tard sous 24 heures).
4. **Vérifier** https://karlforterre.fr et https://www.karlforterre.fr, sur ordinateur
   et sur téléphone, puis envoyez-vous un courriel à contact@karlforterre.fr pour
   contrôler que la messagerie fonctionne toujours.

**Revenir en arrière** : remettre une seule ligne A `karlforterre.fr` et une ligne A
`www`, toutes deux vers `151.101.192.119`. Le site Adobe réapparaît.

Facultatif :
- ajouter quatre lignes **AAAA** (IPv6) au domaine : `2606:50c0:8000::153`,
  `2606:50c0:8001::153`, `2606:50c0:8002::153` et `2606:50c0:8003::153` ;
- faire vérifier le domaine par GitHub, qui empêche alors tout autre compte de s'en
  servir : photo de profil → **Settings** → **Pages** → **Add a domain**, puis ajouter
  chez OVH la ligne TXT indiquée.

## 3. Après la bascule

- **Adobe** : gardez l'ancien site quelques semaines en secours. Ensuite, dans Adobe
  Portfolio, retirez le domaine personnalisé et dépubliez le site. Portfolio est compris
  dans l'abonnement Creative Cloud : ne résiliez l'abonnement que si vous n'utilisez plus
  ses logiciels (Lightroom, Photoshop…).
- **Anciennes adresses** : `/work`, `/projets`, `/tarifs-des-services`,
  `/copie-de-consulter` et `/copie-de-consulter-1` mènent aux nouvelles pages ;
  `/mentions-legales` garde son adresse. Les liens existants restent valables.
- **Google Search Console** : propriété « Domaine » `karlforterre.fr` (validée par une
  ligne TXT chez OVH), puis déclaration du plan du site
  `https://karlforterre.fr/sitemap.xml`.

## Modifier le site

Tout se fait sur GitHub : ouvrir le fichier, cliquer sur le crayon, modifier, puis
**Commit changes**.

| Quoi | Où |
|---|---|
| Textes : à propos, livres, mémoire, extraits, contact | `index.html` |
| Réalisations graphiques | `index.html`, section « Graphisme » : un bloc `<article>` par projet, un `<button class="graphisme-carte">` par œuvre (la largeur et la hauteur de la vignette dans `width` et `height`) ; les projets d'une ou deux œuvres sont des fiches côte à côte, regroupées dans `<div class="graphisme-grille">` |
| Œuvres du portfolio (trois tirées au hasard à chaque visite) | `script.js`, liste `allWorks` |
| Photos du carrousel, séries et galeries | rien à faire ici : voir « Photographie » plus bas |
| En-têtes (six variantes : un clic sur l'en-tête passe à la suivante) | `js/header-templates.js` |
| Couleurs, polices, mise en page | `styles.css` |
| Mentions légales | `mentions-legales/index.html` |
| Traductions anglaise et chinoise | `js/traductions.js` : voir « Langues » plus bas |

### Photographie : reliée au site photo

La section Photographie se remplit toute seule à partir du site photo : à chaque visite,
elle lit `https://photos.karlforterre.fr/apercu.json`, que le site photo publie chaque
nuit (dépôt Willwonderc/PexelsWillwonder).

- **Carrousel** : les photos en largeur de la Sélection du site photo
  (`vitrine/selection.txt`), dans le même ordre, dix au plus. Le titre est le texte écrit
  après le numéro de la photo, jusqu'au tiret long. « Voir la photo » ouvre sa page sur
  le site photo, et la légende mène à sa série ou à sa galerie.
- **Séries et galeries** : les séries racontées (`vitrine/series.ini`), les galeries par
  lieu (`vitrine/galeries.ini`) et les chiffres Pexels.

Pour changer ces photos, on modifie donc la Sélection du site photo : les deux sites se
mettent à jour ensemble. La liste `photosIntegrees` de `script.js` ne sert qu'en secours,
si le site photo ne répond pas.

### Langues : anglais et chinois

La pastille à côté de « Contact » (FR, EN, 中文) traduit tout le site. Le français de
`index.html` reste la référence : `js/traductions.js` donne, pour chaque phrase
française, son anglais (`en`) et son chinois (`zh`).

- **Corriger une traduction** : ouvrir `js/traductions.js`, chercher la phrase
  française et modifier le texte après `en:` ou `zh:`.
- **Changer une phrase française** dans `index.html`, `script.js` ou
  `js/header-templates.js` : changer aussi sa clé, c'est-à-dire la phrase française
  écrite en tête de ligne dans `js/traductions.js`. Sinon, cette phrase restera en
  français dans les deux autres langues.
- **Titres du site photo** (sélection, séries, galeries) : ils sont traduits par le même
  fichier. Un nouveau titre s'affiche en français tant qu'il n'y a pas été ajouté.
- Le choix de la langue est mémorisé par le navigateur du visiteur. Un lien peut aussi
  l'imposer : `https://karlforterre.fr/?lang=en` ou `?lang=zh`.
- Les liens vers le site photo mènent à sa version anglaise, qui existe pour toutes ses
  pages ; il n'a pas de version chinoise.
- En chinois, les caractères viennent des polices déjà installées sur l'appareil du
  visiteur (PingFang, Microsoft YaHei, Noto…).
- Google continue d'indexer la version française : les traductions s'adressent aux
  visiteurs.

### Ajouter une image

La qualité d'image passe en premier. Chaque œuvre existe en trois tailles, et le
navigateur prend celle qui convient à l'écran du visiteur : la vignette sur un écran
ordinaire, la version moyenne sur un écran haute densité (Retina, téléphone), la grande
dans la visionneuse d'un grand écran. Rien n'est chargé tant que l'œuvre n'approche pas.

1. Partir de l'original le plus grand (TIFF, JPEG ou PDF d'impression) et en tirer trois
   fichiers WebP, qualité 90 :
   - `nom-vignette.webp` : 800 pixels sur le grand côté (1000 pour le portfolio) ;
   - `nom-moyenne.webp` : 1600 pixels ;
   - `nom.webp` : 3200 pixels, ou la taille de l'original s'il est plus petit.

   L'outil gratuit https://squoosh.app le fait dans le navigateur, sans rien installer :
   format **WebP**, **Quality** 90, **Resize** à la taille voulue. Les couleurs doivent
   être en sRGB : un fichier CMJN préparé pour l'imprimeur paraît terne à l'écran
   (Photoshop : **Exporter** → **Exporter sous**, case « Convertir en sRGB »). Ne jamais
   déposer l'original lui-même : le dépôt est public, et ces fichiers sont trop lourds.
2. Leur donner un nom en minuscules, sans espaces ni accents : `affiche-le-plan.webp`,
   `affiche-le-plan-moyenne.webp`, `affiche-le-plan-vignette.webp`.
3. Portfolio : les trois fichiers dans `images/portfolio/`, puis une ligne dans
   `allWorks` (`script.js`).
4. Graphisme : les trois fichiers dans `images/graphisme/`, puis un bloc
   `<button class="graphisme-carte">` copié sur un voisin : y remplacer le nom des
   fichiers (trois fois) et la légende (trois fois), et mettre dans `width` et `height`
   la largeur et la hauteur de la vignette, en pixels.
5. Ajouter la légende et sa traduction à `js/traductions.js` (voir « Langues »).

Pour déposer un fichier : **Add file** → **Upload files**, dans le bon dossier.

## Contenu du dossier

- `index.html`, `styles.css`, `script.js`, `js/` : la page d'accueil et son
  fonctionnement. Dans `js/` : les en-têtes (`header-templates.js`, `header-loader.js`),
  les traductions (`traductions.js`) et le bouton de langue (`langues.js`).
- `images/` : portrait, logo, fond, `portfolio/` et `graphisme/` (pour chaque œuvre,
  vignette, version moyenne et grande image).
- `livres/` : couvertures, livres en PDF et EPUB, mémoire.
- `fonts/` : polices Cormorant Garamond et Inter, hébergées avec le site (licence
  SIL Open Font License), sans appel à Google.
- `mentions-legales/`, `404.html` (page introuvable), `robots.txt`, `sitemap.xml`,
  `favicon.svg`, `apple-touch-icon.png`, `images/partage.jpg` (aperçu lors d'un partage).
- `work/`, `projets/`, `tarifs-des-services/`, `copie-de-consulter/`,
  `copie-de-consulter-1/` : redirections des anciennes adresses d'Adobe.
- `.nojekyll` : demande à GitHub Pages de publier les fichiers tels quels.
