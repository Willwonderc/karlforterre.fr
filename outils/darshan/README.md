# Darshan, le livre qui se joue : tranche verticale

Prototype construit le 28 septembre 2026 pour évaluer une édition « presque jeu vidéo »
de *Darshan*. L'évaluation complète, la piste recommandée et le plan des sessions sont
dans [docs/plan-darshan.md](../../docs/plan-darshan.md).

L'extrait couvre le poème d'ouverture et le début du chapitre « Un ciel mouvant »,
jusqu'à l'arrivée à Aluva : six tableaux, environ 430 mots, le texte de l'édition 2023
sans un mot changé.

Rien ici n'est encore relié au site : aucune page ne pointe vers ce dossier.

## Jouer

- **Sur ordinateur ou téléphone** : fabriquer (ci-dessous), puis ouvrir
  `outils/darshan/dist/web/index.html` dans un navigateur. Toucher « Ouvrir », puis
  avancer en touchant le texte, l'étoile ✦, ou avec les touches Entrée, Espace et →.
- **Dans une liseuse** : ouvrir `outils/darshan/dist/darshan-extrait-jouable.epub`.
  Dans Apple Books (iPhone, iPad, Mac), dans l'application Kobo et dans Thorium, les
  scripts s'exécutent et l'extrait se joue page par page. Ailleurs, chaque page reste un
  livre illustré où tout le texte se lit.
- Le bouton **Lecture** affiche tout le texte sans animation ; **Son** coupe ou remet le
  son.
- Le bouton **Objets** apparaît avec le premier objet (les lunettes, sur les tuiles). Il
  ouvre la fiche de chaque objet : un gros plan qu'on fait tourner du doigt, les phrases du
  livre déjà lues qui en parlent, et le geste du moment en bouton. La fiche de la clé se
  présente d'elle-même après la fonte des lunettes. Plan de l'interface :
  [docs/plan-darshan-interface.md](../../docs/plan-darshan-interface.md).

## Fabriquer

```
python3 outils/darshan/build.py
```

Python seul, sans module à installer. Le programme lit le texte dans
`livres/darshan.epub`, vérifie que chaque paragraphe découpé redonne exactement
l'original, et écrit dans `outils/darshan/dist/` (dossier non suivi par Git) :
- `web/` : l'édition web ;
- `darshan-extrait-jouable.epub` : l'EPUB 3 en pages fixes (1200 × 1800, format 2:3).

Contrôle : EPUBCheck 5.4.0 ne relève ni erreur ni avertissement.

```
java -jar epubcheck.jar outils/darshan/dist/darshan-extrait-jouable.epub
```

## Essayer automatiquement

Dans une session Claude (Playwright et Chromium y sont installés), depuis `outils/darshan/` :

```
NODE_PATH=/opt/node22/lib/node_modules node essai.js telephone
NODE_PATH=/opt/node22/lib/node_modules node captures.js
```

`essai.js` joue l'extrait de bout en bout et photographie chaque étape dans `captures/`
(non suivi par Git) ; `captures.js` photographie la version ordinateur, les pages de l'EPUB
et ces mêmes pages sans script.

## Refaire les images

Les images sont déjà dans `src/img/`. Pour les refaire (Pillow et Playwright nécessaires) :

```
python3 outils/darshan/images.py
```

Le ciel et les tuiles viennent de deux photos de Karl sur Pexels (27116682 et 34500347) ;
les toits, la tour Eiffel, le pigeonnier, la porte et Aluva sont dessinés par `art.py`,
puis photographiés par Chromium (`rendu.js`).

## Contenu

| Fichier | Rôle |
|---|---|
| `build.py` | Fabrique l'édition web et l'EPUB, texte vérifié contre `livres/darshan.epub`. Contient aussi les objets et leurs phrases (`OBJETS`), vérifiées mot pour mot. |
| `src/moteur.js` | Le moteur : texte révélé temps par temps, gestes, sons fabriqués en direct (Web Audio), étoiles, poussière, fonte des lunettes en clé, interface d'objet (fiche, bouton Objets, annonce), carnet des portes. Sans dépendance, sans appel réseau. |
| `src/moteur.css` | La mise en page, commune aux deux éditions (en unités `cqw` ; l'EPUB les convertit en pixels). |
| `src/fonts/` | Amiri et Unna (les polices du livre), Tiro Devanagari Sanskrit (pour दर्शन), allégées, licence SIL OFL. |
| `src/img/` | Décors prêts à l'emploi, et les deux images tirées des photos de Karl. |
| `art.py`, `rendu.js`, `images.py` | Dessin et préparation des images. |
| `essai.js`, `captures.js` | Essais automatiques dans Chromium. |
