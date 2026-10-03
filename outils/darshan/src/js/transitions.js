// ---------------------------------------------------------------- transitions : balayages, éclats, envols
/* Grammaire (docs/darshan-mise-en-scene/README.md, section 4) : fondu (même lieu, même
   moment) ; encre (Darshan change de lieu) ; bandes (ouverture de chapitre, façon Persona) ;
   iris (vision, petite porte) ; porte (on franchit une porte) ; lumiere (éblouissement) ;
   obturateur (le monde photographié de Julie) ; glissement (son téléphone). Chaque balayage a
   deux moitiés : couvrir la scène qui part, découvrir celle qui arrive. L'édition web joue les
   deux ; dans l'EPUB, où chaque page est un document à part, la page joue la seconde en
   s'ouvrant. Les changements d'état d'un objet ont les leurs : frisson (petit changement),
   éclat (métamorphose), envol (l'objet rejoint le sac). Mouvement réduit : des fondus courts,
   rien ne glisse ni ne tourne. Repris du prototype du 28 septembre.
   Ajouts de la pré-production (synthèse, partie 2.2, ligne 23 : « Quatre variantes, un nom » ; partie 8.3,
   `TRANSITIONS`) : bandes-photo (2.1, 6.1 : les bandes de chapitre, dont la seconde moitié découvre la photo
   par les lames de l'obturateur, avec son double déclic), bandes-julie (4.1 ; 5.1 en lilas, le grain devenu
   confettis) ; et le même plan (« — » au découpage), qui ne couvre rien. */

