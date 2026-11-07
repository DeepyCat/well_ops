@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Dokumentacni skript pro Modul 01: Active Directory Domain Services (SRV1-DC).
    Zaznamena otisky a vystupy na serveru SRV1-DC a odesle je na Discord pro vygenerovani dokumentace.

.DESCRIPTION
    Tento skript:
    1. Zjisti / potvrdi udaje o studentovi (Jmeno, Trida, Pracoviste X, Domena, Discord username).
    2. Vytvori lokalni slozku Documents\Moje dokumentace\Modul 1 Domain Controller.
    3. Postupne a prehledne v konzoli zaznamena:
       - M1-SRV1.V0 Otisk (Get-Date, whoami, hostname, UUID, DNSRoot, DomainSID)
       - M1-SRV1.V1-D1 IP konfigurace serveru (ipconfig /all)
       - M1-SRV1.V2-D1 Upozorneni na vlozeni screenshotu Server Manager Dashboard (AD DS a DNS)
       - M1-SRV1.V3-D1 Upozorneni na vlozeni screenshotu Local Server s domenou
       - M1-SRV1.V4-D1 Drzitele vsech peti roli FSMO (netdom query fsmo)
       - M1-SRV1.V4-D2 Vlastnosti radice domeny (Get-ADDomainController -Identity SRV1-DC)
       - M1-SRV1.V5-D1 Upozorneni na vlozeni screenshotu ADUC s domenou
       - M1-SRV1.V6-D1 Prihlaseny ucet a stav roli (whoami, Get-Service)
       - M1-SRV1.P1-P3 Popisy postupu instalace, povyseni a prihlaseni
    4. Vytvori strukturovany soubor s vystupy a odesle jej pres Discord Webhook.
    5. Discord bot obratem sestavi kompletni ZIP archiv s overeni.md i postup.md.
#>

param(
    [string]$DiscordUser = "",
    [int]$WorkspaceX = 0,
    [string]$DomainName = "",
    [string]$WebhookUrl = ""
)

if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
    if (![string]::IsNullOrWhiteSpace($env:DOCS_WEBHOOK_URL)) {
        $WebhookUrl = $env:DOCS_WEBHOOK_URL
    } else {
        $revHook = "jR3ghUkO1HSx6URXntt9G76rSfckY5D6I7EbPVR8E99yD3OaO0VO33DnOl06ZIuwBp46/0563307641664707651/skoohbew/ipa/moc.drocsid//:sptth"
        $hookChars = $revHook.ToCharArray()
        [Array]::Reverse($hookChars)
        $WebhookUrl = -join $hookChars
    }
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace - SRV1-DC (Modul 01)"

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

Write-Header "WELL_OPS :: Automaticka dokumentace - Modul 01 (SRV1-DC)"
Write-Host "Tento skript zaznamena overeni a postupy pro Modul 01 (Active Directory)." -ForegroundColor Gray
Write-Host "Vystupy budou odeslany Discord botovi, ktery obratem vytvori hotovy ZIP archiv." -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------
# 1. Identifikace resitele a prostredi
# ------------------------------------------------------------
Write-Section "1. Identifikace resitele"

# Autodetekce cisla pracoviste z Ethernet1
$detectedX = 2
try {
    $ipCandidate = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    if ($ipCandidate -match '^192\.168\.(\d+)\.') {
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

# NetBIOS jmeno odvozene z domeny
$netbiosCandidate = ($studentDomain.Split('.')[0]).ToUpper()
if ([string]::IsNullOrWhiteSpace($netbiosCandidate)) {
    $netbiosCandidate = "DOMENA"
}

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
$docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 1 Domain Controller"
if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
}
Write-Host "Lokalni slozka: $docsDir" -ForegroundColor Gray

# ------------------------------------------------------------
# 3. Zaznam overeni (overeni.md)
# ------------------------------------------------------------
Write-Section "3. Zaznam overeni na SRV1-DC"

# M1-SRV1.V0 Otisk
Write-Host "  [PROBIHA]  M1-SRV1.V0 Otisk systemu..." -ForegroundColor DarkYellow
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
Report-Step "  OK   " "M1-SRV1.V0" "Otisk systemu uspesne zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M1-SRV1.V1-D1 IP konfigurace
Write-Host "  [PROBIHA]  M1-SRV1.V1-D1 Cteni IP konfigurace serveru..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$ipconfigRaw = try {
    & ipconfig.exe /all | Out-String
} catch {
    "Chyba pri spousteni ipconfig: $_"
}

$v1Output = @"
PS C:\Users\Administrator> ipconfig /all

$ipconfigRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M1-SRV1.V1-D1" "IP konfigurace uspesne zaznamenana" "Green"
Start-Sleep -Milliseconds 400

# M1-SRV1.V2-D1 Screenshot Server Manager Dashboard
Report-Step " RUCNI " "M1-SRV1.V2-D1" "Screenshot Dashboardu s rolemi AD DS a DNS je nutno vlozit rucne" "Yellow"

# M1-SRV1.V3-D1 Screenshot Local Server s domenou
Report-Step " RUCNI " "M1-SRV1.V3-D1" "Screenshot Local Serveru s domenou je nutno vlozit rucne" "Yellow"

# M1-SRV1.V4-D1 Drzitele FSMO roli
Write-Host "  [PROBIHA]  M1-SRV1.V4-D1 Dotaz na FSMO role (netdom query fsmo)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$fsmoRaw = try {
    & netdom.exe query fsmo | Out-String
} catch {
    "Chyba pri spousteni netdom query fsmo: $_"
}

