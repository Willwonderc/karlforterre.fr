// ---------------------------------------------------------------- effets : ce que fait une phrase
/* Effets[nom](scene, e) : ce qui arrive quand paraît un temps (moments, extra), à l'entrée
   d'une page (debut) ou après un geste (effets du geste). e vient de livre.py : { nom, …
   réglages }. Peut rendre une promesse : le temps suivant l'attend. Les effets d'objets et de
   portes font en direct ce que build.py calcule pour l'état des pages suivantes (appliquer) :
   les deux doivent rester d'accord. Un effet inconnu ne fait rien (build.py le signale). */

var Effets = {};

function jouerEffet(scene, e) {
  // une scène écrite à la main peut jouer un effet à sa façon (scene.effetsLocaux)
  var f = (scene.effetsLocaux && scene.effetsLocaux[e.nom]) || Effets[e.nom];
  if (!f) { signaler('effet inconnu : ' + e.nom); return Promise.resolve(); }
  try { return Promise.resolve(f(scene, e)).then(null, signaler); } catch (x) { signaler(x); return Promise.resolve(); }
}
function jouerEffets(scene, liste) {
  return enchainer((liste || []).map(function (e) { return function () { return jouerEffet(scene, e); }; }));
}

// ---- les objets
Effets['objet+'] = function (scene, e) { Objets.ajouter(e.id, e.sac, !e.discret); };
Effets['objet-'] = function (scene, e) { Objets.retirer(e.id, !e.discret); };
Effets.remplacer = function (scene, e) { Objets.remplacer(e.de, e.vers, e.sac); };
Effets.transfert = function (scene, e) { Objets.transferer(e.id, e.de, e.vers); };
// Métamorphose brève (les lunettes redeviennent clé d'un geste) : un frisson, puis le sac change.
Effets['eclat-court'] = function (scene, e) {
  return Transitions.frisson(scene, e.x || 600, e.y || 1000, e.r || 220).then(function () {
    Objets.remplacer(e.de, e.vers, e.sac);
  });
};
// Métamorphose en grand : l'éclat, le nom de l'objet et le fragment du livre qui la raconte.
Effets.eclat = function (scene, e) {
  var m = Objets.donnee(e.objet).metamorphose;
  return Transitions.eclat(scene, { objet: e.objet, nom: Objets.nom(e.objet), fragment: m && m.texte });
};
Effets.fiche = function (scene, e) { return Objets.presenter(e.objet); };
Effets.frisson = function (scene, e) { return Transitions.frisson(scene, e.x || 600, e.y || 900, e.r || 220); };

// ---- les portes et la magie
Effets.porte = function (scene, e) { return Carnet.allumer(e.id); };
Effets.desenchantement = function (scene) {
  Objets.vider(['cle', 'lunettes', 'binocles']);
  scene.classList.add('sans-magie');
  html.classList.add('sans-magie-page');
  return Carnet.eteindre().then(function () { Objets.majBoutons(false); });
};

// ---- le décor et la caméra
Effets.decor = function (scene, e) { return Visuels.plan(scene, e.i || 0, e); };
Effets.camera = function (scene, e) { return Visuels.camera(scene, e); };
Effets.avance = function (scene, e) { return Visuels.camera(scene, { avance: e.avance || 1.12, vers: e.vers, duree: e.duree || 2600 }); };
Effets.flou = function (scene, e) {
  var d = $('.decor', scene);
  if (d) { d.style.transition = 'filter ' + (calme ? 200 : 900) + 'ms'; d.style.filter = 'blur(' + (e.force || 8) + 'px)'; }
};
Effets.net = function (scene) {
  var d = $('.decor', scene);
  if (d) { d.style.filter = ''; }
  Son.filtre(null);
};
Effets.eblouir = function (scene) {
  var f = el('div', { 'class': 'lumiere-flot ui', style: 'opacity:.75;transition:opacity 3s ease-out;' }, scene);
  requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.opacity = '0'; }); });
  setTimeout(function () { retirer(f); }, 3200);
};
Effets.poussiere = function (scene, e) {
  var p = scene.poussiere || (scene.poussiere = Visuels.Poussiere(scene, e));
  p.bouffee(e.x, e.y);
};
Effets.filantes = function (scene) {
  var ciel = scene.etoiles;
  if (!ciel) return;
  ciel.filer(150, 140, 0.42, 19, 300);
  ciel.filer(80, 110, 0.42, 21, 900);
  ciel.filer(640, 90, 0.62, 17, 2400);
};
Effets.aube = function (scene) {
  var a = scene.aube;
  if (a) a.style.opacity = '1';
  if (scene.etoiles) scene.etoiles.eclat(0.35);
};
// L'appel de Darshan à son père (« Papa, où es-tu ? ») : la voix intérieure s'éclaire, la quinte
// à vide sonne, sans réponse (arbitrage 1).
Effets.voix = function (scene) {
  scene.classList.add('appel-au-pere');
  if (scene.etoiles) scene.etoiles.eclat(0.95);
  Son.effet('appel');
};

// ---- le son
Effets.son = function (scene, e) { Son.effet(e.son || e.id, e); };
Effets.vibre = function () { Son.effet('vibre'); };
Effets.jour = function () { Son.effet('jour'); };
Effets.assourdi = function () { Son.filtre('assourdi'); };
Effets.silence = function () { Son.ambiance('silence'); };
Effets.ambiance = function (scene, e) { Son.ambiance(e.id || e.son); };
Effets.couche = function (scene, e) { Son.couche(e.id, e.oui !== false, e); };
// les couches par leur nom (oui: false les arrête)
function couche(nom, e) { Son.couche(nom, e.oui !== false, e); }
Effets.tele = function (scene, e) { couche('tele', e); };
Effets.pluie = function (scene, e) { couche('pluie', e); };
Effets.vibration = function (scene, e) { couche('vibration', e); };
Effets.feu = function (scene, e) { couche('feu', e); };
Effets.battements = function (scene, e) { couche('battements', e); };
Effets.melodie = function (scene, e) { couche('melodie', e); };
