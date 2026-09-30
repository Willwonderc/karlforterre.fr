# Darshan : le découpage de toute l'histoire

Document écrit par `outils/darshan/decoupage.py` ; ne pas le modifier à la main, mais corriger
les données du programme et le relancer (`python3 outils/darshan/decoupage.py`). Le programme
vérifie que les tableaux, mis bout à bout, redonnent tout le texte de l'édition 2023, de la
dédicace au poème de clôture, que chaque geste naît d'une phrase qui figure mot pour mot dans
son tableau, et qu'il est reconnu sous la mécanique de sa fiche (`outils/darshan/livre.py`).

Les tableaux reprennent la pré-production : les traitements des sept chapitres et leur synthèse
([darshan-mise-en-scene/](darshan-mise-en-scene/)), qui fait foi. Plan d'ensemble et chantiers :
[plan-darshan.md](plan-darshan.md) ; interface (fiches d'objet, carnet, dialogues, téléphone de
Julie) : [plan-darshan-interface.md](plan-darshan-interface.md).

## En bref

- **85 tableaux**, 8401 mots, de 40 à 160 mots chacun (moyenne 99).
- **58 gestes**, tous nés d'une phrase du livre ; chacun a son équivalent au toucher simple et au clavier.
- **80 photographies de Karl** mises en scène : telles quelles dans le monde de Julie, passées à l'encre dans celui de Darshan, ou comme modèles des dessins.
- **43 repérages** : les photos qui manquent encore, à prendre par Karl, regroupées en 10 sorties (liste à la fin).
- Déjà jouables dans le prototype, au moins en partie : 0.1, 0.2, 1.1, 1.2, 1.3, 1.4.

| Chapitre | Paragraphes | Tableaux | Mots | Monde | Gestes |
|---|---|---|---|---|---|
| Ouverture | 8–16 | 2 | 139 | livre | 0 |
| 1. Un ciel mouvant | 17–39 | 9 | 874 | Darshan, les deux | 10 |
| 2. Un pain perdu s’il vous plaît. | 40–62 | 10 | 961 | Julie, les deux | 5 |
| 3. Entre deux mondes | 63–98 | 14 | 1370 | Darshan, légende | 8 |
| 4. Amélie et Julie | 99–108 | 7 | 756 | Julie | 5 |
| 5. Douceurs et confettis | 109–133 | 11 | 1251 | Darshan, Julie | 6 |
| 6. Des attentes de part et d’autre | 134–169 | 15 | 1510 | Julie, les deux | 13 |
| 7. Au-delà de la porte | 170–215 | 16 | 1479 | Darshan, Julie, les deux, livre | 11 |
| Clôture | 216–221 | 1 | 61 | livre | 0 |

## La grammaire des transitions

Le moteur les joue (`outils/darshan/src/js/transitions.js`) et elles se voient sur le banc d'essai,
`dist/web/transitions.html`, après fabrication ; les deux variantes des bandes (`bandes-photo`,
`bandes-julie`) restent à écrire, et le moteur les remplace pour l'instant par un fondu. Chaque
balayage a deux moitiés : couvrir la scène qui part, découvrir celle qui arrive. L'édition web joue
les deux ; dans l'EPUB, où chaque page est un document à part, la page joue la seconde à son
ouverture (attribut `data-entree`). Si le système demande moins de mouvement, tout devient fondu
court, et l'éclat d'un objet une image fixe qui reste le temps d'être lue.

