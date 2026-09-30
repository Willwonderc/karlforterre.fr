// ---------------------------------------------------------------- départ : navigation et mise en route
/* Édition web : toutes les pages sont dans un seul document ; une seule est visible (classe
   « active ») ; on passe à la suivante par le balayage qu'elle annonce (data-entree). L'adresse
   peut viser une page (#s-3-10). EPUB : chaque page est un document à part ; elle se met en
   route seule et joue son entrée. Ce que le lecteur porte, les portes franchies et ce qu'il a
   lu se déduisent de la page (data-sac, data-sac-julie, data-portes, data-lu0, sans-magie) :
   aucune mémoire n'est nécessaire, la mémoire locale ne sert qu'à « Reprendre ». */

var scenes = $$('.scene');
var actuelle = -1;
var fond = estEpub ? null : el('div', { id: 'ambiance', 'aria-hidden': 'true' }, doc.body);

function sceneCourante() { return estEpub ? scenes[0] : scenes[actuelle]; }
// La scène démarre sous son balayage d'entrée ; le texte attend qu'il soit fini.
function quandEntree(sc) { return sc.entreeFaite || Promise.resolve(); }
function liste(sc, attr) { return (sc.getAttribute(attr) || '').split(/\s+/).filter(Boolean); }

// Édition web : les 85 pages sont dans un seul document. Une page quittée rend ses images (elles
// reviennent quand on y retourne), sinon un téléphone garderait en mémoire tous les décors vus.
function liberer(sc) {
  $$('img[src]', sc).forEach(function (img) { img.setAttribute('data-src', img.getAttribute('src')); img.removeAttribute('src'); });
}
function recharger(sc) {
  $$('img[data-src]', sc).forEach(function (img) { img.setAttribute('src', img.getAttribute('data-src')); img.removeAttribute('data-src'); });
}
// Le fichier du premier décor de la page suivante est lu d'avance (le balayage ne découvre pas
// une image encore vide) ; seul le fichier est gardé, pas l'image décodée.
function precharger(sc) {
  var img = sc && $('.decor img', sc);
  var src = img && (img.getAttribute('src') || img.getAttribute('data-src'));
  if (src) { var i = new Image(); i.src = src; }
}

function entrerDansScene(sc) {
  var lu0 = +sc.getAttribute('data-lu0') || 0;
  if (lu0 > Lecture.max) Lecture.max = lu0;
  var magie = !sc.classList.contains('sans-magie');
  // les états de la page, calculés par build.py (synthèse, partie 3.3)
  var barre = sc.getAttribute('data-barre') || 'darshan';
  html.classList.toggle('sans-magie-page', !magie);
  html.classList.toggle('barre-julie', barre === 'julie');
  html.classList.toggle('voile-page', sc.getAttribute('data-voile') === 'oui');
  html.classList.toggle('repliques-claires', sc.getAttribute('data-repliques') === 'clair');
  Objets.initialiser(liste(sc, 'data-sac'), liste(sc, 'data-sac-julie'),
    { barre: barre, regard: sc.getAttribute('data-regard') === 'oui' });
  Carnet.initialiser(liste(sc, 'data-portes'), magie,
    { pere: sc.getAttribute('data-pere'), boussole: sc.getAttribute('data-boussole') });
  Compte.afficher(sc, sc.getAttribute('data-compte'));
  var rang = scenes.indexOf(sc) + 1;
  if (!estEpub && rang > 1) ecrire('darshan.page', rang);
}

var Navigation = {
  // Web : montrer la page i (sans balayage) et la jouer.
  aller: function (i) {
    if (i < 0 || i >= scenes.length) return;
    var avant = scenes[actuelle], apres = scenes[i];
    if (avant) { avant.classList.remove('active'); Visuels.quitter(avant); liberer(avant); }
    actuelle = i;
    recharger(apres);
    apres.classList.add('active');
    entrerDansScene(apres);
    var img = $('.decor img', apres);
    if (fond && img) fond.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
    var son = apres.getAttribute('data-son');
    if (son) Son.ambiance(son);
    precharger(scenes[i + 1]);
    if (!apres.demarree) { apres.demarree = true; Scenes.jouer(apres); }
    else if (apres.recit) apres.recit.toutMontrer();
  },
  // Passer à la page suivante : sur le web, le balayage que la suivante annonce ; `o.de` :
  // d'où part le balayage dans la page qui s'en va.
  suivante: function (scene, o) {
    var i = scenes.indexOf(scene);
    if (estEpub || i < 0 || i + 1 >= scenes.length) return;
    Transitions.passer(scene, scenes[i + 1], function () { Navigation.aller(i + 1); }, o);
  },
  // Aller à la page de rang r (1 = page de titre) : un fondu sur le web, un lien dans l'EPUB.
  allerA: function (r) {
    if (estEpub) { window.location.href = 'p' + ('00' + r).slice(-3) + '.xhtml'; return; }
    var i = Math.max(0, Math.min(scenes.length - 1, r - 1)), sc = scenes[i];
    if (!sc) return;
    sc.demarree = false;
    Transitions.passer(scenes[actuelle], sc, function () { Navigation.aller(i); }, { type: 'fondu' });
  },
  relire: function () {
    if (estEpub) { window.location.reload(); return; }
    window.location.hash = scenes[actuelle].id;
    window.location.reload();
  },
  recommencer: function () {
    ecrire('darshan.page', null);
    if (estEpub) { Navigation.allerA(1); return; }
    window.location.hash = '';
    window.location.reload();
  },
  // Rang de la page où le lecteur s'était arrêté (web), ou 0.
  reprise: function () { var r = lire('darshan.page'); return typeof r === 'number' ? r : 0; }
};

function depart() {
  scenes.forEach(installerBarre);
  if (estEpub) {
    // dans l'EPUB, une page = une scène ; le son démarre au premier toucher de la page
    var s = scenes[0];
    if (!s) return;
    s.classList.add('active');
    entrerDansScene(s);
    var a = s.getAttribute('data-son');
    if (a) Son.ambiance(a);
    doc.addEventListener('pointerdown', function premier() {
      doc.removeEventListener('pointerdown', premier);
      Son.init();
    });
    Transitions.entree(s);
    Scenes.jouer(s);
    return;
  }
  // web : la page visée par l'adresse, sinon la page de titre
  var cible = window.location.hash ? doc.getElementById(window.location.hash.slice(1)) : null;
  var i = cible ? scenes.indexOf(cible) : 0;
  Navigation.aller(i < 0 ? 0 : i);
  if (i > 0) {
    doc.addEventListener('pointerdown', function premier() { doc.removeEventListener('pointerdown', premier); Son.init(); });
    doc.addEventListener('keydown', function premier() { doc.removeEventListener('keydown', premier); Son.init(); });
  }
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', depart); else depart();
