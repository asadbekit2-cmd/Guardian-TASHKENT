# Guardian — Eko Himoyachi
### Rasmiy Hujjatlar · O'zbek tili

---

## Mundarija

1. [Umumiy ma'lumot](#1-umumiy-malumot)
2. [Loyiha tuzilmasi](#2-loyiha-tuzilmasi)
3. [O'yin ekranlari va oqim](#3-oyin-ekranlari-va-oqim)
4. [Asosiy modullar (JavaScript)](#4-asosiy-modullar-javascript)
5. [Aktivlar va resurslar](#5-aktivlar-va-resurslar)
6. [UI komponentlari va CSS](#6-ui-komponentlari-va-css)
7. [Audio tizimi](#7-audio-tizimi)
8. [Match-3 jangi mexanizmi](#8-match-3-jangi-mexanizmi)
9. [Daraja va reytinglar tizimi](#9-daraja-va-reytinglar-tizimi)
10. [Ishga tushirish](#10-ishga-tushirish)

---

## 1. Umumiy ma'lumot

**Guardian – Eko Himoyachi** — ekologik mavzudagi, mobil qurilmalarga mo'ljallangan, brauzerda ishlaydigan Match-3 boshqotirma o'yinidir.  
O'yinchilar AR (kengaytirilgan haqiqat) uslubidagi skaner orqali atrofni tekshiradi, eko-monstrlarni (ifloslanishning timsoli) nishonga oladi va 8×8 katakli Match-3 maydonchasida ular bilan kurashadi.

### Asosiy imkoniyatlar

| Imkoniyat | Tavsif |
|---|---|
| 📱 Mobil simulator | Ish stoli brauzerlarida smartfon ramkasi ko'rinishida ishlaydi |
| 🔊 Sintetik audio | Web Audio API orqali yaratilgan tovush effektlari (audio fayllar shart emas) |
| 🕹️ Match-3 mexanizmi | Almashish, moslashtirish va kaskad mexanizmli 8×8 katakli maydon |
| 🏆 Reyting jadvali | **E → D → C → B → A** darajali o'sish tizimi |
| ⚙️ Sozlamalar paneli | Musiqa va ovoz o'chirgichi hamda sudrab tortiladigan slayder |
| 🌊 AR skaner oqimi | Animatsiyali vizör → nishon qulflash → jang ketma-ketligi |
| ✨ Zarracha effektlari | Tugma bosilganda to'lqin effekti va zarrachalar portlashi |

---

## 2. Loyiha tuzilmasi

```
Guardian/
├── index.html          # Asosiy HTML — barcha ekranlar va modallar
├── style.css           # Barcha stillar, animatsiyalar va tartib
├── game.js             # To'liq o'yin mantig'i (1 240 qator)
└── Assets/
    ├── Background/     # Sahna fon rasmlari
    ├── Buttons/        # Barcha interaktiv tugmalar rasmlari
    ├── Game_assets/    # Match-3 kataklar rasmlari (5 tur)
    ├── Monsters/       # Monstr darajasi rasmlari (1–3 daraja)
    ├── Ranks/          # Daraja nishonlari rasmlari (E, D, C, B, A)
    ├── Victory_Image.png
    ├── Victory_Star.png
    ├── Victory_Continu_BTN.png
    ├── Defeat_Image.png
    └── Defeat_Button.png
```

---

## 3. O'yin ekranlari va oqim

O'yin — bitta sahifali ilova (SPA). Har bir ekranning ko'rinishi `.active` CSS klassi qo'shish yoki olib tashlash orqali boshqariladi.

```
Bosh ekran
    │
    ├──[Sozlamalar tugmasi]─► Sozlamalar modali (ustqatlama)
    ├──[Nishonlar tugmasi]──► Reyting modali (ustqatlama)
    └──[Boshlash tugmasi]───► AR Skaner ko'rinishi
                                    │
                              [Skanerlash tugmasi]
                                    │
                              Yo'q qilish ko'rinishi (Nishon qulflash)
                                    │
                              [Yo'q qilish tugmasi]
                                    │
                              Match-3 Jang ekrani
                                    │
                         ┌──────────┴──────────┐
                   [G'alaba: HP=0]      [Mag'lubiyat: Taymer=0]
                         │                      │
                  G'alaba modali         Mag'lubiyat modali
                         │                      │
                  [Davom etish]           [Qayta urinish]
                         └──────────┬──────────┘
                               Bosh ekran
```

### Ekranlarning HTML ID lari

| Ekran | HTML ID | Tavsif |
|---|---|---|
| Bosh | `home-page-screen` | Asosiy menyu |
| AR Skaner | `scanner-view` | Skanerlash vizöri |
| Yo'q qilish | `destroy-view` | Nishon qulflash HUD |
| Match-3 | `match3-game-view` | Jang boshqotirma katagi |
| G'alaba | `victory-modal` | G'alaba natija paneli |
| Mag'lubiyat | `defeat-modal` | Mag'lubiyat natija paneli |
| Sozlamalar | `settings-modal` | Sozlamalar ustqatlamasi |
| Reyting | `leaderboard-modal` | Reytinglar ustqatlamasi |

---

## 4. Asosiy modullar (JavaScript)

Barcha modullar `game.js` ichidagi `DOMContentLoaded` hodisasida ishga tushiriladi.

### `initClock()`
`setInterval` yordamida holat paneli soatini har soniyada yangilaydi.  
**Element:** `#clock`

---

### `initAudioSynth()`
Global `window.playSynthSound(type)` funksiyasini ro'yxatdan o'tkazadi.  
**Web Audio API** ishlatiladi — tashqi audio fayllar talab qilinmaydi.

| Tovush turi | Ishga tushiruvchi | Tavsif |
|---|---|---|
| `'start'` | Boshlash tugmasi | Uchburchak to'lqinli yuqoriga ko'tariluvchi kuchli sweep |
| `'click'` | Istalgan tugma bosilishi | Yumshoq sinus to'lqinli bosish tovushi |
| `'hover'` | Tugmaga sichqon olib borish | 900 Gs da yengil chiyillash |

> **Eslatma:** AudioContext brauzerning avtomatik ijro siyosatiga muvofiq birinchi foydalanuvchi amali sodir bo'lganda yaratiladi.

---

### `initClickEffects()`
Barcha tugma bosishlarida global klik to'lqin effekti va zarracha portlash effektini qo'shadi.

- **To'lqin:** Klik nuqtasidan oq doira kengayib yo'qoladi.
- **Zarrrachalar:** 6 ta rangli nuqta tashqariga tarqaladi (yashil `#38ef7d`, moviy-yashil `#11998e`, tarvuzrang `#78ffd6`, oltin `#f6d365`).

---

### `initHomeControls()`
Bosh ekrandagi uchta tugmani ulaydi.

| Tugma | Amal |
|---|---|
| `#start-game-btn` | `'start'` tovushi → `#scanner-view` ga o'tish |
| `#settings-btn` | `'click'` tovushi → `#settings-modal` ni ochish |
| `#badges-btn` | `'click'` tovushi → `#leaderboard-modal` ni ochish |

---

### `initSettingsModal()`
**Sozlamalar** ustqatlamasini boshqaradi:
- **Musiqa o'chirgichi** (`#modal-music-btn`): fon musiqasini o'chirib yoqadi.
- **Ovoz o'chirgichi** (`#modal-volume-btn`): tovush effektlarini o'chirib yoqadi.
- **Ovoz slayderi**: sudrab tortish va teginish boshqaruvi. `currentVolumeScale` (0–1) ni yangilaydi va barcha kuchaytirish tugunlarini miqyoslaydi.

---

### `initLeaderboardModal()`
Reyting jadvali ustqatlamasi (`#leaderboard-modal`) uchun oddiy ochish/yopish boshqaruvchisi.

---

### `initScannerView()`
**AR Skaner** ekranini boshqaradi:
1. Yopish tugmasi bosh sahifaga qaytaradi.
2. Skanerlash tugmasi (`#scan-trigger-btn`) arralashuvchi tovush sweepini ishga tushiradi, vizörning holat matnini yangilaydi va **1 500 ms** dan so'ng Yo'q qilish ekraniga o'tadi.

---

### `initDestroyView()`
**Nishon qulflash** ekranini boshqaradi:
1. Yopish tugmasi bosh sahifaga qaytaradi.
2. Yo'q qilish tugmasi (`#destroy-trigger-btn`) ikki generatorli portlash tovushini chiqaradi, HUD da 20 ta zarracha hosil qiladi va **750 ms** dan so'ng Match-3 ga o'tib `startMatch3Game()` ni chaqiradi.

---

### `initMatch3Game()`
Match-3 ekrani tugmalarining hodisa tinglovchilarini ro'yxatdan o'tkazadi:
- Yopish tugmasi → bosh sahifaga qaytish.
- G'alaba → Davom etish → bosh sahifaga qaytish.
- Mag'lubiyat → Davom etish → bosh sahifaga qaytish.

---

## 5. Aktivlar va resurslar

### Match-3 katak turlari (`Assets/Game_assets/`)

| Fayl | Ramzning ma'nosi |
|---|---|
| `Battery.png` | Batareya chiqindisi |
| `bottle.png` | Plastik shisha |
| `canserva.png` | Metal konserva |
| `paper.png` | Qog'oz chiqindi |
| `water_bottle.png` | Suv shishasi |

### Monstr darajalari (`Assets/Monsters/`)

| Fayl | Daraja | O'yindagi nomi |
|---|---|---|
| `Monstr_LVL1_photo.png` | Daraja 1 | PLASTIK MONSTR |
| `Monstr_LVL2_Photo.png` | Daraja 2 | ZAHARLI MONSTR |
| `Monstr_LVL3_Photo.png` | Daraja 3 | CHIQINDI BOSS |

### Daraja nishonlari (`Assets/Ranks/`)

`Rank_E_.png` → `Rank_D_.png` → `Rank_C_.png` → `Rank_B_.png` → `Rank_A_.png`

---

## 6. UI komponentlari va CSS

### Tartib tizimi
O'yin **qurilma qoplagichi** yondashuvidan foydalanadi — ish stoli ekranlarida smartfonni simulyatsiya qiladi:

```
.device-wrapper       → Smartfonni ish stolida markazlashtiradi
  .device-screen      → Ko'rinadigan telefon ekrani (belgilangan o'lcham nisbati)
    .status-bar       → Signal/soat/batareya ikonkalari
    .game-screen      → Alohida ekran konteyner (standart holda yashirin)
    .modal-overlay    → Sozlamalar va reyting ustqatlamalari
```

### Asosiy CSS animatsiyalari

| Animatsiya nomi | Qo'llaniladi | Effekt |
|---|---|---|
| `scanLine` | `.scanner-laser-line` | Yashil skanerlash lazeri yuqoridan pastga süpüradi |
| `sonarSpin` | `.hud-sonar-line` | Nishon HUD ichidagi sonar sweepining aylanishi |
| `ringPulse` | `.rank-pulse-ring` | Faol daraja nishonida yaltiragan halqa uradi |
| `starPop` | `.vstar` | G'alaba ekranida yulduzlar navbat bilan paydo bo'ladi |
| `victoryGlow` | `.victory-screen` | G'alaba paytida butun ekranda oltin yaltirash |

---

## 7. Audio tizimi

Audio mexanizmi faqat **Web Audio API** dan foydalanadi. Barcha tovushlar ishlash vaqtida sintez qilinadi, tashqi fayllar talab qilinmaydi.

### Tovush arxitekturasi

```
Ostsillyator (turi: sine/triangle/sawtooth)
    │
    ▼
Kuchaytirish tuguni (AudioParam ramp orqali tovush zarfi)
    │
    ▼
AudioContext.destination (dinamiklar)
```

### Ovoz balandligi boshqaruvi
`currentVolumeScale` (global o'zgaruvchi, 0–1) barcha kuchaytirish qiymatlariga ko'paytiriladi.  
UI slayderi 0–100% pozitsiyasini to'g'ridan-to'g'ri ushbu miqyosga moslashtiradi.

---

## 8. Match-3 jangi mexanizmi

Asosiy o'yin jarayoni quyidagi funksiyalar tomonidan boshqariladi:

### `startMatch3Game()`
- HP ni `100`, taymerni `45s` ga tiklaydi.
- `monstersList` dan tasodifiy monstr tanlaydi.
- `generateStartBoard()` → `renderBoardHTML()` → `startMatch3TimerLoop()` ni chaqiradi.

### Maydon holati o'zgaruvchilari

| O'zgaruvchi | Tavsif |
|---|---|
| `match3Board` | Aktiv indekslari (0–4) dan iborat 8×8 ikki o'lchamli massiv |
| `selectedCell` | Hozirda tanlangan katak `{row, col}` yoki `null` |
| `isBoardLocked` | Animatsiyalar davomida o'zaro ta'sirni bloklaydi |
| `match3TimeLeft` | 45 dan 0 ga qadar sanash |
| `monsterHP` | 100 dan boshlanadi; mos kelgan kataklar bilan kamayadi |

### O'yin jarayoni

```
O'yinchi A katakni tanlaydi
    │
O'yinchi B katakni tanlaydi (qo'shni)
    │
A va B almashadi
    │
Moslik tekshiriladi (qatorda yoki ustunda 3 ta yoki ko'proq)
    ├── Moslik yo'q → almashishni bekor qilish
    └── Moslik topildi
            │
        Mos kelgan kataklar o'chiriladi
            │
        Monstr HP ga zarar yetkaziladi
            │
        Kataklar tushadi va tepadan to'ldiriladi
            │
        Yangi mosliklar tekshiriladi (kaskad)
            │
        G'alaba sharti tekshiriladi (HP≤0) ──► G'alaba
```

### Zarar formulasi
Har bir mos kelgan katak monstrga **5 HP** zarar yetkazadi.  
3 moslik = **15 HP**, 4 moslik = **20 HP**, 5 moslik = **25 HP**

### Taymer
`setInterval` (1 000 ms takt) orqali 45 soniyalik sanash ishlaydi.
- `0` ga yetganda → `triggerDefeat()` (mag'lubiyat)
- HP ≤ 0 bo'lganda → `triggerVictory()` (g'alaba)

---

## 9. Daraja va reytinglar tizimi

Reyting jadvali hozirgi versiyada statik UI ko'rinishida.

### Daraja o'sishi

| Daraja | Unvon | Kerakli ball |
|---|---|---|
| E | Boshlovchi | 0 |
| D | O'rta daraja | 2 000 |
| C | Kuchli | 5 000 |
| B | Ekspert | 10 000 |
| A | Master | 20 000 |

### Reyting jadvalining namuna ma'lumotlari

| O'rin | O'yinchi | Ball | Daraja |
|---|---|---|---|
| 1 | Master Bin | 4 820 | A |
| 2 | GreenHero | 3 450 | B |
| 3 | EcoShield | 2 600 | C |
| 4 | TrashBuster | 1 980 | D |
| 5 | Eco Guardian (Siz) | 1 250 | E |

---

## 10. Ishga tushirish

Bu loyiha — hech qanday build jarayoni talab qilmaydigan **sof HTML/CSS/JS** loyiha.

### A varianti — To'g'ridan-to'g'ri ochish
```bash
# Loyiha papkasidan:
open index.html
# yoki fayl menejerida index.html ni ikki marta bosing
```

### B varianti — Mahalliy HTTP server (tavsiya etiladi, CORS muammolarini oldini oladi)
```bash
# Python 3
python3 -m http.server 8080

# So'ng brauzerda oching:
http://localhost:8080
```

### Brauzer muvofiqligi

| Brauzer | Qo'llab-quvvatlash |
|---|---|
| Chrome 90+ | ✅ To'liq |
| Firefox 88+ | ✅ To'liq |
| Safari 15+ | ✅ To'liq |
| Edge 90+ | ✅ To'liq |
| IE 11 | ❌ Qo'llab-quvvatlanmaydi |

---

*Guardian – Eko Himoyachi · Hujjatlar v1.0*
