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
Vrátí název domény odpovídající vašemu příjmení (např. `novak`), les `novak.cyberschool.internal` a funkční úroveň domény.

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
