@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Overovaci skript pro Modul 01: Active Directory Domain Services (SRV1-DC).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit konfigurace stroje SRV1-DC:
    - Hostname, sitovy adapter Ethernet1, staticka IP 192.168.X.10/24, GW, DNS
    - Instalace Windows roli a funkci AD DS a RSAT
    - Stav radice domeny (Domain Controller), les a domena *.cyberschool.internal
    - FSMO role (vsech 5 na SRV1-DC) a Global Catalog (GC)
    - Klicove sluzby AD (NTDS, ADWS, Kdc, Netlogon) a sdileni SYSVOL / NETLOGON
    - Integrovany DNS Server a preklad domeny
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni SRV1-DC (Modul 01)"

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

Write-Header "WELL_OPS :: Overeni konfigurace SRV1-DC (Modul 01)"

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

Write-Host "Tento skript overi pripravenost a konfiguraci stroje SRV1-DC." -ForegroundColor Gray
Write-Host "Skript je STRIKTNE READ-ONLY - zadna nastaveni neupravuje." -ForegroundColor Gray
Write-Host ""
Write-Host "Zadejte cislo vaseho pracoviste (X) [vychozi: $detectedX]: " -ForegroundColor Yellow -NoNewline
$userInput = Read-Host

$wsX = $detectedX
if (-not [string]::IsNullOrWhiteSpace($userInput)) {
    if ($userInput -match '^\d+$') {
        $wsX = [int]$userInput
    } else {
        Write-Host "Neplatny vstup, pouzivam vychozi hodnotu: $detectedX" -ForegroundColor DarkYellow
    }
}

$expectedIP = "192.168.$wsX.10"
$expectedGW = "192.168.$wsX.1"

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste: $wsX" -ForegroundColor Gray
Write-Host "  Ocekavana IP:     $expectedIP / 24" -ForegroundColor Gray
Write-Host "  Ocekavana brana:  $expectedGW" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Kontrola systemu a site (Predpoklady)
# ------------------------------------------------------------
Write-Section "1. System a sitova konfigurace"

# 1.1 Hostname
$currentHost = $env:COMPUTERNAME
if ($currentHost -eq "SRV1-DC") {
    Report-Ok "Hostname stroje je 'SRV1-DC'"
} else {
    Report-Fail "Hostname stroje je '$currentHost', ocekavano 'SRV1-DC'" "Rename-Computer -NewName 'SRV1-DC' -Restart"
}

# 1.2 Adapter Ethernet1
$eth1 = Get-NetAdapter -Name "Ethernet1" -ErrorAction SilentlyContinue
if ($null -ne $eth1) {
    if ($eth1.Status -eq "Up") {
        Report-Ok "Sitovy adapter 'Ethernet1' existuje a je ve stavu Up"
    } else {
        Report-Warn "Sitovy adapter 'Ethernet1' existuje, ale stav je '$($eth1.Status)'" "Zkontrolujte pripojeni kabelu/site v hypervizoru CyLab"
    }
} else {
    Report-Fail "Sitovy adapter 'Ethernet1' nebyl v systemu nalezen" "Ujistete se, ze druha sitova karta (NIC 2) je prirazena stroji v CyLabu"
}

# 1.3 IPv4 adresa a maska
$ipObj = Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $ipObj) {
    if ($ipObj.IPAddress -eq $expectedIP -and $ipObj.PrefixLength -eq 24) {
        Report-Ok "IPv4 adresa na Ethernet1 je $($ipObj.IPAddress)/24"
    } else {
        Report-Fail "IPv4 adresa na Ethernet1 je '$($ipObj.IPAddress)/$($ipObj.PrefixLength)', ocekavano '$expectedIP/24'" "New-NetIPAddress -InterfaceAlias Ethernet1 -IPAddress $expectedIP -PrefixLength 24 -DefaultGateway $expectedGW"
    }
} else {
    Report-Fail "Na adapteru Ethernet1 neni nastavena zadna IPv4 adresa" "Nastavte statickou adresu $expectedIP/24"
}

