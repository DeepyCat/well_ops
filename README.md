<p align="center">
  <img src="https://raw.githubusercontent.com/DeepyCat/well_ops/refs/heads/main/img/praxe-bg.jpg" width="400" alt="Fešák schvaluje">
</p>

> *"Tohle je velice dobrá stránka pro OPS!"* — Fešák

---

## 📂 Struktura projektu
<details>
<summary><b>Kliknutím rozbalíte kompletní strom souborů a složek</b></summary>

```text
├── .agents
│   └── skills
│       ├── hardening-windows-endpoint-with-cis-benchmark
│       │   ├── assets
│       │   │   └── template.md
│       │   ├── references
│       │   │   ├── api-reference.md
│       │   │   ├── standards.md
│       │   │   └── workflows.md
│       │   ├── scripts
│       │   │   ├── agent.py
│       │   │   └── process.py
│       │   ├── LICENSE
│       │   └── SKILL.md
│       ├── lab_gen
│       │   ├── references
│       │   │   ├── hardening-windows-endpoint-with-cis-benchmark
│       │   │   │   ├── assets
│       │   │   │   │   └── template.md
│       │   │   │   ├── references
│       │   │   │   │   ├── api-reference.md
│       │   │   │   │   ├── standards.md
│       │   │   │   │   └── workflows.md
│       │   │   │   ├── scripts
│       │   │   │   │   ├── agent.py
│       │   │   │   │   └── process.py
│       │   │   │   ├── LICENSE
│       │   │   │   └── SKILL.md
│       │   │   ├── sysadmin-toolbox
│       │   │   │   ├── .clawhub
│       │   │   │   │   └── origin.json
│       │   │   │   ├── references
│       │   │   │   │   ├── cli-tools.md
│       │   │   │   │   ├── security-tools.md
│       │   │   │   │   ├── shell-oneliners.md
│       │   │   │   │   ├── shell-tricks.md
│       │   │   │   │   └── web-tools.md
│       │   │   │   ├── scripts
│       │   │   │   │   └── refresh.sh
│       │   │   │   ├── _meta.json
│       │   │   │   └── SKILL.md
│       │   │   └── windows-hardening
│       │   │       └── SKILL.md
│       │   └── SKILL.md
│       ├── powershell-master
│       │   ├── references
│       │   │   ├── cicd-integration.md
│       │   │   ├── cross-platform-patterns.md
│       │   │   ├── modules-and-gallery.md
│       │   │   ├── security-2025.md
│       │   │   └── syntax-reference.md
│       │   └── SKILL.md
│       ├── powershell-windows
│       │   └── SKILL.md
│       ├── sysadmin-toolbox
│       │   ├── .clawhub
│       │   │   └── origin.json
│       │   ├── references
│       │   │   ├── cli-tools.md
│       │   │   ├── security-tools.md
│       │   │   ├── shell-oneliners.md
│       │   │   ├── shell-tricks.md
│       │   │   └── web-tools.md
│       │   ├── scripts
│       │   │   └── refresh.sh
│       │   ├── _meta.json
│       │   └── SKILL.md
│       └── windows-hardening
│           └── SKILL.md
├── .github
│   └── workflows
│       ├── notify-new-modules.yml
│       └── static.yml
├── clicker
│   ├── assets
│   │   ├── 01-Dnl9NRJ6.png
│   │   ├── 02_-Ds-_5-p-.png
│   │   ├── index-BZ_H0cX1.js
│   │   └── index-CJY1JsmG.css
│   ├── img
│   │   ├── alchemylab.png
│   │   ├── alchemylabBackground.png
│   │   ├── alchemylabIcon.png
│   │   ├── alteredGrandma.png
│   │   ├── antiGrandma.png
│   │   ├── antimattercondenser.png
│   │   ├── antimattercondenserBackground.png
│   │   ├── antimattercondenserIcon.png
│   │   ├── bgBlue.jpg
│   │   ├── blackGradient.png
│   │   ├── chocolateMilkWave.png
│   │   ├── control.png
│   │   ├── cookieShower1.png
│   │   ├── cookieShower2.png
│   │   ├── cookieShower3.png
│   │   ├── cosmicGrandma.png
│   │   ├── cursor.png
│   │   ├── cursoricon.png
│   │   ├── darkNoise.png
│   │   ├── factory.png
│   │   ├── factoryBackground.png
│   │   ├── factoryIcon.png
│   │   ├── farm.png
│   │   ├── farmBackground.png
│   │   ├── farmerGrandma.png
│   │   ├── farmIcon.png
│   │   ├── goldCookie.png
│   │   ├── grandma.png
│   │   ├── grandmaBackground.png
│   │   ├── grandmaIcon.png
│   │   ├── grandmas1.jpg
│   │   ├── grandmas2.jpg
│   │   ├── grandmas3.jpg
│   │   ├── grandmasGrandma.png
│   │   ├── icons.png
│   │   ├── imperfectCookie.png
│   │   ├── infoBG.png
│   │   ├── infoBGfade.png
│   │   ├── mapBG.jpg
│   │   ├── mapIcons.png
│   │   ├── mapTiles.png
│   │   ├── marshmallows.png
│   │   ├── milk.png
│   │   ├── milkWave.png
│   │   ├── mine.png
│   │   ├── mineBackground.png
│   │   ├── mineIcon.png
│   │   ├── minerGrandma.png
│   │   ├── money.png
│   │   ├── mysteriousHero.png
│   │   ├── mysteriousOpponent.png
│   │   ├── panelHorizontal.png
│   │   ├── panelVertical.png
│   │   ├── perfectCookie.png
│   │   ├── portal.png
│   │   ├── portalBackground.png
│   │   ├── portalIcon.png
│   │   ├── raspberryWave.png
│   │   ├── shine.png
│   │   ├── shipment.png
│   │   ├── shipmentBackground.png
│   │   ├── shipmentIcon.png
│   │   ├── smallCookies.png
│   │   ├── storeTile.jpg
│   │   ├── timemachine.png
│   │   ├── timemachineBackground.png
│   │   ├── timemachineIcon.png
│   │   ├── transmutedGrandma.png
│   │   ├── upgradeFrame.png
│   │   ├── workerGrandma.png
│   │   └── wrathCookie.png
│   ├── 02_.png
│   ├── cookie.svg
│   └── index.html
├── gd
│   ├── assets
│   │   ├── levels
│   │   │   ├── 1.txt
│   │   │   ├── 10.txt
│   │   │   ├── 11.txt
│   │   │   ├── 12.txt
│   │   │   ├── 13.txt
│   │   │   ├── 14.txt
│   │   │   ├── 15.txt
│   │   │   ├── 16.txt
│   │   │   ├── 17.txt
│   │   │   ├── 18.txt
│   │   │   ├── 19.txt
│   │   │   ├── 2.txt
│   │   │   ├── 20.txt
│   │   │   ├── 21.txt
│   │   │   ├── 22.txt
│   │   │   ├── 3.txt
│   │   │   ├── 3001.txt
│   │   │   ├── 4.txt
│   │   │   ├── 5.txt
│   │   │   ├── 5001.txt
│   │   │   ├── 5002.txt
│   │   │   ├── 5003.txt
│   │   │   ├── 5004.txt
│   │   │   ├── 6.txt
│   │   │   ├── 7.txt
│   │   │   ├── 8.txt
│   │   │   ├── 9.txt
│   │   │   └── object_overrides.json
│   │   ├── 1.txt
│   │   ├── BackOnTrack.mp3
│   │   ├── BaseAfterBase.mp3
│   │   ├── bigFont.fnt
│   │   ├── bigFont.png
│   │   ├── BlastProcessing.mp3
│   │   ├── CantLetGo.mp3
│   │   ├── Clubstep.mp3
│   │   ├── Clutterfunk.mp3
│   │   ├── crack_me.png
│   │   ├── Cycles.mp3
│   │   ├── Dash.mp3
│   │   ├── Deadlocked.mp3
│   │   ├── DryOut.mp3
│   │   ├── Electrodynamix.mp3
│   │   ├── Electroman.mp3
│   │   ├── endStart_02.ogg
│   │   ├── explode_11.ogg
│   │   ├── Fingerdash.mp3
│   │   ├── FireSheet_01-hd.json
│   │   ├── FireSheet_01-hd.png
│   │   ├── game_bg_01_001.png
│   │   ├── game_bg_02_001.png
│   │   ├── game_bg_03_001.png
│   │   ├── game_bg_04_001.png
│   │   ├── game_bg_05_001.png
│   │   ├── game_bg_06_001.png
│   │   ├── game_bg_07_001.png
│   │   ├── game_bg_08_001.png
│   │   ├── game_bg_09_001.png
│   │   ├── game_bg_10_001.png
│   │   ├── game_bg_11_001.png
│   │   ├── game_bg_12_001.png
│   │   ├── game_bg_13_001.png
│   │   ├── game_bg_14_001.png
│   │   ├── game_bg_15_001.png
│   │   ├── game_bg_16_001.png
│   │   ├── game_bg_17_001.png
│   │   ├── game_bg_18_001.png
│   │   ├── game_bg_19_001.png
│   │   ├── game_bg_20_001.png
│   │   ├── game_bg_21_001.png
│   │   ├── game_bg_22_001.png
│   │   ├── GeometricalDominator.mp3
│   │   ├── GJ_GameSheet.json
│   │   ├── GJ_GameSheet.png
│   │   ├── GJ_GameSheet02.json
│   │   ├── GJ_GameSheet02.png
│   │   ├── GJ_GameSheet03.json
│   │   ├── GJ_GameSheet03.png
│   │   ├── GJ_GameSheet04.json
│   │   ├── GJ_GameSheet04.png
│   │   ├── GJ_GameSheetEditor.json
│   │   ├── GJ_GameSheetEditor.png
│   │   ├── GJ_GameSheetGlow.json
│   │   ├── GJ_GameSheetGlow.png
│   │   ├── GJ_ParticleSheet.json
│   │   ├── GJ_ParticleSheet.png
│   │   ├── GJ_square02.png
│   │   ├── GJ_WebSheet.json
│   │   ├── GJ_WebSheet.png
│   │   ├── goldFont.fnt
│   │   ├── goldFont.png
│   │   ├── HexagonForce.mp3
│   │   ├── highscoreGet02.ogg
│   │   ├── juchelka.png
│   │   ├── juchelka_logo.png
│   │   ├── juchelkaD.png
│   │   ├── Jumper.mp3
│   │   ├── PixelSheet_01.json
│   │   ├── PixelSheet_01.png
│   │   ├── playSound_01.ogg
│   │   ├── Polargeist.mp3
│   │   ├── quitSound_01.ogg
│   │   ├── sliderBar.png
│   │   ├── square04_001.png
│   │   ├── StereoMadness.mp3
│   │   ├── TheoryOfEverything.mp3
│   │   ├── TheoryOfEverything2.mp3
│   │   ├── TimeMachine.mp3
│   │   └── xStep.mp3
│   ├── game.js
│   ├── index.html
│   ├── LICENSE
│   ├── README.md
│   └── vendor.js
├── hyperdrive
│   ├── Build
│   │   ├── Hyperdrive-Web.data.part1
│   │   ├── Hyperdrive-Web.data.part2
│   │   ├── Hyperdrive-Web.framework.js
│   │   ├── Hyperdrive-Web.loader.js
│   │   └── Hyperdrive-Web.wasm
│   ├── TemplateData
│   │   ├── favicon.ico
│   │   └── style.css
│   ├── index.html
│   ├── kokes_blue_1.jpg
│   ├── kokes_blue_2.jpg
│   └── kokes_race.gif
├── img
│   ├── celebration
│   │   ├── proud-of-you1.gif
│   │   ├── proud-of-you2.gif
│   │   ├── proud-of-you3.gif
│   │   ├── proud-of-you4.gif
│   │   └── proud-of-you5.gif
│   ├── binary-search-tree.svg
│   ├── bios-boot.svg
│   ├── bios-layers.svg
│   ├── bird.png
│   ├── bus-architecture.svg
│   ├── context-switch.svg
│   ├── cpu-arch.svg
│   ├── cpu-scheduling-algorithms.svg
│   ├── critical-section-mutex.svg
│   ├── data-structures.svg
│   ├── device-drivers.svg
│   ├── directory-structures-tree.svg
│   ├── directory-tree-inode.svg
│   ├── disk-formatting-structure.svg
│   ├── disk-scheduling.svg
│   ├── dma-controller.svg
│   ├── file-access-methods.svg
│   ├── file-attributes-operations.svg
│   ├── file-systems.svg
│   ├── fork-exec-model.svg
│   ├── fs-allocation-methods.svg
│   ├── fs-implementation.svg
│   ├── hdd-geometry.svg
│   ├── IHATETHISFUCKINGBULLSHITKILLYOURSELF.svg
│   ├── inode-structure-detail.svg
│   ├── interrupt.svg
│   ├── ipc-models.svg
│   ├── kernel-types.svg
│   ├── main-memory.svg
│   ├── memory-fragmentation.svg
│   ├── memory-hierarchy.svg
│   ├── mmu-translation.svg
│   ├── os-concept.svg
│   ├── os-functions.svg
│   ├── os-history-timeline.svg
│   ├── os-kernel-user-mode.svg
│   ├── os-subsystems.svg
│   ├── page-replacement-algorithms.svg
│   ├── paging.svg
│   ├── pcb-structure.svg
│   ├── praxe-bg.jpg
│   ├── praxeS-bg.jpg
│   ├── prezentace-bg.jpg
│   ├── prezentaceS-bg.jpg
│   ├── process-states.svg
│   ├── process-tree.svg
│   ├── process-vs-thread.svg
│   ├── raid-comparison.svg
│   ├── raid-levels.svg
│   ├── rings.svg
│   ├── scheduling-criteria.svg
│   ├── scheduling-queues.svg
│   ├── segmentace.svg
│   ├── segmentation-table-details.svg
│   ├── semaphore-mutex.svg
│   ├── smp-numa-architecture.svg
│   ├── socket-communication.svg
│   ├── ssd-architecture.svg
│   ├── syscall-flow.svg
│   ├── system-call-interrupt.svg
│   ├── teorie-bg.jpg
│   ├── teorie-hardware-pamet.svg
│   ├── teorie-procesy-planovani.svg
│   ├── teorieS-bg.jpg
│   ├── teorie-soubory-rozhrani.svg
│   ├── teorie-uvod-architektura.svg
│   ├── thread-lifecycle.svg
│   ├── tlb-hardware.svg
│   ├── unix-evolution.svg
│   ├── virtual-memory-page-fault.svg
│   └── windows-driver-model.svg
├── js
│   └── ops-stats.js
├── maturita
│   ├── _not-found
│   │   ├── __next._full.txt
│   │   ├── __next._head.txt
│   │   ├── __next._index.txt
│   │   ├── __next._not-found.__PAGE__.txt
│   │   ├── __next._not-found.txt
│   │   └── __next._tree.txt
│   ├── __next.__PAGE__.txt
│   ├── __next._full.txt
│   ├── __next._head.txt
│   ├── __next._index.txt
│   ├── __next._tree.txt
│   ├── _not-found.html
│   ├── _not-found.txt
│   ├── 404.html
│   ├── barina_run.png
│   ├── icon.svg
│   ├── index.html
│   └── index.txt
├── mc
│   ├── v1_8
│   │   ├── lang
│   │   │   ├── af_ZA.lang
│   │   │   ├── ar_SA.lang
│   │   │   ├── ast_ES.lang
│   │   │   ├── az_AZ.lang
│   │   │   ├── bg_BG.lang
│   │   │   ├── ca_ES.lang
│   │   │   ├── cs_CZ.lang
│   │   │   ├── cy_GB.lang
│   │   │   ├── da_DK.lang
│   │   │   ├── de_DE.lang
│   │   │   ├── el_GR.lang
│   │   │   ├── en_AU.lang
│   │   │   ├── en_CA.lang
│   │   │   ├── en_GB.lang
│   │   │   ├── en_PT.lang
│   │   │   ├── eo_UY.lang
│   │   │   ├── es_AR.lang
│   │   │   ├── es_ES.lang
│   │   │   ├── es_MX.lang
│   │   │   ├── es_UY.lang
│   │   │   ├── es_VE.lang
│   │   │   ├── et_EE.lang
│   │   │   ├── eu_ES.lang
│   │   │   ├── fa_IR.lang
│   │   │   ├── fi_FI.lang
│   │   │   ├── fil_PH.lang
│   │   │   ├── fr_CA.lang
│   │   │   ├── fr_FR.lang
│   │   │   ├── ga_IE.lang
│   │   │   ├── gl_ES.lang
│   │   │   ├── gv_IM.lang
│   │   │   ├── he_IL.lang
│   │   │   ├── hi_IN.lang
│   │   │   ├── hr_HR.lang
│   │   │   ├── hu_HU.lang
│   │   │   ├── hy_AM.lang
│   │   │   ├── id_ID.lang
│   │   │   ├── is_IS.lang
│   │   │   ├── it_IT.lang
│   │   │   ├── ja_JP.lang
│   │   │   ├── ka_GE.lang
│   │   │   ├── ko_KR.lang
│   │   │   ├── kw_GB.lang
│   │   │   ├── la_LA.lang
│   │   │   ├── lb_LU.lang
│   │   │   ├── lt_LT.lang
│   │   │   ├── lv_LV.lang
│   │   │   ├── mi_NZ.lang
│   │   │   ├── ms_MY.lang
│   │   │   ├── mt_MT.lang
│   │   │   ├── nds_DE.lang
│   │   │   ├── nl_NL.lang
│   │   │   ├── nn_NO.lang
│   │   │   ├── no_NO.lang
│   │   │   ├── oc_FR.lang
│   │   │   ├── pl_PL.lang
│   │   │   ├── pt_BR.lang
│   │   │   ├── pt_PT.lang
│   │   │   ├── qya_AA.lang
│   │   │   ├── ro_RO.lang
│   │   │   ├── ru_RU.lang
│   │   │   ├── se_NO.lang
│   │   │   ├── sk_SK.lang
│   │   │   ├── sl_SI.lang
│   │   │   ├── sr_SP.lang
│   │   │   ├── sv_SE.lang
│   │   │   ├── th_TH.lang
│   │   │   ├── tlh_AA.lang
│   │   │   ├── tr_TR.lang
│   │   │   ├── uk_UA.lang
│   │   │   ├── val_ES.lang
│   │   │   ├── vi_VN.lang
│   │   │   ├── zh_CN.lang
│   │   │   └── zh_TW.lang
│   │   ├── .gitignore
│   │   ├── assets.epk
│   │   ├── classes.js
│   │   ├── classes.js.map
│   │   ├── favicon.png
│   │   ├── index.html
│   │   └── README.md
│   ├── assets.epw
│   ├── bootstrap.js
│   ├── classes.js
│   ├── classes.js.map
│   ├── favicon.png
│   ├── index.html
│   ├── juchelka_craft.png
│   └── README.md
├── md
│   ├── 01_Mass_Storage_Structure.md
│   ├── 01_Process_Concept.md
│   ├── 01_Sprava_pameti_uvod.md
│   ├── 01_Sprava_periferii_a_preruseni.md
│   ├── 01_STRUKTURA_OPERAČNÍCH_SYSTÉMŮ (1).md
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
├── praxe
│   ├── 00
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
│   ├── 01
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
│   ├── 02
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
│   ├── modules.js
│   └── modules.json
├── skripty
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
├── stratagem
│   ├── data
│   │   ├── Images
│   │   │   ├── Arrows
│   │   │   │   ├── D - Copy.png
│   │   │   │   ├── D.png
│   │   │   │   ├── L - Copy.png
│   │   │   │   ├── L.png
│   │   │   │   ├── R - Copy.png
│   │   │   │   ├── R.png
│   │   │   │   ├── U - Copy.png
│   │   │   │   └── U.png
│   │   │   ├── Stratagem Icons
│   │   │   │   └── hd2
│   │   │   │       ├── airburst_rocket_launcher.svg
│   │   │   │       ├── anti-materiel_rifle.svg
│   │   │   │       ├── anti-personnel_minefield.svg
│   │   │   │       ├── anti-tank_mines.svg
│   │   │   │       ├── arc_thrower.svg
│   │   │   │       ├── autocannon.svg
│   │   │   │       ├── autocannon_sentry.svg
│   │   │   │       ├── ballistic_shield_backpack.svg
│   │   │   │       ├── commando.svg
│   │   │   │       ├── dark_fluid_vessel.svg
│   │   │   │       ├── eagle_110mm_rocket_pods.svg
│   │   │   │       ├── eagle_500kg_bomb.svg
│   │   │   │       ├── eagle_airstrike.svg
│   │   │   │       ├── eagle_cluster_bomb.svg
│   │   │   │       ├── eagle_napalm_airstrike.svg
│   │   │   │       ├── eagle_rearm.svg
│   │   │   │       ├── eagle_smoke_strike.svg
│   │   │   │       ├── eagle_strafing_run.svg
│   │   │   │       ├── emancipator_exosuit.svg
│   │   │   │       ├── ems_mortar_sentry.svg
│   │   │   │       ├── expendable_anti-tank.svg
│   │   │   │       ├── flamethrower.svg
│   │   │   │       ├── gatling_sentry.svg
│   │   │   │       ├── grenade_launcher.svg
│   │   │   │       ├── guard_dog.svg
│   │   │   │       ├── guard_dog_rover.svg
│   │   │   │       ├── heavy_machine_gun.svg
│   │   │   │       ├── hellbomb.svg
│   │   │   │       ├── hive_breaker_drill.svg
│   │   │   │       ├── hmg_emplacement.svg
│   │   │   │       ├── incendiary_mines.svg
│   │   │   │       ├── jump_pack.svg
│   │   │   │       ├── laser_cannon.svg
│   │   │   │       ├── machine_gun.svg
│   │   │   │       ├── machine_gun_sentry.svg
│   │   │   │       ├── mortar_sentry.svg
│   │   │   │       ├── orbital_120mm_he_barrage.svg
│   │   │   │       ├── orbital_380mm_he_barrage.svg
│   │   │   │       ├── orbital_airburst_strike.svg
│   │   │   │       ├── orbital_ems_strike.svg
│   │   │   │       ├── orbital_gas_strike.svg
│   │   │   │       ├── orbital_gatling_barrage.svg
│   │   │   │       ├── orbital_illumination_flare.svg
│   │   │   │       ├── orbital_laser.svg
│   │   │   │       ├── orbital_precision_strike.svg
│   │   │   │       ├── orbital_railcannon_strike.svg
│   │   │   │       ├── orbital_smoke_strike.svg
│   │   │   │       ├── orbital_walking_barrage.svg
│   │   │   │       ├── patriot_exosuit.svg
│   │   │   │       ├── prospecting_drill.svg
│   │   │   │       ├── quasar_cannon.svg
│   │   │   │       ├── railgun.svg
│   │   │   │       ├── recoilless_rifle.svg
│   │   │   │       ├── reinforce.svg
│   │   │   │       ├── resupply.svg
│   │   │   │       ├── rocket_sentry.svg
│   │   │   │       ├── seaf_artillery.svg
│   │   │   │       ├── seismic_probe.svg
│   │   │   │       ├── shield_generator_pack.svg
│   │   │   │       ├── shield_generator_relay.svg
│   │   │   │       ├── sos_beacon.svg
│   │   │   │       ├── spear.svg
│   │   │   │       ├── stalwart.svg
│   │   │   │       ├── super_earth_flag.svg
│   │   │   │       ├── supply_pack.svg
│   │   │   │       ├── tectonic_drill.svg
│   │   │   │       ├── tesla_tower.svg
│   │   │   │       └── upload_data.svg
│   │   │   ├── heroJ.png
│   │   │   ├── juchelka.png
│   │   │   └── tml.jpg
│   │   ├── Sounds
│   │   │   ├── 1_D.mp3
│   │   │   ├── 2_L.mp3
│   │   │   ├── 3_R.mp3
│   │   │   ├── 4_U.mp3
│   │   │   ├── GameOver1.mp3
│   │   │   └── GameOver2.mp3
│   │   └── HD2-Sequences.json
│   ├── .gitignore
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
├── strom.txt
├── style.css
└── teorie.html
