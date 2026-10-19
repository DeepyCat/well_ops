# [Co má být na konci modulu a jak to vypadá?]

> Verze: 2026-10-17

**Přibližný potřebný čas**: 2 vyučovací hodiny

## Kontext (proč to děláme)

Škola právě vybavila novou počítačovou učebnu patnácti počítači. Ruční nastavování IP adresy na každém z nich je zdlouhavé a náchylné na chyby (dvě stejné IP adresy = konflikt a výpadek sítě). Řešením je **DHCP server (Dynamic Host Configuration Protocol)**, který adresy přiděluje automaticky.

> Ve vzorovém postupu je číslo pracoviště `200` a příjmení `novak`. Vy všude dosaďte číslo svého pracoviště (`192.168.N.x`, kde N je číslo pracoviště) a své příjmení (`prijmeni.cyberschool.internal`).

## Předpoklad: hotový Modul 00 a Modul 01

Tento modul navazuje na předchozí cvičení a předpokládá:
- Server **SRV1-DC** je řadičem domény lesa `<prijmeni>.cyberschool.internal` z Modulu 01. Má statickou IP adresu `192.168.N.10/24` na interním rozhraní `Ethernet1`, výchozí bránu `192.168.N.1`, integrovaný DNS server a účet `Administrator` s heslem `Pa55w.rd`.
- Klientská stanice **PC1-WIN** má nainstalovaný Windows 11 z Modulu 00, funkční účet `Administrator` s heslem `Pa55w.rd` a interní adaptér `Ethernet1` zapnutý v prostředí CyLabu.

## Cílový stav: Plně funkční DHCP server pro učebnu

Na konci tohoto modulu bude na serveru **SRV1-DC** nainstalovaná, autorizovaná a plně nakonfigurovaná role **DHCP Server**:

| Parametr | Hodnota na SRV1-DC (Server) | Hodnota na PC1-WIN (Klient) | Poznámka |
|---|---|---|---|
| **Role serveru** | **DHCP Server**, AD DS, DNS | Klient (Windows 11) | Instaluje se včetně nástrojů RSAT-DHCP |
| **Interní síťové rozhraní** | `Ethernet1` (NIC 2 v CyLabu) | `Ethernet1` (NIC 2 v CyLabu) | Na rozhraní NIC 1 (Ethernet0 / NAT) nikdy nesahejte |
| **Způsob konfigurace IP** | Staticky zadaná IP adresa | Automaticky přiděleno (DHCP) | Režim Obtain an IP address automatically |
| **IPv4 adresa** | `192.168.N.10 / 24` | `192.168.N.100` – `.200` | Přidělena ze scope Ucebna |
| **Maska podsítě** | `255.255.255.0` (/24) | `255.255.255.0` (/24) | Maska interní sítě učebny |
| **Výchozí brána (Router)** | `192.168.N.1` | `192.168.N.1` | DHCP Option 003 Router |
| **DNS Server** | `127.0.0.1` / `192.168.N.10` | `192.168.N.10` | DHCP Option 006 DNS Servers |
| **Doménový suffix** | `prijmeni.cyberschool.internal` | `prijmeni.cyberschool.internal` | DHCP Option 015 DNS Domain Name |
| **Autorizace v doméně** | Autorizován v Active Directory | N/A | Neautorizovaný DHCP server v doméně nesmí odpovídat |
| **Stav DHCP oboru (Scope)** | `Active` (Aktivní) | N/A | Připraven k obsluze požadavků |

### Klíčové vlastnosti cílového stavu:
1. **DHCP Scope pro klientské počítače:**
   Pokrývá rozsah `192.168.N.100` až `192.168.N.200` v podsíti `192.168.N.0/24`. Adresy `.1` až `.99` jsou ponechány mimo rozsah pro síťové prvky a servery s pevnými adresami (brána `.1`, servery `.10`, `.20`, `.30`).
2. **Kompletní síťové volby (Scope Options):**
   Klientům se spolu s IP adresou automaticky předá maska podsítě, výchozí brána `192.168.N.1`, DNS server `192.168.N.10` a primární doménový název `<prijmeni>.cyberschool.internal`.
