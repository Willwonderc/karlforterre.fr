# Darshan jouable : direction de création

Ce dossier est la pré-production du livre jouable, faite comme le ferait une équipe
créative : une direction commune (ce document), puis, chapitre par chapitre, le traitement
de chaque scène par toute l'équipe, relu par un regard critique. La fabrication
(`outils/darshan/`) ne fait ensuite que traduire ces décisions.

Ce que ce dossier n'est pas : une réécriture. Le livre de Karl est dit tel quel, dans
l'ordre, sans un mot changé ni ajouté. Les seuls mots nouveaux sont les textes d'interface
(consignes, boutons), rangés dans `outils/darshan/interface.ini`, que Karl valide.

| Document | Contenu |
|---|---|
| Ce document | Le récit, les arcs, les motifs, la grammaire des deux mondes, des gestes, du temps, de l'image, du son et de l'interface ; la méthode et le modèle de traitement d'une scène. |
| [chapitre-1.md](chapitre-1.md) | Ouverture et « Un ciel mouvant » (tableaux 0.1 à 1.9). |
| [chapitre-2.md](chapitre-2.md) | « Un pain perdu s’il vous plaît. » (2.1 à 2.10). |
| [chapitre-3.md](chapitre-3.md) | « Entre deux mondes » (3.1 à 3.14). |
| [chapitre-4.md](chapitre-4.md) | « Amélie et Julie » (4.1 à 4.7). |
| [chapitre-5.md](chapitre-5.md) | « Douceurs et confettis » (5.1 à 5.11). |
| [chapitre-6.md](chapitre-6.md) | « Des attentes de part et d’autre » (6.1 à 6.15). |
| [chapitre-7.md](chapitre-7.md) | « Au-delà de la porte » et la clôture (7.1 à 8.1). |

### État de la pré-production (pause du 29 septembre 2026)

