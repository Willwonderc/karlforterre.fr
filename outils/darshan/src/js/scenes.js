// ---------------------------------------------------------------- scènes : le déroulé d'une page
/* Scenes.jouer(scene) lit les réglages de la page (le JSON de build.py : gestes, portes,
   effets, debut, bilan, decors) et la joue : les effets d'entrée, puis le récit temps par
   temps, chaque geste à sa place, chaque effet à son temps, enfin la sortie (balayage vers la
   page suivante sur le web ; « Tournez la page » dans l'EPUB). Les scènes écrites à la main
   (data-special : seuil, poème, toit, tuiles, pigeonnier…) préparent leur décor et peuvent
   jouer à leur façon certains gestes (scene.gestesLocaux, par clé de geste) et certains effets
   (scene.effetsLocaux, par nom) ; le reste suit le déroulé commun. */

var Scenes = (function () {
  var speciales = {};
  var VIDE = { gestes: [], portes: {}, effets: {}, debut: [], bilan: [], decors: [] };

  function config(scene) {
    var b = $('script.config', scene);
    try { return b ? JSON.parse(b.textContent) : VIDE; } catch (e) { signaler(e); return VIDE; }
  }
  function geste(cfg, cle) {
    for (var i = 0; i < cfg.gestes.length; i++) if (cfg.gestes[i].cle === cle) return cfg.gestes[i];
    return null;
  }
  // Pour le récit : à chaque temps qui attend un geste, la suite de ses gestes et de leurs effets.
  function portesDuRecit(scene, cfg) {
    var portes = {};
    Object.keys(cfg.portes || {}).forEach(function (j) {
      portes[j] = function () {
        return enchainer(cfg.portes[j].map(function (cle) {
          return function () {
            var g = geste(cfg, cle);
            if (!g) return null;
            return jouerGeste(scene, g).then(function () { return jouerEffets(scene, g.effets); });
          };
        }));
      };
    });
    return portes;
  }
  // Le déroulé commun. options : { garder, surTemps(j, t), fin(scene), attente (ms avant le
  // premier temps) }.
  function derouler(scene, cfg, options) {
    options = options || {};
    var recit = new Recit(scene, {
      portes: portesDuRecit(scene, cfg),
      garder: options.garder,
      surTemps: function (j, t) {
        return Promise.resolve(options.surTemps ? options.surTemps(j, t) : null)
          .then(function () { return jouerEffets(scene, (cfg.effets || {})[j]); });
      },
      fin: function () { return options.fin ? options.fin(scene) : sortir(scene); }
    });
    scene.recit = recit;
    jouerEffets(scene, cfg.debut);
    quandEntree(scene).then(function () {
      setTimeout(function () { recit.avancer(); }, calme ? 200 : (options.attente || 600));
    });
    return recit;
  }
  // La fin de la page : sur le web, le balayage vers la suivante ; dans l'EPUB, la consigne ;
  // à la dernière page, la fin du livre.
  function sortir(scene, o) {
    if (scene.getAttribute('data-scene') === DONNEES.derniere) { finDuLivre(scene); return; }
    if (estEpub) { consigne(scene, ui('tournez'), 1730); return; }
    Navigation.suivante(scene, o);
  }
  // La page « Fin » (docs/darshan-mise-en-scene/chapitre-7.md, « La page « Fin » » ; décision de Karl 26) : « une
  // page, trois choses, un bouton ». Sur le papier, « Fin » ; le générique (« Texte et photographies : Karl
  // Forterre », le crédit de la couverture) ; la planche des photographies vues dans le livre, sans encre
  // (fin-photos : une seule image de decors.py, et son texte pour les lecteurs d'écran) ; « Nouvelle lecture », qui
  // ferme le livre (fermerLeLivre, avec la clôture) puis ramène à la page de titre. « Pas de ✦, pas d'or : c'est une
  // page de mortel. » La lecture y est notée comme achevée : « Reprendre » n'est plus proposé, « Ouvrir » attend
  // (qui quitte en 8.1 retrouve « Reprendre »).
  function finDuLivre(scene) {
    if ($('.fin-livre', scene)) return;
    ecrire('darshan.page', null);
    $$('.texte, .cloture-svg', scene).forEach(function (n) { n.classList.add('cloture-sort'); });
    var f = el('div', { 'class': 'fin-livre fin-page ui' }, scene);
    el('p', { 'class': 'fin-titre' }, f).textContent = ui('fin');
    el('p', { 'class': 'fin-generique' }, f).textContent = ui('generique_auteur');
    el('p', { 'class': 'fin-couverture' }, f).textContent = ui('generique_couverture');
    var planche = Fx.fichierDecor('fin-photos');
    if (planche) {
      var fig = el('figure', {}, f);
      el('figcaption', { 'aria-hidden': 'true' }, fig).textContent = ui('generique_planche');
      el('img', { src: planche, alt: ui('generique_planche'), width: '1500', height: '1321' }, fig);
    }
    var b = el('button', { type: 'button' }, f);
    b.textContent = ui('nouvelle_lecture');
    b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (b.disabled) return;
      b.disabled = true;
      fermerLeLivre(scene).then(function () { Navigation.recommencer(); }, function () { Navigation.recommencer(); });
    });
    Fx.minuterie(scene, function () { f.classList.add('vu'); }, calme ? 300 : 900, true);
    annoncer(ui('fin'));
  }
  function jouer(scene) {
    var cfg = config(scene), nom = scene.getAttribute('data-special');
    scene.config = cfg;
    try {
      if (nom && speciales[nom]) return speciales[nom](scene, cfg);
      return derouler(scene, cfg);
    } catch (e) {
      // une scène qui échoue ne bloque pas la lecture : tout son texte s'affiche
      signaler(e);
      $$('.texte .temps', scene).forEach(function (t) { t.classList.add('vu'); t.removeAttribute('aria-hidden'); });
      sortir(scene);
    }
  }

  // ================================================================ les scènes écrites à la main

  // Seuil : la page de titre. Le premier toucher ouvre la porte et autorise le son.
  speciales.seuil = function (scene) {
    Visuels.Etoiles(scene, 90).hasard();
    // la dédicace paraît d'elle-même, sous le titre
    $$('.texte .temps', scene).forEach(function (t, k) {
      setTimeout(function () { t.classList.add('vu'); }, calme ? 0 : 900 + k * 700);
      var lu = +t.getAttribute('data-lu') || 0;
      if (lu > Lecture.max) Lecture.max = lu;
    });
    var b = $('.bouton-porte', scene), r = $('.bouton-reprendre', scene), rang = Navigation.reprise();
    function ouvrir(ev, cible) {
      ev.stopPropagation();
      if (bloque()) return;
      Son.init(); Son.ambiance('cosmos');
      // le bouton est la première porte : la lumière en jaillit
      if (cible) Navigation.allerA(cible);
      else Navigation.suivante(scene, { de: zone(b, scene) });
    }
    if (b) b.addEventListener('click', function (ev) { ouvrir(ev); });
    if (r && rang > 2) {
      r.hidden = false;
      r.addEventListener('click', function (ev) { ouvrir(ev, rang); });
    }
  };

  // Le poème d'ouverture, vers après vers, sous la voûte ; l'aube monte à « aube ».
  speciales.poeme = function (scene, cfg) {
    scene.etoiles = Visuels.Etoiles(scene, 120);
    scene.etoiles.hasard();
    scene.aube = el('div', { 'class': 'aube', 'aria-hidden': 'true' }, $('.decor', scene));
    derouler(scene, cfg, { garder: true, attente: 500 });
  };

  // Un ciel mouvant : sur le toit, la voûte tourne lentement autour du pôle.
  speciales.toit = function (scene, cfg) {
    var ciel = $('.ciel-tournant', scene), angle = 0, vivant = true;
    scene.etoiles = Visuels.Etoiles(scene, 110, ciel);
    if (ciel) {
      ciel.style.transformOrigin = '38% 8%';
      (function tourner() {
        if (!vivant) return;
        if (!calme) angle += 0.0016;
        ciel.style.transform = 'rotate(' + angle + 'deg) scale(1.28)';
        requestAnimationFrame(tourner);
      })();
    }
    // Le titre du chapitre a claqué sur les bandes d'entrée ; il reste ensuite en haut de l'écran.
    var carton = $('h1.chapitre', scene);
    if (carton) { scene.appendChild(carton); carton.classList.add('carton', 'range'); }
    quandEntree(scene).then(function () { if (carton) carton.classList.add('vu'); });
    derouler(scene, cfg, { attente: 700, fin: function () { vivant = false; sortir(scene); } });
  };

  // La danse sur les tuiles : chaque toucher est une enjambée de cinq tuiles vers le pigeonnier.
  speciales.tuiles = function (scene, cfg) {
    var monde = $('.monde', scene), cible = { x: 950, y: 1300 };
    function placer(k, n, bond) {
      var t = lisse(k / n), s = 1 + 1.35 * t;
      var tx = (W / 2 - cible.x) * t * 0.92, ty = (H * 0.62 - cible.y) * t * 0.9 - (bond || 0);
      monde.style.transform = 'translate(' + (tx / W * 100) + '%,' + (ty / H * 100) + '%) scale(' + s + ')';
    }
    if (monde) {
      monde.style.transformOrigin = (cible.x / W * 100) + '% ' + (cible.y / H * 100) + '%';
      monde.style.transition = calme ? 'none' : 'transform 520ms cubic-bezier(.3,1.4,.5,1)';
      placer(0, 5);
    }
    cfg.gestes.forEach(function (g) {
      if (g.meca !== 'rythme' || !monde) return;
      g.pas = function (k, n) {
        placer(k, n, calme ? 0 : 40);
        setTimeout(function () { placer(k, n, 0); }, 260);
      };
    });
    // l'iris se referme sur le pigeonnier, là où la danse a mené
    derouler(scene, cfg, { attente: 400, fin: function () { sortir(scene, { de: [628, 1134] }); } });
  };

  // Le pigeonnier : ôter les lunettes, les voir fondre en clé, ouvrir sur le soleil. Les cinq
  // gestes de la page, dans l'ordre : ôter les lunettes, le geste vif, porter la clé à la
  // serrure, le tour de poignet, pousser la porte.
  speciales.pigeonnier = function (scene, cfg) {
    // Le SVG est lu par DOMParser : cela marche aussi bien en HTML qu'en XHTML (EPUB).
    var balisage =
      '<svg xmlns="http://www.w3.org/2000/svg" class="jeu-svg" viewBox="0 0 1200 1800" aria-hidden="true"><defs>' +
      '<filter id="goo" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="f"/>' +
      '<feColorMatrix in="f" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>' +
      '<filter id="lueur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="verre" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b5a45"/><stop offset=".5" stop-color="#241a12"/><stop offset="1" stop-color="#0b0806"/></linearGradient>' +
      '<linearGradient id="laiton" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c178"/><stop offset=".5" stop-color="#a8742f"/><stop offset="1" stop-color="#5b3814"/></linearGradient>' +
      '<pattern id="rayures" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="url(#laiton)"/><rect width="5" height="14" fill="#6d3f17" opacity=".55"/></pattern>' +
      '<filter id="rouille" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="2" seed="4" result="r"/>' +
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 .55  0 0 0 0 .25  0 0 0 0 .08  0 0 0 1.6 -.6" result="rr"/><feComposite in="rr" in2="SourceGraphic" operator="in" result="rrr"/>' +
      '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="rrr"/></feMerge></filter>' +
      '</defs>' +
      // les jours de la porte, par où passera le soleil
      '<g id="jours" opacity="0" filter="url(#lueur)" fill="#ffe7a8">' +
      [350, 450, 550, 650, 750, 850].map(function (x) { return '<rect x="' + (x - 3) + '" y="270" width="6" height="1280"/>'; }).join('') +
      '<rect x="250" y="1554" width="700" height="9"/><rect x="244" y="260" width="9" height="1300"/><rect x="947" y="260" width="9" height="1300"/>' +
      '</g>' +
      '<circle id="cible-serrure" cx="820" cy="1010" r="60" fill="none" stroke="#ffe7a8" stroke-width="3" stroke-dasharray="8 10" opacity="0"/>' +
      // l'objet : lunettes puis clé, dans un groupe « visqueux »
      '<g id="objet" style="cursor:grab">' +
      '<circle id="halo" class="halo-interet" cx="0" cy="0" r="215" fill="none" stroke="#ffe7a8" stroke-width="5" stroke-dasharray="4 14" stroke-linecap="round"/>' +
      '<g id="goo-groupe" filter="url(#goo)">' +
      '<circle id="verre-g" cx="-105" cy="0" r="72" fill="url(#verre)" stroke="#1d130b" stroke-width="16"/>' +
      '<circle id="verre-d" cx="105" cy="0" r="72" fill="url(#verre)" stroke="#1d130b" stroke-width="16"/>' +
      '<path id="pont" d="M-38,-10 Q0,-38 38,-10" fill="none" stroke="#1d130b" stroke-width="14"/>' +
      '<path id="branche" d="M175,-10 L300,-40" fill="none" stroke="#1d130b" stroke-width="12" stroke-linecap="round"/>' +
      '<g id="cle" opacity="0">' +
      '<circle cx="-150" cy="0" r="58" fill="none" stroke="url(#rayures)" stroke-width="30"/>' +
      '<rect x="-96" y="-12" width="330" height="24" rx="6" fill="url(#rayures)"/>' +
      '<rect x="170" y="10" width="22" height="46" fill="url(#rayures)"/><rect x="204" y="10" width="16" height="30" fill="url(#rayures)"/><rect x="226" y="10" width="10" height="52" fill="url(#rayures)"/>' +
      '</g></g>' +
      '<ellipse id="reflet" cx="-130" cy="-30" rx="26" ry="12" fill="#fff" opacity=".25"/>' +
      '</g></svg>';
    var svg = doc.importNode(new DOMParser().parseFromString(balisage, 'image/svg+xml').documentElement, true);
    scene.appendChild(svg);
    function q(id) { return svg.querySelector('#' + id); }
    var objet = q('objet'), gooG = q('goo-groupe'), cle = q('cle'), vg = q('verre-g'), vd = q('verre-d');
    var pont = q('pont'), branche = q('branche'), reflet = q('reflet'), jours = q('jours'), cibleSerrure = q('cible-serrure');
    var anneau = q('halo'), decor = $('.decor', scene), flot = el('div', { 'class': 'lumiere-flot ui' }, scene);
    var pose = { x: 600, y: 1700, s: 0.001, r: 0 }, fini = false, vibration = false;
    function placer(dx, dy) {
      objet.setAttribute('transform', 'translate(' + (pose.x + (dx || 0)) + ' ' + (pose.y + (dy || 0)) + ') rotate(' + pose.r + ') scale(' + pose.s + ')');
    }
    placer();
    // un geste sur l'objet : halo tout de suite, consigne après 2,5 s, action dans la fiche
    function surObjet(g, id, cibleEl) {
      anneau.classList.add('actif');
      var c = consigne(scene, g.consigne, 1260, 2500);
      return new Promise(function (ok) {
        var fait = false, zoneCible = cibleEl || objet, bouton = boutonFaireLeGeste(scene, function () { terminer(); });
        function terminer() {
          if (fait) return; fait = true;
          zoneCible.removeEventListener('pointerup', fin); doc.removeEventListener('keydown', fin);
          Objets.retirerAction(id); c.effacer(); anneau.classList.remove('actif'); bouton.retirer();
          ok();
        }
        function fin(ev) {
          if (bloque()) return;
          if (ev.type === 'keydown' && !toucheValide(ev)) return;
          if (ev.type !== 'keydown' && !horsInterface(ev)) return;
          if (ev.cancelable) ev.preventDefault();
          terminer();
        }
        zoneCible.addEventListener('pointerup', fin); doc.addEventListener('keydown', fin);
        if (g.action) Objets.proposer(id, g.action, terminer);
      });
    }
    function vibrer() {
      Son.effet('vibre');
      var t0 = null;
      vibration = true;
      (function v(t) {
        if (!vibration) return;
        if (t0 === null) t0 = t;
        var dt = ((t || 0) - t0) / 1000;
        placer(calme ? 0 : Math.sin(dt * 90) * 3, calme ? 0 : Math.cos(dt * 70) * 2);
        gooG.style.filter = 'url(#goo) hue-rotate(' + Math.round(dt * 160) + 'deg) saturate(2.4)';
        requestAnimationFrame(v);
      })(0);
    }
    function fondreEnCle() {
      Son.effet('fonte');
      return anime(1700, function (x) {
        var t = lisse(x);
        vg.setAttribute('cx', -105 - 45 * t); vg.setAttribute('r', 72 - 14 * t);
        vd.setAttribute('cx', 105 + 60 * t); vd.setAttribute('r', 72 * (1 - t) + 4);
        pont.setAttribute('stroke-width', 14 + 10 * t);
        branche.setAttribute('d', 'M' + (175 - 60 * t) + ',' + (-10 + 10 * t) + ' L' + (300 - 60 * t) + ',' + (-40 + 40 * t));
        cle.setAttribute('opacity', t);
        vg.setAttribute('opacity', 1 - t); vd.setAttribute('opacity', 1 - t); pont.setAttribute('opacity', 1 - t); branche.setAttribute('opacity', 1 - t);
        reflet.setAttribute('opacity', 0.25 * (1 - t));
      }).then(function () {
        vibration = false;
        gooG.style.filter = '';
        gooG.removeAttribute('filter');
        cle.setAttribute('filter', 'url(#rouille)');
        placer();
      });
    }
    var gestes = cfg.gestes;
    scene.gestesLocaux = {};
    // 1. ôter les lunettes
    if (gestes[0]) scene.gestesLocaux[gestes[0].cle] = function (g) {
      return anime(900, function (x) { pose.s = lisse(x); pose.y = 1700 - 160 * lisse(x); placer(); })
        .then(function () { return surObjet(g, 'lunettes'); })
        .then(function () {
          Transitions.frisson(scene, pose.x, pose.y, 260);    // portées → en main
          return anime(700, function (x) { pose.y = 1540 - 120 * lisse(x); pose.s = 1 + 0.1 * lisse(x); placer(); });
        });
    };
    // 2. le geste vif : glisser vers le haut, ou toucher
    if (gestes[1]) scene.gestesLocaux[gestes[1].cle] = function (g) { return surObjet(g, 'lunettes', scene); };
    // 3. porter la clé jusqu'à la serrure
    if (gestes[2]) scene.gestesLocaux[gestes[2].cle] = function (g) {
      var c = consigne(scene, g.consigne, 1220, 2500);
      cibleSerrure.setAttribute('opacity', '0.8');
      anneau.classList.add('actif');
      return new Promise(function (ok) {
        var prise = false, depart = null, bouge = false, fait = false;
        function bas(ev) {
          if (bloque()) return;
          prise = true; bouge = false; depart = coordScene(scene, ev);
          if (objet.setPointerCapture) { try { objet.setPointerCapture(ev.pointerId); } catch (e) { /* rien */ } }
          if (ev.cancelable) ev.preventDefault();
        }
        function mouv(ev) {
          if (!prise) return;
          var p = coordScene(scene, ev);
          if (Math.abs(p.x - depart.x) + Math.abs(p.y - depart.y) > 12) bouge = true;
          pose.x = p.x; pose.y = p.y; pose.s = 0.8; placer();
        }
        function haut(ev) {
          if (bloque()) return;
          if (ev.type === 'keydown') { if (!toucheValide(ev)) return; terminer(); return; }
          if (!prise) return;
          prise = false;
          if (!bouge || Math.hypot(pose.x - 820, pose.y - 1010) < 170) terminer();
        }
        function terminer() {
          if (fait) return;
          fait = true;
          bouton.retirer();
          Objets.retirerAction('cle');
          anneau.classList.remove('actif');
          objet.removeEventListener('pointerdown', bas); objet.removeEventListener('pointermove', mouv);
          objet.removeEventListener('pointerup', haut); doc.removeEventListener('keydown', haut);
          c.effacer(); cibleSerrure.setAttribute('opacity', '0');
          var x0 = pose.x, y0 = pose.y, s0 = pose.s;
          anime(700, function (x) { var t = lisse(x); pose.x = x0 + (932 - x0) * t; pose.y = y0 + (1010 - y0) * t; pose.s = s0 + (0.42 - s0) * t; placer(); })
            .then(function () { Son.effet('cle'); Transitions.frisson(scene, 932, 1010, 170); ok(); });
        }
        var bouton = boutonFaireLeGeste(scene, function () { terminer(); });
        objet.style.touchAction = 'none';
        objet.addEventListener('pointerdown', bas); objet.addEventListener('pointermove', mouv);
        objet.addEventListener('pointerup', haut); doc.addEventListener('keydown', haut);
        if (g.action) Objets.proposer('cle', g.action, terminer);
      });
    };
    // 4. le tour de poignet : la clé tourne d'un quart de tour, la porte se déconsolide
    if (gestes[3]) scene.gestesLocaux[gestes[3].cle] = function (g) {
      var tour = g.meca === 'tourner' ? Mecaniques.tourner(scene, g) : surObjet(g, 'cle');
      return tour.then(function () {
        if (g.meca !== 'tourner') Son.effet('tour');
        return anime(650, function (x) { pose.r = -90 * lisse(x); placer(); });
      }).then(function () {
        Transitions.frisson(scene, 932, 1010, 130);
        Son.effet('grince');
        return anime(1200, function (x) {
          var a = calme ? 0 : Math.sin(x * 40) * (1 - x) * 6;
          decor.style.transform = 'translate(' + a + 'px,' + (a / 2) + 'px)';
        });
      }).then(function () { decor.style.transform = ''; });
    };
    // 5. pousser la porte : elle s'agrandit, sa lumière envahit l'écran
    if (gestes[4]) scene.gestesLocaux[gestes[4].cle] = function (g) {
      return surObjet(g, 'cle', scene).then(function () {
        Son.effet('souffle'); fini = true;
        decor.style.transition = calme ? 'none' : 'transform 2.2s ease-in';
        decor.style.transform = 'scale(1.6)';
        return anime(2100, function (x) { flot.style.opacity = lisse(x); });
      });
    };
    scene.effetsLocaux = {
      vibre: vibrer,
      // la clé née de la fonte entre dans les objets, et sa fiche se présente une fois
      eclat: function (s, e) {
        return fondreEnCle()
          .then(function () { return Effets.eclat(scene, e); })
          .then(function () { Objets.remplacer('lunettes', 'cle'); return Objets.presenter('cle'); });
      },
      jour: function () {
        Son.effet('jour');
        return anime(2600, function (x) { jours.setAttribute('opacity', 0.15 + 0.85 * lisse(x)); }).then(function () {
          var t0 = null;
          (function vacille(t) {
            if (fini) return;
            if (t0 === null) t0 = t;
            if (!calme) jours.setAttribute('opacity', 0.85 + 0.15 * Math.sin(((t || 0) - t0) / 260));
            requestAnimationFrame(vacille);
          })(0);
        });
      }
    };
    // la porte, agrandie par la poussée, remplit l'écran : sa lumière l'envahit
    derouler(scene, cfg, {
      attente: 400,
      fin: function () {
        jouerEffets(scene, cfg.bilan.filter(function (e) { return e.nom === 'porte'; }));
        sortir(scene, { de: [30, -124, 1140, 2080] });
      }
    });
  };

  // ---------------------------------------------------------------- outils des scènes du livre entier
  /* Les scènes plier, vision et listes dessinent dans leurs propres calques (classes « scene-… », jamais
     « fx », que l'équipe des effets nettoie quand une page est rejouée) et animent par Fx.tache et
     Fx.animer, qui s'arrêtent avec la page. Les identifiants SVG portent le numéro de la page : l'édition
     web garde les 85 pages dans un seul document. */
  function prefixe(scene, nom) { return nom + (scene.getAttribute('data-scene') || '').replace(/\D/g, '-'); }
  function svgDepuis(balisage) {
    return doc.importNode(new DOMParser().parseFromString(balisage, 'image/svg+xml').documentElement, true);
  }
  // Un calque SVG de la scène (1200 × 1800), sous le texte : avant le panneau, et avant les calques que
  // les gestes poseront ensuite (ils viennent donc par-dessus).
  function calqueScene(scene, classe, defs) {
    var s = svgDepuis('<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg ' + classe + '" viewBox="0 0 ' + W + ' ' + H +
      '" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>' + (defs || '') + '</defs></svg>');
    var t = $('.texte', scene);
    if (t && t.parentNode === scene) scene.insertBefore(s, t); else scene.appendChild(s);
    return s;
  }
  // L'édition web rend les images d'une page quittée (img[src]) ; celles des calques SVG aussi, ici : une
  // page quittée n'est jamais remontrée sans être rejouée (le menu la rejoue), et ses calques refaits.
  function rendreImages(scene, racine) {
    Fx.surDepart(scene, function () {
      $$('image', racine).forEach(function (i) { i.removeAttribute('href'); i.removeAttributeNS('http://www.w3.org/1999/xlink', 'href'); });
    });
  }
  function entre(a, b, t) { return a + (b - a) * t; }
  function f1(v) { return (+v).toFixed(1); }
  function opacite(e, v) { if (e) e.setAttribute('opacity', borne(v).toFixed(3)); }
  // Une animation de la page (arrêtée avec elle), plus courte en mouvement réduit.
  function animerPage(scene, duree, dureeCalme, pas) { return Fx.animer(scene, calme ? dureeCalme : duree, pas); }
  // Le fichier d'un décor, ou le n-ième fichier d'un décor composé (« toits » : le ciel, puis la ville).
  function fichierDecor(nom, n) {
    var f = DONNEES.images && DONNEES.images[nom];
    return f && f[n || 0] ? Fx.DOSSIER + f[n || 0] : null;
  }
  // Une étoile du carnet (✦ crème sur un halo d'or), centrée en (x, y).
  function etoileSvg(parent, x, y, r, o) {
    o = o || {};
    var g = svgEl('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ')' }, parent);
    svgEl('circle', { r: f1(r * 1.7), fill: OR, opacity: o.halo === undefined ? 0.22 : o.halo }, g);
    var p = svgEl('path', { d: etoile(r), fill: CREME }, g);
    if (o.filtre) p.setAttribute('filter', 'url(#' + o.filtre + ')');
    return g;
  }

  // ---------------------------------------------------------------- plier (3.4)
  /* Des lunettes qui plient l'espace (docs/darshan-mise-en-scene/chapitre-3.md, 3.4 et section 6). Le
     lecteur refait le geste vif du pigeonnier (1.3), avec la même consigne, et découvre ce qu'il faisait
     sans le savoir : du même mouvement, les lunettes fondent en clé et le ciel se plie, Aluva sur Paris.
     Les lunettes et la clé sont les dessins de la scène du pigeonnier, rendus en or ; les deux étoiles et
     leur fil pointillé sont ceux du carnet. Les deux effets du geste (`fonte`, `pli`) suivent le doigt
     (glisser avec `suivre`) ; `lentilles` met un monde dans chaque verre. Mouvement réduit : rien ne
     plie ni ne glisse ; la clé paraît, l'étoile d'Aluva se fond dans celle de Paris, par des fondus. */
  speciales.plier = function (scene, cfg) {
    var id = prefixe(scene, 'pl'), g0 = cfg.gestes[0] || {};
    var pli = (g0.effets || []).filter(function (e) { return e.nom === 'pli'; })[0] || {};
    var axe = pli.axe || 700, de = pli.de || [600, 1000], vers = pli.vers || [600, 400], ECHELLE = 1.35;
    $$('.plier-svg', scene).forEach(retirer);
    var s = calqueScene(scene, 'plier-svg',
      '<filter id="' + id + '-goo" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="9" result="f"/>' +
      '<feColorMatrix in="f" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g"/>' +
      '<feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>' +
      '<filter id="' + id + '-lueur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="' + id + '-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7b0"/>' +
      '<stop offset=".5" stop-color="#f4c56a"/><stop offset="1" stop-color="#b8862f"/></linearGradient>' +
      '<radialGradient id="' + id + '-eclat"><stop offset="0" stop-color="#fff8ea"/><stop offset=".35" stop-color="#ffe3a0" stop-opacity=".8"/>' +
      '<stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + '-bas"><rect x="-200" y="' + axe + '" width="1600" height="' + (H - axe + 200) + '"/></clipPath>' +
      '<clipPath id="' + id + '-vg"><circle cx="-105" cy="0" r="66"/></clipPath>' +
      '<clipPath id="' + id + '-vd"><circle cx="105" cy="0" r="66"/></clipPath>');
    var lieux = (DONNEES.carte && DONNEES.carte.lieux) || {};
    function nom(parent, lieu, x, y) {
      var t = svgEl('text', { x: x + 52, y: y + 13, 'class': 'plier-nom' }, parent);
      t.textContent = (lieux[lieu] && lieux[lieu].nom) || '';
      return t;
    }
    function fil(parent, y0, y1) {
      return svgEl('line', { x1: vers[0], y1: y0, x2: vers[0], y2: y1, stroke: OR, 'stroke-width': 3, 'stroke-dasharray': '3 9',
        'stroke-linecap': 'round', opacity: 0.8 }, parent);
    }
    // « Paris en haut (600, 400) et Aluva plus bas (600, 1 000), reliées par un fil d'or, avec leurs noms
    // en petites capitales » ; tout reste au-dessus du texte.
    var haut = svgEl('g', {}, s);
    fil(haut, vers[1], axe);
    var lueurParis = svgEl('circle', { cx: vers[0], cy: vers[1], r: 90, fill: 'url(#' + id + '-eclat)', opacity: 0 }, haut);
    etoileSvg(haut, vers[0], vers[1], 24, { filtre: id + '-lueur' });
    var nomParis = nom(haut, 'paris', vers[0], vers[1]);
    // sous la moitié qui se plie : la nuit nue, l'espace replié découvre le vide
    var vide = svgEl('rect', { x: -100, y: axe, width: 1400, height: H - axe + 100, fill: '#02030a', opacity: 0 }, s);
    // la moitié basse du ciel : la même image que le décor, qui se replie autour de l'axe comme une page
    var rabat = svgEl('g', {}, s);
    Gestes.image(rabat, Fx.sourceImage(scene, 'cosmos'), { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none',
      'clip-path': 'url(#' + id + '-bas)' });
    fil(rabat, axe, de[1]);
    var aluva = etoileSvg(rabat, de[0], de[1], 24, { filtre: id + '-lueur' });
    var nomAluva = nom(rabat, 'aluva', de[0], de[1]);
    var ombre = svgEl('rect', { x: -100, y: axe, width: 1400, height: H - axe + 100, fill: '#000', opacity: 0 }, rabat);
    var pliure = svgEl('line', { x1: 0, y1: axe, x2: W, y2: axe, stroke: OR, 'stroke-width': 3, opacity: 0, filter: 'url(#' + id + '-lueur)' }, s);
    var eclat = svgEl('circle', { cx: vers[0], cy: vers[1], r: 40, fill: 'url(#' + id + '-eclat)', opacity: 0 }, s);
    // les lunettes du pigeonnier, en traits d'or, posées sur l'axe du pli ; la clé, en or, dans le même groupe
    var objet = svgEl('g', { transform: 'translate(' + vers[0] + ' ' + axe + ') scale(' + ECHELLE + ')' }, s);
    var visqueux = svgEl('g', {}, objet);
    var trait = { fill: 'none', stroke: 'url(#' + id + '-or)', 'stroke-linecap': 'round' };
    var vg = svgEl('circle', Fx.copie(trait, { cx: -105, cy: 0, r: 72, fill: 'rgba(14,10,24,.5)', 'stroke-width': 9 }), visqueux);
    var vd = svgEl('circle', Fx.copie(trait, { cx: 105, cy: 0, r: 72, fill: 'rgba(14,10,24,.5)', 'stroke-width': 9 }), visqueux);
    var pont = svgEl('path', Fx.copie(trait, { d: 'M-38,-10 Q0,-38 38,-10', 'stroke-width': 9 }), visqueux);
    var bg = svgEl('path', Fx.copie(trait, { 'stroke-width': 8 }), visqueux), bd = svgEl('path', Fx.copie(trait, { 'stroke-width': 8 }), visqueux);
    var cle = svgEl('g', { opacity: 0, fill: 'url(#' + id + '-or)' }, visqueux);
    svgEl('circle', { cx: -150, cy: 0, r: 58, fill: 'none', stroke: 'url(#' + id + '-or)', 'stroke-width': 22 }, cle);
    svgEl('rect', { x: -96, y: -12, width: 330, height: 24, rx: 6 }, cle);
    svgEl('rect', { x: 170, y: 10, width: 22, height: 46 }, cle);
    svgEl('rect', { x: 204, y: 10, width: 16, height: 30 }, cle);
    svgEl('rect', { x: 226, y: 10, width: 10, height: 52 }, cle);
    var reflets = svgEl('g', { fill: '#fff' }, objet);
    svgEl('ellipse', { cx: -132, cy: -30, rx: 26, ry: 10, opacity: 0.22, transform: 'rotate(-20 -132 -30)' }, reflets);
    svgEl('ellipse', { cx: 78, cy: -30, rx: 26, ry: 10, opacity: 0.16, transform: 'rotate(-20 78 -30)' }, reflets);
    // « dans le verre gauche paraît Paris (les toits), dans le droit le Periyar »
    var lentilles = svgEl('g', { opacity: 0 }, objet);
    function monde(clip, src, x, y, l) {
      if (!src) return;
      Gestes.image(svgEl('g', { 'clip-path': 'url(#' + id + '-' + clip + ')' }, lentilles), src,
        { x: f1(x), y: f1(y), width: f1(l), height: f1(l * 1.5), preserveAspectRatio: 'none' });
    }
    function lentille(x, nomDecor, cx, cy, largeur) {
      var k = 132 / largeur;   // la région choisie du décor emplit le verre
      [0, 1].forEach(function (n) { monde(x < 0 ? 'vg' : 'vd', fichierDecor(nomDecor, n), x - cx * k, -cy * k, W * k); });
    }
    var reglage = (cfg.effets && [].concat.apply([], Object.keys(cfg.effets).map(function (k) { return cfg.effets[k]; }))
      .filter(function (e) { return e.nom === 'lentilles'; })[0]) || {};
    lentille(-105, reglage.gauche || 'toits', 380, 1080, 620);     // la tour et les toits, sous le ciel de nuit
    lentille(105, reglage.droite || 'periyar', 600, 820, 700);     // l'eau du fleuve sous les arbres
    svgEl('circle', { cx: -105, cy: 0, r: 66, fill: 'rgba(30,18,6,.22)' }, lentilles);
    svgEl('circle', { cx: 105, cy: 0, r: 66, fill: 'rgba(30,18,6,.22)' }, lentilles);

    // ---- la fonte : les lunettes deviennent la clé du pigeonnier (t : 0 lunettes, 1 clé)
    // les formes de la fonte de 1.3 : le verre gauche devient l'anneau, la branche droite la tige
    function formes(t) {
      vg.setAttribute('cx', f1(-105 - 45 * t)); vg.setAttribute('r', f1(72 - 14 * t));
      vd.setAttribute('cx', f1(105 + 60 * t)); vd.setAttribute('r', f1(72 * (1 - t) + 4));
      pont.setAttribute('stroke-width', f1(9 + 10 * t));
      bd.setAttribute('d', 'M' + f1(entre(177, 115, t)) + ',' + f1(entre(-12, 0, t)) + ' C' + f1(entre(235, 160, t)) + ',' + f1(entre(-22, 0, t)) +
        ' ' + f1(entre(292, 200, t)) + ',' + f1(entre(-42, 0, t)) + ' ' + f1(entre(332, 240, t)) + ',' + f1(entre(-74, 0, t)));
      bg.setAttribute('d', 'M' + f1(entre(-177, -150, t)) + ',' + f1(entre(-12, 0, t)) + ' C' + f1(entre(-235, -160, t)) + ',' + f1(entre(-22, 0, t)) +
        ' ' + f1(entre(-292, -165, t)) + ',' + f1(entre(-42, 0, t)) + ' ' + f1(entre(-332, -170, t)) + ',' + f1(entre(-74, 0, t)));
      vg.setAttribute('fill', 'rgba(14,10,24,' + (0.5 * (1 - t)).toFixed(3) + ')');
      vd.setAttribute('fill', 'rgba(14,10,24,' + (0.5 * (1 - t)).toFixed(3) + ')');
    }
    formes(0);
    var fonte = -1;
    function fondre(t) {
      t = borne(t);
      if (Math.abs(t - fonte) < 0.0005) return;
      fonte = t;
      // en mouvement réduit, rien ne bouge : les lunettes s'effacent, la clé paraît
      if (!calme) formes(t);
      if (t > 0.001 && t < 0.999 && !calme) visqueux.setAttribute('filter', 'url(#' + id + '-goo)'); else visqueux.removeAttribute('filter');
      [vg, vd, pont, bd].forEach(function (e) { opacite(e, 1 - t); });
      opacite(bg, 1 - (calme ? 1 : 1.6) * t); opacite(reflets, 1 - (calme ? 1 : 2) * t);
      opacite(cle, t);
    }
    // ---- le pli : la moitié basse du ciel se replie vers le haut autour de l'axe, comme une page
    // (u : 0 à plat, 1 replié : le point d'Aluva vient sur celui de Paris)
    function plier(u) {
      u = borne(u);
      opacite(nomParis, 1 - u * 8); opacite(nomAluva, 1 - u * 8);
      if (calme) { opacite(aluva, 1 - u); opacite(lueurParis, u); return; }
      var th = Math.PI * u, c = Math.cos(th);
      if (Math.abs(c) < 0.002) c = c < 0 ? -0.002 : 0.002;
      rabat.setAttribute('transform', 'matrix(1 0 0 ' + c.toFixed(4) + ' 0 ' + f1(axe * (1 - c)) + ')');
      opacite(ombre, 0.62 * Math.sin(th) + (c < 0 ? 0.14 * (1 - u) : 0));
      opacite(vide, lisse(borne(u * 6)));
      opacite(pliure, 0.9 * Math.sin(th));
    }
    fondre(0); plier(0);

    // ---- le geste : les deux effets suivent le même doigt ; l'image le rattrape en douceur (un geste
    // vif claque d'un coup, il ne saute pas) ; au bout, l'éclat et le tintement, Aluva posée sur Paris
    var suivi = null;
    function suivre(e) {
      if (!suivi) {
        var fin = null;
        suivi = { x: 0, vu: 0, fini: false, sonFonte: false, sonPli: false, fait: new Promise(function (ok) { fin = ok; }) };
        Fx.tache(scene, function (t, dt) {
          var k = calme ? 1 : 1 - Math.exp(-dt / 0.07);
          suivi.vu += (suivi.x - suivi.vu) * k;
          if (Math.abs(suivi.x - suivi.vu) < 0.003) suivi.vu = suivi.x;
          if (!suivi.sonFonte && suivi.vu > 0.04) { suivi.sonFonte = true; Fx.sonner('fonte'); }
          if (!suivi.sonPli && suivi.vu > 0.26) { suivi.sonPli = true; Fx.sonner('papier'); }
          fondre(suivi.vu / 0.4);
          plier(suivi.vu <= 0.22 ? 0 : lisse((suivi.vu - 0.22) / 0.78));
          if (suivi.fini && suivi.vu >= 1) { fin(); return false; }
        });
        // le geste rejoué sans doigt (un toucher, Entrée, la fiche) : 0,9 s, comme glisser le fait
        if (!e.geste) Fx.animer(scene, calme ? 300 : 900, function (x) { suivi.x = lisse(x); if (x >= 1) suivi.fini = true; });
      }
      if (e.geste) e.geste.suivre(function (x, fini) { suivi.x = Math.max(0, Math.min(1, x)); if (fini) { suivi.x = 1; suivi.fini = true; } });
      return suivi.fait;
    }
    scene.effetsLocaux = {
      // « ses lunettes aux visages déformés adoptent l'allure de la précédente clé » : la fonte de 1.3,
      // en or, dans le décor (le sac ne change pas)
      fonte: function (sc, e) { return suivre(e); },
      // « Dans le même temps qu'elles se plient, elles en font autant de l'espace, faisant plus que de
      // vulgaires bottes de sept lieux » : au bout, un éclat et un tintement ; le pli tient une seconde,
      // puis se déplie (1,5 s)
      pli: function (sc, e) {
        return suivre(e).then(function () {
          Fx.sonner('tinte');
          animerPage(scene, 800, 400, function (x) {
            eclat.setAttribute('r', f1(calme ? 150 : 40 + 230 * vif(x)));
            opacite(eclat, calme ? Math.sin(Math.PI * x) : 1 - x);
          });
          return Fx.pause(scene, calme ? 500 : 1000);
        }).then(function () {
          return animerPage(scene, 1500, 400, function (x) { plier(1 - lisse(x)); });
        });
      },
      // « Elles portent sa vue plus loin… » : la clé redevient lunettes, et un monde paraît dans chaque
      // verre ; le bouton Objets luit au même instant (l'effet `regard`, qui suit)
      lentilles: function () {
        var retour = animerPage(scene, 1200, 300, function (x) { fondre(1 - lisse(x)); });
        var mondes = retour.then(function () {
          return animerPage(scene, 1500, 400, function (x) { opacite(lentilles, lisse(x)); });
        });
        return { suite: retour, fin: mondes };
      }
    };
    derouler(scene, cfg, { attente: 500 });
    rendreImages(scene, s);
  };

  // ---------------------------------------------------------------- la lanterne du père
  /* « une lanterne de bois aux motifs circulaires » (3.10) ; « Le linteau s'accompagne d'une lanterne aux
     rayons pénétrants » (7.12). Six pans de bois ajourés de cercles (d'après le vitrail aux arcs de cercle
     de Karl, 34849711), vus de face : un pan entier, deux en raccourci ; un toit, une base, une chaîne qui
     monte hors du cadre. Lanterne(parent, x, y, id, haut) pose la flamme en (x, y) : c'est le point orange de
     la nuit de Karl (noir-lueur, en (600, 300)), même taille, même couleur, pour que la photo puisse
     s'effacer sous lui ; `haut` : le haut de la chaîne, au-dessus de la flamme (-330 par défaut). Les mêmes
     dessins servent à la scène rue-de-rungis (7.12 à 7.15), 120 unités au-dessus du haut de la porte, la
     chaîne plus longue (elle sort encore du cadre). Rend { g, flamme, traits (les quatre tracés de couleur :
     ocre pour le bois, vert pour le toit et la base, bleu pour les jours, or pour la chaîne), bois (la lanterne
     éclairée du dedans), feux (ses jours qui brillent), halo, jours (les centres des jours, en unités de
     page), etat, poser(etat) } ; états : 'eteinte' (rien), 'flamme' (le point seul), 'traits' (le dessin en
     couleurs), 'allumee', 'sombre' (le bois sans lumière, 7.15). */
  function Lanterne(parent, x, y, id, haut) {
    var L = { etat: 'eteinte', jours: [] };
    haut = haut || -330;
    L.g = svgEl('g', { 'class': 'lanterne', transform: 'translate(' + x + ' ' + y + ')' }, parent);
    var defs = svgEl('defs', {}, L.g);
    function degrade(nom, stops, o) {
      var gr = svgEl('radialGradient', Fx.copie({ id: id + '-' + nom }, o || {}), defs);
      stops.forEach(function (s) { svgEl('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] === undefined ? 1 : s[2] }, gr); });
      return 'url(#' + id + '-' + nom + ')';
    }
    var fHalo = degrade('halo', [[0, '#ffe2a0', 0.55], [0.35, '#ffc867', 0.22], [1, '#ffb347', 0]]);
    var fFlamme = degrade('flamme', [[0, '#ff7410'], [0.62, '#ff6402'], [0.85, '#ff6402', 0.35], [1, '#ff6402', 0]]);
    var fJour = degrade('jour', [[0, '#fffbe8'], [0.55, '#ffe08e'], [1, '#f0a040']]);
    var fAura = degrade('aura', [[0, '#ff6a10', 0.2], [0.5, '#ff6a10', 0.07], [1, '#ff6a10', 0]]);
    var lueur = svgEl('filter', { id: id + '-lueur', x: '-80%', y: '-80%', width: '260%', height: '260%' }, defs);
    svgEl('feGaussianBlur', { stdDeviation: 5, result: 'b' }, lueur);
    var fm = svgEl('feMerge', {}, lueur);
    svgEl('feMergeNode', { 'in': 'b' }, fm); svgEl('feMergeNode', { 'in': 'SourceGraphic' }, fm);
    L.halo = svgEl('circle', { r: 340, fill: fHalo, opacity: 0 }, L.g);
    L.flamme = svgEl('g', { opacity: 0 }, L.g);
    svgEl('circle', { r: 92, fill: fAura }, L.flamme);
    svgEl('circle', { r: 40, fill: fFlamme }, L.flamme);
    // les jours (cercles et, sur les pans en raccourci, ellipses) : [x, y, rx, ry]
    var JOURS = [[0, 0, 22, 22], [0, -50, 10, 10], [0, 50, 10, 10], [-26, -26, 7, 7], [26, -26, 7, 7], [-26, 26, 7, 7], [26, 26, 7, 7],
      [-67.5, 0, 9, 20], [67.5, 0, 9, 20], [-67.5, -48, 4.5, 9], [67.5, -48, 4.5, 9], [-67.5, 48, 4.5, 9], [67.5, 48, 4.5, 9]];
    JOURS.forEach(function (j) { L.jours.push([x + j[0], y + j[1], j[2]]); });
    function ovale(j) { return 'M' + (j[0] - j[2]) + ',' + j[1] + 'a' + j[2] + ',' + j[3] + ' 0 1,0 ' + 2 * j[2] + ',0a' + j[2] + ',' + j[3] + ' 0 1,0 ' + (-2 * j[2]) + ',0'; }
    var BOIS = 'M-90,-80V80M90,-80V80M-90,-80H90M-90,80H90M-45,-80V80M45,-80V80M-90,-72H90M-90,72H90';
    var TOIT = 'M-98,-80L-72,-94L72,-94L98,-80ZM-72,-94L-14,-128L14,-128L72,-94M-24,-94L-5,-128M24,-94L5,-128M-92,80L-44,98L44,98L92,80M-12,98L0,116L12,98';
    var CHAINE = 'M0,' + haut + 'V-155M-9,-146a9,9 0 1,0 18,0a9,9 0 1,0 -18,0M-7,-134a7,7 0 1,0 14,0a7,7 0 1,0 -14,0';
    // ---- éclairée du dedans : le bois sombre, les jours qui brillent, les arêtes qui prennent l'or
    L.bois = svgEl('g', { opacity: 0 }, L.g);
    svgEl('path', { d: 'M0,' + haut + 'V-155', stroke: '#3a2414', 'stroke-width': 5 }, L.bois);
    svgEl('path', { d: 'M1.5,' + haut + 'V-155', stroke: OR, 'stroke-width': 1.2, opacity: 0.6 }, L.bois);
    svgEl('path', { d: 'M-98,-80L-72,-94L72,-94L98,-80ZM-72,-94L-14,-128L14,-128L72,-94Z', fill: '#2b190d', stroke: '#c8893a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, L.bois);
    svgEl('path', { d: 'M-92,80L-44,98L44,98L92,80ZM-12,98L0,116L12,98Z', fill: '#2b190d', stroke: '#c8893a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, L.bois);
    svgEl('circle', { cx: 0, cy: -146, r: 9, fill: 'none', stroke: '#c8893a', 'stroke-width': 4 }, L.bois);
    svgEl('circle', { cx: 0, cy: -134, r: 7, fill: '#c8893a' }, L.bois);
    svgEl('rect', { x: -90, y: -80, width: 45, height: 160, fill: '#1e1109' }, L.bois);
    svgEl('rect', { x: 45, y: -80, width: 45, height: 160, fill: '#1e1109' }, L.bois);
    svgEl('rect', { x: -45, y: -80, width: 90, height: 160, fill: '#2a170c' }, L.bois);
    L.feux = svgEl('g', { fill: fJour, filter: 'url(#' + id + '-lueur)' }, L.bois);
    JOURS.forEach(function (j) { svgEl('ellipse', { cx: j[0], cy: j[1], rx: j[2], ry: j[3] }, L.feux); });
    svgEl('path', { d: BOIS, fill: 'none', stroke: '#4a2c16', 'stroke-width': 7 }, L.bois);
    svgEl('path', { d: 'M-45,-72V72M45,-72V72M-90,-76H90M-90,76H90', fill: 'none', stroke: OR, 'stroke-width': 1.6, opacity: 0.75 }, L.bois);
    // ---- les traits de couleur, tracés par les points venus du fond (pathLength = 1 : le tracé avance de 0 à 1)
    L.traits = svgEl('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#' + id + '-lueur)' }, L.g);
    L.traces = [[BOIS, '#d39a52'], [TOIT, '#6fb08a'], [JOURS.map(ovale).join(''), '#78a6e0'], [CHAINE, OR]].map(function (t) {
      return svgEl('path', { d: t[0], stroke: t[1], 'stroke-width': 3.4, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, L.traits);
    });
    // x de 0 à 1 : la part tracée de chaque trait (une liste de quatre, ou un seul nombre)
    L.tracer = function (x) {
      L.traces.forEach(function (p, i) { p.setAttribute('stroke-dashoffset', (1 - borne(typeof x === 'number' ? x : x[i])).toFixed(4)); });
    };
    L.poser = function (etat) {
      var allumee = etat === 'allumee', sombre = etat === 'sombre';
      L.etat = etat;
      opacite(L.flamme, etat === 'eteinte' || sombre ? 0 : 1);
      L.tracer(etat === 'traits' || allumee ? 1 : 0);
      opacite(L.traits, allumee ? 0.18 : 1);
      opacite(L.bois, allumee || sombre ? 1 : 0);
      opacite(L.feux, sombre ? 0.06 : 1);
      opacite(L.halo, allumee ? 1 : 0);
    };
    L.poser('eteinte');
    return L;
  }

  // ---------------------------------------------------------------- la porte du père (3.10, 3.11, 7.12 à 7.15)
  /* La porte d'Irun de Karl, sa lanterne et leur lumière, communes à la vision (le haut du linteau en y 420) et
     à la rue de Rungis (200 unités plus bas, en y 620) : « c'est la même porte, et le lecteur doit la
     reconnaître au premier regard » (chapitre-7.md, 7.12). PorteDuPere(scene, o) met ses définitions dans
     o.svg et ses calques dans o.parent (par défaut o.svg) : les traits d'or de la sculpture (o.traits, le
     calque de decors.py, révélés par un masque), les faisceaux de la lanterne et leurs cercles de lumière sur
     les ornements (FALLS, décalés avec la porte), la lanterne 120 unités au-dessus du linteau (o.chaine : le
     haut de sa chaîne). o.facades : d'autres cercles de lumière, hors de la porte ([x, y, rayon, jour de la
     lanterne] : les façades de la rue, 7.12). o.apres : appelée quand les ornements sont là. Rend P = { g (le
     groupe de tout ce qui précède), L, orn, imgOrn, gRayons, gFacades, extinction, effets : { lanterne,
     ornements } } : les effets que la scène joue à sa façon (scene.effetsLocaux). */
  var FALLS = [[410, 785, 82], [765, 785, 82], [345, 645, 34], [450, 645, 34], [715, 635, 34], [800, 635, 34]];
  var FALLS_JOURS = [7, 8, 3, 5, 6, 4];   // les pans en raccourci vers les octogones, les petits jours vers les médaillons
  function PorteDuPere(scene, o) {
    var id = o.id, dy = (o.y0 || 420) - 420, cx = 600, cy = 300 + dy, apres = o.apres || function () {};
    var defs = svgEl('defs', {}, o.svg);
    function degrade(nom, stops) {
      var gr = svgEl('radialGradient', { id: id + '-' + nom }, defs);
      stops.forEach(function (s) { svgEl('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] }, gr); });
    }
    degrade('revele', [[0, '#fff', 1], [0.6, '#fff', 1], [1, '#fff', 0]]);
    degrade('tache', [[0, '#fff3cf', 0.9], [0.6, '#ffd98a', 0.45], [1, '#ffc861', 0]]);
    var masque = svgEl('mask', { id: id + '-masque', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
    svgEl('rect', { width: W, height: H, fill: '#000' }, masque);
    var P = { g: svgEl('g', {}, o.parent || o.svg), extinction: null };
    P.orn = svgEl('g', { opacity: 0 }, P.g);
    P.imgOrn = o.traits ? Gestes.image(P.orn, o.traits, { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none', mask: 'url(#' + id + '-masque)' }) : null;
    P.gFacades = svgEl('g', { opacity: 0 }, P.g);
    P.gRayons = svgEl('g', { opacity: 0 }, P.g);
    var L = P.L = Lanterne(P.g, cx, cy, id, o.chaine);
    var gTraces = svgEl('g', {}, P.g);
    // chaque cible reçoit un faisceau, venu d'un jour de la lanterne, et un cercle de lumière ; f[4] : la force du
    // faisceau (1 par défaut)
    function faisceaux(cibles, groupe, nom) {
      return cibles.map(function (f, i) {
        var src = L.jours[f[3]], k = f[4] === undefined ? 1 : f[4];
        var gr = svgEl('linearGradient', { id: id + '-' + nom + i, gradientUnits: 'userSpaceOnUse', x1: src[0], y1: src[1], x2: f[0], y2: f[1] }, defs);
        svgEl('stop', { offset: 0, 'stop-color': '#ffe6a8', 'stop-opacity': 0.5 * k }, gr);
        svgEl('stop', { offset: 1, 'stop-color': '#ffd98a', 'stop-opacity': 0.12 * k }, gr);
        return { src: src, f: f, p: svgEl('path', { fill: 'url(#' + id + '-' + nom + i + ')' }, groupe),
          t: svgEl('ellipse', { cx: f[0], cy: f[1], rx: 0, ry: 0, fill: 'url(#' + id + '-tache)' }, groupe) };
      });
    }
    var cibles = FALLS.map(function (f, i) { return [f[0], f[1] + dy, f[2], FALLS_JOURS[i]]; });
    var rayons = faisceaux(cibles, P.gRayons, 'f'), rayonsFacades = faisceaux(o.facades || [], P.gFacades, 'fa');
    function faisceau(r, x) {   // x : la part du chemin parcourue par la lumière
      var a = r.src, b = [entre(a[0], r.f[0], x), entre(a[1], r.f[1], x)], ddx = b[0] - a[0], ddy = b[1] - a[1], n = Math.hypot(ddx, ddy) || 1;
      var ux = -ddy / n, uy = ddx / n, w0 = 6, w1 = r.f[2] * x;
      r.p.setAttribute('d', 'M' + f1(a[0] + ux * w0) + ',' + f1(a[1] + uy * w0) + 'L' + f1(b[0] + ux * w1) + ',' + f1(b[1] + uy * w1) +
        'L' + f1(b[0] - ux * w1) + ',' + f1(b[1] - uy * w1) + 'L' + f1(a[0] - ux * w0) + ',' + f1(a[1] - uy * w0) + 'Z');
    }
    function lumieres(liste, x, taille) {
      liste.forEach(function (r) {
        faisceau(r, x);
        r.t.setAttribute('rx', f1(r.f[2] * 1.05 * taille)); r.t.setAttribute('ry', f1(r.f[2] * 0.9 * taille));
      });
    }
    P.effets = {
      lanterne: function (sc, e) {
        // la page s'ouvre comme la précédente s'arrête : la lanterne allumée (3.11, 7.13 à 7.15)
        if (e.allumee) {
          L.poser('allumee');
          if (rayonsFacades.length) { lumieres(rayonsFacades, 1, 1); opacite(P.gFacades, 1); }
          return null;
        }
        // « Des couleurs, ils en approchent, elles viennent à sa rencontre, elles tracent les traits d'une
        // lanterne de bois aux motifs circulaires. » : des points de couleur viennent du fond, grossissent
        // et tracent les traits autour du point orange (3 s)
        if (e.tracer) return tracer();
        // « Elle s'allume. » (3.10) : lueur d'or (1,5 s) ; l'accord du père monte en même temps (effet suivant).
        // 7.12, « Le linteau s'accompagne d'une lanterne aux rayons pénétrants. » : « la lanterne s'allume (lueur
        // d'or, 1,5 s), ses rayons passent par les cercles ajourés jusque sur les façades, et l'accord du père
        // monte » ; elle naît de sa lumière, au-dessus du linteau
        if (e.allumer) {
          var deRien = L.etat === 'eteinte';
          if (deRien) { L.tracer(1); opacite(L.traits, 0); }
          L.etat = 'allumee';
          var allume = animerPage(scene, 1500, 400, function (x) {
            var v = lisse(x);
            opacite(L.bois, v); opacite(L.halo, Math.min(1, v * 1.25));
            opacite(L.traits, deRien ? 0.18 * v : 1 - 0.82 * v);
            if (deRien) opacite(L.flamme, v);
          });
          if (rayonsFacades.length) {
            allume = allume.then(function () {
              opacite(P.gFacades, calme ? 0 : 1);
              return animerPage(scene, 1300, 600, function (x) {
                if (calme) { lumieres(rayonsFacades, 1, 1); opacite(P.gFacades, x); return; }
                lumieres(rayonsFacades, lisse(borne(x / 0.7)), lisse(borne((x - 0.45) / 0.55)));
              });
            });
          }
          return { suite: Promise.resolve(), fin: allume };
        }
        // 7.15, « un bruit sourd et puissant retentit » : « la lanterne s'éteint net, sans le lent déclin de 3.11 ;
        // la porte reste debout, une seconde, sans lumière » (ses ornements, nés de sa lumière, s'éteignent avec elle)
        if (e.eteindre && e.brusque) {
          var o0 = +P.orn.getAttribute('opacity') || 0;
          L.poser('sombre');
          opacite(P.gRayons, 0); opacite(P.gFacades, 0);
          animerPage(scene, 300, 300, function (x) { opacite(P.orn, o0 * (1 - x)); });
          P.extinction = Fx.pause(scene, 1000);
          return P.extinction;
        }
        // « La lueur de la lanterne faiblit, s'éteint… » (3.11) : 2,5 s ; la lumière qu'elle jette s'en va avec
        // elle ; l'accord s'éteint au même instant (effet `son`, qui suit sans attendre)
        if (e.eteindre) {
          L.etat = 'flamme';
          var r0 = +P.gRayons.getAttribute('opacity') || 0, b0 = +L.bois.getAttribute('opacity') || 0, f0 = +P.gFacades.getAttribute('opacity') || 0;
          P.extinction = animerPage(scene, 2500, 600, function (x) {
            var v = 1 - lisse(x);
            opacite(L.bois, b0 * v); opacite(L.halo, v); opacite(L.traits, 0.18 * v); opacite(P.gRayons, r0 * v); opacite(P.gFacades, f0 * v);
          });
          return { suite: Promise.resolve(), fin: P.extinction };
        }
        return null;
      },
      // « Son rayonnement dessine les ornements d'une finesse hors de portée d'homme. » (3.10) ; « Le bois est
      // couvert de motifs à l'harmonie dépassant l'entendement. » (7.12, « comme en 3.10 ») : la lumière passe
      // par les jours de la lanterne et projette des cercles sur les octogones sculptés des panneaux hauts ; là
      // où ils tombent naissent, en or, les ornements de la porte, révélés depuis la lanterne (3,5 s)
      ornements: function (sc, e) {
        if (!P.imgOrn) return null;
        if (e.deja) {
          P.imgOrn.removeAttribute('mask');
          opacite(P.orn, 1); lumieres(rayons, 1, 1); opacite(P.gRayons, 0.3);
          apres();
          return null;
        }
        opacite(P.orn, 1);
        if (calme) {
          P.imgOrn.removeAttribute('mask');
          lumieres(rayons, 1, 1);
          return animerPage(scene, 600, 600, function (x) { opacite(P.orn, x); opacite(P.gRayons, x); })
            .then(function () { return animerPage(scene, 800, 400, function (x) { opacite(P.gRayons, 1 - 0.7 * x); }); })
            .then(apres);
        }
        var revele = svgEl('circle', { cx: cx, cy: cy, r: 0, fill: 'url(#' + id + '-revele)' }, masque);
        var cercles = cibles.map(function (f) { return svgEl('circle', { cx: f[0], cy: f[1], r: 0, fill: 'url(#' + id + '-revele)' }, masque); });
        opacite(P.gRayons, 1);
        return Fx.animer(scene, 3500, function (x) {
          var t = x * 3.5;
          lumieres(rayons, lisse(borne(t / 0.9)), lisse(borne((t - 0.6) / 0.7)));
          cercles.forEach(function (c, i) { c.setAttribute('r', f1(cibles[i][2] * 1.6 * lisse(borne((t - 0.9) / 0.6)) + 360 * lisse(borne((t - 1.3) / 2.2)))); });
          revele.setAttribute('r', f1(1650 * lent(borne((t - 1.1) / 2.4))));
        }).then(function () {
          P.imgOrn.removeAttribute('mask');
          apres();
          return animerPage(scene, 1200, 300, function (x) { opacite(P.gRayons, 1 - 0.7 * lisse(x)); });
        });
      }
    };
    // « des points de couleur (ocre, vert, bleu, or) viennent du fond, grossissent et tracent les traits » :
    // quatre plumes, une par couleur, au bout de chaque trait ; autour d'elles, des grains qui convergent
    function tracer() {
      L.poser('flamme');
      if (calme) { L.tracer(1); return animerPage(scene, 600, 600, function (x) { opacite(L.traits, x); }); }
      opacite(L.traits, 1);
      var COUL = ['#d39a52', '#6fb08a', '#78a6e0', OR], rnd = hasard(17), grains = [];
      var plumes = L.traces.map(function (p, i) {
        return { p: p, L: p.getTotalLength ? p.getTotalLength() : 0, g: svgEl('circle', { r: 6.5, fill: COUL[i], opacity: 0 }, gTraces) };
      });
      for (var i = 0; i < 22; i++) {
        var a = rnd() * Math.PI * 2, d = 380 + rnd() * 420, tr = plumes[i % 4];
        var cible = tr.L ? tr.p.getPointAtLength(rnd() * tr.L) : { x: 0, y: 0 };
        grains.push({ de: [cx + Math.cos(a) * d, Math.max(-40, cy + Math.sin(a) * d * 0.8)], vers: [cx + cible.x, cy + cible.y],
          t0: rnd() * 0.5, g: svgEl('circle', { r: 2, fill: COUL[i % 4], opacity: 0 }, gTraces) });
      }
      var debuts = [0.55, 0.75, 0.9, 0.65], fins = [2.6, 2.8, 3.0, 2.3];
      return Fx.animer(scene, 3000, function (x) {
        var t = x * 3;
        grains.forEach(function (gn) {
          var v = borne((t - gn.t0) / 1.1), e = lent(v);
          gn.g.setAttribute('cx', f1(entre(gn.de[0], gn.vers[0], e))); gn.g.setAttribute('cy', f1(entre(gn.de[1], gn.vers[1], e)));
          gn.g.setAttribute('r', f1(1.5 + 4.5 * e));
          opacite(gn.g, v <= 0 ? 0 : v < 1 ? 0.25 + 0.75 * e : Math.max(0, 1 - (t - gn.t0 - 1.1) * 4));
        });
        var parts = plumes.map(function (pl, i2) {
          var v = lisse(borne((t - debuts[i2]) / (fins[i2] - debuts[i2])));
          if (pl.L && v > 0 && v < 1) {
            var pt = pl.p.getPointAtLength(v * pl.L);
            pl.g.setAttribute('cx', f1(cx + pt.x)); pl.g.setAttribute('cy', f1(cy + pt.y));
          }
          opacite(pl.g, v > 0 && v < 1 ? 1 : 0);
          return v;
        });
        L.tracer(parts);
      }).then(function () {
        L.tracer(1);
        while (gTraces.firstChild) gTraces.removeChild(gTraces.firstChild);
        L.etat = 'traits';
      });
    }
    return P;
  }

  // L'accord du père, le son de sa seule porte (arbitrage 1 ; décision de Karl 4) : tenu tant que la page le veut
  // (l'effet `son` de la page le note : A.son). Sur une page ouverte seule (EPUB), le son ne part qu'au premier
  // geste du lecteur : l'accord est redemandé alors. Il ne survit à la page que si la suivante le reprend
  // (son `debut` : l'accord tenu ; 3.10 → 3.11 et 7.12 → 7.13, sur le web).
  function Accord(scene) {
    var A = { tenu: false };
    function geste() { try { if (A.tenu && scene.classList.contains('active')) Fx.sonner('pere', { tenu: true }); } catch (e) { signaler(e); } }
    function lacher() {
      if (scene.ecouteAccord) { doc.removeEventListener('pointerup', scene.ecouteAccord); doc.removeEventListener('keydown', scene.ecouteAccord); }
      scene.ecouteAccord = null;
    }
    lacher();   // une page rejouée : l'écoute de la lecture précédente s'en va
    scene.ecouteAccord = geste;
    doc.addEventListener('pointerup', geste);
    doc.addEventListener('keydown', geste);
    Fx.surDepart(scene, function () {
      lacher();
      var suite = sceneCourante();
      if (!(suite && suite !== scene && reprendAccord(suite))) Fx.sonner('pere', { eteindre: 1500 });
    });
    A.son = function (sc, e) {
      if ((e.effet || e.son || e.id) === 'pere') A.tenu = e.eteindre === undefined && !e.fin;
      return Effets.son(sc, e);
    };
    return A;
  }
  function reprendAccord(sc) {
    return (config(sc).debut || []).some(function (e) { return e.nom === 'son' && e.effet === 'pere' && e.tenu; });
  }

  // ---------------------------------------------------------------- vision (3.10, 3.11)
  /* « Du noir vient la couleur. » (docs/darshan-mise-en-scene/chapitre-3.md, 3.10, 3.11 et section 6 ;
     synthèse, partie 3.4). Le texte donne lui-même l'ordre de la vision, phrase après phrase : un temps par
     phrase, et chaque image dit ce que dit la sienne. 3.10 : le souffle et ses braises ; le halo d'absence
     et le silence d'un espace « dépourvu d'air » ; la vie qui palpite ; la bascule ; la nuit de Karl et sa
     seule lumière orange ; les couleurs qui tracent la lanterne ; la lanterne qui s'allume avec l'accord
     du père (il n'appartient qu'à cette porte) ; ses cercles de lumière qui révèlent en or les ornements de
     la porte d'Irun ; le bois et la pierre qui se fond dans le noir. 3.11 s'ouvre comme 3.10 s'arrête
     (lanterne allumée, ornements, accord tenu : Apple Books isole chaque page) ; la main s'arrête à un
     doigt du bois ; la lanterne faiblit, la porte se drape de noir, il ne reste que la flamme, qui file au
     carnet ; l'air revient. La porte, sa lanterne et leur lumière sont celles de PorteDuPere, que la rue de
     Rungis reprend (7.12 à 7.15). Une seule toile (les braises), jamais deux à la fois. Mouvement réduit : ni
     bascule, ni ondulation, ni particule ; des fondus. Tout s'arrête avec la page ; l'accord ne survit à la
     page que si la suivante le reprend (3.10 → 3.11, sur le web). */
  speciales.vision = function (scene, cfg) {
    var id = prefixe(scene, 'vi');
    var plans = $$('.decor .plan', scene), decor = $('.decor', scene);
    // une page rejouée repart de son premier plan
    $$('.vision-svg, .vision-braises, .vision-fond', scene).forEach(retirer);
    plans.forEach(function (p, i) { p.classList.toggle('vu', i === 0); p.style.transform = ''; });
    // sous les plans : le noir de la nuit de Karl (la porte est un calque transparent, posé sur lui)
    if (decor) decor.insertBefore(el('div', { 'class': 'vision-fond', 'aria-hidden': 'true' }), decor.firstChild);
    var s = calqueScene(scene, 'vision-svg',
      '<radialGradient id="' + id + '-absence" gradientUnits="userSpaceOnUse" cx="600" cy="720" r="1600">' +
      '<stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset=".82" stop-color="#000" stop-opacity=".82"/><stop offset="1" stop-color="#000" stop-opacity="1"/></radialGradient>' +
      '<linearGradient id="' + id + '-voile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".86" stop-color="#000"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + id + '-voile-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".86" stop-color="#000"/>' +
      '<stop offset="1" stop-color="#fff"/></linearGradient>' +
      '<mask id="' + id + '-drape" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1800"><rect width="1200" height="1800" fill="#fff"/></mask>');
    function q(sel) { return s.querySelector(sel); }
    var gradAbsence = q('#' + id + '-absence'), masqueDrape = q('#' + id + '-drape');
    var absence = svgEl('rect', { width: W, height: H, fill: 'url(#' + id + '-absence)', opacity: 0 }, s);
    var lueurVie = svgEl('rect', { width: W, height: H, fill: '#ffb36b', opacity: 0 }, s);
    var noir = svgEl('rect', { x: -50, y: -50, width: W + 100, height: H + 100, fill: '#040205', opacity: 0 }, s);
    var gBords = svgEl('g', { opacity: 0 }, s);
    var voile = svgEl('rect', { x: -50, y: -2400, width: W + 100, height: 2400, fill: 'url(#' + id + '-voile)', opacity: 0 }, s);
    // la porte, sa lanterne et sa lumière ; les bords de la pierre se fondent dans le noir quand les ornements sont là
    var P = PorteDuPere(scene, { id: id, svg: s, y0: 420, traits: fichierDecor('porte-pere-traits'), apres: function () { bords(); } });
    var L = P.L, A = null;   // l'accord : après le départ du récit (Fx lie ce qu'il suit au récit de la page)

    // ---- les bords de la pierre ondulent et se fondent dans le noir, lentement, sans fin
    var couchesBords = [0, 1, 2, 3].map(function () { return svgEl('path', { fill: '#040205', 'fill-rule': 'evenodd', opacity: 0.26 }, gBords); });
    function contour(k, t) {
      var x0 = 190, x1 = 1010, y0 = 418, y1 = 1235, d = 'M-60,-60H1260V1860H-60Z', n = 96;
      for (var i = 0; i <= n; i++) {
        var u = i / n, th = u * Math.PI * 2, p = pourtour(u, x0, y0, x1, y1);
        var o = 16 * k + 11 * Math.sin(5 * th + 0.42 * t + k) + 7 * Math.sin(11 * th - 0.61 * t + 1.7 * k) + 4 * Math.sin(17 * th + 0.9 * t);
        d += (i ? 'L' : 'M') + f1(p[0] - p[2] * o) + ',' + f1(p[1] - p[3] * o);
      }
      return d + 'Z';
    }
    var bordsEnMarche = false;
    function bords() {
      if (bordsEnMarche) return;
      bordsEnMarche = true;
      opacite(gBords, 1);
      var avant = -1;
      function dessiner(t) { couchesBords.forEach(function (c, k) { c.setAttribute('d', contour(k, t)); }); }
      dessiner(0);
      if (calme) return;
      Fx.tache(scene, function (t) {
        if (!bordsEnMarche) return false;
        if (t - avant < 0.033) return;   // trente images par seconde suffisent à cette lenteur
        avant = t;
        dessiner(t);
      });
    }

    // ---- les braises du souffle (3.10) : elles montent tant qu'on inspire, s'éteignent et s'envolent à
    // l'expiration ; une seule toile, rendue dès la fin du geste. Mouvement réduit : une lueur qui varie.
    var braises = null;
    function Braises() {
      var b = { phase: 'repos', liste: [], fin: false, lueur: 0 };
      var t = $('.texte', scene);
      b.boite = el('div', { 'class': 'vision-braises', 'aria-hidden': 'true' });
      if (t && t.parentNode === scene) scene.insertBefore(b.boite, t); else scene.appendChild(b.boite);
      b.chaud = el('div', { 'class': 'vision-braises-lueur' }, b.boite);
      if (calme) {
        Fx.tache(scene, function (tt, dt) {
          b.lueur = b.phase === 'inspire' ? Math.min(1, b.lueur + dt / 1.2) : Math.max(0, b.lueur - dt / 1.0);
          b.chaud.style.opacity = (0.75 * b.lueur).toFixed(3);
          if (b.fin && b.lueur <= 0) { retirer(b.boite); return false; }
        });
        return b;
      }
      var k = 0.5, c = el('canvas', { 'class': 'vision-braises-toile' }, b.boite), x = c.getContext('2d');
      c.width = W * k; c.height = H * k;
      // une braise : un point chaud et son halo, dessinés une fois, puis posés à chaque image
      var sprite = doc.createElement('canvas');
      sprite.width = sprite.height = 64;
      var sx = sprite.getContext('2d'), gr = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,244,214,1)'); gr.addColorStop(0.18, 'rgba(255,190,90,0.95)');
      gr.addColorStop(0.45, 'rgba(255,110,30,0.35)'); gr.addColorStop(1, 'rgba(255,80,10,0)');
      sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
      var rnd = hasard(31), attente = 0;
      Fx.surDepart(scene, function () { c.width = 1; c.height = 1; retirer(b.boite); });
      Fx.tache(scene, function (tt, dt) {
        if (b.phase === 'inspire' && !b.fin) {
          attente -= dt;
          while (attente <= 0) {
            attente += 0.032;
            if (b.liste.length < 170) b.liste.push({ x: 90 + rnd() * 1020, y: 1280 + rnd() * 420, vx: (rnd() - 0.5) * 24, vy: -(70 + rnd() * 90), r: 11 + rnd() * 18,
              vie: 1, ph: rnd() * 6.3, envol: false });
          }
        }
        b.lueur = b.phase === 'inspire' ? Math.min(1, b.lueur + dt / 1.2) : Math.max(0, b.lueur - dt / 1.0);
        b.chaud.style.opacity = (0.8 * b.lueur).toFixed(3);
        x.setTransform(1, 0, 0, 1, 0, 0);
        x.clearRect(0, 0, c.width, c.height);
        x.setTransform(k, 0, 0, k, 0, 0);
        x.globalCompositeOperation = 'lighter';
        for (var i = b.liste.length - 1; i >= 0; i--) {
          var e = b.liste[i];
          if (b.phase !== 'inspire' || b.fin) e.envol = true;
          if (e.envol) { e.vy = Math.max(-520, e.vy * (1 + 2.6 * dt) - 60 * dt); e.vie -= dt * 0.95; } else e.vie -= dt * 0.16;
          e.x += (e.vx + Math.sin(tt * 2 + e.ph) * 14) * dt; e.y += e.vy * dt;
          if (e.vie <= 0 || e.y < -40) { b.liste.splice(i, 1); continue; }
          var clin = 0.65 + 0.35 * Math.sin(tt * 9 + e.ph * 3);
          x.globalAlpha = Math.max(0, Math.min(1, e.vie * clin * Math.min(1, (1760 - e.y) / 140)));
          x.drawImage(sprite, e.x - e.r, e.y - e.r, e.r * 2, e.r * 2);
        }
        x.globalAlpha = 1;
        if (b.fin && !b.liste.length && b.lueur <= 0) { c.width = 1; c.height = 1; retirer(b.boite); return false; }
      });
      return b;
    }
    cfg.gestes.forEach(function (g) {
      if (g.meca !== 'respirer') return;
      // le souffle du lecteur : la mécanique dit, à chaque image, où il en est (inspire, expire, repos)
      g.progres = function (x, etat) {
        if (!braises) braises = Braises();
        braises.phase = (etat && etat.phase) || 'repos';
      };
    });

    // ---- les effets de la vision, dans l'ordre du texte
    scene.effetsLocaux = {
      // « Son inspiration l'emplit de braises. L'expiration extirpe tout trouble interne. » : après le
      // geste, les dernières braises s'envolent et s'éteignent
      braises: function () {
        if (!braises) return null;
        braises.fin = true;
        return Fx.pause(scene, calme ? 300 : 1100);
      },
      // « La force de son âme l'entoure d'un halo d'absence, elle l'isole de contraintes matérielles. » :
      // un halo d'ombre se referme des bords vers le centre (2,5 s) ; le fleuve se tait : plus d'air
      absence: function () {
        try { Son.ambiance('silence'); } catch (e) { signaler(e); }
        if (calme) { gradAbsence.setAttribute('r', '520'); return animerPage(scene, 600, 600, function (x) { opacite(absence, x); }); }
        opacite(absence, 1);
        return Fx.animer(scene, 2500, function (x) { gradAbsence.setAttribute('r', f1(entre(1600, 520, lisse(x)))); });
      },
      // « La vie palpite en Darshan. » : l'image bat une fois, un battement sourd, intérieur
      palpite: function () {
        Fx.sonner('battement');
        var p = plans[0];
        return animerPage(scene, 900, 700, function (x) {
          var b = Math.max(0, Math.sin(Math.PI * Math.min(1, x / 0.32))) + 0.55 * Math.max(0, Math.sin(Math.PI * borne((x - 0.36) / 0.3)));
          if (!calme && p) { p.style.transformOrigin = '50% 40%'; p.style.transform = 'scale(' + (1 + 0.03 * b).toFixed(4) + ')'; }
          if (!calme) gradAbsence.setAttribute('r', f1(520 + 46 * b));
          opacite(lueurVie, 0.12 * b);
        }).then(function () { if (p) p.style.transform = ''; opacite(lueurVie, 0); });
      },
      // « Il bascule en arrière et se voit flotter comme s'il était en lévitation. » : le regard pivote
      // vers le haut, le fleuve sort du cadre par le bas, tout flotte, puis se fond au noir (2 s)
      bascule: function () {
        var p = plans[0];
        return animerPage(scene, 3000, 600, function (x) {
          if (!calme && p) {
            var e = lisse(borne(x / 0.85)), flotte = Math.sin(x * Math.PI * 2.2);
            p.style.transformOrigin = '50% 0%';
            p.style.transform = 'translateY(' + (58 * e + 1.2 * flotte).toFixed(2) + '%) rotate(' + (0.9 * flotte).toFixed(3) + 'deg) scale(' + (1 + 0.06 * e).toFixed(4) + ')';
          }
          opacite(noir, calme ? x : lisse(borne((x - 0.33) / 0.67)));
        }).then(function () {
          // le noir : on range ce que le souffle avait posé, l'image qui a basculé, le halo
          opacite(noir, 1);
          if (p) p.style.transform = '';
          opacite(absence, 0);
          $$('.souffle-calque, .assombrir-calque', scene).forEach(retirer);
        });
      },
      // « Du noir vient la couleur. » : la nuit de Karl et sa seule lumière orange, qui naît du noir ;
      // elle sera la flamme de la lanterne
      couleur: function () {
        L.etat = 'flamme';
        return animerPage(scene, 2200, 500, function (x) { var e = lisse(x); opacite(noir, 1 - e); opacite(L.flamme, e); });
      },
      // la lanterne et les ornements : ceux de la porte du père (3.11 s'ouvre la lanterne allumée, sans le noir)
      lanterne: function (sc, e) { if (e.allumee) opacite(noir, 0); return P.effets.lanterne(sc, e); },
      ornements: P.effets.ornements,
      son: function (sc, e) { return A ? A.son(sc, e) : Effets.son(sc, e); },
      // « … et emporte avec elle la porte en se drapant de l'inconnu. » : un voile noir descend sur la porte
      // de haut en bas (2 s), les traits d'or s'éteignent les derniers ; il ne reste que la flamme
      draper: function () {
        var lagM = svgEl('rect', { x: -50, y: -2400, width: W + 100, height: 2400, fill: 'url(#' + id + '-voile-m)' }, masqueDrape);
        var fin = Promise.resolve(P.extinction).then(function () {
          if (P.imgOrn) P.imgOrn.setAttribute('mask', 'url(#' + id + '-drape)');
          opacite(voile, 1);
          if (calme) {
            // un fondu : le voile couvre la porte, les traits s'éteignent les derniers
            voile.setAttribute('y', '0'); opacite(voile, 0);
            return animerPage(scene, 900, 900, function (x) { opacite(voile, x); opacite(P.orn, 1 - lisse(borne((x - 0.3) / 0.7))); });
          }
          return Fx.animer(scene, 2700, function (x) {
            var t = x * 2.7, front = entre(-200, 2150, lisse(borne(t / 2))), retard = entre(-200, 2150, lisse(borne((t - 0.7) / 2)));
            voile.setAttribute('y', f1(front - 2400));
            lagM.setAttribute('y', f1(retard - 2400));
          });
        }).then(function () { opacite(P.orn, 0); bordsEnMarche = false; opacite(gBords, 0); });
        return { suite: Promise.resolve(), fin: fin };
      },
      // « Darshan se voit happé, reconduit à lui par une force irrépressible. » : la flamme file vers le
      // bouton Carnet (0,6 s) et s'y range, l'étoile à part (l'effet `porte`, qui suit) ; l'air revient
      happe: function () {
        Fx.sonner('aspiration');
        try { Son.ambiance('kerala', { soir: true }); } catch (e) { signaler(e); }
        var but = Fx.pointDe(scene, 'carnet'), de = [600, 300];
        return animerPage(scene, 600, 300, function (x) {
          if (calme) { opacite(L.flamme, 1 - x); return; }
          var t = lent(x), u = 1 - t, c = [820, 120];
          var px = u * u * de[0] + 2 * u * t * c[0] + t * t * but[0], py = u * u * de[1] + 2 * u * t * c[1] + t * t * but[1];
          L.flamme.setAttribute('transform', 'translate(' + f1(px - 600) + ' ' + f1(py - 300) + ') scale(' + (1 - 0.82 * t).toFixed(3) + ')');
          opacite(L.flamme, 1 - 0.4 * t);
        }).then(function () { opacite(L.flamme, 0); L.poser('eteinte'); });
      }
    };
    derouler(scene, cfg, { attente: 600 });
    // ce qui suit dépend de l'état des effets de la page, lié au récit qui vient de naître
    A = Accord(scene);
    // « dans cet environnement dépourvu d'air » : une page qui s'ouvre dans la vision (3.11) s'ouvre sans air
    if ((cfg.debut || []).some(function (e) { return e.nom === 'lanterne' && e.allumee; })) {
      try { Son.ambiance('silence'); } catch (e) { signaler(e); }
    }
    rendreImages(scene, s);
    Fx.surDepart(scene, function () { bordsEnMarche = false; });
  };

  // ---------------------------------------------------------------- rue-de-rungis (7.12 à 7.15)
  /* « Puis un choc sourd (7.15), puis rien. » (docs/darshan-mise-en-scene/chapitre-7.md, 7.12 à 7.15 ; synthèse,
     parties 3.4 et 10, décisions de Karl 2, 3 et 4). La porte du père perce le Paris de Julie : la rue au couchant
     tremble, le trottoir se fend en étoile, la porte d'Irun de 3.10 en monte devant le soleil, la lanterne s'allume
     avec l'accord (le son de sa seule porte), ses cercles de lumière touchent les façades et révèlent les ornements ;
     le monde se fige en noir et blanc, des fenêtres s'éclairent (7.12). La vue s'approche ; elle recule d'un
     demi-pas quand Darshan doute, et l'accord s'éteint ; la paume se pose et rien ne bouge (7.13). La magie meurt à
     la virgule, sans un son : l'or quitte les mots, la clé tombe en poussière, les étoiles du carnet s'éteignent,
     les boutons disparaissent (7.14). Le choc, seul signe du père : la lanterne s'éteint net, la porte tombe dans
     la fente, muette, les couleurs reviennent ; puis le livre se tait (7.15). Chaque page s'ouvre sur l'état où la
     précédente s'arrête : Apple Books isole chaque page, et cet état vient des réglages `debut` de livre.py. La
     fente, la porte, la lanterne, ses lumières et les fenêtres sont dans le décor, qui suit la vue ; la clé, la
     constellation et le cadre sont ceux de la page. Mouvement réduit : ni tremblement, ni montée, ni chute, ni zoom,
     ni poussière, ni constellation qui se déplie ; des fondus. Tout s'arrête avec la page ; l'accord ne survit à
     7.12 que si la suivante le reprend (7.13, sur le web). */
  var RUE = {
    fente: [600, 1560],      // d'où le trottoir se fend (livre.py, `perce`) : le bas de la porte s'y perd
    vue: [600, 700],         // vers où la vue s'approche (7.13) : la lanterne et la porte restent dans le cadre
    // « ses rayons passent par les cercles ajourés jusque sur les façades » (x 0 à 330 et 950 à 1200, y 1300 à
    // 1700) : [x, y, rayon, jour de la lanterne d'où part le faisceau, force du faisceau] ; les faisceaux passent
    // devant la porte : à peine visibles, la lumière se lit là où elle tombe
    facades: [[150, 1390, 62, 9, 0.3], [262, 1545, 54, 7, 0.3], [78, 1615, 48, 11, 0.3], [1048, 1430, 56, 10, 0.3],
      [1150, 1565, 50, 8, 0.3], [985, 1648, 44, 12, 0.3]],
    // « aux façades, des fenêtres s'éclairent une à une, pâles : les curieux, qu'on ne voit pas » : [x, y, l, h]
    fenetres: [[40, 1330, 40, 66], [1110, 1392, 38, 62], [188, 1352, 38, 62], [1000, 1405, 34, 58], [48, 1470, 40, 68],
      [1116, 1530, 38, 62], [196, 1488, 38, 64], [1006, 1540, 34, 58], [54, 1612, 40, 66]],
    cle: { x: 250, y: 880, l: 400 },      // 7.14 : la clé « près du texte, grande, à gauche, loin de la porte »
    carnet: { x: 420, y: 790, k: 0.75 }   // 7.14 : la constellation, « dans la bande libre sous le texte »
  };
  speciales['rue-de-rungis'] = function (scene, cfg) {
    var id = prefixe(scene, 'rr'), decor = $('.decor', scene), plans = $$('.decor .plan', scene), rue = plans[0], porte = plans[1];
    var debut = cfg.debut || [], temps = $$('.texte .temps', scene);
    var priere = Object.keys(cfg.effets || {}).some(function (j) { return cfg.effets[j].some(function (e) { return e.nom === 'desenchantement'; }); });
    // une page rejouée repart d'une image nette
    $$('.rue-svg, .rue-contre-jour, .rue-carnet, .rue-cadre, .rue-dessus', scene).forEach(retirer);
    plans.forEach(function (p, i) {
      p.classList.toggle('vu', i === 0);
      ['transform', 'filter', 'opacity', 'transition', 'clipPath', 'webkitClipPath'].forEach(function (k) { p.style[k] = ''; });
    });
    if (!decor || !rue || !porte) { derouler(scene, cfg); return; }
    decor.style.transform = ''; decor.style.transition = '';
    scene.classList.toggle('rue-priere', priere);

    // ---- « devant le soleil couchant qu'elle cache : le soleil déborde autour de la pierre, la lanterne brille
    // devant ; ce sont « des feux contraires » » : un contre-jour entre la rue et la porte, qui naît avec elle
    var contreJour = el('div', { 'class': 'rue-contre-jour', 'aria-hidden': 'true' });
    decor.insertBefore(contreJour, porte);
    // ---- les calques de la rue, par-dessus les plans (ils suivent la vue)
    var s = svgDepuis('<svg xmlns="http://www.w3.org/2000/svg" class="scene-svg rue-svg" viewBox="0 0 ' + W + ' ' + H +
      '" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="' + id + '-brume" fx=".5" fy=".78"><stop offset="0" stop-color="#07060d" stop-opacity=".8"/>' +
      '<stop offset=".5" stop-color="#07060d" stop-opacity=".42"/><stop offset="1" stop-color="#07060d" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + '-sol" clipPathUnits="userSpaceOnUse"><rect x="-300" y="-600" width="1800" height="' + (RUE.fente[1] + 600) + '"/></clipPath>' +
      '<filter id="' + id + '-flou" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '</defs></svg>');
    decor.appendChild(s);
    // le bas des battants se perd dans la fente : une brume d'encre monte d'elle
    var brume = svgEl('ellipse', { cx: 600, cy: 1478, rx: 500, ry: 200, fill: 'url(#' + id + '-brume)', opacity: 0 }, s);
    var gFente = svgEl('g', { opacity: 0 }, s), gFenetres = svgEl('g', {}, s), gPorte = svgEl('g', {}, s);
    var P = PorteDuPere(scene, { id: id, svg: s, parent: gPorte, y0: 620, chaine: -560,
      traits: fichierDecor('porte-pere-rue-traits'), facades: RUE.facades });
    var A = null, debout = false, zoom = 1;   // A : l'accord du père, après le départ du récit

    // ---- la fente : « une fente court sur le trottoir, au bas de l'image, et s'ouvre en étoile (dessinée d'après
    // Fracture, 19059625, le verre étoilé de Karl) » ; le trottoir est vu de biais : l'étoile est aplatie
    var fente = (function () {
      var rnd = hasard(23), c = RUE.fente, traits = [], bords = svgEl('g', {}, gFente), encre = svgEl('g', {}, gFente), axe = [];
      function chemin(points) { return 'M' + points.map(function (p) { return f1(p[0]) + ',' + f1(p[1]); }).join('L'); }
      function ligne(points, ep, debut, fin) {
        var d = chemin(points), o = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 };
        traits.push({ debut: debut, fin: fin, p: [
          svgEl('path', Fx.copie(o, { d: d, stroke: '#fff1d6', 'stroke-opacity': 0.42, 'stroke-width': ep + 3.4 }), bords),
          svgEl('path', Fx.copie(o, { d: d, stroke: ENCRE, 'stroke-width': ep }), encre)] });
      }
      // d'un point vers le dehors, en n segments ; `aplati` : le trottoir vu de biais ; `rappel` : la fente qui court
      // reste près de son axe
      function brisee(angle, longueur, n, aplati, rappel) {
        var pts = [[c[0], c[1]]], x = c[0], y = c[1];
        for (var i = 1; i <= n; i++) {
          var a = angle + (rnd() - 0.5) * (rappel ? 0.44 : 0.5) - (rappel ? (y - c[1]) * 0.012 * Math.cos(angle) : 0), l = longueur / n * (0.7 + rnd() * 0.6);
          x += Math.cos(a) * l; y += Math.sin(a) * l * aplati;
          pts.push([x, y]);
        }
        return pts;
      }
      var gauche = brisee(Math.PI, 520, 13, 1, true), droite = brisee(0, 520, 13, 1, true);
      ligne(gauche, 4.4, 0, 0.5); ligne(droite, 4.4, 0.04, 0.54);
      axe = gauche.slice(1).reverse().concat(droite);
      // de petites fêlures partent de la fente qui court
      axe.forEach(function (p, i) {
        if (i % 3 !== 1 || Math.abs(p[0] - c[0]) < 90) return;
        var cote = rnd() < 0.5 ? -1 : 1, aa = (p[0] < c[0] ? Math.PI : 0) + cote * (0.7 + rnd() * 0.5), l = 18 + rnd() * 30;
        var t = 0.5 * Math.abs(p[0] - c[0]) / 520;
        ligne([p, [p[0] + Math.cos(aa) * l * 0.6, p[1] + Math.sin(aa) * l * 0.35], [p[0] + Math.cos(aa) * l, p[1] + Math.sin(aa) * l * 0.5]], 1.8, t, t + 0.12);
      });
      for (var k = 0; k < 9; k++) {
        var a = -Math.PI + (k + 0.5) * (2 * Math.PI / 9) + (rnd() - 0.5) * 0.3;
        ligne(brisee(a, 90 + rnd() * 170, 4 + Math.floor(rnd() * 3), 0.42, false), 3, 0.4 + rnd() * 0.15, 0.85);
      }
      [70, 145].forEach(function (r, j) {   // deux anneaux brisés, comme dans le verre
        for (var m = 0; m < 7; m++) {
          if (rnd() < 0.3) continue;
          var a0 = m * 2 * Math.PI / 7 + rnd() * 0.3, a1 = a0 + 0.5 + rnd() * 0.3, pts = [];
          for (var u = 0; u <= 4; u++) { var aa = entre(a0, a1, u / 4); pts.push([c[0] + Math.cos(aa) * r * (1 + (rnd() - 0.5) * 0.1), c[1] + Math.sin(aa) * r * 0.42]); }
          ligne(pts, 1.6, 0.6 + j * 0.1, 0.95);
        }
      });
      // l'ouverture, où la porte s'enfonce : une lèvre d'encre le long de la fente, plus large au milieu
      var levre = svgEl('path', { fill: ENCRE }, gFente);
      function ouvrir(v) {
        if (v <= 0) { levre.setAttribute('d', ''); return; }
        var haut = [], bas = [];
        axe.forEach(function (p) {
          var w = 9 * v * Math.pow(borne(1 - Math.abs(p[0] - c[0]) / 540), 0.8);
          haut.push([p[0], p[1] - w]); bas.unshift([p[0], p[1] + w]);
        });
        levre.setAttribute('d', chemin(haut.concat(bas)) + 'Z');
      }
      return {
        // x de 0 à 1 : la fente court (0 à 0,55), l'étoile s'ouvre (0,4 à 0,95), la lèvre s'écarte (0,75 à 1)
        poser: function (x) {
          traits.forEach(function (t) {
            var v = (1 - lisse(borne((x - t.debut) / (t.fin - t.debut)))).toFixed(4);
            t.p.forEach(function (p) { p.setAttribute('stroke-dashoffset', v); });
          });
          ouvrir(lisse(borne((x - 0.75) / 0.25)));
        }
      };
    })();

    // ---- les fenêtres des curieux : une lueur pâle, la vitre, ses croisillons
    var fenetres = RUE.fenetres.map(function (f) {
      var g = svgEl('g', { opacity: 0 }, gFenetres);
      svgEl('rect', { x: f[0] - 12, y: f[1] - 12, width: f[2] + 24, height: f[3] + 24, rx: 10, fill: '#e8eefc', opacity: 0.4, filter: 'url(#' + id + '-flou)' }, g);
      svgEl('rect', { x: f[0], y: f[1], width: f[2], height: f[3], rx: 2, fill: '#f3f5fb', opacity: 0.78 }, g);
      svgEl('path', { d: 'M' + f1(f[0] + f[2] / 2) + ',' + f[1] + 'v' + f[3] + 'M' + f[0] + ',' + f1(f[1] + f[3] * 0.42) + 'h' + f[2],
        stroke: '#6c717d', 'stroke-width': 2.4, opacity: 0.55 }, g);
      return g;
    });

    // ---- la vue : le décor entier (la rue, la porte, la lanterne, leurs lumières) ; le cadre de la page
    var texte = $('.texte', scene), cadre = el('div', { 'class': 'rue-cadre', 'aria-hidden': 'true' });
    scene.insertBefore(cadre, texte && texte.parentNode === scene ? texte : null);
    function cadrer(z, d, courbe) {
      zoom = z;
      decor.style.transformOrigin = Fx.pc(RUE.vue[0], W) + ' ' + Fx.pc(RUE.vue[1], H);
      decor.style.transition = d ? 'transform ' + d + 'ms ' + (courbe || 'cubic-bezier(.4,.1,.3,1)') : 'none';
      decor.style.transform = z === 1 ? '' : 'scale(' + z + ')';
    }
    function secousse(dy) {   // l'image tressaille ; la vue garde son zoom
      decor.style.transition = 'none';
      decor.style.transform = (dy ? 'translate(0,' + Fx.pc(dy, H) + ') ' : '') + (zoom === 1 ? '' : 'scale(' + zoom + ')');
    }

    // ---- la porte debout, sa fente, sa brume et son contre-jour : d'office quand la page s'ouvre la lanterne
    // allumée (7.13 à 7.15 ouvertes comme 7.12 s'arrête)
    function porteDebout() {
      debout = true;
      fente.poser(1); opacite(gFente, 1); opacite(brume, 1); contreJour.style.opacity = '1';
      porte.style.transition = 'none'; porte.classList.add('vu');
      // tant que l'image de la porte n'est pas prête, rien d'elle ne paraît : ni l'or sans le bois, ni la lanterne
      // sans la porte (une page ouverte seule, ou le web quand la page arrive)
      s.style.visibility = contreJour.style.visibility = 'hidden';
      var voir = function () { s.style.visibility = contreJour.style.visibility = ''; };
      if (porte.complete && porte.naturalWidth) voir();
      else if (porte.decode) porte.decode().then(voir, voir);
      else { porte.addEventListener('load', voir); porte.addEventListener('error', voir); }
    }
    if (debut.some(function (e) { return e.nom === 'lanterne' && e.allumee; })) porteDebout();
    // « de la fente monte la porte, le linteau en tête (2,5 s), jusqu'à sa place, devant le soleil » ; ce qui
    // est encore sous le trottoir ne se voit pas. Mouvement réduit : « la porte paraît en fondu »
    function monter() {
      debout = true;
      porte.style.transition = 'none';
      if (calme) {
        porte.style.opacity = '0'; porte.classList.add('vu');
        return animerPage(scene, 1200, 1200, function (x) { porte.style.opacity = x.toFixed(3); opacite(brume, x); contreJour.style.opacity = x.toFixed(3); })
          .then(function () { porte.style.opacity = ''; });
      }
      porte.classList.add('vu');
      return Fx.animer(scene, 2500, function (x) {
        var d = 940 * Math.pow(1 - x, 2.2);   // la montée ralentit en arrivant
        porte.style.transform = 'translateY(' + Fx.pc(d, H) + ')';
        porte.style.clipPath = porte.style.webkitClipPath = 'inset(0 0 ' + ((H - (RUE.fente[1] - d)) / H * 100).toFixed(3) + '% 0)';
        opacite(brume, Math.min(1, x * 1.6)); contreJour.style.opacity = lisse(x).toFixed(3);
      }).then(function () { porte.style.transform = ''; porte.style.clipPath = porte.style.webkitClipPath = ''; });
    }
    // 7.15 : la fente « se referme sans marque » : ses traits rentrent vers le point d'où elle était partie
    function refermer() {
      if (calme) return animerPage(scene, 600, 600, function (x) { opacite(gFente, 1 - x); });
      return Fx.animer(scene, 600, function (x) { fente.poser(1 - x); }).then(function () { opacite(gFente, 0); });
    }
    // « le monde se fige : la photo perd ses couleurs en 2 s, sauf la porte et sa lanterne ; aux façades, des
    // fenêtres s'éclairent une à une, pâles » (le gel ne touche que la photo de la rue et son soleil)
    function figer(anime) {
      [rue, contreJour].forEach(function (n) { n.style.transition = anime ? 'filter 2000ms ease' : 'none'; n.style.filter = 'grayscale(1)'; });
      fenetres.forEach(function (f, i) {
        if (!anime) { opacite(f, 1); return; }
        Fx.minuterie(scene, function () { animerPage(scene, 800, 800, function (x) { opacite(f, x); }); }, 700 + i * 260);
      });
    }

    // ---- les effets de la rue, dans l'ordre du texte
    scene.effetsLocaux = {
      // 7.12, « Ils sourient, mais les dalles du trottoir de la rue de Rungis vibrent sous leurs pieds. » : « la photo
      // tremble (quelques unités, 1,2 s) ; sur les téléphones qui le permettent, une vibration brève (80, 40, 80 ms),
      // jamais en mouvement réduit » ; sous la vibration, un grondement sourd. 7.15, « un bruit sourd et puissant
      // retentit » : une seule vibration longue, et « l'image tressaille une fois » (le choc est l'effet qui précède)
      vibre: function (sc, e) {
        if (e.haptique) Fx.vibrer(e.haptique);
        if (debout) {
          if (calme) return null;
          var jolt = animerPage(scene, 380, 0, function (x) { secousse(11 * Math.sin(Math.PI * Math.min(1, x * 2.2)) * (1 - x)); })
            .then(function () { secousse(0); });
          return { suite: Promise.resolve(), fin: jolt };
        }
        Fx.sonner('grondement');
        if (calme) return null;
        var r = hasard(5);
        return animerPage(scene, 1200, 0, function (x) {
          var a = 5 * (1 - x);
          rue.style.transform = 'translate(' + Fx.pc((r() - 0.5) * 2 * a, W) + ',' + Fx.pc((r() - 0.5) * 2 * a, H) + ') scale(1.012)';
        }).then(function () { rue.style.transform = ''; });
      },
      // « Elles se fendent et laissent apparaître le linteau » : la pierre qui se fend ; la fente court, s'ouvre en
      // étoile (1,2 s), puis la porte monte (2,5 s)
      perce: function () {
        Fx.sonner('pierre');
        opacite(gFente, 1);
        var trace = calme ? animerPage(scene, 500, 500, function (x) { fente.poser(1); opacite(gFente, x); })
          : Fx.animer(scene, 1200, function (x) { fente.poser(x); });
        return trace.then(monter);
      },
      lanterne: P.effets.lanterne,
      ornements: P.effets.ornements,
      son: function (sc, e) { return A ? A.son(sc, e) : Effets.son(sc, e); },
      // « Les passants s'arrêtent et observent, la circulation est à l'arrêt, les fenêtres débordent de curieux. » :
      // le monde se fige ; « au dernier, la ville se coupe (1,5 s) : il ne reste que l'accord »
      gel: function (sc, e) {
        figer(!e.deja);
        if (e.deja) return null;
        try { Son.ambiance('silence'); } catch (x) { signaler(x); }
        return Fx.pause(scene, 2400);
      },
      // 7.13 : « la vue s'en approche très lentement dès l'ouverture (jusqu'à un zoom de 1,08), recule d'un demi-pas sur
      // la réplique (1,5 s), puis repart vers le bois au geste (1,12) » ; 7.15 : « la vue revient au plan large ».
      // Mouvement réduit : ni zoom ni recul, « un léger fondu du cadre au lieu du recul », levé au geste
      camera: function (sc, e) {
        // (l'effet suivant part avec elle : en 7.13, l'accord s'éteint pendant que la vue recule)
        if (calme) {
          if (e.recule) { cadre.classList.add('vu'); return { suite: Promise.resolve(), fin: Fx.pause(scene, 1500) }; }
          if (e.avance && !e.deja) cadre.classList.remove('vu');
          return null;
        }
        var d = e.deja ? 0 : (e.duree || 1500);
        cadrer(e.zoom || 1, d, d > 4000 ? 'cubic-bezier(.3,.15,.35,1)' : null);
        // l'approche lente est un fond : la lecture ne l'attend pas
        return d > 4000 || !d ? null : { suite: Promise.resolve(), fin: Fx.pause(scene, d) };
      },
      desenchantement: function (sc, e) { return desenchanter(e); },
      // 7.15, « Il s'ensuit la chute de l'édifice de tous les enjeux qui ne laisse sur ce monde aucune trace, pas même
      // sa marque sur le trottoir » : « la porte tombe d'un bloc dans la fente (0,4 s), sans un son ; puis la fente se
      // referme sans marque ». Mouvement réduit : « la porte disparaît en fondu »
      chute: function () {
        var tombe;
        porte.style.transition = 'none';
        if (calme) {
          tombe = animerPage(scene, 600, 600, function (x) {
            var v = (1 - x).toFixed(3);
            porte.style.opacity = v; opacite(P.g, 1 - x); opacite(brume, 1 - x); contreJour.style.opacity = v;
          });
        } else {
          gPorte.setAttribute('clip-path', 'url(#' + id + '-sol)');
          tombe = Fx.animer(scene, 400, function (x) {
            var d = 1000 * lent(x);   // d'un bloc : la chute accélère
            porte.style.transform = 'translateY(' + Fx.pc(d, H) + ')';
            porte.style.clipPath = porte.style.webkitClipPath = 'inset(0 0 ' + Math.min(100, (H - (RUE.fente[1] - d)) / H * 100).toFixed(3) + '% 0)';
            P.g.setAttribute('transform', 'translate(0 ' + f1(d) + ')');
            opacite(brume, 1 - x); contreJour.style.opacity = (1 - x).toFixed(3);
          });
        }
        return tombe.then(function () {
          debout = false;
          porte.classList.remove('vu');
          ['transform', 'opacity', 'clipPath', 'webkitClipPath', 'transition'].forEach(function (k) { porte.style[k] = ''; });
          opacite(P.g, 0); opacite(brume, 0); contreJour.style.opacity = '0';
          return refermer();
        });
      },
      // « les couleurs reviennent à la photo (2 s) » : la rue au couchant, sans une trace d'encre ; il n'y en aura
      // plus dans aucune image du livre. Les fenêtres des curieux s'éteignent : les passants reprennent leur course
      degel: function () {
        [rue, contreJour].forEach(function (n) { n.style.transition = 'filter 2000ms ease'; n.style.filter = 'grayscale(0)'; });
        var o0 = fenetres.map(function (f) { return +f.getAttribute('opacity') || 0; });
        return animerPage(scene, 2000, 2000, function (x) { fenetres.forEach(function (f, i) { opacite(f, o0[i] * (1 - x)); }); })
          .then(function () { [rue, contreJour].forEach(function (n) { n.style.filter = ''; n.style.transition = ''; }); });
      }
    };

    // ---- 7.14, le désenchantement : « Le désenchantement (9 s, sans un son), en quatre mouvements, à l'échelle de la
    // page. La barre, estompée depuis 7.12, revient d'abord à pleine lumière. » Rien ne sonne, rien ne se touche
    // (sauf « Menu ») ; à la fin, et à la fin seulement, une annonce pour les seuls lecteurs d'écran (décision 3).
    var dessus = null, carnetSvg = null;
    function desenchanter(e) {
      var barre = $('.barre', scene);
      dessus = el('div', { 'class': 'rue-dessus', 'aria-hidden': 'true' }, scene);
      carnetSvg = calqueScene(scene, 'rue-carnet', '');
      if (barre) barre.style.transition = 'opacity 1.2s ease';
      html.classList.remove('voile-page');
      // « En faisant de moi un mortel, », seul : « les deux premiers temps pâlissent presque jusqu'à s'effacer (ils
      // restent dans la page pour la lecture et les lecteurs d'écran) »
      temps.slice(0, 2).forEach(function (t) { t.classList.add('rue-efface'); });
      // 1. « L'or quitte les mots (1,5 s) : « En faisant de moi un mortel, » passe de l'or au clair, la couleur des
      // répliques de Julie et de Jivan, les mortels ; les deux premiers temps aussi. »
      html.classList.add('repliques-claires');
      return Fx.pause(scene, 1500).then(cleEnPoussiere).then(etoilesEteintes).then(boutonsDisparus).then(function () {
        if (barre) barre.style.transition = '';
        annoncer((e.annonce || ['cle_poussiere', 'carnet_eteint']).map(function (k) { return ui(k); }).join(' '));
      });
    }
    // Un bouton de la barre s'efface (il se cache ensuite ; l'état de la page le garde caché).
    function effacer(b) {
      if (!b || b.hidden) return;
      b.style.transition = 'opacity 600ms ease'; b.style.opacity = '0';
      Fx.minuterie(scene, function () { b.hidden = true; b.style.opacity = ''; b.style.transition = ''; }, 650, true);
    }
    // 2. « La clé tombe en poussière (3 s) : elle sort du bouton « Objets », vient près du texte, grande, à gauche, loin
    // de la porte (0,8 s) ; puis elle se défait en poussière d'or qui descend lentement en diagonale, comme la
    // poussière du poème d'ouverture, et s'éteint en bas de la page sans remonter ; le bouton s'efface. »
    // Mouvement réduit : elle paraît à sa place, puis s'efface.
    function poserCle(boite, p, k) {
      var C = RUE.cle, h = C.l * 220 / 490;
      Fx.poser(boite, p[0] - C.l / 2, p[1] - h / 2, C.l, h);
      boite.style.transform = 'scale(' + k.toFixed(3) + ')';
    }
    function cleEnPoussiere() {
      var C = RUE.cle, de = Fx.pointDe(scene, 'objets'), boite = el('div', { 'class': 'rue-cle' }, dessus), d = dessin('cle');
      if (d) boite.appendChild(d);
      effacer(Fx.bouton(scene, 'objets'));
      var vue;
      if (calme) {
        poserCle(boite, [C.x, C.y], 1);
        boite.style.opacity = '0';
        vue = animerPage(scene, 600, 600, function (x) { boite.style.opacity = x.toFixed(3); })
          .then(function () { return Fx.pause(scene, 700); })
          .then(function () { return animerPage(scene, 1200, 1200, function (x) { boite.style.opacity = (1 - x).toFixed(3); }); })
          .then(function () { return Fx.pause(scene, 500); });
      } else {
        var c = [(de[0] + C.x) / 2 + 140, Math.min(de[1], C.y) - 30];
        poserCle(boite, de, 0.14);
        vue = animerPage(scene, 800, 0, function (x) {
          var t = lisse(x), u = 1 - t;
          poserCle(boite, [u * u * de[0] + 2 * u * t * c[0] + t * t * C.x, u * u * de[1] + 2 * u * t * c[1] + t * t * C.y], 0.14 + 0.86 * t);
        }).then(function () { poserCle(boite, [C.x, C.y], 1); return poussiere(boite); });
      }
      return vue.then(function () { retirer(boite); });
    }
    // La poussière : la clé posée, le front va du panneton à l'anneau (1,5 s), chaque grain part quand il l'atteint, descend en
    // diagonale et pâlit jusqu'au bas de la page. Une seule toile, rendue quand le dernier grain s'éteint.
    function poussiere(boite) {
      var C = RUE.cle, k = C.l / 490, rnd = hasard(41), grains = [], q = 0.5;
      var c = el('canvas', {}, dessus), x = c.getContext('2d');
      c.width = W * q; c.height = H * q;
      Fx.surDepart(scene, function () { c.width = 1; c.height = 1; retirer(c); });
      function point() {   // un point du dessin de la clé (viewBox -230 -110 490 220) : l'anneau, la tige, le panneton
        var u = rnd(), a, r;
        if (u < 0.4) { a = rnd() * 6.2832; r = 44 + rnd() * 28; return [-150 + Math.cos(a) * r, Math.sin(a) * r]; }
        if (u < 0.85) return [-96 + rnd() * 330, -12 + rnd() * 24];
        return [170 + rnd() * 66, 10 + rnd() * 50];
      }
      for (var i = 0; i < 340; i++) {
        var p = point();
        grains.push({ x: C.x + (p[0] - 15) * k, y: C.y + p[1] * k, t0: 0.4 + 1.4 * borne((236 - p[0]) / 466) + rnd() * 0.08,
          v: 110 + rnd() * 90, r: 1.2 + rnd() * 2.1, a: 0.6 + rnd() * 0.4, ph: rnd() * 6.3, vie: 2.6 + rnd() * 1.6 });
      }
      Fx.tache(scene, function (t) {
        var f = borne((t - 0.4) / 1.5) * 114 - 14;   // posée un instant (0,3 s), la clé se défait derrière le front
        var m = 'linear-gradient(to left, rgba(0,0,0,0) ' + f.toFixed(1) + '%, #000 ' + (f + 12).toFixed(1) + '%)';
        boite.style.webkitMaskImage = m; boite.style.maskImage = m;
        x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.setTransform(q, 0, 0, q, 0, 0);
        x.fillStyle = '#f7d88f';
        var vivants = 0;
        grains.forEach(function (g) {
          var age = t - g.t0;
          if (age < 0) { vivants++; return; }
          if (age > g.vie) return;
          vivants++;
          var chute = g.v * age + 22 * age * age, y = g.y + chute, gx = g.x + 0.36 * chute + 6 * Math.sin(age * 2.1 + g.ph);
          var al = g.a * Math.min(1, age / 0.18) * borne((g.vie - age) / (g.vie * 0.45)) * borne((1780 - y) / 260) * (0.75 + 0.25 * Math.sin(t * 7 + g.ph));
          if (al <= 0.01) return;
          x.globalAlpha = al;
          x.beginPath(); x.arc(gx, y, g.r, 0, 6.2832); x.fill();
        });
        x.globalAlpha = 1;
        if (!vivants && t > 2) { c.width = 1; c.height = 1; retirer(c); return false; }
      });
      return Fx.pause(scene, 2200);
    }
    // 3. « Les étoiles s'éteignent (3,5 s) : le carnet déplie sa constellation dans l'image, sans panneau, en
    // transparence, dans la bande libre sous le texte (0,8 s) ; ses étoiles s'éteignent une à une, de la dernière
    // porte à la première (la pharmacie d'abord, le pigeonnier en dernier) ; l'aiguille de la boussole s'éteint ;
    // l'anneau du père s'éteint le dernier, sans bouger ; la constellation s'efface, et le bouton « Carnet » avec
    // elle. » Mouvement réduit : elle paraît en fondu, et ses étoiles pâlissent.
    function etoilesEteintes() {
      var K = RUE.carnet, C = constellation(), de = Fx.pointDe(scene, 'carnet'), centre = [K.x + 500 * K.k, K.y + 280 * K.k];
      function placer(p, k) { C.g.setAttribute('transform', 'translate(' + f1(p[0]) + ' ' + f1(p[1]) + ') scale(' + k.toFixed(4) + ') translate(-500 -280)'); }
      placer(centre, K.k);
      var depli = calme ? animerPage(scene, 700, 700, function (x) { opacite(C.g, 0.92 * x); })
        : animerPage(scene, 700, 0, function (x) {
          var t = lisse(x);
          placer([entre(de[0], centre[0], t), entre(de[1], centre[1], t)], K.k * entre(0.06, 1, t));
          opacite(C.g, 0.92 * Math.min(1, x * 2));
        });
      return depli.then(function () {
        placer(centre, K.k);
        return enchainer(C.extinctions);
      }).then(function () {
        effacer(Fx.bouton(scene, 'carnet'));
        return animerPage(scene, 350, 350, function (x) { opacite(C.g, 0.92 * (1 - x)); });
      }).then(function () {
        retirer(C.g);
        Carnet.initialiser(Carnet.portes(), false, {
          pere: scene.getAttribute('data-pere') ? 'eteinte' : null,
          boussole: scene.getAttribute('data-boussole') ? 'eteinte' : null
        });
      });
    }
    // La constellation du carnet, dépliée dans la page : ses lieux et ses trajets (la projection du carnet,
    // interface.js), une étoile par porte franchie sur son trajet (autour du lieu quand la porte y ramène),
    // l'aiguille de la boussole, l'anneau du père. C.extinctions : de la dernière porte à la première (un lieu
    // s'éteint avec sa dernière porte), puis l'aiguille, puis l'anneau.
    function constellation() {
      var carte = DONNEES.carte || {}, lieux = carte.lieux || {}, ids = Object.keys(lieux), toutes = carte.portes || {};
      var lon = ids.map(function (k) { return lieux[k].lon; }), lat = ids.map(function (k) { return lieux[k].lat; });
      var x0 = Math.min.apply(null, lon), x1 = Math.max.apply(null, lon), y0 = Math.min.apply(null, lat), y1 = Math.max.apply(null, lat);
      function ou(lieu) {
        var p = lieux[lieu];
        return p ? [60 + (p.lon - x0) / Math.max(1, x1 - x0) * 880, 500 - (p.lat - y0) / Math.max(1, y1 - y0) * 440] : [500, 280];
      }
      var C = { g: svgEl('g', { opacity: 0 }, carnetSvg), extinctions: [] };
      // « en transparence » : un pan du ciel du carnet, posé sur l'image, pour que ses étoiles s'y lisent
      var ciel = svgEl('radialGradient', { id: prefixe(scene, 'rr') + '-ciel' }, svgEl('defs', {}, C.g));
      [[0, 0.8], [0.6, 0.55], [1, 0]].forEach(function (v) { svgEl('stop', { offset: v[0], 'stop-color': '#050816', 'stop-opacity': v[1] }, ciel); });
      svgEl('ellipse', { cx: 500, cy: 280, rx: 640, ry: 390, fill: 'url(#' + ciel.getAttribute('id') + ')' }, C.g);
      var gLignes = svgEl('g', {}, C.g), gEtoiles = svgEl('g', {}, C.g);
      var portes = Carnet.portes().filter(function (pid) { return toutes[pid] && toutes[pid].de && toutes[pid].vers; });
      var trajets = {}, restent = {}, lignes = {}, etoilesLieux = {}, etoilesPortes = {};
      function trajet(p) { return [p.de, p.vers].sort().join('|'); }
      function lieuxDe(p) { return p.de === p.vers ? [p.de] : [p.de, p.vers]; }
      portes.forEach(function (pid) {
        var p = toutes[pid];
        (trajets[trajet(p)] = trajets[trajet(p)] || []).push(pid);
        lieuxDe(p).forEach(function (l) { restent[l] = (restent[l] || 0) + 1; });
      });
      Object.keys(trajets).forEach(function (cle) {
        var l = cle.split('|'), a = ou(l[0]), b = ou(l[1]), liste = trajets[cle];
        if (l[0] !== l[1]) lignes[cle] = svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: OR, 'stroke-width': 4, 'stroke-dasharray': '5 13', opacity: 0.6 }, gLignes);
        liste.forEach(function (pid, i) {
          var pos;
          if (l[0] === l[1]) { var ang = 0.3 + i * 0.85; pos = [a[0] + Math.cos(ang) * 105, a[1] + Math.sin(ang) * 105]; }
          else {
            var t = (i + 1) / (liste.length + 1), n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, cote = i % 2 ? -22 : 22;
            pos = [entre(a[0], b[0], t) - (b[1] - a[1]) / n * cote, entre(a[1], b[1], t) + (b[0] - a[0]) / n * cote];
          }
          etoilesPortes[pid] = etoileSvg(gEtoiles, pos[0], pos[1], 17);
        });
      });
      Object.keys(restent).forEach(function (l) { var q = ou(l); etoilesLieux[l] = etoileSvg(gEtoiles, q[0], q[1], 28); });
      function eteindre(g, ms) {   // une étoile pâlit et perd son halo, sans bouger
        var halo = g.firstChild;
        return animerPage(scene, ms, ms, function (x) { opacite(halo, 0.22 * (1 - x)); opacite(g, 1 - 0.75 * x); });
      }
      portes.slice().reverse().forEach(function (pid) {
        C.extinctions.push(function () {
          var p = toutes[pid], cle = trajet(p), l = trajets[cle], fins = [eteindre(etoilesPortes[pid], 240)];
          l.splice(l.indexOf(pid), 1);
          if (!l.length && lignes[cle]) fins.push(animerPage(scene, 240, 240, function (x) { opacite(lignes[cle], 0.6 - 0.5 * x); }));
          lieuxDe(p).forEach(function (lieu) { if (--restent[lieu] === 0) fins.push(eteindre(etoilesLieux[lieu], 240)); });
          return Promise.all(fins).then(function () { return Fx.pause(scene, 50); });
        });
      });
      var boussole = scene.getAttribute('data-boussole'), pere = scene.getAttribute('data-pere');
      if (boussole) {
        var aig = svgEl('g', { transform: 'translate(70 490) rotate(' + (boussole === 'perdue' ? 62 : -38) + ') scale(1.45)' }, C.g);
        var vive = svgEl('g', {}, aig), grise = svgEl('g', { opacity: 0 }, aig);
        [[vive, OR, SINDOOR], [grise, '#555a6e', '#6d7182']].forEach(function (v) {
          svgEl('circle', { r: 48, fill: 'none', stroke: v[1], 'stroke-width': 3.8, opacity: 0.7 }, v[0]);
          svgEl('path', { d: 'M0,-41L7.7,0L0,41L-7.7,0Z', fill: v[1] }, v[0]);
          svgEl('path', { d: 'M0,-41L7.7,0L-7.7,0Z', fill: v[2], opacity: boussole === 'perdue' ? 0.45 : 1 }, v[0]);
        });
        C.extinctions.push(function () { return animerPage(scene, 300, 300, function (x) { opacite(vive, 1 - x); opacite(grise, x); }); });
      }
      if (pere) {
        var anneau = svgEl('g', { transform: 'translate(930 70) scale(1.45)' }, C.g), o0 = pere === 'vue' ? 0.8 : 1;
        var feu = pere === 'allumee' ? svgEl('path', { d: etoile(26), fill: '#fff8ea' }, anneau) : null;
        var cercle = svgEl('circle', { r: 30, fill: 'none', stroke: OR, 'stroke-width': 3, opacity: o0 }, anneau);
        var gris = svgEl('circle', { r: 30, fill: 'none', stroke: '#555a6e', 'stroke-width': 3, opacity: 0 }, anneau);
        C.extinctions.push(function () {
          return Fx.pause(scene, 150).then(function () {
            return animerPage(scene, 450, 450, function (x) { if (feu) opacite(feu, 1 - x); opacite(cercle, o0 * (1 - x)); opacite(gris, x); });
          });
        });
      }
      return C;
    }
    // 4. « Les boutons disparaissent (1 s) : ✦ devient un coin de page, un coin de papier corné en bas à droite, qu'on
    // touche pour lire la suite (il garde ses noms pour les lecteurs d'écran […]) ; il n'y aura plus de halo ni de
    // « Faire le geste ». Seul « Menu » reste » : l'état des pages suivantes (build.py : sans-magie). Les objets
    // restent dans les poches : c'est le livre qui ne les montre plus ; la clé, elle, est poussière, et le regard
    // meurt avec elle.
    function boutonsDisparus() {
      var etoileSuite = scene.recit && scene.recit.bouton;
      if (etoileSuite) etoileSuite.classList.add('pret');
      return Fx.pause(scene, 250).then(function () {
        scene.classList.add('sans-magie');
        html.classList.add('sans-magie-page');
        Objets.vider(['cle', 'lunettes', 'binocles']);
        Objets.offrirRegard(false);
        Objets.majBoutons(false);
        return Fx.pause(scene, 900);
      });
    }

    derouler(scene, cfg, {
      garder: priere,
      surTemps: function (j) {
        // « Quand tout est fini, la prière entière est là, en clair, les deux premiers temps revenus »
        if (priere && j === temps.length - 1) temps.forEach(function (t) { t.classList.remove('rue-efface', 'passe'); });
      },
      // d'une page de la rue à la suivante, l'image ne change pas : rien ne la couvre (sur le web) ; de 7.15 à 7.16,
      // « fondu du bleu de la lune au crème du papier »
      fin: function () {
        var suite = scenes[scenes.indexOf(scene) + 1];
        sortir(scene, { couleur: suite && suite.getAttribute('data-special') === 'rue-de-rungis' ? 'none' : '#f4ecdc' });
      }
    });
    // ce qui suit dépend de l'état des effets de la page, lié au récit qui vient de naître
    A = Accord(scene);
    rendreImages(scene, s);
  };

  // ---------------------------------------------------------------- listes (6.2)
  /* Les deux listes (docs/darshan-mise-en-scene/chapitre-6.md, 6.2 et section 6). « Écran partagé, en deux
     moitiés verticales. La ligne qui les sépare n'est pas un trait neutre : c'est l'arête de pierre d'un
     coin de rue, un peu irrégulière. À gauche Darshan, au pied de la bâtisse ; à droite Julie, dans sa
     rue. » La façade à l'encre est le premier plan de la page ; la photo de 6.1 glisse dans la moitié
     droite à l'ouverture. Les deux listes (mécanique `liste`) se posent chacune dans sa moitié
     (scene.listes = { darshan, julie }) ; la fin de chaque phrase paraît sous sa liste quand elle est
     cochée, et le panneau garde le récit (la phrase entière y reste, pour les lecteurs d'écran) ; sans
     script, le texte est à sa place, dans l'ordre du livre. Au dernier temps, `coin-de-rue`. En grand
     texte, les listes s'empilent, Darshan au-dessus, et l'arête devient horizontale. Mouvement réduit :
     des fondus. */
  var PARTAGE_GRAND = 670;   // en grand texte, l'arête horizontale, entre les deux listes empilées
  speciales.listes = function (scene, cfg) {
    var plans = $$('.decor .plan', scene), decors = cfg.decors || [], temps = $$('.texte .temps', scene), t = $('.texte', scene);
    $$('.listes-partage, .listes-cote', scene).forEach(retirer);
    plans.forEach(function (p, i) { p.classList.toggle('vu', i === 0); });
    function avantTexte(e) { if (t && t.parentNode === scene) scene.insertBefore(e, t); else scene.appendChild(e); return e; }
    var racine = avantTexte(el('div', { 'class': 'listes-partage', 'aria-hidden': 'true' }));
    // à droite, Julie dans sa rue (la photo de 6.1, centrée sur elle) ; à gauche, la façade à l'encre du décor
    var droite = el('div', { 'class': 'listes-droite' }, racine);
    var julie = Fx.image(Fx.sourceImage(scene, decors[1] || 'rencontre'), {}, droite);
    var aretes = [areteDePierre(racine, true), areteDePierre(racine, false)];
    var photo = Fx.image(Fx.sourceImage(scene, decors[2] || 'haussmann'), { 'class': 'listes-photo' }, racine);
    scene.listes = {
      darshan: avantTexte(el('div', { 'class': 'liste-geste darshan listes-cote', 'aria-hidden': 'true' })),
      julie: avantTexte(el('div', { 'class': 'liste-geste julie listes-cote', 'aria-hidden': 'true' }))
    };
    // la photo de 6.1 glisse dans sa moitié (x : 0 plein cadre, 1 la moitié de Julie)
    function partager(x) {
      var e = lisse(x), grand = html.classList.contains('grand');
      var clip = grand ? 'inset(' + (PARTAGE_GRAND / H * 100 * e).toFixed(2) + '% 0 0 0)' : 'inset(0 0 0 ' + (50 * e).toFixed(2) + '%)';
      droite.style.webkitClipPath = clip; droite.style.clipPath = clip;
      julie.style.transform = grand ? 'translateY(' + (18 * e).toFixed(2) + '%)' : 'translateX(' + (30 * e).toFixed(2) + '%)';
    }
    function partage() { droite.style.webkitClipPath = ''; droite.style.clipPath = ''; julie.style.transform = ''; }  // la feuille de style
    if (calme) racine.style.opacity = '0';
    else { partager(0); aretes.forEach(function (a) { opacite(a, 0); }); }

    // les temps des deux listes : leur fin paraît sous la liste cochée, avec les mots du livre ; le
    // panneau garde le récit qui les précède
    var fins = {};
    cfg.gestes.forEach(function (g) {
      if (g.meca !== 'liste' || !temps[g.avant]) return;
      var texte = temps[g.avant].textContent.replace(/\s+/g, ' ').trim(), debut = (g.items || []).join(', ') + ', ';
      if (texte.indexOf(debut) !== 0 || texte.length <= debut.length) return;   // sinon la phrase reste au panneau
      fins[g.avant] = { cote: g.cote === 'julie' ? 'julie' : 'darshan', texte: texte.slice(debut.length) };
      temps[g.avant].classList.add('listes-ailleurs');
      // « Cocher “gâteau” fait briller le paquet dans le sac de Julie ; cocher “sac à main” fait briller
      // le bouton de son sac. Les sacs ne changent pas. »
      if (g.briller) {
        var vus = {};
        g.progres = function () {
          var L = scene.listesGeste && scene.listesGeste[fins[g.avant].cote];
          (L ? L.lignes : []).forEach(function (l) {
            if (!l.coche || vus[l.texte]) return;
            vus[l.texte] = true;
            if (g.briller.indexOf(l.texte) >= 0) Fx.marquer(scene, 'objets', 'pulse', 1900);
          });
        };
      }
    });
    function surTemps(j) {
      var f = fins[j];
      if (!f) return;
      for (var k = j - 1; k >= 0; k--) {
        if (fins[k] || !temps[k]) continue;
        temps[k].classList.remove('cache'); temps[k].classList.add('passe');
        break;
      }
      var L = scene.listesGeste && scene.listesGeste[f.cote], ol = L && L.parent.querySelector('ol');
      if (!ol) return;
      var li = el('li', { 'class': 'liste-fin' }, ol);
      li.textContent = f.texte;
      if (!calme) { li.style.opacity = '0'; Fx.animer(scene, 900, function (x) { li.style.opacity = lisse(x).toFixed(3); }); }
    }
    scene.effetsLocaux = {
      // « Julie qui vient de contrôler furtivement dans le reflet d'une vitrine son allure, passe le coin de
      // rue qui la sépare de Darshan. » : l'arête s'efface (0,8 s) ; la façade à l'encre se développe en
      // photo (même photo, même cadre) et la moitié de Julie s'y fond (1,5 s) ; ce qui n'était qu'un dessin
      // devient réel. La page finit sur la photo, où 6.3 s'ouvre.
      'coin-de-rue': function (sc, e) {
        var i = e.i === undefined ? 2 : e.i;
        function poser(v) { photo.style.filter = v >= 1 ? 'none' : 'sepia(' + (0.7 * (1 - v)).toFixed(3) + ') contrast(' + (0.72 + 0.28 * v).toFixed(3) + ')'; }
        var fin = calme ?
          animerPage(scene, 600, 600, function (x) { aretes.forEach(function (a) { opacite(a, 1 - x); }); photo.style.opacity = x.toFixed(3); }) :
          Fx.animer(scene, 2000, function (x) {
            var tt = x * 2, v = lisse(borne((tt - 0.35) / 1.5));
            aretes.forEach(function (a) { opacite(a, 1 - lisse(borne(tt / 0.8))); });
            photo.style.opacity = v.toFixed(3); poser(v);
          });
        return fin.then(function () {
          poser(1);
          plans.forEach(function (p, k) { p.style.transitionDuration = '0ms'; p.classList.toggle('vu', k === i); });
          retirer(racine);
        });
      }
    };
    derouler(scene, cfg, { attente: 600, surTemps: surTemps });
    quandEntree(scene).then(function () {
      if (calme) return animerPage(scene, 600, 600, function (x) { racine.style.opacity = x.toFixed(3); });
      return Fx.animer(scene, 1300, partager).then(function () {
        partage();
        return Fx.animer(scene, 500, function (x) { aretes.forEach(function (a) { opacite(a, x); }); });
      });
    }).then(null, signaler);
  };
  // L'arête de pierre d'un coin de rue : une chaîne d'angle, ses pierres alternées, un peu irrégulières,
  // la face éclairée et la face dans l'ombre. Verticale au milieu de la page ; horizontale en grand texte.
  function areteDePierre(parent, verticale) {
    var s = svgEl('svg', { 'class': 'scene-svg listes-arete ' + (verticale ? 'verticale' : 'horizontale'), viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' }, parent);
    var rnd = hasard(verticale ? 61 : 67), c = verticale ? 600 : PARTAGE_GRAND, fin = verticale ? H : W, a = -20, k = 0;
    var ombre = svgEl('g', { fill: '#000', opacity: 0.28 }, s), pierres = svgEl('g', { stroke: '#7a6e58', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
    function pt(u, v) { return verticale ? f1(c + v) + ',' + f1(u) : f1(u) + ',' + f1(c + v); }
    while (a < fin + 20) {
      var h = 78 + rnd() * 46, b = a + h, gros = k % 2 === 0, w0 = (gros ? 30 : 13) + rnd() * 5, w1 = (gros ? 13 : 30) + rnd() * 5;
      var j = function () { return (rnd() - 0.5) * 6; };
      var d = 'M' + pt(a + j(), -w0) + 'L' + pt(a + j(), w1) + 'L' + pt(b + j(), w1 + j()) + 'L' + pt(b + j(), -w0 + j()) + 'Z';
      svgEl('path', { d: d, transform: verticale ? 'translate(7 3)' : 'translate(3 7)' }, ombre);
      svgEl('path', { d: d, fill: k % 3 === 1 ? '#ddd1b7' : '#e8ddc6' }, pierres);
      // la face dans l'ombre, d'un côté de l'arête
      svgEl('path', { d: 'M' + pt(a + 2, 1) + 'L' + pt(a + 2, w1 - 2) + 'L' + pt(b - 2, w1 - 2) + 'L' + pt(b - 2, 1) + 'Z', fill: '#000', opacity: 0.14, stroke: 'none' }, pierres);
      a = b; k++;
    }
    svgEl('path', { d: 'M' + pt(-20, 0) + 'L' + pt(fin + 20, 0), stroke: '#fff7e6', 'stroke-width': 1.6, opacity: 0.55 }, s);
    return s;
  }

  // Un point du pourtour d'un rectangle aux coins arrondis (u de 0 à 1) et sa normale vers l'intérieur :
  // [x, y, nx, ny]. Les bords ondulants de la pierre (vision) partent de lui.
  function pourtour(u, x0, y0, x1, y1) {
    var r = 80, l = x1 - x0 - 2 * r, h = y1 - y0 - 2 * r, arc = Math.PI * r / 2, P = 2 * (l + h) + 4 * arc, d = u * P;
    var segs = [[l, 'h', x0 + r, y0, 1, 0, 0, 1], [arc, 'a', x1 - r, y0 + r, -Math.PI / 2], [h, 'v', x1, y0 + r, 0, 1, -1, 0],
      [arc, 'a', x1 - r, y1 - r, 0], [l, 'h', x1 - r, y1, -1, 0, 0, -1], [arc, 'a', x0 + r, y1 - r, Math.PI / 2],
      [h, 'v', x0, y1 - r, 0, -1, 1, 0], [arc, 'a', x0 + r, y0 + r, Math.PI]];
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i];
      if (d <= sg[0] || i === segs.length - 1) {
        if (sg[1] === 'a') { var a = sg[4] + d / r; return [sg[2] + r * Math.cos(a), sg[3] + r * Math.sin(a), -Math.cos(a), -Math.sin(a)]; }
        return [sg[2] + sg[4] * d, sg[3] + sg[5] * d, sg[6], sg[7]];
      }
      d -= sg[0];
    }
    return [x0, y0, 1, 1];
  }

  // ---------------------------------------------------------------- clôture (8.1 et « Fin »)
  /* « Le miroir du poème d'ouverture » (docs/darshan-mise-en-scene/chapitre-7.md, 8.1 et « La page « Fin » » ;
     synthèse, partie 3.4 ; décisions de Karl 4 et 26). Les vers paraissent un à un sur le papier et restent,
     atténués ; « un temps de plus entre le quatrième et le cinquième vers (le blanc du livre) » ; au dernier, un
     fil d'encre se trace au bas de la page, de gauche à droite, et reste. Puis la page « Fin » (finDuLivre), et
     « Nouvelle lecture », qui ferme le livre comme une porte. Silence : le livre ne fait plus de son depuis le choc
     de 7.15. Mouvement réduit : des fondus. */
  speciales.cloture = function (scene, cfg) {
    $$('.cloture-svg, .fin-livre, .cloture-porte', scene).forEach(retirer);
    $$('.cloture-sort', scene).forEach(function (n) { n.classList.remove('cloture-sort'); });
    var s = calqueScene(scene, 'cloture-svg', '');
    scene.effetsLocaux = {
      // « Les sentiments noircissent » : « le fil d'encre, fin, au bas de la page (y 1 650), tracé en 1,5 s ; la page
      // reste blanche » : le fil d'or du poème d'ouverture, devenu fil d'encre, « comme la première ligne d'une page
      // à venir ». Mouvement réduit : « le fil paraît en fondu »
      frontiere: function (sc, e) {
        var y = e.y || 1650, rnd = hasard(11), d = 'M150,' + f1(y), n = 24;
        for (var i = 1; i <= n; i++) d += 'L' + f1(150 + 900 * i / n) + ',' + f1(y + Math.sin(i * 0.8) * 1.8 + (rnd() - 0.5) * 1.6);
        var o = { d: d, stroke: '#2a1c10', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 };
        var g = svgEl('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s);
        var traits = [svgEl('path', Fx.copie(o, { 'stroke-width': 7, opacity: 0.08 }), g), svgEl('path', Fx.copie(o, { 'stroke-width': 2.4, opacity: 0.88 }), g)];
        if (calme) {
          traits.forEach(function (p) { p.setAttribute('stroke-dashoffset', '0'); });
          opacite(g, 0);
          return animerPage(scene, 900, 900, function (x) { opacite(g, x); });
        }
        return Fx.animer(scene, e.trace || 1500, function (x) {
          var v = ((1 - x) * (1 - x)).toFixed(4);   // la plume part franchement, se pose en finissant
          traits.forEach(function (p) { p.setAttribute('stroke-dashoffset', v); });
        });
      }
    };
    derouler(scene, cfg, {
      garder: true, attente: 500,
      // le blanc du livre imprimé entre le quatrième et le cinquième vers : un temps de plus (et sa place, moteur.css)
      surTemps: function (j) { if (j === 3) return Fx.pause(scene, 1800); },
      // « Sortie : fondu vers la page « Fin ». »
      fin: function () { finDuLivre(scene); }
    });
  };

  // « Nouvelle lecture » : « Il ferme le livre : la page se referme comme une porte (la transition `porte` de
  // « Ouvrir », jouée à l'envers : la lumière se réduit à un trait, puis s'éteint : « cette distance qui se crée en
  // fermant votre porte »). » La lumière de la page se resserre jusqu'à l'embrasure de la porte d'« Ouvrir », le
  // battant se ferme, le trait qui reste s'éteint. Mouvement réduit : un fondu au noir.
  function fermerLeLivre(scene) {
    var s = svgEl('svg', { 'class': 'cloture-porte', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' }, scene);
    var id = prefixe(scene, 'fp'), flou = svgEl('filter', { id: id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, svgEl('defs', {}, s));
    svgEl('feGaussianBlur', { stdDeviation: 16 }, flou);
    var nuit = svgEl('path', { fill: '#050608', 'fill-rule': 'evenodd' }, s);
    var halo = svgEl('rect', { fill: '#ffe9bd', opacity: 0, filter: 'url(#' + id + ')' }, s);
    var BORD = 'M-80,-80H' + (W + 80) + 'V' + (H + 80) + 'H-80Z', EMBRASURE = [470, 560, 260, 560];
    function ouverture(r) {
      nuit.setAttribute('d', BORD + (r && r[2] > 0.2 ? 'M' + f1(r[0]) + ',' + f1(r[1]) + 'h' + f1(r[2]) + 'v' + f1(r[3]) + 'h' + f1(-r[2]) + 'Z' : ''));
    }
    if (calme) {
      ouverture(null); opacite(nuit, 0);
      return animerPage(scene, 700, 700, function (x) { opacite(nuit, x); }).then(function () { return attendreVraiment(250); });
    }
    ouverture(PLEIN);
    return Fx.animer(scene, 1900, function (x) {
      var t = x * 1.9, r = melange(PLEIN, EMBRASURE, lisse(borne(t / 0.7)));
      var l = r[2] * (1 - 0.985 * lent(borne((t - 0.75) / 0.6)));   // le battant se ferme sur ses gonds, à gauche
      var v = lisse(borne((t - 1.4) / 0.4));                         // le trait s'éteint
      ouverture(v >= 1 ? null : [r[0], r[1], l * (1 - v), r[3]]);
      rect(halo, [r[0] - 18, r[1] - 18, l + 36, r[3] + 36]);
      opacite(halo, 0.5 * lisse(borne((t - 0.55) / 0.4)) * (1 - v));
    }).then(function () { ouverture(null); opacite(halo, 0); return attendreVraiment(300); });
  }

  return { jouer: jouer, config: config, sortir: sortir, speciales: speciales, Lanterne: Lanterne };
})();
