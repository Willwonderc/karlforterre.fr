# Darshan, le livre qui se joue : évaluation et plan

Évaluation rédigée le 28 septembre 2026, à la demande : « les possibilités les plus
ambitieuses et narratives de faire un EPUB de *Darshan*, la narration au premier plan,
spectaculaire, presque un jeu vidéo », en supposant un crédit de session quasi illimité
pour la réalisation.

Point de départ :
- *Darshan*, nouvelle de Karl Forterre (Société des Éditions du Poitou, collection
  Cheminement, 2023) : un poème d'ouverture, sept chapitres, un poème de clôture,
  environ 8 200 mots. Karl en a récupéré tous les droits : le contrat avait une durée
  d'exploitation limitée ;
- l'EPUB actuel (`livres/darshan.epub`, export InDesign d'août 2023) est valide :
  EPUBCheck 5.4.0 ne relève ni erreur ni avertissement ;
- une tranche verticale jouable a été construite pendant cette évaluation, pour juger sur
  pièces : `outils/darshan/` (partie 5).

## En bref

**C'est faisable, en EPUB 3 standard, et *Darshan* s'y prête mieux que presque tout autre
texte.** Son ressort central est déjà une mécanique de jeu : des lunettes qui deviennent
une clé et ouvrent n'importe quelle porte sur n'importe quel lieu du monde. Ses deux points
de vue alternés font deux personnages jouables. Et sa fin permet un geste rare : quand
Darshan renonce à l'immortalité, le jeu lui-même disparaît et le livre redevient un livre.

**La limite n'est pas le crédit, ce sont les liseuses.** Le jeu complet ne tourne que là
où le JavaScript des livres s'exécute : Apple Books (iPhone, iPad, Mac), les applications
Kobo et Thorium, plus quelques autres (partie 2). Google Play Books l'ignore, Kindle le
supprime, les liseuses à encre électronique ne le font pas. D'où trois sorties tirées des
mêmes sources :

1. **l'EPUB jouable**, en pages fixes : le jeu complet là où c'est possible, et partout
   ailleurs un livre illustré où tout le texte reste lisible ;
2. **l'EPUB classique**, refusionnable, corrigé et accessible : liseuses, Kindle, Google ;
3. **l'édition web**, sur karlforterre.fr : le même jeu dans n'importe quel navigateur,
   sans application.

**Piste recommandée : « le livre des portes »** (partie 4). Chaque geste du lecteur naît
d'une phrase du livre, sans jamais en changer un mot. Le monde de Darshan est à l'encre et
à l'aquarelle, comme les toiles que le texte lui prête ; celui de Julie passe par les
photographies de Karl. Les portes franchies forment une constellation. Entre deux
tableaux, une grammaire de transitions dit ce qui se passe : trois coups de pinceau quand
Darshan change de lieu, des bandes obliques façon Persona où claque le titre de chaque
chapitre, les lames d'un obturateur dans le monde photographié de Julie ; quand un objet se
métamorphose, il éclate en grand. À la fin, les étoiles s'éteignent une à une et
l'interface meurt avec la magie. En chiffres : 85 tableaux, découpés et vérifiés contre le
livre ([darshan-decoupage.md](darshan-decoupage.md)), 67 gestes, 77 photographies de Karl
mises en scène, une dizaine de sessions Claude, 0 € de dépenses hors ISBN, la voix de Karl
en option.

## 1. Ce que le texte offre déjà à un jeu

| Dans le texte | Dans le jeu |
|---|---|
| Les lunettes « se transforment, passant de lunettes à une clé au format pincé », « adaptée à la porte par sa finesse ; assortie aux grillages par ses rayures et sa rouille » | Le verbe central : ôter les lunettes, les voir fondre en clé (une clé différente pour chaque porte), l'insérer, tourner, pousser. |
| Des portes qui relient Paris (un toit du seizième, le Triangle d'or, le parc Montsouris, la rue de Rungis, l'hôpital), Aluva sur le Periyar, la bibliothèque nationale de Chine, le désert libyque | Un monde en étoile : chaque chapitre est une porte, et le carnet des portes dessine une constellation. |
| Deux voix : Darshan à la troisième personne avec ses monologues, Julie à la première personne (chapitre 4) | Deux personnages, deux interfaces : le merveilleux de Darshan, le quotidien de Julie (métro, hôpital, téléphone). |
| Jivan, le vieux pêcheur ; Amélie, l'amie au téléphone | Les compagnons, avec leurs dialogues. |
| La quête du père et sa condition : « La clé de sa chambre est la sincérité et sa porte la réciprocité » | La quête principale, et sa porte à la lanterne, entrevue dans la méditation. |
| Des objets nommés : bombe de mousse à raser, coutelas, thés, curcuma, encens, jarres, tapisseries, confettis, charlotte aux framboises au ruban rouge, lettre | Un inventaire. Les confettis, achetés au chapitre 5, ne servent jamais : ils restent dans le sac, sans un mot. |
| Les toiles de Darshan : « des tracés noirs… traits sinueux et harmonieux, ils s'évanouissent en volutes ou en racines prises dans le lin… l'aquarelle irrigue de couleurs en suivant les berges tracées à l'encre de Chine » | La direction artistique, écrite par l'auteur lui-même. |
| Le titre : *darśana*, en sanskrit la vision du divin, un regard réciproque (Britannica) | La caméra subjective : on voit par les yeux de Darshan, et on ne le voit, lui, que par le téléphone de Julie. |
| Le renoncement final : « En faisant de moi un mortel… » et la question : « Y aurait-il un successeur ou serait-ce le temps de la fantasy qui s'achève ? » | La fin du jeu : l'interface s'éteint avec la magie. |

## 2. Ce que permet vraiment l'EPUB en 2026

