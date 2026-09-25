/**
 * ============================================================================
 * HEADER LOADER V4 - Système de chargement séquentiel avec bascule au clic
 * Site Karl Forterre V7 B
 * ============================================================================
 *
 * FONCTIONNEMENT :
 * 1. Charge le header 0 (Principal) par défaut ou le dernier sélectionné
 * 2. Au clic sur le hero (hors boutons/liens), passe au header suivant
 * 3. Transition slide horizontale entre les headers
 * 4. Sauvegarde l'index dans localStorage pour persistance
 *
 * CHANGEMENTS V4 :
 * - Plus d'aléatoire, mode séquentiel uniquement
 * - Clic pour changer de header
 * - Transition slide (glissement horizontal)
 * - Index sauvegardé dans localStorage
 *
 * @version 4.0.0
 * @date 2026-02-04
 */

const HeaderLoader = {

    /**
     * Options de configuration
     */
    config: {
        // Index par défaut (Header 0 - Principal)
        defaultIndex: 0,

        // Clé de stockage localStorage
        storageKey: 'karlForterre_headerIndex',

        // Activer la bascule au clic
        clickToSwitch: true,

        // Sélecteurs à exclure du clic (ne déclenchent pas le changement)
        excludeSelectors: 'a, button, .btn, .btn-sphere, .nav-link, .logo, input, textarea',

        // Durée de la transition slide (ms)
        transitionDuration: 500,

        // Activer les logs de debug
        debug: false,

        // ID du conteneur HTML
        containerId: 'header-container'
    },

    /**
     * État interne
     */
    state: {
        container: null,
        currentIndex: 0,
        currentHeader: null,
        isTransitioning: false,
        isLoaded: false,
        loadStartTime: null
    },

    /**
     * Initialise le loader
     */
    init() {
        this.log('🚀 Initialisation du HeaderLoader V4...');
        this.log('📋 Mode: Séquentiel avec bascule au clic');
        this.state.loadStartTime = performance.now();

        // Trouver le conteneur
        this.state.container = document.getElementById(this.config.containerId);

        if (!this.state.container) {
            this.error(`❌ Container #${this.config.containerId} non trouvé dans le DOM`);
            return;
        }

        // Vérifier si HeaderTemplates est disponible
        if (typeof HeaderTemplates === 'undefined') {
            this.error('❌ HeaderTemplates non chargé ! Vérifiez que header-templates.js est inclus AVANT header-loader.js');
            this.loadFallbackInline();
            return;
        }

        this.log(`✅ ${HeaderTemplates.available.length} headers disponibles`);

        // Injecter les styles de transition
        this.injectTransitionStyles();

        // Récupérer l'index sauvegardé ou utiliser le défaut
        this.state.currentIndex = this.getSavedIndex();
        this.log(`📌 Index de départ: ${this.state.currentIndex}`);

        // Charger le header initial
        this.loadHeader(this.state.currentIndex, false);

        // Configurer le clic pour changer
        if (this.config.clickToSwitch) {
            this.setupClickToSwitch();
        }
    },

    /**
     * Injecte les styles CSS pour la transition slide
     */
    injectTransitionStyles() {
        const transitionCSS = `
            /* === TRANSITION SLIDE ENTRE HEADERS === */
            #${this.config.containerId} {
                position: relative;
                overflow: hidden;
            }

            #${this.config.containerId} .header-wrapper {
                position: relative;
                width: 100%;
                min-height: 100vh;
            }

            #${this.config.containerId} .header-wrapper.slide-out-left {
                animation: headerSlideOutLeft ${this.config.transitionDuration}ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)) forwards;
            }

            #${this.config.containerId} .header-wrapper.slide-in-right {
                animation: headerSlideInRight ${this.config.transitionDuration}ms var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1)) forwards;
            }

            @keyframes headerSlideOutLeft {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-100%);
                    opacity: 0;
                }
            }

            @keyframes headerSlideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            /* Curseur pointer sur le hero pour indiquer le clic */
            #${this.config.containerId} .hero {
                cursor: pointer;
            }

            #${this.config.containerId} .hero a,
            #${this.config.containerId} .hero button,
            #${this.config.containerId} .hero .btn,
            #${this.config.containerId} .hero .btn-sphere {
                cursor: pointer;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = 'header-transition-styles';
        styleElement.textContent = transitionCSS;
        document.head.appendChild(styleElement);

        this.log('💅 Styles de transition injectés');
    },

    /**
     * Configure le clic pour changer de header
     */
    setupClickToSwitch() {
        this.state.container.addEventListener('click', (e) => {
            // Ignorer si en transition
            if (this.state.isTransitioning) {
                this.log('⏳ Transition en cours, clic ignoré');
                return;
            }

            // Ignorer si clic sur un élément exclu
            if (e.target.closest(this.config.excludeSelectors)) {
                this.log('🔗 Clic sur élément exclu, pas de changement');
                return;
            }

            // Changer de header
            this.log('👆 Clic détecté, changement de header...');
            this.nextHeader();
        });

        this.log('👆 Bascule au clic configurée');
    },

    /**
     * Récupère l'index sauvegardé ou le défaut
     */
    getSavedIndex() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved !== null) {
                const index = parseInt(saved, 10);
                const maxIndex = HeaderTemplates.available.length - 1;
                if (index >= 0 && index <= maxIndex) {
                    this.log(`💾 Index récupéré du localStorage: ${index}`);
                    return index;
                }
            }
        } catch (e) {
            this.warn('⚠️ Impossible de lire localStorage');
        }
        return this.config.defaultIndex;
    },

    /**
     * Sauvegarde l'index actuel
     */
    saveIndex(index) {
        try {
            localStorage.setItem(this.config.storageKey, index.toString());
            this.log(`💾 Index ${index} sauvegardé`);
        } catch (e) {
            this.warn('⚠️ Impossible d\'écrire dans localStorage');
        }
    },

    /**
     * Passe au header suivant
     */
    nextHeader() {
        const maxIndex = HeaderTemplates.available.length - 1;
        const nextIndex = (this.state.currentIndex + 1) > maxIndex ? 0 : this.state.currentIndex + 1;

        this.log(`➡️ Passage au header ${nextIndex} (depuis ${this.state.currentIndex})`);
        this.transitionToHeader(nextIndex);
    },

    /**
     * Passe au header précédent
     */
    previousHeader() {
        const maxIndex = HeaderTemplates.available.length - 1;
        const prevIndex = (this.state.currentIndex - 1) < 0 ? maxIndex : this.state.currentIndex - 1;

        this.log(`⬅️ Passage au header ${prevIndex} (depuis ${this.state.currentIndex})`);
        this.transitionToHeader(prevIndex);
    },

    /**
     * Transition vers un header spécifique avec animation slide
     */
    transitionToHeader(newIndex) {
        if (this.state.isTransitioning) return;
        if (newIndex === this.state.currentIndex) return;

        this.state.isTransitioning = true;

        const currentWrapper = this.state.container.querySelector('.header-wrapper');

        // Animation de sortie
        if (currentWrapper) {
            currentWrapper.classList.add('slide-out-left');
        }

        // Après l'animation de sortie, charger le nouveau header
        setTimeout(() => {
            this.loadHeader(newIndex, true);
        }, this.config.transitionDuration);
    },

    /**
     * Charge un header par son index
     */
    loadHeader(index, withSlideIn = false) {
        const templates = HeaderTemplates.available;

        if (index < 0 || index >= templates.length) {
            this.error(`❌ Index ${index} invalide`);
            return;
        }

        const template = templates[index];
        this.state.currentIndex = index;
        this.state.currentHeader = template;

        this.log(`🎯 Header sélectionné: "${template.name}" (ID: ${template.id})`);

        // Supprimer les anciens styles
        const oldStyles = document.getElementById('dynamic-header-styles');
        if (oldStyles) oldStyles.remove();

        // Injecter les nouveaux styles
        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-header-styles';
        styleElement.setAttribute('data-header', template.name);
        styleElement.textContent = template.styles;
        document.head.appendChild(styleElement);

        // Créer le wrapper et injecter le HTML
        const wrapper = document.createElement('div');
        wrapper.className = 'header-wrapper';
        if (withSlideIn) {
            wrapper.classList.add('slide-in-right');
        }
        wrapper.innerHTML = template.html;

        // Remplacer le contenu
        this.state.container.innerHTML = '';
        this.state.container.appendChild(wrapper);

        // Forcer le reflow
        wrapper.offsetHeight;

        // Sauvegarder l'index
        this.saveIndex(index);

        // Marquer comme chargé
        this.state.isLoaded = true;

        // Initialiser les fonctionnalités spécifiques
        setTimeout(() => {
            this.initHeaderFeatures(template);

            // Fin de transition
            this.state.isTransitioning = false;

            // Nettoyer les classes d'animation après
            setTimeout(() => {
                wrapper.classList.remove('slide-in-right');
            }, 100);

        }, 50);

        // Dispatcher l'événement
        this.dispatchLoadedEvent();
    },

    /**
     * Initialise les fonctionnalités spécifiques au header
     */
    initHeaderFeatures(template) {
        if (template.init && typeof template.init === 'function') {
            this.log(`⚙️ Exécution de init() pour: ${template.name}`);
            try {
                template.init();
                this.log(`✅ Init terminée pour: ${template.name}`);
            } catch (error) {
                this.error(`❌ Erreur lors de l'init: ${error.message}`);
            }
        }

        // Forcer le redémarrage des animations CSS
        this.restartAnimations();
    },

    /**
     * Force le redémarrage des animations CSS
     */
    restartAnimations() {
        const animatedElements = this.state.container.querySelectorAll('[style*="animation"], .letter, .shape, .btn, .btn-sphere, .hero-cta, .hero-tagline, .hero-subtitle, .hero-title, .title-line');

        animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = '';
        });

        this.log('🔄 Animations CSS redémarrées');
    },

    /**
     * Fallback inline en cas d'erreur
     */
    loadFallbackInline() {
        this.warn('⚠️ Chargement du fallback inline...');

        this.state.currentHeader = { id: -1, name: 'fallback-inline', description: 'Fallback inline' };

        const fallbackCSS = `
            .hero--fallback-inline {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, var(--color-primary, #1a1a2e) 0%, var(--color-secondary, #16213e) 100%);
                color: var(--color-surface, #ffffff);
                font-family: var(--font-heading, 'Cormorant Garamond', Georgia, serif);
                text-align: center;
                padding: 2rem;
            }
            .hero--fallback-inline .subtitle {
                font-size: 0.9rem;
                color: var(--color-accent, #c9a962);
                text-transform: uppercase;
                letter-spacing: 0.4em;
                margin-bottom: 1.5rem;
            }
            .hero--fallback-inline .title {
                font-size: clamp(3rem, 8vw, 6rem);
                font-weight: 400;
                margin-bottom: 1.5rem;
            }
            .hero--fallback-inline .title span { color: var(--color-accent, #c9a962); }
            .hero--fallback-inline .tagline {
                font-style: italic;
                font-size: 1.3rem;
                color: rgba(255,255,255,0.8);
                margin-bottom: 2rem;
            }
            .hero--fallback-inline .cta {
                display: flex;
                gap: 1.5rem;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-header-styles';
        styleElement.textContent = fallbackCSS;
        document.head.appendChild(styleElement);

        const wrapper = document.createElement('div');
        wrapper.className = 'header-wrapper';
        wrapper.innerHTML = `
            <section class="hero hero--fallback-inline" id="hero" data-header-id="-1" role="banner">
                <p class="subtitle">Auteur</p>
                <h1 class="title">Karl <span>Forterre</span></h1>
                <p class="tagline">« Les belles lettres font les bons mots. »</p>
                <div class="cta">
                    <a href="#books" class="btn btn-primary">Découvrir mes œuvres</a>
                    <a href="#contact" class="btn btn-secondary">Me contacter</a>
                </div>
            </section>
        `;

        this.state.container.innerHTML = '';
        this.state.container.appendChild(wrapper);

        this.dispatchLoadedEvent();
    },

    /**
     * Dispatche l'événement de chargement terminé
     */
    dispatchLoadedEvent() {
        const event = new CustomEvent('headerLoaded', {
            detail: {
                header: this.state.currentHeader.name,
                id: this.state.currentHeader.id,
                index: this.state.currentIndex,
                description: this.state.currentHeader.description,
                loadTime: performance.now() - this.state.loadStartTime
            }
        });

        document.dispatchEvent(event);
        this.log('📡 Événement "headerLoaded" dispatché');
    },

    /**
     * Utilitaires de log
     */
    log(...args) {
        if (this.config.debug) {
            console.log('%c[HeaderLoader]', 'color: #c9a962; font-weight: bold;', ...args);
        }
    },

    warn(...args) {
        if (this.config.debug) {
            console.warn('%c[HeaderLoader]', 'color: #ffa500; font-weight: bold;', ...args);
        }
    },

    error(...args) {
        console.error('%c[HeaderLoader]', 'color: #ff4444; font-weight: bold;', ...args);
    },

    /**
     * API publique: Obtenir le header actuel
     */
    getCurrentHeader() {
        return {
            ...this.state.currentHeader,
            index: this.state.currentIndex
        };
    },

    /**
     * API publique: Obtenir l'index actuel
     */
    getCurrentIndex() {
        return this.state.currentIndex;
    },

    /**
     * API publique: Obtenir le nombre total de headers
     */
    getTotalHeaders() {
        return HeaderTemplates?.available?.length || 0;
    },

    /**
     * API publique: Lister les headers disponibles
     */
    listHeaders() {
        if (typeof HeaderTemplates === 'undefined') {
            console.log('HeaderTemplates non disponible');
            return [];
        }

        console.log('=== HEADERS DISPONIBLES ===');
        HeaderTemplates.available.forEach((h, i) => {
            const current = i === this.state.currentIndex ? ' ← ACTUEL' : '';
            console.log(`${i}. [ID ${h.id}] ${h.name} - ${h.description}${current}`);
        });
        return HeaderTemplates.available.map(h => ({ id: h.id, name: h.name, description: h.description }));
    },

    /**
     * API publique: Forcer un header spécifique (par ID)
     */
    setHeader(headerId) {
        const index = HeaderTemplates.available.findIndex(h => h.id === headerId);
        if (index !== -1) {
            this.transitionToHeader(index);
            this.log(`✅ Header #${headerId} forcé`);
        } else {
            this.error(`❌ Header #${headerId} non trouvé`);
        }
    },

    /**
     * API publique: Aller à un index spécifique
     */
    goToIndex(index) {
        if (index >= 0 && index < HeaderTemplates.available.length) {
            this.transitionToHeader(index);
        } else {
            this.error(`❌ Index ${index} invalide`);
        }
    },

    /**
     * API publique: Réinitialiser au header par défaut
     */
    reset() {
        try {
            localStorage.removeItem(this.config.storageKey);
        } catch (e) {}
        this.transitionToHeader(this.config.defaultIndex);
        this.log('🔄 Réinitialisé au header par défaut');
    }
};

// Auto-initialisation au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HeaderLoader.init());
} else {
    HeaderLoader.init();
}

// Exposer globalement
window.HeaderLoader = HeaderLoader;
