// Joue la tranche verticale de bout en bout dans Chromium et photographie chaque étape.
// Usage : node essai.js [telephone|ordinateur]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const mode = process.argv[2] || 'telephone';
const vues = {
  telephone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true },
  ordinateur: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 },
};
const dossier = path.resolve('captures', mode);
fs.rmSync(dossier, { recursive: true, force: true });
fs.mkdirSync(dossier, { recursive: true });

(async () => {
  const nav = await chromium.launch();
  const ctx = await nav.newContext(vues[mode]);
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.type() + ': ' + m.text()); });
  await page.goto('file://' + path.resolve('dist/web/index.html'));
  let n = 0;
  const photo = async (nom) => { n++; await page.screenshot({ path: path.join(dossier, String(n).padStart(2, '0') + '-' + nom + '.png') }); };
  const pause = (ms) => page.waitForTimeout(ms);
  const suite = async (ms = 1500) => { await page.keyboard.press('ArrowRight'); await pause(ms); };
  const active = () => page.evaluate(() => { const s = document.querySelector('.scene.active'); return s && s.dataset.scene; });
  const etape = async (attendu) => { const a = await active(); console.log('scène :', a, a === attendu ? 'ok' : '— attendu ' + attendu); };

  await pause(1200); await photo('seuil');
  await page.click('.bouton-porte'); await pause(2400);
  await etape('poeme');
  for (let i = 0; i < 3; i++) await suite(1300);
  await photo('poeme-3-vers');
  for (let i = 0; i < 3; i++) await suite(1300);
  await pause(1500); await photo('poeme-aube');
  await suite(2400);
  await etape('toit');
  await pause(1200); await photo('toit-carton');
  await pause(2200); await photo('toit-p18');
  await suite(3000); await photo('toit-filantes');
  await suite(1500); await suite(2000); await photo('toit-voix-du-pere');
  await suite(1500); await suite(1500); await suite(2400);
  await etape('tuiles');
  await pause(1200); await photo('tuiles-debut');
  await suite(1500); await photo('tuiles-consigne');
  const bt = await page.locator('#s-tuiles').boundingBox();
  for (let i = 0; i < 5; i++) { await page.mouse.click(bt.x + bt.width / 2, bt.y + bt.height * 0.3); await pause(i === 2 ? 60 : 650); if (i === 2) { await photo('tuiles-bond'); await pause(600); } }
  await pause(1500); await photo('tuiles-arrivee');
  await suite(2400);
  await etape('pigeonnier');
  await pause(1500); await photo('pigeonnier-debut');
  await suite(1500); await suite(1800); await photo('pigeonnier-lunettes');
  await page.keyboard.press('Enter'); await pause(1400); await photo('pigeonnier-vibrent');
  await suite(1200); await page.keyboard.press('Enter'); await pause(700); await photo('pigeonnier-fonte');
  await pause(1600); await photo('pigeonnier-cle');
  await suite(1500); await suite(1500);
  const box = await page.locator('#s-pigeonnier').boundingBox();
  const k = box.width / 1200;
  await suite(900); await photo('pigeonnier-vers-serrure');
  await page.mouse.move(box.x + 600 * k, box.y + 1420 * k);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + (600 + 220 * i / 12) * k, box.y + (1420 - 410 * i / 12) * k);
  await page.mouse.up();
  await pause(2400); await photo('pigeonnier-jour');
  await suite(900); await page.keyboard.press('Enter'); await pause(2400); await photo('pigeonnier-tour');
  await suite(1500); await suite(1200); await page.keyboard.press('Enter'); await pause(1200); await photo('pigeonnier-pousser');
  await pause(3200);
  await etape('aluva');
  await pause(800); await photo('aluva-eblouissement');
  await pause(2500); await photo('aluva-p23');
  await suite(2500); await suite(2500); await photo('aluva-fin');
  await page.click('.ouvrir-carnet'); await pause(600); await photo('carnet');
  console.log('erreurs :', erreurs.length ? erreurs : 'aucune');
  await nav.close();
})();
