document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initAudioSynth();
    initClickEffects();
    initHomeControls();
    initSettingsModal();
    initLeaderboardModal();
    initScannerView();
    initDestroyView();
    initMatch3Game();

    console.log("Guardian Game: Section 1, 2, 3, 4, 5 & 6 (Home, Settings, Leaderboard, Scanner, Destroy, Match-3) Initialized.");
});

/* ==========================================================================
   1. IMMERSIVE REAL-TIME STATUS BAR CLOCK
   ========================================================================== */
function initClock() {
    const clockEl = document.getElementById("clock");
    if (!clockEl) return;

    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();

        // Format to HH:MM
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        clockEl.textContent = `${hours}:${minutes}`;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

/* ==========================================================================
   2. SYNTHETIC SOUND CONTROLLER (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let currentVolumeScale = 0.8; // Default volume scale (matches 80%)

function initAudioSynth() {
    // Audio Context is initialized on first user interaction to comply with browser policies
    window.playSynthSound = function (type) {
        try {
            // Check if volume/music toggle overrides are muted
            const musicActive = document.getElementById("modal-music-btn")?.classList.contains("active") !== false;
            const volumeActive = document.getElementById("modal-volume-btn")?.classList.contains("active") !== false;

            if (type === 'start' && !musicActive) return;
            if ((type === 'click' || type === 'hover') && !volumeActive) return;

            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;

            // Apply our custom interactive slider scaling
            const volumeLevel = currentVolumeScale;

            if (type === 'start') {
                // Energetic, upward 8-bit sound for START game
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

                gain.gain.setValueAtTime(0.15 * volumeLevel, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

                osc.start(now);
                osc.stop(now + 0.45);
            } else if (type === 'click') {
                // Soft click/tap feedback
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

                gain.gain.setValueAtTime(0.1 * volumeLevel, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'hover') {
                // Light chime for hovering or focus
                osc.type = 'sine';
                osc.frequency.setValueAtTime(900, now);

                gain.gain.setValueAtTime(0.03 * volumeLevel, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

                osc.start(now);
                osc.stop(now + 0.09);
            }
        } catch (e) {
            console.warn("Audio synth play failed:", e);
        }
    };
}

/* ==========================================================================
   3. SCREEN RIPPLE / PARTICLES ON CLICK
   ========================================================================== */
function initClickEffects() {
    const screen = document.querySelector(".device-screen");
    if (!screen) return;

    screen.addEventListener("click", (e) => {
        // Only trigger on element or button clicks
        const target = e.target.closest("button");
        if (!target) return;

        createRipple(e, target);
        createParticles(e, target);
    });

    function createRipple(e, button) {
        const rect = button.getBoundingClientRect();
        const screenRect = screen.getBoundingClientRect();

        const ripple = document.createElement("span");
        ripple.classList.add("btn-click-ripple");

        // Calculate relative position to screen
        const x = e.clientX - screenRect.left;
        const y = e.clientY - screenRect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // Append inside screen
        screen.appendChild(ripple);

        // Add styling for dynamic ripple
        ripple.style.position = "absolute";
        ripple.style.width = "10px";
        ripple.style.height = "10px";
        ripple.style.background = "rgba(255, 255, 255, 0.4)";
        ripple.style.borderRadius = "50%";
        ripple.style.transform = "translate(-50%, -50%) scale(1)";
        ripple.style.pointerEvents = "none";
        ripple.style.zIndex = "99";
        ripple.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";

        // Trigger animation
        requestAnimationFrame(() => {
            ripple.style.transform = "translate(-50%, -50%) scale(8)";
            ripple.style.opacity = "0";
        });

        setTimeout(() => {
            ripple.remove();
        }, 400);
    }

    function createParticles(e, button) {
        const screenRect = screen.getBoundingClientRect();
        const particleCount = 6;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.classList.add("click-particle");

            const x = e.clientX - screenRect.left;
            const y = e.clientY - screenRect.top;

            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            // Random colors (green, cyan, gold) to fit eco theme
            const colors = ["#38ef7d", "#11998e", "#78ffd6", "#f6d365"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            particle.style.position = "absolute";
            particle.style.width = "6px";
            particle.style.height = "6px";
            particle.style.borderRadius = "50%";
            particle.style.background = randomColor;
            particle.style.pointerEvents = "none";
            particle.style.zIndex = "100";

            // Random movement trajectory
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 25;
            const destX = Math.cos(angle) * distance;
            const destY = Math.sin(angle) * distance;

            screen.appendChild(particle);

            particle.style.transition = "transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.5s ease-out";

            requestAnimationFrame(() => {
                particle.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
                particle.style.opacity = "0";
            });

            setTimeout(() => {
                particle.remove();
            }, 500);
        }
    }
}

/* ==========================================================================
   4. HOME PAGE CONTROLS AND INTERACTION HANDLERS
   ========================================================================= */
function initHomeControls() {
    const startBtn = document.getElementById("start-game-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const badgesBtn = document.getElementById("badges-btn");

    // START GAME CLICK (TRANSITION TO AR SCANNER VIEW)
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('start');

            // Visual squash effect
            startBtn.style.transform = "scale(0.85)";
            setTimeout(() => {
                startBtn.style.transform = "";
            }, 150);

            console.log("Start button pressed! Transitioning to Section 4 (AR Scanner View)...");

            const homeScreen = document.getElementById("home-page-screen");
            const scannerScreen = document.getElementById("scanner-view");

            if (homeScreen && scannerScreen) {
                // Slower clean slide out and slide in
                homeScreen.classList.remove("active");
                scannerScreen.classList.add("active");

                showSystemNotification("Skaner", "Atrofni skanerlash rejimi faollashdi!");
            }
        });

        // Hover audio feedback
        startBtn.addEventListener("mouseenter", () => {
            if (window.playSynthSound) window.playSynthSound('hover');
        });
    }

    // SETTINGS BUTTON TO OPEN MODAL
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            const settingsModal = document.getElementById("settings-modal");
            if (settingsModal) {
                settingsModal.classList.add("active");
            }
        });

        settingsBtn.addEventListener("mouseenter", () => {
            if (window.playSynthSound) window.playSynthSound('hover');
        });
    }

    // BADGES BUTTON
    if (badgesBtn) {
        badgesBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            const leaderboardModal = document.getElementById("leaderboard-modal");
            if (leaderboardModal) {
                leaderboardModal.classList.add("active");
            }
        });

        badgesBtn.addEventListener("mouseenter", () => {
            if (window.playSynthSound) window.playSynthSound('hover');
        });
    }
}

