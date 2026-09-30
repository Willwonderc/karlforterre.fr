// Banc d'essai du son : rend hors ligne, dans Chromium, chaque ambiance, chaque couche et chaque
// effet de src/js/son.js (dans un OfflineAudioContext, par Son._essai), puis écrit leurs mesures.
// Usage, depuis outils/darshan/ :
//   NODE_PATH=/opt/node22/lib/node_modules node essai-son.js [--wav] [nom…]
// Sans nom : tout ; avec des noms (ou des débuts de noms), seulement ceux-là. --wav : écrit aussi
// chaque rendu (la sortie, en stéréo) dans captures/son/, dossier non suivi par Git.
//
// Colonnes (niveaux en dBFS, rendus à 48 kHz, volumes du lecteur au maximum) :
//   bus     RMS du bus (ambiance et effets, avant le compresseur), sur la fenêtre de mesure
//   bus K   le même, pondéré K (ITU-R BS.1770) : le niveau perçu ; les ambiances visent −30
//   sortie  RMS de la sortie (après compresseur, maître et plafond)
//   crête   crête de la sortie sur tout le rendu : jamais au-dessus de −1
//   comp.   crête juste après le compresseur et le maître, avant le plafond (qui ne doit servir
//           que de filet) : jamais au-dessus de −1 non plus
//   moment  niveau perçu le plus fort sur 400 ms (bus, pondéré K) : la mesure des effets
//   silence part de la fenêtre (par tranches de 100 ms) sous −60 dBFS en sortie
//   G/M/A   part de l'énergie sous 250 Hz, de 250 à 2 000 Hz, au-dessus de 2 000 Hz
//   courbe  les octaves de 63 Hz à 8 kHz, de ▁ (42 dB sous la plus forte) à █
// Ensuite, l'endurance : cent changements d'ambiance d'affilée (toutes les 1,6 s), des couches qui
// s'allument et s'éteignent, des effets, le son coupé puis remis, puis le silence ; à la fin, plus
// une source ne doit jouer, plus une réverbération ne doit garder son tampon, plus une minuterie
// ne doit attendre. Enfin, les problèmes : crête, erreur rattrapée, échantillon non fini, son qui
// continue après l'arrêt, minuterie qui survit à son ambiance ou à sa couche.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const avecWav = args.includes('--wav');
const choisis = args.filter((a) => !a.startsWith('--'));
const CIBLE = -30;   // niveau perçu visé pour les ambiances, sur le bus

