@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Dokumentacni skript - Krok 1/2: SRV1-DC (Modul 03: DNS Server).
    Zaznamena otisky a vystupy na serveru SRV1-DC a odesle je na Discord pro spojeni.

.DESCRIPTION
    Tento skript:
    1. Zjisti / potvrdi udaje o studentovi (Jmeno, Trida, Pracoviste X, Domena, Discord username).
    2. Vytvori lokalni slozku Documents\Moje dokumentace\Modul 3 DNS a inicializuje sablony.
    3. Postupne a prehledne v konzoli zaznamena:
       - M3-SRV1.V0 Otisk (Get-Date, whoami, hostname, UUID, DNSRoot, DomainSID)
       - M3-SRV1.V1-D1 Zaznamy dopredne zony (A, PTR, CNAME)
       - M3-SRV1.V1-D2 Upozorneni na vlozeni screenshotu DNS Manageru
       - M3-SRV1.V2 Reverzni zona a PTR ukazatele
       - M3-SRV1.P1-P5 Popisy postupu konfigurace
    4. Vytvori strukturovany soubor s vystupy a odesle jej pres Discord Webhook.
    5. Vyzve studenta k presunu na PC1-WIN pro Krok 2/2.
#>

param(
    [string]$DiscordUser = "",
    [int]$WorkspaceX = 0,
    [string]$WebhookUrl = ""
)

if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
    if (![string]::IsNullOrWhiteSpace($env:DOCS_WEBHOOK_URL)) {
        $WebhookUrl = $env:DOCS_WEBHOOK_URL
    } elseif (![string]::IsNullOrWhiteSpace($env:PORTAL_API_URL)) {
        $WebhookUrl = $env:PORTAL_API_URL
    } else {
        $WebhookUrl = "https://ops.peakdle.site/api/submit-doc"
    }
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace Krok 1/2 - SRV1-DC (Modul 03)"

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

function Report-Step {
    param([string]$Status, [string]$Id, [string]$Message, [string]$Color = "White")
    $tag = "[$Status]"
    Write-Host "  $tag " -ForegroundColor $Color -NoNewline
    Write-Host "$Id - $Message" -ForegroundColor White
}

Write-Header "WELL_OPS :: Automaticka dokumentace - KROK 1/2 (SRV1-DC)"
Write-Host "Tento skript zaznamena serverove overeni a postupy pro Modul 03 (DNS)." -ForegroundColor Gray
Write-Host "Vystupy budou odeslany k automatickemu spojeni s klientskym krokem." -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------
# 1. Identifikace resitele a prostredi
# ------------------------------------------------------------
Write-Section "1. Identifikace resitele"

# Autodetekce cisla pracoviste z Ethernet1
$detectedX = 2
try {
    $ipCandidate = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    if ($ipCandidate -match '^192\.168\.(\d+)\.10$') {
        $detectedX = [int]$matches[1]
    }
} catch {}

$wsX = if ($WorkspaceX -gt 0) { $WorkspaceX } else { $detectedX }

# Autodetekce domeny z AD
$detectedDomain = ""
try {
    $adDomain = (Get-ADDomain -ErrorAction SilentlyContinue).DNSRoot
    if (-not [string]::IsNullOrWhiteSpace($adDomain)) {
        $detectedDomain = $adDomain
    }
} catch {}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    try {
        $zones = Get-DnsServerZone -ErrorAction SilentlyContinue | Where-Object { -not $_.IsAutoCreated -and $_.ZoneType -eq "Primary" -and $_.ZoneName -notlike "*.in-addr.arpa" }
        if ($zones) {
            $detectedDomain = ($zones | Select-Object -First 1).ZoneName
        }
    } catch {}
}
if (-not [string]::IsNullOrWhiteSpace($DomainName)) {
    $detectedDomain = $DomainName
}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    $detectedDomain = "cyberschool.internal"
}

