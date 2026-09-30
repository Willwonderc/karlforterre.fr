// ---------------------------------------------------------------- visuels : couleurs, toiles, plans, caméra
/* Ce qui se voit sans être du texte : les couleurs communes, les toiles animées (étoiles,
   poussière), les plans du décor (une page peut en avoir plusieurs, l'effet « decor » passe de
   l'un à l'autre) et la caméra (le décor avance, monte ou se tourne vers un point).
   Mouvement réduit : les toiles ne s'animent pas (une image fixe), la caméra saute au cadre
   final, les plans se fondent vite. */

var ENCRE = '#07091a', SINDOOR = '#c9302c', OR = '#f4c56a', CREME = '#fff4de';

// Étoile à quatre branches, comme ✦ (rayon r, centrée sur l'origine) : chemin SVG.
function etoile(r) {
  var k = r * 0.28;
  return 'M0,' + (-r) + 'L' + k + ',' + (-k) + 'L' + r + ',0L' + k + ',' + k + 'L0,' + r + 'L' + (-k) + ',' + k + 'L' + (-r) + ',0L' + (-k) + ',' + (-k) + 'Z';
}

var Visuels = (function () {
  // Les toiles animées d'une scène : arrêtées quand on la quitte. Pas plus de trois à la fois
  // (Apple Books sur iPhone) : la plus ancienne s'arrête si une quatrième démarre.
  var vivantes = [];
  function enregistrer(scene, anim, toileEl) {
    anim.scene = scene;
    anim.toile = toileEl;
    vivantes.push(anim);
    while (vivantes.length > 3) { var vieille = vivantes.shift(); vieille.arreter(); retirer(vieille.toile); }
    return anim;
  }
  // Quitter une scène : ses animations s'arrêtent et leurs toiles disparaissent (leur mémoire
  // avec) ; la scène les refait si on y revient.
  function quitter(scene) {
    vivantes = vivantes.filter(function (a) {
      if (a.scene !== scene) return true;
      a.arreter(); retirer(a.toile);
      return false;
    });
    scene.etoiles = null; scene.poussiere = null;
  }
  function toile(scene, parent) {
    return el('canvas', { 'class': 'toile', 'aria-hidden': 'true' }, parent || $('.decor', scene) || scene);
  }

  // ---- étoiles scintillantes et étoiles filantes
  function Etoiles(scene, densite, parent) {
    var t = toile(scene, parent), c = t.getContext('2d'), etoiles = [], filantes = [], eclat = 0.55, vivant = true;
    t.width = W; t.height = H;
    for (var i = 0; i < densite; i++) {
      etoiles.push({ x: Math.random() * W, y: Math.random() * H * 0.72, r: Math.random() * 1.8 + 0.6,
        p: Math.random() * 6.28, v: 0.6 + Math.random() * 2.2 });
    }
    function filer(x, y, angle, vitesse, retard) {
      if (calme) return;
      setTimeout(function () { filantes.push({ x: x, y: y, a: angle, v: vitesse, vie: 1 }); }, retard || 0);
    }
    function image(temps) {
      if (!vivant) return;
      c.clearRect(0, 0, W, H);
      for (var i = 0; i < etoiles.length; i++) {
        var e = etoiles[i], a = eclat * (0.35 + 0.65 * Math.abs(Math.sin(e.p + temps / 1000 * e.v)));
        c.globalAlpha = a; c.fillStyle = '#fff6e0';
        c.beginPath(); c.arc(e.x, e.y, e.r, 0, 6.2832); c.fill();
        if (e.r > 2.1) { c.globalAlpha = a * 0.35; c.fillRect(e.x - e.r * 4, e.y - 0.6, e.r * 8, 1.2); c.fillRect(e.x - 0.6, e.y - e.r * 4, 1.2, e.r * 8); }
      }
      for (var j = filantes.length - 1; j >= 0; j--) {
        var f = filantes[j];
        f.x += Math.cos(f.a) * f.v; f.y += Math.sin(f.a) * f.v; f.vie -= 0.012;
        if (f.vie <= 0) { filantes.splice(j, 1); continue; }
        var g = c.createLinearGradient(f.x, f.y, f.x - Math.cos(f.a) * 260, f.y - Math.sin(f.a) * 260);
        g.addColorStop(0, 'rgba(255,248,225,' + (0.95 * f.vie) + ')'); g.addColorStop(1, 'rgba(255,248,225,0)');
        c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 3.2;
        c.beginPath(); c.moveTo(f.x, f.y); c.lineTo(f.x - Math.cos(f.a) * 260, f.y - Math.sin(f.a) * 260); c.stroke();
      }
      requestAnimationFrame(image);
    }
    if (!calme) requestAnimationFrame(image); else image(0);
    return enregistrer(scene, {
      filer: filer,
      eclat: function (v) { eclat = v; if (calme) image(0); },
      hasard: function () {
        (function boucle() {
          if (!vivant || calme) return;
          filer(Math.random() * W * 0.8 + 100, Math.random() * 300 + 60, 0.35 + Math.random() * 0.5, 16 + Math.random() * 8);
          setTimeout(boucle, 7000 + Math.random() * 9000);
        })();
      },
      arreter: function () { vivant = false; }
    }, t);
  }

  // ---- poussière dans la lumière (x, y : d'où elle monte ; etendue : sa largeur)
  function Poussiere(scene, o) {
    o = o || {};
    var x0 = o.x || 600, y0 = o.y || 1300, etendue = o.etendue || 900;
    var t = toile(scene), c = t.getContext('2d'), grains = [], vivant = true;
    t.width = W; t.height = H;
    function ajouter(n, x, y, eparpille) {
      for (var i = 0; i < n; i++) {
        grains.push({ x: x + (Math.random() - 0.5) * eparpille, y: y + (Math.random() - 0.5) * eparpille * 0.5,
          vx: (Math.random() - 0.5) * 0.9, vy: -Math.random() * 0.6 - 0.1, r: Math.random() * 2.6 + 0.8, a: Math.random() * 0.7 + 0.3, p: Math.random() * 6 });
      }
    }
    ajouter(90, x0, y0, etendue);
    function image(temps) {
      if (!vivant) return;
      c.clearRect(0, 0, W, H);
      for (var i = grains.length - 1; i >= 0; i--) {
        var g = grains[i];
        g.x += g.vx + Math.sin(temps / 1400 + g.p) * 0.25; g.y += g.vy;
        if (g.y < 250 || g.x < 0 || g.x > W) { grains.splice(i, 1); if (grains.length < 120) ajouter(1, x0, y0 + 200, etendue); continue; }
        c.globalAlpha = g.a * (0.5 + 0.5 * Math.sin(temps / 700 + g.p));
        c.fillStyle = '#fff1c9'; c.beginPath(); c.arc(g.x, g.y, g.r, 0, 6.2832); c.fill();
      }
      requestAnimationFrame(image);
    }
    if (!calme) requestAnimationFrame(image);
    return enregistrer(scene, {
      bouffee: function (x, y) { if (!calme) ajouter(140, x || x0, y || y0 + 260, 700); },
      arreter: function () { vivant = false; }
    }, t);
  }

  // ---- les plans du décor : un seul visible (classe « vu »), les autres attendent dessous
  function plans(scene) { return $$('.decor .plan', scene); }
  function plan(scene, i, o) {
    o = o || {};
    var liste = plans(scene);
    if (!liste[i]) return Promise.resolve();
    var avant = liste.filter(function (p) { return p.classList.contains('vu'); })[0];
    var fondu = calme ? 200 : (o.fondu || 1200);
    liste.forEach(function (p) { p.style.transitionDuration = fondu + 'ms'; });
    liste[i].classList.add('vu');
    if (avant && avant !== liste[i]) avant.classList.remove('vu');
    if (o.duree && avant && avant !== liste[i]) {
      // le plan revient au précédent après `duree` (un instant : le graffiti de 6.11)
      return attendreVraiment(o.duree).then(function () {
        avant.classList.add('vu'); liste[i].classList.remove('vu');
        return attendreVraiment(fondu);
      });
    }
    return attendreVraiment(fondu);
  }
  function planVisible(scene) {
    var liste = plans(scene);
    for (var i = 0; i < liste.length; i++) if (liste[i].classList.contains('vu')) return i;
    return 0;
  }

  // ---- la caméra : le décor avance (zoom), monte (translation verticale), vise un point
  // o : { avance: 1.15, monte: 120, vers: [x, y], duree: 2400, retour: true }
  function camera(scene, o) {
    var d = $('.decor', scene);
    if (!d) return Promise.resolve();
    o = o || {};
    var s = o.avance || 1, dy = -(o.monte || 0), vers = o.vers || [W / 2, H / 2];
    var duree = calme ? 0 : (o.duree || 2400);
    d.style.transformOrigin = pourcent(vers[0], W) + ' ' + pourcent(vers[1], H);
    d.style.transition = duree ? 'transform ' + duree + 'ms cubic-bezier(.4,.1,.3,1)' : 'none';
    d.style.transform = 'translate(0,' + pourcent(dy, H) + ') scale(' + s + ')';
    return attendreVraiment(duree + 30).then(function () {
      if (o.retour) { d.style.transform = ''; return attendreVraiment(duree); }
    });
  }

  return { Etoiles: Etoiles, Poussiere: Poussiere, quitter: quitter, plan: plan, planVisible: planVisible, camera: camera };
})();