# 1.4 Vychozi brana
$gwObj = Get-NetRoute -InterfaceAlias "Ethernet1" -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -ne $gwObj -and $gwObj.NextHop -eq $expectedGW) {
    Report-Ok "Vychozi brana je $expectedGW"
} elseif ($null -ne $gwObj) {
    Report-Warn "Vychozi brana je '$($gwObj.NextHop)', ocekavano '$expectedGW'" "Overte routovaci tabulku pomoci Get-NetRoute"
} else {
    Report-Warn "Na adapteru Ethernet1 neni definovana vychozi brana 0.0.0.0/0" "Pokud je brana na jinem rozhrani, je to v poradku, jinak pridejte 192.168.$wsX.1"
}

# 1.5 DNS klient
$dnsClient = Get-DnsClientServerAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue
$dnsIps = if ($dnsClient) { $dnsClient.ServerAddresses } else { @() }
if ($dnsIps -contains "127.0.0.1" -or $dnsIps -contains "::1" -or $dnsIps -contains $expectedIP) {
    Report-Ok "DNS klient na Ethernet1 ukazuje na lokalni resolver ($($dnsIps -join ', '))"
} else {
    Report-Warn "DNS klient na Ethernet1 je nastaven na: $($dnsIps -join ', ')" "Po povyseni na DC by mel preferovany DNS smerovat na 127.0.0.1 nebo $expectedIP"
}

# ------------------------------------------------------------
# 2. Windows role a funkce (AD DS a RSAT)
# ------------------------------------------------------------
Write-Section "2. Windows Server role a komponenty"

$adFeature = Get-WindowsFeature -Name "AD-Domain-Services" -ErrorAction SilentlyContinue
if ($null -ne $adFeature -and $adFeature.Installed) {
    Report-Ok "Role 'Active Directory Domain Services' (AD-Domain-Services) je nainstalovana"
} else {
    Report-Fail "Role 'AD-Domain-Services' neni nainstalovana" "Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools"
}

$rsatFeature = Get-WindowsFeature -Name "RSAT-ADDS" -ErrorAction SilentlyContinue
if ($null -ne $rsatFeature -and $rsatFeature.Installed) {
    Report-Ok "Administracni nastroje 'RSAT-ADDS' jsou nainstalovany"
} else {
    Report-Fail "Nastroje 'RSAT-ADDS' nejsou nainstalovany" "Install-WindowsFeature -Name RSAT-ADDS"
}

# ------------------------------------------------------------
# 3. Stav radice domeny a Active Directory
# ------------------------------------------------------------
Write-Section "3. Stav radice domeny (Domain Controller)"

$osProductType = (Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue).ProductType
$isDomainController = ($osProductType -eq 2)

if ($isDomainController) {
    Report-Ok "Server funguje jako radic domeny (Domain Controller, ProductType = 2)"
} else {
    Report-Fail "Server NENI radicem domeny (ProductType = $osProductType)" "Spustte Install-ADDSForest pro povyseni serveru na DC"
}

$adDomain = $null
if ($isDomainController) {
    try {
        $adDomain = Get-ADDomain -ErrorAction Stop
        Report-Ok "Active Directory domena je dostupna: $($adDomain.DNSRoot)"
        Report-Ok "NetBIOS nazev domeny: $($adDomain.NetBIOSName)"
    } catch {
        Report-Fail "Nelze nacist informace o AD domene pres Get-ADDomain" "Zkontrolujte sluzbu NTDS a ADWS"
    }
}