/* ==========================================================================
   5. SETTINGS MODAL INTERACTIVE LOGIC (Section 2)
   ========================================================================== */
function initSettingsModal() {
    const settingsModal = document.getElementById("settings-modal");
    const closeBtn = document.getElementById("settings-close-btn");

    const musicBtn = document.getElementById("modal-music-btn");
    const volumeBtn = document.getElementById("modal-volume-btn");

    const sliderWrapper = document.getElementById("volume-slider-wrapper");
    const sliderKnob = document.getElementById("volume-knob-ball");
    const sliderFill = document.getElementById("volume-track-fill");
    const valDisplay = document.getElementById("volume-val-display");

    // CLOSE SETTINGS PANEL
    if (closeBtn && settingsModal) {
        closeBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            settingsModal.classList.remove("active");
        });
    }

    // MUSIC TOGGLE MUTE/UNMUTE
    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            musicBtn.classList.toggle("active");
            musicBtn.classList.toggle("muted");
            if (window.playSynthSound) window.playSynthSound('click');

            const isMuted = musicBtn.classList.contains("muted");
            showSystemNotification("Musiqa", isMuted ? "Musiqa o'chirildi" : "Musiqa yoqildi");
        });
    }

    // VOLUME TOGGLE MUTE/UNMUTE
    if (volumeBtn) {
        volumeBtn.addEventListener("click", () => {
            volumeBtn.classList.toggle("active");
            volumeBtn.classList.toggle("muted");

            const isMuted = volumeBtn.classList.contains("muted");
            if (!isMuted && window.playSynthSound) {
                window.playSynthSound('click');
            }

            showSystemNotification("Ovoz", isMuted ? "Ovoz effektlari o'chirildi" : "Ovoz effektlari yoqildi");
        });
    }

    // INTERACTIVE VOLUME SLIDER (DRAG AND CLICK LISTENERS)
    if (sliderWrapper && sliderKnob && sliderFill && valDisplay) {
        let isDragging = false;

        // Initialize slider at default 80% volume scale
        updateSliderVisuals(0.8);

        // Click on the slider wrapper directly
        sliderWrapper.addEventListener("mousedown", (e) => {
            isDragging = true;
            handleSliderMove(e);
        });

        // Touch start on mobile devices
        sliderWrapper.addEventListener("touchstart", (e) => {
            isDragging = true;
            handleSliderMove(e.touches[0]);
        }, { passive: true });

        // Move event (Global listeners for smooth dragging outside bounds)
        window.addEventListener("mousemove", (e) => {
            if (isDragging) {
                handleSliderMove(e);
            }
        });

        window.addEventListener("touchmove", (e) => {
            if (isDragging) {
                handleSliderMove(e.touches[0]);
            }
        }, { passive: false });

        // Release dragging
        window.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                if (window.playSynthSound) window.playSynthSound('click'); // Play click feedback on release
            }
        });

        window.addEventListener("touchend", () => {
            if (isDragging) {
                isDragging = false;
                if (window.playSynthSound) window.playSynthSound('click');
            }
        });

        // Calculate position and update visuals/volume
        function handleSliderMove(clientXHolder) {
            const rect = sliderWrapper.getBoundingClientRect();
            const paddingOffset = 8; // Offset to keep knob within visually appealing boundaries
            const trackWidth = rect.width - (paddingOffset * 2);

            // Calculate mouse click position relative to track start
            let clickX = clientXHolder.clientX - rect.left - paddingOffset;

            // Clamping within 0 and trackWidth
            clickX = Math.max(0, Math.min(clickX, trackWidth));

            // Percentage of volume scale
            const percent = clickX / trackWidth;

            updateSliderVisuals(percent);

            // Update global scale
            currentVolumeScale = percent;
        }

        function updateSliderVisuals(percent) {
            const displayPercentage = Math.round(percent * 100);

            // Update slider filled width
            sliderFill.style.width = `calc(${percent * 100}% - 4px)`;

            // Update absolute position of the knob ball
            sliderKnob.style.left = `calc(${percent * 100}% - 0px)`;

            // Update percentage string text
            valDisplay.textContent = `${displayPercentage}%`;
        }
    }
}