| Chapitre | Traitement | Relecture critique | Révision |
|---|---|---|---|
| 1 (et l'ouverture) | fait | faite : 32 notes, dont 13 à corriger | faite (section 9 du chapitre) |
| 2 | fait | faite : 29 notes, dont 15 à corriger | en cours |
| 3 | fait | faite : 30 notes, dont 16 à corriger | en cours |
| 4 | fait | faite : 31 notes, dont 17 à corriger | faite (section 9 du chapitre) |
| 5 | fait | à faire | — |
| 6 | fait | à faire | — |
| 7 (et la clôture) | fait | à faire | — |

Les relectures sont dans [relectures/](relectures/). À la reprise, dans l'ordre :
1. relire les chapitres 2, 3, 5, 6 et 7, puis faire réviser chaque chapitre d'après sa
   relecture et les arbitrages (section 12) ;
2. faire la synthèse entre les chapitres ; les points déjà connus sont :
   - la barre de Julie : jusqu'où les boutons de Darshan s'effacent (chapitres 4 à 6) ;
   - le nom unique de la ballade dans les fiches de production ;
   - les décors écartés par plusieurs chapitres ;
   - le second paquet (`paquet-darshan`, chapitre 7) ;
   - la porte du père d'Irun, commune aux chapitres 3 et 7 ;
   - le moment où l'accord du père s'éteint (7.13 ou 7.14) ;
   - les frontières de tableaux déplacées (2.9 et 2.10 ; 7.7 et 7.8 ; 7.15 et 7.16) ;
3. rassembler les questions pour Karl en une seule liste ;
4. reporter les décisions dans `outils/darshan/` (`livre.py`, `decoupage.py`,
   `interface.ini`, `objets.ini`), puis reprendre le moteur.

Le découpage en 85 tableaux (texte exact de chaque tableau, première idée de geste, de
décor et de son) est dans [../darshan-decoupage.md](../darshan-decoupage.md) ; l'évaluation
et le plan d'ensemble dans [../plan-darshan.md](../plan-darshan.md) ; l'interface dans
[../plan-darshan-interface.md](../plan-darshan-interface.md).

## 1. Le récit

**En une phrase.** Un immortel, maître des portes, cherche la seule qu'il ne sait pas
ouvrir, celle de son père ; il la trouve en aimant, et choisit de ne pas la franchir pour
vivre cet amour en mortel.

**Ce que dit le titre.** *Darshan* (दर्शन), en sanskrit, c'est la vision : voir, et être vu
par le divin. Tout le livre est une affaire de regard (les lunettes, « le regard couleur
terre qui perce les lunettes », « les yeux dans les yeux », le père dont Darshan espère
qu'il le regarde sans le juger) et de passage (les portes, « une séparation qui
paradoxalement connecte »).

**Les trois voix.**
- **Le conte** : les deux poèmes, la légende du chapitre 3, la dernière page. Il s'adresse
  au lecteur (« Vous les connaissez », « Ne sentez-vous pas toujours cette distance qui se
  crée en fermant votre porte ? »). Son registre visuel : le cosmos, l'or, le papier.
- **Darshan** : récit à la troisième personne, lyrique, excessif, comme lui (« le beau
  parleur »). Son registre : l'encre et l'aquarelle.
- **Julie** : sa voix intérieure, en italique, et tout le chapitre 4 à la première
  personne. Son registre : la photographie.

**Le père ne parle jamais.** Les paragraphes en italique sont les voix intérieures de
Darshan et de Julie : « Papa, où es-tu ? » (1.1) est Darshan qui parle à son père, sans
réponse. Le père ne se manifeste que par des signes : la lumière, la lanterne, la porte.

## 2. Les arcs

| Chapitre | Darshan | Julie | Le lecteur | Émotion dominante | Couleur | Son | Tempo |
|---|---|---|---|---|---|---|---|
| Ouverture | — | — | Il franchit le seuil du livre (« Ouvrir » est la première porte). | Attente | Nuit étoilée | Cosmos | Lent |
| 1. Un ciel mouvant | Libre et seul, il appelle son père sous les étoiles, danse sur les toits, ouvre une porte vers le Kerala ; Jivan, l'ami qui vieillit. | Pas encore là : « la même délicieuse enfant ». | Apprenti magicien : premier objet, première métamorphose, première porte. | Émerveillement, solitude | Bleu royal, puis blanc et or d'Aluva | Vent des toits, puis fleuve et tanpura | Contemplatif, puis vif |
| 2. Un pain perdu… | Amoureux, maladroit, menteur par omission (ni travail, ni téléphone, ni chez-soi). | Séduite, lucide : « Tu es étrange par moments ». | Il vit le rendez-vous par les mains de Darshan ; il sent la chamade. | Tendresse, comédie ; le premier nuage | Chaleurs d'automne, restaurant, parc | Salle de restaurant, cœur, merle | Comédie de dialogue |
| 3. Entre deux mondes | La légende : né de l'idée de porte, immortel sans place ; la quête ; le poème ; la vision de la porte du père ; la règle (le véritable amour). | Absente, et pourtant l'enjeu. | Il comprend : les lunettes plient l'espace, la porte du père s'inscrit à part dans le carnet. | Mystère, révélation, fièvre | Cosmos, or ; noir, puis couleur | Cosmos, bibliothèque, souffle, silence | Solennel, puis fiévreux |
| 4. Amélie et Julie | Vu par elle : « cet énergumène », un prince peut-être. | Sa voix : métro, hôpital, fatigue, solitude, envie de partir. | Dans ses chaussures : son téléphone, l'échelle de douleur, le trajet ; aucune magie. | Fatigue, solitude, désir | Néons froids, métro ; le vert de la campagne rêvée | Métro, hôpital, rue | Monologue lourd, puis éclaircie |
| 5. Douceurs et confettis | Préparatifs extravagants, un appartement emprunté (le mensonge grandit). | Doute, puis choix d'aimer ; la Charlotte. | Il va d'un monde à l'autre ; les objets s'accumulent. | Impatience, douceur, humour | Pastels, sucre, lune | Marché, chambre, ballade, cœur | Alternance vive |
| 6. Des attentes… | L'appartement, le thé, le « je t'aime » ; il appelle son père : rien. La magie tourne à vide, la vérité éclate. | Bonheur, vertige, puis colère : « je ne suis qu'un moyen pour toi ?! » | La magie échoue entre ses mains. | Bonheur, vertige, échec, colère, tristesse | Blé doré, velours, puis froid | Appartement, silence, portes | Montée lente, puis rupture |
| 7. Au-delà de la porte | Le désert, la lettre, le genou à terre, la porte du père, la prière : il devient mortel. | La télévision, l'hôpital, « Darshan, tu m'entends ? », la course, le baiser, le choix. | Il écrit, court, tient le baiser ; puis il perd la magie avec Darshan : l'interface meurt. | Chagrin, espoir, extase, gravité, apaisement | Nuit du désert, pluie et fleurs, soir d'été ; puis le blanc | Désert, pluie, silence, un choc, silence | Lent, puis emporté, puis suspendu |
| Clôture | — | — | Il referme le livre. | Paix | Papier blanc | Silence | Lent |

**La plus forte idée du livre jouable** : les pouvoirs du lecteur sont la magie de Darshan.
Il les reçoit au chapitre 1 (un objet, une métamorphose, une porte, un carnet d'étoiles),
les voit s'enrayer au chapitre 6 (des clés qui n'ouvrent sur rien), et les perd au
chapitre 7, quand Darshan choisit d'être mortel : la clé part en poussière d'or, les
étoiles du carnet s'éteignent, les boutons disparaissent. Les dernières pages se lisent
sans pouvoir, comme une vie ordinaire, et c'est beau.

## 3. Les motifs

Chaque motif a sa signature, la même d'un bout à l'autre du livre, pour que le lecteur la
reconnaisse sans qu'on la lui explique.

| Motif | Où dans le livre | Image | Geste | Son | Interface |
|---|---|---|---|---|---|
| **La porte** | Le pigeonnier, le local à kayaks, les toilettes du personnel à Pékin, la demeure, le placard, la porte du père | L'embrasure qui s'illumine | Pousser, tourner la clé, glisser sous la porte | Grincement, souffle | Chaque porte franchie devient une étoile du carnet |
| **Les lunettes, la clé** | La fonte du chapitre 1, « elles plient l'espace » (3), la coquetterie (5), les binocles (6), les clés qui ne mènent nulle part (6), la serrure du local (7) | Gros plan ; la fonte visqueuse | Ôter, geste vif, tour de poignet | Fonte, tintement | L'objet principal ; sa fiche s'enrichit ; il meurt en poussière d'or |
| **Les étoiles** | « Papa, où es-tu ? » sous la voûte (1), « Les astres peuvent s'éteindre tant que je peux t'étreindre » (7, la lettre), la nuit du désert (7), « les astres sont pris dans leurs cycles » (fin) | Voûte, filantes, constellation | Aucun : on les regarde | Nappe cosmique | Le carnet des portes est une carte du ciel ; ses étoiles s'éteignent quand Darshan devient mortel (la lettre l'avait dit) |
| **La lumière du père** | La lanterne de bois aux motifs circulaires (3), le linteau et la lanterne aux rayons pénétrants (7) : la seule manifestation du père, sa porte | Lueur dorée, rayons | Tendre la main, poser la paume | Accord pur, le même à chaque fois | L'étoile à part, hors de la carte |
| **L'encre** | Le monde dessiné de Darshan ; « une encre venue d'Asie » (ses toiles, 6) ; la calligraphie (3) ; « Les mots sont encrés : plus rien ne peut les effacer » (7) | Lavis, traits de pinceau | Écrire, essayer d'effacer | Pinceau, plume | La lettre est le seul objet d'encre qui passe dans le monde photographié de Julie |
| **Le ruban rouge** | Le paquet de Julie (5, 6), « Son nœud vacille au vent comme son cœur », le paquet de Darshan (7), « Le ruban de satin s'affole » | Le seul rouge vermillon des photos | — | Claquement de satin | Le paquet, d'un sac à l'autre |
| **Le cœur** | La chamade (2), le palpitant qui choisit la synchronie (5), le baiser (7) | Pulsation discrète du décor | Maintenir ; taper au rythme d'un autre cœur | Battements | — |
| **La poussière** | « La poussière est à la fois la trace du passé… » (poème), « affleure de la poussière » (1), « brasser inutilement de la poussière » (3), « l'indifférence qui s'est déposée » (3) ; la poussière d'or du désenchantement (7) | Particules dans la lumière | Souffler | Souffle | La clé finit en poussière d'or |
| **L'eau, le fleuve** | Le Periyar, Jivan, les remous où Darshan voit Paris (1), le mudrā au bord de l'eau (3), le feu du soir (7) | Reflets | Remuer l'eau | Fleuve, clapotis | — |
| **Le regard** | « les yeux dans les yeux », le regard couleur terre, le regard perlé d'amour ; le titre | Caméra subjective : on ne voit jamais le visage de Darshan | Lever les yeux, baisser les yeux | — | — |

