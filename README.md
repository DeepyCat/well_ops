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

`well_ops` je web zaměřený hlavně na operační systémy, praktická cvičení a studijní materiály. Kromě toho tu jsou různé hry, nástroje a další menší projekty.

Všechno je na jednom místě, takže není potřeba hledat materiály v deseti různých složkách.

🌐 **Web:** [kokot.fit](https://kokot.fit/)  
📦 **GitHub:** [DeepyCat/well_ops](https://github.com/DeepyCat/well_ops)

## 🌐 Co tu najdeš

| Část | Co obsahuje |
|---|---|
| 🏠 Domů | Hlavní stránka a rozcestník |
| 🛠️ Praxe | Praktické úlohy a moduly |
| 📚 Teorie | Materiály k operačním systémům |
| 📊 Statistiky | Statistiky webu |
| 🎮 Hry | Hry a různé experimenty |

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

### Kontrolní skripty

Ve složce `skripty/` jsou `.bat` a `.ps1` skripty, které slouží ke kontrole vybraných nastavení a splnění praktických úloh.

## 📂 Struktura projektu

```text
well_ops/
├── .agents/              # Skills a nástroje pro AI agenty
├── .github/              # GitHub Actions a automatizace
├── clicker/              # Klikací hra
├── gd/                   # Geometry Dash klon
├── hyperdrive/           # Samostatná 3D hra
├── img/                  # Obrázky, diagramy a GIFy
├── js/                   # JavaScriptové funkce webu
├── maturita/             # Maturitní část webu
├── mc/                   # Minecraft v prohlížeči
├── md/                   # Teoretické materiály
├── praxe/                # Praktická cvičení a moduly
├── skripty/              # Kontrolní a pomocné skripty
├── stratagem/            # Pomůcka pro Helldivers 2
├── 404.html              # Stránka nenalezeného obsahu
├── games.html            # Přehled her
├── index.html            # Hlavní stránka
├── lab_gen.md            # Poznámky k lab_gen
├── praxe.html            # Praktická část
├── README.md             # Dokumentace projektu
├── skills-lock.json      # Zámek verzí AI skills
├── statistika.html       # Statistiky
├── style.css             # Styly webu
└── teorie.html           # Teoretická část
```

<details>
<summary><b>🔍 Detailní struktura souborů</b></summary>

```text
well_ops/
├── .agents/
│   └── skills/
│       ├── hardening-windows-endpoint-with-cis-benchmark/
│       │   ├── assets/
│       │   │   └── template.md
│       │   ├── references/
│       │   │   ├── api-reference.md
│       │   │   ├── standards.md
│       │   │   └── workflows.md
│       │   ├── scripts/
│       │   │   ├── agent.py
│       │   │   └── process.py
│       │   └── SKILL.md
│       ├── lab_gen/
│       │   ├── references/
│       │   │   ├── hardening-windows-endpoint-with-cis-benchmark/
│       │   │   ├── sysadmin-toolbox/
│       │   │   └── windows-hardening/
│       │   └── SKILL.md
│       ├── powershell-master/
│       │   ├── references/
│       │   │   ├── cicd-integration.md
│       │   │   ├── cross-platform-patterns.md
│       │   │   └── ...
│       │   └── SKILL.md
│       ├── powershell-windows/
│       │   └── SKILL.md
│       ├── sysadmin-toolbox/
│       │   ├── references/
│       │   ├── scripts/
│       │   └── SKILL.md
│       └── windows-hardening/
│           └── SKILL.md
├── .github/
│   └── workflows/
│       ├── notify-new-modules.yml
│       └── static.yml
├── clicker/
│   ├── assets/
│   │   └── ...
│   ├── img/
│   │   ├── ...
│   │   └── další obrázky
│   ├── 02_.png
│   ├── cookie.svg
│   └── index.html
├── gd/
│   ├── assets/
│   │   ├── levels/
│   │   │   ├── ...
│   │   │   └── object_overrides.json
│   │   ├── ...
│   │   └── herní assety a zvuky
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
│   ├── index.html
│   ├── kokes_blue_1.jpg
│   ├── kokes_blue_2.jpg
│   └── kokes_race.gif
├── img/
│   ├── celebration/
│   │   ├── proud-of-you1.gif
│   │   ├── proud-of-you2.gif
│   │   └── ...
│   ├── ...
│   ├── bird.png
│   ├── praxe-bg.jpg
│   ├── praxeS-bg.jpg
│   ├── prezentace-bg.jpg
│   ├── prezentaceS-bg.jpg
│   ├── teorie-bg.jpg
│   └── ...
├── js/
│   └── ops-stats.js
├── maturita/
│   ├── _not-found/
│   │   └── ...
│   ├── ...
│   ├── 404.html
│   ├── barina_run.png
│   ├── icon.svg
│   └── index.html
├── mc/
│   ├── v1_8/
│   │   ├── lang/
│   │   │   └── ...
│   │   ├── assets.epk
│   │   ├── classes.js
│   │   ├── favicon.png
│   │   ├── index.html
│   │   └── README.md
│   ├── assets.epw
│   ├── bootstrap.js
│   ├── classes.js
│   ├── favicon.png
│   ├── index.html
│   ├── juchelka_craft.png
│   └── README.md
├── md/
│   ├── 01_Mass_Storage_Structure.md
│   ├── 01_Process_Concept.md
│   ├── 01_Vypocetni_system.md
│   ├── 02_BIOS_UEFI.md
│   ├── 02_Co_je_to_operacni_system.md
│   ├── ...
│   └── 07_Multitasking_Multithreading.md
├── praxe/
│   ├── 00/
│   │   ├── __reseni.md
│   │   ├── __zadani.md
│   │   ├── _reseni.md
│   │   ├── _zadani.md
│   │   ├── tasks.js
│   │   ├── verified.json
│   │   └── ...
│   ├── 01/
│   │   └── ...
│   ├── 02/
│   │   └── ...
│   ├── modules.js
│   └── modules.json
├── skripty/
│   ├── 00_check_PC1-WIN.bat
│   ├── 00_check_PC1-WIN.ps1
│   ├── 00_check_SRV1-DC.bat
│   ├── 00_check_SRV1-DC.ps1
│   ├── 00_check_SRV2-FS.bat
│   ├── 00_check_SRV2-FS.ps1
│   ├── ...
│   └── notify-new-modules.mjs
├── stratagem/
│   ├── data/
│   │   ├── Images/
│   │   │   ├── Arrows/
│   │   │   │   ├── D.png
│   │   │   │   ├── L.png
│   │   │   │   └── ...
│   │   │   └── Stratagem Icons/
│   │   │       └── hd2/
│   │   │           └── ...
│   │   ├── Sounds/
│   │   │   ├── 1_D.mp3
│   │   │   ├── 2_L.mp3
│   │   │   └── ...
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

## ⚙️ Technologie

- **HTML** – struktura stránek.
- **CSS** – vzhled webu.
- **JavaScript** – interaktivní funkce a hry.
- **Markdown** – studijní materiály a dokumentace.
- **PowerShell a Batch** – kontrolní skripty pro praktická cvičení.
- **Python** – pomocné skripty v některých AI skills.
- **GitHub Actions** – automatizace vybraných úloh v repozitáři.

Jednotlivé herní projekty mohou používat i další technologie.

## 🚀 Spuštění lokálně

Pro základní prohlédnutí webu můžeš otevřít `index.html` přímo v prohlížeči. Pokud některé funkce nebudou fungovat, spusť web přes lokální HTTP server.

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
