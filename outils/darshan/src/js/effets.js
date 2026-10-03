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
  // Le genre d'un plan (data-genre, écrit par build.py) : « photo », « encre », « dessin » ou « uni ».
  // Le froid, le gel et le papier de l'effacement ne touchent que les photos ; le graffiti « aime »,
  // photo lui aussi, garde ses couleurs (6.11 : le froid ne le touche pas).
  function genreDuPlan(scene, i) {
    var p = plans(scene)[i] || (i === 0 ? decor(scene) : null);
    return (p && p.getAttribute('data-genre')) || null;
  }
  function estPhoto(scene, i) {
    if (nomDuPlan(scene, i) === 'graffiti') return false;
    return genreDuPlan(scene, i) === 'photo';
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
    estPhoto: estPhoto, genreDuPlan: genreDuPlan, decor: decor, calque: calque, dessous: dessous, dessus: dessus, poser: poser, ensuite: ensuite,
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

// ================================================================ effets nouveaux, chapitres 0 à 3 (début)
/* Les effets qui manquaient, dont la première page est aux chapitres 0 à 3, s'ajoutent ici, chacun
   juste au-dessus de la ligne « (fin) » ci-dessous (deux équipes écrivent en même temps). */
/* Outils communs des effets de cette zone, rangés sous un seul nom : les fragments partagent une seule
   portée, et la zone des chapitres 4 à 8 a les siens. Un effet déjà là qui reçoit ici de nouveaux réglages
   (poussiere, flou, decor…) est enveloppé : l'effet d'origine garde tout ce qu'il savait faire, et ce qui ne
   le concerne pas lui est passé tel quel. */
var FxA = (function () {
  var numero = 0;
  // des identifiants uniques (l'édition web garde les 85 pages dans un seul document)
  function id(prefixe) { numero += 1; return prefixe + '-a' + numero; }
  // un dégradé dans un SVG ; arrets : [[position, couleur, opacité], …] ; rend « url(#…) »
  function degrade(svg, genre, attrs, arrets) {
    var defs = $('defs', svg) || svgEl('defs', {}, svg), i = id('d');
    attrs.id = i;
    var g = svgEl(genre, attrs, defs);
    arrets.forEach(function (a) { svgEl('stop', { offset: a[0], 'stop-color': a[1], 'stop-opacity': a.length > 2 ? a[2] : 1 }, g); });
    return 'url(#' + i + ')';
  }
  // Les grains d'une page (poussière d'or, étincelles, gouttes) : une seule toile, en définition 0,5
  // (ce qui est flou n'a pas besoin de plus), pour toutes les apparitions de la page ; chacune ajoute ses
  // grains, et l'animation s'arrête quand il n'en reste plus. Rend { jeter(liste), fixes(liste, ms) }.
  // Un grain : { x, y, vx, vy, gy (la pesanteur), r, a (opacité), entree, sortie, vie, couleur, sens (le
  // balancement de côté) } ; ses temps sont en secondes, ses vitesses en unités par seconde.
  function grains(scene) {
    var fx = Fx.etat(scene);
    if (fx.grainsA) return fx.grainsA;
    var T = Fx.toile(scene, 'grains', 6, 0.5), ctx = T.x, liste = [], tache = null;
    function opacite(g) {
      var e = g.entree ? Math.min(1, g.age / g.entree) : 1, s = g.sortie ? Math.min(1, (g.vie - g.age) / g.sortie) : 1;
      return g.a * lisse(e) * lisse(s);
    }
    function dessiner(g, a) {
      ctx.globalAlpha = a * 0.24; ctx.fillStyle = g.couleur;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 3, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = a; ctx.fillStyle = g.couleur;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 6.2832); ctx.fill();
    }
    function image(t, dt) {
      ctx.clearRect(0, 0, W, H);
      for (var i = liste.length - 1; i >= 0; i--) {
        var g = liste[i];
        g.age += dt;
        if (g.age >= g.vie) { liste.splice(i, 1); continue; }
        g.vy += (g.gy || 0) * dt;
        g.x += (g.vx + (g.balance ? Math.sin(g.age * 1.7 + g.p) * g.balance : 0)) * dt;
        g.y += g.vy * dt;
        dessiner(g, opacite(g));
      }
      if (!liste.length) { tache = null; return false; }
    }
    var soi = fx.grainsA = {
      jeter: function (nouveaux) {
        nouveaux.forEach(function (g) { g.age = -(g.retard || 0); g.p = g.p || 0; liste.push(g); });
        if (!tache) tache = Fx.tache(scene, image);
      },
      // mouvement réduit : des points fixes qui s'éteignent, rien qui bouge
      fixes: function (points, ms) {
        return Fx.animer(scene, ms, function (x) {
          ctx.clearRect(0, 0, W, H);
          var v = lisse(Math.min(1, x / 0.2)) * (1 - lisse(Math.max(0, (x - 0.45) / 0.55)));
          points.forEach(function (g) { g.age = 0; dessiner(g, g.a * v); });
        });
      }
    };
    return soi;
  }
  return { id: id, degrade: degrade, grains: grains };
})();

// ================================================================ chapitre 0 : le poème d'ouverture (0.2)
(function () {
  // La ligne des arbres de arbres-poeme.webp (le haut du feuillage, une valeur de y tous les 20 unités, de
  // x = 0 à 1200), relevée sur le canal alpha du calque : le fil d'or court au ras d'elle (0.2), et le fil
  // d'encre de 8.1 en reprend le dessin, au bas de la page.
  var ARBRES = [1500, 1488, 1469, 1458, 1461, 1473, 1485, 1488, 1487, 1488, 1477, 1461, 1462, 1485, 1508, 1508, 1487,
    1471, 1468, 1468, 1467, 1461, 1454, 1447, 1436, 1427, 1444, 1477, 1498, 1498, 1497, 1505, 1534, 1576, 1584, 1553,
    1529, 1524, 1532, 1552, 1565, 1548, 1517, 1504, 1513, 1536, 1560, 1568, 1556, 1530, 1510, 1498, 1497, 1526, 1578,
    1608, 1622, 1646, 1661, 1663, 1663];
  var FIL = '#ffd98a', CHAUD = '#fff0c0';

  // Le chemin du fil : la ligne des arbres montée de `monte` unités ; ou, avec `y`, la même forme (à
  // l'échelle `k`) autour de la hauteur `y`.
  function ligneDesArbres(o) {
    var moy = ARBRES.reduce(function (s, v) { return s + v; }, 0) / ARBRES.length;
    var pts = ARBRES.map(function (v, i) {
      return [i * 20, o.y !== undefined ? o.y + (v - moy) * (o.k === undefined ? 1 : o.k) : v - (o.monte || 0)];
    });
    return Gestes.courbe(pts, false);
  }

  // Un fil d'or : un halo de sept couches de plus en plus fines (sans filtre : un flou se paie à chaque image),
  // le fil, son cœur blanc, et, si on la donne, une lueur ovale (`lueur` : { cx, cy, rx, ry, arrets }) ; `fabrique`
  // dessine la forme (un « path » ou un « circle », dont `attrs` donne les attributs). Rend poser(a, b) : a,
  // la présence (0 à 1), et b, l'embrasement (0 à 1) ; au repos, b = 0 : un fil mince, tenu, qui reste.
  var HALOS = [[72, 0.02], [58, 0.026], [46, 0.034], [36, 0.044], [27, 0.058], [19, 0.075], [12, 0.1]];
  function filDOr(svg, fabrique, attrs, degrade, lueur) {
    var base = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, flamme = null;
    if (lueur) {
      var rond = FxA.degrade(svg, 'radialGradient', { cx: 0.5, cy: 0.5, r: 0.5 },
        lueur.arrets || [[0, '#fff0c0', 0.8], [0.35, '#ffd98a', 0.34], [1, '#ffc060', 0]]);
      flamme = svgEl('ellipse', { cx: lueur.cx, cy: lueur.cy, rx: lueur.rx, ry: lueur.ry, fill: rond, opacity: 0 }, svg);
    }
    function un(largeur) { return fabrique(Fx.copie(Fx.copie(base, attrs), { stroke: degrade || FIL, 'stroke-width': largeur, opacity: 0 }), svg); }
    var halos = HALOS.map(function (h) { return un(h[0]); }), fil = un(3), coeur = un(1.4);
    coeur.setAttribute('stroke', CHAUD);
    return function poser(a, b) {
      var k = 0.4 + 1.8 * b;
      halos.forEach(function (h, i) {
        h.setAttribute('opacity', (a * HALOS[i][1] * k).toFixed(4)); h.setAttribute('stroke-width', (HALOS[i][0] * (1 + 0.45 * b)).toFixed(1));
      });
      fil.setAttribute('opacity', (a * (0.6 + 0.4 * b)).toFixed(3)); fil.setAttribute('stroke-width', (2 + 3.2 * b).toFixed(2));
      coeur.setAttribute('opacity', (a * (0.25 + 0.75 * b)).toFixed(3)); coeur.setAttribute('stroke-width', (1 + 1.8 * b).toFixed(2));
      if (flamme) flamme.setAttribute('opacity', (a * b * 0.9).toFixed(3));
    };
  }
  function chemin(attrs, parent) { return svgEl('path', attrs, parent); }
  function cercle(attrs, parent) { return svgEl('circle', attrs, parent); }

  // L'embrasement : le fil jaillit à pleine intensité, la tient `embrase` ms, puis se pose et reste. Mouvement
  // réduit : il paraît en fondu, sans embrasement. Le temps suivant attend l'embrasement, l'effet suivant non
  // (la course des astres part avec lui).
  function embraser(scene, poser, embrase) {
    poser(0, 0);
    if (calme) return Fx.animer(scene, 450, function (x) { poser(lisse(x), 0); });
    var fin = Fx.animer(scene, 140, function (x) { poser(1, vif(x)); })
      .then(function () { poser(1, 1); return Fx.pause(scene, embrase); })
      .then(function () { return Fx.animer(scene, 1500, function (x) { poser(1, 1 - lisse(x)); }); });
    return { suite: Promise.resolve(), fin: fin };
  }

  // 0.2, « La noirceur figée finit toujours par embrasser son éblouissante frontière » (traitement : « son
  // bord, un fil d'or au ras des arbres, s'embrase une demi-seconde à pleine intensité, puis se pose et
  // reste ») ; 7.11 `cercle` : l'anneau de l'éclipse s'embrase de même ; 8.1 `encre` : le même fil, à
  // l'encre, tracé de gauche à droite au bas de la page, sans embrasement.
  Effets.frontiere = function (scene, e) {
    if (e.encre) return filEncre(scene, e);
    var embrase = e.embrase === undefined ? 500 : e.embrase;
    if (e.cercle) {
      var svgC = Fx.calque(scene, 'frontiere', 5, true);
      var rond = { cx: e.x || 680, cy: e.y || 875, r: e.r || 180 };      // l'éclipse de 7.11, mesurée sur l'image
      return embraser(scene, filDOr(svgC, cercle, rond, null, { cx: rond.cx, cy: rond.cy, rx: rond.r * 2.3, ry: rond.r * 2.3,
        // la lueur ne part que de l'anneau : le disque noir de l'éclipse reste noir
        arrets: [[0, '#fff0c0', 0], [0.3, '#fff0c0', 0], [0.435, '#fff4d0', 0.8], [0.6, '#ffd98a', 0.3], [1, '#ffc060', 0]] }), embrase);
    }
    // 0.2 : le fil passe derrière les arbres et devant le ciel, au ras du feuillage
    var svg = Fx.calque(scene, 'frontiere', 5, true), arbres = $('.decor > img', scene);
    if (arbres && arbres.parentNode === Fx.decor(scene)) { Fx.decor(scene).insertBefore(svg, arbres); svg.style.zIndex = ''; }
    var degrade = FxA.degrade(svg, 'linearGradient', { x1: 0, y1: 0, x2: W, y2: 0, gradientUnits: 'userSpaceOnUse' },
      [[0, FIL, 0], [0.12, FIL, 0.5], [0.45, CHAUD, 1], [0.72, FIL, 0.8], [0.92, FIL, 0.3], [1, FIL, 0]]);
    return embraser(scene, filDOr(svg, chemin, { d: ligneDesArbres({ monte: 6 }) }, degrade, { cx: 600, cy: 1500, rx: 640, ry: 230 }), embrase);
  };
  function filEncre(scene, e) {
    var svg = Fx.calque(scene, 'frontiere-encre', 4, true), d = ligneDesArbres({ y: e.y || 1650, k: 0.5 });
    var lavis = chemin({ d: d, fill: 'none', stroke: '#2a1c10', 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0 }, svg);
    var trait = chemin({ d: d, fill: 'none', stroke: '#2a1c10', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, opacity: 0 }, svg);
    if (calme) {
      return Fx.animer(scene, 450, function (x) { trait.setAttribute('stroke-dashoffset', 0); trait.setAttribute('opacity', (0.85 * lisse(x)).toFixed(3)); lavis.setAttribute('opacity', (0.1 * lisse(x)).toFixed(3)); });
    }
    return Fx.animer(scene, e.trace || 1500, function (x) {
      var t = lisse(x);
      trait.setAttribute('opacity', 0.85); trait.setAttribute('stroke-dashoffset', (1 - t).toFixed(4));
      lavis.setAttribute('opacity', (0.1 * Math.min(1, t * 3)).toFixed(3));
    });
  }

  // 0.2, « il se met à tourner, très lentement, autour d'un point au-dessus du cadre, derrière la ligne
  // d'arbres qui, elle, ne bouge pas » : le ciel (et ses étoiles) tourne à la vitesse de 1.1 (0,0016° par
  // image à 60 Hz, soit 0,096° par seconde), autour du même pôle ; départ en douceur de 3 s, puis continu.
  // Mouvement réduit : rien, un ciel immobile. Le calque d'arbres, fixe devant, ne bouge pas.
  var OMEGA = 0.096, DEPART = 3;
  Effets.course = function (scene) {
    var ciel = $('.ciel-tournant', scene), etoiles = scene.etoiles && scene.etoiles.toile;
    if (!ciel || calme) return;
    var angle = 0, cibles = [ciel, etoiles].filter(Boolean);
    cibles.forEach(function (c) { c.style.transformOrigin = '38% 8%'; });
    // le ciel qui sort du cadre en tournant laisse voir le fond de la scène : de la couleur de la nuit
    var decor = Fx.decor(scene);
    if (decor && !decor.style.backgroundColor) decor.style.backgroundColor = '#050b26';
    function remettre() { cibles.forEach(function (c) { c.style.transform = ''; c.style.transformOrigin = ''; }); }
    var t = Fx.tache(scene, function (temps, dt) {
      var rampe = lisse(temps / DEPART);
      angle += OMEGA * rampe * dt;
      cibles.forEach(function (c) { c.style.transform = 'rotate(' + angle.toFixed(4) + 'deg)'; });
    });
    var arreter = t.arreter;
    t.arreter = function () { arreter(); remettre(); };
    Fx.surDepart(scene, remettre);
  };

  // 0.2, « La poussière est à la fois la trace du passé… » : des grains d'or descendent lentement, en
  // diagonale, comme du sable dans la lumière d'une lanterne (6 s) ; « Elle s'élance, composée des plus
  // hautes montagnes… » : ils remontent et s'éteignent parmi les étoiles (6 s) ; 1.2 `petite` : une
  // poignée de grains (1,5 s). Sans réglage : la bouffée du prototype. Mouvement réduit : quelques points
  // d'or fixes qui s'éteignent (0.2) ; rien pour la poignée.
  var poussiereDuPrototype = Effets.poussiere;
  var ORS = { or: 'rgb(255, 226, 150)', gris: 'rgb(214, 214, 220)' };
  Effets.poussiere = function (scene, e) {
    if (e.sens !== 'tombe' && e.sens !== 'monte' && !e.petite) return poussiereDuPrototype(scene, e);
    var couleur = ORS[e.couleur] || ORS.or, G = FxA.grains(scene), hasard = Fx.alea(e.sens === 'monte' ? 23 : e.sens === 'tombe' ? 11 : 5);
    var liste = [], k, g, n;
    if (e.petite) {
      if (calme) return;
      var x0 = e.x || 600, y0 = e.y || 1180;
      for (k = 0; k < 26; k++) {
        liste.push({ x: x0 + Fx.entre(hasard, -150, 150), y: y0 + Fx.entre(hasard, -60, 60), vx: Fx.entre(hasard, -70, 70), vy: Fx.entre(hasard, -130, -20),
          gy: 60, r: Fx.entre(hasard, 1.8, 4.4), a: Fx.entre(hasard, 0.6, 1), entree: 0.2, sortie: 0.7, vie: Fx.entre(hasard, 1.0, 1.5), couleur: couleur, p: hasard() * 6 });
      }
      G.jeter(liste);
      return;
    }
    n = 70;
    for (k = 0; k < n; k++) {
      var tombe = e.sens === 'tombe', retard = k / n * 2.4;
      g = tombe
        ? { x: Fx.entre(hasard, -80, 820), y: Fx.entre(hasard, -60, 420), vx: Fx.entre(hasard, 26, 62), vy: Fx.entre(hasard, 120, 210) }
        : { x: Fx.entre(hasard, 80, 1120), y: Fx.entre(hasard, 1000, 1480), vx: Fx.entre(hasard, -20, 20), vy: -Fx.entre(hasard, 100, 190) };
      g.r = Fx.entre(hasard, 1.8, 4.6); g.a = Fx.entre(hasard, 0.6, 1); g.entree = 0.7; g.sortie = 1.2;
      g.vie = Fx.entre(hasard, 2.6, 3.5); g.retard = retard; g.couleur = couleur; g.balance = Fx.entre(hasard, 8, 22); g.p = hasard() * 6;
      liste.push(g);
    }
    if (calme) {
      // quelques points d'or fixes, aux places où les grains passent, qui s'éteignent
      G.fixes(liste.slice(0, 22).map(function (p) { p.x += p.vx * 1.4; p.y += p.vy * 1.4; return p; }), 2600);
    } else {
      G.jeter(liste);
    }
    return { suite: Promise.resolve(), fin: Fx.pause(scene, 600) };
  };
})();

