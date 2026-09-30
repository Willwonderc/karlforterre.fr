// Photographie les décors SVG (1200 x 1800) avec Chromium : JPEG, ou PNG transparent (suffixe :png).
// Options, pour decors.py (sans elles, rien ne change) :
//   --dossier=<chemin>  où lire nom.svg (ou nom.html, s'il existe) et écrire l'image (src/img par défaut) ;
//   --echelle=<n>       pixels par unité de la scène : 4/3 donne 1600 x 2400 (1 par défaut).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const options = { dossier: 'src/img', echelle: 1 };
  const noms = [];
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--(dossier|echelle)=(.+)$/);
    if (!m) { noms.push(arg); continue; }
    if (m[1] === 'echelle') {
      const [a, b] = m[2].split('/');
      options.echelle = Number(a) / Number(b || 1);
    } else {
      options.dossier = m[2];
    }
  }
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1200, height: 1800 }, deviceScaleFactor: options.echelle });
  for (const arg of noms) {
    const [nom, format] = arg.split(':');
    const html = path.resolve(options.dossier, nom + '.html');
    await page.goto('file://' + (fs.existsSync(html) ? html : path.resolve(options.dossier, nom + '.svg')));
    await page.evaluate(() => document.fonts ? document.fonts.ready.then(() => true) : true);
    await page.waitForTimeout(400);
    if (format === 'png') {
      await page.screenshot({ path: path.resolve(options.dossier, nom + '.png'), type: 'png', omitBackground: true });
    } else {
      await page.screenshot({ path: path.resolve(options.dossier, nom + '.jpg'), type: 'jpeg', quality: 88 });
    }
    console.log(nom, 'photographié');
  }
  await nav.close();
})();
