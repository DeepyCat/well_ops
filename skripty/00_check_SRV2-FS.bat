@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Overovaci skript pro Modul 00: Priprava a instalace OS (SRV2-FS).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit zakladni pripravy souboroveho serveru SRV2-FS:
    - Hostname stroje (SRV2-FS)
    - Edice operacniho systemu (Windows Server 2025 Datacenter)
    - Pristupne disky (kontrola 5 pridanych sekundarnich disku pro Storage Pool)
    - Sitovy adapter Ethernet1 (NIC 2 v CyLabu)
    - Staticka IPv4 adresa 192.168.X.20/24, brana 192.168.X.1, DNS 192.168.X.10 (SRV1-DC)
    - Stav mistniho uctu Administrator (aktivni)
    - Lokalizace: Casove pasmo Praha, regionalni format cs-CZ, klavesnice CZ a US
    - Firewall: Povolene ICMP Echo Request (Ping) pravidlo
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni SRV2-FS - Priprava OS (Modul 00)"

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

Write-Header "WELL_OPS :: Overeni SRV2-FS - Priprava OS (Modul 00)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[VAROVANI] Skript neni spusten s pravy Administratora!" -ForegroundColor Yellow
    Write-Host "           Pro kontrolu disku a firewallu doporucujeme spustit konzoli jako Administrator." -ForegroundColor Yellow
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

Write-Host "Tento skript overi pripravenost ciste instalace serveru SRV2-FS." -ForegroundColor Gray
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

$expectedIP = "192.168.$wsX.20"
$expectedGW = "192.168.$wsX.1"
$expectedDNS = "192.168.$wsX.10"

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste:  $wsX" -ForegroundColor Gray
Write-Host "  Ocekavany Hostname: SRV2-FS" -ForegroundColor Gray
Write-Host "  Ocekavana IP:       $expectedIP / 24" -ForegroundColor Gray
Write-Host "  Ocekavana brana:    $expectedGW" -ForegroundColor Gray
Write-Host "  Ocekavany DNS:      $expectedDNS" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Hostname a edice operacniho systemu
# ------------------------------------------------------------
Write-Section "1. Hostname a edice Windows"

$currentHost = $env:COMPUTERNAME
if ($currentHost -eq "SRV2-FS") {
    Report-Ok "Hostname stroje je 'SRV2-FS'"
} else {
    Report-Fail "Hostname stroje je '$currentHost', ocekavano 'SRV2-FS'" "Rename-Computer -NewName 'SRV2-FS' -Restart"
}

$os = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
if ($null -ne $os) {
    if ($os.Caption -like "*Server 2025*Datacenter*") {
        Report-Ok "Edice operacniho systemu: $($os.Caption)"
    } elseif ($os.Caption -like "*Server 2025*") {
        Report-Warn "Operacni system je '$($os.Caption)' (doporucena edice: Datacenter Desktop Experience)"
    } else {
        Report-Warn "Operacni system je '$($os.Caption)' (zadani specifikuje Windows Server 2025 Datacenter)"
    }
}

# ------------------------------------------------------------
# 2. Priprava fyzickych / virtualnich disku (Storage Pool)
# ------------------------------------------------------------
Write-Section "2. Disky pro Storage Pool (Modul 06)"

try {
    $disks = Get-Disk -ErrorAction SilentlyContinue
    $diskCount = if ($disks) { $disks.Count } else { 0 }
    
    # Ocekava se 1 systemovy disk + 5 pridavnych disku = celkem alespon 6 disku
    if ($diskCount -ge 6) {
        Report-Ok "Detekovano $diskCount fyzickych disku (1 systemovy + 5 pridavnych pro Storage Pool)"
    } elseif ($diskCount -gt 1) {
        Report-Warn "Detekovano $diskCount disku (zadani pozaduje 1 systemovy + 5 pridavnych po 5-10 GB)" "Pridejte zbyvajici disky v nastaveni virtualniho stroje v CyLabu"
    } else {
        Report-Fail "Detekovan pouze 1 disk ($diskCount). Pro Storage Pool chybi 5 pridavnych disku!" "Vypnete VM a pridejte v CyLabu 5× virtualni disk (5-10 GB)"
    }
} catch {
    Report-Warn "Chyba pri zjistovani disku: $($_.Exception.Message)"
}

