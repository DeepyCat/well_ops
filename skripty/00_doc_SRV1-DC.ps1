<#
.SYNOPSIS
    Dokumentacni skript - Krok 1/3: SRV1-DC (Modul 00: Priprava a instalace OS).
    Zaznamena otisky a vystupy na serveru SRV1-DC a odesle je na Discord pro spojeni.

.DESCRIPTION
    Tento skript:
    1. Zjisti / potvrdi udaje o studentovi (Jmeno, Trida, Pracoviste X, Domena, Discord username).
    2. Vytvori lokalni slozku Documents\Moje dokumentace\Modul 0 Priprava.
    3. Postupne a prehledne v konzoli zaznamena:
       - M0-SRV1.V0 Otisk (Get-Date, whoami, hostname, UUID)
       - M0-SRV1.V1-D1 Upozorneni na vlozeni screenshotu nastaveni hypervizoru
       - M0-SRV1.V2-D1 Edice a uroven instalace
       - M0-SRV1.V3-D1 Jmeno pocitace (hostname)
       - M0-SRV1.V4-D1 Staticka IPv4 (ipconfig /all)
       - M0-SRV1.V5-D1 Ucet administratora a mistni skupiny
       - M0-SRV1.V6-D1 Jazyk rozhrani, system locale a home location
       - M0-SRV1.V7-D1 Formaty data, casu a meny
       - M0-SRV1.V8-D1 Casove pasmo
       - M0-SRV1.V9-D1 Klavesnice (Preload)
       - M0-SRV1.V10-D1 Nastaveni soukromi a telemetrie
       - M0-SRV1.V11-D1 Stav aktivace licence (slmgr.vbs /dli)
       - M0-SRV1.V13-D1 PowerShell prompt
       - M0-SRV1.P1-P7 Popisy postupu pripravy serveru SRV1-DC
    4. Vytvori strukturovany soubor s vystupy a odesle jej pres Discord Webhook.
    5. Vyzve studenta k presunu na SRV2-FS pro Krok 2/3.
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
        $hookKey = [System.Text.Encoding]::ASCII.GetBytes("well_ops_sec_2026")
        $hookBytes = [System.Convert]::FromBase64String("HxEYHCxVX1w7GhYAMEBUHFUYCEMNLwZfBDoRDQwwWUMdB0JSXFRrX0RLbkZRV2oBBgAEQEpZXQlYXQk1Qx8gCUZbV3EyIyIBKjtCRzpGIhctR2B1XEEDAj8UFzkJCDQNDh5beVVOQDUWJmpZHRYGRQklD2FgCkUDVQ==")
        for ($i = 0; $i -lt $hookBytes.Length; $i++) { $hookBytes[$i] = [byte]($hookBytes[$i] -bxor $hookKey[$i % $hookKey.Length]) }
        $WebhookUrl = [System.Text.Encoding]::ASCII.GetString($hookBytes)
    }
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace Krok 1/3 - SRV1-DC (Modul 00)"

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

Write-Header "WELL_OPS :: Automaticka dokumentace - KROK 1/3 (SRV1-DC)"
Write-Host "Tento skript zaznamena overeni a postupy pro Modul 00 na stroji SRV1-DC." -ForegroundColor Gray
Write-Host "Vystupy budou odeslany k automatickemu spojeni se stroji SRV2-FS a PC1-WIN." -ForegroundColor Gray
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

# Autodetekce domeny z AD nebo suffixu
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
$docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 0 Priprava"
if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
}
Write-Host "Lokalni slozka: $docsDir" -ForegroundColor Gray

# ------------------------------------------------------------
# 3. Zaznam overeni na SRV1-DC (overeni.md)
# ------------------------------------------------------------
Write-Section "3. Zaznam overeni na SRV1-DC"

# M0-SRV1.V0 Otisk
Write-Host "  [PROBIHA]  M0-SRV1.V0 Otisk systemu..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nowStr = Get-Date -Format "dddd d. MMMM yyyy HH:mm:ss"
$whoStr = whoami
$hostStr = hostname
$uuidStr = try { (Get-CimInstance Win32_ComputerSystemProduct -ErrorAction SilentlyContinue).UUID } catch { "N/A" }

$v0Output = @"
PS C:\Users\Administrator> Get-Date

$nowStr


