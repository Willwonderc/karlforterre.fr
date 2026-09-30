# Relecture critique : ouverture et chapitre 1, « Un ciel mouvant » (0.1 à 1.9)

Regard extérieur sur `docs/darshan-mise-en-scene/chapitre-1.md` (version du 29 septembre 2026,
11 h 22). Lu avec : la direction (`README.md`), la consigne commune, le texte des tableaux 0.1 à 1.9
et tout le livre pour les rimes, le code du prototype que Karl a aimé (copie de l'équipe :
`build-proto.py`, `moteur-proto.js`, `moteur-proto.css`), le plan d'interface, et les chapitres 2 à 5
rendus. Rien n'a été modifié dans le dépôt.

## Verdict d'ensemble

1. Un traitement rigoureux et fondateur : texte intact, citations exactes, fiche de production qui s'exécute, et de vraies idées de récit : « Papa, où es-tu ? » seul à l'écran ; le jour qui vieillit pendant « As-tu déjà pensé à vieillir ? », avec le seul fleuve ; le lecteur qui remue l'eau et se fait gronder avec Darshan ; la tour dessinée qui revient en photo ; la montre et son tic-tac, que le chapitre 2 reprend.
2. Faiblesse majeure : le contrechamp de 1.9 contredit le texte (« disparaît loin de la vue de Jivan » : Jivan ne le voit pas partir) et efface le contraste avec 7.6 (« Jivan assiste au départ ») ; il repose en plus sur la photo d'un homme réel, vêtu de noir, sous les saules du Marais poitevin.
3. Le père répond, contre la direction : la quinte à vide de 1.1, complétée par l'accord entier de 1.3, fait entendre une question puis sa réponse ; le traitement écrit tour à tour « sans réponse » et « la réponse vient d'une porte », et le chapitre 3 écrit « toujours sans réponse ».
4. Ce qui marchait est plus touché qu'annoncé : la lueur d'aube du prototype (ce n'était pas une photo) réduite à un fil, un mouvement de caméra qui change le cadre du toit, une pulsation dans le tutoriel, la fiche de la clé glissée dans le geste avec un raccourci, le panneau clair d'Aluva passé au sombre.
5. Faisabilité : trois gestes ont une part horizontale (tourner, tracer, remuer), dont la moustache, non signalée ; la course des astres et la caméra du toit demandent des décors absents de la fiche ; la ballade a trois premières fois selon les chapitres 1, 2 et 5.

## Notes par scène

32 notes : 13 à corriger, 7 à renforcer, 12 suggestions.

**[À corriger]** : fidélité, faute, infaisable, incohérent. **[À renforcer]** : idée faible, gratuite ou
trop timide. **[Suggestion]** : mieux possible. « À garder » signale ce qu'il ne faut pas « réparer ».

### Pour tout le chapitre

**T1. [À corriger] Le père répond-il ?** Le traitement se contredit. D'un côté : « la question reste
sans réponse » (1.1, table ronde), « sent qu'aucune réponse ne viendra » (1.1, intention). De l'autre :
« le père n'y répond que par une lumière » (§ 1), « La question au père (quinte à vide) et sa réponse
(l'accord entier) » (tableau « Ce que le chapitre fonde »), « la réponse vient d'une porte » (1.3,
son), et, dans une même note de `TABLEAUX` (1.1) : « Le père ne répond pas ; sa réponse sera une
lumière ». Le chapitre 3, lui, écrit « toujours sans réponse » (3.5, 3.11) et laisse « où es-tu ? »
sans aucun son (3.5 : « rien »). Ce n'est pas une voix prêtée au père (l'accord est un signe, comme la
direction le veut), mais c'est une réponse, et elle viendrait dès le chapitre 1, alors que tout le
livre tient sur cette question. Quoi changer : écrire partout « sans réponse » ; à 1.3, parler de
« signe » ou de « présence », le mot même du livre (« la présence de l’astre solaire pourtant
absent ») ; régler le son de 1.1 (note 1.1-b). La direction dit aussi « réponse à l'appel » (README,
§ 8) : à corriger par la synthèse.

