@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "=[scriptblock]::Create((Get-Content -LiteralPath :BAT_PATH | Select-Object -Skip 5 | Out-String)); &  %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Overovaci skript pro Modul 03: DNS Server (PC1-WIN).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit DNS klienta a prekladu jmen na PC1-WIN:
    - Predpoklady (Hostname PC1-WIN, adapter Ethernet1, IP adresa)
    - DNS konfigurace klienta (DNS server 192.168.X.10, suffix *.cyberschool.internal)
    - Dopredny preklad A zaznamu: srv2-fs -> 192.168.X.20
    - Dopredny preklad A zaznamu: srv1-dc -> 192.168.X.10
    - Reverzni preklad PTR zaznamu: 192.168.X.20 -> srv2-fs.<domena>
    - Reverzni preklad PTR zaznamu: 192.168.X.10 -> srv1-dc.<domena>
    - Preklad aliasu CNAME: ftp -> srv2-fs.<domena> (192.168.X.20)
    - Sitove spojeni pres domenove jmeno
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni PC1-WIN - DNS Klient (Modul 03)"

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

Write-Header "WELL_OPS :: Overeni PC1-WIN - DNS Klient (Modul 03)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[VAROVANI] Skript neni spusten s pravy Administratora!" -ForegroundColor Yellow
    Write-Host "           Doporucujeme spustit jako Administrator pro presne cteni sitovych nastaveni." -ForegroundColor Yellow
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

Write-Host "Tento skript overi nastaveni DNS klienta a funkcnost prekladu jmen na PC1-WIN." -ForegroundColor Gray
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
$expectedFsIP = "192.168.$wsX.20"

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste:        $wsX" -ForegroundColor Gray
Write-Host "  Ocekavany DNS server:    $expectedServerIP (SRV1-DC)" -ForegroundColor Gray
Write-Host "  Ocekavana IP SRV2-FS:    $expectedFsIP" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Identifikace stanice a adapteru
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
# 2. DNS konfigurace klienta na Ethernet1
# ------------------------------------------------------------
Write-Section "2. Nastaveni DNS serveru a pripony na Ethernet1"

$dnsServers = (Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue).ServerAddresses
if ($dnsServers -contains $expectedServerIP) {
    Report-Ok "Rozhrani Ethernet1 ma nastaven spravny DNS server $expectedServerIP"
} else {
    $foundDns = if ($dnsServers) { $dnsServers -join ', ' } else { "zadny" }
    Report-Fail "Rozhrani Ethernet1 ma DNS server '$foundDns', ocekavano '$expectedServerIP'" "Nastavte DNS server na 192.168.$wsX.10 (ručne nebo obnovou DHCP pomoci ipconfig /renew)"
}

$dnsClient = Get-DnsClient -InterfaceAlias "Ethernet1" -ErrorAction SilentlyContinue
if ($dnsClient -and $dnsClient.ConnectionSpecificSuffix) {
    $suffix = $dnsClient.ConnectionSpecificSuffix
    if ($suffix -match '\.cyberschool\.internal$') {
        Report-Ok "Domenova pripona (DNS Suffix) je: $suffix"
    } else {
        Report-Warn "Domenova pripona je '$suffix', doporuceno koncit na '.cyberschool.internal'"
    }
} else {
    Report-Warn "Rozhrani Ethernet1 nema nastavenou domenovou priponu" "Zkontrolujte DHCP Option 015 nebo zadejte priponu rucne"
}

# Kontrola priority rozhrani (InterfaceMetric Ethernet1 vs Ethernet0)
$metricEth1 = (Get-NetIPInterface -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue).InterfaceMetric
$metricEth0 = (Get-NetIPInterface -InterfaceAlias "Ethernet0" -AddressFamily IPv4 -ErrorAction SilentlyContinue).InterfaceMetric

