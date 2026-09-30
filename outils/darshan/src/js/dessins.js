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
      '<radialGradient id="f-verre" cx="34%" cy="30%" r="75%">' +
      '<stop offset="0" stop-color="#f3f8ff" stop-opacity="0.6"/>' +
      '<stop offset="0.55" stop-color="#b4c7de" stop-opacity="0.2"/>' +
      '<stop offset="1" stop-color="#8198b8" stop-opacity="0.42"/></radialGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="0" cy="86" rx="205" ry="18" fill="url(#f-ombre)"/>' +
      '<ellipse cx="-80" cy="80" rx="52" ry="9" fill="#9fb6d6" opacity=".16"/>' +
      '<ellipse cx="96" cy="80" rx="52" ry="9" fill="#9fb6d6" opacity=".16"/>' +
      '<g fill="none" stroke-linecap="round">' +
      '<path d="M-146,-10 C-163,-44 -184,-80 -197,-104 C-205,-121 -195,-133 -181,-126" stroke="#2a2e36" stroke-width="10"/>' +
      '<path d="M-146,-10 C-163,-44 -184,-80 -197,-104 C-205,-121 -195,-133 -181,-126" stroke="#c5cbd3" stroke-width="4.5"/>' +
      '<path d="M146,-10 C163,-44 185,-82 198,-106 C206,-122 195,-133 181,-126" stroke="#2a2e36" stroke-width="10"/>' +
      '<path d="M146,-10 C163,-44 185,-82 198,-106 C206,-122 195,-133 181,-126" stroke="#c5cbd3" stroke-width="4.5"/>' +
      '</g><g filter="url(#f-lavis)" opacity=".5"><circle cx="-88" cy="0" r="54" fill="#a9c2e2"/>' +
      '<circle cx="88" cy="0" r="54" fill="#a9c2e2"/></g>' +
      '<circle cx="-88" cy="0" r="60" fill="url(#f-verre)" stroke="#2a2e36" stroke-width="12"/>' +
      '<circle cx="-88" cy="0" r="60" fill="none" stroke="#c5cbd3" stroke-width="5"/>' +
      '<circle cx="88" cy="0" r="60" fill="url(#f-verre)" stroke="#2a2e36" stroke-width="12"/>' +
      '<circle cx="88" cy="0" r="60" fill="none" stroke="#c5cbd3" stroke-width="5"/>' +
      '<path d="M-30,-6 Q0,-32 30,-6" fill="none" stroke="#2a2e36" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M-30,-6 Q0,-32 30,-6" fill="none" stroke="#c5cbd3" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-24,4 q-6,14 4,20 M24,4 q6,14 -4,20" fill="none" stroke="#c5cbd3" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-124,-20 Q-113,-44 -86,-49 M52,-20 Q63,-44 90,-49" fill="none" stroke="#fff"' +
      ' stroke-opacity=".8" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="-58" cy="30" r="5" fill="#fff" opacity=".55"/>' +
      '<circle cx="118" cy="30" r="5" fill="#fff" opacity=".45"/></svg>',
    // La clé (chapitres 1, 3, 7) : le dessin du prototype, tel quel ; « une clé au format pincé »,
    // fine, « assortie aux grillages par ses rayures et sa rouille ». Affinage : une ombre et un
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
      '<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="12" result="b"/>' +
      '<feColorMatrix in="b" type="matrix" values="0 0 0 0 .38  0 0 0 0 .68  0 0 0 0 .58  0 0 0 4.6 -2.2" result="v"/>' +
      '<feComposite in="v" in2="SourceGraphic" operator="in" result="p"/><feMerge>' +
      '<feMergeNode in="SourceGraphic"/><feMergeNode in="p"/></feMerge></filter>' +
      '<filter id="f-terni" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="3" result="b"/>' +
      '<feColorMatrix in="b" type="matrix" values="0 0 0 0 .32  0 0 0 0 .2  0 0 0 0 .07  0 0 0 3 -1.55" result="v"/>' +
      '<feComposite in="v" in2="SourceGraphic" operator="in" result="p"/><feMerge>' +
      '<feMergeNode in="SourceGraphic"/><feMergeNode in="p"/></feMerge></filter></defs>' +
      '<ellipse cx="10" cy="86" rx="215" ry="13" fill="url(#f-ombre)"/><g filter="url(#f-terni)">' +
      '<rect x="-96" y="-12" width="330" height="24" rx="6" fill="url(#f-laiton)"/>' +
      '<rect x="170" y="10" width="22" height="46" fill="url(#f-laiton)"/>' +
      '<rect x="204" y="10" width="16" height="30" fill="url(#f-laiton)"/>' +
      '<rect x="226" y="10" width="10" height="52" fill="url(#f-laiton)"/></g><g filter="url(#f-patine)">' +
      '<circle cx="-150" cy="0" r="58" fill="none" stroke="url(#f-laiton)" stroke-width="30"/></g>' +
      '<path d="M-86,-7 H224 M-208,-26 A62,62 0 0 1 -176,-56" fill="none" stroke="#fff4d6" stroke-opacity=".5"' +
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
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="8"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="-52" cy="106" rx="190" ry="20" fill="url(#f-ombre)"/>' +
      '<path d="M-44,-108 C8,-142 70,-130 96,-90 C122,-50 106,-2 142,24 C172,46 222,38 250,12" fill="none"' +
      ' stroke="#4a2f12" stroke-width="11" stroke-dasharray="10 4" stroke-linecap="round"/>' +
      '<path d="M-44,-108 C8,-142 70,-130 96,-90 C122,-50 106,-2 142,24 C172,46 222,38 250,12" fill="none"' +
      ' stroke="#e8c160" stroke-width="6" stroke-dasharray="10 4" stroke-linecap="round"/>' +
      '<circle cx="258" cy="6" r="11" fill="none" stroke="#4a2f12" stroke-width="9"/>' +
      '<circle cx="258" cy="6" r="11" fill="none" stroke="#e8c160" stroke-width="4.5"/>' +
      '<g filter="url(#f-lavis)"><ellipse cx="-72" cy="29" rx="112" ry="86" fill="#9a6a24"/>' +
      '<ellipse cx="-72" cy="14" rx="112" ry="86" fill="url(#f-or)"/></g>' +
      '<rect x="-81" y="-90" width="18" height="22" rx="3" fill="#d6a647" stroke="#2e1f14" stroke-width="3"/>' +
      '<rect x="-88" y="-108" width="32" height="20" rx="6" fill="#e9c46a" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-80,-105v14M-72,-105v14M-64,-105v14" fill="none" stroke="#2e1f14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="-72" cy="-102" rx="32" ry="20" fill="none" stroke="#2e1f14" stroke-width="11"/>' +
      '<ellipse cx="-72" cy="-102" rx="32" ry="20" fill="none" stroke="#efce78" stroke-width="5"/>' +
      '<path d="M-184,14 v15 a112,86 0 0 0 224,0 v-15" fill="none" stroke="#2e1f14" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="-72" cy="14" rx="112" ry="86" fill="none" stroke="#2e1f14" stroke-width="3.5"/>' +
      '<ellipse cx="-72" cy="14" rx="94" ry="72.2" fill="url(#f-email)" stroke="#2e1f14" stroke-width="3"/>' +
      '<path' +
      ' d="M-72,-52L-72,-41.3M-29,-43.2L-33,-37.9M2.5,-19L-4.5,-15.9M14,14L0,14M2.5,47L-4.5,43.9M-29,71.2L-33,65.9M-72,80L-72,69.3M-115,71.2L-111,65.9M-146.5,47L-139.5,43.9M-158,14L-144,14M-146.5,-19L-139.5,-15.9M-115,-43.2L-111,-37.9" fill="none" stroke="#2a2230" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="-72" cy="44.7" rx="15" ry="11.5" fill="none" stroke="#6d6371" stroke-width="2"/>' +
      '<path d="M-72,44.7l-8,-6" fill="none" stroke="#2a2230" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-72,14L-109.7,-6.3" fill="none" stroke="#1c2344" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-72,14L-11.4,-12.9" fill="none" stroke="#1c2344" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="-72" cy="14" r="5" fill="#d6a647" stroke="#1c2344" stroke-width="2"/>' +
      '<path d="M-152,-8 Q-144,-44 -104,-52" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>' +
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
      '<stop offset="1" stop-color="#f2e2c0"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="21"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="0" cy="112" rx="300" ry="24" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M-266,-100 Q0,-112 266,-100 L296,104 Q0,92 -296,104 Z" fill="url(#f-cuir)"/>' +
      '<path d="M0,-86 C-40,-102 -120,-102 -246,-92 L-274,92 C-160,78 -62,80 0,100 Z" fill="#d7c193"/>' +
      '<path d="M0,-86 C40,-102 120,-102 246,-92 L274,92 C160,78 62,80 0,100 Z" fill="#d2bb8c"/>' +
      '<path d="M0,-92 C-40,-108 -120,-108 -240,-98 L-264,78 C-152,64 -60,66 0,88 Z" fill="url(#f-pageg)"/>' +
      '<path d="M0,-92 C40,-108 120,-108 240,-98 L264,78 C152,64 60,66 0,88 Z" fill="url(#f-paged)"/></g>' +
      '<path d="M-254,-94 Q0,-105 254,-94 M-282,96 Q0,85 282,96" fill="none" stroke="#e2bc62" stroke-width="2.5" opacity=".8"/>' +
      '<path d="M-266,-100 Q0,-112 266,-100 L296,104 Q0,92 -296,104 Z" fill="none" stroke="#2e1f14"' +
      ' stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M0,-92 C-40,-108 -120,-108 -240,-98 L-264,78 C-152,64 -60,66 0,88 C60,66 152,64 264,78' +
      ' L240,-98 C120,-108 40,-108 0,-92 Z M0,-92 V88" fill="none" stroke="#2e1f14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-264,78 L-274,92 C-160,78 -62,80 0,100 C62,80 160,78 274,92 L264,78 M-270,86 C-160,72 -62,74' +
      ' 0,94 C62,74 160,72 270,86" fill="none" stroke="#6b5238" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="-190" cy="-40" r="6" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="-120" cy="20" r="4" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="-60" cy="-62" r="5" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="-210" cy="40" r="4" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="150" cy="-50" r="5" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="200" cy="30" r="6" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="80" cy="40" r="4" fill="#a5793f" opacity=".2"/>' +
      '<circle cx="120" cy="-10" r="3" fill="#a5793f" opacity=".2"/>' +
      '<path d="M10,-90 L24,-90 L34,102 L28,126 L22,108 L14,124 L20,102 Z" fill="#d49a32" stroke="#2e1f14" stroke-width="2.5" stroke-linejoin="round"/>' +
      '</svg>',
    // Les thés (chapitre 5) : « les thés les plus délicats » ; deux sacs de jute ouverts, feuilles
    // sombres, l'un de thé noir, l'autre de thé vert (traitement du chapitre 5).
    thes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<pattern id="f-jute" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(6)">' +
      '<rect width="7" height="7" fill="#c89c5e"/>' +
      '<path d="M0,1.5H7M0,5H7" stroke="#e3c48e" stroke-width="1.3"/>' +
      '<path d="M1.5,0V7M5,0V7" stroke="#8e6636" stroke-width="1.2" opacity=".75"/></pattern>' +
      '<linearGradient id="f-volume" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.2"/>' +
      '<stop offset="0.45" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient>' +
      '<radialGradient id="f-noir" cx="45%" cy="30%" r="70%"><stop offset="0" stop-color="#5a4430"/>' +
      '<stop offset="1" stop-color="#1d140d"/></radialGradient>' +
      '<radialGradient id="f-vert" cx="45%" cy="30%" r="70%"><stop offset="0" stop-color="#7d8c44"/>' +
      '<stop offset="1" stop-color="#323c16"/></radialGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="33"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="0" cy="122" rx="270" ry="22" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M-196,-42 C-212,12 -206,90 -180,110 C-140.0,128 -60.0,128 -20,110 C6,90 12,12 -4,-42 Z" fill="url(#f-jute)"/>' +
      '<path d="M-196,-42 C-212,12 -206,90 -180,110 C-140.0,128 -60.0,128 -20,110 C6,90 12,12 -4,-42 Z" fill="url(#f-volume)"/>' +
      '<path d="M-200,-48 A100,28 0 0 1 0,-48" fill="none" stroke="#b58a4f" stroke-width="16"/>' +
      '<path d="M-188,-48 C-166,-88 -34,-88 -12,-48 A88,22 0 0 1 -188,-48 Z" fill="url(#f-noir)"/>' +
      '<path d="M0,-48 A100,28 0 0 1 -200,-48" fill="none" stroke="#dcbd84" stroke-width="16"/></g>' +
      '<path d="M-152.4,-60.4q5.7,-2.1 11.4,3.8M-69.6,-52q6,-4.5 12,-1M-55.6,-58q5.3,-6.9' +
      ' 10.5,-5.8M-106.5,-72.6q5.2,-1 10.4,6M-33.8,-63.9q5.8,-5.4 11.7,-2.7M-60.3,-67.9q5.6,-6.3' +
      ' 11.1,-4.5M-146.1,-63.6q5.9,-3.1 11.9,1.8M-31.4,-67.7q5.1,-.9 10.2,6.2M-91.8,-47q5.6,-1.8' +
      ' 11.1,4.5M-150.3,-54.5q5.4,-6.6 10.8,-5.2M-173.2,-62.1q5.7,-2.1 11.4,3.9M-90.2,-68.2q5.5,-1.6' +
      ' 11,4.8M-38.8,-66.9q6,-4.4 12,-.7M-79.6,-46.9q5.4,-6.6 10.8,-5.2" fill="none" stroke="#b99a6a"' +
      ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M-196,-42 C-212,12 -206,90 -180,110 C-140.0,128 -60.0,128 -20,110 C6,90 12,12 -4,-42 Z"' +
      ' fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-208,-48 A108,35 0 0 0 8,-48" fill="none" stroke="#2e1f14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M16,4 C0,58 6,98 32,118 C62.4,136 129.6,136 160,118 C186,98 192,58 176,4 Z" fill="url(#f-jute)"/>' +
      '<path d="M16,4 C0,58 6,98 32,118 C62.4,136 129.6,136 160,118 C186,98 192,58 176,4 Z" fill="url(#f-volume)"/>' +
      '<path d="M12,-2 A84,24 0 0 1 180,-2" fill="none" stroke="#b58a4f" stroke-width="16"/>' +
      '<path d="M24,-2 C46,-42 146,-42 168,-2 A72,18 0 0 1 24,-2 Z" fill="url(#f-vert)"/>' +
      '<path d="M180,-2 A84,24 0 0 1 12,-2" fill="none" stroke="#dcbd84" stroke-width="16"/></g>' +
      '<path d="M81,-.8q6,-4.7 11.9,-1.5M61.9,-3.5q5.7,-2.2 11.4,3.7M119,-27.3q6,-4.7' +
      ' 11.9,-1.3M74.5,-20.3q5.9,-5.2 11.8,-2.3M70,-12.9q5,-7.3 10,-6.6M104.9,1.4q6,-4.1' +
      ' 12,-.2M74.9,-7.3q5.9,-5.1 11.8,-2.2M143.4,-1.6q5.6,-1.9 11.2,4.2M97.4,-27.2q5.2,-7' +
      ' 10.4,-6M88.8,-3.2q5.9,-4.9 11.9,-1.8M151.8,-10.3q5.4,-6.7 10.7,-5.4M102.2,1.4q5.8,-5.4' +
      ' 11.7,-2.8M134.5,-8.3q5.7,-5.8 11.5,-3.5M130.9,-22.2q6,-4.5 12,-1" fill="none" stroke="#b99a6a"' +
      ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M16,4 C0,58 6,98 32,118 C62.4,136 129.6,136 160,118 C186,98 192,58 176,4 Z" fill="none"' +
      ' stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M4,-2 A92,31 0 0 0 188,-2" fill="none" stroke="#2e1f14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M0,0 C4,-5 12,-5 16,0 C12,5 4,5 0,0 Z" fill="#3a2a1d" stroke="#2e1f14" stroke-width="1.5" transform="translate(-22 134) rotate(20)"/>' +
      '<path d="M0,0 C4,-5 12,-5 16,0 C12,5 4,5 0,0 Z" fill="#46521f" stroke="#2e1f14" stroke-width="1.5" transform="translate(0 140) rotate(-30)"/>' +
      '<path d="M0,0 C4,-5 12,-5 16,0 C12,5 4,5 0,0 Z" fill="#46521f" stroke="#2e1f14" stroke-width="1.5" transform="translate(212 134) rotate(50)"/>' +
      '<path d="M0,0 C4,-5 12,-5 16,0 C12,5 4,5 0,0 Z" fill="#3a2a1d" stroke="#2e1f14" stroke-width="1.5" transform="translate(-210 132) rotate(-10)"/>' +
      '</svg>',
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
      '<stop offset="1" stop-color="#a65e00"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="17"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="0" cy="118" rx="290" ry="24" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<ellipse cx="0" cy="90" rx="262" ry="56" fill="#6e4a16"/>' +
      '<ellipse cx="0" cy="80" rx="262" ry="56" fill="url(#f-laiton)"/>' +
      '<ellipse cx="0" cy="78" rx="236" ry="44" fill="#caa050"/>' +
      '<ellipse cx="-16" cy="86" rx="176" ry="30" fill="#f2b000" opacity=".6"/>' +
      '<path d="M-172,76 C-142,34 -72,-76 -40,-110 Q-28,-122 -16,-110 C16,-76 104,34 134,76 A153,34 0 0 1 -172,76 Z" fill="url(#f-poudre)"/>' +
      '</g>' +
      '<path d="M-262,80 A262,56 0 0 0 262,80 M-262,80 v10 A262,56 0 0 0 262,90 v-10 M-262,80 A262,56 0 0 1' +
      ' 262,80" fill="none" stroke="#2e1f14" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-172,76 C-142,34 -72,-76 -40,-110 Q-28,-122 -16,-110 C16,-76 104,34 134,76" fill="none"' +
      ' stroke="#2e1f14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path' +
      ' d="M-65.1,-52.2h.1M-72.8,-26.6h.1M-33.4,-79.4h.1M46.7,56.9h.1M-87.4,32.4h.1M-64.1,-4.1h.1M-59.1,-62.4h.1M9.8,-55.7h.1M42,42.6h.1M-96,38.1h.1M-14,-40.4h.1M45.1,27.1h.1M-127.1,50.8h.1M2.5,6.9h.1M-77.9,-9h.1M-88.6,-14.2h.1M64.2,59.5h.1M-60.8,-2.4h.1M-10.2,55.4h.1M55.7,51.2h.1M-41.4,-8.7h.1M-40.1,5.8h.1M-42.9,-64.2h.1M-130.6,40h.1M-21.6,-82.6h.1M-24.4,-45.1h.1" fill="none" stroke="#b86c00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>' +
      '<path d="M120,86 C146,78 176,82 206,70M160,80 C168,66 178,60 190,56" fill="none" stroke="#2e1f14" stroke-width="27" stroke-linecap="round"/>' +
      '<path d="M120,86 C146,78 176,82 206,70" fill="none" stroke="#b8692d" stroke-width="21" stroke-linecap="round"/>' +
      '<path d="M160,80 C168,66 178,60 190,56" fill="none" stroke="#b8692d" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M140,74 q4,8 0,16 M170,74 q4,8 0,16 M188,68 q3,7 0,14" fill="none" stroke="#6b3512"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="208" cy="69" rx="10" ry="11" fill="#ff9416" stroke="#2e1f14" stroke-width="2.5"/>' +
      '<ellipse cx="208" cy="69" rx="5" ry="6" fill="#ffc15a"/></svg>',
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
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="41"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="-120" cy="134" rx="110" ry="14" fill="url(#f-ombre)"/>' +
      '<path d="M-120,-116 C-132,-132 -124,-146 -104,-144 C-78,-142 -74,-118 -44,-120 C-12,-122 -6,-144' +
      ' 28,-142 C62,-140 66,-116 102,-118 C138,-120 144,-140 180,-138 C214,-136 222,-114 256,-116 C272,-117' +
      ' 282,-124 292,-130" fill="none" stroke="#d9d2ee" stroke-opacity=".32" stroke-width="15" stroke-linecap="round"/>' +
      '<path d="M-120,-116 C-132,-132 -124,-146 -104,-144 C-78,-142 -74,-118 -44,-120 C-12,-122 -6,-144' +
      ' 28,-142 C62,-140 66,-116 102,-118 C138,-120 144,-140 180,-138 C214,-136 222,-114 256,-116 C272,-117' +
      ' 282,-124 292,-130" fill="none" stroke="#fbf8ff" stroke-opacity=".85" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M-168,-92 C-178,-110 -160,-122 -140,-126 C-128,-128 -124,-134 -122,-140 M-74,-96 C-66,-112' +
      ' -84,-120 -96,-130" fill="none" stroke="#f3effc" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M-136,60 L-168,-88" stroke="#2e1f14" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M-136,60 L-168,-88" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-168,-88 L-165.8,-77.6" stroke="#bdb6ad" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="-168" cy="-88" r="15" fill="url(#f-braise)"/>' +
      '<circle cx="-168" cy="-88" r="4" fill="#fff0c2"/>' +
      '<path d="M-120,62 L-120,-110" stroke="#2e1f14" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M-120,62 L-120,-110" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-120,-110 L-120,-98" stroke="#bdb6ad" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="-120" cy="-110" r="15" fill="url(#f-braise)"/>' +
      '<circle cx="-120" cy="-110" r="4" fill="#fff0c2"/>' +
      '<path d="M-104,59 L-74,-92" stroke="#2e1f14" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M-104,59 L-74,-92" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-74,-92 L-76.1,-81.4" stroke="#bdb6ad" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="-74" cy="-92" r="15" fill="url(#f-braise)"/><circle cx="-74" cy="-92" r="4" fill="#fff0c2"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M-198,62 C-196,120 -156,132 -120,132 C-84,132 -44,120 -42,62 Z" fill="url(#f-laiton)"/>' +
      '<ellipse cx="-120" cy="62" rx="78" ry="18" fill="#a57a2f"/>' +
      '<ellipse cx="-120" cy="63" rx="68" ry="13" fill="#dccdb2"/></g>' +
      '<path d="M-198,62 C-196,120 -156,132 -120,132 C-84,132 -44,120 -42,62" fill="none" stroke="#2e1f14"' +
      ' stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="-120" cy="62" rx="78" ry="18" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-190,88 Q-120,106 -50,88" fill="none" stroke="#6a4713" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-136,60 l0,-10" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-120,62 l0,-10" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M-104,59 l0,-10" stroke="#8a3522" stroke-width="6" stroke-linecap="round"/></svg>',
    // Les jarres (chapitre 5) : trois terres cuites de tailles différentes (traitement du chapitre
    // 5).
    jarres: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="f-terre" cx="32%" cy="34%" r="75%"><stop offset="0" stop-color="#f0ae7c"/>' +
      '<stop offset="0.45" stop-color="#cc6a3c"/><stop offset="0.85" stop-color="#8c3b1c"/>' +
      '<stop offset="1" stop-color="#5e2410"/></radialGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="27"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="-118" cy="124" rx="120" ry="14" fill="url(#f-ombre)"/>' +
      '<ellipse cx="40" cy="114" rx="80" ry="11" fill="url(#f-ombre)"/>' +
      '<ellipse cx="190" cy="138" rx="84" ry="11" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M6,-70 C10,-62 16,-58 16,-52 C4,-42 -26,-16 -26,32 C-26,78 -2,104 16,110 L64,110 C82,104' +
      ' 106,78 106,32 C106,-16 76,-42 64,-52 C64,-58 70,-62 74,-70 Z" fill="url(#f-terre)"/>' +
      '<ellipse cx="40" cy="-70" rx="36" ry="9" fill="#d98a5a"/>' +
      '<ellipse cx="40" cy="-69" rx="27" ry="5" fill="#3a170b"/></g>' +
      '<path d="M6,-70 C10,-62 16,-58 16,-52 C4,-42 -26,-16 -26,32 C-26,78 -2,104 16,110 L64,110 C82,104' +
      ' 106,78 106,32 C106,-16 76,-42 64,-52 C64,-58 70,-62 74,-70 Z" fill="none" stroke="#2e1f14"' +
      ' stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="40" cy="-70" rx="36" ry="9" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M-170,-110 C-162,-100 -156,-94 -156,-88 C-172,-78 -218,-50 -218,12 C-218,78 -180,112 -150,120' +
      ' L-86,120 C-56,112 -18,78 -18,12 C-18,-50 -64,-78 -80,-88 C-80,-94 -74,-100 -66,-110 Z" fill="url(#f-terre)"/>' +
      '<ellipse cx="-118" cy="-110" rx="54" ry="13" fill="#d98a5a"/>' +
      '<ellipse cx="-118" cy="-109" rx="45" ry="9" fill="#3a170b"/></g>' +
      '<path d="M-170,-110 C-162,-100 -156,-94 -156,-88 C-172,-78 -218,-50 -218,12 C-218,78 -180,112 -150,120' +
      ' L-86,120 C-56,112 -18,78 -18,12 C-18,-50 -64,-78 -80,-88 C-80,-94 -74,-100 -66,-110 Z" fill="none"' +
      ' stroke="#2e1f14" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="-118" cy="-110" rx="54" ry="13" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<g filter="url(#f-lavis)">' +
      '<path d="M150,42 C142,54 126,68 126,94 C126,118 142,130 158,134 L222,134 C238,130 254,118 254,94 C254,68 238,54 230,42 Z" fill="url(#f-terre)"/>' +
      '<ellipse cx="190" cy="42" rx="42" ry="11" fill="#d98a5a"/>' +
      '<ellipse cx="190" cy="43" rx="33" ry="7" fill="#3a170b"/></g>' +
      '<path d="M150,42 C142,54 126,68 126,94 C126,118 142,130 158,134 L222,134 C238,130 254,118 254,94' +
      ' C254,68 238,54 230,42 Z" fill="none" stroke="#2e1f14" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="190" cy="42" rx="42" ry="11" fill="none" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-208,-40 Q-118,-18 -28,-40 M-214,-22 Q-118,0 -22,-22" fill="none" stroke="#f6dfc2"' +
      ' stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-206,-31 q9,-7 18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0 t18,0" fill="none"' +
      ' stroke="#f6dfc2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-24,22 Q40,40 104,22" fill="none" stroke="#5a2410" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M132,78 Q190,92 248,78" fill="none" stroke="#f6dfc2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-196,-8 C-198,30 -186,62 -168,84 M-10,-6 C-12,20 -6,44 4,62 M140,80 C138,96 142,108 150,116"' +
      ' fill="none" stroke="#ffd8b4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>' +
      '</svg>',
    // Les tapisseries (chapitre 5) : « aux couleurs chatoyantes » ; une tapisserie à demi déroulée,
    // zigzags et paillettes (d'après la couverture tissée de la photo 35104311, traitement du
    // chapitre 5).
    tapisseries: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-rouleau" x1="-214" y1="0" x2="-126" y2="0" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#000" stop-opacity="0.55"/>' +
      '<stop offset="0.45" stop-color="#fff" stop-opacity="0.18"/>' +
      '<stop offset="0.75" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="19"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="40" cy="112" rx="270" ry="22" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<polygon points="-150,-84 248,-60 252.2,-42.6 -147.1,-60.1" fill="#34508e"/>' +
      '<polygon points="-147.1,-60.1 252.2,-42.6 256,-26.5 245.5,-10.6 227.4,-27.3 216.8,-11 198.8,-28.1' +
      ' 188.1,-11.4 170.2,-29 159.4,-11.8 141.6,-29.8 130.7,-12.2 113,-30.6 102,-12.6 84.4,-31.4 73.3,-13' +
      ' 55.8,-32.2 44.6,-13.4 27.1,-33.1 16,-13.8 -1.5,-33.9 -12.7,-14.2 -30.1,-34.7 -41.4,-14.5 -58.7,-35.5' +
      ' -70.1,-14.9 -87.3,-36.4 -98.8,-15.3 -115.9,-37.2 -127.5,-15.7 -144.5,-38" fill="#e6a23c"/>' +
      '<polygon points="-144.5,-38 -127.5,-15.7 -115.9,-37.2 -98.8,-15.3 -87.3,-36.4 -70.1,-14.9 -58.7,-35.5' +
      ' -41.4,-14.5 -30.1,-34.7 -12.7,-14.2 -1.5,-33.9 16,-13.8 27.1,-33.1 44.6,-13.4 55.8,-32.2 73.3,-13' +
      ' 84.4,-31.4 102,-12.6 113,-30.6 130.7,-12.2 141.6,-29.8 159.4,-11.8 170.2,-29 188.1,-11.4 198.8,-28.1' +
      ' 216.8,-11 227.4,-27.3 245.5,-10.6 256,-26.5 262.1,-1 251.5,15.2 233.3,-1.2 222.7,15.5 204.6,-1.3' +
      ' 193.8,15.8 175.9,-1.5 165,16 147.1,-1.6 136.2,16.3 118.4,-1.8 107.4,16.6 89.6,-1.9 78.5,16.9 60.9,-2' +
      ' 49.7,17.2 32.1,-2.2 20.9,17.5 3.4,-2.3 -8,17.8 -25.3,-2.5 -36.8,18 -54.1,-2.6 -65.6,18.3 -82.8,-2.8' +
      ' -94.4,18.6 -111.6,-2.9 -123.3,18.9 -140.3,-3" fill="#d77b8f"/>' +
      '<polygon points="-140.3,-3 -123.3,18.9 -111.6,-2.9 -94.4,18.6 -82.8,-2.8 -65.6,18.3 -54.1,-2.6 -36.8,18' +
      ' -25.3,-2.5 -8,17.8 3.4,-2.3 20.9,17.5 32.1,-2.2 49.7,17.2 60.9,-2 78.5,16.9 89.6,-1.9 107.4,16.6' +
      ' 118.4,-1.8 136.2,16.3 147.1,-1.6 165,16 175.9,-1.5 193.8,15.8 204.6,-1.3 222.7,15.5 233.3,-1.2' +
      ' 251.5,15.2 262.1,-1 268.2,24.4 257.5,41 239.3,25 228.6,41.9 210.4,25.5 199.6,42.9 181.5,26 170.6,43.9' +
      ' 152.6,26.6 141.7,44.8 123.8,27.1 112.7,45.8 94.9,27.6 83.7,46.8 66,28.2 54.8,47.7 37.1,28.7 25.8,48.7' +
      ' 8.3,29.2 -3.2,49.7 -20.6,29.8 -32.1,50.6 -49.5,30.3 -61.1,51.6 -78.4,30.8 -90.1,52.6 -107.3,31.4 -119,53.5 -136.1,31.9" fill="#3aa39e"/>' +
      '<polygon points="-136.1,31.9 -119,53.5 -107.3,31.4 -90.1,52.6 -78.4,30.8 -61.1,51.6 -49.5,30.3' +
      ' -32.1,50.6 -20.6,29.8 -3.2,49.7 8.3,29.2 25.8,48.7 37.1,28.7 54.8,47.7 66,28.2 83.7,46.8 94.9,27.6' +
      ' 112.7,45.8 123.8,27.1 141.7,44.8 152.6,26.6 170.6,43.9 181.5,26 199.6,42.9 210.4,25.5 228.6,41.9' +
      ' 239.3,25 257.5,41 268.2,24.4 275.8,56.6 -130.9,76.1" fill="#e6a23c"/>' +
      '<polygon points="-130.9,76.1 275.8,56.6 280,74 -128,100" fill="#34508e"/></g>' +
      '<polygon points="-206,-78 -150,-84 -147.1,-60.1 -203.4,-53.8" fill="#34508e"/>' +
      '<polygon points="-203.4,-53.8 -147.1,-60.1 -143.2,-27 -199.8,-20.3" fill="#e6a23c"/>' +
      '<polygon points="-199.8,-20.3 -143.2,-27 -139,8 -196,15" fill="#d77b8f"/>' +
      '<polygon points="-196,15 -139,8 -134.8,43 -192.2,50.3" fill="#3aa39e"/>' +
      '<polygon points="-192.2,50.3 -134.8,43 -130.9,76.1 -188.6,83.8" fill="#e6a23c"/>' +
      '<polygon points="-188.6,83.8 -130.9,76.1 -128,100 -186,108" fill="#34508e"/>' +
      '<polygon points="-206,-78 -150,-84 -128,100 -186,108" fill="url(#f-rouleau)"/>' +
      '<ellipse cx="-157" cy="108" rx="30" ry="25" fill="#f0dcb4" stroke="#2e1f14" stroke-width="3"/>' +
      '<path d="M-154,108 L-153.8,108.7 L-153.8,109.5 L-154.2,110.3 L-154.8,111 L-155.8,111.6 L-157,112' +
      ' L-158.4,112.1 L-159.8,111.9 L-161.2,111.4 L-162.5,110.5 L-163.4,109.4 L-164,108 L-164.1,106.5' +
      ' L-163.6,104.9 L-162.7,103.5 L-161.2,102.2 L-159.2,101.3 L-157,100.8 L-154.6,100.8 L-152.2,101.3' +
      ' L-149.9,102.3 L-148.1,103.9 L-146.7,105.8 L-146,108 L-146.1,110.3 L-146.9,112.7 L-148.5,114.8' +
      ' L-150.8,116.5 L-153.7,117.8 L-157,118.4 L-160.5,118.3 L-163.8,117.5 L-166.9,115.9 L-169.4,113.7' +
      ' L-171.2,111 L-172,108 L-171.8,104.8 L-170.6,101.7 L-168.3,98.9 L-165.2,96.7 L-161.3,95.1 L-157,94.4' +
      ' L-152.5,94.6 L-148.2,95.8 L-144.3,97.8 L-141.1,100.7 L-139,104.1 L-138,108 L-138.3,112 L-140,115.9' +
      ' L-142.9,119.3 L-146.8,122.1 L-151.7,124 L-157,124.8 L-162.5,124.5 L-167.8,123 L-172.6,120.4' +
      ' L-176.3,116.9 L-178.9,112.7 L-180,108 L-179.5,103.2 L-177.5,98.5 L-174,94.4 L-169.2,91.1 L-163.4,88.9' +
      ' L-157,88 L-150.4,88.4 L-144.2,90.2 L-138.6,93.3 L-134.2,97.5 L-131.2,102.5 L-130,108" fill="none"' +
      ' stroke="#b7812f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path' +
      ' d="M250,-51.6l16,2M252,-43.2l16,2M254,-34.9l16,2M256,-26.5l16,2M258,-18.1l16,2M260,-9.8l16,2M262,-1.4l16,2M264,7l16,2M266,15.4l16,2M268,23.8l16,2M270,32.1l16,2M272,40.5l16,2M274,48.9l16,2M276,57.2l16,2M278,65.6l16,2" fill="none" stroke="#f3e3c3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-206,-78 L-150,-84 L248,-60 L280,74 L-128,100 L-186,108" fill="none" stroke="#2e1f14"' +
      ' stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-147.1,-60.1 L252.2,-42.6" fill="none" stroke="#2b2440" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
      '<path d="M-144.5,-38 L-127.5,-15.7 L-115.9,-37.2 L-98.8,-15.3 L-87.3,-36.4 L-70.1,-14.9 L-58.7,-35.5' +
      ' L-41.4,-14.5 L-30.1,-34.7 L-12.7,-14.2 L-1.5,-33.9 L16,-13.8 L27.1,-33.1 L44.6,-13.4 L55.8,-32.2' +
      ' L73.3,-13 L84.4,-31.4 L102,-12.6 L113,-30.6 L130.7,-12.2 L141.6,-29.8 L159.4,-11.8 L170.2,-29' +
      ' L188.1,-11.4 L198.8,-28.1 L216.8,-11 L227.4,-27.3 L245.5,-10.6 L256,-26.5" fill="none"' +
      ' stroke="#2b2440" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
      '<path d="M-140.3,-3 L-123.3,18.9 L-111.6,-2.9 L-94.4,18.6 L-82.8,-2.8 L-65.6,18.3 L-54.1,-2.6 L-36.8,18' +
      ' L-25.3,-2.5 L-8,17.8 L3.4,-2.3 L20.9,17.5 L32.1,-2.2 L49.7,17.2 L60.9,-2 L78.5,16.9 L89.6,-1.9' +
      ' L107.4,16.6 L118.4,-1.8 L136.2,16.3 L147.1,-1.6 L165,16 L175.9,-1.5 L193.8,15.8 L204.6,-1.3' +
      ' L222.7,15.5 L233.3,-1.2 L251.5,15.2 L262.1,-1" fill="none" stroke="#2b2440" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
      '<path d="M-136.1,31.9 L-119,53.5 L-107.3,31.4 L-90.1,52.6 L-78.4,30.8 L-61.1,51.6 L-49.5,30.3' +
      ' L-32.1,50.6 L-20.6,29.8 L-3.2,49.7 L8.3,29.2 L25.8,48.7 L37.1,28.7 L54.8,47.7 L66,28.2 L83.7,46.8' +
      ' L94.9,27.6 L112.7,45.8 L123.8,27.1 L141.7,44.8 L152.6,26.6 L170.6,43.9 L181.5,26 L199.6,42.9' +
      ' L210.4,25.5 L228.6,41.9 L239.3,25 L257.5,41 L268.2,24.4" fill="none" stroke="#2b2440"' +
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
      '<path d="M-130.9,76.1 L275.8,56.6" fill="none" stroke="#2b2440" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>' +
      '<circle cx="-111.6" cy="-2.9" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="-82.8" cy="-2.8" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="-54.1" cy="-2.6" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="-25.3" cy="-2.5" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="3.4" cy="-2.3" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="32.1" cy="-2.2" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="60.9" cy="-2" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="89.6" cy="-1.9" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="118.4" cy="-1.8" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="147.1" cy="-1.6" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="175.9" cy="-1.5" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="204.6" cy="-1.3" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/>' +
      '<circle cx="233.3" cy="-1.2" r="3.6" fill="#ffe7a0" stroke="#a8781f" stroke-width="1"/></svg>',
    // Les confettis (chapitre 5) : « un paquet de confettis » ; le paquet reste fermé, trois
    // confettis s'en échappent, rose, menthe et citron (traitement du chapitre 5).
    confettis: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-kraft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0bd88"/>' +
      '<stop offset="1" stop-color="#b88b54"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="9"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="-10" cy="128" rx="150" ry="16" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<polygon points="54,-66 98,-52 104,112 64,122" fill="#9c7040"/>' +
      '<polygon points="-128,-58 54,-66 64,122 -116,128" fill="url(#f-kraft)"/>' +
      '<polygon points="-128,-58 54,-66 55,-34 -126,-26" fill="#cfa66f"/></g>' +
      '<path d="M-128,-58 54,-66 64,122 -116,128 Z M54,-66 98,-52 104,112 64,122" fill="none" stroke="#2e1f14"' +
      ' stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-126,-26 L55,-34 L98,-22" fill="none" stroke="#2e1f14" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="-94" y="-2" width="124" height="98" rx="14" fill="#fbf4ea" stroke="#2e1f14" stroke-width="2.5" transform="skewY(-2.5)"/>' +
      '<circle cx="-50.3" cy="22" r="6.5" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-76.5" cy="53.2" r="5.6" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-78" cy="51" r="4.6" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-38.9" cy="15.2" r="4.8" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-39.9" cy="74.2" r="4.9" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-60.8" cy="59.6" r="7.3" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-24" cy="40" r="7.4" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-79.2" cy="78.4" r="5.4" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-69" cy="20.2" r="5.4" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx=".9" cy="22.1" r="6.2" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-17.6" cy="37.8" r="6.1" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-77.5" cy="16" r="5.1" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-13.2" cy="41.9" r="5.4" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-23.1" cy="44.4" r="5.4" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-1.4" cy="62.6" r="5.2" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-24.3" cy="50" r="7.1" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-8.1" cy="30.8" r="7.4" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-71.7" cy="43.8" r="6.8" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-68.2" cy="49.1" r="4.6" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-14.5" cy="68.3" r="6.2" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="7" cy="32.2" r="6.6" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-22.2" cy="54.2" r="5.9" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="3.4" cy="81.5" r="5.9" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-14.9" cy="13.4" r="6.6" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-16.7" cy="86.2" r="7" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-54.4" cy="40.5" r="6.5" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-81.7" cy="47.6" r="5" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-71.8" cy="15.7" r="6.8" fill="#f6c1cf" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="-70.5" cy="30.4" r="5.7" fill="#bfe8d6" stroke="#8a7a70" stroke-width=".8"/>' +
      '<circle cx="6.6" cy="14" r="5.8" fill="#f7e6a1" stroke="#8a7a70" stroke-width=".8"/>' +
      '<path d="M-86,6 L-60,6" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8" transform="skewY(-2.5)"/>' +
      '<ellipse cx="92" cy="-98" rx="14" ry="9" fill="#f6c1cf" stroke="#2e1f14" stroke-width="2" transform="rotate(-20 92 -98)"/>' +
      '<ellipse cx="142" cy="-70" rx="14" ry="9" fill="#bfe8d6" stroke="#2e1f14" stroke-width="2" transform="rotate(30 142 -70)"/>' +
      '<ellipse cx="184" cy="-114" rx="14" ry="9" fill="#f7e6a1" stroke="#2e1f14" stroke-width="2" transform="rotate(-40 184 -114)"/>' +
      '<path d="M70,-80 q6,-10 14,-12 M122,-52 q8,-6 12,-14 M162,-96 q6,-10 14,-12" fill="none"' +
      ' stroke="#f3e3c3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/></svg>',
    // De quoi écrire (chapitre 7) : un porte-plume et un encrier ; « Les mots sont encrés » ;
    // l'écriture se révèle « derrière une pointe de plume » (traitement du chapitre 7).
    plume: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-bois" x1="-39.1" y1="111.5" x2="-32.9" y2="128.5" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#f0cf98"/><stop offset="0.5" stop-color="#b67f40"/>' +
      '<stop offset="1" stop-color="#6e4520"/></linearGradient>' +
      '<linearGradient id="f-acier" x1="188.2" y1="31.2" x2="192.9" y2="44.4" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#e9edf1"/><stop offset="0.5" stop-color="#9aa2ab"/>' +
      '<stop offset="1" stop-color="#4e555d"/></linearGradient>' +
      '<linearGradient id="f-verre" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0.35"/>' +
      '<stop offset="0.3" stop-color="#fff" stop-opacity="0.06"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0.2"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="15"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="-130" cy="118" rx="90" ry="12" fill="url(#f-ombre)"/>' +
      '<ellipse cx="80" cy="108" rx="160" ry="12" fill="url(#f-ombre)"/><g filter="url(#f-lavis)">' +
      '<path d="M-196,-2 L-196,102 A66,16 0 0 0 -64,102 L-64,-2 Z" fill="#141a3c"/></g>' +
      '<path d="M-196,-2 C-196,-22 -156,-24 -154,-34 L-106,-34 C-104,-24 -64,-22 -64,-2 L-64,102 A66,16 0 0 1' +
      ' -196,102 Z" fill="url(#f-verre)" stroke="#c9d3e6" stroke-width="3"/>' +
      '<ellipse cx="-130" cy="-36" rx="26" ry="7" fill="#0c1030" stroke="#c9d3e6" stroke-width="3"/>' +
      '<ellipse cx="-130" cy="12" rx="62" ry="14" fill="#29346a" opacity=".9"/>' +
      '<path d="M-182,10 V92 M-170,-10 Q-160,-22 -144,-24" fill="none" stroke="#fff" stroke-width="5"' +
      ' stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M-196,-2 C-196,-22 -156,-24 -154,-34 M-106,-34 C-104,-24 -64,-22 -64,-2 M-196,-2 V102 A66,16 0' +
      ' 0 0 -64,102 V-2" fill="none" stroke="#1b2340" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M-39.1,111.5 L165.6,39.4 L170.4,52.6 L-32.9,128.5 A9,9 0 0 1 -39.1,111.5 Z"' +
      ' fill="url(#f-bois)" stroke="#2e1f14" stroke-width="3" stroke-linejoin="round"/>' +
      '<polygon points="165.4,38.9 188.5,32.2 192.6,43.5 170.6,53.1" fill="url(#f-acier)" stroke="#2e1f14" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M188.5,32.2 Q212.6,22.4 235.7,21.4 Q217.4,35.5 192.6,43.5 Z" fill="url(#f-acier)"' +
      ' stroke="#2e1f14" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M211.2,30.3 L233.8,22.1" fill="none" stroke="#2a2f36" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="211.2" cy="30.3" r="2.6" fill="#2a2f36"/>' +
      '<ellipse cx="240.7" cy="29.4" rx="9" ry="4" fill="#141a3c" opacity=".85"/>' +
      '<path d="M-37.7,115.3 L166.6,42.2" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>' +
      '</svg>',
    // La déclaration (chapitre 7) : une feuille crème, cinq phrases à l'encre bleu nuit, chacune à
    // la ligne ; une écriture qu'on ne peut pas lire (aucun mot n'y est écrit), seulement la
    // longueur des phrases.
    lettre: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#faf0d8"/>' +
      '<stop offset="1" stop-color="#e9d6ad"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="0" cy="112" rx="250" ry="22" fill="url(#f-ombre)"/>' +
      '<g transform="matrix(1.22 -.2 .34 .74 0 6)"><g filter="url(#f-lavis)">' +
      '<path d="M-150,-100 H150 V64 Q128,72 112,100 H-150 Z" fill="url(#f-papier)"/></g>' +
      '<path d="M-150,-100 H150 V64 Q128,72 112,100 H-150 Z" fill="none" stroke="#b79f73" stroke-width="1.6"/>' +
      '<path d="M150,64 Q128,72 112,100 Q126,80 150,64 Z" fill="#dcc596" stroke="#b79f73" stroke-width="1.2"/>' +
      '<path d="M-126,-70q2.5,-7 5,0q2.5,7 5,0t5,0t5,0M-99.4,-70q3.5,-7 7,0t7,0t7,0t7,0M-64.6,-70q2.5,-7' +
      ' 5,0q2.5,-13 5,0t5,0q2.5,7 5,0t5,0t5,0t5,0M-126,-52q3.5,-8 7,0t7,0t7,0t7,0t7,0M-84.1,-52q2.5,-6' +
      ' 5,0t5,0t5,0M-62.2,-52q3.5,-8 7,0t7,0t7,0t7,0t7,0M-126,-34q3.5,-8 7,0t7,0t7,0t7,0t7,0M-83,-34q3,-6' +
      ' 6,0t6,0t6,0t6,0M-51.4,-34q3.5,-8 7,0q3.5,-13 7,0t7,0t7,0M-15.6,-34q3,-6' +
      ' 6,0t6,0t6,0t6,0t6,0M23,-34q3,-8 6,0t6,0t6,0t6,0M54.8,-34q3.5,-8 7,0t7,0q3.5,-12 7,0t7,0q3.5,5' +
      ' 7,0M97.5,-34q3.5,-7 7,0t7,0t7,0M-126,-16q3,-7 6,0t6,0t6,0t6,0t6,0M-89.5,-16q3,-6' +
      ' 6,0t6,0t6,0M-65.2,-16q2.5,-7 5,0t5,0M-126,2q3,-7 6,0q3,-12 6,0t6,0t6,0t6,0M-88.1,2q3,-7 6,0t6,0q3,7' +
      ' 6,0t6,0M-55.7,2q3,-8 6,0t6,0t6,0t6,0M-23.2,2q2.5,-7 5,0q2.5,-12 5,0t5,0M-.7,2q3,-8' +
      ' 6,0t6,0t6,0t6,0M31.2,2q3,-8 6,0t6,0q3,5 6,0q3,-12 6,0M63.9,2q2.5,-7 5,0t5,0t5,0q2.5,5 5,0q2.5,-13' +
      ' 5,0M96.6,2q3.5,-6 7,0t7,0t7,0M-126,20q2.5,-7 5,0t5,0q2.5,7 5,0t5,0t5,0t5,0M-126,38q2.5,-7' +
      ' 5,0t5,0t5,0t5,0q2.5,5 5,0t5,0M-88.3,38q3.5,-6 7,0t7,0q3.5,7 7,0M-58.5,38q3.5,-8' +
      ' 7,0t7,0t7,0M-31.3,38q3,-7 6,0t6,0t6,0M-4.7,38q3,-6 6,0t6,0t6,0t6,0M28.1,38q3,-8 6,0t6,0q3,-13' +
      ' 6,0t6,0t6,0t6,0M70.6,38q2.5,-8 5,0t5,0t5,0q2.5,-12 5,0M98.3,38q3,-7 6,0t6,0t6,0t6,0M-126,56q3,-6' +
      ' 6,0t6,0q3,7 6,0q3,-13 6,0t6,0t6,0M-82.2,56q3.5,-6 7,0t7,0q3.5,-13 7,0M-53.9,56q3,-8 6,0t6,0t6,0q3,5' +
      ' 6,0q3,-13 6,0t6,0t6,0M-3.8,56q3.5,-7 7,0t7,0q3.5,5 7,0M26.2,56q2.5,-7' +
      ' 5,0t5,0t5,0t5,0t5,0t5,0t5,0t5,0M73.8,56q3,-7 6,0q3,5 6,0q3,7 6,0q3,5 6,0M106.6,56q3,-6' +
      ' 6,0t6,0t6,0M-126,74q3,-6 6,0t6,0t6,0t6,0t6,0t6,0M-83.9,74q2.5,-7 5,0t5,0q2.5,-13 5,0q2.5,-13' +
      ' 5,0M-57.1,74q3.5,-7 7,0t7,0q3.5,5 7,0q3.5,-12 7,0q3.5,-12 7,0M-13.1,74q3,-7 6,0q3,5 6,0q3,-12' +
      ' 6,0q3,-13 6,0t6,0t6,0" fill="none" stroke="#1b2455" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</g></svg>',
    // État : la déclaration pliée (chapitre 7) : glissée sous la porte, puis « le mot serré dans sa
    // main » ; l'encre transparaît.
    'lettre-pliee': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#faf0d8"/>' +
      '<stop offset="1" stop-color="#e9d6ad"/></linearGradient>' +
      '<linearGradient id="f-pli" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8e6"/>' +
      '<stop offset="1" stop-color="#dcc596"/></linearGradient>' +
      '<filter id="f-lavis" filterUnits="userSpaceOnUse" x="-300" y="-150" width="600" height="300">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs><ellipse cx="0" cy="110" rx="240" ry="20" fill="url(#f-ombre)"/>' +
      '<g transform="matrix(1.22 -.2 .34 .74 0 16)"><g filter="url(#f-lavis)">' +
      '<path d="M-150,-40 H150 V60 H-150 Z" fill="url(#f-papier)"/></g>' +
      '<path d="M-126,-8q2.5,-6 5,0q2.5,-12 5,0t5,0t5,0t5,0t5,0t5,0t5,0M-79.5,-8q3.5,-8' +
      ' 7,0t7,0t7,0t7,0M-42.7,-8q2.5,-6 5,0t5,0t5,0t5,0t5,0t5,0M-6.2,-8q3,-6 6,0q3,-12 6,0q3,5' +
      ' 6,0M20.8,-8q3,-7 6,0t6,0t6,0t6,0t6,0M59.1,-8q3.5,-6 7,0t7,0t7,0M88.4,-8q3,-7 6,0t6,0M-126,10q3,-8' +
      ' 6,0t6,0t6,0t6,0t6,0M-87.2,10q3.5,-8 7,0t7,0t7,0t7,0q3.5,5 7,0M-43.9,10q3,-8' +
      ' 6,0t6,0t6,0t6,0t6,0M-6.7,10q3.5,-8 7,0t7,0t7,0t7,0t7,0M35.3,10q3,-8 6,0q3,-13 6,0t6,0M60,10q2.5,-8' +
      ' 5,0q2.5,5 5,0t5,0t5,0t5,0t5,0t5,0q2.5,5 5,0M107.1,10q2.5,-6 5,0q2.5,-13 5,0q2.5,-13 5,0M-126,28q3,-8' +
      ' 6,0t6,0t6,0M-100.8,28q3,-6 6,0t6,0q3,-13 6,0M-76,28q3,-7 6,0t6,0t6,0q3,5 6,0t6,0M-37.4,28q3.5,-6' +
      ' 7,0q3.5,5 7,0t7,0q3.5,-12 7,0t7,0" fill="none" stroke="#1b2455" stroke-width="1.7" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M-150,-60 H150 V18 Q120,26 96,44 H-150 Z" fill="url(#f-pli)" stroke="#b79f73" stroke-width="1.6"/>' +
      '<path d="M-150,-60 H150" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-126,-40q3,-6 6,0t6,0t6,0t6,0t6,0M-88,-40q3,-8 6,0q3,-13 6,0q3,-12 6,0q3,-12' +
      ' 6,0t6,0t6,0M-43.2,-40q3,-8 6,0t6,0t6,0t6,0t6,0t6,0t6,0M5.5,-40q2.5,-6 5,0q2.5,7 5,0q2.5,-13' +
      ' 5,0t5,0q2.5,-12 5,0M38.8,-40q2.5,-8 5,0t5,0t5,0t5,0M65.9,-40q3,-8 6,0t6,0t6,0q3,-13' +
      ' 6,0t6,0M-126,-22q2.5,-8 5,0t5,0t5,0t5,0t5,0t5,0M-89.1,-22q3,-7 6,0q3,7 6,0q3,5' +
      ' 6,0t6,0t6,0t6,0t6,0M-41,-22q3.5,-6 7,0t7,0t7,0q3.5,-13 7,0M-5.8,-22q2.5,-6' +
      ' 5,0t5,0t5,0t5,0t5,0t5,0t5,0t5,0M40.5,-22q2.5,-8 5,0t5,0t5,0t5,0M68.6,-22q3.5,-6' +
      ' 7,0t7,0M90.1,-22q3.5,-6 7,0t7,0t7,0M-126,-4q3.5,-7 7,0t7,0t7,0t7,0M-90.5,-4q3.5,-8' +
      ' 7,0t7,0t7,0M-61.8,-4q2.5,-6 5,0t5,0t5,0q2.5,7 5,0t5,0t5,0t5,0M-18.7,-4q2.5,-6' +
      ' 5,0t5,0t5,0t5,0t5,0t5,0q2.5,5 5,0" fill="none" stroke="#1b2455" stroke-width="1.6" opacity=".14"/>' +
      '<path d="M-60,-60 L-40,44 M60,-60 L30,40" stroke="#b79f73" stroke-width="1.2" opacity=".6"/>' +
      '<path d="M-150,-40 V-60 M150,-40 V-60" stroke="#b79f73" stroke-width="1.6"/></g></svg>',
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
      '<circle cx="-148" cy="44" r="8" fill="#f4ecd0"/><path d="M-174,62 l0,10 l9,-5 Z" fill="#fff"/>' +
      '<path d="M-100,-83 H10 L-70,83 H-180 Z" fill="url(#f-reflet)"/></g></svg>',
    // Le ticket (chapitre 5) : le ticket de la pâtisserie, à talon ; l'enseigne imprimée rappelle
    // la Charlotte, « un cercle rouge de framboises cerclé de boudoirs » ; aucun chiffre ni mot.
    ticket: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-300 -150 600 300"><defs><radialGradient id="f-ombre">' +
      '<stop offset="0" stop-color="#000" stop-opacity=".5"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="f-papier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf7"/>' +
      '<stop offset="1" stop-color="#e9e2d3"/></linearGradient></defs>' +
      '<ellipse cx="0" cy="96" rx="220" ry="22" fill="url(#f-ombre)"/>' +
      '<g transform="matrix(1.12 -.2 .36 .72 0 -2)">' +
      '<path d="M-150,-70 H-88 A8,8 0 0 0 -72,-70 H150 V70 H-72 A8,8 0 0 0 -88,70 H-150 Z" fill="url(#f-papier)" stroke="#cfc6b4" stroke-width="1.6"/>' +
      '<path d="M-80,-60 V60" stroke="#b3aa98" stroke-width="2" stroke-dasharray="4 4"/>' +
      '<circle cx="-40" cy="-22" r="15" fill="#c23d61"/>' +
      '<circle cx="-40" cy="-22" r="21" fill="none" stroke="#c23d61" stroke-width="4" stroke-dasharray="4 2.6"/>' +
      '<g fill="#8e877b"><rect x="-8" y="-40" width="118" height="7" rx="3"/>' +
      '<rect x="-8" y="-26" width="84" height="7" rx="3"/><rect x="-8" y="-12" width="104" height="7" rx="3"/>' +
      '<rect x="-52" y="12" width="90" height="15" rx="4" fill="#57524b"/>' +
      '<rect x="-52" y="36" width="150" height="6" rx="3"/><rect x="-52" y="48" width="60" height="6" rx="3"/>' +
      '</g><g fill="#57524b"><rect x="-140" y="-40" width="2" height="70"/>' +
      '<rect x="-136" y="-40" width="3" height="70"/><rect x="-131" y="-40" width="1.5" height="70"/>' +
      '<rect x="-129" y="-40" width="3" height="70"/><rect x="-124" y="-40" width="2" height="70"/>' +
      '<rect x="-119" y="-40" width="1.5" height="70"/><rect x="-117" y="-40" width="3" height="70"/>' +
      '<rect x="-112" y="-40" width="2" height="70"/><rect x="-108" y="-40" width="1.5" height="70"/>' +
      '<rect x="-105" y="-40" width="3" height="70"/><rect x="-100" y="-40" width="2" height="70"/>' +
      '<rect x="-97" y="-40" width="1.5" height="70"/></g>' +
      '<rect x="-140" y="40" width="44" height="6" rx="3" fill="#8e877b"/></g></svg>',
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
      '<polygon points="-165,-10 55,12 55,124 -165,102" fill="url(#f-face)" stroke="#b5ab9b" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="55,12 125,-41.2 125,70.8 55,124" fill="url(#f-flanc)" stroke="#a89e8e" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="-165,-10 55,12 125,-41.2 -95,-63.2" fill="url(#f-dessus)" stroke="#c4baa9" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M-165,6 L55,28 L125,-25.2" fill="none" stroke="#b9af9f" stroke-width="1.6"/>' +
      '<polygon points="-136,-32 84,-10 96,-19.2 -124,-41.2" fill="url(#f-satinv)"/>' +
      '<polygon points="-67,-.2 -43,2.2 27,-51 3,-53.4" fill="url(#f-satin)"/>' +
      '<polygon points="-67,-.2 -43,2.2 -43,114.2 -67,111.8" fill="url(#f-satin)"/>' +
      '<polygon points="84,-10 96,-19.2 96,92.8 84,102" fill="url(#f-satin)" opacity=".85"/>' +
      '<path d="M-20,-25.6 C-50,-69.6 -112,-89.6 -104,-47.6 C-98,-23.6 -56,-23.6 -20,-25.6 Z"' +
      ' fill="url(#f-satin)" stroke="#6e0e0a" stroke-width="1.5"/>' +
      '<path d="M-20,-25.6 C0,-75.6 68,-95.6 66,-51.6 C62,-23.6 16,-21.6 -20,-25.6 Z" fill="url(#f-satin)" stroke="#6e0e0a" stroke-width="1.5"/>' +
      '<path d="M-26,-21.6 C-50,-5.6 -68,12.4 -72,36.4 L-60,32.4 L-54,44.4 C-50,18.4 -36,-1.6 -14,-17.6 Z"' +
      ' fill="url(#f-satinv)" stroke="#6e0e0a" stroke-width="1.5"/>' +
      '<path d="M-16,-27.6 C30,-19.6 70,-49.6 110,-35.6 C130,-29.6 148,-45.6 166,-55.6 L160,-41.6 L172,-33.6' +
      ' C150,-21.6 130,-11.6 108,-17.6 C72,-29.6 28,-5.6 -16,-13.6 Z" fill="url(#f-satinv)" stroke="#6e0e0a" stroke-width="1.5"/>' +
      '<ellipse cx="-20" cy="-25.6" rx="13" ry="10" fill="#c3261b" stroke="#6e0e0a" stroke-width="1.5"/>' +
      '<path d="M-90,-55.6 Q-76,-75.6 -56,-65.6 M10,-69.6 Q34,-83.6 52,-69.6" fill="none" stroke="#ffb3a2"' +
      ' stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>',
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
      '<rect width="10" height="10" fill="#fbe1dc"/>' +
      '<path d="M0,0H10M0,0V10" stroke="#e9978d" stroke-width="1"/></pattern></defs>' +
      '<ellipse cx="-60" cy="86" rx="200" ry="24" fill="url(#f-ombre)"/>' +
      '<ellipse cx="180" cy="76" rx="110" ry="12" fill="url(#f-ombre)"/>' +
      '<path d="M60.6,29.2 L106.4,-2.5 C124.4,1.5 124.4,19.9 136.4,25.9 L286.4,37.9 Q308.4,27.9 300.4,11.9' +
      ' L254.6,43.6 Q262.6,59.6 240.6,69.6 L90.6,57.6 C78.6,51.6 78.6,33.2 60.6,29.2 Z" fill="url(#f-grille)"' +
      ' stroke="#caa39c" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path' +
      ' d="M119.5,42.2L126.7,42.8L129.4,39.4L132.1,43.2L137.5,43.7L139.3,46.5L142,20.6L144.7,51.5L147.4,44.5L153.7,45L158.2,39.9L162.7,45.7L169.9,46.3L169.5,46.2L176.7,46.8L179.4,43.4L182.1,47.2L187.5,47.7L189.3,50.5L192,24.6L194.7,55.5L197.4,48.5L203.7,49L208.2,43.9L212.7,49.7L219.9,50.3L219.5,50.2L226.7,50.8L229.4,47.4L232.1,51.2L237.5,51.7L239.3,54.5L242,28.6L244.7,59.5L247.4,52.5L253.7,53L258.2,47.9L262.7,53.7L269.9,54.3" fill="none" stroke="#1d1d22" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<polygon points="-205,-2 45,18 45,80 -205,60" fill="url(#f-face)" stroke="#8e969f" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="45,18 123,-36 123,26 45,80" fill="url(#f-flanc)" stroke="#8e969f" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<polygon points="-205,-2 45,18 123,-36 -127,-56" fill="url(#f-dessus)" stroke="#9aa2ab" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M60.6,29.2 L106.4,-2.5" stroke="#3a3f46" stroke-width="4" stroke-linecap="round"/>' +
      '<polygon points="-152.7,-24.3 1.3,-12 38.8,-37.9 -115.2,-50.2" fill="#0d2a25" stroke="#5d656e" stroke-width="4" stroke-linejoin="round"/>' +
      '<path' +
      ' d="M-126,-36.6L-119.4,-36.1L-114.7,-37.5L-114.5,-35.7L-109.6,-35.3L-109.6,-34L-90.6,-45.3L-107.6,-31.6L-100.5,-34.6L-94.8,-34.1L-87.3,-36.2L-86.6,-33.5L-80,-33L-78,-32.8L-71.4,-32.3L-66.7,-33.7L-66.5,-31.9L-61.6,-31.5L-61.6,-30.2L-42.6,-41.5L-59.6,-27.8L-52.5,-30.8L-46.8,-30.3L-39.3,-32.4L-38.6,-29.7L-32,-29.1L-30,-29L-23.4,-28.4L-18.7,-29.8L-18.5,-28L-13.6,-27.6L-13.6,-26.3L5.4,-37.6L-11.6,-24L-4.5,-26.9L1.2,-26.5L8.7,-28.5L9.4,-25.8L16,-25.3" fill="none" stroke="#49f2a0" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<polygon points="-165.6,-6.1 -141.6,-4.2 -131.2,-11.4 -155.2,-13.3" fill="#5aa7a0" stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<polygon points="-133.6,-3.5 -109.6,-1.6 -99.2,-8.8 -123.2,-10.7" fill="#c2c8cf" stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<polygon points="-101.6,-1 -77.6,1 -67.2,-6.2 -91.2,-8.2" fill="#c2c8cf" stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<polygon points="-69.6,1.6 -45.6,3.5 -35.2,-3.7 -59.2,-5.6" fill="#c2c8cf" stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<polygon points="-37.6,4.2 -13.6,6.1 -3.2,-1.1 -27.2,-3" fill="#c2c8cf" stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<polygon points="-5.6,6.7 18.4,8.6 28.8,1.4 4.8,-.5" fill="#c2c8cf" stroke="#8a929b" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<path d="M-87,-52.8 l0,-20 L83,-59.2 l0,20" fill="none" stroke="#8e969f" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="M-87,-52.8 l0,-20 L83,-59.2 l0,20" fill="none" stroke="#dde1e6" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<g fill="none" stroke-linecap="round">' +
      '<path d="M-205,40 C-230,60 -250,86 -214,104 C-170,124 -90,124 -84,106 C-78,88 -150,82 -190,96 C-226,110' +
      ' -250,128 -270,120" stroke="#2f3338" stroke-width="7"/>' +
      '<path d="M-205,40 C-230,60 -250,86 -214,104 C-170,124 -90,124 -84,106 C-78,88 -150,82 -190,96 C-226,110' +
      ' -250,128 -270,120" stroke="#8f979f" stroke-width="3.5"/></g>' +
      '<rect x="-292" y="111" width="20" height="10" rx="4" fill="#3a9a5b" stroke="#2f3338" stroke-width="2"/>' +
      '<rect x="-286" y="127" width="20" height="10" rx="4" fill="#d8b43a" stroke="#2f3338" stroke-width="2"/>' +
      '<rect x="-272" y="135" width="20" height="10" rx="4" fill="#e8e8e8" stroke="#2f3338" stroke-width="2"/>' +
      '</svg>'
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
