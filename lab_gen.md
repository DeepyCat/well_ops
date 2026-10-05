---
name: lab_gen
description: Komplexní návod a metodika pro AI asistenty, jak na základě podkladů (__zadani.md, _vysledek.md) vygenerovat a plně integrovat nové praktické cvičení (Modul 02, 03...) do dynamického portálu OPS.
---

# 🛠️ Metodika generování a integrace praktických cvičení (LAB GEN)

Tento dokument slouží jako **komplexní a závazný standard pro libovolné AI**, které má za úkol vytvořit, zpracovat nebo integrovat další lekci/cvičení (např. `Modul 02: DHCP`, `Modul 03: DNS`...) v rámci praktické části projektu **OPS (Operační systémy / sítě)**.

---

## 🎯 Architektura a princip fungování webu

Aplikace běží jako **dynamický webový portál** s centrální stránkou [praxe.html](file:///D:/%21Documents/VSCode/well_ops/praxe.html):
1. **Přepínač zadání (Module Switcher):** Vlevo nahoře v hlavičce umožňuje studentům přepínat mezi jednotlivými moduly. Výběr se promítá do URL (`praxe.html?modul=02`).
2. **Dynamická data modulů:** Každé cvičení má vlastní složku v `praxe/XX/` (např. `praxe/02/`) obsahující definici úkolů `tasks.js`, stav ověření `verified.json`, formátované zadání a vzorové řešení.
3. **Centrální registr:** Všechny moduly jsou registrovány v `praxe/modules.js` a `praxe/modules.json`.
4. **Per-VM ověření (`verified.json`):** Každý modul má svůj soubor `verified.json`, kde je pro každý server hodnota `true` / `false`. Pokud je `true`, na webu se zobrazí zelený štítek **„Ověřeno OK“** a zelený banner. Pokud je `false`, štítek a banner se nezobrazují.

---

## 📂 Co VŠE musí AI vytvořit při požadavku „Zpracuj X. zadání (Modul XX)“

Při zpracování nového modulu (např. `02`) AI **VŽDY** provede následující kroky v tomto pořadí:

### Krok 1: Vytvoření složky `praxe/XX/` a souborů zadání
Vytvořte složku `praxe/XX/` (např. `praxe/02/`) a v ní:
1. `__zadani.md` a jeho identické zrcadlo `_zadani.md` (Markdown zadání s kontextem, tabulkami parametrů a cílovým stavem).
2. `__zadani.html` a `_zadani.html` (plnohodnotná, stylová HTML stránka sladěná s jednotným OPS tmavým tématem `#1a1a1a`, červenými tlačítky `--accent: #ff5555`, breadcrumbs, tlačítky pro kopírování kódů a SVG ikonami bez emoji).
3. `_vysledek.md` a jeho identická zrcadla `__reseni.md` a `_reseni.md` (kontrolní seznam bod po bodu: jak se pozná, že je úkol splněný, s přesnými PowerShell testy a očekávanými výstupy).
4. `__reseni.html`, `_reseni.html` a `_vysledek.html` (plnohodnotná HTML stránka vzorového řešení v jednotném OPS tématu s červenými tlačítky).

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

---

## 📐 Striktní pravidla pro PowerShell příkazy a formátování

Při vytváření úkolů **VŽDY bez výjimky** dodržujte tato pravidla:

### 1. ZÁKAZ HVĚZDIČEK V `-InterfaceAlias`
- ❌ **NIKDY NEPOUŽÍVAT:** `Get-NetIPAddress -InterfaceAlias Ethernet*1` ani `Ethernet*`.
- ✅ **VŽDY POUŽÍVAT PŘESNÝ NÁZEV:** `Get-NetIPAddress -InterfaceAlias Ethernet1` (případně `"Ethernet1"`). V prostředí VMware/CyLab se interní adaptér NIC 2 jmenuje `Ethernet1` bez hvězdiček a bez mezer.

### 2. ŽÁDNÉ HARDCODED PRODUKTOVÉ KLÍČE
- ❌ **NIKDY NEVKLÁDAT:** konkrétní licenční klíče Windows do kódu ani do dokumentace.
- ✅ **VŽDY ODKÁZAT NA TEAMS:** Použijte zástupný text `<LAB-KEY-Z-TEAMS>` a napište:
  > *„Produktový klíč (LAB KEY) si zkopírujte přímo ze zadání v Microsoft Teams.“*

### 3. ZÁKAZ EMOJI V HTML DOKUMENTACI
- ❌ **NIKDY NEPOUŽÍVAT:** Unicode smajlíky jako 🚀, 💻, ⚙️, ✅.
- ✅ **VŽDY POUŽÍVAT ČISTÉ VEKTOROVÉ SVG:** Používejte inline SVG ikony (Lucide / Feather styl, `width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"`).

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

---

## 🔍 Ověřovací checklist pro AI před odevzdáním práce

Než označíte úkol za dokončený, zkontrolujte v terminálu:
1. `praxe/XX/verified.json` existuje a má platný JSON formát.
2. `praxe/XX/tasks.js` je syntakticky validní JS (`node -e "new Function(fs.readFileSync('praxe/XX/tasks.js'))"`).
3. `praxe/modules.js` a `praxe/modules.json` obsahují nový modul.
4. `praxe.html` má v `<head>` tag `<script src="praxe/XX/tasks.js"></script>`.
5. V `praxe.html` nedošlo k syntaktické chybě v JS.
6. Žádný příkaz neobsahuje `Ethernet*`.
7. Žádné heslo ani klíč nejsou v rozporu se zadáním (klíče z Teams, heslo `Pa55w.rd`).
8. Změny jsou otestovány, commitnuty a pushnuty na větev `main` (`git pull --rebase origin main && git push origin main`).
