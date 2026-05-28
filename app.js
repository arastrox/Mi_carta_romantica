/**
 * ==========================================================================
 * APP.JS - PRODUCETURAL ROMANTIC WEB ENGINE
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const waxSeal = document.getElementById('wax-seal');
    const letterDate = document.getElementById('letter-date');
    const letterText = document.getElementById('letter-text');
    const letter = document.getElementById('letter');
    const flowersContainer = document.getElementById('flowers-container');
    const ambientAudio = document.getElementById('ambient-audio');
    
    // Music Widget Elements
    const musicWidget = document.getElementById('music-widget');
    const musicToggleDropdown = document.getElementById('music-toggle-dropdown');
    const musicPlayBtn = document.getElementById('music-play-btn');
    const musicIconOff = document.getElementById('music-icon-off');
    const musicIconOn = document.getElementById('music-icon-on');
    const musicCover = document.getElementById('music-cover');
    const musicCoverPlaceholder = document.getElementById('music-cover-placeholder');
    const musicTitle = document.getElementById('music-title');
    const marqueeContainer = document.getElementById('marquee-container');
    const volumeSlider = document.getElementById('volume-slider');

    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // Get current date representation (YYYY-MM-DD)
    const todayStr = getLocalDateString();
    
    // Seeded Random Number Generator based on local date
    const seededRandom = getSeededRandom(todayStr);

    // Initial state
    let isOpened = false;
    let isMusicPlaying = false;
    let particles = [];
    let petals = [];

    // Set today's date formatted nicely on the letter
    letterDate.textContent = formatReadableDate(new Date());

    /**
     * ==========================================================================
     * 1. LOAD DAILY CONTENT & FALLBACKS
     * ==========================================================================
     */
    const fallbackMessages = [
        "Eres el pensamiento más dulce que tengo al despertar, la razón por la que sonrío sin darme cuenta. Te amo más de lo que las palabras pueden expresar. ❤️",
        "Cada día contigo es un regalo hermoso. Gracias por iluminar mi mundo con tu ternura, tu sonrisa y tu amor incondicional. Eres mi todo. 🌹",
        "Si tuviera una flor por cada vez que pienso en ti, caminaría para siempre en un jardín eterno. Que tengas un día maravilloso, mi cielo. ✨",
        "Eres mi sol en los días nublados y mi paz en la tormenta. No hay lugar en el mundo donde prefiera estar que en tus brazos. Te amo. 💖",
        "Dos almas que se encuentran y deciden florecer juntas... eso somos tú y yo. Gracias por existir y por hacerme el novio más feliz del mundo. 🌸",
        "Amo la forma en que me miras, cómo me haces reír y lo segura que se siente mi mano dentro de la tuya. Eres mi felicidad completa. 🥰",
        "Tu amor es el motor de mis días y tu sonrisa mi refugio favorito. Hoy y siempre, mi corazón late solo por ti. Eres mi vida entera. 💕"
    ];

    const flowerThemesList = ['roses', 'sunflowers', 'daisies', 'tulips', 'cherry_blossoms'];
    const fallbackPlaylists = [
        { title: "Mellow Summer Folk - Alex Kizenkov", url: "mellow-summer-folk.mp3", cover: "" },
        { title: "Aesthetics - SoulProdMusic", url: "aesthetics.mp3", cover: "" },
        { title: "Lofi Lax - ChillBeat", url: "lofi-lax.mp3", cover: "" }
    ];

    // Select deterministic fallback based on day of year
    const dayOfYear = getDayOfYear(new Date());
    const fallbackMessage = fallbackMessages[dayOfYear % fallbackMessages.length];
    const fallbackTheme = flowerThemesList[dayOfYear % flowerThemesList.length];
    const fallbackSong = fallbackPlaylists[dayOfYear % fallbackPlaylists.length];

    // Default configuration if daily.json is missing or failed
    let config = {
        message: fallbackMessage,
        flowerTheme: fallbackTheme,
        colorScheme: getDeterministicColorScheme(fallbackTheme, seededRandom),
        songTitle: fallbackSong.title,
        songUrl: fallbackSong.url,
        songCover: fallbackSong.cover
    };

    // Attempt to load daily.json
    fetch('daily.json')
        .then(response => {
            if (!response.ok) throw new Error('No se encontró daily.json, usando fallback.');
            return response.json();
        })
        .then(data => {
            // Validate that the loaded message is for today
            if (data.date === todayStr) {
                config.message = data.message || config.message;
                config.flowerTheme = data.flowerTheme || config.flowerTheme;
                if (data.colorScheme) {
                    config.colorScheme = data.colorScheme;
                } else {
                    config.colorScheme = getDeterministicColorScheme(config.flowerTheme, seededRandom);
                }
                
                // Audio override if present in daily.json
                if (data.songTitle) config.songTitle = data.songTitle;
                if (data.songUrl) config.songUrl = data.songUrl;
                if (data.songCover) config.songCover = data.songCover;
            }
            initApp();
        })
        .catch(err => {
            console.warn(err.message);
            // Initialize with seed/fallback configuration
            initApp();
        });

    function initApp() {
        // Update Letter Text
        letterText.textContent = config.message;
        
        // Setup Music Player
        musicTitle.textContent = config.songTitle;
        ambientAudio.src = config.songUrl;
        
        if (config.songCover) {
            musicCover.src = config.songCover;
            musicCover.classList.remove('hidden');
            musicCoverPlaceholder.classList.add('hidden');
        } else {
            musicCover.classList.add('hidden');
            musicCoverPlaceholder.classList.remove('hidden');
        }

        // Check if marquee is needed (text wider than container)
        setTimeout(() => {
            if (musicTitle.scrollWidth > marqueeContainer.clientWidth) {
                marqueeContainer.classList.add('scrolling');
            }
        }, 100);
        
        // Generate Procedural Garden based on theme and seed
        generateProceduralGarden(config.flowerTheme, config.colorScheme);

        // Start Canvas Particles (Fireflies & Petals)
        resizeCanvas();
        initParticles();
        animateParticles();
    }

    /**
     * ==========================================================================
     * 2. ENVELOPE INTERACTORY & AUDIO CONTROLS
     * ==========================================================================
     */
    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    letter.addEventListener('click', (e) => {
        if (isOpened) {
            e.stopPropagation();
            closeEnvelope();
        }
    });

    function openEnvelope() {
        if (isOpened) return;
        isOpened = true;
        
        // Ensure no closing artifacts
        envelopeWrapper.classList.remove('closing');
        
        envelopeWrapper.classList.add('open');
        document.body.classList.add('letter-open');

        // Play ambient music on first open unless user explicitly muted it
        if (!isMusicPlaying) {
            toggleMusic(true);
        }
    }

    function closeEnvelope() {
        if (!isOpened) return;
        isOpened = false;
        
        envelopeWrapper.classList.remove('open');
        envelopeWrapper.classList.add('closing');
        
        // Remove the closing class and body open class after animation ends
        setTimeout(() => {
            envelopeWrapper.classList.remove('closing');
            document.body.classList.remove('letter-open');
        }, 1800); // 1.8s matches the pullOutAndDrop duration
    }

    // Toggle Dropdown Menu
    musicToggleDropdown.addEventListener('click', () => {
        musicWidget.classList.toggle('expanded');
    });

    // Play/Pause Button
    musicPlayBtn.addEventListener('click', () => {
        toggleMusic(!isMusicPlaying);
    });

    // Volume Slider
    volumeSlider.addEventListener('input', (e) => {
        ambientAudio.volume = e.target.value;
    });

    function toggleMusic(play) {
        if (play) {
            ambientAudio.play().then(() => {
                isMusicPlaying = true;
                musicIconOff.classList.add('hidden');
                musicIconOn.classList.remove('hidden');
                musicWidget.classList.add('playing');
            }).catch(e => {
                console.log("La reproducción automática de audio requiere interacción del usuario.");
            });
        } else {
            ambientAudio.pause();
            isMusicPlaying = false;
            musicIconOff.classList.remove('hidden');
            musicIconOn.classList.add('hidden');
            musicWidget.classList.remove('playing');
        }
    }

    /**
     * ==========================================================================
     * 3. PROCEDURAL FLOWER GARDEN GENERATION (SVG)
     * ==========================================================================
     */
    function generateProceduralGarden(theme, colors) {
        flowersContainer.innerHTML = ''; // Clear container
        const width = window.innerWidth;
        
        // Number of flowers to generate based on screen width (Increased by 50%)
        const flowerCount = width < 500 ? 45 : 85;
        
        // Dynamic layout for a bed of flowers
        for (let i = 0; i < flowerCount; i++) {
            // Random horizontal scattered position across screen
            const x = (seededRandom() * width * 1.2) - (width * 0.1);
            
            // Create depth layers (0 to 1) for the bed effect
            const depth = seededRandom();
            const scale = 0.5 + (depth * 0.8); // 0.5x to 1.3x scale
            
            // Heights are randomized significantly so they cover the screen behind the letter
            // Base height increased so they reach the top of the envelope
            const height = (350 + seededRandom() * 650) * scale;
            
            // Slightly offset sway speed and delay for a natural wind feel
            const swayDuration = 5 + seededRandom() * 4;
            const swayDelay = seededRandom() * -5;
            
            // Draw flower SVG
            const flowerSVG = createFlowerSVG(x, height, theme, colors, i);
            
            // Create wrapper div
            const flowerDiv = document.createElement('div');
            flowerDiv.className = 'flower-stem-group';
            flowerDiv.style.left = `${x}px`;
            
            // Spread them vertically across the bottom area, but always starting from below the screen
            // so the stems are never cut off visually in the middle of the screen
            const bottomPos = -120 + (depth * 80); // -120px to -40px
            flowerDiv.style.bottom = `${bottomPos}px`;
            flowerDiv.style.zIndex = Math.floor(depth * 10);
            flowerDiv.style.animation = `sway ${swayDuration}s ease-in-out infinite alternate`;
            flowerDiv.style.animationDelay = `${swayDelay}s`;
            
            flowerDiv.innerHTML = `<div style="transform: scale(${scale}); transform-origin: bottom center;">${flowerSVG}</div>`;
            flowersContainer.appendChild(flowerDiv);
        }
    }

    function createFlowerSVG(x, height, theme, colors, index) {
        // Seed unique randoms for this specific flower
        const fRandom = getSeededRandom(todayStr + '_flower_' + index);
        
        const strokeColor = '#2b4c3f'; // Dark organic green for stem
        const leafColor = '#3a6652';
        
        // Curve of the stem (procedural quadratic bezier)
        const startX = 0;
        const startY = 0;
        const endX = (fRandom() - 0.5) * 40; // Slight bend
        const endY = -height;
        const controlX = (fRandom() - 0.5) * 60;
        const controlY = -height * 0.5;

        // Flower variables
        const petalCount = theme === 'sunflowers' ? 16 + Math.floor(fRandom() * 8) : 
                             theme === 'daisies' ? 12 + Math.floor(fRandom() * 6) : 
                             theme === 'roses' ? 6 : 5; // Layered for roses
                             
        const flowerSize = 55 + fRandom() * 35;
        const bloomDelay = 0.2 + index * 0.15;

        // Custom flower parts based on theme
        let petalsHTML = '';
        let flowerCenterHTML = '';
        
        const primaryColor = colors.primary;
        const secondaryColor = colors.secondary;
        const accentColor = colors.accent;

        if (theme === 'roses') {
            // Layered Petals creating a deep rose bud
            for (let layer = 0; layer < 3; layer++) {
                const layerScale = 1 - layer * 0.25;
                const layerPetalCount = 5 - layer;
                const layerColor = layer === 0 ? primaryColor : (layer === 1 ? secondaryColor : accentColor);
                
                for (let j = 0; j < layerPetalCount; j++) {
                    const angle = (j / layerPetalCount) * 360 + (layer * 30);
                    const petalWidth = flowerSize * 0.65 * layerScale;
                    const petalHeight = flowerSize * 0.8 * layerScale;
                    
                    petalsHTML += `
                        <path d="M0,0 C-${petalWidth},-${petalHeight} ${petalWidth},-${petalHeight} 0,0" 
                              fill="${layerColor}" 
                              opacity="0.95"
                              transform="rotate(${angle}) translate(0, -${flowerSize * 0.1 * layerScale})" />
                    `;
                }
            }
            // Rose center fold
            flowerCenterHTML = `<ellipse cx="0" cy="0" rx="${flowerSize * 0.18}" ry="${flowerSize * 0.12}" fill="${accentColor}" transform="rotate(${fRandom() * 360})" />`;
            
        } else if (theme === 'sunflowers') {
            // Many slender golden petals
            for (let j = 0; j < petalCount; j++) {
                const angle = (j / petalCount) * 360;
                petalsHTML += `
                    <path d="M0,0 C-8,-${flowerSize} 8,-${flowerSize} 0,0" 
                          fill="${primaryColor}" 
                          transform="rotate(${angle})" />
                    <path d="M0,0 C-4,-${flowerSize * 0.9} 4,-${flowerSize * 0.9} 0,0" 
                          fill="${secondaryColor}" 
                          transform="rotate(${angle + 360 / (petalCount * 2)})" />
                `;
            }
            // Big brown seed head
            flowerCenterHTML = `
                <circle cx="0" cy="0" r="${flowerSize * 0.42}" fill="#3d2314" />
                <circle cx="0" cy="0" r="${flowerSize * 0.38}" fill="#54331f" stroke="#ffb703" stroke-width="1.5" stroke-dasharray="2,3" />
            `;
            
        } else if (theme === 'daisies' || theme === 'cherry_blossoms') {
            // Rounded delicate petals
            const isCherry = theme === 'cherry_blossoms';
            for (let j = 0; j < petalCount; j++) {
                const angle = (j / petalCount) * 360;
                
                if (isCherry) {
                    // Petal with a tiny notch at the tip for cherry blossom
                    petalsHTML += `
                        <path d="M0,0 C-15,-${flowerSize * 0.8} -20,-${flowerSize * 1.1} -3,-${flowerSize * 0.9} L0,-${flowerSize} L3,-${flowerSize * 0.9} C20,-${flowerSize * 1.1} 15,-${flowerSize * 0.8} 0,0" 
                              fill="${primaryColor}" 
                              transform="rotate(${angle})" />
                    `;
                } else {
                    // Classic rounded daisy petal
                    petalsHTML += `
                        <ellipse cx="0" cy="-${flowerSize * 0.5}" rx="${flowerSize * 0.18}" ry="${flowerSize * 0.5}" 
                                 fill="${primaryColor}" 
                                 transform="rotate(${angle})" />
                    `;
                }
            }
            // Bright gold center
            flowerCenterHTML = `
                <circle cx="0" cy="0" r="${flowerSize * 0.22}" fill="${accentColor}" />
                <circle cx="0" cy="0" r="${flowerSize * 0.16}" fill="${secondaryColor}" opacity="0.6" />
            `;
            
        } else { // Tulips
            // Elegant overlapping tulip chalice
            petalsHTML = `
                <!-- Back Petals -->
                <path d="M0,0 C-22,-${flowerSize * 1.1} 22,-${flowerSize * 1.1} 0,0" fill="${secondaryColor}" />
                <!-- Left Petal -->
                <path d="M-${flowerSize * 0.1},0 C-${flowerSize * 0.8},-${flowerSize * 0.95} 0,-${flowerSize * 1.2} 0,0" fill="${primaryColor}" transform="rotate(-15)" />
                <!-- Right Petal -->
                <path d="M${flowerSize * 0.1},0 C${flowerSize * 0.8},-${flowerSize * 0.95} 0,-${flowerSize * 1.2} 0,0" fill="${primaryColor}" transform="rotate(15)" />
                <!-- Center Overlap -->
                <path d="M0,0 C-12,-${flowerSize * 0.95} 12,-${flowerSize * 0.95} 0,0" fill="${accentColor}" />
            `;
            flowerCenterHTML = ''; // Hidden center
        }

        // Generate Leaf Paths (procedural positions along stem)
        let leavesHTML = '';
        const leafPositions = [0.35, 0.65]; // Percentages along height
        
        leafPositions.forEach((pos, idx) => {
            const side = idx % 2 === 0 ? 1 : -1;
            // Interpolate quadratic bezier to get point on stem
            const t = pos;
            const stemX = (1-t)*(1-t)*startX + 2*(1-t)*t*controlX + t*t*endX;
            const stemY = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;
            
            // Draw realistic leaf branching off
            const leafLength = 25 + fRandom() * 15;
            const leafAngle = side * (35 + fRandom() * 20);
            
            leavesHTML += `
                <path d="M${stemX},${stemY} C${stemX + side * 15},${stemY - 5} ${stemX + side * leafLength},${stemY - leafLength * 0.5} ${stemX + side * leafLength * 0.8},${stemY - leafLength} C${stemX + side * 5},${stemY - leafLength * 0.6} ${stemX},${stemY - 5} ${stemX},${stemY}" 
                      fill="${leafColor}" 
                      transform="rotate(${leafAngle}, ${stemX}, ${stemY})" />
            `;
        });

        // Assemble the full SVG code
        return `
            <svg width="250" height="${height + 100}" viewBox="-125 -${height + 50} 250 ${height + 100}" style="overflow: visible;">
                <defs>
                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <g filter="url(#shadow)">
                    <!-- Leaves -->
                    ${leavesHTML}
                    
                    <!-- Stem -->
                    <path d="M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}" 
                          fill="none" 
                          stroke="${strokeColor}" 
                          stroke-width="5" 
                          stroke-linecap="round" />
                    
                    <!-- Flower Head with bloom scaling animation -->
                    <g transform="translate(${endX}, ${endY})">
                        <g class="flower-head" style="animation-delay: ${bloomDelay}s;">
                            <!-- Calyx / Base -->
                            <path d="M-12,-2 C-8,12 8,12 12,-2 L0,-8 Z" fill="${strokeColor}" />
                            
                            <!-- Petals -->
                            <g>${petalsHTML}</g>
                            
                            <!-- Center Pistil -->
                            <g>${flowerCenterHTML}</g>
                        </g>
                    </g>
                </g>
            </svg>
        `;
    }

    function getDeterministicColorScheme(theme, randFunc) {
        // Predefined beautiful palettes that are theme friendly
        const rosePalettes = [
            { primary: '#ff4d6d', secondary: '#ff758f', accent: '#ff85a1' }, // Warm Rose Pinks
            { primary: '#d90429', secondary: '#ef233c', accent: '#ffb703' }, // Passion Reds & Gold
            { primary: '#c9184a', secondary: '#ff5c8a', accent: '#ff85a1' }  // Deep Magenta and blush
        ];
        
        const sunflowerPalettes = [
            { primary: '#ffb703', secondary: '#fb8500', accent: '#3d2314' }, // Pure Gold
            { primary: '#ffc300', secondary: '#ff9f1c', accent: '#2c1a0e' }  // Radiant Sun
        ];

        const daisyPalettes = [
            { primary: '#ffffff', secondary: '#ffb703', accent: '#ffeb3b' }, // Classic White and Gold
            { primary: '#f4f1de', secondary: '#e07a5f', accent: '#f2cc8f' }  // Warm Rustic Cream
        ];

        const tulipPalettes = [
            { primary: '#f72585', secondary: '#7209b7', accent: '#3f37c9' }, // Neon Violet Tulips
            { primary: '#ff595e', secondary: '#ffca3a', accent: '#ff924c' }, // Sunset Pastel
            { primary: '#ff99c8', secondary: '#fcf6bd', accent: '#d6e2e9' }  // Cotton Candy
        ];

        const cherryPalettes = [
            { primary: '#ffb3c1', secondary: '#ffc6ff', accent: '#ff85a1' }, // Soft Sakura Pink
            { primary: '#ffccd5', secondary: '#ffb3c1', accent: '#ff758f' }  // Layered Blush
        ];

        const palettesMap = {
            'roses': rosePalettes,
            'sunflowers': sunflowerPalettes,
            'daisies': daisyPalettes,
            'tulips': tulipPalettes,
            'cherry_blossoms': cherryPalettes
        };

        const list = palettesMap[theme] || rosePalettes;
        const index = Math.floor(randFunc() * list.length);
        return list[index];
    }

    /**
     * ==========================================================================
     * 4. CANVAS PARTICLE SYSTEM (Fireflies & Falling Petals)
     * ==========================================================================
     */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        // Re-generate flowers on resize so they scale appropriately
        generateProceduralGarden(config.flowerTheme, config.colorScheme);
    });

    // Particle Object Templates
    class Firefly {
        constructor() {
            this.reset();
        }

        reset() {
            // Spawn randomly across the screen initially, then from bottom when recycled
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = 2 + Math.random() * 4;
            this.speedY = -(0.5 + Math.random() * 1.5); // Move up faster
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.alpha = 0;
            this.fadeInSpeed = 0.01 + Math.random() * 0.02;
            this.fadeOutSpeed = 0.001 + Math.random() * 0.003; // Live 5x longer
            this.maxAlpha = 0.5 + Math.random() * 0.5;
            this.isFadingIn = true;
            // Warm magical glow colors
            this.hue = Math.random() > 0.5 ? 45 : 340; // Gold or Blush Pink
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.2; // Wavy path

            if (this.isFadingIn) {
                this.alpha += this.fadeInSpeed;
                if (this.alpha >= this.maxAlpha) {
                    this.alpha = this.maxAlpha;
                    this.isFadingIn = false;
                }
            } else {
                this.alpha -= this.fadeOutSpeed;
            }

            // Reset when dead or off screen
            if (this.alpha <= 0 || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                // When recycling, always spawn at bottom
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 20;
                this.size = 2 + Math.random() * 4;
                this.speedY = -(0.5 + Math.random() * 1.5);
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.alpha = 0;
                this.fadeInSpeed = 0.01 + Math.random() * 0.02;
                this.fadeOutSpeed = 0.001 + Math.random() * 0.003;
                this.maxAlpha = 0.5 + Math.random() * 0.5;
                this.isFadingIn = true;
                this.hue = Math.random() > 0.5 ? 45 : 340;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = this.size * 8;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 75%, 1)`;
            ctx.fillStyle = `hsla(${this.hue}, 100%, 85%, 1)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class FallingPetal {
        constructor(color) {
            this.color = color || '#ff85a1';
            this.reset();
            // Stagger start heights
            this.y = Math.random() * -canvas.height;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.size = 6 + Math.random() * 12;
            this.speedY = 1 + Math.random() * 1.5;
            this.speedX = -0.5 + Math.random() * 1;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.oscillationSpeed = 0.01 + Math.random() * 0.02;
            this.oscillationProgress = Math.random() * 100;
            // Transparency
            this.alpha = 0.6 + Math.random() * 0.4;
            // Flapping speed
            this.flatScale = Math.random();
            this.flatSpeed = 0.02 + Math.random() * 0.03;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.oscillationProgress) * 0.6;
            this.oscillationProgress += this.oscillationSpeed;
            this.rotation += this.rotationSpeed;
            this.flatScale = Math.sin(this.y * this.flatSpeed);

            // Out of bounds reset
            if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(1, this.flatScale); // Simulate 3D flipping in wind
            ctx.globalAlpha = this.alpha;
            
            // Draw a realistic curved heart/teardrop petal shape
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size, -this.size * 0.5, -this.size * 1.2, this.size * 0.5, 0, this.size);
            ctx.bezierCurveTo(this.size * 1.2, this.size * 0.5, this.size, -this.size * 0.5, 0, 0);
            ctx.fill();
            
            // Subtle highlight line on petal
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-this.size * 0.2, this.size * 0.4, 0, this.size);
            ctx.stroke();

            ctx.restore();
        }
    }

    function initParticles() {
        particles = [];
        petals = [];
        
        // Spawn Fireflies
        const fireflyCount = window.innerWidth < 500 ? 40 : 80;
        for (let i = 0; i < fireflyCount; i++) {
            particles.push(new Firefly());
        }

        // Spawn Falling Petals
        const petalColors = [config.colorScheme.primary, config.colorScheme.secondary, '#ffccd5', '#ffb3c1'];
        const petalCount = window.innerWidth < 500 ? 10 : 25;
        for (let i = 0; i < petalCount; i++) {
            const randomColor = petalColors[Math.floor(Math.random() * petalColors.length)];
            petals.push(new FallingPetal(randomColor));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update & Draw Fireflies
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Update & Draw Petals
        petals.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateParticles);
    }

    // Cursor interaction (make petals avoid cursor slightly)
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        petals.forEach(p => {
            const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
            if (dist < 120) {
                const angle = Math.atan2(p.y - mouseY, p.x - mouseX);
                const force = (120 - dist) * 0.08;
                p.x += Math.cos(angle) * force;
                p.y += Math.sin(angle) * force * 0.5; // less push downwards
            }
        });
    });

    /**
     * ==========================================================================
     * 5. HELPER UTILS (Mathematics & Seeded Randoms)
     * ==========================================================================
     */
    function getLocalDateString() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatReadableDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let formatted = date.toLocaleDateString('es-ES', options);
        // Capitalize first letter of string and day name
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    function getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    // Linear Congruential Generator (LCG) for Seeded Randoms
    function getSeededRandom(seedStr) {
        let h = 0;
        for (let i = 0; i < seedStr.length; i++) {
            h = seedStr.charCodeAt(i) + ((h << 5) - h);
        }
        
        // Return seeded random function generator
        return function() {
            // LCG Parameters
            h = (h * 1664525 + 1013904223) % 4294967296;
            return h / 4294967296; // Val between [0, 1)
        };
    }
});
