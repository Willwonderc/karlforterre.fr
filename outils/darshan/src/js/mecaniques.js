// ---------------------------------------------------------------- mécaniques : les gestes du lecteur
/* Mecaniques[nom](scene, g) rend une promesse, tenue quand le geste est fait. g vient de la
   page (build.py) : la mécanique, ses réglages (livre.py), sa consigne et son action
   (interface.ini). Chaque geste a le même échafaudage (Geste) : un halo sur la cible tout de
   suite, la consigne après 2,5 s, le même geste en bouton dans la fiche de l'objet concerné,
   le bouton « Faire le geste » après 8 s, et au clavier Entrée ou Espace ; en mouvement
   réduit, la consigne vient tout de suite. Aucun geste ne demande un long mouvement
   horizontal (arbitrage 5) : les glissements sont verticaux, les tracés compacts.
   Une mécanique que le moteur ne connaît pas encore devient un simple toucher, avec sa
   consigne (build.py le signale). */

var Mecaniques = {};

function jouerGeste(scene, g) {
  // une scène écrite à la main peut jouer un geste à sa façon (scene.gestesLocaux, par clé)
  if (scene.gestesLocaux && scene.gestesLocaux[g.cle]) return Promise.resolve(scene.gestesLocaux[g.cle](g));
  var m = Mecaniques[g.meca];
  if (!m) { signaler('mécanique inconnue : ' + g.meca + ' (toucher à la place)'); m = Mecaniques.toucher; }
  return Promise.resolve(m(scene, g));
}