# Jmeno studenta
$defaultName = ""
try {
    $who = (whoami).Split('\')[-1]
    if ($who -and $who -ne "administrator") {
        $defaultName = $who
    }
} catch {}

if ($defaultName) {
    Write-Host "Zadejte Jmeno a Prijmeni [vychozi: $defaultName]: " -ForegroundColor Yellow -NoNewline
    $inputName = Read-Host
    $studentName = if (-not [string]::IsNullOrWhiteSpace($inputName)) { $inputName.Trim() } else { $defaultName }
} else {
    Write-Host "Zadejte Jmeno a Prijmeni (napr. Jan Novak): " -ForegroundColor Yellow -NoNewline
    $inputName = Read-Host
    $studentName = if (-not [string]::IsNullOrWhiteSpace($inputName)) { $inputName.Trim() } else { "Student" }
}

# Trida
Write-Host "Zadejte Tridu [vychozi: T3A]: " -ForegroundColor Yellow -NoNewline
$inputClass = Read-Host
$studentClass = if (-not [string]::IsNullOrWhiteSpace($inputClass)) { $inputClass } else { "T3A" }

# Datum
$todayDate = (Get-Date -Format "d. M. yyyy")
Write-Host "Datum vypracovani [vychozi: $todayDate]: " -ForegroundColor Yellow -NoNewline
$inputDate = Read-Host
$studentDate = if (-not [string]::IsNullOrWhiteSpace($inputDate)) { $inputDate } else { $todayDate }

# Cislo pracoviste
Write-Host "Cislo pracoviste X [vychozi: $wsX]: " -ForegroundColor Yellow -NoNewline
$inputX = Read-Host
if (-not [string]::IsNullOrWhiteSpace($inputX) -and $inputX -match '^\d+$') {
    $wsX = [int]$inputX
}

# Domena
Write-Host "Vase domena [vychozi: $detectedDomain]: " -ForegroundColor Yellow -NoNewline
$inputDomain = Read-Host
$studentDomain = if (-not [string]::IsNullOrWhiteSpace($inputDomain)) { $inputDomain } else { $detectedDomain }

# Discord username
$targetDiscord = $DiscordUser
while ([string]::IsNullOrWhiteSpace($targetDiscord)) {
    Write-Host ""
    Write-Host "Zadejte vase Discord uzivatelske jmeno (napr. jannovak): " -ForegroundColor Cyan -NoNewline
    $targetDiscord = Read-Host
    if (-not [string]::IsNullOrWhiteSpace($targetDiscord)) {
        $targetDiscord = $targetDiscord.Trim().TrimStart('@')
    }
}

Write-Host ""
Write-Host "Pripraveno k zaznamu pro: $studentName ($studentClass), Pracoviste: $wsX, Domena: $studentDomain" -ForegroundColor Green
Write-Host "Cilovy Discord ucet pro doruceni: @$targetDiscord" -ForegroundColor Green
Start-Sleep -Milliseconds 600

# ------------------------------------------------------------
# 2. Inicializace lokalnich souboru v Documents
# ------------------------------------------------------------
Write-Section "2. Priprava slozky dokumentace na SRV1-DC"
$docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 3 DNS"
if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
}
Write-Host "Lokalni slozka: $docsDir" -ForegroundColor Gray

# ------------------------------------------------------------
# 3. Zaznam serverovych overeni (overeni.md)
# ------------------------------------------------------------
Write-Section "3. Zaznam overeni na SRV1-DC"

# M3-SRV1.V0 Otisk
Write-Host "  [PROBIHA]  M3-SRV1.V0 Otisk systemu..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nowStr = Get-Date -Format "dddd d. MMMM yyyy HH:mm:ss"
$whoStr = whoami
$hostStr = hostname
$uuidStr = try { (Get-CimInstance Win32_ComputerSystemProduct -ErrorAction SilentlyContinue).UUID } catch { "N/A" }
$dnsRootStr = try { (Get-ADDomain -ErrorAction SilentlyContinue).DNSRoot } catch { $studentDomain }
$sidStr = try { (Get-ADDomain -ErrorAction SilentlyContinue).DomainSID.Value } catch { "N/A" }

