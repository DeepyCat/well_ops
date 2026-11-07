---
name: lab_gen
description: Komplexní návod a metodika pro AI asistenty, jak na základě podkladů (__zadani.md, _vysledek.md) vygenerovat a plně integrovat nové praktické cvičení (Modul 02, 03...) do dynamického portálu OPS.
---

#  Metodika generování a integrace praktických cvičení (LAB GEN)

Tento dokument slouží jako **komplexní a závazný standard pro libovolné AI**, které má za úkol vytvořit, zpracovat nebo integrovat další lekci/cvičení (např. `Modul 02: DHCP`, `Modul 03: DNS`...) v rámci praktické části projektu **OPS (Operační systémy / sítě)**.

---

##  Architektura a princip fungování webu

Aplikace běží jako **dynamický webový portál** s centrální stránkou [praxe.html](file:///D:/%21Documents/VSCode/well_ops/praxe.html):
1. **Přepínač zadání (Module Switcher):** Vlevo nahoře v hlavičce umožňuje studentům přepínat mezi jednotlivými moduly. Výběr se promítá do URL (`praxe.html?modul=02`).
2. **Dynamická data modulů:** Každé cvičení má vlastní složku v `praxe/XX/` (např. `praxe/02/`) obsahující definici úkolů `tasks.js`, stav ověření `verified.json`, formátované zadání a vzorové řešení.
3. **Centrální registr:** Všechny moduly jsou registrovány v `praxe/modules.js` a `praxe/modules.json`.
4. **Per-VM ověření (`verified.json`):** Každý modul má svůj soubor `verified.json`, kde je pro každý server hodnota `true` / `false`. Pokud je `true`, na webu se zobrazí zelený štítek **„Ověřeno OK“** a zelený banner. Pokud je `false`, štítek a banner se nezobrazují.

---

##  Co VŠE musí AI vytvořit při požadavku „Zpracuj X. zadání (Modul XX)“

Při zpracování nového modulu (např. `02`) AI **VŽDY** provede následující kroky v tomto pořadí:

### Krok 1: Vytvoření složky `praxe/XX/` a souborů zadání
Vytvořte složku `praxe/XX/` (např. `praxe/02/`) a v ní:
1. `__zadani.md` a jeho identické zrcadlo `_zadani.md` (Markdown zadání s kontextem, tabulkami parametrů a cílovým stavem).
2. `__zadani.html` a `_zadani.html` (plnohodnotná, stylová HTML stránka sladěná s jednotným OPS tmavým tématem `#1a1a1a`, červenými tlačítky `--accent: #ff5555`, breadcrumbs, tlačítky pro kopírování kódů, SVG ikonami bez emoji a povinným faviconem `<link rel="icon" type="image/x-icon" href="../../img/bird.png">`).
3. `_vysledek.md` a jeho identická zrcadla `__reseni.md` a `_reseni.md` (kontrolní seznam bod po bodu: jak se pozná, že je úkol splněný, s přesnými PowerShell testy a očekávanými výstupy).
4. `__reseni.html`, `_reseni.html` a `_vysledek.html` (plnohodnotná HTML stránka vzorového řešení v jednotném OPS tématu s červenými tlačítky a povinným faviconem `<link rel="icon" type="image/x-icon" href="../../img/bird.png">`).

### Krok 2: Vytvoření konfiguračního souboru `verified.json`
Vytvořte `praxe/XX/verified.json`. **Ve výchozím stavu nastavte pro nově vytvořený modul všechny stroje na `false`** (protože ještě nebyly v reálném labu fyzicky otestovány):
```json
{
  "SRV1-DC": false,
  "SRV2-FS": false,
  "PC1-WIN": false
}
```
*(Pokud modul obsahuje jen např. `SRV1-DC` a `PC1-WIN`, uveďte pouze relevantní stroje).*

### Krok 3: Vytvoření definičního souboru úkolů `praxe/XX/tasks.js`
Vytvořte skript `praxe/XX/tasks.js`, který zaregistruje úkoly do globálního objektu `window.OPS_MODULE_TASKS["XX"]`:
```javascript
/**
 * Modul XX: Název modulu
 * Definice úkolů pro interaktivní checklist v praxe.html
 */
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};

window.OPS_MODULE_TASKS["XX"] = [
  {
    id: "unikatni-kebab-case-id",
    title: "1. Název úkolu",
    forVMs: ["SRV1-DC", "PC1-WIN"], // Kterých strojů se krok týká
    
    // 1. Kontext / cíl úkolu (přijímá vm a číslo pracoviště wsX)
    what: (vm, wsX) => {
      const x = wsX || 2;
      return `Popis úkolu s dynamickou IP 192.168.${x}.10...`;
    },

    // 2. Příkaz k provedení (přijímá vm a wsX)
    // Komentáře začínající na # jsou povoleny (kopírovací tlačítko je automaticky vyfiltruje)
    how: (vm, wsX) => {
      const x = wsX || 2;
      return `# 1. Instalace role:\nInstall-WindowsFeature -Name DHCP -IncludeManagementTools`;
    },

    // 3. Testovací příkaz pro kontrolu (PowerShell)
    verify: (vm, wsX) => {
      return `Get-Service -Name DHCPServer | Select-Object Status, StartType`;
    },

    // 4. Přesný očekávaný výstup konzole
    expected: (vm, wsX) => {
      return `Status  StartType\n------  ---------\nRunning Automatic`;
    }
  }
];
```

### Krok 4: Registrace modulu v `praxe/modules.js` a `praxe/modules.json`
Přidejte nový modul do pole `window.OPS_MODULES` v `praxe/modules.js`:
```javascript
  {
    id: "XX",
    code: "MXX",
    title: "Modul XX: Název modulu",
    shortTitle: "Modul XX",
    folder: "praxe/XX",
    vms: ["SRV1-DC", "SRV2-FS", "PC1-WIN"],
    defaultVM: "SRV1-DC",
    tasksFile: "praxe/XX/tasks.js",
    verifiedFile: "praxe/XX/verified.json"
  }