if ($null -ne $adDomain) {
    # Kontrola formatu domeny: <prijmeni>.cyberschool.internal
    if ($adDomain.DNSRoot -match '\.cyberschool\.internal$') {
        Report-Ok "Domena ma spravnou priponu: .cyberschool.internal ($($adDomain.DNSRoot))"
        Report-Warn "Overte vizualne: Odpovida predpona '$($adDomain.Name)' vasemu skutecnemu prijmeni bez diakritiky?" "Zadani pozaduje tvar <prijmeni>.cyberschool.internal"
    } else {
        Report-Warn "Nazev domeny je '$($adDomain.DNSRoot)' (ocekavano tvarem <prijmeni>.cyberschool.internal)" "Pokud ucitel schvalil jiny format domeny, muzete toto varovani ignorovat"
    }

    # Funkcni uroven
    Report-Ok "Funkcni uroven domeny: $($adDomain.DomainMode)"

    # FSMO role
    try {
        $adForest = Get-ADForest -ErrorAction Stop
        $fsmoHolders = @(
            $adForest.SchemaMaster,
            $adForest.DomainNamingMaster,
            $adDomain.PDCEmulator,
            $adDomain.RIDMaster,
            $adDomain.InfrastructureMaster
        )
        $allOnThisDc = $true
        foreach ($holder in $fsmoHolders) {
            if ($holder -notlike "*$currentHost*") {
                $allOnThisDc = $false
            }
        }
        if ($allOnThisDc) {
            Report-Ok "Vsech 5 FSMO roli je umisteno na tomto radici ($currentHost)"
        } else {
            Report-Warn "Nektere FSMO role drzi jiny server: $($fsmoHolders -join ', ')" "V jedno-serverovem prostredi by vsech 5 roli melo patrit SRV1-DC"
        }
    } catch {
        Report-Warn "Nepodarilo se overit vsech 5 FSMO roli pres PowerShell AD modul"
    }

    # Global Catalog
    try {
        $dcObj = Get-ADDomainController -Identity $currentHost -ErrorAction Stop
        if ($dcObj.IsGlobalCatalog) {
            Report-Ok "Server $currentHost je nastaven jako Global Catalog (GC = True)"
        } else {
            Report-Fail "Server neni nastaven jako Global Catalog" "V AD Sites and Services povolte volbu Global Catalog u NTDS Settings"
        }
    } catch {
        Report-Warn "Nepodarilo se overit vlastnost IsGlobalCatalog radice"
    }
}

# ------------------------------------------------------------
# 4. Klicove sluzby AD DS a sdileni
# ------------------------------------------------------------
Write-Section "4. Klicove sluzby a sdilene slozky"

$servicesToCheck = @(
    @{ Name = "NTDS";      Label = "Active Directory Domain Services (NTDS)" },
    @{ Name = "ADWS";      Label = "Active Directory Web Services (ADWS)" },
    @{ Name = "Kdc";       Label = "Kerberos Key Distribution Center (Kdc)" },
    @{ Name = "Netlogon";  Label = "Netlogon Service" },
    @{ Name = "DNS";       Label = "DNS Server Service" }
)

foreach ($s in $servicesToCheck) {
    $svc = Get-Service -Name $s.Name -ErrorAction SilentlyContinue
    if ($null -ne $svc) {
        if ($svc.Status -eq "Running") {
            Report-Ok "Sluzba '$($s.Label)' bezi (Running)"
        } else {
            Report-Fail "Sluzba '$($s.Label)' neni spustena (Stav: $($svc.Status))" "Start-Service $($s.Name)"
        }
    } else {
        Report-Fail "Sluzba '$($s.Name)' neni v systemu zaregistrovana" "Zkontrolujte instalaci role AD DS / DNS"
    }
}

# Sdilene slozky SYSVOL a NETLOGON
$shares = Get-SmbShare -Name "SYSVOL", "NETLOGON" -ErrorAction SilentlyContinue
$foundShareNames = if ($shares) { $shares | ForEach-Object { $_.Name.ToUpper() } } else { @() }
if ($foundShareNames -contains "SYSVOL" -and $foundShareNames -contains "NETLOGON") {
    Report-Ok "Domenove sdilene slozky SYSVOL a NETLOGON jsou aktivni"
} else {
    Report-Fail "Chybi sdilene slozky SYSVOL nebo NETLOGON (nalezeno: $($foundShareNames -join ', '))" "Pockejte na dokonceni inicializace AD nebo zkontrolujte log adresare"
}

