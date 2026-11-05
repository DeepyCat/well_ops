# [Co má být na konci modulu a jak to vypadá?]

> Verze: 2026-11-01

> [!warning] Modul ve vývoji
> Materiály se v průběhu školního roku upravují, změny najdete v CHANGELOG.md. Hodnotí se podle verze platné v den termínu odevzdání modulu; pracujete-li dopředu, úpravy po pozdější změně jsou na vás.

**Přibližný potřebný čas**: 2 vyučovací hodiny

## Kontext (proč to děláme)

Jakmile bude ve škole víc serverů (SRV1-DC, SRV2-FS) a desítky klientských stanic, nikdo si nebude pamatovat IP adresy. Potřebujeme, aby se dalo používat doménová jména jako `srv2-fs.<prijmeni>.cyberschool.internal` místo `192.168.N.20` — a aby to fungovalo i opačně (podle IP adresy zjistit jméno stroje), což je klíčové při řešení problémů, zabezpečení a v systémových logách.

> Ve vzorovém postupu je číslo pracoviště `200` a příjmení `novak`. Vy všude dosaďte číslo svého pracoviště (`192.168.N.x`, kde N je číslo pracoviště) a své příjmení (`<prijmeni>.cyberschool.internal`).

## Předpoklad: hotový Modul 00, Modul 01 a Modul 02

Tento modul navazuje na předchozí cvičení a předpokládá:
- Server **SRV1-DC** je řadičem domény lesa `<prijmeni>.cyberschool.internal` z Modulu 01. Má statickou IP adresu `192.168.N.10/24` na interním rozhraní `Ethernet1`, výchozí bránu `192.168.N.1`, integrovanou roli **DNS Server** a aktivní **DHCP Server** z Modulu 02.
- Klientská stanice **PC1-WIN** má Windows 11, interní adaptér `Ethernet1` v CyLabu a získává konfiguraci sítě (IP ze scope `192.168.N.100–.200`, bránu `192.168.N.1`, DNS `192.168.N.10` a doménový suffix `<prijmeni>.cyberschool.internal`) automaticky přes DHCP nebo staticky.

## Cílový stav: Plně funkční DNS infrastruktura

Na konci tohoto modulu bude role **DNS Server** na serveru **SRV1-DC** kompletně nakonfigurována pro dopředné i reverzní dotazy:

| Parametr | Hodnota na SRV1-DC (Server) | Hodnota na PC1-WIN (Klient) | Poznámka |
|---|---|---|---|
| **Role serveru** | **DNS Server**, AD DS, DHCP | Klient (Windows 11) | Správa přes konzoli `dnsmgmt.msc` |
| **Interní rozhraní** | `Ethernet1` (NIC 2 v CyLabu) | `Ethernet1` (NIC 2 v CyLabu) | Na rozhraní NIC 1 (Ethernet0 / NAT) nikdy nesahejte |
| **Primární dopředná zóna** | `<prijmeni>.cyberschool.internal` | Dotazuje se na zónu | Integrována s Active Directory |
| **Reverzní zóna** | `N.168.192.in-addr.arpa` | Dotazuje se na reverz | Zóna pro podsíť `192.168.N.0/24` |
| **Zabezpečení aktualizací** | Secure only (pouze zabezpečené) | Zapisuje se přes Kerberos | Chrání zónu před podvržením záznamů |
| **Záznam SRV1-DC** | A (`.10`) + PTR (`10` → `srv1-dc`) | Překládá na `.10` | Záznam řadiče domény a DNS serveru |
| **Záznam SRV2-FS** | A (`.20`) + PTR (`20` → `srv2-fs`) | Překládá na `.20` | Staticky založený záznam budoucího serveru |
| **Alias CNAME ftp** | CNAME `ftp` → `srv2-fs...` | Překládá `ftp` na `.20` | Alias služby pro budoucí FTP server |
| **Klient PC1-WIN v DNS** | Dynamický A + PTR záznam | Využívá DNS `192.168.N.10` | Automatická registrace přes DHCP/klienta |

### Klíčové vlastnosti cílového stavu:
1. **Dopředná zóna (Forward Lookup Zone):**
   Zóna `<prijmeni>.cyberschool.internal` je integrována v Active Directory, replikuje se na řadiče v doméně a má zapnuté zabezpečené dynamické aktualizace (*Secure only*). Obsahuje A záznamy pro `SRV1-DC` (`192.168.N.10`), statický záznam `SRV2-FS` (`192.168.N.20`) a dynamicky evidovanou stanici `PC1-WIN`.
2. **Reverzní zóna (Reverse Lookup Zone):**
   Vytvořená AD-integrovaná reverzní zóna pro síť `192.168.N.0/24` s názvem `N.168.192.in-addr.arpa`. Umožňuje bezchybný překlad libovolné IP adresy z interní sítě zpět na plně kvalifikované doménové jméno (FQDN).
3. **Konzistentní PTR ukazatele:**
   Pro `SRV1-DC` je manuálně doplněn chybějící PTR záznam pro adresu `.10` (protože řadič vznikl před založením reverzní zóny). Pro `SRV2-FS` je vytvořen PTR záznam pro `.20`.
