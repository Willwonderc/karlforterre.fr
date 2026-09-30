// Planche des dessins d'objets de Darshan jouable (src/js/dessins.js).
//
// Chaque dessin paraît trois fois, comme dans le livre : en grand sur le fond de sa fiche (chez
// Darshan l'écrin de nuit au filet d'or, chez Julie la carte claire de son téléphone, comme
// .carte-julie dans moteur.css), dans la pose de repos du gros plan ; en petit dans le bandeau
// « Nouvel objet » (icône d'environ 130 × 70 px) ; et à la même taille sur un décor (l'envol
// vers le bouton « Objets »), avec son nom tiré d'objets.ini.
//
// Usage, depuis outils/darshan/ (Playwright et Chromium sont installés dans les sessions) :
//   NODE_PATH=/opt/node22/lib/node_modules node planche-objets.js [noms…]
// Sans nom : tous les dessins ; avec des noms (« cle cle-placard »), seulement ceux-là.
// Écrit captures/planche-objets.png (dossier non suivi par Git).
//
// Le programme vérifie aussi chaque dessin et l'écrit dans le terminal : XML valide, ni texte,
// ni police, ni image, ni script, identifiants internes en « f-… » (dessin() les rend uniques),
// liens internes (url(#…)) tous résolus, poids en octets (4 Ko au plus si possible).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ICI = __dirname;
const SORTIE = path.join(ICI, 'captures', 'planche-objets.png');
const demandes = process.argv.slice(2);

// ---------------------------------------------------------------- noms et porteurs (objets.ini)
function lireObjets() {
  const objets = {};
  let courant = null;
  for (const ligne of fs.readFileSync(path.join(ICI, 'objets.ini'), 'utf8').split('\n')) {
    if (/^\s*#/.test(ligne)) continue;
    const s = ligne.match(/^\[([^\]]+)\]/);
    if (s) { courant = objets[s[1]] = { nom: s[1], porteur: 'darshan' }; continue; }
    const r = ligne.match(/^(nom|porteur)\s*=\s*(.+)$/);
    if (r && courant) courant[r[1]] = r[2].trim();
  }
  return objets;
}
const OBJETS = lireObjets();

// Un état (« cle-placard ») porte le nom de son objet (« cle ») et son qualificatif.
function etiquette(id) {
  if (OBJETS[id]) return { nom: OBJETS[id].nom, etat: '', porteur: OBJETS[id].porteur };
  const base = Object.keys(OBJETS).filter((o) => id.indexOf(o + '-') === 0).sort((a, b) => b.length - a.length)[0];
  if (base) return { nom: OBJETS[base].nom, etat: id.slice(base.length + 1), porteur: OBJETS[base].porteur };
  return { nom: id, etat: '', porteur: 'darshan' };
}

// ---------------------------------------------------------------- ressources embarquées
function enDonnees(fichier, type) {
  return 'data:' + type + ';base64,' + fs.readFileSync(path.join(ICI, fichier)).toString('base64');
}
const POLICE = enDonnees('src/fonts/Unna-Regular.woff2', 'font/woff2');
// un décor de chaque monde : l'encre du marché d'Aluva, la photo de la chambre de Julie
const DECORS = {
  darshan: enDonnees('src/img/decors/marche.webp', 'image/webp'),
  julie: enDonnees('src/img/decors/chambre.webp', 'image/webp'),
};

// Le fragment du moteur, tel que build.py l'assemble : dans une fonction, en mode strict,
// après base.js (qui définit « doc »).
const fragment = fs.readFileSync(path.join(ICI, 'src/js/dessins.js'), 'utf8');
const script = "(function () {\n'use strict';\nvar doc = document;\n" + fragment +
  '\nwindow.DESSINS_PLANCHE = DESSINS; window.dessinPlanche = dessin;\n})();';

