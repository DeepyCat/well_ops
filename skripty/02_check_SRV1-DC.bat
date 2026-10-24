@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Overovaci skript pro Modul 02: DHCP Server (SRV1-DC).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit konfigurace DHCP serveru na SRV1-DC:
    - Predpoklady ze stroje (Hostname, staticka IP 192.168.X.10/24, GW, DNS)
    - Instalace Windows role DHCP a RSAT nastroju
    - Sluzba DHCPServer a bezpecnostni skupiny
    - Autorizace DHCP serveru v Active Directory
    - IPv4 Scope 'Ucebna' (192.168.X.100 - 192.168.X.200, maska 24, stav Active)
    - DHCP Scope Options (Option 003 Router, 006 DNS, 015 Domain Name)
    - Evidence aktivnich zapujcek (Address Leases)
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni SRV1-DC - DHCP Server (Modul 02)"

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

Write-Header "WELL_OPS :: Overeni SRV1-DC - DHCP Server (Modul 02)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[VAROVANI] Skript neni spusten s pravy Administratora!" -ForegroundColor Yellow
    Write-Host "           Spustte konzoli jako Administrator, jinak nektere DHCP/AD testy nemusi projit." -ForegroundColor Yellow
    Write-Host ""
}

# ------------------------------------------------------------
# 0. Interaktivni detekce a volba cisla pracoviste X
# ------------------------------------------------------------
$detectedX = 2
try {
    $ipCandidate = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    if ($ipCandidate -match '^192\.168\.(\d+)\.10$') {
        $detectedX = [int]$matches[1]
    }
} catch {}

Write-Host "Tento skript overi pripravenost a konfiguraci role DHCP Server na SRV1-DC." -ForegroundColor Gray
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

$expectedIP = "192.168.$wsX.10"
$expectedGW = "192.168.$wsX.1"
$expectedScopeId = "192.168.$wsX.0"
$expectedStartRange = "192.168.$wsX.100"
$expectedEndRange = "192.168.$wsX.200"

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste:    $wsX" -ForegroundColor Gray
Write-Host "  IP adresa serveru:   $expectedIP" -ForegroundColor Gray
Write-Host "  Ocekavany DHCP obor: $expectedScopeId ($expectedStartRange - $expectedEndRange)" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Predpoklady: System a sit
# ------------------------------------------------------------
Write-Section "1. Predpoklady: System a sitova konfigurace"

$currentHost = $env:COMPUTERNAME
if ($currentHost -eq "SRV1-DC") {
    Report-Ok "Hostname serveru je 'SRV1-DC'"
} else {
    Report-Fail "Hostname serveru je '$currentHost', ocekavano 'SRV1-DC'" "Prejmenujte server pomoci Rename-Computer -NewName 'SRV1-DC' -Restart"
}

$eth1 = Get-NetAdapter -Name "Ethernet1" -ErrorAction SilentlyContinue
if ($null -ne $eth1 -and $eth1.Status -eq "Up") {
    Report-Ok "Adapter 'Ethernet1' (NIC 2) je ve stavu Up"
} elseif ($null -ne $eth1) {
    Report-Warn "Adapter 'Ethernet1' existuje, ale stav je '$($eth1.Status)'" "Zkontrolujte stav rozhrani v hypervizoru CyLab"
} else {
    Report-Fail "Adapter 'Ethernet1' nebyl nalezen" "Pridejte sitovy adapter v hypervizoru"
}

$ipObj = Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $ipObj -and $ipObj.IPAddress -eq $expectedIP) {
    Report-Ok "Staticka IPv4 adresa na Ethernet1 je $expectedIP/24"
} else {
    $found = if ($ipObj) { $ipObj.IPAddress } else { "zadna" }
    Report-Fail "Staticka IPv4 na Ethernet1 je '$found', ocekavano '$expectedIP'" "Nastavte statickou IP adresu 192.168.$wsX.10/24"
}

# ------------------------------------------------------------
# 2. Windows role DHCP a RSAT nastroje
# ------------------------------------------------------------
Write-Section "2. Instalace role DHCP Server a RSAT nastroju"

$dhcpFeat = Get-WindowsFeature -Name "DHCP" -ErrorAction SilentlyContinue
if ($null -ne $dhcpFeat -and $dhcpFeat.Installed) {
    Report-Ok "Windows Feature 'DHCP' je nainstalovana"
} else {
    Report-Fail "Role 'DHCP' neni nainstalovana" "Install-WindowsFeature -Name DHCP -IncludeManagementTools"
}

$rsatDhcp = Get-WindowsFeature -Name "RSAT-DHCP" -ErrorAction SilentlyContinue
if ($null -ne $rsatDhcp -and $rsatDhcp.Installed) {
    Report-Ok "Administracni nastroje 'RSAT-DHCP' jsou nainstalovany"
} else {
    Report-Fail "Nastroje 'RSAT-DHCP' nejsou nainstalovany" "Install-WindowsFeature -Name RSAT-DHCP"
}

# ------------------------------------------------------------
# 3. Sluzba DHCPServer a bezpecnostni skupiny
# ------------------------------------------------------------
Write-Section "3. Sluzba DHCPServer a bezpecnostni skupiny"

