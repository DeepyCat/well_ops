@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Overovaci skript pro Modul 04: Active Directory (PC1-WIN).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit klientske stanice PC1-WIN (pouziva pouze klientske nastroje):
    - Predpoklady (hostname PC1-WIN, adapter Ethernet1, IP, DNS = 192.168.X.10, metrika Ethernet1)
    - Pripojeni do domeny (Win32_ComputerSystem PartOfDomain, SecureChannel, dostupnost SRV1-DC SMB/445)
    - Overeni AD prihlasovacich udaju postav (eva.student, lucie.student, jana.teacher, karel.zamestnanec, tomas.student)
    - Kontrola lokalnich profilu (Win32_UserProfile) jako dukaz interaktivniho prihlaseni postav
    - Overeni 'net user eva.student /domain' (Home directory + User profile)
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni PC1-WIN - Klient v domene (Modul 04)"

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
    Write-Host "--- $Title ---" -ForegroundColor Yellow
}

function Report-Ok {
    param([string]$Message)
    Write-Host "  [ OK ]     $Message" -ForegroundColor Green
    $global:okCount++
}

function Report-Warn {
    param([string]$Message, [string]$Hint = "")
    Write-Host "  [KONTROLA] $Message" -ForegroundColor Yellow
    if ($Hint) { Write-Host "             -> $Hint" -ForegroundColor DarkYellow }
    $global:warnCount++
}

function Report-Fail {
    param([string]$Message, [string]$FixHint = "")
    Write-Host "  [CHYBA]    $Message" -ForegroundColor Red
    if ($FixHint) { Write-Host "             -> $FixHint" -ForegroundColor DarkRed }
    $global:failCount++
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[!] POZOR: Skript nebezi jako Administrator!" -ForegroundColor Red
    Write-Host "    Nektere kontroly (napr. SecureChannel) vyzaduji PowerShell jako Spravce." -ForegroundColor Yellow
}

Write-Header "WELL_OPS :: Overeni PC1-WIN - Klient v domene (Modul 04)"

# ------------------------------------------------------------
# 1. Zakladni system a sit na rozhrani Ethernet1
# ------------------------------------------------------------
Write-Section "1. Zakladni system a sit Ethernet1"

$pcName = $env:COMPUTERNAME
if ($pcName -eq "PC1-WIN") {
    Report-Ok "Hostname stanice je PC1-WIN"
} else {
    Report-Warn "Hostname stanice je '$pcName' (ocekava se 'PC1-WIN')"
}

$detectedX = 2
$eth1IP = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if ($eth1IP -and ($eth1IP -match "^192\.168\.(\d+)\.")) {
    $detectedX = [int]$matches[1]
}
if ($WorkspaceX -le 0) {
    Write-Host "Zadejte cislo vaseho pracoviste (N) [vychozi: $detectedX]: " -ForegroundColor Yellow -NoNewline
    $wsInput = Read-Host
    if ((-not [string]::IsNullOrWhiteSpace($wsInput)) -and ($wsInput.Trim() -match "^\d+$")) {
        $WorkspaceX = [int]$wsInput.Trim()
    } else {
        $WorkspaceX = $detectedX
    }
}

if ($eth1IP -and ($eth1IP -match "^192\.168\.$WorkspaceX\.")) {
    Report-Ok "Rozhrani Ethernet1 ma IPv4 adresu $eth1IP (Pracoviste N=$WorkspaceX)"
} elseif ($eth1IP) {
    Report-Warn "Rozhrani Ethernet1 ma IPv4 adresu $eth1IP (ocekavano v siti 192.168.$WorkspaceX.0/24)" "Overte DHCP pridelovani od SRV1-DC nebo cislo pracoviste N=$WorkspaceX"
} else {
    Report-Fail "Rozhrani Ethernet1 nema IPv4 adresu" "Zkontrolujte adapter Ethernet1 (NIC 2)"
}

$dnsServers = @((Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue).ServerAddresses)
if ($dnsServers -contains "192.168.$WorkspaceX.10") {
    Report-Ok "DNS server na Ethernet1 je 192.168.$WorkspaceX.10 (SRV1-DC)"
} else {
    Report-Fail "DNS server na Ethernet1 neodpovida SRV1-DC (aktualne: $($dnsServers -join ', '))" "Nastavte DNS na 192.168.$WorkspaceX.10"
}

