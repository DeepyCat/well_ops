---
name: lab_gen
description: Návod a metodika pro AI asistenty, jak na základě podkladů (např. __zadani.md, _vysledek.md) vygenerovat a integrovat nová praktická cvičení (Modul 02, 03...) do webového portálu OPS.
---

# 🛠️ Metodika generování praktických cvičení (LAB GEN)

Tento dokument slouží jako **standardizovaný návod pro libovolné AI**, které má za úkol vytvořit nebo integrovat další lekci/cvičení (např. `02`, `03`...) v rámci praktické části projektu **OPS (Operační systémy / sítě)**.

---

## 🎯 Cíl a kontext projektu

Webová aplikace **well_ops** je statický výukový portál pro studenty předmětu Operační systémy (běžící na GitHub Pages).
Sekce **Praxe** (`praxe.html`) slouží jako **interaktivní laboratorní průvodce (checklist)**, kde studenti konfigurují virtuální servery a klienty (typicky `SRV1-DC`, `SRV2-FS`, `PC1-WIN`).

Každé cvičení studentům poskytuje:
1. **Přepínání virtuálních strojů** – úkoly se filtrují podle zvoleného stroje.
2. **Postup krok za krokem** – každý krok obsahuje:
   - **Kontext (Co se má udělat)** – srozumitelný cíl úkolu (u parametrů instalace **vždy přehledná tabulka** s aktivním zvýrazněním vybraného VM).
   - **Konfigurace** – přesný příkaz (PowerShell, cmd, reg) s tlačítkem pro zkopírování do schránky.
   - **Ověření (PowerShell)** – testovací příkaz pro kontrolu správnosti.
   - **Co by to mělo vyplivnout** – přesný očekávaný výstup konzole/PowerShellu pro vizuální porovnání.
3. **Ukládání stavu** – splněné úkoly se ukládají do `localStorage` prohlížeče a počítá se celkový progress bar.

---

## 📂 Struktura vstupních dat pro nové cvičení

Uživatel poskytne složku nového cvičení (např. `praxe/02/`), která typicky obsahuje:
- `__zadani.md` – kontext, parametry, tabulky hodnot, co je cílem modulu.
- `_vysledek.md` – kontrolní seznam bod po bodu: jak se pozná hotový stav, jaké příkazy spustit a co přesně mají vrátit.
- *(volitelně)* `_postup.md` / `cast1.md` / `cast2.md` – detailní kroky a návody.

---

## 🏗️ Datová struktura úkolu v JavaScriptu

Pro každý úkol v daném cvičení se vytváří JavaScriptový objekt v poli `taskDefinitions` s těmito povinnými klíči:

```javascript
{
  id: "kebab-case-unikatni-identifikator",
  title: "X. Číslo a název úkolu",
  forVMs: ["SRV1-DC", "SRV2-FS", "PC1-WIN"], // Pole strojů, pro které je úkol relevantní
  
  // 1. CO SE MÁ UDĚLAT (zobrazuje se v boxu Kontext)
  // Může být text, funkce vracející text, nebo HTML řetězec s tabulkou
  what: (vm) => {
    // Pro parametry instalace použijte <div class="params-table-wrapper"><table class="params-table">...</table></div>
    // Jinak vraťte jasný popis, co se má na daném stroji provést
  },

  // 2. KONFIGURACE (příkaz k provedení)
  how: (vm) => {
    // Vrací přesný příkaz nebo postup. Pozor na zpětné apostrofy (escapovat \`)
  },

  // 3. PŘÍKAZ PRO OVĚŘENÍ (PowerShell test)
  verify: (vm) => {
    // Vrací PowerShell příkaz pro ověření stavu
  },

  // 4. OČEKÁVANÝ VÝSTUP (co má konzole vypsat)
  expected: (vm) => {
    // Vrací přesnou textovou ukázku toho, co má PowerShell vypsat
  }
}
```

---

## 📐 Pravidla formátování a UX standardy

Při generování nového cvičení **striktně dodržujte tyto standardy**:

### 1. Parametry instalace a konfigurace VŽDY jako tabulka
Kdykoliv zadání definuje parametry (HW, disky, IP adresy, porty, účty), v poli `what` **nikdy nepište dlouhý odstavec**, ale vygenerujte čistou HTML tabulku s třídou `params-table`:

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
        <td><strong>IP adresa</strong></td>
        <td class="${vm === 'SRV1-DC' ? 'active-col' : ''}">192.168.200.10</td>
        <td class="${vm === 'PC1-WIN' ? 'active-col' : ''}">DHCP (rozsah .100–.200)</td>
      </tr>
    </tbody>
  </table>