$dhcpSvc = Get-Service -Name "DHCPServer" -ErrorAction SilentlyContinue
if ($null -ne $dhcpSvc -and $dhcpSvc.Status -eq "Running") {
    Report-Ok "Sluzba 'DHCPServer' bezi (Running)"
} elseif ($null -ne $dhcpSvc) {
    Report-Fail "Sluzba 'DHCPServer' neni spustena (Stav: $($dhcpSvc.Status))" "Start-Service -Name DHCPServer"
} else {
    Report-Fail "Sluzba 'DHCPServer' neni v systemu zaregistrovana" "Dokoncete instalaci role DHCP Server"
}

# Bezpecnostni skupiny DHCP Users / DHCP Administrators
$secGroupUsers = Get-ADGroup -Identity "DHCP Users" -ErrorAction SilentlyContinue
$secGroupAdmins = Get-ADGroup -Identity "DHCP Administrators" -ErrorAction SilentlyContinue
if ($null -eq $secGroupUsers) {
    $secGroupUsers = Get-LocalGroup -Name "DHCP Users" -ErrorAction SilentlyContinue
}
if ($null -eq $secGroupAdmins) {
    $secGroupAdmins = Get-LocalGroup -Name "DHCP Administrators" -ErrorAction SilentlyContinue
}

if ($null -ne $secGroupUsers -and $null -ne $secGroupAdmins) {
    Report-Ok "Bezpecnostni skupiny 'DHCP Users' a 'DHCP Administrators' existuji"
} else {
    Report-Warn "Bezpecnostni skupiny DHCP nebyly plne detekovany" "Spustte prikaz: Add-DhcpServerSecurityGroup a restartujte sluzbu DHCPServer"
}

# ------------------------------------------------------------
# 4. Autorizace DHCP serveru v Active Directory
# ------------------------------------------------------------
Write-Section "4. Autorizace DHCP serveru v Active Directory"

try {
    $authorizedServers = Get-DhcpServerInDC -ErrorAction Stop
    $isAuthorized = $false
    foreach ($srv in $authorizedServers) {
        if ($srv.IPAddress -eq $expectedIP -or $srv.DnsName -like "*$currentHost*") {
            $isAuthorized = $true
            break
        }
    }

    if ($isAuthorized) {
        Report-Ok "DHCP Server je autorizovan v Active Directory ($expectedIP)"
    } else {
        Report-Fail "DHCP Server NENI autorizovan v AD pro IP $expectedIP" "Add-DhcpServerInDC -DnsName '$currentHost.$((Get-ADDomain).DNSRoot)' -IPAddress $expectedIP"
    }
} catch {
    Report-Warn "Nepodarilo se overit autorizaci v AD pres Get-DhcpServerInDC: $($_.Exception.Message)" "Overte autorizaci vizualne v konzoli DHCP Manager (zelena sipka nahoru)"
}

# ------------------------------------------------------------
# 5. Konfigurace DHCP oboru (Scope)
# ------------------------------------------------------------
Write-Section "5. Konfigurace DHCP oboru (Scope) a rozsahu"

$scope = $null
try {
    $scope = Get-DhcpServerv4Scope -ScopeId $expectedScopeId -ErrorAction SilentlyContinue
    if ($null -eq $scope) {
        # Zkusime najit libovolny scope
        $allScopes = Get-DhcpServerv4Scope -ErrorAction SilentlyContinue
        if ($allScopes) {
            $scope = $allScopes | Select-Object -First 1
        }
    }
} catch {}

if ($null -ne $scope) {
    if ($scope.ScopeId.IPAddressToString -eq $expectedScopeId) {
        Report-Ok "DHCP Scope '$($scope.Name)' pro podsyt $expectedScopeId existuje"
    } else {
        Report-Warn "Nalezen DHCP Scope pro podsyt '$($scope.ScopeId)', ocekavano '$expectedScopeId'" "Zkontrolujte ID podsiti"
    }

    if ($scope.StartRange.IPAddressToString -eq $expectedStartRange -and $scope.EndRange.IPAddressToString -eq $expectedEndRange) {
        Report-Ok "Rozsah adres oboru je spravny: $expectedStartRange az $expectedEndRange"
    } else {
        Report-Fail "Rozsah oboru je '$($scope.StartRange) - $($scope.EndRange)', ocekavano '$expectedStartRange - $expectedEndRange'" "Upravte rozsah v konzoli DHCP nebo pres Set-DhcpServerv4Scope"
    }

    if ($scope.SubnetMask.IPAddressToString -eq "255.255.255.0") {
        Report-Ok "Maska podsiti je 255.255.255.0 (/24)"
    } else {
        Report-Fail "Maska podsiti je '$($scope.SubnetMask)', ocekavano 255.255.255.0"
    }

    if ($scope.State -eq "Active") {
        Report-Ok "Stav DHCP Scope je 'Active'"
    } else {
        Report-Fail "DHCP Scope neni aktivni (Stav: $($scope.State))" "Set-DhcpServerv4Scope -ScopeId $($scope.ScopeId) -State Active"
    }
} else {
    Report-Fail "DHCP Scope pro sit $expectedScopeId nebyl nalezen" "Add-DhcpServerv4Scope -Name 'Ucebna' -StartRange '$expectedStartRange' -EndRange '$expectedEndRange' -SubnetMask '255.255.255.0' -State Active"
}

