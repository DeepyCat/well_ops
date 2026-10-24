Struktura
well_ops/
│
├── 📂 .agents/                              # Konfigurace a nástroje AI agentů
│   └── 📂 skills/
│       ├── 📂 hardening-windows-endpoint-with-cis-benchmark/
│       │   ├── 📂 assets/
│       │   │   └── template.md
│       │   ├── 📂 references/
│       │   │   ├── api-reference.md
│       │   │   ├── standards.md
│       │   │   └── workflows.md
│       │   ├── 📂 scripts/
│       │   │   ├── agent.py
│       │   │   └── process.py
│       │   ├── LICENSE
│       │   └── SKILL.md
│       │
│       ├── 📂 lab_gen/
│       │   ├── 📂 references/
│       │   │   ├── 📂 hardening-windows-endpoint-with-cis-benchmark/
│       │   │   ├── 📂 sysadmin-toolbox/
│       │   │   └── 📂 windows-hardening/
│       │   └── SKILL.md
│       │
│       ├── 📂 powershell-master/
│       │   ├── 📂 references/
│       │   │   ├── cicd-integration.md
│       │   │   ├── cross-platform-patterns.md
│       │   │   ├── modules-and-gallery.md
│       │   │   ├── security-2025.md
│       │   │   └── syntax-reference.md
│       │   └── SKILL.md
│       │
│       ├── 📂 powershell-windows/
│       │   └── SKILL.md
│       ├── 📂 sysadmin-toolbox/
│       │   ├── 📂 references/
│       │   ├── 📂 scripts/
│       │   ├── _meta.json
│       │   └── SKILL.md
│       └── 📂 windows-hardening/
│           └── SKILL.md
│
├── 📂 .github/
│   └── 📂 workflows/
│       └── static.yml                      # Workflow pro statický web
│
├── 📂 clicker/                              # Samostatná klikací hra
│   ├── 📂 assets/                           # Sestavené CSS, JS a obrázky
│   │   ├── index-BZ_H0cX1.js
│   │   └── index-CJY1JsmG.css
│   ├── 📂 img/                              # Grafika hry
│   │   ├── alchemylab.png
│   │   ├── grandma.png
│   │   ├── factory.png
│   │   ├── farm.png
│   │   ├── mine.png
│   │   └── ...                              # Další herní obrázky
│   ├── 📜 index.html
│   ├── 📜 cookie.svg
│   └── 🖼️ 02_.png
│
├── 📂 gd/                                   # Geometry Dash
│   ├── 📂 assets/                           # Grafika, fonty a zvuky hry
│   │   ├── GJ_GameSheet.png
│   │   ├── GJ_GameSheet.json
│   │   ├── GJ_GameSheet02.png
│   │   ├── GJ_GameSheet03.png
│   │   ├── GJ_GameSheet04.png
│   │   ├── PixelSheet_01.png
│   │   ├── FireSheet_01-hd.png
│   │   ├── StereoMadness.mp3
│   │   ├── BackOnTrack.mp3
│   │   ├── DryOut.mp3
│   │   ├── ...                              # Další assety a hudba
│   │   └── ...
│   ├── 📜 index.html
│   ├── 📜 game.js
│   ├── 📜 vendor.js
│   ├── 📜 README.md
│   └── 📜 LICENSE
│
├── 📂 hyperdrive/                            # Další samostatná hra
│   ├── 📂 Build/                            # Sestavené herní soubory
│   ├── 📂 TemplateData/                     # Šablona a UI hry
│   ├── 📜 index.html
│   ├── 🖼️ kokes_blue_1.jpg
│   ├── 🖼️ kokes_blue_2.jpg
│   └── 🖼️ kokes_race.gif
│
├── 📂 img/                                  # Obrázky a diagramy webu
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
│   └── ...                                 # Další ilustrace a grafika
│
├── 📂 js/
│   └── 📜 ops-stats.js                      # Statistiky a jejich logika
│
├── 📂 maturita/                             # Obsah maturitní části
│   ├── 📂 _next/                            # Soubory generovaného webu
│   ├── 📜 index.html
│   ├── 📜 index.txt
│   ├── 📜 404.html
│   ├── 📜 icon.svg
│   ├── 🖼️ barina_run.png
│   └── ...                                 # Další generované soubory
│
├── 📂 mc/                                   # Minecraft v prohlížeči
│   ├── 📂 v1_8/                             # Herní engine a herní zdroje
│   │   ├── 📂 lang/                         # Lokalizační soubory
│   │   └── ...                              # Další soubory hry
│   ├── 📜 index.html
│   ├── 📜 bootstrap.js
│   ├── 📜 classes.js
│   ├── 📜 classes.js.map
│   ├── 📜 README.md
│   ├── 📜 assets.epw
│   ├── 🖼️ favicon.png
│   └── 🖼️ juchelka_craft.png
│
├── 📂 md/                                   # Teoretické studijní materiály
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
│
├── 📂 praxe/                                # Praktické úlohy a jejich řešení
│   ├── 📂 00/
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
│   ├── 📂 01/                               # Stejný typ souborů pro další úlohy
│   │   └── ...
│   ├── 📂 02/
│   │   └── ...
│   ├── 📜 modules.js                        # Logika modulů
│   └── 📜 modules.json                      # Definice modulů
│
├── 📂 skripty/                              # Kontrolní skripty pro Windows
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
│   └── 02_check_SRV1-DC.ps1
│
├── 📂 stratagem/                            # Nástroj pro Helldivers 2
│   ├── 📂 data/
│   │   ├── 📂 Images/
│   │   │   ├── 📂 Arrows/
│   │   │   └── 📂 Stratagem Icons/
│   │   │       └── 📂 hd2/
│   │   └── 📂 Sounds/
│   ├── 📜 index.html
│   ├── 📜 script.js
│   ├── 📜 links.csv
│   └── 📜 .gitignore
│
├── 📜 404.html                              # Stránka nenalezeného obsahu
├── 📜 index.html                            # Hlavní stránka webu
├── 📜 games.html                            # Přehled her
├── 📜 teorie.html                           # Teoretická část
├── 📜 praxe.html                            # Praktická část
├── 📜 statistika.html                       # Stránka statistik
├── 📜 style.css                             # Hlavní CSS styly
├── 📜 lab_gen.md                            # Dokumentace / poznámky k lab_gen
└── 📜 skills-lock.json                      # Zámek verzí AI skills
