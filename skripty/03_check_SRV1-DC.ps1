<#
.SYNOPSIS
    Overovaci skript pro Modul 03: DNS Server (SRV1-DC).
    Striktne READ-ONLY - pouze kontroluje stav a nic nemeni v systemu.

.DESCRIPTION
    Provadi detailni audit konfigurace DNS serveru na SRV1-DC:
    - Predpoklady ze stroje (Hostname, staticka IP 192.168.X.10/24 na Ethernet1, AD domena)
    - Windows role DNS a RSAT nastroje
    - Sluzba DNS (DNS Server bezi a spousti se automaticky)
    - Dopredna vyhledavaci zona (AD-integrovana, replikace Domain, Secure dynamic updates)
    - Zaznam A pro srv1-dc (192.168.X.10)
    - Reverzni vyhledavaci zona (X.168.192.in-addr.arpa, AD-integrovana, Secure dynamic updates)
    - Zaznam A pro srv2-fs (192.168.X.20)
    - PTR ukazatele pro srv1-dc (.10) a srv2-fs (.20)
    - Alias CNAME ftp ukazujici na srv2-fs.<domena>
    - 3-urovnovy souhrn: [ OK ] (zelene), [KONTROLA] (oranzove/zlute), [CHYBA] (cervene)
#>

param(
    [int]$WorkspaceX = 0
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Overeni SRV1-DC - DNS Server (Modul 03)"

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

Write-Header "WELL_OPS :: Overeni SRV1-DC - DNS Server (Modul 03)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "[VAROVANI] Skript neni spusten s pravy Administratora!" -ForegroundColor Yellow
    Write-Host "           Spustte konzoli jako Administrator pro spravne nacteni DNS zón a zaznamu." -ForegroundColor Yellow
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

Write-Host "Tento skript overi pripravenost a konfiguraci role DNS Server na SRV1-DC." -ForegroundColor Gray
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
$expectedFsIP = "192.168.$wsX.20"
$expectedRevZone = "$wsX.168.192.in-addr.arpa"

Write-Host ""
Write-Host "Zvolene parametry testu:" -ForegroundColor Gray
Write-Host "  Cislo pracoviste:        $wsX" -ForegroundColor Gray
Write-Host "  IP adresa SRV1-DC:       $expectedIP" -ForegroundColor Gray
Write-Host "  Ocekavana IP SRV2-FS:    $expectedFsIP" -ForegroundColor Gray
Write-Host "  Ocekavana reverzni zona: $expectedRevZone" -ForegroundColor Gray

# ------------------------------------------------------------
# 1. Predpoklady: System a sit
# ------------------------------------------------------------
Write-Section "1. Predpoklady: Identita a sitova konfigurace"

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
    Report-Fail "Staticka IPv4 na Ethernet1 je '$found', ocekavano '$expectedIP'" "Nastavte statickou IP adresu 192.168.$wsX.10/24 na Ethernet1"
}

# Active Directory Domena
$domainName = $null
try {
    $domainObj = Get-ADDomain -ErrorAction Stop
    $domainName = $domainObj.DNSRoot
    if ($domainName -match '\.cyberschool\.internal$') {
        Report-Ok "Active Directory domena je aktivni: $domainName"
    } else {
        Report-Warn "Active Directory domena je '$domainName', doporuceno koncit na '.cyberschool.internal'"
    }
} catch {
    Report-Fail "Nelze nacist Active Directory domenu" "Ujistete se, ze server je radice domeny z Modulu 01"
}

# ------------------------------------------------------------
# 2. Windows role DNS Server a sluzba
# ------------------------------------------------------------
Write-Section "2. Instalace role DNS Server a stav sluzby"

$dnsFeat = Get-WindowsFeature -Name "DNS" -ErrorAction SilentlyContinue
if ($null -ne $dnsFeat -and $dnsFeat.Installed) {
    Report-Ok "Windows Feature 'DNS' je nainstalovana"
} else {
    Report-Fail "Role 'DNS' neni nainstalovana" "Install-WindowsFeature -Name DNS -IncludeManagementTools"
}

$dnsSvc = Get-Service -Name "DNS" -ErrorAction SilentlyContinue
if ($null -ne $dnsSvc -and $dnsSvc.Status -eq "Running") {
    Report-Ok "Sluzba 'DNS' bezi (Running) a start je $($dnsSvc.StartType)"
} elseif ($null -ne $dnsSvc) {
    Report-Fail "Sluzba 'DNS' neni spustena (Stav: $($dnsSvc.Status))" "Start-Service -Name DNS"
} else {
    Report-Fail "Sluzba 'DNS' nebyla v systemu nalezena" "Nainstalujte roli DNS Server"
}

# ------------------------------------------------------------
# 3. Dopredna vyhledavaci zona
# ------------------------------------------------------------
Write-Section "3. Dopredna vyhledavaci zona (Forward Lookup Zone)"

$fwdZone = $null
if ($domainName) {
    try {
        $fwdZone = Get-DnsServerZone -Name $domainName -ErrorAction SilentlyContinue
    } catch {}
}

