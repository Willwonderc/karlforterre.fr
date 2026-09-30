// ---------------------------------------------------------------- effets : ce que fait une phrase
/* Effets[nom](scene, e) : ce qui arrive quand paraît un temps (moments, extra), à l'entrée d'une
   page (debut) ou après un geste (effets du geste). e vient de livre.py : { nom, … réglages }. Le
   cahier des charges est la partie 3.2 de la synthèse (docs/darshan-mise-en-scene/synthese.md) ;
   la mesure de chaque effet (durée, force, place sur l'image) vient du traitement de sa page.

   Le déroulé d'une liste d'effets (jouerEffets) :
   - sans `delai`, un effet part quand le précédent le permet (sa « suite », en général sa fin) ;
   - avec `delai`, il part ce nombre de millisecondes après le début de la liste (la parution du
     temps ; pour l'entrée d'une page, la fin de son balayage), sans attendre les précédents ;
   - le temps suivant attend la fin de tous (un effet long qui n'est qu'un fond, comme un fondu de
     vingt secondes ou une fumée de huit, rend la main plus tôt).
   Un effet rend rien, une promesse, ou { suite, fin } (deux promesses). Toute erreur est rattrapée.

   Les effets d'état font en direct ce que build.py calcule pour les pages suivantes (appliquer) :
   objets, portes, pere, boussole, compte, barre, voile, regard, magie. Ils appellent l'interface
   (Objets, Carnet, Compte) plutôt que de la refaire. Apple Books isole chaque page : ce qui dure
   d'une page à l'autre vient des attributs de la section ; les réglages `instant`, `deja`,
   `allumee`, `continu` refont à l'ouverture l'état où la page précédente s'arrête.

   Avec les mécaniques (mecaniques.js) : les effets `suit_geste` d'un geste sont joués dès son début,
   avec e.geste, un suivi : e.geste.suivre(f) appelle f(x, fini, etat) à chaque progrès (x de 0 à 1) ;
   une clé posée dans la serrure par un effet se déclare dans scene.cle = { tourner(degrés) } ; les
   cœurs (scene.coeur), les paupières (scene.paupieres), l'écran du téléphone (scene.galerie) et les
   dessins communs (Gestes) sont ceux des mécaniques. `attendre` (6.11) appelle l'effet `partage`.

   Rangs dans l'image (calques de .decor, qui suivent la caméra) : 1 photos posées sur les plans
   (reflets, embrasure, vidéo…), 2 teinte (le froid), 3 papier (l'effacement), 4 encre et dessins,
   5 lumières, 6 particules. Sous le texte sans suivre la caméra : l'écran partagé, les paupières,
   le lin. Au-dessus du texte : ce qui vole vers la barre (étoiles, clé, notification).
   Budget : une toile de particules par page, et au plus une autre à la fois (chaleur, reflet,
   ruban, pluie, buée) : jamais plus de deux toiles animées ensemble.
   Mouvement réduit (calme) : ni déplacement, ni zoom, ni tremblement, ni particule ; des fondus.
   Chaque animation, minuterie et écouteur s'arrête avec la page (l'édition web garde les 85 pages
   dans un seul document) ; une page rejouée repart d'une image nette. */

var Effets = {};

// Un effet : { fin, suite } (deux promesses). La fin est ce qu'attend le temps suivant ; la suite,
// ce qu'attend l'effet suivant de la même liste.
function jouerEffet(scene, e) {
  // une scène écrite à la main peut jouer un effet à sa façon (scene.effetsLocaux)
  var f = (scene.effetsLocaux && scene.effetsLocaux[e.nom]) || Effets[e.nom], r;
  if (!f) { signaler('effet inconnu : ' + e.nom); return Promise.resolve(); }
  try { r = f(scene, e); } catch (x) { signaler(x); return Promise.resolve(); }
  var double = r && typeof r === 'object' && !r.then && ('fin' in r || 'suite' in r);
  // aucun effet ne retient la lecture plus de quinze secondes, même en cas d'erreur
  var fin = Promise.race([Promise.resolve(double ? r.fin : r), attendreVraiment(15000)]).then(null, signaler);
  fin.suite = double && 'suite' in r ? Promise.resolve(r.suite).then(null, signaler) : fin;
  return fin;
}

