# 🖥️ well_ops

<p align="center">
  <img src="https://raw.githubusercontent.com/DeepyCat/well_ops/refs/heads/main/img/praxe-bg.jpg" width="400" alt="Fešák schvaluje">
</p>

<p align="center">
  <i>„Tohle je velice dobrá stránka pro OPS!“</i> — Fešák
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/DeepyCat/well_ops?style=flat-square" alt="Last commit">
  <img src="https://img.shields.io/github/repo-size/DeepyCat/well_ops?style=flat-square" alt="Repository size">
  <img src="https://img.shields.io/github/languages/count/DeepyCat/well_ops?style=flat-square" alt="Languages">
</p>

---

## 📖 O projektu

`well_ops` je web zaměřený hlavně na operační systémy, praktická cvičení a studijní materiály. Kromě toho tu najdeš různé hry, nástroje a nově také plnohodnotné **kasíno** s minihrami.

Všechno je na jednom místě, takže není potřeba hledat materiály v deseti různých složkách.

🌐 **Weby:**

- [kokot.fit](https://kokot.fit/)
- [ops.peakdle.site](https://ops.peakdle.site/)

📦 **GitHub:** [DeepyCat/well_ops](https://github.com/DeepyCat/well_ops)

---

## 🌐 Co tu najdeš

| Část | Co obsahuje |
|---|---|
| 🏠 Domů | Hlavní stránka a rozcestník (`index.html`) |
| 🛠️ Praxe | Praktické úlohy a moduly (`praxe.html`) |
| 📚 Teorie | Materiály k operačním systémům (`teorie.html`) |
| 📊 Statistiky | Statistiky webu (`statistika.html`) |
| 🎮 Hry | Hry, experimenty a zábavné nástroje (`games.html`) |
| 🎰 Kasíno | Herní sekce a kasíno (`kasino/`) |

---

## 🛠️ Praktická část

Praxe je rozdělená do modulů, které se zaměřují na práci se systémy Windows a jejich správu.

| Modul | Název |
|---|---|
| 00 | Příprava a instalace OS |
| 01 | Active Directory Domain Services |
| 02 | DHCP Server |

V úlohách se používají tyto virtuální stroje:

- `SRV1-DC` – hlavní server pro praktické úlohy.
- `SRV2-FS` – druhý server používaný při přípravě prostředí.
- `PC1-WIN` – klientská stanice s Windows.

Seznam modulů a jejich nastavení jsou v `praxe/modules.json`. Logiku jejich načítání řeší `praxe/modules.js`.

### 📧 Upozornění na nové moduly

Při přidání nového praktického modulu se automaticky odešle e-mailové upozornění. Díky tomu se o novém obsahu dozvíš bez nutnosti web pravidelně kontrolovat.

Odesílání zajišťuje automatizace v `.github/workflows/notify-new-modules.yml` a související skript `skripty/notify-new-modules.mjs`.

### ✅ Kontrolní skripty

Ve složce `skripty/` jsou `.bat` a `.ps1` skripty, které slouží ke kontrole vybraných nastavení a splnění praktických úloh.

---

## 🎮 Herní a kasinové projekty

Repozitář obsahuje celou řadu samostatných her, zábavných nástrojů a nově i sekci kasína:

| Projekt | Popis | Cesta |
|---|---|---|
| 🎰 Kasíno (Rozcestník) | Hlavní hub pro kasinové hry a gachu | [kasino/](kasino/) |
| 🃏 Blackjack | Karetní hra v kasínu | [kasino/blackjack.html](kasino/blackjack.html) |
| 🎁 Gacha | Systém otevírání beden / postav | [kasino/gacha.html](kasino/gacha.html) |
| 🎡 Ruleta | Kasinová ruleta | [kasino/roulette.html](kasino/roulette.html) |
| 🎰 Výherní automat | Slot machine | [kasino/slot.html](kasino/slot.html) |
| 🎡 Kolo štěstí | Kolo štěstí | [kasino/wheel.html](kasino/wheel.html) |
| 🍪 Clicker | Maturita clicker | [clicker/](clicker/) |
| 🕹️ Geometry Dash | Hra inspirovaná Juchelka dash | [gd/](gd/) |
| 🚗 Hyperdrive | Samostatná 3D hra | [hyperdrive/](hyperdrive/) |
| 🟩 Minecraft | Minecraft běžící v prohlížeči | [mc/](mc/) |
| 🎯 Stratagem | Pomůcka pro zadávání stratagemů v Helldivers 2 | [stratagem/](stratagem/) |

Další projekty a obsah najdeš na stránce [Hry](games.html).

---

## 📂 Struktura projektu

```text
well_ops/
├── .agents/                 # Skills a nástroje pro AI agenty
├── .github/                 # GitHub Actions a automatizace
├── blackjack/               # Samostatná složka blackjacku
├── clicker/                 # Klikací hra
├── gd/                      # Geometry Dash klon
├── hyperdrive/              # Samostatná 3D hra
├── img/                     # Obrázky, diagramy a GIFy
├── js/                      # JavaScriptové funkce webu
├── kasino/                  # Sekce kasína (minihry, gacha, audio)
├── maturita/                # Maturitní část webu
├── mc/                      # Minecraft v prohlížeči
├── md/                      # Teoretické materiály (.md)
├── praxe/                   # Praktická cvičení a moduly
├── skripty/                 # Kontrolní, bezpečnostní a pomocné skripty
├── stratagem/               # Pomůcka pro Helldivers 2
├── 404.html                 # Stránka nenalezeného obsahu
├── games.html               # Přehled her
├── index.html               # Hlavní stránka
├── lab_gen.md               # Poznámky k lab_gen
├── praxe.html               # Praktická část
├── README.md                # Dokumentace projektu
├── skills-lock.json         # Zámek verzí AI skills
├── statistika.html          # Statistiky
├── style.css                # Styly webu
└── teorie.html              # Teoretická část
```

<details>
<summary><b>🔍 Detailní struktura souborů</b></summary>

```text
well_ops/
├── .agents/
│   └── skills/
│       ├── design-taste-frontend/
│       ├── hardening-windows-endpoint-with-cis-benchmark/
│       ├── lab_gen/
│       ├── powershell-master/
│       ├── powershell-windows/
│       ├── sysadmin-toolbox/
│       └── windows-hardening/
├── .github/
│   └── workflows/
│       ├── notify-new-modules.yml
│       └── static.yml
├── blackjack/
├── clicker/
│   ├── assets/
│   │   ├── 01-Dnl9NRJ6.png
│   │   ├── 02_-Ds-_5-p-.png
│   │   └── ...
│   ├── img/
│   │   ├── alchemylab.png
│   │   ├── cookie.svg
│   │   └── ...
│   ├── 02_.png
│   └── index.html
├── gd/
│   ├── assets/
│   │   ├── levels/
│   │   │   ├── 1.txt
│   │   │   ├── 2.txt
│   │   │   └── ... (+ další úrovně)
│   │   ├── BackOnTrack.mp3
│   │   ├── StereoMadness.mp3
│   │   └── ... (+ další hudba a assety)
│   ├── game.js
│   ├── index.html
│   ├── LICENSE
│   ├── README.md
│   └── vendor.js
├── hyperdrive/
│   ├── Build/
│   │   ├── Hyperdrive-Web.data.part1
│   │   ├── Hyperdrive-Web.data.part2
│   │   ├── Hyperdrive-Web.framework.js
│   │   ├── Hyperdrive-Web.loader.js
│   │   └── Hyperdrive-Web.wasm
│   ├── TemplateData/
│   │   ├── favicon.ico
│   │   └── style.css
│   ├── index.html
│   ├── kokes_blue_1.jpg
│   ├── kokes_blue_2.jpg
│   └── kokes_race.gif
├── img/
│   ├── celebration/
│   │   ├── proud-of-you1.gif
│   │   └── ...
│   ├── binary-search-tree.svg
│   ├── bios-boot.svg
│   ├── os-concept.svg
│   └── ... (+ desítky dalších SVG schémat a pozadí)
├── js/
│   ├── ops-stats.js
│   ├── zaloha.js
│   └── zalohaV1.txt
├── kasino/
│   ├── img/
│   │   ├── A-Echo.png
│   │   ├── A-Kairo.png
│   │   └── ... (+ další postavy a ikony)
│   ├── song/
│   │   ├── playlist.json
│   │   ├── song1.mp3
│   │   └── song2.mp3
│   ├── blackjack.html
│   ├── gacha.html
│   ├── gacha.js
│   ├── index.html
│   ├── kasino-bg.png
│   ├── NOVY_BANNER.md
│   ├── roulette.html
│   ├── slot.html
│   └── wheel.html
├── maturita/
│   ├── _not-found/
│   ├── 404.html
│   ├── barina_run.png
│   ├── icon.svg
│   ├── index.html
│   └── index.txt
├── mc/
│   ├── v1_8/
│   │   ├── lang/
│   │   │   ├── cs_CZ.lang
│   │   │   ├── en_US.lang
│   │   │   └── ... (+ desítky jazyků)
│   │   ├── assets.epk
│   │   ├── classes.js
│   │   └── index.html
│   ├── bootstrap.js
│   ├── classes.js
│   ├── favicon.png
│   ├── index.html
│   ├── juchelka_craft.png
│   └── README.md
├── md/
│   ├── 01_Mass_Storage_Structure.md
│   ├── 01_Process_Concept.md
│   ├── 02_BIOS_UEFI.md
│   └── ... (+ další teoretické soubory)
├── praxe/
│   ├── 00/
│   │   ├── __reseni.html
│   │   ├── __zadani.html
│   │   ├── tasks.js
│   │   └── verified.json
│   ├── 01/
│   ├── 02/
│   ├── modules.js
│   └── modules.json
├── skripty/
│   ├── 00_check_PC1-WIN.bat
│   ├── 00_check_PC1-WIN.ps1
│   ├── notify-new-modules.mjs
│   ├── supabase_security_setup.sql
│   └── test_security_suite.js
├── stratagem/
│   ├── data/
│   │   ├── Images/
│   │   │   ├── Arrows/
│   │   │   └── Stratagem Icons/
│   │   │       └── hd2/
│   │   │           ├── autocannon.svg
│   │   │           ├── eagle_500kg_bomb.svg
│   │   │           ├── orbital_laser.svg
│   │   │           └── ... (+ desítky dalších ikon stratagemů)
│   │   ├── Sounds/
│   │   └── HD2-Sequences.json
│   ├── index.html
│   ├── links.csv
│   └── script.js
├── 404.html
├── games.html
├── index.html
├── lab_gen.md
├── praxe.html
├── README.md
├── skills-lock.json
├── statistika.html
├── style.css
└── teorie.html
```

</details>

---

## ⚙️ Technologie

- **HTML** – struktura stránek.
- **CSS** – vzhled webu a responzivní design.
- **JavaScript** – interaktivní funkce, hry a logika kasína.
- **Markdown** – studijní materiály a dokumentace.
- **PowerShell a Batch** – kontrolní skripty pro praktická cvičení.
- **Python** – pomocné skripty v některých AI skills.
- **GitHub Actions** – automatizace vybraných úloh v repozitáři.

---

## 🚀 Spuštění lokálně

Pro základní prohlédnutí webu můžeš otevřít `index.html` přímo v prohlížeči. Pokud některé funkce či moduly nebudou fungovat (např. kvůli CORS zásadám při načítání lokálních JSONů či skriptů), spusť web přes lokální HTTP server.

1. Naklonuj repozitář:
   ```bash
   git clone https://github.com/DeepyCat/well_ops.git
   ```

2. Otevři složku projektu:
   ```bash
   cd well_ops
   ```

3. Spusť lokální server pomocí Pythonu:
   ```bash
   python -m http.server 8000
   ```

4. Otevři v prohlížeči [http://localhost:8000](http://localhost:8000).

---

<p align="center">
  <i>Funguje to? Tak na to radši nesahej.</i>
</p>

<p align="center">
  <img src="https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif" width="300" alt="Funny coding GIF">
</p>

<p align="center">
  🐧 Made with questionable amounts of debugging.
</p>