if ($null -ne $fwdZone) {
    Report-Ok "Dopredna zona '$($fwdZone.ZoneName)' existuje"

    if ($fwdZone.ZoneType -eq "Primary") {
        Report-Ok "Typ zony je Primary (primarni)"
    } else {
        Report-Warn "Typ zony je '$($fwdZone.ZoneType)', ocekavano 'Primary'"
    }

    if ($fwdZone.ReplicationScope -in "Domain", "Forest") {
        Report-Ok "Replikace zony je integrovana v AD ($($fwdZone.ReplicationScope))"
    } else {
        Report-Warn "Replikace zony je '$($fwdZone.ReplicationScope)', doporuceno AD-integrovana (Domain)"
    }

    if ($fwdZone.DynamicUpdate -eq "Secure") {
        Report-Ok "Dynamicke aktualizace jsou zabezpecene (Secure only)"
    } else {
        Report-Warn "Dynamicke aktualizace jsou '$($fwdZone.DynamicUpdate)', doporuceno 'Secure'" "Set-DnsServerPrimaryZone -Name '$domainName' -DynamicUpdate 'Secure'"
    }
} else {
    Report-Fail "Dopredna zona '$domainName' nebyla na DNS serveru nalezena" "Zkontrolujte existenci domeny a zony v konzoli DNS Manager"
}

# ------------------------------------------------------------
# 4. Zaznamy v dopredne zone
# ------------------------------------------------------------
Write-Section "4. Zaznamy v dopredne zone (A a CNAME)"

if ($null -ne $fwdZone) {
    try {
        # Zaznam A pro srv1-dc
        $dcRecord = Get-DnsServerResourceRecord -ZoneName $fwdZone.ZoneName -RRType A -Name "srv1-dc" -ErrorAction SilentlyContinue
        if ($dcRecord) {
            $dcIps = @($dcRecord.RecordData.IPv4Address.IPAddressToString)
            if ($dcIps -contains $expectedIP) {
                Report-Ok "Zaznam A pro 'srv1-dc' obsahuje spravnou IP $expectedIP"
            } else {
                Report-Warn "Zaznam A pro 'srv1-dc' ma IP $($dcIps -join ', '), ocekavano '$expectedIP'" "Overte IP adresu radice v dopredne zone"
            }
        } else {
            Report-Fail "Zaznam A pro 'srv1-dc' v zone chybi" "Zkontrolujte registraci radice v DNS"
        }

        # Zaznam A pro srv2-fs
        $fsRecord = Get-DnsServerResourceRecord -ZoneName $fwdZone.ZoneName -RRType A -Name "srv2-fs" -ErrorAction SilentlyContinue
        if ($fsRecord) {
            $fsIps = @($fsRecord.RecordData.IPv4Address.IPAddressToString)
            if ($fsIps -contains $expectedFsIP) {
                Report-Ok "Zaznam A pro 'srv2-fs' existuje a smeruje na $expectedFsIP"
            } else {
                Report-Fail "Zaznam A pro 'srv2-fs' ma IP $($fsIps -join ', '), ocekavano '$expectedFsIP'" "Add-DnsServerResourceRecordA -Name 'srv2-fs' -ZoneName '$($fwdZone.ZoneName)' -IPv4Address '$expectedFsIP' -CreatePtr"
            }
        } else {
            Report-Fail "Zaznam A pro 'srv2-fs' v zone chybi" "Add-DnsServerResourceRecordA -Name 'srv2-fs' -ZoneName '$($fwdZone.ZoneName)' -IPv4Address '$expectedFsIP' -CreatePtr"
        }

        # Alias CNAME ftp
        $cnameFtp = Get-DnsServerResourceRecord -ZoneName $fwdZone.ZoneName -Name "ftp" -ErrorAction SilentlyContinue | Where-Object { $_.RecordType -eq "CNAME" }
        if ($cnameFtp) {
            $aliasTarget = $cnameFtp.RecordData.HostNameAlias
            if ($aliasTarget -like "*srv2-fs*") {
                Report-Ok "Alias CNAME 'ftp' existuje a ukazuje na '$aliasTarget'"
            } else {
                Report-Warn "Alias CNAME 'ftp' ukazuje na '$aliasTarget', ocekavano ukazovat na 'srv2-fs'" "Zkontrolujte cil aliasu ftp"
            }
        } else {
            Report-Fail "Alias CNAME 'ftp' v zone chybi" "Add-DnsServerResourceRecordCName -Name 'ftp' -HostNameAlias 'srv2-fs.$($fwdZone.ZoneName)' -ZoneName '$($fwdZone.ZoneName)'"
        }
    } catch {
        Report-Warn "Chyba pri cteni zaznamu z dopredne zony: $($_.Exception.Message)"
    }
}

# ------------------------------------------------------------
# 5. Reverzni vyhledavaci zona (Reverse Lookup Zone)
# ------------------------------------------------------------
Write-Section "5. Reverzni vyhledavaci zona (Reverse Lookup Zone)"