$eth1If = Get-NetIPInterface -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue
$eth0If = Get-NetIPInterface -InterfaceAlias "Ethernet0" -AddressFamily IPv4 -ErrorAction SilentlyContinue
if (($null -ne $eth1If) -and ($null -ne $eth0If) -and ($eth0If.InterfaceMetric -lt $eth1If.InterfaceMetric)) {
    Report-Warn "Metrika Ethernet0 ($($eth0If.InterfaceMetric)) je nizsi nez Ethernet1 ($($eth1If.InterfaceMetric))" "Doporuceno: Set-NetIPInterface -InterfaceAlias 'Ethernet1' -InterfaceMetric 10"
}

$eth1If = Get-NetIPInterface -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
$eth0If = Get-NetIPInterface -InterfaceAlias "Ethernet0" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
if (($null -ne $eth1If) -and ($null -ne $eth0If)) {
    if ($eth1If.InterfaceMetric -lt $eth0If.InterfaceMetric) {
        Report-Ok "Priorita adapteru: Ethernet1 ($($eth1If.InterfaceMetric)) ma vyssi prioritu nez Ethernet0 ($($eth0If.InterfaceMetric))"
    } else {
        Report-Warn "Ethernet1 ($($eth1If.InterfaceMetric)) nema nizsi metriku nez Ethernet0 ($($eth0If.InterfaceMetric))" "Doporuceno nastavit Ethernet1 na 10 a Ethernet0 na 50"
    }
}

# ------------------------------------------------------------
# 2. M4-PC1.V1: Pripojeni do domeny a spojeni s SRV1-DC
# ------------------------------------------------------------
Write-Section "2. Clenstvi v domene a bezpecny kanal (M4-PC1.V1)"

$cs = Get-CimInstance -ClassName Win32_ComputerSystem -ErrorAction SilentlyContinue
$domain = ""
if (($null -ne $cs) -and ($cs.PartOfDomain)) {
    $domain = $cs.Domain
    if ($domain -like "*.cyberschool.internal") {
        Report-Ok "PC1-WIN je clenem domeny: $domain"
    } else {
        Report-Warn "PC1-WIN je v domene '$domain' (ocekava se *.cyberschool.internal)"
    }
} else {
    Report-Fail "PC1-WIN NENI pripojen do domeny (PartOfDomain = False)" "Spustte Add-Computer -DomainName <prijmeni>.cyberschool.internal -Restart"
}

if ($domain) {
    $srvTest = Resolve-DnsName -Name "_ldap._tcp.dc._msdcs.$domain" -Type SRV -ErrorAction SilentlyContinue
    if ($srvTest) {
        Report-Ok "DNS SRV zaznam radice domeny ($domain) je dostupny"
    } else {
        Report-Fail "Nelze prelozit SRV zaznam radice domeny $domain" "Overte DNS nastaveni na Ethernet1 a zonu na SRV1-DC"
    }

    if ($isAdmin) {
        try {
            $scOk = Test-ComputerSecureChannel -ErrorAction Stop
            if ($scOk) {
                Report-Ok "Bezpecny kanal s radicem domeny (Test-ComputerSecureChannel) je funkcni"
            } else {
                Report-Fail "Bezpecny kanal s radicem domeny selhal" "Overte casovy rozdil (< 5 min) a objekt PC1-WIN v AD"
            }
        } catch {
            Report-Warn "Test-ComputerSecureChannel nelze overit: $($_.Exception.Message)"
        }
    }

    $smbConn = Test-NetConnection -ComputerName "SRV1-DC" -Port 445 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if (($null -ne $smbConn) -and ($smbConn.TcpTestSucceeded)) {
        Report-Ok "SMB port 445 na SRV1-DC je dostupny"
    } else {
        Report-Fail "Port 445 (SMB) na SRV1-DC neni dostupny" "Overte bezici sluzbu LanmanServer a firewall na SRV1-DC"
    }
}