if ($metricEth1 -and $metricEth0 -and $metricEth1 -lt $metricEth0) {
    Report-Ok "Priorita adapteru (InterfaceMetric) je spravna: Ethernet1 ($metricEth1) ma prednost pred Ethernet0 ($metricEth0)"
} elseif ($metricEth1 -and $metricEth0) {
    Report-Warn "Ethernet1 ma metriku $metricEth1 a Ethernet0 ma $metricEth0 (Ethernet1 by mel mit nizsi metriku pro prednost DNS)" "Spuste: Set-NetIPInterface -InterfaceAlias 'Ethernet1' -InterfaceMetric 10; Set-NetIPInterface -InterfaceAlias 'Ethernet0' -InterfaceMetric 50"
} elseif ($metricEth1) {
    Report-Ok "Metrika rozhrani Ethernet1 je $metricEth1"
}

# ------------------------------------------------------------
# 3. Dopredny preklad (Forward Lookup: A zaznamy)
# ------------------------------------------------------------
Write-Section "3. Dopredny preklad jmen na IP adresy (A zaznamy)"

# Test srv2-fs
try {
    $resFs = Resolve-DnsName -Name "srv2-fs" -Type A -ErrorAction Stop
    $fsIp = ($resFs | Where-Object { $_.IPAddress }).IPAddress
    if ($fsIp -contains $expectedFsIP) {
        Report-Ok "Preklad jmena 'srv2-fs' -> $expectedFsIP byl uspesny"
    } else {
        Report-Fail "Preklad jmena 'srv2-fs' vratil IP '$($fsIp -join ', ')', ocekavano '$expectedFsIP'" "Zkontrolujte zaznam A pro srv2-fs na DNS serveru"
    }
} catch {
    Report-Fail "Dotaz na jmeno 'srv2-fs' selhal: $($_.Exception.Message)" "Overte, zda na SRV1-DC existuje zaznam A pro srv2-fs a bezi DNS server"
}

# Test srv1-dc
try {
    $resDc = Resolve-DnsName -Name "srv1-dc" -Type A -ErrorAction Stop
    $dcIp = ($resDc | Where-Object { $_.IPAddress }).IPAddress
    if ($dcIp -contains $expectedServerIP) {
        Report-Ok "Preklad jmena 'srv1-dc' -> $expectedServerIP byl uspesny"
    } else {
        Report-Warn "Preklad jmena 'srv1-dc' vratil IP '$($dcIp -join ', ')', ocekavano '$expectedServerIP'"
    }
} catch {
    Report-Fail "Dotaz na jmeno 'srv1-dc' selhal: $($_.Exception.Message)" "Overte sitove spojeni na DNS server $expectedServerIP"
}

# ------------------------------------------------------------
# 4. Reverzni preklad (Reverse Lookup: PTR zaznamy)
# ------------------------------------------------------------
Write-Section "4. Reverzni preklad IP adres na jmena (PTR zaznamy)"

# Reverz pro .20 (SRV2-FS)
try {
    $ptrFs = Resolve-DnsName -Name $expectedFsIP -Type PTR -ErrorAction Stop
    $nameFs = ($ptrFs | Where-Object { $_.NameHost }).NameHost
    if ($nameFs -like "*srv2-fs*") {
        Report-Ok "Reverzni dotaz na $expectedFsIP vratil doménove jmeno '$nameFs'"
    } else {
        Report-Warn "Reverzni dotaz na $expectedFsIP vratil '$nameFs', ocekavano jmeno s 'srv2-fs'"
    }
} catch {
    Report-Fail "Reverzni dotaz na $expectedFsIP selhal: $($_.Exception.Message)" "Overte vytvoreni reverzni zony a PTR zaznamu pro .20 na SRV1-DC"
}

# Reverz pro .10 (SRV1-DC)
try {
    $ptrDc = Resolve-DnsName -Name $expectedServerIP -Type PTR -ErrorAction Stop
    $nameDc = ($ptrDc | Where-Object { $_.NameHost }).NameHost
    if ($nameDc -like "*srv1-dc*") {
        Report-Ok "Reverzni dotaz na $expectedServerIP vratil doménove jmeno '$nameDc'"
    } else {
        Report-Warn "Reverzni dotaz na $expectedServerIP vratil '$nameDc', ocekavano jmeno s 'srv1-dc'"
    }
} catch {
    Report-Fail "Reverzni dotaz na $expectedServerIP selhal: $($_.Exception.Message)" "Doplnte chybějící PTR zaznam pro 10 v reverzni zone na SRV1-DC"
}