// ================================================================ chapitre 1 : Aluva (1.1 à 1.9)
(function () {
  // Le plan visible de la page (l'élément « img »), et de quoi le dessiner dans une toile : l'image est
  // cadrée comme par « object-fit: cover » dans la boîte de la scène (1200 x 1800).
  function planVisibleImg(scene) {
    var l = Fx.plans(scene), i = Fx.planVisible(scene);
    var p = l[i] || null;
    if (!p) { var d = Fx.decor(scene); p = d && $('img', d); }
    return p && p.tagName && p.tagName.toLowerCase() === 'img' ? p : null;
  }
  function cadrage(img) {
    var nw = img.naturalWidth || 1600, nh = img.naturalHeight || 2400, s = Math.max(W / nw, H / nh);
    return { s: s, ox: (W - nw * s) / 2, oy: (H - nh * s) / 2 };
  }

  // ---------------------------------------------------------------- chaleur (1.4)
  // « au climat si chaud et humide » : l'air tremble au-dessus du fleuve, jusqu'à la fin de la page (traitement :
  // « ondulation verticale lente et faible, plus forte au bas »). Une toile (la deuxième de la page : la
  // poussière, les éclaboussures et la chaleur n'en font que trois) redessine la zone de l'image par bandes
  // que l'onde déplace de côté ; ses bords se fondent dans l'image dessous. Mouvement réduit : rien.
  Effets.chaleur = function (scene, e) {
    var img = planVisibleImg(scene);
    if (calme || !img) return;
    var z = e.zone || [200, 880, 1000, 1500], zx = z[0], zy = z[1], zw = z[2] - z[0], zh = z[3] - z[1];
    var T = Fx.toile(scene, 'chaleur', 1, 0.5), c = T.x, bande = 8, dernier = -1000;
    // la fonte des bords : des dégradés qui ne gardent que le milieu de la zone
    var fonteH = c.createLinearGradient(zx, 0, zx + zw, 0), fonteV = c.createLinearGradient(0, zy, 0, zy + zh);
    [[0, 0], [0.14, 1], [0.86, 1], [1, 0]].forEach(function (a) { fonteH.addColorStop(a[0], 'rgba(0,0,0,' + a[1] + ')'); });
    [[0, 0], [0.12, 1], [0.8, 1], [1, 0]].forEach(function (a) { fonteV.addColorStop(a[0], 'rgba(0,0,0,' + a[1] + ')'); });
    Fx.tache(scene, function (t) {
      if (planVisibleImg(scene) !== img) { retirer(T.calque); return false; }      // le plan a changé : la chaleur n'est plus à lui
      if (t * 1000 - dernier < 33) return;                 // une image sur deux suffit à une ondulation lente
      dernier = t * 1000;
      if (!img.complete || !img.naturalWidth) return;
      var k = cadrage(img), n = Math.ceil(zh / bande), i;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(0, 0, W, H);
      for (i = 0; i < n; i++) {
        var y = zy + i * bande, u = (y - zy) / zh;
        // plus forte au bas, nulle aux bords de la zone ; deux ondes qui montent à des vitesses différentes
        var a = 7 * (0.18 + 0.82 * Math.pow(u, 1.4)) * Math.min(1, (1 - u) * 6);
        var dx = a * (Math.sin(y / 46 - t * 1.9) * 0.65 + Math.sin(y / 97 - t * 1.1 + 1.3) * 0.35);
        c.drawImage(img, (zx - dx - k.ox) / k.s, (y - k.oy) / k.s, zw / k.s, (bande + 1.5) / k.s, zx, y, zw, bande + 1.5);
      }
      c.globalCompositeOperation = 'destination-in';
      c.fillStyle = fonteH; c.fillRect(zx, zy, zw, zh);
      c.fillStyle = fonteV; c.fillRect(zx, zy, zw, zh);
      c.globalCompositeOperation = 'source-over';
    });
  };

  // ---------------------------------------------------------------- eclabousse (1.4, 1.5)
  // 1.4 « mue par une vie frétillante » : les poissons éclaboussent au tonneau ; 1.5, « Il tire jusqu'à lui un
  // tabouret rafistolé » : 1,6 s plus tard, les maquereaux plongent dans le tonneau (traitement : « éclaboussure au
  // bas de l'image »). Des gouttes qui jaillissent du point (x, y) et retombent, deux rides sur l'eau.
  // Dessinée en SVG (aucune toile). Mouvement réduit : rien.
  Effets.eclabousse = function (scene, e) {
    if (calme) return;
    var x = e.x || 600, y = e.y || 1500, hasard = Fx.alea(Math.round(x + y)), svg = Fx.calque(scene, 'eclabousse', 6, true);
    var g = svgEl('g', {}, svg), gouttes = [], rides = [], k;
    Fx.sonner('poissons');
    for (k = 0; k < 2; k++) rides.push(svgEl('ellipse', { cx: x, cy: y, rx: 10, ry: 4, fill: 'none', stroke: '#e8f4ff', 'stroke-width': 4, opacity: 0 }, g));
    for (k = 0; k < 18; k++) {
      var a = Fx.entre(hasard, -0.9, 0.9), v = Fx.entre(hasard, 330, 680);
      gouttes.push({ vx: Math.sin(a) * v * 0.55, vy: -Math.cos(a) * v, r: Fx.entre(hasard, 3.5, 9), retard: hasard() * 0.12,
        el: svgEl('circle', { cx: x, cy: y, r: 5, fill: k % 3 ? '#eaf6ff' : '#bfe0f5', opacity: 0 }, g) });
    }
    var duree = 1100;
    return { suite: Promise.resolve(), fin: Fx.animer(scene, duree, function (p) {
      var t = p * duree / 1000;
      gouttes.forEach(function (d) {
        var s = Math.max(0, t - d.retard);
        d.el.setAttribute('cx', (x + d.vx * s).toFixed(1));
        d.el.setAttribute('cy', (y + d.vy * s + 0.5 * 1500 * s * s).toFixed(1));
        d.el.setAttribute('r', (d.r * (1 - 0.5 * p)).toFixed(2));
        d.el.setAttribute('opacity', s > 0 ? (0.92 * Math.pow(1 - p, 1.2)).toFixed(3) : 0);
      });
      rides.forEach(function (r, i) {
        var q = Math.max(0, p - i * 0.14) / (1 - i * 0.14);
        r.setAttribute('rx', (10 + 120 * vif(q)).toFixed(1)); r.setAttribute('ry', (4 + 42 * vif(q)).toFixed(1));
        r.setAttribute('opacity', (0.7 * (1 - q) * (q > 0 ? 1 : 0)).toFixed(3));
      });
    }).then(function () { retirer(svg); }) };
  };

  // ---------------------------------------------------------------- clin (1.6)
  // « d'un clin d'œil accompagné d'un sourire satisfait » : un clin d'œil vu de l'intérieur, à l'encre ; dans le
  // monde de Darshan, même sa paupière est un trait de pinceau, avec ses cils, qui passe sur la moitié droite de
  // la vue et remonte (traitement : 0,35 à 0,4 s). Mouvement réduit : rien.
  Effets.clin = function (scene) {
    if (calme) return;
    var svg = Fx.calque(scene, 'clin', 4, true), hasard = Fx.alea(41);
    var g = svgEl('g', {}, svg), X0 = 540, X1 = 1260;
    var encre = FxA.degrade(svg, 'linearGradient', { x1: 0, y1: 0, x2: 1, y2: 0 },
      [[0, '#07091a', 0], [0.16, '#07091a', 0.9], [0.7, '#0b0f26', 0.96], [1, '#07091a', 0.92]]);
    // la paupière : un aplat à l'encre dont le bord bas est la ligne des cils (un arc, au plus bas au milieu),
    // un peu irrégulier comme un coup de pinceau
    var bord = [], n = 18, i;
    for (i = 0; i <= n; i++) {
      var u = i / n, x = X1 - (X1 - X0) * u;
      bord.push([x, 150 * Math.sin(Math.PI * u) - 40 + Fx.entre(hasard, -9, 9)]);     // le bord, relatif au bas (y = 0)
    }
    var lid = svgEl('path', { fill: encre, d: '' }, g);
    var traits = svgEl('g', { stroke: '#050714', fill: 'none', 'stroke-linecap': 'round' }, g);
    for (i = 0; i < 6; i++) {         // des traînées de pinceau dans la paupière
      var tx = X0 + 40 + i * 118 + Fx.entre(hasard, -20, 20);
      svgEl('path', { d: 'M' + tx + ',-2400 L' + (tx + Fx.entre(hasard, -14, 14)) + ',-40', 'stroke-width': Fx.entre(hasard, 14, 36), opacity: 0.35 }, traits);
    }
    var cils = svgEl('g', { stroke: '#07091a', fill: 'none', 'stroke-linecap': 'round' }, g), cilsPos = [];
    for (i = 1; i < n; i++) {
      var b = bord[i], l = Fx.entre(hasard, 80, 150), a = 0.35 + (i / n - 0.5) * 0.9;     // plus penchés vers l'extérieur
      cilsPos.push({ b: b, l: l, a: a, p: svgEl('path', { 'stroke-width': Fx.entre(hasard, 6, 10), d: '' }, cils) });
    }
    function poser(y) {         // y : le bas de la paupière (ligne médiane des cils)
      var d = 'M' + X1 + ',-2600 L' + X1 + ',' + (y + bord[0][1]).toFixed(1);
      bord.forEach(function (p, k) { if (k) d += ' L' + p[0].toFixed(1) + ',' + (y + p[1]).toFixed(1); });
      lid.setAttribute('d', d + ' L' + X0 + ',-2600 Z');
      g.setAttribute('transform', 'translate(0 0)');
      cilsPos.forEach(function (c) {
        var px = c.b[0], py = y + c.b[1], dx = Math.sin(c.a) * c.l * 0.6, dy = Math.cos(c.a) * c.l;
        c.p.setAttribute('d', 'M' + px.toFixed(1) + ',' + py.toFixed(1) + ' Q' + (px + dx * 0.35).toFixed(1) + ',' + (py + dy * 0.8).toFixed(1) + ' ' + (px + dx).toFixed(1) + ',' + (py + dy).toFixed(1));
      });
    }
    var YMAX = 1980;
    poser(-300);
    return Fx.animer(scene, 150, function (p) { poser(-300 + (YMAX + 300) * lent(p) * 0.7 + (YMAX + 300) * 0.3 * lisse(p)); })
      .then(function () { return Fx.pause(scene, 40); })
      .then(function () { return Fx.animer(scene, 190, function (p) { poser(YMAX - (YMAX + 300) * vif(p)); }); })
      .then(function () { retirer(svg); });
  };

  // ---------------------------------------------------------------- lin (1.8)
  // Réponse 40 de Karl (30 septembre) : la chemise est « boutonnée » (et non enfilée par la tête).
  // « —Tu ne connais pas mes talents de séducteur, conclut Darshan en enfilant sa chemise. » : après la pirouette,
  // les deux pans de lin entrent par les côtés de la vue (il passe les bras dans les manches), dans la lumière
  // d'or du ponton ; le lecteur la boutonne de haut en bas, un bouton par toucher (le geste 1.8.1, `toucher` en
  // `boutons` touchers, dont cet effet suit le progrès) ; le prochain bouton luit. Le col reste ouvert : le
  // séducteur ne ferme pas le premier bouton. Boutonnée, la chemise couvre la vue, sous le texte, qui reste
  // lisible : elle mène au fondu blanc de 1.9, « Après quelques ajustements… ». Tant que le lin est là, la
  // consigne prend une pastille, lisible sur le lin (puis « Tournez la page », dans l'EPUB). Sans geste, les
  // boutons se ferment d'eux-mêmes. Mouvement réduit : les pans paraissent en fondu, chaque bouton se ferme en
  // fondu enchaîné.
  Effets.lin = function (scene, e) {
    var n = Math.max(1, e.boutons || 4), boite = Fx.dessous(scene, 'lin', 3, true), avecGeste = !!(e.suit_geste && e.geste);
    var HAUT = 700, PAS = 250, B = [], debuts = [], c = [], k;
    for (k = 0; k < n; k++) { B.push(HAUT + k * PAS); c.push(0); }
    scene.classList.add('fx-lin-sur');
    Fx.surDepart(scene, function () { scene.classList.remove('fx-lin-sur'); });
    // le lin : ses plis, sa trame, la lumière d'or venue d'en haut ; les boutons de nacre
    var plis = FxA.degrade(boite, 'linearGradient', { x1: 0, y1: 0, x2: W, y2: 0, gradientUnits: 'userSpaceOnUse' },
      [[0, '#ede0c4'], [0.08, '#fbf3e2'], [0.19, '#eee1c5'], [0.31, '#fdf7ea'], [0.42, '#f0e3c8'], [0.5, '#f8efdc'],
       [0.58, '#f0e3c8'], [0.69, '#fdf7ea'], [0.81, '#eee1c5'], [0.92, '#fbf3e2'], [1, '#ede0c4']]);
    var jour = FxA.degrade(boite, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: H, gradientUnits: 'userSpaceOnUse' },
      [[0, '#fff3cf', 0.35], [0.45, '#fff3cf', 0], [1, '#6e5634', 0.16]]);
    var nacre = FxA.degrade(boite, 'radialGradient', { cx: 0.4, cy: 0.35, r: 0.65 }, [[0, '#fffefa'], [0.55, '#eee6d6'], [1, '#cdbfa6']]);
    var defs = $('defs', boite), idTrame = FxA.id('trame'), idClip = FxA.id('pan');
    var trame = svgEl('pattern', { id: idTrame, width: 7, height: 7, patternUnits: 'userSpaceOnUse' }, defs);
    svgEl('path', { d: 'M0,3.5 H7 M3.5,0 V7', stroke: '#8a7650', 'stroke-width': 0.9, opacity: 0.18 }, trame);
    svgEl('path', { d: 'M0,0.5 H7 M0.5,0 V7', stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.45 }, trame);
    var clip = svgEl('path', {}, svgEl('clipPath', { id: idClip, clipPathUnits: 'userSpaceOnUse' }, defs));
    var tout = svgEl('g', {}, boite);
    function trait(parent, couleur, epaisseur, opacite, pointilles) {
      var a = { fill: 'none', stroke: couleur, 'stroke-width': epaisseur, opacity: opacite };
      if (pointilles) a['stroke-dasharray'] = pointilles;
      return svgEl('path', a, parent);
    }
    function pan() {
      var g = svgEl('g', {}, tout);
      return { g: g, peau: [svgEl('path', { fill: plis }, g), svgEl('path', { fill: 'url(#' + idTrame + ')' }, g), svgEl('path', { fill: jour }, g)] };
    }
    // le pan droit, où sont cousus les boutons ; l'ombre du pan gauche, qui le recouvre ; le pan gauche et ses boutonnières
    var droit = pan(), coutureD = [trait(droit.g, '#c8b58c', 1.6, 0.8, '6 7'), trait(droit.g, '#c8b58c', 1.6, 0.8, '6 7')];
    var ombre = svgEl('g', { 'clip-path': 'url(#' + idClip + ')' }, tout);
    var ombres = [trait(ombre, '#6e5634', 26, 0.1), trait(ombre, '#6e5634', 9, 0.14)];
    var gauche = pan(), coutureG = [trait(gauche.g, '#c8b58c', 1.6, 0.8, '6 7'), trait(gauche.g, '#c8b58c', 1.6, 0.8, '6 7')];
    var bord = trait(gauche.g, '#d9c9a6', 2, 0.9), trous = [], boutons = [];
    function bouton() {
      var b = svgEl('g', {}, tout);
      svgEl('ellipse', { cx: 2, cy: 4, rx: 19, ry: 17, fill: '#5e4a2c', opacity: 0.2 }, b);
      svgEl('circle', { r: 17, fill: nacre, stroke: '#b1a284', 'stroke-width': 1.2 }, b);
      svgEl('circle', { r: 11.5, fill: 'none', stroke: '#d3c6ad', 'stroke-width': 1 }, b);
      svgEl('path', { d: 'M-4.5,-4.5 L4.5,4.5 M4.5,-4.5 L-4.5,4.5', stroke: '#e0d6c3', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, b);
      [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].forEach(function (p) { svgEl('circle', { cx: p[0], cy: p[1], r: 2.1, fill: '#9a8b6f' }, b); });
      return b;
    }
    for (k = 0; k < n; k++) {
      trous.push(svgEl('rect', { x: -19, y: -3.5, width: 38, height: 7, rx: 3.5, fill: '#e6d9bd', stroke: '#b5a37f', 'stroke-width': 1.1 }, gauche.g));
      boutons.push(bouton());
    }
    var lueur = svgEl('circle', { r: 31, fill: 'none', stroke: '#c9973a', 'stroke-width': 3, opacity: 0 }, tout);
    // la géométrie : le pan ouvert s'écarte un peu vers le bas et beaucoup vers le col ; chaque bouton fermé
    // rapproche les pans autour de lui (le gauche passe sur le droit), et un peu au-dessus et au-dessous
    var ecart = 0;
    function demi(y) { return y >= HAUT ? 170 + 45 * (y - HAUT) / (H - HAUT) : 170 + (HAUT - y) * 0.26; }
    function ferme(y) {
      var v = 0;
      for (var i = 0; i < n; i++) if (c[i] > 0) v = Math.max(v, c[i] * (1 - lisse((Math.abs(y - B[i]) - 110) / 220)));
      return v;
    }
    function bords(y) {
      var f = ferme(y), d = demi(y) * (1 - f);
      return [600 - d + 46 * f - ecart, 600 + d - 14 * f + ecart];
    }
    function ligne(pts, dx) {
      return 'M' + pts.map(function (p) { return (p[0] + (dx || 0)).toFixed(1) + ',' + p[1]; }).join(' L');
    }
    function dessiner() {
      var G = [], D = [], y, b, i;
      for (y = -40; y <= H + 40; y += 30) { b = bords(y); G.push([b[0], y]); D.push([b[1], y]); }
      var dG = 'M-80,-40 L' + ligne(G).slice(1) + ' L-80,' + (H + 40) + ' Z';
      var dD = 'M' + (W + 80) + ',-40 L' + ligne(D).slice(1) + ' L' + (W + 80) + ',' + (H + 40) + ' Z';
      gauche.peau.forEach(function (p) { p.setAttribute('d', dG); });
      droit.peau.forEach(function (p) { p.setAttribute('d', dD); });
      clip.setAttribute('d', dD);
      bord.setAttribute('d', ligne(G));
      coutureG[0].setAttribute('d', ligne(G, -10)); coutureG[1].setAttribute('d', ligne(G, -52));
      coutureD[0].setAttribute('d', ligne(D, 10)); coutureD[1].setAttribute('d', ligne(D, 52));
      ombres[0].setAttribute('d', ligne(G, 10)); ombres[1].setAttribute('d', ligne(G, 4));
      for (i = 0; i < n; i++) {
        b = bords(B[i]);
        trous[i].setAttribute('transform', 'translate(' + (b[0] - 28).toFixed(1) + ' ' + B[i] + ')');
        boutons[i].setAttribute('transform', 'translate(' + (b[1] + 32).toFixed(1) + ' ' + B[i] + ')');
      }
      // le prochain bouton luit (seulement quand le lecteur boutonne)
      if (avecGeste && faits < n) {
        b = bords(B[faits]);
        lueur.setAttribute('cx', (b[1] + 32).toFixed(1)); lueur.setAttribute('cy', B[faits]);
      } else lueur.setAttribute('opacity', 0);
    }
    var faits = 0, horloge = 0, finir = null, fin = new Promise(function (ok) { finir = ok; });
    function terminer() {
      lueur.setAttribute('opacity', 0);
      Fx.minuterie(scene, finir, calme ? 300 : 500, true);
    }
    // mouvement réduit : chaque bouton se ferme en fondu enchaîné (l'état d'avant s'efface par-dessus le nouveau)
    function fondu(i) {
      var avant = tout.cloneNode(true);
      boite.appendChild(avant);
      c[i] = 1;
      dessiner();
      Fx.animer(scene, 320, function (x) { avant.setAttribute('opacity', (1 - x).toFixed(3)); }).then(function () {
        retirer(avant);
        if (faits >= n && i === n - 1) terminer();
      });
    }
    function boutonner(m) {
      while (faits < Math.min(n, m)) {
        var i = faits++;
        if (!avecGeste) Fx.sonner('tissu');
        if (calme) fondu(i); else debuts[i] = horloge;
      }
    }
    Fx.sonner('lin');
    dessiner();
    if (calme) {
      tout.setAttribute('opacity', 0);
      if (avecGeste) lueur.setAttribute('opacity', 0.8);
      Fx.animer(scene, 500, function (x) { tout.setAttribute('opacity', x.toFixed(3)); });
    } else {
      Fx.tache(scene, function (t) {
        horloge = t;
        var x = borne(t / 0.9), bouge = x < 1;
        ecart = 260 * (1 - vif(x));
        tout.setAttribute('opacity', lisse(borne(t / 0.5)).toFixed(3));
        for (var i = 0; i < n; i++) {
          var v = debuts[i] === undefined ? 0 : vif(borne((t - debuts[i]) / 0.38));
          if (v !== c[i]) { c[i] = v; bouge = true; }
        }
        if (bouge) dessiner();
        if (avecGeste && faits < n) lueur.setAttribute('opacity', (0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 3.93))).toFixed(3));
        if (faits >= n && !bouge && c[n - 1] >= 1) { terminer(); return false; }
      });
    }
    if (avecGeste) e.geste.suivre(function (x, fini) { boutonner(fini ? n : Math.round(x * n)); });
    else for (k = 1; k <= n; k++) Fx.minuterie(scene, boutonner.bind(null, k), (calme ? 500 : 900) + k * 420);
    return fin;
  };

  // ---------------------------------------------------------------- reflet (1.7)
  // « Paris est à l'amour ce que le bleu est au ciel » : une photo paraît renversée dans l'eau, ondulée, ses bords
  // fondus dans l'encre, en 1,5 s ; elle remplace le reflet précédent ; elle reste une photo (on ne la passe pas à
  // l'encre). Une toile par reflet, redessinée par bandes : l'eau les déplace de côté. Mouvement réduit : le reflet
  // paraît en fondu, sans ondulation. La mécanique `remuer` l'appelle (image, zone).
  Effets.reflet = function (scene, e) {
    var src = Fx.sourceImage(scene, e.image), fx = Fx.etat(scene), z = e.zone || [0, 800, 800, 1750];
    if (!src) { signaler('reflet : pas d’image pour « ' + e.image + ' »'); return; }
    var zx = z[0], zy = z[1], zw = z[2] - z[0], zh = z[3] - z[1];
    var reflets = fx.reflets || (fx.reflets = []);
    // le reflet précédent s'efface (1,5 s), puis s'arrête
    reflets.slice().forEach(function (r) { reflets.splice(reflets.indexOf(r), 1); r.partir(); });
    fx.nReflets = (fx.nReflets || 0) + 1;
    var T = Fx.toile(scene, 'reflet-' + e.image + '-' + fx.nReflets, 1, 0.5), c = T.x, vivant = true, img = null;
    T.calque.style.opacity = 0;
    var fonteH = c.createLinearGradient(zx, 0, zx + zw, 0), fonteV = c.createLinearGradient(0, zy, 0, zy + zh);
    [[0, 0], [0.2, 1], [0.8, 1], [1, 0]].forEach(function (a) { fonteH.addColorStop(a[0], 'rgba(0,0,0,' + a[1] + ')'); });
    [[0, 0], [0.18, 1], [0.78, 1], [1, 0]].forEach(function (a) { fonteV.addColorStop(a[0], 'rgba(0,0,0,' + a[1] + ')'); });
    var bande = 10, amplitude = 1;
    function dessiner(t) {
      if (!img) return;
      // la photo, couvrant la zone, retournée de haut en bas (la pointe de la tour vers le fond) : le contexte est
      // renversé autour de la ligne médiane de la zone, et chaque bande est prise là où elle serait à l'endroit
      var s = Math.max(zw / img.naturalWidth, zh / img.naturalHeight), iw = img.naturalWidth * s, ih = img.naturalHeight * s;
      var ox = zx + (zw - iw) / 2, oy = zy + (zh - ih) / 2, n = Math.ceil(zh / bande), cy = zy + zh / 2, i;
      c.globalCompositeOperation = 'source-over';
      c.clearRect(zx - 40, zy - 40, zw + 80, zh + 80);
      c.save();
      c.translate(0, 2 * cy); c.scale(1, -1);
      for (i = 0; i < n; i++) {
        var yv = zy + i * bande, u = (yv - zy) / zh, ys = 2 * cy - yv - bande;
        var dx = amplitude * 11 * (0.35 + 0.65 * u) * (Math.sin(yv / 38 + t * 2.1) * 0.7 + Math.sin(yv / 83 - t * 1.3) * 0.3);
        c.drawImage(img, (zx - dx - ox) / s, (ys - oy) / s, zw / s, (bande + 1.5) / s, zx, ys, zw, bande + 1.5);
      }
      c.restore();
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = 'rgba(7, 9, 26, 0.22)'; c.fillRect(zx, zy, zw, zh);       // noyée dans l'encre
      c.globalCompositeOperation = 'destination-in';
      c.fillStyle = fonteH; c.fillRect(zx, zy, zw, zh);
      c.fillStyle = fonteV; c.fillRect(zx, zy, zw, zh);
      c.globalCompositeOperation = 'source-over';
    }
    var soi = { partir: function () {
      var depart = parseFloat(T.calque.style.opacity) || 0;
      Fx.animer(scene, calme ? 300 : 1500, function (p) { T.calque.style.opacity = (depart * (1 - lisse(p))).toFixed(3); })
        .then(function () { vivant = false; retirer(T.calque); });
    } };
    reflets.push(soi);
    return Fx.chargerImage(src).then(function (i) {
      if (!i || !Fx.vivante(scene, fx)) return;
      img = i; dessiner(0);
      if (!calme) Fx.tache(scene, function (t) {
        if (!vivant) return false;
        amplitude = Math.max(0.35, 1.6 - t * 0.5);          // l'eau se calme peu à peu, sans jamais s'arrêter
        dessiner(t);
      });
      return Fx.animer(scene, calme ? 300 : 1500, function (p) { if (vivant) T.calque.style.opacity = (0.86 * lisse(p)).toFixed(3); });
    });
  };
})();

