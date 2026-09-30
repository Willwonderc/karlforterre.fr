  // ---------------------------------------------------------------- le son, fabriqué en direct
  /* Tout le son de Darshan jouable est fabriqué en direct par Web Audio : aucun fichier audio,
     aucune voix, aucune parole, aucun air existant. Rien ne sonne avant le premier geste du
     lecteur (init) ; le bouton « Son » coupe tout, en fondu ; le mouvement réduit ne change rien
     au son. Le son n'est jamais indispensable : ce qu'il dit, le texte ou l'image le disent aussi.
     Toute erreur est rattrapée : le son ne casse jamais la lecture.

     Le chemin du son :
       ambiances ; couches pluie, feu, tele ─► monde (deux passe-bas) ─► bus ambiance ─┐
       effets ; accord du père ; couches battements, vibration, melodie ─► bus effets ─┴─►
         compresseur ─► maître ─► plafond (saturation douce : jamais au-dessus de −1,4 dBFS)
     `filtre('assourdi')` referme le monde (la salle s'efface, 2.3) sans toucher aux effets, au
     cœur ni à la ballade. Les deux volumes du lecteur règlent les deux bus.

     État (30 septembre 2026) : les 17 ambiances du découpage, les 6 couches, les deux motifs du
     père (appel, pere), l'arrêt commun, l'équilibrage (table NIVEAUX, mesurée par le banc
     d'essai) ; les dix-sept effets du prototype sont repris tels quels, seul leur niveau a changé.

     Son coupé (reglages.son === false, ou après basculer()), rien ne se fabrique, pas même le
     contexte audio : l'ambiance et les couches voulues sont seulement retenues, et démarrent quand
     le son revient. Contexte suspendu (pas encore de geste, un appel sur iOS), rien ne se planifie :
     son horloge est figée, et les sons s'y entasseraient sans jamais finir. Chaque ambiance et
     chaque couche a sa « vie » (sources, minuteries, réverbérations), arrêtée tout entière après son
     fondu : les réverbérations y rendent aussitôt leurs tampons.

     Son.ambiance(nom, reglages) : fondu enchaîné (2,5 s pour l'ancienne, 3 s pour la nouvelle).
     Chaque ambiance rend ses sources et ses minuteries (sa « vie ») : tout s'arrête après le fondu,
     aucune minuterie ne lui survit. Un nom pas encore fabriqué vaut silence ; 'silence' (ou null)
     éteint aussi les couches. La même ambiance avec d'autres réglages change sans recommencer
     quand elle le peut, sinon par un fondu enchaîné.
       cosmos        la voûte : sinus lents, souffle (prototype)
       nuit          les toits la nuit : vent, air, rumeur de la ville (prototype)
       kerala        Aluva : le fleuve, ses remous, les oiseaux, le tanpura (prototype) ;
                     { soir: true } : moins d'oiseaux, des grillons (3.9 à 3.14, 7.6 à 7.8)
       vent          deux souffles graves qui errent, un sifflement, de l'air ; { feuilles: true } (7.2)
       restaurant    la rumeur de la salle (aucune voix), couverts, verres, assiettes, le serveur
       rue           Paris : circulation au loin, voitures qui passent, pas, pigeons, un scooter ;
                     { densite: 0 à 1 } (0,5 ; 1 : les « vapeurs automobiles » de 4.5),
                     { nuit: true } (peu de voitures, plus de pigeons), { ete: true } (martinets)
       parc          le feuillage, le merle, des moineaux, des pas sur le gravier
       bibliotheque  un silence habité : ventilation, pages, pas feutrés, un livre posé ;
                     { vaste: true } : la même sous la voûte de Pékin (réverbération de 5 s)
       vision        le mudrā : le fleuve lointain, des grillons, un souffle à chaque inspiration,
                     des braises, un grave sans air
       metro         la station carrelée, la rumeur des tunnels, une rame qui arrive, freine et
                     repart ; { rame: true } : dans la rame (4.3) : la tôle qui vibre, les joints
       hopital       le couloir, les néons, des bips lointains et désaccordés, un chariot, une porte
       chambre       une pièce calme, la rue étouffée ; { fenetre: true } (5.1), { nuit: true }
       marche        Aluva : le tanpura, la foule sans voix, le laiton, les étoffes, une sonnette,
                     les corneilles, un klaxon de rickshaw, la chaleur
       patisserie    le ronron de la vitrine réfrigérée, papier, caisse, clochette de la porte
       appartement   les tentures, la rue d'en bas, une horloge, l'encens qui crépite ;
                     { horloge: 0 à 1 } (0,3 ; 1 : l'attente de 6.9, au premier plan)
       desert        un vent large et bas, le sable qui file, la nuit immense ; { vent: 0 à 1 }
                     (« le vent tombe », 7.1), { jour: true } (7.3 : la chaleur)
       pluie         une averse qui s'apaise en une vingtaine de secondes, puis des gouttes ;
                     { densite: 0 à 1 } : une pluie qui ne change plus

     Son.couche(nom, oui, options) : par-dessus l'ambiance, jusqu'à couche(nom, false, { duree })
     (fondu, en ms) ou ambiance('silence'). Demandée avant init(), elle joue au premier geste.
     Rappelée allumée, elle suit ses nouvelles options sans recommencer (sauf la ballade).
     Options communes : force (0 à 1).
       battements  le cœur : un double coup grave et chaud. tempo (72), qui ('julie' : son timbre,
                   plus clair), julie (tempo d'un second cœur, celui de Julie ; false l'ôte),
                   duree (ms pour atteindre les nouveaux tempos : il s'emballe ou ralentit),
                   cale (les deux cœurs se calent : à 96 et 64, trois contre deux, ensemble au
                   premier temps de la mesure de la ballade), arythmie (le cœur de Julie bat
                   irrégulièrement, 5.9). Ex. 2.2 : { tempo: 72 }, puis { tempo: 110, duree: 2600 } ;
                   2.9 : { tempo: 96, julie: 64 }, puis { cale: true } ; 5.9 : { tempo: 80,
                   julie: 80, duree: 4200, cale: true } ; 7.10 : { julie: false, tempo: 48, duree: 8000 }.
       pluie       une pluie sur le lieu ; densite (0,5)
       feu         le feu du soir : les flammes, des crépitements, les sardines qui grésillent
       tele        une télévision derrière une porte, sans une parole : une rumeur, une musique de
                   série inventée pour le livre, des rires étouffés
       vibration   le vibreur d'un téléphone posé ; fois (nombre de salves, puis il se tait seul)
       melodie     la ballade, composée pour le livre (voir BALLADE) : fa majeur, à 6/8, huit
                   mesures ; une mandoline (trémolo sur les notes longues) et une guitare, cordes
                   pincées fabriquées par Karplus-Strong. mode : 'fragment' (par défaut : les
                   premières notes, étouffées, lointaines ; notes : leur nombre, 4),
                   'mesure' (la seule première mesure, claire), 'entiere' (les huit mesures, la
                   mandoline et la guitare ; boucle : elle recommence jusqu'à couche(…, false)) ;
                   filtre : 'assourdi' (joue contre joue, 2.9), 'eau' (sous l'eau, 1.7),
                   'telephone' (le petit haut-parleur, 5.7), ou rien (clair : 7.10) ; tempo (64,
                   la noire pointée). Elle se tait d'elle-même à la fin. Ex. 1.7 : { filtre: 'eau' } ;
                   2.9 : { notes: 6 } ; 5.7 : { mode: 'entiere', filtre: 'telephone' } ;
                   7.10 : { mode: 'entiere', boucle: true } jusqu'à l'éclipse (7.11).
     Son.note('melodie', i) : une seule note de la première mesure, claire (les pas de Julie qui
     court, 7.9) : i de 0 à 5 ; sans i, la suivante (le compte revient à 0 après la sixième et à
     chaque couche('melodie')). Rend l'indice joué, ou −1.

     Les deux motifs du père, en effets :
       appel  la quinte à vide, la, mi, la, très bas : elle monte en 2 s, tient, s'éteint en 6 s
              sans se résoudre (« Papa, où es-tu ? », 1.1 ; 3.5 ; deux fois en 6.11). Les
              chapitres 1 et 3 l'appellent `question` : un seul nom, `appel`.
       pere   l'accord du père : la quinte de l'appel, dans sa voix, puis sa tierce, do dièse, qui
              la résout (la, do dièse, mi, la, do dièse ; accord juste, sans battement) : pur,
              lumineux, tenu, égal. Choix : un effet tenu, qu'aucune ambiance n'arrête (en 7.13,
              la ville se tait, l'accord reste). effet('pere') : il monte en 2,2 s (montee, en
              ms) ; { tenu: true } : déjà là à
              l'ouverture d'une page (3.11, 7.13 : 0,3 s) ; { eteindre: ms } : il s'éteint en ce
              temps (3 000 par défaut), la note haute la dernière (3.11 ; 7.13, quand Darshan recule
              d'un demi-pas) ; { duree: ms } : il s'éteint de lui-même après ce temps. Sans
              extinction, il se tait au bout de dix minutes.

     Banc d'essai : outils/darshan/essai-son.js rend hors ligne chaque ambiance, couche et effet,
     et mesure niveaux, crêtes, silence et spectre ; son épreuve d'endurance enchaîne cent
     changements d'ambiance (avec couches, effets, son coupé puis remis) et vérifie qu'à la fin plus
     une source, une réverbération ni une minuterie ne survit. Son._essai(contexte) sert à lui seul.

     Reste à faire :
     - les effets ponctuels du découpage (pas, toc, page, battement, clochette, vibreur, message,
       bip, the, confettis, tonnerre, eclair, goutte, etincelles, plume, ruban, porte, brise, chute,
       desenchantement, lanterne, eteindre, eclabousse, mousse, inspire, expire, graine, cran,
       avance, nuage, aube, lueur, boussole, velours, paume, perce, pli, entree, fonte-courte),
       après la synthèse des équipes créatives ; les couches qu'elles demandent en plus (aube,
       couteau, bourdon, horloge : l'appartement a déjà la sienne, par son réglage) ;
     - `jour` (prototype) sonne l'accord de la majeur, celui du père : l'arbitrage 1 le réserve à
       sa porte ; le jour du pigeonnier (1.3) doit prendre `autre-cote` (chapitre 1) ;
     - deux ambiances à la fois, une par oreille (6.2, 7.4) ; les réglages `foule` (5.8) et
       `tanpura` que cite la synthèse (un réglage inconnu est ignoré, sans erreur) ;
     - l'écoute de la direction : niveaux (sous la lecture), timbres, la ballade. */
  var Son = (function () {
    var MAITRE = 0.85, OUVERT = 20000, ASSOURDI = 450;
    var ctx = null, maitre = null, busAmb = null, busEff = null, monde = null, filtres = [];
    var bus = null;                         // la sortie de l'effet en cours (force et pan)
    var actif = reglages.son !== false;
    var ambiance = null, voulue = null, voulueR = null;       // l'ambiance qui joue ; celle qu'on attend
    var couches = {}, couchesVoulues = {}, filtreVoulu = null;
    var pere = null, pasMelodie = 0, chaineNotes = null;
    var tampons = {};                       // bruits, cordes, réverbérations, ondes : un jeu par contexte
    var banc = null;                        // le banc d'essai (jamais pour le lecteur)
    // Toutes les minuteries passent par `horloge` : setTimeout pour le lecteur, une file virtuelle
    // réglée sur le rendu hors ligne pour le banc d'essai.
    var horloge = {
      poser: function (f, ms) { return setTimeout(f, ms); },
      oter: function (id) { clearTimeout(id); }
    };

    // ---- petits outils
    function borne(x) { return x > 1 ? 1 : x > 0 ? x : 0; }
    function nombre(x, defaut) { return (typeof x === 'number' && isFinite(x)) ? x : defaut; }
    function volume(v) { return borne(nombre(v, 1)); }
    function courbe(v) { return v * v; }  // réglage de 0 à 1 → gain : une courbe douce à l'oreille
    function hasard(a, b) { return a + Math.random() * (b - a); }
    function choix(l) { return l[Math.floor(Math.random() * l.length)]; }
    function expo(taux) { return -Math.log(1 - Math.random()) / taux; }  // l'attente dans un flux au hasard
    function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
    // Une erreur rattrapée : muette pour le lecteur, notée par le banc d'essai.
    function rate(e) { if (banc) banc.erreurs.push(String((e && e.message) || e)); }
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
    function niveau(sorte, nom) { var n = NIVEAUX[sorte][nom]; return typeof n === 'number' ? n : 1; }

    // ---- le chemin du son, dans le contexte c ; `vers` : la destination (aucune pour le banc d'essai)
    // Le plafond : transparent jusqu'à 0,6 (−4,4 dBFS), puis une saturation douce qui ne dépasse
    // jamais 0,855 (−1,4 dBFS), même quand ambiance, couches et effets s'additionnent.
    function courbePlafond() {
      var n = 2049, k = new Float32Array(n), S = 0.6, P = 0.89;
      for (var i = 0; i < n; i++) {
        var x = i / (n - 1) * 2 - 1, a = Math.abs(x), y = a <= S ? a : S + (P - S) * Math.tanh((a - S) / (P - S));
        k[i] = x < 0 ? -y : y;
      }
      return k;
    }
    function courbeDouce(k) {   // une saturation symétrique (tanh), pour épaissir un son
      var n = 1025, c = new Float32Array(n);
      for (var i = 0; i < n; i++) { var x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
      return c;
    }
    function construire(c, vers) {
      ctx = c;
      maitre = ampli(actif ? MAITRE : 0);
      var plafond = ctx.createWaveShaper(); plafond.curve = courbePlafond(); maitre.connect(plafond);
      if (vers) plafond.connect(vers);
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
      comp.connect(maitre);
      busAmb = ampli(courbe(volume(reglages.ambiance)), comp);
      busEff = ampli(courbe(volume(reglages.effets)), comp);
      // le monde : deux passe-bas en série, grands ouverts ; filtre('assourdi') les referme
      filtres = [0, 1].map(function () { return biquad('lowpass', OUVERT, 0); });
      monde = ampli(1); monde.connect(filtres[0]); filtres[0].connect(filtres[1]); filtres[1].connect(busAmb);
      return plafond;
    }
    // Son coupé, rien ne se fabrique, pas même le contexte : l'ambiance et les couches voulues sont
    // seulement retenues, et démarrent quand le son revient (basculer).
    function init() {
      if (!actif) return;
      if (ctx) { reprendre(); return; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var c;
      try { c = new AC(); } catch (e) { return; }
      try { construire(c, c.destination); } catch (e) { ctx = null; rate(e); return; }
      reprendre();
      if (filtreVoulu) appliquerFiltre(filtreVoulu, 0);
      relancer();
    }
    // Ce qui est voulu, et qui ne joue pas encore : l'ambiance, les couches.
    function relancer() {
      if (!ambiance && voulue) changerAmbiance(voulue, voulueR);
      Object.keys(couchesVoulues).forEach(function (n) {
        try { if (!couches[n]) allumerCouche(n, couchesVoulues[n]); } catch (e) { rate(e); }
      });
    }
    // Le son coupé (après le fondu du maître) : tout s'arrête, l'ambiance et les couches voulues
    // restent retenues ; la ballade, qui ne joue qu'une fois, est oubliée ; l'accord du père s'éteint.
    function toutArreter() {
      if (ambiance) { ambiance.vie.arreter(); ambiance = null; }
      Object.keys(couches).forEach(function (n) { couches[n].vie.arreter(); delete couches[n]; });
      delete couchesVoulues.melodie;
      if (pere) eteindrePere(0.1);
    }
    // Le contexte joue-t-il ? Suspendu (pas encore de geste, un appel sur iOS), il fige son horloge :
    // rien ne s'y planifie, sinon les sons s'entasseraient sans jamais finir.
    function enMarche() { return !!ctx && (banc !== null || !ctx.state || ctx.state === 'running'); }

    // ---- les nœuds
    function ampli(v, sortie) { var g = ctx.createGain(); g.gain.value = v; if (sortie) g.connect(sortie); return g; }
    function biquad(type, f, q, sortie) {
      var b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f;
      if (q !== undefined) b.Q.value = q;
      if (sortie) b.connect(sortie);
      return b;
    }
    // Un panoramique (−1 à gauche, 1 à droite) ; sans StereoPanner (vieux WebKit), le son reste au milieu.
    function pan(p, sortie) {
      var n;
      if (ctx.createStereoPanner) { n = ctx.createStereoPanner(); n.pan.value = p; } else n = ctx.createGain();
      if (sortie) n.connect(sortie);
      return n;
    }
    function glisserPan(n, p0, p1, t, d) { if (n.pan) { n.pan.setValueAtTime(p0, t); n.pan.linearRampToValueAtTime(p1, t + d); } }
    function osc(type, f, v) {
      var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(ctx.currentTime);
      if (v) v.garder(o);
      return o;
    }
    // Une onde douce faite de quelques harmoniques (l'appel, le père) ; une sinusoïde si le
    // navigateur n'en fait pas.
    function onde(o, nom, harmoniques) {
      var k = 'onde:' + nom;
      try {
        if (!tampons[k]) {
          var re = new Float32Array(harmoniques.length + 1), im = new Float32Array(harmoniques.length + 1);
          harmoniques.forEach(function (a, i) { im[i + 1] = a; });
          tampons[k] = ctx.createPeriodicWave(re, im);
        }
        o.setPeriodicWave(tampons[k]);
      } catch (e) { rate(e); }
    }
    // Une enveloppe : monte en a, puis s'éteint en d (exponentielle).
    function enveloppe(g, t, a, v, d) {
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a);
      g.gain.exponentialRampToValueAtTime(Math.max(1e-6, Math.min(0.0005, v / 1000)), t + a + d);
    }

    // ---- les bruits : trois tampons de longueurs différentes (6,1, 8,3 et 9,7 s), bouclés sans
    // raccord audible (la fin se fond dans le début) ; chaque source part d'un endroit et à une
    // vitesse au hasard : deux sources du même bruit ne se répondent jamais.
    var LONGUEURS = { blanc: 6.1, rose: 8.3, brun: 9.7 };
    function bruit(type) {
      if (tampons[type]) return tampons[type];
      var sr = ctx.sampleRate, n = Math.floor(sr * (LONGUEURS[type] || 6.1)), m = Math.floor(sr * 0.3);
      var x = new Float32Array(n + m), b0 = 0, b1 = 0, b2 = 0, dernier = 0, i;
      for (i = 0; i < n + m; i++) {
        var blanc = Math.random() * 2 - 1;
        if (type === 'rose') { b0 = 0.997 * b0 + 0.029591 * blanc; b1 = 0.985 * b1 + 0.032534 * blanc; b2 = 0.95 * b2 + 0.048056 * blanc; x[i] = (b0 + b1 + b2 + blanc * 0.1) * 0.9; }
        else if (type === 'brun') { dernier = (dernier + 0.02 * blanc) / 1.02; x[i] = dernier * 3.2; }
        else x[i] = blanc;
      }
      var b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0);
      for (i = 0; i < n; i++) d[i] = x[i];
      for (i = 0; i < m; i++) { var k = i / m; d[i] = x[i] * Math.sqrt(k) + x[n + i] * Math.sqrt(1 - k); }
      tampons[type] = b; return b;
    }
    function source(type, v) {
      var s = ctx.createBufferSource(); s.buffer = bruit(type); s.loop = true;
      s.playbackRate.value = hasard(0.97, 1.03);
      s.start(ctx.currentTime, Math.random() * s.buffer.duration);
      if (v) v.garder(s);
      return s;
    }
    function lfo(freq, ampleur, cible, v) {
      var o = osc('sine', freq, v), g = ampli(ampleur); o.connect(g); g.connect(cible); return o;
    }

    // ---- la vie d'un son (une ambiance, une couche, l'accord du père) : ses sources et ses
    // minuteries, tout ce qu'il faut arrêter ensemble ; v.sortie : son gain de sortie.
    function vie(sortie) {
      var v = { sortie: sortie, vivant: true, sources: [], minuteries: [], salles: [] };
      v.garder = function (n) {
        if (!v.vivant) { try { n.stop(); } catch (e) { /* rien */ } return n; }
        v.sources.push(n);
        n.onended = function () { var i = v.sources.indexOf(n); if (i >= 0) v.sources.splice(i, 1); };
        return n;
      };
      v.plusTard = function (f, ms) {
        if (!v.vivant) return null;
        var id = horloge.poser(function () {
          var i = v.minuteries.indexOf(id); if (i >= 0) v.minuteries.splice(i, 1);
          if (v.vivant) { try { f(); } catch (e) { rate(e); } }
        }, ms);
        v.minuteries.push(id);
        return id;
      };
      v.arreter = function () {
        if (!v.vivant) return;
        v.vivant = false;
        v.minuteries.forEach(function (id) { horloge.oter(id); }); v.minuteries = [];
        v.sources.forEach(function (s) { try { s.onended = null; s.stop(); } catch (e) { /* déjà arrêtée */ } }); v.sources = [];
        // une réverbération garde ses tampons et ses fils de calcul : on les rend tout de suite
        v.salles.forEach(function (c) { try { c.disconnect(); c.buffer = null; } catch (e) { /* rien */ } }); v.salles = [];
        try { v.sortie.disconnect(); } catch (e) { /* rien */ }
      };
      return v;
    }
    // Une réverbération qui appartient à une vie (libérée avec elle).
    function convolueur(v, duree, clarte) {
      var c = ctx.createConvolver(); c.buffer = reponse(duree, clarte); v.salles.push(c); return c;
    }
    // Appelle quand(t) de loin en loin, toutes les min à max secondes : les événements épars.
    function souvent(v, quand, min, max, premier) {
      (function attendre(d) {
        v.plusTard(function () { if (enMarche()) quand(ctx.currentTime + 0.03); attendre(hasard(min, max)); }, d * 1000);
      })(nombre(premier, hasard(min * 0.2, max * 0.6)));
    }
    // Fait errer un paramètre au hasard entre min et max : une nouvelle cible toutes les tmin à
    // tmax secondes, rejointe en douceur ; jamais de cycle qu'on reconnaîtrait.
    function derive(v, p, min, max, tmin, tmax) {
      (function viser() {
        var d = hasard(tmin, tmax);
        if (enMarche()) p.setTargetAtTime(hasard(min, max), ctx.currentTime, d / 3);
        v.plusTard(viser, d * 1000);
      })();
    }
    // Un planificateur à l'avance, pour les rythmes réguliers (cœur, horloge, musique, pluie
    // serrée) : toutes les 100 ms, fn(debut, fin) planifie ce qui tombe dans [debut, fin[ ;
    // après un retard des minuteries, ce qui est passé est sauté, jamais rejoué d'un coup.
    function cadence(v, fn) {
      var fin = ctx.currentTime + 0.05;
      (function tour() {
        if (!enMarche()) { v.plusTard(tour, 250); return; }
        var t1 = ctx.currentTime + 0.3;
        if (fin < ctx.currentTime) fin = ctx.currentTime;
        if (t1 > fin) { try { fn(fin, t1); } catch (e) { rate(e); } fin = t1; }
        v.plusTard(tour, 100);
      })();
    }
    // Une nappe : un bruit filtré, à un niveau ; rend { f: le filtre, g: le gain }.
    function nappe(v, type, filtre, f, q, niv, sortie) {
      var s = source(type, v), b = biquad(filtre, f, q), g = ampli(niv, sortie);
      s.connect(b); b.connect(g);
      return { f: b, g: g };
    }
    // Une réponse de salle : un bruit qui décroît de 60 dB en `duree`, de plus en plus sourd, avec
    // quelques premières réflexions ; stéréo, les deux oreilles différentes.
    function reponse(duree, clarte) {
      var k = 'salle:' + duree + ':' + clarte;
      if (tampons[k]) return tampons[k];
      var sr = ctx.sampleRate, n = Math.floor(sr * duree), b = ctx.createBuffer(2, n, sr);
      for (var c = 0; c < 2; c++) {
        var d = b.getChannelData(c), lp = 0, i;
        for (i = 0; i < n; i++) {
          var x = i / n, a = clarte * (1 - 0.85 * x) + 0.02;
          lp += a * ((Math.random() * 2 - 1) - lp);
          d[i] = lp * Math.exp(-6.9 * x) * Math.min(1, i / (sr * 0.006));
        }
        [0.0071, 0.0113, 0.0167, 0.0229, 0.0311].forEach(function (s, j) {
          var p = Math.floor(sr * s * (c ? 1.13 : 1));
          if (p < n) d[p] += (0.12 - j * 0.015) * (j % 2 ? -1 : 1);
        });
      }
      tampons[k] = b; return b;
    }
    // Une salle : ce qu'on y branche sonne sec, et en partie réverbéré (duree, clarte, part humide).
    function salle(v, duree, clarte, humide) {
      var entree = ampli(1, v.sortie), conv = convolueur(v, duree, clarte);
      entree.connect(conv); conv.connect(ampli(humide, v.sortie));
      return entree;
    }

    // ---- les petits événements, communs aux ambiances
    // Un éclat de bruit filtré (un claquement, un grain, un froissement) ; rend son filtre.
    function grain(sortie, t, type, filtre, f, q, niv, a, d) {
      var s = ctx.createBufferSource(); s.buffer = bruit(type);
      var b = biquad(filtre, f, q), g = ctx.createGain();
      enveloppe(g, t, a, niv, d);
      s.connect(b); b.connect(g); g.connect(sortie);
      s.start(t, Math.random() * 4); s.stop(t + a + d + 0.05);
      return b;
    }
    // Un tintement : des partiels (rapports à f) qui s'éteignent, les aigus d'abord.
    function tinter(sortie, t, f, rapports, niv, d) {
      rapports.forEach(function (r, i) {
        var o = ctx.createOscillator(); o.frequency.value = f * r;
        var g = ctx.createGain(); enveloppe(g, t, 0.002, niv / (i + 1), d / (1 + i * 0.6));
        o.connect(g); g.connect(sortie); o.start(t); o.stop(t + d + 0.1);
      });
    }
    // Un pas : le talon (un bruit bref), le poids (un grave), puis la pointe ; `sol` dit la matière :
    // [fréquence du talon, sa largeur, sa durée, le grave (Hz), la part du talon, la part du grave].
    var SOLS = {
      pave: [1800, 1.2, 0.05, 110, 0.5, 0.3], talons: [3200, 2.5, 0.035, 160, 0.6, 0.2], bois: [900, 1, 0.07, 90, 0.5, 0.4],
      feutre: [520, 0.8, 0.08, 80, 0.6, 0.12], lino: [1300, 1, 0.05, 100, 0.45, 0.2], poussiere: [700, 0.7, 0.1, 60, 0.4, 0.15]
    };
    function pas(sortie, t, sol, niv) {
      if (sol === 'gravier') {
        for (var i = 0; i < 8; i++) grain(sortie, t + hasard(0, 0.13), 'blanc', 'bandpass', hasard(1800, 4500), 1.5, niv * hasard(0.25, 0.6), 0.002, hasard(0.01, 0.03));
        return;
      }
      var s = SOLS[sol] || SOLS.pave;
      grain(sortie, t, 'blanc', 'bandpass', s[0] * hasard(0.85, 1.15), s[1], niv * s[4], 0.002, s[2]);
      var o = ctx.createOscillator(); o.frequency.setValueAtTime(s[3] * 1.6, t); o.frequency.exponentialRampToValueAtTime(s[3], t + 0.04);
      var g = ctx.createGain(); enveloppe(g, t, 0.003, niv * s[5], 0.06); o.connect(g); g.connect(sortie); o.start(t); o.stop(t + 0.12);
      if (sol !== 'talons') grain(sortie, t + hasard(0.06, 0.1), 'blanc', 'bandpass', s[0] * 1.3, s[1], niv * s[4] * 0.5, 0.002, s[2] * 0.7);
    }
    // Quelqu'un qui passe : n pas, toutes les `ecart` secondes, de p0 à p1 ; il approche, puis s'éloigne.
    function marcheur(sortie, t, sol, n, ecart, niv, p0, p1) {
      var p = pan(p0, sortie);
      glisserPan(p, p0, p1, t, n * ecart);
      for (var i = 0; i < n; i++) pas(p, t + i * ecart * hasard(0.94, 1.06), sol, niv * (0.35 + 0.65 * Math.sin(Math.PI * (i + 0.5) / n)));
    }
    // Une voiture (ou un scooter, un bus) qui passe de p0 à p1 en `duree` : pneus et vent (un
    // bruit rose qui monte puis redescend), moteur (une dent de scie grave qui baisse au passage).
    function passage(sortie, t, duree, niv, p0, p1, sorte) {
      var p = pan(p0, sortie); glisserPan(p, p0, p1, t, duree);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(niv, t + duree * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duree); g.connect(p);
      var s = ctx.createBufferSource(); s.buffer = bruit('rose'); s.loop = true;
      var b = biquad('bandpass', 320, 0.8); b.frequency.setValueAtTime(320, t); b.frequency.linearRampToValueAtTime(950, t + duree * 0.5);
      b.frequency.linearRampToValueAtTime(360, t + duree);
      s.connect(b); b.connect(g); s.start(t, Math.random() * 5); s.stop(t + duree + 0.1);
      var f = sorte === 'scooter' ? 150 : sorte === 'bus' ? 52 : 78;
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 1.06, t); o.frequency.linearRampToValueAtTime(f * 0.93, t + duree);
      var lb = biquad('lowpass', sorte === 'scooter' ? 1600 : 520, 0.7); o.connect(lb);
      lb.connect(ampli(sorte === 'scooter' ? 0.35 : sorte === 'bus' ? 0.3 : 0.14, g)); o.start(t); o.stop(t + duree + 0.1);
    }
    function klaxon(sortie, t, niv, rickshaw) {
      (rickshaw ? [[0, 520], [0.26, 520]] : [[0, 415], [0, 523]]).forEach(function (k) {
        var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = k[1];
        var b = biquad('lowpass', 1500, 1), g = ctx.createGain(), t1 = t + k[0], d = rickshaw ? 0.14 : 0.2;
        g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(niv, t1 + 0.01); g.gain.setValueAtTime(niv, t1 + d); g.gain.linearRampToValueAtTime(0, t1 + d + 0.03);
        o.connect(b); b.connect(g); g.connect(sortie); o.start(t1); o.stop(t1 + d + 0.05);
      });
    }
    // Une page qu'on tourne : un froissement qui monte puis retombe, la page qui se pose.
    function feuillet(sortie, t, niv) {
      var d = hasard(0.25, 0.45), b = grain(sortie, t, 'rose', 'bandpass', 1000, 1.1, niv, d * 0.45, d * 0.7);
      b.frequency.setValueAtTime(1000, t); b.frequency.exponentialRampToValueAtTime(3300, t + d * 0.6); b.frequency.exponentialRampToValueAtTime(1700, t + d * 1.2);
      grain(sortie, t + d * 0.8, 'blanc', 'highpass', 3500, 0.7, niv * 0.35, 0.004, 0.05);
    }
    // Du papier froissé, un sac, une boîte qu'on plie : des grains serrés.
    function froissement(sortie, t, niv) {
      var n = 6 + Math.floor(Math.random() * 6);
      for (var i = 0; i < n; i++) grain(sortie, t + hasard(0, 0.5), 'rose', 'bandpass', hasard(1800, 5200), 1.3, niv * hasard(0.3, 1), 0.003, hasard(0.015, 0.05));
    }
    function etoffe(sortie, t, niv) {   // une étoffe qu'on secoue
      for (var i = 0; i < 2 + Math.floor(Math.random() * 2); i++) grain(sortie, t + i * hasard(0.07, 0.11), 'rose', 'bandpass', hasard(800, 1500), 0.9, niv, 0.01, hasard(0.06, 0.12));
    }
    function braise(sortie, t, niv) { grain(sortie, t, 'blanc', 'bandpass', hasard(2500, 6000), 2, niv, 0.0005, hasard(0.003, 0.01)); }
    function craquement(sortie, t, niv) {   // du bois qui travaille
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(hasard(90, 150), t);
      for (var i = 1; i < 9; i++) o.frequency.setValueAtTime(hasard(80, 170), t + i * 0.04);
      var b = biquad('bandpass', hasard(600, 900), 6), g = ctx.createGain(); enveloppe(g, t, 0.05, niv, 0.35);
      o.connect(b); b.connect(g); g.connect(sortie); o.start(t); o.stop(t + 0.5);
    }
    function porteLoin(sortie, t, niv) {   // une porte qu'on referme au loin : le battant, le pêne
      grain(sortie, t, 'brun', 'lowpass', 170, 0.8, niv, 0.004, 0.12);
      grain(sortie, t + 0.03, 'blanc', 'bandpass', 2600, 3, niv * 0.25, 0.001, 0.02);
    }
    function tic(sortie, t, tac, niv) {   // l'horloge : le déclic, et le bois qui résonne un instant
      grain(sortie, t, 'blanc', 'bandpass', tac ? 2100 : 2600, 3, niv * 0.5, 0.001, 0.02);
      grain(sortie, t, 'blanc', 'bandpass', tac ? 880 : 960, 14, niv * 1.4, 0.001, 0.06);
    }
    function bip(sortie, t, f, niv) {
      var o = ctx.createOscillator(); o.frequency.value = f; var g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(niv, t + 0.006); g.gain.setValueAtTime(niv, t + 0.075); g.gain.linearRampToValueAtTime(0, t + 0.09);
      o.connect(g); g.connect(sortie); o.start(t); o.stop(t + 0.1);
    }
    function sonnette(sortie, t, niv) {   // la sonnette d'un vélo : un « drring », deux fois
      var f = hasard(2350, 2600);
      [0, 0.05, 0.1, 0.15, 0.36, 0.41, 0.46].forEach(function (d, i) { tinter(sortie, t + d, f, [1, 1.47, 2.09, 2.56], niv * (i % 4 ? 0.7 : 1), 0.8); });
    }
    function clochette(sortie, t, niv) {  // la clochette d'une porte de boutique : ses grelots qui s'agitent
      for (var i = 0; i < 5; i++) tinter(sortie, t + hasard(0, 0.35), hasard(2500, 3800), [1, 2.4, 4.1], niv * hasard(0.5, 1), 0.9);
    }
    function goutte(sortie, t, niv, grosse) {   // une goutte : un minuscule chant de bulle qui monte
      var f = grosse ? hasard(700, 2200) : hasard(1800, 5000), d = grosse ? hasard(0.05, 0.12) : hasard(0.015, 0.04);
      var o = ctx.createOscillator(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * hasard(1.2, 1.6), t + d);
      var g = ctx.createGain(); enveloppe(g, t, 0.001, niv, d); o.connect(g); g.connect(sortie); o.start(t); o.stop(t + d + 0.03);
    }
    function joint(sortie, t, niv) {   // un joint de rail sous la roue
      grain(sortie, t, 'brun', 'lowpass', 220, 0.8, niv, 0.003, 0.09);
      grain(sortie, t, 'blanc', 'bandpass', 1800, 2, niv * 0.15, 0.001, 0.03);
    }
    function crissement(sortie, t, d, niv) {   // des freins, une roue dans la courbe
      [[2650, 1], [3910, 0.5]].forEach(function (p) {
        var o = ctx.createOscillator(); o.frequency.value = p[0];
        var m = ctx.createOscillator(); m.frequency.value = hasard(5, 8); var gm = ampli(p[0] * 0.02); m.connect(gm); gm.connect(o.frequency);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(niv * p[1], t + d * 0.3);
        g.gain.linearRampToValueAtTime(niv * p[1] * 0.7, t + d * 0.8); g.gain.linearRampToValueAtTime(0, t + d);
        o.connect(g); g.connect(sortie); o.start(t); m.start(t); o.stop(t + d + 0.05); m.stop(t + d + 0.05);
      });
    }

    // ---- les oiseaux
    // Un sifflet d'oiseau : un sinus qui glisse de f0 à f1, une pointe de deuxième harmonique, un
    // trémolo de gorge (trille, en Hz ; 0 : aucun).
    function sifflet(sortie, t, d, f0, f1, niv, trille, profondeur) {
      var o = ctx.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f1, t + d);
      var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(niv, t + d * 0.2);
      g.gain.linearRampToValueAtTime(niv * 0.6, t + d * 0.75); g.gain.linearRampToValueAtTime(0, t + d);
      o.connect(g); g.connect(sortie); o.start(t); o.stop(t + d + 0.02);
      var o2 = ctx.createOscillator(); o2.frequency.setValueAtTime(f0 * 2, t); o2.frequency.linearRampToValueAtTime(f1 * 2, t + d);
      o2.connect(ampli(0.1, g)); o2.start(t); o2.stop(t + d + 0.02);
      if (trille) {
        var m = ctx.createOscillator(); m.frequency.value = trille; var gm = ampli(f0 * (profondeur || 0.03));
        m.connect(gm); gm.connect(o.frequency); gm.connect(o2.frequency); m.start(t); m.stop(t + d + 0.02);
      }
    }
    // Le merle : une phrase flûtée de trois à six notes glissées, souvent un gazouillis aigu à la fin.
    function merle(sortie, t, niv) {
      var n = 3 + Math.floor(Math.random() * 4), tt = t, i;
      for (i = 0; i < n; i++) {
        var d = hasard(0.09, 0.26), f0 = choix([1400, 1580, 1760, 1960, 2200, 2450]) * hasard(0.98, 1.02);
        sifflet(sortie, tt, d, f0, f0 * choix([0.84, 0.92, 1, 1.1, 1.22]), niv * hasard(0.6, 1), hasard(15, 32), 0.025);
        tt += d + hasard(0.015, 0.06);
      }
      if (Math.random() < 0.55) {
        tt += 0.04;
        for (i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
          var f = hasard(4800, 7000); sifflet(sortie, tt, 0.03, f, f * hasard(0.8, 1.2), niv * 0.35, 0); tt += hasard(0.035, 0.06);
        }
      }
    }
    function moineau(sortie, t, niv) {
      for (var i = 0; i < 2 + Math.floor(Math.random() * 3); i++) { var f = hasard(3800, 5200); sifflet(sortie, t + i * hasard(0.09, 0.16), hasard(0.04, 0.07), f, f * 0.72, niv, 0); }
    }
    function martinets(sortie, t, niv) {   // deux à quatre martinets qui se poursuivent en criant
      var n = 2 + Math.floor(Math.random() * 3), p0 = Math.random() < 0.5 ? -0.9 : 0.9;
      for (var i = 0; i < n; i++) {
        var tt = t + i * hasard(0.1, 0.35), d = hasard(0.25, 0.5), f = hasard(5200, 6800), p = pan(p0, sortie);
        glisserPan(p, p0, -p0 * hasard(0.3, 1), tt, d);
        sifflet(p, tt, d, f, f * 0.9, niv, hasard(55, 85), 0.07);
      }
    }
    function pigeon(sortie, t, niv) {   // « rrou-rou-rou » : un roucoulement grave, roulé
      var f = hasard(260, 320), lp = biquad('lowpass', 900, 0.7, sortie);
      [[0, 0.3, 1, 1.08], [0.42, 0.48, 1.1, 0.95], [1.02, 0.34, 1, 0.92]].forEach(function (s) {
        var t1 = t + s[0], d = s[1], am = ctx.createGain(), g = ctx.createGain();
        am.gain.value = 0.6; lfo(28, 0.4, am.gain).stop(t1 + d + 0.02);
        g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(niv, t1 + d * 0.3); g.gain.linearRampToValueAtTime(0, t1 + d);
        [1, 2].forEach(function (h) {
          var o = ctx.createOscillator(); o.frequency.setValueAtTime(f * s[2] * h, t1); o.frequency.linearRampToValueAtTime(f * s[2] * s[3] * h, t1 + d);
          o.connect(h === 1 ? am : ampli(0.25, am)); o.start(t1); o.stop(t1 + d + 0.02);
        });
        am.connect(g); g.connect(lp);
      });
    }
    function envol(sortie, t, niv) {   // des ailes qui claquent : des pigeons s'envolent
      var n = 8 + Math.floor(Math.random() * 6);
      for (var i = 0; i < n; i++) grain(sortie, t + i * hasard(0.07, 0.1), 'rose', 'bandpass', hasard(700, 1500), 1.2, niv * (1 - i / n), 0.005, 0.05);
    }
    function corneille(sortie, t, niv) {   // « kaa », rauque, une à trois fois
      for (var i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
        var tt = t + i * hasard(0.35, 0.5), d = hasard(0.2, 0.3), f = hasard(520, 680);
        var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, tt); o.frequency.linearRampToValueAtTime(f * 0.85, tt + d);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(niv, tt + 0.03);
        g.gain.linearRampToValueAtTime(niv * 0.7, tt + d * 0.7); g.gain.linearRampToValueAtTime(0, tt + d);
        o.connect(biquad('bandpass', 1300, 1.8, biquad('lowpass', 3200, 0.7, g))); g.connect(sortie); o.start(tt); o.stop(tt + d + 0.02);
        grain(sortie, tt, 'rose', 'bandpass', 1500, 1, niv * 0.3, 0.02, d);
      }
    }
    // Les oiseaux d'Aluva (prototype) : deux à cinq notes qui montent et retombent.
    function oiseauKerala(sortie, t0) {
      var t = t0 + 0.02, n = 2 + Math.floor(Math.random() * 4), base = 2400 + Math.random() * 1600;
      for (var j = 0; j < n; j++) {
        var o = ctx.createOscillator(), t1 = t + j * 0.16;
        o.frequency.setValueAtTime(base, t1); o.frequency.exponentialRampToValueAtTime(base * 1.45, t1 + 0.06);
        o.frequency.exponentialRampToValueAtTime(base * 0.9, t1 + 0.12);
        var g = ctx.createGain(); g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(0.03, t1 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0005, t1 + 0.13); o.connect(g); g.connect(sortie); o.start(t1); o.stop(t1 + 0.15);
      }
    }
    // Des grillons : deux, chacun sa hauteur, sa place et son rythme (trois impulsions par chant).
    function grillons(v, sortie, niv) {
      [[4400, -0.5, 0.85], [4950, 0.6, 1.1]].forEach(function (g) {
        var p = pan(g[1], sortie), prochain = ctx.currentTime + hasard(0.1, 0.8);
        cadence(v, function (debut, fin) {
          while (prochain < fin) {
            if (prochain >= debut) for (var i = 0; i < 3; i++) {
              var o = ctx.createOscillator(); o.frequency.value = g[0]; var e = ctx.createGain(), t = prochain + i * 0.024;
              enveloppe(e, t, 0.002, niv, 0.012); o.connect(e); e.connect(p); o.start(t); o.stop(t + 0.02);
            }
            prochain += g[2] * hasard(0.9, 1.1);
          }
        });
      });
    }
    // Le tanpura d'Aluva (prototype) : sol, do, do, do grave, pincés toutes les 1,15 s, la corde
    // qui grésille (une saturation) ; commun à kerala et au marché, pour la continuité.
    function tanpura(v, sortie, niv) {
      var courbeT = new Float32Array(1024);
      for (var i = 0; i < 1024; i++) { var x = i / 512 - 1; courbeT[i] = Math.tanh(2.2 * x) + 0.12 * Math.sin(9 * x); }
      var ws = ctx.createWaveShaper(); ws.curve = courbeT;
      var bp = biquad('peaking', 2200, undefined); bp.gain.value = 6;
      ws.connect(bp); bp.connect(ampli(0.05 * niv, sortie));
      var notes = [98, 130.81, 130.81, 65.41], k = 0, prochain = ctx.currentTime + 0.05;
      cadence(v, function (debut, fin) {
        while (prochain < fin) {
          if (prochain >= debut) {
            var t = prochain, f0 = notes[k++ % 4];
            for (var n = 1; n <= 10; n++) {
              var o = ctx.createOscillator(); o.frequency.value = f0 * n * (1 + (Math.random() - 0.5) * 0.002);
              var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5 / n, t + 0.02);
              g.gain.exponentialRampToValueAtTime(0.0008, t + 3.8); o.connect(g); g.connect(ws); o.start(t); o.stop(t + 4);
            }
          }
          prochain += 1.15;
        }
      });
    }

    // ---- les ambiances (une par lieu) : ambiances[nom](v, reglages) ; v.sortie est le gain de
    // l'ambiance ; rend, si elle le peut, { regler(reglages) } pour changer sans recommencer
    // (regler rend false quand il faut recommencer).
    var ambiances = {
      // la voûte : quelques sinus lents, un souffle (prototype)
      cosmos: function (v) {
        [[110, 0.05], [164.81, 0.035], [220.4, 0.03], [329.6, 0.012]].forEach(function (p) {
          var o = osc('sine', p[0], v), g = ampli(p[1], v.sortie);
          lfo(0.05 + Math.random() * 0.05, p[1] * 0.6, g.gain, v); o.connect(g);
        });
        var vent = source('rose', v), f = biquad('bandpass', 500, 0.5);
        vent.connect(f); f.connect(ampli(0.025, v.sortie));
      },
      // la nuit sur les toits : vent, air, rumeur lointaine de la ville (prototype)
      nuit: function (v) {
        var vent = source('brun', v), f = biquad('bandpass', 420, 0.7);
        lfo(0.05, 180, f.frequency, v); var g = ampli(0.22); lfo(0.08, 0.12, g.gain, v);
        vent.connect(f); f.connect(g); g.connect(v.sortie);
        var air = source('blanc', v), h = biquad('highpass', 3500); air.connect(h); h.connect(ampli(0.006, v.sortie));
        var ville = source('brun', v), l = biquad('lowpass', 160); ville.connect(l); l.connect(ampli(0.12, v.sortie));
      },
      // Aluva : le fleuve, ses remous, les oiseaux, un tanpura (prototype) ; { soir: true } : le
      // Periyar du soir, moins d'oiseaux, des grillons
      kerala: function (v, r) {
        var soir = !!r.soir;
        var eau = source('rose', v), l = biquad('lowpass', 1100); eau.connect(l); l.connect(ampli(0.16, v.sortie));
        var remous = source('blanc', v), b = biquad('bandpass', 900, 2.5);
        lfo(3.1, 260, b.frequency, v); lfo(5.3, 180, b.frequency, v);
        remous.connect(b); b.connect(ampli(0.035, v.sortie));
        tanpura(v, v.sortie, 1);
        souvent(v, function (t) { oiseauKerala(v.sortie, t); }, soir ? 5 : 1.6, soir ? 14 : 5.8, 0);
        if (soir) grillons(v, v.sortie, 0.01);
        return { regler: function (r2) { return !!r2.soir === soir; } };
      },
      // Le vent seul (le ciel de Paris au soir, 2.10 ; 3.14 ; l'automne, 7.2) : deux souffles graves
      // qui errent chacun de son côté, un sifflement, de l'air ; { feuilles: true } : il passe
      // dans des feuilles.
      vent: function (v, r) {
        [-0.55, 0.55].forEach(function (p) {
          var n = nappe(v, 'brun', 'bandpass', 380, 0.6, 0.5, pan(p, v.sortie));
          derive(v, n.f.frequency, 220, 720, 1.5, 4.5); derive(v, n.g.gain, 0.18, 0.75, 1.2, 4);
        });
        var s = nappe(v, 'rose', 'bandpass', 900, 9, 0.035, v.sortie);
        derive(v, s.f.frequency, 550, 1500, 2, 6); derive(v, s.g.gain, 0, 0.05, 1.5, 5);
        var a = nappe(v, 'blanc', 'highpass', 5000, 0.7, 0.004, v.sortie); derive(v, a.g.gain, 0.001, 0.007, 1, 3);
        var feuilles = ampli(0, v.sortie), fe = nappe(v, 'rose', 'bandpass', 3800, 0.6, 0.05, feuilles);
        derive(v, fe.g.gain, 0.01, 0.08, 0.3, 1.5);
        function regler(r2) { lisser(feuilles.gain, r2.feuilles ? 1 : 0, ctx.currentTime, 2); return true; }
        regler(r);
        return { regler: regler };
      },
      // Un restaurant (2.1 à 2.7) : la rumeur de la salle, sans une voix qu'on comprenne ; des
      // couverts, deux verres, une assiette posée, les pas du serveur, une chaise ; une petite salle.
      restaurant: function (v) {
        var s = salle(v, 0.9, 0.55, 0.28);
        nappe(v, 'rose', 'lowpass', 1600, 0.5, 0.05, v.sortie);
        [[280, -0.5], [520, 0.4], [850, -0.1]].forEach(function (x) {
          var n = nappe(v, 'rose', 'bandpass', x[0], 1.3, 0.12, pan(x[1], s));
          derive(v, n.g.gain, 0.04, 0.2, 0.25, 1.1);
        });
        souvent(v, function (t) {
          var k = 1 + Math.floor(Math.random() * 3), p = pan(hasard(-0.8, 0.8), s);
          for (var i = 0; i < k; i++) tinter(p, t + i * hasard(0.08, 0.2), hasard(2300, 4200), [1, 2.76, 5.4], hasard(0.02, 0.06), hasard(0.08, 0.2));
        }, 1.2, 4.5);
        souvent(v, function (t) {
          var p = pan(hasard(-0.7, 0.7), s), f = hasard(1700, 2400);
          tinter(p, t, f, [1, 2.32, 4.25], 0.05, 0.9); tinter(p, t + 0.012, f * 1.07, [1, 2.32, 4.25], 0.035, 0.7);
        }, 12, 30);
        souvent(v, function (t) {
          var p = pan(hasard(-0.6, 0.6), s);
          grain(p, t, 'brun', 'lowpass', 300, 0.7, 0.5, 0.003, 0.06); tinter(p, t, hasard(2800, 3600), [1, 1.9, 3.1], 0.03, 0.25);
        }, 6, 16);
        souvent(v, function (t) {
          var d = Math.random() < 0.5; marcheur(s, t, 'bois', 5 + Math.floor(Math.random() * 4), 0.46, 0.35, d ? -0.9 : 0.9, d ? 0.9 : -0.9);
        }, 14, 32, 5);
        souvent(v, function (t) {
          var b = grain(pan(hasard(-0.7, 0.7), s), t, 'blanc', 'bandpass', 650, 3, 0.1, 0.05, 0.4);
          b.frequency.setValueAtTime(600, t); b.frequency.linearRampToValueAtTime(950, t + 0.4);
        }, 25, 60);
      },
      // Paris, la rue : la circulation au loin, des voitures qui passent, des pas, des pigeons, un
      // scooter ; { densite }, { nuit }, { ete } (voir l'en-tête), sans recommencer.
      rue: function (v, r) {
        var reg = {}, s = salle(v, 0.7, 0.6, 0.12);
        var loin = nappe(v, 'brun', 'lowpass', 320, 0.5, 0.4, v.sortie); derive(v, loin.f.frequency, 220, 420, 3, 8);
        var ville = nappe(v, 'rose', 'bandpass', 180, 0.8, 0.05, v.sortie);
        function regler(r2) {
          reg.densite = borne(nombre(r2.densite, 0.5)); reg.nuit = !!r2.nuit; reg.ete = !!r2.ete;
          var k = reg.nuit ? 0.8 : 0.6 + 0.8 * reg.densite, t = ctx.currentTime;
          lisser(loin.g.gain, 0.2 * k, t, 2); lisser(ville.g.gain, 0.04 * k, t, 2);
          return true;
        }
        regler(r);
        souvent(v, function (t) {
          if (Math.random() > (reg.nuit ? 0.25 : 0.35 + 0.65 * reg.densite)) return;
          var g = Math.random() < 0.5;
          passage(s, t, hasard(2.8, 5), hasard(0.1, 0.3), g ? -0.9 : 0.9, g ? 0.9 : -0.9, reg.densite > 0.8 && Math.random() < 0.3 ? 'bus' : 'voiture');
        }, 1.5, 4.5, 1);
        souvent(v, function (t) { if (Math.random() < 0.6) { var g = Math.random() < 0.5; passage(s, t, hasard(5, 8), hasard(0.02, 0.04), g ? -1 : 1, g ? 0.4 : -0.4, 'scooter'); } }, 18, 45);
        souvent(v, function (t) {
          var g = Math.random() < 0.5; marcheur(s, t, Math.random() < 0.3 ? 'talons' : 'pave', 6 + Math.floor(Math.random() * 6), hasard(0.48, 0.56), hasard(0.3, 0.55), g ? -0.8 : 0.8, g ? 0.7 : -0.7);
        }, 5, 14, 2);
        souvent(v, function (t) { if (!reg.nuit) pigeon(pan(hasard(-0.7, 0.7), s), t, hasard(0.07, 0.13)); }, 7, 18, 3);
        souvent(v, function (t) { if (!reg.nuit) envol(pan(hasard(-0.6, 0.6), s), t, 0.12); }, 30, 70);
        souvent(v, function (t) { if (reg.ete) martinets(s, t, hasard(0.025, 0.05)); }, 3, 9, 1);
        souvent(v, function (t) { if (!reg.nuit && reg.densite > 0.3) klaxon(pan(hasard(-0.8, 0.8), s), t, 0.012); }, 35, 90);
        return { regler: regler };
      },
      // Le parc Montsouris (2.8, 6.14 ; le village rêvé, 4.5) : le feuillage qui respire, le
      // merle, des moineaux, des pas sur le gravier ; la ville loin derrière les arbres.
      parc: function (v) {
        var s = salle(v, 1.2, 0.5, 0.1);
        [-0.5, 0.5].forEach(function (p) {
          var n = nappe(v, 'rose', 'bandpass', 3000, 0.5, 0.05, pan(p, v.sortie));
          derive(v, n.g.gain, 0.01, 0.08, 1, 3.5); derive(v, n.f.frequency, 2000, 4500, 2, 5);
        });
        nappe(v, 'brun', 'lowpass', 240, 0.5, 0.12, v.sortie);
        souvent(v, function (t) { merle(pan(hasard(-0.6, 0.6), s), t, hasard(0.06, 0.1)); }, 4, 10, 1.5);
        souvent(v, function (t) { moineau(pan(hasard(-0.9, 0.9), s), t, hasard(0.02, 0.05)); }, 2, 6);
        souvent(v, function (t) {
          var d = Math.random() < 0.5; marcheur(s, t, 'gravier', 7 + Math.floor(Math.random() * 5), 0.55, 0.4, d ? -0.8 : 0.8, d ? 0.6 : -0.6);
        }, 12, 28, 6);
      },
      // Les bibliothèques (3.6 à 3.8) : un silence habité, la ventilation, des pages tournées au
      // loin, des pas feutrés, un livre posé, une chaise ; { vaste: true } : la même sous la voûte
      // immense de Pékin (la réverbération passe de 1,5 à 5 s, sans recommencer).
      bibliotheque: function (v, r) {
        var entree = ampli(1), sec = ampli(1, v.sortie), petite = ampli(0.3, v.sortie), grande = ampli(0, v.sortie), c2 = null;
        var c1 = convolueur(v, 1.5, 0.5);
        entree.connect(sec); entree.connect(c1); c1.connect(petite);
        nappe(v, 'brun', 'lowpass', 160, 0.5, 0.05, v.sortie);
        var air = nappe(v, 'rose', 'bandpass', 500, 0.5, 0.03, v.sortie); derive(v, air.g.gain, 0.018, 0.04, 3, 8);
        nappe(v, 'rose', 'highpass', 2200, 0.5, 0.006, v.sortie);
        souvent(v, function (t) { feuillet(pan(hasard(-0.8, 0.8), entree), t, hasard(0.08, 0.16)); }, 2.5, 8, 1);
        souvent(v, function (t) {
          var d = Math.random() < 0.5; marcheur(entree, t, 'feutre', 4 + Math.floor(Math.random() * 5), 0.62, 0.45, d ? -0.7 : 0.7, d ? 0.5 : -0.5);
        }, 9, 22, 4);
        souvent(v, function (t) { var p = pan(hasard(-0.6, 0.6), entree); grain(p, t, 'brun', 'lowpass', 190, 0.7, 0.1, 0.006, 0.09); feuillet(p, t + 0.02, 0.03); }, 14, 35, 8);
        souvent(v, function (t) { craquement(pan(hasard(-0.7, 0.7), entree), t, 0.015); }, 25, 60);
        function regler(r2) {
          var t = ctx.currentTime, vaste = !!r2.vaste;
          if (vaste && !c2) { c2 = convolueur(v, 5, 0.32); entree.connect(c2); c2.connect(grande); }   // la voûte de Pékin, à la demande
          lisser(petite.gain, vaste ? 0 : 0.3, t, 3); lisser(grande.gain, vaste ? 0.7 : 0, t, 3); lisser(sec.gain, vaste ? 0.65 : 1, t, 3);
          return true;
        }
        regler(r);
        return { regler: regler };
      },
      // La vision (3.10, 3.11) : le Periyar du soir s'éloigne, des grillons ; un souffle à chaque
      // inspiration, jamais tout à fait au même rythme ; des braises qui crépitent à peine ; un
      // grave sans air (sur un petit haut-parleur, on ne l'entend pas).
      vision: function (v) {
        nappe(v, 'rose', 'lowpass', 650, 0.5, 0.07, v.sortie);
        grillons(v, v.sortie, 0.012);
        var sf = nappe(v, 'rose', 'bandpass', 500, 0.9, 0, v.sortie);
        (function respirer() {
          var t = ctx.currentTime + 0.05, i = hasard(2.1, 2.7), p = hasard(0.4, 0.9), e = hasard(2.6, 3.4);
          var g = sf.g.gain, f = sf.f.frequency;
          if (!enMarche()) { v.plusTard(respirer, 500); return; }
          g.setValueAtTime(0.0001, t); g.linearRampToValueAtTime(0.15, t + i); g.linearRampToValueAtTime(0.05, t + i + p); g.linearRampToValueAtTime(0.0001, t + i + p + e);
          f.setValueAtTime(420, t); f.linearRampToValueAtTime(1100, t + i); f.linearRampToValueAtTime(700, t + i + p); f.linearRampToValueAtTime(380, t + i + p + e);
          v.plusTard(respirer, (i + p + e + hasard(0.8, 1.6)) * 1000);
        })();
        souvent(v, function (t) { braise(v.sortie, t, hasard(0.015, 0.06)); }, 0.25, 1.4);
        [55, 55.23].forEach(function (f) { osc('sine', f, v).connect(ampli(0.015, v.sortie)); });
      },
      // Le métro (4.1) : la station carrelée qui résonne, la rumeur des tunnels, des pas, une rame
      // qui arrive, freine, souffle, puis repart ; { rame: true } (4.3, le RER) : dans la rame.
      metro: function (v, r) {
        var dedans = !!r.rame;
        if (dedans) rame(v);
        else {
          var s = salle(v, 2.4, 0.45, 0.45);
          var sourd = nappe(v, 'brun', 'lowpass', 110, 0.6, 0.25, v.sortie); derive(v, sourd.g.gain, 0.14, 0.32, 2, 6);
          nappe(v, 'rose', 'bandpass', 1100, 0.5, 0.03, s);
          souvent(v, function (t) {
            var g = Math.random() < 0.5; marcheur(s, t, Math.random() < 0.4 ? 'talons' : 'pave', 5 + Math.floor(Math.random() * 5), 0.5, 0.18, g ? -0.8 : 0.8, g ? 0.6 : -0.6);
          }, 4, 10, 2);
          souvent(v, function (t) { arrivee(v, s, t); }, 38, 55, hasard(3, 7));
        }
        return { regler: function (r2) { return !!r2.rame === dedans; } };
      },
      // L'hôpital (4.2, 7.5) : le couloir, la ventilation, les néons ; des bips lointains et
      // désaccordés (chaque moniteur sa hauteur et son rythme, qui se taisent et reprennent) ; un
      // chariot, des pas qui couinent, une porte au loin.
      hopital: function (v) {
        var s = salle(v, 1.3, 0.55, 0.35);
        nappe(v, 'brun', 'lowpass', 200, 0.5, 0.05, v.sortie);
        nappe(v, 'rose', 'bandpass', 2200, 0.4, 0.014, v.sortie);
        [100, 200, 300, 400].forEach(function (f, i) { osc('sine', f, v).connect(ampli(0.005 / (i + 1), v.sortie)); });
        [[943, -0.6], [1187, 0.5], [1411, 0.1]].forEach(function (m, i) {
          var p = pan(m[1], s), periode = hasard(0.8, 1.35), marche = i < 2, prochain = ctx.currentTime + hasard(0.2, 1);
          cadence(v, function (debut, fin) {
            while (prochain < fin) { if (marche && prochain >= debut) bip(p, prochain, m[0], 0.035); prochain += periode; }
          });
          (function alterner() { v.plusTard(function () { marche = !marche; alterner(); }, hasard(marche ? 15 : 5, marche ? 45 : 18) * 1000); })();
        });
        souvent(v, function (t) { chariot(v, s, t); }, 16, 38, 6);
        souvent(v, function (t) {
          var g = Math.random() < 0.5, p = pan(g ? -0.7 : 0.7, s); glisserPan(p, g ? -0.7 : 0.7, g ? 0.5 : -0.5, t, 3);
          for (var i = 0; i < 6; i++) {
            pas(p, t + i * 0.52, 'lino', 0.22);
            if (Math.random() < 0.3) sifflet(p, t + i * 0.52 + 0.03, 0.05, 1900, 2300, 0.004, 0);   // la semelle qui couine
          }
        }, 7, 18, 3);
        souvent(v, function (t) { porteLoin(pan(hasard(-0.8, 0.8), s), t, 0.15); }, 22, 55);
      },
      // La chambre de Julie (4.7, 5.1, 5.6 à 5.9) : une pièce calme, la rue étouffée derrière la
      // fenêtre ; { fenetre: true } : elle s'entrouvre (la rue plus claire, des martinets, 5.1) ;
      // { nuit: true } : presque plus de voitures.
      chambre: function (v, r) {
        var reg = {};
        nappe(v, 'rose', 'lowpass', 600, 0.5, 0.04, v.sortie);
        var vitre = biquad('lowpass', 480, 0.6, v.sortie);   // tout ce qui vient de dehors passe par elle
        var rue = nappe(v, 'brun', 'lowpass', 300, 0.5, 0.16, vitre);
        function regler(r2) {
          reg.fenetre = !!r2.fenetre; reg.nuit = !!r2.nuit;
          var t = ctx.currentTime;
          lisser(vitre.frequency, reg.fenetre ? 2600 : 480, t, 2); lisser(rue.g.gain, reg.nuit ? 0.11 : 0.16, t, 2);
          return true;
        }
        regler(r);
        souvent(v, function (t) {
          if (Math.random() < (reg.nuit ? 0.25 : 0.7)) { var g = Math.random() < 0.5; passage(vitre, t, hasard(3, 5), hasard(0.06, 0.14), g ? -0.7 : 0.7, g ? 0.7 : -0.7, 'voiture'); }
        }, 5, 14, 3);
        souvent(v, function (t) { if (reg.fenetre && !reg.nuit) martinets(vitre, t, 0.03); }, 4, 10);
        souvent(v, function (t) { if (!reg.nuit) pigeon(pan(0.6, vitre), t, 0.05); }, 20, 45);
        souvent(v, function (t) { craquement(pan(hasard(-0.5, 0.5), v.sortie), t, 0.015); }, 30, 70);
        return { regler: regler };
      },
      // Le marché d'Aluva (5.2 à 5.5) : le tanpura (la continuité avec kerala), la foule sans une
      // voix (des pas, des frottements), du laiton qui tinte, des étoffes, une sonnette de vélo,
      // des corneilles, un klaxon de rickshaw, la chaleur (les insectes).
      marche: function (v) {
        var s = salle(v, 0.8, 0.6, 0.1);
        tanpura(v, v.sortie, 0.55);
        [-0.5, 0.5].forEach(function (p) { var n = nappe(v, 'rose', 'bandpass', 420, 0.7, 0.07, pan(p, v.sortie)); derive(v, n.g.gain, 0.03, 0.1, 0.5, 2); });
        nappe(v, 'brun', 'lowpass', 300, 0.5, 0.12, v.sortie);
        var ins = nappe(v, 'blanc', 'bandpass', 5200, 4, 0.01, v.sortie); derive(v, ins.g.gain, 0.002, 0.014, 2, 6);
        souvent(v, function (t) { pas(pan(hasard(-0.9, 0.9), s), t, 'poussiere', hasard(0.1, 0.25)); }, 0.3, 1.2);
        souvent(v, function (t) { tinter(pan(hasard(-0.8, 0.8), s), t, hasard(900, 1700), [1, 2.1, 3.9, 5.3], hasard(0.02, 0.05), hasard(0.6, 1.4)); }, 1.5, 5);
        souvent(v, function (t) { etoffe(pan(hasard(-0.8, 0.8), s), t, hasard(0.05, 0.12)); }, 4, 10);
        souvent(v, function (t) { sonnette(pan(hasard(-0.8, 0.8), s), t, 0.03); }, 14, 32, 5);
        souvent(v, function (t) { corneille(pan(hasard(-0.8, 0.8), s), t, 0.05); }, 5, 14, 2);
        souvent(v, function (t) { klaxon(pan(hasard(-0.9, 0.9), s), t, 0.01, true); }, 20, 50);
      },
      // La pâtisserie (5.10, 5.11) : le ronron de la vitrine réfrigérée, qui s'arrête et repart ;
      // la rue derrière la vitre, du papier, la caisse, et de loin en loin la clochette de la porte.
      patisserie: function (v) {
        var s = salle(v, 0.7, 0.6, 0.18), froid = ampli(1, v.sortie);
        var m = osc('sawtooth', 50, v), mb = biquad('lowpass', 420, 1.5); m.connect(mb); mb.connect(ampli(0.03, froid));
        var ventil = nappe(v, 'rose', 'bandpass', 900, 0.8, 0.045, froid); derive(v, ventil.g.gain, 0.032, 0.055, 2, 6);
        (function cycle(marche) {
          var t = ctx.currentTime;
          if (enMarche()) { lisser(froid.gain, marche ? 1 : 0.25, t, marche ? 1.2 : 2.5); if (marche) grain(s, t, 'blanc', 'bandpass', 1500, 2, 0.05, 0.001, 0.02); }   // le relais
          v.plusTard(function () { cycle(!marche); }, hasard(marche ? 25 : 8, marche ? 50 : 16) * 1000);
        })(true);
        nappe(v, 'brun', 'lowpass', 280, 0.5, 0.05, v.sortie);
        souvent(v, function (t) { froissement(pan(hasard(-0.6, 0.6), s), t, 0.08); }, 7, 18, 3);
        souvent(v, function (t) { var p = pan(-0.4, s); bip(p, t, 1900, 0.012); bip(p, t + 0.14, 1900, 0.012); }, 25, 50);
        souvent(v, function (t) { clochette(pan(0.7, s), t, 0.03); }, 35, 80, 15);
      },
      // L'appartement emprunté (6.5 à 6.13) : les tentures étouffent tout, la rue monte à peine
      // d'en bas, une horloge au loin, l'encens qui crépite ; { horloge: 0 à 1 } (0,3 par défaut ;
      // 1 : l'attente de 6.9, au premier plan), sans recommencer : l'horloge garde son pas.
      appartement: function (v, r) {
        nappe(v, 'rose', 'lowpass', 700, 0.5, 0.03, v.sortie);
        var rue = nappe(v, 'brun', 'lowpass', 240, 0.5, 0.1, v.sortie); derive(v, rue.g.gain, 0.06, 0.14, 3, 9);
        var basse = biquad('lowpass', 500, 0.7, v.sortie);
        souvent(v, function (t) { var g = Math.random() < 0.5; passage(basse, t, hasard(4, 6), hasard(0.03, 0.07), g ? -0.6 : 0.6, g ? 0.6 : -0.6, 'voiture'); }, 9, 24, 4);
        var h = ampli(0.3, v.sortie), prochain = ctx.currentTime + 0.4, k = 0;
        cadence(v, function (debut, fin) { while (prochain < fin) { if (prochain >= debut) tic(h, prochain, k % 2, 0.3); k++; prochain += 1; } });
        souvent(v, function (t) { braise(v.sortie, t, hasard(0.004, 0.012)); }, 0.6, 2.8);
        souvent(v, function (t) { etoffe(pan(hasard(-0.6, 0.6), v.sortie), t, 0.02); }, 18, 40);
        function regler(r2) { lisser(h.gain, borne(nombre(r2.horloge, 0.3)), ctx.currentTime, 1.5); return true; }
        regler(r);
        return { regler: regler };
      },
      // Le désert libyque (7.1, 7.3) : un vent large et bas, le sable qui file, la nuit immense ;
      // { vent: 0 à 1 } : le vent tombe (7.1), reste le souffle aigu du sable ; { jour: true } (7.3) :
      // la chaleur, un vent sec et plus léger, le sable qui siffle.
      desert: function (v, r) {
        var jour = !!r.jour, air = ampli(1, v.sortie);
        [-0.7, 0.7].forEach(function (p) {
          var n = nappe(v, 'brun', 'lowpass', jour ? 420 : 300, 0.5, jour ? 0.4 : 0.55, pan(p, air));
          derive(v, n.g.gain, jour ? 0.22 : 0.3, jour ? 0.55 : 0.7, 2, 6); derive(v, n.f.frequency, 200, jour ? 600 : 450, 3, 8);
        });
        var rafale = nappe(v, 'rose', 'bandpass', 650, 0.7, 0.05, air); derive(v, rafale.g.gain, 0.01, 0.08, 1.5, 5);
        var sable = nappe(v, 'blanc', 'highpass', 4500, 0.7, 0.01, v.sortie); derive(v, sable.g.gain, 0.002, jour ? 0.02 : 0.012, 0.2, 0.9);
        if (!jour) nappe(v, 'brun', 'lowpass', 70, 0.5, 0.35, v.sortie);
        else {
          var chaleur = nappe(v, 'rose', 'bandpass', 7000, 2, 0.004, v.sortie); derive(v, chaleur.g.gain, 0.001, 0.006, 3, 8);
          souvent(v, function (t) { grain(pan(hasard(-0.8, 0.8), v.sortie), t, 'blanc', 'bandpass', hasard(2500, 4000), 6, 0.02, 0.4, 0.8); }, 6, 15);
        }
        function regler(r2) { lisser(air.gain, Math.max(0.05, borne(nombre(r2.vent, 1))), ctx.currentTime, 3); return !!r2.jour === jour; }
        regler(r);
        return { regler: regler };
      },
      // La pluie (7.4) : une averse qui s'apaise en une vingtaine de secondes, puis des gouttes ;
      // { densite: 0 à 1 } : une pluie qui ne change plus.
      pluie: function (v, r) { return averse(v, typeof r.densite === 'number' ? borne(r.densite) : null); }
    };
    // Un chariot d'hôpital qui passe : les roues qui cahotent, le métal qui tinte à peine.
    function chariot(v, sortie, t) {
      var d = hasard(3.5, 6), g0 = Math.random() < 0.5 ? -0.8 : 0.8, p = pan(g0, sortie); glisserPan(p, g0, -g0, t, d);
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + d / 2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(p);
      var s = ctx.createBufferSource(); s.buffer = bruit('brun'); s.loop = true;
      var am = ampli(0.6, g); s.connect(biquad('lowpass', 380, 1, am));
      var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = hasard(18, 26); o.connect(ampli(0.4, am.gain));
      var s2 = ctx.createBufferSource(); s2.buffer = bruit('blanc'); s2.loop = true;
      var am2 = ampli(0.02, g); s2.connect(biquad('bandpass', 3200, 5, am2));
      var o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 13; o2.connect(ampli(0.02, am2.gain));
      [s, s2, o, o2].forEach(function (n) { n.start(t); n.stop(t + d + 0.1); v.garder(n); });
    }
    // Une rame qui arrive en station, freine, souffle, reste, puis repart (vingt-sept secondes).
    function arrivee(v, sortie, t) {
      var s = ctx.createBufferSource(); s.buffer = bruit('brun'); s.loop = true; v.garder(s);
      var lp = biquad('lowpass', 70, 0.8), g = ctx.createGain(); s.connect(lp); lp.connect(g); g.connect(sortie);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55, t + 7); lp.frequency.setValueAtTime(70, t); lp.frequency.exponentialRampToValueAtTime(420, t + 7);
      g.gain.exponentialRampToValueAtTime(0.12, t + 9.5); lp.frequency.exponentialRampToValueAtTime(160, t + 9.5);
      g.gain.setValueAtTime(0.12, t + 16.5); lp.frequency.setValueAtTime(160, t + 16.5);
      g.gain.exponentialRampToValueAtTime(0.45, t + 20); lp.frequency.exponentialRampToValueAtTime(380, t + 20);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 27); lp.frequency.exponentialRampToValueAtTime(90, t + 27);
      s.start(t, Math.random() * 5); s.stop(t + 27.2);
      var tj = t + 2, iv = 0.22;
      while (tj < t + 8.5) { joint(sortie, tj, 0.25 * (tj - t) / 8); tj += iv; iv *= 1.12; }
      crissement(sortie, t + 5.6, 3.2, 0.03);
      grain(sortie, t + 9.3, 'blanc', 'highpass', 1800, 0.7, 0.18, 0.02, 1.1);
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t + 17); o.frequency.exponentialRampToValueAtTime(420, t + 23);
      var og = ctx.createGain(); og.gain.setValueAtTime(0, t + 17); og.gain.linearRampToValueAtTime(0.02, t + 20); og.gain.linearRampToValueAtTime(0, t + 25);
      o.connect(biquad('bandpass', 600, 2, og)); og.connect(sortie); o.start(t + 17); o.stop(t + 25.2); v.garder(o);
      tj = t + 19; iv = 0.8;
      while (tj < t + 25.5) { joint(sortie, tj, 0.2 * Math.max(0.1, 1 - (tj - t - 19) / 7)); tj += iv; iv = Math.max(0.2, iv * 0.86); }
    }
    // Dans la rame qui roule (4.3) : le roulement, la tôle qui vibre (un panneau qui résonne), le
    // cliquetis, le moteur, les joints des rails (ta-dam, ta-dam), un crissement dans les courbes.
    function rame(v) {
      var roule = nappe(v, 'brun', 'lowpass', 180, 0.7, 0.3, v.sortie); derive(v, roule.g.gain, 0.2, 0.38, 1.5, 4); derive(v, roule.f.frequency, 140, 260, 2, 5);
      var tole = nappe(v, 'brun', 'bandpass', 190, 14, 0.3, v.sortie); derive(v, tole.g.gain, 0.08, 0.45, 0.6, 2.2); derive(v, tole.f.frequency, 170, 230, 3, 8);
      var panneau = nappe(v, 'rose', 'bandpass', 650, 4, 0.03, v.sortie); derive(v, panneau.g.gain, 0.008, 0.05, 0.3, 1.2);   // un panneau qui tremble
      var cliquetis = nappe(v, 'blanc', 'bandpass', 2400, 6, 0.02, v.sortie); derive(v, cliquetis.g.gain, 0.004, 0.035, 0.15, 0.6);
      var m = osc('sawtooth', 110, v); m.connect(biquad('bandpass', 440, 3, ampli(0.012, v.sortie))); derive(v, m.frequency, 95, 130, 4, 9);
      var prochain = ctx.currentTime + 0.3;
      cadence(v, function (debut, fin) {
        while (prochain < fin) { if (prochain >= debut) { joint(v.sortie, prochain, 0.35); joint(v.sortie, prochain + 0.13, 0.28); } prochain += hasard(0.9, 1.5); }
      });
      souvent(v, function (t) { crissement(v.sortie, t, hasard(1, 2.2), 0.02); }, 14, 32, 8);
    }
    // La pluie : un ruissellement (deux bruits roses, un par oreille), le grondement d'une averse,
    // et des gouttes, plus ou moins serrées ; densite null : averse, puis gouttes.
    function averse(v, densite) {
      var t0 = ctx.currentTime, voies = [-0.8, -0.4, 0, 0.4, 0.8].map(function (p) { return pan(p, v.sortie); });
      var ruis = [-0.6, 0.6].map(function (p) { return nappe(v, 'rose', 'bandpass', 2600, 0.35, 0, pan(p, v.sortie)); });
      var gros = nappe(v, 'brun', 'lowpass', 500, 0.5, 0, v.sortie), d = densite;
      function nappes(x, t, duree) {
        ruis.forEach(function (n) { lisser(n.g.gain, 0.02 + 0.3 * x, t, duree); });
        lisser(gros.g.gain, 0.3 * x * x, t, duree);
      }
      function actuelle(t) { if (d !== null) return d; var x = t - t0; return x < 9 ? 1 : x < 26 ? 1 - 0.9 * (x - 9) / 17 : 0.1; }
      if (d === null) { nappes(1, t0, 1); nappes(0.1, t0 + 9, 17); } else nappes(d, t0, 1);
      cadence(v, function (debut, fin) {
        var x = actuelle(debut), taux = 1.5 + 40 * x * x, t = debut + expo(taux);
        while (t < fin) { goutte(choix(voies), t, hasard(0.01, 0.05) * (x < 0.3 ? 1.6 : 1), x < 0.3 && Math.random() < 0.5); t += expo(taux); }
      });
      return { regler: function (r) { if (typeof r.densite !== 'number') return false; d = borne(r.densite); nappes(d, ctx.currentTime, 2); return true; } };
    }

    // Fondu enchaîné : l'ancienne s'éteint en 2,5 s, puis sa vie s'arrête (sources et minuteries) ;
    // la nouvelle monte en 3 s. Un nom inconnu ou 'silence' : seule l'extinction a lieu.
    function changerAmbiance(nom, r) {
      var t = ctx.currentTime;
      if (ambiance) {
        var ancienne = ambiance;
        try { lisser(ancienne.gain.gain, 0, t, 2.5); } catch (e) { rate(e); }
        horloge.poser(function () { ancienne.vie.arreter(); }, 2700);
        ambiance = null;
      }
      if (!nom || !ambiances.hasOwnProperty(nom)) return;
      var g = ampli(0, monde); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(niveau('ambiances', nom), t + 3);
      ambiance = { nom: nom, r: r, gain: g, vie: vie(g), regler: null };
      try { var res = ambiances[nom](ambiance.vie, r || {}); if (res && res.regler) ambiance.regler = res.regler; } catch (e) { rate(e); }
    }
    function appliquerFiltre(nom, duree) {
      var t = ctx.currentTime, f = nom === 'assourdi' ? ASSOURDI : OUVERT;
      filtres.forEach(function (b) {
        tenir(b.frequency, t);
        if (duree > 0) b.frequency.exponentialRampToValueAtTime(f, t + duree); else b.frequency.setValueAtTime(f, t);
      });
      lisser(monde.gain, nom === 'assourdi' ? 0.7 : 1, t, duree);   // étouffé, le monde baisse aussi un peu
    }

    // ---- les couches
    // Le cœur : un double coup grave et chaud (le « poum », puis le « pa »), comme entendu à travers
    // la poitrine ; une saturation lui donne de quoi s'entendre sur un petit haut-parleur. Celui de
    // Julie est plus clair, plus léger.
    function battre(sortie, t, timbre) {
      var clair = timbre === 'julie';
      [[0, 1], [clair ? 0.25 : 0.29, 0.6]].forEach(function (c) {
        var t1 = t + c[0], f = (clair ? 70 : 50) * (c[0] ? 1.2 : 1);
        var o = ctx.createOscillator(); o.frequency.setValueAtTime(f * 1.8, t1); o.frequency.exponentialRampToValueAtTime(f, t1 + 0.045);
        var g = ctx.createGain(); enveloppe(g, t1, 0.005, 0.5 * c[1], clair ? 0.075 : 0.11);
        o.connect(g); g.connect(sortie); o.start(t1); o.stop(t1 + 0.3);
        grain(sortie, t1, 'brun', 'bandpass', clair ? 340 : 230, 1.4, (clair ? 2.2 : 2.6) * c[1], 0.004, clair ? 0.045 : 0.07);   // le corps
        grain(sortie, t1, 'rose', 'bandpass', clair ? 900 : 650, 1, (clair ? 0.5 : 0.4) * c[1], 0.002, 0.018);                   // le heurt
      });
    }
    function battements(v, o) {
      var chaud = ctx.createWaveShaper(); chaud.curve = courbeDouce(1.6); chaud.connect(v.sortie);
      var coeurs = [null, null];   // le premier (Darshan, ou Julie seule) ; le second, celui de Julie
      function tempoA(c, t) { if (!c.d || t >= c.t0 + c.d) return c.a; if (t <= c.t0) return c.de; return c.de + (c.a - c.de) * (t - c.t0) / c.d; }
      function maj(i, tempo, timbre, d, t) {
        if (tempo === false || tempo === 0 || tempo === null) { coeurs[i] = null; return; }
        var c = coeurs[i];
        if (tempo === undefined) { if (c) c.timbre = timbre; return; }
        tempo = Math.max(30, Math.min(200, nombre(tempo, 72)));
        if (!c) { coeurs[i] = { de: tempo, a: tempo, t0: t, d: 0, prochain: t + 0.08 + (i ? 0.27 : 0), timbre: timbre, arythmie: false, caler: 0 }; return; }
        c.de = tempoA(c, t); c.a = tempo; c.t0 = t; c.d = d; c.timbre = timbre;
      }
      function regler(o2) {
        var t = ctx.currentTime, d = Math.max(0, nombre(o2.duree, 0)) / 1000;
        var timbre = o2.qui === 'julie' ? 'julie' : o2.qui ? 'darshan' : (coeurs[0] ? coeurs[0].timbre : 'darshan');
        maj(0, o2.tempo !== undefined ? o2.tempo : (coeurs[0] ? undefined : 72), timbre, d, t);
        if (o2.julie !== undefined) maj(1, o2.julie, 'julie', d, t);
        coeurs.forEach(function (c) { if (c && o2.arythmie !== undefined) c.arythmie = !!o2.arythmie && c.timbre === 'julie'; });
        if (o2.cale && coeurs[0] && coeurs[1]) coeurs[1].caler = t + d;
        if (typeof o2.force === 'number') lisser(v.sortie.gain, niveau('couches', 'battements') * borne(o2.force), t, 0.4);
      }
      regler(o);
      cadence(v, function (debut, fin) {
        coeurs.forEach(function (c, i) {
          if (!c) return;
          if (i === 1 && c.caler && debut >= c.caler && coeurs[0]) { c.prochain = coeurs[0].prochain; c.caler = 0; }
          while (c.prochain < fin) {
            if (c.prochain >= debut - 0.02) battre(chaud, c.prochain, c.timbre);
            var iv = 60 / tempoA(c, c.prochain);
            c.prochain += c.arythmie ? iv * hasard(0.75, 1.3) : iv;
          }
        });
      });
      return { regler: regler };
    }
    // Le vibreur d'un téléphone posé sur une table : deux vrombissements, un silence, et encore.
    function vibreur(v, o, finir) {
      var porte = ampli(0), fois = Math.max(0, Math.round(nombre(o.fois, 0))), n = 0, fini = false;
      porte.connect(biquad('bandpass', 330, 2.2, v.sortie)); porte.connect(biquad('bandpass', 1250, 5, ampli(0.6, v.sortie)));
      [171, 175.5].forEach(function (f) { osc('square', f, v).connect(ampli(0.4, porte)); });
      function vrombir(t, d) { var p = porte.gain; p.setValueAtTime(0, t); p.linearRampToValueAtTime(1, t + 0.02); p.setValueAtTime(1, t + d - 0.03); p.linearRampToValueAtTime(0, t + d); }
      var prochain = ctx.currentTime + 0.05;
      cadence(v, function (debut, fin) {
        while (!fini && prochain < fin) {
          if (fois && n >= fois) { fini = true; v.plusTard(finir, Math.max(0, prochain - ctx.currentTime) * 1000 + 200); return; }
          vrombir(prochain, 0.4); vrombir(prochain + 0.6, 0.4); n++; prochain += 2.3;
        }
      });
      return { regler: function (o2) { if (typeof o2.force === 'number') lisser(v.sortie.gain, niveau('couches', 'vibration') * borne(o2.force), ctx.currentTime, 0.2); } };
    }
    // Le feu du soir au bord du Periyar (7.6, 7.7) : le souffle des flammes, des crépitements (par
    // grappes, parfois), le grésillement des sardines.
    function crepiter(sortie, t, niv) { grain(sortie, t, 'blanc', 'bandpass', hasard(1500, 6000), hasard(1, 4), niv, 0.0005, hasard(0.003, 0.012)); }
    function feu(v) {
      var flamme = nappe(v, 'brun', 'lowpass', 320, 0.6, 0.35, v.sortie); derive(v, flamme.g.gain, 0.2, 0.5, 0.4, 1.8); derive(v, flamme.f.frequency, 220, 480, 0.6, 2);
      var gres = nappe(v, 'rose', 'bandpass', 5500, 0.9, 0.02, v.sortie); derive(v, gres.g.gain, 0.006, 0.03, 0.1, 0.45);
      var voies = [-0.4, -0.1, 0.2, 0.5].map(function (p) { return pan(p, v.sortie); });
      cadence(v, function (debut, fin) {
        var t = debut + expo(7);
        while (t < fin) {
          var p = choix(voies);
          if (Math.random() < 0.12) { for (var i = 0; i < 4; i++) crepiter(p, t + i * hasard(0.008, 0.03), hasard(0.05, 0.2)); }
          else crepiter(p, t, Math.pow(Math.random(), 2) * 0.35);
          t += expo(7);
        }
      });
      return { regler: function () { return true; } };
    }
    // La télévision derrière une porte (7.2), sans une parole : une rumeur (des phrases de bruit,
    // jamais des mots), la musique d'une série inventée pour le livre, des rires étouffés ; tout
    // passe par la porte (un passe-bas) et la pièce d'à côté.
    var GENERIQUE = [   // sol majeur, 112 à la noire ; [hauteur MIDI, durée en croches]
      [[76, 2], [79, 1], [76, 1], [74, 2], [72, 2]], [[72, 2], [76, 2], [74, 4]],
      [[77, 2], [76, 1], [74, 1], [72, 2], [69, 2]], [[71, 2], [74, 2], [79, 4]]
    ];
    var BASSE_GENERIQUE = [[43, 43, 50, 50], [40, 40, 47, 47], [36, 36, 43, 43], [38, 38, 45, 42]];
    function generique(v, sortie, t, court) {
      var c = 60 / 112 / 2, debut = court ? 2 : 0;
      for (var m = debut; m < 4; m++) {
        var t0 = t + (m - debut) * 8 * c, x = 0;
        GENERIQUE[m].forEach(function (n) {   // la mélodie : une onde carrée, des cuivres de télévision
          var o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = hz(n[0]);
          var g = ctx.createGain(), a = t0 + x * c; g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(0.05, a + 0.02);
          g.gain.setValueAtTime(0.05, a + n[1] * c - 0.04); g.gain.linearRampToValueAtTime(0, a + n[1] * c);
          o.connect(g); g.connect(sortie); o.start(a); o.stop(a + n[1] * c + 0.02); x += n[1];
        });
        BASSE_GENERIQUE[m].forEach(function (b, i) {   // la basse, les noires ; un accord sur les contretemps ; la batterie
          var a = t0 + i * 2 * c, o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(b);
          var g = ctx.createGain(); enveloppe(g, a, 0.01, 0.25, 0.3); o.connect(g); g.connect(sortie); o.start(a); o.stop(a + 0.4);
          [b + 24, b + 28, b + 31].forEach(function (h) {
            var k = ctx.createOscillator(); k.type = 'square'; k.frequency.value = hz(h);
            var gk = ctx.createGain(); enveloppe(gk, a + c, 0.005, 0.012, 0.12); k.connect(gk); gk.connect(sortie); k.start(a + c); k.stop(a + c + 0.2);
          });
          if (i % 2 === 0) { var kick = ctx.createOscillator(); kick.frequency.setValueAtTime(120, a); kick.frequency.exponentialRampToValueAtTime(45, a + 0.1); var gkk = ctx.createGain(); enveloppe(gkk, a, 0.002, 0.4, 0.15); kick.connect(gkk); gkk.connect(sortie); kick.start(a); kick.stop(a + 0.2); }
          else grain(sortie, a, 'blanc', 'bandpass', 1800, 0.8, 0.12, 0.002, 0.1);
        });
      }
      return (4 - debut) * 8 * c;   // la musique est planifiée d'un coup ; ses sources s'arrêtent seules
    }
    function tele(v) {
      var porte = biquad('lowpass', 850, 0.8, v.sortie), piece = ampli(1, porte), conv = convolueur(v, 0.6, 0.6);
      piece.connect(conv); conv.connect(ampli(0.35, porte));
      var rumeur = nappe(v, 'rose', 'bandpass', 480, 1.4, 0, piece);
      var musique = ctx.currentTime + 0.2 + (enMarche() ? generique(v, piece, ctx.currentTime + 0.2, false) : 0);   // le générique, d'abord
      (function phrase() {   // la rumeur se tait tant que la musique joue
        var t = ctx.currentTime + 0.05, fin = t + hasard(1.5, 4), g = rumeur.g.gain;
        if (t > musique && enMarche()) {
          while (t < fin) { var d = hasard(0.1, 0.28); g.setValueAtTime(0.0001, t); g.linearRampToValueAtTime(hasard(0.15, 0.35), t + d * 0.4); g.linearRampToValueAtTime(0.0001, t + d); t += d + hasard(0.02, 0.12); }
        }
        v.plusTard(phrase, (fin - ctx.currentTime + hasard(0.4, 1.8)) * 1000);
      })();
      souvent(v, function (t) { var court = Math.random() < 0.5; musique = t + generique(v, piece, t, court); }, 28, 60, 30);
      souvent(v, function (t) {   // des rires étouffés : trois nappes qui palpitent chacune à son rythme
        var d = hasard(1.5, 3);
        [700, 1100, 1500].forEach(function (f) {
          var s = ctx.createBufferSource(); s.buffer = bruit('rose'); s.loop = true;
          var g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.3); g.gain.setValueAtTime(0.2, t + d - 0.8); g.gain.linearRampToValueAtTime(0, t + d);
          var am = ampli(0.5); lfo(hasard(4.5, 6.5), 0.5, am.gain).stop(t + d + 0.1);
          s.connect(biquad('bandpass', f, 2, am)); am.connect(g); g.connect(piece); s.start(t, Math.random() * 4); s.stop(t + d + 0.1);
        });
      }, 10, 26, 6);
      return { regler: function () { return true; } };
    }

    // ---- la ballade (la couche `melodie`), composée pour le livre : jamais un air existant
    // Fa majeur, à 6/8, la noire pointée à 64 : une mesure dure 1,875 s, six croches, deux
    // pulsations ; les deux cœurs de 2.9 (96 et 64) y battent trois contre deux. Huit mesures, une
    // période à l'italienne : la première mesure (six croches : la, si bémol, ré, do, la, sol) est
    // la signature, reprise à la cinquième ; la troisième la reprend un ton plus haut ; la quatrième
    // s'arrête sur la dominante et relance ; la sixième s'envole d'une sixte vers le fa aigu, sur un
    // si bémol mineur emprunté ; la septième redescend ; la huitième résout. La première mesure seule
    // finit sur le sol : elle ne se résout pas. Une mandoline chante (trémolo sur les notes longues),
    // une guitare l'accompagne en arpèges de barcarolle. Chaque note : [hauteur MIDI, croches].
    var BALLADE = [
      [[69, 1], [70, 1], [74, 1], [72, 1], [69, 1], [67, 1]],   // 1. la signature
      [[65, 2], [69, 1], [72, 3]],
      [[70, 1], [72, 1], [76, 1], [74, 1], [70, 1], [69, 1]],   // 3. la signature, un ton plus haut
      [[67, 3], [64, 1], [65, 1], [67, 1]],
      [[69, 1], [70, 1], [74, 1], [72, 1], [69, 1], [67, 1]],   // 5. la signature revient
      [[65, 2], [74, 1], [77, 3]],                              // 6. la sixte qui s'envole
      [[76, 2], [74, 1], [72, 1], [70, 1], [67, 1]],
      [[65, 6]]
    ];
    var ACCORDS = ['F', 'F', 'F', 'F', 'C7', 'C7', 'C7', 'C7', 'F', 'F', 'Bb', 'Bbm', 'C7', 'C7', 'F', 'F'];  // par demi-mesure
    var ARPEGES = { F: [41, 48, 53, 57], C7: [48, 55, 58, 64], Bb: [46, 53, 58, 62], Bbm: [46, 53, 58, 61] };
    // Une corde pincée (Karplus-Strong), calculée une fois par note, instrument et variante :
    // mandoline claire et brève, pincée près du chevalet ; guitare plus ronde et plus longue.
    function corde(midi, sorte, variante) {
      var k = 'corde:' + sorte + midi + ':' + variante;
      if (tampons[k]) return tampons[k];
      var mando = sorte === 'mandoline', sr = ctx.sampleRate, P = sr / hz(midi), N = Math.floor(P - 0.5), d = P - 0.5 - N;
      if (d < 0.2) { N -= 1; d += 1; }
      var C = (1 - d) / (1 + d), len = Math.floor(sr * (mando ? 1.6 : 3)), b = ctx.createBuffer(1, len, sr), y = b.getChannelData(0);
      var ligne = new Float32Array(N), ex = new Float32Array(N), lp = 0, moy = 0, i, M = Math.max(1, Math.round(N * (mando ? 0.12 : 0.24)));
      for (i = 0; i < N; i++) { lp += (mando ? 0.8 : 0.35) * ((Math.random() * 2 - 1) - lp); ex[i] = lp; }
      for (i = 0; i < N; i++) { ligne[i] = ex[i] - ex[(i + N - M) % N]; moy += ligne[i]; }   // l'endroit où l'on pince
      moy /= N; for (i = 0; i < N; i++) ligne[i] -= moy;
      var amort = mando ? 0.996 : 0.998, j = 0, prec = 0, apx = 0, apy = 0, crete = 0;
      for (var n = 0; n < len; n++) {
        var x = ligne[j], m = amort * 0.5 * (x + prec); prec = x;
        var a = C * m + apx - C * apy; apx = m; apy = a;
        ligne[j] = a; y[n] = x; if (Math.abs(x) > crete) crete = Math.abs(x);
        j = j + 1 === N ? 0 : j + 1;
      }
      var q = Math.floor(sr * 0.05), s = crete > 0 ? 0.8 / crete : 1;
      for (n = 0; n < len; n++) y[n] *= s * (n >= len - q ? (len - n) / q : 1);
      tampons[k] = b; return b;
    }
    // Une note pincée à t, étouffée à `fin` (null : elle sonne jusqu'au bout) ; la mandoline a
    // deux cordes par note, accordées à un souffle près.
    function pincer(sortie, t, midi, sorte, force, fin, vibrato) {
      var mando = sorte === 'mandoline', g = ctx.createGain();
      g.gain.setValueAtTime(force * (mando ? 0.6 : 1), t);
      if (fin) { g.gain.setValueAtTime(force * (mando ? 0.6 : 1), fin); g.gain.linearRampToValueAtTime(0, fin + 0.06); }
      g.connect(sortie);
      (mando ? [1, 1.0025] : [1]).forEach(function (r) {
        var s = ctx.createBufferSource(); s.buffer = corde(midi, sorte, Math.floor(Math.random() * 2));
        s.playbackRate.value = r; if (vibrato) vibrato.connect(s.playbackRate);
        s.connect(g); s.start(t); s.stop(Math.min(t + s.buffer.duration, (fin || t + 9) + 0.08));
      });
    }
    // Le trémolo de la mandoline : une note longue, frappée onze à douze fois par seconde, qui
    // enfle et retombe, un coup vers le bas, un coup vers le haut.
    // libre : la dernière frappe sonne jusqu'au bout (la fin de la ballade).
    function tremolo(sortie, t, duree, midi, force, vibrato, libre) {
      var tt = t, k = 0;
      while (tt < t + duree - 0.04) {
        var suiv = Math.min(t + duree, tt + hasard(0.078, 0.094)), derniere = suiv >= t + duree - 0.04;
        pincer(sortie, tt, midi, 'mandoline', force * (0.8 + 0.2 * Math.sin(Math.PI * (tt - t) / duree)) * (k % 2 ? 0.8 : 1) * hasard(0.93, 1.06),
          derniere && libre ? null : suiv, vibrato);
        tt = suiv; k++;
      }
    }
    // La partition d'un mode : des événements { c: début en croches, m: hauteur, d: croches,
    // i: instrument, tr: trémolo, fin: où étouffer la note (en croches) }.
    function partition(mode, notes, boucle) {
      var ev = [], c = 0;
      (mode === 'entiere' ? BALLADE : [BALLADE[0]]).forEach(function (mes) {
        mes.forEach(function (x) { ev.push({ c: c, m: x[0], d: x[1], i: 'mandoline', tr: mode === 'entiere' && x[1] >= 2 }); c += x[1]; });
      });
      if (mode === 'fragment') ev = ev.slice(0, Math.max(1, Math.min(6, Math.round(nombre(notes, 4)))));
      ev.forEach(function (e, k) { e.fin = k + 1 < ev.length ? ev[k + 1].c + 0.25 : (boucle ? e.c + e.d + 0.25 : null); });
      if (mode === 'entiere') ACCORDS.forEach(function (a, h) {
        var p = ARPEGES[a], c0 = h * 3;
        if (h === 14 && !boucle) {   // la fin : l'accord, gratté, qui sonne
          p.concat([60, 65]).forEach(function (m, k) { ev.push({ c: c0 + k * 0.06, m: m, d: 6, i: 'guitare', fin: null }); });
          return;
        }
        if (h === 15 && !boucle) return;
        (h % 2 ? [p[3], p[2], p[1]] : [p[0], p[1], p[2]]).forEach(function (m, k) {
          var d = (k === 0 && h % 2 === 0) ? 6 : 4 - k; ev.push({ c: c0 + k, m: m, d: d, i: 'guitare', fin: c0 + k + d });
        });
      });
      return ev.sort(function (x, y) { return x.c - y.c; });
    }
    function modeBallade(o) { return o.mode === 'entiere' || o.mode === 'mesure' ? o.mode : 'fragment'; }   // tout autre mode : un fragment
    function ballade(v, o, finir) {
      var mode = modeBallade(o), boucle = mode === 'entiere' && !!o.boucle;
      var croche = 60 / (Math.max(30, Math.min(120, nombre(o.tempo, 64))) * 3), filtre = o.filtre || (mode === 'fragment' ? 'assourdi' : null);
      // le son : les deux instruments, un peu d'espace (davantage pour un fragment), puis le filtre
      var melange = ampli(mode === 'fragment' ? 2.2 : mode === 'mesure' ? 1.2 : 1), avant = ampli(1);
      var mando = biquad('peaking', 380, 1), m2 = biquad('peaking', 2800, 1.2, avant); mando.gain.value = 4; m2.gain.value = 3; mando.connect(m2);
      var guitare = biquad('lowpass', 4200, 0.6, ampli(0.42, avant));
      avant.connect(melange); var conv = convolueur(v, 1.6, 0.45); avant.connect(conv);
      conv.connect(ampli(mode === 'fragment' ? 0.5 : 0.18, melange));
      if (filtre === 'telephone') {   // le petit haut-parleur : ni grave ni aigu, un peu saturé, avec le vent et la rue de la vidéo
        var hp = biquad('highpass', 650, 0.7), pk = biquad('peaking', 1700, 1), lpt = biquad('lowpass', 3400, 0.9), sat = ctx.createWaveShaper();
        pk.gain.value = 6; sat.curve = courbeDouce(2.2);
        melange.connect(hp); hp.connect(pk); pk.connect(lpt); lpt.connect(sat); sat.connect(ampli(0.25, v.sortie));
        var fond = nappe(v, 'rose', 'bandpass', 900, 0.6, 0.05, hp); derive(v, fond.g.gain, 0.02, 0.07, 0.4, 1.5);
      } else if (filtre === 'assourdi' || filtre === 'eau') {
        melange.connect(biquad('lowpass', filtre === 'eau' ? 560 : 450, filtre === 'eau' ? 1.4 : 0.7, v.sortie));
      } else melange.connect(v.sortie);
      var vib = null;
      if (filtre === 'eau') { vib = ampli(0.012); osc('sine', 1.3, v).connect(vib); }   // sous l'eau, la hauteur ondule
      var ev = partition(mode, o.notes, boucle), t0 = ctx.currentTime + 0.08, k = 0, tour = 0;
      cadence(v, function (debut, fenetre) {
        for (;;) {
          if (k >= ev.length) { if (!boucle) return; k = 0; tour++; }
          var e = ev[k], base = t0 + tour * 48 * croche, t = base + e.c * croche;
          if (t >= fenetre) return;
          k++;
          if (t < debut - 0.05) continue;
          var fin = e.fin === null ? null : base + e.fin * croche, h = t + hasard(-0.006, 0.006);
          if (e.i === 'guitare') pincer(guitare, t, e.m, 'guitare', 0.5 * hasard(0.9, 1.05), fin, vib);
          else if (e.tr) tremolo(mando, h, e.d * croche, e.m, 0.9, vib, fin === null);
          else pincer(mando, h, e.m, 'mandoline', 0.9 * hasard(0.92, 1.05), fin, vib);
        }
      });
      if (!boucle) {
        var derniere = ev.reduce(function (m, e) { return Math.max(m, e.c + e.d); }, 0);
        v.plusTard(finir, (0.08 + derniere * croche + 3) * 1000);   // après la dernière note et sa résonance
      }
    }
    // Une seule note de la première mesure (Son.note), claire, sur le bus des effets.
    function noteSeule(k, o) {
      if (!chaineNotes) {
        var g = ampli(niveau('couches', 'melodie'), busEff), m2 = biquad('peaking', 2800, 1.2, g), m1 = biquad('peaking', 380, 1, m2);
        m1.gain.value = 4; m2.gain.value = 3;
        var conv = ctx.createConvolver(); conv.buffer = reponse(1.6, 0.45); m1.connect(conv); conv.connect(ampli(0.18, g));
        chaineNotes = m1;
      }
      pincer(chaineNotes, ctx.currentTime + 0.01, BALLADE[0][k][0], 'mandoline', 1.1 * borne(nombre(o.force, 1)), null, null);
    }
    // Les couches : `monde` : elle passe par le monde (et l'assourdi), sinon par le bus des effets ;
    // entree, sortie : ses fondus par défaut (s).
    var COUCHES = {
      battements: { monde: false, entree: 0.08, sortie: 0.8, faire: battements },
      pluie: { monde: true, entree: 3, sortie: 3, faire: function (v, o) { return averse(v, borne(nombre(o.densite, 0.5))); } },
      feu: { monde: true, entree: 2, sortie: 2.5, faire: feu },
      tele: { monde: true, entree: 1.5, sortie: 1.5, faire: tele },
      vibration: { monde: false, entree: 0.02, sortie: 0.15, faire: vibreur },
      melodie: { monde: false, entree: 0.02, sortie: 1.5, faire: ballade }
    };
    function allumerCouche(nom, o) {
      var d = COUCHES[nom];
      if (!d) return;
      o = o || {};
      var c = couches[nom];
      if (c) {
        if (c.regler) { c.regler(o); return; }
        if (c.mode === modeBallade(o)) return;   // la ballade joue déjà ce mode
        eteindreCouche(nom, { duree: 250 });
      }
      if (nom === 'melodie') pasMelodie = 0;
      var t = ctx.currentTime, g = ampli(0, d.monde ? monde : busEff);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(niveau('couches', nom) * borne(nombre(o.force, 1)), t + d.entree);
      var v = vie(g);
      c = { vie: v, gain: g, mode: modeBallade(o), regler: null };
      couches[nom] = c;
      var r = d.faire(v, o, function () {   // la couche se tait d'elle-même (la ballade finie, le vibreur)
        if (couches[nom] === c) { delete couches[nom]; delete couchesVoulues[nom]; }
        v.arreter();
      });
      if (r && r.regler) c.regler = r.regler;
    }
    function eteindreCouche(nom, o) {
      var c = couches[nom];
      if (!c) return;
      delete couches[nom];
      var d = Math.max(0.05, nombre(o && o.duree, COUCHES[nom].sortie * 1000) / 1000), t = ctx.currentTime;
      try { lisser(c.gain.gain, 0, t, d); } catch (e) { rate(e); }
      horloge.poser(function () { c.vie.arreter(); }, (d + 0.3) * 1000);
    }

    // ---- les motifs du père
    // L'accord du père (voir l'en-tête) : la quinte de l'appel (la, mi, la), puis au-dessus sa
    // tierce, qui la résout (do dièse, mi, la, do dièse) ; un halo très doux à l'octave naît le
    // dernier. Accord juste (4:5:6, la à 110 Hz) : pur, sans battement entre ses notes.
    // [hauteur, début, montée] en secondes, pour une montée de 2,2 s.
    var PERE = [[110, 0, 1.4], [165, 0.2, 1.5], [220, 0.4, 1.6], [275, 0.8, 1.4], [330, 0.9, 1.3], [440, 1, 1.2], [550, 1.1, 1.1],
      [880, 1.6, 1.4], [1100, 1.7, 1.4]];
    var ECARTS = [0.13, 0.19, 0.23, 0.29, 0.17, 0.31, 0.37, 0.21, 0.27];   // Hz : les battements lents de chaque note
    function accordDuPere(o) {
      if (o.eteindre !== undefined || o.fin === true) { eteindrePere(Math.max(0.1, nombre(o.eteindre, 3000) / 1000)); return; }
      if (!actif) return;
      if (pere) { if (o.duree) pere.v.plusTard(function () { eteindrePere(3); }, o.duree); return; }
      var t = ctx.currentTime + 0.02, k = o.tenu ? 0.3 / 2.2 : Math.max(0.05, nombre(o.montee, 2200) / 2200);
      var g = ampli(borne(nombre(o.force, 1)) * niveau('effets', 'pere'), busEff), v = vie(g), voix = [];
      var doux = biquad('lowpass', 5200, 0.5, g);
      PERE.forEach(function (n, i) {
        var bas = i < 3, halo = i > 6, gv = ampli(0, doux), cible = bas ? 0.16 : halo ? 0.02 : 0.12, debut = t + n[1] * k;
        gv.gain.setValueAtTime(0, t); gv.gain.setValueAtTime(0, debut); gv.gain.linearRampToValueAtTime(cible, debut + n[2] * k);
        // une seconde voix, plus faible, accordée un souffle plus haut (chaque note le sien) : l'accord
        // vit sans pulser ni trembler
        [[0, 1], [ECARTS[i], 0.25]].forEach(function (x) {
          var s = osc('sine', n[0] + x[0], v); onde(s, bas ? 'appel' : 'lumiere', bas ? [1, 0.35, 0.14, 0.06] : [1, 0.1, 0.03]);
          s.connect(x[1] === 1 ? gv : ampli(x[1], gv));
        });
        voix.push({ g: gv, fin: i === 6 ? 1.5 : halo ? 0.6 : 1 });   // la note haute s'éteint la dernière
      });
      pere = { v: v, voix: voix };
      if (o.duree) v.plusTard(function () { eteindrePere(3); }, o.duree);
      v.plusTard(function () { eteindrePere(8); }, 600000);
    }
    function eteindrePere(d) {
      if (!pere) return;
      var p = pere, t = ctx.currentTime, longue = 0;
      pere = null;
      p.voix.forEach(function (x) { var dd = d * x.fin; tenir(x.g.gain, t); x.g.gain.setTargetAtTime(0, t, dd / 5); longue = Math.max(longue, dd); });
      horloge.poser(function () { p.v.arreter(); }, (longue + 0.5) * 1000);
    }

    // ---- les effets ; ceux du prototype, tels quels (ils rejoignent `bus`, la sortie de l'effet)
    function env(g, t, a, v, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0005, t + a + d); }
    var effets = {
      // L'appel de Darshan à son père : la quinte à vide (juste, comme celle du père), la, mi, la,
      // très bas ; les trois notes entrent l'une après l'autre (la question), tiennent, s'éteignent
      // en 6 s sans se résoudre.
      appel: function (t) {
        var doux = biquad('lowpass', 1500, 0.5, bus);
        [[110, 0], [165, 0.3], [220, 0.6]].forEach(function (n, i) {
          var g = ampli(0, doux), t1 = t + n[1];
          g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(0.16, t1 + 2 - n[1] * 0.5);
          g.gain.setValueAtTime(0.16, t + 3); g.gain.exponentialRampToValueAtTime(0.0003, t + 9);
          [[0, 1], [ECARTS[i], 0.25]].forEach(function (x) {
            var o = ctx.createOscillator(); o.frequency.value = n[0] + x[0]; onde(o, 'appel', [1, 0.35, 0.14, 0.06]);
            o.connect(x[1] === 1 ? g : ampli(x[1], g)); o.start(t); o.stop(t + 9.3);
          });
        });
      },
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

    // ---- les niveaux, réglés au banc d'essai (outils/darshan/essai-son.js) : un facteur de gain par
    // nom. Ambiances : toutes vers un même niveau perçu, environ −30 dBFS sur le bus (mesure
    // pondérée K) ; couches et effets : au-dessus, sans jamais crever le plafond.
    var NIVEAUX = {
      ambiances: {
        cosmos: 0.62, nuit: 1.06, kerala: 0.72, vent: 0.63, restaurant: 1.41, rue: 1.03, parc: 1.55, bibliotheque: 3.9,
        vision: 1.55, metro: 0.84, hopital: 2.6, chambre: 1.21, marche: 1.34, patisserie: 2.11, appartement: 2.0,
        desert: 0.42, pluie: 0.75
      },
      // la ballade : l'entière vers −20 (au plus fort, sur 400 ms) ; les fragments, étouffés, vers −30
      couches: { battements: 0.65, pluie: 0.92, feu: 0.53, tele: 0.62, vibration: 0.41, melodie: 0.38 },
      // les effets vers −20 au plus fort (les chocs vers −18, les petits sons vers −23) ; l'appel,
      // très bas, vers −24 ; l'accord du père vers −20. « tour » écrêtait (+2,6 dBFS), « papier » et
      // « grince » ne s'entendaient pas.
      effets: {
        appel: 0.36, saut: 2.1, vibre: 2.9, fonte: 1.78, cle: 0.26, tour: 0.27, jour: 1.3, souffle: 0.67, tinte: 1.62,
        papier: 15.5, grince: 50, eclat: 0.98, balai: 5.4, declic: 1.6, bandes: 6.2, coup: 1.48, iris: 1.3, frisson: 2.8,
        pere: 0.32
      }
    };

    return {
      init: function () { try { init(); } catch (e) { rate(e); } },
      // Fondu enchaîné vers l'ambiance `nom`, avec ses réglages ; 'silence' ou null : tout se tait
      // (les couches aussi ; l'accord du père, non).
      ambiance: function (nom, r) {
        nom = cle(nom);
        r = (r && typeof r === 'object') ? r : null;
        voulue = nom; voulueR = r;
        var silence = !nom || nom === 'silence';
        if (silence) couchesVoulues = {};
        if (!ctx || !actif) return;   // pas de son : seulement retenue
        try {
          if (silence) Object.keys(couches).forEach(function (n) { eteindreCouche(n, null); });
          if (!ambiance || ambiance.nom !== nom) changerAmbiance(nom, r);
          else if (JSON.stringify(ambiance.r || {}) !== JSON.stringify(r || {})) {
            if (ambiance.regler && ambiance.regler(r || {})) ambiance.r = r; else changerAmbiance(nom, r);
          }
        } catch (e) { rate(e); }
      },
      // Effet ponctuel ; o : { force: 0 à 1 (gain, 1 par défaut), pan: -1 à 1 } ; pour 'pere', voir
      // l'en-tête (montee, tenu, eteindre, duree). Nom inconnu : rien.
      effet: function (nom, o) {
        nom = cle(nom);
        if (!ctx || !nom) return;
        o = (o && typeof o === 'object') ? o : {};
        try {
          if (nom === 'pere') { accordDuPere(o); return; }
          if (!actif || !effets.hasOwnProperty(nom)) return;
          var force = borne(nombre(o.force, 1)), p = Math.max(-1, Math.min(1, nombre(o.pan, 0)));
          var sortie = ctx.createGain(), fin = sortie;
          sortie.gain.value = force * niveau('effets', nom);
          if (p && ctx.createStereoPanner) { fin = ctx.createStereoPanner(); fin.pan.value = p; sortie.connect(fin); }
          fin.connect(busEff);
          bus = sortie;
          effets[nom](ctx.currentTime + 0.01, force);
          horloge.poser(function () { try { fin.disconnect(); sortie.disconnect(); } catch (e) { /* rien */ } }, 12000);
        } catch (e) { rate(e); }
      },
      // Couche continue par-dessus l'ambiance (voir l'en-tête) ; oui : true (par défaut) ou false.
      couche: function (nom, oui, o) {
        nom = cle(nom);
        if (!nom) return;
        var allumer = arguments.length < 2 || !!oui;
        o = (o && typeof o === 'object') ? o : {};
        if (allumer) couchesVoulues[nom] = o; else delete couchesVoulues[nom];
        if (!ctx || !actif) return;   // pas de son : seulement retenue
        try { if (allumer) allumerCouche(nom, o); else eteindreCouche(nom, o); } catch (e) { rate(e); }
      },
      // Une note de la première mesure de la ballade (voir l'en-tête) ; rend son indice, ou −1.
      note: function (nom, i, o) {
        if (!ctx || !actif || cle(nom) !== 'melodie') return -1;
        try {
          var k = (typeof i === 'number' && isFinite(i)) ? ((Math.floor(i) % 6) + 6) % 6 : pasMelodie;
          pasMelodie = (k + 1) % 6;
          noteSeule(k, (o && typeof o === 'object') ? o : {});
          return k;
        } catch (e) { rate(e); return -1; }
      },
      // 'assourdi' : le monde s'étouffe (passe-bas vers 450 Hz, en 1,5 s) ; null : il revient.
      filtre: function (nom) {
        filtreVoulu = cle(nom) === 'assourdi' ? 'assourdi' : null;
        if (!ctx) return;
        try { appliquerFiltre(filtreVoulu, 1.5); } catch (e) { rate(e); }
      },
      actif: function () { return actif; },
      // Coupe ou remet le son, en fondu (0,4 s) ; coupé, plus rien ne tourne (voir init).
      basculer: function () {
        actif = !actif; reglages.son = actif; ecrire('darshan.reglages', reglages);
        try {
          if (actif && !ctx) init();
          else if (ctx) {
            if (actif) { reprendre(); relancer(); }
            lisser(maitre.gain, actif ? MAITRE : 0, ctx.currentTime, 0.4);
            if (!actif) horloge.poser(function () { if (!actif) toutArreter(); }, 500);
          }
        } catch (e) { rate(e); }
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
            } catch (e) { rate(e); }
          }
        }
        return { ambiance: volume(reglages.ambiance), effets: volume(reglages.effets) };
      },
      // Banc d'essai (outils/darshan/essai-son.js), jamais appelé par le livre : tout recommence
      // dans le contexte hors ligne c, sans rien brancher à sa destination ; les minuteries
      // deviennent virtuelles et n'avancent qu'avec avancer(t), que le banc appelle en suspendant
      // le rendu. Rend { sortie, avantPlafond, bus: { ambiance, effets }, avancer, minuteries, erreurs,
      // noms, niveaux }.
      _essai: function (c) {
        var file = [], n = 0;
        banc = { erreurs: [] };
        horloge = {
          poser: function (f, ms) { n += 1; file.push({ id: n, t: c.currentTime + Math.max(0, nombre(ms, 0)) / 1000, f: f }); return n; },
          oter: function (id) { for (var i = 0; i < file.length; i++) if (file[i].id === id) { file.splice(i, 1); return; } }
        };
        ambiance = null; voulue = null; voulueR = null; couches = {}; couchesVoulues = {}; filtreVoulu = null;
        pere = null; pasMelodie = 0; chaineNotes = null; tampons = {}; actif = true;
        var sortie = construire(c, null);
        return {
          sortie: sortie, avantPlafond: maitre, bus: { ambiance: busAmb, effets: busEff }, erreurs: banc.erreurs, niveaux: NIVEAUX,
          noms: { ambiances: Object.keys(ambiances), couches: Object.keys(COUCHES), effets: Object.keys(effets).concat(['pere']) },
          minuteries: function () { return file.length; },
          avancer: function (t) {
            for (var garde = 0; garde < 100000; garde++) {
              var k = -1, tmin = Infinity;
              for (var i = 0; i < file.length; i++) if (file[i].t <= t + 1e-6 && file[i].t < tmin) { tmin = file[i].t; k = i; }
              if (k < 0) return;
              var m = file.splice(k, 1)[0];
              try { m.f(); } catch (e) { rate(e); }
            }
          }
        };
      }
    };
  })();
