// ---------------------------------------------------------------- mécaniques : les gestes du lecteur
/* Mecaniques[nom](scene, g) rend une promesse, tenue quand le geste est fait. g vient de la page
   (build.py) : la mécanique (meca), ses réglages (livre.py, d'après la synthèse, partie 3.1), sa
   consigne et son action (interface.ini), sa clé (« tableau.numéro ») et `avant` (le temps qu'il
   précède). Les 27 mécaniques de la synthèse sont ici, chacune d'après sa ligne du cahier des charges
   et les pages de ses traitements (docs/darshan-mise-en-scene/).

   L'échafaudage commun, Geste(scene, g, reglage), donne à chaque geste les mêmes paliers d'aide
   (synthèse, partie 3.1, « Pour tous les gestes ») : un halo sur la cible dès l'ouverture ; la
   consigne après 2,5 s (tout de suite en mouvement réduit) ; le même geste en bouton dans la fiche de
   l'objet en jeu (rubrique [actions]) ; « Faire le geste » après 8 s (3 s en mouvement réduit), dont le
   nom accessible porte la consigne ; le clavier (Entrée, Espace, flèches). Jamais d'échec, de score
   ni de blocage : lâcher trop tôt ramène le halo, un toucher simple fait le geste entier (sauf mention
   contraire). Les aides prennent la couleur du monde de la page : or chez Darshan, blanc et graphite
   chez Julie (classe « monde-julie » de la section) ; après 7.14 (sans magie), plus d'aide. Aucun long
   glissement horizontal (arbitrage 5) : les glissements sont verticaux, les tracés compacts. Pendant
   un geste, la scène porte la classe « geste-attendu » (le glissement de l'historique, quand il
   existera, s'y taira).

   Les effets du geste (g.effets) sont joués quand il est fait ; ceux qui portent `suit_geste`
   avancent avec lui : ils sont joués dès le début du geste, avec e.geste, un suivi :
   e.geste.suivre(f) appelle f(x, fini, etat) à chaque progrès (x de 0 à 1), puis f(1, true) quand le
   geste est fait (etat : ce que la mécanique en dit, par exemple { phase: 'inspire' }). Le temps
   suivant attend la fin de ces effets.

   Les scènes écrites à la main jouent un geste à leur façon (scene.gestesLocaux[g.cle]) ou branchent
   leurs dessins sur une mécanique : g.pas(k, n, o) (rythme), g.tourne(degrés) (tourner : la clé de la
   scène), g.porte(x, y, etat) (porter : l'objet de la scène), g.souffle(k, phase) (respirer),
   g.progres(x) (toutes). Une clé déjà posée dans la serrure par un effet se déclare dans
   scene.cle = { tourner(degrés) } : `tourner` la tourne au lieu d'en dessiner une. Ce que les
   mécaniques laissent aux effets et aux scènes : scene.coeur (les cœurs, voir Gestes.coeur),
   scene.paupieres (les paupières), scene.galerie (l'écran du téléphone de Julie), scene.listesGeste
   (les listes de 6.2), scene.marchandises (les étals de 5.2) ; et les dessins communs de Gestes
   (rose des vents, main d'or, téléphone).

   Les sons portent les noms de la synthèse (partie 5.4) : ceux que son.js ne fabrique pas encore se
   taisent sans erreur. Une mécanique inconnue devient un toucher (build.py le signale). Toute erreur
   est rattrapée : le geste est alors tenu pour fait, et la lecture continue. Chaque animation,
   minuterie et écouteur s'arrête avec son geste, ou avec sa page (l'édition web garde les 85 pages
   dans un seul document). Tout se dessine en SVG ou en calques : aucune toile, le budget de trois
   toiles animées reste aux effets. */

var Mecaniques = {};

function jouerGeste(scene, g) {
  // une scène écrite à la main peut jouer un geste à sa façon (scene.gestesLocaux, par clé)
  if (scene.gestesLocaux && scene.gestesLocaux[g.cle]) return Promise.resolve(scene.gestesLocaux[g.cle](g));
  var m = Mecaniques[g.meca];
  if (!m) { signaler('mécanique inconnue : ' + g.meca + ' (toucher à la place)'); m = Mecaniques.toucher; }
  try { return Promise.resolve(m(scene, g)).then(null, signaler); } catch (e) { signaler(e); return Promise.resolve(); }
}