/* ==========================================================================
   6. LEADERBOARD MODAL INTERACTIVE LOGIC (Section 3)
   ========================================================================== */
function initLeaderboardModal() {
    const leaderboardModal = document.getElementById("leaderboard-modal");
    const closeBtn = document.getElementById("leaderboard-close-btn");

    if (closeBtn && leaderboardModal) {
        closeBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            leaderboardModal.classList.remove("active");
        });
    }
}

/* ==========================================================================
   7. AR SCANNER SCREEN INTERACTIVE LOGIC (Section 4)
   ========================================================================== */
function initScannerView() {
    const homeScreen = document.getElementById("home-page-screen");
    const scannerScreen = document.getElementById("scanner-view");
    const closeBtn = document.getElementById("scanner-close-btn");
    const scanTriggerBtn = document.getElementById("scan-trigger-btn");

    // Exit scanner and return to Home Page
    if (closeBtn && homeScreen && scannerScreen) {
        closeBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');

            scannerScreen.classList.remove("active");
            homeScreen.classList.add("active");

            showSystemNotification("Skaner", "Bosh sahifaga qaytildi.");
        });
    }

    // Trigger Scan button click with customized retro audio scan sweeps and transition to Destroy View
    if (scanTriggerBtn) {
        scanTriggerBtn.addEventListener("click", () => {
            // Synth sound customization for scanning (energetic sweep chime)
            try {
                if (window.playSynthSound) {
                    window.playSynthSound('click');
                }

                // Active Scan Sweep Chime
                if (audioCtx) {
                    const now = audioCtx.currentTime;
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();

                    osc.type = 'sawtooth';
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);

                    // Sweeping siren frequency to indicate active laser sonar radar
                    osc.frequency.setValueAtTime(100, now);
                    osc.frequency.linearRampToValueAtTime(1400, now + 0.45);
                    osc.frequency.exponentialRampToValueAtTime(500, now + 0.9);

                    // Gain envelope
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

                    osc.start(now);
                    osc.stop(now + 0.95);
                }
            } catch (e) {
                console.warn("Scan sweep sound failed:", e);
            }

            // Visual squash effect
            scanTriggerBtn.style.transform = "scale(0.88)";
            setTimeout(() => {
                scanTriggerBtn.style.transform = "";
            }, 150);

            // Change status text inside viewfinder to scanning feedback
            const statusText = document.querySelector(".scanner-status-text");
            if (statusText) {
                statusText.textContent = "SYSTEM: SCANNING SURFACE...";
                statusText.style.color = "#fda085";
                statusText.style.textShadow = "0 0 8px #fda085";
            }

            showSystemNotification("Skanerlash", "Atrof-muhit skanerlanmoqda...");

            // After 1.5 seconds, transition to Section 5 Destroy screen
            setTimeout(() => {
                const scannerScreen = document.getElementById("scanner-view");
                const destroyScreen = document.getElementById("destroy-view");

                if (scannerScreen && destroyScreen) {
                    scannerScreen.classList.remove("active");
                    destroyScreen.classList.add("active");

                    // Trigger alert tone
                    if (window.playSynthSound) window.playSynthSound('start');
                    showSystemNotification("Nishon", "Monstr aniqlandi! Hujum rejimi!");
                }

                // Reset scanner status label for next entry
                if (statusText) {
                    statusText.textContent = "SYSTEM: SCANNING AREA...";
                    statusText.style.color = "#38ef7d";
                    statusText.style.textShadow = "0 0 6px rgba(56, 239, 125, 0.75)";
                }
            }, 1500);
        });
    }
}