var numeros = 0;              // identifiants uniques des calques SVG
function plusLoin(c) {  // du point au coin le plus éloigné de la scène
  return Math.max(Math.hypot(c[0], c[1]), Math.hypot(W - c[0], c[1]), Math.hypot(c[0], H - c[1]), Math.hypot(W - c[0], H - c[1])) + 30;
}
function rect(e, r) {
  e.setAttribute('x', r[0]); e.setAttribute('y', r[1]);
  e.setAttribute('width', Math.max(0, r[2])); e.setAttribute('height', Math.max(0, r[3]));
}
function melange(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
var PLEIN = [-80, -80, W + 160, H + 160];
// Ondulations lissées entre -1 et 1 (hasard reproductible : le même pinceau à chaque lecture).
function ondes(n, rnd, pas) {
  var v = [], a = rnd() * 2 - 1, b = rnd() * 2 - 1;
  for (var i = 0; i < n; i++) {
    if (i % pas === 0) { a = b; b = rnd() * 2 - 1; }
    var t = (i % pas) / pas;
    v.push(a + (b - a) * t * t * (3 - 2 * t));
  }
  return v;
}
function trace(points) { return 'M' + points.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L') + 'Z'; }

// Les couleurs des bandes d'ouverture. Darshan : encre, vermillon, or, la trame de points d'or. Julie :
// « mêmes bandes obliques et même durée, en anthracite, gris et blanc de papier photo ; un grain argentique à
// la place de la trame de points ; […] Ni or ni vermillon » (chapitre-4.md, section 6). 5.1 : « en lilas, et
// leur grain devient une pluie de confettis rose, menthe et citron […]. Ni or ni vermillon » (chapitre-5.md,
// 5.1). titre : la face, le contour, l'ombre ; lames : celles de l'obturateur qui les ouvre.
var PALETTES = {
  darshan: { fond: ENCRE, vif: SINDOOR, filet: OR, grain: 'trame', titre: [CREME, ENCRE, SINDOOR], lames: ['#15171c', '#1c1f25', '#4a505c'] },
  julie: { fond: '#1c1e23', vif: '#686d76', filet: '#eeeae1', grain: 'argentique', titre: ['#f4f1ea', '#1c1e23', '#80858e'], lames: ['#15171c', '#1c1f25', '#4a505c'] },
  lilas: { fond: '#4b3c68', vif: '#a490ca', filet: '#f6eefc', grain: 'confettis', titre: ['#fdf8ff', '#4b3c68', '#e9a3c2'], lames: ['#2f2645', '#382c51', '#7d6c9f'] }
};
function palette(o) {
  if (o.type === 'bandes-julie') return o.palette === 'lilas' ? PALETTES.lilas : PALETTES.julie;
  return PALETTES.darshan;
}
// Le grain des bandes : la trame de points d'or (Darshan), un grain d'argent (Julie), ou des confettis (5.1).
// Un motif SVG dessiné une fois (hasard reproductible), qui suit la bande quand elle glisse.
function motifGrain(defs, sorte, grain) {
  var id = 'grain' + (++numeros), rnd = hasard(31), m, i;
  if (sorte === 'confettis') {
    var couleurs = ['#f4a6c4', '#a2e3c8', '#f4e48b'];       // rose, menthe, citron
    m = svgEl('pattern', { id: id, width: 170, height: 170, patternUnits: 'userSpaceOnUse' }, defs);
    for (i = 0; i < 20; i++) {
      var x = 10 + rnd() * 150, y = 10 + rnd() * 150, c = couleurs[i % 3];
      if (i % 4 === 3) svgEl('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (3 + rnd() * 2).toFixed(1), fill: c }, m);
      else svgEl('rect', { x: -7, y: -2.6, width: 14, height: 5.2, rx: 1.2, fill: c,
        transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + Math.round(rnd() * 180) + ')' }, m);
    }
  } else if (sorte === 'argentique') {
    m = svgEl('pattern', { id: id, width: 96, height: 96, patternUnits: 'userSpaceOnUse' }, defs);
    for (i = 0; i < 110; i++) {
      svgEl('circle', { cx: (rnd() * 96).toFixed(1), cy: (rnd() * 96).toFixed(1), r: (0.6 + rnd() * 1.5).toFixed(2),
        fill: i % 3 ? '#ffffff' : '#000000', opacity: (0.08 + rnd() * 0.26).toFixed(2) }, m);
    }
  } else {
    m = svgEl('pattern', { id: id, width: 18, height: 18, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(20)' }, defs);
    svgEl('circle', { cx: 9, cy: 9, r: 4.2, fill: grain || OR, opacity: 0.45 }, m);
  }
  return 'url(#' + id + ')';
}
// Les bandes obliques qui claquent l'une après l'autre, avec le titre du chapitre sur la plus large.
// Rend { groupe, poser(t, sortie), avant() } : poser(t, false) les fait entrer, poser(t, true) sortir.
function dessinerBandes(s, o, pal) {
  var pente = 150, defs = svgEl('defs', {}, s), titre = null, groupe = svgEl('g', {}, s);
  var grain = motifGrain(defs, o.grain || pal.grain);      // o.grain : le réglage de la page (5.1 : confettis)
  var plan = [[-220, 330, 'fond'], [110, 100, 'vif'], [210, 330, 'fond', 'trame'], [540, 34, 'filet'], [574, 470, 'fond', 'titre'],
              [1044, 70, 'vif'], [1114, 360, 'fond', 'trame'], [1474, 620, 'fond']];
  var bandes = plan.map(function (b, i) {
    var g = svgEl('g', {}, groupe), y0 = b[0], y1 = b[0] + b[1] + 40;   // chaque bande glisse sous la suivante
    var pts = '-220,' + (y0 + pente) + ' 1420,' + (y0 - pente) + ' 1420,' + (y1 - pente) + ' -220,' + (y1 + pente);
    svgEl('polygon', { points: pts, fill: pal[b[2]] }, g);
    if (b[3] === 'trame') svgEl('polygon', { points: pts, fill: grain }, g);
    if (b[3] === 'titre' && o.titre) titre = ecrireTitre(g, o.titre, b[0] + b[1] / 2, pal.titre);
    return { g: g, sens: i % 2 ? 1 : -1, i: i };
  });
  return {
    groupe: groupe,
    poser: function (t, sortie) {
      bandes.forEach(function (b) {
        var x = borne((t - b.i * 0.05) / 0.62);
        var dx = sortie ? -b.sens * 1700 * elan(x) : b.sens * 1700 * (1 - ressort(x));
        b.g.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' 0)');
      });
    },
    avant: function () {    // le titre claque sur sa bande et reste un instant
      if (!titre) return attendre(150);
      Son.effet('coup');
      return anime(340, function (x) {
        titre.setAttribute('transform', 'scale(' + (2.3 - 1.3 * ressort(x, 2.2)).toFixed(3) + ')');
        titre.setAttribute('opacity', borne(x * 3));
      }).then(function () { return attendre(1300); });
    }
  };
}
// Les lames d'un obturateur, autour de C ; ouverture(r) : r = R (le plus loin des coins), tout est ouvert.
function dessinerLames(s, C, couleurs) {
  var n = 7, R = plusLoin(C), lames = [];
  for (var i = 0; i < n; i++) {
    lames.push(svgEl('polygon', { fill: couleurs[i % 2 ? 1 : 0], stroke: couleurs[2], 'stroke-width': 4, 'stroke-linejoin': 'round' }, s));
  }
  function ouverture(r) {
    var torsion = 0.9 * (1 - r / R), L = 3000;
    lames.forEach(function (l, i) {
      var a = i * 2 * Math.PI / n + torsion, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      function p(u, v) { return (C[0] + ux * u + vx * v).toFixed(1) + ',' + (C[1] + uy * u + vy * v).toFixed(1); }
      l.setAttribute('points', [p(r, -L), p(r, L), p(r + L, L), p(r + L, -L)].join(' '));
    });
  }
  ouverture(R);
  return { R: R, ouverture: ouverture };
}
// Les bandes d'un chapitre qui entre dans le monde de Julie : elles claquent, le titre s'y pose, puis
// l'obturateur se déclenche sur elles (ses lames se ferment, 30 % du temps) et s'ouvre sur la photo.
function bandesEtObturateur(s, o) {
  var pal = palette(o), bandes = dessinerBandes(s, o, pal), lames = dessinerLames(s, o.vers || [600, 900], pal.lames);
  return {
    duree: [640, 880], sons: ['bandes', 'declic'], pause: 60,     // declic : le double déclic de l'obturateur
    couvrir: function (t) { bandes.poser(t, false); },
    decouvrir: function (t) {
      if (t < 0.3) { bandes.groupe.removeAttribute('display'); lames.ouverture(lames.R * (1 - lisse(t / 0.3))); return; }
      bandes.groupe.setAttribute('display', 'none');
      lames.ouverture(lames.R * lisse((t - 0.3) / 0.7));
    },
    avant: bandes.avant
  };
}
// L'image que montre une page : son plan visible (ou le premier, ou l'image de son décor). { src } ou { couleur }.
function imageDuPlan(scene) {
  var l = $$('.decor .plan', scene), p = null, i;
  for (i = l.length - 1; i >= 0 && !p; i--) if (l[i].classList.contains('vu')) p = l[i];
  p = p || l[0] || $('.decor img', scene);
  if (!p) return null;
  if (p.tagName.toLowerCase() === 'img') {
    var src = p.getAttribute('src') || p.getAttribute('data-src');
    return src ? { src: src } : null;
  }
  return p.style.backgroundColor ? { couleur: p.style.backgroundColor } : null;
}
// Le corps d'un coup de pinceau, couché sur l'axe x de 0 à L : bords ondulés et rugueux.
function formeDeCoup(L, ep, rnd) {
  var n = 90, haut = [], bas = [], onde1 = ondes(n + 1, rnd, 15), onde2 = ondes(n + 1, rnd, 15);
  for (var i = 0; i <= n; i++) {
    var u = i / n, demi = ep / 2 * (0.86 + 0.14 * Math.sin(u * Math.PI));
    haut.push([u * L, -demi - onde1[i] * 34 - (rnd() - 0.5) * 18]);
    bas.push([u * L, demi + onde2[i] * 34 + (rnd() - 0.5) * 18]);
  }
  return trace(haut.concat(bas.reverse()));
}
// Un poil sec : une traînée fine, effilée aux deux bouts, à distance `y` de l'axe.
function poil(L, y, rnd, u0, u1, epaisseur) {
  var n = 16, h = [], b = [], phase = rnd() * 6;
  u1 = Math.min(1, u1);
  for (var j = 0; j <= n; j++) {
    var u = u0 + (u1 - u0) * j / n, e = epaisseur * Math.sin(Math.PI * j / n), yy = y + Math.sin(u * 9 + phase) * 10;
    h.push([u * L, yy - e / 2]); b.push([u * L, yy + e / 2]);
  }
  return trace(h.concat(b.reverse()));
}

// Chaque balayage dessine dans un calque SVG de 1200 x 1800 et renvoie ses deux moitiés,
// réglées par t de 0 à 1, leurs durées, et leurs sons.
var Balayages = {
  fondu: function (s, o) {
    var r = svgEl('rect', { fill: o.couleur || '#000' }, s);
    rect(r, PLEIN);
    return {
      duree: [600, 650],
      couvrir: function (t) { r.setAttribute('opacity', lisse(t)); },
      decouvrir: function (t) { r.setAttribute('opacity', 1 - lisse(t)); }
    };
  },
  // Trois coups de pinceau, alternés. Chaque coup est une forme d'encre aux bords irréguliers,
  // bordée de poils secs, dessinée une fois ; un masque la découvre au fil du geste, et le
  // bout du masque est arrondi comme la pointe d'un pinceau (puis comme sa fin, au retrait).
  encre: function (s, o) {
    var couleur = o.couleur || ENCRE, coups = [], defs = svgEl('defs', {}, s), rnd = hasard(7), ep = 940;
    [350, 1050, 1750].forEach(function (c, k) {
      var a = [-260, c + 66], b = [1460, c - 373];         // le long de y = c - 0,2556 x
      if (k === 1) { var z = a; a = b; b = z; }
      var L = Math.hypot(b[0] - a[0], b[1] - a[1]), angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      var id = 'coup' + (++numeros), clip = svgEl('clipPath', { id: id, clipPathUnits: 'userSpaceOnUse' }, defs);
      var masque = svgEl('rect', { x: -ep, y: -ep, width: 0, height: 2 * ep }, clip);
      var pointe = svgEl('ellipse', { cx: 0, cy: 0, rx: ep * 0.28, ry: ep * 0.62 }, clip);
      var g = svgEl('g', { transform: 'translate(' + a[0] + ' ' + a[1] + ') rotate(' + angle.toFixed(2) + ')' }, s);
      var corps = svgEl('g', { 'clip-path': 'url(#' + id + ')' }, g);
      svgEl('path', { d: formeDeCoup(L, ep, rnd), fill: couleur }, corps);
      for (var i = 0; i < 4; i++) svgEl('path', { d: poil(L, ep * (0.1 + 0.2 * i) * (i % 2 ? 1 : -1), rnd, 0.1, 0.9, 6 + 8 * rnd()), fill: '#161a33', opacity: 0.7 }, corps);
      for (var j = 0; j < 10; j++) {
        var cote = j % 2 ? 1 : -1;
        svgEl('path', { d: poil(L, cote * (ep / 2 + 6 + rnd() * 50), rnd, rnd() * 0.35, 0.3 + rnd() * 0.65, 5 + rnd() * 13),
          fill: (k === 1 && j === 4) ? SINDOOR : couleur }, corps);
      }
      coups.push({ masque: masque, pointe: pointe, L: L, rx: ep * 0.28, debut: k * 0.2, fin: k * 0.2 + 0.6 });
    });
    function poser(t, sortie) {
      coups.forEach(function (c) {
        var x = lisse(borne((t - c.debut) / (c.fin - c.debut))), bord = -c.rx + x * (c.L + 2 * c.rx);
        if (sortie) { c.masque.setAttribute('x', bord); c.masque.setAttribute('width', Math.max(0, c.L + ep - bord)); }
        else { c.masque.setAttribute('x', -ep); c.masque.setAttribute('width', Math.max(0, bord + ep)); }
        c.pointe.setAttribute('cx', bord);
      });
    }
    return {
      duree: [780, 820], sons: ['balai', 'balai'],
      couvrir: function (t) { poser(t, false); },
      decouvrir: function (t) { poser(t, true); }
    };
  },
  // des bandes obliques qui claquent l'une après l'autre, avec le titre du chapitre (1.1, 3.1, 7.1)
  bandes: function (s, o) {
    var bandes = dessinerBandes(s, o, PALETTES.darshan);
    return {
      duree: [640, 680], sons: ['bandes', 'bandes'],
      couvrir: function (t) { bandes.poser(t, false); },
      decouvrir: function (t) { bandes.poser(t, true); },
      avant: bandes.avant
    };
  },
  // 2.1 et 6.1 : « les bandes d'ouverture portent le titre du chapitre ; leur seconde moitié découvre la photo
  // par les lames de l'obturateur, avec son double déclic […] : on entre dans le monde de Julie » (chapitre-6.md, 6.1)
  'bandes-photo': bandesEtObturateur,
  // 4.1 : les bandes de Julie (anthracite, gris, papier photo, grain argentique), sorties par l'obturateur ;
  // 5.1 : les mêmes en lilas, le grain en confettis (data-entree-palette="lilas", data-entree-grain="confettis")
  'bandes-julie': bandesEtObturateur,
  // Le même plan (« — » au découpage : 3.10, 3.11, 6.2…) : rien ne couvre la page, le texte change et l'image
  // reste, comme d'une page de la rue de Rungis à la suivante (7.12 à 7.15). Si la page suivante ne s'ouvre pas
  // sur la même image, l'image qui part se fond dans la nouvelle (0,9 s), jamais par le noir. o.image : l'image
  // de la page qui part (Transitions.passer la lit) ; o.couleur="none" (la rue) : rien du tout.
  plan: function (s, o) {
    var avant = o.image, apres = imageDuPlan(s.parentNode), voile = null;
    var meme = apres && avant && (avant.src ? avant.src === apres.src : avant.couleur === apres.couleur);
    var fondre = !!avant && o.couleur !== 'none' && !meme;
    return {
      duree: [0, fondre ? 900 : 0], pause: 0,
      couvrir: function () {},
      decouvrir: function (t) {
        if (!fondre) return;
        if (!voile) {
          if (avant.src) {
            voile = svgEl('image', { x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'xMidYMid slice' }, s);
            voile.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', avant.src);
            voile.setAttribute('href', avant.src);
          } else voile = svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: avant.couleur }, s);
        }
        voile.setAttribute('opacity', (1 - lisse(t)).toFixed(3));
      }
    };
  },
  // un cercle se referme sur un point, puis s'ouvre ailleurs
  iris: function (s, o) {
    var de = o.de || [600, 900], vers = o.vers || [600, 900];
    var voile = svgEl('path', { fill: o.couleur || '#02030a', 'fill-rule': 'evenodd' }, s);
    var anneaux = [svgEl('circle', { fill: 'none', stroke: OR, 'stroke-width': 8 }, s),
                   svgEl('circle', { fill: 'none', stroke: SINDOOR, 'stroke-width': 3 }, s)];
    function trou(c, r) {
      var d = 'M-80,-80H' + (W + 80) + 'V' + (H + 80) + 'H-80Z';
      if (r > 0.5) d += 'M' + (c[0] - r) + ',' + c[1] + 'a' + r + ',' + r + ' 0 1,0 ' + 2 * r + ',0a' + r + ',' + r + ' 0 1,0 ' + (-2 * r) + ',0Z';
      voile.setAttribute('d', d);
      anneaux.forEach(function (a, i) {
        a.setAttribute('cx', c[0]); a.setAttribute('cy', c[1]); a.setAttribute('r', Math.max(0, r + i * 16));
        a.setAttribute('opacity', r > 6 ? 0.9 : 0);
      });
    }
    var R1 = plusLoin(de), R2 = plusLoin(vers);
    return {
      duree: [760, 900], sons: ['iris', null], pause: 260,
      couvrir: function (t) { trou(de, R1 * (1 - lisse(t))); },
      decouvrir: function (t) { trou(vers, R2 * lisse(t)); }
    };
  },
  // la lumière jaillit d'une embrasure et gagne l'écran ; la scène suivante apparaît dans
  // une porte qui s'élargit jusqu'à nous
  porte: function (s, o) {
    var de = o.de || [520, 760, 160, 280], vers = o.vers || [470, 560, 260, 560], clair = o.couleur || '#fff8ea';
    var halo = svgEl('rect', { fill: '#ffd98a', opacity: 0 }, s);
    var plein = svgEl('rect', { fill: clair, opacity: 0 }, s);
    var cadre = svgEl('path', { fill: clair, 'fill-rule': 'evenodd', opacity: 0 }, s);
    var bord = svgEl('rect', { fill: 'none', stroke: OR, 'stroke-width': 6, opacity: 0 }, s);
    return {
      duree: [900, 1250], sons: ['souffle', null], pause: 160,
      couvrir: function (t) {
        var a = lisse(borne(t / 0.3)), b = lent(borne((t - 0.2) / 0.8));
        var r = melange(de, PLEIN, b), m = 40 + 160 * a;
        rect(plein, r); plein.setAttribute('opacity', a);
        rect(halo, [r[0] - m, r[1] - m, r[2] + 2 * m, r[3] + 2 * m]); halo.setAttribute('opacity', 0.55 * a * (1 - b));
      },
      decouvrir: function (t) {
        var r = melange(vers, [-W, -H, 3 * W, 3 * H], lent(t));
        cadre.setAttribute('d', 'M-80,-80H' + (W + 80) + 'V' + (H + 80) + 'H-80Z M' + r[0] + ',' + r[1] + 'h' + r[2] + 'v' + r[3] + 'h' + (-r[2]) + 'Z');
        cadre.setAttribute('opacity', 1 - lisse(borne((t - 0.6) / 0.4)));
        rect(bord, r); bord.setAttribute('opacity', 0.9 * (1 - borne(t / 0.7)));
      }
    };
  },
  // l'éblouissement : une lumière qui s'étend, puis se dissipe
  lumiere: function (s, o) {
    var de = o.de || [600, 900], id = 'eblouir' + (++numeros);
    var g = svgEl('radialGradient', { id: id }, svgEl('defs', {}, s));
    svgEl('stop', { offset: '0', 'stop-color': '#ffffff' }, g);
    svgEl('stop', { offset: '0.55', 'stop-color': '#fff3cf' }, g);
    svgEl('stop', { offset: '1', 'stop-color': '#ffe3a0', 'stop-opacity': '0' }, g);
    var c = svgEl('circle', { cx: de[0], cy: de[1], r: 1, fill: 'url(#' + id + ')' }, s);
    var plein = svgEl('rect', { fill: '#fffaf0', opacity: 0 }, s);
    rect(plein, PLEIN);
    var R = plusLoin(de) * 1.6;
    return {
      duree: [900, 2000], sons: ['souffle', null],
      couvrir: function (t) { c.setAttribute('r', R * lent(t) + 1); plein.setAttribute('opacity', lisse(borne((t - 0.55) / 0.45))); },
      decouvrir: function (t) { c.setAttribute('r', 1); plein.setAttribute('opacity', 1 - vif(t)); }
    };
  },
  // le monde de Julie : les lames d'un obturateur se ferment, puis s'ouvrent sur la photo suivante
  obturateur: function (s, o) {
    var lames = dessinerLames(s, o.de || [600, 900], PALETTES.darshan.lames), R = lames.R;
    return {
      duree: [420, 520], sons: ['declic', null], pause: 90,
      couvrir: function (t) { lames.ouverture(R * (1 - lisse(t))); },
      decouvrir: function (t) { lames.ouverture(R * lisse(t)); }
    };
  },
  // le téléphone de Julie : un panneau glisse, comme on passe d'une photo à l'autre
  glissement: function (s, o) {
    var sens = o.sens || -1, g = svgEl('g', {}, s);
    rect(svgEl('rect', { fill: o.couleur || '#101114' }, g), PLEIN);
    rect(svgEl('rect', { fill: '#000', opacity: 0.35 }, g), [sens < 0 ? -116 : W + 80, -80, 36, H + 160]);
    function x(v) { g.setAttribute('transform', 'translate(' + v.toFixed(1) + ' 0)'); }
    return {
      duree: [360, 420], sons: ['papier', null],
      couvrir: function (t) { x(-sens * (W + 200) * (1 - lisse(t))); },
      decouvrir: function (t) { x(sens * (W + 200) * lisse(t)); }
    };
  }
};

// Le titre d'un chapitre, posé sur sa bande : face crème, contour d'encre, ombre vermillon ; chez Julie, face de
// papier photo, contour anthracite, ombre grise (couleurs : [face, contour, ombre]).
function ecrireTitre(g, texte, y, couleurs) {
  couleurs = couleurs || PALETTES.darshan.titre;
  var pose = svgEl('g', { transform: 'translate(600 ' + y + ') rotate(-10.4) skewX(-8)' }, g);
  var titre = svgEl('g', { opacity: 0 }, pose);
  var taille = Math.min(132, Math.round(2000 / Math.max(8, texte.length)));
  function ligne(attrs) {
    var t = svgEl('text', { dy: '0.32em', 'text-anchor': 'middle', 'font-family': 'Unna, Georgia, serif', 'font-style': 'italic', 'font-size': taille }, titre);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) t.setAttribute(k, attrs[k]); }
    t.textContent = texte;
  }
  ligne({ x: 11, y: 11, fill: couleurs[2] });
  ligne({ x: 0, y: 0, fill: couleurs[0], stroke: couleurs[1], 'stroke-width': 4, 'paint-order': 'stroke' });
  return titre;
}

