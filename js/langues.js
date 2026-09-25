/**
 * Langues du site : français (le texte d'origine de la page), anglais et chinois.
 *
 * La pastille à côté de « Contact » ouvre le choix de la langue. Chaque phrase française
 * est alors remplacée par sa traduction (js/traductions.js), y compris dans les en-têtes,
 * le carrousel et les données du site photo, qui arrivent après le chargement. Les liens
 * vers photos.karlforterre.fr mènent à sa version anglaise. Le choix est mémorisé dans le
 * navigateur ; un lien peut aussi imposer la langue : ?lang=en ou ?lang=zh.
 */
const Langues = {
    disponibles: {
        fr: { code: 'FR', html: 'fr' },
        en: { code: 'EN', html: 'en' },
        zh: { code: '中文', html: 'zh-Hans' }
    },
    cle: 'karlForterre_langue',
    actuelle: 'fr',
    textes: new WeakMap(),
    attributs: new WeakMap(),
    nomsAttributs: ['alt', 'aria-label', 'title', 'data-titre', 'data-text', 'href'],

    init() {
        this.titreOriginal = document.title;
        const demandee = new URLSearchParams(window.location.search).get('lang');
        let enregistree = null;
        try {
            enregistree = localStorage.getItem(this.cle);
        } catch (e) {}
        const langue = this.disponibles[demandee] ? demandee : (this.disponibles[enregistree] ? enregistree : 'fr');

        this.initBouton();
        this.observateur = new MutationObserver(mutations => this.surMutations(mutations));
        this.observateur.observe(document.body, {
            subtree: true, childList: true, characterData: true,
            attributes: true, attributeFilter: this.nomsAttributs
        });
        this.appliquer(langue, Boolean(this.disponibles[demandee]));
    },

    appliquer(langue, enregistrer = true) {
        this.actuelle = this.disponibles[langue] ? langue : 'fr';
        document.documentElement.lang = this.disponibles[this.actuelle].html;
        document.title = this.traduction(this.titreOriginal) || this.titreOriginal;
        this.traduire(document.body);
        this.majBouton();
        if (enregistrer) {
            try {
                localStorage.setItem(this.cle, this.actuelle);
            } catch (e) {}
        }
        document.dispatchEvent(new CustomEvent('kf:langue', { detail: { langue: this.actuelle } }));
    },

    // Traduction d'une phrase française dans la langue choisie, ou null
    traduction(francais) {
        if (this.actuelle === 'fr' || !window.TRADUCTIONS) return null;
        const entree = window.TRADUCTIONS[francais.replace(/\s+/g, ' ').trim()];
        return entree && entree[this.actuelle] ? entree[this.actuelle] : null;
    },

    // Version anglaise des pages du site photo, qui n'existe pas en chinois
    lienPhotos(adresse) {
        if (this.actuelle === 'fr' || !adresse.startsWith('https://photos.karlforterre.fr/')) return adresse;
        const lien = new URL(adresse);
        if (lien.pathname.startsWith('/en/')) return adresse;
        lien.pathname = '/en' + lien.pathname.replace(/^\/galeries\//, '/galleries/');
        return lien.href;
    },

    exclu(element) {
        return !element || Boolean(element.closest('script, style, noscript, [data-sans-traduction]'));
    },

    traduireTexte(noeud) {
        if (this.exclu(noeud.parentElement)) return;
        let etat = this.textes.get(noeud);
        // Texte nouveau, ou changé depuis par un script : c'est le français d'origine
        if (!etat || noeud.nodeValue !== etat.affiche) {
            etat = { original: noeud.nodeValue, affiche: noeud.nodeValue };
            this.textes.set(noeud, etat);
        }
        const traduction = etat.original.trim() ? this.traduction(etat.original) : null;
        const valeur = traduction
            ? etat.original.replace(/^(\s*)[\s\S]*?(\s*)$/, (tout, avant, apres) => avant + traduction + apres)
            : etat.original;
        if (noeud.nodeValue !== valeur) noeud.nodeValue = valeur;
        etat.affiche = valeur;
    },

    traduireElement(element) {
        if (this.exclu(element)) return;
        let etats = this.attributs.get(element);
        if (!etats) {
            etats = {};
            this.attributs.set(element, etats);
        }
        this.nomsAttributs.forEach(nom => {
            if (!element.hasAttribute(nom)) return;
            const courant = element.getAttribute(nom);
            if (!etats[nom] || courant !== etats[nom].affiche) etats[nom] = { original: courant, affiche: courant };
            const original = etats[nom].original;
            const valeur = nom === 'href' ? this.lienPhotos(original) : (this.traduction(original) || original);
            if (courant !== valeur) element.setAttribute(nom, valeur);
            etats[nom].affiche = valeur;
        });
    },

    traduire(racine) {
        if (racine.nodeType === Node.TEXT_NODE) {
            this.traduireTexte(racine);
            return;
        }
        if (racine.nodeType !== Node.ELEMENT_NODE) return;
        const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
        let noeud;
        while ((noeud = marcheur.nextNode())) this.traduireTexte(noeud);
        const selecteur = this.nomsAttributs.map(nom => `[${nom}]`).join(',');
        if (racine.matches(selecteur)) this.traduireElement(racine);
        racine.querySelectorAll(selecteur).forEach(element => this.traduireElement(element));
    },

    // Contenus ajoutés après coup : en-têtes, carrousel, site photo, visionneuse
    surMutations(mutations) {
        if (this.actuelle === 'fr') return;
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') mutation.addedNodes.forEach(noeud => this.traduire(noeud));
            else if (mutation.type === 'characterData') this.traduireTexte(mutation.target);
            else this.traduireElement(mutation.target);
        });
    },

    initBouton() {
        this.bouton = document.getElementById('nav-langue');
        this.menu = document.getElementById('menu-langues');
        if (!this.bouton || !this.menu) return;

        const fermer = () => {
            this.menu.hidden = true;
            this.bouton.setAttribute('aria-expanded', 'false');
        };
        this.bouton.addEventListener('click', () => {
            const ouvrir = this.menu.hidden;
            this.menu.hidden = !ouvrir;
            this.bouton.setAttribute('aria-expanded', String(ouvrir));
        });
        this.menu.querySelectorAll('[data-langue]').forEach(choix => {
            choix.addEventListener('click', () => {
                this.appliquer(choix.dataset.langue);
                fermer();
            });
        });
        document.addEventListener('click', (e) => {
            if (!this.menu.hidden && !e.target.closest('.nav-langues')) fermer();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fermer();
        });
    },

    majBouton() {
        if (!this.bouton) return;
        this.bouton.querySelector('.nav-langue-code').textContent = this.disponibles[this.actuelle].code;
        this.menu.querySelectorAll('[data-langue]').forEach(choix => {
            choix.setAttribute('aria-current', String(choix.dataset.langue === this.actuelle));
        });
    }
};

window.Langues = Langues;
document.addEventListener('DOMContentLoaded', () => Langues.init());