// ================================================================ chapitre 1 (suite) : le jour d'une porte, et les effets déjà là
(function () {
  // ---------------------------------------------------------------- jour (1.9, 3.8, 7.8)
  // La lumière de l'autre côté d'une porte, dans l'entrebâillement ou par ses jours, et ce qu'on y entend, étouffé
  // (son `autre-cote`, avec son lieu : jamais l'accord du père). `fente` : le jour du pied de la porte s'allume
  // d'abord, un fil d'or (1.9, « le jour au pied de la porte s'allume d'abord, puis la porte entière ») ; `entiere`
  // (vrai par défaut) : puis la porte entière, par ses jours ; `entiere=False` : le jour du pied seul, la porte ne
  // s'ouvre pas (7.8). 2,5 s. Mouvement réduit : tout paraît en fondu. `fente` est la porte [x0, y0, x1, y1], ou
  // vrai : la porte du décor de la page. Le jour reste jusqu'à la fin de la page.
  var PORTES = {
    'local-or': { r: [470, 700, 730, 1350], planches: 5, echelle: 1 },         // la cabane à kayaks d'Aluva (1.9)
    // la même, la nuit, en cadre rapproché (7.8) : le dessin est agrandi 1,76 fois, la serrure en (932, 1010) et le pied de
    // la porte vers y 1600 (art.py, local_kayaks(proche=True)) : la porte y tient dans [545, 455, 1002, 1600]
    'local-nuit': { r: [545, 455, 1002, 1600], planches: 5, echelle: 1.76 },
    'porte-personnel': { r: [504, 650, 696, 1165], planches: 0, hublot: [600, 760, 46], echelle: 1 },    // la porte du personnel (3.8)
    'porte-pigeonnier': { r: [250, 260, 950, 1560], planches: 7, echelle: 1 }                            // la porte du pigeonnier (1.3)
  };
  function porteDeLaPage(scene) {
    var noms = (scene.config && scene.config.decors) || [], vu = Fx.planVisible(scene), k;
    if (noms[vu] && PORTES[noms[vu]]) return PORTES[noms[vu]];
    for (k = 0; k < noms.length; k++) if (PORTES[noms[k]]) return PORTES[noms[k]];
    return null;
  }
  Effets.jour = function (scene, e) {
    var porte = null;
    if (e.fente && typeof e.fente === 'object' && e.fente.length === 4) porte = { r: e.fente, planches: 5, echelle: 1 };
    else porte = porteDeLaPage(scene);
    Fx.sonner(e.son || 'autre-cote', e);
    if (!porte) return;
    var r = porte.r, x0 = r[0], y0 = r[1], x1 = r[2], y1 = r[3], entiere = e.entiere !== false, ech = porte.echelle || 1;
    var svg = Fx.calque(scene, 'jour', 5, true), OR_PALE = '#ffe3a3', BLANC = '#fff6dc';
    var halos = [], k;
    // le halo de la porte : des contours de plus en plus fins, sans filtre
    [[64, 0.03], [48, 0.04], [34, 0.055], [22, 0.07], [12, 0.09]].forEach(function (h) {
      halos.push({ w: h[0], o: h[1], el: svgEl('rect', { x: x0 - 4, y: y0 - 4, width: x1 - x0 + 8, height: y1 - y0 + 8, rx: 10, fill: 'none', stroke: OR_PALE, 'stroke-width': h[0], opacity: 0, 'stroke-linejoin': 'round' }, svg) });
    });
    var plein = FxA.degrade(svg, 'linearGradient', { x1: 0, y1: 0, x2: 0, y2: 1 }, [[0, OR_PALE, 0.35], [0.55, BLANC, 0.62], [1, BLANC, 0.8]]);
    var fond = svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: plein, opacity: 0 }, svg);
    var jours = [];
    for (k = 1; k <= (porte.planches || 0) - 1; k++) {                    // les jours entre les planches
      var xx = x0 + (x1 - x0) * k / porte.planches;
      jours.push(svgEl('rect', { x: xx - 2.5 * ech, y: y0 + 10 * ech, width: 5 * ech, height: y1 - y0 - 16 * ech, fill: BLANC, opacity: 0 }, svg));
    }
    var hublot = null;
    if (porte.hublot) hublot = svgEl('circle', { cx: porte.hublot[0], cy: porte.hublot[1], r: porte.hublot[2], fill: BLANC, opacity: 0 }, svg);
    // le jour du pied de la porte : une barre fine, brillante, et son rayonnement
    var piedHalo = svgEl('rect', { x: x0 + 2, y: y1 - 22 * ech, width: x1 - x0 - 4, height: 30 * ech, rx: 15 * ech, fill: OR_PALE, opacity: 0 }, svg);
    var pied = svgEl('rect', { x: x0 + 6, y: y1 - 7 * ech, width: x1 - x0 - 12, height: 8 * ech, rx: 4 * ech, fill: BLANC, opacity: 0 }, svg);
    var sol = svgEl('path', { d: 'M' + (x0 + 6) + ',' + (y1 + 1) + ' L' + (x1 - 6) + ',' + (y1 + 1) + ' L' + (x1 + 70 * ech) + ',' + (y1 + 150 * ech) + ' L' + (x0 - 70 * ech) + ',' + (y1 + 150 * ech) + ' Z',
      fill: OR_PALE, opacity: 0 }, svg);
    function poser(a, b) {            // a : le jour du pied (0 à 1) ; b : la porte entière (0 à 1)
      pied.setAttribute('opacity', a.toFixed(3));
      piedHalo.setAttribute('opacity', (0.5 * a).toFixed(3));
      sol.setAttribute('opacity', (0.22 * a).toFixed(3));
      fond.setAttribute('opacity', (0.88 * b).toFixed(3));
      halos.forEach(function (h) { h.el.setAttribute('opacity', (h.o * b * 1.2).toFixed(4)); h.el.setAttribute('stroke-width', (h.w * (0.6 + 0.4 * b)).toFixed(1)); });
      jours.forEach(function (j) { j.setAttribute('opacity', (0.85 * b).toFixed(3)); });
      if (hublot) hublot.setAttribute('opacity', (0.9 * b).toFixed(3));
    }
    poser(0, 0);
    if (calme) return Fx.animer(scene, 600, function (p) { poser(lisse(p), entiere ? lisse(p) : 0); });
    return Fx.animer(scene, 900, function (p) { poser(vif(p), 0); })
      .then(function () { return entiere ? Fx.pause(scene, 200) : null; })
      .then(function () { return entiere ? Fx.animer(scene, 1400, function (p) { poser(1, lisse(p)); }) : null; });
  };

  // ---------------------------------------------------------------- voix (1.1, 2.3, 3.11)
  // La voix intérieure de Darshan quand il parle à qui ne l'entend pas (jamais le père) : chaque temps s'écrit
  // lettre après lettre, environ 30 ms par lettre ; le temps est entier dans la page dès qu'il paraît (les lettres
  // se révèlent par le style : VoiceOver le lit d'un bloc) ; un toucher l'achève. 1.1 : or pâle, un éclat d'étoile
  // par lettre, halo, l'ambiance baisse de 80 % (le vent tombe), `fin` la rétablit ; 2.3 : à l'encre, sans éclat ;
  // 3.11 : or pâle, sans éclat, sans halo, sans rien changer au son (`son=False`). L'appel n'est pas joué ici mais
  // par `son` (effet="appel"). Mouvement réduit et Lecture : le texte paraît d'un coup.
  var voixDuPrototype = Effets.voix;
  function lettresDe(t) {
    if (t.lettresVoix) return t.lettresVoix;
    var liste = [];
    (function parcourir(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var texte = c.nodeValue, frag = doc.createDocumentFragment(), i;
          for (i = 0; i < texte.length; i++) {
            var ch = texte.charAt(i);
            if (/\s/.test(ch)) { frag.appendChild(doc.createTextNode(ch)); continue; }   // l'espace reste du texte : les lignes ne changent pas
            var s = doc.createElement('span');
            s.className = 'lettre-voix'; s.textContent = ch;
            frag.appendChild(s); liste.push(s);
          }
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1) parcourir(c);
      });
    })(t);
    t.lettresVoix = liste;
    return liste;
  }
  // écrire un temps : rend { fin (promesse), achever() }
  function ecrireLeTemps(scene, t, o) {
    var lettres = lettresDe(t), i = 0, fini = false, tache = null, ok, debut = (window.performance && performance.now) ? performance.now() : Date.now();
    var fin = new Promise(function (r) { ok = r; });
    function achever() {
      if (fini) return;
      fini = true;
      for (; i < lettres.length; i++) lettres[i].classList.add('ecrite');
      if (tache) tache.arreter();
      ok();
    }
    var cadence = o.cadence || 30;
    if (calme || !lettres.length) { achever(); return { fin: fin, achever: achever, debut: debut }; }
    tache = Fx.tache(scene, function (temps) {
      var n = Math.min(lettres.length, Math.floor(temps * 1000 / cadence) + 1);
      for (; i < n; i++) {
        lettres[i].classList.add('ecrite');
        if (o.eclat) { lettres[i].classList.add('eclat'); }
      }
      if (i >= lettres.length) { fini = true; ok(); return false; }
    });
    // la page quittée ou rejouée : rien ne reste en attente
    Fx.surDepart(scene, achever);
    return { fin: fin, achever: achever, debut: debut };
  }
  Effets.voix = function (scene, e) {
    var fx = Fx.etat(scene);
    if (e.fin) {
      voixDuPrototype(scene, e);
      fx.voix = null;
      scene.classList.remove('appel-au-pere');
      if (fx.voixSon) { Fx.niveauAmbiance(1, 1500); fx.voixSon = false; }      // le vent revient
      return;
    }
    voixDuPrototype(scene, e);
    if (!e.lettres) return;
    var o = { eclat: e.eclat !== false && e.couleur !== 'encre', cadence: e.cadence };
    if (e.son !== false && !fx.voixSon) { Fx.niveauAmbiance(0.2, 1500); fx.voixSon = true; }    // le vent tombe
    var actuel = null;
    // un toucher (ou une touche) achève le temps qui s'écrit : le récit, lui, attend la fin de l'écriture. L'écouteur
    // est posé après celui du récit (même cible, même phase) : le toucher qui achève ne fait pas aussi avancer.
    function toucher(ev) {
      if (!actuel || ev.type === 'keydown' && ['Enter', ' ', 'ArrowRight'].indexOf(ev.key) < 0) return;
      // le toucher qui vient de faire paraître ce temps (avant qu'il commence à s'écrire) ne l'achève pas
      var depuis = ev.timeStamp > 1e11 && window.performance && performance.now ? ev.timeStamp - (Date.now() - performance.now()) : ev.timeStamp;
      if (depuis && depuis < actuel.debut) return;
      actuel.achever();
    }
    function retirerLesEcouteurs() { scene.removeEventListener('click', toucher); doc.removeEventListener('keydown', toucher); }
    scene.addEventListener('click', toucher);
    doc.addEventListener('keydown', toucher);
    fx.taches.push({ arreter: retirerLesEcouteurs });
    Fx.surDepart(scene, retirerLesEcouteurs);
    function ecrire(t) {
      actuel = ecrireLeTemps(scene, t, o);
      return actuel.fin;
    }
    // le temps en cours, puis chacun des suivants qui est de la voix (le paragraphe en italique), jusqu'à `fin`
    var premier = ecrire(Fx.tempsCourant(scene));
    fx.voix = true;
    Fx.surTemps(scene, function (t) {
      if (!fx.voix) { retirerLesEcouteurs(); return false; }
      if (t.parentNode && t.parentNode.classList.contains('voix')) return ecrire(t);
    }, true);
    return { suite: Promise.resolve(), fin: premier };
  };

  // ---------------------------------------------------------------- eblouir (1.4, 1.9, 4.5, 7.11)
  // Une lumière qui gagne la vue puis retombe. Sans réglage (1.4, l'entrée d'Aluva) : la lueur du prototype, qui
  // retombe en 3 s ; l'étoile de la porte file « quand l'éblouissement retombe » : l'effet rend la main à 2,2 s.
  // `sens="monte"` et `depuis` (1.9) : la lumière part d'un point (la porte de la cabane) et gagne toute la vue,
  // sous le texte ; elle reste jusqu'au temps suivant, où elle retombe sur le plan suivant. `doux` (7.11) : un voile
  // blanc qui monte et redescend, jamais un éclair. `teinte="vert"` (4.5) : la sortie du tunnel.
  // Mouvement réduit : un fondu, luminosité plafonnée.
  var eblouirDuPrototype = Effets.eblouir;
  var LUMIERES = { blanc: ['#ffffff', '#fff6dc', '#ffe3a0', '#fffaf0'], vert: ['#f4fff0', '#dcf7d2', '#a9e6a0', '#effbea'] };
  Effets.eblouir = function (scene, e) {
    if (!e.sens && !e.doux && !e.teinte) {
      eblouirDuPrototype(scene, e);
      return Fx.pause(scene, 2200);
    }
    var cl = LUMIERES[e.teinte] || LUMIERES.blanc, de = e.depuis || [600, 900], fx = Fx.etat(scene);
    fx.nLumieres = (fx.nLumieres || 0) + 1;
    var boite = Fx.dessous(scene, 'lumiere-' + fx.nLumieres, 2, true);
    var dg = FxA.degrade(boite, 'radialGradient', { cx: 0.5, cy: 0.5, r: 0.5 }, [[0, cl[0]], [0.55, cl[1]], [1, cl[2], 0]]);
    var rond = svgEl('circle', { cx: de[0], cy: de[1], r: 1, fill: dg }, boite);
    var plein = svgEl('rect', { x: -80, y: -80, width: W + 160, height: H + 160, fill: cl[3], opacity: 0 }, boite);
    var R = Math.max(Math.hypot(de[0], de[1]), Math.hypot(W - de[0], de[1]), Math.hypot(de[0], H - de[1]), Math.hypot(W - de[0], H - de[1])) * 1.5;
    Fx.sonner('souffle');
    if (e.doux) {
      var haut = calme ? 0.55 : 0.8;
      boite.style.opacity = 0;
      return Fx.animer(scene, calme ? 600 : 1300, function (p) { plein.setAttribute('opacity', 1); boite.style.opacity = (haut * lisse(p)).toFixed(3); })
        .then(function () { return Fx.animer(scene, calme ? 600 : 1300, function (p) { boite.style.opacity = (haut * (1 - lisse(p))).toFixed(3); }); })
        .then(function () { retirer(boite); });
    }
    // la lumière qui reste, puis retombe au temps suivant
    function retombe() {
      return Fx.animer(scene, calme ? 400 : 1700, function (p) { boite.style.opacity = (1 - lisse(p)).toFixed(3); }).then(function () { retirer(boite); });
    }
    Fx.surTemps(scene, function () { retombe(); });
    if (calme) {
      boite.style.opacity = 0; plein.setAttribute('opacity', 0.85);
      return Fx.animer(scene, 450, function (p) { boite.style.opacity = lisse(p).toFixed(3); });
    }
    return Fx.animer(scene, 1300, function (p) {
      rond.setAttribute('r', (R * lent(p) + 1).toFixed(1));
      plein.setAttribute('opacity', lisse(borne((p - 0.55) / 0.45)).toFixed(3));
    });
  };

  // ---------------------------------------------------------------- porte (1.4, 1.9, 3.9, 3.11, 6.5, 6.15, 7.8)
  // « l'étoile de la porte file de la lumière vers le bouton « Carnet », qui naît » (arbitrage 6) : une étoile d'or
  // part de `depuis`, vole jusqu'au bouton, et c'est à son arrivée que le carnet l'allume (la première fait naître le
  // bouton). Mouvement réduit : l'étoile paraît au carnet. `anneau` (3.11) : l'étoile à part du père, plus vive.
  var porteDuNoyau = Effets.porte;
  Effets.porte = function (scene, e) {
    if (!e.depuis || calme) return porteDuNoyau(scene, e);
    var vers = Fx.pointDe(scene, 'carnet');
    var etoile = svgEl('svg', { viewBox: '-60 -60 120 120', 'aria-hidden': 'true', focusable: 'false' });
    svgEl('circle', { r: 46, fill: OR, opacity: 0.28 }, etoile);
    svgEl('circle', { r: 26, fill: OR, opacity: 0.35 }, etoile);
    svgEl('path', { d: 'M0,-44L12,-12L44,0L12,12L0,44L-12,12L-44,0L-12,-12Z', fill: CREME }, etoile);
    return Fx.voler(scene, etoile, e.depuis, vers, { l: 110, duree: e.anneau ? 700 : 1100, echelle: 0.4, efface: 0.9, hauteur: 220 })
      .then(function () { return porteDuNoyau(scene, e); });
  };

  // La clé née de l'éclat est déjà dans la serrure (7.8, `serrure`) : celle de 1.3, rayée et rouillée, entrée de moitié, dessinée
  // comme le fait le geste `tourner` ; elle se déclare dans scene.cle, pour que `tourner` la tourne au lieu d'en dessiner une
  // seconde ; au cran (90°), elle s'efface un instant après, comme celle du geste.
  function poserLaCle(scene, c) {
    var calque = Gestes.coucheSous(scene, 'cle-calque', true), id = Gestes.suivant('cle'), defs = svgEl('defs', {}, calque);
    svgEl('rect', { x: -240, y: -125, width: 400, height: 250 }, svgEl('clipPath', { id: id, clipPathUnits: 'userSpaceOnUse' }, defs));
    var g = svgEl('g', { transform: 'translate(' + c[0] + ' ' + c[1] + ') rotate(0)' }, calque);
    var dedans = svgEl('g', { transform: 'scale(0.46) rotate(90) translate(-150 0)' }, g), dc = dessin('cle'), parti = false;
    if (dc) {
      dc.setAttribute('x', -230); dc.setAttribute('y', -110); dc.setAttribute('width', 490); dc.setAttribute('height', 220);
      dc.setAttribute('overflow', 'visible');
      svgEl('g', { 'clip-path': 'url(#' + id + ')' }, dedans).appendChild(dc);
    }
    svgEl('circle', { cx: c[0], cy: c[1], r: 13, fill: '#0b0806', opacity: 0.85 }, calque);
    calque.style.opacity = 0;
    Fx.animer(scene, calme ? 250 : 450, function (p) { if (!parti) calque.style.opacity = lisse(p).toFixed(3); });
    scene.cle = { tourner: function (d) {
      g.setAttribute('transform', 'translate(' + c[0] + ' ' + c[1] + ') rotate(' + (+d).toFixed(1) + ')');
      if (Math.abs(d) >= 89.5 && !parti) {
        parti = true;
        Fx.minuterie(scene, function () {
          Fx.animer(scene, 700, function (p) { calque.style.opacity = (1 - p).toFixed(3); }).then(function () { retirer(calque); });
        }, 1300);
      }
    } };
  }

  // ---------------------------------------------------------------- eclat-court (1.9, 7.8)
  // « Le frisson, la fonte, le nom seul » : les lunettes frissonnent, fondent en clé, et le nom de la clé paraît,
  // seul, sans les bandes de l'éclat (la métamorphose est connue). Environ 1 s ; le sac change au milieu. Mouvement
  // réduit : le nom en fondu. `x`, `y` : la place des lunettes (1.9 : le bas de la vue) ; `serrure` [x, y] : la clé née
  // de l'éclat reste dans la serrure (7.8), déclarée dans scene.cle.
  Effets['eclat-court'] = function (scene, e) {
    var lieu = e.serrure && e.serrure.length === 2 ? e.serrure : null;
    var x = lieu ? lieu[0] : (e.x || 600), y = lieu ? lieu[1] : (e.y || 1000), nom = Objets.nom(e.vers), changer = function () { Objets.remplacer(e.de, e.vers, e.sac); };
    var carte = el('div', { 'class': 'eclat court' + (calme ? ' calme' : ''), 'aria-hidden': 'true' }, scene);
    el('p', { 'class': 'eclat-nom' }, carte).textContent = nom;
    function annoncerLeNom() { requestAnimationFrame(function () { requestAnimationFrame(function () { carte.classList.add('joue'); }); }); }
    if (calme) {
      annoncerLeNom();
      return Fx.pause(scene, 450).then(changer).then(function () { return Fx.pause(scene, 650); }).then(function () { retirer(carte); });
    }
    var calqueFonte = Fx.dessus(scene, 'fonte', 13, true), g = svgEl('g', {}, calqueFonte), largeur = lieu ? 330 : 520;
    var lunettes = Gestes.figurine(g, 'lunettes', x, y, largeur), cle = Gestes.figurine(g, 'cle', x, y, largeur);
    var lueur = svgEl('circle', { cx: x, cy: y, r: 10, fill: OR, opacity: 0 }, g);
    if (lunettes) { g.insertBefore(lueur, lunettes); }
    if (cle) cle.setAttribute('opacity', 0);
    // la fonte : les lunettes s'étirent et s'éteignent dans l'or, la clé naît au même endroit
    var frisson = Transitions.frisson(scene, x, y, e.r || 220);
    var fonte = Fx.pause(scene, 180).then(function () {
      return Fx.animer(scene, 520, function (p) {
        var t = lisse(p);
        if (lunettes) {
          lunettes.setAttribute('opacity', (1 - t).toFixed(3));
          lunettes.setAttribute('transform', 'translate(' + x + ' ' + (y + 40 * t) + ') scale(' + (1 - 0.18 * t).toFixed(3) + ' ' + (1 + 0.34 * t).toFixed(3) + ') translate(' + (-x) + ' ' + (-y) + ')');
        }
        if (cle) {
          cle.setAttribute('opacity', borne((p - 0.3) / 0.7).toFixed(3));
          cle.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + (0.72 + 0.28 * ressort(t, 1.2)).toFixed(3) + ') translate(' + (-x) + ' ' + (-y) + ')');
        }
        lueur.setAttribute('r', (60 + 260 * Math.sin(Math.PI * t)).toFixed(1));
        lueur.setAttribute('opacity', (0.55 * Math.sin(Math.PI * t)).toFixed(3));
      });
    });
    Fx.minuterie(scene, annoncerLeNom, 480);
    return { suite: fonte.then(function () { changer(); }), fin: Promise.all([frisson, Fx.pause(scene, 1400)]).then(function () {
      carte.classList.add('sort');
      return Fx.animer(scene, 350, function (p) { if (cle) cle.setAttribute('opacity', (1 - p).toFixed(3)); });
    }).then(function () { retirer(carte); retirer(calqueFonte); if (lieu) poserLaCle(scene, lieu); }) };
  };

  // ---------------------------------------------------------------- decor (1.5 à 2.9)
  // Un fondu long (1.8 : le jour vieillit en 8 s, 3.12 : 20 s) n'est qu'un fond : la lecture ne l'attend pas
  // (le temps suivant n'attend que 1,5 s). Les autres réglages (obturateur, regard qui descend ou se lève, panneau
  // clair ou sombre) sont ajoutés avec le chapitre 2.
  var decorDuPrototype = Effets.decor;
  // les lumières d'un plan (le jour d'une porte) s'en vont avec lui, en fondu
  FxA.quitterLePlan = function (scene) {
    var fx = Fx.etat(scene);
    ['jour'].forEach(function (nom) {
      var c = fx.calques[nom];
      if (c && c.parentNode) { c.style.transition = 'opacity 900ms ease'; c.style.opacity = 0; Fx.minuterie(scene, function () { retirer(c); }, 1000, true); }
    });
  };
  Effets.decor = function (scene, e) {
    var avant = Fx.planVisible(scene), r = decorDuPrototype(scene, e);
    if (Fx.planVisible(scene) !== avant) FxA.quitterLePlan(scene);
    if (e.fondu > 3000 && !e.duree && !calme) return { suite: Promise.resolve(), fin: Fx.pause(scene, 1500) };
    return r;
  };

  // ---------------------------------------------------------------- son (1.9 : boucle, arret) et silence (1.8 : garder)
  // `boucle` : le son dure jusqu'à `arret` (la montre de 1.9 : quatre battements par seconde, qui cesse quand la porte s'ouvre) ;
  // `arret` : le son s'arrête, avec `ralentir` il ralentit d'abord (le pied de 5.8). C'est son.js qui tient la boucle : l'effet
  // d'origine lançait le son (boucle comprise) mais perdait l'arrêt ; il est maintenant transmis. Une boucle s'arrête aussi avec
  // la page. Le reste (n, retenir, tenu, eteindre, mesure…) est celui du son d'origine.
  var sonDuPrototype = Effets.son;
  Effets.son = function (scene, e) {
    var nom = e.effet || e.son || e.id;
    if (nom && e.arret && !e.ambiance) { Fx.sonner(nom === 'question' ? 'appel' : nom, e); return; }
    return sonDuPrototype(scene, e);
  };
  // `garder="fleuve"` (1.8, « As-tu déjà pensé à vieillir ? ») : tout se tait sauf le fleuve, le tanpura et les oiseaux se taisent ;
  // `fin` rétablit les sons (1,5 s). L'ambiance de la page prend le réglage `garder` (son.js : kerala).
  var silenceDuPrototype = Effets.silence;
  Effets.silence = function (scene, e) {
    if (e.garder && !e.fin) { Son.ambiance(Fx.ambianceDeLaPage(scene), { garder: e.garder }); return; }
    return silenceDuPrototype(scene, e);
  };

  // ---------------------------------------------------------------- camera (1.9 : incline)
  // « Darshan s'incline auprès de son ami » : la vue s'abaisse de 4 % et remonte, comme un salut (0,9 s). Mouvement
  // réduit : rien. Les autres mouvements (avance, recule, monte, suit_geste…) sont ajoutés avec le chapitre 2.
  var cameraDuPrototype = Effets.camera;
  Effets.camera = function (scene, e) {
    if (e.incline) {
      var d = Fx.decor(scene);
      if (calme || !d) return;
      var transform = d.style.transform, origine = d.style.transformOrigin, transition = d.style.transition;
      d.style.transition = 'none'; d.style.transformOrigin = '50% 0%';
      return Fx.animer(scene, 900, function (p) {
        var s = Math.sin(Math.PI * p);
        d.style.transform = 'translate(0,' + (-4 * s).toFixed(3) + '%) scale(' + (1 + 0.045 * s).toFixed(4) + ')';
      }).then(function () { d.style.transform = transform; d.style.transformOrigin = origine; d.style.transition = transition; });
    }
    return cameraDuPrototype(scene, e);
  };
})();

