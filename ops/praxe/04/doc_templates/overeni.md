# Modul 4 — Active Directory — ověření

> Šablona verze: 2026-11-15 · Vyplňte všechna místa `DOPLNIT`. **Nadpisy ani ID neměňte** — podle nich se vaše práce porovnává se vzorovým řešením. Pravidla viz [pravidla práce s vaultem](../../00-PREREKVIZITY/10-pravidla-prace-s-vaultem.md).

Ke každému bodu z [výsledku modulu](../../Modul%204%20Active%20Directory/09-vysledek.md) vložte **důkaz**, že je splněný. Textové výpisy vkládejte i s promptem (datum, čas, účet, počítač), screenshoty s viditelnými hodinami na hlavním panelu.

## Údaje o řešiteli

| Položka | Hodnota |
|---|---|
| Jméno a příjmení | DOPLNIT |
| Třída | DOPLNIT |
| Datum vypracování | DOPLNIT |
| Číslo vašeho pracoviště (N) | DOPLNIT (síť `192.168.N.0/24`) |
| Vaše doména | DOPLNIT (např. `novak.cyberschool.internal`) |

## SRV1-DC

### M4-SRV1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji po dokončení modulu. UUID virtuálního stroje je jedinečné pro každou instalaci, SID domény pro každou doménu a doména obsahuje vaše příjmení. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-ADDomain).DNSRoot
(Get-ADDomain).DomainSID.Value
```

**M4-SRV1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M4-SRV1.V1 Struktura OU

**M4-SRV1.V1-D1** – Důkaz: Výpis OU domény (Get-ADOrganizationalUnit)

```text
DOPLNIT
```

**M4-SRV1.V1-D2** – Důkaz: ADUC s rozbaleným stromem OU Skola (View → Advanced Features)

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M4-SRV1.V2 Skupiny

**M4-SRV1.V2-D1** – Důkaz: Výpis skupin z OU Skupiny: jméno, rozsah, typ

```text
DOPLNIT
```

- [ ] Hotovo

### M4-SRV1.V3 Členství ve skupinách

**M4-SRV1.V3-D1** – Důkaz: Členové GG_Ucitele a GG_PK_Informatika (Get-ADGroupMember)

```text
DOPLNIT
```

**M4-SRV1.V3-D2** – Důkaz: Členové GG_Zamestnanci přímo a rekurzivně

```text
DOPLNIT
```

**M4-SRV1.V3-D3** – Důkaz: Členové GG_Studenti přímo a rekurzivně

```text
DOPLNIT
```

**M4-SRV1.V3-D4** – Důkaz: Členové oborových skupin a GG_Vedeni, GG_Sekretariat

```text
DOPLNIT
```

- [ ] Hotovo

### M4-SRV1.V4 Účty

**M4-SRV1.V4-D1** – Důkaz: Výpis uživatelů v OU Skola: jméno, Enabled, DistinguishedName

```text
DOPLNIT
```

- [ ] Hotovo

### M4-SRV1.V6 Domovské složky

**M4-SRV1.V6-D1** – Důkaz: Sdílení home$ a oprávnění na úrovni sdílení a NTFS

```text
DOPLNIT
```

**M4-SRV1.V6-D2** – Důkaz: Nastavení domovské složky uživatele eva.student (HomeDrive, HomeDirectory)

```text
DOPLNIT
```

- [ ] Hotovo

### M4-SRV1.V7 Klient v doméně — počítačový objekt

**M4-SRV1.V7-D1** – Důkaz: Umístění počítačového objektu PC1-WIN (Get-ADComputer)

```text
DOPLNIT
```

**M4-SRV1.V7-D2** – Důkaz: ADUC s OU Skola\Pocitace\Klienti-Ucebny a objektem PC1-WIN

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M4-SRV1.V8 Žádný personalizovaný admin účet

**M4-SRV1.V8-D1** – Důkaz: Hledání účtů juchelka / peclivy (Get-ADUser)

```text
DOPLNIT
```

- [ ] Hotovo

### M4-SRV1.V9 Kočovné profily

**M4-SRV1.V9-D1** – Důkaz: Sdílení profiles$ a oprávnění na C:\profiles (Get-SmbShare, icacls)

```text
DOPLNIT
```

**M4-SRV1.V9-D2** – Důkaz: Nastavení profilu uživatele eva.student (ProfilePath)

```text
DOPLNIT
```

**M4-SRV1.V9-D3** – Důkaz: Obsah C:\profiles po odhlášení eva.student z PC1-WIN

```text
DOPLNIT
```

- [ ] Hotovo

## PC1-WIN

### M4-PC1.V0 Otisk (nehodnotí se, ale je povinný)

Spusťte na každém stroji po dokončení modulu. UUID virtuálního stroje je jedinečné pro každou instalaci, SID domény pro každou doménu a doména obsahuje vaše příjmení. Spusťte v PowerShellu tyto příkazy a vložte celý výstup i s promptem:

```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-CimInstance Win32_ComputerSystem).Domain
```

**M4-PC1.V0-O** – Otisk

```text
DOPLNIT
```

- [ ] Hotovo

### M4-PC1.V1 Klient je členem domény

**M4-PC1.V1-D1** – Důkaz: Doména a příslušnost k doméně (Win32_ComputerSystem)

```text
DOPLNIT
```

**M4-PC1.V1-D2** – Důkaz: System Properties / About s plným jménem počítače a doménou

DOPLNIT <!-- vložte screenshot (Ctrl+V), na snímku musí být vidět hodiny na hlavním panelu -->

- [ ] Hotovo

### M4-PC1.V5 Přihlášení každé postavy

**M4-PC1.V5-D1** – Důkaz: Přihlášení jako eva.student (whoami a prompt)

```text
DOPLNIT
```

**M4-PC1.V5-D2** – Důkaz: Přihlášení jako lucie.student (whoami a prompt)

```text
DOPLNIT
```

**M4-PC1.V5-D3** – Důkaz: Přihlášení jako jana.teacher (whoami a prompt)

```text
DOPLNIT
```

**M4-PC1.V5-D4** – Důkaz: Přihlášení jako karel.zamestnanec (whoami a prompt)

```text
DOPLNIT
```

- [ ] Hotovo

### M4-PC1.V6 Domovské složky fungují

**M4-PC1.V6-D1** – Důkaz: eva.student: disk H: a zápis do vlastní složky

```text
DOPLNIT
```

<!-- nebo místo výpisu vložte screenshot (Ctrl+V) s viditelnými hodinami -->

**M4-PC1.V6-D2** – Důkaz: tomas.student: pokus o zápis do složky eva.student

```text
DOPLNIT
```

<!-- nebo místo výpisu vložte screenshot (Ctrl+V) s viditelnými hodinami -->

- [ ] Hotovo

### M4-PC1.V9 Kočovný profil uživatele

**M4-PC1.V9-D1** – Důkaz: eva.student: net user eva.student /domain (řádek User profile)

```text
DOPLNIT
```

- [ ] Hotovo
