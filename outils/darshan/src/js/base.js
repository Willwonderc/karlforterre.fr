/* Darshan, le livre des portes : le moteur du livre jouable.
   Amélioration progressive : sans ce script (ou dans une liseuse qui ne l'exécute pas),
   chaque page reste une page illustrée où tout le texte est lisible. Avec lui, le texte
   se révèle temps par temps, certains temps attendent un geste du lecteur, et le son est
   fabriqué en direct (Web Audio), sans aucun fichier. Aucune dépendance, aucun appel réseau.
   Chaque geste a un équivalent au toucher simple et au clavier, et un bouton pour avancer
   sans le faire.

   Fragments (assemblés dans cet ordre par build.py) : base (outils, réglages), son,
   visuels (étoiles, particules, dessins des objets), transitions (balayages, éclats),
   interface (objets, carnet, menu, aide), recit (le texte temps par temps), mecaniques (les
   gestes), effets (ce que fait une phrase), scenes (le déroulé d'une page et les scènes
   écrites à la main), depart (navigation). */

var doc = document;
var html = doc.documentElement;
var estEpub = html.classList.contains('epub');
var W = 1200, H = 1800;

// ---------------------------------------------------------------- mémoire (facultative)
function lire(cle) { try { return JSON.parse(window.localStorage.getItem(cle)); } catch (e) { return null; } }
function ecrire(cle, v) { try { window.localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* rien */ } }

// ---------------------------------------------------------------- données du livre (js/donnees.js)
var DONNEES = window.DARSHAN || { ui: {}, objets: {}, familles: {}, carte: { lieux: {}, portes: {} }, chapitres: [] };
// Tous les textes d'interface viennent d'interface.ini, par ui('cle').
function ui(cle) { return (DONNEES.ui && DONNEES.ui[cle]) || cle; }

// ---------------------------------------------------------------- peut-on jouer ?
function peutJouer() {
  var rs = navigator.epubReadingSystem;
  if (rs && typeof rs.hasFeature === 'function') {
    try { if (rs.hasFeature('dom-manipulation') === false) return false; } catch (e) { /* on tente */ }
  }
  return !!(doc.querySelector && window.requestAnimationFrame && html.classList && window.addEventListener &&
    window.DOMParser && window.Promise && Object.keys);
}
var reglages = lire('darshan.reglages') || {};
if (reglages.son === undefined) reglages.son = true;
if (reglages.grand) html.classList.add('grand');
if (!peutJouer() || reglages.lecture) { installerBoutonJeu(); return; }
html.classList.add('jeu');
var calme = !!(reglages.mouvement === 'reduit' ||
  (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));
if (calme) html.classList.add('calme');

// ---------------------------------------------------------------- petits outils
function $(sel, racine) { return (racine || doc).querySelector(sel); }
function $$(sel, racine) { return [].slice.call((racine || doc).querySelectorAll(sel)); }
function el(nom, attrs, parent) {
  var e = doc.createElement(nom);
  for (var k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
  if (parent) parent.appendChild(e);
  return e;
}
var NS = 'http://www.w3.org/2000/svg';
function svgEl(nom, attrs, parent) {
  var e = doc.createElementNS(NS, nom);
  for (var k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
  if (parent) parent.appendChild(e);
  return e;
}
function retirer(e) { if (e && e.parentNode) e.parentNode.removeChild(e); }
function lisse(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }
function borne(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function vif(t) { return 1 - Math.pow(1 - t, 3); }            // part vite, se pose
function lent(t) { return t * t * t; }                        // part lentement, file
function ressort(t, c) { c = c || 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
function elan(t) { var c = 1.4; return (c + 1) * t * t * t - c * t * t; }
function anime(duree, pas) {
  return new Promise(function (fin) {
    var t0 = null, d = calme ? Math.min(duree, 300) : duree;
    function image(t) {
      if (t0 === null) t0 = t;
      var x = Math.min(1, (t - t0) / d);
      pas(x);
      if (x < 1) requestAnimationFrame(image); else fin();
    }
    requestAnimationFrame(image);
  });
}
function attendre(ms) { return new Promise(function (ok) { setTimeout(ok, calme ? Math.min(ms, 150) : ms); }); }
function attendreVraiment(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
// Une suite de fonctions qui peuvent rendre une promesse : l'une après l'autre.
function enchainer(fonctions) {
  return fonctions.reduce(function (p, f) { return p.then(function () { return f(); }); }, Promise.resolve());
}
function coordScene(scene, ev) {
  var r = scene.getBoundingClientRect();
  return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height };
}
// Rectangle d'un élément, en unités de scène (1200 x 1800).
function zone(e, scene) {
  var r = scene.getBoundingClientRect(), b = e.getBoundingClientRect();
  if (!r.width) return null;
  var k = W / r.width;
  return [(b.left - r.left) * k, (b.top - r.top) * k, b.width * k, b.height * k];
}
function pourcent(v, total) { return (v / total * 100).toFixed(3) + '%'; }
function placerEn(e, x, y) { e.style.left = pourcent(x, W); e.style.top = pourcent(y, H); }
function toucheDeBouton(ev) {
  var t = ev.target;
  return !!(t && t.tagName && (t.tagName.toUpperCase() === 'BUTTON' || t.tagName.toUpperCase() === 'A' ||
    t.tagName.toUpperCase() === 'INPUT') && (ev.key === 'Enter' || ev.key === ' '));
}
// Ce qui touche l'interface (barre, fiches, menus) n'est pas un geste dans la scène.
function horsInterface(ev) {
  return !(ev.target && ev.target.closest && ev.target.closest('.barre, .panneau, .fiche, .nouvel-objet, .aide-geste, button, a, input'));
}
var TOUCHES = [' ', 'Enter', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
function toucheValide(ev) { return TOUCHES.indexOf(ev.key) >= 0 && !toucheDeBouton(ev) && !ev.altKey && !ev.ctrlKey && !ev.metaKey; }
// Jusqu'où le lecteur a lu (paragraphe et caractère, en un nombre) : les fiches d'objet
// n'affichent que des phrases déjà lues.
var Lecture = { max: 0 };
// Une fiche ou un panneau ouverts, ou un balayage en cours, retiennent les gestes et la lecture.
function bloque() { return Panneaux.ouvert() || Transitions.occupe(); }
function hasard(graine) { var x = graine; return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }
