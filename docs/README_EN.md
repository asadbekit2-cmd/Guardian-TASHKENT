# Guardian — Eco Defender
### Official Documentation · English

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Structure](#2-project-structure)
3. [Game Screens & Flow](#3-game-screens--flow)
4. [Core Modules (JavaScript)](#4-core-modules-javascript)
5. [Assets & Resources](#5-assets--resources)
6. [UI Components & CSS](#6-ui-components--css)
7. [Audio System](#7-audio-system)
8. [Match-3 Battle Engine](#8-match-3-battle-engine)
9. [Rank & Leaderboard System](#9-rank--leaderboard-system)
10. [How to Run](#10-how-to-run)

---

## 1. Overview

**Guardian – Eco Defender** is a mobile-first, browser-based Match-3 puzzle game with an environmental theme.  
Players fight against eco-monsters (pollution personified) by scanning their surroundings through an AR-inspired scanner, locking on to targets, and battling them on an 8×8 Match-3 grid.

### Key Features

| Feature | Description |
|---|---|
| 📱 Mobile Simulator | Runs inside a phone-frame UI on desktop browsers |
| 🔊 Synth Audio | Web Audio API-powered sound effects (no audio files needed) |
| 🕹️ Match-3 Engine | 8×8 grid with swap, match & cascade mechanics |
| 🏆 Leaderboard | Rank progression from **E → D → C → B → A** |
| ⚙️ Settings Panel | Music & volume toggles with a drag slider |
| 🌊 AR Scanner Flow | Animated viewfinder → target lock → battle sequence |
| ✨ Particle FX | Click ripples and particle explosions throughout |

---

## 2. Project Structure

```
Guardian/
├── index.html          # Main HTML — all screens & modals
├── style.css           # All styling, animations, and layout
├── game.js             # Full game logic (1 240 lines)
└── Assets/
    ├── Background/     # Scene background images
    ├── Buttons/        # All interactive button images
    ├── Game_assets/    # Match-3 tile images (5 types)
    ├── Monsters/       # Monster level images (LVL 1–3)
    ├── Ranks/          # Rank badge images (E, D, C, B, A)
    ├── Victory_Image.png
    ├── Victory_Star.png
    ├── Victory_Continu_BTN.png
    ├── Defeat_Image.png
    └── Defeat_Button.png
```

---

## 3. Game Screens & Flow

The game is a single-page application. Visibility of each screen is controlled by toggling the `.active` CSS class.

```
Home Screen
    │
    ├──[Settings Btn]──► Settings Modal (overlay)
    ├──[Badges Btn]────► Leaderboard Modal (overlay)
    └──[Start Btn]─────► AR Scanner View
                              │
                         [Scan Btn]
                              │
                         Destroy View (Target Lock)
                              │
                         [Destroy Btn]
                              │
                         Match-3 Battle Screen
                              │
                    ┌─────────┴─────────┐
               [Win: HP=0]        [Lose: Timer=0]
                    │                   │
             Victory Modal        Defeat Modal
                    │                   │
             [Continue Btn]      [Try Again Btn]
                    └─────────┬─────────┘
                         Home Screen
```

### Screen IDs

| Screen | HTML ID | Description |
|---|---|---|
| Home | `home-page-screen` | Main menu |
| AR Scanner | `scanner-view` | Scanning viewfinder |
| Destroy | `destroy-view` | Target-lock HUD |
| Match-3 | `match3-game-view` | Battle puzzle grid |
| Victory | `victory-modal` | Win result panel |
| Defeat | `defeat-modal` | Loss result panel |
| Settings | `settings-modal` | Settings overlay |
| Leaderboard | `leaderboard-modal` | Rankings overlay |

---

## 4. Core Modules (JavaScript)

All modules are initialized in the `DOMContentLoaded` event inside `game.js`.

### `initClock()`
Updates the status-bar clock every second using `setInterval`.  
**Element:** `#clock`

---

### `initAudioSynth()`
Registers the global `window.playSynthSound(type)` function.  
Uses the **Web Audio API** — no external audio files required.

| Sound Type | Trigger | Description |
|---|---|---|
| `'start'` | Start button | Energetic upward triangle-wave sweep |
| `'click'` | Any button tap | Soft sine-wave tap |
| `'hover'` | Mouse enter on buttons | Light chime at 900 Hz |

> **Note:** The AudioContext is created lazily on the first user interaction to comply with browser autoplay policies.

---

### `initClickEffects()`
Adds global click-ripple and particle-burst effects on all button presses.

- **Ripple:** A white circle expands from the click point and fades.
- **Particles:** 6 colored dots scatter outward (green `#38ef7d`, cyan `#11998e`, teal `#78ffd6`, gold `#f6d365`).

---

### `initHomeControls()`
Wires up the three home-screen buttons:

| Button | Action |
|---|---|
| `#start-game-btn` | Plays `'start'` sound → transitions to `#scanner-view` |
| `#settings-btn` | Plays `'click'` → opens `#settings-modal` |
| `#badges-btn` | Plays `'click'` → opens `#leaderboard-modal` |

---

### `initSettingsModal()`
Manages the **Settings** overlay:
- **Music toggle** (`#modal-music-btn`): mutes/unmutes background music.
- **Volume toggle** (`#modal-volume-btn`): mutes/unmutes SFX.
- **Volume slider**: Drag-and-drop + touch support. Updates `currentVolumeScale` (0–1), which scales all gain nodes.

---

### `initLeaderboardModal()`
Simple open/close handler for the leaderboard overlay (`#leaderboard-modal`).

---

### `initScannerView()`
Controls the **AR Scanner** screen:
1. Close button returns to Home.
2. Scan button (`#scan-trigger-btn`) triggers a sawtooth audio sweep, updates viewfinder status text, and after **1 500 ms** transitions to the Destroy screen.

---

### `initDestroyView()`
Controls the **Target Lock** screen:
1. Close button returns to Home.
2. Destroy button (`#destroy-trigger-btn`) fires a dual-oscillator explosion sound, spawns 20 particle bursts on the HUD, then after **750 ms** transitions to Match-3 and calls `startMatch3Game()`.

---

### `initMatch3Game()`
Registers event listeners for the Match-3 screen buttons:
- Close button → return to Home.
- Victory Continue → return to Home.
- Defeat Continue → return to Home.

---

## 5. Assets & Resources

### Match-3 Tile Types (`Assets/Game_assets/`)

| File | Symbol Meaning |
|---|---|
| `Battery.png` | Battery waste |
| `bottle.png` | Plastic bottle |
| `canserva.png` | Metal can |
| `paper.png` | Paper waste |
| `water_bottle.png` | Water bottle |

### Monster Levels (`Assets/Monsters/`)

| File | Level | Name (In-Game) |
|---|---|---|
| `Monstr_LVL1_photo.png` | Level 1 | PLASTIK MONSTR |
| `Monstr_LVL2_Photo.png` | Level 2 | ZAHARLI MONSTR |
| `Monstr_LVL3_Photo.png` | Level 3 | CHIQINDI BOSS |

### Rank Badges (`Assets/Ranks/`)

`Rank_E_.png` → `Rank_D_.png` → `Rank_C_.png` → `Rank_B_.png` → `Rank_A_.png`

---

## 6. UI Components & CSS

### Layout System
The game uses a **device-wrapper** approach — simulating a smartphone on desktop screens:
```
.device-wrapper       → Centers the phone on desktop
  .device-screen      → The visible phone screen (fixed aspect-ratio)
    .status-bar       → Signal / clock / battery icons
    .game-screen      → Individual screen container (hidden by default)
    .modal-overlay    → Settings & Leaderboard overlays
```

### Key CSS Animations

| Animation Name | Used On | Effect |
|---|---|---|
| `scanLine` | `.scanner-laser-line` | Green scanning laser sweeping top→bottom |
| `sonarSpin` | `.hud-sonar-line` | Rotating sonar sweep inside target HUD |
| `ringPulse` | `.rank-pulse-ring` | Pulsing glow ring on active rank badge |
| `starPop` | `.vstar` | Stars popping in sequence on Victory screen |
| `victoryGlow` | `.victory-screen` | Screen-wide golden glow on win |

---

## 7. Audio System

The audio engine uses the **Web Audio API** exclusively. All sounds are synthesized at runtime with no external files.

### Sound Architecture

```
Oscillator (type: sine/triangle/sawtooth)
    │
    ▼
GainNode  (volume envelope via AudioParam ramps)
    │
    ▼
AudioContext.destination (speakers)
```

### Volume Control
`currentVolumeScale` (global, 0–1) is multiplied with every gain value.  
The UI slider maps its 0–100% position directly to this scale.

---

## 8. Match-3 Battle Engine

The core game loop is managed by these functions:

### `startMatch3Game()`
- Resets HP to `100`, timer to `45s`.
- Randomly picks a monster from `monstersList`.
- Calls `generateStartBoard()` → `renderBoardHTML()` → `startMatch3TimerLoop()`.

### Board State
- `match3Board` — 8×8 2D array of asset indices (0–4).
- `selectedCell` — Currently selected tile `{row, col}` or `null`.
- `isBoardLocked` — Prevents interaction during animations.
- `match3TimeLeft` — Countdown from 45 to 0.
- `monsterHP` — Starts at 100; reduced by matched tiles.

### Game Loop

```
Player selects tile A
    │
Player selects tile B (adjacent)
    │
Swap A ↔ B
    │
Check for matches (3+ in row/column)
    ├── No match → swap back
    └── Match found
            │
        Remove matched tiles
            │
        Deal damage to monster HP
            │
        Drop tiles + refill from top
            │
        Check for new matches (cascade)
            │
        Check win condition (HP ≤ 0) ──► Victory
```

### Damage Formula
Each matched tile deals **`5 HP`** damage to the monster.  
Match of 3 = **15 HP**, Match of 4 = **20 HP**, Match of 5 = **25 HP**, etc.

### Timer
A 45-second countdown runs via `setInterval` (1 000 ms tick).  
- On `0` → `triggerDefeat()`
- On HP ≤ 0 → `triggerVictory()`

---

## 9. Rank & Leaderboard System

The leaderboard is a static UI display in the current version.

### Rank Progression

| Rank | Label | Points Needed |
|---|---|---|
| E | Boshlovchi (Beginner) | 0 |
| D | O'rta daraja (Intermediate) | 2 000 |
| C | Kuchli (Strong) | 5 000 |
| B | Ekspert (Expert) | 10 000 |
| A | Master (Master) | 20 000 |

### Sample Leaderboard Data

| Position | Player | Points | Rank |
|---|---|---|---|
| 1 | Master Bin | 4 820 | A |
| 2 | GreenHero | 3 450 | B |
| 3 | EcoShield | 2 600 | C |
| 4 | TrashBuster | 1 980 | D |
| 5 | Eco Guardian (You) | 1 250 | E |

---

## 10. How to Run

This is a **pure HTML/CSS/JS** project with no build step required.

### Option A — Open directly
```bash
# From the project folder:
open index.html
# or double-click index.html in your file manager
```

### Option B — Local HTTP server (recommended, avoids CORS issues with assets)
```bash
# Python 3
python3 -m http.server 8080

# Then open:
http://localhost:8080
```

### Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

---

*Guardian – Eco Defender · Documentation v1.0*