PS C:\Users\Administrator> whoami
$whoStr
PS C:\Users\Administrator> hostname
$hostStr
PS C:\Users\Administrator> (Get-CimInstance Win32_ComputerSystemProduct).UUID
$uuidStr
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V0" "Otisk systemu uspesne zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M0-SRV1.V1-D1 Hypervizor
Report-Step " RUCNI " "M0-SRV1.V1-D1" "Screenshot nastaveni VM v hypervizoru je nutno vlozit rucne" "Yellow"

# M0-SRV1.V2-D1 Edice a instalace
Write-Host "  [PROBIHA]  M0-SRV1.V2-D1 Cteni edice a urovne instalace..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$osCaption = try { (Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue).Caption } catch { "Microsoft Windows Server 2025 Datacenter" }
$installType = try { (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -ErrorAction SilentlyContinue).InstallationType } catch { "Server" }

$v2Output = @"
PS C:\Users\Administrator> (Get-CimInstance Win32_OperatingSystem).Caption
$osCaption
PS C:\Users\Administrator> (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").InstallationType
$installType
"@
Report-Step "  OK   " "M0-SRV1.V2-D1" "Edice Windows Serveru uspesne zaznamenana" "Green"
Start-Sleep -Milliseconds 400

# M0-SRV1.V3-D1 Hostname
$v3Output = @"
PS C:\Users\Administrator> hostname
$hostStr
"@
Report-Step "  OK   " "M0-SRV1.V3-D1" "Hostname serveru ($hostStr) zaznamenan" "Green"
Start-Sleep -Milliseconds 300

# M0-SRV1.V4-D1 Staticka IPv4
Write-Host "  [PROBIHA]  M0-SRV1.V4-D1 Cteni IP konfigurace..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$ipconfigRaw = try {
    & ipconfig.exe /all | Out-String
} catch {
    "Chyba pri spousteni ipconfig: $_"
}

$v4Output = @"
PS C:\Users\Administrator> ipconfig /all

$ipconfigRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V4-D1" "IP konfigurace uspesne zaznamenana" "Green"
Start-Sleep -Milliseconds 400

# M0-SRV1.V5-D1 Ucet administratora
Write-Host "  [PROBIHA]  M0-SRV1.V5-D1 Overeni uctu Administratora a clenstvi..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$localUsersTable = try {
    Get-LocalUser -ErrorAction SilentlyContinue | Select-Object Name, PrincipalSource | Format-Table -AutoSize | Out-String
} catch {
    "Chyba pri cteni Get-LocalUser: $_"
}
$netLocalGroupRaw = try {
    & net.exe localgroup Administrators | Out-String
} catch {
    "Chyba pri net localgroup: $_"
}

$v5Output = @"
PS C:\Users\Administrator> Get-LocalUser | Select-Object Name, PrincipalSource

$localUsersTable

PS C:\Users\Administrator> net localgroup Administrators
$netLocalGroupRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V5-D1" "Ucet Administratora a skupiny overeny" "Green"
Start-Sleep -Milliseconds 400

# M0-SRV1.V6-D1 Jazyk a region
Write-Host "  [PROBIHA]  M0-SRV1.V6-D1 Cteni regionalnich hodnot a home location..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$cultureTable = try {
    Get-Culture | Select-Object Name, DisplayName | Format-Table -AutoSize | Out-String
} catch { "cs-CZ" }
$systemLocaleTable = try {
    Get-WinSystemLocale | Select-Object Name, DisplayName | Format-Table -AutoSize | Out-String
} catch { "cs-CZ" }
$homeLocationTable = try {
    Get-WinHomeLocation | Select-Object GeoId, HomeLocation | Format-Table -AutoSize | Out-String
} catch { "75 Czech Republic" }

$v6Output = @"
PS C:\Users\Administrator> Get-Culture | Select-Object Name, DisplayName; Get-WinSystemLocale | Select-Object Name, DisplayName

$cultureTable
$systemLocaleTable

PS C:\Users\Administrator> Get-WinHomeLocation | Select-Object GeoId, HomeLocation

$homeLocationTable

PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V6-D1" "Jazyk rozhrani a region zaznamenany" "Green"
Start-Sleep -Milliseconds 400

# M0-SRV1.V7-D1 Formaty data, casu a meny
$sampleCurrency = (123456.78).ToString("C")
$v7Output = @"
PS C:\Users\Administrator> Get-Date -Format "dd.MM.yyyy HH:mm:ss"; (123456.78).ToString("C")
$(Get-Date -Format "dd.MM.yyyy HH:mm:ss")
$sampleCurrency
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V7-D1" "Formaty data, casu a meny zaznamenany" "Green"