/* ==========================================================================
   8. DESTROY SCREEN INTERACTIVE LOGIC (Section 5)
   ========================================================================== */
function initDestroyView() {
    const homeScreen = document.getElementById("home-page-screen");
    const destroyScreen = document.getElementById("destroy-view");
    const closeBtn = document.getElementById("destroy-close-btn");
    const destroyTriggerBtn = document.getElementById("destroy-trigger-btn");

    // Exit combat view and return to Home Page
    if (closeBtn && homeScreen && destroyScreen) {
        closeBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');

            destroyScreen.classList.remove("active");
            homeScreen.classList.add("active");

            showSystemNotification("Hujum", "Bosh sahifaga qaytildi.");
        });
    }

    // Trigger Destroy combat attack button to start Match-3 game combat
    if (destroyTriggerBtn) {
        destroyTriggerBtn.addEventListener("click", () => {
            // Synth sound for combat explosion (impact blast)
            try {
                if (audioCtx) {
                    const now = audioCtx.currentTime;

                    // Low-frequency oscillator for deep thud rumble
                    const thudOsc = audioCtx.createOscillator();
                    const thudGain = audioCtx.createGain();
                    thudOsc.type = 'triangle';
                    thudOsc.frequency.setValueAtTime(130, now);
                    thudOsc.frequency.exponentialRampToValueAtTime(10, now + 0.65);

                    thudGain.gain.setValueAtTime(0.35, now);
                    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

                    thudOsc.connect(thudGain);
                    thudGain.connect(audioCtx.destination);
                    thudOsc.start(now);
                    thudOsc.stop(now + 0.7);

                    // High frequency laser crunch white noise sweep
                    const crackOsc = audioCtx.createOscillator();
                    const crackGain = audioCtx.createGain();
                    crackOsc.type = 'sawtooth';
                    crackOsc.frequency.setValueAtTime(900, now);
                    crackOsc.frequency.linearRampToValueAtTime(90, now + 0.3);

                    crackGain.gain.setValueAtTime(0.18, now);
                    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                    crackOsc.connect(crackGain);
                    crackGain.connect(audioCtx.destination);
                    crackOsc.start(now);
                    crackOsc.stop(now + 0.4);
                }
            } catch (e) {
                console.warn("Explosion synth sound failed:", e);
            }

            // Visual squash effect
            destroyTriggerBtn.style.transform = "scale(0.85)";
            setTimeout(() => {
                destroyTriggerBtn.style.transform = "";
            }, 150);

            // Trigger particle splash inside HUD!
            createThudParticles();

            // Transition smoothly to Match-3 Battle Screen after a brief dramatic delay (750ms)
            setTimeout(() => {
                const destroyScreen = document.getElementById("destroy-view");
                const match3View = document.getElementById("match3-game-view");

                if (destroyScreen && match3View) {
                    destroyScreen.classList.remove("active");
                    match3View.classList.add("active");

                    // Launch match 3 engine
                    startMatch3Game();
                }
            }, 750);
        });
    }

    function createThudParticles() {
        const hud = document.querySelector(".destroy-target-hud");
        if (!hud) return;

        // Particle blast
        for (let i = 0; i < 20; i++) {
            const p = document.createElement("div");
            p.className = "hud-blast-particle";

            const size = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 30;

            p.style.position = "absolute";
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.borderRadius = "50%";
            p.style.background = Math.random() > 0.5 ? "#ef4444" : "#ff7878";
            p.style.boxShadow = "0 0 8px #ef4444";
            p.style.zIndex = "8";
            p.style.top = "50%";
            p.style.left = "50%";
            p.style.transform = "translate(-50%, -50%) scale(1)";
            p.style.opacity = "1";
            p.style.transition = "transform 0.6s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.6s ease";

            hud.appendChild(p);

            // Execute animation
            requestAnimationFrame(() => {
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                p.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
                p.style.opacity = "0";
            });

            setTimeout(() => p.remove(), 650);
        }
    }
}

