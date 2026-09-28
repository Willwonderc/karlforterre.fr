// Photographie les décors SVG (1200 x 1800) avec Chromium : JPEG, ou PNG transparent (suffixe :png).
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const nav = await chromium.launch();
  const page = await nav.newPage({ viewport: { width: 1200, height: 1800 } });
  for (const arg of process.argv.slice(2)) {
    const [nom, format] = arg.split(':');
    await page.goto('file://' + path.resolve('src/img', nom + '.svg'));
    await page.waitForTimeout(400);
    if (format === 'png') {
      await page.screenshot({ path: path.resolve('src/img', nom + '.png'), type: 'png', omitBackground: true });
    } else {
      await page.screenshot({ path: path.resolve('src/img', nom + '.jpg'), type: 'jpeg', quality: 88 });
    }
    console.log(nom, 'photographié');
  }
  await nav.close();
})();
