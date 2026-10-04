---
name: lab_gen
description: Návod a metodika pro AI asistenty, jak na základě podkladů (__zadani.md, _vysledek.md) vygenerovat a integrovat nová praktická cvičení (Modul 02, 03...) do dynamického webového portálu OPS.
---

# 🛠️ Metodika generování praktických cvičení (LAB GEN)

Tento návod definuje standardy a konkrétní kroky, které **každý AI asistent musí provést**, jakmile uživatel požádá o zpracování nebo vytvoření nového cvičení (např. *„Zpracuj 2. zadání (Modul 02)“*).

Podrobná specifikace se nachází v hlavním souboru projektu: [lab_gen.md](../../../lab_gen.md).

---

## 🎯 Co VŠE musí AI vytvořit pro nové zadání (Modul XX):

### 1. Složka cvičení `praxe/XX/`
Vytvořit složku `praxe/XX/` (např. `praxe/02/`):
- `__zadani.md` a `_zadani.md` – textové zadání cvičení.
- `__zadani.html` a `_zadani.html` – stylizovaná HTML verze v GitHub dark-theme s kopírovacími tlačítky a SVG ikonami (žádné emoji!).
- `_vysledek.md`, `__reseni.md` a `_reseni.md` – kontrolní seznam vzorového řešení bod po bodu.
- `__reseni.html`, `_reseni.html` a `_vysledek.html` – stylizovaná HTML verze řešení.

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

---

## ⚠️ Kritická pravidla a nejčastější chyby (POZOR):

1. **ZÁKAZ HVĚZDIČEK V INTERFACE ALIAS:**
   - ❌ Nikdy nepoužívejte `Ethernet*1` ani `Ethernet*`.
   - ✅ Vždy uvádějte přesný název `Ethernet1` (NIC 2 v CyLabu) bez hvězdičky!
2. **ŽÁDNÉ HARDCODED PRODUKTOVÉ KLÍČE:**
   - ❌ Nikdy nevkládejte reálné licenční klíče do repozitáře.
   - ✅ Vždy odkažte studenty na zadání v **Microsoft Teams** (`slmgr.vbs /ipk <LAB-KEY-Z-TEAMS>`).
3. **ŽÁDNÉ EMOJI V HTML SOUBORECH:**
   - Používejte výhradně čisté inline SVG ikony.
4. **PARAMETRY VŽDY V TABULCE `.params-table`:**
   - Tabulky v `what` musí mít třídy `.params-table-wrapper` a `.params-table` a zvýrazňovat vybraný stroj třídou `.active-col` / `.active-row`.
5. **DYNAMICKÉ ČÍSLOVÁNÍ PRACOVIŠTĚ (`wsX`):**
   - Všechny IP adresyvažte na proměnnou `wsX` (`192.168.${x}.0/24`, brána `192.168.${x}.1`, servery `.10`/`.20`, klienti `.100–.200`).
6. **NIC VAROVNÝ BANNER:**
   - U síťových úkolů vždy zobrazte `.nic-warning-banner` připomínající zapnutí NIC 2 v CyLabu a pravidlo *„na NIC 1 (NAT) nešahat“*.

---

## 📚 Znalostní báze a referenční příručky (Hardening & Sysadmin)

Pro přesné parametry zabezpečení, auditování a ověřené PowerShell one-linery využívejte podklady:

| Referenční modul | Umístění | Kdy využít |
|-------------------|----------|------------|
| **Windows Hardening** | `references/windows-hardening/SKILL.md` | Microsoft Security Baselines, zabezpečení účtů, LAPS, BitLocker, Windows Defender, ASR pravidla, Firewall, vypnutí SMBv1/LLMNR/NetBIOS |
| **CIS Benchmark Hardening** | `references/hardening-windows-endpoint-with-cis-benchmark/SKILL.md` | CIS Level 1 & Level 2 doporučení pro Windows Server / Windows 11, GPO šablony, politiky hesel, auditování a compliance |
| **Sysadmin Toolbox** | `references/sysadmin-toolbox/SKILL.md` | Rychlé vyhledání síťových, diagnostických a systémových nástrojů, shell one-linery (DNS, TCP, procesy, logy) |