/* ==========================================================================
   9. MATCH-3 COMBAT BATTLE ENGINE & MODALS (Section 6)
   ========================================================================== */
let match3Board = [];
let selectedCell = null;
let match3Timer = null;
let match3TimeLeft = 45;
let monsterHP = 100;
let isBoardLocked = false;

const match3Assets = [
    'Assets/Game_assets/Battery.png',
    'Assets/Game_assets/bottle.png',
    'Assets/Game_assets/canserva.png',
    'Assets/Game_assets/paper.png',
    'Assets/Game_assets/water_bottle.png'
];

const monstersList = [
    { name: "PLASTIK MONSTR (LVL 1)", photo: "Assets/Monsters/Monstr_LVL1_photo.png" },
    { name: "ZAHARLI MONSTR (LVL 2)", photo: "Assets/Monsters/Monstr_LVL2_Photo.png" },
    { name: "CHIQINDI BOSS (LVL 3)", photo: "Assets/Monsters/Monstr_LVL3_Photo.png" }
];

function initMatch3Game() {
    const homeScreen = document.getElementById("home-page-screen");
    const match3View = document.getElementById("match3-game-view");

    const closeBtn = document.getElementById("match3-close-btn");
    const vicContinueBtn = document.getElementById("victory-continue-btn");
    const defContinueBtn = document.getElementById("defeat-continue-btn");

    const vicModal = document.getElementById("victory-modal");
    const defModal = document.getElementById("defeat-modal");

    // Close Battle view early
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            stopMatch3Timer();
            match3View.classList.remove("active");
            homeScreen.classList.add("active");
            showSystemNotification("Jang", "Jangdan chiqildi.");
        });
    }

    // Victory Continue Button
    if (vicContinueBtn) {
        vicContinueBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            vicModal.classList.remove("active");
            match3View.classList.remove("active");
            homeScreen.classList.add("active");
            showSystemNotification("G'alaba", "Bosh sahifaga qaytildi!");
        });
    }

    // Defeat Continue Button
    if (defContinueBtn) {
        defContinueBtn.addEventListener("click", () => {
            if (window.playSynthSound) window.playSynthSound('click');
            defModal.classList.remove("active");
            match3View.classList.remove("active");
            homeScreen.classList.add("active");
            showSystemNotification("Mag'lubiyat", "Bosh sahifaga qaytildi.");
        });
    }
}

// Function to start a fresh Match-3 combat round
function startMatch3Game() {
    // Stop any active timers
    stopMatch3Timer();

    selectedCell = null;
    isBoardLocked = false;
    monsterHP = 100;
    match3TimeLeft = 45;

    // Pick random monster
    const monster = monstersList[Math.floor(Math.random() * monstersList.length)];
    const mImg = document.getElementById("battle-monster-img");
    const mName = document.getElementById("battle-monster-name");

    if (mImg) mImg.src = monster.photo;
    if (mName) mName.textContent = monster.name;

    // Reset UI bars
    updateMonsterHPUI();
    updateTimerUI();

    // Generate non-matching starting board
    generateStartBoard();
    renderBoardHTML();

    // Start timer loop
    startMatch3TimerLoop();
}

