# Darshan : l'interface du livre qui se joue

Plan rédigé le 28 septembre 2026 pour aller plus loin que l'extrait jouable. Il complète
[plan-darshan.md](plan-darshan.md) (évaluation, piste retenue, chantiers D1 à D10).

Point de départ :
- l'extrait jouable (`outils/darshan/`) se joue du poème d'ouverture jusqu'à l'arrivée à
  Aluva ;
- une première interface d'objet y a été ajoutée le même jour (partie 3) : fiche d'objet,
  bouton « Objets », annonce « Nouvel objet », halo sur l'objet qui attend un geste,
  consigne différée, geste proposé en bouton. EPUBCheck 5.4.0 ne relève rien, et la
  partie jouée par programme passe sans erreur sur téléphone et sur ordinateur.

## Objectif

**Qu'à chaque instant, le lecteur voie ce qui se touche, comprenne ce qu'il peut en faire,
et ne lise jamais que les mots de Karl.** L'interface apparaît quand elle sert, s'efface
sinon, et s'éteint avec la magie à la fin du livre.

## Principes

1. **Les mots de Karl, et rien d'autre.** Une fiche d'objet est faite de phrases du livre,
   vérifiées mot pour mot par la fabrication. Elle n'en montre jamais une que le lecteur
   n'a pas encore lue.
2. **L'interface n'apparaît que quand elle sert.** Le bouton « Objets » naît avec le
   premier objet ; la consigne écrite n'arrive qu'après quelques secondes sans geste.
3. **Deux mondes, deux interfaces.** Darshan : un écrin de nuit et d'or. Julie : son
   téléphone, que le livre décrit (photos, galerie, vidéo, appels).
4. **Deux chemins pour chaque geste.** Le geste direct, et le même geste en bouton dans la
   fiche de l'objet ; tout se fait aussi au clavier et avec VoiceOver.
5. **L'état se déduit de la page.** Ce que le lecteur a lu et ce que le personnage porte se
   calculent d'après l'endroit du livre où l'on se trouve. Aucune mémoire n'est nécessaire,
   ce qui compte chez Apple, où chaque page fixe est isolée.
6. **L'interface meurt avec la magie.** Quand Darshan devient mortel, la clé quitte les
   objets, les étoiles du carnet s'éteignent, les boutons disparaissent.

## 1. Ce qui manque encore (constat sur l'extrait)

| Moment | Aujourd'hui | À faire |
|---|---|---|
| Arrivée dans une scène | Rien n'indique ce qui se touche. | Points d'intérêt discrets (un reflet qui respire), aide qui se précise avec le temps. |
| Gestes | Halo et consigne différée, faits pour les lunettes et la clé. | Généraliser à tous les gestes ; bouton « Faire le geste » si le lecteur reste bloqué. |
| Objets | Fiche, bouton « Objets », annonce : faits. | Appui long sur un objet de la scène, fiches qui changent d'allure au fil du livre, phrases tenues dans un fichier que Karl peut corriger. |
| Portes | Le carnet ne s'ouvre qu'à la fin de l'extrait. | Carnet accessible dès la première porte, une fiche par porte. |
| Dialogues | Pas encore dans l'extrait. | Qui parle, sans rien inventer. |
| Monde de Julie | Pas encore dans l'extrait. | L'interface du téléphone. |
| Confort | Son et Lecture seulement. | Réglages : grand texte, mouvement réduit, sons séparés, sous-titres des sons. |
| Relire | Impossible en mode jeu, sauf par « Lecture ». | Historique de la page. |

## 2. La grammaire d'interaction

Les dix éléments de l'interface, et comment on y accède sans geste :

| Élément | Rôle | Allure | Déclenchement | Sans geste |
|---|---|---|---|---|
| Point d'intérêt | Signaler ce qui se touche | Reflet d'or qui respire | Toucher ; survol sur ordinateur | Tab puis Entrée |
| Geste attendu | L'action que la phrase raconte | Halo autour de l'objet, consigne après 2,5 s | Geste direct | Bouton dans la fiche, Entrée, → |
| Fiche d'objet | Regarder l'objet, lire ce que le livre en dit, agir | Écrin nuit et or ; carte de téléphone chez Julie | Toucher l'objet, le bouton « Objets » ou l'annonce | Clavier, VoiceOver |
| Objets | Ce que le personnage porte | Bouton avec compteur, né avec le premier objet | Bouton | Tab |
| Annonce « Nouvel objet » | Signaler l'arrivée d'un objet | Bandeau qui descend, 4,8 s | Automatique | Annoncée aux lecteurs d'écran |
| Carnet des portes | Les portes franchies | Constellation sur une carte du ciel | Bouton « Carnet », dès la première porte | Liste des portes |
| Regard | Voir à travers les lunettes (dès le chapitre 3) | Loupe ronde | Appui maintenu sur les lunettes | Bouton « Regarder à travers » |
| Dialogue | Qui parle | Couleur et alignement propres à chacun | Automatique | Lu par VoiceOver |
| Historique | Relire la page | Panneau du texte déjà lu | Glisser vers le bas, bouton | Tab |
| Réglages | Confort | Panneau | Bouton | Tab |

