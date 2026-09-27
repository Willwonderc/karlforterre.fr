/**
 * Langues du site : français (/), anglais (/en/) et chinois (/zh/).
 *
 * Chaque langue a sa propre adresse, pour que les moteurs de recherche trouvent les trois
 * versions. Les pages /en/ et /zh/ sont écrites par outils/pages-langues.py à partir
 * d'index.html et de js/traductions.js. Ce script complète la traduction dans le
 * navigateur : les en-têtes, le carrousel et les données du site photo, qui arrivent
 * après le chargement, passent eux aussi dans la langue de la page. Les liens vers
 * photos.karlforterre.fr mènent à sa version dans la même langue. La pastille à côté de
 * « Contact » ouvre le choix de la langue : chaque choix est un lien vers l'autre page.
 * Les anciens liens ?lang=en et ?lang=zh mènent à la bonne page.
 */
const Langues = {
    disponibles: {
        fr: { code: 'FR', html: 'fr' },
        en: { code: 'EN', html: 'en' },
        zh: { code: '中文', html: 'zh-Hans' }
    },
    actuelle: 'fr',
    textes: new WeakMap(),
    attributs: new WeakMap(),
    nomsAttributs: ['alt', 'aria-label', 'title', 'data-titre', 'data-text', 'href'],

    // Langue de la page, d'après son adresse : /en/…, /zh/… ou le français
    langueDePage() {
        const segment = window.location.pathname.split('/')[1];
        return segment !== 'fr' && this.disponibles[segment] ? segment : 'fr';
    },

    // Adresse de la page affichée dans une langue : /memoire/ → /en/memoire/, /en/ → /zh/
    adressePage(langue) {
        const chemin = window.location.pathname.replace(/^\/(en|zh)(?=\/)/, '') || '/';
        return (langue === 'fr' ? '' : `/${langue}`) + chemin;
    },

    init() {
        this.titreOriginal = document.title;
        const langue = this.langueDePage();
        const demandee = new URLSearchParams(window.location.search).get('lang');
        if (demandee && demandee !== langue && this.disponibles[demandee]) {
            window.location.replace(this.adressePage(demandee) + window.location.hash);
            return;
        }

        this.initBouton();
        this.observateur = new MutationObserver(mutations => this.surMutations(mutations));
        this.observateur.observe(document.body, {
            subtree: true, childList: true, characterData: true,
            attributes: true, attributeFilter: this.nomsAttributs
        });
        this.appliquer(langue);
    },

    appliquer(langue) {
        this.actuelle = this.disponibles[langue] ? langue : 'fr';
        document.documentElement.lang = this.disponibles[this.actuelle].html;
        document.title = this.traduction(this.titreOriginal) || this.titreOriginal;
        this.traduire(document.body);
        this.majBouton();
        document.dispatchEvent(new CustomEvent('kf:langue', { detail: { langue: this.actuelle } }));
    },

    // Traduction d'une phrase française dans la langue choisie, ou null
    traduction(francais) {
        if (this.actuelle === 'fr' || !window.TRADUCTIONS) return null;
        const entree = window.TRADUCTIONS[francais.replace(/\s+/g, ' ').trim()];
        return entree && entree[this.actuelle] ? entree[this.actuelle] : null;
    },

    // Page du site photo dans la langue de la page (même règle dans outils/pages-langues.py)
    rubriquesPhotos: {
        'galeries': 'galleries', 'a-propos': 'about', 'utiliser-mes-photos': 'use-my-photos',
        'mentions-legales': 'legal-notice', 'confidentialite': 'privacy'
    },

    lienPhotos(adresse) {
        if (this.actuelle === 'fr' || !adresse.startsWith('https://photos.karlforterre.fr/')) return adresse;
        const lien = new URL(adresse);
        if (/^\/(en|zh)\//.test(lien.pathname)) return adresse;
        lien.pathname = `/${this.actuelle}` + lien.pathname.replace(
            /^\/([^/]+)\//, (tout, rubrique) => `/${this.rubriquesPhotos[rubrique] || rubrique}/`);
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
        // Chaque choix est un lien vers la page de la langue ; on y garde la section affichée
        this.menu.querySelectorAll('[data-langue]').forEach(choix => {
            choix.addEventListener('click', () => {
                choix.href = this.adressePage(choix.dataset.langue) + window.location.hash;
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
