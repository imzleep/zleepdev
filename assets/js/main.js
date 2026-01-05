document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Initialization
    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        // Auto-detect browser language
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('tr')) {
            setLanguage('tr');
        } else {
            setLanguage('en');
        }
    }

    // 2. Initialize Cookie Consent
    initCookieConsent();

    // 3. Initialize Carousel
    initCarousel();


});

/* =========================================
   Language Logic
   ========================================= */
function toggleLanguage() {
    const currentLang = localStorage.getItem('selectedLang') === 'tr' ? 'en' : 'tr';
    setLanguage(currentLang);
}

function setLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    document.documentElement.lang = lang;

    // Toggle visibility based on class
    document.querySelectorAll('.lang-tr').forEach(el => {
        el.style.display = lang === 'tr' ? 'block' : 'none';
        // Handle span/inline elements if necessary, but 'block' usually breaks flow in paragraphs.
        // A better approach for inline items is to remove 'display: none' (style='') or set 'display: inline'
        // But the previous HTML structure mostly used blocks or spans that handle block fine.
        // If inline issues occur, we can refine this. For now, matching the HTML structure.
        if (el.tagName === 'SPAN') {
            el.style.display = lang === 'tr' ? 'inline' : 'none';
        }
    });

    document.querySelectorAll('.lang-en').forEach(el => {
        el.style.display = lang === 'en' ? 'block' : 'none';
        if (el.tagName === 'SPAN') {
            el.style.display = lang === 'en' ? 'inline' : 'none';
        }
    });

    // Update Language Button Text
    const btnText = document.getElementById('lang-btn-text');
    if (btnText) {
        btnText.textContent = lang === 'tr' ? 'EN' : 'TR';
    }
}

/* =========================================
   Cookie Consent Logic
   ========================================= */
function initCookieConsent() {
    if (localStorage.getItem('cookieConsent') === 'true') return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'fixed bottom-4 right-4 md:bottom-8 md:right-8 max-w-sm w-[calc(100%-2rem)] bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl z-50 transform transition-all duration-500 translate-y-20 opacity-0';

    // Determine initial text based on CURRENT language setting (already set in step 1)
    // We'll dynamic insert based on class logic like the rest of the site so it toggles instantly

    banner.innerHTML = `
        <div class="flex flex-col gap-4">
            <p class="text-gray-300 text-sm leading-relaxed">
                <span class="lang-tr" style="display: none">Daha iyi bir deneyim sunmak için çerezleri ve yerel depolamayı kullanıyoruz.</span>
                <span class="lang-en" style="display: none">We use cookies and local storage to provide a better experience.</span>
            </p>
            <div class="flex justify-end">
                <button id="accept-cookies" class="px-6 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg text-sm font-medium transition-colors">
                    <span class="lang-tr" style="display: none">Kabul Et</span>
                    <span class="lang-en" style="display: none">Accept</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);

    // Apply current language visibility to the new banner elements immediately
    const currentLang = localStorage.getItem('selectedLang') || 'en';
    setLanguage(currentLang); // Re-run setLanguage to force update specifically for these new DOM elements

    // Animate in
    setTimeout(() => {
        banner.classList.remove('translate-y-20', 'opacity-0');
    }, 100);

    // Handle Click
    const btn = document.getElementById('accept-cookies');
    if (btn) {
        btn.onclick = () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => banner.remove(), 500);
        };
    }
}

/* =========================================
   Carousel Logic (Slide-by-Slide)
   ========================================= */
function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track) return;

    // Config
    const transitionDuration = 700;
    let isAnimating = false;
    let autoScrollInterval;

    // Helper: Get Item Width dynamically
    const getItemWidth = () => {
        const card = track.children[0];
        if (!card) return 0;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 0;
        return card.offsetWidth + gap;
    };

    const moveNext = () => {
        if (isAnimating) return;
        isAnimating = true;

        const itemWidth = getItemWidth();
        track.style.transition = `transform ${transitionDuration}ms ease-in-out`;
        track.style.transform = `translateX(-${itemWidth}px)`;

        setTimeout(() => {
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';

            // Allow next animation slightly after reset
            setTimeout(() => {
                isAnimating = false;
            }, 50);
        }, transitionDuration);
    };

    const movePrev = () => {
        if (isAnimating) return;
        isAnimating = true;

        const itemWidth = getItemWidth();

        // Move last item to start immediately (hidden)
        track.style.transition = 'none';
        track.prepend(track.lastElementChild);
        track.style.transform = `translateX(-${itemWidth}px)`;

        // Force reflow
        void track.offsetWidth;

        // Animate to 0
        track.style.transition = `transform ${transitionDuration}ms ease-in-out`;
        track.style.transform = 'translateX(0)';

        setTimeout(() => {
            isAnimating = false;
        }, transitionDuration);
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        autoScrollInterval = setInterval(moveNext, 4000);
    };

    const stopAutoPlay = () => {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
    };

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', () => {
        moveNext();
        stopAutoPlay();
        startAutoPlay();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
        movePrev();
        stopAutoPlay();
        startAutoPlay();
    });

    // Pause on Hover
    const wrapper = document.getElementById('carouselWindow') || track.parentElement;
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);

    // Touch Support (Basic Swipe)
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) moveNext(); // Swipe Left
        if (touchEndX - touchStartX > 50) movePrev(); // Swipe Right
        startAutoPlay();
    }, { passive: true });

    // Start
    startAutoPlay();
}