| Transition | Quand | Durée | Tableaux |
|---|---|---|---|
| **Même plan** (`—`) | Le décor reste, seul le texte change (dialogue, suite d'une même action). | aucune | 38 |
| **Fondu** (`fondu`) | Même lieu, le temps passe (au noir, ou au blanc de la page pour la fin). | 600 + 650 ms | 16 |
| **Encre** (`encre`) | Darshan change de lieu : trois coups de pinceau couvrent la page puis s'en retirent. | 780 + 820 ms | 4 |
| **Bandes** (`bandes`) | Ouverture de chapitre, façon Persona : bandes obliques d'encre, de vermillon et d'or, trame de points ; le titre du chapitre claque sur la bande centrale (1.1, 3.1, 7.1). | 640 ms + titre 1,6 s + 680 ms | 3 |
| **Bandes sur photo** (`bandes-photo`) | Ouverture d'un chapitre photographié (2.1, 6.1) : les bandes du chapitre, dont la seconde moitié découvre la photo par les lames de l'obturateur, avec son double déclic. | 640 ms + titre 1,6 s + 420 + 520 ms | 2 |
| **Bandes de Julie** (`bandes-julie`) | Ouverture des chapitres où Julie dit « je » (4.1, 5.1) : les mêmes bandes en anthracite, gris et blanc de papier photo, grain argentique au lieu de la trame, sortie par l'obturateur, ni or ni vermillon ; en 5.1, en lilas, le grain devenu confettis (réglage `entree` de livre.py). | 640 ms + titre 1,6 s + 420 + 520 ms | 2 |
| **Iris** (`iris`) | Vision, petite porte, regard qui se resserre : un cercle cerné d'or se referme sur un point et s'ouvre ailleurs. | 760 + 900 ms | 3 |
| **Porte** (`porte`) | On franchit une porte : sa lumière gagne l'écran, puis la scène suivante paraît dans une embrasure qui s'élargit jusqu'à nous. | 900 + 1 250 ms | 4 |
| **Lumière** (`lumiere`) | Éblouissement, foudre : une lumière qui s'étend puis se dissipe. | 900 + 2 000 ms | 1 |
| **Obturateur** (`obturateur`) | Le monde de Julie, fait des photographies de Karl : les lames d'un obturateur se ferment et s'ouvrent sur la photo suivante, avec un double déclic. | 420 + 520 ms | 11 |
| **Glissement** (`glissement`) | Le téléphone de Julie : on passe d'une photo à l'autre (5.7). | 360 + 420 ms | 1 |

Changements d'état des objets :

| Effet | Quand | Durée | Moteur |
|---|---|---|---|
| **frisson** | Un objet change d'état sans changer de nature (les lunettes ôtées, la clé dans la serrure) : étoile et rayons autour de l'objet, tintement de verre. | 560 ms | fait |
| **frisson hors champ** | Un objet change dans le sac sans que l'image le montre (les lunettes en 5.7, la clé en 6.4) : une étoile d'or sur le bouton « Objets », un tintement minuscule. | 0,5 s | à faire |
| **envol** | Un objet entre dans le sac : bandeau oblique « Nouvel objet », puis l'objet vole jusqu'au bouton « Objets », qui apparaît à son arrivée ; chez Julie, un bandeau gris au-dessus du bouton de son sac, avec le vibreur. | ≈ 2 s | fait |
| **éclat** | Un objet se métamorphose : bandes, trame, étoiles, l'objet arrive en tournoyant, son nom en grand, et le fragment du livre qui raconte la métamorphose ; puis sa fiche s'ouvre en diagonale. | ≈ 2,8 s | fait |
| **éclat court** | La même métamorphose, déjà connue (1.9, 7.8) : le frisson, la fonte, le nom seul, sans bandes ; la clé peut naître déjà dans la serrure. | ≈ 1 s | en partie |
| **éclat brisé** | La métamorphose qui ne mène nulle part (6.11) : des fêlures courent sur les bandes, qui se brisent en six éclats et tombent hors de la page ; la clé va au sac sans fiche. | ≈ 1,5 s | à faire |
| **dépôt** | Un objet quitte le sac pour la scène, sans annonce (l'encens et les thés servis, le curcuma du dosa, le paquet de Darshan que Julie prend). | instant | fait |
| **transfert** | Un objet passe d'un personnage à l'autre, d'un monde à l'autre : la lettre jaillit de la fente de la pharmacie, virevolte sous la lampe, puis rejoint le sac de Julie. | ≈ 1,5 s | en partie |
| **désenchantement** | La magie s'en va (7.14), neuf secondes sans un son : l'or quitte les mots, la clé tombe en poussière d'or, les étoiles du carnet s'éteignent, les boutons disparaissent. | ≈ 9 s | en partie |

Palette des transitions de Darshan : encre `#07091a`, vermillon (sindoor) `#c9302c`, or `#f4c56a`,
crème `#fff4de`. Celles de Julie : lames d'obturateur gris anthracite, blanc de papier photo.

## Les ambiances sonores

Une par lieu, fabriquée en direct (Web Audio) par `outils/darshan/src/js/son.js` ; « fait » : l'ambiance
y est écrite. Une page peut demander une variante de son ambiance (entre parenthèses dans son champ
« Son ») ; les changements au milieu d'une page sont des effets (`ambiance`, dans `livre.py`).

| Ambiance | Ce qu'on entend | Variantes | Tableaux | Moteur |
|---|---|---|---|---|
| **cosmos** | La voûte : sinus lents, souffle | — | 7 | fait |
| **nuit** | Les toits la nuit : vent, air, rumeur de la ville | — | 3 | fait |
| **kerala** | Aluva : le fleuve et ses remous, les oiseaux, un tanpura | *soir* : le Periyar du soir : moins d'oiseaux, des grillons (3.9, 3.12, 3.13, 3.14, 7.6, 7.7, 7.8) | 13 | fait |
| **silence** | Plus rien : le son se tait, couches comprises | — | 7 | fait |
| **vent** | Le ciel, le désert la nuit : le vent seul | *feuilles* : le vent dans des feuilles (7.2) | 2 | fait |
| **restaurant** | Couverts, murmure de salle, pas du serveur | — | 5 | fait |
| **rue** | Paris : pas, voitures au loin, pigeons | *dense* : les « vapeurs automobiles » (4.5) ; *nuit* : la nuit : peu de voitures, la foule (5.8) ; *été* : le soir d'été, les martinets (7.9, 7.10, 7.11, 7.12) | 16 | fait |
| **parc** | Feuillage, gravier, oiseaux (le merle) | — | 3 | fait |
| **bibliothèque** | Silence habité, pages tournées, pas feutrés | *vaste* : la même sous une voûte plus vaste (Pékin, d'après Gijón) (3.6, 3.7, 3.8) | 3 | fait |
| **vision** | Le mudrā : le fleuve lointain, des grillons, un souffle à chaque inspiration, des braises ; puis plus d'air, seul l'accord du père | — | 2 | fait |
| **métro** | La tôle qui vibre, les freins | *rame* : dans la rame : la tôle qui vibre (4.3) | 2 | fait |
| **hôpital** | Couloir, bips lointains, chariots | — | 2 | fait |
| **chambre** | Pièce calme, rue étouffée | *fenêtre* : la rue s'entrouvre à la fenêtre (5.1) | 4 | fait |
| **marché** | Aluva : foule, marchands, chaleur | — | 4 | fait |
| **pâtisserie** | Vitrine réfrigérée, clochette de la porte | — | 1 | fait |
| **appartement** | Tentures, horloge, encens qui crépite | *horloge* : l'horloge au premier plan (6.9) | 8 | fait |
| **désert** | Sable qui file, nuit immense | *vent* : le vent qui tombe, les yeux fermés (7.1) ; *jour* : la chaleur du jour (7.3) | 2 | fait |
| **pluie** | Averse, puis gouttes | — | 1 | fait |

## Les mécaniques de geste

Tous les gestes du livre se ramènent à 27 mécaniques (le cahier des charges de la
synthèse, partie 3.1). « Écrite » : déjà dans le moteur (`outils/darshan/src/js/mecaniques.js`), le
plus souvent sans tous ses réglages ; une mécanique à écrire se joue pour l'instant comme un simple
toucher. Aucun glissement horizontal : dans Apple Books, il tourne la page. Les glissements vont vers
le haut ou le bas, ou restent dans une zone, et un toucher simple les remplace toujours.

| Mécanique | Description | Gestes | Tableaux | Moteur |
|---|---|---|---|---|
| **deux-pouces** | Deux doigts posés et maintenus : le sceau du mudrā | 1 | 3.9 | à écrire |
| **paume** | Poser la paume sur le bois et la garder : rien ne s'ouvre, aucune clé | 1 | 7.13 | à écrire |
| **respirer** | Maintenir pour inspirer, lâcher pour expirer | 2 | 3.10, 4.5 | à écrire |
| **curseur** | Une réglette verticale de zéro à dix, qui se retourne | 1 | 4.2 | à écrire |
| **messages** | Pianoter sur le téléphone de Julie : des bulles, sans texte | 1 | 4.3 | à écrire |
| **contact** | Tendre le téléphone : il revient avec un nom, sans numéro | 1 | 4.7 | à écrire |
| **galerie** | Ouvrir la galerie du téléphone de Julie, puis la feuilleter | 1 | 5.6 | à écrire |
| **etals** | Toucher chaque étal : la marchandise s'envole vers le sac | 1 | 5.2 | à écrire |
| **liste** | Cocher une liste, dans une moitié de l'écran partagé | 2 | 6.2 | à écrire |
| **verser** | Lever la théière : le filet s'allonge jusqu'à la tasse | 1 | 6.8 | à écrire |
| **attendre** | Attendre sans rien toucher ; « Continuer » presse le temps sans le couper | 1 | 6.11 | écrite |
| **portes** | Chaque toucher ouvre une porte d'encre sur un paysage, qui claque de plus en plus vite | 1 | 6.12 | à écrire |
| **main** | Prendre la main de Julie : elle reste immobile, puis se retire | 1 | 6.13 | à écrire |
| **ecrire** | Garder le doigt sur la feuille : la plume écrit, ligne après ligne | 1 | 7.7 | à écrire |
| **effacer** | Frotter de haut en bas : le papier s'use, l'encre résiste | 1 | 7.7 | à écrire |
| **essuyer** | Frotter la buée en petits cercles : un hublot s'ouvre | 1 | 5.11 | à écrire |
| **caresser** | Un va-et-vient lent dans un petit cercle (la main de Julie, le velours) | 2 | 2.1, 6.5 | à écrire |
| **remuer** | Remuer l'eau en petits cercles : les reflets se forment | 1 | 1.7 | à écrire |
| **semer** | Toucher les quatre points de la rose des vents | 1 | 3.14 | à écrire |
| **tendre** | La main d'or monte vers la porte et s'arrête à un doigt du bois | 1 | 3.11 | à écrire |
| **tourner** | Un quart de tour du doigt autour de la serrure, sur un cercle de 260 unités (les trois clés) | 3 | 1.3, 6.13, 7.8 | écrite |
| **tracer** | Suivre du doigt un guide compact (la moustache de mousse) | 1 | 1.4 | écrite |
| **porter** | Porter un objet jusqu'à sa place (la clé, la lettre) | 2 | 1.3, 7.8 | écrite |
| **rythme** | Toucher en rythme, au rythme du lecteur, jamais de pulsation (les tuiles, les pas, la course) | 3 | 1.2, 4.4, 7.9 | écrite |
| **maintenir** | Maintenir le doigt posé (le cœur : chamade, deux cœurs, unisson ; les paupières) | 6 | 2.2, 2.9, 5.9, 6.10, 7.1, 7.10 | écrite |
| **glisser** | Un glissement vertical (le geste vif, la marche lente, le regard qui se baisse) | 10 | 1.3, 1.8, 2.6, 2.8, 3.4, 3.6, 6.11, 6.15, 7.6, 7.11 | écrite |
| **toucher** | Toucher la cible, ou n'importe où (Entrée, Espace) | 10 | 1.3, 1.9, 3.2, 3.8, 5.5, 5.7, 6.4, 6.7, 7.5 | écrite |

## Les objets et leurs états

| Tableau | Changement |
|---|---|
| 1.2 La danse sur les tuiles | + lunettes fumées (envol) |
| 1.3 Le pigeonnier | lunettes : portées → en main (frisson) |
| 1.3 Le pigeonnier | lunettes → clé (fonte, puis éclat, puis fiche) |
| 1.3 Le pigeonnier | clé : en main → dans la serrure (frisson) → tournée (cran, frisson) |
| 1.4 Aluva | clé → lunettes (discret : la porte passée, la clé redevient lunettes) |
| 1.4 Aluva | carnet : première étoile, le pigeonnier ; le bouton « Carnet » naît |
| 1.9 Le départ | + montre (discret) |
| 1.9 Le départ | lunettes → clé (éclat court : la métamorphose est connue) |
| 1.9 Le départ | carnet : deuxième porte, la cabane à kayaks → Paris, quand sa lumière a gagné la vue |
| 3.4 Des lunettes qui plient l'espace | lunettes : la fiche propose « Regarder à travers » (le regard naît) |
| 3.8 La porte du personnel | + recueil de poèmes (sans annonce : « sous le bras ») |
| 3.8 La porte du personnel | lunettes → clé (discret : nonchalance) |
| 3.9 Le mudrā | carnet : + Pékin → le Periyar (à l'arrivée) |
| 3.9 Le mudrā | clé → lunettes (discret) |
| 3.11 La porte inconnue | carnet : la porte du père, étoile à part, hors de la carte (vue, non franchie) |
| 3.13 Le véritable amour | carnet : la fiche de la porte du père reçoit la règle |
| 4.3 La tôle qui vibre | + téléphone (le sac de Julie s'ouvre, annoncé comme une notification) |
| 4.7 Un numéro | téléphone : un contact, « Darshan », sans numéro |
| 5.2 Le marché d'Aluva | + thés, + curcuma, + encens, + jarres, + tapisseries (un envol annoncé, puis quatre envols courts) |
| 5.5 Le quartier Foch | + confettis (envol) |
| 5.11 La charlotte | + ticket de la pâtisserie (notification, sac de Julie) |
| 6.1 Il est midi | ticket → paquet au ruban rouge (discret : la charlotte est dans sa boîte) |
| 6.4 La clé dans la poche | lunettes → clé (discret : Julie ne voit rien, le bouton Objets frissonne) |
| 6.4 La clé dans la poche | clé → binocles (Nouvel objet) |
| 6.6 Les toiles | − encens, − thés (dépôt discret : servis dans le salon) |
| 6.10 Le dosa | − curcuma (dépôt discret : le curry du dosa) |
| 6.11 Je tiens à toi | binocles → clé (éclat brisé ; la fiche ne s'ouvre pas) |
| 6.13 Le placard | clé de laiton : dans la serrure du placard (quart de tour) |
| 6.15 Un moyen | clé → lunettes (discret, derrière la porte) |
| 6.15 Un moyen | le paquet au ruban rouge reste dans le sac de Julie |
| 7.5 Derrière les portes | + électrocardiogramme (envol, sac de Julie) |
| 7.6 Le feu | + de quoi écrire (envol) |
| 7.7 Darshan écrit | + lettre (envol) |
| 7.8 La fente | lunettes → clé (éclat court) |
| 7.8 La fente | lettre : Darshan → Julie (transfert) |
| 7.9 Le chemin du retour | − électrocardiogramme (discret, au début : Julie rentre chez elle) |
| 7.9 Le chemin du retour | + paquet au ruban rouge (paquet-darshan, même nom que celui de Julie ; discret, sac de Darshan) |
| 7.11 Éclipse | paquet au ruban rouge : il quitte le sac de Darshan, sans signe ; Julie n'en porte qu'un |
| 7.14 La prière | clé : désenchantement (elle se défait en poussière d'or) |
| 7.14 La prière | les boutons « Objets » et « Carnet » disparaissent ; l'étoile ✦ devient un coin de page |

## Ouverture

### 0.1 Le seuil

¶8–10, 53 mots · **fait en partie** : « À Maëlle, mon amour qui est bien plus que … une l’intensité inégalée. / Bonne lecture. »

- **Lieu** : Page de titre · **monde** : livre · **entrée** : même plan
- **Décor** : Le ciel étoilé de Karl, assombri ; le titre, दर्शन ; la dédicace à Maëlle paraît d'elle-même sous le titre, en silence ; la porte « Ouvrir », active dès l'arrivée, s'éclaire après « Bonne lecture. ».
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (photo)
- **Son** : cosmos ; démarre au premier toucher
- **Note** : La dédicace se lit en silence, sans geste ni signe de la fiction. Le premier toucher, sur « Ouvrir », est la première porte : la lumière en jaillit (transition porte) et le cosmos commence à sonner avec elle.

### 0.2 Poème d'ouverture

¶11–16, 86 mots · **fait en partie** : « Les murs séparent sans que la contestation ne se … mue sous la course des astres. »

- **Lieu** : La voûte · **monde** : livre · **entrée** : porte
- **Décor** : Ciel étoilé, immobile, derrière la ligne d'arbres ; une poussière d'or tombe, puis s'élève ; au dernier vers, la lueur du prototype monte, son bord, un fil d'or, s'embrase un instant, et la voûte se met à tourner derrière les arbres.
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (photo)
- **Moment** : « La poussière est à la fois la trace du passé » → une poussière d'or descend lentement dans la nuit
- **Moment** : « Elle s’élance » → la poussière remonte et se mêle aux étoiles
- **Moment** : « La noirceur figée finit toujours par embrasser son éblouissante frontière » → la lueur monte ; son fil d'or s'embrase, puis reste ; les astres se mettent en marche
- **Son** : cosmos ; souffle
- **Note** : Le soleil est gardé pour la porte du pigeonnier (1.3) : ici, la lueur du prototype et son bord, un fil d'or, celui qu'on retrouvera au pied des portes. La poussière d'or annonce celle où finira la clé (7.14). Décor nouveau : les arbres sur un calque fixe, pour que seul le ciel tourne.

## Chapitre 1 : Un ciel mouvant

### 1.1 Le toit

¶17–20, 130 mots · **fait en partie** : « Un ciel mouvant / Les pieds au-dessus du vide, … bientôt là, j’arrive à grands pas. »

- **Lieu** : Paris, un toit du seizième, la nuit · **monde** : Darshan · **entrée** : bandes
- **Décor** : La voûte tourne autour du pôle au-dessus des toits et de la tour Eiffel dessinés (prototype).
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (encre) ; [24200555](https://photos.karlforterre.fr/photo/24200555/) « Ciel étoilé » (modèle) ; [38570570](https://photos.karlforterre.fr/photo/38570570/) « Pleine lune se levant derrière des cheminées, ciel nocturne violet » (modèle)
- **Moment** : « Des étincelles passent et se chassent » → trois étoiles filantes : deux qui se poursuivent, puis une troisième (prototype)
- **Moment** : « Papa, où es-tu » → l'appel de Darshan à son père s'écrit en lumière d'étoile, lettre à lettre ; le vent tombe ; la quinte à vide de l'appel, sans réponse
- **Moment** : « Papa je serai bientôt là, j’arrive à grands pas » → le vent revient
- **Son** : nuit ; appel (la quinte à vide)
- **Note** : « Papa, où es-tu ? » reste seul à l'écran : la question du livre. Le père ne répond pas.

### 1.2 La danse sur les tuiles

¶21, 43 mots · **fait en partie** : « Darshan se lève, s’époussette, cesse de tergiverser. Il enjambe … danse sur les tuiles jusqu’au pigeonnier. »

- **Lieu** : Les toits · **monde** : Darshan · **entrée** : encre
- **Décor** : Les tuiles de nuit, en perspective ; la ville s'approche à chaque bond, jusqu'au pigeonnier.
- **Photos de Karl** : [34500347](https://photos.karlforterre.fr/photo/34500347/) « Fond de tuiles » (photo) ; [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (encre)
- **Geste** : « Il enjambe cinq par cinq les tuiles » → cinq touchers, une enjambée chacun, au rythme du lecteur ; cinq notes qui montent (sinon : toucher, Espace)
- **Moment** : « Darshan se lève, s’époussette » → un peu de poussière tombe dans le clair de lune
- **Moment** : « Ses lunettes fumées sur le nez » → premier objet : le bouton « Objets » naît
- **Objet** : + lunettes fumées (envol)
- **Son** : nuit ; saut, notes montantes
- **Note** : Les « grands pas » promis au père (1.1) : la danse est une course vers lui. Même mécanique que la course de Julie (7.9).

### 1.3 Le pigeonnier

¶22–23, 129 mots · **fait en partie** : « Dans la nuit nacrée, il ne laisse pas de … dans le Kerala, la ville d’Aluva. »

- **Lieu** : Le pigeonnier des toits · **monde** : Darshan · **entrée** : iris
- **Décor** : La porte de grilles et de bois, au clair de lune ; les lunettes, puis la clé, en grand.
- **Photos de Karl** : [27046156](https://photos.karlforterre.fr/photo/27046156/) « Porte forgée » (modèle) ; [39434688](https://photos.karlforterre.fr/photo/39434688/) « Gros plan sur une porte ancienne patinée, rivets et peinture écaillée » (modèle)
- **Geste** : « il ôte ses lunettes » → toucher les lunettes (sinon : bouton de la fiche)
- **Geste** : « D’un geste vif » → glisser vers le haut, vivement, comme un prestidigitateur (sinon : toucher)
- **Geste** : « À peine insérée » → porter la clé jusqu'à la serrure, vers le haut : elle attend sous la serrure (sinon : toucher la clé)
- **Geste** : « Après un tour de poignet » → tourner la clé d'un quart de tour, du doigt, sur un cercle de 260 unités autour de la serrure (sinon : toucher la clé)
- **Geste** : « Il ne reste qu’à la pousser » → pousser la porte (sinon : toucher)
- **Moment** : « elles vibrent entre ses doigts, leurs couleurs s’altèrent » → vibration, couleurs qui tournent ; le téléphone vibre, là où il le peut
- **Moment** : « elles se transforment » → éclat : « La clé », puis sa fiche (prototype)
- **Moment** : « le jour de la porte laisse transparaître la présence de l’astre solaire » → le soleil passe par les jours de la porte ; on entend l'autre côté, Aluva
- **Objet** : lunettes : portées → en main (frisson)
- **Objet** : lunettes → clé (fonte, puis éclat, puis fiche)
- **Objet** : clé : en main → dans la serrure (frisson) → tournée (cran, frisson)
- **Son** : nuit ; vibre, fonte, éclat, clé, jour (l'autre côté), tour, cran, grince, souffle
- **Note** : Sortie par la porte : sa lumière gagne l'écran. L'étoile de cette porte naît à l'arrivée (1.4). Les jours ne sonnent plus l'accord du père : il n'appartient qu'à sa porte (3.10, 7.12).

### 1.4 Aluva

¶23–24, 91 mots · **fait en partie (sans le paragraphe 24)** : « Notre héros affleure de la poussière en passant le … puis taille son bouc avec soin. »

- **Lieu** : Aluva (Kerala), le local à kayaks · **monde** : Darshan · **entrée** : porte
- **Décor** : Depuis le seuil du local à kayaks : l'éblouissement, la poussière dans la lumière, le Periyar sous la chaleur ; le tonneau où l'eau bout de poissons, le coutelas sur son couvercle.
- **Photos de Karl** : [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » (modèle)
- **Geste** : « dessine sa moustache puis taille son bouc » → tracer du doigt une moustache de mousse, compacte, au bas de la vue ; les trois coups de coutelas du bouc suivent d'eux-mêmes (sinon : toucher)
- **Moment** : « Notre héros affleure de la poussière » → éblouissement ; la poussière danse dans la lumière
- **Moment** : « un fleuve charmant l’atmosphère au climat si chaud et humide » → l'air tremble de chaleur au-dessus du fleuve
- **Moment** : « mue par une vie frétillante » → les poissons frétillent et éclaboussent
- **Moment** : « d’une bombe de piètre qualité » → la bombe crachote
- **Objet** : clé → lunettes (discret : la porte passée, la clé redevient lunettes)
- **Objet** : carnet : première étoile, le pigeonnier ; le bouton « Carnet » naît
- **Son** : kerala ; souffle, poissons, bombe, mousse, coutelas
- **Note** : Caméra subjective : le visage de Darshan ne se voit pas, seulement la moustache de mousse, floue, au bas de la vue. Au dessin d'Aluva, ajouter les kayaks jaunes rangés au mur et le coutelas sur le couvercle du tonneau. Texte en haut, panneau clair, jusqu'à 1.9.

### 1.5 Le vieil homme

¶25–29, 109 mots : « Un vieil homme au short et au marcel de … presque à parler d’un dieu même. »

- **Lieu** : Aluva, au bord du fleuve · **monde** : Darshan · **entrée** : fondu
- **Décor** : Le chemin sous les palmes, d'où vient le vieil homme ; puis son filet, en gros plan.
- **Photos de Karl** : [34342144](https://photos.karlforterre.fr/photo/34342144/) « Jardin tropical » (encre) ; [34956319](https://photos.karlforterre.fr/photo/34956319/) « Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages » (encre)
- **Moment** : « L’individu dépose à côté de lui un filet » → on passe au filet, en gros plan
- **Moment** : « Il tire jusqu'à lui un tabouret rafistolé » → le raclement du tabouret sur les planches ; puis les maquereaux plongent dans le tonneau
- **Moment** : « l’homme entame la conversation » → premier dialogue du livre : les répliques paraissent une à une, le vieil homme en clair, Darshan en or
- **Son** : kerala ; tabouret, poissons
- **Note** : Le vieil homme n'a pas encore de nom : le livre ne le donne qu'à la dernière phrase du chapitre. Le titre de cette page, « Jivan », devient « Le vieil homme ».
- **Repérage** (S9) : Un tabouret de bois rafistolé sur un ponton, un filet où brillent trois maquereaux ; lumière du matin, cadre en hauteur

### 1.6 L'esprit local

¶30–33, 120 mots : « — Il n’est rien de tout ça. Je ne … Paris plutôt ; ce palais immense. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le filet du vieil homme ; au dernier mot, le regard glisse vers le fleuve.
- **Photos de Karl** : [34956319](https://photos.karlforterre.fr/photo/34956319/) « Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages » (encre) ; [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » (encre)
- **Moment** : « précise-t-il en agrémentant sa réplique d’un clin d’œil » → un clin d'œil à l'encre : une paupière de pinceau, avec ses cils, passe sur la vue
- **Moment** : « Parle-moi encore de Paris plutôt » → le regard quitte le filet pour le fleuve
- **Son** : kerala
- **Note** : Dialogue ; la « délicieuse enfant » : première mention de Julie, sans nom ni image.

### 1.7 Paris dans le fleuve

¶34, 81 mots : « — Paris est à l’amour ce que le bleu … perdu dans les remous du Periyar. »

- **Lieu** : Aluva, le Periyar · **monde** : les deux · **entrée** : même plan
- **Décor** : Le fleuve à l'encre ; dans ses reflets paraissent les premières photographies du livre : Paris, renversé, ondulé par l'eau.
- **Photos de Karl** : [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » (encre) ; [33035632](https://photos.karlforterre.fr/photo/33035632/) « Tour Eiffel encadrée d'arbres verts à Paris » (photo) ; [16592454](https://photos.karlforterre.fr/photo/16592454/) « Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit » (photo) ; [12073837](https://photos.karlforterre.fr/photo/12073837/) « Ciel et pavés » (photo) ; [38279684](https://photos.karlforterre.fr/photo/38279684/) « Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé » (photo)
- **Geste** : « le regard perdu dans les remous du Periyar » → remuer l'eau du doigt, en petits cercles ou de haut en bas : le pavé, puis un réverbère, se forment dans les remous (sinon : toucher l'eau)
- **Moment** : « Paris est à l’amour ce que le bleu est au ciel » → la tour Eiffel paraît, renversée, dans le reflet du ciel
- **Moment** : « qu’un air que tous chantonnent » → sous l'eau, quatre notes de la ballade, inachevées
- **Moment** : « Les éclairages de nuit t’ensorcellent » → les lumières de la nuit dans le reflet
- **Son** : kerala ; fragment de la ballade sous l'eau, rumeur de Paris sous l'eau, remous
- **Note** : Premier contact des deux mondes : les photos de Karl paraissent dans l'encre, un chapitre avant le monde de Julie. Le pavé des remous est celui d'où naîtra la porte du père ; le dernier reflet, un réverbère de Niort, sera la Seine du chevalet (5.7).
- **Repérage** (S8) : Bateaux-mouches sur la Seine, de nuit (« l’éclat des navires parcourant la Seine »)

### 1.8 Vieillir

¶35–38, 127 mots : « — Je t’invite à t’attarder davantage sur ma personne … conclut Darshan en enfilant sa chemise. »

- **Lieu** : Aluva, le ponton · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le ponton du vieil homme, vide : sa place sans lui ; à « As-tu déjà pensé à vieillir ? », la lumière vire lentement à l'or ; après la pirouette, le lin blanc de la chemise passe devant la vue.
- **Photos de Karl** : [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » (encre)
- **Geste** : « en enfilant sa chemise » → après la phrase, enfiler la chemise : glisser vers le bas, le lin blanc passe devant la vue (sinon : toucher)
- **Moment** : « As-tu déjà pensé à vieillir » → la lumière vire lentement à l'or ; le tanpura se tait, seul le fleuve continue, jusqu'à la réponse de Darshan
- **Son** : kerala ; silence du tanpura, lin
- **Note** : Le ponton reste vide (aucune silhouette) : on voit la place du vieil homme sans lui, avant « je te quitterai avant lui ». Le jour vieillit pendant la question ; Darshan l'esquive en s'habillant.
- **Repérage** (S9) : Le même tabouret rafistolé, vide, sur le ponton, dans la lumière d'or de fin d'après-midi

### 1.9 Le départ

¶39, 44 mots : « Après quelques ajustements et regards attentifs sur sa montre, … Jivan qui range patiemment son filet. »

- **Lieu** : Aluva, devant la cabane à kayaks · **monde** : Darshan · **entrée** : fondu
- **Décor** : La montre en gros plan ; la cabane à kayaks, vue du dehors, dans la lumière d'or ; sa porte s'illumine ; puis la lumière retombe sur le filet, au crépuscule.
- **Photos de Karl** : [20315376](https://photos.karlforterre.fr/photo/20315376/) « L’heure d’hier » (encre) ; [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » (modèle) ; [34956319](https://photos.karlforterre.fr/photo/34956319/) « Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages » (encre)
- **Geste** : « Il se défait de ses lunettes » → ôter les lunettes, comme au pigeonnier : elles deviennent clé, la porte de la cabane s'allume et sa lumière gagne la vue (sinon : toucher)
- **Moment** : « regards attentifs sur sa montre » → la montre en gros plan ; son tic-tac
- **Moment** : « Darshan s’incline auprès de son ami » → la vue s'incline, comme un salut
- **Moment** : « avant de tourner ses talons vers la cabane à kayaks » → la vue se tourne vers la cabane à kayaks, vue du dehors, dans la lumière d'or
- **Moment** : « qui range patiemment son filet » → la lumière retombe sur le filet, au crépuscule ; la caméra reste avec celui qui reste
- **Objet** : + montre (discret)
- **Objet** : lunettes → clé (éclat court : la métamorphose est connue)
- **Objet** : carnet : deuxième porte, la cabane à kayaks → Paris, quand sa lumière a gagné la vue
- **Son** : kerala ; tic-tac, jour (l'autre côté : Paris à midi, la rumeur d'une rue et, très loin, la salle du restaurant), souffle
- **Note** : Jivan ne voit pas partir Darshan : il « disparaît loin de la vue de Jivan ». La caméra ne le regarde donc pas partir ; elle reste, après, avec le filet. Seule entorse à la caméra subjective du chapitre : ce dernier plan, sans Darshan.
- **Repérage** (S9) : Un carrelet de Charente-Maritime (cabane de pêche sur pilotis et son grand filet carré) au soleil couchant ; cadre en hauteur

## Chapitre 2 : Un pain perdu s’il vous plaît.

### 2.1 Attablé

¶40–41, 58 mots : « Un pain perdu s’il vous plaît. / Attablé, les … baiser à l’issue de ce repas. »

- **Lieu** : Paris, un restaurant · **monde** : Julie · **entrée** : bandes-photo
- **Décor** : La table de Karl, photographiée : le tartare de Darshan au premier plan, le verre et le téléphone de Julie ; sous la caresse, l'assiette s'efface dans le flou.
- **Photos de Karl** : [34532663](https://photos.karlforterre.fr/photo/34532663/) « Table heureuse » (photo)
- **Geste** : « Il caresse la main de sa belle avec délicatesse » → caresser sa main, lentement : l'assiette se brouille (sinon : maintenir le doigt, Espace)
- **Son** : restaurant ; déclic
- **Note** : Premier chapitre photographique : les bandes du titre s'ouvrent sur la photo par l'obturateur. Julie se découvre par les sens : sa main (2.1), son dos (2.2), ses traits en mots (2.3), sa voix et son nom (2.4). Le tartare de la photo est de bœuf : exception à l'arbitrage 7, à valider par Karl.
- **Repérage** (S1) : La main de Julie posée sur une table pour deux, lumière chaude, l'assiette de Darshan floue au premier plan, son verre et son téléphone derrière

### 2.2 La rencontre

¶42–43, 127 mots : « Il se rappelle leur rencontre comme si elle se … que celui de Darshan devenait fébrile. »

- **Lieu** : Paris, devant les vitrines · **monde** : Julie · **entrée** : obturateur
- **Décor** : Souvenir net comme le présent : Julie de dos, chevelure châtaine et chouchou rouge, devant les vitrines.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo)
- **Geste** : « La chamade battait en lui » → maintenir : le cœur bat tout seul et s'emballe (sinon : maintenir Espace)
- **Moment** : « Son cœur balançait » → le cœur de Julie balance entre deux lueurs de la vitrine ; celui de Darshan s'emballe
- **Son** : rue ; déclic, battements, balancier
- **Note** : Signature du cœur, reprise en 2.9, 5.9 et 7.10. La vitrine revient en 4.6, vue par Julie.
- **Repérage** (S7) : Vitrine de friperie, mannequin en robe volantée et guêtres (la même qu'en 4.6 et 4.7)

### 2.3 Au diable les autres

¶44, 116 mots : « Au diable les autres, il n’y a qu’elle. Toute … pas quand je pense à toi… »

- **Lieu** : Le restaurant, sa rêverie · **monde** : les deux · **entrée** : même plan
- **Décor** : Sa rêverie, à table : la photo de la rencontre devient la peinture de Darshan ; il ne reste qu'elle, la rue retourne au papier.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (encre)
- **Moment** : « Au diable les autres, il n’y a qu’elle » → la photo se fait encre ; la rue s'efface ; la rumeur se tait
- **Son** : silence ; battements
- **Note** : Texte en italique, en bas, sans éclat : la voix s'écrit lettre à lettre, à l'encre (rime avec 1.1 et 7.7). Le visage de Julie n'existe qu'en mots : l'image la garde de dos.

### 2.4 Quoi ?!

¶45–49, 92 mots : « Tes projets se passent bien Darshan ? demande Julie … Tu peux le dire, tu sais. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : même plan
- **Décor** : La peinture, puis, d'un déclic, la table photographiée, nette d'un coup.
- **Photos de Karl** : [34532663](https://photos.karlforterre.fr/photo/34532663/) « Table heureuse » (photo)
- **Moment** : « Tes projets se passent bien Darshan » → la question arrive étouffée, comme à travers l'eau
- **Moment** : « répond-il presque réveillé en sursaut » → le toucher qui fait avancer le texte réveille : l'obturateur claque, la table revient, nette
- **Son** : restaurant ; étouffé, déclic
- **Note** : Premier « Julie » du livre : le lecteur se réveille sur son nom, sans geste ni consigne.

### 2.5 L'aurore de mes jours

¶50–52, 142 mots : « — Non, je travaille, c’est juste que je ne … penses de se perdre de vue. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : même plan
- **Décor** : La table ; au mot « téléphone », gros plan sur celui de Julie, posé près de son verre.
- **Photos de Karl** : [34532663](https://photos.karlforterre.fr/photo/34532663/) « Table heureuse » (photo)
- **Moment** : « Tu n’as pas de téléphone » → gros plan : le téléphone de Julie ; rien de tel côté Darshan
- **Moment** : « Il n’y a pas de meilleure façon » → retour à la table
- **Son** : restaurant
- **Note** : « Par moments » : le lecteur sait lesquels, il vient de voir Darshan partir à l'encre.

### 2.6 Le tartare

¶53–55, 62 mots : « — Plus compliqué que de finir son assiette visiblement. … longtemps que tu ne l’aurais voulu. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : même plan
- **Décor** : La table, puis l'assiette : le tartare à peine picoré.
- **Photos de Karl** : [34532663](https://photos.karlforterre.fr/photo/34532663/) « Table heureuse » (photo)
- **Geste** : « Darshan se penche sur son assiette » → baisser les yeux : glisser vers le bas ; l'image monte, l'assiette entre par le bas (sinon : toucher, flèche bas)
- **Son** : restaurant ; fourchette
- **Note** : Le gros plan montre un tartare de bœuf : exception à l'arbitrage 7, à valider par Karl ; sinon, la séance S1 d'abord.
- **Repérage** (S1) : Un tartare de saumon aux herbes fraîches, à peine entamé

### 2.7 Le pain perdu

¶56–59, 123 mots : « Après quelques bouchées assorties d’un geste de la main … laissé filer aussi facilement mon saumon. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : fondu
- **Décor** : La table, floue : le temps a passé ; le carnet du serveur ; son côté à elle, net ; puis le pain perdu sur sa porcelaine jaune tournesol.
- **Photos de Karl** : [34532663](https://photos.karlforterre.fr/photo/34532663/) « Table heureuse » (photo)
- **Moment** : « Ce sera un pain perdu » → le carnet du serveur monte : une seule ligne, le titre du chapitre
- **Moment** : « Il sera servi dans une porcelaine » → son côté à elle, net ; puis le pain perdu, net (quand Karl l'aura photographié)
- **Son** : restaurant ; assiettes, crayon, porcelaine
- **Note** : Le livre ne dit pas qui commande : la commande paraît sans qu'on sache qui l'a passée. « Si j’avais su… » reste du récit, sans couleur de personnage.
- **Repérage** (S1) : Pain perdu de brioche, portion menue, sur porcelaine à motif fleuri, fond jaune tournesol

### 2.8 Montsouris

¶60, 104 mots : « Le repas se conclut par une promenade digestive passant … de lierre aux charmantes petites fenêtres. »

- **Lieu** : Paris, le parc Montsouris · **monde** : Julie · **entrée** : obturateur
- **Décor** : L'arche de rocaille ; les deux amoureux sur leur banc, sous la grosse branche ; on passe à côté ; la maison de lierre.
- **Photos de Karl** : [10524140](https://photos.karlforterre.fr/photo/10524140/) « Arche de rocaille au-dessus d'une allée dans un jardin romantique » (photo) ; [31514847](https://photos.karlforterre.fr/photo/31514847/) « Amour » (photo) ; [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo)
- **Geste** : « Leurs pas sous l’ombrage des arbres » → marcher avec elle : glisser vers le haut, lentement ; l'allée avance (sinon : toucher, flèche haut)
- **Moment** : « ils regardent le Merle noir qui fait son nid » → les amoureux ; le chant du merle, tout proche
- **Moment** : « Darshan et Julie eux passent à côté » → on passe à côté : le plan glisse, le merle s'éloigne
- **Moment** : « une petite maison beige couverte de lierre » → la maison de lierre
- **Son** : parc ; pas sur le gravier, merle
- **Note** : Un vieux couple qui a son nid : Darshan et Julie passent à côté de leur avenir possible. Julie refera cette marche seule (6.15).
- **Repérage** (S2) : La maison de Julie, petite, beige, couverte de lierre, près du parc Montsouris
- **Repérage** (S2) : Le pont de rocaille de Montsouris et sa barrière de branches nouées, si l'arche n'y a pas été prise

### 2.9 Le seuil de Julie

¶61–62, 76 mots : « Sur le seuil de la demeure, leurs joues se … joli minois et Darshan, lui, vole. »

- **Lieu** : Devant la maison de Julie · **monde** : Julie · **entrée** : fondu
- **Décor** : La porte dans le lierre ; joue contre joue, tout se brouille ; la porte redevient nette ; la vue monte aux toits.
- **Photos de Karl** : [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo) ; [38674517](https://photos.karlforterre.fr/photo/38674517/) « Silhouettes de toits et d'antennes télé sur un ciel pastel au crépuscule » (photo)
- **Geste** : « leurs joues se frôlent » → maintenir : joue contre joue, deux cœurs, pas encore à l'unisson (sinon : maintenir Espace)
- **Moment** : « Les mots et les regards valsent » → les deux cœurs valsent, trois contre deux : la première mesure de la ballade, étouffée
- **Moment** : « dimanche prochain répondait aux convenances de Julie » → compte : « dimanche prochain », avec un tic
- **Moment** : « Darshan et Julie s’éloignent l’un de l’autre » → la porte redevient nette, les cœurs se taisent
- **Moment** : « L’épaisse porte de sa belle se ferme » → la porte épaisse se ferme (on l'entend)
- **Moment** : « Darshan, lui, vole » → la vue monte le long du lierre jusqu'aux toits, au crépuscule
- **Son** : rue ; battements, première mesure de la ballade, tic, porte, envol
- **Note** : Rime avec 6.15 : la même porte, où Julie rentrera seule. La ballade entière attend 5.7 (arbitrage 2).
- **Repérage** (S2) : La porte de la maison de Julie, cadrée en hauteur, fin d'après-midi

### 2.10 Le nuage

¶62, 61 mots : « Sur son nuage il saute de rêves en projets … encore ou il va recevoir Julie. »

- **Lieu** : Au-dessus des toits, au crépuscule · **monde** : les deux · **entrée** : même plan
- **Décor** : Les toits au crépuscule ; sur le ciel, à l'encre, son nuage puis la pièce qu'il rêve ; l'ombre d'un vrai nuage la fait pâlir.
- **Photos de Karl** : [38674517](https://photos.karlforterre.fr/photo/38674517/) « Silhouettes de toits et d'antennes télé sur un ciel pastel au crépuscule » (photo)
- **Moment** : « Sur son nuage il saute de rêves en projets » → à l'encre, sur le vrai ciel : son nuage
- **Moment** : « Il flirte avec Julie qu’il visualise » → la pièce rêvée se trace sur le nuage d'encre
- **Moment** : « Mais un nuage vient porter ombrage à cette vision idyllique » → l'ombre d'un vrai nuage balaie la photo ; l'encre pâlit et s'efface
- **Son** : vent ; souffle frais sous l'ombre
- **Note** : Seule encre posée sur une photo dans le chapitre, et la photo la fait pâlir. Les mêmes toits ferment 5.1, vus de la fenêtre de Julie.

## Chapitre 3 : Entre deux mondes

### 3.1 Le maître des portes

¶63–64, 46 mots : « Entre deux mondes / Darshan le rêveur, le beau … d’un méli-mélo d’idées qu’a formulées l’homme. »

- **Lieu** : Hors du monde · **monde** : légende · **entrée** : bandes
- **Décor** : La Voie lactée de Karl, sans horizon ; des étoiles-portes d'or ; une barque minuscule dérive ; sept étoiles s'alignent et dessinent une porte, à la place et à la forme de la porte bleue de 3.2.
- **Photos de Karl** : [39595391](https://photos.karlforterre.fr/photo/39595391/) « Voie lactée et ciel étoilé à couper le souffle, en Galice » (photo)
- **Moment** : « mène sa barque au gré des courants de la providence » → une barque minuscule dérive le long de la Voie lactée
- **Moment** : « Ce Bohème est né de l’alignement de forces anciennes » → sept étoiles s'alignent, puis dessinent une porte
- **Son** : cosmos ; bandes, tinte

### 3.2 Le trou dans le mur

¶65, 109 mots : « Vous les connaissez, l’envie, la curiosité, celles de connaître … départ, une séparation qui paradoxalement connecte. »

- **Lieu** : Les âges · **monde** : légende · **entrée** : même plan
- **Décor** : Le ciel et sa porte d'étoiles ; puis les portes de Karl, à l'encre, en remontant le temps, de plus en plus vite ; puis un mur de terre et de paille percé d'un trou noir, que le toucher du lecteur change en entrée.
- **Photos de Karl** : [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » (encre) ; [32429190](https://photos.karlforterre.fr/photo/32429190/) « Une porte » (encre) ; [27025911](https://photos.karlforterre.fr/photo/27025911/) « Le portail » (encre) ; [34762346](https://photos.karlforterre.fr/photo/34762346/) « Porte en bois rustique et sa lanterne, charme d'autrefois » (encre) ; [27046110](https://photos.karlforterre.fr/photo/27046110/) « Trèfle » (encre)
- **Geste** : « un trou dans un mur de terre et de paille, mais une entrée » → toucher le trou : la lumière passe, il devient entrée (sinon : toucher, Entrée)
- **Moment** : « La peur des prédateurs » → la porte d'étoiles devient la porte bleue, et les portes défilent en remontant le temps
- **Moment** : « Sans même le savoir, ces pensées ont créé un embryon métaphorique » → le mur de terre et de paille ; le trou est noir
- **Son** : cosmos ; souffle
- **Note** : Le toucher du lecteur est l'instant où « l'on a cessé de voir simplement un trou » : son regard fait naître Darshan. Ni la porte verte d'Irun (39434691), devenue la porte du père, ni « Porte forgée » (27046156, une fleur de lys) ne sont du défilé.
- **Repérage** (S4) : Mur de torchis (terre et paille) percé d'un trou, en hauteur ; deux vues au même cadre : le trou noir, puis la lumière qui passe

### 3.3 L'immortel

¶66, 86 mots : « Cet être immortel vécut bien longtemps dérouté, en quête … la vue de ses compétences extraordinaires. »

- **Lieu** : Les âges · **monde** : légende · **entrée** : fondu
- **Décor** : Le chemin des pèlerins, à l'encre, qui monte sous les arbres, où l'on avance très lentement ; personne ; la poussière se soulève et retombe.
- **Photos de Karl** : [39208821](https://photos.karlforterre.fr/photo/39208821/) « Chemin forestier en pierre sur le chemin de Saint-Jacques-de-Compostelle, près de Pau » (encre)
- **Moment** : « brasser inutilement de la poussière » → une poussière grise se soulève du chemin, puis retombe
- **Son** : cosmos ; souffle
- **Note** : Tableau sans geste : la légende se raconte, elle ne se joue pas ; personne ne tend la main à Darshan.

### 3.4 Des lunettes qui plient l'espace

¶67, 88 mots : « Ses traits ne diffèrent pas sous le souffle des … gardées de rester sur son nez. »

- **Lieu** : Hors du monde · **monde** : légende · **entrée** : iris
- **Décor** : Le ciel de la légende ; les lunettes en traits d'or, au milieu ; Paris en haut, Aluva plus bas, reliés par un fil d'or.
- **Photos de Karl** : [39595391](https://photos.karlforterre.fr/photo/39595391/) « Voie lactée et ciel étoilé à couper le souffle, en Galice » (photo)
- **Geste** : « ses lunettes aux visages déformés adoptent l’allure de la précédente clé » → le geste vif de 1.3 : glisser vers le haut ; les lunettes fondent en clé et le ciel se plie, Aluva sur Paris (sinon : toucher, Entrée)
- **Moment** : « Elles portent sa vue plus loin » → dans les deux verres, Paris et le Periyar ; le regard naît
- **Objet** : lunettes : la fiche propose « Regarder à travers » (le regard naît)
- **Son** : cosmos ; fonte, papier, tinte
- **Note** : Scène spéciale « plier ». Le lecteur refait le geste vif du pigeonnier et découvre ce qu'il faisait : plier l'espace. Pas de pincement : Apple Books le prend pour le zoom de la page.

### 3.5 Croire

¶68–71, 139 mots : « Le plus prodigieux des pouvoirs qu’il puisse avoir reste … C’est ici que j’écris ma vie. »

- **Lieu** : Les parvis · **monde** : légende · **entrée** : fondu
- **Décor** : Le parvis de la cathédrale de Poitiers, vu d'en bas, au matin ; l'aube monte avec son chœur d'oiseaux.
- **Photos de Karl** : [18890798](https://photos.karlforterre.fr/photo/18890798/) « Cathédrale au matin » (encre)
- **Moment** : « Croire aux lendemains qui chantent » → l'aube monte sur la façade ; le chœur de l'aube, au loin
- **Moment** : « où es-tu » → le chœur se tait ; la quinte à vide de l'appel, très bas, sans réponse
- **Son** : cosmos ; chœur de l'aube, appel (la quinte à vide)
- **Note** : À « où es-tu ? », rien ne répond : le père ne parle jamais. La quinte est la question, pas une réponse.

### 3.6 Les bibliothèques

¶72–73, 102 mots : « Darshan explore les bibliothèques, les musées, les marchés en … forgent son organisation et sa lisibilité. »

- **Lieu** : Bibliothèques, musées, marchés ; puis Pékin · **monde** : Darshan · **entrée** : encre
- **Décor** : La tranche poussiéreuse d'une pile de vieux livres ; puis l'allée d'une bibliothèque toute en lignes droites.
- **Photos de Karl** : [38712879](https://photos.karlforterre.fr/photo/38712879/) « Pile de livres et tasse en inox sur une étagère en bois » (encre) ; [39670619](https://photos.karlforterre.fr/photo/39670619/) « Intérieur moderne d'une bibliothèque aux étagères en verre, à Gijón » (encre)
- **Geste** : « en soufflant l’indifférence qui s’est déposée à la surface des ouvrages » → souffler la poussière : glisser vers le haut sur les livres (sinon : toucher)
- **Moment** : « Les avancées sont rares » → l'allée de la bibliothèque nationale de Chine
- **Moment** : « Leur nombre suscite vertige » → le regard file lentement dans l'allée
- **Son** : bibliothèque (vaste) ; souffle

### 3.7 Le recueil sanskrit

¶73–75, 103 mots : « Depuis un coin de table Darshan poursuit ses recherches … sincérité et sa porte la réciprocité. »

- **Lieu** : Pékin, la bibliothèque nationale · **monde** : Darshan · **entrée** : même plan
- **Décor** : L'allée ; puis le recueil ouvert au coin de la table, pages vierges ; les deux vers s'écrivent au pinceau.
- **Photos de Karl** : [39670619](https://photos.karlforterre.fr/photo/39670619/) « Intérieur moderne d'une bibliothèque aux étagères en verre, à Gijón » (encre)
- **Moment** : « Darshan pour sa part parcourt un recueil de poèmes sanskrit » → le regard descend sur le recueil ouvert
- **Moment** : « L’amour est le lit de la famille » → calligraphie au pinceau
- **Moment** : « La clé de sa chambre est la sincérité et sa porte la réciprocité » → calligraphie au pinceau
- **Son** : bibliothèque (vaste) ; pinceau
- **Note** : Le moment typographique du chapitre, sans geste : le lecteur regarde écrire ; au chapitre 7, il écrira lui-même la lettre.
- **Repérage** (S1) : Vieux livre ouvert sur des pages vierges et jaunies, vu d'au-dessus, lumière de lampe

### 3.8 La porte du personnel

¶76, 46 mots : « Il n’y a pas de doute possible. Si, il … de porte des toilettes du personnel. »

- **Lieu** : Pékin · **monde** : Darshan · **entrée** : fondu
- **Décor** : L'allée, le regard relevé ; puis la porte battante du personnel, au bout des rayonnages.
- **Photos de Karl** : [39670619](https://photos.karlforterre.fr/photo/39670619/) « Intérieur moderne d'une bibliothèque aux étagères en verre, à Gijón » (encre)
- **Geste** : « disparaît avec nonchalance entre deux battements de porte » → pousser la porte des toilettes du personnel : elle bat deux fois (sinon : toucher)
- **Moment** : « Si, il y en a suffisamment » → la porte battante, au bout des rayonnages
- **Objet** : + recueil de poèmes (sans annonce : « sous le bras »)
- **Objet** : lunettes → clé (discret : nonchalance)
- **Son** : bibliothèque (vaste) ; porte, l'autre côté (le clapotis du Periyar)
- **Repérage** (S6) : Porte battante de service à hublot, sans écriteau lisible ; fermée, puis en plein battement

### 3.9 Le mudrā

¶77–79, 99 mots : « Il sort de sa petite boite, accueilli par le … le froissement de l’herbe qu’il provoque. »

- **Lieu** : Aluva, au bord du Periyar · **monde** : Darshan · **entrée** : porte
- **Décor** : Le Periyar au soir, en subjectif ; deux cercles d'or naissent sous les pouces.
- **Photos de Karl** : [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » (encre)
- **Geste** : « positionne sa main droite pour qu’elle soutienne sa main gauche et que ses pouces soient en contact » → poser les deux pouces l'un contre l'autre et les garder : le sceau se ferme (sinon : maintenir un doigt, ou Espace)
- **Moment** : « il veille à sa discrétion jusque dans le froissement de l’herbe » → un froissement d'herbe, à peine : Jivan
- **Objet** : carnet : + Pékin → le Periyar (à l'arrivée)
- **Objet** : clé → lunettes (discret)
- **Son** : kerala (soir) ; clapotis, herbe
- **Note** : Temps fort. Le geste précède la phrase : le lecteur apprend qu'il vient de faire le Dhyana mudrā.

### 3.10 Du noir vient la couleur

¶80–81, 105 mots : « Les poignets de Darshan se relâchent. Son inspiration l’emplit … dans le tissu même de l’existence. »

- **Lieu** : La vision · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le fleuve du soir ; un halo d'ombre ; le noir de Karl et sa seule lumière orange ; la lanterne ; la porte d'Irun rendue en lumière.
- **Photos de Karl** : [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » (encre) ; [39575545](https://photos.karlforterre.fr/photo/39575545/) « Photo de nuit abstraite et minimaliste, une seule lumière orange » (photo) ; [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre) ; [34849711](https://photos.karlforterre.fr/photo/34849711/) « Vitrail en flou doux aux arcs de cercle encadrés de bandes rouges » (modèle)
- **Geste** : « Son inspiration l’emplit de braises » → maintenir pour inspirer, lâcher pour expirer, trois fois (sinon : toucher : trois respirations guidées ; Espace)
- **Moment** : « Les poignets de Darshan se relâchent » → le sceau du mudrā se défait
- **Moment** : « La force de son âme l’entoure d’un halo d’absence » → un halo d'ombre se referme ; le son s'éteint
- **Moment** : « La vie palpite en Darshan » → un battement
- **Moment** : « Il bascule en arrière » → le regard bascule vers le haut et flotte, puis le noir
- **Moment** : « Du noir vient la couleur » → le noir, et sa seule lumière orange
- **Moment** : « Des couleurs, ils en approchent » → des points de couleur approchent et tracent la lanterne
- **Moment** : « Elle s’allume » → la lanterne s'allume ; l'accord du père, pour la première fois du livre
- **Moment** : « Son rayonnement dessine les ornements » → les cercles de lumière dessinent en or les ornements de la porte
- **Moment** : « Ils s’inscrivent dans un bois hors du temps » → le bois et la pierre paraissent ; la pierre se fond dans le noir
- **Son** : vision ; souffle, battement, accord du père
- **Note** : Scène spéciale « vision », un temps par phrase. La porte du père est la porte verte d'Irun de Karl (39434691), haut de la photo seulement : ni le cycliste, ni la plaque « 2 », ni la serrure.
- **Repérage** (S1) : Lanterne de bois ajourée de cercles, allumée dans le noir, et ses cercles de lumière sur un mur

### 3.11 La porte inconnue

¶82–85, 104 mots : « Darshan ne connaît pas cette porte qui lui fait … à lui par une force irrépressible. »

- **Lieu** : La vision · **monde** : Darshan · **entrée** : même plan
- **Décor** : La porte du père, sa lanterne allumée ; la main de Darshan, en trait d'or, s'arrête à un doigt du bois ; puis le noir.
- **Photos de Karl** : [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre)
- **Geste** : « Son bras porte sa main au plus près qu’il peut de cette ouverture » → tendre la main : glisser vers la porte ; la main s'arrête à un doigt du bois, la lumière ondule (sinon : toucher)
- **Moment** : « Tu es là » → la voix intérieure s'écrit lettre à lettre, en or pâle, sans éclat ni son
- **Moment** : « La lueur de la lanterne faiblit » → la lanterne s'éteint, la porte se drape de noir, l'accord s'éteint
- **Moment** : « Darshan se voit happé » → la dernière lueur file au carnet : l'étoile à part, un anneau ; l'air revient
- **Objet** : carnet : la porte du père, étoile à part, hors de la carte (vue, non franchie)
- **Son** : vision ; accord du père, souffle
- **Note** : Premier geste impossible du livre : la porte ne recule pas, c'est la main qui ne peut aller plus loin. Page isolée : la lanterne, les ornements et l'accord sont là dès l'ouverture.

### 3.12 J'ai trouvé le chemin

¶86–92, 144 mots : « En ouvrant ses yeux, Darshan retrouve Jivan en train … métaphore qui ressemblait à une porte. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : iris
- **Décor** : Le Periyar au soir, flou puis net : les yeux s'ouvrent ; Jivan hors champ, qu'on entend couper ses légumes ; le soir tombe pendant le dialogue.
- **Photos de Karl** : [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » (encre)
- **Moment** : « Je sais » → une gerbe d'étincelles d'or ; le couteau de Jivan s'arrête
- **Moment** : « Qu’est-ce qui te fait dire que ce n’est pas encore une fausse piste » → la lumière baisse lentement : le soir tombe
- **Son** : kerala (soir) ; couteau, étincelles
- **Repérage** (S4) : Mains âgées qui coupent des légumes sur une planche, au bord de l'eau, lumière du soir, sans visage

### 3.13 Le véritable amour

¶93–95, 119 mots : « — Il n’y pas de doute possible, le message … un présent que je pourrai t’offrir. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le crépuscule sur le Periyar.
- **Photos de Karl** : [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » (encre)
- **Moment** : « Cette porte s’ouvrira à moi quand j’aurai trouvé le véritable amour » → la règle entre au carnet, dans la fiche de la porte du père : le bouton Carnet luit une fois
- **Objet** : carnet : la fiche de la porte du père reçoit la règle
- **Son** : kerala (soir) ; couteau

### 3.14 Quatre jours

¶96–98, 80 mots : « — Je n’y consens toujours point. Accepte le cadeau … graines de sa libération sans attendre. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le crépuscule sur le Periyar ; une rose des vents d'or, sans aiguille ; le vent se lève.
- **Photos de Karl** : [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » (encre)
- **Geste** : « sema aux quatre vents les graines de sa libération » → toucher les quatre points de la rose des vents : une graine part avec chaque vent (sinon : toucher quatre fois)
- **Moment** : « dans quatre jours je reçois l’élue de mon cœur » → compte à rebours : « quatre jours », avec un tic
- **Son** : kerala (soir) ; couteau, tic, brise, vent

## Chapitre 4 : Amélie et Julie

### 4.1 Amélie

¶99–100, 72 mots : « Amélie et Julie / Amélie c’est ma meilleure amie, … c’est pourquoi je choisis cette option. »

- **Lieu** : Paris, le métro · **monde** : Julie · **entrée** : bandes-julie
- **Décor** : Le panneau du métro, vu d'en bas ; puis le quai, vu d'en haut : des cercles tous pareils.
- **Photos de Karl** : [33035627](https://photos.karlforterre.fr/photo/33035627/) « Métro » (photo) ; [11876963](https://photos.karlforterre.fr/photo/11876963/) « Sur les quais du Covid » (photo)
- **Moment** : « Nos journées se ressemblent pas mal également » → le regard se baisse : le quai et ses cercles
- **Son** : métro ; portes qui se ferment
- **Note** : Seul chapitre à la première personne : la caméra est les yeux de Julie, son téléphone son interface. Bandes aux couleurs de Julie ; après elles, les boutons de Darshan s'effacent, jusqu'à 5.1 ; aucun point d'intérêt, aucune magie.

### 4.2 L'hôpital

¶100, 131 mots : « Ensuite je travaille dans cet hôpital bicentenaire où on … le patient vers un service adapté. »

- **Lieu** : L'hôpital · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le couloir sombre et sa lampe ; les trois questions, puis leur litanie en vers sur le mur.
- **Photos de Karl** : [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » (photo)
- **Geste** : « Pouvez-vous évaluer votre douleur sur une échelle allant de zéro à dix » → curseur de la douleur : une réglette, de zéro (en bas) à dix (en haut), qui se retourne (sinon : flèches haut et bas, ou toucher l'échelle)
- **Moment** : « la poésie, la prosodie de ces vers incompris » → les trois questions reviennent en vers, en boucle, sur le mur du couloir
- **Son** : hôpital ; les bips deviennent une mesure
- **Note** : Seul moment typographique du chapitre ; il répond aux vers du recueil sanskrit (3.7). Le même couloir, et sa lampe près d'une porte, reviennent en 7.4, 7.5 et 7.8.
- **Repérage** (S3) : Couloir d'hôpital ancien, une lampe suspendue près d'une porte, une blouse à une patère, sans patient ni visage (servirait aussi en 7.4, 7.5 et 7.8)

### 4.3 La tôle qui vibre

¶101, 98 mots : « En sortant du travail c’est la même chose. Les … l’après-midi quand je suis de nuit. »

- **Lieu** : Le RER ; la pause ; le lit · **monde** : Julie · **entrée** : obturateur
- **Décor** : La tôle grise du RER qui passe ; la tasse de café, la nuit ; le lit défait, le téléphone dessus.
- **Photos de Karl** : [33035652](https://photos.karlforterre.fr/photo/33035652/) « RER » (photo) ; [12441049](https://photos.karlforterre.fr/photo/12441049/) « Kawa » (photo) ; [38256669](https://photos.karlforterre.fr/photo/38256669/) « Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait » (photo)
- **Geste** : « mes mains pianotent des messages pour Amélie » → pianoter sur le téléphone : deux bulles partent vers Amélie, sans texte (le livre n'en donne pas) (sinon : toucher)
- **Objet** : + téléphone (le sac de Julie s'ouvre, annoncé comme une notification)
- **Son** : métro (rame) ; tôle, clavier ; puis tasses ; puis chambre
- **Note** : Le téléphone est le premier objet de Julie : ni fonte, ni éclat.

### 4.4 La friperie

¶102–103, 91 mots : « Amélie m’a parlé d’une petite friperie qui venait d’ouvrir … exactement ce qui me retient ici. »

- **Lieu** : Une rue, le carrefour · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le carrefour, à pied : quatre pas, et la question au coin de la rue.
- **Photos de Karl** : [10355467](https://photos.karlforterre.fr/photo/10355467/) « Piéton traversant un carrefour devant un immeuble moderne arrondi » (photo)
- **Geste** : « c’est donc en chemisier avec mes chaussures à plateforme que je sors » → marcher : quatre pas en rythme, sur des semelles à plateforme (sinon : toucher en rythme)
- **Son** : rue ; pas sur des plateformes
- **Note** : Aucune image de Julie ici : la caméra est ses yeux. Même carrefour et même geste que la course de 7.9 : la question ici, la réponse là.
- **Repérage** (S7) : Chaussures à plateforme sur le trottoir, vues d'en haut, en marchant (le regard de Julie)

### 4.5 Partir

¶103–104, 137 mots : « Ma famille n’a jamais été très câlins et appels … rencontrerai peut-être l’homme dont je rêve. »

- **Lieu** : La foule, puis la campagne rêvée · **monde** : Julie · **entrée** : obturateur
- **Décor** : La foule en fantômes, un téléphone à la main ; la sortie verte d'un tunnel ; le village rêvé.
- **Photos de Karl** : [31641251](https://photos.karlforterre.fr/photo/31641251/) « Fantômes » (photo) ; [13234891](https://photos.karlforterre.fr/photo/13234891/) « Sortie » (photo) ; [39228274](https://photos.karlforterre.fr/photo/39228274/) « Village paisible niché dans les collines verdoyantes de Bourgogne-Franche-Comté » (photo)
- **Geste** : « Je veux prendre l’air » → prendre l'air : maintenir pour inspirer, lâcher pour souffler, une fois ; on passe la sortie du tunnel (sinon : toucher : une respiration guidée ; maintenir Espace)
- **Moment** : « Parfois ils sont pianistes, guitaristes ou jongleurs » → une guitare de rue s'éloigne ; l'accord final ne vient pas
- **Son** : rue (dense) ; guitare de rue ; puis tunnel, souffle ; puis parc, le merle
- **Note** : Le souffle répond à celui du mudrā (3.10) : du rose faux de l'infrarouge, par le noir du tunnel, au vrai vert.

### 4.6 Le prince

¶105, 104 mots : « Trouver un prince avec qui convoler faisait partie des … pense pas qu’il s’agissait d’un numéro. »

- **Lieu** : La vitrine de la rue Rousseau · **monde** : Julie · **entrée** : obturateur
- **Décor** : La photo de la rencontre (2.2), floue comme un souvenir, qui se met au point.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo)
- **Moment** : « Il m’a abordée devant cette vitrine de la rue Rousseau » → le souvenir se met au point : l'image de 2.2
- **Son** : rue ; deux battements du cœur de Julie
- **Note** : Même décor qu'en 2.2 : la même rencontre, racontée par elle. Seule image de Julie du chapitre, parce que c'est un souvenir : le regard qu'elle a senti.

### 4.7 Un numéro

¶105–108, 123 mots : « Un numéro, je me suis surprise à lui demander … dois me préparer pour ce jour. »

- **Lieu** : La vitrine ; chez Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : La rencontre, qui se brouille quand le téléphone monte ; un contact sans numéro ; puis la chambre de Julie.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo) ; [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » (photo)
- **Geste** : « je me suis surprise à lui demander le sien » → glisser le téléphone vers le haut, vers lui : il revient avec son nom, le numéro toujours vide (sinon : toucher le téléphone)
- **Moment** : « Elle s’emporta avec moi en enthousiasme et théories » → le téléphone vibre trois fois dans le sac
- **Moment** : « dans quatre jours je serai chez lui » → compte à rebours : quatre jours, du côté de Julie (comme en 3.14)
- **Objet** : téléphone : un contact, « Darshan », sans numéro
- **Son** : rue ; puis chambre ; vibreur ; un tic
- **Repérage** (S7) : La vitrine de face, et dans la glace le reflet flou d'un homme qui s'approche (la vitrine de 2.2, vue b) : on y tendra le téléphone

## Chapitre 5 : Douceurs et confettis

### 5.1 Soixante-douze heures

¶109–111, 88 mots : « Douceurs et confettis / Il y a encore soixante-douze … rappelle à moi nos moments complices. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : bandes-julie
- **Décor** : Le lit, l'oreiller ; puis, par la fenêtre, les toits de 2.9 et 2.10 au crépuscule.
- **Photos de Karl** : [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » (photo) ; [38674517](https://photos.karlforterre.fr/photo/38674517/) « Silhouettes de toits et d'antennes télé sur un ciel pastel au crépuscule » (photo)
- **Moment** : « Il y a encore soixante-douze heures qui me séparent de son regard » → compte à rebours : « quatre jours » devient « soixante-douze heures », avec un tic
- **Moment** : « dehors, à la fenêtre, je sens sa présence » → la fenêtre : les toits de 2.9 et 2.10, où le vagabond rêvait de la recevoir
- **Son** : chambre (fenêtre) ; la rue s'entrouvre à la fenêtre
- **Note** : Pas de geste : la page de l'attente. Encore une page de Julie à la première personne : sans les boutons de Darshan. Les bandes du titre sont celles de Julie, en lilas, et leur grain devient une pluie de confettis rose, menthe et citron ; ni or ni vermillon.

### 5.2 Le marché d'Aluva

¶112–113, 112 mots : « Darshan cavale sur le marché d’Aluva avec Jivan sur … l’étal de fruits à sa portée. »

- **Lieu** : Aluva, le marché · **monde** : Darshan · **entrée** : encre
- **Décor** : Une allée de marché sous les palmes dorées, dans la lumière d'orient ; cinq étals dessinés à l'encre.
- **Photos de Karl** : [34342144](https://photos.karlforterre.fr/photo/34342144/) « Jardin tropical » (encre) ; [35104311](https://photos.karlforterre.fr/photo/35104311/) « Gros plan d'une tête de chameau au licol de cuir près d'une couverture tissée colorée » (modèle) ; [29136749](https://photos.karlforterre.fr/photo/29136749/) « Tapis » (modèle)
- **Geste** : « Darshan fait l’acquisition des thés les plus délicats, de curcuma, d’encens, de jarres et de tapisseries » → toucher chaque étal : les cinq marchandises rejoignent le sac ; au cinquième, le bouton Objets ploie (sinon : toucher cinq fois)
- **Objet** : + thés, + curcuma, + encens, + jarres, + tapisseries (un envol annoncé, puis quatre envols courts)
- **Son** : marché ; tanpura ; les pas de Jivan traînent derrière ; une mangue roule
- **Note** : Les boutons de Darshan reviennent à l'entrée, avec un reflet d'or : le lecteur retrouve ses pouvoirs et s'en sert d'abord pour tout acheter. La caméra est Darshan ; Jivan reste derrière, hors champ.

### 5.3 Julie est mon nord

¶114–116, 119 mots : « — Je ne puis calmer mes ardeurs, nous sommes … autour de laquelle tu veux discutailler. »

- **Lieu** : Le marché · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor ; la rose des vents d'or de 3.14, qui trouve son nord.
- **Moment** : « Julie est mon nord, mon étoile du matin » → la rose des vents de 3.14 trouve son nord : l'aiguille se fixe en haut, l'étoile du matin brille à sa pointe ; le bouton Carnet luit une fois, et le carnet garde l'aiguille, pointe vermillon, d'Aluva vers Paris
- **Son** : marché ; aiguille
- **Note** : « Oui… Oui… Tu… Elle… » paraît mot après mot, au rythme du souffle court de Jivan.

### 5.4 À la belle étoile

¶117–119, 99 mots : « — Je te laisse discutailler, tergiverser et palabrer à … limitaient à leur présenter ta personne. »

- **Lieu** : Le marché · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor ; l'ombre d'un nuage passe.
- **Moment** : « mais je doute que tu souhaites la recevoir à la belle étoile » → l'ombre du nuage de 2.10 passe sur le marché (de droite à gauche, 4 s), puis la lumière revient
- **Son** : marché

### 5.5 Le quartier Foch

¶120–123, 159 mots : « — Tu ne suis rien, ce n’est pas une … confettis qui rejoint promptement ses fournitures. »

- **Lieu** : Le marché ; la façade rêvée · **monde** : Darshan · **entrée** : même plan
- **Décor** : Au bout de l'allée, dans la chaleur, une façade couleur du lait se dessine comme un mirage, puis s'évapore.
- **Photos de Karl** : [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (encre)
- **Geste** : « un paquet de confettis qui rejoint promptement ses fournitures » → toucher le paquet de confettis : il saute dans le sac, fermé ; trois confettis s'en échappent (sinon : toucher)
- **Moment** : « Elle va passer la porte marbrée » → au bout de l'allée, la façade se dessine trait après trait, puis se lave de couleur de lait, et tremble dans la chaleur comme un mirage : le mensonge prend forme
- **Moment** : « Jivan lève les yeux au ciel » → là où Jivan regarde, la façade s'évapore vers le haut
- **Objet** : + confettis (envol)
- **Son** : marché ; pinceau ; paquet secoué
- **Note** : Ni l'Élysée ni drapeaux : la façade seule, rêve de beau parleur que le regard de Jivan dissipe. Les confettis ne serviront jamais : la fête promise n'aura pas lieu.

### 5.6 La galerie

¶124, 94 mots : « Allongée sur son lit, Julie navigue sur son téléphone, … gilet jaune qu’il ne quitte pas. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le lit en noir et blanc, le téléphone ; puis l'écran : la galerie, en couleurs.
- **Photos de Karl** : [38256669](https://photos.karlforterre.fr/photo/38256669/) « Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait » (photo) ; [29360492](https://photos.karlforterre.fr/photo/29360492/) « Bonbon vosgien » (photo) ; [29630257](https://photos.karlforterre.fr/photo/29630257/) « Nuit de décembre » (photo) ; [6858270](https://photos.karlforterre.fr/photo/6858270/) « Sandwich baguette jambon-fromage sur une assiette en céramique grise » (photo)
- **Geste** : « elle se perd dans ses photos » → glisser vers le haut sur le téléphone : la galerie s'ouvre ; ensuite, chaque glissement amène le cliché et le temps suivants (sinon : toucher)
- **Moment** : « Darshan grimaçant, surpris par des bonbons piquants » → le cliché des bonbons s'ouvre, flou de mise au point
- **Moment** : « il côtoie sur le cliché voisin » → retour à la grille : la vignette voisine, la patinoire, s'éclaire
- **Moment** : « Darshan et Julie qui partagent un croque-monsieur » → le cliché du croque-monsieur s'ouvre, bougé
- **Son** : chambre ; petits déclics du téléphone
- **Note** : La galerie ne montre que les clichés que le livre décrit, par des objets et des lieux, jamais un visage. Tant que Karl ne les a pas photographiés, les bonbons, la patinoire et le croque-monsieur restent flous (arbitrage 7).
- **Repérage** (S1) : Croque-monsieur coupé en deux, deux mains, une manche d'hiver et une manche de toile moutarde ; sans visage
- **Repérage** (S1) : Billes acidulées de toutes les couleurs, sucrées, dans une paume ouverte
- **Repérage** (S10) : Patinoire : une lame qui fend la glace en virage, au ras de la glace, copeaux, lumières d'hiver floues au fond ; sans visage

### 5.7 Le révolu don Juan

¶124, 93 mots : « L’angle du téléphone les rapetisse. Il met en valeur … lune une ballade romantique en italien. »

- **Lieu** : La galerie du téléphone · **monde** : Julie · **entrée** : glissement
- **Décor** : Le selfie flou ; les lunettes qui changent ; la Seine ; la vidéo sous la pleine lune.
- **Photos de Karl** : [34876053](https://photos.karlforterre.fr/photo/34876053/) « Silhouettes floues et abstraites de deux personnages dans une lumière chaude tamisée » (photo) ; [38279684](https://photos.karlforterre.fr/photo/38279684/) « Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé » (photo) ; [38570570](https://photos.karlforterre.fr/photo/38570570/) « Pleine lune se levant derrière des cheminées, ciel nocturne violet » (photo)
- **Geste** : « une vidéo montre Darshan chanter à contre-jour de la lune » → toucher la vidéo : la ballade, entière pour la première fois, la seule fois où quelqu'un la chante ; huit mesures, jusqu'au bout (sinon : toucher)
- **Moment** : « L’angle du téléphone les rapetisse » → le selfie s'ouvre : deux silhouettes floues dans une lumière couleur terre
- **Moment** : « elles changent assez régulièrement » → la galerie défile vite ; 1,2 s après, les lunettes frémissent dans le sac de Darshan (comme en 6.4)
- **Moment** : « Darshan est représenté face à un chevalet le long de la Seine » → le cliché de la Seine s'ouvre
- **Moment** : « Plus loin dans la galerie du téléphone » → la vignette de la vidéo paraît : la pleine lune derrière une cheminée
- **Son** : chambre ; la ballade, entière, par le haut-parleur du téléphone (melodie)
- **Note** : La ballade n'est entière qu'ici avant le baiser (arbitrage 2). Le portrait 38536478 reste exclu tant que Karl n'en a pas décidé.
- **Repérage** (S7) : Lunettes : les lunettes fumées de 1.2, les binocles ronds de 6.4 et une paire en écaille, chacune posée à un lieu de leurs sorties (table de café, banc, parapet) ; sans personne
- **Repérage** (S7) : Chevalet sur un quai de Seine : toile commencée, boîte de petits tubes ouverte sur le parapet ; sans visage

### 5.8 Des garçons normaux

¶125–127, 129 mots : « Julie rougit, elle revoit tous les regards qui étaient … à l’abri de l’érosion du temps. »

- **Lieu** : Le souvenir ; la chambre de Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : La vidéo s'agrandit et devient le souvenir : la cheminée devant la pleine lune ; puis la chambre, pâle.
- **Photos de Karl** : [38570570](https://photos.karlforterre.fr/photo/38570570/) « Pleine lune se levant derrière des cheminées, ciel nocturne violet » (photo) ; [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » (photo)
- **Moment** : « il s’avance vers elle en déclamant ses vers » → la vue avance lentement vers la lune, comme il avance vers elle
- **Moment** : « Il est incroyable » → retour à la chambre pâle ; la rue se tait
- **Moment** : « L’air électrique d’une mélodie trotte dans la tête de Julie » → un pied bat la mesure, à 6/8, sans une note : la mélodie reste dans sa tête
- **Son** : rue (nuit) ; puis chambre ; un pied à 6/8
- **Note** : Aucune ballade ici : le lecteur, qui vient de l'entendre, la retrouve de mémoire. « Il est incroyable. » et la suite sont en romain dans le livre imprimé, une voix dite qui tutoie Julie ; « La fille que tu étais […] » (5.9), en italique, lui répond : même place, sans couleur de personnage.

### 5.9 Je l'aime

¶128–129, 130 mots : « La fille que tu étais n’a-t-elle pas toujours voulu … de leur amour que brandit Julie. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : La chambre pâle ; sous la lumière chaude de l'éclair, le ciel du soir ; puis la vue monte jusqu'au croissant.
- **Photos de Karl** : [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » (photo) ; [38674516](https://photos.karlforterre.fr/photo/38674516/) « Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical » (photo)
- **Geste** : « Il choisit la synchronie d’une dépendance à deux » → maintenir : les deux cœurs de 2.9 (Darshan 96, Julie 64) se rejoignent vers 80 et battent ensemble (sinon : maintenir)
- **Moment** : « La foudre est une caresse » → éclair doux : une lumière chaude, et la fenêtre s'ouvre sur le ciel du soir
- **Moment** : « s’est mué en clairon clair et limpide » → le bourdonnement grave se tait ; une seule note claire, tenue
- **Moment** : « Une flopée de caresses flattent son palpitant » → le cœur de Julie bat seul, irrégulier
- **Moment** : « le souhait porté à la lune » → la vue monte du ciel du soir jusqu'au croissant
- **Son** : chambre ; bourdon ; une note claire ; battements
- **Note** : « Je l’aime et je vais lui dire. » seul à l'écran, sans effet : le texte suffit. Après, un événement par temps, et rien de plus.

### 5.10 La pâtisserie

¶130, 113 mots : « Elle se lève, s’habille, rejoint la rue puis part … de faire chavirer son cœur ? »

- **Lieu** : La rue, la pâtisserie · **monde** : Julie · **entrée** : obturateur
- **Décor** : La rue le soir, qui se brouille ; la vitrine, floue et chaude tant que Karl ne l'a pas photographiée.
- **Photos de Karl** : [16592454](https://photos.karlforterre.fr/photo/16592454/) « Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit » (photo) ; [10369144](https://photos.karlforterre.fr/photo/10369144/) « Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise » (photo)
- **Moment** : « La rue se fait floue » → la rue se brouille, le bruit s'assourdit ; la vitrine paraît, floue et chaude
- **Moment** : « L’éclair a-t-il la carrure de porter ses sentiments » → avec la vitrine de Karl : mise au point sur l'éclair, un reflet glisse sur son glaçage
- **Moment** : « Le chocolat, le café sont-ils des arômes dignes de l’amour » → avec la vitrine de Karl : la mise au point glisse vers le chocolat et le café
- **Moment** : « Un baba au rhum doté d’un parfum d’Antilles » → avec la vitrine de Karl : la mise au point cherche le baba au rhum
- **Son** : rue ; puis pâtisserie (clochette)
- **Note** : Pas de geste : la mise au point hésite à la place du lecteur, qui garde son geste pour la buée (5.11). Tant que Karl n'a pas photographié la vitrine, elle reste floue, sans zone nette ni reflet.
- **Repérage** (S5) : Vitrine de pâtisserie, le soir, en hauteur : éclairs au chocolat et au café, baba au rhum ; sur pied

### 5.11 La charlotte

¶131–133, 115 mots : « Julie s’égare dans ses songes. Son imagination l’amène à … son rendez-vous est à treize heures. »

- **Lieu** : La pâtisserie · **monde** : Julie · **entrée** : même plan
- **Décor** : La vitrine s'embue ; par un hublot essuyé, un cercle rouge.
- **Photos de Karl** : [10369144](https://photos.karlforterre.fr/photo/10369144/) « Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise » (photo) ; [29188525](https://photos.karlforterre.fr/photo/29188525/) « Tarte aux pommes » (photo)
- **Geste** : « au travers d’une vitrine embuée » → frotter la buée en petits cercles : un hublot s'ouvre au milieu, le reste de la vitre reste embué (sinon : toucher trois fois)
- **Moment** : « Julie s’égare dans ses songes » → la buée monte sur la vitrine
- **Moment** : « sur elles perle une fine condensation » → avec la Charlotte de Karl : rapprochement, dans le hublot, vers les feuilles de sucre
- **Moment** : « Julie repart avec son ticket » → le ticket entre au sac de Julie (notification) ; son bouton ploie, comme celui de Darshan en 5.2
- **Moment** : « Elle le récupérera à onze heures et son rendez-vous est à treize heures » → compte à rebours : « onze heures », « treize heures », avec un tic
- **Objet** : + ticket de la pâtisserie (notification, sac de Julie)
- **Son** : pâtisserie ; buée frottée ; tic
- **Note** : Pas de ruban autour de la Charlotte : le rouge passe du cercle de framboises au nœud du paquet (6.1). En attendant la photo de Karl, le hublot ne montre qu'un cercle rouge, doux, derrière la buée restante.
- **Repérage** (S5) : Charlotte aux framboises (cercle de framboises, boudoirs, trois feuilles de sucre perlées), derrière une vitre embuée : même cadre, sur pied, en hauteur, vitre embuée, puis un rond essuyé au milieu, puis vitre nette

## Chapitre 6 : Des attentes de part et d’autre

### 6.1 Il est midi

¶134–135, 71 mots : « Des attentes de part et d’autre / Il est … des dalles de la rue Rousseau. »

- **Lieu** : Paris, la rue Rousseau · **monde** : Julie · **entrée** : bandes-photo
- **Décor** : Julie de dos, son chouchou rouge ; à sa main gauche, le paquet, dont le ruban flotte au vent puis bat au rythme de son cœur.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo)
- **Moment** : « Il est midi » → « midi » naît de « onze heures » et de « treize heures », en haut de la page, avec le tic
- **Moment** : « Son nœud vacille au vent comme son cœur » → le cœur de Julie, vif ; le ruban bat à son rythme
- **Objet** : ticket → paquet au ruban rouge (discret : la charlotte est dans sa boîte)
- **Son** : rue ; mistral en rafales, satin du ruban ; le cœur de Julie, vif
- **Repérage** (S5) : Paquet de pâtisserie noué d'un ruban de satin rouge, tenu à la main dans le vent, sans visage

### 6.2 Les deux listes

¶136–139, 79 mots : « Darshan ne tient pas en place au pied de … rue qui la sépare de Darshan. »

- **Lieu** : Écran partagé · **monde** : les deux · **entrée** : même plan
- **Décor** : Deux moitiés séparées par l'arête d'un coin de rue : la façade à l'encre (Darshan), la rue en photo (Julie) ; deux listes à cocher ; quand Julie tourne le coin, la façade devient photo.
- **Photos de Karl** : [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (encre) ; [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo) ; [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (photo)
- **Geste** : « Veste, barbiche comme il faut, bague, chemise des grands jours » → cocher la liste de Darshan (sinon : toucher)
- **Geste** : « Bague, boucles d’oreilles, gâteau, sac à main » → cocher la liste de Julie : « Bague » et « des grands jours » s'allument des deux côtés (sinon : toucher)
- **Moment** : « passe le coin de rue qui la sépare de Darshan » → la ligne de partage glisse et s'efface ; la façade à l'encre devient photo
- **Son** : rue ; une rue par oreille ; coche au pinceau, coche au stylo
- **Note** : Les deux listes riment (« bague », « des grands jours ») : des attentes de part et d'autre. L'écran partagé revient pendant l'attente de 6.11, puis en 7.4. En grand texte, les listes s'empilent.

### 6.3 Les retrouvailles

¶140–143, 120 mots : « Leurs retrouvailles prennent place à l’ombre du balcon, sous … on sera à l’intérieur, coupe Julie. »

- **Lieu** : Au pied de la bâtisse · **monde** : Julie · **entrée** : même plan
- **Décor** : La façade haussmannienne, ses balcons et leurs jardinières, sous un halo couleur de blé ; puis la porte bleue.
- **Photos de Karl** : [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (photo) ; [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » (photo)
- **Moment** : « un halo de la couleur du blé » → halo de blé, venu du zénith, sur la bande des balcons ; « midi » s'y fond ; la note claire de 5.9
- **Moment** : « C’est très gentil, mais tu pourrais en garder pour quand on sera à l’intérieur » → la porte bleue
- **Son** : rue ; plus calme, c'est midi ; une seule note claire, tenue, au halo

### 6.4 La clé dans la poche

¶144–147, 153 mots : « — Oui bien sûr, laisse-moi un instant, je vais … son aimé, puis pousse la porte. »

- **Lieu** : La porte de la demeure · **monde** : Julie · **entrée** : même plan
- **Décor** : La porte bleue sous le balcon ; à « La porte est ouverte », l'encre saigne depuis le bouton du portillon : la porte devient celle de la légende (3.1, 3.2).
- **Photos de Karl** : [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » (photo) ; [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » (encre)
- **Geste** : « puis pousse la porte » → pousser la porte, comme Julie (même consigne qu'au pigeonnier) (sinon : toucher)
- **Moment** : « la clé est dans ma poche » → hors champ : seul le bouton Objets frissonne, les lunettes sont devenues clé
- **Moment** : « La porte est ouverte » → l'encre saigne depuis le bouton du portillon
- **Moment** : « Darshan pose sur son nez une paire de binocles » → nouvel objet : les binocles
- **Objet** : lunettes → clé (discret : Julie ne voit rien, le bouton Objets frissonne)
- **Objet** : clé → binocles (Nouvel objet)
- **Son** : rue ; tintement du frisson, déclic, encre qui s'épanouit, porte
- **Note** : La coquetterie cache la magie : Julie ne voit que des binocles, le lecteur voit la clé dans le sac. L'étoile de la demeure naît en 6.5, quand la lumière de la porte a gagné l'écran.

### 6.5 Le repère de la grâce

¶148, 88 mots : « S’ouvre à elle tout en douceur et sobriété le … qualité de l’étoffe entre ses doigts. »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : porte
- **Décor** : La fenêtre voilée, dessinée, d'où vient une lumière tamisée ; la patère ; un rabat de velours bleu nuit.
- **Photos de Karl** : [12443176](https://photos.karlforterre.fr/photo/12443176/) « Toits pictaves » (photo) ; [38570569](https://photos.karlforterre.fr/photo/38570569/) « Détail d'une patère en bois sur un portemanteau chromé, ciré jaune en arrière-plan flou » (photo)
- **Geste** : « Julie est troublée par la qualité de l’étoffe entre ses doigts » → caresser le velours de haut en bas, lentement : le poil s'éclaire dans son sens, fonce à rebours (sinon : toucher)
- **Moment** : « Il l’accroche sur l’une des patères disponibles » → la patère
- **Moment** : « Leurs rabats de velours » → le velours, en gros plan
- **Son** : appartement ; tentures, horloge lointaine, velours sous le doigt
- **Repérage** (S1) : Rabat de velours bleu nuit en lumière rasante, cadre en hauteur

### 6.6 Les toiles

¶148, 125 mots : « L’encens et le thé sont servis dans le salon. … berges tracées à l’encre de Chine. »

- **Lieu** : L'appartement, le salon · **monde** : les deux · **entrée** : fondu
- **Décor** : Un mur de toiles de lin à l'encre de Chine : lunes, arbres, arche ; en bas au milieu, l'encens, la pierre et les bâtons d'encre ; en haut au milieu, le couple qui danse main dans la main, seule toile que l'aquarelle colore.
- **Moment** : « L’encens et le thé sont servis dans le salon » → l'encens et les thés quittent le sac, sans bandeau
- **Moment** : « Leur fumet agit comme un fil d’Ariane » → la fumée monte seule de l'encens à la toile du couple ; les toiles s'éclairent à son passage
- **Moment** : « La peinture fait partie des rares œuvres que l’aquarelle irrigue de couleurs » → l'aquarelle irrigue la toile du couple : l'orange et le jaune suivent les berges d'encre
- **Objet** : − encens, − thés (dépôt discret : servis dans le salon)
- **Son** : appartement ; encens qui crépite, souffle de la fumée, pinceau
- **Note** : Une page à regarder, sans geste. Mise en abyme : les toiles sont dessinées de la même main que le monde de Darshan. Le couple a les couleurs de la robe orange (7.11) et du gilet jaune (5.6), à valider par Karl.

### 6.7 Le vertige

¶149, 76 mots : « Julie se confond en émotions, elle reprend son souffle … ses vertiges avec un bon thé. »

- **Lieu** : L'appartement, la fenêtre · **monde** : Julie · **entrée** : fondu
- **Décor** : La fenêtre ciselée de moulures ; le voilage s'écarte : une rue vue d'un étage, qui n'est pas la rue Rousseau.
- **Photos de Karl** : [12443176](https://photos.karlforterre.fr/photo/12443176/) « Toits pictaves » (photo)
- **Geste** : « Sans avoir emprunté ni marches ni ascenseurs » → écarter le rideau : la ville paraît, vue d'un étage (sinon : toucher)
- **Moment** : « elle jurerait depuis sa fenêtre avoir quitté terre et être à un étage » → vertige : la fenêtre reste, la ville recule
- **Son** : appartement ; rideau, la ville monte d'en bas puis s'éloigne
- **Note** : Tant que le repérage S7 manque, la vue reste floue derrière la vitre : les toits pictaves ne sont pas Paris.
- **Repérage** (S7) : Une rue haussmannienne vue d'une fenêtre de premier ou de deuxième étage, garde-corps de fer forgé au premier plan, façades d'en face, lumière d'après-midi, cadre en hauteur

### 6.8 Le thé de haut

¶150–152, 102 mots : « Darshan joint sa main gauche à la anse de … sourire amusé accompagné d›un index naïf. »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : fondu
- **Décor** : Le filet de thé versé de haut dans la tasse de cuivre ; puis, derrière l'épaule, le tableau : une barque vide sur un lac, en noir et blanc, dans un cadre de bois sombre.
- **Photos de Karl** : [37296469](https://photos.karlforterre.fr/photo/37296469/) « Thé versé d'un gaiwan céladon dans une tasse en porcelaine blanche » (photo) ; [34342149](https://photos.karlforterre.fr/photo/34342149/) « Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc » (photo)
- **Geste** : « Il la hisse à hauteur d’épaule » → lever la théière : glisser vers le haut, le filet s'allonge jusqu'à la tasse (sinon : maintenir)
- **Moment** : « reconnaît derrière son épaule un tableau » → le tableau paraît derrière l'épaule
- **Son** : appartement ; thé versé, de plus en plus aigu
- **Note** : Tant que le repérage S1 manque, la photo du thé reste floue : elle montre un gaiwan et de la porcelaine.
- **Repérage** (S1) : Chai versé de haut dans une tasse de cuivre tenue par sa soucoupe, la main seule ; la tasse au milieu de la hauteur, la théière en haut

### 6.9 Théo est un ami

¶153–155, 105 mots : « — Oui, Théo est un ami, il me l’a … qui ne peut se permettre d’attendre. »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : même plan
- **Décor** : Le même tableau ; l'image avance lentement vers la barque vide.
- **Photos de Karl** : [34342149](https://photos.karlforterre.fr/photo/34342149/) « Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc » (photo)
- **Moment** : « le vivant qui ne peut se permettre d’attendre » → l'horloge passe au premier plan
- **Son** : appartement (horloge) ; l'horloge, au premier plan à la dernière phrase

### 6.10 Le dosa

¶156–157, 76 mots : « Julie rougit tandis que Darshan tend une assiette dotée … son regard dans le sien : »

- **Lieu** : L'appartement, la table · **monde** : Julie · **entrée** : fondu
- **Décor** : L'assiette à motifs, en gros plan ; la main de Julie près de l'assiette, dans une lumière qui refroidit.
- **Photos de Karl** : [38694025](https://photos.karlforterre.fr/photo/38694025/) « Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry » (photo)
- **Geste** : « Darshan pose sa main sur celle de Julie » → maintenir : la main sur la main ; sous le doigt, deux cœurs déjà accordés (sinon : maintenir)
- **Moment** : « Ensemble ils savourent ce doux goût de curry » → le curcuma d'Aluva quitte le sac, sans bandeau
- **Moment** : « qui commence à rafraîchir la pièce » → la lumière refroidit ; la main de Julie
- **Objet** : − curcuma (dépôt discret : le curry du dosa)
- **Son** : appartement ; l'horloge au loin ; deux cœurs ensemble, à 80 ; la rue du soir
- **Note** : La cuisine photographiée à Villandry, en plans serrés seulement. L'assiette reste floue tant que le repérage S6 manque.
- **Repérage** (S1) : La main de Julie posée sur une table de bois, près d'une assiette ; puis la main qui se retire ; puis la table sans elle (la même séance que la main de 2.1)
- **Repérage** (S6) : Dosa sur une assiette à motifs, deux fourchettes, fin de jour

### 6.11 Je tiens à toi

¶158–160, 102 mots : « Je tiens à toi, tu sais… / — Je … mais elles ne mènent nulle part… »

- **Lieu** : L'appartement, la table · **monde** : les deux · **entrée** : même plan
- **Décor** : La main de Julie ; « aime », un instant ; pendant l'attente, l'écran partagé : le ciel de 1.1 et l'étoile à part, la main seule de Julie ; puis la table, l'éclat brisé, trois portes d'encre ouvertes sur le papier nu.
- **Photos de Karl** : [38694025](https://photos.karlforterre.fr/photo/38694025/) « Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry » (photo) ; [38570603](https://photos.karlforterre.fr/photo/38570603/) « Graffiti « je t'aime » peint en violet sur une surface orangée et rouillée » (photo) ; [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (encre)
- **Geste** : « Darshan se lève, porte ses mains au ciel et attend » → attendre, comme lui : dix secondes, sans rien toucher ; l'écran se partage entre son ciel et la main de Julie (sinon : attendre)
- **Geste** : « Il se saisit de ses lunettes et d’un mouvement de poignet les change en clés » → le geste vif de la première porte : glisser vers le haut, vivement ; l'éclat se brise (sinon : toucher)
- **Moment** : « Je dirais même pour ma part que je t’aime » → « aime », le graffiti de Karl, un instant, le regard baissé
- **Moment** : « Darshan se lève, porte ses mains au ciel » → son cœur se tait ; celui de Julie reste seul, irrégulier ; l'horloge passe au premier plan
- **Moment** : « Dix longues secondes s’écoulent » → la table ; le compte à rebours : « Dix longues secondes »
- **Moment** : « Il ferme les yeux, inspire et appelle son père » → la quinte à vide de 1.1, deux fois, que rien ne résout
- **Moment** : « Rien ne se passe » → seul à l'écran ; silence complet ; le compte se défait sur rien
- **Moment** : « mais elles ne mènent nulle part » → trois portes d'encre s'ouvrent sur le papier nu ; les étincelles du carnet meurent
- **Objet** : binocles → clé (éclat brisé ; la fiche ne s'ouvre pas)
- **Son** : appartement ; deux cœurs, puis celui de Julie seul ; dix coups d'horloge ; la quinte sans réponse ; silence ; éclat qui se brise
- **Note** : Le graffiti « je t'aime » de Karl, recadré sur « aime », un instant, quand Julie le dit (choix de Karl, 29 septembre). L'attente reprend l'écran partagé de 6.2 : des attentes de part et d'autre ; tant que la main de Julie n'est pas photographiée (S1), sa moitié montre sa place à table. Le père ne répond jamais : son accord n'appartient qu'à sa porte. Aucune fiche ne s'ouvre pendant ce temps fort.

### 6.12 Des paysages dépourvus de sens

¶161–162, 96 mots : « Julie ne comprend pas ce qui se déroule sous … comment Julie peut-elle y croire ? »

- **Lieu** : L'appartement · **monde** : les deux · **entrée** : même plan
- **Décor** : La fonte vue du dehors, encre visqueuse qui goutte sur la photo ; derrière chaque porte d'encre, un paysage de Karl ; puis la photo s'efface : ne restent sur le papier que les portes d'encre.
- **Photos de Karl** : [38694025](https://photos.karlforterre.fr/photo/38694025/) « Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry » (photo) ; [39228274](https://photos.karlforterre.fr/photo/39228274/) « Village paisible niché dans les collines verdoyantes de Bourgogne-Franche-Comté » (photo) ; [39564914](https://photos.karlforterre.fr/photo/39564914/) « Gorge marine encadrée de falaises érodées à l'horizon, près de Ribadeo » (photo) ; [39212543](https://photos.karlforterre.fr/photo/39212543/) « Le pic du Midi d'Ossau domine des contreforts brumeux » (photo) ; [10644439](https://photos.karlforterre.fr/photo/10644439/) « Maquette de voilier prise dans la banquise sous une lumière bleue » (photo) ; [35024039](https://photos.karlforterre.fr/photo/35024039/) « Rochers empilés formant un monument naturel sous un ciel bleu et nuageux » (photo) ; [13020351](https://photos.karlforterre.fr/photo/13020351/) « Clé des champs » (photo)
- **Geste** : « Il répète l’opération » → ouvrir porte après porte, de plus en plus vite : chacune donne un instant sur un paysage de Karl, puis claque (sinon : toucher)
- **Moment** : « s’est fondue le temps d’un instant en une matière visqueuse » → la fonte vue par Julie : une encre visqueuse qui goutte sur la photo
- **Moment** : « La routine postiche de Darshan » → la photo s'efface ; ne restent que les portes d'encre sur le papier
- **Son** : appartement ; fonte visqueuse ; un son par paysage, portes qui claquent ; puis presque rien
- **Note** : Six photos de Karl, jetées l'une après l'autre : la première, le village rêvé de 4.5 ; la dernière, le champ de blé, a la couleur du halo de 6.3. Aucune église, aucune inscription lisible.

### 6.13 Le placard

¶163, 104 mots : « Si cette fenêtre ne te convainc pas, cette porte … tente de prendre la parole : »

- **Lieu** : L'appartement, le placard · **monde** : les deux · **entrée** : fondu
- **Décor** : Une seconde, la fenêtre de 6.7 ; la main de Julie, qui se retire ; l'armoire à l'encre, la clé de laiton ; dans le cadre du placard, la verdure photographiée.
- **Photos de Karl** : [38694025](https://photos.karlforterre.fr/photo/38694025/) « Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry » (photo) ; [32429189](https://photos.karlforterre.fr/photo/32429189/) « Couloir vers l'impasse » (photo)
- **Geste** : « Darshan se saisit de la main de Julie et l’invite à le suivre » → prendre sa main : elle reste immobile, puis se retire (sinon : toucher)
- **Geste** : « il insère une clé de laiton un peu oxydé » → tourner la clé d'un quart de tour, comme au pigeonnier (sinon : toucher la clé)
- **Moment** : « Darshan souffle, il se dirige vers la porte du placard » → l'armoire à l'encre
- **Moment** : « le placard donne sur un espace de verdure proche du parc Montsouris » → le placard s'ouvre : dans son cadre d'encre, la verdure photographiée ; le merle chante
- **Objet** : clé de laiton : dans la serrure du placard (quart de tour)
- **Son** : silence ; tissu, tour de clé comme au pigeonnier ; puis le parc et son merle
- **Note** : La clé se tourne comme au pigeonnier (1.3), avec la même consigne et le même rayon. Ce que la main n'obtient pas, la clé l'obtient. L'étoile du placard naît en 6.15, quand Julie le franchit.
- **Repérage** (S1) : Clé de laiton un peu oxydée dans la serrure d'une armoire entrouverte sur des serviettes (facultatif)

### 6.14 Ta colère est juste

¶164–166, 106 mots : « Ta colère est juste, je t’ai menti. Il n’empêche … ne veux que retrouver mon père… »

- **Lieu** : Le placard ouvert · **monde** : les deux · **entrée** : même plan
- **Décor** : Dans le cadre d'encre du placard : la verdure, puis la maison au lierre de Julie.
- **Photos de Karl** : [32429189](https://photos.karlforterre.fr/photo/32429189/) « Couloir vers l'impasse » (photo) ; [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo)
- **Moment** : « Et là, c’est le palier de ma porte » → dans le cadre du placard, sa maison au lierre
- **Son** : parc ; le merle, par le placard

### 6.15 Un moyen

¶167–169, 107 mots : « — C’est ce que tu veux, je ne suis … ce qui vient de se passer. »

- **Lieu** : Le palier de Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : Le cadre s'élargit, Julie traverse ; l'encre se retire ; sa maison, puis sa porte dans le lierre, la même qu'en 2.9, sous le crépuscule ; le ruban rouge, immobile.
- **Photos de Karl** : [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo)
- **Geste** : « elle parcourt les quelques mètres la séparant de son palier » → marcher : glisser lentement vers le haut, le cadre du placard s'élargit jusqu'à disparaître (sinon : toucher)
- **Moment** : « Derrière elle, Darshan ferme la porte » → l'encre se retire des bords de l'image ; le bruit de la porte épaisse de 2.9
- **Moment** : « Julie seule et déboussolée n’a que ses lierres » → sa porte dans le lierre, au crépuscule ; le ruban pend, seul rouge de l'image ; la boussole du carnet s'arrête, perdue
- **Objet** : clé → lunettes (discret, derrière la porte)
- **Objet** : le paquet au ruban rouge reste dans le sac de Julie
- **Son** : parc ; pas sur les pavés, la porte épaisse ; puis la rue du soir, le merle au loin ; silence
- **Note** : Rime avec 2.9 : la même porte (décor seuil-lierre du chapitre 2), le même bruit de porte épaisse, sans lui ; et avec 2.8 : la même marche, seule. Le paquet reste dans le sac de Julie.
- **Repérage** (S2) : La même porte qu'en 2.9, au crépuscule
- **Repérage** (S2) : Le paquet au ruban rouge tenu à la main devant cette porte, au crépuscule

## Chapitre 7 : Au-delà de la porte

### 7.1 Le désert

¶170–171, 65 mots : « Au-delà de la porte / Paupières fermées sur le … dans l’espoir de réchauffer son cœur. »

- **Lieu** : Le désert libyque, la nuit · **monde** : Darshan · **entrée** : bandes
- **Décor** : Dessin : le ciel de 1.1 viré du bleu royal au velours noir, des dunes à l'encre, le doigt de dieu dressé au premier plan (l'empilement de rochers que 6.12 montrait derrière une porte) ; les paupières se ferment, les astres ruissellent, puis le soleil rougit les paupières.
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (encre) ; [35024039](https://photos.karlforterre.fr/photo/35024039/) « Rochers empilés formant un monument naturel sous un ciel bleu et nuageux » (modèle)
- **Geste** : « Paupières fermées sur le ciel » → maintenir pour fermer les yeux : les paupières descendent sur le ciel (sinon : maintenir, ou toucher)
- **Moment** : « sur elle ruissellent des astres fuyants » → à travers les paupières, les étoiles coulent vers le bas comme des larmes
- **Moment** : « il accepte la morsure du soleil » → le temps passe : le noir des paupières vire au rouge du soleil
- **Son** : désert (vent) ; les yeux fermés, le vent s'assourdit ; puis la chaleur

### 7.2 La coccinelle

¶172–173, 108 mots : « La coccinelle contrainte de quitter son jardin prépare sa … ces personnages torturés un parallèle réconfortant. »

- **Lieu** : La mousse ; puis la chambre de Julie · **monde** : les deux · **entrée** : fondu
- **Décor** : Le lit de la coccinelle, pétales fanés ; puis la chambre de Julie, la lumière bleue de la télévision sur la couette.
- **Photos de Karl** : [11968793](https://photos.karlforterre.fr/photo/11968793/) « Tapis de rêves » (photo) ; [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » (photo)
- **Moment** : « La coccinelle contrainte de quitter son jardin prépare sa diapause » → intermède : la coccinelle est déjà cachée sous les pétales
- **Moment** : « Julie fixe sa télé » → la lumière bleue de la télévision bat sur la couette
- **Son** : vent (feuilles) ; puis chambre, télévision lointaine, sans paroles
- **Repérage** (S4) : Coccinelle dans la mousse, sous des pétales fanés (macro, en hauteur ; facultatif)

### 7.3 Une larme

¶174, 72 mots : « Le soupirant souffle tout son soûl, la demoiselle panse … solution que se prendre en main. »

- **Lieu** : Entre les deux mondes · **monde** : les deux · **entrée** : fondu
- **Décor** : Un glaçon, cadré serré, la boisson hors de la mise au point, une goutte qui coule ; la banquise de la maquette ; puis les dunes.
- **Photos de Karl** : [35760712](https://photos.karlforterre.fr/photo/35760712/) « Verre de café glacé avec un gros glaçon à côté d'une carafe en verre » (photo) ; [10644439](https://photos.karlforterre.fr/photo/10644439/) « Maquette de voilier prise dans la banquise sous une lumière bleue » (photo)
- **Moment** : « Une larme ne fait pas une oasis » → une goutte coule le long du verre
- **Moment** : « un glaçon au fond d’un mojito ne forme pas un iceberg » → le glaçon devient banquise, en fondu enchaîné
- **Moment** : « Aux côtés de dunes » → la banquise fond en dunes ; un souffle de sable
- **Son** : désert (jour) ; glaçon, craquement de la glace, sable

### 7.4 Le désert fleurit

¶175–176, 87 mots : « Darshan voit le désert fleurir sous l’averse. Julie renoue … à s’oublier ne les lâche pas. »

- **Lieu** : Le désert ; l'hôpital ; le Periyar · **monde** : les deux · **entrée** : même plan
- **Décor** : Le désert de jour ; l'averse tombe d'elle-même et fait naître les fleurs à l'aquarelle ; puis l'écran partagé : le couloir de l'hôpital à gauche, le désert en fleurs puis le Periyar à droite, séparés par un fil de nuit.
- **Photos de Karl** : [35086239](https://photos.karlforterre.fr/photo/35086239/) « Champ de fleurs sauvages blanches et jaunes en pleine floraison » (encre) ; [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » (photo) ; [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » (encre)
- **Moment** : « Darshan voit le désert fleurir sous l’averse » → l'averse tombe d'elle-même et peint les fleurs à l'aquarelle
- **Moment** : « Ensemble et pourtant si loin de l’autre » → les deux moitiés s'éclairent ensemble sans se toucher
- **Son** : pluie ; puis hôpital et kerala, chacun de son côté
- **Note** : Pas de geste : Darshan regarde le désert fleurir. L'écran partagé est celui de 6.2 et 6.11.
- **Repérage** (S3) : Brancards dans un couloir d'hôpital, sans patient (facultatif)

### 7.5 Derrière les portes

¶177–182, 139 mots : « Liqueurs et opiums ne suffiraient pas à mon sevrage … appareil puis part reprendre son service. »

- **Lieu** : L'hôpital, la salle de dépôt · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le couloir en noir et blanc et sa lampe ; la porte du local, à droite.
- **Photos de Karl** : [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » (photo)
- **Geste** : « elle frappe gentiment la surface de la porte » → frapper deux fois, doucement (sinon : toucher deux fois)
- **Moment** : « Darshan, tu m’entends » → silence ; rien à toucher pendant trois secondes : Julie patiente
- **Objet** : + électrocardiogramme (envol, sac de Julie)
- **Son** : hôpital ; pas rythmés, deux coups, silence

### 7.6 Le feu

¶183–187, 113 mots : « Darshan attise la braise du feu destiné à cuire … de prendre le relais au feu. »

- **Lieu** : Aluva, au bord du Periyar · **monde** : Darshan · **entrée** : encre
- **Décor** : Le feu des sardines en gros plan, à l'encre ; les étincelles montent rejoindre les étoiles ; le regard de Jivan : Darshan qui se lève, de dos, tout près ; puis au loin, sur une passerelle, au soir ; puis le feu, que Jivan garde.
- **Photos de Karl** : [22591346](https://photos.karlforterre.fr/photo/22591346/) « Salamandre » (encre) ; [36652487](https://photos.karlforterre.fr/photo/36652487/) « Homme traversant une passerelle verte sous des saules pleureurs ensoleillés » (modèle)
- **Geste** : « Darshan attise la braise du feu » → attiser : glisser vers le haut sur les braises, les étincelles montent (sinon : toucher)
- **Moment** : « Jivan assiste au départ, le ventre vide, de Darshan » → contrechamp : Darshan se lève, de dos, tout près, vu par Jivan
- **Moment** : « Jivan ne lui répond pas » → Darshan au loin sur la passerelle, au soir : pour la première fois, Jivan le regarde partir
- **Moment** : « Il se contente de prendre le relais au feu » → retour au feu : c'est Jivan qui le garde
- **Objet** : + de quoi écrire (envol)
- **Son** : kerala (soir) ; feu, braises

### 7.7 Darshan écrit

¶188–194, 64 mots : « Darshan écrit : / Nous et rien d’autre. / … plus rien ne peut les effacer. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : La feuille, éclairée par le feu ; la déclaration s'écrit à l'encre, ligne après ligne ; on ne peut pas l'effacer.
- **Geste** : « Darshan écrit » → écrire du doigt : l'encre coule tant que le doigt appuie sur la feuille (sinon : toucher)
- **Geste** : « plus rien ne peut les effacer » → tenter d'effacer : frotter de haut en bas, l'encre résiste (sinon : toucher)
- **Moment** : « Les astres peuvent s’éteindre tant que je peux t’étreindre » → le bouton du carnet vacille une fois
- **Objet** : + lettre (envol)
- **Son** : kerala (soir) ; feu, plume, puis frottement du papier
- **Note** : Moment typographique : la déclaration, écriture tracée à l'encre (la sincérité du vers de 3.7).
- **Repérage** (S1) : La lettre, de la main de Karl : les cinq lignes de la déclaration, à la plume, encre noire ou bleu nuit, sur un papier crème ; numérisée à plat ou photographiée en lumière égale

### 7.8 La fente

¶194–195, 79 mots : « Darshan s’élance en enjambées vertigineuses jusqu’à son modeste cabanon … j’ai fait ma part d’heures supplémentaires. »

- **Lieu** : Le local à kayaks ; la pharmacie de l'hôpital · **monde** : les deux · **entrée** : même plan
- **Décor** : La lettre ; trois bonds jusqu'au local à kayaks, la nuit (le dessin du chapitre 1, cadré sur la porte) ; la clé née des lunettes dans la serrure ; le jour au pied de la porte ; le couloir de l'hôpital, où jaillit la lettre.
- **Photos de Karl** : [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » (modèle) ; [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » (photo)
- **Geste** : « L’entrebâillement au pied de la porte s’allume » → un tour de poignet : tourner la clé d'un quart de tour, comme en 1.3 (sinon : toucher)
- **Geste** : « Darshan y glisse sa déclaration » → glisser la lettre sous la porte (sinon : toucher)
- **Moment** : « Darshan s’élance en enjambées vertigineuses » → trois bonds, comme sur les tuiles
- **Moment** : « Ses lunettes rejoignent sa main puis la serrure du local » → éclat court : les lunettes deviennent la clé, déjà dans la serrure
- **Moment** : « voit jaillir de la fente de la pharmacie à morphiniques, un papier » → la lettre d'encre jaillit dans la photo ; l'étoile de la porte naît de l'embrasure
- **Objet** : lunettes → clé (éclat court)
- **Objet** : lettre : Darshan → Julie (transfert)
- **Son** : kerala (soir) ; trois sauts, l'éclat, le cran, l'hôpital de nuit par le jour de la porte, le papier ; puis hôpital
- **Repérage** (S1) : Porte de planches la nuit, lumière allumée derrière : la fente du bas éclairée (modèle du local)

### 7.9 Le chemin du retour

¶196, 84 mots : « Julie s’engage sur le chemin pour rentrer, le mot … pas, je ne peux pas ! »

- **Lieu** : Paris, le chemin de Julie · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le carrefour de 4.4 ; le banc filé, une silhouette floue ; la rue au soleil couchant (image d'attente, recadrée sans voiture) et, au bord droit, le ruban rouge tenu hors champ.
- **Photos de Karl** : [10355467](https://photos.karlforterre.fr/photo/10355467/) « Piéton traversant un carrefour devant un immeuble moderne arrondi » (photo) ; [34500385](https://photos.karlforterre.fr/photo/34500385/) « Repos » (photo) ; [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo)
- **Geste** : « elle court à la vue de Darshan » → courir : toucher en rythme, six foulées, tempo libre, comme la danse des tuiles ; chaque foulée, une croche de la première mesure de la ballade (celle du seuil, 2.9) (sinon : toucher en rythme)
- **Moment** : « il porte à la main un paquet au ruban rouge » → le ruban, seul vermillon de l'image
- **Objet** : − électrocardiogramme (discret, au début : Julie rentre chez elle)
- **Objet** : + paquet au ruban rouge (paquet-darshan, même nom que celui de Julie ; discret, sac de Darshan)
- **Son** : rue (été) ; martinets ; pas, la première mesure de la ballade, une croche par foulée ; le cœur de Julie qui s'emballe
- **Repérage** (S2) : La rue de Rungis (Paris 13e) dans l'axe du couchant, fin juin : façades de pierre de taille et balcons filants, trottoir de dalles au premier plan, une voiture de couleur neutre garée à droite, plaque hors champ (sert de 7.9 à 7.15)

### 7.10 Genou à terre

¶197–199, 115 mots : « Au prochain croisement, il sort d’une voiture garée le … frais comme la rosée, l’a adoubé. »

- **Lieu** : Rue de Rungis · **monde** : Julie · **entrée** : même plan
- **Décor** : La rue au soleil couchant ; le ruban rouge qui monte à hauteur d'épaule ; les paupières se ferment pour le baiser.
- **Photos de Karl** : [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo)
- **Geste** : « Darshan reçoit la marque de dilection sur sa nuque » → maintenir : le baiser ; les paupières se ferment, un seul cœur pour deux, de 80 à 60 (sinon : maintenir, ou toucher)
- **Moment** : « Les années forment des secondes » → la rue ralentit : ses bruits se creusent
- **Moment** : « Le ruban de satin s’affole » → le ruban s'affole au vent
- **Son** : rue (été) ; tout ralentit ; un cœur à l'unisson, puis la ballade entière, qui finit avec la page
- **Repérage** (S2) : La main d'un homme, un genou au sol, qui tend le paquet au ruban rouge contre le soleil couchant

### 7.11 Éclipse

¶200–203, 125 mots : « Ses yeux s’ouvrent, quittent les souliers de sa belle, … secrètement la surprise de l’émerveillement quotidien. »

- **Lieu** : Rue de Rungis · **monde** : Julie · **entrée** : même plan
- **Décor** : Le regard remonte la rue jusqu'au soleil ; l'éclipse photographiée par Karl (Galice, 12 août 2026), du premier contact à la totalité ; le chiasme s'écrit sur le disque noir.
- **Photos de Karl** : [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo) ; [38993391](https://photos.karlforterre.fr/photo/38993391/) « Début d'une éclipse solaire partielle dans le ciel de Galice, en Espagne » (photo) ; [38993497](https://photos.karlforterre.fr/photo/38993497/) « Le croissant s'affine pendant l'éclipse solaire en Galice » (photo) ; [38993636](https://photos.karlforterre.fr/photo/38993636/) « Fin croissant de l'éclipse solaire sur un ciel qui s'assombrit » (photo) ; [38995522](https://photos.karlforterre.fr/photo/38995522/) « L'éclipse solaire totale révèle la couronne solaire au-dessus de la Galice » (photo)
- **Geste** : « remontent une robe crépue de la couleur de l’orange » → lever les yeux : glisser vers le haut, du bas de la rue jusqu'au soleil (sinon : toucher)
- **Moment** : « larmoient au contact de son regard perlé d’amour » → premier contact : le soleil s'entame
- **Moment** : « Ils font un pas vers l’autre » → le croissant s'affine
- **Moment** : « Darshan se penche vers elle » → le ciel s'assombrit
- **Moment** : « Le contact de leurs corps éclipse tout Paris » → la totalité : l'anneau s'embrase une demi-seconde, puis la ville se tait
- **Moment** : « réarrangeant le monde avec plus de beauté » → une seule étoile paraît près de la couronne
- **Moment** : « Julie aime Darshan et Darshan aime Julie » → le chiasme, en vermillon, croisé sur le disque noir
- **Objet** : paquet au ruban rouge : il quitte le sac de Darshan, sans signe ; Julie n'en porte qu'un
- **Son** : rue (été) ; ralentie, elle se tait à la totalité ; puis le silence
- **Note** : Moment typographique : « Julie aime Darshan et Darshan aime Julie » (la réciprocité du vers de 3.7).
- **Repérage** (S2) : En plongée depuis un genou à terre : les dalles et, en haut du cadre, deux souliers de femme et l'ourlet d'une robe orange ; rien au-dessus du genou (avec un modèle)

### 7.12 La porte du père

¶204–206, 120 mots : « Ils sourient, mais les dalles du trottoir de la … l’arrêt, les fenêtres débordent de curieux. »

- **Lieu** : Rue de Rungis · **monde** : les deux · **entrée** : lumiere
- **Décor** : Le soleil revient ; la rue tremble, le trottoir se fend en étoile ; la porte du père de 3.10 (la porte d'Irun, à l'encre, et sa lanterne) monte de la fente devant le soleil ; puis le monde se fige en noir et blanc, seules la porte et la lanterne gardent leurs couleurs.
- **Photos de Karl** : [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo) ; [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre) ; [19059625](https://photos.karlforterre.fr/photo/19059625/) « Fracture » (modèle)
- **Moment** : « vibrent sous leurs pieds » → la photo tremble
- **Moment** : « laissent apparaître le linteau » → la porte du père perce la photo, le linteau d'abord
- **Moment** : « Le linteau s’accompagne d’une lanterne aux rayons pénétrants » → la lanterne s'allume : l'accord du père, tenu jusqu'à ce que Darshan s'en détourne (7.13)
- **Moment** : « Le bois est couvert de motifs » → les motifs d'or paraissent sur le bois
- **Moment** : « Darshan reconnaît l’accès vers son père » → le bouton du carnet luit : l'anneau du père s'allume
- **Moment** : « Les passants s’arrêtent et observent » → le monde se fige : la photo perd ses couleurs, des fenêtres s'éclairent, la ville se tait
- **Son** : rue (été) ; grondement, puis l'accord du père ; la ville se tait, l'accord reste seul
- **Note** : Temps fort : l'encre de Darshan entre dans le Paris de Julie. Scène écrite à la main (rue-de-rungis), de 7.12 à 7.15 ; chaque page s'ouvre sur l'état où la précédente s'arrête.

### 7.13 Le choix

¶207–211, 85 mots : « C’est mon père qui se tient derrière ces battants, … du pont menant vers son créateur. »

- **Lieu** : Rue de Rungis · **monde** : les deux · **entrée** : même plan
- **Décor** : La porte, sa lanterne, la rue figée ; la vue s'approche, recule d'un demi-pas, repart ; la paume sur le bois, qui ne bouge pas.
- **Photos de Karl** : [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo) ; [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre)
- **Geste** : « pose sa main sur l’éternel bois du pont menant vers son créateur » → poser la paume sur le bois et la garder : la clé n'est pas proposée, la porte ne réagit pas (sinon : maintenir, ou toucher)
- **Moment** : « Je ne sais pas si je pourrai revenir » → la vue recule d'un demi-pas ; l'accord du père s'éteint, la note haute la dernière ; la lanterne ne change pas
- **Son** : silence ; l'accord s'éteint sur la réplique ; la paume, sans un bruit

### 7.14 La prière

¶212, 68 mots : « — Père, je suis sûr que vous m’entendez, vous … avec l’intensité inestimable de chaque instant. »

- **Lieu** : Rue de Rungis · **monde** : les deux · **entrée** : même plan
- **Décor** : La porte et sa lanterne ; la réplique de Darshan, en or comme toutes les siennes ; puis l'or s'en va, la clé tombe en poussière, la constellation du carnet s'éteint dans la page.
- **Photos de Karl** : [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo) ; [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre)
- **Moment** : « En faisant de moi un mortel » → le désenchantement, à l'échelle de la page : l'or quitte les mots, la clé tombe en poussière, les étoiles du carnet s'éteignent une à une, l'anneau du père le dernier, les boutons disparaissent
- **Objet** : clé : désenchantement (elle se défait en poussière d'or)
- **Objet** : les boutons « Objets » et « Carnet » disparaissent ; l'étoile ✦ devient un coin de page
- **Son** : silence ; tout s'éteint sans un bruit
- **Note** : Seule coupe du livre au milieu d'une phrase : « En faisant de moi un mortel, » reste seul à l'écran pendant le désenchantement, puis « je vous prie… ». Une seule annonce, invisible, pour les lecteurs d'écran.

### 7.15 La chute

¶213–214, 114 mots : « La stupéfaction n’a plus de limite pour Julie. Elle … mélodie des aléas de la vie. »

- **Lieu** : Rue de Rungis ; puis le ciel du soir · **monde** : Julie · **entrée** : même plan
- **Décor** : Le bruit sourd : la lanterne s'éteint net ; puis la porte tombe dans la fente, sans un son ; les couleurs reviennent, sans trace d'encre ; les passants reprennent leur course ; le ciel du soir et la lune de 5.9.
- **Photos de Karl** : [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » (photo) ; [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre) ; [31641251](https://photos.karlforterre.fr/photo/31641251/) « Fantômes » (photo) ; [38674516](https://photos.karlforterre.fr/photo/38674516/) « Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical » (photo)
- **Moment** : « un bruit sourd et puissant retentit » → le choc : la lanterne s'éteint net ; la porte reste debout, sans lumière
- **Moment** : « Il s’ensuit la chute de l’édifice » → la porte tombe dans la fente, sans un son ; la fente se referme sans trace, les couleurs reviennent
- **Moment** : « Un désintérêt fulgurant renvoie à leurs activités les passants » → les passants reprennent leur course
- **Moment** : « Unie à lui, Julie gardera en tête » → la lune de 5.9, dernière image du livre
- **Son** : silence ; le choc, puis plus rien : le livre ne fait plus de son
- **Repérage** (S2) : Les passants filés, sur le même trottoir, en pose lente (un quart de seconde)

### 7.16 La fantasy s'achève

¶215, 41 mots : « La terre tourne, les astres sont pris dans leurs … de la fantasy qui s’achève ? »

- **Lieu** : La page · **monde** : livre · **entrée** : fondu
- **Décor** : Le papier seul, l'encre des mots : plus d'image ni de bouton, un coin de page pour tourner.
- **Moment** : « Ne sentez-vous pas toujours cette distance qui se crée en fermant votre porte » → la question reste seule, trois secondes, sans coin de page
- **Son** : silence
- **Note** : Seul sur sa page, comme dans le livre imprimé (page 61). « Nouvelle lecture », à la page « Fin », répond à « Y aurait-il un successeur ».

## Clôture

### 8.1 Poème de clôture

¶216–221, 61 mots : « Sobriété et grandeur ne sont que des notions. / … encore des pages et des pages. »

- **Lieu** : La page · **monde** : livre · **entrée** : fondu
- **Décor** : Le papier ; les vers se déposent comme au poème d'ouverture ; au dernier, un fil d'encre naît au bas de la page blanche.
- **Moment** : « Les sentiments noircissent » → le fil d'or du poème d'ouverture, devenu fil d'encre
- **Son** : silence
- **Note** : Le blanc du livre imprimé entre le quatrième et le cinquième vers. Puis la page « Fin » : la planche des photographies de Karl, sans encre, et « Nouvelle lecture ».

## Production, chantier par chantier

Les chantiers D3 à D7 de [plan-darshan.md](plan-darshan.md), une session chacun, dans l'ordre.
Avant eux, D1 (fondations) et D2 (direction artistique, dont le passage à l'encre des photos),
et les chantiers I1 et I2 de l'interface. Les nombres viennent du découpage ci-dessus ; les noms
entre parenthèses sont ceux des mécaniques et des effets de `livre.py`.

### D3. Ouverture, chapitres 1 et 2

- **Tableaux** : 21 (0.1 à 2.10), 1974 mots, 15 gestes
- **Plans nouveaux** : 12, dont 6 décors dessinés (monde de Darshan)
- **Photos de Karl** : 12 telles quelles, 6 passées à l'encre ; **repérages** : 11
- **Mécaniques** : caresser, glisser, maintenir, porter, remuer, rythme, toucher, tourner, tracer ; à écrire : **caresser, remuer**
- **Ambiances sonores** : cosmos, kerala, nuit, parc, restaurant, rue, silence, vent
- **À construire** : seuil : la dédicace qui paraît d'elle-même, « Ouvrir » actif dès l'arrivée ; poème : calque d'arbres fixe, poussière d'or, fil d'or (frontiere) et course des astres (course) ; toit : la voix lettre à lettre (voix) ; l'appel, la quinte à vide (son appel) ; pigeonnier : tourner (260 unités), la clé portée vers le haut, le jour et l'autre côté (jour, autre-cote) ; chaleur d'Aluva ; moustache de mousse (tracer) ; naissance du carnet ; clin d'œil d'encre (clin) ; reflets de Paris dans le fleuve (remuer, reflet) et fragment de la ballade sous l'eau (melodie) ; lumière qui vieillit, silence du tanpura, lin de la chemise (lin) ; cabane à kayaks dessinée, en or, et son jour ; salut de la vue (camera) ; bandes qui s'ouvrent par l'obturateur (bandes-photo) ; caresse lente, flou qui suit le geste (caresser, flou) ; le cœur sous le doigt : chamade, puis deux cœurs à trois contre deux (maintenir, balance, valse) ; photo qui devient peinture, sous un masque ; la voix lettre à lettre, à l'encre ; réveil au toucher de lecture : question assourdie, obturateur (assourdi, net) ; gros plan inséré, regard qui se baisse (decor avec camera) ; carnet du serveur, à une seule ligne (commande) ; marche lente, on passe à côté (camera avec avance, passe) ; première mesure de la ballade, compte, porte épaisse, envol (melodie, compte, decor) ; rêve à l'encre sur le ciel, que l'ombre d'un nuage fait pâlir (esquisse, nuage).

### D4. Chapitre 3

- **Tableaux** : 14 (3.1 à 3.14), 1370 mots, 8 gestes
- **Plans nouveaux** : 8, dont 8 décors dessinés (monde de Darshan)
- **Photos de Karl** : 2 telles quelles, 11 passées à l'encre ; **repérages** : 5
- **Mécaniques** : deux-pouces, glisser, respirer, semer, tendre, toucher ; à écrire : **deux-pouces, respirer, semer, tendre**
- **Ambiances sonores** : bibliothèque, cosmos, kerala, vision
- **À construire** : ciel de la légende : étoiles-portes, barque qui dérive, étoiles qui s'alignent en porte (barque, alignement) ; remontée des âges : les portes de Karl de plus en plus vite ; trou qui devient entrée (diaporama, entree) ; scène « plier » : le geste vif de 1.3 fond les lunettes en clé et plie le ciel ; Paris et le Periyar dans les verres (fonte, pli, lentilles) ; le regard naît (regard) ; aube et son chœur ; l'appel, la quinte à vide, sous « où es-tu ? » (aube, couche, son appel) ; poussière qui retombe (3.3), poussière qu'on souffle (3.6) (poussiere) ; calligraphie des deux vers au pinceau ; porte battante qui bat deux fois (battant) ; l'autre côté (jour) ; mudrā à deux pouces : le sceau (deux-pouces, sceau) ; scène « vision » : respiration, halo d'absence, bascule, lanterne tracée par les couleurs, ornements dessinés par la lumière, pierre qui se fond, accord du père ; la barre voilée ; main tendue qui s'arrête à un doigt du bois (tendre) ; étoile à part au carnet, en anneau ; le soir qui tombe sur le Periyar ; rose des vents à semer (semer) ; compte à rebours des quatre jours.

### D5. Chapitres 4 et 5

- **Tableaux** : 18 (4.1 à 5.11), 2007 mots, 11 gestes
- **Plans nouveaux** : 11, dont 1 décors dessinés (monde de Darshan)
- **Photos de Karl** : 23 telles quelles, 2 passées à l'encre ; **repérages** : 10
- **Mécaniques** : contact, curseur, essuyer, etals, galerie, maintenir, messages, respirer, rythme, toucher ; à écrire : **contact, curseur, essuyer, etals, galerie, messages**
- **Ambiances sonores** : chambre, hôpital, marché, métro, pâtisserie, rue
- **À construire** : barre de Julie (interface) : les boutons de Darshan s'effacent après les bandes de 4.1 et reviennent en 5.2 ; le sac de Julie naît avec le téléphone (notification) ; bandes aux couleurs de Julie (bandes-julie) ; téléphone de Julie : bulles sans texte, contact tendu qui revient avec son nom, sans numéro (messages, contact) ; réglette de la douleur, verticale, qui se retourne (curseur) ; questions de l'hôpital mises en vers (vers) ; pas à plateforme ; souffle guidé et sortie du tunnel (rythme, respirer) ; souvenir flou qui se met au point, et l'inverse ; compte à rebours dans la matière de Julie ; retour des boutons de Darshan en 5.2, avec un reflet d'or ; marché d'Aluva dessiné sous les palmes : cinq étals, un envol annoncé puis quatre courts, le bouton qui ploie (etals) ; rose des vents de 3.14 qui trouve son nord ; aiguille au carnet ; boussole et compte dans l'état des pages ; façade en mirage qui se dessine puis s'évapore ; trois confettis (vignette, confettis) ; galerie du téléphone qu'on feuillette ; clichés flous en attendant les repérages ; vidéo en largeur (galerie, cliche) ; la ballade entière, une fois, par le haut-parleur (melodie) ; un pied à 6/8 sans note ; deux cœurs de 2.9 qui s'accordent (maintenir) ; éclair doux ; un bourdon, puis une seule note ; vue qui avance ou qui monte dans une même photo (camera), sans flou ; fond du panneau de texte qui change avec le plan ; buée qui monte ; hublot qu'on frotte en petits cercles (essuyer) ; compte à rebours en mots du livre, avec son tic.

### D6. Chapitre 6

- **Tableaux** : 15 (6.1 à 6.15), 1510 mots, 13 gestes
- **Plans nouveaux** : 7, dont 0 décors dessinés (monde de Darshan)
- **Photos de Karl** : 17 telles quelles, 3 passées à l'encre ; **repérages** : 9
- **Mécaniques** : attendre, caresser, glisser, liste, main, maintenir, portes, toucher, tourner, verser ; à écrire : **liste, main, portes, verser**
- **Ambiances sonores** : appartement, parc, rue, silence
- **À construire** : écran partagé (partage) : les deux listes (scène « listes »), puis l'attente ; ruban de satin au vent, au rythme du cœur, puis immobile (ruban) ; encre qui saigne d'un point (saigne) : la porte de la demeure ; velours qui s'éclaire et fonce sous une caresse verticale (caresser) ; fumée qui monte seule ; aquarelle qui irrigue une toile (fumee, couleur) ; rideau et vertige à la fenêtre ; filet de thé versé de haut (verser) ; lumière qui refroidit, puis crépuscule (refroidir) ; deux cœurs sous la main, puis un seul, irrégulier (maintenir, coeur) ; attente de dix secondes que l'on peut presser, éclat brisé, portes ouvertes sur le papier (attendre, eclat-brise, portes-vides) ; portes nées sous le doigt, assez grandes pour leurs paysages, cicatrices d'encre (portes) ; fonte vue du dehors ; effacement de la photo (fonte, effacement) ; main qui se retire ; clé tournée comme au pigeonnier (main, tourner) ; embrasure du placard : cadre d'encre, photo, marche, fermeture (embrasure).

### D7. Chapitre 7 et clôture

- **Tableaux** : 17 (7.1 à 8.1), 1540 mots, 11 gestes
- **Plans nouveaux** : 9, dont 2 décors dessinés (monde de Darshan)
- **Photos de Karl** : 14 telles quelles, 5 passées à l'encre ; **repérages** : 8
- **Mécaniques** : ecrire, effacer, glisser, maintenir, paume, porter, rythme, toucher, tourner ; à écrire : **ecrire, effacer, paume**
- **Ambiances sonores** : désert, hôpital, kerala, pluie, rue, silence, vent
- **À construire** : paupières qui se ferment ; étoiles en larmes ; morsure du soleil (maintenir, filantes, morsure) ; télévision sur la couette ; glaçon qui devient banquise, puis dunes (tele, goutte, sable) ; pluie qui peint les fleurs à l'aquarelle ; écran partagé à deux ambiances (pluie, partage, ambiance) ; deux coups à la porte, puis la pause (toucher, pause) ; étincelles jusqu'aux étoiles ; le départ, tout près puis au loin (etincelles) ; lettre écrite en appuyant, encre ineffaçable ; le carnet qui vacille (ecrire, effacer, vacille) ; trois bonds, éclat court dans la serrure, le jour de la fente, la lettre qui jaillit (enjambees, tourner, porter, transfert) ; course au rythme du lecteur, première mesure de la ballade ; ruban (rythme, ruban) ; baiser, un seul cœur ; la ballade entière ; tout ralentit ; la barre voilée (maintenir, melodie, ralenti) ; éclipse de Galice, une étoile du jour, chiasme en vermillon (eblouir, frontiere, etoiles-jour, chiasme) ; scène « rue-de-rungis » : porte qui perce la rue, lanterne et ornements, gel, paume sans clé, désenchantement, chute muette, dégel (perce, gel, paume, desenchantement, chute, degel) ; texte nu et pause ; fil d'encre de la clôture ; page « Fin » et « Nouvelle lecture » (scène « cloture »).

## Repérages : les photos à prendre

Karl les prend à sa manière, regroupés par sortie (détail et images d'attente : partie 9 de la
[synthèse](darshan-mise-en-scene/synthese.md)) : en hauteur, sans visage reconnaissable, ou avec
l'accord écrit du modèle, sans nom d'établissement lisible, le bas du cadre laissé libre pour le texte.

### S1. À la maison, en fin de jour

- 2.1 : La main de Julie posée sur une table pour deux, lumière chaude, l'assiette de Darshan floue au premier plan, son verre et son téléphone derrière
- 2.6 : Un tartare de saumon aux herbes fraîches, à peine entamé
- 2.7 : Pain perdu de brioche, portion menue, sur porcelaine à motif fleuri, fond jaune tournesol
- 3.7 : Vieux livre ouvert sur des pages vierges et jaunies, vu d'au-dessus, lumière de lampe
- 3.10 : Lanterne de bois ajourée de cercles, allumée dans le noir, et ses cercles de lumière sur un mur
- 5.6 : Croque-monsieur coupé en deux, deux mains, une manche d'hiver et une manche de toile moutarde ; sans visage
- 5.6 : Billes acidulées de toutes les couleurs, sucrées, dans une paume ouverte
- 6.5 : Rabat de velours bleu nuit en lumière rasante, cadre en hauteur
- 6.8 : Chai versé de haut dans une tasse de cuivre tenue par sa soucoupe, la main seule ; la tasse au milieu de la hauteur, la théière en haut
- 6.10 : La main de Julie posée sur une table de bois, près d'une assiette ; puis la main qui se retire ; puis la table sans elle (la même séance que la main de 2.1)
- 6.13 : Clé de laiton un peu oxydée dans la serrure d'une armoire entrouverte sur des serviettes (facultatif)
- 7.7 : La lettre, de la main de Karl : les cinq lignes de la déclaration, à la plume, encre noire ou bleu nuit, sur un papier crème ; numérisée à plat ou photographiée en lumière égale
- 7.8 : Porte de planches la nuit, lumière allumée derrière : la fente du bas éclairée (modèle du local)

### S2. Paris 13e et 14e, un soir d'été

- 2.8 : La maison de Julie, petite, beige, couverte de lierre, près du parc Montsouris
- 2.8 : Le pont de rocaille de Montsouris et sa barrière de branches nouées, si l'arche n'y a pas été prise
- 2.9 : La porte de la maison de Julie, cadrée en hauteur, fin d'après-midi
- 6.15 : La même porte qu'en 2.9, au crépuscule
- 6.15 : Le paquet au ruban rouge tenu à la main devant cette porte, au crépuscule
- 7.9 : La rue de Rungis (Paris 13e) dans l'axe du couchant, fin juin : façades de pierre de taille et balcons filants, trottoir de dalles au premier plan, une voiture de couleur neutre garée à droite, plaque hors champ (sert de 7.9 à 7.15)
- 7.10 : La main d'un homme, un genou au sol, qui tend le paquet au ruban rouge contre le soleil couchant
- 7.11 : En plongée depuis un genou à terre : les dalles et, en haut du cadre, deux souliers de femme et l'ourlet d'une robe orange ; rien au-dessus du genou (avec un modèle)
- 7.15 : Les passants filés, sur le même trottoir, en pose lente (un quart de seconde)

### S3. À l'hôpital

- 4.2 : Couloir d'hôpital ancien, une lampe suspendue près d'une porte, une blouse à une patère, sans patient ni visage (servirait aussi en 7.4, 7.5 et 7.8)
- 7.4 : Brancards dans un couloir d'hôpital, sans patient (facultatif)

### S4. La campagne, en Poitou et en Vendée

- 3.2 : Mur de torchis (terre et paille) percé d'un trou, en hauteur ; deux vues au même cadre : le trou noir, puis la lumière qui passe
- 3.12 : Mains âgées qui coupent des légumes sur une planche, au bord de l'eau, lumière du soir, sans visage
- 7.2 : Coccinelle dans la mousse, sous des pétales fanés (macro, en hauteur ; facultatif)

### S5. À la pâtisserie, un soir

- 5.10 : Vitrine de pâtisserie, le soir, en hauteur : éclairs au chocolat et au café, baba au rhum ; sur pied
- 5.11 : Charlotte aux framboises (cercle de framboises, boudoirs, trois feuilles de sucre perlées), derrière une vitre embuée : même cadre, sur pied, en hauteur, vitre embuée, puis un rond essuyé au milieu, puis vitre nette
- 6.1 : Paquet de pâtisserie noué d'un ruban de satin rouge, tenu à la main dans le vent, sans visage

### S6. Un restaurant du sud de l'Inde

- 3.8 : Porte battante de service à hublot, sans écriteau lisible ; fermée, puis en plein battement
- 6.10 : Dosa sur une assiette à motifs, deux fourchettes, fin de jour

### S7. Paris, l'après-midi

- 2.2 : Vitrine de friperie, mannequin en robe volantée et guêtres (la même qu'en 4.6 et 4.7)
- 4.4 : Chaussures à plateforme sur le trottoir, vues d'en haut, en marchant (le regard de Julie)
- 4.7 : La vitrine de face, et dans la glace le reflet flou d'un homme qui s'approche (la vitrine de 2.2, vue b) : on y tendra le téléphone
- 5.7 : Lunettes : les lunettes fumées de 1.2, les binocles ronds de 6.4 et une paire en écaille, chacune posée à un lieu de leurs sorties (table de café, banc, parapet) ; sans personne
- 5.7 : Chevalet sur un quai de Seine : toile commencée, boîte de petits tubes ouverte sur le parapet ; sans visage
- 6.7 : Une rue haussmannienne vue d'une fenêtre de premier ou de deuxième étage, garde-corps de fer forgé au premier plan, façades d'en face, lumière d'après-midi, cadre en hauteur

### S8. La Seine, la nuit

- 1.7 : Bateaux-mouches sur la Seine, de nuit (« l’éclat des navires parcourant la Seine »)

### S9. La côte atlantique

- 1.5 : Un tabouret de bois rafistolé sur un ponton, un filet où brillent trois maquereaux ; lumière du matin, cadre en hauteur
- 1.8 : Le même tabouret rafistolé, vide, sur le ponton, dans la lumière d'or de fin d'après-midi
- 1.9 : Un carrelet de Charente-Maritime (cabane de pêche sur pilotis et son grand filet carré) au soleil couchant ; cadre en hauteur

### S10. L'hiver

- 5.6 : Patinoire : une lame qui fend la glace en virage, au ras de la glace, copeaux, lumières d'hiver floues au fond ; sans visage

## Index des photographies de Karl

| Photo | Tableaux | Usages |
|---|---|---|
| [6858270](https://photos.karlforterre.fr/photo/6858270/) « Sandwich baguette jambon-fromage sur une assiette en céramique grise » | 5.6 | photo |
| [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » | 2.8, 2.9, 6.14, 6.15 | photo |
| [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » | 3.9, 3.10, 3.12, 3.13, 3.14 | encre |
| [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » | 1.6, 1.7, 1.8, 7.4 | encre |
| [10355467](https://photos.karlforterre.fr/photo/10355467/) « Piéton traversant un carrefour devant un immeuble moderne arrondi » | 4.4, 7.9 | photo |
| [10369144](https://photos.karlforterre.fr/photo/10369144/) « Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise » | 5.10, 5.11 | photo |
| [10524140](https://photos.karlforterre.fr/photo/10524140/) « Arche de rocaille au-dessus d'une allée dans un jardin romantique » | 2.8 | photo |
| [10644439](https://photos.karlforterre.fr/photo/10644439/) « Maquette de voilier prise dans la banquise sous une lumière bleue » | 6.12, 7.3 | photo |
| [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » | 4.7, 5.1, 5.8, 5.9, 7.2 | photo |
| [11876963](https://photos.karlforterre.fr/photo/11876963/) « Sur les quais du Covid » | 4.1 | photo |
| [11968793](https://photos.karlforterre.fr/photo/11968793/) « Tapis de rêves » | 7.2 | photo |
| [12073837](https://photos.karlforterre.fr/photo/12073837/) « Ciel et pavés » | 1.7 | photo |
| [12441049](https://photos.karlforterre.fr/photo/12441049/) « Kawa » | 4.3 | photo |
| [12443176](https://photos.karlforterre.fr/photo/12443176/) « Toits pictaves » | 6.5, 6.7 | photo |
| [13020351](https://photos.karlforterre.fr/photo/13020351/) « Clé des champs » | 6.12 | photo |
| [13234891](https://photos.karlforterre.fr/photo/13234891/) « Sortie » | 4.5 | photo |
| [16592454](https://photos.karlforterre.fr/photo/16592454/) « Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit » | 1.7, 5.10 | photo |
| [18890798](https://photos.karlforterre.fr/photo/18890798/) « Cathédrale au matin » | 3.5 | encre |
| [19059625](https://photos.karlforterre.fr/photo/19059625/) « Fracture » | 7.12 | modèle |
| [20315376](https://photos.karlforterre.fr/photo/20315376/) « L’heure d’hier » | 1.9 | encre |
| [22591346](https://photos.karlforterre.fr/photo/22591346/) « Salamandre » | 7.6 | encre |
| [24200555](https://photos.karlforterre.fr/photo/24200555/) « Ciel étoilé » | 1.1 | modèle |
| [26775590](https://photos.karlforterre.fr/photo/26775590/) « Coucher de soleil orange flamboyant au bout d'une rue » | 7.9, 7.10, 7.11, 7.12, 7.13, 7.14, 7.15 | photo |
| [27025911](https://photos.karlforterre.fr/photo/27025911/) « Le portail » | 3.2 | encre |
| [27046110](https://photos.karlforterre.fr/photo/27046110/) « Trèfle » | 3.2 | encre |
| [27046156](https://photos.karlforterre.fr/photo/27046156/) « Porte forgée » | 1.3 | modèle |
| [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » | 0.1, 0.2, 1.1, 1.2, 6.11, 7.1 | encre, photo |
| [29136749](https://photos.karlforterre.fr/photo/29136749/) « Tapis » | 5.2 | modèle |
| [29188525](https://photos.karlforterre.fr/photo/29188525/) « Tarte aux pommes » | 5.11 | photo |
| [29360492](https://photos.karlforterre.fr/photo/29360492/) « Bonbon vosgien » | 5.6 | photo |
| [29630257](https://photos.karlforterre.fr/photo/29630257/) « Nuit de décembre » | 5.6 | photo |
| [31514847](https://photos.karlforterre.fr/photo/31514847/) « Amour » | 2.8 | photo |
| [31641251](https://photos.karlforterre.fr/photo/31641251/) « Fantômes » | 4.5, 7.15 | photo |
| [32429189](https://photos.karlforterre.fr/photo/32429189/) « Couloir vers l'impasse » | 6.13, 6.14 | photo |
| [32429190](https://photos.karlforterre.fr/photo/32429190/) « Une porte » | 3.2 | encre |
| [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » | 3.2, 6.3, 6.4 | encre, photo |
| [33035627](https://photos.karlforterre.fr/photo/33035627/) « Métro » | 4.1 | photo |
| [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » | 5.5, 6.2, 6.3 | encre, photo |
| [33035632](https://photos.karlforterre.fr/photo/33035632/) « Tour Eiffel encadrée d'arbres verts à Paris » | 1.7 | photo |
| [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » | 2.2, 2.3, 4.6, 4.7, 6.1, 6.2 | encre, photo |
| [33035652](https://photos.karlforterre.fr/photo/33035652/) « RER » | 4.3 | photo |
| [34342144](https://photos.karlforterre.fr/photo/34342144/) « Jardin tropical » | 1.5, 5.2 | encre |
| [34342149](https://photos.karlforterre.fr/photo/34342149/) « Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc » | 6.8, 6.9 | photo |
| [34500347](https://photos.karlforterre.fr/photo/34500347/) « Fond de tuiles » | 1.2 | photo |
| [34500385](https://photos.karlforterre.fr/photo/34500385/) « Repos » | 7.9 | photo |
| [34532663](https://photos.karlforterre.fr/photo/34532663/) « Table heureuse » | 2.1, 2.4, 2.5, 2.6, 2.7 | photo |
| [34762346](https://photos.karlforterre.fr/photo/34762346/) « Porte en bois rustique et sa lanterne, charme d'autrefois » | 3.2 | encre |
| [34849711](https://photos.karlforterre.fr/photo/34849711/) « Vitrail en flou doux aux arcs de cercle encadrés de bandes rouges » | 3.10 | modèle |
| [34876053](https://photos.karlforterre.fr/photo/34876053/) « Silhouettes floues et abstraites de deux personnages dans une lumière chaude tamisée » | 5.7 | photo |
| [34956319](https://photos.karlforterre.fr/photo/34956319/) « Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages » | 1.5, 1.6, 1.9 | encre |
| [35024039](https://photos.karlforterre.fr/photo/35024039/) « Rochers empilés formant un monument naturel sous un ciel bleu et nuageux » | 6.12, 7.1 | modèle, photo |
| [35086239](https://photos.karlforterre.fr/photo/35086239/) « Champ de fleurs sauvages blanches et jaunes en pleine floraison » | 7.4 | encre |
| [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » | 1.4, 1.9, 7.8 | modèle |
| [35104311](https://photos.karlforterre.fr/photo/35104311/) « Gros plan d'une tête de chameau au licol de cuir près d'une couverture tissée colorée » | 5.2 | modèle |
| [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » | 4.2, 7.4, 7.5, 7.8 | photo |
| [35760712](https://photos.karlforterre.fr/photo/35760712/) « Verre de café glacé avec un gros glaçon à côté d'une carafe en verre » | 7.3 | photo |
| [36652487](https://photos.karlforterre.fr/photo/36652487/) « Homme traversant une passerelle verte sous des saules pleureurs ensoleillés » | 7.6 | modèle |
| [37296469](https://photos.karlforterre.fr/photo/37296469/) « Thé versé d'un gaiwan céladon dans une tasse en porcelaine blanche » | 6.8 | photo |
| [38256669](https://photos.karlforterre.fr/photo/38256669/) « Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait » | 4.3, 5.6 | photo |
| [38279684](https://photos.karlforterre.fr/photo/38279684/) « Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé » | 1.7, 5.7 | photo |
| [38570569](https://photos.karlforterre.fr/photo/38570569/) « Détail d'une patère en bois sur un portemanteau chromé, ciré jaune en arrière-plan flou » | 6.5 | photo |
| [38570570](https://photos.karlforterre.fr/photo/38570570/) « Pleine lune se levant derrière des cheminées, ciel nocturne violet » | 1.1, 5.7, 5.8 | modèle, photo |
| [38570603](https://photos.karlforterre.fr/photo/38570603/) « Graffiti « je t'aime » peint en violet sur une surface orangée et rouillée » | 6.11 | photo |
| [38674516](https://photos.karlforterre.fr/photo/38674516/) « Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical » | 5.9, 7.15 | photo |
| [38674517](https://photos.karlforterre.fr/photo/38674517/) « Silhouettes de toits et d'antennes télé sur un ciel pastel au crépuscule » | 2.9, 2.10, 5.1 | photo |
| [38694025](https://photos.karlforterre.fr/photo/38694025/) « Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry » | 6.10, 6.11, 6.12, 6.13 | photo |
| [38712879](https://photos.karlforterre.fr/photo/38712879/) « Pile de livres et tasse en inox sur une étagère en bois » | 3.6 | encre |
| [38993391](https://photos.karlforterre.fr/photo/38993391/) « Début d'une éclipse solaire partielle dans le ciel de Galice, en Espagne » | 7.11 | photo |
| [38993497](https://photos.karlforterre.fr/photo/38993497/) « Le croissant s'affine pendant l'éclipse solaire en Galice » | 7.11 | photo |
| [38993636](https://photos.karlforterre.fr/photo/38993636/) « Fin croissant de l'éclipse solaire sur un ciel qui s'assombrit » | 7.11 | photo |
| [38995522](https://photos.karlforterre.fr/photo/38995522/) « L'éclipse solaire totale révèle la couronne solaire au-dessus de la Galice » | 7.11 | photo |
| [39208821](https://photos.karlforterre.fr/photo/39208821/) « Chemin forestier en pierre sur le chemin de Saint-Jacques-de-Compostelle, près de Pau » | 3.3 | encre |
| [39212543](https://photos.karlforterre.fr/photo/39212543/) « Le pic du Midi d'Ossau domine des contreforts brumeux » | 6.12 | photo |
| [39228274](https://photos.karlforterre.fr/photo/39228274/) « Village paisible niché dans les collines verdoyantes de Bourgogne-Franche-Comté » | 4.5, 6.12 | photo |
| [39434688](https://photos.karlforterre.fr/photo/39434688/) « Gros plan sur une porte ancienne patinée, rivets et peinture écaillée » | 1.3 | modèle |
| [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » | 3.10, 3.11, 7.12, 7.13, 7.14, 7.15 | encre |
| [39564914](https://photos.karlforterre.fr/photo/39564914/) « Gorge marine encadrée de falaises érodées à l'horizon, près de Ribadeo » | 6.12 | photo |
| [39575545](https://photos.karlforterre.fr/photo/39575545/) « Photo de nuit abstraite et minimaliste, une seule lumière orange » | 3.10 | photo |
| [39595391](https://photos.karlforterre.fr/photo/39595391/) « Voie lactée et ciel étoilé à couper le souffle, en Galice » | 3.1, 3.4 | photo |
| [39670619](https://photos.karlforterre.fr/photo/39670619/) « Intérieur moderne d'une bibliothèque aux étagères en verre, à Gijón » | 3.6, 3.7, 3.8 | encre |

Chaque photo est de Karl Forterre, publiée sur Pexels sous une licence qui en permet l'usage
commercial ; les originaux ne sont pas copiés dans ce dépôt : `images.py` télécharge au besoin
le fichier public et en tire le décor (voir `outils/darshan/README.md`).
