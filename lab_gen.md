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
Vytvořte `praxe/XX/verified.json`. **Ve výchozím stavu nastavte pro nově vytvořený modul všechny stroje i klíč `dokumentace` na `false`** (protože ještě nebyly v reálném labu fyzicky otestovány a automatická dokumentace je vypnutá):
```json
{
  "SRV1-DC": false,
  "SRV2-FS": false,
  "PC1-WIN": false,
  "dokumentace": false
}
```
*(Pokud modul obsahuje jen např. `SRV1-DC` a `PC1-WIN`, uveďte pouze relevantní stroje + `"dokumentace": false`).*

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
    verifiedFile: "praxe/XX/verified.json",
    submission: {
      title: "CO ODEVZDAT",
      description: "Odevzdává se přes <strong>GitHub Push</strong> (do vašeho repozitáře) a kliknutím na <strong>Odevzdat</strong> v MS Teams:",
      folders: [
        "<code>Moje dokumentace / Modul XX Název</code> (<code>postup.md</code>, <code>overeni.md</code> a složka <code>images</code> se screenshoty)"
      ]
    },
    docWorkflow: {
      disabled: true,
      title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude",
      steps: []
    }
  }
```
A do `window.OPS_MODULE_VERIFIED["XX"]`:
```javascript
  "XX": {
    "SRV1-DC": false,
    "SRV2-FS": false,
    "PC1-WIN": false,
    "dokumentace": false
  }
