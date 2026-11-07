# 🤖 DOKUMENTACE PRO AI – WELL_OPS PORTÁL

> **ZÁVAZNÝ METADOKUMENT A ARCHITEKTONICKÝ PRŮVODCE PRO VŠECHNA AI**  
> Tento dokument je centrálním zdrojem pravdy pro libovolného AI asistenta (Claude, Gemini, GPT, Cursor, Copilot atd.), který pracuje v tomto repozitáři.  
> Před prováděním jakýchkoliv změn v kódu, generováním souborů nebo úpravami konfigurace je **povinností každého AI** se tímto dokumentem řídit.

---

## ⚠️ PRAVIDLO #0: Zlaté pravidlo bezpečnosti a komunikace

> [!CAUTION]
> **POKUD SI NĚČÍM NEJSI 100% JISTÝ, ZASTAV SE A ZEPTEJ SE UŽIVATELE!**  
> Nikdy nedomýšlej chybějící specifikace, nedělej svévolné předpoklady (assumptions) a neprováděj nechtěný refactoring, který by mohl cokoliv rozbít nebo „doserat“.  
> Lepší je položit jednu cílenou otázku než poškodit funkční infrastrukturu, přepsat ověřená data nebo rozbít klientské skripty studentů.

### Základní operační zásady pro AI:
1. **Nevymýšlej si:** Pokud neznáš přesný název VM, IP rozsah, parametry úkolu nebo chování endpointu, prozkoumej kód nebo se zeptej.
2. **Zachovej funkční věci netknuté:** Neupravuj soubory, které nesouvisejí se zadaným úkolem. Respektuj stávající kódovací styl.
3. **Nepřidávej zbytečný balast:** Nevytvářej nové nesouvisející `.md` soubory na náhodných místech.
4. **Čti skilly dřív, než začneš jednat:** Pro konkrétní typy úkolů (PowerShell, tvorba modulu, frontend, bezpečnost) má projekt dedikované specializované skilly v `.agents/skills/`. Přečtení příslušného skillu a dodržení jeho pravidel je **povinné**.

---

## 🗺️ 1. Architektonická mapa repozitáře (Kde co fyzicky je vs. URL)

Projekt je dynamický webový portál primárně zaměřený na výuku **Operačních systémů (OPS)**, **Počítačových sítí (POS)**, **Kyberbezpečnosti**, **Mikroprocesorové techniky (MIT)**, **Programování (PRG)** a dalších předmětů SPŠSE, doplněný o interaktivní laboratorní cvičení, automatizační skripty, Discord bota a herní koutek.

### 🌐 Vercel Routing & URL vs. Fyzická struktura (`vercel.json`)
Web je nasazen na Vercelu (`kokot.fit`, `ops.peakdle.site`). V souboru `vercel.json` jsou definovány klíčové přepisy (rewrites), které musí každé AI znát:

| Veřejná URL v prohlížeči | Fyzická cesta na disku | Účel |
|---|---|---|
| `/` | `index.html` | Hlavní rozcestník portálu a dashboard předmětů |
| `/praxe.html` | `ops/praxe.html` | Centrální interaktivní aplikace pro praktická cvičení OPS |
| `/praxe/(.*)` | `ops/praxe/$1` | Moduly, zadání, řešení, checklisty a data modulů |
| `/teorie.html` | `ops/teorie.html` | Teoretické studijní materiály pro OPS |
| `/statistika.html` | `ops/statistika.html` | Statistiky webu a modulů |
| `/md/(.*)` | `ops/md/$1` | Zdrojové markdown soubory teorie OPS |
| `/kasino` a `/kasino/(.*)` | `hry/kasino/index.html` / `hry/kasino/$1` | Kasíno sekce (ruleta, sloty, blackjack, gacha) |
| `/gd` a `/gd/(.*)` | `hry/gd/index.html` / `hry/gd/$1` | Juchelka Dash (Geometry Dash) |
| `/stratagem` a `/stratagem/(.*)` | `hry/stratagem/index.html` / `...` | Helldivers 2 Stratagem trenažér |
| `/mc` a `/mc/(.*)` | `hry/mc/index.html` / `...` | In-browser Minecraft (JuchelkaCraft) |
| `/hyperdrive` | `hry/hyperdrive/index.html` | 3D závodní hra (Race with Kokeš) |
| `/clicker` | `hry/clicker/index.html` | Maturita clicker |
| `/maturita` | `hry/maturita/index.html` | Run From Maturita hra |
| `/api/submit-doc` | `api/submit-doc.js` | Serverless proxy pro odesílání školní dokumentace na Discord |