</div>
```
### 2. Síťové standardy a číslování pracoviště (Workstation X)
Všechny síťové konfigurace musí být dynamicky vázány na číslo pracoviště studenta (`workstationX`):
- **Adresní rozsah:** `192.168.X.0/24` (např. pro pracoviště 2 je to `192.168.2.0/24`).
- **Výchozí brána (Gateway):** první použitelná adresa v síti – `192.168.X.1`.
- **Servery:** adresace roste s **krokem po 10**:
  - `SRV1-DC`: `192.168.X.10`
  - `SRV2-FS`: `192.168.X.20`
  - DNS server: směřuje vždy na doménový řadič `192.168.X.10` (příp. `127.0.0.1` u samotného DC).
- **Klientské stanice:** adresace s **krokem po 1**:
  - `PC1-WIN`: dynamicky z DHCP rozsahu `192.168.X.100` – `192.168.X.200` (při statickém nastavení začíná od `.100`).

### 3. Pravidla síťových adaptérů (NIC 1, NIC 2, NIC 3)
Virtuální stroje v labu mají 3 síťové adaptéry se striktně daným účelem:
1. **NIC 1 (`Ethernet` / NAT):** **NEŠAHAT!** Slouží pro vnější konektivitu, stahování balíčků, aktivaci Windows a management.
2. **NIC 2 (`Ethernet 1` / Interní VM síť):** **SEM PATŘÍ STATICKÁ IP ADRESA.** Propojuje všechny lokální stroje daného pracoviště (`SRV1-DC`, `SRV2-FS`, `PC1-WIN`).
3. **NIC 3 (`Ethernet 2` / Třídní síť):** Společné propojení se všemi VM v celé učebně (ponechat dle pokynů lektora).
*U každého síťového úkolu musí být uveden banner `.nic-warning-banner` a varování na kontrolu přes `Get-NetAdapter`, protože druhý adaptér se může jmenovat např. `Ethernet 1` nebo `Ethernet 2`.*

### 4. Formátování příkazů jako Terminál (PowerShell Console)
Všechny příkazy k provedení a ověřovací testy se v UI zobrazují v autentickém terminálovém boxu (`.terminal-box`) s okenními tlačítky, titulkem `Administrator: Windows PowerShell`, prefixem řádků `PS C:\>` a integrovaným tlačítkem pro kopírování.

### 5. Očekávaný výstup (`expected`)
- Musí obsahovat reálný výstup cmdletu (včetně názvů vlastností, např. `IPAddress : ...`, `Status : OK`).
- Uvádějte i případné chybové stavy nebo upozornění, pokud jsou v `_vysledek.md` zmíněny.
- Vykresluje se do monospace bloku s jemným zeleným orámováním a ikonou fajfky (`.expected-output-box`).

### 6. Zvláštnosti operačních systémů (Servery vs Klient)
- **Windows Server (Datacenter Desktop Experience)**: Administrátorský účet je vestavěný, role se instalují přes `Install-WindowsFeature`.
- **Windows 11 (Education N)**: Účet Administrator je ve výchozím stavu zakázán (nutno povolit), nepoužívat Microsoft účet (pouze lokální), cmdlety serveru zde nefungují.

### 7. Escapování v šablonách
Jelikož se kód vkládá do JavaScriptových Template Literals (zpětných apostrofů), jakékoliv zpětné apostrofy v PowerShell kódu musí být escapovány jako `\`` a znak dolaru `$`, pokud nemá být interpretován v JS, ošetřete opatrně. Pro kopírování kódu používejte funkci `copyTaskCode(taskId, type, btn)` pro eliminaci chyb s uvozovkami.

---

## 📋 Kontrolní seznam před dokončením lekce

Před odevzdáním nově vygenerovaného cvičení zkontrolujte:
- [ ] Všechny úkoly v `taskDefinitions` odpovídají bodům v `__zadani.md` i `_vysledek.md`.
- [ ] Žádný úkol nemá prázdný `what`, `how`, `verify` ani `expected`.
- [ ] Síťová nastavení respektují číslo pracoviště `workstationX` (`192.168.X.0/24`, GW `.1`, servery `.10`/`.20`, klienti `.100+`).
- [ ] U síťových úkolů je zobrazen `nic-warning-banner` a příkazy cílí na NIC 2 (`Ethernet 1`).
- [ ] U parametrů a tabulkových hodnot je použita tabulka `.params-table` s dynamickým zvýrazněním.
- [ ] Příkazy jsou renderovány v `.terminal-box` formátu Windows PowerShell.
- [ ] Tlačítka pro přepínání VM v záhlaví obsahují všechny stroje, které v tomto cvičení figurují.
- [ ] Všechny PowerShell příkazy jsou syntakticky správné pro daný OS.
- [ ] Je zachován vizuální tmavý motiv a třídy CSS.
