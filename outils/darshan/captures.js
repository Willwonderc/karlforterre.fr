// Captures ciblées : ordinateur, pages XHTML de l'EPUB (script actif), et mode sans script.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const nav = await chromium.launch();
  fs.mkdirSync('captures/divers', { recursive: true });
  const erreurs = [];
  // 1. ordinateur : titre, toit, pigeonnier (bandes latérales floutées)
  let ctx = await nav.newContext({ viewport: { width: 1280, height: 860 } });
  let page = await ctx.newPage();
  page.on('pageerror', (e) => erreurs.push('web: ' + e.message));
  await page.goto('file://' + path.resolve('dist/web/index.html'));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'captures/divers/ordinateur-seuil.png' });
  await page.click('.bouton-porte'); await page.waitForTimeout(2000);
  for (let i = 0; i < 7; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1200); }
  await page.waitForTimeout(4200);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(2600);
  await page.screenshot({ path: 'captures/divers/ordinateur-toit.png' });
  await ctx.close();
  // 2. pages de l'EPUB ouvertes telles quelles (XHTML, 1200 x 1800 réduit de moitié)
  ctx = await nav.newContext({ viewport: { width: 1200, height: 1800 }, deviceScaleFactor: 0.5 });
  page = await ctx.newPage();
  page.on('pageerror', (e) => erreurs.push('epub: ' + e.message));
  for (const f of fs.readdirSync('dist/epub/EPUB/xhtml')) {
    await page.goto('file://' + path.resolve('dist/epub/EPUB/xhtml', f));
    await page.waitForTimeout(1800);
    if (f.includes('pigeonnier')) { for (let i = 0; i < 2; i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1500); } }
    await page.screenshot({ path: 'captures/divers/epub-' + f.replace('.xhtml', '.png') });
  }
  await ctx.close();
  // 3. sans script : ce que voit une liseuse qui n'exécute pas le JavaScript
  ctx = await nav.newContext({ viewport: { width: 1200, height: 1800 }, deviceScaleFactor: 0.5, javaScriptEnabled: false });
  page = await ctx.newPage();
  for (const f of ['03-toit.xhtml', '05-pigeonnier.xhtml', '06-aluva.xhtml']) {
    await page.goto('file://' + path.resolve('dist/epub/EPUB/xhtml', f));
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'captures/divers/sans-script-' + f.replace('.xhtml', '.png') });
  }
  console.log('erreurs :', erreurs.length ? erreurs : 'aucune');
  await nav.close();
})();
