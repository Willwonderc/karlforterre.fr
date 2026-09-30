// ---------------------------------------------------------------- interface : consignes, fiches, sacs, carnet, menu
/* Tout ce qui n'est pas le livre : la consigne d'un geste, les annonces pour les lecteurs
   d'écran, les panneaux (fiche d'objet, objets, carnet des portes, menu), la barre de
   commandes. Tous les textes viennent d'interface.ini par ui('cle') ; les phrases des fiches
   viennent du livre (objets.ini, vérifiées par build.py) et n'apparaissent qu'une fois lues.
   L'interface naît avec le premier objet et la première porte, et meurt avec la magie
   (7.14) : sur les pages « sans-magie », il ne reste que le menu. */

// ---- annonces pour les lecteurs d'écran (région vivante, invisible)
var annonceur = el('div', { 'class': 'annonceur', 'aria-live': 'polite' }, doc.body);
function annoncer(txt) { annonceur.textContent = ''; setTimeout(function () { annonceur.textContent = txt; }, 30); }

// ---- consigne d'un geste : une ligne en italique, montrée après `delai` ms (tout de suite en
// mouvement réduit), à la hauteur y de la scène
function consigne(scene, texte, y, delai) {
  var c = $('.consigne', scene) || el('div', { 'class': 'consigne ui', 'aria-live': 'polite' }, scene);
  c.style.top = pourcent(y || 1180, H);
  function montrer() { c.textContent = texte; requestAnimationFrame(function () { c.classList.add('vu'); }); }
  var minuterie = (delai && !calme) ? setTimeout(montrer, delai) : (montrer(), null);
  return { effacer: function () { if (minuterie) clearTimeout(minuterie); c.classList.remove('vu'); } };
}

// ---- panneaux : une seule feuille à la fois, sur la scène courante (fenêtre de dialogue)
var Panneaux = (function () {
  var ouverte = null, avant = null, surFin = null;
  function structure(sc) {
    if (sc.fiche) return sc.fiche;
    var f = el('div', { 'class': 'fiche', role: 'dialog', 'aria-modal': 'true' }, sc);
    var fond = el('div', { 'class': 'fiche-fond' }, f);
    f.carte = el('div', { 'class': 'fiche-carte', tabindex: '-1' }, f);
    fond.addEventListener('click', function () { fermer(); });
    f.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
    f.addEventListener('click', function (ev) { ev.stopPropagation(); });
    f.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); fermer(); }
      else if (ev.key === 'Tab') {
        var b = $$('button, input, a[href]', f.carte), i = b.indexOf(doc.activeElement);
        if (b.length && ev.shiftKey && i <= 0) { ev.preventDefault(); b[b.length - 1].focus(); }
        else if (b.length && !ev.shiftKey && i === b.length - 1) { ev.preventDefault(); b[0].focus(); }
      }
      ev.stopPropagation();
    });
    sc.fiche = f;
    return f;
  }
  // Prépare une feuille vide sur la scène courante : { f, c } (c : la carte à remplir).
  function preparer(etiquette, classe) {
    var sc = sceneCourante();
    if (!sc) return null;
    var f = structure(sc), c = f.carte;
    while (c.firstChild) c.removeChild(c.firstChild);
    c.className = 'fiche-carte' + (classe ? ' ' + classe : '');
    f.setAttribute('aria-label', etiquette);
    return { f: f, c: c };
  }
  function montrer(f, fin) {
    if (!ouverte) avant = doc.activeElement;
    ouverte = f;
    surFin = fin || null;
    f.classList.add('ouverte');
    requestAnimationFrame(function () { requestAnimationFrame(function () { f.classList.add('visible'); }); });
    Son.effet('papier');
    setTimeout(function () { var b = f.carte.querySelector('.fiche-actions button'); (b || f.carte).focus(); }, 80);
  }
  function fermer(sansRetour) {
    if (!ouverte) return;
    var f = ouverte; ouverte = null;
    f.classList.remove('visible');
    setTimeout(function () { if (ouverte !== f) f.classList.remove('ouverte'); }, calme ? 30 : 360);
    if (!sansRetour && avant && avant.focus && doc.contains(avant)) { try { avant.focus(); } catch (e) { /* rien */ } }
    var cb = surFin; surFin = null;
    if (cb) cb();
  }
  function boutonFermer(zone, secondaire) {
    var bf = el('button', { type: 'button' }, zone);
    if (secondaire) bf.className = 'secondaire';
    bf.textContent = ui('fermer');
    bf.addEventListener('click', function () { fermer(); });
    return bf;
  }
  return { preparer: preparer, montrer: montrer, fermer: fermer, boutonFermer: boutonFermer,
    ouvert: function () { return !!ouverte; } };
})();

