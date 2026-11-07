# Modul 0 — Příprava — ověření

> Šablona verze: 2026-10-03 · Vyplňte všechna místa `DOPLNIT`. **Nadpisy ani ID neměňte** — podle nich se vaše práce porovnává se vzorovým řešením. Pravidla viz [pravidla práce s vaultem](../../00-PREREKVIZITY/10-pravidla-prace-s-vaultem.md).

Ke každému bodu z [výsledku modulu](../../Modul%200%20Příprava/09-vysledek.md) vložte **důkaz**, že je splněný. Textové výpisy vkládejte i s promptem (datum, čas, účet, počítač), screenshoty s viditelnými hodinami na hlavním panelu.

## Údaje o řešiteli

| Položka | Hodnota |
|---|---|
| Jméno a příjmení | DOPLNIT |
| Třída | DOPLNIT |
| Datum vypracování | DOPLNIT |
| Vaše doména | DOPLNIT (např. `novak.cyberschool.internal`) |

## SRV1-DC

### M0-SRV1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji hned po dokončení přípravy. UUID virtuálního stroje je jedinečné pro každou instalaci. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
```

**M0-SRV1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V1 Parametry virtuálního stroje

**M0-SRV1.V1-D1** – Důkaz: Nastavení VM v hypervizoru: počet vCPU, velikost RAM a systémového disku

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M0-SRV1.V2 Edice a instalace

**M0-SRV1.V2-D1** – Důkaz: Název produktu a úroveň instalace (Desktop Experience, ne Server Core)

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V3 Hostname

**M0-SRV1.V3-D1** – Důkaz: Jméno počítače

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V4 Statická IPv4

**M0-SRV1.V4-D1** – Důkaz: IP adresa s prefixem, výchozí brána, DNS server a původ adresy (ruční, ne DHCP)

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V5 Účet administrátora

**M0-SRV1.V5-D1** – Důkaz: Seznam lokálních účtů — žádný Microsoft účet, žádný další administrátor

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V6 Jazyk rozhraní a region

**M0-SRV1.V6-D1** – Důkaz: Kultura (region), system locale a home location

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V7 Formáty data, času a měny

**M0-SRV1.V7-D1** – Důkaz: Aktuální datum a čas v českém formátu a ukázka formátu měny

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V8 Časové pásmo

**M0-SRV1.V8-D1** – Důkaz: Nastavené časové pásmo

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V9 Klávesnice

**M0-SRV1.V9-D1** – Důkaz: Seznam jazyků/metod vstupu uživatele

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V10 Soukromí

**M0-SRV1.V10-D1** – Důkaz: Hodnoty zásad pro telemetrii, polohu a reklamní ID

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V11 Aktivace

**M0-SRV1.V11-D1** – Důkaz: Stav aktivace Windows

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV1.V13 PowerShell prompt

**M0-SRV1.V13-D1** – Důkaz: Nové okno PowerShellu s promptem (datum, čas, účet, počítač) a kontrola, že nastavení platí pro celý počítač

```text
DOPLNIT
```

- [ ] Hotovo

## SRV2-FS

> SRV2-FS připravujete až před Modulem 6 — tuto část vyplňte a odevzdejte znovu s Modulem 6.

### M0-SRV2.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji hned po dokončení přípravy. UUID virtuálního stroje je jedinečné pro každou instalaci. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
```

**M0-SRV2.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V1 Parametry virtuálního stroje

**M0-SRV2.V1-D1** – Důkaz: Nastavení VM v hypervizoru: počet vCPU, velikost RAM a systémového disku

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

**M0-SRV2.V1-D2** – Důkaz: Uvnitř serveru je vidět systémový disk a 5 dalších disků po ~10 GB, zatím neinicializovaných

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V2 Edice a instalace

**M0-SRV2.V2-D1** – Důkaz: Název produktu a úroveň instalace (Desktop Experience, ne Server Core)

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V3 Hostname