> [!IMPORTANT]
> **Build Command na Vercelu:** `node pos/md-index.js`  
> Tento skript při každém sestavení zindexuje všechny markdowny v `pos/md/` a uloží seznam do `pos/md/index.json`.

---

## 📂 2. Detailní rozpad jednotlivých subsystémů

```text
well_ops/
├── .agents/                 # AI Skills & specializovaná pravidla (POVINNÉ PRO AI)
│   └── skills/              # lab_gen, powershell-windows, design-taste-frontend, ...
├── .github/                 # GitHub Actions (notifikace nových modulů, deploy)
├── api/                     # Vercel serverless funkce (submit-doc.js)
├── cestina/                 # Předmět Čeština (teorie.html, stranky.html)
├── discord-bot/             # Discord bot pro oznámení a generování dokumentace
├── hry/                     # Všechny hry a kasíno (kasino, gd, mc, hyperdrive, clicker...)
├── img/                     # Obrázky, ikony, SVG diagramy k teorii i praxi
├── js/                      # Sdílené JavaScriptové utility a snippet AI bota
├── kyber/                   # Předmět Kyberbezpečnost (materiály Juchelka & Otahalík)
├── mit/                     # Předmět Mikroprocesorová technika (mikroprocesory.html)
├── office/                  # Předmět OFFC (Word, PowerPoint, Excel)
├── ops/                     # JÁDRO PROJEKTU – Operační systémy (teorie, praxe, md)
│   ├── md/                  # 30+ markdownů s kapitolami teorie OS
│   ├── praxe/               # Složky modulů (00, 01, 02, 03...), modules.js, modules.json
│   ├── praxe.html           # Interaktivní laboratorní portál OPS
│   ├── statistika.html      # Statistika webu
│   └── teorie.html          # Prohlížeč teorie OS
├── pos/                     # Předmět Počítačové sítě (CCNA moduly, md-index.js)
├── prg/                     # Předmět Programování (programovani.html a data)
├── skripty/                 # Ověřovací (.ps1/.bat) a dokumentační skripty pro VM
├── zapisnik/                # Centrální klientský engine pro řešení otázek a úloh
├── index.html               # Hlavní rozcestník celého portálu
├── lab_gen.md               # Standard generování OPS modulů
├── style.css                # Globální styly
├── vercel.json              # Konfigurace routování a build procesů
└── zarizeni.js              # Autorizace klientských zařízení pro Zápisník
```

### 1. OPS Ekosystém (`ops/` a `skripty/`)
- **`ops/praxe.html`**: SPA aplikace v čistém JS. Podle parametru `?modul=XX` načítá úkoly z `ops/praxe/XX/tasks.js`, stav ověření z `ops/praxe/XX/verified.json`, zadání a řešení do iframe/záložek.
- **`ops/praxe/modules.js` & `modules.json`**: Centrální registr všech modulů (`window.OPS_MODULES` a `window.OPS_MODULE_VERIFIED`). Každý modul zde musí být zaregistrován!
- **`ops/praxe/XX/`**: Adresář konkrétního cvičení (např. `ops/praxe/02/`):
  - `__zadani.md` a `_zadani.md` – textová zadání.
  - `__zadani.html` a `_zadani.html` – stylované verze zadání.
  - `_vysledek.md`, `__reseni.md`, `_reseni.md` – kontrolní seznam bod po bodu.
  - `__reseni.html`, `_reseni.html`, `_vysledek.html` – stylované verze vzorových řešení.
  - `verified.json` – stav ověření jednotlivých VM (`true`/`false`). Ve výchozím stavu `false`.
  - `tasks.js` – definice interaktivních kroků (`window.OPS_MODULE_TASKS["XX"]`).
  - `doc_templates/` – šablony `overeni.md` a `postup.md` pro odevzdání.
- **`skripty/`**:
  - `XX_check_<VM>.bat` a `.ps1` – interaktivní ověřovací skripty spouštěné studenty v labu. Jsou **striktně READ-ONLY** (pouze čtou stav, nikdy nic nemění).
  - `XX_doc_<VM>.bat` a `.ps1` – skripty, které provedou příkazy z labu, nasbírají konzolové výstupy a odešlou je na Vercel endpoint / Discord webhook.

### 2. Školní předměty a modul Zápisník (`zapisnik/`)
- Předměty `kyber`, `mit` a `prg` využívají jednotný engine **Zápisník**:
  - `zapisnik/zapisnik.js` a `zapisnik/zapisnik.css`.
  - Data jsou načítána z `*-data.js` v jednotlivých složkách (např. `kyber/juchelka-data.js`).
  - **Autorizace zařízení (`zarizeni.js`):** Zařízení se identifikují pomocí unikátního ID (`ZAP-XXXXXX`). Pokud ID není v poli `window.POVOLENA_ZARIZENI`, stránka funguje pouze v režimu čtení.

### 3. Discord Bot & API (`discord-bot/` & `api/`)
- **`discord-bot/`**: Samostatná Node.js aplikace zajišťující:
  - Slash příkazy `/novy-modul`, `/update`, `/moje-id`, `/posledni-dokumentace`.
  - Příjem dat ze serveru (SRV1-DC) a stanice (PC1-WIN), jejich automatické spárování podle Discord ID studenta, vyplnění šablon `postup.md` + `overeni.md` a odeslání hotového `.zip` archivu studentovi do DM i na kanál.
  - **POVINNÉ UPOZORNĚNÍ PRO UŽIVATELE:** Kdykoliv AI vytvoří nebo upraví šablony v `discord-bot/templates/XX/`, **MUSÍ uživateli na konci odpovědi VŽDY výslovně připomenout**, že je nutné zkopírovat tyto šablony do běžícího Docker kontejneru bota:
    `docker cp templates/XX ops-discord-bot:/app/templates/` (případně `docker cp discord-bot/templates/XX ops-discord-bot:/app/templates/`).
- **`api/submit-doc.js`**: Vercel Serverless Function chránící webhook URL bota. Skripty ve VM odesílají data na tuto proxy (`https://ops.peakdle.site/api/submit-doc`), která je přeposílá na Discord Webhook.

---

## 🛠️ 3. Katalog AI Skillů – K čemu slouží a kdy je MUSÍŠ použít

V repozitáři se v adresáři `.agents/skills/` nachází sada specializovaných instrukcí a pravidel.  
Každé AI je **povinno** si před zahájením příslušné práce daný skill načíst a do detailu se jím řídit!

```text
.agents/skills/
├── lab_gen/                                          # Tvorba cvičení do OPS
├── powershell-windows/                               # Pravidla a úskalí Windows PowerShellu
├── powershell-master/                                # Multiplatformní PowerShell standardy
├── windows-hardening/                                # Zabezpečení Windows Serveru
├── hardening-windows-endpoint-with-cis-benchmark/    # CIS benchmarky pro Windows stanice
├── sysadmin-toolbox/                                 # Sysadmin one-linery a diagnostika
└── design-taste-frontend/                            # Anti-slop frontend designový standard
```

### 1. Skill `lab_gen` (`.agents/skills/lab_gen/SKILL.md` + `lab_gen.md`)
- **K čemu slouží:** Kompletní standard a metodika tvorby nového praktického cvičení (Moduly 00, 01, 02, 03, 04...).
- **Kdy ho AI MUSÍ použít:** Jakmile uživatel požádá o vytvoření, doplnění nebo úpravu praktického cvičení (např. *„Vytvoř Modul 04“*, *„Uprav úlohy v modulu 02“* apod.).
- **Závazná pravidla:**
  - AI musí vytvořit všech 7 povinných součástí (složku `ops/praxe/XX/`, obousměrná zrcadla souborů `__zadani.*`, `_reseni.*`, výchozí `verified.json` s `false`, definici `tasks.js`, registraci v `modules.js` a `modules.json`, vložení script tagu do `ops/praxe.html`, a vytvoření `skripty/XX_check_*` i `skripty/XX_doc_*`).
  - Webové stránky zadání a řešení musí mít jednotný OPS motiv (`#1a1a1a`), akcent `--accent: #ff5555`, breadcrumbs a povinný favicon `<link rel="icon" type="image/x-icon" href="../../img/bird.png">`.

### 2. Skill `powershell-windows` (`.agents/skills/powershell-windows/SKILL.md`)
- **K čemu slouží:** Zásadní syntaktická pravidla, operátory a pasti specifické pro Windows PowerShell 5.1 / 7 na stanicích a serverech.
- **Kdy ho AI MUSÍ použít:** Kdykoliv AI píše, refaktoruje nebo kontroluje skripty `.ps1` nebo `.bat` určené pro Windows.
- **Kritická pravidla:**
  - **POVINNÉ ZÁVORKY:** Při použití logických operátorů `-and` / `-or` MUSÍ být každé volání cmdletu v samostatných závorkách:  
    `if ((Test-Path $a) -or (Test-Path $b)) { ... }` (nikdy bez závorek, jinak PowerShell selže!).
  - **STRIKTNÍ ZÁKAZ UNICODE A EMOJI:** V PowerShell a BAT skriptech se **NESMÍ používat ŽÁDNÉ emoji ani speciální UTF symboly** (jako ✅, ❌, ⚠️, ⏳). Starší konzole Windows PowerShell 5.1 je zkomolí na paznaky. Používej **výhradně ASCII značky:** `[OK]`, `[CHYBA]`, `[!]`, `[WARN]`, `[INFO]`, `[...]`.
  - **OŠETŘENÍ NULL:** Před přístupem k vlastnostem objektů a polí vždy zkontroluj existenci: `if ($array -and $array.Count -gt 0)`.
  - **CESTY:** Pro spojování cest vždy používej `Join-Path`, nespoléhej na manuální lomítka.

### 3. Skill `powershell-master` (`.agents/skills/powershell-master/SKILL.md`)
- **K čemu slouží:** Pokročilá PowerShell architektura, CI/CD pipeline, práce s moduly a bezpečnostní standardy.
- **Kdy ho AI MUSÍ použít:** Při návrhu složitějších automatizací, GitHub Actions workflows, komunikaci přes REST API a bezpečnostních skriptech.
- **Klíčová pravidla:**
  - Zpětná lomítka (`\`) pro cesty v prostředí Windows.
  - **Pravidlo čistoty repozitáře:** Nikdy nevytvářet nové dokumentační soubory, pokud to uživatel výslovně nepožaduje.

### 4. Skill `windows-hardening` (`.agents/skills/windows-hardening/SKILL.md`)
- **K čemu slouží:** Zabezpečení Windows Serverů podle oficiálních Microsoft Security Baselines a CIS benchmarků.
- **Kdy ho AI MUSÍ použít:** Při návrhu úloh zaměřených na bezpečnost Active Directory, politiky hesel, zamykání účtů, firewall, auditing a Group Policy na serverech (`SRV1-DC`, `SRV2-FS`).

### 5. Skill `hardening-windows-endpoint-with-cis-benchmark` (`.agents/skills/hardening-windows-endpoint-with-cis-benchmark/SKILL.md`)
- **K čemu slouží:** Zabezpečení klientských koncových stanic Windows 10/11 dle profilů CIS Level 1 a Level 2.
- **Kdy ho AI MUSÍ použít:** Při tvorbě úloh pro klientskou stanici (`PC1-WIN`), auditování stanic proti bezpečnostním standardům nebo tvorbě kontrolních skriptů pro klientský OS.

### 6. Skill `sysadmin-toolbox` (`.agents/skills/sysadmin-toolbox/SKILL.md`)
- **K čemu slouží:** Rozsáhlá znalostní báze one-linerů, síťových diagnostických nástrojů, práce se socketem, DNS, certifikáty, procesy a disky.
- **Kdy ho AI MUSÍ použít:** Když je potřeba vymyslet efektivní jednořádkový příkaz pro testování sítě (`Test-NetConnection`, `Resolve-DnsName`, `curl.exe`), analýzu logů či diagnostiku procesů v labu.

### 7. Skill `design-taste-frontend` (`.agents/skills/design-taste-frontend/SKILL.md`)
- **K čemu slouží:** Anti-slop frontendová směrnice zabraňující tvorbě generického, šablonovitého „AI vzhledu“.
- **Kdy ho AI MUSÍ použít:** Při tvorbě jakýchkoliv nových HTML stránek, komponent, stylů nebo úpravách layoutu portálu.
- **Závazná estetická pravidla:**
  - **Žádný generický AI balast:** Žádné bezúčelné gradienty přes celý text, žádné vybledlé ikony v tónovaných pastelových zaoblených čtverečcích, žádné falešné marketingové kartičky.
  - **Respekt k designovému jazyku OPS:**  
    Pozadí: tmavé `#111113` / `#1a1a1a`  
    Karty/Povrchy: `#19191c` / `#242424`  
    Ohraničení: jemné `rgba(255,255,255,.08)`  
    Akcent: sytá červená `#ef4444` / `#ff5555`  
    Typografie: Inter / Segoe UI, čistá hierarchie.
  - **UI Ikony:** Používej čisté inline SVG ikony (stroke 1.9–2.2px, viewBox 0 0 24 24), **nikdy nevkládej emoji přímo do tlačítek, tabulek a navigačních lišt**.

---

## 🛑 4. Nepřekročitelná pravidla a Anti-patterns (Čeho se vyvarovat)

| ❌ PŘÍSNĚ ZAKÁZÁNO | ✅ SPRÁVNÝ POSTUP |
|---|---|
| Měnit konfiguraci systému v kontrolních `XX_check_*.ps1` skriptech | Kontrolní skripty jsou **striktně READ-ONLY** (pouze `Get-*`, `Test-*`, audit stavu) |
| Používat emoji v PowerShell a BAT skriptech (`✅`, `❌`, `⚠️`) | Používat **výhradně ASCII** značení: `[ OK ]`, `[CHYBA]`, `[KONTROLA]`, `[WARN]` |
| Používat složené logické výrazy bez závorek: `if (Test-Path a -or Test-Path b)` | Vždy uzavírat volání do závorek: `if ((Test-Path a) -or (Test-Path b))` |
| Používat u `curl.exe` parametr `-w "%{http_code}"` (způsobí chybu 43) | Používat `curl.exe -i -s -k` s regex parsováním HTTP kódu a .NET `HttpClient` fallbackem |
| Poškodit hybridní BAT hlavičku nebo nechat visící `&` | Vždy dodržet přesný formát: `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH \| Select-Object -Skip 5 \| Out-String)); & $script %*"` |
| Upravovat `docker-compose.yml` bota (přidávat volumes) | `docker-compose.yml` neměnit, šablony a `index.js` kopírovat ručně přes `docker cp` a kontejner restartovat |
| Vytvořit nový modul a nastavit mu ve `verified.json` hodnotu `true` | Nový modul má ve `verified.json` **vždy `false`**, dokud ho uživatel fyzicky neotestuje v reálném labu |
| Dělat neohlášené změny v cizích souborech nebo odstraňovat komentáře | Provádět pouze explicitně vyžádané úpravy a zachovávat stávající kód |
| Hádat nebo předpokládat, jak mají věci fungovat, když chybí zadání | **Zastavit se a položit uživateli dotaz (Pravidlo #0)** |

---

## 🏁 5. Rychlý checklist pro AI před dokončením jakéhokoliv úkolu

Předtím, než oznámíš uživateli, že je úkol hotov, ověř:
1. [ ] **Nerozbil jsem stávající kód?** (Nenarušil jsem syntaxi v JS, HTML nebo PowerShellu?)
2. [ ] **Použil jsem správné cesty?** (Fyzická struktura repozitáře vs. Vercel rewrites z `vercel.json`.)
3. [ ] **Dodržel jsem pravidla příslušného skillu?** (Přečetl jsem si SKILL.md a splnil jeho standardy?)
4. [ ] **Neobsahuje kód pro Windows žádné emoji?** (Pouze čisté ASCII výpisy.)
5. [ ] **Je v UI zachován tmavý styl portálu a čisté SVG ikony?**
6. [ ] **Pokud si v čemkoliv nejsem 100% jistý, zeptal jsem se uživatele?**
