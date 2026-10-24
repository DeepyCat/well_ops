<#
.SYNOPSIS
    Overovaci skript pro Modul 02: DHCP Klient (PC1-WIN).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit klientske stanice PC1-WIN v ramci Modulu 02:
    - Hostname klienta (PC1-WIN)
    - Stav sitoveho adapteru Ethernet1 (NIC 2 v CyLabu)
    - Zapnuta funkce DHCP klienta na Ethernet1
    - Pridelena IPv4 adresa z oboru 192.168.X.100 - .200 (kontrola proti APIPA 169.254.x.x)
    - Prevzate volby DHCP: Vychozi brana (192.168.X.1), DNS server (192.168.X.10), DNS suffix (*.cyberschool.internal)
    - Test sitoveho spojeni na branu a SRV1-DC
    - Test prekladu DNS jmen v domene
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni PC1-WIN - DHCP Klient (Modul 02)"

$global:okCount = 0
$global:warnCount = 0
$global:failCount = 0

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "--- $Title ---" -ForegroundColor DarkCyan
}

function Report-Ok {
    param([string]$Message)
    $global:okCount++
    Write-Host "  [ OK ]       " -ForegroundColor Green -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Report-Warn {
    param([string]$Message, [string]$Note = "")
    $global:warnCount++
    Write-Host "  [KONTROLA]   " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor Yellow
    if ($Note) {
        Write-Host "               -> $Note" -ForegroundColor DarkYellow
    }
}

function Report-Fail {
    param([string]$Message, [string]$Hint = "")
    $global:failCount++
    Write-Host "  [CHYBA]      " -ForegroundColor Red -NoNewline
    Write-Host $Message -ForegroundColor Red
    if ($Hint) {
        Write-Host "               -> Naprava: $Hint" -ForegroundColor Magenta
    }
}

Write-Header "WELL_OPS :: Overeni PC1-WIN - DHCP Klient (Modul 02)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[VAROVANI] Skript neni spusten s pravy Administratora!" -ForegroundColor Yellow
    Write-Host "           Pro spravne cteni nekterych sitovych detailu doporucujeme spustit jako Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# ------------------------------------------------------------
# 0. Interaktivni detekce a volba cisla pracoviste X
# ------------------------------------------------------------
$detectedX = 2
try {
    $ipCandidate = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    if ($ipCandidate -match '^192\.168\.(\d+)\.') {
        $detectedX = [int]$matches[1]
    }
} catch {}

Write-Host "Tento skript overi nastaveni DHCP klienta a sitove konfigurace na PC1-WIN." -ForegroundColor Gray
Write-Host "Skript je STRIKTNE READ-ONLY - zadna nastaveni neupravuje." -ForegroundColor Gray
Write-Host ""

$wsX = $detectedX
if ($WorkspaceX -gt 0) {
    $wsX = $WorkspaceX
    Write-Host "Pouzito cislo pracoviste z parametru: $wsX" -ForegroundColor Cyan
} else {
    Write-Host "Zadejte cislo vaseho pracoviste (X) [vychozi: $detectedX]: " -ForegroundColor Yellow -NoNewline
    $userInput = Read-Host
    if (-not [string]::IsNullOrWhiteSpace($userInput)) {
        if ($userInput -match '^\d+$') {
            $wsX = [int]$userInput
        } else {
            Write-Host "Neplatny vstup, pouzivam vychozi hodnotu: $detectedX" -ForegroundColor DarkYellow
        }
    }
}

$expectedServerIP = "192.168.$wsX.10"
$expectedGW = "192.168.$wsX.1"

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste:    $wsX" -ForegroundColor Gray
Write-Host "  Ocekavana brana:     $expectedGW" -ForegroundColor Gray
Write-Host "  Ocekavany DNS/DHCP:  $expectedServerIP" -ForegroundColor Gray
Write-Host "  Ocekavany rozsah IP: 192.168.$wsX.100 az 192.168.$wsX.200" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Hostname a sitovy adapter
# ------------------------------------------------------------
Write-Section "1. Identifikace stanice a adapteru"

$currentHost = $env:COMPUTERNAME
if ($currentHost -eq "PC1-WIN") {
    Report-Ok "Hostname klientske stanice je 'PC1-WIN'"
} else {
    Report-Warn "Hostname stanice je '$currentHost' (ocekavano: 'PC1-WIN')" "Pro prehlednost zmente hostname na PC1-WIN pomoci Rename-Computer"
}

$eth1 = Get-NetAdapter -Name "Ethernet1" -ErrorAction SilentlyContinue
if ($null -ne $eth1 -and $eth1.Status -eq "Up") {
    Report-Ok "Adapter 'Ethernet1' (NIC 2 v CyLabu) existuje a je pripojen (Status: Up)"
} elseif ($null -ne $eth1) {
    Report-Warn "Adapter 'Ethernet1' existuje, ale stav je '$($eth1.Status)'" "Zkontrolujte zapnuti NIC 2 v rozhrani CyLabu"
} else {
    Report-Fail "Adapter 'Ethernet1' nebyl v systemu nalezen" "Ujistete se, ze stroj ma v CyLabu pripojeny adapter NIC 2"
}

# ------------------------------------------------------------
# 2. DHCP Klient na rozhrani Ethernet1
# ------------------------------------------------------------
Write-Section "2. Nastaveni DHCP klienta na Ethernet1"

$ipInt = Get-NetIPInterface -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue
if ($null -ne $ipInt) {
    if ($ipInt.Dhcp -eq "Enabled") {
        Report-Ok "Rozhrani Ethernet1 ma aktivni rezim DHCP klienta (Dhcp: Enabled)"
    } else {
        Report-Fail "Rozhrani Ethernet1 nema zapnuty DHCP klient (Dhcp: $($ipInt.Dhcp))" "Set-NetIPInterface -InterfaceAlias Ethernet1 -Dhcp Enabled"
    }
} else {
    Report-Fail "Nelze nacist konfiguraci IPv4 pro Ethernet1" "Zkontrolujte sitove pripojeni"
}

# ------------------------------------------------------------
# 3. Ziskana IPv4 adresa a rozsah
# ------------------------------------------------------------
Write-Section "3. Pridelena IPv4 adresa"

$ipObj = Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1

if ($null -ne $ipObj) {
    $currentIP = $ipObj.IPAddress

    # Kontrola na APIPA adresu (169.254.x.x)
    if ($currentIP -like "169.254.*") {
        Report-Fail "Adapter ziskal automatickou privatni adresu APIPA ($currentIP)" "DHCP server neodpovida! Zkontrolujte, zda na SRV1-DC bezi sluzba DHCPServer, je zapnuty scope a Ethernet1 je v CyLabu propojen."
    } elseif ($currentIP -match "^192\.168\.$wsX\.(\d+)$") {
        $lastOctet = [int]$matches[1]
        if ($lastOctet -ge 100 -and $lastOctet -le 200) {
            Report-Ok "IPv4 adresa je uspesne pridelena z DHCP rozsahu: $currentIP/24"
        } else {
            Report-Warn "IPv4 adresa '$currentIP' patri do site 192.168.$wsX.0, ale lezi mimo rozsah .100 az .200" "Zkontrolujte konfiguraci oboru Ucebna na SRV1-DC"
        }
    } else {
        Report-Fail "IPv4 adresa '$currentIP' neodpovida ocekavane siti 192.168.$wsX.0/24" "Zkontrolujte cislo pracoviste X a obnovte zapujcku: ipconfig /renew Ethernet1"
    }

    # Puvod adresy (DHCP vs Manual)
    if ($ipObj.PrefixOrigin -eq "Dhcp") {
        Report-Ok "Puvod adresy je potvrzen z DHCP (PrefixOrigin: Dhcp)"
    } else {
        Report-Warn "Puvod adresy neni DHCP (PrefixOrigin: $($ipObj.PrefixOrigin))" "Ujistete se, ze adresa neni nastavena rucne natvrdo"
    }
} else {
    Report-Fail "Na adapteru Ethernet1 neni prirazena zadna IPv4 adresa" "Spustte: ipconfig /renew Ethernet1"
}

# ------------------------------------------------------------
# 4. Prevzate volby DHCP (Brana, DNS, Suffix)
# ------------------------------------------------------------
Write-Section "4. Prevzate parametry site (DHCP Options)"

# Vychozi brana
$gwRoute = Get-NetRoute -InterfaceAlias "Ethernet1" -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $gwRoute -and $gwRoute.NextHop -eq $expectedGW) {
    Report-Ok "Vychozi brana byla prevzata spravne: $expectedGW"
} elseif ($null -ne $gwRoute) {
    Report-Warn "Vychozi brana je '$($gwRoute.NextHop)', ocekavano '$expectedGW'" "Zkontrolujte Option 003 na DHCP serveru"
} else {
    Report-Fail "Vychozi brana nebyla z DHCP ziskana" "Overte konfiguraci Option 003 na SRV1-DC"
}