# ------------------------------------------------------------
# 3. Sitova konfigurace Ethernet1
# ------------------------------------------------------------
Write-Section "3. Sitovy adapter Ethernet1"

$eth1 = Get-NetAdapter -Name "Ethernet1" -ErrorAction SilentlyContinue
if ($null -ne $eth1 -and $eth1.Status -eq "Up") {
    Report-Ok "Adapter 'Ethernet1' (NIC 2 v CyLabu) existuje a je ve stavu Up"
} elseif ($null -ne $eth1) {
    Report-Warn "Adapter 'Ethernet1' existuje, ale stav je '$($eth1.Status)'" "Zkontrolujte zapnuti NIC 2 v CyLabu"
} else {
    Report-Fail "Adapter 'Ethernet1' nebyl nalezen" "Pridejte sitovy adapter NIC 2 v hypervizoru"
}

$ipObj = Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $ipObj -and $ipObj.IPAddress -eq $expectedIP -and $ipObj.PrefixLength -eq 24) {
    Report-Ok "Staticka IPv4 adresa je $expectedIP/24"
} elseif ($null -ne $ipObj) {
    Report-Fail "IPv4 adresa na Ethernet1 je '$($ipObj.IPAddress)/$($ipObj.PrefixLength)', ocekavano '$expectedIP/24'" "New-NetIPAddress -InterfaceAlias Ethernet1 -IPAddress $expectedIP -PrefixLength 24 -DefaultGateway $expectedGW"
} else {
    Report-Fail "Na adapteru Ethernet1 neni nastavena zadna IPv4 adresa" "Nastavte adresu $expectedIP/24"
}

$gwRoute = Get-NetRoute -InterfaceAlias "Ethernet1" -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $gwRoute -and $gwRoute.NextHop -eq $expectedGW) {
    Report-Ok "Vychozi brana je nastavena na $expectedGW"
} elseif ($null -ne $gwRoute) {
    Report-Warn "Vychozi brana je '$($gwRoute.NextHop)', ocekavano '$expectedGW'"
} else {
    Report-Warn "Na adapteru Ethernet1 neni definovana vychozi brana 0.0.0.0/0"
}

$dnsClient = Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue
$dnsAddresses = if ($dnsClient) { $dnsClient.ServerAddresses } else { @() }
if ($dnsAddresses -contains $expectedDNS) {
    Report-Ok "Preferovany DNS server ukazuje na SRV1-DC ($expectedDNS)"
} else {
    Report-Warn "DNS server na Ethernet1 je nastaven na: $($dnsAddresses -join ', ')" "Nastavte DNS na IP radice domeny SRV1-DC ($expectedDNS)"
}

# ------------------------------------------------------------
# 4. Ucet spravce (Administrator)
# ------------------------------------------------------------
Write-Section "4. Ucet spravce a bezpecnost"

$adminUser = Get-LocalUser -Name "Administrator" -ErrorAction SilentlyContinue
if ($null -ne $adminUser -and $adminUser.Enabled) {
    Report-Ok "Ucet 'Administrator' existuje a je aktivni (Enabled: True)"
} elseif ($null -ne $adminUser) {
    Report-Fail "Ucet 'Administrator' je zakazany (Enabled: False)" "Enable-LocalUser -Name Administrator"
} else {
    Report-Fail "Ucet 'Administrator' nebyl v mistni SAM databazi nalezen"
}

Report-Warn "Heslo administratora: Z bezpecnostnich duvodu nelze precist heslo v plaintextu" "Overte, ze jste nastavili heslo 'Pa55w.rd'"

