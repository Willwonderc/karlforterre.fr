# Darshan : le découpage de toute l'histoire

Document écrit par `outils/darshan/decoupage.py` ; ne pas le modifier à la main, mais corriger
les données du programme et le relancer (`python3 outils/darshan/decoupage.py`). Le programme
vérifie que les tableaux, mis bout à bout, redonnent tout le texte de l'édition 2023, de la
dédicace au poème de clôture, et que chaque geste naît d'une phrase qui figure mot pour mot dans
son tableau.

Plan d'ensemble et chantiers : [plan-darshan.md](plan-darshan.md) ; interface (fiches d'objet,
carnet, dialogues, téléphone de Julie) : [plan-darshan-interface.md](plan-darshan-interface.md).

## En bref

- **85 tableaux**, 8401 mots, de 40 à 160 mots chacun (moyenne 99).
- **67 gestes**, tous nés d'une phrase du livre ; chacun a son équivalent au toucher simple et au clavier.
- **77 photographies de Karl** mises en scène : telles quelles dans le monde de Julie, passées à l'encre dans celui de Darshan, ou comme modèles des dessins.
- **21 repérages** : les photos qui manquent encore, à prendre par Karl (liste à la fin).
- Déjà jouables dans le prototype : 0.1, 0.2, 1.1, 1.2, 1.3, 1.4.

| Chapitre | Paragraphes | Tableaux | Mots | Monde | Gestes |
|---|---|---|---|---|---|
| Ouverture | 8–16 | 2 | 139 | livre | 0 |
| 1. Un ciel mouvant | 17–39 | 9 | 874 | Darshan, les deux | 12 |
| 2. Un pain perdu s’il vous plaît. | 40–62 | 10 | 961 | Julie | 8 |
| 3. Entre deux mondes | 63–98 | 14 | 1370 | Darshan, légende | 9 |
| 4. Amélie et Julie | 99–108 | 7 | 756 | Julie | 5 |
| 5. Douceurs et confettis | 109–133 | 11 | 1251 | Darshan, Julie | 9 |
| 6. Des attentes de part et d’autre | 134–169 | 15 | 1510 | Julie, les deux | 13 |
| 7. Au-delà de la porte | 170–215 | 16 | 1479 | Darshan, Julie, les deux, livre | 11 |
| Clôture | 216–221 | 1 | 61 | livre | 0 |

## La grammaire des transitions

Toutes existent dans le moteur (`outils/darshan/src/moteur.js`, module `Transitions`) et se voient
sur le banc d'essai, `dist/web/transitions.html`, après fabrication. Chaque balayage a deux
moitiés : couvrir la scène qui part, découvrir celle qui arrive. L'édition web joue les deux ;
dans l'EPUB, où chaque page est un document à part, la page joue la seconde à son ouverture
(attribut `data-entree`). Si le système demande moins de mouvement, tout devient fondu court,
et l'éclat d'un objet une image fixe qui reste le temps d'être lue.