# DNS server
$dnsInfo = Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue
$dnsAddresses = if ($dnsInfo) { $dnsInfo.ServerAddresses } else { @() }
if ($dnsAddresses -contains $expectedServerIP) {
    Report-Ok "DNS server byl prevzat spravne: $expectedServerIP"
} elseif ($dnsAddresses.Count -gt 0) {
    Report-Warn "DNS servery na Ethernet1 jsou: $($dnsAddresses -join ', ') (ocekavano: $expectedServerIP)" "Zkontrolujte Option 006 na DHCP serveru"
} else {
    Report-Fail "Na adapteru Ethernet1 neni nastaven zadny DNS server" "Overte Option 006 na SRV1-DC"
}

# Doménový suffix
$dnsClient = Get-DnsClient -InterfaceAlias "Ethernet1" -ErrorAction SilentlyContinue
if ($null -ne $dnsClient -and $dnsClient.ConnectionSpecificSuffix) {
    $suffix = $dnsClient.ConnectionSpecificSuffix
    if ($suffix -match '\.cyberschool\.internal$') {
        Report-Ok "Domenovy suffix pripojeni byl prevzat: $suffix"
        Report-Warn "Overte vizualne: Odpovida predpona suffixu '$suffix' vasemu prijmeni?"
    } else {
        Report-Warn "Domenovy suffix je '$suffix' (ocekavano tvarem <prijmeni>.cyberschool.internal)" "Zkontrolujte Option 015 na DHCP serveru"
    }
} else {
    Report-Warn "Domenovy suffix pripojeni nebyl prevzat" "Overte Option 015 na SRV1-DC a obnovte zapujcku"
}