# ------------------------------------------------------------
# 5. Integrovany DNS Server a preklad jmen
# ------------------------------------------------------------
Write-Section "5. Integrovany DNS Server a preklad jmen"

if ($null -ne $adDomain) {
    $domainFqdn = $adDomain.DNSRoot
    try {
        $zones = Get-DnsServerZone -ErrorAction SilentlyContinue
        $zoneNames = if ($zones) { $zones.ZoneName } else { @() }
        
        if ($zoneNames -contains $domainFqdn) {
            Report-Ok "AD-integrovana dopredna DNS zona '$domainFqdn' existuje"
        } else {
            Report-Fail "Dopredna DNS zona pro '$domainFqdn' nebyla nalezena" "Zkontrolujte DNS Manager"
        }

        $msdcsZone = "_msdcs.$domainFqdn"
        if ($zoneNames -contains $msdcsZone -or $zoneNames -contains $domainFqdn) {
            Report-Ok "DNS zona pro sluzebni zaznamy domeny (_msdcs) je dostupna"
        } else {
            Report-Warn "Samostatna zona '_msdcs.$domainFqdn' nebyla nalezena" "Ujistete se, ze DNS spravne obsahuje SRV zaznamy radice"
        }

        # Resolve A zaznamu domeny
        $res = Resolve-DnsName -Name $domainFqdn -Type A -ErrorAction SilentlyContinue
        $resolvedIps = if ($res) { $res.IPAddress } else { @() }
        if ($resolvedIps -contains $expectedIP) {
            Report-Ok "DNS preklad domeny '$domainFqdn' uspesne vraci IP $expectedIP"
        } elseif ($resolvedIps.Count -gt 0) {
            Report-Warn "DNS preklad pro '$domainFqdn' vraci: $($resolvedIps -join ', ') (ocekavano: $expectedIP)" "Zkontrolujte statickou IP v dopredne zone"
        } else {
            Report-Fail "DNS preklad pro domenu '$domainFqdn' selhal (zadna odpoved)" "Overte konfiguraci DNS serveru a zone data"
        }
    } catch {
        Report-Warn "Chyba pri dotazovani DNS serveru pres modul DnsServer: $($_.Exception.Message)"
    }
} else {
    Report-Warn "Preskakuji testy DNS zony, protoze domena neni dostupna"
}

# ------------------------------------------------------------
# 6. Polozky k rucni kontrole (DSRM, Prihlaseni)
# ------------------------------------------------------------
Write-Section "6. Polozky vyzadujici rucni vizualni kontrolu"

Report-Warn "DSRM heslo (SafeModeAdministratorPassword): Z bezpecnostnich duvodu nelze precist z AD" "Overte, ze jste pri instalaci pouzili heslo 'Pa55w.rd'"

$whoamiUser = whoami 2>$null
if ($whoamiUser -match '\\') {
    $userParts = $whoamiUser -split '\\'
    $domainPart = $userParts[0]
    $namePart = $userParts[1]

    if ($domainPart -ieq $currentHost) {
        Report-Warn "Aktualne jste prihlaseni pod lokalnim uctem '$whoamiUser'" "Po restartu serveru se prihlaste pod domenovym uctem (napr. $($adDomain.NetBIOSName)\Administrator)"
    } else {
        Report-Ok "Aktualne jste prihlaseni pod domenovym uctem '$whoamiUser'"
    }
} else {
    Report-Warn "Nelze jednoznacne detekovat prihlaseneho uzivatele: $whoamiUser"
}

# ------------------------------------------------------------
# 7. Zaverecny souhrn a vyhodnoceni
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
    Write-Host "VYSLEDEK: VSE V PORADKU! Stroj SRV1-DC splnuje pozadavky Modulu 01." -ForegroundColor Green
    Write-Host "Muzete pokracovat k dalsimu modulu." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA STROJI BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Projdete cervene radky s oznacenim [CHYBA] a provedte doporucenou napravu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
