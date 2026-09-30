/* Essai du livre entier, édition web : le joue de bout en bout dans Chromium, au clavier
   (Entrée fait avancer le texte et fait chaque geste), et relève pour chaque page les erreurs
   du moteur, le temps passé et une photo de sa fin.

   Depuis outils/darshan/, après python3 build.py :
     NODE_PATH=/opt/node22/lib/node_modules node essai-livre.js            (mouvement réduit, rapide)
     NODE_PATH=/opt/node22/lib/node_modules node essai-livre.js normal     (animations complètes)
     NODE_PATH=/opt/node22/lib/node_modules node essai-livre.js calme 3.9  (à partir d'une page)

   Photos dans captures/livre/ (non suivi par Git), rapport dans captures/livre/rapport.txt. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const mode = process.argv[2] || 'calme';
const depuis = process.argv[3] || null;
const sortie = path.join(__dirname, 'captures', 'livre');
fs.mkdirSync(sortie, { recursive: true });

(async () => {
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 600, height: 900 } });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push({ page: courante, message: String(e && e.message || e) }));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push({ page: courante, message: m.text() }); });
  let courante = '?';
  const adresse = 'file://' + path.join(__dirname, 'dist', 'web', 'index.html') + (depuis ? '#s-' + depuis.replace('.', '-') : '');
  await page.addInitScript((m) => {
    try { localStorage.setItem('darshan.reglages', JSON.stringify({ son: false, mouvement: m === 'calme' ? 'reduit' : 'normal' })); } catch (e) { /* rien */ }
  }, mode);
  await page.goto(adresse);
  await page.waitForTimeout(800);
  const scene = () => page.evaluate(() => { const s = document.querySelector('.scene.active'); return s ? s.getAttribute('data-scene') : null; });
  if (!depuis) { await page.click('.bouton-porte'); }
  const rapport = [];
  let n = await scene(), debut = Date.now(), appuis = 0;
  courante = n;
  const limite = Date.now() + 40 * 60 * 1000;
  const photographiees = {};
  const etatPage = () => page.evaluate(() => {
    const s = document.querySelector('.scene.active');
    if (!s) return null;
    return { vus: s.querySelectorAll('.texte .temps.vu').length, tous: s.querySelectorAll('.texte .temps').length,
      occupe: !!document.querySelector('.tr:not(.tr-leger), .eclat, .fiche.ouverte') };
  });
  while (Date.now() < limite) {
    // la page, une fois tout son texte affiché (avant l'appui qui la quitte)
    const e = await etatPage();
    if (e && !photographiees[n] && e.vus === e.tous && !e.occupe) {
      await page.waitForTimeout(mode === 'calme' ? 300 : 1200);
      await page.screenshot({ path: path.join(sortie, `${n}.png`) }).catch(() => {});
      photographiees[n] = true;
    }
    await page.keyboard.press('Enter');
    appuis++;
    await page.waitForTimeout(mode === 'calme' ? 260 : 700);
    const m = await scene();
    if (m !== n) {
      rapport.push(`${n}\t${((Date.now() - debut) / 1000).toFixed(1)} s\t${appuis} appuis`);
      n = m; courante = m; debut = Date.now(); appuis = 0;
      continue;
    }
    // la dernière page : plus rien ne bouge après une longue série d'appuis
    if (appuis > 120) {
      await page.screenshot({ path: path.join(sortie, `${n}-bloquee.png`) });
      const etat = await page.evaluate(() => {
        const s = document.querySelector('.scene.active');
        const vus = s.querySelectorAll('.texte .temps.vu').length, tous = s.querySelectorAll('.texte .temps').length;
        const c = s.querySelector('.consigne.vu');
        return `${vus}/${tous} temps vus ; consigne : ${c ? c.textContent : '—'} ; fiche : ${!!s.querySelector('.fiche.ouverte')}`;
      });
      rapport.push(`${n}\tARRÊT après ${appuis} appuis : ${etat}`);
      break;
    }
  }
  const texte = rapport.join('\n') + '\n\nErreurs (' + erreurs.length + ') :\n' +
    erreurs.map((e) => `${e.page}\t${e.message}`).join('\n') + '\n';
  fs.writeFileSync(path.join(sortie, 'rapport.txt'), texte);
  console.log(texte);
  await navigateur.close();
})();
