  // ---------------------------------------------------------------- le son, fabriqué en direct
  /* Tout le son de Darshan jouable est fabriqué en direct par Web Audio : aucun fichier audio,
     aucune voix, aucune parole, aucun air existant. Rien ne sonne avant le premier geste du
     lecteur (init) ; le bouton « Son » coupe tout, en fondu ; le mouvement réduit ne change rien
     au son. Le son n'est jamais indispensable : ce qu'il dit, le texte ou l'image le disent aussi.
     Toute erreur est rattrapée : le son ne casse jamais la lecture.

     Le chemin du son :
       ambiances ; couches pluie, feu, tele, aube, couteau, vent ─► monde (deux passe-bas) ─►
         niveau (Son.niveau) ─► bus ambiance ─┐
       effets ; sons qui durent ; accord du père ; couches battements, vibration, melodie,
         bourdon ─► bus effets ─┴─► compresseur ─► maître ─► plafond (saturation douce : jamais
         au-dessus de −1,4 dBFS)
     `filtre('assourdi')` referme le monde (la salle s'efface, 2.3) sans toucher aux effets, au
     cœur ni à la ballade. Les deux volumes du lecteur règlent les deux bus.

     État (3 octobre 2026) : les 17 ambiances du découpage, les 10 couches, les deux motifs du
     père (appel, pere), plus de quatre-vingts effets ponctuels, trois sons qui durent (tictac,
     pied, autre-cote), l'arrêt commun, l'équilibrage (table NIVEAUX, mesurée par le banc d'essai :
     ambiances vers −30, effets vers −20 au plus fort, en pondération K) ; chaque page est complète
     par elle-même (voir suivrePage). Les voix imitées (le restaurant, la télévision) sont des
     murmures filtrés d'après un vrai restaurant : jamais un mot, jamais une hauteur fixe.

     Son coupé (reglages.son === false, ou après basculer()), rien ne se fabrique, pas même le
     contexte audio : l'ambiance et les couches voulues sont seulement retenues, et démarrent quand
     le son revient. Contexte suspendu (pas encore de geste, un appel sur iOS), rien ne se planifie :
     son horloge est figée, et les sons s'y entasseraient sans jamais finir. Chaque ambiance et
     chaque couche a sa « vie » (sources, minuteries, réverbérations), arrêtée tout entière après son
     fondu : les réverbérations y rendent aussitôt leurs tampons.

     Une page, un son : le moteur n'a pas à dire que la page change, le son voit la page active
     (.scene.active) au premier appel qu'il reçoit de la nouvelle. Les couches de la page quittée
     s'éteignent (1,5 s de grâce : le cœur de 2.2 à 2.4 continue sans reprise s'il est redemandé),
     la ballade s'efface, les sons qui durent s'arrêtent, le niveau du monde revient à 1. Les
     variantes de la page (data-son-variantes, écrites par build.py : soir, nuit, vaste, rame,
     dense, ete, fenetre, feuilles, vent, jour, horloge) deviennent les réglages de l'ambiance quand
     personne n'en passe.

     Son.ambiance(nom, reglages) : fondu enchaîné (2,5 s pour l'ancienne, 3 s pour la nouvelle).
     Chaque ambiance rend ses sources et ses minuteries (sa « vie ») : tout s'arrête après le fondu,
     aucune minuterie ne lui survit. Un nom pas encore fabriqué vaut silence ; 'silence' (ou null)
     éteint aussi les couches. La même ambiance avec d'autres réglages change sans recommencer
     quand elle le peut, sinon par un fondu enchaîné.
       cosmos        la voûte : sinus lents, souffle (prototype)
       nuit          les toits la nuit : vent, air, rumeur de la ville (prototype)
       kerala        Aluva : le fleuve, ses remous, les oiseaux, le tanpura ; { soir: true } : moins
                     d'oiseaux, des grillons (3.9 à 3.14, 7.6 à 7.8) ; { garder: 'fleuve' } (1.8) : le
                     fleuve seul ; { tanpura: false } : le tanpura se tait
       vent          deux souffles graves qui errent, un sifflement, de l'air ; { feuilles: true } (7.2)
       restaurant    la rumeur de la salle : un murmure de voix filtrées (ni mot, ni hauteur fixe),
                     des rires, couverts, verres, assiettes, le serveur
       rue           Paris : circulation au loin, voitures qui passent, pas, pigeons, un scooter ;
                     { densite: 0 à 1 } (0,5 ; 1 : les « vapeurs automobiles » de 4.5),
                     { nuit: true } (peu de voitures, plus de pigeons), { ete: true } (martinets),
                     { soir: true } (6.10, 6.15), { foule: true } (5.8 : un murmure au loin),
                     { ralenti: true } (7.10, 7.11 : tout ralentit de moitié, la rue se creuse)
       parc          le feuillage, le merle, des moineaux, des pas sur le gravier
       bibliotheque  un silence habité : ventilation, pages, pas feutrés, un livre posé ;
                     { vaste: true } : la même sous la voûte de Pékin (réverbération de 5 s)
       vision        le mudrā : le fleuve lointain, des grillons, un souffle à chaque inspiration,
                     des braises, un grave sans air
       metro         la station carrelée, la rumeur des tunnels, une rame qui arrive, freine et
                     repart ; { rame: true } : dans la rame (4.3) : la tôle qui vibre, les joints
       hopital       le couloir, les néons, des bips lointains et désaccordés, un chariot, une porte ;
                     { mesure: true } (4.2) : les bips en mesure de la ballade ; { nuit: true } (7.8)
       chambre       une pièce calme, la rue étouffée ; { fenetre: true } (5.1), { nuit: true }
       marche        Aluva : le tanpura, la foule sans voix, le laiton, les étoffes, une sonnette,
                     les corneilles, un klaxon de rickshaw, la chaleur ; { tanpura: false }
       patisserie    le ronron de la vitrine réfrigérée, papier, caisse, clochette de la porte
       appartement   les tentures, la rue d'en bas, une horloge, l'encens qui crépite ;
                     { horloge: 0 à 1 } (0,3 ; 1 : l'attente de 6.9, au premier plan),
                     { presser: ms } (6.11 : les secondes qui restent s'égrènent plus vite)
       desert        un vent large et bas, le sable qui file, la nuit immense ; { vent: 0 à 1 }
                     (« le vent tombe », 7.1), { jour: true } (7.3 : la chaleur)
       pluie         une averse qui s'apaise en une vingtaine de secondes, puis des gouttes ;
                     { densite: 0 à 1 } : une pluie qui ne change plus
     Deux ambiances à la fois, une par oreille (6.2 : une rue par oreille ; 7.4 : l'hôpital et le
     fleuve) : { partage: { gauche: 'rue', droite: 'rue' }, actif: 'gauche' | 'droite' | 'les deux' |
     'aucun', gauche: {…}, droite: {…} } ; Son.partage(actif) change la moitié qui parle sans rien
     recommencer. Jamais tout à fait d'un seul côté : une seule oreillette les entend toutes deux.
     Son.ralenti(true) : la rue ralentie, sans recommencer.

     Son.niveau(v, ms) : le niveau du monde (l'ambiance et ses couches), de 0 à 1, atteint en ms,
     sans toucher aux réglages du lecteur ni aux effets (1.1 : le vent tombe sous la voix).

     Son.couche(nom, oui, options) : par-dessus l'ambiance, jusqu'à couche(nom, false, { duree })
     (fondu, en ms), ambiance('silence') ou la fin de la page. Demandée avant init(), elle joue au
     premier geste. Rappelée allumée, elle suit ses nouvelles options sans recommencer (sauf la
     ballade). Options communes : force (0 à 1).
       battements  le cœur : un double coup grave et chaud. tempo (72), qui ('julie' : son timbre,
                   plus clair), julie (tempo d'un second cœur, celui de Julie ; false l'ôte),
                   duree (ms pour atteindre les nouveaux tempos : il s'emballe ou ralentit),
                   cale (les deux cœurs se calent : à 96 et 64, trois contre deux, ensemble au
                   premier temps de la mesure de la ballade), arythmie (le cœur de Julie bat
                   irrégulièrement, 5.9). Ex. 2.2 : { tempo: 72 }, puis { tempo: 110, duree: 2600 } ;
                   2.9 : { tempo: 96, julie: 64 }, puis { cale: true } ; 5.9 : { tempo: 80,
                   julie: 80, duree: 4200, cale: true } ; 7.10 : { julie: false, tempo: 60,
                   duree: 3500 } (de 80 à 60, comme la fiche ; le moteur calcule les tempos).
       pluie       une pluie sur le lieu ; densite (0,5)
       feu         le feu du soir : les flammes, des crépitements, les sardines qui grésillent
       tele        une télévision derrière une porte, sans une parole : un murmure, une musique de
                   série inventée pour le livre (les voix baissent pendant le générique), des rires
                   de salle étouffés
       vibration   le vibreur d'un téléphone posé ; fois (nombre de salves, puis il se tait seul)
       aube        le chœur de l'aube (3.5) : des oiseaux de plus en plus nombreux pendant vingt-cinq s
       couteau     le couteau de Jivan sur sa planche (3.12 à 3.14) : un coup toutes les 0,7 s, un peu
                   plus net toutes les quatre ; { lent: true } : toutes les 1,1 s
       vent        la brise qui se lève quand les graines partent aux quatre vents (3.14)
       bourdon     un si bémol grave et sourd, « dans un coin de la tête » (5.9) : il enfle et retombe
       horloge     (pas une couche à part : c'est le réglage `horloge` de l'appartement, voir
                   plus haut ; Son.couche('horloge', true, { proche, presser }) y mène)
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
     Son.note('montantes', i) : une des cinq notes qui montent (la, si, ré, mi, fa dièse ; 1.2 et
     7.8 : les tuiles) : i de 0 à 4 ; sans i, la suivante.

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

     Les effets ponctuels (Son.effet(nom, { force, pan, … })) : la liste est la table NIVEAUX.effets ;
     le nom d'un effet inconnu ne fait rien. Quelques-uns lisent des options : `pas` (sol : pave,
     talons, bois, feutre, lino, poussiere, plateforme, trottoir, sable, gravier ; sinon celui du
     lieu), `achat-<objet>` (5.2 : thés, curcuma, encens, jarres, tapisseries),
     `paysage-<image>` (6.11, 6.12 : village, gorge, ossau, banquise, rochers, champs), `tic`
     (monde: 'julie'), `autre-cote` (lieu : aluva, paris-midi, periyar, hopital-nuit).
     Trois effets durent : `tictac` (l'horloge de 6.9), `pied` (le pied qui bat la mesure, 5.8) et
     `autre-cote` (le jour de l'autre côté d'une porte). effet(nom, { boucle: true }) les lance ;
     { arret: true } (ou { eteindre: ms }) les arrête ; { ralentir: true } les ralentit puis les
     éteint ; sans `boucle`, chacun se tait seul au bout de son temps ; tous s'arrêtent avec la page.

     Banc d'essai : outils/darshan/essai-son.js rend hors ligne chaque ambiance, couche et effet,
     et mesure niveaux (pondération K), crêtes après le compresseur, silence et spectre ; son
     épreuve d'endurance enchaîne cent changements d'ambiance (avec couches, effets, son coupé puis
     remis, deux ambiances à la fois, changements de page) et vérifie qu'à la fin plus une source,
     une réverbération ni une minuterie ne survit ; --livre rejoue les appels de Son que les fiches
     du livre demandent, page après page, et signale un son inconnu ou un niveau hors norme ;
     --ecoute rend des fichiers WAV à écouter. Son._essai(contexte) sert à lui seul.

     Reste à faire :
     - brancher les appels que les équipes des effets et des scènes doivent faire (Son.partage,
       Son.ralenti, Son.ambiance avec partage ; la couche `horloge` avec `presser`) ;
     - `jour` (prototype) est devenu `autre-cote` : l'ancien nom reste accepté ;
     - l'écoute par Karl : le restaurant, la télévision et la ballade (fichiers rendus par le banc) ;
       si une vraie prise de son (CC0 ou domaine public) devait remplacer le murmure, elle se
       chargerait par fetch, listée dans le manifeste de build.py, avec le murmure en secours. */
  var Son = (function () {
    var MAITRE = 0.85, OUVERT = 20000, ASSOURDI = 450;
    var ctx = null, maitre = null, busAmb = null, busEff = null, monde = null, filtres = [];
    var bus = null;                         // la sortie de l'effet en cours (force et pan)
    var actif = reglages.son !== false;
    var ambiance = null, voulue = null, voulueR = null;       // l'ambiance qui joue ; celle qu'on attend
    var couches = {}, couchesVoulues = {}, filtreVoulu = null;
    var pere = null, pasMelodie = 0, pasMontantes = 0, chaineNotes = null, chaineMontantes = null;
    var niveauNode = null, niveauVoulu = 1;   // le niveau du monde (Son.niveau), qui revient à 1 avec chaque page
    var boucles = {};                       // les sons qui durent jusqu'à ce qu'on les arrête : tictac, pied, autre-cote
    var pageEnCours = null;                 // la page jouée : l'édition web garde les 85 pages dans un seul document
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
      niveauNode = ampli(niveauVoulu, busAmb);   // Son.niveau : l'ambiance baisse (1.1 : le vent tombe sous la voix)
      monde = ampli(1); monde.connect(filtres[0]); filtres[0].connect(filtres[1]); filtres[1].connect(niveauNode);
      return plafond;
    }
    // Son coupé, rien ne se fabrique, pas même le contexte : l'ambiance et les couches voulues sont
    // seulement retenues, et démarrent quand le son revient (basculer).
    function init() {
      suivrePage();
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
      Object.keys(boucles).forEach(function (n) { boucles[n].v.arreter(); delete boucles[n]; });
      delete couchesVoulues.melodie;
      if (pere) eteindrePere(0.1);
    }
    // Le contexte joue-t-il ? Suspendu (pas encore de geste, un appel sur iOS), il fige son horloge :
    // rien ne s'y planifie, sinon les sons s'entasseraient sans jamais finir.
    function enMarche() { return !!ctx && (banc !== null || !ctx.state || ctx.state === 'running'); }

    // ---- la page jouée
    // L'édition web garde les 85 pages dans un seul document, et chaque page est complète par elle-même
    // (dans l'EPUB, Apple Books isole chaque page : rien ne passe de l'une à l'autre) : à chaque
    // changement de page, ce qui durait pour l'ancienne s'arrête. Le moteur n'a pas à le dire : le son
    // voit la page active (.scene.active) au premier appel qu'il reçoit de la nouvelle.
    function suivrePage() {
      var id = null;
      try {
        var sc = (typeof doc !== 'undefined' && doc.querySelector) ? doc.querySelector('.scene.active') : null;
        id = sc ? (sc.id || sc.getAttribute('data-scene') || 'page') : null;
      } catch (e) { id = null; }
      if (id === pageEnCours) return;
      var avant = pageEnCours; pageEnCours = id;
      if (avant !== null && id !== null) nouvellePage();
    }
    function nouvellePage() {
      // les couches de la page quittée restent 1,5 s : si la nouvelle les redemande (le cœur de 2.2 à
      // 2.4), elles continuent sans reprise ; sinon elles s'éteignent (5.9 à 5.10 : les battements)
      if (couches.melodie) eteindreCouche('melodie', { duree: 1500 });   // la ballade s'efface en 1,5 s (7.10 : « qui finit avec la page »)
      var anciennes = Object.keys(couches);
      anciennes.forEach(function (n) { couches[n].ancienne = true; });
      couchesVoulues = {};
      horloge.poser(function () {
        anciennes.forEach(function (n) { var c = couches[n]; if (c && c.ancienne) eteindreCouche(n, { duree: 600 }); });
      }, 1500);
      Object.keys(boucles).forEach(function (n) { arreterBoucle(n, 0.5); });
      niveauVoulu = 1;
      try { if (ctx && niveauNode) lisser(niveauNode.gain, 1, ctx.currentTime, 0.8); } catch (e) { rate(e); }
    }
    // Les variantes d'une page (data-son-variantes, écrites par build.py d'après le découpage :
    // « soir », « vaste », « rame », « dense »…) deviennent les réglages de son ambiance, quand
    // personne ne les passe (le moteur appelle Son.ambiance(nom) sans réglages).
    var VARIANTES = { soir: { soir: true }, nuit: { nuit: true }, vaste: { vaste: true }, rame: { rame: true }, dense: { densite: 1 },
      ete: { ete: true }, fenetre: { fenetre: true }, feuilles: { feuilles: true }, vent: { vent: 1 }, jour: { jour: true }, horloge: { horloge: 1 } };
    function reglagesDeLaPage() {
      try {
        var sc = (typeof doc !== 'undefined' && doc.querySelector) ? doc.querySelector('.scene.active') : null;
        var mots = sc ? (sc.getAttribute('data-son-variantes') || '').split(/\s+/) : [], r = {}, n = 0;
        mots.forEach(function (m) {
          var x = VARIANTES[cle(m)];
          if (x) for (var k in x) if (x.hasOwnProperty(k)) { r[k] = x[k]; n++; }
        });
        return n ? r : null;
      } catch (e) { return null; }
    }
    // ---- les sons qui durent (tictac, pied, autre-cote) : une vie à part, éteinte à l'arrêt demandé,
    // à la fin du temps donné, au changement de page et avec le son
    function lancerBoucle(nom, force, faire, monte) {
      arreterBoucle(nom, 0.15);
      var t = ctx.currentTime, g = ampli(0, busEff), v = vie(g), b = { v: v, g: g, regler: null };
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(force * niveau('effets', nom), t + (monte || 0.05));
      boucles[nom] = b;
      var r = faire(v, g);
      if (r && r.regler) b.regler = r.regler;
      return b;
    }
    function arreterBoucle(nom, d) {
      var b = boucles[nom];
      if (!b) return;
      delete boucles[nom];
      d = Math.max(0.05, d);
      try { lisser(b.g.gain, 0, ctx.currentTime, d); } catch (e) { rate(e); }
      horloge.poser(function () { b.v.arreter(); }, (d + 0.3) * 1000);
    }

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
      var v = { sortie: sortie, vivant: true, sources: [], minuteries: [], salles: [], enfants: [] };
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
        v.enfants.forEach(function (e) { e.arreter(); }); v.enfants = [];
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
    // `lent` (facultatif) : une fonction qui rend le facteur des attentes (2 : la rue ralentie, 7.10).
    function souvent(v, quand, min, max, premier, lent) {
      (function attendre(d) {
        v.plusTard(function () { if (enMarche()) quand(ctx.currentTime + 0.03); attendre(hasard(min, max) * (lent ? lent() : 1)); }, d * 1000);
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
      feutre: [520, 0.8, 0.08, 80, 0.6, 0.12], lino: [1300, 1, 0.05, 100, 0.45, 0.2], poussiere: [700, 0.7, 0.1, 60, 0.4, 0.15],
      plateforme: [800, 0.9, 0.075, 85, 0.5, 0.45], trottoir: [1500, 1.1, 0.05, 105, 0.5, 0.3], sable: [1100, 0.7, 0.12, 70, 0.35, 0.1]
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

    // ---- le murmure : des gens qui parlent, sans qu'on comprenne un mot
    // Mesuré sur un vrai restaurant parisien (enregistrement du domaine public, un midi) : l'énergie
    // est entre 250 et 2 000 Hz (le maximum vers 500 Hz, 12 dB de moins à 126 Hz, 15 dB de moins à
    // 3 kHz), et l'enveloppe fluctue à tous les rythmes, de 0,8 à 32 Hz, avec la même énergie par
    // octave : phrases, syllabes, consonnes. Chaque « personne » est ici un chuchotement : un bruit
    // qui passe par trois résonances (les formants d'une voyelle, qui change à chaque syllabe), des
    // syllabes de 110 à 260 ms, des phrases de quelques syllabes, des pauses, parfois une consonne
    // qui siffle. Aucune hauteur, aucun mot, jamais une voix qu'on dirait fabriquée ; plusieurs
    // personnes ensemble font la rumeur. o : voix (7), clair (1 : tout le spectre ; moins : ce qui
    // reste de l'aigu), vitesse (1), pauses (1 ; plus : moins de monde parle), large (0,7 : la
    // largeur stéréo), niv. Rend le gain du groupe.
    var VOYELLES = [[700, 1200, 2500], [400, 2200, 2900], [550, 1900, 2600], [290, 2300, 3000], [450, 800, 2500],
      [310, 800, 2300], [420, 1500, 2400], [520, 1000, 2400], [640, 1450, 2500], [360, 1600, 2300]];
    function murmure(v, sortie, o) {
      var n = o.voix || 7, clair = nombre(o.clair, 1), vitesse = nombre(o.vitesse, 1), pauses = nombre(o.pauses, 1), large = nombre(o.large, 0.7);
      var somme = ampli(nombre(o.niv, 1)), gens = [], i;
      var haut = biquad('highpass', 170, 0.7, sortie), bas = biquad('lowpass', 900 + 2200 * clair, 0.6, haut);
      somme.connect(bas);
      for (i = 0; i < n; i++) (function () {
        var p = pan(n > 1 ? -large + 2 * large * (i + hasard(-0.3, 0.3)) / (n - 1) : 0, somme), g = ampli(0.0001, p);
        var sx = hasard(0.86, 1.18), s = source('rose', v), res = [];   // sx : la longueur du conduit, propre à chacun
        [[3, 1], [6, 0.4 * (0.3 + 0.7 * clair)], [8, 0.1 * clair]].forEach(function (k) {
          var b = biquad('bandpass', VOYELLES[0][res.length] * sx * (res.length ? 1 : 1.12), k[0]); s.connect(b); b.connect(ampli(k[1], g)); res.push(b);
        });
        gens.push({ g: g, p: p, res: res, sx: sx, t: 0, reste: 0, pause: true, niv: hasard(0.5, 1) });
      })();
      cadence(v, function (debut, fin) {
        gens.forEach(function (x) {
          if (x.t < debut) x.t = debut + hasard(0, 0.3);
          while (x.t < fin) {
            var t = x.t;
            if (x.reste <= 0) {
              if (!x.pause) { x.g.gain.linearRampToValueAtTime(0.0001, t + 0.12); x.pause = true; x.t = t + hasard(0.4, 3) * pauses; continue; }
              x.pause = false; x.reste = 3 + Math.floor(Math.random() * 10);
              x.g.gain.setValueAtTime(0.0001, t);   // la phrase part du silence
            }
            var d = (hasard(0.09, 0.22) + (Math.random() < 0.25 ? hasard(0.08, 0.25) : 0)) / vitesse, vy = choix(VOYELLES), a = x.niv * hasard(0.35, 1) * (x.reste === 1 ? 0.6 : 1);
            x.res.forEach(function (b, k) { b.frequency.setTargetAtTime(vy[k] * x.sx * (k ? 1 : 1.12) * hasard(0.94, 1.06), t, 0.03); });
            x.g.gain.linearRampToValueAtTime(a, t + d * 0.35); x.g.gain.linearRampToValueAtTime(a * 0.4, t + d);
            if (clair > 0.2 && Math.random() < 0.35) grain(x.p, t, 'blanc', 'bandpass', hasard(3500, 6000), 1.2, 0.1 * a * clair, 0.012, hasard(0.04, 0.09));
            x.reste--; x.t = t + d;
          }
        });
      });
      return somme;
    }
    // Un rire de salle (la télévision) : six personnes, chacune quelques « ha » qui s'espacent et
    // retombent, chuchotés (une voyelle ouverte), à peu près ensemble.
    function rire(sortie, t, duree, niv) {
      for (var i = 0; i < 6; i++) {
        var t0 = t + hasard(0, 0.3), sx = hasard(0.9, 1.15), s = ctx.createBufferSource(), g = ctx.createGain(), p = pan(hasard(-0.6, 0.6), sortie);
        s.buffer = bruit('rose'); s.loop = true; s.start(t0, Math.random() * 4);
        [[780, 4, 1], [1300, 5, 0.5]].forEach(function (f) { var b = biquad('bandpass', f[0] * sx, f[1]); s.connect(b); b.connect(ampli(f[2], g)); });
        g.gain.setValueAtTime(0.0001, t0); g.connect(p);
        var tt = t0, pas = hasard(0.15, 0.2), a = niv * hasard(0.6, 1);
        while (tt < t + duree) {
          g.gain.linearRampToValueAtTime(a, tt + 0.03); g.gain.linearRampToValueAtTime(a * 0.15, tt + pas * 0.85);
          tt += pas; pas *= 1.07; a *= 0.86 + 0.06 * Math.random();
        }
        g.gain.linearRampToValueAtTime(0.0001, tt + 0.1); s.stop(tt + 0.2);
      }
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
      // { garder: 'fleuve' } (1.8) : tout se tait sauf le fleuve ; { tanpura: false } : seul le tanpura se tait.
      kerala: function (v, r) {
        var soir = !!r.soir, ta = ampli(1, v.sortie), faune = ampli(1, v.sortie);
        var eau = source('rose', v), l = biquad('lowpass', 1100); eau.connect(l); l.connect(ampli(0.16, v.sortie));
        var remous = source('blanc', v), b = biquad('bandpass', 900, 2.5);
        lfo(3.1, 260, b.frequency, v); lfo(5.3, 180, b.frequency, v);
        remous.connect(b); b.connect(ampli(0.035, v.sortie));
        tanpura(v, ta, 1);
        souvent(v, function (t) { oiseauKerala(faune, t); }, soir ? 5 : 1.6, soir ? 14 : 5.8, 0);
        if (soir) grillons(v, faune, 0.01);
        function regler(r2) {
          var t = ctx.currentTime, seul = r2.garder === 'fleuve';
          lisser(ta.gain, (seul || r2.tanpura === false) ? 0 : 1, t, 1.5); lisser(faune.gain, seul ? 0 : 1, t, 1.5);
          return !!r2.soir === soir;
        }
        regler(r);
        return { regler: regler };
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
        derive(v, murmure(v, s, { voix: 14, niv: 0.5 }).gain, 0.43, 0.56, 6, 14);   // la salle se remplit et se vide un peu
        souvent(v, function (t) {   // des couverts : le plus souvent des chocs secs, parfois un verre qui tinte
          var k = 1 + Math.floor(Math.random() * 3), p = pan(hasard(-0.8, 0.8), s), i;
          if (Math.random() < 0.6) for (i = 0; i < k + 1; i++) grain(p, t + i * hasard(0.05, 0.22), 'blanc', 'bandpass', hasard(2200, 4800), hasard(1.5, 4), hasard(0.03, 0.09), 0.001, hasard(0.012, 0.04));
          else for (i = 0; i < k; i++) tinter(p, t + i * hasard(0.08, 0.2), hasard(2300, 4200), [1, 2.76, 5.4], hasard(0.012, 0.035), hasard(0.08, 0.2));
        }, 2, 6.5);
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
      // scooter ; { densite }, { nuit }, { ete } (voir l'en-tête), sans recommencer. { soir: true } (6.10,
      // 6.15) : la rue du soir, moins de voitures, quelques martinets ; { foule: true } (5.8) : la rue de
      // nuit pleine de monde, un murmure au loin ; { ralenti: true } (7.10, 7.11) : tout ralentit à la
      // moitié de sa vitesse et la rue se creuse (un passe-bas).
      rue: function (v, r) {
        var reg = {}, creux = biquad('lowpass', 20000, 0.5, v.sortie), w = Object.create(v), foule = null;
        w.sortie = creux;   // tout ce que fait la rue passe par `creux`, que le ralenti referme
        var s = salle(w, 0.7, 0.6, 0.12);
        var loin = nappe(v, 'brun', 'lowpass', 320, 0.5, 0.4, creux); derive(v, loin.f.frequency, 220, 420, 3, 8);
        var ville = nappe(v, 'rose', 'bandpass', 180, 0.8, 0.05, creux);
        function lent() { return reg.ralenti ? 2 : 1; }
        function regler(r2) {
          reg.densite = borne(nombre(r2.densite, 0.5)); reg.nuit = !!r2.nuit; reg.ete = !!r2.ete; reg.soir = !!r2.soir;
          reg.ralenti = !!r2.ralenti; reg.foule = !!r2.foule;
          var k = reg.nuit ? 0.8 : reg.soir ? 0.9 : 0.6 + 0.8 * reg.densite, t = ctx.currentTime;
          lisser(loin.g.gain, 0.2 * k, t, 2); lisser(ville.g.gain, 0.04 * k, t, 2);
          tenir(creux.frequency, t); creux.frequency.exponentialRampToValueAtTime(reg.ralenti ? 650 : 20000, t + (reg.ralenti ? 3 : 2));
          if (reg.foule && !foule) { foule = ampli(0, s); murmure(v, foule, { voix: 9, clair: 0.7, niv: 0.45, large: 0.8 }); }
          if (foule) lisser(foule.gain, reg.foule ? 1 : 0, t, 3);
          return true;
        }
        regler(r);
        souvent(v, function (t) {
          if (Math.random() > (reg.nuit ? 0.25 : reg.soir ? 0.3 : 0.35 + 0.65 * reg.densite)) return;
          var g = Math.random() < 0.5;
          passage(s, t, hasard(2.8, 5) * lent(), hasard(0.1, 0.3), g ? -0.9 : 0.9, g ? 0.9 : -0.9, reg.densite > 0.8 && Math.random() < 0.3 ? 'bus' : 'voiture');
        }, 1.5, 4.5, 1, lent);
        souvent(v, function (t) { if (Math.random() < 0.6) { var g = Math.random() < 0.5; passage(s, t, hasard(5, 8) * lent(), hasard(0.02, 0.04), g ? -1 : 1, g ? 0.4 : -0.4, 'scooter'); } }, 18, 45, undefined, lent);
        souvent(v, function (t) {
          var g = Math.random() < 0.5; marcheur(s, t, Math.random() < 0.3 ? 'talons' : 'pave', 6 + Math.floor(Math.random() * 6), hasard(0.48, 0.56) * lent(), hasard(0.3, 0.55), g ? -0.8 : 0.8, g ? 0.7 : -0.7);
        }, 5, 14, 2, lent);
        souvent(v, function (t) { if (!reg.nuit && !reg.soir) pigeon(pan(hasard(-0.7, 0.7), s), t, hasard(0.07, 0.13)); }, 7, 18, 3, lent);
        souvent(v, function (t) { if (!reg.nuit && !reg.soir) envol(pan(hasard(-0.6, 0.6), s), t, 0.12); }, 30, 70, undefined, lent);
        souvent(v, function (t) { if (reg.ete || (reg.soir && Math.random() < 0.4)) martinets(s, t, hasard(0.025, 0.05)); }, 3, 9, 1, lent);
        souvent(v, function (t) { if (!reg.nuit && !reg.soir && reg.densite > 0.3) klaxon(pan(hasard(-0.8, 0.8), s), t, 0.012); }, 35, 90, undefined, lent);
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
      // L'hôpital (4.2, 7.5, 7.8) : le couloir, la ventilation, les néons ; des bips lointains et
      // désaccordés (chaque moniteur sa hauteur et son rythme, qui se taisent et reprennent) ; un
      // chariot, des pas qui couinent, une porte au loin. { mesure: true } (4.2) : les bips se mettent
      // en mesure (la pulsation de 6/8 de la ballade, 0,94 s, chaque moniteur à son tiers) ; { nuit:
      // true } (7.8) : presque plus rien que la ventilation, un seul moniteur, de loin en loin un chariot.
      hopital: function (v, r) {
        var s = salle(v, 1.3, 0.55, 0.35), reg = {}, MESURE = 0.9375;
        var vent = nappe(v, 'brun', 'lowpass', 200, 0.5, 0.05, v.sortie);
        nappe(v, 'rose', 'bandpass', 2200, 0.4, 0.014, v.sortie);
        [100, 200, 300, 400].forEach(function (f, i) { osc('sine', f, v).connect(ampli(0.005 / (i + 1), v.sortie)); });
        var moniteurs = [[943, -0.6], [1187, 0.5], [1411, 0.1]].map(function (m, i) {
          var st = { p: pan(m[1], s), periode: hasard(0.8, 1.35), marche: i < 2, prochain: ctx.currentTime + hasard(0.2, 1) };
          cadence(v, function (debut, fin) {
            while (st.prochain < fin) {
              if (st.marche && st.prochain >= debut && !(reg.nuit && i)) bip(st.p, st.prochain, m[0], 0.035);
              st.prochain += reg.mesure ? MESURE : st.periode;
            }
          });
          (function alterner() { v.plusTard(function () { st.marche = !st.marche; alterner(); }, hasard(st.marche ? 15 : 5, st.marche ? 45 : 18) * 1000); })();
          return st;
        });
        function nuit() { return reg.nuit ? 3 : 1; }
        souvent(v, function (t) { chariot(v, s, t); }, 16, 38, 6, nuit);
        souvent(v, function (t) {
          var g = Math.random() < 0.5, p = pan(g ? -0.7 : 0.7, s); glisserPan(p, g ? -0.7 : 0.7, g ? 0.5 : -0.5, t, 3);
          for (var i = 0; i < 6; i++) {
            pas(p, t + i * 0.52, 'lino', 0.22);
            if (Math.random() < 0.3) sifflet(p, t + i * 0.52 + 0.03, 0.05, 1900, 2300, 0.004, 0);   // la semelle qui couine
          }
        }, 7, 18, 3, nuit);
        souvent(v, function (t) { porteLoin(pan(hasard(-0.8, 0.8), s), t, 0.15); }, 22, 55, undefined, nuit);
        function regler(r2) {
          var t = ctx.currentTime, mesure = !!r2.mesure;
          if (mesure && !reg.mesure) moniteurs.forEach(function (st, i) { st.prochain = t + 0.3 + i * MESURE / 3; st.marche = true; });
          reg.mesure = mesure; reg.nuit = !!r2.nuit;
          lisser(vent.g.gain, reg.nuit ? 0.035 : 0.05, t, 2);
          return true;
        }
        regler(r);
        return { regler: regler };
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
      marche: function (v, r) {
        var s = salle(v, 0.8, 0.6, 0.1), ta = ampli(1, v.sortie);
        tanpura(v, ta, 0.55);
        [-0.5, 0.5].forEach(function (p) { var n = nappe(v, 'rose', 'bandpass', 420, 0.7, 0.07, pan(p, v.sortie)); derive(v, n.g.gain, 0.03, 0.1, 0.5, 2); });
        nappe(v, 'brun', 'lowpass', 300, 0.5, 0.12, v.sortie);
        var ins = nappe(v, 'blanc', 'bandpass', 5200, 4, 0.01, v.sortie); derive(v, ins.g.gain, 0.002, 0.014, 2, 6);
        souvent(v, function (t) { pas(pan(hasard(-0.9, 0.9), s), t, 'poussiere', hasard(0.1, 0.25)); }, 0.3, 1.2);
        souvent(v, function (t) { tinter(pan(hasard(-0.8, 0.8), s), t, hasard(900, 1700), [1, 2.1, 3.9, 5.3], hasard(0.02, 0.05), hasard(0.6, 1.4)); }, 1.5, 5);
        souvent(v, function (t) { etoffe(pan(hasard(-0.8, 0.8), s), t, hasard(0.05, 0.12)); }, 4, 10);
        souvent(v, function (t) { sonnette(pan(hasard(-0.8, 0.8), s), t, 0.03); }, 14, 32, 5);
        souvent(v, function (t) { corneille(pan(hasard(-0.8, 0.8), s), t, 0.05); }, 5, 14, 2);
        souvent(v, function (t) { klaxon(pan(hasard(-0.9, 0.9), s), t, 0.01, true); }, 20, 50);
        function regler(r2) { lisser(ta.gain, r2.tanpura === false ? 0 : 1, ctx.currentTime, 2); return true; }   // { tanpura: false } le tait
        regler(r);
        return { regler: regler };
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
        var h = ampli(0.3, v.sortie), prochain = ctx.currentTime + 0.4, k = 0, presse = null;
        // { presser: ms } (6.11) : « Continuer » presse les secondes qui restent, sans couper l'attente :
        // l'horloge passe d'un coup toutes les demi-secondes à un coup toutes les dixièmes, et finit par un coup plus net
        cadence(v, function (debut, fin) {
          while (prochain < fin) {
            var iv = 1;
            if (presse) {
              var u = (prochain - presse.t0) / presse.d;
              if (u >= 1) { if (prochain >= debut) tic(h, prochain, 1, 0.6); presse = null; }
              else if (u >= 0) iv = 0.5 - 0.4 * u;
            }
            if (prochain >= debut) tic(h, prochain, k % 2, presse ? 0.4 : 0.3);
            k++; prochain += iv;
          }
        });
        souvent(v, function (t) { braise(v.sortie, t, hasard(0.004, 0.012)); }, 0.6, 2.8);
        souvent(v, function (t) { etoffe(pan(hasard(-0.6, 0.6), v.sortie), t, 0.02); }, 18, 40);
        function regler(r2) {
          lisser(h.gain, borne(nombre(r2.horloge, 0.3)), ctx.currentTime, 1.5);
          if (nombre(r2.presser, 0) > 0 && !presse) {
            presse = { t0: ctx.currentTime, d: r2.presser / 1000 };
            if (prochain > presse.t0 + 0.35) prochain = presse.t0 + 0.35;   // le prochain coup vient tout de suite
          }
          return true;
        }
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
      var partage = !!(r && r.partage && typeof r.partage === 'object');   // chaque moitié a son niveau, la somme garde le sien
      var g = ampli(0, monde); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(partage ? 1 : niveau('ambiances', nom), t + 3);
      ambiance = { nom: nom, r: r, gain: g, vie: vie(g), regler: null };
      try {
        var res = partage ? ambiancePartagee(ambiance.vie, r) : ambiances[nom](ambiance.vie, r || {});
        if (res && res.regler) ambiance.regler = res.regler;
      } catch (e) { rate(e); }
    }
    // Deux ambiances à la fois, une par oreille (6.2 : une rue par oreille ; 7.4 : l'hôpital à gauche, le
    // fleuve à droite). r.partage : { gauche, droite } (les noms d'ambiance) ; r.actif : 'gauche',
    // 'droite', 'les deux' (par défaut) ou 'aucun' ; r.gauche, r.droite : les réglages de chaque moitié.
    // La moitié qui parle est à plein niveau, l'autre 9 dB plus bas, les deux s'effacent quand rien ne
    // parle ; jamais tout à fait d'un seul côté (±0,6) : une seule oreillette ou un haut-parleur les
    // entend toutes deux. Changer l'actif ne recommence rien (Son.partage).
    function ambiancePartagee(v, r) {
      var cotes = [];
      ['gauche', 'droite'].forEach(function (c, i) {
        var nom = cle(r.partage[c]);
        if (!nom || !ambiances.hasOwnProperty(nom)) return;
        var g = ampli(0, pan(i ? 0.6 : -0.6, v.sortie)), sv = vie(g), sr = (r[c] && typeof r[c] === 'object') ? r[c] : {};
        v.enfants.push(sv);
        var res = ambiances[nom](sv, sr);
        cotes.push({ c: c, g: g, k: niveau('ambiances', nom), regler: res && res.regler });
      });
      function regler(r2) {
        if (JSON.stringify(r2.partage) !== JSON.stringify(r.partage)) return false;   // d'autres lieux : on recommence
        var a = r2.actif || 'les deux', t = ctx.currentTime;
        // 0,71 : le panoramique d'un signal stéréo reporte une oreille sur l'autre, d'où 3 dB de plus
        cotes.forEach(function (x) { lisser(x.g.gain, 0.71 * x.k * (a === 'aucun' ? 0.2 : a === 'les deux' ? 0.85 : a === x.c ? 1 : 0.35), t, 2); });
        return true;
      }
      regler(r);
      return { regler: regler };
    }
    // La couche `horloge` des fiches (6.9 à 6.11) est le réglage `horloge` de l'ambiance de l'appartement ;
    // `presser` (ms) : les secondes qui restent s'égrènent plus vite (6.11).
    function horlogeCouche(allumer, o) {
      if (voulue !== 'appartement') return;
      var patch = { horloge: allumer ? (o.proche ? 1 : 0.3) : 0 };
      if (o.presser) patch.presser = o.presser;
      modifierAmbiance(patch);
    }
    // Change quelques réglages de l'ambiance voulue, sans la recommencer quand elle le peut.
    function modifierAmbiance(patch) {
      var r2 = {}, k, base = voulueR || {};
      for (k in base) if (base.hasOwnProperty(k)) r2[k] = base[k];
      for (k in patch) if (patch.hasOwnProperty(k)) r2[k] = patch[k];
      demanderAmbiance(voulue, r2);
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
    // La télévision derrière une porte (7.2), sans une parole : le générique d'une série inventée pour
    // le livre, puis des voix chuchotées qu'on ne comprend pas (trois personnes, dont il ne reste que
    // le grave : voir le murmure), des rires de salle ; tout passe par la porte (un passe-bas) et la
    // pièce d'à côté. Les voix se taisent pendant le générique.
    var GENERIQUE = [   // sol majeur, 112 à la noire ; [hauteur MIDI, durée en croches]
      [[76, 2], [79, 1], [76, 1], [74, 2], [72, 2]], [[72, 2], [76, 2], [74, 4]],
      [[77, 2], [76, 1], [74, 1], [72, 2], [69, 2]], [[71, 2], [74, 2], [79, 4]]
    ];
    var BASSE_GENERIQUE = [[43, 43, 50, 50], [40, 40, 47, 47], [36, 36, 43, 43], [38, 38, 45, 42]];
    // Des cuivres de synthétiseur : deux dents de scie à peine désaccordées, un filtre qui s'ouvre sur la note.
    function cuivre(sortie, a, d, midi, niv) {
      var f = biquad('lowpass', 700, 0.8), g = ctx.createGain();
      f.frequency.setValueAtTime(700, a); f.frequency.linearRampToValueAtTime(2000, a + 0.1);
      g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(niv, a + 0.025); g.gain.setValueAtTime(niv, Math.max(a + 0.03, a + d - 0.05)); g.gain.linearRampToValueAtTime(0, a + d);
      f.connect(g); g.connect(sortie);
      [-7, 7].forEach(function (c) { var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(midi); o.detune.value = c; o.connect(f); o.start(a); o.stop(a + d + 0.02); });
    }
    function generique(v, sortie, t, court) {
      var c = 60 / 112 / 2, debut = court ? 2 : 0;
      for (var m = debut; m < 4; m++) {
        var t0 = t + (m - debut) * 8 * c, x = 0;
        GENERIQUE[m].forEach(function (n) { cuivre(sortie, t0 + x * c, n[1] * c, n[0], 0.03); x += n[1]; });   // la mélodie
        BASSE_GENERIQUE[m].forEach(function (b, i) {   // la basse, les noires ; un accord sur les contretemps ; la batterie
          var a = t0 + i * 2 * c, o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(b);
          var g = ctx.createGain(); enveloppe(g, a, 0.01, 0.25, 0.3); o.connect(g); g.connect(sortie); o.start(a); o.stop(a + 0.4);
          [b + 24, b + 28, b + 31].forEach(function (h) { cuivre(sortie, a + c, 0.14, h, 0.006); });
          if (i % 2 === 0) { var kick = ctx.createOscillator(); kick.frequency.setValueAtTime(120, a); kick.frequency.exponentialRampToValueAtTime(45, a + 0.1); var gkk = ctx.createGain(); enveloppe(gkk, a, 0.002, 0.4, 0.15); kick.connect(gkk); gkk.connect(sortie); kick.start(a); kick.stop(a + 0.2); }
          else grain(sortie, a, 'blanc', 'bandpass', 1800, 0.8, 0.12, 0.002, 0.1);
        });
      }
      return (4 - debut) * 8 * c;   // la musique est planifiée d'un coup ; ses sources s'arrêtent seules
    }
    function tele(v) {
      var porte = biquad('lowpass', 850, 0.8, v.sortie), piece = ampli(1, porte), conv = convolueur(v, 0.6, 0.6);
      piece.connect(conv); conv.connect(ampli(0.35, porte));
      var voix = ampli(1, piece);   // les voix se taisent pendant le générique
      murmure(v, voix, { voix: 3, clair: 0.12, vitesse: 0.9, pauses: 1.3, large: 0.3, niv: 1.2 });
      function musiquer(t, court) {
        var d = generique(v, piece, t, court);
        voix.gain.setTargetAtTime(0.05, Math.max(0, t - 0.1), 0.15); voix.gain.setTargetAtTime(1, t + d, 0.5);
      }
      if (enMarche()) musiquer(ctx.currentTime + 0.2, false);   // le générique, d'abord
      souvent(v, function (t) { musiquer(t, Math.random() < 0.5); }, 28, 60, 30);
      souvent(v, function (t) { rire(piece, t, hasard(1.6, 3), 0.3); }, 10, 26, 6);   // des rires de salle
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
      if (mando) grain(sortie, t, 'blanc', 'bandpass', 3400, 1.2, force * 0.05, 0.0004, 0.006);   // le coup de médiator
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
        melange.connect(hp); hp.connect(pk); pk.connect(lpt); lpt.connect(sat); sat.connect(biquad('lowpass', 3600, 0.7, ampli(0.25, v.sortie)));   // la saturation fabrique des aigus qu'un petit haut-parleur ne rend pas
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
    // Les notes qui montent sous les pas (1.2 ; les trois premières en 7.8) : la, si, ré, mi, fa dièse, une
    // pentatonique sans tierce (aucun do dièse avant 3.10, la tierce que le père garde pour sa porte).
    // Une cloche douce : le son, son octave et un harmonique aigu qui meurt vite, un peu d'espace.
    var MONTANTES = [69, 71, 74, 76, 78];
    function noteMontante(k, o) {
      if (!chaineMontantes) {
        var g = ampli(niveau('effets', 'montantes'), busEff), conv = ctx.createConvolver(), e = ampli(1, g);
        conv.buffer = reponse(1.8, 0.5); e.connect(conv); conv.connect(ampli(0.3, g));
        chaineMontantes = e;
      }
      var force = borne(nombre(o.force, 1));
      tinter(chaineMontantes, ctx.currentTime + 0.01, hz(MONTANTES[k]), [1, 2, 4.02], 0.5 * force, 1.7);
    }
    // ---- les couches de la seconde partie
    // Le chœur de l'aube (3.5) : des oiseaux lointains qui s'éveillent, un par un puis de plus en plus
    // nombreux, sans mélodie (des sifflets glissés, des trilles, des pépiements, jamais deux fois la même
    // hauteur ni une gamme) ; il monte avec la lumière, en vingt-cinq secondes.
    function oiseauAube(sortie, t, niv) {
      var f = hasard(2100, 5400), type = Math.floor(Math.random() * 4), i;
      if (type === 0) sifflet(sortie, t, hasard(0.3, 0.7), f, f * hasard(0.8, 1.3), niv, hasard(14, 30), 0.04);        // un trille
      else if (type === 1) { sifflet(sortie, t, 0.18, f * 1.15, f, niv, 0, 0); sifflet(sortie, t + 0.24, 0.22, f * 0.92, f * 0.7, niv * 0.9, 0, 0); }   // deux notes qui tombent
      else if (type === 2) for (i = 0; i < 3 + Math.floor(Math.random() * 4); i++) sifflet(sortie, t + i * hasard(0.07, 0.12), 0.035, f, f * hasard(1.15, 1.5), niv * 0.8, 0, 0);   // des pépiements
      else { sifflet(sortie, t, hasard(0.5, 0.9), f * 0.6, f * hasard(0.9, 1.4), niv, hasard(5, 9), 0.05); }          // un long sifflet qui monte
    }
    function aube(v) {
      var s = salle(v, 1.6, 0.4, 0.5), t0 = ctx.currentTime;
      nappe(v, 'rose', 'bandpass', 1500, 0.4, 0.004, v.sortie);   // un fond d'air
      function densite() { return 0.1 + 0.9 * Math.min(1, (ctx.currentTime - t0) / 25); }
      souvent(v, function (t) {
        var d = densite();
        if (Math.random() > d) return;
        oiseauAube(pan(hasard(-0.9, 0.9), s), t, hasard(0.012, 0.03) * (0.5 + 0.5 * d));
      }, 0.2, 1, 0.6);
    }
    // Le couteau de Jivan sur sa planche (3.12 à 3.14) : un coup toutes les 0,7 s, un peu plus net au bout
    // de chaque mesure de quatre ; { lent: true } : un coup toutes les 1,1 s. Il s'arrête à la gerbe d'étincelles.
    function couteau(v, o) {
      var p = pan(-0.25, v.sortie), lent = !!o.lent, prochain = ctx.currentTime + 0.1, k = 0;
      cadence(v, function (debut, fin) {
        while (prochain < fin) {
          if (prochain >= debut) {
            var t = prochain + hasard(-0.012, 0.012), a = k % 4 === 3 ? 1 : hasard(0.65, 0.9);
            coupSourd(p, t, 330, 200, 0.045, 0.5 * a);                              // la planche qui sonne creux
            grain(p, t, 'brun', 'lowpass', 900, 0.8, 0.45 * a, 0.002, 0.04);
            grain(p, t, 'blanc', 'bandpass', 3000, 2, 0.12 * a, 0.0005, 0.008);     // la lame
            tinter(p, t, 520, [1, 2.4], 0.03 * a, 0.1);
          }
          k++; prochain += lent ? 1.1 : 0.7;
        }
      });
      return { regler: function (o2) { lent = !!o2.lent; } };
    }
    // La brise qui se lève quand les graines partent aux quatre vents (3.14) : deux souffles qui errent
    // de chaque côté, un sifflement léger ; elle monte pendant la première seconde, comme un air qui prend.
    function brise(v) {
      [-0.5, 0.5].forEach(function (p) {
        var n = nappe(v, 'brun', 'bandpass', 380, 0.6, 0.5, pan(p, v.sortie));
        derive(v, n.f.frequency, 250, 800, 1.5, 4); derive(v, n.g.gain, 0.1, 0.6, 1.2, 3.5);
      });
      var sf = nappe(v, 'rose', 'bandpass', 1100, 7, 0.03, v.sortie); derive(v, sf.f.frequency, 700, 1800, 2, 5); derive(v, sf.g.gain, 0, 0.05, 1.5, 4);
    }
    // Le bourdon (5.9) : un si bémol grave et sourd, deux cordes à peine désaccordées qui battent lentement,
    // « dans un coin de la tête » (un peu à droite, sans le monde ni la rue) ; il enfle et retombe ; éteint au clairon.
    function bourdon(v) {
      var p = pan(0.45, v.sortie), am = ampli(0.7, p);
      lfo(0.11, 0.3, am.gain, v);
      [[58.27, 1], [58.62, 0.8], [116.54, 0.4], [117.1, 0.25], [174.81, 0.15], [233.08, 0.06]].forEach(function (x) {
        var o1 = osc('sine', x[0], v); o1.connect(ampli(0.2 * x[1], am));
      });
    }

    // Les couches : `monde` : elle passe par le monde (et l'assourdi), sinon par le bus des effets ;
    // entree, sortie : ses fondus par défaut (s).
    var COUCHES = {
      battements: { monde: false, entree: 0.08, sortie: 0.8, faire: battements },
      pluie: { monde: true, entree: 3, sortie: 3, faire: function (v, o) { return averse(v, borne(nombre(o.densite, 0.5))); } },
      feu: { monde: true, entree: 2, sortie: 2.5, faire: feu },
      tele: { monde: true, entree: 1.5, sortie: 1.5, faire: tele },
      vibration: { monde: false, entree: 0.02, sortie: 0.15, faire: vibreur },
      melodie: { monde: false, entree: 0.02, sortie: 1.5, faire: ballade },
      aube: { monde: true, entree: 4, sortie: 3, faire: aube },
      couteau: { monde: true, entree: 0.1, sortie: 0.4, faire: couteau },
      vent: { monde: true, entree: 1, sortie: 3, faire: brise },
      bourdon: { monde: false, entree: 3, sortie: 2, faire: bourdon }
    };
    function allumerCouche(nom, o) {
      var d = COUCHES[nom];
      if (!d) return;
      o = o || {};
      var c = couches[nom];
      if (c) {
        c.ancienne = false;
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

    var BOUCLES = {};   // les sons qui durent (tictac, pied, autre-cote) : voir boucleEffet
    // ================================================================ les effets ponctuels de la seconde partie
    // Synthèse, partie 5.4 : effets.nom = function (t, force, o) ; `bus` est sa sortie, déjà à son niveau
    // (table NIVEAUX). Aucun ne dure plus de douze secondes ; ceux qui durent sont dans BOUCLES.
    // Quelques briques :
    // Un souffle de bruit dont la bande glisse de f0 à f1 en d secondes (a : l'attaque, type : le bruit).
    function glisse(sortie, t, d, f0, f1, q, niv, a, type) {
      var s = ctx.createBufferSource(), b = biquad('bandpass', f0, q), g = ctx.createGain(), at = a || 0.01;
      s.buffer = bruit(type || 'rose');
      b.frequency.setValueAtTime(f0, t); b.frequency.exponentialRampToValueAtTime(f1, t + at + d);
      enveloppe(g, t, at, niv, d);
      s.connect(b); b.connect(g); g.connect(sortie); s.start(t, Math.random() * 4); s.stop(t + at + d + 0.05);
      return b;
    }
    // Un coup sourd : une sinusoïde qui descend de f0 à f1.
    function coupSourd(sortie, t, f0, f1, d, niv) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d * 0.8);
      enveloppe(g, t, 0.003, niv, d); o.connect(g); g.connect(sortie); o.start(t); o.stop(t + d + 0.05);
    }
    // La réverbération brève d'une pièce ou d'une rue, pour un effet seul : rend son entrée.
    function chambreEcho(sortie, duree, clarte, humide) {
      var e = ampli(1, sortie), c = ctx.createConvolver(), h = ampli(humide, sortie);
      c.buffer = reponse(duree, clarte); e.connect(c); c.connect(h);
      horloge.poser(function () { try { e.disconnect(); c.disconnect(); c.buffer = null; h.disconnect(); } catch (err) { /* rien */ } }, (duree + 9) * 1000);
      return e;
    }
    // Sur quel sol marche-t-on ? Celui que dit la fiche (sol), sinon celui du lieu.
    function solPour(o) {
      var s = cle(o.sol);
      if (s && s.slice(-1) === 's') s = s.slice(0, -1);   // « plateformes », « pavés »
      if (s && (s === 'gravier' || SOLS.hasOwnProperty(s))) return s;
      var a = ambiance ? ambiance.nom : voulue;
      return ({ parc: 'gravier', rue: 'pave', marche: 'poussiere', hopital: 'lino', chambre: 'bois', appartement: 'bois', desert: 'sable', metro: 'pave' })[a] || 'pave';
    }
    var theEtat = { t: -99, k: 0 }, balancierK = 0;
    // Joue fn avec la sortie `bus` multipliée par k : équilibre les variantes d'un même effet.
    function avecGain(k, fn) { var a = bus; bus = ampli(k, a); try { fn(); } finally { bus = a; } }

    // ---- les portes, le bois, les objets du pigeonnier
    // le déclic sec d'une serrure, au quart de tour : le heurt, puis le pêne qui prend sa place (1.3, 6.13, 7.8)
    effets.cran = function (t) {
      grain(bus, t, 'blanc', 'bandpass', 2600, 4, 0.45, 0.0008, 0.012);
      tinter(bus, t, 3150, [1, 2.4], 0.05, 0.12);
      coupSourd(bus, t + 0.002, 220, 120, 0.05, 0.4);
      grain(bus, t + 0.05, 'blanc', 'bandpass', 1900, 5, 0.22, 0.0008, 0.01);
      coupSourd(bus, t + 0.052, 160, 100, 0.04, 0.2);
    };
    // du bois lourd et un loquet (2.9, 6.15)
    effets['porte-epaisse'] = function (t) {
      glisse(bus, t, 0.5, 700, 260, 1.2, 0.07, 0.02);   // l'air chassé
      coupSourd(bus, t + 0.04, 110, 48, 0.32, 0.8);     // le battant qui se pose
      grain(bus, t + 0.04, 'brun', 'lowpass', 260, 0.7, 0.9, 0.006, 0.22);
      grain(bus, t + 0.2, 'blanc', 'bandpass', 1700, 5, 0.3, 0.0008, 0.018);   // le loquet
      tinter(bus, t + 0.2, 2150, [1, 2.3], 0.04, 0.15);
    };
    // une porte lourde qui s'ouvre (6.4), ou qui se ferme (6.15, l'embrasure : { ferme: true })
    effets.porte = function (t, force, o) {
      if (o.ferme) {
        glisse(bus, t, 0.55, 500, 200, 1, 0.12, 0.05);
        coupSourd(bus, t + 0.5, 95, 45, 0.3, 0.7); grain(bus, t + 0.5, 'brun', 'lowpass', 300, 0.7, 0.6, 0.004, 0.2);
        grain(bus, t + 0.65, 'blanc', 'bandpass', 1700, 5, 0.25, 0.0008, 0.02);
        return;
      }
      grain(bus, t, 'blanc', 'bandpass', 1800, 5, 0.5, 0.0008, 0.02);   // le loquet qui cède
      var i, g = ctx.createGain(), os = ctx.createOscillator(), f = biquad('bandpass', 800, 5, g);   // le gond : un long grincement grave
      os.type = 'sawtooth'; os.frequency.setValueAtTime(75, t + 0.1);
      for (i = 1; i < 18; i++) os.frequency.setValueAtTime(65 + Math.random() * 40, t + 0.1 + i * 0.06);
      enveloppe(g, t + 0.1, 0.12, 0.2, 1); g.connect(bus); os.connect(f); os.start(t + 0.1); os.stop(t + 1.3);
      glisse(bus, t + 0.1, 1, 300, 600, 0.9, 0.3, 0.15);   // l'air qui entre
      coupSourd(bus, t + 1.15, 90, 55, 0.2, 0.7);           // le battant bute
    };
    // la porte battante qui bat deux fois (3.8)
    effets.battant = function (t) {
      [[0, 1], [0.55, 0.55]].forEach(function (b) {
        glisse(bus, t + b[0], 0.3, 400, 160, 0.9, 0.12 * b[1], 0.04);   // l'air brassé
        coupSourd(bus, t + b[0] + 0.12, 120, 60, 0.15, 0.5 * b[1]);     // le battant contre le chambranle
        grain(bus, t + b[0] + 0.12, 'brun', 'lowpass', 380, 0.8, 0.4 * b[1], 0.003, 0.1);
        grain(bus, t + b[0] + 0.125, 'blanc', 'bandpass', 2300, 3, 0.1 * b[1], 0.0008, 0.015);   // la plaque de poussée
      });
    };
    // une porte qui claque (6.12 : de plus en plus vite)
    effets.claque = function (t) {
      coupSourd(bus, t, 140, 55, 0.2, 0.7);
      grain(bus, t, 'blanc', 'lowpass', 1500, 0.7, 0.55, 0.0008, 0.05);
      grain(bus, t, 'brun', 'lowpass', 300, 0.7, 0.5, 0.002, 0.12);
      grain(bus, t + 0.004, 'blanc', 'bandpass', 3000, 2, 0.15, 0.0005, 0.012);
    };
    // le grincement mat des portes vides (6.11, 6.12) : le bois sans rien derrière
    effets['portes-vides'] = function (t) {
      var i, g = ctx.createGain(), os = ctx.createOscillator(), f = biquad('lowpass', 420, 1.5, g);
      os.type = 'sawtooth'; os.frequency.setValueAtTime(58, t);
      for (i = 1; i < 10; i++) os.frequency.setValueAtTime(48 + Math.random() * 28, t + i * 0.07);
      enveloppe(g, t, 0.1, 0.08, 0.7); g.connect(bus); os.connect(f); os.start(t); os.stop(t + 0.95);
    };
    // deux coups doux à la porte : un seul par appel (7.5)
    effets.toc = function (t) {
      coupSourd(bus, t, 190, 120, 0.07, 0.55);
      grain(bus, t, 'brun', 'lowpass', 500, 0.7, 0.5, 0.002, 0.04);
      tinter(bus, t, 430, [1, 2.5], 0.05, 0.12);
    };
    // du bois qui racle des planches : un tabouret qu'on tire (1.5)
    effets.tabouret = function (t) {
      glisse(bus, t, 0.65, 700, 500, 1.4, 0.1, 0.05);
      for (var i = 0; i < 8; i++) {
        var t1 = t + 0.02 + i * 0.075 + hasard(0, 0.025);
        grain(bus, t1, 'rose', 'bandpass', hasard(400, 800), 3, hasard(0.12, 0.3), 0.001, 0.04);
        coupSourd(bus, t1, hasard(110, 150), 70, 0.03, 0.12);
      }
    };
    // les pas : un seul par appel, sur le sol de la fiche ou du lieu (gravier, pavé, trottoir, plateforme…)
    // { rythme: 'traine' } (5.2) : on traîne les pieds
    effets.pas = function (t, force, o) {
      pas(bus, t, solPour(o), 0.6);
      if (o.rythme === 'traine') grain(bus, t + 0.13, 'rose', 'bandpass', 900, 0.8, 0.12, 0.05, 0.16);
    };
    // des pas dans l'herbe, au bord de l'eau (3.9) : quatre pas lents
    effets.herbe = function (t) {
      for (var i = 0; i < 4; i++) {
        var t1 = t + i * hasard(0.55, 0.65);
        glisse(bus, t1, 0.18, 1400, 2600, 0.8, 0.14, 0.03);   // l'herbe qui se couche
        coupSourd(bus, t1 + 0.02, 90, 55, 0.08, 0.25);
        grain(bus, t1 + 0.05, 'blanc', 'highpass', 3500, 0.7, 0.04, 0.01, 0.1);
      }
    };
    // la clochette de la porte de la pâtisserie (5.10)
    effets.clochette = function (t) { clochette(bus, t, 0.22); };
    // le merle : une phrase, puis, plus loin et plus sombre, la suivante (2.8)
    effets.merle = function (t) {
      var p1 = pan(0.5, bus); glisserPan(p1, 0.5, -0.5, t, 2.2);
      merle(p1, t, 0.22);
      merle(pan(-0.7, biquad('lowpass', 2600, 0.7, ampli(0.4, bus))), t + 1.9, 0.18);
    };

    // ---- la table, la cuisine, les objets de l'étal
    // la fourchette qu'on pose sur l'assiette (2.6)
    effets.fourchette = function (t) {
      grain(bus, t, 'blanc', 'bandpass', 3200, 3, 0.25, 0.0005, 0.02);
      tinter(bus, t, 2650, [1, 2.76, 5.4], 0.07, 0.25);
      grain(bus, t + 0.06, 'blanc', 'bandpass', 2400, 4, 0.1, 0.0005, 0.015);   // elle se pose
      tinter(bus, t + 0.065, 2200, [1, 2.76], 0.03, 0.15);
    };
    // la porcelaine posée sur la table (2.7)
    effets.porcelaine = function (t) {
      coupSourd(bus, t, 300, 180, 0.04, 0.3);
      grain(bus, t, 'blanc', 'bandpass', 2600, 1.5, 0.2, 0.0005, 0.02);
      tinter(bus, t + 0.002, 1250, [1, 2.32, 4.25], 0.09, 0.45);
      tinter(bus, t + 0.002, 1330, [1, 2.32], 0.05, 0.3);
    };
    // des assiettes qu'on débarrasse (2.7) : quatre pièces de porcelaine, l'une glissée sur l'autre
    effets.assiettes = function (t) {
      [[0, 1180, 1], [0.34, 1420, 0.8], [0.71, 1050, 0.9], [1.25, 1340, 0.7]].forEach(function (a) {
        tinter(bus, t + a[0], a[1], [1, 2.32, 4.25], 0.08 * a[2], 0.35);
        grain(bus, t + a[0], 'blanc', 'bandpass', 2400, 2, 0.15 * a[2], 0.0005, 0.02);
      });
      glisse(bus, t + 0.8, 0.35, 2800, 1800, 2.5, 0.05, 0.02);
    };
    // un trait de crayon (2.7) : le graphite sur le papier
    effets.crayon = function (t) {
      glisse(bus, t, 0.4, 3000, 5200, 2.5, 0.1, 0.04, 'blanc');
      for (var i = 0; i < 9; i++) grain(bus, t + i * 0.045 + hasard(0, 0.02), 'blanc', 'bandpass', hasard(3500, 6500), 3, 0.04, 0.001, 0.01);
    };
    // des tasses de café qu'on pose sur leur soucoupe (4.3)
    effets.tasse = function (t) {
      for (var i = 0; i < 2; i++) {
        var t1 = t + i * hasard(0.45, 0.8);
        coupSourd(bus, t1, 260, 160, 0.05, 0.25);
        grain(bus, t1, 'blanc', 'bandpass', 2400, 2, 0.12, 0.0005, 0.02);
        tinter(bus, t1 + 0.002, hasard(2200, 3000), [1, 2.8, 5.2], 0.06, 0.28);
      }
    };
    // le thé versé de haut (6.8) : à chaque appel un filet de plus, de plus en plus aigu (la tasse se remplit) ;
    // force : la hauteur de la théière
    effets.the = function (t, force) {
      theEtat.k = (t - theEtat.t < 1.6) ? Math.min(theEtat.k + 1, 9) : 0; theEtat.t = t;
      var f = 650 * Math.pow(1.13, theEtat.k);
      glisse(bus, t, 0.75, f, f * 1.08, 2.2, 0.16 * (0.5 + force), 0.05);
      for (var i = 0; i < 6; i++) goutte(bus, t + hasard(0, 0.7), 0.03 * force, false);
    };
    // ce qu'on achète à l'étal (5.2, `achat-<objet>`) : un bruit par objet
    var GAIN_ACHAT = { thes: 5, curcuma: 2.7, encens: 5, jarres: 1, tapisseries: 6.5 };
    effets.achat = function (t, force, o) { avecGain(GAIN_ACHAT[o.objet] || 1, function () { achat(t, o.objet); }); };
    function achat(t, ob) {
      var i;
      if (ob === 'thes') {   // le thé qu'on verse, le couvercle de fer-blanc
        glisse(bus, t, 0.7, 900, 1500, 2, 0.12, 0.04); for (i = 0; i < 4; i++) goutte(bus, t + hasard(0.1, 0.7), 0.025, false);
        tinter(bus, t + 0.78, 1700, [1, 2.9], 0.05, 0.3);
      } else if (ob === 'curcuma') {   // la poudre qui coule, la cuillère
        glisse(bus, t, 0.5, 5200, 3200, 0.7, 0.14, 0.02, 'blanc'); tinter(bus, t + 0.55, 2000, [1, 2.5], 0.04, 0.2);
      } else if (ob === 'encens') {   // l'allumette qu'on gratte, la flamme, quelques crépitements
        glisse(bus, t, 0.12, 2200, 4200, 2, 0.25, 0.01, 'blanc'); glisse(bus, t + 0.12, 0.35, 900, 600, 0.5, 0.18, 0.02);
        for (i = 0; i < 6; i++) crepiter(bus, t + 0.2 + hasard(0, 0.5), hasard(0.05, 0.15));
      } else if (ob === 'jarres') {   // la terre cuite : deux coups creux
        [[0, 330], [0.22, 410]].forEach(function (k) { coupSourd(bus, t + k[0], k[1] * 0.8, k[1] * 0.55, 0.08, 0.4); tinter(bus, t + k[0], k[1], [1, 2.2, 3.6], 0.1, 0.4); });
      } else if (ob === 'tapisseries') {   // l'étoffe qu'on déplie
        etoffe(bus, t, 0.25); etoffe(bus, t + 0.2, 0.2); glisse(bus, t, 0.35, 700, 400, 0.8, 0.07, 0.05);
      } else tinter(bus, t, 1800, [1, 2.6], 0.08, 0.3);
    }
    // le crissement du doigt sur la vitre embuée (5.11) : un petit cri de verre mouillé
    effets.buee = function (t) {
      var o1 = ctx.createOscillator(), g = ctx.createGain(), i;
      o1.type = 'triangle';
      for (i = 0; i < 16; i++) o1.frequency.setValueAtTime(hasard(1000, 2000), t + i * 0.018);
      enveloppe(g, t, 0.01, 0.08, 0.28); o1.connect(biquad('bandpass', 1800, 3, g)); g.connect(bus); o1.start(t); o1.stop(t + 0.35);
      glisse(bus, t, 0.28, 3000, 4500, 2, 0.05, 0.02);
    };
    // la mousse sous le doigt (1.4) : un léger crissement sec
    effets.mousse = function (t) {
      glisse(bus, t, 0.18, 1200, 2400, 0.9, 0.12, 0.04);
      for (var i = 0; i < 4; i++) grain(bus, t + hasard(0, 0.15), 'blanc', 'bandpass', hasard(2000, 4000), 2, 0.03, 0.001, 0.01);
    };
    // la bombe de peinture : la bille qui sonne, puis trois pschitt qui s'essoufflent (1.4)
    effets.bombe = function (t) {
      var i;
      for (i = 0; i < 6; i++) grain(bus, t + i * 0.04, 'blanc', 'bandpass', hasard(2800, 3600), 3, 0.1, 0.0005, 0.012);
      [[0.3, 0.3, 1], [0.8, 0.24, 0.75], [1.25, 0.18, 0.5]].forEach(function (b) { glisse(bus, t + b[0], b[1], 7000, 5000, 0.6, 0.2 * b[2], 0.01, 'blanc'); });
    };
    // un coup de coutelas : le sifflement de la lame, le bois qui reçoit (1.4)
    effets.coutelas = function (t) {
      glisse(bus, t, 0.09, 4200, 1500, 1.5, 0.25, 0.01, 'blanc');
      coupSourd(bus, t + 0.09, 150, 70, 0.1, 0.6);
      grain(bus, t + 0.09, 'blanc', 'bandpass', 900, 1.2, 0.3, 0.001, 0.03);
      tinter(bus, t + 0.095, 520, [1, 2.5], 0.04, 0.12);
    };
    // les poissons qui frétillent et plongent (1.4, 1.5)
    effets.poissons = function (t) {
      for (var i = 0; i < 10; i++) {
        var t1 = t + hasard(0, 1.3);
        glisse(bus, t1, hasard(0.05, 0.12), hasard(700, 1500), hasard(1500, 2500), 1.5, 0.1, 0.005);
        if (Math.random() < 0.5) goutte(bus, t1 + 0.04, 0.04, true);
      }
      coupSourd(bus, t + 1.4, 320, 160, 0.14, 0.2); glisse(bus, t + 1.4, 0.4, 900, 400, 0.9, 0.12, 0.01);   // le plongeon
    };
    // un froissement de toile (1.8)
    effets.lin = function (t) {
      for (var i = 0; i < 6; i++) grain(bus, t + i * hasard(0.07, 0.14), 'rose', 'bandpass', hasard(700, 1500), 0.9, 0.12, 0.02, hasard(0.08, 0.18));
    };
    // la main qui se retire, un froissement (6.13)
    effets.tissu = function (t) { etoffe(bus, t, 0.2); glisse(bus, t, 0.25, 1500, 700, 0.8, 0.06, 0.02); };
    // un balancier feutré : un tic à gauche, un tic à droite (2.2)
    effets.balancier = function (t, force, o) {
      var c = o.cote === 'droite' ? 1 : o.cote === 'gauche' ? 0 : (balancierK++ % 2), p = pan(c ? 0.45 : -0.45, bus);
      coupSourd(p, t, c ? 190 : 230, c ? 130 : 160, 0.05, 0.3);
      grain(p, t, 'brun', 'lowpass', 600, 0.8, 0.3, 0.002, 0.03);
      grain(p, t, 'blanc', 'bandpass', c ? 1300 : 1700, 6, 0.1, 0.001, 0.02);
    };
    // le velours sous le doigt (6.5)
    effets.velours = function (t) { glisse(bus, t, 0.45, 500, 900, 0.6, 0.1, 0.12); glisse(bus, t, 0.45, 300, 450, 0.5, 0.08, 0.15, 'brun'); };
    // la plume sur le papier (7.7) ; le papier frotté (7.7)
    effets.plume = function (t) {
      glisse(bus, t, 0.3, 4500, 3000, 3, 0.06, 0.05, 'blanc');
      for (var i = 0; i < 8; i++) grain(bus, t + i * 0.035 + hasard(0, 0.02), 'blanc', 'bandpass', hasard(3500, 6000), 4, 0.05, 0.001, 0.012);
    };
    effets.frottement = function (t) {
      var s = ctx.createBufferSource(), g = ctx.createGain(), b = biquad('bandpass', 1800, 0.5), i;
      s.buffer = bruit('rose'); s.connect(b); b.connect(g); g.connect(bus);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1, t + 0.04);
      for (i = 1; i < 14; i++) g.gain.linearRampToValueAtTime(hasard(0.03, 0.14), t + 0.04 + i * 0.025);
      g.gain.linearRampToValueAtTime(0, t + 0.45); s.start(t, Math.random() * 4); s.stop(t + 0.5);
    };
    // un pinceau sur le papier (3.7, 5.5, 6.6) ; la coche au pinceau de Darshan, au stylo de Julie (6.2)
    effets.pinceau = function (t) {
      glisse(bus, t, 0.5, 900, 2600, 0.8, 0.14, 0.12);
      for (var i = 0; i < 6; i++) grain(bus, t + 0.05 + i * 0.07, 'rose', 'bandpass', hasard(1500, 3500), 1.5, 0.02, 0.01, 0.03);
    };
    effets['coche-pinceau'] = function (t) { glisse(bus, t, 0.12, 1300, 2400, 1, 0.2, 0.02); coupSourd(bus, t + 0.1, 240, 180, 0.04, 0.12); };
    effets['coche-stylo'] = function (t) { glisse(bus, t, 0.06, 4000, 6000, 3, 0.12, 0.005, 'blanc'); tinter(bus, t + 0.06, 2800, [1], 0.05, 0.03); };
    // les touches du téléphone de Julie (4.3) ; l'envoi d'un message (4.3)
    effets.clavier = function (t) {
      tinter(bus, t, hasard(1250, 1500), [1, 2], 0.08, 0.025);
      grain(bus, t, 'blanc', 'highpass', 3000, 0.7, 0.1, 0.0003, 0.006);
    };
    effets.envoi = function (t) {
      var o1 = ctx.createOscillator(), g = ctx.createGain();
      o1.frequency.setValueAtTime(700, t); o1.frequency.exponentialRampToValueAtTime(1500, t + 0.12);
      enveloppe(g, t, 0.01, 0.1, 0.14); o1.connect(g); g.connect(bus); o1.start(t); o1.stop(t + 0.3);
      glisse(bus, t, 0.14, 1500, 4000, 1.2, 0.08, 0.02, 'blanc');
      tinter(bus, t + 0.12, 1900, [1, 2], 0.05, 0.1);
    };
    // un clic par cran de la réglette (4.2)
    effets.reglette = function (t) {
      grain(bus, t, 'blanc', 'bandpass', 2000, 4, 0.2, 0.0005, 0.008);
      coupSourd(bus, t, 420, 250, 0.02, 0.15);
    };
    // une graine lancée vers un bord (3.14)
    effets.graine = function (t) {
      glisse(bus, t, 0.14, 3800, 1800, 1.2, 0.12, 0.01, 'blanc');
      for (var i = 0; i < 3; i++) grain(bus, t + 0.16 + i * hasard(0.04, 0.08), 'blanc', 'bandpass', hasard(2500, 4000), 3, 0.05, 0.0005, 0.008);
    };
    // de l'eau brassée qui suit le doigt (1.7)
    effets.remous = function (t) {
      glisse(bus, t, 0.5, 450, 1100, 1.2, 0.12, 0.05);
      for (var i = 0; i < 3; i++) goutte(bus, t + hasard(0, 0.4), 0.05, true);
    };
    // quelques gouttes lourdes (6.12) : l'eau d'une fonte qui n'en finit pas
    effets['fonte-visqueuse'] = function (t) {
      for (var i = 0; i < 5; i++) {
        var t1 = t + i * hasard(0.35, 0.6), o1 = ctx.createOscillator(), g = ctx.createGain();
        o1.frequency.setValueAtTime(hasard(160, 220), t1); o1.frequency.exponentialRampToValueAtTime(hasard(300, 380), t1 + 0.22);
        enveloppe(g, t1, 0.03, 0.4, 0.25); o1.connect(biquad('lowpass', 900, 0.7, g)); g.connect(bus); o1.start(t1); o1.stop(t1 + 0.35);
      }
    };
    // l'éclat de 1.3, fêlé, puis du verre qui se brise (6.11)
    effets['eclat-brise'] = function (t) {
      effets.eclat(t);
      var t1 = t + 1.2;
      grain(bus, t1, 'blanc', 'highpass', 2500, 0.7, 0.6, 0.0004, 0.05);
      for (var i = 0; i < 18; i++) tinter(bus, t1 + 0.02 + i * hasard(0.015, 0.06), hasard(2500, 7000), [1, 2.76], hasard(0.02, 0.06), hasard(0.05, 0.25));
      coupSourd(bus, t1, 400, 120, 0.1, 0.15);
    };

    // ---- le compte, le téléphone, l'hôpital, le métro
    // le tic du compte (2.9, 3.14, 4.7, 5.1, 5.11, 6.1, 6.11) : bref et sec, dans la matière du monde de la page ;
    // chez Julie ({ monde: 'julie' }), celui de son téléphone
    effets.tic = function (t, force, o) {
      if (o.monde === 'julie' || o.julie) {
        var o1 = ctx.createOscillator(), g = ctx.createGain(); o1.frequency.value = 1900;
        enveloppe(g, t, 0.001, 0.038, 0.03); o1.connect(g); g.connect(bus); o1.start(t); o1.stop(t + 0.06);
        grain(bus, t, 'blanc', 'highpass', 3500, 0.7, 0.038, 0.0005, 0.006);
      } else tic(bus, t, 0, 0.5);
    };
    // le vibreur d'un téléphone posé : deux salves, comme la couche `vibration` mais d'un coup (4.3, 4.7)
    effets.vibreur = function (t) {
      var porte = ctx.createGain();
      porte.connect(biquad('bandpass', 330, 2.2, bus)); porte.connect(biquad('bandpass', 1250, 5, ampli(0.6, bus)));
      porte.gain.setValueAtTime(0, t);
      [0, 0.6].forEach(function (d) {
        porte.gain.setValueAtTime(0, t + d); porte.gain.linearRampToValueAtTime(1, t + d + 0.02);
        porte.gain.setValueAtTime(1, t + d + 0.37); porte.gain.linearRampToValueAtTime(0, t + d + 0.4);
      });
      [171, 175.5].forEach(function (f) { var o1 = ctx.createOscillator(); o1.type = 'square'; o1.frequency.value = f; o1.connect(ampli(0.4, porte)); o1.start(t); o1.stop(t + 1.1); });
    };
    // un bip de moniteur (4.2) ; { f } : sa hauteur
    effets.bip = function (t, force, o) { bip(bus, t, nombre(o.f, 1000), 0.2); };
    // le signal de fermeture et le claquement des portes du métro (4.1)
    effets['portes-metro'] = function (t) {
      for (var i = 0; i < 5; i++) {
        var o1 = ctx.createOscillator(), g = ctx.createGain(), t1 = t + i * 0.19;
        o1.frequency.value = 1250; g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(0.1, t1 + 0.01); g.gain.setValueAtTime(0.1, t1 + 0.1); g.gain.linearRampToValueAtTime(0, t1 + 0.12);
        o1.connect(g); g.connect(bus); o1.start(t1); o1.stop(t1 + 0.14);
      }
      glisse(bus, t + 1.1, 0.5, 6000, 4500, 0.6, 0.2, 0.02, 'blanc');       // l'air des vérins
      coupSourd(bus, t + 1.5, 110, 50, 0.2, 0.5); grain(bus, t + 1.5, 'blanc', 'bandpass', 1500, 1.5, 0.3, 0.001, 0.05);   // les portes qui se joignent
    };
    // une montre de gousset (1.9) : quatre battements par seconde, très doux
    function battementMontre(sortie, t, tac) {
      grain(sortie, t, 'blanc', 'bandpass', tac ? 3600 : 4200, 6, 0.5, 0.0008, 0.012);
      grain(sortie, t, 'blanc', 'bandpass', tac ? 1500 : 1750, 12, 0.35, 0.001, 0.03);
    }
    BOUCLES.tictac = function (v, g, o) {
      var prochain = ctx.currentTime + 0.05, t0 = prochain, k = 0, duree = o.boucle ? Infinity : nombre(o.duree, 2400) / 1000;
      cadence(v, function (debut, fin) {
        while (prochain < fin) {
          if (prochain - t0 > duree) { arreterBoucle('tictac', 0.2); return; }
          if (prochain >= debut) battementMontre(g, prochain, k % 2);
          k++; prochain += 0.25;
        }
      });
    };
    // un pied qui bat les deux temps forts d'une mesure à 6/8, sans note (5.8) ; il ralentit et s'efface
    // ({ ralentir: true }) ; sans `boucle`, deux mesures, puis il ralentit de lui-même
    BOUCLES.pied = function (v, g, o) {
      var prochain = ctx.currentTime + 0.05, iv = 0.9375, niv = 1, k = 0, ralentit = false, n = o.boucle ? Infinity : 4;
      cadence(v, function (debut, fin) {
        while (prochain < fin) {
          if (prochain >= debut) { var a = niv * (k % 2 ? 0.7 : 1); coupSourd(g, prochain, 110, 62, 0.09, 0.5 * a); grain(g, prochain, 'brun', 'lowpass', 450, 0.7, 0.35 * a, 0.003, 0.05); }
          k++; prochain += iv;
          if (ralentit) { iv *= 1.22; niv *= 0.72; if (niv < 0.1) { arreterBoucle('pied', 0.3); return; } }
          else if (k >= n) ralentit = true;
        }
      });
      return { regler: function (o2) { if (o2.ralentir || o2.arret) ralentit = true; } };
    };

    // ---- les grands moments
    // une seule note claire, tenue 3 s, dans l'aigu (5.9, 6.3) : le ré aigu, un peu d'air autour
    effets.clairon = function (t) {
      var e = chambreEcho(bus, 1.4, 0.5, 0.25), g = ctx.createGain(), vib = ctx.createOscillator(), gv = ampli(5);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.12); g.gain.setValueAtTime(0.16, t + 2.2); g.gain.linearRampToValueAtTime(0, t + 3.1);
      g.connect(e);
      [[1, 1], [2, 0.22], [3, 0.08]].forEach(function (h) {
        var o1 = ctx.createOscillator(); o1.frequency.value = 1174.66 * h[0]; gv.connect(o1.frequency);
        o1.connect(ampli(h[1], g)); o1.start(t); o1.stop(t + 3.2);
      });
      vib.frequency.value = 5.2; vib.connect(gv); vib.start(t); vib.stop(t + 3.2);
    };
    // une nappe chaude (5.9) : fa, do, fa, la, qui monte et s'attarde
    effets.eclair = function (t) {
      var e = chambreEcho(bus, 1.8, 0.35, 0.3), g = ctx.createGain(), f = biquad('lowpass', 900, 0.7, g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.14, t + 1.4); g.gain.setValueAtTime(0.14, t + 2.4); g.gain.linearRampToValueAtTime(0, t + 5.5);
      g.connect(e);
      [87.31, 130.81, 174.61, 220].forEach(function (f0) {
        [-6, 6].forEach(function (c) { var o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = f0; o1.detune.value = c; o1.connect(ampli(0.25, f)); o1.start(t); o1.stop(t + 5.6); });
      });
    };
    // le ronflement de l'aiguille affolée qui ralentit, puis un déclic quand elle se fixe (5.3) ;
    // { etat: 'etoile' } : une note claire à l'étoile du matin
    effets.aiguille = function (t, force, o) {
      if (o.etat === 'etoile' || o.etat === 'matin') { tinter(bus, t, 1760, [1, 2, 3.01], 0.1, 1.8); return; }
      var os = ctx.createOscillator(), am = ctx.createGain(), m = ctx.createOscillator(), gm = ampli(0.45, am.gain), g = ctx.createGain();
      os.type = 'sawtooth'; os.frequency.value = 78; am.gain.value = 0.5;
      m.frequency.setValueAtTime(26, t); m.frequency.exponentialRampToValueAtTime(4, t + 2.2); m.connect(gm);
      enveloppe(g, t, 0.15, 0.12, 2.2); os.connect(biquad('bandpass', 420, 2, am)); am.connect(g); g.connect(bus);
      os.start(t); m.start(t); os.stop(t + 2.6); m.stop(t + 2.6);
      effets.cran(t + 2.45);
    };
    // le paquet de confettis secoué, un froissement (5.5)
    effets.confettis = function (t) {
      for (var i = 0; i < 3; i++) { froissement(bus, t + i * 0.22, 0.2); coupSourd(bus, t + i * 0.22, 170, 110, 0.05, 0.12); }
      for (i = 0; i < 6; i++) grain(bus, t + hasard(0, 0.8), 'blanc', 'bandpass', hasard(3000, 6000), 3, 0.04, 0.0005, 0.01);
    };
    // un fruit qui roule et s'arrête (5.2)
    effets.roule = function (t) {
      var s = ctx.createBufferSource(), b = biquad('lowpass', 500, 0.7), g = ctx.createGain(), am = ctx.createGain(), m = ctx.createOscillator();
      s.buffer = bruit('brun'); am.gain.value = 0.5; m.frequency.setValueAtTime(7, t); m.frequency.exponentialRampToValueAtTime(1.5, t + 1.2); m.connect(ampli(0.45, am.gain));
      enveloppe(g, t, 0.08, 0.5, 1.1); s.connect(b); b.connect(am); am.connect(g); g.connect(bus); s.start(t, Math.random() * 4); s.stop(t + 1.4); m.start(t); m.stop(t + 1.4);
      coupSourd(bus, t + 1.25, 220, 150, 0.04, 0.1);
    };
    // le vent en rafales (6.1) ; le satin du ruban qui claque (6.1, 7.10)
    effets.mistral = function (t) {
      [0, 1.4].forEach(function (d, i) {
        glisse(bus, t + d, 1.4, 400, 1400, 0.5, 0.35, 0.7, 'brun');
        glisse(bus, t + d + 0.2, 1.1, 900, 1700, 6, 0.04 * (1 - 0.3 * i), 0.6);
      });
    };
    effets.satin = function (t) {
      for (var i = 0; i < 9; i++) grain(bus, t + i * 0.075 + hasard(0, 0.02), 'blanc', 'bandpass', 2200, 1.2, 0.1 + 0.02 * i, 0.002, 0.04);
      grain(bus, t + 0.78, 'blanc', 'highpass', 3500, 0.7, 0.5, 0.0004, 0.03);
    };
    // l'encre liquide qui s'épanouit sur la porte (6.4)
    effets.encre = function (t) {
      glisse(bus, t, 2.4, 300, 700, 1.2, 0.12, 0.6);
      coupSourd(bus, t, 70, 55, 2.4, 0.15);
      for (var i = 0; i < 5; i++) goutte(bus, t + hasard(0.2, 2), 0.04, true);
    };
    // le souffle de la fumée ; { eau: true } : l'eau d'un pinceau d'aquarelle (6.6)
    effets.fumee = function (t, force, o) {
      glisse(bus, t, 3.5, 1200, 700, 0.5, 0.1, 1.2);
      if (o.eau) for (var i = 0; i < 8; i++) goutte(bus, t + hasard(0.2, 3), 0.025, Math.random() < 0.3);
    };
    // les anneaux du rideau, puis la ville qui monte d'en bas et s'éloigne (6.7)
    effets.rideau = function (t) {
      for (var i = 0; i < 10; i++) tinter(bus, t + i * 0.05 * (1 + i * 0.05), hasard(2800, 3800), [1, 2.3], 0.04, 0.12);
      glisse(bus, t, 0.6, 3200, 2600, 1.5, 0.05, 0.05, 'blanc');
      glisse(bus, t + 0.6, 3.5, 250, 180, 0.6, 0.18, 1.2, 'brun');
    };
    // quelques mesures de guitare de rue qui passent de droite à gauche et s'éteignent avant leur accord (4.5) :
    // sol, mi mineur, do, ré sept, et le sol n'arrive pas (« l'accord tacite ») ; aucun do dièse
    var RUE_GUITARE = [[43, 50, 55, 59], [40, 47, 52, 55], [48, 55, 60, 64], [50, 57, 60, 66]];
    effets.musicien = function (t) {
      var d = 0.34, p = pan(0.8, bus), lp = biquad('lowpass', 4200, 0.6, p), g = ampli(1, lp);
      glisserPan(p, 0.8, -0.8, t, 8.4);
      lp.frequency.setValueAtTime(4200, t); lp.frequency.linearRampToValueAtTime(1500, t + 8.4);
      g.gain.setValueAtTime(1, t); g.gain.linearRampToValueAtTime(0.25, t + 8.4);
      RUE_GUITARE.forEach(function (c, m) {
        [[0, 0], [1, 1], [2, 2], [3, 3], [4, 2], [5, 3]].forEach(function (n) {
          var t1 = t + (m * 6 + n[0]) * d + hasard(-0.006, 0.006);
          pincer(g, t1, c[n[1]], 'guitare', n[0] ? 0.4 : 0.55, t1 + (n[0] ? 0.5 : 1.6), null);
        });
      });
    };

    // ---- le feu, la vision, l'étincelle
    // une gerbe d'étincelles (3.12, 7.6)
    effets.etincelles = function (t) {
      var i;
      glisse(bus, t, 0.5, 2000, 5000, 1, 0.08, 0.02, 'blanc');
      for (i = 0; i < 40; i++) grain(bus, t + Math.pow(Math.random(), 1.6) * 0.9, 'blanc', 'bandpass', hasard(2500, 7500), hasard(2, 6), hasard(0.04, 0.2), 0.0004, hasard(0.004, 0.015));
      for (i = 0; i < 6; i++) tinter(bus, t + hasard(0.05, 0.8), hasard(4000, 8000), [1, 2.4], 0.012, 0.15);
    };
    // les braises qui crépitent à peine (3.10, 3.11, 7.6)
    effets.braises = function (t) { for (var i = 0; i < 9; i++) crepiter(bus, t + hasard(0, 2.6), hasard(0.03, 0.12)); };
    // un battement sourd, intérieur : la vie palpite (3.10, 3.11)
    effets.battement = function (t) { var chaud = ctx.createWaveShaper(); chaud.curve = courbeDouce(1.6); chaud.connect(bus); battre(chaud, t, 'darshan'); };
    // une aspiration d'air brusque : l'air revient (3.11)
    effets.aspiration = function (t) {
      glisse(bus, t, 0.45, 250, 2600, 0.8, 0.5, 0.12);
      glisse(bus, t + 0.05, 0.3, 900, 3000, 2, 0.05, 0.1);
    };
    // une goutte, un glaçon dans le verre ; la glace qui craque ; le sable qui file (7.3)
    effets.glacon = function (t) {
      goutte(bus, t, 0.2, true);
      tinter(bus, t + 0.35, 2900, [1, 2.4, 4.1], 0.09, 0.5); grain(bus, t + 0.35, 'blanc', 'bandpass', 3200, 3, 0.15, 0.0005, 0.015);
    };
    effets.glace = function (t) {
      for (var i = 0; i < 5; i++) {
        var t1 = t + i * hasard(0.15, 0.35), o1 = ctx.createOscillator(), g = ctx.createGain();
        grain(bus, t1, 'blanc', 'bandpass', hasard(1500, 4000), 2, 0.3, 0.0004, hasard(0.01, 0.04));
        o1.frequency.setValueAtTime(1800, t1); o1.frequency.exponentialRampToValueAtTime(500, t1 + 0.08); enveloppe(g, t1, 0.002, 0.06, 0.08); o1.connect(g); g.connect(bus); o1.start(t1); o1.stop(t1 + 0.15);
      }
    };
    effets.sable = function (t) {
      glisse(bus, t, 1.6, 6000, 3500, 0.5, 0.12, 0.05, 'blanc');
      for (var i = 0; i < 40; i++) grain(bus, t + i * 0.04 + hasard(0, 0.03), 'blanc', 'highpass', hasard(3500, 5500), 0.7, 0.1 * (1 - i / 50), 0.0008, 0.01);
    };
    // un grondement sous le trottoir ; la pierre qui se fend (7.12)
    effets.grondement = function (t) {
      var o1 = ctx.createOscillator(), g = ctx.createGain(), s = ctx.createBufferSource(), b = biquad('lowpass', 90, 0.5), g2 = ctx.createGain();
      o1.frequency.setValueAtTime(34, t); o1.frequency.linearRampToValueAtTime(46, t + 3.4); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.7, t + 1.5); g.gain.linearRampToValueAtTime(0, t + 3.6);
      s.buffer = bruit('brun'); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.9, t + 1.4); g2.gain.linearRampToValueAtTime(0, t + 3.6);
      o1.connect(g); g.connect(bus); s.connect(b); b.connect(g2); g2.connect(bus); o1.start(t); o1.stop(t + 3.7); s.start(t, Math.random() * 4); s.stop(t + 3.7);
    };
    effets.pierre = function (t) {
      grain(bus, t, 'blanc', 'bandpass', 1200, 0.7, 0.6, 0.0005, 0.06);
      coupSourd(bus, t, 180, 60, 0.18, 0.6);
      for (var i = 0; i < 14; i++) grain(bus, t + 0.05 + hasard(0, 0.7), 'rose', 'bandpass', hasard(500, 2500), 1.5, hasard(0.03, 0.12), 0.002, 0.03);
    };
    // le dernier son du livre : un impact grave, sourd, court, qu'on sent plus qu'on n'entend, avec la
    // réverbération brève de la rue (7.15)
    effets.choc = function (t) {
      var e = chambreEcho(bus, 0.9, 0.3, 0.5);
      coupSourd(e, t, 85, 32, 1.2, 1);
      coupSourd(e, t + 0.01, 55, 28, 1, 0.7);
      grain(e, t, 'brun', 'lowpass', 160, 0.7, 1, 0.002, 0.25);
      grain(e, t, 'blanc', 'lowpass', 700, 0.7, 0.35, 0.001, 0.04);
    };
    // un éclat plus court, pour les lunettes de 1.9 et de 7.8 : le souffle, le choc, un anneau bref
    effets['eclat-court'] = function (t) {
      glisse(bus, t, 0.25, 260, 5200, 1.1, 0.3, 0.2, 'blanc');
      coupSourd(bus, t + 0.3, 120, 42, 0.3, 0.6);
      [1, 2.76, 5.4].forEach(function (m, i) { tinter(bus, t + 0.3, 587 * m, [1], 0.09 / (i + 1), 0.7 - i * 0.2); });
    };
    // les six paysages derrière les portes de 6.12 (une seconde chacun : village, gorge, ossau, banquise, rochers, champs)
    var GAIN_PAYSAGE = { village: 1, gorge: 2, ossau: 1.65, banquise: 0.81, rochers: 0.95, champs: 4.6 };
    effets.paysage = function (t, force, o) { avecGain(GAIN_PAYSAGE[cle(o.paysage)] || 1, function () { paysage(t, cle(o.paysage)); }); };
    function paysage(t, p) {
      var i;
      if (p === 'village') {   // une cloche, loin
        tinter(bus, t, 392, [1, 2.0, 2.4, 3.0, 4.1], 0.1, 1.6); glisse(bus, t, 1, 600, 900, 0.5, 0.03, 0.2);
      } else if (p === 'gorge') {   // l'eau qui gronde entre les parois
        glisse(chambreEcho(bus, 1.5, 0.4, 0.5), t, 1.1, 400, 700, 0.5, 0.2, 0.2);
      } else if (p === 'ossau') {   // le vent de l'altitude, un cri de chocard
        glisse(bus, t, 1.1, 300, 900, 0.5, 0.2, 0.3, 'brun'); sifflet(bus, t + 0.5, 0.12, 3400, 2400, 0.05, 0); sifflet(bus, t + 0.72, 0.1, 3300, 2300, 0.04, 0);
      } else if (p === 'banquise') {   // le froid : la glace qui craque, un grave qui court dessous
        effets.glace(t); coupSourd(bus, t + 0.1, 60, 40, 0.9, 0.25);
      } else if (p === 'rochers') {   // des pierres qui dévalent
        for (i = 0; i < 9; i++) { var f = hasard(140, 600); coupSourd(bus, t + i * hasard(0.06, 0.12), f, f * 0.6, 0.06, 0.22); grain(bus, t + i * 0.09, 'blanc', 'bandpass', hasard(1200, 3000), 2, 0.08, 0.0005, 0.012); }
      } else if (p === 'champs') {   // les blés, les cigales
        glisse(bus, t, 1, 2400, 3200, 0.6, 0.12, 0.2); for (i = 0; i < 14; i++) tinter(bus, t + i * 0.07, 4600, [1], 0.012, 0.03);
      } else { tinter(bus, t, 880, [1, 2.4], 0.06, 0.6); }
    }

    // ---- ce qu'on entend de l'autre côté d'une porte (1.3 : aluva, 1.9 : paris-midi, 3.8 : periyar, 7.8 :
    // hopital-nuit) : étouffé comme derrière des planches (un passe-bas, un creux de bois), qui monte en
    // 2,5 s ; jamais l'accord du père. { duree: ms } (40 s par défaut), { arret: true }, ou la page qui change.
    var LIEUX_GAIN = { aluva: 1, 'paris-midi': 0.86, periyar: 2.2, 'hopital-nuit': 2.35 };
    BOUCLES['autre-cote'] = function (v, g, o) {
      var lieu = cle(o.lieu) || 'aluva', duree = nombre(o.duree, 40000);
      var planches = biquad('lowpass', 800, 0.7, ampli(LIEUX_GAIN[lieu] || 1, g)), ent = biquad('peaking', 230, 1.2, planches);
      ent.gain.value = 4;
      if (lieu === 'paris-midi') {   // une rue à midi, et, très loin, la salle d'un restaurant
        var rue = nappe(v, 'brun', 'lowpass', 340, 0.5, 0.3, ent); derive(v, rue.g.gain, 0.2, 0.4, 2, 6);
        souvent(v, function (t) { var d = Math.random() < 0.5; passage(ent, t, hasard(2.8, 5), hasard(0.15, 0.35), d ? -0.8 : 0.8, d ? 0.8 : -0.8, 'voiture'); }, 2, 6, 0.5);
        murmure(v, ampli(0.35, ent), { voix: 8, clair: 0.3, niv: 0.5 });
        souvent(v, function (t) { tinter(ent, t, hasard(2300, 3800), [1, 2.76, 5.4], 0.02, 0.15); }, 3, 9, 2);
      } else if (lieu === 'periyar') {   // le clapotis du fleuve
        var clapot = nappe(v, 'rose', 'bandpass', 700, 0.7, 0.08, ent); derive(v, clapot.f.frequency, 500, 1100, 0.4, 1.2); derive(v, clapot.g.gain, 0.04, 0.12, 0.3, 1);
        nappe(v, 'rose', 'lowpass', 900, 0.5, 0.06, ent);
        souvent(v, function (t) { goutte(pan(hasard(-0.6, 0.6), ent), t, hasard(0.02, 0.06), Math.random() < 0.4); }, 0.15, 0.7, 0.1);
      } else if (lieu === 'hopital-nuit') {   // un bip désaccordé, un chariot au loin
        nappe(v, 'brun', 'lowpass', 200, 0.5, 0.06, ent);
        var pb = ctx.currentTime + 0.4;
        cadence(v, function (debut, fin) { while (pb < fin) { if (pb >= debut) bip(ent, pb, 1031, 0.06); pb += 1.32; } });
        souvent(v, function (t) { chariot(v, ent, t); }, 8, 16, 4);
      } else {   // aluva : le tanpura en do et sol, un oiseau, le fleuve
        tanpura(v, ent, 1.1);
        nappe(v, 'rose', 'lowpass', 1100, 0.5, 0.14, ent);
        souvent(v, function (t) { oiseauKerala(ent, t); }, 2.5, 7, 1);
      }
      v.plusTard(function () { arreterBoucle('autre-cote', 3); }, duree);
    };
    BOUCLES['autre-cote'].monte = 2.5;

    // Le son qui répond à un nom : l'effet lui-même, ou, pour « achat-<objet> » (5.2) et
    // « paysage-<image> » (6.11, 6.12), l'effet commun qui lit l'objet ou le paysage dans `o`.
    function trouverEffet(nom, o) {
      if (effets.hasOwnProperty(nom)) { var f = effets[nom]; f.niveau = nom; return f; }
      var m = /^(achat|paysage)-(.+)$/.exec(nom);
      if (m && effets.hasOwnProperty(m[1])) { o[m[1] === 'achat' ? 'objet' : 'paysage'] = m[2]; var g = effets[m[1]]; g.niveau = m[1]; return g; }
      return null;
    }
    // Les sons qui durent : `tictac`, `pied`, `autre-cote` (la table BOUCLES, plus bas). Effet('tictac',
    // { boucle: true }) les lance ; { arret: true } (ou { eteindre: ms }, ou { fin: true }) les arrête ;
    // { ralentir: true } les ralentit puis les éteint ; sans `boucle`, chacun se tait seul au bout de
    // son temps. Tous s'arrêtent avec la page.
    function boucleEffet(nom, o) {
      if (o.ralentir && boucles[nom] && boucles[nom].regler) { boucles[nom].regler(o); return; }   // ralentir, puis s'effacer
      if (o.arret === true || o.fin === true || o.eteindre !== undefined) { arreterBoucle(nom, nombre(o.eteindre, 400) / 1000); return; }
      lancerBoucle(nom, borne(nombre(o.force, 1)), function (v, g) { return BOUCLES[nom](v, g, o); }, BOUCLES[nom].monte);
    }

    // ---- les niveaux, réglés au banc d'essai (outils/darshan/essai-son.js) : un facteur de gain par
    // nom. Ambiances : toutes vers un même niveau perçu, environ −30 dBFS sur le bus (mesure
    // pondérée K) ; couches et effets : au-dessus, sans jamais crever le plafond.
    var NIVEAUX = {
      ambiances: {
        cosmos: 0.62, nuit: 1.06, kerala: 0.72, vent: 0.63, restaurant: 1.0, rue: 1.03, parc: 1.55, bibliotheque: 3.9,
        vision: 1.55, metro: 0.84, hopital: 2.6, chambre: 1.21, marche: 1.34, patisserie: 2.11, appartement: 2.0,
        desert: 0.42, pluie: 0.75
      },
      // la ballade : l'entière vers −20 (au plus fort, sur 400 ms) ; les fragments, étouffés, vers −30
      couches: { battements: 0.65, pluie: 0.92, feu: 0.53, tele: 0.62, vibration: 0.41, melodie: 0.38, aube: 3.05, couteau: 1.5, vent: 0.7, bourdon: 0.2 },
      // les effets vers −20 au plus fort (les chocs vers −18, les petits sons vers −23) ; l'appel,
      // très bas, vers −24 ; l'accord du père vers −20. « tour » écrêtait (+2,6 dBFS), « papier » et
      // « grince » ne s'entendaient pas.
      effets: {
        appel: 0.36, saut: 1.9, vibre: 2.9, fonte: 1.78, cle: 0.26, tour: 0.27, souffle: 0.67, tinte: 1.62,
        papier: 15.5, grince: 50, eclat: 0.98, balai: 5.4, declic: 1.6, bandes: 6.2, coup: 1.48, iris: 1.3, frisson: 2.8,
        pere: 0.32,
        // la seconde partie (mesurés au banc d'essai, partie 5.4 de la synthèse)
        cran: 2.12, 'porte-epaisse': 0.98, porte: 1.22, battant: 2.0, claque: 1.22, 'portes-vides': 6.6, toc: 1.45, tabouret: 6.4, pas: 3.3,
        herbe: 3.5, clochette: 0.47, merle: 1.08, fourchette: 3.7, porcelaine: 2.26, assiettes: 4.0, crayon: 8.75, tasse: 2.83, the: 10.8,
        achat: 1.65, buee: 10.2, mousse: 18.6, bombe: 3.5, coutelas: 1.46, poissons: 4.2, lin: 13, tissu: 12.6, balancier: 2.9, velours: 10.2,
        plume: 14, frottement: 5.3, pinceau: 9.3, 'coche-pinceau': 7.6, 'coche-stylo': 12.6, clavier: 7.8, envoi: 5.4, reglette: 6.3,
        graine: 9.7, remous: 10.5, 'fonte-visqueuse': 1.32, 'eclat-brise': 0.98, 'eclat-court': 1.06, tic: 9.8, vibreur: 0.64, bip: 1.06,
        'portes-metro': 1.63, clairon: 0.94, eclair: 2.14, aiguille: 2.06, confettis: 7.7, roule: 3.4, mistral: 3.4, satin: 1.68, encre: 1.96,
        fumee: 7.7, rideau: 5.3, musicien: 1.01, etincelles: 8.9, braises: 25.6, battement: 1.02, aspiration: 3.24, glacon: 1.83, glace: 6.1,
        sable: 2.45, grondement: 0.48, pierre: 1.35, choc: 0.375, paysage: 2.4, montantes: 0.26, tictac: 5.2, pied: 1.5, 'autre-cote': 1.55
      }
    };

    function demanderAmbiance(nom, r) {
      suivrePage();
      nom = cle(nom);
      r = (r && typeof r === 'object') ? r : reglagesDeLaPage();
      voulue = nom; voulueR = r;
      var silence = !nom || nom === 'silence';
      if (silence) couchesVoulues = {};
      if (!ctx || !actif) return;   // pas de son : seulement retenue
      try {
        if (silence) { Object.keys(couches).forEach(function (n) { eteindreCouche(n, null); }); Object.keys(boucles).forEach(function (n) { arreterBoucle(n, 0.5); }); }
        if (!ambiance || ambiance.nom !== nom) changerAmbiance(nom, r);
        else if (JSON.stringify(ambiance.r || {}) !== JSON.stringify(r || {})) {
          if (ambiance.regler && ambiance.regler(r || {})) ambiance.r = r; else changerAmbiance(nom, r);
        }
      } catch (e) { rate(e); }
    }

    return {
      init: function () { try { init(); } catch (e) { rate(e); } },
      // Fondu enchaîné vers l'ambiance `nom`, avec ses réglages ; 'silence' ou null : tout se tait
      // (les couches aussi ; l'accord du père, non). Sans réglages, ceux de la page (ses variantes :
      // soir, vaste, rame…) ; { partage: { gauche, droite }, actif } : deux ambiances à la fois.
      ambiance: function (nom, r) { demanderAmbiance(nom, r); },
      // Effet ponctuel ; o : { force: 0 à 1 (gain, 1 par défaut), pan: -1 à 1 } ; pour 'pere', voir
      // l'en-tête (montee, tenu, eteindre, duree). Nom inconnu : rien.
      effet: function (nom, o) {
        nom = cle(nom);
        if (!ctx || !nom) return;
        o = (o && typeof o === 'object') ? o : {};
        try {
          if (nom === 'pere') { accordDuPere(o); return; }
          if (!actif) return;
          if (nom === 'jour') { nom = 'autre-cote'; if (!o.lieu) o.lieu = 'aluva'; }   // l'ancien nom : le jour d'une porte, jamais l'accord du père
          if (BOUCLES.hasOwnProperty(nom)) { boucleEffet(nom, o); return; }
          var fait = trouverEffet(nom, o);
          if (!fait) return;
          var force = borne(nombre(o.force, 1)), p = Math.max(-1, Math.min(1, nombre(o.pan, 0)));
          var sortie = ctx.createGain(), fin = sortie;
          sortie.gain.value = force * niveau('effets', fait.niveau || nom);
          if (p && ctx.createStereoPanner) { fin = ctx.createStereoPanner(); fin.pan.value = p; sortie.connect(fin); }
          fin.connect(busEff);
          bus = sortie;
          fait(ctx.currentTime + 0.01, force, o);
          horloge.poser(function () { try { fin.disconnect(); sortie.disconnect(); } catch (e) { /* rien */ } }, 12000);
        } catch (e) { rate(e); }
      },
      // Couche continue par-dessus l'ambiance (voir l'en-tête) ; oui : true (par défaut) ou false.
      couche: function (nom, oui, o) {
        suivrePage();
        nom = cle(nom);
        if (!nom) return;
        var allumer = arguments.length < 2 || !!oui;
        o = (o && typeof o === 'object') ? o : {};
        if (nom === 'horloge') { try { horlogeCouche(allumer, o); } catch (e) { rate(e); } return; }
        if (allumer) couchesVoulues[nom] = o; else delete couchesVoulues[nom];
        if (!ctx || !actif) return;   // pas de son : seulement retenue
        try { if (allumer) allumerCouche(nom, o); else eteindreCouche(nom, o); } catch (e) { rate(e); }
      },
      // Une note de la première mesure de la ballade (voir l'en-tête) ; rend son indice, ou −1.
      note: function (nom, i, o) {
        if (!ctx || !actif) return -1;
        nom = cle(nom);
        if (nom !== 'melodie' && nom !== 'montantes') return -1;
        try {
          var m = nom === 'melodie' ? 6 : MONTANTES.length, k = (typeof i === 'number' && isFinite(i)) ? ((Math.floor(i) % m) + m) % m : (nom === 'melodie' ? pasMelodie : pasMontantes);
          if (nom === 'melodie') { pasMelodie = (k + 1) % 6; noteSeule(k, (o && typeof o === 'object') ? o : {}); }
          else { pasMontantes = (k + 1) % m; noteMontante(k, (o && typeof o === 'object') ? o : {}); }
          return k;
        } catch (e) { rate(e); return -1; }
      },
      // 'assourdi' : le monde s'étouffe (passe-bas vers 450 Hz, en 1,5 s) ; null : il revient.
      filtre: function (nom) {
        filtreVoulu = cle(nom) === 'assourdi' ? 'assourdi' : null;
        if (!ctx) return;
        try { appliquerFiltre(filtreVoulu, 1.5); } catch (e) { rate(e); }
      },
      // Le niveau du monde (l'ambiance et les couches qui passent par lui), de 0 à 1, atteint en ms ;
      // sans toucher aux réglages du lecteur ni aux effets. 1.1 : le vent tombe sous la voix (0,2 en
      // 1 500 ms), `fin` le rétablit ; revient à 1 avec chaque page.
      niveau: function (v, ms) {
        niveauVoulu = volume(v);
        if (!ctx || !niveauNode) return;
        try { lisser(niveauNode.gain, niveauVoulu, ctx.currentTime, Math.max(0, nombre(ms, 0)) / 1000); } catch (e) { rate(e); }
      },
      // La rue ralentie (7.10, 7.11) : { ralenti: true } de l'ambiance, sans la recommencer.
      ralenti: function (oui) { try { modifierAmbiance({ ralenti: oui !== false }); } catch (e) { rate(e); } },
      // Quelle moitié parle, quand deux ambiances jouent à la fois : 'gauche', 'droite', 'les deux', 'aucun'.
      partage: function (a) { try { modifierAmbiance({ actif: a }); } catch (e) { rate(e); } },
      // Une nouvelle page commence (le moteur n'a pas à le dire : le son la voit tout seul).
      page: function () { try { suivrePage(); } catch (e) { rate(e); } },
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
      // Pour le banc d'essai : le livre demande-t-il un son que Son sait faire ? (sorte : 'ambiance', 'couche', 'effet')
      _connu: function (sorte, nom) {
        nom = cle(nom);
        if (sorte === 'ambiance') return !nom || nom === 'silence' || ambiances.hasOwnProperty(nom);
        if (sorte === 'couche') return nom === 'horloge' || COUCHES.hasOwnProperty(nom);
        return nom === 'pere' || nom === 'jour' || BOUCLES.hasOwnProperty(nom) || !!trouverEffet(nom, {});
      },
      _essai: function (c) {
        var file = [], n = 0;
        banc = { erreurs: [] };
        horloge = {
          poser: function (f, ms) { n += 1; file.push({ id: n, t: c.currentTime + Math.max(0, nombre(ms, 0)) / 1000, f: f }); return n; },
          oter: function (id) { for (var i = 0; i < file.length; i++) if (file[i].id === id) { file.splice(i, 1); return; } }
        };
        ambiance = null; voulue = null; voulueR = null; couches = {}; couchesVoulues = {}; filtreVoulu = null;
        pere = null; pasMelodie = 0; pasMontantes = 0; chaineNotes = null; chaineMontantes = null; tampons = {}; actif = true;
        boucles = {}; pageEnCours = null; niveauVoulu = 1; niveauNode = null; theEtat = { t: -99, k: 0 }; balancierK = 0;
        var sortie = construire(c, null);
        return {
          sortie: sortie, avantPlafond: maitre, bus: { ambiance: busAmb, effets: busEff }, erreurs: banc.erreurs, niveaux: NIVEAUX,
          noms: { ambiances: Object.keys(ambiances), couches: Object.keys(COUCHES), effets: Object.keys(effets).concat(['pere']), boucles: Object.keys(BOUCLES) },
          minuteries: function () { return file.length; },
          etat: function () { return { ambiance: ambiance ? ambiance.nom : null, couches: Object.keys(couches).sort(), boucles: Object.keys(boucles).sort(), niveau: niveauVoulu }; },
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