3. **Autorizace v Active Directory:**
   Role je korektně autorizována v AD doméně, takže v konzoli DHCP Manageru svítí zelená ikona aktivního serveru (žádná červená šipka dolů).
4. **Ověřený klient PC1-WIN:**
   Po nastavení síťového adaptéru `Ethernet1` na automatické získávání získá klient korektní konfiguraci bez ručního zásahu administrátora. Příkazy `ipconfig /release` a `ipconfig /renew` fungují bezchybně.
5. **Konzistence v databázi zápůjček:**
   V konzoli DHCP v sekci Address Leases se zobrazuje právě jedna aktivní zápůjčka pro `PC1-WIN` bez konfliktů a duplicit.

## Postup konfigurace v PowerShellu

### Krok 1: Instalace role DHCP a správy RSAT (SRV1-DC)
```powershell
Install-WindowsFeature -Name DHCP -IncludeManagementTools
```

### Krok 2: Vytvoření bezpečnostních skupin a spuštění služby (SRV1-DC)
```powershell
Add-DhcpServerSecurityGroup
Restart-Service -Name DHCPServer
```

### Krok 3: Autorizace serveru v Active Directory (SRV1-DC)
```powershell
$DnsName = "$env:COMPUTERNAME.$((Get-ADDomain).DNSRoot)"
$IP = "192.168.N.10"
Add-DhcpServerInDC -DnsName $DnsName -IPAddress $IP
```

### Krok 4: Vytvoření a aktivace DHCP Scope (SRV1-DC)
```powershell
Add-DhcpServerv4Scope -Name "Ucebna" -StartRange "192.168.N.100" -EndRange "192.168.N.200" -SubnetMask "255.255.255.0" -State Active
```

### Krok 5: Nastavení DHCP voleb pro bránu, DNS a doménu (SRV1-DC)
```powershell
$DomainName = (Get-ADDomain).DNSRoot
Set-DhcpServerv4OptionValue -ScopeId "192.168.N.0" -Router "192.168.N.1" -DnsServer "192.168.N.10" -DnsDomain $DomainName
```

### Krok 6: Nastavení klienta na DHCP a obnova adresy (PC1-WIN)
```powershell
Set-NetIPInterface -InterfaceAlias "Ethernet1" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Ethernet1" -ResetServerAddresses
ipconfig /release Ethernet1
ipconfig /renew Ethernet1
```

### Krok 7: Kontrola zápůjček a síťového spojení (SRV1-DC i PC1-WIN)
```powershell
# Na SRV1-DC ověříte evidovanou zápůjčku:
Get-DhcpServerv4Lease -ScopeId "192.168.N.0" | Select-Object IPAddress, HostName, ClientId, AddressState

# Na PC1-WIN otestujete konektivitu na bránu, server a překlad DNS:
Test-NetConnection -ComputerName "192.168.N.1"
Test-NetConnection -ComputerName "192.168.N.10"
Resolve-DnsName -Name "srv1-dc.<prijmeni>.cyberschool.internal"
```

## Ověření nástroji

Na serveru **SRV1-DC** je dostupná grafická konzole **DHCP Manager** (`dhcpmgmt.msc`), přístupná přes **Server Manager → Tools → DHCP**:
- V kořenovém stromu je u názvu serveru zobrazena zelená značka (autorizováno v doméně).
- Ve větvi **IPv4 → Scope [192.168.N.0] Ucebna** je zobrazen Address Pool (`.100`–`.200`), Scope Options (Router `.1`, DNS Server `.10`, DNS Domain Name) a v sekci **Address Leases** je evidován klientský počítač `PC1-WIN`.

## Co odevzdat

Jeden ZIP s názvem `Prijmeni_Jmeno_Modul2.zip`, ve kterém budou složky:
- `Moje dokumentace / Modul 2 DHCP` (`postup.md`, `overeni.md` a složka `images` se screenshoty)
- `Moje dokumentace / Modul 0 Příprava` (část `PC1-WIN`)