// ---------------------------------------------------------------- les scénarios
// Une action : [instant (s), fonction de Son, arguments…].
function scenarios(noms) {
  const liste = [];
  const amb = (nom, reglage, titre) => liste.push({
    sorte: 'ambiance', nom: titre || nom, cle: nom, duree: 26, mesure: [3, 20], fin: [23.5, 26],
    actions: [[0, 'ambiance', nom, reglage || null], [20, 'ambiance', 'silence']],
  });
  noms.ambiances.forEach((n) => amb(n));
  amb('kerala', { soir: true }, 'kerala (soir)');
  amb('vent', { feuilles: true }, 'vent (feuilles)');
  amb('rue', { densite: 1 }, 'rue (dense)');
  amb('rue', { nuit: true }, 'rue (nuit)');
  amb('rue', { ete: true, densite: 0.3 }, 'rue (été)');
  amb('bibliotheque', { vaste: true }, 'bibliotheque (vaste)');
  amb('metro', { rame: true }, 'metro (rame)');
  amb('chambre', { fenetre: true }, 'chambre (fenêtre)');
  amb('chambre', { nuit: true }, 'chambre (nuit)');
  amb('appartement', { horloge: 1 }, 'appartement (horloge)');
  amb('desert', { jour: true }, 'desert (jour)');
  amb('pluie', { densite: 0.3 }, 'pluie (0,3)');
  // un changement de réglage sans recommencer (Pékin, 3.6 ; le vent qui tombe, 7.1)
  liste.push({ sorte: 'ambiance', nom: 'bibliotheque → vaste', duree: 20, mesure: [10, 16], fin: [18.5, 20],
    actions: [[0, 'ambiance', 'bibliotheque'], [6, 'ambiance', 'bibliotheque', { vaste: true }], [16, 'ambiance', 'silence']] });
  liste.push({ sorte: 'ambiance', nom: 'desert → vent 0,1', duree: 20, mesure: [10, 16], fin: [18.5, 20],
    actions: [[0, 'ambiance', 'desert'], [6, 'ambiance', 'desert', { vent: 0.1 }], [16, 'ambiance', 'silence']] });

  const cou = (nom, o, titre, duree = 21) => liste.push({
    sorte: 'couche', nom: titre || nom, cle: nom, duree, mesure: [3, duree - 5], fin: [duree - 1.5, duree],
    actions: [[0.1, 'couche', nom, true, o || {}], [duree - 5, 'couche', nom, false]],
  });
  liste.push({ sorte: 'couche', nom: 'battements', cle: 'battements', duree: 14, mesure: [1, 10], fin: [12.5, 14],
    actions: [[0.1, 'couche', 'battements', true, { tempo: 72 }], [4, 'couche', 'battements', true, { tempo: 132, duree: 4000 }],
      [10, 'couche', 'battements', false]] });
  liste.push({ sorte: 'couche', nom: 'battements (deux cœurs)', cle: 'battements', duree: 14, mesure: [1, 10], fin: [12.5, 14],
    actions: [[0.1, 'couche', 'battements', true, { tempo: 96, julie: 64 }], [3, 'couche', 'battements', true, { cale: true }],
      [6, 'couche', 'battements', true, { tempo: 80, julie: 80, duree: 3000, cale: true }], [10, 'couche', 'battements', false]] });
  noms.couches.filter((n) => n !== 'battements' && n !== 'melodie').forEach((n) => cou(n));
  cou('vibration', { fois: 3 }, 'vibration (3 fois)', 12);
  const bal = (o, titre, duree) => liste.push({ sorte: 'couche', nom: titre, cle: 'melodie', duree, mesure: [0.1, duree - 1], fin: [duree - 1, duree],
    actions: [[0.1, 'couche', 'melodie', true, o]] });
  bal({ mode: 'fragment', filtre: 'eau' }, 'melodie (fragment, eau)', 7);
  bal({ mode: 'fragment', notes: 6 }, 'melodie (fragment, 6 notes)', 7);
  bal({ mode: 'mesure' }, 'melodie (mesure)', 7);
  bal({ mode: 'entiere' }, 'melodie (entière)', 21);
  bal({ mode: 'entiere', filtre: 'telephone' }, 'melodie (téléphone)', 21);
  liste.push({ sorte: 'couche', nom: 'melodie (boucle)', cle: 'melodie', duree: 38, mesure: [0.1, 32], fin: [36.5, 38],
    actions: [[0.1, 'couche', 'melodie', true, { mode: 'entiere', boucle: true }], [32, 'couche', 'melodie', false]] });
  liste.push({ sorte: 'couche', nom: 'melodie (six pas, 7.9)', cle: 'melodie', duree: 6, mesure: [0.3, 5], fin: [5.5, 6],
    actions: [0.4, 0.8, 1.15, 1.5, 1.8, 2.1].map((t) => [t, 'note', 'melodie']) });

  noms.effets.forEach((n) => {
    if (n === 'pere') {
      liste.push({ sorte: 'effet', nom: 'pere', cle: 'pere', duree: 14, mesure: [0.1, 8], fin: [13, 14],
        actions: [[0.1, 'effet', 'pere'], [8, 'effet', 'pere', { eteindre: 3000 }]] });
      liste.push({ sorte: 'effet', nom: 'pere (tenu, 7.13)', cle: 'pere', duree: 13, mesure: [0.1, 5], fin: [12, 13],
        actions: [[0.1, 'effet', 'pere', { tenu: true }], [4, 'ambiance', 'silence'], [5, 'effet', 'pere', { eteindre: 4000 }]] });
    } else {
      liste.push({ sorte: 'effet', nom: n, cle: n, duree: n === 'appel' ? 12 : 10, mesure: [0, n === 'appel' ? 12 : 10], fin: null,
        actions: [[0.1, 'effet', n]] });
    }
  });
  // l'endurance : cent changements d'ambiance, des couches, des effets, le son coupé puis remis
  const act = [];
  const modes = ['fragment', 'mesure', 'entiere'];
  for (let i = 0; i < 100; i++) {
    const t = i * 1.6, nom = noms.ambiances[i % noms.ambiances.length];
    act.push([t, 'ambiance', nom, i % 3 === 0 ? { vaste: true, densite: 1, rame: true, soir: true, jour: true, horloge: 1 } : null]);
    if (i % 9 === 0) act.push([t + 0.3, 'couche', 'battements', true, { tempo: 60 + i, julie: i % 2 ? 64 : false, duree: 2000 }]);
    if (i % 9 === 4) act.push([t + 0.3, 'couche', 'battements', false]);
    if (i % 11 === 0) act.push([t + 0.4, 'couche', 'pluie', true, { densite: 0.8 }]);
    if (i % 11 === 6) act.push([t + 0.4, 'couche', 'pluie', false]);
    if (i % 13 === 0) act.push([t + 0.5, 'couche', 'tele', true]);
    if (i % 13 === 7) act.push([t + 0.5, 'couche', 'tele', false]);
    if (i % 17 === 0) act.push([t + 0.6, 'couche', 'feu', true]);
    if (i % 17 === 8) act.push([t + 0.6, 'couche', 'feu', false]);
    if (i % 19 === 0) act.push([t + 0.7, 'couche', 'vibration', true, { fois: 2 }]);
    if (i % 10 === 5) act.push([t + 0.8, 'couche', 'melodie', true, { mode: modes[(i / 10 | 0) % 3], filtre: i % 20 === 5 ? 'telephone' : null }]);
    if (i % 6 === 0) act.push([t + 0.9, 'effet', ['eclat', 'coup', 'appel', 'papier', 'tour'][(i / 6 | 0) % 5]]);
    if (i % 25 === 0) act.push([t + 1, 'effet', 'pere']);
    if (i % 25 === 3) act.push([t + 1, 'effet', 'pere', { eteindre: 2000 }]);
  }
  act.push([80.2, 'basculer'], [85.1, 'basculer']);   // le son coupé, puis remis
  act.push([160, 'ambiance', 'silence'], [160, 'effet', 'pere', { eteindre: 1000 }]);
  liste.push({ sorte: 'endurance', nom: 'cent changements', duree: 196, actions: act });
  // la panne du 30 septembre (partie rapide du livre, son coupé) : metro, hopital, metro, rue,
  // toutes les 2 s, cent fois ; son coupé d'abord (aucune source ne doit démarrer), puis ouvert
  for (const coupe of [true, false]) {
    const a2 = coupe ? [[0, 'basculer']] : [];
    for (let i = 0; i < 100; i++) a2.push([0.1 + i * 2, 'ambiance', ['metro', 'hopital', 'metro', 'rue'][i % 4]]);
    a2.push([200.1, 'ambiance', 'silence']);
    liste.push({ sorte: 'endurance', nom: 'metro, hopital, metro, rue' + (coupe ? ' (son coupé)' : ''), duree: 236, actions: a2, coupe });
  }
  // tout ensemble : une rue, deux cœurs, la ballade entière, puis les effets les plus forts
  liste.push({ sorte: 'ensemble', nom: 'tout ensemble', duree: 18, mesure: [3, 16], fin: null,
    actions: [[0, 'ambiance', 'rue', { densite: 1 }], [0.1, 'couche', 'battements', true, { tempo: 110, julie: 80 }],
      [0.2, 'couche', 'melodie', true, { mode: 'entiere' }], [0.3, 'couche', 'pluie', true, { densite: 1 }],
      [3, 'effet', 'eclat'], [3.1, 'effet', 'tour'], [5, 'effet', 'coup'], [5.02, 'effet', 'souffle'], [7, 'effet', 'pere'],
      [7.5, 'effet', 'appel'], [9, 'effet', 'cle'], [9.01, 'effet', 'declic']] });
  return liste;
}