// Le calque des aides : un SVG de 1200 x 1800 par-dessus la scène (halos, guides, rides).
function calqueGeste(scene) {
  return svgEl('svg', { 'class': 'geste-calque ui', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
}
// Le point p tombe-t-il dans la cible [x, y, rayon] (avec une marge généreuse) ?
function dansCible(p, c) { return !c || Math.hypot(p.x - c[0], p.y - c[1]) <= (c[2] || 170) * 1.25; }

// Le bouton « Faire le geste », pour qui ne peut pas le faire : il paraît après 8 s (3 s en
// mouvement réduit). o : { texte (un autre texte d'interface : « Continuer »), nom (la consigne, pour
// le nom accessible), delai }. Rend { retirer }.
function boutonFaireLeGeste(scene, faire, o) {
  o = o || {};
  var bouton = null, minuterie = setTimeout(function () {
    bouton = el('button', { type: 'button', 'class': 'faire-geste ui' }, scene);
    bouton.textContent = o.texte || ui('faire_le_geste');
    if (o.nom) bouton.setAttribute('aria-label', bouton.textContent + ' : ' + o.nom);
    bouton.addEventListener('click', function (ev) { ev.stopPropagation(); faire(); });
    bouton.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
    bouton.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
  }, o.delai !== undefined ? o.delai : (calme ? 3000 : 8000));
  return { retirer: function () { clearTimeout(minuterie); retirer(bouton); } };
}

// ---------------------------------------------------------------- les outils communs des gestes
/* Rangés sous un seul nom (Gestes) : les fragments partagent une seule portée, et les effets, écrits
   en même temps, déclarent leurs propres outils. */
var Gestes = (function () {
  var XLINK = 'http://www.w3.org/1999/xlink', numero = 0;
  function suivant(prefixe) { numero += 1; return (prefixe || 'g') + '-' + numero; }
  function copie(a, b) {
    var r = {}, k;
    for (k in a) { if (a.hasOwnProperty(k)) r[k] = a[k]; }
    if (b) { for (k in b) { if (b.hasOwnProperty(k)) r[k] = b[k]; } }
    return r;
  }
  function entre(a, b, t) { return a + (b - a) * t; }
  function maintenant() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function julie(scene) { return scene.classList.contains('monde-julie'); }
  // la couleur des aides (repli des attributs SVG ; la feuille de style la donne par le monde de la page)
  function aide(scene) { return julie(scene) ? '#ffffff' : '#ffe7a8'; }
  function f1(v) { return (+v).toFixed(1); }

  // Un calque sous le texte (le texte reste lisible par-dessus) : un SVG de 1200 x 1800, ou un bloc.
  function coucheSous(scene, classe, svg) {
    var e = svg ? doc.createElementNS(NS, 'svg') : doc.createElement('div');
    e.setAttribute('class', 'couche-geste ui ' + (classe || ''));
    e.setAttribute('aria-hidden', 'true');
    if (svg) { e.setAttribute('viewBox', '0 0 ' + W + ' ' + H); e.setAttribute('focusable', 'false'); }
    var t = $('.texte', scene);
    if (t && t.parentNode === scene) scene.insertBefore(e, t); else scene.appendChild(e);
    return e;
  }
  // Un calque par-dessus le texte et les décors (la classe donne sa hauteur).
  function coucheDessus(scene, classe) {
    return svgEl('svg', { 'class': 'couche-geste ui ' + (classe || ''), viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
  }
  // Le halo d'intérêt : un cercle en pointillés qui respire (o.hesite : lentement, « sa main doute »).
  function halo(parent, x, y, r, o) {
    o = o || {};
    return svgEl('circle', { 'class': 'halo-interet actif aide' + (o.hesite ? ' hesite' : ''), cx: x, cy: y, r: r, fill: 'none',
      stroke: o.couleur || '#ffe7a8', 'stroke-width': o.epaisseur || 5, 'stroke-dasharray': '4 14', 'stroke-linecap': 'round' }, parent);
  }
  // Une ride : un anneau qui s'élargit et s'efface (o : r0, r1, aplati, couleur, epaisseur, opacite, duree).
  function onde(parent, x, y, o) {
    o = o || {};
    var r0 = o.r0 || 18, r1 = o.r1 || 150, ap = o.aplati || 1, op = o.opacite === undefined ? 0.75 : o.opacite, ep = o.epaisseur || 4;
    var c = svgEl('ellipse', { cx: x, cy: y, rx: r0, ry: r0 * ap, fill: 'none', stroke: o.couleur || '#ffffff', 'stroke-width': ep,
      opacity: op, 'class': o.classe || '' }, parent);
    if (calme) {
      c.setAttribute('rx', (r0 + r1) / 2); c.setAttribute('ry', (r0 + r1) / 2 * ap);
      return anime(300, function (t) { c.setAttribute('opacity', op * Math.sin(Math.PI * t)); }).then(function () { retirer(c); });
    }
    return anime(o.duree || 1100, function (t) {
      var e = vif(t), r = entre(r0, r1, e);
      c.setAttribute('rx', f1(r)); c.setAttribute('ry', f1(r * ap));
      c.setAttribute('opacity', (op * Math.pow(1 - t, 1.3)).toFixed(3));
      c.setAttribute('stroke-width', f1(ep * (1 - 0.7 * t)));
    }).then(function () { retirer(c); });
  }
  // Une image dans un SVG (href, et xlink:href pour les liseuses plus anciennes).
  function image(parent, src, attrs) {
    var i = svgEl('image', attrs || {}, parent);
    if (src) { i.setAttribute('href', src); i.setAttributeNS(XLINK, 'xlink:href', src); }
    return i;
  }
  // Le chemin des images depuis la page (« img/ » sur le web, « ../img/ » dans l'EPUB), et celui d'un
  // décor connu du livre (DONNEES.images, écrit par build.py) ; null s'il n'est pas fabriqué.
  function baseImages(scene) {
    var imgs = $$('img', scene);
    for (var i = 0; i < imgs.length; i++) {
      var s = imgs[i].getAttribute('src') || imgs[i].getAttribute('data-src') || '', k = s.lastIndexOf('img/');
      if (k >= 0) return s.slice(0, k + 4);
    }
    return estEpub ? '../img/' : 'img/';
  }
  function chemin(scene, nom) {
    var f = (DONNEES.images || {})[nom];
    return f && f.length ? baseImages(scene) + f[0] : null;
  }
  // Les plans du décor de la page : le plan i, le plan visible, et le fichier d'un plan.
  function plan(scene, i) { return $$('.decor .plan', scene)[i] || null; }
  function planVisible(scene) { return $('.decor .plan.vu', scene) || $('.decor img', scene) || $('.decor', scene); }
  function source(e) { return e ? (e.getAttribute('src') || e.getAttribute('data-src')) : null; }

  // L'objet dont la fiche propose le geste en bouton (rubrique [actions]) : celui que la mécanique
  // manie, s'il est dans un sac ; « lunettes » trouve aussi les binocles (même objet, autre allure).
  var OBJET_DU_GESTE = { tourner: 'cle', porter: 'cle', contact: 'telephone', galerie: 'telephone', messages: 'telephone' };
  function objetDuGeste(scene, g) {
    var liste = [g.objet, OBJET_DU_GESTE[g.meca], julie(scene) ? 'telephone' : null, 'lunettes', 'cle'];
    for (var i = 0; i < liste.length; i++) {
      var id = liste[i];
      if (!id) continue;
      if (id === 'lunettes' && Objets.contient('binocles')) return 'binocles';
      if (Objets.contient(id)) return id;
    }
    return null;
  }

  // Le suivi d'un geste, pour les effets `suit_geste` (voir l'en-tête).
  function Suivi() {
    var abonnes = [], x = 0, fin = false, etat = {};
    function appeler(f) { try { f(x, fin, etat); } catch (e) { signaler(e); } }
    return {
      suivre: function (f) { if (typeof f === 'function') { abonnes.push(f); appeler(f); } },
      avancer: function (v, e) {
        if (fin) return;
        v = borne(v);
        if (e) etat = e;
        if (v === x && !e) return;
        x = v; abonnes.forEach(appeler);
      },
      finir: function () { if (fin) return; x = 1; fin = true; abonnes.forEach(appeler); },
      valeur: function () { return x; },
      nombre: function () { return abonnes.length; }
    };
  }

  // Après un geste fait au doigt, le clic qui suit ne doit pas faire avancer le texte une fois de plus.
  function avalerClic(scene) {
    function f(ev) { ev.stopPropagation(); if (ev.cancelable) ev.preventDefault(); }
    scene.addEventListener('click', f, true);
    setTimeout(function () { scene.removeEventListener('click', f, true); }, 450);
  }

  // Les doigts posés sur la scène, hors de l'interface : o.bas(p, ev, d), o.bouge(p, ev, d, avant),
  // o.haut(p, ev, d, toucher) ; toucher : un appui bref (moins de 300 ms) et presque immobile ;
  // o.zone(p) : ce doigt compte-t-il ? p : le point en unités de scène ; d : le doigt { id, depart,
  // dernier, t0, chemin (distance parcourue), vitesse (unités par seconde) }. Rend { liste, nombre }.
  function doigts(ge, scene, o) {
    var actifs = {};
    function bas(ev) {
      if (ge.fini() || ge.enJeu() || bloque() || !horsInterface(ev)) return;
      if (ev.button !== undefined && ev.button > 0) return;
      var p = coordScene(scene, ev);
      if (o.zone && !o.zone(p)) return;
      var t = maintenant(), d = { id: ev.pointerId, depart: p, dernier: p, t0: t, tp: t, chemin: 0, vitesse: 0 };
      actifs[ev.pointerId] = d;
      if (scene.setPointerCapture) { try { scene.setPointerCapture(ev.pointerId); } catch (e) { /* rien */ } }
      if (o.bas) o.bas(p, ev, d);
    }
    function bouge(ev) {
      var d = actifs[ev.pointerId];
      if (!d || ge.fini()) return;
      var p = coordScene(scene, ev), t = maintenant(), dt = Math.max(1, t - d.tp);
      var dist = Math.hypot(p.x - d.dernier.x, p.y - d.dernier.y), avant = d.dernier;
      d.vitesse = 0.6 * d.vitesse + 0.4 * dist / dt * 1000;
      d.chemin += dist; d.dernier = p; d.tp = t;
      if (o.bouge) o.bouge(p, ev, d, avant);
    }
    function haut(ev) {
      var d = actifs[ev.pointerId];
      if (!d) return;
      delete actifs[ev.pointerId];
      if (ge.fini()) return;
      var p = coordScene(scene, ev);
      var toucher = ev.type !== 'pointercancel' && maintenant() - d.t0 < 300 && d.chemin < 30;
      if (o.haut) o.haut(p, ev, d, toucher);
    }
    ge.ecouter(scene, 'pointerdown', bas);
    ge.ecouter(scene, 'pointermove', bouge);
    ge.ecouter(scene, 'pointerup', haut);
    ge.ecouter(scene, 'pointercancel', haut);
    return {
      liste: function () { return Object.keys(actifs).map(function (k) { return actifs[k]; }); },
      nombre: function () { return Object.keys(actifs).length; }
    };
  }

  // Tenir : un doigt posé (n'importe où hors de l'interface, ou dans o.zone) ou Espace enfoncée ;
  // Entrée ou → jouent le geste entier. o.debut(p), o.bouge(p, d), o.fin(toucher, p) ; toucher : un
  // appui bref, qui vaut « jouer le geste entier » pour la mécanique. Rend { tenu(), doigts }.
  function tenue(ge, scene, o) {
    var espace = false, tEspace = 0;
    var d = doigts(ge, scene, {
      zone: o.zone,
      bas: function (p) { if (d.nombre() === 1 && !espace && o.debut) o.debut(p); },
      bouge: function (p, ev, dd) { if (o.bouge) o.bouge(p, dd); },
      haut: function (p, ev, dd, toucher) { if (!d.nombre() && !espace && o.fin) o.fin(toucher, p); }
    });
    ge.ecouter(doc, 'keydown', function (ev) {
      if (ge.fini() || ge.enJeu() || bloque() || !scene.classList.contains('active')) return;
      if (toucheDeBouton(ev) || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (ev.key === ' ') {
        if (ev.cancelable) ev.preventDefault();
        if (ev.repeat || espace) return;
        espace = true; tEspace = maintenant();
        if (!d.nombre() && o.debut) o.debut(null);
      } else if (ev.key === 'Enter' || ev.key === 'ArrowRight') {
        if (ev.cancelable) ev.preventDefault();
        ge.jouer();
      }
    });
    ge.ecouter(doc, 'keyup', function (ev) {
      if (ev.key !== ' ' || !espace) return;
      espace = false;
      if (ge.fini() || ge.enJeu()) return;
      if (!d.nombre() && o.fin) o.fin(maintenant() - tEspace < 300, null);
    });
    return { tenu: function () { return espace || d.nombre() > 0; }, doigts: d };
  }

  // Une courbe lisse (Catmull-Rom) par les points : chemin SVG ; et ses échantillons [x, y, longueur].
  function segments(p, ferme) {
    var n = p.length, s = [];
    for (var i = 0; i < (ferme ? n : n - 1); i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      if (!ferme) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      s.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    return s;
  }
  function courbe(p, ferme) {
    if (p.length < 2) return '';
    var d = 'M' + f1(p[0][0]) + ',' + f1(p[0][1]);
    segments(p, ferme).forEach(function (s) {
      d += 'C' + f1(s[1][0]) + ',' + f1(s[1][1]) + ' ' + f1(s[2][0]) + ',' + f1(s[2][1]) + ' ' + f1(s[3][0]) + ',' + f1(s[3][1]);
    });
    return d + (ferme ? 'Z' : '');
  }
  function echantillons(p, pas) {
    var r = [[p[0][0], p[0][1], 0]], L = 0;
    segments(p, false).forEach(function (s) {
      for (var k = 1; k <= (pas || 14); k++) {
        var t = k / (pas || 14), u = 1 - t;
        var x = u * u * u * s[0][0] + 3 * u * u * t * s[1][0] + 3 * u * t * t * s[2][0] + t * t * t * s[3][0];
        var y = u * u * u * s[0][1] + 3 * u * u * t * s[1][1] + 3 * u * t * t * s[2][1] + t * t * t * s[3][1];
        var q = r[r.length - 1];
        L += Math.hypot(x - q[0], y - q[1]);
        r.push([x, y, L]);
      }
    });
    return r;
  }

  // Un dessin d'objet (dessins.js) posé dans un SVG : centré en (x, y), large de `largeur`.
  function figurine(parent, id, x, y, largeur) {
    var d = dessin(id);
    if (!d) return null;
    var vb = (d.getAttribute('viewBox') || '0 0 100 100').split(/[\s,]+/).map(Number);
    var h = largeur * vb[3] / vb[2];
    var g = svgEl('g', { 'class': 'figurine' }, parent);
    d.setAttribute('x', f1(x - largeur / 2)); d.setAttribute('y', f1(y - h / 2));
    d.setAttribute('width', f1(largeur)); d.setAttribute('height', f1(h));
    d.setAttribute('overflow', 'visible');
    g.appendChild(d);
    return g;
  }

  // Le point, en unités de scène, d'un élément du document (son centre, ou un point de son bord).
  function centreDe(e, scene, fx, fy) {
    var z = e && zone(e, scene);
    return z ? [z[0] + z[2] * (fx === undefined ? 0.5 : fx), z[1] + z[3] * (fy === undefined ? 0.5 : fy)] : null;
  }

  // Une étincelle d'or qui file d'un point vers un autre et s'éteint en route (à `jusqua`, de 0 à 1).
  function etincelle(parent, de, vers, o) {
    o = o || {};
    var g = svgEl('g', { 'class': 'etincelle-geste' }, parent), jusqua = o.jusqua || 0.5;
    svgEl('circle', { r: 16, fill: OR, opacity: 0.35 }, g);
    svgEl('path', { d: etoile(12), fill: CREME }, g);
    if (calme) { g.setAttribute('transform', 'translate(' + f1(de[0]) + ' ' + f1(de[1]) + ')'); return anime(300, function (t) { g.setAttribute('opacity', 1 - t); }).then(function () { retirer(g); }); }
    var c = [(de[0] + vers[0]) / 2 + 80, Math.min(de[1], vers[1]) - 120];
    return anime(o.duree || 900, function (t) {
      var s = t * jusqua, u = 1 - s;
      var x = u * u * de[0] + 2 * u * s * c[0] + s * s * vers[0], y = u * u * de[1] + 2 * u * s * c[1] + s * s * vers[1];
      g.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(y) + ') scale(' + (1 - 0.6 * t).toFixed(3) + ')');
      g.setAttribute('opacity', t < 0.6 ? 1 : ((1 - t) / 0.4).toFixed(3));
    }).then(function () { retirer(g); });
  }

  // ---------------------------------------------------------------- les cœurs
  /* Un seul cœur par page (scene.coeur) : la couche « battements » de son.js et ses anneaux, qui
     battent ensemble. Deux cœurs au plus : Darshan (anneau vermillon) et Julie (anneau crème, plus
     clair) ; `unisson` : un seul anneau, des deux couleurs mêlées (7.10). Le rythme est calculé comme
     dans son.js (premier battement 80 ms après l'appel, celui de Julie 270 ms après ; `cale` : celui
     de Julie rejoint celui de Darshan ; `arythmie` : intervalles de 0,75 à 1,3), pour que l'œil et
     l'oreille battent ensemble ; chaque battement est double, comme le son (le second coup 0,29 s
     après, plus faible). regler(o) : { tempo, qui, julie, duree, cale, arythmie, force } (ceux de
     son.js) et { x, y (d'où partent les anneaux), pulse (le décor bat : échelle 1,006), unisson } ;
     arreter(o) : { duree } ; placer(x, y). Les effets qui changent le cœur d'une page (valse, balance,
     coeur) passent par scene.coeur s'il bat : l'œil et l'oreille restent d'accord. Mouvement réduit :
     les anneaux s'allument sans grandir, le décor ne bat pas. */
  var SON_DU_COEUR = ['tempo', 'qui', 'julie', 'duree', 'cale', 'arythmie', 'force'];
  function coeur(scene) {
    if (scene.coeur) return scene.coeur;
    var calque = coucheSous(scene, 'coeur-anneaux', true);
    var battants = [null, null], anneaux = [], origine = [600, 900];
    var pulse = false, unisson = false, enMarche = false, echelle = 0, decor = $('.decor', scene), repos = true;
    function t() { return maintenant() / 1000; }
    function tempoA(c, u) { if (!c.d || u >= c.t0 + c.d) return c.a; if (u <= c.t0) return c.de; return c.de + (c.a - c.de) * (u - c.t0) / c.d; }
    function maj(i, tempo, timbre, d, u) {
      if (tempo === false || tempo === 0 || tempo === null) { battants[i] = null; return; }
      var c = battants[i];
      if (tempo === undefined) { if (c) c.timbre = timbre; return; }
      tempo = Math.max(30, Math.min(200, +tempo || 72));
      if (!c) { battants[i] = { de: tempo, a: tempo, t0: u, d: 0, prochain: u + 0.08 + (i ? 0.27 : 0), timbre: timbre, arythmie: false, caler: 0 }; return; }
      c.de = tempoA(c, u); c.a = tempo; c.t0 = u; c.d = d; c.timbre = timbre;
    }
    function anneau(timbre, u, fort) {
      var julieSeule = timbre === 'julie', g = svgEl('g', { opacity: 0 }, calque), traits = [];
      if (unisson) {
        traits.push(svgEl('circle', { cx: origine[0], cy: origine[1], r: 60, fill: 'none', stroke: SINDOOR, 'stroke-width': 10 }, g));
        traits.push(svgEl('circle', { cx: origine[0], cy: origine[1], r: 48, fill: 'none', stroke: CREME, 'stroke-width': 6 }, g));
      } else {
        traits.push(svgEl('circle', { cx: origine[0], cy: origine[1], r: 60, fill: 'none', stroke: julieSeule ? CREME : SINDOOR,
          'stroke-width': julieSeule ? 7 : 10 }, g));
      }
      anneaux.push({ g: g, traits: traits, t0: u, fort: fort, r1: julieSeule ? 190 : 235, julie: julieSeule });
    }
    function battre(c, u) {
      anneau(c.timbre, u, 1);
      anneau(c.timbre, u + (c.timbre === 'julie' ? 0.25 : 0.29), 0.45);   // le second coup, comme le son
      if (pulse && !calme) echelle = 1;
    }
    function animer(u) {
      for (var i = anneaux.length - 1; i >= 0; i--) {
        var a = anneaux[i], age = u - a.t0, x = age / 0.9;
        if (age < 0) continue;
        if (x >= 1) { retirer(a.g); anneaux.splice(i, 1); continue; }
        var op = a.fort * (a.julie ? 0.8 : 0.9);
        if (calme) {
          a.g.setAttribute('opacity', (op * Math.sin(Math.PI * x)).toFixed(3));
          continue;
        }
        var e = vif(x);
        a.g.setAttribute('opacity', (op * Math.pow(1 - x, 1.5)).toFixed(3));
        a.traits.forEach(function (c, k) {
          c.setAttribute('r', f1((k ? 48 : 60) + (a.r1 * a.fort - 60) * e));
          c.setAttribute('stroke-width', f1((k ? 6 : (a.julie ? 7 : 10)) * (1 - 0.75 * x)));
        });
      }
      if (decor) {
        if (echelle > 0.004) { decor.style.scale = (1 + 0.006 * echelle).toFixed(5); echelle *= 0.84; repos = false; }
        else if (!repos) { decor.style.scale = ''; repos = true; echelle = 0; }
      }
    }
    function arreterTout() {
      anneaux.forEach(function (a) { retirer(a.g); });
      anneaux = [];
      if (decor) decor.style.scale = '';
      repos = true; echelle = 0;
    }
    function demarrer() {
      if (enMarche) return;
      enMarche = true;
      requestAnimationFrame(function image() {
        if (!scene.classList.contains('active')) { enMarche = false; arreterTout(); return; }
        var u = t(), vivant = anneaux.length > 0 || !repos;
        battants.forEach(function (c, i) {
          if (!c) return;
          vivant = true;
          if (i === 1 && c.caler && u >= c.caler && battants[0]) { c.prochain = battants[0].prochain; c.caler = 0; }
          for (var garde = 0; c.prochain <= u && garde < 4; garde++) {
            if (u - c.prochain < 0.25) battre(c, c.prochain);
            var iv = 60 / tempoA(c, c.prochain);
            c.prochain += c.arythmie ? iv * (0.75 + Math.random() * 0.55) : iv;
          }
        });
        animer(u);
        if (!vivant) { enMarche = false; return; }
        requestAnimationFrame(image);
      });
    }
    var soi = {
      regler: function (o, sansSon) {
        o = o || {};
        var u = t(), d = Math.max(0, +o.duree || 0) / 1000;
        if (o.x !== undefined && o.y !== undefined) origine = [o.x, o.y];
        if (o.pulse !== undefined) pulse = !!o.pulse;
        if (o.unisson !== undefined) unisson = !!o.unisson;
        var timbre = o.qui === 'julie' ? 'julie' : o.qui ? 'darshan' : (battants[0] ? battants[0].timbre : 'darshan');
        maj(0, o.tempo !== undefined ? o.tempo : (battants[0] ? undefined : 72), timbre, d, u);
        if (o.julie !== undefined) maj(1, o.julie, 'julie', d, u);
        battants.forEach(function (c) { if (c && o.arythmie !== undefined) c.arythmie = !!o.arythmie && c.timbre === 'julie'; });
        if (o.cale && battants[0] && battants[1]) battants[1].caler = u + d;
        if (!sansSon) {
          var s = {};
          SON_DU_COEUR.forEach(function (k) { if (o[k] !== undefined) s[k] = o[k]; });
          Son.couche('battements', true, s);
        }
        demarrer();
        return soi;
      },
      arreter: function (o) {
        battants = [null, null];
        Son.couche('battements', false, o || {});
        return soi;
      },
      placer: function (x, y) { origine = [x, y]; },
      bat: function () { return !!(battants[0] || battants[1]); },
      tempo: function (i) { var c = battants[i || 0]; return c ? tempoA(c, t()) : 0; }
    };
    scene.coeur = soi;
    return soi;
  }

  // ---------------------------------------------------------------- les paupières
  /* Deux paupières au bord flou descendent du haut et montent du bas (7.1, 7.10) ; derrière elles, le
     monde se trouble. poser(x) : de 0 (ouvertes) à 1 (fermées) ; teinte(couleurs, duree) : la couleur
     du voile, un nom (« nuit » : noir bleuté ; « couchant » : l'orangé chaud du soleil vu les yeux
     fermés) ou { fond: [r, g, b], bord: [r, g, b] } (l'effet `morsure` de 7.1 la fait passer au rouge
     sombre, puis à l'orangé) ; ouvrir(duree). scene.paupieres. Sous le texte : on lit les yeux fermés.
     Mouvement réduit : elles se ferment en fondu. */
  var TEINTES = {
    nuit: { fond: [6, 7, 16], bord: [18, 22, 44] },
    couchant: { fond: [92, 30, 12], bord: [196, 98, 42] },
    rouge: { fond: [70, 10, 8], bord: [128, 28, 20] },
    orange: { fond: [150, 64, 18], bord: [230, 140, 60] }
  };
  function paupieres(scene, o) {
    if (scene.paupieres) return scene.paupieres;
    o = o || {};
    var boite = coucheSous(scene, 'paupieres');
    var trouble = el('div', { 'class': 'paupieres-trouble' }, boite);
    var haut = el('div', { 'class': 'paupiere haut' }, boite), bas = el('div', { 'class': 'paupiere bas' }, boite);
    var x = 0, teinte = copie(TEINTES[o.teinte] || TEINTES.nuit);
    function rgba(c, a) { return 'rgba(' + c.map(Math.round).join(',') + ',' + a + ')'; }
    function peindre() {
      haut.style.background = 'linear-gradient(to bottom, ' + rgba(teinte.fond, 1) + ' 0%, ' + rgba(teinte.fond, 1) + ' 58%, ' +
        rgba(teinte.bord, 0.92) + ' 80%, ' + rgba(teinte.bord, 0) + ' 100%)';
      bas.style.background = 'linear-gradient(to top, ' + rgba(teinte.fond, 1) + ' 0%, ' + rgba(teinte.fond, 1) + ' 58%, ' +
        rgba(teinte.bord, 0.92) + ' 80%, ' + rgba(teinte.bord, 0) + ' 100%)';
    }
    function poser(v) {
      x = borne(v);
      boite.style.visibility = x > 0.001 ? 'visible' : 'hidden';
      if (calme) {
        boite.style.opacity = x.toFixed(3);
        haut.style.transform = 'translateY(0)'; bas.style.transform = 'translateY(0)';
        return;
      }
      var e = lisse(x);
      boite.style.opacity = '1';
      haut.style.transform = 'translateY(' + (-100 + 100 * e).toFixed(2) + '%)';
      bas.style.transform = 'translateY(' + (100 - 100 * e).toFixed(2) + '%)';
      trouble.style.opacity = e.toFixed(3);
    }
    peindre();
    poser(o.ferme ? 1 : 0);
    var soi = {
      element: boite,
      poser: poser,
      ferme: function () { return x; },
      teinte: function (c, duree) {
        var cible = typeof c === 'string' ? TEINTES[c] : c;
        if (!cible) return Promise.resolve();
        var de = copie(teinte);
        return anime(duree || 1500, function (t) {
          var e = lisse(t);
          teinte = { fond: de.fond.map(function (v, i) { return entre(v, cible.fond[i], e); }), bord: de.bord.map(function (v, i) { return entre(v, cible.bord[i], e); }) };
          peindre();
        });
      },
      ouvrir: function (duree) {
        var x0 = x;
        return anime(duree || 1200, function (t) { poser(x0 * (1 - lisse(t))); });
      }
    };
    scene.paupieres = soi;
    return soi;
  }

  // ---------------------------------------------------------------- la main d'or
  /* La main droite de Darshan, tracée d'un trait d'or (3.11, 7.13) : vue de dos, les doigts vers le
     haut, le pouce à gauche ; le poignet en (0, 0), le bout du majeur en (0, -370), la paume vers
     (0, -130). Rend { g, poser(x, y, eclat), main }. */
  var MAIN = [[-58, 300], [-60, 150], [-64, 30], [-82, -40], [-118, -96], [-148, -150], [-164, -178], [-150, -198], [-126, -178],
    [-100, -140], [-84, -118], [-86, -182], [-88, -250], [-86, -312], [-74, -336], [-56, -338], [-46, -316], [-45, -250],
    [-42, -198], [-38, -198], [-36, -272], [-32, -342], [-22, -367], [-2, -370], [10, -348], [10, -270], [10, -200],
    [16, -198], [20, -266], [26, -330], [38, -350], [56, -348], [64, -326], [61, -260], [57, -196], [64, -190], [74, -240],
    [86, -288], [98, -300], [111, -292], [113, -270], [104, -224], [96, -160], [90, -90], [78, -22], [66, 30], [62, 150], [60, 300]];
  function main(parent, o) {
    o = o || {};
    var g = svgEl('g', { 'class': 'main-or' }, parent), idf = suivant('lueur');
    var f = svgEl('filter', { id: idf, x: '-40%', y: '-40%', width: '180%', height: '180%' }, svgEl('defs', {}, g));
    svgEl('feGaussianBlur', { stdDeviation: 10, result: 'b' }, f);
    var fm = svgEl('feMerge', {}, f);
    svgEl('feMergeNode', { 'in': 'b' }, fm); svgEl('feMergeNode', { 'in': 'SourceGraphic' }, fm);
    var d = courbe(MAIN, false);
    var corps = svgEl('g', {}, g);
    var voile = svgEl('path', { d: d + 'Z', fill: OR, opacity: 0.1 }, corps);
    var trait = svgEl('path', { d: d, fill: 'none', stroke: OR, 'stroke-width': 7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', filter: 'url(#' + idf + ')' }, corps);
    svgEl('path', { d: 'M-84,-118 Q-70,-96 -58,-60', fill: 'none', stroke: OR, 'stroke-width': 4, opacity: 0.7, 'stroke-linecap': 'round' }, corps);
    function poser(x, y, eclat) {
      g.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(y) + ') scale(' + (o.echelle || 1) + ')');
      if (eclat !== undefined) {
        trait.setAttribute('stroke', eclat > 0.6 ? '#ffe7b0' : OR);
        voile.setAttribute('opacity', (0.08 + 0.22 * eclat).toFixed(3));
        corps.setAttribute('opacity', (0.75 + 0.25 * eclat).toFixed(3));
      }
    }
    return { g: g, poser: poser };
  }

  // ---------------------------------------------------------------- la rose des vents d'or
  /* La rose de `semer` (3.14), que l'effet `boussole` reprend (5.3 : « le dessin de la rose des vents
     d'or de semer ») : un cercle, huit branches (les quatre grandes aux points cardinaux), un cœur ;
     sans aiguille par défaut. Rend le groupe SVG. */
  function rose(parent, cx, cy, r, o) {
    o = o || {};
    var g = svgEl('g', { 'class': 'rose-vents', transform: 'translate(' + cx + ' ' + cy + ')' }, parent);
    svgEl('circle', { r: f1(r * 0.8), fill: 'none', stroke: OR, 'stroke-width': 4, opacity: 0.85 }, g);
    svgEl('circle', { r: f1(r * 0.86), fill: 'none', stroke: OR, 'stroke-width': 2, opacity: 0.55, 'stroke-dasharray': '2 11', 'stroke-linecap': 'round' }, g);
    svgEl('circle', { r: f1(r * 0.3), fill: 'none', stroke: OR, 'stroke-width': 2, opacity: 0.7 }, g);
    for (var i = 0; i < 8; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 4, grand = i % 2 === 0, L = grand ? r : r * 0.56, l = grand ? r * 0.11 : r * 0.075;
      var ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      var bout = [ux * L, uy * L], g1 = [vx * l, vy * l], g2 = [-vx * l, -vy * l];
      svgEl('path', { d: 'M0,0L' + f1(g1[0]) + ',' + f1(g1[1]) + 'L' + f1(bout[0]) + ',' + f1(bout[1]) + 'Z', fill: OR, opacity: grand ? 1 : 0.85 }, g);
      svgEl('path', { d: 'M0,0L' + f1(g2[0]) + ',' + f1(g2[1]) + 'L' + f1(bout[0]) + ',' + f1(bout[1]) + 'Z', fill: '#a8742f', opacity: grand ? 0.95 : 0.8 }, g);
    }
    svgEl('circle', { r: f1(r * 0.06), fill: CREME }, g);
    return g;
  }

  // ---------------------------------------------------------------- le téléphone de Julie
  /* Le téléphone qui monte du bas (4.3, 4.7) : un boîtier graphite, un écran clair ; rien n'y est
     écrit que les mots du livre (un nom). Rend { g, ecran (le groupe de l'écran), monter(), descendre(),
     sortirHaut(), revenir() }. Mouvement réduit : des fondus. */
  var TEL = { x: 330, y: 700, l: 540, h: 1100 };
  function telephone(scene) {
    var calque = coucheSous(scene, 'telephone-calque', true);
    var g = svgEl('g', { 'class': 'telephone', opacity: 0 }, calque);
    svgEl('rect', { x: TEL.x + 10, y: TEL.y + 18, width: TEL.l, height: TEL.h, rx: 74, fill: '#000', opacity: 0.35 }, g);
    svgEl('rect', { x: TEL.x, y: TEL.y, width: TEL.l, height: TEL.h, rx: 74, fill: '#1b1c20', stroke: '#45474e', 'stroke-width': 4 }, g);
    svgEl('rect', { x: TEL.x + 20, y: TEL.y + 20, width: TEL.l - 40, height: TEL.h - 40, rx: 56, fill: '#f4f4f6' }, g);
    svgEl('rect', { x: TEL.x + TEL.l / 2 - 60, y: TEL.y + 34, width: 120, height: 26, rx: 13, fill: '#1b1c20' }, g);
    var ecran = svgEl('g', {}, g);
    var dy = 0, op = 0;
    function poser() {
      g.setAttribute('transform', 'translate(0 ' + f1(dy) + ')');
      g.setAttribute('opacity', op.toFixed(3));
    }
    function aller(vers, duree, opa) {
      var d0 = dy, o0 = op;
      if (calme) { return anime(250, function (t) { op = entre(o0, opa, t); poser(); }).then(function () { dy = vers; poser(); }); }
      return anime(duree, function (t) { var e = lisse(t); dy = entre(d0, vers, e); op = entre(o0, opa, Math.min(1, t * 3)); poser(); });
    }
    dy = 1150; poser();
    return {
      g: g, ecran: ecran, calque: calque,
      monter: function () { return aller(0, 520, 1); },
      descendre: function () { return aller(1200, 520, 0); },
      sortirHaut: function () { if (calme) return aller(0, 250, 0); return aller(-1900, 600, 1); },
      revenir: function () { if (calme) { dy = 0; return aller(0, 250, 1); } dy = -1900; return aller(0, 600, 1); }
    };
  }

  // ---------------------------------------------------------------- l'écran de la galerie de Julie
  /* 5.6 et 5.7 : l'écran du téléphone de Julie en pleine page : fond noir, et en haut, là où le
     téléphone affiche l'heure, le compte de la page (compte-page, que l'interface y pose) ; une grille
     de vignettes carrées, trois par rangée, sans aucun texte : les clichés du livre. La vignette de
     decors.py (« nom-vignette ») si elle existe, sinon le décor lui-même, recadré et flou (image
     d'attente). scene.galerie : { ecran, grille, vignette(nom), ouvrir(x : de 0 à 1) }. */
  function galerie(scene, o) {
    if (scene.galerie) return scene.galerie;
    o = o || {};
    var ecran = coucheSous(scene, 'galerie-ecran');
    var grille = el('div', { 'class': 'galerie-grille' }, ecran), vignettes = {};
    (o.images || []).forEach(function (nom) {
      var v = el('div', { 'class': 'vignette' }, grille), src = chemin(scene, nom + '-vignette'), attente = false;
      if (!src) { src = chemin(scene, nom); attente = true; }
      if (src) { var im = el('img', { alt: '', 'class': attente ? 'attente' : '' }, v); im.setAttribute('src', src); }
      vignettes[nom] = v;
    });
    function ouvrir(x) {
      x = borne(x);
      if (calme) { ecran.style.transform = 'none'; ecran.style.opacity = x.toFixed(3); }
      else { ecran.style.opacity = '1'; ecran.style.transform = 'translateY(' + ((1 - x) * 100).toFixed(2) + '%)'; }
      ecran.style.visibility = x > 0.001 ? 'visible' : 'hidden';
    }
    ouvrir(o.ouverte ? 1 : 0);
    scene.galerie = { ecran: ecran, grille: grille, vignette: function (nom) { return vignettes[nom] || null; }, ouvrir: ouvrir };
    return scene.galerie;
  }

  return {
    suivant: suivant, copie: copie, entre: entre, maintenant: maintenant, julie: julie, aide: aide, f1: f1,
    coucheSous: coucheSous, coucheDessus: coucheDessus, halo: halo, onde: onde, image: image, chemin: chemin,
    plan: plan, planVisible: planVisible, source: source, objetDuGeste: objetDuGeste, Suivi: Suivi,
    avalerClic: avalerClic, doigts: doigts, tenue: tenue, courbe: courbe, echantillons: echantillons,
    figurine: figurine, centreDe: centreDe, etincelle: etincelle,
    coeur: coeur, paupieres: paupieres, TEINTES: TEINTES, main: main, rose: rose, telephone: telephone, galerie: galerie
  };
})();

// ---------------------------------------------------------------- l'échafaudage commun
/* Geste(scene, g, reglage) : les paliers d'aide et ce qui s'arrête avec le geste. reglage :
     cible        [x, y, rayon] (sinon g.cible) : le halo, et la place de la consigne ;
     sansHalo     pas de halo (la mécanique dessine sa propre invitation) ;
     hesite       le halo respire lentement ;
     yConsigne    la hauteur de la consigne ;
     consigneTout la consigne tout de suite (aussi g.consigne_immediate) ;
     sansBouton   pas de « Faire le geste » (attendre a son « Continuer ») ;
     clavier      false : la mécanique gère ses touches ; une fonction(ev) : à la place d'Entrée ;
     jouer        le geste joué seul, pour « Faire le geste », la fiche et le clavier : une fonction
                  qui peut rendre une promesse ; le geste est fait quand elle est tenue ;
     suivreTout   tous les effets du geste avancent avec lui (glisser avec `suivre`) ;
     garderCalque le calque des aides reste après le geste.
   Rend ge : { fait (la promesse), terminer(), jouer(), fini(), enJeu(), calque, cible, anneau,
   halo(oui), progres(x, etat), ecouter(cible, type, f, o), apres(f, ms), boucle(f), avalerClic() }. */
function Geste(scene, g, reglage) {
  reglage = reglage || {};
  var fini = false, enJeu = false, resoudre = null, nettoyages = [], minuteries = [], suivis = [];
  var fait = new Promise(function (ok) { resoudre = ok; });
  var cible = reglage.cible !== undefined ? reglage.cible : (g.cible || null);
  var calque = calqueGeste(scene), anneau = null;
  if (cible && !reglage.sansHalo) anneau = Gestes.halo(calque, cible[0], cible[1], cible[2] || 170, { hesite: reglage.hesite, couleur: Gestes.aide(scene) });
  scene.classList.add('geste-attendu');
  var yc = reglage.yConsigne || g.y_consigne || (cible ? Math.min(1480, cible[1] + (cible[2] || 170) + 90) : 1180);
  var c = consigne(scene, g.consigne || '', yc, (reglage.consigneTout || g.consigne_immediate) ? 0 : 2500);
  var objet = g.action ? Gestes.objetDuGeste(scene, g) : null;
  var ge = { calque: calque, cible: cible, anneau: anneau, fait: null };
  ge.fini = function () { return fini; };
  ge.enJeu = function () { return enJeu; };
  ge.ecouter = function (cibleEv, type, f, o) {
    cibleEv.addEventListener(type, f, o || false);
    nettoyages.push(function () { cibleEv.removeEventListener(type, f, o || false); });
  };
  ge.apres = function (f, ms) {
    var id = setTimeout(function () { if (!fini) { try { f(); } catch (e) { signaler(e); } } }, ms);
    minuteries.push(id);
    return id;
  };
  // Une boucle d'animation, arrêtée avec le geste ou la page ; f(t, dt) peut rendre false pour s'arrêter.
  ge.boucle = function (f) {
    var avant = null;
    requestAnimationFrame(function image(t) {
      if (fini || !scene.classList.contains('active')) return;
      var dt = avant === null ? 16 : Math.min(80, t - avant);
      avant = t;
      var r;
      try { r = f(t, dt); } catch (e) { signaler(e); r = false; }
      if (r !== false) requestAnimationFrame(image);
    });
  };
  ge.halo = function (oui) { if (anneau) anneau.classList.toggle('actif', !!oui); };
  ge.progres = function (x, etat) {
    suivis.forEach(function (s) { s.suivi.avancer(x, etat); });
    if (typeof g.progres === 'function') { try { g.progres(x, etat); } catch (e) { signaler(e); } }
  };
  ge.avalerClic = function () { Gestes.avalerClic(scene); };
  ge.terminer = function () {
    if (fini) return;
    fini = true;
    nettoyages.forEach(function (f) { try { f(); } catch (e) { signaler(e); } });
    minuteries.forEach(function (id) { clearTimeout(id); });
    bouton.retirer();
    c.effacer();
    if (objet) Objets.retirerAction(objet);
    if (anneau) anneau.classList.remove('actif');
    scene.classList.remove('geste-attendu');
    suivis.forEach(function (s) { s.suivi.finir(); });
    if (!reglage.garderCalque) {
      calque.classList.add('efface');
      setTimeout(function () { retirer(calque); }, 500);
    }
    var effets = Promise.all(suivis.map(function (s) { return s.fait; }));
    Promise.race([effets, attendreVraiment(2500)]).then(function () { resoudre(); }, function () { resoudre(); });
  };
  // le geste joué seul : « Faire le geste », le bouton de la fiche, le clavier
  ge.jouer = function () {
    if (fini || enJeu) return;
    enJeu = true;
    if (anneau) anneau.classList.remove('actif');
    var r;
    try { r = reglage.jouer ? reglage.jouer() : null; } catch (e) { signaler(e); r = null; }
    Promise.resolve(r).then(null, signaler).then(function () { ge.terminer(); });
  };
  var bouton = reglage.sansBouton ? { retirer: function () {} } :
    boutonFaireLeGeste(scene, function () { ge.jouer(); }, { nom: g.consigne });
  if (objet) Objets.proposer(objet, g.action, function () { ge.jouer(); });
  if (reglage.clavier !== false) {
    ge.ecouter(doc, 'keydown', function (ev) {
      if (fini || enJeu || bloque() || !scene.classList.contains('active')) return;
      if (typeof reglage.clavier === 'function') { reglage.clavier(ev); return; }
      if (!toucheValide(ev)) return;
      if (ev.cancelable) ev.preventDefault();
      ge.jouer();
    });
  }
  // les effets qui avancent avec le geste (suit_geste) : joués dès maintenant, avec leur suivi
  if (g.effets && g.effets.length) {
    var restent = [];
    g.effets.forEach(function (e) {
      if (e.suit_geste || reglage.suivreTout) {
        var s = Gestes.Suivi();
        suivis.push({ suivi: s, fait: jouerEffet(scene, Gestes.copie(e, { geste: s })) });
      } else restent.push(e);
    });
    g.effets = restent;
  }
  ge.fait = fait;
  return ge;
}

// ================================================================ les 27 mécaniques
(function () {
  var G = Gestes, f1 = Gestes.f1;

  // Mécanique jouée par un toucher dans la page : le point touché, ou le centre de la cible.
  function pointDe(p, cible) { return p || (cible ? { x: cible[0], y: cible[1] } : { x: 600, y: 900 }); }

  // ---------------------------------------------------------------- toucher
  /* Toucher la cible (les lunettes, la porte, le trou, le paquet, la vidéo, le rideau) : n'importe où
     dans la page, la cible ayant son halo qui respire ; `n` touchers (7.5 : deux coups doux à la
     porte, `effet="toc"` ; le halo hésite, et la vue s'approche de la porte à chaque coup). Quand le
     toucher prend un objet (réglage `objet`, ou les lunettes qu'un éclat court va changer en clé,
     1.9), l'objet monte au bas de la vue, comme au pigeonnier. Mouvement réduit : sans zoom. */
  function objetPris(g) {
    if (g.objet) return g.objet;
    var e = (g.effets || []).filter(function (x) { return x.nom === 'eclat-court' && x.de; })[0];
    return e ? e.de : null;
  }
  Mecaniques.toucher = function (scene, g) {
    var n = Math.max(1, g.n || 1), k = 0, cible = g.cible || null, fig = null;
    var ge = Geste(scene, g, {
      hesite: n > 1,
      clavier: function (ev) {
        if (!toucheValide(ev)) return;
        if (ev.cancelable) ev.preventDefault();
        coup(null);
      },
      jouer: function () {
        var reste = n - k, suite = Promise.resolve();
        for (var i = 0; i < reste; i++) {
          suite = suite.then(function () { coup(null, true); return attendre(k < n ? 420 : 150); });
        }
        return suite;
      }
    });
    var id = objetPris(g);
    if (id && cible) {
      var calqueFig = G.coucheSous(scene, 'figurine-calque', true);
      fig = G.figurine(calqueFig, id, cible[0], cible[1], Math.min(560, (cible[2] || 170) * 2.6));
      if (fig) {
        if (calme) fig.setAttribute('opacity', 1);
        else anime(900, function (t) { var e = lisse(t); fig.setAttribute('transform', 'translate(0 ' + f1(200 * (1 - e)) + ')'); fig.setAttribute('opacity', e.toFixed(3)); });
      }
      ge.fait.then(function () {
        if (!fig) { retirer(calqueFig); return; }
        anime(450, function (t) { fig.setAttribute('opacity', (1 - t).toFixed(3)); fig.setAttribute('transform', 'translate(0 ' + f1(-40 * t) + ')'); })
          .then(function () { retirer(calqueFig); });
      });
    }
    function coup(p, auto) {
      if (ge.fini() || k >= n) return;
      k++;
      var q = pointDe(p, cible);
      if (g.effet) Son.effet(g.effet);
      G.onde(ge.calque, q.x, q.y, { couleur: G.aide(scene), r1: n > 1 ? 110 : 150, opacite: 0.8 });
      if (n > 1 && cible && !calme) Visuels.camera(scene, { avance: 1 + 0.015 * k, vers: [cible[0], cible[1]], duree: 600 });
      ge.progres(k / n);
      if (k >= n) {
        if (!auto) ge.avalerClic();
        ge.apres(function () { ge.terminer(); }, n > 1 ? 350 : 60);
      }
    }
    G.doigts(ge, scene, { haut: function (p) { coup(p); } });
    return ge.fait;
  };

  // ---------------------------------------------------------------- maintenir
  /* Le doigt posé n'importe où et tenu `duree` ms (`halo` place l'invitation). Les gestes du cœur
     (`battement`) : chamade (2.2 : au contact un coup sourd, puis de 72 à 110 battements par minute
     pendant la tenue, un anneau vermillon par battement, le décor bat à 1,006) ; deux (2.9 : Darshan
     96, vermillon, Julie 64, crème, sans se rencontrer) ; `accord` avec `tempo_commun` (5.9 : ils
     convergent vers 80 pendant la tenue et battent ensemble, alors seulement le décor pulse) ; `deja`
     et `chaleur` (6.10 : accordés dès le toucher, une chaleur ambrée sous le doigt) ; unisson (7.10 :
     un seul anneau mêlé, un seul cœur, de `tempo`[0] à `tempo`[1]). `paupieres` (7.1, 7.10) : deux
     paupières au bord flou se ferment pendant la tenue ; fermées, elles le restent. Une fois lancé, le
     cœur bat sans le doigt jusqu'à la fin de la page (scene.coeur). Lâcher trop tôt ne fait rien perdre
     (les paupières, elles, se rouvrent doucement : on peut hésiter). Un toucher bref lance le tout ;
     Espace maintenue ; Entrée. Mouvement réduit : les anneaux s'allument sans grandir, le décor ne bat
     pas, les paupières en fondu. */
  Mecaniques.maintenir = function (scene, g) {
    var duree = Math.max(300, g.duree || 1500), battement = g.battement || null, avecPaupieres = !!g.paupieres;
    var invitation = g.halo ? [g.halo[0], g.halo[1], 110] : (g.cible || (avecPaupieres && !battement ? null : [600, 900, 150]));
    var p = 0, tenu = false, auto = false, lance = false, auFinal = null, dernierReglage = 0;
    var point = invitation ? [invitation[0], invitation[1]] : [600, 900];
    var tempoCommun = g.tempo_commun || 80;
    var ge = Geste(scene, g, {
      cible: invitation, clavier: false,
      yConsigne: invitation ? Math.min(1480, invitation[1] + invitation[2] + 90) : 1180,
      jouer: function () {
        auto = true;
        lancer();
        return new Promise(function (ok) { auFinal = ok; });
      }
    });
    var P = avecPaupieres ? G.paupieres(scene, { teinte: g.teinte || (battement ? 'couchant' : 'nuit') }) : null;
    // l'invitation d'un maintenir simple : un arc qui se remplit
    var arc = null, L = 0;
    if (!battement && !avecPaupieres && invitation) {
      var R = invitation[2] * 0.8;
      L = 2 * Math.PI * R;
      arc = svgEl('circle', { cx: invitation[0], cy: invitation[1], r: R, fill: 'none', stroke: G.aide(scene), 'stroke-width': 10, 'class': 'aide',
        'stroke-dasharray': L, 'stroke-dashoffset': L, transform: 'rotate(-90 ' + invitation[0] + ' ' + invitation[1] + ')', opacity: 0 }, ge.calque);
    }
    // la chaleur ambrée sous le doigt (6.10)
    var chaleur = null;
    if (g.chaleur) {
      var cc = G.coucheSous(scene, 'chaleur-calque', true), idg = G.suivant('chaleur');
      var rg = svgEl('radialGradient', { id: idg }, svgEl('defs', {}, cc));
      svgEl('stop', { offset: '0', 'stop-color': '#ffb85c', 'stop-opacity': '0.65' }, rg);
      svgEl('stop', { offset: '0.55', 'stop-color': '#f08a3c', 'stop-opacity': '0.22' }, rg);
      svgEl('stop', { offset: '1', 'stop-color': '#f08a3c', 'stop-opacity': '0' }, rg);
      chaleur = { calque: cc, c: svgEl('circle', { cx: point[0], cy: point[1], r: 0, fill: 'url(#' + idg + ')', opacity: 0 }, cc) };
    }
    // le cœur : réglages de départ, et tempos selon la tenue
    function tempos(x) {
      if (battement === 'chamade') return { tempo: G.entre(72, 110, x) };
      if (battement === 'unisson') { var t = g.tempo || [80, 60]; return { tempo: G.entre(t[0], t[1], x) }; }
      if (battement === 'deux' && g.accord && !g.deja) return { tempo: G.entre(96, tempoCommun, x), julie: G.entre(64, tempoCommun, x) };
      return null;
    }
    function lancer() {
      if (lance || !battement) { lance = true; return; }
      lance = true;
      var C = G.coeur(scene), o = { x: point[0], y: point[1], qui: 'darshan', arythmie: false };
      if (battement === 'chamade') C.regler(G.copie(o, { tempo: 72, julie: false, pulse: true, unisson: false }));
      else if (battement === 'unisson') C.regler(G.copie(o, { tempo: (g.tempo || [80, 60])[0], julie: false, pulse: true, unisson: true }));
      else if (g.accord && g.deja) C.regler(G.copie(o, { tempo: tempoCommun, julie: tempoCommun, cale: true, pulse: true, unisson: false }));
      else if (g.accord) C.regler(G.copie(o, { tempo: 96, julie: 64, arythmie: true, pulse: false, unisson: false }));
      else C.regler(G.copie(o, { tempo: 96, julie: 64, pulse: false, unisson: false }));
    }
    function finir() {
      if (battement && scene.coeur) {
        if (battement === 'deux' && g.accord && !g.deja) scene.coeur.regler({ tempo: tempoCommun, julie: tempoCommun, cale: true, arythmie: false, pulse: true, duree: 400 });
        else { var t = tempos(1); if (t) scene.coeur.regler(G.copie(t, { duree: 300 })); }
      }
      if (P) P.poser(1);
      if (chaleur) {
        var c0 = +chaleur.c.getAttribute('opacity');
        anime(2200, function (t) { chaleur.c.setAttribute('opacity', (c0 * (1 - t)).toFixed(3)); }).then(function () { retirer(chaleur.calque); });
      }
      if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
    }
    G.tenue(ge, scene, {
      debut: function (q) {
        tenu = true;
        if (q) { point = [q.x, q.y]; if (scene.coeur) scene.coeur.placer(q.x, q.y); }
        lancer();
        ge.halo(false);
        if (arc) arc.setAttribute('opacity', 1);
      },
      bouge: function (q) { point = [q.x, q.y]; if (scene.coeur && battement) scene.coeur.placer(q.x, q.y); },
      fin: function (toucher) {
        tenu = false;
        if (toucher) { ge.jouer(); return; }
        if (p < 1) ge.halo(true);
      }
    });
    var fait = false;
    ge.boucle(function (t, dt) {
      if (fait) return false;
      if (tenu || auto) p = Math.min(1, p + dt / duree);
      else if (P || arc) p = Math.max(0, p - dt / 1200);
      if (P) P.poser(p);
      if (arc) arc.setAttribute('stroke-dashoffset', f1(L * (1 - p)));
      if (chaleur) {
        chaleur.c.setAttribute('cx', f1(point[0])); chaleur.c.setAttribute('cy', f1(point[1]));
        chaleur.c.setAttribute('r', f1(calme ? 260 : 90 + 230 * lisse(p)));
        chaleur.c.setAttribute('opacity', (0.2 + 0.8 * lisse(p)).toFixed(3));
      }
      if (lance && battement && t - dernierReglage > 220) {
        var tp = tempos(p);
        if (tp && scene.coeur) { scene.coeur.regler(G.copie(tp, { duree: 260 })); dernierReglage = t; }
      }
      ge.progres(p);
      if (p >= 1) { fait = true; finir(); return false; }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- glisser
  /* Un glissement vertical (vers le haut, ou `sens="bas"`) d'au moins 160 unités. `vif` : le geste
     vif (1.3, 3.4, 6.11), d'un coup ; un glissement lent marche aussi. `suivre` (3.4) : ses effets
     suivent le doigt. `lent` (2.8, 6.15) : seule la lenteur fait avancer (un glissement rapide compte
     à peine), les effets `suit_geste` avancent sous le doigt (l'allée, le cadre du placard). `lever`
     et `zoom` (7.11) : le premier mouvement ouvre les paupières ; puis la photo descend et grandit
     sous le doigt qui monte, jusqu'au soleil. Toucher simple et clavier (Entrée, flèches) : le
     glissement entier (7.11 : 2,5 s). Mouvement réduit : des fondus. */
  Mecaniques.glisser = function (scene, g) {
    var sens = g.sens === 'bas' ? 1 : -1, lentGeste = !!g.lent, lever = !!g.lever, suivre = !!g.suivre || lentGeste || lever;
    var x = g.x || (g.cible ? g.cible[0] : 600), y = g.y || (g.cible ? g.cible[1] : (lever ? 1240 : 1000));
    var p = 0, auFinal = null, finiGeste = false;
    var dureeSeule = lever ? 2500 : lentGeste ? 2200 : suivre ? 900 : 500;
    var ge = Geste(scene, g, {
      sansHalo: !g.cible, suivreTout: !!g.suivre,
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          var p0 = p;
          anime(calme ? 300 : dureeSeule * (1 - p0), function (t) { avancer(G.entre(p0, 1, lever || lentGeste ? t : lisse(t))); })
            .then(function () { avancer(1); });
        });
      }
    });
    // l'indice : trois chevrons qui filent dans le sens du geste
    var indice = svgEl('g', { 'class': 'indice-glisser aide-trait' }, ge.calque), chevrons = [];
    for (var i = 0; i < 3; i++) {
      chevrons.push(svgEl('path', { d: sens < 0 ? 'M-44,22L0,-22L44,22' : 'M-44,-22L0,22L44,-22', fill: 'none', stroke: G.aide(scene),
        'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'aide', opacity: 0.2 }, indice));
    }
    function placerIndice(t) {
      var periode = lentGeste ? 2600 : g.vif ? 900 : 1500;
      chevrons.forEach(function (c, k) {
        var ph = calme ? 0 : ((t / periode) + k / 3) % 1;
        c.setAttribute('transform', 'translate(' + x + ' ' + f1(y + sens * (k * 46 - 46) + sens * 60 * ph) + ')');
        c.setAttribute('opacity', calme ? (0.35 + 0.2 * k).toFixed(2) : (Math.sin(Math.PI * ph) * 0.95).toFixed(3));
      });
    }
    placerIndice(0);
    // 7.11 : les paupières closes de 7.10, que le premier mouvement ouvre
    var P = lever ? G.paupieres(scene, { teinte: 'couchant', ferme: true }) : null;
    if (P && P.ferme() < 1 && !scene.paupieresPreparees) P.poser(1);
    var planLeve = lever ? G.planVisible(scene) : null, zoom = g.zoom || 1.35;
    function avancer(v) {
      if (finiGeste) return;
      p = Math.max(p, borne(v));
      if (P) {
        var o = borne(p / 0.14);
        P.poser(1 - o);
      }
      if (planLeve && !calme) {
        var q = lisse(borne((p - 0.1) / 0.9));
        planLeve.style.transformOrigin = '50% 70%';
        planLeve.style.transform = 'translateY(' + (6 * q).toFixed(2) + '%) scale(' + (1 + (zoom - 1) * q).toFixed(4) + ')';
      }
      ge.progres(p);
      if (p >= 1) {
        finiGeste = true;
        indice.setAttribute('opacity', 0);
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
      }
    }
    var depart = null, reference = 0, attenduDepuis = G.maintenant();
    G.doigts(ge, scene, {
      bas: function (q) { depart = q; reference = p; },
      bouge: function (q, ev, d, avant) {
        if (!depart) return;
        var dy = (q.y - depart.y) * sens, pas = (q.y - avant.y) * sens;
        if (lentGeste) {
          // seule la lenteur fait avancer : pleinement sous 700 unités par seconde, à peine au-delà de 2 000
          if (pas > 0) { var poids = d.vitesse <= 700 ? 1 : d.vitesse >= 2000 ? 0.12 : G.entre(1, 0.12, (d.vitesse - 700) / 1300); avancer(p + pas * poids / 700); }
        } else if (lever) {
          if (pas > 0) avancer(p + pas / 650);
        } else if (suivre) {
          ge.progres(borne(dy / 420));
          if (dy > 420) { ge.avalerClic(); avancer(1); }
        } else if (dy > 160) { depart = null; ge.avalerClic(); avancer(1); }
      },
      haut: function (q, ev, d, toucher) {
        var dy = depart ? (q.y - depart.y) * sens : 0;
        depart = null;
        if (toucher) { ge.jouer(); return; }
        if (!lentGeste && !lever && dy > 160) { ge.avalerClic(); avancer(1); return; }
        if (suivre && !lentGeste && !lever && p < 1) {
          // le pli (3.4) tient une seconde, puis revient
          var x0 = G.Suivi ? reference : 0;
          ge.progres(x0);
        }
      }
    });
    ge.boucle(function (t) { placerIndice(t); if (finiGeste) return false; });
    void attenduDepuis;
    return ge.fait;
  };

  // ---------------------------------------------------------------- rythme
  /* Chaque toucher est une enjambée, au rythme du lecteur, jamais de pulsation (arbitrage de la
     direction). 1.2 : cinq notes qui montent (`notes="montantes"` : la, si, ré, mi, fa dièse,
     Son.note('montantes', k)), la scène des tuiles fait avancer la vue (g.pas). 4.4 : quatre pas à
     plateforme (`effet="pas"`), la photo avance de 3 % à chaque pas, sans note. 7.9 : six foulées ;
     chacune joue la croche suivante de la première mesure de la ballade (`notes="melodie"`,
     Son.note('melodie', k)) et avance la photo de 3 à 6 % selon la vitesse (`avance=[3, 6]`) vers le
     ruban, qui paraît au bord droit avec le plan `plan` (`ruban`, l'effet de l'équipe des effets) et
     grandit avec l'avancée. `n` touchers quelconques, Entrée ou Espace `n` fois ; « Faire le geste »
     joue les enjambées (en 7.9, la mesure entière, `mode="mesure"`). Mouvement réduit : pas d'avancée
     dans la photo ; les pas et les notes restent. */
  Mecaniques.rythme = function (scene, g) {
    var n = g.n || 5, k = 0, dernier = 0, cumul = 0, notes = g.notes || null;
    var vers = g.ruban ? [Math.min(1080, g.ruban[0]), g.ruban[1]] : [600, 980];
    var ge = Geste(scene, g, {
      sansHalo: true,
      clavier: function (ev) {
        if (!toucheValide(ev)) return;
        if (ev.cancelable) ev.preventDefault();
        pas(false);
      },
      jouer: function () {
        // « Faire le geste » : les enjambées qui restent ; en 7.9, la première mesure entière, claire
        var croche = notes === 'melodie' ? 60 / 64 / 3 * 1000 : notes === 'montantes' ? 330 : 520;
        if (notes === 'melodie' && k === 0) Son.couche('melodie', true, { mode: 'mesure' });
        var suite = Promise.resolve(), avecNotes = !(notes === 'melodie' && k === 0);
        for (var i = k; i < n; i++) suite = suite.then(function () { pas(true, avecNotes); return attendreVraiment(calme ? 120 : croche); });
        return suite;
      }
    });
    if (g.plan !== undefined) jouerEffet(scene, { nom: 'decor', i: g.plan, fondu: 700 });
    if (g.ruban) jouerEffet(scene, { nom: 'ruban', attache: g.ruban, rythme: true });
    function pas(auto, avecNotes) {
      if (ge.fini() || k >= n) return;
      var t = G.maintenant(), ecart = dernier ? t - dernier : 1000;
      dernier = t;
      k++;
      if (avecNotes !== false) {
        if (notes === 'melodie') Son.note('melodie', k - 1);
        else if (notes === 'montantes') Son.note('montantes', k - 1);
      }
      Son.effet(g.effet || 'saut', { force: g.effet ? 0.8 : 1 });
      if (g.avance && !calme) {
        var pc = 3;
        if (g.avance.length === 2) pc = G.entre(g.avance[1], g.avance[0], borne((ecart - 300) / 600));
        cumul += pc;
        Visuels.camera(scene, { avance: 1 + cumul / 100, vers: vers, duree: 460 });
      }
      if (typeof g.pas === 'function') { try { g.pas(k, n, { auto: auto, ecart: ecart }); } catch (e) { signaler(e); } }
      ge.progres(k / n, { pas: k, ecart: ecart });
      if (k >= n) {
        if (!auto) ge.avalerClic();
        ge.apres(function () { ge.terminer(); }, auto ? 60 : 280);
      }
    }
    G.doigts(ge, scene, { haut: function () { pas(false); } });
    return ge.fait;
  };

  // ---------------------------------------------------------------- tourner
  /* Le tour de poignet (arbitrage 3 : 1.3, 6.13, 7.8, même geste, même consigne, même son). Un quart de
     cercle en pointillés d'or autour de la serrure (`centre`), de `rayon` au moins 250 unités, dans le
     sens de `angle` (−90 : le sens inverse des aiguilles d'une montre, de midi à neuf heures, pour
     rester loin du bord de la page) ; le doigt se pose près du cercle et tourne, l'angle se compte
     depuis la serrure, où que soit le doigt ; la clé suit à 80 %, avec une légère résistance ; à 90° du
     doigt, le cran : la clé achève son quart de tour, le son `cran` et le frisson. Revenir en arrière
     avant le cran ramène la clé doucement. Toucher la clé, Entrée, ou le bouton de la fiche : le quart
     de tour seul (650 ms). La clé est dessinée ici (celle de 1.3, rayée et rouillée, entrée dans la
     serrure) ; une scène qui a la sienne la tourne par g.tourne(degrés) ; un effet qui en a posé une
     dans la serrure la déclare dans scene.cle. Mouvement réduit : la clé passe à 90° sans animation,
     le cran sonne. */
  Mecaniques.tourner = function (scene, g) {
    var c = g.centre || (g.cible ? [g.cible[0], g.cible[1]] : [932, 1010]);
    var R = Math.max(250, g.rayon || (g.cible && g.cible[2]) || 260), angle = g.angle || -90;
    var dir = angle < 0 ? -1 : 1, fin = Math.abs(angle), auFinal = null, cran = false, tourJoue = false;
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: Math.min(1480, c[1] + 150),
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          if (!tourJoue) { tourJoue = true; Son.effet('tour'); }
          var a0 = angleCle;
          if (calme) { cranFinal(); return; }
          anime(650 * (1 - a0 / fin), function (t) { poser(G.entre(a0, fin * 0.86, lisse(t))); }).then(cranFinal);
        });
      }
    });
    // l'arc en pointillés : d'où part le doigt (midi), vers où il va (neuf heures pour −90)
    var a0 = -Math.PI / 2, a1 = a0 + dir * Math.PI / 2;
    function pt(a, r) { return [c[0] + (r || R) * Math.cos(a), c[1] + (r || R) * Math.sin(a)]; }
    var p0 = pt(a0), p1 = pt(a1);
    svgEl('path', { d: 'M' + f1(p0[0]) + ',' + f1(p0[1]) + 'A' + R + ',' + R + ' 0 0 ' + (dir < 0 ? 0 : 1) + ' ' + f1(p1[0]) + ',' + f1(p1[1]),
      fill: 'none', stroke: G.aide(scene), 'stroke-width': 9, 'stroke-dasharray': '1 24', 'stroke-linecap': 'round', 'class': 'aide arc-tour' }, ge.calque);
    // la pointe de l'arc : un chevron dans le sens du tour
    var ta = a1 + dir * Math.PI / 2, pa = [Math.cos(ta), Math.sin(ta)], na = [Math.cos(a1), Math.sin(a1)];
    svgEl('path', { d: 'M' + f1(p1[0] - pa[0] * 26 + na[0] * 22) + ',' + f1(p1[1] - pa[1] * 26 + na[1] * 22) + 'L' + f1(p1[0] + pa[0] * 8) + ',' +
      f1(p1[1] + pa[1] * 8) + 'L' + f1(p1[0] - pa[0] * 26 - na[0] * 22) + ',' + f1(p1[1] - pa[1] * 26 - na[1] * 22),
      fill: 'none', stroke: G.aide(scene), 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'aide' }, ge.calque);
    var doigtPt = svgEl('circle', { cx: f1(p0[0]), cy: f1(p0[1]), r: 20, fill: G.aide(scene), 'class': 'aide-plein point-depart', opacity: 0.85 }, ge.calque);
    // la clé : celle d'une scène (g.tourne), celle qu'un effet a posée (scene.cle), ou la nôtre
    var hook = typeof g.tourne === 'function' ? g.tourne : null;
    var cleEffet = !hook && scene.cle && typeof scene.cle.tourner === 'function' ? scene.cle : null;
    var locale = scene.gestesLocaux && scene.gestesLocaux[g.cle];
    var cleCalque = null, cleG = null;
    if (!hook && !cleEffet && !locale) {
      cleCalque = G.coucheSous(scene, 'cle-calque', true);
      var idc = G.suivant('cle');
      svgEl('rect', { x: -240, y: -125, width: 400, height: 250 }, svgEl('clipPath', { id: idc, clipPathUnits: 'userSpaceOnUse' }, svgEl('defs', {}, cleCalque)));
      cleG = svgEl('g', {}, cleCalque);
      var dedans = svgEl('g', { transform: 'scale(0.46) rotate(90) translate(-150 0)' }, cleG);
      var dc = dessin(g.dessin || 'cle');
      if (dc) {
        dc.setAttribute('x', -230); dc.setAttribute('y', -110); dc.setAttribute('width', 490); dc.setAttribute('height', 220);
        dc.setAttribute('overflow', 'visible');
        svgEl('g', { 'clip-path': 'url(#' + idc + ')' }, dedans).appendChild(dc);
      }
      svgEl('circle', { cx: c[0], cy: c[1], r: 13, fill: '#0b0806', opacity: 0.85 }, cleCalque);
      if (calme) cleCalque.style.opacity = '1';
      else anime(500, function (t) { cleCalque.style.opacity = t.toFixed(3); });
    }
    var angleCle = 0;
    function poser(deg) {
      angleCle = Math.max(0, Math.min(fin, deg));
      var d = dir * angleCle;
      try {
        if (hook) hook(d);
        else if (cleEffet) cleEffet.tourner(d);
      } catch (e) { signaler(e); }
      if (cleG) cleG.setAttribute('transform', 'translate(' + c[0] + ' ' + c[1] + ') rotate(' + f1(d) + ')');
      ge.progres(angleCle / fin);
    }
    poser(0);
    function cranFinal() {
      if (cran) return;
      cran = true;
      var a = angleCle;
      var suite = calme ? Promise.resolve(poser(fin)) : anime(140, function (t) { poser(G.entre(a, fin, vif(t))); });
      suite.then(function () {
        Son.effet('cran');
        Transitions.frisson(scene, c[0], c[1], 130);
        if (cleCalque) {
          setTimeout(function () { anime(700, function (t) { cleCalque.style.opacity = (1 - t).toFixed(3); }).then(function () { retirer(cleCalque); }); }, 1300);
        }
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
      });
    }
    var dernier = null, cumul = 0, suivi = 0, bouge = false;
    function angleDe(q) { return Math.atan2(q.y - c[1], q.x - c[0]); }
    G.doigts(ge, scene, {
      zone: function (q) { return Math.hypot(q.x - c[0], q.y - c[1]) <= R * 1.7; },
      bas: function (q) { dernier = angleDe(q); cumul = 0; bouge = false; doigtPt.setAttribute('opacity', 0.3); },
      bouge: function (q) {
        if (dernier === null || cran) return;
        var a = angleDe(q), d = a - dernier;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        dernier = a;
        if (Math.hypot(q.x - c[0], q.y - c[1]) < 40) return;   // trop près du centre : l'angle n'y veut rien dire
        cumul += d;
        var doigtDeg = dir * cumul * 180 / Math.PI;
        if (Math.abs(doigtDeg) > 4) bouge = true;
        if (doigtDeg > 8 && !tourJoue) { tourJoue = true; Son.effet('tour'); }
        suivi = Math.max(0, Math.min(fin, doigtDeg * 0.8));
        if (!calme) poser(angleCle + (suivi - angleCle) * 0.45);
        if (doigtDeg >= fin) { dernier = null; ge.avalerClic(); cranFinal(); }
      },
      haut: function (q, ev, d, toucher) {
        dernier = null;
        doigtPt.setAttribute('opacity', 0.85);
        if (cran) return;
        if (toucher || (!bouge && Math.hypot(q.x - c[0], q.y - c[1]) < R * 0.7)) { ge.jouer(); return; }
        // relâchée avant le cran : la clé revient doucement
        var a = angleCle;
        if (a > 0 && !calme) anime(420, function (t) { if (!cran && !ge.enJeu()) poser(a * (1 - lisse(t))); });
      }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- porter
  /* L'objet attend à `depart` ; le doigt le porte jusqu'à la `cible`. 1.3 : la clé, posée sous la
     serrure, portée vers le haut (la scène du pigeonnier a la sienne). 7.8 : la lettre pliée, de
     (600, 1 250) jusqu'au jour de la porte, où elle se glisse et disparaît. Lâchée ailleurs, elle
     revient à sa place ; un toucher, Entrée ou le bouton de la fiche : l'objet va seul. Une scène qui
     a son propre objet le fait suivre par g.porte(x, y, etat). Mouvement réduit : l'objet paraît à sa
     place ; la lettre disparaît en fondu. */
  var DESSIN_PORTE = { lettre: 'lettre-pliee' };   // dessins.js : la déclaration pliée, glissée sous la porte
  Mecaniques.porter = function (scene, g) {
    var depart = g.depart || [600, 1300], cible = g.cible || [600, 900, 170], auFinal = null, arrive = false;
    var hook = typeof g.porte === 'function' ? g.porte : null;
    var ge = Geste(scene, g, {
      cible: cible, yConsigne: Math.min(1480, Math.max(cible[1], depart[1]) + 140),
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          var x0 = pose.x, y0 = pose.y;
          if (calme) { placer(cible[0], cible[1]); arriver(); return; }
          anime(750, function (t) { var e = lisse(t); placer(G.entre(x0, cible[0], e), G.entre(y0, cible[1], e) - Math.sin(Math.PI * t) * 40); }).then(arriver);
        });
      }
    });
    var calqueObj = null, objG = null, nom = g.dessin || DESSIN_PORTE[g.objet] || g.objet || 'cle';
    var pose = { x: depart[0], y: depart[1] };
    if (!hook) {
      calqueObj = G.coucheSous(scene, 'porter-calque', true);
      objG = svgEl('g', {}, calqueObj);
      svgEl('ellipse', { cx: 0, cy: 70, rx: 150, ry: 18, fill: '#000', opacity: 0.25 }, objG);
      if (!G.figurine(objG, nom, 0, 0, nom === 'cle' ? 260 : 330)) svgEl('rect', { x: -120, y: -70, width: 240, height: 140, rx: 8, fill: CREME }, objG);
    }
    function placer(x, y, etat) {
      pose.x = x; pose.y = y;
      if (objG) objG.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(y) + ')');
      if (hook) { try { hook(x, y, etat || 'porte'); } catch (e) { signaler(e); } }
      var d0 = Math.hypot(depart[0] - cible[0], depart[1] - cible[1]) || 1;
      ge.progres(1 - Math.min(1, Math.hypot(x - cible[0], y - cible[1]) / d0));
    }
    placer(depart[0], depart[1], 'attend');
    if (objG) {
      if (calme) calqueObj.style.opacity = '1';
      else anime(600, function (t) { calqueObj.style.opacity = t.toFixed(3); objG.setAttribute('transform', 'translate(' + f1(depart[0]) + ' ' + f1(depart[1] + 60 * (1 - lisse(t))) + ')'); });
    }
    function arriver() {
      if (arrive) return;
      arrive = true;
      ge.halo(false);
      var suite;
      if (nom === 'cle') {
        Son.effet('cle');
        Transitions.frisson(scene, cible[0], cible[1], 150);
        suite = attendre(300);
      } else {
        // elle se glisse sous la porte et disparaît
        Son.effet('papier');
        suite = calme || !objG ? attendre(200) : anime(650, function (t) {
          var e = lent(t);
          objG.setAttribute('transform', 'translate(' + f1(cible[0]) + ' ' + f1(cible[1] + 70 * e) + ') scale(' + (1 - 0.15 * e).toFixed(3) + ',' + (1 - 0.8 * e).toFixed(3) + ')');
          objG.setAttribute('opacity', (1 - e).toFixed(3));
        });
      }
      suite.then(function () {
        if (hook) { try { hook(cible[0], cible[1], 'arrive'); } catch (e) { signaler(e); } }
        if (calqueObj) anime(300, function (t) { calqueObj.style.opacity = (1 - t).toFixed(3); }).then(function () { retirer(calqueObj); });
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
      });
    }
    var pris = false, decal = [0, 0];
    G.doigts(ge, scene, {
      bas: function (q) {
        if (Math.hypot(q.x - pose.x, q.y - pose.y) > 230) return;
        pris = true; decal = [pose.x - q.x, pose.y - q.y];
      },
      bouge: function (q) {
        if (!pris || arrive) return;
        placer(Math.max(60, Math.min(W - 60, q.x + decal[0])), Math.max(60, Math.min(H - 60, q.y + decal[1])));
      },
      haut: function (q, ev, d, toucher) {
        var etaitPris = pris;
        pris = false;
        if (arrive) return;
        if (toucher) { ge.jouer(); return; }
        if (!etaitPris) return;
        if (Math.hypot(pose.x - cible[0], pose.y - cible[1]) <= (cible[2] || 170) * 1.25) { ge.avalerClic(); ge.jouer(); return; }
        var x0 = pose.x, y0 = pose.y;
        anime(420, function (t) { var e = lisse(t); placer(G.entre(x0, depart[0], e), G.entre(y0, depart[1], e)); });
      }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- tracer
  /* Suivre du doigt un guide en pointillés d'or (`chemin`, lissé), avec une large tolérance, dans un
     sens ou dans l'autre : un trait naît sous le doigt. `trait="mousse"` (1.4) : la moustache de mousse
     à raser, blanche, épaisse, bordée de bulles, un peu floue (`flou`) ; puis les trois coups de
     coutelas (les effets du geste). Moins de 250 unités de large (arbitrage 5). Toucher simple,
     Entrée : le trait se dessine seul. Mouvement réduit : il paraît entier. */
  Mecaniques.tracer = function (scene, g) {
    var chemin = g.chemin || [[500, 1000], [700, 1000]], mousse = g.trait === 'mousse';
    var ech = G.echantillons(chemin, 14), L = ech[ech.length - 1][2] || 1;
    var cx = 0, cy = 0;
    chemin.forEach(function (q) { cx += q[0] / chemin.length; cy += q[1] / chemin.length; });
    var p = 0, sensTrace = 0, auFinal = null, finiTrace = false, dernierSon = 0;
    var ge = Geste(scene, g, {
      cible: [cx, cy, Math.max(90, L / 2 + 30)], sansHalo: true, yConsigne: Math.max(900, cy - 260),
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          if (!sensTrace) sensTrace = 1;
          var p0 = p;
          anime(calme ? 200 : 1200 * (1 - p0), function (t) { avancer(G.entre(p0, 1, t), true); }).then(function () { avancer(1, true); });
        });
      }
    });
    var d = G.courbe(chemin, false), dInverse = G.courbe(chemin.slice().reverse(), false);
    svgEl('path', { d: d, fill: 'none', stroke: G.aide(scene), 'stroke-width': 7, 'stroke-dasharray': '2 17', 'stroke-linecap': 'round', 'class': 'aide guide-trace', opacity: 0.9 }, ge.calque);
    var calqueTrait = G.coucheSous(scene, 'trace-calque', true), idf = G.suivant('mousse');
    var filtre = svgEl('filter', { id: idf, x: '-20%', y: '-60%', width: '140%', height: '220%' }, svgEl('defs', {}, calqueTrait));
    svgEl('feGaussianBlur', { stdDeviation: g.flou ? 2.2 : 0.8 }, filtre);
    var gT = svgEl('g', { filter: 'url(#' + idf + ')' }, calqueTrait);
    var ombre = svgEl('path', { fill: 'none', stroke: mousse ? '#cfc8bd' : '#1d130b', 'stroke-width': mousse ? 40 : 14, 'stroke-linecap': 'round', opacity: mousse ? 0.8 : 0.6 }, gT);
    var trait = svgEl('path', { fill: 'none', stroke: mousse ? '#fbfaf6' : '#2a1c10', 'stroke-width': mousse ? 32 : 10, 'stroke-linecap': 'round' }, gT);
    var bulles = [], rnd = hasard(29);
    if (mousse) {
      for (var i = 0; i < 26; i++) {
        var q = ech[Math.floor(rnd() * (ech.length - 1))], cote = rnd() < 0.5 ? -1 : 1;
        bulles.push({ at: q[2] / L, c: svgEl('circle', { cx: f1(q[0] + (rnd() - 0.5) * 18), cy: f1(q[1] + cote * (14 + rnd() * 10)), r: f1(3 + rnd() * 5),
          fill: '#ffffff', stroke: '#d9d3c8', 'stroke-width': 1.2, opacity: 0 }, gT) });
      }
    }
    function avancer(v, auto) {
      if (finiTrace) return;
      if (v > p) {
        p = Math.min(1, v);
        var dd = sensTrace < 0 ? dInverse : d;
        [ombre, trait].forEach(function (e) { e.setAttribute('d', dd); e.setAttribute('stroke-dasharray', f1(L) + ' ' + f1(L)); e.setAttribute('stroke-dashoffset', f1(L * (1 - p))); });
        bulles.forEach(function (b) { var at = sensTrace < 0 ? 1 - b.at : b.at; if (at <= p) b.c.setAttribute('opacity', 0.95); });
        var t = G.maintenant();
        if (mousse && t - dernierSon > 170 && !auto) { Son.effet('mousse', { force: 0.6 }); dernierSon = t; }
        ge.progres(p);
      }
      if (p >= 0.97) {
        finiTrace = true;
        p = 1;
        [ombre, trait].forEach(function (e) { e.setAttribute('stroke-dashoffset', 0); });
        bulles.forEach(function (b) { b.c.setAttribute('opacity', 0.95); });
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
      }
    }
    // le point du chemin le plus proche du doigt (s'il est à moins de 110 unités)
    function proche(q) {
      var best = -1, dmin = 110;
      for (var k = 0; k < ech.length; k++) { var dd = Math.hypot(q.x - ech[k][0], q.y - ech[k][1]); if (dd < dmin) { dmin = dd; best = k; } }
      return best < 0 ? null : ech[best][2] / L;
    }
    function suivreDoigt(q) {
      var a = proche(q);
      if (a === null) return;
      if (!sensTrace) sensTrace = a > 0.5 ? -1 : 1;
      var v = sensTrace < 0 ? 1 - a : a;
      if (v > p && v - p < 0.3) {
        if (calme) avancer(1); else avancer(v);
      }
    }
    G.doigts(ge, scene, {
      bas: function (q) { suivreDoigt(q); },
      bouge: function (q) { suivreDoigt(q); },
      haut: function (q, ev, dg, toucher) { if (toucher && p < 0.05) ge.jouer(); else if (p >= 0.97) ge.avalerClic(); }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- remuer
  /* Dans l'eau (`zone` [x0, y0, x1, y1]), de petits cercles ou de haut en bas, sans grand mouvement de
     côté : des anneaux s'élargissent sous le doigt, aplatis comme sur l'eau qu'on regarde de biais ;
     après 2 s de mouvement, les reflets de `images` se forment l'un après l'autre (l'effet `reflet`,
     1,5 s chacun). Toucher simple ou Entrée : une ride, puis les reflets. Mouvement réduit : les reflets
     en fondu, sans onde. */
  Mecaniques.remuer = function (scene, g) {
    var z = g.zone || [0, 800, 800, 1750], images = g.images || [];
    var cx = (z[0] + z[2]) / 2, cy = (z[1] + z[3]) / 2, r = Math.min(z[2] - z[0], z[3] - z[1]) * 0.36;
    var brasse = 0, lance = false, derniereRide = 0, dernierSon = 0;
    var ge = Geste(scene, g, {
      cible: [cx, cy, r], yConsigne: Math.min(1480, cy + r + 90),
      jouer: function () { G.onde(ge.calque, cx, cy, { aplati: 0.38, r1: 220, opacite: 0.7 }); return reflets(); }
    });
    var calqueEau = G.coucheSous(scene, 'eau-calque', true);
    function dans(q) { return q.x >= z[0] && q.x <= z[2] && q.y >= z[1] && q.y <= z[3]; }
    function reflets() {
      if (lance) return Promise.resolve();
      lance = true;
      ge.halo(false);
      return enchainer(images.map(function (nom) {
        return function () { jouerEffet(scene, { nom: 'reflet', image: nom, zone: z }); return attendreVraiment(calme ? 400 : 1500); };
      }));
    }
    G.doigts(ge, scene, {
      zone: dans,
      bouge: function (q, ev, d, avant) {
        if (lance || !dans(q)) return;
        var t = G.maintenant(), dt = Math.min(80, t - (d.tAvant || t));
        d.tAvant = t;
        if (d.vitesse > 40) brasse += dt;
        if (!calme && t - derniereRide > 140) {
          derniereRide = t;
          G.onde(calqueEau, q.x, q.y, { r0: 10, r1: 90 + Math.min(80, d.vitesse / 20), aplati: 0.38, epaisseur: 3.5, opacite: 0.55, duree: 1300 });
          G.onde(calqueEau, q.x, q.y + 3, { r0: 6, r1: 60, aplati: 0.38, epaisseur: 2, opacite: 0.35, couleur: '#0b1a2a', duree: 1100 });
        }
        if (t - dernierSon > 380) { Son.effet('remous', { force: 0.7 }); dernierSon = t; }
        ge.progres(Math.min(1, brasse / 2000));
        if (brasse >= 2000) reflets().then(function () { ge.terminer(); });
        void avant;
      },
      haut: function (q, ev, d, toucher) {
        if (lance) return;
        if (toucher) { G.onde(calqueEau, q.x, q.y, { r0: 10, r1: 160, aplati: 0.38, opacite: 0.6, duree: 1400 }); ge.jouer(); }
      }
    });
    ge.fait.then(function () { setTimeout(function () { retirer(calqueEau); }, 1600); });
    return ge.fait;
  };

  // ---------------------------------------------------------------- caresser
  /* Un va-et-vient lent (moins de 600 unités par seconde) dans le cercle `cible` (rayon 120) ; seuls
     les mouvements lents comptent, jusqu'à `duree` (2,4 s) de caresse cumulée. 2.1 : une lueur chaude
     suit le doigt (et le flou `suit_geste` se resserre autour de la main). 6.5, `matiere="velours"`,
     `sens="vertical"` : de haut en bas, le poil change de ton sous le doigt (plus clair dans le sens du
     poil, vers le bas ; plus sombre à rebrousse-poil), la trace se relâche en 2 s, quelques reflets
     d'argent. Toucher simple ou Entrée : une caresse jouée ; Espace maintenue. Mouvement réduit : pas
     de lueur qui suit, le halo s'éclaire. */
  Mecaniques.caresser = function (scene, g) {
    var c = g.cible || [600, 800, 120], duree = g.duree || 2400, velours = g.matiere === 'velours', vertical = g.sens === 'vertical';
    var cumul = 0, auFinal = null, finiC = false, dernierSon = 0, espace = false;
    var ge = Geste(scene, g, {
      cible: [c[0], c[1], c[2] || 120], clavier: false,
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          var c0 = cumul, t0 = null;
          ge.boucle(function (t) {
            if (finiC) return false;
            if (t0 === null) t0 = t;
            var s = (t - t0) / 1000, dx = vertical ? 0 : Math.sin(s * 3.1) * c[2] * 0.6, dy = vertical ? Math.sin(s * 3.1) * c[2] * 0.7 : Math.sin(s * 6.2) * 12;
            caresse({ x: c[0] + dx, y: c[1] + dy }, vertical ? Math.cos(s * 3.1) : 0);
            avancer(c0 + (t - t0) * (duree - c0) / (calme ? 600 : duree));
          });
        });
      }
    });
    var calqueC = G.coucheSous(scene, 'caresse-calque', true), idg = G.suivant('caresse');
    var defs = svgEl('defs', {}, calqueC);
    var rg = svgEl('radialGradient', { id: idg }, defs);
    svgEl('stop', { offset: '0', 'stop-color': velours ? '#ffffff' : '#ffd79a', 'stop-opacity': velours ? '0.22' : '0.6' }, rg);
    svgEl('stop', { offset: '1', 'stop-color': velours ? '#ffffff' : '#ffb35c', 'stop-opacity': '0' }, rg);
    var idn = G.suivant('rebrousse'), rn = svgEl('radialGradient', { id: idn }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#000000', 'stop-opacity': '0.3' }, rn);
    svgEl('stop', { offset: '1', 'stop-color': '#000000', 'stop-opacity': '0' }, rn);
    var lueur = svgEl('circle', { cx: c[0], cy: c[1], r: 95, fill: 'url(#' + idg + ')', opacity: 0 }, calqueC);
    var traces = [], rnd = hasard(61);
    function caresse(q, sensY) {
      if (!calme && !velours) { lueur.setAttribute('cx', f1(q.x)); lueur.setAttribute('cy', f1(q.y)); lueur.setAttribute('opacity', 1); }
      if (velours && !calme) {
        // le poil change de ton : plus clair vers le bas, plus sombre vers le haut ; il se relâche en 2 s
        var t = G.maintenant();
        if (!traces.length || t - traces[traces.length - 1].t > 45) {
          var e = svgEl('ellipse', { cx: f1(q.x), cy: f1(q.y), rx: 46, ry: 62, fill: 'url(#' + (sensY >= 0 ? idg : idn) + ')', opacity: 0.9 }, calqueC);
          traces.push({ e: e, t: t });
          if (rnd() < 0.18) {
            var s = svgEl('path', { d: etoile(5 + rnd() * 5), fill: '#e8eef8', transform: 'translate(' + f1(q.x + (rnd() - 0.5) * 70) + ' ' + f1(q.y + (rnd() - 0.5) * 90) + ')', opacity: 0.9 }, calqueC);
            traces.push({ e: s, t: t, reflet: true });
          }
        }
      }
    }
    function avancer(v) {
      if (finiC) return;
      cumul = Math.min(duree, v);
      var x = cumul / duree;
      ge.progres(x);
      if (calme && ge.anneau) ge.anneau.setAttribute('stroke-width', f1(5 + 6 * x));
      if (x >= 1) {
        finiC = true;
        anime(900, function (t) { lueur.setAttribute('opacity', (1 - t).toFixed(3)); });
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
      }
    }
    ge.boucle(function () {
      var t = G.maintenant();
      for (var i = traces.length - 1; i >= 0; i--) {
        var a = (t - traces[i].t) / (traces[i].reflet ? 700 : 2000);
        if (a >= 1) { retirer(traces[i].e); traces.splice(i, 1); } else traces[i].e.setAttribute('opacity', ((1 - a) * 0.9).toFixed(3));
      }
      if (espace) avancer(cumul + 16);
    });
    G.doigts(ge, scene, {
      bouge: function (q, ev, d, avant) {
        if (Math.hypot(q.x - c[0], q.y - c[1]) > (c[2] || 120) * 1.35) return;
        var dx = q.x - avant.x, dy = q.y - avant.y, t = G.maintenant(), dt = Math.min(60, t - (d.tAv || t));
        d.tAv = t;
        caresse(q, dy);
        if (d.vitesse < 600 && d.vitesse > 12 && (!vertical || Math.abs(dy) >= Math.abs(dx) * 0.6)) {
          avancer(cumul + dt);
          if (velours && t - dernierSon > 420) { Son.effet('velours', { force: 0.6 }); dernierSon = t; }
        }
      },
      haut: function (q, ev, d, toucher) { lueur.setAttribute('opacity', 0); if (toucher) ge.jouer(); }
    });
    ge.ecouter(doc, 'keydown', function (ev) {
      if (ge.fini() || ge.enJeu() || bloque() || !scene.classList.contains('active') || toucheDeBouton(ev)) return;
      if (ev.key === ' ') { if (ev.cancelable) ev.preventDefault(); espace = true; }
      else if (ev.key === 'Enter' || ev.key === 'ArrowRight') { if (ev.cancelable) ev.preventDefault(); ge.jouer(); }
    });
    ge.ecouter(doc, 'keyup', function (ev) { if (ev.key === ' ') espace = false; });
    ge.fait.then(function () { setTimeout(function () { retirer(calqueC); }, 2100); });
    return ge.fait;
  };

  // ---------------------------------------------------------------- deux-pouces
  /* Le mudrā (3.9) : deux doigts quelconques dans la `zone` ; deux cercles d'or naissent sous eux, les
     suivent et glissent l'un vers l'autre ; maintenus `duree` (2,6 s), ils ferment le sceau (l'effet
     `sceau` : l'ovale d'or au milieu). Un seul doigt maintenu, ou Espace, suffit : les cercles partent
     alors des deux points `cibles`. Lâcher tôt rouvre les cercles. Mouvement réduit : cercles fixes, le
     sceau en fondu. */
  Mecaniques['deux-pouces'] = function (scene, g) {
    var z = g.zone || [0, 900, 1200, 1500], cibles = g.cibles || [[450, 1150, 130], [750, 1150, 130]], duree = g.duree || 2600;
    var centre = [(cibles[0][0] + cibles[1][0]) / 2, (cibles[0][1] + cibles[1][1]) / 2];
    var p = 0, tenu = false, auto = false, auFinal = null, finiD = false;
    var ge = Geste(scene, g, {
      sansHalo: true, clavier: false, yConsigne: Math.max(900, z[1] - 120),
      jouer: function () { auto = true; return new Promise(function (ok) { auFinal = ok; }); }
    });
    var halos = cibles.map(function (c) { return G.halo(ge.calque, c[0], c[1], c[2] || 130, { couleur: G.aide(scene) }); });
    var calqueD = G.coucheSous(scene, 'pouces-calque', true), idf = G.suivant('pouce');
    var fl = svgEl('filter', { id: idf, x: '-50%', y: '-50%', width: '200%', height: '200%' }, svgEl('defs', {}, calqueD));
    svgEl('feGaussianBlur', { stdDeviation: 7, result: 'b' }, fl);
    var fm = svgEl('feMerge', {}, fl);
    svgEl('feMergeNode', { 'in': 'b' }, fm); svgEl('feMergeNode', { 'in': 'SourceGraphic' }, fm);
    var cercles = cibles.map(function (c) {
      return svgEl('circle', { cx: c[0], cy: c[1], r: 62, fill: 'none', stroke: OR, 'stroke-width': 7, filter: 'url(#' + idf + ')', opacity: 0 }, calqueD);
    });
    var bases = cibles.map(function (c) { return [c[0], c[1]]; });
    var D = G.tenue(ge, scene, {
      zone: function (q) { return q.x >= z[0] && q.x <= z[2] && q.y >= z[1] && q.y <= z[3]; },
      debut: function () { tenu = true; halos.forEach(function (h) { h.classList.remove('actif'); }); },
      fin: function (toucher) { tenu = false; if (toucher) ge.jouer(); else if (p < 1) halos.forEach(function (h) { h.classList.add('actif'); }); }
    });
    ge.boucle(function (t, dt) {
      if (finiD) return false;
      if (tenu || auto) p = Math.min(1, p + dt / duree);
      else p = Math.max(0, p - dt / 800);
      // les doigts posés donnent le départ des cercles ; sans doigt, les deux points
      var liste = D.doigts.liste();
      if (liste.length >= 2) {
        var a = liste[0].dernier, b = liste[1].dernier;
        bases = a.x <= b.x ? [[a.x, a.y], [b.x, b.y]] : [[b.x, b.y], [a.x, a.y]];
      } else if (liste.length === 1) {
        var d = liste[0].dernier, sym = [2 * centre[0] - d.x, d.y];
        bases = d.x <= centre[0] ? [[d.x, d.y], sym] : [sym, [d.x, d.y]];
      } else if (!tenu && !auto && p === 0) bases = cibles.map(function (c) { return [c[0], c[1]]; });
      var e = calme ? 0 : lisse(p);
      cercles.forEach(function (c, i) {
        var s = i ? 1 : -1, x = G.entre(bases[i][0], centre[0] + s * 34, e), y = G.entre(bases[i][1], centre[1], e);
        c.setAttribute('cx', f1(x)); c.setAttribute('cy', f1(y));
        c.setAttribute('r', f1(62 - 10 * e));
        c.setAttribute('opacity', (tenu || auto || p > 0 ? 0.35 + 0.65 * Math.min(1, p * 3 + 0.3) : 0).toFixed(3));
      });
      ge.progres(p);
      if (p >= 1) {
        finiD = true;
        anime(600, function (x) { calqueD.style.opacity = (1 - x).toFixed(3); }).then(function () { retirer(calqueD); });
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
        return false;
      }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- respirer
  /* Maintenir, c'est inspirer (au moins `mini`, 1,2 s) ; lâcher, expirer ; `n` fois (3.10 : trois ; la
     page s'assombrit d'un cran à chaque expiration, « le fleuve s'assombrit » ; les braises sont
     l'effet de la scène « vision »). 4.5 (`n=1`, `avance`, `anneau="blanc"`) : pendant l'inspiration,
     la vue avance dans le tunnel (de 1 à 1,35, trois secondes au plus) ; au souffle, les effets du
     geste (la lumière verte de l'arche, le village). Un anneau guide le souffle : il grandit à
     l'inspiration, diminue à l'expiration. Un toucher, ou Entrée : les respirations guidées (4 s
     chacune) ; Espace maintenue. g.souffle(k, phase) pour la scène. Mouvement réduit : la lueur varie,
     sans rien qui avance. */
  Mecaniques.respirer = function (scene, g) {
    var n = g.n || 3, mini = g.mini || 1200, c = g.cible || [600, g.avance ? 700 : 820], blanc = g.anneau === 'blanc';
    var k = 0, phase = 'repos', tPhase = 0, tenu = false, auto = false, auFinal = null, finiR = false, gonfle = 0;
    var couleur = blanc ? '#ffffff' : OR;
    var ge = Geste(scene, g, {
      sansHalo: true, clavier: false, yConsigne: Math.min(1480, c[1] + 330),
      jouer: function () { auto = true; tPhase = 0; return new Promise(function (ok) { auFinal = ok; }); }
    });
    var calqueR = G.coucheSous(scene, 'souffle-calque', true);
    var sombre = (n > 1 && g.assombrir !== false) ? el('div', { 'class': 'assombrir' }, G.coucheSous(scene, 'assombrir-calque')) : null;
    var idf = G.suivant('souffle'), fl = svgEl('filter', { id: idf, x: '-50%', y: '-50%', width: '200%', height: '200%' }, svgEl('defs', {}, calqueR));
    svgEl('feGaussianBlur', { stdDeviation: 9, result: 'b' }, fl);
    var fm = svgEl('feMerge', {}, fl);
    svgEl('feMergeNode', { 'in': 'b' }, fm); svgEl('feMergeNode', { 'in': 'SourceGraphic' }, fm);
    var anneau = svgEl('circle', { cx: c[0], cy: c[1], r: 110, fill: 'none', stroke: couleur, 'stroke-width': 7, filter: 'url(#' + idf + ')', opacity: 0.55 }, calqueR);
    var lueur = svgEl('circle', { cx: c[0], cy: c[1], r: 110, fill: couleur, opacity: 0.05 }, calqueR);
    var planA = g.avance ? G.planVisible(scene) : null, zoom = 1;
    function hook(ph) { if (typeof g.souffle === 'function') { try { g.souffle(k, ph); } catch (e) { signaler(e); } } }
    function inspirer() {
      if (phase === 'inspire' || finiR) return;
      phase = 'inspire'; tPhase = 0;
      Son.effet('souffle', { force: 0.3 });
      hook('inspire');
    }
    function expirer() {
      if (phase !== 'inspire') return;
      var assez = tPhase >= mini || auto;
      phase = assez ? 'expire' : 'repos'; tPhase = 0;
      if (!assez) return;
      k++;
      hook('expire');
      if (sombre) sombre.style.opacity = (0.11 * k).toFixed(3);
      if (k >= n) { finiR = true; ge.halo(false); }
    }
    G.tenue(ge, scene, {
      debut: function () { tenu = true; inspirer(); },
      fin: function (toucher) { tenu = false; if (toucher && phase !== 'inspire') { ge.jouer(); return; } expirer(); }
    });
    var fin = false;
    ge.boucle(function (t, dt) {
      if (fin) return false;
      tPhase += dt;
      if (auto && !finiR) {
        // le souffle guidé : 2 s d'inspiration, 2 s d'expiration
        var demi = calme ? 700 : 2000;
        if (phase !== 'inspire' && phase !== 'expire') { inspirer(); }
        else if (phase === 'inspire' && tPhase >= demi) { expirer(); }
        else if (phase === 'expire' && tPhase >= demi && k < n) { inspirer(); }
      }
      if (phase === 'inspire') gonfle = Math.min(1, gonfle + dt / (auto ? (calme ? 700 : 2000) : Math.max(mini, 1500)));
      else gonfle = Math.max(0, gonfle - dt / (calme ? 500 : 1400));
      var e = lisse(gonfle);
      anneau.setAttribute('r', f1(calme ? 170 : 110 + 150 * e));
      anneau.setAttribute('opacity', (0.45 + 0.5 * e).toFixed(3));
      lueur.setAttribute('r', f1(calme ? 170 : 110 + 150 * e));
      lueur.setAttribute('opacity', (0.04 + 0.14 * e).toFixed(3));
      if (planA && !calme) {
        if (phase === 'inspire') zoom = Math.min(1.35, zoom + dt / 3000 * 0.35);
        else if (!finiR) zoom = Math.max(1, zoom - dt / 2000 * 0.35);
        planA.style.transformOrigin = pourcent(c[0], W) + ' ' + pourcent(c[1], H);
        planA.style.transform = 'scale(' + zoom.toFixed(4) + ')';
      }
      ge.progres((k + (phase === 'inspire' ? 0.5 * e : 0)) / n, { phase: phase, souffle: k });
      if (finiR && (phase !== 'expire' || tPhase > (calme ? 300 : 700))) {
        fin = true;
        anime(700, function (x) { calqueR.style.opacity = (1 - x).toFixed(3); }).then(function () { retirer(calqueR); });
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
        return false;
      }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- tendre
  /* 3.11 : la main d'or suit le doigt vers le haut, de plus en plus lentement, et s'arrête à un doigt
     du bois (`arret`, y 1 000) ; si le lecteur insiste, la lumière devant la porte ondule en cercles et
     rien ne cède (le premier geste impossible du livre) ; au lâcher, la main redescend. La main
     s'éclaire à mesure qu'elle approche de la lanterne. Un toucher, Entrée : la main monte seule
     jusqu'à la limite. Mouvement réduit : la main paraît à la limite, sans onde. */
  Mecaniques.tendre = function (scene, g) {
    var depart = g.depart || [600, 1300], cible = g.cible || [600, 760], arret = g.arret || 1000;
    var repos = Math.max(depart[1] + 140, arret + 300), course = repos - arret, bout = repos;
    var insiste = 0, derniereOnde = 0, auFinal = null, finiT = false, tenu = false;
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: Math.min(1480, depart[1] + 120),
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          var b0 = bout;
          if (calme) { placer(arret); setTimeout(fin, 700); return; }
          anime(1500, function (t) { placer(G.entre(b0, arret, vif(t))); })
            .then(function () { ondes(); return attendreVraiment(450); })
            .then(function () { ondes(); return attendreVraiment(700); })
            .then(fin);
        });
      }
    });
    var calqueM = G.coucheSous(scene, 'main-calque', true), M = G.main(calqueM);
    function placer(y) {
      bout = y;
      var eclat = borne((repos - y) / course);
      M.poser(cible[0], y + 370, eclat);
      ge.progres(eclat);
    }
    placer(repos + 60);
    if (calme) calqueM.style.opacity = '1';
    else anime(700, function (t) { calqueM.style.opacity = t.toFixed(3); placer(repos + 60 * (1 - lisse(t))); });
    function ondes() {
      if (calme) return;
      var t = G.maintenant();
      if (t - derniereOnde < 380) return;
      derniereOnde = t;
      G.onde(calqueM, cible[0], arret - 40, { r0: 30, r1: 260, aplati: 0.55, couleur: OR, epaisseur: 5, opacite: 0.7, duree: 1400 });
    }
    function redescendre() {
      var b0 = bout;
      return anime(calme ? 200 : 750, function (t) { placer(G.entre(b0, repos + 60, lisse(t))); calqueM.style.opacity = finiT ? (1 - t).toFixed(3) : '1'; });
    }
    function fin() {
      if (finiT) return;
      finiT = true;
      if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
      // la main redescend quand le doigt se lève (ou tout de suite s'il n'y en a plus)
      function lacher() { doc.removeEventListener('pointerup', lacher); doc.removeEventListener('keyup', lacher); redescendre().then(function () { retirer(calqueM); }); }
      if (tenu) { doc.addEventListener('pointerup', lacher); doc.addEventListener('keyup', lacher); setTimeout(lacher, 6000); } else lacher();
    }
    var y0 = null;
    G.tenue(ge, scene, {
      debut: function (q) { tenu = true; y0 = q ? q.y : null; },
      bouge: function (q) {
        if (y0 === null || finiT) return;
        var dy = Math.max(0, y0 - q.y);
        if (calme) { if (dy > 60) { placer(arret); insiste = 1000; } return; }
        placer(repos - course * (1 - Math.exp(-dy / (course * 0.8))));
        if (dy > course * 1.15) ondes();
      },
      fin: function (toucher) {
        tenu = false; y0 = null;
        if (toucher) { ge.jouer(); return; }
        if (!finiT) { insiste = 0; redescendre(); }
      }
    });
    ge.boucle(function (t, dt) {
      if (finiT) return false;
      // Espace maintenue : la main monte seule
      if (tenu && y0 === null && !calme) { placer(Math.max(arret, bout - dt * 0.25)); if (bout <= arret + 4) ondes(); }
      if (tenu && bout <= arret + course * 0.04) insiste += dt;
      if (insiste > 900) { fin(); return false; }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- semer
  /* 3.14 : la rose des vents d'or sans aiguille (le dessin que reprend la boussole de 5.3), et ses
     quatre points, bien à l'intérieur de la page ; chaque toucher lance une graine vers le bord qui
     lui répond, portée par une rafale ; dans n'importe quel ordre, vite, « sans attendre ». Un toucher
     ailleurs sème le point suivant (nord, est, sud, ouest) ; Entrée quatre fois. Les effets du geste
     (le vent qui se lève) suivent la quatrième graine. Mouvement réduit : les graines paraissent aux
     bords. */
  Mecaniques.semer = function (scene, g) {
    var centre = g.rose || [600, 1100];
    var cibles = g.cibles || [[600, 760, 110], [940, 1100, 110], [600, 1440, 110], [260, 1100, 110]];
    var semes = cibles.map(function () { return false; }), nb = 0;
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 560,
      clavier: function (ev) { if (!toucheValide(ev)) return; if (ev.cancelable) ev.preventDefault(); semer(suivant()); },
      jouer: function () {
        var suite = Promise.resolve();
        cibles.forEach(function () { suite = suite.then(function () { semer(suivant(), true); return attendreVraiment(calme ? 120 : 330); }); });
        return suite.then(function () { return attendreVraiment(calme ? 100 : 700); });
      }
    });
    var calqueS = G.coucheSous(scene, 'rose-calque', true);
    var r0 = Math.hypot(cibles[0][0] - centre[0], cibles[0][1] - centre[1]) || 340;
    var roseG = G.rose(calqueS, centre[0], centre[1], r0 * 0.9, { aiguille: !g.sans_aiguille });
    if (calme) roseG.setAttribute('opacity', 1);
    else anime(1100, function (t) { roseG.setAttribute('opacity', t.toFixed(3)); roseG.setAttribute('transform', 'translate(' + centre[0] + ' ' + centre[1] + ') scale(' + (0.9 + 0.1 * vif(t)).toFixed(3) + ')'); });
    var halos = cibles.map(function (c) { return G.halo(ge.calque, c[0], c[1], c[2] || 110, { couleur: G.aide(scene) }); });
    function suivant() { for (var i = 0; i < semes.length; i++) if (!semes[i]) return i; return -1; }
    function semer(i, auto) {
      if (i < 0 || semes[i] || ge.fini()) return;
      semes[i] = true; nb++;
      halos[i].classList.remove('actif');
      var c = cibles[i], ux = c[0] - centre[0], uy = c[1] - centre[1], l = Math.hypot(ux, uy) || 1;
      ux /= l; uy /= l;
      // jusqu'au bord, en restant à 40 unités de lui
      var tMax = Math.min(ux > 0 ? (W - 40 - c[0]) / ux : ux < 0 ? (40 - c[0]) / ux : 1e9, uy > 0 ? (H - 40 - c[1]) / uy : uy < 0 ? (40 - c[1]) / uy : 1e9);
      var bout = [c[0] + ux * tMax, c[1] + uy * tMax], ctrl = [(c[0] + bout[0]) / 2 - uy * 90, (c[1] + bout[1]) / 2 + ux * 90];
      Son.effet('graine'); Son.effet('souffle', { force: 0.25 });
      var graine = svgEl('g', {}, calqueS);
      svgEl('circle', { r: 16, fill: OR, opacity: 0.3 }, graine);
      svgEl('ellipse', { rx: 9, ry: 5, fill: '#ffe7a8' }, graine);
      if (calme) {
        graine.setAttribute('transform', 'translate(' + f1(bout[0]) + ' ' + f1(bout[1]) + ')');
        anime(300, function (t) { graine.setAttribute('opacity', (1 - t * 0.7).toFixed(3)); });
      } else {
        anime(1200, function (t) {
          var e = vif(t), u = 1 - e, x = u * u * c[0] + 2 * u * e * ctrl[0] + e * e * bout[0], y = u * u * c[1] + 2 * u * e * ctrl[1] + e * e * bout[1];
          graine.setAttribute('transform', 'translate(' + f1(x) + ' ' + f1(y) + ') rotate(' + f1(720 * t) + ')');
          graine.setAttribute('opacity', (t < 0.75 ? 1 : (1 - t) / 0.25).toFixed(3));
          if (Math.random() < 0.3) G.onde(calqueS, x, y, { r0: 2, r1: 14, couleur: OR, epaisseur: 2, opacite: 0.5, duree: 500 });
        }).then(function () { retirer(graine); });
      }
      ge.progres(nb / cibles.length);
      if (nb >= cibles.length) {
        if (!auto) ge.avalerClic();
        ge.apres(function () { ge.terminer(); }, auto ? 10 : 500);
      }
    }
    G.doigts(ge, scene, {
      haut: function (q) {
        var best = -1, dmin = 1e9;
        cibles.forEach(function (c, i) { var d = Math.hypot(q.x - c[0], q.y - c[1]); if (!semes[i] && d < (c[2] || 110) * 1.5 && d < dmin) { dmin = d; best = i; } });
        semer(best >= 0 ? best : suivant());
      }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- curseur
  /* 4.2 : la réglette de plastique blanc de l'hôpital, verticale (arbitrage 5), onze crans, un clic
     par cran (`reglette`) ; le curseur part de `depart` (zéro, en bas). Face patient : une ligne, sans
     chiffre ni mot. On fait monter le curseur, ou l'on touche un point de l'échelle ; au lâcher, la
     réglette se retourne (0,6 s) : face soignant, la graduation et le chiffre choisi, en grand
     (1,5 s) ; puis elle s'efface. Clavier : flèches haut et bas, puis Entrée (Entrée seule garde
     zéro) ; lecteurs d'écran : un curseur natif de 0 à 10, nommé par la consigne. Mouvement réduit :
     pas de retournement, les deux faces en fondu. */
  Mecaniques.curseur = function (scene, g) {
    var mini = g.mini || 0, maxi = g.maxi !== undefined ? g.maxi : 10, v = g.depart !== undefined ? g.depart : mini;
    var R = { x: 960, haut: 360, bas: 1130, l: 132 }, valide = false, auFinal = null;
    var ge = Geste(scene, g, {
      sansHalo: true, clavier: false, yConsigne: 1215,
      jouer: function () { return new Promise(function (ok) { auFinal = ok; valider(); }); }
    });
    var calqueR = G.coucheSous(scene, 'reglette-calque', true);
    var reg = svgEl('g', { 'class': 'reglette' }, calqueR);
    var corps = svgEl('g', {}, reg);
    svgEl('rect', { x: R.x - R.l / 2 + 8, y: R.haut - 50 + 12, width: R.l, height: R.bas - R.haut + 100, rx: 22, fill: '#000', opacity: 0.35 }, corps);
    svgEl('rect', { x: R.x - R.l / 2, y: R.haut - 50, width: R.l, height: R.bas - R.haut + 100, rx: 22, fill: '#f4f4f1', stroke: '#c9c9c4', 'stroke-width': 3 }, corps);
    var patient = svgEl('g', {}, corps), soignant = svgEl('g', { opacity: 0 }, corps);
    svgEl('line', { x1: R.x, y1: R.haut, x2: R.x, y2: R.bas, stroke: '#3a3c42', 'stroke-width': 5, 'stroke-linecap': 'round' }, patient);
    svgEl('line', { x1: R.x - 16, y1: R.bas, x2: R.x + 16, y2: R.bas, stroke: '#3a3c42', 'stroke-width': 5 }, patient);
    svgEl('line', { x1: R.x - 16, y1: R.haut, x2: R.x + 16, y2: R.haut, stroke: '#3a3c42', 'stroke-width': 5 }, patient);
    var curseurG = svgEl('g', {}, corps);
    svgEl('rect', { x: R.x - R.l / 2 - 10, y: -15, width: R.l + 20, height: 30, rx: 8, fill: '#2d3036', opacity: 0.92 }, curseurG);
    svgEl('rect', { x: R.x - R.l / 2 - 10, y: -3, width: R.l + 20, height: 6, fill: '#e9e9e4', opacity: 0.8 }, curseurG);
    // la face soignant : la graduation, et le chiffre choisi en grand (des chiffres, pas des mots)
    var chiffres = [];
    for (var i = mini; i <= maxi; i++) {
      var yi = yDe(i);
      svgEl('line', { x1: R.x + R.l / 2 - 36, y1: yi, x2: R.x + R.l / 2 - 8, y2: yi, stroke: '#3a3c42', 'stroke-width': 3 }, soignant);
      var tx = svgEl('text', { x: R.x + R.l / 2 - 44, y: yi + 9, 'text-anchor': 'end', 'font-size': 26, fill: '#3a3c42', 'class': 'chiffre-reglette' }, soignant);
      tx.textContent = String(i);
      chiffres.push(tx);
    }
    var grand = svgEl('text', { x: R.x - R.l / 2 - 40, y: 0, 'text-anchor': 'end', 'font-size': 150, fill: '#ffffff', 'class': 'chiffre-grand', opacity: 0 }, reg);
    function yDe(val) { return R.bas - (val - mini) / (maxi - mini) * (R.bas - R.haut); }
    function poser(val, sonner) {
      val = Math.max(mini, Math.min(maxi, Math.round(val)));
      if (val !== v && sonner) Son.effet('reglette');
      v = val;
      curseurG.setAttribute('transform', 'translate(0 ' + f1(yDe(v)) + ')');
      if (entree.value !== String(v)) entree.value = String(v);
      entree.setAttribute('aria-valuetext', String(v));
      ge.progres((v - mini) / (maxi - mini));
    }
    // le curseur natif, pour les lecteurs d'écran et le clavier
    var entree = el('input', { type: 'range', min: String(mini), max: String(maxi), step: '1', 'class': 'lu-seulement reglette-entree', 'aria-label': g.consigne || '' }, scene);
    entree.value = String(v);
    entree.addEventListener('input', function () { if (!valide) poser(+entree.value, true); });
    entree.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); valider(); } });
    poser(v, false);
    if (calme) calqueR.style.opacity = '1';
    else anime(500, function (t) { calqueR.style.opacity = t.toFixed(3); reg.setAttribute('transform', 'translate(' + f1(120 * (1 - vif(t))) + ' 0)'); });
    ge.ecouter(doc, 'keydown', function (ev) {
      if (valide || ge.fini() || bloque() || !scene.classList.contains('active') || doc.activeElement === entree) return;
      if (toucheDeBouton(ev) || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight') { ev.preventDefault(); poser(v + 1, true); }
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft') { ev.preventDefault(); poser(v - 1, true); }
      else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); valider(); }
    });
    var prise = false;
    function surReglette(q) { return Math.abs(q.x - R.x) < 170 && q.y > R.haut - 90 && q.y < R.bas + 90; }
    G.doigts(ge, scene, {
      zone: surReglette,
      bas: function (q) { prise = true; poser((R.bas - q.y) / (R.bas - R.haut) * (maxi - mini) + mini, true); },
      bouge: function (q) { if (prise) poser((R.bas - q.y) / (R.bas - R.haut) * (maxi - mini) + mini, true); },
      haut: function () { if (prise) { prise = false; ge.avalerClic(); valider(); } }
    });
    function valider() {
      if (valide) return;
      valide = true;
      entree.disabled = true;
      grand.textContent = String(v);
      grand.setAttribute('y', f1(Math.max(R.haut + 100, Math.min(R.bas + 30, yDe(v) + 52))));
      var cx = R.x;
      function retourner(e) { corps.setAttribute('transform', 'translate(' + cx + ' 0) scale(' + e.toFixed(3) + ' 1) translate(' + (-cx) + ' 0)'); }
      var suite;
      if (calme) {
        suite = anime(300, function (t) { patient.setAttribute('opacity', (1 - t).toFixed(3)); soignant.setAttribute('opacity', t.toFixed(3)); grand.setAttribute('opacity', t.toFixed(3)); });
      } else {
        Son.effet('papier', { force: 0.4 });
        suite = anime(300, function (t) { retourner(1 - lisse(t)); }).then(function () {
          patient.setAttribute('opacity', 0); soignant.setAttribute('opacity', 1);
          return anime(300, function (t) { retourner(lisse(t)); grand.setAttribute('opacity', t.toFixed(3)); });
        });
      }
      annoncer(String(v));
      suite.then(function () { return attendreVraiment(1500); })
        .then(function () { return anime(600, function (t) { calqueR.style.opacity = (1 - t).toFixed(3); }); })
        .then(function () {
          retirer(calqueR); retirer(entree);
          if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
        });
    }
    ge.fait.then(function () { retirer(entree); });
    return ge.fait;
  };

  // ---------------------------------------------------------------- messages
  /* 4.3 : le téléphone de Julie monte du bas ; en tête de la conversation, un seul nom, celui du livre
     (`a`, « Amélie ») ; chaque toucher allume une touche du clavier (sans lettre) et la bulle ne montre
     que trois points : le livre ne donne pas les messages. Au cinquième toucher (`touchers`), elle
     part ; une seconde la suit (`bulles`) ; aucune réponse ; le téléphone redescend vers le sac.
     Cinq touchers quelconques, Entrée cinq fois ; « Faire le geste » envoie tout. Mouvement réduit :
     sans montée, des fondus. */
  Mecaniques.messages = function (scene, g) {
    var touchers = g.touchers || 5, bulles = g.bulles || 2, k = 0, envoyees = 0, envoi = false;
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 640,
      clavier: function (ev) { if (!toucheValide(ev)) return; if (ev.cancelable) ev.preventDefault(); taper(); },
      jouer: function () {
        var suite = Promise.resolve();
        for (var i = k; i < touchers; i++) suite = suite.then(function () { taper(true); return attendreVraiment(calme ? 80 : 190); });
        return suite.then(function () { return fin; });
      }
    });
    var T = G.telephone(scene), e = T.ecran, x0 = 330 + 20, l = 540 - 40;
    // l'en-tête : le nom, et rien d'autre
    svgEl('rect', { x: x0, y: 780, width: l, height: 120, fill: '#e9eaee' }, e);
    svgEl('circle', { cx: 600, cy: 818, r: 26, fill: '#b9bcc4' }, e);
    var nom = svgEl('text', { x: 600, y: 882, 'text-anchor': 'middle', 'font-size': 30, fill: '#1c1d21', 'class': 'texte-telephone' }, e);
    nom.textContent = g.a || '';
    // le fil, le clavier sans lettre
    var fil = svgEl('g', {}, e);
    var clavierG = svgEl('g', {}, e), touches = [];
    svgEl('rect', { x: x0, y: 1330, width: l, height: 470, fill: '#d3d5da' }, clavierG);
    [[10, 1356], [9, 1440], [7, 1524]].forEach(function (r) {
      var lt = 42, ecart = 6, larg = r[0] * lt + (r[0] - 1) * ecart, x = 600 - larg / 2;
      for (var i = 0; i < r[0]; i++) touches.push(svgEl('rect', { x: f1(x + i * (lt + ecart)), y: r[1], width: lt, height: 66, rx: 8, fill: '#fbfbfc' }, clavierG));
    });
    touches.push(svgEl('rect', { x: 430, y: 1608, width: 340, height: 66, rx: 8, fill: '#fbfbfc' }, clavierG));
    var bulle = null, points = [];
    function nouvelleBulle() {
      bulle = svgEl('g', { opacity: 0 }, fil);
      svgEl('rect', { x: 640, y: 1150, width: 180, height: 76, rx: 36, fill: '#e3e6ec' }, bulle);
      points = [0, 1, 2].map(function (i) { return svgEl('circle', { cx: 690 + i * 40, cy: 1188, r: 9, fill: '#7d828c' }, bulle); });
    }
    nouvelleBulle();
    var fin = null, finir = null;
    fin = new Promise(function (ok) { finir = ok; });
    T.monter();
    function taper(auto) {
      if (envoi || ge.fini() || k >= touchers) return;
      k++;
      var t = touches[Math.floor(Math.random() * touches.length)];
      t.setAttribute('fill', '#a9b0bb');
      setTimeout(function () { t.setAttribute('fill', '#fbfbfc'); }, 150);
      Son.effet('clavier', { force: 0.6 });
      bulle.setAttribute('opacity', 1);
      points.forEach(function (p, i) { p.setAttribute('opacity', i < 1 + (k % 3) ? 1 : 0.35); });
      ge.progres(k / touchers);
      if (k >= touchers) { if (!auto) ge.avalerClic(); envoyer(); }
    }
    function envoyer() {
      envoi = true;
      ge.halo(false);
      var suite = Promise.resolve();
      for (var b = 0; b < bulles; b++) {
        suite = suite.then(function () {
          var bg = bulle;
          envoyees++;
          Son.effet('envoi');
          bg.querySelector('rect').setAttribute('fill', '#5a7aa6');
          points.forEach(function (p) { p.setAttribute('fill', '#ffffff'); p.setAttribute('opacity', 1); });
          var monte = 110 + 100 * (bulles - envoyees);
          var anim = calme ? Promise.resolve(bg.setAttribute('transform', 'translate(0 ' + (-monte) + ')')) :
            anime(380, function (t) { bg.setAttribute('transform', 'translate(0 ' + f1(-monte * vif(t)) + ')'); });
          return anim.then(function () {
            if (envoyees >= bulles) return null;
            // la seconde bulle s'écrit d'elle-même
            nouvelleBulle();
            bulle.setAttribute('opacity', 1);
            return attendreVraiment(calme ? 200 : 900);
          });
        });
      }
      suite.then(function () { return attendreVraiment(calme ? 200 : 900); })
        .then(function () { return T.descendre(); })
        .then(function () { retirer(T.calque); finir(); ge.terminer(); });
    }
    G.doigts(ge, scene, { haut: function () { taper(); } });
    return ge.fait;
  };

  // ---------------------------------------------------------------- contact
  /* 4.7 : une fiche de contact vide monte (une silhouette sans photo, la ligne du nom vide, celle du
     numéro vide, un curseur qui clignote) ; on tend le téléphone (le pousser vers le haut, ou le
     toucher) : il sort par le haut, une seconde d'absence, revient avec le nom (`nom`, écrit par lui,
     dans le caractère du téléphone) et sans numéro ; une coche, sans mot ; puis il redescend.
     Entrée, un toucher, le bouton de la fiche. Mouvement réduit : des fondus. */
  Mecaniques.contact = function (scene, g) {
    var parti = false;
    var ge = Geste(scene, g, { sansHalo: true, yConsigne: 640, jouer: function () { return tendre(); } });
    var T = G.telephone(scene), e = T.ecran;
    svgEl('circle', { cx: 600, cy: 990, r: 110, fill: '#c9ccd2' }, e);
    svgEl('circle', { cx: 600, cy: 960, r: 40, fill: '#eef0f3' }, e);
    svgEl('path', { d: 'M530,1062Q600,990 670,1062', fill: '#eef0f3' }, e);
    svgEl('line', { x1: 390, y1: 1215, x2: 810, y2: 1215, stroke: '#b9bcc4', 'stroke-width': 3 }, e);
    svgEl('line', { x1: 390, y1: 1325, x2: 810, y2: 1325, stroke: '#b9bcc4', 'stroke-width': 3 }, e);
    var nomT = svgEl('text', { x: 392, y: 1200, 'font-size': 40, fill: '#15161a', 'class': 'texte-telephone' }, e);
    var curseurT = svgEl('rect', { x: 392, y: 1160, width: 4, height: 48, fill: '#3b6fd8' }, e);
    var coche = svgEl('path', { d: 'M752,860l20,22l40,-46', fill: 'none', stroke: '#3a8a5c', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, e);
    var clignote = true;
    ge.boucle(function (t) { curseurT.setAttribute('opacity', clignote && Math.floor(t / 530) % 2 === 0 ? 1 : 0); });
    T.monter();
    // l'invitation : un chevron qui monte, au-dessus du téléphone
    var indice = svgEl('path', { d: 'M-40,20L0,-20L40,20', fill: 'none', stroke: G.aide(scene), 'stroke-width': 8, 'stroke-linecap': 'round', 'class': 'aide', opacity: 0.8, transform: 'translate(600 660)' }, ge.calque);
    function tendre() {
      if (parti) return Promise.resolve();
      parti = true;
      indice.setAttribute('opacity', 0);
      Son.effet('souffle', { force: 0.3 });
      return T.sortirHaut()
        .then(function () { return attendreVraiment(calme ? 300 : 1000); })
        .then(function () {
          // au retour : le nom, écrit par lui ; le numéro toujours vide
          nomT.textContent = g.nom || '';
          curseurT.setAttribute('y', 1272);
          Son.effet('souffle', { force: 0.25 });
          return T.revenir();
        })
        .then(function () {
          return calme ? Promise.resolve(coche.setAttribute('opacity', 1)) :
            anime(400, function (t) { coche.setAttribute('opacity', t.toFixed(3)); });
        })
        .then(function () { return attendreVraiment(calme ? 500 : 1600); })
        .then(function () { clignote = false; return T.descendre(); })
        .then(function () { retirer(T.calque); });
    }
    var depart = null;
    G.doigts(ge, scene, {
      bas: function (q) { depart = q; },
      bouge: function (q) { if (depart && depart.y - q.y > 150 && !parti) { depart = null; ge.avalerClic(); ge.jouer(); } },
      haut: function (q, ev, d, toucher) { depart = null; if (toucher) ge.jouer(); }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- etals
  /* 5.2 : les marchandises attendent sur leurs étals (les calques du dessin `marche_aluva`, fabriqués
     par decors.py, ou à défaut leurs dessins d'objets), chacune avec son reflet ; on les touche dans
     l'ordre qu'on veut : l'objet saute et vole jusqu'au bouton « Objets » (le bandeau « Nouvel objet »
     au premier achat seulement, puis des envols de 0,8 s : `envol="court"`), l'allée avance d'un pas
     (`avance`) ; au dernier achat, le bouton du sac ploie, lesté (`ploie`). Un toucher ailleurs achète
     la marchandise suivante (dans l'ordre du texte) ; Tab et Entrée (chaque étal est un bouton qui
     porte le nom de l'objet) ; Entrée seule achète la suivante. Mouvement réduit : ni avancée ni envol.
     Les marchandises sont posées dès l'ouverture de la page (voir la préparation, en fin de fichier). */
  function marchandises(scene, g, decor) {
    if (scene.marchandises) return scene.marchandises;
    var d = $('.decor', scene);
    if (!d) return null;
    var boite = el('div', { 'class': 'marchandises', 'aria-hidden': 'true' }, d), par = {};
    (g.objets || []).forEach(function (id, i) {
      var c = (g.cibles || [])[i] || [600, 900, 110], nom = (decor || 'marche-aluva') + '-' + id, src = G.chemin(scene, nom), e;
      if (src) {
        e = el('img', { alt: '', 'class': 'marchandise calque' }, boite);
        if (estEpub || scene.classList.contains('active')) e.setAttribute('src', src); else e.setAttribute('data-src', src);
      } else {
        e = svgEl('svg', { 'class': 'marchandise dessinee', viewBox: '0 0 ' + W + ' ' + H }, boite);
        G.figurine(e, id, c[0], c[1] - (c[2] || 110) * 0.2, (c[2] || 110) * 2.3);
      }
      par[id] = { e: e, cible: c, achete: false };
    });
    scene.marchandises = { boite: boite, par: par };
    return scene.marchandises;
  }
  Mecaniques.etals = function (scene, g) {
    var ids = g.objets || [], cibles = g.cibles || [], k = 0, finiE = false;
    var M = marchandises(scene, g, ((scene.config || {}).decors || [])[0]);
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 1250,
      clavier: function (ev) { if (!toucheValide(ev)) return; if (ev.cancelable) ev.preventDefault(); acheter(suivant()); },
      jouer: function () {
        var suite = Promise.resolve();
        ids.forEach(function () { suite = suite.then(function () { acheter(suivant(), true); return attendreVraiment(calme ? 120 : 480); }); });
        return suite.then(function () { return attendreVraiment(calme ? 100 : 900); });
      }
    });
    var achete = ids.map(function (id) { return M && M.par[id] ? M.par[id].achete : false; });
    var halos = ids.map(function (id, i) {
      var c = cibles[i] || [600, 900, 110];
      return achete[i] ? null : G.halo(ge.calque, c[0], c[1], c[2] || 110, { couleur: G.aide(scene) });
    });
    // chaque étal est un bouton, nommé par l'objet (VoiceOver dit le nom de chaque marchandise)
    var boutons = ids.map(function (id, i) {
      if (achete[i]) return null;
      var c = cibles[i] || [600, 900, 110], b = el('button', { type: 'button', 'class': 'etal-bouton ui', 'aria-label': Objets.nom(id) }, scene);
      placerEn(b, c[0] - (c[2] || 110), c[1] - (c[2] || 110));
      b.style.width = pourcent(2 * (c[2] || 110), W); b.style.height = pourcent(2 * (c[2] || 110), H);
      b.addEventListener('click', function (ev) { ev.stopPropagation(); acheter(i); });
      b.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
      return b;
    });
    function suivant() { for (var i = 0; i < ids.length; i++) if (!achete[i]) return i; return -1; }
    function acheter(i, auto) {
      if (i < 0 || achete[i] || ge.fini() || finiE) return;
      achete[i] = true; k++;
      var id = ids[i], c = cibles[i] || [600, 900, 110], m = M && M.par[id];
      if (m) m.achete = true;
      if (halos[i]) halos[i].classList.remove('actif');
      if (boutons[i]) { retirer(boutons[i]); boutons[i] = null; }
      Son.effet('achat-' + id);
      // la marchandise saute de l'étal et le quitte
      if (m && m.e) {
        if (calme) m.e.style.opacity = '0';
        else anime(420, function (t) { m.e.style.transform = 'translateY(' + (-2.2 * Math.sin(Math.PI * Math.min(1, t * 1.4))).toFixed(2) + '%)'; m.e.style.opacity = (1 - t).toFixed(3); });
      }
      var premier = !ids.some(function (x, j) { return j !== i && achete[j]; });
      var bouton = $('.barre .objets', scene);
      var vol;
      if (premier || calme || !bouton || bouton.hidden) {
        Objets.ajouter(id, 'darshan', premier);
        vol = Promise.resolve();
      } else {
        var source = el('div', { 'class': 'etal-source', 'aria-hidden': 'true' }, scene);
        placerEn(source, c[0] - 130, c[1] - 70);
        source.style.width = pourcent(260, W); source.style.height = pourcent(140, H);
        vol = Transitions.envol(scene, source, bouton, id).then(function () { retirer(source); Objets.ajouter(id, 'darshan', false); });
      }
      if (g.avance && !calme) Visuels.camera(scene, { avance: 1 + 0.018 * k, vers: [600, 1150], duree: 700 });
      ge.progres(k / ids.length);
      if (k >= ids.length || suivant() < 0) {
        finiE = true;
        if (!auto) ge.avalerClic();
        vol.then(function () {
          if (g.ploie && bouton) { bouton.classList.remove('ploie'); void bouton.offsetWidth; bouton.classList.add('ploie'); setTimeout(function () { bouton.classList.remove('ploie'); }, 700); }
          return attendreVraiment(calme ? 100 : 400);
        }).then(function () { ge.terminer(); });
      }
    }
    G.doigts(ge, scene, {
      haut: function (q) {
        var best = -1, dmin = 1e9;
        ids.forEach(function (id, i) { var c = cibles[i] || [600, 900, 110], d = Math.hypot(q.x - c[0], q.y - c[1]); if (!achete[i] && d < (c[2] || 110) * 1.3 && d < dmin) { dmin = d; best = i; } });
        acheter(best >= 0 ? best : suivant());
      }
    });
    if (suivant() < 0) ge.apres(function () { ge.terminer(); }, 50);
    ge.fait.then(function () { boutons.forEach(function (b) { retirer(b); }); });
    return ge.fait;
  };
  Mecaniques.etals.preparer = function (scene, g, cfg) { marchandises(scene, g, ((cfg || {}).decors || [])[0]); };

  // ---------------------------------------------------------------- galerie
  /* 5.6 : l'écran du téléphone de Julie en pleine page (Gestes.galerie : fond noir, le compte en haut,
     les vignettes carrées des clichés, trois par rangée, sans texte), ouvert d'un glissement vers le
     haut ; il suit le doigt, et s'ouvre passé le tiers (un petit déclic). `feuilleter` : ensuite, jusqu'à
     la fin de la page, chaque glissement vers le haut avance d'un temps, comme un toucher (les clichés
     sont l'effet `cliche`). Toucher simple, Entrée, « Ouvrir la galerie » dans la fiche du téléphone.
     Mouvement réduit : des fondus. */
  Mecaniques.galerie = function (scene, g) {
    var E = G.galerie(scene, { images: g.images || [] }), x = 0, auFinal = null, ouverte = false;
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 1180,
      jouer: function () { return new Promise(function (ok) { auFinal = ok; ouvrir(); }); }
    });
    var indice = svgEl('g', { 'class': 'aide-trait' }, ge.calque), chevrons = [];
    for (var i = 0; i < 3; i++) chevrons.push(svgEl('path', { d: 'M-44,22L0,-22L44,22', fill: 'none', stroke: G.aide(scene), 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'class': 'aide', opacity: 0.2 }, indice));
    ge.boucle(function (t) {
      if (ouverte) return false;
      chevrons.forEach(function (c, k) {
        var ph = calme ? 0 : ((t / 1500) + k / 3) % 1;
        c.setAttribute('transform', 'translate(600 ' + f1(1520 - k * 46 - 60 * ph) + ')');
        c.setAttribute('opacity', calme ? (0.35 + 0.2 * k).toFixed(2) : (Math.sin(Math.PI * ph) * 0.95).toFixed(3));
      });
    });
    function poser(v) { x = borne(v); E.ouvrir(x); ge.progres(x); }
    function ouvrir() {
      if (ouverte) return;
      ouverte = true;
      indice.setAttribute('opacity', 0);
      var x0 = x;
      anime(calme ? 250 : 520 * (1 - x0) + 120, function (t) { poser(G.entre(x0, 1, vif(t))); }).then(function () {
        poser(1);
        Son.effet('declic', { force: 0.4 });
        if (g.feuilleter) feuilleter(scene);
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
      });
    }
    var depart = null;
    G.doigts(ge, scene, {
      bas: function (q) { depart = q; },
      bouge: function (q) { if (depart && !ouverte) poser(Math.max(0, (depart.y - q.y) / 900)); },
      haut: function (q, ev, d, toucher) {
        depart = null;
        if (ouverte) return;
        if (toucher || x > 0.3) { ge.avalerClic(); ge.jouer(); return; }
        var x0 = x;
        anime(300, function (t) { if (!ouverte) poser(x0 * (1 - lisse(t))); });
      }
    });
    return ge.fait;
  };
  // Feuilleter : jusqu'à la fin de la page, un glissement vers le haut avance d'un temps (5.6 ; 5.7 par
  // l'effet cliche). L'écouteur se retire de lui-même avec le récit de la page.
  function feuilleter(scene) {
    var recit = scene.recit, depart = null;
    if (!recit || scene.feuilletage) return;
    scene.feuilletage = true;
    function fin() { scene.removeEventListener('pointerdown', bas); scene.removeEventListener('pointerup', haut); scene.feuilletage = false; }
    function vivant() { return scene.recit === recit && !recit.fini; }
    function bas(ev) { if (!vivant()) { fin(); return; } if (!horsInterface(ev)) return; depart = coordScene(scene, ev); }
    function haut(ev) {
      if (!vivant()) { fin(); return; }
      if (!depart) return;
      var q = coordScene(scene, ev), dy = depart.y - q.y;
      depart = null;
      if (dy > 120 && Math.abs(q.x - (q.x)) < 1 && !bloque() && !recit.enAttente && scene.classList.contains('active')) {
        Gestes.avalerClic(scene);
        recit.avancer();
      }
    }
    scene.addEventListener('pointerdown', bas);
    scene.addEventListener('pointerup', haut);
  }

  // ---------------------------------------------------------------- essuyer
  /* 5.11 : la buée (l'effet `buee`) voile la vitrine ; on frotte en petits cercles dans le `hublot`
     ([x, y, rayon], une zone de moins de 250 unités : `trace_max`) : un rond clair se forme sous le
     doigt et laisse voir le plan `dessous` ; passé `seuil` (75 %), il s'arrondit seul (0,8 s) ; le reste
     de la vitre reste embué ; `voile` : tant que la photo de Karl manque, un voile doux reste dans le
     hublot. Toucher simple, Entrée : trois passes jouées. Mouvement réduit : le hublot paraît en trois
     fondus. */
  Mecaniques.essuyer = function (scene, g) {
    var h = g.hublot || [600, 900, 150], seuil = g.seuil || 0.75, auFinal = null, finiE = false, dernierSon = 0;
    var ge = Geste(scene, g, {
      cible: [h[0], h[1], h[2]], yConsigne: Math.min(1480, h[1] + h[2] + 90),
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          if (calme) {
            anime(300, function (t) { cercle.setAttribute('r', f1(h[2] * 0.4 * t)); })
              .then(function () { return anime(300, function (t) { cercle.setAttribute('r', f1(h[2] * (0.4 + 0.35 * t))); }); })
              .then(arrondir);
            return;
          }
          // trois passes, en petits cercles
          var t0 = null;
          ge.boucle(function (t) {
            if (finiE) return false;
            if (t0 === null) t0 = t;
            var s = (t - t0) / 1000, r = h[2] * (0.25 + 0.2 * s);
            frotter({ x: h[0] + Math.cos(s * 9) * r, y: h[1] + Math.sin(s * 9) * r * 0.8 }, true);
            if (s > 1.5) { arrondir(); return false; }
          });
        });
      }
    });
    var calqueH = svgEl('svg', { 'class': 'couche-geste ui hublot-calque', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
    var defs = svgEl('defs', {}, calqueH), idm = G.suivant('hublot'), idf = G.suivant('buee'), idc = G.suivant('rond');
    var masque = svgEl('mask', { id: idm, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
    svgEl('rect', { width: W, height: H, fill: '#000' }, masque);
    var flou = svgEl('filter', { id: idf, x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    svgEl('feGaussianBlur', { stdDeviation: 12 }, flou);
    var clip = svgEl('clipPath', { id: idc }, defs);
    svgEl('circle', { cx: h[0], cy: h[1], r: h[2] + 26 }, clip);
    var traits = svgEl('g', { filter: 'url(#' + idf + ')', 'clip-path': 'url(#' + idc + ')' }, masque);
    var cercle = svgEl('circle', { cx: h[0], cy: h[1], r: 0, fill: '#fff' }, traits);
    var vue = svgEl('g', { mask: 'url(#' + idm + ')' }, calqueH);
    var src = G.source(G.plan(scene, g.dessous !== undefined ? g.dessous : 1)) || G.source(G.planVisible(scene));
    if (src) {
      var im = G.image(vue, src, { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'xMidYMid slice' });
      if (g.voile) {
        var idv = G.suivant('voile'), fv = svgEl('filter', { id: idv }, defs);
        svgEl('feGaussianBlur', { stdDeviation: 7 }, fv);
        im.setAttribute('filter', 'url(#' + idv + ')');
      }
    }
    if (g.voile) svgEl('circle', { cx: h[0], cy: h[1], r: h[2] + 30, fill: '#fff8ee', opacity: 0.3 }, vue);
    // la couverture du hublot, sur une grille de 20 unités
    var cases = {}, total = 0, couvertes = 0, pasG = 20;
    for (var gx = h[0] - h[2]; gx <= h[0] + h[2]; gx += pasG) {
      for (var gy = h[1] - h[2]; gy <= h[1] + h[2]; gy += pasG) {
        if (Math.hypot(gx - h[0], gy - h[1]) <= h[2]) { cases[gx + ',' + gy] = false; total++; }
      }
    }
    var dernier = null;
    function frotter(q, auto) {
      if (finiE || Math.hypot(q.x - h[0], q.y - h[1]) > h[2] * 1.15) return;
      if (dernier && Math.hypot(q.x - dernier.x, q.y - dernier.y) < 9) return;
      dernier = q;
      if (!calme) svgEl('circle', { cx: f1(q.x), cy: f1(q.y), r: 46, fill: '#fff', opacity: 0.85 }, traits);
      for (var cx2 = q.x - 46; cx2 <= q.x + 46; cx2 += pasG) {
        for (var cy2 = q.y - 46; cy2 <= q.y + 46; cy2 += pasG) {
          var cle = (Math.round((cx2 - (h[0] - h[2])) / pasG) * pasG + h[0] - h[2]) + ',' + (Math.round((cy2 - (h[1] - h[2])) / pasG) * pasG + h[1] - h[2]);
          if (cases[cle] === false && Math.hypot(cx2 - q.x, cy2 - q.y) <= 46) { cases[cle] = true; couvertes++; }
        }
      }
      var t = G.maintenant();
      if (t - dernierSon > 260 && !auto) { Son.effet('buee', { force: 0.6 }); dernierSon = t; }
      ge.progres(Math.min(1, couvertes / total / seuil));
      if (!auto && couvertes / total >= seuil) arrondir();
    }
    function arrondir() {
      if (finiE) return;
      finiE = true;
      ge.halo(false);
      var r0 = +cercle.getAttribute('r');
      anime(calme ? 300 : 800, function (t) { cercle.setAttribute('r', f1(G.entre(r0, h[2], lisse(t)))); }).then(function () {
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
      });
    }
    G.doigts(ge, scene, {
      bas: function (q) { if (calme) { cercle.setAttribute('r', f1(Math.min(h[2], +cercle.getAttribute('r') + h[2] * 0.34))); if (+cercle.getAttribute('r') >= h[2] * 0.95) arrondir(); } else frotter(q); },
      bouge: function (q) { frotter(q); },
      haut: function (q, ev, d, toucher) { if (toucher && couvertes / total < 0.1 && !calme) ge.jouer(); }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- liste
  /* 6.2 : dans chaque moitié de l'écran partagé (la scène `listes` y pose scene.listes[cote] ; sans
     elle, la liste prend sa moitié de la page), un article par ligne avec sa case ; toucher un article
     le coche (au pinceau d'or chez Darshan, au stylo chez Julie) ; un toucher ailleurs coche l'article
     suivant ; Entrée aussi. `echos` (Julie) : quand un article qui répond à un article de Darshan est
     coché, les mots qu'ils partagent (« bague », « des grands jours ») se rallument dans les deux listes
     et un fil d'or passe de l'un à l'autre (1 s). La fin de la phrase paraît quand tout est coché (le
     temps qui suit). En grand texte, les listes s'empilent, Darshan au-dessus. Les listes quittent la
     page quand le récit passe le temps qui suit la dernière. Mouvement réduit : pas de fil, les mots
     s'allument ensemble. */
  function motsCommuns(a, b) {
    var x = a.toLowerCase().split(/\s+/), y = b.toLowerCase().split(/\s+/), n = 0;
    while (n < x.length && n < y.length && x[x.length - 1 - n] === y[y.length - 1 - n]) n++;
    if (n) return x.slice(x.length - n).join(' ');
    return x[0] === y[0] ? x[0] : null;
  }
  function marquerMots(mot, commun) {
    // entoure les mots communs d'un <span class="echo"> (le texte ne change pas)
    var t = mot.textContent, i = t.toLowerCase().lastIndexOf(commun);
    if (i < 0) return null;
    mot.textContent = '';
    if (i > 0) mot.appendChild(doc.createTextNode(t.slice(0, i)));
    var s = el('span', { 'class': 'echo' }, mot);
    s.textContent = t.slice(i, i + commun.length);
    if (i + commun.length < t.length) mot.appendChild(doc.createTextNode(t.slice(i + commun.length)));
    return s;
  }
  function listeDe(scene, cote, items) {
    scene.listesGeste = scene.listesGeste || {};
    if (scene.listesGeste[cote]) return scene.listesGeste[cote];
    var parent = (scene.listes && scene.listes[cote]) || G.coucheSous(scene, 'liste-geste ' + cote);
    var ol = el('ol', { 'class': 'liste-articles' }, parent);
    var lignes = items.map(function (t) {
      var li = el('li', { 'class': 'liste-article' }, ol);
      var boite = el('span', { 'class': 'case' }, li);
      var mot = el('span', { 'class': 'mot' }, li);
      mot.textContent = t;
      return { li: li, boite: boite, mot: mot, texte: t, coche: false };
    });
    if (!calme) anime(600, function (t) { parent.style.opacity = t.toFixed(3); }); else parent.style.opacity = '1';
    var L = { parent: parent, lignes: lignes, cote: cote };
    scene.listesGeste[cote] = L;
    return L;
  }
  Mecaniques.liste = function (scene, g) {
    var cote = g.cote === 'julie' ? 'julie' : 'darshan', items = g.items || [], L = listeDe(scene, cote, items), k = 0;
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 1210,
      clavier: function (ev) { if (!toucheValide(ev)) return; if (ev.cancelable) ev.preventDefault(); cocher(suivant()); },
      jouer: function () {
        var suite = Promise.resolve();
        L.lignes.forEach(function () { suite = suite.then(function () { cocher(suivant(), true); return attendreVraiment(calme ? 80 : 330); }); });
        return suite.then(function () { return attendreVraiment(calme ? 100 : 500); });
      }
    });
    L.parent.classList.add('en-cours');
    function suivant() { for (var i = 0; i < L.lignes.length; i++) if (!L.lignes[i].coche) return i; return -1; }
    function trait(boite) {
      var s = svgEl('svg', { viewBox: '0 0 60 60', 'class': 'coche' }, boite);
      var d = cote === 'darshan' ? 'M8,32 C18,40 22,48 26,50 C34,34 44,18 56,6' : 'M10,32 L24,46 L52,10';
      var p = svgEl('path', { d: d, fill: 'none', stroke: cote === 'darshan' ? OR : '#1f2a44', 'stroke-width': cote === 'darshan' ? 9 : 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
      if (calme) return;
      p.setAttribute('stroke-dasharray', '90'); p.setAttribute('stroke-dashoffset', '90');
      anime(320, function (t) { p.setAttribute('stroke-dashoffset', f1(90 * (1 - vif(t)))); });
    }
    function cocher(i, auto) {
      if (i < 0 || ge.fini()) return;
      var l = L.lignes[i];
      if (l.coche) return;
      l.coche = true; k++;
      l.li.classList.add('coche');
      trait(l.boite);
      Son.effet(cote === 'darshan' ? 'coche-pinceau' : 'coche-stylo', { pan: cote === 'darshan' ? -0.6 : 0.6 });
      echo(l);
      ge.progres(k / L.lignes.length);
      if (k >= L.lignes.length) {
        if (!auto) ge.avalerClic();
        L.parent.classList.remove('en-cours');
        ge.apres(function () { ge.terminer(); }, auto ? 10 : 450);
      }
    }
    function echo(l) {
      var autre = g.echos && g.echos[l.texte], D = scene.listesGeste && scene.listesGeste.darshan;
      if (!autre || !D) return;
      var ld = D.lignes.filter(function (x) { return x.texte === autre; })[0];
      if (!ld) return;
      var commun = motsCommuns(l.texte, autre);
      if (!commun) return;
      var a = marquerMots(ld.mot, commun), b = marquerMots(l.mot, commun);
      [a, b].forEach(function (s) { if (s) s.classList.add('rallume'); });
      if (calme || !a || !b) return;
      var pa = G.centreDe(a, scene, 1, 0.6), pb = G.centreDe(b, scene, 0, 0.6);
      if (!pa || !pb) return;
      var fil = svgEl('path', { d: 'M' + f1(pa[0]) + ',' + f1(pa[1]) + 'C' + f1(pa[0] + 120) + ',' + f1(pa[1] - 60) + ' ' + f1(pb[0] - 120) + ',' + f1(pb[1] - 60) + ' ' + f1(pb[0]) + ',' + f1(pb[1]),
        fill: 'none', stroke: OR, 'stroke-width': 4, 'stroke-linecap': 'round', 'class': 'fil-echo' }, G.coucheDessus(scene, 'echo-calque'));
      var lg = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) * 1.3 + 40;
      fil.setAttribute('stroke-dasharray', f1(lg)); fil.setAttribute('stroke-dashoffset', f1(lg));
      anime(1000, function (t) { fil.setAttribute('stroke-dashoffset', f1(lg * (1 - lisse(t)))); })
        .then(function () { return attendreVraiment(900); })
        .then(function () { return anime(900, function (t) { fil.setAttribute('opacity', (1 - t).toFixed(3)); }); })
        .then(function () { retirer(fil.parentNode); });
    }
    G.doigts(ge, scene, {
      haut: function (q, ev) {
        var li = ev.target && ev.target.closest ? ev.target.closest('.liste-article') : null, i = -1;
        if (li) L.lignes.forEach(function (x, j) { if (x.li === li) i = j; });
        if (i < 0) {
          // l'article le plus proche du doigt, dans cette liste
          var dmin = 70;
          L.lignes.forEach(function (x, j) { var c = G.centreDe(x.li, scene); if (!x.coche && c && Math.abs(c[1] - q.y) < dmin && Math.abs(c[0] - q.x) < 330) { dmin = Math.abs(c[1] - q.y); i = j; } });
        }
        cocher(i >= 0 && !L.lignes[i].coche ? i : suivant());
      }
    });
    // les listes quittent la page quand le récit passe le temps qui suit la dernière d'entre elles
    ge.fait.then(function () {
      var derniere = Math.max.apply(null, ((scene.config || {}).gestes || []).filter(function (x) { return x.meca === 'liste'; }).map(function (x) { return x.avant || 0; }).concat([g.avant || 0]));
      var recit = scene.recit;
      if (!recit || L.veille) return;
      L.veille = setInterval(function () {
        if (scene.recit !== recit || !scene.classList.contains('active')) { clearInterval(L.veille); return; }
        if (recit.i > derniere || recit.fini) {
          clearInterval(L.veille);
          Object.keys(scene.listesGeste || {}).forEach(function (c2) {
            var X = scene.listesGeste[c2];
            anime(calme ? 200 : 900, function (t) { X.parent.style.opacity = (1 - t).toFixed(3); });
          });
        }
      }, 300);
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- verser
  /* 6.8 : le thé tiré de haut. Le doigt se pose sur la théière, juste au-dessus de la tasse de cuivre
     (au milieu de la hauteur, au-dessus du panneau), et monte : la théière monte avec lui et le filet
     (lait, épices, thé : beige doré, mousseux) s'allonge jusqu'à la tasse, jusqu'à 700 unités, « à
     hauteur d'épaule » ; tant qu'on tient, le thé coule, la tasse se remplit et mousse ; le son suit la
     longueur du filet (`the`, de plus en plus aigu). Réglages à ajuster avec la photo de Karl : `bec`,
     `tasse` (x, y du bord), `filet`. Toucher simple, Entrée : un versement joué (2 s). Mouvement
     réduit : le filet paraît, la tasse se remplit en fondu. */
  Mecaniques.verser = function (scene, g) {
    var tasse = g.tasse || [600, 930], bec = g.bec || [650, 800], max = g.filet || 700;
    var haut = 0, rempli = 0, versant = false, auto = false, auFinal = null, finiV = false, dernierSon = 0;
    var ge = Geste(scene, g, {
      cible: [bec[0], bec[1], 120], sansHalo: true, yConsigne: 1170, clavier: undefined,
      jouer: function () { auto = true; return new Promise(function (ok) { auFinal = ok; }); }
    });
    var calqueV = G.coucheSous(scene, 'verser-calque', true), defs = svgEl('defs', {}, calqueV);
    var idc = G.suivant('cuivre'), lg = svgEl('linearGradient', { id: idc, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [['0', '#6a3413'], ['0.35', '#d9894a'], ['0.55', '#f6c08a'], ['0.8', '#a8551f'], ['1', '#5a2a0f']].forEach(function (s) { svgEl('stop', { offset: s[0], 'stop-color': s[1] }, lg); });
    var idt = G.suivant('the'), lt = svgEl('linearGradient', { id: idt, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [['0', '#b98a52'], ['0.5', '#ecd3a4'], ['1', '#b98a52']].forEach(function (s) { svgEl('stop', { offset: s[0], 'stop-color': s[1] }, lt); });
    // la tasse de cuivre, son contenu qui monte, sa mousse
    var T = svgEl('g', {}, calqueV), rx = 150, ry = 38;
    svgEl('ellipse', { cx: tasse[0], cy: tasse[1] + 160, rx: 190, ry: 26, fill: '#000', opacity: 0.3 }, T);
    svgEl('path', { d: 'M' + (tasse[0] - rx) + ',' + tasse[1] + 'C' + (tasse[0] - rx + 6) + ',' + (tasse[1] + 110) + ' ' + (tasse[0] - 80) + ',' + (tasse[1] + 150) + ' ' + tasse[0] + ',' + (tasse[1] + 150) +
      'C' + (tasse[0] + 80) + ',' + (tasse[1] + 150) + ' ' + (tasse[0] + rx - 6) + ',' + (tasse[1] + 110) + ' ' + (tasse[0] + rx) + ',' + tasse[1] + 'Z', fill: 'url(#' + idc + ')' }, T);
    svgEl('ellipse', { cx: tasse[0], cy: tasse[1], rx: rx, ry: ry, fill: '#3a1a08' }, T);
    var niveau = svgEl('ellipse', { cx: tasse[0], cy: tasse[1] + 30, rx: rx * 0.7, ry: ry * 0.7, fill: '#c89a62', opacity: 0 }, T);
    var mousse = svgEl('g', { opacity: 0 }, T), rnd = hasard(83);
    for (var i = 0; i < 18; i++) {
      var a = rnd() * 6.28, rr = Math.sqrt(rnd()) * 0.85;
      svgEl('circle', { cx: f1(tasse[0] + Math.cos(a) * rx * rr * 0.9), cy: f1(tasse[1] + Math.sin(a) * ry * rr * 0.8), r: f1(4 + rnd() * 7), fill: '#f6e6c8', opacity: 0.9 }, mousse);
    }
    svgEl('ellipse', { cx: tasse[0], cy: tasse[1], rx: rx, ry: ry, fill: 'none', stroke: '#f3c38e', 'stroke-width': 5 }, T);
    // le filet, puis la théière (le bec en `bec`)
    var filet = svgEl('path', { fill: 'none', stroke: 'url(#' + idt + ')', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0 }, calqueV);
    var filetClair = svgEl('path', { fill: 'none', stroke: '#fff4de', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-dasharray': '12 22', opacity: 0 }, calqueV);
    var th = svgEl('g', {}, calqueV);
    svgEl('path', { d: 'M-8,-6C-40,-40 -70,-60 -118,-62L-128,-40C-86,-36 -54,-18 -22,10Z', fill: 'url(#' + idc + ')', stroke: '#4a2410', 'stroke-width': 3 }, th);   // le bec
    svgEl('ellipse', { cx: -190, cy: -60, rx: 92, ry: 78, fill: 'url(#' + idc + ')', stroke: '#4a2410', 'stroke-width': 3 }, th);                                  // la panse
    svgEl('path', { d: 'M-250,-120C-240,-150 -140,-150 -130,-120Z', fill: '#8a4a1c', stroke: '#4a2410', 'stroke-width': 3 }, th);                                   // le couvercle
    svgEl('circle', { cx: -190, cy: -150, r: 10, fill: '#d9894a' }, th);
    svgEl('path', { d: 'M-276,-90C-330,-90 -330,-20 -272,-24', fill: 'none', stroke: '#6a3413', 'stroke-width': 14, 'stroke-linecap': 'round' }, th);              // l'anse
    function dessiner(t) {
      var yb = bec[1] - haut, xb = bec[0] + haut * 0.04;
      th.setAttribute('transform', 'translate(' + f1(xb) + ' ' + f1(yb) + ') rotate(' + f1(-8 + 14 * (versant ? 1 : 0)) + ')');
      var surface = tasse[1] + 26 - 28 * rempli;
      if (versant && haut > 30) {
        var ond = Math.sin(t / 90) * 4, cxb = xb + 6, milieu = (yb + surface) / 2;
        var d = 'M' + f1(cxb) + ',' + f1(yb + 4) + 'C' + f1(cxb + 10 + ond) + ',' + f1(milieu - 40) + ' ' + f1(tasse[0] + 20 - ond) + ',' + f1(milieu + 40) + ' ' + f1(tasse[0] + 18) + ',' + f1(surface);
        filet.setAttribute('d', d); filetClair.setAttribute('d', d);
        filet.setAttribute('opacity', 0.95); filetClair.setAttribute('opacity', 0.7);
        filet.setAttribute('stroke-width', f1(10 - 4 * haut / max));
        filetClair.setAttribute('stroke-dashoffset', f1(-t / 6));
      } else { filet.setAttribute('opacity', 0); filetClair.setAttribute('opacity', 0); }
      niveau.setAttribute('opacity', rempli > 0.02 ? 1 : 0);
      niveau.setAttribute('cy', f1(surface)); niveau.setAttribute('rx', f1(rx * (0.72 + 0.26 * rempli))); niveau.setAttribute('ry', f1(ry * (0.72 + 0.26 * rempli)));
      mousse.setAttribute('opacity', (Math.max(0, rempli - 0.3) / 0.7).toFixed(3));
      mousse.setAttribute('transform', 'translate(0 ' + f1(surface - tasse[1] - 4) + ')');
    }
    var y0 = null, h0 = 0, tenu = false;
    G.tenue(ge, scene, {
      debut: function (q) { tenu = true; y0 = q ? q.y : null; h0 = haut; },
      bouge: function (q) { if (y0 !== null) haut = Math.max(0, Math.min(max, h0 + (y0 - q.y))); },
      fin: function (toucher) { tenu = false; y0 = null; if (toucher) ge.jouer(); }
    });
    var tAuto = 0;
    ge.boucle(function (t, dt) {
      if (finiV) return false;
      if (auto) {
        tAuto += dt;
        haut = Math.min(max * 0.8, haut + dt * (calme ? 3 : 0.75));
      } else if (tenu && y0 === null) haut = Math.min(max * 0.8, haut + dt * 0.6);   // Espace maintenue
      else if (!tenu) haut = Math.max(0, haut - dt * 0.25);
      versant = (tenu || auto) && haut > 30;
      if (versant) {
        rempli = Math.min(1, rempli + dt / (calme ? 500 : 1700) * (0.6 + 0.4 * haut / max));
        if (t - dernierSon > 650) { Son.effet('the', { force: 0.35 + 0.65 * haut / max }); dernierSon = t; }
      }
      if (calme) { haut = versant ? max * 0.6 : haut; }
      dessiner(t);
      ge.progres(rempli);
      if (rempli >= 1) {
        finiV = true; versant = false; dessiner(t);
        var h1 = haut;
        anime(calme ? 150 : 600, function (x) { haut = h1 * (1 - lisse(x)); dessiner(0); }).then(function () {
          if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
        });
        return false;
      }
    });
    dessiner(0);
    if (calme) calqueV.style.opacity = '1';
    else anime(600, function (x) { calqueV.style.opacity = x.toFixed(3); });
    return ge.fait;
  };

  // ---------------------------------------------------------------- attendre
  /* 6.11 : rien à faire. La consigne paraît aussitôt ; pendant `duree` (10 s), l'horloge de
     l'appartement bat ses coups ; l'écran se partage (l'effet `partage`, `partage` [gauche, droite] :
     le ciel de l'appel, la main de Julie), l'étoile à part du carnet en haut à gauche (`etoile="pere"` :
     un anneau d'or, sans éclat) ; la moitié droite bat doucement au cœur de Julie, pour qui n'entend
     pas l'horloge ; un toucher ne fait qu'une ride et ne remet rien à zéro. Pas de fil qui se remplit.
     « Continuer » paraît après `passer` (3 s) ; `presser` : il ne coupe pas l'attente, il presse les
     secondes qui restent (1,5 s ; l'horloge accélère : couche `horloge` avec `presser`). Entrée vaut
     « Continuer », après 3 s. À la fin, le partage s'efface sans se fendre (0,8 s). Mouvement réduit :
     le partage paraît et disparaît en fondu, sans pulsation. */
  Mecaniques.attendre = function (scene, g) {
    var duree = g.duree || 3000, passer = g.passer !== undefined ? g.passer : 3000, presser = g.presser !== false;
    var t0 = G.maintenant(), fin = t0 + duree, pret = false, presse = false, finiA = false;
    var ge = Geste(scene, g, {
      sansHalo: true, consigneTout: true, sansBouton: true, yConsigne: 1180,
      clavier: function (ev) { if (!toucheValide(ev)) return; if (ev.cancelable) ev.preventDefault(); if (pret) continuer(); },
      jouer: function () { continuer(); return new Promise(function (ok) { attente.push(ok); }); }
    });
    var attente = [];
    if (g.partage) jouerEffet(scene, { nom: 'partage', gauche: g.partage[0], droite: g.partage[1], actif: 'les deux', arete: 'nuit', attente: true });
    var calqueA = G.coucheDessus(scene, 'attente-calque');
    if (g.etoile === 'pere') {
      var e = svgEl('g', { transform: 'translate(170 250)', opacity: 0 }, calqueA);
      svgEl('circle', { r: 30, fill: 'none', stroke: OR, 'stroke-width': 4, opacity: 0.85 }, e);
      svgEl('circle', { r: 3.5, fill: OR, opacity: 0.35 }, e);
      anime(calme ? 200 : 1600, function (t) { e.setAttribute('opacity', t.toFixed(3)); });
    }
    // la moitié de Julie bat à son cœur (autour de 64, irrégulier)
    var pouls = g.partage && !calme ? el('div', { 'class': 'pouls-attente' }, G.coucheSous(scene, 'pouls-calque')) : null;
    var prochain = t0 + 400, battu = -1e9;
    var bouton = boutonFaireLeGeste(scene, continuer, { texte: ui('continuer'), nom: g.consigne, delai: passer });
    ge.apres(function () { pret = true; }, passer);
    function continuer() {
      if (!pret || presse || finiA) return;
      presse = true;
      bouton.retirer();
      var reste = fin - G.maintenant(), presseEn = presser ? Math.min(reste, 1500) : 0;
      fin = G.maintenant() + Math.max(0, presseEn);
      if (presser && reste > 0) jouerEffet(scene, { nom: 'couche', couche: 'horloge', oui: true, proche: true, presser: presseEn });
    }
    G.doigts(ge, scene, { haut: function (q) { G.onde(calqueA, q.x, q.y, { couleur: G.aide(scene), r1: 90, opacite: 0.5, duree: 900 }); } });
    ge.boucle(function (t) {
      if (finiA) return false;
      var u = G.maintenant();
      if (pouls) {
        var accel = presse ? 3 : 1;
        if (u >= prochain) { battu = u; prochain = u + (60000 / 64) * (0.75 + Math.random() * 0.55) / accel; }
        var x = (u - battu) / 380;
        pouls.style.opacity = x < 1 ? (0.16 * Math.sin(Math.PI * x)).toFixed(3) : '0';
      }
      ge.progres(Math.min(1, (u - t0) / duree));
      if (u >= fin) {
        finiA = true;
        bouton.retirer();
        if (g.partage) jouerEffet(scene, { nom: 'partage', fin: true, duree: 800 });
        anime(calme ? 200 : 800, function (x2) { calqueA.style.opacity = (1 - x2).toFixed(3); if (pouls) pouls.parentNode.style.opacity = (1 - x2).toFixed(3); })
          .then(function () {
            retirer(calqueA); if (pouls) retirer(pouls.parentNode);
            attente.forEach(function (f) { f(); });
            ge.terminer();
          });
        return false;
      }
      void t;
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- portes
  /* 6.12 : chaque toucher fait naître une porte là où tombe le doigt (ramenée dans la `zone`, de
     `taille` 360 x 600) : un cadre d'encre saigne sur la photo (0,3 s), ses battants s'ouvrent
     (0,3 s) sur le paysage suivant (`images`, les plans de la page), restent ouverts de moins en moins
     longtemps (`accelere` : 1,2 ; 1 ; 0,8 ; 0,7 ; 0,6 ; 0,5 s), puis claquent ; le cadre reste en
     cicatrice (classe « cicatrice-porte », que l'effet `effacement` fonce) ; une étincelle part vers
     « Carnet » et s'éteint à mi-chemin. Les portes se chevauchent si l'on va vite. Entrée et « Faire le
     geste » : les portes naissent en spirale autour du centre, de plus en plus vite. Mouvement réduit :
     chaque paysage paraît 1 s dans un cadre déjà ouvert. */
  var OUVERTES = [1200, 1000, 800, 700, 600, 500];
  Mecaniques.portes = function (scene, g) {
    var images = g.images || [], taille = g.taille || [360, 600], z = g.zone || [60, 60, 1140, 1040];
    var n = images.length || 6, k = 0, finies = 0, finiP = false, rnd = hasard(47);
    var zc = [(z[0] + z[2]) / 2, (z[1] + z[3]) / 2];
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 1150,
      clavier: function (ev) { if (!toucheValide(ev)) return; if (ev.cancelable) ev.preventDefault(); ouvrir(spirale(k)); },
      jouer: function () {
        var suite = Promise.resolve();
        for (var i = k; i < n; i++) suite = suite.then(function () { ouvrir(spirale(k), true); return attendreVraiment(calme ? 150 : Math.max(250, 700 - 90 * k)); });
        return suite.then(function () { return tout; });
      }
    });
    var tout = null, toutFini = null;
    tout = new Promise(function (ok) { toutFini = ok; });
    var calqueP = G.coucheSous(scene, 'portes-calque', true), defs = svgEl('defs', {}, calqueP), idf = G.suivant('encre');
    var fe = svgEl('filter', { id: idf, x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    svgEl('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.035', numOctaves: 2, seed: 9, result: 'b' }, fe);
    svgEl('feDisplacementMap', { 'in': 'SourceGraphic', in2: 'b', scale: 10 }, fe);
    function spirale(i) { var a = i * 2.4, r = 40 + 95 * i; return { x: zc[0] + Math.cos(a) * r, y: zc[1] + Math.sin(a) * r * 0.6 }; }
    // un montant d'encre : une bande aux bords irréguliers, de (x1, y1) à (x2, y2)
    function montant(parent, x1, y1, x2, y2, ep) {
      var L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, vx = -uy, vy = ux, cote1 = [], cote2 = [], m = 10;
      for (var i = 0; i <= m; i++) {
        var t = i / m, e = ep * (0.75 + 0.5 * rnd()) / 2, x = x1 + ux * L * t, y = y1 + uy * L * t;
        cote1.push([x + vx * e, y + vy * e]); cote2.unshift([x - vx * e, y - vy * e]);
      }
      return svgEl('path', { d: G.courbe(cote1.concat(cote2), true), fill: ENCRE }, parent);
    }
    function etincelleCarnet(cx, cy) {
      var b = $('.barre .carnet-bouton', scene), vers = b && !b.hidden ? G.centreDe(b, scene) : [1100, 60];
      G.etincelle(calqueP, [cx, cy - taille[1] / 2], vers || [1100, 60], { jusqua: 0.5, duree: 900 });
    }
    function ouvrir(q, auto) {
      if (k >= n || finiP) return;
      var i = k++, nom = images[i], L = taille[0], Hh = taille[1];
      var cx = Math.max(z[0] + L / 2, Math.min(z[2] - L / 2, q.x)), cy = Math.max(z[1] + Hh / 2, Math.min(z[3] - Hh / 2, q.y));
      var x0 = cx - L / 2, y0 = cy - Hh / 2, id = G.suivant('porte');
      var gP = svgEl('g', { 'class': 'porte-encre' }, calqueP);
      var clip = svgEl('clipPath', { id: id + 'c' }, defs);
      svgEl('rect', { x: x0, y: y0, width: L, height: Hh }, clip);
      var paysage = G.image(gP, G.chemin(scene, nom) || G.source(G.plan(scene, i + 1)), { x: x0, y: y0, width: L, height: Hh, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#' + id + 'c)', opacity: 0 });
      var gauche = svgEl('rect', { x: x0, y: y0, width: L / 2, height: Hh, fill: '#141629' }, gP);
      var droite = svgEl('rect', { x: cx, y: y0, width: L / 2, height: Hh, fill: '#101223' }, gP);
      var cadre = svgEl('g', { filter: 'url(#' + idf + ')', 'class': 'cadre-encre' }, gP);
      montant(cadre, x0 - 8, y0 + Hh + 10, x0 - 6, y0 - 8, 30);
      montant(cadre, x0 + L + 8, y0 + Hh + 10, x0 + L + 6, y0 - 8, 30);
      montant(cadre, x0 - 30, y0 - 12, x0 + L + 30, y0 - 16, 36);
      // le cadre saigne depuis le point touché
      var mq = svgEl('mask', { id: id + 'm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
      var tache = svgEl('circle', { cx: f1(q.x), cy: f1(q.y), r: 0, fill: '#fff', filter: 'url(#' + idf + ')' }, mq);
      gP.setAttribute('mask', 'url(#' + id + 'm)');
      var rMax = Math.hypot(L, Hh) + 60, ouverte = OUVERTES[Math.min(i, OUVERTES.length - 1)] * (g.accelere === false ? 1.2 / 1.2 : 1);
      ge.progres(k / n);
      etincelleCarnet(cx, cy);
      var suite;
      if (calme) {
        tache.setAttribute('r', f1(rMax));
        gauche.setAttribute('width', 0); droite.setAttribute('width', 0); droite.setAttribute('x', x0 + L);
        paysage.setAttribute('opacity', 1);
        Son.effet('paysage-' + nom);
        suite = attendreVraiment(1000).then(function () {
          return anime(250, function (t) { paysage.setAttribute('opacity', (1 - t).toFixed(3)); });
        });
      } else {
        suite = anime(300, function (t) { tache.setAttribute('r', f1(rMax * vif(t))); }).then(function () {
          paysage.setAttribute('opacity', 1);
          Son.effet('paysage-' + nom);
          return anime(300, function (t) {
            var e = vif(t), w = L / 2 * (1 - 0.92 * e);
            gauche.setAttribute('width', f1(w)); droite.setAttribute('width', f1(w)); droite.setAttribute('x', f1(x0 + L - w));
            gauche.setAttribute('opacity', (1 - 0.35 * e).toFixed(3)); droite.setAttribute('opacity', (1 - 0.35 * e).toFixed(3));
          });
        }).then(function () { return attendreVraiment(ouverte); }).then(function () {
          return anime(120, function (t) {
            var w = L / 2 * (0.08 + 0.92 * t * t);
            gauche.setAttribute('width', f1(w)); droite.setAttribute('width', f1(w)); droite.setAttribute('x', f1(x0 + L - w));
            gauche.setAttribute('opacity', 1); droite.setAttribute('opacity', 1);
          });
        }).then(function () {
          Son.effet('claque');
          paysage.setAttribute('opacity', 0);
          return anime(700, function (t) { gauche.setAttribute('opacity', (1 - 0.88 * t).toFixed(3)); droite.setAttribute('opacity', (1 - 0.88 * t).toFixed(3)); });
        });
      }
      suite.then(function () {
        gP.classList.add('cicatrice-porte');
        finies++;
        if (finies >= n) { finiP = true; toutFini(); if (!auto && !ge.enJeu()) ge.terminer(); }
      });
    }
    G.doigts(ge, scene, { haut: function (q, ev) { if (!auto0()) ouvrir(q); void ev; } });
    function auto0() { return ge.enJeu(); }
    return ge.fait;
  };

  // ---------------------------------------------------------------- main
  /* 6.13 : un reflet chaud respire sur la main de Julie ; au toucher, rien pendant 0,5 s (« Elle reste
     immobile » : l'effet `decor` du geste, avec son `delai`, fait ensuite quitter la main) ; sous le
     doigt, la chaleur vire au bleu et s'éteint (1 s). Toujours le même résultat, ni échec ni reprise.
     Entrée. Mouvement réduit : des fondus. */
  Mecaniques.main = function (scene, g) {
    var c = g.cible || [600, 760, 170];
    var ge = Geste(scene, g, { cible: c, sansHalo: true, yConsigne: Math.min(1480, c[1] + c[2] + 90), jouer: function () { return prendre({ x: c[0], y: c[1] }); } });
    var calqueM = G.coucheSous(scene, 'main-julie-calque', true), idg = G.suivant('reflet');
    var rg = svgEl('radialGradient', { id: idg }, svgEl('defs', {}, calqueM));
    var s0 = svgEl('stop', { offset: '0', 'stop-color': '#ffc27a', 'stop-opacity': '0.7' }, rg);
    var s1 = svgEl('stop', { offset: '1', 'stop-color': '#ff9f4a', 'stop-opacity': '0' }, rg);
    var reflet = svgEl('circle', { cx: c[0], cy: c[1], r: c[2] * 1.3, fill: 'url(#' + idg + ')', opacity: 0.4 }, calqueM);
    var pris = false;
    ge.boucle(function (t) { if (pris) return false; reflet.setAttribute('opacity', calme ? 0.4 : (0.28 + 0.2 * Math.sin(t / 380)).toFixed(3)); });
    function prendre(q) {
      if (pris) return Promise.resolve();
      pris = true;
      reflet.setAttribute('cx', f1(q.x)); reflet.setAttribute('cy', f1(q.y)); reflet.setAttribute('r', f1(c[2] * 1.1));
      reflet.setAttribute('opacity', 0.7);
      // la main reste immobile une demi-seconde, puis se retire ; sous le doigt, la chaleur vire au bleu
      setTimeout(function () { Son.effet('tissu'); }, 500);
      attendreVraiment(500).then(function () {
        return anime(calme ? 200 : 500, function (t) {
          s0.setAttribute('stop-color', t < 0.5 ? '#ffc27a' : '#9fc0e8');
          s1.setAttribute('stop-color', t < 0.5 ? '#ff9f4a' : '#6f93c4');
          reflet.setAttribute('opacity', (0.7 - 0.2 * t).toFixed(3));
        });
      }).then(function () { return anime(calme ? 200 : 500, function (t) { reflet.setAttribute('opacity', (0.5 * (1 - t)).toFixed(3)); }); })
        .then(function () { retirer(calqueM); });
      return attendreVraiment(40);
    }
    G.doigts(ge, scene, { haut: function (q) { ge.avalerClic(); prendre(q); ge.terminer(); } });
    return ge.fait;
  };

  // ---------------------------------------------------------------- ecrire
  /* 7.7 : tant que le doigt appuie sur la feuille, n'importe où, la plume avance sur la ligne en cours
     (environ dix caractères par seconde) : l'écriture penchée est révélée derrière une pointe de plume,
     et c'est le texte réel du livre, dans la page, qui paraît lettre après lettre (lu, et lisible sans
     script) ; lever le doigt suspend la plume, sans rien perdre ; la ligne finie, la suivante attend le
     doigt ; `lignes` lignes (les temps qui suivent le geste). Chaque ligne écrite est un temps lu :
     ses effets jouent (le carnet qui vacille, la déclaration qui rejoint le sac) et la lettre reste
     entière sur la feuille. Un toucher, Entrée : la ligne s'écrit seule (1,5 s) ; « Faire le geste »
     écrit tout ce qui reste. Mouvement réduit : chaque ligne paraît en fondu. */
  Mecaniques.ecrire = function (scene, g) {
    var recit = scene.recit, j0 = g.avant || 0, n = g.lignes || 5, ligne = 0, auFinal = null, finiE = false;
    var temps = recit ? recit.temps.slice(j0, j0 + n) : $$('.texte .lettre-ligne .temps', scene).slice(0, n);
    n = temps.length;
    if (recit) recit.garder = true;   // la lettre reste entière sur la feuille
    var ecrit = 0, auto = false, vitesse = 10, tenu = false, pause = 0, dernierSon = 0, resteAuto = false;
    var ge = Geste(scene, g, {
      sansHalo: true, clavier: false, yConsigne: 1650,
      jouer: function () { resteAuto = true; auto = true; return new Promise(function (ok) { auFinal = ok; }); }
    });
    // la plume : une pointe d'acier et sa goutte d'encre
    var plume = svgEl('g', { 'class': 'plume-geste', opacity: 0 }, ge.calque);
    svgEl('path', { d: 'M0,0L18,-52L26,-50L8,2Z', fill: '#2a2d33' }, plume);
    svgEl('path', { d: 'M18,-52L60,-170L70,-166L26,-50Z', fill: '#7a5a2a' }, plume);
    svgEl('circle', { cx: 2, cy: 0, r: 3.5, fill: '#1a0f06' }, plume);
    var lettres = null;
    function preparerLigne() {
      var t = temps[ligne];
      if (!t) return;
      var texte = t.textContent;
      t.textContent = '';
      lettres = [];
      for (var i = 0; i < texte.length; i++) { var s = el('span', { 'class': 'lettre-plume' }, t); s.textContent = texte.charAt(i); lettres.push(s); }
      t.texteEntier = texte;
      t.classList.add('vu', 'en-ecriture');
      t.setAttribute('aria-hidden', 'true');
      ecrit = 0;
      if (calme) { lettres.forEach(function (s) { s.classList.add('ecrite'); }); }
    }
    function placerPlume() {
      var s = lettres && lettres[Math.max(0, Math.min(lettres.length - 1, Math.floor(ecrit) - 1))];
      var q = s ? G.centreDe(s, scene, ecrit < 1 ? 0 : 1, 0.82) : null;
      if (!q) { plume.setAttribute('opacity', 0); return; }
      plume.setAttribute('transform', 'translate(' + f1(q[0]) + ' ' + f1(q[1]) + ') rotate(' + f1(-8 + Math.sin(G.maintenant() / 70) * 3) + ')');
      plume.setAttribute('opacity', calme ? 0 : 1);
    }
    function ligneFinie() {
      var t = temps[ligne], j = j0 + ligne;
      t.textContent = t.texteEntier;   // le texte redevient un seul fil (sa typographie entière)
      t.classList.remove('en-ecriture');
      t.removeAttribute('aria-hidden');
      var lu = +t.getAttribute('data-lu') || 0;
      if (lu > Lecture.max) Lecture.max = lu;
      annoncer(t.textContent);
      ligne++;
      pause = 0;
      ge.progres(ligne / n);
      if (recit) { recit.i = j; try { Promise.resolve(recit.surTemps(j, t)).then(null, signaler); } catch (e) { signaler(e); } }
      if (ligne >= n) { finir(); return; }
      if (!resteAuto) auto = false;
      preparerLigne();
    }
    function finir() {
      if (finiE) return;
      finiE = true;
      plume.setAttribute('opacity', 0);
      if (auFinal) { var f = auFinal; auFinal = null; f(); } else ge.terminer();
    }
    preparerLigne();
    if (!n) { ge.apres(function () { ge.terminer(); }, 50); return ge.fait; }
    G.tenue(ge, scene, {
      debut: function () { tenu = true; },
      fin: function (toucher) { tenu = false; if (toucher && !auto) auto = true; }
    });
    // Entrée : la ligne s'écrit seule (la tenue gère Entrée comme « jouer » : on la reprend ici)
    ge.ecouter(doc, 'keydown', function (ev) {
      if (ev.key !== 'Enter' || ge.fini() || bloque() || !scene.classList.contains('active')) return;
      if (!ge.enJeu()) { ev.stopImmediatePropagation(); if (ev.cancelable) ev.preventDefault(); auto = true; }
    }, true);
    ge.boucle(function (t, dt) {
      if (finiE) return false;
      if (!lettres) return;
      var lg = lettres.length;
      var enMarche = auto || tenu;
      if (tenu && !auto && ecrit === 0 && pause < 350 && ligne > 0) { pause += dt; enMarche = false; }   // la ligne suivante attend le doigt
      if (enMarche) {
        var v = auto ? (resteAuto ? Math.max(lg / 0.8, 30) : Math.max(lg / 1.5, 14)) : vitesse;
        ecrit = Math.min(lg, ecrit + dt / 1000 * (calme ? lg * 3 : v));
        for (var i = 0; i < Math.floor(ecrit); i++) lettres[i].classList.add('ecrite');
        if (!calme && t - dernierSon > 280) { Son.effet('plume', { force: 0.5 }); dernierSon = t; }
      }
      placerPlume();
      if (!enMarche) plume.setAttribute('opacity', calme ? 0 : 0.55);
      if (ecrit >= lg) { lettres.forEach(function (s) { s.classList.add('ecrite'); }); ligneFinie(); }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- effacer
  /* 7.7 : frotter les lignes de haut en bas : le papier s'use sous le doigt (une auréole claire, des
     fibres qui se lèvent), l'encre ne bouge pas, elle fonce même, à peine ; après 1,5 s de frottement,
     la phrase paraît (le temps qui suit) : un geste impossible. Un toucher, Entrée : un frottement joué.
     Mouvement réduit : une auréole qui paraît et s'efface. */
  Mecaniques.effacer = function (scene, g) {
    var frotte = 0, requis = 1500, finiF = false, auFinal = null, dernierSon = 0, rnd = hasard(17);
    var ge = Geste(scene, g, {
      sansHalo: true, yConsigne: 1650,
      jouer: function () {
        return new Promise(function (ok) {
          auFinal = ok;
          var t0 = null;
          ge.boucle(function (t) {
            if (finiF) return false;
            if (t0 === null) t0 = t;
            var s = (t - t0) / (calme ? 300 : 1000);
            user({ x: 560 + Math.sin(s * 5) * 30, y: 720 + ((s * 900) % 700) }, true);
            frotte = Math.max(frotte, s * requis);
            if (s >= 1) { finir(); return false; }
          });
        });
      }
    });
    var calqueF = G.coucheSous(scene, 'user-calque', true), idg = G.suivant('aureole');
    var rg = svgEl('radialGradient', { id: idg }, svgEl('defs', {}, calqueF));
    svgEl('stop', { offset: '0', 'stop-color': '#fffaf0', 'stop-opacity': '0.55' }, rg);
    svgEl('stop', { offset: '1', 'stop-color': '#fffaf0', 'stop-opacity': '0' }, rg);
    var texte = $('.texte', scene);
    var dernier = null;
    function user(q, auto) {
      if (dernier && Math.hypot(q.x - dernier.x, q.y - dernier.y) < 14) return;
      dernier = q;
      svgEl('ellipse', { cx: f1(q.x), cy: f1(q.y), rx: 58, ry: 70, fill: 'url(#' + idg + ')', opacity: calme ? 0.6 : 0.5 }, calqueF);
      if (!calme && rnd() < 0.35) {
        var a = rnd() * 6.28, l = 10 + rnd() * 16;
        svgEl('path', { d: 'M' + f1(q.x) + ',' + f1(q.y) + 'q' + f1(Math.cos(a) * l) + ',' + f1(Math.sin(a) * l - 6) + ' ' + f1(Math.cos(a) * l * 1.6) + ',' + f1(Math.sin(a) * l * 1.6),
          fill: 'none', stroke: '#fff8ea', 'stroke-width': 1.4, opacity: 0.8 }, calqueF);
      }
      if (texte) texte.classList.add('encre-foncee');
      var t = G.maintenant();
      if (t - dernierSon > 300 && !auto) { Son.effet('frottement', { force: 0.6 }); dernierSon = t; }
    }
    function finir() {
      if (finiF) return;
      finiF = true;
      if (calme) anime(600, function (t) { calqueF.style.opacity = (1 - t).toFixed(3); });
      if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
    }
    G.doigts(ge, scene, {
      bouge: function (q, ev, d, avant) {
        if (finiF) return;
        var dy = Math.abs(q.y - avant.y), dx = Math.abs(q.x - avant.x), t = G.maintenant(), dt = Math.min(60, t - (d.tAv || t));
        d.tAv = t;
        if (dy >= dx * 0.5 && d.vitesse > 30) {
          user(q);
          frotte += dt;
          ge.progres(frotte / requis);
          if (frotte >= requis) finir();
        }
      },
      haut: function (q, ev, d, toucher) { if (toucher) ge.jouer(); }
    });
    return ge.fait;
  };

  // ---------------------------------------------------------------- paume
  /* 7.13 : le doigt posé sur la jointure des battants (`cible`) et tenu `duree` (2,2 s) : la main d'or de
     3.11 monte du bas de la page et se pose, à plat ; rien ne s'allume ni ne s'ouvre ; aucune clé n'est
     proposée (`cle_absente`) ; au lâcher, ou le geste fait, la main s'efface sans marque. Le dernier
     geste du récit. Un toucher, Entrée : la main monte seule ; Espace maintenue. Mouvement réduit : la
     main paraît posée, puis s'efface. */
  Mecaniques.paume = function (scene, g) {
    var c = g.cible || [600, 1000, 170], duree = g.duree || 2200;
    var p = 0, tenu = false, auto = false, auFinal = null, finiP = false;
    var ge = Geste(scene, g, {
      cible: c, clavier: false, yConsigne: Math.min(1480, c[1] + c[2] + 110),
      jouer: function () { auto = true; return new Promise(function (ok) { auFinal = ok; }); }
    });
    if (g.cle_absente) Objets.retirerAction('cle');
    var calqueM = G.coucheSous(scene, 'main-calque', true), M = G.main(calqueM), basY = H + 420, poseY = c[1] + 130;
    function placer(x) { var e = lisse(x); M.poser(c[0], G.entre(basY, poseY, e), e); calqueM.style.opacity = calme ? (x > 0 ? 1 : 0) : Math.min(1, x * 4).toFixed(3); }
    placer(0);
    G.tenue(ge, scene, {
      debut: function () { tenu = true; ge.halo(false); },
      fin: function (toucher) { tenu = false; if (toucher) { ge.jouer(); return; } if (!finiP) ge.halo(true); }
    });
    ge.boucle(function (t, dt) {
      if (finiP) return false;
      if (tenu || auto) p = Math.min(1, p + dt / (calme ? 400 : duree));
      else p = Math.max(0, p - dt / 900);
      placer(calme ? (p > 0 ? 1 : 0) : p);
      ge.progres(p);
      if (p >= 1) {
        finiP = true;
        placer(1);
        // posée, à plat : rien ne réagit ; puis la main s'efface sans marque
        attendreVraiment(calme ? 500 : 900).then(function () {
          return anime(calme ? 300 : 1100, function (x) { calqueM.style.opacity = (1 - x).toFixed(3); });
        }).then(function () { retirer(calqueM); });
        if (auFinal) { var f = auFinal; auFinal = null; f(); } else { ge.avalerClic(); ge.terminer(); }
        return false;
      }
    });
    return ge.fait;
  };
})();

// ---------------------------------------------------------------- préparer, dès l'ouverture des pages
/* Certaines mécaniques posent dès l'ouverture de leur page ce qui attend le geste : les marchandises
   de 5.2 sur leurs étals, les paupières closes de 7.11 (la page s'ouvre les yeux fermés, comme 7.10
   s'est achevée). Mecaniques[nom].preparer(scene, g, cfg), appelée avant le départ de la lecture ;
   dans l'édition web, pour les 85 pages, sans rien charger avant qu'on y arrive. */
Mecaniques.glisser.preparer = function (scene, g) {
  if (!g.lever) return;
  Gestes.paupieres(scene, { teinte: 'couchant', ferme: true });
  scene.paupieresPreparees = true;
};
function preparerGestes() {
  $$('.scene').forEach(function (sc) {
    var b = $('script.config', sc), cfg;
    if (!b) return;
    try { cfg = JSON.parse(b.textContent); } catch (e) { return; }
    (cfg.gestes || []).forEach(function (g) {
      var m = Mecaniques[g.meca];
      if (m && typeof m.preparer === 'function') { try { m.preparer(sc, g, cfg); } catch (e) { signaler(e); } }
    });
  });
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', preparerGestes); else preparerGestes();
