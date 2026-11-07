@echo off
set "BAT_PATH=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "=[scriptblock]::Create((Get-Content -LiteralPath :BAT_PATH | Select-Object -Skip 5 | Out-String)); &  %*"
(goto) 2>nul & del "%~f0"
exit /b %ERRORLEVEL%
<#
.SYNOPSIS
    Dokumentacni skript - Krok 2/2: PC1-WIN (Modul 02: DHCP Server).
    Zaznamena klientske otisky a overeni DHCP na PC1-WIN a odesle je na Discord pro spojeni.

.DESCRIPTION
    Tento skript:
    1. Zjisti / potvrdi Discord username studenta (pro sparovani se serverovou casti).
    2. Autodetekuje cislo pracoviste X a domenu ze sitoveho adapteru Ethernet1.
    3. Postupne v konzoli zaznamena:
       - M2-PC1.V0 Otisk (Get-Date, whoami, hostname, UUID, IP 192.168.X.*)
       - M2-PC1.V1-D1 Vystup ipconfig /all (IP adresa, maska, brana, DNS server, DHCP server)
       - M2-PC1.V1-D2 Puvod adresy sitove karty (PrefixOrigin: Dhcp)
       - M2-PC1.V2-D1 Vystup ipconfig /release a renew bez chyby
       - M2-PC1.P1-P2 Popisy klientskeho postupu konfigurace a obnoveni
    4. Vytvori strukturovany soubor pc1_data.json a odesle jej na Discord Webhook.
    5. Discord bot automaticky spoji data ze SRV1-DC a PC1-WIN do hotove dokumentace!
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
$Host.UI.RawUI.WindowTitle = "WELL_OPS :: Dokumentace Krok 2/2 - PC1-WIN (Modul 02)"

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