function jouerEffets(scene, liste) {
  var fx = Fx.etat(scene), recit = scene.recit;
  var promesses = [Fx.nouveauTemps(scene)];
  // l'entrée d'une page : les délais comptent depuis la fin de son balayage
  var base = recit && recit.i < 0 ? quandEntree(scene) : Promise.resolve();
  var chaine = Promise.resolve();
  (liste || []).forEach(function (e) {
    if (e.delai) {
      promesses.push(base.then(function () { return attendreVraiment(e.delai); }).then(function () {
        return Fx.vivante(scene, fx) ? jouerEffet(scene, e) : null;
      }));
      return;
    }
    var fin = null;
    chaine = chaine.then(function () {
      if (!Fx.vivante(scene, fx)) return null;
      fin = jouerEffet(scene, e);
      promesses.push(fin);
      return fin.suite;
    });
  });
  promesses.push(chaine);
  // la chaîne a pu ajouter des promesses en route : on attend la chaîne, puis toutes
  return chaine.then(function () { return Promise.all(promesses); }).then(function () {});
}

var Fx = (function () {
  var DOSSIER = estEpub ? '../img/' : 'img/';

  // ================================================================ l'état de chaque page
  function neuf(recit) {
    return { recit: recit || null, calques: {}, taches: [], departs: [], surTemps: [],
      dernier: -2, plan: null, vitesse: 1 };
  }
  // L'état des effets d'une page ; une page rejouée (menu, chapitres) repart d'une image nette.
  function etat(scene) {
    var r = scene.recit || null;
    if (!scene.fx) scene.fx = neuf(r);
    else if (r && scene.fx.recit && scene.fx.recit !== r) { nettoyer(scene); scene.fx = neuf(r); }
    else if (r && !scene.fx.recit) scene.fx.recit = r;
    if (scene.fx.plan === null) scene.fx.plan = Math.max(0, planVisible(scene));
    return scene.fx;
  }
  function active(scene) { return scene.classList.contains('active'); }
  // La page joue encore cette lecture-ci : sinon, les animations s'arrêtent.
  function vivante(scene, fx) { return scene.fx === fx && active(scene); }
  function nettoyer(scene) {
    var fx = scene.fx;
    if (!fx) return;
    fx.taches.forEach(function (t) { t.arreter(); });
    fx.departs = [];
    $$('.fx', scene).forEach(retirer);
    $$('[class*="fx-"]', scene).forEach(function (n) {
      [].slice.call(n.classList).forEach(function (c) { if (c.indexOf('fx-') === 0) n.classList.remove(c); });
    });
    var d = $('.decor', scene);
    if (d) { d.style.transform = ''; d.style.transition = ''; d.style.transformOrigin = ''; }
    plans(scene).forEach(function (p) { p.style.filter = ''; p.style.transform = ''; p.style.transition = ''; p.style.opacity = ''; });
    ['partage', 'ruban'].forEach(function (k) { scene[k] = null; });
  }
  // Une animation image par image, arrêtée avec la page : pas(t, dt) rend false quand elle a fini.
  function tache(scene, pas) {
    var fx = etat(scene), vivant = true, t0 = null, avant = null;
    var t = { arreter: function () { vivant = false; } };
    fx.taches.push(t);
    function image(ms) {
      if (!vivant) return;
      if (!vivante(scene, fx)) { vivant = false; return; }
      if (t0 === null) { t0 = ms; avant = ms; }
      var dt = Math.min(0.05, (ms - avant) / 1000) * fx.vitesse;
      avant = ms;
      var r;
      try { r = pas((ms - t0) / 1000, dt); } catch (e) { signaler(e); r = false; }
      if (r === false) { vivant = false; return; }
      requestAnimationFrame(image);
    }
    requestAnimationFrame(image);
    return t;
  }
  // Une animation de `duree` ms (x de 0 à 1) ; rend une promesse tenue à la fin, ou à l'arrêt de
  // la page. En mouvement réduit, les durées ne changent pas ici : chaque effet décide.
  function animer(scene, duree, pas) {
    return new Promise(function (fin) {
      if (duree <= 0) { try { pas(1); } catch (e) { signaler(e); } fin(); return; }
      tache(scene, function (t) {
        var x = Math.min(1, t * 1000 / duree);
        pas(x);
        if (x >= 1) { fin(); return false; }
      });
      // la page quittée : la promesse est tenue quand même, pour ne rien retenir
      minuterie(scene, fin, duree + 400, true);
    });
  }
  // Une minuterie arrêtée avec la page ; toujours : appelée même si la page est quittée.
  function minuterie(scene, f, ms, toujours) {
    var fx = etat(scene), id = setTimeout(function () {
      if (toujours || vivante(scene, fx)) { try { f(); } catch (e) { signaler(e); } }
    }, ms);
    fx.taches.push({ arreter: function () { clearTimeout(id); if (toujours) { try { f(); } catch (e) { signaler(e); } } } });
    return id;
  }
  function pause(scene, ms) { return new Promise(function (ok) { minuterie(scene, ok, ms, true); }); }
  // Ce qu'il faut faire quand le lecteur quitte la page (édition web : la ballade s'efface…).
  var suivies = [], veille = null;
  function surDepart(scene, f) {
    var fx = etat(scene);
    fx.departs.push(f);
    if (suivies.indexOf(scene) < 0) suivies.push(scene);
    if (!veille) veille = setInterval(function () {
      suivies = suivies.filter(function (s) {
        if (active(s) && s.fx) return true;
        var l = s.fx ? s.fx.departs : [];
        if (s.fx) s.fx.departs = [];
        l.forEach(function (g) { try { g(); } catch (e) { signaler(e); } });
        return false;
      });
      if (!suivies.length) { clearInterval(veille); veille = null; }
    }, 500);
  }
  // À chaque temps nouveau : ce que les effets ont demandé pour les temps suivants (la voix écrite
  // lettre à lettre de tout un paragraphe, la lumière qui retombe au temps suivant…). Une demande
  // sert une fois ; `toujours` : à chaque temps, jusqu'à ce qu'elle rende false.
  function nouveauTemps(scene) {
    var fx = etat(scene), r = scene.recit;
    if (!r || r.i < 0 || r.i === fx.dernier) return Promise.resolve();
    fx.dernier = r.i;
    var t = r.temps[r.i], attentes = [], liste = fx.surTemps;
    fx.surTemps = [];
    liste.forEach(function (h) {
      var v;
      try { v = h.f(t, r.i); } catch (e) { signaler(e); return; }
      if (v && v.then) attentes.push(v.then(null, signaler));
      if (h.toujours && v !== false) fx.surTemps.push(h);
    });
    return Promise.all(attentes);
  }
  function surTemps(scene, f, toujours) { etat(scene).surTemps.push({ f: f, toujours: !!toujours }); }
  // Le temps en cours (celui que l'effet accompagne).
  function tempsCourant(scene) {
    var r = scene.recit;
    if (r && r.i >= 0) return r.temps[r.i];
    var vus = $$('.texte .temps.vu', scene);
    return vus[vus.length - 1] || null;
  }

  // ================================================================ unités, plans, images
  function px(scene, u) { var r = scene.getBoundingClientRect(); return u * (r.width || W) / W; }
  function pc(v, total) { return (v / total * 100).toFixed(3) + '%'; }
  function plans(scene) { return $$('.decor .plan', scene); }
  function planVisible(scene) {
    var l = plans(scene);
    for (var i = l.length - 1; i >= 0; i--) if (l[i].classList.contains('vu')) return i;
    return l.length ? 0 : -1;
  }
  function nomDuPlan(scene, i) { var c = scene.config || {}; return (c.decors || [])[i] || null; }
  function indexDuPlan(scene, nom) { var c = scene.config || {}; return (c.decors || []).indexOf(nom); }
  // Le fichier d'un décor (build.py le copie s'il est cité par la page) ; null s'il n'y est pas.
  function fichierDecor(nom) {
    var f = DONNEES.images && DONNEES.images[nom];
    return f && f.length ? DOSSIER + f[0] : null;
  }
  // L'image d'un plan de la page, ou d'un décor cité par un réglage.
  function sourceImage(scene, nom) {
    var i = indexDuPlan(scene, nom), p = i >= 0 ? plans(scene)[i] : null;
    if (p && p.tagName && p.tagName.toLowerCase() === 'img') return p.getAttribute('src') || p.getAttribute('data-src');
    return fichierDecor(nom);
  }
  function image(src, attrs, parent) {
    var i = el('img', attrs || {}, parent);
    i.setAttribute('alt', '');
    if (src) i.setAttribute('src', src);
    i.setAttribute('decoding', 'async');
    return i;
  }
  // Les décors qui ne sont pas des photos (dessins, encres, calques) : le froid, le gel et le
  // papier de l'effacement ne s'appliquent qu'aux photos. Le graffiti « aime » garde ses couleurs
  // (6.11). À remplacer par un attribut de build.py sur chaque plan (voir le rapport).
  var PAS_PHOTO = ['graffiti', 'fenetre', 'salon', 'placard', 'porte-pere', 'porte-pere-traits', 'porte-pere-rue',
    'porte-pere-rue-traits', 'toiles', 'velours', 'tableau-ladoga', 'tableau-barque', 'papier-lettre', 'local-nuit',
    'local-or', 'desert-nuit', 'desert-jour', 'noir', 'papier'];
  function estPhoto(scene, i) {
    var p = plans(scene)[i], g = p && p.getAttribute('data-genre');
    if (g) return g === 'photo' || g === 'prototype';
    var nom = nomDuPlan(scene, i);
    return !!nom && PAS_PHOTO.indexOf(nom) < 0;
  }

  // ================================================================ les calques
  function decor(scene) { return $('.decor', scene); }
  // Un calque de l'image (dans .decor : il suit la caméra), au rang z (voir l'en-tête).
  function calque(scene, nom, z, svg) {
    var fx = etat(scene), c = fx.calques[nom];
    if (c && c.parentNode) return c;
    var d = decor(scene) || scene;
    c = svg ? svgEl('svg', { 'class': 'fx fx-calque fx-' + nom, viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none',
      'aria-hidden': 'true', focusable: 'false' }) : el('div', { 'class': 'fx fx-calque fx-' + nom, 'aria-hidden': 'true' });
    c.style.zIndex = String(z || 4);
    d.appendChild(c);
    fx.calques[nom] = c;
    return c;
  }
  // Sous le texte, sans suivre la caméra : l'écran partagé, les paupières, le lin…
  function dessous(scene, nom, z, svg) {
    var fx = etat(scene), cle = 'dessous-' + nom, c = fx.calques[cle];
    if (c && c.parentNode) return c;
    var boite = fx.calques['dessous'];
    if (!boite || !boite.parentNode) {
      boite = el('div', { 'class': 'fx fx-dessous', 'aria-hidden': 'true' });
      var t = $('.texte', scene) || $('.titre-livre', scene);
      if (t && t.parentNode === scene) scene.insertBefore(boite, t); else scene.appendChild(boite);
      fx.calques['dessous'] = boite;
    }
    c = svg ? svgEl('svg', { 'class': 'fx fx-couche fx-' + nom, viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none',
      focusable: 'false' }) : el('div', { 'class': 'fx fx-couche fx-' + nom });
    c.style.zIndex = String(z || 1);
    boite.appendChild(c);
    fx.calques[cle] = c;
    return c;
  }
  // Au-dessus du texte : ce qui vole vers la barre.
  function dessus(scene, nom, z, svg) {
    var fx = etat(scene), cle = 'dessus-' + nom, c = fx.calques[cle];
    if (c && c.parentNode) return c;
    c = svg ? svgEl('svg', { 'class': 'fx fx-dessus fx-' + nom, viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none',
      'aria-hidden': 'true', focusable: 'false' }) : el('div', { 'class': 'fx fx-dessus fx-' + nom, 'aria-hidden': 'true' });
    c.style.zIndex = String(z || 12);
    scene.appendChild(c);
    fx.calques[cle] = c;
    return c;
  }
  // Un élément placé en unités de page (x, y, largeur, hauteur) dans un calque.
  function poser(e, x, y, l, h) {
    e.style.position = 'absolute';
    e.style.left = pc(x, W); e.style.top = pc(y, H);
    if (l !== undefined) e.style.width = pc(l, W);
    if (h !== undefined) e.style.height = pc(h, H);
    return e;
  }
  // Deux images d'avance pour qu'une transition CSS parte d'un état posé.
  function ensuite(f) { requestAnimationFrame(function () { requestAnimationFrame(f); }); }
  function copie(a, b) {
    var r = {}, k;
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) r[k] = a[k];
    for (k in b || {}) if (Object.prototype.hasOwnProperty.call(b, k)) r[k] = b[k];
    return r;
  }
  // Le point d'un bouton de la barre, en unités de page (même caché : on le mesure un instant).
  function pointBouton(scene, selecteur) {
    var b = $(selecteur, scene), r = scene.getBoundingClientRect();
    if (!b || !r.width) return [1080, 60];
    var cache = b.hidden;
    if (cache) { b.style.visibility = 'hidden'; b.hidden = false; }
    var q = b.getBoundingClientRect();
    if (cache) { b.hidden = true; b.style.visibility = ''; }
    if (!q.width) return [1080, 60];
    return [(q.left + q.width / 2 - r.left) * W / r.width, (q.top + q.height / 2 - r.top) * W / r.width];
  }
  function mondeJulie(scene) { return scene.classList.contains('monde-julie'); }
  // Un hasard reproductible (le même dessin à chaque lecture).
  function alea(graine) { return hasard(graine || 7); }
  function entre(r, a, b) { return a + r() * (b - a); }

  // ================================================================ le son (appels sûrs)
  function sonner(nom, o) { try { Son.effet(nom, o || {}); } catch (e) { signaler(e); } }
  function variantes(scene) {
    var r = {};
    (scene.getAttribute('data-son-variantes') || '').split(/\s+/).filter(Boolean).forEach(function (v) { r[v] = true; });
    return r;
  }
  function ambianceDeLaPage(scene) { return scene.getAttribute('data-son') || null; }
  // Le niveau de l'ambiance, sans toucher aux réglages du lecteur : son.js ne le sait pas encore
  // (voir le rapport) ; le moteur le demande s'il existe.
  function niveauAmbiance(v, ms) { try { if (Son.niveau) Son.niveau(v, ms); } catch (e) { signaler(e); } }
  // Les sons qu'on n'entend pas quand les effets sont coupés, ni le vibreur en mouvement réduit.
  function vibrer(motif) {
    if (calme || !navigator.vibrate || !Son.actif() || Son.volumes().effets <= 0) return;
    try { navigator.vibrate(motif); } catch (e) { /* rien */ }
  }


  // ================================================================ toiles, fichiers, envols, barre
  // Une toile dans un calque (rang z) de l'image, ou 'dessous' / 'dessus' le texte ; k : sa
  // définition (1 : 1200 × 1800 ; 0,5 suffit à ce qui est flou). Elle quitte la page avec le
  // lecteur, et sa mémoire avec elle.
  function toile(scene, nom, z, k, ou) {
    k = k || 1;
    var parent = ou === 'dessous' ? dessous(scene, nom, z) : ou === 'dessus' ? dessus(scene, nom, z) : calque(scene, nom, z);
    var c = parent.querySelector('canvas');
    if (!c) {
      c = el('canvas', { 'class': 'fx-toile', 'aria-hidden': 'true' }, parent);
      c.width = Math.round(W * k); c.height = Math.round(H * k);
      surDepart(scene, function () { c.width = 1; c.height = 1; retirer(parent); });
    }
    var x = c.getContext('2d');
    x.setTransform(k, 0, 0, k, 0, 0);
    return { el: c, x: x, k: k, calque: parent };
  }
  // Le fichier d'un calque que decors.py fabrique à côté d'un décor (CALQUES : fenetre-cadre,
  // toiles-couleur, placard-ouverte…) : build.py ne le copie pas encore (voir le rapport) ; s'il
  // manque, chaque effet a sa solution de repli.
  function fichierCalque(nom) { return fichierDecor(nom) || DOSSIER + 'decors/' + nom + '.webp'; }
  function chargerImage(src) {
    return new Promise(function (ok) {
      if (!src) { ok(null); return; }
      var i = new Image();
      i.onload = function () { ok(i.naturalWidth ? i : null); };
      i.onerror = function () { ok(null); };
      i.src = src;
    });
  }
  // Un dessin SVG de decors.py (l'esquisse de 2.10), lu pour être tracé trait par trait ; null si
  // la liseuse refuse de le lire.
  var svgs = {};
  function chargerSvg(url) {
    if (svgs[url]) return svgs[url];
    svgs[url] = new Promise(function (ok) {
      try {
        var r = new XMLHttpRequest();
        r.open('GET', url, true);
        r.onload = function () {
          var d = null;
          try { d = new DOMParser().parseFromString(r.responseText || '', 'image/svg+xml').documentElement; } catch (e) { d = null; }
          ok(d && d.nodeName === 'svg' && !d.getElementsByTagName('parsererror').length ? d : null);
        };
        r.onerror = function () { ok(null); };
        r.send();
      } catch (e) { ok(null); }
    });
    return svgs[url];
  }
  // Un envol dans le calque du dessus : `contenu` (un élément) part de `de` et arrive à `vers`
  // (unités de page) par un arc ; o : { l, h (taille), duree, hauteur (de l'arc), echelle (à
  // l'arrivée), tour (degrés), efface (à partir de quelle part il s'efface), garder }.
  function voler(scene, contenu, de, vers, o) {
    o = o || {};
    var l = o.l || 120, h = o.h || l, boite = el('div', { 'class': 'fx fx-vol', 'aria-hidden': 'true' }, dessus(scene, 'vols', 14));
    boite.appendChild(contenu);
    poser(boite, de[0] - l / 2, de[1] - h / 2, l, h);
    var c = o.controle || [(de[0] + vers[0]) / 2 - (o.courbe || 0), Math.min(de[1], vers[1]) - (o.hauteur === undefined ? 160 : o.hauteur)];
    var fin = o.echelle === undefined ? 1 : o.echelle;
    return animer(scene, calme ? 0 : (o.duree || 900), function (x) {
      var t = (o.acces || lisse)(x), u = 1 - t;
      var px = u * u * de[0] + 2 * u * t * c[0] + t * t * vers[0], py = u * u * de[1] + 2 * u * t * c[1] + t * t * vers[1];
      boite.style.left = pc(px - l / 2, W); boite.style.top = pc(py - h / 2, H);
      boite.style.transform = 'scale(' + (1 + (fin - 1) * t).toFixed(3) + ')' + (o.tour ? ' rotate(' + (o.tour * t).toFixed(1) + 'deg)' : '');
      if (o.efface !== undefined) boite.style.opacity = String(x < o.efface ? 1 : Math.max(0, (1 - x) / (1 - o.efface)));
      if (o.pas) o.pas(x, px, py);
    }).then(function () { if (!o.garder) retirer(boite); return boite; });
  }
  // Les boutons de la barre de la page : 'objets', 'carnet', 'menu'.
  var BOUTONS = { objets: '.barre .objets', carnet: '.barre .carnet-bouton', menu: '.barre .menu-bouton', sac: '.barre .objets' };
  function bouton(scene, qui) { return $(BOUTONS[qui] || BOUTONS.objets, scene); }
  function pointDe(scene, qui) { return pointBouton(scene, BOUTONS[qui] || BOUTONS.objets); }
  // Une classe posée un instant sur un bouton (luire, vaciller, ployer, trembler).
  function marquer(scene, qui, classe, ms) {
    var b = bouton(scene, qui);
    if (!b) return null;
    b.classList.remove(classe); void b.offsetWidth; b.classList.add(classe);
    minuterie(scene, function () { b.classList.remove(classe); }, ms, true);
    return b;
  }
  // Objets.ajouter et Objets.remplacer font pulser les boutons : un objet `discret` n'a aucun signe.
  function sansPulsation() { $$('.barre .objets, .barre .carnet-bouton').forEach(function (b) { b.classList.remove('pulse'); }); }

  return {
    etat: etat, vivante: vivante, active: active, nettoyer: nettoyer, tache: tache, animer: animer, minuterie: minuterie,
    pause: pause, surDepart: surDepart, nouveauTemps: nouveauTemps, surTemps: surTemps, tempsCourant: tempsCourant,
    px: px, pc: pc, plans: plans, planVisible: planVisible,
    nomDuPlan: nomDuPlan, indexDuPlan: indexDuPlan, fichierDecor: fichierDecor, sourceImage: sourceImage, image: image,
    estPhoto: estPhoto, decor: decor, calque: calque, dessous: dessous, dessus: dessus, poser: poser, ensuite: ensuite,
    copie: copie, pointBouton: pointBouton, mondeJulie: mondeJulie, alea: alea, entre: entre, sonner: sonner,
    variantes: variantes, ambianceDeLaPage: ambianceDeLaPage, niveauAmbiance: niveauAmbiance, vibrer: vibrer,
    toile: toile, fichierCalque: fichierCalque, chargerImage: chargerImage, chargerSvg: chargerSvg, voler: voler,
    bouton: bouton, pointDe: pointDe, marquer: marquer, sansPulsation: sansPulsation, DOSSIER: DOSSIER
  };
})();