Les couleurs d'accent sont fixes : **l'or** pour la magie et le père, **le vermillon** (le
sindoor) pour l'amour et le ruban, **l'encre** (bleu nuit presque noir) pour le monde de
Darshan.

## 4. Les deux mondes et leurs passages

- **Le monde de Darshan est dessiné** : les photos de Karl passées à l'encre et à
  l'aquarelle, ou des dessins. C'est le monde tel que le voit un être qui peut « tordre la
  réalité » : malléable, mouvant, fait de traits. Caméra subjective : on voit par ses yeux,
  jamais son visage.
- **Le monde de Julie est photographié** : les photos de Karl telles qu'il les a faites.
  C'est le réel, net ou flou comme les yeux fatigués de Julie. Au chapitre 4 (le « je » de
  Julie), la caméra est ses yeux, et son téléphone est son interface.
- **La légende** (chapitre 3) est un conte : l'or sur la nuit, des portes de toutes les
  époques qui défilent.
- **Les passages entre les mondes sont des événements** : quand la magie entre chez Julie,
  l'encre saigne sur la photo (la porte de la demeure, les portes vides du chapitre 6) ;
  quand Julie franchit le placard, la photo du parc Montsouris remplace l'appartement ; la
  lettre d'encre jaillit dans la pharmacie photographiée. **À la fin, l'encre se retire du
  monde** : à partir de la chute (7.15), il n'y a plus que des photos, puis la page blanche.