# ------------------------------------------------------------
# 3. M4-PC1.V5: Overeni domenovych uctu a lokalnich profilu
# ------------------------------------------------------------
Write-Section "3. Overeni domenovych prihlaseni postav (M4-PC1.V5)"

if ($domain) {
    $charsToCheck = @("eva.student", "lucie.student", "jana.teacher", "karel.zamestnanec", "tomas.student")
    try {
        Add-Type -AssemblyName System.DirectoryServices.AccountManagement -ErrorAction Stop
        $ctx = New-Object System.DirectoryServices.AccountManagement.PrincipalContext(
            [System.DirectoryServices.AccountManagement.ContextType]::Domain,
            $domain
        )
        foreach ($u in $charsToCheck) {
            $valid = $ctx.ValidateCredentials($u, "Pa55w.rd")
            if ($valid) {
                Report-Ok "Overeni AD hesla (Pa55w.rd) z PC1-WIN pro '$u' proslo"
            } else {
                Report-Fail "Overeni AD prihlaseni pro '$u' s heslem Pa55w.rd selhalo" "Zkontrolujte ucet, heslo a stav Enabled na SRV1-DC"
            }
        }
    } catch {
        Report-Warn "Nelze overit ucty pres PrincipalContext: $($_.Exception.Message)"
    }

    $localProfiles = @(Get-CimInstance -ClassName Win32_UserProfile -ErrorAction SilentlyContinue)
    foreach ($u in @("eva.student", "lucie.student", "jana.teacher", "karel.zamestnanec")) {
        $profMatch = $localProfiles | Where-Object { $_.LocalPath -like "*\$u" } | Select-Object -First 1
        if ($profMatch) {
            Report-Ok "Na PC1-WIN existuje lokalni stopa prihlaseni uzivatele '$u' ($($profMatch.LocalPath))"
        } else {
            Report-Warn "Uzivatel '$u' se na tento PC1-WIN zatim interaktivne neprihlasil" "Prihlaste se na prihlasovaci obrazovce PC1-WIN jako $u@$domain (heslo Pa55w.rd)"
        }
    }
}

# ------------------------------------------------------------
# 4. M4-PC1.V6 & V9: Kontrola net user eva.student /domain
# ------------------------------------------------------------
Write-Section "4. Domovska slozka a kocovny profil eva.student (M4-PC1.V6, M4-PC1.V9)"

if ($domain) {
    $netOut = cmd.exe /c "net user eva.student /domain 2>&1"
    $netText = ($netOut | Out-String)
    if ($LASTEXITCODE -eq 0) {
        if ($netText -match "\\\\SRV1-DC\\home\$\\eva\.student") {
            Report-Ok "net user eva.student /domain hlasi spravnou Home directory (\\SRV1-DC\home$\eva.student)"
        } else {
            Report-Fail "net user eva.student /domain neobsahuje \\SRV1-DC\home$\eva.student" "Nastavte HomeDrive H: a HomeDirectory na SRV1-DC"
        }

        if ($netText -match "\\\\SRV1-DC\\profiles\$\\eva\.student") {
            Report-Ok "net user eva.student /domain hlasi spravny User profile (\\SRV1-DC\profiles$\eva.student)"
        } else {
            Report-Fail "net user eva.student /domain neobsahuje \\SRV1-DC\profiles$\eva.student" "Nastavte ProfilePath na SRV1-DC"
        }
    } else {
        Report-Fail "Prikaz 'net user eva.student /domain' selhal: $netText"
    }
}

# ------------------------------------------------------------
# 5. Zaverecny souhrn
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

if (($global:failCount -eq 0) -and ($global:warnCount -eq 0)) {
    Write-Host ""
    Write-Host "VYSLEDEK: VSE V PORADKU! Klientska stanice PC1-WIN je plne overena." -ForegroundColor Green
    Write-Host "Modul 04 (Active Directory) je na PC1-WIN pripraven k dokumentaci!" -ForegroundColor Gray
} elseif ($global:failCount -eq 0) {
    Write-Host ""
    Write-Host "VYSLEDEK: ZADNE ZAVAZNE CHYBY, zkontrolujte polozky [KONTROLA] ($($global:warnCount))." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA KLIENTOVI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Opravte cervene polozky vyse a spustte skript znovu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
