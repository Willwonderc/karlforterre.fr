/**
 * Karl Forterre Portfolio - Advanced JavaScript
 * Handles animations, interactions, and effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCustomCursor();
    initParticles();
    initNavigation();
    initScrollEffects();
    initRevealAnimations();
    initTiltEffect();
    initMagneticButtons();
    initCounterAnimation();
    initSmoothScroll();
    initBackToTop();
    initPortfolio();
    initLightbox();
    initGraphisme();
    initPhotoGallery();
    initUnifiedScrollHandler(); // Consolidated scroll effects (6 listeners → 1)
});

/**
 * Loading Screen
 * Synchronisé avec HeaderLoader pour attendre que le header soit chargé
 */
function initLoader() {
    const loader = document.getElementById('loader');

    if (!loader) return;

    document.body.classList.add('loading');

    let headerLoaded = false;
    let windowLoaded = false;

    function hideLoader() {
        // Attendre que les deux conditions soient remplies
        if (headerLoaded && windowLoaded) {
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading');
            }, 500); // Délai réduit car le header est déjà chargé
        }
    }

    // Écouter l'événement headerLoaded du HeaderLoader
    document.addEventListener('headerLoaded', (e) => {
        headerLoaded = true;
        hideLoader();
    });

    window.addEventListener('load', () => {
        windowLoaded = true;
        // Délai pour les animations initiales
        setTimeout(() => {
            hideLoader();
        }, 1300);
    });

    // Fallback si headerLoaded ne se déclenche pas (ex: pas de HeaderLoader)
    setTimeout(() => {
        if (!headerLoaded) {
            headerLoaded = true;
            hideLoader();
        }
    }, 2500);

    // Fallback absolu
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('loading');
    }, 4000);
}

/**
 * Custom Cursor
 */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;

    // Check for touch device
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        // Follower follows with delay
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .magnetic-btn, .tilt-element');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });
}

/**
 * Floating Particles
 */