// ---------------------------------------------------------------- ce qui tourne dans la page
function dansLaPage() {
  const K = [   // la pondération K à 48 kHz (ITU-R BS.1770) : un plateau aigu, puis un passe-haut
    [1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585],
    [1.0, -2.0, 1.0, -1.99004745483398, 0.99007225036621],
  ];
  function ponderer(x) {
    let y = Float32Array.from(x);
    for (const [b0, b1, b2, a1, a2] of K) {
      const z = new Float32Array(y.length);
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < y.length; i++) { const v = b0 * y[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = y[i]; y2 = y1; y1 = v; z[i] = v; }
      y = z;
    }
    return y;
  }
  const db = (ms) => (ms > 0 ? 10 * Math.log10(ms) : -Infinity);
  function moyenne(a, b, i0, i1) { let s = 0; for (let i = i0; i < i1; i++) s += a[i] * a[i] + b[i] * b[i]; return s / Math.max(1, 2 * (i1 - i0)); }
  function fft(re, im) {   // radix 2, en place
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let j = 0; j < len / 2; j++) {
          const ar = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, ai = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
          re[i + j + len / 2] = re[i + j] - ar; im[i + j + len / 2] = im[i + j] - ai; re[i + j] += ar; im[i + j] += ai;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  function spectre(L, R, i0, i1, sr) {
    const N = 8192, bandes = new Float64Array(8), gma = [0, 0, 0], re = new Float64Array(N), im = new Float64Array(N);
    for (let d = i0; d + N <= i1; d += N) {
      for (let i = 0; i < N; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)); re[i] = (L[d + i] + R[d + i]) * 0.5 * w; im[i] = 0; }
      fft(re, im);
      for (let k = 1; k < N / 2; k++) {
        const f = k * sr / N, p = re[k] * re[k] + im[k] * im[k];
        gma[f < 250 ? 0 : f < 2000 ? 1 : 2] += p;
        const o = Math.floor(Math.log2(f / 44.19));
        if (o >= 0 && o < 8) bandes[o] += p;
      }
    }
    const tot = gma[0] + gma[1] + gma[2] || 1, max = Math.max(...bandes) || 1;
    const blocs = '▁▂▃▄▅▆▇█';
    const courbe = Array.from(bandes, (p) => { const x = p > 0 ? 10 * Math.log10(p / max) : -99; return blocs[Math.max(0, Math.min(7, Math.floor((x + 42) / 6)))]; }).join('');
    return { gma: gma.map((x) => Math.round(100 * x / tot)), courbe };
  }
  function enWav(L, R, sr) {   // 16 bits, stéréo, en base 64
    const n = L.length, buf = new ArrayBuffer(44 + n * 4), v = new DataView(buf);
    const ecrire = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ecrire(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); ecrire(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 2, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true);
    ecrire(36, 'data'); v.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) {
      v.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i] || 0)) * 32767, true);
      v.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i] || 0)) * 32767, true);
    }
    const octets = new Uint8Array(buf); let s = '';
    for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
    return btoa(s);
  }
  window.noms = () => window.Son._essai(new OfflineAudioContext(2, 128, 48000)).noms;
  // L'endurance : à 16 kHz (seuls comptent les nœuds et les minuteries), en comptant les sources
  // démarrées et finies, et les réverbérations encore chargées.
  window.endurance = async function (item) {
    const sr = 16000, ctx = new OfflineAudioContext(2, Math.ceil(sr * item.duree), sr);
    const compte = { demarrees: 0, finies: 0, max: 0, convolueurs: [] };
    const demarrer = AudioScheduledSourceNode.prototype.start, creer = BaseAudioContext.prototype.createConvolver;
    AudioScheduledSourceNode.prototype.start = function () {
      compte.demarrees++; this.addEventListener('ended', () => { compte.finies++; }, { once: true });
      return demarrer.apply(this, arguments);
    };
    BaseAudioContext.prototype.createConvolver = function () { const c = creer.apply(this, arguments); compte.convolueurs.push(c); return c; };
    try {
      const e = window.Son._essai(ctx);
      e.sortie.connect(ctx.destination);
      const actions = item.actions.slice().sort((a, b) => a[0] - b[0]);
      let ia = 0;
      const faire = (t) => {
        while (ia < actions.length && actions[ia][0] <= t + 1e-9) {
          const a = actions[ia++];
          try { window.Son[a[1]].apply(null, a.slice(2)); } catch (err) { e.erreurs.push('action : ' + err.message); }
        }
      };
      faire(0);
      for (let k = 1; k * 0.1 < item.duree - 0.05; k++) {
        ctx.suspend(k * 0.1).then(() => {
          const t = ctx.currentTime; faire(t); e.avancer(t);
          compte.max = Math.max(compte.max, compte.demarrees - compte.finies);
          ctx.resume();
        });
      }
      await ctx.startRendering();
      await new Promise((ok) => setTimeout(ok, 200));   // les derniers « ended »
      return {
        demarrees: compte.demarrees, finies: compte.finies, vivantes: compte.demarrees - compte.finies, max: compte.max,
        convolueurs: compte.convolueurs.length, charges: compte.convolueurs.filter((c) => c.buffer).length,
        minuteries: e.minuteries(), erreurs: e.erreurs.slice(0, 5),
      };
    } finally {
      AudioScheduledSourceNode.prototype.start = demarrer; BaseAudioContext.prototype.createConvolver = creer;
    }
  };
  window.rendre = async function (item, avecWav) {
    const sr = 48000, n = Math.ceil(sr * item.duree);
    const ctx = new OfflineAudioContext(6, n, sr);
    const e = window.Son._essai(ctx);
    // deux prises stéréo (un son mono y devient deux canaux égaux, comme à l'oreille) : la sortie, le bus
    const stereo = () => { const g = ctx.createGain(); g.channelCount = 2; g.channelCountMode = 'explicit'; g.channelInterpretation = 'speakers'; return g; };
    const s1 = ctx.createChannelSplitter(2), s2 = ctx.createChannelSplitter(2), s3 = ctx.createChannelSplitter(2), m = ctx.createChannelMerger(6);
    const sor = stereo(), tot = stereo(), avp = stereo();
    e.sortie.connect(sor); sor.connect(s1); s1.connect(m, 0, 0); s1.connect(m, 1, 1);
    e.bus.ambiance.connect(tot); e.bus.effets.connect(tot); tot.connect(s2); s2.connect(m, 0, 2); s2.connect(m, 1, 3);
    e.avantPlafond.connect(avp); avp.connect(s3); s3.connect(m, 0, 4); s3.connect(m, 1, 5);   // après le compresseur, avant le plafond
    m.connect(ctx.destination);
    const actions = item.actions.slice().sort((a, b) => a[0] - b[0]);
    let ia = 0;
    const faire = (t) => {
      while (ia < actions.length && actions[ia][0] <= t + 1e-9) {
        const a = actions[ia++];
        try { window.Son[a[1]].apply(null, a.slice(2)); } catch (err) { e.erreurs.push('action : ' + err.message); }
      }
    };
    faire(0);
    for (let k = 1; k * 0.05 < item.duree - 0.01; k++) {
      ctx.suspend(k * 0.05).then(() => { const t = ctx.currentTime; faire(t); e.avancer(t); ctx.resume(); });
    }
    const b = await ctx.startRendering();
    const L = b.getChannelData(0), R = b.getChannelData(1), BL = b.getChannelData(2), BR = b.getChannelData(3);
    const PL = b.getChannelData(4), PR = b.getChannelData(5);
    let crete = 0, creteComp = 0, nonFinis = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.max(Math.abs(L[i]), Math.abs(R[i])), c = Math.max(Math.abs(PL[i]), Math.abs(PR[i]));
      if (!isFinite(L[i]) || !isFinite(R[i])) nonFinis++; else if (a > crete) crete = a;
      if (c > creteComp) creteComp = c;
    }
    const i0 = Math.floor(item.mesure[0] * sr), i1 = Math.min(n, Math.floor(item.mesure[1] * sr));
    const kBL = ponderer(BL), kBR = ponderer(BR);
    let moment = 0;
    for (let d = 0; d + 19200 <= n; d += 4800) moment = Math.max(moment, moyenne(kBL, kBR, d, d + 19200));
    let muettes = 0, tranches = 0;
    for (let d = i0; d + 4800 <= i1; d += 4800) { tranches++; if (db(moyenne(L, R, d, d + 4800)) < -60) muettes++; }
    const r = {
      bus: db(moyenne(BL, BR, i0, i1)), busK: db(moyenne(kBL, kBR, i0, i1)), sortie: db(moyenne(L, R, i0, i1)),
      crete: crete > 0 ? 20 * Math.log10(crete) : -Infinity, creteComp: creteComp > 0 ? 20 * Math.log10(creteComp) : -Infinity,
      moment: db(moment),
      silence: tranches ? muettes / tranches : 0, spectre: spectre(L, R, i0, i1, sr), nonFinis,
      fin: item.fin ? db(moyenne(L, R, Math.floor(item.fin[0] * sr), Math.min(n, Math.floor(item.fin[1] * sr)))) : null,
      minuteries: e.minuteries(), erreurs: e.erreurs.slice(0, 5), niveau: null,
    };
    const table = { ambiance: 'ambiances', couche: 'couches', effet: 'effets' }[item.sorte];
    if (table && item.cle) r.niveau = e.niveaux && e.niveaux[table] && typeof e.niveaux[table][item.cle] === 'number' ? e.niveaux[table][item.cle] : 1;
    if (avecWav) r.wav = enWav(L, R, sr);
    return r;
  };
}

