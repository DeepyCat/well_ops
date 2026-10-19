# [Jak se pozná, že už to mám?]

> Verze: 2026-10-17

> Ve vzorovém postupu je číslo pracoviště `200` a příjmení `novak`. Vy všude dosaďte číslo svého pracoviště (`192.168.N.x`, kde N je číslo vašeho pracoviště) a své příjmení (`prijmeni.cyberschool.internal`).

Ověření tohoto modulu probíhá v kooperaci mezi serverem **SRV1-DC** a klientskou stanicí **PC1-WIN**.

---

### 1. Role je nainstalovaná a autorizovaná v Active Directory (SRV1-DC)
V **Server Manageru** je role **DHCP** na Dashboardu zelená, bez varování a chybových událostí. V konzoli **DHCP Manager** (`dhcpmgmt.msc`) je u názvu serveru zobrazena zelená ikona značící plnou autorizaci v doméně (nikoliv červená šipka dolů, která značí neautorizovaný server).

V PowerShellu na SRV1-DC ověříte stav instalace role, služby a autorizace v doméně:
```powershell
Get-WindowsFeature -Name DHCP, RSAT-DHCP | Select-Object Name, InstallState
Get-Service -Name DHCPServer | Select-Object Name, Status, StartType
Get-DhcpServerInDC | Select-Object DnsName, IPAddress
```

Očekávaný výstup:
```text
Name      InstallState
----      ------------
DHCP         Installed
RSAT-DHCP    Installed

Name       Status  StartType
----       ------  ---------
DHCPServer Running Automatic

DnsName                                 IPAddress
-------                                 ---------
SRV1-DC.<prijmeni>.cyberschool.internal 192.168.N.10
```

---

### 2. DHCP Scope je aktivní a pokrývá správný rozsah (SRV1-DC)
V **DHCP Manageru** existuje ve větvi IPv4 obor s názvem **[192.168.N.0] Ucebna**. Ikona scope je zelená (aktivní), nikoliv červená (deaktivovaná).

V PowerShellu na SRV1-DC:
```powershell
Get-DhcpServerv4Scope | Select-Object ScopeId, Name, StartRange, EndRange, State
```

Očekávaný výstup:
```text
ScopeId       Name   StartRange       EndRange         State
-------       ----   ----------       --------         -----
192.168.N.0   Ucebna 192.168.N.100    192.168.N.200    Active
```

---

### 3. Síťové volby (Scope Options) jsou kompletní (SRV1-DC)
V konzoli v podsložce **Scope Options** jsou nakonfigurovány všechny povinné parametry pro klientské stanice.

V PowerShellu na SRV1-DC:
```powershell
Get-DhcpServerv4OptionValue -ScopeId "192.168.N.0" | Select-Object OptionId, Name, Value
```

Očekávaný výstup:
```text
OptionId Name            Value
-------- ----            -----
       3 Router          {192.168.N.1}
       6 DNS Servers     {192.168.N.10}
      15 DNS Domain Name {<prijmeni>.cyberschool.internal}
```

---

### 4. Klient PC1-WIN dostane adresu automaticky (PC1-WIN)
Na klientském stroji **PC1-WIN** je síťová karta na interním rozhraní `Ethernet1` (NIC 2 v CyLabu) nastavena na automatické získávání parametrů (*Obtain an IP address automatically* a *Obtain DNS server address automatically*).

Příkaz `ipconfig /all` nebo PowerShell příkazy ukazují přidělenou adresu ze scope `192.168.N.100`–`.200`, správnou masku `255.255.255.0`, výchozí bránu `192.168.N.1` a DNS `192.168.N.10`:
```powershell
Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength, PrefixOrigin
Get-NetIPConfiguration -InterfaceAlias Ethernet1 | Select-Object -ExpandProperty IPv4DefaultGateway
Get-DnsClientServerAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object ServerAddresses
```

Očekávaný výstup:
```text
IPAddress        PrefixLength PrefixOrigin
---------        ------------ ------------
192.168.N.100              24 Dhcp

NextHop: 192.168.N.1
ServerAddresses: {192.168.N.10}
```
Vlastnost `PrefixOrigin` má hodnotu **Dhcp** (nikoliv ruční *Manual*).

---

### 5. Zápůjčka je evidována bez konfliktů (SRV1-DC)
Žádný jiný počítač v síti nemá stejnou IP adresu jako klient. V konzoli DHCP na serveru SRV1-DC je v sekci **Address Leases** viditelná právě jedna aktivní zápůjčka pro `PC1-WIN` bez chyb a duplicit.

V PowerShellu na SRV1-DC:
```powershell
Get-DhcpServerv4Lease -ScopeId "192.168.N.0" | Select-Object IPAddress, HostName, ClientId, AddressState
```

Očekávaný výstup:
```text
IPAddress        HostName AddressState
---------        -------- ------------
192.168.N.100    PC1-WIN  Active
```

---

### 6. Obnovení adresy a síťová konektivita fungují (PC1-WIN)
Příkazy `ipconfig /release` a následně `ipconfig /renew` na klientovi proběhnou bez chyby a klient znovu obdrží platnou konfiguraci z DHCP serveru. Následně funguje komunikace na bránu, server i překlad DNS:
```powershell
# 1. Test uvolnění a nového vyžádání:
ipconfig /release Ethernet1
ipconfig /renew Ethernet1

# 2. Test konektivity na SRV1-DC:
Test-NetConnection -ComputerName "192.168.N.10" -InformationLevel Detailed

# 3. Test DNS překladu:
Resolve-DnsName -Name "srv1-dc.<prijmeni>.cyberschool.internal"
```

Očekávaný výstup:
```text
PingSucceeded : True

Name                                           IP4Address
----                                           ----------
srv1-dc.<prijmeni>.cyberschool.internal        192.168.N.10
```
Počítač PC1-WIN má plnou síťovou konektivitu v interním labu a je připraven na vstup do domény v Modulu 03.
