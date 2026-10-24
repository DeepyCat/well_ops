@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Overovaci skript pro Modul 00: Priprava a instalace OS (PC1-WIN).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit zakladni pripravy klientske stanice PC1-WIN:
    - Hostname stroje (PC1-WIN)
    - Edice operacniho systemu (Windows 11 Education / Education N)
    - Sitovy adapter Ethernet1 (NIC 2 v CyLabu)
    - Sitovy rezim: DHCP povolen (pripadne testovaci staticka IP 192.168.X.100)
    - Povoleni vestaveneho uctu Administrator (ve Win 11 je vychoze zakazan!)
    - Lokalizace: Casove pasmo Praha, regionalni format cs-CZ, klavesnice CZ a US
    - Firewall: Povolene ICMP Echo Request (Ping) pravidlo
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni PC1-WIN - Priprava OS (Modul 00)"

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

Write-Header "WELL_OPS :: Overeni PC1-WIN - Priprava OS (Modul 00)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[VAROVANI] Skript neni spusten s pravy Administratora!" -ForegroundColor Yellow
    Write-Host "           Pro kontrolu uctu Administrator a firewallu doporucujeme spustit konzoli jako Administrator." -ForegroundColor Yellow
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

Write-Host "Tento skript overi pripravenost ciste instalace klienta PC1-WIN." -ForegroundColor Gray
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

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste:  $wsX" -ForegroundColor Gray
Write-Host "  Ocekavany Hostname: PC1-WIN" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Hostname a edice operacniho systemu
# ------------------------------------------------------------
Write-Section "1. Hostname a edice Windows"

$currentHost = $env:COMPUTERNAME
if ($currentHost -eq "PC1-WIN") {
    Report-Ok "Hostname stroje je 'PC1-WIN'"
} else {
    Report-Fail "Hostname stroje je '$currentHost', ocekavano 'PC1-WIN'" "Rename-Computer -NewName 'PC1-WIN' -Restart"
}

$os = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
if ($null -ne $os) {
    if ($os.Caption -like "*Windows 11*Education*") {
        Report-Ok "Edice operacniho systemu: $($os.Caption)"
    } elseif ($os.Caption -like "*Windows 11*") {
        Report-Warn "Operacni system je '$($os.Caption)' (doporucena edice: Windows 11 Education / Education N)"
    } else {
        Report-Warn "Operacni system je '$($os.Caption)' (zadani pozaduje Windows 11)"
    }
}

# ------------------------------------------------------------
# 2. Sitovy adapter Ethernet1
# ------------------------------------------------------------
Write-Section "2. Sitovy adapter Ethernet1"

$eth1 = Get-NetAdapter -Name "Ethernet1" -ErrorAction SilentlyContinue
if ($null -ne $eth1 -and $eth1.Status -eq "Up") {
    Report-Ok "Adapter 'Ethernet1' (NIC 2 v CyLabu) existuje a je ve stavu Up"
} elseif ($null -ne $eth1) {
    Report-Warn "Adapter 'Ethernet1' existuje, ale stav je '$($eth1.Status)'" "Zkontrolujte zapnuti NIC 2 v CyLabu"
} else {
    Report-Fail "Adapter 'Ethernet1' nebyl nalezen" "Pridejte sitovy adapter NIC 2 v hypervizoru"
}

$ipInt = Get-NetIPInterface -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue
$ipObj = Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1