# ------------------------------------------------------------
# 6. Konfigurace DHCP voleb (Scope Options)
# ------------------------------------------------------------
Write-Section "6. Konfigurace DHCP voleb (Options)"

if ($null -ne $scope) {
    try {
        $options = Get-DhcpServerv4OptionValue -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
        
        # Option 3: Router
        $optRouter = $options | Where-Object { $_.OptionId -eq 3 }
        if ($optRouter -and $optRouter.Value -contains $expectedGW) {
            Report-Ok "Option 003 (Router / Default Gateway): $expectedGW"
        } elseif ($optRouter) {
            Report-Warn "Option 003 (Router) je '$($optRouter.Value -join ', ')', ocekavano '$expectedGW'" "Set-DhcpServerv4OptionValue -ScopeId $($scope.ScopeId) -Router '$expectedGW'"
        } else {
            Report-Fail "Option 003 (Router) neni v oboru definovana" "Set-DhcpServerv4OptionValue -ScopeId $($scope.ScopeId) -Router '$expectedGW'"
        }

        # Option 6: DNS Server
        $optDns = $options | Where-Object { $_.OptionId -eq 6 }
        if ($optDns -and $optDns.Value -contains $expectedIP) {
            Report-Ok "Option 006 (DNS Servers): $expectedIP"
        } elseif ($optDns) {
            Report-Warn "Option 006 (DNS Servers) je '$($optDns.Value -join ', ')', ocekavano '$expectedIP'" "Set-DhcpServerv4OptionValue -ScopeId $($scope.ScopeId) -DnsServer '$expectedIP'"
        } else {
            Report-Fail "Option 006 (DNS Servers) neni v oboru definovana" "Set-DhcpServerv4OptionValue -ScopeId $($scope.ScopeId) -DnsServer '$expectedIP'"
        }

        # Option 15: Domain Name
        $optDomain = $options | Where-Object { $_.OptionId -eq 15 }
        if ($optDomain -and ($optDomain.Value -match '\.cyberschool\.internal$' -or $optDomain.Value.Count -gt 0)) {
            Report-Ok "Option 015 (DNS Domain Name): $($optDomain.Value -join ', ')"
            Report-Warn "Overte vizualne: Odpovida nazev domeny v Option 015 tvaru '<prijmeni>.cyberschool.internal'?"
        } else {
            Report-Fail "Option 015 (DNS Domain Name) chybi nebo neni nastavena" "Set-DhcpServerv4OptionValue -ScopeId $($scope.ScopeId) -DnsDomain '<prijmeni>.cyberschool.internal'"
        }
    } catch {
        Report-Warn "Chyba pri cteni DHCP Option Values: $($_.Exception.Message)"
    }
}

# ------------------------------------------------------------
# 7. Kontrola aktivnich zapujcek (Address Leases)
# ------------------------------------------------------------
Write-Section "7. Kontrola evidovanych zapujcek (Address Leases)"

if ($null -ne $scope) {
    try {
        $leases = Get-DhcpServerv4Lease -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
        $pc1Lease = $leases | Where-Object { $_.HostName -like "*PC1*" -or $_.HostName -like "*pc1*" }
        
        if ($pc1Lease) {
            Report-Ok "Aktivni zapujcka pro klienta PC1 nalezena: IP $($pc1Lease.IPAddress) (Host: $($pc1Lease.HostName))"
        } elseif ($leases.Count -gt 0) {
            Report-Warn "V databazi jsou evidovany jine zapujcky ($($leases.Count) ks), ale PC1-WIN zatim chybi" "Zapnete PC1-WIN a obnovte adresu pomoci 'ipconfig /renew Ethernet1'"
        } else {
            Report-Warn "V DHCP oboru zatim neni evidovana zadna aktivni zapujcka" "Zapnete klientskou stanici PC1-WIN s nastavenym DHCP a overte, zda ziskala IP adresu"
        }
    } catch {
        Report-Warn "Nelze precist zapujcky DHCP: $($_.Exception.Message)"
    }
}

# ------------------------------------------------------------
# 8. Vizuální kontroly (Konzole DHCP)
# ------------------------------------------------------------
Write-Section "8. Vizuální kontrola v grafické konzoli"

Report-Warn "Graficka konzole DHCP Manager (dhcpmgmt.msc): Overte zelenou ikonu aktivniho a autorizovaneho serveru" "Server Manager -> Tools -> DHCP"

# ------------------------------------------------------------
# 9. Zaverecny souhrn
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
    Write-Host "VYSLEDEK: VSE V PORADKU! DHCP Server na SRV1-DC splnuje pozadavky Modulu 02." -ForegroundColor Green
    Write-Host "Muzete pokracovat overenim na klientovi PC1-WIN." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA STROJI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Projdete cervene radky s oznacenim [CHYBA] a provedte doporucenou napravu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
