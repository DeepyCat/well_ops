# Modul 3 — DNS — ověření

> Šablona verze: 2026-11-01 · Vyplňte všechna místa `DOPLNIT`. **Nadpisy ani ID neměňte** — podle nich se vaše práce porovnává se vzorovým řešením. Pravidla viz [pravidla práce s vaultem](../../00-PREREKVIZITY/10-pravidla-prace-s-vaultem.md).

Ke každému bodu z [výsledku modulu](../../Modul%203%20DNS/09-vysledek.md) vložte **důkaz**, že je splněný. Textové výpisy vkládejte i s promptem (datum, čas, účet, počítač), screenshoty s viditelnými hodinami na hlavním panelu.

## Údaje o řešiteli

| Položka | Hodnota |
|---|---|
| Jméno a příjmení | DOPLNIT |
| Třída | DOPLNIT |
| Datum vypracování | DOPLNIT |
| Číslo vašeho pracoviště (N) | DOPLNIT (síť `192.168.N.0/24`) |
| Vaše doména | DOPLNIT (např. `novak.cyberschool.internal`) |

## SRV1-DC

### M3-SRV1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji po dokončení modulu. UUID virtuálního stroje je jedinečné pro každou instalaci, SID domény pro každou doménu a IP adresa obsahuje číslo vašeho pracoviště. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-ADDomain).DNSRoot
(Get-ADDomain).DomainSID.Value
```

**M3-SRV1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M3-SRV1.V1 Dopředná zóna obsahuje správné záznamy

**M3-SRV1.V1-D1** – Důkaz: Seznam záznamů v zóně prijmeni.cyberschool.internal (SRV1-DC, SRV2-FS, PC1-WIN a alias ftp)

```text
DOPLNIT
```

**M3-SRV1.V1-D2** – Důkaz: Screenshot DNS Manageru s dopřednou zónou

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M3-SRV1.V2 Reverzní zóna a PTR záznamy

**M3-SRV1.V2-D1** – Důkaz: Seznam reverzních zón (typ, replikace, dynamické aktualizace)

```text
DOPLNIT
```

**M3-SRV1.V2-D2** – Důkaz: PTR záznamy v reverzní zóně

```text
DOPLNIT
```

- [ ] Hotovo

## PC1-WIN

### M3-PC1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji po dokončení modulu. UUID virtuálního stroje je jedinečné pro každou instalaci, SID domény pro každou doménu a IP adresa obsahuje číslo vašeho pracoviště. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.*').IPAddress
```

**M3-PC1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M3-PC1.V1 Klient používá správný DNS server

**M3-PC1.V1-D1** – Důkaz: Výstup ipconfig /all: DNS server a DNS suffix

```text
DOPLNIT
```

- [ ] Hotovo

### M3-PC1.V2 Překlad jména na adresu

**M3-PC1.V2-D1** – Důkaz: Výstup nslookup srv2-fs.prijmeni.cyberschool.internal

```text
DOPLNIT
```

- [ ] Hotovo

### M3-PC1.V3 Překlad adresy na jméno

**M3-PC1.V3-D1** – Důkaz: Výstup nslookup 192.168.N.20

```text
DOPLNIT
```

- [ ] Hotovo

### M3-PC1.V4 Alias ftp funguje

**M3-PC1.V4-D1** – Důkaz: Výstup nslookup ftp.prijmeni.cyberschool.internal

```text
DOPLNIT
```

- [ ] Hotovo

### M3-PC1.V5 Nový záznam se projeví

**M3-PC1.V5-D1** – Důkaz: Ping nebo nslookup jménem nově přidaného záznamu (např. testovacího PC)

```text
DOPLNIT
```

- [ ] Hotovo