$v0Output = @"
PS C:\Users\Administrator> Get-Date

$nowStr

PS C:\Users\Administrator> whoami
$whoStr
PS C:\Users\Administrator> hostname
$hostStr
PS C:\Users\Administrator> (Get-CimInstance Win32_ComputerSystemProduct).UUID
$uuidStr
PS C:\Users\Administrator> (Get-ADDomain).DNSRoot
$dnsRootStr
PS C:\Users\Administrator> (Get-ADDomain).DomainSID.Value
$sidStr
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-SRV1.V0" "Otisk systemu uspesne zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M3-SRV1.V1 Dopredna zona
Write-Host "  [PROBIHA]  M3-SRV1.V1 Cteni zaznamu dopredne zony ($studentDomain)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$recordsTable = try {
    Get-DnsServerResourceRecord -ZoneName $studentDomain -ErrorAction Stop |
        Select-Object HostName, RecordType, RecordData |
        Format-Table -AutoSize |
        Out-String
} catch {
    "Chyba pri cteni zony $studentDomain : $_"
}

$v1Output = @"
PS C:\Users\Administrator> Get-DnsServerResourceRecord -ZoneName $studentDomain | Select-Object HostName, RecordType, RecordData | Format-Table -AutoSize

$recordsTable
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-SRV1.V1-D1" "Seznam zaznamu dopredne zony zaznamenan" "Green"
Report-Step " RUCNI " "M3-SRV1.V1-D2" "Screenshot DNS Manageru je nutno vlozit rucne" "Yellow"
Start-Sleep -Milliseconds 400

# M3-SRV1.V2 Reverzni zona a PTR
Write-Host "  [PROBIHA]  M3-SRV1.V2 Cteni reverzni zony a PTR zaznamu..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$revZoneName = "$wsX.168.192.in-addr.arpa"
$revZonesTable = try {
    Get-DnsServerZone -ErrorAction Stop |
        Where-Object { $_.IsReverseLookupZone } |
        Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate |
        Format-Table -AutoSize |
        Out-String
} catch {
    "Chyba pri cteni reverznich zon: $_"
}

$ptrRecordsTable = try {
    Get-DnsServerResourceRecord -ZoneName $revZoneName -RRType Ptr -ErrorAction Stop |
        Select-Object HostName, RecordType, RecordData |
        Format-Table -AutoSize |
        Out-String
} catch {
    "Chyba pri cteni PTR v zone $revZoneName : $_"
}