// ================================================================ objets, portes, carnet, interface
/* Les effets d'état : ils font en direct ce que build.py calcule pour les pages suivantes
   (appliquer). Les images de ces effets (envols, lueurs de la barre, désenchantement en quatre
   mouvements) sont encore celles du prototype : voir « Ce qui reste » dans le rapport. */
(function () {
  Effets['objet+'] = function (scene, e) {
    Objets.ajouter(e.id, e.sac || null, !e.discret && e.style !== 'notification');
    if (e.discret) Fx.sansPulsation();
  };
  Effets['objet-'] = function (scene, e) { Objets.retirer(e.id, !e.discret); };
  // Un objet en devient un autre ; sans `discret`, le bandeau « Nouvel objet » (6.4 : les binocles).
  Effets.remplacer = function (scene, e) {
    Objets.remplacer(e.de, e.vers, e.sac);
    if (e.discret) { Fx.sansPulsation(); return; }
    Objets.ajouter(e.vers, e.sac || null, true);
  };
  Effets.transfert = function (scene, e) { Objets.transferer(e.id, e.de, e.vers); };
  // Métamorphose brève (les lunettes redeviennent clé d'un geste) : un frisson, puis le sac change.
  Effets['eclat-court'] = function (scene, e) {
    var p = e.serrure || [e.x || 600, e.y || 1000];
    return Transitions.frisson(scene, p[0], p[1], e.r || 220).then(function () {
      Objets.remplacer(e.de, e.vers, e.sac);
    });
  };
  // Métamorphose en grand : l'éclat, le nom de l'objet et le fragment du livre qui la raconte.
  Effets.eclat = function (scene, e) {
    var m = Objets.donnee(e.objet).metamorphose;
    return Transitions.eclat(scene, { objet: e.objet, nom: Objets.nom(e.objet), fragment: m && m.texte });
  };
  Effets.fiche = function (scene, e) { return Objets.presenter(e.objet); };
  Effets.frisson = function (scene, e) { return Transitions.frisson(scene, e.x || 600, e.y || 900, e.r || 220); };

  // L'étoile d'une porte naît quand le passage s'achève à l'image (arbitrage 6) ; `anneau` :
  // l'étoile à part du père (3.11), un anneau au carnet.
  Effets.porte = function (scene, e) {
    if (e.anneau && e.id === 'pere') Carnet.pere('vue');
    return Carnet.allumer(e.id);
  };
  // Le bouton « Carnet » luit ; `allumer` : l'anneau du père allume son point (7.12).
  Effets.carnet = function (scene, e) {
    if (e.id === 'pere' && e.allumer) { Carnet.pere('allumee'); return; }
    Fx.marquer(scene, 'carnet', 'pulse', 1900);
  };
  // La boussole au carnet et sur le bouton « Carnet » (l'état des pages suivantes).
  Effets.boussole = function (scene, e) {
    if (e.etat === 'nord' || e.etat === 'perdue' || e.etat === 'eteinte') Carnet.boussole(e.etat);
  };
  // La fiche des lunettes gagne « Regarder à travers » (3.4).
  Effets.regard = function (scene) {
    Objets.offrirRegard(true);
    Fx.marquer(scene, 'objets', 'pulse', 1900);
  };

  // Le désenchantement (7.14) : l'état de la fin du livre, tel que build.py le calcule ; les deux
  // annonces sont lues ensemble, à la fin seulement.
  Effets.desenchantement = function (scene, e) {
    var duree = calme ? 1500 : Math.min(e.duree || 9000, 9000);
    html.classList.remove('voile-page');
    html.classList.add('repliques-claires');
    return Fx.pause(scene, duree / 2).then(function () {
      Objets.vider(['cle', 'lunettes', 'binocles']);
      Objets.offrirRegard(false);
      Carnet.initialiser(Carnet.portes(), false, {
        pere: scene.getAttribute('data-pere') ? 'eteinte' : null,
        boussole: scene.getAttribute('data-boussole') ? 'eteinte' : null
      });
      return Fx.pause(scene, duree / 2);
    }).then(function () {
      scene.classList.add('sans-magie');
      html.classList.add('sans-magie-page');
      Objets.majBoutons(false);
      var a = (e.annonce || ['cle_poussiere', 'carnet_eteint']).map(function (k) { return ui(k); }).join(' ');
      annoncer(a);
    });
  };

  // L'interface : `voile` (la barre à 35 %), `sans="darshan"` (4.1 : les pages où Julie dit
  // « je »), `avec="darshan"` (5.2 : les boutons de Darshan reviennent).
  Effets.interface = function (scene, e) {
    function faire() {
      if (e.voile) html.classList.add('voile-page');
      if (e.sans === 'darshan') html.classList.add('barre-julie');
      if (e.avec === 'darshan') html.classList.remove('barre-julie');
      Objets.majBoutons(false);
    }
    faire();
  };
  // Le compte à rebours : les mots s'éclairent, leur double se pose en haut de la page.
  Effets.compte = function (scene, e) { Compte.afficher(scene, e.valeur || '', { son: e.son }); };
  // Rien à toucher : la page attend (l'ancien `attente`).
  Effets.pause = function (scene, e) { return Fx.pause(scene, e.duree || 3000); };
  Effets.attente = function (scene, e) { return Effets.pause(scene, e); };
})();