# ------------------------------------------------------------
# 5. Test sitoveho spojeni a prekladu jmen
# ------------------------------------------------------------
Write-Section "5. Test spojeni a rozlisovani jmen"

# Ping na branu
$pingGw = Test-Connection -ComputerName $expectedGW -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($pingGw) {
    Report-Ok "Spojeni na vychozi branu ($expectedGW) je funkcni (ICMP Ping OK)"
} else {
    Report-Warn "Brana $expectedGW neodpovida na ping (muze byt blokovano firewallem)" "Zkontrolujte nastaveni routeru pracovište"
}

# Ping / TCP test na SRV1-DC
$pingSrv = Test-Connection -ComputerName $expectedServerIP -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($pingSrv) {
    Report-Ok "Spojeni na server SRV1-DC ($expectedServerIP) je funkcni (ICMP Ping OK)"
} else {
    # Zkusime TCP port 53 (DNS)
    $tcpDns = Test-NetConnection -ComputerName $expectedServerIP -Port 53 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($tcpDns -and $tcpDns.TcpTestSucceeded) {
        Report-Ok "Spojeni na server SRV1-DC ($expectedServerIP) je funkcni pres DNS port 53"
    } else {
        Report-Warn "Server SRV1-DC ($expectedServerIP) neodpovida na ping ani port 53" "Ujistete se, ze server bezi a povolil pravidlo FPS-ICMP4-ERQ-In"
    }
}

# Test prekladu jmena v domene
try {
    $dnsResolve = Resolve-DnsName -Name $expectedServerIP -ErrorAction SilentlyContinue
    if ($null -eq $dnsResolve) {
        $dnsResolve = Resolve-DnsName -Name "srv1-dc" -ErrorAction SilentlyContinue
    }
    if ($null -ne $dnsResolve) {
        Report-Ok "Preklad domenovych jmen pres DNS server funguje"
    } else {
        Report-Warn "Nepodarilo se overit preklad jmena 'srv1-dc' pres DNS" "Ujistete se, ze DNS sluzba na SRV1-DC bezi a obsahuje doprednou zonu"
    }
} catch {
    Report-Warn "Test prekladu DNS selhal: $($_.Exception.Message)"
}

# ------------------------------------------------------------
# 6. Rucni kontrola funkcnosti
# ------------------------------------------------------------
Write-Section "6. Doporucena prakticka zkouska"

Report-Warn "Prakticky test obnoveni: Vyzkousejte 'ipconfig /release Ethernet1' nasledovane 'ipconfig /renew Ethernet1'" "Ujistete se, ze adresa se vzdy bez chyby obnovi"

# ------------------------------------------------------------
# 7. Zaverecny souhrn
# ------------------------------------------------------------
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "                    VYSLEDNY SOUHRN                         " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Pocet uspesnych kontrol [ OK ]:       " -NoNewline
Write-Host ("{0,2}" -f $global:okCount) -ForegroundColor Green
Write-Host "  Pocet k rucni kontrole  [KONTROLA]:   " -NoNewline
Write-Host ("{0,2}" -f $global:warnCount) -ForegroundColor Yellow
Write-Host "  Pocet nalezenych chyb   [CHYBA]:      " -NoNewline
Write-Host ("{0,2}" -f $global:failCount) -ForegroundColor Red
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan

if ($global:failCount -eq 0) {
    Write-Host ""
    Write-Host "VYSLEDEK: VSE V PORADKU! Klient PC1-WIN je korektne obsluhovan DHCP serverem." -ForegroundColor Green
    Write-Host "Modul 02 byl na tomto stroji uspesne dokoncen." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA KLIENTOVI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Projdete cervene radky s oznacenim [CHYBA] a provedte doporucenou napravu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