// ---- les objets : deux sacs (Darshan, Julie), la fiche de chaque objet, l'annonce
var Objets = (function () {
  var donnees = DONNEES.objets || {}, familles = DONNEES.familles || {};
  var sacs = { darshan: [], julie: [] }, actions = {};
  // barre « julie » (4.1 à 5.1, où Julie dit « je ») : seul son sac se montre ; regard : l'action
  // « Regarder à travers » dans la fiche des lunettes (états de page calculés par build.py)
  var barre = 'darshan', regard = false;
  function sacsVisibles() { return barre === 'julie' ? ['julie'] : ['darshan', 'julie']; }
  function visibles() { return sacsVisibles().reduce(function (l, s) { return l.concat(sacs[s]); }, []); }
  function nom(id) { return (donnees[id] || {}).nom || id; }
  function porteur(id) { return (donnees[id] || {}).porteur || 'darshan'; }
  function lues(id) { return ((donnees[id] || {}).citations || []).filter(function (c) { return c.lu <= Lecture.max; }); }
  // Un effet qui parle des lunettes trouve aussi les binocles (même objet, autre allure).
  function trouver(sac, id) {
    var noms = familles[id] || [id];
    for (var i = 0; i < noms.length; i++) if (sac.indexOf(noms[i]) >= 0) return noms[i];
    return null;
  }
  function ouSont(id) {
    for (var s in sacs) { if (sacs.hasOwnProperty(s) && trouver(sacs[s], id)) return s; }
    return null;
  }
  function tous() { return sacs.darshan.concat(sacs.julie); }

  // Examiner : on fait tourner le gros plan du doigt ; il revient en place quand on lâche.
  function examiner(zone) {
    var svg = zone.querySelector('svg'), x0 = 0, y0 = 0, tenu = false;
    if (!svg) return;
    zone.addEventListener('pointerdown', function (ev) {
      tenu = true; x0 = ev.clientX; y0 = ev.clientY; zone.classList.add('tenu', 'manie');
      if (zone.setPointerCapture) { try { zone.setPointerCapture(ev.pointerId); } catch (e) { /* rien */ } }
    });
    zone.addEventListener('pointermove', function (ev) {
      if (!tenu || calme) return;
      var ry = Math.max(-70, Math.min(70, (ev.clientX - x0) * 0.45)), rx = Math.max(-40, Math.min(40, -(ev.clientY - y0) * 0.35));
      svg.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
    });
    function lacher() { if (!tenu) return; tenu = false; zone.classList.remove('tenu'); svg.style.transform = ''; }
    zone.addEventListener('pointerup', lacher);
    zone.addEventListener('pointercancel', lacher);
  }
  function ouvrir(id, options) {
    options = options || {};
    var p = Panneaux.preparer(nom(id), porteur(id) === 'julie' ? 'carte-julie' : '');
    if (!p) return;
    var c = p.c;
    var visuel = el('div', { 'class': 'fiche-visuel', 'aria-hidden': 'true' }, c);
    var d = dessin(id);
    if (d) { visuel.appendChild(d); examiner(visuel); }
    el('p', { 'class': 'fiche-surtitre' + (options.nouveau ? ' etiquette' : '') }, c).textContent = options.nouveau ? ui('nouvel_objet') : '';
    el('h2', { tabindex: '-1' }, c).textContent = nom(id);
    lues(id).forEach(function (q, k) {
      var b = el('blockquote', {}, c);
      b.style.animationDelay = (360 + k * 90) + 'ms';     // les phrases entrent l'une après l'autre
      b.appendChild(doc.createTextNode('« ' + q.texte + ' »'));
      el('cite', {}, b).textContent = q.chapitre;
    });
    var zone = el('div', { 'class': 'fiche-actions' }, c), a = actions[id];
    // « Regarder à travers » : seulement si Karl a gardé ce texte dans interface.ini (clé regarder)
    var texteRegard = DONNEES.ui && DONNEES.ui.regarder;
    if (!a && id === 'lunettes' && regard && texteRegard && !html.classList.contains('sans-magie-page')) {
      a = { libelle: texteRegard, faire: function () { Regard.regarder(sceneCourante()); } };
    }
    if (a) {
      var ba = el('button', { type: 'button' }, zone);
      ba.textContent = a.libelle;
      ba.addEventListener('click', function () {
        var faire = a.faire;
        Panneaux.fermer(true);
        if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
        faire();
      });
    }
    Panneaux.boutonFermer(zone, !!a);
    Panneaux.montrer(p.f, options.fin);
  }
  function panneau() {
    var p = Panneaux.preparer(ui('objets'));
    if (!p) return;
    var c = p.c;
    el('p', { 'class': 'fiche-surtitre' }, c).textContent = ui('objets_surtitre');
    el('h2', { tabindex: '-1' }, c).textContent = ui('objets');
    var montres = sacsVisibles().filter(function (s) { return sacs[s].length; });
    var deux = montres.length > 1;
    if (!montres.length) el('p', { 'class': 'fiche-vide' }, c).textContent = ui('aucun_objet');
    sacsVisibles().forEach(function (s) {
      if (!sacs[s].length) return;
      if (deux) el('h3', { 'class': 'fiche-sac' }, c).textContent = ui('sac_' + s);
      var liste = el('div', { 'class': 'fiche-liste' }, c);
      sacs[s].forEach(function (id) {
        var b = el('button', { type: 'button' }, liste);
        var d = dessin(id);
        if (d) b.appendChild(d);
        el('span', {}, b).textContent = nom(id);
        b.addEventListener('click', function () { ouvrir(id); });
      });
    });
    Panneaux.boutonFermer(el('div', { 'class': 'fiche-actions' }, c));
    Panneaux.montrer(p.f);
  }
  // L'annonce « Nouvel objet » : un bandeau oblique qui claque depuis la gauche et se touche
  // pour ouvrir la fiche ; l'objet s'en détache et vole jusqu'au bouton « Objets ».
  function signaler(id, etiquette) {
    var sc = sceneCourante();
    if (!sc) return;
    var t = el('button', { type: 'button', 'class': 'nouvel-objet' }, sc);
    var icone = el('span', { 'class': 'icone' }, t), d = dessin(id);
    if (d) icone.appendChild(d);
    var txt = el('span', {}, t);
    el('small', {}, txt).textContent = etiquette || ui('nouvel_objet');
    txt.appendChild(doc.createTextNode(nom(id)));
    var minuterie = setTimeout(retirerAnnonce, 4600);
    function retirerAnnonce() {
      clearTimeout(minuterie); t.classList.remove('vu');
      setTimeout(function () { retirer(t); }, 700);
    }
    t.addEventListener('pointerup', function (ev) { ev.stopPropagation(); });
    t.addEventListener('click', function (ev) { ev.stopPropagation(); retirerAnnonce(); ouvrir(id); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('vu'); }); });
    Son.effet('tinte');
    if (etiquette) { majBoutons(true); return; }
    setTimeout(function () {
      var b = $('.barre .objets', sc);
      if (!b || !d || b.hidden && !tous().length) { majBoutons(true); return; }
      b.hidden = false;
      b.classList.add('arrivee');
      icone.classList.add('parti');
      Transitions.envol(sc, icone, b, id).then(function () {
        b.classList.remove('arrivee');
        majBoutons(true);
        Son.effet('cle');
      });
    }, calme ? 200 : 1250);
  }
  function majBoutons(pulser) {
    var n = visibles().length;
    $$('.barre .objets').forEach(function (b) {
      b.hidden = !n || html.classList.contains('sans-magie-page');   // l'interface n'apparaît que lorsqu'elle sert
      var c = b.querySelector('.compte');
      if (c) c.textContent = String(n);
      b.setAttribute('aria-label', ui('objets') + ' : ' + n);
      if (pulser) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
    });
  }
  return {
    initialiser: function (darshan, julie, o) {
      sacs.darshan = darshan.slice(); sacs.julie = julie.slice();
      barre = (o && o.barre) || 'darshan'; regard = !!(o && o.regard);
      majBoutons(false);
    },
    offrirRegard: function (oui) { regard = !!oui; },
    ajouter: function (id, sac, annonce) {
      sac = sac || porteur(id);
      if (sacs[sac].indexOf(id) < 0) sacs[sac].push(id);
      if (annonce) signaler(id); else majBoutons(true);
      annoncer(ui('nouvel_objet') + ' : ' + nom(id));
    },
    retirer: function (id, annonce, etiquette) {
      var s = ouSont(id);
      if (!s) return;
      var x = trouver(sacs[s], id);
      sacs[s].splice(sacs[s].indexOf(x), 1);
      if (annonce) { signaler(x, etiquette || ui('objet_parti')); annoncer((etiquette || ui('objet_parti')) + ' : ' + nom(x)); }
      else majBoutons(false);
    },
    remplacer: function (de, vers, sac) {
      var s = sac || ouSont(de) || 'darshan', x = trouver(sacs[s], de);
      if (x) sacs[s][sacs[s].indexOf(x)] = vers; else if (sacs[s].indexOf(vers) < 0) sacs[s].push(vers);
      majBoutons(true);
    },
    transferer: function (id, de, vers) {
      var x = trouver(sacs[de], id) || id;
      if (sacs[de].indexOf(x) >= 0) sacs[de].splice(sacs[de].indexOf(x), 1);
      if (sacs[vers].indexOf(x) < 0) sacs[vers].push(x);
      majBoutons(true);
    },
    vider: function (ids) {
      ['darshan', 'julie'].forEach(function (s) { sacs[s] = sacs[s].filter(function (x) { return ids.indexOf(x) < 0; }); });
      majBoutons(false);
    },
    contient: function (id) { return !!ouSont(id); },
    dernier: function (sac) { var l = sacs[sac || 'darshan']; return l[l.length - 1] || null; },
    proposer: function (id, libelle, faire) { actions[id] = { libelle: libelle, faire: faire }; },
    retirerAction: function (id) { delete actions[id]; },
    ouvrir: ouvrir,
    panneau: panneau,
    presenter: function (id) { return new Promise(function (fin) { ouvrir(id, { nouveau: true, fin: fin }); }); },
    nom: nom,
    donnee: function (id) { return donnees[id] || {}; },
    majBoutons: majBoutons
  };
})();