```
A do `window.OPS_MODULE_VERIFIED["XX"]`:
```javascript
  "XX": {
    "SRV1-DC": false,
    "SRV2-FS": false,
    "PC1-WIN": false
  }
```
Stejný JSON objekt doplňte do `praxe/modules.json`.

### Krok 5: Přidání skriptu do `praxe.html`
V souboru [praxe.html](file:///D:/%21Documents/VSCode/well_ops/praxe.html) přidejte do hlavičky `<head>` tag pro načtení úkolů:
```html
<script src="praxe/XX/tasks.js"></script>
```

### Krok 6: Vytvoření interaktivních ověřovacích skriptů v `skripty/` (POVINNÉ PRO KAŽDÝ STROJ)
Pro každé zařízení (VM) definované v modulu vytvořte v kořenové složce `skripty/` dvojici interaktivních ověřovacích skriptů:
- Formát názvů: `skripty/XX_check_<VM>.ps1` a `skripty/XX_check_<VM>.bat` (např. `skripty/01_check_SRV1-DC.bat`, `skripty/02_check_PC1-WIN.bat`).
- Skript je **striktně READ-ONLY**: provádí pouze audit a čtení stavu (`Get-*`, `Test-*`, `Resolve-DnsName`), nikdy žádná systémová nastavení nemění ani nepřepisuje.
- Skript je interaktivní: vyzve uživatele k zadání čísla pracoviště `X` (výchozí 2, s autodetekcí z IP adresy `Ethernet1`), prověří veškerou konfiguraci daného modulu pro daný stroj, vypíše přehledné barevné stavy ve třech úrovních:
  - Zeleně `[ OK ]`: úspěšně zkontrolované parametry.
  - Žlutě `[KONTROLA]`: položky vyžadující manuální vizuální kontrolu (např. hesla, shoda příjmení v názvu).
  - Červeně `[CHYBA]`: neshody s konkrétní nápovědou pro opravu.
- Skript je neperzistentní (efemérní): `.bat` soubor po sobě uklidí (`(goto) 2>nul & del "%~f0"`).
- V `tasks.js` zařaďte na konec kontrolního seznamu každého stroje nepovinný krok:
  `title: "X. (Nepovinné) Rychlé ověření stroje <VM>"` (resp. `celého stroje`)
  obsahující univerzální jednořádkový příkaz pro stažení a spuštění přes curl (spustitelný v PowerShellu, CMD i Terminálu, s vizuálním průběhem stahování a automatickým úklidem):
  `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/XX_check_<VM>.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`

### Krok 7: Skripty pro automatické vyplnění dokumentace a doručení přes Discord
Pro každý modul vytvořte skripty pro automatické vyplnění dokumentace ze všech relevantních VM:
- Formát názvů: `skripty/XX_doc_<VM>.ps1` a `skripty/XX_doc_<VM>.bat` (např. `03_doc_SRV1-DC.bat`, `03_doc_PC1-WIN.bat`).
- **Nezávislost na Gitu:** Skript neklonuje repozitáře přes Git; vytváří lokální složku `Documents\Moje dokumentace\Modul XX ...` a pracuje s lokálními šablonami.
- **Interaktivní dotazy na začátku:**
  - Jméno a příjmení studenta (s výchozím návrhem).
  - Třída (výchozí `T3A` – potvrzení klávesou Enter).
  - Datum vypracování (výchozí dnešní datum – potvrzení Enter).
  - Číslo pracoviště `X` (autodetekce z IP adresy rozhraní `Ethernet1`, např. 2).
  - Doména (autodetekce z AD nebo DNS suffixu).
  - Discord uživatelské jméno (např. `jannovak` pro spárování částí a doručení do DM).
- **Živý výpis s PowerShell promptem:** Skript vypisuje kroky postupně (`Start-Sleep`) s barevnými stavy `[ OK ]` a `[ RUČNÍ ]` (pro screenshoty) a do markdownu vkládá výstupy i s promptem `PS C:\Users\Administrator> ...`.
- **Odeslání na Discord Webhook:** Skript zabalí data do JSONu a přes vestavěný `curl.exe` je odešle na nastavený Discord Webhook.
- **Discord Bot spojení:** Bot v `discord-bot/index.js` zachytí obě části, pinguje studenta (@mention), po obdržení všech částí odešle mezizprávu o generování, data spojí do `overeni.md` a `postup.md`, zabalí výhradně do ZIP archivu (bez samostatných .md souborů), upozorní na ruční screenshoty (např. bod `M3-SRV1.V1-D2` pro DNS Manager) a doručí studentovi do soukromé zprávy (DM) i do kanálu.
- **Konfigurace v `praxe/modules.js` a `praxe/modules.json`:** Každý modul s dokumentací musí obsahovat pole `docWorkflow` s kroky pro spuštění na SRV1 a PC1.
- **Šablony:** Čisté šablony dokumentace uložit do `praxe/XX/doc_templates/` a do `discord-bot/templates/XX/`.
- **POVINNÉ UPOZORNĚNÍ PRO UŽIVATELE (Kopírování šablon do Docker kontejneru bota):** Kdykoliv AI vytvoří nebo upraví šablony dokumentace v `discord-bot/templates/XX/`, **MUSÍ uživateli na konci odpovědi VŽDY výslovně připomenout**, že je nutné zkopírovat tyto šablony do běžícího Docker kontejneru bota:
  ```bash
  docker cp templates/XX ops-discord-bot:/app/templates/
  ```
  *(resp. `docker cp discord-bot/templates/XX ops-discord-bot:/app/templates/` z kořene repozitáře).*

### Krok 8: Pravidla pro práci podle počtu zapojených strojů (1 VM vs 2 VM vs 3 VM)

Každý modul má specifický počet zapojených strojů (definovaný v poli `vms` v `modules.js`). AI asistent **nesmí natvrdo předpokládat 2 stroje**, ale musí celou infrastrukturu přizpůsobit:

#### Varianta A: Modul s 1 strojem (např. pouze `SRV1-DC`)
- **Příklady:** Modul 01 (Active Directory Domain Services), instalace lokálních serverových rolí.
- **Konfigurace v `modules.js` a `modules.json`:** `vms: ["SRV1-DC"]`, `defaultVM: "SRV1-DC"`.
- **Stav ověření `verified.json`:** Obsahuje pouze klíč `{"SRV1-DC": false}`.
- **Úkoly v `tasks.js`:** Všechny úkoly mají `forVMs: ["SRV1-DC"]`. Tabulka parametrů v `what` uvádí parametry pouze pro tento stroj.
- **Skripty v `skripty/`:**
  - Vzniká pouze 1 ověřovací skript: `XX_check_SRV1-DC.bat` (+ `.ps1`).
  - Vzniká pouze 1 dokumentační skript: `XX_doc_SRV1-DC.bat` (+ `.ps1`).
- **Workflow dokumentace (`docWorkflow`):**
  - Obsahuje pouze **1 krok**: `Krok 1/1: Otevři SRV1-DC`.
- **Discord Bot (`discord-bot`):**
  - V `MODULE_CONFIG` má nastaveno `requiredParts: ['SRV1']`.
  - Po obdržení této jediné části bot okamžitě generuje a odesílá hotový ZIP (žádné mezikroky ani čekání na další stroje).

#### Varianta B: Modul se 2 stroji (např. `SRV1-DC` a `PC1-WIN`)
- **Příklady:** Modul 02 (DHCP Server a Klient), Modul 03 (DNS Server a Klient).
- **Konfigurace v `modules.js` a `modules.json`:** `vms: ["SRV1-DC", "PC1-WIN"]`.
- **Stav ověření `verified.json`:** `{"SRV1-DC": false, "PC1-WIN": false}`.
- **Úkoly v `tasks.js`:** Rozděleny na serverové (`forVMs: ["SRV1-DC"]`) a klientské (`forVMs: ["PC1-WIN"]`). Tabulka parametrů v `what` má 2 sloupce (`SRV1-DC`, `PC1-WIN`) a zvýraznění `.active-col`.
- **Skripty v `skripty/`:**
  - 2 ověřovací skripty: `XX_check_SRV1-DC.bat` a `XX_check_PC1-WIN.bat`.
  - 2 dokumentační skripty: `XX_doc_SRV1-DC.bat` a `XX_doc_PC1-WIN.bat`.
- **Workflow dokumentace (`docWorkflow`):**
  - Obsahuje **2 kroky**: `Krok 1/2: SRV1-DC` a `Krok 2/2: PC1-WIN`.
- **Discord Bot (`discord-bot`):**
  - V `MODULE_CONFIG` má nastaveno `requiredParts: ['SRV1', 'PC1']`.
  - Po 1. kroku ohlásí `[KROK 1/2 PRIJAT]`, po 2. kroku pošle mezizprávu `[KROK 2/2 PRIJAT]`, sloučí výstupy obou strojů a vytvoří finální ZIP.

#### Varianta C: Modul se 3 stroji (`SRV1-DC`, `SRV2-FS` a `PC1-WIN`)
- **Příklady:** Modul 00 (Příprava a instalace všech tří OS), souborové služby, DFS, zálohování a replikace.
- **Konfigurace v `modules.js` a `modules.json`:** `vms: ["SRV1-DC", "SRV2-FS", "PC1-WIN"]`.
- **Stav ověření `verified.json`:** `{"SRV1-DC": false, "SRV2-FS": false, "PC1-WIN": false}`.
- **Úkoly v `tasks.js`:** Úkoly definovány pro všechny 3 stroje. Tabulka parametrů v `what` má 3 sloupce (`SRV1-DC`, `SRV2-FS`, `PC1-WIN`).
- **Skripty v `skripty/`:**
  - 3 ověřovací skripty: `XX_check_SRV1-DC.bat`, `XX_check_SRV2-FS.bat`, `XX_check_PC1-WIN.bat`.
  - 3 dokumentační skripty: `XX_doc_SRV1-DC.bat`, `XX_doc_SRV2-FS.bat`, `XX_doc_PC1-WIN.bat`.
- **Workflow dokumentace (`docWorkflow`):**
  - Obsahuje **3 kroky**: `Krok 1/3: SRV1-DC`, `Krok 2/3: SRV2-FS`, `Krok 3/3: PC1-WIN`.
- **Discord Bot (`discord-bot`):**
  - V `MODULE_CONFIG` má nastaveno `requiredParts: ['SRV1', 'SRV2', 'PC1']`.
  - Postupně hlásí průběh (`[KROK 1/3 PRIJAT]`, `[KROK 2/3 PRIJAT]`), po obdržení 3. části pošle mezizprávu a sloučí výstupy všech tří VM do finálního ZIPu.

---

##  Striktní pravidla pro PowerShell příkazy a formátování

Při vytváření úkolů **VŽDY bez výjimky** dodržujte tato pravidla:

### 1. ZÁKAZ HVĚZDIČEK V `-InterfaceAlias`
-  **NIKDY NEPOUŽÍVAT:** `Get-NetIPAddress -InterfaceAlias Ethernet*1` ani `Ethernet*`.
-  **VŽDY POUŽÍVAT PŘESNÝ NÁZEV:** `Get-NetIPAddress -InterfaceAlias Ethernet1` (případně `"Ethernet1"`). V prostředí VMware/CyLab se interní adaptér NIC 2 jmenuje `Ethernet1` bez hvězdiček a bez mezer.

### 2. ŽÁDNÉ HARDCODED PRODUKTOVÉ KLÍČE
-  **NIKDY NEVKLÁDAT:** konkrétní licenční klíče Windows do kódu ani do dokumentace.
-  **VŽDY ODKÁZAT NA TEAMS:** Použijte zástupný text `<LAB-KEY-Z-TEAMS>` a napište:
  > *„Produktový klíč (LAB KEY) si zkopírujte přímo ze zadání v Microsoft Teams.“*

### 3. STRIKTNÍ ZÁKAZ EMOJI KDEKOLIV V PROJEKTU
- **NIKDY NEPOUŽÍVAT:** Unicode smajlíky a emoji v kódu, HTML, markdownu, skriptech, komentářích ani v commit messages.
- **VŽDY POUŽÍVAT ČISTÉ VEKTOROVÉ SVG:** V HTML používejte výhradně inline SVG ikony (Lucide / Feather styl, `width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"`).

