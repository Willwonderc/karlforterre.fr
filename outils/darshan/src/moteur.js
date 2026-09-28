/* Darshan, le livre des portes : moteur de la tranche verticale.
   Amélioration progressive : sans ce script (ou dans une liseuse qui ne l'exécute pas),
   chaque scène reste une page illustrée où tout le texte est lisible. Avec lui, le texte
   se révèle temps par temps, certains temps attendent un geste du lecteur, et le son
   est fabriqué en direct (Web Audio), sans aucun fichier. Aucune dépendance, aucun
   appel réseau. Chaque geste a un équivalent au toucher simple et au clavier. */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  var estEpub = html.classList.contains('epub');
  var W = 1200, H = 1800;

  // ---------------------------------------------------------------- mémoire (facultative)
  function lire(cle) { try { return JSON.parse(window.localStorage.getItem(cle)); } catch (e) { return null; } }
  function ecrire(cle, v) { try { window.localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* rien */ } }

  // ---------------------------------------------------------------- peut-on jouer ?
  function peutJouer() {
    var rs = navigator.epubReadingSystem;
    if (rs && typeof rs.hasFeature === 'function') {
      try { if (rs.hasFeature('dom-manipulation') === false) return false; } catch (e) { /* on tente */ }
    }
    return !!(doc.querySelector && window.requestAnimationFrame && html.classList && window.addEventListener && window.DOMParser);
  }
  var reglages = lire('darshan.reglages') || { son: true, lecture: false };
  if (!peutJouer() || reglages.lecture) { installerBoutonJeu(); return; }
  html.classList.add('jeu');
  var calme = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------------------------------------------------------------- petits outils
  function $(sel, racine) { return (racine || doc).querySelector(sel); }
  function $$(sel, racine) { return [].slice.call((racine || doc).querySelectorAll(sel)); }
  function el(nom, attrs, parent) {
    var e = doc.createElement(nom);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  function lisse(t) { return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t); }
  function anime(duree, pas) {
    return new Promise(function (fin) {
      var t0 = null, d = calme ? Math.min(duree, 300) : duree;
      function image(t) {
        if (t0 === null) t0 = t;
        var x = Math.min(1, (t - t0) / d);
        pas(x);
        if (x < 1) requestAnimationFrame(image); else fin();
      }
      requestAnimationFrame(image);
    });
  }
  function coordScene(scene, ev) {
    var r = scene.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height };
  }
  function toucheDeBouton(ev) {
    var t = ev.target;
    return !!(t && t.tagName && t.tagName.toUpperCase() === 'BUTTON' && (ev.key === 'Enter' || ev.key === ' '));
  }
  function horsBarre(ev) { return !(ev.target && ev.target.closest && ev.target.closest('.barre, .fin-extrait, .carnet, .fiche, .nouvel-objet')); }
  var TOUCHES = [' ', 'Enter', 'ArrowRight', 'ArrowUp'];
  // Jusqu'où le lecteur a lu (paragraphe et caractère, en un nombre) : les fiches d'objet
  // n'affichent que des phrases déjà lues.
  var Lecture = { max: 0 };

  // ---------------------------------------------------------------- le son, fabriqué en direct
  var Son = (function () {
    var ctx = null, maitre = null, bus = null, actif = reglages.son !== false;
    var ambiance = null, voulue = null, tampons = {};
    function init() {
      if (ctx) { if (ctx.state === 'suspended' && ctx.resume) ctx.resume(); return; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { ctx = new AC(); } catch (e) { ctx = null; return; }
      maitre = ctx.createGain(); maitre.gain.value = actif ? 0.85 : 0; maitre.connect(ctx.destination);
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
      comp.connect(maitre); bus = comp;
      if (voulue) changerAmbiance(voulue);
    }
    function bruit(type) {
      if (tampons[type]) return tampons[type];
      var n = ctx.sampleRate * 4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0, dernier = 0;
      for (var i = 0; i < n; i++) {
        var blanc = Math.random() * 2 - 1;
        if (type === 'rose') { b0 = 0.997 * b0 + 0.029591 * blanc; b1 = 0.985 * b1 + 0.032534 * blanc; b2 = 0.95 * b2 + 0.048056 * blanc; d[i] = (b0 + b1 + b2 + blanc * 0.1) * 0.9; }
        else if (type === 'brun') { dernier = (dernier + 0.02 * blanc) / 1.02; d[i] = dernier * 3.2; }
        else d[i] = blanc;
      }
      tampons[type] = b; return b;
    }
    function source(type) { var s = ctx.createBufferSource(); s.buffer = bruit(type); s.loop = true; s.start(); return s; }
    function lfo(freq, ampleur, cible) {
      var o = ctx.createOscillator(); o.frequency.value = freq;
      var g = ctx.createGain(); g.gain.value = ampleur; o.connect(g); g.connect(cible); o.start(); return o;
    }
    var ambiances = {
      // la voûte : quelques sinus lents, un souffle
      cosmos: function (sortie) {
        var arrets = [];
        [[110, 0.05], [164.81, 0.035], [220.4, 0.03], [329.6, 0.012]].forEach(function (p) {
          var o = ctx.createOscillator(); o.frequency.value = p[0];
          var g = ctx.createGain(); g.gain.value = p[1]; arrets.push(lfo(0.05 + Math.random() * 0.05, p[1] * 0.6, g.gain));
          o.connect(g); g.connect(sortie); o.start(); arrets.push(o);
        });
        var vent = source('rose'), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.5;
        var gv = ctx.createGain(); gv.gain.value = 0.025; vent.connect(f); f.connect(gv); gv.connect(sortie); arrets.push(vent);
        return arrets;
      },
      // la nuit sur les toits : vent, air, rumeur lointaine de la ville
      nuit: function (sortie) {
        var arrets = [];
        var vent = source('brun'), f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.7;
        arrets.push(lfo(0.05, 180, f.frequency)); var g = ctx.createGain(); g.gain.value = 0.22; arrets.push(lfo(0.08, 0.12, g.gain));
        vent.connect(f); f.connect(g); g.connect(sortie); arrets.push(vent);
        var air = source('blanc'), h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = 3500;
        var ga = ctx.createGain(); ga.gain.value = 0.006; air.connect(h); h.connect(ga); ga.connect(sortie); arrets.push(air);
        var ville = source('brun'), l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 160;
        var gville = ctx.createGain(); gville.gain.value = 0.12; ville.connect(l); l.connect(gville); gville.connect(sortie); arrets.push(ville);
        return arrets;
      },
      // Aluva : le fleuve, ses remous, les oiseaux, un tanpura
      kerala: function (sortie) {
        var arrets = [], vivant = true;
        var eau = source('rose'), l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 1100;
        var ge = ctx.createGain(); ge.gain.value = 0.16; eau.connect(l); l.connect(ge); ge.connect(sortie); arrets.push(eau);
        var remous = source('blanc'), b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 900; b.Q.value = 2.5;
        arrets.push(lfo(3.1, 260, b.frequency)); arrets.push(lfo(5.3, 180, b.frequency));
        var gr = ctx.createGain(); gr.gain.value = 0.035; remous.connect(b); b.connect(gr); gr.connect(sortie); arrets.push(remous);
        var courbe = new Float32Array(1024);
        for (var i = 0; i < 1024; i++) { var x = i / 512 - 1; courbe[i] = Math.tanh(2.2 * x) + 0.12 * Math.sin(9 * x); }
        var ws = ctx.createWaveShaper(); ws.curve = courbe;
        var bp = ctx.createBiquadFilter(); bp.type = 'peaking'; bp.frequency.value = 2200; bp.gain.value = 6;
        var gt = ctx.createGain(); gt.gain.value = 0.05; ws.connect(bp); bp.connect(gt); gt.connect(sortie);
        var notes = [98, 130.81, 130.81, 65.41], k = 0;
        (function pincer() {
          if (!vivant) return;
          var t = ctx.currentTime, f0 = notes[k++ % 4];
          for (var n = 1; n <= 10; n++) {
            var o = ctx.createOscillator(); o.frequency.value = f0 * n * (1 + (Math.random() - 0.5) * 0.002);
            var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 / n, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0008, t + 3.8); o.connect(g); g.connect(ws); o.start(t); o.stop(t + 4);
          }
          setTimeout(pincer, 1150);
        })();
        (function oiseau() {
          if (!vivant) return;
          var t = ctx.currentTime + 0.05, n = 2 + Math.floor(Math.random() * 4), base = 2400 + Math.random() * 1600;
          for (var j = 0; j < n; j++) {
            var o = ctx.createOscillator(), t1 = t + j * 0.16;
            o.frequency.setValueAtTime(base, t1); o.frequency.exponentialRampToValueAtTime(base * 1.45, t1 + 0.06);
            o.frequency.exponentialRampToValueAtTime(base * 0.9, t1 + 0.12);
            var g = ctx.createGain(); g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(0.03, t1 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0005, t1 + 0.13); o.connect(g); g.connect(sortie); o.start(t1); o.stop(t1 + 0.15);
          }
          setTimeout(oiseau, 1600 + Math.random() * 4200);
        })();
        arrets.push({ stop: function () { vivant = false; } });
        return arrets;
      }
    };
    function changerAmbiance(nom) {
      var t = ctx.currentTime;
      if (ambiance) {
        var ancienne = ambiance;
        ancienne.gain.gain.cancelScheduledValues(t);
        ancienne.gain.gain.setValueAtTime(ancienne.gain.gain.value, t);
        ancienne.gain.gain.linearRampToValueAtTime(0, t + 2.5);
        setTimeout(function () { ancienne.arrets.forEach(function (a) { try { a.stop(); } catch (e) { /* déjà arrêté */ } }); }, 2700);
        ambiance = null;
      }
      if (!nom || !ambiances[nom]) return;
      var g = ctx.createGain(); g.gain.value = 0; g.connect(bus);
      g.gain.linearRampToValueAtTime(1, t + 3);
      ambiance = { nom: nom, gain: g, arrets: ambiances[nom](g) };
    }
    function env(g, t, a, v, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0005, t + a + d); }
    var effets = {
      saut: function (t) {
        var s = ctx.createBufferSource(); s.buffer = bruit('blanc');
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 600; f.Q.value = 1.2;
        var g = ctx.createGain(); env(g, t, 0.004, 0.25, 0.07); s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + 0.12);
        var o = ctx.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.1);
        var g2 = ctx.createGain(); env(g2, t, 0.003, 0.35, 0.12); o.connect(g2); g2.connect(bus); o.start(t); o.stop(t + 0.2);
      },
      vibre: function (t) {
        var o = ctx.createOscillator(); o.frequency.value = 660;
        var m = ctx.createOscillator(); m.frequency.value = 31; var gm = ctx.createGain(); gm.gain.value = 40; m.connect(gm); gm.connect(o.frequency);
        var g = ctx.createGain(); env(g, t, 0.05, 0.06, 1.1); o.connect(g); g.connect(bus); o.start(t); m.start(t); o.stop(t + 1.3); m.stop(t + 1.3);
      },
      fonte: function (t) {
        [0, 7].forEach(function (d) {
          var o = ctx.createOscillator(); o.type = 'triangle';
          o.frequency.setValueAtTime(220 + d, t); o.frequency.exponentialRampToValueAtTime(1320 + d * 3, t + 1.3);
          var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5000, t + 1.3);
          var g = ctx.createGain(); env(g, t, 0.3, 0.07, 1.2); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 1.8);
        });
      },
      cle: function (t) {
        var s = ctx.createBufferSource(); s.buffer = bruit('blanc');
        var h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = 3500;
        var g = ctx.createGain(); env(g, t, 0.002, 0.3, 0.03); s.connect(h); h.connect(g); g.connect(bus); s.start(t); s.stop(t + 0.06);
        [2380, 3170, 4710].forEach(function (f0, i) {
          var o = ctx.createOscillator(); o.frequency.value = f0;
          var gg = ctx.createGain(); env(gg, t + 0.01, 0.002, 0.05 / (i + 1), 0.25); o.connect(gg); gg.connect(bus); o.start(t); o.stop(t + 0.4);
        });
      },
      tour: function (t) {
        var o = ctx.createOscillator(); o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
        var g = ctx.createGain(); env(g, t, 0.004, 0.5, 0.3); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.4);
        effets.cle(t + 0.03);
      },
      jour: function (t) {
        [220, 277.18, 329.63, 440, 554.37].forEach(function (f0, i) {
          var o = ctx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f0 * (1 + (Math.random() - 0.5) * 0.004);
          var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 2.2);
          g.gain.linearRampToValueAtTime(0.02, t + 6); g.gain.linearRampToValueAtTime(0, t + 9);
          o.connect(g); g.connect(bus); o.start(t); o.stop(t + 9.2);
        });
      },
      souffle: function (t) {
        var s = ctx.createBufferSource(); s.buffer = bruit('rose');
        var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(250, t); f.frequency.exponentialRampToValueAtTime(7000, t + 1.4);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 1.1); g.gain.linearRampToValueAtTime(0, t + 2.4);
        s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + 2.5);
      },
      tinte: function (t) {
        [1318.5, 1975.5].forEach(function (f0, i) {
          var o = ctx.createOscillator(); o.frequency.value = f0;
          var g = ctx.createGain(); env(g, t + i * 0.09, 0.005, 0.07, 0.9); o.connect(g); g.connect(bus);
          o.start(t + i * 0.09); o.stop(t + i * 0.09 + 1.1);
        });
      },
      papier: function (t) {
        var s = ctx.createBufferSource(); s.buffer = bruit('rose');
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
        f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.25);
        var g = ctx.createGain(); env(g, t, 0.03, 0.12, 0.25); s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + 0.4);
      },
      grince: function (t) {
        var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t);
        for (var i = 1; i < 12; i++) o.frequency.setValueAtTime(60 + Math.random() * 45, t + i * 0.05);
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6;
        var g = ctx.createGain(); env(g, t, 0.05, 0.05, 0.6); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.8);
      }
    };
    return {
      init: init,
      ambiance: function (nom) { voulue = nom; if (ctx && (!ambiance || ambiance.nom !== nom)) changerAmbiance(nom); },
      effet: function (nom) { if (!ctx || !actif || !effets[nom]) return; try { effets[nom](ctx.currentTime + 0.01); } catch (e) { /* pas de son */ } },
      actif: function () { return actif; },
      basculer: function () {
        actif = !actif; reglages.son = actif; ecrire('darshan.reglages', reglages);
        if (ctx) { maitre.gain.cancelScheduledValues(ctx.currentTime); maitre.gain.setValueAtTime(maitre.gain.value, ctx.currentTime); maitre.gain.linearRampToValueAtTime(actif ? 0.85 : 0, ctx.currentTime + 0.4); }
        return actif;
      }
    };
  })();

  // ---------------------------------------------------------------- étoiles scintillantes et étoiles filantes
  function Etoiles(toile, densite) {
    var c = toile.getContext('2d'), etoiles = [], filantes = [], eclat = 0.55, vivant = true;
    toile.width = W; toile.height = H;
    for (var i = 0; i < densite; i++) {
      etoiles.push({ x: Math.random() * W, y: Math.random() * H * 0.72, r: Math.random() * 1.8 + 0.6,
        p: Math.random() * 6.28, v: 0.6 + Math.random() * 2.2 });
    }
    function filer(x, y, angle, vitesse, retard) {
      setTimeout(function () { filantes.push({ x: x, y: y, a: angle, v: vitesse, vie: 1 }); }, retard || 0);
    }
    function image(t) {
      if (!vivant) return;
      c.clearRect(0, 0, W, H);
      for (var i = 0; i < etoiles.length; i++) {
        var e = etoiles[i], a = eclat * (0.35 + 0.65 * Math.abs(Math.sin(e.p + t / 1000 * e.v)));
        c.globalAlpha = a; c.fillStyle = '#fff6e0';
        c.beginPath(); c.arc(e.x, e.y, e.r, 0, 6.2832); c.fill();
        if (e.r > 2.1) { c.globalAlpha = a * 0.35; c.fillRect(e.x - e.r * 4, e.y - 0.6, e.r * 8, 1.2); c.fillRect(e.x - 0.6, e.y - e.r * 4, 1.2, e.r * 8); }
      }
      for (var j = filantes.length - 1; j >= 0; j--) {
        var f = filantes[j];
        f.x += Math.cos(f.a) * f.v; f.y += Math.sin(f.a) * f.v; f.vie -= 0.012;
        if (f.vie <= 0) { filantes.splice(j, 1); continue; }
        var g = c.createLinearGradient(f.x, f.y, f.x - Math.cos(f.a) * 260, f.y - Math.sin(f.a) * 260);
        g.addColorStop(0, 'rgba(255,248,225,' + (0.95 * f.vie) + ')'); g.addColorStop(1, 'rgba(255,248,225,0)');
        c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 3.2;
        c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x - Math.cos(f.a) * 260, f.y - Math.sin(f.a) * 260); c.stroke();
      }
      requestAnimationFrame(image);
    }
    if (!calme) requestAnimationFrame(image); else image(0);
    return {
      filer: filer,
      eclat: function (v) { eclat = v; if (calme) image(0); },
      hasard: function () {
        (function boucle() {
          if (!vivant || calme) return;
          filer(Math.random() * W * 0.8 + 100, Math.random() * 300 + 60, 0.35 + Math.random() * 0.5, 16 + Math.random() * 8);
          setTimeout(boucle, 7000 + Math.random() * 9000);
        })();
      },
      arreter: function () { vivant = false; }
    };
  }

  // ---------------------------------------------------------------- poussière dans la lumière
  function Poussiere(toile) {
    var c = toile.getContext('2d'), grains = [], vivant = true;
    toile.width = W; toile.height = H;
    function ajouter(n, x, y, eparpille) {
      for (var i = 0; i < n; i++) {
        grains.push({ x: x + (Math.random() - 0.5) * eparpille, y: y + (Math.random() - 0.5) * eparpille * 0.5,
          vx: (Math.random() - 0.5) * 0.9, vy: -Math.random() * 0.6 - 0.1, r: Math.random() * 2.6 + 0.8, a: Math.random() * 0.7 + 0.3, p: Math.random() * 6 });
      }
    }
    ajouter(90, 600, 1300, 900);
    function image(t) {
      if (!vivant) return;
      c.clearRect(0, 0, W, H);
      for (var i = grains.length - 1; i >= 0; i--) {
        var g = grains[i];
        g.x += g.vx + Math.sin(t / 1400 + g.p) * 0.25; g.y += g.vy;
        if (g.y < 250 || g.x < 0 || g.x > W) { grains.splice(i, 1); if (grains.length < 120) ajouter(1, 600, 1500, 900); continue; }
        c.globalAlpha = g.a * (0.5 + 0.5 * Math.sin(t / 700 + g.p));
        c.fillStyle = '#fff1c9'; c.beginPath(); c.arc(g.x, g.y, g.r, 0, 6.2832); c.fill();
      }
      requestAnimationFrame(image);
    }
    if (!calme) requestAnimationFrame(image);
    return { bouffee: function () { if (!calme) ajouter(140, 600, 1560, 700); }, arreter: function () { vivant = false; } };
  }

  // ---------------------------------------------------------------- le récit : révéler le texte temps par temps
  var annonceur = el('div', { 'class': 'ui', 'aria-live': 'polite', style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);' }, doc.body);
  function annoncer(txt) { annonceur.textContent = txt; }

  function Recit(scene, options) {
    var soi = this;
    this.scene = scene;
    this.temps = $$('.texte .temps', scene);
    this.i = -1;
    this.portes = options.portes || {};      // indice du temps -> geste qui l'ouvre
    this.surTemps = options.surTemps || function () {};
    this.fin = options.fin || function () {};
    this.enAttente = false;
    this.fini = false;
    this.garder = !!options.garder;          // le poème garde ses vers à l'écran
    var suite = el('button', { 'class': 'suite ui', type: 'button', 'aria-label': 'Suite du texte' }, scene);
    suite.textContent = '✦';
    this.bouton = suite;
    function avancer(ev) { if (ev) ev.stopPropagation(); soi.avancer(); }
    suite.addEventListener('click', avancer);
    var texte = $('.texte', scene);
    if (texte) texte.addEventListener('click', avancer);
    doc.addEventListener('keydown', function (ev) {
      if (!estEpub && !scene.classList.contains('active')) return;
      if (['ArrowRight', ' ', 'Enter', 'PageDown'].indexOf(ev.key) < 0) return;
      if (soi.enAttente || soi.fini || Objets.estOuverte() || toucheDeBouton(ev)) return;
      if (ev.cancelable) ev.preventDefault();
      soi.avancer();
    });
    this.temps.forEach(function (t) { t.setAttribute('aria-hidden', 'true'); });
  }
  Recit.prototype.pret = function (oui) { this.bouton.classList.toggle('pret', !!oui); };
  Recit.prototype.avancer = function () {
    if (this.enAttente || this.fini) return;
    var j = this.i + 1;
    if (j >= this.temps.length) { this.fini = true; this.pret(false); this.fin(); return; }
    var geste = this.portes[j];
    if (geste) {
      var soi = this;
      this.enAttente = true; this.pret(false);
      delete this.portes[j];
      Promise.resolve(geste()).then(function () { soi.enAttente = false; soi.avancer(); });
      return;
    }
    this.montrer(j);
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
    Promise.resolve(this.surTemps(j, t)).then(function () {
      soi.enAttente = false;
      setTimeout(function () { soi.pret(true); }, calme ? 100 : 700);
    });
    annoncer(t.textContent);
  };

  function consigne(scene, texte, y, delai) {
    var c = $('.consigne', scene) || el('div', { 'class': 'consigne ui', 'aria-live': 'polite' }, scene);
    c.style.top = (y / H * 100) + '%';
    function montrer() { c.textContent = texte; requestAnimationFrame(function () { c.classList.add('vu'); }); }
    var minuterie = (delai && !calme) ? setTimeout(montrer, delai) : (montrer(), null);
    return { effacer: function () { if (minuterie) clearTimeout(minuterie); c.classList.remove('vu'); } };
  }

  // attend un toucher (ou Entrée, Espace, flèche) sur une zone de la scène
  // action : { objet, libelle } ; le geste peut alors venir aussi du bouton de la fiche
  function toucher(cible, action) {
    return new Promise(function (ok) {
      var fait = false;
      function terminer(ev) {
        if (fait) return; fait = true;
        cible.removeEventListener('pointerup', fin); doc.removeEventListener('keydown', fin);
        if (action) Objets.retirerAction(action.objet);
        ok(ev);
      }
      function fin(ev) {
        if (Objets.estOuverte()) return;
        if (ev.type === 'keydown' && (TOUCHES.indexOf(ev.key) < 0 || toucheDeBouton(ev))) return;
        if (ev.type !== 'keydown' && !horsBarre(ev)) return;
        if (ev.cancelable) ev.preventDefault();
        terminer(ev);
      }
      cible.addEventListener('pointerup', fin); doc.addEventListener('keydown', fin);
      if (action) Objets.proposer(action.objet, action.libelle, function () { terminer({ type: 'action' }); });
    });
  }

  // ---------------------------------------------------------------- navigation entre scènes (édition web)
  var scenes = $$('.scene');
  var actuelle = -1;
  var demarreurs = {};
  var fond = estEpub ? null : el('div', { id: 'ambiance', 'aria-hidden': 'true' }, doc.body);
  // Ce que le lecteur a lu et ce qu'il porte se déduisent de la page : aucune mémoire requise.
  function entrerDansScene(sc) {
    var lu0 = +sc.getAttribute('data-lu0') || 0;
    if (lu0 > Lecture.max) Lecture.max = lu0;
    Objets.initialiser((sc.getAttribute('data-objets') || '').split(/\s+/).filter(Boolean));
  }
  function aller(i) {
    if (i < 0 || i >= scenes.length) return;
    var avant = scenes[actuelle];
    var apres = scenes[i];
    actuelle = i;
    if (avant) avant.classList.remove('active');
    apres.classList.add('active');
    entrerDansScene(apres);
    var img = $('.decor img', apres);
    if (fond && img) fond.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
    var son = apres.getAttribute('data-son');
    if (son) Son.ambiance(son);
    var nom = apres.getAttribute('data-scene');
    if (demarreurs[nom] && !apres.demarree) { apres.demarree = true; demarreurs[nom](apres); }
  }

  // ---------------------------------------------------------------- les objets : ce qu'on porte, fiches, actions
  // Gros plans des objets, en SVG (les identifiants internes sont rendus uniques à chaque copie).
  var DESSINS = {
    lunettes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-345 -125 690 250"><defs>' +
      '<radialGradient id="f-verre" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#8a7358"/><stop offset=".45" stop-color="#2a1e14"/><stop offset="1" stop-color="#0a0705"/></radialGradient></defs>' +
      '<path d="M178,-14 C235,-22 292,-42 332,-74" fill="none" stroke="#3b2a1a" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M-178,-14 C-235,-22 -292,-42 -332,-74" fill="none" stroke="#3b2a1a" stroke-width="13" stroke-linecap="round"/>' +
      '<circle cx="-105" cy="0" r="78" fill="url(#f-verre)" stroke="#4a3522" stroke-width="15"/>' +
      '<circle cx="105" cy="0" r="78" fill="url(#f-verre)" stroke="#4a3522" stroke-width="15"/>' +
      '<path d="M-32,-12 Q0,-42 32,-12" fill="none" stroke="#4a3522" stroke-width="13"/>' +
      '<ellipse cx="-135" cy="-32" rx="30" ry="11" fill="#fff" opacity=".3" transform="rotate(-20 -135 -32)"/>' +
      '<ellipse cx="75" cy="-32" rx="30" ry="11" fill="#fff" opacity=".22" transform="rotate(-20 75 -32)"/></svg>',
    cle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-230 -110 490 220"><defs>' +
      '<linearGradient id="f-laiton" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eac47d"/><stop offset=".5" stop-color="#a8742f"/><stop offset="1" stop-color="#5b3814"/></linearGradient>' +
      '<pattern id="f-rayures" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="14" height="14" fill="url(#f-laiton)"/><rect width="5" height="14" fill="#6d3f17" opacity=".55"/></pattern>' +
      '<filter id="f-rouille" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="2" seed="4" result="r"/>' +
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 .55  0 0 0 0 .25  0 0 0 0 .08  0 0 0 1.6 -.6" result="rr"/><feComposite in="rr" in2="SourceGraphic" operator="in" result="rrr"/>' +
      '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="rrr"/></feMerge></filter></defs>' +
      '<g filter="url(#f-rouille)"><circle cx="-150" cy="0" r="58" fill="none" stroke="url(#f-rayures)" stroke-width="30"/>' +
      '<rect x="-96" y="-12" width="330" height="24" rx="6" fill="url(#f-rayures)"/>' +
      '<rect x="170" y="10" width="22" height="46" fill="url(#f-rayures)"/><rect x="204" y="10" width="16" height="30" fill="url(#f-rayures)"/>' +
      '<rect x="226" y="10" width="10" height="52" fill="url(#f-rayures)"/></g></svg>'
  };
  var copies = 0;

  var Objets = (function () {
    var donnees = {};
    try { var bloc = doc.getElementById('donnees-objets'); donnees = bloc ? JSON.parse(bloc.textContent) : {}; } catch (e) { donnees = {}; }
    var sac = [], actions = {}, ouverte = null, avant = null, surFin = null;

    function sceneCourante() { return estEpub ? scenes[0] : scenes[actuelle]; }
    function nom(id) { return (donnees[id] || {}).nom || id; }
    function lues(id) { return ((donnees[id] || {}).citations || []).filter(function (c) { return c.lu <= Lecture.max; }); }
    function vider(e) { while (e.firstChild) e.removeChild(e.firstChild); }
    function dessin(id) {
      var s = DESSINS[id];
      if (!s) return null;
      copies++;
      s = s.replace(/f-([a-z]+)/g, 'f' + copies + '-$1');
      return doc.importNode(new DOMParser().parseFromString(s, 'image/svg+xml').documentElement, true);
    }
    function structure(sc) {
      if (sc.fiche) return sc.fiche;
      var f = el('div', { 'class': 'fiche', role: 'dialog', 'aria-modal': 'true' }, sc);
      var fond = el('div', { 'class': 'fiche-fond' }, f);
      f.carte = el('div', { 'class': 'fiche-carte', tabindex: '-1' }, f);
      fond.addEventListener('click', function () { fermer(); });
      f.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
      f.addEventListener('click', function (ev) { ev.stopPropagation(); });
      f.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') { ev.preventDefault(); fermer(); }
        else if (ev.key === 'Tab') {
          var b = $$('button', f.carte), i = b.indexOf(doc.activeElement);
          if (b.length && ev.shiftKey && i <= 0) { ev.preventDefault(); b[b.length - 1].focus(); }
          else if (b.length && !ev.shiftKey && i === b.length - 1) { ev.preventDefault(); b[0].focus(); }
        }
        ev.stopPropagation();
      });
      sc.fiche = f;
      return f;
    }
    function montrer(f) {
      if (!ouverte) avant = doc.activeElement;
      ouverte = f;
      f.classList.add('ouverte');
      requestAnimationFrame(function () { requestAnimationFrame(function () { f.classList.add('visible'); }); });
      Son.effet('papier');
      setTimeout(function () { var b = f.carte.querySelector('.fiche-actions button'); (b || f.carte).focus(); }, 80);
    }
    function fermer() {
      if (!ouverte) return;
      var f = ouverte; ouverte = null;
      f.classList.remove('visible');
      setTimeout(function () { if (ouverte !== f) f.classList.remove('ouverte'); }, calme ? 30 : 360);
      if (avant && avant.focus && doc.contains(avant)) { try { avant.focus(); } catch (e) { /* rien */ } }
      var cb = surFin; surFin = null;
      if (cb) cb();
    }
    // Examiner : on fait tourner le gros plan du doigt ; il revient en place quand on lâche.
    function examiner(zone) {
      var svg = zone.querySelector('svg'), x0 = 0, y0 = 0, tenu = false;
      if (!svg) return;
      zone.addEventListener('pointerdown', function (ev) {
        tenu = true; x0 = ev.clientX; y0 = ev.clientY; zone.classList.add('tenu');
        if (zone.setPointerCapture) { try { zone.setPointerCapture(ev.pointerId); } catch (e) { /* rien */ } }
      });
      zone.addEventListener('pointermove', function (ev) {
        if (!tenu || calme) return;
        var ry = Math.max(-70, Math.min(70, (ev.clientX - x0) * 0.45)), rx = Math.max(-40, Math.min(40, -(ev.clientY - y0) * 0.35));
        svg.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
      });
      function lacher() { if (!tenu) return; tenu = false; zone.classList.remove('tenu'); svg.style.transform = ''; }
      zone.addEventListener('pointerup', lacher);
      zone.addEventListener('pointercancel', lacher);
    }
    function ouvrir(id, options) {
      options = options || {};
      var sc = sceneCourante();
      if (!sc) return;
      var f = structure(sc), c = f.carte;
      vider(c);
      f.setAttribute('aria-label', nom(id));
      var visuel = el('div', { 'class': 'fiche-visuel', 'aria-hidden': 'true' }, c);
      var d = dessin(id);
      if (d) { visuel.appendChild(d); examiner(visuel); }
      el('p', { 'class': 'fiche-surtitre' }, c).textContent = options.nouveau ? 'Nouvel objet' : '';
      el('h2', { tabindex: '-1' }, c).textContent = nom(id);
      lues(id).forEach(function (q) {
        var b = el('blockquote', {}, c);
        b.appendChild(doc.createTextNode('« ' + q.texte + ' »'));
        el('cite', {}, b).textContent = q.chapitre;
      });
      var zone = el('div', { 'class': 'fiche-actions' }, c), a = actions[id];
      if (a) {
        var ba = el('button', { type: 'button' }, zone);
        ba.textContent = a.libelle;
        ba.addEventListener('click', function () {
          var faire = a.faire;
          avant = null; fermer();
          if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
          faire();
        });
      }
      var bf = el('button', { type: 'button' }, zone);
      if (a) bf.className = 'secondaire';
      bf.textContent = 'Fermer';
      bf.addEventListener('click', function () { fermer(); });
      if (options.fin) surFin = options.fin;
      montrer(f);
    }
    function panneau() {
      var sc = sceneCourante();
      if (!sc) return;
      var f = structure(sc), c = f.carte;
      vider(c);
      f.setAttribute('aria-label', 'Objets');
      el('p', { 'class': 'fiche-surtitre' }, c).textContent = 'Sur soi';
      el('h2', { tabindex: '-1' }, c).textContent = 'Objets';
      if (!sac.length) el('p', { 'class': 'fiche-vide' }, c).textContent = 'Aucun objet pour l’instant.';
      else {
        var liste = el('div', { 'class': 'fiche-liste' }, c);
        sac.forEach(function (id) {
          var b = el('button', { type: 'button' }, liste);
          var d = dessin(id);
          if (d) b.appendChild(d);
          el('span', {}, b).textContent = nom(id);
          b.addEventListener('click', function () { ouvrir(id); });
        });
      }
      var zone = el('div', { 'class': 'fiche-actions' }, c);
      var bf = el('button', { type: 'button' }, zone);
      bf.textContent = 'Fermer';
      bf.addEventListener('click', function () { fermer(); });
      montrer(f);
    }
    // L'annonce « Nouvel objet » : un bandeau qui descend, se touche pour ouvrir la fiche.
    function signaler(id) {
      var sc = sceneCourante();
      if (!sc) return;
      var t = el('button', { type: 'button', 'class': 'nouvel-objet' }, sc);
      var d = dessin(id);
      if (d) t.appendChild(d);
      var txt = el('span', {}, t);
      el('small', {}, txt).textContent = 'Nouvel objet';
      txt.appendChild(doc.createTextNode(nom(id)));
      var minuterie = setTimeout(retirer, 4800);
      function retirer() {
        clearTimeout(minuterie); t.classList.remove('vu');
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 700);
      }
      t.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
      t.addEventListener('click', function (ev) { ev.stopPropagation(); retirer(); ouvrir(id); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('vu'); }); });
      Son.effet('tinte');
    }
    function majBoutons(pulser) {
      $$('.barre .objets').forEach(function (b) {
        b.hidden = !sac.length;                  // l'interface n'apparaît que lorsqu'elle sert
        var c = b.querySelector('.compte');
        if (c) c.textContent = String(sac.length);
        b.setAttribute('aria-label', 'Objets : ' + sac.length);
        if (pulser) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
      });
    }
    return {
      initialiser: function (liste) { sac = liste.slice(); majBoutons(false); },
      ajouter: function (id, avecAnnonce) {
        if (sac.indexOf(id) < 0) sac.push(id);
        majBoutons(true);
        if (avecAnnonce) signaler(id);
        annoncer('Nouvel objet : ' + nom(id));
      },
      remplacer: function (ancien, nouveau) {
        var i = sac.indexOf(ancien);
        if (i >= 0) sac[i] = nouveau; else if (sac.indexOf(nouveau) < 0) sac.push(nouveau);
        majBoutons(true);
      },
      proposer: function (id, libelle, faire) { actions[id] = { libelle: libelle, faire: faire }; },
      retirerAction: function (id) { delete actions[id]; },
      ouvrir: ouvrir,
      panneau: panneau,
      presenter: function (id) { return new Promise(function (fin) { ouvrir(id, { nouveau: true, fin: fin }); }); },
      estOuverte: function () { return !!ouverte; }
    };
  })();
  var voile = el('div', { 'class': 'ui', style: 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity 700ms;z-index:50;' }, doc.body);
  function fondu(milieu, couleur) {
    voile.style.background = couleur || '#000';
    voile.style.opacity = '1';
    setTimeout(function () { milieu(); setTimeout(function () { voile.style.opacity = '0'; }, 120); }, calme ? 150 : 750);
  }
  function sceneSuivante(scene, couleur) {
    if (estEpub) { consigne(scene, 'Tournez la page', 1730); return; }
    var i = scenes.indexOf(scene);
    fondu(function () { aller(i + 1); }, couleur);
  }

  // ---------------------------------------------------------------- barre de commandes
  function installerBarre() {
    scenes.forEach(function (scene) {
      if (scene.getAttribute('data-scene') === 'seuil') return;
      var barre = el('div', { 'class': 'barre ui' }, scene);
      var bSon = el('button', { type: 'button', 'class': 'son', 'aria-pressed': String(Son.actif()) }, barre);
      bSon.textContent = 'Son';
      bSon.addEventListener('click', function (ev) {
        ev.stopPropagation(); Son.init();
        var a = Son.basculer();
        $$('.barre button.son').forEach(function (b) { b.setAttribute('aria-pressed', String(a)); });
      });
      var bObj = el('button', { type: 'button', 'class': 'objets' }, barre);
      bObj.appendChild(doc.createTextNode('Objets'));
      el('span', { 'class': 'compte', 'aria-hidden': 'true' }, bObj).textContent = '0';
      bObj.hidden = true;
      bObj.addEventListener('click', function (ev) { ev.stopPropagation(); Objets.panneau(); });
      var bLire = el('button', { type: 'button', title: 'Afficher tout le texte, sans animation' }, barre);
      bLire.textContent = 'Lecture';
      bLire.addEventListener('click', function (ev) {
        ev.stopPropagation(); reglages.lecture = true; ecrire('darshan.reglages', reglages); window.location.reload();
      });
    });
  }
  // En mode lecture, un bouton discret pour revenir au mode jeu.
  function installerBoutonJeu() {
    if (!reglages.lecture || !window.addEventListener) return;
    window.addEventListener('DOMContentLoaded', function () {
      var s = doc.querySelector('.scene');
      if (!s) return;
      var b = doc.createElement('button');
      b.type = 'button'; b.textContent = 'Revenir au mode jeu';
      b.setAttribute('style', 'position:absolute;top:3cqw;right:3cqw;z-index:20;font:inherit;font-size:2.8cqw;padding:1cqw 2.6cqw;border-radius:5cqw;border:0.15cqw solid rgba(244,197,106,.45);background:rgba(8,10,20,.6);color:#efe6d2;cursor:pointer;');
      b.addEventListener('click', function () { reglages.lecture = false; ecrire('darshan.reglages', reglages); window.location.reload(); });
      s.appendChild(b);
    });
  }

  // ================================================================ les scènes

  // Seuil : la page de titre. Le premier toucher ouvre la porte et autorise le son.
  demarreurs.seuil = function (scene) {
    var t = Etoiles(el('canvas', { 'class': 'toile' }, $('.decor', scene)), 90);
    t.hasard();
    var b = $('.bouton-porte', scene);
    if (b) b.addEventListener('click', function (ev) {
      ev.stopPropagation();
      Son.init(); Son.ambiance('cosmos'); Son.effet('souffle');
      sceneSuivante(scene);
    });
  };

  // Le poème d'ouverture, vers après vers, sous la voûte.
  demarreurs.poeme = function (scene) {
    var etoiles = Etoiles(el('canvas', { 'class': 'toile' }, $('.decor', scene)), 120);
    etoiles.hasard();
    var aube = el('div', { style: 'position:absolute;inset:0;opacity:0;transition:opacity 5s;background:radial-gradient(ellipse 90% 30% at 50% 102%, rgba(255,214,150,.75), rgba(255,170,90,.25) 45%, rgba(0,0,0,0) 75%);' }, $('.decor', scene));
    var recit = new Recit(scene, {
      garder: true,
      surTemps: function (j) { if (j === 5) { aube.style.opacity = '1'; etoiles.eclat(0.35); } },
      fin: function () { sceneSuivante(scene); }
    });
    setTimeout(function () { recit.avancer(); }, 900);
  };

  // Un ciel mouvant : sur le toit, la voûte tourne lentement autour du pôle.
  demarreurs.toit = function (scene) {
    var ciel = $('.ciel-tournant', scene);
    var etoiles = Etoiles(el('canvas', { 'class': 'toile' }, ciel), 110);
    var angle = 0, vivant = true;
    ciel.style.transformOrigin = '38% 8%';
    (function tourner() {
      if (!vivant) return;
      if (!calme) angle += 0.0016;
      ciel.style.transform = 'rotate(' + angle + 'deg) scale(1.28)';
      requestAnimationFrame(tourner);
    })();
    var carton = $('h1.chapitre', scene);
    var recit = new Recit(scene, {
      surTemps: function (j) {
        if (j === 1) {
          // « Des étincelles passent et se chassent » : deux filantes, l'une à la poursuite de l'autre
          etoiles.filer(150, 140, 0.42, 19, 300);
          etoiles.filer(80, 110, 0.42, 21, 900);
          etoiles.filer(640, 90, 0.62, 17, 2400);
        }
        if (j === 3) { etoiles.eclat(0.95); scene.classList.add('voix-du-pere'); }
      },
      fin: function () { vivant = false; sceneSuivante(scene); }
    });
    if (carton) {
      scene.appendChild(carton);
      carton.classList.add('carton');
      setTimeout(function () { carton.classList.add('vu'); }, 300);
      setTimeout(function () { carton.classList.add('range'); recit.avancer(); }, calme ? 600 : 2800);
    } else recit.avancer();
  };

  // La danse sur les tuiles : chaque toucher est une enjambée de cinq tuiles vers le pigeonnier.
  demarreurs.tuiles = function (scene) {
    var monde = $('.monde', scene);
    var cible = { x: 950, y: 1300 };
    var etape = 0, N = 5;
    function placer(k, bond) {
      var t = lisse(k / N), s = 1 + 1.35 * t;
      var tx = (W / 2 - cible.x) * t * 0.92, ty = (H * 0.62 - cible.y) * t * 0.9 - (bond || 0);
      monde.style.transform = 'translate(' + (tx / W * 100) + '%,' + (ty / H * 100) + '%) scale(' + s + ')';
    }
    monde.style.transformOrigin = (cible.x / W * 100) + '% ' + (cible.y / H * 100) + '%';
    monde.style.transition = calme ? 'none' : 'transform 520ms cubic-bezier(.3,1.4,.5,1)';
    placer(0);
    function danser() {
      var c = consigne(scene, 'Touchez en rythme pour enjamber les tuiles', 1000);
      return new Promise(function (ok) {
        function pas(ev) {
          if (Objets.estOuverte()) return;
          if (ev.type === 'keydown' && (TOUCHES.indexOf(ev.key) < 0 || toucheDeBouton(ev))) return;
          if (ev.type !== 'keydown' && !horsBarre(ev)) return;
          if (ev.cancelable) ev.preventDefault();
          etape++;
          Son.effet('saut');
          placer(etape, calme ? 0 : 40);
          setTimeout(function () { placer(etape, 0); }, 260);
          if (etape >= N) {
            c.effacer();
            scene.removeEventListener('pointerup', pas); doc.removeEventListener('keydown', pas);
            setTimeout(ok, 500);
          }
        }
        scene.addEventListener('pointerup', pas); doc.addEventListener('keydown', pas);
      });
    }
    var recit = new Recit(scene, {
      portes: { 2: danser },
      // « Ses lunettes fumées sur le nez » : premier objet du livre
      surTemps: function (j) { if (j === 2) Objets.ajouter('lunettes', true); },
      fin: function () { sceneSuivante(scene); }
    });
    setTimeout(function () { recit.avancer(); }, 500);
  };

  // Le pigeonnier : ôter les lunettes, les voir fondre en clé, ouvrir sur le soleil.
  demarreurs.pigeonnier = function (scene) {
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
    var halo = q('halo');
    var pose = { x: 600, y: 1700, s: 0.001, r: 0 };
    function placer(dx, dy) {
      objet.setAttribute('transform', 'translate(' + (pose.x + (dx || 0)) + ' ' + (pose.y + (dy || 0)) + ') rotate(' + pose.r + ') scale(' + pose.s + ')');
    }
    placer();
    var flot = el('div', { 'class': 'lumiere-flot ui' }, scene);
    var decor = $('.decor', scene);
    var fini = false;

    // Chaque geste attendu : un halo tout de suite, la consigne seulement après 2,5 s,
    // et le même geste proposé en bouton dans la fiche de l'objet.
    function oterLunettes() {
      var c = null;
      return anime(900, function (x) { pose.s = lisse(x); pose.y = 1700 - 160 * lisse(x); placer(); })
        .then(function () {
          halo.classList.add('actif');
          c = consigne(scene, 'Touchez les lunettes pour les ôter', 1260, 2500);
          return toucher(objet, { objet: 'lunettes', libelle: 'Ôter les lunettes' });
        })
        .then(function () {
          c.effacer(); halo.classList.remove('actif');
          return anime(700, function (x) { pose.y = 1540 - 120 * lisse(x); pose.s = 1 + 0.1 * lisse(x); placer(); });
        });
    }
    var vibration = false;
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
    function gesteVif() {
      halo.classList.add('actif');
      var c = consigne(scene, 'Un geste vif : glissez vers le haut, ou touchez', 1240, 2500);
      return toucher(scene, { objet: 'lunettes', libelle: 'Faire un geste vif' })
        .then(function () { c.effacer(); halo.classList.remove('actif'); });
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
    function glisserVersSerrure() {
      var c = consigne(scene, 'Portez la clé jusqu’à la serrure, ou touchez-la', 1220, 2500);
      cibleSerrure.setAttribute('opacity', '0.8');
      halo.classList.add('actif');
      return new Promise(function (ok) {
        var prise = false, depart = null, bouge = false, fait = false;
        function bas(ev) {
          if (Objets.estOuverte()) return;
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
          if (Objets.estOuverte()) return;
          if (ev.type === 'keydown') { if (TOUCHES.indexOf(ev.key) < 0 || toucheDeBouton(ev)) return; terminer(); return; }
          if (!prise) return;
          prise = false;
          if (!bouge || Math.hypot(pose.x - 820, pose.y - 1010) < 170) terminer();
        }
        function terminer() {
          if (fait) return;
          fait = true;
          Objets.retirerAction('cle');
          halo.classList.remove('actif');
          objet.removeEventListener('pointerdown', bas); objet.removeEventListener('pointermove', mouv);
          objet.removeEventListener('pointerup', haut); doc.removeEventListener('keydown', haut);
          c.effacer(); cibleSerrure.setAttribute('opacity', '0');
          var x0 = pose.x, y0 = pose.y, s0 = pose.s;
          anime(700, function (x) { var t = lisse(x); pose.x = x0 + (932 - x0) * t; pose.y = y0 + (1010 - y0) * t; pose.s = s0 + (0.42 - s0) * t; placer(); })
            .then(function () { Son.effet('cle'); ok(); });
        }
        objet.style.touchAction = 'none';
        objet.addEventListener('pointerdown', bas); objet.addEventListener('pointermove', mouv);
        objet.addEventListener('pointerup', haut); doc.addEventListener('keydown', haut);
        Objets.proposer('cle', 'Porter la clé à la serrure', terminer);
      });
    }
    function laisserPasserLeJour() {
      Son.effet('jour');
      return anime(2600, function (x) { jours.setAttribute('opacity', 0.15 + 0.85 * lisse(x)); })
        .then(function () {
          var t0 = null;
          (function vacille(t) {
            if (fini) return;
            if (t0 === null) t0 = t;
            if (!calme) jours.setAttribute('opacity', 0.85 + 0.15 * Math.sin(((t || 0) - t0) / 260));
            requestAnimationFrame(vacille);
          })(0);
        });
    }
    function tourDePoignet() {
      halo.classList.add('actif');
      var c = consigne(scene, 'Un tour de poignet : touchez la clé', 1180, 2500);
      return toucher(objet, { objet: 'cle', libelle: 'Donner un tour de poignet' }).then(function () {
        c.effacer(); halo.classList.remove('actif'); Son.effet('tour');
        return anime(650, function (x) { pose.r = -90 * lisse(x); placer(); });
      });
    }
    function deconsolider() {
      Son.effet('grince');
      return anime(1200, function (x) {
        var a = calme ? 0 : Math.sin(x * 40) * (1 - x) * 6;
        decor.style.transform = 'translate(' + a + 'px,' + (a / 2) + 'px)';
      }).then(function () { decor.style.transform = ''; });
    }
    function pousser() {
      var c = consigne(scene, 'Poussez la porte', 1180, 1800);
      return toucher(scene).then(function () {
        c.effacer(); Son.effet('souffle'); fini = true;
        decor.style.transition = calme ? 'none' : 'transform 2.2s ease-in';
        decor.style.transform = 'scale(1.6)';
        return anime(2100, function (x) { flot.style.opacity = lisse(x); });
      });
    }
    var recit = new Recit(scene, {
      portes: { 2: oterLunettes, 3: gesteVif, 6: glisserVersSerrure, 7: tourDePoignet },
      surTemps: function (j) {
        if (j === 2) vibrer();
        // la clé née de la fonte entre dans les objets, et sa fiche se présente une fois
        if (j === 3) return fondreEnCle().then(function () { Objets.remplacer('lunettes', 'cle'); return Objets.presenter('cle'); });
        if (j === 6) return laisserPasserLeJour();
        if (j === 7) return deconsolider();
      },
      fin: function () {
        pousser().then(function () { sceneSuivante(scene, '#fff6e4'); });
      }
    });
    setTimeout(function () { recit.avancer(); }, 600);
  };

  // Aluva : l'éblouissement, la poussière dans la lumière, le fleuve.
  demarreurs.aluva = function (scene) {
    var p = Poussiere(el('canvas', { 'class': 'toile' }, $('.decor', scene)));
    var eblouir = el('div', { 'class': 'lumiere-flot ui', style: 'opacity:1;transition:opacity 3.5s ease-out;' }, scene);
    setTimeout(function () { eblouir.style.opacity = '0'; }, 80);
    var recit = new Recit(scene, {
      surTemps: function (j) { if (j === 0) p.bouffee(); },
      fin: function () {
        var f = $('.fin-extrait', scene);
        if (f) f.classList.add('vu');
        ecrire('darshan.portes', ['pigeonnier-aluva']);
      }
    });
    setTimeout(function () { recit.avancer(); }, 1600);
    var bCarnet = $('.ouvrir-carnet', scene), carnet = $('.carnet', scene);
    if (bCarnet && carnet) {
      bCarnet.addEventListener('click', function (ev) { ev.stopPropagation(); carnet.classList.add('ouvert'); });
      carnet.addEventListener('click', function (ev) { ev.stopPropagation(); carnet.classList.remove('ouvert'); });
    }
    var bRe = $('.recommencer', scene);
    if (bRe) bRe.addEventListener('click', function (ev) { ev.stopPropagation(); window.location.reload(); });
  };

  // ---------------------------------------------------------------- départ
  function depart() {
    installerBarre();
    if (estEpub) {
      // dans l'EPUB, une page = une scène ; le son démarre au premier toucher de la page
      var s = scenes[0];
      if (!s) return;
      s.classList.add('active');
      entrerDansScene(s);
      var a = s.getAttribute('data-son');
      if (a) Son.ambiance(a);
      doc.addEventListener('pointerdown', function premier() {
        doc.removeEventListener('pointerdown', premier);
        Son.init();
      });
      var nom = s.getAttribute('data-scene');
      if (demarreurs[nom]) demarreurs[nom](s);
      return;
    }
    aller(0);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', depart); else depart();
})();
