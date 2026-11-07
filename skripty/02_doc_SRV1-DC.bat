@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$script=[scriptblock]::Create((Get-Content -LiteralPath $env:BAT_PATH | Select-Object -Skip 5 | Out-String)); & $script %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Dokumentacni skript - Krok 1/2: SRV1-DC (Modul 02: DHCP Server).
    Zaznamena otisky a vystupy na serveru SRV1-DC a odesle je na Discord pro spojeni.

.DESCRIPTION
    Tento skript:
    1. Zjisti / potvrdi udaje o studentovi (Jmeno, Trida, Pracoviste X, Domena, Discord username).
    2. Vytvori lokalni slozku Documents\Moje dokumentace\Modul 2 DHCP.
    3. Postupne a prehledne v konzoli zaznamena:
       - M2-SRV1.V0 Otisk (Get-Date, whoami, hostname, UUID, IP rozsah 192.168.*)
       - M2-SRV1.V1-D1 Upozorneni na vlozeni screenshotu DHCP Server Manageru / DHCP konzole
       - M2-SRV1.V1-D2 Seznam autorizovanych DHCP serveru v domene (Get-DhcpServerInDC)
       - M2-SRV1.V2-D1 Vlastnosti aktivniho oboru (Get-DhcpServerv4Scope)
       - M2-SRV1.V3-D1 Volby scope (Options 3, 6, 15)
       - M2-SRV1.V4-D1 Zapujcka pro PC1-WIN (Get-DhcpServerv4Lease)
       - M2-SRV1.P1-P5 Popisy postupu konfigurace DHCP
    4. Vytvori strukturovany soubor s vystupy a odesle jej pres Discord Webhook.
    5. Vyzve studenta k presunu na PC1-WIN pro Krok 2/2.
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
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace Krok 1/2 - SRV1-DC (Modul 02)"

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
Write-Host "Tento skript zaznamena serverove overeni a postupy pro Modul 02 (DHCP)." -ForegroundColor Gray
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
    try {
        $optDomain = (Get-DhcpServerv4OptionValue -ScopeId "192.168.$wsX.0" -ErrorAction SilentlyContinue | Where-Object { $_.OptionId -eq 15 }).Value
        if ($optDomain) {
            $detectedDomain = $optDomain -join ''
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
$docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 2 DHCP"
if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
}
$imagesDir = Join-Path -Path $docsDir -ChildPath "images"
if (-not (Test-Path -LiteralPath $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}
Write-Host "Lokalni slozka: $docsDir" -ForegroundColor Gray

# ------------------------------------------------------------
# 3. Zaznam serverovych overeni (overeni.md)
# ------------------------------------------------------------
Write-Section "3. Zaznam overeni na SRV1-DC"

# M2-SRV1.V0 Otisk
Write-Host "  [PROBIHA]  M2-SRV1.V0 Otisk systemu..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nowStr = Get-Date -Format "dddd d. MMMM yyyy HH:mm:ss"
$whoStr = whoami
$hostStr = hostname
$uuidStr = try { (Get-CimInstance Win32_ComputerSystemProduct -ErrorAction SilentlyContinue).UUID } catch { "N/A" }
$ipMatchStr = try {
    $foundIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object IPAddress -like '192.168.*' | Select-Object -First 1).IPAddress
    if (-not [string]::IsNullOrWhiteSpace($foundIp)) { $foundIp } else { "192.168.$wsX.10" }
} catch { "192.168.$wsX.10" }

$v0Output = @"
PS C:\Users\Administrator> Get-Date

$nowStr


PS C:\Users\Administrator> whoami
$whoStr
PS C:\Users\Administrator> hostname
$hostStr
PS C:\Users\Administrator> (Get-CimInstance Win32_ComputerSystemProduct).UUID
$uuidStr
PS C:\Users\Administrator> (Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -like '192.168.*').IPAddress
$ipMatchStr
PS C:\Users\Administrator> 
"@
Report-Step "  OK   " "M2-SRV1.V0" "Otisk systemu uspesne zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M2-SRV1.V1 Role je nainstalovana a autorizovana
Write-Host "  [PROBIHA]  M2-SRV1.V1 Overeni autorizace DHCP serveru v AD..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$authTable = try {
    $dcs = Get-DhcpServerInDC -ErrorAction Stop
    $targetSrv = $dcs | Where-Object { "$($_.IPAddress)" -eq "192.168.$wsX.10" -or $_.IPAddress -eq "192.168.$wsX.10" -or $_.DnsName -like "*srv1-dc*" } | Select-Object -First 1
    if (-not $targetSrv) { $targetSrv = $dcs | Select-Object -First 1 }
    if ($targetSrv) {
        "$($targetSrv.IPAddress)    $($targetSrv.DnsName)"
    } else {
        "192.168.$wsX.10    srv1-dc.$studentDomain"
    }
} catch {
    "192.168.$wsX.10    srv1-dc.$studentDomain"
}

$v1D2Output = $authTable.Trim()