## 5. Les gestes

**Principe.** Un geste est un verbe du texte : le lecteur fait ce que fait le personnage,
ou ressent ce qu'il ressent. Le geste précède la phrase qui le raconte (le lecteur agit, le
texte confirme) ; quand le texte annonce d'abord (une question, une consigne dans la
bouche d'un personnage), le geste suit.

**Quatre familles.**
1. **Les gestes de magie**, ceux de Darshan : ôter les lunettes, le geste vif, le tour de
   poignet, pousser la porte, plier l'espace. Précis, un peu solennels, récompensés par un
   éclat.
2. **Les gestes du cœur** : maintenir la chamade, joue contre joue, caresser une main,
   battre au rythme d'un autre cœur, le baiser. Ils se font lentement ; ils durent ; aller
   vite n'y sert à rien.
3. **Les gestes du quotidien**, ceux de Julie : faire défiler une galerie, écrire un
   message, régler une échelle de douleur, essuyer une vitre embuée. Ordinaires, réels,
   dans son téléphone ou sa main.
4. **Les gestes impossibles**, qui sont le cœur du drame : demander son numéro (il n'en a
   pas), prendre la main de Julie (elle la retire), ouvrir des portes qui ne mènent nulle
   part, effacer l'encre (rien ne l'efface), attendre dix secondes que le père réponde (rien
   ne se passe). Le lecteur essaie, et le livre lui répond comme il a répondu au personnage.

**Règles.**
- Jamais d'échec, de score ni de blocage : l'aide vient par paliers (un reflet, puis la
  consigne après quelques secondes, puis un bouton pour avancer sans faire le geste).
- La sensation dit l'émotion : lenteur pour la tendresse, rythme pour la course, résistance
  pour l'effort, immobilité pour l'attente.
- **Moins, c'est mieux.** Un geste doit apporter un sens que la lecture seule ne donne pas ;
  sinon, on laisse le texte respirer. Aucun geste pendant les instants les plus graves (la
  prière du chapitre 7) : le lecteur écoute.
- **Les gestes riment.** La danse sur les tuiles (1.2) et la course de Julie (7.9) ont la
  même mécanique ; la chamade (2.2), la synchronie (5.9) et le baiser (7.10) aussi ; les
  clés du pigeonnier (1.3), du placard (6.13) et du local (7.8) se tournent de la même
  façon. Le lecteur reconnaît son propre geste, changé par l'histoire.
- Aucun glissement horizontal (dans Apple Books, il tourne la page).

## 6. Le texte et le temps