$revZone = $null
try {
    $revZone = Get-DnsServerZone -Name $expectedRevZone -ErrorAction SilentlyContinue
    if ($null -eq $revZone) {
        # Zkusime najit libovolnou reverzni zonu zacinajici cislem podsiti
        $allRev = Get-DnsServerZone -ErrorAction SilentlyContinue | Where-Object { $_.ZoneName -like "*in-addr.arpa" }
        if ($allRev) {
            $revZone = $allRev | Where-Object { $_.ZoneName -like "$wsX.*" } | Select-Object -First 1
            if ($null -eq $revZone) {
                $revZone = $allRev | Select-Object -First 1
            }
        }
    }
} catch {}

if ($null -ne $revZone) {
    if ($revZone.ZoneName -eq $expectedRevZone) {
        Report-Ok "Reverzni zona pro sit '$expectedRevZone' existuje"
    } else {
        Report-Warn "Nalezena reverzni zona '$($revZone.ZoneName)', ocekavano '$expectedRevZone'" "Overte cislo podsiti reverzni zony"
    }

    if ($revZone.ZoneType -eq "Primary") {
        Report-Ok "Typ reverzni zony je Primary (primarni)"
    } else {
        Report-Warn "Typ reverzni zony je '$($revZone.ZoneType)', ocekavano 'Primary'"
    }

    if ($revZone.ReplicationScope -in "Domain", "Forest") {
        Report-Ok "Replikace reverzni zony je integrovana v AD ($($revZone.ReplicationScope))"
    } else {
        Report-Warn "Replikace reverzni zony je '$($revZone.ReplicationScope)', doporuceno integrovat v AD"
    }

    if ($revZone.DynamicUpdate -eq "Secure") {
        Report-Ok "Dynamicke aktualizace reverzni zony jsou Secure only"
    } else {
        Report-Warn "Dynamicke aktualizace reverzni zony jsou '$($revZone.DynamicUpdate)', doporuceno 'Secure'"
    }
} else {
    Report-Fail "Reverzni zona '$expectedRevZone' nebyla na DNS serveru nalezena" "Add-DnsServerPrimaryZone -NetworkId '192.168.$wsX.0/24' -ReplicationScope 'Domain' -DynamicUpdate 'Secure'"
}

# ------------------------------------------------------------
# 6. PTR zaznamy v reverzni zone
# ------------------------------------------------------------
Write-Section "6. Kontrola PTR zaznamu v reverzni zone"

if ($null -ne $revZone) {
    try {
        $ptrRecords = Get-DnsServerResourceRecord -ZoneName $revZone.ZoneName -RRType Ptr -ErrorAction SilentlyContinue

        # PTR pro .10 (SRV1-DC)
        $ptr10 = $ptrRecords | Where-Object { $_.HostName -eq "10" }
        if ($ptr10) {
            $target = $ptr10.RecordData.PtrDomainName
            if ($target -like "*srv1-dc*") {
                Report-Ok "PTR zaznam pro 192.168.$wsX.10 ukazuje na '$target'"
            } else {
                Report-Warn "PTR zaznam pro 10 ukazuje na '$target', ocekavano ukazovat na 'srv1-dc'"
            }
        } else {
            Report-Fail "Chybi PTR zaznam pro 192.168.$wsX.10 (SRV1-DC)" "Add-DnsServerResourceRecordPtr -Name '10' -ZoneName '$($revZone.ZoneName)' -PtrDomainName 'srv1-dc.$domainName'"
        }

        # PTR pro .20 (SRV2-FS)
        $ptr20 = $ptrRecords | Where-Object { $_.HostName -eq "20" }
        if ($ptr20) {
            $target = $ptr20.RecordData.PtrDomainName
            if ($target -like "*srv2-fs*") {
                Report-Ok "PTR zaznam pro 192.168.$wsX.20 ukazuje na '$target'"
            } else {
                Report-Warn "PTR zaznam pro 20 ukazuje na '$target', ocekavano ukazovat na 'srv2-fs'"
            }
        } else {
            Report-Fail "Chybi PTR zaznam pro 192.168.$wsX.20 (SRV2-FS)" "Add-DnsServerResourceRecordPtr -Name '20' -ZoneName '$($revZone.ZoneName)' -PtrDomainName 'srv2-fs.$domainName'"
        }
    } catch {
        Report-Warn "Chyba pri cteni PTR zaznamu z reverzni zony: $($_.Exception.Message)"
    }
}

# ------------------------------------------------------------
# 7. Vizualni kontrola v konzoli DNS Manager
# ------------------------------------------------------------
Write-Section "7. Vizualni kontrola v graficke konzoli"

Report-Warn "Konzole DNS Manager (dnsmgmt.msc): Overte zony a zaznamy v grafickem stromu" "Server Manager -> Tools -> DNS"

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
    Write-Host "VYSLEDEK: VSE V PORADKU! DNS Server na SRV1-DC splnuje pozadavky Modulu 03." -ForegroundColor Green
    Write-Host "Muzete pokracovat overenim na klientovi PC1-WIN." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "VYSLEDEK: NA SERVERU BYLY NALEZENY CHYBY ($($global:failCount))." -ForegroundColor Red
    Write-Host "Projdete cervene radky s oznacenim [CHYBA] a provedte doporucenou napravu." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
