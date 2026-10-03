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
  // Chez Julie, un objet arrive comme une notification (4.3 : le téléphone ; 5.11 : le ticket). Traitement, 4.3 :
  // « une notification brève, en bas, au-dessus du bouton du sac » ; synthèse : « bandeau gris arrondi au-dessus
  // du bouton du sac, avec le vibreur ; `ploie` : le bouton ploie ». Le bandeau paraît (1,2 s), puis l'icône
  // glisse dans le sac, qui s'allume et, avec `ploie`, ploie comme celui de Darshan en 5.2. L'objet entre dans le
  // sac à la fin du vol, ou tout de suite si la page est quittée. Mouvement réduit : le bandeau en fondu, sans vol.
  function notifier(scene, e) {
    var fait = false, bandeau = el('div', { 'class': 'fx notification-objet', 'aria-hidden': 'true' }, scene);
    var icone = el('span', { 'class': 'icone' }, bandeau), d = dessin(e.id), txt = el('span', {}, bandeau);
    if (d) icone.appendChild(d);
    el('small', {}, txt).textContent = ui('nouvel_objet');
    el('span', { 'class': 'nom' }, txt).textContent = Objets.nom(e.id);
    function entrer() {
      if (fait) return;
      fait = true;
      Objets.ajouter(e.id, e.sac || null, false);
      if (e.ploie) Fx.marquer(scene, 'objets', 'ploie', 700);
    }
    Fx.sonner('vibreur');
    Fx.ensuite(function () { bandeau.classList.add('vu'); });
    Fx.minuterie(scene, function () {
      var b = Fx.bouton(scene, 'objets');
      if (!Fx.active(scene) || !b) { entrer(); retirer(bandeau); return; }
      bandeau.classList.remove('vu');
      // le sac se montre d'avance s'il n'était pas là, pour que l'objet y rentre
      if (b.hidden) { b.hidden = false; b.classList.add('arrivee'); }
      Transitions.envol(scene, icone, b, e.id).then(function () {
        b.classList.remove('arrivee');
        entrer();
        Fx.minuterie(scene, function () { retirer(bandeau); }, 400, true);
      });
      icone.classList.add('parti');
    }, 1200, true);
  }
  Effets['objet+'] = function (scene, e) {
    if (e.style === 'notification' && !e.discret) { notifier(scene, e); return; }
    Objets.ajouter(e.id, e.sac || null, !e.discret);
    if (e.discret) Fx.sansPulsation();
    // le bouton du sac ploie quand l'objet y est entré (bandeau, puis vol : environ deux secondes)
    else if (e.ploie) Fx.minuterie(scene, function () { Fx.marquer(scene, 'objets', 'ploie', 700); }, calme ? 300 : 2100);
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
  // `bouton=True` (5.7, 6.4) : un objet change hors champ ; sur le bouton « Objets », une étoile d'or (0,5 s) et un tintement
  // minuscule (la signature de 6.4 : les lunettes deviennent clé hors champ). Mouvement réduit : l'étoile, sans mouvement.
  function frissonDuBouton(scene) {
    // au-dessus de la barre (rang 24) : l'étoile se pose sur le bouton, elle ne passe pas dessous
    var p = Fx.pointDe(scene, 'objets'), s = Fx.dessus(scene, 'frisson-bouton', 24, true), g = svgEl('g', {}, s);
    svgEl('circle', { r: 56, fill: 'none', stroke: OR, 'stroke-width': 3, opacity: 0.7 }, g);
    svgEl('path', { d: etoile(52), fill: OR, opacity: 0.95 }, g);
    svgEl('path', { d: etoile(26), fill: CREME }, g);
    g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')');
    g.setAttribute('opacity', 0);
    Fx.sonner('tinte', { force: 0.3 });
    return Fx.animer(scene, calme ? 500 : 520, function (x) {
      var o = Math.sin(Math.PI * x);
      g.setAttribute('opacity', o.toFixed(3));
      if (!calme) g.setAttribute('transform', 'translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ') rotate(' + (40 * x).toFixed(1) + ') scale(' + (0.5 + 0.6 * vif(x)).toFixed(3) + ')');
    }).then(function () { retirer(s); });
  }
  Effets.frisson = function (scene, e) {
    if (e.bouton) return frissonDuBouton(scene);
    return Transitions.frisson(scene, e.x || 600, e.y || 900, e.r || 220);
  };

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
  // Dans l'image (5.3 : `place`), la rose des vents d'or de `semer` (3.14) reçoit son aiguille, à pointe vermillon comme
  // celle du carnet. `affolee` : un tour par seconde, avec des à-coups ; `nord` : elle ralentit, oscille et se fixe en haut, et
  // l'étoile du matin brille à sa pointe, sur la page seulement (le bruit : un ronflement, puis le déclic, puis une note claire) ;
  // `perdue` : arrêtée au hasard, la pointe pâlit ; `eteinte` : grise. Au carnet et sur le bouton « Carnet », l'état suit.
  // Mouvement réduit : la rose paraît déjà fixée, l'aiguille change de direction sans tourner.
  function aiguilleDeLaRose(parent, r, etat) {
    var eteinte = etat === 'eteinte', a = svgEl('g', {}, parent);
    svgEl('path', { d: 'M0,' + (-r) + 'L' + (r * 0.075) + ',0L0,' + (r * 0.9) + 'L' + (-r * 0.075) + ',0Z', fill: eteinte ? '#555a6e' : OR, stroke: '#07091a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, a);
    svgEl('path', { d: 'M0,' + (-r) + 'L' + (r * 0.075) + ',0L' + (-r * 0.075) + ',0Z', fill: eteinte ? '#6d7182' : SINDOOR, opacity: etat === 'perdue' ? 0.45 : 1 }, a);
    svgEl('circle', { r: r * 0.06, fill: CREME, stroke: '#07091a', 'stroke-width': 2 }, a);
    return a;
  }
  function laRose(scene, e, fx) {
    if (fx.boussole) return fx.boussole;
    var place = e.place;
    if (!place) return null;
    var r = e.rayon || 250, svg = Fx.calque(scene, 'boussole', 4, true), racine = svgEl('g', { 'class': 'boussole-rose' }, svg);
    Gestes.rose(racine, place[0], place[1], r);
    var aig = svgEl('g', { transform: 'translate(' + place[0] + ' ' + place[1] + ')' }, racine);
    var b = fx.boussole = { racine: racine, place: place, r: r, aig: null, pivot: aig, angle: 0, vitesse: 0, etat: null, etoile: null, tache: null };
    b.aig = aiguilleDeLaRose(aig, r * 0.84, e.etat);
    if (calme) racine.setAttribute('opacity', 1);
    else {
      racine.setAttribute('opacity', 0);
      Fx.animer(scene, 1100, function (x) { racine.setAttribute('opacity', x.toFixed(3)); });
    }
    return b;
  }
  function tournerLaiguille(b) { b.pivot.setAttribute('transform', 'translate(' + b.place[0] + ' ' + b.place[1] + ') rotate(' + b.angle.toFixed(2) + ')'); }
  Effets.boussole = function (scene, e) {
    var fx = Fx.etat(scene), b = laRose(scene, e, fx), alea = Fx.alea(31);
    if (!b) {
      if (e.etat === 'nord' || e.etat === 'perdue' || e.etat === 'eteinte') Carnet.boussole(e.etat);
      return;
    }
    b.etat = e.etat;
    function suivreCarnet() { if (e.etat === 'nord' || e.etat === 'perdue' || e.etat === 'eteinte') Carnet.boussole(e.etat); }
    if (b.tache) { b.tache.arreter(); b.tache = null; }
    if (e.etat === 'affolee') {
      // un tour par seconde, avec des à-coups : la vitesse change toutes les 0,15 à 0,35 s
      if (calme) { b.angle = 0; tournerLaiguille(b); return; }
      var cible = 6.3, prochain = 0;
      b.tache = Fx.tache(scene, function (t, dt) {
        if (t >= prochain) { cible = (3.5 + alea() * 6) * (alea() < 0.12 ? -0.6 : 1); prochain = t + 0.15 + alea() * 0.2; }
        b.vitesse += (cible - b.vitesse) * (1 - Math.exp(-14 * dt));
        b.angle += b.vitesse * dt * 57.2958;
        tournerLaiguille(b);
      });
      return;
    }
    if (e.etat === 'nord') {
      // elle ralentit, oscille et se fixe en haut : un pendule freiné, attiré par le nord (k = 30, frottement 4)
      var fixee = new Promise(function (ok) {
        function etoileDuMatin() {
          var s = svgEl('g', { 'class': 'boussole-etoile', transform: 'translate(' + b.place[0] + ' ' + (b.place[1] - b.r * 0.84 - 38) + ')' }, b.racine);
          svgEl('circle', { r: 46, fill: 'url(#' + FxB.lueur(b.racine) + ')' }, s);
          svgEl('path', { d: etoile(30), fill: CREME, stroke: OR, 'stroke-width': 2 }, s);
          b.etoile = s;
          if (calme) return;
          s.setAttribute('opacity', 0);
          Fx.animer(scene, 700, function (x) { s.setAttribute('opacity', x.toFixed(3)); });
        }
        if (calme) { b.angle = 0; tournerLaiguille(b); etoileDuMatin(); suivreCarnet(); Fx.sonner('aiguille', { etat: 'etoile' }); ok(); return; }
        var th = (b.angle % 360) * Math.PI / 180, w = Math.max(b.vitesse, 3) * 1, calmeAt = 0, pos = false;
        Fx.sonner('aiguille');
        b.tache = Fx.tache(scene, function (t, dt) {
          for (var i = 0; i < 4; i++) {
            var h = dt / 4;
            w += (-4 * w - 30 * Math.sin(th)) * h; th += w * h;
          }
          b.angle = th * 57.2958; tournerLaiguille(b);
          if (Math.abs(Math.sin(th)) < 0.01 && Math.abs(w) < 0.06 && t > 0.8) {
            b.angle = Math.round(b.angle / 360) * 360; tournerLaiguille(b);
            etoileDuMatin(); suivreCarnet();
            Fx.minuterie(scene, function () { Fx.sonner('aiguille', { etat: 'etoile' }); }, 150);
            ok(); return false;
          }
          if (t > 6) { b.angle = 0; tournerLaiguille(b); etoileDuMatin(); suivreCarnet(); ok(); return false; }   // par sûreté
        });
      });
      return fixee;
    }
    // perdue : arrêtée au hasard, la pointe pâlit ; eteinte : grise
    if (e.etat === 'perdue' || e.etat === 'eteinte') {
      retirer(b.aig); b.aig = aiguilleDeLaRose(b.pivot, b.r * 0.84, e.etat);
      b.angle = e.etat === 'perdue' ? (e.angle === undefined ? 62 : e.angle) : b.angle; tournerLaiguille(b);
      if (b.etoile) { retirer(b.etoile); b.etoile = null; }
      suivreCarnet();
    }
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
  // La barre change de main : traitement, 4.1 : « Trois secondes après, la photo posée, effet « interface » : les
  // boutons « Objets » et « Carnet » s'effacent en 1,2 s. Ils se retirent, ils ne meurent pas » ; 5.2 : « les
  // boutons « Objets » et « Carnet » reviennent (1,2 s, un reflet d'or) ». L'état de la page suivante est celui
  // que build.py calcule (data-barre, les sacs de la page) : l'effet y revient à la fin, sans rien perdre.
  function motsDe(scene, attribut) { return (scene.getAttribute(attribut) || '').split(/\s+/).filter(Boolean); }
  function poserLaBarre(scene, qui) {
    html.classList.toggle('barre-julie', qui === 'julie');
    Objets.initialiser(motsDe(scene, 'data-sac'), motsDe(scene, 'data-sac-julie'),
      { barre: qui, regard: scene.getAttribute('data-regard') === 'oui' });
    Carnet.initialiser(Carnet.portes(), !scene.classList.contains('sans-magie'),
      { pere: scene.getAttribute('data-pere') || null, boussole: scene.getAttribute('data-boussole') || null });
  }
  function boutonsDeDarshan(scene) { return $$('.barre .objets, .barre .carnet-bouton', scene).filter(function (b) { return !b.hidden; }); }
  Effets.interface = function (scene, e) {
    var ms = calme ? 300 : (e.duree || 1200);
    if (e.voile) html.classList.add('voile-page');
    if (e.sans === 'darshan') {
      // ils s'effacent, puis la barre est celle de Julie
      var partants = boutonsDeDarshan(scene);
      partants.forEach(function (b) { b.style.transition = 'opacity ' + ms + 'ms ease'; });
      Fx.ensuite(function () { partants.forEach(function (b) { b.style.opacity = 0; }); });
      Fx.minuterie(scene, function () {
        partants.forEach(function (b) { b.style.transition = ''; b.style.opacity = ''; });
        poserLaBarre(scene, 'julie');
      }, ms + 60, true);
      return;
    }
    if (e.avec === 'darshan') {
      // ils reviennent, avec un reflet d'or
      poserLaBarre(scene, 'darshan');
      var venus = boutonsDeDarshan(scene);
      venus.forEach(function (b) { b.style.transition = 'none'; b.style.opacity = 0; });
      Fx.ensuite(function () {
        venus.forEach(function (b) {
          b.style.transition = 'opacity ' + ms + 'ms ease';
          b.style.opacity = 1;
          if (e.reflet === 'or' && !calme) b.classList.add('reflet-or');
        });
      });
      Fx.minuterie(scene, function () {
        venus.forEach(function (b) { b.style.transition = ''; b.style.opacity = ''; b.classList.remove('reflet-or'); });
      }, ms + 400, true);
      return;
    }
    Objets.majBoutons(false);
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
  // `cible="sac"` (4.7) : le bouton du sac tremble `n` fois (120 ms chaque fois) sur le vibreur d'un téléphone posé ;
  // `haptique` : le motif du vrai téléphone (jamais en mouvement réduit, ni sons coupés : Fx.vibrer). En mouvement
  // réduit, rien ne bouge.
  Effets.vibre = function (scene, e) {
    if (e.cible === 'sac') {
      var b = Fx.bouton(scene, 'sac'), n = e.n || 3;
      Fx.sonner('vibreur');
      if (b && !calme) {
        b.style.animation = 'tremble-sac 120ms linear ' + n;
        Fx.minuterie(scene, function () { b.style.animation = ''; }, n * 120 + 80, true);
      }
    } else Fx.sonner('vibre');
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

// ================================================================ effets nouveaux, chapitres 0 à 3 (début)
/* Les effets qui manquaient, dont la première page est aux chapitres 0 à 3, s'ajoutent ici, chacun
   juste au-dessus de la ligne « (fin) » ci-dessous (deux équipes écrivent en même temps). */
// ================================================================ effets nouveaux, chapitres 0 à 3 (fin)

// ================================================================ effets nouveaux, chapitres 4 à 8 (début)
/* Les effets qui manquaient, dont la première page est aux chapitres 4 à 8, s'ajoutent ici, chacun
   juste au-dessus de la ligne « (fin) » ci-dessous. */

// Les outils communs des effets de cette zone (ceux de la zone « 0 à 3 » : FxA).
var FxB = {
  // Une unité de page, en pixels CSS : la largeur de mise en page de la scène (offsetWidth), que ne change aucune mise à
  // l'échelle de la liseuse (getBoundingClientRect, lui, la subit).
  k: function (scene) { return (scene.offsetWidth || W) / W; },
  // Un dégradé de lueur d'or (dans les définitions du SVG qui porte `g`) : son identifiant.
  lueur: function (g) {
    var svg = g.ownerSVGElement || g, defs = $('defs', svg) || svgEl('defs', {}, svg), id = Gestes.suivant('lueur'), d = svgEl('radialGradient', { id: id }, defs);
    [[0, '#fff4d6', 0.9], [0.4, '#ffd98a', 0.4], [1, '#ffc060', 0]].forEach(function (s) {
      svgEl('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, d);
    });
    return id;
  }
};

// ---------------------------------------------------------------- chapitre 4 : Amélie et Julie (4.1 à 4.7)
// Le seul chapitre à la première personne : le monde de Julie, ses photos, son téléphone ; aucune magie.
(function () {
  // ---- vers (4.2) : la litanie des questions de l'hôpital, qui devient poème
  // Traitement, 4.2 : « « vers », au T5, seul moment typographique du chapitre. Sur le mur clair du couloir, les
  // trois questions déjà lues reviennent, coupées en vers à leurs pauses, sans un mot changé […] Elles paraissent
  // ligne à ligne, une par battement (700 ms), à l'encre grise, dans la police du livre ; puis reprennent, plus
  // pâles et décalées, trois fois, en montant lentement : « des milliers de fois ». Au T6, il n'en reste qu'un
  // filigrane. Masquées aux lecteurs d'écran (elles viennent d'être lues). Mouvement réduit : le poème paraît une
  // fois, immobile et pâle. » Son : « Au T5, les bips se calent sur une mesure régulière, celle des vers ; au T6, ils
  // se désordonnent. »
  // Les vers viennent du texte de la page, jamais d'ailleurs : `questions` (3) citations « … » lues dans les temps,
  // coupées aux débuts de phrase de `coupes` (une liste par question, écrite dans livre.py) ; `boucles` (3)
  // reprises. Le tout est décoratif : calque masqué aux lecteurs d'écran, jamais de toucher.
  var SEP = '[\\s\\u00a0\\u202f]*';
  function questionsDuTexte(scene, n) {
    var texte = $$('.texte .temps', scene).map(function (t) { return t.textContent; }).join(' '), r = [], m;
    var re = new RegExp('«' + SEP + '([^»]*?)' + SEP + '»', 'g');
    while (r.length < n && (m = re.exec(texte))) r.push(m[1].replace(/\s+/g, ' '));
    return r;
  }
  // Une question coupée en lignes, aux débuts de phrase donnés (ceux qui ne s'y trouvent pas sont ignorés) ; la
  // première ligne reprend le guillemet ouvrant du livre, la dernière le fermant.
  function enVers(question, coupes) {
    var pos = [0];
    (coupes || []).forEach(function (c) { var i = question.indexOf(c); if (i > 0) pos.push(i); });
    pos.sort(function (a, b) { return a - b; });
    var lignes = pos.map(function (p, k) {
      return question.slice(p, k + 1 < pos.length ? pos[k + 1] : question.length).replace(/^\s+|\s+$/g, '');
    });
    lignes[0] = '« ' + lignes[0];
    lignes[lignes.length - 1] += ' »';
    return lignes;
  }
  // la passe 0 : l'encre grise, nette ; les reprises (x, y, opacité) : plus pâles, décalées, de plus en plus haut
  var REPRISES = [[0, 0, 0.9], [34, -46, 0.42], [-44, -96, 0.28], [22, -150, 0.18]];
  var DERIVE = [2.5, 6.5, 8, 9.5];       // en unités de page par seconde : les vers montent lentement
  var BATTEMENT = 0.7, VITE = 0.14;      // une ligne par battement ; les reprises, plus vite
  Effets.vers = function (scene, e) {
    var fx = Fx.etat(scene), liste = questionsDuTexte(scene, e.questions || 3), base = Fx.ambianceDeLaPage(scene);
    // les bips de l'hôpital se calent sur la mesure des vers, puis se désordonnent au temps suivant
    if (base) Son.ambiance(base, { mesure: true });
    if (!liste.length) { if (base) Fx.surTemps(scene, function () { Son.ambiance(base); }); return; }
    var strophes = liste.map(function (q, i) { return enVers(q, (e.coupes || [])[i]); });
    var passes = calme ? 1 : 1 + (e.boucles === undefined ? 3 : e.boucles);
    var calque = Fx.calque(scene, 'vers', 4, false), blocs = [], lignes = [];
    for (var p = 0; p < passes; p++) {
      var bloc = el('div', { 'class': 'vers-bloc' }, calque), mes = [];
      Fx.poser(bloc, 96 + REPRISES[p][0], 640 + REPRISES[p][1], 760);
      strophes.forEach(function (s) {
        var st = el('p', { 'class': 'vers-strophe' }, bloc);
        s.forEach(function (l) { var d = el('span', { 'class': 'vers-ligne' }, st); d.textContent = l; mes.push(d); });
      });
      blocs.push(bloc); lignes.push(mes);
    }
    // au temps suivant (T6) : il n'en reste qu'un filigrane
    function filigrane() {
      if (base) Son.ambiance(base);
      fx.versFiligrane = true;
      blocs.forEach(function (b) { b.style.opacity = calme ? 0.2 : 0.16; });
    }
    Fx.surTemps(scene, filigrane);
    if (calme) {
      // le poème paraît une fois, immobile et pâle
      blocs[0].style.transition = 'opacity 300ms';
      lignes[0].forEach(function (d) { d.style.opacity = 1; });
      blocs[0].style.opacity = 0;
      Fx.ensuite(function () { if (!fx.versFiligrane) blocs[0].style.opacity = 0.55; });
      return;
    }
    // une ligne par battement (700 ms) ; puis les reprises, en cascade rapide, de plus en plus pâles
    var fin0 = lignes[0].length * BATTEMENT, k = FxB.k(scene), arret = null;
    function debut(passe, i) { return passe === 0 ? i * BATTEMENT : fin0 + 0.3 + (passe - 1) * 1.0 + i * VITE; }
    blocs.forEach(function (b) { b.style.transition = 'opacity 1600ms ease'; });
    Fx.tache(scene, function (t) {
      if (fx.versFiligrane && arret === null) arret = t;
      // au temps suivant, ce qui reste à paraître paraît vite
      var tt = arret === null ? t : arret + (t - arret) * 8;
      for (var passe = 0; passe < passes; passe++) {
        blocs[passe].style.transform = 'translateY(' + (-Math.min(tt, 16) * DERIVE[passe] * k).toFixed(2) + 'px)';
        lignes[passe].forEach(function (d, i) {
          d.style.opacity = (borne((tt - debut(passe, i)) / 0.5) * REPRISES[passe][2]).toFixed(3);
        });
      }
      if (tt > 16) return false;
    });
  };

  // ---- tremble (4.3) : la tôle du RER vibre sous le pouce qui écrit
  // Traitement, 4.3 : « « vibration » légère de la photo du RER, jamais du texte : la tôle vibre sous le pouce
  // qui écrit » ; synthèse : « la couche du décor tremble d'un pixel, irrégulièrement, comme un train, jusqu'au
  // plan `jusqua` ; jamais le texte ; rien en mouvement réduit ». Le décor bouge d'une fraction de la page (un
  // pixel sur un écran de téléphone), un peu plus grande aux joints des rails ; le grossissement de 0,7 %
  // garde les bords couverts. S'arrête au plan `jusqua` (le plan suivant), ou avec la page.
  Effets.tremble = function (scene, e) {
    var d = Fx.decor(scene);
    if (calme || !d) return;
    var jusqua = e.jusqua === undefined ? 1 : e.jusqua, alea = Fx.alea(23), ax = e.legere ? 0.2 : 0.34, ay = e.legere ? 0.14 : 0.24;
    var joint = 0.5 + alea() * 0.4, secousse = 0;     // le prochain joint de rail, et sa secousse du moment
    d.style.transformOrigin = '50% 50%';
    Fx.surDepart(scene, function () { d.style.transform = ''; });      // la page quittée garde son décor immobile
    Fx.tache(scene, function (t, dt) {
      if (Fx.planVisible(scene) >= jusqua) { d.style.transform = ''; return false; }
      // le fond de l'ébranlement : trois fréquences sans rapport, d'intensité changeante
      var env = 0.65 + 0.35 * Math.sin(t * 2.3) * Math.sin(t * 1.45 + 1);
      var x = ax * env * (0.55 * Math.sin(t * 58 + 0.7) + 0.35 * Math.sin(t * 86 + 2.1) + 0.2 * Math.sin(t * 32));
      var y = ay * env * (0.5 * Math.sin(t * 70 + 1.3) + 0.4 * Math.sin(t * 48 + 0.2));
      if (t >= joint) { secousse = 1; joint = t + 0.55 + alea() * 0.6; }
      secousse *= Math.pow(0.00003, dt);        // la secousse retombe en un dixième de seconde
      y += ay * 2.2 * secousse * Math.sin(t * 90);
      d.style.transform = 'translate3d(' + x.toFixed(3) + '%,' + y.toFixed(3) + '%,0) scale(1.007)';
    });
  };

  // ---- musicien (4.5) : de la guitare de rue, au passage, sans accord
  // Traitement, 4.5 : « « musicien » au T4 (son seul) » ; Son : « quelques mesures de guitare de rue passent de
  // droite à gauche pendant la lecture, comme si l'on défilait devant ; la dernière mesure attend son accord, qui
  // ne vient pas : « l'accord tacite » ». Le son lui-même (composé pour le livre, huit secondes, de droite à
  // gauche) est celui de son.js ; `accord_final=False` : l'accord n'arrive jamais. Son seul : les sous-titres
  // des sons le nomment (chantier I4).
  Effets.musicien = function (scene, e) { Fx.sonner('musicien', e); };

  // ---- compte (4.7, 5.1, 5.11) : le tic du téléphone de Julie
  // Chez Julie, le tic est celui de son téléphone (son.js : `monde: 'julie'`) ; Compte.afficher joue celui de
  // Darshan. Le monde vient de la fiche (`monde="julie"`) ou de la page elle-même.
  var compteAvant = Effets.compte;
  Effets.compte = function (scene, e) {
    if (!e.son || !(e.monde === 'julie' || Fx.mondeJulie(scene))) return compteAvant(scene, e);
    var r = compteAvant(scene, Fx.copie(e, { son: null }));
    Fx.sonner(e.son, { monde: 'julie' });
    return r;
  };
})();
// ---------------------------------------------------------------- chapitre 5 : Douceurs et confettis (5.1 à 5.11)
// Aluva, l'élan de Darshan qui achète tout ; chez Julie, la galerie de son téléphone, la ballade, l'aveu, la pâtisserie.
(function () {
  // ---- roule (5.2) : la mangue, roulée de derrière
  // Traitement, 5.2 : « sur sa réplique, une mangue entre dans le cadre par le bas, roulée de derrière (`roule`) : il
  // vient de s'appuyer sur l'étal de fruits, et on ne l'a pas vu » ; synthèse : « Un fruit dessiné à l'encre (la mangue)
  // entre par le bas, roule un peu et s'arrête (1,2 s), avec son bruit ; mouvement réduit : il paraît, immobile ».
  // L'image est le calque `mangue` de decors.py (la figurine du dessin d'Aluva) ; elle s'arrête sur l'herbe, au bas de la
  // page, avec son ombre.
  Effets.roule = function (scene, e) {
    var src = Fx.fichierDecor(e.image || 'mangue'), fx = Fx.etat(scene);
    Fx.sonner('roule');
    if (!src) return;
    var L = 300, Hh = 240, cx = 560, cy = 1460;       // la figurine (unités de page) et sa place d'arrêt
    return Fx.chargerImage(src).then(function (img) {
      if (!img || !Fx.vivante(scene, fx)) return;
      var calque = Fx.calque(scene, 'roule', 4, false);
      var ombre = el('div', { 'class': 'roule-ombre' }, calque), fruit = Fx.image(src, { 'class': 'roule-fruit' }, calque);
      Fx.poser(ombre, cx - 130, cy + 70, 260, 70);
      Fx.poser(fruit, cx - L / 2, cy - Hh / 2, L, Hh);
      if (calme) {
        // il paraît, immobile
        [ombre, fruit].forEach(function (n) { n.style.opacity = 0; n.style.transition = 'opacity 350ms'; });
        Fx.ensuite(function () { ombre.style.opacity = 1; fruit.style.opacity = 1; });
        return Fx.pause(scene, 400);
      }
      var k = FxB.k(scene), dx0 = 190, dy0 = 560;       // il part du bas du cadre, un peu à droite
      return Fx.animer(scene, 1200, function (p) {
        var t = 1 - Math.pow(1 - p, 3);                  // il ralentit en roulant
        var rebond = p > 0.84 ? Math.sin((p - 0.84) / 0.16 * Math.PI) * 14 : 0;
        var dx = dx0 * (1 - t), dy = dy0 * (1 - t) - rebond;
        fruit.style.transform = 'translate(' + (dx * k).toFixed(1) + 'px,' + (dy * k).toFixed(1) + 'px) rotate(' + (-440 * (1 - t)).toFixed(1) + 'deg)';
        fruit.style.opacity = Math.min(1, p * 8).toFixed(3);
        ombre.style.transform = 'translate(' + (dx * k).toFixed(1) + 'px,' + (dy * 0.55 * k).toFixed(1) + 'px)';
        ombre.style.opacity = (Math.min(1, p * 4) * (0.3 + 0.7 * t)).toFixed(3);
      }).then(function () { fruit.style.transform = ''; ombre.style.transform = ''; });
    });
  };

  // ---- essouffle (5.3) : une réplique coupée de points de suspension
  // Traitement, 5.3 : « Sur « — Oui… Oui… Tu… Elle… s'essouffle Jivan. », les fragments paraissent un à un, à 600 ms
  // d'écart, comme des souffles (`essouffle`). Mouvement réduit : la réplique paraît d'un coup. » Le texte du temps ne
  // change pas : ses morceaux sont seulement enveloppés, et chacun s'éclaire à son tour. Le temps suivant attend le dernier.
  Effets.essouffle = function (scene, e) {
    var t = Fx.tempsCourant(scene), ecart = e.ecart || 600;
    if (!t || calme) return;
    var morceaux = [];
    [].slice.call(t.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var pieces = n.nodeValue.match(/[^…]*…+|[^…]+$/g);
      if (!pieces || pieces.length < 2) return;
      pieces.forEach(function (p) {
        var s = doc.createElement('span');
        s.className = 'souffle'; s.textContent = p;
        t.insertBefore(s, n); morceaux.push(s);
      });
      t.removeChild(n);
    });
    if (morceaux.length < 2) return;
    morceaux.forEach(function (s, i) {
      if (!i) return;
      s.classList.add('attend');
      Fx.minuterie(scene, function () { s.classList.remove('attend'); }, i * ecart, true);
    });
    return Fx.pause(scene, (morceaux.length - 1) * ecart + 350);
  };

  // ---- confettis (5.5) : le paquet, puis les confettis qui s'en échappent
  // Traitement, 5.5 : « toucher le paquet (un reflet l'annonce) : il saute dans le sac (bandeau « Nouvel objet »), fermé ;
  // trois confettis s'en échappent, rose, menthe et citron, et tombent en voletant. Mouvement réduit : trois confettis
  // immobiles, qui s'effacent » ; synthèse : « `n` confettis (rose, menthe, citron) s'échappent du paquet et tombent en
  // voletant ; pas d'explosion ; 2,5 s ». `paquet` (à l'ouverture de la page) : le paquet attend sur l'étal, au centre de la
  // page (le calque de decors.py) ; avec `n`, il saute et s'efface, et les confettis partent de sa place.
  var CONFETTIS = ['#f6c1cf', '#bfe8d6', '#f7e6a1'], PAQUET = [620, 960];
  Effets.confettis = function (scene, e) {
    var fx = Fx.etat(scene);
    if (e.paquet) {
      var calque = Fx.calque(scene, 'paquet', 3, false);
      fx.paquet = Fx.image(Fx.fichierCalque('marche-aluva-confettis'), { 'class': 'paquet-calque' }, calque);
      return;
    }
    var n = e.n || 3, alea = Fx.alea(57), air = Fx.calque(scene, 'confettis', 6, false), pieces = [], k = FxB.k(scene), i;
    Fx.sonner('confettis');
    var paquet = fx.paquet;
    if (paquet) {
      // le paquet saute (dans le sac) : il monte un peu, et s'efface
      paquet.style.transition = calme ? 'opacity 300ms' : 'opacity 450ms ease, transform 450ms cubic-bezier(.3, 1.4, .5, 1)';
      Fx.ensuite(function () { paquet.style.opacity = 0; if (!calme) paquet.style.transform = 'translateY(-3%) scale(0.94)'; });
      fx.paquet = null;
    }
    for (i = 0; i < n; i++) {
      var d = el('div', { 'class': 'confetti' }, air), cote = i - (n - 1) / 2;
      d.style.background = CONFETTIS[i % CONFETTIS.length];
      Fx.poser(d, 0, 0, 58, 36);
      pieces.push({ d: d, x: PAQUET[0] + cote * 16, y: PAQUET[1] - 40, vx: cote * 62 + (alea() - 0.5) * 36, vy: -(250 + alea() * 90),
        ph: alea() * 6.28, w: 5 + alea() * 2.5, tour: (alea() - 0.5) * 520, sol: 1500 + i * 52 + alea() * 40, pose: (alea() - 0.5) * 80, t: 0, pose_fin: false });
    }
    function poserLe(p, ech, ang) {
      p.d.style.transform = 'translate(' + (p.x * k).toFixed(1) + 'px,' + (p.y * k).toFixed(1) + 'px) rotate(' + ang.toFixed(0) + 'deg) scale(1,' + ech.toFixed(3) + ')';
    }
    if (calme) {
      // trois confettis immobiles, posés ; puis ils s'effacent
      pieces.forEach(function (p) {
        p.x += p.vx * 1.6; p.y = p.sol; poserLe(p, 0.55, p.pose);
        p.d.style.opacity = 0; p.d.style.transition = 'opacity 400ms';
      });
      Fx.ensuite(function () { pieces.forEach(function (p) { p.d.style.opacity = 1; }); });
      Fx.minuterie(scene, function () { pieces.forEach(function (p) { p.d.style.opacity = 0; }); }, 2600, true);
      return { suite: Promise.resolve(), fin: Fx.pause(scene, 700) };
    }
    // ils s'échappent, montent d'un souffle, puis tombent en voletant (vitesse limite, balancement, tour sur eux-mêmes)
    var fin = new Promise(function (ok) {
      Fx.tache(scene, function (t, dt) {
        var restants = 0;
        pieces.forEach(function (p) {
          if (p.pose_fin) return;
          p.t += dt;
          p.vy += (230 - p.vy) * (1 - Math.exp(-2.6 * dt));            // la chute ralentie par l'air
          p.y += p.vy * dt;
          p.x += (p.vx * Math.exp(-1.4 * p.t) + Math.sin(p.t * 3.1 + p.ph) * 60) * dt;
          p.d.style.opacity = Math.min(1, p.t * 6).toFixed(3);
          if (p.y >= p.sol) { p.y = p.sol; p.pose_fin = true; poserLe(p, 0.55, p.tour * 0.3 + p.pose); return; }
          restants++;
          poserLe(p, 0.25 + 0.75 * Math.abs(Math.cos(p.t * p.w + p.ph)), p.tour * p.t + p.ph * 20);
        });
        if (!restants) { ok(); return false; }
      });
    });
    return { suite: Promise.resolve(), fin: fin };
  };

  // ---- eclair (5.9) : la foudre est une caresse
  // Traitement, 5.9 : « `eclair` doux : 0,9 s de montée, 2 s de retrait, luminosité plafonnée, un seul éclair, aucun
  // clignotement ; le ciel du soir paraît sous la lumière (`decor` avec `fond="sombre"`) » ; « une lumière chaude monte
  // de la fenêtre, caresse la page et se retire ». Une nappe chaude (jamais plus de 70 % de lumière) monte une fois,
  // redescend une fois ; l'effet suivant de la liste (le plan du ciel du soir) part au sommet, caché dessous, et paraît
  // pendant le retrait. Mouvement réduit : le même fondu (une opacité), rien ne bouge.
  Effets.eclair = function (scene, e) {
    var calque = Fx.calque(scene, 'eclair', 5, false), nappe = el('div', { 'class': 'eclair-nappe' }, calque);
    nappe.style.opacity = 0;
    Fx.sonner('eclair');
    var suite = Fx.animer(scene, 900, function (p) { nappe.style.opacity = (0.7 * lisse(p)).toFixed(3); });
    var fin = suite.then(function () {
      return Fx.animer(scene, 2000, function (p) { nappe.style.opacity = (0.7 * (1 - lisse(p))).toFixed(3); });
    }).then(function () { retirer(nappe); });
    return { suite: suite, fin: fin };
  };

  // ---- buee (5.11) : la buée monte du bas sur la vitrine
  // Traitement, 5.11 : « La buée monte du bas en quatre secondes et voile tout ; le hublot ouvre un rond […] » ; synthèse :
  // « La buée monte du bas sur la vitrine ; 4 s ; fondu en mouvement réduit ». Un voile de condensation (gouttelettes,
  // quelques coulures), dessiné une fois sur une image plus haute que la page, que sa lisière floue remonte jusqu'à tout
  // couvrir. Il reste : le hublot de `essuyer` (un calque par-dessus l'image) l'éclaircit. Aucune toile animée.
  Effets.buee = function (scene, e) {
    var calque = Fx.calque(scene, 'buee', 5, false), alea = Fx.alea(73);
    var F = 0.5 * H, E = H + F, l = 480, h = Math.round(l * E / W), i;      // la lisière : une demi-page de plus
    var c = el('canvas', { 'class': 'buee-voile' }, calque), x = c.getContext('2d');
    c.width = l; c.height = h;
    c.style.height = (E / H * 100).toFixed(2) + '%';
    var f = F / E;
    // la nappe : transparente en haut (la lisière), de plus en plus dense
    var g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(232, 238, 244, 0)'); g.addColorStop(f * 0.55, 'rgba(232, 238, 244, 0.4)');
    g.addColorStop(f, 'rgba(232, 238, 244, 0.82)'); g.addColorStop(1, 'rgba(238, 242, 247, 0.9)');
    x.fillStyle = g; x.fillRect(0, 0, l, h);
    // les gouttelettes : de petites perles claires cernées d'un trait plus sombre, plus grosses vers le bas
    for (i = 0; i < 1100; i++) {
      var gx = alea() * l, gy = h * Math.pow(alea(), 0.7), r = (1 + alea() * 3) * (0.6 + 0.8 * gy / h);
      if (gy < h * f * 0.35) continue;
      var d = x.createRadialGradient(gx - r * 0.3, gy - r * 0.3, 0, gx, gy, r);
      d.addColorStop(0, 'rgba(255, 255, 255, 0.7)'); d.addColorStop(0.7, 'rgba(210, 222, 234, 0.28)'); d.addColorStop(1, 'rgba(110, 128, 150, 0.22)');
      x.fillStyle = d; x.beginPath(); x.arc(gx, gy, r, 0, 6.2832); x.fill();
    }
    // quelques coulures : un trait clair qui descend et finit par une grosse goutte
    for (i = 0; i < 16; i++) {
      var cx = alea() * l, cy = h * (f + alea() * 0.35), lg = 60 + alea() * 190;
      var tr = x.createLinearGradient(0, cy, 0, cy + lg);
      tr.addColorStop(0, 'rgba(255, 255, 255, 0)'); tr.addColorStop(0.2, 'rgba(255, 255, 255, 0.34)'); tr.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
      x.fillStyle = tr; x.fillRect(cx - 1.6, cy, 3.2, lg);
      var gt = x.createRadialGradient(cx - 1, cy + lg - 1, 0, cx, cy + lg, 5);
      gt.addColorStop(0, 'rgba(255, 255, 255, 0.85)'); gt.addColorStop(1, 'rgba(120, 140, 160, 0.3)');
      x.fillStyle = gt; x.beginPath(); x.arc(cx, cy + lg, 4.4, 0, 6.2832); x.fill();
    }
    Fx.surDepart(scene, function () { c.width = 1; c.height = 1; retirer(calque); });
    if (calme) {
      // un fondu : le voile est en place, il paraît en 0,6 s
      c.style.top = (-F / H * 100).toFixed(2) + '%'; c.style.opacity = 0; c.style.transition = 'opacity 600ms ease';
      Fx.ensuite(function () { c.style.opacity = 1; });
      return Fx.pause(scene, 650);
    }
    // la lisière entre par le bas et monte jusqu'à passer le haut de la page (4 s)
    c.style.transform = 'translateY(' + (H / E * 100).toFixed(2) + '%)';
    c.style.transition = 'transform 4000ms cubic-bezier(.35, .05, .3, 1)';
    Fx.ensuite(function () { c.style.transform = 'translateY(' + (-F / E * 100).toFixed(2) + '%)'; });
    return Fx.pause(scene, 4000);
  };
})();

// ---------------------------------------------------------------- chapitre 5 (suite) : la façade, la galerie, la vidéo, le travelling
(function () {
  // ---- vignette (5.5) : la façade qui se dessine, un mirage
  // Traitement, 5.5 : « `vignette` tracée (les traits d'encre, puis le lavis couleur de lait, 2,5 s) sur « Elle va passer
  // la porte marbrée », avec la `chaleur` de 1.4 (l'air qui tremble) ; elle reste jusqu'à « Jivan lève les yeux au ciel »,
  // où elle s'évapore vers le haut (1,5 s), là où il regarde » ; synthèse : « Une image sans cadre, bords déchirés : ses
  // traits d'encre, puis son lavis ; `chaleur` : l'air tremble ; `fin` : elle s'évapore vers le haut ; 1,5 + 1 s ; 1,5 s ».
  // Une toile, dessinée sans jamais lire un pixel (les liseuses l'interdisent aux images d'un autre fichier) : le papier
  // aux bords déchirés ; la façade en croquis (l'image en gris, éclaircie par son propre flou : la méthode du crayon) que
  // l'encre dévoile du centre vers les bords en 1,5 s ; puis le lavis, l'image en couleur, en 1 s. Au repos, l'air chaud la
  // fait trembler (des bandes de 4 px décalées de côté, plus fort en bas, comme en 1.4). `fin` : elle monte, s'étire,
  // tremble de plus en plus, et s'efface. Mouvement réduit : elle paraît en fondu, entière, et s'efface en fondu.
  function bruit(alea, n) {      // des valeurs lisses entre -1 et 1, bouclées : le contour déchiré
    var v = [], i;
    for (i = 0; i < n; i++) v.push(alea() * 2 - 1);
    return function (u) {
      var x = u * n, i0 = Math.floor(x) % n, i1 = (i0 + 1) % n, t = x - Math.floor(x);
      return v[i0] + (v[i1] - v[i0]) * lisse(t);
    };
  }
  // Un carré aux coins arrondis dont le bord ondule, s'effrange et s'entaille par endroits (la graine donne toujours le
  // même), tracé dans x.
  function dechire(x, cx, cy, demi, graine, marge) {
    var alea = Fx.alea(graine), n1 = bruit(alea, 7), n2 = bruit(alea, 29), n3 = bruit(alea, 131), n4 = bruit(alea, 53), N = 320, i;
    x.beginPath();
    for (i = 0; i <= N; i++) {
      var u = i / N, a = u * 6.2832, ca = Math.cos(a), sa = Math.sin(a);
      var r = demi / Math.pow(Math.pow(Math.abs(ca), 3.2) + Math.pow(Math.abs(sa), 3.2), 1 / 3.2);
      var entaille = Math.max(0, n4(u % 1)); entaille = entaille * entaille * entaille;      // de rares déchirures plus profondes
      r = (r - marge) * (1 + 0.05 * n1(u % 1) + 0.022 * n2(u % 1) + 0.009 * n3(u % 1) - 0.07 * entaille);
      if (i) x.lineTo(cx + ca * r, cy + sa * r); else x.moveTo(cx + ca * r, cy + sa * r);
    }
    x.closePath();
  }
  function toileVide(S) { var o = el('canvas'); o.width = S; o.height = S; return o; }
  Effets.vignette = function (scene, e) {
    var fx = Fx.etat(scene);
    if (e.fin) return evaporer(scene, fx);
    var place = e.place || [600, 760, 260], R = place[2], S = Math.round(2 * R), src = Fx.fichierDecor(e.image || 'facade');
    var calque = Fx.calque(scene, 'vignette', 4, false), cv = el('canvas', { 'class': 'vignette-toile' }, calque);
    cv.width = S; cv.height = S;
    Fx.poser(cv, place[0] - R, place[1] - R, 2 * R, 2 * R);
    var v = fx.vignette = { calque: calque, toile: cv, evapore: null, fini: false, tache: null };
    return Fx.chargerImage(src).then(function (img) {
      if (!img || !Fx.vivante(scene, fx)) { retirer(calque); return; }
      var d = cv.getContext('2d'), hors = [];
      function neuve() { var o = toileVide(S); hors.push(o); return o; }
      Fx.surDepart(scene, function () { hors.forEach(function (o) { o.width = 1; o.height = 1; }); cv.width = 1; cv.height = 1; });
      var papier = neuve(), croquis = neuve(), lavis = neuve(), cur = neuve(), masque = neuve(), tmp = neuve();
      // le morceau de la façade pris en carré : centre (fractions de l'image) et côté (fraction de la largeur)
      var cadre = e.source || [0.52, 0.5, 0.62], w = img.naturalWidth, h = img.naturalHeight;
      var cote = Math.min(h, cadre[2] * w), sx = Math.max(0, Math.min(w - cote, cadre[0] * w - cote / 2)), sy = Math.max(0, Math.min(h - cote, cadre[1] * h - cote / 2));
      // 1. le papier couleur de lait (une frange claire de fibres, un peu d'ombre) et le masque de son bord déchiré
      var p = papier.getContext('2d');
      p.shadowColor = 'rgba(40, 28, 10, 0.5)'; p.shadowBlur = 16; p.shadowOffsetY = 6;
      dechire(p, S / 2, S / 2, S / 2, 11, 5); p.fillStyle = '#fcf9f1'; p.fill();
      p.shadowColor = 'transparent';
      dechire(p, S / 2, S / 2, S / 2, 23, 14); p.fillStyle = '#f2e7d0'; p.fill();
      var m = masque.getContext('2d');
      dechire(m, S / 2, S / 2, S / 2, 23, 14); m.fillStyle = '#000'; m.fill();
      // 2. le lavis : la façade en couleur
      lavis.getContext('2d').drawImage(img, sx, sy, cote, cote, 0, 0, S, S);
      // 3. le croquis : l'image en gris, dodgée par son négatif flou (le crayon) : des traits sombres sur le blanc
      var gris = neuve(), neg = neuve(), g1 = gris.getContext('2d'), n1 = neg.getContext('2d'), q = croquis.getContext('2d');
      g1.drawImage(img, sx, sy, cote, cote, 0, 0, S, S);
      g1.globalCompositeOperation = 'saturation'; g1.fillStyle = '#808080'; g1.fillRect(0, 0, S, S);
      n1.drawImage(gris, 0, 0);
      n1.globalCompositeOperation = 'difference'; n1.fillStyle = '#fff'; n1.fillRect(0, 0, S, S);
      // le flou du négatif : réduit deux fois, puis agrandi
      var t1 = Math.round(S / 3), t2 = Math.round(S / 9), pe = toileVide(t1), pe2 = toileVide(t2);
      pe.getContext('2d').drawImage(neg, 0, 0, t1, t1);
      pe2.getContext('2d').drawImage(pe, 0, 0, t2, t2);
      n1.globalCompositeOperation = 'source-over'; n1.clearRect(0, 0, S, S);
      n1.imageSmoothingEnabled = true; n1.imageSmoothingQuality = 'high'; n1.drawImage(pe2, 0, 0, S, S);
      pe.width = 1; pe2.width = 1;
      q.drawImage(gris, 0, 0);
      q.globalCompositeOperation = 'color-dodge'; q.drawImage(neg, 0, 0);
      q.globalCompositeOperation = 'screen'; q.fillStyle = 'rgba(255, 255, 255, 0.16)'; q.fillRect(0, 0, S, S);
      gris.width = 1; neg.width = 1;
      // le dessin du moment : le papier, le lavis (à lav), le croquis dévoilé du centre jusqu'à rev, le tout retenu dans le bord déchiré
      var u = cur.getContext('2d'), tc = tmp.getContext('2d');
      function composer(rev, lav, apparu) {
        u.globalCompositeOperation = 'source-over'; u.globalAlpha = 1; u.clearRect(0, 0, S, S);
        u.globalAlpha = apparu; u.drawImage(papier, 0, 0);
        if (lav > 0) { u.globalCompositeOperation = 'multiply'; u.globalAlpha = lav * apparu; u.drawImage(lavis, 0, 0); }
        if (rev > 0) {
          var Rv = S * 0.44 * rev;
          tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, S, S); tc.drawImage(croquis, 0, 0);
          tc.globalCompositeOperation = 'destination-in';
          var rg = tc.createRadialGradient(S / 2, S / 2, Rv * 0.5, S / 2, S / 2, Rv + 1);
          rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
          tc.fillStyle = rg; tc.fillRect(0, 0, S, S);
          u.globalCompositeOperation = 'multiply'; u.globalAlpha = (lav > 0.99 ? 0.6 : 0.92) * apparu; u.drawImage(tmp, 0, 0);
        }
        u.globalAlpha = 1; u.globalCompositeOperation = 'destination-in'; u.drawImage(masque, 0, 0);
        u.globalCompositeOperation = 'source-over';
      }
      // une image à l'écran : le dessin tel quel, ou en bandes que l'air chaud décale de côté (plus fort en bas)
      function montrer(t, chaud) {
        d.clearRect(0, 0, S, S);
        if (!chaud) { d.drawImage(cur, 0, 0); return; }
        for (var i = 0; i < S; i += 4) {
          var y = i / S, a = (2.6 + 5 * (v.evapore || 0)) * (0.18 + 0.82 * Math.pow(y, 1.4));
          var hb = Math.min(5, S - i);
          d.drawImage(cur, 0, i, S, hb, a * (Math.sin(i / 21 - t * 1.9) * 0.65 + Math.sin(i / 47 - t * 1.1 + 1.3) * 0.35), i, S, hb);
        }
      }
      v.composer = composer; v.montrer = montrer;
      if (v.evapore !== null) return;                       // `fin` est déjà venue : rien à montrer
      Fx.sonner('pinceau');
      if (calme || e.trace === false) {
        composer(1.8, 1, 1); montrer(0, false); v.fini = true;
        calque.style.opacity = 0; calque.style.transition = 'opacity 400ms ease';
        Fx.ensuite(function () { calque.style.opacity = 1; });
        return Fx.pause(scene, 450);
      }
      // le tracé : 1,5 s d'encre, puis 1 s de lavis ; ensuite l'air chaud (si `chaleur`) jusqu'au départ de la façade
      v.tache = Fx.tache(scene, function (tt) {
        if (v.evapore !== null) return false;
        if (tt < 2.5) { composer(1.8 * lisse(borne(tt / 1.5)), lisse(borne((tt - 1.5) / 1.0)), borne(tt / 0.25)); montrer(tt, false); return; }
        if (!v.fini) { composer(1.8, 1, 1); v.fini = true; }
        if (!e.chaleur) { montrer(tt, false); return false; }
        if (tt - (v.dernier || 0) < 0.04) return;          // une image sur deux suffit à une ondulation lente
        v.dernier = tt; montrer(tt, true);
      });
    });
  };
  // `fin` : la façade s'évapore vers le haut (1,5 s), là où Jivan regarde
  function evaporer(scene, fx) {
    var v = fx.vignette, k = FxB.k(scene);
    if (!v) return;
    v.evapore = 0;
    Fx.sonner('souffle');
    if (calme) {
      v.calque.style.transition = 'opacity 400ms ease'; v.calque.style.opacity = 0;
      Fx.minuterie(scene, function () { retirer(v.calque); }, 500, true);
      return Fx.pause(scene, 450);
    }
    if (!v.montrer) { retirer(v.calque); return; }         // l'image n'est pas encore venue
    if (!v.fini) { v.composer(1.8, 1, 1); v.fini = true; }
    v.toile.style.transformOrigin = '50% 100%';
    var depart = null;
    return new Promise(function (ok) {
      Fx.tache(scene, function (tt) {
        if (depart === null) depart = tt;
        var p = borne((tt - depart) / 1.5);
        v.evapore = p * 3;
        v.montrer(tt, true);
        v.toile.style.transform = 'translateY(' + (-(40 * p + 260 * lent(p)) * k).toFixed(1) + 'px) scale(1,' + (1 + 0.28 * p).toFixed(3) + ')';
        v.toile.style.opacity = (1 - lisse(borne((p - 0.12) / 0.88))).toFixed(3);
        if (p >= 1) { retirer(v.calque); ok(); return false; }
      });
    });
  }

  // ---- la galerie de Julie : cliche (5.6, 5.7)
  // Traitement, 5.6 : « l'écran du téléphone de Julie en pleine page (fond noir, barre d'état avec le compte, grille de
  // vignettes carrées, trois par rangée, sans aucun texte). `cliche` ouvre un cliché (`image`) de sa vignette aux deux
  // tiers hauts ; `voisin=True` : le cliché précédent regagne la grille et la vignette voisine s'éclaire ; `parcourir=True` :
  // la grille défile vite vers le bas et remonte (1,2 s) ; `video=True` : une vignette avec un triangle de lecture ;
  // `grille=True` : la page s'ouvre sur la grille (l'état de 5.7) ; `flou="mise-au-point"` ou `"bouge"` : le cliché reste
  // flou tant que le repérage manque. » Le fond noir et la grille sont ceux de la mécanique `galerie` (scene.galerie) ; en
  // 5.7, qui n'a pas de geste d'ouverture, l'effet la pose ouverte. Les images sont celles de decors.py : `nom-vignette`
  // (carrée) et `nom-cliche` (2:3). Mouvement réduit : des fondus.
  var CLICHE = [200, 140, 800, 1200];       // les deux tiers hauts de la page : x, y, largeur, hauteur (unités)
  function lePhone(scene, images) {
    var g = Gestes.galerie(scene, { images: images || [], ouverte: true });
    if (g) g.ouvrir(1);
    return g;
  }
  function placeDe(scene, n) { return n ? zone(n, scene) : null; }
  function ouvrirCliche(scene, g, nom, e, depuis) {
    var fx = Fx.etat(scene), src = Fx.fichierDecor(nom + '-cliche') || Fx.fichierDecor(nom);
    var boite = el('div', { 'class': 'fx cliche' }, g.ecran), img = el('img', { alt: '' }, boite), u = FxB.k(scene);
    img.setAttribute('decoding', 'async');
    if (src) img.setAttribute('src', src);
    // le flou d'attente, tant que la photo de Karl manque : de mise au point (rond) ou bougé (étiré de côté)
    if (e.flou === 'bouge') {
      var id = Gestes.suivant('bouge'), svg = svgEl('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false', style: 'position:absolute' }, boite);
      var f = svgEl('filter', { id: id, x: '-10%', y: '-10%', width: '120%', height: '120%' }, svgEl('defs', {}, svg));
      svgEl('feGaussianBlur', { stdDeviation: (22 * u).toFixed(1) + ' ' + (2 * u).toFixed(1) }, f);
      img.style.filter = 'url(#' + id + ')'; img.style.webkitFilter = img.style.filter;
    } else if (e.flou) {
      img.style.filter = 'blur(' + (20 * u).toFixed(1) + 'px)'; img.style.webkitFilter = img.style.filter;
    }
    var de = depuis || [440, 640, 320, 320], vers = CLICHE;
    function poserLaBoite(t) { Fx.poser(boite, de[0] + (vers[0] - de[0]) * t, de[1] + (vers[1] - de[1]) * t, de[2] + (vers[2] - de[2]) * t, de[3] + (vers[3] - de[3]) * t); }
    poserLaBoite(0);
    fx.cliche = { boite: boite, nom: nom, vers: vers };
    Fx.sonner('tic', { monde: 'julie', force: 0.6 });
    if (g.grille) g.grille.classList.add('sous-cliche');
    if (calme) {
      poserLaBoite(1); boite.style.opacity = 0; boite.style.transition = 'opacity 250ms';
      Fx.ensuite(function () { boite.style.opacity = 1; });
      return Fx.pause(scene, 300);
    }
    return Fx.animer(scene, 1200, function (p) { poserLaBoite(vif(p)); boite.style.opacity = Math.min(1, p * 5).toFixed(3); });
  }
  // Le cliché ouvert regagne sa vignette (en mouvement réduit, il s'efface).
  function fermerCliche(scene, g, ms) {
    var fx = Fx.etat(scene), c = fx.cliche;
    if (!c) return Promise.resolve();
    fx.cliche = null;
    var dest = placeDe(scene, g && g.vignette(c.nom));
    if (g && g.grille) g.grille.classList.remove('sous-cliche');
    if (calme || !dest) {
      c.boite.style.transition = 'opacity 250ms'; c.boite.style.opacity = 0;
      Fx.minuterie(scene, function () { retirer(c.boite); }, 300, true);
      return Fx.pause(scene, 250);
    }
    return Fx.animer(scene, ms || 650, function (p) {
      var t = 1 - lisse(p);
      Fx.poser(c.boite, dest[0] + (c.vers[0] - dest[0]) * t, dest[1] + (c.vers[1] - dest[1]) * t, dest[2] + (c.vers[2] - dest[2]) * t, dest[3] + (c.vers[3] - dest[3]) * t);
      c.boite.style.opacity = (p < 0.7 ? 1 : (1 - p) / 0.3).toFixed(3);
    }).then(function () { retirer(c.boite); });
  }
  // Chaque glissement vers le haut avance d'un temps, jusqu'à la fin de la page (comme la mécanique `galerie` en 5.6 ; elle ne
  // l'exporte pas : si elle le fait un jour (Gestes.feuilleter), on prend le sien).
  function feuilleter(scene) {
    if (typeof Gestes.feuilleter === 'function') { Gestes.feuilleter(scene); return; }
    var recit = scene.recit, depart = null;
    if (!recit || scene.feuilletage) return;
    scene.feuilletage = true;
    function fin() { scene.removeEventListener('pointerdown', bas); scene.removeEventListener('pointerup', haut); scene.feuilletage = false; }
    function vivant() { return scene.recit === recit && !recit.fini; }
    function bas(ev) { if (!vivant()) { fin(); return; } if (!horsInterface(ev)) return; depart = coordScene(scene, ev); }
    function haut(ev) {
      if (!vivant()) { fin(); return; }
      if (!depart) return;
      var q = coordScene(scene, ev), dy = depart.y - q.y, dx = Math.abs(q.x - depart.x);
      depart = null;
      if (dy > 120 && dx < dy && !bloque() && !recit.enAttente && scene.classList.contains('active')) {
        Gestes.avalerClic(scene);
        recit.avancer();
      }
    }
    scene.addEventListener('pointerdown', bas);
    scene.addEventListener('pointerup', haut);
    Fx.surDepart(scene, fin);
  }
  Effets.cliche = function (scene, e) {
    var g = scene.galerie;
    if (e.grille) {
      // 5.7 : la page s'ouvre sur la grille ; ses clichés sont ceux de 5.6, puis ceux que le téléphone a pris depuis
      lePhone(scene, e.images || ['bonbons', 'patinoire', 'croque-serre', 'deux-flous', 'reflet-paris']);
      if (e.feuilleter) feuilleter(scene);
      return;
    }
    if (!g) g = lePhone(scene, [e.image].filter(Boolean));
    if (!g) return;
    if (e.parcourir) {
      // le cliché regagne la grille, qui défile vite (le contenu monte) puis remonte : 1,2 s en tout
      var ferme = fermerCliche(scene, g, 400), u = FxB.k(scene);
      if (calme) return ferme;
      return ferme.then(function () {
        return Fx.animer(scene, 800, function (p) {
          var y = p < 0.45 ? vif(p / 0.45) : 1 - lisse((p - 0.45) / 0.55);
          g.grille.style.transform = 'translateY(' + (-y * 420 * u).toFixed(1) + 'px)';
        });
      }).then(function () { g.grille.style.transform = ''; });
    }
    if (e.video) return vignetteDeLaVideo(scene, g, e);
    var nom = e.image, suite = fermerCliche(scene, g, 650);
    if (e.voisin) {
      // la vignette voisine s'éclaire d'un liseré de lumière, puis le cliché s'ouvre de sa place
      suite = suite.then(function () {
        var v = g.vignette(nom);
        if (v) { v.classList.add('lumiere'); return Fx.pause(scene, calme ? 150 : 450); }
      });
    }
    return suite.then(function () {
      var v2 = g.vignette(nom);
      if (v2) Fx.minuterie(scene, function () { v2.classList.remove('lumiere'); }, 1300, true);
      return ouvrirCliche(scene, g, nom, e, placeDe(scene, v2));
    });
  };
  // La vignette de la vidéo : seule, au centre, un triangle de lecture sur la pleine lune (5.7, dernier temps).
  function vignetteDeLaVideo(scene, g, e) {
    var fx = Fx.etat(scene), nom = e.image || 'video-lune', src = Fx.fichierDecor(nom + '-vignette') || Fx.fichierDecor(nom);
    return fermerCliche(scene, g, 500).then(function () {
      var v = el('div', { 'class': 'fx video-vignette' }, g.ecran), img = el('img', { alt: '' }, v), c = e.cible || [600, 640, 220];
      if (src) img.setAttribute('src', src);
      var tri = svgEl('svg', { 'class': 'video-triangle', viewBox: '0 0 100 100', 'aria-hidden': 'true', focusable: 'false' }, v);
      svgEl('circle', { cx: 50, cy: 50, r: 22, fill: 'rgba(20, 20, 24, 0.55)', stroke: '#fff', 'stroke-width': 2 }, tri);
      svgEl('path', { d: 'M44,40 L61,50 L44,60 Z', fill: '#fff' }, tri);
      Fx.poser(v, c[0] - c[2], c[1] - c[2], 2 * c[2], 2 * c[2]);
      fx.videoVignette = v;
      if (g.grille) g.grille.classList.add('sous-cliche');
      v.style.opacity = 0;
      v.style.transition = calme ? 'opacity 250ms' : 'opacity 600ms ease, transform 700ms cubic-bezier(.2, 1.2, .4, 1)';
      if (!calme) v.style.transform = 'scale(0.82)';
      Fx.ensuite(function () { v.style.opacity = 1; v.style.transform = ''; });
      Fx.sonner('tic', { monde: 'julie', force: 0.6 });
      return Fx.pause(scene, calme ? 300 : 700);
    });
  }

  // ---- video-lune (5.7, 5.8) : la vidéo de la ballade
  // La pleine lune derrière une cheminée, en largeur dans l'écran tenu droit (bandes noires en haut et en bas), qui tremble à
  // peine ; une barre de lecture fine ; une note ♪ qui bat tant que la ballade joue ; elle s'arrête sur son dernier plan.
  // Traitement, 5.7 : « Au toucher, la vidéo s'ouvre en largeur […] ; l'image tremble à peine ; une fine barre de lecture
  // avance ; à la fin, la vidéo s'arrête sur son dernier plan. Tant que la ballade joue, une petite note ♪ bat près de la
  // vidéo » ; 5.8 (`agrandir`) : « la page s'ouvre sur la vidéo arrêtée de 5.7, qui s'agrandit jusqu'au plein cadre
  // (`souvenir-lune` […]) : on entre dans le souvenir ». La vidéo est une image : le tremblement (quatre unités, un peu moins
  // de 0,3 Hz) et un très lent rapprochement la font vivre. Mouvement réduit : l'image ne tremble ni ne se rapproche.
  var BANDE = [0, 562, 1200, 675];          // la vidéo, en largeur : x, y, largeur, hauteur
  function ecranNoir(scene) {
    var g = scene.galerie;
    if (g) { g.ouvrir(1); return g.ecran; }
    var ecran = Gestes.coucheSous(scene, 'galerie-ecran');
    ecran.style.visibility = 'visible'; ecran.style.opacity = 1; ecran.style.transform = 'none';
    return ecran;
  }
  function barreDeLecture(parent, y) {
    var b = el('div', { 'class': 'fx video-barre' }, parent), plein = el('div', { 'class': 'video-barre-plein' }, b), bille = el('div', { 'class': 'video-barre-bille' }, b);
    Fx.poser(b, 70, y, 1060, 6);
    return function (p) { plein.style.width = (p * 100).toFixed(2) + '%'; bille.style.left = (p * 100).toFixed(2) + '%'; };
  }
  // La note ♪ (une croche) dessinée par le moteur : elle bat à la pulsation de la ballade.
  function noteDeMusique(parent, x, y) {
    var s = svgEl('svg', { 'class': 'fx video-note', viewBox: '0 0 60 80', 'aria-hidden': 'true', focusable: 'false' }, parent);
    var g = svgEl('g', { fill: '#fff' }, s);
    svgEl('ellipse', { cx: 20, cy: 62, rx: 13, ry: 9.5, transform: 'rotate(-22 20 62)' }, g);
    svgEl('rect', { x: 29.5, y: 10, width: 4.4, height: 52 }, g);
    svgEl('path', { d: 'M33.5,10 C40,18 52,22 50,40 C47,30 40,29 33.5,28 Z' }, g);
    Fx.poser(s, x - 30, y - 40, 60, 80);
    return s;
  }
  Effets['video-lune'] = function (scene, e) {
    var fx = Fx.etat(scene), src = Fx.fichierDecor(e.image || 'video-lune'), ecran = ecranNoir(scene), u = FxB.k(scene);
    if (!src) return;
    var boite = el('div', { 'class': 'fx video-cadre' }, ecran), img = el('img', { alt: '' }, boite);
    img.setAttribute('src', src);
    Fx.surDepart(scene, function () { retirer(boite); });
    var charge = Fx.chargerImage(src);      // l'image est lue avant le premier mouvement : l'écran noir, lui, est déjà posé
    if (e.agrandir) {
      // 5.8 : la vidéo arrêtée, telle que 5.7 la laisse, grandit jusqu'au plein cadre ; l'écran noir se retire sur le décor
      var origine = e.origine || [512, 913], echelle = e.echelle || 2.6;
      Fx.poser(boite, BANDE[0], BANDE[1], BANDE[2], BANDE[3]);
      barreDeLecture(ecran, 1262)(1);
      if (calme) {
        ecran.style.transition = 'opacity 500ms';
        return charge.then(function () {
          Fx.ensuite(function () { ecran.style.opacity = 0; });
          return Fx.pause(scene, 600);
        }).then(function () { retirer(ecran); });
      }
      boite.style.transformOrigin = pourcent(origine[0], W) + ' ' + pourcent(origine[1], H);
      return charge.then(function () {
        return Fx.animer(scene, 2200, function (p) {
          boite.style.transform = 'scale(' + (1 + (echelle - 1) * lisse(p)).toFixed(4) + ')';
          ecran.style.opacity = (1 - lisse(borne((p - 0.5) / 0.5))).toFixed(3);
        });
      }).then(function () { retirer(ecran); });
    }
    // 5.7 : la vidéo s'ouvre (de la vignette) en largeur, joue la ballade, tremble à peine, s'arrête sur son dernier plan
    var DUREE = e.duree || 14500, vignette = fx.videoVignette, depuis = (vignette && placeDe(scene, vignette)) || [380, 420, 440, 440], g = scene.galerie;
    Fx.poser(boite, depuis[0], depuis[1], depuis[2], depuis[3]);
    var progres = barreDeLecture(ecran, 1262), note = noteDeMusique(ecran, 1060, 520);
    progres(0); note.style.opacity = 0;
    // les bandes noires : la grille et la vignette de la vidéo s'effacent
    if (g && g.grille) { g.grille.style.transition = 'opacity 500ms'; g.grille.style.opacity = 0; }
    if (vignette) { vignette.style.transition = 'opacity 400ms'; vignette.style.opacity = 0; }
    var lue = charge.then(function () {});
    if (calme) {
      Fx.poser(boite, BANDE[0], BANDE[1], BANDE[2], BANDE[3]);
      boite.style.opacity = 0; boite.style.transition = 'opacity 300ms';
      return { suite: lue, fin: lue.then(function () {
        Fx.ensuite(function () { boite.style.opacity = 1; note.style.opacity = 1; });
        return new Promise(function (ok) {
          Fx.tache(scene, function (t) { progres(borne(t * 1000 / DUREE)); if (t * 1000 >= DUREE) { ok(); return false; } });
        });
      }) };
    }
    var fin = lue.then(function () {
      return new Promise(function (ok) {
        Fx.tache(scene, function (t) {
          var p = borne(t * 1000 / DUREE), o = lisse(borne(t / 0.9));
          // l'ouverture : de la vignette (carrée) à la largeur de l'écran
          Fx.poser(boite, depuis[0] + (BANDE[0] - depuis[0]) * o, depuis[1] + (BANDE[1] - depuis[1]) * o,
            depuis[2] + (BANDE[2] - depuis[2]) * o, depuis[3] + (BANDE[3] - depuis[3]) * o);
          // l'image tremble à peine (quatre unités) et se rapproche d'un rien
          var tr = o >= 1 ? 1 : 0;
          img.style.transform = 'translate(' + (tr * 4 * u * Math.sin(t * 1.885)).toFixed(2) + 'px,' + (tr * 3 * u * Math.sin(t * 1.62 + 1)).toFixed(2) + 'px) scale(' + (1 + 0.035 * p).toFixed(4) + ')';
          progres(p);
          // la note bat à la pulsation de la ballade (64 à la noire pointée : 0,94 s), tant qu'elle joue
          var bat = Math.exp(-((t / 0.9375) % 1) * 5);
          note.style.opacity = (borne((t - 0.5) / 0.5) * (p < 1 ? 0.55 + 0.45 * bat : 0)).toFixed(3);
          note.style.transform = 'scale(' + (1 + 0.2 * bat).toFixed(3) + ')';
          if (p >= 1) { note.style.opacity = 0; ok(); return false; }
        });
      });
    });
    return { suite: lue, fin: fin };
  };

  // ---- camera (5.8, 5.9) : jusqu'au cadrage d'un autre plan, dans la même photo
  // Traitement, 5.8 : « Sur « il s'avance vers elle en déclamant ses vers », la vue avance en sept secondes jusqu'à
  // `souvenir-lune-proche` (zoom 2,2) […] `souvenir-lune` est fabriqué à la définition de la photo, pour que l'image reste
  // nette pendant tout le mouvement et que l'arrivée ne saute pas » ; 5.9 : « la vue monte en neuf secondes dans la même
  // photo jusqu'à `lune-haute` […] une bande verticale de la photo suffit ». Le cadrage du plan visé vient de la fiche :
  // `cadre` = [x, y, zoom] du plan (livre.py, DECORS) pour `avance` ; `bande` (l'image de la bande verticale) et `haut` = les `y`
  // des deux plans pour `monte`. À l'arrivée, le plan visé (`vers`) prend la place sans un saut. Mouvement réduit : un fondu
  // vers le plan d'arrivée. Les autres mouvements restent à la caméra des chapitres 0 à 3.
  var cameraAvant = Effets.camera;
  Effets.camera = function (scene, e) {
    if (typeof e.vers === 'number' && e.avance === true && e.cadre) return travelling(scene, e);
    if (typeof e.vers === 'number' && e.monte === true && e.bande) return panoramique(scene, e);
    return cameraAvant(scene, e);
  };
  function aLArrivee(scene, e) {
    // le plan visé paraît tel quel (même cadrage) ; la caméra repart de zéro
    var d = Fx.decor(scene);
    Visuels.plan(scene, e.vers, { fondu: 1 });
    if (d) { d.style.transition = 'none'; d.style.transform = ''; d.style.transformOrigin = ''; }
  }
  function travelling(scene, e) {
    if (calme) return Visuels.plan(scene, e.vers, {});
    var z = e.cadre[2] || 2, x = e.cadre[0], y = e.cadre[1], d = Fx.decor(scene);
    if (!d) return;
    // le milieu du cadre visé, dans le plan de départ (en unités) ; l'origine du zoom qui l'amène au milieu de la page
    var px = (x * (1 - 1 / z) + 0.5 / z) * W, py = (y * (1 - 1 / z) + 0.5 / z) * H;
    var ox = (W / 2 - z * px) / (1 - z), oy = (H / 2 - z * py) / (1 - z);
    return Visuels.camera(scene, { avance: z, vers: [ox, oy], duree: e.duree || 7000 }).then(function () { aLArrivee(scene, e); });
  }
  function panoramique(scene, e) {
    if (calme) return Visuels.plan(scene, e.vers, {});
    var src = Fx.fichierDecor(e.bande), d = Fx.decor(scene), fx = Fx.etat(scene);
    if (!src || !d) return;
    return Fx.chargerImage(src).then(function (img) {
      if (!img || !Fx.vivante(scene, fx)) return;
      // la bande verticale (largeur de la page, hauteur plus grande) glisse du cadrage du plan visible à celui du plan visé
      var echelle = W / img.naturalWidth, bandeH = img.naturalHeight * echelle, cadreH = img.naturalWidth * 1.5 * echelle;
      var y0 = (e.haut || [1, 0])[0] * (bandeH - cadreH), y1 = (e.haut || [1, 0])[1] * (bandeH - cadreH);
      var calque = Fx.calque(scene, 'panoramique', 1, false), bande = Fx.image(src, { 'class': 'panoramique-bande' }, calque);
      Fx.poser(bande, 0, -y0, W, bandeH);
      return Fx.animer(scene, e.duree || 9000, function (p) {
        Fx.poser(bande, 0, -(y0 + (y1 - y0) * lisse(p)), W, bandeH);
      }).then(function () { aLArrivee(scene, e); retirer(calque); });
    });
  }
})();

// ================================================================ effets nouveaux, chapitres 4 à 8 (fin)

// ================================================================ effets des réponses de Karl (début)
/* Les effets qu'appellent les réponses de Karl (2.7 : Darshan commande le dessert ; 1.5 : Jivan,
   « la vie »), écrits avec les scènes ; chacun juste au-dessus de la ligne « (fin) » ci-dessous. */
// ================================================================ effets des réponses de Karl (fin)