## 3. La fiche d'objet

Faite dans l'extrait pour les lunettes et la clé. Ce qui suit fixe la règle pour tout le
livre.

**Quand elle s'ouvre**
- D'elle-même, une seule fois, quand un objet important apparaît : c'est le cas de la clé,
  qui se présente juste après la fonte des lunettes. *Fait.*
- Quand on touche l'objet dans « Objets », ou l'annonce « Nouvel objet ». *Fait.*
- Par un appui long sur un objet de la scène, quand le toucher simple fait déjà le geste.
- **Jamais pendant un temps fort** : la vision du mudrā, le « je t'aime » du chapitre 6, le
  baiser et la prière du chapitre 7. La fabrication refuse une fiche placée à ces temps.

**Ce qu'elle contient**
- Un gros plan qu'on fait tourner du doigt et qui revient en place. *Fait.* Plus tard :
  un dessin par état, puisque les lunettes « changent assez régulièrement ». Les « lunettes
  fumées » du chapitre 1 deviennent au chapitre 6 « une paire de binocles ronds pincés au bout
  de fines tiges grises », et la clé du placard est « de laiton un peu oxydé ».
- Le nom, tiré du texte (« Les lunettes fumées », « La clé »). *Fait.*
- Les phrases du livre qui parlent de l'objet, **déjà lues**, avec leur chapitre. *Fait.*
  La fiche s'enrichit au fil de la lecture : les lunettes apparaissent dans 14 phrases, du
  chapitre 1 au chapitre 7.
- Les gestes possibles à cet instant, avec les verbes du texte. *Fait* : « Ôter les
  lunettes », « Faire un geste vif », « Porter la clé à la serrure », « Donner un tour de
  poignet ».
- « Fermer ». *Fait.*

**Forme**
- Chez Darshan, un écrin : fond de nuit, filet d'or, gros plan au-dessus, phrases en
  italique avec leur chapitre en petites capitales. *Fait.*
- Chez Julie, une carte de téléphone : l'objet en photo, et pour légende une phrase du
  livre.
- Sur toutes les tailles d'écran, une feuille qui monte du bas de la page. La page fixe est
  en portrait partout.

**Accessibilité** (*fait*, sauf mention)
- Fenêtre de dialogue : le focus va au premier bouton, Tab reste dans la fiche, Échap la
  ferme. En fermant, le focus revient où il était ; après une action, il revient à la
  lecture.
- VoiceOver lit le nom puis les phrases ; le gros plan est décoratif.
- En mouvement réduit, ni balancement ni rotation.
- Au clavier, un bouton ne garde que ses touches (Entrée, Espace) ; → fait toujours
  avancer le texte.
- À faire : le rendu avec VoiceOver sur iPhone, essayé par Karl.

**Données**
- Aujourd'hui dans `build.py` : pour chaque objet, un nom et des phrases (paragraphe,
  phrase exacte, chapitre). La fabrication vérifie chaque phrase mot pour mot et lui
  attache sa position de lecture : le moteur ne l'affiche qu'une fois le lecteur passé.
  *Fait.*
- À faire : un fichier `outils/darshan/objets.ini`, lisible par Karl, sur le modèle des
  fichiers `.ini` du site photo, pour ajouter ou retirer une phrase sans toucher au
  programme.

## 4. Les objets du livre

Premier relevé automatique, à confirmer au fil des chantiers :