# ------------------------------------------------------------
# 5. Lokalizace, cas a region (cs-CZ)
# ------------------------------------------------------------
Write-Section "5. Lokalizace, cas a regionalni nastaveni"

$tz = Get-TimeZone -ErrorAction SilentlyContinue
if ($null -ne $tz -and ($tz.Id -eq "Central Europe Standard Time" -or $tz.Id -eq "W. Europe Standard Time")) {
    Report-Ok "Casove pasmo je nastaveno na $($tz.DisplayName)"
} else {
    $tzName = if ($tz) { $tz.Id } else { "Nezname" }
    Report-Warn "Casove pasmo je '$tzName', ocekavano 'Central Europe Standard Time' (Praha)" "Set-TimeZone -Id 'Central Europe Standard Time'"
}

$culture = Get-Culture -ErrorAction SilentlyContinue
if ($null -ne $culture -and $culture.Name -eq "cs-CZ") {
    Report-Ok "Regionalni format je nastaven na cs-CZ (Cestina)"
} else {
    $cName = if ($culture) { $culture.Name } else { "Nezname" }
    Report-Warn "Regionalni format je '$cName' (doporuceno: cs-CZ)" "Set-Culture -CultureInfo cs-CZ"
}

# Rozlozeni klavesnice
try {
    $layouts = (Get-WinUserLanguageList -ErrorAction SilentlyContinue).InputMethodTips
    $hasCs = $false
    $hasEn = $false
    foreach ($tip in $layouts) {
        if ($tip -like "0405*") { $hasCs = $true }
        if ($tip -like "0409*") { $hasEn = $true }
    }
    if ($hasCs -and $hasEn) {
        Report-Ok "Klavesnice obsahuje jak ceske (0405), tak americke (0409) rozlozeni"
    } elseif ($hasCs) {
        Report-Ok "Ceske rozlozeni klavesnice (QWERTZ) je aktivni"
    } else {
        Report-Warn "Ceske rozlozeni klavesnice (0405) nebylo detekovano v seznamu jazyku" "Pridejte ceskou klavesnici v Settings -> Time & Language"
    }
} catch {
    Report-Warn "Nelze nacist seznam rozlozeni klavesnic: $($_.Exception.Message)"
}

# ------------------------------------------------------------
# 6. Firewall a pravidlo pro Ping (ICMP)
# ------------------------------------------------------------
Write-Section "6. Windows Firewall a ICMP Echo (Ping)"

$icmpRule = Get-NetFirewallRule -Name "FPS-ICMP4-ERQ-In" -ErrorAction SilentlyContinue
$customIcmp = Get-NetFirewallRule -DisplayName "*ICMP*Ping*" -ErrorAction SilentlyContinue

$pingAllowed = ($null -ne $icmpRule -and $icmpRule.Enabled -eq "True") -or ($null -ne $customIcmp -and ($customIcmp | Where-Object { $_.Enabled -eq "True" }))
if ($pingAllowed) {
    Report-Ok "Pravidlo pro prichozi ICMP Echo (Ping) je ve Windows Firewallu povoleno"
} else {
    Report-Warn "Prichozi ping (ICMP) neni ve firewallu povolen" "Enable-NetFirewallRule -Name 'FPS-ICMP4-ERQ-In'"
}

# ------------------------------------------------------------
# 7. Aktivace Windows (LAB KEY)
# ------------------------------------------------------------
Write-Section "7. Aktivace licence Windows"

Report-Warn "Aktivace Windows: Licencni klic (LAB KEY) si overte pomoci 'slmgr.vbs /dli'" "Klic zadavejte vzdy ze zadani v Microsoft Teams"

# ------------------------------------------------------------
# 8. Zaverecny souhrn
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
    Write-Host "VYSLEDEK: VSE V PORADKU! Stroj SRV2-FS splnuje zakladni pozadavky Modulu 00." -ForegroundColor Green
    Write-Host "Stroj je pripraven pro souborove sluzby (Modul 06)." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA STROJI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Projdete cervene radky s oznacenim [CHYBA] a provedte doporucenou napravu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