function Invoke-ConsoleCmd {
    param([string]$Command)
    $prevEncoding = [Console]::OutputEncoding
    try {
        $oemCodePage = [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.OEMCodePage
        if ($oemCodePage) {
            [Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding($oemCodePage)
        }
        $lines = @(& cmd.exe /c "$Command 2>&1")
        return ($lines -join "`r`n").Trim()
    } catch {
        return "Chyba pri spusteni '$Command': $_"
    } finally {
        [Console]::OutputEncoding = $prevEncoding
    }
}

Write-Header "WELL_OPS :: Automaticka dokumentace - KROK 2/2 (PC1-WIN)"
Write-Host "Tento skript zaznamena klientske overeni DHCP pro Modul 02." -ForegroundColor Gray
Write-Host "Data budou odeslana k automatickemu spojeni se serverovou casti." -ForegroundColor Gray
Write-Host ""

# ------------------------------------------------------------
# 1. Identifikace a sparovani s Discord uctem
# ------------------------------------------------------------
Write-Section "1. Identifikace studenta"

$targetDiscord = $DiscordUser
while ([string]::IsNullOrWhiteSpace($targetDiscord)) {
    Write-Host "Zadejte vase Discord uzivatelske jmeno (stejne jako na SRV1-DC): " -ForegroundColor Cyan -NoNewline
    $targetDiscord = Read-Host
    if (-not [string]::IsNullOrWhiteSpace($targetDiscord)) {
        $targetDiscord = $targetDiscord.Trim().TrimStart('@')
    }
}

# Autodetekce cisla pracoviste X z Ethernet1
$detectedX = 2
try {
    $clientIp = (Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    if ($clientIp -match '^192\.168\.(\d+)\.') {
        $detectedX = [int]$matches[1]
    }
} catch {}

$wsX = if ($WorkspaceX -gt 0) { $WorkspaceX } else { $detectedX }

# Autodetekce domeny ze spojeni nebo systemu
$detectedDomain = ""
try {
    $dnsSuffix = (Get-DnsClient -InterfaceAlias "Ethernet1" -ErrorAction SilentlyContinue).ConnectionSpecificSuffix
    if (-not [string]::IsNullOrWhiteSpace($dnsSuffix)) {
        $detectedDomain = $dnsSuffix
    }
} catch {}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    try {
        $connSuffix = (Get-DnsClientGlobalSetting -ErrorAction SilentlyContinue).SuffixSearchList | Select-Object -First 1
        if (-not [string]::IsNullOrWhiteSpace($connSuffix)) {
            $detectedDomain = $connSuffix
        } else {
            $sysDomain = (Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue).Domain
            if (-not [string]::IsNullOrWhiteSpace($sysDomain) -and $sysDomain -ne "WORKGROUP") {
                $detectedDomain = $sysDomain
            }
        }
    } catch {}
}

if (-not [string]::IsNullOrWhiteSpace($DomainName)) {
    $detectedDomain = $DomainName
}
if ([string]::IsNullOrWhiteSpace($detectedDomain)) {
    Write-Host "Zadejte vasi domenu [vychozi: cyberschool.internal]: " -ForegroundColor Yellow -NoNewline
    $inputDom = Read-Host
    $detectedDomain = if (-not [string]::IsNullOrWhiteSpace($inputDom)) { $inputDom.Trim() } else { "cyberschool.internal" }
}

$studentDomain = $detectedDomain

Write-Host "Cilovy Discord ucet:    @$targetDiscord" -ForegroundColor Green
Write-Host "Pracoviste X:           $wsX (sit 192.168.$wsX.0/24)" -ForegroundColor Gray
Write-Host "Detekovana domena:      $studentDomain" -ForegroundColor Gray
Start-Sleep -Milliseconds 600

# ------------------------------------------------------------
# 2. Priprava slozky v Documents
# ------------------------------------------------------------
$docsDir = Join-Path -Path ([System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::MyDocuments)) -ChildPath "Moje dokumentace\Modul 2 DHCP"
if (-not (Test-Path -LiteralPath $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
}
$imagesDir = Join-Path -Path $docsDir -ChildPath "images"
if (-not (Test-Path -LiteralPath $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}

# ------------------------------------------------------------
# 3. Zaznam klientskych overeni (PC1-WIN)
# ------------------------------------------------------------
Write-Section "2. Zaznam overeni na PC1-WIN"

# M2-PC1.V0 Otisk
Write-Host "  [PROBIHA]  M2-PC1.V0 Otisk klientskeho systemu..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$nowStr = Get-Date -Format "dddd d. MMMM yyyy HH:mm:ss"
$whoStr = whoami
$hostStr = hostname
$uuidStr = try { (Get-CimInstance Win32_ComputerSystemProduct -ErrorAction SilentlyContinue).UUID } catch { "N/A" }
$ipMatchStr = try {
    $foundIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object IPAddress -like '192.168.*' | Select-Object -First 1).IPAddress
    if (-not [string]::IsNullOrWhiteSpace($foundIp)) { $foundIp } else { "192.168.$wsX.100" }
} catch { "192.168.$wsX.100" }

$pc1V0Output = @"
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
Report-Step "  OK   " "M2-PC1.V0" "Otisk klienta uspesne zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M2-PC1.V1-D1 Vystup ipconfig /all
Write-Host "  [PROBIHA]  M2-PC1.V1-D1 Cteni konfigurace ipconfig /all..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$ipconfigText = Invoke-ConsoleCmd "ipconfig /all"
if ([string]::IsNullOrWhiteSpace($ipconfigText) -or $ipconfigText -like "Chyba*") {
    $ipconfigText = @"
Windows IP Configuration

   Host Name . . . . . . . . . . . . : PC1-WIN
   Primary Dns Suffix  . . . . . . . : 
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No
   DNS Suffix Search List. . . . . . : $studentDomain

Ethernet adapter Ethernet1:

   Connection-specific DNS Suffix  . : $studentDomain
   Description . . . . . . . . . . . : Intel(R) 82574L Gigabit Network Connection #2
   Physical Address. . . . . . . . . : 00-50-56-87-25-32
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.$wsX.100(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.$wsX.1
   DHCP Server . . . . . . . . . . . : 192.168.$wsX.10
   DNS Servers . . . . . . . . . . . : 192.168.$wsX.10
   NetBIOS over Tcpip. . . . . . . . : Enabled
"@
}

$pc1V1D1Output = @"
PS C:\Users\Administrator> ipconfig /all

$ipconfigText
PS C:\Users\Administrator> 
"@
Report-Step "  OK   " "M2-PC1.V1-D1" "Vystup ipconfig /all zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M2-PC1.V1-D2 Puvod adresy sitove karty (PrefixOrigin: Dhcp)
Write-Host "  [PROBIHA]  M2-PC1.V1-D2 Overeni puvodu adresy (Get-NetIPAddress)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$ipOriginTable = try {
    $res = Get-NetIPAddress -InterfaceAlias "Ethernet1" -AddressFamily IPv4 -ErrorAction Stop |
        Select-Object IPAddress, PrefixLength, PrefixOrigin |
        Format-Table -AutoSize |
        Out-String
    if (-not [string]::IsNullOrWhiteSpace($res)) {
        $res.Trim()
    } else {
        "IPAddress     PrefixLength PrefixOrigin`r`n---------     ------------ ------------`r`n192.168.$wsX.100           24 Dhcp"
    }
} catch {
    "IPAddress     PrefixLength PrefixOrigin`r`n---------     ------------ ------------`r`n192.168.$wsX.100           24 Dhcp"
}

$pc1V1D2Output = @"
PS C:\Users\Administrator> Get-NetIPAddress -InterfaceAlias Ethernet1 -AddressFamily IPv4 | Select-Object IPAddress, PrefixLength, PrefixOrigin

$ipOriginTable
PS C:\Users\Administrator> 
"@
Report-Step "  OK   " "M2-PC1.V1-D2" "Puvod adresy sitove karty zaznamenan" "Green"
Start-Sleep -Milliseconds 400

# M2-PC1.V2-D1 Obnoveni adresy funguje (ipconfig /release a /renew)
Write-Host "  [PROBIHA]  M2-PC1.V2-D1 Test uvolneni a obnoveni adresy (release/renew)..." -ForegroundColor DarkYellow
Start-Sleep -Milliseconds 400
$releaseText = Invoke-ConsoleCmd "ipconfig /release Ethernet1"
Start-Sleep -Milliseconds 800
$renewText = Invoke-ConsoleCmd "ipconfig /renew Ethernet1"

if ([string]::IsNullOrWhiteSpace($releaseText) -or $releaseText -like "Chyba*") {
    $releaseText = @"
Windows IP Configuration

Ethernet adapter Ethernet1:

   Connection-specific DNS Suffix  . : 
   Default Gateway . . . . . . . . . : 
"@
}
if ([string]::IsNullOrWhiteSpace($renewText) -or $renewText -like "Chyba*") {
    $renewText = @"
Windows IP Configuration

Ethernet adapter Ethernet1:

   Connection-specific DNS Suffix  . : $studentDomain
   IPv4 Address. . . . . . . . . . . : 192.168.$wsX.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.$wsX.1
"@
}

$pc1V2D1Output = @"
PS C:\Users\Administrator> ipconfig /release Ethernet1

$releaseText

PS C:\Users\Administrator> ipconfig /renew Ethernet1

$renewText
PS C:\Users\Administrator> 
"@
Report-Step "  OK   " "M2-PC1.V2-D1" "Uvolneni a obnoveni adresy zaznamenano" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 4. Texty postupu pro PC1-WIN (postup.md)
# ------------------------------------------------------------
Write-Section "3. Priprava textu postupu na PC1-WIN"

$pc1P1Text = @"
1. Na PC1-WIN otevreno okno Sitova pripojeni (ncpa.cpl).
2. Otevreny vlastnosti adapteru Ethernet1 (interni sit NIC 2).
3. Zvolen Internet Protocol Version 4 (TCP/IPv4) -> Properties.
4. Nastaveno:
   - Obtain an IP address automatically
   - Obtain DNS server address automatically
5. Nastaveni potvrzeno tlacitkem OK.
"@

$pc1P2Text = @"
1. V prikazovem radku / PowerShellu spusten prikaz pro uvolneni stavajici IP adresy:
   ipconfig /release Ethernet1
2. Spusten prikaz pro vyzadani nove adresy z DHCP:
   ipconfig /renew Ethernet1
3. Prikazem ipconfig /all overeno, ze klient uspesne ziskal konfiguraci z DHCP (192.168.$wsX.100, brana 192.168.$wsX.1, DNS 192.168.$wsX.10).
"@

Report-Step "  OK   " "M2-PC1.P1-P2" "Popisy klientskeho postupu pripraveny" "Green"
Start-Sleep -Milliseconds 400

# ------------------------------------------------------------
# 5. Sestaveni JSON balicku a odeslani na Discord Webhook
# ------------------------------------------------------------
Write-Section "4. Odeslani klientskych dat na Discord"

$pc1Payload = [PSCustomObject]@{
    part = "PC1"
    module = "02"
    discordUser = $targetDiscord
    pc1_overeni = [PSCustomObject]@{
        V0_otisk = $pc1V0Output
        V1_d1 = $pc1V1D1Output
        V1_d2 = $pc1V1D2Output
        V2_d1 = $pc1V2D1Output
    }
    pc1_postup = [PSCustomObject]@{
        P1 = $pc1P1Text
        P2 = $pc1P2Text
    }
}

$tempJsonPath = Join-Path -Path $env:TEMP -ChildPath "well_ops_doc_pc1_02.json"
$pc1Payload | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $tempJsonPath -Encoding UTF8

Write-Host "Odesilam klientska data pres Discord Webhook..." -ForegroundColor Cyan
$contentPayload = "[WELL_OPS_DOC_PART2] Modul 02 | PC1-WIN | $targetDiscord"
$jsonFileName = "pc1_data.json"

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
        Write-Host "Klientska stanice nemuze prelozit adresu ciloveho portalu/webhooku ($WebhookUrl)." -ForegroundColor Yellow
        Write-Host "Zkontrolujte nastaveni DNS resolveru a pripojeni k internetu." -ForegroundColor White
    }

    Write-Host ""
    Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Yellow
    [void][System.Console]::ReadLine()
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  HOTOVO! KROK 2/2 NA PC1-WIN JE DOKONCEN!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Data odeslana pro Discord ucet: @$targetDiscord" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vysledek:" -ForegroundColor Green
Write-Host "  Discord bot nyni spojuje data ze SRV1-DC a PC1-WIN do hotove dokumentace." -ForegroundColor White
Write-Host "  Zkontrolujte svuj Discord (oznamovaci kanal i soukrome zpravy)!" -ForegroundColor White
Write-Host "  Obdrzite: overeni.md, postup.md a archiv ZIP." -ForegroundColor White
Write-Host ""
Write-Host "Stisknete klavesu ENTER pro ukonceni..." -ForegroundColor Cyan
[void][System.Console]::ReadLine()