$v2D1Output = @"
PS C:\Users\Administrator> Get-DnsServerZone | Where-Object { `$_.IsReverseLookupZone } | Select-Object ZoneName, ZoneType, ReplicationScope, DynamicUpdate | Format-Table -AutoSize

$revZonesTable
PS C:\Users\Administrator>
"@

$v2D2Output = @"
PS C:\Users\Administrator> Get-DnsServerResourceRecord -ZoneName $revZoneName -RRType Ptr | Select-Object HostName, RecordType, RecordData | Format-Table -AutoSize

$ptrRecordsTable
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M3-SRV1.V2-D1" "Seznam reverznich zon zaznamenan" "Green"
Report-Step "  OK   " "M3-SRV1.V2-D2" "PTR zaznamy v reverzni zone zaznamenany" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 4. Zaznam postupu konfigurace (postup.md)
# ------------------------------------------------------------
Write-Section "4. Priprava textu postupu na SRV1-DC"

$p1Text = @"
1. Otevrena konzole DNS Manager (dnsmgmt.msc).
2. Rozbalen uzel SRV1-DC -> Forward Lookup Zones -> $studentDomain.
3. Overena pritomnost automaticky vytvorenych zaznamu pro domenu a zaznamu A pro SRV1-DC s IP adresou 192.168.$wsX.10.
4. Overeni pres PowerShell:
   Get-DnsServerResourceRecord -ZoneName "$studentDomain"
"@

$p2Text = @"
1. V DNS Manageru kliknuto pravym tlacitkem na 'Reverse Lookup Zones' -> 'New Zone...'.
2. V pruvodci New Zone Wizard nastaveno:
   - Zone Type: Primary zone, zaskrtnuto 'Store the zone in Active Directory'.
   - Active Directory Zone Replication Scope: 'To all DNS servers running on domain controllers in this domain'.
   - Reverse Lookup Zone Name: IPv4 Reverse Lookup Zone.
   - Network ID: 192.168.$wsX (vysledna zona: $wsX.168.192.in-addr.arpa).
   - Dynamic Update: 'Allow only secure dynamic updates (recommended for Active Directory)'.
3. Dokonceno kliknutim na Finish.
(Prikaz v PowerShellu: Add-DnsServerPrimaryZone -NetworkId "192.168.$wsX.0/24" -ReplicationScope Domain)
"@

$p3Text = @"
1. V DNS Manageru v zone $studentDomain kliknuto pravym tlacitkem do prazdneho mista -> 'New Host (A or AAAA)...'.
2. Pro SRV2-FS zadan Name: srv2-fs, IP address: 192.168.$wsX.20.
3. Zaskrtnuto 'Create associated pointer (PTR) record' a potvrzeno Add Host.
4. Pro PC1-WIN byl zaznam automaticky vytvoren / dynamicky zaregistrovan po pripojeni klientske stanice do domeny.
(PowerShell: Add-DnsServerResourceRecordA -ZoneName "$studentDomain" -Name "srv2-fs" -IPv4Address "192.168.$wsX.20" -CreatePtr)
"@

$p4Text = @"
1. V DNS Manageru v zone $studentDomain kliknuto pravym tlacitkem -> 'New Alias (CNAME)...'.
2. Alias name: ftp.
3. Fully qualified domain name (FQDN) for target host: srv2-fs.$studentDomain.
4. Potvrzeno tlacitkem OK.
(PowerShell: Add-DnsServerResourceRecordCName -ZoneName "$studentDomain" -Name "ftp" -HostNameAlias "srv2-fs.$studentDomain")
"@

$p5Text = @"
1. V DNS Manageru rozbalen uzel 'Reverse Lookup Zones' -> $wsX.168.192.in-addr.arpa.
2. Kliknuto pravym tlacitkem do volne plochy -> 'New Pointer (PTR)...'.
3. Host IP Address: 192.168.$wsX.10.
4. Host name zadan: srv1-dc.$studentDomain (pomoci Browse vybran prislusny A zaznam).
5. Potvrzeno tlacitkem OK.
(PowerShell: Add-DnsServerResourceRecordPtr -ZoneName "$wsX.168.192.in-addr.arpa" -Name "10" -PtrDomainName "srv1-dc.$studentDomain")
"@

Report-Step "  OK   " "M3-SRV1.P1-P5" "Popisy postupu konfigurace pripraveny" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 5. Sestaveni JSON balicku a odeslani na Discord Webhook
# ------------------------------------------------------------
Write-Section "5. Odeslani dat na Discord Webhook"

$srv1Payload = [PSCustomObject]@{
    part = "SRV1"
    module = "03"
    discordUser = $targetDiscord
    student = [PSCustomObject]@{
        fullName = $studentName
        className = $studentClass
        date = $studentDate
        workstationX = $wsX
        domain = $studentDomain
    }
    srv1_overeni = [PSCustomObject]@{
        V0_otisk = $v0Output
        V1_d1 = $v1Output
        V2_d1 = $v2D1Output
        V2_d2 = $v2D2Output
    }
    srv1_postup = [PSCustomObject]@{
        P1 = $p1Text
        P2 = $p2Text
        P3 = $p3Text
        P4 = $p4Text
        P5 = $p5Text
    }
}

$tempJsonPath = Join-Path -Path $env:TEMP -ChildPath "well_ops_doc_srv1_03.json"
$srv1Payload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $tempJsonPath -Encoding UTF8

Write-Host "Odesilam serverova data pres Discord Webhook..." -ForegroundColor Cyan
$curlArgs = @(
    "-s", "-S",
    "-w", "`n%{http_code}",
    "-X", "POST",
    "-F", "content=[WELL_OPS_DOC_PART1] Modul 03 | SRV1-DC | $targetDiscord | $studentName",
    "-F", "file1=@$tempJsonPath;filename=srv1_data.json",
    $WebhookUrl
)