// Mesures reprises de moteur.css, à l'échelle de l'EPUB (1cqw = 12 px) : l'icône du bandeau
// fait 11 × 6 cqw, soit 132 × 72 px.
const PAGE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
@font-face { font-family: "Unna"; src: url("${POLICE}") format("woff2"); }
html, body { margin: 0; background: #05060f; color: #f5efe2; font-family: "Unna", Georgia, serif; }
h1 { margin: 0; padding: 28px 32px 0; font-weight: 400; font-size: 40px; color: #ffe7b0; }
h1 small { font-size: 20px; color: #aaa5b9; margin-left: 16px; }
.grille { display: grid; grid-template-columns: repeat(3, 680px); gap: 24px; padding: 24px 32px 32px; }
.cellule { background: #0b0e20; border: 1px solid #262b47; border-radius: 14px; padding: 14px 16px 18px; }
.titre { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 0 0 10px; }
.titre b { font-weight: 400; font-size: 27px; color: #ffe7b0; }
.titre i { font-style: normal; font-size: 18px; color: #f4c56a; }
.titre span { font-size: 16px; color: #aaa5b9; white-space: nowrap; }
.titre span.lourd { color: #ff8f7a; }
.fiche { height: 256px; display: flex; align-items: center; justify-content: center; perspective: 1000px;
  background: linear-gradient(rgba(22, 27, 52, 0.97), rgba(10, 13, 30, 0.98));
  border: 2px solid rgba(244, 197, 106, 0.55); border-radius: 18px;
  box-shadow: inset 0 0 0 5px rgba(244, 197, 106, 0.06); }
.fiche.julie { background: linear-gradient(#f7f5f0, #e7e3da); border-color: rgba(20, 20, 20, 0.18); box-shadow: none; }
.fiche svg { width: 70%; height: auto; filter: drop-shadow(0 11px 13px rgba(0, 0, 0, 0.65));
  transform: rotateY(-9deg) rotateX(4deg); }
.bas { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; }
.bandeau { display: flex; align-items: center; gap: 22px; padding: 16px 34px 16px 26px; margin-left: 14px;
  background: rgba(7, 9, 26, 0.95); border-left: 19px solid #c9302c; box-shadow: 14px 14px 0 rgba(244, 197, 106, 0.85);
  transform: skewX(-12deg); color: #ffe7b0; font-size: 22px; line-height: 1.15; max-width: 440px; }
.bandeau > span { display: block; transform: skewX(12deg); }
.bandeau .icone { width: 132px; height: 72px; flex: none; }
.bandeau .icone svg, .decor svg { width: 100%; height: 100%; display: block; }
.bandeau small { display: block; font-variant: small-caps; letter-spacing: 0.12em; color: #f4c56a; font-size: 18px; }
.decor { width: 150px; height: 112px; border-radius: 8px; background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center; flex: none; }
.decor span { width: 132px; height: 72px; }
</style></head><body><h1>Darshan : les objets <small id="resume"></small></h1><div class="grille" id="grille"></div>
<script>${script}</script></body></html>`;

// ---------------------------------------------------------------- dans la page : vérifier, puis dessiner
function dansLaPage(args) {
  const { demandes, etiquettes, decors } = args;
  const tous = Object.keys(window.DESSINS_PLANCHE);
  const ids = demandes.length ? demandes : tous;
  const rapport = [];
  const grille = document.getElementById('grille');
  function el(nom, classe, parent, texte) {
    const e = document.createElement(nom);
    if (classe) e.className = classe;
    if (texte) e.textContent = texte;
    if (parent) parent.appendChild(e);
    return e;
  }
  for (const id of ids) {
    const source = window.DESSINS_PLANCHE[id];
    const r = { id, octets: 0, erreurs: [] };
    rapport.push(r);
    if (typeof source !== 'string') { r.erreurs.push('aucun dessin de ce nom'); continue; }
    r.octets = new TextEncoder().encode(source).length;
    const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
    if (!svg || svg.nodeName !== 'svg' || svg.getElementsByTagName('parsererror').length) r.erreurs.push('XML invalide');
    else {
      if (svg.getAttribute('xmlns') !== 'http://www.w3.org/2000/svg') r.erreurs.push('xmlns manquant');
      if (!svg.getAttribute('viewBox')) r.erreurs.push('viewBox manquant');
      const interdits = ['text', 'tspan', 'textPath', 'font', 'font-face', 'image', 'script', 'foreignObject', 'use', 'a', 'style'];
      const noms = new Set([...svg.getElementsByTagName('*')].map((n) => n.localName));
      for (const n of interdits) if (noms.has(n)) r.erreurs.push('élément interdit : <' + n + '>');
      if (/href\s*=|@import|url\(\s*['"]?(?!#)/.test(source)) r.erreurs.push('lien externe');
      const idsInternes = [...svg.querySelectorAll('[id]')].map((n) => n.id);
      for (const i of idsInternes) if (!/^f-[a-z]+$/.test(i)) r.erreurs.push('identifiant hors du format f-… : ' + i);
      if (new Set(idsInternes).size !== idsInternes.length) r.erreurs.push('identifiant en double');
      for (const m of source.matchAll(/url\(#([^)]+)\)/g)) if (!idsInternes.includes(m[1])) r.erreurs.push('lien sans cible : #' + m[1]);
    }
    const e = etiquettes[id];
    const cellule = el('div', 'cellule', grille);
    const titre = el('div', 'titre', cellule);
    const t = el('div', '', titre);
    el('b', '', t, e.nom);
    if (e.etat) el('i', '', t, '  · état « ' + e.etat + ' »');
    el('span', r.octets > 4096 ? 'lourd' : '', titre, id + ' · ' + (r.octets / 1024).toFixed(1) + ' Ko' +
      (r.erreurs.length ? ' · ' + r.erreurs.length + ' erreur(s)' : ''));
    const d1 = window.dessinPlanche(id);
    const fiche = el('div', e.porteur === 'julie' ? 'fiche julie' : 'fiche', cellule);
    if (d1) fiche.appendChild(d1);
    const bas = el('div', 'bas', cellule);
    const bandeau = el('div', 'bandeau', bas);
    const icone = el('span', 'icone', bandeau);
    const d2 = window.dessinPlanche(id);
    if (d2) icone.appendChild(d2);
    const txt = el('span', '', bandeau);
    el('small', '', txt, 'Nouvel objet');
    txt.appendChild(document.createTextNode(e.nom));
    const decor = el('div', 'decor', bas);
    decor.style.backgroundImage = 'url("' + decors[e.porteur === 'julie' ? 'julie' : 'darshan'] + '")';
    const d3 = window.dessinPlanche(id);
    if (d3) el('span', '', decor).appendChild(d3);
    if (!d1 || !d2 || !d3) r.erreurs.push('dessin() a rendu null');
  }
  if (window.dessinPlanche('inconnu') !== null) rapport.push({ id: '(nom inconnu)', octets: 0, erreurs: ['dessin() ne rend pas null'] });
  if (window.dessinPlanche('constructor') !== null) rapport.push({ id: '(constructor)', octets: 0, erreurs: ['dessin() ne rend pas null'] });
  // chaque copie a ses propres identifiants : aucun doublon dans toute la page
  const tousIds = [...document.querySelectorAll('svg [id]')].map((n) => n.id);
  if (new Set(tousIds).size !== tousIds.length) rapport.push({ id: '(page)', octets: 0, erreurs: ['identifiants en double entre copies'] });
  const total = rapport.reduce((s, r) => s + r.octets, 0);
  document.getElementById('resume').textContent = ids.length + ' dessins · ' + (total / 1024).toFixed(1) + ' Ko en tout';
  return rapport;
}

(async () => {
  const etiquettes = {};
  const ids = demandes.length ? demandes : null;
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 2000, height: 1200 }, deviceScaleFactor: 1 });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  await page.setContent(PAGE, { waitUntil: 'load' });
  const noms = await page.evaluate(() => (window.DESSINS_PLANCHE ? Object.keys(window.DESSINS_PLANCHE) : []));
  if (!noms.length) { console.error('dessins.js ne définit aucun dessin.', erreurs.join('\n')); await nav.close(); process.exit(1); }
  for (const id of (ids || noms)) etiquettes[id] = etiquette(id);
  const rapport = await page.evaluate(dansLaPage, { demandes: ids || [], etiquettes, decors: DECORS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  const largeur = await page.evaluate(() => document.getElementById('grille').scrollWidth);
  await page.setViewportSize({ width: Math.max(700, largeur), height: 1200 });
  await page.screenshot({ path: SORTIE, fullPage: true });
  await nav.close();
  // le rapport, dessin par dessin
  let fautes = 0;
  for (const r of rapport) {
    const poids = r.octets ? (r.octets / 1024).toFixed(1).padStart(5) + ' Ko' + (r.octets > 4096 ? ' (plus de 4 Ko)' : '') : '';
    console.log(r.id.padEnd(16) + poids + (r.erreurs.length ? '  ✗ ' + r.erreurs.join(' ; ') : '  ✓'));
    fautes += r.erreurs.length;
  }
  for (const e of erreurs) { console.log('erreur dans la page : ' + e); fautes++; }
  console.log((fautes ? fautes + ' problème(s)' : 'aucun problème') + ' — planche : ' + path.relative(ICI, SORTIE));
  process.exitCode = fautes ? 1 : 0;
})();
