  // ---------------------------------------------------------------- les dessins des objets
  /* Le gros plan de chaque objet, en SVG : une chaîne par objet (et par état quand le livre
     en demande un), vue de trois quarts, posée, comme photographiée en studio, avec une ombre
     discrète. Chez Darshan, l'encre et le lavis d'aquarelle ; chez Julie (porteur « julie »
     dans objets.ini), le monde photographié : un dessin net, sans lavis.

     Où ils paraissent : la fiche (environ 800 px de large), la liste des objets, l'icône du
     bandeau « Nouvel objet » (environ 130 × 70 px), l'éclat d'une métamorphose et l'envol vers
     le bouton « Objets ». Chaque dessin est du SVG 1.1 valide en XML (il sert aussi dans
     l'EPUB, en XHTML), sans texte, sans police, sans image ni lien externe, sans script ;
     viewBox centré sur l'objet et deux fois plus large que haut ou davantage (la fiche le
     montre à 70 % de sa largeur, sous une hauteur fixe). Les identifiants internes commencent
     par « f- » : dessin() les rend uniques à chaque copie.

     Rien n'y contredit le livre : chaque commentaire dit ce que le dessin reprend du texte ou
     des traitements (docs/darshan-mise-en-scene/) ; le reste est choisi sobre et plausible.
     Aucune écriture n'est lisible : la lettre et le ticket n'ont que des traits.

     Les dix-sept objets d'objets.ini ont chacun leur dessin, sous le même nom. Les états que
     les traitements demandent ont le leur, sous le nom de l'objet suivi de l'état :
       cle-placard     la clé de laiton un peu oxydé du placard (6.13) : la fiche de la clé
                       change de dessin sur le frisson de 6.13, et la porte du placard la
                       montre au carnet ; en 7.8, c'est de nouveau la clé du pigeonnier ;
       lettre-pliee    la déclaration pliée, glissée sous la porte (7.8), puis serrée dans la
                       main de Julie (7.9) ;
       paquet-darshan  le paquet que porte Darshan (7.9 à 7.11) : le même dessin que « paquet ».
     Planche de contrôle : planche-objets.js (captures/planche-objets.png). */
  var DESSINS = {
    // Les lunettes fumées (chapitre 1) : le dessin du prototype, tel quel ; verres fumés ronds,
    // monture brune, branches ouvertes. Affinage : une ombre discrète.
    lunettes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-345 -125 690 250"><defs>' +
      '<radialGradient id="f-verre" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#8a7358"/>' +
      '<stop offset=".45" stop-color="#2a1e14"/><stop offset="1" stop-color="#0a0705"/></radialGradient>' +
      '<radialGradient id="f-ombre"><stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="0" cy="100" rx="250" ry="15" fill="url(#f-ombre)"/>' +
      '<path d="M178,-14 C235,-22 292,-42 332,-74" fill="none" stroke="#3b2a1a" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M-178,-14 C-235,-22 -292,-42 -332,-74" fill="none" stroke="#3b2a1a" stroke-width="13" stroke-linecap="round"/>' +
      '<circle cx="-105" cy="0" r="78" fill="url(#f-verre)" stroke="#4a3522" stroke-width="15"/>' +
      '<circle cx="105" cy="0" r="78" fill="url(#f-verre)" stroke="#4a3522" stroke-width="15"/>' +
      '<path d="M-32,-12 Q0,-42 32,-12" fill="none" stroke="#4a3522" stroke-width="13"/>' +
      '<ellipse cx="-135" cy="-32" rx="30" ry="11" fill="#fff" opacity=".3" transform="rotate(-20 -135 -32)"/>' +
      '<ellipse cx="75" cy="-32" rx="30" ry="11" fill="#fff" opacity=".22" transform="rotate(-20 75 -32)"/>' +
      '</svg>',
    // Les binocles (chapitre 6) : « binocles ronds pincés au bout de fines tiges grises qui
    // rejoignent ses oreilles » : petits verres ronds et clairs, monture et tiges d'acier gris,
    // bouts recourbés pour l'oreille, plaquettes pincées sur le nez.
    binocles: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="f-verre" cx="34%" cy="28%" r="80%">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.5"/>' +
      '<stop offset="0.5" stop-color="#e3ecf8" stop-opacity="0.08"/>' +
      '<stop offset="1" stop-color="#b3c6e0" stop-opacity="0.32"/></radialGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="5" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="0" cy="86" rx="205" ry="16" fill="url(#f-ombre)"/>' +
      '<g filter="url(#f-lavis)" fill="none" stroke="#8f99a6" stroke-opacity=".6" stroke-linecap="round">' +
      '<circle cx="-88" cy="0" r="60" stroke-width="18"/><circle cx="88" cy="0" r="60" stroke-width="18"/>' +
      '<path d="M-146,-10C-163,-44 -184,-80 -197,-104C-205,-121 -195,-133 -181,-126M146,-10C163,-44 185,-82' +
      ' 198,-106C206,-122 195,-133 181,-126" stroke-width="12"/></g><g fill="none" stroke-linecap="round">' +
      '<path d="M-146,-10C-163,-44 -184,-80 -197,-104C-205,-121 -195,-133 -181,-126M146,-10C163,-44 185,-82' +
      ' 198,-106C206,-122 195,-133 181,-126" stroke="#262a31" stroke-width="9"/>' +
      '<path d="M-146,-10C-163,-44 -184,-80 -197,-104C-205,-121 -195,-133 -181,-126M146,-10C163,-44 185,-82' +
      ' 198,-106C206,-122 195,-133 181,-126" stroke="#c9cfd7" stroke-width="4"/></g>' +
      '<circle cx="-88" cy="0" r="60" fill="url(#f-verre)" stroke="#262a31" stroke-width="11"/>' +
      '<circle cx="-88" cy="0" r="60" fill="none" stroke="#c9cfd7" stroke-width="4.5"/>' +
      '<circle cx="88" cy="0" r="60" fill="url(#f-verre)" stroke="#262a31" stroke-width="11"/>' +
      '<circle cx="88" cy="0" r="60" fill="none" stroke="#c9cfd7" stroke-width="4.5"/>' +
      '<path d="M-30,-6Q0,-32 30,-6" fill="none" stroke="#262a31" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M-30,-6Q0,-32 30,-6M-24,4q-6,14 4,20M24,4q6,14 -4,20" fill="none" stroke="#c9cfd7" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-124,-20Q-113,-44 -86,-49M52,-20Q63,-44 90,-49" fill="none" stroke="#fff"' +
      ' stroke-opacity=".85" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M-60,34q10,-6 14,-16M116,34q10,-6 14,-16" fill="none" stroke="#fff" stroke-opacity=".5"' +
      ' stroke-width="4" stroke-linecap="round"/></svg>',
    // La clé (chapitres 1, 3, 6, 7) : le dessin du prototype, tel quel ; « une clé au format pincé
    // », fine, « assortie aux grillages par ses rayures et sa rouille ». Affinage : une ombre et un
    // reflet discrets.
    cle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-230 -110 490 220"><defs>' +
      '<linearGradient id="f-laiton" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eac47d"/>' +
      '<stop offset=".5" stop-color="#a8742f"/><stop offset="1" stop-color="#5b3814"/></linearGradient>' +
      '<pattern id="f-rayures" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">' +
      '<rect width="14" height="14" fill="url(#f-laiton)"/>' +
      '<rect width="5" height="14" fill="#6d3f17" opacity=".55"/></pattern>' +
      '<filter id="f-rouille" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="2" seed="4" result="r"/>' +
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 .55  0 0 0 0 .25  0 0 0 0 .08  0 0 0 1.6 -.6" result="rr"/>' +
      '<feComposite in="rr" in2="SourceGraphic" operator="in" result="rrr"/><feMerge>' +
      '<feMergeNode in="SourceGraphic"/><feMergeNode in="rrr"/></feMerge></filter><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="10" cy="86" rx="215" ry="13" fill="url(#f-ombre)"/><g filter="url(#f-rouille)">' +
      '<circle cx="-150" cy="0" r="58" fill="none" stroke="url(#f-rayures)" stroke-width="30"/>' +
      '<rect x="-96" y="-12" width="330" height="24" rx="6" fill="url(#f-rayures)"/>' +
      '<rect x="170" y="10" width="22" height="46" fill="url(#f-rayures)"/>' +
      '<rect x="204" y="10" width="16" height="30" fill="url(#f-rayures)"/>' +
      '<rect x="226" y="10" width="10" height="52" fill="url(#f-rayures)"/></g>' +
      '<path d="M-86,-7 H224 M-208,-26 A62,62 0 0 1 -176,-56" fill="none" stroke="#fff4d6"' +
      ' stroke-opacity=".35" stroke-width="3.5" stroke-linecap="round"/></svg>',
    // État : la clé du placard (chapitre 6) : « une clé de laiton un peu oxydé » ; la silhouette de
    // la clé du pigeonnier, en laiton terni, vert-de-gris sur l'anneau (traitement du chapitre 6).
    'cle-placard': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-230 -110 490 220"><defs>' +
      '<linearGradient id="f-laiton" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7df97"/>' +
      '<stop offset="0.45" stop-color="#d2a64e"/><stop offset="1" stop-color="#6f4c19"/></linearGradient>' +
      '<radialGradient id="f-ombre"><stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<filter id="f-patine" x="-15%" y="-15%" width="130%" height="130%">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="12" result="b"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .5 0 0 0 0 .68 0 0 0 0 .56 0 0 0 3.6 -2.05" result="v"/>' +
      '<feComposite in="v" in2="SourceGraphic" operator="in" result="p"/><feMerge>' +
      '<feMergeNode in="SourceGraphic"/><feMergeNode in="p"/></feMerge></filter>' +
      '<filter id="f-terni" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3" result="b"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .32 0 0 0 0 .2 0 0 0 0 .07 0 0 0 3 -1.55" result="v"/>' +
      '<feComposite in="v" in2="SourceGraphic" operator="in" result="p"/><feMerge>' +
      '<feMergeNode in="SourceGraphic"/><feMergeNode in="p"/></feMerge></filter></defs>' +
      '<ellipse cx="10" cy="86" rx="215" ry="13" fill="url(#f-ombre)"/>' +
      '<g filter="url(#f-terni)" fill="url(#f-laiton)"><rect x="-96" y="-12" width="330" height="24" rx="6"/>' +
      '<rect x="170" y="10" width="22" height="46"/><rect x="204" y="10" width="16" height="30"/>' +
      '<rect x="226" y="10" width="10" height="52"/></g><g filter="url(#f-patine)">' +
      '<circle cx="-150" cy="0" r="58" fill="none" stroke="url(#f-laiton)" stroke-width="30"/></g>' +
      '<path d="M-86,-7H224M-208,-26A62,62 0 0 1 -176,-56" fill="none" stroke="#fff4d6" stroke-opacity=".5"' +
      ' stroke-width="3.5" stroke-linecap="round"/></svg>',
    // La montre (chapitre 1) : une montre de gousset d'or, comme le décor « montre » (l'encre de «
    // L'heure d'hier ») ; cadran d'émail sans chiffres, chaîne.
    montre: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="f-or" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#fbe8a8"/>' +
      '<stop offset="0.5" stop-color="#dcad4d"/><stop offset="1" stop-color="#8a5a1a"/></radialGradient>' +
      '<radialGradient id="f-email" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fffaf0"/>' +
      '<stop offset="0.75" stop-color="#f4ecd9"/><stop offset="1" stop-color="#dccfb2"/></radialGradient>' +
      '<filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="8" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="-52" cy="106" rx="190" ry="20" fill="url(#f-ombre)"/><g fill="none" stroke-linecap="round">' +
      '<path d="M-44,-108C8,-142 70,-130 96,-90C122,-50 106,-2 142,24C172,46 222,38 250,12" stroke="#4a2f12"' +
      ' stroke-width="12" stroke-dasharray="11 4"/>' +
      '<path d="M-44,-108C8,-142 70,-130 96,-90C122,-50 106,-2 142,24C172,46 222,38 250,12" stroke="#ecc766"' +
      ' stroke-width="7" stroke-dasharray="11 4"/>' +
      '<circle cx="258" cy="6" r="11" stroke="#4a2f12" stroke-width="10"/>' +
      '<circle cx="258" cy="6" r="11" stroke="#ecc766" stroke-width="5"/></g><g filter="url(#f-lavis)">' +
      '<ellipse cx="-72" cy="29" rx="112" ry="86" fill="#9a6a24"/>' +
      '<ellipse cx="-72" cy="14" rx="112" ry="86" fill="url(#f-or)" stroke="#8a5a1a" stroke-opacity=".5" stroke-width="5"/>' +
      '</g>' +
      '<rect x="-81" y="-90" width="18" height="22" rx="3" fill="#d6a647" stroke="#2e1f14" stroke-width="3"/>' +
      '<rect x="-88" y="-108" width="32" height="20" rx="6" fill="#e9c46a" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-80,-105v14M-72,-105v14M-64,-105v14" fill="none" stroke="#2e1f14" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="-72" cy="-102" rx="32" ry="20" fill="none" stroke="#2e1f14" stroke-width="11"/>' +
      '<ellipse cx="-72" cy="-102" rx="32" ry="20" fill="none" stroke="#efce78" stroke-width="5"/>' +
      '<path d="M-184,14v15a112,86 0 0 0 224,0v-15" fill="none" stroke="#2e1f14" stroke-width="3.5" stroke-linecap="round"/>' +
      '<ellipse cx="-72" cy="14" rx="112" ry="86" fill="none" stroke="#2e1f14" stroke-width="3.5"/>' +
      '<ellipse cx="-72" cy="14" rx="94" ry="72.2" fill="url(#f-email)" stroke="#2e1f14" stroke-width="3"/>' +
      '<path' +
      ' d="M-72,-52L-72,-41M-29,-43L-33,-38M2,-19L-4,-16M14,14L0,14M2,47L-4,44M-29,71L-33,66M-72,80L-72,69M-115,71L-111,66M-146,47L-140,44M-158,14L-144,14M-146,-19L-140,-16M-115,-43L-111,-38" fill="none" stroke="#2a2230" stroke-width="3.2" stroke-linecap="round"/>' +
      '<ellipse cx="-72" cy="44.7" rx="15" ry="11.5" fill="none" stroke="#6d6371" stroke-width="2"/>' +
      '<path d="M-72,45l-8,-6" fill="none" stroke="#1c2344" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M-72,14L-110,-6" fill="none" stroke="#1c2344" stroke-width="6.5" stroke-linecap="round"/>' +
      '<path d="M-72,14L-11,-13" fill="none" stroke="#1c2344" stroke-width="4.5" stroke-linecap="round"/>' +
      '<circle cx="-72" cy="14" r="5" fill="#d6a647" stroke="#1c2344" stroke-width="2"/>' +
      '<path d="M-152,-8Q-144,-44 -104,-52" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>' +
      '</svg>',
    // Le recueil de poèmes sanskrit (chapitre 3) : un vieux livre ouvert, reliure de cuir, pages
    // jaunies et vierges (aucune ligne de sanskrit inventée, comme le décor « recueil »), un
    // signet.
    recueil: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-cuir" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3a24"/>' +
      '<stop offset="1" stop-color="#3f1b10"/></linearGradient>' +
      '<linearGradient id="f-pageg" x1="0" y1="0" x2="-250" y2="0" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#c9ab76"/><stop offset="0.35" stop-color="#efdfbb"/>' +
      '<stop offset="1" stop-color="#f4e6c6"/></linearGradient>' +
      '<linearGradient id="f-paged" x1="0" y1="0" x2="250" y2="0" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#c4a46e"/><stop offset="0.35" stop-color="#ecdab4"/>' +
      '<stop offset="1" stop-color="#f2e2c0"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="21" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 .8 -.37" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="0" cy="112" rx="300" ry="24" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M-266,-100Q0,-112 266,-100L296,104Q0,92 -296,104Z" fill="url(#f-cuir)" stroke="#2a0f07"' +
      ' stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M0,-86C-40,-102 -120,-102 -246,-92L-274,92C-160,78 -62,80 0,100C62,80 160,78' +
      ' 274,92L246,-92C120,-102 40,-102 0,-86Z" fill="#d7c193"/>' +
      '<path d="M0,-92C-40,-108 -120,-108 -240,-98L-264,78C-152,64 -60,66 0,88Z" fill="url(#f-pageg)"' +
      ' stroke="#b49058" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M0,-92C40,-108 120,-108 240,-98L264,78C152,64 60,66 0,88Z" fill="url(#f-paged)"' +
      ' stroke="#b49058" stroke-opacity=".5" stroke-width="5"/></g>' +
      '<path d="M-254,-94Q0,-105 254,-94M-282,96Q0,85 282,96" fill="none" stroke="#e2bc62" stroke-width="2.5" opacity=".8"/>' +
      '<path d="M-266,-100Q0,-112 266,-100L296,104Q0,92 -296,104Z" fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M0,-92C-40,-108 -120,-108 -240,-98L-264,78C-152,64 -60,66 0,88ZM0,-92C40,-108 120,-108' +
      ' 240,-98L264,78C152,64 60,66 0,88ZM0,-92V88" fill="none" stroke="#2e1f14" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-264,78L-274,92C-160,78 -62,80 0,100C62,80 160,78 274,92L264,78M-270,86C-160,72 -62,74' +
      ' 0,94C62,74 160,72 270,86" fill="none" stroke="#6b5238" stroke-width="1.6" stroke-linecap="round"/>' +
      '<g fill="#a5793f" opacity=".22"><circle cx="-190" cy="-40" r="6"/><circle cx="-120" cy="20" r="4"/>' +
      '<circle cx="-60" cy="-62" r="5"/><circle cx="-210" cy="40" r="4"/><circle cx="150" cy="-50" r="5"/>' +
      '<circle cx="200" cy="30" r="6"/><circle cx="80" cy="40" r="4"/><circle cx="120" cy="-10" r="3"/></g>' +
      '<path d="M10,-90L24,-90L34,102L28,126L22,108L14,124L20,102Z" fill="#d49a32" stroke="#2e1f14"' +
      ' stroke-width="2.5" stroke-linejoin="round"/></svg>',
    // Les thés (chapitre 5) : « les thés les plus délicats » ; deux sacs de jute ouverts, feuilles
    // sombres, l'un de thé noir, l'autre de thé vert, une pelle de laiton (traitement du chapitre
    // 5).
    thes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<pattern id="f-jute" width="7" height="7" patternUnits="userSpaceOnUse">' +
      '<rect width="7" height="7" fill="#c89c5e"/><path d="M0,2H7M0,5H7" stroke="#e3c48e" stroke-width="1.3"/>' +
      '<path d="M2,0V7M5,0V7" stroke="#8e6636" stroke-width="1.2" opacity=".75"/></pattern>' +
      '<linearGradient id="f-volume" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.15"/>' +
      '<stop offset="0.45" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>' +
      '<linearGradient id="f-laiton" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d27e"/>' +
      '<stop offset="1" stop-color="#8a5c1c"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="33" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="0" cy="124" rx="272" ry="20" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M-198,-38C-216,4 -212,86 -186,108C-150,130 -55,126 -12,110C10,82 16,10 -2,-38Z"' +
      ' fill="url(#f-jute)" stroke="#6e4a20" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M-198,-38C-216,4 -212,86 -186,108C-150,130 -55,126 -12,110C10,82 16,10 -2,-38Z" fill="url(#f-volume)"/>' +
      '<path d="M-200,-46A100,28 0 0 1 0,-46" fill="none" stroke="#b58a4f" stroke-width="18"/>' +
      '<path d="M-188,-46C-174,-90 -110,-98 -88,-92C-30,-86 -18,-66 -12,-46A88,22 0 0 1 -188,-46Z"' +
      ' fill="#2c1f15" stroke="#140d08" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M0,-46A100,28 0 0 1 -200,-46" fill="none" stroke="#dcbd84" stroke-width="18"/></g>' +
      '<path d="M-140,-60q5,-6 11,-2M-84,-57q4,-8 8,-7M-174,-49q5,-7 10,-4M-140,-42q5,-5 11,-1M-49,-63q5,-4' +
      ' 11,2M-153,-57q4,-2 9,6M-96,-52q5,-4 11,3M-166,-52q5,-4 11,2" fill="none" stroke="#8f7a57" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-198,-38C-216,4 -212,86 -186,108C-150,130 -55,126 -12,110C10,82 16,10 -2,-38ZM-209,-46A109,36' +
      ' 0 0 0 9,-46" fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M-146,-70L-196,-118" fill="none" stroke="#2e1f14" stroke-width="11" stroke-linecap="round"/>' +
      '<path d="M-146,-70L-196,-118" fill="none" stroke="#e2b65a" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-160,-66C-150,-86 -106,-90 -92,-70C-104,-56 -146,-52 -160,-66Z" fill="url(#f-laiton)" stroke="#2e1f14" stroke-width="3"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M14,6C-4,48 0,94 26,116C54,138 134,134 168,118C190,90 196,54 178,6Z" fill="url(#f-jute)"' +
      ' stroke="#6e4a20" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M14,6C-4,48 0,94 26,116C54,138 134,134 168,118C190,90 196,54 178,6Z" fill="url(#f-volume)"/>' +
      '<path d="M12,-2A84,24 0 0 1 180,-2" fill="none" stroke="#b58a4f" stroke-width="18"/>' +
      '<path d="M24,-2C38,-46 86,-54 108,-48C150,-42 162,-22 168,-2A72,18 0 0 1 24,-2Z" fill="#3f4a1c"' +
      ' stroke="#140d08" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M180,-2A84,24 0 0 1 12,-2" fill="none" stroke="#dcbd84" stroke-width="18"/></g>' +
      '<path d="M63,0q4,-8 9,-6M121,-20q5,-7 10,-4M156,-15q5,-4 11,2M91,-20q5,-5 11,0M59,-5q4,-8' +
      ' 9,-7M64,-19q5,-7 10,-4M85,-2q5,-6 11,-2M50,-17q4,-1 8,8" fill="none" stroke="#b4c06e" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M14,6C-4,48 0,94 26,116C54,138 134,134 168,118C190,90 196,54 178,6ZM3,-2A93,32 0 0 0 189,-2"' +
      ' fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '<g stroke="#2e1f14" stroke-width="1.5">' +
      '<path d="M-24,132Q-12,127 -5,139Q-18,144 -24,132ZM-214,126Q-206,115 -194,123Q-203,133 -214,126Z" fill="#3a2a1d"/>' +
      '<path d="M0,140Q4,127 17,130Q13,143 0,140ZM214,130Q227,132 227,145Q214,143 214,130Z" fill="#56642a"/>' +
      '</g></svg>',
    // Le curcuma (chapitre 5) : un cône de poudre jaune safran sur un plateau de laiton (traitement
    // du chapitre 5), et un rhizome coupé.
    curcuma: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-laiton" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#76501a"/>' +
      '<stop offset="0.3" stop-color="#ecca77"/><stop offset="0.62" stop-color="#b98a38"/>' +
      '<stop offset="1" stop-color="#6a4713"/></linearGradient>' +
      '<linearGradient id="f-poudre" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe36a"/>' +
      '<stop offset="0.42" stop-color="#f8b90a"/><stop offset="0.8" stop-color="#d98700"/>' +
      '<stop offset="1" stop-color="#a65e00"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="17" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="0" cy="118" rx="290" ry="24" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<ellipse cx="0" cy="90" rx="262" ry="56" fill="#6e4a16"/>' +
      '<ellipse cx="0" cy="80" rx="262" ry="56" fill="url(#f-laiton)" stroke="#5a3a0e" stroke-opacity=".5" stroke-width="5"/>' +
      '<ellipse cx="0" cy="78" rx="236" ry="44" fill="#caa050"/>' +
      '<ellipse cx="-16" cy="86" rx="176" ry="30" fill="#f2b000" opacity=".6"/>' +
      '<path d="M-172,76C-142,34 -72,-76 -40,-110Q-28,-122 -16,-110C16,-76 104,34 134,76A153,34 0 0 1' +
      ' -172,76Z" fill="url(#f-poudre)" stroke="#b36a00" stroke-opacity=".5" stroke-width="5"/></g>' +
      '<path d="M-262,80A262,56 0 0 0 262,80M-262,80v10A262,56 0 0 0 262,90v-10M-262,80A262,56 0 0 1 262,80"' +
      ' fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M-172,76C-142,34 -72,-76 -40,-110Q-28,-122 -16,-110C16,-76 104,34 134,76" fill="none"' +
      ' stroke="#2e1f14" stroke-width="3" stroke-linecap="round"/>' +
      '<path' +
      ' d="M-65,-52h.1M-73,-27h.1M-33,-79h.1M47,57h.1M-87,32h.1M-64,-4h.1M-59,-62h.1M10,-56h.1M42,43h.1M-96,38h.1M-14,-40h.1M45,27h.1M-127,51h.1M2,7h.1M-78,-9h.1M-89,-14h.1M64,60h.1M-61,-2h.1M-10,55h.1M56,51h.1M-41,-9h.1M-40,6h.1M-43,-64h.1M-131,40h.1M-22,-83h.1M-24,-45h.1" fill="none" stroke="#b86c00" stroke-width="4" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M112,88C130,80 146,84 164,80C182,76 196,78 210,70M146,82C150,70 158,62 172,60M184,78C190,90' +
      ' 200,94 210,94" fill="none" stroke="#2e1f14" stroke-width="25" stroke-linecap="round"/>' +
      '<path d="M112,88C130,80 146,84 164,80C182,76 196,78 210,70" fill="none" stroke="#b8692d" stroke-width="19" stroke-linecap="round"/>' +
      '<path d="M146,82C150,70 158,62 172,60M184,78C190,90 200,94 210,94" fill="none" stroke="#b8692d"' +
      ' stroke-width="12" stroke-linecap="round"/>' +
      '<path d="M128,76q4,8 0,16M152,78q4,8 0,15M176,72q4,8 0,15M196,68q3,7 0,13" fill="none" stroke="#6b3512"' +
      ' stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="212" cy="69" rx="9" ry="10" fill="#ff9416" stroke="#2e1f14" stroke-width="2.5"/>' +
      '<ellipse cx="212" cy="69" rx="4.5" ry="5" fill="#ffc15a"/></svg>',
    // L'encens (chapitres 5 et 6) : des bâtonnets dans un pot et leur fumée, qui file comme « un
    // fil d'Ariane ».
    encens: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-laiton" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d4a17"/>' +
      '<stop offset="0.28" stop-color="#f1d27f"/><stop offset="0.6" stop-color="#c1913d"/>' +
      '<stop offset="1" stop-color="#6a4713"/></linearGradient>' +
      '<radialGradient id="f-braise" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0" stop-color="#ffd27a" stop-opacity="0.9"/>' +
      '<stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-fumee" x1="-130" y1="0" x2="292" y2="0" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#dcd5f0" stop-opacity="0.45"/>' +
      '<stop offset="1" stop-color="#dcd5f0" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="f-fil" x1="-130" y1="0" x2="292" y2="0" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.9"/>' +
      '<stop offset="0.7" stop-color="#fff" stop-opacity="0.35"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="41" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="-120" cy="134" rx="110" ry="14" fill="url(#f-ombre)"/>' +
      '<path d="M-120,-112C-126,-128 -118,-140 -100,-140C-78,-140 -76,-120 -50,-123C-22,-126 -22,-147' +
      ' 8,-143C36,-139 40,-122 72,-127C106,-133 118,-147 150,-139C178,-132 190,-118 222,-125C248,-131 264,-143' +
      ' 294,-136" fill="none" stroke="url(#f-fumee)" stroke-width="16" stroke-linecap="round"/>' +
      '<path d="M-120,-112C-126,-128 -118,-140 -100,-140C-78,-140 -76,-120 -50,-123C-22,-126 -22,-147' +
      ' 8,-143C36,-139 40,-122 72,-127C106,-133 118,-147 150,-139C178,-132 190,-118 222,-125C248,-131 264,-143' +
      ' 294,-136" fill="none" stroke="url(#f-fil)" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M-168,-92C-178,-110 -160,-122 -140,-126C-128,-128 -124,-134 -118,-139M-74,-96C-66,-112' +
      ' -84,-120 -98,-131" fill="none" stroke="#f3effc" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M-136,60L-168,-88M-120,62L-120,-110M-104,59L-74,-92" fill="none" stroke="#2e1f14" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M-136,60L-168,-88M-120,62L-120,-110M-104,59L-74,-92" fill="none" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-168,-88L-166,-78M-120,-110L-120,-98M-74,-92L-76,-81" stroke="#bdb6ad" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="-168" cy="-88" r="15" fill="url(#f-braise)"/>' +
      '<circle cx="-168" cy="-88" r="4" fill="#fff0c2"/>' +
      '<circle cx="-120" cy="-110" r="15" fill="url(#f-braise)"/>' +
      '<circle cx="-120" cy="-110" r="4" fill="#fff0c2"/>' +
      '<circle cx="-74" cy="-92" r="15" fill="url(#f-braise)"/><circle cx="-74" cy="-92" r="4" fill="#fff0c2"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M-198,62C-196,120 -156,132 -120,132C-84,132 -44,120 -42,62Z" fill="url(#f-laiton)"' +
      ' stroke="#5a3a0e" stroke-opacity=".5" stroke-width="5"/>' +
      '<ellipse cx="-120" cy="62" rx="78" ry="18" fill="#a57a2f"/>' +
      '<ellipse cx="-120" cy="63" rx="68" ry="13" fill="#dccdb2"/></g>' +
      '<path d="M-198,62C-196,120 -156,132 -120,132C-84,132 -44,120 -42,62" fill="none" stroke="#2e1f14"' +
      ' stroke-width="3.2" stroke-linecap="round"/>' +
      '<ellipse cx="-120" cy="62" rx="78" ry="18" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-190,88Q-120,106 -50,88" fill="none" stroke="#6a4713" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M-136,60l0,-10M-120,62l0,-10M-104,59l0,-10" fill="none" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '</svg>',
    // Les jarres (chapitre 5) : trois terres cuites de tailles différentes (traitement du chapitre
    // 5).
    jarres: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="f-terre" cx="32%" cy="34%" r="75%"><stop offset="0" stop-color="#f0ae7c"/>' +
      '<stop offset="0.45" stop-color="#cc6a3c"/><stop offset="0.85" stop-color="#8c3b1c"/>' +
      '<stop offset="1" stop-color="#5e2410"/></radialGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="27" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="-118" cy="124" rx="120" ry="14" fill="url(#f-ombre)"/>' +
      '<ellipse cx="40" cy="114" rx="80" ry="11" fill="url(#f-ombre)"/>' +
      '<ellipse cx="190" cy="138" rx="84" ry="11" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M6,-70C10,-62 16,-58 16,-52C4,-42 -26,-16 -26,32C-26,78 -2,104 16,110L64,110C82,104 106,78' +
      ' 106,32C106,-16 76,-42 64,-52C64,-58 70,-62 74,-70Z" fill="url(#f-terre)" stroke="#5a200c" stroke-opacity=".5" stroke-width="5"/>' +
      '<ellipse cx="40" cy="-70" rx="36" ry="9" fill="#d98a5a"/>' +
      '<ellipse cx="40" cy="-69" rx="27" ry="5" fill="#3a170b"/></g>' +
      '<path d="M6,-70C10,-62 16,-58 16,-52C4,-42 -26,-16 -26,32C-26,78 -2,104 16,110L64,110C82,104 106,78' +
      ' 106,32C106,-16 76,-42 64,-52C64,-58 70,-62 74,-70Z" fill="none" stroke="#2e1f14" stroke-width="3.4" stroke-linecap="round"/>' +
      '<ellipse cx="40" cy="-70" rx="36" ry="9" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M-170,-110C-162,-100 -156,-94 -156,-88C-172,-78 -218,-50 -218,12C-218,78 -180,112' +
      ' -150,120L-86,120C-56,112 -18,78 -18,12C-18,-50 -64,-78 -80,-88C-80,-94 -74,-100 -66,-110Z"' +
      ' fill="url(#f-terre)" stroke="#5a200c" stroke-opacity=".5" stroke-width="5"/>' +
      '<ellipse cx="-118" cy="-110" rx="54" ry="13" fill="#d98a5a"/>' +
      '<ellipse cx="-118" cy="-109" rx="45" ry="9" fill="#3a170b"/></g>' +
      '<path d="M-170,-110C-162,-100 -156,-94 -156,-88C-172,-78 -218,-50 -218,12C-218,78 -180,112' +
      ' -150,120L-86,120C-56,112 -18,78 -18,12C-18,-50 -64,-78 -80,-88C-80,-94 -74,-100 -66,-110Z" fill="none"' +
      ' stroke="#2e1f14" stroke-width="3.4" stroke-linecap="round"/>' +
      '<ellipse cx="-118" cy="-110" rx="54" ry="13" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M150,42C142,54 126,68 126,94C126,118 142,130 158,134L222,134C238,130 254,118 254,94C254,68' +
      ' 238,54 230,42Z" fill="url(#f-terre)" stroke="#5a200c" stroke-opacity=".5" stroke-width="5"/>' +
      '<ellipse cx="190" cy="42" rx="42" ry="11" fill="#d98a5a"/>' +
      '<ellipse cx="190" cy="43" rx="33" ry="7" fill="#3a170b"/></g>' +
      '<path d="M150,42C142,54 126,68 126,94C126,118 142,130 158,134L222,134C238,130 254,118 254,94C254,68' +
      ' 238,54 230,42Z" fill="none" stroke="#2e1f14" stroke-width="3.4" stroke-linecap="round"/>' +
      '<ellipse cx="190" cy="42" rx="42" ry="11" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-208,-40Q-118,-18 -28,-40M-214,-22Q-118,0 -22,-22M132,78Q190,92 248,78" fill="none"' +
      ' stroke="#f6dfc2" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M-206,-31q9,-7 18,0t18,0t18,0t18,0t18,0t18,0t18,0t18,0t18,0t18,0" fill="none" stroke="#f6dfc2"' +
      ' stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M-24,22Q40,40 104,22" fill="none" stroke="#5a2410" stroke-width="6" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M-196,-8C-198,30 -186,62 -168,84M-10,-6C-12,20 -6,44 4,62M140,80C138,96 142,108 150,116"' +
      ' fill="none" stroke="#ffd8b4" stroke-width="5" stroke-linecap="round" opacity=".5"/></svg>',
    // Les tapisseries (chapitre 5) : « aux couleurs chatoyantes » ; l'une à demi déroulée, zigzags
    // et paillettes (d'après la couverture tissée de la photo 35104311, traitement du chapitre 5),
    // l'autre roulée derrière.
    tapisseries: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-ombrage" x1="-238.1" y1="-27.1" x2="-196.6" y2="-51.2" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#000" stop-opacity="0.5"/>' +
      '<stop offset="0.45" stop-color="#fff" stop-opacity="0.2"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="19" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="40" cy="112" rx="280" ry="22" fill="url(#f-ombre)"/>' +
      '<ellipse cx="0" cy="-40" rx="200" ry="14" fill="url(#f-ombre)" opacity="0.7"/>' +
      '<path d="M-156,-53L164,-75" stroke="#6d3f86" stroke-width="42"/>' +
      '<path d="M-156,-53L164,-75" stroke="#e0b24a" stroke-width="42" stroke-dasharray="8 20"/>' +
      '<path d="M-156,-41L164,-63" stroke="#000" stroke-opacity=".3" stroke-width="16"/>' +
      '<path d="M-156,-74L164,-96A10,21 0 0 1 164,-54L-156,-32" fill="none" stroke="#2e1f14" stroke-width="3" stroke-linecap="round"/>' +
      '<g transform="matrix(.36 .62 0 1 -156 -52.9)">' +
      '<circle r="18" fill="#e8cfa0" stroke="#2e1f14" stroke-width="4"/>' +
      '<path d="M0,0a3,3 0 0 1 6,0a6,6 0 0 1 -12,0a9,9 0 0 1 18,0a12,12 0 0 1 -24,0" fill="none"' +
      ' stroke="#6d3f86" stroke-width="3" stroke-linecap="round"/></g><g transform="matrix(1 -.1 .4 .6 10 18)">' +
      '<g filter="url(#f-lavis)">' +
      '<rect x="-176" y="-76" width="412" height="152" fill="#e6a23c" stroke="#9a5e10" stroke-opacity=".5" stroke-width="5"/>' +
      '</g><path d="M-176,-67H236M-176,67H236" stroke="#34508e" stroke-width="18"/>' +
      '<path d="M-176,-45 -155,-27 -135,-45 -114,-27 -94,-45 -73,-27 -52,-45 -32,-27 -11,-45 9,-27 30,-45' +
      ' 51,-27 71,-45 92,-27 112,-45 133,-27 154,-45 174,-27 195,-45 215,-27 236,-45M-176,27 -155,45 -135,27' +
      ' -114,45 -94,27 -73,45 -52,27 -32,45 -11,27 9,45 30,27 51,45 71,27 92,45 112,27 133,45 154,27 174,45' +
      ' 195,27 215,45 236,27" fill="none" stroke="#d77b8f" stroke-width="12"/>' +
      '<path d="M-176,-13 -155,13 -135,-13 -114,13 -94,-13 -73,13 -52,-13 -32,13 -11,-13 9,13 30,-13 51,13' +
      ' 71,-13 92,13 112,-13 133,13 154,-13 174,13 195,-13 215,13 236,-13" fill="none" stroke="#3aa39e" stroke-width="15"/>' +
      '<g fill="#ffe7a0" stroke="#a8781f" stroke-width="1"><circle cx="-155.4" cy="20" r="3.6"/>' +
      '<circle cx="-134.8" cy="-20" r="3.6"/><circle cx="-73" cy="20" r="3.6"/>' +
      '<circle cx="-52.4" cy="-20" r="3.6"/><circle cx="9.4" cy="20" r="3.6"/>' +
      '<circle cx="30" cy="-20" r="3.6"/><circle cx="91.8" cy="20" r="3.6"/>' +
      '<circle cx="112.4" cy="-20" r="3.6"/><circle cx="174.2" cy="20" r="3.6"/>' +
      '<circle cx="194.8" cy="-20" r="3.6"/></g>' +
      '<path d="M243,-74V74" stroke="#f3e3c3" stroke-width="14" stroke-dasharray="2.5 5"/>' +
      '<path d="M-176,-76H236V76H-176" fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '</g><polygon points="-197,-51 -142,43 -183,67 -238,-27" fill="#e6a23c"/>' +
      '<path d="M-193,-46L-235,-22" stroke="#34508e" stroke-width="11"/>' +
      '<path d="M-145,38L-187,62" stroke="#34508e" stroke-width="11"/>' +
      '<path d="M-182,-26L-224,-2" stroke="#d77b8f" stroke-width="8"/>' +
      '<path d="M-156,18L-198,42" stroke="#d77b8f" stroke-width="8"/>' +
      '<path d="M-169,-4L-211,20" stroke="#3aa39e" stroke-width="10"/>' +
      '<polygon points="-197,-51 -142,43 -183,67 -238,-27" fill="url(#f-ombrage)"/>' +
      '<path d="M-197,-51L-142,43M-238,-27L-183,67" fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '<circle cx="-162.6" cy="55.1" r="24" fill="#f0c46a" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-163,55a4,4 0 0 1 8,0a8,8 0 0 1 -16,0a12,12 0 0 1 24,0a16,16 0 0 1 -32,0a20,20 0 0 1 40,0"' +
      ' fill="none" stroke="#34508e" stroke-width="2.4" stroke-linecap="round"/></svg>',
    // Les confettis (chapitre 5) : « un paquet de confettis » ; le paquet reste fermé, trois
    // confettis s'en échappent, rose, menthe et citron (traitement du chapitre 5).
    confettis: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-kraft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4c28c"/>' +
      '<stop offset="1" stop-color="#b3874f"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="9" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="-10" cy="126" rx="150" ry="14" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M78,-46L108,-34C114,14 112,70 102,108L72,118C82,70 84,12 78,-46Z" fill="#9c7040"' +
      ' stroke="#5a3d1c" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M-118,-40C-128,14 -128,76 -114,122C-50,130 20,128 72,118C82,70 84,12 78,-46C20,-38 -60,-36' +
      ' -118,-40Z" fill="url(#f-kraft)" stroke="#7a5428" stroke-opacity=".5" stroke-width="5"/>' +
      '<path d="M-122,-40C-60,-36 20,-38 80,-46L78,-78C20,-70 -60,-68 -120,-72Z" fill="#cfa46b"' +
      ' stroke="#7a5428" stroke-opacity=".5" stroke-width="5"/></g>' +
      '<path d="M-118,-40C-128,14 -128,76 -114,122C-50,130 20,128 72,118C82,70 84,12 78,-46C20,-38 -60,-36' +
      ' -118,-40ZM78,-46L108,-34C114,14 112,70 102,108L72,118C82,70 84,12 78,-46ZM-122,-40C-60,-36 20,-38' +
      ' 80,-46L78,-78C20,-70 -60,-68 -120,-72Z" fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M-121,-56C-60,-52 20,-54 79,-62M88,-40L98,-8" fill="none" stroke="#6b4a24" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M-110,20q6,30 0,60M60,10q8,40 0,80" fill="none" stroke="#7a5428" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>' +
      '<rect x="-88" y="-10" width="130" height="104" rx="18" fill="#fbf4ea" stroke="#2e1f14" stroke-width="2.5"/>' +
      '<g stroke="#8a7a70" stroke-width=".8"><circle cx="-41.7" cy="14.1" r="7" fill="#f6c1cf"/>' +
      '<circle cx="-68.3" cy="44.9" r="6.1" fill="#bfe8d6"/>' +
      '<circle cx="-69.9" cy="42.6" r="5.1" fill="#f7e6a1"/><circle cx="-30" cy="7.6" r="5.3" fill="#f6c1cf"/>' +
      '<circle cx="-31" cy="68.1" r="5.4" fill="#bfe8d6"/><circle cx="-52.3" cy="52.2" r="7.8" fill="#f7e6a1"/>' +
      '<circle cx="-14.8" cy="33.7" r="7.9" fill="#f6c1cf"/>' +
      '<circle cx="-71.1" cy="70.7" r="5.9" fill="#bfe8d6"/>' +
      '<circle cx="-60.7" cy="11.4" r="5.9" fill="#f7e6a1"/>' +
      '<circle cx="10.5" cy="16.5" r="6.7" fill="#f6c1cf"/><circle cx="-8.3" cy="31.8" r="6.6" fill="#bfe8d6"/>' +
      '<circle cx="-69.3" cy="6.8" r="5.6" fill="#f7e6a1"/><circle cx="-3.9" cy="36.2" r="5.9" fill="#f6c1cf"/>' +
      '<circle cx="-13.9" cy="38.3" r="5.9" fill="#bfe8d6"/><circle cx="8.2" cy="57.9" r="5.7" fill="#f7e6a1"/>' +
      '<circle cx="-15.1" cy="44" r="7.6" fill="#f6c1cf"/><circle cx="1.3" cy="25" r="7.9" fill="#bfe8d6"/>' +
      '<circle cx="-63.5" cy="35.4" r="7.3" fill="#f7e6a1"/>' +
      '<circle cx="-59.9" cy="41.1" r="5.1" fill="#f6c1cf"/>' +
      '<circle cx="-5.2" cy="63.2" r="6.7" fill="#bfe8d6"/><circle cx="16.8" cy="27.1" r="7.1" fill="#f7e6a1"/>' +
      '<circle cx="-13" cy="48.4" r="6.4" fill="#f6c1cf"/><circle cx="13" cy="77.6" r="6.4" fill="#bfe8d6"/>' +
      '<circle cx="-5.6" cy="6.9" r="7.1" fill="#f7e6a1"/><circle cx="-7.4" cy="81.4" r="7.5" fill="#f6c1cf"/>' +
      '<circle cx="-45.8" cy="32.9" r="7" fill="#bfe8d6"/></g>' +
      '<path d="M-78,2L-50,2" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>' +
      '<g stroke="#2e1f14" stroke-width="2">' +
      '<ellipse cx="60" cy="-100" rx="15" ry="10" fill="#f6c1cf" transform="rotate(-20 60 -100)"/>' +
      '<ellipse cx="104" cy="-110" rx="15" ry="10" fill="#bfe8d6" transform="rotate(62 104 -110)"/>' +
      '<ellipse cx="132" cy="-84" rx="15" ry="10" fill="#f7e6a1" transform="rotate(-32 132 -84)"/></g></svg>',
    // De quoi écrire (chapitre 7) : un porte-plume et un encrier ; « Les mots sont encrés » ;
    // l'écriture se révèle « derrière une pointe de plume » (traitement du chapitre 7).
    plume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-bois" x1="-73.3" y1="116.5" x2="-66.7" y2="135.5" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#f0cf98"/><stop offset="0.5" stop-color="#b67f40"/>' +
      '<stop offset="1" stop-color="#6e4520"/></linearGradient>' +
      '<linearGradient id="f-acier" x1="171" y1="31.1" x2="178.2" y2="51.9" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#f1f4f7"/><stop offset="0.45" stop-color="#a3abb4"/>' +
      '<stop offset="1" stop-color="#4e555d"/></linearGradient>' +
      '<linearGradient id="f-verre" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.45"/>' +
      '<stop offset="0.25" stop-color="#fff" stop-opacity="0.08"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0.25"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="15" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .02 0 0 0 0 .03 0 0 0 0 .1 0 0 0 1.3 -.62" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="-150" cy="100" rx="110" ry="16" fill="url(#f-ombre)"/>' +
      '<ellipse cx="50" cy="108" rx="170" ry="12" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<polygon points="-212,20 -102,29 -102,99 -212,90" fill="#141b42" stroke="#070a1c" stroke-opacity=".5" stroke-width="5"/>' +
      '<polygon points="-102,29 -57,-4 -57,66 -102,99" fill="#0b1030"/>' +
      '<polygon points="-203,18 -105,26 -66,-2 -164,-10" fill="#2c3a78"/></g>' +
      '<polygon points="-212,-6 -102,3 -57,-30 -167,-38" fill="#b9c6e6" opacity=".22"/>' +
      '<polygon points="-212,-6 -102,3 -102,29 -212,20" fill="#b9c6e6" opacity=".3"/>' +
      '<polygon points="-102,3 -57,-30 -57,-4 -102,29" fill="#b9c6e6" opacity=".18"/>' +
      '<polygon points="-204,2 -110,12 -110,91 -204,82" fill="url(#f-verre)"/>' +
      '<path d="M-202,8L-202,78" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M-212,90 -212,-6 -167,-38 -57,-30 -102,3' +
      ' -212,-6M-102,3L-102,99L-212,90M-102,99L-57,66L-57,-30" fill="none" stroke="#c8d4ea" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-158,-18V-34A24,8 0 0 1 -110,-34V-18A24,8 0 0 1 -158,-18Z" fill="#46557f" stroke="#c8d4ea" stroke-width="2.5"/>' +
      '<ellipse cx="-134.5" cy="-33.8" rx="24" ry="8" fill="#0b0f2a" stroke="#c8d4ea" stroke-width="2.5"/>' +
      '<path d="M-73,116L147,42L153,58L-67,136A10,10 0 0 1 -73,116Z" fill="url(#f-bois)" stroke="#2e1f14"' +
      ' stroke-width="3" stroke-linejoin="round"/>' +
      '<polygon points="147,42 172,34 177,49 153,58" fill="url(#f-acier)" stroke="#2e1f14" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M172,35Q176,28 188,25Q210,21 241,19Q215,36 195,46Q184,51 177,48Z" fill="url(#f-acier)"' +
      ' stroke="#2e1f14" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M203,32L239,19" fill="none" stroke="#2a2f36" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="202.9" cy="31.7" r="3.4" fill="#2a2f36"/>' +
      '<ellipse cx="246.7" cy="27.7" rx="10" ry="4.5" fill="#141a3c" opacity=".85"/>' +
      '<path d="M-72,121L149,46" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>' +
      '</svg>',
    // La déclaration (chapitre 7) : une feuille crème, cinq phrases à l'encre bleu nuit, chacune à
    // la ligne ; une écriture qu'on ne peut pas lire (aucun mot n'y est écrit), seulement la
    // longueur des phrases.
    lettre: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#faf0d8"/>' +
      '<stop offset="1" stop-color="#e9d6ad"/></linearGradient>' +
      '<linearGradient id="f-dos" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3e6c8"/>' +
      '<stop offset="1" stop-color="#cdb68a"/></linearGradient><filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="3" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 .3 -.12" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="0" cy="112" rx="250" ry="22" fill="url(#f-ombre)"/>' +
      '<g transform="matrix(1.22 -.2 .34 .74 0 6)"><g filter="url(#f-lavis)">' +
      '<path d="M-150,-100H150V52L104,100H-150Z" fill="url(#f-papier)" stroke="#c2a574" stroke-opacity=".5" stroke-width="5"/>' +
      '</g><path d="M-150,-100H150V52L104,100H-150Z" fill="none" stroke="#a8906a" stroke-width="1.6"/>' +
      '<path d="M-126,-70q2,-6 5,0c2,4 2,11 -1,11c-4,0 -1,-8 5,-11q4,-7 7,0M-101,-70q4,-6 7,0q2,-7 5,0q3,-7' +
      ' 6,0M-73,-70q2,-7 5,0q4,-7 7,0q4,-7 7,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q4,-6 7,0q3,-5' +
      ' 6,0M-126,-52q2,-6 5,0q2,-5 5,0q3,-5 6,0q4,-7 7,0q3,-6 6,0q4,-7 7,0M-82,-52q4,-6 7,0q3,-7 6,0q3,-5' +
      ' 6,0q2,-5 5,0q4,-6 7,0q2,-6 5,0M-39,-52q4,-7 7,0q3,-5 6,0M-126,-34q3,-6 6,0q3,-6 6,0q2,-6 5,0q3,-7' +
      ' 6,0q3,-6 6,0M-87,-34q3,-7 6,0q3,-6 6,0q3,-6 6,0q3,-7 6,0q3,-5 6,0M-48,-34q3,-5 6,0q2,-5 5,0q4,-5' +
      ' 7,0q3,-5 6,0q3,-6 6,0q3,-5 6,0M-4,-34q3,-6 6,0q4,-6 7,0c2,4 2,11 -1,11c-4,0 -1,-8 5,-11q3,-6 6,0q3,-5' +
      ' 6,0q3,-7 6,0q2,-5 5,0M44,-34q3,-6 6,0q4,-7 7,0q4,-5 7,0M73,-34q3,-7 6,0q2,-7 5,0q3,-5 6,0M98,-34q3,-7' +
      ' 6,0q3,-5 6,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q2,-7 5,0q4,-5 7,0M-126,-16q2,-6 5,0q2,-5 5,0q4,-7' +
      ' 7,0q2,-7 5,0q4,-5 7,0q4,-6 7,0M-83,-16q3,-6 6,0q3,-7 6,0c2,4 2,11 -1,11c-4,0 -1,-8 5,-11q3,-7' +
      ' 6,0M-126,2q2,-7 5,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17c2,4 2,11 -1,11c-4,0 -1,-8 5,-11q3,-6 6,0q3,-6' +
      ' 6,0q2,-6 5,0M-85,2q4,-5 7,0q2,-6 5,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17c2,-7 9,-17 5,-17c-4,0 -4,10' +
      ' 1,17q3,-5 6,0q4,-5 7,0M-40,2q3,-6 6,0q2,-6 5,0q2,-5 5,0q2,-7 5,0M-10,2q2,-5 5,0q4,-5 7,0c2,4 2,11' +
      ' -1,11c-4,0 -1,-8 5,-11M15,2q2,-6 5,0q4,-7 7,0q3,-7 6,0q4,-6 7,0M47,2q2,-6 5,0q3,-6 6,0q4,-5 7,0c2,-7' +
      ' 9,-17 5,-17c-4,0 -4,10 1,17q4,-5 7,0M86,2q4,-7 7,0q3,-7 6,0q3,-5 6,0q3,-5 6,0q4,-5 7,0q3,-5' +
      ' 6,0M-126,20q3,-7 6,0q3,-5 6,0q2,-5 5,0q3,-6 6,0M-126,38q2,-5 5,0q3,-6 6,0q3,-5 6,0q3,-5 6,0q3,-5' +
      ' 6,0M-88,38q3,-6 6,0c2,4 2,11 -1,11c-4,0 -1,-8 5,-11q3,-5 6,0q3,-7 6,0q2,-6 5,0q3,-5 6,0q3,-5' +
      ' 6,0M-39,38q2,-7 5,0q4,-7 7,0q4,-7 7,0q4,-6 7,0q4,-5 7,0M4,38q2,-5 5,0q3,-7 6,0c2,4 2,11 -1,11c-4,0' +
      ' -1,-8 5,-11q3,-6 6,0q3,-7 6,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q3,-7 6,0M52,38q3,-5 6,0q4,-5 7,0q3,-7' +
      ' 6,0q3,-7 6,0q2,-7 5,0q3,-5 6,0M96,38q3,-7 6,0q3,-5 6,0q4,-7 7,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17c2,4' +
      ' 2,11 -1,11c-4,0 -1,-8 5,-11M-126,56q3,-6 6,0q2,-6 5,0q3,-6 6,0q3,-7 6,0q2,-7 5,0M-88,56q3,-7 6,0q3,-7' +
      ' 6,0q2,-6 5,0q3,-6 6,0q4,-6 7,0q3,-6 6,0M-45,56q2,-6 5,0q4,-5 7,0q3,-5 6,0q2,-5 5,0q2,-5 5,0q3,-6' +
      ' 6,0q3,-5 6,0M4,56q3,-7 6,0q3,-7 6,0q4,-5 7,0q4,-5 7,0M38,56q2,-7 5,0q3,-7 6,0q3,-5 6,0M63,56q3,-7' +
      ' 6,0q2,-6 5,0q3,-6 6,0q3,-7 6,0q4,-5 7,0M102,56q2,-6 5,0q3,-6 6,0q4,-7 7,0q3,-7 6,0M-126,74q3,-7' +
      ' 6,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q4,-6 7,0q2,-6 5,0q3,-7 6,0M-86,74q3,-7 6,0q4,-6 7,0q2,-7 5,0c2,-7' +
      ' 9,-17 5,-17c-4,0 -4,10 1,17M-52,74q3,-5 6,0q3,-6 6,0q2,-6 5,0q4,-5 7,0q4,-5 7,0q3,-7 6,0M-8,74q3,-5' +
      ' 6,0q3,-6 6,0q2,-7 5,0q3,-6 6,0q2,-5 5,0q3,-6 6,0" fill="none" stroke="#1b2455" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M150,52L105,58L104,100Z" fill="#000" opacity=".14"/>' +
      '<path d="M150,52L102,54L104,100Z" fill="url(#f-dos)" stroke="#a8906a" stroke-width="1.2" stroke-linejoin="round"/>' +
      '</g></svg>',
    // État : la déclaration pliée (chapitre 7) : glissée sous la porte, puis « le mot serré dans sa
    // main » ; pliée en deux, on devine l'encre dessous.
    'lettre-pliee': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf2dc"/>' +
      '<stop offset="1" stop-color="#ead8b0"/></linearGradient>' +
      '<linearGradient id="f-sous" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8916a"/>' +
      '<stop offset="0.5" stop-color="#dccaa2"/><stop offset="1" stop-color="#efe0bf"/></linearGradient>' +
      '<filter id="f-lavis">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4" result="b"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="b" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="b" values="0 0 0 0 .25 0 0 0 0 .1 0 0 0 0 .02 0 0 0 .3 -.12" result="c"/>' +
      '<feComposite in="c" in2="d" operator="in" result="e"/><feMerge><feMergeNode in="d"/>' +
      '<feMergeNode in="e"/></feMerge></filter></defs>' +
      '<ellipse cx="0" cy="100" rx="240" ry="22" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<polygon points="-175,-15 126,-59 175,23 -126,67" fill="url(#f-sous)" stroke="#c2a574" stroke-opacity=".5" stroke-width="5"/>' +
      '</g>' +
      '<path d="M-112,26q2,-5 5,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q3,-6 6,0q2,-7 5,0q4,-7 7,0q3,-7 6,0q3,-5' +
      ' 6,0M-61,26q4,-6 7,0q3,-7 6,0q3,-5 6,0q3,-5 6,0M-28,26q3,-6 6,0q3,-7 6,0q4,-5 7,0q4,-7 7,0M7,26q3,-6' +
      ' 6,0q3,-7 6,0q4,-6 7,0q4,-6 7,0q3,-7 6,0M49,26q4,-6 7,0q4,-6 7,0q4,-7 7,0q2,-6 5,0M-112,41q2,-5' +
      ' 5,0q2,-6 5,0q2,-7 5,0c2,4 2,11 -1,11c-4,0 -1,-8 5,-11q3,-5 6,0q2,-5 5,0q3,-5 6,0M-66,41q2,-5 5,0q2,-6' +
      ' 5,0q3,-7 6,0M-42,41q2,-5 5,0q2,-5 5,0q2,-6 5,0q2,-6 5,0q2,-6 5,0q3,-6 6,0M-2,41q2,-5 5,0q3,-7 6,0q4,-6' +
      ' 7,0M25,41q3,-6 6,0q4,-7 7,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17M53,41q2,-5 5,0q2,-6 5,0q2,-5 5,0q4,-5' +
      ' 7,0M82,41q3,-6 6,0q3,-7 6,0q3,-5 6,0q3,-5 6,0q2,-5 5,0M-112,56q2,-5 5,0c2,-7 9,-17 5,-17c-4,0 -4,10' +
      ' 1,17q4,-6 7,0M-85,56q3,-7 6,0q4,-7 7,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q4,-7 7,0M-51,56q4,-6 7,0c2,-7' +
      ' 9,-17 5,-17c-4,0 -4,10 1,17q2,-7 5,0q3,-6 6,0c2,-7 9,-17 5,-17c-4,0 -4,10 1,17q2,-5 5,0q2,-6' +
      ' 5,0M-3,56q2,-5 5,0q3,-6 6,0" fill="none" stroke="#1b2455" stroke-width="1.7" stroke-linecap="round"' +
      ' transform="matrix(1.2 -.2 .4 .6 0 4)"/>' +
      '<polygon points="-175,-15 126,-59 175,23 -126,67" fill="none" stroke="#a8906a" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="-175,-15 126,-59 174,-4 -128,40" fill="url(#f-papier)" stroke="#a8906a" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<g transform="matrix(1.2 -.2 0.372 0.428 -24.3 -37)" fill="none" stroke-linecap="round">' +
      '<path d="M-112,30q3,-5 6,0q4,-7 7,0q3,-6 6,0M-83,30q3,-7 6,0q3,-7 6,0c2,4 2,11 -1,11c-4,0 -1,-8' +
      ' 5,-11q4,-5 7,0M-50,30q4,-5 7,0q3,-6 6,0q4,-7 7,0q4,-6 7,0M-14,30q4,-7 7,0q4,-7 7,0q2,-7 5,0q2,-5' +
      ' 5,0M18,30q4,-5 7,0q2,-5 5,0q4,-5 7,0q3,-6 6,0q3,-5 6,0q4,-5 7,0M64,30q3,-5 6,0q3,-6 6,0q3,-7 6,0q4,-6' +
      ' 7,0M-112,50q3,-6 6,0q4,-6 7,0q4,-7 7,0q3,-7 6,0q2,-7 5,0q3,-6 6,0M-66,50q2,-6 5,0q4,-7 7,0q2,-5' +
      ' 5,0q3,-7 6,0M-34,50q2,-6 5,0q3,-6 6,0q3,-6 6,0q3,-5 6,0M-2,50q3,-6 6,0q2,-6 5,0c2,-7 9,-17 5,-17c-4,0' +
      ' -4,10 1,17q2,-7 5,0q3,-6 6,0M34,50q2,-7 5,0q3,-6 6,0q3,-5 6,0q4,-6 7,0q3,-5 6,0M72,50q2,-7 5,0q4,-5' +
      ' 7,0q3,-6 6,0q4,-7 7,0M-112,70q3,-6 6,0q3,-7 6,0q2,-7 5,0q4,-7 7,0q3,-7 6,0q3,-5 6,0M-68,70q3,-5' +
      ' 6,0q2,-7 5,0q4,-6 7,0q3,-5 6,0M-36,70q3,-6 6,0q4,-7 7,0q3,-6 6,0q3,-6 6,0M-4,70q3,-5 6,0q3,-6 6,0q4,-6' +
      ' 7,0q3,-6 6,0" stroke="#1b2455" stroke-width="1.6" opacity=".13"/>' +
      '<path d="M-40,0L-20,128M52,0L30,128" stroke="#b79f73" stroke-width="1.3" opacity=".7"/></g>' +
      '<path d="M-175,-15L126,-59" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"/></svg>',
    // Le téléphone de Julie (chapitres 4, 5) : couché, écran allumé sur la galerie de photos ; en
    // bas, seule sur sa rangée, la vidéo à la pleine lune (traitement 5.7).
    telephone: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-coque" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4e57"/>' +
      '<stop offset="1" stop-color="#1f2126"/></linearGradient>' +
      '<linearGradient id="f-video" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c5aa0"/>' +
      '<stop offset="1" stop-color="#2f2550"/></linearGradient>' +
      '<linearGradient id="f-reflet" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.14"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="80" rx="250" ry="26" fill="url(#f-ombre)"/>' +
      '<g transform="translate(0 12) matrix(.96 -.1 .3 .62 0 -4)">' +
      '<rect x="-200" y="-95" width="400" height="190" rx="28" fill="#15161a"/></g>' +
      '<g transform="matrix(.96 -.1 .3 .62 0 -4)">' +
      '<rect x="-200" y="-95" width="400" height="190" rx="28" fill="url(#f-coque)" stroke="#a7adb7" stroke-width="2.2"/>' +
      '<rect x="-188" y="-83" width="376" height="166" rx="17" fill="#06070a"/>' +
      '<rect x="-180" y="-76" width="48" height="48" fill="#b87d4c"/>' +
      '<rect x="-128" y="-76" width="48" height="48" fill="#e2a8c2"/>' +
      '<rect x="-76" y="-76" width="48" height="48" fill="#d9b46a"/>' +
      '<rect x="-24" y="-76" width="48" height="48" fill="#a9c7de"/>' +
      '<rect x="28" y="-76" width="48" height="48" fill="#6b7a8c"/>' +
      '<rect x="80" y="-76" width="48" height="48" fill="#3f7280"/>' +
      '<rect x="132" y="-76" width="48" height="48" fill="#8fa6b8"/>' +
      '<rect x="-180" y="-24" width="48" height="48" fill="#c98f5f"/>' +
      '<rect x="-128" y="-24" width="48" height="48" fill="#58704f"/>' +
      '<rect x="-76" y="-24" width="48" height="48" fill="#e6cfab"/>' +
      '<rect x="-24" y="-24" width="48" height="48" fill="#9a6f8f"/>' +
      '<rect x="28" y="-24" width="48" height="48" fill="#4f5f7a"/>' +
      '<rect x="80" y="-24" width="48" height="48" fill="#caa46e"/>' +
      '<rect x="132" y="-24" width="48" height="48" fill="#7f93a8"/>' +
      '<rect x="-180" y="28" width="48" height="48" fill="url(#f-video)"/>' +
      '<circle cx="-148" cy="44" r="8" fill="#f4ecd0"/><path d="M-174,62l0,10l9,-5Z" fill="#fff"/>' +
      '<path d="M-100,-83H10L-70,83H-180Z" fill="url(#f-reflet)"/></g></svg>',
    // Le ticket (chapitre 5) : le ticket de la pâtisserie, à talon ; l'enseigne imprimée rappelle
    // la Charlotte, « un cercle rouge de framboises cerclé de boudoirs » ; aucun chiffre ni mot.
    ticket: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf7"/>' +
      '<stop offset="1" stop-color="#e9e2d3"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="96" rx="220" ry="22" fill="url(#f-ombre)"/>' +
      '<g transform="matrix(1.12 -.2 .36 .72 0 -2)">' +
      '<path d="M-150,-70H-88A8,8 0 0 0 -72,-70H150V70H-72A8,8 0 0 0 -88,70H-150Z" fill="url(#f-papier)"' +
      ' stroke="#aea38e" stroke-width="1.8"/>' +
      '<path d="M-80,-60V60" stroke="#b3aa98" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<circle cx="-40" cy="-22" r="15" fill="#c23d61"/>' +
      '<circle cx="-40" cy="-22" r="21" fill="none" stroke="#c23d61" stroke-width="4" stroke-dasharray="4 2.6"/>' +
      '<g fill="#8e877b"><rect x="-8" y="-40" width="118" height="7" rx="3"/>' +
      '<rect x="-8" y="-26" width="84" height="7" rx="3"/><rect x="-8" y="-12" width="104" height="7" rx="3"/>' +
      '<rect x="-52" y="12" width="90" height="15" rx="4" fill="#57524b"/>' +
      '<rect x="-52" y="36" width="150" height="6" rx="3"/><rect x="-52" y="48" width="60" height="6" rx="3"/>' +
      '<rect x="-140" y="40" width="44" height="6" rx="3"/></g><g fill="#57524b">' +
      '<rect x="-140" y="-40" width="2" height="70"/><rect x="-136" y="-40" width="3" height="70"/>' +
      '<rect x="-131" y="-40" width="1.5" height="70"/><rect x="-129" y="-40" width="3" height="70"/>' +
      '<rect x="-124" y="-40" width="2" height="70"/><rect x="-119" y="-40" width="1.5" height="70"/>' +
      '<rect x="-117" y="-40" width="3" height="70"/><rect x="-112" y="-40" width="2" height="70"/>' +
      '<rect x="-108" y="-40" width="1.5" height="70"/><rect x="-105" y="-40" width="3" height="70"/>' +
      '<rect x="-100" y="-40" width="2" height="70"/><rect x="-97" y="-40" width="1.5" height="70"/></g></g>' +
      '</svg>',
    // Le paquet au ruban rouge (chapitres 6, 7) : une petite boîte de pâtisserie blanche, nouée
    // d'un ruban de satin vermillon ; un pan du nœud « vacille au vent ».
    paquet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-dessus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf8"/>' +
      '<stop offset="1" stop-color="#ece5d8"/></linearGradient>' +
      '<linearGradient id="f-face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe9de"/>' +
      '<stop offset="1" stop-color="#d3cabb"/></linearGradient>' +
      '<linearGradient id="f-flanc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d2c9ba"/>' +
      '<stop offset="1" stop-color="#b4aa9a"/></linearGradient>' +
      '<linearGradient id="f-satin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8c1510"/>' +
      '<stop offset="0.3" stop-color="#d42a1f"/><stop offset="0.5" stop-color="#ff7a60"/>' +
      '<stop offset="0.7" stop-color="#c9251a"/><stop offset="1" stop-color="#7a100b"/></linearGradient>' +
      '<linearGradient id="f-satinv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c1510"/>' +
      '<stop offset="0.3" stop-color="#d42a1f"/><stop offset="0.5" stop-color="#ff7a60"/>' +
      '<stop offset="0.7" stop-color="#c9251a"/><stop offset="1" stop-color="#7a100b"/></linearGradient></defs>' +
      '<ellipse cx="-10" cy="110" rx="215" ry="26" fill="url(#f-ombre)"/>' +
      '<polygon points="-165,-10 55,12 55,124 -165,102" fill="url(#f-face)" stroke="#9d9282" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="55,12 125,-41 125,71 55,124" fill="url(#f-flanc)" stroke="#8f8474" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="-165,-10 55,12 125,-41 -95,-63" fill="url(#f-dessus)" stroke="#aa9f8e" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M-165,6L55,28L125,-25" fill="none" stroke="#b9af9f" stroke-width="1.6"/>' +
      '<polygon points="-136,-32 84,-10 96,-19 -124,-41" fill="url(#f-satinv)"/>' +
      '<polygon points="-67,-.2 -43,2 27,-51 3,-53" fill="url(#f-satin)"/>' +
      '<polygon points="-67,-.2 -43,2 -43,114 -67,112" fill="url(#f-satin)"/>' +
      '<polygon points="84,-10 96,-19 96,93 84,102" fill="url(#f-satin)" opacity=".85"/>' +
      '<g stroke="#6e0e0a" stroke-width="1.5">' +
      '<path d="M-20,-26C-50,-70 -112,-90 -104,-48C-98,-24 -56,-24 -20,-26Z" fill="url(#f-satin)"/>' +
      '<path d="M-20,-26C0,-76 68,-96 66,-52C62,-24 16,-22 -20,-26Z" fill="url(#f-satin)"/>' +
      '<path d="M-26,-22C-50,-6 -68,12 -72,36L-60,32L-54,44C-50,18 -36,-2 -14,-18Z" fill="url(#f-satinv)"/>' +
      '<path d="M-16,-28C30,-20 70,-50 110,-36C130,-30 148,-46 166,-56L160,-42L172,-34C150,-22 130,-12' +
      ' 108,-18C72,-30 28,-6 -16,-14Z" fill="url(#f-satinv)"/>' +
      '<ellipse cx="-20" cy="-25.6" rx="13" ry="10" fill="#c3261b"/></g>' +
      '<path d="M-90,-56Q-76,-76 -56,-66M10,-70Q34,-84 52,-70" fill="none" stroke="#ffb3a2" stroke-width="3"' +
      ' stroke-linecap="round" opacity=".8"/></svg>',
    // L'électrocardiogramme (chapitre 7) : « son appareil », l'appareil portatif de l'hôpital :
    // écran, touches, poignée, câble et électrodes, la bande de papier et son tracé.
    ecg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-dessus" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f5f7"/>' +
      '<stop offset="1" stop-color="#d7dce1"/></linearGradient>' +
      '<linearGradient id="f-face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3d8de"/>' +
      '<stop offset="1" stop-color="#b3bac2"/></linearGradient>' +
      '<linearGradient id="f-flanc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8bfc7"/>' +
      '<stop offset="1" stop-color="#98a0a9"/></linearGradient>' +
      '<pattern id="f-grille" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="matrix(1 .08 .52 -.36 0 0)">' +
      '<rect width="10" height="10" fill="#fbe1dc"/><path d="M0,0H10M0,0V10" stroke="#e9978d"/></pattern>' +
      '</defs><ellipse cx="-60" cy="86" rx="200" ry="24" fill="url(#f-ombre)"/>' +
      '<ellipse cx="180" cy="76" rx="110" ry="12" fill="url(#f-ombre)"/>' +
      '<path d="M61,29L106,-2C124,2 124,20 136,26L286,38Q308,28 300,12L255,44Q263,60 241,70L91,58C79,52 79,33' +
      ' 61,29Z" fill="url(#f-grille)" stroke="#caa39c" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path' +
      ' d="M120,42L127,43L129,39L132,43L138,44L139,46L142,21L145,52L147,44L154,45L158,40L163,46L170,46L170,46L177,47L179,43L182,47L188,48L189,50L192,25L195,56L197,48L204,49L208,44L213,50L220,50L220,50L227,51L229,47L232,51L238,52L239,54L242,29L245,60L247,52L254,53L258,48L263,54L270,54" fill="none" stroke="#1d1d22" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<polygon points="-205,-2 45,18 45,80 -205,60" fill="url(#f-face)" stroke="#8e969f" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="45,18 123,-36 123,26 45,80" fill="url(#f-flanc)" stroke="#8e969f" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="-205,-2 45,18 123,-36 -127,-56" fill="url(#f-dessus)" stroke="#8e969f" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M61,29L106,-2" stroke="#3a3f46" stroke-width="4" stroke-linecap="round"/>' +
      '<polygon points="-153,-24 1,-12 39,-38 -115,-50" fill="#0d2a25" stroke="#5d656e" stroke-width="4" stroke-linejoin="round"/>' +
      '<path' +
      ' d="M-126,-37L-119,-36L-115,-38L-114,-36L-110,-35L-110,-34L-91,-45L-108,-32L-100,-35L-95,-34L-87,-36L-87,-34L-80,-33L-78,-33L-71,-32L-67,-34L-66,-32L-62,-32L-62,-30L-43,-42L-60,-28L-52,-31L-47,-30L-39,-32L-39,-30L-32,-29L-30,-29L-23,-28L-19,-30L-18,-28L-14,-28L-14,-26L5,-38L-12,-24L-4,-27L1,-26L9,-28L9,-26L16,-25" fill="none" stroke="#49f2a0" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<g stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round">' +
      '<polygon points="-166,-6 -142,-4 -131,-11 -155,-13" fill="#5aa7a0"/>' +
      '<polygon points="-134,-4 -110,-2 -99,-9 -123,-11" fill="#c2c8cf"/>' +
      '<polygon points="-102,-1 -78,1 -67,-6 -91,-8" fill="#c2c8cf"/>' +
      '<polygon points="-70,2 -46,4 -35,-4 -59,-6" fill="#c2c8cf"/>' +
      '<polygon points="-38,4 -14,6 -3,-1 -27,-3" fill="#c2c8cf"/>' +
      '<polygon points="-6,7 18,9 29,1 5,-.5" fill="#c2c8cf"/></g>' +
      '<g fill="none" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M-87,-53l0,-20L83,-59l0,20" stroke="#8e969f" stroke-width="10"/>' +
      '<path d="M-87,-53l0,-20L83,-59l0,20" stroke="#dde1e6" stroke-width="4"/></g>' +
      '<g fill="none" stroke-linecap="round">' +
      '<path d="M-205,40C-230,60 -250,86 -214,104C-170,124 -90,124 -84,106C-78,88 -150,82 -190,96C-226,110' +
      ' -250,128 -266,120" stroke="#2f3338" stroke-width="7"/>' +
      '<path d="M-205,40C-230,60 -250,86 -214,104C-170,124 -90,124 -84,106C-78,88 -150,82 -190,96C-226,110' +
      ' -250,128 -266,120" stroke="#a3abb3" stroke-width="3.5"/></g><g stroke="#2f3338" stroke-width="2">' +
      '<rect x="-290" y="108" width="24" height="12" rx="5" fill="#3a9a5b"/>' +
      '<rect x="-284" y="126" width="24" height="12" rx="5" fill="#d8b43a"/>' +
      '<rect x="-268" y="136" width="24" height="12" rx="5" fill="#e8e8e8"/></g></svg>'
  };
  // État : le paquet de Darshan (chapitre 7) porte le nom et le ruban de celui de Julie ; le livre
  // ne dit pas si c'est le même, le dessin non plus (arbitrage 8 de la direction).
  DESSINS['paquet-darshan'] = DESSINS.paquet;

  // Une copie du dessin `id`, prête à insérer dans la page : un <svg> neuf, analysé comme du
  // XML (image/svg+xml) puis importé dans le document ; ses identifiants internes (f-…)
  // deviennent f1-…, f2-…, pour que plusieurs copies cohabitent sans se voler leurs dégradés.
  // Rend null pour un nom inconnu (ou un dessin qui ne s'analyse pas).
  function dessin(id) {
    if (!Object.prototype.hasOwnProperty.call(DESSINS, id)) return null;
    dessin.copies = (dessin.copies || 0) + 1;
    var s = DESSINS[id].replace(/f-([a-z]+)/g, 'f' + dessin.copies + '-$1');
    var svg = new DOMParser().parseFromString(s, 'image/svg+xml').documentElement;
    if (!svg || svg.nodeName !== 'svg' || svg.getElementsByTagName('parsererror').length) return null;
    return doc.importNode(svg, true);
  }
