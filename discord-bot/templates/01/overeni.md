# Modul 1 — Domain Controller — ověření

> Šablona verze: 2026-10-03 · Vyplňte všechna místa `DOPLNIT`. **Nadpisy ani ID neměňte** — podle nich se vaše práce porovnává se vzorovým řešením. Pravidla viz [pravidla práce s vaultem](../../00-PREREKVIZITY/10-pravidla-prace-s-vaultem.md).

Ke každému bodu z [výsledku modulu](../../Modul%201%20Domain%20Controller/09-vysledek.md) vložte **důkaz**, že je splněný. Textové výpisy vkládejte i s promptem (datum, čas, účet, počítač), screenshoty s viditelnými hodinami na hlavním panelu.

## Údaje o řešiteli

| Položka | Hodnota |
|---|---|
| Jméno a příjmení | DOPLNIT |
| Třída | DOPLNIT |
| Datum vypracování | DOPLNIT |
| Vaše doména | DOPLNIT (např. `novak.cyberschool.internal`) |

## SRV1-DC

### M1-SRV1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na SRV1-DC po povýšení na řadič domény. SID domény je jedinečný pro každou instalaci lesa. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-ADDomain).DNSRoot
(Get-ADDomain).DomainSID.Value
```

**M1-SRV1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M1-SRV1.V1 Server dostupný v síti

**M1-SRV1.V1-D1** – Důkaz: IP konfigurace serveru

```text
DOPLNIT
```

- [ ] Hotovo

### M1-SRV1.V2 Role AD DS a DNS

**M1-SRV1.V2-D1** – Důkaz: Server Manager — Dashboard s rolemi AD DS a DNS bez chyb

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M1-SRV1.V3 Server je řadičem domény

**M1-SRV1.V3-D1** – Důkaz: Server Manager — Local Server, položka Domain s vaší doménou

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M1-SRV1.V4 Role FSMO a Global Catalog

**M1-SRV1.V4-D1** – Důkaz: Držitelé všech pěti rolí FSMO

```text
DOPLNIT
```

**M1-SRV1.V4-D2** – Důkaz: Vlastnosti řadiče domény: doména, les, Global Catalog, role

```text
DOPLNIT
```

- [ ] Hotovo

### M1-SRV1.V5 Nástroje pro správu domény

**M1-SRV1.V5-D1** – Důkaz: ADUC s otevřenou vaší doménou a výchozími kontejnery

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M1-SRV1.V6 Restart nic nerozbije

**M1-SRV1.V6-D1** – Důkaz: Přihlášený účet po restartu a stav rolí

```text
DOPLNIT
```

- [ ] Hotovo