**La norme le permet.** EPUB 3.3 (Recommandation du W3C, révisée en janvier 2026) admet
les scripts dans les pages du livre. Elle les conseille dans les pages fixes, et demande
qu'un livre à scripts reste lisible sans eux (« progressive enhancement »). La
détection passe par `navigator.epubReadingSystem.hasFeature()`. La mise en page fixe se
déclare page par page, et le son synchronisé au texte (Media Overlays) est prévu par la
norme. EPUB 3.4 est en préparation (brouillon d'août 2026) : AVIF, JPEG XL, et une mise
en page défilante (« roll »), encore à peine testée par les liseuses.

**Les liseuses, c'est autre chose** (sources en fin de document) :

| Liseuse | Scripts | Son, vidéo | Lecture synchronisée | Pages fixes | Pour le livre jouable |
|---|---|---|---|---|---|
| Apple Books (iPhone, iPad, Mac) | oui, pages fixes et refusionnables | oui (AAC) | oui, pages fixes seulement | oui | **jeu complet** |
| Applications Kobo (iOS, Android) | oui | oui, sans lecture automatique | oui en pages fixes | oui | **jeu complet** (à tester) |
| Thorium (ordinateur) | oui | oui | oui | oui | **jeu complet** |
| Calibre, BookFusion, ADE 4.5 | oui, ou annoncé | variable | variable | variable | probable, à tester |
| Google Play Books | non | oui | oui | oui | livre illustré |
| Liseuses Kobo, PocketBook, Vivlio, Tolino | non ou rien de documenté | non | non | oui, lent sur encre | livre illustré, ou EPUB classique |
| Kindle | scripts supprimés à la conversion | non | non | oui | **EPUB classique** |

Ce qui en découle pour la conception :
1. **Un livre complet sans script, le jeu en surcouche.** Kobo le dit sans détour : un EPUB
   illisible sans JavaScript ne passe pas son contrôle qualité.
2. **Détecter les capacités, pas la liseuse.** L'objet `epubReadingSystem` manque dans les
   applications Kobo ; il faut prévoir le toucher, la souris et le clavier.
3. **Chaque page fixe est une page web isolée** chez Apple : l'état se reconstitue page par
   page. La mémoire locale (localStorage) n'est qu'un bonus : Apple ne la sauvegarde pas,
   et la norme permet de la bloquer.
4. **Le son part d'un geste du lecteur**, avec un bouton pour le couper (règle Qualebook
   32). Aucune liseuse ne documente le Web Audio : les sons fabriqués en direct restent un
   bonus, doublé de fichiers AAC ou MP3.
5. **Rien ne vient du réseau** : Apple l'interdit, Calibre et Readium le bloquent. Le livre
   emporte tout avec lui.

## 3. Six pistes, de la plus sage à la plus folle

| Piste | Principe | Récit au premier plan | Spectacle | Sensation de jeu | Fidélité au texte | Portée | Accessibilité | Sessions |
|---|---|---|---|---|---|---|---|---|
| A. Édition classique soignée | Texte corrigé, ouvertures de chapitre illustrées, métadonnées d'accessibilité, voix de Karl synchronisée en option | ●●●●● | ●○○○○ | ○○○○○ | ●●●●● | ●●●●● | ●●●●● | 1 |
| B. Livre illustré et sonore | Pages fixes, un tableau animé par page (CSS, SVG), lecture synchronisée, fond sonore Apple | ●●●●● | ●●●○○ | ●○○○○ | ●●●●● | ●●●●○ | ●●●●○ | 3 à 4 |
| C. Roman visuel | Pages fixes et scripts : texte révélé temps par temps, décors, dialogues, musique, historique | ●●●●○ | ●●●●○ | ●●●○○ | ●●●●● | ●●●○○ | ●●●○○ | 5 à 6 |
| **D. Le livre des portes** | C, plus des gestes tirés du texte, deux mondes visuels, carnet et inventaire, fin qui éteint l'interface | ●●●●● | ●●●●● | ●●●●○ | ●●●●● | ●●●○○ (web : ●●●●●) | ●●●●○ | 9 à 10 |
| E. Aventure à embranchements | Choix, scènes et fins alternatives (ouvrir la porte du père…) | ●●○○○ | ●●●●○ | ●●●●● | ●○○○○ | ●●●○○ | ●●●○○ | 10 et plus, et Karl écrit |
| F. Monde en 3D | Toits, désert, bibliothèque explorables à la première personne (WebGL) | ●○○○○ | ●●●●● | ●●●●● | ●●●○○ | ●○○○○ (web seulement) | ●○○○○ | 15 et plus |

- **A** doit exister de toute façon : c'est l'édition de repli (Kindle, encre électronique)
  et la base du texte corrigé.
- **B** est la piste sûre : elle marche presque partout sans script, mais reste un bel
  album plutôt qu'un jeu.
- **C** donne l'allure d'un jeu, mais débiter la prose en bulles abîme les longues phrases
  de Karl. Le bouton « Lecture », qui rend la page entière, y remédie.
- **D** est la plus ambitieuse **sans rien sacrifier du récit** : pas de score, pas
  d'échec, pas de chronomètre, pas une phrase ajoutée au texte. C'est la recommandation.
