```
well_ops/
├── .agents/                         # Konfigurace a nástroje AI agentů
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
│       │   ├── LICENSE
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
│       │   │   ├── modules-and-gallery.md
│       │   │   ├── security-2025.md
│       │   │   └── syntax-reference.md
│       │   └── SKILL.md
│       ├── powershell-windows/
│       │   └── SKILL.md
│       ├── sysadmin-toolbox/
│       │   ├── .clawhub/
│       │   │   └── origin.json
│       │   ├── references/
│       │   │   ├── cli-tools.md
│       │   │   ├── security-tools.md
│       │   │   ├── shell-oneliners.md
│       │   │   ├── shell-tricks.md
│       │   │   └── web-tools.md
│       │   ├── scripts/
│       │   │   └── refresh.sh
│       │   ├── _meta.json
│       │   └── SKILL.md
│       └── windows-hardening/
│           └── SKILL.md
├── .github/
│   └── workflows/
│       ├── notify-new-modules.yml     # Workflow pro oznámení nových modulů
│       └── static.yml                 # Workflow pro statický web
├── clicker/                           # Klikací hra
│   ├── assets/                        # Sestavené CSS a JavaScript
│   ├── img/                           # Obrázky hry
│   ├── index.html
│   ├── cookie.svg
│   └── 02_.png
├── gd/                                # Geometry Dash
│   ├── assets/                        # Herní grafika, fonty a zvuky
│   ├── index.html
│   ├── game.js
│   ├── vendor.js
│   ├── README.md
│   └── LICENSE
├── hyperdrive/                        # Samostatná hra
│   ├── Build/                         # Sestavené herní soubory
│   ├── TemplateData/                  # UI a šablona hry
│   ├── index.html
│   ├── kokes_blue_1.jpg
│   ├── kokes_blue_2.jpg
│   └── kokes_race.gif
├── img/                               # Obrázky a diagramy webu
│   ├── celebration/                   # Oslavné GIFy (proud-of-you*.gif)
│   ├── bird.png
│   ├── bios-boot.svg
│   ├── bios-layers.svg
│   ├── binary-search-tree.svg
│   ├── bus-architecture.svg
│   ├── cpu-arch.svg
│   ├── cpu-scheduling-algorithms.svg
│   ├── data-structures.svg
│   ├── device-drivers.svg
│   ├── directory-structures-tree.svg
│   ├── directory-tree-inode.svg
│   ├── disk-formatting-structure.svg
│   ├── disk-scheduling.svg
│   ├── dma-controller.svg
│   ├── file-access-methods.svg
│   ├── file-systems.svg
│   ├── fork-exec-model.svg
│   ├── fs-allocation-methods.svg
│   ├── fs-implementation.svg
│   ├── hdd-geometry.svg
│   ├── inode-structure-detail.svg
│   ├── interrupt.svg
│   ├── ipc-models.svg
│   ├── kernel-types.svg
│   ├── main-memory.svg
│   └── ...                            # Další obrázky a diagramy
├── js/
│   └── ops-stats.js                   # Logika statistik
├── maturita/                          # Maturitní část webu
│   ├── _next/                         # Generované soubory webu
│   ├── _not-found/                    # Generovaná stránka nenalezeno
│   ├── index.html
│   ├── index.txt
│   ├── 404.html
│   ├── _not-found.html
│   ├── icon.svg
│   ├── barina_run.png
│   └── ...                            # Další soubory (__next.*.txt)
├── mc/                                # Minecraft v prohlížeči
│   ├── v1_8/                          # Herní engine a zdroje
│   │   ├── lang/                      # Lokalizační soubory
│   │   ├── index.html
│   │   ├── classes.js
│   │   ├── classes.js.map
│   │   ├── assets.epk
│   │   ├── favicon.png
│   │   ├── README.md
│   │   └── .gitignore
│   ├── index.html
│   ├── bootstrap.js
│   ├── classes.js
│   ├── classes.js.map
│   ├── README.md
│   ├── assets.epw
│   ├── favicon.png
│   └── juchelka_craft.png
├── md/                                # Teoretické studijní materiály
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
├── praxe/                             # Praktická cvičení a řešení
│   ├── 00/
│   │   ├── __reseni.html
│   │   ├── __reseni.md
│   │   ├── __zadani.html
│   │   ├── __zadani.md
│   │   ├── _reseni.html
│   │   ├── _reseni.md
│   │   ├── _vysledek.html
│   │   ├── _vysledek.md
│   │   ├── _zadani.html
│   │   ├── _zadani.md
│   │   ├── tasks.js
│   │   └── verified.json
│   ├── 01/                            # Další úlohy stejného typu
│   │   └── ...
│   ├── 02/
│   │   └── ...
│   ├── modules.js                     # Logika modulů
│   └── modules.json                   # Definice modulů
├── skripty/                           # Kontrolní skripty pro Windows
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
│   └── notify-new-modules.mjs         # Skript pro oznámení nových modulů
├── stratagem/                         # Pomůcka pro Helldivers 2
│   ├── data/
│   │   ├── HD2-Sequences.json         # Sekvence kláves stratagemů
│   │   ├── Images/
│   │   │   ├── Arrows/
│   │   │   └── Stratagem Icons/
│   │   │       └── hd2/
│   │   └── Sounds/
│   ├── index.html
│   ├── script.js
│   ├── links.csv
│   └── .gitignore
├── 404.html                           # Stránka nenalezeného obsahu
├── README.md                          # Popis projektu a struktury repozitáře
├── games.html                         # Přehled her
├── index.html                         # Hlavní stránka webu
├── lab_gen.md                         # Poznámky k lab_gen
├── praxe.html                         # Praktická část
├── skills-lock.json                   # Zámek verzí AI skills
├── statistika.html                    # Statistiky
├── style.css                          # Hlavní styly webu
└── teorie.html                        # Teoretická část
```