### 4. DYNAMICKÉ PRÁCOVIŠTĚ (Workstation X)
- Síťové konfigurace musí být navázány na proměnnou `wsX` (`x = wsX || 2`):
  - Podsíť: `192.168.X.0/24`
  - Výchozí brána: `192.168.X.1`
  - `SRV1-DC`: `192.168.X.10`
  - `SRV2-FS`: `192.168.X.20`
  - DHCP rozsah pro klienty: `192.168.X.100` – `192.168.X.200`
  - DNS: `192.168.X.10`

### 5. PARAMETRY VŽDY JAKO TABULKA (`.params-table`)
Pokud zadání definuje konfigurace více strojů, v poli `what` **nikdy nepište pouze odstavec**, ale tabulku s třídami `.params-table-wrapper`, `.params-table` a aktivním zvýrazněním sloupce/řádku:
```html
<div class="params-table-wrapper">
  <table class="params-table">
    <thead>
      <tr>
        <th>Parametr</th>
        <th class="${vm === 'SRV1-DC' ? 'active-col' : ''}">SRV1-DC</th>
        <th class="${vm === 'PC1-WIN' ? 'active-col' : ''}">PC1-WIN</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Rozsah DHCP</strong></td>
        <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">192.168.${x}.100 – .200</td>
        <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">přiděleno automaticky</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 6. VAROVÁNÍ PRO SÍŤOVÉ ADAPTÉRY (`.nic-warning-banner`)
Při konfiguraci síťových rozhraní vždy do `what` vložte `.nic-warning-banner`:
- **NIC 1 (Ethernet0 / NAT):** NEŠAHAT!
- **NIC 2 (Ethernet1 / Interní síť):** SEM PATŘÍ IP! Musí být zapnutý v CyLabu.
- **NIC 3 (Ethernet2 / Třídní síť):** Třída.

### 7. POVINNÝ FAVICON NA VŠECH STRÁNKÁCH (`img/bird.png`)
- **VŠECHNY stránky portálu** musí mít v hlavičce `<head>` definovanou ikonu webu (favicon) odkazující na `img/bird.png`:
  - Kořenové soubory (`index.html`, `praxe.html`, `teorie.html`):
    ```html
    <link rel="icon" type="image/x-icon" href="img/bird.png">
    ```
  - Modulové podstránky v `praxe/XX/` (`__zadani.html`, `_zadani.html`, `__reseni.html`, `_reseni.html`, `_vysledek.html`):
    ```html
    <link rel="icon" type="image/x-icon" href="../../img/bird.png">
    ```

### 8. POVINNÝ KROK RYCHLÉHO OVĚŘENÍ PRO KAŽDÝ STROJ (.bat v `skripty/`)
- Na konec úkolů každého stroje v `tasks.js` a v `_reseni.md` vždy zařadit krok `(Nepovinné) Rychlé ověření celého stroje`.
- V `how` uvést zkopírovatelný univerzální jednořádkový příkaz na skript v `skripty/XX_check_<VM>.bat` (spustitelný v PowerShellu, CMD i Terminálu):
  ```powershell
  powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/XX_check_<VM>.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"
  ```
- V `verify` a `expected` ukázat spuštění skriptu a přehled `[ OK ]` výsledků.

### 9. ZÁKAZ OSOBNÍCH ÚDAJŮ V KÓDU A ŠABLONÁCH (GENERICKÉ PLACEHOLDERY)
- Všechny generované skripty, šablony, nápovědy a dotazy musí používat striktně anonymní a generické zástupné texty:
  - Jméno: `Jan Novák` (nikdy skutečné jméno autora projektu).
  - Doména: `cyberschool.internal` nebo `novak.cyberschool.internal`.
  - Discord uživatel: `jannovak` (nikdy osobní přezdívka či jméno autora).
  - Třída: `T3A`.

### 10. ZÁKAZ DVOJTEČKY PŘÍMO ZA PROMĚNNOU V POWERSHELLU (FATÁLNÍ CHYBA PRO PC A BAT ZAVADĚČ)
- V PowerShell řetězcích v uvozovkách (např. chybové zprávy v `catch`, logy, texty výstupů) NIKDY nepsat dvojtečku bezprostředně za název proměnné, např. `"$studentDomain:"` nebo `"$var:"`.
- PowerShell parser to vyhodnocuje jako neplatný scope prefix (např. `$studentDomain:`) a selže s fatální chybou:
  `ParseException: Variable reference is not valid. ':' was not followed by a valid variable name character. Consider using ${} to delimit the name.`
- V hybridních `.bat` zavaděčích (`[scriptblock]::Create(...)`) tato syntaktická chyba způsobí okamžité selhání celé kompilace skriptu a následnou chybu `BadExpression` při spuštění `& $script`.
- **ŘEŠENÍ:** Vždy proměnnou ohraničit složenými závorkami `${studentDomain}:` nebo oddělit mezerou či pomlčkou:
  `${studentDomain} : $_` nebo `${studentDomain} - $_` nebo `"${studentDomain}: $_"`.

### 11. SPECIFICKÝ FORMÁT PRO KLIENTSKÉ SKRIPTY (PC1-WIN vs SRV1-DC)
- Klientské stroje (PC1-WIN) nemají nainstalované role AD DS ani DNS Server – cmdlety jako `Get-ADDomain`, `Get-DnsServerZone` a `Get-DnsServerResourceRecord` na nich neexistují a nesmí být volány.
- Skripty pro PC1-WIN musí používat výhradně klientské nástroje: `Get-DnsClient`, `Get-DnsClientGlobalSetting`, `Resolve-DnsName`, `cmd.exe /c ipconfig`, `cmd.exe /c nslookup`.
- Skript na PC1-WIN je Krok 2/2 workflow dokumentace:
  - Nepožaduje znovu zadání jména ani třídy.
  - Přebírá pouze Discord username (`$DiscordUser`) pro spárování s balíčkem ze SRV1-DC.
  - Vytváří payload s `part = "PC1"`.
  - Pro bezpečné provedení přes `[scriptblock]::Create` nesmí obsahovat žádné syntaktické kolize s prefixy scopes ani nekompatibilní cmdlety.

### 12. OBFUSKACE DISCORD WEBHOOK URL S FALLBACKEM
- GitHub Secret Scanner okamžitě zneplatní (revokuje) Discord webhooky, pokud je URL vložena do kódu jako plain-text řetězec `https://discord.com/api/webhooks/...`.
- Ve všech `.ps1` a `.bat` skriptech je **POVINNÉ** Webhook URL načítat z proměnné prostředí `$env:DOCS_WEBHOOK_URL` (nebo parametru `-WebhookUrl`), s fallbackem na obfuskovanou URL otočeným řetězcem (`$revHook` a `[Array]::Reverse()`), aby skripty fungovaly přímo ve VM bez nutnosti zadávání proměnných a bez WAF blokování externími proxy.