var Transitions = (function () {
  var occupe = 0;
  function voile(scene, classe) {
    return svgEl('svg', { 'class': classe || 'tr', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
  }
  function sonner(m, i) { var n = m.sons && m.sons[i]; if (n) Son.effet(n); }
  // L'entrée d'une scène : data-entree="type x y…" (les nombres : où s'ouvre le balayage), et ses réglages,
  // que build.py écrit d'après livre.py (entree=dict(…)) : data-entree-couleur (1.9 : « fondu au blanc
  // #f8efdc », après la chemise de 1.8), data-entree-palette et data-entree-grain (5.1 : le lilas, les confettis).
  function lireEntree(scene) {
    var a = (scene.getAttribute('data-entree') || '').split(/\s+/).filter(Boolean);
    if (!a.length) return null;
    var o = { type: a[0] }, nombres = a.slice(1).map(Number), h = scene.querySelector('h1.chapitre');
    if (nombres.length) o.vers = nombres;
    if (h) o.titre = h.textContent;
    [].slice.call(scene.attributes).forEach(function (at) {
      if (at.name.indexOf('data-entree-') === 0) o[at.name.slice(12)] = at.value;
    });
    return o;
  }
  function fabriquer(scene, o) {
    var type = Balayages[o.type] ? o.type : 'fondu';
    // Mouvement réduit : un fondu court (le même plan reste ce qu'il est) ; celui des bandes de Julie passe par
    // leur couleur, l'anthracite ou le lilas, plutôt que par le noir.
    if (calme && type !== 'plan') {
      if (type === 'bandes-julie' && !o.couleur) o.couleur = palette(o).fond;
      type = 'fondu';
    }
    var s = voile(scene, type === 'plan' ? 'tr tr-plan' : 'tr');
    return { s: s, m: Balayages[type](s, o) };
  }
  // Une moitié de balayage ; sans durée (le même plan), sa pose finale tout de suite.
  function jouerMoitie(duree, pas) {
    if (duree > 0) return anime(duree, pas);
    pas(1);
    return Promise.resolve();
  }
  // Couvre tout de suite la scène qui arrive ; renvoie de quoi la découvrir.
  function preparer(scene, o) {
    var b = fabriquer(scene, o), fin = null;
    b.m.decouvrir(0);
    occupe++;
    scene.entreeFaite = new Promise(function (ok) { fin = ok; });
    return function () {
      return Promise.resolve(b.m.avant ? b.m.avant() : null)
        .then(function () { sonner(b.m, 1); return jouerMoitie(b.m.duree[1], b.m.decouvrir); })
        .then(function () { retirer(b.s); occupe--; fin(); });
    };
  }
  // Une page d'EPUB peut être préparée hors de la vue : l'entrée attend qu'elle se montre.
  function quandVisible() {
    return new Promise(function (ok) {
      function voir() { requestAnimationFrame(function () { ok(); }); }
      if (!doc.hidden) { voir(); return; }
      doc.addEventListener('visibilitychange', function f() {
        if (doc.hidden) return;
        doc.removeEventListener('visibilitychange', f); voir();
      });
    });
  }
  // Petit changement d'état d'un objet : une étoile et des rayons, un tintement.
  function frisson(scene, x, y, r) {
    if (calme) return Promise.resolve();
    var s = voile(scene, 'tr tr-leger'), g = svgEl('g', {}, s);
    [true, false].forEach(function (ombre) {
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6 + 0.26, long = i % 2 ? 0.75 : 1;
        svgEl('line', { x1: Math.cos(a) * r * 0.45, y1: Math.sin(a) * r * 0.45, x2: Math.cos(a) * r * long, y2: Math.sin(a) * r * long,
          stroke: ombre ? ENCRE : (i % 3 ? OR : CREME), 'stroke-width': (i % 2 ? 5 : 10) + (ombre ? 8 : 0), 'stroke-linecap': 'round',
          opacity: ombre ? 0.35 : 1 }, g);
      }
      svgEl('path', { d: etoile(r * 0.34), fill: ombre ? ENCRE : CREME, opacity: ombre ? 0.35 : 1,
        transform: ombre ? 'scale(1.18)' : '' }, g);
    });
    Son.effet('frisson');
    return anime(560, function (t) {
      var e = vif(t);
      g.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + (18 * e).toFixed(2) + ') scale(' + (0.5 + 0.9 * e).toFixed(3) + ')');
      g.setAttribute('opacity', String(1 - t * t));
    }).then(function () { retirer(s); });
  }
  // Métamorphose d'un objet : des bandes qui claquent, l'objet qui arrive en tournoyant, son
  // nom en grand, et le fragment du livre qui la raconte. Le style est dans moteur.css (.eclat).
  function eclat(scene, o) {
    var e = el('div', { 'class': 'eclat' + (calme ? ' calme' : ''), 'aria-hidden': 'true' }, scene);
    ['b4', 'b1', 'b2', 'b3', 'b5'].forEach(function (c) { el('div', { 'class': 'eclat-bande ' + c }, e); });
    el('div', { 'class': 'eclat-trame' }, e);
    var ciel = svgEl('svg', { 'class': 'eclat-etoiles', viewBox: '0 0 ' + W + ' ' + H }, e);
    [[170, 420, 46], [1010, 330, 60], [1080, 1180, 38], [240, 1210, 30], [640, 250, 26], [900, 1420, 22], [120, 820, 20]].forEach(function (p, i) {
      var st = svgEl('path', { d: etoile(p[2]), fill: i % 3 ? CREME : OR }, svgEl('g', { transform: 'translate(' + p[0] + ' ' + p[1] + ')' }, ciel));
      st.style.animationDelay = (420 + i * 70) + 'ms';
    });
    var v = el('div', { 'class': 'eclat-objet' }, e), d = dessin(o.objet);
    if (d) v.appendChild(d);
    el('p', { 'class': 'eclat-nom' }, e).textContent = o.nom;
    if (o.fragment) el('p', { 'class': 'eclat-fragment' }, e).textContent = '« ' + o.fragment + ' »';
    occupe++;
    Son.effet('eclat');
    requestAnimationFrame(function () { requestAnimationFrame(function () { e.classList.add('joue'); }); });
    // en mouvement réduit, rien ne bouge, mais le nom et la phrase restent le temps d'être lus
    return new Promise(function (ok) { setTimeout(ok, calme ? 1500 : 2200); }).then(function () {
      e.classList.add('sort');
      return attendre(600);
    }).then(function () { retirer(e); occupe--; });
  }
  // L'objet quitte son annonce et vole jusqu'au bouton « Objets ».
  function envol(scene, source, cible, id) {
    var rs = scene.getBoundingClientRect(), a = source.getBoundingClientRect(), b = cible.getBoundingClientRect();
    if (calme || !rs.width || !a.width || !b.width) return Promise.resolve();
    var vol = el('div', { 'class': 'envol', 'aria-hidden': 'true' }, scene), d = dessin(id);
    if (d) vol.appendChild(d);
    var x0 = a.left - rs.left, y0 = a.top - rs.top;
    var x1 = b.left - rs.left + (b.width - a.width) / 2, y1 = b.top - rs.top + (b.height - a.height) / 2;
    var cx = (x0 + x1) / 2 + rs.width * 0.08, cy = Math.min(y0, y1) - rs.height * 0.1;
    var fin = Math.max(0.3, Math.min(1, b.height / a.height));
    vol.style.width = (a.width / rs.width * 100) + '%';
    vol.style.height = (a.height / rs.height * 100) + '%';
    return anime(760, function (t) {
      var e = lisse(t), u = 1 - e;
      var x = u * u * x0 + 2 * u * e * cx + e * e * x1, y = u * u * y0 + 2 * u * e * cy + e * e * y1;
      vol.style.left = (x / rs.width * 100) + '%';
      vol.style.top = (y / rs.height * 100) + '%';
      vol.style.transform = 'rotate(' + (-40 * Math.sin(e * Math.PI)).toFixed(2) + 'deg) scale(' + (1 + (fin - 1) * e).toFixed(3) + ')';
      vol.style.opacity = String(t < 0.85 ? 1 : (1 - t) / 0.15);
    }).then(function () { retirer(vol); });
  }
  return {
    occupe: function () { return occupe > 0; },
    // Édition web : couvrir la scène qui part, montrer l'autre (changer), la découvrir.
    passer: function (avant, apres, changer, o) {
      var e = lireEntree(apres) || { type: 'fondu' };
      if (o) { for (var k in o) { if (o.hasOwnProperty(k)) e[k] = o[k]; } }
      // le même plan : l'image de la page qui part, lue avant qu'elle ne rende ses images (liberer, depart.js)
      if (e.type === 'plan' && !e.image) e.image = imageDuPlan(avant);
      var b = fabriquer(avant, e);
      b.m.couvrir(0);
      occupe++;
      sonner(b.m, 0);
      return jouerMoitie(b.m.duree[0], b.m.couvrir).then(function () {
        var decouvrir = preparer(apres, e), pause = 'pause' in b.m ? b.m.pause : 80;
        changer();
        retirer(b.s); occupe--;
        return (pause ? attendre(pause) : Promise.resolve()).then(decouvrir);
      });
    },
    // EPUB : la page s'ouvre couverte, puis se découvre. Le même plan n'a rien à découvrir : la page
    // s'ouvre telle quelle (Apple Books tourne la page).
    entree: function (scene) {
      var e = lireEntree(scene);
      if (!e || e.type === 'plan') return Promise.resolve();
      var decouvrir = preparer(scene, e);
      return quandVisible().then(function () { return attendre(200); }).then(decouvrir);
    },
    frisson: frisson,
    eclat: eclat,
    envol: envol
  };
})();
