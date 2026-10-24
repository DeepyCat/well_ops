# 🖥️ well_ops

<p align="center">
  <img src="https://raw.githubusercontent.com/DeepyCat/well_ops/refs/heads/main/img/praxe-bg.jpg" width="400" alt="Fešák schvaluje">
</p>

<p align="center">
  <i>„Tohle je velice dobrá stránka pro OPS!“</i> — Fešák
</p>



---

## 📖 O projektu

`well_ops` je web zaměřený hlavně na operační systémy, praktická cvičení a studijní materiály. Kromě toho tu jsou i různé hry, nástroje a další menší projekty.

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
├── .agents/              # Konfigurace AI agentů a jejich nástrojů
├── .github/              # GitHub Actions
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
├── praxe.html            # Praktická část
├── statistika.html        # Statistiky
├── style.css             # Styly webu
├── teorie.html           # Teoretická část
├── lab_gen.md            # Poznámky k lab_gen
├── skills-lock.json      # Zámek verzí AI skills
└── README.md             # Dokumentace projektu
```

<details>
<summary><b>🔍 Detailní struktura souborů</b></summary>

```text
well_ops/
├── .agents/
│   └── skills/
│       ├── hardening-windows-endpoint-with-cis-benchmark/
│       ├── lab_gen/
│       ├── powershell-master/
│       ├── sysadmin-toolbox/
│       └── windows-hardening/
├── .github/
│   └── workflows/
│       ├── notify-new-modules.yml
│       └── static.yml
├── clicker/
├── gd/
├── hyperdrive/
├── img/
│   ├── celebration/
│   ├── bios-boot.svg
│   ├── cpu-arch.svg
│   ├── directory-tree-inode.svg
│   ├── memory-hierarchy.svg
│   ├── praxe-bg.jpg
│   ├── raid-levels.svg
│   └── teorie-bg.jpg
├── js/
│   └── ops-stats.js
├── maturita/
├── mc/
├── stratagem/
├── md/
│   ├── 01_Mass_Storage_Structure.md
│   ├── 01_Process_Concept.md
│   ├── 01_STRUKTURA_OPERAČNÍCH SYSTÉMŮ (1).md
│   ├── 01_Sprava_pameti_uvod.md
│   ├── 01_Sprava_periferii_a_preruseni.md
│   ├── 01_Vypocetni_system.md
│   ├── 02_BIOS_UEFI.md
│   ├── 02_Co_je_to_operacni_system.md
│   ├── 02_Disk_Scheduling_Management.md
│   ├── 02_Hlavni_pamet.md
│   ├── 02_Process_Scheduling.md
│   ├── 03_Device_Drivers.md
│   ├── 03_Funkce_OS.md
│   ├── 03_Operations_on_Processes.md
│   ├── 03_RAID_Stable_Storage.md
│   ├── 03_Segmentace.md
│   ├── 04_File_Concept_Access.md
│   ├── 04_IPC.md
│   ├── 04_Rozdeleni_OS.md
│   ├── 04_Strankovani.md
│   ├── 04_Systemova_volani.md
│   ├── 05_Directory_Structures.md
│   ├── 05_Historie_OS.md
│   ├── 05_Process_Synchronisation.md
│   ├── 05_Souborove_systemy.md
│   ├── 05_Virtualni_pamet.md
│   ├── 06_CPU_Scheduling.md
│   ├── 06_File_System_Implementation.md
│   ├── 06_Zakladni_datove_struktury.md
│   └── 07_Multitasking_Multithreading.md
├── praxe/
│   ├── 00/
│   ├── 01/
│   ├── 02/
│   ├── modules.js
│   └── modules.json
├── skripty/
│   ├── 00_check_PC1-WIN.bat
│   ├── 00_check_PC1-WIN.ps1
│   ├── 00_check_SRV1-DC.bat
│   ├── 00_check_SRV1-DC.ps1
│   ├── 00_check_SRV2-FS.bat
│   ├── 00_check_SRV2-FS.ps1
│   ├── 01_check_SRV1-DC.bat
│   ├── 01_check_SRV1-DC.ps1
│   ├── 02_check_PC1-WIN.bat
│   ├── 02_check_PC1-WIN.ps1
│   ├── 02_check_SRV1-DC.bat
│   ├── 02_check_SRV1-DC.ps1
│   └── notify-new-modules.mjs
├── 404.html
├── games.html
├── index.html
├── lab_gen.md
├── praxe.html
├── README.md
├── skills-lock.json
├── statistika.html
└── teorie.html
```

</details>

## ⚙️ Technologie

- **HTML** – struktura stránek.
- **CSS** – vzhled webu.
- **JavaScript** – interaktivní funkce.
- **Markdown** – studijní materiály a dokumentace.
- **GitHub Actions** – automatizace vybraných úloh v repozitáři.

Jednotlivé herní projekty mohou používat i další technologie.


## 🚀 Spuštění lokálně

Pro základní prohlédnutí webu stačí:

1. Naklonovat repozitář:

   ```bash
   git clone https://github.com/DeepyCat/well_ops.git
   ```

2. Otevřít složku projektu:

   ```bash
   cd well_ops
   ```

3. Otevřít `index.html` v prohlížeči.

U některých funkcí může být potřeba spustit web přes lokální HTTP server.

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