### 13. POVINNÉ PRIVILEGOVANÉ INTENTY PRO DISCORD BOTA
- Discord bot vyžaduje v Discord Developer Portalu (záložka *Bot* -> *Privileged Gateway Intents*) aktivní přepínače:
  - **MESSAGE CONTENT INTENT** (pro čtení JSON příloh z webhooků a obsahu zpráv).
  - **SERVER MEMBERS INTENT** (pro spolehlivé vyhledání studentů a doručení ZIP archivu do DM).
- V kódu bota (`discord-bot/index.js`) musí být `GatewayIntentBits.MessageContent`.

### 14. POVINNÝ GIT AUTOR COMMITŮ
- Všechny commity musí být prováděny pod identitou autora: `samanbeer <343.ptom@gmail.com>` (`git commit --author="samanbeer <343.ptom@gmail.com>"`).

### 15. ADAPTABILITA PODLE POČTU STROJŮ (ZÁKAZ TVRDÉHO PŘEDPOKLÁDÁNÍ 2 STROJŮ)
- Nikdy nepředpokládat natvrdo, že každý modul má právě 2 stroje (SRV1 a PC1).
- Pokud zadání řeší pouze 1 stroj (např. Modul 01: pouze SRV1-DC), nesmí se generovat klientské skripty pro PC1, docWorkflow má pouze 1 krok a Discord bot nesmí čekat na PC1, ale ihned po přijetí SRV1 vygenerovat ZIP.
- Pokud zadání zapojuje 3 stroje (včetně SRV2-FS), musí vzniknout skripty, úkoly i workflow pro všechny 3 stroje.