$v4D1Output = @"
PS C:\Users\Administrator> netdom query fsmo

$fsmoRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M1-SRV1.V4-D1" "FSMO role uspesne zaznamenany" "Green"
Start-Sleep -Milliseconds 400

# M1-SRV1.V4-D2 Vlastnosti radice domeny
Write-Host "  [PROBIHA]  M1-SRV1.V4-D2 Cteni vlastnosti radice domeny..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$dcObj = try {
    Get-ADDomainController -Identity "SRV1-DC" -ErrorAction Stop | Format-List * | Out-String
} catch {
    try {
        Get-ADDomainController -Filter * -ErrorAction Stop | Select-Object -First 1 | Format-List * | Out-String
    } catch {
        "Chyba pri cteni Get-ADDomainController: $_"
    }
}

$v4D2Output = @"
PS C:\Users\Administrator> Get-ADDomainController -Identity SRV1-DC

$dcObj
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M1-SRV1.V4-D2" "Vlastnosti radice domeny zaznamenany" "Green"
Start-Sleep -Milliseconds 400

# M1-SRV1.V5-D1 Screenshot ADUC
Report-Step " RUCNI " "M1-SRV1.V5-D1" "Screenshot ADUC s otevrenou domenou je nutno vlozit rucne" "Yellow"

# M1-SRV1.V6-D1 Prihlaseny ucet a sluzby
Write-Host "  [PROBIHA]  M1-SRV1.V6-D1 Overeni uctu a behu klicovych sluzeb..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$servicesTable = try {
    Get-Service -Name NTDS, DNS, Kdc, Netlogon -ErrorAction SilentlyContinue |
        Select-Object Name, DisplayName, Status |
        Format-Table -AutoSize |
        Out-String
} catch {
    "Chyba pri cteni sluzeb: $_"
}

$v6D1Output = @"
PS C:\Users\Administrator> whoami
$whoStr
PS C:\Users\Administrator> Get-Service -Name NTDS, DNS, Kdc, Netlogon | Select-Object Name, DisplayName, Status

$servicesTable
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M1-SRV1.V6-D1" "Prihlaseny ucet a beh sluzeb overen" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 4. Zaznam postupu (postup.md)
# ------------------------------------------------------------
Write-Section "4. Sestaveni postupu (postup.md)"

$p1Text = "Pomoci prikazu zadaneho do PowerShellu:`nInstall-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools"
Report-Step "  OK   " "M1-SRV1.P1" "Postup instalace role AD DS pripraven" "Green"

$p2Text = "Typ nasazeni: novy les, korenova domena: $studentDomain, NetBIOS: $netbiosCandidate, funkcni urovne: Server 2025, volby: DNS a GC zaskrtnuty, DSRM heslo: Pa55w.rd."
Report-Step "  OK   " "M1-SRV1.P2" "Postup povyseni na radic domeny pripraven" "Green"

$p3Text = "Ctrl+Alt+Del, uzivatel $netbiosCandidate\Administrator, heslo Pa55w.rd."
Report-Step "  OK   " "M1-SRV1.P3" "Postup prihlaseni po restartu pripraven" "Green"

# ------------------------------------------------------------
# 5. Odeslani na Discord Webhook
# ------------------------------------------------------------
Write-Section "5. Odeslani dat na Discord"

$srv1Payload = [PSCustomObject]@{
    module = "01"
    part = "SRV1"
    totalParts = 1
    requiredParts = @("SRV1")
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
        V4_d1 = $v4D1Output
        V4_d2 = $v4D2Output
        V6_d1 = $v6D1Output
    }
    srv1_postup = [PSCustomObject]@{
        P1 = $p1Text
        P2 = $p2Text
        P3 = $p3Text
    }
}

$tempJsonPath = Join-Path -Path $env:TEMP -ChildPath "well_ops_doc_srv1_01.json"
$srv1Payload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $tempJsonPath -Encoding UTF8

Write-Host "Odesilam data serveru pres Discord Webhook..." -ForegroundColor Cyan
$curlArgs = @(
    "-s", "-S",
    "-w", "`n%{http_code}",
    "-X", "POST",
    "-F", "content=[WELL_OPS_DOC_PART1] Modul 01 | SRV1-DC | $targetDiscord | $studentName",
    "-F", "file1=@$tempJsonPath;filename=srv1_data.json",
    $WebhookUrl
)

$curlRaw = & curl.exe @curlArgs 2>&1
$curlExitCode = $LASTEXITCODE
Remove-Item -LiteralPath $tempJsonPath -Force -ErrorAction SilentlyContinue

# Rozparsovani vystupu curl
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
        Write-Host "Zkontrolujte pripojeni k internetu a DNS forwardery na SRV1-DC." -ForegroundColor White
    }

    Write-Host ""
    Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOTOVO! Dokumentace pro Modul 01 byla uspesne odeslana!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Data pro studenta: $studentName ($studentClass)" -ForegroundColor Cyan
Write-Host "Pripraveno pro Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host ""
Write-Host "CO BUDE NASLEDOVAT:" -ForegroundColor Yellow
Write-Host "  1. Jelikoz Modul 01 probiha pouze na SRV1-DC, vsechny casti jsou kompletni." -ForegroundColor White
Write-Host "  2. Discord bot nyni automaticky vytvori ZIP archiv s overeni.md a postup.md." -ForegroundColor White
Write-Host "  3. Archiv vam bude dorucen do kanalu #dokumentace i do vasi soukrome zpravy (DM)." -ForegroundColor Green
Write-Host "  4. Po stazeni ZIPu nezapomente rucne doplnit screenshoty (Dashboard, Local Server, ADUC)!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
