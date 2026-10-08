---
aliases: [BIOS/UEFI]
---

# BIOS / UEFI

![[cea47890365e233c9c8fcbfdfd2d601f4d94485c1b73dd7312f27d4c9241f40c.png]]

Základní deska spojuje všechny díly počítače (procesor, disky, sběrnice, periferie…), ale jednotlivé prvky se mezi sebou musí "domluvit". To zajišťuje **[[BIOS]]** (Basic Input/Output System) – oživí desku a sladí parametry jejích komponent, takže deska funguje s hardwarem různých výrobců.

BIOS je v podstatě sada ovladačů základních komponent systému a funguje jako **"překladač"** mezi hardwarem a operačním systémem – vůči OS se tváří "stále stejně" bez ohledu na připojený hardware. Např. OS vidí disk jako úložiště dat, ale nemusí znát jeho konkrétní parametry (počet hlav, sektorů…).

## Tři vrstvy BIOSu

1. **Flash ROM** – vlastní program BIOS a jeho data (info o možných komponentách desky), lze přepsat programem flash
2. **CMOS** – nastavení provedená v Setupu, trvale zálohovaná knoflíkovou lithiovou baterií
3. **Firmware** – informace uložené v ROM pamětech chipsetu, procesoru a rozšiřujících karet; jejich ovladače se načtou při startu (jsou součástí Windows)

Tyto tři vrstvy zaručují komunikaci mezi aplikací a OS napříč různým hardwarem – BIOS si vytváří **[[API]]** (sadu příkazů a funkcí), takže software komunikuje jen s operačním systémem, nikdy přímo s hardwarem.

**Čip BIOSu na základní desce:**

![[dfc7221eaa262515d69e96af0a4515e0c400412805d21c771f029fbb9ff85394.png]]

## Výrobci BIOSu

AMI BIOS, AWARD BIOS (fúzoval s Phoenixem), Phoenix BIOS.

**AMI BIOS**

![[36b64b40d37c1254b75b463ff4210d8aac493786abb57b0226990d0e3c587f45.png]]

**AWARD BIOS** (fúzoval s Phoenixem)

![[b8d9ffc9b70cfd3e4741b469a0e66d1d453a929ea7d0b361ba5e1050f3921c82.gif]]

**Phoenix BIOS**

![[2ab7b5d53443d396999416a2782424a2303e116b8f2d163d6bbfe85a14ac7fe5.png]]

## Start počítače a POST

1. **Inicializace** – BIOS projde sloty (PCI, PCIe, patice procesorů/pamětí), přečte z jejich ROM informace a vytvoří API. Data si uloží do CMOS (tzv. ESCD), aby to nemusel dělat při každém startu.
2. **[[POST]] (Power On Self Test)** – BIOS otestuje hardware. Při poruše se testy nedokončí a BIOS o tom informuje (hláška na obrazovce nebo beep kód).
3. **Předání řízení zavaděči** – po úspěšném POSTu BIOS najde zavaděč OS (na disku, disketě, CD/DVD, LAN, flash disku), ten načte operační systém a jeho ovladače pro komunikaci s API.

**Informace o grafické kartě při startu:**

![[c3a06841a295f687abca15d3963e4695dd50ce1d92f31b04122b8c6dc60520a1.png]]

### Identifikační údaje na obrazovce

- Výrobce BIOSu (první řádek)
- **BIOS Release Number** – verze BIOSu
- **BIOS Reference Number** – kód pro výrobce desky a čipset (odlišný formát pro každého výrobce)

![[04289a41484875f277c22fda044f3f0b26d2454cd5f38e77720c6cc408458fd8.png]]

## Setup

Program pro definování hodnot BIOSu – volba hardwaru, nastavení parametrů, ladění spolupráce komponent. Nespouští se z OS, ale během startu (stiskem určité klávesy, viz obrazovka při startu nebo manuál desky).

**BIOS Setup**

![[c66a7a04f6e01b2b6907a074784c87e927742393ebe217a038b9d156c1cb877f.jpg]]

**UEFI BIOS**

![[2ef99f397089908bc41ec9bd00058fd509d4b03adcc5e37f7d552d17fb08c21a.jpg]]

## Flash (upgrade) BIOSu

![[c4e34d8e49f08db5cb2b34c5abdedd1c4f482b09f9151d04cecc76a393fa2e91.jpeg]]

**Důvody:** lepší podpora ACPI, větší podporovaná kapacita disku, rychlejší I/O porty, výměna procesoru, podpora AGP…

**Postup:** potřeba program pro přepis + datový soubor s novým BIOSem.

### Rizika

1. **Přerušení zápisu** – nesmí se stát (výpadek napájení zničí BIOS) → dělat na PC se zálohovacím zdrojem (UPS)
2. **Špatný datový soubor** – přepsání nesprávným souborem BIOS zničí; nutná přesná identifikace desky a verze

### Způsoby flashování

| Metoda | Popis |
| :-- | :-- |
| **FLASH** (např. AWDFLASH.EXE) | spustí se ze startovací diskety |
| **EZ Flash** | vestavěná utilita, spouští se během POST (např. Alt+F) |
| **UEFI Flash** | přímo v UEFI rozhraní |
| **Windows Flash Live Update** | přímo z Windows, jen u velkých výrobců PC |

**FLASH**

![[8ab09708ffb23301f10f6099ddcddff3c429a50a1772879bd910d76e9797438b.png]]

**EZ Flash**

![[915a588aa3ac29100de1d3328d147a9247e0d61f7b691bf7cc5eaa7aa380dcb4.png]]

**UEFI Flash**

![[4f28b68ad369c5994e50b824d860a2bad318e8092b8dd174dc5f830b21a17490.png]]

**Windows Flash Live Update**

![[d4c95a18f181fc61d079c8859fef42a54491d119bfbd88311046de1f5e3ba192.png]]

### Když se upgrade nepovede

Počítač nenastartuje (černá obrazovka). Řešení:

- **Požádat dodavatele** o přepálení BIOSu (nejjistější, ale déle trvá)
- **Vlastní oprava** – vyjmout funkční čip BIOSu z identické základní desky z jiného PC, vložit do vadného, nastartovat, za běhu (BIOS je už v cache L2) vyměnit zpátky za vadný čip a přeflashovat ho ze zálohy

## Zjištění verze BIOSu

Ve Windows: `systeminfo`, Systémové informace, `regedit`, nebo přímo v UEFI BIOSu.

**systeminfo**

![[0eef04cf1070768cbb855f28e1e0f846b28f914a2b99cc025dd712baec64bf71.png]]

**Systémové informace**

![[fa949a7ed568932fc28261c8f4a2b558f6ec35c93337746c01e379700aecd0d8.png]]

**regedit**

![[938dedc6ed275696a245ccaf547373eaeba3ddf49880d0ac2ac7489a29f6e85f.png]]

**UEFI BIOS**

![[fc9ff3f063c7fd4137eab0b7bf38d9e721ca69d51de519cbcdbe803dc86ab7b1.jpg]]

**Souvisí:** [[BIOS]], [[firmware]], [[API]], [[bootstrap]], [[POST]]