// ================================================================ chapitre 2 : le restaurant, Montsouris (2.1 à 2.10)
(function () {
  // ---------------------------------------------------------------- balance (2.2)
  // « Son cœur balançait tandis que celui de Darshan devenait fébrile » : sur les vitrines, deux lueurs crème alternent
  // lentement (période 1,9 s : le choix de Julie, guêtres ou robe), avec un balancier feutré, un tic à gauche, un tic à
  // droite ; `fievre` : la chamade de Darshan monte à 132 en 4 s. Jusqu'à la fin de la page. Mouvement réduit : les
  // lueurs alternent aussi (ce n'est qu'une opacité).
  Effets.balance = function (scene, e) {
    var points = e.points || [[990, 480], [1110, 800]], fx = Fx.etat(scene), calque = Fx.calque(scene, 'balance', 5, false);
    var lueurs = points.map(function (p) {
      var d = el('div', { 'class': 'lueur-balance' }, calque);
      Fx.poser(d, p[0] - 190, p[1] - 190, 380, 380);
      return d;
    });
    var PERIODE = 1.9;
    Fx.tache(scene, function (t) {
      var a = 0.5 + 0.5 * Math.cos(2 * Math.PI * t / PERIODE);        // l'une au plus fort quand l'autre s'éteint
      lueurs.forEach(function (d, i) { d.style.opacity = (0.1 + 0.72 * (i % 2 ? 1 - a : a)).toFixed(3); });
    });
    // le balancier : un tic à gauche, un tic à droite, tous les demi-périodes (une minuterie qui s'arrête avec la page)
    var cote = 0, id = 0;
    function tic() {
      if (!Fx.vivante(scene, fx)) return;
      Fx.sonner('balancier', { cote: cote ? 'droite' : 'gauche' });
      cote = 1 - cote;
      id = setTimeout(tic, PERIODE * 500);
    }
    fx.taches.push({ arreter: function () { clearTimeout(id); } });
    tic();
    if (e.fievre) Gestes.coeur(scene).regler({ tempo: 132, duree: 4000 });
  };

  // ---------------------------------------------------------------- coeur (2.3, 2.4, 2.9, 4.6, 5.9, 6.1, 6.11, 7.9)
  // Le cœur hors d'un geste (couche `battements` de son.js, anneaux vermillon ou crème : ceux de Gestes.coeur, qui bat
  // avec le son) : `qui` (darshan, julie, deux, un), `tempo` ; `continu` : la page s'ouvre au milieu du battement (2.3,
  // 2.4, 6.11) ; `n` : n battements, puis il se tait (4.6) ; `arythmie` : le cœur de Julie autour de 64 (5.9, 6.11) ;
  // `vif` : il s'emballe (7.9) ; `arret` : il se tait. `deux` : les deux cœurs, calés (6.11 : « à 80, ensemble »).
  // Mouvement réduit : le son seul, les anneaux s'allument sans grandir (Gestes.coeur).
  Effets.coeur = function (scene, e) {
    var C = Gestes.coeur(scene);
    if (e.arret) { C.arreter({ duree: e.duree || 900 }); return; }
    var qui = e.qui || 'darshan', o = {};
    if (e.x !== undefined && e.y !== undefined) { o.x = e.x; o.y = e.y; }
    if (e.force !== undefined) o.force = e.force;
    if (qui === 'julie') { o.qui = 'julie'; o.julie = false; o.tempo = e.tempo || 64; }
    else if (qui === 'deux') { o.qui = 'darshan'; o.tempo = e.tempo || 80; o.julie = e.tempo || 80; o.cale = true; }
    else if (qui === 'un') { o.qui = 'darshan'; o.julie = false; o.unisson = true; o.tempo = e.tempo || 60; }
    else { o.qui = 'darshan'; o.julie = false; o.tempo = e.tempo || 72; }
    if (e.arythmie !== undefined) o.arythmie = !!e.arythmie;
    if (e.vif) { o.tempo = e.tempo || 150; o.duree = e.duree || 2500; if (qui === 'deux') o.julie = o.tempo; }
    C.regler(o);
    if (e.n) {
      // n battements, puis le cœur se tait : n périodes, et le second coup du dernier
      var periode = 60 / (o.tempo || 64);
      Fx.minuterie(scene, function () { C.arreter({ duree: 500 }); }, (e.n * periode + 0.5) * 1000);
    }
  };

  // ---------------------------------------------------------------- valse (2.9)
  // « Les mots et les regards valsent » : les deux cœurs se calent, trois contre deux : dans une mesure de 1,875 s,
  // Darshan bat trois temps (96), Julie deux (64), et ils ne tombent ensemble que sur le premier, à peine accentué (le
  // 6/8 de la ballade) ; quatre mesures marquées (7,5 s), puis ils restent calés. Ce sont les cœurs de Gestes.coeur (le
  // geste `deux` les a lancés, à 96 et 64) : leur calage est le leur, l'œil et l'oreille restent d'accord.
  // Mouvement réduit : les anneaux s'allument en mesure, sans grandir.
  Effets.valse = function (scene) {
    Gestes.coeur(scene).regler({ tempo: 96, julie: 64, cale: true, duree: 250 });
  };

  // ---------------------------------------------------------------- passe (2.8)
  // « Darshan et Julie eux passent à côté » : le plan glisse lentement de côté (6 % de sa largeur, en 4 s), comme
  // quand on dépasse quelqu'un, et le merle s'éloigne vers la gauche. Le plan s'agrandit en même temps (jusqu'à
  // 1,12) pour que son bord ne paraisse pas. Mouvement réduit : le son seul.
  Effets.passe = function (scene) {
    var plan = Fx.plans(scene)[Fx.planVisible(scene)];
    // le merle de la page s'éloigne : son.js joue une phrase, puis, plus loin et plus sombre, la suivante, à gauche
    function merle() { Fx.sonner('merle'); }
    merle();
    if (calme || !plan) return;
    plan.style.transition = 'none';
    Fx.animer(scene, 4000, function (p) {
      var t = lisse(p);
      plan.style.transform = 'translateX(' + (-6 * t).toFixed(3) + '%) scale(' + (1 + 0.12 * t).toFixed(4) + ')';
    });
    return { suite: Promise.resolve(), fin: Fx.pause(scene, 1200) };
  };

  // ---------------------------------------------------------------- esquisse (2.10)
  // « Sur son nuage il saute de rêves en projets » : un dessin à l'encre bleu nuit de Darshan posé sur le ciel, tracé
  // trait par trait, en deux étapes (traitement : le nuage, 1,8 s ; la pièce aux rideaux de 6.5, 3,2 s ; un seul point
  // vermillon, le chouchou de la petite silhouette de Julie). Le dessin est l'esquisse-theatre.svg de decors.py
  // (groupes data-etape, traits en pathLength 1). Mouvement réduit : le dessin paraît entier, en fondu.
  var ETAPES = { 1: 1800, 2: 3200 };
  function lireLEsquisse(scene) {
    var fx = Fx.etat(scene);
    if (fx.esquisse) return fx.esquisse.pret;
    var nom = 'esquisse-theatre', inline = (DONNEES.svgs || {})[nom], src = Fx.fichierDecor(nom);
    var e = fx.esquisse = { svg: null, groupes: {}, traits: {}, lavis: {}, autres: {}, image: null, tous: [] };
    var lecture;
    if (inline) { try { lecture = Promise.resolve(new DOMParser().parseFromString(inline, 'image/svg+xml').documentElement); } catch (x) { lecture = Promise.resolve(null); } }
    else lecture = src ? Fx.chargerSvg(src) : Promise.resolve(null);
    e.pret = lecture.then(function (racine) {
      e.svg = Fx.calque(scene, 'esquisse', 4, true);
      if (!racine || racine.nodeName !== 'svg') {
        // la liseuse ne lit pas le dessin : l'image entière, d'un coup (elle ne se trace pas)
        if (src) { e.image = svgEl('image', { x: 0, y: 0, width: W, height: H, opacity: 0 }, e.svg); e.image.setAttribute('href', src); }
        return e;
      }
      [].slice.call(racine.querySelectorAll('g[data-etape]')).forEach(function (g) {
        var k = g.getAttribute('data-etape'), copie = doc.importNode(g, true);
        e.svg.appendChild(copie); e.groupes[k] = copie; e.traits[k] = []; e.lavis[k] = []; e.autres[k] = [];
        [].slice.call(copie.children).forEach(function (n) {
          if (n.getAttribute('pathLength')) { n.setAttribute('stroke-dasharray', '1 1'); n.setAttribute('stroke-dashoffset', '1'); e.traits[k].push(n); }
          else if (n.getAttribute('class') === 'lavis') { n.setAttribute('data-opacite', n.getAttribute('opacity') || '1'); n.setAttribute('opacity', '0'); e.lavis[k].push(n); }
          else { n.setAttribute('data-opacite', n.getAttribute('opacity') || '1'); n.setAttribute('opacity', '0'); e.autres[k].push(n); }
          e.tous.push(n);
        });
      });
      return e;
    });
    return e.pret;
  }
  Effets.esquisse = function (scene, e) {
    var etape = e.etape || 1, duree = ETAPES[etape] || 2000;
    return { suite: Promise.resolve(), fin: lireLEsquisse(scene).then(function (d) {
      if (d.image) {
        if (etape < 2) return;
        return Fx.animer(scene, 600, function (p) { d.image.setAttribute('opacity', lisse(p).toFixed(3)); });
      }
      var traits = d.traits[etape] || [], lavis = d.lavis[etape] || [], autres = d.autres[etape] || [];
      if (!d.groupes[etape]) return;
      function poser(x) {
        // les traits se tracent l'un après l'autre, le lavis se pose dessous, le point vermillon vient en dernier
        traits.forEach(function (t, k) {
          var debut = k / traits.length * 0.62, p = borne((x - debut) / 0.38);
          t.setAttribute('stroke-dashoffset', (1 - lisse(p)).toFixed(4));
        });
        lavis.forEach(function (l) { l.setAttribute('opacity', (parseFloat(l.getAttribute('data-opacite')) * lisse(borne((x - 0.2) / 0.7))).toFixed(3)); });
        autres.forEach(function (a) { a.setAttribute('opacity', (parseFloat(a.getAttribute('data-opacite')) * lisse(borne((x - 0.78) / 0.22))).toFixed(3)); });
      }
      poser(0);
      return Fx.animer(scene, calme ? 500 : duree, function (x) {
        if (calme) { traits.forEach(function (t) { t.setAttribute('stroke-dashoffset', '0'); }); lavis.concat(autres).forEach(function (n) { n.setAttribute('opacity', (parseFloat(n.getAttribute('data-opacite')) * lisse(x)).toFixed(3)); }); return; }
        poser(x);
      });
    }) };
  };

  // ---------------------------------------------------------------- nuage (2.10, 5.4)
  // « Mais un nuage vient porter ombrage à cette vision idyllique » : l'ombre d'un vrai nuage (une grande ellipse sombre,
  // aux bords très flous) traverse la page de droite à gauche en 4 s, 35 % plus sombre, avec un souffle plus frais ; là où
  // elle passe, le dessin de l'esquisse (`efface="esquisse"`, `palit`) pâlit : l'encre se boit elle-même, sans une
  // coulure (couler est le signe de la magie chez Julie, réservé au chapitre 6) ; `reste` : le ciel reste plus sombre
  // après elle, de 20 % par défaut (2.10), ou pas du tout (`reste=0`, 5.4, le marché d'Aluva). Mouvement réduit : l'ombre
  // et l'effacement en fondu, sans traversée.
  Effets.nuage = function (scene, e) {
    var reste = e.reste === undefined ? 0.2 : e.reste, fx = Fx.etat(scene), esquisse = fx.esquisse;
    var svg = Fx.calque(scene, 'nuage', 5, true), R = 780, duree = 4000;
    var dg = FxA.degrade(svg, 'radialGradient', { cx: 0.5, cy: 0.5, r: 0.5 }, [[0, '#03040c', 0.38], [0.5, '#03040c', 0.34], [1, '#03040c', 0]]);
    var ombre = svgEl('ellipse', { cx: W + R, cy: 860, rx: R, ry: 1500, fill: dg }, svg);
    var voile = svgEl('rect', { x: -40, y: -40, width: W + 80, height: H + 80, fill: '#03040c', opacity: 0 }, svg);
    Fx.sonner('nuage');
    // 5.4 (traitement) : « le marché baisse d'un ton, puis revient » ; l'ombre qui efface un dessin (2.10) n'y touche pas :
    // son vent reste le même. Le niveau revient de lui-même à chaque page (son.js).
    if (!e.efface) {
      Fx.niveauAmbiance(0.55, 900);
      Fx.minuterie(scene, function () { Fx.niveauAmbiance(1, 1200); }, calme ? 900 : duree);
    }
    var elements = [];
    if (e.efface === 'esquisse' && esquisse) {
      if (esquisse.image) elements.push({ el: esquisse.image, x: W / 2, base: 1 });
      else esquisse.tous.forEach(function (n) {
        var b = null;
        try { b = n.getBBox(); } catch (x) { b = null; }
        elements.push({ el: n, x: b ? b.x + b.width / 2 : W / 2, base: parseFloat(n.getAttribute('opacity')) || 0, trait: !!n.getAttribute('pathLength') });
      });
    }
    // v : ce qui reste visible du dessin (de 1 à 0) ; l'encre ne coule pas, elle pâlit
    function visible(d, v) {
      if (d.trait) d.el.setAttribute('stroke-opacity', v.toFixed(3));
      else d.el.setAttribute('opacity', (d.base * v).toFixed(3));
    }
    if (calme) {
      // l'ombre passe en fondu (elle couvre la page puis s'en va), le dessin pâlit, le ciel reste plus sombre
      ombre.setAttribute('cx', W / 2); ombre.setAttribute('rx', W);
      return Fx.animer(scene, 900, function (p) {
        ombre.setAttribute('opacity', (p < 0.45 ? lisse(p / 0.45) : 1 - lisse((p - 0.45) / 0.55)).toFixed(3));
        voile.setAttribute('opacity', (reste * lisse(p)).toFixed(3));
        elements.forEach(function (d) { visible(d, 1 - lisse(p)); });
      });
    }
    return Fx.animer(scene, duree, function (p) {
      var xc = W + R - (W + 2 * R) * p;
      ombre.setAttribute('cx', xc.toFixed(1));
      ombre.setAttribute('opacity', (p > 0.92 ? (1 - p) / 0.08 : 1).toFixed(3));
      // là où l'ombre est passée, le dessin a pâli
      elements.forEach(function (d) { visible(d, 1 - lisse(borne((d.x - (xc - R)) / (R * 1.1)))); });
      voile.setAttribute('opacity', (reste * lisse(borne((p - 0.4) / 0.6))).toFixed(3));
    });
  };
})();