- **E** est la plus « jeu vidéo », mais elle contredit le livre, dont le sens est
  justement un renoncement. Elle obligerait aussi Karl à écrire des scènes nouvelles.
  Variante acceptable : des portes secrètes vers des contenus qui existent déjà (ses
  photographies, *L'Histoire de Mélusine*), si Karl le souhaite.
- **F** est spectaculaire sur le web, impraticable en EPUB : WebGL n'est documenté par
  aucune liseuse, le poids explose, et le texte passe au second plan. À garder, au plus,
  pour une scène bonus de l'édition web.

**Modules à ajouter à D :** la voix de Karl synchronisée au texte ; l'édition web ; les
traductions anglaise et chinoise (le site est trilingue, et le compte RedNote parle au
public chinois : la scène de la bibliothèque de Pékin lui fera signe) ; une bande-annonce
tirée du jeu par le studio vidéo du dépôt PexelsWillwonder.

## 4. La piste recommandée : le livre des portes

### Principes

1. **Le texte d'abord.** Tous les mots de l'édition 2023, dans l'ordre, sans en changer
   un seul, hormis les coquilles que Karl aura validées (annexe A). Le programme vérifie
   que le texte du livre jouable est identique à la source. Le bouton « Lecture » affiche
   tout, sans animation. Pas d'échec, pas de score, pas de minuterie.
2. **Chaque geste naît d'une phrase.** Aucun mini-jeu gratuit : le lecteur fait ce que la
   phrase raconte (ôter les lunettes, un geste vif, un tour de poignet, pousser la porte,
   enjamber les tuiles cinq par cinq, le mudrā, essuyer la buée d'une vitrine, verser le
   thé de haut, frapper à la porte du local, glisser la lettre sous la porte).
3. **Deux mondes, deux matières.** Darshan : encre de Chine et aquarelle, ses propres
   toiles. Julie : les photographies de Karl (Paris, le RER B, les terrasses, la pluie).
   Au dernier chapitre, les deux se rencontrent : la porte du père, peinte, perce le
   trottoir photographié.
4. **La vue plutôt que le personnage.** Caméra subjective, fidèle au titre : on voit par
   les yeux de Darshan. On ne voit son visage que dans les photos du téléphone de Julie
   (chapitre 5) et sur la couverture.
5. **L'interface meurt avec la magie.** Quand Darshan demande à devenir mortel, la clé
   quitte l'inventaire, les étoiles du carnet s'éteignent (« Les astres peuvent s'éteindre
   tant que je peux t'étreindre »), les boutons disparaissent, et les dernières pages sont
   du texte nu sur papier.
6. **Un seul fichier qui marche partout, gratuit et accessible.** Amélioration
   progressive, aucune dépendance, aucun appel réseau ; mouvement réduit, clavier,
   lecteurs d'écran.

### Chapitre par chapitre

Un tableau, c'est une page fixe : un décor, son texte, parfois un geste. Le découpage
complet, [darshan-decoupage.md](darshan-decoupage.md), en compte 85, de 40 à 160 mots
(99 en moyenne) : pour chacun, son texte (vérifié contre le livre par programme), son
lieu, son décor et les photos de Karl, ses gestes, ses objets et leurs changements
d'état, sa transition d'entrée, son son, et les photos qui manquent encore. Il est écrit
par `outils/darshan/decoupage.py`. Ci-dessous, l'esprit de chaque chapitre.

**Poème d'ouverture** (145 mots avec la dédicace). Le ciel étoilé photographié par Karl ;
les vers se déposent un à un ; au dernier (« La noirceur figée finit toujours par
embrasser son éblouissante frontière »), l'aube monte à l'horizon. *Fait dans la tranche
verticale.*

**1. Un ciel mouvant** (854 mots). Nuit sur un toit du seizième : la voûte tourne lentement
autour du pôle, deux étoiles filantes se poursuivent (« Des étincelles passent et se
chassent »), la voix du père s'écrit en lumière d'étoile. Le lecteur enjambe les tuiles
en rythme jusqu'au pigeonnier. Les lunettes vibrent, changent de couleur, fondent en clé ;
la clé entre dans la serrure, le soleil de Kerala filtre par les jours de la porte ; un
tour de poignet, la porte se déconsolide, on pousse : éblouissement, et la poussière
danse dans la lumière d'Aluva. *Fait jusqu'ici dans la tranche verticale.* Suite : le
lecteur dessine au doigt la moustache de mousse et taille le bouc (« il dessine sa
moustache puis taille son bouc avec soin ») ; Jivan trie ses maquereaux ; quand Darshan
parle de Paris, « le regard perdu dans les remous du Periyar », Paris apparaît dans le
reflet du fleuve.

**2. Un pain perdu s'il vous plaît** (933 mots). Premier chapitre photographique. Au
restaurant, tout est flou sauf Julie : on n'entend sa question qu'en « se réveillant » (un
toucher), comme Darshan (« Quoi ?! »). Retour en arrière sur la rencontre devant la
vitrine (guêtres ou robe volantée). La brioche perdue sur sa porcelaine jaune tournesol.
Le parc Montsouris, le pont de branches, le merle qui fait son nid, la maison de lierre.
À la dernière phrase, un nuage passe, au sens propre, sur l'image.

**3. Entre deux mondes** (1 340 mots). Le chapitre cosmique. Le « trou dans un mur de
terre et de paille » devient une entrée, puis défile une histoire des portes à travers
les âges. La bibliothèque nationale de Chine, vertigineuse ; les deux vers du recueil
sanskrit s'inscrivent à l'encre. Sortie par la porte des toilettes du personnel, retour
au Periyar. **Le mudrā** : le lecteur pose ses deux pouces l'un contre l'autre sur l'écran
et suit sa respiration (« Son inspiration l'emplit de braises. L'expiration extirpe tout
trouble interne »). Du noir vient la couleur, la lanterne s'allume, la porte inconnue
paraît ; il tend la main, la lumière faiblit. Sur ordinateur, deux touches maintenues.

**4. Amélie et Julie** (744 mots). Julie à la première personne : l'interface change de
monde. Le RER qui vibre (la photo du RER B de Karl) ; les questions de l'hôpital défilent
jusqu'à devenir la « prosodie de ces vers incompris », avec l'échelle de la douleur « de
zéro à dix » en curseur. Les messages à Amélie s'écrivent, mais leur contenu n'est pas
dans le livre : on ne voit que des bulles en train de s'écrire, sans rien inventer.

**5. Douceurs et confettis** (1 225 mots). Montage alterné : les soixante-douze heures de
Julie en compte à rebours, et le marché d'Aluva où l'on remplit l'inventaire (thés,
curcuma, encens, jarres, tapisseries, confettis) avec Jivan essoufflé derrière. La
galerie du téléphone de Julie, qu'on fait défiler : Darshan grimaçant sous les bonbons
piquants, sur la glace, devant son chevalet au bord de la Seine, et la vidéo où il chante
une ballade italienne à contre-jour de la lune. La pâtisserie : le lecteur essuie la buée
de la vitrine du doigt et découvre la charlotte aux framboises.

**6. Des attentes de part et d'autre** (1 477 mots). Écran partagé : deux listes cochées
en parallèle (« Veste, barbiche… » et « Bague, boucles d'oreilles, gâteau… »). Le ruban
rouge dans le vent. L'appartement, qu'on explore : poufs de velours, encens, les toiles
à l'encre et la seule aquarelle, le couple qui danse. Le thé versé de haut dans la tasse
de cuivre, « Le lac Ladoga » de Théodore Banzy. Puis « je t'aime », et le lecteur, comme
Darshan, attend la porte… qui ne vient pas. Les clés ouvrent des portes « qui ne mènent
nulle part » : un montage de paysages absurdes. La même fonte visqueuse des lunettes, vue
cette fois par les yeux de Julie. Le placard qui s'ouvre sur le parc Montsouris. Julie
seule avec son paquet au ruban rouge.

**7. Au-delà de la porte** (1 518 mots, avec le poème de clôture). Le désert libyque sous
des « astres fuyants » ; l'intermède de la coccinelle qui prépare sa diapause ; Julie
devant sa série, la voix d'Amélie au téléphone (ses mots sont dans le livre). « Darshan voit
le désert fleurir sous l'averse » : le désert se couvre de fleurs d'aquarelle. À
l'hôpital, le lecteur frappe à la porte du local : « Darshan, tu m'entends ? », et rien.
La lettre s'écrit trait par trait ; on ne peut pas l'effacer (« Les mots sont encrés :
plus rien ne peut les effacer ») ; glissée sous la porte du local à kayaks, elle jaillit
de la fente de la pharmacie. La course rue de Rungis, le paquet au ruban rouge, le baiser.
« Le contact de leurs corps éclipse tout Paris » : passants et voitures s'effacent de la
photographie, le son se tait. Le trottoir se fend, la porte à la lanterne surgit : seule
image où l'encre de Darshan perce le Paris photographié de Julie. Le lecteur a la clé en
main depuis le début, et cette fois il ne s'en sert pas : il pose la paume sur le bois,
comme Darshan, pour la prière. Le bruit sourd, la porte s'effondre sans laisser de trace.

**La fin.** La clé quitte l'inventaire, les étoiles du carnet s'éteignent une à une, les
boutons s'effacent. Le poème de clôture et la dernière question (« Ne sentez-vous pas
toujours cette distance qui se crée en fermant votre porte ? ») s'affichent en texte nu.
Dernier geste : fermer le livre. Au retour, si la liseuse a gardé la mémoire, la page de
titre montre un ciel sans constellation, et « Nouvelle lecture » rallume tout. Option
personnelle, que seul Karl peut décider : la dédicace est à Maëlle ; une vraie photo pour
dernière image serait une façon de dire que « le plus beau des récits est une anecdote ».

### Systèmes de jeu

| Système | Rôle | Exigence de fidélité |
|---|---|---|
| Temps de texte | Le texte se révèle phrase par phrase ; le précédent reste atténué ; « Lecture » montre tout | Texte vérifié automatiquement contre la source |
| Gestes | Toucher, glisser, maintenir, deux pouces (mudrā), essuyer, verser | Chacun a un équivalent au toucher simple et au clavier |
| Carnet des portes | Les portes franchies s'allument comme des étoiles sur une carte du ciel | Lieux et portes tirés du texte |
| Inventaire | Le sac de Darshan, le sac à main de Julie | Objets nommés par le texte |
| Deux interfaces | Or et encre pour Darshan ; téléphone et photographie pour Julie | Aucun message inventé dans le téléphone |
| Son | Ambiances par lieu, effets des gestes, musique | Coupable à tout moment ; rien d'automatique avant un geste |
| Voix (option) | Karl lit son livre ; les phrases s'éclairent pendant la lecture | Enregistrement de Karl, aligné par programme |

Les textes d'interface (« Touchez les lunettes pour les ôter ») sont les seuls textes
nouveaux. Ils restent courts, dans le ton du livre, et Karl les valide ; une version à
pictogrammes seuls reste possible.

## 5. La preuve : une tranche verticale jouable

Construite dans cette session (`outils/darshan/`, mode d'emploi dans son README) : le
poème d'ouverture et le début du chapitre 1, jusqu'à l'arrivée à Aluva. Six tableaux,
environ 430 mots, soit 5 % du livre.

- **Texte** : extrait par programme de `livres/darshan.epub` ; le programme vérifie que
  chaque paragraphe, découpé en temps, redonne exactement l'original.
- **Images** : le ciel étoilé et les tuiles viennent des photos de Karl sur Pexels ; les
  toits, la tour Eiffel, le pigeonnier, la porte et Aluva sont dessinés par programme
  (SVG), puis photographiés par Chromium.
- **Gestes** : la danse sur les tuiles ; les lunettes qui vibrent et fondent en clé rouillée
  (effet « visqueux ») ; la clé portée à la serrure ; les jours de la porte qui s'allument ;
  le tour de poignet ; la porte poussée.
- **Son** : fabriqué en direct, sans fichier : vent de nuit et rumeur de la ville ; puis le
  fleuve, les oiseaux et un tanpura à Aluva.
- **Sorties** : un EPUB 3 en pages fixes, `darshan-extrait-jouable.epub` (1,6 Mo), et la même
  chose en page web.
- **Interface d'objet** (ajoutée le même jour) : fiche des lunettes et de la clé, faite de
  phrases du livre déjà lues, bouton « Objets », annonce « Nouvel objet », halo, consigne
  différée, geste proposé en bouton ([plan-darshan-interface.md](plan-darshan-interface.md)).
- **Transitions** (ajoutées le même jour) : la lumière jaillit du bouton « Ouvrir » ; le
  titre « Un ciel mouvant » claque sur des bandes obliques ; trois coups de pinceau mènent
  aux tuiles ; un iris se referme sur le pigeonnier ; quand les lunettes fondent, la clé
  éclate en grand avec « elles se transforment », puis sa fiche s'ouvre en diagonale ;
  l'annonce « Nouvel objet » claque depuis la gauche et l'objet vole jusqu'au bouton
  « Objets » ; Aluva paraît dans l'embrasure de la porte. Dans l'EPUB, chaque page joue
  son entrée en s'ouvrant. Un banc d'essai (`transitions.html`) montre aussi l'obturateur
  et le glissement du monde de Julie, sur trois photos de Karl, et une photo de Karl
  passée à l'encre par programme.

Résultats :
- **EPUBCheck 5.4.0 : 0 erreur, 0 avertissement.**
- La partie jouée par programme dans Chromium, sur téléphone, sur ordinateur et en
  mouvement réduit, traverse les six scènes sans aucune erreur ; chaque transition du
  banc d'essai se joue et ne laisse aucun calque derrière elle.
- **Sans script**, chaque page reste un livre illustré où tout le texte se lit.
- **Pas encore essayé dans Apple Books** ni dans l'application Kobo : aucun Mac ni iPhone
  dans la session. C'est le premier test à faire (partie 9).

Ce qu'elle prouve : qu'un livre jouable tient dans la norme ; que le code peut dessiner
une direction artistique cohérente ; que le texte reste intouché. Ce qu'elle ne prouve
pas : la qualité d'illustration d'une centaine de tableaux, le rendu sur les vraies
liseuses, et l'intérêt d'un lecteur pendant quarante minutes.

## 6. Architecture technique

- **Format.** EPUB 3.3 (vérifié aussi aux règles 3.4). Livre jouable en pages fixes au
  format 2:3, proche du livre de poche : une page de 1200 × 1800 unités, des images de
  1600 × 2400 pixels pour rester nettes sur tablette. Apple limite les images de page
  fixe à 5,6 mégapixels : 1600 × 2400, soit 3,8 mégapixels, reste en dessous. Le
  choix des pages fixes tient aussi à Apple Books : c'est le seul mode où il lit le son
  synchronisé au texte. Le texte de chaque page est du vrai texte (sélectionnable,
  lisible par VoiceOver), jamais une image.
- **Moteur.** Un seul fichier JavaScript sans dépendance (quelques dizaines de Ko,
  minifié : règle Qualebook 68). Il gère les temps de texte, les gestes, les sons, les
  particules, les métamorphoses en SVG, les transitions (balayages entre tableaux, éclats
  d'objet), le carnet, l'inventaire et l'accessibilité. Chaque
  page déclare sa scène par des attributs ; l'état se reconstitue page par page, et la
  mémoire locale n'est qu'un bonus.
- **Images.** Décors dessinés par programme (Python, SVG) : toits, portes, palmiers,
  fleuve, rayonnages, désert, lanterne. Ils sont rendus en JPEG ou WebP par Chromium. Les
  photos de Karl viennent de Pexels, en pleine définition : telles quelles dans le monde de
  Julie, ou passées à l'encre et à l'aquarelle par programme pour celui de Darshan
  (`images.py encre`, à régler décor par décor). Le découpage en attribue 77 ; en option,
  une séance de repérage à Paris (parc Montsouris, rue de Rungis, une vitrine de
  pâtisserie, un couloir d'hôpital) sur une liste de 21 plans. Les illustrations assistées par IA
  restent une option à débattre : elles contrediraient le parti pris d'un auteur qui
  photographie et dessine lui-même.
- **Son.** Ambiances fabriquées en direct, doublées de fichiers AAC pour Apple. Musique et
  sons libres : CC0 d'abord, CC BY avec crédit. Pour le tanpura, par exemple, le pack de
  sankalp sur Freesound (CC BY 4.0) ; pour la ballade italienne, *Torna a Surriento*,
  dont les auteurs sont morts en 1926 et 1937 (domaine public, à confirmer), plutôt que
  *'O sole mio*, dont un coauteur reconnu est mort en 1972. Aucun son de la BBC (licence
  non commerciale).
- **Voix de Karl (option).** Environ une heure d'enregistrement (8 200 mots). L'alignement
  sur le texte est automatique : Storyteller et son outil stalign (licence MIT, phrase par
  phrase), ou Montreal Forced Aligner (modèle français CC BY 4.0, mot par mot). En
  secours, une voix de synthèse libre (Piper « siwis » ou « mls », CC BY 4.0), à créditer.
- **Fabrication.** Un programme Python lit les sources et écrit les trois éditions ; les
  tableaux viennent des données du découpage (`outils/darshan/decoupage.py`). Une
  tâche GitHub « Darshan » le relance à chaque modification, sur le modèle de la tâche
  « Pages en anglais et en chinois ». Elle vérifie avec EPUBCheck et Ace by DAISY, joue
  le livre dans Chromium et en photographie chaque page pour la relecture de Karl. Karl
  ne lance jamais rien lui-même.
- **Emplacement.** Tout reste dans ce dépôt : sources dans `outils/darshan/`, EPUB dans
  `livres/`, édition web dans `darshan/` (non référencée tant qu'elle n'est pas prête).
  Un dépôt à part serait plus propre, mais ajouterait un second site à surveiller.

## 7. Droits, édition, accessibilité

- **Droits.** Karl a récupéré tous ses droits : son contrat avec la Société des Éditions
  du Poitou (SEP) avait une durée d'exploitation limitée. L'accord de la SEP n'est donc
  plus nécessaire, et Karl publie lui-même. Son édition remplace le nom, le logo et la
  mention « © SEP » de 2023, ainsi que le logo de la collection Cheminement, qui est une
  collection de la SEP.
- **ISBN de 2023** (vérifié le 28 septembre 2026) :

  | Question | Constat |
  |---|---|
  | Numéros valides ? | Oui : 978-2-9588873-3-9 (papier), 978-2-9588873-4-6 (EPUB) et 978-2-9588873-2-2 (*L'histoire du petit Théo*) ont une clé de contrôle correcte. Le préfixe 978-2-9588873 donne un bloc de dix numéros. |
  | À qui est le préfixe ? | Non vérifié : le registre mondial des éditeurs de l'agence internationale de l'ISBN était en maintenance. Le livre le rattache à la SEP, toujours en activité (SIREN 303 458 988, gérant Eric Rimbault). |
  | Catalogue de la BnF | Aucune notice pour les trois numéros : le dépôt légal n'y apparaît pas. |
  | Commerce du livre | Aucun résultat sur leslibraires.fr, qui puise dans la base professionnelle des libraires : les livres n'y sont pas référencés. |
  | Autres bases | Rien dans Open Library ; Google Books n'a pas répondu (quota dépassé). |

  **Un ISBN n'expire pas et n'a pas d'état « actif »** : selon l'AFNIL, « une fois attribué,
  un ISBN ne doit jamais être utilisé de nouveau ». Ces numéros restent attachés à
  l'édition SEP de 2023, et Karl ne peut pas les reprendre pour la sienne : « C'est
  seulement quand vous allez rééditer les livres sous votre nom d'éditeur que vous leur
  attribuerez de nouveaux ISBN » (AFNIL). Chaque format a le sien : « un numéro différent
  pour chaque format utilisé », soit un pour l'EPUB jouable, un pour l'EPUB classique, un
  pour le PDF, un pour la voix. L'ISBN n'est pas obligatoire, mais l'AFNIL le juge
  « souhaitable » pour tout livre accessible au public, gratuit ou non ; il identifie le
  livre auprès de la BnF, des libraires et des bases de données. Tarif de l'AFNIL pour une
  première demande : 37 € HT en trois semaines, 87 € HT en une semaine ; liste
  complémentaire : 28 € HT.
- **Métadonnées.** Celles de l'EPUB de 2023 sont à reprendre dans l'édition de Karl : il se
  déclare en français **et en hindi** (`hi-IN`), et son ISBN, 978-2-9588873-4-6, n'y figure
  pas.
- **Couverture.** La photographie d'Arianna Jadé vient de Pexels, sous la licence Pexels :
  usage commercial et modification permis, y compris sur un livre, sans autorisation à
  demander ; le crédit est facultatif (il figure déjà au colophon). Si la couverture
  assemble plusieurs photos Pexels, la même règle vaut pour chacune. Deux limites de la
  licence comptent pour le jeu : ne pas montrer le modèle, reconnaissable, sous un jour
  dégradant ou offensant ; ne pas laisser croire qu'il recommande le livre (il incarne
  Darshan, il ne le présente pas). Garder l'adresse de chaque photo sur Pexels et la date
  du téléchargement : une photo peut être retirée plus tard du site. Seuls les logos de la
  SEP et de la collection Cheminement sont à retirer.
- **Polices.** Amiri et Unna (celles du livre) et Tiro Devanagari Sanskrit (pour दर्शन)
  sont sous licence SIL OFL : incorporation permise, même allégée.
- **Photos de Karl** : les siennes. **Sons et musiques** : un fichier des licences et des
  crédits, vérifié par la fabrication.
- **Textes nouveaux** : seulement ceux de l'interface, validés par Karl. Ni citation ni
  extrait inventé ; le téléphone de Julie n'affiche que ce que le livre dit.
- **Accessibilité.** Depuis le 28 juin 2025, l'acte européen d'accessibilité s'applique
  aux livres numériques. En France (article 48 de la loi n° 2005-102, modifié en 2023),
  les entreprises de moins de dix personnes et de moins de deux millions d'euros de
  chiffre d'affaires en sont exemptées, sans démarche. Karl, qui publie seul, est bien en
  dessous de ces seuils ; le livre visera quand même le niveau d'accessibilité EPUB 1.1 (WCAG AA) :
  - métadonnées schema.org, et le danger « motionSimulation » déclaré ;
  - mode lecture, mouvement réduit, clavier, annonces aux lecteurs d'écran ;
  - sons et animations qu'on peut arrêter ; sous-titres des sons qui portent du sens.

## 8. Chantiers

Le plan de l'interface, [plan-darshan-interface.md](plan-darshan-interface.md), ajoute six
chantiers (I1 à I6 : fiches d'objet, carnet et regard, dialogues et monde de Julie,
confort, mise en scène, accessibilité). Ils s'intercalent ici : I1 et I2 avant D3, I3
avant D5, I4 à I6 avec D8 et D9.

Chaque chantier tient en une session et se termine par une pull request. Les sessions
passent d'abord sur la branche : **pousser le travail à chaque étape**. Le 28 septembre, le
dossier de travail d'une session a été vidé en cours de route ; seul le travail poussé est
sûr.

| Chantier | Contenu | Réussi quand |
|---|---|---|
| D1. Fondations | Texte source unique (et corrections validées) ; moteur tiré du prototype ; fabrication des trois éditions ; tâche GitHub avec EPUBCheck, Ace, partie jouée et captures ; EPUB classique corrigé, aux mentions de Karl (ISBN à son nom s'il en a pris un), avec métadonnées d'accessibilité | L'EPUB classique passe EPUBCheck et Ace ; Karl a ouvert l'extrait jouable dans Apple Books sur son iPhone et son Mac |
| D2. Direction artistique | Bible visuelle (encre et aquarelle, traitement des photos) ; générateurs des éléments récurrents ; passage à l'encre des photos de Karl réglé décor par décor ; une trentaine de décors. La sélection des photos et la liste des repérages sont faites dans le découpage | Karl valide la planche des décors et la sélection des photos |
| D3. Chapitres 1 et 2 | Tableaux 0.1 et 1.4 à 2.10 du découpage : Jivan, la moustache, Paris dans le Periyar ; le restaurant, le souvenir de la vitrine, Montsouris | Les deux chapitres se jouent du début à la fin |
| D4. Chapitre 3 | Tableaux 3.1 à 3.14 : histoire des portes, bibliothèque de Pékin, vers sanskrits, mudrā à deux pouces, porte à la lanterne | Idem |
| D5. Chapitres 4 et 5 | Tableaux 4.1 à 5.11 : interface de Julie, métro, hôpital, marché et inventaire, galerie du téléphone, vitrine embuée | Idem |
| D6. Chapitre 6 | Tableaux 6.1 à 6.15 : listes parallèles, appartement, thé versé, portes qui ne mènent nulle part, placard | Idem |
| D7. Chapitre 7 et fin | Tableaux 7.1 à 8.1 : désert en fleurs, porte du local, lettre, Paris qui s'efface, porte qui perce le trottoir, prière, extinction de l'interface | Le livre se joue en entier |
| D8. Son et voix | Passe sonore complète ; voix de Karl alignée ; fichier des licences | Toutes les pages ont leur son, coupable ; la lecture synchronisée marche dans Apple Books |
| D9. Accessibilité, essais, parution | Ace sans erreur grave ; essais sur appareils ; édition web ; dossiers Apple Books et Kobo ; bande-annonce par le studio vidéo | Karl approuve la version finale |
| D10. Traductions (option) | Anglais et chinois, avec relecture littéraire | Idem en trois langues |

### Consignes prêtes à coller

Nouvelle session sur le dépôt Willwonderc/karlforterre.fr, une à la fois, dans l'ordre ;
fusionner la pull request avant de lancer la suivante.

```text
Chantier D1 de docs/plan-darshan.md : fondations du livre jouable.
1. Pars du prototype d'outils/darshan/. Crée la source unique du texte, tirée par programme de livres/darshan.epub, et une liste des corrections (annexe A du plan) que j'aurai cochées ; ne corrige rien que je n'aie validé.
2. Moteur : reprends outils/darshan/src/moteur.js, découpé en modules lisibles, sans dépendance, minifié à la fabrication. État reconstitué page par page ; la mémoire locale n'est qu'un bonus.
3. Fabrication (outils/darshan/build.py) : EPUB jouable en pages fixes au format 2:3 (page de 1200 × 1800, images de 1600 × 2400), EPUB classique refusionnable corrigé (mentions de Karl à la place de celles de la SEP, ISBN à son nom si je t'en donne un, langue fr seule, métadonnées d'accessibilité), édition web dans darshan/ (noindex). Vérifie que le texte de chaque édition est identique à la source.
4. Tâche GitHub « Darshan » (sur le modèle de langues.yml) : fabrication, EPUBCheck 5.4.0 avec --failonwarnings, Ace by DAISY, partie jouée dans Chromium avec une capture par page, pages de relecture en pièce jointe.
5. Pousse ton travail sur la branche à chaque étape. Ouvre une pull request vers main et donne-moi les fichiers à essayer dans Apple Books sur mon iPhone et mon Mac.
```

```text
Chantier D2 de docs/plan-darshan.md : direction artistique.
Écris la bible visuelle (docs/darshan-bible-visuelle.md) : monde de Darshan à l'encre et à l'aquarelle d'après la description de ses toiles au chapitre 6, monde de Julie en photographies (les miennes, sur Pexels), règles de couleur, de lumière et de typographie (Amiri, Unna), grammaire des transitions (docs/darshan-decoupage.md). Écris les générateurs des éléments récurrents (toits, portes et clés, palmiers, fleuve, rayonnages, désert, lanterne) et une trentaine de décors ; règle le passage à l'encre de mes photos (outils/darshan/images.py, commande encre) pour chaque photo que le découpage marque « encre ». Reprends la sélection de mes photos et la liste des repérages du découpage, en y changeant ce que je te demande. Montre-moi une planche de tous les décors avant d'ouvrir la pull request.
```

```text
Chantier D3 (puis D4, D5, D6, D7, en changeant le numéro et les chapitres) de docs/plan-darshan.md : chapitres 1 et 2 du livre jouable.
Suis docs/darshan-decoupage.md tableau par tableau (section « Production », chantier D3) : texte, décor, photos, gestes, objets et leurs états, transition d'entrée, son. Fabrique les tableaux à partir des données de outils/darshan/decoupage.py plutôt que de les recopier. Chaque geste doit naître d'une phrase du livre, avec un équivalent au toucher simple et au clavier. Aucun texte nouveau hors interface ; les textes d'interface sont courts et je les valide. Vérifie la partie jouée (téléphone, ordinateur, mouvement réduit) et le mode sans script dans Chromium, envoie-moi les captures, puis ouvre la pull request.
```

```text
Chantier D8 de docs/plan-darshan.md : son et voix.
Passe sonore complète (ambiances par lieu, effets des gestes, musique libre de droits avec son fichier de licences). Si j'ai déposé mon enregistrement dans outils/darshan/voix/, aligne-le sur le texte (Storyteller/stalign ou Montreal Forced Aligner) et produis les Media Overlays ; sinon, prépare tout pour qu'il suffise de le déposer. Le son part toujours d'un geste et se coupe à tout moment.
```

```text
Chantier D9 de docs/plan-darshan.md : accessibilité, essais et parution.
Ace by DAISY sans erreur grave, mode lecture, mouvement réduit, clavier, lecteurs d'écran. Prépare pour moi une fiche d'essai sur iPhone, Mac, application Kobo et Thorium, puis corrige ce que je rapporte. Mets l'édition web en ligne sur karlforterre.fr/darshan/, prépare les dossiers Apple Books et Kobo Writing Life, et une bande-annonce avec le studio vidéo du dépôt PexelsWillwonder.
```

## 9. Ce que Karl décide et fait

1. **Choisir la piste** (D recommandée) et le titre de l'édition (« le livre des portes »
   n'est qu'un nom de travail).
2. **Ouvrir l'extrait jouable dans Apple Books**, sur l'iPhone et sur le Mac, et dire ce
   qui marche : le test qui compte le plus, avant tout le reste.
3. **Prendre un ISBN à son nom** auprès de l'AFNIL, un par format (37 € HT la première
   demande, trois semaines), s'il veut que le livre soit référencé ; garder la
   couverture (photo Pexels, usage commercial permis) en retirant les logos de la SEP et de
   Cheminement, ou en dessiner une nouvelle.
4. **Valider les coquilles** de l'annexe A, une par une.
5. **Décider de la voix** : enregistrer le livre soi-même (une heure environ, au Dictaphone
   de l'iPhone), ou non.
6. **Choisir la ballade italienne** du chapitre 5 et valider les textes d'interface.
7. **Valider la sélection de ses photos** dans le découpage (77, avec leur tableau). Deux
   montrent une personne : le portrait 38536478 (lunettes, moustache, bouc : un Darshan
   possible, seulement avec l'accord écrit du modèle) et « Dos » (33035648, une jeune femme
   de dos, pour Julie) ; Karl sait qui y figure et ce qu'il peut en faire.
8. En option : **une demi-journée de repérages photo à Paris**, sur la liste des 21 plans
   qui clôt le découpage.

## 10. Risques et garde-fous

| Risque | Garde-fou |
|---|---|
| Le jeu ne tourne pas dans une liseuse | Amélioration progressive, EPUB classique, édition web |
| Les gestes d'Apple Books (tourner la page) avalent les glissements | Pas de glissement horizontal ; un toucher simple suffit toujours ; essai sur appareil dès D1 |
| Le Web Audio muet dans une liseuse | Fichiers AAC et MP3 en secours ; le son reste facultatif |
| Mémoire locale absente | État tiré de la page où l'on se trouve |
| Texte altéré par erreur | Comparaison automatique avec la source à chaque fabrication |
| Poids ou lenteur sur un vieil appareil | Décors précalculés, peu de filtres en direct, mode mouvement réduit ; moins de 60 Mo avec la voix |
| Direction artistique inégale sur 85 tableaux | Bible visuelle et générateurs communs (D2) ; planche validée par Karl |
| Ambition qui déborde | Un chapitre par session, chacun jouable et validé avant le suivant |
| Travail perdu en cours de session | Pousser sur la branche à chaque étape |

## 11. Mesures de réussite

| Indicateur | Cible |
|---|---|
| Mots de l'édition 2023 présents, à l'identique (hors corrections validées) | 100 % |
| EPUBCheck 5.4.0, avertissements compris | 0 |
| Ace by DAISY, violations graves | 0 |
| Liseuses où le jeu se joue en entier | Apple Books (iOS, macOS), Thorium, application Kobo |
| Liseuses où tout le texte se lit | toutes |
| Poids du livre jouable, voix comprise | moins de 60 Mo |
| Temps de Karl hors voix et repérages | moins d'une heure par chantier (relecture et essais) |
| Coût | 0 €, hors ISBN (37 € HT la première demande à l'AFNIL, si Karl en prend) |

## Annexe A. Coquilles relevées

Elles figurent à l'identique dans le PDF imprimé et dans l'EPUB. Aucune n'est corrigée sans
l'accord de Karl.

Certaines :

| Où | Texte actuel | Proposition |
|---|---|---|
| Dédicace | « qui trouvent une l'intensité inégalée » | « une intensité inégalée » |
| Ch. 1 | « En son sein l'eau boue » | « l'eau bout » |
| Ch. 1 | « Il s'y s'énerve » | « Il s'y énerve » |
| Ch. 1 | « —Je ne suis toujours pas », « —Tu ne connais pas » | espace après le tiret |
| Ch. 2 | « il n'en n'a que pour elle » | « il n'en a » |
| Ch. 2 | « ses yeux d'Ocre » | « d'ocre » |
| Ch. 2 | « ne sait pas encore ou il va recevoir Julie » | « où » |
| Ch. 3 | « les responsabilités qu'incombe le statut de mortel » | « qui incombent au statut de mortel » |
| Ch. 3 | « La richesse de l'intellect leurs est offerte » | « leur » |
| Ch. 3 | « un recueil de poèmes sanskrit » | « sanskrits » |
| Ch. 3 | « dépourvu d'air ou seul l'esprit a corps » | « où » |
| Ch. 3 | « Il n'y pas de doute possible, le message est clair » | « Il n'y a pas » |
| Ch. 3 | « un présent que je pourrai t'offrir. » | « pourrais », et un point d'interrogation |
| Ch. 4 | « de mon lieu de mon travail » | « de mon lieu de travail » |
| Ch. 5 | « quel devrait-être son parfum ? » | « quel devrait être » |
| Ch. 5 | « trois feuilles de sucres » | « de sucre » |
| Ch. 6 | « puis elle ajoute : tu es beau sans tes lunettes, ajoute Julie » | un seul « ajoute » |
| Ch. 6 | « Elle se saisit de la poignet » | « la poignée » |
| Ch. 6 | « chaque mot émit par Darshan » | « émis » |
| Ch. 6 | « à la anse de la théière » | « à l'anse » |
| Ch. 6 | « s›étonne Julie … d›un index » | apostrophes (un chevron s'est glissé à la place) |
| Ch. 6 | « mordu aux sangs » | « au sang » |
| Ch. 6 | « la voie nouée par l'émotion » | « la voix » |
| Ch. 7 | « désert Lybique » | « désert libyque » |
| Ch. 7 | « le trottoir de la rue Rungis » | « rue de Rungis », comme ailleurs dans le chapitre |
| Colophon | « © Société editions du poitou », « ISBN: » | sans objet dans l'édition de Karl, qui a son propre colophon |

À vérifier (peut-être voulu) :
- la première réplique de chaque dialogue n'a ni tiret ni guillemet, alors que les
  suivantes ont leur tiret ;
- « une amande de mousse à raser » (une noisette ?) ; « Des couleurs, ils en approchent »
  (il s'en approche ?) ; « Tu ne suis rien » ; « Elle le récupérera » (la pâtisserie) ;
- « Je lui décris … Elle s'emporta » (présent et passé simple) ; « l'éternité … se
  bousculent » ;
- « au travers du mistral », rue Rousseau à Paris ; « adossé au doigt de dieu » (Dieu ?).

## Annexe B. Références

Jeux et livres dont la mécanique ou le ton peuvent servir, pour les sessions et pour la
direction artistique :

| Œuvre | Ce qu'on en retient |
|---|---|
| *Florence* (Mountains, 2018) | Une histoire d'amour racontée par de petits gestes : les répliques se jouent comme un puzzle qui s'assemble mieux à mesure que le couple se comprend. |
| *Device 6* (Simogo, 2013) | Le texte devient l'espace : on lit en se déplaçant dans les phrases. |
| *Gorogoa* (Jason Roberts, 2017) | Des images dessinées qu'on assemble pour ouvrir un passage de l'une à l'autre : des portes entre les dessins. |
| *Pry* (Tender Claws, 2014) | Une novella sur tablette : on écarte les paupières du héros pour voir sa mémoire. Le regard comme geste de lecture. |
| *Frankenstein* (inkle, 2012), *80 Days* (inkle, 2014) | Un classique réécrit en fiction interactive ; le voyage autour du monde en récit. |
| *Heaven's Vault* (inkle, 2019), *Chants of Sennaar* (Rundisc, 2023) | Déchiffrer une langue ancienne : l'idée des vers sanskrits qui s'inscrivent. |
| *Kentucky Route Zero* (Cardboard Computer, 2013-2020) | Réalisme magique, beaucoup de texte, des lieux qui ne devraient pas exister. |
| *Before Your Eyes* (2021) | Le clignement des yeux fait avancer le souvenir : la vue comme commande. |
| *The Room* (Fireproof, 2012) | Serrures, clés et mécanismes qu'on manipule au doigt. |
| *Monument Valley* (ustwo, 2014) | Architectures impossibles, portes et passages. |
| *Gris* (Nomada, 2018), *Ōkami* (Clover, 2006) | L'aquarelle et l'encre ; la couleur qui revient avec l'émotion. |
| *A Normal Lost Phone* (2017), *Her Story* (2015) | Comprendre quelqu'un par son téléphone ou ses images : la galerie de Julie. |
| *Outer Wilds* (2019) | Le journal de bord qui dessine ce qu'on a découvert : le carnet des portes. |
| *Brothers: A Tale of Two Sons* (2013) | Une commande qui disparaît porte toute l'émotion de la fin. |
| *Phallaina* (France Télévisions, 2016), *Type:Rider* (Arte, 2013), *Inanimate Alice* (2005-) | Récits numériques d'auteur, français ou européens, pensés pour l'écran. |

Leçon des livres enrichis des années 2010 (*Alice for the iPad*, *The Waste Land*,
*Our Choice*) : beaucoup étaient des applications, et elles ont disparu avec les systèmes
qui les faisaient tourner (iOS 11 a cessé d'ouvrir les applications 32 bits en 2017). Un
EPUB, norme ouverte, et une page web vieillissent beaucoup mieux : c'est une raison de
plus pour ne pas faire de *Darshan* une application.

## Sources

Normes et outils :
- EPUB 3.3 : https://www.w3.org/TR/epub-33/ ; systèmes de lecture : https://www.w3.org/TR/epub-rs-33/ ;
  EPUB 3.4 (brouillon) : https://www.w3.org/TR/epub-34/
- Accessibilité EPUB 1.1 : https://www.w3.org/TR/epub-a11y-11/
- EPUBCheck 5.4.0 (15 septembre 2026) : https://github.com/w3c/epubcheck/releases/tag/v5.4.0
- Ace by DAISY : https://daisy.github.io/ace/
- Résultats des tests EPUB 3.3 du W3C : https://w3c.github.io/epub-tests/epub33/results.html
- Qualebook (SNE et EDRLab) : https://qualebook.edrlab.org

Liseuses :
- Apple Books Asset Guide : https://help.apple.com/itc/booksassetguide/en.lproj/static.html
- Google Play Books, formats acceptés : https://support.google.com/books/partner/answer/3316879
- Kobo, spécification EPUB : https://github.com/kobolabs/epub-spec
- Kindle Publishing Guidelines : https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf
- Thorium Reader : https://github.com/edrlab/thorium-reader/releases
- Readium : https://github.com/readium/swift-toolkit , https://github.com/readium/kotlin-toolkit

ISBN et éditeur :
- AFNIL, foire aux questions : https://www.afnil.org/foire-aux-questions/ ; ISBN :
  https://www.afnil.org/isbn/ ; tarifs : https://www.afnil.org/tarification/
- Registre mondial des éditeurs (agence internationale de l'ISBN) : https://grp.isbn-international.org/
- Catalogue de la BnF, interface SRU : https://catalogue.bnf.fr/api/SRU
- Société des Éditions du Poitou, annuaire des entreprises :
  https://annuaire-entreprises.data.gouv.fr/entreprise/societe-des-editions-du-poitou-303458988

Droit :
- Directive (UE) 2019/882 : https://eur-lex.europa.eu/eli/dir/2019/882/oj
- Loi n° 2005-102, art. 48 : https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000047293285
- Arcom, accessibilité du livre : https://www.arcom.fr/nous-connaitre-nos-missions/garantir-le-pluralisme-et-la-cohesion-sociale/accessibilite-du-livre

Voix, sons, polices :
- Storyteller et stalign : https://storyteller-platform.dev/docs/the-algorithm/
- Montreal Forced Aligner, modèle français : https://mfa-models.readthedocs.io/en/latest/acoustic/French/French%20MFA%20acoustic%20model%20v3_0_0.html
- Voix Piper françaises et leurs licences : https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR
- Freesound, licences : https://freesound.org/help/faq/ ; tanpura de sankalp : https://freesound.org/people/sankalp/packs/9571/
- *'O sole mio* et la coautorité de Mazzucchi : https://en.wikipedia.org/wiki/%27O_sole_mio
- Amiri : https://github.com/aliftype/amiri ; Unna : https://github.com/Omnibus-Type/Unna ;
  Tiro Devanagari Sanskrit : https://github.com/TiroTypeworks/Indigo
- *Darśana* : https://www.britannica.com/topic/darshan
