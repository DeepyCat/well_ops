# [Jak se pozná, že už to mám?]

> Verze: 2026-10-03

Tento modul se ověřuje přímo na serveru **SRV1-DC** (klient PC1-WIN ani server SRV2-FS v tomto modulu do domény ještě nevstupují — to následuje v dalších modulech).

### 1. Server je nainstalovaný a dostupný v síti
Přímo na konzoli SRV1-DC se úspěšně přihlásíte jako `Administrator` s heslem `Pa55w.rd`. Ověřte IP konfiguraci na interním rozhraní `Ethernet1`:
```powershell
Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength
```
Vrátí statickou IP adresu `192.168.X.10` a prefix `24` (kde `X` je číslo vašeho pracoviště).

### 2. AD DS role je nainstalovaná
V **Server Manageru** na Dashboardu vidíte v seznamu rolí položky **AD DS** a **DNS** (obě zelené, bez chyb).
V PowerShellu ověříte stav instalace komponent:
```powershell
Get-WindowsFeature -Name AD-Domain-Services, DNS, RSAT-ADDS | Select-Object Name, InstallState
```
Obě role i RSAT nástroje mají hodnotu `InstallState: Installed`.

### 3. Server je řadičem domény
V **Server Manager → Local Server** je u položky *Domain* uvedeno `prijmeni.cyberschool.internal` (nikoliv `WORKGROUP`).
V PowerShellu:
```powershell
Get-ADDomain | Select-Object Name, Forest, DomainMode
```
Očekávaný výstup:
```text
Name     Forest                         DomainMode
----     ------                         ----------
pachomov pachomov.cyberschool.internal Windows2025Domain
```
Vrátí název domény odpovídající vašemu příjmení (např. `pachomov`), kořenový les `pachomov.cyberschool.internal` a funkční úroveň domény `Windows2025Domain`.

### 4. SRV1-DC drží role FSMO a je Global Catalog
Ověřte rozdělení rolí FSMO a stav Global Catalog:
```powershell
netdom query fsmo
Get-ADDomainController -Identity SRV1-DC | Select-Object Name, IsGlobalCatalog, OperationMasterRoles
```
Příkaz `netdom query fsmo` vypíše u všech pěti rolí (Schema master, Domain naming master, PDC, RID pool manager, Infrastructure master) server `SRV1-DC.prijmeni.cyberschool.internal`. Vlastnost `IsGlobalCatalog` je `True`.

### 5. Nástroje pro správu domény fungují
V **Server Manager → Tools** je dostupná položka **Active Directory Users and Computers** (ADUC) a po jejím otevření vidíte strukturu domény `prijmeni.cyberschool.internal` (výchozí kontejnery `Users`, `Computers`, `Domain Controllers`).
V PowerShellu:
```powershell
Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName
Get-ADDomainController -Filter * | Select-Object Name, Site
```
Výpis obsahuje výchozí kontejnery v doméně a řadič `SRV1-DC` v defaultním site `Default-First-Site-Name`.

### 6. Restart nic nerozbije a přihlášení funguje
Po restartu serveru SRV1-DC proběhne přihlášení bez chyby jako `PRIJMENI\Administrator`, např. `NOVAK\Administrator` (nikoliv jako lokální účet).
V PowerShellu ověříte aktuálně přihlášený účet:
```powershell
whoami
Get-ADUser -Identity Administrator | Select-Object SamAccountName, UserPrincipalName, Enabled
```
Výstup je ve tvaru `PRIJMENI\Administrator` a účet má `Enabled: True`. Všechny služby Active Directory a DNS běží bez červených varování.

### 7. (Nepovinné) Rychlé ověření celého stroje
Pro komplexní a automatické ověření celé konfigurace serveru **SRV1-DC** můžete spustit ověřovací skript přímo z repozitáře. Skript je **striktně read-only** (pouze čte stav, nic v systému nemění) a po použití se **neukládá na disk** (smaže se automaticky po dokončení běhu).

Spuštění v PowerShellu jako Administrator:
```powershell
curl.exe -sL https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/01_check_SRV1-DC.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue
```

Nebo přímé spuštění přímo v operační paměti RAM bez uložení souboru na disk:
```powershell
irm https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/01_check_SRV1-DC.ps1 | iex
```

Po spuštění zadejte číslo vašeho pracoviště `X` (např. `2`). Skript provede veškeré kontroly a na konci zobrazí přehledný 3-úrovňový souhrn:
- **Zeleně `[ OK ]`**: všechny úspěšně ověřené parametry (IP adresa, brána, DNS resolver, AD DS role, povýšení na DC, doména, FSMO role, Global Catalog, služby NTDS/DNS, sdílení SYSVOL/NETLOGON).
- **Žlutě `[KONTROLA]`**: položky vyžadující vaši vizuální kontrolu (DSRM heslo `Pa55w.rd`, které z bezpečnostních důvodů nelze z AD přečíst, a správnost vašeho příjmení v názvu domény).
- **Červeně `[CHYBA]`**: konfigurace, které neodpovídají zadání, doplněné o nápovědu pro rychlou nápravu.