| Objet | Chapitres | Rôle dans le jeu | Gestes, verbes du texte | Phrases |
|---|---|---|---|---|
| Lunettes fumées, puis binocles | 1, 3, 5, 6, 7 | L'objet principal | ôter, geste vif, regarder à travers (3), remettre (6) | 14 |
| Clé, clés | 1, 3, 6, 7 | Forme de chaque porte | insérer, tourner ; « d'un mouvement de poignet les change en clés » (6) | 8 |
| Bombe de mousse à raser | 1 | Point d'intérêt à Aluva | dessiner la moustache, tailler le bouc | 2 |
| Coutelas, tonneau | 1 | Points d'intérêt | se saisir du coutelas | 2 |
| Filet, maquereaux | 1 | Jivan à l'ouvrage | – | 4 |
| Montre | 1 | Point d'intérêt | regarder l'heure | 1 |
| Assiette, tartare, pain perdu sur porcelaine jaune tournesol | 2 | Nature morte à toucher | – | 6 |
| Recueil de poèmes sanskrits | 3 | Fiche : les deux vers | lire | 2 |
| Lanterne de la porte du père | 3, 7 | Étoile à part dans le carnet | tendre la main | 3 |
| Thés, curcuma, encens, jarres, tapisseries, confettis | 5 | Objets du marché | acheter ; les confettis ne servent jamais | 2 |
| Téléphone de Julie : photos, vidéo | 2, 5 | Interface de Julie | faire défiler | 7 |
| Charlotte aux framboises, ruban rouge, paquet | 5, 6, 7 | Objets de Julie | choisir derrière la vitrine embuée, porter | 8 |
| Bague, boucles d'oreilles, sac à main | 6 | Listes parallèles | cocher | 2 |
| Théière, tasse de cuivre | 6 | Geste | verser de haut | 3 |
| Toiles, « Le lac Ladoga » | 6 | Points d'intérêt de l'appartement | regarder | 4 |
| Placard | 6 | Porte | ouvrir avec la clé de laiton | 3 |
| Porte du local, électrocardiogramme | 7 | Geste | frapper | 1 |
| Lettre | 7 | Objet | écrire, glisser sous la porte | 5 |

## 5. Les autres interfaces

**Le carnet des portes.** Accessible dès la première porte, par un bouton « Carnet » qui
naît avec elle. Chaque porte est une étoile. Sa fiche donne d'où l'on part, où l'on
arrive, le dessin de la clé et la phrase du passage. Les étoiles se relient en
constellation. À la fin, elles s'éteignent une à une.

**Le regard (dès le chapitre 3).** « Elles portent sa vue plus loin que si elles
s'étaient gardées de rester sur son nez. » Un appui maintenu sur les lunettes ouvre une
loupe ronde : on y voit ce que Darshan seul perçoit, les jours des portes et la lumière
des passages. Le regard n'est jamais nécessaire pour avancer ; c'est la récompense de
l'exploration, et il donne son sens au titre.

**Les dialogues.** Le livre ne nomme pas toujours qui parle : Jivan n'a son nom qu'à la
fin de la scène. L'interface ne le révélera pas avant le texte. Pas d'étiquette de nom,
mais une couleur et un alignement par personnage : Darshan en or, ses interlocuteurs en
clair.

**L'interface de Julie (chapitres 4 à 7).**
- Un téléphone : l'écran du RER, la galerie du chapitre 5, qu'on fait défiler, et la vidéo
  de la ballade.
- Les messages à Amélie ne s'affichent qu'en train de s'écrire, sans texte, puisque le livre
  n'en donne pas le contenu. L'appel d'Amélie, lui, montre ses mots, qui sont dans le livre.
- Pour les photos de la galerie, Karl choisit : d'autres photos du modèle de la couverture,
  s'il en existe sur Pexels sous la même licence ; une séance mise en scène ; ou des dessins.

**L'aide progressive.** Quatre paliers :
1. le reflet sur ce qui se touche, dès l'arrivée ;
2. le halo, dès qu'un geste est attendu ;
3. la consigne écrite, après 2,5 s ;
4. un bouton « Faire le geste », après 8 s.

Le premier geste du livre, la danse sur les tuiles, garde sa consigne immédiate : il sert
de tutoriel.

**Les réglages.**
- Son : trois niveaux séparés (ambiance, effets, voix).
- Mouvement : normal ou réduit.
- Texte : normal ou grand. En grand, la page fixe montre moins de mots à la fois.
- Lecture : tout le texte, sans animation.
- Sous-titres des sons, pour les sons qui portent du sens (la porte qui grince, le bruit
  sourd du chapitre 7).

**L'historique.** Glisser vers le bas pour relire ce qui a déjà défilé dans la page, comme
dans les romans visuels.