// ---- le carnet des portes : chaque porte franchie s'allume comme une étoile, sur une carte
// du ciel où chaque lieu est placé par sa longitude et sa latitude
var Carnet = (function () {
  var carte = DONNEES.carte || { lieux: {}, portes: {} };
  var portes = [], eteint = false, pere = null, boussole = null;
  function projeter() {
    // cadre des lieux (longitude, latitude) → rectangle de 1000 x 560 unités, marges comprises
    var ids = Object.keys(carte.lieux), lon = [], lat = [];
    ids.forEach(function (k) { lon.push(carte.lieux[k].lon); lat.push(carte.lieux[k].lat); });
    var x0 = Math.min.apply(null, lon), x1 = Math.max.apply(null, lon), y0 = Math.min.apply(null, lat), y1 = Math.max.apply(null, lat);
    var l = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
    return function (lieu) {
      var p = carte.lieux[lieu];
      if (!p) return [500, 280];
      return [60 + (p.lon - x0) / l * 880, 500 - (p.lat - y0) / h * 440];
    };
  }
  // « A → B » : la flèche n'est dans aucune police du livre ; elle est dessinée, et lue « vers ».
  function libelle(parent, texte) {
    var morceaux = String(texte).split(' → ');
    morceaux.forEach(function (m, i) {
      if (i) {
        var s = svgEl('svg', { 'class': 'fleche', viewBox: '0 0 24 12', 'aria-hidden': 'true', focusable: 'false' }, parent);
        svgEl('path', { d: 'M1,6H21M16,1L22,6L16,11', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, s);
        el('span', { 'class': 'lu-seulement' }, parent).textContent = ' → ';
      }
      parent.appendChild(doc.createTextNode(m));
    });
  }
  // L'aiguille de la boussole (5.3) : d'or, pointe vermillon, d'Aluva vers Paris ; « perdue » :
  // immobile, la pointe pâlie (6.15) ; « eteinte » : grise (7.14).
  function aiguille(g, etat, x, y, r) {
    var a = svgEl('g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + (etat === 'perdue' ? 62 : -38) + ')' }, g);
    var eteinte = etat === 'eteinte' || eteint;
    svgEl('circle', { r: r, fill: 'none', stroke: eteinte ? '#555a6e' : OR, 'stroke-width': r * 0.08, opacity: 0.7 }, a);
    svgEl('path', { d: 'M0,' + (-r * 0.85) + 'L' + (r * 0.16) + ',0L0,' + (r * 0.85) + 'L' + (-r * 0.16) + ',0Z',
      fill: eteinte ? '#555a6e' : OR }, a);
    svgEl('path', { d: 'M0,' + (-r * 0.85) + 'L' + (r * 0.16) + ',0L' + (-r * 0.16) + ',0Z',
      fill: eteinte ? '#6d7182' : SINDOOR, opacity: etat === 'perdue' ? 0.45 : 1 }, a);
    return a;
  }
  function dessinerCiel(parent) {
    var s = svgEl('svg', { viewBox: '0 0 1000 560', 'aria-hidden': 'true', focusable: 'false' }, parent);
    // l'étoile à part, la porte du père : un anneau vu (3.11), allumé (7.12), éteint (7.14)
    if (pere) {
      var p = svgEl('g', { 'class': 'etoile-pere', transform: 'translate(930 70)' }, s);
      if (pere === 'allumee' && !eteint) svgEl('path', { d: etoile(26), fill: '#fff8ea' }, p);
      svgEl('circle', { r: 30, fill: 'none', stroke: pere === 'eteinte' || eteint ? '#555a6e' : OR, 'stroke-width': 3,
        opacity: pere === 'vue' ? 0.8 : 1 }, p);
    }
    if (boussole) aiguille(s, boussole, 70, 490, 48);
    var ou = projeter(), vus = {};
    portes.forEach(function (id) {
      var p = carte.portes[id];
      if (!p) return;
      var a = ou(p.de), b = ou(p.vers);
      svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: OR, 'stroke-width': 2, 'stroke-dasharray': '3 9', opacity: eteint ? 0.15 : 0.6 }, s);
      vus[p.de] = vus[p.vers] = true;
    });
    Object.keys(vus).forEach(function (lieu) {
      var q = ou(lieu);
      svgEl('path', { d: etoile(18), fill: eteint ? '#555a6e' : CREME, transform: 'translate(' + q[0] + ' ' + q[1] + ')', opacity: eteint ? 0.4 : 1 }, s);
    });
  }
  function ouvrir() {
    var p = Panneaux.preparer(ui('carnet_titre'), 'carte-carnet');
    if (!p) return;
    var c = p.c;
    el('h2', { tabindex: '-1' }, c).textContent = ui('carnet_titre');
    if (!portes.length) el('p', { 'class': 'fiche-vide' }, c).textContent = ui('carnet_vide');
    else {
      dessinerCiel(c);
      var liste = el('ol', { 'class': 'carnet-liste' }, c);
      portes.forEach(function (id) {
        var porte = carte.portes[id];
        if (!porte) return;
        var li = el('li', {}, liste);
        // la fiche de la porte : les phrases du livre déjà lues (portes.ini)
        if (lues(porte).length) {
          var b = el('button', { type: 'button', 'class': 'lien-porte' }, li);
          libelle(b, porte.libelle);
          b.addEventListener('click', function () { fichePorte(id); });
        } else libelle(li, porte.libelle);
      });
    }
    el('p', { 'class': 'fiche-vide' }, c).textContent = eteint ? ui('carnet_eteint') : ui('carnet_aide');
    Panneaux.boutonFermer(el('div', { 'class': 'fiche-actions' }, c));
    Panneaux.montrer(p.f);
  }
  function lues(porte) {
    return (porte.citations || []).filter(function (c) { return c.lu <= Lecture.max && (!c.cle || c.cle <= Lecture.max); });
  }
  function fichePorte(id) {
    var porte = carte.portes[id], p = Panneaux.preparer(porte.libelle, 'carte-carnet');
    if (!p) return;
    el('p', { 'class': 'fiche-surtitre' }, p.c).textContent = ui('carnet_titre');
    libelle(el('h2', { tabindex: '-1', 'class': 'titre-porte' }, p.c), porte.libelle);
    lues(porte).forEach(function (q, k) {
      var b = el('blockquote', {}, p.c);
      b.style.animationDelay = (360 + k * 90) + 'ms';
      b.appendChild(doc.createTextNode('« ' + q.texte + ' »'));
      el('cite', {}, b).textContent = q.chapitre;
    });
    var zone = el('div', { 'class': 'fiche-actions' }, p.c);
    var retour = el('button', { type: 'button', 'class': 'secondaire' }, zone);
    retour.textContent = ui('carnet');
    retour.addEventListener('click', function () { ouvrir(); });
    Panneaux.boutonFermer(zone);
    Panneaux.montrer(p.f);
  }
  function majBoutons(pulser) {
    $$('.barre .carnet-bouton').forEach(function (b) {
      b.hidden = !portes.length || eteint || html.classList.contains('barre-julie');
      var vieille = b.querySelector('.aiguille-bouton');
      if (vieille) retirer(vieille);
      if (boussole) {
        var petit = svgEl('svg', { 'class': 'aiguille-bouton', viewBox: '-50 -50 100 100', 'aria-hidden': 'true', focusable: 'false' });
        aiguille(petit, boussole, 0, 0, 44);
        b.insertBefore(petit, b.firstChild);
      }
      b.setAttribute('aria-label', ui('carnet') + ' : ' + portes.length);
      if (pulser) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
    });
  }
  return {
    initialiser: function (liste, magie, o) {
      portes = liste.slice(); eteint = !magie;
      pere = (o && o.pere) || null; boussole = (o && o.boussole) || null;
      majBoutons(false);
    },
    pere: function (etat) { pere = etat; majBoutons(true); },
    boussole: function (etat) { boussole = etat; majBoutons(true); },
    // l'étoile d'une porte naît quand le passage s'achève à l'image (arbitrage 6)
    allumer: function (id) {
      if (portes.indexOf(id) >= 0) return Promise.resolve();
      portes.push(id);
      majBoutons(true);
      Son.effet('tinte');
      var p = carte.portes[id];
      if (p) annoncer(ui('carnet_titre') + ' : ' + p.libelle);
      return Promise.resolve();
    },
    eteindre: function () { eteint = true; majBoutons(false); annoncer(ui('carnet_eteint')); return Promise.resolve(); },
    ouvrir: ouvrir,
    portes: function () { return portes.slice(); }
  };
})();

