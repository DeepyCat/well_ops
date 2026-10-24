<p align="center">
  <img src="https://raw.githubusercontent.com/DeepyCat/well_ops/refs/heads/main/img/praxe-bg.jpg" width="400" alt="Fešák schvaluje">
</p>

> *"Tohle je velice dobrá stránka pro OPS!"* — Fešák

---

## 📂 Struktura projektu
```
well_ops/
├── .agents/                        # Konfigurace a nástroje AI agentů
├── .github/                        # GitHub Workflows
├── clicker/                        # Klikací hra
├── gd/                             # Geometry Dash
├── hyperdrive/                     # Samostatná hra
├── img/                            # Obrázky, diagramy a animace
├── js/                             # Logika statistik
├── maturita/                       # Maturitní část webu
├── mc/                             # Minecraft v prohlížeči
├── md/                             # Teoretické studijní materiály
├── praxe/                          # Praktická cvičení a řešení
├── skripty/                        # Kontrolní skripty pro Windows
├── stratagem/                      # Pomůcka pro Helldivers 2
├── README.md                       # Popis projektu
├── index.html                      # Hlavní stránka webu
├── praxe.html                      # Praktická část
├── teorie.html                     # Teoretická část
├── statistika.html                 # Statistiky
├── games.html                      # Přehled her
└── style.css                       # Hlavní styly webu
```
<details>
<summary><b>🔍 Kliknutím rozbalíte detailní strom souborů projektu</b></summary>

```text
well_ops/
├── .agents/                        # AI agenti a skilly
│   └── skills/
│       ├── hardening-windows-endpoint-with-cis-benchmark/
│       ├── lab_gen/
│       ├── powershell-master/
│       ├── sysadmin-toolbox/
│       └── windows-hardening/
├── .github/                        # GitHub Actions (workflows)
│   └── workflows/
│       ├── notify-new-modules.yml
│       └── static.yml
├── clicker/                        # Klikací hra
├── gd/                             # Geometry Dash klon
├── hyperdrive/                     # Samostatná 3D hra
├── img/                            # Schémata, diagramy a pozadí
│   ├── celebration/                # Oslavné GIFy
│   ├── bios-boot.svg               # Proces bootování BIOS/UEFI
│   ├── cpu-arch.svg                # Architektura CPU
│   ├── directory-tree-inode.svg    # Struktura adresářů a inodů
│   ├── memory-hierarchy.svg        # Paměťová hierarchie
│   ├── praxe-bg.jpg                # Pozadí pro praktickou část
│   ├── raid-levels.svg             # RAID pole
│   └── teorie-bg.jpg               # Pozadí pro teoretickou část
├── js/
│   └── ops-stats.js                # Logika statistik webu
├── maturita/                       # Coockie clicker
├── mc/                             # Minecraft v prohlížeči (v1_8 engine)
├── stratagem/                      # Pomůcka pro Helldivers 2
├── md/                             # Teoretické studijní materiály (Maturitní okruhy OS)
│   ├── 01_Mass_Storage_Structure.md
│   ├── 01_Process_Concept.md
│   ├── 01_STRUKTURA_OPERAČNÍCH_SYSTÉMŮ (1).md
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
├── praxe/                          # Praktická cvičení a řešení
│   ├── 00/                         # Úloha 00 (__zadani, __reseni, tasks.js, verified.json)
│   ├── 01/                         # Úloha 01
│   ├── 02/                         # Úloha 02
│   ├── modules.js                  # Logika modulů
│   └── modules.json                # Definice modulů
├── skripty/                        # Kontrolní skripty pro Windows
│   ├── 00_check_PC1-WIN.bat / .ps1
│   ├── 00_check_SRV1-DC.bat / .ps1
│   ├── 00_check_SRV2-FS.bat / .ps1
│   ├── 01_check_SRV1-DC.bat / .ps1
│   ├── 02_check_PC1-WIN.bat / .ps1
│   ├── 02_check_SRV1-DC.bat / .ps1
│   └── notify-new-modules.mjs      # Skript pro oznámení nových modulů
├── 404.html                        # Stránka nenalezeného obsahu
├── README.md                       # Popis projektu a struktury repozitáře
├── games.html                      # Přehled her
├── index.html                      # Hlavní stránka webu
├── lab_gen.md                      # Poznámky k lab_gen
├── praxe.html                      # Praktická část
├── skills-lock.json                # Zámek verzí AI skills
├── statistika.html                 # Statistiky
├── style.css                       # Hlavní styly webu
└── teorie.html                     # Teoretická část
