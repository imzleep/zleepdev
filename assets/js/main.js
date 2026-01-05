document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLang');
    if (savedLang) {
        setLanguage(savedLang);
    } else {
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('tr')) {
            setLanguage('tr');
        } else {
            setLanguage('en');
        }
    }

    initCookieConsent();
    initCarousel();
});

function toggleLanguage() {
    const currentLang = localStorage.getItem('selectedLang') === 'tr' ? 'en' : 'tr';
    setLanguage(currentLang);
}

function setLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-tr').forEach(el => {
        el.style.display = lang === 'tr' ? (el.tagName === 'SPAN' ? 'inline' : 'block') : 'none';
    });

    document.querySelectorAll('.lang-en').forEach(el => {
        el.style.display = lang === 'en' ? (el.tagName === 'SPAN' ? 'inline' : 'block') : 'none';
    });

    const slider = document.getElementById('lang-slider');
    const trBtn = document.getElementById('lang-tr');
    const enBtn = document.getElementById('lang-en');

    if (slider && trBtn && enBtn) {
        if (lang === 'tr') {
            slider.style.transform = 'translateX(0)';
            trBtn.classList.remove('text-gray-500');
            trBtn.classList.add('text-white');
            enBtn.classList.remove('text-white');
            enBtn.classList.add('text-gray-500');
        } else {
            slider.style.transform = 'translateX(100%)';
            enBtn.classList.remove('text-gray-500');
            enBtn.classList.add('text-white');
            trBtn.classList.remove('text-white');
            trBtn.classList.add('text-gray-500');
        }
    }
}

function initCookieConsent() {
    if (localStorage.getItem('cookieConsent') === 'true') return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'fixed bottom-4 right-4 md:bottom-8 md:right-8 max-w-sm w-[calc(100%-2rem)] bg-[#0f172a]/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl z-50 transform transition-all duration-500 translate-y-20 opacity-0';

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

    const currentLang = localStorage.getItem('selectedLang') || 'en';
    setLanguage(currentLang);

    setTimeout(() => {
        banner.classList.remove('translate-y-20', 'opacity-0');
    }, 100);

    const btn = document.getElementById('accept-cookies');
    if (btn) {
        btn.onclick = () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.classList.add('translate-y-20', 'opacity-0');
            setTimeout(() => banner.remove(), 500);
        };
    }
}

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track) return;

    const transitionDuration = 700;
    let isAnimating = false;
    let autoScrollInterval;

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

            setTimeout(() => {
                isAnimating = false;
            }, 50);
        }, transitionDuration);
    };

    const movePrev = () => {
        if (isAnimating) return;
        isAnimating = true;

        const itemWidth = getItemWidth();

        track.style.transition = 'none';
        track.prepend(track.lastElementChild);
        track.style.transform = `translateX(-${itemWidth}px)`;

        void track.offsetWidth;

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

    const wrapper = document.getElementById('carouselWindow') || track.parentElement;
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);

    let touchStartX = 0;
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) moveNext();
        if (touchEndX - touchStartX > 50) movePrev();
        startAutoPlay();
    }, { passive: true });

    startAutoPlay();
}

