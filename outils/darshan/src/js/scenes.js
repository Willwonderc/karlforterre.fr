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
  // « Fin », et de quoi relire le livre depuis le début.
  function finDuLivre(scene) {
    var f = el('div', { 'class': 'fin-livre ui' }, scene);
    el('p', { 'class': 'fin-titre' }, f).textContent = ui('fin');
    var b = el('button', { type: 'button' }, f);
    b.textContent = ui('nouvelle_lecture');
    b.addEventListener('click', function (ev) { ev.stopPropagation(); Navigation.recommencer(); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { f.classList.add('vu'); }); });
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

  return { jouer: jouer, config: config, sortir: sortir, speciales: speciales };
})();