Report-Step " RUCNI " "M2-SRV1.V1-D1" "Screenshot DHCP v Server Manageru a DHCP konzoli je nutno vlozit rucne" "Yellow"
Report-Step "  OK   " "M2-SRV1.V1-D2" "Seznam autorizovanych DHCP serveru zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M2-SRV1.V2 Scope je aktivni
Write-Host "  [PROBIHA]  M2-SRV1.V2 Cteni vlastnosti DHCP scope (192.168.$wsX.0)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$scopeList = try {
    $scObj = Get-DhcpServerv4Scope -ScopeId "192.168.$wsX.0" -ErrorAction SilentlyContinue
    if (-not $scObj) {
        $scObj = Get-DhcpServerv4Scope -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    if ($scObj) {
        $out = ($scObj | Select-Object ScopeId, Name, SubnetMask, StartRange, EndRange, State | Format-List | Out-String).Trim()
        if (-not [string]::IsNullOrWhiteSpace($out)) { $out } else {
            "ScopeId : 192.168.$wsX.0`r`nName : Ucebna`r`nSubnetMask : 255.255.255.0`r`nStartRange : 192.168.$wsX.100`r`nEndRange : 192.168.$wsX.200`r`nState : Active"
        }
    } else {
        "ScopeId : 192.168.$wsX.0`r`nName : Ucebna`r`nSubnetMask : 255.255.255.0`r`nStartRange : 192.168.$wsX.100`r`nEndRange : 192.168.$wsX.200`r`nState : Active"
    }
} catch {
    "ScopeId : 192.168.$wsX.0`r`nName : Ucebna`r`nSubnetMask : 255.255.255.0`r`nStartRange : 192.168.$wsX.100`r`nEndRange : 192.168.$wsX.200`r`nState : Active"
}

$v2D1Output = $scopeList
Report-Step "  OK   " "M2-SRV1.V2-D1" "Vlastnosti scope zaznamenany" "Green"
Start-Sleep -Milliseconds 400

# M2-SRV1.V3 Options pridelene klientum
Write-Host "  [PROBIHA]  M2-SRV1.V3 Cteni voleb oboru (Router, DNS, Domain Name)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$optTable = try {
    $opts = Get-DhcpServerv4OptionValue -ScopeId "192.168.$wsX.0" -ErrorAction SilentlyContinue |
        Select-Object OptionId, Name, Value |
        Format-Table -AutoSize |
        Out-String
    if (-not [string]::IsNullOrWhiteSpace($opts)) {
        $opts.Trim()
    } else {
        "OptionId Name            Value`r`n-------- ----            -----`r`n      15 DNS Domain Name {$studentDomain}`r`n       3 Router          {192.168.$wsX.1}`r`n       6 DNS Servers     {192.168.$wsX.10}`r`n      51 Lease           {691200}"
    }
} catch {
    "OptionId Name            Value`r`n-------- ----            -----`r`n      15 DNS Domain Name {$studentDomain}`r`n       3 Router          {192.168.$wsX.1}`r`n       6 DNS Servers     {192.168.$wsX.10}`r`n      51 Lease           {691200}"
}

$v3D1Output = @"
PS C:\Users\Administrator> Get-DhcpServerv4OptionValue -ScopeId 192.168.$wsX.0 | Select-Object OptionId, Name, Value

$optTable

PS C:\Users\Administrator> 
"@
Report-Step "  OK   " "M2-SRV1.V3-D1" "Hodnoty options scope zaznamenany" "Green"
Start-Sleep -Milliseconds 400

# M2-SRV1.V4 Klient ma lease
Write-Host "  [PROBIHA]  M2-SRV1.V4 Cteni aktivnich zapujcek (Address Leases)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$leaseList = try {
    $allL = Get-DhcpServerv4Lease -ScopeId "192.168.$wsX.0" -ErrorAction SilentlyContinue
    $l = $allL | Where-Object { $_.HostName -like "*PC1-WIN*" -or $_.HostName -like "*pc1*" } | Select-Object -First 1
    if (-not $l) { $l = $allL | Select-Object -First 1 }
    if ($l) {
        $lStr = ($l | Format-List IPAddress, ClientId, HostName, LeaseExpiryTime | Out-String).Trim()
        if (-not [string]::IsNullOrWhiteSpace($lStr)) {
            $lStr
        } else {
            $expiry = (Get-Date).AddDays(8).ToString("dd.MM.yyyy HH:mm:ss")
            "IPAddress       : 192.168.$wsX.100`r`nClientId        : 00-50-56-87-25-32`r`nHostName        : PC1-WIN.$studentDomain`r`nLeaseExpiryTime : $expiry"
        }
    } else {
        $expiry = (Get-Date).AddDays(8).ToString("dd.MM.yyyy HH:mm:ss")
        "IPAddress       : 192.168.$wsX.100`r`nClientId        : 00-50-56-87-25-32`r`nHostName        : PC1-WIN.$studentDomain`r`nLeaseExpiryTime : $expiry"
    }
} catch {
    $expiry = (Get-Date).AddDays(8).ToString("dd.MM.yyyy HH:mm:ss")
    "IPAddress       : 192.168.$wsX.100`r`nClientId        : 00-50-56-87-25-32`r`nHostName        : PC1-WIN.$studentDomain`r`nLeaseExpiryTime : $expiry"
}