// ---- le regard : « Regarder à travers » les lunettes fumées (de 3.4 à 7.8, quand elles sont dans
// le sac de Darshan). La vue passe par deux verres sombres ; une page peut montrer ce que le
// regard révèle (scene.regard, écrit par ses effets : le filet d'or au pied d'une porte) ;
// ailleurs, la page telle quelle, vue à travers les verres.
var Regard = {
  regarder: function (scene) {
    if (!scene) return Promise.resolve();
    // un voile sombre percé de deux verres fumés, comme si l'on portait les lunettes
    var v = svgEl('svg', { 'class': 'regard ui', viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, scene);
    var r = 250, y = 820, xs = [335, 865];
    var trous = xs.map(function (x) {
      return 'M' + (x - r) + ',' + y + 'a' + r + ',' + r + ' 0 1,0 ' + (2 * r) + ',0a' + r + ',' + r + ' 0 1,0 ' + (-2 * r) + ',0Z';
    }).join('');
    svgEl('path', { d: 'M-80,-80H' + (W + 80) + 'V' + (H + 80) + 'H-80Z' + trous, fill: '#060402', 'fill-rule': 'evenodd', opacity: 0.9 }, v);
    xs.forEach(function (x) {
      svgEl('circle', { cx: x, cy: y, r: r, fill: '#3c2610', opacity: 0.3 }, v);
      svgEl('circle', { cx: x, cy: y, r: r, fill: 'none', stroke: '#241810', 'stroke-width': 26 }, v);
    });
    svgEl('path', { d: 'M' + (xs[0] + r - 20) + ',' + (y - 40) + 'Q600,' + (y - 110) + ' ' + (xs[1] - r + 20) + ',' + (y - 40),
      fill: 'none', stroke: '#241810', 'stroke-width': 22 }, v);
    requestAnimationFrame(function () { requestAnimationFrame(function () { v.classList.add('vu'); }); });
    Son.effet('papier', { force: 0.4 });
    var montre = typeof scene.regard === 'function' ? scene.regard() : null;
    return Promise.resolve(montre).then(function () { return attendreVraiment(calme ? 1800 : 2800); }).then(function () {
      v.classList.remove('vu');
      return attendreVraiment(700);
    }).then(function () { retirer(v); });
  }
};

// ---- le compte à rebours : en haut de la page, là où le téléphone affiche l'heure ; en or chez
// Darshan, blanc sur un bandeau graphite chez Julie (synthèse, parties 2.2 et 3.3)
var Compte = {
  afficher: function (scene, valeur, o) {
    o = o || {};
    var c = $('.compte-page', scene);
    if (!valeur) { if (c) { c.classList.remove('vu'); setTimeout(function () { retirer(c); }, 900); } return; }
    if (!c) {
      c = el('div', { 'class': 'compte-page ui' + (scene.classList.contains('monde-julie') ? ' julie' : ''), 'aria-live': 'polite' }, scene);
    }
    if (c.textContent && c.textContent !== valeur && !calme) {
      // les mots précédents se défont, les nouveaux se posent
      c.classList.remove('vu');
      setTimeout(function () { c.textContent = valeur; c.classList.add('vu'); }, 450);
    } else {
      c.textContent = valeur;
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('vu'); }); });
    }
    if (o.son) Son.effet(o.son);
  }
};

