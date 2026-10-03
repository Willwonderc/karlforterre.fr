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
  };

  return { jouer: jouer, config: config, sortir: sortir, speciales: speciales };
})();
