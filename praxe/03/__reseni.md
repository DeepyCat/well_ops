# [Jak se pozná, že už to mám?]

> Verze: 2026-11-01

> Ve vzorovém postupu je číslo pracoviště `200` a příjmení `novak`. Vy všude dosaďte číslo svého pracoviště (`192.168.N.x`, kde N je číslo vašeho pracoviště) a své příjmení (`<prijmeni>.cyberschool.internal`).

Ověření tohoto modulu probíhá v kooperaci mezi serverem **SRV1-DC** a klientskou stanicí **PC1-WIN**.

---

### 1. Role DNS Server běží a dopředná zóna je aktivní (SRV1-DC)
V **Server Manageru** je role **DNS** na Dashboardu zelená. V konzoli **DNS Manager** (`dnsmgmt.msc`) existuje ve větvi **Forward Lookup Zones** zóna pojmenovaná podle vaší domény (`<prijmeni>.cyberschool.internal`). Zóna je typu *Active Directory-Integrated Primary* a má nastaveny zabezpečené dynamické aktualizace (*Secure only*).

V PowerShellu na SRV1-DC ověříte stav služby DNS a parametry zóny:
```powershell
Get-Service -Name DNS | Select-Object Name, Status, StartType
Get-DnsServerZone -Name "$((Get-ADDomain).DNSRoot)" | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate
```

Očekávaný výstup:
```text
Name Status  StartType
---- ------  ---------
DNS  Running Automatic

ZoneName                       ZoneType ReplicationScope DynamicUpdate
--------                       -------- ---------------- -------------
<prijmeni>.cyberschool.internal Primary  Domain           Secure
```

---

### 2. Reverzní zóna pro síť 192.168.N.0/24 existuje (SRV1-DC)
V konzoli **DNS Manager** existuje ve větvi **Reverse Lookup Zones** zóna pro síť vašeho pracoviště s názvem `N.168.192.in-addr.arpa`. Zóna je rovněž integrována v Active Directory s replikací v rámci domény a zabezpečenými dynamickými aktualizacemi.

V PowerShellu na SRV1-DC:
```powershell
$wsX = (Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4).IPAddress.Split('.')[2]
Get-DnsServerZone -Name "$wsX.168.192.in-addr.arpa" | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate
```

Očekávaný výstup:
```text
ZoneName                 ZoneType ReplicationScope DynamicUpdate
--------                 -------- ---------------- -------------
N.168.192.in-addr.arpa   Primary  Domain           Secure
```

---

### 3. Záznamy A a PTR pro servery SRV1-DC a SRV2-FS (SRV1-DC)
V dopředné zóně existují záznamy typu **A** pro `SRV1-DC` (`192.168.N.10`) a `SRV2-FS` (`192.168.N.20`). V reverzní zóně existují odpovídající záznamy **PTR** s ukazateli zpět na doménová jména serverů.

V PowerShellu na SRV1-DC:
```powershell
$domain = (Get-ADDomain).DNSRoot
$wsX = (Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4).IPAddress.Split('.')[2]

# Kontrola dopředných A záznamů:
Get-DnsServerResourceRecord -ZoneName $domain -RRType A | Where-Object { $_.HostName -in 'srv1-dc', 'srv2-fs' } | Select-Object HostName, RecordType, @{N='IPAddress';E={$_.RecordData.IPv4Address}}

# Kontrola reverzních PTR záznamů:
Get-DnsServerResourceRecord -ZoneName "$wsX.168.192.in-addr.arpa" -RRType Ptr | Where-Object { $_.HostName -in '10', '20' } | Select-Object HostName, RecordType, @{N='PtrDomainName';E={$_.RecordData.PtrDomainName}}
```

Očekávaný výstup:
```text
HostName RecordType IPAddress
-------- ---------- ---------
srv1-dc  A          192.168.N.10
srv2-fs  A          192.168.N.20

HostName RecordType PtrDomainName
-------- ---------- -------------
10       Ptr        srv1-dc.<prijmeni>.cyberschool.internal.
20       Ptr        srv2-fs.<prijmeni>.cyberschool.internal.
```

---

### 4. Alias CNAME ftp je vytvořen a ukazuje na srv2-fs (SRV1-DC)
V dopředné zóně je evidován záznam typu **Alias (CNAME)** s názvem `ftp`, který odkazuje na kanonické jméno serveru `srv2-fs.<prijmeni>.cyberschool.internal`.

V PowerShellu na SRV1-DC:
```powershell
$domain = (Get-ADDomain).DNSRoot
Get-DnsServerResourceRecord -ZoneName $domain -Name "ftp" | Select-Object HostName, RecordType, @{N='HostNameAlias';E={$_.RecordData.HostNameAlias}}
```

Očekávaný výstup:
```text
HostName RecordType HostNameAlias
-------- ---------- -------------
ftp      CNAME      srv2-fs.<prijmeni>.cyberschool.internal.
```

---

### 5. Klient PC1-WIN používá správný DNS server, prioritu adaptérů a doménovou příponu (PC1-WIN)
Na stanici **PC1-WIN** nastavte prioritu adaptérů tak, aby školní síť `Ethernet1` měla nižší metriku (10) než adaptér pro internet `Ethernet0` (metrika 50). Tím zajistíte, že systém bude veškeré doménové DNS dotazy prioritně směrovat na server SRV1-DC (`192.168.N.10`).