**T2. [À corriger] Les gestes horizontaux.** La direction interdit le glissement horizontal (Apple
Books tourne la page). Trois gestes du chapitre en ont une part : `tourner` (1.3, un quart de
cercle), `remuer` (1.7, des tours dans l'eau) et `tracer` (1.4) : la moustache va de x 430 à x 770,
340 unités presque à plat, le geste même qui tourne la page. L'équipe a vu le risque pour les deux
premiers, pas pour la moustache ; et sa parade (« si une liseuse tournait malgré tout la page, le
toucher simple suffit ») ne sauve rien : la page serait déjà tournée, au sommet du chapitre pour 1.3.
Quoi faire : (a) un essai sur l'iPhone de Karl, dans Apple Books, avec l'EPUB du prototype, dont le
geste « porter » de 1.3 est déjà un glissé en tous sens : s'il ne tourne pas la page, les trois gestes
passent ; (b) sinon, une variante pour les liseuses, sans déplacement horizontal : la clé tourne à
mesure qu'on glisse vers le bas sur sa tête ; la moustache en deux touchers (une boucle, puis
l'autre) ; l'eau remuée de haut en bas. Au passage : « glisser vers le bas » (1.8) est aussi, dans le
plan d'interface (§ 2), le geste de l'historique ; le moteur doit le taire pendant un geste attendu.

**T3. [À corriger] Les scènes spéciales ne sont pas vérifiées.** 0.1 à 1.3 sont des scènes écrites à
la main (« seuil », « poeme », « toit », « tuiles », « pigeonnier ») : `build.py` les exempte de sa
vérification des mécaniques et des effets. Les entrées `SCENES` proposées pour elles (`voix` lettre à
lettre, son `question`, `camera`, `frontiere`, `course`, pulsation et notes, `tourner`, fiche au
geste, `vibre` haptique) ne feront donc rien d'elles-mêmes : il faudra reprendre le code du
prototype, celui que Karl a aimé. La fiche doit le dire, scène par scène, et chaque retouche doit
valoir ce risque (voir 0.2, 1.1, 1.2, 1.3).

**T4. [Suggestion] Un ordre de fabrication.** Le chapitre demande cinq mécaniques nouvelles ou
précisées, dix-neuf effets, dix sons, une palette et une retouche de dessin. Proposer un ordre : d'abord
ce qui porte une idée (1.1 : la coupe et la voix ; 1.7 : reflets, remous, fragment de ballade ; 1.8 :
la lumière qui vieillit et le silence ; 1.9 : le départ ; 1.3 : `tourner`, après l'essai Apple
Books) ; ensuite les agréments (clin d'œil, chaleur, bombe, vibration). La caméra du toit et la
pulsation sortent de la liste (1.1-c, 1.2).

### 0.1 Le seuil

À garder : la dédicace lue en silence, « Ouvrir » comme première porte, le cosmos qui naît avec lui.

**0.1-a. [À renforcer] Retirer le fil vermillon au-dessus de « À Maëlle ».** La dédicace est le seul
texte vrai du livre : elle ne doit porter aucun signe de la fiction. Le sindoor est, en Inde, la
marque de la femme mariée, tracée dans la raie des cheveux : un trait vermillon sur le nom de Maëlle
dit quelque chose de Karl et de Maëlle que lui seul peut dire. Et la raison donnée (« seul rouge de
l'ouverture, qu'on ne reverra qu'avec le ruban de Julie ») ne tient plus : le chapitre 2 met le
vermillon dès 2.1 (le néon de « Table heureuse ») et le chouchou rouge de Julie en 2.2. Si la question
reste posée à Karl, lui donner le sens du sindoor.

**0.1-b. [Suggestion] « Ouvrir » actif tout de suite.** Qu'il s'éclaire après « Bonne lecture. », mais
qu'il réponde dès l'arrivée : le lecteur qui revient (« Reprendre », relecture) ne doit pas attendre
quatre secondes. « alors seulement « Ouvrir » s'éclaire » laisse croire à un bouton bloqué.

### 0.2 Poème d'ouverture

À garder : le ciel figé jusqu'au dernier vers, qui se met en marche sur « la course des astres » et
continue sous le titre « Un ciel mouvant » : la meilleure idée de raccord du chapitre. La poussière
qui tombe puis monte, aussi.

**0.2-a. [À corriger] Le changement est mal décrit.** « Plus d'aube photographiée » : le prototype ne
montrait aucune photo. Au dernier vers, une lueur chaude montait au bas du ciel en cinq secondes (un
dégradé en ellipse, `demarreurs.poeme`) et les étoiles s'avivaient. C'est ce que Karl a vu et aimé.
La question « Renoncer ici à la photo « Aube » » doit devenir : « la lueur du prototype devient un fil
d'or : d'accord ? ».

**0.2-b. [À renforcer] « son éblouissante frontière » demande un éblouissement.** Le dernier vers est
le sommet du poème ; un fil qui « palpite à peine » y est trop timide. Proposition : garder la lueur
du prototype et lui donner un bord, le fil d'or, qui s'embrase un instant (une demi-seconde à pleine
intensité), puis se pose et reste. Le soleil ne se lève pas : la porte du pigeonnier garde son
miracle. Le fil y gagne sa meilleure rime, le jour horizontal au pied de la porte du pigeonnier (le
prototype le dessine sous les jours verticaux), puis « L’entrebâillement au pied de la porte
s’allume. » (7.8).

**0.2-c. [À corriger] La course des astres n'a pas son décor.** `ciel-poeme` est une seule photo,
arbres compris : la faire tourner fait tourner l'horizon. Il faut séparer le ciel de la ligne d'arbres
(un calque d'arbres fixe posé sur le ciel qui tourne, comme la ville sur le ciel du toit, au
prototype), ou ne faire tourner que les étoiles de la toile. La fiche de production ne le prévoit pas.

### 1.1 Le toit

À garder : « Papa, où es-tu ? » seul dans son temps ; la voix vers le père écrite en lumière, lettre à
lettre ; le vent qui tombe. C'est la question du livre, et elle est posée.

**1.1-a. [À corriger] Une table ronde et une question dépassées.** La direction est déjà corrigée
(README, § 1 et § 6 : « l'appel de Darshan à son père écrit en lumière d'étoiles ») : retirer « La
direction appelle ce moment « la voix du père dans la lumière des étoiles » » et la question 2 pour
Karl ; ne garder que la décision.

**1.1-b. [À renforcer] La quinte à vide annonce une réponse.** La, mi, la, puis, deux pages plus loin,
la, do dièse, mi : l'oreille entend une question, puis la même harmonie complétée, donc une réponse,
quoi qu'en dise le texte (T1). Deux voies. (a) Préférée : pas de note. Le vent tombe à rien sur « Papa,
où es-tu ? » et ne revient qu'à « Papa je serai bientôt là » : le silence est la non-réponse, comme
« où es-tu ? » en 3.5 (« rien », au chapitre 3) et « Rien ne se passe. » en 6.11. L'accord de 1.3
reste la signature de la lumière des portes, pas une réponse. (b) Si l'équipe tient à la quinte :
qu'elle devienne la signature de l'appel sans réponse, reprise en 3.5 et en 6.11 (le chapitre 3 ne l'a
pas prise), que le traitement cesse d'appeler 1.3 sa réponse, et que sa seule résolution possible soit
la porte du père (7.13).

**1.1-c. [Suggestion] Renoncer à la vue qui redescend, ou la réduire à une légère inclinaison.** Elle
change le cadre du prototype que Karl a aimé (toits, tour et ciel tournant d'un seul regard) ; elle
devance « Darshan se lève » (1.2, dont la scène avance déjà vers le pigeonnier) ; et elle demande un
décor `toits` plus haut que la page, absent de la fiche.

**1.1-d. [Suggestion] La voix lettre à lettre lisible par VoiceOver.** Chaque temps doit être entier
dans la page dès qu'il paraît (lettres révélées par le style, pas insérées une à une), sinon le
lecteur d'écran lit des fragments.

**1.1-e. [Suggestion] Trois filantes, pas deux.** Le prototype en lance trois (deux qui se poursuivent,
une troisième à 2,4 s). Dire si l'on garde la troisième, puisque ce que Karl a vu se garde.

### 1.2 La danse sur les tuiles

À garder : la danse en cinq touchers, la poussière de « s’époussette », les cinq notes qui montent.

**1.2-a. [À renforcer] Retirer la pulsation (le halo à 100 par minute, le bond plus ample en mesure).**
Elle fait du premier geste du livre, son tutoriel, un exercice de mesure. Le chapitre 5 vient
justement d'ôter le tapotement en rythme de la synchronie (5.9 : « sans épreuve d'adresse ») et de
5.8 ; et une pulsation à suivre appartient aux gestes du cœur, pas à ceux de la magie. Garder le
tempo du lecteur (chaque toucher, une enjambée) et les cinq notes qui montent vers la porte, dans la
tonalité du père : c'est la bonne idée de la scène, et elle ne coûte presque rien. La rime avec la
course de Julie (7.9) tient par la mécanique et les pas.

### 1.3 Le pigeonnier

À garder : « Dans la nuit nacrée, il ne laisse pas de trace, il passe. » seul ; les cinq gestes ;
l'accord du prototype aux jours de la porte ; la vibration du téléphone sur « elles vibrent entre ses
doigts ».

**1.3-a. [À corriger] La fiche de la clé au début du geste « porter », avec ce geste en bouton.**
(1) Contraire au plan d'interface, fait et validé : la clé « se présente juste après la fonte des
lunettes », et jamais une fiche ne s'ouvre pendant un temps fort ; or 1.3 est le sommet du chapitre
(cinq sur cinq dans la courbe de l'équipe). (2) Une fenêtre ouverte au moment d'apprendre « porter »,
avec « Porter la clé à la serrure » en bouton, invite à sauter le geste : la plupart toucheront le
bouton, et le plus long apprentissage du livre perd son troisième geste. (3) Elle répète trois phrases
lues quelques secondes plus tôt. Quoi faire : garder le moment du prototype (après l'éclat) ; ou, pour
que la fiche ait ses trois phrases, l'ouvrir sur « Elle est affrétée pour l’amener où son cœur
l’emportera. » (effet `fiche` en `extra`), avant le geste, sans bouton d'action. Les boutons des
fiches s'apprendront plus tard : ils sont toujours là.

**1.3-b. [À corriger] `tourner`, à préciser et à coordonner.** Donner le rayon du guide (250 unités au
moins, environ 80 pixels sur un téléphone) et mesurer l'angle depuis le centre, où que le doigt se
pose : la tête de la clé, à l'échelle 0,42, n'est qu'à une soixantaine d'unités du centre (932, 1010),
une vingtaine de pixels. Faire l'essai Apple Books (T2). Enfin, la rime n'existe que si 6.13 et 7.8
prennent ce geste ; le découpage y a aujourd'hui la main de Julie (6.13), « tenter d'effacer » et
« glisser la lettre sous la porte » (7.8), et un troisième geste en 7.8 serait lourd : à régler avec
ces équipes avant de fabriquer.

**1.3-c. [Suggestion] La vibration se coupe aussi avec les effets sonores,** pas seulement en mouvement
réduit : c'est un effet, que le lecteur doit pouvoir faire taire.

### 1.4 Aluva

À garder : un seul geste ; l'étoile qui naît de la lumière quand l'éblouissement retombe, et le
bouton « Carnet » avec elle (la cause et l'effet se touchent) ; la chaleur ; la bombe qui crachote ;
les kayaks du dessin ; les effets accrochés à « mue par une vie frétillante » pour survivre à la
correction de « l'eau boue ». La règle qui en sort vaut pour tout le livre et mérite d'être écrite :
l'étoile naît là où la caméra voit le passage s'achever (à l'arrivée en 1.4, au départ en 1.9 et en
3.8).

**1.4-a. [À renforcer] Le ton du panneau de texte.** `texte="haut"` est le panneau sombre ; Karl a vu
Aluva avec le panneau clair (`clair`, en bas). En 1.4, le haut sombre tient sur le plafond du local ;
mais de 1.5 à 1.9, encres claires sur papier, en plein jour, un bandeau de nuit assombrit le tiers
haut du « blanc et or d'Aluva ». Prendre `haut clair`, que le chapitre 2 définit (encre sombre sur un
dégradé crème), au moins de 1.5 à 1.9. Et si le texte en haut doit signer Aluva, le chapitre 3 doit
suivre : ses pages d'Aluva (3.9, 3.12 à 3.14) gardent le texte en bas.

**1.4-b. [Suggestion] Retirer le point d'intérêt facultatif du tonneau.** Un reflet qui respire de
plus, pour rien, dans une page qui doit être « une sensation, pas une tâche ».

**1.4-c. [Suggestion] La moustache au premier plan.** Poser le guide plus bas et plus grand, la
mousse un peu floue, comme ce qu'on devine sous son propre nez : on comprend que c'est sa moustache
à lui, et non un trait peint sur le fleuve.

### 1.5 Le vieil homme

À garder : le titre « Le vieil homme » ; ses mains et son filet plutôt qu'un visage ; le premier
dialogue, une réplique à la fois, que la couleur ne dit jamais seule. Rien à reprendre.

### 1.6 L'esprit local

À garder : le regard qui glisse vers le fleuve sur « Parle-moi encore de Paris plutôt » ; aucune image
de palais.

**1.6-a. [Suggestion] Un clin d'œil à l'encre.** « une paupière sombre, au bord flou » se lira comme
une ombre, ou un défaut d'affichage. Dans le monde de Darshan, même sa paupière est d'encre : un trait
de pinceau, avec ses cils, qui passe et remonte en 0,35 à 0,4 s. Il annonce mieux les « Paupières
fermées sur le ciel » (7.1).

### 1.7 Paris dans le fleuve

À garder : les reflets nés de la parole ; le lecteur qui ne remue l'eau qu'à la fin, s'y perd avec
Darshan, et se fait gronder avec lui à la page suivante (la meilleure idée de geste du chapitre) ; la
tour dessinée de 1.1 revenue en photo.

**1.7-a. [À renforcer] La ballade en fragment, pas en phrase.** « qu’un air que tous chantonnent »
justifie qu'on l'entende ici ; mais un leitmotiv grandit. En 1.7, seulement ses premières notes (trois
ou quatre, quatre secondes), sous l'eau, inachevées : l'amour comme une idée. La première phrase
entière est pour 2.9 (chapitre 2), la chanson de Darshan pour 5.7, le baiser pour 7.10. Une phrase de
neuf secondes ici prend de l'avance sur tout cela. Et le chapitre 5 appelle 5.7 « la naissance de la
ballade », « pour la première fois du livre » : à accorder (voir la cohérence).

**1.7-b. [Suggestion] Dire à Karl où a été prise 38279684.** À Niort, d'après l'adresse de sa page
Pexels conservée dans les fiches du site photo ; Karl reconnaîtra ses réverbères et ses jardinières.
Dans le fleuve d'encre, c'est un rêve et cela passe ; mais le chapitre 5 reprend la même photo comme
« la Seine » du chevalet (5.7), dans le monde photographié de Julie. La vraie raison de ce dernier
reflet est d'ailleurs cette rime avec 5.7 (la tirade finit sur « la Seine »), plus que le jeu de mots
sur « réverbère ».

**1.7-c. [Suggestion] Faire passer le pavé dans les remous.** Avant que la Seine ne se forme, le
remous peut montrer « Ciel et pavés » (12073837, décor `pave`) : « Le pavé y est gris, avec ses
écailles de pierre » a enfin son image, et c'est le pavé d'où naîtra la porte du père (7.12 à 7.15).
La rime que l'équipe revendique (« l'inverse exact, en 7.12 ») devient visible. Que la photo serve
aussi ailleurs n'est pas une raison de l'écarter : c'est une rime voulue.

### 1.8 Vieillir

À garder : le jour qui vieillit sous nos yeux pendant la question, le tanpura qui se tait, le fleuve
qui continue ; « Je ne souhaite que m’éprendre du véritable amour et plus encore rejoindre mon aïeul. »
seul : le programme du livre.

**1.8-a. [À corriger] Le geste de la chemise tombe sous le vœu de Jivan.** Placé avant la dernière
phrase, il est attendu pendant que l'écran montre « — Puisse l’une ou l’autre de tes entreprises ne
pas t’arracher à moi trop tôt. » : son halo, puis « Enfilez la chemise : glissez vers le bas », s'y
affichent, sur la réplique la plus tendre du chapitre. Le passer après la phrase (`apres=True`) : la
pirouette se lit, puis le lecteur ferme la conversation en enfilant la chemise, et le lin mène au
fondu blanc de 1.9.

**1.8-b. [À renforcer] Nommer et tenir l'image du ponton vide.** Quand Jivan dit « Je t’invite à
t’attarder davantage sur ma personne que le fleuve », la vue revient au ponton, et le ponton est vide
(aucune photo de lui) : on voit sa place sans lui, son absence à venir (« je te quitterai avant
lui »). C'est l'image qui dit « pour un seul des deux ». Le traitement la présente comme un simple
raccord géographique : l'écrire comme l'idée, pour que personne n'y ajoute une silhouette ; et si
Karl fait le repérage du tabouret, que le tabouret vide soit sur ce ponton.

**1.8-c. [Suggestion] Le silence rendu par la réponse, non par la montre.** `silence` dure 6 s, alors
que le traitement veut que les sons « reviennent quand Darshan répond ». Rattacher leur retour au temps
« — Quelle idée, à quoi cela m’avancerait-il ? » (un effet en `extra`), quel que soit le rythme du
lecteur.

### 1.9 Le départ

À garder : la montre regardée, sans geste (« regards attentifs » : un regard n'est pas un acte) ; son
tic-tac, temps des mortels, qui s'arrête quand l'immortel s'en va (le chapitre 2 s'en sert, 2.5 et
2.9) ; le salut de la vue ; la fin sur le filet, avec le nom de Jivan.

**1.9-a. [À corriger] Le contrechamp dit le contraire du texte.** « disparaît loin de la vue de Jivan
qui range patiemment son filet » : Darshan disparaît hors de la vue de Jivan, occupé à son filet. Le
traitement prend cette phrase pour raison de montrer la disparition par ses yeux : c'est l'inverse. Et
le livre oppose les deux départs : ici, Jivan ne voit rien ; en 7.6, « Jivan assiste au départ, le
ventre vide, de Darshan. ». La rime annoncée (« le même contrechamp, pour le second départ ») efface ce
contraste ; le regard de Jivan revient de droit à 7.6.

**1.9-b. [À corriger] La photo 36652487 ne peut pas être Darshan.** C'est une personne réelle, que Karl
connaît ; ce serait le seul corps de Darshan dans son monde, et il fixerait sa silhouette pour tout le
livre (haut noir, short, bras écartés), contre « La vue plutôt que le personnage » (plan, principe 4).
Raccord de costume : 1.8 l'habille d'une chemise de lin blanc, l'homme est en noir. La photo est du
Marais poitevin (galerie « marais-poitevin »), saules et garde-corps verts : la galerie même de
10652212, écartée parce que « les arbres sont trop européens ». Enfin le livre ne donne pas de
passerelle : il se tourne « vers la cabane à kayaks ».

**1.9-c. [À corriger] Le geste sur une silhouette lointaine.** Ôter les lunettes en touchant un
personnage minuscule casse la rime avec 1.3 (toucher les lunettes, en gros plan) et mêle deux regards
(on agit en Darshan, on voit en Jivan).

**1.9-d. [À corriger] Une coupe au milieu d'une phrase.** « avant de tourner ses talons vers la cabane
à kayaks. » commence un temps en pleine phrase, contre la direction (§ 6 : « On coupe aux fins de
phrase »). Le salut et le changement de vue peuvent suivre dans le même temps, avec `delai`.

**Proposition pour 1.9**, qui garde l'intuition de l'équipe (finir avec le mortel patient, et son nom)
et suit le texte :
1. « Après quelques ajustements et regards attentifs sur sa montre, […] vers la cabane à kayaks. » : un
   seul temps. La montre en gros plan, le tic-tac ; à 1,5 s, la vue s'incline (le salut) ; à 3 s, elle
   se tourne vers la cabane à kayaks, vue du dehors, dans la lumière d'or : la porte d'où il était
   arrivé le matin.
2. Le geste, « Ôtez les lunettes », comme en 1.3 : les lunettes au bas de la vue, un toucher. L'éclat
   court les change en clé ; la porte de la cabane s'illumine et sa lumière gagne la vue (la sortie de
   1.3, reprise : pas besoin de l'effet `disparition`) ; le tic-tac s'arrête ; l'étoile file de la porte
   vers « Carnet ».
3. « Il se défait de ses lunettes puis disparaît loin de la vue de Jivan qui range patiemment son
   filet. » : la lumière retombe sur le filet au crépuscule. La caméra reste avec celui qui reste, et
   qui n'a pas regardé ; le fleuve continue. La seule entorse à la caméra subjective est ce dernier
   plan, sans Darshan.

Fabrication : décors `["montre", "local-or", "filet-soir"]`. `local-or` est le dessin du local vu du
dehors, dans la palette d'or ; le chapitre 7 a besoin du même dessin la nuit (`local-nuit`, 7.8) :
une seule fonction d'`art.py` pour les deux lumières (par exemple `dessin("local_kayaks", heure="or")`
et `dessin("local_kayaks", nuit=True)`), et la rime « La même cabane, la nuit » (7.8) se voit. Plus de
photo avec une personne, plus de passerelle, plus d'effet `disparition` ; `1.9.1 = Ôtez les
lunettes` reste. Le carrelet que Karl pourrait photographier (repérage 1) ferait ce dernier plan.

## Cohérence avec les autres chapitres

Lus : chapitres 2, 3, 4 et 5, rendus ; les chapitres 6 et 7 ne le sont pas encore.

1. **La ballade** a trois premières fois : sous l'eau en 1.7 (chapitre 1) ; « à l'air libre pour la
   première fois » en 2.9 (le chapitre 2 tient compte de 1.7) ; « pour la première fois du livre » et
   « la naissance de la ballade » en 5.7 (chapitre 5). Accord proposé : 1.7 le fragment, 2.9 la première
   phrase, 5.7 la chanson de Darshan, 7.10 le baiser ; le chapitre 5 corrige « pour la première fois ».
2. **Le texte à Aluva** : en haut au chapitre 1, en bas au chapitre 3 (3.9, 3.12 à 3.14). Choisir une
   règle pour le monde d'Aluva, et son ton (`haut clair` sur les encres de jour).
3. **La réponse du père** : « la réponse vient d'une porte » (1.3) contre « toujours sans réponse »
   (chapitre 3) ; la direction dit « réponse à l'appel » (§ 8). À trancher une fois pour tout le livre.
4. **La quinte à vide** ne revient pas à « où es-tu ? » en 3.5 (le chapitre 3 n'y met « rien ») ; le
   chapitre 6 devrait la reprendre à « Rien ne se passe. » (6.11). Sans ces deux reprises, ce n'est pas
   un motif : une raison de plus pour la voie (a) de 1.1-b.
5. **L'éclat court** : le tableau « Ce que le chapitre fonde » le fait revenir en 3.8 ; le chapitre 3 y a
   choisi « sans éclat (la nonchalance) ». Mettre le tableau à jour.
6. **`tourner`** ne rime que si 6.13 et 7.8 l'adoptent (1.3-b).
7. **Le vermillon** paraît dès 2.1 et 2.2 : l'argument du fil de la dédicace tombe (0.1-a).
8. **Ce qui s'accorde déjà** : la montre dans « Objets » et son tic-tac (2.5, 2.9) ; la voix lettre à
   lettre, reprise à l'encre pour Julie (2.3), belle rime des deux quêtes de 1.8, mais qui fait de
   l'écriture lettre à lettre la signature de la voix intérieure de Darshan plutôt qu'un moment
   unique (le dire en 1.1) ; le reflet 38279684 de 1.7 à 5.7 ; le fil Paris-Aluva du carnet (3.4) et
   sa boussole (5.3) ; l'étoile d'une porte qui naît où la caméra voit le passage s'achever (1.4, 1.9,
   3.8).
9. **Pour la synthèse**, la formule « voix du père » survit hors du traitement : `docs/plan-darshan.md`
   (ligne 176), l'en-tête de `outils/darshan/texte.py` (ligne 8), la classe `voix-du-pere` du moteur
   (`src/moteur.js`, ligne 1264 ; `src/moteur.css`, ligne 146 ; `essai.js`, ligne 62) ; celle de
   `docs/darshan-decoupage.md` (ligne 184) disparaîtra avec les entrées `TABLEAUX` de l'équipe.

## Vérifications faites

Par mes propres programmes, écrits dans mon brouillon
(`/tmp/claude-0/-home-user/ea695700-97a2-54cb-887f-a35109d45a8c/scratchpad/relecture-ch1/`), hors du
dossier de l'équipe et sans rien écrire dans le dépôt :

- **Texte** : le texte des tableaux, tiré de `decoupage.texte()`, est identique à `texte.txt` de
  l'équipe.
- **Citations** : 211 citations distinctes entre guillemets dans le traitement ; toutes celles qui
  viennent du livre y sont mot pour mot (espaces insécables ramenées à des espaces, aucune divergence
  d'apostrophe). Les 48 autres sont des textes d'interface, des noms de décors, des titres de photos,
  des états du découpage, ou l'ancienne formule citée pour être corrigée. Les 41 citations suivies d'un
  numéro de tableau sont toutes dans ce tableau.
- **`TABLEAUX`** : les onze entrées de l'équipe, avec les deux titres de photos, la mécanique
  `tourner` et le chantier D3 complété, remplacées en mémoire : `decoupage.verifier()` passe ; mots par
  tableau inchangés (53, 86, 130, 43, 129, 91, 109, 120, 81, 127, 44) ; `tourner` ne reconnaît qu'un
  geste du livre, 1.3.4.
- **`SCENES`** : évaluées avec les aides de `livre.py` ; huit décors nouveaux, tous les décors et
  toutes les images de reflet connus ; avec `build.py` en mémoire et les consignes proposées : 85 pages
  construites, texte recollé au caractère près, consignes et actions appariées, huit mots au plus ;
  états cohérents (1.4 s'ouvre avec la clé, 1.5 avec l'étoile du pigeonnier, 2.1 avec la clé, la montre
  et deux étoiles). Non faite : la vérification 3 de `build.py` (le moteur est en chantier), qui
  exempte de toute façon les scènes spéciales (T3).
- **Photos** : les quinze numéros retenus, et six autres cités (13102289, 10473138, 12073837, 10652212,
  38188749, 10220497), sont dans `vitrine/photos.txt` ; formats, galeries et adresses de page lus dans
  les données du site photo (36652487, 10310851 et 10652212 : Marais poitevin ; 38279684 : Niort).
  Regardées : 36652487, 20315376 et 34956319 en petite version, les planches d'encre de l'équipe, les
  décors du prototype et les décors existants (`periyar`, `rue-floue`, `reflet-paris`, `pave`,
  `rue-vide`, `periyar-soir`).
- **Prototype** : code lu dans la copie de l'équipe : la lueur d'aube de 0.2, les trois filantes et la
  classe `voix-du-pere` de 1.1, la fiche de la clé après l'éclat et l'accord de la majeur aux jours de
  la porte en 1.3, le panneau `clair` d'Aluva et le carnet en fin d'extrait, la page de titre sans
  dédicace.
