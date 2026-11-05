---
name: lab_gen
description: Návod a metodika pro AI asistenty, jak na základě podkladů (__zadani.md, _vysledek.md) vygenerovat a integrovat nová praktická cvičení (Modul 02, 03...) do dynamického webového portálu OPS.
---

#  Metodika generování praktických cvičení (LAB GEN)

Tento návod definuje standardy a konkrétní kroky, které **každý AI asistent musí provést**, jakmile uživatel požádá o zpracování nebo vytvoření nového cvičení (např. *„Zpracuj 2. zadání (Modul 02)“*).

Podrobná specifikace se nachází v hlavním souboru projektu: [lab_gen.md](../../../lab_gen.md).

---

##  Co VŠE musí AI vytvořit pro nové zadání (Modul XX):

### 1. Složka cvičení `praxe/XX/`
Vytvořit složku `praxe/XX/` (např. `praxe/02/`):
- `__zadani.md` a `_zadani.md` – textové zadání cvičení.
- `__zadani.html` a `_zadani.html` – stylizovaná HTML verze sjednocená s OPS motivem (`#1a1a1a`, červená tlačítka `--accent: #ff5555`), kopírovacími tlačítky, SVG ikonami (žádné emoji!) a povinným faviconem (`<link rel="icon" type="image/x-icon" href="../../img/bird.png">`).
- `_vysledek.md`, `__reseni.md` a `_reseni.md` – kontrolní seznam vzorového řešení bod po bodu.
- `__reseni.html`, `_reseni.html` a `_vysledek.html` – stylizovaná HTML verze řešení v jednotném OPS motivu s červenými tlačítky a povinným faviconem (`<link rel="icon" type="image/x-icon" href="../../img/bird.png">`).

### 2. Konfigurace ověření `praxe/XX/verified.json`
Vytvořit soubor `praxe/XX/verified.json`, kde jsou pro nově vytvořený modul ve výchozím stavu všechny stroje nastaveny na `false` (dokud je uživatel v reálném labu fyzicky neotestuje):
```json
{
  "SRV1-DC": false,
  "SRV2-FS": false,
  "PC1-WIN": false
}
```
*Jakmile uživatel přepíše hodnotu na `true`, na webu `praxe.html` se u daného stroje automaticky objeví zelený odznak **„Ověřeno OK“** i potvrzující zelený banner.*

### 3. Úkoly pro interaktivní checklist `praxe/XX/tasks.js`
Vytvořit soubor `praxe/XX/tasks.js` registrující úkoly do `window.OPS_MODULE_TASKS["XX"]`:
```javascript
window.OPS_MODULE_TASKS = window.OPS_MODULE_TASKS || {};
window.OPS_MODULE_TASKS["XX"] = [
  {
    id: "kebab-case-id",
    title: "1. Název úkolu",
    forVMs: ["SRV1-DC", "PC1-WIN"],
    what: (vm, wsX) => { const x = wsX || 2; return `Popis úkolu...`; },
    how: (vm, wsX) => { const x = wsX || 2; return `# 1. Příkaz:\nInstall-WindowsFeature ...`; },
    verify: (vm, wsX) => `Get-Service ...`,
    expected: (vm, wsX) => `Očekávaný výstup konzole...`
  }
];
```

### 4. Registrace v `praxe/modules.js` a `praxe/modules.json`
Přidat záznam o modulu:
```javascript
{
  id: "XX",
  code: "MXX",
  title: "Modul XX: Název modulu",
  shortTitle: "Modul XX",
  folder: "praxe/XX",
  vms: ["SRV1-DC", "PC1-WIN"],
  defaultVM: "SRV1-DC",
  tasksFile: "praxe/XX/tasks.js",
  verifiedFile: "praxe/XX/verified.json"
}
```
A do `window.OPS_MODULE_VERIFIED["XX"]` nastavit stejné výchozí `false` hodnoty jako v `verified.json`.

### 5. Načtení skriptu v `praxe.html`
Do tagu `<head>` v `praxe.html` doplnit:
```html
<script src="praxe/XX/tasks.js"></script>
```

### 6. Interaktivní ověřovací skripty v `skripty/` (POVINNÉ PRO KAŽDÝ STROJ)
Pro každé zařízení (VM) definované v modulu vytvořit v kořenové složce `skripty/` dvojici interaktivních ověřovacích skriptů:
- Formát názvů: `skripty/XX_check_<VM>.ps1` a `skripty/XX_check_<VM>.bat` (např. `skripty/01_check_SRV1-DC.bat`, `skripty/02_check_PC1-WIN.bat`).
- Skript je **striktně READ-ONLY**: provádí pouze audit a čtení stavu (`Get-*`, `Test-*`, `Resolve-DnsName`), nikdy žádná systémová nastavení nemění ani nepřepisuje.
- Skript je interaktivní: vyzve uživatele k zadání čísla pracoviště `X` (výchozí 2, s autodetekcí z IP adresy `Ethernet1`), prověří veškerou konfiguraci daného modulu pro daný stroj a vypíše 3-úrovňový souhrn: zeleně `[ OK ]`, žlutě `[KONTROLA]` (položky k vizuálnímu ověření) a červeně `[CHYBA]` s konkrétní nápovědou pro nápravu.
- Skript je neperzistentní (efemérní): `.bat` soubor po sobě uklidí (`(goto) 2>nul & del "%~f0"`).
- V `tasks.js` zařadit na konec kontrolního seznamu každého stroje nepovinný krok:
  `title: "X. (Nepovinné) Rychlé ověření stroje <VM>"` (resp. `celého stroje`)
  obsahující jednořádkový příkaz pro stažení a spuštění přes curl (spustitelný v PowerShellu, CMD i Terminálu, s vizuálním průběhem stahování a automatickým úklidem):
  `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/XX_check_<VM>.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`

### 7. Skripty pro automatické vyplnění dokumentace a doručení na Discord (POVINNÉ)
Pro každý modul se školní dokumentací vytvořit:
1. Čisté šablony v `praxe/XX/doc_templates/` (`overeni.md`, `postup.md`) a jejich zrcadla v `discord-bot/templates/XX/`.
2. Pro každý zapojený stroj vytvořit skript `skripty/XX_doc_<VM>.ps1` a hybridní `.bat` zavaděč `skripty/XX_doc_<VM>.bat`.
3. Pravidla pro skripty dokumentace:
   - **Hybridní BAT hlavička:** Vždy přesně:
     `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"`
     (Pozor: proměnné `$script` a `$env:BAT_PATH` nesmí být ořezány!)
   - **Autodetekce:** Zjištění čísla pracoviště z `Ethernet1` (striktně bez hvězdiček), domény a jména.
   - **Dotaz na Discord username:** Vyzve studenta k zadání jeho Discord uživatelského jména (např. `jannovak`).
   - **Autentické výpisy:** Všechny textové důkazy vkládat i s PowerShell promptem (`PS C:\Users\Administrator> ...`).
   - **Vizuální průběh:** Postupné spouštění kroků s prodlevou pro čitelnost (`[ OK ]`, `[ RUČNÍ ]` u screenshotů).
   - **Odeslání na Webhook:** Zabalení do JSON a odeslání na Discord Webhook pomocí `curl.exe`.
   - **Čekání na Enter:** Před ukončením skript počká na stisk klávesy Enter.
4. Discord bot (`discord-bot`):
   - Automaticky zachytí obě části (SRV1-DC i PC1-WIN) patřící danému uživateli.
   - Pinguje uživatele (@mention) při každém přijatém kroku.
   - Po obdržení obou částí pošle mezizprávu o zahájení generování dokumentace.
   - Spojí je do kompletních souborů `overeni.md` a `postup.md`.
   - Zabalí je do ZIP archivu `Prijmeni_Jmeno_ModulXX.zip`.
   - Odesílá VÝHRADNĚ `.zip` archiv (neposílá `.md` soubory odděleně).
   - Ve finální zprávě výslovně upozorní na body vyžadující ruční screenshot (např. `M3-SRV1.V1-D2` pro DNS Manager).
   - Doručí je studentovi do soukromé zprávy (DM) i do oznamovacího kanálu s označením (@mention).
5. V `praxe/modules.js` definovat u modulu objekt `docWorkflow` s kroky pro SRV1-DC a PC1-WIN a varováním *„Všechny příkazy dělej postupně a nepřeskakuj!“*.

### 8. Pravidla pro práci podle počtu zapojených strojů (1 VM vs 2 VM vs 3 VM)

Každý modul má specifický počet zapojených strojů (definovaný v poli `vms` v `modules.js`). AI asistent **nesmí natvrdo předpokládat 2 stroje**, ale musí celou infrastrukturu přizpůsobit:

#### Varianta A: Modul s 1 strojem (např. pouze `SRV1-DC`)
- **Příklady:** Modul 01 (Active Directory Domain Services), instalace lokálních rolí, správa disků na serveru.
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

##  Kritická pravidla a nejčastější chyby (POZOR):

1. **ZÁKAZ HVĚZDIČEK V INTERFACE ALIAS:**
   -  Nikdy nepoužívejte `Ethernet*1` ani `Ethernet*`.
   -  Vždy uvádějte přesný název `Ethernet1` (NIC 2 v CyLabu) bez hvězdičky!
2. **ŽÁDNÉ HARDCODED PRODUKTOVÉ KLÍČE:**
   -  Nikdy nevkládejte reálné licenční klíče do repozitáře.
   -  Vždy odkažte studenty na zadání v **Microsoft Teams** (`slmgr.vbs /ipk <LAB-KEY-Z-TEAMS>`).
3. **STRIKTNÍ ZÁKAZ EMOJI KDEKOLIV V PROJEKTU:**
   - V celém repozitáři (kód, HTML, markdown, skripty, komentáře, commit messages i odpovědi uživateli) platí **přísný zákaz Unicode smajlíků a emoji**.
   - V HTML souborech používat výhradně čisté inline SVG ikony.
4. **PARAMETRY VŽDY V TABULCE `.params-table`:**
   - Tabulky v `what` musí mít třídy `.params-table-wrapper` a `.params-table` a zvýrazňovat vybraný stroj třídou `.active-col` / `.active-row`.
5. **DYNAMICKÉ ČÍSLOVÁNÍ PRACOVIŠTĚ (`wsX`):**
   - Všechny IP adresyvažte na proměnnou `wsX` (`192.168.${x}.0/24`, brána `192.168.${x}.1`, servery `.10`/`.20`, klienti `.100–.200`).
6. **NIC VAROVNÝ BANNER:**
   - U síťových úkolů vždy zobrazte `.nic-warning-banner` připomínající zapnutí NIC 2 v CyLabu a pravidlo *„na NIC 1 (NAT) nešahat“*.
7. **POVINNÝ FAVICON NA VŠECH STRÁNKÁCH (`img/bird.png`):**
   - Všechny HTML stránky v projektu musí mít v tagu `<head>` nastavenou favicon na `img/bird.png`.
   - V kořenových stránkách (`index.html`, `teorie.html`, `praxe.html`):
     `<link rel="icon" type="image/x-icon" href="img/bird.png">`
   - V HTML stránkách v podsložkách modulů (`praxe/XX/*.html`):
     `<link rel="icon" type="image/x-icon" href="../../img/bird.png">`
8. **POVINNÝ KROK RYCHLÉHO OVĚŘENÍ PRO KAŽDÝ STROJ:**
   - Na konec úkolů každého stroje v `tasks.js` a v `_reseni.md` vždy zařadit krok `(Nepovinné) Rychlé ověření celého stroje`.
   - V `how` uvést zkopírovatelný univerzální jednořádkový příkaz na skript v `skripty/XX_check_<VM>.bat` (spustitelný v PowerShellu, CMD i Terminálu):
     `powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/XX_check_<VM>.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"`
   - V `verify` a `expected` ukázat spuštění skriptu a přehled `[ OK ]` výsledků.
9. **ZÁKAZ OSOBNÍCH ÚDAJŮ V KÓDU A ŠABLONÁCH (GENERICKÉ PLACEHOLDERY):**
   - Všechny generované skripty, šablony, nápovědy a dotazy musí používat striktně anonymní a generické zástupné texty:
     - Jméno: `Jan Novák` (nikdy skutečné jméno autora projektu).
     - Doména: `cyberschool.internal` nebo `novak.cyberschool.internal`.
     - Discord uživatel: `jannovak` (nikdy osobní přezdívka či jméno autora).
     - Třída: `T3A`.
10. **ZÁKAZ DVOJTEČKY PŘÍMO ZA PROMĚNNOU V POWERSHELLU (FATÁLNÍ CHYBA PRO PC A BAT ZAVADĚČ):**
    - V PowerShell řetězcích v uvozovkách (např. chybové zprávy v `catch`, logy, texty výstupů) NIKDY nepsat dvojtečku bezprostředně za název proměnné, např. `"$studentDomain:"` nebo `"$var:"`.
    - PowerShell parser to vyhodnocuje jako neplatný scope prefix (např. `$studentDomain:`) a selže s fatální chybou:
      `ParseException: Variable reference is not valid. ':' was not followed by a valid variable name character. Consider using ${} to delimit the name.`
    - V hybridních `.bat` zavaděčích (`[scriptblock]::Create(...)`) tato chyba způsobí okamžité selhání celé kompilace skriptu a následnou chybu `BadExpression` při spuštění `& $script`.
    - **ŘEŠENÍ:** Vždy proměnnou ohraničit složenými závorkami `${studentDomain}:` nebo oddělit mezerou či pomlčkou:
      `${studentDomain} : $_` nebo `${studentDomain} - $_` nebo `"${studentDomain}: $_"`.
11. **SPECIFICKÝ FORMÁT PRO KLIENTSKÉ SKRIPTY (PC1-WIN vs SRV1-DC):**
    - Klientské stroje (PC1-WIN) nemají nainstalované role AD DS ani DNS Server – cmdlety jako `Get-ADDomain`, `Get-DnsServerZone` a `Get-DnsServerResourceRecord` na nich neexistují a nesmí být volány.
    - Skripty pro PC1-WIN musí používat výhradně klientské nástroje: `Get-DnsClient`, `Get-DnsClientGlobalSetting`, `Resolve-DnsName`, `cmd.exe /c ipconfig`, `cmd.exe /c nslookup`.
    - Skript na PC1-WIN je Krok 2/2 workflow dokumentace:
      - Nepožaduje znovu zadání jména ani třídy.
      - Přebírá pouze Discord username (`$DiscordUser`) pro spárování s balíčkem ze SRV1-DC.
      - Vytváří payload s `part = "PC1"`.
      - Pro bezpečné provedení přes `[scriptblock]::Create` nesmí obsahovat žádné syntaktické kolize s prefixy scopes ani nekompatibilní cmdlety.
12. **DISCORD WEBHOOK URL Z GITHUB SECRETS / PROMĚNNÉ PROSTŘEDÍ:**
    - V žádném skriptu nesmí být Webhook URL uložena natvrdo (ani v plain-textu, ani obfuskována).
    - Ve všech `.ps1` a `.bat` skriptech je **POVINNÉ** načítat Webhook URL z proměnné prostředí `$env:DOCS_WEBHOOK_URL` (nebo parametru `-WebhookUrl`). Pokud hodnota chybí, skript ihned skončí s chybou.
13. **POVINNÉ PRIVILEGOVANÉ INTENTY PRO DISCORD BOTA:**
    - Discord bot vyžaduje v Discord Developer Portalu (záložka *Bot* -> *Privileged Gateway Intents*) aktivní přepínače:
      - **MESSAGE CONTENT INTENT** (pro čtení JSON příloh z webhooků a obsahu zpráv).
      - **SERVER MEMBERS INTENT** (pro spolehlivé vyhledání studentů a doručení ZIP archivu do DM).
    - V kódu bota (`discord-bot/index.js`) musí být `GatewayIntentBits.MessageContent`.
14. **POVINNÝ GIT AUTOR COMMITŮ:**
    - Všechny commity musí být prováděny pod identitou autora: `samanbeer <tomas.pachomov@frengp.cz>` (`git commit --author="samanbeer <tomas.pachomov@frengp.cz>"`).
15. **ADAPTABILITA PODLE POČTU STROJŮ (ZÁKAZ TVRDÉHO PŘEDPOKLÁDÁNÍ 2 STROJŮ):**
    - Nikdy nepředpokládat natvrdo, že každý modul má právě 2 stroje (SRV1 a PC1).
    - Pokud zadání řeší pouze 1 stroj (např. Modul 01: pouze SRV1-DC), nesmí se generovat klientské skripty pro PC1, docWorkflow má pouze 1 krok a Discord bot nesmí čekat na PC1, ale ihned vygenerovat ZIP.
    - Pokud zadání zapojuje 3 stroje (včetně SRV2-FS), musí vzniknout skripty, úkoly i workflow pro všechny 3 stroje.
16. **ODDĚLENÍ AUTOMATICKÉ DOKUMENTACE OD ÚKOLŮ (NEZAPOČÍTÁVÁ SE DO PROGRESS BARU):**
    - Automatická dokumentace se NIKDY nezařazuje jako běžný úkol (checkbox) do `tasks.js` – nesmí ovlivňovat procenta dokončení modulu!
    - Posledním krokem každého VM v `tasks.js` musí být VŽDY interaktivní ověřovací skript stroje (`XX_check_<VM>.bat`).
    - Automatická dokumentace se na webu zobrazuje výhradně pod samostatným žlutě zvýrazněným tlačítkem `DOKUMENTACE (udělá se sama :O )` vedle tlačítek jednotlivých VM.
    - V popUp okně po 100% dokončení úkolů se nezobrazuje inline návod, ale žluté tlačítko pro přechod do záložky dokumentace.
    - Instrukce v záložce dokumentace musí být jednoduché, zřetelné a striktně vyžadovat postupné provádění krok za krokem (spustit Krok 1, vyčkat na potvrzení od bota `[KROK 1/X PRIJAT]`, teprve poté spustit další krok).
17. **ZÁKAZ NEZABALENÝCH OSTRÝCH ZÁVOREK V MARKDOWN ŠABLONÁCH (ROZBITÍ PARSERU):**
    - V markdown šablonách (`overeni.md`, `postup.md`) a textech NIKDY nepsat zástupné placeholdery v ostrých závorkách bez inline backticků (např. `<prijmeni>` nebo `<domena>`).
    - Parsery Markdownu (Obsidian, GitHub, VS Code) ostré závorky `<tag>` vyhodnocují jako otevírací HTML tag. Pokud tag není uzavřen (`</tag>`), markdown renderer přepne do režimu raw HTML a od tohoto místa až do konce souboru zcela přestane interpretovat Markdown značky (nadpisy `###`, bloky kódu ```text, checkboxy `- [x]`, tučné písmo `**`).
    - **ŘEŠENÍ:**
      - V šablonách psát placeholdery bez ostrých závorek (např. `prijmeni.cyberschool.internal`) nebo je zabalit do kódu: `Resolve-DnsName ftp.prijmeni.cyberschool.internal`.
      - V Discord botovi (`replaceStudentInfo`) dynamicky nahradit `<prijmeni>` i `prijmeni.cyberschool.internal` skutečným příjmením / doménou studenta.
18. **SPRÁVNÝ ZÁCHYT VÍCEŘÁDKOVÝCH VÝSTUPŮ Z CMD V POWERSHELLU (ZPLOSTĚNÍ VÝSTUPŮ A KÓDOVÁNÍ):**
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

---

## Ověřovací checklist pro AI před odevzdáním práce

Než označíte úkol za dokončený, zkontrolujte v terminálu:
1. `praxe/XX/verified.json` existuje a má platný JSON formát.
2. `praxe/XX/tasks.js` je syntakticky validní JS (`node -e "new Function(fs.readFileSync('praxe/XX/tasks.js'))"`).
3. `praxe/modules.js` a `praxe/modules.json` obsahují nový modul a `docWorkflow`.
4. `praxe.html` má v `<head>` tag `<script src="praxe/XX/tasks.js"></script>`.
5. V `praxe.html` ani v konzoli nedochází k chybám v JS.
6. Žádný příkaz neobsahuje `Ethernet*` (vždy přesně `Ethernet1`).
7. Žádné heslo ani klíč nejsou v rozporu se zadáním (klíče z Teams, heslo `Pa55w.rd`).
8. Všechny HTML stránky obsahují v `<head>` favicon odkazující na `bird.png` (`img/bird.png` resp. `../../img/bird.png`).
9. Ve složce `skripty/` existují funkční kontrolní skripty `XX_check_<VM>.bat` pro všechny VM modulu.
10. Ve složce `skripty/` existují funkční dokumentační skripty `XX_doc_<VM>.bat` a šablony v `praxe/XX/doc_templates/` i `discord-bot/templates/XX/`.
11. Webhook URL v dokumentačních skriptech je bezpečně obfuskována.
12. V markdown šablonách se nenachází žádné nezabalené HTML značky typu `<prijmeni>`.
13. Konzolové výstupy (`ipconfig`, `nslookup`) jsou v PowerShell skriptech zachytávány přes `Invoke-ConsoleCmd` s `-join "\`r\`n"` a OEM kódováním.
14. Nikde v kódu, textech ani commitech nejsou použity emoji.
15. Změny jsou otestovány, commitnuty pod autorem `samanbeer <tomas.pachomov@frengp.cz>` a pushnuty na větev `main`.

---

##  Znalostní báze a referenční příručky (Hardening & Sysadmin)

Pro přesné parametry zabezpečení, auditování a ověřené PowerShell one-linery využívejte podklady:

| Referenční modul | Umístění | Kdy využít |
|-------------------|----------|------------|
| **Windows Hardening** | `references/windows-hardening/SKILL.md` | Microsoft Security Baselines, zabezpečení účtů, LAPS, BitLocker, Windows Defender, ASR pravidla, Firewall, vypnutí SMBv1/LLMNR/NetBIOS |
| **CIS Benchmark Hardening** | `references/hardening-windows-endpoint-with-cis-benchmark/SKILL.md` | CIS Level 1 & Level 2 doporučení pro Windows Server / Windows 11, GPO šablony, politiky hesel, auditování a compliance |
| **Sysadmin Toolbox** | `references/sysadmin-toolbox/SKILL.md` | Rychlé vyhledání síťových, diagnostických a systémových nástrojů, shell one-linery (DNS, TCP, procesy, logy) |
