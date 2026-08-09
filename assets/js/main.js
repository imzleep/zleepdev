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
    initProjectShowcase();
    initHeroNeuralAnimation();
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

/* ==========================================================================
   RECENT WORK: MASTER-DETAIL PROJE SEÇİCİ & OTOMATİK LOOP DÖNGÜSÜ
   ========================================================================== */
const projectList = ['abibuilder', 'mentorpanel'];
let currentProjectIndex = 0;
let projectRotationTimer = null;

function selectProject(projectId, isUserClick = false) {
    const tabs = document.querySelectorAll('.project-tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${projectId}`);
    if (activeTab) activeTab.classList.add('active');

    projectList.forEach(id => {
        const detailEl = document.getElementById(`detail-${id}`);
        if (!detailEl) return;

        if (id === projectId) {
            detailEl.classList.remove('hidden');
            if (window.gsap) {
                gsap.fromTo(detailEl, 
                    { opacity: 0, y: 15, scale: 0.98 }, 
                    { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }
                );
            }
        } else {
            detailEl.classList.add('hidden');
        }
    });

    const newIdx = projectList.indexOf(projectId);
    if (newIdx !== -1) currentProjectIndex = newIdx;

    if (isUserClick) {
        restartProjectAutoRotation();
    }
}

function startProjectAutoRotation() {
    stopProjectAutoRotation();
    projectRotationTimer = setInterval(() => {
        currentProjectIndex = (currentProjectIndex + 1) % projectList.length;
        selectProject(projectList[currentProjectIndex], false);
    }, 12000);
}

function stopProjectAutoRotation() {
    if (projectRotationTimer) {
        clearInterval(projectRotationTimer);
        projectRotationTimer = null;
    }
}

function restartProjectAutoRotation() {
    stopProjectAutoRotation();
    startProjectAutoRotation();
}

function initProjectShowcase() {
    const container = document.getElementById('recentWorkContainer');
    if (!container) return;

    container.addEventListener('mouseenter', stopProjectAutoRotation);
    container.addEventListener('mouseleave', startProjectAutoRotation);

    startProjectAutoRotation();
}

/* ==========================================================================
   HERO: CANLI NÖRAL AĞ & 2D DİJİTAL PROBLEM ÇÖZÜCÜ ANİMASYON MOTORU
   ========================================================================== */
function initHeroNeuralAnimation() {
    const canvas = document.getElementById('neuralCanvas');
    const heroScene = document.getElementById('about');
    const coreWrapper = document.getElementById('coreWrapper');
    const coreLogo = document.getElementById('coreLogo');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let packets = [];
    const nodeCount = 145;
    const maxDistance = 160;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() > 0.82 ? 3.6 : 2.0;
            this.isHub = this.radius > 3.0;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulse += 0.03;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            const currentRadius = this.isHub ? this.radius + Math.sin(this.pulse) * 0.8 : this.radius;
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.isHub ? 'rgba(0, 220, 255, 0.85)' : 'rgba(99, 102, 241, 0.55)';
            ctx.shadowBlur = this.isHub ? 12 : 4;
            ctx.shadowColor = '#00d2ff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    class DataPacket {
        constructor(fromNode, toNode) {
            this.from = fromNode;
            this.to = toNode;
            this.progress = 0;
            this.speed = 0.009 + Math.random() * 0.012;
        }

        update() {
            this.progress += this.speed;
        }

        draw() {
            const currentX = this.from.x + (this.to.x - this.from.x) * this.progress;
            const currentY = this.from.y + (this.to.y - this.from.y) * this.progress;

            ctx.beginPath();
            ctx.arc(currentX, currentY, 2.0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.95)';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00f0ff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
    }

    function renderNeuralNetwork() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();

            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    const opacity = (1 - dist / maxDistance) * 0.32;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 1.0;
                    ctx.stroke();

                    if (nodes[i].isHub && Math.random() < 0.0025 && packets.length < 35) {
                        packets.push(new DataPacket(nodes[i], nodes[j]));
                    }
                }
            }
        }

        for (let p = packets.length - 1; p >= 0; p--) {
            packets[p].update();
            packets[p].draw();
            if (packets[p].progress >= 1) {
                packets.splice(p, 1);
            }
        }

        requestAnimationFrame(renderNeuralNetwork);
    }

    renderNeuralNetwork();

    /* ==========================================================================
       DİNAMİK ÇOK DİLLİ 4 BAĞLANTILI PROBLEM & ÇÖZÜM SENARYOSU (TR / EN)
       ========================================================================== */
    const scenariosEN = [
        {
            inputs: ["Missed Sponsors", "Burnout Cycle", "Unplanned Grind"],
            output: { title: "Optimized Growth Plan", icon: "📈" }
        },
        {
            inputs: ["Unorganized Reports", "Dropping Player Count"],
            output: { title: "Actionable Product Feedback", icon: "🎯" }
        },
        {
            inputs: ["Messy Events", "Low Traffic", "Unstructured Socials", "Chaotic Community"],
            output: { title: "Self Sustaining Ecosystem", icon: "🌐" }
        },
        {
            inputs: ["Manual Entry", "Spreadsheet Hell", "Lost Track of Tasks"],
            output: { title: "Digital Workflow", icon: "⚡" }
        }
    ];

    const scenariosTR = [
        {
            inputs: ["Kaçan Sponsorluklar", "Tükenmişlik Döngüsü", "Plansız Efor"],
            output: { title: "Optimize Büyüme Planı", icon: "📈" }
        },
        {
            inputs: ["Düzensiz Raporlar", "Düşen Oyuncu Sayısı"],
            output: { title: "Uygulanabilir Ürün Geri Bildirimi", icon: "🎯" }
        },
        {
            inputs: ["Düzensiz Etkinlikler", "Düşük Trafik", "Yapılandırılmamış Sosyal Medya", "Kaotik Topluluk"],
            output: { title: "Kendi Kendine Yeten Ekosistem", icon: "🌐" }
        },
        {
            inputs: ["Manuel Veri Girişi", "Tablo Cehennemi", "Kaybolan Görevler"],
            output: { title: "Dijital İş Akışı & Otomasyon", icon: "⚡" }
        }
    ];

    function getActiveLanguage() {
        return localStorage.getItem('selectedLang') || 'en';
    }

    /* ==========================================================================
       GSAP REAKSİYON & SENTEZ MOTORU
       ========================================================================== */
    function triggerCoreReaction(isFinalSynthesis = false) {
        if (!window.gsap) return;

        if (isFinalSynthesis) {
            gsap.fromTo(coreLogo, 
                {
                    scale: 1.14,
                    filter: 'drop-shadow(0 0 34px rgba(0, 240, 255, 1))'
                },
                {
                    scale: 1,
                    filter: 'drop-shadow(0 4px 22px rgba(0, 210, 255, 0.7))',
                    duration: 0.45,
                    ease: "power2.out"
                }
            );
        } else {
            gsap.fromTo(coreLogo, 
                {
                    scale: 1.05,
                    filter: 'drop-shadow(0 0 25px rgba(255, 51, 102, 0.85))'
                },
                {
                    scale: 1,
                    filter: 'drop-shadow(0 4px 22px rgba(0, 210, 255, 0.7))',
                    duration: 0.28,
                    ease: "power2.out"
                }
            );
        }
    }

    function getCoreCenter() {
        const stage = document.getElementById('heroAnimStage') || heroScene;
        const coreEl = document.getElementById('coreWrapper') || document.getElementById('coreLogo');
        const isMobile = window.innerWidth < 640;

        let centerX = stage ? stage.offsetWidth * 0.5 : window.innerWidth * 0.5;
        let centerY = stage ? stage.offsetHeight * 0.5 : window.innerHeight * 0.5;

        if (coreEl && stage) {
            const stageRect = stage.getBoundingClientRect();
            const coreRect = coreEl.getBoundingClientRect();
            if (stageRect.width > 0 && coreRect.width > 0) {
                centerX = (coreRect.left - stageRect.left) + (coreRect.width * 0.5);
                centerY = (coreRect.top - stageRect.top) + (coreRect.height * 0.5);
            }
        }

        return { centerX, centerY, isMobile, stage };
    }

    function spawnAndVacuumProblem(scenarioIndex, itemIndex, totalInScenario, onImpact) {
        if (!window.gsap) return;

        const { centerX, centerY, isMobile, stage } = getCoreCenter();
        if (!stage) return;

        const lang = getActiveLanguage();
        const scenarios = lang === 'tr' ? scenariosTR : scenariosEN;
        const currentScenario = scenarios[scenarioIndex] || scenarios[0];
        const problemText = currentScenario.inputs[itemIndex] || currentScenario.inputs[0];

        const el = document.createElement('div');
        el.className = 'chaos-item';
        el.innerHTML = `
            <div class="chaos-dot"></div>
            <span>${problemText}</span>
        `;
        
        stage.appendChild(el);

        // Sol alanda doğma koordinatları (Kesinlikle sol tarafta)
        const leftZoneWidth = centerX * 0.75;
        const startX = isMobile 
            ? (centerX * 0.38) + (Math.random() * (centerX * 0.32) - (centerX * 0.16))
            : (centerX * 0.42) + (Math.random() * (centerX * 0.40) - (centerX * 0.20));
        
        const startY = centerY + (Math.random() * (isMobile ? 130 : 230) - (isMobile ? 65 : 115));
        const randomRotateZ = (Math.random() * (isMobile ? 12 : 20) - (isMobile ? 6 : 10));

        // Hedef: Logonun tam ölü merkezi
        const targetX = centerX;
        const targetY = centerY;

        gsap.set(el, {
            x: startX,
            y: startY,
            xPercent: -50,
            yPercent: -50,
            rotationZ: randomRotateZ,
            scale: isMobile ? 0.75 : 0.85,
            opacity: 0
        });

        const tl = gsap.timeline();

        tl.to(el, {
            opacity: 1,
            scale: isMobile ? 0.92 : 1,
            duration: 0.45,
            ease: "power2.out"
        });

        tl.to(el, {
            x: targetX,
            y: targetY,
            rotationZ: randomRotateZ * 2.2,
            duration: 1.35,
            ease: "power2.in",
            onComplete: () => {
                const isLastItem = (itemIndex === totalInScenario - 1);
                triggerCoreReaction(isLastItem);
                if (typeof onImpact === 'function') onImpact(isLastItem);
            }
        }, "-=0.15");

        tl.to(el, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            ease: "power1.in",
            onComplete: () => {
                el.remove();
            }
        });

        return tl;
    }

    function spawnAndConveyMasterSolution(scenarioIndex) {
        if (!window.gsap) return;

        const { centerX, centerY, isMobile, stage } = getCoreCenter();
        if (!stage) return;

        const lang = getActiveLanguage();
        const scenarios = lang === 'tr' ? scenariosTR : scenariosEN;
        const currentScenario = scenarios[scenarioIndex] || scenarios[0];
        const solutionData = currentScenario.output;

        const el = document.createElement('div');
        el.className = 'solution-cube';
        el.innerHTML = `
            <div class="solution-icon-wrap">${solutionData.icon}</div>
            <span class="solution-title text-cyan-50 font-bold">${solutionData.title}</span>
        `;
        
        stage.appendChild(el);

        // Çıkış: Logonun merkezinden başlayıp sağa doğru akar
        const startY = centerY;
        const startX = centerX + (isMobile ? 12 : 24);
        const endX = stage.offsetWidth + (isMobile ? 100 : 350);

        gsap.set(el, {
            x: startX,
            y: startY,
            xPercent: 0,
            yPercent: -50,
            scale: 0.2,
            opacity: 0
        });

        const tl = gsap.timeline();

        tl.to(el, {
            scale: isMobile ? 0.92 : 1,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(1.6)"
        });

        tl.to(el, {
            x: endX,
            duration: isMobile ? 4.2 : 5.5,
            ease: "none",
            onComplete: () => {
                el.remove();
            }
        }, "-=0.1");

        return tl;
    }

    let currentScenarioIndex = 0;

    function runNextBatch() {
        if (!window.gsap) return;
        const lang = getActiveLanguage();
        const scenarios = lang === 'tr' ? scenariosTR : scenariosEN;
        const scenarioIndex = currentScenarioIndex;
        const currentScenario = scenarios[scenarioIndex];
        const count = currentScenario.inputs.length;

        const batchTimeline = gsap.timeline({
            onComplete: () => {
                currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
                gsap.delayedCall(1.2, runNextBatch);
            }
        });

        for (let i = 0; i < count; i++) {
            const delay = i * 0.65;

            batchTimeline.add(() => {
                spawnAndVacuumProblem(scenarioIndex, i, count, (isLastItem) => {
                    if (isLastItem) {
                        spawnAndConveyMasterSolution(scenarioIndex);
                    }
                });
            }, delay);
        }

        batchTimeline.to({}, { duration: (count * 0.65) + 2.6 });
    }

    if (heroScene && coreWrapper && coreLogo && window.gsap) {
        runNextBatch();

        /* ==========================================================================
           3D MOUSE PARALAKS & HOVER
           ========================================================================== */
        window.addEventListener('mousemove', (e) => {
            const xPos = (e.clientX / window.innerWidth - 0.5) * 18;
            const yPos = (e.clientY / window.innerHeight - 0.5) * 18;

            gsap.to(coreWrapper, {
                rotationY: xPos,
                rotationX: -yPos,
                duration: 0.8,
                ease: "power1.out"
            });
        });

        coreWrapper.addEventListener('mouseenter', () => {
            gsap.to(coreLogo, { scale: 1.1, duration: 0.35, ease: "back.out(2)" });
        });

        coreWrapper.addEventListener('mouseleave', () => {
            gsap.to(coreLogo, { scale: 1, duration: 0.35, ease: "power2.out" });
        });
    }
}