function updateMonsterHPUI() {
    const hpFill = document.getElementById("battle-hp-fill");
    const hpText = document.getElementById("battle-hp-text");
    if (hpFill) hpFill.style.width = `${monsterHP}%`;
    if (hpText) hpText.textContent = `${monsterHP}% HP`;
}

function updateTimerUI() {
    const tFill = document.getElementById("battle-timer-fill");
    const tText = document.getElementById("battle-timer-text");
    if (tFill) tFill.style.width = `${(match3TimeLeft / 45) * 100}%`;
    if (tText) tText.textContent = `${match3TimeLeft}s`;
}

function startMatch3TimerLoop() {
    match3Timer = setInterval(() => {
        match3TimeLeft--;
        updateTimerUI();

        if (match3TimeLeft <= 0) {
            stopMatch3Timer();
            triggerDefeat();
        }
    }, 1000);
}

function stopMatch3Timer() {
    if (match3Timer) {
        clearInterval(match3Timer);
        match3Timer = null;
    }
}

function triggerVictory() {
    stopMatch3Timer();
    isBoardLocked = true;

    // Play triumphant synth fanfare
    try {
        if (audioCtx) {
            const now = audioCtx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.15);
                gain.gain.setValueAtTime(0.12, now + idx * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.15);
                osc.stop(now + idx * 0.15 + 0.4);
            });
        }
    } catch (e) { }

    // Open victory modal
    const vicModal = document.getElementById("victory-modal");
    if (vicModal) vicModal.classList.add("active");
}

function triggerDefeat() {
    stopMatch3Timer();
    isBoardLocked = true;

    // Play defeat low synth chord
    try {
        if (audioCtx) {
            const now = audioCtx.currentTime;
            const notes = [196.00, 185.00, 164.81]; // G, F#, E (falling)
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + idx * 0.25);
                gain.gain.setValueAtTime(0.1, now + idx * 0.25);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.25 + 0.45);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.25);
                osc.stop(now + idx * 0.25 + 0.5);
            });
        }
    } catch (e) { }

    // Sync the defeat modal monster sprite to whichever monster was in this battle
    const battleMonsterSrc = document.getElementById("battle-monster-img")?.src;
    const defeatMonsterImg = document.getElementById("defeat-monster-img");
    if (defeatMonsterImg && battleMonsterSrc) defeatMonsterImg.src = battleMonsterSrc;

    // Open defeat modal
    const defModal = document.getElementById("defeat-modal");
    if (defModal) defModal.classList.add("active");
}

// Generate starting 8x8 grid with no matches
function generateStartBoard() {
    match3Board = [];
    for (let r = 0; r < 8; r++) {
        match3Board[r] = [];
        for (let c = 0; c < 8; c++) {
            let possibleTypes = [0, 1, 2, 3, 4];

            // Filter out types that would cause horizontal matches
            if (c >= 2) {
                const t1 = match3Board[r][c - 1].type;
                const t2 = match3Board[r][c - 2].type;
                if (t1 === t2) {
                    possibleTypes = possibleTypes.filter(t => t !== t1);
                }
            }
            // Filter out types that would cause vertical matches
            if (r >= 2) {
                const t1 = match3Board[r - 1][c].type;
                const t2 = match3Board[r - 2][c].type;
                if (t1 === t2) {
                    possibleTypes = possibleTypes.filter(t => t !== t1);
                }
            }

            const randomType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
            match3Board[r][c] = {
                type: randomType,
                id: `tile-${r}-${c}-${Math.random().toString(36).substr(2, 4)}`
            };
        }
    }
}

// Render grid board inside HTML
function renderBoardHTML() {
    const boardEl = document.getElementById("match3-grid-board");
    if (!boardEl) return;
    boardEl.innerHTML = "";

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement("div");
            cell.className = "match3-cell";
            cell.dataset.row = r;
            cell.dataset.col = c;

            const tile = match3Board[r][c];
            if (tile) {
                const img = document.createElement("img");
                img.src = match3Assets[tile.type];
                img.className = "match3-tile";
                img.alt = `Waste Item ${tile.type}`;
                cell.appendChild(img);
            }

            // Cell click handler
            cell.addEventListener("click", () => handleCellClick(r, c));
            boardEl.appendChild(cell);
        }
    }
}