function initParticles() {
    const container = document.getElementById('particles');

    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
    `;

    container.appendChild(particle);
}

/**
 * Navigation functionality
 */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Navbar scroll effect and active link now handled by initUnifiedScrollHandler()
}

/**
 * Scroll-triggered effects
 * Note: All scroll effects now handled by initUnifiedScrollHandler() for better performance
 */
function initScrollEffects() {
    // Parallax, scroll indicator, and floating shapes effects
    // are now consolidated in initUnifiedScrollHandler()
}

/**
 * Reveal animations using Intersection Observer
 */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-element');

    if (revealElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay * 1000);

                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/**
 * 3D Tilt Effect
 */
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('.tilt-element');

    if (tiltElements.length === 0 || 'ontouchstart' in window) return;

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

/**
 * Magnetic Button Effect
 */
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.magnetic-btn');

    if (magneticElements.length === 0 || 'ontouchstart' in window) return;

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

/**
 * Counter Animation
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat');

    if (counters.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target.querySelector('.counter');
                const target = parseInt(entry.target.dataset.count);

                animateCounter(counter, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');

    if (!backToTop) return;

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Show/hide based on scroll position now handled by initUnifiedScrollHandler()
}

/**
 * Utility: Throttle function
 */
function throttle(func, limit = 16) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Unified Scroll Handler - Consolidates all scroll effects for better performance
 * Replaces 6 individual scroll listeners with 1 throttled listener
 */
function initUnifiedScrollHandler() {
    // Cache DOM references
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const parallaxElements = document.querySelectorAll('.parallax-element');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const shapes = document.querySelectorAll('.shape');
    const backToTop = document.getElementById('back-to-top');

    // Unified scroll handler
    function handleUnifiedScroll() {
        const scrollY = window.pageYOffset;

        // 1. Navbar scroll effect (was line 223)
        if (navbar) {
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // 2. Active link update (was line 255)
        if (sections.length > 0 && navLinks.length > 0) {
            const scrollYOffset = scrollY + 150;
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (navLink && scrollYOffset > sectionTop && scrollYOffset <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            });
        }

        // 3. Parallax elements (was line 266)
        if (parallaxElements.length > 0) {
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.1;
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
        }

        // 4. Scroll indicator opacity (was line 280)
        if (scrollIndicator) {
            scrollIndicator.style.opacity = scrollY > 100 ? '0' : '1';
        }

        // 5. Floating shapes parallax (was line 289)
        if (shapes.length > 0) {
            shapes.forEach((shape, index) => {
                const speed = 0.05 + (index * 0.02);
                const direction = index % 2 === 0 ? 1 : -1;
                shape.style.transform = `translateY(${scrollY * speed * direction}px)`;
            });
        }

        // 6. Back to top button visibility (was line 633)
        if (backToTop) {
            if (scrollY > 500) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        }
    }

    // Single throttled listener at 60fps (16ms)
    window.addEventListener('scroll', throttle(handleUnifiedScroll, 16));

    // Run once on init to set initial state
    handleUnifiedScroll();
}

/**
 * Mouse Move Effect for Hero
 */
document.addEventListener('mousemove', (e) => {
    const heroGlow = document.querySelector('.hero-glow');

    if (heroGlow && window.innerWidth > 768) {
        const x = (e.clientX / window.innerWidth - 0.5) * 50;
        const y = (e.clientY / window.innerHeight - 0.5) * 50;

        heroGlow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
});

/**
 * Intersection Observer for Stars Animation
 */
const starsContainer = document.querySelector('.testimonial-stars');

if (starsContainer) {
    const starsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stars = entry.target.querySelectorAll('.star');
                stars.forEach((star, i) => {
                    star.style.animationPlayState = 'running';
                });
                starsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    starsObserver.observe(starsContainer);
}

/**
 * Portfolio Showcase - Random 3 Works
 */
function initPortfolio() {
    const showcase = document.getElementById('portfolio-showcase');

    if (!showcase) return;

    // Œuvres du portfolio : vignette pour la grille, grande image pour la visionneuse
    const allWorks = [
        { src: 'images/portfolio/portrait-eclate.webp', thumb: 'images/portfolio/portrait-eclate-vignette.webp', title: 'Portrait Éclaté', desc: 'Exploration artistique de la fragmentation identitaire' },
        { src: 'images/portfolio/affiche-le-plan.webp', thumb: 'images/portfolio/affiche-le-plan-vignette.webp', title: 'Le Plan', desc: 'Affiche cinématographique' },
        { src: 'images/portfolio/sphere.webp', thumb: 'images/portfolio/sphere-vignette.webp', title: 'Sphère', desc: 'Abstraction géométrique' },
        { src: 'images/portfolio/pochette.webp', thumb: 'images/portfolio/pochette-vignette.webp', title: 'Pochette', desc: 'Design de pochette musicale' },
        { src: 'images/portfolio/street-color.webp', thumb: 'images/portfolio/street-color-vignette.webp', title: 'Street Color', desc: 'Explosion de couleurs urbaines' },
        { src: 'images/portfolio/harpe-delire.webp', thumb: 'images/portfolio/harpe-delire-vignette.webp', title: 'Harpe Délire', desc: 'Vision onirique musicale' },
        { src: 'images/portfolio/gouttelette.webp', thumb: 'images/portfolio/gouttelette-vignette.webp', title: 'Gouttelette', desc: "L'infiniment petit capturé" },
        { src: 'images/portfolio/revolution.webp', thumb: 'images/portfolio/revolution-vignette.webp', title: 'Révolution', desc: 'Affiche engagée' },
        { src: 'images/portfolio/danseur.webp', thumb: 'images/portfolio/danseur-vignette.webp', title: 'Danseur', desc: 'Capture du mouvement' },
        { src: 'images/portfolio/route-mystique.webp', thumb: 'images/portfolio/route-mystique-vignette.webp', title: 'Route Mystique', desc: "Voyage vers l'inconnu" },
        { src: 'images/portfolio/cosmos.webp', thumb: 'images/portfolio/cosmos-vignette.webp', title: 'Cosmos', desc: "L'infini à portée de main" },
        { src: 'images/portfolio/bateau-spatial.webp', thumb: 'images/portfolio/bateau-spatial-vignette.webp', title: 'Bateau Spatial', desc: 'Concept art futuriste' },
        { src: 'images/portfolio/vanite.webp', thumb: 'images/portfolio/vanite-vignette.webp', title: 'Vanité', desc: "Réflexion sur l'éphémère" },
        { src: 'images/portfolio/ninja.webp', thumb: 'images/portfolio/ninja-vignette.webp', title: 'Ninja', desc: 'Mystère et ombre' },
        { src: 'images/portfolio/ete-d-amour.webp', thumb: 'images/portfolio/ete-d-amour-vignette.webp', title: "Été d'Amour", desc: 'Composition estivale romantique' },
        { src: 'images/portfolio/petrole-et-reves.webp', thumb: 'images/portfolio/petrole-et-reves-vignette.webp', title: 'Pétrole et Rêves', desc: 'Vision industrielle onirique' },
        { src: 'images/portfolio/citrouillesque.webp', thumb: 'images/portfolio/citrouillesque-vignette.webp', title: 'Citrouillesque', desc: "Art d'automne fantaisiste" },
        { src: 'images/portfolio/dj-transparent.webp', thumb: 'images/portfolio/dj-transparent-vignette.webp', title: 'DJ Transparent', desc: 'Art musical contemporain' },
        { src: 'images/portfolio/time-machine.webp', thumb: 'images/portfolio/time-machine-vignette.webp', title: 'Time Machine', desc: 'Voyage temporel visuel' },
        { src: 'images/portfolio/potentiel.webp', thumb: 'images/portfolio/potentiel-vignette.webp', title: 'Potentiel', desc: 'Expression abstraite du possible' },
        { src: 'images/portfolio/bibliotheque.webp', thumb: 'images/portfolio/bibliotheque-vignette.webp', title: 'Bibliothèque', desc: 'Univers littéraire visuel' },
        { src: 'images/portfolio/cookie.webp', thumb: 'images/portfolio/cookie-vignette.webp', title: 'Cookie', desc: 'Art gourmand' },
        { src: 'images/portfolio/boule.webp', thumb: 'images/portfolio/boule-vignette.webp', title: 'Boule', desc: 'Géométrie parfaite' },
        { src: 'images/portfolio/fonderie.webp', thumb: 'images/portfolio/fonderie-vignette.webp', title: 'Fonderie', desc: 'Ambiance industrielle' },
        { src: 'images/portfolio/remerciement.webp', thumb: 'images/portfolio/remerciement-vignette.webp', title: 'Remerciement', desc: 'Expression de gratitude visuelle' }
    ];

    // Shuffle and select 3 random works
    const shuffled = allWorks.sort(() => Math.random() - 0.5);
    const selectedWorks = shuffled.slice(0, 3);

    // Store data for lightbox navigation
    portfolioShowcaseData = selectedWorks;

    // Create showcase items
    selectedWorks.forEach((work, index) => {
        const item = document.createElement('article');
        item.className = 'portfolio-showcase-item';
        item.style.animationDelay = `${index * 0.15}s`;
        item.innerHTML = `
            <div class="portfolio-image">
                <img src="${work.thumb}" alt="${work.title}" loading="lazy">
            </div>
            <div class="portfolio-showcase-info">
                <h3 class="portfolio-showcase-title">${work.title}</h3>
                <p class="portfolio-showcase-desc">${work.desc}</p>
            </div>
        `;

        // Click to open in lightbox
        item.addEventListener('click', () => {
            openShowcaseLightbox(index);
        });

        showcase.appendChild(item);
    });
}

// Portfolio showcase gallery data (will be populated by initPortfolio)
let portfolioShowcaseData = [];

function openShowcaseLightbox(index) {
    if (window.lightboxState && portfolioShowcaseData.length > 0) {
        window.lightboxState.open(portfolioShowcaseData, index);
    }
}

/**
 * Lightbox Gallery - Universal
 */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox?.querySelector('.lightbox-image');
    const lightboxTitle = lightbox?.querySelector('.lightbox-title');
    const lightboxDesc = lightbox?.querySelector('.lightbox-desc');
    const closeBtn = lightbox?.querySelector('.lightbox-close');
    const prevBtn = lightbox?.querySelector('.lightbox-prev');
    const nextBtn = lightbox?.querySelector('.lightbox-next');

    if (!lightbox) return;

    let currentIndex = 0;
    let currentGallery = [];

    // Global lightbox state
    window.lightboxState = {
        open: function(gallery, index) {
            currentGallery = gallery;
            currentIndex = index;
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Show/hide navigation based on gallery size
            if (currentGallery.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = '';
                nextBtn.style.display = '';
            }
        },
        close: closeLightbox
    };

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Update lightbox content
    function updateLightboxContent() {
        const data = currentGallery[currentIndex];
        if (!data) return;

        lightboxImage.style.opacity = '0';

        setTimeout(() => {
            lightboxImage.src = data.src;
            lightboxImage.alt = data.title || 'Image';
            lightboxTitle.textContent = data.title || '';
            lightboxDesc.textContent = data.desc || '';
            lightboxImage.style.opacity = '1';
        }, 200);
    }

    // Navigate to previous
    function showPrev() {
        if (currentGallery.length <= 1) return;
        currentIndex = currentIndex > 0 ? currentIndex - 1 : currentGallery.length - 1;
        updateLightboxContent();
    }

    // Navigate to next
    function showNext() {
        if (currentGallery.length <= 1) return;
        currentIndex = currentIndex < currentGallery.length - 1 ? currentIndex + 1 : 0;
        updateLightboxContent();
    }

    // Event listeners
    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', showPrev);
    nextBtn?.addEventListener('click', showNext);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                showNext();
            } else {
                showPrev();
            }
        }
    }
}

/**
 * Photo Carousel - Fullscreen Gallery
 */
let carouselState = {
    currentIndex: 0,
    autoplay: true,
    autoplayInterval: null,
    autoplayDuration: 5000,
    photos: []
};

function initPhotoCarousel() {
    const container = document.getElementById('photoCarousel');
    if (!container) return;

    const carouselMain = container.querySelector('.carousel-main');
    const thumbnailsContainer = document.getElementById('carouselThumbnails');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const slideTitle = document.getElementById('slideTitle');
    const slideDesc = document.getElementById('slideDesc');
    const currentNum = document.getElementById('currentNum');
    const totalNum = document.getElementById('totalNum');
    const progressFill = document.getElementById('progressFill');
    const autoplayToggle = document.getElementById('autoplayToggle');
    const lienPhoto = document.getElementById('carouselLien');

    // Photos les plus vues sur Pexels (relevé du 24 septembre 2026) : numéro Pexels, titre, légende.
    // L'image vient de Pexels ; « Voir la photo » ouvre sa page sur le site photo, qui mène au téléchargement.
    const allPhotos = [
        { id: '13102252', title: 'Croissant de lune au crépuscule', desc: 'Un fin croissant de lune dans le dégradé du soir.' },
        { id: '27116682', title: 'Ciel étoilé', desc: "Un ciel sombre semé d'étoiles, traversé par la Voie lactée." },
        { id: '13087478', title: 'Chemin sous les arbres', desc: "Un chemin de terre bordé d'arbres, un jour d'été à Moyemont." },
        { id: '19047681', title: 'Train à quai', desc: "Un train en gare vu d'en haut, en noir et blanc." },
        { id: '34894953', title: 'Le phare du Loup', desc: 'Un phare solitaire dans une mer de brume.' },
        { id: '31514838', title: 'Rose', desc: "La délicatesse des pétales d'une rose, en gros plan." },
        { id: '23414381', title: 'Notre-Dame de Niort', desc: "Les flèches gothiques de l'église Notre-Dame au-dessus des toits de Niort." },
        { id: '38694057', title: 'Les jardins de Villandry', desc: 'Les parterres du château de Villandry, vus du ciel.' }
    ];
    const pexels = (photo, largeur) => `https://images.pexels.com/photos/${photo.id}/pexels-photo-${photo.id}.jpeg?auto=compress&cs=tinysrgb&w=${largeur}`;
    const pagePhoto = (photo) => `https://photos.karlforterre.fr/photo/${photo.id}/`;

    // Shuffle and select 8 photos
    const shuffled = allPhotos.sort(() => Math.random() - 0.5);
    carouselState.photos = shuffled.slice(0, 8);

    // Update total counter
    totalNum.textContent = String(carouselState.photos.length).padStart(2, '0');

    // Create slides and thumbnails
    carouselState.photos.forEach((photo, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;
        slide.dataset.title = photo.title;
        slide.dataset.desc = photo.desc;
        slide.innerHTML = `<img src="${pexels(photo, 1920)}" srcset="${pexels(photo, 960)} 960w, ${pexels(photo, 1920)} 1920w" sizes="100vw" alt="${photo.title}" loading="${index === 0 ? 'eager' : 'lazy'}">`;
        carouselMain.appendChild(slide);

        // Create thumbnail
        const thumb = document.createElement('div');
        thumb.className = `carousel-thumbnail${index === 0 ? ' active' : ''}`;
        thumb.innerHTML = `<img src="${pexels(photo, 240)}" alt="Miniature ${index + 1}" loading="lazy">`;
        thumb.addEventListener('click', () => {
            goToSlide(index);
            if (carouselState.autoplay) startAutoplay();
        });
        thumbnailsContainer.appendChild(thumb);
    });

    // Initialize first slide content
    updateSlideContent();

    // Navigation functions
    function updateSlide() {
        const slides = carouselMain.querySelectorAll('.carousel-slide');
        const thumbs = thumbnailsContainer.querySelectorAll('.carousel-thumbnail');

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === carouselState.currentIndex);
        });
        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === carouselState.currentIndex);
        });

        updateSlideContent();
        resetProgress();
    }

    function updateSlideContent() {
        const photo = carouselState.photos[carouselState.currentIndex];
        slideTitle.textContent = photo.title;
        slideDesc.textContent = photo.desc;
        currentNum.textContent = String(carouselState.currentIndex + 1).padStart(2, '0');
        if (lienPhoto) lienPhoto.href = pagePhoto(photo);
    }

    function nextSlide() {
        carouselState.currentIndex = (carouselState.currentIndex + 1) % carouselState.photos.length;
        updateSlide();
    }

    function prevSlide() {
        carouselState.currentIndex = (carouselState.currentIndex - 1 + carouselState.photos.length) % carouselState.photos.length;
        updateSlide();
    }

    function goToSlide(index) {
        carouselState.currentIndex = index;
        updateSlide();
    }

    function resetProgress() {
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';

        if (carouselState.autoplay) {
            setTimeout(() => {
                progressFill.style.transition = `width ${carouselState.autoplayDuration}ms linear`;
                progressFill.style.width = '100%';
            }, 50);
        }
    }

    function startAutoplay() {
        if (carouselState.autoplayInterval) clearInterval(carouselState.autoplayInterval);
        carouselState.autoplayInterval = setInterval(nextSlide, carouselState.autoplayDuration);
        resetProgress();
    }

    function stopAutoplay() {
        if (carouselState.autoplayInterval) clearInterval(carouselState.autoplayInterval);
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
    }

    // Event listeners
    prevBtn.addEventListener('click', () => {
        prevSlide();
        if (carouselState.autoplay) startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        if (carouselState.autoplay) startAutoplay();
    });

    autoplayToggle.addEventListener('click', () => {
        carouselState.autoplay = !carouselState.autoplay;
        autoplayToggle.classList.toggle('active', carouselState.autoplay);
        if (carouselState.autoplay) {
            startAutoplay();
        } else {
            stopAutoplay();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only respond if carousel is in viewport
        const rect = container.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (!isInViewport) return;

        if (e.key === 'ArrowRight') {
            nextSlide();
            if (carouselState.autoplay) startAutoplay();
        }
        if (e.key === 'ArrowLeft') {
            prevSlide();
            if (carouselState.autoplay) startAutoplay();
        }
    });

    // Balayage du doigt sur téléphone et tablette
    let departX = null;
    container.addEventListener('touchstart', (e) => {
        departX = e.changedTouches[0].screenX;
    }, { passive: true });
    container.addEventListener('touchend', (e) => {
        if (departX === null) return;
        const ecart = departX - e.changedTouches[0].screenX;
        departX = null;
        if (Math.abs(ecart) < 50) return;
        if (ecart > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        if (carouselState.autoplay) startAutoplay();
    }, { passive: true });

    // Start autoplay
    startAutoplay();
}

/**
 * Galerie Graphisme : chaque vignette ouvre la visionneuse sur les images de son projet
 */
function initGraphisme() {
    document.querySelectorAll('.graphisme-projet').forEach(projet => {
        const titreProjet = projet.querySelector('.graphisme-titre')?.textContent || '';
        const vignettes = Array.from(projet.querySelectorAll('.graphisme-vignette'));
        const galerie = vignettes.map(v => ({ src: v.dataset.grand, title: v.dataset.titre, desc: titreProjet }));

        vignettes.forEach((vignette, index) => {
            vignette.addEventListener('click', () => {
                if (window.lightboxState) window.lightboxState.open(galerie, index);
            });
        });
    });
}

// Legacy function name for compatibility
function initPhotoGallery() {
    initPhotoCarousel();
}