```
Stejný JSON objekt doplňte do `praxe/modules.json`. **V `docWorkflow` nikdy nevytvářejte `steps` ani příkazy na `XX_doc_*`.**

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

### Krok 7: ZÁKAZ generování automatické dokumentace (`XX_doc_*`) — ruční dokumentace s `OPS_PROMPT`
Automatické generování dokumentace a odesílání do Discord bota je **vypnuté**. Při vytváření nového modulu je **PŘÍSNĚ ZAKÁZÁNO**:
- Vytvářet skripty `skripty/XX_doc_<VM>.ps1` a `skripty/XX_doc_<VM>.bat`.
- Vytvářet šablony v `praxe/XX/doc_templates/` nebo `discord-bot/templates/XX/`.
- Upravovat `discord-bot/index.js` o logiku skládání dokumentace nebo čekání na části nového modulu.
- Vkládat do `modules.js`, `modules.json`, `tasks.js` nebo `__zadani.*` jakékoliv příkazy `curl ... *_doc_*.bat` či instrukce ke stahování ZIPu z Discordu.

*(Pozn.: Původní soubory `00_doc_*` až `04_doc_*` v `skripty/` zůstávají v repozitáři pouze jako archivní legacy kód, ale na webu jsou deaktivované a u nových modulů se nic obdobného nevytváří.)*

V zadání (`__zadani.md`, `_zadani.md`, `__zadani.html`, `_zadani.html`), `modules.js`/`modules.json` (`submission`) a závěrečném kroku `tasks.js` vždy uveďte pouze **ruční postup odevzdání**:
- `postup.md` vypracovat vlastními slovy podle reálně provedených kroků.
- Do `overeni.md` vkládat výstupy z PowerShellu včetně řádku s nastaveným `OPS_PROMPT` (`[yyyy-MM-dd HH:mm:ss] DOMÉNA\účet@POČÍTAČ PS ...>`).
- Požadované screenshoty pořídit s **viditelnými hodinami na hlavním panelu** a vložit přes Obsidian do `images/`.
- Odevzdat přes `Pull -> Commit -> Push` na **GitHub** a tlačítko **Odevzdat** v **MS Teams**.

### Krok 8: Pravidla pro práci podle počtu zapojených strojů (1 VM vs 2 VM vs 3 VM)

Každý modul má specifický počet zapojených strojů (definovaný v poli `vms` v `modules.js`). AI asistent **nesmí natvrdo předpokládat 2 stroje**, ale musí celou infrastrukturu přizpůsobit:

#### Varianta A: Modul s 1 strojem (např. pouze `SRV1-DC`)
- **Příklady:** Modul 01 (Active Directory Domain Services), instalace lokálních serverových rolí.
- **Konfigurace v `modules.js` a `modules.json`:** `vms: ["SRV1-DC"]`, `defaultVM: "SRV1-DC"`, `docWorkflow: { disabled: true, title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude", steps: [] }`.
- **Stav ověření `verified.json`:** Obsahuje klíče `{"SRV1-DC": false, "dokumentace": false}`.
- **Úkoly v `tasks.js`:** Všechny úkoly mají `forVMs: ["SRV1-DC"]`. Tabulka parametrů v `what` uvádí parametry pouze pro tento stroj.
- **Skripty v `skripty/`:**
  - Vzniká **pouze** 1 ověřovací skript: `XX_check_SRV1-DC.bat` (+ `.ps1`). Žádný `XX_doc_*` skript nevzniká.

#### Varianta B: Modul se 2 stroji (např. `SRV1-DC` a `PC1-WIN`)
- **Příklady:** Modul 02 (DHCP Server a Klient), Modul 03 (DNS Server a Klient), Modul 04 (Active Directory).
- **Konfigurace v `modules.js` a `modules.json`:** `vms: ["SRV1-DC", "PC1-WIN"]`, `docWorkflow: { disabled: true, title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude", steps: [] }`.
- **Stav ověření `verified.json`:** `{"SRV1-DC": false, "PC1-WIN": false, "dokumentace": false}`.
- **Úkoly v `tasks.js`:** Rozděleny na serverové (`forVMs: ["SRV1-DC"]`) a klientské (`forVMs: ["PC1-WIN"]`). Tabulka parametrů v `what` má 2 sloupce (`SRV1-DC`, `PC1-WIN`) a zvýraznění `.active-col`.
- **Skripty v `skripty/`:**
  - Vznikají **pouze** 2 ověřovací skripty: `XX_check_SRV1-DC.bat` (+ `.ps1`) a `XX_check_PC1-WIN.bat` (+ `.ps1`). Žádné `XX_doc_*` skripty nevznikají.

#### Varianta C: Modul se 3 stroji (`SRV1-DC`, `SRV2-FS` a `PC1-WIN`)
- **Příklady:** Modul 00 (Příprava a instalace všech tří OS), souborové služby, DFS, zálohování a replikace.
- **Konfigurace v `modules.js` a `modules.json`:** `vms: ["SRV1-DC", "SRV2-FS", "PC1-WIN"]`, `docWorkflow: { disabled: true, title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude", steps: [] }`.
- **Stav ověření `verified.json`:** `{"SRV1-DC": false, "SRV2-FS": false, "PC1-WIN": false, "dokumentace": false}`.
- **Úkoly v `tasks.js`:** Úkoly definovány pro všechny 3 stroje. Tabulka parametrů v `what` má 3 sloupce (`SRV1-DC`, `SRV2-FS`, `PC1-WIN`).
- **Skripty v `skripty/`:**
  - Vznikají **pouze** 3 ověřovací skripty: `XX_check_SRV1-DC.bat`, `XX_check_SRV2-FS.bat`, `XX_check_PC1-WIN.bat` (+ `.ps1`). Žádné `XX_doc_*` skripty nevznikají.

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
- Ověřovací skripty (`XX_check_PC1-WIN`) musí používat výhradně klientské nástroje: `Get-DnsClient`, `Get-DnsClientGlobalSetting`, `Resolve-DnsName`, `Get-CimInstance Win32_ComputerSystem`, `cmd.exe /c ipconfig`, `cmd.exe /c nslookup`.
- Pro bezpečné provedení přes `[scriptblock]::Create` v hybridním `.bat` zavaděči nesmí skript obsahovat syntaktické kolize s prefixy scopes ani nekompatibilní cmdlety.

### 12. ŠIFROVANÉ ULOŽENÍ DISCORD WEBHOOK URL (ZÁKAZ PLAINTEXTU A .ENV)
- GitHub Secret Scanner okamžitě zneplatní (revokuje) Discord webhooky, pokud je URL vložena do kódu, `.env`, `.env.example` nebo historie commitů jako plain-text řetězec i prostý reverzní řetězec (`$revHook`).
- V legacy dokumentačních skriptech je Webhook URL uloženo výhradně v šifrované podobě (**XOR klíčem `well_ops_sec_2026` + Base64**) s dešifrováním až za běhu v paměti. Pro nové moduly se žádné webhookové ani dokumentační skripty nevytvářejí. NIKDY neukládejte webhook URL, tokeny ani skutečná hesla do `.env`, `.env.example` ani do commitů.

### 13. PRIVILEGOVANÉ INTENTY PRO DISCORD BOTA (PRO OZNAMOVACÍ PŘÍKAZY)
- Discord bot vyžaduje v Discord Developer Portalu (záložka *Bot* -> *Privileged Gateway Intents*) aktivní přepínače:
  - **MESSAGE CONTENT INTENT**
  - **SERVER MEMBERS INTENT**
- V kódu bota (`discord-bot/index.js`) musí být `GatewayIntentBits.MessageContent`.

### 14. POVINNÝ GIT AUTOR COMMITŮ
- Všechny commity musí být prováděny pod identitou autora: `samanbeer <343.ptom@gmail.com>` (`git commit --author="samanbeer <343.ptom@gmail.com>"`).

### 15. ADAPTABILITA PODLE POČTU STROJŮ (ZÁKAZ TVRDÉHO PŘEDPOKLÁDÁNÍ 2 STROJŮ)
- Nikdy nepředpokládat natvrdo, že každý modul má právě 2 stroje (SRV1 a PC1).
- Pokud zadání řeší pouze 1 stroj (např. Modul 01: pouze SRV1-DC), generuje se pouze 1 ověřovací skript `XX_check_SRV1-DC` a tabulka v `tasks.js` zobrazuje jen příslušné VM.
- Pokud zadání zapojuje 3 stroje (včetně SRV2-FS), musí vzniknout úkoly a ověřovací `XX_check_<VM>` skripty pro všechny 3 stroje.

### 16. DEAKTIVACE AUTOMATICKÉ DOKUMENTACE A ODDĚLENÍ OD ÚKOLŮ
- Automatická dokumentace je v celém portálu **deaktivována** a **NESMÍ** se vytvářet ani jako úkol v `tasks.js`, ani jako `XX_doc_*` skript.
- Posledním krokem každého VM v `tasks.js` musí být VŽDY interaktivní read-only ověřovací skript stroje (`XX_check_<VM>.bat`), případně závěrečný krok s pokyny pro ruční odevzdání (bez jakýchkoliv `XX_doc_*` skriptů).
- Žluté tlačítko v liště VM i v modalu po 100% dokončení zůstává deaktivované s textem `DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude`, a v `modules.js` / `modules.json` má modul vždy:
  `docWorkflow: { disabled: true, title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude", steps: [] }`.

### 17. ZÁKAZ NEZABALENÝCH OSTRÝCH ZÁVOREK V MARKDOWNU (ROZBITÍ PARSERU)
- V markdown textech a šablonách NIKDY nepsat zástupné placeholdery v ostrých závorkách bez inline backticků (např. `<prijmeni>` nebo `<domena>`).
- Parsery Markdownu (Obsidian, GitHub, VS Code) ostré závorky `<tag>` vyhodnocují jako otevírací HTML tag. Pokud tag není uzavřen (`</tag>`), markdown renderer přepne do režimu raw HTML a od tohoto místa až do konce souboru zcela přestane interpretovat Markdown značky (nadpisy `###`, bloky kódu ```text, checkboxy `- [x]`, tučné písmo `**`).
- **ŘEŠENÍ:** Psát placeholdery bez ostrých závorek (např. `prijmeni.cyberschool.internal`) nebo je zabalit do kódu: `` `Resolve-DnsName ftp.<prijmeni>.cyberschool.internal` ``.

### 18. SPRÁVNÝ ZÁCHYT VÍCEŘÁDKOVÝCH VÝSTUPŮ Z CMD V POWERSHELLU (ZPLOSTĚNÍ VÝSTUPŮ A KÓDOVÁNÍ)
- Externí příkazy jako `ipconfig /all`, `nslookup`, `ping` vracejí v PowerShellu pole řádků (`[string[]]`).
- Pokud je toto pole vloženo do here-stringu nebo uvozovek (`@"... $ipconfigText ... "@`), PowerShell všechny řádky automaticky spojí pomocí `$OFS` (což je ve výchozím stavu jedna mezera `" "`). Výsledkem je jediný dlouhý řádek, kde jsou zničeny veškeré odřádkování a sloupce.
- Konzole Windows navíc používá OEM kódování (CP852 pro češtinu), takže se české znaky v datu (např. `pondělí`, `úterý`) v UTF-8 poškodí na nečitelné paznaky.
- Chybové výpisy z `nslookup` navíc odchází do `stderr` a bez přesměrování `2>&1` je zachycený text prázdný.
- **ŘEŠENÍ:** V `XX_check_*.ps1` skriptech při čtení CMD výstupů zachytávat konzolové příkazy přes pomocnou funkci:
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
- Pokud skript potřebuje HTTP status kód přes `curl.exe`, vždy volat `curl.exe -i -s -k` a stavový kód parsovat regulárním výrazem:
  ```powershell
  if ($output -match "HTTP\/\d(?:\.\d)?\s+(\d{3})") { $statusCode = [int]$matches[1] }
  ```

### 20. STRIKTNÍ INTEGRITA HYBRIDNÍ BAT HLAVIČKY (ZÁKAZ OSAMOCENÉHO `&`)
- Řádek 3 v každém `.bat` zavaděči musí mít VŽDY přesnou syntaxi:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"`
- ZÁKAZ jakýchkoliv neuvážených zásahů či zkracování tohoto řádku. Zanechání visícího ampersandu `&` na konci roury způsobí pád parseru `Missing expression after '&'` a skript na VM vůbec nenastartuje.

### 21. SYNCHRONIZACE DISCORD BOTA NA SERVERU (POUZE PŘI RUČNÍ ÚPRAVĚ BOTA)
- Docker kontejner bota na produkčním serveru (NAS) nemá namountované svazky (`docker-compose.yml` se NIKDY nemění, svazky se nepřidávají!).
- Při tvorbě nového modulu se do bota **nic pro dokumentaci nepřidává ani nekopíruje**. Pokud však AI na výslovné přání upraví kód v `discord-bot/index.js`, musí uživatele upozornit na nahrání souboru (`docker cp discord-bot/index.js ops-discord-bot:/app/index.js`) a restart (`docker restart ops-discord-bot`).

### 22. ŠKOLNÍ WORKFLOW VAULTU, GITHUBU A ODEVZDÁNÍ (PREREKVIZITY `10-` A `14-`)
- **Zákaz zásahů do školního repozitáře a materiálů učitele:** Školní vault (např. `skolni-it-pachomov`) je při generování **strictly read-only** — nikdy v něm nic neupravujte (ani `00-PREREKVIZITY`, `Modul X/`, `index.md`, `CHANGELOG.md`, `.obsidian/`). Student píše pouze do `Moje dokumentace/Modul X .../`.
- **Odevzdávání od Modulu 3 výše (GitHub Push + Teams):** ZIP archivy se odevzdávaly jen v Modulech 0–2. Od Modulu 3 včetně se odevzdává ručně cyklem **Pull -> ruční zápis `postup.md` a `overeni.md` (s `OPS_PROMPT`) do `Moje dokumentace` -> popisný Commit -> Push na GitHub -> tlačítko Odevzdat v MS Teams** (stav repozitáře se hodnotí k termínu odevzdání).
- **Konfigurace na webu (`modules.js` / `modules.json` / `praxe.html`):** Pro Moduly 3+ používejte v `submission` pole `description` (instrukce GitHub Push + Teams místo `Prijmeni_Jmeno_ModulX.zip`) a `deadline` (pokud je znám termín odevzdání), bez zmínek o Discord botovi či `XX_doc_*`.
- **Integrita šablon, `OPS_PROMPT` a screenshotů:** Nadpisy a ID (`M4-SRV1.V1-D1` apod.) z `overeni.md` a `postup.md` **nesmí být měněny**. Kde školní šablona vyžaduje ruční screenshot (`DOPLNIT`), musí screenshot obsahovat **viditelné hodiny na hlavním panelu**; výpisy konzole zůstávají textem (`\`\`\`text`) i s reálným `OPS_PROMPT` (bez tohoto promptu jsou od Modulu 4 hodnoceny 0 body).
- **Šedé odkazy a labové standardy:** Šedé odkazy ve školním vaultu značí dosud nevydané materiály — nevytvářejte prázdné cílové soubory. Parametry VM udržujte sjednocené podle aktuálního `CHANGELOG.md` (např. `SRV2-FS` má další disky **5× 5 GB**, Modul 0 = 4 h, Modul 1 = 4 h, celkem 40 h, heslo `Pa55w.rd`, doména malými písmeny bez diakritiky `<prijmeni>.cyberschool.internal`).

---

## Ověřovací checklist pro AI před odevzdáním práce

Než označíte úkol za dokončený, zkontrolujte v terminálu:
1. `praxe/XX/verified.json` existuje, má platný JSON formát a všechny stroje i `"dokumentace"` mají hodnotu `false`.
2. `praxe/XX/tasks.js` je syntakticky validní JS (`node -e "new Function(fs.readFileSync('praxe/XX/tasks.js'))"`).
3. `praxe/modules.js` a `praxe/modules.json` obsahují nový modul s deaktivovaným `docWorkflow` (`{ disabled: true, title: "DOKUMENTACE - Bude dostupná až vymyslíme jak obelstít juchyho claude", steps: [] }`).
4. `praxe.html` má v `<head>` tag `<script src="praxe/XX/tasks.js"></script>`.
5. V `praxe.html` nedošlo k syntaktické chybě v JS.
6. Žádný příkaz neobsahuje `Ethernet*` (vždy přesně `Ethernet1`).
7. Žádné heslo ani klíč nejsou v rozporu se zadáním (klíče z Teams, heslo `Pa55w.rd`).
8. Všechny HTML stránky obsahují v `<head>` favicon odkazující na `bird.png` (`img/bird.png` resp. `../../img/bird.png`).
9. Ve složce `skripty/` existují funkční read-only kontrolní skripty `XX_check_<VM>.bat` (+ `.ps1`) pro všechny VM modulu.
10. **Nevznikly žádné dokumentační skripty `skripty/XX_doc_*`, šablony `praxe/XX/doc_templates/` ani `discord-bot/templates/XX/` a nikde v zadání, `tasks.js` ani `modules.js`/`modules.json` nejsou příkazy `curl ... *_doc_*`.**
11. Nikde v repozitáři ani v `.env*` není plaintext webhook URL, token ani reálné heslo.
12. Nadpisy a ID odpovídají školní šabloně a `modules.js`/`praxe.html` reflektuje termín, `OPS_PROMPT` i ruční GitHub+Teams odevzdání (od M03+).
13. Konzolové výstupy (`ipconfig`, `nslookup`) jsou v `XX_check_*.ps1` skriptech zachytávány přes `Invoke-ConsoleCmd` s `-join "\`r\`n"` a OEM kódováním.
14. Nikde v kódu, textech ani commitech nejsou použity emoji.
15. Změny jsou otestovány, commitnuty pod autorem `samanbeer <343.ptom@gmail.com>` a pushnuty na větev `main` (`git pull --rebase origin main && git push origin main`).
