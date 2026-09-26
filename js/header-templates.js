/**
 * ============================================================================
 * HEADER TEMPLATES V4 - Templates harmonisés et nettoyés
 * Site Karl Forterre V7 B
 * ============================================================================
 *
 * REFACTORING EFFECTUÉ :
 * - Variables CSS unifiées (utilise celles de styles.css)
 * - Code CSS dupliqué supprimé (boutons billes dans styles.css)
 * - Classes wrapper harmonisées (hero--[nom])
 * - IDs préfixés pour éviter conflits
 * - Accessibilité ajoutée (aria-labels)
 * - Breakpoints normalisés (768px, 1024px)
 *
 * HEADERS DISPONIBLES :
 * 0 - Principal (grille avec photo)
 * 1 - Cinématique (lettres animées, particules)
 * 2 - Split Screen (interactif)
 * 3 - Typographie (lettres géantes)
 * 4 - Encre (blobs fluides)
 * 5 - Typographie Capsules (variante)
 *
 * @version 4.0.0
 * @date 2026-02-04
 */

const HeaderTemplates = {

    /**
     * ========================================
     * HEADER 0 - PRINCIPAL
     * Grille avec photo et formes flottantes
     * ========================================
     */
    principal: {
        id: 0,
        name: 'principal',
        description: 'Header grille avec photo et formes flottantes',
        styles: `
            /* === HERO PRINCIPAL === */
            .hero--principal {
                position: relative;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .hero--principal .hero-background {
                position: absolute;
                inset: 0;
            }

            .hero--principal .hero-gradient {
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, #0f0f23 100%);
            }

            .hero--principal .hero-pattern {
                position: absolute;
                inset: 0;
                background-image:
                    radial-gradient(circle at 25% 25%, rgba(201, 169, 98, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(201, 169, 98, 0.05) 0%, transparent 50%);
                animation: principal-pattern-move 20s ease-in-out infinite alternate;
            }

            @keyframes principal-pattern-move {
                0% { transform: scale(1) rotate(0deg); }
                100% { transform: scale(1.1) rotate(5deg); }
            }

            .hero--principal .hero-glow {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 600px;
                height: 600px;
                background: radial-gradient(circle, rgba(201, 169, 98, 0.15) 0%, transparent 70%);
                transform: translate(-50%, -50%);
                animation: principal-glow-pulse var(--duration-ambient) ease-in-out infinite;
            }

            @keyframes principal-glow-pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
            }

            .hero--principal .floating-shapes {
                position: absolute;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
            }

            .hero--principal .shape {
                position: absolute;
                border-radius: 50%;
                opacity: 0.1;
            }

            .hero--principal .shape-1 {
                width: 300px;
                height: 300px;
                background: var(--color-accent);
                top: 10%;
                left: -5%;
                animation: principal-float 8s ease-in-out infinite;
            }

            .hero--principal .shape-2 {
                width: 200px;
                height: 200px;
                border: 2px solid var(--color-accent);
                background: transparent;
                top: 60%;
                right: 10%;
                animation: principal-float 10s ease-in-out infinite reverse;
            }

            .hero--principal .shape-3 {
                width: 150px;
                height: 150px;
                background: linear-gradient(135deg, var(--color-accent), transparent);
                bottom: 20%;
                left: 15%;
                animation: principal-float 12s ease-in-out infinite;
            }

            .hero--principal .shape-4 {
                width: 80px;
                height: 80px;
                background: var(--color-accent-light);
                top: 30%;
                right: 20%;
                animation: principal-float 6s ease-in-out infinite;
            }

            .hero--principal .shape-5 {
                width: 120px;
                height: 120px;
                border: 1px solid rgba(201, 169, 98, 0.5);
                top: 70%;
                left: 60%;
                animation: principal-rotate 20s linear infinite;
            }

            @keyframes principal-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-30px) rotate(10deg); }
            }

            @keyframes principal-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .hero--principal .hero-content {
                position: relative;
                z-index: var(--z-header-content);
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4rem;
                align-items: center;
                max-width: var(--container-max);
                padding: 0 var(--container-padding);
                width: 100%;
            }

            .hero--principal .hero-text {
                padding-right: 3rem;
            }

            .hero--principal .hero-subtitle {
                font-family: var(--font-body);
                font-size: 0.9rem;
                font-weight: 500;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                color: var(--color-accent);
                margin-bottom: var(--space-md);
                opacity: 0;
                animation: principal-fade-in var(--duration-slow) ease forwards 0.5s;
            }

            .hero--principal .hero-title {
                font-family: var(--font-heading);
                font-size: clamp(3rem, 7vw, 5.5rem);
                font-weight: 400;
                color: var(--color-surface);
                margin-bottom: var(--space-lg);
                letter-spacing: -0.02em;
                line-height: 1.1;
            }

            .hero--principal .title-line {
                display: block;
                opacity: 0;
                transform: translateY(100%);
                animation: principal-slide-up var(--duration-slow) ease forwards;
            }

            .hero--principal .title-line:nth-child(1) { animation-delay: 0.6s; }
            .hero--principal .title-line:nth-child(2) { animation-delay: 0.7s; color: var(--color-accent); }

            @keyframes principal-slide-up {
                to { opacity: 1; transform: translateY(0); }
            }

            .hero--principal .hero-tagline {
                font-family: var(--font-heading);
                font-size: clamp(1.25rem, 2.5vw, 1.5rem);
                font-style: italic;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: var(--space-2xl);
                opacity: 0;
                animation: principal-fade-in 1s ease forwards 1s;
            }

            @keyframes principal-fade-in {
                to { opacity: 1; }
            }

            .hero--principal .hero-cta {
                display: flex;
                gap: var(--space-md);
                opacity: 0;
                transform: translateY(20px);
                animation: principal-fade-up var(--duration-slow) ease forwards 1.3s;
            }

            @keyframes principal-fade-up {
                to { opacity: 1; transform: translateY(0); }
            }

            .hero--principal .hero-image {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .hero--principal .image-wrapper {
                position: relative;
                width: 350px;
                height: 350px;
                opacity: 0;
                animation: principal-scale-in 1s ease forwards 0.8s;
            }

            @keyframes principal-scale-in {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }

            .hero--principal .image-glow {
                position: absolute;
                inset: -20px;
                background: radial-gradient(circle, rgba(201, 169, 98, 0.4) 0%, transparent 70%);
                border-radius: 50%;
                animation: principal-glow-rotate 10s linear infinite;
                filter: blur(20px);
            }

            @keyframes principal-glow-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .hero--principal .image-border {
                position: absolute;
                inset: -10px;
                border: 2px solid var(--color-accent);
                border-radius: 50%;
                animation: principal-glow-rotate 15s linear infinite reverse;
            }

            .hero--principal .profile-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                position: relative;
                z-index: 1;
            }

            .hero--principal .scroll-indicator {
                position: absolute;
                bottom: 3rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-sm);
                opacity: 0;
                animation: principal-fade-in 1s ease forwards 1.5s;
                z-index: var(--z-header-scroll);
            }

            .hero--principal .mouse {
                width: 24px;
                height: 40px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                position: relative;
            }

            .hero--principal .mouse-wheel {
                width: 4px;
                height: 8px;
                background: var(--color-accent);
                border-radius: 2px;
                position: absolute;
                top: 6px;
                left: 50%;
                transform: translateX(-50%);
                animation: principal-scroll-wheel 2s ease-in-out infinite;
            }

            @keyframes principal-scroll-wheel {
                0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
                50% { transform: translateX(-50%) translateY(10px); opacity: 0.3; }
            }

            .hero--principal .scroll-indicator span {
                font-size: 0.75rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.5);
            }

            /* Responsive 1024px */
            @media (max-width: 1024px) {
                .hero--principal .hero-content {
                    grid-template-columns: 1fr;
                    text-align: center;
                }
                .hero--principal .hero-text {
                    padding-right: 0;
                }
                .hero--principal .hero-image {
                    display: none;
                }
                .hero--principal .hero-cta {
                    justify-content: center;
                }
            }

            /* Responsive 768px */
            @media (max-width: 768px) {
                .hero--principal .hero-cta {
                    flex-direction: column;
                    align-items: center;
                }
            }
        `,
        html: `
            <section class="hero hero--principal" id="hero" data-header-id="0" role="banner">
                <div class="hero-background">
                    <div class="hero-gradient"></div>
                    <div class="hero-pattern"></div>
                    <div class="hero-glow"></div>
                </div>

                <div class="floating-shapes" aria-hidden="true">
                    <div class="shape shape-1"></div>
                    <div class="shape shape-2"></div>
                    <div class="shape shape-3"></div>
                    <div class="shape shape-4"></div>
                    <div class="shape shape-5"></div>
                </div>

                <div class="hero-content">
                    <div class="hero-text">
                        <p class="hero-subtitle">Auteur</p>
                        <h1 class="hero-title">
                            <span class="title-line">Karl</span>
                            <span class="title-line">Forterre</span>
                        </h1>
                        <p class="hero-tagline">« Les belles lettres font les bons mots. »</p>
                        <div class="hero-cta">
                            <a href="#books" class="btn btn-primary" aria-label="Découvrir mes œuvres">
                                <span class="btn-text">Découvrir mes œuvres</span>
                                <span class="btn-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </span>
                            </a>
                            <a href="#contact" class="btn btn-secondary" aria-label="Me contacter">
                                <span class="btn-text">Me contacter</span>
                            </a>
                        </div>
                    </div>

                    <div class="hero-image">
                        <div class="image-wrapper">
                            <div class="image-glow" aria-hidden="true"></div>
                            <div class="image-border" aria-hidden="true"></div>
                            <img src="images/auteur/photo-auteur.webp" alt="Portrait de Karl Forterre, auteur" class="profile-img">
                        </div>
                    </div>
                </div>

                <div class="scroll-indicator" aria-hidden="true">
                    <div class="mouse">
                        <div class="mouse-wheel"></div>
                    </div>
                    <span>Défiler</span>
                </div>
            </section>
        `,
        init: null
    },

    /**
     * ========================================
     * HEADER 1 - CINÉMATIQUE
     * Lettres animées, particules flottantes
     * ========================================
     */
    cinematique: {
        id: 1,
        name: 'cinematique',
        description: 'Header cinématique avec lettres animées',
        styles: `
            /* === HERO CINÉMATIQUE === */
            .hero--cinematique {
                position: relative;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .hero--cinematique .hero-video-container {
                position: absolute;
                inset: 0;
                z-index: var(--z-header-bg);
            }

            .hero--cinematique .hero-image-bg {
                position: absolute;
                inset: 0;
                background: url('images/fond-auteur.webp') center/cover;
                filter: brightness(0.3);
            }

            .hero--cinematique .hero-overlay {
                position: absolute;
                inset: 0;
                background:
                    linear-gradient(180deg, rgba(26, 26, 46, 0.4) 0%, transparent 30%, transparent 70%, rgba(26, 26, 46, 0.9) 100%),
                    linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.6) 50%, rgba(26, 26, 46, 0.8) 100%);
                z-index: var(--z-header-overlay);
            }

            .hero--cinematique .grain {
                position: absolute;
                inset: 0;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                opacity: 0.03;
                pointer-events: none;
                z-index: var(--z-header-overlay);
            }

            .hero--cinematique .particles {
                position: absolute;
                inset: 0;
                z-index: var(--z-header-particles);
                overflow: hidden;
            }

            .hero--cinematique .particle {
                position: absolute;
                background: var(--color-accent);
                border-radius: 50%;
                opacity: 0;
                animation: cine-float-up 12s infinite;
            }

            @keyframes cine-float-up {
                0% { opacity: 0; transform: translateY(100vh) scale(0); }
                10% { opacity: 0.6; }
                90% { opacity: 0.6; }
                100% { opacity: 0; transform: translateY(-100vh) scale(1); }
            }

            .hero--cinematique .hero-content {
                position: relative;
                z-index: var(--z-header-content);
                text-align: center;
                max-width: 1000px;
                padding: var(--space-2xl) var(--space-xl) 8rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-md);
            }

            .hero--cinematique .author-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                padding: var(--space-sm) 1.25rem;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: var(--radius-full);
                margin-bottom: var(--space-xl);
                backdrop-filter: blur(10px);
                opacity: 0;
                animation: cine-fade-down 1s ease forwards 0.5s;
            }

            .hero--cinematique .badge-dot {
                width: 8px;
                height: 8px;
                background: var(--color-accent);
                border-radius: 50%;
                animation: cine-pulse 2s ease-in-out infinite;
            }

            @keyframes cine-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
            }

            .hero--cinematique .badge-text {
                font-size: 0.85rem;
                font-weight: 500;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.8);
            }

            @keyframes cine-fade-down {
                from { opacity: 0; transform: translateY(-30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .hero--cinematique .hero-title {
                font-family: var(--font-heading);
                font-size: clamp(4rem, 12vw, 9rem);
                font-weight: 400;
                line-height: 1;
                margin-bottom: var(--space-xl);
                position: relative;
                z-index: 5;
                color: var(--color-surface);
            }

            .hero--cinematique .title-line { display: block; overflow: hidden; }

            .hero--cinematique .title-letter {
                display: inline-block;
                opacity: 0;
                filter: blur(20px);
                animation: cine-ink-reveal var(--duration-slow) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }

            @keyframes cine-ink-reveal {
                0% { opacity: 0; filter: blur(20px); transform: translateY(60px) rotateX(-90deg); }
                60% { filter: blur(5px); }
                100% { opacity: 1; filter: blur(0); transform: translateY(0) rotateX(0); }
            }

            .hero--cinematique .title-accent { color: var(--color-accent); }

            .hero--cinematique .hero-tagline {
                font-family: var(--font-heading);
                font-size: clamp(1.2rem, 3vw, 1.8rem);
                font-style: italic;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: var(--space-2xl);
                opacity: 0;
                animation: cine-fade-in 1s ease forwards 2s;
            }

            @keyframes cine-fade-in { to { opacity: 1; } }

            .hero--cinematique .hero-cta {
                display: flex;
                gap: var(--space-2xl);
                justify-content: center;
                flex-wrap: wrap;
                opacity: 0;
                transform: translateY(30px);
                animation: cine-fade-up 1s ease forwards 2.5s;
            }

            @keyframes cine-fade-up { to { opacity: 1; transform: translateY(0); } }

            .hero--cinematique .scroll-indicator {
                position: absolute;
                bottom: 1.5rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-sm);
                opacity: 0;
                animation: cine-fade-in 1s ease forwards 3s;
                z-index: var(--z-header-scroll);
            }

            .hero--cinematique .scroll-line {
                width: 1px;
                height: 40px;
                background: linear-gradient(to bottom, var(--color-accent), transparent);
                position: relative;
                overflow: hidden;
            }

            .hero--cinematique .scroll-line::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 15px;
                background: var(--color-surface);
                animation: cine-scroll-down 2s ease-in-out infinite;
            }

            @keyframes cine-scroll-down { 0% { transform: translateY(-100%); } 100% { transform: translateY(500%); } }

            .hero--cinematique .scroll-text {
                font-size: 0.7rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.5);
            }

            /* Responsive 768px */
            @media (max-width: 768px) {
                .hero--cinematique .hero-cta { flex-direction: column; align-items: center; }
                .hero--cinematique .btn { width: 100%; max-width: 280px; justify-content: center; }
            }
        `,
        html: `
            <section class="hero hero--cinematique" id="hero" data-header-id="1" role="banner">
                <div class="hero-video-container">
                    <div class="hero-image-bg"></div>
                </div>

                <div class="hero-overlay"></div>
                <div class="grain" aria-hidden="true"></div>
                <div class="particles" id="cine-particles" aria-hidden="true"></div>

                <div class="hero-content">
                    <h1 class="hero-title">
                        <span class="title-line" id="cine-title-line-1"></span>
                        <span class="title-line" id="cine-title-line-2"></span>
                    </h1>

                    <p class="hero-tagline">« Les belles lettres font les bons mots. »</p>

                    <div class="hero-cta">
                        <a href="#books" class="btn btn-primary" aria-label="Découvrir mes œuvres">
                            <span class="btn-text">Découvrir mes œuvres</span>
                            <span class="btn-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </span>
                        </a>
                        <a href="#contact" class="btn btn-secondary" aria-label="Me contacter">
                            <span class="btn-text">Me contacter</span>
                        </a>
                    </div>
                </div>

                <div class="scroll-indicator" aria-hidden="true">
                    <div class="scroll-line"></div>
                    <span class="scroll-text">Défiler</span>
                </div>
            </section>
        `,
        init: function() {
            // Animation des lettres du titre
            const name = "Karl";
            const surname = "Forterre";
            const line1 = document.getElementById('cine-title-line-1');
            const line2 = document.getElementById('cine-title-line-2');

            if (line1 && line2) {
                name.split('').forEach((letter, i) => {
                    const span = document.createElement('span');
                    span.className = 'title-letter';
                    span.textContent = letter;
                    span.style.animationDelay = (i * 0.1 + 0.8) + 's';
                    line1.appendChild(span);
                });

                surname.split('').forEach((letter, i) => {
                    const span = document.createElement('span');
                    span.className = 'title-letter title-accent';
                    span.textContent = letter;
                    span.style.animationDelay = (i * 0.08 + 1.2) + 's';
                    line2.appendChild(span);
                });
            }

            // Créer les particules
            const container = document.getElementById('cine-particles');
            if (container) {
                for (let i = 0; i < 40; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.width = (Math.random() * 4 + 2) + 'px';
                    particle.style.height = particle.style.width;
                    particle.style.animationDelay = Math.random() * 12 + 's';
                    particle.style.animationDuration = (Math.random() * 6 + 8) + 's';
                    container.appendChild(particle);
                }
            }
        }
    },

    /**
     * ========================================
     * HEADER 2 - SPLIT SCREEN
     * Split screen interactif avec photo
     * ========================================
     */
    splitscreen: {
        id: 2,
        name: 'splitscreen',
        description: 'Header split screen interactif',
        styles: `
            /* === HERO SPLIT SCREEN === */
            .hero--splitscreen {
                display: flex;
                min-height: 100vh;
                position: relative;
                align-items: stretch;
                justify-content: flex-start;
            }

            .hero--splitscreen .hero-left {
                width: 50%;
                min-height: 100vh;
                height: 100vh;
                position: relative;
                overflow: hidden;
                transition: width 0.6s var(--ease-out-expo);
                flex-shrink: 0;
            }

            .hero--splitscreen .hero-left.expanded { width: 60%; }
            .hero--splitscreen .hero-left.shrunk { width: 40%; }

            .hero--splitscreen .hero-image {
                position: absolute;
                inset: 0;
                background: url('images/auteur/photo-auteur.webp') center/cover;
                filter: grayscale(100%);
                transition: filter 0.6s ease, transform 0.6s ease;
            }

            .hero--splitscreen .hero-left:hover .hero-image,
            .hero--splitscreen .hero-left.expanded .hero-image {
                filter: grayscale(0%);
                transform: scale(1.05);
            }

            .hero--splitscreen .hero-left-overlay {
                position: absolute;
                inset: 0;
                background: linear-gradient(to right, transparent 60%, var(--color-primary));
                z-index: var(--z-header-overlay);
            }

            .hero--splitscreen .hero-left-content {
                position: absolute;
                bottom: 4rem;
                left: 3rem;
                z-index: var(--z-header-content);
                opacity: 0;
                transform: translateY(20px);
                transition: all var(--duration-medium) ease 0.2s;
            }

            .hero--splitscreen .hero-left:hover .hero-left-content,
            .hero--splitscreen .hero-left.expanded .hero-left-content {
                opacity: 1;
                transform: translateY(0);
            }

            .hero--splitscreen .photo-caption {
                font-family: var(--font-heading);
                font-size: 1.2rem;
                font-style: italic;
                color: var(--color-surface);
                text-shadow: 0 2px 20px rgba(0,0,0,0.5);
            }

            .hero--splitscreen .hero-right {
                width: 50%;
                min-height: 100vh;
                height: 100vh;
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: var(--space-3xl);
                position: relative;
                overflow: hidden;
                transition: width 0.6s var(--ease-out-expo);
                flex-shrink: 0;
            }

            .hero--splitscreen .hero-right.expanded { width: 60%; }
            .hero--splitscreen .hero-right.shrunk { width: 40%; }

            .hero--splitscreen .bg-shape {
                position: absolute;
                border-radius: 50%;
                opacity: 0.05;
                pointer-events: none;
            }

            .hero--splitscreen .bg-shape-1 {
                width: 400px;
                height: 400px;
                background: var(--color-accent);
                top: -100px;
                right: -100px;
                animation: split-float 8s ease-in-out infinite;
            }

            .hero--splitscreen .bg-shape-2 {
                width: 300px;
                height: 300px;
                border: 2px solid var(--color-accent);
                bottom: -50px;
                left: -50px;
                animation: split-float 10s ease-in-out infinite reverse;
            }

            @keyframes split-float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-30px) rotate(10deg); }
            }

            .hero--splitscreen .hero-content {
                position: relative;
                z-index: var(--z-header-content);
                display: block;
                grid-template-columns: none;
                max-width: 500px;
                width: auto;
                padding: 0;
                gap: 0;
            }

            .hero--splitscreen .hero-subtitle {
                display: block;
                font-size: 0.85rem;
                font-weight: 600;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                color: var(--color-accent);
                margin-bottom: var(--space-lg);
                opacity: 0;
                animation: split-slide-in var(--duration-slow) ease forwards 0.3s;
            }

            @keyframes split-slide-in {
                from { opacity: 0; transform: translateX(-30px); }
                to { opacity: 1; transform: translateX(0); }
            }

            .hero--splitscreen .hero-title {
                display: block;
                font-family: var(--font-heading);
                font-size: clamp(3rem, 6vw, 5rem);
                font-weight: 400;
                color: var(--color-surface);
                line-height: 1.1;
                margin-bottom: var(--space-lg);
                opacity: 0;
                animation: split-slide-in var(--duration-slow) ease forwards 0.5s;
            }

            .hero--splitscreen .title-highlight {
                position: relative;
                display: inline-block;
            }

            .hero--splitscreen .title-highlight::after {
                content: '';
                position: absolute;
                bottom: 5px;
                left: 0;
                width: 100%;
                height: 8px;
                background: var(--color-accent);
                opacity: 0.3;
                z-index: -1;
                transform: scaleX(0);
                transform-origin: left;
                animation: split-underline var(--duration-slow) ease forwards 1.2s;
            }

            @keyframes split-underline { to { transform: scaleX(1); } }

            .hero--splitscreen .hero-tagline {
                font-family: var(--font-heading);
                font-size: 1.3rem;
                font-style: italic;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: var(--space-xl);
                opacity: 0;
                animation: split-slide-in var(--duration-slow) ease forwards 0.7s;
                white-space: normal;
                display: block;
                width: 100%;
            }

            .hero--splitscreen .hero-cta {
                display: flex;
                gap: var(--space-md);
                opacity: 0;
                animation: split-slide-in var(--duration-slow) ease forwards 0.9s;
            }

            .hero--splitscreen .hero-divider {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 50%;
                width: 4px;
                background: var(--color-accent);
                z-index: var(--z-divider);
                transition: left 0.6s var(--ease-out-expo);
            }

            .hero--splitscreen .divider-drag {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: var(--color-accent);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform var(--duration-fast) ease;
                cursor: ew-resize;
            }

            .hero--splitscreen .divider-drag:hover {
                transform: translate(-50%, -50%) scale(1.2);
            }

            .hero--splitscreen .divider-drag svg {
                width: 24px;
                height: 24px;
                stroke: var(--color-primary);
            }

            .hero--splitscreen .scroll-hint {
                position: absolute;
                bottom: 3rem;
                left: 50%;
                transform: translateX(-50%);
                z-index: 60;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-sm);
                color: var(--color-surface);
                font-size: 0.7rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                animation: split-bounce 2s ease-in-out infinite;
            }

            @keyframes split-bounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-10px); }
            }

            .hero--splitscreen .scroll-hint svg {
                width: 24px;
                height: 24px;
                stroke: var(--color-accent);
            }

            /* Responsive 1024px */
            @media (max-width: 1024px) {
                .hero--splitscreen {
                    flex-direction: column;
                }
                .hero--splitscreen .hero-left,
                .hero--splitscreen .hero-right {
                    width: 100% !important;
                    min-height: 50vh;
                }
                .hero--splitscreen .hero-divider {
                    display: none;
                }
                .hero--splitscreen .hero-right {
                    padding: var(--space-2xl);
                }
            }
        `,
        html: `
            <section class="hero hero--splitscreen" id="hero" data-header-id="2" role="banner">
                <div class="hero-left" id="split-hero-left">
                    <div class="hero-image" role="img" aria-label="Portrait de Karl Forterre"></div>
                    <div class="hero-left-overlay"></div>
                    <div class="hero-left-content">
                        <p class="photo-caption">L'auteur derrière les mots</p>
                    </div>
                </div>

                <div class="hero-divider" id="split-hero-divider" aria-hidden="true">
                    <div class="divider-drag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8L22 12L18 16"/>
                            <path d="M6 8L2 12L6 16"/>
                        </svg>
                    </div>
                </div>

                <div class="hero-right" id="split-hero-right">
                    <div class="bg-shape bg-shape-1" aria-hidden="true"></div>
                    <div class="bg-shape bg-shape-2" aria-hidden="true"></div>

                    <div class="hero-content">
                        <p class="hero-subtitle">Auteur</p>
                        <h1 class="hero-title">
                            <span class="title-highlight">Karl</span><br>
                            Forterre
                        </h1>
                        <p class="hero-tagline">Les belles lettres font les bons mots.</p>

                        <div class="hero-cta">
                            <a href="#books" class="btn btn-primary" aria-label="Découvrir mes œuvres">
                                <span class="btn-text">Mes œuvres</span>
                                <span class="btn-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </span>
                            </a>
                            <a href="#contact" class="btn btn-secondary" aria-label="Me contacter">
                                <span class="btn-text">Contact</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="scroll-hint" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                    <span>Défiler</span>
                </div>
            </section>
        `,
        init: function() {
            const heroLeft = document.getElementById('split-hero-left');
            const heroRight = document.getElementById('split-hero-right');
            const divider = document.getElementById('split-hero-divider');

            if (heroLeft && heroRight && divider) {
                heroLeft.addEventListener('mouseenter', () => {
                    heroLeft.classList.add('expanded');
                    heroRight.classList.add('shrunk');
                    divider.style.left = '60%';
                });

                heroLeft.addEventListener('mouseleave', () => {
                    heroLeft.classList.remove('expanded');
                    heroRight.classList.remove('shrunk');
                    divider.style.left = '50%';
                });

                heroRight.addEventListener('mouseenter', () => {
                    heroRight.classList.add('expanded');
                    heroLeft.classList.add('shrunk');
                    divider.style.left = '40%';
                });

                heroRight.addEventListener('mouseleave', () => {
                    heroRight.classList.remove('expanded');
                    heroLeft.classList.remove('shrunk');
                    divider.style.left = '50%';
                });
            }
        }
    },

    /**
     * ========================================
     * HEADER 3 - TYPOGRAPHIE
     * Lettres géantes KARL FORTERRE
     * (utilise .btn-sphere de styles.css)
     * ========================================
     */
    typographie: {
        id: 3,
        name: 'typographie',
        description: 'Header avec lettres géantes et boutons billes',
        styles: `
            /* === HERO TYPOGRAPHIE === */
            .hero--typographie {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
            }

            .hero--typographie .hero-bg {
                position: absolute;
                inset: 0;
                background:
                    radial-gradient(ellipse at 20% 50%, rgba(201, 169, 98, 0.1) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 50%, rgba(201, 169, 98, 0.05) 0%, transparent 50%);
                pointer-events: none;
            }

            .hero--typographie .hero-content {
                position: relative;
                z-index: var(--z-header-content);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 6rem 2rem 2rem;
                gap: 0;
            }

            .hero--typographie .hero-subtitle {
                font-size: 0.9rem;
                font-weight: 500;
                letter-spacing: 0.4em;
                text-transform: uppercase;
                color: var(--color-accent);
                margin-bottom: var(--space-lg);
                animation: typo-fade-in 1s ease both 0.3s;
            }

            .hero--typographie .giant-text {
                font-family: var(--font-heading);
                font-size: clamp(10vw, 14vw, 18vw);
                font-weight: 400;
                line-height: 0.9;
                letter-spacing: -0.03em;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .hero--typographie .text-line {
                display: flex;
                justify-content: center;
            }

            .hero--typographie .letter {
                display: inline-block;
                position: relative;
                transition: all var(--duration-medium) var(--ease-out-expo);
                cursor: default;
                opacity: 1;
                animation: typo-letter-in var(--duration-slow) ease both;
            }

            /* Couleurs des lettres */
            .hero--typographie .letter:nth-child(1) { color: var(--color-surface); }
            .hero--typographie .letter:nth-child(2) { color: var(--color-accent); }
            .hero--typographie .letter:nth-child(3) { color: var(--color-accent); }
            .hero--typographie .letter:nth-child(4) { color: rgba(255,255,255,0.7); }
            .hero--typographie .letter:nth-child(5) { color: var(--color-surface); }
            .hero--typographie .letter:nth-child(6) { color: var(--color-accent-light); }
            .hero--typographie .letter:nth-child(7) { color: var(--color-accent); }
            .hero--typographie .letter:nth-child(8) { color: var(--color-surface); }

            .hero--typographie .text-line:first-child .letter:nth-child(1) { animation-delay: 0.1s; }
            .hero--typographie .text-line:first-child .letter:nth-child(2) { animation-delay: 0.15s; }
            .hero--typographie .text-line:first-child .letter:nth-child(3) { animation-delay: 0.2s; }
            .hero--typographie .text-line:first-child .letter:nth-child(4) { animation-delay: 0.25s; }
            .hero--typographie .text-line:last-child .letter:nth-child(1) { animation-delay: 0.4s; }
            .hero--typographie .text-line:last-child .letter:nth-child(2) { animation-delay: 0.45s; }
            .hero--typographie .text-line:last-child .letter:nth-child(3) { animation-delay: 0.5s; }
            .hero--typographie .text-line:last-child .letter:nth-child(4) { animation-delay: 0.55s; }
            .hero--typographie .text-line:last-child .letter:nth-child(5) { animation-delay: 0.6s; }
            .hero--typographie .text-line:last-child .letter:nth-child(6) { animation-delay: 0.65s; }
            .hero--typographie .text-line:last-child .letter:nth-child(7) { animation-delay: 0.7s; }
            .hero--typographie .text-line:last-child .letter:nth-child(8) { animation-delay: 0.75s; }

            .hero--typographie .letter:hover {
                transform: translateY(-20px) rotate(-5deg);
                color: var(--color-accent) !important;
                text-shadow: 0 20px 60px rgba(201, 169, 98, 0.5);
            }

            .hero--typographie .hero-bottom-zone {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-xl);
                padding: var(--space-md) var(--space-2xl);
                margin-top: var(--space-xl);
            }

            .hero--typographie .hero-tagline {
                font-family: var(--font-heading);
                font-size: clamp(1.2rem, 2.5vw, 1.6rem);
                font-style: italic;
                font-weight: 400;
                color: var(--color-surface);
                text-align: center;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                animation: typo-fade-in 1s ease both 1s;
            }

            .hero--typographie .hero-cta {
                display: flex;
                gap: var(--space-xl);
                animation: typo-fade-up 1s ease both 1.3s;
            }

            /* Animations */
            @keyframes typo-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes typo-fade-up {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes typo-letter-in {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Responsive 768px */
            @media (max-width: 768px) {
                .hero--typographie .giant-text {
                    font-size: clamp(15vw, 18vw, 22vw);
                }
                .hero--typographie .hero-cta {
                    flex-direction: column;
                    gap: var(--space-lg);
                }
            }
        `,
        html: `
            <section class="hero hero--typographie" id="hero" data-header-id="3" role="banner">
                <div class="hero-bg" aria-hidden="true"></div>
                <div class="hero-content">
                    <p class="hero-subtitle">Auteur</p>

                    <div class="giant-text">
                        <div class="text-line">
                            <span class="letter">K</span>
                            <span class="letter">A</span>
                            <span class="letter">R</span>
                            <span class="letter">L</span>
                        </div>
                        <div class="text-line">
                            <span class="letter">F</span>
                            <span class="letter">O</span>
                            <span class="letter">R</span>
                            <span class="letter">T</span>
                            <span class="letter">E</span>
                            <span class="letter">R</span>
                            <span class="letter">R</span>
                            <span class="letter">E</span>
                        </div>
                    </div>

                    <div class="hero-bottom-zone">
                        <p class="hero-tagline">« Les belles lettres font les bons mots. »</p>

                        <div class="hero-cta">
                            <a href="#books" class="btn-sphere btn-sphere--primary" aria-label="Découvrir mes écrits">
                                <span class="sphere-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                    </svg>
                                </span>
                                <span class="sphere-label">Découvrir mes écrits</span>
                            </a>
                            <a href="#contact" class="btn-sphere btn-sphere--secondary" aria-label="Me contacter">
                                <span class="sphere-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </span>
                                <span class="sphere-label">Me contacter</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        `,
        init: function() {
            // Animation des lettres au survol
            const letters = document.querySelectorAll('.hero--typographie .letter');
            letters.forEach(letter => {
                letter.addEventListener('mousemove', (e) => {
                    const rect = letter.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    letter.style.transform = `translateX(${x * 0.1}px) translateY(${y * 0.1}px) rotateX(${-y * 0.05}deg) rotateY(${x * 0.05}deg)`;
                });
                letter.addEventListener('mouseleave', () => {
                    letter.style.transform = '';
                });
            });
        }
    },

    /**
     * ========================================
     * HEADER 4 - ENCRE
     * Blobs fluides, SVG animé
     * ========================================
     */
    encre: {
        id: 4,
        name: 'encre',
        description: 'Header encre fluide avec blobs animés',
        styles: `
            /* === HERO ENCRE === */
            .hero--encre {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                background: var(--color-primary);
            }

            .hero--encre .ink-blob {
                position: absolute;
                border-radius: 50%;
                filter: blur(80px);
                opacity: 0.4;
                animation: encre-blob-morph 15s ease-in-out infinite;
            }

            .hero--encre .blob-1 {
                width: 600px;
                height: 600px;
                background: var(--color-ink-blue);
                top: -200px;
                left: -200px;
            }

            .hero--encre .blob-2 {
                width: 500px;
                height: 500px;
                background: var(--color-accent);
                bottom: -150px;
                right: -150px;
                animation-delay: -5s;
            }

            .hero--encre .blob-3 {
                width: 400px;
                height: 400px;
                background: var(--color-ink-gold);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation-delay: -10s;
            }

            @keyframes encre-blob-morph {
                0%, 100% {
                    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                    transform: rotate(0deg) scale(1);
                }
                50% {
                    border-radius: 50% 60% 30% 60% / 30% 50% 70% 50%;
                    transform: rotate(180deg) scale(1.1);
                }
            }

            .hero--encre .hero-content {
                position: relative;
                z-index: var(--z-header-content);
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                max-width: 900px;
                padding: 0 var(--space-xl);
                width: auto;
                gap: 0;
            }

            /* SVG Title */
            .hero--encre .svg-title {
                width: 100%;
                max-width: 800px;
                height: auto;
                margin: 0 auto;
            }

            .hero--encre .svg-title text {
                font-family: var(--font-heading);
                font-size: 120px;
                fill: none;
                stroke: var(--color-surface);
                stroke-width: 1;
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: encre-draw-text 3s ease forwards 0.5s;
            }

            .hero--encre .svg-title .fill-text {
                fill: var(--color-surface);
                stroke: none;
                opacity: 0;
                animation: encre-fill-in 1s ease forwards 2.5s;
            }

            @keyframes encre-draw-text {
                to { stroke-dashoffset: 0; }
            }

            @keyframes encre-fill-in {
                to { opacity: 1; }
            }

            .hero--encre .hero-tagline {
                font-family: var(--font-heading);
                font-size: clamp(1.2rem, 2.5vw, 1.6rem);
                font-style: italic;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: var(--space-2xl);
                opacity: 0;
                animation: encre-drip-in 1s ease forwards 3s;
            }

            @keyframes encre-drip-in {
                0% { opacity: 0; transform: translateY(-20px); filter: blur(10px); }
                100% { opacity: 1; transform: translateY(0); filter: blur(0); }
            }

            .hero--encre .hero-cta {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: var(--space-2xl);
                opacity: 0;
                animation: encre-drip-in 1s ease forwards 3.5s;
            }

            .hero--encre .scroll-indicator {
                position: absolute;
                bottom: 3rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-md);
                opacity: 0;
                animation: encre-drip-in 1s ease forwards 4s;
                z-index: var(--z-header-scroll);
            }

            .hero--encre .ink-line {
                width: 1px;
                height: 60px;
                background: linear-gradient(to bottom, var(--color-accent), transparent);
                position: relative;
                overflow: hidden;
            }

            .hero--encre .ink-line::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 10px;
                background: var(--color-surface);
                animation: encre-ink-drop 2s ease-in-out infinite;
            }

            @keyframes encre-ink-drop {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(700%); }
            }

            .hero--encre .scroll-text {
                font-size: 0.7rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.5);
            }

            /* Responsive 768px */
            @media (max-width: 768px) {
                .hero--encre .hero-cta {
                    flex-direction: column;
                    gap: var(--space-lg);
                }

                .hero--encre .ink-blob {
                    filter: blur(60px);
                    opacity: 0.3;
                }
            }
        `,
        html: `
            <section class="hero hero--encre" id="hero" data-header-id="4" role="banner">
                <div class="ink-blob blob-1" aria-hidden="true"></div>
                <div class="ink-blob blob-2" aria-hidden="true"></div>
                <div class="ink-blob blob-3" aria-hidden="true"></div>

                <div class="hero-content">
                    <svg class="svg-title" viewBox="0 0 800 250" aria-label="Karl Forterre">
                        <text x="50%" y="80" text-anchor="middle">Karl</text>
                        <text x="50%" y="80" text-anchor="middle" class="fill-text">Karl</text>
                        <text x="50%" y="200" text-anchor="middle">Forterre</text>
                        <text x="50%" y="200" text-anchor="middle" class="fill-text">Forterre</text>
                    </svg>

                    <p class="hero-tagline">Les belles lettres font les bons mots.</p>

                    <div class="hero-cta">
                        <a href="#books" class="btn-sphere btn-sphere--primary" aria-label="Découvrir mes écrits">
                            <span class="sphere-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                            </span>
                            <span class="sphere-label">Découvrir mes écrits</span>
                        </a>
                        <a href="#contact" class="btn-sphere btn-sphere--secondary" aria-label="Me contacter">
                            <span class="sphere-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                            </span>
                            <span class="sphere-label">Me contacter</span>
                        </a>
                    </div>
                </div>

                <div class="scroll-indicator" aria-hidden="true">
                    <div class="ink-line"></div>
                    <span class="scroll-text">Défiler</span>
                </div>
            </section>
        `,
        init: null
    },

    /**
     * ========================================
     * HEADER 5 - TYPOGRAPHIE CAPSULES
     * Variante avec banderole défilante
     * ========================================
     */
    typographieCapsules: {
        id: 5,
        name: 'typographie-capsules',
        description: 'Header typographie avec banderole défilante',
        styles: `
            /* === HERO TYPOGRAPHIE CAPSULES === */
            .hero--typographie-capsules {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
            }

            .hero--typographie-capsules .hero-bg {
                position: absolute;
                inset: 0;
                background:
                    radial-gradient(ellipse at 20% 50%, rgba(201, 169, 98, 0.1) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 50%, rgba(201, 169, 98, 0.05) 0%, transparent 50%);
                pointer-events: none;
            }

            .hero--typographie-capsules .hero-content {
                position: relative;
                z-index: var(--z-header-content);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 6rem 2rem 4rem;
                gap: 0;
            }

            .hero--typographie-capsules .giant-text {
                font-family: var(--font-heading);
                font-size: clamp(10vw, 14vw, 18vw);
                font-weight: 400;
                line-height: 0.9;
                letter-spacing: -0.03em;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .hero--typographie-capsules .text-line {
                display: flex;
                justify-content: center;
            }

            .hero--typographie-capsules .letter {
                display: inline-block;
                position: relative;
                transition: all var(--duration-medium) var(--ease-out-expo);
                cursor: default;
                animation: caps-letter-in var(--duration-slow) ease both;
            }

            /* Couleurs des lettres */
            .hero--typographie-capsules .letter:nth-child(1) { color: var(--color-surface); }
            .hero--typographie-capsules .letter:nth-child(2) { color: var(--color-accent); }
            .hero--typographie-capsules .letter:nth-child(3) { color: var(--color-accent); }
            .hero--typographie-capsules .letter:nth-child(4) { color: rgba(255,255,255,0.7); }
            .hero--typographie-capsules .letter:nth-child(5) { color: var(--color-surface); }
            .hero--typographie-capsules .letter:nth-child(6) { color: var(--color-accent-light); }
            .hero--typographie-capsules .letter:nth-child(7) { color: var(--color-accent); }
            .hero--typographie-capsules .letter:nth-child(8) { color: var(--color-surface); }

            .hero--typographie-capsules .text-line:first-child .letter:nth-child(1) { animation-delay: 0.1s; }
            .hero--typographie-capsules .text-line:first-child .letter:nth-child(2) { animation-delay: 0.15s; }
            .hero--typographie-capsules .text-line:first-child .letter:nth-child(3) { animation-delay: 0.2s; }
            .hero--typographie-capsules .text-line:first-child .letter:nth-child(4) { animation-delay: 0.25s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(1) { animation-delay: 0.4s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(2) { animation-delay: 0.45s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(3) { animation-delay: 0.5s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(4) { animation-delay: 0.55s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(5) { animation-delay: 0.6s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(6) { animation-delay: 0.65s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(7) { animation-delay: 0.7s; }
            .hero--typographie-capsules .text-line:last-child .letter:nth-child(8) { animation-delay: 0.75s; }

            .hero--typographie-capsules .letter:hover {
                transform: translateY(-20px) rotate(-5deg);
                color: var(--color-accent) !important;
                text-shadow: 0 20px 60px rgba(201, 169, 98, 0.5);
            }

            .hero--typographie-capsules .hero-bottom-zone {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-xl);
                padding: var(--space-md) var(--space-2xl);
                margin-top: var(--space-xl);
            }

            .hero--typographie-capsules .hero-tagline {
                font-family: var(--font-heading);
                font-size: clamp(1.2rem, 2.5vw, 1.6rem);
                font-style: italic;
                font-weight: 400;
                color: var(--color-surface);
                text-align: center;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                animation: caps-fade-in 1s ease both 1s;
            }

            .hero--typographie-capsules .hero-cta {
                display: flex;
                gap: var(--space-xl);
                animation: caps-fade-up 1s ease both 1.3s;
            }

            /* Banderole défilante */
            .hero--typographie-capsules .scroll-banner {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                overflow: hidden;
                padding: var(--space-md) 0;
                background: rgba(0, 0, 0, 0.3);
                z-index: 5;
            }

            .hero--typographie-capsules .scroll-banner-inner {
                display: flex;
                animation: caps-scroll-left 30s linear infinite;
                white-space: nowrap;
            }

            @keyframes caps-scroll-left {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
            }

            .hero--typographie-capsules .scroll-banner span {
                font-family: var(--font-heading);
                font-size: 0.9rem;
                font-style: italic;
                color: rgba(255, 255, 255, 0.3);
                padding: 0 var(--space-xl);
            }

            /* Animations */
            @keyframes caps-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes caps-fade-up {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes caps-letter-in {
                from { opacity: 0; transform: translateY(50px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Responsive 768px */
            @media (max-width: 768px) {
                .hero--typographie-capsules .giant-text {
                    font-size: clamp(15vw, 18vw, 22vw);
                }
                .hero--typographie-capsules .hero-cta {
                    flex-direction: column;
                    gap: var(--space-lg);
                }
                .hero--typographie-capsules .scroll-banner {
                    display: none;
                }
            }
        `,
        html: `
            <section class="hero hero--typographie-capsules" id="hero" data-header-id="5" role="banner">
                <div class="hero-bg" aria-hidden="true"></div>

                <div class="hero-content">
                    <div class="giant-text">
                        <div class="text-line">
                            <span class="letter">K</span>
                            <span class="letter">A</span>
                            <span class="letter">R</span>
                            <span class="letter">L</span>
                        </div>
                        <div class="text-line">
                            <span class="letter">F</span>
                            <span class="letter">O</span>
                            <span class="letter">R</span>
                            <span class="letter">T</span>
                            <span class="letter">E</span>
                            <span class="letter">R</span>
                            <span class="letter">R</span>
                            <span class="letter">E</span>
                        </div>
                    </div>

                    <div class="hero-bottom-zone">
                        <p class="hero-tagline">« Les belles lettres font les bons mots. »</p>

                        <div class="hero-cta">
                            <a href="#books" class="btn-sphere btn-sphere--primary" aria-label="Découvrir mes écrits">
                                <span class="sphere-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                    </svg>
                                </span>
                                <span class="sphere-label">Découvrir mes écrits</span>
                            </a>
                            <a href="#contact" class="btn-sphere btn-sphere--secondary" aria-label="Me contacter">
                                <span class="sphere-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </span>
                                <span class="sphere-label">Me contacter</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Banderole défilante -->
                <div class="scroll-banner" aria-hidden="true">
                    <div class="scroll-banner-inner">
                        <span>Romans</span><span>•</span>
                        <span>Nouvelles</span><span>•</span>
                        <span>Poésie</span><span>•</span>
                        <span>Écriture</span><span>•</span>
                        <span>Édition</span><span>•</span>
                        <span>Romans</span><span>•</span>
                        <span>Nouvelles</span><span>•</span>
                        <span>Poésie</span><span>•</span>
                        <span>Écriture</span><span>•</span>
                        <span>Édition</span><span>•</span>
                    </div>
                </div>
            </section>
        `,
        init: function() {
            // Animation des lettres au survol
            const letters = document.querySelectorAll('.hero--typographie-capsules .letter');
            letters.forEach(letter => {
                letter.addEventListener('mousemove', (e) => {
                    const rect = letter.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    letter.style.transform = `translateX(${x * 0.1}px) translateY(${y * 0.1}px) rotateX(${-y * 0.05}deg) rotateY(${x * 0.05}deg)`;
                });
                letter.addEventListener('mouseleave', () => {
                    letter.style.transform = '';
                });
            });
        }
    },

    /**
     * Liste des templates disponibles (ordre de l'index)
     */
    get available() {
        return [
            this.principal,
            this.cinematique,
            this.splitscreen,
            this.typographie,
            this.encre,
            this.typographieCapsules
        ];
    },

    /**
     * Template de fallback (en cas d'erreur)
     */
    fallback: {
        id: -1,
        name: 'fallback',
        description: 'Header minimal de secours',
        styles: `
            .hero--fallback {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
                color: var(--color-surface);
                text-align: center;
                padding: var(--space-xl);
            }
            .hero--fallback .subtitle {
                font-size: 0.9rem;
                color: var(--color-accent);
                text-transform: uppercase;
                letter-spacing: 0.4em;
                margin-bottom: var(--space-lg);
            }
            .hero--fallback .title {
                font-family: var(--font-heading);
                font-size: clamp(3rem, 8vw, 6rem);
                font-weight: 400;
                margin-bottom: var(--space-lg);
            }
            .hero--fallback .title span { color: var(--color-accent); }
            .hero--fallback .tagline {
                font-style: italic;
                font-size: 1.3rem;
                color: rgba(255,255,255,0.8);
                margin-bottom: var(--space-xl);
            }
            .hero--fallback .cta { display: flex; gap: var(--space-lg); }
        `,
        html: `
            <section class="hero hero--fallback" id="hero" data-header-id="-1" role="banner">
                <p class="subtitle">Auteur</p>
                <h1 class="title">Karl <span>Forterre</span></h1>
                <p class="tagline">« Les belles lettres font les bons mots. »</p>
                <div class="cta">
                    <a href="#books" class="btn btn-primary" aria-label="Découvrir mes œuvres">Découvrir mes œuvres</a>
                    <a href="#contact" class="btn btn-secondary" aria-label="Me contacter">Me contacter</a>
                </div>
            </section>
        `,
        init: null
    }
};

// Exposer globalement
window.HeaderTemplates = HeaderTemplates;
