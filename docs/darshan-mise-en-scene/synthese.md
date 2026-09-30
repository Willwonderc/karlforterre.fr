# Darshan jouable : la synthèse

Le monteur de l'équipe créative, le 30 septembre 2026. Sept équipes ont traité les 85 tableaux,
chaque traitement a été relu puis révisé ; ce document en fait **un seul livre** : il relève ce
que les chapitres partagent, compare, propose une solution à chaque écart, et rassemble tout ce
qu'il faut pour fabriquer. Il ne réécrit aucun chapitre : quand un chapitre garde une phrase
dépassée, la solution est dite ici, et c'est elle qui passe à la fabrication.

Sources : la direction ([README.md](README.md), avec ses arbitrages et les décisions de Karl du
29 et du 30 septembre), les sept traitements révisés ([chapitre-1.md](chapitre-1.md) à
[chapitre-7.md](chapitre-7.md), chacun avec sa section *Révision après relecture*), les
[relectures](relectures/), et la fabrication telle qu'elle est ce matin (`outils/darshan/` :
`livre.py`, `decoupage.py`, `build.py`, `interface.ini`, `objets.ini`, `decors.py`, `art.py`,
`src/js/`, `README.md`).

Le texte du livre n'est touché nulle part. Les seuls mots nouveaux sont des textes d'interface
(partie 6), à valider par Karl.

**Ce qui a été vérifié par programme** (dans le dossier de travail de la synthèse, sans rien
écrire dans le dépôt) :
- les 85 entrées `TABLEAUX` des sept chapitres, mises bout à bout, passent `decoupage.verifier()` :
  tout le texte, une fois, dans l'ordre ; de 40 à 160 mots par tableau ; chaque phrase citée par un
  geste ou un moment est mot pour mot dans son tableau ; photos titrées ; transitions et ambiances
  connues ;
- avec les entrées `SCENES` et les décors des sept chapitres, et les textes d'interface de la
  partie 6, `build.py` construit en mémoire les 85 pages : 446 temps, 58 gestes, le texte recollé au
  caractère près, une consigne pour chaque geste et aucune de trop, les sacs et les portes cohérents
  page après page (partie 3) ;
- les 129 citations du livre faites ici sont mot pour mot dans le livre (les 106 autres citations
  entre guillemets français sont des textes d'interface) ; les 95 numéros de photo cités sont dans
  `vitrine/photos.txt` ; les 131 noms du cahier des charges (partie 3) couvrent les 27 mécaniques et
  les 106 noms d'effets relevés par programme dans les fiches des sept chapitres ; les 61 phrases
  d'`objets.ini` et les 31 proposées pour `objets.ini` et `portes.ini` sont chacune une seule fois dans
  le livre ; chaque texte d'interface a huit mots au plus.

**Guillemets.** Les phrases du livre sont entre guillemets français, vérifiées mot pour mot ; les
textes d'interface aussi, toujours désignés comme tels (consigne, bouton, clé d'`interface.ini`) ;
les autres citations (les chapitres, la direction, le découpage) sont entre guillemets anglais
(“ ”) ; les titres des photos de Karl, en italique.

