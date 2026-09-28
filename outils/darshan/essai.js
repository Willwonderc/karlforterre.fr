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
  // Avant chaque touche, attendre que le texte soit prêt (l'étoile ✦ allumée) : les effets
  // (fonte, lumière, fiche) retiennent la suite tant qu'ils ne sont pas finis.
  const pret = () => page.waitForSelector('.scene.active .suite.pret', { timeout: 12000 }).catch(() => null);
  const suite = async (ms = 1500) => { await pret(); await page.keyboard.press('ArrowRight'); await pause(ms); };
  const halo = () => page.waitForSelector('#s-pigeonnier .halo-interet.actif', { timeout: 12000 });
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
  await pause(900); await photo('tuiles-nouvel-objet');
  await suite(2400);
  await etape('pigeonnier');
  await pause(1500); await photo('pigeonnier-debut');
  await suite(1500); await suite(1800); await photo('pigeonnier-lunettes');
  // l'interface d'objet : panneau « Objets », fiche des lunettes, action « Ôter les lunettes »
  await page.click('#s-pigeonnier .barre .objets'); await pause(800); await photo('objets-panneau');
  await page.click('#s-pigeonnier .fiche-liste button'); await pause(800); await photo('fiche-lunettes');
  await page.click('#s-pigeonnier .fiche-actions button'); await pause(1400); await photo('pigeonnier-vibrent');
  await suite(300); await halo(); await page.keyboard.press('Enter'); await pause(700); await photo('pigeonnier-fonte');
  await page.waitForSelector('#s-pigeonnier .fiche.ouverte'); await pause(700); await photo('fiche-cle');
  await page.keyboard.press('Escape'); await pause(900); await photo('pigeonnier-cle');
  await suite(1200); await suite(1200);
  const box = await page.locator('#s-pigeonnier').boundingBox();
  const k = box.width / 1200;
  await suite(300); await halo(); await pause(600); await photo('pigeonnier-vers-serrure');
  await page.mouse.move(box.x + 600 * k, box.y + 1420 * k);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + (600 + 220 * i / 12) * k, box.y + (1420 - 410 * i / 12) * k);
  await page.mouse.up();
  await pret(); await photo('pigeonnier-jour');
  await suite(300); await halo(); await page.keyboard.press('Enter'); await pause(900); await photo('pigeonnier-tour');
  await suite(1200); await suite(600); await pause(2200); await photo('pigeonnier-pousser');
  await page.keyboard.press('Enter'); await pause(3600);
  await etape('aluva');
  await pause(800); await photo('aluva-eblouissement');
  await pause(2500); await photo('aluva-p23');
  await suite(2500); await suite(2500); await photo('aluva-fin');
  await page.click('.ouvrir-carnet'); await pause(600); await photo('carnet');
  console.log('erreurs :', erreurs.length ? erreurs : 'aucune');
  await nav.close();
})();