### 16. ODDĚLENÍ AUTOMATICKÉ DOKUMENTACE OD ÚKOLŮ (NEZAPOČÍTÁVÁ SE DO PROGRESS BARU)
- Automatická dokumentace se NIKDY nezařazuje jako běžný úkol (checkbox) do `tasks.js` – nesmí ovlivňovat procenta dokončení modulu!
- Posledním krokem každého VM v `tasks.js` musí být VŽDY interaktivní ověřovací skript stroje (`XX_check_<VM>.bat`).
- Automatická dokumentace se na webu zobrazuje výhradně pod samostatným žlutě zvýrazněným tlačítkem `DOKUMENTACE (udělá se sama :O )` vedle tlačítek jednotlivých VM.
- V popUp okně po 100% dokončení úkolů se nezobrazuje inline návod, ale žluté tlačítko pro přechod do záložky dokumentace.
- Instrukce v záložce dokumentace musí být jednoduché, zřetelné a striktně vyžadovat postupné provádění krok za krokem (spustit Krok 1, vyčkat na potvrzení od bota `[KROK 1/X PRIJAT]`, teprve poté spustit další krok).

### 17. ZÁKAZ NEZABALENÝCH OSTRÝCH ZÁVOREK V MARKDOWN ŠABLONÁCH (ROZBITÍ PARSERU)
- V markdown šablonách (`overeni.md`, `postup.md`) a textech NIKDY nepsat zástupné placeholdery v ostrých závorkách bez inline backticků (např. `<prijmeni>` nebo `<domena>`).
- Parsery Markdownu (Obsidian, GitHub, VS Code) ostré závorky `<tag>` vyhodnocují jako otevírací HTML tag. Pokud tag není uzavřen (`</tag>`), markdown renderer přepne do režimu raw HTML a od tohoto místa až do konce souboru zcela přestane interpretovat Markdown značky (nadpisy `###`, bloky kódu ```text, checkboxy `- [x]`, tučné písmo `**`).
- **ŘEŠENÍ:**
  - V šablonách psát placeholdery bez ostrých závorek (např. `prijmeni.cyberschool.internal`) nebo je zabalit do kódu: `Resolve-DnsName ftp.prijmeni.cyberschool.internal`.
  - V Discord botovi (`replaceStudentInfo`) dynamicky nahradit `<prijmeni>` i `prijmeni.cyberschool.internal` skutečným příjmením / doménou studenta.

### 18. SPRÁVNÝ ZÁCHYT VÍCEŘÁDKOVÝCH VÝSTUPŮ Z CMD V POWERSHELLU (ZPLOSTĚNÍ VÝSTUPŮ A KÓDOVÁNÍ)
- Externí příkazy jako `ipconfig /all`, `nslookup`, `ping` vracejí v PowerShellu pole řádků (`[string[]]`).
- Pokud je toto pole vloženo do here-stringu nebo uvozovek (`@"... $ipconfigText ... "@`), PowerShell všechny řádky automaticky spojí pomocí `$OFS` (což je ve výchozím stavu jedna mezera `" "`). Výsledkem je jediný dlouhý řádek, kde jsou zničeny veškeré odřádkování a sloupce.
- Konzole Windows navíc používá OEM kódování (CP852 pro češtinu), takže se české znaky v datu (např. `pondělí`, `úterý`) v UTF-8 poškodí na nečitelné paznaky.
- Chybové výpisy z `nslookup` navíc odchází do `stderr` a bez přesměrování `2>&1` je zachycený text prázdný.
- **ŘEŠENÍ:** V dokumentačních skriptech vždy zachytávat konzolové příkazy přes pomocnou funkci:
  ```powershell
  function Invoke-ConsoleCmd {
      param([string]$Command)
      $prevEncoding = [Console]::OutputEncoding
      try {
          $oemCodePage = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.OEMCodePage
          if ($oemCodePage) {
              [Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding($oemCodePage)
          }
          $lines = @(& cmd.exe /c "$Command 2>&1")
          return ($lines -join "`r`n").Trim()
      } catch {
          return "Chyba pri spusteni '$Command': $_"
      } finally {
          [Console]::OutputEncoding = $prevEncoding
      }
  }
  ```
  Tato funkce zachová řádky a sloupce přesně jako v terminálu, správně přeloží českou diakritiku a zachytí případná varování i chyby z `stderr`.

### 19. BEZPEČNÉ ODESÍLÁNÍ PŘES CURL.EXE A HTTP PARSOVÁNÍ (ZÁKAZ `-w`, CHYBA 43)
- V prostředí Windows PowerShell/CMD NIKDY nepoužívat u `curl.exe` parametr `-w "%{http_code}"` – ve Windows způsobuje pád `curl: (43) A libcurl function was given a bad argument` a návratový kód 000.
- VŽDY volat `curl.exe -i -s -k` (přidá HTTP hlavičky do výstupu) a stavový kód parsovat regulárním výrazem:
  ```powershell
  if ($output -match "HTTP\/\d(?:\.\d)?\s+(\d{3})") { $statusCode = [int]$matches[1] }
  ```
- VŽDY implementovat záložní odeslání přes .NET `System.Net.Http.HttpClient` pro případ, že curl selže nebo vrátí kód 000.

### 20. STRIKTNÍ INTEGRITA HYBRIDNÍ BAT HLAVIČKY (ZÁKAZ OSAMOCENÉHO `&`)
- Řádek 3 v každém `.bat` zavaděči musí mít VŽDY přesnou syntaxi:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"`
- ZÁKAZ jakýchkoliv neuvážených zásahů či zkracování tohoto řádku. Zanechání visícího ampersandu `&` na konci roury způsobí pád parseru `Missing expression after '&'` a skript na VM vůbec nenastartuje.

### 21. PLNÁ SYNCHRONIZACE DISCORD BOTA NA SERVERU (KÓD I ŠABLONY V KONTEJNERU)
- Docker kontejner bota na produkčním serveru (NAS) nemá namountované svazky (`docker-compose.yml` se NIKDY nemění, svazky se nepřidávají!).
- Při přidání nového modulu (např. 00, 01, 02) nestačí mít soubory pouze v repozitáři:
  1. **Šablony:** AI MUSÍ uživatele vyzvat ke zkopírování šablon: `docker cp discord-bot/templates/XX ops-discord-bot:/app/templates/`
  2. **Kód bota (`index.js`):** AI MUSÍ ověřit a uživatele upozornit na nutnost nahrát do kontejneru i aktualizovaný kód `index.js` s logikou pro daný modul. Pokud v kontejneru běží starý kód, bot sice ZIP vytvoří, ale šablony zůstanou nevyplněné (s textem `DOPLNIT`)!
  3. **Restart:** Po nakopírování souborů je nutné provést `docker restart ops-discord-bot`.

---

## Ověřovací checklist pro AI před odevzdáním práce

Než označíte úkol za dokončený, zkontrolujte v terminálu:
1. `praxe/XX/verified.json` existuje a má platný JSON formát.
2. `praxe/XX/tasks.js` je syntakticky validní JS (`node -e "new Function(fs.readFileSync('praxe/XX/tasks.js'))"`).
3. `praxe/modules.js` a `praxe/modules.json` obsahují nový modul a `docWorkflow`.
4. `praxe.html` má v `<head>` tag `<script src="praxe/XX/tasks.js"></script>`.
5. V `praxe.html` nedošlo k syntaktické chybě v JS.
6. Žádný příkaz neobsahuje `Ethernet*` (vždy přesně `Ethernet1`).
7. Žádné heslo ani klíč nejsou v rozporu se zadáním (klíče z Teams, heslo `Pa55w.rd`).
8. Všechny HTML stránky obsahují v `<head>` favicon odkazující na `bird.png` (`img/bird.png` resp. `../../img/bird.png`).
9. Ve složce `skripty/` existují funkční kontrolní skripty `XX_check_<VM>.bat` pro všechny VM modulu.
10. Ve složce `skripty/` existují funkční dokumentační skripty `XX_doc_<VM>.bat` a šablony v `praxe/XX/doc_templates/` i `discord-bot/templates/XX/`.
11. Webhook URL v dokumentačních skriptech je bezpečně obfuskována.
12. V markdown šablonách se nenachází žádné nezabalené HTML značky typu `<prijmeni>`.
13. Konzolové výstupy (`ipconfig`, `nslookup`) jsou v PowerShell skriptech zachytávány přes `Invoke-ConsoleCmd` s `-join "\`r\`n"` a OEM kódováním.
14. Nikde v kódu, textech ani commitech nejsou použity emoji.
15. Změny jsou otestovány, commitnuty pod autorem `samanbeer <343.ptom@gmail.com>` a pushnuty na větev `main` (`git pull --rebase origin main && git push origin main`).