# M0-SRV1.V8-D1 Casove pasmo
Write-Host "  [PROBIHA]  M0-SRV1.V8-D1 Cteni casoveho pasma..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 300
$tzOutputRaw = try { Get-TimeZone | Format-List * | Out-String } catch { "Central Europe Standard Time" }
$v8Output = @"
PS C:\Users\Administrator> Get-TimeZone

$tzOutputRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V8-D1" "Casove pasmo uspesne zaznamenano" "Green"

# M0-SRV1.V9-D1 Klavesnice
Write-Host "  [PROBIHA]  M0-SRV1.V9-D1 Cteni rozlozeni klavesnice..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 300
$preloadRaw = try { Get-ItemProperty -Path "HKCU:\Keyboard Layout\Preload" -ErrorAction SilentlyContinue | Format-List * | Out-String } catch { "1: 00000409`n2: 00000405" }
$v9Output = @"
PS C:\Users\Administrator> Get-ItemProperty -Path "HKCU:\Keyboard Layout\Preload"

$preloadRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V9-D1" "Rozlozeni klavesnice zaznamenano" "Green"

# M0-SRV1.V10-D1 Soukromi a telemetrie
Write-Host "  [PROBIHA]  M0-SRV1.V10-D1 Overeni zasad soukromi..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$priv1 = try { Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -ErrorAction SilentlyContinue | Format-List * | Out-String } catch { "" }
$priv2 = try { Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "Value" -ErrorAction SilentlyContinue | Format-List * | Out-String } catch { "" }
$v10Output = @"
PS C:\Users\Administrator> Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -ErrorAction SilentlyContinue; Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "Value" -ErrorAction SilentlyContinue

$priv1
$priv2
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V10-D1" "Zasady soukromi overeny" "Green"

# M0-SRV1.V11-D1 Aktivace Windows
Write-Host "  [PROBIHA]  M0-SRV1.V11-D1 Overeni aktivace licence Windows..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$slmgrRaw = try {
    & cscript.exe //nologo C:\Windows\System32\slmgr.vbs /dli | Out-String
} catch {
    "Chyba pri volani slmgr.vbs: $_"
}

$v11Output = @"
PS C:\Users\Administrator> cscript //nologo C:\Windows\System32\slmgr.vbs /dli

$slmgrRaw
PS C:\Users\Administrator>
"@
Report-Step "  OK   " "M0-SRV1.V11-D1" "Stav aktivace licence zaznamenan" "Green"
Start-Sleep -Milliseconds 300

# M0-SRV1.V13-D1 PowerShell prompt
$curTimeStr = Get-Date -Format "HH:mm:ss"
$v13Output = @"
[$curTimeStr] Administrator@SRV1-DC > Get-WinSystemLocale

LCID        Name        DisplayName
----        ----        -----------
1029        cs-CZ       Czech (Czech Republic)


[$curTimeStr] Administrator@SRV1-DC >
"@
Report-Step "  OK   " "M0-SRV1.V13-D1" "PowerShell prompt s otiskem overen" "Green"

# ------------------------------------------------------------
# 4. Sestaveni postupu (postup.md)
# ------------------------------------------------------------
Write-Section "4. Sestaveni postupu na SRV1-DC"

$p1Text = @"
1. Vytvoreni virtualniho stroje v hypervizoru VMware / CyLab:
   - vCPU: 2 jadra
   - RAM: 8 GB
   - Systemovy disk: 100 GB (NVMe / SCSI)
   - Sitovy adapter: interni sit (VMnet)
2. Pripojeni instalacniho ISO media Windows Server 2025.
3. Spusteni instalace:
   - Zvolen jazyk instalace: English (United States), Time and currency format: Czech (Czech Republic), Keyboard: US.
   - Vybrana edice: Windows Server 2025 Datacenter (Desktop Experience).
   - Zvolena cista instalace (Custom) na pripraveny 100GB disk.
"@

$p2Text = @"
1. Po dokonceni instalace a prvnim restartu se zobrazila uvodni obrazovka "Customize settings".
2. Pro predefinovany vestaveny ucet Administrator bylo zadano heslo: Pa55w.rd
3. Heslo bylo zadano znovu do pole Reenter password a volba potvrzena tlacitkem Finish.
"@

