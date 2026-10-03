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

  // ---------------------------------------------------------------- la lanterne du père
  /* « une lanterne de bois aux motifs circulaires » (3.10) ; « Le linteau s'accompagne d'une lanterne aux
     rayons pénétrants » (7.12). Six pans de bois ajourés de cercles (d'après le vitrail aux arcs de cercle
     de Karl, 34849711), vus de face : un pan entier, deux en raccourci ; un toit, une base, une chaîne qui
     monte hors du cadre. Lanterne(parent, x, y, id) pose la flamme en (x, y) : c'est le point orange de
     la nuit de Karl (noir-lueur, en (600, 300)), même taille, même couleur, pour que la photo puisse
     s'effacer sous lui. Les mêmes dessins servent à la scène rue-de-rungis (7.12 à 7.15), 120 unités
     au-dessus du haut de la porte. Rend { g, flamme, traits (les quatre tracés de couleur : ocre pour le
     bois, vert pour le toit et la base, bleu pour les jours, or pour la chaîne), bois (la lanterne éclairée
     du dedans), halo, jours (les centres des jours, en unités de page), etat, poser(etat) } ; états :
     'eteinte' (rien), 'flamme' (le point seul), 'traits' (le dessin en couleurs), 'allumee'. */
  function Lanterne(parent, x, y, id) {
    var L = { etat: 'eteinte', jours: [] };
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
    var CHAINE = 'M0,-330V-155M-9,-146a9,9 0 1,0 18,0a9,9 0 1,0 -18,0M-7,-134a7,7 0 1,0 14,0a7,7 0 1,0 -14,0';
    // ---- éclairée du dedans : le bois sombre, les jours qui brillent, les arêtes qui prennent l'or
    L.bois = svgEl('g', { opacity: 0 }, L.g);
    svgEl('path', { d: 'M0,-330V-155', stroke: '#3a2414', 'stroke-width': 5 }, L.bois);
    svgEl('path', { d: 'M1.5,-330V-155', stroke: OR, 'stroke-width': 1.2, opacity: 0.6 }, L.bois);
    svgEl('path', { d: 'M-98,-80L-72,-94L72,-94L98,-80ZM-72,-94L-14,-128L14,-128L72,-94Z', fill: '#2b190d', stroke: '#c8893a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, L.bois);
    svgEl('path', { d: 'M-92,80L-44,98L44,98L92,80ZM-12,98L0,116L12,98Z', fill: '#2b190d', stroke: '#c8893a', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, L.bois);
    svgEl('circle', { cx: 0, cy: -146, r: 9, fill: 'none', stroke: '#c8893a', 'stroke-width': 4 }, L.bois);
    svgEl('circle', { cx: 0, cy: -134, r: 7, fill: '#c8893a' }, L.bois);
    svgEl('rect', { x: -90, y: -80, width: 45, height: 160, fill: '#1e1109' }, L.bois);
    svgEl('rect', { x: 45, y: -80, width: 45, height: 160, fill: '#1e1109' }, L.bois);
    svgEl('rect', { x: -45, y: -80, width: 90, height: 160, fill: '#2a170c' }, L.bois);
    var jours = svgEl('g', { fill: fJour, filter: 'url(#' + id + '-lueur)' }, L.bois);
    JOURS.forEach(function (j) { svgEl('ellipse', { cx: j[0], cy: j[1], rx: j[2], ry: j[3] }, jours); });
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
      L.etat = etat;
      opacite(L.flamme, etat === 'eteinte' ? 0 : 1);
      L.tracer(etat === 'traits' || etat === 'allumee' ? 1 : 0);
      opacite(L.traits, etat === 'allumee' ? 0.18 : 1);
      opacite(L.bois, etat === 'allumee' ? 1 : 0);
      opacite(L.halo, etat === 'allumee' ? 1 : 0);
    };
    L.poser('eteinte');
    return L;
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
     carnet ; l'air revient. Une seule toile (les braises), jamais deux à la fois. Mouvement réduit : ni
     bascule, ni ondulation, ni particule ; des fondus. Tout s'arrête avec la page ; l'accord ne survit à la
     page que si la suivante est encore la vision (3.10 → 3.11, sur le web). */
  var FALLS = [[410, 785, 82], [765, 785, 82], [345, 645, 34], [450, 645, 34], [715, 635, 34], [800, 635, 34]];
  speciales.vision = function (scene, cfg) {
    var id = prefixe(scene, 'vi');
    var plans = $$('.decor .plan', scene), decor = $('.decor', scene);
    // une page rejouée repart de son premier plan
    $$('.vision-svg, .vision-braises, .vision-fond', scene).forEach(retirer);
    plans.forEach(function (p, i) { p.classList.toggle('vu', i === 0); p.style.transform = ''; });
    // sous les plans : le noir de la nuit de Karl (la porte est un calque transparent, posé sur lui)
    if (decor) decor.insertBefore(el('div', { 'class': 'vision-fond', 'aria-hidden': 'true' }), decor.firstChild);
    var traits = fichierDecor('porte-pere-traits');
    var s = calqueScene(scene, 'vision-svg',
      '<radialGradient id="' + id + '-absence" gradientUnits="userSpaceOnUse" cx="600" cy="720" r="1600">' +
      '<stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset=".82" stop-color="#000" stop-opacity=".82"/><stop offset="1" stop-color="#000" stop-opacity="1"/></radialGradient>' +
      '<radialGradient id="' + id + '-revele"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + '-tache"><stop offset="0" stop-color="#fff3cf" stop-opacity=".9"/><stop offset=".6" stop-color="#ffd98a" stop-opacity=".45"/>' +
      '<stop offset="1" stop-color="#ffc861" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + '-voile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".86" stop-color="#000"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + id + '-voile-m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".86" stop-color="#000"/>' +
      '<stop offset="1" stop-color="#fff"/></linearGradient>' +
      '<mask id="' + id + '-masque" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1800"><rect width="1200" height="1800" fill="#000"/></mask>' +
      '<mask id="' + id + '-drape" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1800"><rect width="1200" height="1800" fill="#fff"/></mask>');
    function q(sel) { return s.querySelector(sel); }
    var gradAbsence = q('#' + id + '-absence'), masque = q('#' + id + '-masque'), masqueDrape = q('#' + id + '-drape');
    var absence = svgEl('rect', { width: W, height: H, fill: 'url(#' + id + '-absence)', opacity: 0 }, s);
    var lueurVie = svgEl('rect', { width: W, height: H, fill: '#ffb36b', opacity: 0 }, s);
    var noir = svgEl('rect', { x: -50, y: -50, width: W + 100, height: H + 100, fill: '#040205', opacity: 0 }, s);
    var gBords = svgEl('g', { opacity: 0 }, s);
    var voile = svgEl('rect', { x: -50, y: -2400, width: W + 100, height: 2400, fill: 'url(#' + id + '-voile)', opacity: 0 }, s);
    var orn = svgEl('g', { opacity: 0 }, s);
    var imgOrn = traits ? Gestes.image(orn, traits, { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none', mask: 'url(#' + id + '-masque)' }) : null;
    var gRayons = svgEl('g', { opacity: 0 }, s), rayons = [], taches = [];
    var L = Lanterne(s, 600, 300, id);
    var gTraces = svgEl('g', {}, s);
    // les cercles de lumière : chaque jour de la lanterne envoie un faisceau sur un ornement de la porte
    FALLS.forEach(function (f, i) {
      var src = L.jours[[7, 8, 3, 5, 6, 4][i]];   // les pans en raccourci vers les octogones, les petits jours vers les médaillons
      var gr = svgEl('linearGradient', { id: id + '-f' + i, gradientUnits: 'userSpaceOnUse', x1: src[0], y1: src[1], x2: f[0], y2: f[1] }, q('defs'));
      svgEl('stop', { offset: 0, 'stop-color': '#ffe6a8', 'stop-opacity': 0.5 }, gr);
      svgEl('stop', { offset: 1, 'stop-color': '#ffd98a', 'stop-opacity': 0.12 }, gr);
      rayons.push({ src: src, f: f, p: svgEl('path', { fill: 'url(#' + id + '-f' + i + ')' }, gRayons) });
      taches.push(svgEl('ellipse', { cx: f[0], cy: f[1], rx: 0, ry: 0, fill: 'url(#' + id + '-tache)' }, gRayons));
    });
    function faisceau(r, x) {   // x : la part du chemin parcourue par la lumière
      var a = r.src, b = [entre(a[0], r.f[0], x), entre(a[1], r.f[1], x)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
      var ux = -dy / n, uy = dx / n, w0 = 6, w1 = r.f[2] * x;
      r.p.setAttribute('d', 'M' + f1(a[0] + ux * w0) + ',' + f1(a[1] + uy * w0) + 'L' + f1(b[0] + ux * w1) + ',' + f1(b[1] + uy * w1) +
        'L' + f1(b[0] - ux * w1) + ',' + f1(b[1] - uy * w1) + 'L' + f1(a[0] - ux * w0) + ',' + f1(a[1] - uy * w0) + 'Z');
    }
    function lumieres(x, taille) {
      rayons.forEach(function (r) { faisceau(r, x); });
      taches.forEach(function (t, i) { t.setAttribute('rx', f1(FALLS[i][2] * 1.05 * taille)); t.setAttribute('ry', f1(FALLS[i][2] * 0.9 * taille)); });
    }

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
            b.liste.push({ x: 90 + rnd() * 1020, y: 1280 + rnd() * 420, vx: (rnd() - 0.5) * 24, vy: -(70 + rnd() * 90), r: 11 + rnd() * 18,
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
          if (e.envol) { e.vy = Math.max(-520, e.vy * (1 + 2.6 * dt) - 60 * dt); e.vie -= dt * 0.95; }
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

    // ---- l'accord du père : tenu tant que la lanterne brille ; sur une page ouverte seule (EPUB),
    // le son ne part qu'au premier geste du lecteur : l'accord est redemandé alors
    function accord() { if (L.etat === 'allumee' && scene.classList.contains('active')) Fx.sonner('pere', { tenu: true }); }

    // ---- les effets de la vision, dans l'ordre du texte
    var extinction = null;
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
      lanterne: function (sc, e) {
        // 3.11 s'ouvre comme 3.10 s'arrête : la lanterne allumée
        if (e.allumee) { opacite(noir, 0); L.poser('allumee'); return null; }
        // « Des couleurs, ils en approchent, elles viennent à sa rencontre, elles tracent les traits d'une
        // lanterne de bois aux motifs circulaires. » : des points de couleur viennent du fond, grossissent
        // et tracent les traits autour du point orange (3 s)
        if (e.tracer) return tracer();
        // « Elle s'allume. » : lueur d'or (1,5 s) ; l'accord du père monte en même temps (effet suivant)
        if (e.allumer) {
          L.etat = 'allumee';
          var allume = animerPage(scene, 1500, 400, function (x) {
            var v = lisse(x);
            opacite(L.bois, v); opacite(L.halo, Math.min(1, v * 1.25)); opacite(L.traits, 1 - 0.82 * v);
          });
          return { suite: Promise.resolve(), fin: allume };
        }
        // « La lueur de la lanterne faiblit, s'éteint… » : 2,5 s ; la lumière qu'elle jette s'en va avec
        // elle ; l'accord s'éteint au même instant (effet `son`, qui suit sans attendre)
        if (e.eteindre) {
          L.etat = 'flamme';
          var r0 = +gRayons.getAttribute('opacity') || 0, b0 = +L.bois.getAttribute('opacity') || 0;
          extinction = animerPage(scene, 2500, 600, function (x) {
            var v = 1 - lisse(x);
            opacite(L.bois, b0 * v); opacite(L.halo, v); opacite(L.traits, 0.18 * v); opacite(gRayons, r0 * v);
          });
          return { suite: Promise.resolve(), fin: extinction };
        }
        return null;
      },
      // « Son rayonnement dessine les ornements d'une finesse hors de portée d'homme. » : la lumière passe
      // par les jours de la lanterne et projette des cercles sur les octogones sculptés des panneaux hauts ;
      // là où ils tombent naissent, en or, les ornements de la porte, révélés depuis la lanterne (3,5 s)
      ornements: function (sc, e) {
        if (!imgOrn) return null;
        if (e.deja) {
          imgOrn.removeAttribute('mask');
          opacite(orn, 1); lumieres(1, 1); opacite(gRayons, 0.3);
          bords();
          return null;
        }
        opacite(orn, 1);
        if (calme) {
          imgOrn.removeAttribute('mask');
          lumieres(1, 1);
          return animerPage(scene, 600, 600, function (x) { opacite(orn, x); opacite(gRayons, x); })
            .then(function () { return animerPage(scene, 800, 400, function (x) { opacite(gRayons, 1 - 0.7 * x); }); })
            .then(bords);
        }
        var revele = svgEl('circle', { cx: 600, cy: 300, r: 0, fill: 'url(#' + id + '-revele)' }, masque);
        var cercles = FALLS.map(function (f) { return svgEl('circle', { cx: f[0], cy: f[1], r: 0, fill: 'url(#' + id + '-revele)' }, masque); });
        opacite(gRayons, 1);
        return Fx.animer(scene, 3500, function (x) {
          var t = x * 3.5;
          lumieres(lisse(borne(t / 0.9)), lisse(borne((t - 0.6) / 0.7)));
          cercles.forEach(function (c, i) { c.setAttribute('r', f1(FALLS[i][2] * 1.6 * lisse(borne((t - 0.9) / 0.6)) + 360 * lisse(borne((t - 1.3) / 2.2)))); });
          revele.setAttribute('r', f1(1650 * lent(borne((t - 1.1) / 2.4))));
        }).then(function () {
          imgOrn.removeAttribute('mask');
          bords();
          return animerPage(scene, 1200, 300, function (x) { opacite(gRayons, 1 - 0.7 * lisse(x)); });
        });
      },
      // « … et emporte avec elle la porte en se drapant de l'inconnu. » : un voile noir descend sur la porte
      // de haut en bas (2 s), les traits d'or s'éteignent les derniers ; il ne reste que la flamme
      draper: function () {
        var lagM = svgEl('rect', { x: -50, y: -2400, width: W + 100, height: 2400, fill: 'url(#' + id + '-voile-m)' }, masqueDrape);
        var fin = Promise.resolve(extinction).then(function () {
          if (imgOrn) imgOrn.setAttribute('mask', 'url(#' + id + '-drape)');
          opacite(voile, 1);
          if (calme) {
            // un fondu : le voile couvre la porte, les traits s'éteignent les derniers
            voile.setAttribute('y', '0'); opacite(voile, 0);
            return animerPage(scene, 900, 900, function (x) { opacite(voile, x); opacite(orn, 1 - lisse(borne((x - 0.3) / 0.7))); });
          }
          return Fx.animer(scene, 2700, function (x) {
            var t = x * 2.7, front = entre(-200, 2150, lisse(borne(t / 2))), retard = entre(-200, 2150, lisse(borne((t - 0.7) / 2)));
            voile.setAttribute('y', f1(front - 2400));
            lagM.setAttribute('y', f1(retard - 2400));
          });
        }).then(function () { opacite(orn, 0); bordsEnMarche = false; opacite(gBords, 0); });
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
        grains.push({ de: [600 + Math.cos(a) * d, Math.max(-40, 300 + Math.sin(a) * d * 0.8)], vers: [600 + cible.x, 300 + cible.y],
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
            pl.g.setAttribute('cx', f1(600 + pt.x)); pl.g.setAttribute('cy', f1(300 + pt.y));
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
    derouler(scene, cfg, { attente: 600 });
    // ce qui suit dépend de l'état des effets de la page, lié au récit qui vient de naître
    // « dans cet environnement dépourvu d'air » : une page qui s'ouvre dans la vision (3.11) s'ouvre sans air
    if ((cfg.debut || []).some(function (e) { return e.nom === 'lanterne' && e.allumee; })) {
      try { Son.ambiance('silence'); } catch (e) { signaler(e); }
    }
    function geste() { try { accord(); } catch (e) { signaler(e); } }
    function lacher() { if (scene.ecouteAccord) { doc.removeEventListener('pointerup', scene.ecouteAccord); doc.removeEventListener('keydown', scene.ecouteAccord); } scene.ecouteAccord = null; }
    lacher();   // une page rejouée : l'écoute de la lecture précédente s'en va
    scene.ecouteAccord = geste;
    doc.addEventListener('pointerup', geste);
    doc.addEventListener('keydown', geste);
    Fx.surDepart(scene, function () {
      lacher();
      bordsEnMarche = false;
      // l'accord ne survit à la page que si la suivante est encore la vision (3.10 → 3.11, sur le web)
      var suite = sceneCourante();
      if (!(suite && suite !== scene && suite.getAttribute('data-special') === 'vision')) Fx.sonner('pere', { eteindre: 1500 });
    });
  };

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

  return { jouer: jouer, config: config, sortir: sortir, speciales: speciales, Lanterne: Lanterne };
})();