**Pour qui.** Karl lira d'abord la partie 1 (le livre en une page), la partie 9 (les photos qu'il
pourrait prendre), la partie 10 (ses questions, chacune avec la proposition de l'équipe) et la
partie 11 (les coquilles). Les parties 2 à 8 et 12 sont pour la direction et la fabrication.

**Qui décide.** Dans ce document, *direction* veut dire : la direction de création peut trancher
seule, parce que le point touche à la mise en scène et non au texte ; *Karl* : le point touche à
son texte, à ses photos, à sa personne, ou change ce qu'il a déjà vu et aimé.

## 1. Le livre en une page

**L'arc du lecteur, en sept temps.** Au seuil, il ouvre lui-même la première porte (« Ouvrir »),
après un mot d'amour vrai, lu en silence. Sur un toit du seizième, il entend un fils appeler son
père dans le vide : la question du livre, sans réponse. Puis il reçoit la magie de Darshan geste
après geste (**chapitre 1**) : les lunettes en dansant sur les tuiles, la clé au pigeonnier (ôter,
geste vif, porter, tourner, pousser), le carnet des portes à Aluva, la montre au départ. Au
**chapitre 2**, ses pouvoirs se reposent : il vit un premier rendez-vous avec les mains d'un mortel
amoureux (caresser, laisser battre la chamade, baisser les yeux, marcher avec elle, joue contre
joue) dans le monde photographié de Julie. Au **chapitre 3**, il comprend : le geste vif plie
l'espace, les lunettes lui donnent le regard, et la vision inscrit au carnet une étoile à part, la
porte du père, qu'il ne peut pas toucher. Au **chapitre 4**, il perd ses pouvoirs le temps des pages
où Julie dit « je » : un téléphone, une réglette de douleur, un trajet, une solitude. Au
**chapitre 5**, il les retrouve et s'en sert pour tout acheter ; Julie choisit d'aimer ; la boussole
du carnet trouve son nord. Au **chapitre 6**, la magie échoue entre ses mains : attendre ne fait rien
venir, le geste vif brise l'éclat, les portes s'ouvrent sur le papier nu puis sur des paysages sans
lien, la main se retire, et la seule clé qui obéisse renvoie Julie chez elle. Au **chapitre 7**, il
écrit la lettre et ne peut pas l'effacer, tourne la dernière clé, court, tient le baiser d'un seul
cœur, voit leur étreinte éclipser le soleil, pose la paume sur la porte du père sans la pousser, et
perd tout avec Darshan, à la virgule de « En faisant de moi un mortel, » : la clé tombe en poussière
d'or, les étoiles du carnet s'éteignent, les boutons disparaissent, sans un bruit. Un choc sourd,
puis le silence ; les dernières pages se lisent sur du papier, et « Nouvelle lecture » rallume tout.

**Les motifs, d'un bout à l'autre.** La **porte** : sept étoiles au carnet (le pigeonnier, la cabane
à kayaks, les toilettes du personnel à Pékin, la demeure, le placard, la pharmacie, et l'étoile à
part du père, un anneau depuis 3.11, allumé en 7.12, éteint le dernier en 7.14). Les **lunettes et
la clé** : la fonte dorée vue du dedans (1.3), l'éclat court (1.9, 7.8), la fonte noire vue du dehors
(6.12), l'éclat brisé (6.11), la poussière d'or (7.14). Les **étoiles** : la voûte qui tourne (0.2,
1.1), le même ciel devenu velours noir (7.1), une seule étoile dans l'éclipse (7.11). La **lumière
du père** : la lanterne de la vision (3.10) et celle de la rue de Rungis (7.12), la même porte
d'Irun. L'**encre** : le monde de Darshan ; Paris dans le fleuve (1.7), Julie peinte (2.3), l'encre
qui saigne sur la porte bleue (6.4), les portes d'encre (6.11, 6.12), la lettre, seul objet d'encre
qui passe chez Julie (7.8), l'encre qui se retire (7.15), un fil d'encre au bas de la page blanche
(8.1). Le **rouge vermillon**, rare : le chouchou de *Dos* (2.2), le cercle de framboises (5.11), le
ruban qui bat comme son cœur (6.1), pend (6.15), s'affole (7.10), et le chiasme dans l'éclipse
(7.11). Le **cœur** : la chamade (2.2), deux cœurs qui ne battent pas ensemble (2.9), celui de Julie
(4.6), leur accord (5.9, 6.10), celui de Julie seul (6.11), un seul pour deux au baiser (7.10), puis
le silence.

**Les couleurs.** Le bleu royal des toits ; le blanc et l'or d'Aluva, qui vieillit en or de fin
d'après-midi ; le rose et le magenta de la table, le vert de Montsouris, le lilas des toits au soir ;
l'or sur la nuit de la légende, le noir d'où vient la couleur ; le noir et blanc et les néons froids
de Julie, le rose faux d'une photo infrarouge, le noir d'un tunnel, le vrai vert ; les pastels, le
sucre, la lune ; le blé, le velours, le cuivre, puis le froid et le crépuscule bleu, un seul rouge ;
le velours noir du désert, les fleurs à l'aquarelle, le soir d'été orange, l'éclipse, le monde figé en
noir et blanc, les couleurs revenues sans encre, la lune ; le papier.

**Le son.** Le vent des toits, et sous « Papa, où es-tu ? » la quinte à vide de l'appel ; Aluva
(le fleuve, le tanpura), entendue d'abord par les jours de la porte du pigeonnier ; la ville de Julie
(le restaurant, la rue, le parc) et le déclic de l'obturateur ; le cosmos, la bibliothèque, le
silence d'un espace sans air où l'accord du père sonne pour la première fois (3.10) ; le métro,
l'hôpital et ses bips mis en mesure ; le marché, la chambre, et la ballade entière dans le haut-parleur
du téléphone (5.7) ; l'appartement, son horloge, les cœurs, la quinte deux fois et le silence
(6.11) ; le désert, la pluie ; la première mesure de la ballade dans les pas de Julie (7.9), la
ballade entière au baiser (7.10), la ville qui se tait (7.11), l'accord (7.12) qui s'éteint quand
Darshan recule (7.13), le silence de la prière (7.14), un choc sourd (7.15), puis rien.

**Les quatre idées qui font sa force.**
1. **Les pouvoirs du lecteur sont la magie de Darshan.** Reçus en cinq gestes au pigeonnier,
   retournés contre lui au chapitre 6, rendus à la virgule de 7.14. Ce n'est pas une punition : la
   vie ordinaire, qui pesait au chapitre 4 parce qu'elle était seule, est belle à la fin parce
   qu'elle est partagée.
2. **Deux mondes, deux matières.** L'encre et l'aquarelle pour Darshan, les photos de Karl telles
   qu'il les a faites pour Julie ; chaque passage de l'un à l'autre est un événement, et à la fin
   l'encre se retire du monde.
3. **Les gestes riment et changent de sens.** Le même geste vif (1.3, 3.4, 6.11), le même tour de
   clé (1.3, 6.13, 7.8), la danse devenue course (1.2, 7.9), la chamade devenue baiser (2.2, 2.9,
   5.9, 7.10), la marche à deux devenue marche seule (2.8, 6.15), la main tendue qui s'arrête à un
   doigt du bois puis la paume qui le touche (3.11, 7.13) : le lecteur reconnaît son propre geste,
   changé par l'histoire.
4. **Le père ne répond jamais ; l'amour a sa ballade.** Une quinte à vide (1.1, 3.5, 6.11), un
   accord qui n'appartient qu'à sa porte (3.10, 3.11, 7.12, 7.13), un seul signe, le choc (7.15) ; la
   ballade, elle, naît par fragments (1.7, 2.9), chante entière une fois dans le téléphone (5.7),
   passe dans les pas de Julie (7.9) et revient entière au baiser (7.10).

## 2. Cohérence entre chapitres

### 2.1 Les arbitrages et les décisions de Karl, chapitre par chapitre

| Règle | Appliquée dans les sept traitements ? | Restes, et solution |
|---|---|---|
| **Arbitrage 1** : le père ne répond jamais ; son accord n'existe qu'avec sa porte ; avant 3.10, seulement la quinte à vide | Oui : 1.1 (quinte), 1.3 (les jours font entendre Aluva), 3.5 (quinte), 3.10-3.11 (accord), 5.3-5.4 (aucune lumière d'or), 6.11 (quinte deux fois, puis rien), 7.12-7.13 (accord, éteint quand Darshan recule), 7.15 (le choc, seul signe) | (a) `son.js` a encore l'effet `jour` du prototype, qui **est** l'accord de la majeur : à scinder en `autre-cote` (le jour d'une porte) et `pere` (l'accord), partie 5. (b) Les notes qui montent sur les tuiles (1.2 : la, si, do dièse, mi, fa dièse) font entendre le do dièse, la tierce que le chapitre 3 réserve à l'accord : prendre la, si, ré, mi, fa dièse (pentatonique sans tierce), partie 2.2, ligne 7. (c) Le nom de capture `toit-voix-du-pere` dans `outils/darshan/essai.js` (le moteur et `texte.py` n'ont plus la formule). (d) Le chapitre 7 écrit que 39595391 “reste le ciel de 3.1 et de 6.11” : 6.11 prend désormais le ciel de 1.1 (27116682). |
| **Arbitrage 2** : la ballade par fragments (1.7, 2.9), entière en 5.7, sa première mesure par les pas (7.9), entière au baiser (7.10), nulle part ailleurs ; un seul nom, `melodie` | Oui dans les sept : 1.7 (quatre notes sous l'eau), 2.9 (la première mesure, étouffée), 5.7 (entière, par le téléphone), 5.8 et 5.9 (aucune note : un pied, un bourdon, une seule note claire), 6 (aucune), 7.9 et 7.10 | (a) Les réglages de `melodie` diffèrent d'un chapitre à l'autre ; `son.js` a désormais ses modes (`fragment`, `mesure`, `entiere`) : un seul jeu de réglages, partie 2.2, ligne 4. (b) Le chapitre 4 écrit encore “une pulsation” en 7.9 (rimes de 4.4, et section 9) : 7.9 n'a pas de pulsation. (c) Le tableau *Ce que le chapitre fonde* du chapitre 1 oublie 7.9. |
| **Arbitrage 3** : les clés se tournent du même geste, `tourner`, rayon d'au moins 250 | Oui : 1.3, 6.13, 7.8 ; rayon 260 ; même consigne, même action de fiche, même cran | La serrure est en (932, 1010) en 1.3 et 7.8, en (932, 680) en 6.13 (l'armoire est remontée au-dessus du panneau) : à garder, partie 2.2, ligne 13. |
| **Arbitrage 4** : la place du texte suit l'image | Oui, page par page dans les sept ; Aluva en `haut clair` (1.4-1.9, 3.9, 3.12-3.14, 5.2-5.5) ; l'appartement en bas, seul le fond change | Deux noms pour le même réglage : `decor` avec `texte` (2.4) et avec `fond` (chapitres 5 à 7) ; prendre `fond`. Styles à ajouter à `build.CLASSES_TEXTE` : `haut clair`, `bas ciel`, `haut papier`. |
| **Arbitrage 5** : ni long glissement horizontal, ni tracé de plus de 250 unités | Oui : caresses dans un cercle de 120, moustache de 220, remous en petits cercles, hublot de 240, effacer et marcher à la verticale, écrire en appuyant, fumée sans tracé | Reste l'essai dans Apple Books (question 1 de la partie 10), qui décidera si la clé peut de nouveau se porter en diagonale (1.3). |
| **Arbitrage 6** : l'étoile naît quand le passage s'achève à l'image | Oui : pigeonnier au début de 1.4, cabane quand la lumière a gagné la vue (1.9), Pékin au début de 3.9, père en anneau (3.11, vue sans franchissement), demeure au début de 6.5, placard à la fin du geste de 6.15, pharmacie quand la lettre a jailli (7.8) | Aucun. |
| **Arbitrage 7** : l'image ne contredit pas le texte | Oui ; les images d'attente restent floues tant que la photo de Karl manque (2.7, 5.6, 5.10, 5.11, 6.7, 6.8, 6.10), le glaçon garde la boisson floue (7.3) | Exceptions posées à Karl (partie 10) : le tartare de bœuf (2.1 à 2.7), l'arche et *Amour*, prises ailleurs qu'à Montsouris (2.8), la maison de lierre (2.8, 2.9), la rue au couchant, qui n'est pas la rue de Rungis (7.9 à 7.15). |
| **Arbitrage 8** : deux paquets, même nom, même ruban ; un seul reste à Julie | Oui : `paquet` reste dans le sac de Julie à la fin de 6.15 ; `paquet-darshan` entre sans annonce en 7.9, quitte le sac de Darshan sans annonce en 7.11 ; vérifié par programme | `objets.ini` : créer `[paquet-darshan]` et lui donner les trois phrases de 7.9 et 7.10 (partie 7). |
| **Karl, 29 septembre** : « aime » en 6.11 ; « nouvelle » ; pas d'ISBN ; *Dos*, *Fantômes*, *Repos* acceptées ; 38536478 exclue ; Pékin à Gijón | Oui partout (6.11 ; 0.1 ; `classique.py` ; 2.2, 2.3, 4.6, 4.7, 6.1, 6.2 ; 4.5, 7.15 ; 7.9 ; 5.7 ; 3.6 à 3.8) | Aucun. |
| **Karl, 30 septembre** : la couverture de 2023 (photographie d'Arianna Jadé) pour les deux éditions | Décidée après les traitements | (a) La ligne de générique « Texte et photographies : Karl Forterre » (page « Fin », chapitre 7) laisserait croire que la couverture est de Karl : ajouter un crédit, « Couverture : photographie d’Arianna Jadé » (partie 6, à valider). (b) La direction écrit que la couverture est la seule image où l'on voit le visage de Darshan “avec les photos du téléphone de Julie (chapitre 5)” : la galerie de 5.6 et 5.7 ne montre aucun visage (“Aucun visage : des objets, des lieux, des détails”), la phrase de la direction est à corriger. (c) La couverture habille Darshan d'un gilet jaune sans manches : elle confirme le jaune du gilet (5.6) et de sa silhouette sur la toile du couple (6.6). (d) Elle montre aussi une porte sculptée sous une lanterne suspendue : la porte du père du livre jouable est la porte d'Irun, avec une lanterne de bois dessinée d'après le texte (3.10) ; la synthèse garde ce choix, la couverture restant l'illustration de l'édition de 2023. |

### 2.2 Les points communs

| # | Point | Ce qu'en disent les chapitres | Écart | Solution proposée | Décide |
|---|---|---|---|---|---|
| 1 | **La barre de Julie** | Ch. 4 : dans les pages où Julie dit « je » (4.1 à 5.1), les boutons de Darshan sont absents ; ils s'effacent après les bandes de 4.1 (`interface`, `sans="darshan"`), et restent partout ailleurs jusqu'à 7.14. Ch. 5 : ils reviennent à l'entrée de 5.2, avec un reflet d'or. Ch. 6 : “La barre est celle de Julie” retiré de 6.1. Ch. 2 : le voile de 2.3 est le même effet `interface`. | Réglé par les révisions. | La règle de la première personne, pas du monde : absents de 4.1 à 5.1, et nulle part ailleurs. L'état `barre` est calculé page après page (partie 3.3). | Fait (direction) |
| 2 | **Le voile des temps forts** | Ch. 2 : la barre voilée (35 %) de 2.3 au réveil de 2.4 (écrit dans la fiche). Ch. 3 : “la barre de boutons s'estompe pendant la vision” (3.10, 3.11), sans effet dans la fiche. Ch. 7 : elle “s'estompe pendant le baiser” (7.10), reste estompée en 7.11 à 7.13 et revient à pleine lumière au début du désenchantement (7.14), sans effet dans la fiche. | Ch. 3 et 7 le disent sans l'écrire ; pages isolées dans Apple Books. | Un état `voile`, calculé (partie 3.3) : `interface` avec `voile=True` au premier temps de 3.10 et au geste de 7.10 ; `net` le lève (2.4 ; 3.12, à l'ouverture), le désenchantement aussi (7.14). Chaque page ouverte seule le reprend. | Direction |
| 3 | **La couleur des aides** (halo, reflet, consigne) | Ch. 4 : or chez Darshan, blanc et graphite chez Julie. Les autres ne disent rien. | Règle d'un seul chapitre. | Elle suit le monde de la page (champ `monde` du découpage) : `Julie` → blanc et graphite ; `Darshan`, `légende`, `livre` → or ; `les deux` → or. Après 7.14, plus d'aide (le coin de page). | Direction |
| 4 | **La ballade : un seul nom, trois façons** | Ch. 1 : `melodie` avec `notes=4`, `duree=4000`, `filtre="eau"`. Ch. 2 : `notes=6`, `duree=1875`, `filtre="assourdi"`, `delai=1875`. Ch. 5 : `entiere=True`, `filtre="telephone"`. Ch. 7 : `entiere=True` (7.10), et le geste `rythme` avec `notes="melodie"` (7.9). `son.js` : une couche `melodie` à trois modes (`fragment`, `mesure`, `entiere`) et `Son.note('melodie', i)`. | Des réglages différents d'un chapitre à l'autre. `son.js` joue en 2.9 un fragment de six notes, qui est bien la première mesure, celle que les pas rejouent en 7.9. | Un seul effet, `melodie`, avec les modes de `son.js` : `fragment` (1.7 : quatre notes, `filtre="eau"` ; 2.9 : les six notes de la première mesure, `notes=6`, `filtre="assourdi"`, `delai=1875`, une fois) ; `entiere` (5.7 avec `filtre="telephone"` ; 7.10 sans filtre, une fois) ; `mesure` joue la première mesure d'un coup, claire, pour le bouton « Faire le geste » de 7.9. `duree` et `entiere` des fiches se traduisent vers ces modes. En 7.9, `rythme` avec `notes="melodie"` joue une croche par toucher. | Direction (avec le designer sonore) |
| 5 | **L'appel au père** | Ch. 1, 3, 6 : l'effet sonore `question`, la quinte à vide (la, mi, la), jamais résolue. `son.js` (consigne du son) : `appel`. | Deux noms. | `appel` partout (le nom de la direction, section 8, et de `son.js`). | Direction |
| 6 | **L'accord du père** | Ch. 3 et 7 : `son`, `effet="pere"`, avec `tenu=True` (repris sans montée à l'ouverture de 3.11 et 7.13) et `eteindre` (3 s, la note haute la dernière : 3.11, 7.13). | Aucun depuis que `son.js` l'a fait : `effet('pere')`, `montee`, `tenu`, `eteindre`, `duree`, un effet tenu qu'aucune ambiance n'arrête. | Les réglages des fiches passent tels quels. | Fait |
| 7 | **Le do dièse** | Ch. 3 : aucun do dièse avant 3.10 (tintements de 3.1, chœur de l'aube), pour que l'accord y soit une première fois. Ch. 1 : les notes qui montent (1.2) sont la, si, do dièse, mi, fa dièse. | Le seul do dièse avant 3.10. | La, si, ré, mi, fa dièse en 1.2 (même élan, sans la tierce du père). La ballade, mélodie de l'amour, garde sa propre tonalité ; qu'elle ne s'appuie pas sur l'accord de la majeur (la, do dièse, mi) avant 3.10. | Direction |
| 8 | **Les cœurs** | Ch. 2 : `maintenir` avec `battement="chamade"` (72, puis 132 à « devenait fébrile ») et `battement="deux"` (Darshan 96, Julie 64, trois contre deux). Ch. 4 : le cœur de Julie (`coeur`, `qui="julie"`, 64). Ch. 5 : l'accord vers 80 (`accord`, `tempo_commun`). Ch. 6 : sous la main, déjà accordés (`deja`), puis celui de Julie seul (`arythmie`), et `qui="deux"`. Ch. 7 : `battement="unisson"`, de 80 à 60. | Aucun : la famille se tient. | Un seul effet `coeur` (`qui` : `darshan`, `julie`, `deux`, `un`), et `maintenir` avec `battement` : `chamade`, `deux`, `unisson`. Les consignes riment : « Maintenez : la chamade bat », « Joue contre joue : maintenez », « Maintenez : deux cœurs battent », « Le baiser : maintenez ». | Fait |
| 9 | **Le compte à rebours** | Ch. 2 : « dimanche prochain » (2.9), jusqu'à la fin de la page. Ch. 3 : « quatre jours » (3.14), en or, en haut. Ch. 4 : « quatre jours » (4.7), dans la matière du téléphone, en haut, là où il affiche l'heure. Ch. 5 : « soixante-douze heures » (5.1 à 5.10), puis « onze heures », « treize heures » (5.11), avec `de`. Ch. 6 : « midi » (6.1), fondu dans le halo (6.3), puis « Dix longues secondes » qui se défont sur rien (6.11). Tous : `son="tic"`. Le chapitre 2 propose que 3.14 parte de « dimanche prochain ». | La place est la même partout depuis les révisions. Mais « dimanche prochain » n'est pas le rendez-vous de 3.14 : entre les deux, « Cela fait maintenant quatre mois que nous nous fréquentons » (4.7). Et rien ne dit où le compte s'affiche entre deux pages qui le changent. | En haut de la page, là où le téléphone affiche l'heure ; en or chez Darshan, blanc sur graphite chez Julie. **Affichage** : de la page qui le fait naître ou changer jusqu'à la fin de son chapitre, sauf 2.9, qui le garde sur sa seule page (c'est une autre date). Donc : 2.9 ; 3.14 ; 4.7 ; 5.1 à 5.11 ; 6.1 et 6.2 (fondu en 6.3) ; 6.11. 3.14 ne part pas de « dimanche prochain ». | Direction ; Karl valide le compte (question de la partie 10) |
| 10 | **La boussole** | Ch. 3 : la rose des vents sans aiguille (3.14). Ch. 5 : l'aiguille trouve son nord (5.3) ; au carnet, une aiguille d'or à pointe vermillon d'Aluva vers Paris, sans étoile. Ch. 6 : perdue en 6.15, sans bouger, la pointe pâlie. Ch. 7 : retrouve le nord en 7.10 (« à la volonté de Julie »), s'éteint en 7.14. | Les rimes de 5.3 (chapitre 5) disent encore que l'aiguille se tourne vers Julie en 7.14 et que l'étoile du père remonte dans la lanterne : caduc. | Suivre les chapitres 6 et 7. L'état `boussole` : `nord` (5.3), `perdue` (6.15), `nord` (7.10), `eteinte` (7.14). | Direction |
| 11 | **Le regard** | Ch. 3 : il naît en 3.4 (« Regarder à travers », dans la fiche des lunettes) et meurt en 7.14 ; il montre le jour de la porte du personnel au bout des rayonnages (3.6 à 3.8), rien dans la vision ; il propose aussi la porte de la demeure (6.4) et la fente du local (7.8). Ch. 7 : sa dernière vue est la fente du local (7.8). Ch. 6 : rien. | Pages non fixées ; offert quand ? | Offert quand les **lunettes** sont dans le sac de Darshan (pas la clé, ni les binocles), de 3.4 à 7.8. Il montre quelque chose en 3.6 à 3.8 (le filet d'or au pied de la porte du personnel), en 6.3 et 6.4 jusqu'à « la clé est dans ma poche » (un filet d'or au pied de la porte bleue) et au premier temps de 7.8 (la fente du local) ; ailleurs, la page telle quelle. Jamais nécessaire. | Direction ; Karl valide « Regarder à travers » |
| 12 | **Le carnet des portes** | Sept portes (`livre.PORTES`) ; libellés dans `interface.ini` ; `portes.ini` proposé par le chapitre 3 (phrases du livre avec leur clé d'entrée), rempli en partie par le chapitre 7 ; le libellé de la demeure change (6.4) ; `carnet` : le bouton luit (3.13, 5.3, 7.12) ; `vacille` (7.7). | La porte du père a trois états (anneau vu en 3.11, allumé en 7.12, éteint en 7.14) que l'état des pages ne connaît pas ; le lieu « Désert libyque » n'a aucune porte. | L'état `pere` : `vue`, `allumee`, `eteinte`. `portes.ini` créé avec les phrases de la partie 7. Retirer `desert` de `livre.LIEUX` et de `[lieux]` (le chapitre 7 n'y met pas de porte). | Direction |
| 13 | **Les trois clés** | 1.3 : `tourner`, centre (932, 1010), rayon 260. 6.13 : centre (932, 680), rayon 260. 7.8 : centre (932, 1010), rayon 260. Même consigne, même action, même cran. | La hauteur de la serrure en 6.13. | La garder : la rime est le geste (rayon, consigne, cran, son), pas le point de l'écran ; en (932, 1010), la serrure serait au pied du battant de l'armoire. | Direction |
| 14 | **Le geste vif** | 1.3.2, 3.4.1 et 6.11.2 : « Un geste vif : glissez vers le haut » ; action « Faire un geste vif » (1.3, 6.11) ; « Plier l'espace » (3.4). | Aucun. | Tel quel. | Fait |
| 15 | **« Poussez la porte »** | 1.3.5, 3.8.1, 6.4.1 ; la paume de 7.13 est “le même geste, sans la poussée”. | Aucun. | Tel quel. | Fait |
| 16 | **Les marches et les courses** | 1.2 : `rythme`, cinq notes qui montent. 2.8 : `glisser` lent, à deux. 4.4 : `rythme`, quatre pas sans note. 6.15 : `glisser` lent, seule. 7.8 : trois bonds automatiques (`enjambees`). 7.9 : `rythme`, six foulées, la première mesure de la ballade ; jamais de pulsation. | Le chapitre 4 garde “une pulsation” en 7.9. | L'arc : des notes qui montent vers la porte (1.2), quatre pas sans note (4.4), la première mesure de la ballade (7.9), toujours au rythme du lecteur. | Fait (le chapitre 4 est dépassé) |
| 17 | **Le regard qui se baisse** | 2.6, 4.1, 6.11 : `decor` avec `camera="baisse"` (l'image monte, le plan suivant entre par le bas). 3.7 : `decor` avec `glisse="haut"` pour “le regard descend sur le recueil”. | Deux écritures du même mouvement. | `camera="baisse"` en 3.7 aussi. | Direction |
| 18 | **La vue qui bouge dans une même photo** | Ch. 1 : `camera` avec `incline`. Ch. 5, 6, 7 : `camera` avec `avance`, `monte`, `recule`, `vers`, `zoom`, `duree`, `deja`. Ch. 2 et 3 : un effet `avance` (2.8, 3.3, 3.6). | Deux effets pour la même chose. | Un seul effet, `camera` ; `avance` devient `camera` avec `avance=True` (et `suit_geste` en 2.8). | Direction |
| 19 | **Le ton du panneau** | Ch. 2 : `decor` avec `texte="bas"` (2.4). Ch. 5, 6, 7 : `decor` avec `fond="clair"` ou `"sombre"`. | Deux réglages. | `fond` ; 2.4 : `fond="sombre"`. | Direction |
| 20 | **Les écrans partagés** | 6.2 : la scène spéciale `listes`, l'arête de pierre d'un coin de rue, les listes empilées en grand texte. 6.11 : `attendre` avec `partage` (le ciel de l'appel, la main de Julie) et l'étoile à part. 7.4 : l'effet `partage` (`gauche`, `droite`, `actif`, `ecart`, `tension`). | Trois écritures. | Un seul mécanisme, l'effet `partage` (`gauche`, `droite`, `actif`, `ecart`, `arete` : `pierre` ou `nuit`, `tension`) ; `attendre` et la scène `listes` l'appellent ; en grand texte, les moitiés s'empilent et l'arête devient horizontale. | Direction |
| 21 | **La voix écrite lettre à lettre** | 1.1 : l'appel au père, en or, avec un éclat d'étoile. 2.3 : la voix de Darshan pour Julie, à l'encre, sans éclat. 3.11 : « Tu es là ! », en or pâle, sans éclat, sans halo, sans son, si la synthèse en fait la signature. Les pensées de Julie en italique (5.1, 5.9) et les deux listes (6.2) restent sans cet effet. Le chapitre 1 écrit “la voix de Julie (2.3)”. | Signature des voix intérieures, ou de la seule voix de Darshan ? | La signature de la **voix intérieure de Darshan**, quand il parle à qui ne l'entend pas : son père (1.1, 3.11), Julie (2.3) ; la lettre (7.7) boucle la rime, écrite par le lecteur. Les pensées de Julie restent dans l'italique du livre. Au chapitre 1, lire “la voix de Darshan pour Julie (2.3)”. | Direction ; Karl valide (question de la partie 10) |
| 22 | **Les moments typographiques** | Direction, section 6 : 1.1, 2.3, 3.7, 4.2, 6.11, 7.7, 7.11 ; 5.9 sans effet. | Aucun : chaque chapitre s'y tient (3.11 emprunte l'écriture de 1.1 sans être un moment typographique). | Tel quel. | Fait |
| 23 | **Les bandes d'ouverture** | 1.1, 3.1, 7.1 : les bandes d'encre, de vermillon et d'or. 2.1 et 6.1 : les mêmes, dont la seconde moitié découvre la photo par l'obturateur. 4.1 : les bandes de Julie (anthracite, gris, blanc, grain argentique, sortie par l'obturateur). 5.1 : celles de Julie, en lilas, le grain devenu confettis. Le découpage n'a qu'un nom, `bandes`. | Quatre variantes, un nom. | Trois transitions : `bandes` (1.1, 3.1, 7.1), `bandes-photo` (2.1, 6.1), `bandes-julie` (4.1, et 5.1 avec le réglage `palette="lilas"`, `grain="confettis"` dans `livre.py`). À ajouter à `decoupage.TRANSITIONS`. | Direction ; Karl valide le lilas (ch. 5) |
| 24 | **Le frisson hors champ** | 5.7 et 6.4 : `frisson` avec `objet`, `bouton=True` (une étoile d'or sur « Objets », 0,5 s, un tintement minuscule). | Réglé (le chapitre 6 a quitté `remplacer` avec `hors_champ`). | Tel quel. | Fait |
| 25 | **Le ruban** | 6.1 : `ruban` avec `attache`, `vent`, `battement`. 6.15 : `immobile`, `attache`. 7.10 : `ruban` avec `x`, `y`, `affole`. Une matière de satin, jamais un trait d'encre. | `attache` contre `x`, `y`. | `attache` partout ; 7.10 : `attache=[1150, 1480]`, puis `[1150, 1300]`. | Direction |
| 26 | **L'ombre du nuage** | 2.10 : de droite à gauche, 4 s, 35 % plus sombre, le ciel reste plus sombre de 20 %. 5.4 : les mêmes réglages, `reste=0`. | Aucun. | Tel quel. | Fait |
| 27 | **Les toits du soir** | 2.9, 2.10, 5.1 : `toits-soir` (38674517). | Aucun. | Une définition, celle du chapitre 2. | Fait |
| 28 | **Les ciels** | 1.1, 6.11, 7.1 : le ciel de Karl 27116682 (bleu royal, un ton plus sombre, velours noir). 3.1 à 3.4 : la Voie lactée de Galice 39595391 (`cosmos`). | Les chapitres 3 et 7 citent encore `ciel-pere` et 39595391 pour 6.11. | 6.11 prend `ciel-appel` (le ciel de 1.1) ; `ciel-pere` n'existe plus ; `cosmos` reste au seul chapitre 3. | Fait (textes dépassés) |
| 29 | **La porte du père** | 3.10, 3.11 : la porte d'Irun (39434691), deux calques transparents (`porte-pere`, `porte-pere-traits`), haut du linteau à y 420, lanterne dessinée 120 unités au-dessus. 7.12 à 7.15 : les mêmes calques posés 200 unités plus bas (`porte-pere-rue`, `-traits`), lanterne en (600, 500). L'accord s'éteint en 7.13 sur « — Je ne sais pas si je pourrai revenir. », quand la vue recule d'un demi-pas. | Aucun. | Tel quel ; la serrure reste hors du calque. | Fait ; Karl valide la porte (partie 10) |
| 30 | **La cabane à kayaks** | 1.9 : `local-or` (`local_kayaks`, `heure="or"`), la porte de x 470 à 730, y 700 à 1350. 7.8 : `local-nuit` (`local_kayaks`, `heure="nuit"`, `proche=True`), serrure en (932, 1010). En 1.9, par le jour de la porte, le chapitre 1 fait entendre “Paris la nuit”. | Darshan quitte Aluva dans l'or de fin d'après-midi ; il arrive au déjeuner (2.1). À Paris, il est midi, pas la nuit (relevé par le chapitre 2). | Une fonction d'`art.py`, deux heures. En 1.9, l'autre côté est Paris **à midi** : la rumeur d'une rue, et déjà, très loin, la salle du restaurant (le raccord sonore avec 2.1, comme 1.3 annonce 1.4). | Direction ; Karl dit l'heure d'Aluva (partie 10) |
| 31 | **Le jour d'une porte fait entendre l'autre côté** | 1.3 (Aluva), 1.9 (Paris), 3.8 (le clapotis du Periyar), 7.8 (l'hôpital de nuit). | Aucun. | Un son, `autre-cote`, avec ce qu'on entend en réglage (partie 5). | Fait |
| 32 | **Le couloir d'hôpital** | 4.2, 7.4, 7.5, 7.8 : `couloir` (35375606), une lampe près d'une porte. | Aucun. | Un seul repérage le remplacerait partout (partie 9). | Fait |
| 33 | **La maison et la porte de Julie** | 2.8, 6.14, 6.15 : `maison-lierre` ; 2.9, 6.15 : `seuil-lierre` ; le même bruit de porte épaisse (`porte-epaisse`). | Aucun. | Tel quel. | Fait |
| 34 | **La rencontre (*Dos*)** | 2.2, 4.6, 4.7, 6.1, 6.2 : `rencontre` (33035648, x 0,5, y 0,45) ; 2.3 et 2.4 : `rencontre-encre` ; `rue-dos` retiré. | Aucun. | Une définition, celle du chapitre 2. | Fait |
| 35 | **La chambre et le lit de Julie** | `chambre` : 4.7, 5.1, 5.8, 5.9, 7.2. `lit-telephone` : 4.3, 5.6, à x 0,5. Le `README` d'`outils/darshan` relève que le téléphone y est coupé et propose x 0,2. | Recadrage non repris par les chapitres. | x 0,2 (vérifié sur le décor : à x 0,5, le téléphone sort par le bord gauche). | Direction |
| 36 | **Les lunes** | 1.1 (modèle des toits), 5.7 et 5.8 : la pleine lune derrière une cheminée (38570570). 5.9 : le croissant (38674516), en montée. 7.15 : `lune`, la photo entière du croissant. | Aucun. | `lune` redéfinie sur 38674516 (chapitre 5). | Fait |
| 37 | **Les rochers et la banquise** | 6.12 : `rochers` (x 0,75), `banquise` (x 0,84). 7.1 : le doigt de dieu dessiné d'après ces rochers. 7.3 : la banquise. | Aucun. | Recadrages du chapitre 6. | Fait |
| 38 | **Les images d'attente** | 2.7 (le pain perdu), 5.6 (bonbons, patinoire, croque-monsieur), 5.10 (vitrine), 5.11 (Charlotte), 6.7 (vue d'un étage), 6.8 (thé), 6.10 (dosa), 7.3 (glaçon), 7.9 à 7.15 (rue au couchant). | Aucun. | Floues tant que la photo de Karl manque ; le flou se retire avec le repérage (partie 9). | Fait |
| 39 | **La main de Julie** | 2.1 (R1 du chapitre 2, plan 1) et 6.10 à 6.13 (R4 du chapitre 6). | Deux séances pour la même main. | Une seule séance, deux lumières (partie 9, sortie 1). | Karl |
| 40 | **Le vermillon, rare** | Le chouchou et les anneaux du cœur de Darshan (2.2, 2.9), le cercle de framboises (5.11), la pointe de l'aiguille (5.3), le ruban (6.1, 6.15, 7.10), le chiasme (7.11). Refusés : la croix de néon rouge (4.2, 7.8), le rouge du RER et d'un sachet (4.3), la voiture rouge (7.9, recadrée). | Aucun. | Tel quel. | Fait |
| 41 | **La poussière** | Dorée quand la lumière la traverse (0.2, 1.2, 1.4, 7.14), grise dans l'ombre des efforts vains (3.3, 3.6). Réglages : `sens` (ch. 1), `retombe` et `envol` (ch. 3). | Deux écritures. | `poussiere` avec `sens` : `tombe`, `monte`, `retombe`, `envol` ; `couleur` : `or`, `gris` ; `petite`. | Direction |
| 42 | **Qui parle** | Ch. 1 : Darshan en or, les autres en clair, un dictionnaire `REPLIQUES` proposé pour tout le livre. Ch. 2 : « Si j’avais su… » sans couleur. Ch. 5 : « Il est incroyable. » sans couleur, en romain. Ch. 7 : Darshan en or jusqu'à la virgule de 7.14, puis en clair. | Pas encore de source unique. | `REPLIQUES` dans `livre.py`, paragraphe par paragraphe (chantier I3), avec les exceptions ci-contre ; à partir de 7.15, plus d'or. | Direction |
| 43 | **L'électrocardiogramme** | 7.5 : il entre dans le sac de Julie (« Julie récupère son appareil »). Personne ne le retire. | Julie le garde jusqu'à la dernière page, jusque dans sa course. | Il quitte son sac sans annonce au début de 7.9 (elle rentre chez elle). | Direction |
| 44 | **Les changements d'ambiance dans une page** | Ch. 5 et 6 : `son` avec `ambiance=…` (5.2, 5.8, 5.10, 6.12, 6.13, 6.15). Ch. 3 : `couche` pour le vent (3.14). Le découpage demande des changements que les fiches n'écrivent pas : 4.3 (vers la chambre), 4.5 (le tunnel, puis le parc), 4.7 (la chambre), 7.2 (la chambre), 7.4 (l'hôpital à gauche, le fleuve à droite), 7.8 (l'hôpital). | Pas d'effet commun ; six changements non écrits. | Un effet, `ambiance` (`id`, et les réglages de `son.js` : `soir`, `nuit`, `foule`, `ete`, `densite`…) ; `son` ne sert plus qu'aux effets ponctuels. Ajouter les six changements (partie 3.2) ; les variantes d'une page isolée vont dans le champ `son` du découpage (partie 8.3). | Direction |
| 45 | **Deux noms à changer** | `battements` (3.8) : la porte battante qui bat deux fois ; la couche `battements` de `son.js` est le cœur. `attente` (7.5, 7.16), effet où rien ne se touche ; `attendre` (6.11), geste. | Homonymies. | `battant` pour la porte de 3.8 ; `pause` pour l'effet de 7.5 et 7.16. | Direction |
| 46 | **Les recadrages proposés par le `README` d'`outils/darshan`** | portes-3 x 0,5 → 0,2 ; amoureux 0,32 → 0,15 ; lit-telephone 0,5 → 0,2 ; banquise → 0,84 ; rochers → 0,75 ; rocaille 0,62 → 0,45 ; phare, marche, parvis, rue-vide. | Le chapitre 3 interdit de toucher `portes-3` (à x 0,5, le fleuron en fleur de lys de la grille et le blason de la cour restent hors cadre) ; le chapitre 2 recadre `amoureux` à x 0,1. | `portes-3` reste à x 0,5 (on l'éclaircit seulement) ; `amoureux` à 0,1 ; `lit-telephone` à 0,2 ; `rocaille` à 0,45 si l'arche y gagne sans perdre l'allée ; `banquise`, `rochers` comme les chapitres 6 et 7 ; les autres ne servent plus. | Direction (la ligne de Karl pour `portes-3`) |
| 47 | **Le pavé de 1.7** | Ch. 1 : le reflet du pavé, “d'où naîtra la porte du père (7.12)”. Ch. 7 : la porte naît des dalles de la rue au couchant, sans la photo du pavé. | La rime d'image n'existe plus. | Garder la rime du texte (« Le pavé y est gris » et « les dalles du trottoir ») sans promettre la même photo ; la note de 1.7 dans le découpage perd “(7.12)”. | Direction |
| 48 | **Les objets qui restent dans le sac** | À la fin, le sac de Darshan garde la montre, le recueil, les jarres, les tapisseries, les confettis, de quoi écrire ; celui de Julie le téléphone, le paquet, la lettre. | Aucun : les boutons disparaissent en 7.14. | “Les objets restent dans les mains et les poches : c'est le livre qui ne les montre plus” (ch. 7). | Fait |

### 2.3 Restes à corriger, chapitre par chapitre

Aucun chapitre n'est à réécrire ; ces phrases sont dépassées par une révision voisine. La fabrication
suit la solution de la partie 2.2.
- **Chapitre 1** : 1.2, les notes montantes sans do dièse (ligne 7) ; 1.9, l'autre côté à midi (ligne
  30) ; le tableau des rimes : “la voix de Darshan pour Julie (2.3)”, la ballade aussi en 7.9 ; la note
  de 1.7 sans “(7.12)” (ligne 47) ; le son `question` devient `appel`.
- **Chapitre 2** : 2.4, `fond="sombre"` au lieu de `texte="bas"` ; la consigne de 6.15 citée dans ses
  rimes est désormais « Marchez : glissez vers le haut » ; la proposition de faire partir 3.14 de
  « dimanche prochain » est écartée (ligne 9).
- **Chapitre 3** : `ciel-pere` et le ciel de Galice pour 6.11 ; 3.7, `camera="baisse"` ; 3.8,
  `battant` ; la poussière en `sens` ; le voile de la vision à écrire (ligne 2).
- **Chapitre 4** : “une pulsation” en 7.9 (rimes de 4.4 et section 9) ; les changements d'ambiance de
  4.3, 4.5 et 4.7 à écrire.
- **Chapitre 5** : les rimes de 5.3 (l'aiguille et l'étoile du père en 7.14) ; `lit-telephone` à x 0,2.
- **Chapitre 6** : rien, sinon `ruban` et `compte` dans la forme commune (déjà la sienne).
- **Chapitre 7** : 39595391 “reste le ciel de 3.1 et de 6.11” (6.11 a pris 27116682) ; `pause` pour
  `attente` ; `attache` pour le ruban ; le voile du baiser à écrire ; les changements d'ambiance de 7.2,
  7.4 et 7.8 ; l'électrocardiogramme qui quitte le sac en 7.9.
- **Direction** : la phrase sur les visages de la couverture et du téléphone de Julie (partie 2.1).

## 3. Cahier des charges du moteur

Une seule liste, tirée par programme des fiches `SCENES` des sept chapitres (27 mécaniques et
106 noms d'effets), puis dédoublonnée : les noms retenus sont ceux de la partie 2 ; l'ancien nom reste
accepté comme alias le temps du report. Les coordonnées sont en unités de page (1 200 × 1 800), les
cibles en `[x, y, rayon]`. La marque (m) signale ce que le moteur écrit en parallèle déclare déjà ce
matin dans `src/js/mecaniques.js` ou `src/js/effets.js`, le plus souvent sans tous les réglages
ci-dessous.

**Pour tous les gestes** (l'échafaudage `Geste` du moteur, déjà écrit). Un halo sur la cible dès
l'ouverture ; la consigne après 2,5 s (tout de suite en mouvement réduit) ; le même geste en bouton
dans la fiche de l'objet en jeu (rubrique `[actions]`) ; « Faire le geste » après 8 s (3 s en
mouvement réduit) ; Entrée ou Espace au clavier ; un toucher simple fait le geste entier, sauf mention
contraire. Jamais d'échec, de score ni de blocage : lâcher trop tôt ramène le halo. Aucun glissement
horizontal ; aucun tracé de plus de 250 unités. Le nom accessible du geste est sa consigne. Pendant
qu'un geste est attendu, le glissement de l'historique se tait ; le temps suivant attend la fin des
effets du geste. Une mécanique inconnue devient un toucher (et `build.py` le signale). Réglages
communs : `cible`, `apres` (le geste suit la phrase au lieu de la précéder), `effets` (joués quand le
geste est fait ; ceux qui portent `suit_geste` avancent avec lui).

**Pour tous les effets.** `delai` : attendre ce nombre de millisecondes après la parution du temps.
Un effet peut rendre une promesse : le temps suivant l'attend. Au plus trois animations sur toile
par page, jamais plus de deux à la fois. En mouvement réduit : ni déplacement, ni zoom, ni
tremblement, ni particule ; des fondus. Les vibrations jamais en mouvement réduit, ni quand les effets
sonores sont coupés. Le réglage « Lecture » affiche tout le texte, sans animation. Sans script, une
image par page (la dernière du tableau pour 7.3, 7.11 et 7.15 ; la rue et la porte pour 7.12 à
7.14 ; la première ailleurs). Rien d'essentiel ne passe par le seul son ni la seule couleur (les
sous-titres des sons, chantier I4, nomment l'appel, l'accord du père et la ballade).

### 3.1 Les mécaniques (27)

| Mécanique et réglages | Le lecteur fait ; il voit et entend | Durée | Toucher simple ; clavier | Mouvement réduit | Tableaux |
|---|---|---|---|---|---|
| **`toucher`** (m) : `cible`, `n`, `effet`, `effets` | Il touche la cible (les lunettes, la porte, le trou, le paquet, la vidéo, le rideau) ; halo qui respire. `n=2` avec `effet="toc"` : deux coups doux sur la porte (7.5), le halo hésite avant | instant | n'importe où ; Entrée (autant de fois que `n`) | sans zoom | 1.3, 1.9, 3.2, 3.8, 5.5, 5.7, 6.4, 6.7, 7.5 |
| **`maintenir`** (m) : `duree`, `battement` (`chamade`, `deux`, `unisson`), `halo`, `tempo`, `accord`, `tempo_commun`, `deja`, `chaleur`, `paupieres`, `effets` | Le doigt posé n'importe où (`halo` place l'invitation). `chamade` : un coup sourd, puis 72 à 110 battements par minute, un anneau vermillon par battement, le décor bat (1,006). `deux` : Darshan 96 (vermillon), Julie 64 (crème, plus clair), sans se rencontrer. `accord`, `tempo_commun=80` : ils convergent vers 80 et battent ensemble, alors seulement le décor pulse. `deja` et `chaleur` : accordés dès le toucher, une chaleur ambrée sous le doigt. `unisson`, `tempo=[80, 60]` : un seul anneau mêlé, un seul cœur. `paupieres` : deux paupières au bord flou se ferment ; fermées, elles le restent. Une fois lancé, le cœur bat sans le doigt jusqu'à la fin de la page | 2,6 s (2.2) ; 4,2 s (5.9) ; 1,5 s (6.10) ; 1,8 s (7.1) ; 3,5 s (7.10) | un toucher lance le tout ; Espace maintenue | les anneaux s'allument sans grandir, le décor ne bat pas, les paupières en fondu | 2.2, 2.9, 5.9, 6.10, 7.1, 7.10 |
| **`glisser`** (m) : `sens` (`haut`, `bas`), `vif`, `lent`, `suivre`, `lever`, `zoom`, `cible`, `effets` | Un glissement vertical. `vif` : le geste vif, d'un coup (la clé naît en 1.3, l'espace se plie en 3.4, l'éclat se brise en 6.11). `lent` avec des effets `suit_geste` : seule la lenteur fait avancer, l'allée avance sous le doigt (2.8, 6.15). `sens="bas"` : baisser les yeux, enfiler la chemise (1.8, 2.6). Souffler la poussière (3.6), attiser les braises (7.6). `lever`, `zoom` : le premier mouvement ouvre les paupières, puis la photo descend et grandit sous le doigt qui monte (7.11) | le geste ; ses effets de 0,65 à 2,5 s | un toucher fait le glissement entier (7.11 : 2,5 s) ; Entrée | fondus ; en 3.4, le point glisse jusqu'à l'autre et s'y fond | 1.3, 1.8, 2.6, 2.8, 3.4, 3.6, 6.11, 6.15, 7.6, 7.11 |
| **`rythme`** (m) : `n`, `notes` (`montantes`, `melodie`), `effet` (`pas`), `avance`, `plan`, `ruban` | Chaque toucher est une enjambée, au rythme du lecteur, **jamais de pulsation**. 1.2 : cinq notes qui montent (la, si, ré, mi, fa dièse : partie 2.2, ligne 7), la cinquième devant la porte. 4.4 : quatre pas à plateforme, pleins et un peu creux, la photo avance de 3 %, sans note. 7.9 : six foulées, chacune joue la croche suivante de la première mesure de la ballade et avance la photo de 3 à 6 % selon la vitesse ; le ruban, au bord droit dès l'ouverture, grandit d'autant | au rythme du lecteur | `n` touchers quelconques ; Entrée ou Espace `n` fois ; « Faire le geste » joue les `n` enjambées (en 7.9, la mesure entière) | pas d'avancée dans la photo (fondu) ; les pas et les notes restent | 1.2, 4.4, 7.9 |
| **`tourner`** (m) : `centre`, `rayon` (260, au moins 250), `angle` (−90), `effets` | Un quart de cercle en pointillés d'or autour de la serrure ; le doigt se pose sur le cercle et tourne ; l'angle se compte depuis le centre ; la clé suit à 80 % avec une légère résistance ; à 90°, le cran (son `cran`, frisson) ; revenir en arrière avant le cran ramène la clé doucement | 0,65 s | toucher la clé ; Entrée ; bouton de fiche « Donner un tour de poignet » | la clé passe à 90° sans animation, le cran sonne | 1.3 (932, 1 010), 6.13 (932, 680), 7.8 (932, 1 010) |
| **`porter`** (m) : `objet`, `depart`, `cible` | L'objet attend à `depart` ; le doigt le porte jusqu'à la cible. 1.3 : la clé, posée sous la serrure, portée vers le haut (vers [932, 1 010, 170]). 7.8 : la lettre pliée, de (600, 1 250) jusqu'au jour de la porte ([720, 1 600, 200]), où elle se glisse et disparaît | le geste | l'objet va seul ; Entrée ; bouton de fiche | l'objet paraît à sa place ; la lettre disparaît en fondu | 1.3, 7.8 |
| **`tracer`** (m) : `chemin`, `trait` (`mousse`), `flou`, `effets` | Suivre du doigt un guide en pointillés d'or, tolérance large, 220 unités de large : un trait blanc, épais, bordé de bulles (la moustache de mousse à raser) ; puis trois coups de coutelas | le geste | le trait se dessine seul ; Entrée | le trait paraît entier | 1.4 |
| **`remuer`** : `zone`, `images` | Dans l'eau (`zone` [0, 800, 800, 1 750]), de petits cercles ou de haut en bas : des anneaux s'élargissent, l'image ondule autour du doigt ; après 2 s de mouvement, les reflets de `images` se forment l'un après l'autre (effet `reflet`) | 2 s, puis 1,5 s par reflet | une ride, puis les reflets ; Entrée | les reflets en fondu, sans onde | 1.7 |
| **`caresser`** : `cible` (rayon 120), `duree` (2 400), `sens`, `matiere`, `effets` | Un va-et-vient lent (moins de 600 unités par seconde) dans le cercle ; seuls les mouvements lents comptent. 2.1 : une lueur chaude suit le doigt, le flou se resserre autour de la main. 6.5, `matiere="velours"`, `sens="vertical"` : de haut en bas, le poil change de ton (+ 12 % dans le sens du poil, − 12 % à rebrousse-poil, relâché en 2 s), quelques reflets d'argent | 2,4 s de caresse cumulée | une caresse jouée ; Espace maintenue | pas de lueur qui suit : le halo s'éclaire | 2.1, 6.5 |
| **`deux-pouces`** : `zone`, `cibles`, `suivre`, `duree` (2 600), `effets` | Deux doigts quelconques dans la zone ; deux cercles d'or naissent sous eux, les suivent et glissent l'un vers l'autre ; maintenus, ils ferment le sceau, un ovale d'or | 2,6 s | un seul doigt maintenu ; Espace maintenue ; lâcher tôt rouvre les cercles | cercles fixes, le sceau en fondu | 3.9 |
| **`respirer`** : `n`, `mini` (1 200), `anneau`, `avance`, `effets` | Maintenir, c'est inspirer (au moins 1,2 s : des braises montent) ; lâcher, expirer (elles s'éteignent, le fleuve s'assombrit d'un cran) ; trois fois (3.10). Une fois en 4.5, sans braises : anneau blanc, la photo avance dans le tunnel, puis l'éblouissement vert | 4 s par souffle guidé | un toucher lance les respirations guidées par un anneau qui grandit puis diminue ; Espace maintenue | la lueur varie, sans particule | 3.10, 4.5 |
| **`tendre`** : `depart`, `cible`, `arret` | La main d'or suit le doigt vers le haut, de plus en plus lentement, et s'arrête à un doigt du bois (y 1 000) ; si le lecteur insiste, la lumière devant la porte ondule en cercles et rien ne cède ; au lâcher, la main redescend | le geste | la main monte seule jusqu'à la limite ; Entrée | la main paraît à la limite, sans onde | 3.11 |
| **`semer`** : `rose`, `sans_aiguille`, `cibles`, `effets` | La rose des vents d'or sans aiguille (le dessin de la boussole de 5.3) ; quatre points ([600, 760], [940, 1 100], [600, 1 440], [260, 1 100], rayon 110) ; chaque toucher lance une graine vers son bord ; le vent se lève (couche `vent`) | quatre touchers | quatre touchers n'importe où, dans l'ordre ; Entrée quatre fois | les graines paraissent aux bords | 3.14 |
| **`curseur`** : `mini` (0), `maxi` (10), `depart` (0), `sens` (`vertical`), `objet` (`reglette`) | Une réglette de plastique blanc, verticale, onze crans, un clic par cran ; face patient, une ligne sans chiffre ni mot ; au lâcher, elle se retourne : face soignant, la graduation et le chiffre choisi, en grand ; puis elle s'efface | retournement 0,6 s ; chiffre 1,5 s | toucher un cran ; flèches haut et bas, puis Entrée ; lecteur d'écran : un curseur natif de 0 à 10, nommé par la consigne | pas de retournement : les deux faces en fondu | 4.2 |
| **`messages`** : `a` (« Amélie »), `bulles` (2), `touchers` (5), `effets` | Le téléphone de Julie monte du bas ; chaque toucher allume une touche du clavier ; deux bulles de trois points, sans aucun texte (le livre ne le donne pas), aucune réponse ; le téléphone redescend vers le bouton du sac (notification) | montée 0,5 s | cinq touchers quelconques ; Entrée cinq fois | sans montée : fondus | 4.3 |
| **`contact`** : `nom`, `nom_ecrit_au_retour`, `numero` (aucun), `tendre` | Une fiche de contact vide ; on tend le téléphone : il sort par le haut, une seconde d'absence, revient avec le nom et sans numéro ; une coche, sans mot | 0,6 + 1 + 0,6 s | un toucher ; Entrée ; bouton de fiche « Demander son numéro » | fondus | 4.7 |
| **`etals`** : `cibles`, `objets`, `envol` (`court`), `avance`, `ploie` | Toucher chaque marchandise (calques du dessin `marche_aluva`) : elle quitte l'étal et s'envole vers le sac (le bandeau « Nouvel objet » au premier achat seulement), l'allée avance d'un pas ; au dernier achat, le bouton du sac ploie, lesté | envol 0,8 s ; ploiement 0,3 s | toucher ailleurs achète la marchandise suivante ; Entrée | sans avancée ; envols en fondu | 5.2 |
| **`galerie`** : `ouverture` (`haut`), `feuilleter`, `images` | L'écran du téléphone de Julie en pleine page (fond noir, barre d'état avec le compte, vignettes carrées trois par rangée, aucun texte), ouvert d'un glissement vers le haut ; ensuite chaque glissement vers le haut avance d'un temps (les clichés : effet `cliche`) | le geste | un toucher avance d'un temps ; Entrée ; bouton de fiche « Ouvrir la galerie » | fondus | 5.6 (l'état ouvert en 5.7) |
| **`essuyer`** : `hublot` [600, 900, 150], `trace_max` (240), `seuil` (0,75), `dessous`, `voile` | Frotter la buée en petits cercles : un rond clair se forme ; passé 75 %, il s'arrondit seul ; le reste reste embué ; tant que la photo de Karl manque, un voile doux reste dans le hublot | arrondi 0,8 s | trois passes jouées ; Entrée | le hublot paraît en fondu | 5.11 |
| **`liste`** : `cote`, `items`, `echos` | Dans chaque moitié de l'écran partagé, un article par ligne avec sa case ; toucher un article le coche (au pinceau d'or chez Darshan, au stylo chez Julie) ; quand un écho est coché, son premier mot se rallume et un fil d'or passe d'une liste à l'autre ; la fin de la phrase paraît quand tout est coché | fil 1 s | toucher ailleurs coche l'article suivant ; Entrée | pas de fil : les deux mots s'allument ensemble | 6.2 (scène `listes`) |
| **`verser`** : à régler avec la photo (`bec`, `tasse`) | Du bec de la théière, au-dessus de la tasse, glisser vers le haut élève la théière et allonge le filet (jusqu'à 700 unités) ; maintenir fait couler ; la tasse se remplit ; le son suit la longueur du filet | le geste | un versement joué ; Entrée | le filet paraît, la tasse se remplit en fondu | 6.8 |
| **`attendre`** (m) : `duree` (10 000), `partage`, `etoile` (`pere`), `passer` (3 000), `presser` | Rien à faire. La consigne paraît aussitôt ; l'horloge bat dix coups ; l'écran se partage (le ciel de l'appel, la main de Julie), l'étoile à part en haut à gauche ; la moitié droite pulse au cœur de Julie (1,004) pour qui n'entend pas l'horloge ; un toucher ne fait qu'une ride et ne remet rien à zéro. « Continuer » paraît après 3 s et presse les secondes restantes (l'horloge accélère jusqu'au dixième coup). À la fin, le partage s'efface sans se fendre | 10 s (1,5 s pressées) ; effacement 0,8 s | Entrée vaut « Continuer », après 3 s | le partage paraît et disparaît en fondu, sans pulsation | 6.11 |
| **`portes`** : `images`, `accelere`, `taille` [360, 600], `zone` [60, 60, 1 140, 1 040] | Chaque toucher : un cadre de porte à l'encre saigne autour du point touché, ramené dans la zone ; ses battants s'ouvrent sur le paysage suivant, restent ouverts de moins en moins longtemps, puis claquent ; le cadre reste en cicatrice ; une étincelle part vers « Carnet » et s'éteint à mi-chemin ; six portes | 0,3 + 0,3 s, ouvertes 1,2 ; 1 ; 0,8 ; 0,7 ; 0,6 ; 0,5 s | Entrée et « Faire le geste » : les portes naissent en spirale autour du centre | chaque paysage 1 s dans un cadre déjà ouvert | 6.12 |
| **`main`** : `effets` | Un reflet chaud respire sur la main de Julie ; au toucher, rien pendant 0,5 s, puis la main quitte l'image vers le bas (plan `main-vide`) ; sous le doigt, la chaleur vire au bleu et s'éteint. Toujours le même résultat | 0,5 + 0,5 s ; 1 s | Entrée | fondu vers `main-vide` | 6.13 |
| **`ecrire`** : `appui`, `lignes` (5) | Tant que le doigt appuie sur la feuille, n'importe où, la plume avance sur la ligne (environ huit caractères par seconde) ; lever le doigt la suspend ; la ligne finie, la suivante attend ; une vraie écriture penchée révélée derrière une pointe de plume, le texte réel dessous | environ 1,5 s par ligne | un toucher écrit la ligne ; Entrée ; « Faire le geste » écrit ce qui reste | chaque ligne paraît en fondu | 7.7 |
| **`effacer`** : `resiste`, `sens` (`vertical`) | Frotter de haut en bas : le papier s'use (auréole, fibres), l'encre ne bouge pas, elle fonce à peine ; la phrase paraît | 1,5 s de frottement | un toucher ; Entrée | une auréole qui paraît et s'efface | 7.7 |
| **`paume`** : `cible` [600, 1 000, 170], `duree` (2 200), `cle_absente`, `effets` | Le doigt posé sur la jointure des battants et tenu : la main d'or de 3.11 monte et se pose, à plat ; rien ne s'allume ni ne s'ouvre ; aucune clé n'est proposée ; au lâcher, la main s'efface sans marque | 2,2 s | la main monte seule ; Espace maintenue | la main paraît posée, puis s'efface | 7.13 |

**Retirés du vocabulaire** (ils figurent encore dans `decoupage.MECANIQUES` ou dans des versions
dépassées) : `pincer` (aucun geste ne pince), `défiler` (devenu `galerie`), `synchro` (devenu
`maintenir` avec `accord`), `lunettes-photos`, `pleuvoir` (la pluie de 7.4 tombe seule), `carte`
(2.7 : elle ne revient que si Karl répond que Darshan commande le dessert, partie 10).

### 3.2 Les effets

Classés par famille. Alias acceptés pendant le report : `avance` → `camera` avec `avance=True` ;
`battements` (3.8) → `battant` ; `attente` → `pause` ; `son` avec `ambiance=` → `ambiance` ;
`lanterne-eteinte` → `lanterne` avec `eteindre=True` ; `envol-vue` → `decor` avec `camera="leve"` ;
`vision` (2.10) → `esquisse` ; `vibration` (4.3) → `tremble` ; `decor` avec `texte` → `fond`, avec
`glisse="haut"` → `camera="baisse"` ; le son `question` → `appel`. Trois renommages défont des
homonymes : `vision` (2.10) est aussi la scène et l'ambiance du mudrā ; `vibration` (4.3) et
`battements` (3.8) sont aussi des couches de `son.js` (le vibreur, le cœur), que le moteur appelle
déjà sous ces noms ; `pluie` (7.4), qui est aussi une couche, garde son nom et joue la couche. Tout
est à décider par la direction.

**Objets, portes et carnet** (ce que `build.appliquer` calcule pour les pages suivantes doit rester
d'accord avec ce que l'effet fait en direct)

| Effet et réglages | Ce qui se voit, ce qui s'entend | Durée | Mouvement réduit | Tableaux |
|---|---|---|---|---|
| **`objet+`** (m) : `id`, `sac`, `discret`, `style` (`notification`), `ploie` | L'objet entre dans le sac : bandeau « Nouvel objet » et envol vers le bouton (le premier objet fait naître « Objets ») ; chez Julie, bandeau gris arrondi au-dessus du bouton du sac, avec le vibreur ; `ploie` : le bouton ploie ; `discret` : sans aucun signe | envol ≈ 2 s (bandeau de Julie 1,2 s) ; ploiement 0,3 s | fondu | 1.2, 1.9, 3.8, 4.3, 5.5, 5.11, 7.5, 7.6, 7.7, 7.9 |
| **`objet-`** (m) : `id`, `discret` | L'objet quitte le sac, sans signe s'il est `discret` | instant | pareil | 6.6, 6.10, 7.11 |
| **`remplacer`** (m) : `de`, `vers`, `sac`, `discret` | Un objet devient un autre dans le sac (lunettes et clé, clé et binocles, ticket et paquet) ; `de="lunettes"` trouve aussi les binocles (`build.FAMILLES`) | instant | pareil | 1.3, 1.4, 2.1, 3.8, 3.9, 6.1, 6.4, 6.11, 6.15 |
| **`transfert`** (m) : `id`, `de`, `vers`, `jaillir` | L'objet passe d'un sac à l'autre ; `jaillir` : la lettre jaillit de l'embrasure, virevolte sous la lampe et se pose, puis rejoint le sac de Julie | 1,5 s | la lettre paraît sous la lampe | 7.8 |
| **`eclat`** (m) : `objet` | La métamorphose en grand (prototype) : bandes d'encre, de vermillon et d'or, la clé qui tournoie, son nom et le fragment du livre | ≈ 2,8 s | une image fixe | 1.3 |
| **`eclat-court`** (m) : `de`, `vers`, `serrure` | Le frisson, la fonte, le nom seul ; `serrure` : la clé née de l'éclat est déjà dans la serrure | environ 1 s | fondu | 1.9, 7.8 |
| **`eclat-brise`** : `objet`, `fragment` | L'éclat de 1.3 commence ; à 0,7 s, des fêlures blanches courent sur les bandes, la clé hoquette, les lettres du fragment glissent sans se poser ; à 1 s, les bandes se brisent en six éclats qui tombent hors de la page ; la clé va au sac sans fiche | environ 1,5 s | une image des bandes fêlées, 1 s | 6.11 |
| **`fonte`** : `objet`, `legende`, `vue` (`dehors`) | En or dans le décor, vue du dedans (3.4, la fonte de 1.3 sans passer par le sac) ; `vue="dehors"` : les binocles fondent en encre noire et visqueuse, trois ou quatre gouttes tachent la photo, la masse s'affine en clé et s'efface (6.12) | 2 s | l'objet, puis la clé, et les taches | 3.4, 6.12 |
| **`frisson`** (m) : `objet`, `bouton`, `x`, `y` | Un frisson de lumière sur la cible ; `bouton=True` : une étoile d'or sur « Objets » et un tintement minuscule, quand un objet change hors champ | 0,5 s | l'étoile, sans mouvement | 3.2, 5.7, 6.4 |
| **`porte`** (m) : `id`, `depuis`, `anneau`, `delai` | Une étoile file de `depuis` vers « Carnet » quand le passage s'achève à l'image (arbitrage 6) ; la première fait naître le bouton ; `anneau` : l'étoile à part du père, un anneau d'or au point presque éteint | à régler (0,6 s en 3.11) | l'étoile paraît au carnet | 1.4, 1.9, 3.9, 3.11, 6.5, 6.15, 7.8 |
| **`carnet`** : `id`, `allumer` | Le bouton « Carnet » luit une fois, sans son (une fiche de porte a reçu une phrase) ; `allumer` : l'anneau du père allume son point (7.12) | 0,6 s | pareil | 3.13, 5.3, 7.12 |
| **`vacille`** : `cible` | Un bouton de la barre baisse de moitié, puis revient (« Carnet », 7.7) | 0,3 s | pareil | 7.7 |
| **`boussole`** : `etat` (`affolee`, `nord`, `perdue`, `eteinte`), `rose`, `place`, `aiguille`, `bouton`, `anime` | La rose de `semer` dans l'image ; `affolee` : un tour par seconde, à-coups ; `nord` : elle ralentit, oscille et se fixe en haut, l'étoile du matin à sa pointe (page seulement) ; au carnet, une aiguille d'or à pointe vermillon d'Aluva vers Paris ; `bouton` : sur le bouton « Carnet » ; `perdue`, `anime=False` : arrêtée au hasard, la pointe pâlit | 1,5 s | l'aiguille change de direction sans tourner | 5.3, 6.15, 7.10 |
| **`desenchantement`** (m) : `duree` (9 000), `annonce` | Sans un son, en quatre mouvements : l'or quitte les mots (1,5 s) ; la clé sort d'« Objets », vient grande près du texte et tombe en poussière d'or en diagonale, sans remonter (3 s) ; le carnet déplie sa constellation dans l'image et ses étoiles s'éteignent de la dernière à la première, la boussole, puis l'anneau du père (3,5 s) ; le ✦ devient un coin de page, seul « Menu » reste (1 s). `annonce` : les textes `cle_poussiere` et `carnet_eteint`, lus aux lecteurs d'écran à la fin seulement ; rien ne se touche pendant ce temps, sauf « Menu » | 9 s | l'or passe en fondu, la clé s'efface, les étoiles s'éteignent ensemble | 7.14 |

**Images et plans**

| Effet et réglages | Ce qui se voit, ce qui s'entend | Durée | Mouvement réduit | Tableaux |
|---|---|---|---|---|
| **`decor`** (m) : `i`, `fondu`, `par` (`obturateur`), `camera` (`baisse`, `leve`), `fond` (`clair`, `sombre`), `duree`, `retour` (`fondu`) | Le plan suivant (ou le plan `i`) : coupe, ou fondu enchaîné de `fondu` ms (8 000 en 1.8, 20 000 en 3.12) ; `par="obturateur"` : les lames et le double déclic (420 + 520 ms) ; `camera="baisse"` : le regard descend, le plan sort par le haut et le suivant entre par le bas (1,2 s) ; `camera="leve"` (l'ancien `envol-vue`, 2.9) : l'inverse, dans un souffle d'air montant (1,4 s) ; `fond` : le panneau de texte passe au clair ou au sombre sans changer de place (0,8 s) ; `duree` : retour seul au plan précédent, `retour="fondu"` en 0,5 s | de la coupe à 20 s | fondus courts | 37 tableaux : 1.5, 1.6, 1.8, 1.9, 2.3 à 2.6, 2.8, 2.9, 3.2, 3.6 à 3.8, 3.10, 3.12, 4.1, 4.3, 4.5, 4.7, 5.1, 5.8 à 5.10, 6.3, 6.5, 6.8, 6.10, 6.11, 6.13, 6.15, 7.2, 7.3, 7.6, 7.8, 7.9, 7.11, 7.15 |
| **`camera`** (m) : `avance`, `recule`, `monte`, `incline`, `vers`, `zoom`, `duree`, `deja`, `suit_geste`, `lent` | La vue bouge dans une même photo : `incline` : elle s'abaisse de 4 % et remonte, comme un salut (1.9) ; `avance` : travelling avant jusqu'au cadrage du plan `vers` ou jusqu'à `zoom` (3.3 : 5 % en 30 s ; 6.9 : 30 s ; 7.13 : 12 s) ; `lent` : de 1 à 1,08 en 6 s ; `suit_geste` : sous le doigt (2.8) ; `monte` : panoramique vertical à même x et même zoom (5.9) ; `recule` : un demi-pas en arrière (7.13, 1,5 s) ; `deja` : la page reprend le cadre où la précédente s'arrête | 0,9 s à 30 s | plan fixe, ou fondu vers le plan d'arrivée | 1.9, 2.8, 3.3, 3.6, 5.8, 5.9, 6.9, 7.13, 7.14, 7.15 |
| **`flou`** (m) : `force`, `tout`, `garde`, `chaud`, `suit_geste` | Tout flou (8 px, moins contrasté) ou `garde` une zone nette au bord adouci ; `chaud` : l'image se réchauffe ; `suit_geste` : l'intensité suit le geste et l'ambiance baisse jusqu'au tiers ; `force` 14 à 16 sur les images d'attente, retiré avec le repérage | 0,9 s | 0,2 s | 2.1, 2.7, 2.9, 4.6, 4.7, 5.10, 5.11, 6.8, 6.10, 7.3 |
| **`net`** (m) : `depuis`, `duree` | Tout revient : image nette, son ouvert, texte net, barre de commandes pleine (lève le voile, pas l'état de la barre) | 0,9 à 1,2 s | 0,2 s | 2.4, 2.9, 3.12, 4.6, 4.7, 6.8, 6.10 |
| **`eblouir`** (m) : `sens` (`monte`), `depuis`, `doux`, `teinte` (`vert`) | Une lumière part d'un point (la porte de la cabane, 1.9) et gagne la vue ; elle retombe sur le plan suivant ; `doux` : un voile blanc qui monte et redescend, jamais un éclair (7.11) ; `teinte="vert"` : la sortie du tunnel (4.5) | 1,2 à 3 s | fondu, luminosité plafonnée | 1.4, 1.9, 4.5, 7.11 |
| **`eclair`** : `doux` | Une lumière chaude, plafonnée à 70 %, un seul éclair, jamais de clignotement ; le décor suivant apparaît dessous | montée 0,9 s, retrait 2 s | fondu | 5.9 |
| **`refroidir`** : `instant`, `crepuscule` | La photo passe au froid (− 600 K, − 10 % de lumière, − 15 % de saturation) ; `instant` : la page s'ouvre déjà froide ; `crepuscule` : encore − 35 % et une dominante bleue. Le graffiti, le ruban et l'encre n'y sont pas soumis | 6 s | pareil (ce n'est qu'une couleur) | 6.10 à 6.15 |
| **`effacement`** : `fond` | La photo pâlit jusqu'à la couleur du papier ; les cicatrices d'encre restent et foncent de 10 % ; le panneau passe au clair | 3 s | 1 s | 6.12 |
| **`gel`** : `fenetres`, `deja` | Le monde se fige : la photo perd ses couleurs, sauf la porte et sa lanterne ; des fenêtres s'éclairent une à une (places à relever sur la photo) ; `deja` : figé dès l'ouverture | 2 s | fondu | 7.12 à 7.15 |
| **`degel`** : `delai` | La fente se referme sans trace, les couleurs reviennent, la vue revient au plan large ; plus aucune encre dans aucune image du livre | 2 s | fondu | 7.15 |
| **`enjambees`** : `n`, `i`, `notes` (`montantes`) | Trois bonds automatiques vers la porte (le plan `i`), avec le rebond de la danse des tuiles et les trois premières notes montantes de 1.2 : le lecteur reconnaît la danse, qu'il refera lui-même, changée, en 7.9 | trois bonds | un fondu vers le plan ; les notes restent | 7.8 |
| **`vibre`** (m) : `cible`, `n`, `haptique` | L'image tressaille (quelques unités) ; `cible="sac"` : le bouton du sac tremble `n` fois (120 ms) ; `haptique` : le motif du vrai téléphone, là où l'interface Vibration existe | 0,12 à 1,2 s | rien ne bouge, aucune vibration | 1.3, 4.7, 7.12, 7.15 |
| **`tremble`** (l'ancien `vibration` de 4.3) : `legere`, `jusqua` | La couche du décor tremble d'un pixel, irrégulièrement, comme un train, jusqu'au plan `jusqua` ; jamais le texte | jusqu'au plan suivant | rien | 4.3 |
| **`chaleur`** : `zone` | L'air tremble dans la zone, ondulation verticale lente, plus forte en bas, jusqu'à la fin de la page | la page | rien | 1.4 (et la vignette de 5.5) |
| **`reflet`** : `image`, `zone` | Une photo paraît renversée dans l'eau, ondulée, bords fondus dans l'encre ; elle remplace le reflet précédent ; elle reste une photo | 1,5 s | fondu | 1.7 |
| **`lin`** | Le lin blanc d'une chemise passe devant la vue de haut en bas et la couvre ; le texte reste lisible | 1,6 s | fondu au blanc court | 1.8 |
| **`clin`** : `encre` | Une paupière de pinceau, avec ses cils, descend sur la moitié droite de la vue et remonte | 0,35 à 0,4 s | rien | 1.6 |
| **`passe`** | Le plan glisse de côté (6 % de sa largeur) comme quand on dépasse quelqu'un ; le merle s'éloigne vers la gauche | 4 s | le son seul | 2.8 |
| **`vertige`** | La fenêtre dessinée reste fixe ; la photo derrière recule (de 1 à 0,75, un degré de rotation, retour à 0,8) : un travelling compensé | 2,5 s | rien | 6.7 |
| **`rideau`** : `i` | Le voilage s'ouvre du milieu vers les côtés et découvre le plan `i` | 1 s | fondu | 6.7 |
| **`embrasure`** : `cadre`, `image`, `instant`, `agrandir`, `suit_geste`, `fermer` | La porte de l'armoire pivote et découvre, dans son cadre d'encre (y 320 à 1 040), le plan `image` ; changer d'image : fondu dans le cadre ; `agrandir` avec `suit_geste` : le cadre grandit sous le doigt jusqu'à sortir de la page ; `fermer` : les traces d'encre aux bords se retirent, avec le son d'une porte | 0,8 s ; 1 s | fondus | 6.13, 6.14, 6.15 |
| **`saigne`** : `i`, `x`, `y` | Le plan à l'encre gagne sur la photo depuis le point, par un masque d'encre mouillée, limité à la porte | 1,5 s | fondu de la porte seule, 0,6 s | 6.4 |
| **`portes-vides`** : `n`, `instant` | Trois cadres de porte à l'encre saignent sur la photo à 0,5 s d'intervalle et s'ouvrent sur le papier nu ; l'ambiance baisse à chaque ouverture ; une étincelle part vers le carnet et meurt ; les cadres restent (cicatrices) ; `instant` : déjà là à l'ouverture | environ 2,5 s | les cadres paraissent ouverts | 6.11, 6.12 |
| **`coin-de-rue`** : `i` | L'arête de l'écran partagé s'efface ; la moitié à l'encre se développe en photo (le plan `i`), la moitié photo s'y fond | 0,8 + 1,5 s | fondu de 0,6 s | 6.2 |
| **`partage`** : `gauche`, `droite`, `actif` (`gauche`, `droite`, `les deux`, `aucun`), `ecart`, `arete` (`pierre`, `nuit`), `tension` | L'écran partagé en deux moitiés verticales, un seul mécanisme (partie 2.2, ligne 20) : la moitié `actif` éclairée, l'autre baissée ; l'arête est celle d'un coin de rue (6.2, `pierre`) ou un fil de nuit de 24 unités (6.11, 7.4, `nuit`) ; `tension` : le fil se resserre sans se fermer ; en grand texte, les moitiés s'empilent et l'arête devient horizontale. `attendre` et la scène `listes` l'appellent | 0,9 s | fondus, sans resserrement | 6.2, 6.11, 7.4 |
| **`pluie`** (m) : `peint`, `accalmie` | L'averse tombe d'elle-même, par rideaux, sur toute la largeur ; là où elle passe, le plan `peint` paraît sous un masque d'aquarelle ; puis l'accalmie ; la couche `pluie` sonne avec elle | 3 s | fondu du désert aux fleurs, sans pluie qui tombe | 7.4 |
| **`nuage`** : `efface`, `palit`, `reste` | L'ombre d'un nuage traverse la page de droite à gauche (35 % plus sombre), un souffle plus frais ; `efface="esquisse"`, `palit` : le dessin pâlit sans une coulure ; `reste` : le ciel reste plus sombre de 20 % (2.10), ou pas (`reste=0`, 5.4) | 4 s | ombre et effacement en fondu | 2.10, 5.4 |
| **`esquisse`** (l'ancien `vision` de 2.10) : `dessin` (`theatre`), `etape` | Un dessin à l'encre bleu nuit posé sur le ciel, tracé trait par trait (le nuage, puis la pièce aux rideaux de 6.5, un seul point vermillon : le chouchou) | 1,8 s ; 3,2 s | le dessin paraît entier | 2.10 |
| **`vignette`** : `image`, `place`, `trace`, `chaleur`, `fin`, `vers` | Une image sans cadre, bords déchirés : ses traits d'encre, puis son lavis ; `chaleur` : l'air tremble ; `fin` : elle s'évapore vers le haut | 1,5 + 1 s ; 1,5 s | fondus | 5.5 |
| **`cliche`** : `image`, `flou`, `voisin`, `grille`, `feuilleter`, `parcourir`, `video` | Dans la galerie de Julie : un cliché s'ouvre de sa vignette aux deux tiers hauts ; `voisin` : le précédent regagne la grille ; `parcourir` : la grille défile vite et remonte ; `video` : une vignette à triangle de lecture ; `flou` : flou tant que le repérage manque | 1,2 s | fondus | 5.6, 5.7 |
| **`video-lune`** : `image`, `agrandir` | La vidéo en largeur dans l'écran tenu droit, qui tremble à peine, une barre de lecture fine, arrêtée sur son dernier plan ; `agrandir` : elle grandit jusqu'au plein cadre et se fond dans `souvenir-lune` | la ballade (5.7) | fondu | 5.7, 5.8 |
| **`roule`** : `image`, `depuis` | Un fruit dessiné à l'encre (la mangue) entre par le bas, roule un peu et s'arrête, avec son bruit | 1,2 s | il paraît, immobile | 5.2 |
| **`lentilles`** : `gauche`, `droite` | Deux décors (`toits`, `periyar`) paraissent en fondu dans les deux verres des lunettes | un fondu (à régler) | pareil | 3.4 |
| **`regard`** | Le bouton « Objets » luit une fois ; la fiche des lunettes gagne « Regarder à travers » (état `regard`, partie 3.3) | une lueur (à régler) | pareil | 3.4 |
| **`pli`** : `axe`, `de`, `vers` | La moitié basse du décor se replie vers le haut autour d'un axe horizontal (y 700), le point `de` vient sur le point `vers` ; au bout, un éclat et un tintement ; au lâcher, le pli tient 1 s puis se déplie | le geste ; 1 + 1,5 s | le point glisse jusqu'à l'autre et s'y fond | 3.4 |
| **`barque`** : `depart`, `vers`, `duree` | Un trait d'encre de 40 unités et une étincelle d'or dérivent d'un point à l'autre | 60 s | immobile | 3.1 |
| **`alignement`** : `n`, `porte`, `linteau`, `fixe` | `n` étoiles glissent en une verticale qui se plie en porte (montants et linteau droit) ; un tintement montant par étoile, sans do dièse ; `fixe` : déjà formée | 2,4 s | fondu | 3.1, 3.2 |
| **`diaporama`** : `intervalles`, `jusqua`, `traverser` | Les portes de Karl passées à l'encre défilent de plus en plus vite ; `traverser` : chaque plan grandit un peu en se fondant dans le suivant | les intervalles | fondus, sans grandir | 3.2 |
| **`entree`** : `x`, `y` | La lumière emplit le trou, six rayons doux, des poussières dans le faisceau, un souffle | 1,8 s | fondu | 3.2 |
| **`battant`** (l'ancien `battements` de 3.8) : `n` | La porte dessinée s'ouvre et revient, `n` fois | 0,5 s par battement | fondu | 3.8 |
| **`jour`** (m) : `son` (`autre-cote`), `fente`, `entiere` | La lumière de l'autre côté d'une porte, dans l'entrebâillement ou par ses jours, et ce qu'on y entend, étouffé (partie 5) ; `fente` : le jour du pied de la porte s'allume d'abord ; `entiere=False` : lui seul (7.8, la porte ne s'ouvre pas). Jamais l'accord du père | 2,5 s | fondu | 1.3, 1.9, 3.8, 7.8 |
| **`perce`** : `fissure`, `depuis` | Une fente court sur le trottoir et s'ouvre en étoile (d'après *Fracture*, 19059625) ; de la fente monte la porte, le linteau en tête, jusqu'à sa place devant le soleil | 2,5 s | la porte paraît en fondu | 7.12 |
| **`chute`** : `muette` | La porte tombe d'un bloc dans la fente, sans un son | 0,4 s | disparaît en fondu | 7.15 |
| **`lanterne`** : `tracer`, `allumer`, `allumee`, `eteindre`, `brusque` | La lanterne dessinée par le moteur (six pans ajourés de cercles) : `tracer` : des points de couleur tracent ses traits autour du point orange (3 s) ; `allumer` : lueur d'or (1,5 s), ses rayons passent par les cercles ajourés ; `allumee` : allumée dès l'ouverture ; `eteindre` : elle faiblit (2,5 s) ; `brusque` : d'un coup, au choc (7.15) | 1,5 à 3 s | fondus | 3.10, 3.11, 7.12 à 7.15 |
| **`ornements`** : `calque`, `deja` | Les cercles de lumière tombent sur les panneaux sculptés et y font naître en or les traits de la porte (calque `-traits`), le bois restant massif ; `deja` : dès l'ouverture | 3,5 s | fondu | 3.10, 3.11, 7.12 à 7.15 |
| **`sceau`** : `x`, `y`, `deja`, `defaire` | L'ovale d'or du mudrā, qui reste en filigrane ; `defaire` : il se défait | à régler | fondu | 3.9, 3.10 |
| **`braises`**, **`absence`**, **`palpite`**, **`bascule`**, **`couleur`**, **`draper`**, **`happe`** | La scène `vision` : des braises au souffle ; un halo d'ombre se referme des bords vers le centre et le fleuve s'éteint (`absence`, 2,5 s) ; l'image bat une fois (`palpite`) ; le regard pivote vers le haut, tout flotte, puis le noir (`bascule`, 2 s) ; des points de couleur viennent du fond (`couleur`, 3 s ; en 6.6, la toile du couple s'irrigue d'orange et de jaune) ; un voile noir descend sur la porte (`draper`, 2 s) ; la flamme file vers « Carnet » et l'air revient (`happe`, 0,6 s) | voir ci-contre | fondus, sans bascule ni ondulation | 3.10, 3.11 (`couleur` aussi en 6.6) |
| **`halo`** : `couleur` (`ble`), `bande` | Une lumière de blé mûr, or pâle tirant sur l'ocre, depuis le haut du cadre, qui se pose sur la bande des balcons (y 600 à 1 050) | à régler | pareil | 6.3 |
| **`fumee`** : `chemin`, `duree` | Un fil de fumée gris-bleu monte seul de l'encens à la toile du couple (110 unités de large au plus) ; chaque toile frôlée s'éclaire un instant ; en haut, il se dissout dans la toile | 8 s | le fil paraît entier, immobile | 6.6 |
| **`ruban`** : `attache`, `vent`, `battement`, `immobile`, `affole` | Un ruban de satin vermillon et son paquet, rendus comme une matière (reflets, plis), jamais un trait d'encre ; `attache` : où pend le paquet ((80, 1 000) en 6.1 ; (420, 950) en 6.15 ; (1 150, 1 480) puis (1 150, 1 300) en 7.10) ; `vent` : rafales ; `battement` : un coup de vent par battement du cœur ; `immobile` : il pend, un balancement toutes les 4 à 6 s ; `affole` : il tourne, claque, se tord | la page | immobile ; `affole` : il bat plus vite sur place | 6.1, 6.15, 7.10 (et `rythme` en 7.9) |
| **`tele`** (m) | La lumière bleue d'un écran bat sur la couette, irrégulière ; la couche `tele` sonne derrière la porte | la page | une lumière bleue fixe | 7.2 |
| **`goutte`** : `x`, `y` | Une goutte de condensation coule le long du verre | 1,5 s | rien | 7.3 |
| **`morsure`** : `duree` | Le voile des paupières passe du noir bleuté au rouge sombre, puis à l'orangé ; les étoiles pâlissent | 3 s | fondu | 7.1 |
| **`buee`** | La buée monte du bas sur la vitrine | 4 s | fondu | 5.11 |

**Lumières et particules** (sur toile)

| Effet et réglages | Ce qui se voit, ce qui s'entend | Durée | Mouvement réduit | Tableaux |
|---|---|---|---|---|
| **`poussiere`** (m) : `sens` (`tombe`, `monte`, `retombe`, `envol`), `couleur` (`or`, `gris`), `petite` | Des grains d'or descendent en diagonale (`tombe`, 6 s) ou remontent parmi les étoiles (`monte`) ; gris, ils se soulèvent et retombent (`retombe`, 3 s) ou s'envolent en découvrant la couleur (`envol`, 1,5 s) ; `petite` : une poignée (1,5 s) | 1,5 à 6 s | rien | 0.2, 1.2, 1.4, 3.3, 3.6 |
| **`filantes`** (m) : `n`, `sens`, `larmes` | Des étoiles filent d'un bord à l'autre (1.1) ; `sens="bas"`, `larmes` : sept étoiles coulent lentement, avec leur traînée, comme des larmes sur une vitre (7.1) | lentement (à régler) | elles s'éteignent sur place | 1.1, 7.1 |
| **`etoiles-jour`** : `n`, `fondu` | Une seule étoile paraît près de la couronne et reste | 2 s | fondu | 7.11 |
| **`etincelles`** : `etoile` | Une gerbe d'étincelles d'or jaillit du bas (3.12) ; `etoile` : la dernière monte jusqu'en haut de la page et y reste (7.6) | à régler | la braise rougit, sans étincelle | 3.12, 7.6 |
| **`confettis`** : `n` | `n` confettis (rose, menthe, citron) s'échappent du paquet et tombent en voletant ; pas d'explosion | 2,5 s | ils paraissent posés | 5.5 |
| **`eclabousse`** : `x`, `y` | Une éclaboussure d'eau au point (les poissons au tonneau, les maquereaux qui plongent) | à régler | rien | 1.4, 1.5 |
| **`frontiere`** : `embrase`, `cercle`, `encre`, `y`, `trace` | Au bord de la lueur, un fil d'or au ras des arbres, qui brille à pleine intensité `embrase` ms (500) puis se pose (0.2) ; `cercle` : l'anneau de l'éclipse s'embrase de même (7.11) ; `encre`, `y`, `trace` : le même fil à l'encre, tracé de gauche à droite au bas de la page, sans embrasement (8.1) | embrasement 0,5 s ; tracé à régler | fondu, sans embrasement | 0.2, 7.11, 8.1 |
| **`aube`** (m) | La lueur chaude monte au bas du ciel, les étoiles s'avivent (en 3.5 : sans étoile) | 5 s | fondu | 0.2, 3.5 |
| **`course`** | Le calque du ciel tourne autour d'un point au-dessus du cadre, à la vitesse de 1.1, départ en douceur ; les arbres ne bougent pas | départ 3 s, puis continu | rien | 0.2 |
| **`sable`** | Un souffle de grains de sable fins traverse la page | à régler | rien | 7.3 |

**Texte**

| Effet et réglages | Ce qui se voit, ce qui s'entend | Durée | Mouvement réduit | Tableaux |
|---|---|---|---|---|
| **`voix`** (m) : `lettres`, `couleur` (`encre`), `eclat`, `halo`, `son`, `fin` | La voix intérieure de Darshan quand il parle à qui ne l'entend pas (partie 2.2, ligne 21) : chaque temps s'écrit lettre après lettre (environ 30 ms par lettre) ; le temps est entier dans la page dès qu'il paraît (révélé par le style, lu d'un bloc par VoiceOver) ; un toucher l'achève. 1.1 : or pâle, un éclat d'étoile par lettre, halo, l'ambiance baisse de 80 % (le vent tombe), `fin` la rétablit ; 2.3 : à l'encre, sans éclat ; 3.11 : or pâle, sans éclat, sans halo, sans rien changer au son. Jamais pour le père ; l'appel n'est pas joué par `voix`, mais par `son` (`effet="appel"`) | 30 ms par lettre | le texte paraît d'un coup | 1.1, 2.3, 3.11 |
| **`calligraphie`** : `duree` | Le paragraphe quitte le panneau et s'écrit sur le décor, au pinceau, de gauche à droite ; vrai texte, lisible par VoiceOver | `duree` | fondu | 3.7 |
| **`chiasme`** : `couleur` (vermillon), `croisee` | La phrase s'écrit sur la totalité, en traits tracés comme les vers de 3.7, en vermillon bordé de crème : deux lignes qui se croisent sur le disque noir, les deux « aime » l'un au-dessus de l'autre, le petit « et » dans l'anneau ; pendant ce temps, rien ne bouge | à régler | les deux lignes en fondu | 7.11 |
| **`essouffle`** | Les fragments d'une réplique coupés par des points de suspension paraissent l'un après l'autre, dans le même temps | 0,6 s d'écart | la réplique entière d'un coup | 5.3 |
| **`vers`** : `questions`, `boucles` | Les questions de l'hôpital, tirées du texte déjà lu, sans un mot changé, deviennent des vers en litanie ; décoratif (masqué aux lecteurs d'écran) | quelques secondes | lignes fixes | 4.2 |
| **`commande`** : `ligne` | Un carnet de serveur (papier crème, fin quadrillage) monte du bas avec une seule ligne, la phrase du livre, et un trait de crayon, puis redescend ; décoratif | 0,4 + 2,5 + 0,4 s | il paraît et disparaît | 2.7 |
| **`compte`** : `valeur`, `de`, `son` (`tic`) | Les mots s'éclairent dans la phrase et leur double se pose en haut de la page, là où le téléphone affiche l'heure : en or chez Darshan, blanc sur un bandeau graphite translucide chez Julie ; `de` : les mots précédents se défont ; `valeur=""` : il ne laisse rien ; le tic. Affichage : partie 3.3 | à régler | fondu | 2.9, 3.14, 4.7, 5.1, 5.11, 6.1, 6.3, 6.11 |
| **`assourdi`** (m) : `texte` | Le temps s'affiche atténué (opacité 0,55, flou de 0,6 px), lisible, jusqu'à `net` ; le monde passe au filtre `assourdi` de `son.js` (la salle s'efface, pas le cœur ni la ballade) | jusqu'à `net` | pareil | 2.4, 5.10 |

**Cœur, temps et interface**

| Effet et réglages | Ce qui se voit, ce qui s'entend | Durée | Mouvement réduit | Tableaux |
|---|---|---|---|---|
| **`coeur`** : `qui` (`darshan`, `julie`, `deux`, `un`), `tempo`, `continu`, `force`, `n`, `arythmie`, `vif`, `arret` | Le cœur hors d'un geste (couche `battements` de `son.js`, anneaux vermillon ou crème) : `continu` pour la page qui s'ouvre au milieu (2.3, 2.4, 6.11) ; `n` battements puis il se tait (4.6) ; `arythmie` : le cœur de Julie autour de 64, intervalles de 0,6 à 1,1 s (5.9, 6.11) ; `vif` : il s'emballe (7.9) ; `arret` : il se tait | la page | le son seul, les anneaux s'allument sans grandir | 2.3, 2.4, 2.9, 4.6, 5.9, 6.1, 6.11, 7.9 |
| **`balance`** : `points`, `fievre` | Deux lueurs crème alternent aux deux points (période 1,9 s), un balancier feutré ; `fievre` : la chamade monte à 132 | la page ; 4 s | les lueurs alternent aussi (une opacité) | 2.2 |
| **`valse`** : `mesures` | Les deux cœurs se calent trois contre deux : dans une mesure de 1,875 s, Darshan bat trois temps, Julie deux, ensemble sur le premier, à peine accentué (le 6/8 de la ballade) | 4 mesures (7,5 s) | les anneaux s'allument en mesure, sans grandir | 2.9 |
| **`ralenti`** | Tout ce qui bouge et sonne passe à la moitié de sa vitesse, sauf la ballade ; les sons de la rue se creusent | la page | pareil (le son) | 7.10 |
| **`pause`** (l'ancien `attente`) : `duree` | Rien à toucher : ni ✦, ni coin de page, pas de suite ; la page attend | 3 s | pareil | 7.5, 7.16 |
| **`interface`** : `sans`, `avec`, `voile`, `reflet`, `delai`, `duree` | `voile` : la barre à 35 %, toujours utilisable ; `sans="darshan"` : « Objets » et « Carnet » s'effacent (après les bandes, 3 s) ; `avec="darshan"` : ils reviennent, avec un reflet d'or | 1,2 s | fondu | 2.3, 2.4, 4.1, 5.2 (et 3.10, 7.10 : partie 3.3) |

**Son** (les sons eux-mêmes sont à la partie 5)

| Effet et réglages | Ce qui s'entend | Durée | Mouvement réduit | Tableaux |
|---|---|---|---|---|
| **`son`** (m) : `effet`, `n`, `boucle`, `arret`, `tenu`, `eteindre`, `retenir`, `mesure`, `ralentir`, `rythme` | Un son ponctuel avec la phrase ; `n` répétitions ; `boucle` jusqu'à `arret` ; `tenu` et `eteindre` pour l'accord du père ; `retenir` : le temps suivant n'est accepté qu'après ce délai compté depuis le départ du son (6.11 : 5 s après la seconde quinte) ; `mesure="6/8"` (le pied de 5.8), `ralentir` | selon le son | inchangé (le son ne dépend pas du mouvement) | 1.1, 1.4, 1.5, 1.9, 2.6 à 2.9, 3.5, 3.9 à 3.11, 5.2, 5.8 à 5.10, 6.3, 6.11, 6.15, 7.12, 7.13, 7.15 |
| **`ambiance`** (m ; nouveau dans les fiches) : `id`, et les réglages de `son.js` (`soir`, `nuit`, `foule`, `ete`, `densite`, `tanpura`…) | Change l'ambiance au milieu d'une page (fondu enchaîné de 2,5 et 3 s). Remplace `son` avec `ambiance=` (5.2, 5.8, 5.10, 6.12, 6.13, 6.15) ; à ajouter là où le découpage le demande sans que la fiche l'écrive : 4.3 (vers la chambre), 4.5 (le tunnel, puis le parc), 4.7 (la chambre), 7.2 (la chambre), 7.4 (l'hôpital et le fleuve, chacun de son côté), 7.8 (l'hôpital) | 3 s | inchangé | 4.3, 4.5, 4.7, 5.2, 5.8, 5.10, 6.12, 6.13, 6.15, 7.2, 7.4, 7.8 |
| **`couche`** (m) : `couche`, `oui`, `lent`, `proche` | Une couche par-dessus l'ambiance, allumée ou éteinte à une phrase : `aube` (le chœur de l'aube), `couteau` (un coup toutes les 0,7 s ; `lent`), `vent`, `bourdon`, `horloge` (`proche` : au premier plan ; sinon au fond) | jusqu'à `oui=False` | inchangé | 3.5, 3.12 à 3.14, 5.9, 6.9 à 6.11 |
| **`melodie`** (m) : `mode` (`fragment`, `mesure`, `entiere`), `notes`, `filtre` (`eau`, `assourdi`, `telephone`), `boucle` | La ballade, composée pour le livre, et elle seule : 1.7, fragment de quatre notes, `filtre="eau"` ; 2.9, les six notes de la première mesure (`notes=6`), `filtre="assourdi"`, `delai=1875` ; 5.7, entière, `filtre="telephone"`, une note ♪ bat à l'écran tant qu'elle joue ; 7.10, entière, sans filtre. En 7.9, la mesure est jouée note à note par `rythme` (`Son.note`). `notes`, `duree` et `entiere` des fiches se traduisent vers ces modes | 4 notes ; 1,875 s ; un peu plus de 15 s | inchangé | 1.7, 2.9, 5.7, 7.10 (et 7.9 par le geste) |
| **`silence`** (m) : `duree`, `garder`, `fin`, `fondu` | Tout se tait (`garder="fleuve"` : tout sauf le fleuve) ; `duree` : pour ce temps ; `fin` : les sons reviennent (1,5 s) ; `fondu` : la ville se tait en 2,5 s (7.11) | 0,5 à 4 s | inchangé | 1.8, 2.7, 6.11, 7.5, 7.11 |
| **`musicien`** : `accord_final` | Quelques mesures de guitare de rue, composées pour le livre, qui passent de droite à gauche et s'éteignent avant leur accord | 8 s | inchangé | 4.5 |

Au total : **27 mécaniques et 104 effets** (106 noms relevés dans les fiches, moins `avance`,
`lanterne-eteinte` et `envol-vue`, fondus dans `camera`, `lanterne` et `decor`, plus `ambiance`,
séparé de `son`), dont 8 mécaniques et 28 effets déjà déclarés par le moteur.

**Trois écarts entre les fiches et le moteur écrit ce matin**, à régler au report :
- `Effets.son` lit `e.son` ou `e.id`, alors que toutes les fiches écrivent `effet="…"` ; `Effets.couche`
  lit `e.id`, les fiches `couche="…"` : le moteur lit les réglages des fiches (`effet`, `couche`) ;
  `ambiance` garde `id`, comme le moteur.
- `Effets.voix` joue lui-même l'appel (`Son.effet('appel')`) : l'appel sonnerait aussi en 2.3 et en
  3.11. Il ne sonne qu'en 1.1, écrit dans la fiche par `son` avec `effet="appel"`.
- `Effets.vibration`, `Effets.battements` et `Effets.pluie` appellent les couches de `son.js` du même
  nom : d'où les renommages `tremble` (4.3) et `battant` (3.8) ; `pluie` (7.4) reste, et joue aussi
  la couche.

### 3.3 Les états de page

Apple Books isole chaque page : tout ce qui dure d'une page à l'autre est calculé par `build.py`
(`appliquer`, puis `etats`) et écrit dans la page, pour que rien ne dépende du script. Aujourd'hui,
`build.py` calcule les sacs, les portes et la magie ; la synthèse y ajoute sept états. Le calcul fait
en mémoire sur les 85 fiches réunies donne des sacs et des portes cohérents page après page.

| État | Valeurs | Ce qui le change | Pages | Ce qu'il commande à l'ouverture d'une page |
|---|---|---|---|---|
| **sacs** | les objets de Darshan, ceux de Julie | `objet+`, `objet-`, `remplacer`, `transfert`, `eclat-court`, `desenchantement` | toutes | « Objets », le sac de Julie, les fiches |
| **portes** | les portes du carnet | `porte` | dès 1.4 | la constellation |
| **pere** (nouveau) | aucune, `vue`, `allumee`, `eteinte` | `porte` avec `anneau` (3.11), `carnet` avec `allumer` (7.12), `desenchantement` (7.14) | vue de 3.11 à 7.11, allumée de 7.12 à 7.14, éteinte ensuite | l'étoile à part, au carnet et en 6.11 |
| **magie** | oui, non | `desenchantement` | non dès la fin de 7.14 | classe `sans-magie` : ni « Objets » ni « Carnet », ni halo, ni « Faire le geste » ; le ✦ est un coin de page ; « Menu » reste |
| **barre** (nouveau) | `darshan`, `julie` | `interface` avec `sans` (4.1) et `avec` (5.2) | `julie` de 4.1 (après les bandes) à 5.1 | les boutons de Darshan absents ; le bouton du sac de Julie dès 4.3 |
| **voile** (nouveau) | oui, non | `interface` avec `voile` ; `net` ; `desenchantement` | 2.3 et 2.4 (jusqu'au `net` de 2.4), 3.10 et 3.11, 7.10 à 7.14 (jusqu'au début du désenchantement) | la barre à 35 %, toujours utilisable |
| **regard** (nouveau) | offert, pas offert | l'effet `regard` (3.4), puis la présence des **lunettes** dans le sac de Darshan | de 3.4 à 6.4 (jusqu'à la clé de 6.4) et de 7.1 à l'éclat court de 7.8, sauf pendant la clé de la fin de 3.8 | « Regarder à travers » dans la fiche des lunettes ; il montre le filet d'or au pied de la porte du personnel (3.6 à 3.8), de la porte bleue (6.3, 6.4) et la fente du local (premier temps de 7.8) ; ailleurs, la page telle quelle |
| **compte** (nouveau) | la valeur affichée, ou rien | `compte` | 2.9 seul ; 3.14 ; 4.7 ; 5.1 à 5.11 ; 6.1 et 6.2 ; 6.11 (sur sa page) | le compte en haut de la page, dans la matière du monde de la page |
| **boussole** (nouveau) | aucune, `nord`, `perdue`, `eteinte` | `boussole`, `desenchantement` | `nord` de 5.3 à 6.15, `perdue` de 6.15 à 7.10, `nord` de 7.10 à 7.14, `eteinte` ensuite | l'aiguille au carnet et sur le bouton « Carnet » |
| **repliques** (nouveau) | or, clair | la virgule de 7.14 | or jusqu'à la virgule, clair ensuite | la couleur des répliques de Darshan (dictionnaire `REPLIQUES`, partie 2.2, ligne 42) |

**États locaux**, écrits à la main dans le champ `debut` de la page qui les reprend : l'horloge
(6.9 à 6.11, `proche` ou au fond) ; le froid (`refroidir` avec `instant`, 6.11 à 6.15) ; les
cicatrices des portes (`portes-vides` avec `instant`, 6.12) ; le cœur continu (2.3, 2.4, 6.11) ; le
sceau (3.10) ; la lanterne allumée, les ornements, l'accord repris sans montée (3.11, 7.13), le gel
et la caméra (7.13 à 7.15) ; la galerie ouverte (5.7) ; l'embrasure (6.14, 6.15) ; le ruban (7.10).

**Autres états** : les phrases lues, qui remplissent les fiches d'objets et de portes ; la lecture
achevée, notée sur la page « Fin » de l'édition web.

### 3.4 Les scènes écrites à la main

| Scène | Tableaux | Ce qu'elle fait que les fiches ne peuvent pas dire |
|---|---|---|
| `seuil` | 0.1 | La dédicace paraît d'elle-même, paragraphe après paragraphe (1,2 s), puis « Ouvrir » s'éclaire ; rien ne sonne avant « Ouvrir » (prototype, retouché) |
| `poeme` | 0.2 | La voûte (`ciel-poeme` et le calque `arbres-poeme`), la course des astres, la poussière, l'aube et le fil d'or (prototype, retouché) |
| `toit` | 1.1 | Le ciel de Karl, l'appel écrit lettre à lettre, la quinte à vide (prototype, retouché : l'appel ne s'appelle plus “voix du père”) |
| `tuiles` | 1.2 | La danse sur les tuiles, les lunettes (prototype, retouché : notes sans do dièse) |
| `pigeonnier` | 1.3 | Les cinq gestes de la magie, la clé, la porte et ses jours (prototype, retouché : `tourner`, `autre-cote` au lieu de l'accord) |
| `plier` | 3.4 | Le ciel, les deux étoiles et leur fil d'or, les lunettes et la clé en or, le geste vif qui fond et plie |
| `vision` | 3.10, 3.11 | La lanterne (dessin SVG du moteur), les calques de la porte, les particules, l'accord ; la page 3.11 s'ouvre avec la lanterne allumée, les ornements et l'accord |
| `listes` | 6.2 | L'écran partagé (`partage`, arête de pierre), les deux listes, `coin-de-rue` ; sans script, le texte dans l'ordre du livre |
| `rue-de-rungis` | 7.12 à 7.15 | La rue, la fente, les calques de la porte, la lanterne de 3.10, l'accord, le gel, le désenchantement, la chute ; chaque page s'ouvre sur l'état où la précédente s'arrête (l'ancien nom `porte-pere` est celui d'un décor) |
| `cloture` | 8.1 et « Fin » | Le poème sur le papier et son fil d'encre ; la page « Fin » (générique, planche des photographies, « Nouvelle lecture » qui ferme le livre par la transition `porte` à l'envers et ramène à la page de titre ; la lecture notée comme achevée) |

## 4. Les décors

Chaque décor est une image de 1 600 × 2 400 (`src/img/decors/<nom>.webp`), fabriquée par `decors.py`
depuis une photo de Karl (telle quelle, ou passée à l'encre), un dessin d'`art.py`, un fichier du
prototype ou un fond uni. Réunis, les sept chapitres emploient **115 décors** : 32 existent et restent
tels quels, 20 sont à refaire (15 dont la définition change, 5 retouches), 63 sont à fabriquer (dont
3 déjà définis dans `livre.py` mais jamais fabriqués). **24 décors** de `livre.py` ne servent plus.
Aucun nom ne reçoit deux définitions d'un chapitre à l'autre ; tous les numéros de photo sont dans
`vitrine/photos.txt` et ont leur titre (partie 8 pour ceux à ajouter à `decoupage.PHOTOS`). Aucun
visage reconnaissable de Darshan ni de Julie ; les photos où paraît quelqu'un sont signalées à Karl
par les chapitres (il a accepté *Dos*, *Fantômes* et *Repos* le 29 septembre ; les autres questions de
photos sont à la partie 10).

### 4.1 Déjà faits, gardés tels quels (32)

| Décor | Source et cadrage | Tableaux |
|---|---|---|
| `bonbons` | photo 29360492 *Bonbon vosgien*, centré | 5.6 |
| `canneles` | photo 10369144 *Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise*, centré | 5.10, 5.11 |
| `carrefour` | photo 10355467 *Piéton traversant un carrefour devant un immeuble moderne arrondi*, x 0,62 | 4.4, 7.9 |
| `chambre` | photo 10879428 *Couette blanche sur un lit devant des rideaux gris*, x 0,45 | 4.7, 5.1, 5.8, 5.9, 7.2 |
| `ciel-poeme` | fichier du prototype : `ciel-poeme.jpg` | 0.1 |
| `couloir` | photo 35375606 *Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc*, centré | 4.2, 7.4, 7.5, 7.8 |
| `dessert` | photo 29188525 *Tarte aux pommes*, centré | 5.11 |
| `deux-flous` | photo 34876053 *Silhouettes floues et abstraites de deux personnages dans une lumière chaude tamisée*, centré | 5.7 |
| `facade` | encre de 33035628 *Style haussmannien*, x 0,2 | 5.5, 6.2 |
| `feu` | encre de 22591346 *Salamandre*, x 0,55 | 7.6 |
| `fleurs` | encre de 35086239 *Champ de fleurs sauvages blanches et jaunes en pleine floraison*, centré | 7.4 |
| `graffiti` | photo 38570603 *Graffiti « je t'aime » peint en violet sur une surface orangée et rouillée*, x 0,878 ; marge 0,08 | 6.11 |
| `haussmann` | photo 33035628 *Style haussmannien*, x 0,2 | 6.2, 6.3 |
| `maison-lierre` | photo 10199772 *Vieille maison couverte de lierre aux volets de bois et femme assise devant*, x 0,22 | 2.8, 6.14, 6.15 |
| `metro` | photo 33035627 *Métro*, centré | 4.1 |
| `noir` | fond uni #020206 | 5.7 |
| `papier` | fond uni #f4ecdc | 7.16, 8.1 |
| `patere` | photo 38570569 *Détail d'une patère en bois sur un portemanteau chromé, ciré jaune en arrière-plan flou*, centré | 6.5 |
| `pave` | photo 12073837 *Ciel et pavés*, x 0,45 | 1.7 |
| `periyar` | encre de 10310851 *Ponton en bois et petite barque sur une rivière calme reflétant les nuages*, x 0,35 | 1.6, 1.7, 3.4, 7.4 |
| `periyar-soir` | encre de 10220497 *Rivière claire et peu profonde avec une passerelle et le reflet des arbres*, x 0,45 ; palette `soir` | 3.9, 3.10, 3.12 |
| `petales` | photo 11968793 *Tapis de rêves*, centré | 7.2 |
| `porte-bleue` | photo 32429264 *Porte bleue*, centré | 6.3, 6.4 |
| `porte-pigeonnier` | fichier du prototype : `porte.jpg` | 1.3 |
| `portes-4` | encre de 32429264 *Porte bleue*, centré | 3.2, 6.4 |
| `reflet-paris` | photo 38279684 *Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé*, centré | 1.7, 5.7 |
| `rocaille` | photo 10524140 *Arche de rocaille au-dessus d'une allée dans un jardin romantique*, x 0,62 ; recadrage à x 0,45 à essayer, si l'arche y gagne sans perdre l'allée | 2.8 |
| `rue-floue` | photo 16592454 *Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit*, x 0,45 | 1.7, 5.10 |
| `the` | photo 37296469 *Thé versé d'un gaiwan céladon dans une tasse en porcelaine blanche*, centré | 6.8 |
| `toits` | fichier du prototype : `ciel-nuit.jpg`, `ville.webp` | 1.1, 3.4 |
| `tuiles` | fichier du prototype : `ciel-nuit.jpg`, `ville.webp` | 1.2 |
| `verdure` | photo 32429189 *Couloir vers l'impasse*, centré | 6.13, 6.14 |

### 4.2 À refaire (20)

| Décor | Aujourd'hui | Demain, et pourquoi | Tableaux |
|---|---|---|---|
| `aluva` | fichier du prototype : `aluva.jpg` | retouche du dessin (`art.py`, `scene_aluva`) : deux kayaks jaunes rangés au mur de gauche, le coutelas sur le couvercle du tonneau, vers (938, 1 470) (chapitre 1) | 1.4 |
| `amoureux` | photo 31514847 *Amour*, x 0,32 | photo 31514847 *Amour*, x 0,1 ; à x 0,32, on ne voit que l'homme (chapitre 2) | 2.8 |
| `banquise` | photo 10644439 *Maquette de voilier prise dans la banquise sous une lumière bleue*, x 0,55 | photo 10644439 *Maquette de voilier prise dans la banquise sous une lumière bleue*, x 0,84 ; recadrage du `README` d'`outils/darshan`, repris par les chapitres 6 et 7 | 6.12, 7.3 |
| `cosmos` | dessin `cosmos_portes` | dessin `cosmos_portes` : photo 39595391 *Voie lactée et ciel étoilé à couper le souffle, en Galice*, `x=0,58`, `y=0,0`, `zoom=1,5` ; la Voie lactée de Galice cadrée, sans papier (chapitre 3) | 3.1, 3.2, 3.4 |
| `desert-jour` | dessin `desert` : `nuit=False` | dessin `desert` : `nuit=False`, rochers 35024039 *Rochers empilés formant un monument naturel sous un ciel bleu et nuageux* ; le doigt de dieu d'après les rochers de Karl (chapitre 7) | 7.3, 7.4 |
| `desert-nuit` | dessin `desert` : `nuit=True` | dessin `desert` : `nuit=True`, photo 27116682 *Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée*, rochers 35024039 *Rochers empilés formant un monument naturel sous un ciel bleu et nuageux* ; le ciel de 1.1 viré au noir, le doigt de dieu (chapitre 7) | 7.1 |
| `fenetre` | dessin `fenetre` : photo 12443176 *Toits pictaves* | dessin `fenetre` : photo 12443176 *Toits pictaves*, `voilage="ouvert"`, `flou=14` ; le voilage ouvert sur la vue floue tant que le repérage manque (chapitre 6) | 6.7, 6.13 |
| `glacon` | photo 35760712 *Verre de café glacé avec un gros glaçon à côté d'une carafe en verre*, centré | photo 35760712 *Verre de café glacé avec un gros glaçon à côté d'une carafe en verre*, y 0,72, zoom 1,8 ; le glaçon seul, la boisson floue (chapitre 7) | 7.3 |
| `lit-telephone` | photo 38256669 *Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait*, centré | recadré à x 0,2 : à x 0,5, le téléphone sort par le bord gauche (`README` d'`outils/darshan`, vérifié sur le décor) | 4.3, 5.6 |
| `local-nuit` | dessin `local_nuit` | dessin `local_kayaks` : `heure="nuit"`, `proche=True` ; la même cabane qu'en 1.9, rapprochée : serrure en (932, 1 010) (chapitres 1 et 7) | 7.8 |
| `lune` | photo 13102252 *Croissant de lune dans un ciel crépusculaire aux dégradés sereins*, x 0,62 | photo 38674516 *Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical*, centré ; la lune de 5.9, entière (chapitres 5 et 7) | 7.15 |
| `parvis` | encre de 23414381 *Vue majestueuse des flèches néogothiques de l'église Saint-André au-dessus de Niort*, x 0,55 | encre de 18890798 *Cathédrale au matin*, x 0,43 ; l'aube sur un parvis (chapitre 3 ; question de Karl sur Poitiers) | 3.5 |
| `pekin` | dessin `bibliotheque_pekin` | encre de 39670619 *Intérieur moderne d'une bibliothèque aux étagères en verre, à Gijón*, x 0,4, y 0,3, zoom 1,15 ; une photo de Karl, la bibliothèque de Gijón (décision de Karl du 29 septembre) | 3.6, 3.7, 3.8 |
| `porte-pere` | encre de 34762346 *Porte en bois rustique et sa lanterne, charme d'autrefois*, centré | dessin `porte_pere` : photo 39434691 *Un cycliste passe devant une porte verte patinée, à Irun*, `haut=0,64`, `fondu_bas=[0,5, 0,6]`, `largeur=900`, `y0=420` ; la porte d'Irun en calque transparent, sans la serrure (chapitre 3) | 3.10, 3.11 |
| `portes-1` | encre de 34762346 *Porte en bois rustique et sa lanterne, charme d'autrefois*, centré | retouche d'encre (`RETOUCHES_ENCRE`) : la brique (chapitre 3) | 3.2 |
| `portes-3` | encre de 27025911 *Le portail*, centré | éclairci seulement (`RETOUCHES_ENCRE`) ; il reste à x 0,5, pour que le fleuron en fleur de lys de la grille et le blason de la cour restent hors cadre (chapitre 3, la ligne de Karl) | 3.2 |
| `portes-5` | encre de 32429190 *Une porte*, centré | retouche d'encre (`RETOUCHES_ENCRE`) : la brique (chapitre 3) | 3.2 |
| `rer` | photo 33035652 *RER*, centré | photo 33035652 *RER*, x 0,8 ; recadrage du chapitre 4 | 4.3 |
| `rochers` | photo 35024039 *Rochers empilés formant un monument naturel sous un ciel bleu et nuageux*, centré | photo 35024039 *Rochers empilés formant un monument naturel sous un ciel bleu et nuageux*, x 0,75 ; recadrage du `README` d'`outils/darshan`, repris par le chapitre 6 | 6.12 |
| `voies` | encre de 13087478 *Chemin de terre bordé d'arbres à Moyemont, un été idyllique*, centré | encre de 39208821 *Chemin forestier en pierre sur le chemin de Saint-Jacques-de-Compostelle, près de Pau*, centré ; un chemin de pierre (chapitre 3) | 3.3 |

### 4.3 À fabriquer (63)

Les dessins sont décrits en 4.4. `ciel-appel` n'est qu'un nom de plus pour un fichier du prototype ; `voute` demande le calque `arbres-poeme.webp`.

| Décor | Source et cadrage | Tableaux |
|---|---|---|
| `banc-flou` | photo 34500385 *Repos*, x 0,3 | 7.9 |
| `champs` | photo 13020351 *Clé des champs*, centré | 6.12 |
| `ciel-appel` | fichier du prototype : `ciel-nuit.jpg` | 6.11 |
| `croque-serre` | photo 6858270 *Sandwich baguette jambon-fromage sur une assiette en céramique grise*, x 0,55, y 0,42, zoom 2,2 | 5.6 |
| `depart-loin` | dessin `depart` : `plan="loin"`, modele 36652487 *Homme traversant une passerelle verte sous des saules pleureurs ensoleillés* | 7.6 |
| `depart-proche` | dessin `depart` : `plan="proche"` | 7.6 |
| `dosa` | photo 38694025 *Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry*, x 1,0, y 1,0, zoom 2,8 | 6.10 |
| `eclipse-1` | photo 38993391 *Début d'une éclipse solaire partielle dans le ciel de Galice, en Espagne*, centré | 7.11 |
| `eclipse-2` | photo 38993497 *Le croissant s'affine pendant l'éclipse solaire en Galice*, centré | 7.11 |
| `eclipse-3` | photo 38993636 *Fin croissant de l'éclipse solaire sur un ciel qui s'assombrit*, centré | 7.11 |
| `eclipse-4` | photo 38995522 *L'éclipse solaire totale révèle la couronne solaire au-dessus de la Galice*, centré | 7.11 |
| `fantomes-rue` | photo 31641251 *Fantômes*, x 0,75 | 7.15 |
| `filet` | encre de 34956319 *Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages*, x 0,18 | 1.5, 1.6 |
| `filet-soir` | encre de 34956319 *Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages*, x 0,18 ; palette `soir` | 1.9 |
| `foule-telephone` | photo 31641251 *Fantômes*, x 0,2 | 4.5 |
| `gorge` | photo 39564914 *Gorge marine encadrée de falaises érodées à l'horizon, près de Ribadeo*, centré | 6.12 |
| `kawa` | photo 12441049 *Kawa*, x 0,8, y 1,0, zoom 2,0 | 4.3 |
| `livres-poussiere` | encre de 38712879 *Pile de livres et tasse en inox sur une étagère en bois*, x 0,0, zoom 1,4 | 3.6 |
| `local-or` | dessin `local_kayaks` : `heure="or"` | 1.9 |
| `lune-haute` | photo 38674516 *Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical*, x 0,62, y 0,28, zoom 1,8 | 5.9 |
| `lune-horizon` | photo 38674516 *Fin croissant de lune brillant dans un ciel bleu crépusculaire vertical*, x 0,62, y 1,0, zoom 1,8 | 5.9 |
| `main-julie` | photo 38694025 *Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry*, x 1,0, y 1,0, zoom 2,8 | 6.10, 6.11, 6.13 |
| `main-vide` | photo 38694025 *Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry*, x 1,0, y 1,0, zoom 2,8 | 6.13 |
| `marche-aluva` | dessin `marche_aluva` : photo 34342144 *Jardin tropical*, `x=0,0` | 5.2, 5.3, 5.4, 5.5 |
| `montre` | encre de 20315376 *L’heure d’hier*, centré | 1.9 |
| `mur-terre` | dessin `mur_terre` | 3.2 |
| `noir-lueur` | photo 39575545 *Photo de nuit abstraite et minimaliste, une seule lumière orange*, x 0,24, y 0,91, zoom 2,0 | 3.10 |
| `ossau` | photo 39212543 *Le pic du Midi d'Ossau domine des contreforts brumeux*, centré | 6.12 |
| `palmes` | encre de 34342144 *Jardin tropical*, x 0,62 | 1.5 |
| `papier-lettre` | dessin `papier_lettre` | 7.7, 7.8 |
| `patinoire` | photo 29630257 *Nuit de décembre*, centré | 5.6 |
| `periyar-crepuscule` | encre de 10220497 *Rivière claire et peu profonde avec une passerelle et le reflet des arbres*, x 0,45 ; palette `soir`, `crepuscule` | 3.12, 3.13, 3.14 |
| `placard` | dessin `placard` | 6.13, 6.14, 6.15 |
| `ponton` | encre de 10310851 *Ponton en bois et petite barque sur une rivière calme reflétant les nuages*, x 0,9 | 1.8 |
| `ponton-or` | encre de 10310851 *Ponton en bois et petite barque sur une rivière calme reflétant les nuages*, x 0,9 ; palette `heure="or"` | 1.8 |
| `porte-pere-rue` | dessin `porte_pere` : photo 39434691 *Un cycliste passe devant une porte verte patinée, à Irun*, `haut=0,64`, `fondu_bas=[0,5, 0,6]`, `largeur=900`, `y0=620` | 7.12, 7.13, 7.14, 7.15 |
| `porte-pere-rue-traits` | dessin `porte_pere` : photo 39434691 *Un cycliste passe devant une porte verte patinée, à Irun*, `haut=0,64`, `fondu_bas=[0,5, 0,6]`, `largeur=900`, `y0=620`, `traits=True` | 7.12, 7.13, 7.14, 7.15 |
| `porte-pere-traits` | dessin `porte_pere` : photo 39434691 *Un cycliste passe devant une porte verte patinée, à Irun*, `haut=0,64`, `fondu_bas=[0,5, 0,6]`, `largeur=900`, `y0=420`, `traits=True` | 3.10, 3.11 |
| `porte-personnel` | dessin `porte_battante` | 3.8 |
| `porte-trefle` | encre de 27046110 *Trèfle*, x 0,45 | 3.2 |
| `quai` | photo 11876963 *Sur les quais du Covid*, centré | 4.1 |
| `recueil` | dessin `recueil` | 3.7 |
| `rencontre` | photo 33035648 *Dos*, y 0,45 | 2.2, 2.3, 4.6, 4.7, 6.1, 6.2 |
| `rencontre-encre` | encre de 33035648 *Dos*, y 0,45 ; `masque` (polygone de la silhouette) et `bas` (0,74 à 0,97) | 2.3, 2.4 |
| `resto-table` | photo 34532663 *Table heureuse*, x 0,3 | 2.1, 2.4, 2.5, 2.6, 2.7 |
| `resto-tartare` | photo 34532663 *Table heureuse*, x 0,12, y 0,85, zoom 1,25 | 2.6 |
| `resto-telephone` | photo 34532663 *Table heureuse*, x 0,64, y 0,08, zoom 2,2 | 2.5 |
| `rue-soleil` | photo 26775590 *Coucher de soleil orange flamboyant au bout d'une rue*, x 0,37, y 0,0, zoom 1,15 | 7.9, 7.10, 7.11, 7.12, 7.13, 7.14, 7.15 |
| `salon` | dessin `fenetre` : photo 12443176 *Toits pictaves*, `voilage="ferme"` | 6.5, 6.7 |
| `seuil-lierre` | photo 10199772 *Vieille maison couverte de lierre aux volets de bois et femme assise devant*, x 0,52, y 0,6, zoom 1,5 | 2.9, 6.15 |
| `sortie` | photo 13234891 *Sortie*, x 0,47 | 4.5 |
| `souvenir-lune` | photo 38570570 *Pleine lune se levant derrière des cheminées, ciel nocturne violet*, x 0,42 ; `pleine` (à la définition de la photo) | 5.8 |
| `souvenir-lune-proche` | photo 38570570 *Pleine lune se levant derrière des cheminées, ciel nocturne violet*, x 0,42, y 0,55, zoom 2,2 | 5.8 |
| `table` | photo 38694025 *Casseroles en cuivre anciennes et table dressée dans les cuisines du château de Villandry*, x 0,95, y 1,0, zoom 2,2 | 6.11, 6.12 |
| `tableau-barque` | dessin `tableau` : photo 34342149 *Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc*, `zoom=1,08`, `centre=[780, 640]` | 6.9 |
| `tableau-ladoga` | dessin `tableau` : photo 34342149 *Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc* | 6.8, 6.9 |
| `toiles` | dessin `toiles` | 6.6 |
| `toits-soir` | photo 38674517 *Silhouettes de toits et d'antennes télé sur un ciel pastel au crépuscule*, x 0,64, y 0,0, zoom 1,35 | 2.9, 2.10, 5.1 |
| `tour-eiffel` | photo 33035632 *Tour Eiffel encadrée d'arbres verts à Paris*, centré | 1.7 |
| `velours` | dessin `velours` : `matiere=True` | 6.5 |
| `video-lune` | photo 38570570 *Pleine lune se levant derrière des cheminées, ciel nocturne violet*, centré ; `format="paysage"` | 5.7 |
| `village` | photo 39228274 *Village paisible niché dans les collines verdoyantes de Bourgogne-Franche-Comté*, centré | 4.5, 6.12 |
| `voute` | fichier du prototype : `ciel-poeme.jpg`, `arbres-poeme.webp` | 0.2 |

### 4.4 Les dessins : ce qu'ils montrent, leurs points chauds

Fonctions d'`art.py` (aujourd'hui, seules `scene_toits`, `scene_porte` et `scene_aluva` existent),
fabriquées par `decors.py` ; points en unités 1 200 × 1 800.

| Fonction | Décors | Ce qu'il montre | Points chauds |
|---|---|---|---|
| `scene_aluva` (retouche) | `aluva` | Le dessin d'Aluva du prototype (l'embrasure du local, le Periyar, les palmes, le tonneau), avec deux kayaks jaunes rangés contre le mur de gauche, d'après la photo de Karl 35086240, et le coutelas posé sur le couvercle du tonneau | coutelas vers (938, 1 470) ; moustache `[[490, 1 590], [545, 1 550], [600, 1 565], [655, 1 550], [710, 1 590]]` ; chaleur `[200, 880, 1 000, 1 500]` |
| `local_kayaks(heure, proche)` | `local-or` (1.9), `local-nuit` (7.8) | La cabane à kayaks vue du dehors : porte de planches au centre, un jour à son pied, kayaks jaunes contre le mur, une palme ; dans l'or de fin d'après-midi, ou la nuit ; `proche` : cadre rapproché sur la porte, la fente du bas noire | porte x 470 à 730, y 700 à 1 350 ; lumière depuis (600, 1 050) ; en `proche`, serrure (932, 1 010), pied de la porte vers y 1 600, lettre de (600, 1 250) vers `[720, 1 600, 200]` |
| `cosmos_portes(photo, x, y, zoom)` | `cosmos` (3.1, 3.2, 3.4) | La Voie lactée de Galice, bords bleuis, une trentaine d'étoiles-portes d'or le long de la Voie lactée ; sans papier | porte d'étoiles `[565, 865, 470, 530]` ; barque de (930, 250) vers (300, 1 150) |
| `mur_terre` | `mur-terre` (3.2) | Un mur de torchis plein cadre, lavis ocre et brun, brins de paille, deux ou trois fissures ; un trou noir aux bords effrités (en attendant la photo de Karl) | trou d'environ 220 × 180 en (600, 800) ; cible `[600, 800, 160]` |
| `recueil` | `recueil` (3.7) | Un vieux livre ouvert vu d'au-dessus, au coin d'une table de bois, pages vierges jaunies, lumière de lampe de gauche ; aucune lettre | la page de droite reçoit la calligraphie |
| `porte_battante` | `porte-personnel` (3.8) | Une porte de service à un battant, hublot rond, plaque de poussée, au bout d'une allée de rayonnages, à l'encre, sans écriteau | porte centrée en (600, 900) ; cible `[600, 900, 260]` |
| `porte_pere(photo, haut, fondu_bas, largeur, y0, traits)` | `porte-pere`, `porte-pere-traits` (3.10, 3.11), `porte-pere-rue`, `porte-pere-rue-traits` (7.12 à 7.15) | Un calque à fond transparent : le haut de la porte d'Irun (linteau, battants, octogones sculptés), 900 unités de large, lavis sombre (bois vert-bleu, pierre ocre), la pierre fondue sur ses bords, le bas fondu avant la serrure ; `traits` : les arêtes de la sculpture en or | haut du linteau à y 420 (vision) ou 620 (rue) ; lanterne du moteur 120 unités au-dessus, en (600, 300) ou (600, 500) ; `tendre` de `[600, 1 300]` vers `[600, 760]`, arrêt à y 1 000 ; `paume` `[600, 1 000, 170]` ; fente depuis (600, 1 560) |
| `marche_aluva(photo, x)` et ses calques | `marche-aluva` (5.2 à 5.5) | Le *Jardin tropical* à l'encre, retouché chaud et clair ; des auvents de toile safran, indigo délavé et rose passé ; trois ou quatre marchands en silhouettes de pinceau, sans visage ; calques transparents : les thés, le curcuma, l'encens, les jarres, les tapisseries, la mangue de `roule` | étals `[380, 860, 110]`, `[830, 880, 110]`, `[290, 1 060, 120]`, `[900, 1 080, 130]`, `[210, 700, 140]` ; paquet de confettis `[620, 960, 110]` ; façade de la vignette `[600, 760, 260]` ; rose des vents (600, 800) |
| `vision_theatre(etape)` | effet `esquisse` (2.10) | Un dessin à l'encre bleu nuit sur le ciel, fond transparent, chemins groupés par étape : le nuage, puis la pièce aux hauts rideaux noués (ceux de `fenetre`) et la petite silhouette de Julie, un seul point vermillon | entre x 200 et 1 000, y 150 et 800 |
| `fenetre(photo, voilage, flou)` | `salon` (voilage fermé : 6.5, 6.7), `fenetre` (voilage ouvert : 6.7, 6.13) | Une haute porte-fenêtre vue de l'intérieur, moulures ciselées, deux lourds rideaux de velours bleu nuit noués, un garde-corps de fer forgé, le mur de plâtre crème ; voilage fermé : un flou clair ; ouvert : la photo, floue tant que le repérage manque | rideau `[600, 760, 320]` |
| `velours(matiere)` | `velours` (6.5) | Pas un dessin : un gros plan de velours bleu nuit (#16233f), un rabat qui fait un pli, le poil rendu par le grain et la lumière rasante | cible `[600, 860, 120]` |
| `toiles` | `toiles` (6.6) | Un mur de plâtre clair ; en bas, une table basse laquée, une pierre à encre, deux bâtons d'encre, un encens ; en haut, la toile du couple (deux silhouettes sinueuses, à l'encre puis irriguées d'orange pour elle et de jaune pour lui) ; cinq toiles de lin brut autour | table vers (600, 1 040) ; toile du couple `[610, 330, 240]` ; fumée `[[600, 1 000], [545, 900], [655, 790], [560, 680], [650, 570], [610, 480]]` ; tout tient au-dessus de y 1 040 |
| `tableau(photo, zoom, centre)` | `tableau-ladoga` (6.8, 6.9), `tableau-barque` (6.9) | Un mur et un cadre peints en aplats, sans trait d'encre (le tableau d'un autre peintre) ; la photo entière, en largeur, sur 80 % de la page ; en bas à gauche, une épaule floue, jamais un visage | `tableau-barque` : zoom 1,08, centre (780, 640) |
| `placard` | `placard` (6.13 à 6.15) | Une armoire de bois sombre à une porte, panneaux moulurés ; trois états : entrouverte sur des serviettes pliées, fermée avec la clé de laiton dans la serrure, ouverte (l'ouverture transparente pour `embrasure`) | serrure (932, 680) ; ouverture x 330 à 870, y 320 à 1 040 |
| `desert(nuit, photo, rochers)` | `desert-nuit` (7.1), `desert-jour` (7.3, 7.4) | La nuit : le ciel de 27116682 viré du bleu royal au noir de velours, sans changer une étoile ; trois plans de dunes à l'encre ; à gauche, le doigt de dieu, l'empilement de rochers de 35024039. Le jour : les mêmes dunes au soleil, lavis ocre, ciel blanc de chaleur | le doigt de dieu à gauche ; le ciel sur les trois quarts du cadre |
| `depart(plan, modele)` | `depart-proche`, `depart-loin` (7.6) | De près : Darshan de dos, debout près du feu, coupé par le cadre, une silhouette d'encre sans visage. De loin : la passerelle et les saules de 36652487, au soir, et Darshan, petite silhouette qui s'éloigne | — |
| `papier_lettre` | `papier-lettre` (7.7, 7.8) | Une feuille crème, un peu de biais, presque pleine page ; autour, la nuit ; en bas à gauche, la lueur du feu | cinq lignes d'écriture |
| calque `arbres-poeme.webp` | `voute` (0.2) | La ligne d'arbres du bas de `ciel-poeme.jpg`, sur fond transparent, qui ne tourne pas avec le ciel | — |

**Dessinés par le moteur**, pas par `art.py` : la lanterne à six pans ajourés de cercles (d'après le
vitrail 34849711), la main d'or, le ruban, les paupières, la fente en étoile (d'après 19059625), la
clé en grand et sa poussière, la constellation du carnet et la rose des vents, le coin de page, la
réglette, le téléphone de Julie et sa galerie, le carnet du serveur ; les objets ont leurs dessins
dans `src/js/dessins.js` (fabriqué en parallèle).

### 4.5 Les points des gestes et des effets sur les décors existants

À relever sur l'image et à garder si un recadrage change : 1.3, la clé portée de (900, 1 500) vers
`[932, 1 010, 170]` ; 1.7, l'eau `[0, 800, 800, 1 750]` ; 1.9, le geste `[600, 1 560, 200]` ;
2.1, la caresse `[640, 700, 120]` et la zone gardée nette `[600, 360, 520]` ; 2.2, le halo (200, 330)
et la balance `[[990, 480], [1 110, 800]]` ; 3.9, la zone des deux pouces `[0, 900, 1 200, 1 500]`,
cibles `[450, 1 150, 130]` et `[750, 1 150, 130]` ; 3.14, les quatre points de la rose ; 5.7, la
vignette de la vidéo `[600, 640, 220]` ; 5.11, le hublot `[600, 900, 150]` ; 6.4, la porte bleue
`[690, 930, 180]` ; 7.3, la goutte (640, 960) et la zone gardée `[600, 900, 330]` ; 7.5, la porte
`[1 020, 1 150, 140]` ; 7.6, les braises `[600, 1 350, 260]` ; 7.9, le ruban `[1 150, 1 480]` ; 7.12,
les fenêtres qui s'éclairent (places à relever sur `rue-soleil`).

### 4.6 Devenus inutiles (24)

À retirer de `livre.DECORS` et de `src/img/decors/` (le fichier source reste là s'il sert à un autre décor).

| Décor | Photo | Retiré par le chapitre |
|---|---|---|
| `appartement` | 35136159 | 6 |
| `assiette` | 29654800 | 2 |
| `banc` | 23414383 *Un banc en bois serein entouré d'un feuillage d'automne éclatant dans un parc paisible* | 7 |
| `bibliotheque` | 27025915 *Bibliothèque de rue* | 3 |
| `cafes` | 36117556 *Cappuccino en tasse bleue, carafe de café filtre et part de gâteau aux amandes* | 4 |
| `campagne` | 13087478 *Chemin de terre bordé d'arbres à Moyemont, un été idyllique* | 4 et 6 |
| `ciel-paris` | 33035642 *Un gratte-ciel parisien s'élançant vers un ciel nuageux spectaculaire* | 2 |
| `croque` | 6858270 *Sandwich baguette jambon-fromage sur une assiette en céramique grise* | 5 (recadrée : `croque-serre`) |
| `etudiants` | 18458017 *Étudiant sur sa route* | 4 |
| `fantomes` | 31641251 *Fantômes* | 4 et 7 (recadrée : `foule-telephone`, `fantomes-rue`) |
| `lac` | 34342149 *Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc* | 6 (dans le tableau : `tableau-ladoga`) |
| `marche` | 31514837 *Marché de Niort* | 5 (`marche-aluva`) |
| `mont-saint-michel` | 34849705 *Architecture gothique de l'abbaye du Mont-Saint-Michel, arches élancées et vitraux* | 6 |
| `neon` | 39632230 | 4 et 7 (la croix rouge : vermillon refusé) |
| `phare` | 34894953 *Le phare du Loup, solitaire dans la brume marine* | 6 |
| `portes-2` | 27046156 *Porte forgée* | 3 |
| `portes-6` | 39434691 *Un cycliste passe devant une porte verte patinée, à Irun* | 3 (la porte d'Irun devient `porte-pere`) |
| `restaurant-table` | 29654800 | 2 (`resto-table`) |
| `rue-dos` | 33035648 *Dos* | 2, 4 et 6 (`rencontre`) |
| `rue-vide` | 10473138 *Rue commerçante étroite et déserte la nuit avec pavés et lanternes* | 1 et 7 |
| `seuil-nuit` | 34978560 *Entrée de maison éclairée par une seule lampe par une nuit de brouillard* | 2 et 6 (`seuil-lierre`) |
| `villandry` | 38694057 *Vue aérienne des parterres élaborés des jardins de Villandry* | 6 |
| `vitrine` | 38279517 | 2 et 4 |
| `voiture` | 39423920 *Voiture argentée garée près d'un mur, panneau bleu de virage à droite, à Irun, au Pays basque* | 7 |

### 4.7 Ce que `decors.py` doit savoir faire de plus

- `photo(…, format="paysage")` (la vidéo de 5.7) et `photo(…, pleine=True)` (`souvenir-lune`, à la
  définition de la photo, pour le travelling de 5.8) ; la bande verticale de 1 600 × 4 320 tirée de
  38674516, qui contient `lune-horizon` et `lune-haute` (le panoramique de 5.9, rien d'agrandi) ; les
  vignettes carrées de 480 px et les clichés en taille moyenne de la galerie (5.6).
- `encre(…, masque=[…], bas=(début, fin))` : un polygone qui suit une silhouette, rentré de 10 px et
  adouci, fondu au papier entre deux hauteurs (2.3) ; en attendant, l'ellipse `reserve` de la relecture.
- Palettes d'encre : `heure="or"` (miel, ambre, ciel paille, sans rose ni indigo : 1.8, 1.9) et
  `crepuscule=True` avec `soir=True` (3.12 à 3.14).
- WebP avec couche alpha pour les calques de la porte du père ; `PAPIER_DESSIN` à 0 pour `cosmos`,
  `porte-pere` et ses trois calques (s'ajoutent à `fenetre` et `papier-lettre`).
- `RETOUCHES_ENCRE` : `portes-1` et `portes-5` (la brique), `portes-3` (éclaircir), `marche-aluva`
  (chaud et clair).
- La planche de contrôle de tous les décors, puis la planche des photographies du livre pour la page
  « Fin » (partie 12).

## 5. Le son

Tout est fabriqué en direct par `src/js/son.js` (Web Audio) : aucun fichier, aucune voix, aucun air
existant ; rien ne sonne avant le premier geste ; le bouton « Son » coupe tout ; le mouvement réduit
ne change rien au son ; le son ne dit jamais seul ce que le texte ou l'image ne disent pas. La colonne
*son.js* dit ce que le fichier fabrique déjà (relu à la fin de la synthèse, le 30 septembre à 6 h) : **fait**,
**à faire**, ou **à régler** quand le son existe mais ne suit pas encore les chapitres.

### 5.1 Les motifs

| Motif | Ce qu'on entend | Où, et seulement là | son.js |
|---|---|---|---|
| **L'appel** | La quinte à vide, la, mi, la, très bas : les trois notes entrent l'une après l'autre, tiennent, s'éteignent en 6 s sans se résoudre | 1.1 (sous l'appel de Darshan), 3.5 (sous « où es-tu ? »), 6.11 (deux fois ; le temps suivant n'est accepté que 5 s après la seconde) | fait (`appel`) ; les fiches écrivent encore `question` |
| **L'accord du père** | La quinte de l'appel, dans sa voix, puis sa tierce, do dièse, qui la résout (la, do dièse, mi, la, do dièse) : pur, lumineux, tenu, égal ; il monte en 2,2 s ; il ne réagit ni à la main ni aux pensées ; aucune ambiance ne l'arrête | 3.10 (il naît avec la lanterne : la première fois du livre), 3.11 (repris sans montée, s'éteint en 3 s avec la lanterne, la note haute la dernière), 7.12 (il monte avec la lanterne ; la ville se tait, il reste seul), 7.13 (repris sans montée, s'éteint quand Darshan recule d'un demi-pas). **Aucun do dièse avant 3.10** | fait (`pere` : `montee`, `tenu`, `eteindre`, `duree`) ; mais l'effet `jour` du prototype sonne encore l'accord : à régler (ci-dessous) |
| **L'autre côté d'une porte** | Ce qu'on entend par le jour d'une porte, étouffé comme derrière des planches, qui monte en 2,5 s ; jamais l'accord du père | 1.3 (Aluva : le tanpura en do et sol, un oiseau, le fleuve), 1.9 (Paris à midi : la rumeur d'une rue, et très loin la salle du restaurant), 3.8 (le clapotis du Periyar), 7.8 (l'hôpital de nuit : un bip désaccordé, un chariot au loin) | à faire (`autre-cote`) ; `jour` le remplace aujourd'hui |
| **La ballade** | Une mélodie composée pour le livre, à 6/8, huit mesures, la mandoline et la guitare, sans voix | 1.7 (quatre notes sous l'eau), 2.9 (les six notes de la première mesure, étouffées, joue contre joue, à la deuxième mesure de la valse), 5.7 (entière, par le haut-parleur du téléphone : la seule fois où quelqu'un la chante), 7.9 (la première mesure, une croche par foulée de Julie), 7.10 (entière, claire, au baiser). **Nulle part ailleurs** (ni 5.8, ni 5.9, ni le chapitre 6, ni 7.15) | fait (couche `melodie`, modes `fragment`, `mesure`, `entiere` ; `Son.note('melodie', i)` pour 7.9) ; deux points à régler (5.5) |
| **Les cœurs** | Un double coup grave et chaud, comme entendu à travers la poitrine ; Julie a un timbre plus clair | 2.2 (la chamade, 72 puis 110, puis 132), 2.3 et 2.4 (il continue, 96), 2.9 (Darshan 96, Julie 64, calés trois contre deux), 4.6 (deux battements de Julie, 64), 5.9 (l'accord à 80 ; l'arythmie de Julie), 6.1 (Julie, vif, 100), 6.10 (deux cœurs à 80, déjà accordés), 6.11 (les deux, puis celui de Julie seul, irrégulier), 7.9 (Julie s'emballe), 7.10 (un seul cœur, de 80 à 60) | fait (couche `battements` : `tempo`, `qui`, `julie`, `duree`, `cale`, `arythmie`) ; un point à régler : l'exemple de 7.10 descend à 48, la fiche dit 60 |
| **Le tic du compte** | Un tic bref et sec, dans la matière du monde de la page (chez Julie, celui de son téléphone) | chaque fois que le compte change : 2.9, 3.14, 4.7, 5.1, 5.11, 6.1, 6.11 | à faire (`tic`) |
| **Les silences** | Le silence est un événement, jamais un trou : un vrai silence, pas un souffle | 1.1 (le vent tombe sous la voix, 80 % en 1,5 s), 1.8 (tout se tait sauf le fleuve), 2.3 (la salle s'efface, restent les cœurs), 2.7 (0,5 s), 3.10 (plus d'air : seul l'accord), 6.11 (après la seconde quinte : rien), 6.12 (presque rien), 7.5 (l'hôpital se tait 4 s), 7.11 (la ville se tait en 2,5 s, jusqu'à 7.12), 7.13 (la ville s'est tue, l'accord reste seul, puis s'éteint), 7.14 (le désenchantement, sans un son), 7.15 (après le choc, plus rien jusqu'à la fin du livre) | fait (ambiance `silence`, arrêt commun, `filtre('assourdi')`) |
| **Le choc** | Un impact grave, sourd, court (1,2 s), qu'on sent plus qu'on n'entend, avec la réverbération brève de la rue ; une seule vibration longue là où le téléphone le permet ; le dernier son du livre, jamais seul (la lanterne s'éteint sous les yeux, le texte le dit) | 7.15 | à faire (`choc`) |

### 5.2 Les ambiances

Une par page, donnée par le champ `son` du découpage (le premier mot), avec les variantes que
`son.js` sait déjà faire ; les changements au milieu d'une page passent par l'effet `ambiance`
(partie 3.2).

| Ambiance | Tableaux | Variantes et changements | son.js |
|---|---|---|---|
| `cosmos` | 0.1, 0.2, 3.1 à 3.5 | démarre au premier toucher (0.1) | fait |
| `nuit` | 1.1 à 1.3 | les toits la nuit | fait |
| `kerala` | 1.4 à 1.9, 3.9, 3.12 à 3.14, 7.6 à 7.8 | `soir` (moins d'oiseaux, des grillons) de 3.9 à 3.14 et de 7.6 à 7.8 ; le tanpura se tait en 1.8 | fait |
| `restaurant` | 2.1, 2.4 à 2.7 | étouffé en 2.4 (`filtre('assourdi')`) | fait |
| `rue` | 2.2, 2.9, 4.4 à 4.7, 5.8, 5.10, 6.1 à 6.4, 7.9 à 7.12 | `densite=1` (4.5, les « vapeurs automobiles ») ; `nuit` et la foule (5.8) ; plus calme à midi (6.3) ; une rue par oreille (6.2) ; `ete`, les martinets (7.9 à 7.12), ralentie (7.10, 7.11) ; la rue du soir (6.10, 6.15) | fait (sauf deux rues à la fois : 5.5) |
| `silence` | 2.3, 6.13, 7.13 à 7.16, 8.1 | éteint aussi les couches | fait |
| `parc` | 2.8, 6.14, 6.15 | le merle ; au loin par le placard (6.14) | fait |
| `vent` | 2.10, 7.2 | `feuilles` (7.2) ; un souffle plus frais sous l'ombre du nuage | fait |
| `bibliotheque` | 3.6 à 3.8 | `vaste` (la voûte de Gijón, pour la bibliothèque de Pékin) | fait |
| `vision` | 3.10, 3.11 | commence comme le Periyar du soir et s'éteint à l'effet `absence` ; ensuite le silence, où seul s'entend l'accord | fait |
| `metro` | 4.1, 4.3 | `rame` en 4.3 (la tôle qui vibre) | fait |
| `hopital` | 4.2, 7.5 | les bips mis en mesure (4.2) | fait |
| `chambre` | 5.1, 5.6, 5.7, 5.9 | `fenetre` (5.1 : la rue s'entrouvre) ; `nuit` | fait |
| `marche` | 5.2 à 5.5 | le tanpura | fait |
| `patisserie` | 5.11 | | fait |
| `appartement` | 6.5 à 6.12 | `horloge` de 0 à 1 (au loin en 6.5, 6.10 et à l'ouverture de 6.11 ; au premier plan en 6.9 et quand Darshan se lève en 6.11) | fait |
| `desert` | 7.1, 7.3 | `vent` qui tombe (7.1, les yeux fermés), `jour` (la chaleur, dès la morsure de 7.1 ; 7.3) | fait |
| `pluie` | 7.4 | l'averse qui s'apaise | fait |

**Changements au milieu d'une page** (effet `ambiance`) : 4.3 (après la rame, les tasses d'un café à
« On s’est vues trente minutes », puis `chambre` à « Je fais mes courses à la supérette ») ; 4.5 (à
« Je veux prendre l’air », la rue s'étouffe dans le tunnel sous le souffle du geste ; `parc` avec le
merle à l'éblouissement vert) ; 4.7 (`chambre` à « Nos rencontres ont animé mon quotidien ») ; 5.2
(`marche`, à l'ouverture) ; 5.8 (`rue` de nuit, puis `chambre`) ; 5.10 (`rue`, puis `patisserie` et sa
clochette) ; 6.12 (`silence` à l'effacement) ; 6.13 (`parc` quand l'embrasure s'ouvre) ; 6.15 (`rue`
du soir quand la porte épaisse se referme) ; 7.2 (`chambre` et la couche `tele` à « Julie fixe sa
télé ») ; 7.4 (`hopital` à gauche, la pluie puis `kerala` à droite, quand la page se partage) ; 7.8
(`hopital` de nuit quand la lettre jaillit). Les phrases citées sont les clés `extra` des fiches.

### 5.3 Les couches

| Couche | Ce qu'on entend | Tableaux | son.js |
|---|---|---|---|
| `battements` | les cœurs (5.1) | 2.2 à 2.4, 2.9, 4.6, 5.9, 6.1, 6.10, 6.11, 7.9, 7.10 | fait |
| `melodie` | la ballade (5.1) | 1.7, 2.9, 5.7, 7.9, 7.10 | fait |
| `pluie` | une pluie sur le lieu, puis l'accalmie | 7.4 | fait |
| `feu` | les flammes, des crépitements, les braises | 7.6, 7.7 | fait |
| `tele` | une télévision derrière une porte, sans une parole | 7.2 | fait |
| `vibration` | le vibreur d'un téléphone posé ; `fois` salves | 4.7 (le bouton du sac tremble trois fois), les notifications de Julie (4.3, 5.5, 5.11, 7.5) | fait |
| `aube` | le chœur de l'aube : des oiseaux lointains qui s'éveillent, sans mélodie, sans do dièse, qui monte avec la lumière | 3.5 | à faire |
| `couteau` | le couteau de Jivan sur sa planche : un coup toutes les 0,7 s, plus lent sur demande (`lent`) ; il s'arrête à la gerbe d'étincelles | 3.12 à 3.14 | à faire |
| `vent` | la brise qui se lève quand les graines partent aux quatre vents | 3.14 | à faire (ou l'ambiance `vent` par-dessus `kerala`) |
| `bourdon` | un bourdon grave et sourd, « dans un coin de la tête », éteint au clairon | 5.9 | à faire |
| `horloge` | une horloge murale, un coup par seconde, sec et boisé ; au premier plan ou au fond | 6.9 à 6.11 | fait sous la forme du réglage `horloge` de l'ambiance `appartement` : le moteur traduit la couche des fiches vers ce réglage |

### 5.4 Les effets sonores ponctuels

Joués par l'effet `son` (`effet="…"`) ou par la mécanique ou l'effet qui les porte (entre
parenthèses).

| Son | Ce qu'on entend | Tableaux | son.js |
|---|---|---|---|
| `saut` | une enjambée légère sur les tuiles | 1.2, 7.8 (`enjambees`) | fait |
| notes montantes | une note par enjambée : la, si, ré, mi, fa dièse (sans do dièse, partie 2.2, ligne 7) | 1.2 (`rythme`), 7.8 (les trois premières, `enjambees`) | à faire (le chapitre 1 les écrivait avec un do dièse) |
| `vibre`, `fonte`, `eclat`, `cle`, `tour`, `grince`, `souffle` | les sons du pigeonnier : la porte qui vibre, la fonte des lunettes, l'éclat (un souffle qui monte, un choc sourd, l'anneau du métal), la clé, le tour de clé, la porte qui grince, le souffle | 1.3 ; `eclat` aussi en 1.9 et 7.8 (court) ; `souffle` en 0.2, 1.4, 1.9, 2.9 (l'envol), 2.10, 3.2, 3.3, 3.6, 3.10, 3.11, 4.5, 6.6 | fait |
| `cran` | le déclic sec d'une serrure, au quart de tour | 1.3, 6.13, 7.8 (`tourner`) | à faire (ou `tour` du prototype) |
| `tinte` | un tintement ; montant et sans do dièse pour l'alignement des étoiles ; minuscule pour le frisson hors champ | 3.1, 3.4, 5.7, 6.4 | fait (les notes de 3.1 à régler : ré, mi, sol, la, si, ré, mi) |
| `frisson` | un éclat de verre bref : un objet change d'état | 3.2, 5.7, 6.4 | fait |
| `papier` | un froissement de papier | 3.4, 7.8 | fait |
| `declic` | le double déclic de l'obturateur, le monde de Julie | chaque entrée `obturateur` (2.2, 2.8, 4.2 à 4.6, 5.6, 5.10, 7.5, 7.9), les bandes de 2.1, 4.1, 5.1 et 6.1, `decor` avec `par="obturateur"` (2.4) ; les petits déclics du téléphone (5.6) ; 6.4 | fait |
| `bandes`, `coup` | les bandes de chapitre, le titre qui claque | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1 | fait |
| `balai`, `iris` | les trois coups de pinceau secs de la transition `encre` ; l'onde grave qui se referme de la transition `iris` | 1.2, 3.6, 5.2, 7.6 (`encre`) ; 1.3, 3.4, 3.12 (`iris`) | fait |
| `bombe`, `mousse`, `coutelas`, `poissons` | trois *pschitt* qui s'essoufflent ; un léger crissement sous le doigt ; un coup de lame sec ; les poissons qui frétillent et plongent | 1.4 ; `poissons` aussi en 1.5 | à faire |
| `tabouret` | du bois qui racle des planches | 1.5 | à faire |
| `remous` | de l'eau brassée qui suit le doigt | 1.7 (`remuer`) | à faire |
| `lin` | un froissement de toile | 1.8 | à faire |
| `tictac` | une montre de gousset, quatre battements par seconde, très doux | 1.9 | à faire |
| `balancier` | un balancier feutré, un tic à gauche, un tic à droite | 2.2 (`balance`) | à faire |
| `fourchette`, `porcelaine`, `assiettes`, `crayon` | la fourchette ; la porcelaine posée ; les assiettes qu'on débarrasse ; un trait de crayon | 2.6 ; 2.7 | à faire |
| `merle`, `pas` | le merle qui s'éloigne (`passe`) ; des pas sur le gravier, sur des plateformes, sur les pavés, sur le trottoir (au rythme des gestes), qui traînent derrière | 2.8, 4.4, 4.5, 5.2, 6.15, 7.5, 7.9 | à faire (le merle vit déjà dans l'ambiance `parc`) |
| `porte-epaisse` | du bois lourd et un loquet | 2.9, 6.15 | à faire |
| `pinceau` | un pinceau sur le papier | 3.7, 5.5, 6.6 | à faire (le `balai` de la transition `encre` en est proche) |
| `battant` | la porte battante qui bat deux fois | 3.8 | à faire |
| `herbe` | des pas dans l'herbe au bord de l'eau | 3.9 | à faire |
| `braises`, `battement`, `aspiration` | les braises qui crépitent à peine ; un battement sourd, intérieur (la vie palpite) ; une aspiration d'air brusque (l'air revient) | 3.10, 3.11 ; `braises` aussi en 7.6 | à faire |
| `etincelles` | une gerbe d'étincelles | 3.12, 7.6 | à faire |
| `graine` | une graine lancée vers un bord | 3.14 (`semer`) | à faire |
| `portes-metro` | le signal et le claquement des portes du métro | 4.1 | à faire |
| `bip` | les bips de l'hôpital qui deviennent une mesure | 4.2 | à faire |
| `reglette` | un clic par cran | 4.2 (`curseur`) | à faire |
| `clavier`, `envoi` | les touches du téléphone ; l'envoi d'un message | 4.3 (`messages`) | à faire |
| `tasse` | des tasses de café | 4.3 | à faire |
| `musicien` | quelques mesures de guitare de rue, composées pour le livre, qui passent de droite à gauche et s'éteignent avant leur accord | 4.5 | à faire |
| `notification` | le vibreur bref d'un nouvel objet chez Julie | 4.3, 5.5, 5.11, 7.5 (`objet+` avec `style="notification"`) | fait par la couche `vibration` |
| achats | le thé versé, la poudre, l'allumette, le toc de la terre cuite, l'étoffe | 5.2 (`etals`) | à faire |
| `roule` | un fruit qui roule et s'arrête | 5.2 | à faire |
| `aiguille` | le ronflement de l'aiguille affolée, puis un déclic quand elle se fixe ; une note claire à l'étoile du matin | 5.3 (`boussole`) ; 6.15 et 7.10 sans son | à faire |
| `confettis` | le paquet secoué, un froissement | 5.5 | à faire |
| `pied` | un pied qui bat les deux temps forts d'une mesure à 6/8, sans note ; il ralentit et s'efface | 5.8 | à faire |
| `clairon` | une seule note claire, tenue 3 s, dans l'aigu | 5.9, 6.3 | à faire |
| `eclair` | une nappe chaude | 5.9 | à faire |
| `clochette` | la clochette de la porte de la pâtisserie | 5.10 | à faire (elle vit dans l'ambiance `patisserie`) |
| `buee` | le crissement du doigt sur la vitre embuée | 5.11 (`essuyer`) | à faire |
| `mistral`, `satin` | le vent en rafales ; le satin du ruban, qui claque en 7.10 | 6.1, 7.10 (`ruban`) | à faire |
| `coche` | une coche au pinceau (Darshan), au stylo (Julie), chacune de son côté | 6.2 (`liste`) | à faire |
| `encre` | l'encre liquide qui s'épanouit sur la porte | 6.4 (`saigne`) | à faire |
| `porte` | une porte lourde qui s'ouvre ; une porte qui se ferme (l'embrasure) | 6.4, 6.15 | à faire |
| `velours` | le velours sous le doigt | 6.5 (`caresser`) | à faire |
| `fumee` | le souffle de la fumée ; l'eau d'un pinceau d'aquarelle quand la toile s'irrigue | 6.6 | à faire |
| `rideau` | les anneaux du rideau ; la ville qui monte d'en bas puis s'éloigne | 6.7 | à faire |
| `the` | le thé versé de haut, de plus en plus aigu | 6.8 (`verser`) | à faire |
| `eclat-brise` | l'éclat de 1.3, fêlé, puis du verre qui se brise | 6.11 | à faire |
| `fonte-visqueuse` | quelques gouttes lourdes | 6.12 (`fonte` avec `vue="dehors"`) | à faire |
| paysages | un son par paysage (six), et le claquement de chaque porte ; le grincement mat des portes vides | 6.11, 6.12 (`portes`, `portes-vides`) | à faire |
| `tissu` | la main qui se retire, un froissement | 6.13 | à faire |
| `glacon`, `glace`, `sable` | une goutte, un glaçon ; la glace qui craque ; le sable qui file | 7.3 | à faire |
| `toc` | deux coups doux à la porte | 7.5 (`toucher` avec `effet="toc"`) | à faire |
| `plume`, `frottement` | la plume sur le papier ; le papier frotté | 7.7 (`ecrire`, `effacer`) | à faire |
| `grondement`, `pierre` | un grondement sous le trottoir ; la pierre qui se fend | 7.12 | à faire |
| `choc` | voir 5.1 | 7.15 | à faire |

Au total : **18 ambiances** (dont le silence), **11 couches**, **8 motifs** et **81 effets
ponctuels**. Sont faits : les 18 ambiances, 6 couches, l'appel, l'accord du père, les cœurs, la ballade
et 16 effets ponctuels, ceux du prototype (le dix-septième, `jour`, devient `autre-cote`) ; la
notification passe par la couche `vibration`.

### 5.5 Ce qui reste à régler dans `son.js`

1. **L'effet `jour`** sonne encore l'accord de la majeur du prototype : il devient `autre-cote` (ce
   qu'on entend de l'autre côté, avec son réglage de lieu), et l'accord n'existe plus que sous le nom
   `pere` (arbitrage 1). Le prototype du pigeonnier (1.3) doit l'appeler ainsi. Décidé par
   l'arbitrage 1 ; reste à le faire.
2. **Deux ambiances à la fois**, une par oreille (6.2 : une rue par oreille ; 7.4 : l'hôpital à
   gauche, le fleuve à droite), que `son.js` laisse à la synthèse. Proposition : un réglage
   `partage` de l'ambiance (`{ gauche: 'hopital', droite: 'kerala' }`), deux ambiances placées à
   ± 0,6 (jamais tout à fait d'un seul côté : une seule oreillette ou un haut-parleur les entend
   toutes deux), la moitié `actif` à plein niveau, l'autre 9 dB plus bas, les deux baissées quand
   `actif="aucun"`. Décide : direction, avec le designer sonore.
3. **La ballade au baiser** (7.10) : `son.js` propose de la faire boucler jusqu'à l'éclipse ; le
   chapitre 7 la veut entière une fois (un peu plus de quinze secondes), “qui finit avec la page”,
   et 7.11 la dit arrêtée avec le baiser. Proposition : une fois, sans boucle ; si le lecteur reste,
   le cœur seul continue ; elle s'efface en 1,5 s si l'on tourne la page avant la fin. En 2.9,
   `son.js` joue les six notes en mode `fragment` (étouffées) : c'est bien la première mesure, celle
   que les pas rejouent en 7.9 ; le mode `mesure` sert au bouton « Faire le geste » de 7.9, qui joue
   les six foulées d'un coup. Décide : direction.
4. **Le cœur du baiser** : l'exemple de `son.js` pour 7.10 descend à 48 en 8 s ; la fiche dit de 80
   à 60 (`tempo=[80, 60]`). Suivre la fiche.
5. **Les notes qui ne doivent pas contenir de do dièse avant 3.10** : les notes montantes de 1.2
   (la, si, ré, mi, fa dièse) et les tintements de 3.1 (ré, mi, sol, la, si, ré, mi) ; la ballade ne
   s'appuie pas sur l'accord la, do dièse, mi avant 3.10.
6. **Le nom `question`** des fiches devient `appel` (1.1, 3.5, 6.11), comme dans `son.js`.
7. **Les sous-titres des sons** (chantier I4) : l'appel, l'accord du père, la ballade et le choc
   portent du sens ; chacun est doublé par l'image ou le texte (la question écrite, la lanterne, la
   vidéo, la lanterne éteinte).

## 6. Les textes d'interface

Tous dans `outils/darshan/interface.ini`, les seuls textes du livre jouable qui ne sont pas de
Karl : brefs (huit mots au plus, vérifié par programme), dans le vocabulaire du livre, sans jamais
ajouter d'histoire. **Karl les valide**, en particulier ceux qui sont nouveaux ou changés. Chaque
geste des fiches réunies a sa consigne, et aucune consigne n'est en trop : 58 gestes, 58 consignes
(28 inchangées, 27 changées, 3 nouvelles) ; 12 consignes retirées. Les consignes perdent partout
“ou touchez” : le toucher simple vaut pour tous les gestes, et le dire une fois suffit (la règle
est rappelée en tête de la rubrique).

### 6.1 `[consignes]`

| Clé | Consigne | Avant |
|---|---|---|
| 1.2.1 | Touchez en rythme pour enjamber les tuiles | inchangée |
| 1.3.1 | Touchez les lunettes pour les ôter | inchangée |
| 1.3.2 | Un geste vif : glissez vers le haut | changée ; avant : « Un geste vif : glissez vers le haut, ou touchez » |
| 1.3.3 | Portez la clé jusqu’à la serrure | changée ; avant : « Portez la clé jusqu’à la serrure, ou touchez-la » |
| 1.3.4 | Un tour de poignet : tournez la clé | changée ; avant : « Un tour de poignet : touchez la clé » |
| 1.3.5 | Poussez la porte | inchangée |
| 1.4.1 | Dessinez la moustache du doigt | changée ; avant : « Touchez le coutelas » |
| 1.7.1 | Remuez l’eau du doigt | inchangée |
| 1.8.1 | Enfilez la chemise : glissez vers le bas | inchangée |
| 1.9.1 | Ôtez les lunettes | changée ; avant : « Regardez l’heure : touchez la montre » |
| 2.1.1 | Caressez sa main du doigt, lentement | inchangée |
| 2.2.1 | Maintenez : la chamade bat | inchangée |
| 2.6.1 | Baissez les yeux : glissez vers le bas | changée ; avant : « Baissez les yeux sur l’assiette : glissez vers le bas » |
| 2.8.1 | Marchez avec elle : glissez vers le haut | changée ; avant : « Marchez : glissez vers le haut » |
| 2.9.1 | Joue contre joue : maintenez | changée ; avant : « Maintenez : joue contre joue » |
| 3.2.1 | Touchez le trou | changée ; avant : « Touchez le trou : il devient entrée » |
| 3.4.1 | Un geste vif : glissez vers le haut | changée ; avant : « Pincez l’espace à deux doigts, ou touchez » |
| 3.6.1 | Soufflez la poussière : glissez vers le haut | changée ; avant : « Soufflez la poussière : glissez sur le livre » |
| 3.8.1 | Poussez la porte | inchangée |
| 3.9.1 | Joignez les deux pouces, et gardez-les | changée ; avant : « Posez deux doigts l’un contre l’autre, et gardez-les » |
| 3.10.1 | Inspirez : maintenez. Expirez : lâchez. | inchangée |
| 3.11.1 | Tendez la main vers la porte | inchangée |
| 3.14.1 | Semez aux quatre vents | changée ; avant : « Semez aux quatre vents : touchez les quatre coins » |
| 4.2.1 | Évaluez votre douleur, de zéro à dix | inchangée |
| 4.3.1 | Pianotez pour Amélie | changée ; avant : « Écrivez à Amélie » |
| 4.4.1 | Faites le chemin : touchez en rythme | changée ; avant : « Marchez : glissez vers le haut » |
| 4.5.1 | Prenez l’air : maintenez, puis lâchez | changée ; avant : « Prenez l’air : glissez vers le haut » |
| 4.7.1 | Demandez son numéro : tendez le téléphone | changée ; avant : « Enregistrez son numéro » |
| 5.2.1 | Touchez chaque étal | inchangée |
| 5.5.1 | Touchez le paquet de confettis | changée ; avant : « Touchez les confettis » |
| 5.6.1 | Faites défiler ses photos | changée ; avant : « Faites défiler la galerie » |
| 5.7.1 | Touchez la vidéo | changée ; avant : « Touchez ses lunettes sur chaque photo » |
| 5.9.1 | Maintenez : deux cœurs battent | changée ; avant : « Tapez au rythme du second cœur » |
| 5.11.1 | Frottez la buée en petits cercles | changée ; avant : « Essuyez la buée du doigt » |
| 6.2.1 | Cochez la liste de Darshan | inchangée |
| 6.2.2 | Cochez la liste de Julie | inchangée |
| 6.4.1 | Poussez la porte | inchangée |
| 6.5.1 | Caressez le velours du doigt, lentement | changée ; avant : « Accrochez la veste : portez-la jusqu’à la patère » |
| 6.7.1 | Écartez le rideau | inchangée |
| 6.8.1 | Levez la théière : glissez vers le haut | inchangée |
| 6.10.1 | Posez la main sur la sienne | inchangée |
| 6.11.1 | Attendez, comme lui | inchangée |
| 6.11.2 | Un geste vif : glissez vers le haut | **nouvelle** |
| 6.12.1 | Ouvrez les portes | inchangée |
| 6.13.1 | Prenez sa main | inchangée |
| 6.13.2 | Un tour de poignet : tournez la clé | **nouvelle** |
| 6.15.1 | Marchez : glissez vers le haut | changée ; avant : « Traversez : glissez vers le haut » |
| 7.1.1 | Fermez les yeux : maintenez | inchangée |
| 7.5.1 | Frappez à la porte | inchangée |
| 7.6.1 | Attisez les braises : glissez vers le haut | changée ; avant : « Attisez les braises : glissez dessus » |
| 7.7.1 | Écrivez : gardez le doigt sur la feuille | changée ; avant : « Écrivez du doigt » |
| 7.7.2 | Essayez d’effacer : frottez de haut en bas | **nouvelle** |
| 7.8.1 | Un tour de poignet : tournez la clé | changée ; avant : « Essayez d’effacer » |
| 7.8.2 | Glissez la lettre sous la porte | inchangée |
| 7.9.1 | Courez : touchez en rythme | inchangée |
| 7.10.1 | Le baiser : maintenez | inchangée |
| 7.11.1 | Levez les yeux : glissez vers le haut | inchangée |
| 7.13.1 | Posez la paume sur le bois | inchangée |

### 6.2 Consignes retirées (12)

| Clé | Texte retiré | Pourquoi |
|---|---|---|
| 1.4.2 | Tracez la moustache du doigt | un seul geste à Aluva : la moustache devient 1.4.1, le coutelas vit par l'image et le son |
| 1.9.2 | Ôtez les lunettes | le geste de la montre est retiré : les lunettes deviennent 1.9.1 |
| 2.3.1 | Touchez-la : le reste s’efface | aucun geste : la voix de Darshan s'écrit lettre à lettre |
| 2.4.1 | Réveillez-vous | aucun geste : le réveil est un effet (`net`) |
| 2.7.1 | Commandez le dessert | la carte laisse la place au carnet du serveur (`commande`) ; elle revient seulement si Karl dit que Darshan commande (partie 10) |
| 3.7.1 | Tournez les pages : touchez le coin de la page | aucun geste : les vers s'écrivent au pinceau |
| 5.1.1 | Touchez la vitre | aucun geste |
| 5.8.1 | Battez la mesure du doigt | aucun geste : le pied bat seul, on l'écoute |
| 5.10.1 | Choisissez un ambassadeur | aucun geste |
| 6.5.2 | Touchez le velours, et gardez le doigt | la caresse du velours devient le seul geste, 6.5.1 (la veste à la patère est retirée) |
| 6.6.1 | Suivez le fil de fumée | la fumée monte seule |
| 7.4.1 | Faites pleuvoir : glissez vers le bas | la pluie tombe d'elle-même : Darshan regarde |

### 6.3 `[actions]` (le même geste en bouton, dans la fiche de l'objet en jeu)

| Clé | Action | Avant |
|---|---|---|
| 1.3.1 | Ôter les lunettes | inchangée |
| 1.3.2 | Faire un geste vif | inchangée |
| 1.3.3 | Porter la clé à la serrure | inchangée |
| 1.3.4 | Donner un tour de poignet | inchangée |
| 1.9.1 | Ôter les lunettes | **nouvelle** |
| 3.4.1 | Plier l’espace | **nouvelle** |
| 4.7.1 | Demander son numéro | **nouvelle** |
| 5.6.1 | Ouvrir la galerie | **nouvelle** |
| 5.7.1 | Lancer la vidéo | **nouvelle** |
| 6.11.2 | Faire un geste vif | **nouvelle** |
| 6.13.2 | Donner un tour de poignet | **nouvelle** |
| 7.8.1 | Donner un tour de poignet | **nouvelle** |
| 7.8.2 | Glisser la lettre sous la porte | inchangée |

Retirée : 1.9.2 (« Ôter les lunettes », devenue 1.9.1).

### 6.4 `[interface]` : textes nouveaux

| Clé | Texte | Où | Qui le propose |
|---|---|---|---|
| `regarder` | Regarder à travers | la fiche des lunettes, de 3.4 à 7.8 (état `regard`) | chapitre 3 |
| `cle_poussiere` | La clé est tombée en poussière. | lu aux seuls lecteurs d'écran, à la fin du désenchantement (7.14), suivi de `carnet_eteint` (« Les étoiles se sont éteintes. », qui existe) | chapitre 7 |
| `generique_auteur` | Texte et photographies : Karl Forterre | la page « Fin » | chapitre 7 |
| `generique_planche` | Les photographies du livre, sans encre | la page « Fin », au-dessus de la planche | chapitre 7 |
| `generique_couverture` | Couverture : photographie d’Arianna Jadé | la page « Fin », sous la ligne de l'auteur (la couverture, décidée par Karl le 30 septembre, n'est pas de lui) | la synthèse |

Les sous-titres des sons (chantier I4 : l'appel, l'accord du père, la ballade, le choc) demanderont
leurs textes quand ce chantier commencera ; aucun n'est proposé ici.

### 6.5 `[portes]` et `[lieux]`

- `[portes]`, un libellé changé : `appartement = La porte de la demeure → une maison de maître du
  Triangle d’or` (chapitre 6 ; avant : « La porte de la demeure → un appartement qui n’est pas rue
  Rousseau »). Les six autres libellés restent.
- `[lieux]` : retirer `desert = Désert libyque` (le chapitre 7 ne met aucune porte au désert ; le
  lieu n'aurait aucune étoile). Retirer aussi `desert` de `livre.LIEUX`.
- Rien à ajouter pour `curseur`, `contact`, `galerie`, `messages` ni `attendre` : leurs noms
  accessibles sont leurs consignes, et « Continuer » existe.

## 7. Les objets et les fiches des portes

La fiche d'un objet ou d'une porte ne cite que des phrases déjà lues, recopiées mot pour mot ;
`build.py` refuse une phrase qui n'est pas dans le livre. Vérifié par programme : les 61 phrases
d'`objets.ini` d'aujourd'hui et les 31 phrases proposées ci-dessous sont chacune **une seule fois**
dans le livre (espaces insécables ramenées à des espaces, apostrophes égalisées), de sorte que “déjà
lue” ne peut pas être ambigu.

### 7.1 `objets.ini`

| Objet | Changement | Phrase | Lue en |
|---|---|---|---|
| `[lunettes]` | ajouter, **si Karl l'accepte** (chapitre 5) | « Il met en valeur le regard couleur terre qui perce les lunettes du révolu don Juan. » | 5.7 |
| `[lunettes]` | déplacer depuis `[binocles]` : en 7.8, ce sont les lunettes (la clé redevient lunettes à la fin de 6.15) | « Ses lunettes rejoignent sa main puis la serrure du local. » | 7.8 |
| `[telephone]` | ajouter, avant la phrase de 4.3 | « Tu n’as pas de téléphone, on ne peut pas s’appeler ni s’envoyer de photos, et puis tu ne m’as encore jamais invitée chez toi. » | 2.5 |
| `[telephone]` | ajouter | « Un numéro, je me suis surprise à lui demander le sien, ce que je n’ai jamais fait. » | 4.7 |
| `[telephone]` | ajouter | « Après avoir parlé dans un premier temps devant la vitrine puis le long des trottoirs voisins, j’appris qu’il n’en avait pas et me donna rendez-vous pour le lendemain. » | 4.7 |
| `[telephone]` | ajouter | « Plus loin dans la galerie du téléphone, une vidéo montre Darshan chanter à contre-jour de la lune une ballade romantique en italien. » | 5.7 |
| `[ticket]` | ajouter | « Son imagination l’amène à considérer au travers d’une vitrine embuée un cercle rouge de framboises cerclé de boudoirs. » | 5.11 |
| `[tapisseries]` | ajouter | « Julie est mon nord, mon étoile du matin et moi, pauvre fou perdu sur l’océan, je lui tends de fades possessions matérielles sur l’autel du grand, du beau, de l’authentique affection. » | 5.3 |
| `[curcuma]` | ajouter, **seulement si Karl le veut** (le curcuma devenu curry, partie 10) | « Ensemble ils savourent ce doux goût de curry. » | 6.10 |
| `[paquet-darshan]` | **nouvel objet** : `nom = Le paquet au ruban rouge` (le même nom que celui de Julie : deux paquets, même ruban, arbitrage 8), `porteur = darshan` ; il entre sans annonce en 7.9 et quitte le sac sans annonce en 7.11 ; son dessin est celui de `paquet` | trois phrases déplacées depuis `[paquet]` : « Trente mètres plus loin, elle court à la vue de Darshan, il porte à la main un paquet au ruban rouge. » ; « Il porte à hauteur d’épaule un petit paquet et son nœud rouge qu’il expose à la volonté de Julie ainsi qu’à la brise. » ; « Le ruban de satin s’affole, il ne sait pas où donner de la tête au cœur du maelström. » | 7.9, 7.10 |
| `[paquet]` | garder « Julie prend le paquet, le tient derrière elle, puis fléchit en avant sous le poids de l’affection. » : c'est le paquet de Darshan qui passe à Julie, mais la phrase se lit dans la fiche du paquet qu'elle garde | — | 7.11 |

Rien d'autre ne change : les dix-sept objets gardent leur nom ; l'électrocardiogramme quitte le sac de
Julie sans annonce au début de 7.9 (`objet-` avec `discret`, dans la fiche de 7.9 : partie 2.2,
ligne 43) ; `[binocles]` garde ses trois autres phrases.

### 7.2 `portes.ini` (nouveau)

Proposé par le chapitre 3, rempli par le chapitre 7 et par la synthèse, au format d'`objets.ini`, à
trois conditions : les libellés restent dans `interface.ini` (`[portes]`) et `portes.ini` n'a que des
phrases ; une phrase lue avant la naissance de l'étoile peut avoir sa **clé d'entrée**, la phrase du
livre qui la fait entrer dans la fiche (écrite entre crochets après elle, et vérifiée comme elle) ;
la fiche de la porte du père n'a pas de dessin de clé, la seule. `build.py` apprend à lire ce fichier
et à remplir les fiches du carnet comme celles des objets.

```ini
[pigeonnier]
phrases =
    Après un tour de poignet, la porte se déconsolide de la charpente.
    Il ne reste qu’à la pousser pour rejoindre dans le Kerala, la ville d’Aluva.
    Notre héros affleure de la poussière en passant le seuil d’un local à kayaks.

[local-paris]
phrases =
    Il se défait de ses lunettes puis disparaît loin de la vue de Jivan qui range patiemment son filet.

[pekin]
phrases =
    Il quitte sa table avec son ouvrage sous le bras et disparaît avec nonchalance entre deux battements de porte des toilettes du personnel.
    Il sort de sa petite boite, accueilli par le clapotis du Periyar.

[pere]
phrases =
    Darshan ne connaît pas cette porte qui lui fait face.
    Il sait instantanément où elle mène.
    La clé de sa chambre est la sincérité et sa porte la réciprocité. [La solution était dans un poème, un poème…]
    Cette porte s’ouvrira à moi quand j’aurai trouvé le véritable amour.
    Le linteau s’accompagne d’une lanterne aux rayons pénétrants.
    Darshan reconnaît l’accès vers son père qu’il a vu lorsqu’il a réalisé le mudrā.
    C’est mon père qui se tient derrière ces battants, explique simplement Darshan.

[appartement]
phrases =
    La porte est ouverte.
    Elle se saisit de la poignet, ne quitte pas du regard son aimé, puis pousse la porte.

[placard]
phrases =
    Une fois le battant de la porte tiré, le placard donne sur un espace de verdure proche du parc Montsouris.
    Et là, c’est le palier de ma porte ?

[local-pharmacie]
phrases =
    L’entrebâillement au pied de la porte s’allume.
    Darshan y glisse sa déclaration.
```

Où elles se lisent : pigeonnier (1.3, 1.4) ; cabane (1.9) ; Pékin (3.8, 3.9) ; père (3.11 ; le vers lu
en 3.7 entre dans la fiche en 3.12 ; 3.13 ; 7.12 ; 7.13) ; demeure (6.4) ; placard (6.13, 6.14) ;
pharmacie (7.8). La fiche de la porte du père paraît en 3.11 avec ses deux premières phrases, le vers
en 3.12, la règle en 3.13, les phrases du chapitre 7 à leur lecture ; au désenchantement, elle
s'éteint avec les autres. La coquille « la poignet » (6.4) reste telle quelle, comme dans le livre
(partie 11).

## 8. Le découpage (`outils/darshan/decoupage.py`)

On ne modifie jamais `docs/darshan-decoupage.md` à la main : on change le programme, puis on le
relance. Vérifié par programme dans le dossier de travail : les 85 entrées `TABLEAUX` des sept
chapitres, mises à la place des 85 d'aujourd'hui (avec les titres de photos ci-dessous), passent
`decoupage.verifier()` sans une erreur.

### 8.1 Les frontières déplacées

Trois frontières bougent, toutes décidées par les chapitres, toutes à une fin de phrase, toutes
confirmées par le livre imprimé selon la direction. Chaque tableau reste entre 40 et 160 mots.

| Tableaux | Changement | Mots avant | Mots après |
|---|---|---|---|
| 2.9 et 2.10 | 2.10 commence au paragraphe 62 sur « Sur son nuage » (au lieu de « Il flirte avec Julie ») | 88 et 49 | 76 et 61 |
| 7.7 et 7.8 | « Les mots sont encrés : plus rien ne peut les effacer. » rejoint 7.7 ; 7.8 commence au paragraphe 194 sur « Darshan s’élance » | 53 et 90 | 64 et 79 |
| 7.15 et 7.16 | « Il ne reste que le Bohème et ses deux pieds ancrés dans la réalité. » rejoint 7.15 ; 7.16 commence au paragraphe 215, pour que « La terre tourne… » ait sa page (page 61 du livre imprimé) | 70 et 85 | 114 et 41 |

### 8.2 Les autres changements des entrées `TABLEAUX`

- **Titres** : 1.5 “Jivan” devient “Le vieil homme” (on ne nomme personne avant que le texte l'ait
  nommé) ; 7.8 “Encrés” devient “La fente”.
- **Mondes** : 2.3, 2.10 et 6.11 passent de “Julie” à “les deux”.
- **Lieux** : 1.8 (Aluva, le ponton), 1.9 (devant la cabane à kayaks), 2.2 (devant les vitrines), 2.3
  (le restaurant, sa rêverie), 2.10 (au-dessus des toits, au crépuscule), 4.3 (le RER ; la pause ; le
  lit), 4.4 (une rue, le carrefour), 4.5 (la foule, puis la campagne rêvée), 4.7 (la vitrine ; chez
  Julie), 5.8 (le souvenir ; la chambre de Julie), 6.6 (le salon), 6.10 et 6.11 (la table), 6.13 (le
  placard), 7.15 (rue de Rungis ; puis le ciel du soir).
- **Entrées** : même plan (“—”) pour 2.3, 2.10, 3.2, 3.10, 6.2, 6.3, 6.15, 7.4 ; `fondu` pour 3.3,
  3.5, 3.8, 6.6, 6.7, 6.8, 6.13, 7.3 ; `obturateur` pour 4.5 ; `lumiere` pour 7.12 ; et, avec les deux
  transitions nouvelles (8.3), `bandes-photo` pour 2.1 et 6.1, `bandes-julie` pour 4.1 et 5.1.
- **Photos, gestes, moments, objets, son, notes, repérages** : repris des chapitres (79 tableaux
  changent leurs photos, 58 leurs gestes, 79 leurs moments, 79 leur son, 24 leurs objets). L'état
  de 0.2, 1.1, 1.2 et 1.3 passe de “fait” à “fait en partie” (les scènes du prototype sont à
  retoucher).
- **Champs `son`**, à corriger après les chapitres : `question` devient l'appel (1.1), la “quinte à
  vide” de 3.5 aussi ; 1.9 : l'autre côté est Paris à midi ; 7.9 : ajouter la première mesure de la
  ballade, une croche par foulée ; les variantes d'ambiance (8.3).
- **Note de 1.7** : retirer “(7.12)” (la porte du père ne naît plus du pavé, partie 2.2, ligne 47).

### 8.3 Les tables du programme

- **`PHOTOS`** : ajouter les 32 titres des photos citées qui n'y sont pas : 6858270, 11876963,
  12441049, 13020351, 13234891, 18890798, 19059625, 26775590, 27046110, 29188525, 29630257, 34342144,
  34500385, 34532663, 34849711, 34876053, 35104311, 36652487, 38674516, 38674517, 38694025, 38712879,
  38993391, 38993497, 38993636, 38995522, 39208821, 39212543, 39228274, 39564914, 39575545, 39670619
  (leurs titres sont à la partie 4, sauf trois modèles de dessins : 19059625 *Fracture*, pour la fente
  de 7.12 ; 34849711 *Vitrail en flou doux aux arcs de cercle encadrés de bandes rouges*, pour la
  lanterne ; 35104311 *Gros plan d'une tête de chameau au licol de cuir près d'une couverture tissée
  colorée*, pour les tapisseries). Les 29 titres qui ne sont plus cités peuvent rester.
- **`TRANSITIONS`** : ajouter `bandes-photo` (les bandes de chapitre, dont la seconde moitié
  découvre la photo par les lames de l'obturateur, avec son double déclic) et `bandes-julie` (mêmes
  bandes, en anthracite, gris et blanc de papier photo, grain argentique au lieu de la trame, sortie
  par l'obturateur, ni or ni vermillon ; en 5.1, `palette="lilas"` et `grain="confettis"` dans
  `livre.py`). `glissement` ne sert plus qu'en 5.7.
- **`AMBIANCES`** : toutes “fait” (les 17 ambiances et le silence existent dans `son.js`) ; nouvelle
  description de `vision` : le fleuve lointain, des grillons, un souffle à chaque inspiration, des
  braises ; puis plus d'air, seul l'accord du père. Les **variantes** d'une page isolée s'écrivent
  entre parenthèses après le nom, dans le champ `son` (`kerala (soir) ; …`) : `ambiance()` rend le
  nom seul (la vérification ne change pas), une fonction `variantes()` rend le reste, que `build.py`
  écrit dans la page à côté de `data-son`. Pages : `kerala (soir)` 3.9, 3.12 à 3.14, 7.6 à 7.8 ;
  `bibliothèque (vaste)` 3.6 à 3.8 ; `métro (rame)` 4.3 ; `rue (dense)` 4.5 ; `chambre (fenêtre)`
  5.1 ; `rue (nuit)` 5.8 ; `appartement (horloge)` 6.9 ; `désert (vent)` 7.1 ; `vent (feuilles)` 7.2 ;
  `désert (jour)` 7.3 ; `rue (été)` 7.9 à 7.12.
- **`MECANIQUES`** : les 27 mécaniques de la partie 3, avec leur état (8 écrites dans le moteur,
  19 à écrire). Retirer `pincer` et `défiler` (devenue `galerie`). Aujourd'hui, 26 des 58 gestes du
  découpage sont reconnus sous une autre mécanique que celle de leur fiche (`caresser` passe pour
  `glisser`, `respirer` pour `maintenir`, `ecrire` pour `tracer`…) : revoir les mots-clés pour que
  chaque geste soit reconnu comme dans sa fiche, et ajouter à `verifier()` cette comparaison avec
  `livre.SCENES`.
- **`EFFETS_OBJETS`** : le dépôt n'a plus de veste (6.5) ; ajouter le frisson hors champ (l'étoile sur
  « Objets », 5.7 et 6.4) ; l'éclat court et l'éclat brisé ont leur description en partie 3.2.
- **`PRODUCTION`** : ajouter 0.2, 1.1, 1.2 et 1.3 au chantier D3 (sinon ils ne sont dans aucun
  chantier) ; remplacer les listes “à construire” par celles des chapitres, avec les noms de la
  partie 3 (par exemple, D3 : le carnet du serveur au lieu de la carte du restaurant ; D6 : la fumée
  qui monte seule au lieu du fil à suivre, plus de veste ; D7 : l'éclipse au lieu de Paris qui se
  vide).
- **Repérages** : donner à chaque repérage des entrées `TABLEAUX` le code de sa sortie (S1 à S9, partie
  9), pour que le document les imprime regroupés par sortie.

Puis relancer `python3 outils/darshan/decoupage.py` : il vérifie tout et réécrit
`docs/darshan-decoupage.md`.

## 9. Les repérages pour Karl

Ce que Karl pourrait photographier pour que le livre aille plus loin : les chapitres en demandent une
quarantaine, sous des numéros qui se contredisent d'un chapitre à l'autre (R1 est le déjeuner au
chapitre 2, le chai au chapitre 6, la rue de Rungis au chapitre 7). Ils sont ici regroupés par
sortie. Pour tous : **en hauteur**, **sans visage** (des mains, des pieds, des silhouettes de dos),
un modèle avec son accord écrit quand on voit un corps, aucun nom d'établissement lisible, pas de
reflet du photographe, le bas du cadre laissé libre pour le panneau de texte. En attendant chaque
photo, le livre montre l'image dite *en attendant* ; quand elle ne dit pas exactement le texte,
elle reste floue (arbitrage 7), et le flou se retire le jour où la photo arrive.

### 9.1 Les dix qui comptent le plus

| Rang | Plan | Tableaux | Sortie | En attendant |
|---|---|---|---|---|
| 1 | La main de Julie : posée, qui se retire, la table vide | 2.1, 6.10, 6.11, 6.13 | S1 | `resto-table` (*Table heureuse*) ; `main-julie`, `main-vide`, `table` (38694025 recadrée, floue) |
| 2 | La rue de Rungis au couchant de fin juin | 7.9 à 7.15 | S2 | `rue-soleil` (26775590), `fantomes-rue` |
| 3 | Le pain perdu et le tartare de saumon | 2.6, 2.7 | S1 | `resto-tartare` (un tartare de bœuf : exception posée à Karl), `resto-table` flou |
| 4 | La lettre, de la main de Karl | 7.7, 7.8 | S1 | une écriture tracée par programme sur `papier-lettre` |
| 5 | Le mur de torchis percé d'un trou | 3.2 | S4 | le dessin `mur-terre` |
| 6 | Le couloir d'un hôpital ancien, une lampe près d'une porte | 4.2, 7.4, 7.5, 7.8 | S3 | `couloir` (35375606) |
| 7 | La maison de lierre de Julie et sa porte | 2.8, 2.9, 6.14, 6.15 | S2 | `maison-lierre`, `seuil-lierre` (10199772) |
| 8 | La Charlotte derrière la vitre embuée | 5.11 | S5 | `dessert` (29188525), flou |
| 9 | Les lunettes qui changent | 5.7 | S7 | les clichés flous de la galerie |
| 10 | Le paquet au ruban rouge | 6.1, 6.15, 7.9 à 7.11, la fiche | S5 et S2 | le ruban dessiné par le moteur ; le dessin de la fiche |

### 9.2 Par sortie

**S1. À la maison, en fin de jour** (lumière chaude, puis qui tire vers le bleu ; au trépied)

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| La main de Julie, une seule séance, deux lumières, le même modèle | 2.1 : posée à plat sur une table pour deux, vue d'en face à mi-distance, le bord flou de l'assiette de Darshan au premier plan, son verre et son téléphone à l'envers derrière, lumière chaude de fin d'été ; 6.10 à 6.13 : posée à plat près d'une assiette à motifs, puis qui se retire, puis la table sans elle, même cadre, lumière de fin de jour qui tire vers le bleu, la main entre y 600 et 1 000 | 2.1 ; 6.10, 6.11, 6.13 | `resto-table` ; `main-julie`, `main-vide`, `table` | 1 |
| Un tartare de saumon aux herbes, une ou deux bouchées prises | en plongée à 45°, net, la fourchette posée | 2.6 | `resto-tartare` | 3 |
| Un pain perdu de brioche, portion menue, sur une porcelaine fleurie à fond jaune tournesol | de trois quarts, net, la table un peu vide autour : le plan qui compte le plus du chapitre 2 | 2.7 | `resto-table` flou | 3 |
| La lettre : les cinq lignes de la déclaration | à la plume, encre noire ou bleu nuit, papier crème ; numérisée à plat (600 points par pouce) ou photographiée en lumière égale | 7.7, 7.8 | écriture tracée par programme | 4 |
| Le croque-monsieur coupé en deux | deux mains qui en prennent chacune une moitié, une manche d'hiver et une manche de toile moutarde | 5.6 | `croque-serre` (6858270) | — |
| Les billes | des bonbons ronds et acidulés de toutes les couleurs dans une paume ouverte ; carré pour la vignette | 5.6 | `bonbons` | — |
| Le chai versé de haut | une théière levée à hauteur d'épaule, le filet jusqu'à une tasse de cuivre tenue par sa soucoupe, la main seule, fond sombre, lumière chaude d'intérieur | 6.8 | `the` (le gaiwan), flou | — |
| Le velours bleu nuit | un rabat de velours (col de pardessus, pouf) en gros plan, lumière rasante qui fait jouer le poil | 6.5 | le dessin `velours` | — |
| Le recueil | un vieux livre ouvert sur ses pages vierges et jaunies, vu d'au-dessus, au coin d'une table de bois, lampe à gauche, aucune lettre | 3.7 | le dessin `recueil` | — |
| La lanterne de bois ajourée de cercles, allumée dans le noir | si possible les cercles de lumière qu'elle jette sur un mur ou une porte de bois ; modèle du dessin | 3.10, 3.11, 7.12 à 7.15 | la lanterne dessinée d'après le vitrail 34849711 | — |
| Une porte de planches, la nuit | une porte de cabane ou d'abri de jardin, de face, une lumière allumée derrière, la fente du bas éclairée, la serrure à mi-hauteur ; modèle du dessin | 7.8 (et 1.9) | le dessin `local_kayaks` | — |
| La clé de laiton, facultative | une vieille clé un peu oxydée dans la serrure d'une armoire ancienne, porte entrouverte sur des serviettes pliées ; modèle | 6.13 | le dessin `placard` | — |

**S2. Paris 13e et 14e, un soir d'été** (fin juin, au trépied, du trottoir)

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| La rue de Rungis dans l'axe du couchant | façades de pierre de taille et balcons filants, un trottoir de dalles au premier plan, une voiture de couleur neutre garée à droite, plaque hors champ, la mesure prise sur le ciel ; fin juin, le soleil se couche vers 300° : une rue du 13e orientée ainsi, ou le jour où il s'aligne sur la rue de Rungis | 7.9 à 7.15 | `rue-soleil` | 2 |
| Les souliers et la robe orange | en plongée depuis un genou à terre : les dalles et, en haut du cadre, deux souliers de femme et l'ourlet d'une robe orange ; rien au-dessus du genou | 7.11 | `rue-soleil`, que le regard remonte | 2 |
| Les passants filés | sur le même trottoir, en pose lente (un quart de seconde) | 7.15 | `fantomes-rue` | 2 |
| La main qui tend le paquet | la main d'un homme, un genou au sol, qui tend le paquet au ruban rouge contre le soleil couchant | 7.10 | le ruban dessiné sur `rue-soleil` | 2 |
| La maison de Julie | une petite maison beige couverte de lierre, près du parc Montsouris (square de Montsouris, villa Seurat), en fin d'après-midi : la façade, puis la porte en plan serré, personne devant | 2.8, 2.9, 6.14 | `maison-lierre`, `seuil-lierre` | 7 |
| La porte de Julie au crépuscule, le paquet à la main | la même porte, le paquet tenu le long du corps | 6.15 | `seuil-lierre` sous `refroidir` | 7 et 10 |
| Le pont de rocaille de Montsouris | une arche de rocaille au-dessus d'une allée, sa barrière de branches nouées, fin d'été ; un merle, si la chance le veut ; seulement si l'arche d'*Amour* n'a pas été prise là | 2.8 | `rocaille`, `amoureux` | — |

**S3. À l'hôpital** (avec l'accord de l'établissement ; peut-être Cochin, question de la partie 10)

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| Le couloir | un couloir de bâtiment ancien (voûtes ou carrelage, portes battantes), vide, une blouse à une patère, une lampe suspendue près d'une porte (des néons nus effaceraient la rime avec la lanterne du père) ; sans patient ni nom lisible | 4.2, 7.4, 7.5, 7.8 | `couloir` | 6 |
| Des brancards, facultatif | dans le couloir, sans patient ni visage | 7.4 | `couloir` | — |

**S4. La campagne, en Poitou et en Vendée**

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| Le mur de torchis | terre et paille, percé d'un trou grand comme une tête, sans rien de moderne autour (la bourrine du Bois-Juquaud, à Saint-Hilaire-de-Riez) ; de face, le trou un peu au-dessus du milieu, large d'un cinquième de l'image ; deux vues sur pied : le trou noir, puis la lumière qui passe | 3.2 | le dessin `mur-terre` | 5 |
| Les mains de Jivan | des mains âgées qui coupent des légumes sur une planche, au bord de l'eau, lumière du soir, les mains au milieu | 3.12 | `periyar-soir` | — |
| La coccinelle, facultative | une coccinelle dans la mousse, sous des pétales fanés ; macro, lumière d'automne | 7.2 | `petales` | — |

**S5. À la pâtisserie, un soir** (lumière chaude de vitrine, sur pied, sans reflet du photographe)

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| La Charlotte aux framboises derrière la vitre | un cercle de framboises, des boudoirs, trois feuilles de sucre, sans ruban ; trois vues au même cadre : la vitre embuée, la même avec un rond essuyé au milieu, la vitre nette | 5.11 | `dessert`, flou | 8 |
| La vitrine des ambassadeurs | éclairs au chocolat et au café, un baba au rhum, cadre serré sur trois ou quatre gâteaux, faible profondeur de champ | 5.10 | `canneles`, flou | — |
| Le paquet au ruban rouge | une petite boîte de pâtisserie nouée d'un ruban de satin vermillon : tenue à bout de bras dans une rue, le ruban qui vole, en plein jour ; seule, sur fond neutre, pour la fiche | 6.1, la fiche | le ruban dessiné sur `rencontre` | 10 |

**S6. Un restaurant du sud de l'Inde** (par exemple rue du Faubourg-Saint-Denis, avec l'accord de la maison)

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| Le dosa | une galette fine et dorée au centre d'une assiette à motifs, deux fourchettes, vue plongeante, lumière de fin de jour | 6.10 | `dosa`, flou | — |
| La porte battante de la cuisine | à hublot rond ou plaque de poussée, sans écriteau lisible, de face ; fermée, puis en plein battement, un peu floue, la lumière dans l'entrebâillement | 3.8 | le dessin `porte_battante` | — |

**S7. Paris, l'après-midi**

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| La vitrine de la rencontre | une friperie (rue Jean-Jacques-Rousseau si elle s'y prête), une robe volantée sur un mannequin et des guêtres ; lumière rasante ; (a) une jeune femme aux longs cheveux châtains, de dos, à quelques pas ; (b) la vitrine de face et, dans la glace, le reflet flou d'un homme qui s'approche | 2.2, 4.6 ; 4.7 | `rencontre` (*Dos*) | — |
| Les chaussures à plateforme | vue plongeante sur ses propres pieds en marche, chaussures claires sur un trottoir, un pan de chemisier en haut du cadre ; quelques vues au fil des pas | 4.4 | `carrefour` | — |
| Les lunettes qui changent | les lunettes fumées, les binocles ronds et une paire en écaille, chacune à un lieu de leurs sorties (une table de café, un banc, le parapet d'un quai), même lumière douce, sans personne ; carrés pour les vignettes | 5.7 | les clichés flous | 9 |
| Le chevalet sur les quais | de biais ou de dos, une toile commencée, une boîte de tubes ouverte sur le parapet, la Seine derrière, fin d'après-midi ; au plus une main | 5.7 | un cliché flou | — |
| La vue d'un étage | une rue haussmannienne vue d'une fenêtre de premier ou de deuxième étage (chez un ami, dans le 8e), le garde-corps au premier plan ; pas un panorama de toits | 6.7 | `fenetre` (*Toits pictaves*), flou | — |

**S8. La Seine, la nuit** : un bateau-mouche qui passe, ses lumières reflétées dans l'eau, en pose
longue (une à deux secondes), l'eau aux deux tiers, quai de la Tournelle ou pont de l'Archevêché
(1.7 ; en attendant, `reflet-paris` et `rue-floue`).

**S9. La côte atlantique** (Charente-Maritime ; un port, ou un ponton du Marais poitevin)

| Plan | Lumière et cadre | Tableaux | En attendant | Rang |
|---|---|---|---|---|
| Un carrelet au couchant | une cabane de pêche sur pilotis et son grand filet carré relevé, en contre-jour doux, le filet dans le tiers haut (Fouras, Port-des-Barques, Saint-Palais-sur-Mer, Esnandes) | 1.9 | `filet-soir` | — |
| Le tabouret rafistolé sur un ponton | vu d'un peu au-dessus, à hauteur d'homme assis ; le matin, lumière rasante, un filet où brillent trois maquereaux ; en fin d'après-midi, dans la lumière d'or, le tabouret vide | 1.5 ; 1.8 | `filet`, `ponton`, `ponton-or` | — |

**S10. L'hiver** : la patinoire au ras de la glace, une lame qui fend la glace dans un virage, des
copeaux, des traces courbes, des lumières d'hiver floues au fond (5.6 ; en attendant, `patinoire`,
*Nuit de décembre*).

**Facultatifs, si l'occasion se présente** : une silhouette qui chante devant la pleine lune qui se
lève, de loin, au long téléobjectif (5.7 ; la cheminée de 38570570 fait déjà ce rôle) ; un mojito
(7.3 ; il remplacerait le café glacé de `glacon`).

## 10. Les questions pour Karl

Les questions des sept chapitres, réunies et dédoublonnées, classées par importance. Chacune a son
contexte en une phrase et la proposition de l'équipe : si Karl l'accepte, il n'a rien d'autre à
faire. Retirées parce que tranchées : la couverture (30 septembre) ; *Dos*, *Fantômes* et
*Repos* ; Pékin à Gijón ; le portrait 38536478 ; « nouvelle » ; l'ISBN (29 septembre) ; les trois
frontières (confirmées par le livre imprimé, selon la direction).

### 10.1 Premier rang : ce qui décide de la fabrication, ou change ce que Karl a vu

1. **Un essai dans Apple Books** (1.3, 6.13, 7.8). Apple Books pourrait prendre pour un tour de page
   le quart de tour de la clé (un geste en arc) ou la clé portée en diagonale. *Proposition* : sur son
   iPhone, avec l'EPUB du prototype, Karl fait glisser la clé jusqu'à la serrure et la tourne ; si la
   page tourne, la clé tourne quand on glisse vers le bas sur elle, et elle se porte à la verticale.
2. **La porte du père** (3.10, 3.11, 7.12 à 7.15). Sa porte verte d'Irun (39434691), rendue en traits
   d'or et en lavis, sans le cycliste ni la serrure, remplace la porte rustique à lanterne (34762346) ;
   elle a ce que dit le texte : deux battants, un bois couvert de motifs, un cadre de pierre, un
   linteau. La couverture montre une autre porte sculptée. *Proposition* : la porte d'Irun dans le
   livre jouable ; la couverture reste l'image de l'édition.
3. **Le désenchantement** (7.14). La magie meurt à la virgule de « En faisant de moi un mortel, », la
   seule coupe du livre au milieu d'une phrase : neuf secondes sans un son, la clé en poussière d'or,
   les étoiles du carnet qui s'éteignent dans la page, les boutons qui disparaissent ; aux seuls
   lecteurs d'écran, à la fin : « La clé est tombée en poussière. » puis « Les étoiles se sont
   éteintes. ». *Proposition* : tel quel.
4. **Le son du père** (1.1, 1.2, 1.3, 3.5, 6.11, 7.12 à 7.15). Le père ne répond jamais : une quinte à
   vide sous l'appel (1.1, 3.5, deux fois en 6.11), son accord seulement avec sa porte, et le choc de
   7.15 comme seul signe, après lequel le livre se tait jusqu'à la fin, même sur « la divine mélodie
   des aléas de la vie ». Cela change une chose que Karl a entendue au prototype : les jours du
   pigeonnier ne sonnent plus l'accord, mais Aluva (le tanpura, un oiseau, le fleuve). Les notes
   nouvelles des tuiles (1.2) n'ont pas de do dièse, la tierce que le père garde pour sa porte ; l'aube
   de 3.5 a un chœur d'oiseaux lointain. *Proposition* : adopter le tout.
5. **Le tartare de bœuf** (2.1 à 2.7). La seule table de Karl, *Table heureuse*, montre un tartare de
   bœuf (parmesan, pesto, frites) quand le livre dit saumon, jusqu'en gros plan en 2.6 ; Karl l'a
   marquée “séparation”. *Proposition* : l'accepter en attendant la séance du déjeuner (S1 : le
   tartare de saumon, le pain perdu, la main) ; s'il refuse, cette séance passe avant la fabrication.
6. **La lettre, de sa main** (7.7). Le lecteur fait couler la lettre sous son doigt, ligne après ligne.
   *Proposition* : Karl écrit les cinq lignes à la plume sur un papier crème (S1) ; à défaut, une
   écriture tracée par programme.
7. **Le compte à rebours et la boussole** (tout le livre). Les délais du livre (de « dimanche
   prochain » en 2.9 à « Dix longues secondes » en 6.11) s'écrivent en haut de la page, là où le
   téléphone affiche l'heure, en or chez Darshan, en blanc chez Julie ; la boussole de 5.3 vit au
   carnet : nord, perdue en 6.15, retrouvée en 7.10, éteinte en 7.14. *Proposition* : adopter.
8. **« Regarder à travers »** (3.4 à 7.8). Dans la fiche des lunettes, un bouton qui montre, au pied de
   trois portes, un filet d'or : où mène le passage ; jamais nécessaire. *Proposition* : adopter ce
   texte d'interface, et le faire naître en 3.4, sur « Elles portent sa vue plus loin ».
9. **L'éclipse de Galice** (7.11). « Le contact de leurs corps éclipse tout Paris. » se joue sur les
   quatre photos de son éclipse du 12 août 2026, Julie vue comme le soleil (jamais son visage), la
   phrase « Julie aime Darshan et Darshan aime Julie » écrite en vermillon dans la nuit de
   l'éclipse. *Proposition* : adopter.
10. **L'attente de 6.11**. Pendant dix vraies secondes, rien ne se passe ; la main seule de Julie à
    côté du ciel de Darshan ; « Continuer » paraît au bout de trois secondes et presse les secondes
    restantes (l'horloge accélère) sans jamais les couper. *Proposition* : adopter.
11. **La ballade** (1.7, 2.9, 5.7, 7.9, 7.10). Un air composé pour le livre, à 6/8, sans voix, entier
    une seule fois avant le baiser, dans la vidéo de 5.7. *Proposition* : le designer sonore la
    compose ; si Karl a un air en tête, qu'il le fredonne pour qu'on le transcrive ; il l'écoute sur
    le banc d'essai.

### 10.2 Deuxième rang : des lectures du texte

12. **Qui dit « Il est incroyable. » ?** (5.8) Le livre compose ce paragraphe en romain, alors que les
    pensées de Julie sont en italique. *Proposition* : Julie qui se dispute avec elle-même, les deux
    voix à la même place, l'une sans couleur, l'autre en italique ; ou bien une autre voix (Amélie) ?
13. **Qui commande le dessert, et qui pense « Si j’avais su » ?** (2.7) Le livre ne le dit pas.
    *Proposition* : la commande paraît sur le carnet du serveur sans dire qui l'a passée, et la pensée
    reste sans couleur ; si c'est Darshan qui commande, le lecteur passe la commande sur une carte (un
    geste de plus).
14. **« Tu es là ! » écrit lettre à lettre** (3.11). L'écriture lettre à lettre devient la signature de
    la voix intérieure de Darshan quand il parle à qui ne l'entend pas (1.1, 2.3, 3.11), sans éclat ni
    son en 3.11. *Proposition* : adopter ; les pensées de Julie restent dans l'italique du livre.
15. **Les vers au pinceau** (3.7). *Proposition* : en français, sans une lettre de sanskrit inventée ;
    Karl choisit une écriture de pinceau particulière, ou l'Amiri du livre, tracée.
16. **Jivan** (1.5). Le vieil homme n'est nommé qu'à la dernière phrase du chapitre 1, et la page 1.5
    s'appelle “Le vieil homme” ; son nom, जीवन, veut dire la vie. *Proposition* : ne le nommer
    nulle part avant le texte ; Karl dit si le sens du nom est voulu (rien ne l'affiche).
17. **La dédicace** (0.1). *Proposition* : lue en silence sur la page de titre, sans aucun signe de la
    fiction.
18. **Le théâtre** (2.10). *Proposition* : une esquisse sur le ciel (une fenêtre entre deux hauts
    rideaux, ceux de l'appartement de 6.5, deux silhouettes), pour « le théâtre du début de leur
    relation ».
19. **La fenêtre de 6.13** (« Si cette fenêtre ne te convainc pas »). *Proposition* : c'est celle de
    6.7, montrée une seconde à l'ouverture de la page ; si Karl pensait à autre chose, ce plan tombe.
20. **Le couple de la toile** (6.6). *Proposition* : l'orange de la robe de Julie (7.11) et le jaune du
    gilet de Darshan (5.6), que la couverture confirme.
21. **« Le lac Ladoga » de Théodore Banzy** (6.8, 6.9). *Proposition* : sa photo de la barque vide, en
    noir et blanc, dans le tableau ; Karl dit si Banzy a un modèle à honorer ou à éviter (Banksy ?) et
    si le lac de Leningrad assiégée est voulu (un tableau d'hiver dirait alors mieux le titre).
22. **« l’accord tacite »** (4.5), juste après les pianistes et les guitaristes : le jeu de mots est-il
    voulu ? *Proposition* : la guitare de rue s'arrête avant son accord et s'appuie dessus.
23. **Le doigt de dieu** (7.1). *Proposition* : l'empilement de rochers de 35024039, déjà vu en 6.12 ;
    Karl dit s'il pensait à un lieu, et s'il faut “Dieu” (annexe A).
24. **« Y aurait-il un successeur »** (7.16). *Proposition* : ne rien illustrer ; « Nouvelle lecture »
    y répond ; Karl dit s'il pensait à une suite, à un autre immortel, à un enfant.
25. **Les confettis** ne servent jamais. *Proposition* : ils restent au sac, fête qui n'aura pas lieu.
26. **Le générique** (page « Fin »). *Proposition* : « Texte et photographies : Karl Forterre », le
    crédit « Couverture : photographie d’Arianna Jadé » (le livre imprimé crédite déjà sa photographe),
    la planche de ses photos sans encre ; Karl dit si les vignettes mènent à leur page sur
    photos.karlforterre.fr, et si la dernière image est une photo de lui, choisie par lui, plutôt que la
    lune de 5.9.

### 10.3 Troisième rang : ses photos

27. **Le Kerala** (1.4 à 1.9, 3.9 à 3.14, 5.2 à 5.5, 7.6 à 7.8). Aucune des 919 photos n'a été prise en
    Inde. *Proposition* : l'encre, les palmes du *Jardin tropical* (34342144, aussi pour le marché),
    des plans serrés et des dessins ; si Karl a des photos d'Inde, même non publiées, les mettre sur
    Pexels donnerait à Aluva sa vraie lumière.
28. **Paris dans le fleuve** (1.7). La tour Eiffel, puis trois photos prises ailleurs qu'à Paris (dont
    38279684, à Niort), noyées dans un reflet. *Proposition* : acceptable, puisque ce sont des reflets.
29. **Julie peinte** (2.3). *Dos* passe à l'encre et seule Julie reste ; la rue et la passante
    retournent au papier. *Proposition* : adopter cette retouche.
30. ***Amour* et l'arche** (2.8). *Amour* (prise à Niort, la joue de la femme en profil perdu) pour
    Montsouris ; et où l'arche de rocaille a-t-elle été prise ? *Proposition* : les garder en attendant
    le pont de Montsouris (S2).
31. **Le parvis** (3.5). *Proposition* : la cathédrale de Poitiers au matin pour « je vis donc entre les
    parvis ».
32. **La nuit à une seule lumière** (3.10, 39575545), publiée avec ses photos de Galice : où l'a-t-il
    prise ? *Proposition* : elle ouvre la vision telle quelle.
33. ***Sur les quais du Covid*** (4.1) : la trace de la pandémie le gêne-t-elle ? *Proposition* : la
    garder pour des journées toutes pareilles.
34. **L'hôpital** (4.2, 7.4, 7.5, 7.8). Le « bicentenaire », le campus, le RER : Cochin, la Cité
    universitaire, la gare du RER B ? *Proposition* : si oui, les repérages sont tout trouvés (S3).
35. **Villandry et le curry** (6.10 à 6.12). La cuisine de Villandry en plans serrés pour la table ; le
    curcuma d'Aluva devenu le curry du dosa. *Proposition* : adopter ; Karl dit si « Ensemble ils
    savourent ce doux goût de curry. » entre dans la fiche du curcuma.
36. **Les paysages de 6.12**. *Proposition* : la gorge de Ribadeo et le pic du Midi d'Ossau remplacent
    l'abbaye du Mont-Saint-Michel (une église juste après l'appel au père) et le phare du Loup (son nom
    est écrit sur la tour).
37. **La rue au couchant** (7.9 à 7.15, 26775590) : où l'a-t-il prise ? *Proposition* : l'image
    d'attente de la rue de Rungis (S2).

### 10.4 Quatrième rang : la mise en scène

38. **Le poème** (0.2). *Proposition* : un fil d'or qui s'embrase un instant au dernier vers, et les
    astres qui se mettent en marche derrière les arbres.
39. **L'heure à Aluva** (1.4 à 1.9). Nuit à Paris, donc matin au Kerala à l'arrivée ; la lumière d'or
    au départ, et Paris à midi de l'autre côté de la porte. *Proposition* : est-ce ainsi que Karl voit
    la journée ?
40. **La chemise** (1.8). *Proposition* : enfilée par la tête (le lin passe devant les yeux) ; ou
    boutonnée ?
41. **Les gestes retirés** : le coutelas (1.4) et la montre (1.9). *Proposition* : les retirer, pour
    laisser respirer l'arrivée et l'adieu.
42. **Les petits plaisirs** : le clin d'œil d'encre (1.6), la vibration du téléphone (1.3), les notes
    qui montent sur les tuiles (1.2). *Proposition* : les garder.

### 10.5 Deux questions pratiques

43. **Les repérages** : lesquels Karl peut-il faire, et dans quel ordre ? *Proposition* : la partie 9,
    par sortie ; d'abord la main de Julie et la rue de Rungis.
44. **Les coquilles** : le livre jouable affiche le texte tel quel tant que Karl n'a pas tranché ;
    celles de l'annexe A, et quelques candidates relevées par la synthèse (partie 11). *Proposition* :
    les corriger avant la fabrication ; les chevrons de « s›étonne » et « d›un » passeraient pour des
    erreurs d'affichage.

## 11. Les coquilles

Rien n'est corrigé sans l'accord de Karl : le livre jouable affiche le texte tel quel, et `texte.py`
n'applique que les corrections qu'il a cochées. Les sept équipes ont relu leur texte mot pour mot et
n'ont relevé **aucune coquille nouvelle** : elles renvoient toutes à l'annexe A de
`docs/plan-darshan.md`, qu'elles confirment une à une dans leur chapitre. La synthèse, en comparant
le texte de tous les tableaux, ajoute deux candidates.

### 11.1 Déjà dans l'annexe A, confirmées par les équipes

Dédicace : « une l’intensité inégalée ». Chapitre 1 : « l’eau boue », « Il s’y s’énerve », le tiret
collé de « —Je ne suis toujours pas » et « —Tu ne connais pas ». Chapitre 2 : « il n’en n’a que pour
elle », « ses yeux d’Ocre », « ou il va recevoir Julie ». Chapitre 3 : « qu’incombe le statut de
mortel », « leurs est offerte », « poèmes sanskrit », « ou seul l’esprit a corps », « Il n’y pas de
doute possible », « que je pourrai t’offrir. ». Chapitre 4 : « de mon lieu de mon travail ».
Chapitre 5 : « quel devrait-être », « trois feuilles de sucres ». Chapitre 6 : le double « ajoute »,
« la poignet », « émit par Darshan », « la anse », les chevrons de « s›étonne » et « d›un index »,
« aux sangs », « la voie nouée ». Chapitre 7 : « désert Lybique », « rue Rungis ».

À vérifier (peut-être voulu), déjà dans l'annexe : les premières répliques sans tiret ; « une amande
de mousse » ; « Des couleurs, ils en approchent » ; « Tu ne suis rien » ; « Elle le récupérera » ;
« Je lui décris » … « Elle s’emporta » ; « l’éternité » … « se bousculent » ; « au travers du
mistral » ; « doigt de dieu ».

### 11.2 À ajouter à l'annexe A, à vérifier

| Où | Texte actuel | Proposition |
|---|---|---|
| Ch. 4 (4.7) | « j’appris qu’il n’en avait pas et me donna rendez-vous pour le lendemain » | le sujet de « donna » manque : “et il me donna rendez-vous” ? |
| Ch. 1, 4, 5, 6 | sept apostrophes droites au milieu des apostrophes typographiques : « jusqu'à » (1.5), « l'emballage » et « l'accord » (4.5), « s'il », « l'événement » et « s'enthousiasme » (5.5), « s'efface » (6.12) | les harmoniser (’) ; rien ne change à la lecture, mais les polices et les lecteurs d'écran les traitent autrement |

## 12. Le plan de fabrication

Dans l'ordre, par étapes qu'on peut vérifier chacune ; une étape ne commence que quand la
précédente passe sa vérification. Les réponses de Karl au premier rang (partie 10) ne bloquent que ce
qu'elles touchent : le tour de clé et le trajet de la clé (essai dans Apple Books), la porte du père,
le son du père, la table du chapitre 2, la lettre. Tout se reporte dans `outils/darshan/`, sur une
branche, avec une pull request vers `main` ; le texte du livre n'est touché nulle part.

| Étape | Ce qu'on fait | Comment on vérifie |
|---|---|---|
| 1. Le découpage | `decoupage.py` : les 85 entrées des chapitres, les titres de photos, `TRANSITIONS`, `AMBIANCES` et `variantes()`, `MECANIQUES` (les 27 noms), `EFFETS_OBJETS`, `PRODUCTION`, les champs `son` corrigés (partie 8) | `python3 outils/darshan/decoupage.py` passe `verifier()` et réécrit `docs/darshan-decoupage.md` ; les trois frontières ont bougé ; chaque geste est reconnu sous la mécanique de sa fiche |
| 2. Les fiches | `livre.py` : `DECORS` (63 nouveaux, 20 redéfinis, 24 retirés) ; les 85 `SCENES` des chapitres avec les noms de la partie 3 (alias traduits, `ambiance` séparé de `son`, `appel`, `melodie` à modes, `ruban` avec `attache`, `pause`, `battant`, `tremble`, `esquisse`, le voile en 3.10 et 7.10, les six changements d'ambiance, l'électrocardiogramme qui quitte le sac en 7.9) ; `LIEUX` sans `desert` ; le dictionnaire `REPLIQUES` | `build.py` construit les 85 pages : 58 gestes, le texte recollé au caractère près (la synthèse l'a déjà vérifié en mémoire avec les fiches telles quelles : 446 temps) |
| 3. Les textes | `interface.ini` (partie 6) ; `objets.ini` et `portes.ini` (partie 7) ; `build.py` lit `portes.ini` et ses clés d'entrée ; **Karl valide les textes nouveaux** | `build.verifier` (textes, consignes, actions) ; chaque phrase trouvée une fois dans le livre |
| 4. Les états | `build.py` : `CLASSES_TEXTE` (`haut clair`, `bas ciel`, `haut papier`) ; `POINTS_D_ENTREE` (3.4 en `"600 700"`, 3.10 retiré) ; les états `pere`, `barre`, `voile`, `regard`, `compte`, `boussole`, `repliques` (partie 3.3) ; les variantes d'ambiance à côté de `data-son` | les états des pages de contrôle (1.4, 3.10, 4.2, 5.2, 6.12, 7.9, 7.12, 7.15) sont ceux de la partie 3.3 ; chaque page ouverte seule dans l'EPUB montre la bonne barre, le bon compte, la bonne boussole |
| 5. Les images | `images.py` télécharge les sources nouvelles depuis images.pexels.com (jamais une page de pexels.com) ; `decors.py` apprend les réglages de la partie 4.7 ; `art.py` reçoit les seize dessins et la retouche d'Aluva (partie 4.4) ; le calque `arbres-poeme.webp` | 115 fichiers dans `src/img/decors/`, 24 retirés ; la planche de contrôle relue page par page (cadrages, points chauds, aucun visage de Darshan ni de Julie) |
| 6. Le son | `son.js` : les sept points de la partie 5.5, les couches `aube`, `couteau`, `vent`, `bourdon`, les effets “à faire” de la partie 5.4 | le banc d'essai `essai-son.js` rend chaque ambiance, couche et effet ; niveaux sous la lecture ; aucun do dièse avant 3.10 ; **l'écoute de la direction**, puis de Karl (la ballade, l'accord) |
| 7. Le moteur | les 19 mécaniques et les effets qui manquent, **dans l'ordre des chapitres** (1 puis 2 … puis 7), chacun avec son toucher simple, son clavier et son mouvement réduit ; les trois écarts entre les fiches et le moteur (partie 3.2) ; le nom de capture `toit-voix-du-pere` d'`essai.js` devient `toit-appel` | `build.verifier` (le moteur déclare toutes les mécaniques et tous les effets des fiches ; aucun texte en dur) ; les captures d'`essai.js`, page par page (les images de images.pexels.com servies par interception) |
| 8. Les scènes écrites à la main | `seuil`, `poeme`, `toit`, `tuiles`, `pigeonnier` (retouches du prototype), puis `plier`, `vision`, `listes`, `rue-de-rungis`, `cloture` (partie 3.4) | chaque scène ouverte seule reprend son état ; les pages 3.11, 7.13, 7.14 et 7.15 s'ouvrent comme la précédente s'arrête ; Karl revoit 0.1 à 1.4, qu'il avait aimées |
| 9. Les essais | clavier seul ; VoiceOver et TalkBack ; mouvement réduit ; grand texte ; « Lecture » ; sans script ; Apple Books sur iPhone et iPad (aucun geste ne tourne la page) ; au plus trois animations sur toile par page | une grille par page, cochée ; les pages 1.3, 6.11, 7.8, 7.10 et 7.14 d'abord |
| 10. La publication | EPUBCheck ; l'édition classique inchangée ; la page « Fin » (générique, planche, crédit de la couverture) | EPUBCheck sans erreur ; le texte des deux éditions identique au livre, hors coquilles validées par Karl |

Au fil des étapes, les repérages de Karl (partie 9) remplacent les images d'attente sans rien changer
d'autre : une photo arrive, son décor est redéfini dans `livre.py`, le flou se retire de la fiche, et
`decors.py` refait le seul décor concerné.