// ================================================================ chapitre 2 (suite) : la mise au point, l'obturateur, le regard
(function () {
  // ---------------------------------------------------------------- flou (2.1, 2.7, 2.9 ; 4.6, 4.7, 5.10, 5.11, 6.8, 6.10, 7.3)
  // La mise au point suit l'attention de Darshan : tout flou (`force`, en unités de page : 8 par défaut, moins contrasté),
  // ou `garde` [x, y, rayon] : une zone qui reste nette, au bord adouci ; `chaud` : l'image se réchauffe ; `suit_geste` :
  // l'intensité suit le geste et l'ambiance baisse jusqu'au tiers (2.1 : « le flou se resserre autour de la main » ; 2.9 :
  // on est trop près pour voir). Hors d'un geste (2.7), le flou passe d'un état à l'autre en 900 ms. `net` le lève.
  // Le flou est une copie floue du plan, posée sur le plan net (opacité : l'intensité), percée de la zone nette ; elle suit le
  // changement de plan (decor). Mouvement réduit : 0,2 s.
  // une longueur en unités de page, en pixels CSS : la largeur de mise en page de la scène (offsetWidth), que ne change aucune
  // mise à l'échelle de la liseuse (getBoundingClientRect, lui, la subit)
  function pxCss(scene, u) { return u * (scene.offsetWidth || W) / W; }
  function planImg(scene) {
    var p = Fx.plans(scene)[Fx.planVisible(scene)];
    return p && p.tagName && p.tagName.toLowerCase() === 'img' ? p : null;
  }
  function retirerLeFlou(scene, f, ms) {
    if (!f) return;
    f.calque.style.transition = 'opacity ' + ms + 'ms ease';
    f.calque.style.opacity = 0;
    Fx.minuterie(scene, function () { retirer(f.calque); }, ms + 100, true);
  }
  Effets.flou = function (scene, e) {
    var fx = Fx.etat(scene), img = planImg(scene), ms = calme ? 200 : 900;
    if (!img) return;
    var force = e.force === undefined ? 8 : e.force, N = Math.max(1, pxCss(scene, force)), garde = e.garde || null;
    fx.nFlous = (fx.nFlous || 0) + 1;
    var calque = Fx.calque(scene, 'flou-' + fx.nFlous, 1, false), clone = el('img', { alt: '' }, calque);
    var filtre = 'blur(' + N.toFixed(1) + 'px) contrast(0.92)' + (e.chaud ? ' sepia(0.28) saturate(1.18)' : '');
    function poser() {
      var im = planImg(scene);
      if (im) clone.setAttribute('src', im.getAttribute('src'));
    }
    poser();
    clone.style.cssText = 'position:absolute;left:' + (-2 * N).toFixed(1) + 'px;top:' + (-2 * N).toFixed(1) + 'px;width:calc(100% + ' + (4 * N).toFixed(1) +
      'px);height:calc(100% + ' + (4 * N).toFixed(1) + 'px);object-fit:cover;max-width:none;filter:' + filtre + ';-webkit-filter:' + filtre + ';';
    if (garde) {
      var R = pxCss(scene, garde[2]), cx = pxCss(scene, garde[0]) + 2 * N, cy = pxCss(scene, garde[1]) + 2 * N;
      var masque = 'radial-gradient(circle ' + R.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px, rgba(0,0,0,0) 0, rgba(0,0,0,0) ' + (R * 0.55).toFixed(1) +
        'px, rgba(0,0,0,1) ' + R.toFixed(1) + 'px)';
      clone.style.webkitMaskImage = masque; clone.style.maskImage = masque;
    }
    calque.style.opacity = 0;
    var ancien = fx.flou;
    fx.flou = { calque: calque, suivre: poser };
    retirerLeFlou(scene, ancien, ms);                    // l'ancien état s'efface pendant que le nouveau paraît
    if (e.suit_geste && e.geste) {
      calque.style.transition = 'opacity ' + (calme ? 200 : 180) + 'ms linear';
      return new Promise(function (ok) {
        e.geste.suivre(function (x, fini) {
          calque.style.opacity = x.toFixed(3);
          Fx.niveauAmbiance(1 - (2 / 3) * x, 200);
          if (fini) ok();
        });
      });
    }
    calque.style.transition = 'opacity ' + ms + 'ms ease';
    Fx.ensuite(function () { calque.style.opacity = 1; });
    return Fx.pause(scene, ms);
  };

  // net : tout revient, l'image nette, le son ouvert, le texte net, la barre de commandes pleine (lève le voile, pas l'état de
  // la barre) en 0,9 à 1,2 s ; mouvement réduit : 0,2 s.
  var netDuPrototype = Effets.net;
  Effets.net = function (scene, e) {
    var fx = Fx.etat(scene), ms = calme ? 200 : (e.duree || 900);
    netDuPrototype(scene, e);
    scene.classList.remove('texte-assourdi');
    Fx.niveauAmbiance(1, ms);
    var f = fx.flou;
    if (f) { fx.flou = null; retirerLeFlou(scene, f, ms); }
    return { suite: Promise.resolve(), fin: Fx.pause(scene, ms) };
  };

  // assourdi : le monde passe au filtre `assourdi` ; `texte` : le temps s'affiche atténué (opacité 0,55, flou de 0,6 px), lisible,
  // jusqu'à `net` (2.4 : la salle arrive derrière un filtre, comme à travers l'eau).
  var assourdiDuPrototype = Effets.assourdi;
  Effets.assourdi = function (scene, e) {
    assourdiDuPrototype(scene, e);
    if (e.texte) scene.classList.add('texte-assourdi');
  };

  // ---------------------------------------------------------------- compte (2.9, 3.14, 4.7, 5.1, 5.11, 6.1, 6.3, 6.11)
  // Les mots s'éclairent dans la phrase et leur double se pose en haut de la page, là où le téléphone affiche l'heure (le
  // double, c'est Compte.afficher : en or chez Darshan, blanc sur un bandeau graphite chez Julie). `de` : les mots précédents se
  // défont ; `valeur=""` : le compte ne laisse rien. Les mots éclairés sont ceux de la valeur, retrouvés dans le temps en cours.
  var compteDuNoyau = Effets.compte;
  function eclairerLesMots(scene, valeur) {
    var t = Fx.tempsCourant(scene), cherche = valeur.toLowerCase(), trouve = null;
    if (!t) return;
    (function parcourir(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (trouve) return;
        if (c.nodeType === 3) {
          var k = c.nodeValue.toLowerCase().indexOf(cherche);
          if (k < 0) return;
          c.splitText(k + valeur.length);
          var mots = c.splitText(k), s = doc.createElement('span');
          s.className = 'mot-compte'; n.replaceChild(s, mots); s.appendChild(mots);
          trouve = s;
        } else if (c.nodeType === 1) parcourir(c);
      });
    })(t);
    if (trouve) Fx.ensuite(function () { trouve.classList.add('allume'); });
  }
  Effets.compte = function (scene, e) {
    // les mots précédents se défont
    if (e.de || e.valeur !== undefined) $$('.mot-compte.allume', scene).forEach(function (m) { m.classList.remove('allume'); });
    compteDuNoyau(scene, e);
    if (e.valeur) eclairerLesMots(scene, e.valeur);
  };

  // ---------------------------------------------------------------- camera (1.9, 2.8, 3.3, 3.6, 5.8, 5.9, 6.9, 7.13 à 7.15)
  // La vue bouge dans une même photo. `avance` : travelling avant jusqu'à `zoom` (de 1 à 1,08 en 6 s avec `lent`, 1,12 en
  // 2,6 s sinon ; `duree`) ; `recule` : un demi-pas en arrière, jusqu'à `zoom` ; `suit_geste` : sous le doigt (2.8 : l'allée
  // avance, de 1 à 1,08, tant que le geste lent dure) ; `deja` : la page reprend le cadre où la précédente s'arrête, sans
  // mouvement ; `vers` [x, y] : le point visé. (`incline` est plus haut.) Mouvement réduit : plan fixe, ou fondu vers le plan
  // d'arrivée ; l'allée de 2.8 ne grandit pas.
  var cameraAvant = Effets.camera;
  Effets.camera = function (scene, e) {
    var d = Fx.decor(scene);
    var cible = e.zoom || (e.lent ? 1.08 : 1.12), vers = e.vers && e.vers.length === 2 ? e.vers : [W / 2, H / 2];
    if (e.suit_geste && e.geste) {
      if (calme || !d) return new Promise(function (ok) { e.geste.suivre(function (x, fini) { if (fini) ok(); }); });
      d.style.transformOrigin = pourcent(vers[0], W) + ' ' + pourcent(vers[1], H);
      d.style.transition = 'transform 180ms linear';
      return new Promise(function (ok) {
        e.geste.suivre(function (x, fini) {
          d.style.transform = 'scale(' + (1 + (cible - 1) * x).toFixed(4) + ')';
          if (fini) ok();
        });
      });
    }
    if (e.deja && d) {
      d.style.transition = 'none';
      d.style.transformOrigin = pourcent(vers[0], W) + ' ' + pourcent(vers[1], H);
      d.style.transform = 'scale(' + cible + ')';
      return;
    }
    if (e.avance === true || e.recule) {
      return Visuels.camera(scene, { avance: cible, vers: vers, duree: e.duree || (e.lent ? 6000 : (e.recule ? 1500 : 2600)) });
    }
    return cameraAvant(scene, e);
  };

  // ---------------------------------------------------------------- decor (1.5 à 2.9)
  // Le plan suivant, ou le plan `i` : le fondu (1,2 s par défaut, `fondu` ms ; `fondu=0` : la coupe franche de 2.5) ; `par="obturateur"` (2.4) : les lames se
  // ferment et se rouvrent sur le plan, le double déclic, 420 + 520 ms ; `camera="baisse"` (2.6) : le regard descend, le plan
  // sort par le haut et le suivant entre par le bas (1,2 s) ; `camera="leve"` (2.9, l'ancien envol-vue) : le contraire, dans un
  // souffle d'air montant (1,4 s) ; `fond` (« clair » ou « sombre ») : le panneau de texte prend le ton de la nouvelle image sans
  // changer de place ; `duree` : retour au plan précédent après ce temps, en fondu (`retour="fondu"`, 0,5 s). Mouvement réduit :
  // des fondus courts.
  var decorAvant = Effets.decor;
  function tonDuPanneau(scene, fond) {
    var t = $('.texte', scene);
    if (!t) return;
    if (fond === 'sombre') t.classList.remove('clair');
    else if (fond === 'clair') t.classList.add('clair');
  }
  function changerDePlan(scene, a, b) {
    a.classList.remove('vu'); b.classList.add('vu'); FxA.quitterLePlan(scene);
    [a, b].forEach(function (p) { p.style.transition = ''; p.style.transform = ''; p.style.opacity = ''; });
  }
  Effets.decor = function (scene, e) {
    var fx = Fx.etat(scene), liste = Fx.plans(scene), i = e.i || 0, a = liste[Fx.planVisible(scene)], b = liste[i], r;
    if (e.fondu === 0) e = Fx.copie(e, { fondu: 1 });      // `fondu=0` : une coupe franche (le fondu d'origine prend 0 pour « pas de réglage »)
    if (!calme && a && b && a !== b && (e.par === 'obturateur' || e.camera === 'baisse' || e.camera === 'leve')) {
      if (e.par === 'obturateur') r = decorObturateur(scene, e, a, b);
      else r = decorCamera(scene, e, a, b);
    } else {
      if (e.fond) tonDuPanneau(scene, e.fond);
      r = decorAvant(scene, e);
    }
    if (fx.flou) fx.flou.suivre();
    return r;
  };
  function decorCamera(scene, e, a, b) {
    var baisse = e.camera === 'baisse', duree = baisse ? 1200 : 1400, sens = baisse ? 1 : -1;
    if (e.fond) tonDuPanneau(scene, e.fond);
    if (!baisse) Fx.sonner('souffle');
    a.style.transition = 'none'; b.style.transition = 'none'; a.style.opacity = '1'; b.style.opacity = '1';
    b.style.transform = 'translateY(' + (sens * 100) + '%)';
    var fin = Fx.animer(scene, duree, function (p) {
      var t = lisse(p);
      a.style.transform = 'translateY(' + (-sens * 100 * t).toFixed(2) + '%)';
      b.style.transform = 'translateY(' + (sens * 100 * (1 - t)).toFixed(2) + '%)';
    }).then(function () { changerDePlan(scene, a, b); });
    if (e.duree) {
      // retour au plan précédent après `duree` : un fondu court, le regard ne se relève pas (6.11)
      return fin.then(function () { return Fx.pause(scene, e.duree); }).then(function () {
        return decorAvant(scene, { i: Fx.plans(scene).indexOf(a), fondu: 500 });
      });
    }
    return fin;
  }
  // les lames d'un obturateur : elles se ferment sur l'image (le plan change dessous, quand tout est fermé), puis se rouvrent
  function decorObturateur(scene, e, a, b) {
    var boite = Fx.dessous(scene, 'obturateur', 4, true), n = 7, C = [W / 2, H / 2], lames = [], k;
    var R = Math.hypot(W / 2, H / 2) + 40;
    for (k = 0; k < n; k++) {
      lames.push(svgEl('polygon', { fill: k % 2 ? '#1c1f25' : '#15171c', stroke: '#4a505c', 'stroke-width': 4, 'stroke-linejoin': 'round' }, boite));
    }
    function ouverture(r) {
      var torsion = 0.9 * (1 - r / R), L = 3000;
      lames.forEach(function (l, i) {
        var an = i * 2 * Math.PI / n + torsion, ux = Math.cos(an), uy = Math.sin(an), vx = -uy, vy = ux;
        function p(u, v) { return (C[0] + ux * u + vx * v).toFixed(1) + ',' + (C[1] + uy * u + vy * v).toFixed(1); }
        l.setAttribute('points', [p(r, -L), p(r, L), p(r + L, L), p(r + L, -L)].join(' '));
      });
    }
    ouverture(R);
    Fx.sonner('declic');
    return Fx.animer(scene, 420, function (p) { ouverture(R * (1 - lisse(p))); })
      .then(function () {
        changerDePlan(scene, a, b);                // tout est fermé : le plan change, le panneau prend le ton de la table
        if (e.fond) tonDuPanneau(scene, e.fond);
        return Fx.pause(scene, 90);
      })
      .then(function () { return Fx.animer(scene, 520, function (p) { ouverture(R * lisse(p)); }); })
      .then(function () { retirer(boite); });
  }
})();

