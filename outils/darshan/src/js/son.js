  // ---------------------------------------------------------------- le son, fabriqué en direct
  /* Tout le son est fabriqué en direct par Web Audio : aucun fichier audio, aucune parole
     enregistrée, aucune voix de synthèse. Rien ne sonne avant le premier geste du lecteur
     (init), et le bouton « Son » coupe tout, en fondu.

     Le chemin du son :
       ambiances ─► monde (deux passe-bas, grands ouverts) ─► bus ambiance ─┐
       effets (force, pan) ─────────────────────────────────► bus effets ───┴─► compresseur ─► maître
     `filtre('assourdi')` referme le monde (la salle s'efface, 2.3) sans toucher aux effets.

     État (version de conclusion, 29 septembre 2026) : l'interface est complète ; les
     ambiances cosmos, nuit et kerala et les dix-sept effets du prototype sont repris tels
     quels. Les autres ambiances, les couches et les nouveaux effets du découpage
     (docs/darshan-decoupage.md) restent à fabriquer : les appeler ne fait rien et ne lève
     jamais d'erreur. Une ambiance pas encore fabriquée vaut silence, comme dans le
     prototype : l'ambiance précédente s'éteint en fondu. */
  var Son = (function () {
    var MAITRE = 0.85, OUVERT = 20000, ASSOURDI = 450;
    var ctx = null, maitre = null, busAmb = null, busEff = null, monde = null, filtres = [];
    var bus = null;                         // la sortie de l'effet en cours (force et pan)
    var actif = reglages.son !== false;
    var ambiance = null, voulue = null, tampons = {};
    var couchesVoulues = {}, filtreVoulu = null;

    // ---- petits outils
    function borne(x) { return x > 1 ? 1 : x > 0 ? x : 0; }
    function volume(v) { return (typeof v === 'number' && isFinite(v)) ? borne(v) : 1; }
    function courbe(v) { return v * v; }  // réglage de 0 à 1 → gain : une courbe douce à l'oreille
    // « Bibliothèque », « métro ; pages » → « bibliotheque », « metro » : le découpage écrit
    // les noms avec leurs accents, le moteur les veut sans.
    function cle(nom) {
      if (nom === null || nom === undefined || nom === false) return null;
      var s = String(nom).split(';')[0].replace(/^\s+|\s+$/g, '').toLowerCase();
      s = s.replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c').replace(/\s+/g, '-');
      return s || null;
    }
    // Fige un paramètre à sa valeur du moment, pour enchaîner un fondu sans saut.
    function tenir(p, t) {
      if (p.cancelAndHoldAtTime) { p.cancelAndHoldAtTime(t); return; }
      p.cancelScheduledValues(t); p.setValueAtTime(p.value, t);
    }
    function lisser(p, v, t, d) { tenir(p, t); if (d > 0) p.linearRampToValueAtTime(v, t + d); else p.setValueAtTime(v, t); }
    function reprendre() {
      if (!ctx || ctx.state === 'running' || ctx.state === 'closed' || !ctx.resume) return;
      try { var p = ctx.resume(); if (p && p.then) p.then(null, function () { /* refus : au prochain geste */ }); } catch (e) { /* rien */ }
    }

    function init() {
      if (ctx) { if (actif) reprendre(); return; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { ctx = new AC(); } catch (e) { ctx = null; return; }
      try {
        maitre = ctx.createGain(); maitre.gain.value = actif ? MAITRE : 0; maitre.connect(ctx.destination);
        var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
        comp.connect(maitre);
        busAmb = ctx.createGain(); busAmb.gain.value = courbe(volume(reglages.ambiance)); busAmb.connect(comp);
        busEff = ctx.createGain(); busEff.gain.value = courbe(volume(reglages.effets)); busEff.connect(comp);
        // le monde : deux passe-bas en série, grands ouverts ; filtre('assourdi') les referme
        filtres = [0, 1].map(function () {
          var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = OUVERT; f.Q.value = 0; return f;
        });
        monde = ctx.createGain(); monde.connect(filtres[0]); filtres[0].connect(filtres[1]); filtres[1].connect(busAmb);
      } catch (e) { ctx = null; return; }
      if (actif) reprendre();
      if (filtreVoulu) appliquerFiltre(filtreVoulu, 0);
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

    // ---- les ambiances (une par lieu) ; celles du prototype, telles quelles
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
        var courbeT = new Float32Array(1024);
        for (var i = 0; i < 1024; i++) { var x = i / 512 - 1; courbeT[i] = Math.tanh(2.2 * x) + 0.12 * Math.sin(9 * x); }
        var ws = ctx.createWaveShaper(); ws.curve = courbeT;
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
    // Fondu enchaîné : l'ancienne s'éteint en 2,5 s puis s'arrête (sources et minuteries),
    // la nouvelle monte en 3 s. Un nom inconnu ou 'silence' : seule l'extinction a lieu.
    function changerAmbiance(nom) {
      var t = ctx.currentTime;
      if (ambiance) {
        var ancienne = ambiance;
        try { lisser(ancienne.gain.gain, 0, t, 2.5); } catch (e) { /* rien */ }
        setTimeout(function () {
          ancienne.arrets.forEach(function (a) { try { a.stop(); } catch (e) { /* déjà arrêté */ } });
          try { ancienne.gain.disconnect(); } catch (e) { /* rien */ }
        }, 2700);
        ambiance = null;
      }
      if (!nom || !ambiances.hasOwnProperty(nom)) return;
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.connect(monde);
      g.gain.linearRampToValueAtTime(1, t + 3);
      ambiance = { nom: nom, gain: g, arrets: [] };
      try { var r = ambiances[nom](g); if (r && r.forEach) ambiance.arrets = r; } catch (e) { /* une ambiance ratée se tait */ }
    }
    function appliquerFiltre(nom, duree) {
      var t = ctx.currentTime, f = nom === 'assourdi' ? ASSOURDI : OUVERT;
      filtres.forEach(function (b) {
        tenir(b.frequency, t);
        if (duree > 0) b.frequency.exponentialRampToValueAtTime(f, t + duree); else b.frequency.setValueAtTime(f, t);
      });
      lisser(monde.gain, nom === 'assourdi' ? 0.7 : 1, t, duree);   // étouffé, le monde baisse aussi un peu
    }

    // ---- les effets ; ceux du prototype, tels quels (ils rejoignent `bus`, la sortie de l'effet)
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
      init: function () { try { init(); } catch (e) { /* pas de son */ } },
      // Fondu enchaîné vers l'ambiance `nom` ; 'silence' ou null : tout se tait (les couches aussi).
      ambiance: function (nom) {
        nom = cle(nom);
        voulue = nom;
        if (!nom || nom === 'silence') couchesVoulues = {};
        if (!ctx) return;
        try { if (!ambiance || ambiance.nom !== nom) changerAmbiance(nom); } catch (e) { /* pas de son */ }
      },
      // Effet ponctuel ; o : { force: 0 à 1 (gain, 1 par défaut), pan: -1 à 1 }. Nom inconnu : rien.
      effet: function (nom, o) {
        nom = cle(nom);
        if (!ctx || !actif || !nom || !effets.hasOwnProperty(nom)) return;
        try {
          var force = (o && typeof o.force === 'number' && isFinite(o.force)) ? borne(o.force) : 1;
          var pan = (o && typeof o.pan === 'number' && isFinite(o.pan)) ? Math.max(-1, Math.min(1, o.pan)) : 0;
          var sortie = ctx.createGain(), fin = sortie;
          sortie.gain.value = force;
          if (pan && ctx.createStereoPanner) { fin = ctx.createStereoPanner(); fin.pan.value = pan; sortie.connect(fin); }
          fin.connect(busEff);
          bus = sortie;
          effets[nom](ctx.currentTime + 0.01, force);
          setTimeout(function () { try { fin.disconnect(); sortie.disconnect(); } catch (e) { /* rien */ } }, 12000);
        } catch (e) { /* pas de son */ }
      },
      // Couche continue par-dessus l'ambiance : aucune n'est encore fabriquée. La demande est
      // retenue (elle servira quand la couche existera), sans effet ni erreur.
      couche: function (nom, oui) {
        nom = cle(nom);
        if (!nom) return;
        if (arguments.length < 2 || oui) couchesVoulues[nom] = true; else delete couchesVoulues[nom];
      },
      // 'assourdi' : le monde s'étouffe (passe-bas vers 450 Hz, en 1,5 s) ; null : il revient.
      filtre: function (nom) {
        filtreVoulu = cle(nom) === 'assourdi' ? 'assourdi' : null;
        if (!ctx) return;
        try { appliquerFiltre(filtreVoulu, 1.5); } catch (e) { /* pas de son */ }
      },
      actif: function () { return actif; },
      basculer: function () {
        actif = !actif; reglages.son = actif; ecrire('darshan.reglages', reglages);
        if (ctx) {
          try {
            if (actif) reprendre();
            lisser(maitre.gain, actif ? MAITRE : 0, ctx.currentTime, 0.4);
          } catch (e) { /* pas de son */ }
        }
        return actif;
      },
      // { ambiance: 0..1, effets: 0..1 } : règle les deux bus (courbe v²) et l'enregistre.
      // Sans argument, rend les réglages du moment.
      volumes: function (v) {
        if (v && typeof v === 'object') {
          if (typeof v.ambiance === 'number' && isFinite(v.ambiance)) reglages.ambiance = borne(v.ambiance);
          if (typeof v.effets === 'number' && isFinite(v.effets)) reglages.effets = borne(v.effets);
          ecrire('darshan.reglages', reglages);
          if (ctx) {
            try {
              var t = ctx.currentTime;
              lisser(busAmb.gain, courbe(volume(reglages.ambiance)), t, 0.15);
              lisser(busEff.gain, courbe(volume(reglages.effets)), t, 0.15);
            } catch (e) { /* pas de son */ }
          }
        }
        return { ambiance: volume(reglages.ambiance), effets: volume(reglages.effets) };
      }
    };
  })();
