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
  // Une fiche ouverte ou un balayage en cours retiennent les gestes et la lecture.
  function bloque() { return Objets.estOuverte() || Transitions.occupe(); }

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
      },
      // éclat d'un objet qui se métamorphose : un souffle qui monte, un choc sourd, l'anneau du métal
      eclat: function (t) {
        var s = ctx.createBufferSource(); s.buffer = bruit('blanc');
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1;
        f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(5200, t + 0.38);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.46);
        s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + 0.5);
        var t1 = t + 0.5;
        var o = ctx.createOscillator(); o.frequency.setValueAtTime(120, t1); o.frequency.exponentialRampToValueAtTime(42, t1 + 0.3);
        var g2 = ctx.createGain(); env(g2, t1, 0.004, 0.7, 0.4); o.connect(g2); g2.connect(bus); o.start(t1); o.stop(t1 + 0.5);
        [1, 2.76, 5.4, 8.93].forEach(function (m, i) {
          var p = ctx.createOscillator(); p.frequency.value = 587 * m;
          var gp = ctx.createGain(); env(gp, t1, 0.002, 0.09 / (i + 1), 1.6 - i * 0.3); p.connect(gp); gp.connect(bus); p.start(t1); p.stop(t1 + 1.8);
        });
      },
      // balayage à l'encre : trois coups de pinceau, secs
      balai: function (t) {
        [0, 0.15, 0.3].forEach(function (d, i) {
          var s = ctx.createBufferSource(); s.buffer = bruit('rose');
          var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
          f.frequency.setValueAtTime(700 + 300 * i, t + d); f.frequency.exponentialRampToValueAtTime(2600 + 400 * i, t + d + 0.3);
          var g = ctx.createGain(); g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(0.2, t + d + 0.08); g.gain.exponentialRampToValueAtTime(0.0005, t + d + 0.36);
          s.connect(f); f.connect(g); g.connect(bus); s.start(t + d); s.stop(t + d + 0.4);
        });
      },
      // obturateur (le monde photographié de Julie) : deux déclics rapprochés
      declic: function (t) {
        [0, 0.07].forEach(function (d, i) {
          var s = ctx.createBufferSource(); s.buffer = bruit('blanc');
          var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = i ? 2500 : 1400;
          var g = ctx.createGain(); env(g, t + d, 0.001, i ? 0.22 : 0.3, 0.035); s.connect(f); f.connect(g); g.connect(bus); s.start(t + d); s.stop(t + d + 0.08);
          var o = ctx.createOscillator(); o.frequency.value = i ? 180 : 120;
          var g2 = ctx.createGain(); env(g2, t + d, 0.001, 0.2, 0.04); o.connect(g2); g2.connect(bus); o.start(t + d); o.stop(t + d + 0.08);
        });
      },
      // bandes de chapitre : des souffles brefs, décalés
      bandes: function (t) {
        for (var i = 0; i < 4; i++) {
          var d = i * 0.06, s = ctx.createBufferSource(); s.buffer = bruit('blanc');
          var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2;
          f.frequency.setValueAtTime(900 + i * 500, t + d); f.frequency.exponentialRampToValueAtTime(300 + i * 200, t + d + 0.2);
          var g = ctx.createGain(); env(g, t + d, 0.02, 0.16, 0.18); s.connect(f); f.connect(g); g.connect(bus); s.start(t + d); s.stop(t + d + 0.3);
        }
      },
      // le titre qui claque sur sa bande
      coup: function (t) {
        var o = ctx.createOscillator(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
        var g = ctx.createGain(); env(g, t, 0.002, 0.55, 0.25); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.35);
        var s = ctx.createBufferSource(); s.buffer = bruit('blanc');
        var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
        var g2 = ctx.createGain(); env(g2, t, 0.001, 0.12, 0.5); s.connect(f); f.connect(g2); g2.connect(bus); s.start(t); s.stop(t + 0.6);
      },
      // iris : une onde grave qui se referme
      iris: function (t) {
        var o = ctx.createOscillator(); o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.7);
        var g = ctx.createGain(); env(g, t, 0.15, 0.18, 0.6); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.9);
      },
      // frisson : un objet change d'état, un éclat de verre bref
      frisson: function (t) {
        [2637, 3520, 4186].forEach(function (f0, i) {
          var o = ctx.createOscillator(); o.frequency.value = f0;
          var g = ctx.createGain(); env(g, t + i * 0.03, 0.002, 0.045, 0.3); o.connect(g); g.connect(bus);
          o.start(t + i * 0.03); o.stop(t + i * 0.03 + 0.4);
        });
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
      if (soi.enAttente || soi.fini || bloque() || toucheDeBouton(ev)) return;
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
        if (bloque()) return;
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
  // La scène démarre sous son balayage d'entrée ; le texte attend qu'il soit fini.
  function quandEntree(sc) { return sc.entreeFaite || Promise.resolve(); }
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
  function dessin(id) {
    var s = DESSINS[id];
    if (!s) return null;
    copies++;
    s = s.replace(/f-([a-z]+)/g, 'f' + copies + '-$1');
    return doc.importNode(new DOMParser().parseFromString(s, 'image/svg+xml').documentElement, true);
  }

  // ---------------------------------------------------------------- transitions : balayages, éclats, envols
  // Grammaire (docs/darshan-decoupage.md) : fondu (même lieu, même moment) ; encre (Darshan
  // change de lieu) ; bandes (ouverture de chapitre, façon Persona) ; iris (vision, petite
  // porte) ; porte (on franchit une porte) ; lumiere (éblouissement) ; obturateur (le monde
  // photographié de Julie) ; glissement (son téléphone). Chaque balayage a deux moitiés :
  // couvrir la scène qui part, découvrir celle qui arrive. L'édition web joue les deux ; dans
  // l'EPUB, où chaque page est un document à part, la page joue la seconde en s'ouvrant.
  // Les changements d'état d'un objet ont les leurs : frisson (petit changement), éclat
  // (métamorphose), envol (l'objet rejoint le sac). Mouvement réduit : des fondus courts,
  // rien ne glisse ni ne tourne.
  var NS = 'http://www.w3.org/2000/svg';
  var ENCRE = '#07091a', SINDOOR = '#c9302c', OR = '#f4c56a', CREME = '#fff4de';
  function svgEl(nom, attrs, parent) {
    var e = doc.createElementNS(NS, nom);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  function retirer(e) { if (e && e.parentNode) e.parentNode.removeChild(e); }
  function attendre(ms) { return new Promise(function (ok) { setTimeout(ok, calme ? Math.min(ms, 150) : ms); }); }
  function borne(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function vif(t) { return 1 - Math.pow(1 - t, 3); }            // part vite, se pose
  function lent(t) { return t * t * t; }                        // part lentement, file
  function ressort(t, c) { c = c || 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function elan(t) { var c = 1.4; return (c + 1) * t * t * t - c * t * t; }
  function etoile(r) {    // étoile à quatre branches, comme ✦
    var k = r * 0.28;
    return 'M0,' + (-r) + 'L' + k + ',' + (-k) + 'L' + r + ',0L' + k + ',' + k + 'L0,' + r + 'L' + (-k) + ',' + k + 'L' + (-r) + ',0L' + (-k) + ',' + (-k) + 'Z';
  }
  function plusLoin(c) {  // du point au coin le plus éloigné de la scène
    return Math.max(Math.hypot(c[0], c[1]), Math.hypot(W - c[0], c[1]), Math.hypot(c[0], H - c[1]), Math.hypot(W - c[0], H - c[1])) + 30;
  }
  function rect(e, r) {
    e.setAttribute('x', r[0]); e.setAttribute('y', r[1]);
    e.setAttribute('width', Math.max(0, r[2])); e.setAttribute('height', Math.max(0, r[3]));
  }
  function melange(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  var PLEIN = [-80, -80, W + 160, H + 160];
  // Hasard reproductible (le même pinceau à chaque lecture) et ondulations lissées entre -1 et 1.
  function hasard(graine) { var x = graine; return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }
  function ondes(n, rnd, pas) {
    var v = [], a = rnd() * 2 - 1, b = rnd() * 2 - 1;
    for (var i = 0; i < n; i++) {
      if (i % pas === 0) { a = b; b = rnd() * 2 - 1; }
      var t = (i % pas) / pas;
      v.push(a + (b - a) * t * t * (3 - 2 * t));
    }
    return v;
  }
  function trace(points) { return 'M' + points.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z'; }
  // Le corps d'un coup de pinceau, couché sur l'axe x de 0 à L : bords ondulés et rugueux.
  function formeDeCoup(L, ep, rnd) {
    var n = 90, haut = [], bas = [], onde1 = ondes(n + 1, rnd, 15), onde2 = ondes(n + 1, rnd, 15);
    for (var i = 0; i <= n; i++) {
      var u = i / n, demi = ep / 2 * (0.86 + 0.14 * Math.sin(u * Math.PI));
      haut.push([u * L, -demi - onde1[i] * 34 - (rnd() - 0.5) * 18]);
      bas.push([u * L, demi + onde2[i] * 34 + (rnd() - 0.5) * 18]);
    }
    return trace(haut.concat(bas.reverse()));
  }
  // Un poil sec : une traînée fine, effilée aux deux bouts, à distance `y` de l'axe.
  function poil(L, y, rnd, u0, u1, epaisseur) {
    var n = 16, h = [], b = [], phase = rnd() * 6;
    u1 = Math.min(1, u1);
    for (var j = 0; j <= n; j++) {
      var u = u0 + (u1 - u0) * j / n, e = epaisseur * Math.sin(Math.PI * j / n), yy = y + Math.sin(u * 9 + phase) * 10;
      h.push([u * L, yy - e / 2]); b.push([u * L, yy + e / 2]);
    }
    return trace(h.concat(b.reverse()));
  }

  // Chaque balayage dessine dans un calque SVG de 1200 x 1800 et renvoie ses deux moitiés,
  // réglées par t de 0 à 1, leurs durées, et leurs sons.
  var Balayages = {
    fondu: function (s, o) {
      var r = svgEl('rect', { fill: o.couleur || '#000' }, s);
      rect(r, PLEIN);
      return {
        duree: [600, 650],
        couvrir: function (t) { r.setAttribute('opacity', lisse(t)); },
        decouvrir: function (t) { r.setAttribute('opacity', 1 - lisse(t)); }
      };
    },
    // Trois coups de pinceau, alternés. Chaque coup est une forme d'encre aux bords irréguliers,
    // bordée de poils secs, dessinée une fois ; un masque la découvre au fil du geste, et le
    // bout du masque est arrondi comme la pointe d'un pinceau (puis comme sa fin, au retrait).
    encre: function (s, o) {
      var couleur = o.couleur || ENCRE, coups = [], defs = svgEl('defs', {}, s), rnd = hasard(7), ep = 940;
      [350, 1050, 1750].forEach(function (c, k) {
        var a = [-260, c + 66], b = [1460, c - 373];         // le long de y = c - 0,2556 x
        if (k === 1) { var z = a; a = b; b = z; }
        var L = Math.hypot(b[0] - a[0], b[1] - a[1]), angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        var id = 'coup' + (++copies), clip = svgEl('clipPath', { id: id, clipPathUnits: 'userSpaceOnUse' }, defs);
        var masque = svgEl('rect', { x: -ep, y: -ep, width: 0, height: 2 * ep }, clip);
        var pointe = svgEl('ellipse', { cx: 0, cy: 0, rx: ep * 0.28, ry: ep * 0.62 }, clip);
        var g = svgEl('g', { transform: 'translate(' + a[0] + ' ' + a[1] + ') rotate(' + angle.toFixed(2) + ')' }, s);
        var corps = svgEl('g', { 'clip-path': 'url(#' + id + ')' }, g);
        svgEl('path', { d: formeDeCoup(L, ep, rnd), fill: couleur }, corps);
        for (var i = 0; i < 4; i++) svgEl('path', { d: poil(L, ep * (0.1 + 0.2 * i) * (i % 2 ? 1 : -1), rnd, 0.1, 0.9, 6 + 8 * rnd()), fill: '#161a33', opacity: 0.7 }, corps);
        for (var j = 0; j < 10; j++) {
          var cote = j % 2 ? 1 : -1;
          svgEl('path', { d: poil(L, cote * (ep / 2 + 6 + rnd() * 50), rnd, rnd() * 0.35, 0.3 + rnd() * 0.65, 5 + rnd() * 13),
            fill: (k === 1 && j === 4) ? SINDOOR : couleur }, corps);
        }
        coups.push({ masque: masque, pointe: pointe, L: L, rx: ep * 0.28, debut: k * 0.2, fin: k * 0.2 + 0.6 });
      });
      function poser(t, sortie) {
        coups.forEach(function (c) {
          var x = lisse(borne((t - c.debut) / (c.fin - c.debut))), bord = -c.rx + x * (c.L + 2 * c.rx);
          if (sortie) { c.masque.setAttribute('x', bord); c.masque.setAttribute('width', Math.max(0, c.L + ep - bord)); }
          else { c.masque.setAttribute('x', -ep); c.masque.setAttribute('width', Math.max(0, bord + ep)); }
          c.pointe.setAttribute('cx', bord);
        });
      }
      return {
        duree: [780, 820], sons: ['balai', 'balai'],
        couvrir: function (t) { poser(t, false); },
        decouvrir: function (t) { poser(t, true); }
      };
    },
    // des bandes obliques qui claquent l'une après l'autre, avec le titre du chapitre
    bandes: function (s, o) {
      var pente = 150, defs = svgEl('defs', {}, s), id = 'trame' + (++copies), titre = null;
      var motif = svgEl('pattern', { id: id, width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(20)' }, defs);
      svgEl('circle', { cx: 9, cy: 9, r: 4.2, fill: OR, opacity: 0.45 }, motif);
      var plan = [[-220, 330, ENCRE], [110, 100, SINDOOR], [210, 330, ENCRE, 'trame'], [540, 34, OR], [574, 470, ENCRE, 'titre'],
                  [1044, 70, SINDOOR], [1114, 360, ENCRE, 'trame'], [1474, 620, ENCRE]];
      var bandes = plan.map(function (b, i) {
        var g = svgEl('g', {}, s), y0 = b[0], y1 = b[0] + b[1] + 40;   // chaque bande glisse sous la suivante
        var pts = '-220,' + (y0 + pente) + ' 1420,' + (y0 - pente) + ' 1420,' + (y1 - pente) + ' -220,' + (y1 + pente);
        svgEl('polygon', { points: pts, fill: b[2] }, g);
        if (b[3] === 'trame') svgEl('polygon', { points: pts, fill: 'url(#' + id + ')' }, g);
        if (b[3] === 'titre' && o.titre) titre = ecrireTitre(g, o.titre, b[0] + b[1] / 2);
        return { g: g, sens: i % 2 ? 1 : -1, i: i };
      });
      function poser(t, sortie) {
        bandes.forEach(function (b) {
          var x = borne((t - b.i * 0.05) / 0.62);
          var dx = sortie ? -b.sens * 1700 * elan(x) : b.sens * 1700 * (1 - ressort(x));
          b.g.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' 0)');
        });
      }
      return {
        duree: [640, 680], sons: ['bandes', 'bandes'],
        couvrir: function (t) { poser(t, false); },
        decouvrir: function (t) { poser(t, true); },
        avant: function () {    // le titre claque sur sa bande et reste un instant
          if (!titre) return attendre(150);
          Son.effet('coup');
          return anime(340, function (x) {
            titre.setAttribute('transform', 'scale(' + (2.3 - 1.3 * ressort(x, 2.2)).toFixed(3) + ')');
            titre.setAttribute('opacity', borne(x * 3));
          }).then(function () { return attendre(1300); });
        }
      };
    },
    // un cercle se referme sur un point, puis s'ouvre ailleurs
    iris: function (s, o) {
      var de = o.de || [600, 900], vers = o.vers || [600, 900];
      var voile = svgEl('path', { fill: o.couleur || '#02030a', 'fill-rule': 'evenodd' }, s);
      var anneaux = [svgEl('circle', { fill: 'none', stroke: OR, 'stroke-width': 8 }, s),
                     svgEl('circle', { fill: 'none', stroke: SINDOOR, 'stroke-width': 3 }, s)];
      function trou(c, r) {
        var d = 'M-80,-80H' + (W + 80) + 'V' + (H + 80) + 'H-80Z';
        if (r > 0.5) d += 'M' + (c[0] - r) + ',' + c[1] + 'a' + r + ',' + r + ' 0 1,0 ' + 2 * r + ',0a' + r + ',' + r + ' 0 1,0 ' + (-2 * r) + ',0Z';
        voile.setAttribute('d', d);
        anneaux.forEach(function (a, i) {
          a.setAttribute('cx', c[0]); a.setAttribute('cy', c[1]); a.setAttribute('r', Math.max(0, r + i * 16));
          a.setAttribute('opacity', r > 6 ? 0.9 : 0);
        });
      }
      var R1 = plusLoin(de), R2 = plusLoin(vers);
      return {
        duree: [760, 900], sons: ['iris', null], pause: 260,
        couvrir: function (t) { trou(de, R1 * (1 - lisse(t))); },
        decouvrir: function (t) { trou(vers, R2 * lisse(t)); }
      };
    },
    // la lumière jaillit d'une embrasure et gagne l'écran ; la scène suivante apparaît dans
    // une porte qui s'élargit jusqu'à nous
    porte: function (s, o) {
      var de = o.de || [520, 760, 160, 280], vers = o.vers || [470, 560, 260, 560], clair = o.couleur || '#fff8ea';
      var halo = svgEl('rect', { fill: '#ffd98a', opacity: 0 }, s);
      var plein = svgEl('rect', { fill: clair, opacity: 0 }, s);
      var cadre = svgEl('path', { fill: clair, 'fill-rule': 'evenodd', opacity: 0 }, s);
      var bord = svgEl('rect', { fill: 'none', stroke: OR, 'stroke-width': 6, opacity: 0 }, s);
      return {
        duree: [900, 1250], sons: ['souffle', null], pause: 160,
        couvrir: function (t) {
          var a = lisse(borne(t / 0.3)), b = lent(borne((t - 0.2) / 0.8));
          var r = melange(de, PLEIN, b), m = 40 + 160 * a;
          rect(plein, r); plein.setAttribute('opacity', a);
          rect(halo, [r[0] - m, r[1] - m, r[2] + 2 * m, r[3] + 2 * m]); halo.setAttribute('opacity', 0.55 * a * (1 - b));
        },
        decouvrir: function (t) {
          var r = melange(vers, [-W, -H, 3 * W, 3 * H], lent(t));
          cadre.setAttribute('d', 'M-80,-80H' + (W + 80) + 'V' + (H + 80) + 'H-80Z M' + r[0] + ',' + r[1] + 'h' + r[2] + 'v' + r[3] + 'h' + (-r[2]) + 'Z');
          cadre.setAttribute('opacity', 1 - lisse(borne((t - 0.6) / 0.4)));
          rect(bord, r); bord.setAttribute('opacity', 0.9 * (1 - borne(t / 0.7)));
        }
      };
    },
    // l'éblouissement : une lumière qui s'étend, puis se dissipe
    lumiere: function (s, o) {
      var de = o.de || [600, 900], id = 'eblouir' + (++copies);
      var g = svgEl('radialGradient', { id: id }, svgEl('defs', {}, s));
      svgEl('stop', { offset: '0', 'stop-color': '#ffffff' }, g);
      svgEl('stop', { offset: '0.55', 'stop-color': '#fff3cf' }, g);
      svgEl('stop', { offset: '1', 'stop-color': '#ffe3a0', 'stop-opacity': '0' }, g);
      var c = svgEl('circle', { cx: de[0], cy: de[1], r: 1, fill: 'url(#' + id + ')' }, s);
      var plein = svgEl('rect', { fill: '#fffaf0', opacity: 0 }, s);
      rect(plein, PLEIN);
      var R = plusLoin(de) * 1.6;
      return {
        duree: [900, 2000], sons: ['souffle', null],
        couvrir: function (t) { c.setAttribute('r', R * lent(t) + 1); plein.setAttribute('opacity', lisse(borne((t - 0.55) / 0.45))); },
        decouvrir: function (t) { c.setAttribute('r', 1); plein.setAttribute('opacity', 1 - vif(t)); }
      };
    },
    // le monde de Julie : les lames d'un obturateur se ferment, puis s'ouvrent sur la photo suivante
    obturateur: function (s, o) {
      var n = 7, C = o.de || [600, 900], R = plusLoin(C), lames = [];
      for (var i = 0; i < n; i++) {
        lames.push(svgEl('polygon', { fill: i % 2 ? '#1c1f25' : '#15171c', stroke: '#4a505c', 'stroke-width': 4, 'stroke-linejoin': 'round' }, s));
      }
      function ouverture(r) {
        var torsion = 0.9 * (1 - r / R), L = 3000;
        lames.forEach(function (l, i) {
          var a = i * 2 * Math.PI / n + torsion, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
          function p(u, v) { return (C[0] + ux * u + vx * v).toFixed(1) + ',' + (C[1] + uy * u + vy * v).toFixed(1); }
          l.setAttribute('points', [p(r, -L), p(r, L), p(r + L, L), p(r + L, -L)].join(' '));
        });
      }
      return {
        duree: [420, 520], sons: ['declic', null], pause: 90,
        couvrir: function (t) { ouverture(R * (1 - lisse(t))); },
        decouvrir: function (t) { ouverture(R * lisse(t)); }
      };
    },
    // le téléphone de Julie : un panneau glisse, comme on passe d'une photo à l'autre
    glissement: function (s, o) {
      var sens = o.sens || -1, g = svgEl('g', {}, s);
      rect(svgEl('rect', { fill: o.couleur || '#101114' }, g), PLEIN);
      rect(svgEl('rect', { fill: '#000', opacity: 0.35 }, g), [sens < 0 ? -116 : W + 80, -80, 36, H + 160]);
      function x(v) { g.setAttribute('transform', 'translate(' + v.toFixed(1) + ' 0)'); }
      return {
        duree: [360, 420], sons: ['papier', null],
        couvrir: function (t) { x(-sens * (W + 200) * (1 - lisse(t))); },
        decouvrir: function (t) { x(sens * (W + 200) * lisse(t)); }
      };
    }
  };

  // Le titre d'un chapitre, posé sur sa bande : face crème, contour d'encre, ombre vermillon.
  function ecrireTitre(g, texte, y) {
    var pose = svgEl('g', { transform: 'translate(600 ' + y + ') rotate(-10.4) skewX(-8)' }, g);
    var titre = svgEl('g', { opacity: 0 }, pose);
    var taille = Math.min(132, Math.round(2000 / Math.max(8, texte.length)));
    function ligne(attrs) {
      var t = svgEl('text', { dy: '0.32em', 'text-anchor': 'middle', 'font-family': 'Unna, Georgia, serif', 'font-style': 'italic', 'font-size': taille }, titre);
      for (var k in attrs) { if (attrs.hasOwnProperty(k)) t.setAttribute(k, attrs[k]); }
      t.textContent = texte;
    }
    ligne({ x: 11, y: 11, fill: SINDOOR });
    ligne({ x: 0, y: 0, fill: CREME, stroke: ENCRE, 'stroke-width': 4, 'paint-order': 'stroke' });
    return titre;
  }

  var Transitions = (function () {
    var occupe = 0;
    function voile(scene, classe) {
      return svgEl('svg', { 'class': classe || 'tr', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
    }
    function sonner(m, i) { var n = m.sons && m.sons[i]; if (n) Son.effet(n); }
    // L'entrée d'une scène : data-entree="type x y…" (les nombres : où s'ouvre le balayage).
    function lireEntree(scene) {
      var a = (scene.getAttribute('data-entree') || '').split(/\s+/).filter(Boolean);
      if (!a.length) return null;
      var o = { type: a[0] }, nombres = a.slice(1).map(Number), h = scene.querySelector('h1.chapitre');
      if (nombres.length) o.vers = nombres;
      if (h) o.titre = h.textContent;
      return o;
    }
    function fabriquer(scene, o) {
      var type = (calme || !Balayages[o.type]) ? 'fondu' : o.type, s = voile(scene);
      return { s: s, m: Balayages[type](s, o) };
    }
    // Couvre tout de suite la scène qui arrive ; renvoie de quoi la découvrir.
    function preparer(scene, o) {
      var b = fabriquer(scene, o), fin = null;
      b.m.decouvrir(0);
      occupe++;
      scene.entreeFaite = new Promise(function (ok) { fin = ok; });
      return function () {
        return Promise.resolve(b.m.avant ? b.m.avant() : null)
          .then(function () { sonner(b.m, 1); return anime(b.m.duree[1], b.m.decouvrir); })
          .then(function () { retirer(b.s); occupe--; fin(); });
      };
    }
    // Une page d'EPUB peut être préparée hors de la vue : l'entrée attend qu'elle se montre.
    function quandVisible() {
      return new Promise(function (ok) {
        function voir() { requestAnimationFrame(function () { ok(); }); }
        if (!doc.hidden) { voir(); return; }
        doc.addEventListener('visibilitychange', function f() {
          if (doc.hidden) return;
          doc.removeEventListener('visibilitychange', f); voir();
        });
      });
    }
    // Petit changement d'état d'un objet : une étoile et des rayons, un tintement.
    function frisson(scene, x, y, r) {
      if (calme) return Promise.resolve();
      var s = voile(scene, 'tr tr-leger'), g = svgEl('g', {}, s);
      [true, false].forEach(function (ombre) {
        for (var i = 0; i < 12; i++) {
          var a = i * Math.PI / 6 + 0.26, long = i % 2 ? 0.75 : 1;
          svgEl('line', { x1: Math.cos(a) * r * 0.45, y1: Math.sin(a) * r * 0.45, x2: Math.cos(a) * r * long, y2: Math.sin(a) * r * long,
            stroke: ombre ? ENCRE : (i % 3 ? OR : CREME), 'stroke-width': (i % 2 ? 5 : 10) + (ombre ? 8 : 0), 'stroke-linecap': 'round',
            opacity: ombre ? 0.35 : 1 }, g);
        }
        svgEl('path', { d: etoile(r * 0.34), fill: ombre ? ENCRE : CREME, opacity: ombre ? 0.35 : 1,
          transform: ombre ? 'scale(1.18)' : '' }, g);
      });
      Son.effet('frisson');
      return anime(560, function (t) {
        var e = vif(t);
        g.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + (18 * e).toFixed(2) + ') scale(' + (0.5 + 0.9 * e).toFixed(3) + ')');
        g.setAttribute('opacity', String(1 - t * t));
      }).then(function () { retirer(s); });
    }
    // Métamorphose d'un objet : des bandes qui claquent, l'objet qui arrive en tournoyant, son
    // nom en grand, et le fragment du livre qui la raconte. Le style est dans moteur.css (.eclat).
    function eclat(scene, o) {
      var e = el('div', { 'class': 'eclat' + (calme ? ' calme' : ''), 'aria-hidden': 'true' }, scene);
      ['b4', 'b1', 'b2', 'b3', 'b5'].forEach(function (c) { el('div', { 'class': 'eclat-bande ' + c }, e); });
      el('div', { 'class': 'eclat-trame' }, e);
      var ciel = svgEl('svg', { 'class': 'eclat-etoiles', viewBox: '0 0 ' + W + ' ' + H }, e);
      [[170, 420, 46], [1010, 330, 60], [1080, 1180, 38], [240, 1210, 30], [640, 250, 26], [900, 1420, 22], [120, 820, 20]].forEach(function (p, i) {
        var st = svgEl('path', { d: etoile(p[2]), fill: i % 3 ? CREME : OR }, svgEl('g', { transform: 'translate(' + p[0] + ' ' + p[1] + ')' }, ciel));
        st.style.animationDelay = (420 + i * 70) + 'ms';
      });
      var v = el('div', { 'class': 'eclat-objet' }, e), d = dessin(o.objet);
      if (d) v.appendChild(d);
      el('p', { 'class': 'eclat-nom' }, e).textContent = o.nom;
      if (o.fragment) el('p', { 'class': 'eclat-fragment' }, e).textContent = '« ' + o.fragment + ' »';
      occupe++;
      Son.effet('eclat');
      requestAnimationFrame(function () { requestAnimationFrame(function () { e.classList.add('joue'); }); });
      // en mouvement réduit, rien ne bouge, mais le nom et la phrase restent le temps d'être lus
      return new Promise(function (ok) { setTimeout(ok, calme ? 1500 : 2200); }).then(function () {
        e.classList.add('sort');
        return attendre(600);
      }).then(function () { retirer(e); occupe--; });
    }
    // L'objet quitte son annonce et vole jusqu'au bouton « Objets ».
    function envol(scene, source, cible, id) {
      var rs = scene.getBoundingClientRect(), a = source.getBoundingClientRect(), b = cible.getBoundingClientRect();
      if (calme || !rs.width || !a.width || !b.width) return Promise.resolve();
      var vol = el('div', { 'class': 'envol', 'aria-hidden': 'true' }, scene), d = dessin(id);
      if (d) vol.appendChild(d);
      var x0 = a.left - rs.left, y0 = a.top - rs.top;
      var x1 = b.left - rs.left + (b.width - a.width) / 2, y1 = b.top - rs.top + (b.height - a.height) / 2;
      var cx = (x0 + x1) / 2 + rs.width * 0.08, cy = Math.min(y0, y1) - rs.height * 0.1;
      var fin = Math.max(0.3, Math.min(1, b.height / a.height));
      vol.style.width = (a.width / rs.width * 100) + '%';
      vol.style.height = (a.height / rs.height * 100) + '%';
      return anime(760, function (t) {
        var e = lisse(t), u = 1 - e;
        var x = u * u * x0 + 2 * u * e * cx + e * e * x1, y = u * u * y0 + 2 * u * e * cy + e * e * y1;
        vol.style.left = (x / rs.width * 100) + '%';
        vol.style.top = (y / rs.height * 100) + '%';
        vol.style.transform = 'rotate(' + (-40 * Math.sin(e * Math.PI)).toFixed(2) + 'deg) scale(' + (1 + (fin - 1) * e).toFixed(3) + ')';
        vol.style.opacity = String(t < 0.85 ? 1 : (1 - t) / 0.15);
      }).then(function () { retirer(vol); });
    }
    return {
      occupe: function () { return occupe > 0; },
      // Édition web : couvrir la scène qui part, montrer l'autre (changer), la découvrir.
      passer: function (avant, apres, changer, o) {
        var e = lireEntree(apres) || { type: 'fondu' };
        if (o) { for (var k in o) { if (o.hasOwnProperty(k)) e[k] = o[k]; } }
        var b = fabriquer(avant, e);
        b.m.couvrir(0);
        occupe++;
        sonner(b.m, 0);
        return anime(b.m.duree[0], b.m.couvrir).then(function () {
          var decouvrir = preparer(apres, e);
          changer();
          retirer(b.s); occupe--;
          return attendre(b.m.pause || 80).then(decouvrir);
        });
      },
      // EPUB : la page s'ouvre couverte, puis se découvre.
      entree: function (scene) {
        var e = lireEntree(scene);
        if (!e) return Promise.resolve();
        var decouvrir = preparer(scene, e);
        return quandVisible().then(function () { return attendre(200); }).then(decouvrir);
      },
      frisson: frisson,
      eclat: eclat,
      envol: envol
    };
  })();

  var Objets = (function () {
    var donnees = {};
    try { var bloc = doc.getElementById('donnees-objets'); donnees = bloc ? JSON.parse(bloc.textContent) : {}; } catch (e) { donnees = {}; }
    var sac = [], actions = {}, ouverte = null, avant = null, surFin = null;

    function sceneCourante() { return estEpub ? scenes[0] : scenes[actuelle]; }
    function nom(id) { return (donnees[id] || {}).nom || id; }
    function lues(id) { return ((donnees[id] || {}).citations || []).filter(function (c) { return c.lu <= Lecture.max; }); }
    function vider(e) { while (e.firstChild) e.removeChild(e.firstChild); }
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
        tenu = true; x0 = ev.clientX; y0 = ev.clientY; zone.classList.add('tenu', 'manie');
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
      el('p', { 'class': 'fiche-surtitre' + (options.nouveau ? ' etiquette' : '') }, c).textContent = options.nouveau ? 'Nouvel objet' : '';
      el('h2', { tabindex: '-1' }, c).textContent = nom(id);
      lues(id).forEach(function (q, k) {
        var b = el('blockquote', {}, c);
        b.style.animationDelay = (360 + k * 90) + 'ms';     // les phrases entrent l'une après l'autre
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
    // L'annonce « Nouvel objet » : un bandeau oblique qui claque depuis la gauche et se touche
    // pour ouvrir la fiche ; l'objet s'en détache et vole jusqu'au bouton « Objets », qui
    // n'apparaît qu'à son arrivée.
    function signaler(id) {
      var sc = sceneCourante();
      if (!sc) return;
      var t = el('button', { type: 'button', 'class': 'nouvel-objet' }, sc);
      var icone = el('span', { 'class': 'icone' }, t), d = dessin(id);
      if (d) icone.appendChild(d);
      var txt = el('span', {}, t);
      el('small', {}, txt).textContent = 'Nouvel objet';
      txt.appendChild(doc.createTextNode(nom(id)));
      var minuterie = setTimeout(retirerAnnonce, 4600);
      function retirerAnnonce() {
        clearTimeout(minuterie); t.classList.remove('vu');
        setTimeout(function () { retirer(t); }, 700);
      }
      t.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
      t.addEventListener('click', function (ev) { ev.stopPropagation(); retirerAnnonce(); ouvrir(id); });
      requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('vu'); }); });
      Son.effet('tinte');
      setTimeout(function () {
        var b = $('.barre .objets', sc);
        if (!b || !d) { majBoutons(true); return; }
        b.hidden = false;
        b.classList.add('arrivee');
        icone.classList.add('parti');
        Transitions.envol(sc, icone, b, id).then(function () {
          b.classList.remove('arrivee');
          majBoutons(true);
          Son.effet('cle');
        });
      }, calme ? 200 : 1250);
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
        if (avecAnnonce) signaler(id); else majBoutons(true);
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
      estOuverte: function () { return !!ouverte; },
      nom: nom,
      donnee: function (id) { return donnees[id] || {}; }
    };
  })();
  // Passer à la scène suivante : l'édition web joue le balayage que la scène suivante
  // annonce (data-entree) ; dans l'EPUB, le lecteur tourne la page, et la page suivante
  // joue elle-même son entrée. `o.de` : d'où part le balayage dans la scène qui s'en va.
  function sceneSuivante(scene, o) {
    if (estEpub) { consigne(scene, 'Tournez la page', 1730); return; }
    var i = scenes.indexOf(scene);
    if (i < 0 || i + 1 >= scenes.length) return;
    Transitions.passer(scene, scenes[i + 1], function () { aller(i + 1); }, o);
  }
  // Rectangle d'un élément, en unités de scène (1200 x 1800).
  function zone(e, scene) {
    var r = scene.getBoundingClientRect(), b = e.getBoundingClientRect();
    if (!r.width) return null;
    var k = W / r.width;
    return [(b.left - r.left) * k, (b.top - r.top) * k, b.width * k, b.height * k];
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
      if (bloque()) return;
      Son.init(); Son.ambiance('cosmos');
      // le bouton est la première porte : la lumière en jaillit
      sceneSuivante(scene, { de: zone(b, scene) });
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
    quandEntree(scene).then(function () { setTimeout(function () { recit.avancer(); }, 500); });
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
        if (j === 3) { etoiles.eclat(0.95); scene.classList.add('appel-au-pere'); }
      },
      fin: function () { vivant = false; sceneSuivante(scene); }
    });
    // Le titre du chapitre a claqué sur les bandes d'entrée ; il reste ensuite en haut de l'écran.
    if (carton) { scene.appendChild(carton); carton.classList.add('carton', 'range'); }
    quandEntree(scene).then(function () {
      if (carton) carton.classList.add('vu');
      setTimeout(function () { recit.avancer(); }, calme ? 200 : 700);
    });
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
          if (bloque()) return;
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
      // l'iris se referme sur le pigeonnier, là où la danse a mené
      fin: function () { sceneSuivante(scene, { de: [628, 1134] }); }
    });
    quandEntree(scene).then(function () { setTimeout(function () { recit.avancer(); }, 400); });
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
          Transitions.frisson(scene, pose.x, pose.y, 260);    // portées → en main
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
            .then(function () { Son.effet('cle'); Transitions.frisson(scene, 932, 1010, 170); ok(); });
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
        return anime(650, function (x) { pose.r = -90 * lisse(x); placer(); })
          .then(function () { Transitions.frisson(scene, 932, 1010, 130); });
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
        if (j === 3) {
          return fondreEnCle()
            .then(function () {
              var m = Objets.donnee('cle').metamorphose;
              return Transitions.eclat(scene, { objet: 'cle', nom: Objets.nom('cle'), fragment: m && m.texte });
            })
            .then(function () { Objets.remplacer('lunettes', 'cle'); return Objets.presenter('cle'); });
        }
        if (j === 6) return laisserPasserLeJour();
        if (j === 7) return deconsolider();
      },
      // la porte, agrandie par la poussée, remplit l'écran : sa lumière l'envahit
      fin: function () {
        pousser().then(function () { sceneSuivante(scene, { de: [30, -124, 1140, 2080] }); });
      }
    });
    quandEntree(scene).then(function () { setTimeout(function () { recit.avancer(); }, 400); });
  };

  // Aluva : l'éblouissement, la poussière dans la lumière, le fleuve.
  demarreurs.aluva = function (scene) {
    var p = Poussiere(el('canvas', { 'class': 'toile' }, $('.decor', scene)));
    var eblouir = el('div', { 'class': 'lumiere-flot ui', style: 'opacity:.7;transition:opacity 3s ease-out;' }, scene);
    quandEntree(scene).then(function () { eblouir.style.opacity = '0'; });
    var recit = new Recit(scene, {
      surTemps: function (j) { if (j === 0) p.bouffee(); },
      fin: function () {
        var f = $('.fin-extrait', scene);
        if (f) f.classList.add('vu');
        ecrire('darshan.portes', ['pigeonnier-aluva']);
      }
    });
    quandEntree(scene).then(function () { setTimeout(function () { recit.avancer(); }, 900); });
    var bCarnet = $('.ouvrir-carnet', scene), carnet = $('.carnet', scene);
    if (bCarnet && carnet) {
      bCarnet.addEventListener('click', function (ev) { ev.stopPropagation(); carnet.classList.add('ouvert'); });
      carnet.addEventListener('click', function (ev) { ev.stopPropagation(); carnet.classList.remove('ouvert'); });
    }
    var bRe = $('.recommencer', scene);
    if (bRe) bRe.addEventListener('click', function (ev) { ev.stopPropagation(); window.location.reload(); });
  };

  // Banc d'essai des transitions (édition web, page transitions.html) : chaque bouton joue un
  // balayage ou un effet d'objet ; le décor change de monde selon le balayage choisi.
  demarreurs.banc = function (scene) {
    var decor = $('.decor img', scene), legende = $('.banc-legende', scene);
    var mondes = {};
    $$('.banc-decors [data-monde]', scene).forEach(function (d) {
      var m = d.getAttribute('data-monde');
      (mondes[m] = mondes[m] || []).push({ src: d.getAttribute('data-src'), credit: d.textContent });
      var i = new Image(); i.src = d.getAttribute('data-src');       // prêts avant le premier balayage
    });
    var rang = {};
    function changerDecor(m) {
      var liste = mondes[m];
      if (!liste) return;
      rang[m] = ((rang[m] === undefined ? -1 : rang[m]) + 1) % liste.length;
      if (decor.getAttribute('src') === liste[rang[m]].src && liste.length > 1) rang[m] = (rang[m] + 1) % liste.length;
      decor.setAttribute('src', liste[rang[m]].src);
      var credit = $('.banc-credit', scene);
      if (credit) credit.textContent = liste[rang[m]].credit;
    }
    $$('.banc-boutons button', scene).forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (bloque()) return;
        Son.init();
        var type = b.getAttribute('data-type');
        if (legende) legende.textContent = b.getAttribute('title') || '';
        if (type === 'frisson') { Transitions.frisson(scene, 600, 760, 260); return; }
        if (type === 'eclat') {
          var m = Objets.donnee('cle').metamorphose;
          Transitions.eclat(scene, { objet: 'cle', nom: Objets.nom('cle'), fragment: m && m.texte });
          return;
        }
        if (type === 'envol') { Objets.ajouter('lunettes', true); return; }
        if (type === 'fiche') { Objets.ouvrir('cle'); return; }
        var o = { type: type, titre: b.getAttribute('data-titre') || '' };
        ['de', 'vers'].forEach(function (k) { var v = b.getAttribute('data-' + k); if (v) o[k] = v.split(' ').map(Number); });
        Transitions.passer(scene, scene, function () { changerDecor(b.getAttribute('data-monde') || 'darshan'); }, o);
      });
    });
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
      Transitions.entree(s);
      if (demarreurs[nom]) demarreurs[nom](s);
      return;
    }
    aller(0);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', depart); else depart();
})();