// ================================================================ effets nouveaux, chapitres 0 à 3 (fin)

// ================================================================ effets nouveaux, chapitres 4 à 8 (début)
/* Les effets qui manquaient, dont la première page est aux chapitres 4 à 8, s'ajoutent ici, chacun
   juste au-dessus de la ligne « (fin) » ci-dessous. */
// ================================================================ effets nouveaux, chapitres 4 à 8 (fin)

// ================================================================ effets des réponses de Karl (début)
/* Les effets qu'appellent les réponses de Karl (2.7 : Darshan commande le dessert ; 1.5 : Jivan,
   « la vie »), écrits avec les scènes ; chacun juste au-dessus de la ligne « (fin) » ci-dessous. */
(function () {
  // ---------------------------------------------------------------- commande (2.7)
  // Réponse 13 de Karl (30 septembre) : « c'est Darshan qui commande le dessert et pense « Si j'avais su » (2.7) :
  // le lecteur passe la commande sur une carte, un geste de plus ».
  // « un serveur vient débarrasser la table et prendre la commande du dessert. » : la carte des desserts monte du
  // bas, seule nette sur la table floue (la mise au point suit l'attention de Darshan : la grammaire du chapitre).
  // Les autres lignes sont floues, illisibles : aucun autre dessert n'est écrit, seulement le sien, `plat` (« Ce
  // sera un pain perdu »). Le lecteur passe la commande (le geste 2.7.1, `toucher`, dont cet effet suit le
  // progrès) : un trait d'or, celui de Darshan, souligne le dessert, et sa commande, `ligne`, le titre du chapitre,
  // paraît au-dessus de la carte, dans la police et l'or des titres : le lecteur découvre que ce titre est une
  // phrase de tous les jours, et qu'elle est de Darshan. La carte redescend ; la commande reste pendant que le récit
  // la confirme, et s'efface au temps `jusqua` (2 : « Il sera servi dans une porcelaine »). La carte et la commande
  // passent au-dessus du panneau de texte (son voile les couvrirait), sous les aides du geste et la consigne ;
  // pendant que la carte est là, le halo prend le graphite des aides de Julie (le blanc ne se verrait pas sur le
  // papier). Décoratif pour les lecteurs d'écran : le texte dit la commande. Sans geste, la commande passe d'elle-même.
  // Mouvement réduit : la carte paraît et s'efface en fondu, le trait aussi.
  Effets.commande = function (scene, e) {
    var LC = 600, HC = 470, Y0 = e.y || 1250, jusqua = e.jusqua === undefined ? 2 : e.jusqua;
    var calqueC = Fx.dessus(scene, 'commande', 2);
    var carte = Fx.poser(el('div', { 'class': 'fx-carte' }, calqueC), (W - LC) / 2, Y0, LC, HC);
    el('div', { 'class': 'fx-carte-cadre' }, carte);
    el('div', { 'class': 'fx-carte-titre' }, carte).textContent = ui('carte_desserts');
    el('div', { 'class': 'fx-carte-filet' }, carte);
    var h = Fx.alea(27);
    [36, 47, 81, 91].forEach(function (y) {
      var l = el('div', { 'class': 'fx-carte-flou' }, carte), w = Fx.entre(h, 30, 54);
      l.style.left = ((100 - w) / 2).toFixed(2) + '%'; l.style.width = w.toFixed(2) + '%'; l.style.top = y + '%';
    });
    var mot = el('span', {}, el('div', { 'class': 'fx-carte-plat' }, carte));
    mot.textContent = e.plat || '';
    var trait = el('span', { 'class': 'fx-carte-trait' }, mot);
    var ligne = el('div', { 'class': 'fx-commande-ligne' }, calqueC);
    ligne.textContent = e.ligne || '';
    ligne.style.top = Fx.pc(e.y_ligne || 1150, H);
    scene.classList.add('fx-commande-attente');
    Fx.surDepart(scene, function () { scene.classList.remove('fx-commande-attente'); });
    // la carte monte du bas de la vue
    var bas = 'translateY(' + ((H - Y0) / HC * 100 + 8).toFixed(1) + '%)';
    if (calme) { carte.style.opacity = 0; carte.style.transition = 'opacity 350ms ease'; trait.style.transform = 'none'; trait.style.opacity = 0; }
    else { carte.style.transform = bas; carte.style.transition = 'transform 450ms cubic-bezier(0.2, 0.8, 0.3, 1)'; }
    Fx.ensuite(function () { if (calme) carte.style.opacity = 1; else carte.style.transform = 'none'; });
    Fx.sonner('papier', { force: 0.5 });
    var commandee = null;
    function commander() {
      if (commandee) return commandee;
      scene.classList.remove('fx-commande-attente');
      // Darshan choisit son dessert : le trait d'or
      trait.style.transition = calme ? 'opacity 300ms ease' : 'transform 380ms ease-out';
      Fx.ensuite(function () { if (calme) trait.style.opacity = 1; else trait.style.transform = 'scaleX(1)'; });
      // sa commande, le titre du chapitre ; puis la carte redescend
      Fx.minuterie(scene, function () { ligne.classList.add('vu'); }, calme ? 150 : 280);
      Fx.minuterie(scene, function () {
        if (calme) { carte.style.opacity = 0; return; }
        carte.style.transition = 'transform 480ms cubic-bezier(0.5, 0, 0.75, 0.4)';
        carte.style.transform = bas;
      }, calme ? 900 : 1150);
      Fx.surTemps(scene, function (t, i) {
        if (i < jusqua) return true;
        ligne.classList.remove('vu');
        Fx.minuterie(scene, function () { retirer(calqueC); }, 900, true);
        return false;
      }, true);
      commandee = Fx.pause(scene, calme ? 1100 : 1750);
      return commandee;
    }
    if (e.suit_geste && e.geste) {
      return new Promise(function (ok) {
        e.geste.suivre(function (x, fini) { if (x >= 1 || fini) commander().then(ok, ok); });
      });
    }
    return Fx.pause(scene, calme ? 600 : 1400).then(commander);
  };
})();
// ================================================================ effets des réponses de Karl (fin)

// ================================================================ effets nouveaux, chapitres 6 et 7 (début)
/* Les effets qui manquaient, dont la première page est aux chapitres 6 et 7, s'ajoutent ici, chacun
   juste au-dessus de la ligne « (fin) » ci-dessous (l'équipe des chapitres 4 et 5 écrit plus haut). */
// ================================================================ effets nouveaux, chapitres 6 et 7 (fin)