// ================================================================ images, lumières, son (prototype)
(function () {
  Effets.decor = function (scene, e) { return Visuels.plan(scene, e.i || 0, e); };
  Effets.camera = function (scene, e) { return Visuels.camera(scene, e); };
  Effets.avance = function (scene, e) { return Visuels.camera(scene, { avance: e.avance || 1.12, vers: e.vers, duree: e.duree || 2600 }); };
  Effets.flou = function (scene, e) {
    var d = $('.decor', scene);
    if (d) { d.style.transition = 'filter ' + (calme ? 200 : 900) + 'ms'; d.style.filter = 'blur(' + (e.force || 8) + 'px)'; }
  };
  // Tout revient : image nette, son ouvert, barre pleine (le voile se lève, pas l'état de la barre).
  Effets.net = function (scene) {
    var d = $('.decor', scene);
    if (d) d.style.filter = '';
    Son.filtre(null);
    html.classList.remove('voile-page');
  };
  Effets.eblouir = function (scene) {
    var f = el('div', { 'class': 'fx lumiere-flot ui', style: 'opacity:.75;transition:opacity 3s ease-out;' }, scene);
    Fx.ensuite(function () { f.style.opacity = '0'; });
    Fx.minuterie(scene, function () { retirer(f); }, 3200, true);
  };
  Effets.poussiere = function (scene, e) {
    var p = scene.poussiere || (scene.poussiere = Visuels.Poussiere(scene, e));
    p.bouffee(e.x, e.y);
  };
  Effets.filantes = function (scene) {
    var ciel = scene.etoiles;
    if (!ciel) return;
    ciel.filer(150, 140, 0.42, 19, 300);
    ciel.filer(80, 110, 0.42, 21, 900);
    ciel.filer(640, 90, 0.62, 17, 2400);
  };
  Effets.aube = function (scene) {
    var a = scene.aube;
    if (a) a.style.opacity = '1';
    if (scene.etoiles) scene.etoiles.eclat(0.35);
  };
  // La voix intérieure de Darshan (1.1, 2.3, 3.11) : elle s'éclaire. L'appel au père n'est pas
  // joué ici mais par l'effet `son` (effet="appel").
  Effets.voix = function (scene, e) {
    if (e.fin) return;
    if (e.halo !== false && e.couleur !== 'encre') scene.classList.add('appel-au-pere');
    if (scene.etoiles && e.eclat !== false) scene.etoiles.eclat(0.95);
  };

  // ---- le son
  // Un son ponctuel avec la phrase (effet="…") ; n : répétitions ; retenir : le temps suivant
  // attend ce délai, compté depuis le départ du son ; tenu, eteindre, duree : l'accord du père.
  Effets.son = function (scene, e) {
    if (e.ambiance) { Son.ambiance(e.ambiance, e); return; }
    var nom = e.effet || e.son || e.id, n = e.n || 1;
    if (nom === 'question') nom = 'appel';
    if (!nom || e.arret) return;
    for (var k = 0; k < n; k++) {
      if (k === 0) Fx.sonner(nom, e);
      else Fx.minuterie(scene, function () { Fx.sonner(nom, e); }, k * (e.intervalle || 700));
    }
    if (e.retenir) return Fx.pause(scene, e.retenir);
  };
  Effets.vibre = function (scene, e) {
    Fx.sonner('vibre');
    if (e.haptique) Fx.vibrer(e.haptique);
  };
  Effets.assourdi = function () { Son.filtre('assourdi'); };
  Effets.silence = function (scene, e) {
    if (e.fin) { Son.ambiance(Fx.ambianceDeLaPage(scene)); return; }
    if (e.garder) return;
    Son.ambiance('silence');
    // `duree` : pour ce temps ; puis l'ambiance de la page revient
    if (e.duree) return Fx.pause(scene, e.duree).then(function () { Son.ambiance(Fx.ambianceDeLaPage(scene)); });
  };
  // Change l'ambiance au milieu d'une page (réglages de son.js : soir, nuit, foule, ete…) ;
  // `partage` (7.4) : en attendant deux ambiances à la fois, celle de la moitié active.
  Effets.ambiance = function (scene, e) {
    var nom = e.id || e.ambiance;
    if (!nom && e.partage) nom = e.partage.gauche || e.partage.droite;
    if (nom) Son.ambiance(nom, e);
  };
  // Une couche allumée ou éteinte à une phrase (couche="…", oui=False l'éteint) ; `horloge` :
  // celle de l'ambiance de l'appartement (proche : au premier plan).
  Effets.couche = function (scene, e) {
    var nom = e.couche || e.id;
    if (nom === 'horloge') { Son.ambiance('appartement', { horloge: e.oui === false ? 0 : (e.proche ? 1 : 0.3) }); return; }
    Son.couche(nom, e.oui !== false, e);
  };
  function couche(nom, e) { Son.couche(nom, e.oui !== false, e); }
  Effets.tele = function (scene, e) { couche('tele', e); };
  Effets.pluie = function (scene, e) { couche('pluie', e); };
  Effets.vibration = function (scene, e) { couche('vibration', e); };
  Effets.feu = function (scene, e) { couche('feu', e); };
  Effets.battements = function (scene, e) { couche('battements', e); };
  // La ballade, et elle seule : 1.7 (fragment, eau), 2.9 (première mesure, assourdie), 5.7
  // (entière, au téléphone), 7.10 (entière). `notes`, `duree` et `entiere` des fiches se traduisent.
  Effets.melodie = function (scene, e) {
    var o = Fx.copie(e);
    if (e.entiere) o.mode = 'entiere';
    Son.couche('melodie', e.oui !== false, o);
  };
})();