// Handle cell swapping and game logic on cell tap
function handleCellClick(r, c) {
    if (isBoardLocked) return;

    const boardEl = document.getElementById("match3-grid-board");
    const cells = boardEl.children;
    const clickedCellIndex = r * 8 + c;
    const clickedCellEl = cells[clickedCellIndex];

    if (!selectedCell) {
        // Select cell
        selectedCell = { r, c };
        clickedCellEl.classList.add("selected");
        if (window.playSynthSound) window.playSynthSound('click');
    } else {
        const prevRow = selectedCell.r;
        const prevCol = selectedCell.c;
        const prevCellIndex = prevRow * 8 + prevCol;
        const prevCellEl = cells[prevCellIndex];

        // Remove active outline
        prevCellEl.classList.remove("selected");

        // Check if same cell clicked, just unselect
        if (prevRow === r && prevCol === c) {
            selectedCell = null;
            return;
        }

        // Check adjacency
        const isAdjacent = (Math.abs(prevRow - r) === 1 && prevCol === c) ||
            (Math.abs(prevCol - c) === 1 && prevRow === r);

        if (isAdjacent) {
            executeSwap(prevRow, prevCol, r, c);
        } else {
            // Select newly clicked cell instead
            selectedCell = { r, c };
            clickedCellEl.classList.add("selected");
            if (window.playSynthSound) window.playSynthSound('click');
        }
    }
}

function executeSwap(r1, c1, r2, c2) {
    isBoardLocked = true;
    selectedCell = null;

    // Swap data model
    const temp = match3Board[r1][c1];
    match3Board[r1][c1] = match3Board[r2][c2];
    match3Board[r2][c2] = temp;

    // Render the swapped board so user sees it
    renderBoardHTML();

    // Give browser one frame to paint, then check for matches
    requestAnimationFrame(() => {
        const matches = checkMatches();

        if (matches.length > 0) {
            // Valid swap — clear matched tiles
            clearMatchedTiles(matches);
        } else {
            // Invalid swap — show briefly then swap back
            setTimeout(() => {
                const temp2 = match3Board[r1][c1];
                match3Board[r1][c1] = match3Board[r2][c2];
                match3Board[r2][c2] = temp2;
                renderBoardHTML();
                playErrorBeep();
                isBoardLocked = false;
            }, 220);
        }
    });
}

// Find all groups of 3+ matching tiles horizontally and vertically
function checkMatches() {
    const matched = new Set();

    // Horizontal scan
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 6; c++) {
            const t = match3Board[r][c];
            if (!t) continue;
            if (
                match3Board[r][c + 1] && match3Board[r][c + 1].type === t.type &&
                match3Board[r][c + 2] && match3Board[r][c + 2].type === t.type
            ) {
                matched.add(`${r}-${c}`);
                matched.add(`${r}-${c + 1}`);
                matched.add(`${r}-${c + 2}`);
                // Extend run
                let k = c + 3;
                while (k < 8 && match3Board[r][k] && match3Board[r][k].type === t.type) {
                    matched.add(`${r}-${k}`);
                    k++;
                }
            }
        }
    }

    // Vertical scan
    for (let c = 0; c < 8; c++) {
        for (let r = 0; r < 6; r++) {
            const t = match3Board[r][c];
            if (!t) continue;
            if (
                match3Board[r + 1][c] && match3Board[r + 1][c].type === t.type &&
                match3Board[r + 2][c] && match3Board[r + 2][c].type === t.type
            ) {
                matched.add(`${r}-${c}`);
                matched.add(`${r + 1}-${c}`);
                matched.add(`${r + 2}-${c}`);
                // Extend run
                let k = r + 3;
                while (k < 8 && match3Board[k][c] && match3Board[k][c].type === t.type) {
                    matched.add(`${k}-${c}`);
                    k++;
                }
            }
        }
    }

    // Convert set keys to {r, c} objects
    return [...matched].map(key => {
        const [r, c] = key.split('-').map(Number);
        return { r, c };
    });
}