**Le menu et la reprise.** La page de titre sert de porte d'entrée : « Commencer »,
« Reprendre » (édition web ; dans l'EPUB, le signet de la liseuse suffit), et
« Chapitres », où seules les portes déjà franchies sont allumées.

## 6. Mise en scène : aller plus loin

- **Profondeur** : trois plans par décor (fond, milieu, premier plan) qui glissent
  légèrement au toucher. Pas d'inclinaison du téléphone : iOS demande une autorisation que
  les liseuses ne donnent pas.
- **Raccords** : chaque page commence sur l'image où la précédente s'arrête. Chez Apple,
  chaque page est isolée ; le raccord masque la coupure.
- **Lumière et temps** : la poussière dans la lumière et les étoiles sont faites ; restent
  la pluie du désert qui fleurit, la chaleur d'Aluva, la nuit de Pékin.
- **Typographie** : quelques mots animés aux temps forts, et seulement là.
- **Son** : une famille de sons d'interface (tintement de l'annonce, papier de la fiche :
  *faits*) ; la voix passe toujours au-dessus.
- **Budget** : 60 images par seconde sur un iPhone 11 ; au plus trois animations sur toile
  (canvas) par page ; images de 3,8 mégapixels au plus.

## 7. Technique

- **Moteur** en modules : récit, gestes, objets, carnet, regard, dialogues, réglages, son,
  accessibilité. La fabrication les assemble en un seul fichier minifié.
- **Deux fichiers lisibles par Karl** :
  - `objets.ini` : les objets, leurs noms et leurs phrases ;
  - `interface.ini` : **tous** les textes d'interface, les seuls textes nouveaux du livre.

  La fabrication refuse une phrase absente du livre, et un texte d'interface qui ne vient
  pas d'`interface.ini`.
- **Essais automatiques** :
  - la partie jouée ouvre chaque fiche et chaque panneau, et photographie tout ;
  - elle vérifie qu'aucune phrase n'apparaît avant d'avoir été lue ;
  - elle joue tous les gestes au clavier seul, puis en mouvement réduit.
- **Pages sans script** : l'interface n'y existe pas, et tout le texte s'y lit.

## 8. Chantiers

À intercaler dans ceux de [plan-darshan.md](plan-darshan.md) : I1 et I2 avant D3
(chapitres 1 et 2), I3 avant D5 (chapitres 4 et 5), I4 à I6 avec D8 et D9.

| Chantier | Contenu | Réussi quand |
|---|---|---|
| I1. Interface d'objet | Faite en partie le 28 septembre. Reste : `objets.ini` et `interface.ini`, appui long sur les objets de la scène, dessins d'états, points d'intérêt hors objets, bouton « Faire le geste » | Karl ajoute une phrase à une fiche en modifiant `objets.ini`, sans session |
| I2. Carnet et regard | Carnet dès la première porte, fiche de porte, constellation ; loupe du regard | Toutes les portes de l'extrait ont leur fiche ; le regard révèle les jours de la porte du pigeonnier |
| I3. Dialogues et monde de Julie | Couleurs de dialogue ; interface du téléphone, galerie, messages sans texte, appel | La scène du restaurant et le chapitre 4 se jouent avec leurs interfaces |
| I4. Confort | Aide progressive complète, historique, réglages (grand texte, sons, sous-titres), menu et reprise | Un lecteur bloqué est toujours débloqué en 8 s ; le grand texte se lit sur un iPhone SE |
| I5. Mise en scène | Profondeur à trois plans, raccords entre pages, pluie et chaleur, typographie des temps forts | Karl préfère la nouvelle version, vue côte à côte avec l'ancienne |
| I6. Accessibilité et essais | VoiceOver, clavier complet, mouvement réduit ; essais Apple Books, Kobo, Thorium ; captures de chaque fiche | Ace sans erreur grave ; essai VoiceOver par Karl sans blocage |

### Consignes prêtes à coller

```text
Chantier I1 de docs/plan-darshan-interface.md : interface d'objet.
Pars de l'extrait d'outils/darshan/ (fiche d'objet, bouton Objets, annonce, halo, consigne différée, déjà faits). Déplace les objets et leurs phrases dans outils/darshan/objets.ini, et tous les textes d'interface dans outils/darshan/interface.ini, lisibles par moi ; la fabrication refuse une phrase absente du livre et un texte d'interface hors de ce fichier. Ajoute l'appui long sur les objets de la scène, un dessin par état d'objet, des points d'intérêt (reflet) et le bouton « Faire le geste » après 8 s. Vérifie par la partie jouée qu'aucune phrase n'apparaît avant d'avoir été lue, photographie chaque fiche, pousse ton travail à chaque étape, puis ouvre la pull request.
```

