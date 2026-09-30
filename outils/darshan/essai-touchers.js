// Essai des touchers de l'EPUB jouable, comme sur un téléphone : quels touchers le livre garde
// (Apple Books ne montre alors ni son menu ni ne tourne la page), et ce qu'ils font.
//   NODE_PATH=/opt/node22/lib/node_modules node essai-touchers.js
// après `python3 build.py`. Sortie : une ligne par essai, et le code 1 si l'un d'eux échoue.
const { chromium } = require('playwright');
const path = require('path');

const PAGES = path.join(__dirname, 'dist', 'epub', 'EPUB', 'xhtml');
let echecs = 0;
function verifier(nom, ok, detail) {
  console.log((ok ? 'ok     ' : 'ÉCHEC  ') + nom + (detail ? ' (' + detail + ')' : ''));
  if (!ok) echecs++;
}

(async () => {
  const navigateur = await chromium.launch();
  const contexte = await navigateur.newContext({
    viewport: { width: 1200, height: 1800 }, deviceScaleFactor: 0.5, hasTouch: true, isMobile: true
  });
  // chaque toucher, noté après le livre : l'a-t-il gardé (annulé) ?
  await contexte.addInitScript(() => {
    window.__touchers = [];
    window.addEventListener('touchstart', (ev) => { window.__touchers.push(ev.defaultPrevented); });
  });
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));

  async function ouvrir(n) {
    await page.goto('file://' + path.join(PAGES, n + '.xhtml'));
    await page.waitForTimeout(2500);
  }
  async function toucher(x, y) {
    await page.evaluate(() => { window.__touchers = []; });
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(700);
    return page.evaluate(() => window.__touchers[0]);
  }
  const vus = () => page.evaluate(() => document.querySelectorAll('.texte .temps.vu').length);
  const fini = () => page.evaluate(() => { const s = document.querySelector('.scene'); return !!(s.recit && s.recit.fini); });

  // 1.5 : une page de texte seul
  await ouvrir('p007');
  let avant = await vus();
  let garde = await toucher(600, 900);
  verifier('1.5 : un toucher sur le décor fait avancer le texte, sans le menu de la liseuse', garde === true && await vus() > avant,
    'gardé : ' + garde + ', temps vus ' + avant + ' → ' + await vus());
  avant = await vus();
  garde = await toucher(40, 900);
  verifier('1.5 : un toucher au bord reste à la liseuse (tourner la page)', garde === false && await vus() === avant, 'gardé : ' + garde);
  const etoile = await page.evaluate(() => { const r = document.querySelector('.suite').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  avant = await vus();
  garde = await toucher(etoile[0], etoile[1]);
  verifier('1.5 : l’étoile ✦, près du bord, reste au livre et fait avancer', garde === true && await vus() > avant, 'gardé : ' + garde);
  for (let i = 0; i < 30 && !(await fini()); i++) await toucher(600, 700);
  verifier('1.5 : la page se lit jusqu’au bout au toucher', await fini());
  garde = await toucher(600, 900);
  verifier('1.5 : la page lue, le milieu revient à la liseuse (son menu)', garde === false, 'gardé : ' + garde);
  garde = await toucher(1120, 110);
  const menu = await page.evaluate(() => !!document.querySelector('.fiche.ouverte, .fiche:not([hidden]) .fiche-carte'));
  verifier('1.5 : le bouton « Menu » reste au livre et ouvre le menu', garde === true && menu, 'gardé : ' + garde + ', menu : ' + menu);

  // 1.4 : un geste attendu (la mousse) ; les touchers restent au livre
  await ouvrir('p006');
  for (let i = 0; i < 12 && !(await page.evaluate(() => document.querySelector('.scene').classList.contains('geste-attendu'))); i++) await toucher(600, 400);
  const attendu = await page.evaluate(() => document.querySelector('.scene').classList.contains('geste-attendu'));
  garde = await toucher(600, 1000);
  verifier('1.4 : pendant le geste, le toucher reste au livre', attendu && garde === true, 'geste attendu : ' + attendu + ', gardé : ' + garde);
  // le geste lui-même, au doigt : la mousse tracée d'un bout à l'autre de la moustache
  const cdp = await contexte.newCDPSession(page);
  const chemin = [[490, 1590], [545, 1550], [600, 1565], [655, 1550], [710, 1590]];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: chemin[0][0], y: chemin[0][1] }] });
  for (let k = 1; k < chemin.length; k++) {
    for (let u = 1; u <= 6; u++) {
      const x = chemin[k - 1][0] + (chemin[k][0] - chemin[k - 1][0]) * u / 6, y = chemin[k - 1][1] + (chemin[k][1] - chemin[k - 1][1]) * u / 6;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      await page.waitForTimeout(25);
    }
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(2500);
  const encore = await page.evaluate(() => document.querySelector('.scene').classList.contains('geste-attendu'));
  verifier('1.4 : le geste se fait au doigt (la mousse tracée)', attendu && !encore, 'geste encore attendu : ' + encore);

  // 0.1 : « Ouvrir » ouvre le livre
  await ouvrir('p001');
  const bouton = await page.evaluate(() => { const b = document.querySelector('.bouton-porte'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  if (bouton) await page.touchscreen.tap(bouton[0], bouton[1]);
  await page.waitForTimeout(3000);
  verifier('0.1 : « Ouvrir » mène à la page suivante', /p002\.xhtml$/.test(page.url()), page.url().split('/').pop());

  verifier('aucune erreur de script', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await navigateur.close();
  process.exit(echecs ? 1 : 0);
})();