$curlRaw = & curl.exe @curlArgs 2>&1
$curlExitCode = $LASTEXITCODE
Remove-Item -LiteralPath $tempJsonPath -Force -ErrorAction SilentlyContinue

# Rozparsovani vystupu curl (telo odpovedi a HTTP status na poslednim radku)
$outputStr = ($curlRaw | Out-String).Trim()
$lines = $outputStr -split "`r?`n"
$httpCode = ""
$responseBody = ""

if ($lines.Length -gt 0) {
    $candidate = $lines[-1].Trim()
    if ($candidate -match '^\d{3}$') {
        $httpCode = $candidate
        if ($lines.Length -gt 1) {
            $responseBody = ($lines[0..($lines.Length - 2)] -join "`r`n").Trim()
        }
    } else {
        $responseBody = $outputStr
    }
}

$isSuccess = ($curlExitCode -eq 0) -and ($httpCode -eq "200" -or $httpCode -eq "204")

if (-not $isSuccess) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "  CHYBA: ODESLANI DAT SE NEZDARILO!" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    $statusDisplay = if ($httpCode -and $httpCode -ne "000") {
        $httpCode
    } elseif ($httpCode -eq "000") {
        "000 (Zadna HTTP odpoved / Spojeni se nezdarilo)"
    } else {
        "Neznamy / Zadny"
    }
    Write-Host "HTTP Status:     $statusDisplay" -ForegroundColor Red
    if (-not [string]::IsNullOrWhiteSpace($responseBody)) {
        Write-Host "Odpoved serveru: $responseBody" -ForegroundColor Red
    }
    Write-Host "============================================================" -ForegroundColor Red

    if ($curlExitCode -eq 6) {
        Write-Host ""
        Write-Host "[HINT - CHYBA PREKLADU DNS (Exit code 6)]" -ForegroundColor Yellow
        Write-Host "Server nemuze prelozit adresu ciloveho portalu/webhooku ($WebhookUrl)." -ForegroundColor Yellow
        Write-Host "Zkontrolujte nastaveni DNS Forwarders (Predavani) na SRV1-DC:" -ForegroundColor White
        Write-Host "  1. V Server Manageru otevrete DNS Manager (dnsmgmt.msc)." -ForegroundColor White
        Write-Host "  2. Kliknete pravym tlacitkem na SRV1-DC -> Vlastnosti (Properties)." -ForegroundColor White
        Write-Host "  3. Preklicnete na zalozku 'Forwarders' (Predavani) a kliknete na Edit." -ForegroundColor White
        Write-Host "  4. Pridejte verejny DNS server (napr. 8.8.8.8 nebo 1.1.1.1) a potvrdte OK." -ForegroundColor White
        Write-Host "  5. Ujistete se, ze ma SRV1-DC na adapteru Ethernet0 pristup k internetu (NAT)." -ForegroundColor White
    }

    Write-Host ""
    Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOTOVO! Serverova cast SRV1-DC byla uspesne zaznamenana!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Data pro studenta: $studentName ($studentClass)" -ForegroundColor Cyan
Write-Host "Pripraveno pro Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host ""
Write-Host "DULEZITY DALSI KROK:" -ForegroundColor Yellow
Write-Host "  1. Nyni otevrete stroj PC1-WIN." -ForegroundColor White
Write-Host "  2. Spuste v PowerShellu prikaz pro KROK 2 (klientske overeni)." -ForegroundColor White
Write-Host "  3. Zadejte stejne Discord jmeno: $targetDiscord" -ForegroundColor White
Write-Host "  4. Po dokonceni vam Discord bot automaticky posle celou spojenou dokumentaci!" -ForegroundColor Green
Write-Host ""
Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