// ---------------------------------------------------------------- en avant
(async () => {
  const racine = __dirname;
  const son = fs.readFileSync(path.join(racine, 'src/js/son.js'), 'utf8');
  const nav = await chromium.launch();
  const page = await nav.newPage();
  const erreursPage = [];
  page.on('pageerror', (e) => erreursPage.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreursPage.push(m.text()); });
  await page.setContent('<!doctype html><meta charset="utf-8"><title>Banc d’essai du son</title>');
  // son.js est un fragment du moteur : on lui fournit ce que base.js lui donne (reglages, ecrire)
  await page.addScriptTag({ content: "window.Son = (function () {\n'use strict';\nvar reglages = { son: true, ambiance: 1, effets: 1 };\nfunction ecrire() {}\n" + son + '\nreturn Son;\n})();' });
  await page.addScriptTag({ content: '(' + dansLaPage.toString() + ')();' });
  const noms = await page.evaluate(() => window.noms());
  let liste = scenarios(noms);
  if (choisis.length) liste = liste.filter((s) => choisis.some((c) => s.nom.startsWith(c)));
  const dossierWav = path.join(racine, 'captures', 'son');
  if (avecWav) fs.mkdirSync(dossierWav, { recursive: true });

  const f = (x, l = 6) => (x === null ? '' : x === -Infinity ? '−∞' : x.toFixed(1).replace('-', '−')).padStart(l);
  const titres = { ambiance: 'Ambiances', couche: 'Couches', effet: 'Effets', ensemble: 'Ensemble' };
  const problemes = [], notes = [];
  let sorte = null;
  const t0 = Date.now();
  for (const s of liste) {
    if (s.sorte === 'endurance') {
      const r = await page.evaluate((item) => window.endurance(item), s);
      console.log(`\nEndurance (${s.nom}, ${Math.round(s.duree)} s de rendu) : ${r.demarrees} sources démarrées, ${r.finies} finies, ` +
        `${r.vivantes} encore en vie à la fin (au plus ${r.max} à la fois) ; ${r.convolueurs} réverbérations fabriquées, ` +
        `${r.charges} encore chargées ; ${r.minuteries} minuterie(s) en attente.`);
      if (s.coupe && r.demarrees) problemes.push(`endurance, son coupé : ${r.demarrees} source(s) démarrée(s)`);
      if (r.vivantes) problemes.push(`endurance : ${r.vivantes} source(s) encore en vie à la fin`);
      if (r.charges) problemes.push(`endurance : ${r.charges} réverbération(s) encore chargée(s) à la fin`);
      if (r.minuteries) problemes.push(`endurance : ${r.minuteries} minuterie(s) encore en attente à la fin`);
      if (r.erreurs.length) problemes.push(`endurance : erreurs rattrapées : ${r.erreurs.join(' ; ')}`);
      sorte = null;
      continue;
    }
    if (s.sorte !== sorte) {
      sorte = s.sorte;
      console.log('\n' + titres[sorte]);
      console.log('nom'.padEnd(26) + '   bus  bus K sortie  crête  comp. moment silence  G/M/A      courbe    niveau' + (sorte === 'ambiance' ? '  → proposé' : ''));
    }
    const r = await page.evaluate(([item, w]) => window.rendre(item, w), [s, avecWav]);
    const gma = r.spectre.gma.map((x) => String(x).padStart(2)).join('/');
    let ligne = s.nom.padEnd(26) + f(r.bus) + f(r.busK, 7) + f(r.sortie, 7) + f(r.crete, 7) + f(r.creteComp, 7) + f(r.moment, 7) +
      (Math.round(r.silence * 100) + ' %').padStart(8) + '  ' + gma.padEnd(10) + ' ' + r.spectre.courbe + '  ' +
      (r.niveau === null ? '' : String(+r.niveau.toFixed(3)).padStart(6));
    if (s.sorte === 'ambiance' && r.niveau !== null && s.cle && isFinite(r.busK) && !s.nom.includes('→')) {
      ligne += '  → ' + (r.niveau * Math.pow(10, (CIBLE - r.busK) / 20)).toFixed(3);
    }
    console.log(ligne);
    if (r.crete > -1) problemes.push(`${s.nom} : crête à ${f(r.crete, 0)} dBFS`);
    if (r.creteComp > -1) (s.sorte === 'ensemble' ? notes : problemes).push(`${s.nom} : crête à ${f(r.creteComp, 0)} dBFS après le compresseur, que le plafond ramène à ${f(r.crete, 0)}`);
    if (r.nonFinis) problemes.push(`${s.nom} : ${r.nonFinis} échantillons non finis`);
    if (r.erreurs.length) problemes.push(`${s.nom} : erreurs rattrapées : ${r.erreurs.join(' ; ')}`);
    if (r.fin !== null && r.fin > -80) problemes.push(`${s.nom} : encore ${f(r.fin, 0)} dBFS après l'arrêt`);
    if ((s.sorte === 'ambiance' || s.sorte === 'couche') && r.minuteries) problemes.push(`${s.nom} : ${r.minuteries} minuterie(s) encore en attente à la fin`);
    if (avecWav) fs.writeFileSync(path.join(dossierWav, s.nom.replace(/[^a-z0-9éèàâêîôûç,.-]+/gi, '-').replace(/-+$/, '') + '.wav'), Buffer.from(r.wav, 'base64'));
  }
  console.log(`\n${liste.length} rendus en ${Math.round((Date.now() - t0) / 1000)} s` + (avecWav ? ` ; WAV dans ${path.relative(process.cwd(), dossierWav) || '.'}` : ''));
  if (erreursPage.length) problemes.push('erreurs de la page : ' + erreursPage.join(' ; '));
  if (notes.length) console.log('À noter :\n- ' + notes.join('\n- '));
  console.log(problemes.length ? 'Problèmes :\n- ' + problemes.join('\n- ') : 'Aucun problème : ni crête, ni erreur, ni son ou minuterie qui survit à l’arrêt.');
  await nav.close();
  process.exitCode = problemes.length ? 1 : 0;
})();