function clearMatchedTiles(matches) {
    const boardEl = document.getElementById('match3-grid-board');
    if (!boardEl) return;
    const cells = boardEl.children;

    // Animate matched tiles
    matches.forEach(({ r, c }) => {
        const img = cells[r * 8 + c]?.querySelector('.match3-tile');
        if (img) img.classList.add('matched');
    });

    // Play match chime
    playMatchChime();

    // Damage monster
    const damage = Math.min(monsterHP, matches.length * 5);
    monsterHP -= damage;
    updateMonsterHPUI();

    if (monsterHP <= 0) {
        monsterHP = 0;
        updateMonsterHPUI();
        setTimeout(() => triggerVictory(), 350);
        return;
    }

    // After animation, remove tiles from model and cascade
    setTimeout(() => {
        matches.forEach(({ r, c }) => {
            match3Board[r][c] = null;
        });
        cascadeFall();
    }, 280);
}

function cascadeFall() {
    // For each column, compact tiles downward and fill from top
    for (let c = 0; c < 8; c++) {
        // Collect non-null tiles from bottom to top
        const col = [];
        for (let r = 7; r >= 0; r--) {
            if (match3Board[r][c] !== null) col.push(match3Board[r][c]);
        }
        // Fill new tiles for any missing slots
        while (col.length < 8) {
            col.push({
                type: Math.floor(Math.random() * match3Assets.length),
                id: `t-${c}-${Math.random().toString(36).substr(2, 5)}`,
                isNew: true
            });
        }
        // Write back: col[0] is the bottom-most tile
        for (let r = 7; r >= 0; r--) {
            match3Board[r][c] = col[7 - r];
        }
    }

    renderBoardHTML();

    // Mark new tiles with falling animation
    const boardEl = document.getElementById('match3-grid-board');
    if (boardEl) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (match3Board[r][c]?.isNew) {
                    const img = boardEl.children[r * 8 + c]?.querySelector('.match3-tile');
                    if (img) img.classList.add('falling');
                    delete match3Board[r][c].isNew;
                }
            }
        }
    }

    // Check for cascade matches after fall animation
    setTimeout(() => {
        const cascades = checkMatches();
        if (cascades.length > 0) {
            clearMatchedTiles(cascades);
        } else {
            selectedCell = null;
            isBoardLocked = false;
        }
    }, 320);
}

function playMatchChime() {
    try {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.22);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    } catch (e) { }
}

function playErrorBeep() {
    try {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    } catch (e) { }
}

// Legacy aliases — kept for any references
function handleMatchesClear(m) { clearMatchedTiles(m); }
function executeFallAndReplenish() { cascadeFall(); }

/* Helper to render highly polish system banner notification */
function showSystemNotification(title, message) {
    const screen = document.querySelector(".device-screen");
    if (!screen) return;

    // Check if there is already a banner, remove it
    const existing = document.querySelector(".system-banner");
    if (existing) existing.remove();

    const banner = document.createElement("div");
    banner.className = "system-banner";
    banner.innerHTML = `
        <div class="banner-icon">🛡️</div>
        <div class="banner-body">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    // Banner Styles
    banner.style.position = "absolute";
    banner.style.top = "60px";
    banner.style.left = "16px";
    banner.style.right = "16px";
    banner.style.background = "rgba(15, 23, 42, 0.85)";
    banner.style.border = "1px solid rgba(56, 239, 125, 0.4)";
    banner.style.borderRadius = "14px";
    banner.style.padding = "10px 14px";
    banner.style.display = "flex";
    banner.style.gap = "10px";
    banner.style.alignItems = "center";
    banner.style.backdropFilter = "blur(10px)";
    banner.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.5)";
    banner.style.transform = "translateY(-100px)";
    banner.style.opacity = "0";
    banner.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease";
    banner.style.zIndex = "1000";

    // Sub-styles
    const h4 = banner.querySelector("h4");
    h4.style.fontSize = "13px";
    h4.style.fontWeight = "800";
    h4.style.color = "#38ef7d";
    h4.style.margin = "0";

    const p = banner.querySelector("p");
    p.style.fontSize = "11px";
    p.style.color = "#e2e8f0";
    p.style.margin = "2px 0 0 0";

    screen.appendChild(banner);

    // Slide Down
    requestAnimationFrame(() => {
        banner.style.transform = "translateY(0)";
        banner.style.opacity = "1";
    });

    // Auto dismiss after 2.5 seconds
    setTimeout(() => {
        banner.style.transform = "translateY(-100px)";
        banner.style.opacity = "0";
        setTimeout(() => banner.remove(), 400);
    }, 2500);
}