# ------------------------------------------------------------
# 5. Preklad aliasu CNAME ftp
# ------------------------------------------------------------
Write-Section "5. Preklad aliasu CNAME (ftp)"

$targetDomain = if ($suffix) { $suffix } else { "pachomov.cyberschool.internal" }
$ftpFqdn = "ftp.$targetDomain"

try {
    # Resolve-DnsName primo na DNS server SRV1-DC (192.168.X.10) na Ethernet1
    $resFtp = Resolve-DnsName -Name $ftpFqdn -Server $expectedServerIP -ErrorAction Stop | Select-Object Name, Type, NameHost, IPAddress
    $cnameRecord = $resFtp | Where-Object { $_.Type -eq "CNAME" }
    $aRecord = $resFtp | Where-Object { $_.Type -eq "A" }

    if ($cnameRecord -and $cnameRecord.NameHost -like "*srv2-fs*") {
        Report-Ok "Alias '$ftpFqdn' (Server: $expectedServerIP) odkazuje na '$($cnameRecord.NameHost)'"
    } elseif ($cnameRecord) {
        Report-Warn "Alias '$ftpFqdn' odkazuje na '$($cnameRecord.NameHost)', ocekavano 'srv2-fs'"
    } else {
        Report-Warn "Dotaz na '$ftpFqdn' vratil vysledek, ale nebyl detekovan zaznam typu CNAME"
    }

    if ($aRecord -and $aRecord.IPAddress -contains $expectedFsIP) {
        Report-Ok "Alias '$ftpFqdn' se uspesne prelozil na cilovou IP $expectedFsIP"
    } else {
        Report-Fail "Preklad aliasu '$ftpFqdn' nevratil cilovou IP $expectedFsIP" "Zkontrolujte A zaznam pro srv2-fs a cil aliasu ftp"
    }
} catch {
    try {
        $resFtp = Resolve-DnsName -Name "ftp" -Server $expectedServerIP -ErrorAction Stop | Select-Object Name, Type, NameHost, IPAddress
        $cnameRecord = $resFtp | Where-Object { $_.Type -eq "CNAME" }
        $aRecord = $resFtp | Where-Object { $_.Type -eq "A" }
        if ($cnameRecord -and $aRecord.IPAddress -contains $expectedFsIP) {
            Report-Ok "Alias 'ftp' se na serveru $expectedServerIP uspesne prelozil na $expectedFsIP"
        } else {
            Report-Fail "Preklad aliasu 'ftp' na $expectedServerIP nevratil $expectedFsIP"
        }
    } catch {
        Report-Fail "Dotaz Resolve-DnsName -Name '$ftpFqdn' -Server $expectedServerIP selhal: $($_.Exception.Message)" "Add-DnsServerResourceRecordCName -Name 'ftp' -HostNameAlias 'srv2-fs.<domena>' na SRV1-DC"
    }
}

# ------------------------------------------------------------
# 6. Test sitoveho spojeni pres domenove jmeno
# ------------------------------------------------------------
Write-Section "6. Test spojeni pomoci domenoveho jmena"

$pingRes = Test-Connection -ComputerName "srv1-dc" -Count 1 -Quiet -ErrorAction SilentlyContinue
if ($pingRes) {
    Report-Ok "Ping na jmeno 'srv1-dc' probehl uspesne"
} else {
    Report-Warn "Ping na jmeno 'srv1-dc' neodpovedel (muze byt blokovano firewallem na radici)" "Pokud 'Resolve-DnsName srv1-dc' proslo, DNS funguje spravne"
}

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
    Write-Host "VYSLEDEK: VSE V PORADKU! Klientska stanice PC1-WIN ma plne funkcni DNS." -ForegroundColor Green
    Write-Host "Modul 03 (DNS Server) je uspesne overen!" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA KLIENTOVI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Zkontrolujte konfiguraci zón na serveru SRV1-DC a nastaveni DNS klienta na PC1-WIN." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
