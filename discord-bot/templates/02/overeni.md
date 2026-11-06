# Modul 2 — DHCP — ověření

> Šablona verze: 2026-10-17 · Vyplňte všechna místa `DOPLNIT`. **Nadpisy ani ID neměňte** — podle nich se vaše práce porovnává se vzorovým řešením. Pravidla viz [pravidla práce s vaultem](../../00-PREREKVIZITY/10-pravidla-prace-s-vaultem.md).

Ke každému bodu z [výsledku modulu](../../Modul%202%20DHCP/09-vysledek.md) vložte **důkaz**, že je splněný. Textové výpisy vkládejte i s promptem (datum, čas, účet, počítač), screenshoty s viditelnými hodinami na hlavním panelu.

## Údaje o řešiteli

| Položka | Hodnota |
|---|---|
| Jméno a příjmení | DOPLNIT |
| Třída | DOPLNIT |
| Datum vypracování | DOPLNIT |
| Číslo vašeho pracoviště (N) | DOPLNIT (síť `192.168.N.0/24`) |
| Vaše doména | DOPLNIT (např. `novak.cyberschool.internal`) |

## SRV1-DC

### M2-SRV1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji po dokončení modulu. UUID virtuálního stroje je jedinečné pro každou instalaci a IP adresa obsahuje číslo vašeho pracoviště. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.*').IPAddress
```

**M2-SRV1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M2-SRV1.V1 Role je nainstalovaná a autorizovaná

**M2-SRV1.V1-D1** – Důkaz: Server Manager — role DHCP bez varování a DHCP konzole se zeleně označeným serverem

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

**M2-SRV1.V1-D2** – Důkaz: Seznam autorizovaných DHCP serverů v doméně

```text
DOPLNIT
```

- [ ] Hotovo

### M2-SRV1.V2 Scope je aktivní

**M2-SRV1.V2-D1** – Důkaz: Vlastnosti scope: název, rozsah, maska a stav

```text
DOPLNIT
```

- [ ] Hotovo

### M2-SRV1.V3 Options přidělené klientům

**M2-SRV1.V3-D1** – Důkaz: Hodnoty options scope (router, DNS server, doménové jméno)

```text
DOPLNIT
```

- [ ] Hotovo

### M2-SRV1.V4 Klient má lease

**M2-SRV1.V4-D1** – Důkaz: Seznam leases ve scope — jeden záznam pro PC1-WIN bez duplicit

```text
DOPLNIT
```

- [ ] Hotovo

## PC1-WIN

### M2-PC1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji po dokončení modulu. UUID virtuálního stroje je jedinečné pro každou instalaci a IP adresa obsahuje číslo vašeho pracoviště. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.*').IPAddress
```

**M2-PC1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M2-PC1.V1 Klient dostal adresu automaticky

**M2-PC1.V1-D1** – Důkaz: Výstup ipconfig /all: IP adresa, maska, brána, DNS server, DNS suffix a DHCP server

```text
DOPLNIT
```

**M2-PC1.V1-D2** – Důkaz: Původ adresy síťové karty

```text
DOPLNIT
```

- [ ] Hotovo

### M2-PC1.V2 Obnovení adresy funguje

**M2-PC1.V2-D1** – Důkaz: Výstup ipconfig /release a ipconfig /renew bez chyby, klient znovu dostal adresu ze scope

```text
DOPLNIT
```

- [ ] Hotovo