4. **Služební alias CNAME:**
   V dopředné zóně existuje alias `ftp.<prijmeni>.cyberschool.internal` odkazující na `srv2-fs.<prijmeni>.cyberschool.internal`. Uživatelé a klientské aplikace přistupují ke službě přes obecné jméno služby, nikoliv konkrétní název serveru.
5. **Ověřený překlad z klienta PC1-WIN:**
   Příkazy `nslookup srv2-fs.<prijmeni>.cyberschool.internal`, `nslookup 192.168.N.20` i `nslookup ftp.<prijmeni>.cyberschool.internal` z klientské stanice vracejí bezchybné a přesné odpovědi bez hlášek o chybějící doméně (*Non-existent domain*).

## Postup konfigurace v PowerShellu

### Krok 1: Kontrola stavu role DNS a dopředné zóny (SRV1-DC)
```powershell
Get-Service -Name DNS | Select-Object Name, Status, StartType
Get-DnsServerZone -Name "$((Get-ADDomain).DNSRoot)" | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate
Get-DnsServerResourceRecord -ZoneName "$((Get-ADDomain).DNSRoot)" -RRType A -Name "srv1-dc"
```

### Krok 2: Vytvoření AD-integrované reverzní zóny pro síť 192.168.N.0/24 (SRV1-DC)
```powershell
$wsX = (Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4).IPAddress.Split('.')[2]
Add-DnsServerPrimaryZone -NetworkId "192.168.$wsX.0/24" -ReplicationScope "Domain" -DynamicUpdate "Secure"
```

### Krok 3: Statický záznam A a PTR pro budoucí server SRV2-FS (SRV1-DC)
```powershell
$domain = (Get-ADDomain).DNSRoot
$wsX = (Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4).IPAddress.Split('.')[2]
Add-DnsServerResourceRecordA -Name "srv2-fs" -ZoneName $domain -IPv4Address "192.168.$wsX.20" -CreatePtr
```

### Krok 4: Vytvoření aliasu CNAME ftp pro plánovanou službu (SRV1-DC)
```powershell
$domain = (Get-ADDomain).DNSRoot
Add-DnsServerResourceRecordCName -Name "ftp" -HostNameAlias "srv2-fs.$domain" -ZoneName $domain
```

### Krok 5: Doplnění chybějícího PTR záznamu pro řadič SRV1-DC (SRV1-DC)
```powershell
$domain = (Get-ADDomain).DNSRoot
$wsX = (Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4).IPAddress.Split('.')[2]
Add-DnsServerResourceRecordPtr -Name "10" -ZoneName "$wsX.168.192.in-addr.arpa" -PtrDomainName "srv1-dc.$domain"
```

### Krok 6: Kontrola síťové konfigurace klienta a dynamická registrace (PC1-WIN)
```powershell
Get-DnsClientServerAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4
ipconfig /registerdns
ipconfig /flushdns
```

### Krok 7: Ověření překladu jmen, adres a aliasů (PC1-WIN)
```powershell
# Dopředný dotaz na A záznam:
nslookup srv2-fs

# Reverzní dotaz na PTR záznam (dosaďte své číslo pracoviště X):
nslookup 192.168.N.20
nslookup 192.168.N.10

# Dotaz na alias CNAME:
nslookup ftp

# Ověření odezvy přes doménové jméno:
ping srv2-fs
```

## Ověření nástroji

Na serveru **SRV1-DC** je dostupná grafická konzole **DNS Manager** (`dnsmgmt.msc`), přístupná přes **Server Manager → Tools → DNS**:
- Ve **Forward Lookup Zones → <prijmeni>.cyberschool.internal** existují záznamy A pro `srv1-dc` (`192.168.N.10`), `srv2-fs` (`192.168.N.20`), `PC1-WIN` a záznam typu Alias (CNAME) `ftp` ukazující na `srv2-fs.<prijmeni>.cyberschool.internal`.
- Ve větvi **Reverse Lookup Zones** existuje zóna `N.168.192.in-addr.arpa` se záznamy PTR pro `10` (`srv1-dc`) a `20` (`srv2-fs`).
- Všechny zóny mají typ *Active Directory-Integrated* a dynamické aktualizace nastaveny na *Secure only*.

### Rychlé automatické ověření strojů (nepovinné)

Pro oba stroje jsou k dispozici interaktivní jednořádkové skripty spustitelné v **PowerShellu, CMD i Terminálu** (skripty jsou striktně read-only a po spuštění se neukládají na disk):

**Na serveru SRV1-DC:**
```powershell
powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_SRV1-DC.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"
```

**Na klientovi PC1-WIN:**
```powershell
powershell -ExecutionPolicy Bypass -Command "curl.exe --progress-bar -L https://raw.githubusercontent.com/DeepyCat/well_ops/main/skripty/03_check_PC1-WIN.bat -o check.bat; .\check.bat; Remove-Item -Force check.bat -ErrorAction SilentlyContinue"
```

## Co odevzdat

Jeden ZIP archiv s názvem `Prijmeni_Jmeno_Modul3.zip`, ve kterém bude složka:
- `Moje dokumentace / Modul 3 DNS` (`postup.md`, `overeni.md` a složka `images` se screenshoty)