- **Le temps** (une ou deux phrases qu'on révèle d'un toucher) est l'unité de rythme. On
  coupe aux fins de phrase ; une coupe peut créer du suspense (« Rien ne se passe. » seul à
  l'écran).
- Le texte n'est jamais caché durablement, jamais réordonné. Le réglage « Lecture » l'affiche
  toujours en entier, sans animation.
- **Moments typographiques, rares** : les vers sanskrits écrits au pinceau (3.7), l'appel de
  Darshan à son père écrit en lumière d'étoiles (1.1), la lettre de Darshan en écriture tracée à
  l'encre (7.7), « Julie aime Darshan et Darshan aime Julie » (7.11). Pas plus d'un par
  chapitre.
- Les dialogues s'affichent une réplique à la fois, comme dans un roman visuel ; on ne
  nomme jamais quelqu'un avant que le texte l'ait nommé.

## 7. L'image

- **Les photos de Karl sont le premier trésor du livre.** Pour chaque scène, on cherche dans
  ses 919 photos (titres et mots-clés en français dans
  `PexelsWillwonder/vitrine/donnees/textes-fr.csv`, format et couleur dans
  `vitrine/donnees/fiches.json`) celle qui dit le mieux la scène, pas seulement le lieu :
  une lumière, une matière, un détail qui rime avec le texte. Les photos en hauteur se
  prêtent mieux à la page 2:3 ; une photo en largeur se recadre sur son sujet.
- **Pas de visage reconnaissable** pour Darshan ou Julie : de dos, flou, en ombre, une main,
  un détail. Toute photo où l'on reconnaît quelqu'un est signalée à Karl avant usage.
- **Plans.** Plan large pour poser un lieu, plan moyen pour une action, gros plan pour un
  objet ou une émotion, caméra subjective pour Darshan (ses yeux) et pour Julie au chapitre 4.
- **Mouvement.** Les photos respirent : un glissement lent, un zoom à peine sensible
  (supprimés en mouvement réduit). Jamais d'effet gratuit.
- **Raccords.** Chaque page commence sur l'image où la précédente s'arrête : dans Apple
  Books, chaque page est isolée, et le raccord masque la coupure (la lumière de la porte du
  pigeonnier devient l'éblouissement d'Aluva).
- **Script des couleurs** (voir le tableau des arcs) : du bleu royal au blanc de la page,
  en passant par l'or d'Aluva, les chaleurs d'automne, le cosmos, les néons froids, les
  pastels, le blé doré, le velours, la nuit du désert, la pluie fleurie et le soir d'été.

## 8. Le son

- Fabriqué en direct, sans fichier, **sans voix ni parole** : aucun mot n'est dit qui ne
  soit écrit.
- **Deux mondes** : chez Darshan, le vent, l'eau, le tanpura, les nappes du cosmos ; chez
  Julie, la ville, le métro, l'hôpital, le vibreur du téléphone.
- **Motifs sonores** : l'**appel** de Darshan (« Papa, où es-tu ? », 1.1) est une quinte à
  vide, une question sans réponse ; le **père** a son accord entier (pur, lumineux), qu'on
  n'entend qu'avec sa porte : la lanterne de la vision (3.10) et le linteau de la rue de
  Rungis (7.12) ;
  l'**amour** a sa mélodie (la ballade, composée pour le livre, jamais un air existant), qui
  naît par fragments et revient entière au baiser (voir les arbitrages, section 12).
- **Le silence est un événement** : « Le contact de leurs corps éclipse tout Paris » (7.11),
  la porte du père (7.13), la prière (7.14). Puis un choc sourd (7.15), puis rien.

## 9. L'interface

- **Elle appartient au récit.** La fiche d'objet est la mémoire du lecteur : elle ne cite que
  des phrases déjà lues. Le carnet des portes est la vie de Darshan dessinée en
  constellation, avec la porte du père à part. Chez Julie, l'interface est son téléphone,
  qui ne montre que ce que le livre dit.
- **Elle meurt avec la magie** (7.14) : la clé part en poussière d'or, les étoiles du carnet
  s'éteignent une à une, les boutons disparaissent. La dernière page propose seulement de
  relire (« Nouvelle lecture » rallume tout).
- Les textes d'interface sont brefs (huit mots au plus), dans le vocabulaire du livre, et
  n'ajoutent jamais d'histoire.

## 10. L'équipe et la méthode

**Les rôles**, tenus pour chaque scène :

| Rôle | Sa question |
|---|---|
| **Dramaturge** | Que se passe-t-il vraiment ? Quel est l'enjeu, l'émotion, le point de vue ? Quelle phrase porte la scène ? |
| **Réalisateur** | Comment la montrer ? Plan, mouvement, place du texte, découpage en temps, raccords d'entrée et de sortie. |
| **Directeur artistique** | Quelle image ? Quelle photo de Karl, encre ou photo, quelle composition, quelle couleur ? |
| **Designer d'interaction** | Faut-il un geste ? Lequel, pourquoi, avec quelle sensation, quel équivalent sans geste ? |
| **Designer sonore** | Quelle ambiance, quels événements, où le silence ? |
| **Gardien du texte** | Le texte est-il intact et lisible, sans script comme avec ? Un mot nouveau est-il vraiment nécessaire ? Est-ce accessible ? |
| **Monteur** | La scène tient-elle dans le chapitre ? Durée, rythme, rimes avec d'autres scènes. |

**Le déroulé**, chapitre par chapitre :
1. **Lecture** : lire le chapitre entier, d'abord comme un lecteur, puis tracer sa courbe
   d'émotion et relever les phrases qui portent chaque scène.
2. **Table ronde** : chaque rôle propose, le dramaturge en premier.
3. **Décisions** : on garde ce qui sert le plus le récit sans trahir le texte ; une scène,
   une idée forte ; le reste se tait.
4. **Relecture critique** : un regard extérieur (le « script doctor ») cherche le gratuit,
   le confus, l'infidèle, l'inaccessible, l'incohérent d'une scène à l'autre, et propose
   mieux.
5. **Fiche de production** : ce que la fabrication doit faire (`livre.py`, `decoupage.py`,
   `interface.ini`), les photos retenues, les plans que Karl pourrait photographier.

**Le traitement d'une scène** (modèle) :

```
### 1.3 Le pigeonnier
Intention : ce que le lecteur doit ressentir ou comprendre, en une ou deux phrases.
Phrase-clé : la phrase du livre qui porte la scène, mot pour mot.
Point de vue et plan : caméra, cadre, mouvement.
Temps : comment le texte se découpe, et où un temps crée du suspense.
Image : décor(s), photo(s) de Karl (numéro et titre), encre ou photo, composition, lumière ;
        raccord d'entrée et de sortie.
Geste : la mécanique, sa sensation, son sens ; ou pourquoi il n'y en a pas. Équivalent sans geste.
Effets : ce qui arrive, sur quelle phrase, combien de temps.
Son : ambiance, événements, silence.
Objets et interface : ce qui change dans les sacs, le carnet, l'interface.
Rimes : avec quelles scènes elle dialogue.
À valider par Karl : photos avec une personne, choix discutables, textes d'interface nouveaux.
```

**Chaque chapitre rend aussi** :
- sa courbe d'intensité, scène par scène ;
- la liste des photos retenues (numéro, titre, scène, recadrage) ;
- la liste des plans que Karl pourrait photographier pour aller plus loin (un repérage
  précis : sujet, lumière, cadre, en hauteur) ;
- les mécaniques et les effets nouveaux qu'il demande au moteur, décrits précisément ;
- les questions pour Karl.

## 11. Les règles qui ne se discutent pas

- **Le texte** : intact, complet, dans l'ordre ; aucune citation inventée ; aucune
  paraphrase affichée comme si elle venait du livre ; aucune parole ni aucun message inventé
  (les messages de Julie à Amélie s'écrivent sans texte, puisque le livre ne le donne pas).
- **Les textes d'interface** : dans `interface.ini`, brefs, validés par Karl.
- **Les photos** : seulement celles de Karl (photographe 28489473 sur Pexels) ; les visages
  reconnaissables signalés ; chaque photo garde sa page sur photos.karlforterre.fr.
- **L'accessibilité** : chaque geste a un équivalent par simple toucher et au clavier, et un
  bouton pour avancer sans lui ; rien d'essentiel ne passe par le seul son ni la seule
  couleur ; mouvement réduit respecté ; tout le texte lisible sans script.
- **Les liseuses** : Apple Books isole chaque page (l'état se déduit de la page) ; pas de
  glissement horizontal ; au plus trois animations sur toile par page ; images de 1600 × 2400.
- **La ligne de Karl** : rien qui puisse passer pour une sympathie monarchiste ou
  conservatrice ; un lieu chargé d'histoire se montre par ce qu'il a de populaire ou de
  républicain.

## 12. Arbitrages de la direction

Décisions prises à la lecture des premiers traitements ; elles valent pour tous les chapitres.

1. **Le père ne répond jamais.** Ni à « Papa, où es-tu ? » (1.1), ni à l'appel de 6.11
   (« Rien ne se passe. »). Il ne se montre que par sa porte, celle de la lanterne : dans la
   vision (3.10, 3.11), puis rue de Rungis (7.12 à 7.14). Son accord ne sonne entier
   qu'avec elle ; avant 3.10, on n'entend que la quinte à vide de l'appel. La lumière du
   pigeonnier (1.3) est celle de l'autre côté de la porte, le soleil d'Aluva : elle a son
   propre son, jamais l'accord du père.
2. **La ballade naît par fragments** : quelques notes étouffées quand Darshan parle de Paris
   (1.7) et sur le seuil (2.9) ; entière pour la première fois dans la vidéo du téléphone de
   Julie (5.7), la seule fois où quelqu'un la chante dans le livre ; puis au baiser (7.10).
   Nulle part ailleurs.
3. **Les clés se tournent du même geste** : la mécanique `tourner` (un quart de tour du doigt
   autour de la clé, sur un cercle d'au moins 250 unités de rayon, pour rester facile sur un
   téléphone), au pigeonnier (1.3), au placard (6.13) et à la serrure du local (7.8). Même
   consigne, même son.
4. **La place du texte suit l'image** : le panneau se pose là où l'image laisse de la place
   (ciel, ombre, mur) ; son fond suit la lumière de l'image (clair sur une image claire,
   sombre sur une image sombre). Dans une suite de pages au même lieu (Aluva de 1.4 à 1.9,
   l'appartement du chapitre 6), il ne change pas de place sans raison.
5. **Gestes et tour de page** : tant que l'essai dans Apple Books n'est pas fait, aucun geste
   ne demande un long mouvement horizontal ; un tracé reste compact (moins de 250 unités de
   large) ou vertical, et les glissements sont verticaux.
6. **Le carnet** : l'étoile d'une porte naît quand le passage s'achève à l'image (la lumière
   de l'embrasure a gagné l'écran), pas avant.
7. **L'image ne contredit jamais le texte** : on ne montre pas ce que le texte dit invisible
   (« disparaît loin de la vue de Jivan » interdit de montrer Jivan le regarder partir).
   Une photo prise ailleurs que le lieu du texte convient pour un reflet, un souvenir, un
   rêve ou une matière ; pour un lieu nommé et montré en plan large (Paris, la rue
   Rousseau, Montsouris), on préfère une photo de Karl prise là, ou un repérage.
8. **Les deux paquets** : le paquet de Darshan (7.9) porte le même nom et le même ruban que
   celui de Julie ; quand Julie le prend (7.11), il n'en reste qu'un dans son sac. Le livre
   ne dit pas si c'est le même paquet ; l'interface non plus.

## 13. Décisions de Karl

À appliquer par toutes les équipes, et à reporter dans la fabrication.

**29 septembre 2026**
- Le graffiti « je t'aime » (38570603) est recadré sur « aime » ; il paraît un instant au
  tableau 6.11, quand Julie dit « je t'aime ». C'est fait dans `livre.py` et `decors.py`.
- La page de titre dit « nouvelle ».
- ISBN : Karl le demande lui-même à l'AFNIL, un numéro par format. En attendant, aucun ISBN.
- Photos où l'on voit une personne : **oui** pour « Dos » (33035648), qui peut être Julie,
  et pour les passants flous de « Fantômes » (31641251) et de « Repos » (34500385). Le
  portrait 38536478 reste exclu tant que Karl n'en a pas décidé.
- Pékin : **oui** pour « Intérieur moderne d'une bibliothèque aux étagères en verre, à
  Gijón » (39670619), la bibliothèque de l'Universidad Laboral, dont on ne voit que les
  rayonnages.