V PowerShellu na PC1-WIN:
```powershell
Set-NetIPInterface -InterfaceAlias "Ethernet1" -InterfaceMetric 10
Set-NetIPInterface -InterfaceAlias "Ethernet0" -InterfaceMetric 50
Get-NetIPInterface -InterfaceAlias "Ethernet1", "Ethernet0" -AddressFamily IPv4 | Select-Object InterfaceAlias, InterfaceMetric
Get-DnsClientServerAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses
Get-DnsClient -InterfaceAlias Ethernet1 | Select-Object ConnectionSpecificSuffix, RegisterThisConnectionsAddress
```

Očekávaný výstup:
```text
InterfaceAlias InterfaceMetric
-------------- ---------------
Ethernet1                   10
Ethernet0                   50

InterfaceAlias ServerAddresses
-------------- ---------------
Ethernet1      {192.168.N.10}

ConnectionSpecificSuffix         RegisterThisConnectionsAddress
------------------------         ------------------------------
<prijmeni>.cyberschool.internal  True
```

---

### 6. Dopředný překlad jména na IP funguje bez chyb (PC1-WIN)
Příkaz `nslookup srv2-fs.<prijmeni>.cyberschool.internal` nebo zkráceně `nslookup srv2-fs` vrátí správnou IP adresu `192.168.N.20`. Výstup nesmí obsahovat chybovou hlášku *Non-existent domain*.

V PowerShellu nebo Příkazovém řádku na PC1-WIN:
```powershell
nslookup srv2-fs
Resolve-DnsName -Name "srv2-fs" | Select-Object Name, Type, IPAddress
```

Očekávaný výstup:
```text
Server:  srv1-dc.<prijmeni>.cyberschool.internal
Address:  192.168.N.10

Name:    srv2-fs.<prijmeni>.cyberschool.internal
Address: 192.168.N.20

Name                                    Type IPAddress
----                                    ---- ---------
srv2-fs.<prijmeni>.cyberschool.internal A    192.168.N.20
```

---

### 7. Reverzní překlad adresy na jméno funguje (PC1-WIN)
Dotaz na IP adresu `192.168.N.20` i `192.168.N.10` vrátí odpovídající plné doménové jméno. Výchozí server `nslookup` se navíc představí svým skutečným jménem, nikoliv hláškou *Default Server: UnKnown*.

V PowerShellu nebo Příkazovém řádku na PC1-WIN:
```powershell
nslookup 192.168.N.20
nslookup 192.168.N.10
```

Očekávaný výstup:
```text
Server:  srv1-dc.<prijmeni>.cyberschool.internal
Address:  192.168.N.10

Name:    srv2-fs.<prijmeni>.cyberschool.internal
Address: 192.168.N.20

Server:  srv1-dc.<prijmeni>.cyberschool.internal
Address:  192.168.N.10

Name:    srv1-dc.<prijmeni>.cyberschool.internal
Address: 192.168.N.10
```

---

### 8. Alias ftp funguje a vrací správný kanonický cíl (PC1-WIN)
Příkaz `Resolve-DnsName -Name "ftp.pachomov.cyberschool.internal" -Server 192.168.N.10 | Select-Object Name, Type, NameHost, IPAddress` vrátí záznam typu CNAME odkazující na `srv2-fs.pachomov.cyberschool.internal` a následně A záznam s IP adresou `192.168.N.20`.

V PowerShellu na PC1-WIN:
```powershell
Resolve-DnsName -Name "ftp.pachomov.cyberschool.internal" -Server 192.168.N.10 | Select-Object Name, Type, NameHost, IPAddress
```

Očekávaný výstup:
```text
Name                                  Type  NameHost                                  IPAddress
----                                  ----  --------                                  ---------
ftp.pachomov.cyberschool.internal     CNAME srv2-fs.pachomov.cyberschool.internal
srv2-fs.pachomov.cyberschool.internal A                                               192.168.N.20
```

---

### 9. Přejmenování a nový záznam se v DNS projeví (PC1-WIN)
Po přidání libovolného testovacího záznamu do zóny je možné stroj okamžitě vyhledat a pingnout jménem:

V PowerShellu na PC1-WIN:
```powershell
ping srv2-fs
```

Očekávaný výstup:
```text
Pinging srv2-fs.<prijmeni>.cyberschool.internal [192.168.N.20] with 32 bytes of data:
Reply from 192.168.N.20: bytes=32 time<1ms TTL=128
```

---

### 10. Otisk konfigurace pro odevzdání (SRV1-DC a PC1-WIN)
Pro splnění části M3-SRV1.V0 a M3-PC1.V0 spusťte na obou strojích povinné otisky:

**Na SRV1-DC:**
```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-ADDomain).DNSRoot
(Get-ADDomain).DomainSID.Value
```

**Na PC1-WIN:**
```powershell
Get-Date
whoami
hostname
(Get-CimInstance Win32_ComputerSystemProduct).UUID
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.*').IPAddress
```

---

### 11. (Nepovinné) Rychlé automatické ověření celého stroje
Kdykoliv můžete spustit automatické testy přes univerzální jednořádkový příkaz:

**Na serveru SRV1-DC:**
```powershell
powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_SRV1-DC.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"
```

**Na klientovi PC1-WIN:**
```powershell
powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_PC1-WIN.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"
```