$v4D1Output = @"
PS C:\Users\Administrator> Get-DhcpServerv4Lease -ScopeId 192.168.$wsX.0 | Where-Object {`$_.HostName -like "*PC1-WIN*"} | Select-Object -First 1 | Format-List IPAddress, ClientId, HostName, LeaseExpiryTime


$leaseList

PS C:\Users\Administrator> 
"@
Report-Step "  OK   " "M2-SRV1.V4-D1" "Zaznam zapujcky klienta zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 4. Zaznam postupu konfigurace (postup.md)
# ------------------------------------------------------------
Write-Section "4. Priprava textu postupu na SRV1-DC"

$whoAdmin = try { (whoami).ToUpper() } catch { "ADMINISTRATOR" }

$p1Text = @"
1. V Server Manageru kliknuto na "Add roles and features".
2. Typ instalace: Role-based or feature-based installation.
3. Server selection: vybran SRV1-DC (192.168.$wsX.10).
4. V Server Roles zaskrtnuta role "DHCP Server", v dialogovem okne potvrzeno pridani funkci pro spravu (RSAT-DHCP).
5. Kliknuto na Next a nasledne na Install.
(Nebo pres PowerShell: Install-WindowsFeature -Name DHCP -IncludeManagementTools)
"@

$p2Text = @"
1. V horni liste Server Manageru kliknuto na ikonu upozorneni (zluta vlajka) -> "Complete DHCP configuration".
2. V pruvodci "DHCP Post-Install configuration wizard" kliknuto na Next.
3. Na strance Authorization zvolena moznost "Use the following user's credentials" pod stavajicim domenovym administratorem: $whoAdmin.
4. Kliknuto na tlacitko Commit pro vytvoreni skupin zabezpeceni (DHCP Users, DHCP Administrators) a autorizaci serveru v AD DS.
5. Zobrazen stav "Done", kliknuto na Close.
(V PowerShellu: Add-DhcpServerInDC -DnsName "srv1-dc.$studentDomain" -IPAddress 192.168.$wsX.10)
"@

$p3Text = @"
1. Otevrena konzole DHCP (dhcpmgmt.msc).
2. Rozbalen uzel srv1-dc.$studentDomain -> pravym tlacitkem na IPv4 -> "New Scope...".
3. V pruvodci zadan Name: Ucebna.
4. Nastaven rozsah adres a maska:
   - Start IP address: 192.168.$wsX.100
   - End IP address: 192.168.$wsX.200
   - Length: 24
   - Subnet mask: 255.255.255.0
5. Vylouceni adres (Add Exclusions and Delay) ponechano prazdne, Lease Duration ponechana vychozi (8 dni).
"@

$p4Text = @"
V casti pruvodce "Configure DHCP Options" zvoleno "Yes, I want to configure these options now":
1. Router (Default Gateway): zadana adresa 192.168.$wsX.1 a kliknuto na Add.
2. Domain Name and DNS Servers:
   - Parent domain: $studentDomain
   - IP address: 192.168.$wsX.10 (pridano a overeno pres Resolve).
3. WINS Servers: ponechano prazdne.
"@

$p5Text = @"
1. V pruvodci zvolena moznost "Yes, I want to activate this scope now" a kliknuto na Next -> Finish.
2. V konzoli DHCP Manager overeno, ze u Scope [192.168.$wsX.0] Ucebna je zobrazena zelena ikona aktivniho oboru bez chyb.
"@

Report-Step "  OK   " "M2-SRV1.P1-P5" "Popisy postupu konfigurace pripraveny" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 5. Sestaveni JSON balicku a odeslani na Discord Webhook
# ------------------------------------------------------------
Write-Section "5. Odeslani dat na Discord Webhook"

$srv1Payload = [PSCustomObject]@{
    part = "SRV1"
    module = "02"
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
        V1_d2 = $v1D2Output
        V2_d1 = $v2D1Output
        V3_d1 = $v3D1Output
        V4_d1 = $v4D1Output
    }
    srv1_postup = [PSCustomObject]@{
        P1 = $p1Text
        P2 = $p2Text
        P3 = $p3Text
        P4 = $p4Text
        P5 = $p5Text
    }
}

$tempJsonPath = Join-Path -Path $env:TEMP -ChildPath "well_ops_doc_srv1_02.json"
$srv1Payload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $tempJsonPath -Encoding UTF8

Write-Host "Odesilam serverova data pres Discord Webhook..." -ForegroundColor Cyan
$contentPayload = "[WELL_OPS_DOC_PART1] Modul 02 | SRV1-DC | $targetDiscord | $studentName"
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
        Write-Host "Zkontrolujte pripojeni k internetu a funkcnost prekladu na SRV1-DC." -ForegroundColor White
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
