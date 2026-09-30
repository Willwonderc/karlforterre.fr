// ---------------------------------------------------------------- le récit : révéler le texte temps par temps
/* Chaque page découpe son texte en temps (<span class="temps">, écrits par build.py). Le
   lecteur avance d'un temps en touchant le texte, l'étoile ✦, ou avec Entrée, Espace, →.
   Certains temps attendent d'abord un geste (portes[j] : une fonction qui rend une promesse) ;
   d'autres déclenchent des effets en paraissant (surTemps(j) : peut rendre une promesse, que
   le temps suivant attend). À l'écran : le temps en cours et, s'il est du même paragraphe, le
   précédent, atténué ; `garder` laisse tout à l'écran (poèmes, lettre).
   Un geste peut aussi venir après le dernier temps (portes[temps.length]) : il se joue avant
   la fin de la page. */

function Recit(scene, options) {
  var soi = this;
  this.scene = scene;
  this.temps = $$('.texte .temps', scene);
  this.i = -1;
  this.portes = options.portes || {};
  this.surTemps = options.surTemps || function () {};
  this.fin = options.fin || function () {};
  this.enAttente = false;
  this.fini = false;
  this.garder = !!options.garder;
  var suite = el('button', { 'class': 'suite ui', type: 'button', 'aria-label': ui('suite') }, scene);
  suite.textContent = '✦';
  this.bouton = suite;
  function avancer(ev) { if (ev) ev.stopPropagation(); if (!bloque()) soi.avancer(); }
  suite.addEventListener('click', avancer);
  var texte = $('.texte', scene);
  if (texte) texte.addEventListener('click', avancer);
  this.clavier = function (ev) {
    if (!scene.classList.contains('active')) return;
    if (['ArrowRight', ' ', 'Enter', 'PageDown'].indexOf(ev.key) < 0) return;
    if (soi.enAttente || soi.fini || bloque() || toucheDeBouton(ev) || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.cancelable) ev.preventDefault();
    soi.avancer();
  };
  doc.addEventListener('keydown', this.clavier);
  this.temps.forEach(function (t) { t.setAttribute('aria-hidden', 'true'); });
}
Recit.prototype.pret = function (oui) { this.bouton.classList.toggle('pret', !!oui); };
Recit.prototype.avancer = function () {
  if (this.enAttente || this.fini) return;
  var j = this.i + 1, soi = this;
  var geste = this.portes[j];
  if (geste) {
    this.enAttente = true; this.pret(false);
    delete this.portes[j];
    Promise.resolve(geste()).then(function () { soi.enAttente = false; soi.avancer(); },
      function (e) { soi.enAttente = false; signaler(e); soi.avancer(); });
    return;
  }
  if (j >= this.temps.length) { this.terminer(); return; }
  this.montrer(j);
};
Recit.prototype.terminer = function () {
  if (this.fini) return;
  this.fini = true; this.pret(false);
  doc.removeEventListener('keydown', this.clavier);
  this.fin();
};
Recit.prototype.montrer = function (j) {
  var t = this.temps[j];
  if (this.i >= 0) {
    var garder = this.garder;
    // à l'écran : le temps en cours et, s'il est du même paragraphe, le précédent (atténué)
    this.temps.slice(0, j).forEach(function (x, k) {
      if (!garder && (x.parentNode !== t.parentNode || k < j - 1)) x.classList.add('cache');
      else x.classList.add('passe');
    });
  }
  t.classList.add('vu');
  t.removeAttribute('aria-hidden');
  var lu = +t.getAttribute('data-lu') || 0;
  if (lu > Lecture.max) Lecture.max = lu;
  this.i = j;
  var soi = this;
  this.enAttente = true;   // le temps suivant attend la fin des effets de celui-ci (fonte, fiche…)
  Promise.resolve().then(function () { return soi.surTemps(j, t); }).then(null, signaler).then(function () {
    soi.enAttente = false;
    // un geste attendu juste après ce temps : il s'annonce sans attendre l'étoile
    if (soi.portes[j + 1]) { setTimeout(function () { soi.avancer(); }, calme ? 200 : 900); return; }
    setTimeout(function () { soi.pret(true); }, calme ? 100 : 700);
  });
  annoncer(t.textContent);
};
// Tout montrer d'un coup (le lecteur relit une page déjà jouée, ou le moteur a échoué).
Recit.prototype.toutMontrer = function () {
  this.temps.forEach(function (t) { t.classList.remove('cache', 'passe'); t.classList.add('vu'); t.removeAttribute('aria-hidden'); });
  this.i = this.temps.length - 1;
};

// Une erreur du moteur ne bloque jamais la lecture : elle est notée, et le récit continue.
function signaler(e) {
  try { if (window.console && console.error) console.error('Darshan :', e); } catch (x) { /* rien */ }
}