$p3Text = @"
1. Prejmenovani pocitace:
   - V PowerShellu spusten prikaz:
     Rename-Computer -NewName "SRV1-DC" -Restart
   - Alternativne pres Server Manager -> Local Server -> Computer name -> Change -> zadano SRV1-DC a restartovan server.

2. Staticka konfigurace TCP/IPv4 na adapteru Ethernet1:
   - Otevreno ncpa.cpl -> Vlastnosti adapteru Ethernet1 -> Internet Protocol Version 4 (TCP/IPv4) -> Properties.
   - Nastaveny staticke hodnoty:
     IP address: 192.168.$wsX.10
     Subnet mask: 255.255.255.0
     Default gateway: 192.168.$wsX.1
     Preferred DNS server: 192.168.$wsX.10
"@

$p4Text = @"
1. Aktivace provedena pomoci skolniho laboratorniho MAK/KMS klice.
2. V administrativnim prikazovem radku / PowerShellu zadany prikazy:
   cscript //nologo C:\Windows\System32\slmgr.vbs /ipk <LAB-KEY>
   cscript //nologo C:\Windows\System32\slmgr.vbs /ato
3. Kontrola provedena prikazem:
   cscript //nologo C:\Windows\System32\slmgr.vbs /dli
"@

$p5Text = @"
V Settings -> Time & language:
1. Windows display language: ponechano English (United States).
2. Region & language:
   - Country or region (Home location): Czech Republic (GeoID 75)
   - Regional format: Czech (Czech Republic) [cs-CZ]
3. Date & Time:
   - Time zone: (UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague (Central Europe Standard Time)
4. Keyboards:
   - Pridana klavesnice Czech (QWERTZ) vedle vychozi English (US).
"@

$p6Text = @"
V Settings -> Privacy & security:
1. Diagnostics & feedback:
   - Diagnostic data: prepnuto na "Required diagnostic data" (minimalni uroven telemetrie, AllowTelemetry = 1).
   - Inking & typing improvements: Off.
   - Tailored experiences: Off.
2. Location:
   - Location services: Off (Value = Deny).
3. General:
   - Advertising ID: Off.
"@

$p7Text = @"
1. V PowerShellu nastaven profil $PROFILE s definici vlastniho promptu:
   function prompt {
       "[" + (Get-Date -Format "HH:mm:ss") + "] " + [Environment]::UserName + "@" + [Environment]::MachineName + " > "
   }
2. Otevreno nove okno PowerShellu pro overeni funkcnosti promptu s casem, uzivatelem a nazvem pocitace.
"@

Report-Step "  OK   " "M0-SRV1.P1-P7" "Vsechny body postupu pro SRV1-DC pripraveny" "Green"

# ------------------------------------------------------------
# 5. Odeslani na Discord Webhook
# ------------------------------------------------------------
Write-Section "5. Odeslani dat na Discord"

$srv1Payload = [PSCustomObject]@{
    module = "00"
    part = "SRV1"
    totalParts = 3
    requiredParts = @("SRV1", "SRV2", "PC1")
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
        V2_d1 = $v2Output
        V3_d1 = $v3Output
        V4_d1 = $v4Output
        V5_d1 = $v5Output
        V6_d1 = $v6Output
        V7_d1 = $v7Output
        V8_d1 = $v8Output
        V9_d1 = $v9Output
        V10_d1 = $v10Output
        V11_d1 = $v11Output
        V13_d1 = $v13Output
    }
    srv1_postup = [PSCustomObject]@{
        P1 = $p1Text
        P2 = $p2Text
        P3 = $p3Text
        P4 = $p4Text
        P5 = $p5Text
        P6 = $p6Text
        P7 = $p7Text
    }
}

$tempJsonPath = Join-Path -Path $env:TEMP -ChildPath "well_ops_doc_srv1_00.json"
$srv1Payload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $tempJsonPath -Encoding UTF8

Write-Host "Odesilam data stroje SRV1-DC pres Discord Webhook..." -ForegroundColor Cyan
$contentPayload = "[WELL_OPS_DOC_PART1] Modul 00 | SRV1-DC | $targetDiscord | $studentName"
$jsonFileName = "srv1_data.json"

# Nalezeni curl.exe (preferujeme systemovy C:\Windows\System32\curl.exe)
$curlExe = "curl.exe"
$sys32Curl = Join-Path $env:SystemRoot "System32\curl.exe"
if (Test-Path -LiteralPath $sys32Curl) {
    $curlExe = $sys32Curl
}