```text
Chantier I2 de docs/plan-darshan-interface.md : carnet des portes et regard.
Bouton « Carnet » né avec la première porte ; une fiche par porte (départ, arrivée, dessin de la clé, phrase du passage) ; constellation qui se dessine et, à la fin du livre, s'éteint. Le regard : appui maintenu sur les lunettes, loupe ronde qui révèle les jours des portes, jamais nécessaire pour avancer ; disponible à partir du chapitre 3. Mêmes vérifications que pour I1.
```

```text
Chantier I3 de docs/plan-darshan-interface.md : dialogues et monde de Julie.
Dialogues : couleur et alignement par personnage, sans nommer quelqu'un avant le texte. Interface du téléphone de Julie : écran du RER, galerie du chapitre 5 qu'on fait défiler, vidéo de la ballade, messages à Amélie qui s'écrivent sans texte, appel d'Amélie avec ses mots du livre. Demande-moi les photos de la galerie avant de les produire.
```

```text
Chantier I4 de docs/plan-darshan-interface.md : confort.
Aide progressive à quatre paliers, historique de la page, réglages (son en trois niveaux, mouvement, grand texte, lecture, sous-titres des sons), menu de la page de titre et reprise dans l'édition web. Essaie le grand texte sur un écran d'iPhone SE (375 × 667).
```

```text
Chantier I5 de docs/plan-darshan-interface.md : mise en scène.
Profondeur à trois plans par décor, raccords entre les pages, pluie et chaleur, typographie des temps forts. Garde 60 images par seconde et au plus trois animations sur toile par page ; montre-moi l'ancienne et la nouvelle version côte à côte.
```

```text
Chantier I6 de docs/plan-darshan-interface.md : accessibilité et essais.
Ace by DAISY sans erreur grave ; clavier complet ; mouvement réduit ; fiche d'essai VoiceOver pour moi sur iPhone ; essais dans Apple Books, l'application Kobo et Thorium ; captures de chaque fiche et de chaque panneau, dans les deux mondes.
```

## 9. Textes d'interface à valider

Ce sont les seuls textes nouveaux de l'extrait. Karl les valide, les corrige, ou choisit
des pictogrammes à la place.

| Où | Texte |
|---|---|
| Page de titre | « nouvelle — extrait jouable », « Ouvrir » |
| Barre | « Son », « Objets », « Lecture », « Revenir au mode jeu » |
| Fiche et panneau | « Nouvel objet », « Sur soi », « Objets », « Aucun objet pour l'instant. », « Fermer » |
| Gestes proposés | « Ôter les lunettes », « Faire un geste vif », « Porter la clé à la serrure », « Donner un tour de poignet » |
| Consignes | « Touchez en rythme pour enjamber les tuiles », « Touchez les lunettes pour les ôter », « Un geste vif : glissez vers le haut, ou touchez », « Portez la clé jusqu'à la serrure, ou touchez-la », « Un tour de poignet : touchez la clé », « Poussez la porte », « Tournez la page » |
| Fin de l'extrait | « Fin de l'extrait jouable », « Première porte franchie : du pigeonnier du seizième au local à kayaks d'Aluva. », « Carnet des portes », « Recommencer », « Chaque porte franchie s'allume ici comme une étoile. (Toucher pour fermer.) » |

## 10. Mesures de réussite

| Indicateur | Cible |
|---|---|
| Phrases des fiches présentes mot pour mot dans le livre | 100 %, vérifié à chaque fabrication |
| Phrases montrées avant d'avoir été lues | 0, vérifié par la partie jouée |
| Gestes faisables au bouton et au clavier | 100 % |
| Fiches ouvertes pendant un temps fort | 0 |
| Lecteur bloqué plus de 8 s | jamais : le bouton « Faire le geste » paraît |
| EPUBCheck 5.4.0, avertissements compris | 0 |
| Ace by DAISY, violations graves | 0 |

Références de jeux pour l'interface : *The Room* (objets qu'on tourne du doigt), *Outer
Wilds* (journal de bord), *Heaven's Vault* (carnet de traduction), *A Normal Lost Phone*
(un téléphone qui raconte), *Florence* (des gestes qui racontent). Voir l'annexe B de
[plan-darshan.md](plan-darshan.md).