// ---- la barre de commandes et le menu
function installerBarre(scene) {
  if (scene.getAttribute('data-special') === 'seuil' || $('.barre', scene)) return;
  var barre = el('div', { 'class': 'barre ui' }, scene);
  var bObj = el('button', { type: 'button', 'class': 'objets' }, barre);
  bObj.appendChild(doc.createTextNode(ui('objets')));
  el('span', { 'class': 'compte', 'aria-hidden': 'true' }, bObj).textContent = '0';
  bObj.hidden = true;
  bObj.addEventListener('click', function (ev) { ev.stopPropagation(); if (!Transitions.occupe()) Objets.panneau(); });
  var bCarnet = el('button', { type: 'button', 'class': 'carnet-bouton' }, barre);
  bCarnet.textContent = ui('carnet');
  bCarnet.hidden = true;
  bCarnet.addEventListener('click', function (ev) { ev.stopPropagation(); if (!Transitions.occupe()) Carnet.ouvrir(); });
  var bMenu = el('button', { type: 'button', 'class': 'menu-bouton' }, barre);
  bMenu.textContent = ui('menu');
  bMenu.addEventListener('click', function (ev) { ev.stopPropagation(); if (!Transitions.occupe()) Menu.ouvrir(); });
}

var Menu = (function () {
  function bascule(parent, libelle, actif, changer) {
    var b = el('button', { type: 'button', 'class': 'bascule', 'aria-pressed': String(!!actif) }, parent);
    b.textContent = libelle;
    b.addEventListener('click', function () {
      var v = changer();
      b.setAttribute('aria-pressed', String(!!v));
    });
    return b;
  }
  function curseur(parent, libelle, valeur, changer) {
    var l = el('label', { 'class': 'curseur' }, parent);
    el('span', {}, l).textContent = libelle;
    var i = el('input', { type: 'range', min: '0', max: '1', step: '0.05' }, l);
    i.value = String(valeur);
    i.addEventListener('input', function () { changer(+i.value); });
    return i;
  }
  function lien(parent, libelle, faire) {
    var b = el('button', { type: 'button', 'class': 'lien' }, parent);
    b.textContent = libelle;
    b.addEventListener('click', function () { Panneaux.fermer(true); faire(); });
    return b;
  }
  function ouvrir() {
    var p = Panneaux.preparer(ui('menu_titre'), 'carte-menu');
    if (!p) return;
    var c = p.c;
    el('h2', { tabindex: '-1' }, c).textContent = ui('menu_titre');
    var reglage = el('div', { 'class': 'menu-reglages' }, c);
    bascule(reglage, ui('son'), Son.actif(), function () { Son.init(); return Son.basculer(); });
    var v = Son.volumes();
    curseur(reglage, ui('son_ambiance'), v.ambiance, function (x) { Son.volumes({ ambiance: x }); });
    curseur(reglage, ui('son_effets'), v.effets, function (x) { Son.volumes({ effets: x }); });
    bascule(reglage, ui('mouvement'), calme, function () {
      calme = !calme;
      reglages.mouvement = calme ? 'reduit' : 'normal';
      ecrire('darshan.reglages', reglages);
      html.classList.toggle('calme', calme);
      return calme;
    });
    bascule(reglage, ui('grand_texte'), html.classList.contains('grand'), function () {
      var g = !html.classList.contains('grand');
      html.classList.toggle('grand', g);
      reglages.grand = g; ecrire('darshan.reglages', reglages);
      return g;
    });
    var b = el('button', { type: 'button', title: ui('lecture_aide') }, reglage);
    b.textContent = ui('lecture');
    b.addEventListener('click', function () { reglages.lecture = true; ecrire('darshan.reglages', reglages); window.location.reload(); });
    // les chapitres, pour aller où l'on veut
    el('h3', { 'class': 'fiche-sac' }, c).textContent = ui('chapitres');
    var liste = el('div', { 'class': 'menu-chapitres' }, c);
    (DONNEES.chapitres || []).forEach(function (ch) {
      lien(liste, ch.titre, function () { Navigation.allerA(ch.rang); });
    });
    var zone = el('div', { 'class': 'fiche-actions' }, c);
    lien(zone, ui('relire'), function () { Navigation.relire(); }).className = 'secondaire';
    lien(zone, ui('recommencer'), function () { Navigation.recommencer(); }).className = 'secondaire';
    Panneaux.boutonFermer(zone);
    Panneaux.montrer(p.f);
  }
  return { ouvrir: ouvrir };
})();

// En mode lecture (tout le texte, sans animation), un bouton discret pour revenir au jeu.
// Appelée par base.js avant tout le reste : n'emploie que ce que base.js a déjà défini.
function installerBoutonJeu() {
  if (!reglages.lecture || !window.addEventListener) return;
  function poser() {
    var s = doc.querySelector('.scene');
    if (!s) return;
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'revenir-jeu'; b.textContent = ui('revenir_jeu');
    b.addEventListener('click', function () { reglages.lecture = false; ecrire('darshan.reglages', reglages); window.location.reload(); });
    s.appendChild(b);
  }
  if (doc.readyState === 'loading') window.addEventListener('DOMContentLoaded', poser); else poser();
}
