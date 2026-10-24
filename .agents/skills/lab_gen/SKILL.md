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

---

##  Kritická pravidla a nejčastější chyby (POZOR):

1. **ZÁKAZ HVĚZDIČEK V INTERFACE ALIAS:**
   -  Nikdy nepoužívejte `Ethernet*1` ani `Ethernet*`.
   -  Vždy uvádějte přesný název `Ethernet1` (NIC 2 v CyLabu) bez hvězdičky!
2. **ŽÁDNÉ HARDCODED PRODUKTOVÉ KLÍČE:**
   -  Nikdy nevkládejte reálné licenční klíče do repozitáře.
   -  Vždy odkažte studenty na zadání v **Microsoft Teams** (`slmgr.vbs /ipk <LAB-KEY-Z-TEAMS>`).
3. **ŽÁDNÉ EMOJI V HTML SOUBORECH:**
   - Používejte výhradně čisté inline SVG ikony.
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

---

##  Znalostní báze a referenční příručky (Hardening & Sysadmin)

Pro přesné parametry zabezpečení, auditování a ověřené PowerShell one-linery využívejte podklady:

| Referenční modul | Umístění | Kdy využít |
|-------------------|----------|------------|
| **Windows Hardening** | `references/windows-hardening/SKILL.md` | Microsoft Security Baselines, zabezpečení účtů, LAPS, BitLocker, Windows Defender, ASR pravidla, Firewall, vypnutí SMBv1/LLMNR/NetBIOS |
| **CIS Benchmark Hardening** | `references/hardening-windows-endpoint-with-cis-benchmark/SKILL.md` | CIS Level 1 & Level 2 doporučení pro Windows Server / Windows 11, GPO šablony, politiky hesel, auditování a compliance |
| **Sysadmin Toolbox** | `references/sysadmin-toolbox/SKILL.md` | Rychlé vyhledání síťových, diagnostických a systémových nástrojů, shell one-linery (DNS, TCP, procesy, logy) |