// Le calque des gestes : un SVG de 1200 x 1800 par-dessus le décor, sous le texte.
function calqueGeste(scene) {
  return svgEl('svg', { 'class': 'geste-calque ui', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
}
function halo(calque, x, y, r) {
  return svgEl('circle', { 'class': 'halo-interet actif', cx: x, cy: y, r: r, fill: 'none', stroke: '#ffe7a8',
    'stroke-width': 5, 'stroke-dasharray': '4 14', 'stroke-linecap': 'round' }, calque);
}
function dansCible(p, c) { return !c || Math.hypot(p.x - c[0], p.y - c[1]) <= (c[2] || 170) * 1.25; }

// Le bouton « Faire le geste », pour qui ne peut pas le faire : il paraît après 8 s (3 s en
// mouvement réduit). Rend { retirer }.
function boutonFaireLeGeste(scene, faire) {
  var bouton = null, minuterie = setTimeout(function () {
    bouton = el('button', { type: 'button', 'class': 'faire-geste ui' }, scene);
    bouton.textContent = ui('faire_le_geste');
    bouton.addEventListener('click', function (ev) { ev.stopPropagation(); faire(); });
    bouton.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
  }, calme ? 3000 : 8000);
  return { retirer: function () { clearTimeout(minuterie); retirer(bouton); } };
}

// L'échafaudage commun. reglage : { cible, sansHalo, clavier: false (la mécanique gère ses
// touches), yConsigne }. Rend { fait, terminer, calque, cible }.
function Geste(scene, g, reglage) {
  reglage = reglage || {};
  var cible = reglage.cible || g.cible || null, fini = false, fin = null;
  var calque = calqueGeste(scene), anneau = null;
  if (cible && !reglage.sansHalo) anneau = halo(calque, cible[0], cible[1], cible[2] || 170);
  var yc = reglage.yConsigne || g.y_consigne || (cible ? Math.min(1480, cible[1] + (cible[2] || 170) + 90) : 1180);
  var c = consigne(scene, g.consigne || '', yc, 2500);
  var objet = g.objet || null;
  if (g.action) {
    objet = objet || Objets.dernier('darshan') || Objets.dernier('julie');
    if (objet) Objets.proposer(objet, g.action, function () { terminer(); });
  }
  var bouton = boutonFaireLeGeste(scene, function () { terminer(); });
  function clavier(ev) {
    if (fini || bloque() || !scene.classList.contains('active')) return;
    if (!toucheValide(ev)) return;
    if (ev.cancelable) ev.preventDefault();
    terminer();
  }
  if (reglage.clavier !== false) doc.addEventListener('keydown', clavier);
  var fait = new Promise(function (ok) { fin = ok; });
  function terminer() {
    if (fini) return;
    fini = true;
    bouton.retirer();
    c.effacer();
    doc.removeEventListener('keydown', clavier);
    if (objet) Objets.retirerAction(objet);
    if (anneau) anneau.classList.remove('actif');
    setTimeout(function () { retirer(calque); }, 400);
    fin();
  }
  return { fait: fait, terminer: terminer, calque: calque, cible: cible, fini: function () { return fini; } };
}

// Toucher : la cible (cible = [x, y, rayon]) ou n'importe où dans la scène.
Mecaniques.toucher = function (scene, g) {
  var ge = Geste(scene, g);
  function haut(ev) {
    if (ge.fini() || bloque() || !horsInterface(ev)) return;
    if (!dansCible(coordScene(scene, ev), ge.cible)) return;
    scene.removeEventListener('pointerup', haut);
    ge.terminer();
  }
  scene.addEventListener('pointerup', haut);
  return ge.fait.then(function () { scene.removeEventListener('pointerup', haut); });
};

// Maintenir : le doigt posé `duree` ms (un anneau se remplit) ; lâcher trop tôt recommence.
Mecaniques.maintenir = function (scene, g) {
  var duree = g.duree || 1500, ge = Geste(scene, g), c = ge.cible || [600, 900, 170];
  var R = (c[2] || 170) * 0.8, L = 2 * Math.PI * R;
  var arc = svgEl('circle', { cx: c[0], cy: c[1], r: R, fill: 'none', stroke: OR, 'stroke-width': 10,
    'stroke-dasharray': L, 'stroke-dashoffset': L, transform: 'rotate(-90 ' + c[0] + ' ' + c[1] + ')', opacity: 0 }, ge.calque);
  var t0 = null, tenu = false;
  function bas(ev) {
    if (ge.fini() || bloque() || !horsInterface(ev)) return;
    if (ge.cible && !dansCible(coordScene(scene, ev), ge.cible)) return;
    tenu = true; t0 = null; arc.setAttribute('opacity', 1);
    if (g.battement) Son.effet('battement');
    requestAnimationFrame(function pas(t) {
      if (!tenu || ge.fini()) return;
      if (t0 === null) t0 = t;
      var x = Math.min(1, (t - t0) / duree);
      arc.setAttribute('stroke-dashoffset', L * (1 - x));
      if (x >= 1) { tenu = false; ge.terminer(); return; }
      requestAnimationFrame(pas);
    });
  }
  function haut() { if (!tenu) return; tenu = false; arc.setAttribute('opacity', 0); arc.setAttribute('stroke-dashoffset', L); }
  scene.addEventListener('pointerdown', bas);
  scene.addEventListener('pointerup', haut);
  scene.addEventListener('pointercancel', haut);
  return ge.fait.then(function () {
    scene.removeEventListener('pointerdown', bas); scene.removeEventListener('pointerup', haut); scene.removeEventListener('pointercancel', haut);
  });
};

// Glisser : un glissement vertical (sens « haut », par défaut, ou « bas ») d'au moins 160
// unités ; les flèches ↑ ↓ font le geste au clavier.
Mecaniques.glisser = function (scene, g) {
  var sens = g.sens === 'bas' ? 1 : -1, ge = Geste(scene, g, { sansHalo: true });
  var x = g.x || 600, y = g.y || 1000;
  var fleche = svgEl('path', { 'class': 'indice-glisser', d: sens < 0 ? 'M-40,20L0,-20L40,20' : 'M-40,-20L0,20L40,-20',
    fill: 'none', stroke: '#ffe7a8', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    transform: 'translate(' + x + ' ' + y + ')' }, ge.calque);
  var depart = null;
  function bas(ev) { if (ge.fini() || bloque() || !horsInterface(ev)) return; depart = coordScene(scene, ev); }
  function haut(ev) {
    if (!depart || ge.fini()) return;
    var p = coordScene(scene, ev), dy = (p.y - depart.y) * sens;
    depart = null;
    if (dy > 160) ge.terminer();
  }
  scene.addEventListener('pointerdown', bas);
  scene.addEventListener('pointerup', haut);
  if (!calme) {
    (function vivre(t) {
      if (ge.fini()) return;
      var d = Math.sin((t || 0) / 380) * 18 * sens;
      fleche.setAttribute('transform', 'translate(' + x + ' ' + (y + d) + ')');
      requestAnimationFrame(vivre);
    })(0);
  }
  return ge.fait.then(function () { scene.removeEventListener('pointerdown', bas); scene.removeEventListener('pointerup', haut); });
};

// Rythme : n touchers (5 par défaut), chacun un pas ; g.pas (fonction) est appelée à chaque
// toucher par les scènes écrites à la main.
Mecaniques.rythme = function (scene, g) {
  var n = g.n || 5, k = 0, ge = Geste(scene, g, { clavier: false });
  function pas(ev) {
    if (ge.fini() || bloque()) return;
    if (ev.type === 'keydown') { if (!toucheValide(ev) || !scene.classList.contains('active')) return; }
    else if (!horsInterface(ev)) return;
    if (ev.cancelable) ev.preventDefault();
    k++;
    Son.effet('saut');
    if (typeof g.pas === 'function') g.pas(k, n);
    if (k >= n) ge.terminer();
  }
  scene.addEventListener('pointerup', pas); doc.addEventListener('keydown', pas);
  return ge.fait.then(function () { scene.removeEventListener('pointerup', pas); doc.removeEventListener('keydown', pas); });
};

// Tourner : un quart de tour du doigt autour de la clé (arbitrage 3), sur un cercle d'au moins
// 250 unités de rayon ; la même consigne et le même son partout (1.3, 6.13, 7.8).
Mecaniques.tourner = function (scene, g) {
  var c = g.cible || [932, 1010, 260], R = Math.max(250, c[2] || 260), ge = Geste(scene, g, { cible: [c[0], c[1], R] });
  var dernier = null, cumul = 0;
  function angle(p) { return Math.atan2(p.y - c[1], p.x - c[0]); }
  function bas(ev) {
    if (ge.fini() || bloque() || !horsInterface(ev)) return;
    var p = coordScene(scene, ev);
    if (Math.hypot(p.x - c[0], p.y - c[1]) > R * 1.4) return;
    dernier = angle(p); cumul = 0;
  }
  function mouv(ev) {
    if (dernier === null || ge.fini()) return;
    var a = angle(coordScene(scene, ev)), d = a - dernier;
    if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
    cumul += d; dernier = a;
    if (Math.abs(cumul) >= Math.PI * 0.45) { dernier = null; Son.effet('tour'); ge.terminer(); }
  }
  function haut(ev) {
    if (dernier === null) return;
    // un simple toucher sur la clé compte aussi (toucher simple, arbitrage 3)
    if (Math.abs(cumul) < 0.05 && dansCible(coordScene(scene, ev), [c[0], c[1], R * 0.6])) { Son.effet('tour'); ge.terminer(); }
    dernier = null;
  }
  scene.addEventListener('pointerdown', bas); scene.addEventListener('pointermove', mouv); scene.addEventListener('pointerup', haut);
  return ge.fait.then(function () {
    scene.removeEventListener('pointerdown', bas); scene.removeEventListener('pointermove', mouv); scene.removeEventListener('pointerup', haut);
  });
};

// Tracer : passer du doigt par les points du chemin, dans l'ordre (tracé compact) ; un
// toucher sur le premier point suffit en toucher simple, après la consigne.
Mecaniques.tracer = function (scene, g) {
  var chemin = g.chemin || [[500, 1000], [700, 1000]], k = 0, ge = Geste(scene, g, { cible: chemin[0].concat([120]) });
  var trait = svgEl('polyline', { points: chemin.map(function (p) { return p.join(','); }).join(' '), fill: 'none',
    stroke: '#ffe7a8', 'stroke-width': 6, 'stroke-dasharray': '2 16', 'stroke-linecap': 'round', opacity: 0.7 }, ge.calque);
  var dedans = false;
  function bas(ev) { if (ge.fini() || bloque() || !horsInterface(ev)) return; dedans = true; k = 0; suivre(ev); }
  function suivre(ev) {
    if (!dedans || ge.fini()) return;
    var p = coordScene(scene, ev);
    while (k < chemin.length && Math.hypot(p.x - chemin[k][0], p.y - chemin[k][1]) < 110) k++;
    if (k >= chemin.length) { dedans = false; trait.setAttribute('opacity', 1); ge.terminer(); }
  }
  function haut() { dedans = false; }
  scene.addEventListener('pointerdown', bas); scene.addEventListener('pointermove', suivre); scene.addEventListener('pointerup', haut);
  return ge.fait.then(function () {
    scene.removeEventListener('pointerdown', bas); scene.removeEventListener('pointermove', suivre); scene.removeEventListener('pointerup', haut);
  });
};

// Porter : prendre l'objet (de = [x, y]) et le poser sur la cible ; toucher la cible suffit.
Mecaniques.porter = function (scene, g) {
  return Mecaniques.toucher(scene, g);
};

// Attendre : le temps passe seul (duree ms) ; « Continuer » ou une touche le presse.
Mecaniques.attendre = function (scene, g) {
  var duree = g.duree || 3000, ge = Geste(scene, g, { sansHalo: true });
  var minuterie = setTimeout(function () { ge.terminer(); }, calme ? Math.min(duree, 1500) : duree);
  return ge.fait.then(function () { clearTimeout(minuterie); });
};