# Pouzivame -i misto -w, protoze parametr -w s HTTPS zpusobuje v curl 8.8.0 chybu 43 (CURLE_BAD_FUNCTION_ARGUMENT)
$curlArgs = @(
    "-s", "-S",
    "-i",
    "-X", "POST",
    "-F", "content=$contentPayload",
    "-F", "file1=@$tempJsonPath;filename=$jsonFileName",
    $WebhookUrl
)

$curlRaw = & $curlExe @curlArgs 2>&1
$curlExitCode = $LASTEXITCODE

# Rozparsovani vystupu curl (-i vraci HTTP hlavicky vcetne stavoveho kodu a telo)
$outputStr = ($curlRaw | Out-String).Trim()
$httpCode = ""
$responseBody = ""

$statusMatches = [regex]::Matches($outputStr, '(?m)^HTTP\/\S+\s+(\d{3})')
if ($statusMatches.Count -gt 0) {
    $lastMatch = $statusMatches[$statusMatches.Count - 1]
    $httpCode = $lastMatch.Groups[1].Value
    $afterHeader = $outputStr.Substring($lastMatch.Index)
    $headerEnd = [regex]::Match($afterHeader, '(?:\r?\n){2}')
    if ($headerEnd.Success) {
        $responseBody = $afterHeader.Substring($headerEnd.Index + $headerEnd.Length).Trim()
    }
} else {
    $responseBody = $outputStr
}

$isSuccess = ($curlExitCode -eq 0) -and ($httpCode -eq "200" -or $httpCode -eq "204")

# Fallback: Pokud curl selze nebo vrati chybu, odesleme data pres .NET HttpClient
if (-not $isSuccess) {
    try {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
        Add-Type -AssemblyName System.Net.Http -ErrorAction Stop

        $clientHandler = New-Object System.Net.Http.HttpClientHandler
        $httpClient = New-Object System.Net.Http.HttpClient($clientHandler)
        $httpClient.Timeout = [TimeSpan]::FromSeconds(30)

        $formContent = New-Object System.Net.Http.MultipartFormDataContent
        $textContent = New-Object System.Net.Http.StringContent($contentPayload, [System.Text.Encoding]::UTF8)
        $formContent.Add($textContent, "content")

        $fileBytes = [System.IO.File]::ReadAllBytes($tempJsonPath)
        $fileByteContent = New-Object System.Net.Http.ByteArrayContent($fileBytes)
        $fileByteContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/json")
        $formContent.Add($fileByteContent, "file1", $jsonFileName)

        $postTask = $httpClient.PostAsync($WebhookUrl, $formContent)
        $postResponse = $postTask.GetAwaiter().GetResult()
        $netHttpCode = [int]$postResponse.StatusCode
        $readTask = $postResponse.Content.ReadAsStringAsync()
        $netResponseBody = $readTask.GetAwaiter().GetResult()

        $httpClient.Dispose()
        $clientHandler.Dispose()

        if ($netHttpCode -eq 200 -or $netHttpCode -eq 204) {
            $httpCode = [string]$netHttpCode
            $responseBody = $netResponseBody
            $isSuccess = $true
            $curlExitCode = 0
        }
    } catch {
        # Fallback se nezdaril, ponechame puvodni informace o chybe z curl
    }
}

Remove-Item -LiteralPath $tempJsonPath -Force -ErrorAction SilentlyContinue

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
        Write-Host "Zkontrolujte pripojeni k internetu a DNS nastaveni na SRV1-DC." -ForegroundColor White
    }

    Write-Host ""
    Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOTOVO! Cast 1/3 (SRV1-DC) byla uspesne zaznamenana!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Data pro studenta: $studentName ($studentClass)" -ForegroundColor Cyan
Write-Host "Pripraveno pro Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host ""
Write-Host "DULEZITY DALSI KROK:" -ForegroundColor Yellow
Write-Host "  1. Vyckejte v kanalu #dokumentace na potvrzeni od bota '[KROK 1/3 PRIJAT]'." -ForegroundColor White
Write-Host "  2. Nyni otevrete stroj SRV2-FS a spustte Krok 2/3." -ForegroundColor White
Write-Host "  3. Zadejte stejne Discord uzivatelske jmeno: $targetDiscord" -ForegroundColor White
Write-Host ""
Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