if ($null -ne $ipInt -and $ipInt.Dhcp -eq "Enabled") {
    Report-Ok "Rozhrani Ethernet1 ma aktivni rezim DHCP klienta (vychozi pro Modul 00)"
    if ($null -ne $ipObj -and $ipObj.IPAddress -like "169.254.*") {
        Report-Warn "Adapter ma adresu APIPA ($($ipObj.IPAddress)) - to je v Modulu 00 normalni, protoze DHCP server bude nastaven az v Modulu 02" "Pro otestovani pingu muzete docasne nastavit statickou IP 192.168.$wsX.100"
    } elseif ($null -ne $ipObj -and $ipObj.IPAddress -like "192.168.$wsX.*") {
        Report-Ok "Adapter ma jiz prirazenu adresu ze site 192.168.$wsX.0/24: $($ipObj.IPAddress)"
    }
} elseif ($null -ne $ipObj -and $ipObj.IPAddress -eq "192.168.$wsX.100") {
    Report-Ok "Na Ethernet1 je nastavena docasna testovaci staticka IP: 192.168.$wsX.100/24"
    Report-Warn "Pred hodnocenim Modulu 02 vratte adapter na automaticke ziskavani z DHCP"
} else {
    Report-Warn "Stav IPv4 na Ethernet1: $($ipObj.IPAddress)" "V Modulu 00 ma byt na Ethernet1 ponechano ziskavani z DHCP (pripadne testovaci IP 192.168.$wsX.100)"
}

# ------------------------------------------------------------
# 3. Ucet spravce (Administrator) - Kriticky bod ve Windows 11!
# ------------------------------------------------------------
Write-Section "3. Ucet spravce (Administrator)"

$adminUser = Get-LocalUser -Name "Administrator" -ErrorAction SilentlyContinue
if ($null -ne $adminUser -and $adminUser.Enabled) {
    Report-Ok "Vestaveny ucet 'Administrator' je povolen (Enabled: True)"
} elseif ($null -ne $adminUser) {
    Report-Fail "Vestaveny ucet 'Administrator' je zakazan (Enabled: False)" "Ve Windows 11 je nutne ucet rucne povolit: Enable-LocalUser -Name Administrator"
} else {
    Report-Fail "Ucet 'Administrator' nebyl v systemu nalezen"
}

Report-Warn "Heslo administratora: Z bezpecnostnich duvodu nelze precist heslo v plaintextu" "Overte, ze jste nastavili heslo 'Pa55w.rd'"

# ------------------------------------------------------------
# 4. Lokalizace, cas a region (cs-CZ)
# ------------------------------------------------------------
Write-Section "4. Lokalizace, cas a regionalni nastaveni"

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
# 5. Firewall a pravidlo pro Ping (ICMP)
# ------------------------------------------------------------
Write-Section "5. Windows Firewall a ICMP Echo (Ping)"

$icmpRule = Get-NetFirewallRule -Name "FPS-ICMP4-ERQ-In" -ErrorAction SilentlyContinue
$customIcmp = Get-NetFirewallRule -DisplayName "*ICMP*Ping*" -ErrorAction SilentlyContinue

$pingAllowed = ($null -ne $icmpRule -and $icmpRule.Enabled -eq "True") -or ($null -ne $customIcmp -and ($customIcmp | Where-Object { $_.Enabled -eq "True" }))
if ($pingAllowed) {
    Report-Ok "Pravidlo pro prichozi ICMP Echo (Ping) je ve Windows Firewallu povoleno"
} else {
    Report-Warn "Prichozi ping (ICMP) neni ve firewallu povolen" "Enable-NetFirewallRule -Name 'FPS-ICMP4-ERQ-In'"
}

# ------------------------------------------------------------
# 6. Aktivace Windows (LAB KEY)
# ------------------------------------------------------------
Write-Section "6. Aktivace licence Windows"

Report-Warn "Aktivace Windows: Licencni klic (LAB KEY) si overte pomoci 'slmgr.vbs /dli'" "Klic zadavejte vzdy ze zadani v Microsoft Teams"

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
    Write-Host "VYSLEDEK: VSE V PORADKU! Stroj PC1-WIN splnuje zakladni pozadavky Modulu 00." -ForegroundColor Green
    Write-Host "Stanice je pripravena pro konfiguraci DHCP klienta v Modulu 02." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA STROJI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Projdete cervene radky s oznacenim [CHYBA] a provedte doporucenou napravu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