**M0-SRV2.V3-D1** – Důkaz: Jméno počítače

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V4 Statická IPv4

**M0-SRV2.V4-D1** – Důkaz: IP adresa s prefixem, výchozí brána, DNS server a původ adresy (ruční, ne DHCP)

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V5 Účet administrátora

**M0-SRV2.V5-D1** – Důkaz: Seznam lokálních účtů — žádný Microsoft účet, žádný další administrátor

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V6 Jazyk rozhraní a region

**M0-SRV2.V6-D1** – Důkaz: Kultura (region), system locale a home location

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V7 Formáty data, času a měny

**M0-SRV2.V7-D1** – Důkaz: Aktuální datum a čas v českém formátu a ukázka formátu měny

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V8 Časové pásmo

**M0-SRV2.V8-D1** – Důkaz: Nastavené časové pásmo

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V9 Klávesnice

**M0-SRV2.V9-D1** – Důkaz: Seznam jazyků/metod vstupu uživatele

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V10 Soukromí

**M0-SRV2.V10-D1** – Důkaz: Hodnoty zásad pro telemetrii, polohu a reklamní ID

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V11 Aktivace

**M0-SRV2.V11-D1** – Důkaz: Stav aktivace Windows

```text
DOPLNIT
```

- [ ] Hotovo

### M0-SRV2.V13 PowerShell prompt

**M0-SRV2.V13-D1** – Důkaz: Nové okno PowerShellu s promptem (datum, čas, účet, počítač) a kontrola, že nastavení platí pro celý počítač

```text
DOPLNIT
```

- [ ] Hotovo

## PC1-WIN

> PC1-WIN připravujete až před Modulem 2 — tuto část vyplňte a odevzdejte znovu s Modulem 2.

### M0-PC1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji hned po dokončení přípravy. UUID virtuálního stroje je jedinečné pro každou instalaci. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
```

**M0-PC1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V1 Parametry virtuálního stroje

**M0-PC1.V1-D1** – Důkaz: Nastavení VM v hypervizoru: vCPU, RAM, disk

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M0-PC1.V2 Edice

**M0-PC1.V2-D1** – Důkaz: Název produktu

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V3 Hostname

**M0-PC1.V3-D1** – Důkaz: Jméno počítače

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V4 Síť

**M0-PC1.V4-D1** – Důkaz: Síťová karta je nastavená na automatickou konfiguraci (adresa není ruční)

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V5 Účet administrátora

**M0-PC1.V5-D1** – Důkaz: Seznam lokálních účtů s jejich stavem

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V6 Jazyk rozhraní a region

**M0-PC1.V6-D1** – Důkaz: Kultura, system locale a home location

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V7 Formáty data, času a měny

**M0-PC1.V7-D1** – Důkaz: Datum, čas a ukázka měny v českém formátu

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V8 Časové pásmo

**M0-PC1.V8-D1** – Důkaz: Nastavené časové pásmo

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V9 Klávesnice

**M0-PC1.V9-D1** – Důkaz: Seznam jazyků/metod vstupu

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V10 Soukromí

**M0-PC1.V10-D1** – Důkaz: Hodnoty zásad pro telemetrii, polohu a reklamní ID

```text
DOPLNIT
```

**M0-PC1.V10-D2** – Důkaz: Settings → Privacy & security: Find my device je vypnuté

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M0-PC1.V11 Aktivace

**M0-PC1.V11-D1** – Důkaz: Stav aktivace Windows

```text
DOPLNIT
```

- [ ] Hotovo

### M0-PC1.V12 Lokální účet

**M0-PC1.V12-D1** – Důkaz: Settings → Accounts → Your info: typ účtu

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M0-PC1.V13 PowerShell prompt

**M0-PC1.V13-D1** – Důkaz: Nové okno PowerShellu s promptem a kontrola nastavení pro celý počítač

```text
DOPLNIT
```

- [ ] Hotovo