| Transition | Quand | Durée |
|---|---|---|
| **Même plan** (`—`) | Le décor reste, seul le texte change (dialogue, suite d'une même action). | aucune |
| **Fondu** (`fondu`) | Même lieu, le temps passe (au noir, ou au blanc de la page pour la fin). | 600 + 650 ms |
| **Encre** (`encre`) | Darshan change de lieu : trois coups de pinceau couvrent la page puis s'en retirent. | 780 + 820 ms |
| **Bandes** (`bandes`) | Ouverture de chapitre, façon Persona : bandes obliques d'encre, de vermillon et d'or, trame de points ; le titre du chapitre claque sur la bande centrale. | 640 ms + titre 1,6 s + 680 ms |
| **Iris** (`iris`) | Vision, petite porte, regard qui se resserre : un cercle cerné d'or se referme sur un point et s'ouvre ailleurs. | 760 + 900 ms |
| **Porte** (`porte`) | On franchit une porte : sa lumière gagne l'écran, puis la scène suivante paraît dans une embrasure qui s'élargit jusqu'à nous. | 900 + 1 250 ms |
| **Lumière** (`lumiere`) | Éblouissement, foudre : une lumière qui s'étend puis se dissipe. | 900 + 2 000 ms |
| **Obturateur** (`obturateur`) | Le monde de Julie, fait des photographies de Karl : les lames d'un obturateur se ferment et s'ouvrent sur la photo suivante, avec un double déclic. | 420 + 520 ms |
| **Glissement** (`glissement`) | Le téléphone de Julie : on passe d'une photo à l'autre. | 360 + 420 ms |

Changements d'état des objets :

| Effet | Quand | Durée | Moteur |
|---|---|---|---|
| **frisson** | Un objet change d'état sans changer de nature (les lunettes ôtées, la clé dans la serrure) : étoile et rayons autour de l'objet, tintement de verre. | 560 ms | fait |
| **envol** | Un objet entre dans le sac : bandeau oblique « Nouvel objet », puis l'objet vole jusqu'au bouton « Objets », qui apparaît à son arrivée. | ≈ 2 s | fait |
| **éclat** | Un objet se métamorphose : bandes, trame, étoiles, l'objet arrive en tournoyant, son nom en grand, et le fragment du livre qui raconte la métamorphose ; puis sa fiche s'ouvre en diagonale. | ≈ 2,8 s | fait |
| **éclat court** | La même métamorphose, déjà vue : un frisson, la fonte, et le nom seul, sans bandes. | ≈ 1 s | à faire |
| **éclat brisé** | La métamorphose qui ne mène nulle part (chapitre 6) : les bandes se fendent et retombent. | ≈ 1,5 s | à faire |
| **dépôt** | Un objet quitte le sac pour la scène (le thé servi, la veste accrochée) : l'envol à l'envers. | ≈ 1 s | à faire |
| **transfert** | Un objet passe d'un personnage à l'autre (la lettre, le paquet au ruban rouge) : il quitte un sac et rejoint l'autre, d'un monde à l'autre. | ≈ 1,5 s | à faire |
| **désenchantement** | La magie s'en va : l'objet se défait en poussière d'or et le bouton « Objets » disparaît avec lui. | ≈ 3 s | à faire |

Palette des transitions de Darshan : encre `#07091a`, vermillon (sindoor) `#c9302c`, or `#f4c56a`,
crème `#fff4de`. Celles de Julie : lames d'obturateur gris anthracite, blanc de papier photo.

## Les ambiances sonores

Une par lieu, fabriquée en direct (Web Audio) ; « fait » : déjà dans le prototype.

| Ambiance | Ce qu'on entend | Tableaux | Moteur |
|---|---|---|---|
| **cosmos** | La voûte : sinus lents, souffle | 7 | fait |
| **nuit** | Les toits la nuit : vent, air, rumeur de la ville | 3 | fait |
| **kerala** | Aluva : le fleuve et ses remous, les oiseaux, un tanpura | 13 | fait |
| **silence** | Plus rien : le son se tait (la fin du livre) | 4 | fait |
| **vent** | Le ciel, le désert la nuit : le vent seul | 2 | à faire |
| **restaurant** | Couverts, murmure de salle, pas du serveur | 6 | à faire |
| **rue** | Paris : pas, voitures au loin, pigeons | 16 | à faire |
| **parc** | Feuillage, gravier, oiseaux (le merle) | 2 | à faire |
| **bibliothèque** | Silence habité, pages tournées, pas feutrés | 3 | à faire |
| **vision** | Le mudrā : souffle, braises, un espace sans air | 2 | à faire |
| **métro** | La tôle qui vibre, les freins | 2 | à faire |
| **hôpital** | Couloir, bips lointains, chariots | 2 | à faire |
| **chambre** | Pièce calme, rue étouffée | 6 | à faire |
| **marché** | Aluva : foule, marchands, chaleur | 4 | à faire |
| **pâtisserie** | Vitrine réfrigérée, clochette de la porte | 1 | à faire |
| **appartement** | Tentures, horloge, encens qui crépite | 9 | à faire |
| **désert** | Sable qui file, nuit immense | 2 | à faire |
| **pluie** | Averse, puis gouttes | 1 | à faire |

## Les mécaniques de geste

Tous les gestes du livre se ramènent à douze mécaniques. « Fait » : déjà dans le prototype.

| Mécanique | Description | Gestes | Tableaux | Moteur |
|---|---|---|---|---|
| **deux pouces** | Deux doigts posés ensemble et maintenus (le mudrā) | 1 | 3.9 | à faire |
| **pincer** | Pincer à deux doigts | 1 | 3.4 | à faire |
| **rythme** | Toucher en rythme, ou au rythme d'un autre battement | 4 | 1.2, 5.8, 5.9, 7.9 | fait |
| **essuyer** | Frotter une surface (buée, encre qu'on tente d'effacer) | 2 | 5.11, 7.8 | à faire |
| **curseur** | Régler un curseur | 1 | 4.2 | à faire |
| **défiler** | Faire défiler une galerie ou une vitrine | 2 | 5.6, 5.10 | à faire |
| **attendre** | Attendre sans rien toucher | 1 | 6.11 | à faire |
| **tracer** | Tracer ou suivre un chemin du doigt (moustache, fumée, lettre) | 3 | 1.4, 6.6, 7.7 | à faire |
| **porter** | Porter un objet jusqu'à sa place (glisser-déposer) | 3 | 1.3, 6.5, 7.8 | fait |
| **maintenir** | Maintenir le doigt (ou une touche) | 8 | 2.2, 2.9, 3.10, 6.5, 6.10, 7.1, 7.10, 7.13 | à faire |
| **glisser** | Glisser dans une direction | 18 | 1.3, 1.7, 1.8, 2.1, 2.6, 2.8, 3.6, 3.7, 3.11, 3.14, 4.4, 4.5, 6.7, 6.8, 6.15, 7.4, 7.6, 7.11 | en partie |
| **toucher** | Toucher (ou Entrée, Espace) | 23 | 1.3, 1.4, 1.9, 2.3, 2.4, 2.7, 3.2, 3.8, 4.3, 4.7, 5.1, 5.2, 5.5, 5.7, 6.2, 6.4, 6.12, 6.13, 7.5 | fait |

## Les objets et leurs états

| Tableau | Changement |
|---|---|
| 1.2 La danse sur les tuiles | + lunettes fumées (envol) |
| 1.3 Le pigeonnier | lunettes : portées → en main (frisson) |
| 1.3 Le pigeonnier | lunettes → clé (fonte, puis éclat) |
| 1.3 Le pigeonnier | clé : en main → dans la serrure (frisson) → tournée (frisson) |
| 1.4 Aluva | clé → lunettes (frisson inverse : la porte passée, la clé redevient lunettes) |
| 1.9 Le départ | + montre (envol) |
| 1.9 Le départ | lunettes → clé (éclat court : la métamorphose est connue) |
| 3.2 Le trou dans le mur | trou → entrée (frisson) |
| 3.4 Des lunettes qui plient l'espace | lunettes → clé (éclat court, vu comme une légende) |
| 3.8 La porte du personnel | + recueil de poèmes (envol) |
| 3.8 La porte du personnel | lunettes → clé (éclat court) |
| 3.11 La porte inconnue | carnet : la porte du père devient une étoile à part, sans lieu |
| 4.7 Un numéro | + téléphone (le sac de Julie s'ouvre) |
| 5.2 Le marché d'Aluva | + thés, + curcuma, + encens, + jarres, + tapisseries (cinq envols) |
| 5.5 Le quartier Foch | + confettis (envol) |
| 5.11 La charlotte | + ticket de la pâtisserie (envol, sac de Julie) |
| 6.1 Il est midi | ticket → gâteau → paquet au ruban rouge (frisson) |
| 6.4 La clé dans la poche | lunettes → clé (hors champ : Julie ne voit rien) |
| 6.4 La clé dans la poche | + binocles (envol) |
| 6.5 Le repère de la grâce | − veste de Julie (dépôt) |
| 6.6 Les toiles | − encens, − thés (dépôt : servis dans le salon) |
| 6.11 Je tiens à toi | lunettes → clés (éclat brisé) |
| 6.13 Le placard | clé de laiton : dans la serrure du placard (frisson) |
| 7.5 Derrière les portes | + électrocardiogramme (envol, sac de Julie) |
| 7.6 Le feu | + de quoi écrire (envol) |
| 7.7 Darshan écrit | + lettre (envol) |
| 7.8 Encrés | lunettes → clé (éclat court) |
| 7.8 Encrés | lettre : Darshan → Julie (transfert) |
| 7.11 Éclipse | paquet au ruban rouge : Darshan → Julie (transfert) |
| 7.14 La prière | clé : désenchantement (elle se défait en poussière d'or) |
| 7.14 La prière | le bouton « Objets » disparaît |

## Ouverture

### 0.1 Le seuil

¶8–10, 53 mots · **fait en partie** : « À Maëlle, mon amour qui est bien plus que … une l’intensité inégalée. / Bonne lecture. »

- **Lieu** : Page de titre · **monde** : livre · **entrée** : même plan
- **Décor** : Le ciel étoilé de Karl, assombri ; le titre, दर्शन, la dédicace à Maëlle.
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (photo)
- **Son** : cosmos ; démarre au premier toucher
- **Note** : Le bouton « Ouvrir » est la première porte : la lumière en jaillit (transition porte). Le prototype n'affiche pas encore la dédicace.

### 0.2 Poème d'ouverture

¶11–16, 86 mots · **fait** : « Les murs séparent sans que la contestation ne se … mue sous la course des astres. »

- **Lieu** : La voûte · **monde** : livre · **entrée** : porte
- **Décor** : Ciel étoilé ; au dernier vers, l'aube monte à l'horizon.
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (photo) ; [13102289](https://photos.karlforterre.fr/photo/13102289/) « Aube » (photo)
- **Moment** : « La noirceur figée finit toujours par embrasser son éblouissante frontière » → l'aube monte
- **Son** : cosmos
- **Note** : Proposition : l'aube du dernier vers devient la photo « Aube » de Karl, en fondu.

## Chapitre 1 : Un ciel mouvant

### 1.1 Le toit

¶17–20, 130 mots · **fait** : « Un ciel mouvant / Les pieds au-dessus du vide, … bientôt là, j’arrive à grands pas. »

- **Lieu** : Paris, un toit du seizième, la nuit · **monde** : Darshan · **entrée** : bandes
- **Décor** : La voûte tourne autour du pôle ; toits et tour Eiffel dessinés.
- **Photos de Karl** : [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (encre) ; [24200555](https://photos.karlforterre.fr/photo/24200555/) « Ciel étoilé » (modèle) ; [38570570](https://photos.karlforterre.fr/photo/38570570/) « Pleine lune se levant derrière des cheminées, ciel nocturne violet » (modèle)
- **Moment** : « Des étincelles passent et se chassent » → deux étoiles filantes se poursuivent
- **Moment** : « Papa, où es-tu » → la voix du père s'écrit en lumière d'étoile
- **Son** : nuit

### 1.2 La danse sur les tuiles

¶21, 43 mots · **fait** : « Darshan se lève, s’époussette, cesse de tergiverser. Il enjambe … danse sur les tuiles jusqu’au pigeonnier. »

- **Lieu** : Les toits · **monde** : Darshan · **entrée** : encre
- **Décor** : Les tuiles de nuit, en perspective ; la ville s'approche à chaque bond.
- **Photos de Karl** : [34500347](https://photos.karlforterre.fr/photo/34500347/) « Fond de tuiles » (photo) ; [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » (encre)
- **Geste** : « Il enjambe cinq par cinq les tuiles » → cinq touchers en rythme, une enjambée chacun (sinon : toucher, Espace)
- **Moment** : « Ses lunettes fumées sur le nez » → premier objet
- **Objet** : + lunettes fumées (envol)
- **Son** : nuit ; saut

### 1.3 Le pigeonnier

¶22–23, 129 mots · **fait** : « Dans la nuit nacrée, il ne laisse pas de … dans le Kerala, la ville d’Aluva. »

- **Lieu** : Le pigeonnier des toits · **monde** : Darshan · **entrée** : iris
- **Décor** : La porte de grilles et de bois, au clair de lune.
- **Photos de Karl** : [27046156](https://photos.karlforterre.fr/photo/27046156/) « Porte forgée » (modèle) ; [39434688](https://photos.karlforterre.fr/photo/39434688/) « Gros plan sur une porte ancienne patinée, rivets et peinture écaillée » (modèle)
- **Geste** : « il ôte ses lunettes » → toucher les lunettes (sinon : bouton de la fiche)
- **Geste** : « D’un geste vif » → glisser vers le haut (sinon : toucher)
- **Geste** : « À peine insérée » → porter la clé jusqu'à la serrure (sinon : toucher la clé)
- **Geste** : « Après un tour de poignet » → toucher la clé : un quart de tour (sinon : toucher)
- **Geste** : « Il ne reste qu’à la pousser » → pousser la porte (sinon : toucher)
- **Moment** : « elles vibrent entre ses doigts, leurs couleurs s’altèrent » → vibration, couleurs qui tournent
- **Moment** : « elles se transforment » → éclat : « La clé »
- **Moment** : « le jour de la porte laisse transparaître la présence de l’astre solaire » → le soleil passe par les jours de la porte
- **Objet** : lunettes : portées → en main (frisson)
- **Objet** : lunettes → clé (fonte, puis éclat)
- **Objet** : clé : en main → dans la serrure (frisson) → tournée (frisson)
- **Son** : nuit ; vibre, fonte, éclat, clé, tour, grince, souffle
- **Note** : Sortie par la porte : sa lumière gagne l'écran.

### 1.4 Aluva

¶23–24, 91 mots · **fait en partie (sans le paragraphe 24)** : « Notre héros affleure de la poussière en passant le … puis taille son bouc avec soin. »

- **Lieu** : Aluva (Kerala), le local à kayaks · **monde** : Darshan · **entrée** : porte
- **Décor** : Éblouissement, poussière dans la lumière ; le Periyar ; le tonneau où l'eau bout de poissons.
- **Photos de Karl** : [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » (modèle) ; [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » (encre)
- **Geste** : « Darshan se saisit du coutelas » → toucher le coutelas (sinon : toucher)
- **Geste** : « dessine sa moustache puis taille son bouc » → tracer la moustache du doigt, puis trois petits coups pour le bouc (sinon : toucher trois fois)
- **Moment** : « Notre héros affleure de la poussière » → la poussière danse dans la lumière
- **Moment** : « En son sein l’eau boue, mue par une vie frétillante » → les poissons frétillent ; toucher l'eau les fait sauter
- **Objet** : clé → lunettes (frisson inverse : la porte passée, la clé redevient lunettes)
- **Son** : kerala ; poissons, mousse
- **Note** : Caméra subjective : le visage de Darshan ne se voit pas, seulement le trait d'or que trace le doigt.

### 1.5 Jivan

¶25–29, 109 mots : « Un vieil homme au short et au marcel de … presque à parler d’un dieu même. »

- **Lieu** : Aluva, au bord du fleuve · **monde** : Darshan · **entrée** : fondu
- **Décor** : Le vieux pêcheur, son filet, ses maquereaux, le tabouret rafistolé.
- **Photos de Karl** : [34956319](https://photos.karlforterre.fr/photo/34956319/) « Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages » (modèle) ; [10652212](https://photos.karlforterre.fr/photo/10652212/) « Pêcheur à la ligne sur une berge verdoyante bordée de grands arbres » (modèle)
- **Moment** : « sortant de ses filets sa prise pour qu’elle rejoigne le tonneau » → les maquereaux sautent dans le tonneau
- **Moment** : « l’homme entame la conversation » → première bulle de dialogue
- **Son** : kerala
- **Note** : Interface de dialogue : le nom de celui qui parle n'apparaît qu'une fois que le texte l'a donné.

### 1.6 L'esprit local

¶30–33, 120 mots : « — Il n’est rien de tout ça. Je ne … Paris plutôt ; ce palais immense. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor ; le soleil tourne.
- **Son** : kerala
- **Note** : Dialogue ; la « délicieuse enfant » : première mention de Julie.

### 1.7 Paris dans le fleuve

¶34, 81 mots : « — Paris est à l’amour ce que le bleu … perdu dans les remous du Periyar. »

- **Lieu** : Aluva, le Periyar · **monde** : les deux · **entrée** : même plan
- **Décor** : Le fleuve peint ; dans ses remous, des reflets de Paris la nuit : les photographies de Karl, ondulées par l'eau.
- **Photos de Karl** : [38279684](https://photos.karlforterre.fr/photo/38279684/) « Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé » (photo) ; [10473138](https://photos.karlforterre.fr/photo/10473138/) « Rue commerçante étroite et déserte la nuit avec pavés et lanternes » (photo) ; [12073837](https://photos.karlforterre.fr/photo/12073837/) « Ciel et pavés » (photo) ; [16592454](https://photos.karlforterre.fr/photo/16592454/) « Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit » (photo)
- **Geste** : « le regard perdu dans les remous du Periyar » → remuer l'eau du doigt : chaque remous montre Paris (sinon : toucher l'eau)
- **Moment** : « Les éclairages de nuit t’ensorcellent » → Paris de nuit dans le reflet
- **Moment** : « Le pavé y est gris, avec ses écailles de pierre » → les pavés dans le reflet
- **Son** : kerala ; rumeur de Paris sous l'eau
- **Note** : Premier contact des deux mondes : les photos de Karl apparaissent dans l'encre.
- **Repérage** : Bateaux-mouches sur la Seine, de nuit (« l’éclat des navires parcourant la Seine »)

### 1.8 Vieillir

¶35–38, 127 mots : « — Je t’invite à t’attarder davantage sur ma personne … conclut Darshan en enfilant sa chemise. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor.
- **Geste** : « en enfilant sa chemise » → enfiler la chemise : glisser vers le bas (sinon : toucher)
- **Son** : kerala

### 1.9 Le départ

¶39, 44 mots : « Après quelques ajustements et regards attentifs sur sa montre, … Jivan qui range patiemment son filet. »

- **Lieu** : Aluva, le local à kayaks · **monde** : Darshan · **entrée** : fondu
- **Décor** : La cabane à kayaks ; Jivan range son filet.
- **Photos de Karl** : [20315376](https://photos.karlforterre.fr/photo/20315376/) « L’heure d’hier » (modèle) ; [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » (modèle)
- **Geste** : « regards attentifs sur sa montre » → ouvrir la montre (sinon : toucher)
- **Geste** : « Il se défait de ses lunettes » → ôter les lunettes : elles deviennent clé (sinon : toucher)
- **Objet** : + montre (envol)
- **Objet** : lunettes → clé (éclat court : la métamorphose est connue)
- **Son** : kerala ; cle
- **Note** : La montre de poche de la photo « L’heure d’hier » sert de modèle au gros plan.

## Chapitre 2 : Un pain perdu s’il vous plaît.

### 2.1 Attablé

¶40–41, 58 mots : « Un pain perdu s’il vous plaît. / Attablé, les … baiser à l’issue de ce repas. »

- **Lieu** : Paris, un restaurant · **monde** : Julie · **entrée** : bandes
- **Décor** : Le restaurant photographié, flou ; seule la main de Julie est nette.
- **Photos de Karl** : [33035651](https://photos.karlforterre.fr/photo/33035651/) « La Rotonde » (photo) ; [32429293](https://photos.karlforterre.fr/photo/32429293/) « Chaise de terrasse française » (photo)
- **Geste** : « Il caresse la main de sa belle avec délicatesse » → caresser la main du doigt, lentement (sinon : maintenir le doigt)
- **Son** : restaurant
- **Note** : Premier chapitre photographique ; on le voit par les yeux de Darshan.
- **Repérage** : Une main posée sur une nappe de restaurant (modèle)

### 2.2 La rencontre

¶42–43, 127 mots : « Il se rappelle leur rencontre comme si elle se … que celui de Darshan devenait fébrile. »

- **Lieu** : Paris, une vitrine · **monde** : Julie · **entrée** : obturateur
- **Décor** : Souvenir : la vitrine, le mannequin, guêtres et robe volantée.
- **Geste** : « La chamade battait en lui » → maintenir : le cœur bat (sinon : maintenir Espace)
- **Moment** : « Son cœur balançait » → la guêtre et la robe s'allument tour à tour
- **Son** : rue ; battements
- **Note** : Même vitrine qu'en 4.6, vue cette fois par Darshan.
- **Repérage** : Vitrine de boutique : mannequin, guêtres, robe volantée (la vitrine de la rue Rousseau)

### 2.3 Au diable les autres

¶44, 116 mots : « Au diable les autres, il n’y a qu’elle. Toute … pas quand je pense à toi… »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : obturateur
- **Décor** : La salle se brouille ; la lumière, la nappe, un reflet.
- **Photos de Karl** : [32429294](https://photos.karlforterre.fr/photo/32429294/) « Lecture paisible » (modèle)
- **Geste** : « Au diable les autres, il n’y a qu’elle » → toucher Julie : la salle se brouille, elle seule reste nette (sinon : toucher)
- **Son** : restaurant ; étouffé
- **Note** : Julie n'a pas de visage fixé par l'image : ses traits sont ceux du texte.

### 2.4 Quoi ?!

¶45–49, 92 mots : « Tes projets se passent bien Darshan ? demande Julie … Tu peux le dire, tu sais. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : même plan
- **Décor** : Le même plan, net d'un coup.
- **Geste** : « répond-il presque réveillé en sursaut » → se réveiller : un toucher fait entendre la question (sinon : toucher)
- **Son** : restaurant
- **Note** : La question de Julie reste floue et sourde tant que le lecteur ne s'est pas « réveillé ».

### 2.5 L'aurore de mes jours

¶50–52, 142 mots : « — Non, je travaille, c’est juste que je ne … penses de se perdre de vue. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : même plan
- **Décor** : Le même plan.
- **Moment** : « Tu n’as pas de téléphone » → le bouton du téléphone de Julie, grisé, côté Darshan
- **Son** : restaurant

### 2.6 Le tartare

¶53–55, 62 mots : « — Plus compliqué que de finir son assiette visiblement. … longtemps que tu ne l’aurais voulu. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : même plan
- **Décor** : L'assiette : le tartare à peine picoré.
- **Geste** : « Darshan se penche sur son assiette » → baisser les yeux : glisser vers le bas (sinon : toucher)
- **Son** : restaurant
- **Repérage** : Assiette de tartare de saumon aux herbes fraîches

### 2.7 Le pain perdu

¶56–59, 123 mots : « Après quelques bouchées assorties d’un geste de la main … laissé filer aussi facilement mon saumon. »

- **Lieu** : Le restaurant · **monde** : Julie · **entrée** : fondu
- **Décor** : La brioche perdue sur sa porcelaine jaune tournesol.
- **Geste** : « prendre la commande du dessert » → commander : la carte n'offre que le pain perdu (sinon : toucher)
- **Moment** : « un motif fleuri sur un fond jaune tournesol » → la porcelaine jaune tournesol
- **Son** : restaurant ; porcelaine
- **Repérage** : Pain perdu (brioche) sur une assiette à motif fleuri, fond jaune tournesol

### 2.8 Montsouris

¶60, 104 mots : « Le repas se conclut par une promenade digestive passant … de lierre aux charmantes petites fenêtres. »

- **Lieu** : Paris, le parc Montsouris · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le parc ; le pont de rocaille aux branches nouées ; les amoureux accoudés ; la maison de lierre.
- **Photos de Karl** : [10524140](https://photos.karlforterre.fr/photo/10524140/) « Arche de rocaille au-dessus d'une allée dans un jardin romantique » (photo) ; [12073840](https://photos.karlforterre.fr/photo/12073840/) « Pont vers la nature » (photo) ; [31514847](https://photos.karlforterre.fr/photo/31514847/) « Amour » (photo) ; [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo)
- **Geste** : « Leurs pas sous l’ombrage des arbres les conduisent sur un pont » → marcher : glisser vers l'avant, le parc défile (sinon : toucher)
- **Moment** : « ils regardent le Merle noir qui fait son nid » → un merle au nid, en passant
- **Moment** : « une petite maison beige couverte de lierre » → la maison de lierre
- **Son** : parc ; merle
- **Note** : Le pont « sorti de terre en l’état », aux branchages noués, est un pont de rocaille : l'arche de la photo de Karl en est un.

### 2.9 Le seuil de Julie

¶61–62, 88 mots : « Sur le seuil de la demeure, leurs joues se … rêves en projets pour leur avenir. »

- **Lieu** : Devant la maison de Julie · **monde** : Julie · **entrée** : fondu
- **Décor** : Le seuil, la lampe de l'entrée ; la porte épaisse se ferme ; la vue s'élève.
- **Photos de Karl** : [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo) ; [34978560](https://photos.karlforterre.fr/photo/34978560/) « Entrée de maison éclairée par une seule lampe par une nuit de brouillard » (photo)
- **Geste** : « leurs joues se frôlent » → maintenir le doigt : les joues se frôlent (sinon : maintenir)
- **Moment** : « L’épaisse porte de sa belle se ferme » → la porte se ferme
- **Moment** : « Darshan, lui, vole » → la vue s'élève au-dessus des toits
- **Son** : rue ; soir

### 2.10 Le nuage

¶62, 49 mots : « Il flirte avec Julie qu’il visualise dans cet endroit … encore ou il va recevoir Julie. »

- **Lieu** : Le ciel de Paris · **monde** : Julie · **entrée** : fondu
- **Décor** : Le ciel de Paris ; un nuage passe, au sens propre, sur l'image.
- **Photos de Karl** : [33035642](https://photos.karlforterre.fr/photo/33035642/) « Un gratte-ciel parisien s'élançant vers un ciel nuageux spectaculaire » (photo) ; [33035632](https://photos.karlforterre.fr/photo/33035632/) « Tour Eiffel encadrée d'arbres verts à Paris » (photo)
- **Moment** : « Mais un nuage vient porter ombrage à cette vision idyllique » → l'ombre d'un nuage balaie la photo
- **Son** : vent

## Chapitre 3 : Entre deux mondes

### 3.1 Le maître des portes

¶63–64, 46 mots : « Entre deux mondes / Darshan le rêveur, le beau … d’un méli-mélo d’idées qu’a formulées l’homme. »

- **Lieu** : Hors du monde · **monde** : légende · **entrée** : bandes
- **Décor** : Constellation de portes, à l'encre, sur un fond de voie lactée.
- **Photos de Karl** : [39595391](https://photos.karlforterre.fr/photo/39595391/) « Voie lactée et ciel étoilé à couper le souffle, en Galice » (encre)
- **Son** : cosmos

### 3.2 Le trou dans le mur

¶65, 109 mots : « Vous les connaissez, l’envie, la curiosité, celles de connaître … départ, une séparation qui paradoxalement connecte. »

- **Lieu** : Les âges · **monde** : légende · **entrée** : encre
- **Décor** : Une histoire des portes : celles de Karl, passées à l'encre, défilent de mur en mur.
- **Photos de Karl** : [34762346](https://photos.karlforterre.fr/photo/34762346/) « Porte en bois rustique et sa lanterne, charme d'autrefois » (encre) ; [27046156](https://photos.karlforterre.fr/photo/27046156/) « Porte forgée » (encre) ; [27025911](https://photos.karlforterre.fr/photo/27025911/) « Le portail » (encre) ; [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » (encre) ; [32429190](https://photos.karlforterre.fr/photo/32429190/) « Une porte » (encre) ; [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » (encre)
- **Geste** : « un trou dans un mur de terre et de paille, mais une entrée » → toucher le trou : il devient entrée (sinon : toucher)
- **Objet** : trou → entrée (frisson)
- **Son** : cosmos ; vent

### 3.3 L'immortel

¶66, 86 mots : « Cet être immortel vécut bien longtemps dérouté, en quête … la vue de ses compétences extraordinaires. »

- **Lieu** : Les âges · **monde** : légende · **entrée** : encre
- **Décor** : Vignettes à l'encre : les voies, les mains tendues, le travail, la poussière.
- **Son** : cosmos
- **Note** : Tableau sans geste : la page respire.

### 3.4 Des lunettes qui plient l'espace

¶67, 88 mots : « Ses traits ne diffèrent pas sous le souffle des … gardées de rester sur son nez. »

- **Lieu** : Hors du monde · **monde** : légende · **entrée** : iris
- **Décor** : Les lunettes en gros plan ; derrière elles, l'espace se plie.
- **Geste** : « Dans le même temps qu’elles se plient, elles en font autant de l’espace » → pincer à deux doigts : l'espace se plie, Paris rejoint Aluva sur la carte (sinon : toucher)
- **Moment** : « Elles portent sa vue plus loin » → la fiche des lunettes reçoit la phrase
- **Objet** : lunettes → clé (éclat court, vu comme une légende)
- **Son** : cosmos

### 3.5 Croire

¶68–71, 139 mots : « Le plus prodigieux des pouvoirs qu’il puisse avoir reste … C’est ici que j’écris ma vie. »

- **Lieu** : Les parvis · **monde** : légende · **entrée** : encre
- **Décor** : Anciens à barbe, ermites ; les parvis où Darshan écrit sa vie.
- **Photos de Karl** : [23414381](https://photos.karlforterre.fr/photo/23414381/) « Vue majestueuse des flèches néogothiques de l'église Saint-André au-dessus de Niort » (encre)
- **Moment** : « C’est ici que j’écris ma vie » → la phrase s'écrit à l'encre sur le parvis
- **Son** : cosmos ; cloches lointaines

### 3.6 Les bibliothèques

¶72–73, 102 mots : « Darshan explore les bibliothèques, les musées, les marchés en … forgent son organisation et sa lisibilité. »

- **Lieu** : Bibliothèques, musées, marchés ; puis Pékin · **monde** : Darshan · **entrée** : encre
- **Décor** : Rayonnages ; puis la bibliothèque nationale de Chine, vertigineuse, toute en lignes droites.
- **Photos de Karl** : [27025915](https://photos.karlforterre.fr/photo/27025915/) « Bibliothèque de rue » (encre) ; [31514837](https://photos.karlforterre.fr/photo/31514837/) « Marché de Niort » (encre)
- **Geste** : « en soufflant l’indifférence qui s’est déposée à la surface des ouvrages » → souffler la poussière : glisser sur la couverture (sinon : toucher)
- **Son** : bibliothèque ; pages

### 3.7 Le recueil sanskrit

¶73–75, 103 mots : « Depuis un coin de table Darshan poursuit ses recherches … sincérité et sa porte la réciprocité. »

- **Lieu** : Pékin, la bibliothèque nationale · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le coin de table ; le recueil ; les deux vers s'écrivent au pinceau.
- **Geste** : « Darshan pour sa part parcourt un recueil de poèmes sanskrit » → tourner les pages : glisser (sinon : flèches)
- **Moment** : « L’amour est le lit de la famille » → calligraphie à l'encre
- **Moment** : « La clé de sa chambre est la sincérité et sa porte la réciprocité » → calligraphie ; les deux vers entrent au carnet
- **Son** : bibliothèque

### 3.8 La porte du personnel

¶76, 46 mots : « Il n’y a pas de doute possible. Si, il … de porte des toilettes du personnel. »

- **Lieu** : Pékin · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le recueil sous le bras ; la porte des toilettes du personnel.
- **Geste** : « disparaît avec nonchalance entre deux battements de porte » → pousser la porte des toilettes du personnel (sinon : toucher)
- **Objet** : + recueil de poèmes (envol)
- **Objet** : lunettes → clé (éclat court)
- **Son** : bibliothèque ; porte

### 3.9 Le mudrā

¶77–79, 99 mots : « Il sort de sa petite boite, accueilli par le … le froissement de l’herbe qu’il provoque. »

- **Lieu** : Aluva, au bord du Periyar · **monde** : Darshan · **entrée** : porte
- **Décor** : Le fleuve ; les mains de Darshan, vues de ses yeux ; Jivan, discret, dans l'herbe.
- **Photos de Karl** : [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » (encre) ; [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » (encre)
- **Geste** : « positionne sa main droite pour qu’elle soutienne sa main gauche et que ses pouces soient en contact » → poser deux pouces l'un contre l'autre sur l'écran (sinon : maintenir une touche)
- **Son** : kerala ; clapotis
- **Note** : Temps fort. Sur ordinateur : deux touches maintenues.

### 3.10 Du noir vient la couleur

¶80–81, 105 mots : « Les poignets de Darshan se relâchent. Son inspiration l’emplit … dans le tissu même de l’existence. »

- **Lieu** : La vision · **monde** : Darshan · **entrée** : iris
- **Décor** : Le noir ; des couleurs qui approchent ; la lanterne de bois aux motifs circulaires s'allume.
- **Photos de Karl** : [34762346](https://photos.karlforterre.fr/photo/34762346/) « Porte en bois rustique et sa lanterne, charme d'autrefois » (modèle)
- **Geste** : « Son inspiration l’emplit de braises » → maintenir pour inspirer, lâcher pour expirer, trois fois (sinon : maintenir Espace)
- **Moment** : « Du noir vient la couleur » → la couleur naît du noir
- **Moment** : « Elle s’allume » → la lanterne s'allume
- **Son** : vision ; souffle, braises
- **Note** : La porte du père est peinte d'après la photo de Karl « Porte en bois rustique et sa lanterne ».

### 3.11 La porte inconnue

¶82–85, 104 mots : « Darshan ne connaît pas cette porte qui lui fait … à lui par une force irrépressible. »

- **Lieu** : La vision · **monde** : Darshan · **entrée** : même plan
- **Décor** : La porte du père ; la main tendue n'arrive jamais.
- **Geste** : « Son bras porte sa main au plus près qu’il peut de cette ouverture » → tendre la main : glisser vers la porte, qui recule (sinon : toucher)
- **Moment** : « La lueur de la lanterne faiblit, s’éteint » → la porte s'efface
- **Objet** : carnet : la porte du père devient une étoile à part, sans lieu
- **Son** : vision ; silence, puis souffle

### 3.12 J'ai trouvé le chemin

¶86–92, 144 mots : « En ouvrant ses yeux, Darshan retrouve Jivan en train … métaphore qui ressemblait à une porte. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : iris
- **Décor** : Retour au fleuve : Jivan découpe des légumes.
- **Photos de Karl** : [10652212](https://photos.karlforterre.fr/photo/10652212/) « Pêcheur à la ligne sur une berge verdoyante bordée de grands arbres » (modèle)
- **Son** : kerala

### 3.13 Le véritable amour

¶93–95, 119 mots : « — Il n’y pas de doute possible, le message … un présent que je pourrai t’offrir. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor.
- **Son** : kerala

### 3.14 Quatre jours

¶96–98, 80 mots : « — Je n’y consens toujours point. Accepte le cadeau … graines de sa libération sans attendre. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor ; le vent se lève.
- **Geste** : « sema aux quatre vents les graines de sa libération » → semer : quatre gestes, vers les quatre bords (sinon : toucher quatre fois)
- **Moment** : « dans quatre jours je reçois l’élue de mon cœur » → compte à rebours : quatre jours
- **Son** : kerala ; vent

## Chapitre 4 : Amélie et Julie

### 4.1 Amélie

¶99–100, 72 mots : « Amélie et Julie / Amélie c’est ma meilleure amie, … c’est pourquoi je choisis cette option. »

- **Lieu** : Paris, le métro · **monde** : Julie · **entrée** : bandes
- **Décor** : Le métro photographié par Karl.
- **Photos de Karl** : [33035627](https://photos.karlforterre.fr/photo/33035627/) « Métro » (photo)
- **Son** : métro
- **Note** : Julie parle à la première personne : l'interface change de monde (bandes aux couleurs de Julie).

### 4.2 L'hôpital

¶100, 131 mots : « Ensuite je travaille dans cet hôpital bicentenaire où on … le patient vers un service adapté. »

- **Lieu** : L'hôpital · **monde** : Julie · **entrée** : obturateur
- **Décor** : Couloir, blouses ; les questions deviennent des vers.
- **Photos de Karl** : [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » (photo)
- **Geste** : « Pouvez-vous évaluer votre douleur sur une échelle allant de zéro à dix » → curseur de zéro à dix (sinon : flèches)
- **Moment** : « la poésie, la prosodie de ces vers incompris » → les questions se mettent en vers
- **Son** : hôpital
- **Repérage** : Hôpital : couloir, blouses, sans patient ni visage

### 4.3 La tôle qui vibre

¶101, 98 mots : « En sortant du travail c’est la même chose. Les … l’après-midi quand je suis de nuit. »

- **Lieu** : Le RER, puis la supérette · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le RER ; l'escalier mécanique ; trois cafés brûlants.
- **Photos de Karl** : [33035652](https://photos.karlforterre.fr/photo/33035652/) « RER » (photo) ; [19059623](https://photos.karlforterre.fr/photo/19059623/) « Homme en costume sur un escalator extérieur en noir et blanc » (photo) ; [36117556](https://photos.karlforterre.fr/photo/36117556/) « Cappuccino en tasse bleue, carafe de café filtre et part de gâteau aux amandes » (photo)
- **Geste** : « mes mains pianotent des messages pour Amélie » → taper : des bulles « … » s'écrivent, sans contenu (le livre ne le donne pas) (sinon : toucher)
- **Son** : métro ; vibration

### 4.4 La friperie

¶102–103, 91 mots : « Amélie m’a parlé d’une petite friperie qui venait d’ouvrir … exactement ce qui me retient ici. »

- **Lieu** : Une rue, le campus · **monde** : Julie · **entrée** : obturateur
- **Décor** : Julie de dos, dans la rue ; les étudiants.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo) ; [18458017](https://photos.karlforterre.fr/photo/18458017/) « Étudiant sur sa route » (photo)
- **Geste** : « je me décide à faire le chemin » → marcher : glisser vers l'avant (sinon : toucher)
- **Son** : rue
- **Note** : La photo « Dos » de Karl : Julie vue de dos, un chouchou rouge dans les cheveux.

### 4.5 Partir

¶103–104, 137 mots : « Ma famille n’a jamais été très câlins et appels … rencontrerai peut-être l’homme dont je rêve. »

- **Lieu** : La rue, puis la campagne rêvée · **monde** : Julie · **entrée** : même plan
- **Décor** : La rue grise ; puis la campagne, le temps d'une pensée.
- **Photos de Karl** : [10355467](https://photos.karlforterre.fr/photo/10355467/) « Piéton traversant un carrefour devant un immeuble moderne arrondi » (photo) ; [13087478](https://photos.karlforterre.fr/photo/13087478/) « Chemin de terre bordé d'arbres à Moyemont, un été idyllique » (photo)
- **Geste** : « Je veux prendre l’air » → écarter la ville d'un glissement : la campagne apparaît (sinon : toucher)
- **Son** : rue ; puis oiseaux de la campagne
- **Note** : Le chemin de Moyemont, photo la plus vue de Karl après le ciel étoilé.

### 4.6 Le prince

¶105, 104 mots : « Trouver un prince avec qui convoler faisait partie des … pense pas qu’il s’agissait d’un numéro. »

- **Lieu** : La vitrine de la rue Rousseau · **monde** : Julie · **entrée** : obturateur
- **Décor** : La vitrine du chapitre 2, vue par Julie.
- **Moment** : « Il m’a abordée devant cette vitrine de la rue Rousseau » → la vitrine
- **Son** : rue
- **Repérage** : La même vitrine qu'en 2.2

### 4.7 Un numéro

¶105–108, 123 mots : « Un numéro, je me suis surprise à lui demander … dois me préparer pour ce jour. »

- **Lieu** : Chez Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : Le téléphone de Julie : une fiche de contact.
- **Geste** : « je me suis surprise à lui demander le sien » → fiche de contact : on écrit « Darshan », le numéro reste vide (sinon : toucher)
- **Moment** : « dans quatre jours je serai chez lui » → compte à rebours : quatre jours, du côté de Julie
- **Objet** : + téléphone (le sac de Julie s'ouvre)
- **Son** : chambre

## Chapitre 5 : Douceurs et confettis

### 5.1 Soixante-douze heures

¶109–111, 88 mots : « Douceurs et confettis / Il y a encore soixante-douze … rappelle à moi nos moments complices. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : bandes
- **Décor** : L'oreiller, la fenêtre ; dehors, une lueur d'or passe.
- **Photos de Karl** : [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » (photo)
- **Geste** : « dehors, à la fenêtre, je sens sa présence » → toucher la vitre : une lueur d'or passe dehors (sinon : toucher)
- **Moment** : « Il y a encore soixante-douze heures qui me séparent de son regard » → compte à rebours : 72 heures
- **Son** : chambre

### 5.2 Le marché d'Aluva

¶112–113, 112 mots : « Darshan cavale sur le marché d’Aluva avec Jivan sur … l’étal de fruits à sa portée. »

- **Lieu** : Aluva, le marché · **monde** : Darshan · **entrée** : encre
- **Décor** : Étals peints : thés, curcuma, encens, jarres, tapisseries ; Jivan essoufflé derrière.
- **Photos de Karl** : [11968793](https://photos.karlforterre.fr/photo/11968793/) « Tapis de rêves » (modèle) ; [31514840](https://photos.karlforterre.fr/photo/31514840/) « Tapis vert » (modèle) ; [29136749](https://photos.karlforterre.fr/photo/29136749/) « Tapis » (modèle) ; [31514837](https://photos.karlforterre.fr/photo/31514837/) « Marché de Niort » (modèle)
- **Geste** : « Darshan fait l’acquisition des thés les plus délicats, de curcuma, d’encens, de jarres et de tapisseries » → toucher chaque étal : cinq objets rejoignent le sac (sinon : toucher cinq fois)
- **Objet** : + thés, + curcuma, + encens, + jarres, + tapisseries (cinq envols)
- **Son** : marché

### 5.3 Julie est mon nord

¶114–116, 119 mots : « — Je ne puis calmer mes ardeurs, nous sommes … autour de laquelle tu veux discutailler. »

- **Lieu** : Le marché · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor.
- **Moment** : « Julie est mon nord, mon étoile du matin » → la boussole du carnet se tourne vers Julie
- **Son** : marché

### 5.4 À la belle étoile

¶117–119, 99 mots : « — Je te laisse discutailler, tergiverser et palabrer à … limitaient à leur présenter ta personne. »

- **Lieu** : Le marché · **monde** : Darshan · **entrée** : même plan
- **Décor** : Le même décor.
- **Son** : marché

### 5.5 Le quartier Foch

¶120–123, 159 mots : « — Tu ne suis rien, ce n’est pas une … confettis qui rejoint promptement ses fournitures. »

- **Lieu** : Le marché ; la façade rêvée · **monde** : Darshan · **entrée** : même plan
- **Décor** : Dans les paroles de Darshan, une façade couleur du lait (photo de Karl, passée à l'encre).
- **Photos de Karl** : [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (encre)
- **Geste** : « un paquet de confettis qui rejoint promptement ses fournitures » → toucher les confettis : ils éclatent, puis rejoignent le sac (sinon : toucher)
- **Objet** : + confettis (envol)
- **Son** : marché

### 5.6 La galerie

¶124, 94 mots : « Allongée sur son lit, Julie navigue sur son téléphone, … gilet jaune qu’il ne quitte pas. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : obturateur
- **Décor** : Julie sur son lit, le téléphone ; la galerie : les bonbons, la glace, le croque-monsieur.
- **Photos de Karl** : [38256669](https://photos.karlforterre.fr/photo/38256669/) « Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait » (photo) ; [29360492](https://photos.karlforterre.fr/photo/29360492/) « Bonbon vosgien » (photo)
- **Geste** : « elle se perd dans ses photos » → faire défiler la galerie (sinon : flèches)
- **Son** : chambre
- **Note** : Seul endroit où l'on voit Darshan : dans les photos du téléphone de Julie.
- **Repérage** : Pour la galerie : bonbons piquants, patinoire, croque-monsieur partagé (avec un modèle)

### 5.7 Le révolu don Juan

¶124, 93 mots : « L’angle du téléphone les rapetisse. Il met en valeur … lune une ballade romantique en italien. »

- **Lieu** : La galerie du téléphone · **monde** : Julie · **entrée** : glissement
- **Décor** : Les photos où ses lunettes changent ; le chevalet au bord de la Seine ; la vidéo sous la lune.
- **Photos de Karl** : [13263103](https://photos.karlforterre.fr/photo/13263103/) « Lune et rateau » (photo) ; [13102252](https://photos.karlforterre.fr/photo/13102252/) « Croissant de lune dans un ciel crépusculaire aux dégradés sereins » (photo) ; [38536478](https://photos.karlforterre.fr/photo/38536478/) « Portrait détendu d'un homme à lunettes et chemise blanche, plein d'assurance » (modèle)
- **Geste** : « elles changent assez régulièrement, remarque Julie » → toucher les lunettes sur chaque photo : toutes différentes (sinon : toucher)
- **Moment** : « une vidéo montre Darshan chanter à contre-jour de la lune » → vidéo sous la lune, en silhouette
- **Son** : chambre ; ballade fredonnée (musique libre de droits)
- **Note** : Le portrait 38536478 (lunettes, moustache, bouc) ressemble à Darshan : à n'utiliser qu'avec l'accord écrit du modèle, que seul Karl peut obtenir.
- **Repérage** : Chevalet sur les quais de la Seine ; silhouette qui chante devant la lune

### 5.8 Des garçons normaux

¶125–127, 129 mots : « Julie rougit, elle revoit tous les regards qui étaient … à l’abri de l’érosion du temps. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : Le souvenir de la foule ; la mélodie.
- **Geste** : « battues par un pied leste » → battre la mesure du doigt (sinon : toucher en rythme)
- **Son** : chambre ; mélodie

### 5.9 Je l'aime

¶128–129, 130 mots : « La fille que tu étais n’a-t-elle pas toujours voulu … de leur amour que brandit Julie. »

- **Lieu** : La chambre de Julie · **monde** : Julie · **entrée** : même plan
- **Décor** : La fenêtre, la lune.
- **Photos de Karl** : [13102252](https://photos.karlforterre.fr/photo/13102252/) « Croissant de lune dans un ciel crépusculaire aux dégradés sereins » (photo)
- **Geste** : « Il choisit la synchronie d’une dépendance à deux » → taper au rythme d'un second cœur jusqu'à l'unisson (sinon : toucher en rythme)
- **Moment** : « La foudre est une caresse » → éclair (transition lumière)
- **Moment** : « le souhait porté à la lune » → la lune
- **Son** : chambre ; battements de cœur

### 5.10 La pâtisserie

¶130, 113 mots : « Elle se lève, s’habille, rejoint la rue puis part … de faire chavirer son cœur ? »

- **Lieu** : La rue, la pâtisserie · **monde** : Julie · **entrée** : obturateur
- **Décor** : La rue se fait floue ; les gâteaux, comme des bouteilles à la mer.
- **Photos de Karl** : [16592454](https://photos.karlforterre.fr/photo/16592454/) « Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit » (photo) ; [10369144](https://photos.karlforterre.fr/photo/10369144/) « Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise » (photo) ; [36117556](https://photos.karlforterre.fr/photo/36117556/) « Cappuccino en tasse bleue, carafe de café filtre et part de gâteau aux amandes » (photo)
- **Geste** : « Julie ne voit que les mets qu’elle pourrait choisir » → faire défiler les gâteaux : éclair, chocolat, café, baba au rhum (sinon : flèches)
- **Son** : rue ; puis pâtisserie
- **Repérage** : Éclair, baba au rhum en vitrine

### 5.11 La charlotte

¶131–133, 115 mots : « Julie s’égare dans ses songes. Son imagination l’amène à … son rendez-vous est à treize heures. »

- **Lieu** : La pâtisserie · **monde** : Julie · **entrée** : même plan
- **Décor** : La vitrine embuée ; la charlotte aux framboises.
- **Geste** : « au travers d’une vitrine embuée » → essuyer la buée du doigt : la charlotte apparaît (sinon : toucher)
- **Moment** : « Elle le récupérera à onze heures et son rendez-vous est à treize heures » → deux heures au compte à rebours
- **Objet** : + ticket de la pâtisserie (envol, sac de Julie)
- **Son** : pâtisserie
- **Repérage** : Charlotte aux framboises derrière une vitrine embuée

## Chapitre 6 : Des attentes de part et d’autre

### 6.1 Il est midi

¶134–135, 71 mots : « Des attentes de part et d’autre / Il est … des dalles de la rue Rousseau. »

- **Lieu** : Paris, la rue Rousseau · **monde** : Julie · **entrée** : bandes
- **Décor** : Julie de dos ; le paquet ; le ruban rouge dans le mistral.
- **Photos de Karl** : [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » (photo) ; [10683520](https://photos.karlforterre.fr/photo/10683520/) « Décoration de Noël avec nœud vichy rouge, baies de houx et guirlande dorée » (modèle)
- **Moment** : « Le ruban rouge s’agite à chaque mouvement de balancier » → le ruban flotte au vent
- **Objet** : ticket → gâteau → paquet au ruban rouge (frisson)
- **Son** : rue ; vent

### 6.2 Les deux listes

¶136–139, 79 mots : « Darshan ne tient pas en place au pied de … rue qui la sépare de Darshan. »

- **Lieu** : Écran partagé · **monde** : les deux · **entrée** : glissement
- **Décor** : Deux moitiés : Darshan à l'encre, Julie en photo ; deux listes se cochent.
- **Geste** : « Veste, barbiche comme il faut, bague, chemise des grands jours » → cocher la liste de Darshan (sinon : toucher)
- **Geste** : « Bague, boucles d’oreilles, gâteau, sac à main » → cocher la liste de Julie (sinon : toucher)
- **Moment** : « contrôler furtivement dans le reflet d’une vitrine son allure » → Julie dans une vitrine
- **Son** : rue ; les deux rues à la fois

### 6.3 Les retrouvailles

¶140–143, 120 mots : « Leurs retrouvailles prennent place à l’ombre du balcon, sous … on sera à l’intérieur, coupe Julie. »

- **Lieu** : Au pied de la bâtisse · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le balcon, la jardinière ; un halo couleur de blé.
- **Photos de Karl** : [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (photo) ; [34500326](https://photos.karlforterre.fr/photo/34500326/) « Pont de pierre à arches avec réverbères et jardinières à Cognac » (modèle)
- **Moment** : « un halo de la couleur du blé » → halo de blé
- **Son** : rue
- **Repérage** : Balcon parisien fleuri, sa jardinière

### 6.4 La clé dans la poche

¶144–147, 153 mots : « — Oui bien sûr, laisse-moi un instant, je vais … son aimé, puis pousse la porte. »

- **Lieu** : La porte de la demeure · **monde** : Julie · **entrée** : même plan
- **Décor** : La porte ; Darshan sans ses lunettes ; puis des binocles ronds.
- **Geste** : « puis pousse la porte » → pousser la porte, comme Julie (sinon : toucher)
- **Objet** : lunettes → clé (hors champ : Julie ne voit rien)
- **Objet** : + binocles (envol)
- **Son** : rue ; porte
- **Repérage** : Porte d'immeuble de maître, marbrée

### 6.5 Le repère de la grâce

¶148, 88 mots : « S’ouvre à elle tout en douceur et sobriété le … qualité de l’étoffe entre ses doigts. »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : porte
- **Décor** : Étoffes aux fenêtres, patères, pardessus, poufs de velours.
- **Photos de Karl** : [38570569](https://photos.karlforterre.fr/photo/38570569/) « Détail d'une patère en bois sur un portemanteau chromé, ciré jaune en arrière-plan flou » (photo)
- **Geste** : « Il l’accroche sur l’une des patères disponibles » → accrocher la veste : glisser vers la patère (sinon : toucher)
- **Geste** : « Julie est troublée par la qualité de l’étoffe entre ses doigts » → maintenir le doigt sur le velours (sinon : maintenir)
- **Objet** : − veste de Julie (dépôt)
- **Son** : appartement

### 6.6 Les toiles

¶148, 125 mots : « L’encens et le thé sont servis dans le salon. … berges tracées à l’encre de Chine. »

- **Lieu** : L'appartement · **monde** : les deux · **entrée** : même plan
- **Décor** : Les toiles de Darshan : ce sont les dessins du jeu lui-même, à l'encre, et la seule aquarelle.
- **Geste** : « Leur fumet agit comme un fil d’Ariane qui guide les pas de Julie entre les toiles » → suivre le fil de fumée du doigt, de toile en toile (sinon : flèches)
- **Objet** : − encens, − thés (dépôt : servis dans le salon)
- **Son** : appartement ; encens
- **Note** : Mise en abyme : les toiles accrochées sont les décors du monde de Darshan.

### 6.7 Le vertige

¶149, 76 mots : « Julie se confond en émotions, elle reprend son souffle … ses vertiges avec un bon thé. »

- **Lieu** : L'appartement, la fenêtre · **monde** : Julie · **entrée** : même plan
- **Décor** : Les moulures ; par la fenêtre, une ville qui n'est pas la rue Rousseau.
- **Photos de Karl** : [12443176](https://photos.karlforterre.fr/photo/12443176/) « Toits pictaves » (photo)
- **Geste** : « Au bord de sa fenêtre » → écarter le rideau : la rue n'est pas la rue Rousseau (sinon : toucher)
- **Son** : appartement

### 6.8 Le thé de haut

¶150–152, 102 mots : « Darshan joint sa main gauche à la anse de … sourire amusé accompagné d›un index naïf. »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : même plan
- **Décor** : La théière levée, le filet de thé, la tasse de cuivre ; « Le lac Ladoga ».
- **Photos de Karl** : [37296469](https://photos.karlforterre.fr/photo/37296469/) « Thé versé d'un gaiwan céladon dans une tasse en porcelaine blanche » (modèle) ; [34342149](https://photos.karlforterre.fr/photo/34342149/) « Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc » (encre)
- **Geste** : « Il la hisse à hauteur d’épaule » → lever la théière : glisser vers le haut, le thé coule de haut (sinon : maintenir)
- **Moment** : « Le lac Ladoga » → le tableau : une barque sur un lac, peinte d'après Karl
- **Son** : appartement ; thé versé
- **Repérage** : Chai versé de haut dans une tasse de cuivre

### 6.9 Théo est un ami

¶153–155, 105 mots : « — Oui, Théo est un ami, il me l’a … qui ne peut se permettre d’attendre. »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : même plan
- **Décor** : Le même plan.
- **Son** : appartement

### 6.10 Le dosa

¶156–157, 76 mots : « Julie rougit tandis que Darshan tend une assiette dotée … son regard dans le sien : »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : fondu
- **Décor** : La galette fine et croustillante ; le jour décline.
- **Geste** : « Darshan pose sa main sur celle de Julie » → maintenir : la main sur la main (sinon : maintenir)
- **Son** : appartement
- **Repérage** : Dosa sur une assiette, deux fourchettes

### 6.11 Je tiens à toi

¶158–160, 102 mots : « Je tiens à toi, tu sais… / — Je … mais elles ne mènent nulle part… »

- **Lieu** : L'appartement · **monde** : Julie · **entrée** : même plan
- **Décor** : Darshan, les mains au ciel ; l'attente.
- **Photos de Karl** : [38570603](https://photos.karlforterre.fr/photo/38570603/) « Graffiti « je t'aime » peint en violet sur une surface orangée et rouillée » (photo)
- **Geste** : « Darshan se lève, porte ses mains au ciel et attend » → attendre, comme lui : dix secondes, sans rien toucher (sinon : attendre)
- **Moment** : « Dix longues secondes s’écoulent » → dix secondes, vraiment
- **Moment** : « d’un mouvement de poignet les change en clés » → éclat raté : des clés
- **Moment** : « mais elles ne mènent nulle part » → les portes ne s'ouvrent sur rien
- **Objet** : lunettes → clés (éclat brisé)
- **Son** : appartement ; puis silence
- **Note** : Option : le graffiti « je t'aime » de Karl, un instant, quand Julie le dit.

### 6.12 Des paysages dépourvus de sens

¶161–162, 96 mots : « Julie ne comprend pas ce qui se déroule sous … comment Julie peut-elle y croire ? »

- **Lieu** : L'appartement · **monde** : les deux · **entrée** : même plan
- **Décor** : La fonte visqueuse vue par Julie ; derrière chaque porte, un paysage de Karl, sans rapport avec le suivant.
- **Photos de Karl** : [34894953](https://photos.karlforterre.fr/photo/34894953/) « Le phare du Loup, solitaire dans la brume marine » (photo) ; [13087478](https://photos.karlforterre.fr/photo/13087478/) « Chemin de terre bordé d'arbres à Moyemont, un été idyllique » (photo) ; [34849705](https://photos.karlforterre.fr/photo/34849705/) « Architecture gothique de l'abbaye du Mont-Saint-Michel, arches élancées et vitraux » (photo) ; [38694057](https://photos.karlforterre.fr/photo/38694057/) « Vue aérienne des parterres élaborés des jardins de Villandry » (photo) ; [10644439](https://photos.karlforterre.fr/photo/10644439/) « Maquette de voilier prise dans la banquise sous une lumière bleue » (photo) ; [35024039](https://photos.karlforterre.fr/photo/35024039/) « Rochers empilés formant un monument naturel sous un ciel bleu et nuageux » (photo)
- **Geste** : « Il répète l’opération » → ouvrir porte après porte : chacune donne sur une photo de Karl (sinon : toucher)
- **Moment** : « s’est fondue le temps d’un instant en une matière visqueuse » → la fonte des lunettes, vue du dehors
- **Son** : appartement ; portes
- **Note** : Les photos les plus vues de Karl, jetées l'une après l'autre.

### 6.13 Le placard

¶163, 104 mots : « Si cette fenêtre ne te convainc pas, cette porte … tente de prendre la parole : »

- **Lieu** : L'appartement · **monde** : les deux · **entrée** : même plan
- **Décor** : La main tendue ; le placard ; la verdure proche du parc Montsouris.
- **Photos de Karl** : [32429189](https://photos.karlforterre.fr/photo/32429189/) « Couloir vers l'impasse » (photo)
- **Geste** : « Darshan se saisit de la main de Julie et l’invite à le suivre » → la main tendue : au toucher, Julie la retire (sinon : toucher)
- **Moment** : « le placard donne sur un espace de verdure proche du parc Montsouris » → porte : le placard s'ouvre sur un parc
- **Objet** : clé de laiton : dans la serrure du placard (frisson)
- **Son** : appartement ; puis parc

### 6.14 Ta colère est juste

¶164–166, 106 mots : « Ta colère est juste, je t’ai menti. Il n’empêche … ne veux que retrouver mon père… »

- **Lieu** : Le placard ouvert · **monde** : les deux · **entrée** : même plan
- **Décor** : Par le placard : le palier de Julie, son lierre.
- **Photos de Karl** : [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo)
- **Son** : parc

### 6.15 Un moyen

¶167–169, 107 mots : « — C’est ce que tu veux, je ne suis … ce qui vient de se passer. »

- **Lieu** : Le palier de Julie · **monde** : Julie · **entrée** : porte
- **Décor** : Julie seule, ses lierres, le paquet au ruban rouge.
- **Photos de Karl** : [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » (photo) ; [34978560](https://photos.karlforterre.fr/photo/34978560/) « Entrée de maison éclairée par une seule lampe par une nuit de brouillard » (photo)
- **Geste** : « elle parcourt les quelques mètres la séparant de son palier » → traverser le placard : glisser vers l'avant (sinon : toucher)
- **Moment** : « son paquet au ruban rouge à la main » → le paquet, jamais offert
- **Son** : rue ; soir
- **Repérage** : Paquet de pâtisserie noué d'un ruban rouge

## Chapitre 7 : Au-delà de la porte

### 7.1 Le désert

¶170–171, 65 mots : « Au-delà de la porte / Paupières fermées sur le … dans l’espoir de réchauffer son cœur. »

- **Lieu** : Le désert libyque, la nuit · **monde** : Darshan · **entrée** : bandes
- **Décor** : Le désert peint ; des astres fuyants ; le doigt de dieu.
- **Photos de Karl** : [39595391](https://photos.karlforterre.fr/photo/39595391/) « Voie lactée et ciel étoilé à couper le souffle, en Galice » (encre) ; [35024039](https://photos.karlforterre.fr/photo/35024039/) « Rochers empilés formant un monument naturel sous un ciel bleu et nuageux » (modèle)
- **Geste** : « Paupières fermées sur le ciel » → maintenir pour fermer les yeux (sinon : maintenir)
- **Moment** : « sur elle ruissellent des astres fuyants » → étoiles filantes, comme des larmes
- **Son** : désert

### 7.2 La coccinelle

¶172–173, 108 mots : « La coccinelle contrainte de quitter son jardin prépare sa … ces personnages torturés un parallèle réconfortant. »

- **Lieu** : La mousse ; puis la chambre de Julie · **monde** : les deux · **entrée** : fondu
- **Décor** : La coccinelle sous des pétales fanés, dans la mousse ; puis Julie devant sa série.
- **Photos de Karl** : [11968793](https://photos.karlforterre.fr/photo/11968793/) « Tapis de rêves » (photo) ; [39182180](https://photos.karlforterre.fr/photo/39182180/) « Gros plan sur du lichen et de la mousse couvrant des rochers, à Buzy » (photo)
- **Moment** : « La coccinelle contrainte de quitter son jardin prépare sa diapause » → intermède
- **Moment** : « Julie fixe sa télé » → l'écran bleu de la télévision
- **Son** : vent ; puis télévision lointaine
- **Repérage** : Coccinelle dans la mousse (macro)

### 7.3 Une larme

¶174, 72 mots : « Le soupirant souffle tout son soûl, la demoiselle panse … solution que se prendre en main. »

- **Lieu** : Entre les deux mondes · **monde** : les deux · **entrée** : encre
- **Décor** : Un glaçon au fond d'un verre devient banquise ; puis les dunes.
- **Photos de Karl** : [35760712](https://photos.karlforterre.fr/photo/35760712/) « Verre de café glacé avec un gros glaçon à côté d'une carafe en verre » (photo) ; [10644439](https://photos.karlforterre.fr/photo/10644439/) « Maquette de voilier prise dans la banquise sous une lumière bleue » (photo)
- **Moment** : « un glaçon au fond d’un mojito ne forme pas un iceberg » → le glaçon devient banquise, en fondu enchaîné
- **Son** : désert

### 7.4 Le désert fleurit

¶175–176, 87 mots : « Darshan voit le désert fleurir sous l’averse. Julie renoue … à s’oublier ne les lâche pas. »

- **Lieu** : Le désert ; l'hôpital ; le Periyar · **monde** : les deux · **entrée** : encre
- **Décor** : L'averse ; les fleurs sauvages ; les brancards ; Jivan qui prie.
- **Photos de Karl** : [34408656](https://photos.karlforterre.fr/photo/34408656/) « Pluie » (photo) ; [35086239](https://photos.karlforterre.fr/photo/35086239/) « Champ de fleurs sauvages blanches et jaunes en pleine floraison » (photo)
- **Geste** : « Darshan voit le désert fleurir sous l’averse » → faire pleuvoir : glisser vers le bas, les fleurs naissent où tombent les gouttes (sinon : toucher)
- **Son** : pluie
- **Repérage** : Brancards dans un couloir d'hôpital, sans patient

### 7.5 Derrière les portes

¶177–182, 139 mots : « Liqueurs et opiums ne suffiraient pas à mon sevrage … appareil puis part reprendre son service. »

- **Lieu** : L'hôpital, la salle de dépôt · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le couloir sombre, la lanterne ; la porte du local.
- **Photos de Karl** : [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » (photo)
- **Geste** : « elle frappe gentiment la surface de la porte » → frapper deux fois (sinon : toucher deux fois)
- **Moment** : « Darshan, tu m’entends » → silence
- **Objet** : + électrocardiogramme (envol, sac de Julie)
- **Son** : hôpital

### 7.6 Le feu

¶183–187, 113 mots : « Darshan attise la braise du feu destiné à cuire … de prendre le relais au feu. »

- **Lieu** : Aluva, au bord du Periyar · **monde** : Darshan · **entrée** : encre
- **Décor** : Le feu des sardines ; Jivan reprend le relais.
- **Photos de Karl** : [22591346](https://photos.karlforterre.fr/photo/22591346/) « Salamandre » (modèle)
- **Geste** : « Darshan attise la braise du feu » → attiser : glisser sur les braises, les étincelles montent (sinon : toucher)
- **Objet** : + de quoi écrire (envol)
- **Son** : kerala ; feu

### 7.7 Darshan écrit

¶188–193, 53 mots : « Darshan écrit : / Nous et rien d’autre. / … pour que l’on recouvre ce Nous. »

- **Lieu** : Aluva · **monde** : Darshan · **entrée** : même plan
- **Décor** : La lettre, qui s'écrit à l'encre, trait par trait.
- **Geste** : « Darshan écrit » → écrire du doigt : chaque trait fait paraître les mots (sinon : toucher)
- **Objet** : + lettre (envol)
- **Son** : kerala ; plume

### 7.8 Encrés

¶194–195, 90 mots : « Les mots sont encrés : plus rien ne peut … j’ai fait ma part d’heures supplémentaires. »

- **Lieu** : Le local à kayaks ; la pharmacie de l'hôpital · **monde** : les deux · **entrée** : même plan
- **Décor** : La porte du local ; la fente lumineuse ; la pharmacie d'où jaillit le papier.
- **Photos de Karl** : [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » (modèle)
- **Geste** : « plus rien ne peut les effacer » → tenter d'effacer : l'encre résiste (sinon : toucher)
- **Geste** : « Darshan y glisse sa déclaration » → glisser la lettre sous la porte (sinon : toucher)
- **Moment** : « voit jaillir de la fente de la pharmacie à morphiniques, un papier » → la lettre passe d'un monde à l'autre
- **Objet** : lunettes → clé (éclat court)
- **Objet** : lettre : Darshan → Julie (transfert)
- **Son** : kerala ; course, porte, puis hôpital
- **Repérage** : Fente d'un meuble de pharmacie, sans médicament lisible

### 7.9 Le chemin du retour

¶196, 84 mots : « Julie s’engage sur le chemin pour rentrer, le mot … pas, je ne peux pas ! »

- **Lieu** : Paris, le chemin de Julie · **monde** : Julie · **entrée** : obturateur
- **Décor** : Le trottoir ; un banc ; trente mètres plus loin, Darshan et un paquet au ruban rouge.
- **Photos de Karl** : [10355467](https://photos.karlforterre.fr/photo/10355467/) « Piéton traversant un carrefour devant un immeuble moderne arrondi » (photo) ; [23414383](https://photos.karlforterre.fr/photo/23414383/) « Un banc en bois serein entouré d'un feuillage d'automne éclatant dans un parc paisible » (photo)
- **Geste** : « elle court à la vue de Darshan » → courir : toucher en rythme, comme la danse des tuiles (sinon : toucher en rythme)
- **Son** : rue ; été
- **Repérage** : Rue de Rungis (Paris 13e) ; banc en été

### 7.10 Genou à terre

¶197–199, 115 mots : « Au prochain croisement, il sort d’une voiture garée le … frais comme la rosée, l’a adoubé. »

- **Lieu** : Rue de Rungis · **monde** : Julie · **entrée** : même plan
- **Décor** : La voiture garée ; Darshan à genou ; les remparts haussmanniens.
- **Photos de Karl** : [39423920](https://photos.karlforterre.fr/photo/39423920/) « Voiture argentée garée près d'un mur, panneau bleu de virage à droite, à Irun, au Pays basque » (photo) ; [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » (photo)
- **Geste** : « Darshan reçoit la marque de dilection sur sa nuque » → maintenir : le baiser (sinon : maintenir)
- **Moment** : « Le ruban de satin s’affole » → le ruban s'affole au vent
- **Son** : rue ; tout ralentit

### 7.11 Éclipse

¶200–203, 125 mots : « Ses yeux s’ouvrent, quittent les souliers de sa belle, … secrètement la surprise de l’émerveillement quotidien. »

- **Lieu** : Rue de Rungis · **monde** : Julie · **entrée** : même plan
- **Décor** : Des souliers au regard ; puis passants et voitures s'effacent de la photo.
- **Photos de Karl** : [31641251](https://photos.karlforterre.fr/photo/31641251/) « Fantômes » (photo) ; [10473138](https://photos.karlforterre.fr/photo/10473138/) « Rue commerçante étroite et déserte la nuit avec pavés et lanternes » (photo)
- **Geste** : « remontent une robe crépue de la couleur de l’orange » → lever les yeux : glisser vers le haut (sinon : toucher)
- **Moment** : « Le contact de leurs corps éclipse tout Paris » → passants et voitures s'effacent, le son se tait
- **Objet** : paquet au ruban rouge : Darshan → Julie (transfert)
- **Son** : rue ; qui se tait
- **Repérage** : Souliers et robe orange (modèle)

### 7.12 La porte du père

¶204–206, 120 mots : « Ils sourient, mais les dalles du trottoir de la … l’arrêt, les fenêtres débordent de curieux. »

- **Lieu** : Rue de Rungis · **monde** : les deux · **entrée** : même plan
- **Décor** : Les dalles se fendent : la porte à la lanterne, peinte, perce le Paris photographié.
- **Photos de Karl** : [34762346](https://photos.karlforterre.fr/photo/34762346/) « Porte en bois rustique et sa lanterne, charme d'autrefois » (encre) ; [12073837](https://photos.karlforterre.fr/photo/12073837/) « Ciel et pavés » (photo)
- **Moment** : « vibrent sous leurs pieds » → le téléphone vibre, l'image tremble
- **Moment** : « laissent apparaître le linteau » → la porte du père perce la photo
- **Son** : rue ; grondement, puis la lanterne
- **Note** : Temps fort : seule image où l'encre de Darshan entre dans le Paris de Julie.

### 7.13 Le choix

¶207–211, 85 mots : « C’est mon père qui se tient derrière ces battants, … du pont menant vers son créateur. »

- **Lieu** : Rue de Rungis · **monde** : les deux · **entrée** : même plan
- **Décor** : La porte ; les curieux aux fenêtres.
- **Geste** : « pose sa main sur l’éternel bois du pont menant vers son créateur » → poser la paume sur le bois : la clé, pour une fois, n'est pas proposée (sinon : maintenir)
- **Son** : silence

### 7.14 La prière

¶212, 68 mots : « — Père, je suis sûr que vous m’entendez, vous … avec l’intensité inestimable de chaque instant. »

- **Lieu** : Rue de Rungis · **monde** : les deux · **entrée** : même plan
- **Décor** : La main sur le bois.
- **Moment** : « En faisant de moi un mortel » → désenchantement : la clé quitte le sac, les étoiles du carnet s'éteignent
- **Objet** : clé : désenchantement (elle se défait en poussière d'or)
- **Objet** : le bouton « Objets » disparaît
- **Son** : silence ; souffle

### 7.15 La chute

¶213, 70 mots : « La stupéfaction n’a plus de limite pour Julie. Elle … avoir été marqués par les événements. »

- **Lieu** : Rue de Rungis · **monde** : Julie · **entrée** : même plan
- **Décor** : La porte tombe sans laisser de trace ; les passants reprennent leur chemin.
- **Photos de Karl** : [31641251](https://photos.karlforterre.fr/photo/31641251/) « Fantômes » (photo)
- **Moment** : « un bruit sourd et puissant retentit » → le choc ; plus aucune trace d'encre
- **Son** : rue ; choc, puis la ville revient

### 7.16 La fantasy s'achève

¶214–215, 85 mots : « Il ne reste que le Bohème et ses deux … de la fantasy qui s’achève ? »

- **Lieu** : La page · **monde** : livre · **entrée** : fondu
- **Décor** : Texte nu sur papier : plus d'interface.
- **Moment** : « Ne sentez-vous pas toujours cette distance qui se crée en fermant votre porte » → la dernière question, sans bouton ni geste
- **Son** : silence
- **Note** : Option personnelle, que seul Karl décide : une vraie photo pour dernière image.

## Clôture

### 8.1 Poème de clôture

¶216–221, 61 mots : « Sobriété et grandeur ne sont que des notions. / … encore des pages et des pages. »

- **Lieu** : La page · **monde** : livre · **entrée** : fondu
- **Décor** : Texte nu ; dernier geste : fermer le livre.
- **Son** : silence
- **Note** : Au retour, la page de titre montre un ciel sans constellation ; « Nouvelle lecture » rallume tout.

## Production, chantier par chantier

Les chantiers D3 à D7 de [plan-darshan.md](plan-darshan.md), une session chacun, dans l'ordre.
Avant eux, D1 (fondations) et D2 (direction artistique, dont le passage à l'encre des photos),
et les chantiers I1 et I2 de l'interface. Les nombres viennent du découpage ci-dessus.

### D3. Chapitres 1 et 2

- **Tableaux** : 17 (0.1 à 2.10), 1586 mots, 14 gestes
- **Plans nouveaux** : 10, dont 3 décors dessinés (monde de Darshan)
- **Photos de Karl** : 14 telles quelles, 1 passées à l'encre ; **repérages** : 5
- **Mécaniques** : glisser, maintenir, toucher, tracer ; nouvelles : **glisser, maintenir, tracer**
- **Ambiances sonores** : cosmos, kerala, parc, restaurant, rue, vent ; nouvelles : **parc, restaurant, rue, vent**
- **À construire** : dédicace sur la page de titre ; interface de dialogue (chantier I3) ; reflets de Paris dans le fleuve (photos ondulées par un canevas) ; mise au point sur une seule zone de la photo (le reste flou) ; question « assourdie » jusqu'au réveil ; carte du restaurant à une seule ligne ; travelling dans le parc (plans superposés) ; ombre d'un nuage qui balaie la photo.

### D4. Chapitre 3

- **Tableaux** : 14 (3.1 à 3.14), 1370 mots, 9 gestes
- **Plans nouveaux** : 9, dont 9 décors dessinés (monde de Darshan)
- **Photos de Karl** : 0 telles quelles, 12 passées à l'encre ; **repérages** : 0
- **Mécaniques** : deux pouces, glisser, maintenir, pincer, toucher ; nouvelles : **deux pouces, pincer**
- **Ambiances sonores** : bibliothèque, cosmos, kerala, vision ; nouvelles : **bibliothèque, vision**
- **À construire** : défilé des portes de Karl passées à l'encre ; trou qui devient entrée (frisson) ; espace qui se plie (carte du carnet) ; calligraphie des deux vers, trait par trait, versés au carnet ; mudrā à deux doigts, respiration maintenue ; vision : la couleur naît du noir, la lanterne s'allume ; porte qui recule sous la main ; compte à rebours des quatre jours.

### D5. Chapitres 4 et 5

- **Tableaux** : 18 (4.1 à 5.11), 2007 mots, 14 gestes
- **Plans nouveaux** : 10, dont 1 décors dessinés (monde de Darshan)
- **Photos de Karl** : 16 telles quelles, 1 passées à l'encre ; **repérages** : 6
- **Mécaniques** : curseur, défiler, essuyer, glisser, rythme, toucher ; nouvelles : **curseur, défiler, essuyer**
- **Ambiances sonores** : chambre, hôpital, marché, métro, pâtisserie, rue ; nouvelles : **chambre, hôpital, marché, métro, pâtisserie**
- **À construire** : interface de Julie : téléphone, bulles sans contenu, fiche de contact au numéro vide ; échelle de la douleur de zéro à dix ; questions de l'hôpital mises en vers ; sac de Julie (inventaire) ; marché d'Aluva : cinq objets ; confettis qui éclatent ; galerie du téléphone et lunettes à repérer ; battements à synchroniser ; éclair (transition lumière) ; buée à essuyer.

### D6. Chapitre 6

- **Tableaux** : 15 (6.1 à 6.15), 1510 mots, 13 gestes
- **Plans nouveaux** : 6, dont 0 décors dessinés (monde de Darshan)
- **Photos de Karl** : 14 telles quelles, 1 passées à l'encre ; **repérages** : 5
- **Mécaniques** : attendre, glisser, maintenir, porter, toucher, tracer ; nouvelles : **attendre**
- **Ambiances sonores** : appartement, parc, rue ; nouvelles : **appartement**
- **À construire** : écran partagé et listes à cocher ; ruban qui flotte au vent ; dépôt d'objets (veste, encens, thé) ; fil de fumée à suivre ; rideau qui s'écarte sur une autre ville ; filet de thé versé de haut ; attente de dix secondes, éclat brisé ; portes qui s'ouvrent sur les paysages de Karl ; main qui se retire ; placard-portail.

### D7. Chapitre 7 et clôture

- **Tableaux** : 17 (7.1 à 8.1), 1540 mots, 11 gestes
- **Plans nouveaux** : 9, dont 2 décors dessinés (monde de Darshan)
- **Photos de Karl** : 14 telles quelles, 2 passées à l'encre ; **repérages** : 5
- **Mécaniques** : essuyer, glisser, maintenir, porter, rythme, toucher, tracer
- **Ambiances sonores** : désert, hôpital, kerala, pluie, rue, silence, vent ; nouvelles : **désert, pluie**
- **À construire** : glaçon qui devient banquise (fondu enchaîné) ; pluie qui fait fleurir le désert ; lettre écrite du doigt, encre ineffaçable ; transfert d'un monde à l'autre (lettre, paquet) ; course rythmée ; Paris qui se vide, le son qui se tait ; porte peinte qui perce la photo ; paume sur le bois, clé non proposée ; désenchantement, interface qui s'éteint ; texte nu, fermer le livre ; « Nouvelle lecture ».

## Repérages : les photos à prendre

Karl les prend à sa manière ; sans visage reconnaissable, ou avec l'accord écrit du modèle.

- 1.7 : Bateaux-mouches sur la Seine, de nuit (« l’éclat des navires parcourant la Seine »)
- 2.1 : Une main posée sur une nappe de restaurant (modèle)
- 2.2 : Vitrine de boutique : mannequin, guêtres, robe volantée (la vitrine de la rue Rousseau)
- 2.6 : Assiette de tartare de saumon aux herbes fraîches
- 2.7 : Pain perdu (brioche) sur une assiette à motif fleuri, fond jaune tournesol
- 4.2 : Hôpital : couloir, blouses, sans patient ni visage
- 4.6 : La même vitrine qu'en 2.2
- 5.6 : Pour la galerie : bonbons piquants, patinoire, croque-monsieur partagé (avec un modèle)
- 5.7 : Chevalet sur les quais de la Seine ; silhouette qui chante devant la lune
- 5.10 : Éclair, baba au rhum en vitrine
- 5.11 : Charlotte aux framboises derrière une vitrine embuée
- 6.3 : Balcon parisien fleuri, sa jardinière
- 6.4 : Porte d'immeuble de maître, marbrée
- 6.8 : Chai versé de haut dans une tasse de cuivre
- 6.10 : Dosa sur une assiette, deux fourchettes
- 6.15 : Paquet de pâtisserie noué d'un ruban rouge
- 7.2 : Coccinelle dans la mousse (macro)
- 7.4 : Brancards dans un couloir d'hôpital, sans patient
- 7.8 : Fente d'un meuble de pharmacie, sans médicament lisible
- 7.9 : Rue de Rungis (Paris 13e) ; banc en été
- 7.11 : Souliers et robe orange (modèle)

## Index des photographies de Karl

| Photo | Tableaux | Usages |
|---|---|---|
| [10199772](https://photos.karlforterre.fr/photo/10199772/) « Vieille maison couverte de lierre aux volets de bois et femme assise devant » | 2.8, 2.9, 6.14, 6.15 | photo |
| [10220497](https://photos.karlforterre.fr/photo/10220497/) « Rivière claire et peu profonde avec une passerelle et le reflet des arbres » | 3.9 | encre |
| [10310851](https://photos.karlforterre.fr/photo/10310851/) « Ponton en bois et petite barque sur une rivière calme reflétant les nuages » | 1.4, 3.9 | encre |
| [10355467](https://photos.karlforterre.fr/photo/10355467/) « Piéton traversant un carrefour devant un immeuble moderne arrondi » | 4.5, 7.9 | photo |
| [10369144](https://photos.karlforterre.fr/photo/10369144/) « Assiette de cannelés dorés et caramélisés, pâtisserie bordelaise » | 5.10 | photo |
| [10473138](https://photos.karlforterre.fr/photo/10473138/) « Rue commerçante étroite et déserte la nuit avec pavés et lanternes » | 1.7, 7.11 | photo |
| [10524140](https://photos.karlforterre.fr/photo/10524140/) « Arche de rocaille au-dessus d'une allée dans un jardin romantique » | 2.8 | photo |
| [10644439](https://photos.karlforterre.fr/photo/10644439/) « Maquette de voilier prise dans la banquise sous une lumière bleue » | 6.12, 7.3 | photo |
| [10652212](https://photos.karlforterre.fr/photo/10652212/) « Pêcheur à la ligne sur une berge verdoyante bordée de grands arbres » | 1.5, 3.12 | modèle |
| [10683520](https://photos.karlforterre.fr/photo/10683520/) « Décoration de Noël avec nœud vichy rouge, baies de houx et guirlande dorée » | 6.1 | modèle |
| [10879428](https://photos.karlforterre.fr/photo/10879428/) « Couette blanche sur un lit devant des rideaux gris » | 5.1 | photo |
| [11968793](https://photos.karlforterre.fr/photo/11968793/) « Tapis de rêves » | 5.2, 7.2 | modèle, photo |
| [12073837](https://photos.karlforterre.fr/photo/12073837/) « Ciel et pavés » | 1.7, 7.12 | photo |
| [12073840](https://photos.karlforterre.fr/photo/12073840/) « Pont vers la nature » | 2.8 | photo |
| [12443176](https://photos.karlforterre.fr/photo/12443176/) « Toits pictaves » | 6.7 | photo |
| [13087478](https://photos.karlforterre.fr/photo/13087478/) « Chemin de terre bordé d'arbres à Moyemont, un été idyllique » | 4.5, 6.12 | photo |
| [13102252](https://photos.karlforterre.fr/photo/13102252/) « Croissant de lune dans un ciel crépusculaire aux dégradés sereins » | 5.7, 5.9 | photo |
| [13102289](https://photos.karlforterre.fr/photo/13102289/) « Aube » | 0.2 | photo |
| [13263103](https://photos.karlforterre.fr/photo/13263103/) « Lune et rateau » | 5.7 | photo |
| [16592454](https://photos.karlforterre.fr/photo/16592454/) « Traînées lumineuses abstraites sur des personnes floues en mouvement la nuit » | 1.7, 5.10 | photo |
| [18458017](https://photos.karlforterre.fr/photo/18458017/) « Étudiant sur sa route » | 4.4 | photo |
| [19059623](https://photos.karlforterre.fr/photo/19059623/) « Homme en costume sur un escalator extérieur en noir et blanc » | 4.3 | photo |
| [20315376](https://photos.karlforterre.fr/photo/20315376/) « L’heure d’hier » | 1.9 | modèle |
| [22591346](https://photos.karlforterre.fr/photo/22591346/) « Salamandre » | 7.6 | modèle |
| [23414381](https://photos.karlforterre.fr/photo/23414381/) « Vue majestueuse des flèches néogothiques de l'église Saint-André au-dessus de Niort » | 3.5 | encre |
| [23414383](https://photos.karlforterre.fr/photo/23414383/) « Un banc en bois serein entouré d'un feuillage d'automne éclatant dans un parc paisible » | 7.9 | photo |
| [24200555](https://photos.karlforterre.fr/photo/24200555/) « Ciel étoilé » | 1.1 | modèle |
| [27025911](https://photos.karlforterre.fr/photo/27025911/) « Le portail » | 3.2 | encre |
| [27025915](https://photos.karlforterre.fr/photo/27025915/) « Bibliothèque de rue » | 3.6 | encre |
| [27046156](https://photos.karlforterre.fr/photo/27046156/) « Porte forgée » | 1.3, 3.2 | encre, modèle |
| [27116682](https://photos.karlforterre.fr/photo/27116682/) « Un ciel nocturne sombre et immense, empli d'innombrables étoiles et de la voie lactée » | 0.1, 0.2, 1.1, 1.2 | encre, photo |
| [29136749](https://photos.karlforterre.fr/photo/29136749/) « Tapis » | 5.2 | modèle |
| [29360492](https://photos.karlforterre.fr/photo/29360492/) « Bonbon vosgien » | 5.6 | photo |
| [31514837](https://photos.karlforterre.fr/photo/31514837/) « Marché de Niort » | 3.6, 5.2 | encre, modèle |
| [31514840](https://photos.karlforterre.fr/photo/31514840/) « Tapis vert » | 5.2 | modèle |
| [31514847](https://photos.karlforterre.fr/photo/31514847/) « Amour » | 2.8 | photo |
| [31641251](https://photos.karlforterre.fr/photo/31641251/) « Fantômes » | 7.11, 7.15 | photo |
| [32429189](https://photos.karlforterre.fr/photo/32429189/) « Couloir vers l'impasse » | 6.13 | photo |
| [32429190](https://photos.karlforterre.fr/photo/32429190/) « Une porte » | 3.2 | encre |
| [32429264](https://photos.karlforterre.fr/photo/32429264/) « Porte bleue » | 3.2 | encre |
| [32429293](https://photos.karlforterre.fr/photo/32429293/) « Chaise de terrasse française » | 2.1 | photo |
| [32429294](https://photos.karlforterre.fr/photo/32429294/) « Lecture paisible » | 2.3 | modèle |
| [33035627](https://photos.karlforterre.fr/photo/33035627/) « Métro » | 4.1 | photo |
| [33035628](https://photos.karlforterre.fr/photo/33035628/) « Style haussmannien » | 5.5, 6.3, 7.10 | encre, photo |
| [33035632](https://photos.karlforterre.fr/photo/33035632/) « Tour Eiffel encadrée d'arbres verts à Paris » | 2.10 | photo |
| [33035642](https://photos.karlforterre.fr/photo/33035642/) « Un gratte-ciel parisien s'élançant vers un ciel nuageux spectaculaire » | 2.10 | photo |
| [33035648](https://photos.karlforterre.fr/photo/33035648/) « Dos » | 4.4, 6.1 | photo |
| [33035651](https://photos.karlforterre.fr/photo/33035651/) « La Rotonde » | 2.1 | photo |
| [33035652](https://photos.karlforterre.fr/photo/33035652/) « RER » | 4.3 | photo |
| [34342149](https://photos.karlforterre.fr/photo/34342149/) « Barque vide entourée de feuilles d'automne sur un lac calme, en noir et blanc » | 6.8 | encre |
| [34408656](https://photos.karlforterre.fr/photo/34408656/) « Pluie » | 7.4 | photo |
| [34500326](https://photos.karlforterre.fr/photo/34500326/) « Pont de pierre à arches avec réverbères et jardinières à Cognac » | 6.3 | modèle |
| [34500347](https://photos.karlforterre.fr/photo/34500347/) « Fond de tuiles » | 1.2 | photo |
| [34762346](https://photos.karlforterre.fr/photo/34762346/) « Porte en bois rustique et sa lanterne, charme d'autrefois » | 3.2, 3.10, 7.12 | encre, modèle |
| [34849705](https://photos.karlforterre.fr/photo/34849705/) « Architecture gothique de l'abbaye du Mont-Saint-Michel, arches élancées et vitraux » | 6.12 | photo |
| [34894953](https://photos.karlforterre.fr/photo/34894953/) « Le phare du Loup, solitaire dans la brume marine » | 6.12 | photo |
| [34956319](https://photos.karlforterre.fr/photo/34956319/) « Gros plan d'un casier de pêche noir et de filets parmi des fleurs jaunes sauvages » | 1.5 | modèle |
| [34978560](https://photos.karlforterre.fr/photo/34978560/) « Entrée de maison éclairée par une seule lampe par une nuit de brouillard » | 2.9, 6.15 | photo |
| [35024039](https://photos.karlforterre.fr/photo/35024039/) « Rochers empilés formant un monument naturel sous un ciel bleu et nuageux » | 6.12, 7.1 | modèle, photo |
| [35086239](https://photos.karlforterre.fr/photo/35086239/) « Champ de fleurs sauvages blanches et jaunes en pleine floraison » | 7.4 | photo |
| [35086240](https://photos.karlforterre.fr/photo/35086240/) « Faisan de Colchide marchant dans l'herbe sous des kayaks jaunes empilés » | 1.4, 1.9, 7.8 | modèle |
| [35375606](https://photos.karlforterre.fr/photo/35375606/) « Lanterne suspendue éclairant un couloir sombre et vide en noir et blanc » | 4.2, 7.5 | photo |
| [35760712](https://photos.karlforterre.fr/photo/35760712/) « Verre de café glacé avec un gros glaçon à côté d'une carafe en verre » | 7.3 | photo |
| [36117556](https://photos.karlforterre.fr/photo/36117556/) « Cappuccino en tasse bleue, carafe de café filtre et part de gâteau aux amandes » | 4.3, 5.10 | photo |
| [37296469](https://photos.karlforterre.fr/photo/37296469/) « Thé versé d'un gaiwan céladon dans une tasse en porcelaine blanche » | 6.8 | modèle |
| [38256669](https://photos.karlforterre.fr/photo/38256669/) « Nature morte en noir et blanc d'un coussin fleuri et d'un téléphone sur un lit défait » | 5.6 | photo |
| [38279684](https://photos.karlforterre.fr/photo/38279684/) « Reflet artistique de fleurs et d'un lampadaire dans l'eau, effet onirique sous un ciel dégagé » | 1.7 | photo |
| [38536478](https://photos.karlforterre.fr/photo/38536478/) « Portrait détendu d'un homme à lunettes et chemise blanche, plein d'assurance » | 5.7 | modèle |
| [38570569](https://photos.karlforterre.fr/photo/38570569/) « Détail d'une patère en bois sur un portemanteau chromé, ciré jaune en arrière-plan flou » | 6.5 | photo |
| [38570570](https://photos.karlforterre.fr/photo/38570570/) « Pleine lune se levant derrière des cheminées, ciel nocturne violet » | 1.1 | modèle |
| [38570603](https://photos.karlforterre.fr/photo/38570603/) « Graffiti « je t'aime » peint en violet sur une surface orangée et rouillée » | 6.11 | photo |
| [38694057](https://photos.karlforterre.fr/photo/38694057/) « Vue aérienne des parterres élaborés des jardins de Villandry » | 6.12 | photo |
| [39182180](https://photos.karlforterre.fr/photo/39182180/) « Gros plan sur du lichen et de la mousse couvrant des rochers, à Buzy » | 7.2 | photo |
| [39423920](https://photos.karlforterre.fr/photo/39423920/) « Voiture argentée garée près d'un mur, panneau bleu de virage à droite, à Irun, au Pays basque » | 7.10 | photo |
| [39434688](https://photos.karlforterre.fr/photo/39434688/) « Gros plan sur une porte ancienne patinée, rivets et peinture écaillée » | 1.3 | modèle |
| [39434691](https://photos.karlforterre.fr/photo/39434691/) « Un cycliste passe devant une porte verte patinée, à Irun » | 3.2 | encre |
| [39595391](https://photos.karlforterre.fr/photo/39595391/) « Voie lactée et ciel étoilé à couper le souffle, en Galice » | 3.1, 7.1 | encre |

Chaque photo est de Karl Forterre, publiée sur Pexels sous une licence qui en permet l'usage
commercial ; les originaux ne sont pas copiés dans ce dépôt : `images.py` télécharge au besoin
le fichier public et en tire le décor (voir `outils/darshan/README.md`).
