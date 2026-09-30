// Photographie chaque transition du banc d'essai à plusieurs instants (captures/transitions/).
// Usage : node essai-transitions.js [telephone|ordinateur]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const mode = process.argv[2] || 'telephone';
const vues = {
  telephone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true },
  ordinateur: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 },
  // mouvement réduit demandé par le système : fondus courts, rien ne glisse ni ne tourne
  calme: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, reducedMotion: 'reduce' },
};
const dossier = path.resolve('captures', 'transitions-' + mode);
fs.rmSync(dossier, { recursive: true, force: true });
fs.mkdirSync(dossier, { recursive: true });
// instants photographiés (ms après le toucher) pour chaque bouton du banc
const instants = {
  fondu: [300, 900], encre: [350, 700, 1200], bandes: [300, 900, 1500, 2600], iris: [400, 900, 1400],
  porte: [350, 800, 1400, 1800], lumiere: [600, 1300, 2000], obturateur: [250, 480, 800], glissement: [200, 420, 700],
  frisson: [150, 350], eclat: [500, 900, 1500, 2500], envol: [700, 1500, 1800, 2300], fiche: [120, 300, 900],
};

(async () => {
  const nav = await chromium.launch();
  const ctx = await nav.newContext(vues[mode]);
  const page = await ctx.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
  await page.goto('file://' + path.resolve('dist/web/transitions.html'));
  await page.waitForTimeout(800);
  const scene = page.locator('#s-banc');
  await scene.screenshot({ path: path.join(dossier, '00-banc.png') });
  for (const [type, moments] of Object.entries(instants)) {
    const t0 = Date.now();
    await page.click(`.banc-boutons button[data-type="${type}"]`);
    for (const ms of moments) {
      const reste = ms - (Date.now() - t0);
      if (reste > 0) await page.waitForTimeout(reste);
      await scene.screenshot({ path: path.join(dossier, `${type}-${String(ms).padStart(4, '0')}.png`) });
    }
    // laisser finir, fermer une fiche restée ouverte
    await page.waitForTimeout(type === 'bandes' || type === 'eclat' ? 2600 : 1600);
    if (await page.locator('#s-banc .fiche.ouverte').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
    const reste = await page.evaluate(() => document.querySelectorAll('.tr, .eclat, .envol').length);
    console.log(type.padEnd(11), reste ? 'calques restants : ' + reste : 'ok');
  }
  console.log('erreurs :', erreurs.length ? erreurs : 'aucune');
  await nav.close();
})();
